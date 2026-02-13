# Phase 2: 設計 — SkillCreator IPCセキュリティ強化

## メタ情報

| 項目      | 内容                                                                                              |
| --------- | ------------------------------------------------------------------------------------------------- |
| タスクID  | UT-9B-H-003                                                                                       |
| Phase     | 2                                                                                                 |
| タスク名  | SkillCreator IPCセキュリティ強化（パストラバーサル対策、sanitizeError、schemaNameホワイトリスト） |
| Issue     | #796                                                                                              |
| 作成日    | 2026-02-12                                                                                        |
| 依存Phase | Phase 1（要件定義）                                                                               |

## 目的

Phase 1 で定義した3つのセキュリティ要件に対するアーキテクチャおよびインターフェースを設計する。既存の実装パターン（SkillFileManager.validatePath(), authModeHandlers.sanitizeErrorMessage()）との一貫性を保ちながら、skillCreatorHandlers.ts に組み込むセキュリティ関数とバリデーションロジックを定義する。

## 実行タスク

- Task 1: パストラバーサル防止設計: `validatePath()` の仕様と適用先を定義する。
- Task 2: エラーサニタイズ設計: `sanitizeErrorMessage()` の仕様を定義する。
- Task 3: schemaNameホワイトリスト設計: 許可値と検証ルールを確定する。
- Task 4: ハンドラー統合設計: ファイル内配置とエラー形式を定義する。

### Task 1: パストラバーサル防止 — validatePath()

#### 関数シグネチャ

```typescript
/**
 * パスのバリデーション（パストラバーサル対策）
 * SkillFileManager.validatePath() と同等のロジックを
 * IPCハンドラーレベルで実行する
 *
 * @param inputPath - 検証対象のパス文字列
 * @param paramName - エラーメッセージ用のパラメータ名
 * @returns 正規化されたパス、または検証失敗時にnull
 */
function validatePath(inputPath: string, paramName: string): string | null;
```

#### バリデーションロジック

```
1. 空文字列チェック: inputPath が空文字列または undefined → null を返す
2. NULLバイトチェック: inputPath に \x00 が含まれる → null を返す
3. UNCパスチェック: inputPath が \\\\ で始まる → null を返す
4. 正規化: resolvedPath = path.resolve(inputPath)
5. トラバーサルチェック:
   - resolvedPath が inputPath の正規化結果と一致しない場合（../ 解決後にベース外に出る場合）→ null を返す
   - inputPath に '../' または '..\' が含まれる → null を返す（明示的な上位参照の禁止）
6. 検証成功: resolvedPath を返す
```

#### 攻撃パターンと検証結果

| 攻撃パターン                | 入力例                        | 検証結果 | 検出ステップ |
| --------------------------- | ----------------------------- | -------- | ------------ |
| 相対パス上位参照（Unix）    | `../../etc/passwd`            | 拒否     | Step 5       |
| 相対パス上位参照（Windows） | `..\windows\system32`         | 拒否     | Step 5       |
| NULLバイトインジェクション  | `valid/path\x00evil`          | 拒否     | Step 2       |
| UNCパス                     | `\\\\server\\share`           | 拒否     | Step 3       |
| 空文字列                    | `""`                          | 拒否     | Step 1       |
| 正常パス                    | `/Users/user/skills/my-skill` | 許可     | -            |
| 正常相対パス                | `./skills/my-skill`           | 許可     | -            |

#### 適用箇所

| IPCチャンネル                 | 対象パラメータ         |
| ----------------------------- | ---------------------- |
| `skill-creator:create`        | `tasksDir`, `skillDir` |
| `skill-creator:execute-tasks` | `tasksDir`, `skillDir` |
| `skill-creator:validate`      | `tasksDir`             |

#### リファレンス実装

- **SkillFileManager.validatePath()**: `path.resolve()` + `startsWith(resolvedBase + path.sep)` パターン
- 本実装ではベースディレクトリ制約は設けず、パストラバーサルの直接検出に注力する（SkillCreatorServiceが動的にベースパスを決定するため）

### Task 2: エラーサニタイズ — sanitizeErrorMessage()

#### 関数シグネチャ

```typescript
/**
 * エラーメッセージのサニタイズ（内部情報漏洩防止）
 * authModeHandlers.ts の sanitizeErrorMessage() と同等のパターン
 *
 * @param error - キャッチされたエラーオブジェクト
 * @returns サニタイズ済みのエラーメッセージ文字列
 */
function sanitizeErrorMessage(error: unknown): string;
```

