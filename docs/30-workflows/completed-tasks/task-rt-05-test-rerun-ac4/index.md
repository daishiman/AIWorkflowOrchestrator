# task-rt-05-test-rerun-ac4 - タスク実行仕様書

## ユーザーからの元の指示

```
Issue #1756 のタスク仕様書を作成してください。
TASK-RT-05（multi_select-user-input-kind）の Phase 9/10 テスト再実行・AC-4 既存kind非破壊確認。
タスクやイシューは完了になっていますが管理上完了にしているだけでまだ完了していないのでこれのタスク仕様書を作成してください。
```

## メタ情報

| 項目         | 内容                                                        |
| ------------ | ----------------------------------------------------------- |
| タスクID     | TASK-RT-05-TEST-RERUN                                       |
| タスク名     | task-rt-05-test-rerun-ac4                                   |
| 分類         | testing / regression-verification                           |
| 対象機能     | multi_select-user-input-kind (TASK-RT-05) Phase 9/10 再実行 |
| 優先度       | 高 (HIGH)                                                   |
| 見積もり規模 | 小規模（テスト再実行 + ドキュメント更新のみ）               |
| ステータス   | 未実施                                                      |
| 作成日       | 2026-03-31                                                  |
| GitHub Issue | #1756                                                       |

---

## Phase Links

- [Phase 1: 要件定義](phase-1-requirements.md)
- [Phase 2: 設計](phase-2-design.md)
- [Phase 3: 設計レビュー](phase-3-design-review.md)
- [Phase 4: テスト作成](phase-4-test-creation.md)
- [Phase 5: 実装](phase-5-implementation.md)
- [Phase 6: テスト拡充](phase-6-test-expansion.md)
- [Phase 7: カバレッジ確認](phase-7-coverage-check.md)
- [Phase 8: リファクタリング](phase-8-refactoring.md)
- [Phase 9: 品質保証](phase-9-quality-assurance.md)
- [Phase 10: 最終レビュー](phase-10-final-review.md)
- [Phase 11: 手動テスト](phase-11-manual-test.md)
- [Phase 12: 完了ドキュメント](phase-12-documentation.md)
- [Phase 13: PR作成](phase-13-pr-creation.md)

---

## タスク概要

### 目的

TASK-RT-05（multi_select-user-input-kind）の実装は完了しているが、esbuild darwin-arm64/darwin-x64 platform mismatch により Vitest が起動できず Phase 9（品質保証）と Phase 10（最終レビュー）が環境ブロックで未完了のまま残っている。

UT-RT-06 で esbuild 環境修正が施されたため、クリーンな環境でテストを再実行し、TASK-RT-05 の残課題を完全に解消する。

### 背景

- TASK-RT-05 の実装（shared type 拡張・engine validation・renderer input surface）は Phase 5 完了済み
- esbuild バイナリの platform mismatch（darwin-arm64/darwin-x64 不一致）により Vitest が起動せず
- UT-RT-06 で修正が施され、クリーンな再実行が可能な状態になった
- Phase 9 の `quality-report.md` と Phase 10 の `final-review-result.md` に「要再確認」が残っている

### 最終ゴール

1. `SkillCreatorWorkflowEngine.test.ts` 4 件以上 PASS
2. `SkillLifecyclePanel.llm-generation.test.tsx` 5 件以上 PASS
3. 既存 4 kind（single_select / free_text / secret / confirm）回帰 PASS
4. `step-09-par-task-rt-05-multi-select-user-input-kind/outputs/phase-9/quality-report.md` 「PASS」状態に更新
5. `step-09-par-task-rt-05-multi-select-user-input-kind/outputs/phase-10/final-review-result.md` AC-4「PASS」に更新

---

## 受入基準

