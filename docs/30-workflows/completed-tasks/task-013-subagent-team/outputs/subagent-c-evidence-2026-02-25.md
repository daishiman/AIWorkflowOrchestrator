# SubAgent-C 実行エビデンス (2026-02-25)

## Step 1: UI-Backend責務境界の参照確認

- task-030-ui-05-skill-center-view.md
  12:| 関連スライス | `agentSlice`（既存利用） |
  183: skill: Skill;
  262: skill: Skill;
  515:> Zustand スライスの設計原則は **TASK-UI-01 参照**。
  517:### 6.1 既存スライスの利用（agentSlice）
  519:SkillCenter は **新規スライスを作成しない**。既存 `agentSlice` のスキル管理機能をそのまま利用する。
  521:| agentSlice の状態/アクション | SkillCenter での用途 |
  683:AgentView は **一切変更しない**。SkillCenter は同じ `agentSlice` のデータを参照するため、データの整合性は自動的に保たれる。
  691:| ツール一覧取得 | `skill:list` | なし | 初期読み込み・リフレッシュ時 |
  692:| ツール追加 | `skill:import` | `skillName: string` | P44解決済み: string を直接渡す（ローカル用） |
  693:| ツール削除 | `skill:remove` | `skillName: string` | P44/P45解決済み: skillName に統一済み |
  694:| ツール詳細取得 | `skill:detail` | `skillName: string` | DetailPanel 表示用 |
  695:| SKILL.md取得 | `skill:readMarkdown` | `skillName: string` | SkillMarkdownCollapse 表示用 |
  696:| 外部ソースインポート | `skill:importFromSource` | `ShareTarget` | 外部ソースからのスキルインポート（TASK-9F追加） |
  697:| インポート元検証 | `skill:validateSource` | `ShareTarget` | インポート元の検証（TASK-9F追加） |
  698:| スキルエクスポート | `skill:export` | `{ skillName: string, destination: ShareTarget }` | スキルのエクスポート（TASK-9F追加） |
  730:| **P31** | agentSlice からは個別セレクタ使用（`useImportedSkills()`, `useSkillFilter()` 等） |
  759: └── (agentSlice を既存利用、新規スライス不要)
  855:| **P31** | agentSlice セレクタ | 個別セレクタ使用（`useImportedSkills()`, `useSkillFilter()` 等） |
  858:| **P44** | skill:import IPC 不整合 | 解決済み。現在は `string`（スキル名）を直接渡すパターン |
  929: -> IPC: skill:fork（バックエンド: task-9e 参照）
  978:| GitHub | リポジトリURL + ブランチ + パス | `skill:importFromSource` |
  979:| Gist | Gist ID | `skill:importFromSource` |
  980:| URL | SKILL.md の URL | `skill:importFromSource` |
  981:| ローカル | ディレクトリパス（ファイル選択UI） | `skill:importFromSource` |
  988: -> [検証] ボタン -> IPC: skill:validateSource -> プレビュー表示
  989: -> [インポート] ボタン -> IPC: skill:importFromSource -> 完了Toast
  1087: - `safeInvoke(IPC_CHANNELS.SKILL_DOCS_EXPORT, { docId, format, outputPath })`
  1105:`skill:export` IPC ハンドラの戻り値 `ExportResult`（task-9f 定義）を ExportSkillDialog の UI 表示に変換するロジック:
  1166: -> IPC: skill:docs:generate（バックエンド: task-9i 参照）
- task-031a-ui-05a-skill-editor-view.md
  13:| 関連スライス | `agentSlice`（既存利用） |
  183:| 保存ボタンクリック | `skill:writeFile` IPC 呼び出し（バックアップ自動作成） |
  251:| ファイル読み込み | `skill:readFile` | `skillName: string, relativePath: string` |
  252:| ファイル書き込み | `skill:writeFile` | `skillName: string, relativePath: string, content: string` |
  253:| ファイル作成 | `skill:createFile` | `skillName: string, relativePath: string, content: string` |
  254:| ファイル削除 | `skill:deleteFile` | `skillName: string, relativePath: string` |
  255:| バックアップ一覧 | `skill:listBackups` | `skillName: string` |
  256:| バックアップ復元 | `skill:restoreBackup` | `skillName: string, backupPath: string` |
  298:| **P31** | agentSlice からは個別セレクタ使用 |
  379:| **P31** | agentSlice セレクタ | 個別セレクタ使用 |