#### サニタイズロジック

```
1. Error型チェック: error が Error インスタンスでない → "スキル作成処理でエラーが発生しました" を返す
2. メッセージ取得: message = error.message
3. ファイルパス除去: /\/[^\s:]+/g → "[path]" に置換
   - Unix系パス: /Users/xxx/..., /home/xxx/...
4. Windowsパス除去: /[A-Z]:\\[^\s:]+/gi → "[path]" に置換
5. スタックトレース除去: /\bat\s+.+/g → "" に置換
   - "at Function.execute (/app/src/...)" パターン
6. 環境変数・キー値除去: /(?:key|token|secret|password|api[_-]?key)\s*[=:]\s*\S+/gi → "[redacted]" に置換
7. 空文字列チェック: サニタイズ後が空 → "スキル作成処理でエラーが発生しました" を返す
8. サニタイズ済みメッセージを返す
```

#### サニタイズ対象パターン

| パターン種別        | 正規表現                                                         | 置換後       |
| ------------------- | ---------------------------------------------------------------- | ------------ |
| Unixファイルパス    | `/\/[^\s:]+/g`                                                   | `[path]`     |
| Windowsファイルパス | `/[A-Z]:\\[^\s:]+/gi`                                            | `[path]`     |
| スタックトレース行  | `/\bat\s+.+/g`                                                   | `""`         |
| 機密キー値          | `/(?:key\|token\|secret\|password\|api[_-]?key)\s*[=:]\s*\S+/gi` | `[redacted]` |

#### 適用箇所

- 全IPCハンドラーの `catch` ブロック内
- エラーレスポンスの `error` フィールドに設定する前に適用

#### エラーレスポンス形式

```typescript
// 既存のIpcResult<T>型に準拠
{
  success: false,
  error: sanitizeErrorMessage(caughtError)
}
```

#### リファレンス実装

- **authModeHandlers.ts sanitizeErrorMessage()**: トークン・APIキーの正規表現マスク + フォールバックメッセージ

### Task 3: schemaNameホワイトリスト — ALLOWED_SCHEMA_NAMES

#### 定数定義

```typescript
/**
 * 許可されたスキーマ名の一覧
 * SkillCreatorServiceで使用される既知のスキーマ名のみ許可
 */
const ALLOWED_SCHEMA_NAMES: readonly string[] = [
  "task-spec",
  "skill-spec",
  "mode",
] as const;
```

#### バリデーションロジック

```
1. 空文字列チェック: schemaName が空文字列 → 拒否
2. ホワイトリストチェック: ALLOWED_SCHEMA_NAMES.includes(schemaName) → false なら拒否
3. 検証成功: バリデーション通過
```

#### 検証結果テーブル

| 入力値                  | 検証結果 | 理由                       |
| ----------------------- | -------- | -------------------------- |
| `"task-spec"`           | 許可     | ホワイトリストに含まれる   |
| `"skill-spec"`          | 許可     | ホワイトリストに含まれる   |
| `"mode"`                | 許可     | ホワイトリストに含まれる   |
| `"unknown-schema"`      | 拒否     | ホワイトリストに含まれない |
| `""`                    | 拒否     | 空文字列                   |
| `"../../malicious"`     | 拒否     | ホワイトリストに含まれない |
| `"task-spec; rm -rf /"` | 拒否     | ホワイトリストに含まれない |

#### 適用箇所

| IPCチャンネル                   | 対象パラメータ |
| ------------------------------- | -------------- |
| `skill-creator:validate-schema` | `schemaName`   |

### Task 4: ハンドラー統合設計

#### 変更対象ファイル

