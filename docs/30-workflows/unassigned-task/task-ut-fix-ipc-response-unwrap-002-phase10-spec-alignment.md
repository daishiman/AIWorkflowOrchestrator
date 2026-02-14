# UT-FIX-IPC-RESPONSE-UNWRAP-002 - Phase 10仕様書 `import()` 記載整合

## メタ情報

```yaml
issue_number: 823
```

## メタ情報

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| タスクID     | UT-FIX-IPC-RESPONSE-UNWRAP-002     |
| タスク名     | Phase 10仕様書 `import()` 記載整合 |
| 分類         | 改善                               |
| 対象機能     | ipc-response-unwrap                |
| 優先度       | 低                                 |
| 見積もり規模 | 小規模                             |
| ステータス   | 未実施                             |
| 発見元       | Phase 10（最終レビュー MINOR M-1） |
| 発見日       | 2026-02-14                         |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`UT-FIX-IPC-RESPONSE-UNWRAP-001` の最終レビューで、Phase 10仕様書の表記と実装コードの不一致が検出された。

### 1.2 問題点・課題

`phase-10-final-review.md` 上で `import()` が `safeInvokeUnwrap` を使うと読める記述が残ると、後続の修正時に誤って `import()` までラッパー展開対象にしてしまうリスクがある。

### 1.3 放置した場合の影響

仕様書ベースで作業する開発者/エージェントが誤実装する可能性が上がる。レビュー工数と手戻りが増える。

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 10仕様書と実装の記載を一致させ、`import()` は `safeInvoke` 維持であることを明確化する。

### 2.2 最終ゴール

- `phase-10-final-review.md` の該当表記が実装と一致
- 根拠として `skillHandlers.ts` の返却形式（ラッパーなし）を明記

### 2.3 スコープ

#### 含むもの

- `docs/30-workflows/completed-tasks/ipc-response-unwrap/phase-10-final-review.md` の記載修正
- 必要に応じた補足説明の追記

#### 含まないもの

- `apps/desktop/src/preload/skill-api.ts` の実装修正
- IPCハンドラの返却仕様変更

### 2.4 成果物

- 修正済み Phase 10仕様書

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `UT-FIX-IPC-RESPONSE-UNWRAP-001` のワークフロー成果物が存在すること

### 3.2 依存タスク

- なし（単独実施可能）

### 3.3 必要な知識

- Preload `safeInvoke` / `safeInvokeUnwrap` の使い分け
- `skillHandlers.ts` の `SKILL_IMPORT` 応答形式

### 3.4 推奨アプローチ

- コード正本（`skillHandlers.ts`）を基準に仕様書表現を修正
- 修正後に `rg "safeInvokeUnwrap|safeInvoke"` で記載を再確認

### 3.5 実装課題と解決策（親タスク UT-FIX-IPC-RESPONSE-UNWRAP-001 の教訓）

本タスクの親タスクで遭遇した苦戦箇所を記録する。同様の仕様書整合修正タスクで再発を防止するために活用すること。

| #   | 課題                           | 発見経緯                                                                                                                                                                           | 解決策                                                                                      | 教訓                                                                                                                                                                                       |
| --- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **ハンドラ応答形式の不統一**   | Phase 5 実装時に `skillHandlers.ts` を調査したところ、`SKILL_IMPORT` のみラッパー(`{ success, data }`)なしの直接返却だった。Phase 2 設計では全メソッドがラッパー使用と想定していた | 各ハンドラの `return` 文を個別に確認し、`import()` のみ `safeInvoke` を維持する判断を行った | IPC チャンネル修正時は必ず `skillHandlers.ts` の return 文を確認すること。仕様書のテーブルは Phase 5 実装結果で更新すべき                                                                  |
| 2   | **仕様書テーブルと実装の乖離** | Phase 10 レビューで M-1 として検出。Phase 2 設計時の想定がそのまま仕様書に残っていた                                                                                               | MINOR 判定として本未タスク（002）に分離                                                     | タスク仕様書のテーブル・チェックリストは Phase 2 設計時に作成されるため、Phase 5 で判明した特殊ケースが反映されていない可能性がある。Phase 10 レビュー時にテーブルの記載と実装を突合すべき |
| 3   | **非実在仕様書参照の残存**     | Phase 12 で `api-ipc-skill.md` への参照が残存していることを発見。ファイルは `interfaces-agent-sdk-skill.md` に統一済みだった                                                       | 参照先を正本ファイルに更新し、`test -f` による物理存在確認を運用化                          | 仕様書修正時は参照パスの物理存在確認（`test -f`）を必ず実施する                                                                                                                            |

#### 関連する既知の落とし穴（06-known-pitfalls.md）

- **P37**: ドキュメント数値の早期固定 — Phase 4 の想定値を Phase 5 実装で検証せずに仕様書に残した問題と同パターン
- **P4**: documentation-changelog への早期「完了」記載 — 仕様書更新前に完了とマークすると乖離が検出されない

---

## 4. 実行手順

### Phase構成

1 Phase（文書整合修正）で完了

### Phase 1: 仕様書整合修正

#### 目的

Phase 10仕様書の誤記を解消する。

#### 手順

1. `phase-10-final-review.md` の `import()` 記述を確認
2. `import()` は `safeInvoke` である旨に修正
3. `SKILL_IMPORT` がラッパーなし返却である根拠文を併記

#### 成果物

- 修正済み `phase-10-final-review.md`

#### 完了条件

- 仕様書記載と実装コードの不一致がない

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `import()` の使用関数記載が `safeInvoke` で統一されている

### 品質要件

- [ ] 実装根拠（`SKILL_IMPORT` 直接返却）が明記されている

### ドキュメント要件

- [ ] 変更箇所がレビュー可能な粒度で記録されている

---

## 6. 検証方法

### テストケース

- ドキュメント整合検証（コード実行なし）

### 検証手順

1. `rg -n "import\(\)|safeInvokeUnwrap|safeInvoke" docs/30-workflows/completed-tasks/ipc-response-unwrap/phase-10-final-review.md`
2. `apps/desktop/src/preload/skill-api.ts` の `import()` 実装と照合

---

## 7. リスクと対策

| リスク                                       | 影響度 | 発生確率 | 対策                                                           |
| -------------------------------------------- | ------ | -------- | -------------------------------------------------------------- |
| 別箇所の誤記を見落とす                       | 低     | 中       | `rg "safeInvokeUnwrap\|safeInvoke"` でキーワード横断検索を実施 |
| 非実在ファイルへの参照が残る（P37派生）      | 低     | 中       | 修正後に `test -f` で参照先パスの物理存在を確認                |
| 修正した仕様書が他タスクの参照元になっている | 低     | 低       | `rg "phase-10-final-review"` で逆参照を調査                    |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/ipc-response-unwrap/outputs/phase-10/final-review-result.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`
- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`（safeInvokeUnwrap パターンセクション）
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`（v1.12.0: 苦戦箇所 1,2,7）

### 参考資料

- `apps/desktop/src/preload/skill-api.ts`（実装正本）
- `apps/desktop/src/main/ipc/skillHandlers.ts`（ハンドラ応答形式の確認先）
- `.claude/rules/06-known-pitfalls.md`（P4, P37）

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
M-1: Phase 10 仕様書の Task 1-2 テーブルで import() が safeInvokeUnwrap 使用と記載されているが、実装は safeInvoke を使用しており、これが正しい。
```

### 補足事項

- 本タスクはドキュメント整合修正のみで、挙動変更は行わない。
