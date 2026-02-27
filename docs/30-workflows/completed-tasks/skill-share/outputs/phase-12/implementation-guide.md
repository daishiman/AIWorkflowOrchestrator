# TASK-9F スキル共有・インポート機能 実装ガイド

## メタ情報

| 項目      | 値                              |
| --------- | ------------------------------- |
| タスク ID | TASK-9F                         |
| Phase     | 12 (ドキュメント)               |
| 作成日    | 2026-02-27                      |
| 対象読者  | Part 1: 初学者 / Part 2: 開発者 |

---

## Part 1: 概念的説明（中学生レベル）

### この機能は何をするの？

「スキル共有・インポート機能」を、**料理のレシピ**に例えて説明します。

AIWorkflowOrchestrator で使う「スキル」とは、AI に特定の仕事をさせるための「レシピ」のようなものです。レシピがあれば、誰でも同じ料理が作れるように、スキルがあれば AI に同じ仕事をさせることができます。

この機能は、**レシピを外から持ってきたり、自分のレシピを外に渡したりする仕組み**です。

### レシピの入手先（インポート元）

レシピを手に入れる方法は4つあります。

| 入手先                   | 料理の例え                                               | 実際の動作                                    |
| ------------------------ | -------------------------------------------------------- | --------------------------------------------- |
| **GitHub リポジトリ**    | 料理本の図書館から特定のレシピを取り寄せる               | GitHub 上のリポジトリからスキルファイルを取得 |
| **Gist**                 | 友達が書いた1枚のレシピカードをもらう                    | GitHub Gist に保存された単体スキルを取得      |
| **URL**                  | ウェブサイトに載っているレシピのリンクを開いてコピーする | 指定 URL から SKILL.md を直接ダウンロード     |
| **ローカルディレクトリ** | 自分のノートに書いてあるレシピを写す                     | PC 上の別フォルダからスキルファイルをコピー   |

### レシピの渡し先（エクスポート先）

自分のレシピを渡す方法は2つあります。

| 渡し先       | 料理の例え                                   | 実際の動作                                  |
| ------------ | -------------------------------------------- | ------------------------------------------- |
| **Gist**     | レシピカードに書いて友達に渡す（ネット経由） | GitHub Gist にスキルファイルをアップロード  |
| **ローカル** | 自分のレシピを別のノートに写す               | PC 上の指定フォルダにスキルファイルをコピー |

### なぜこの機能が必要なの？

スキルを1人で全部作るのは大変です。他の人が作った優秀なスキルを取り込んだり、自分が作ったスキルを共有したりできれば、みんなでもっと便利な AI 環境を作れます。

例えるなら、料理が上手な人のレシピをもらって、自分もその料理を作れるようになるのと同じです。

### 全体の流れ

```
【インポート（外から持ってくる）】

[GitHub リポジトリ]  ─┐
[Gist]              ─┤
[URL]               ─┼─→  importFromSource  ─→  [~/.aiworkflow/skills/ に保存]
[ローカルフォルダ]    ─┘

【エクスポート（外に渡す）】

[~/.aiworkflow/skills/ のスキル]  ─→  exportSkill  ─→  [Gist に公開]
                                                    ─→  [ローカルフォルダにコピー]

【事前検証】

[任意のソース]  ─→  validateSource  ─→  [到達可能か？ SKILL.md はあるか？]
```

### 安全に使うための仕組み

レシピを外から持ってくるとき、いくつかの安全チェックがあります。

1. **形式チェック**: レシピが正しい書式（SKILL.md がある）かどうか確認する
2. **パストラバーサル防止**: パソコンの大事なファイルを壊さないよう、不正なパス（`..` を含むパス）をブロックする
3. **送信元検証**: リクエストが正しいアプリウィンドウから来たものかを確認する

---

## Part 2: 技術的詳細（開発者向け）

### 1. ファイル構成

#### 新規作成ファイル