| ID   | 基準                                                                                     | 確認方法                                                 |
| ---- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| AC-1 | Engine テスト 4 件以上 PASS                                                              | `vitest run SkillCreatorWorkflowEngine.test.ts`          |
| AC-2 | Renderer テスト 5 件以上 PASS                                                            | `vitest run SkillLifecyclePanel.llm-generation.test.tsx` |
| AC-3 | 既存 4 kind（single_select/free_text/secret/confirm）回帰 PASS                           | Phase 6 の grep 確認 + テスト結果                        |
| AC-4 | `outputs/phase-9/quality-report.md` が「PASS」状態に更新されている                       | ファイル内容確認                                         |
| AC-5 | `outputs/phase-10/final-review-result.md` の「AC-4: 要再確認」が「PASS」に更新されている | ファイル内容確認                                         |

---

## スコープ

### 含む

- 環境クリーンアップ（node_modules 完全削除 → pnpm install）
- Engine テスト実行（`SkillCreatorWorkflowEngine.test.ts`）
- Renderer テスト実行（`SkillLifecyclePanel.llm-generation.test.tsx`）
- `pnpm typecheck` / `pnpm lint` 確認
- `step-09-par-task-rt-05-multi-select-user-input-kind/outputs/phase-9/quality-report.md` 更新
- `step-09-par-task-rt-05-multi-select-user-input-kind/outputs/phase-10/final-review-result.md` 更新
- TASK-RT-05 の lessons-learned への esbuild mismatch 解消パターン追記

### 含まない

- 新規コード実装（TASK-RT-05 の実装は完了済み）
- 新規テストケースの追加（既存テストで AC を確認できる場合）
- IPC チャネルや型定義の変更

---

## タスク分類

| 属性       | 値                              |
| ---------- | ------------------------------- |
| タスク種別 | testing / doc-update            |
| UI task    | No（docs-only task）            |
| 新規実装   | No                              |
| 環境依存度 | High（esbuild mismatch が前提） |
| Phase 11   | NON_VISUAL（docs-only）         |

---

## 依存関係

| 種別     | タスクID / パス                                                                          | 説明                             |
| -------- | ---------------------------------------------------------------------------------------- | -------------------------------- |
| upstream | TASK-RT-05 (multi_select-user-input-kind)                                                | 本タスクで確認する実装の親タスク |
| upstream | UT-RT-06 (esbuild platform mismatch fix)                                                 | 環境修正の前提タスク             |
| 参照     | `docs/30-workflows/completed-tasks/step-09-par-task-rt-05-multi-select-user-input-kind/` | 親タスクのワークフロー           |
| 参照     | `docs/30-workflows/unassigned-task/task-rt-05-test-rerun-ac4.md`                         | 元の未タスク指示書               |

---

## 真の論点と4条件評価

### 真の論点

TASK-RT-05 の残課題は「新規実装の不足」ではなく、「環境ブロッカー解消後に test rerun と close-out spec sync を current facts へ戻すこと」である。

### 依存関係・責務境界の問題

- 環境修復の責務は UT-RT-06、再実行と close-out の責務は本タスクにある
- 親タスクの Phase 9/10 更新と、本 workflow 自身の Phase 12 sync を混同すると close-out が崩れる
- `.claude` を canonical、`.agents` を mirror とする境界を維持しないと skill 準拠検証が破綻する

### 価値とコストの不均衡

- 価値の中心は test rerun による AC-1〜AC-5 の完了証跡であり、新規実装ではない
- コストの中心は環境再構築と spec sync であり、ここを曖昧にすると実行より close-out で失敗する

### 改善優先順位

1. skill 準拠の構造整合
2. Phase 9/10 実行証跡の固定
3. Phase 11/12/13 の close-out 契約整合

### 4条件評価

