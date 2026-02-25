---
id: TASK-013C-UI-BOUNDARY-AUDIT
tier: 2
title: task-013C UI責務境界監査
phase: 1
depends_on: [TASK-013]
parallel_with: [TASK-013A-CONTRACT-AUDIT, TASK-013B-DATAFLOW-AUDIT]
blocks: [TASK-013D-SEQUENCE-REDESIGN]
status: completed
priority: high
estimated_complexity: small
tags: [docs, ui, dto, boundary]
---

# task-013C UI責務境界監査

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| タスクID   | TASK-013C-UI-BOUNDARY-AUDIT                        |
| 担当       | SubAgent-C                                         |
| ステータス | 完了                                               |
| 作成日     | 2026-02-25                                         |
| 依存       | TASK-013A-CONTRACT-AUDIT, TASK-013B-DATAFLOW-AUDIT |

## 実行タスク

- UI-05（task-030/031a/031b）と task-9 系（020b/023b）の責務境界を照合する。
- Props ↔ IPC DTO の対応表を作成し、P44/P45 ドリフト再発点を抽出する。
- Date/イベント購読（safeOn cleanup）/Zustand スライス責務の3観点を監査する。

## 実行手順

1. `.claude/skills/aiworkflow-requirements/indexes/resource-map.md` と `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md` で、UI/IPC/セキュリティの正本参照範囲を先に固定する。
2. task-030/031a/031b と task-020b/023b を突合し、Renderer/Preload/Main の責務分担をビュー別に抽出する。
3. `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` / `.claude/skills/aiworkflow-requirements/references/ipc-type-resolution-guide.md` を基準に Props ↔ DTO の境界型（Date/引数形式/イベント）を照合する。
4. `safeOn` 購読と cleanup パターン、Zustand agentSlice 利用境界を検証し、逸脱・注意項目を分類する。
5. `outputs/ui-props-dto-mapping.md` と `outputs/ui-layer-responsibility-table.md` を更新し、`.claude/skills/aiworkflow-requirements/references/lessons-learned.md` の再発防止観点を反映する。

## 1. 目的

UI仕様（task-030 SkillCenterView / task-031a SkillEditorView / task-031b SkillAdvancedViews）と Backend 仕様（task-9 系 IPC ハンドラ / サービス）の責務境界を監査し、Props-DTO のドリフト再発を防止する。具体的には以下を検証する:

1. **Renderer 層（UI）と Main 層（Backend）の責務が一方向依存（Renderer→Preload→Main）に準拠しているか**
2. **UI コンポーネントの Props 型と IPC ハンドラの DTO 型の対応関係が明確か**
3. **Date 型フィールドの IPC 境界変換方向が一貫しているか**
4. **safeInvoke/safeOn パターンのチャネル登録が IPC_CHANNELS 定数参照に統一されているか**
5. **Zustand agentSlice の状態がレイヤー責務に準拠しているか**

## 2. 入力資料

| 資料                             | パス                                                                              | 役割                                     |
| -------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------- |
| SkillCenterView UI 仕様          | `task-030-ui-05-skill-center-view.md`                                             | UI Props・IPC チャネル定義               |
| SkillEditorView UI 仕様          | `task-031a-ui-05a-skill-editor-view.md`                                           | エディター Props・IPC チャネル定義       |
| SkillAdvancedViews UI 仕様       | `task-031b-ui-05b-skill-advanced-views.md`                                        | 高度管理ビュー群 Props・IPC チャネル定義 |
| SkillFileManager Backend 仕様    | `task-020b-task-9a-skill-editor.md`                                               | ファイル操作 IPC ハンドラ引数・サービス  |
| SkillDebugger Backend 仕様       | `task-023b-task-9h-skill-debug.md`                                                | デバッグ IPC ハンドラ・DebugSession 型   |
| SkillCreator Backend 仕様        | `task-020a-task-9b-skill-creator.md`                                              | スキル作成サービス                       |
| Agent SDK UI インターフェース    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`    | Agent Execution 型・Zustand State        |
| Agent SDK Skill インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | Skill Dashboard 型・Preload API 契約     |
| Feature Components 仕様          | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | SkillEditor/SkillStreamDisplay UI 仕様   |
| IPC 契約チェックリスト           | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | 3層契約監査手順（P42/P44/P45）           |
| IPC 型解決ガイド                 | `.claude/skills/aiworkflow-requirements/references/ipc-type-resolution-guide.md`  | Date/引数/safeOn パターン解決            |

## 3. 出力成果物

| ファイル                                   | 内容                                                           |
| ------------------------------------------ | -------------------------------------------------------------- |
| `outputs/ui-props-dto-mapping.md`          | 全コンポーネント Props ↔ IPC DTO 対応表（Date 変換方向を含む） |
| `outputs/ui-layer-responsibility-table.md` | 各ビューの責務分担テーブル・境界逸脱分類                       |

## 4. 責務境界の原則

### 4.1 Electron 3 レイヤーモデルでの責務定義

```
Renderer (React UI)
  │ 責務: 表示、操作受付、UIステート管理（useState/Zustand）、イベント購読
  │ 禁止: ファイルI/O、外部API直接呼び出し、Node.js API使用
  ↓
