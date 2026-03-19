# AI_INDEX guidance message template 設計 - タスク指示書

## メタ情報

| 項目         | 内容                                            |
| ------------ | ----------------------------------------------- |
| タスクID     | UT-RAG-08-011                                   |
| タスク名     | AI_INDEX guidance message template 設計         |
| 分類         | 設計                                            |
| 対象機能     | rag-embedding-extraction-runtime / AI_INDEX IPC |
| 優先度       | 低                                              |
| 見積もり規模 | 極小                                            |
| ステータス   | 未実施                                          |
| 発見元       | Phase 3 設計レビュー MINOR 指摘（M-03）         |
| 発見日       | 2026-03-19                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

task-08 Phase 3（設計レビュー）において、AI_INDEX ハンドラが返す guidance message が
汎用的なエラーメッセージのみで、ユーザーが次の行動を取れるような具体的な情報が
不足していると指摘された（M-03）。

現在の実装では `"インデックス構築が必要です"` のような汎用メッセージが返るが、
ユーザーに「現在の状態」「回避策」「追跡 URL（または画面遷移先）」を伝えていない。

### 1.2 問題点・課題

**M-03: guidance message に具体的な情報が不足**

L-RAG-02 が定義する guidance-only ターミナルサーフェスにおいて、
エラーメッセージの必須3要素が揃っていない:

| 要素              | 現状の実装 | 必要な内容                                |
| ----------------- | ---------- | ----------------------------------------- |
| 現在の状態        | 未記載     | インデックスが存在しない / 破損している   |
| 回避策            | 未記載     | 「設定 > RAG > インデックス再構築」ボタン |
| 追跡 URL / 遷移先 | 未記載     | 設定画面への遷移アクション                |

また、AI_INDEX が返す guidance は複数のシナリオ（未構築 / 構築中 / 破損 / 更新必要）
に対応する必要があるが、現状は1種類のメッセージしか定義されていない。

### 1.3 放置した場合の影響

**短期的影響**:

- ユーザーが AI_INDEX エラーに遭遇した際に、どうすれば解決できるかが不明
- サポートコストが増大する（「何をすればいいか分からない」問い合わせ）

**中長期的影響**:

- guidance-only ターミナルサーフェスの価値が損なわれる
- 後続の UI 実装（UT-RAG-08-010 配線後）でメッセージ定義が後付けになり、
  UI と guidance の設計が乖離する

**影響度**: 低（機能動作への直接影響なし、UX 品質のみ）

---

## 2. 何を達成するか（What）

### 2.1 目的

AI_INDEX の各シナリオに対応した guidance message template を設計し、
ユーザーが次の行動を取れる情報を含むメッセージ定義を作成する。

### 2.2 最終ゴール

- 4シナリオ（未構築 / 構築中 / 破損 / 更新必要）の guidance message template が定義されている
- 各テンプレートに「現在の状態」「回避策」「追跡先」の3要素が含まれている
- `aiHandlers.ts` の該当箇所にテンプレート参照コメントが追加されている
- `ui-ux-realization.md` にメッセージ設計が反映されている

### 2.3 スコープ

#### 含むもの

- guidance message template の設計ドキュメント作成
- `aiHandlers.ts` への TODO コメント追加
- `outputs/phase-2/ui-ux-realization.md` への guidance message セクション追加

#### 含まないもの

- 実際のメッセージ文字列のコード実装（設計のみ）
- i18n（国際化）対応（別タスク）
- エラーメッセージの UI コンポーネント実装

### 2.4 成果物

1. guidance message template 定義ドキュメント（outputs/phase-2/ 配下に追加）
2. `aiHandlers.ts` への TODO コメント
3. 更新済み `outputs/phase-2/ui-ux-realization.md`

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [ ] L-RAG-02 の guidance-only ターミナルサーフェスの仕様を確認済み
- [ ] AI_INDEX ハンドラのシナリオ（未構築 / 構築中 / 破損 / 更新必要）を確認済み
- [ ] `outputs/phase-2/ui-ux-realization.md` を Read で確認済み

### 3.2 依存タスク

- UT-RAG-08-010（AI_INDEX 排他制御設計）との並行設計が可能
- 実配線は HybridRAGFactory 完成後のタスクに委ねる

### 3.3 必要な知識・スキル

- UX ライティング（エラーメッセージの3要素）
- L-RAG-02 の guidance-only サーフェス仕様
- Electron のナビゲーション設計（設定画面遷移）

### 3.4 推奨アプローチ

**メッセージ設計の原則（L-RAG-02 準拠）**:

各 guidance message に以下の3要素を必ず含める:

1. **現在の状態**: システムが「なぜ」応答できないかを明示
2. **回避策**: ユーザーが「今すぐ」できることを具体的に示す
3. **追跡先**: 問題を解決するための画面 / アクションへの誘導

**4シナリオの設計**:

| シナリオ    | 状態               | 回避策                 | 追跡先                  |
| ----------- | ------------------ | ---------------------- | ----------------------- |
| NOT_BUILT   | インデックス未構築 | インデックス構築を実行 | 設定 > RAG > 構築ボタン |
| IN_PROGRESS | 構築中             | 完了まで待機           | 進捗バー表示            |
| CORRUPTED   | 破損               | 再構築を実行           | 設定 > RAG > 再構築     |
| STALE       | 更新必要           | 更新または無視して使用 | 設定 > RAG > 更新       |