| 条件         | 判定方針                                                                                |
| ------------ | --------------------------------------------------------------------------------------- |
| 矛盾なし     | 親タスク close-out と本 workflow close-out の責務を分離する                             |
| 漏れなし     | Phase 1〜13、`artifacts.json`、`outputs/artifacts.json`、Phase 11/12 補助成果物を揃える |
| 整合性あり   | canonical path、Phase 命名、成果物名、ステータス語彙を統一する                          |
| 依存関係整合 | Phase 2/5/6/7/11/12 の入力成果物を各後続 Phase で明示参照する                           |

---

## 30思考法適用マトリクス

| カテゴリ     | 思考法               | この workflow での使いどころ                                        |
| ------------ | -------------------- | ------------------------------------------------------------------- |
| 論理分析系   | 批判的思考           | 「実装不足」ではなく「再検証不足」が主問題かを切り分ける            |
| 論理分析系   | 演繹思考             | skill 定義から Phase 構造・成果物必須条件を導出する                 |
| 論理分析系   | 帰納的思考           | 既存 completed workflow の成功パターンから close-out 仕様を抽出する |
| 論理分析系   | アブダクション       | validator fail の最小原因を推定する                                 |
| 論理分析系   | 垂直思考             | Phase 1→13 を順方向に閉じる                                         |
| 構造分解系   | 要素分解             | 環境再構築、test rerun、doc sync を分離する                         |
| 構造分解系   | MECE                 | AC、Phase、成果物、spec sync を重複なく配置する                     |
| 構造分解系   | 2軸思考              | 実行系/記録系、canonical/mirror の2軸で整理する                     |
| 構造分解系   | プロセス思考         | blocker 解消後の rerun 手順を時系列で固定する                       |
| メタ・抽象系 | メタ思考             | この task が「テスト task」か「close-out task」かを再定義する       |
| メタ・抽象系 | 抽象化思考           | esbuild mismatch を「環境ブロッカー解除後の再検証一般問題」とみなす |
| メタ・抽象系 | ダブル・ループ思考   | なぜ Phase 9/10 が未完了化したかの運用前提を見直す                  |
| 発想・拡張系 | ブレインストーミング | rerun 成果物、補助成果物、spec sync 連携案を広げる                  |
| 発想・拡張系 | 水平思考             | 実コード変更なしでも validator を通す close-out 方法を検討する      |
| 発想・拡張系 | 逆説思考             | 「何を追加しないべきか」を決めて過剰設計を避ける                    |
| 発想・拡張系 | 類推思考             | 既存 completed workflow の Phase 11/12 パターンを借りる             |
| 発想・拡張系 | if思考               | test rerun fail、lint warning、spec sync no-op を分岐で固定する     |
| 発想・拡張系 | 素人思考             | なぜ再実行が必要かを Phase 12 Part 1 に落とせるように単純化する     |
| システム系   | システム思考         | 親 workflow、UT-RT-06、本 workflow の連鎖を捉える                   |
| システム系   | 因果関係分析         | esbuild mismatch → Vitest 停止 → Phase 9/10 保留の因果を明示する    |
| システム系   | 因果ループ           | blocker 再発防止のため lessons-learned 追記条件を定義する           |
| 戦略・価値系 | トレードオン思考     | 仕様の厳密さと実行コストの最適点を探る                              |
| 戦略・価値系 | プラスサム思考       | 親タスク更新と本 workflow 更新を同一 rerun で両立する               |
| 戦略・価値系 | 価値提案思考         | rerun により残課題をゼロ化する価値を明示する                        |
| 戦略・価値系 | 戦略的思考           | まず validator fail を潰し、その後に実行証跡へ進む                  |
| 問題解決系   | why思考              | Phase 9/10 が未完了のまま残った根因を明らかにする                   |
| 問題解決系   | 改善思考             | rerun workflow を再利用可能な close-out パターンにする              |
| 問題解決系   | 仮説思考             | 環境修復後なら既存テストで AC 充足可能と仮説化する                  |
| 問題解決系   | 論点思考             | 論点を「環境」「回帰」「close-out」「spec sync」に限定する          |
| 問題解決系   | KJ法                 | blocker、成果物、依存、未タスク候補をクラスタリングする             |