Preload (contextBridge)
  │ 責務: safeInvoke/safeOn による安全なAPI公開、チャネルホワイトリスト制約
  │ 禁止: ビジネスロジック実行、状態保持
  ↓
Main (Node.js)
  │ 責務: IPCハンドラ、ビジネスロジック、ファイルI/O、外部サービス連携
  │ 禁止: UI状態管理、DOM操作
  ↓
External Services / File System
```

### 4.2 IPC 境界でのデータ変換ルール

| データ型           | Main 側             | IPC 境界                                    | Renderer 側                  |
| ------------------ | ------------------- | ------------------------------------------- | ---------------------------- |
| Date               | `Date` オブジェクト | ISO 8601 文字列（`"2026-02-25T09:00:00Z"`） | `new Date(isoString)` で復元 |
| 大規模オブジェクト | フルオブジェクト    | ID のみ渡す（docId パターン）               | ID で参照                    |
| エラー情報         | 内部エラー詳細      | サニタイズ済みメッセージ                    | ユーザー向けメッセージ       |
| 機密データ         | トークン・APIキー   | 渡さない（Main に留める）                   | 表示不要な情報は非送信       |

### 4.3 safeInvoke/safeOn チェックリスト

- [x] 全 IPC 呼び出しが `safeInvoke(IPC_CHANNELS.XXX, ...)` 形式を使用
- [x] 全イベント購読が `safeOn(IPC_CHANNELS.XXX, callback)` 形式を使用
- [x] ハードコード文字列チャネル名が存在しない（P27 対策）
- [x] `safeOn` の戻り値（クリーンアップ関数）が `useEffect` の return で呼び出される（P5 対策）
- [x] `useEffect` 依存配列にZustand合成Hookの戻り値を含めない（P31 対策）

## 5. ビュー別責務境界分析

### 5.1 SkillCenterView（task-030）

#### 責務分配

| 操作             | Renderer 責務                               | Preload 経由                                                          | Main 責務                              |
| ---------------- | ------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------- |
| ツール一覧表示   | agentSlice.skills → CardGrid レンダリング   | `safeInvoke(skill:list)`                                              | SkillService.scanSkills() → Skill[]    |
| ツール追加       | AddButton 状態遷移 + Toast 表示             | `safeInvoke(skill:import, skillName)`                                 | SkillService.importSkills([skillName]) |
| ツール削除       | 確認ダイアログ表示 + Toast                  | `safeInvoke(skill:remove, skillName)`                                 | SkillService.removeSkill(skillName)    |
| 詳細表示         | SkillDetailPanel スライドイン               | `safeInvoke(skill:get-detail, skillName)`                             | SkillService.getSkillByName(skillName) |
| SKILL.md表示     | SkillMarkdownCollapse 折りたたみ            | `safeInvoke(skill:readFile, { skillName, relativePath: "SKILL.md" })` | SkillFileManager.readFile()            |
| おすすめ選定     | useFeaturedSkills フック（Renderer 内完結） | なし                                                                  | なし                                   |
| カテゴリフィルタ | agentSlice.skillCategory 更新               | なし                                                                  | なし                                   |
| 検索フィルタ     | agentSlice.skillFilter 更新                 | なし                                                                  | なし                                   |

#### サブダイアログ（task-9 移管）

| ダイアログ                | Renderer 責務                 | IPC チャネル                                     | Main 責務                            |
| ------------------------- | ----------------------------- | ------------------------------------------------ | ------------------------------------ |
| ForkSkillDialog           | フォーム入力 + バリデーション | `skill:fork`                                     | SkillForkService.forkSkill()         |
| ImportSkillDialog（拡張） | ソースタブ切替 + フォーム入力 | `skill:importFromSource`, `skill:validateSource` | SkillShareService.importFromSource() |
| ExportSkillDialog         | エクスポート先選択 + 結果表示 | `skill:export`                                   | SkillShareService.exportSkill()      |
| GenerateDocsDialog        | 生成設定 + プログレス表示     | `skill:docs:generate`                            | SkillDocsService.generateDocs()      |
| DocPreview                | Markdown プレビュー + コピー  | `skill:docs:export`（docId パターン）            | SkillDocsService.exportDoc(docId)    |

#### DocPreview のデータフロー（docId パターン）

```
Renderer: onExport(doc.id, format, outputPath)
  → Preload: safeInvoke(SKILL_DOCS_EXPORT, { docId, format, outputPath })
    → Main: SkillDocsService.getDoc(docId) + exportToFile(doc, outputPath)
      → Renderer: ExportResult { success, shareUrl?, exportedFiles }
