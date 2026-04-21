# Phase 4: テスト作成

## メタ情報

| 項目                | 内容                            |
| ------------------- | ------------------------------- |
| Phase               | 4                               |
| タスクID            | TASK-SC-CREATOR-UPDATE-IMPL-001 |
| taskType            | NON_VISUAL                      |
| implementation_mode | new                             |
| 前提Phase           | Phase 3                         |
| 後続Phase           | Phase 5                         |
| 作成日              | 2026-04-21                      |
| ステータス          | pending                         |

## 目的

`runUpdateWorkflow()` 実装前に、更新経路・LLM fallback・AbortSignal・progress emit を検証するテスト観点を固定する。

## 実行タスク

- タスク1: 既存テスト資産を再利用し、重複追加を避ける
- タスク2: `test-matrix.md` で TC とテスト名を対応付ける
- タスク3: public API 経由でのテスト方針を明記する

## 参照資料

| 資料         | パス                                                                         | 用途         |
| ------------ | ---------------------------------------------------------------------------- | ------------ |
| Phase 3 gate | `outputs/phase-3/gate-decision.md`                                           | 進行条件確認 |
| 関連テスト   | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | 再利用元     |

## 実行手順

1. 既存 test bundle を棚卸しする
2. `update` / fallback / cancel / progress の TC を定義する
3. Red テストの追加場所を確定する

## 統合テスト連携

| 判定項目           | 基準                   | 結果    |
| ------------------ | ---------------------- | ------- |
| test matrix 作成   | 主要 TC が揃う         | pending |
| 既存 bundle 再利用 | 不要な重複テストがない | pending |

## 多角的チェック観点（AIが判断）

- MECE: 正常系 / fallback / 異常系 / cancel が揃っているか
- 改善思考: 既存 bundle 追記で足りるか

## サブタスク管理

| サブタスク | 責務               | 状態    |
| ---------- | ------------------ | ------- |
| ST-10      | test-matrix 作成   | pending |
| ST-11      | red-test-plan 作成 | pending |

## 成果物

| 成果物           | パス                               | 説明                 |
| ---------------- | ---------------------------------- | -------------------- |
| テストマトリクス | `outputs/phase-4/test-matrix.md`   | TC とテスト名対応    |
| Red テスト計画   | `outputs/phase-4/red-test-plan.md` | 追加するテストの方針 |

## 完了条件

- [ ] update / fallback / cancel / progress の TC が定義されている
- [ ] public API 経由のテスト方針が明記されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認

## 次Phase

Phase 5: 実装