---

## Phase 構成

| Phase | 名称             | 目的                                                     | ステータス |
| ----- | ---------------- | -------------------------------------------------------- | ---------- |
| 1     | 要件定義         | スコープ・AC・対象ファイルを固定する                     | 未実施     |
| 2     | 設計             | テスト再実行の実行計画と spec sync 方針を設計する        | 未実施     |
| 3     | 設計レビュー     | Phase 4 へ進める実行計画かを判定する                     | 未実施     |
| 4     | テスト作成       | 既存テストを棚卸しし、流用可能な検証観点を固定する       | 未実施     |
| 5     | 実装             | 実行環境を再構築し、品質保証を進められる状態へ戻す       | 未実施     |
| 6     | テスト拡充       | 既存 4 kind 回帰の不足有無と追加要否を判定する           | 未実施     |
| 7     | カバレッジ確認   | AC ごとのテスト対応表を作成する                          | 未実施     |
| 8     | リファクタリング | no-op 判定の根拠を明文化し、Phase 9 への入口を整理する   | N/A        |
| 9     | 品質保証         | Engine・Renderer テストと静的解析を実行し結果を記録する  | 未実施     |
| 10    | 最終レビュー     | 親タスクの phase-9 / phase-10 更新を含め最終判定を行う   | 未実施     |
| 11    | 手動テスト       | docs-only として更新内容を確認する（NON_VISUAL）         | 未実施     |
| 12    | 完了ドキュメント | 実装ガイド・仕様更新・完了記録・未タスク・フィードバック | 未実施     |
| 13    | PR作成           | ユーザーの明示承認後に PR を作成する                     | 未実施     |

---

## Phase 導線

| Phase | 仕様書                                                       |
| ----- | ------------------------------------------------------------ |
| 1     | [phase-1-requirements.md](phase-1-requirements.md)           |
| 2     | [phase-2-design.md](phase-2-design.md)                       |
| 3     | [phase-3-design-review.md](phase-3-design-review.md)         |
| 4     | [phase-4-test-creation.md](phase-4-test-creation.md)         |
| 5     | [phase-5-implementation.md](phase-5-implementation.md)       |
| 6     | [phase-6-test-expansion.md](phase-6-test-expansion.md)       |
| 7     | [phase-7-coverage-check.md](phase-7-coverage-check.md)       |
| 8     | [phase-8-refactoring.md](phase-8-refactoring.md)             |
| 9     | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) |
| 10    | [phase-10-final-review.md](phase-10-final-review.md)         |
| 11    | [phase-11-manual-test.md](phase-11-manual-test.md)           |
| 12    | [phase-12-documentation.md](phase-12-documentation.md)       |
| 13    | [phase-13-pr-creation.md](phase-13-pr-creation.md)           |

---

## 参照資料

| 参照資料                | パス                                                                                               | 内容                     |
| ----------------------- | -------------------------------------------------------------------------------------------------- | ------------------------ |
| 元の未タスク指示書      | `docs/30-workflows/unassigned-task/task-rt-05-test-rerun-ac4.md`                                   | Phase 構成・苦戦箇所・AC |
| 親タスク workflow       | `docs/30-workflows/completed-tasks/step-09-par-task-rt-05-multi-select-user-input-kind/`           | TASK-RT-05 の全仕様書    |
| Engine テスト           | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`              | 対象テストファイル       |
| Renderer テスト         | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | 対象テストファイル       |
| task-spec-creator skill | `.claude/skills/task-specification-creator/SKILL.md`                                               | Phase 12 苦戦防止 Tips   |

---

## 変更履歴

| バージョン | 日付       | 変更内容                                                 |
| ---------- | ---------- | -------------------------------------------------------- |
| 1.0.0      | 2026-03-31 | Issue #1756 を基に初版作成（unassigned-task からの昇格） |
