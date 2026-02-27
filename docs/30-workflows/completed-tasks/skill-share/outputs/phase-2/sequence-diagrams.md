# Phase 2: シーケンス図

## メタ情報

| 項目       | 内容         |
| ---------- | ------------ |
| タスクID   | TASK-9F      |
| Phase      | 2            |
| 成果物     | シーケンス図 |
| 作成日     | 2026-02-27   |
| 機能名     | skill-share  |
| ステータス | 完了         |

---

## 1. インポートフロー（GitHubリポジトリ）

```
Renderer          Preload              Main (Handler)        SkillShareManager     GitHubImportStrategy   GitHubClient       FileSystem
   |                 |                      |                      |                      |                    |                 |
   | importFromSource|                      |                      |                      |                    |                 |
   | (ShareTarget)   |                      |                      |                      |                    |                 |
   |---------------->|                      |                      |                      |                    |                 |
   |                 | safeInvoke(          |                      |                      |                    |                 |
   |                 |  SKILL_IMPORT_FROM_  |                      |                      |                    |                 |
   |                 |  SOURCE, source)     |                      |                      |                    |                 |
   |                 |--------------------->|                      |                      |                    |                 |
   |                 |                      | validateIpcSender()  |                      |                    |                 |
   |                 |                      | validateShareTarget()|                      |                    |                 |
   |                 |                      |                      |                      |                    |                 |
   |                 |                      | importFromSource()   |                      |                    |                 |
   |                 |                      |--------------------->|                      |                    |                 |
   |                 |                      |                      | strategies.get()     |                    |                 |
   |                 |                      |                      | --> GitHubImport     |                    |                 |
   |                 |                      |                      |                      |                    |                 |
   |                 |                      |                      | import(source)       |                    |                 |
   |                 |                      |                      |--------------------->|                    |                 |
   |                 |                      |                      |                      | getRepoContents() |                 |
   |                 |                      |                      |                      |------------------>|                 |
   |                 |                      |                      |                      |                    | GET /repos/     |
   |                 |                      |                      |                      |                    | owner/repo/     |
   |                 |                      |                      |                      |                    | contents/path   |
   |                 |                      |                      |                      |<------------------|                 |
   |                 |                      |                      |                      |                    |                 |
   |<- - - - - - - - | progress event       |                      |                      |                    |                 |
   |  (downloading)  |                      |                      |                      |                    |                 |
   |                 |                      |                      |                      | writeFiles()      |                 |
   |                 |                      |                      |                      |-------------------------------------->|
   |                 |                      |                      |                      |                    |                 |
   |<- - - - - - - - | progress event       |                      |                      |                    |                 |
   |  (copying)      |                      |                      |                      |                    |                 |
   |                 |                      |                      |                      |                    |                 |
   |                 |                      |                      | validateImport()     |                    |                 |
   |                 |                      |                      |--------------------->|                    |                 |
   |                 |                      |                      |<---------------------|                    |                 |
   |                 |                      |                      |                      |                    |                 |
   |                 |                      |<---------------------|                      |                    |                 |
   |                 |                      |  Result<ImportResult>|                      |                    |                 |
   |                 |                      |                      |                      |                    |                 |
   |                 |<---------------------|                      |                      |                    |                 |
   |                 |  IpcResult           |                      |                      |                    |                 |
   |<----------------|                      |                      |                      |                    |                 |
   |  ImportResult   |                      |                      |                      |                    |                 |
```

### フロー詳細

1. **Renderer**: `importFromSource(ShareTarget)` を呼び出す
2. **Preload**: `safeInvoke(IPC_CHANNELS.SKILL_IMPORT_FROM_SOURCE, source)` でMain Processに送信
3. **Main Handler**:
   - `validateIpcSender()` で送信元ウィンドウを検証
   - `validateShareTarget()` で引数をP42準拠3段バリデーション
