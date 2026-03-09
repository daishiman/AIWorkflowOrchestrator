# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 |
| Phase      | 6                                         |
| Phase名    | テスト拡充                                |
| カテゴリ   | fix                                       |
| ステータス | pending                                   |
| 前提Phase  | Phase 5                                   |
| 後続Phase  | Phase 7                                   |

## 目的

Phase 5 の実装後にカバレッジ不足箇所を特定し、追加テストを作成する。

## 実行タスク

### タスク1: カバレッジ計測

**目的**: 現在のテストカバレッジを計測し、不足箇所を特定する

**手順**:

1. `cd apps/desktop && pnpm vitest run --coverage src/renderer/App.tsx`
2. App.tsx のカバレッジレポートを確認
3. Line Coverage, Branch Coverage, Function Coverage を記録

**カバレッジ基準**（02-code-quality.md 準拠）:

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### タスク2: 追加テストの検討

**目的**: カバレッジ不足箇所に対する追加テストを検討する

**検討項目**:

1. App.tsx の renderView() 内の各 case がテストされているか
2. auth 初期化の分岐（isAuthenticated / isLoading）がテストされているか
3. 削除後の App コンポーネントの初期化フローがテストされているか

**注意**: 本タスクのスコープはデバッグコード削除の検証であるため、App.tsx 全体のカバレッジ向上は求めない。削除に関連する箇所のカバレッジが基準を満たしていれば十分。

### タスク3: 追加テスト実装（必要な場合）

**目的**: カバレッジ不足箇所に対するテストを追加する

**手順**:

1. 不足箇所を特定
2. テストケースを設計
3. テストコードを実装
4. テスト実行して PASS を確認

## 参照資料

| 参照資料       | パス                                                                                    |
| -------------- | --------------------------------------------------------------------------------------- |
| Phase 5 成果物 | `docs/30-workflows/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-5-implementation.md` |
| カバレッジ基準 | `.claude/rules/02-code-quality.md`                                                      |

## 統合テスト連携

- Phase 7 でカバレッジ基準の充足を最終確認

## 成果物

| 成果物                   | パス                                                             |
| ------------------------ | ---------------------------------------------------------------- |
| カバレッジレポート       | `outputs/phase-6/coverage-report.md`                             |
| 追加テスト（必要な場合） | `apps/desktop/src/renderer/__tests__/App.debug-removal.test.tsx` |

## 完了条件

- [ ] カバレッジ計測が完了していること
- [ ] 不足箇所が特定されていること
- [ ] 必要に応じて追加テストが実装されていること
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 7: カバレッジ確認へ進む。
