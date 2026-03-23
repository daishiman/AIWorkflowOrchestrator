# IPC ドキュメント - Skill Creator 全16チャネル

> タスクID: TASK-SC-01-IPC-WIRING-FIX
> 作成日: 2026-03-23
> Phase: 12 - ドキュメント

## skillCreatorHandlers.ts（13チャネル）

### 1. skill-creator:detect-mode

- **種別**: invoke
- **引数**: `{ workspacePath: string }`
- **レスポンス**: `{ success: true, data: { mode: "collaborative" | "orchestrate" } }` | `{ success: false, error: { code, message } }`

### 2. skill-creator:create

- **種別**: invoke
- **引数**: `{ skillName: string, template?: string, options?: object }`
- **レスポンス**: `{ success: true, data: { skillPath: string } }` | `{ success: false, error: { code, message } }`

### 3. skill-creator:execute-tasks

- **種別**: invoke
- **引数**: `{ skillName: string, tasks: string[] }`
- **レスポンス**: `{ success: true, data: { results: TaskResult[] } }` | `{ success: false, error: { code, message } }`

### 4. skill-creator:validate

- **種別**: invoke
- **引数**: `{ skillName: string }`
- **レスポンス**: `{ success: true, data: { isValid: boolean, errors?: string[] } }` | `{ success: false, error: { code, message } }`

### 5. skill-creator:validate-schema

- **種別**: invoke
- **引数**: `{ skillName: string, schema?: object }`
- **レスポンス**: `{ success: true, data: { isValid: boolean, errors?: string[] } }` | `{ success: false, error: { code, message } }`

### 6. skill-creator:improve

- **種別**: invoke
- **引数**: `{ skillName: string, feedback?: string }`
- **レスポンス**: `{ success: true, data: { improved: boolean } }` | `{ success: false, error: { code, message } }`

### 7. skill-creator:fork

- **種別**: invoke
- **引数**: `{ skillName: string, newName: string }`
- **レスポンス**: `{ success: true, data: { forkedPath: string } }` | `{ success: false, error: { code, message } }`

### 8. skill-creator:share

- **種別**: invoke
- **引数**: `{ skillName: string, options?: object }`
- **レスポンス**: `{ success: true, data: { shareUrl?: string } }` | `{ success: false, error: { code, message } }`

### 9. skill-creator:schedule

- **種別**: invoke
- **引数**: `{ skillName: string, schedule: object }`
- **レスポンス**: `{ success: true, data: { scheduled: boolean } }` | `{ success: false, error: { code, message } }`

### 10. skill-creator:debug

- **種別**: invoke
- **引数**: `{ skillName: string, options?: object }`
- **レスポンス**: `{ success: true, data: { debugInfo: object } }` | `{ success: false, error: { code, message } }`

### 11. skill-creator:generate-docs

- **種別**: invoke
- **引数**: `{ skillName: string }`
- **レスポンス**: `{ success: true, data: { docsPath: string } }` | `{ success: false, error: { code, message } }`

### 12. skill-creator:stats

- **種別**: invoke
- **引数**: `{ skillName?: string }`
- **レスポンス**: `{ success: true, data: { stats: object } }` | `{ success: false, error: { code, message } }`

### 13. skill-creator:progress

- **種別**: on（イベントリスナー）
- **引数**: `{ taskId: string }`
- **イベントデータ**: `{ progress: number, message: string, taskId: string }`

## creatorHandlers.ts（3チャネル - Runtime）

### 14. skill-creator:plan

- **種別**: invoke
- **引数**: `{ prompt: string, context?: object }`
- **レスポンス**: `{ success: true, data: { plan: PlanResult } }` | `{ success: false, error: { code, message } }`
- **graceful degradation**: RuntimeSkillCreatorFacade 未注入時は `{ success: false, error: { code: "SERVICE_UNAVAILABLE" } }`

### 15. skill-creator:execute-plan

- **種別**: invoke
- **引数**: `{ planId: string, options?: object }`
- **レスポンス**: `{ success: true, data: { result: ExecuteResult } }` | `{ success: false, error: { code, message } }`
- **graceful degradation**: 同上

### 16. skill-creator:improve-skill

- **種別**: invoke
- **引数**: `{ skillName: string, feedback: string }`
- **レスポンス**: `{ success: true, data: { improved: boolean } }` | `{ success: false, error: { code, message } }`
- **graceful degradation**: 同上

## 共通事項

- 全 invoke チャネルは P42 準拠の3段バリデーション（型チェック / 空文字列 / トリム空文字列）を適用
- エラーレスポンスは `{ success: false, error: { code: string, message: string } }` 形式（P60 準拠）
- 全チャネルは `IPC_CHANNELS` 定数経由で参照（P27 準拠）
