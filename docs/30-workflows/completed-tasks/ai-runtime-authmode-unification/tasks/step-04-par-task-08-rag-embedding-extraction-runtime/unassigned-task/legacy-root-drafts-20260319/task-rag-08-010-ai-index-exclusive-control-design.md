# AI_INDEX 排他制御実装層の設計 - タスク指示書

## メタ情報

| 項目         | 内容                                            |
| ------------ | ----------------------------------------------- |
| タスクID     | UT-RAG-08-010                                   |
| タスク名     | AI_INDEX 排他制御実装層の設計                   |
| 分類         | 設計                                            |
| 対象機能     | rag-embedding-extraction-runtime / AI_INDEX IPC |
| 優先度       | 中                                              |
| 見積もり規模 | 小規模                                          |
| ステータス   | 未実施                                          |
| 発見元       | Phase 3 設計レビュー MINOR 指摘（M-02）         |
| 発見日       | 2026-03-19                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

task-08（RAG Embedding Extraction Runtime）の Phase 3（設計レビュー）において、
AI_INDEX IPC ハンドラの排他制御について実装層が未定義と指摘された（M-02）。

AI_INDEX はインデックス構築・更新を行うロングランニングジョブであり、
同時に複数の呼び出しが発生した場合の競合状態が未対処だった。

### 1.2 問題点・課題

**M-02: 排他制御の実装層が未定義**

現在の設計では AI_INDEX ハンドラが複数回呼ばれた場合の挙動が未定義であり、
以下の3つの実装層で排他制御が可能だが、どこで実装するかが決まっていない:

| 実装層     | メリット                         | デメリット                               |
| ---------- | -------------------------------- | ---------------------------------------- |
| IPC 層     | 早期拒否、シンプルな実装         | DB トランザクションとの整合が取れない    |
| Service 層 | ビジネスロジックと一体管理が可能 | IPC ハンドラが重複呼び出しを検知できない |
| DB 層      | 原子性保証、複数プロセス対応     | SQLite のロック機構への依存度が高い      |

**L-RAG-02 の制約**: AI_INDEX は not-in-scope（HybridRAGFactory 完成後に実配線予定）。
このため現フェーズでは「設計のみ」を先行して決定する。

### 1.3 放置した場合の影響

**短期的影響**:

- 実配線フェーズでアドホックな実装が入り、アーキテクチャが一貫しない
- テスト設計時に「どこをテストすべきか」が不明確になる

**中長期的影響**:

- 競合状態による DB 破損リスク（インデックス構築の中途半端な状態）
- リトライ機構との相互作用が設計されていないため、無限リトライが発生しうる

**影響度**: 中（設計決定の先送りがアーキテクチャ品質に影響）

---

## 2. 何を達成するか（What）

### 2.1 目的

AI_INDEX ハンドラの排他制御について、実装層の決定と設計ドキュメントを作成する。
実際の配線は HybridRAGFactory 完成後に行うため、このタスクは「設計と ADR」に限定する。

### 2.2 最終ゴール

- 排他制御の実装層（IPC / Service / DB のいずれか）が ADR として決定されている
- 決定根拠と却下理由が記録されている
- `aiHandlers.ts` のコメントに設計決定が反映されている

### 2.3 スコープ

#### 含むもの

- 排他制御の実装層選択に関する ADR（Architecture Decision Record）作成
- `aiHandlers.ts` に設計決定コメント（TODO: 排他制御実装待ち）を追加
- 関連仕様書への設計決定リンク追加

#### 含まないもの

- 実際の排他制御コードの実装（HybridRAGFactory 完成後のタスクに委ねる）
- DB スキーマの変更
- IPC チャンネル定義の変更

### 2.4 成果物

1. ADR ドキュメント: `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/outputs/exclusive-control-adr.md`
2. `aiHandlers.ts` への TODO コメント追加（設計決定を参照するコメント）
3. 関連仕様書更新（task-08 の design.md または outputs/phase-2/ 配下）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [ ] `aiHandlers.ts` の AI_INDEX ハンドラ部分を Read で確認済み
- [ ] SQLite のロック機構（WAL モード）についての基礎知識がある
- [ ] task-08 の設計書（phase-2-design.md）を確認済み

### 3.2 依存タスク

- HybridRAGFactory 実装タスク（実配線のトリガー）

### 3.3 必要な知識・スキル

- Electron Main Process の IPC ハンドラ設計
- SQLite の WAL モードとロック機構
- ADR（Architecture Decision Record）の記述形式
- P34（遅延初期化 DI パターン）の知識

### 3.4 推奨アプローチ

**推奨実装層: Service 層（推奨理由付き）**

以下の判断基準で Service 層を推奨する:

1. **IPC 層**: 排他制御は「ビジネスルール」（ジョブの同時実行不可）であり、IPC 層に配置するのは責務違反（DIP 原則）
2. **DB 層**: SQLite の exclusive lock は Electron のシングルプロセス前提では過剰な防御
3. **Service 層**: `isRunning: boolean` フラグ + Promise チェーンで実装可能。テスト容易性が高い

ただし、最終決定は設計者がトレードオフを評価してから行うこと。

