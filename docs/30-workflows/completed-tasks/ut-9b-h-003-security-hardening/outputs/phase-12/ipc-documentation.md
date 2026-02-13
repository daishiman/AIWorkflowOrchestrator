# セキュリティAPIドキュメント: SkillCreator IPCハンドラー

## メタ情報

| 項目       | 値                                                  |
| ---------- | --------------------------------------------------- |
| タスクID   | UT-9B-H-003                                         |
| Phase      | 12 (ドキュメント)                                   |
| 実行日     | 2026-02-12                                          |
| モジュール | `@repo/desktop/main/ipc/skillCreatorHandlers`       |
| ソースパス | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` |

---

## 1. セキュリティレイヤーモデル

SkillCreator IPCハンドラーは、3層のセキュリティレイヤーで全てのリクエストを検証する。

```
Renderer (React UI)
    │
    ▼
┌─────────────────────────────────────────────┐
│  L1: IPC送信元検証 (validateIpcSender)       │
│  - 送信元 BrowserWindow の照合              │
│  - ホワイトリスト登録済みウィンドウのみ許可  │
│  - 失敗時: throw IPCValidationError         │
├─────────────────────────────────────────────┤
│  L2: 型バリデーション (typeof チェック)       │
│  - 必須パラメータの存在確認                 │
│  - 型の一致確認 (string / object)           │
│  - 空文字列チェック (.trim() === "")        │
│  - 失敗時: { success: false, error: "..." } │
├─────────────────────────────────────────────┤
│  L3: ドメイン固有検証                        │
│  - validatePath: パストラバーサル攻撃防止   │
│  - ALLOWED_SCHEMA_NAMES: ホワイトリスト検証 │
│  - 失敗時: { success: false, error: "..." } │
├─────────────────────────────────────────────┤
│  サービス層 (SkillCreatorService)            │
│  - ビジネスロジック実行                     │
│  - エラー発生時: sanitizeErrorMessage で     │
│    内部情報を除去してからレスポンス返却      │
└─────────────────────────────────────────────┘
```

### レイヤー間の関係

- L1 が失敗した場合: **例外をスロー**（`throw toIPCValidationError(validation)`）。不正な送信元からのリクエストは即座に拒否する
- L2 が失敗した場合: `IpcResult<T>` の `{ success: false, error: "..." }` を返却
- L3 が失敗した場合: `IpcResult<T>` の `{ success: false, error: "..." }` を返却
- サービス層のエラー: `sanitizeErrorMessage()` でサニタイズ後、`IpcResult<T>` の `{ success: false, error: "..." }` を返却

---

## 2. エラーレスポンス形式: IpcResult<T>

全てのIPCハンドラーは `IpcResult<T>` 型でレスポンスを返す。

```typescript
interface IpcResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### 成功時

```typescript
{ success: true, data: <T> }
```

### 失敗時

```typescript
{ success: false, error: "エラーメッセージ" }
```

### セキュリティ上の注意

- `error` フィールドには内部情報（ファイルパス、スタックトレース、APIキー）を含めない
- サービス層のエラーは必ず `sanitizeErrorMessage()` を経由してからレスポンスに含める
- L1（送信元検証）の失敗は `IpcResult<T>` ではなく例外として処理される

---

## 3. IPCハンドラー一覧とセキュリティ対策

### 3.1 skill-creator:detect-mode

| 項目             | 値                                                                       |
| ---------------- | ------------------------------------------------------------------------ |
| チャンネル名     | `IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE` (`"skill-creator:detect-mode"`) |
| 引数型           | `{ request: string }`                                                    |
| 戻り値型         | `IpcResult<SkillCreatorMode>`                                            |
| サービスメソッド | `skillCreatorService.detectMode(request)`                                |

#### セキュリティ対策

