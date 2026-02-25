# UI Props - IPC DTO マッピング対応表

> 生成元: task-013C UI責務境界監査
> 対象仕様: task-030（SkillCenterView）, task-031a（SkillEditorView）, task-031b（SkillAdvancedViews）
> Backend仕様: task-020b（task-9a）, task-023b（task-9h）, task-020a（task-9b）
> 参照: `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`, `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`

---

## 1. SkillCenterView（task-030）

### 1.1 FeaturedCardProps

| Props フィールド | 型                            | IPC DTO 対応                        | IPC チャネル        | 変換処理                                       |
| ---------------- | ----------------------------- | ----------------------------------- | ------------------- | ---------------------------------------------- |
| `skill`          | `Skill`                       | `Skill`（agentSlice 経由）          | `skill:list`        | なし（agentSlice から直接取得）                |
| `isAdded`        | `boolean`                     | `importedSkills: string[]` から導出 | `skill:getImported` | `importedSkills.includes(skill.name)`          |
| `onAdd`          | `(skillName: string) => void` | → `skillName: string`               | `skill:import`      | Preload: `safeInvoke(SKILL_IMPORT, skillName)` |
| `onSelect`       | `(skillName: string) => void` | UI 内完結（DetailPanel 表示）       | なし                | ローカル状態更新のみ                           |
| `staggerIndex`   | `number`                      | UI 内完結（アニメーション用）       | なし                | レンダリング時にインデックス付与               |

### 1.2 SkillCardProps

| Props フィールド | 型                            | IPC DTO 対応                        | IPC チャネル        | 変換処理                              |
| ---------------- | ----------------------------- | ----------------------------------- | ------------------- | ------------------------------------- |
| `skill`          | `Skill`                       | `Skill`（agentSlice 経由）          | `skill:list`        | なし                                  |
| `isAdded`        | `boolean`                     | `importedSkills: string[]` から導出 | `skill:getImported` | `importedSkills.includes(skill.name)` |
| `onAdd`          | `(skillName: string) => void` | → `skillName: string`               | `skill:import`      | P42準拠3段バリデーション              |
| `onSelect`       | `(skillName: string) => void` | UI 内完結                           | なし                | ローカル状態更新のみ                  |

### 1.3 AddButtonProps

| Props フィールド | 型                        | IPC DTO 対応                            | 変換処理 |
| ---------------- | ------------------------- | --------------------------------------- | -------- |
| `isAdded`        | `boolean`                 | agentSlice 導出値                       | なし     |
| `isProcessing`   | `boolean`                 | UI ローカル状態（IPC 呼び出し中フラグ） | なし     |
| `onAdd`          | `() => void`              | 親コンポーネントから委譲                | なし     |
| `size`           | `"default" \| "featured"` | UI 内完結                               | なし     |

### 1.4 ForkSkillDialogProps（task-9e 移管）

| Props フィールド  | 型                               | IPC DTO 対応                | IPC チャネル | 変換処理               |
| ----------------- | -------------------------------- | --------------------------- | ------------ | ---------------------- |
| `isOpen`          | `boolean`                        | UI 内完結                   | なし         | なし                   |
| `onClose`         | `() => void`                     | UI 内完結                   | なし         | なし                   |
| `sourceSkillName` | `string`                         | → `sourceSkillName: string` | `skill:fork` | 引数としてそのまま渡す |
| `onForkComplete`  | `(newSkillName: string) => void` | ← `ForkResult.newSkillName` | `skill:fork` | レスポンスから抽出     |

### 1.5 ExportSkillDialogProps（task-9f 移管）

| Props フィールド   | 型                            | IPC DTO 対応                                | IPC チャネル   | 変換処理                                       |
| ------------------ | ----------------------------- | ------------------------------------------- | -------------- | ---------------------------------------------- |
| `isOpen`           | `boolean`                     | UI 内完結                                   | なし           | なし                                           |
| `onClose`          | `() => void`                  | UI 内完結                                   | なし           | なし                                           |
| `skillName`        | `string`                      | → `{ skillName, destination: ShareTarget }` | `skill:export` | オブジェクト形式に変換                         |
| `onExportComplete` | `(shareUrl?: string) => void` | ← `ExportResult.shareUrl`                   | `skill:export` | `result.success ? result.shareUrl : undefined` |

### 1.6 DocPreviewProps（task-9i 移管）

