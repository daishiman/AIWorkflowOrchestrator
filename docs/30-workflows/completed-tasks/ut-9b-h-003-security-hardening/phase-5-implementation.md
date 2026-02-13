# Phase 5: 実装

## メタ情報

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| タスクID | UT-9B-H-003                             |
| Phase    | 5                                       |
| タスク名 | SkillCreator IPCセキュリティ強化 - 実装 |
| Issue    | #796                                    |
| 作成日   | 2026-02-12                              |
| 優先度   | 高 (security)                           |
| 前Phase  | Phase 4: テスト作成                     |

## 目的

セキュリティ対策のプロダクションコード実装（TDD Green）。Phase 4 で作成したテストを全て PASS させるために、以下の3つのセキュリティ機能を skillCreatorHandlers.ts に実装する:

1. **validatePath**: パストラバーサル攻撃の防止
2. **sanitizeErrorMessage**: エラーレスポンスからの内部情報漏洩防止
3. **ALLOWED_SCHEMA_NAMES**: スキーマ名ホワイトリスト検証

## 実行タスク

- Task 1: validatePath実装: パス攻撃をIPC層で遮断する。
- Task 2: sanitizeErrorMessage実装: 返却エラーから内部情報を除去する。
- Task 3: schemaNameホワイトリスト実装: 許可値以外を拒否する。

### Task 1: validatePath 関数の実装

**対象ファイル**: `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`

**実装内容**:

- `validatePath(inputPath: string, paramName: string): string | null` 関数を追加
- `path.resolve()` でパスを正規化
- `../` / `..\\` / NULLバイト / UNCパスを拒否
- NULLバイト検出: `inputPath.includes('\0')` で即拒否
- UNCパス検出: `inputPath.startsWith('\\\\')` で拒否
- 失敗時: `{ success: false, error: "無効なパスが指定されました: ${paramName}" }` を返却

**実装例**:

```typescript
import path from "path";

function validatePath(inputPath: string, paramName: string): string | null {
  // NULLバイト検出
  if (!inputPath || inputPath.includes("\0")) {
    return null;
  }
  // UNCパス検出
  if (inputPath.startsWith("\\\\")) {
    return null;
  }
  // 明示的な上位参照を拒否
  if (inputPath.includes("../") || inputPath.includes("..\\")) {
    return null;
  }

  return path.resolve(inputPath);
}
```

**適用箇所**:

| ハンドラー    | パラメータ                       |
| ------------- | -------------------------------- |
| execute-tasks | `args.tasksDir`, `args.skillDir` |
| validate      | `args.tasksDir`                  |
| create        | `args.tasksDir`, `args.skillDir` |

### Task 2: sanitizeErrorMessage 関数の実装

**対象ファイル**: `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`

**実装内容**:

- `sanitizeErrorMessage(error: unknown): string` 関数を追加
- Error instance チェック
- ファイルパスパターン除去: `/\/[\w./\\-]+/g` を `"[path]"` に置換
- Windows パスパターン除去: `/[A-Z]:\\[\w.\\-]+/gi` を `"[path]"` に置換
- スタックトレース除去: `/\n\s+at\s+.*/g` を `""` に置換
- トークン/キーマスキング: `/(token|key|password|secret)=\S+/gi` を `"$1=***"` に置換
- 非Error: `"スキル作成処理でエラーが発生しました"` を返却

**実装例**:

```typescript
function sanitizeErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "スキル作成処理でエラーが発生しました";
  }

  let message = error.message;

  // スタックトレース除去
  message = message.replace(/\n\s+at\s+.*/g, "");

  // ファイルパスパターン除去（Unix）
  message = message.replace(/\/[\w./\\-]+/g, "[path]");

  // ファイルパスパターン除去（Windows）
  message = message.replace(/[A-Z]:\\[\w.\\-]+/gi, "[path]");

  // トークン/キーマスキング
  message = message.replace(/(token|key|password|secret)=\S+/gi, "$1=***");

  return message || "スキル作成処理でエラーが発生しました";
}
```

**適用箇所**:

全5ハンドラーの catch ブロックに適用。既存の `error instanceof Error ? error.message : "..."` パターンを `sanitizeErrorMessage(error)` に置換する。

| ハンドラー      | 現状                                             | 変更後                        |
| --------------- | ------------------------------------------------ | ----------------------------- |
| detect-mode     | `error instanceof Error ? error.message : "..."` | `sanitizeErrorMessage(error)` |
| create          | 同上                                             | 同上                          |
| execute-tasks   | 同上                                             | 同上                          |
| validate        | 同上                                             | 同上                          |
| validate-schema | 同上                                             | 同上                          |

