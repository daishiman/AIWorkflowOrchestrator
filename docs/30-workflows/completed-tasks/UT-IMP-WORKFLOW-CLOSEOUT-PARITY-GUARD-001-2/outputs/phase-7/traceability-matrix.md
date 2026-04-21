# Phase 7: トレーサビリティマトリクス

> 作成日: 2026-04-20
> AC-1〜AC-7 × テストケース対応表

---

## AC × テストケース対応表

| AC   | 内容概要                                                                 | 対応テストケース                                                       |
| ---- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| AC-1 | S1〜S4 の4ソースから Phase ステータスを読み取る                          | TC-P-01, TC-P-15（sourcesChecked確認）                                 |
| AC-2 | 全ソース一致 → exit 0 / PARITY_OK                                        | TC-P-01, TC-P-10, TC-P-11                                              |
| AC-3 | 不一致検出 → exit 1 / PARITY_DRIFT（どのソースが不一致か特定）           | TC-P-02, TC-P-03, TC-P-04, TC-P-05, TC-P-06, TC-P-18, TC-P-19, TC-P-20 |
| AC-4 | 必須ソース欠損 → exit 2 / MISSING_SOURCE                                 | TC-P-07, TC-P-08                                                       |
| AC-5 | verify-all-specs.js が parity 検証を内包し FAIL 時は全体 FAIL            | TC-E-01〜TC-E-07                                                       |
| AC-6 | --json 出力に result/phases/drifts/sourcesChecked/generatedAt が含まれる | TC-P-13, TC-P-15, TC-P-16, TC-E-06                                     |
| AC-7 | validator は既存ファイルを変更しない（read-only）                        | TC-P-17, TC-E-11                                                       |

---

## drift シナリオ（S1〜S4 単独/複合）の網羅状況

| シナリオ                              | fixture             | テスト           | 網羅 |
| ------------------------------------- | ------------------- | ---------------- | ---- |
| S1 単独ドリフト                       | partial-drift-s1    | TC-P-02          | 済   |
| S2 単独ドリフト                       | partial-drift-s2    | TC-P-03          | 済   |
| S3 単独ドリフト                       | partial-drift-s3    | TC-P-04          | 済   |
| S4 単独ドリフト                       | s4-only-drift       | TC-P-05, TC-P-19 | 済   |
| S1+S2 同時ドリフト（canonical=S3/S4） | two-drift-s1-s2     | TC-P-18          | 済   |
| 全ソースドリフト                      | full-drift          | TC-P-06          | 済   |
| 複数Phase にまたがるdrift             | mixed-across-phases | TC-P-20          | 済   |
| S2（artifacts.json）欠損              | missing-s2          | TC-P-07          | 済   |
| S3（outputs/artifacts.json）欠損      | missing-s3          | TC-P-08          | 済   |
| 無効なステータス値                    | invalid-status      | TC-P-09          | 済   |
| S1 "-" 許容（pendingと同義）          | s1-dash-ok          | TC-P-11          | 済   |
| Phase なし（空ワークフロー）          | empty-workflow      | TC-P-10          | 済   |

**全12シナリオ網羅済み**

---

## checklist gate 網羅状況

| gate 項目                                                        | テスト  | 網羅 |
| ---------------------------------------------------------------- | ------- | ---- |
| validate-closeout-parity.js --workflow コマンドがchecklistに記載 | TC-E-08 | 済   |
| PARITY_OK の記載あり                                             | TC-E-09 | 済   |
| PARITY_DRIFT bypass禁止の記載あり                                | TC-E-10 | 済   |

---

## 後方互換性・追加属性

| 項目                                           | テスト           | 状況           |
| ---------------------------------------------- | ---------------- | -------------- |
| --workflow / --phase の基本動作                | TC-C-05          | 後方互換OK     |
| --json 追加でJSONが壊れない                    | TC-E-07          | OK             |
| --skip-parity-check 未知フラグ拒否             | TC-C-04, TC-C-08 | OK（exit 非0） |
| 遡及修正禁止（completed-tasks のファイル不変） | TC-E-11, TC-P-17 | OK             |
| drift baseline 増加なし                        | TC-E-12          | OK（31件以下） |
