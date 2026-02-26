# Phase 4 成果物: 統合テストシナリオ

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| タスクID   | TASK-9B            |
| Phase      | 4                  |
| 成果物     | 統合テストシナリオ |
| 作成日     | 2026-02-26         |
| ステータス | 完了               |

## 統合テストシナリオ一覧

### INT-001: スキル生成フロー

```
[入力] SkillSpec（name, description, allowedTools）
   ↓
[Step 1] SkillCreatorService.createSkill()
   ↓ mode="create" で runCreateWorkflow() 起動
[Step 2] ScriptExecutor.execute() でコード生成
   ↓ SKILL.md, agents/, references/ を生成
[Step 3] SkillCreatorService.validateSkill() で検証
   ↓ ディレクトリ構造・必須ファイル確認
[出力] { skillDir: string } — 生成先ディレクトリパス
```

**検証ポイント**:

- createSkill() が ScriptExecutor を正しい引数で呼び出すこと
- 生成ディレクトリに SKILL.md が存在すること
- validateSkill() が true を返すこと

### INT-002: タスク実行フロー

```
[入力] tasksDir（タスク仕様書ディレクトリ）, options（parallel, dryRun）
   ↓
[Step 1] scanTasks() でタスクファイルをスキャン
   ↓ *.md ファイルをパース
[Step 2] buildDependencyGraph() で依存関係グラフ構築
   ↓ depends_on フィールドを解析
[Step 3] topologicalSort() でトポロジカルソート
   ↓ Kahn's algorithm で実行順序決定
[Step 4] executeTask() で各タスクを順次実行
   ↓ ScriptExecutor 経由でタスク実行
[出力] ExecutionReport（results, summary）
```

**検証ポイント**:

- タスクが依存関係順に実行されること
- summary.completed + summary.failed + summary.skipped = summary.totalTasks
- 各タスクの duration が 0 以上であること

### INT-003: エラーリカバリフロー

```
[入力] タスク3件（A→B→C の依存関係）、タスクBで失敗
   ↓
[Step 1] タスクA 実行 → 成功
[Step 2] タスクB 実行 → 失敗（ScriptExecutor がエラー返却）
[Step 3] タスクC はスキップ（依存先Bが失敗のため）
[出力] ExecutionReport（A=completed, B=failed, C=skipped）
```

**検証ポイント**:

- summary.completed === 1（タスクA）
- summary.failed === 1（タスクB）
- summary.skipped === 1（タスクC）
- タスクBの error フィールドにエラーメッセージが含まれること

### INT-004: ドライランフロー

```
[入力] dryRun=true
   ↓
[Step 1] scanTasks() でタスクスキャン
[Step 2] buildDependencyGraph() で依存解決
[Step 3] topologicalSort() でソート
   ↓ 実行は行わずに計画のみ返却
[出力] ExecutionReport（mode="dry-run", tasks=string[][], estimatedTime）
```

**検証ポイント**:

- mode === "dry-run"
- tasks が2次元配列（並列実行グループ）であること
- results が undefined または空であること
- estimatedTime が 0 以上の数値であること

### INT-005: IPC→Service連携フロー

```
[入力] Renderer → skill-creator:create チャンネル経由のリクエスト
   ↓
[Step 1] IPCハンドラ: validateIpcSender() で送信元検証
[Step 2] IPCハンドラ: validateStringArg() で引数3段バリデーション
[Step 3] IPCハンドラ: SkillCreatorService.createSkill() 呼び出し
[Step 4] サービス: ワークフロー実行
[Step 5] IPCハンドラ: 結果をIpcResult<T>形式でラップして返却
[出力] { success: true, data: { skillDir: string } }
```

**検証ポイント**:

- IPCハンドラが正しいチャンネルで登録されていること
- バリデーション通過後にサービスメソッドが呼び出されること
- サービスの戻り値がIpcResult形式でラップされていること
- エラー時はsanitizeErrorMessage()が適用されること

## レイヤー間データフロー検証

```
Renderer                  Preload                    Main Process
   |                         |                           |
   |-- skill-creator:create →|                           |
   |                         |-- safeInvoke() ----------→|
   |                         |                           |-- validateIpcSender()
   |                         |                           |-- validateStringArg()
   |                         |                           |-- SkillCreatorService.createSkill()
   |                         |                           |     |-- ScriptExecutor.execute()
   |                         |                           |     |-- ResourceLoader.load()
   |                         |                           |     └→ skillDir
   |                         |                           |-- IpcResult.success(skillDir)
   |                         |← IpcResult<{ skillDir }> -|
   |← Promise<{ skillDir }> -|                           |
```
