# Phase 4: テスト仕様書

## タスクID

TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001

## テストケース一覧

| #   | テストケース                                                        | ファイル                          | 状態        |
| --- | ------------------------------------------------------------------- | --------------------------------- | ----------- |
| 1   | `registerAllIpcHandlers` が `registerSkillChainHandlers` を呼び出す | `ipc-double-registration.test.ts` | Red → Green |

## テスト詳細

### TC-1: registerAllIpcHandlers が registerSkillChainHandlers を呼び出す

- **目的**: `registerAllIpcHandlers()` 内で `registerSkillChainHandlers()` が正しく呼び出されることを検証
- **前提条件**: 全ハンドラ登録関数がモックされている
- **手順**: `registerAllIpcHandlers(mockWindow)` を呼び出す
- **期待結果**:
  - `registerSkillChainHandlers` が1回呼び出される
  - 引数として `mainWindow`, `SkillChainStore` インスタンス, `SkillChainExecutor` インスタンスが渡される

## 修正内容

### モック追加

1. `skillHandlers` モックに `registerSkillChainHandlers: vi.fn()` を追加
2. `SkillChainStore` モックを追加
3. `SkillChainExecutor` モックを追加

### テストケース追加

- `describe("skill:chain handlers registration")` ブロックを追加
