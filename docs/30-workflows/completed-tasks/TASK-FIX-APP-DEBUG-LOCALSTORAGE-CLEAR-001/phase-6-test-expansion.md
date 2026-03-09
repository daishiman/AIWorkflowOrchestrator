# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 |
| Phase      | 6                                         |
| Phase名    | テスト拡充                                |
| カテゴリ   | fix                                       |
| ステータス | completed                                 |
| 前提Phase  | Phase 5                                   |
| 後続Phase  | Phase 7                                   |

## 目的

Phase 5 の実装後にカバレッジ不足箇所を特定し、基準未達なら追加テストを作成する。

## 実行タスク

- タスク1: App.tsx と関連テストのカバレッジを計測する
- タスク2: 削除差分に直結する不足箇所だけを追加対象として確定する
- タスク3: カバレッジ未達時のみ追加テストを実装し、回帰を防ぐ

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

### タスク3: 追加テスト実装（カバレッジ未達時のみ）

**目的**: カバレッジ不足箇所に対するテストを追加する

**手順**:

1. 不足箇所を特定
2. テストケースを設計
3. テストコードを実装
4. テスト実行して PASS を確認

## 参照資料

| 参照資料       | パス                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| Phase 5 成果物 | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-5-implementation.md` |
| カバレッジ基準 | `.claude/rules/02-code-quality.md`                                                                      |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                              | 内容                                                    |
| -------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 品質要件             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | カバレッジ基準・テスト拡充判定基準                      |
| 状態管理設計         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | persist 復元と Store 初期化フローのテスト観点           |
| コンポーネントテスト | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | happy-dom / localStorage polyfill / Electron API モック |

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
- [ ] カバレッジ未達の場合、追加テストが実装されていること
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 7: カバレッジ確認へ進む。
