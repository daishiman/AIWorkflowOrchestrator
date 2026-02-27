# TASK-9F スキル共有 IPC ドキュメント

## メタ情報

| 項目        | 値                                         |
| ----------- | ------------------------------------------ |
| タスク ID   | TASK-9F                                    |
| Phase       | 12 (ドキュメント)                          |
| 作成日      | 2026-02-27                                 |
| ハンドラ    | `skillHandlers.share.ts`                   |
| Preload API | `skill-api.ts`                             |
| 型定義      | `packages/shared/src/types/skill-share.ts` |

## チャネル一覧

| チャネル名               | 定数名                     | Preload メソッド     | 方向            |
| ------------------------ | -------------------------- | -------------------- | --------------- |
| `skill:importFromSource` | `SKILL_IMPORT_FROM_SOURCE` | `importFromSource()` | Renderer → Main |
| `skill:export`           | `SKILL_EXPORT`             | `exportSkill()`      | Renderer → Main |
| `skill:validateSource`   | `SKILL_VALIDATE_SOURCE`    | `validateSource()`   | Renderer → Main |

3チャネルとも `ipcMain.handle()` による Request-Response パターン。`ALLOWED_INVOKE_CHANNELS` ホワイトリストに登録済み。

---

## 1. skill:importFromSource

### 概要

外部ソース（GitHub リポジトリ、Gist、URL、ローカルディレクトリ）からスキルをインポートする。

### Preload API メソッドシグネチャ

```typescript
importFromSource(source: ShareTarget): Promise<ShareResult<ShareImportResult>>
```

Preload 実装:

```typescript
importFromSource: (source: ShareTarget): Promise<ShareResult<ShareImportResult>> =>
  safeInvoke(IPC_CHANNELS.SKILL_IMPORT_FROM_SOURCE, source),
```

### リクエスト型: ShareTarget

| フィールド  | 型                | 必須条件                     | 説明                                                |
| ----------- | ----------------- | ---------------------------- | --------------------------------------------------- |
| `type`      | `ShareSourceType` | 常に必須                     | `"github"`, `"gist"`, `"url"`, `"local"` のいずれか |
| `repo`      | `string`          | type="github" 時に必須       | GitHub リポジトリ（例: `"owner/repo"`）             |
| `branch`    | `string`          | type="github" 時にオプション | ブランチ名（デフォルト: `"main"`）                  |
| `path`      | `string`          | type="github" 時にオプション | リポジトリ内パス（デフォルト: `"/"`）               |
| `gistId`    | `string`          | type="gist" 時に必須         | Gist ID                                             |
| `localPath` | `string`          | type="local" 時に必須        | ローカルディレクトリパス                            |
| `url`       | `string`          | type="url" 時に必須          | SKILL.md の URL                                     |

### レスポンス型: ShareResult\<ShareImportResult\>

#### 成功時

```typescript
{
  success: true,
  data: {
    success: true,
    skillName: "my-skill",        // インポートされたスキル名
    skillPath: "/tmp/skill-share/my-skill",  // 一時保存先パス
    source: { type: "github", repo: "owner/my-skill", ... },
    importedAt: "2026-02-27T12:00:00.000Z"   // ISO 8601
  }
}
```

#### 失敗時（SkillShareManager エラー）

```typescript
{
  success: false,
  error: {
    code: 2003,
    message: "SKILL.md not found in repository",
    category: "business",
    isRetryable: false
  }
}
```

#### 失敗時（IPC バリデーションエラー）

```typescript
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "source.type must be a string"
  }
}
```

### バリデーションルール

IPC ハンドラは SkillShareManager に到達する前に以下のバリデーションを実行する。

| 順序 | チェック内容                                  | エラーメッセージ                                       |
| ---- | --------------------------------------------- | ------------------------------------------------------ |
| 1    | `source` が非 null オブジェクトか             | `source must be a non-null object`                     |
| 2    | `source.type` が文字列か（P42 第1段）         | `source.type must be a string`                         |
| 3    | `source.type` が空文字列でないか（P42 第2段） | `source.type must not be empty`                        |
| 4    | `source.type` が空白のみでないか（P42 第3段） | `source.type must not be whitespace only`              |
| 5    | `source.type` が許可値に含まれるか            | `source.type must be one of: github, gist, url, local` |
| 6    | github 時: `source.repo` が10000文字未満か    | `source.repo must be less than 10000 characters`       |

