# TASK-P0-04: ManifestLoader デフォルト起動パス基盤 - タスク実行仕様書

## メタ情報

| 項目       | 値                              |
| ---------- | ------------------------------- |
| タスクID   | TASK-P0-04                      |
| 機能名     | manifest-loader-default-startup |
| 作成日     | 2026-03-29                      |
| ステータス | completed                       |
| 総Phase数  | 13                              |

## 概要

本workflowの current fact は、`RuntimeSkillCreatorFacade` への自動起動統合ではなく、`constants.ts` による manifest path 解決基盤と `ManifestLoader.production-manifest.test.ts` の検証強化である。Phase 1-12 はこの実差分に合わせて再同期済みで、Phase 13 はユーザー未承認のため `blocked` を維持する。

## Phase一覧

| Phase | 名称             | 仕様書                                                       | ステータス |
| ----- | ---------------- | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義         | [phase-1-requirements.md](phase-1-requirements.md)           | completed  |
| 2     | 設計             | [phase-2-design.md](phase-2-design.md)                       | completed  |
| 3     | 設計レビュー     | [phase-3-design-review.md](phase-3-design-review.md)         | completed  |
| 4     | テスト作成       | [phase-4-test-creation.md](phase-4-test-creation.md)         | completed  |
| 5     | 実装             | [phase-5-implementation.md](phase-5-implementation.md)       | completed  |
| 6     | テスト拡充       | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | completed  |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | completed  |
| 8     | リファクタリング | [phase-8-refactoring.md](phase-8-refactoring.md)             | completed  |
| 9     | 品質保証         | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | completed  |
| 10    | 最終レビュー     | [phase-10-final-review.md](phase-10-final-review.md)         | completed  |
| 11    | 手動テスト       | [phase-11-manual-test.md](phase-11-manual-test.md)           | completed  |
| 12    | ドキュメント更新 | [phase-12-documentation.md](phase-12-documentation.md)       | completed  |
| 13    | PR作成           | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | blocked    |

## 実行フロー

1. Phase 1-3 で task scope を「runtime hookup」から「path resolution foundation」へ補正する。
2. Phase 4-7 で helper とテストの証跡を揃える。
3. Phase 8-10 で過剰主張を除去し、受入基準を current facts に合わせる。
4. Phase 11-12 で NON_VISUAL close-out と workflow root 同期を完了し、仕様書に書いた内容は原則この task package 内で完了させる。
5. Phase 13 はユーザー承認が出るまで進めない。

## 未タスク方針

- タスク仕様書に記述した内容は原則すべて実行する。
- `unassigned-task` は基本的に発生させない。
- 例外は、対応すると問題を生じる恐れのある大きな課題だけとする。
- 単なる実行漏れ、close-out 不足、same-wave で閉じられる不足は未タスク化しない。

## 30思考法監査サマリ

| 思考法               | このタスクでの結論                                       |
| -------------------- | -------------------------------------------------------- |
| 批判的思考           | 「runtime 自動起動まで完了」という読みを否定した         |
| 演繹思考             | 差分が helper と test だけなので責務もそこへ閉じた       |
| 帰納的思考           | 複数のズレから root 欠落が主要因だと抽出した             |
| アブダクション       | validator fail の説明仮説を root file 欠落に置いた       |
| 垂直思考             | helper, test, root, Phase 12 の順で修正した              |
| 要素分解             | code / docs / validator / close-out に分解した           |
| MECE                 | 実装・仕様・検証・運用を重複なく整理した                 |
| 2軸思考              | code fact と doc fact の2軸で点検した                    |
| プロセス思考         | Phase 1-12 を実績ベースで再同期した                      |
| メタ思考             | 問題は code 不足より仕様書の主張過多だと捉え直した       |
| 抽象化思考           | 本質を manifest path 契約の一本化と定義した              |
| ダブル・ループ思考   | outputs only 構造自体を見直して root を補完した          |
| ブレインストーミング | copy, move, rewrite の候補から補完型再構成を選んだ       |
| 水平思考             | code 修正ではなく docs 正規化で skill 準拠を回復した     |
| 逆説思考             | 追加実装より削るべき誤主張を先に特定した                 |
| 類推思考             | 他 completed-task の正規形から構造を借りた               |
| if思考               | root を足さなければ validator fail が残ると判断した      |
| 素人思考             | 本当に自動起動しているかをゼロベースで問い直した         |
| システム思考         | P0-03 → P0-04 → P0-05 の依存で位置付けた                 |
| 因果関係分析         | root 欠落 → validator fail → close-out 不成立を確認した  |
| 因果ループ           | 過大記述が review を甘くする循環を断った                 |
| トレードオン思考     | 全面再作成より補完型再構成で変更量を抑えた               |
| プラスサム思考       | skill 準拠と実装事実の両立を達成した                     |
| 価値提案思考         | 読み手が実装済み範囲を即判別できることを価値とした       |
| 戦略的思考           | downstream の runtime hookup を P0-05 へ戻した           |
| why思考              | validator fail の根本原因を掘り、表層修正を避けた        |
| 改善思考             | PASS だけでなく warning 0 まで持っていった               |
| 仮説思考             | root 補完で verify-all-specs が通る仮説を検証した        |
| 論点思考             | 主論点を「実装不足」ではなく「仕様書の過大主張」に絞った |
| KJ法                 | 差分事実、skill 要件、Phase 12 必須物を再編成した        |
