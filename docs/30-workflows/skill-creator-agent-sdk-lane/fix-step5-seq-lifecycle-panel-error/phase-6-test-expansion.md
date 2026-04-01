# Phase 6: テスト拡充

## メタ情報

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| Phase        | 6                                  |
| タスクID     | TASK-FIX-LIFECYCLE-PANEL-ERROR-001 |
| ステータス   | 未実施                             |
| 担当         | 実装者                             |
| 見積もり時間 | 0.5h                               |

## 目的

Phase 4 の基本テストを補完するエッジケース・回帰テストを追加し、コーナーケースも含めたテストカバレッジを達成する。

## 実行タスク

1. エッジケース: `phase: 'heartbeat_timeout'` 等の追加フェーズ値のテスト
2. エッジケース: `snapshot.phase` が `undefined` の場合のテスト
3. 回帰テスト: `handoffBundle` の処理が `phase` による影響を受けないこと
4. 複数スナップショットの連続受信シナリオのテスト

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                         | 内容           |
| ------------------ | ---------------------------------------------------------------------------- | -------------- |
| アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | システム全体像 |

## 実行手順

### ステップ 1: エッジケース — 追加フェーズ値のテスト

`phase: 'heartbeat_timeout'` 等の `'failed'` 以外のフェーズ値で `setWorkflowError(null)` が呼ばれることを確認する。

```typescript
// 追加テストケース（既存テストファイルに追記する）

describe("SkillLifecyclePanel - エッジケース", () => {
  // エッジケース 1: heartbeat_timeout フェーズ
  it("TC-EP-06: phase: heartbeat_timeout の snapshot を受け取ったとき setWorkflowError(null) が呼ばれる", () => {
    const triggerCallback = captureCallback();

    act(() => {
      triggerCallback({ phase: "heartbeat_timeout", handoffBundle: null });
    });

    // 'heartbeat_timeout' は 'failed' ではないため setWorkflowError(null) が呼ばれる
    expect(mockSetWorkflowError).toHaveBeenCalledWith(null);
  });

  // エッジケース 2: phase が undefined の場合
  it("TC-EP-07: snapshot.phase が undefined の場合 setWorkflowError(null) が呼ばれる", () => {
    const triggerCallback = captureCallback();

    act(() => {
      triggerCallback({ handoffBundle: null }); // phase なし
    });

    // undefined !== 'failed' は true → setWorkflowError(null) が呼ばれる
    expect(mockSetWorkflowError).toHaveBeenCalledWith(null);
  });

  // エッジケース 3: phase が null の場合
  it("TC-EP-08: snapshot.phase が null の場合 setWorkflowError(null) が呼ばれる", () => {
    const triggerCallback = captureCallback();

    act(() => {
      triggerCallback({ phase: null, handoffBundle: null });
    });

    // null !== 'failed' は true → setWorkflowError(null) が呼ばれる
    expect(mockSetWorkflowError).toHaveBeenCalledWith(null);
  });

  // 回帰テスト: handoffBundle 処理が phase に影響されない
  it("TC-EP-09: failed + handoffBundle あり → handoffBundle 処理実行・setWorkflowError 非呼び出し", () => {
    const triggerCallback = captureCallback();
    const handoffBundle = { guidance: "retry", steps: [] };

    act(() => {
      triggerCallback({ phase: "failed", handoffBundle });
    });

    // handoffBundle 処理は実行される
    expect(mockSetHandoffGuidance).toHaveBeenCalled();
    // setWorkflowError(null) は呼ばれない
    expect(mockSetWorkflowError).not.toHaveBeenCalledWith(null);
  });

  // 複数スナップショット受信シナリオ
  it("TC-EP-10: running → failed の順で受信したとき最終的にエラーが保持される", () => {
    const triggerCallback = captureCallback();

    act(() => {
      // まず running が届く → setWorkflowError(null) が呼ばれる
      triggerCallback({ phase: "running", handoffBundle: null });
    });

    expect(mockSetWorkflowError).toHaveBeenCalledWith(null);

    vi.clearAllMocks(); // モックのカウントをリセット

    act(() => {
      // 次に failed が届く → setWorkflowError(null) が呼ばれない
      triggerCallback({ phase: "failed", handoffBundle: null });
    });

    expect(mockSetWorkflowError).not.toHaveBeenCalledWith(null);
  });
});
```

### ステップ 2: エッジケース設計の根拠

| テストケース | 検証内容                                     | 根拠                                                                      |
| ------------ | -------------------------------------------- | ------------------------------------------------------------------------- |
| TC-EP-06     | `'heartbeat_timeout'` は `'failed'` ではない | `!== 'failed'` の条件では `'heartbeat_timeout'` 時にエラーがクリアされる  |
| TC-EP-07     | `phase` が `undefined` の挙動                | `undefined !== 'failed'` は `true` → エラーがクリアされる（意図した動作） |
| TC-EP-08     | `phase` が `null` の挙動                     | `null !== 'failed'` は `true` → エラーがクリアされる（意図した動作）      |
| TC-EP-09     | `failed` + `handoffBundle` ありの組み合わせ  | AC-3 の回帰確認（`handoffBundle` 処理は独立）                             |
| TC-EP-10     | `running` → `failed` の連続受信              | 実際の使用シナリオに近い状態遷移を確認                                    |

### ステップ 3: テスト実行

```bash
# 拡充テストを含めて実行する
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel.error-persistence.test.tsx
```

全 10 テストケース（TC-EP-01 〜 TC-EP-10）が PASS することを確認する。

## 多角的チェック観点

- `phase: 'heartbeat_timeout'` の場合にエラーがクリアされることは意図した動作か確認したか（`'failed'` のみがエラー保持の対象）
- `snapshot.phase` が `undefined` の場合の挙動が、実際のユースケース（スキル生成前の初期状態）と一致しているか確認したか
- TC-EP-10 の複数スナップショット受信テストで、`vi.clearAllMocks()` を使用して前のスナップショット受信の影響が残らないようにしているか確認したか

## 成果物

| 成果物                       | パス                                                                                                  | 説明                                    |
| ---------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------- |
| エラー永続化テスト（拡充版） | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.error-persistence.test.tsx` | TC-EP-06〜10 のエッジケースを追記した版 |

## 完了条件

- [ ] TC-EP-06（`heartbeat_timeout` フェーズのエッジケース）が追加されている
- [ ] TC-EP-07（`phase: undefined` のエッジケース）が追加されている
- [ ] TC-EP-08（`phase: null` のエッジケース）が追加されている
- [ ] TC-EP-09（`failed` + `handoffBundle` ありの回帰テスト）が追加されている
- [ ] TC-EP-10（`running` → `failed` 連続受信の回帰テスト）が追加されている
- [ ] 全 10 テストケース（TC-EP-01 〜 TC-EP-10）が PASS している

## タスク100%実行確認【必須】

- [ ] 全実行タスクが完了している
- [ ] 全成果物が存在する（テストファイルにエッジケースが追記されている）
- [ ] 全完了条件が満たされている

## 次Phase

Phase 7: カバレッジ確認 へ進む