| Props フィールド | 型                                    | IPC DTO 対応                      | IPC チャネル          | 変換処理                                         |
| ---------------- | ------------------------------------- | --------------------------------- | --------------------- | ------------------------------------------------ |
| `doc`            | `GeneratedDoc \| null`                | ← `GeneratedDoc`                  | `skill:docs:generate` | レスポンスをそのまま保持                         |
| `isLoading`      | `boolean`                             | UI ローカル状態                   | なし                  | なし                                             |
| `onExport`       | `(docId, format, outputPath) => void` | → `{ docId, format, outputPath }` | `skill:docs:export`   | **docId パターン**: doc 全体ではなく ID のみ送信 |
| `onCopy`         | `() => void`                          | UI 内完結（クリップボード API）   | なし                  | なし                                             |
| `onClose`        | `() => void`                          | UI 内完結                         | なし                  | なし                                             |

---

## 2. SkillEditorView（task-031a）

### 2.1 SkillEditorViewProps

| Props フィールド | 型           | IPC DTO 対応                              | 変換処理                 |
| ---------------- | ------------ | ----------------------------------------- | ------------------------ |
| `skillName`      | `string`     | 全 IPC チャネルの第1引数                  | そのまま渡す             |
| `isReadOnly`     | `boolean`    | UI 側で判定（`~/.claude/skills/` → true） | パス判定はRendererで実施 |
| `onClose`        | `() => void` | UI 内完結                                 | なし                     |

### 2.2 FileTreePanelProps

| Props フィールド | 型                       | IPC DTO 対応                    | IPC チャネル     | 変換処理                                      |
| ---------------- | ------------------------ | ------------------------------- | ---------------- | --------------------------------------------- |
| `skillName`      | `string`                 | IPC 引数                        | -                | なし                                          |
| `fileTree`       | `FileNode[]`             | ← ファイルシステムから構築      | 初期ロード時     | Main がディレクトリ走査→FileNode ツリーに変換 |
| `selectedFile`   | `string`                 | UI ローカル状態                 | なし             | なし                                          |
| `unsavedFiles`   | `Set<string>`            | UI ローカル状態（変更検出）     | なし             | なし                                          |
| `onSelectFile`   | `(path: string) => void` | → `{ skillName, relativePath }` | `skill:readFile` | パスを relativePath として送信                |

### 2.3 EditorPanelProps

| Props フィールド | 型                        | IPC DTO 対応                          | IPC チャネル     | 変換処理                                     |
| ---------------- | ------------------------- | ------------------------------------- | ---------------- | -------------------------------------------- |
| `content`        | `string`                  | ← `ReadFileResult.content`            | `skill:readFile` | レスポンスの content フィールドを抽出        |
| `language`       | `string`                  | UI 側でファイル拡張子から決定         | なし             | `.md` → `"markdown"`, `.ts` → `"typescript"` |
| `isLoading`      | `boolean`                 | UI ローカル状態（IPC 呼び出し中）     | なし             | なし                                         |
| `isReadOnly`     | `boolean`                 | 親から Props 伝播                     | なし             | なし                                         |
| `onChange`       | `(value: string) => void` | UI ローカル状態更新（未保存マーカー） | なし             | なし                                         |

### 2.4 EditorToolBarProps

| Props フィールド | 型           | IPC DTO 対応                             | IPC チャネル        | 変換処理                               |
| ---------------- | ------------ | ---------------------------------------- | ------------------- | -------------------------------------- |
| `selectedFile`   | `string`     | 表示用（ファイル名）                     | なし                | なし                                   |
| `hasChanges`     | `boolean`    | UI ローカル状態                          | なし                | なし                                   |
| `isSaving`       | `boolean`    | UI ローカル状態（IPC 呼び出し中）        | なし                | なし                                   |
| `isReadOnly`     | `boolean`    | 親から Props 伝播                        | なし                | なし                                   |
| `onSave`         | `() => void` | → `{ skillName, relativePath, content }` | `skill:writeFile`   | 現在の編集内容をオブジェクト形式で送信 |
| `onClose`        | `() => void` | UI 内完結                                | なし                | なし                                   |
| `onOpenBackups`  | `() => void` | → `{ skillName }`                        | `skill:listBackups` | バックアップ一覧を取得                 |

---

## 3. SkillAdvancedViews（task-031b）

### 3.1 StepCardProps（ChainBuilder）

| Props フィールド | 型               | IPC DTO 対応                                  | 変換処理                             |
| ---------------- | ---------------- | --------------------------------------------- | ------------------------------------ |
| `step`           | `SkillChainStep` | ← `ChainDefinition.steps[i]`                  | チェーン定義から個別ステップを分割   |
| `index`          | `number`         | UI 側でインデックス付与                       | なし                                 |
| `isActive`       | `boolean`        | UI ローカル状態（選択中）                     | なし                                 |
| `isExecuting`    | `boolean`        | ← `skill:chain:execute` の実行状態から導出    | 実行中ステータスをローカル状態で保持 |
| `onSelect`       | `() => void`     | UI 内完結                                     | なし                                 |
| `onRemove`       | `() => void`     | UI 内完結（チェーン定義から除去→保存時にIPC） | なし                                 |

