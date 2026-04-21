# Phase 5: 実装

## メタ情報

| 項目                | 内容                            |
| ------------------- | ------------------------------- |
| Phase               | 5                               |
| タスクID            | TASK-SC-CREATOR-UPDATE-IMPL-001 |
| taskType            | NON_VISUAL                      |
| implementation_mode | new                             |
| 前提Phase           | Phase 4                         |
| 後続Phase           | Phase 6                         |
| 作成日              | 2026-04-21                      |
| ステータス          | pending                         |

## 目的

`runUpdateWorkflow()` を実装し、read → analyze → purpose regenerate/fallback → validate → persist の流れを `runCreateWorkflow()` と整合する形で閉じる。

## 実行タスク

- タスク1: `SkillCreatorService.ts` の update 経路を実装する
- タスク2: `canUseTool` 非適用範囲を含む callback 制約があれば明記する
- タスク3: 変更ファイル一覧と理由を `implementation-plan.md` に固定する

## 参照資料

| 資料         | パス                                     | 用途         |
| ------------ | ---------------------------------------- | ------------ |
| Phase 2 設計 | `outputs/phase-2/architecture-design.md` | 実装設計     |
| Phase 4 計画 | `outputs/phase-4/red-test-plan.md`       | 実装対象確認 |

## 実行手順

1. baseline テストを確認する
2. `runUpdateWorkflow()` と caller 側の呼び出しを実装する
3. 必要最小限の補助変更に留める

## 統合テスト連携

| 判定項目           | 基準                               | 結果    |
| ------------------ | ---------------------------------- | ------- |
| update path 実装   | stub が解消される                  | pending |
| fallback path 実装 | LLM 非存在・失敗時の維持が定義通り | pending |

## 多角的チェック観点（AIが判断）

- 演繹思考: 設計どおりの処理順序になっているか
- トレードオン思考: 共通化し過ぎて影響範囲を広げていないか

## サブタスク管理

| サブタスク | 責務                     | 状態    |
| ---------- | ------------------------ | ------- |
| ST-12      | implementation-plan 作成 | pending |
| ST-13      | change-record 作成       | pending |

## 成果物

| 成果物   | パス                                     | 説明                  |
| -------- | ---------------------------------------- | --------------------- |
| 実装計画 | `outputs/phase-5/implementation-plan.md` | 新規作成 / 修正一覧   |
| 変更記録 | `outputs/phase-5/change-record.md`       | Before / After / 理由 |

## 完了条件

- [ ] `runUpdateWorkflow()` 実装方針が固定されている
- [ ] 変更ファイル一覧が記録されている
- [ ] callback 制約がある場合は明記されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認

## 次Phase

Phase 6: テスト拡充