```

**境界判定**: docId のみを IPC 経由で渡し、Main 側で最新のドキュメントを取得してエクスポートする。Renderer 側は大きなオブジェクトを転送しない。✅ 責務境界準拠。

### 5.2 SkillEditorView（task-031a）

#### 責務分配

| 操作                     | Renderer 責務                                        | Preload 経由                                                         | Main 責務                                            |
| ------------------------ | ---------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------- |
| ファイルツリー表示       | FileTreePanel レンダリング                           | （初期ロード時に一覧取得）                                           | SkillFileManager.listFiles()                         |
| ファイル読み込み         | EditorPanel にコンテンツ表示                         | `safeInvoke(skill:readFile, { skillName, relativePath })`            | SkillFileManager.readFile()                          |
| ファイル書き込み         | 未保存マーカー管理 + Toast                           | `safeInvoke(skill:writeFile, { skillName, relativePath, content })`  | SkillFileManager.writeFile()（バックアップ自動作成） |
| ファイル作成             | フォーム入力 + バリデーション                        | `safeInvoke(skill:createFile, { skillName, relativePath, content })` | SkillFileManager.createFile()                        |
| ファイル削除             | 確認ダイアログ                                       | `safeInvoke(skill:deleteFile, { skillName, relativePath })`          | SkillFileManager.deleteFile()                        |
| バックアップ一覧         | BackupMenu ドロップダウン                            | `safeInvoke(skill:listBackups, { skillName })`                       | SkillFileManager.listBackups()                       |
| バックアップ復元         | 確認ダイアログ                                       | `safeInvoke(skill:restoreBackup, { skillName, backupPath })`         | SkillFileManager.restoreBackup()                     |
| 未保存変更検出           | useUnsavedWarning フック（Renderer 内完結）          | なし                                                                 | なし                                                 |
| キーボードショートカット | Cmd+S / Ctrl+S ハンドリング（Renderer 内完結）       | なし                                                                 | なし                                                 |
| 読み取り専用判定         | isReadOnly Props に基づく UI 制御（Renderer 内完結） | なし                                                                 | なし                                                 |

#### IPC 引数形式の検証

| IPC チャネル          | task-031a 定義                                             | task-020b 定義                                             | 整合性  |
| --------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- | ------- |
| `skill:readFile`      | `skillName: string, relativePath: string`                  | `SkillReadFileArgs { skillName, relativePath }`            | ✅ 一致 |
| `skill:writeFile`     | `skillName: string, relativePath: string, content: string` | `SkillWriteFileArgs { skillName, relativePath, content }`  | ✅ 一致 |
| `skill:createFile`    | `skillName: string, relativePath: string, content: string` | `SkillCreateFileArgs { skillName, relativePath, content }` | ✅ 一致 |
| `skill:deleteFile`    | `skillName: string, relativePath: string`                  | `SkillDeleteFileArgs { skillName, relativePath }`          | ✅ 一致 |
| `skill:listBackups`   | `skillName: string`                                        | `SkillListBackupsArgs { skillName }`                       | ✅ 一致 |
| `skill:restoreBackup` | `skillName: string, backupPath: string`                    | `SkillRestoreBackupArgs { skillName, backupPath }`         | ✅ 一致 |

### 5.3 SkillAdvancedViews（task-031b）

#### 5.3.1 SkillChainBuilder

| 操作             | Renderer 責務                               | IPC チャネル               | Main 責務                        |
| ---------------- | ------------------------------------------- | -------------------------- | -------------------------------- |
| チェーン一覧表示 | ChainCardGrid レンダリング                  | `skill:chain:list`         | SkillChainService.listChains()   |
| チェーン作成     | CreateChainDialog フォーム                  | `skill:chain:save`         | SkillChainService.saveChain()    |
| チェーン編集     | StepCard ドラッグ&ドロップ、StepEditor 設定 | `skill:chain:save`         | SkillChainService.saveChain()    |
| チェーン実行     | ステップ進行ビジュアル表示                  | `skill:chain:execute`      | SkillChainService.executeChain() |
| ステップ実行状態 | ボーダーパルスアニメーション                | `skill:chain:execute` 応答 | 実行結果に応じてUI更新           |

#### 5.3.2 ScheduleManager

| 操作             | Renderer 責務                       | IPC チャネル            | Main 責務                             |
| ---------------- | ----------------------------------- | ----------------------- | ------------------------------------- |
| スケジュール一覧 | ScheduleTable レンダリング          | `skill:schedule:list`   | SkillScheduleService.listSchedules()  |
| スケジュール作成 | ScheduleDialog + CronEditor         | `skill:schedule:add`    | SkillScheduleService.addSchedule()    |
| ON/OFF トグル    | UI 即時反映                         | `skill:schedule:toggle` | SkillScheduleService.toggleSchedule() |
| 実行履歴表示     | RunHistoryList レンダリング         | `skill:schedule:list`   | SkillScheduleService.listSchedules()  |
| 次回実行計算     | Renderer 内の Cron 解析（表示のみ） | なし                    | Main 側でも実際のスケジュール管理     |

#### 5.3.3 DebugPanel

| 操作                 | Renderer 責務                              | IPC チャネル                    | Main 責務                           |
| -------------------- | ------------------------------------------ | ------------------------------- | ----------------------------------- |
| デバッグ開始         | StartDebugDialog                           | `skill:debug:start`             | SkillDebugger.startSession()        |
| デバッグコマンド     | DebugControls ボタン操作                   | `skill:debug:command`           | DebugSession.executeCommand()       |
| ブレークポイント追加 | BreakpointEditor UI                        | `skill:debug:breakpoint:add`    | DebugSession.addBreakpoint()        |
| ブレークポイント削除 | チェックボックストグル                     | `skill:debug:breakpoint:remove` | DebugSession.removeBreakpoint()     |
| 変数インスペクト     | VariableWatch 表示                         | `skill:debug:inspect`           | DebugSession.inspectVariable()      |
| 式評価               | 式入力フォーム                             | `skill:debug:evaluate`          | DebugSession.evaluateExpression()   |
| イベント購読         | `safeOn` でリアルタイム更新（P5 対策済み） | `skill:debug:event`（M→R）      | Main から DebugEvent をプッシュ通知 |

#### DebugEvent イベント購読のレイヤー責務

```typescript
// Renderer 側: イベント受信 → UI ステート更新（Renderer 内完結）
useEffect(() => {
  const cleanup = window.electronAPI.skill.onDebugEvent((event: DebugEvent) => {
    switch (event.type) {
      case "step":
        setCurrentStep(event.step);
        break;
      case "breakpoint-hit":
        setSessionStatus("paused");
        break;
      case "variable-changed":
        setVariables((prev) => ({ ...prev, [event.path]: event.value }));
        break;
      case "session-ended":
        setSessionStatus(event.error ? "error" : "completed");
        break;
    }
  });
  return () => cleanup(); // P5 対策: StrictMode 二重実行防止
}, []);
```

**境界判定**: Main 側が DebugEvent を生成・プッシュし、Renderer 側はイベントを受信して UI ステートを更新するのみ。ビジネスロジック（デバッグ実行判断）は Main 側に留まる。✅ 責務境界準拠。

#### 5.3.4 AnalyticsDashboard

| 操作                  | Renderer 責務                               | IPC チャネル                 | Main 責務                             |
| --------------------- | ------------------------------------------- | ---------------------------- | ------------------------------------- |
| サマリー表示          | SummaryCards + カウントアップアニメーション | `skill:analytics:summary`    | SkillAnalyticsService.getSummary()    |
| トレンドチャート      | UsageChart（recharts）レンダリング          | `skill:analytics:trend`      | SkillAnalyticsService.getTrend()      |
| ランキング表示        | SkillRanking バーチャート                   | `skill:analytics:statistics` | SkillAnalyticsService.getStatistics() |
| 期間フィルタ          | PeriodSelector 切替                         | パラメータとして IPC に渡す  | 期間に基づくデータ集計                |
| CSV/JSON エクスポート | ExportButton → ファイル保存ダイアログ       | `skill:analytics:export`     | 集計データのファイル出力              |

## 6. 境界逸脱・注意項目

### 6.1 検出された境界考慮事項

| #   | 項目                                 | ビュー          | 内容                                                                                                                                | 分類     | 対処方針                                                                               |
| --- | ------------------------------------ | --------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------- |
| 1   | Date 型の IPC 変換                   | DebugPanel      | DebugSession.startedAt は Main 側で Date、IPC 経由では ISO 8601 文字列。Renderer 側で `new Date()` 復元が必要                       | 仕様明記 | task-031b のDebugPanel仕様に Date 復元パターンを明記                                   |
| 2   | ScheduleManager の Cron 解析         | ScheduleManager | Renderer 側で次回実行時刻を表示するために Cron 式を解析する。これは表示専用の計算であり、実際のスケジュール実行判定は Main 側で行う | 許容範囲 | 表示専用計算は Renderer 責務として許容。ただし Main 側の実行判定ロジックとの乖離に注意 |
| 3   | DocPreview の docId パターン         | SkillCenterView | GeneratedDoc 全体ではなく docId のみを IPC 経由で渡す設計。Renderer 側のキャッシュ不整合リスク排除                                  | 正常     | docId パターンは責務境界に準拠                                                         |
| 4   | おすすめスキル選定                   | SkillCenterView | useFeaturedSkills フックが Renderer 内でソート・フィルタリングを実行。表示順の決定はUI責務として許容                                | 許容範囲 | 将来的にレコメンドエンジンを Main 側に移行する場合は IPC 経由に変更                    |
| 5   | 未保存変更検出                       | SkillEditorView | useUnsavedWarning フックが Renderer 内で変更検出。エディターの差分比較は UI 責務                                                    | 正常     | Renderer 内完結で問題なし                                                              |
| 6   | SkillRunResult.startedAt/completedAt | Analytics       | SkillRunResult 型の Date フィールドが IPC 経由で ISO 8601 文字列として渡される                                                      | 仕様明記 | ui-ux-feature-components.md の Date 変換方向を明記                                     |

### 6.2 P44/P45 解決済み項目の確認

| Pitfall | 対象                                     | 現状                                                                  |
| ------- | ---------------------------------------- | --------------------------------------------------------------------- |
| P44     | skill:import / skill:remove IPC 引数形式 | ✅ 解決済み: string を直接渡す形式に統一                              |
| P45     | skill:get-detail の引数命名ドリフト      | ⚠️ 未解消: AUDIT-003（UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001）で追跡 |
| P42     | 文字列引数の .trim() バリデーション      | ✅ 全ハンドラで3段バリデーション適用済み                              |

## 7. Zustand agentSlice 統合ポイント

### 7.1 SkillCenterView での agentSlice 利用

| agentSlice 状態/アクション | SkillCenter での用途 | 取得方法（P31 対策）           |
| -------------------------- | -------------------- | ------------------------------ |
| `skills`                   | ツール一覧表示       | `useSkills()` 個別セレクタ     |
| `availableSkillsMetadata`  | カード詳細情報表示   | `useAvailableSkillsMetadata()` |
| `importedSkills`           | 追加済み判定         | `useImportedSkills()`          |
| `isLoadingSkills`          | スケルトン表示       | `useIsLoadingSkills()`         |
| `skillFilter`              | 検索キーワード       | `useSkillFilter()`             |
| `skillCategory`            | カテゴリフィルター   | `useSkillCategory()`           |
| `fetchSkills()`            | 初期読み込み         | `useFetchSkills()`             |
| `importSkill()`            | ツール追加           | `useImportSkill()`             |
| `removeSkill()`            | ツール削除           | `useRemoveSkill()`             |

### 7.2 新規スライス不要の根拠

SkillCenterView / SkillEditorView / SkillAdvancedViews の全ビューは、既存の agentSlice のスキル管理機能をそのまま利用する。画面固有の状態（DetailPanel の開閉、削除確認ダイアログ等）は `useState` でコンポーネントローカルに管理する。

## 8. データフロー図

### 8.1 ツール追加フロー（SkillCenterView）

```
[SkillCard] AddButton.onAdd()
  → [useImportSkill()] agentSlice アクション
    → [Preload] safeInvoke(IPC_CHANNELS.SKILL_IMPORT, skillName)
      → [Main] skill-handler.ts IPC ハンドラ
        → [Main] SkillService.importSkills([skillName])
          → [FS] スキルファイルコピー
        ← ImportedSkill
      ← ImportedSkill
    ← agentSlice.importedSkills 更新
  ← AddButton: スピナー → ✓ モーフィング → "追加済み!"
