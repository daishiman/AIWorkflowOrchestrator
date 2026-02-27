# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                                                 |
| ---------- | -------------------------------------------------------------------- |
| Phase 番号 | 1                                                                    |
| Phase 名   | 要件定義                                                             |
| 目的       | スキル共有・インポート機能の機能要件・非機能要件・受入基準を定義する |
| 前提Phase  | なし（初回Phase）                                                    |
| 後続Phase  | Phase 2: 設計                                                        |
| ステータス | 未実施                                                               |
| 作成日     | 2026-02-27                                                           |
| 機能名     | skill-share                                                          |

## 目的

TASK-9F「スキル共有・インポート機能」の機能要件（FR）・非機能要件（NFR）・受け入れ基準を定義し、後続の設計・実装Phaseの入力とする。スキルをGitHub/Gist/URL/ローカルからインポートし、Gist/ローカルにエクスポート（共有）する機能のスコープを明確化する。

## 実行タスク

- **Task 1: 機能要件（FR）の定義** — 8項目のFRを洗い出し、各FRの入力・出力・前提条件・正常系・異常系を定義する
- **Task 2: 非機能要件（NFR）の定義** — セキュリティ・パフォーマンス・エラーハンドリング・テスタビリティの4項目を定義する
- **Task 3: 受け入れ基準の定義** — 各FRに対応する検証可能な受け入れ基準をGherkin形式で記述する
- **Task 4: インターフェース仕様の整理** — ShareTarget/ImportResult/ExportResult型の要件確認、IPCチャネル仕様、既存skill:importとの棲み分けを明確化する

## 参照資料

| 参照資料               | パス                                                         | 内容                               |
| ---------------------- | ------------------------------------------------------------ | ---------------------------------- |
| 既存IPCハンドラ        | `apps/desktop/src/main/ipc/skillHandlers.share.ts`           | 既存skill:importハンドラの引数形式 |
| 既存Preload API        | `apps/desktop/src/preload/skill-api.ts`                      | safeInvoke/safeOnパターンの参照    |
| チャネル定義           | `apps/desktop/src/preload/channels.ts`                       | IPC_CHANNELSホワイトリスト         |
| 共有型定義             | `packages/shared/src/types/skill.ts`                         | SkillName/SkillId Branded Type定義 |
| 既存SkillService       | `apps/desktop/src/main/services/skill/SkillService.ts`       | importSkills/removeSkillの実装     |
| 既存SkillImportManager | `apps/desktop/src/main/services/skill/SkillImportManager.ts` | インポート設定永続化パターン       |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                         | P42/P44/P45の教訓                  |

## システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                                        | 内容                            |
| ------------------ | ------------------------------------------------------------------------------------------- | ------------------------------- |
| IPC仕様            | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | skill-creator:shareチャネル定義 |
| 型定義             | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | ShareTarget等の型定義           |
| セキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | P42準拠バリデーション           |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | Result\<T,E\>パターン           |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | DI/Setter Injectionパターン     |

## 実行手順

### Step 1: 機能要件（FR）の定義

以下の8項目を定義する。各FRには入力・出力・前提条件・正常系・異常系を明記する。

#### FR-1: GitHub リポジトリからのスキルインポート

- **入力**: `ShareTarget { type: "github", repo: string, branch?: string, path?: string }`
- **出力**: `ImportResult { success: boolean, skillName: string, skillPath: string, source: ShareTarget, importedAt: string }`
- **前提条件**: 対象リポジトリがパブリック、またはユーザーがPATを設定済み
- **正常系**: 指定リポジトリの指定パス（デフォルト: ルート）からSKILL.mdと関連ファイルを取得し、`~/.aiworkflow/skills/{skillName}/` にコピーする
- **異常系**: リポジトリ不存在（404）、ブランチ不存在、パス不存在、SKILL.md不存在、ネットワークエラー、GitHub API rate limit超過

#### FR-2: GitHub Gist からのスキルインポート

- **入力**: `ShareTarget { type: "gist", gistId: string }`
- **出力**: `ImportResult`
- **前提条件**: 対象GistがパブリックまたはユーザーがPATを設定済み
- **正常系**: 指定GistからSKILL.mdを含むファイル群を取得し、`~/.aiworkflow/skills/{skillName}/` にコピーする
- **異常系**: Gist不存在（404）、SKILL.md不存在、ネットワークエラー、rate limit超過

#### FR-3: URL（SKILL.md直指定）からのインポート

