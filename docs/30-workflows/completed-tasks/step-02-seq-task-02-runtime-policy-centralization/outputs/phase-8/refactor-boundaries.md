# リファクタリング境界

## メタ情報

| 項目       | 値                                              |
| ---------- | ----------------------------------------------- |
| Phase      | 8 - リファクタリング                            |
| タスク     | TASK-02-RUNTIME-POLICY-CENTRALIZATION           |
| 作成日     | 2026-03-21                                      |
| 前提成果物 | phase-4 ~ phase-7, simplification-candidates.md |

---

## 崩してはいけない Contract

### Contract 1: IRuntimePolicyResolver.resolve() は単一エントリーポイント

| 項目     | 内容                                                                           |
| -------- | ------------------------------------------------------------------------------ |
| 定義     | `IRuntimePolicyResolver.resolve(authMode, apiKey)` が runtime 判定の唯一の入口 |
| 根拠     | Policy Consumption Contract 原則 1（Single Entry）                             |
| 違反例   | Renderer から直接 Store の authMode を読み取って判定ロジックを実行する         |
| 検証方法 | `grep -rn "resolve" apps/desktop/src/` で resolve 呼び出し元を確認             |

### Contract 2: RuntimeDecision の IPC 送信時は sanitizeForRenderer() 経由

| 項目     | 内容                                                                            |
| -------- | ------------------------------------------------------------------------------- |
| 定義     | `RuntimeDecision` を Renderer に送信する際は `sanitizeForRenderer()` を必ず経由 |
| 根拠     | Policy Consumption Contract 原則 3（Sanitized Output）+ DD-2（apiKey 除外）     |
| 違反例   | RuntimeDecision を直接 IPC で Renderer に送信し、apiKey が漏洩する              |
| 検証方法 | IPC ハンドラで `sanitizeForRenderer()` の呼び出しを確認                         |

### Contract 3: HandoffGuidance は packages/shared から import

| 項目     | 内容                                                                          |
| -------- | ----------------------------------------------------------------------------- |
| 定義     | `HandoffGuidance` 型は `packages/shared` に配置し、Main/Renderer 両方から参照 |
| 根拠     | DD-6 + モノレポ構造ルール（01-architecture.md: 共有コードは packages/shared） |
| 違反例   | `apps/desktop/src/main/` 内に HandoffGuidance を定義し、Renderer から import  |
| 検証方法 | `grep -rn "HandoffGuidance" packages/shared/` でパッケージ配置を確認          |

### Contract 4: TerminalHandoffBundle は Main Process 内部でのみ使用

| 項目     | 内容                                                                               |
| -------- | ---------------------------------------------------------------------------------- |
| 定義     | `TerminalHandoffBundle` は Main Process 内部の型。Renderer に公開しない            |
| 根拠     | セキュリティルール（04-electron-security.md: Main の情報を Renderer に漏洩しない） |
| 違反例   | TerminalHandoffBundle を Preload 経由で Renderer に送信する                        |
| 検証方法 | `grep -rn "TerminalHandoffBundle" apps/desktop/src/renderer/` でゼロヒット確認     |

### Contract 5: llm:check-health が primary health route

| 項目     | 内容                                                                    |
| -------- | ----------------------------------------------------------------------- |
| 定義     | health check は `llm:check-health` IPC チャンネルを使用する             |
| 根拠     | DD-3                                                                    |
| 違反例   | `AI_CHECK_CONNECTION` を新規コードで直接呼び出す                        |
| 検証方法 | `grep -rn "AI_CHECK_CONNECTION" apps/desktop/src/` で新規参照がないこと |

### Contract 6: AI_CHECK_CONNECTION は新規コードで参照禁止

| 項目     | 内容                                                                         |
| -------- | ---------------------------------------------------------------------------- |
| 定義     | `AI_CHECK_CONNECTION` は deprecated。新規コードでの参照を禁止                |
| 根拠     | DD-4                                                                         |
| 違反例   | 新規ファイルで `AI_CHECK_CONNECTION` を import して使用する                  |
| 検証方法 | 実装タスク完了後に `grep -rn "AI_CHECK_CONNECTION"` で既存参照のみであること |

---

## Ownership Table 4カテゴリとの整合確認

| Ownership カテゴリ | 関連 Contract    | 整合状態 | 備考                                                 |
| ------------------ | ---------------- | -------- | ---------------------------------------------------- |
| runtime 実行可否   | Contract 1, 5, 6 | 整合     | resolve() が唯一の判定口、health は llm:check-health |
| health check       | Contract 5, 6    | 整合     | primary route と deprecated route が明確             |
| handoff bundle     | Contract 3, 4    | 整合     | shared/Main の配置分離が維持されている               |
| authMode 参照      | Contract 1, 2    | 整合     | resolve() 経由 + sanitize で安全に参照               |

---

## DD-5 SurfaceType / buildForSurface 命名一貫性確認

### Phase 1-7 全体での使用箇所

| Phase | ファイル / セクション                 | 使用される命名       | 一貫性 |
| ----- | ------------------------------------- | -------------------- | ------ |
| 1     | requirements / Ownership Table        | SurfaceType          | 一貫   |
| 2     | design / contract-matrix              | SurfaceType          | 一貫   |
| 3     | design-review                         | SurfaceType          | 一貫   |
| 4     | validation-matrix                     | SurfaceType          | 一貫   |
| 5     | 設計（型定義）                        | SurfaceType          | 一貫   |
| 6     | regression-expansion-plan / edge-case | SurfaceType, surface | 一貫   |
| 7     | coverage-targets / integration-gate   | SurfaceType, surface | 一貫   |

| 関数名                   | Phase での初出 | 最終 Phase での使用   | 一貫性 |
| ------------------------ | -------------- | --------------------- | ------ |
| `buildForSurface`        | Phase 2        | Phase 7               | 一貫   |
| `buildForAgentExecution` | Phase 2        | Phase 8（deprecated） | 一貫   |
| `buildForSkillExecution` | Phase 2        | Phase 8（deprecated） | 一貫   |

**結論**: DD-5 の SurfaceType / buildForSurface 命名は Phase 1-7 全体で一貫している。命名の揺れやエイリアスの発生はない。
