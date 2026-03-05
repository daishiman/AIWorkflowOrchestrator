# Phase 2 IPC契約設計

## 契約マトリクス

| チャネル                 | リクエスト                        | レスポンス                            | エラーコード                       |
| ------------------------ | --------------------------------- | ------------------------------------- | ---------------------------------- |
| `skill:import`           | `skillName: string`（trim後非空） | `ImportedSkill`                       | `ERR_1001`, `ERR_2004`, `ERR_5001` |
| `skill:importFromSource` | `source: ShareTarget`             | `ShareResult<ShareImportResult>`      | `ERR_1001`, `ERR_2004`, `ERR_5001` |
| `skill:export`           | `payload: ShareExportPayload`     | `ShareResult<ShareExportResult>`      | `ERR_1001`, `ERR_2004`, `ERR_5001` |
| `skill:validateSource`   | `source: ShareTarget`             | `ShareResult<SourceValidationResult>` | `ERR_1001`, `ERR_2004`, `ERR_5001` |

## 責務分離設計

- `skill:import`: ローカルインポート専用（SkillManagementPanel import導線）
- `skill:importFromSource`: 外部ソース専用（ShareTarget）
- 禁止: importボタン経由で `skill:importFromSource` を直接呼ぶこと

## 契約ドリフト防止

- Main unregister/register とも `IPC_CHANNELS` 定数参照で統一
- preload contract テストでチャネル名と呼び出し先を固定
