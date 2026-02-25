# UI Layer Responsibility Table

> task-013c UI責務境界監査の成果物 3/3
> 作成日: 2026-02-25
> 正本参照: `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`, `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`

---

## 1. 全体責務定義（Electron 3プロセスモデル）

| 層       | 責務                                                                   | 非責務                                               |
| -------- | ---------------------------------------------------------------------- | ---------------------------------------------------- |
| Renderer | 表示、操作受付、イベント購読（safeOn）、UI状態管理（Zustand/useState） | 永続化ロジック、ファイルI/O本体、Node.js API呼び出し |
| Preload  | 安全なAPI公開（contextBridge）、チャネルホワイトリスト制約             | 業務ロジック、データ変換、UI状態管理                 |
| Main     | IPCハンドラ、業務ロジック、データ変換、ファイルI/O、外部サービス連携   | UI状態管理、DOM操作                                  |

---

## 2. SkillCenterView（task-030 / UI-05）責務分担

### 2-1. 機能別責務テーブル

| 機能               | Renderer                                                      | Preload                                                                                             | Main                                                           |
| ------------------ | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| スキル一覧表示     | fetchSkills()→agentSlice更新→skills/importedSkills描画        | safeInvoke(SKILL_LIST)                                                                              | skill:list ハンドラ → SkillService.listSkills()                |
| スキル検索         | skillFilter/skillCategory でローカルフィルタリング            | なし（Renderer内完結）                                                                              | なし（Renderer内完結）                                         |
| スキルインポート   | ImportSkillDialog表示→skill.name渡し→結果でagentSlice更新     | safeInvoke(SKILL_IMPORT, skillName: string)                                                         | skill:import ハンドラ → P42 3段バリデーション → importSkills() |
| スキル削除         | 確認ダイアログ→skill.name渡し→agentSlice更新                  | safeInvoke(SKILL_REMOVE, skillName: string)                                                         | skill:remove ハンドラ → P42 3段バリデーション → removeSkill()  |
| スキル詳細表示     | SkillDetailPanel描画、Markdownレンダリング                    | safeInvoke(SKILL_GET_DETAIL) / safeInvoke(SKILL_READ_FILE, { skillName, relativePath: "SKILL.md" }) | skill:get-detail / skill:readFile ハンドラ                     |
| スキルフォーク     | ForkSkillDialog表示→新名前入力→結果通知                       | safeInvoke(SKILL_FORK, {sourceName, newName})                                                       | skill:fork ハンドラ → SkillService.forkSkill()                 |
| ソースインポート   | URL/パス入力→バリデーション結果表示→インポート実行            | safeInvoke(SKILL_VALIDATE_SOURCE) / safeInvoke(SKILL_IMPORT_FROM_SOURCE)                            | skill:validateSource / skill:importFromSource ハンドラ         |
| スキルエクスポート | ExportSkillDialog表示→形式選択→ダウンロード通知               | safeInvoke(SKILL_EXPORT, {skillName, format})                                                       | skill:export ハンドラ → ファイル生成・保存                     |
| ドキュメント生成   | GenerateDocsDialog→セクション選択→プレビュー表示→エクスポート | safeInvoke(SKILL_DOCS_GENERATE) / safeInvoke(SKILL_DOCS_EXPORT)                                     | skill:docs:generate / skill:docs:export ハンドラ               |

### 2-2. IPC方向テーブル

| チャネル               | 方向            | 引数形式                    | 応答形式         |
| ---------------------- | --------------- | --------------------------- | ---------------- |
| skill:list             | Renderer → Main | なし                        | Skill[]          |
| skill:import           | Renderer → Main | string                      | ImportResult     |
| skill:remove           | Renderer → Main | string                      | RemoveResult     |
| skill:get-detail       | Renderer → Main | string                      | SkillDetail      |
| skill:readFile         | Renderer → Main | { skillName, relativePath } | string           |
| skill:fork             | Renderer → Main | {sourceName, newName}       | OperationResult  |
| skill:validateSource   | Renderer → Main | ShareTarget                 | ValidationResult |
| skill:importFromSource | Renderer → Main | ShareTarget                 | OperationResult  |
| skill:export           | Renderer → Main | {skillName, format}         | OperationResult  |
| skill:docs:generate    | Renderer → Main | {skillName, sections}       | GeneratedDocs    |
| skill:docs:export      | Renderer → Main | {docId, format}             | OperationResult  |

### 2-3. 境界確認項目

