# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 6                         |
| Phase名    | テスト拡充                |
| 前提Phase  | Phase 5                   |
| 後続Phase  | Phase 7                   |
| ステータス | 完了                      |
| 作成日     | 2026-04-02                |
| 機能名     | fix-lifecycle-panel-error |

---

## 目的

Phase 4で作成した基本テストにエッジケースと回帰テストを追加し、`onWorkflowStateChanged` コールバックの網羅的な検証を行う。

## 背景

基本テスト（AC-1〜AC-3）に加え、`currentPhase` の全パターンと `handoffBundle` 処理を含むエッジケースを追加することで、回帰リスクを最小化する。

---

## 実行タスク

### タスク1: エッジケーステスト追加

**目的**: `currentPhase` の全パターンと境界値をテストする。

**実行手順**:

1. 以下のエッジケースを `SkillLifecyclePanel.error-persistence.test.tsx` に追加する:
   - `currentPhase: 'handoff'` 時に `handoffBundle` が存在する場合の挙動
   - `currentPhase: 'completed'` では `setWorkflowError(null)` が呼ばれること
   - `currentPhase: 'initializing'` では `setWorkflowError(null)` が呼ばれること
   - `currentPhase: undefined` の場合の安全な処理
   - 多数の連続スナップショット（5回以上）でもエラーが保持されること

**期待される成果物**:

- エッジケーステスト追加済みテストファイル

---

### タスク2: 回帰テスト追加

**目的**: 将来の変更でバグが再発しないよう回帰ガードを追加する。

**実行手順**:

1. 以下の回帰シナリオを追加する:
   - `setWorkflowError(null)` の呼び出し回数を検証（`currentPhase: 'handoff'` 時は0回）
   - エラーメッセージの値が `currentPhase: 'handoff'` 後も維持されること
2. テストを実行し、全てGreenであることを確認する

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="SkillLifecyclePanel.error-persistence"
```

**期待される成果物**:

- 回帰テスト追加済みテストファイル（全PASS）

---

## 参照資料

| 参照資料       | パス                                                                                                  | 内容                    |
| -------------- | ----------------------------------------------------------------------------------------------------- | ----------------------- |
| テストファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.error-persistence.test.tsx` | Phase 4で作成したテスト |
| 修正ファイル   | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                  | Phase 5で修正済み       |
| 受入条件       | `outputs/phase-1/acceptance-criteria.md`                                                              | AC-1〜AC-5              |

---

## 成果物

| 成果物                             | パス                                                                                                  | 内容                             |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------- |
| 拡充済みエラー永続化テストファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.error-persistence.test.tsx` | エッジケース・回帰テスト追加済み |

---

## 統合テスト連携

- 複数スナップショット連続配信シナリオのテストを拡充する（fire-and-forget化との整合確認）

---

## 完了条件

- [ ] エッジケーステスト（5パターン以上）が追加されている
- [ ] 回帰テストが追加されている
- [ ] 全テストがGreenであること
- [ ] テスト追加後も既存の `SkillLifecyclePanel` 関連テストが全PASS

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜2）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] テストファイルの更新内容を記録済み

---

## 依存関係

- **前提**: Phase 5（実装）が完了し、テストがGreenであること
- **後続**: Phase 7（カバレッジ確認）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/fix-step5-seq-lifecycle-panel-error/phase-7-coverage-check.md`