### 3.5 苦戦ポイント

**L-RAG-02 + P34 の交差**:

AI_INDEX が not-in-scope の状態で設計だけ先行する場合、
「設計決定が HybridRAGFactory の実装制約に合致するか」を確認できない。

対応方針: ADR に「HybridRAGFactory 実装時の検証ポイント」を明記し、
実配線タスクに「ADR 再評価」を必須ステップとして含める。

**P34（Setter Injection パターン選択基準）との整合**:

排他制御の実装は DI コンテナの初期化タイミングにも影響する。
`aiHandlers.ts` に注入するサービスが `start` / `stop` ライフサイクルを持つ場合、
Setter Injection パターンが必要になる可能性がある（P34 参照）。

---

## 4. Phase 構成

```
Phase 1: 現状確認（aiHandlers.ts と設計書の調査）
Phase 2: 実装層トレードオフ分析
Phase 3: ADR 作成
Phase 4: aiHandlers.ts へのコメント追加
Phase 5: 設計書更新とリンク追加
```

### Phase 1: 現状確認

```bash
grep -n "AI_INDEX\|exclusive\|lock\|isRunning" \
  apps/desktop/src/main/handlers/aiHandlers.ts

grep -n "AI_INDEX" \
  apps/desktop/src/main/handlers/aiHandlers.ts
```

**完了条件**:

- [ ] AI_INDEX ハンドラの現在の実装状況を把握している

### Phase 2: トレードオフ分析

**分析観点**:

| 観点             | IPC 層 | Service 層 | DB 層 |
| ---------------- | ------ | ---------- | ----- |
| 責務の一致       | 低     | 高         | 中    |
| テスト容易性     | 中     | 高         | 低    |
| 原子性保証       | なし   | 中         | 高    |
| 実装複雑度       | 低     | 低         | 高    |
| HybridRAG 互換性 | 中     | 高         | 中    |

**完了条件**:

- [ ] 3層の比較が文書化されている

### Phase 3: ADR 作成

ADR テンプレート構造:

```markdown
# ADR-001: AI_INDEX 排他制御の実装層決定

## ステータス: 決定済み / 提案 / 廃止

## コンテキスト

[問題の背景]

## 決定

[選択した実装層と理由]

## 却下した選択肢

[他の選択肢と却下理由]

## 結果

[この決定がもたらす影響]

## HybridRAGFactory 実装時の検証ポイント

[再評価が必要な条件]
```

**完了条件**:

- [ ] ADR ファイルが作成されている
- [ ] 決定・却下理由・検証ポイントが記載されている

### Phase 4: aiHandlers.ts へのコメント追加

**追加するコメント例**:

```typescript
// TODO(UT-RAG-08-010): AI_INDEX 排他制御は Service 層で実装予定
// 設計決定: ADR-001 参照
// 実配線タイミング: HybridRAGFactory 完成後
// 競合発生時の動作: 409 Conflict レスポンスを返す
```

**完了条件**:

- [ ] AI_INDEX ハンドラ付近にコメントが追加されている

---

## 5. 完了条件チェックリスト

- [ ] ADR ファイルが作成されている
- [ ] 排他制御の実装層が決定・文書化されている
- [ ] 却下した実装層とその理由が記録されている
- [ ] HybridRAGFactory 実装時の再評価ポイントが明記されている
- [ ] aiHandlers.ts に TODO コメントが追加されている
- [ ] 関連仕様書に ADR へのリンクが追加されている

---

## 6. 検証方法

### 検証テーブル

| 確認項目                 | 期待結果                                  |
| ------------------------ | ----------------------------------------- |
| ADR ファイルの存在       | exclusive-control-adr.md が作成されている |
| aiHandlers.ts のコメント | UT-RAG-08-010 を参照する TODO が存在する  |
| 設計書のリンク           | ADR へのリンクが仕様書に追加されている    |

---

## 7. リスクと対策

| リスク                                   | 影響度 | 発生確率 | 対策                                         |
| ---------------------------------------- | ------ | -------- | -------------------------------------------- |
| Service 層実装で SQLite 整合性が取れない | 中     | 低       | HybridRAGFactory 実装時に ADR を再評価       |
| 実配線タスクが ADR を参照しない          | 中     | 中       | 実配線タスク指示書に「ADR-001 再評価」を必須 |
| Setter Injection との整合が取れない      | 低     | 低       | P34 パターンを ADR の補足に追記              |

---

## 8. 参照情報

- 発見元: Phase 3 設計レビューレポート（task-08）
- 対象ファイル: `apps/desktop/src/main/handlers/aiHandlers.ts`
- 関連パターン: P34（遅延初期化 DI）、P61（DIP 違反が Phase 10 まで検出されない）
- 関連制約: L-RAG-02（AI_INDEX は not-in-scope）

---

## 9. 備考

- このタスクは「設計と ADR」のみを扱う。実装は HybridRAGFactory 完成後の別タスクに委ねる
- ADR は将来的に `.claude/skills/aiworkflow-requirements/references/` に移動することを推奨
- 排他制御は将来的に複数ウィンドウ対応（P5 リスナー二重登録）とも関連する可能性がある