- **入力**: `ShareTarget { type: "url", url: string }`
- **出力**: `ImportResult`
- **前提条件**: URLがHTTPSプロトコルであること
- **正常系**: 指定URLからSKILL.mdを取得し、単一ファイルスキルとして `~/.aiworkflow/skills/{skillName}/` に保存する
- **異常系**: URL不到達、非HTTPSプロトコル、レスポンスがSKILL.md形式でない、タイムアウト（30秒）

#### FR-4: ローカルディレクトリからのインポート

- **入力**: `ShareTarget { type: "local", localPath: string }`
- **出力**: `ImportResult`
- **前提条件**: 指定パスが存在し、読み取り権限がある
- **正常系**: 指定ローカルディレクトリからSKILL.mdと関連ファイルを `~/.aiworkflow/skills/{skillName}/` にコピーする
- **異常系**: パス不存在、読み取り権限なし、SKILL.md不存在、パストラバーサル攻撃の検出

#### FR-5: Gist へのスキルエクスポート（共有URL取得）

- **入力**: `skillName: string`, `ShareTarget { type: "gist" }`
- **出力**: `ExportResult { success: boolean, destination: ShareTarget, exportedFiles: string[], shareUrl: string }`
- **前提条件**: 対象スキルが `~/.aiworkflow/skills/` に存在し、ユーザーがGitHub PATを設定済み
- **正常系**: スキルのSKILL.mdと関連ファイルをGistに作成し、共有URLを返却する
- **異常系**: スキル不存在、PAT未設定、PAT権限不足（gistスコープ必須）、ネットワークエラー、rate limit超過

#### FR-6: ローカルディレクトリへのエクスポート

- **入力**: `skillName: string`, `ShareTarget { type: "local", localPath: string }`
- **出力**: `ExportResult { success: boolean, destination: ShareTarget, exportedFiles: string[] }`
- **前提条件**: 対象スキルが存在し、出力先ディレクトリに書き込み権限がある
- **正常系**: スキルのSKILL.mdと関連ファイルを指定ディレクトリにコピーする
- **異常系**: スキル不存在、出力先書き込み権限なし、ディスク容量不足、パストラバーサル攻撃の検出

#### FR-7: インポート前のスキル検証

- **入力**: `skillPath: string`（インポート後のローカルパス）
- **出力**: `ImportValidation { isValid: boolean, errors: string[], warnings: string[], skillMetadata?: SkillMetadata }`
- **正常系**: SKILL.md存在確認、必須フィールド（name, description, triggers）存在確認、構造検証（Anchor定義の妥当性）を実施する
- **異常系**: SKILL.md不存在、必須フィールド欠落、不正なYAML/マークダウン構造

#### FR-8: インポートソース検証

- **入力**: `ShareTarget`
- **出力**: `SourceValidation { isReachable: boolean, hasSkillMd: boolean, errors: string[] }`
- **正常系**: ソースの到達性確認（GitHubリポジトリ存在、Gist存在、URL到達、ローカルパス存在）とSKILL.md存在確認を実施する
- **異常系**: ソース不到達、認証エラー、タイムアウト（15秒）

### Step 2: 非機能要件（NFR）の定義

#### NFR-1: セキュリティ

- 全IPCハンドラで `validateIpcSender()` による送信元ウィンドウ検証を実施する
- 全文字列引数にP42準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）を適用する
- ShareTarget.localPathおよびFR-6の出力先パスに対してパストラバーサル防止チェックを実施する（`..` セグメント検出、シンボリックリンク解決後の検証）
- URL入力はHTTPSプロトコルのみ許可する（HTTPは拒否）
- GitHub PATはMain Processの暗号化ストレージに保存し、Rendererには送信しない
- エラーメッセージは `sanitizeErrorMessage()` で内部情報を除去してからRendererに返却する

#### NFR-2: パフォーマンス

- GitHub APIリクエストは並列実行しリポジトリ内の複数ファイル取得を効率化する（最大同時5リクエスト）
- 大容量スキル（10MB超）はストリーミングダウンロードで対応し、メモリ使用量を制限する
- インポート/エクスポート処理中はRenderer側にプログレスイベントを送信する（`skill:importFromSource:progress`）
- GitHub API rate limit到達時はRetry-Afterヘッダーに基づいて待機する

#### NFR-3: エラーハンドリング