| 項目                   | 確認結果 | 備考                                                            |
| ---------------------- | -------- | --------------------------------------------------------------- |
| skill.name使用統一     | ✅ PASS  | P44/P45解決済み: skill.id（ハッシュ値）ではなくskill.nameを使用 |
| P42 3段バリデーション  | ✅ PASS  | skill:import, skill:remove で typeof→空文字→trim空文字チェック  |
| agentSlice個別セレクタ | ✅ PASS  | P31対策: useSkills(), useImportedSkills() 使用                  |
| ローカルフィルタ責務   | ✅ PASS  | 検索/カテゴリフィルタはRenderer内完結（IPCを経由しない）        |

---

## 3. SkillEditorView（task-031a / UI-05a）責務分担

### 3-1. 機能別責務テーブル

| 機能               | Renderer                                               | Preload                                                             | Main                                                          |
| ------------------ | ------------------------------------------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------- |
| ファイルツリー表示 | FileTreePanel描画、selectedFile管理（useState）        | task-031a 仕様では専用IPC未定義（Editor状態から構築）               | task-020b 仕様では専用listFilesハンドラ未定義                 |
| ファイル読み込み   | EditorPanel描画、content/language/isLoading管理        | safeInvoke(SKILL_READ_FILE, { skillName, relativePath })            | skill:readFile ハンドラ → ファイル読み込み＋言語判定          |
| ファイル編集       | onChange→unsavedFiles管理（useState Set）→保存トリガー | safeInvoke(SKILL_WRITE_FILE, { skillName, relativePath, content })  | skill:writeFile ハンドラ → ファイル書き込み＋バックアップ作成 |
| ファイル作成       | 新規ファイルダイアログ→パス入力→ツリー更新             | safeInvoke(SKILL_CREATE_FILE, { skillName, relativePath, content }) | skill:createFile ハンドラ → パストラバーサル検証→ファイル生成 |
| ファイル削除       | 確認ダイアログ→ツリー更新                              | safeInvoke(SKILL_DELETE_FILE, { skillName, relativePath })          | skill:deleteFile ハンドラ → パストラバーサル検証→ファイル削除 |
| バックアップ管理   | バックアップ一覧表示→復元操作                          | safeInvoke(SKILL_LIST_BACKUPS) / safeInvoke(SKILL_RESTORE_BACKUP)   | skill:listBackups / skill:restoreBackup ハンドラ              |

### 3-2. IPC方向テーブル

| チャネル            | 方向            | 引数形式                             | 応答形式            |
| ------------------- | --------------- | ------------------------------------ | ------------------- |
| skill:readFile      | Renderer → Main | { skillName, relativePath }          | {content, language} |
| skill:writeFile     | Renderer → Main | { skillName, relativePath, content } | OperationResult     |
| skill:createFile    | Renderer → Main | { skillName, relativePath, content } | OperationResult     |
| skill:deleteFile    | Renderer → Main | { skillName, relativePath }          | OperationResult     |
| skill:listBackups   | Renderer → Main | string                               | BackupEntry[]       |
| skill:restoreBackup | Renderer → Main | { skillName, backupPath }            | OperationResult     |

### 3-3. 境界確認項目

| 項目                 | 確認結果  | 備考                                                               |
| -------------------- | --------- | ------------------------------------------------------------------ |
| パストラバーサル検証 | ✅ PASS   | Main側でfilePath引数のパストラバーサル攻撃を検証                   |
| unsavedFiles管理     | ✅ PASS   | Renderer内useState完結（IPCを経由しない）                          |
| isReadOnlyフラグ     | ✅ PASS   | Renderer側Propsで制御、Main側で書き込み拒否の二重防御              |
| content大サイズ転送  | ⚠️ 要注意 | 大ファイルのcontent転送はIPC経由。分割読み込みは未実装（将来課題） |

---

## 4. AdvancedViews（task-031b / UI-05b）責務分担

### 4-1. ChainBuilder 責務テーブル

