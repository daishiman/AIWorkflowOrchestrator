# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| Phase    | 7                                       |
| 機能名   | conversation-db-robustness              |
| 作成日   | 2026-03-18                              |
| タスクID | TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001 |
| 前Phase  | Phase 6（テスト拡充）                   |
| 次Phase  | Phase 8（リファクタリング）             |

## 目的

テストカバレッジが基準を満たしているか確認する。

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 実行タスク

- タスク1: `conversationDatabase.ts` のカバレッジ計測
- タスク2: カバレッジ不足箇所の特定
- タスク3: 基準未達の場合は Phase 6 への差し戻し判定

## 参照資料

### 前Phase成果物

| 成果物         | パス                                     |
| -------------- | ---------------------------------------- |
| 実装計画       | `outputs/phase-5/implementation-plan.md` |
| 回帰テスト計画 | `outputs/phase-6/regression-plan.md`     |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                        | 内容     |
| -------------------- | --------------------------------------------------------------------------- | -------- |
| quality-requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質基準 |

## 実行手順

### カバレッジ計測コマンド

```bash
cd apps/desktop && pnpm vitest run src/main/database/ --coverage
```

```bash
# ipc/index.ts の DI 部分カバレッジも確認
cd apps/desktop && pnpm vitest run src/main/ipc/ --coverage
```

## 統合テスト連携【必須】

既存 conversation テスト133件の回帰確認（カバレッジ計測時に全テスト PASS を確認）。

## 多角的チェック観点（AIが判断）

| 観点                             | チェック項目                                                                                                                                                                   |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| カバレッジ基準の適正性           | `conversationDatabase.ts` のカバレッジが最低基準（Line 80%, Branch 60%, Function 80%）を満たしているか。推奨基準（Line 90%, Branch 70%, Function 90%）との差分を記録しているか |
| P41（v8 インライン関数カウント） | v8 カバレッジプロバイダがインライン arrow function を独立関数としてカウントし、Function Coverage が低下していないか確認しているか                                              |
| 差し戻し判定の明確性             | 基準未達の場合、不足箇所が具体的に特定され、Phase 6 への差し戻し指示に不足テストケースが列挙されているか                                                                       |
| DI 部分のカバレッジ              | `ipc/index.ts` の Section 13 DI 分岐（`conversationDb` が `null` / 非 `null`）の両パスがカバーされているか                                                                     |

## 成果物

| 成果物         | パス                               | 説明                               |
| -------------- | ---------------------------------- | ---------------------------------- |
| カバレッジ計画 | `outputs/phase-7/coverage-plan.md` | カバレッジ計測結果・不足箇所の記録 |

## 完了条件

- [ ] Line Coverage 80% 以上
- [ ] Branch Coverage 60% 以上
- [ ] Function Coverage 80% 以上
- [ ] 未達の場合は Phase 6 に戻りテスト追加
- [ ] テスト実行は `cd apps/desktop` から行っていること（P40対策）
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] タスク1: `conversationDatabase.ts` のカバレッジ計測
- [ ] タスク2: カバレッジ不足箇所の特定
- [ ] タスク3: 基準未達の場合は Phase 6 への差し戻し判定
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次Phase

カバレッジ基準充足後、Phase 8（リファクタリング）に進む。
