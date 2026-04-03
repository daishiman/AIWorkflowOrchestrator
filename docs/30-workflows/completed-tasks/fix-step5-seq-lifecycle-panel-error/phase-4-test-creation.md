# Phase 4: テスト作成（TDD Red） - タスク仕様書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 4                         |
| Phase名    | テスト作成（TDD Red）     |
| 前提Phase  | Phase 3                   |
| 後続Phase  | Phase 5                   |
| ステータス | 完了                      |
| 作成日     | 2026-04-02                |
| 機能名     | fix-lifecycle-panel-error |

---

## 目的

修正前に失敗する（Red）テストを作成し、バグの再現を確認する。Phase 1で確認した命名規則に従いテストファイルを作成する。

## 背景

TDD原則に従い、実装前にテストを作成する。`currentPhase: 'handoff'` 後に別スナップショットが届いてもエラーメッセージが消えないことを検証するテストを作成し、現状コードで失敗することを確認する。

---

## 実行タスク

### タスク1: テストファイル作成

**目的**: `SkillLifecyclePanel.error-persistence.test.tsx` を新規作成し、Redテストを作成する。

**実行手順**:

1. 既存の `SkillLifecyclePanel` テストファイルを参照し、セットアップパターンを確認する
2. `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.error-persistence.test.tsx` を作成する
3. 以下のテストシナリオを実装する:
   - **シナリオA**: `currentPhase: 'handoff'` スナップショット後に `currentPhase: 'execute'` スナップショットが届いても `workflowError` が null にならない
   - **シナリオB**: `currentPhase: 'execute'` スナップショット後は `workflowError` が null になる（正常系）
4. `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` IPCイベントをモックする
5. テストを実行し、Red（失敗）であることを確認する

**テストファイルの基本構造**:

```typescript
// SkillLifecyclePanel.error-persistence.test.tsx
describe("SkillLifecyclePanel - error persistence", () => {
  it("AC-1: currentPhase:handoff 後に setWorkflowError(null) が呼ばれない", () => {
    // currentPhase:'handoff' スナップショット配信
    // 別スナップショット（currentPhase:'execute'）配信
    // workflowError が null でないことを確認
  });

  it("AC-2: currentPhase:execute では setWorkflowError(null) が呼ばれる", () => {
    // currentPhase:'execute' スナップショット配信
    // workflowError が null になることを確認
  });

  it("AC-3: currentPhase:handoff 後の連続スナップショットでエラーが消えない", () => {
    // currentPhase:'handoff' スナップショット配信
    // 複数の別スナップショット配信
    // workflowError が null でないことを確認
  });
});
```

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.error-persistence.test.tsx`（Red状態）

---

### タスク2: テスト実行・Red確認

**目的**: 作成したテストが現状コードで失敗することを確認する。

**実行手順**:

1. 以下のコマンドでテストを実行する
2. テストが失敗（Red）であることを確認する
3. エラーメッセージを記録する

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="SkillLifecyclePanel.error-persistence"
```

**期待される成果物**:

- テスト実行結果（Red状態の確認）

---

## 参照資料

| 参照資料         | パス                                                                 | 内容                          |
| ---------------- | -------------------------------------------------------------------- | ----------------------------- |
| 修正対象ファイル | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | onWorkflowStateChanged の現状 |
| 受入条件         | `outputs/phase-1/acceptance-criteria.md`                             | AC-1〜AC-5                    |
| Before/After比較 | `outputs/phase-2/before-after-comparison.md`                         | テスト設計方針                |
| 既存テスト       | `apps/desktop/src/renderer/components/skill/__tests__/`              | テストパターン参照            |

---

## 成果物

| 成果物                     | パス                                                                                                  | 内容            |
| -------------------------- | ----------------------------------------------------------------------------------------------------- | --------------- |
| エラー永続化テストファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.error-persistence.test.tsx` | Red状態のテスト |

---

## TDD検証

### TDD サイクル確認

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="SkillLifecyclePanel.error-persistence"
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

---

## 統合テスト連携

- IPC モックを使ったエラー永続化テストシナリオを作成する
- `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` の連続配信をモックで再現する

---

## 完了条件

- [ ] `SkillLifecyclePanel.error-persistence.test.tsx` が作成されている
- [ ] AC-1〜AC-3に対応するテストが含まれている
- [ ] テストを実行し、Red（失敗）であることを確認済み
- [ ] テスト失敗のエラーメッセージを記録済み

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜2）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] テストファイルが生成され、Red状態であることを確認

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）が PASS または MINOR解消済みであること
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/fix-step5-seq-lifecycle-panel-error/phase-5-implementation.md`