| ファイル                                                                    | 変更内容                             |
| --------------------------------------------------------------------------- | ------------------------------------ |
| `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                         | セキュリティ関数追加・ハンドラー更新 |
| `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.security.test.ts` | セキュリティテスト新規作成           |

#### ファイル内配置

```
skillCreatorHandlers.ts
├── import文
├── ALLOWED_SCHEMA_NAMES 定数定義
├── validatePath() 関数定義
├── sanitizeErrorMessage() 関数定義
├── registerSkillCreatorHandlers() 関数
│   ├── skill-creator:detect-mode ハンドラー
│   │   └── catch → sanitizeErrorMessage()
│   ├── skill-creator:create ハンドラー
│   │   ├── validatePath(tasksDir) → 失敗時早期リターン
│   │   ├── validatePath(skillDir) → 失敗時早期リターン
│   │   └── catch → sanitizeErrorMessage()
│   ├── skill-creator:execute-tasks ハンドラー
│   │   ├── validatePath(tasksDir) → 失敗時早期リターン
│   │   ├── validatePath(skillDir) → 失敗時早期リターン
│   │   └── catch → sanitizeErrorMessage()
│   ├── skill-creator:validate ハンドラー
│   │   ├── validatePath(tasksDir) → 失敗時早期リターン
│   │   └── catch → sanitizeErrorMessage()
│   ├── skill-creator:validate-schema ハンドラー
│   │   ├── ALLOWED_SCHEMA_NAMES.includes(schemaName) チェック
│   │   └── catch → sanitizeErrorMessage()
│   └── skill-creator:progress リスナー（変更なし — Main→Renderer方向のため）
```

#### エラーレスポンスの統一形式

```typescript
// パスバリデーション失敗時
{
  success: false,
  error: `無効なパスが指定されました: ${paramName}`
}

// schemaNameバリデーション失敗時
{
  success: false,
  error: `無効なスキーマ名が指定されました: ${schemaName}`
}

// 内部エラー（サニタイズ済み）
{
  success: false,
  error: sanitizeErrorMessage(caughtError)
}
```

## 設計判断の根拠

| 判断                                           | 根拠                                                                                                     |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| validatePathにベースディレクトリ制約を設けない | SkillCreatorServiceが動的にベースパスを決定するため、IPCレベルでは直接攻撃パターンの検出に注力           |
| sanitizeErrorMessageを同一ファイルに配置       | ハンドラーファイル内の局所的な利用のため、共通ユーティリティ化は不要（将来的に共通化する場合は別タスク） |
| ALLOWED_SCHEMA_NAMESを静的配列で定義           | スキーマ名は固定的であり、動的に変更される要件がない。`as const` で型安全性を確保                        |
| progress チャンネルはセキュリティ対策対象外    | Main→Renderer方向の送信であり、Renderer からの入力パラメータを受け取らない                               |

## 参照資料

| 資料                          | パス                                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------------------- |
| Phase 1 要件定義              | `docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/phase-1-requirements.md`  |
| IPC セキュリティ仕様          | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                |
| API/Electron セキュリティ索引 | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                |
| 実装パターン仕様              | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` |
| スキルIPC セキュリティ仕様    | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   |
| エラーハンドリング仕様        | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       |
| Skill Creator IPC型定義       | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        |
| Agent SDK スキルI/F仕様       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           |
| 失敗事例・教訓                | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      |
| 既存パス検証実装              | `apps/desktop/src/main/services/skill/SkillFileManager.ts`                                  |
| 既存エラーサニタイズ実装      | `apps/desktop/src/main/ipc/authModeHandlers.ts`                                             |

## 統合テスト連携

| 層                   | テスト内容                                                                      |
| -------------------- | ------------------------------------------------------------------------------- |
| バックエンド（Main） | 設計どおりに `validatePath` / `sanitizeErrorMessage` / schemaName検証を実装する |
| IPC通信              | 3層防御（Sender検証→型検証→ドメイン検証）の流れを崩さない                       |
| Preload/セキュリティ | Renderer に返すエラーがサニタイズ前提であることをテスト設計に反映する           |

## 成果物

| 成果物 | パス                                                                                 |
| ------ | ------------------------------------------------------------------------------------ |
| 設計書 | `docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/phase-2-design.md` |

## 完了条件

- [ ] validatePath() の関数シグネチャとバリデーションロジックが定義されている
- [ ] sanitizeErrorMessage() の関数シグネチャとサニタイズロジックが定義されている
- [ ] ALLOWED_SCHEMA_NAMES の定数定義と検証ロジックが定義されている
- [ ] 各関数の適用箇所（IPCチャンネルとパラメータ）が明示されている
- [ ] エラーレスポンス形式が IpcResult<T> 型に準拠している
- [ ] 既存パターン（SkillFileManager, authModeHandlers）との一貫性が示されている
- [ ] 設計判断の根拠が記録されている

## 次Phase

Phase 3: 設計レビュー（`phase-3-design-review.md`）
