---
task_id: TASK-SC-CREATOR-UPDATE-IMPL-001
task_name: SkillCreatorService runUpdateWorkflow 実処理実装
category: 改善
target_feature: SkillCreatorService update mode
priority: 中
scale: 中規模
status: pending
issue_number: 2318
created_date: 2026-04-21
implementation_mode: "new"
dependencies:
  - UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE
---

# TASK-SC-CREATOR-UPDATE-IMPL-001: SkillCreatorService runUpdateWorkflow 実処理実装

## メタ情報

| 項目                | 内容                                                                       |
| ------------------- | -------------------------------------------------------------------------- |
| タスクID            | TASK-SC-CREATOR-UPDATE-IMPL-001                                            |
| タスク名            | SkillCreatorService runUpdateWorkflow 実処理実装                           |
| タスク種別          | NON_VISUAL / 実装タスク                                                    |
| 分類                | 改善                                                                       |
| 優先度              | 中                                                                         |
| 規模                | 中規模                                                                     |
| ステータス          | pending                                                                    |
| implementation_mode | new                                                                        |
| GitHub Issue        | #2318（CLOSED）                                                            |
| 依存タスク          | UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE                                |
| 実装対象            | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` と関連テスト |

## ユーザー要求の要約

本ブランチの変更対象である `docs/30-workflows/TASK-SC-CREATOR-UPDATE-IMPL-001/` を、`task-specification-creator` と `aiworkflow-requirements` の両 skill に照らして再監査し、30種の思考法を使って不足を洗い出したうえで、実装タスクとして実行可能な 13 Phase workflow に再構成する。

## 概要

`SkillCreatorService.runUpdateWorkflow()` は現状スタブであり、`update` モードが公開契約に存在するにもかかわらず、既存スキルの読込・purpose 再生成・永続化・検証が閉じていない。したがって本 task の主責務は、`runCreateWorkflow()` の既存パターンを踏襲しつつ `update` モードの実処理を実装し、仕様・テスト・close-out までを一貫した workflow として定義することである。

## 真の論点

主問題は「未実装の実処理」と「それを支える task workflow の未閉鎖」が同時に残っていることだ。コードだけを直しても、Phase 11/12 の証跡や system spec sync の導線が曖昧なままだと、skill 準拠は達成できない。

## why now

- `update` モードの公開契約と実装が乖離したままだと、既存スキル更新要求が未定義動作になる
- 前タスクが dispatch までを接続済みであり、現時点で本体実装を閉じるのが最小コストである
- `task-specification-creator` / `aiworkflow-requirements` の current rule に沿って Phase 4-13 と spec sync を先に定義しないと、後続 close-out で再作業が発生する

## why this way

- **局所パッチではなく workflow を閉じる**: Phase 1-3 の調査メモを整理し、Phase 4-13 を追加して 13 Phase 実行仕様へ戻す
- **NON_VISUAL を前提化する**: UI 変更ではなく service / test / docs sync が本体なので、Phase 11 は代替証跡で設計する
- **正本参照を先に固定する**: Phase 1 の `spec-extraction-map.md` で code anchor と system spec anchor を結ぶ
- **最小複雑性を守る**: 詳細調査は outputs に逃がし、本文は判断・gate・成果物に絞る

## スコープ

### 含むもの

- `runUpdateWorkflow()` 実装 task の Phase 1-13 定義
- `SkillCreatorService.ts` / 既存テスト / related system spec を結ぶ参照導線
- NON_VISUAL task としての Phase 11 証跡設計
- Phase 12 の 6成果物と Step 1 / Step 2 の更新方針
- `artifacts.json` / `outputs/artifacts.json` の task root 整備

### 含まないもの

- commit、push、PR 作成
- `runImprovePromptWorkflow()` の本体実装
- `SkillService.updateSkill()` の内部永続化ロジック再設計
- skill 定義そのものの改訂

## 受け入れ基準

| ID   | 内容                                                                                                                          |
| ---- | ----------------------------------------------------------------------------------------------------------------------------- |
| AC-1 | workflow root が `index.md` + `artifacts.json` + Phase 1〜13 の全ファイルで閉じている                                         |
| AC-2 | Phase 1〜3 が `task-specification-creator` の共通骨格に揃い、`統合テスト連携` `多角的チェック観点` `サブタスク管理` を持つ    |
| AC-3 | Phase 1 に `spec-extraction-map.md` を含め、`aiworkflow-requirements` の正本仕様と current code anchor の対応が固定されている |
| AC-4 | Phase 4〜10 が `runUpdateWorkflow()` 実装、回帰テスト、品質ゲート、最終レビューまでを実行可能な粒度で定義している             |
| AC-5 | Phase 11 が NON_VISUAL task としてスクリーンショット不要の代替証跡を定義している                                              |
| AC-6 | Phase 12 が 6成果物、system spec sync 要否判定、`artifacts.json` parity、skill feedback を明記している                        |
| AC-7 | workflow 全体が矛盾なし・漏れなし・整合性あり・依存関係整合の4条件を満たす                                                    |

## 4条件評価

| 条件         | 判定   | 根拠                                                                                                                        |
| ------------ | ------ | --------------------------------------------------------------------------------------------------------------------------- |
| 矛盾なし     | 要修正 | `issue_number: CLOSED` と `status: pending` は両立するが、`implementation_mode` は skill 側基準衝突を注記しないと誤読される |
| 漏れなし     | 要修正 | Phase 4〜13、`artifacts.json`、`spec-extraction-map.md`、Phase 12 6成果物が欠落していた                                     |
| 整合性あり   | 要修正 | Phase 1〜3 の章立てと成果物命名がテンプレートとずれていた                                                                   |
| 依存関係整合 | 要修正 | code / tests / aiworkflow spec / close-out outputs の接続が弱かった                                                         |

## 30種の思考法を通した一次結論

- 論理分析系: 実装未完了より、workflow 未閉鎖の方が再作業コストを増幅していた
- 構造分解系: 欠損は「テンプレ不適合」「成果物欠損」「正本同期導線不足」の3群に収束した
- メタ・抽象系: 調査メモと実行仕様の層を分ける必要があった
- 発想・拡張系: 本文を短くし、詳細を outputs に委譲する方がエレガント
- システム系: `SkillCreatorService`、テスト、system spec、Phase 12 の close-out は一つの系として設計すべき
- 戦略・価値系: 全面書き直しではなく「核を残した再構成」が最小コスト
- 問題解決系: 根本原因は stub 実装と task spec contract のズレであり、両方を同時に閉じる設計が必要

## skill 基準との整合注記

- `task-specification-creator` では `implementation_mode` の表現が `new` と `new_feature` で衝突している
- 本 workflow では、既存 repo の task root 実例と frontmatter 慣習に合わせて `new` を採用する
- ただし Phase 1 でこの衝突をリスクとして記録し、Phase 12 の `skill-feedback-report.md` に改善提案を残す

## ディレクトリ構成

```text
docs/30-workflows/TASK-SC-CREATOR-UPDATE-IMPL-001/
├── index.md
├── artifacts.json
├── phase-1-requirements.md
├── phase-2-design.md
├── phase-3-design-review.md
├── phase-4-test-creation.md
├── phase-5-implementation.md
├── phase-6-test-expansion.md
├── phase-7-coverage.md
├── phase-8-refactoring.md
├── phase-9-quality.md
├── phase-10-final-review.md
├── phase-11-manual-test.md
├── phase-12-documentation.md
├── phase-13-pr-creation.md
└── outputs/
    └── artifacts.json
