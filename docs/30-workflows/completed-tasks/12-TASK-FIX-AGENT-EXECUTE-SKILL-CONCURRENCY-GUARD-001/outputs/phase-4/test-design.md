# Phase 4: テスト設計書

## メタ情報

| 項目           | 値                                                                                      |
| -------------- | --------------------------------------------------------------------------------------- |
| タスクID       | TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001                                      |
| Phase          | 4 - テスト作成                                                                          |
| 作成日         | 2026-03-09                                                                              |
| テストファイル | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice-concurrency-guard.test.ts` |

## テストケース一覧（Store層ガード: T-01〜T-05）

| ID   | テストケース名                                         | 検証内容                                                 | 期待結果                                    |
| ---- | ------------------------------------------------------ | -------------------------------------------------------- | ------------------------------------------- |
| T-01 | isExecuting が true のとき executeSkill を呼び出さない | `isExecuting: true` の状態で `executeAgentSkill` を実行  | electronAPI.agent.executeSkill が呼ばれない |
| T-02 | isExecuting が false のとき executeSkill を呼び出す    | `isExecuting: false` の状態で `executeAgentSkill` を実行 | electronAPI.agent.executeSkill が呼ばれる   |
| T-03 | 実行中に2回目の呼び出しが無視される                    | 1回目実行中（Promise未解決）に2回目を呼び出す            | executeSkill の呼び出し回数が1回            |
| T-04 | 実行完了後に isExecuting が false にリセットされる     | executeSkill 完了後の状態確認                            | `isExecuting === false`                     |
| T-05 | 実行エラー後に isExecuting が false にリセットされる   | executeSkill がエラーを返した後の状態確認                | `isExecuting === false`                     |

## テストケース概要（拡充テスト: T-09〜T-12）

| ID   | テストケース名                           | 検証内容                                                                |
| ---- | ---------------------------------------- | ----------------------------------------------------------------------- |
| T-09 | エラー後に再実行が可能                   | エラー発生 → isExecuting リセット → 再呼び出しが成功する                |
| T-10 | 正常完了後に再実行が可能                 | 正常完了 → isExecuting リセット → 再呼び出しが成功する                  |
| T-11 | selectedSkillName 未設定時に早期リターン | selectedSkillName が空の状態で呼び出した場合、executeSkill が呼ばれない |
| T-12 | 3回連続呼び出しで1回目のみ実行される     | isExecuting: true の間に3回連続呼び出し → 実行は1回のみ                 |

## テスト構造

### createStore パターン

各テストケースで独立した Zustand Store インスタンスを生成し、テスト間の状態リークを防止する（P9準拠）。

```typescript
const createTestStore = () => {
  return createStore(/* agentSlice の初期状態 */);
};
```

### electronAPI モック

`window.electronAPI.agent.executeSkill` をモック化し、呼び出し回数・引数を検証する。

```typescript
const mockExecuteSkill = vi.fn().mockResolvedValue({ success: true });
window.electronAPI = {
  agent: { executeSkill: mockExecuteSkill },
} as unknown as typeof window.electronAPI;
```

### flushMicrotasks ヘルパー

非同期処理（Promise 解決）を待機するためのヘルパー関数。

```typescript
const flushMicrotasks = () => new Promise((resolve) => setTimeout(resolve, 0));
```

### P39 準拠（happy-dom + fireEvent）

- テスト環境: happy-dom
- イベント発火: `fireEvent` を使用（`userEvent` は happy-dom 非互換のため使用禁止）
- 非同期ハンドラ: `await act(async () => { ... })` で包む