- task-031b-ui-05b-skill-advanced-views.md
  13:| 関連スライス | `agentSlice`（既存利用） |
  64:| ChainBuilder | `skill:chain:*` | [task-9d](./task-023e-task-9d-skill-chain.md) |
  65:| ScheduleManager | `skill:schedule:*` | [task-9g](./task-023a-task-9g-skill-schedule.md) |
  66:| DebugPanel | `skill:debug:*` | [task-9h](./task-023b-task-9h-skill-debug.md) |
  67:| Analytics | `skill:analytics:*` | [task-9j](./task-023d-task-9j-skill-analytics.md) |
  319:### skill:debug:event のイベント購読（P5 対策）
  321:DebugPanel は `skill:debug:event` チャネルを `safeOn` で購読し、デバッグイベント（ステップ実行、ブレークポイントヒット、変数変更等）をリアルタイムで受信する。
  325:P5（リスナー二重登録）を防止するため、`useEffect` のクリーンアップ関数でリスナーを解除する:
  329:useEffect(() => {
  330: // safeOn はクリーンアップ関数を返す
  331: const cleanup = window.electronAPI.skill.onDebugEvent((event: DebugEvent) => {
  350: return () => cleanup();
  356:1. **React StrictMode**: 開発環境では `useEffect` が2回実行される。`cleanup()` 関数で確実にリスナーを解除しないと、リスナーが二重登録される（P5 パターン）
  357:2. **safeOn の戻り値**: `safeOn` は解除関数（`() => void`）を返す。この戻り値を `useEffect` の return で呼び出す
  359:4. **Preload 側の定義**: `safeOn(IPC_CHANNELS.SKILL_DEBUG_EVENT, callback)` として実装。IPC_CHANNELS 定数を使用する（ハードコード文字列禁止 -- P27 対策）
  370: // 戻り値は解除関数（safeOn パターン）
  556:| **P31** | agentSlice からは個別セレクタ使用 |
  612:| **P31** | agentSlice セレクタ | 個別セレクタ使用 |

## Step 2: task-020a/020b/023b との境界照合キーワード

- task-020a-task-9b-skill-creator.md
- task-020b-task-9a-skill-editor.md
  27: - apps/desktop/src/main/services/skill/SkillFileManager.ts
  40:> - [TASK-9A-A: SkillFileManager](../completed-task/task-9a-a-file-manager.md) - バックアップ・リストア機能付きファイル管理
  75:### Step 1: SkillFileManager 実装
  82:// apps/desktop/src/main/services/skill/SkillFileManager.ts
  87:export class SkillFileManager {
  224:ipcMain.handle("skill:readFile", async (_, args: SkillReadFileArgs) => {
  245:ipcMain.handle("skill:writeFile", async (_, args: SkillWriteFileArgs) => {
  275:ipcMain.handle("skill:createFile", async (_, args: SkillCreateFileArgs) => {
  298:ipcMain.handle("skill:deleteFile", async (_, args: SkillDeleteFileArgs) => {
  318:ipcMain.handle("skill:listBackups", async (\_, args: SkillListBackupsArgs) => {
  329:ipcMain.handle(
  330: "skill:restoreBackup",
- task-023b-task-9h-skill-debug.md
  27: - apps/desktop/src/main/services/skill/SkillDebugger.ts
  53:- SkillDebugger サービス
  133:- `skill:debug:start` ハンドラの呼び出し前のデフォルト値として使用する
  136:### Step 2: SkillDebugger 実装
  138:**ファイル**: `apps/desktop/src/main/services/skill/SkillDebugger.ts`
  141:export class SkillDebugger {
  186:- `skill:debug:start` - デバッグセッション開始
  187:- `skill:debug:command` - デバッグコマンド実行
  188:- `skill:debug:breakpoint:add` - ブレークポイント追加
  189:- `skill:debug:breakpoint:remove` - ブレークポイント削除
  190:- `skill:debug:inspect` - 変数インスペクション
  191:- `skill:debug:evaluate` - 式評価
  195:- `skill:debug:event` - デバッグイベント通知（breakpoint hit, step completed等）
  251:pnpm --filter @repo/desktop test -- --grep "SkillDebugger"

## Step 3: 出力成果物突合

- OK: ui-props-dto-mapping.md ( 246 lines)
- OK: ui-layer-responsibility-table.md ( 196 lines)
