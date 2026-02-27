# Phase 2: アーキテクチャ設計書

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| タスクID   | TASK-9F              |
| Phase      | 2                    |
| 成果物     | アーキテクチャ設計書 |
| 作成日     | 2026-02-27           |
| 機能名     | skill-share          |
| ステータス | 完了                 |

---

## 1. SkillShareManager クラス設計

### 配置

`apps/desktop/src/main/services/skill/SkillShareManager.ts`

### 責務

外部ソースからのスキルインポート、スキルのエクスポート、インポート前検証を統括する。Strategyパターンで各ソースタイプの処理を分離する。

### クラス構造

```
SkillShareManager
├── importFromSource(source: ShareTarget): Promise<Result<ImportResult, SkillShareError>>
├── exportSkill(skillName: string, destination: ShareTarget): Promise<Result<ExportResult, SkillShareError>>
├── validateSource(source: ShareTarget): Promise<Result<SourceValidation, SkillShareError>>
├── validateImport(skillPath: string): Promise<Result<ImportValidation, SkillShareError>>
│
├── [private] strategies: Map<ShareTarget["type"], ImportStrategy>
├── [private] exportStrategies: Map<ShareTarget["type"], ExportStrategy>
├── [private] gitHubClient: GitHubClient
├── [private] fileSystem: FileSystemAdapter
├── [private] skillValidator: SkillValidator
├── [private] skillService: SkillService
└── [private] mainWindow: BrowserWindow | null
```

### 公開メソッド（4つ）

| メソッド           | 引数                                          | 返却型                                               | 対応FR     |
| ------------------ | --------------------------------------------- | ---------------------------------------------------- | ---------- |
| `importFromSource` | `source: ShareTarget`                         | `Promise<Result<ImportResult, SkillShareError>>`     | FR-1〜FR-4 |
| `exportSkill`      | `skillName: string, destination: ShareTarget` | `Promise<Result<ExportResult, SkillShareError>>`     | FR-5, FR-6 |
| `validateSource`   | `source: ShareTarget`                         | `Promise<Result<SourceValidation, SkillShareError>>` | FR-8       |
| `validateImport`   | `skillPath: string`                           | `Promise<Result<ImportValidation, SkillShareError>>` | FR-7       |

### Strategy Map（2つ）

```typescript
// インポートストラテジーMap
private strategies: Map<ShareTarget["type"], ImportStrategy> = new Map([
  ["github", new GitHubImportStrategy(this.gitHubClient, this.fileSystem)],
  ["gist", new GistImportStrategy(this.gitHubClient, this.fileSystem)],
  ["url", new UrlImportStrategy(this.fileSystem)],
  ["local", new LocalImportStrategy(this.fileSystem)],
]);

// エクスポートストラテジーMap
private exportStrategies: Map<ShareTarget["type"], ExportStrategy> = new Map([
  ["gist", new GistExportStrategy(this.gitHubClient)],
  ["local", new LocalExportStrategy(this.fileSystem)],
]);
```

---

## 2. Strategy パターン設計

### ImportStrategy インターフェース

```typescript
interface ImportStrategy {
  import(source: ShareTarget): Promise<Result<ImportResult, SkillShareError>>;
  validate(
    source: ShareTarget,
  ): Promise<Result<SourceValidation, SkillShareError>>;
}
```

### 具象インポートストラテジー（4つ）

| ストラテジー           | 対応ソース | 外部依存              | 責務                                                  |
| ---------------------- | ---------- | --------------------- | ----------------------------------------------------- |
| `GitHubImportStrategy` | `github`   | Octokit（GitHub API） | リポジトリからSKILL.md+関連ファイルを取得・保存       |
| `GistImportStrategy`   | `gist`     | Octokit（Gist API）   | GistからSKILL.md+関連ファイルを取得・保存             |
| `UrlImportStrategy`    | `url`      | Node.js https module  | URLからSKILL.md単体を取得・保存                       |
| `LocalImportStrategy`  | `local`    | Node.js fs module     | ローカルディレクトリからSKILL.md+関連ファイルをコピー |

### ExportStrategy インターフェース

```typescript
interface ExportStrategy {
  export(
    skillName: string,
    skillFiles: SkillFileSet,
    destination: ShareTarget,
  ): Promise<Result<ExportResult, SkillShareError>>;
}
```

### 具象エクスポートストラテジー（2つ）

| ストラテジー          | 対応先  | 外部依存            | 責務                                      |
| --------------------- | ------- | ------------------- | ----------------------------------------- |
| `GistExportStrategy`  | `gist`  | Octokit（Gist API） | スキルファイルをGistに作成し共有URLを返却 |
| `LocalExportStrategy` | `local` | Node.js fs module   | スキルファイルを指定ディレクトリにコピー  |

### Strategy パターン採用理由

- 4種のインポートソースと2種のエクスポート先はそれぞれ外部依存と処理フローが異なる
- 新しいソース追加時に既存コードを変更せず、新ストラテジークラスを追加するだけで対応できる（Open/Closed Principle）
- 各ストラテジーを独立してテスト可能（テスタビリティ向上）
- SkillShareManagerは戦略選択のみ担当し、具体的な処理はストラテジーに委譲する（単一責務）

---