| ファイルパス                                                                           | 役割                      |
| -------------------------------------------------------------------------------------- | ------------------------- |
| `packages/shared/src/types/skill-share.ts`                                             | 共有型定義                |
| `apps/desktop/src/main/services/skill/SkillShareManager.ts`                            | メインサービス            |
| `apps/desktop/src/main/ipc/skillHandlers.share.ts`                                     | IPC ハンドラ              |
| `apps/desktop/src/main/services/skill/__tests__/SkillShareManager.test.ts`             | ユニットテスト (51件)     |
| `apps/desktop/src/main/services/skill/__tests__/SkillShareManager.integration.test.ts` | 統合テスト (8件)          |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.share.test.ts`                      | IPC ハンドラテスト (33件) |

#### 修正ファイル

| ファイルパス                            | 変更内容                                                       |
| --------------------------------------- | -------------------------------------------------------------- |
| `apps/desktop/src/preload/channels.ts`  | 3チャネル定数追加 + ホワイトリスト登録                         |
| `apps/desktop/src/preload/skill-api.ts` | 3メソッド追加（importFromSource, exportSkill, validateSource） |

### 2. 型定義詳細

全ての型は `packages/shared/src/types/skill-share.ts` に定義されている。

#### ShareSourceType / ShareDestinationType

```typescript
type ShareSourceType = "github" | "gist" | "url" | "local";
type ShareDestinationType = "gist" | "local";
```

#### ShareTarget（インポートソース定義）

```typescript
interface ShareTarget {
  type: ShareSourceType;
  repo?: string; // type="github" 時に必須（例: "owner/repo"）
  branch?: string; // type="github" 時にオプション（デフォルト: "main"）
  path?: string; // type="github" 時にオプション（デフォルト: "/"）
  gistId?: string; // type="gist" 時に必須
  localPath?: string; // type="local" 時に必須
  url?: string; // type="url" 時に必須
}
```

#### ShareDestination（エクスポート先定義）

```typescript
interface ShareDestination {
  type: ShareDestinationType;
  gistId?: string; // 空文字列で新規作成、既存 ID で更新
  localPath?: string; // type="local" 時に必須
}
```

#### ShareImportResult（インポート結果）

```typescript
interface ShareImportResult {
  success: boolean;
  skillName: string;
  skillPath: string;
  source: ShareTarget;
  importedAt: string; // ISO 8601 形式
}
```

#### ShareExportResult（エクスポート結果）

```typescript
interface ShareExportResult {
  success: boolean;
  destination: ShareDestination;
  exportedFiles: string[];
  shareUrl?: string; // Gist エクスポート時のみ
}
```

#### ShareValidateSourceResult（ソース検証結果）

```typescript
interface ShareValidateSourceResult {
  isReachable: boolean;
  hasSkillMd: boolean;
  skillName?: string;
  errors: string[];
}
```

#### ShareError（エラー情報）

```typescript
interface ShareError {
  code: number;
  message: string;
  category:
    | "validation"
    | "business"
    | "external"
    | "infrastructure"
    | "internal";
  isRetryable: boolean;
}
```

#### ShareResult\<T\>（Result パターン）

```typescript
interface ShareResult<T> {
  success: boolean;
  data?: T; // success === true 時に存在
  error?: ShareError; // success === false 時に存在
}
```

### 3. SkillShareManager のメソッド一覧と使用例

#### Constructor

```typescript
class SkillShareManager {
  constructor(
    gitHubClient: GitHubClient,
    fileSystem: FileSystemAdapter,
    skillValidator: SkillValidator,
    skillService: SkillServiceDep,
  );
}
```

4つの依存を Constructor Injection で受け取る。テスト時にはモックを注入する。

#### importFromSource(source: ShareTarget): Promise\<ShareResult\<ShareImportResult\>\>

外部ソースからスキルをインポートする。`source.type` に応じて4つの戦略（GitHub, Gist, URL, ローカル）に振り分ける。

```typescript
// GitHub リポジトリからインポート
const result = await manager.importFromSource({
  type: "github",
  repo: "user/my-skill",
  branch: "main",
  path: "/",
});
if (result.success) {
  console.log(`Imported: ${result.data.skillName} at ${result.data.skillPath}`);
}

// Gist からインポート
const result = await manager.importFromSource({
  type: "gist",
  gistId: "abc123def456",
});

// URL からインポート
const result = await manager.importFromSource({
  type: "url",
  url: "https://example.com/skills/my-skill/SKILL.md",
});

// ローカルディレクトリからインポート
const result = await manager.importFromSource({
  type: "local",
  localPath: "/Users/user/skills/my-skill",
});
```

#### exportSkill(skillName: string, destination: ShareDestination): Promise\<ShareResult\<ShareExportResult\>\>

インストール済みスキルを外部にエクスポートする。

```typescript
// Gist にエクスポート
const result = await manager.exportSkill("my-skill", {
  type: "gist",
});
if (result.success) {
  console.log(`Share URL: ${result.data.shareUrl}`);
}

