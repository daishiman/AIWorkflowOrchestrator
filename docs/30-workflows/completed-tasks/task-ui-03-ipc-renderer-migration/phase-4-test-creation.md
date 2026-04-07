# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 4                                 |
| Phase名    | テスト作成                        |
| 機能名     | task-ui-03-ipc-renderer-migration |
| 前提Phase  | Phase 3: 設計レビュー             |
| 次Phase    | Phase 5: 実装                     |
| ステータス | pending                           |
| 作成日     | 2026-04-07                        |

## 目的

移行前にfail-firstテストを定義し、IPC経路移行の正しさを検証できるようにする。

## 実行手順

### 0. 既存テストの確認（必須）

```bash
# ImprovementProposalPanel の既存テスト
find apps/desktop/src -name "*ImprovementProposal*test*" -o -name "*ImprovementProposal*.test.*"

# GovernanceSummaryPanel の既存テスト
find apps/desktop/src -name "*GovernanceSummary*test*" -o -name "*GovernanceSummary*.test.*"

# electronAPI.skillCreator を参照するテスト
grep -rn "electronAPI.skillCreator" apps/desktop/src --include="*.test.*"
```

## 実行タスク

- ImprovementProposalPanel の移行検証テストを定義する
- GovernanceSummaryPanel の移行検証テストを定義する
- 旧経路不使用の静的チェックを定義する

### Task 1: ImprovementProposalPanel コンポーネントテスト

移行後に `window.skillCreatorAPI.applyRuntimeImprovement` が呼ばれることを検証するテストを定義する:

```typescript
describe("ImprovementProposalPanel", () => {
  it("should call window.skillCreatorAPI.applyRuntimeImprovement (not electronAPI)", async () => {
    // window.skillCreatorAPI.applyRuntimeImprovement のモックを設定
    // window.electronAPI.skillCreator のモックは呼ばれないことを確認
    // 改善適用ボタンクリック後に skillCreatorAPI 経由で呼ばれることを検証
  });
});
```

### Task 2: GovernanceSummaryPanel コンポーネントテスト

```typescript
describe("GovernanceSummaryPanel", () => {
  it("should reference window.skillCreatorAPI.getGovernanceState (not electronAPI)", () => {
    // window.skillCreatorAPI.getGovernanceState のモックを設定
    // window.electronAPI.skillCreator への参照がないことを確認
  });
});
```

### Task 3: 旧経路不使用の静的チェック

```bash
# 移行後に旧経路参照が0件であることを確認するコマンド
grep -rn "window.electronAPI.skillCreator" apps/desktop/src/renderer --include="*.tsx" --include="*.ts"
# → 0件が期待結果
```

## 参照資料

| 資料名       | パス                                    | 説明         |
| ------------ | --------------------------------------- | ------------ |
| 設計書       | `outputs/phase-2/design-document.md`    | 移行方針     |
| レビュー結果 | `outputs/phase-3/design-review-gate.md` | GATE判定結果 |

## 統合テスト連携

- 旧経路参照ゼロを Phase 7 のカバレッジ確認で再検証する
- セキュリティ均一性テストは Phase 6 で境界条件追加の起点にする

## 成果物

| 成果物           | パス                             | 説明                        |
| ---------------- | -------------------------------- | --------------------------- |
| テストマトリクス | `outputs/phase-4/test-matrix.md` | テストケース一覧と AC対応表 |

## 完了条件

- [ ] ImprovementProposalPanel の移行検証テストが定義されている
- [ ] GovernanceSummaryPanel の移行検証テストが定義されている
- [ ] 旧経路不使用の静的チェックコマンドが確認されている
- [ ] AC-1〜AC-8 とテストが対応している
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次Phase

→ [Phase 5: 実装](./phase-5-implementation.md)