4. **SkillShareManager**: `strategies.get("github")` でGitHubImportStrategyを選択
5. **GitHubImportStrategy**: `import(source)` を実行
   - GitHubClient経由でリポジトリのコンテンツを取得
   - プログレスイベント（downloading）をRendererに送信
   - FileSystemAdapter経由でファイルを保存
   - プログレスイベント（copying）をRendererに送信
6. **SkillShareManager**: `validateImport()` でインポート後のスキルを検証
7. **Main Handler**: `Result<ImportResult>` を `IpcResult` に変換してRendererに返却

---

## 2. エクスポートフロー（Gist）

```
Renderer          Preload              Main (Handler)        SkillShareManager     GistExportStrategy     GitHubClient
   |                 |                      |                      |                      |                    |
   | exportSkill     |                      |                      |                      |                    |
   | (name, dest)    |                      |                      |                      |                    |
   |---------------->|                      |                      |                      |                    |
   |                 | safeInvoke(          |                      |                      |                    |
   |                 |  SKILL_EXPORT,       |                      |                      |                    |
   |                 |  {skillName, dest})  |                      |                      |                    |
   |                 |--------------------->|                      |                      |                    |
   |                 |                      | validateIpcSender()  |                      |                    |
   |                 |                      | validate skillName   |                      |                    |
   |                 |                      | (P42 3段バリデーション) |                   |                    |
   |                 |                      | validateShareTarget()|                      |                    |
   |                 |                      |                      |                      |                    |
   |                 |                      | exportSkill()        |                      |                    |
   |                 |                      |--------------------->|                      |                    |
   |                 |                      |                      | readSkillFiles()     |                    |
   |                 |                      |                      | (SKILL.md + 関連)    |                    |
   |                 |                      |                      |                      |                    |
   |<- - - - - - - - | progress event       |                      |                      |                    |
   |  (preparing)    |                      |                      |                      |                    |
   |                 |                      |                      |                      |                    |
   |                 |                      |                      | export(name, files,  |                    |
   |                 |                      |                      |        destination)  |                    |
   |                 |                      |                      |--------------------->|                    |
   |                 |                      |                      |                      | createGist()      |
   |                 |                      |                      |                      |------------------>|
   |                 |                      |                      |                      |                    | POST /gists
   |                 |                      |                      |                      |<------------------|
   |                 |                      |                      |                      |  { url: gistUrl }  |
   |                 |                      |                      |<---------------------|                    |
   |                 |                      |                      |                      |                    |
   |<- - - - - - - - | progress event       |                      |                      |                    |
   |  (finalizing)   |                      |                      |                      |                    |
   |                 |                      |                      |                      |                    |
   |                 |                      |<---------------------|                      |                    |
   |                 |                      | Result<ExportResult> |                      |                    |
   |                 |<---------------------|                      |                      |                    |
   |<----------------|                      |                      |                      |                    |
   |  ExportResult   |                      |                      |                      |                    |
   |  (shareUrl付き) |                      |                      |                      |                    |
```

### フロー詳細

1. **Renderer**: `exportSkill(skillName, destination)` を呼び出す
2. **Preload**: `safeInvoke(IPC_CHANNELS.SKILL_EXPORT, { skillName, destination })` でMain Processに送信
3. **Main Handler**:
   - `validateIpcSender()` で送信元ウィンドウを検証
   - skillNameのP42準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）
   - `validateShareTarget()` でdestinationをバリデーション
4. **SkillShareManager**: 対象スキルのファイル群を読み取る
   - プログレスイベント（preparing）をRendererに送信
   - `exportStrategies.get("gist")` でGistExportStrategyを選択
5. **GistExportStrategy**: `export(name, files, destination)` を実行
   - GitHubClient経由でGist APIを呼び出し
   - Gist作成後、共有URLを取得
6. **SkillShareManager**: プログレスイベント（finalizing）をRendererに送信
7. **Main Handler**: `Result<ExportResult>` を `IpcResult` に変換してRendererに返却
   - ExportResult.shareUrl にGist URLが含まれる
