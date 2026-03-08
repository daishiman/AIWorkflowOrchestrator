# Requirements Extraction Matrix

## メタ情報

| 項目     | 値                                                                           |
| -------- | ---------------------------------------------------------------------------- |
| タスクID | TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001                                  |
| 目的     | aiworkflow-requirements から実装に必要な仕様を漏れなく抽出したことを検証する |
| 作成日   | 2026-03-08                                                                   |

## 抽出戦略（関心ごと分離）

| SubAgent          | 関心ごと                   | 参照起点                                                                                                |
| ----------------- | -------------------------- | ------------------------------------------------------------------------------------------------------- |
| SubAgent-Contract | IPC契約・型契約            | `references/api-ipc-system.md`, `references/interfaces-auth.md`, `references/ipc-contract-checklist.md` |
| SubAgent-UI       | UI異常系・フォールバックUX | `references/ui-ux-settings.md`, `references/ui-ux-components.md`                                        |
| SubAgent-Security | 境界防御・入力検証         | `references/security-electron-ipc.md`, `references/error-handling.md`                                   |
| SubAgent-Test     | テスト設計・証跡           | `references/testing-component-patterns.md`, `references/quality-requirements.md`                        |
| SubAgent-Workflow | Phase 12同期・未タスク     | `references/task-workflow.md`, `references/lessons-learned.md`                                          |

## 実装差分 ↔ 仕様抽出トレース

| 実装差分                                               | 必須仕様                                                                               | 抽出結果 | 反映状態 |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------- | -------- | -------- |
| `apiKeyHandlers.ts` の `apiKey:list` 配列検証・再計算  | `api-ipc-system.md` の `IPCResponse<ProviderListResult>` 契約、`providers` shape       | 抽出済み | 反映済み |
| `ApiKeysSection/index.tsx` の shape フィルタ・fallback | `ui-ux-settings.md` 異常系表示仕様、`security-electron-ipc.md` 多層防御                | 抽出済み | 反映済み |
| `profileHandlers.ts` の `identities` 正規化統一        | `security-electron-ipc.md` の `Array.isArray` 統一パターン、`error-handling.md`        | 抽出済み | 反映済み |
| Renderer/Main テスト追加                               | `testing-component-patterns.md` の malformed/非配列パターン、`quality-requirements.md` | 抽出済み | 反映済み |
| Phase 11 screenshot 証跡                               | `task-specification-creator` の phase-11-12-guide、`task-workflow.md` 証跡要件         | 抽出済み | 反映済み |
| Phase 12仕様同期（完了台帳・教訓・未タスク）           | `task-workflow.md`, `lessons-learned.md`, `spec-update-workflow.md`                    | 抽出済み | 反映済み |

## 抽出漏れチェック（逆説/if 思考）

- もし `apiKey:list` 契約を `ProviderStatus[]` のまま扱うと、Main/Rendererで契約が分裂する -> `api-ipc-system.md` で `ProviderListResult` 正本化を確認済み。
- もし UIだけ修正して Main を未防御にすると、不正shapeが再流入する -> Main `Array.isArray` 防御を必須として反映済み。
- もしテストが unit のみで画面証跡がないと、UX回帰を見逃す -> Phase 11 screenshot TC-11-01〜03 を証跡化済み。
- もし未タスク導線が欠けると継続改善が停止する -> unassigned-task 4件のリンクを task-workflow に同期済み。

## 依存関係整合チェック（システム思考）

| 依存                | 期待                             | 検証                                                                              |
| ------------------- | -------------------------------- | --------------------------------------------------------------------------------- |
| 実装 → 仕様         | 実装変更が対応仕様へ同期される   | `api-ipc-system.md` / `ui-ux-settings.md` / `security-electron-ipc.md` 更新を確認 |
| 仕様 → テスト       | 仕様ルールがテストケース化される | Renderer 7件 + Main 13件 追加を確認                                               |
| テスト → 証跡       | 自動テストと手動証跡が矛盾しない | manual-test-result の TC と screenshot の一致を確認                               |
| 仕様台帳 → 未タスク | 未完事項が追跡可能               | task-workflow の unassigned-task リンクを検証                                     |

## 結論

`aiworkflow-requirements` から今回実装に必要な仕様は、契約・UI・セキュリティ・テスト・ワークフロー同期の5関心ごとで抽出し、実装差分に対して漏れなくトレース可能な状態に改善した。
