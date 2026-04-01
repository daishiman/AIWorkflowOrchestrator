# 実装パターン総合ガイド / advanced specification

> 親仕様書: [architecture-implementation-patterns.md](architecture-implementation-patterns.md)
> 役割: advanced specification

## デスクトップ（Electron）実装パターン

### Preload invoke hang containment パターン（safeInvoke timeout）

> **導入タスク**: TASK-FIX-SAFEINVOKE-TIMEOUT-001（監査観点）

#### 問題

Preload の `safeInvoke()` が `ipcRenderer.invoke()` をそのまま返すと、Main Process 側の未応答や外部 API ハング時に Renderer が永続 pending になる。特に認証初期化や設定ロードでは `isLoading` が落ちず、画面遷移が止まる。

#### 解決パターン

```typescript
const IPC_TIMEOUT_MS = 5000;
const CHANNEL_TIMEOUTS: Partial<Record<string, number>> = {
  "auth:login": 500,
  "auth:get-session": 10000,
  "auth:refresh": 10000,
  "skill-creator:plan": 30000,
  "skill:execute": 60000,
};

function getChannelTimeout(channel: string): number {
  return CHANNEL_TIMEOUTS[channel] ?? IPC_TIMEOUT_MS;
}

function invokeWithTimeout<T>(channel: string, ...args: unknown[]): Promise<T> {
  if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
    return Promise.reject(new Error(`Channel ${channel} is not allowed`));
  }

  const timeout = getChannelTimeout(channel);

  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(
        new Error(
          `IPC timeout: ${channel} did not respond within ${timeout}ms`,
        ),
      );
    }, timeout);

    ipcRenderer
      .invoke(channel, ...args)
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result as T);
      })
      .catch((error: unknown) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}
```

#### 適用基準

| 条件 | 判断 |
| ---- | ---- |
| Preload 共通ラッパーで多数の `invoke` を集約している | timeout を共通化する |
| 戻り値シグネチャを変えたくない | `Promise<T>` を維持したまま `setTimeout` / `clearTimeout` ベースで timeout を注入する |
| Renderer 側に loading state がある | timeout エラーを catch して復旧パスを明示する |
| まだ実装差分が存在しない | spec は pending / spec_created に留め、completed としない |

#### 注意事項

- timeout 追加は `safeOn` にはそのまま適用しない
- `IPC_TIMEOUT_MS` は fallback であり、全チャンネル共通の固定値ではない
- 長時間処理チャンネルは `CHANNEL_TIMEOUTS` に追加し、呼び出し側の timeout 分岐を増やさない
- channel 名は whitelist 通過済み値のみ error 文言へ出す
- テストは `advanceTimersByTime` 系を使い、永続 pending mock で再現する

### Renderer local preview resilience パターン（TASK-UI-04C）

> **導入タスク**: TASK-UI-04C-WORKSPACE-PREVIEW

#### 問題

既存 IPC (`file:read`) を再利用する preview UI では、Main / Preload 契約を増やさなくても feature 層で hang、false positive search、structured parse failure が発生しうる。これを channel 追加や global helper 化だけで解こうとすると責務が過剰に広がる。

#### 解決パターン

| 論点 | パターン |
| ---- | -------- |
| hang containment | feature 層で `Promise.race` による timeout を掛け、限定回数 retry で閉じる |
| fuzzy search | 「一致判定」と「順位補正」を分離し、`score = 0` を候補に入れない |
| structured preview | parse failure は recoverable error として banner + source fallback を出す |
| transport failure | timeout / read failure は fatal surface に落とし、loading を確実に解除する |

#### 適用基準

| 条件 | 判断 |
| ---- | ---- |
| 既存 IPC の戻り値契約は変えたくない | Renderer local resilience で閉じる |
| failure が UI に局所化している | feature hook / view に timeout / fallback を置く |
| parse failure でも raw source は読める | fatal error ではなく fallback UI に分離する |
| ranking bug が結果誤認を生む | no-match を返す単体テストを先に置く |

#### 苦戦箇所と対策

| 苦戦箇所 | 原因 | 対策 |
| --- | --- | --- |
| subsequence score 0 でも候補が残る | boost 計算が match 判定より先に走る | `score > 0` を gate にした |
| `file:read` hang で loading が固着する | Renderer 側 timeout 不在 | 5秒 timeout + 1秒間隔 3回 retry を追加 |
| JSON/YAML parse failure が fatal 扱いになる | transport と parse を同じ error surface へ載せる | banner + `SourceView` fallback に分離した |