// ローカルディレクトリにエクスポート
const result = await manager.exportSkill("my-skill", {
  type: "local",
  localPath: "/Users/user/exported-skills/my-skill",
});
```

#### validateSource(source: ShareTarget): Promise\<ShareResult\<ShareValidateSourceResult\>\>

インポート前にソースの有効性を検証する（到達可能か、SKILL.md が存在するか）。

```typescript
const result = await manager.validateSource({
  type: "local",
  localPath: "/Users/user/skills/my-skill",
});
if (result.success) {
  const { isReachable, hasSkillMd, errors } = result.data;
  if (isReachable && hasSkillMd && errors.length === 0) {
    // インポート可能
  }
}
```

### 4. IPC 通信フロー

```
Renderer (React UI)
    │
    │ window.electronAPI.skill.importFromSource(source)
    │ window.electronAPI.skill.exportSkill(skillName, destination)
    │ window.electronAPI.skill.validateSource(source)
    ▼
Preload (skill-api.ts)
    │
    │ safeInvoke(IPC_CHANNELS.SKILL_IMPORT_FROM_SOURCE, source)
    │ safeInvoke(IPC_CHANNELS.SKILL_EXPORT, { skillName, destination })
    │ safeInvoke(IPC_CHANNELS.SKILL_VALIDATE_SOURCE, source)
    │
    │ ※ ALLOWED_INVOKE_CHANNELS ホワイトリストで許可チェック
    ▼
Main Process (skillHandlers.share.ts)
    │
    │ 1. validateIpcSender() で送信元ウィンドウ検証
    │ 2. P42 準拠 3 段バリデーション（型チェック → 空文字列 → トリム空文字列）
    │ 3. 許可値チェック（ALLOWED_SOURCE_TYPES / ALLOWED_DESTINATION_TYPES）
    │ 4. SkillShareManager のメソッドに委譲
    ▼
SkillShareManager
    │
    │ source.type に応じて戦略を選択:
    │   - "github" → GitHubClient.getRepoContents()
    │   - "gist"   → GitHubClient.getGist()
    │   - "url"    → fetch()
    │   - "local"  → FileSystemAdapter.cp()
    ▼
External Services / File System
```

#### チャネル名とホワイトリスト

| 定数名                     | チャネル文字列           | ホワイトリスト |
| -------------------------- | ------------------------ | -------------- |
| `SKILL_IMPORT_FROM_SOURCE` | `skill:importFromSource` | ALLOWED_INVOKE |
| `SKILL_EXPORT`             | `skill:export`           | ALLOWED_INVOKE |
| `SKILL_VALIDATE_SOURCE`    | `skill:validateSource`   | ALLOWED_INVOKE |

3つとも `ipcMain.handle()` で登録される Request-Response 型のチャネルであり、`ALLOWED_INVOKE_CHANNELS` に含まれている。ストリーミング（`ALLOWED_ON_CHANNELS`）は使用しない。

### 5. エラーコード体系

SkillShareManager は8種のエラーコードを定義する。コード範囲はプロジェクト共通のエラーカテゴリ規則に準拠している。

| エラー名               | コード | カテゴリ       | リトライ可 | 発生条件                                    |
| ---------------------- | ------ | -------------- | ---------- | ------------------------------------------- |
| `INVALID_FORMAT`       | 1002   | validation     | 不可       | 不正なソース種別、SKILL.md 形式不正         |
| `PATH_TRAVERSAL`       | 1003   | validation     | 不可       | パスに `..` が含まれる                      |
| `SKILL_NOT_FOUND`      | 2003   | business       | 不可       | SKILL.md が見つからない、スキルが存在しない |
| `TOKEN_NOT_CONFIGURED` | 2005   | business       | 不可       | GitHub トークン未設定                       |
| `EXTERNAL_SERVICE`     | 3001   | external       | 不可       | HTTP エラー（4xx/5xx）                      |
| `NETWORK_TIMEOUT`      | 3002   | external       | **可能**   | ネットワーク接続失敗、タイムアウト          |
| `FILE_NOT_FOUND`       | 4002   | infrastructure | 不可       | ファイル・ディレクトリが存在しない          |
| `PERMISSION_DENIED`    | 4003   | infrastructure | 不可       | ファイルシステムの権限不足 (EACCES)         |

#### IPC ハンドラ固有のバリデーションエラー

IPC ハンドラ（`skillHandlers.share.ts`）は、SkillShareManager に到達する前にバリデーションエラーを返す場合がある。これらは `ShareResult` 形式ではなく、以下の形式で返される。

```typescript
{ success: false, error: { code: "VALIDATION_ERROR", message: "..." } }
```

### 6. テスト構成

合計 **92 テスト** (51 unit + 8 integration + 33 IPC handler)。

#### SkillShareManager.test.ts（51件）

| カテゴリ       | テスト数 | 対象                                                |
| -------------- | -------- | --------------------------------------------------- |
| import         | 16       | GitHub/Gist/URL/ローカルからのインポート            |
| export         | 6        | Gist/ローカルへのエクスポート                       |
| validateSource | 4        | ソース検証（到達可能性、SKILL.md 有無）             |
| edge cases     | 22       | ネットワークエラー、FS エラー、データ不正、不正パス |
| 並行処理       | 3        | Promise.all / Promise.allSettled による並行実行     |

#### SkillShareManager.integration.test.ts（8件）

| テスト内容                                         |
| -------------------------------------------------- |
| GitHub インポート → ファイル書き込みの結合フロー   |
| Gist エクスポート → API 呼び出しの結合フロー       |
| ソース検証 → ファイル読み取りの結合フロー          |
| インポート → エクスポートの連続フロー              |
| 並行実行テスト                                     |
| URL インポート → SKILL.md 検証の結合フロー         |
| ローカルインポート → コピー完了の結合フロー        |
| Gist インポート → 複数ファイル書き込みの結合フロー |

#### skillHandlers.share.test.ts（33件）

IPC 3チャネルのバリデーション・セキュリティ・正常系を網羅的にテスト。

#### テスト実行方法

```bash
# 全テスト実行（apps/desktop ディレクトリから実行すること — P40 対策）
cd apps/desktop
pnpm vitest run src/main/services/skill/__tests__/SkillShareManager.test.ts
pnpm vitest run src/main/services/skill/__tests__/SkillShareManager.integration.test.ts
pnpm vitest run src/main/ipc/__tests__/skillHandlers.share.test.ts

