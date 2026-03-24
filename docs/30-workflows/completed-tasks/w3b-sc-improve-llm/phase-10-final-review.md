# Phase 10: 最終レビュー

## メタ情報

| 項目   | 値                 |
| ------ | ------------------ |
| Phase  | 10                 |
| 機能名 | w3b-sc-improve-llm |
| 作成日 | 2026-03-22         |

## 目的

多角的な品質・整合性の最終検証を行う。特に AC-5「フィードバックを入力すると改善提案（section/before/after/reason）が返り、ユーザーが承認すると SKILL.md に反映される」の検証を重点的に実施する。

## 実行タスク

1. 受入基準 AC-5 の検証
   - フィードバック入力 → LLM 呼び出し → 改善提案 JSON 取得のフローが動作する
   - 改善提案に `section`, `before`, `after`, `reason` が全て含まれる（型: `RuntimeSkillCreatorImproveSuggestion`）
   - `suggestions` が `string[]` ではなく `RuntimeSkillCreatorImproveSuggestion[]` で返されることを確認する
   - ユーザー承認後に SKILL.md が正しく更新される（`applyImprovement()` または同等のフロー）
   - ロールバック機能が動作する
2. セキュリティ観点のレビュー
   - SKILL.md のパスにパストラバーサル攻撃が可能でないか確認（P42対策）
   - SkillFileManager の引数バリデーションを確認
   - `ReadonlySkillError` が発生した場合にエラーレスポンスに内部パス情報（ホームディレクトリ等）が含まれていないことを確認する（P55対策: エラーメッセージのサニタイズ）
   - DI で注入された `SkillFileManager` が SkillFileManagerの引数バリデーション（パストラバーサルチェック）が正しく機能していることを確認する
3. DI 追加に伴う既存テストへの影響確認
   - `RuntimeSkillCreatorFacadeDeps` に `skillFileManager: SkillFileManager` が追加されたことで、既存の plan() のテストが壊れていないか確認する
   - plan() 専用テストでは `skillFileManager` を渡さなくてよい設計（optional or plan 専用 deps）になっているか確認する
   - P21/P35 対策: DI 追加による既存テストへのモック追加が全て完了しているか確認する
4. エラーハンドリングの網羅性確認
   - 全エラーコード（SKILL_NOT_FOUND, READ_ERROR, VALIDATION_ERROR, PARSE_ERROR, LLM_ERROR）が定義されているか
   - エラーレスポンスに内部パス情報（ホームディレクトリ等）が含まれていないことを確認する
5. 型安全性の最終確認
   - non-null assertion (`!`) の残存がないか（P52対策: `grep -n '!'`）
   - 型キャスト (`as`) の不当使用がないか
   - `isValidImproveResponse()` の type predicate が P49 準拠（`in` 演算子使用）であるか確認する
6. レビュー判定（PASS / MINOR / MAJOR / CRITICAL）
7. MINOR 以上の指摘を未タスク仕様書に変換

## 参照資料

| 種別           | パス / 参照先                                                         |
| -------------- | --------------------------------------------------------------------- |
| Phase 9 成果物 | Phase 9 品質検証結果                                                  |
| 実装対象       | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` |
| レビューゲート | `.claude/rules/05-task-execution.md`（Phase 10 最終レビューゲート）   |
| 既知の落とし穴 | `.claude/rules/06-known-pitfalls.md`（P48, P52: non-null assertion）  |

## 実行手順

1. AC-5 の全達成条件を1つずつ検証し、結果を記録する
2. セキュリティ観点（パストラバーサル、情報漏洩、ReadonlySkillError サニタイズ）を検証する
3. DI 追加に伴う既存テストへの影響を確認する
4. エラーハンドリングの網羅性を確認する
5. 型安全性の最終確認を行う
6. レビュー判定を PASS / MINOR / MAJOR / CRITICAL で明記する
7. MINOR 以上の指摘がある場合は全て未タスク仕様書に変換する

## 統合テスト連携

| 判定項目               | 基準 | 結果       |
| ---------------------- | ---- | ---------- |
| ユニットテストLine     | 80%+ | {{RESULT}} |
| ユニットテストBranch   | 60%+ | {{RESULT}} |
| ユニットテストFunction | 80%+ | {{RESULT}} |

最終レビューでの全テスト結果確認を実施する。

## 多角的チェック観点

| 観点               | 適用判断 | 確認内容                                           |
| ------------------ | -------- | -------------------------------------------------- |
| セキュリティ       | 該当     | パストラバーサル防止、ReadonlySkillErrorサニタイズ |
| アーキテクチャ     | 該当     | DI設計整合性、plan()との共通化                     |
| エラーハンドリング | 該当     | 全エラーコード定義・使用の網羅性                   |
| IPC通信            | 該当     | IPC wrapper形式準拠                                |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断 | 確認内容                    |
| -------------------- | -------- | --------------------------- |
| バックエンド（Main） | 該当     | RuntimeSkillCreatorFacade   |
| IPC通信              | 該当     | skill-creator:improve-skill |

## 成果物

| 成果物             | パス / 説明                                                              |
| ------------------ | ------------------------------------------------------------------------ |
| 最終レビュー報告書 | 判定: PASS / MINOR / MAJOR / CRITICAL、AC-5 達成確認記録、指摘事項リスト |

## 完了条件

- [ ] AC-5 の全達成条件を検証した（section/before/after/reason が `RuntimeSkillCreatorImproveSuggestion` 型で返ることを確認）
- [ ] `suggestions` が `RuntimeSkillCreatorImproveSuggestion[]` 型で返ることを確認した（`string[]` への後退がない）
- [ ] セキュリティ観点（パストラバーサル、情報漏洩、ReadonlySkillError のサニタイズ）を確認した
- [ ] DI 追加（`skillFileManager`）に伴う既存テストへの影響が解消されていることを確認した（P21/P35対策）
- [ ] エラーハンドリングの網羅性を確認した（5種類のエラーコードが全て定義・使用されている）
- [ ] non-null assertion (`!`) の残存がないことを確認した（P52対策）
- [ ] `isValidImproveResponse()` が P49 準拠（`in` 演算子による type predicate）であることを確認した
- [ ] 型キャスト (`as`) の不当使用がないことを確認した
- [ ] レビュー判定を PASS / MINOR / MAJOR / CRITICAL で明記した
- [ ] MINOR 以上の指摘は全て未タスク仕様書に変換した
- [ ] MINOR判定の場合、全指摘を未タスク仕様書に変換し、Phase 11着手の前提条件を満たしていることを確認した
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

| サブタスク | 担当 | ステータス | 備考 |
| ---------- | ---- | ---------- | ---- |
| -          | -    | -          | -    |

## タスク100%実行確認【必須】

- [ ] 実行タスク1〜7の全項目を実行した
- [ ] 完了条件の全チェックボックスを確認した
- [ ] 成果物が全て生成された
- [ ] 未実行・スキップしたタスクは0件である

## 次のPhase

Phase 11: 手動テスト
