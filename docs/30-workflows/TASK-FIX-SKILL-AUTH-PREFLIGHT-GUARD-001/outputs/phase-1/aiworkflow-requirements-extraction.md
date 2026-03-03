# aiworkflow-requirements extraction

## 抽出元（auth preflight guard）

- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`
- `.claude/skills/aiworkflow-requirements/references/error-handling.md`
- `.claude/skills/aiworkflow-requirements/references/security-principles.md`
- `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`
- `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`
- `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`
- `.claude/skills/aiworkflow-requirements/references/environment-variables.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`

## 必要情報の網羅チェック

| 観点             | 抽出内容                                    | 参照元                                                       |
| ---------------- | ------------------------------------------- | ------------------------------------------------------------ |
| エラー条件       | APIキー未設定時は `AUTHENTICATION_ERROR`    | `interfaces-agent-sdk-executor.md`, `error-handling.md`      |
| キー取得優先順位 | AuthKeyService 優先、環境変数フォールバック | `interfaces-agent-sdk-executor.md`, `security-principles.md` |
| 設定導線         | 認証状態と設定誘導の型定義                  | `interfaces-auth.md`, `api-ipc-system.md`                    |
| Preload境界      | Renderer にキー本体を露出しない             | `security-api-electron.md`                                   |
| 環境変数契約     | `ANTHROPIC_API_KEY` の正本定義              | `environment-variables.md`                                   |
| 再発防止観点     | 認証エラー導線の既知課題と防止策            | `task-workflow.md`                                           |

## 抽出漏れ監査

- 本実装で必須となる観点（エラー条件、キー取得順、設定導線、境界保護、環境変数契約）は全て正本仕様へマッピング済み。
- チェーン配線専用仕様（`interfaces-agent-sdk-skill.md` の chain 詳細）は本タスクの主目的外のため参照対象外。

## 判定

**抽出漏れ: なし（2026-03-03時点）**
