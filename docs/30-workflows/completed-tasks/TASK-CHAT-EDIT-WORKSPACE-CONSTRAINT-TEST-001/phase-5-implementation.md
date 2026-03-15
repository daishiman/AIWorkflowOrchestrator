# Phase 5: 実装

## メタ情報

| 項目   | 値                                           |
| ------ | -------------------------------------------- |
| Phase  | 5                                            |
| 機能名 | TASK-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001 |
| 作成日 | 2026-03-14                                   |

## 目的

本タスクは**テスト追加のみ**であり、プロダクションコードへの実装変更は不要。

既存の `workspacePath` セキュリティ検証ガード（`chatEditHandlers.ts` L159-173）の動作を確認した上で、Phase 4 で設計したテストコードをファイルに配置し、Red → Green のサイクルを確認する。

## 実行タスク

- Task 5-1: 既存 `workspacePath` ガード実装の挙動を再確認する
- Task 5-2: Phase 4 設計に沿ってテストファイルを作成・配置する
- Task 5-3: テストを実行し、Green を確認する
- Task 5-4: TC-WS-01〜06 の全 PASS を確認する

## 参照資料

依存Phase: Phase 4

### 前Phaseの成果物

- `docs/30-workflows/TASK-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001/phase-4-test-creation.md`
  → テストコード全体が記述されている

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                              | 確認ポイント                                     |
| ------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------ |
| Workspace Chat Edit 仕様 | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`    | workspacePath 指定時の許可/拒否境界              |
| IPC 契約                 | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`         | `chat-edit:send-with-context` の error code 契約 |
| IPC セキュリティ         | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md` | `isAllowedPath()` と sender 検証の優先順序       |
| 教訓                     | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`    | payload 契約ずれ防止                             |

### 実装参照ファイル

- `apps/desktop/src/main/ipc/chatEditHandlers.ts`（workspacePath ガード実装）
- `apps/desktop/src/main/services/chat-edit/utils/PathValidator.ts`（isAllowedPath 実装）

## 実行手順

### Step 1: 既存実装の動作確認

`chatEditHandlers.ts` L159-173 の実装を確認する:

```typescript
// workspacePath セキュリティ検証
if (args.workspacePath && typeof args.workspacePath === "string") {
  for (const ctx of args.contexts) {
    if (!isAllowedPath(ctx.filePath, [args.workspacePath])) {
      return {
        success: false,
        error: {
          code: "PERMISSION_DENIED",
          message: "File path is outside the workspace",
          retryable: false,
        },
      };
    }
  }
}
```

`PathValidator.ts` L37-43 の `isAllowedPath` 実装:

```typescript
export function isAllowedPath(
  filePath: string,
  allowedDirs: string[],
): boolean {
  const resolved = path.resolve(filePath);
  return allowedDirs.some((dir) => resolved.startsWith(path.resolve(dir)));
}
```

**動作確認ポイント**:

- `workspacePath` が falsy または string 以外の場合はガードをスキップ → TC-WS-03 のバグなし確認
- `contexts` が空配列の場合、for ループが実行されない → TC-WS-06 のバグなし確認
- `path.resolve()` によりパストラバーサル (`../`) を正規化 → TC-WS-04 の正しい動作確認
- 複数コンテキストのうち1つでも失敗すれば即座に return → TC-WS-05 の正しい動作確認

### Step 2: テストファイルの作成

Phase 4 仕様書 (`phase-4-test-creation.md`) の Step 3 に記載された全テストコードを以下パスに配置する:

**配置先**: `apps/desktop/src/main/ipc/__tests__/chatEditHandlers.workspace-constraint.test.ts`

**注意事項**:

- ChatEditService のモック: `resolve` が `type: "integrated"` を返す場合、ChatEditService が `new` で生成される。vi.mock でコンストラクタをモックし、`sendWithContext` が `{ success: true }` を返すよう設定する
- `vi.spyOn(PathValidatorModule, "isAllowedPath")` は実装保持（`mockImplementation` を呼ばない）で使用

### Step 3: テスト実行

```bash
cd apps/desktop && pnpm exec vitest run src/main/ipc/__tests__/chatEditHandlers.workspace-constraint.test.ts
```

**期待する出力**:

```
✓ chatEditHandlers - workspacePath セキュリティ検証
  ✓ TC-WS-01: workspacePath 内のファイルパスは success: true を返す
  ✓ TC-WS-02: workspacePath 外のファイルパスは PERMISSION_DENIED を返す
  ✓ TC-WS-03: workspacePath が未指定の場合、isAllowedPath を呼び出さない
  ✓ TC-WS-04: パストラバーサル攻撃パスは PERMISSION_DENIED を返す
  ✓ TC-WS-05: 複数コンテキストのうち 1 つでも workspace 外なら PERMISSION_DENIED を返す
  ✓ TC-WS-06: contexts が空配列の場合、isAllowedPath を呼び出さない

Test Files  1 passed (1)
Tests       6 passed (6)
```

### Step 4: 既存テストへの影響確認

既存テストが壊れていないことを確認:

```bash
cd apps/desktop && pnpm exec vitest run src/main/ipc/__tests__/chatEditHandlers.security.test.ts
cd apps/desktop && pnpm exec vitest run src/main/ipc/__tests__/chatEditHandlers.test.ts
```

## 統合テスト連携【必須】

本フェーズは既存プロダクションコードを変更しないため、統合テストへの影響はない。ただし既存テストとの状態リークを防ぐため、`beforeEach` / `afterEach` でのモックリセットを実施済みであることを確認する。

## 多角的チェック観点（AIが判断）

| 観点                   | チェック内容                                                                  |
| ---------------------- | ----------------------------------------------------------------------------- |
| 実装変更なし           | `chatEditHandlers.ts` / `PathValidator.ts` への変更がないこと                 |
| P5: ハンドラ二重登録   | `afterEach` で `unregisterChatEditHandlers()` 呼び出し確認                    |
| P9: テスト間状態リーク | `vi.clearAllMocks()` で全モックをリセット済み                                 |
| ChatEditService モック | `vi.mocked(ChatEditService).mockImplementation(...)` でコンストラクタをモック |

## 成果物

| 成果物         | パス                                                                                |
| -------------- | ----------------------------------------------------------------------------------- |
| テストファイル | `apps/desktop/src/main/ipc/__tests__/chatEditHandlers.workspace-constraint.test.ts` |

## 完了条件（チェックリスト形式）

- [ ] プロダクションコードへの変更がないこと（`chatEditHandlers.ts` / `PathValidator.ts` 未変更）
- [ ] テストファイルが指定パスに存在すること
- [ ] `vitest run` で 6 テスト全て PASS すること
- [ ] 既存テスト（chatEditHandlers.security.test.ts / chatEditHandlers.test.ts）が全 PASS であること
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

| #   | タスク                    | 状態                       |
| --- | ------------------------- | -------------------------- |
| 5-1 | 既存実装の動作確認        | 完了（Phase 4 で設計済み） |
| 5-2 | テストファイル作成・配置  | 実行予定                   |
| 5-3 | テスト実行（Red → Green） | 実行予定                   |
| 5-4 | 既存テスト影響確認        | 実行予定                   |

## タスク100%実行確認【必須】

Phase 5 完了の定義: 新規テストファイルが配置され、`vitest run` で 6 テスト全て PASS し、既存テストへの影響がないこと。

## 次のPhase

Phase 6: テスト拡充（エッジケーステスト追加・カバレッジ補強）
→ `docs/30-workflows/TASK-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001/phase-6-test-expansion.md`
