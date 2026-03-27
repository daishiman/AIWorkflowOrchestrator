# TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-IMPLEMENTATION-CLOSURE-001: runtime policy centralization 実装収束タスク

## メタ情報

| 項目         | 内容                                                                                      |
| ------------ | ----------------------------------------------------------------------------------------- |
| タスクID     | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-IMPLEMENTATION-CLOSURE-001                         |
| タスク種別   | 改善 / 実装収束                                                                           |
| 優先度       | 高                                                                                        |
| 複雑度       | medium                                                                                    |
| ステータス   | completed（Phase 1-12 completed / Phase 13 blocked）                                      |
| 親タスク     | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001                                                |
| 関連下流     | UT-CLEANUP-AI-CHECK-CONNECTION-001, UT-CLEANUP-RUNTIME-RESOLVER-001                       |
| 元タスク     | `../unassigned-task/task-imp-runtime-policy-centralization-implementation-closure-001.md` |
| GitHub Issue | #1663                                                                                     |
| Issue確認日  | 2026-03-27                                                                                |
| Issue状態    | CLOSED                                                                                    |
| 備考         | Issue は closed 管理だが、2026-03-27 時点で実行対象タスクとして扱う                       |
| 作成日       | 2026-03-27                                                                                |

## 概要

`TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001` で確定した central policy 設計を、actual consumer 実装、shared transport、IPC / preload 契約、テスト証跡まで含めて current code に閉じるための 13 Phase 実行仕様書である。

論点は単なる `RuntimeResolver` 置換ではない。Main Process が `RuntimePolicyResolver` を唯一の authority として消費し、AI Chat / Skill / Agent / Skill Creator が同じ decision vocabulary を使い、cleanup task に進める条件まで証明することにある。

## この task で固定すること

- `skillHandlers.ts` / `agentHandlers.ts` / `aiHandlers.ts` / `creatorHandlers.ts` の consumer contract を central policy に揃える
- `RuntimeSkillCreatorFacade.execute()` が decision を実際の実行可否へ反映する条件を固定する
- `packages/shared` / preload / IPC で共有すべき runtime decision transport を確定する
- unit / integration / regression test の最小完了ラインを固定する
- cleanup task に進める exit criteria を明文化する

## 非対象

- runtime policy 設計そのものの再定義
- mainline UI 文言や CTA の大規模再設計
- 新しい surface の追加
- commit / push / PR 作成

## 受入基準

| ID   | 基準                                                                                         |
| ---- | -------------------------------------------------------------------------------------------- |
| AC-1 | main process の consumer が `RuntimePolicyResolver` 契約へ統一される                         |
| AC-2 | AI Chat / Skill / Agent / Skill Creator の各 execute path で decision が実消費される         |
| AC-3 | shared runtime decision transport が `packages/shared` と preload / IPC 契約で参照可能になる |
| AC-4 | `AI_CHECK_CONNECTION` legacy route の残置条件と cleanup 入口が明確になる                     |
| AC-5 | regression test が centralization の主要経路と失敗系をカバーする                             |
| AC-6 | cleanup task 着手条件が Phase 10-12 で検証可能な文章に落ちている                             |

## 依存関係

| 種別        | 参照先                                                                                    | 役割                                     |
| ----------- | ----------------------------------------------------------------------------------------- | ---------------------------------------- |
| source      | `../unassigned-task/task-imp-runtime-policy-centralization-implementation-closure-001.md` | 問題定義の正本                           |
| predecessor | `../step-02-seq-task-02-runtime-policy-centralization/index.md`                           | Task02 の設計成果物                      |
| predecessor | `../step-02-seq-task-02-runtime-policy-centralization/outputs/phase-2/contract-matrix.md` | ownership / policy consumption contract  |
| predecessor | `../step-02-seq-task-02-runtime-policy-centralization/outputs/phase-3/gate-decision.md`   | Phase 4 着手条件                         |
| parent pack | `../ai-runtime-execution-responsibility-realignment/index.md`                             | workflow 全体の依存順と lane 位置づけ    |
| governance  | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                      | same-wave sync と completed/backlog 連携 |

## 現行コードアンカー

| ファイル                                                              | 観察点                                                 |
| --------------------------------------------------------------------- | ------------------------------------------------------ |
| `apps/desktop/src/main/ipc/index.ts`                                  | resolver / facade / handler の composition root        |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                          | 旧 resolver 依存の skill execute path                  |
| `apps/desktop/src/main/ipc/agentHandlers.ts`                          | agent execute path の policy 消費                      |
| `apps/desktop/src/main/ipc/aiHandlers.ts`                             | `AI_CHECK_CONNECTION` legacy route と runtime bypass   |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                        | skill creator 公開 surface の decision transport       |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | execute での decision 消費と terminal handoff 分岐     |
| `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`     | authority 側契約                                       |
| `packages/shared/src/types/`                                          | shared decision / guidance / health transport の置き場 |
| `preload/`                                                            | public IPC / preload surface の export 契約            |

