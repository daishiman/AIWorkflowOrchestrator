# Traceability Matrix

## 目的

元タスク仕様の要求が、どのPhase仕様へ反映されたかを示す。

## 要求トレース

| 元要求                              | 反映先                                                                          | 判定 |
| ----------------------------------- | ------------------------------------------------------------------------------- | ---- |
| 30チャネル完全定義                  | phase-1-requirements.md, phase-2-design.md, phase-4-test-creation.md            | PASS |
| handle 29 + on 1 の明確化           | phase-1-requirements.md, phase-9-quality-assurance.md                           | PASS |
| channels.ts 拡張方針                | phase-2-design.md, phase-5-implementation.md                                    | PASS |
| skill-api.ts サブネームスペース方針 | phase-2-design.md, phase-5-implementation.md                                    | PASS |
| preload/types.ts 整合計画           | phase-2-design.md, phase-4-test-creation.md, phase-9-quality-assurance.md       | PASS |
| packages/shared 型配置計画          | phase-2-design.md, phase-5-implementation.md                                    | PASS |
| task-9D〜9J artifacts更新方針       | phase-2-design.md, phase-5-implementation.md                                    | PASS |
| P32対策                             | phase-1-requirements.md, phase-4-test-creation.md, phase-9-quality-assurance.md | PASS |
| P44/P45対策                         | phase-1-requirements.md, phase-3-design-review.md, phase-9-quality-assurance.md | PASS |
| P5二重登録対策                      | phase-1-requirements.md, phase-3-design-review.md                               | PASS |
| 実装作業を行わない制約              | index.md, phase-5-implementation.md, phase-13-pr-creation.md                    | PASS |
| コミット/PR実行禁止                 | phase-13-pr-creation.md                                                         | PASS |
| SubAgent分担で仕様書作成            | index.md, phase-1〜13 各ファイルの SubAgent分担                                 | PASS |

## aiworkflow-requirements 参照トレース

| カテゴリ            | 参照先                                          | 反映先           | 判定 |
| ------------------- | ----------------------------------------------- | ---------------- | ---- |
| IPC API契約         | api-ipc-agent.md                                | 全Phase 参照資料 | PASS |
| Skill IF契約        | interfaces-agent-sdk-skill.md                   | 全Phase 参照資料 | PASS |
| Preloadセキュリティ | security-api-electron.md, security-skill-ipc.md | 全Phase 参照資料 | PASS |
| IPCセキュリティ     | security-electron-ipc.md                        | 全Phase 参照資料 | PASS |
| IPC契約チェック     | ipc-contract-checklist.md                       | 全Phase 参照資料 | PASS |
| IPC型整合           | ipc-type-resolution-guide.md                    | 全Phase 参照資料 | PASS |
| 実装パターン        | architecture-implementation-patterns.md         | 全Phase 参照資料 | PASS |
| 既知落とし穴        | 06-known-pitfalls.md                            | 全Phase 参照資料 | PASS |
| エラーハンドリング  | error-handling.md                               | 全Phase 参照資料 | PASS |
