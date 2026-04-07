# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                                                  |
| ---------- | --------------------------------------------------------------------- |
| Phase      | 7                                                                     |
| Phase名    | カバレッジ確認                                                        |
| 対象機能   | UT-SDK-07-APPROVAL-REQUEST-SURFACE-001: approval:request surface 追加 |
| 前提Phase  | Phase 6: テスト拡充                                                   |
| 次Phase    | Phase 8: リファクタリング                                             |
| ステータス | pending                                                               |
| 作成日     | 2026-04-06                                                            |
| 更新日     | 2026-04-06                                                            |

## 目的

変更ファイルのカバレッジを測定し、目標値（Line 80%・Branch 60%・Function 80%）を達成しているか確認する。

## 実行タスク

### Task 1: カバレッジ測定コマンド実行

```bash
# 変更ファイルのカバレッジ測定
pnpm --filter @repo/desktop test -- --coverage \
  --testPathPattern="approval" \
  --collectCoverageFrom="apps/desktop/src/preload/skill-creator-api.ts" \
  --collectCoverageFrom="apps/desktop/src/renderer/components/skill/ApprovalRequestPanel.tsx" \
  --collectCoverageFrom="apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx"
```

### Task 2: カバレッジ目標確認

| ファイル                                         | Line Coverage | Branch Coverage | Function Coverage | 目標達成 |
| ------------------------------------------------ | ------------- | --------------- | ----------------- | -------- |
| `skill-creator-api.ts`（onApprovalRequest 部分） | -             | -               | -                 | -        |
| `ApprovalRequestPanel.tsx`                       | -             | -               | -                 | -        |
| `SkillLifecyclePanel.tsx`（approval 関連部分）   | -             | -               | -                 | -        |

**目標値**:

- Line Coverage: 80%以上（推奨 90%）
- Branch Coverage: 60%以上（推奨 70%）
- Function Coverage: 80%以上（推奨 90%）

### Task 3: カバレッジ不足箇所の特定

カバレッジが目標未達の場合、Phase 6 で追加テストを作成するか、Phase 8 でリファクタリングにより不要コードを削除するかを判断する。

**カバレッジ対象外として明示するもの**（変更していないファイル）:

- `apps/desktop/src/main/services/runtime/ApprovalGate.ts`（変更なし）
- `apps/desktop/src/main/ipc/approvalHandlers.ts`（変更なし）

### Task 4: branch カバレッジの確認

以下の分岐が全てカバーされているかを確認:

| 分岐                                  | 対応テスト |
| ------------------------------------- | ---------- |
| `status === 'pending'` の表示         | Phase 4 TC |
| `status === 'expired'` の表示         | Phase 6 TC |
| `status === 'resolved'` の非表示      | Phase 4 TC |
| `isExpired === true` でのボタン無効化 | Phase 6 TC |
| approve 操作成功                      | Phase 4 TC |
| reject 操作成功                       | Phase 4 TC |
| IPC 失敗時のエラーハンドリング        | Phase 6 TC |
| cleanup 関数呼び出し                  | Phase 6 TC |

## 参照資料

| 資料名           | パス                                 | 説明             |
| ---------------- | ------------------------------------ | ---------------- |
| Phase 6 レポート | `outputs/phase-6/coverage-report.md` | 追加テストの一覧 |

## 成果物

| 成果物         | パス                                       | 説明                                       |
| -------------- | ------------------------------------------ | ------------------------------------------ |
| カバレッジ検証 | `outputs/phase-7/coverage-verification.md` | 実測カバレッジ・目標達成状況・不足箇所分析 |

## 統合テスト連携

- Phase 7 の不足箇所は Phase 6 のテスト拡充または Phase 8 のリファクタリングに戻して解消する。
- coverage 結果は Phase 9 の品質保証と Phase 10 の最終レビューの根拠として使う。

## 完了条件

- [ ] カバレッジ測定コマンドを実行した
- [ ] 3 ファイルの Line/Branch/Function カバレッジが計測されている
- [ ] 全ファイルで Line 80%・Branch 60%・Function 80% 以上を達成している
- [ ] カバレッジ対象外のファイル（変更なし）が明示されている
- [ ] `outputs/phase-7/coverage-verification.md` が作成されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 8: リファクタリング](./phase-8-refactoring.md)
