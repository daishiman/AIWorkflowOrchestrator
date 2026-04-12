# Phase 1 成果物: 受け入れ基準書

## タスク情報

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| タスクID | UT-SKILL-WIZARD-FB-03-FALLBACK-SPEC-CLARIFICATION-001 |
| 作成日   | 2026-04-11                                            |

## 受け入れ基準一覧

| AC番号 | 受け入れ基準                                                                              | 検証方法                         | 優先度 |
| ------ | ----------------------------------------------------------------------------------------- | -------------------------------- | ------ |
| AC-1   | task-specification-creator スキルテンプレートのAC-4定義にフィールド独立性が明示されている | SKILL.md 該当箇所のファイル確認  | MUST   |
| AC-2   | フォールバック仕様書テンプレートに「フィールド間独立性」の記述が追加されている            | phase-template-execution.md 確認 | MUST   |
| AC-3   | purpose空・category有効ケースのテストケース（TC-FB03-01）が追加されている                 | vitest 実行確認                  | MUST   |
| AC-4   | フィールド独立推論性の定義が矛盾なく一貫している                                          | レビュー確認                     | MUST   |
| AC-5   | 既存テストへの回帰影響がない（全33件PASS継続）                                            | `pnpm vitest run` 全件PASS       | MUST   |

## AC-3 詳細: 追加テストケース一覧

| TC-ID      | 入力                                                                       | 期待値                                          | 検証観点                                            |
| ---------- | -------------------------------------------------------------------------- | ----------------------------------------------- | --------------------------------------------------- |
| TC-FB03-01 | purpose="", category="code-support"                                        | tool=null, timing=null, format="code"           | フィールド独立推論（categoryはpurposeに依存しない） |
| TC-FB03-02 | purpose="", category=null                                                  | tool=null, timing=null, format=null             | 推論ソースなし → 全nullは正常                       |
| TC-FB03-03 | purpose="コードレビューを自動化するツール", category=null                  | tool=null, timing=null, format=null             | purposeはformatを駆動しない（category責務）         |
| TC-FB03-04 | purpose="GitHubのPRレビューを支援するスキル", category="code-support"      | tool="github", timing=null, format="code"       | 全フィールド正常推論（回帰）                        |
| TC-FB03-05 | purpose=null, category=null                                                | 全null                                          | null入力の安全処理                                  |
| TC-FB03-06 | purpose=undefined, category="code-support"                                 | tool=null, format="code"                        | undefinedはnull扱い・category独立                   |
| TC-FB03-07 | purpose=" ", category="code-support"                                       | tool=null, timing=null, format="code"           | 空白trimされてもcategoryは独立                      |
| TC-FB03-08 | purpose="ツール", category=null                                            | tool=null, timing=null, format=null             | 最小有効purposeでもcategoryなし→format null         |
| TC-FB03-09 | 既存テスト回帰（purpose="毎日Slackに通知を送る", category="code-support"） | tool="slack", timing="scheduled", format="code" | 既存正常系が破壊されていないこと                    |

## フィールド責務マトリクス（AC-4の根拠）

| 推論フィールド | 推論ソース | purpose空時の動作 | category null時の動作 |
| -------------- | ---------- | ----------------- | --------------------- |
| `tool`         | purpose    | null              | 影響なし              |
| `timing`       | purpose    | null              | 影響なし              |
| `format`       | category   | 影響なし          | null                  |
| `inferenceLog` | 全推論結果 | []                | format推論ログなし    |