#### 関連未タスク

| タスクID | 目的 | タスク仕様書 |
| --- | --- | --- |
| UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001 | Renderer local preview resilience を utility / test / error taxonomy まで共通化し、次回 preview/search UI の初動を短縮する | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-workspace-preview-search-resilience-guard-001.md` |

---

## パフォーマンス最適化パターン

### React最適化

| テクニック    | 用途               | 適用基準                                  |
| ------------- | ------------------ | ----------------------------------------- |
| React.memo    | 純粋コンポーネント | Props変化時のみ再レンダリングが必要な場合 |
| useMemo       | 重い計算結果       | 計算コストが高く、依存が変わらない場合    |
| useCallback   | コールバック安定化 | React.memo子に渡す関数                    |
| lazy/Suspense | コード分割         | ルートレベルのコンポーネント              |
| useTransition | 非緊急更新         | 重い状態更新の優先度低下                  |

### リスト最適化

| 技術                              | 用途           | 閾値         |
| --------------------------------- | -------------- | ------------ |
| 仮想化（@tanstack/react-virtual） | 大量リスト     | 100件以上    |
| ウィンドウイング                  | 無限スクロール | 動的読み込み |

### バンドル最適化

| 手法           | 効果               | 実現方法            |
| -------------- | ------------------ | ------------------- |
| Tree Shaking   | 未使用コード削除   | ESM形式のimport使用 |
| Code Splitting | 初期ロード削減     | dynamic import      |
| 依存関係最小化 | バンドルサイズ削減 | pnpm why で分析     |

### SQLite最適化

| 手法               | 効果               |
| ------------------ | ------------------ |
| インデックス作成   | クエリ高速化       |
| WALモード          | 並行性能向上       |
| Prepared Statement | クエリプラン再利用 |
| VACUUM             | 断片化解消         |

---

## セキュリティ実装パターン

### 入力バリデーション

| 手法           | 説明                              |
| -------------- | --------------------------------- |
| スキーマ定義   | Zodでフィールドごとにルール定義   |
| parse使用      | 失敗時に例外をthrow               |
| safeParse使用  | 失敗時にエラーオブジェクトを返却  |
| カスタムルール | regex、refinementで独自ルール追加 |

### サニタイゼーション

| 対象         | 方法                            |
| ------------ | ------------------------------- |
| HTML表示     | Reactのデフォルトエスケープ     |
| URL          | encodeURIComponent              |
| SQLクエリ    | Drizzle ORMの自動エスケープ     |
| ファイルパス | path.normalize + 許可リスト検証 |

### 認証フロー

| フェーズ       | 処理内容                              |
| -------------- | ------------------------------------- |
| 開始           | Code Verifier生成、Code Challenge計算 |
| 認可リクエスト | PKCEパラメータ付きで認可URLを開く     |
| コールバック   | カスタムプロトコルでコードを受信      |
| トークン交換   | Code Verifierを使用してトークン取得   |
| 保存           | safeStorageで暗号化して保存           |

### IPC L3ドメイン検証パターン（UT-9B-H-003）

IPCハンドラーの3層防御モデルにおけるL3（ドメイン固有検証）の実装パターン。

#### 3層防御モデル

| レイヤー | 検証内容             | 実装                                                               |
| -------- | -------------------- | ------------------------------------------------------------------ |
| L1       | 送信元ウィンドウ検証 | `validateIpcSender(event)`                                         |
| L2       | 引数の型チェック     | `typeof arg === "string"`                                          |
| L3       | ドメイン固有検証     | `validatePath()`, `ALLOWED_SCHEMA_NAMES`, `sanitizeErrorMessage()` |

#### パストラバーサル防止（validatePath）

```typescript
function validatePath(inputPath: string, _paramName: string): string | null {
  if (!inputPath) return null; // 空文字列
  if (inputPath.includes("\0")) return null; // NULLバイト
  if (inputPath.startsWith("\\\\")) return null; // UNCパス
  if (inputPath.includes("../")) return null; // Unixトラバーサル
  if (inputPath.includes("..\\")) return null; // Windowsトラバーサル
  return path.normalize(inputPath);
}
```

**検出パターン**: 空文字列 → NULLバイト → UNCパス → Unixトラバーサル → Windowsトラバーサル（5段階順序が重要）

#### エラーサニタイズ（sanitizeErrorMessage）

```typescript
const STACK_TRACE_PATTERN = /\n\s+at\s+.*/g;
const UNIX_PATH_PATTERN = /\/[\w./\\-]+/g;
const WINDOWS_PATH_PATTERN = /[A-Z]:\\[\w.\\-]+/gi;
const SENSITIVE_DATA_PATTERN = /(token|key|password|secret)=\S+/gi;

function sanitizeErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return "スキル作成処理でエラーが発生しました";
  return error.message
    .replace(STACK_TRACE_PATTERN, "")
    .replace(UNIX_PATH_PATTERN, "[path]")
    .replace(WINDOWS_PATH_PATTERN, "[path]")
    .replace(SENSITIVE_DATA_PATTERN, "$1=***");
}
```

**適用**: 全IPCハンドラーのcatchブロックで使用

#### ホワイトリスト検証（ALLOWED_SCHEMA_NAMES）

```typescript
const ALLOWED_SCHEMA_NAMES = ["task-spec", "skill-spec", "mode"] as const;

// 使用例（ハンドラー内）
if (
  !ALLOWED_SCHEMA_NAMES.includes(
    schemaName as (typeof ALLOWED_SCHEMA_NAMES)[number],
  )
) {
  return { success: false, error: `Invalid schema name: ${schemaName}` };
}
```

**拡張手順**: (1) ResourceLoaderにスキーマ追加 → (2) 配列に値追加 → (3) テスト追加

#### 適用チェックリスト

| チェック項目          | 対象             |
| --------------------- | ---------------- |
| L1: sender検証        | 全ハンドラー     |
| L2: 型チェック        | 全引数           |
| L3a: パス検証         | ファイルパス引数 |
| L3b: ホワイトリスト   | 列挙値引数       |
| L3c: エラーサニタイズ | 全catchブロック  |

**関連仕様書**: [security-electron-ipc.md](./security-electron-ipc.md)
**関連タスク**: UT-9B-H-003

### isKnownSkillFileError 型ガードパターン（TASK-9A-B 2026-02-19実装）

**目的**: 複数のIPCハンドラーで共通するエラー判別・サニタイズロジックをDRYに保つ

**課題**: 6つのIPCハンドラーで5種類のカスタムエラーを個別に instanceof チェックすると、30箇所の重複判定が発生

**解決策**: TypeScript の type guard 関数で union type を返し、各ハンドラーの catch ブロックを2行に集約

```typescript
/**
 * 既知のスキルファイルエラーかどうかを判定する型ガード関数
 * 既知エラー → error.message をそのまま返す（ビジネスロジックのエラー）
 * 未知エラー → "Internal error" を返して内部情報を漏洩しない
 */
function isKnownSkillFileError(
  error: unknown,
): error is
  | SkillNotFoundError
  | ReadonlySkillError
  | PathTraversalError
  | FileExistsError
  | FileNotFoundError {
  return (
    error instanceof SkillNotFoundError ||
    error instanceof ReadonlySkillError ||
    error instanceof PathTraversalError ||
    error instanceof FileExistsError ||
    error instanceof FileNotFoundError
  );
}

// 各ハンドラーの catch ブロック（6ハンドラー共通）
catch (error) {
  if (isKnownSkillFileError(error)) {
    return { success: false, error: error.message };
  }
  return { success: false, error: "Internal error" };
}
```

**適用**: 全6スキルファイル操作IPCハンドラーの catch ブロック

**エラークラス一覧**:

| エラークラス       | 発生条件                                           | クライアント向けメッセージ例             |
| ------------------ | -------------------------------------------------- | ---------------------------------------- |
| SkillNotFoundError | スキルディレクトリが存在しない                     | "Skill not found: my-skill"              |
| ReadonlySkillError | claude-skills 配下の読み取り専用スキルへの書き込み | "Cannot modify readonly skill: my-skill" |
| PathTraversalError | `../` 等を含む不正パス                             | "Path traversal detected: ../etc/passwd" |
| FileExistsError    | createFile で既存ファイルに対して実行              | "File already exists: SKILL.md"          |
| FileNotFoundError  | readFile/deleteFile で存在しないファイル指定       | "File not found: SKILL.md"               |

**関連**:

- 実装ファイル: `apps/desktop/src/main/ipc/skillFileHandlers.ts:34-49`
- テスト: `skillFileHandlers.security.test.ts` S-09〜S-11
- 関連パターン: [security-electron-ipc.md](./security-electron-ipc.md) の skillFileAPI セキュリティ実装パターン
- **未タスク**: UT-9A-B-002（IPCエラーサニタイズ共通ユーティリティ化）— isKnownSkillFileError パターンを他のIPCハンドラーに横展開

---