# 3ファイルを一括実行
pnpm vitest run src/main/services/skill/__tests__/SkillShareManager src/main/ipc/__tests__/skillHandlers.share.test.ts

# フィルタ指定で実行
pnpm vitest run --reporter verbose -t "SkillShareManager"
```

### 7. Constructor Injection による DI 設計

SkillShareManager は4つの依存を Constructor Injection で受け取る。これにより、テスト時にモックを注入しやすく、各レイヤーの責務が明確に分離される。

#### 依存インターフェース

```typescript
// GitHub API との通信を抽象化
interface GitHubClient {
  getRepoContents(
    repo: string,
    path: string,
    branch: string,
  ): Promise<ShareResult<{ name: string; content: string }[]>>;
  getGist(
    gistId: string,
  ): Promise<ShareResult<{ files: Record<string, { content: string }> }>>;
  createGist(
    files: Record<string, { content: string }>,
    description: string,
  ): Promise<ShareResult<{ url: string }>>;
}

// ファイルシステム操作を抽象化
interface FileSystemAdapter {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  readdir(path: string): Promise<string[]>;
  stat(path: string): Promise<{ isDirectory(): boolean }>;
  mkdir(path: string): Promise<void>;
  cp(src: string, dest: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  resolveRealPath(path: string): Promise<string>;
}

// スキルの構造検証を抽象化
interface SkillValidator {
  validateStructure(
    path: string,
  ): Promise<{ isValid: boolean; errors: string[] }>;
  validateSkillMd(content: string): { isValid: boolean; errors: string[] };
}

// 既存 SkillService への依存
interface SkillServiceDep {
  scanAvailableSkills(): Promise<unknown>;
  getSkillByName(
    name: string,
  ): Promise<ShareResult<{ name: string; path: string }>>;
  importManager: { importSkills(names: string[]): Promise<unknown> };
}
```

#### DI のポイント

- **GitHubClient**: 外部 API 呼び出しを抽象化。テスト時はモックを注入して HTTP リクエストを発行しない
- **FileSystemAdapter**: ファイル操作を抽象化。テスト時はモックを注入して実ファイルシステムに触れない
- **SkillValidator**: SKILL.md のバリデーションロジックを分離。検証ルールの変更が SkillShareManager に波及しない
- **SkillServiceDep**: 既存の SkillService との結合点。エクスポート時のスキル情報取得に使用

Constructor Injection を採用した理由は、4つの依存全てが SkillShareManager の生成時点で利用可能であるため（P34: 遅延初期化が不要なケース）。
