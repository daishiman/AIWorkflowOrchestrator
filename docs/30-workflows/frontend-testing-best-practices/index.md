# フロントエンドテストベストプラクティス導入

## 概要

フロントエンドテスト環境を強化し、MSW導入・Vitest UI・E2Eテスト拡充・カバレッジ閾値設定を実現する。

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| 機能名     | frontend-testing-best-practices |
| タスクID   | TEST-01                         |
| 作成日     | 2026-01-04                      |
| ステータス | Phase 10 完了                   |

## Phase一覧

| Phase | 名称               | ステータス | 完了日     |
| ----- | ------------------ | ---------- | ---------- |
| 1     | 要件定義           | 完了       | 2026-01-04 |
| 2     | 設計               | 完了       | 2026-01-04 |
| 3     | 設計レビューゲート | 完了       | 2026-01-04 |
| 4     | テスト作成         | 完了       | 2026-01-05 |
| 5     | 実装               | 完了       | 2026-01-05 |
| 6     | リファクタリング   | 完了       | 2026-01-05 |
| 7     | 品質保証           | 完了       | 2026-01-05 |
| 8     | 最終レビューゲート | 完了       | 2026-01-05 |
| 9     | 手動テスト検証     | 完了       | 2026-01-05 |
| 10    | ドキュメント更新   | 完了       | 2026-01-05 |
| 11    | PR作成             | 未実施     | -          |

## 目標

### 機能目標

- MSW (Mock Service Worker) 導入による外部API依存排除
- Vitest UI 導入によるデバッグ効率向上
- E2Eテスト10-15本への拡充
- カバレッジ閾値設定（80%目標）

### 品質目標

- テストカバレッジ: 80%以上
- E2Eテスト: flaky rate 0%
- テスト実行時間: 10秒以下

## 成果物配置

| 成果物タイプ       | 配置先                                     |
| ------------------ | ------------------------------------------ |
| ドキュメント成果物 | `outputs/phase-N/`                         |
| コード成果物       | `apps/desktop/src/`, `packages/shared/src` |

## Phase仕様書

- [Phase 1: 要件定義](./phase-1-requirements.md)
- [Phase 2: 設計](./phase-2-design.md)
- [Phase 3: 設計レビューゲート](./phase-3-design-review.md)
- [Phase 4: テスト作成](./phase-4-test-creation.md)
- [Phase 5: 実装](./phase-5-implementation.md)
- [Phase 6: リファクタリング](./phase-6-refactoring.md)
- [Phase 7: 品質保証](./phase-7-quality-assurance.md)
- [Phase 8: 最終レビューゲート](./phase-8-final-review.md)
- [Phase 9: 手動テスト検証](./phase-9-manual-testing.md)
- [Phase 10: ドキュメント更新](./phase-10-documentation.md)
- [Phase 11: PR作成](./phase-11-pr-creation.md)

## 元タスク

- [task-frontend-testing-best-practices.md](../unassigned-task/task-frontend-testing-best-practices.md)