- サービス層の全メソッドは `Result<T, E>` パターンで明示的にエラーを返却する
- エラーカテゴリ分類:
  - Validation Error（1000-1999）: 不正なShareTarget形式、空文字列入力 — リトライ不可
  - Business Error（2000-2999）: スキル不存在、SKILL.md欠落 — リトライ不可
  - External Service Error（3000-3999）: GitHub API障害、ネットワークエラー — リトライ可能（最大3回、指数バックオフ）
  - Infrastructure Error（4000-4999）: ファイルシステムエラー、ディスク容量不足 — リトライ可能（条件付き）
  - Internal Error（5000-5999）: 予期しないエラー — リトライ不可
- try/catchでエラーを握りつぶさず、上位に伝播させる

#### NFR-4: テスタビリティ

- SkillShareManagerはConstructor Injectionで外部依存（GitHubClient, FileSystem）を注入する
- BrowserWindow依存の機能はSetter Injectionで注入する（P34対策）
- 全外部サービス呼び出しはインターフェース経由でモック可能にする
- テスト間で状態を共有しない設計とする（P9対策）

### Step 3: 受け入れ基準の定義

各FRに対応する検証可能な受け入れ基準をGherkin形式で定義する。

**AC-1: GitHubリポジトリからのインポート成功**

```gherkin
Given パブリックリポジトリ "owner/repo" にSKILL.mdが存在する
When ShareTarget { type: "github", repo: "owner/repo" } でインポートを実行する
Then ImportResult.success が true を返す
And ~/.aiworkflow/skills/{skillName}/SKILL.md が存在する
And ImportResult.importedAt がISO 8601形式の文字列である
```

**AC-2: Gistからのインポート成功**

```gherkin
Given パブリックGist "{gistId}" にSKILL.mdが含まれる
When ShareTarget { type: "gist", gistId: "{gistId}" } でインポートを実行する
Then ImportResult.success が true を返す
And ~/.aiworkflow/skills/{skillName}/SKILL.md が存在する
```

**AC-3: URLからのSKILL.mdインポート成功**

```gherkin
Given HTTPS URL "{url}" がSKILL.md形式のコンテンツを返す
When ShareTarget { type: "url", url: "{url}" } でインポートを実行する
Then ImportResult.success が true を返す
And インポートされたスキルが一覧に表示される
```

**AC-4: ローカルからのインポート成功**

```gherkin
Given ローカルパス "/path/to/skill" にSKILL.mdが存在する
When ShareTarget { type: "local", localPath: "/path/to/skill" } でインポートを実行する
Then ImportResult.success が true を返す
And ファイルが ~/.aiworkflow/skills/{skillName}/ にコピーされる
```

**AC-5: Gistエクスポートと共有URL取得成功**

```gherkin
Given スキル "my-skill" が ~/.aiworkflow/skills/ に存在する
And GitHub PATが設定済みでgistスコープを持つ
When skillName "my-skill" と ShareTarget { type: "gist" } でエクスポートを実行する
Then ExportResult.success が true を返す
And ExportResult.shareUrl がGist URLを含む
And ExportResult.exportedFiles にSKILL.mdが含まれる
```

**AC-6: セキュリティ検証動作確認**

```gherkin
Given ShareTarget { type: "local", localPath: "../../etc/passwd" } が指定される
When インポートを実行する
Then パストラバーサル攻撃として検出される
And ImportResult.success が false を返す
And エラーコードが Validation Error 範囲（1000-1999）である
```

**AC-7: 3段バリデーション動作確認**

```gherkin
Given 空文字列 "" がスキル名として渡される
When インポートを実行する
Then Validation Error が返却される

Given スペースのみ "   " がスキル名として渡される
When インポートを実行する
Then Validation Error が返却される
```

### Step 4: インターフェース仕様の整理

#### ShareTarget 型（discriminated union）

```typescript
export interface ShareTargetGitHub {
  type: "github";
  repo: string; // "owner/repo" 形式
  branch?: string; // デフォルト: "main"
  path?: string; // デフォルト: "/" (ルート)
}

export interface ShareTargetGist {
  type: "gist";
  gistId: string;
}

export interface ShareTargetURL {
  type: "url";
  url: string; // HTTPS必須
}

export interface ShareTargetLocal {
  type: "local";
  localPath: string;
}

export type ShareTarget =
  | ShareTargetGitHub
  | ShareTargetGist
  | ShareTargetURL
  | ShareTargetLocal;
```

#### ImportResult / ExportResult 型