## 3. DI 設計

### Constructor Injection（起動時に利用可能な4依存）

```typescript
constructor(
  private readonly gitHubClient: GitHubClient,
  private readonly fileSystem: FileSystemAdapter,
  private readonly skillValidator: SkillValidator,
  private readonly skillService: SkillService,
)
```

| 依存              | 用途                    | インターフェース経由 |
| ----------------- | ----------------------- | -------------------- |
| GitHubClient      | GitHub/Gist APIアクセス | 可能                 |
| FileSystemAdapter | ファイルシステム操作    | 可能                 |
| SkillValidator    | SKILL.md構造検証        | 可能                 |
| SkillService      | 既存スキル管理との連携  | 可能                 |

### Setter Injection（遅延初期化が必要な1依存 -- P34対策）

```typescript
setMainWindow(mainWindow: BrowserWindow): void
```

BrowserWindowは起動後に生成されるため、Constructor Injectionでは対応できない。プログレスイベント送信時にmainWindowが必要なため、Setter Injectionで注入する。

### 依存グラフ（循環依存なし確認）

```
SkillShareManager
  ├── GitHubClient (独立)
  ├── FileSystemAdapter (独立)
  ├── SkillValidator (独立)
  └── SkillService (既存、SkillShareManagerへの依存なし)

GitHubImportStrategy
  ├── GitHubClient
  └── FileSystemAdapter

GistImportStrategy
  ├── GitHubClient
  └── FileSystemAdapter

UrlImportStrategy
  └── FileSystemAdapter

LocalImportStrategy
  └── FileSystemAdapter

GistExportStrategy
  └── GitHubClient

LocalExportStrategy
  └── FileSystemAdapter
```

循環依存は存在しない。SkillService → SkillShareManager の逆方向依存がないことを確認済み。

---

## 4. サービス層ファイル配置

```
apps/desktop/src/main/services/skill/
├── SkillService.ts              (既存: 総合管理)
├── SkillShareManager.ts         (新規: 共有機能統括)
├── strategies/                  (新規: Strategyディレクトリ)
│   ├── ImportStrategy.ts        (新規: インターフェース定義)
│   ├── ExportStrategy.ts        (新規: インターフェース定義)
│   ├── GitHubImportStrategy.ts  (新規)
│   ├── GistImportStrategy.ts    (新規)
│   ├── UrlImportStrategy.ts     (新規)
│   ├── LocalImportStrategy.ts   (新規)
│   ├── GistExportStrategy.ts    (新規)
│   └── LocalExportStrategy.ts   (新規)
├── adapters/                    (新規: 外部サービスアダプタ)
│   ├── GitHubClient.ts          (新規: Octokitラッパー)
│   └── FileSystemAdapter.ts     (新規: fs操作抽象化)
├── validators/                  (新規: 検証ロジック)
│   └── SkillValidator.ts        (新規: SKILL.md構造検証)
├── SkillScanner.ts              (既存)
├── SkillImportManager.ts        (既存)
├── SkillExecutor.ts             (既存)
└── ...
```

### ディレクトリ構成の設計根拠

| ディレクトリ  | 責務                                                 | 設計原則               |
| ------------- | ---------------------------------------------------- | ---------------------- |
| `strategies/` | インポート/エクスポートの具象戦略                    | Strategy パターン      |
| `adapters/`   | 外部サービス（GitHub API、ファイルシステム）の抽象化 | Adapter パターン / DIP |
| `validators/` | SKILL.md構造検証ロジック                             | 単一責務 / SoC         |

---

## 5. アダプタークラス設計

### GitHubClient

**配置**: `apps/desktop/src/main/services/skill/adapters/GitHubClient.ts`

```typescript
class GitHubClient {
  private octokit: Octokit | null = null;

  constructor(private readonly tokenProvider: () => Promise<string | null>) {}

  private async getOctokit(): Promise<Octokit> {
    const token = await this.tokenProvider();
    this.octokit = new Octokit(token ? { auth: token } : {});
    return this.octokit;
  }

  async getRepoContents(
    repo: string,
    path: string,
    branch: string,
  ): Promise<Result<FileContent[], SkillShareError>> { ... }

  async getGist(
    gistId: string,
  ): Promise<Result<GistContent, SkillShareError>> { ... }

  async createGist(
    files: Record<string, { content: string }>,
    description: string,
    isPublic: boolean,
  ): Promise<Result<{ url: string }, SkillShareError>> { ... }
}
```

- Octokitの薄いラッパーとして実装する
- Result<T, E>パターンでエラーを返却する
- Octokit固有の例外をキャッチしてSkillShareErrorに変換する
- トークンなしの場合はパブリックリポジトリアクセスのみ（rate limit低い）

### FileSystemAdapter

**配置**: `apps/desktop/src/main/services/skill/adapters/FileSystemAdapter.ts`

- Node.js の `fs/promises` をラップする
- パストラバーサル検出・権限チェック・ディスク容量チェックを内包する
- テスト時はモックに差し替え可能

### SkillValidator

**配置**: `apps/desktop/src/main/services/skill/validators/SkillValidator.ts`

- SKILL.md存在確認
- 必須フィールド（name, description, triggers）存在確認
- 構造検証（Anchor定義の妥当性）
