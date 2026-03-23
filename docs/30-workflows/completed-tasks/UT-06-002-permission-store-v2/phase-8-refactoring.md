# Phase 8: リファクタリング

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 8                             |
| 機能名   | UT-06-002-permission-store-v2 |
| 作成日   | 2026-03-23                    |
| タスクID | UT-06-002                     |

## 目的

動作を変えずにコード品質を改善する（TDD: Refactor フェーズ）。

## 実行タスク

- Task 8-1: 重複排除 — V1 allowTool(string) と V2 allowToolV2(entry) の共通ロジック抽出
- Task 8-2: バリデーション統合 — validateSchema と validateSchemaV2 の統合検討
- Task 8-3: SOLID 原則適用 — SRP/OCP/DIP の確認と必要に応じた改善
- Task 8-4: 定数確認 — マジックナンバーが calcExpiresAt に集約されていることを確認

## 参照資料

| 資料名         | パス                                 | 説明           |
| -------------- | ------------------------------------ | -------------- |
| カバレッジ結果 | `outputs/phase-7/coverage-report.md` | Phase 7 成果物 |
| 実装仕様       | `outputs/phase-5/implementation.md`  | Phase 5 実装   |

## 実行手順

### ステップ1: コード構造の分析

V1 と V2 のメソッド間で重複するロジックを特定し、共通関数の抽出可能性を評価する。

### ステップ2: リファクタリング実施

テストが継続成功することを確認しながら、段階的にリファクタリングを実施する。

```bash
pnpm --filter @repo/desktop test src/main/services/skill/__tests__/PermissionStore.test.ts
pnpm --filter @repo/shared test
```

## 統合テスト連携

リファクタリング後にテストが継続成功することを確認:

```bash
pnpm --filter @repo/desktop test
pnpm --filter @repo/shared test
```

## 多角的チェック観点

| 観点           | 適用 | 確認内容               |
| -------------- | ---- | ---------------------- |
| アーキテクチャ | 適用 | SRP/OCP/DIP 準拠の確認 |

## 成果物

| 成果物               | パス                             | 説明                 |
| -------------------- | -------------------------------- | -------------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring.md` | リファクタリング結果 |

## 完了条件

- [ ] テストが継続成功している
- [ ] コード品質が改善されている
- [ ] 重複が排除されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 9: 品質検証