```

## Phase 構成

| Phase | 名称             | 並列性 | 主な成果物                                                   | 状態    |
| ----- | ---------------- | ------ | ------------------------------------------------------------ | ------- |
| 1     | 要件定義         | seq    | 要件定義、spec-extraction-map、現状棚卸し                    | pending |
| 2     | 設計             | seq    | architecture-design、validation-matrix、sync-decision        | pending |
| 3     | 設計レビュー     | seq    | review-result、gate-decision                                 | pending |
| 4     | テスト作成       | par    | test-matrix、red-test-plan                                   | pending |
| 5     | 実装             | seq    | implementation-plan、change-record                           | pending |
| 6     | テスト拡充       | par    | regression-expansion-plan                                    | pending |
| 7     | カバレッジ確認   | par    | coverage-report                                              | pending |
| 8     | リファクタリング | seq    | refactoring-log                                              | pending |
| 9     | 品質保証         | par    | quality-report                                               | pending |
| 10    | 最終レビュー     | seq    | final-review-result                                          | pending |
| 11    | 手動テスト       | seq    | manual-test-checklist、manual-test-result、discovered-issues | pending |
| 12    | ドキュメント更新 | seq    | implementation-guide 他 5成果物                              | pending |
| 13    | PR 作成          | seq    | pr-info、blocked reason                                      | blocked |

## 実行原則

1. Phase 1-3 は直列で前提を固定する
2. Phase 4 / 6 / 7 / 9 は、前段の判断が確定した後に並列実行可能な部分だけ分割する
3. Phase 11 は NON_VISUAL としてスクリーンショット不要を明示する
4. Phase 12 は workflow-local 記録と aiworkflow system spec sync を混同しない
5. Phase 13 はユーザー指示があるまで `blocked` のまま維持する
