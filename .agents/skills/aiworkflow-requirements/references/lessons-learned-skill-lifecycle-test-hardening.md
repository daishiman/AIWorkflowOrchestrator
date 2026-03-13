# Lessons Learned（教訓集） / skill domain lessons

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: skill domain lessons

## TASK-10A-G 実装知見追補（2026-03-10）

### 苦戦箇所と解決策

#### 1. IPC ハンドラキャプチャパターンの発見

| 項目       | 内容 |
| ---------- | ---- |
| **課題**   | Main Process の IPC ハンドラを単体テストしようとする際、`ipcMain.handle` をモックして登録されたハンドラ関数を直接取り出す方法が非自明 |
| **再発条件** | Main Process の IPC ハンドラを単体テストしようとする場合 |
| **解決策** | 既存の `skillHandlers.contract.test.ts` にある handler capture パターン（`vi.mocked(ipcMain.handle).mock.calls.find(c => c[0] === 'skill:create')?.[1]`）を再利用。`registerSkillHandlers(mockService)` 後に `ipcMain.handle` の mock.calls からチャンネル名で検索 |
| **教訓**   | IPC ハンドラの単体テストでは handler capture パターンを標準とする |

```typescript
const { ipcMain } = vi.mocked(await import("electron"));
registerSkillHandlers(mockService);
const handler = vi.mocked(ipcMain.handle).mock.calls.find(
  (c) => c[0] === "skill:create"
)?.[1];
```

#### 2. G2 Store統合テストでの Promise 解決タイミング制御

| 項目       | 内容 |
| ---------- | ---- |
| **課題**   | Zustand Store のアクション内で Preload API (window.electronAPI) を呼び出す非同期処理をテストする際、`createSkill`/`analyzeSkill` アクション内の `await window.electronAPI.skill.create()` が Promise を返すため、act + flushPromises を組み合わせないと状態遷移が完了しない |
| **再発条件** | Zustand Store のアクション内で Preload API (window.electronAPI) を呼び出す非同期処理をテストする場合 |
| **解決策** | `vi.waitFor()` を使って状態遷移の完了を待機するパターンを採用 |
| **教訓**   | Store アクションの非同期テストでは `vi.waitFor(() => expect(getState().someFlag).toBe(expected))` で状態遷移完了を待つ |

```typescript
const mockCreate = vi.fn().mockResolvedValue({ success: true });
window.electronAPI = { skill: { create: mockCreate } };
const { result } = renderHook(() => useAppStore((s) => s.createSkill));
await act(async () => { result.current("test", {}); });
await vi.waitFor(() => {
  expect(useAppStore.getState().skills).toHaveLength(1);
});
```

#### 3. G2 Phase 6 カバレッジ不足の根本原因特定

| 項目       | 内容 |
| ---------- | ---- |
| **課題**   | Store アクションのバリデーション分岐や API ガード（electronAPI 未定義）がテストされていない。Phase 7 で Line 69.3%, Branch 46.7% と基準未達。21件中12件は正常系のみで、エラー系・ガード系のカバレッジが大幅に不足 |
| **再発条件** | Store アクションのバリデーション分岐や API ガード（electronAPI 未定義）がテストされていない場合 |
| **解決策** | Phase 6 で VAL(6件: createSkill/analyzeSkill/applySkillImprovements 各2件のバリデーション分岐) + GUARD(3件: electronAPI 未定義時の早期リターン) = 9件を追加し、100%/100% に到達 |
| **教訓**   | テスト専用タスクでは Phase 4 初回は正常系を中心に設計し、Phase 6 でカバレッジ計測結果に基づいてエッジケースを追加する「2段階テスト設計」を標準とする |

#### 4. P41 v8 Function Coverage 0% の exemption 判断

| 項目       | 内容 |
| ---------- | ---- |
| **課題**   | Vitest v8 カバレッジプロバイダで skillHandlers.ts のようにオプションオブジェクト内にインラインアロー関数がある場合、`validateIpcSender` の options 内 `getAllowedWindows: () => [mainWindow]` が独立関数としてカウントされるため、G1 の handler-scope Function Coverage が 0% になる |
| **再発条件** | Vitest v8 カバレッジプロバイダで skillHandlers.ts のようにオプションオブジェクト内にインラインアロー関数がある場合 |
| **解決策** | Phase 7 レポートで P41 exemption として明記し、Line/Branch Coverage を主判定、Function Coverage を補助情報として扱うことで Phase 10 レビューでの不要な議論を回避 |
| **教訓**   | v8 プロバイダ使用時は Function Coverage 0% を自動的に FAIL としない。`getAllowedWindows` のようなインラインコールバックが原因の場合は P41 exemption として事前記録する |

#### 5. 並列エージェント実行時の Phase 12 分割戦略

| 項目       | 内容 |
| ---------- | ---- |
| **課題**   | Phase 12 の仕様書更新を複数のサブエージェントに委譲する際、P43 準拠で「3ファイル以下/エージェント」に分割しないと rate limit で中断する |
| **再発条件** | Phase 12 の仕様書更新を複数のサブエージェントに委譲する場合 |
| **解決策** | Agent1(implementation-guide + spec-update-summary) と Agent2(LOGS.md x2 + SKILL.md x2 + references x2 + topic-map) に分割。Agent2 は references を 2ファイルに制限 |
| **教訓**   | Phase 12 サブエージェントは仕様書更新3ファイル以下、LOGS.md への「完了」記録は全更新終了後の最終ステップとする |

### TASK-10A-G 同種課題の5分解決カード

| 症状 | 原因 | 最短手順 |
| --- | --- | --- |
| IPCハンドラを直接テストしたい | handler capture パターン未発見 | `mock.calls.find(c => c[0] === 'channel')?.[1]` |
| Store統合テストで状態遷移が完了しない | async action の Promise 未解決 | `vi.waitFor(() => expect(getState()...))` |
| カバレッジが基準未達 | 正常系のみでエッジケース不足 | Phase 7 → 不足分岐特定 → Phase 6 追加 |
| Function Coverage 0% | P41 v8 inline function | exemption 記録（Line/Branch を主判定） |
| Phase 12 エージェント中断 | P43 rate limit | 3ファイル以下/エージェント分割 |

---