### エラーコード

| コード | 名前             | 発生条件                             |
| ------ | ---------------- | ------------------------------------ |
| 1002   | INVALID_FORMAT   | 不正なソース種別、SKILL.md 形式不正  |
| 1003   | PATH_TRAVERSAL   | localPath に `..` が含まれる         |
| 2003   | SKILL_NOT_FOUND  | SKILL.md が見つからない              |
| 3001   | EXTERNAL_SERVICE | HTTP 4xx/5xx エラー                  |
| 3002   | NETWORK_TIMEOUT  | ネットワーク接続失敗（リトライ可能） |
| 4002   | FILE_NOT_FOUND   | ディレクトリが存在しない (ENOENT)    |

### セキュリティ

- **validateIpcSender**: 送信元ウィンドウが `mainWindow` であることを検証。不正な送信元からのリクエストは `toIPCValidationError` で例外をスローする
- **ホワイトリスト**: `ALLOWED_INVOKE_CHANNELS` に `skill:importFromSource` が登録されていること。未登録チャネルは `safeInvoke` で拒否される
- **パストラバーサル検出**: type="local" の場合、SkillShareManager 内で `localPath` に `..` が含まれないことを検証する
- **文字列長制限**: `source.repo` は 10000 文字未満に制限される

### 使用例（DevTools コンソール）

```javascript
// GitHub リポジトリからインポート
await window.electronAPI.skill.importFromSource({
  type: "github",
  repo: "user/my-awesome-skill",
  branch: "main",
});

// Gist からインポート
await window.electronAPI.skill.importFromSource({
  type: "gist",
  gistId: "abc123def456",
});

// URL からインポート
await window.electronAPI.skill.importFromSource({
  type: "url",
  url: "https://raw.githubusercontent.com/user/repo/main/SKILL.md",
});

// ローカルディレクトリからインポート
await window.electronAPI.skill.importFromSource({
  type: "local",
  localPath: "/Users/user/my-skills/translator",
});
```

---

## 2. skill:export

### 概要

インストール済みスキルを外部（Gist またはローカルディレクトリ）にエクスポートする。

### Preload API メソッドシグネチャ

```typescript
exportSkill(
  skillName: string,
  destination: ShareDestination
): Promise<ShareResult<ShareExportResult>>
```

Preload 実装:

```typescript
exportSkill: (skillName: string, destination: ShareDestination):
  Promise<ShareResult<ShareExportResult>> =>
    safeInvoke(IPC_CHANNELS.SKILL_EXPORT, { skillName, destination }),
```

Preload 側はオブジェクト `{ skillName, destination }` として `args` を送信する。IPC ハンドラ側では `args.skillName` と `args.destination` としてアクセスする。

### リクエスト型

IPC ハンドラが受け取る `args` オブジェクトの構造:

| フィールド         | 型                 | 必須 | 説明                           |
| ------------------ | ------------------ | ---- | ------------------------------ |
| `args.skillName`   | `string`           | 必須 | エクスポート対象のスキル名     |
| `args.destination` | `ShareDestination` | 必須 | エクスポート先定義オブジェクト |

#### ShareDestination

| フィールド  | 型                     | 必須条件                   | 説明                               |
| ----------- | ---------------------- | -------------------------- | ---------------------------------- |
| `type`      | `ShareDestinationType` | 常に必須                   | `"gist"` または `"local"`          |
| `gistId`    | `string`               | type="gist" 時にオプション | 空文字列で新規作成、既存 ID で更新 |
| `localPath` | `string`               | type="local" 時に必須      | エクスポート先ディレクトリパス     |

### レスポンス型: ShareResult\<ShareExportResult\>

#### 成功時（Gist エクスポート）

```typescript
{
  success: true,
  data: {
    success: true,
    destination: { type: "gist" },
    exportedFiles: ["SKILL.md", "references/patterns.md"],
    shareUrl: "https://gist.github.com/user/abc123"
  }
}
```

#### 成功時（ローカルエクスポート）

```typescript
{
  success: true,
  data: {
    success: true,
    destination: { type: "local", localPath: "/Users/user/exported/my-skill" },
    exportedFiles: ["SKILL.md", "references/patterns.md"],
    shareUrl: undefined
  }
}
```

#### 失敗時（SkillShareManager エラー）

