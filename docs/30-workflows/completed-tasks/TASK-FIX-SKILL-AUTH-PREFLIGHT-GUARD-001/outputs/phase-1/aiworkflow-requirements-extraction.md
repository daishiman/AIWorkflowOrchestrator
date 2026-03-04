# aiworkflow-requirements extraction

## 抽出元（auth preflight guard）

- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`
- `.claude/skills/aiworkflow-requirements/references/error-handling.md`
- `.claude/skills/aiworkflow-requirements/references/security-principles.md`
- `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`
- `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`
- `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`
- `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`
- `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md`
- `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`
- `.claude/skills/aiworkflow-requirements/references/environment-variables.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`

## 仕様書別 SubAgent 分担（関心ごと分離）

| SubAgent | 担当仕様書                                                                                                  | 関心ごと                         | 並列可否     |
| -------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------- | ------------ |
| A        | `interfaces-agent-sdk-executor.md`, `api-ipc-agent.md`, `api-ipc-system.md`                                 | Main/IPC 契約                    | B/C と並列可 |
| B        | `interfaces-agent-sdk-skill.md`, `security-electron-ipc.md`, `security-api-electron.md`                     | Preload/Renderer 境界            | A/C と並列可 |
| C        | `interfaces-auth.md`, `security-principles.md`, `environment-variables.md`, `architecture-auth-security.md` | 認証状態・鍵管理                 | A/B と並列可 |
| D        | `quality-requirements.md`, `task-workflow.md`, `error-handling.md`, `ui-ux-feature-components.md`           | 品質ゲート・再発防止・設定誘導UI | A/B/C 完了後 |

## 必要情報の網羅チェック

| 観点                     | 抽出内容                                                                        | 参照元                                                       |
| ------------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| エラー条件               | APIキー未設定/無効時は `AUTHENTICATION_ERROR` を返す                            | `interfaces-agent-sdk-executor.md`, `error-handling.md`      |
| キー取得優先順位         | `AuthKeyService.getKey()` 優先、未設定時に `ANTHROPIC_API_KEY` へフォールバック | `interfaces-agent-sdk-executor.md`, `security-principles.md` |
| `skill:execute` 契約境界 | Preload/Main の契約互換（`skillName` 正式 + 互換入力）を維持                    | `interfaces-agent-sdk-skill.md`, `api-ipc-agent.md`          |
| IPCセキュリティ順序      | `sender -> P42 3段バリデーション -> サニタイズ` の順序を固定                    | `security-electron-ipc.md`                                   |
| 設定導線                 | 認証状態と設定誘導の型・IPC導線を維持                                           | `interfaces-auth.md`, `api-ipc-system.md`                    |
| Preload境界              | Renderer に秘密情報（キー本体）を公開しない                                     | `security-api-electron.md`, `security-principles.md`         |
| 認証アーキテクチャ       | Main/Preload/Renderer の責務分離を維持                                          | `architecture-auth-security.md`                              |
| 品質ゲート               | `verify-all-specs` / `validate-phase-output` を必須ゲートにする                 | `quality-requirements.md`                                    |
| 設定誘導UI               | APIキー未設定時の設定画面導線・UI整合を維持                                     | `ui-ux-feature-components.md`, `interfaces-auth.md`          |
| 環境変数契約             | `ANTHROPIC_API_KEY` の定義・取り扱いを正本に一致させる                          | `environment-variables.md`                                   |
| 再発防止観点             | 未タスク管理・完了台帳・教訓同期を同時に実施する                                | `task-workflow.md`                                           |

## 抽出漏れ監査

- 修正前（2026-03-03作成時）: `interfaces-agent-sdk-skill.md` / `security-electron-ipc.md` / `quality-requirements.md` / `architecture-auth-security.md` の参照が欠落。
- 修正後（2026-03-04）: 実装上の必須観点（契約境界、セキュリティ順序、品質ゲート、責務分離、設定誘導UI）を追加し、抽出元を再構成。
- 機械検証: `verify-all-specs`（13/13 PASS）、`validate-phase-output`（28項目 PASS）を再実行済み。
- 実装トレーサビリティ: `implementation-spec-traceability-matrix.md` に実装ファイル単位の1:1マッピングを記録済み。

## 判定

**抽出漏れ: なし（2026-03-04時点）**
