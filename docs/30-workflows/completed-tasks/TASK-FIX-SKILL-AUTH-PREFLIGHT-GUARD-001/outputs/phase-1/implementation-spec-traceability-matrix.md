# implementation-spec-traceability-matrix

## 目的

`TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001` の実装で必要な仕様を、
実装ファイル単位で `aiworkflow-requirements` 正本へ 1:1 でトレースし、
抽出漏れ・矛盾・依存欠落をゼロにする。

## 監査スコープ

- 対象実装領域: Main / IPC / Preload / Renderer設定導線 / AuthKeyService
- 監査日: `2026-03-04`
- ブランチ文脈: `detached HEAD (992dfcb)`, `origin/main...HEAD = 0 diff`

## 思考フレーム適用結果（要約）

| 観点                          | 適用結果                                                                                       |
| ----------------------------- | ---------------------------------------------------------------------------------------------- |
| 水平思考 / 類推思考           | 既存の `skill:execute` 契約ドリフト事例を今回タスクへ横展開し、同型漏れを先回り検出            |
| 逆説思考 / if思考             | 「設定導線が不要」と仮定するとRendererでの復旧不能が発生するため、UI仕様参照を必須化           |
| システム思考 / 因果ループ     | `AuthKeyService -> SkillExecutor -> IPC -> Preload -> Settings導線` のループを閉じる要件を確認 |
| 垂直思考 / why思考            | `AUTHENTICATION_ERROR` を仕様起点で分解し、エラー条件・伝播経路・復旧導線を段階化              |
| 2軸思考 / 戦略思考            | 影響度×再発確率で優先度付けし、`IPC契約/セキュリティ順序/設定導線` を最優先化                  |
| 改善思考 / ダブル・ループ思考 | 既存の抽出不足（4仕様書欠落）を是正し、再発防止として仕様書別SubAgent分担へ再設計              |
| 論点思考 / 抽象化思考         | 実装差分を「契約」「境界」「導線」「品質ゲート」の4論点に抽象化して網羅確認                    |
| プラスサム / トレードオン     | 参照資料を増やしつつ、Phase文書は行列参照に集約して重複記述を削減                              |

## 実装ファイル × 必要仕様トレーサビリティ

| 実装ファイル/関心                                                                                                    | 必要仕様（正本）                                                                                              | 抽出要点                                                                          | 判定 |
| -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---- |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts`                                                              | `interfaces-agent-sdk-executor.md`, `error-handling.md`, `security-principles.md`, `environment-variables.md` | `AUTHENTICATION_ERROR` 条件、キー取得優先順位、`ANTHROPIC_API_KEY` フォールバック | OK   |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                                                                         | `api-ipc-agent.md`, `security-electron-ipc.md`, `interfaces-agent-sdk-skill.md`                               | `validateIpcSender` 順序、`sanitizeErrorMessage`、`skill:execute` 契約境界        | OK   |
| `apps/desktop/src/preload/skill-api.ts`, `apps/desktop/src/preload/types.ts`, `apps/desktop/src/preload/channels.ts` | `interfaces-agent-sdk-skill.md`, `security-api-electron.md`, `api-ipc-system.md`                              | Preload公開境界、`safeInvoke/safeInvokeUnwrap`、auth-key系チャネル                | OK   |
| `apps/desktop/src/main/services/auth/AuthKeyService.ts`, `apps/desktop/src/main/services/auth/types.ts`              | `interfaces-auth.md`, `security-principles.md`, `api-ipc-system.md`, `architecture-auth-security.md`          | 認証状態、鍵管理、保存/検証/削除契約、Main責務                                    | OK   |
| `apps/desktop/src/preload/authKeyApi.ts`                                                                             | `api-ipc-system.md`, `security-api-electron.md`, `interfaces-auth.md`                                         | `auth-key:set/exists/validate/delete` 契約と公開制約                              | OK   |
| `apps/desktop/src/renderer/views/SettingsView/*`                                                                     | `ui-ux-feature-components.md`, `interfaces-auth.md`, `task-workflow.md`                                       | 設定誘導UI、認証モード遷移、未タスク化/再発防止導線                               | OK   |
| 品質ゲート（検証運用）                                                                                               | `quality-requirements.md`, `task-workflow.md`                                                                 | `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links`          | OK   |

## 抽出漏れ・矛盾監査

| チェック | 結果                                                                                                                                                       |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 抽出漏れ | 修正前に欠落していた `interfaces-agent-sdk-skill.md` / `security-electron-ipc.md` / `quality-requirements.md` / `architecture-auth-security.md` を補完済み |
| 追加抽出 | 設定誘導UIのため `ui-ux-feature-components.md` を追加                                                                                                      |
| 矛盾     | 仕様矛盾は未検出（Main/Preload契約、auth-key導線、エラー分類は整合）                                                                                       |
| 依存関係 | Phase依存（1→13）と仕様依存（契約→実装→検証→文書）に欠落なし                                                                                               |

## 機械検証結果

- `verify-all-specs`: 13/13 PASS（error 0, warning 0）
- `validate-phase-output`: 28項目 PASS
- `verify-unassigned-links`: 89/89 PASS

## 要対応リスク（運用差分）

- `artifacts.json` は `artifact-definition.json` の厳格kebab-case検証では `feature` 形式差異を検出する。
- これは既存運用（タスクID命名）との設計差分であり、本タスクでは破壊変更せず Phase 12 の運用ルールで吸収する。

## 判定

**今回の実装に必要な仕様抽出は、実装ファイル単位で漏れなく完了（2026-03-04）。**
