# Phase 1: 要件定義書

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| タスクID   | TASK-9F              |
| Phase      | 1                    |
| 成果物     | 要件定義書（FR/NFR） |
| 作成日     | 2026-02-27           |
| 機能名     | skill-share          |
| ステータス | 完了                 |

---

## 1. 機能要件（FR-1 〜 FR-8）

### FR-1: GitHub リポジトリからのスキルインポート

| 項目     | 内容                                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------------------ |
| 入力型   | `ShareTarget { type: "github", repo: string, branch?: string, path?: string }`                                     |
| 出力型   | `ImportResult { success: boolean, skillName: string, skillPath: string, source: ShareTarget, importedAt: string }` |
| 前提条件 | 対象リポジトリがパブリック、またはユーザーがPATを設定済み                                                          |

**正常系フロー:**

1. 指定リポジトリの指定パス（デフォルト: ルート）からSKILL.mdと関連ファイルを取得する
2. ファイル群を `~/.aiworkflow/skills/{skillName}/` にコピーする
3. ImportResultを返却する（importedAtはISO 8601文字列）

**異常系フロー:**

| 異常系                    | エラーカテゴリ         | コード範囲 | リトライ |
| ------------------------- | ---------------------- | ---------- | -------- |
| リポジトリ不存在（404）   | Business Error         | 2000-2999  | 不可     |
| ブランチ不存在            | Business Error         | 2000-2999  | 不可     |
| パス不存在                | Business Error         | 2000-2999  | 不可     |
| SKILL.md不存在            | Business Error         | 2000-2999  | 不可     |
| ネットワークエラー        | External Service Error | 3000-3999  | 可能     |
| GitHub API rate limit超過 | External Service Error | 3000-3999  | 可能     |

---

### FR-2: GitHub Gist からのスキルインポート

| 項目     | 内容                                              |
| -------- | ------------------------------------------------- |
| 入力型   | `ShareTarget { type: "gist", gistId: string }`    |
| 出力型   | `ImportResult`                                    |
| 前提条件 | 対象GistがパブリックまたはユーザーがPATを設定済み |

**正常系フロー:**

1. 指定GistからSKILL.mdを含むファイル群を取得する
2. ファイル群を `~/.aiworkflow/skills/{skillName}/` にコピーする
3. ImportResultを返却する

**異常系フロー:**

| 異常系             | エラーカテゴリ         | コード範囲 | リトライ |
| ------------------ | ---------------------- | ---------- | -------- |
| Gist不存在（404）  | Business Error         | 2000-2999  | 不可     |
| SKILL.md不存在     | Business Error         | 2000-2999  | 不可     |
| ネットワークエラー | External Service Error | 3000-3999  | 可能     |
| rate limit超過     | External Service Error | 3000-3999  | 可能     |

---

### FR-3: URL（SKILL.md直指定）からのインポート

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| 入力型   | `ShareTarget { type: "url", url: string }` |
| 出力型   | `ImportResult`                             |
| 前提条件 | URLがHTTPSプロトコルであること             |

**正常系フロー:**

1. 指定URLからSKILL.mdを取得する
2. 単一ファイルスキルとして `~/.aiworkflow/skills/{skillName}/` に保存する
3. ImportResultを返却する

**異常系フロー:**

| 異常系                         | エラーカテゴリ         | コード範囲 | リトライ |
| ------------------------------ | ---------------------- | ---------- | -------- |
| URL不到達                      | External Service Error | 3000-3999  | 可能     |
| 非HTTPSプロトコル              | Validation Error       | 1000-1999  | 不可     |
| レスポンスがSKILL.md形式でない | Business Error         | 2000-2999  | 不可     |
| タイムアウト（30秒）           | External Service Error | 3000-3999  | 可能     |

---

### FR-4: ローカルディレクトリからのインポート

| 項目     | 内容                                               |
| -------- | -------------------------------------------------- |
| 入力型   | `ShareTarget { type: "local", localPath: string }` |
| 出力型   | `ImportResult`                                     |
| 前提条件 | 指定パスが存在し、読み取り権限がある               |

**正常系フロー:**

1. 指定ローカルディレクトリからSKILL.mdと関連ファイルを取得する
2. ファイル群を `~/.aiworkflow/skills/{skillName}/` にコピーする
3. ImportResultを返却する

**異常系フロー:**

| 異常系                     | エラーカテゴリ       | コード範囲 | リトライ |
| -------------------------- | -------------------- | ---------- | -------- |
| パス不存在                 | Validation Error     | 1000-1999  | 不可     |
| 読み取り権限なし           | Infrastructure Error | 4000-4999  | 条件付き |
| SKILL.md不存在             | Business Error       | 2000-2999  | 不可     |
| パストラバーサル攻撃の検出 | Validation Error     | 1000-1999  | 不可     |