### 3.2 StepEditorProps（ChainBuilder）

| Props フィールド  | 型                               | IPC DTO 対応                        | 変換処理                         |
| ----------------- | -------------------------------- | ----------------------------------- | -------------------------------- |
| `step`            | `SkillChainStep`                 | `ChainDefinition.steps[i]` の一部   | なし                             |
| `availableSkills` | `Skill[]`                        | ← `skill:list`                      | agentSlice.skills をそのまま参照 |
| `previousOutputs` | `string[]`                       | UI 側で前ステップの出力変数名を収集 | Renderer 内完結                  |
| `onChange`        | `(step: SkillChainStep) => void` | UI ローカル状態更新（保存時にIPC）  | なし                             |

### 3.3 DebugControlsProps（DebugPanel）

| Props フィールド | 型                                                          | IPC DTO 対応                | IPC チャネル              | 変換処理                  |
| ---------------- | ----------------------------------------------------------- | --------------------------- | ------------------------- | ------------------------- |
| `sessionStatus`  | `"idle" \| "running" \| "paused" \| "completed" \| "error"` | ← `DebugSession.status`     | `skill:debug:event` (M→R) | DebugEvent から状態を導出 |
| `onContinue`     | `() => void`                                                | → `{ command: "continue" }` | `skill:debug:command`     | コマンド文字列に変換      |
| `onStepOver`     | `() => void`                                                | → `{ command: "stepOver" }` | `skill:debug:command`     | コマンド文字列に変換      |
| `onStepInto`     | `() => void`                                                | → `{ command: "stepInto" }` | `skill:debug:command`     | コマンド文字列に変換      |
| `onStepOut`      | `() => void`                                                | → `{ command: "stepOut" }`  | `skill:debug:command`     | コマンド文字列に変換      |
| `onPause`        | `() => void`                                                | → `{ command: "pause" }`    | `skill:debug:command`     | コマンド文字列に変換      |
| `onStop`         | `() => void`                                                | → `{ command: "stop" }`     | `skill:debug:command`     | コマンド文字列に変換      |

### 3.4 CronEditorProps（ScheduleManager）

| Props フィールド | 型                       | IPC DTO 対応                          | 変換処理 |
| ---------------- | ------------------------ | ------------------------------------- | -------- |
| `value`          | `string`                 | ← `ScheduleDefinition.cronExpression` | なし     |
| `onChange`       | `(cron: string) => void` | UI ローカル状態更新（保存時にIPC）    | なし     |

### 3.5 SummaryCardProps（AnalyticsDashboard）

| Props フィールド | 型                                  | IPC DTO 対応                              | IPC チャネル              | 変換処理               |
| ---------------- | ----------------------------------- | ----------------------------------------- | ------------------------- | ---------------------- |
| `title`          | `string`                            | UI 側で固定文字列（「総実行回数」等）     | なし                      | なし                   |
| `value`          | `string \| number`                  | ← `AnalyticsSummary` の各フィールド       | `skill:analytics:summary` | フィールド抽出         |
| `unit`           | `string?`                           | UI 側で固定文字列（「回」「%」「秒」）    | なし                      | なし                   |
| `trend`          | `{ direction, percentage, label }?` | ← `AnalyticsSummary` の比較データから導出 | `skill:analytics:summary` | 前期比の計算は Main 側 |
| `icon`           | `LucideIcon`                        | UI 側で固定（カテゴリ対応）               | なし                      | なし                   |

### 3.6 UsageChartProps（AnalyticsDashboard）

| Props フィールド | 型                                     | IPC DTO 対応                | IPC チャネル            | 変換処理                         |
| ---------------- | -------------------------------------- | --------------------------- | ----------------------- | -------------------------------- |
| `data`           | `TrendDataPoint[]`                     | ← `TrendData.points`        | `skill:analytics:trend` | レスポンスから points 配列を抽出 |
| `granularity`    | `"hour" \| "day" \| "week" \| "month"` | → IPC リクエストパラメータ  | `skill:analytics:trend` | クエリパラメータとして送信       |
| `height`         | `number?`                              | UI 内完結（レイアウト設定） | なし                    | なし                             |

### 3.7 SkillRankingProps（AnalyticsDashboard）

| Props フィールド | 型                  | IPC DTO 対応                | IPC チャネル                 | 変換処理                         |
| ---------------- | ------------------- | --------------------------- | ---------------------------- | -------------------------------- |
| `skills`         | `SkillStatistics[]` | ← `StatisticsResult.skills` | `skill:analytics:statistics` | レスポンスから skills 配列を抽出 |
| `maxItems`       | `number?`           | UI 内完結（表示件数制限）   | なし                         | なし                             |