### Task 3: ALLOWED_SCHEMA_NAMES ホワイトリスト実装

**対象ファイル**: `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`

**実装内容**:

- トップレベル定数として定義:

```typescript
/**
 * 許可されたスキーマ名のホワイトリスト。
 * 新規スキーマ追加時はこの配列も更新すること。
 * SkillCreatorService の ResourceLoader が使用する名前と一致させる。
 */
const ALLOWED_SCHEMA_NAMES = ["task-spec", "skill-spec", "mode"] as const;
type AllowedSchemaName = (typeof ALLOWED_SCHEMA_NAMES)[number];
```

- validate-schema ハンドラー内で検証:

```typescript
if (!ALLOWED_SCHEMA_NAMES.includes(args.schemaName as AllowedSchemaName)) {
  return {
    success: false,
    error: `無効なスキーマ名が指定されました: ${args.schemaName}`,
  };
}
```

- 未許可の場合: `{ success: false, error: "無効なスキーマ名が指定されました: ${schemaName}" }` を返却
- 大文字小文字を区別する（"Task-Spec" は拒否）

**注意事項**:

- 実際のスキーマ名は SkillCreatorService の ResourceLoader が使用する名前と一致させる
- スキーマ名に `/`, `\`, `..` 等のパス区切り文字が含まれる場合も拒否される（ホワイトリストに存在しないため）

## 参照資料

| 資料                         | パス / 場所                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------- |
| Phase 4 テスト仕様           | `docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/phase-4-test-creation.md` |
| Phase 2 設計                 | `docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/phase-2-design.md`        |
| 既存パス検証パターン         | `apps/desktop/src/main/services/skill/SkillFileManager.ts` の `validatePath()`              |
| 既存エラーサニタイズパターン | `apps/desktop/src/main/ipc/authModeHandlers.ts` の `sanitizeErrorMessage()`                 |
| セキュリティ仕様             | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                |
| API/Electron セキュリティ    | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                |
| 実装パターン仕様             | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` |
| エラーハンドリング仕様       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       |
| Skill Creator IPC型定義      | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        |
| 失敗事例・教訓               | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      |

## 統合テスト連携

| 層                   | テスト内容                                                                                            |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| バックエンド（Main） | 3つのセキュリティ関数（validatePath, sanitizeErrorMessage, ALLOWED_SCHEMA_NAMES）が正しく動作すること |
| IPC通信              | 攻撃パスが validatePath で拒否されサービス層に到達しないこと                                          |
| Preload/セキュリティ | エラーレスポンスが `IpcResult<T>` 形式で返却されること                                                |

## 多角的チェック観点

| 観点               | 仕様参照先               | 確認項目                                   |
| ------------------ | ------------------------ | ------------------------------------------ |
| セキュリティ       | security-electron-ipc.md | L3-b ドメイン固有バリデーション実装        |
| エラーハンドリング | error-handling.md        | sanitizeErrorMessage 仕様準拠              |
| コード品質         | 02-code-quality.md       | any 型不使用、strict 型チェック            |
| IPC原則            | 04-electron-security.md  | エラーはサニタイズしてから Renderer に送る |

## 既知の Pitfall 対策

| Pitfall                                       | 対策                                                           |
| --------------------------------------------- | -------------------------------------------------------------- |
| P11: PostToolUse フックによる Edit 失敗       | 大量編集後は `git diff --stat` で変更数検証                    |
| P23: API 二重定義の型管理                     | IpcResult 型は skillCreatorHandlers.ts 内のローカル定義を使用  |
| P19: 型キャスト（as）による実行時検証バイパス | sanitizeErrorMessage は `unknown` 型で受け取り実行時検証を行う |

## 成果物

| 成果物         | パス                                                |
| -------------- | --------------------------------------------------- |
| 更新ハンドラー | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` |

## 完了条件

- [ ] validatePath 関数が実装され、execute-tasks / validate ハンドラーに適用されている
- [ ] sanitizeErrorMessage 関数が実装され、全5ハンドラーの catch ブロックに適用されている
- [ ] ALLOWED_SCHEMA_NAMES が定義され、validate-schema ハンドラーで検証されている
- [ ] NULLバイト・UNCパス・`../` パターンが全て拒否されることを手動確認
- [ ] Phase 4 のテストが全て PASS（TDD Green 達成）
- [ ] 既存の機能テスト（skillCreatorIpc.integration.test.ts）が引き続き PASS
- [ ] `pnpm typecheck` が通ること（型エラーなし）

## 次Phase

Phase 6: テスト拡充 → `phase-6-test-expansion.md`
