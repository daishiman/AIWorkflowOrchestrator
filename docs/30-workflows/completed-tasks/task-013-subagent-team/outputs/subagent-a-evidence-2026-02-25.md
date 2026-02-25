# SubAgent-A 実行エビデンス (2026-02-25)

## Step 1: チャネル棚卸し

- source: apps/desktop/src/preload/channels.ts
- skillチャネル行数:
  - 26件
- 定義一覧（先頭20件）:
  175: SKILL_IMPORT: "skill:import",
  176: SKILL_REMOVE: "skill:remove",
  177: SKILL_GET_DETAIL: "skill:get-detail",
  178: SKILL_EXECUTE: "skill:execute",
  179: SKILL_STREAM: "skill:stream",
  180: SKILL_ABORT: "skill:abort",
  181: SKILL_GET_STATUS: "skill:get-status",
  184: SKILL_LIST: "skill:list",
  185: SKILL_SCAN: "skill:scan",
  186: SKILL_GET_IMPORTED: "skill:getImported",
  187: SKILL_UPDATE: "skill:update",
  188: SKILL_COMPLETE: "skill:complete",
  189: SKILL_ERROR: "skill:error",
  191: SKILL_PERMISSION_REQUEST: "skill:permission:request",
  192: SKILL_PERMISSION_RESPONSE: "skill:permission:response",
  195: SKILL_ANALYZE: "skill:analyze",
  196: SKILL_IMPROVE: "skill:improve",
  197: SKILL_OPTIMIZE: "skill:optimize",
  198: SKILL_OPTIMIZE_VARIANTS: "skill:optimize:variants",
  199: SKILL_OPTIMIZE_EVALUATE: "skill:optimize:evaluate",

## Step 2: 正本/タスク仕様との契約照合（重点差分）

- task-030 の `skill:detail` 記載:
  694:| ツール詳細取得 | `skill:detail` | `skillName: string` | DetailPanel 表示用 |
- task-030 の `skill:readMarkdown` 記載:
  695:| SKILL.md取得 | `skill:readMarkdown` | `skillName: string` | SkillMarkdownCollapse 表示用 |
- interfaces-agent-sdk-skill の `skill:get-detail` 記載:
  421:| `skill:get-detail` | Renderer → Main | スキル詳細取得 | `{ success: true, data: Skill } \| { success: false, error: string }` |
  470:| UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001 | skill:get-detail引数名ドリフト修正（P45: skillId→skillName統一） | 低 | `docs/30-workflows/unassigned-task/task-skill-getdetail-naming-drift.md` |

## Step 3: P45 ドリフト確認

- `skill:get-detail` 引数名候補（skillId/skillName）:
  421:| `skill:get-detail` | Renderer → Main | スキル詳細取得 | `{ success: true, data: Skill } \| { success: false, error: string }` |
  435:| 引数形式 | `skillName: string`（オブジェクトラップなし） |
  436:| 変換処理 | Mainハンドラー内部で `skillService.importSkills([skillName])` に配列化 |
  437:| バリデーション | `typeof skillName === "string"` かつ `skillName.trim() !== ""` |
  438:| エラー | `VALIDATION_ERROR` / `"skillName must be a non-empty string"` |
  444:| 引数形式 | `skillName: string`（オブジェクトラップなし） |
  445:| バリデーション | `typeof skillName === "string"` かつ `skillName.trim() !== ""` |
  446:| エラー | `VALIDATION_ERROR` / `"skillName must be a non-empty string"` |
  452:| 引数形式 | `skillName: string`（オブジェクトラップなし） |
  453:| バリデーション | `typeof skillName === "string"` かつ `skillName.trim() !== ""` |
  470:| UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001 | skill:get-detail引数名ドリフト修正（P45: skillId→skillName統一） | 低 | `docs/30-workflows/unassigned-task/task-skill-getdetail-naming-drift.md` |
  593:| `skillName` | `string` | ✓ | スキル名 |
  603:| `skillName` | `string` | ✓ | スキル名 |
  691:| `addImportedId` | `skillId: string` | `void` | スキルIDを追加（重複チェック付き） |
  692:| `removeImportedId` | `skillId: string` | `void` | スキルIDを削除 |
  694:| `hasImportedId` | `skillId: string` | `boolean` | 存在チェック |
  725:| addImport | `(skillName: string): void` | スキルをインポート |
  726:| removeImport | `(skillName: string): void` | スキルを削除（冪等） |
  727:| exists | `(skillName: string): boolean` | 存在確認 |
  728:| updateLastUsed | `(skillName: string): void` | 最終使用日時を更新 |
  734:| rememberPermission | `(skillName, toolName, decision): void` | 権限を記憶 |
  735:| getRememberedPermission | `(skillName, toolName): "allow" \| "deny" \| undefined` | 権限を取得 |
  789:| `importSkill` | `(skillName: string) => Promise<void>` | スキルインポート |
  790:| `removeSkill` | `(skillName: string) => Promise<void>` | スキル削除 |
  791:| `selectSkill` | `(skillName: string \| null) => void` | スキル選択 |
  954:| `readFile` | `(skillName: string, relativePath: string) => Promise<string>` | ファイル読み込み |
  955:| `writeFile` | `(skillName: string, relativePath: string, content: string) => Promise<void>` | ファイル書き込み |
  956:| `createFile` | `(skillName: string, relativePath: string, content: string) => Promise<void>` | ファイル作成 |
  957:| `deleteFile` | `(skillName: string, relativePath: string) => Promise<void>` | ファイル削除 |
  958:| `listBackups` | `(skillName: string) => Promise<BackupInfo[]>` | バックアップ一覧 |

## Step 4: 出力成果物突合

- OK: contract-diff-matrix.md ( 115 lines)
- OK: channel-ownership-table.md ( 166 lines)
