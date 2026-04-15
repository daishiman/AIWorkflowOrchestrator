# Lessons Learned: notion freeText 特別ケース解消（UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001）

> 区分: 教訓記録（lessons-learned）
> タスクID: UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001
> 完了日: 2026-04-15

---

## タスク概要

| 項目         | 値                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------ |
| タスクID     | UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001                                          |
| 完了日       | 2026-04-15                                                                                 |
| 課題         | notion freeText 特別ケース解消                                                             |
| 設計選択     | Option 3 採用（`resolveLabelEntry()` が `{ label, freeText? }` を返す）                    |
| 依存タスク   | UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001                                         |
| 成果物       | `docs/30-workflows/UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001/` (index.md + Phase 1-13 + artifacts.json) |

---

## 教訓

### L-NOTION-001: 型拡張の後方互換問題

| 項目       | 内容                                                                                                                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 問題       | `QuestionSemanticLabelMap` を `string \| { label; freeText? }` に拡張すると、既存の `resolveSemanticLabel()` 呼び出し元で型エラーが発生する                                                               |
| 原因       | 既存 API の戻り値型に直接 union 型を持ち込むと、呼び出し元が `string` として扱っている箇所すべてに型変更の影響が波及する                                                                                  |
| 解決策     | `resolveSemanticLabel()` を互換 wrapper として維持し、新関数 `resolveLabelEntry()` を追加する。呼び出し元は `resolveLabelEntry()` に移行し、旧 wrapper は段階的に廃止する                                  |
| 標準ルール | 型拡張時は既存 API を破壊しない互換 wrapper パターンが有効。既存呼び出し元への影響ゼロで新機能を導入し、移行コストを分散させる                                                                            |
| 関連タスク | UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001                                                                                                                                                         |

---

### L-NOTION-002: ドキュメントのドリフト

| 項目       | 内容                                                                                                                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 問題       | `interfaces-agent-sdk-skill-reference.md` に「notion 特別ケースは createQuestionAnswer の責務」という旧設計方針が残存し、実装完了後も更新されなかった                                        |
| 原因       | リファクタリングで「特別ケース解消」を行う際、特別ケースの存在を前提としたコメント・設計書が他ファイルに残存するリスクを見落とした                                                            |
| 解決策     | Phase 12 の system-spec-update-summary で明示的に旧文言 3 箇所を特定・削除する                                                                                                               |
| 標準ルール | リファクタリングで「特別ケース解消」を行う場合、特別ケース存在を前提としたコメント・設計書が他ファイルに残存するリスクが高い。Phase 12 での grep 確認を必須とすること                         |
| 関連タスク | UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001                                                                                                                                             |

---

### L-NOTION-003: freeText 対応の他 questionId への波及

| 項目       | 内容                                                                                                                                                                        |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 問題       | q5 以外（例: q4 の外部サービス）でも freeText が必要になった場合、同様の特別ケースが発生するリスクがある                                                                    |
| 原因       | 特別ケースを個別対応で解消するパターンでは、同類の特別ケースが別の questionId で再発しやすい                                                                                |
| 解決策     | `SemanticLabelEntry` 型を `shared` に定義しておくことで、将来の拡張は `SEMANTIC_LABEL_MAP` のエントリ追加のみで対応可能。呼び出し元の変更が不要になる                        |
| 標準ルール | 拡張性のある型定義を shared に置くことで、将来の同類課題をスキーマ変更のみで解決できる。今回スコープ外の questionId への展開は未タスクとして記録済み                         |
| 関連タスク | UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001                                                                                                                           |

---

## 設計選択の記録

Option 1（型拡張）vs Option 2（別テーブル）vs Option 3（戻り値型変更）の比較検討を実施した。

| Option   | 概要                                                   | 採否     | 理由                                                                                     |
| -------- | ------------------------------------------------------ | -------- | ---------------------------------------------------------------------------------------- |
| Option 1 | `QuestionSemanticLabelMap` の値を `string \| { label; freeText? }` に拡張 | 不採用   | 型の複雑性増大リスクがあり、呼び出し元すべてに型エラーが波及する                         |
| Option 2 | freeText 専用の別テーブルを追加                        | 不採用   | 管理テーブルの同期コストが高く、SEMANTIC_LABEL_MAP との乖離が発生しやすい                 |
| Option 3 | `resolveLabelEntry()` が `{ label, freeText? }` を返す | **採用** | 呼び出し元が label と freeText を明示的に分離して扱えるため設計意図が明確になる          |

---

## 依存関係

| 方向 | タスクID                                              | 内容                                              |
| ---- | ----------------------------------------------------- | ------------------------------------------------- |
| 先行 | UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001    | `SEMANTIC_LABEL_MAP` 拡張性設計の前提となるタスク |

---

## 関連ファイル

| ファイル                                                                                       | 用途                             |
| ---------------------------------------------------------------------------------------------- | -------------------------------- |
| `docs/30-workflows/UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001/`                         | タスク仕様書ディレクトリ         |
| `packages/shared/src/` （SemanticLabelEntry 型定義）                                           | shared 型定義                    |
| `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                  | 呼び出し元コンポーネント         |
| `interfaces-agent-sdk-skill-reference.md`                                                      | 旧設計方針ドキュメント（更新対象）|