```

### 8.2 ファイル編集フロー（SkillEditorView）

```
[EditorPanel] onChange(value)
  → [useSkillEditor] ローカル状態更新（未保存マーカー表示）
  → [EditorToolBar] onSave() / Cmd+S
    → [Preload] safeInvoke(IPC_CHANNELS.SKILL_WRITE_FILE, { skillName, relativePath, content })
      → [Main] skill-handler.ts IPC ハンドラ
        → [Main] SkillFileManager.writeFile()（バックアップ自動作成）
          → [FS] ファイル書き込み + バックアップファイル作成
        ← { success: true }
      ← 成功レスポンス
    ← Toast "保存しました" + 未保存マーカー消去
```

### 8.3 デバッグイベントフロー（DebugPanel）

```
[DebugPanel] マウント時
  → [useDebugSession] useEffect 内で safeOn 登録（P5 対策: cleanup 関数保持）

[Main] DebugSession 実行中
  → [Main] DebugEvent { type: "step", step: {...} } 生成
    → [IPC] skill:debug:event チャネルで M→R プッシュ
      → [Preload] safeOn コールバック実行
        → [Renderer] setCurrentStep(event.step) ← UI ステート更新のみ
```

## 9. 完了条件

- [x] 全3ビュー（SkillCenter / SkillEditor / AdvancedViews）の Props-DTO 対応表が作成されている
- [x] 各ビューの責務分配が Renderer / Preload / Main で明示されている
- [x] Date 型フィールドの IPC 境界変換方向が文書化されている
- [x] safeInvoke/safeOn パターンの準拠確認（P5/P27/P31 対策）が完了している
- [x] 境界逸脱・注意項目が「正常/許容範囲/仕様明記」に分類されている
- [x] Zustand agentSlice 統合ポイントが P31 対策（個別セレクタ）と共に文書化されている
- [x] データフロー図（3パターン）が作成されている

## 10. 参照資料

| 参照資料               | パス                                                                                        | 内容                    |
| ---------------------- | ------------------------------------------------------------------------------------------- | ----------------------- |
| Skill UI 契約          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`              | Renderer 側契約の正本   |
| Skill IPC 契約         | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | API/DTO 契約の正本      |
| UI 機能仕様            | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | UI 責務の参照元         |
| IPC API 仕様           | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | IPC チャネル契約の正本  |
| IPC セキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC セキュリティ原則    |
| Skill IPC セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | Skill IPC 固有の検証    |
| 実装パターン           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | S19/S21/P31 の適用基準  |
| IPC 契約チェック       | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | 3層整合チェック手順     |
| IPC 型解決ガイド       | `.claude/skills/aiworkflow-requirements/references/ipc-type-resolution-guide.md`            | Date/引数/safeOn 解決   |
| 正本: 早見表           | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                         | IPC/型/UIのクイック参照 |
| 正本: リソースマップ   | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                            | 必要仕様の抽出起点      |
| 正本: 教訓集           | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 再発防止パターン        |