```typescript
{
  success: false,
  error: {
    code: 2003,
    message: "Skill not found: nonexistent-skill",
    category: "business",
    isRetryable: false
  }
}
```

### バリデーションルール

| 順序 | チェック内容                                            | エラーメッセージ                                    |
| ---- | ------------------------------------------------------- | --------------------------------------------------- |
| 1    | `args` が非 null オブジェクトか                         | `args must be a non-null object`                    |
| 2    | `args.skillName` が文字列か（P42 第1段）                | `args.skillName must be a string`                   |
| 3    | `args.skillName` が空文字列でないか（P42 第2段）        | `args.skillName must not be empty`                  |
| 4    | `args.skillName` が空白のみでないか（P42 第3段）        | `args.skillName must not be whitespace only`        |
| 5    | `args.destination` が非 null オブジェクトか             | `args.destination must be a non-null object`        |
| 6    | `args.destination.type` が文字列か（P42 第1段）         | `args.destination.type must be a string`            |
| 7    | `args.destination.type` が空文字列でないか（P42 第2段） | `args.destination.type must not be empty`           |
| 8    | `args.destination.type` が空白のみでないか（P42 第3段） | `args.destination.type must not be whitespace only` |
| 9    | `args.destination.type` が許可値に含まれるか            | `args.destination.type must be one of: gist, local` |

`args.skillName` はバリデーション通過後に `.trim()` されてから SkillShareManager に渡される。

### エラーコード

| コード | 名前                 | 発生条件                                     |
| ------ | -------------------- | -------------------------------------------- |
| 1002   | INVALID_FORMAT       | 不正なエクスポート先種別                     |
| 2003   | SKILL_NOT_FOUND      | 指定スキルが存在しない                       |
| 2005   | TOKEN_NOT_CONFIGURED | GitHub トークン未設定（Gist エクスポート時） |
| 3001   | EXTERNAL_SERVICE     | Gist API エラー                              |
| 4003   | PERMISSION_DENIED    | ローカルエクスポート先への書き込み権限不足   |
| 4002   | FILE_NOT_FOUND       | ローカルエクスポート先へのアクセス失敗       |

### セキュリティ

- **validateIpcSender**: 送信元ウィンドウが `mainWindow` であることを検証
- **ホワイトリスト**: `ALLOWED_INVOKE_CHANNELS` に `skill:export` が登録済み
- **skillName のトリム**: バリデーション通過後、`args.skillName` は `.trim()` されてから処理される。これにより先頭・末尾の空白を含むスキル名での不正検索を防止する

### 使用例（DevTools コンソール）

```javascript
// Gist にエクスポート（新規作成）
await window.electronAPI.skill.exportSkill("my-skill", {
  type: "gist",
});

// ローカルディレクトリにエクスポート
await window.electronAPI.skill.exportSkill("my-skill", {
  type: "local",
  localPath: "/Users/user/Desktop/shared-skills/my-skill",
});
```

---

## 3. skill:validateSource

### 概要

インポート前にソースの有効性を検証する。ソースに到達可能か、SKILL.md が存在するか、SKILL.md の内容が有効かを確認する。

### Preload API メソッドシグネチャ

```typescript
validateSource(source: ShareTarget): Promise<ShareResult<ShareValidateSourceResult>>
```

Preload 実装:

```typescript
validateSource: (source: ShareTarget): Promise<ShareResult<ShareValidateSourceResult>> =>
  safeInvoke(IPC_CHANNELS.SKILL_VALIDATE_SOURCE, source),
```

### リクエスト型: ShareTarget

`skill:importFromSource` と同一の `ShareTarget` 型を使用する。ただし、validateSource は `source.localPath` が必須（現在の実装では localPath ベースの検証のみ対応）。

| フィールド  | 型                | 必須条件   | 説明                   |
| ----------- | ----------------- | ---------- | ---------------------- |
| `type`      | `ShareSourceType` | 常に必須   | ソース種別             |
| `localPath` | `string`          | 検証に必須 | 検証対象のローカルパス |

### レスポンス型: ShareResult\<ShareValidateSourceResult\>

#### 成功時（有効なソース）

```typescript
{
  success: true,
  data: {
    isReachable: true,
    hasSkillMd: true,
    errors: []
  }
}
```

#### 成功時（到達可能だが SKILL.md なし）