---

### FR-5: Gist へのスキルエクスポート（共有URL取得）

| 項目     | 内容                                                                                                     |
| -------- | -------------------------------------------------------------------------------------------------------- |
| 入力型   | `skillName: string`, `ShareTarget { type: "gist" }`                                                      |
| 出力型   | `ExportResult { success: boolean, destination: ShareTarget, exportedFiles: string[], shareUrl: string }` |
| 前提条件 | 対象スキルが `~/.aiworkflow/skills/` に存在し、ユーザーがGitHub PATを設定済み                            |

**正常系フロー:**

1. 対象スキルのSKILL.mdと関連ファイルを読み取る
2. Gist APIを呼び出してGistを作成する
3. 共有URLを含むExportResultを返却する

**異常系フロー:**

| 異常系                      | エラーカテゴリ         | コード範囲 | リトライ |
| --------------------------- | ---------------------- | ---------- | -------- |
| スキル不存在                | Business Error         | 2000-2999  | 不可     |
| PAT未設定                   | Validation Error       | 1000-1999  | 不可     |
| PAT権限不足（gistスコープ） | External Service Error | 3000-3999  | 不可     |
| ネットワークエラー          | External Service Error | 3000-3999  | 可能     |
| rate limit超過              | External Service Error | 3000-3999  | 可能     |

---

### FR-6: ローカルディレクトリへのエクスポート

| 項目     | 内容                                                                                   |
| -------- | -------------------------------------------------------------------------------------- |
| 入力型   | `skillName: string`, `ShareTarget { type: "local", localPath: string }`                |
| 出力型   | `ExportResult { success: boolean, destination: ShareTarget, exportedFiles: string[] }` |
| 前提条件 | 対象スキルが存在し、出力先ディレクトリに書き込み権限がある                             |

**正常系フロー:**

1. 対象スキルのSKILL.mdと関連ファイルを読み取る
2. 指定ディレクトリにファイル群をコピーする
3. ExportResultを返却する

**異常系フロー:**

| 異常系                     | エラーカテゴリ       | コード範囲 | リトライ |
| -------------------------- | -------------------- | ---------- | -------- |
| スキル不存在               | Business Error       | 2000-2999  | 不可     |
| 出力先書き込み権限なし     | Infrastructure Error | 4000-4999  | 条件付き |
| ディスク容量不足           | Infrastructure Error | 4000-4999  | 条件付き |
| パストラバーサル攻撃の検出 | Validation Error     | 1000-1999  | 不可     |

---

### FR-7: インポート前のスキル検証

| 項目     | 内容                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------ |
| 入力型   | `skillPath: string`（インポート後のローカルパス）                                                            |
| 出力型   | `ImportValidation { isValid: boolean, errors: string[], warnings: string[], skillMetadata?: SkillMetadata }` |
| 前提条件 | なし                                                                                                         |

**正常系フロー:**

1. SKILL.md存在確認を実施する
2. 必須フィールド（name, description, triggers）存在確認を実施する
3. 構造検証（Anchor定義の妥当性）を実施する
4. ImportValidationを返却する

**異常系フロー:**

| 異常系                      | エラーカテゴリ   | コード範囲 | リトライ |
| --------------------------- | ---------------- | ---------- | -------- |
| SKILL.md不存在              | Validation Error | 1000-1999  | 不可     |
| 必須フィールド欠落          | Validation Error | 1000-1999  | 不可     |
| 不正なYAML/マークダウン構造 | Validation Error | 1000-1999  | 不可     |

---

### FR-8: インポートソース検証

| 項目     | 内容                                                                               |
| -------- | ---------------------------------------------------------------------------------- |
| 入力型   | `ShareTarget`                                                                      |
| 出力型   | `SourceValidation { isReachable: boolean, hasSkillMd: boolean, errors: string[] }` |
| 前提条件 | なし                                                                               |

**正常系フロー:**

1. ソースの到達性確認（GitHubリポジトリ存在、Gist存在、URL到達、ローカルパス存在）を実施する
2. SKILL.md存在確認を実施する
3. SourceValidationを返却する

**異常系フロー:**

| 異常系               | エラーカテゴリ         | コード範囲 | リトライ |
| -------------------- | ---------------------- | ---------- | -------- |
| ソース不到達         | External Service Error | 3000-3999  | 可能     |
| 認証エラー           | External Service Error | 3000-3999  | 不可     |
| タイムアウト（15秒） | External Service Error | 3000-3999  | 可能     |