| レイヤー | 対策                   | 詳細                                                     |
| -------- | ---------------------- | -------------------------------------------------------- |
| L1       | `validateIpcSender`    | 送信元ウィンドウの照合                                   |
| L2       | 型バリデーション       | `typeof args?.request !== "string"` および空文字チェック |
| L3       | -                      | ドメイン固有検証なし（パスパラメータなし）               |
| エラー   | `sanitizeErrorMessage` | サービス層エラーのサニタイズ                             |

---

### 3.2 skill-creator:create

| 項目             | 値                                                             |
| ---------------- | -------------------------------------------------------------- |
| チャンネル名     | `IPC_CHANNELS.SKILL_CREATOR_CREATE` (`"skill-creator:create"`) |
| 引数型           | `CreateSkillOptions` (+ オプショナル `tasksDir`, `skillDir`)   |
| 戻り値型         | `IpcResult<string>` (作成されたスキルのディレクトリパス)       |
| サービスメソッド | `skillCreatorService.createSkill(args)`                        |

#### セキュリティ対策

| レイヤー | 対策                   | 詳細                                                                             |
| -------- | ---------------------- | -------------------------------------------------------------------------------- |
| L1       | `validateIpcSender`    | 送信元ウィンドウの照合                                                           |
| L2       | 型バリデーション       | `name`, `description`, `mode` が全て `string` 型であること                       |
| L3       | `validatePath`         | `tasksDir`（string型の場合）, `skillDir`（string型の場合）のパストラバーサル検証 |
| エラー   | `sanitizeErrorMessage` | サービス層エラーのサニタイズ                                                     |

#### L3 検証フロー

```
tasksDir が string型?
  ├─ Yes → validatePath(tasksDir, "tasksDir")
  │    ├─ null → { success: false, error: "無効なパスが指定されました: tasksDir" }
  │    └─ string → 次の検証へ
  └─ No → スキップ（オプショナル）

skillDir が string型?
  ├─ Yes → validatePath(skillDir, "skillDir")
  │    ├─ null → { success: false, error: "無効なパスが指定されました: skillDir" }
  │    └─ string → サービス層へ
  └─ No → スキップ（オプショナル）
```

---

### 3.3 skill-creator:execute-tasks

| 項目             | 値                                                                           |
| ---------------- | ---------------------------------------------------------------------------- |
| チャンネル名     | `IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS` (`"skill-creator:execute-tasks"`) |
| 引数型           | `ExecuteTasksOptions` (+ オプショナル `skillDir`)                            |
| 戻り値型         | `IpcResult<ExecutionReport>`                                                 |
| サービスメソッド | `skillCreatorService.executeTasks(args)`                                     |

#### セキュリティ対策

| レイヤー | 対策                   | 詳細                                                                   |
| -------- | ---------------------- | ---------------------------------------------------------------------- |
| L1       | `validateIpcSender`    | 送信元ウィンドウの照合                                                 |
| L2       | 型バリデーション       | `tasksDir` が `string` 型かつ非空であること                            |
| L3       | `validatePath`         | `tasksDir`（必須）, `skillDir`（string型の場合）のパストラバーサル検証 |
| エラー   | `sanitizeErrorMessage` | サービス層エラーのサニタイズ                                           |

---

### 3.4 skill-creator:validate

| 項目             | 値                                                                 |
| ---------------- | ------------------------------------------------------------------ |
| チャンネル名     | `IPC_CHANNELS.SKILL_CREATOR_VALIDATE` (`"skill-creator:validate"`) |
| 引数型           | `{ skillDir: string }`                                             |
| 戻り値型         | `IpcResult<boolean>`                                               |
| サービスメソッド | `skillCreatorService.validateSkill(skillDir)`                      |

#### セキュリティ対策

| レイヤー | 対策                   | 詳細                                        |
| -------- | ---------------------- | ------------------------------------------- |
| L1       | `validateIpcSender`    | 送信元ウィンドウの照合                      |
| L2       | 型バリデーション       | `skillDir` が `string` 型かつ非空であること |
| L3       | `validatePath`         | `skillDir` のパストラバーサル検証           |
| エラー   | `sanitizeErrorMessage` | サービス層エラーのサニタイズ                |

