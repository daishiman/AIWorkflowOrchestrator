# TASK-SW-TODO-001: conversation-round-step-todo-cleanup

## メタ情報

| 項目                | 内容                                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------------------- |
| タスクID            | TASK-SW-TODO-001                                                                                          |
| タスク名            | conversation-round-step-todo-cleanup                                                                      |
| タスク種別          | NON_VISUAL / cleanup / verify_existing                                                                    |
| 分類                | 既存実装検証 + 仕様同期                                                                                   |
| 優先度              | Low                                                                                                       |
| 規模                | 小規模                                                                                                    |
| ステータス          | completed                                                                                                 |
| implementation_mode | verify_existing                                                                                           |
| 作成日              | 2026-04-20                                                                                                |
| 関連タスク          | UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001, UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001                            |
| 実装対象            | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` 周辺の完了済み cleanup 証跡 |

## ユーザー要求の要約

本ブランチの変更対象である `docs/30-workflows/p05-opt-TODO-001/` を、`task-specification-creator` と `aiworkflow-requirements` の両 skill に照らして再監査し、変更分が漏れなく反映されたエレガントな task spec へ改善する。既存コードがすでに完了済みである場合は、新規実装前提ではなく `verify_existing` として仕様を再構成する。

## 概要

`ConversationRoundStep.tsx` にあった `TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001)` コメント、`MAIN_TOOL_BADGE_ENABLED`、`shouldShowMainToolBadge`、関連 JSX は、実コード上はすでに PR #2199（commit `2fcca99de`）で削除済みである。したがって本 workflow の主責務は新規 cleanup 実装ではなく、現物コード・履歴・Phase 11/12 証跡方針を current fact に同期し、古い未実装前提の narrative を除去することにある。

## 真の論点

主問題は「workflow 文書群が未実施の新規タスクとして書かれたまま残り、実コード・git 履歴・NON_VISUAL 証跡ルールと矛盾していること」である。コード変更の再実装は不要であり、必要なのは仕様書 contract の再構成である。

## why now

- 本ブランチ差分は旧 `skill-create-flow-gaps/.../p05-opt-TODO-001` から `docs/30-workflows/p05-opt-TODO-001/` への移設であり、path drift を今この wave で止める必要がある
- 実コードはすでに完了しているため、新規実装前提の Phase 4-6 を残すと false work が発生する
- `task-specification-creator` の current rules では `implementation_mode`、NON_VISUAL 証跡、`outputs/artifacts.json` parity、Phase 12 の 6成果物が重要であり、現行仕様書はそこに未整合があった

## why this way

- `verify_existing` に切り替え、Phase 4 は targeted verification、Phase 5 は diff check を主作業にする
- NON_VISUAL task として Phase 11 の primary evidence を screenshot ではなく command/result ベースに固定する
- Phase 12 は workflow-local close-out と global spec sync 判定を分離し、6成果物と parity を根拠で残す
- コードを再発明せず、仕様書のズレだけを是正して複雑性を最小化する

## スコープ

### 含むもの

- `p05-opt-TODO-001` workflow 一式の metadata / phase narrative / artifacts inventory 是正
- `verify_existing` 前提への Phase 1-13 再構成
- NON_VISUAL task としての Phase 11 証跡方針の明確化
- Phase 12 の canonical 6成果物と `artifacts.json` parity の明確化

### 含まないもの

- commit、push、PR 作成
- `ConversationRoundStep.tsx` の再変更
- `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` 台帳そのものの全体是正
- 実装破棄を伴う再開発

## 受け入れ基準

| ID   | 内容                                                                                                                               |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------- |
| AC-1 | workflow 本文が `implementation_mode: verify_existing` と NON_VISUAL 判定に整合している                                            |
| AC-2 | Phase 4-5 が新規実装前提ではなく、既存コード・既存履歴の検証導線として再定義されている                                             |
| AC-3 | Phase 11 が `manual-test-checklist.md` / `manual-test-result.md` / `TASK-SW-TODO-001-manual-test-report.md` を証跡として扱っている |
| AC-4 | Phase 12 が 6成果物、Step 1-A〜1-C / Step 2 判定、`artifacts.json` / `outputs/artifacts.json` parity を明記している                |
| AC-5 | workflow 全体が矛盾なし・漏れなし・整合性あり・依存関係整合の 4 条件を満たす                                                       |

## 4条件評価

| 条件         | 判定   | 根拠                                                                                         |
| ------------ | ------ | -------------------------------------------------------------------------------------------- |
| 矛盾なし     | 要修正 | 旧文書は「TODO とバッジが存在する」前提で書かれており、実コードと矛盾していた                |
| 漏れなし     | 要修正 | `implementation_mode`、`outputs/artifacts.json`、NON_VISUAL Phase 11 evidence が欠落していた |
| 整合性あり   | 要修正 | task status / phase status / path / artifact 名の揺れがあった                                |
| 依存関係整合 | OK     | cleanup の前提実装は PR #2199 で完了済みで、workflow ではその確認方法を明示すれば閉じる      |

## 現在のコード事実

- `ConversationRoundStep.tsx` に `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001`、`shouldShowMainToolBadge`、`MAIN_TOOL_BADGE_ENABLED` は存在しない
- `SkillCreateWizard.tsx` の `resolveExternalIntegration` は `toolNames: string[]` を受け取る current contract へ移行済み
- git 履歴上、関連変更は PR #2199（commit `2fcca99de`）で導入済み
- 本 workflow の主対象は「未実装の cleanup」ではなく「完了済み cleanup の task spec 正規化」である

## 30種の思考法を通した一次結論

- 論理分析系: false premise は「未実装」であり、ここを直すと残りの矛盾が一気に解消する
- 構造分解系: 壊れていた主領域は Phase 1/4/5/11/12 と artifacts metadata である
- メタ・抽象系: 真の改善対象はコードではなく workflow contract
- 発想・拡張系: 新規テスト追加より existing evidence 再編の方がエレガント
- システム系: workflow docs、git history、current code の 3 点同期が本件の主依存関係
- 戦略・価値系: false work を止める方が value / cost 比が高い
- 問題解決系: 根本原因は path 移設ではなく旧テンプレートの持ち越し

## ディレクトリ構成

```text
docs/30-workflows/p05-opt-TODO-001/
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
    └── artifacts.json
