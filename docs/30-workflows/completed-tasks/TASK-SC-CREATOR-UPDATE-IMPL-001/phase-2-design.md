# Phase 2: 設計

## メタ情報

| 項目                | 内容                            |
| ------------------- | ------------------------------- |
| Phase               | 2                               |
| タスクID            | TASK-SC-CREATOR-UPDATE-IMPL-001 |
| 機能名              | SkillCreatorService update mode |
| taskType            | NON_VISUAL                      |
| implementation_mode | new                             |
| 前提Phase           | Phase 1                         |
| 後続Phase           | Phase 3                         |
| 作成日              | 2026-04-21                      |
| ステータス          | pending                         |

## 目的

Phase 1 で固定した code / test / spec anchor を入力に、`runUpdateWorkflow()` 実装を最小複雑性で成立させる target topology、validation path、spec sync 方針を定義する。

## 実行タスク

### タスク1: target topology の設計

| concern              | 所有レイヤ                   | 入力                    | 出力                      |
| -------------------- | ---------------------------- | ----------------------- | ------------------------- |
| update orchestration | `SkillCreatorService`        | `options`, `signal`     | update 実行結果           |
| purpose regeneration | `extractPurposeWithLlm()`    | `description`, `signal` | `purpose` または fallback |
| persistence handoff  | `SkillService.updateSkill()` | 更新 payload            | 永続化結果                |

### タスク2: 処理フローと progress 責務の設計

| ステップ | 処理内容                       | progress           | 主責務        |
| -------- | ------------------------------ | ------------------ | ------------- |
| 1        | 既存スキル読込                 | `loading-skill`    | service       |
| 2        | 既存内容解析                   | `analyzing`        | service       |
| 3        | purpose 再生成または既存値維持 | `generating-skill` | service + llm |
| 4        | payload 検証と永続化引き渡し   | `validating`       | service       |
| 5        | 完了確定                       | `done`             | caller        |

### タスク3: validation matrix の定義

| 観点        | コマンド / 手段                                           | 期待結果                     |
| ----------- | --------------------------------------------------------- | ---------------------------- |
| 型整合      | `pnpm --filter @repo/desktop typecheck`                   | PASS                         |
| unit test   | `pnpm --filter @repo/desktop test -- SkillCreatorService` | PASS                         |
| update path | 既存テスト + 追加テスト                                   | `runUpdateWorkflow` 実行確認 |
| cancel path | cancel test                                               | AbortSignal による中断確認   |

### タスク4: DI 境界と system spec sync 方針

| 項目                | 判断                                                                                         |
| ------------------- | -------------------------------------------------------------------------------------------- |
| DI 境界             | 新規 shared 型は作らず、既存 service / options 型を優先再利用する                            |
| simpler alternative | `runCreateWorkflow()` の汎用化より、`runUpdateWorkflow()` を独立実装した方が影響範囲が小さい |
| Step 2 要否仮説     | update mode 契約・progress semantics が変わるなら Step 2 必要。内部のみなら理由付き N/A      |

## 参照資料

| 資料         | パス                                         | 用途                           |
| ------------ | -------------------------------------------- | ------------------------------ |
| Phase 1 要件 | `outputs/phase-1/requirements-definition.md` | 設計入力                       |
| 正本対応表   | `outputs/phase-1/spec-extraction-map.md`     | system spec と code の対応確認 |
| 現状棚卸し   | `outputs/phase-1/current-state-inventory.md` | current fact 確認              |

### システム仕様（aiworkflow-requirements）

| 参照資料               | パス                                                                                | 内容                       |
| ---------------------- | ----------------------------------------------------------------------------------- | -------------------------- |
| skill creator API spec | `.agents/skills/aiworkflow-requirements/references/api-ipc-system-skill-creator.md` | update mode の公開契約候補 |
| spec guidelines        | `.agents/skills/aiworkflow-requirements/references/spec-guidelines.md`              | Step 2 更新対象記述の基準  |

## 実行手順

1. Phase 1 成果物から current fact と論点を再確認する
2. target topology と progress 責務をテーブル化する
3. validation matrix とモック対象を確定する
4. Step 2 要否仮説と simpler alternative を記録する

## 統合テスト連携

| 判定項目               | 基準                                     | 結果    |
| ---------------------- | ---------------------------------------- | ------- |
| topology 固定          | concern / owner / I/O が表で閉じる       | pending |
| validation matrix 定義 | 型・テスト・cancel・close-out 観点が揃う | pending |
| Step 2 要否仮説        | Phase 12 の判断材料が残る                | pending |

## 多角的チェック観点（AIが判断）

- 演繹思考: `runCreateWorkflow()` パターンから逸脱していないか
- MECE: orchestration / purpose / persistence / validation が重複なく分離されているか
- システム思考: Phase 12 の sync 判断まで接続しているか
- トレードオン思考: 共通化より局所実装の方が影響を減らせるか
- 仮説思考: Step 2 要否仮説が Phase 12 で検証可能か

## サブタスク管理

| サブタスク | 責務                             | 状態    |
| ---------- | -------------------------------- | ------- |
| ST-4       | topology table 作成              | pending |
| ST-5       | validation matrix 作成           | pending |
| ST-6       | system spec sync decision 下書き | pending |

## 成果物

| 成果物                  | パス                                           | 説明                                          |
| ----------------------- | ---------------------------------------------- | --------------------------------------------- |
| アーキテクチャ設計      | `outputs/phase-2/architecture-design.md`       | 処理フロー、責務境界、progress 配置           |
| 検証マトリクス          | `outputs/phase-2/validation-matrix.md`         | テスト / typecheck / cancel / review の検証線 |
| system spec sync 判断書 | `outputs/phase-2/system-spec-sync-decision.md` | Step 2 要否仮説と根拠                         |

## 完了条件

- [ ] target topology が concern 単位で定義されている
- [ ] validation matrix が型・テスト・cancel・close-out を含む
- [ ] simpler alternative を検討して採否が書かれている
- [ ] Phase 12 Step 2 の要否仮説が残っている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] Phase 3 gate 判定に必要な入力が揃っている

## 次Phase

Phase 3: 設計レビュー