---

### 3.5 skill-creator:validate-schema

| 項目             | 値                                                                               |
| ---------------- | -------------------------------------------------------------------------------- |
| チャンネル名     | `IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA` (`"skill-creator:validate-schema"`) |
| 引数型           | `{ schemaName: string; data: unknown }`                                          |
| 戻り値型         | `IpcResult<boolean>`                                                             |
| サービスメソッド | `skillCreatorService.validateWithSchema(schemaName, data)`                       |

#### セキュリティ対策

| レイヤー | 対策                   | 詳細                                                                                   |
| -------- | ---------------------- | -------------------------------------------------------------------------------------- |
| L1       | `validateIpcSender`    | 送信元ウィンドウの照合                                                                 |
| L2       | 型バリデーション       | `schemaName` が `string` 型かつ非空、`data` が `undefined` でないこと                  |
| L3       | `ALLOWED_SCHEMA_NAMES` | `schemaName` がホワイトリスト（`"task-spec"`, `"skill-spec"`, `"mode"`）に含まれること |
| エラー   | `sanitizeErrorMessage` | サービス層エラーのサニタイズ                                                           |

---

## 4. セキュリティ関数 公開API仕様

### 4.1 validatePath

パスのバリデーション（パストラバーサル対策）。SkillFileManager.validatePath() と同等のロジックをIPCハンドラーレベルで実行する。

#### シグネチャ

```typescript
function validatePath(inputPath: string, _paramName: string): string | null;
```

#### 検出する攻撃パターン

| 攻撃パターン                    | 検出ロジック                   | 例                        |
| ------------------------------- | ------------------------------ | ------------------------- |
| 空文字 / falsy値                | `!inputPath`                   | `""`                      |
| NULLバイトインジェクション      | `inputPath.includes("\0")`     | `"path\0evil"`            |
| UNCパス                         | `inputPath.startsWith("\\\\")` | `"\\\\server\\share"`     |
| 上位ディレクトリ参照（Unix）    | `inputPath.includes("../")`    | `"../../etc/passwd"`      |
| 上位ディレクトリ参照（Windows） | `inputPath.includes("..\\")`   | `"..\\windows\\system32"` |

#### 戻り値

- 検証成功: `path.resolve(inputPath)` で正規化された絶対パス
- 検証失敗: `null`

#### スコープ

モジュールプライベート関数（`export` されていない）。`registerSkillCreatorHandlers` 関数内から呼び出される。

---

### 4.2 sanitizeErrorMessage

エラーメッセージのサニタイズ（内部情報漏洩防止）。authModeHandlers.ts の sanitizeErrorMessage() と同等のパターン。

#### シグネチャ

```typescript
function sanitizeErrorMessage(error: unknown): string;
```

#### サニタイズ対象

| 対象                                       | 正規表現                                 | 置換先         |
| ------------------------------------------ | ---------------------------------------- | -------------- |
| スタックトレース                           | `/\n\s+at\s+.*/g`                        | 空文字（除去） |
| Unixファイルパス                           | `/\/[\w./\\-]+/g`                        | `[path]`       |
| Windowsファイルパス                        | `/[A-Z]:\\[\w.\\-]+/gi`                  | `[path]`       |
| 機密データ（token, key, password, secret） | `/(token\|key\|password\|secret)=\S+/gi` | `$1=***`       |

#### デフォルトメッセージ

以下の場合に返却される。

- `error` が `Error` インスタンスでない場合（`null`, `undefined`, 文字列, 数値）
- サニタイズ後のメッセージが空文字列になった場合

```
"スキル作成処理でエラーが発生しました"
```

#### スコープ

モジュールプライベート関数（`export` されていない）。全5つのIPCハンドラーの `catch` ブロック内から呼び出される。

---

### 4.3 ALLOWED_SCHEMA_NAMES

スキーマ名のホワイトリスト定数。validate-schema ハンドラーで使用される。

#### 定義