### 3.5 苦戦ポイント

**L-RAG-02 の guidance-only サーフェスとナビゲーション設計の交差**:

guidance message に「設定画面へのリンク」を含める場合、
Electron の IPC 経由でナビゲーションをトリガーする必要があるが、
現在の設計では guidance は純粋なテキストメッセージを想定している可能性がある。

対応方針: メッセージ template は「テキスト + アクション識別子」の構造体として設計し、
UI 側でアクションを解釈してナビゲーションを実行する分離設計にする。

例:

```typescript
interface GuidanceMessage {
  state: string; // "現在の状態" テキスト
  workaround: string; // "回避策" テキスト
  action: {
    label: string; // ボタンテキスト
    target: string; // 画面識別子（例: "settings/rag/rebuild"）
  } | null;
}
```

---

## 4. Phase 構成

```
Phase 1: 現状確認（aiHandlers.ts と ui-ux-realization.md の調査）
Phase 2: GuidanceMessage 型定義設計
Phase 3: 4シナリオのメッセージ template 作成
Phase 4: 設計ドキュメント作成
Phase 5: aiHandlers.ts コメント追加 + ui-ux-realization.md 更新
```

### Phase 1: 現状確認

```bash
grep -n "guidance\|message\|AI_INDEX" \
  apps/desktop/src/main/handlers/aiHandlers.ts

grep -n "guidance\|AI_INDEX" \
  docs/30-workflows/ai-runtime-authmode-unification/tasks/\
step-04-par-task-08-rag-embedding-extraction-runtime/outputs/phase-2/ui-ux-realization.md
```

**完了条件**:

- [ ] 現在の guidance message の実装状況を把握している

### Phase 2: GuidanceMessage 型定義設計

型定義案（TypeScript 擬似コード）:

```typescript
type IndexState = "NOT_BUILT" | "IN_PROGRESS" | "CORRUPTED" | "STALE";

interface GuidanceAction {
  label: string;
  target: string; // "settings/rag/rebuild" 等の画面識別子
}

interface GuidanceMessage {
  state: IndexState;
  description: string; // 現在の状態
  workaround: string; // 回避策
  action: GuidanceAction | null;
}
```

**完了条件**:

- [ ] 型定義が設計ドキュメントに記載されている

### Phase 3: メッセージ template 作成

4シナリオの具体的なメッセージを日本語で設計する。

**完了条件**:

- [ ] 4シナリオ全てのメッセージが定義されている
- [ ] 各メッセージに3要素（状態 / 回避策 / 追跡先）が含まれている

### Phase 4: 設計ドキュメント作成

```
outputs/phase-2/guidance-message-template.md
```

**完了条件**:

- [ ] 設計ドキュメントが作成されている

### Phase 5: 既存ファイルへの反映

**完了条件**:

- [ ] aiHandlers.ts に TODO コメントが追加されている
- [ ] ui-ux-realization.md に guidance message セクションが追加されている

---

## 5. 完了条件チェックリスト

- [ ] GuidanceMessage 型定義が設計ドキュメントに記載されている
- [ ] 4シナリオ（NOT_BUILT / IN_PROGRESS / CORRUPTED / STALE）の template が定義されている
- [ ] 各 template に3要素（状態 / 回避策 / 追跡先）が含まれている
- [ ] aiHandlers.ts に TODO コメントが追加されている
- [ ] ui-ux-realization.md に guidance message セクションが追加されている

---

## 6. 検証方法

### 検証テーブル

| 確認項目                     | 期待結果                                         |
| ---------------------------- | ------------------------------------------------ |
| guidance-message-template.md | 4シナリオ全てが定義されている                    |
| 各メッセージの3要素          | description / workaround / action が全て存在する |
| aiHandlers.ts コメント       | UT-RAG-08-011 を参照する TODO が存在する         |
| ui-ux-realization.md 更新    | guidance message セクションが追加されている      |

---

## 7. リスクと対策

| リスク                                     | 影響度 | 発生確率 | 対策                                               |
| ------------------------------------------ | ------ | -------- | -------------------------------------------------- |
| ナビゲーション target 識別子が未定義       | 低     | 中       | placeholder として文字列を設定し、実装時に確定     |
| GuidanceMessage 型が IPC 契約と乖離        | 中     | 低       | P60 に従い Phase 2 設計で IPC レスポンス形式を確認 |
| メッセージ文言が i18n 対応不可な構造になる | 低     | 低       | キーベース設計（message key + params）を検討       |

---

## 8. 参照情報

- 発見元: Phase 3 設計レビューレポート（task-08）
- 対象ファイル:
  - `apps/desktop/src/main/handlers/aiHandlers.ts`
  - `docs/.../outputs/phase-2/ui-ux-realization.md`
- 関連制約: L-RAG-02（guidance-only ターミナルサーフェス）
- 関連パターン: P60（IPC テスト応答形式の不一致）

---

## 9. 備考

- このタスクは「設計のみ」。実際のメッセージ文字列のコード実装は配線タスクで行う
- GuidanceMessage 型は将来的に `packages/shared/src/types/` に配置することを推奨
- i18n 対応が必要な場合は、別途 i18n タスクを作成すること
- M-03 は機能影響なし（Pure UX 改善）のため優先度「低」
