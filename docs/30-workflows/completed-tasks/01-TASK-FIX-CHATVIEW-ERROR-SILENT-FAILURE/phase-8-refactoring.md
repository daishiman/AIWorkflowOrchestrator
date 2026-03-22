# Phase 8: リファクタリング

## メタ情報

| 項目      | 値                                      |
| --------- | --------------------------------------- |
| Phase番号 | 8                                       |
| 機能名    | ChatView エラーサイレント握りつぶし修正 |
| タスクID  | TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE  |
| 作成日    | 2026-03-20                              |
| 前Phase   | `phase-7-coverage-check.md`             |

## 目的

実装コードの品質を改善する。機能追加は行わず、可読性・保守性・型安全性の向上に限定する。テストが引き続き Green であることを確認する。

## 実行タスク

- Task 1: `chatSlice.ts` のエラーコード処理を整理する。
- Task 2: `ChatView/index.tsx` のメッセージ変換と JSX 条件分岐を整理する。
- Task 3: ふるまいを変えずにテスト Green を維持する。

### Task 1: chatSlice.ts のリファクタリング確認

以下の観点でコードを確認し、改善が必要な場合のみ修正する:

| 観点                     | 確認内容                                                                     |
| ------------------------ | ---------------------------------------------------------------------------- |
| エラーコード定数化       | `"AI_UNAVAILABLE"` 等の文字列が定数として定義されているか                    |
| `typeof` ガードの一貫性  | `response.error` の型チェックが P19準拠で実装されているか                    |
| `set()` 呼び出しの最適化 | 複数の `set()` 呼び出しが1回にまとめられているか（不要な再レンダリング防止） |
| コメントの適切さ         | 自明でないロジックにのみコメントがあるか                                     |

#### エラーコード定数化の例（必要な場合のみ）

```typescript
// chatSlice.ts 内、または共有定数ファイルに定義
const CHAT_ERROR_CODES = {
  AI_UNAVAILABLE: "AI_UNAVAILABLE",
  API_CALL_FAILED: "API_CALL_FAILED",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

type ChatErrorCode = (typeof CHAT_ERROR_CODES)[keyof typeof CHAT_ERROR_CODES];
```

**注意**: `ERROR_MESSAGES` の Record キーと一致させる場合のみ定数化を行う。過剰な抽象化は避ける。

### Task 2: ChatView のリファクタリング確認

以下の観点でコードを確認し、改善が必要な場合のみ修正する:

| 観点                    | 確認内容                                                           |
| ----------------------- | ------------------------------------------------------------------ |
| エラーバナーの抽出      | バナーが十分シンプルなら ChatView 内インラインのままでよい         |
| `ERROR_MESSAGES` の配置 | コンポーネントと同一ファイルで十分か、別ファイルへの分離が必要か   |
| `getErrorMessage` の型  | `Record<string, string>` のインデックスアクセスが安全か（P19対策） |
| JSX の可読性            | 条件レンダリングが明確か                                           |

#### `getErrorMessage` の型安全強化例（必要な場合のみ）

```typescript
// Record<string, string> のインデックスアクセスは undefined を返す可能性がある
// TypeScript strict: true + noUncheckedIndexedAccess を有効にしている場合は修正が必要
function getErrorMessage(code: string): string {
  return (
    ERROR_MESSAGES[code] ??
    ERROR_MESSAGES["UNKNOWN_ERROR"] ??
    "エラーが発生しました。"
  );
}
```

### Task 3: テスト再実行（Green 確認）

```bash
cd apps/desktop && pnpm vitest run src/renderer/store/slices/chatSlice.test.ts
cd apps/desktop && pnpm vitest run src/renderer/views/ChatView/
```

リファクタリング後も全テストが Green であることを確認する。

## 参照資料

| 資料名                 | パス                                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------------- |
| Phase 1 要件定義       | `docs/30-workflows/completed-tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-1-requirements.md`   |
| Phase 2 設計書         | `docs/30-workflows/completed-tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-2-design.md`         |
| Phase 5 実装           | `docs/30-workflows/completed-tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-5-implementation.md` |
| Phase 6 テスト拡充     | `docs/30-workflows/completed-tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-6-test-expansion.md` |
| Phase 7 カバレッジ確認 | `docs/30-workflows/completed-tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-7-coverage-check.md` |
| コード品質ルール       | `.claude/rules/02-code-quality.md`                                                                      |
| 既知の落とし穴（P19）  | `.claude/rules/06-known-pitfalls.md`                                                                    |
| chatSlice.ts           | `apps/desktop/src/renderer/store/slices/chatSlice.ts`                                                   |
| ChatView               | `apps/desktop/src/renderer/views/ChatView/index.tsx`                                                    |

## 実行手順

### Step 1: 実装コードの確認

Phase 5 で実装したコードを読み、Task 1-2 の観点でリファクタリングが必要な箇所を特定する。

### Step 2: リファクタリング実施（必要な場合のみ）

改善が必要と判断した箇所を修正する。機能変更は行わない。

### Step 3: テスト再実行

リファクタリング後に全テストが Green であることを確認する。

## 統合テスト連携

- リファクタリング前後で `chatSlice.test.ts` と `ChatView.test.tsx` を再実行し、Task 01 の振る舞いが不変であることを確認する。
- Workspace 側の `errorMessage` / `selectedModelId` ガードは既存実装のままとし、この Phase で再設計しない。

## 成果物

| 成果物                            | パス                                                                                                 |
| --------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Phase 8 仕様書（本ファイル）      | `docs/30-workflows/completed-tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-8-refactoring.md` |
| chatSlice.ts リファクタリング済み | `apps/desktop/src/renderer/store/slices/chatSlice.ts`                                                |
| ChatView リファクタリング済み     | `apps/desktop/src/renderer/views/ChatView/index.tsx`                                                 |

## 完了条件

- [ ] エラーコード文字列の管理方式が一貫している（定数化または文字列リテラルで統一）
- [ ] `getErrorMessage` の型安全性が確認されている
- [ ] 不要な再レンダリングを引き起こす `set()` 分割呼び出しがない
- [ ] 全テストが Green のままである
- [ ] 機能変更が一切行われていない

## 次Phase

Phase 9: 品質検証（`phase-9-quality-assurance.md`）