```typescript
{
  success: true,
  data: {
    isReachable: true,
    hasSkillMd: false,
    errors: ["SKILL.md not found in directory"]
  }
}
```

#### 成功時（到達不能）

```typescript
{
  success: true,
  data: {
    isReachable: false,
    hasSkillMd: false,
    errors: ["ENOENT: no such file or directory"]
  }
}
```

#### 成功時（localPath 未指定）

```typescript
{
  success: true,
  data: {
    isReachable: false,
    hasSkillMd: false,
    errors: ["localPath is required for validation"]
  }
}
```

validateSource はソースの到達不能やファイル不在を「検証結果」として返す（`success: true` でラップされる）。`success: false` になるのは IPC バリデーションエラーの場合のみ。

### バリデーションルール

| 順序 | チェック内容                                  | エラーメッセージ                          |
| ---- | --------------------------------------------- | ----------------------------------------- |
| 1    | `source` が非 null オブジェクトか             | `source must be a non-null object`        |
| 2    | `source.type` が文字列か（P42 第1段）         | `source.type must be a string`            |
| 3    | `source.type` が空文字列でないか（P42 第2段） | `source.type must not be empty`           |
| 4    | `source.type` が空白のみでないか（P42 第3段） | `source.type must not be whitespace only` |

validateSource は `source.type` の許可値チェックを行わない（`skill:importFromSource` とは異なる）。これは将来的にソース種別が拡張された場合にも検証可能とするため。

### エラーコード

validateSource 自体はビジネスエラーを返さない。検証結果は全て `ShareValidateSourceResult` の `errors` 配列に格納される。IPC バリデーションエラーのみ以下の形式で返される。

```typescript
{ success: false, error: { code: "VALIDATION_ERROR", message: "..." } }
```

### セキュリティ

- **validateIpcSender**: 送信元ウィンドウが `mainWindow` であることを検証
- **ホワイトリスト**: `ALLOWED_INVOKE_CHANNELS` に `skill:validateSource` が登録済み
- **シンボリックリンク解決**: SkillShareManager 内で `fileSystem.resolveRealPath()` を使用してシンボリックリンクを解決し、実際のパスに対して検証を行う

### 使用例（DevTools コンソール）

```javascript
// ローカルディレクトリのソースを検証
const result = await window.electronAPI.skill.validateSource({
  type: "local",
  localPath: "/Users/user/my-skills/translator",
});

if (result.success && result.data.isReachable && result.data.hasSkillMd) {
  console.log("インポート可能なスキルです");
} else {
  console.log("検証エラー:", result.data?.errors);
}
```

---

## 共通仕様

### P42 準拠 3 段バリデーション

全チャネルの文字列フィールドに対して以下の 3 段階バリデーションを適用する。

```typescript
function validateStringField(value: unknown, fieldName: string): string | null {
  // 第1段: 型チェック
  if (typeof value !== "string") {
    return `${fieldName} must be a string`;
  }
  // 第2段: 空文字列チェック
  if (value === "") {
    return `${fieldName} must not be empty`;
  }
  // 第3段: トリム空文字列チェック
  if (value.trim() === "") {
    return `${fieldName} must not be whitespace only`;
  }
  return null;
}
```

### validateIpcSender による送信元検証

全チャネルの冒頭で送信元ウィンドウを検証する。

```typescript
const validation = validateIpcSender(event, channelName, {
  getAllowedWindows: () => [mainWindow],
});
if (!validation.valid) {
  throw toIPCValidationError(validation);
}
```

不正な送信元からのリクエストは例外としてスローされ、IPC レスポンスとして返されない。

### ハンドラの登録と解除

```typescript
// 登録
registerSkillShareHandlers(mainWindow, skillShareManager);

// 解除（アプリ終了時やウィンドウ再生成時に呼び出す — P5 対策）
unregisterSkillShareHandlers();
```

`unregisterSkillShareHandlers()` は3チャネル全てに対して `ipcMain.removeHandler()` を呼び出す。P5（リスナー二重登録）を防止するため、再登録前に必ず解除する。

### 許可値定数

```typescript
const ALLOWED_SOURCE_TYPES = ["github", "gist", "url", "local"] as const;
const ALLOWED_DESTINATION_TYPES = ["gist", "local"] as const;
const MAX_STRING_LENGTH = 10000;
```