```

## Phase 構成

| Phase | 名称             | 状態      | 並列性 | 主な成果物                     |
| ----- | ---------------- | --------- | ------ | ------------------------------ |
| 1     | 要件定義         | completed | seq    | P50 結果、AC 固定              |
| 2     | 設計             | completed | seq    | verify_existing 設計、証跡戦略 |
| 3     | 設計レビュー     | completed | seq    | PASS / MINOR / MAJOR 判定      |
| 4     | テスト作成       | completed | par    | targeted verification matrix   |
| 5     | 実装確認         | completed | seq    | diff check、current fact 確認  |
| 6     | テスト拡充       | completed | par    | 不足なし判定と補足回帰確認     |
| 7     | カバレッジ確認   | completed | par    | cleanup 対象の到達確認         |
| 8     | リファクタリング | completed | seq    | 仕様と artifact 命名の整流化   |
| 9     | 品質保証         | completed | par    | rg / git / docs parity 確認    |
| 10    | 最終レビュー     | completed | seq    | AC / 4条件 / evidence 閉鎖確認 |
| 11    | 手動テスト       | completed | seq    | NON_VISUAL primary evidence    |
| 12    | ドキュメント更新 | completed | seq    | canonical 6成果物 + parity     |
| 13    | PR作成           | blocked   | seq    | user 承認後のみ                |

## 実行原則

1. Phase 1-3 は直列で前提を固定する
2. Phase 4 と 6-7 は、前段の結論が固まった後に必要範囲だけ並列化する
3. Phase 5 は新規実装ではなく diff check を優先し、ズレが見つかった場合のみ最小変更を許可する
4. Phase 11 は NON_VISUAL として screenshot を要求しない
5. Phase 12 は workflow-local close-out と global spec sync を混同しない
6. Phase 13 は user 指示があるまで `blocked` のまま維持する