```typescript
export interface ImportResult {
  success: boolean;
  skillName: string;
  skillPath: string;
  source: ShareTarget;
  importedAt: string; // ISO 8601（IPC境界ではDate型を使用しない）
}

export interface ExportResult {
  success: boolean;
  destination: ShareTarget;
  exportedFiles: string[];
  shareUrl?: string; // Gistエクスポート時のみ設定
}

export interface ImportValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  skillMetadata?: SkillMetadata;
}

export interface SourceValidation {
  isReachable: boolean;
  hasSkillMd: boolean;
  errors: string[];
}
```

#### IPCチャネル仕様

| チャネル名               | 方向            | 引数型                                            | 返却型                        | 用途                 |
| ------------------------ | --------------- | ------------------------------------------------- | ----------------------------- | -------------------- |
| `skill:importFromSource` | Renderer → Main | `ShareTarget`                                     | `IpcResult<ImportResult>`     | 外部ソースインポート |
| `skill:export`           | Renderer → Main | `{ skillName: string, destination: ShareTarget }` | `IpcResult<ExportResult>`     | スキルエクスポート   |
| `skill:validateSource`   | Renderer → Main | `ShareTarget`                                     | `IpcResult<SourceValidation>` | インポート元検証     |

#### 既存 skill:import との棲み分け

| チャネル                 | 引数型        | 用途                                         | 備考                      |
| ------------------------ | ------------- | -------------------------------------------- | ------------------------- |
| `skill:import`           | `string`      | ローカルスキルディレクトリ名でのインポート   | 既存機能。変更しない      |
| `skill:importFromSource` | `ShareTarget` | GitHub/Gist/URL/ローカルパスからのインポート | TASK-9F新規。別チャネル名 |

**棲み分けの根拠**: P44（IPCインターフェース不整合）の教訓から、同一チャネル名で異なる引数型を使用すると `ipcMain.handle()` の二重登録例外が発生する。既存の `skill:import` は `string`（スキル名）を受け取るため、`ShareTarget` オブジェクトを受け取る新機能は `skill:importFromSource` として分離する。

## 成果物

| 成果物       | 説明          | 配置先                                       |
| ------------ | ------------- | -------------------------------------------- |
| 要件定義書   | FR/NFR定義    | `outputs/phase-1/requirements-definition.md` |
| 受け入れ基準 | Gherkin形式AC | `outputs/phase-1/acceptance-criteria.md`     |
| スコープ定義 | 機能スコープ  | `outputs/phase-1/scope-definition.md`        |

## 統合テスト連携

- FR-1〜FR-4（インポート系）: 各ソースタイプからのインポート成功・失敗を統合テストで検証する
- FR-5〜FR-6（エクスポート系）: Gist/ローカルへのエクスポート成功・失敗を統合テストで検証する
- FR-7〜FR-8（検証系）: インポート前検証とソース検証の正常系・異常系を統合テストで検証する
- NFR-1（セキュリティ）: パストラバーサル防止、3段バリデーション、HTTPS強制をセキュリティテストで検証する
- NFR-3（エラーハンドリング）: 各エラーカテゴリのリトライ動作を統合テストで検証する
- 既存 `skill:import` との共存: 新チャネル追加後も既存インポート機能が正常動作することをリグレッションテストで検証する

## 完了条件

- [ ] FR-1〜FR-8の全8項目が入力・出力・前提条件・正常系・異常系を含めて定義されている
- [ ] NFR-1〜NFR-4の全4項目が具体的な数値基準を含めて定義されている
- [ ] 受け入れ基準がGherkin形式で7件以上定義されている
- [ ] ShareTarget/ImportResult/ExportResult/ImportValidation/SourceValidationの型定義が完成している
- [ ] IPCチャネル仕様（3チャネル）が引数型・返却型を含めて定義されている
- [ ] 既存skill:importとskill:importFromSourceの棲み分けが明文化されている
- [ ] 本Phase内の全タスクを100%実行完了
- [ ] artifacts.jsonが更新されている

## スキル100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 2: 設計

## 備考

- `ShareTarget` は discriminated union（判別共用体）として設計し、`type` フィールドで4種のソースを識別する。これによりTypeScriptのnarrowingが自動的に機能し、各ソースタイプ固有のフィールドに型安全にアクセスできる
- IPC境界でのDate型はISO 8601文字列として送受信する（Electronのシリアライゼーションで Date オブジェクトが正しく転送されないため）
- GitHub API呼び出しにはOctokit SDKを使用し、認証にはPersonal Access Token（PAT）を使用する。OAuth App認証はスコープが広すぎるため採用しない
- 既存の `skill-creator:share` チャネル（api-ipc-agent.mdに記載）は SkillCreatorService の内部共有機能であり、TASK-9Fの `skill:export` とは別機能。混同しないこと
