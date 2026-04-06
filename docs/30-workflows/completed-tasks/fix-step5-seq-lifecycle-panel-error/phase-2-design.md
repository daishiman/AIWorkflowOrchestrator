# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 2                         |
| Phase名    | 設計                      |
| 前提Phase  | Phase 1                   |
| 後続Phase  | Phase 3                   |
| ステータス | 完了                      |
| 作成日     | 2026-04-02                |
| 機能名     | fix-lifecycle-panel-error |

---

## 目的

1 concernの変更設計を確定する。`setWorkflowError(null)` を `currentPhase: 'handoff'` 時にスキップする条件分岐の挿入位置と変更内容を明確にする。

## 背景

Phase 1で確認した `onWorkflowStateChanged` コールバックの現状バグを1行修正で解決するための設計を行う。変更は最小限（1行の条件追加）だが、fire-and-forget化による連続スナップショット配信シナリオを考慮した設計が必要。

---

## 実行タスク

### タスク1: 修正対象コードの Before/After 比較

**目的**: 変更前後のコードを明確にし、変更範囲を確定する。

**実行手順**:

1. `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` の539行目周辺を精読する
2. `onWorkflowStateChanged` コールバック内の `setWorkflowError(null)` 呼び出し箇所を特定する
3. Before（現状）と After（修正案）のコード比較を `outputs/phase-2/before-after-comparison.md` に記録する

**変更内容（設計）**:

```typescript
// Before（現状 - バグあり）
const onWorkflowStateChanged = (snapshot: WorkflowSnapshot) => {
  setWorkflowError(null); // currentPhase:'handoff' 後にも呼ばれてエラーが消える
  // ... 他の処理
};

// After（修正案）
const onWorkflowStateChanged = (snapshot: WorkflowSnapshot) => {
  if (snapshot.currentPhase !== "handoff") {
    setWorkflowError(null); // currentPhase:'handoff' 時はエラーをクリアしない
  }
  // ... 他の処理
};
```

**期待される成果物**:

- `outputs/phase-2/before-after-comparison.md`（Before/After 比較ドキュメント）

---

### タスク2: 変更が1行のみでAC充足確認

**目的**: 設計が受入条件を満たすことを確認する。

**実行手順**:

1. AC-1: `currentPhase: 'handoff'` 時に `setWorkflowError(null)` が呼ばれないこと → `if (snapshot.currentPhase !== 'handoff')` で充足
2. AC-2: 他フェーズ（`'execute'`, `'verify'` など）では `setWorkflowError(null)` が呼ばれること → 条件が `!== 'handoff'` なので充足
3. AC-3: `currentPhase: 'handoff'` 後に別スナップショットが届いてもエラーが消えないこと → AC-1と同じ変更で充足
4. AC-4: 既存テストへの影響がないことを確認（他テストを壊さない）
5. AC-5: TypeScript型変更なし（`snapshot.currentPhase` は既存型を使用）

**期待される成果物**:

- AC充足確認記録（before-after-comparison.md に追記）

---

### タスク3: テスト設計の事前確認

**目的**: Phase 4でのテスト作成に向けた設計方針を確定する。

**実行手順**:

1. `SkillLifecyclePanel.tsx` の既存テストファイルを確認し、モック方法を把握する
2. `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` IPC イベントのモック戦略を設計する
3. テストファイル命名規則（Phase 1で確認済み）に従い `SkillLifecyclePanel.error-persistence.test.tsx` とする
4. テストシナリオを設計する:
   - シナリオA: `currentPhase: 'handoff'` スナップショット後に別スナップショット → `workflowError` が null にならない
   - シナリオB: `currentPhase: 'execute'` スナップショット → `workflowError` が null になる

**期待される成果物**:

- テスト設計方針（before-after-comparison.md に記載）

---

## 参照資料

| 参照資料           | パス                                                                 | 内容                                 |
| ------------------ | -------------------------------------------------------------------- | ------------------------------------ |
| 修正対象ファイル   | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | onWorkflowStateChanged コールバック  |
| 受入条件           | `outputs/phase-1/acceptance-criteria.md`                             | Phase 1で定義したAC                  |
| IPC チャンネル定義 | `packages/shared/src/ipc/channels.ts`                                | SKILL_CREATOR_WORKFLOW_STATE_CHANGED |

### システム仕様（aiworkflow-requirements）

| 参照資料               | パス                                                                  | 内容                  |
| ---------------------- | --------------------------------------------------------------------- | --------------------- |
| エラーハンドリング仕様 | `.claude/skills/aiworkflow-requirements/references/error-handling.md` | エラー表示の設計方針  |
| IPC仕様                | `.claude/skills/aiworkflow-requirements/references/api-*.md`          | IPC通信の設計パターン |

---

## 成果物

| 成果物                       | パス                                         | 内容                                             |
| ---------------------------- | -------------------------------------------- | ------------------------------------------------ |
| Before/After比較ドキュメント | `outputs/phase-2/before-after-comparison.md` | 変更前後のコード比較・AC充足確認・テスト設計方針 |

---

## 統合テスト連携

- IPC コールバック設計とモック戦略（`SKILL_CREATOR_WORKFLOW_STATE_CHANGED` のモック方法）を設計に反映する
- 連続スナップショット配信シナリオをテスト設計に含める

---

## 完了条件

- [ ] `outputs/phase-2/before-after-comparison.md` が作成されている
- [ ] Before（現状バグ）と After（修正後）のコードが記録されている
- [ ] 変更が `if (snapshot.currentPhase !== 'handoff')` の1行追加のみであることを確認
- [ ] AC-1〜AC-5が設計で充足されることを確認済み
- [ ] テストシナリオ（シナリオA・B）が設計されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜3）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（`outputs/phase-2/before-after-comparison.md`）が生成されていることを確認

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/fix-step5-seq-lifecycle-panel-error/phase-3-design-review.md`