---

## 4. Date フィールド変換方向一覧

| 型 / フィールド                | Main 側の型 | IPC 境界        | Renderer 復元                    |
| ------------------------------ | ----------- | --------------- | -------------------------------- |
| `Skill.lastModified`           | `Date`      | ISO 8601 文字列 | `new Date(skill.lastModified)`   |
| `SkillRunResult.startedAt`     | `Date`      | ISO 8601 文字列 | `new Date(result.startedAt)`     |
| `SkillRunResult.completedAt`   | `Date`      | ISO 8601 文字列 | `new Date(result.completedAt)`   |
| `DebugSession.startedAt`       | `Date`      | ISO 8601 文字列 | `new Date(session.startedAt)`    |
| `AgentMessage.timestamp`       | `Date`      | ISO 8601 文字列 | `new Date(message.timestamp)`    |
| `BackupEntry.createdAt`        | `Date`      | ISO 8601 文字列 | `new Date(backup.createdAt)`     |
| `ScheduleExecution.executedAt` | `Date`      | ISO 8601 文字列 | `new Date(execution.executedAt)` |
| `ScheduleDefinition.nextRunAt` | `Date`      | ISO 8601 文字列 | `new Date(schedule.nextRunAt)`   |

**ルール**: Main Process で `Date` オブジェクトとして扱われる全フィールドは、IPC 経由で自動的に ISO 8601 文字列にシリアライズされる。Renderer 側では `new Date(isoString)` で復元する。

---

## 5. IPC レスポンス形式の分類

### 5.1 直接型返却（OperationResult 非使用）

P44/P45 解決後、以下のチャネルは直接型を返却する:

| IPC チャネル          | 戻り値型           | 備考                                           |
| --------------------- | ------------------ | ---------------------------------------------- |
| `skill:import`        | `ImportedSkill`    | UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 で修正済み |
| `skill:remove`        | `RemoveResult`     | P44/P45 解決済み                               |
| `skill:readFile`      | `ReadFileResult`   | task-9a 定義                                   |
| `skill:writeFile`     | `WriteFileResult`  | task-9a 定義                                   |
| `skill:createFile`    | `CreateFileResult` | task-9a 定義                                   |
| `skill:deleteFile`    | `DeleteFileResult` | task-9a 定義                                   |
| `skill:listBackups`   | `BackupEntry[]`    | task-9a 定義                                   |
| `skill:restoreBackup` | `RestoreResult`    | task-9a 定義                                   |

### 5.2 OperationResult ラッパー使用

以下のチャネルは `{ success: boolean, data?: T, error?: string }` 形式:

| IPC チャネル        | 戻り値型                              | 備考         |
| ------------------- | ------------------------------------- | ------------ |
| `skill:list`        | `{ success, data: SkillMetadata[] }`  | 既存パターン |
| `skill:getImported` | `{ success, data: ImportedSkill[] }`  | 既存パターン |
| `skill:get-detail`  | `{ success, data: Skill }`            | 既存パターン |
| `skill:analyze`     | `OperationResult<SkillAnalysis>`      | task-9c 定義 |
| `skill:improve`     | `OperationResult<ImprovementResult>`  | task-9c 定義 |
| `skill:optimize`    | `OperationResult<OptimizationResult>` | task-9c 定義 |

### 5.3 Preload 側の取り扱い

- **直接型チャネル**: `safeInvoke` → 直接型 `T` を返却
- **OperationResult チャネル**: `safeInvokeUnwrap<T>` → `T` を抽出して返却（エラー時は例外スロー）

---

## 6. 整合性検証結果サマリー

| 検証項目                                       | 結果                    | 詳細                                                        |
| ---------------------------------------------- | ----------------------- | ----------------------------------------------------------- |
| SkillCenterView Props ↔ IPC                    | ✅ PASS                 | 全 Props が agentSlice 経由または IPC DTO と正しく対応      |
| SkillEditorView Props ↔ IPC                    | ✅ PASS                 | 6チャネル全てで引数形式が task-020b と一致                  |
| DebugPanel sessionStatus ↔ DebugSession.status | ✅ PASS                 | 値セット（idle/running/paused/completed/error）が一致       |
| Debug Event Payload ↔ DebugEvent 型            | ✅ PASS                 | task-031b と task-023b で一致                               |
| DocPreview onExport ↔ skill:docs:export        | ✅ PASS                 | docId パターン準拠                                          |
| Date フィールド変換方向                        | ✅ PASS（仕様明記推奨） | 全8フィールドで ISO 8601 変換方向が一貫                     |
| P44/P45 解決済み確認                           | ✅ PASS                 | skill:import/remove は string 直接渡し + skillName 命名統一 |