| 機能         | Renderer                                            | Preload                                       | Main                                             |
| ------------ | --------------------------------------------------- | --------------------------------------------- | ------------------------------------------------ |
| チェーン一覧 | チェーンリスト描画、選択状態管理（useState）        | safeInvoke(SKILL_CHAIN_LIST)                  | skill:chain:list ハンドラ → チェーン定義読み込み |
| ステップ編集 | StepCard/StepEditor描画、ドラッグ&ドロップ並び替え  | なし（Renderer内完結）                        | なし（Renderer内完結、保存時のみIPC）            |
| チェーン保存 | 保存ボタン→編集済みチェーン定義送信                 | safeInvoke(SKILL_CHAIN_SAVE, chainDefinition) | skill:chain:save ハンドラ → 定義ファイル書き込み |
| チェーン実行 | 実行ボタン→進捗表示（ステップごとのステータス更新） | safeInvoke(SKILL_CHAIN_EXECUTE)               | skill:chain:execute ハンドラ → 順次実行          |
| チェーン削除 | 確認ダイアログ→リスト更新                           | safeInvoke(SKILL_CHAIN_DELETE)                | skill:chain:delete ハンドラ → 定義ファイル削除   |

### 4-2. ScheduleManager 責務テーブル

| 機能             | Renderer                                                    | Preload                           | Main                                                        |
| ---------------- | ----------------------------------------------------------- | --------------------------------- | ----------------------------------------------------------- |
| スケジュール一覧 | スケジュールリスト描画、有効/無効トグル表示                 | safeInvoke(SKILL_SCHEDULE_LIST)   | skill:schedule:list ハンドラ → スケジュール定義読み込み     |
| Cron式編集       | CronEditor描画→プレビュー表示（次回実行時刻計算はRenderer） | なし（Renderer内完結）            | なし（Renderer内完結）                                      |
| スケジュール追加 | 追加ボタン→cron式＋対象スキル名送信                         | safeInvoke(SKILL_SCHEDULE_ADD)    | skill:schedule:add ハンドラ → 定義永続化＋スケジューラ登録  |
| スケジュール更新 | 編集保存ボタン→更新値送信                                   | safeInvoke(SKILL_SCHEDULE_UPDATE) | skill:schedule:update ハンドラ → 定義更新                   |
| スケジュール削除 | 確認ダイアログ→リスト更新                                   | safeInvoke(SKILL_SCHEDULE_DELETE) | skill:schedule:delete ハンドラ → スケジューラ解除＋定義削除 |
| トグル有効/無効  | トグルUI→ステータス更新                                     | safeInvoke(SKILL_SCHEDULE_TOGGLE) | skill:schedule:toggle ハンドラ → スケジューラ有効/無効切替  |

### 4-3. DebugPanel 責務テーブル

| 機能             | Renderer                                                   | Preload                                                 | Main                                                           |
| ---------------- | ---------------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------- |
| デバッグ開始     | DebugControls描画→sessionStatus管理（useState）            | safeInvoke(SKILL_DEBUG_START, {skillName, breakpoints}) | skill:debug:start ハンドラ → デバッグセッション開始            |
| イベント購読     | DebugEvent受信→ログ/変数パネル更新（P5リスナーガード必須） | safeOn(SKILL_DEBUG_EVENT) → cleanup関数返却             | skill:debug:event 送信 → Main→Renderer方向（webContents.send） |
| ステップ実行     | ステップ実行ボタン→次ブレークポイントまで実行              | safeInvoke(SKILL_DEBUG_STEP)                            | skill:debug:step ハンドラ → 次ステップ実行                     |
| デバッグ停止     | 停止ボタン→sessionStatus更新                               | safeInvoke(SKILL_DEBUG_STOP)                            | skill:debug:stop ハンドラ → セッション破棄                     |
| ブレークポイント | ブレークポイント行トグル（useState管理）                   | なし（Renderer内完結、開始時にまとめて送信）            | なし（開始時に受信）                                           |

### 4-4. AnalyticsDashboard 責務テーブル

| 機能             | Renderer                                                       | Preload                                                  | Main                                                 |
| ---------------- | -------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------- |
| サマリ表示       | SummaryCard描画（totalExecutions, successRate, avgDuration等） | safeInvoke(SKILL_ANALYTICS_SUMMARY, {period})            | skill:analytics:summary ハンドラ → 集計データ計算    |
| 使用量チャート   | UsageChart描画（時系列グラフ）                                 | safeInvoke(SKILL_ANALYTICS_TREND, {period, granularity}) | skill:analytics:trend ハンドラ → 時系列データ生成    |
| スキルランキング | SkillRanking描画（実行回数/成功率ソート）                      | safeInvoke(SKILL_ANALYTICS_STATISTICS, {period})         | skill:analytics:statistics ハンドラ → 統計データ生成 |
| 期間選択         | 期間セレクタ（useState管理）→再フェッチトリガー                | なし（Renderer内完結、フェッチ時にパラメータ渡し）       | なし（フェッチリクエスト時に受信）                   |

