# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| Phase      | 7                                      |
| 前提Phase  | Phase 6                                |
| 後続Phase  | Phase 8                                |
| ステータス | 未実施                                 |
| 作成日     | 2026-04-06                             |
| 機能名     | ut-sdk-07-approval-request-surface-001 |

## 目的

テストカバレッジが目標値（Line 80%+ / Branch 60%+ / Function 80%+）を達成していることを確認する。未達の場合は Phase 6 に戻ってテストを追加する。

---

## 実行タスク

### タスク1: カバレッジ計測

**目的**: 追加したコードのカバレッジを計測する

**実行手順**:

1. カバレッジレポートを生成する
2. 対象ファイルのカバレッジ値を確認する
3. ゲート基準を満たすか判定する

**実行コマンド**:

```bash
# カバレッジ付きテスト実行
pnpm --filter @repo/desktop test -- --coverage skill-creator-api.approval
pnpm --filter @repo/desktop test -- --coverage SkillLifecyclePanel.approval
```

---

### タスク2: カバレッジゲート判定

**カバレッジ目標**:

| 対象ファイル                        | Line Coverage | Branch Coverage | Function Coverage |
| ----------------------------------- | ------------- | --------------- | ----------------- |
| `skill-creator-api.ts`（追加分）    | 80%+          | 60%+            | 80%+              |
| `SkillLifecyclePanel.tsx`（追加分） | 80%+          | 60%+            | 80%+              |

**ゲート判定**:

| 判定 | 条件                     | 次のアクション                 |
| ---- | ------------------------ | ------------------------------ |
| PASS | 全指標が最低基準を満たす | Phase 8 へ進行                 |
| FAIL | いずれかの指標が未達     | Phase 6 に戻りテストを追加する |

**IPC 経路カバレッジ**:

| 指標                                 | 目標 | 結果            |
| ------------------------------------ | ---- | --------------- |
| `onApprovalRequest` チャンネル登録   | 100% | 本 Phase で確認 |
| ペイロード伝達                       | 100% | 本 Phase で確認 |
| リスナー解除                         | 100% | 本 Phase で確認 |
| UI 条件表示（destination あり/なし） | 100% | 本 Phase で確認 |

---

## 参照資料

| 参照資料        | パス                                                                                         | 内容           |
| --------------- | -------------------------------------------------------------------------------------------- | -------------- |
| preload テスト  | `apps/desktop/src/preload/__tests__/skill-creator-api.approval.test.ts`                      | カバレッジ対象 |
| renderer テスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.approval.test.tsx` | カバレッジ対象 |

---

## 成果物

| 成果物             | パス                                 | 内容               |
| ------------------ | ------------------------------------ | ------------------ |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | カバレッジ計測結果 |

---

## 完了条件

- [ ] Line Coverage 80%+ 達成
- [ ] Branch Coverage 60%+ 達成
- [ ] Function Coverage 80%+ 達成
- [ ] IPC 経路カバレッジ（正常系・解除）100% 達成
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 8: リファクタリング → [phase-8-refactoring.md](phase-8-refactoring.md)
