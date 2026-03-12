# Concern Boundary Map

## 境界定義

| Concern            | 責務                                       | 含む                                                                                             | 含まない                                 | Owner      |
| ------------------ | ------------------------------------------ | ------------------------------------------------------------------------------------------------ | ---------------------------------------- | ---------- |
| Pointer / Index    | parent pointer と旧 index の参照更新       | task-060, task-000, task-090, completed-task pointer docs                                        | system spec, capture script, mirror sync | SubAgent-A |
| Spec Evidence      | system spec と capture script の path 更新 | task-workflow, ui-ux-feature-components, interfaces-llm, interfaces-chat-history, capture script | pointer doc の status 変更               | SubAgent-B |
| Validator / Mirror | guard 実装と root 間整合                   | root script, tests, `diff -qr`, JSON report                                                      | spec 文言更新                            | SubAgent-C |
| Phase 12 Sync      | 実装内容の文書化と台帳同期                 | implementation guide, changelog, lessons, LOGS, compliance check                                 | validator 実装本体                       | SubAgent-D |

## 実装順序

1. A が pointer/index の expected path を fix する
2. B が system spec と capture script を fix する
3. C が guard script と tests を作り、A/B の変更を green 化する
4. D が台帳・教訓・Phase 12 証跡を同期する

## 並列化条件

- A と B は Phase 5 で同時に実施できる
- C は A/B の expected path 一覧が確定した時点で並列着手できる
- D は実装差分確定後、Phase 11 完了まで待機する