### 4-5. AdvancedViews 共通境界確認項目

| 項目                       | 確認結果    | 備考                                                                                       |
| -------------------------- | ----------- | ------------------------------------------------------------------------------------------ |
| safeOnクリーンアップ       | ✅ PASS     | DebugPanel: useEffect内でsafeOn戻り値のcleanup関数をreturn（P5対策）                       |
| sessionStatus管理          | ✅ PASS     | Renderer側useState完結。5状態: idle/running/paused/completed/error                         |
| Cron次回実行計算           | ⚠️ 境界注意 | Renderer側で計算。軽量ライブラリ使用のため許容範囲だが、タイムゾーン変換はMain側が望ましい |
| チェーン編集のローカル状態 | ✅ PASS     | ドラッグ&ドロップ並び替えはRenderer内完結（保存時のみIPC）                                 |
| Analytics期間パラメータ    | ✅ PASS     | Renderer側で期間選択→IPC引数として渡す（集計はMain側）                                     |

---

## 5. IPC通信パターン分類

### 5-1. Request-Response パターン（safeInvoke）

全ビューで使用される標準パターン。Renderer がリクエストし、Main が同期的に応答する。

| パターン         | 使用箇所                                          | 特徴                             |
| ---------------- | ------------------------------------------------- | -------------------------------- |
| 引数なし         | skill:list, skill:chain:list, skill:schedule:list | 単純取得                         |
| string引数       | skill:import, skill:remove, skill:get-detail      | P42 3段バリデーション必須        |
| オブジェクト引数 | skill:writeFile, skill:fork, skill:debug:start    | 各フィールドに個別バリデーション |

### 5-2. Event Subscription パターン（safeOn）

Main → Renderer 方向のプッシュ通知。リアルタイム更新が必要な機能で使用。

| チャネル          | 使用ビュー      | イベント発火タイミング           | P5対策      |
| ----------------- | --------------- | -------------------------------- | ----------- |
| skill:debug:event | DebugPanel      | デバッグステップ実行ごと         | cleanup必須 |
| skill:stream      | SkillCenterView | スキル実行中のストリーミング出力 | cleanup必須 |

---

## 6. 境界逸脱リスクまとめ

| リスク項目                     | 重要度 | 対象ビュー         | 説明                                                                                   | 推奨対応                                  |
| ------------------------------ | ------ | ------------------ | -------------------------------------------------------------------------------------- | ----------------------------------------- |
| 大ファイルIPC転送              | 中     | SkillEditorView    | 大サイズファイルのcontent全体をIPC経由で転送                                           | 将来的に分割読み込み/ストリーミングを検討 |
| Cron次回実行計算のRenderer配置 | 低     | ScheduleManager    | 軽量計算のためRenderer側で許容。タイムゾーン複雑化時はMain移管                         | 現状維持（要監視）                        |
| DebugEventの高頻度発火         | 中     | DebugPanel         | ステップ実行ごとにIPC経由でイベント発火。バッファリング未実装                          | 高頻度時はMain側でバッチング検討          |
| Analytics集計の応答遅延        | 低     | AnalyticsDashboard | 大量データの集計はMain側で実行。UIブロッキング回避はRenderer側のローディング表示で対応 | 現状維持（ローディングUI実装済み前提）    |

---

## 7. 整合性検証サマリ

| 検証項目                            | 結果    | 対象範囲                                                       |
| ----------------------------------- | ------- | -------------------------------------------------------------- |
| Renderer→Main一方向依存             | ✅ PASS | 全5ビュー（SkillCenter/Editor/Chain/Schedule/Debug/Analytics） |
| Node.js API直接使用なし             | ✅ PASS | 全Rendererコンポーネント                                       |
| safeInvoke/safeOnホワイトリスト経由 | ✅ PASS | 全IPC呼び出し                                                  |
| P42 3段バリデーション               | ✅ PASS | string引数を受ける全ハンドラ                                   |
| P44/P45引数名統一                   | ✅ PASS | skill:import/remove で skillName 統一                          |
| P5リスナーガード                    | ✅ PASS | safeOn使用箇所でcleanup関数返却                                |
| P31 agentSlice個別セレクタ          | ✅ PASS | useSkills(), useImportedSkills() 使用                          |
| UI状態のRenderer内完結              | ✅ PASS | フィルタ/選択/モーダル/フォーム等はuseState管理                |
