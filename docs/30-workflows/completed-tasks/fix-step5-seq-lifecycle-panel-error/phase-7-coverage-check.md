# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 7                         |
| Phase名    | カバレッジ確認            |
| 前提Phase  | Phase 6                   |
| 後続Phase  | Phase 8                   |
| ステータス | 完了                      |
| 作成日     | 2026-04-02                |
| 機能名     | fix-lifecycle-panel-error |

---

## 目的

`onWorkflowStateChanged` コールバック全体の行カバレッジ・ブランチカバレッジが目標（90%以上）を達成していることを確認する。

## 背景

1行変更の修正だが、`onWorkflowStateChanged` コールバック全体の品質を担保するため、カバレッジ目標を設定して確認する。

---

## 実行タスク

### タスク1: カバレッジ計測

**目的**: `SkillLifecyclePanel.tsx` の `onWorkflowStateChanged` コールバックのカバレッジを計測する。

**実行手順**:

1. カバレッジ付きでテストを実行する
2. `onWorkflowStateChanged` コールバック部分のカバレッジを確認する
3. 結果を `outputs/phase-7/coverage-report.md` に記録する

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="SkillLifecyclePanel.error-persistence" --coverage
```

**カバレッジ目標**:

| 対象                                                  | 行カバレッジ | ブランチカバレッジ |
| ----------------------------------------------------- | ------------ | ------------------ |
| `SkillLifecyclePanel.tsx`（`onWorkflowStateChanged`） | 90% 以上     | 90% 以上           |

**期待される成果物**:

- `outputs/phase-7/coverage-report.md`

---

### タスク2: 未カバー箇所の対応

**目的**: カバレッジ目標未達の場合、追加テストで補完する。

**実行手順**:

1. カバレッジレポートで未カバー行を特定する
2. 目標（90%）未達の場合は、Phase 6のテストファイルに追加テストを加える
3. 再度カバレッジを計測し、目標達成を確認する
4. 目標達成済みの場合は「目標達成済み」と記録して完了

**期待される成果物**:

- カバレッジ目標達成確認（coverage-report.md に記録）

---

## 参照資料

| 参照資料       | パス                                                                                                  | 内容                 |
| -------------- | ----------------------------------------------------------------------------------------------------- | -------------------- |
| テストファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.error-persistence.test.tsx` | カバレッジ対象テスト |
| 修正ファイル   | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                  | カバレッジ計測対象   |

---

## 成果物

| 成果物             | パス                                 | 内容                           |
| ------------------ | ------------------------------------ | ------------------------------ |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 行・ブランチカバレッジ計測結果 |

---

## 統合テスト連携

- `onWorkflowStateChanged` コールバック全体のカバレッジを確認する

---

## 完了条件

- [ ] `outputs/phase-7/coverage-report.md` が作成されている
- [ ] `onWorkflowStateChanged` コールバックの行カバレッジが90%以上
- [ ] `onWorkflowStateChanged` コールバックのブランチカバレッジが90%以上
- [ ] カバレッジ計測コマンドの実行結果が記録されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜2）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] カバレッジレポートが生成されていることを確認

---

## 依存関係

- **前提**: Phase 6（テスト拡充）が完了していること
- **後続**: Phase 8（リファクタリング）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/fix-step5-seq-lifecycle-panel-error/phase-8-refactoring.md`