## 要件レビュー一次結論

| 観点                 | 結論                                                                                                      |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| 真の論点             | 設計不足ではなく consumer 実装と transport が current code に閉じていないこと                             |
| 依存関係・責務境界   | authority は `RuntimePolicyResolver`、consumer は各 handler / facade、shared は IPC 越境型に限定する      |
| 価値とコストの不均衡 | 新規機能追加よりも既存 4 surface の統一と test coverage 回復を優先する                                    |
| 改善優先順位         | 1. consumer 配線 2. shared / preload 契約 3. execute path 反映 4. regression test 5. cleanup 条件固定     |
| 4条件評価            | 価値性・実現性・整合性・運用性は、Task02 の設計成果物を前提に current code close-out へ絞ることで満たせる |

## 30種の思考法適用サマリー

| カテゴリ     | 思考法               | 本 task での適用結果                                                                                                                        |
| ------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 論理分析系   | 批判的思考           | 「centralization 設計は完了しているのに close-out も完了」と誤認しないよう、workflow 完了と実装完了を分離する                               |
| 論理分析系   | 演繹思考             | Task02 契約が authority 固定を要求するため、各 consumer は local 判定を持たない、という結論へ落とす                                         |
| 論理分析系   | 帰納的思考           | `skillHandlers.ts` / `agentHandlers.ts` / `aiHandlers.ts` / `creatorHandlers.ts` の個別 gap から「consumer 側未収束」が主問題だと一般化する |
| 論理分析系   | アブダクション       | bypass、legacy handler、未統合 transport の同時残存理由を「central policy の end-to-end 配線不足」と仮説化する                              |
| 論理分析系   | 垂直思考             | authority、consumer、transport、tests、cleanup の順で狭め、論点を増やさず収束させる                                                         |
| 構造分解系   | 要素分解             | gap を consumer / transport / tests / cleanup condition に分解して Phase 成果物へ対応付ける                                                 |
| 構造分解系   | MECE                 | 4観点の重複を避け、cleanup を positive completion と混在させない                                                                            |
| 構造分解系   | 2軸思考              | 「current contract / target delta」と「blocking / follow-up」の2軸で設計判断を分ける                                                        |
| 構造分解系   | プロセス思考         | DI → consumer wiring → preload/IPC → tests → cleanup gate の順に依存辺を固定する                                                            |
| メタ・抽象系 | メタ思考             | 「仕様書が存在すること」と「close-out が証明できること」を別レイヤとして扱う                                                                |
| メタ・抽象系 | 抽象化思考           | surface ごとの差分ではなく decision vocabulary と authority ownership の問題へ抽象化する                                                    |
| メタ・抽象系 | ダブル・ループ思考   | local 判定を直すだけでなく、local 判定が再発しにくい review gate と cleanup 条件を仕様へ織り込む                                            |
| 発想・拡張系 | ブレインストーミング | consumer 直修正、facade 側吸収、shared transport 先行、cleanup 先行の案を洗い出し比較する                                                   |
| 発想・拡張系 | 水平思考             | `AI_CHECK_CONNECTION` cleanup を本 task 完了条件から切り離し、follow-up として扱う導線を採用する                                            |
| 発想・拡張系 | 逆説思考             | すぐ消したい legacy route を「あえて残す条件」を定義し、premature cleanup を防ぐ                                                            |
| 発想・拡張系 | 類推思考             | Task02 の design close-out と同様に、「authority を1つ、cleanup を別 ledger」で閉じる構造を再利用する                                       |
| 発想・拡張系 | if思考               | preload だけ更新、shared だけ更新、tests だけ更新の各片手落ちケースを failure path として先に潰す                                           |
| 発想・拡張系 | 素人思考             | 「なぜ同じ blocked 理由なのに surface ごとに違うのか」という利用者視点の違和感を判断起点に置く                                              |
| システム系   | システム思考         | resolver、facade、handlers、preload、shared types、tests の相互依存を1つの収束系として扱う                                                  |
| システム系   | 因果関係分析         | local 判定残存 → surface drift → cleanup 着手不能、という因果を可視化する                                                                   |
| システム系   | 因果ループ           | drift 放置がさらにテスト不足を呼び、テスト不足が drift 発見を遅らせる強化ループを gate で断つ                                               |
| 戦略・価値系 | トレードオン思考     | cleanup 即実施よりも close-out 証明を優先し、短期の見た目より再監査容易性を取る                                                             |
| 戦略・価値系 | プラスサム思考       | consumer 統一、shared contract 同期、cleanup 条件明文化を同時に満たす設計に寄せる                                                           |
| 戦略・価値系 | 価値提案思考         | 実装者には wiring 方針、監査者には close-out 根拠、後続 task には cleanup 入口を提供する                                                    |
| 戦略・価値系 | 戦略的思考           | Task02 の設計価値を捨てず、current code close-out のみを最短で成立させる範囲へ絞る                                                          |
| 問題解決系   | why思考              | なぜ未収束かを「設計不足」ではなく「consumer 実装への接続不足」と定義し直す                                                                 |
| 問題解決系   | 改善思考             | 既存構造の全面破棄ではなく、authority を保ったまま drift 面だけを減らす改善にする                                                           |
| 問題解決系   | 仮説思考             | 最大リスクは public / internal contract の二重化だと仮説を置き、creator surface を重点観察点にする                                          |
| 問題解決系   | 論点思考             | 「何を直すか」より先に「何を完了条件に含めないか」を明示してスコープ逸脱を防ぐ                                                              |
| 問題解決系   | KJ法                 | gap 群を consumer / transport / tests / cleanup / governance に束ねて説明責務を整理する                                                     |