---

## 2. 非機能要件（NFR-1 〜 NFR-4）

### NFR-1: セキュリティ

| No  | 要件                                                                                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1-1 | 全IPCハンドラで `validateIpcSender()` による送信元ウィンドウ検証を実施する                                                                       |
| 1-2 | 全文字列引数にP42準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）を適用する                                                       |
| 1-3 | ShareTarget.localPathおよびFR-6の出力先パスに対してパストラバーサル防止チェックを実施する（`..` セグメント検出、シンボリックリンク解決後の検証） |
| 1-4 | URL入力はHTTPSプロトコルのみ許可する（HTTPは拒否）                                                                                               |
| 1-5 | GitHub PATはMain Processの暗号化ストレージに保存し、Rendererには送信しない                                                                       |
| 1-6 | エラーメッセージは `sanitizeErrorMessage()` で内部情報を除去してからRendererに返却する                                                           |

### NFR-2: パフォーマンス

| No  | 要件                                                                       | 数値基準                          |
| --- | -------------------------------------------------------------------------- | --------------------------------- |
| 2-1 | GitHub APIリクエストは並列実行しリポジトリ内の複数ファイル取得を効率化する | 最大同時5リクエスト               |
| 2-2 | 大容量スキルはストリーミングダウンロードで対応し、メモリ使用量を制限する   | 10MB超                            |
| 2-3 | インポート/エクスポート処理中はRenderer側にプログレスイベントを送信する    | `skill:importFromSource:progress` |
| 2-4 | GitHub API rate limit到達時はRetry-Afterヘッダーに基づいて待機する         | -                                 |

### NFR-3: エラーハンドリング

| No  | 要件                                                                       |
| --- | -------------------------------------------------------------------------- |
| 3-1 | サービス層の全メソッドは `Result<T, E>` パターンで明示的にエラーを返却する |
| 3-2 | エラーカテゴリ分類（5カテゴリ、コード範囲1000-5999）に従って分類する       |
| 3-3 | try/catchでエラーを握りつぶさず、上位に伝播させる                          |

**エラーカテゴリ詳細:**

| カテゴリ               | コード範囲 | リトライ | 具体例                                   |
| ---------------------- | ---------- | -------- | ---------------------------------------- |
| Validation Error       | 1000-1999  | 不可     | 不正なShareTarget形式、空文字列入力      |
| Business Error         | 2000-2999  | 不可     | スキル不存在、SKILL.md欠落               |
| External Service Error | 3000-3999  | 可能     | GitHub API障害、ネットワークエラー       |
| Infrastructure Error   | 4000-4999  | 条件付き | ファイルシステムエラー、ディスク容量不足 |
| Internal Error         | 5000-5999  | 不可     | 予期しないエラー                         |

**リトライ戦略（External Service Error）:**

- 最大リトライ回数: 3回
- バックオフ方式: 指数バックオフ
- rate limit到達時: `Retry-After` ヘッダーの秒数だけ待機

### NFR-4: テスタビリティ

| No  | 要件                                                                                                                          |
| --- | ----------------------------------------------------------------------------------------------------------------------------- |
| 4-1 | SkillShareManagerはConstructor Injectionで外部依存（GitHubClient, FileSystemAdapter, SkillValidator, SkillService）を注入する |
| 4-2 | BrowserWindow依存の機能はSetter Injectionで注入する（P34対策）                                                                |
| 4-3 | 全外部サービス呼び出しはインターフェース経由でモック可能にする                                                                |
| 4-4 | テスト間で状態を共有しない設計とする（P9対策）                                                                                |

**DI依存一覧:**

| 注入方式              | 依存              | 用途                              |
| --------------------- | ----------------- | --------------------------------- |
| Constructor Injection | GitHubClient      | GitHub/Gist APIアクセス           |
| Constructor Injection | FileSystemAdapter | ファイルシステム操作              |
| Constructor Injection | SkillValidator    | SKILL.md構造検証                  |
| Constructor Injection | SkillService      | 既存スキル管理サービスとの連携    |
| Setter Injection      | BrowserWindow     | プログレスイベント送信（P34対策） |

---

## 3. 型定義

### ShareTarget（discriminated union）

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

### ImportResult / ExportResult

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
```

### ImportValidation / SourceValidation

```typescript
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

### SkillShareError

```typescript
export interface SkillShareError {
  code: number; // エラーコード（1000-5999）
  message: string;
  category:
    | "validation"
    | "business"
    | "external"
    | "infrastructure"
    | "internal";
  isRetryable: boolean;
  details?: string;
}
```