```typescript
const ALLOWED_SCHEMA_NAMES = ["task-spec", "skill-spec", "mode"] as const;
```

#### 型

```typescript
readonly[("task-spec", "skill-spec", "mode")];
```

#### 許可されるスキーマ名

| スキーマ名   | 用途                                 | 対応するサービスメソッド                                     |
| ------------ | ------------------------------------ | ------------------------------------------------------------ |
| `task-spec`  | タスク仕様スキーマでのバリデーション | `skillCreatorService.validateWithSchema("task-spec", data)`  |
| `skill-spec` | スキル仕様スキーマでのバリデーション | `skillCreatorService.validateWithSchema("skill-spec", data)` |
| `mode`       | モードスキーマでのバリデーション     | `skillCreatorService.validateWithSchema("mode", data)`       |

#### 検証特性

- **完全一致**: 大文字小文字を区別する（`"Task-Spec"` は拒否）
- **空白非許容**: 前後の空白は除去しない（`" task-spec "` は拒否）
- **Unicode厳密**: 不可視文字を含む文字列は拒否（`"task-spec\u200B"` は拒否）

#### 拡張手順

1. ResourceLoader にスキーマファイル（JSONスキーマ）を追加
2. `ALLOWED_SCHEMA_NAMES` 配列にスキーマ名を追加
3. `skillCreatorHandlers.security.test.ts` の許可済みスキーマ名テスト（`it.each`）に追加

---

## 5. IPCチャンネル定義

全チャンネルは `IPC_CHANNELS` 定数から参照される（ハードコード文字列禁止）。

| 定数名                          | チャンネル名                      | 種類                       |
| ------------------------------- | --------------------------------- | -------------------------- |
| `SKILL_CREATOR_DETECT_MODE`     | `"skill-creator:detect-mode"`     | invoke (双方向)            |
| `SKILL_CREATOR_CREATE`          | `"skill-creator:create"`          | invoke (双方向)            |
| `SKILL_CREATOR_EXECUTE_TASKS`   | `"skill-creator:execute-tasks"`   | invoke (双方向)            |
| `SKILL_CREATOR_VALIDATE`        | `"skill-creator:validate"`        | invoke (双方向)            |
| `SKILL_CREATOR_VALIDATE_SCHEMA` | `"skill-creator:validate-schema"` | invoke (双方向)            |
| `SKILL_CREATOR_PROGRESS`        | `"skill-creator:progress"`        | send (Main→Renderer一方向) |

---

## 6. セキュリティ対策サマリー

### ハンドラー別セキュリティ対策マトリクス

| ハンドラー      | L1: 送信元検証 | L2: 型バリデーション                             | L3: validatePath         | L3: schemaName検証 | エラーサニタイズ |
| --------------- | -------------- | ------------------------------------------------ | ------------------------ | ------------------ | ---------------- |
| detect-mode     | Yes            | Yes (request: string, 非空)                      | -                        | -                  | Yes              |
| create          | Yes            | Yes (name, description, mode: string)            | Yes (tasksDir, skillDir) | -                  | Yes              |
| execute-tasks   | Yes            | Yes (tasksDir: string, 非空)                     | Yes (tasksDir, skillDir) | -                  | Yes              |
| validate        | Yes            | Yes (skillDir: string, 非空)                     | Yes (skillDir)           | -                  | Yes              |
| validate-schema | Yes            | Yes (schemaName: string, 非空; data: !undefined) | -                        | Yes                | Yes              |

### 公開エクスポート関数

| 関数名                                                          | 用途                                                     |
| --------------------------------------------------------------- | -------------------------------------------------------- |
| `registerSkillCreatorHandlers(mainWindow, skillCreatorService)` | 全5つのIPCハンドラーを登録                               |
| `sendSkillCreatorProgress(mainWindow, progress)`                | 進捗通知をRendererに送信（`isDestroyed()` チェック付き） |
| `unregisterSkillCreatorHandlers()`                              | 全5つのIPCハンドラーを解除                               |