## 破棄判断

既存 Task02 設計成果物は authority / vocabulary / cleanup separation の骨格が妥当であり、全面破棄は不要と判断する。  
本 task で破棄すべき対象は「surface ごとの局所判定」「public / internal の二重契約」「cleanup と close-out を混同する説明」の3点であり、設計骨格を活かしつつ consumer 実装と運用ガードだけを再構成する方が最小複雑性である。

## 検証4条件の適用

| 条件         | この仕様での担保方法                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| 矛盾なし     | Task02 authority 契約と current task の completion / cleanup 条件を分離し、相反する終了宣言を禁止する |
| 漏れなし     | consumer / transport / tests / cleanup / governance の5束で gap を網羅し、Phase 1-12 に割り当てる     |
| 整合性あり   | `RuntimePolicyResolver` を唯一 authority とし、decision vocabulary を shared transport で統一する     |
| 依存関係整合 | DI → consumer → preload/IPC → tests → cleanup gate の順に実装と検証の依存を固定する                   |

## ディレクトリ構成

```text
task-imp-runtime-policy-centralization-implementation-closure-001/
├── index.md
├── artifacts.json
├── phase-1-requirements.md
├── phase-2-design.md
├── phase-3-design-review.md
├── phase-4-test-creation.md
├── phase-5-implementation.md
├── phase-6-test-expansion.md
├── phase-7-coverage-check.md
├── phase-8-refactoring.md
├── phase-9-quality-assurance.md
├── phase-10-final-review.md
├── phase-11-manual-test.md
├── phase-12-documentation.md
├── phase-13-pr-creation.md
└── outputs/
    ├── artifacts.json
    └── verification-report.md
```

## 実装者向けクイックガイド

### 着手条件

- Task02 の `index.md` / `contract-matrix.md` / `gate-decision.md` を読了している
- 2026-03-27 時点で Issue #1663 は CLOSED だが、管理上 closed のみで実行対象と理解している
- local branch が未作成なら `task/1663-runtime-policy-centralization-closure` など、task-id と issue 番号が分かる名前で切る
- `git commit` / `git push` / `gh pr create` はユーザー明示指示まで行わない

### 想定変更ポイント

- `apps/desktop/src/main/ipc/index.ts`
- `apps/desktop/src/main/ipc/skillHandlers.ts`
- `apps/desktop/src/main/ipc/agentHandlers.ts`
- `apps/desktop/src/main/ipc/aiHandlers.ts`
- `apps/desktop/src/main/ipc/creatorHandlers.ts`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`
- `packages/shared/src/types/*`
- `preload/*`
- `apps/desktop/src/main/services/runtime/__tests__/*`
- `apps/desktop/src/main/ipc/__tests__/*`

## Phase 一覧

| Phase | 名称             | 仕様書                                                         | ステータス |
| ----- | ---------------- | -------------------------------------------------------------- | ---------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | completed  |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | completed  |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | completed  |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | completed  |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | completed  |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | completed  |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | completed  |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | completed  |
| 9     | 品質保証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | completed  |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | completed  |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | completed  |
| 12    | ドキュメント更新 | [phase-12-documentation.md](./phase-12-documentation.md)       | completed  |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | blocked    |
