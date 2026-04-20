# TASK-SW-CANCEL-004: skill-creator-cancel-renderer-hook

## メタ情報

| 項目                | 内容                                                                        |
| ------------------- | --------------------------------------------------------------------------- |
| タスクID            | TASK-SW-CANCEL-004                                                          |
| タスク名            | skill-creator-cancel-renderer-hook                                          |
| タスク種別          | NON_VISUAL / bugfix / verify_existing                                       |
| 分類                | 既存実装検証 + 仕様同期                                                     |
| 優先度              | High                                                                        |
| 規模                | 小規模                                                                      |
| ステータス          | completed                                                                   |
| implementation_mode | verify_existing                                                             |
| 作成日              | 2026-04-20                                                                  |
| 依存タスク          | TASK-SW-CANCEL-003（完了済み）                                              |
| 関連タスク          | TASK-SW-CANCEL-001, TASK-SW-CANCEL-002, TASK-SW-CANCEL-003                  |
| 実装対象            | `apps/desktop/src/renderer/hooks/useCancelGeneration.ts` と関連テスト・証跡 |

## ユーザー要求の要約

本ブランチの変更対象である `docs/30-workflows/p04-seq-CANCEL-004/` を、`task-specification-creator` と `aiworkflow-requirements` の両skillに照らして再監査し、変更分が漏れなく反映されたエレガントな task spec へ改善する。既存実装がすでに存在する場合は、新規実装前提ではなく `verify_existing` として仕様を再構成する。

## 概要

`useCancelGeneration.ts` の Renderer 側キャンセル処理は、現時点の実コードではすでに `window.skillCreatorAPI?.cancelGeneration?.()` を呼び出しており、ローカル abort・UI stage 更新・IPC 通知・エラー握りつぶしまで実装済みである。したがって本 workflow の主責務は「未実装の新規開発」ではなく、既存実装と既存テストを起点に task spec を現物へ同期し、NON_VISUAL / verify_existing / Phase 11-12 証跡方針を正規化することにある。

## 真の論点

主問題は「旧テンプレート由来の仕様書が未実装前提のまま残り、現物コード・既存テスト・Phase 11/12 の運用ルールとズレていること」である。コードの複雑性そのものより、仕様書の前提ズレが false work と false green を誘発する点を解消する必要がある。

## why now

- 本ブランチ差分は workflow ディレクトリの移設そのものであり、仕様書の current fact を今ここで揃えないと path drift が固定化する
- 実コードはすでに完成しているため、新規実装前提の Phase 4-6 を残すと TDD/実装の責務境界が崩れる
- `task-specification-creator` の current rules では `implementation_mode`、NON_VISUAL 証跡、`outputs/artifacts.json` parity、Phase 12 6成果物が重要であり、現行仕様書はその要件を満たしていない

## why this way

- **verify_existing へ切替**: 実装済みコードを前提に、Phase 4 は targeted regression、Phase 5 は diff check を主作業にする
- **NON_VISUAL 固定**: UI の見た目変更ではなく既存フックの通信保証なので、Phase 11 は自動テスト証跡中心で閉じる
- **Phase 12 を強化**: workflow-local と global sync を分離し、6成果物と `artifacts.json` parity を明示する
- **最小変更で整合回復**: コードを再発明せず、仕様書のズレだけを是正して複雑性を増やさない

## スコープ

### 含むもの

- `p04-seq-CANCEL-004` workflow 一式の metadata / phase plan / artifacts inventory の是正
- `verify_existing` 前提への Phase 1-13 再構成
- NON_VISUAL task としての Phase 11 証跡方針の明確化
- Phase 12 の 6成果物、`outputs/artifacts.json` parity、same-wave sync 方針の明確化

### 含まないもの

- commit、push、PR 作成
- CANCEL-001〜003 の再設計
- 実装済みコードへの不要な再実装
- 実装破棄を伴う再構成

## 受け入れ基準

| ID   | 内容                                                                                                                                 |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------ |
| AC-1 | workflow 本文が `implementation_mode: verify_existing` と NON_VISUAL 判定に整合している                                              |
| AC-2 | Phase 4-5 が新規実装前提ではなく、既存コード・既存テストの検証導線として再定義されている                                             |
| AC-3 | Phase 11 が `manual-test-result.md` / `manual-test-checklist.md` / `discovered-issues.md` を主証跡とする NON_VISUAL 仕様になっている |
| AC-4 | Phase 12 が 6成果物、Step 1-A〜1-C / Step 2 条件分岐、`artifacts.json` / `outputs/artifacts.json` parity を明記している              |
| AC-5 | workflow 全体が矛盾なし・漏れなし・整合性あり・依存関係整合の4条件を満たす                                                           |

## 4条件評価

| 条件         | 判定   | 根拠                                                                                            |
| ------------ | ------ | ----------------------------------------------------------------------------------------------- |
| 矛盾なし     | 要修正 | 未実装前提の記述が実コードと矛盾していたため、本仕様で `verify_existing` に統一する             |
| 漏れなし     | 要修正 | `implementation_mode`、NON_VISUAL、Phase 11 補助成果物、`outputs/artifacts.json` が欠落していた |
| 整合性あり   | 要修正 | task status / artifacts / phase wording を current rules に揃える必要があった                   |
| 依存関係整合 | OK     | 前提は CANCEL-001〜003 完了済みで一貫している。workflow ではその確認方法を明示する              |

## 現在のコード事実（Phase 1 開始時点）

- `apps/desktop/src/renderer/hooks/useCancelGeneration.ts` は `cancelGeneration(): Promise<void>` を実装済み
- `cancelGeneration()` は local abort → `setStage("cancelled")` → `skillCreatorAPI.cancelGeneration()` → catch swallow の順で動作する
- 関連 IPC 層は shared / preload / main / renderer の4層で接続済み
- 既存テストは `apps/desktop/src/renderer/hooks/__tests__/useCancelGeneration.test.ts` に存在する

## 30種の思考法を通した一次結論

- 論理分析系: 「未実装前提」という大前提が false なので、以降の Phase 設計も連鎖的にズレていた
- 構造分解系: 主に壊れていたのは Phase 1/4/5/11/12 の責務境界であり、全Phase全面刷新までは不要
- メタ・抽象系: 真の改善対象はコードではなく workflow contract
- 発想・拡張系: 新規テストファイル追加より既存テスト再利用の方がエレガント
- システム系: workflow-local docs、実コード、global skill rules の3者同期が本件の主要依存関係
- 戦略・価値系: 最小変更で false work を除去する方が価値が高い
- 問題解決系: 根本原因は path 移設ではなく old template の持ち越し

## ディレクトリ構成

```text
docs/30-workflows/p04-seq-CANCEL-004/
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

| Phase | 名称             | 状態      | 並列性 | 主な成果物                                   |
| ----- | ---------------- | --------- | ------ | -------------------------------------------- |
| 1     | 要件定義         | completed | seq    | 現状棚卸し、AC 固定、P50 結果                |
| 2     | 設計             | completed | seq    | verify_existing 設計、証跡戦略               |
| 3     | 設計レビュー     | completed | seq    | PASS / MINOR / MAJOR 判定                    |
| 4     | テスト作成       | completed | par    | 既存テストとの照合、必要時のみ targeted 追加 |
| 5     | 実装確認         | completed | seq    | diff check、必要最小限の補正                 |
| 6     | テスト拡充       | completed | par    | 既存ケース不足時のみ追加                     |
| 7     | カバレッジ確認   | completed | par    | 変更点回帰網羅の確認                         |
| 8     | リファクタリング | completed | seq    | 仕様/コメント/命名の整流化                   |
| 9     | 品質保証         | completed | par    | typecheck / lint / focused test              |
| 10    | 最終レビュー     | completed | seq    | AC / 4条件 / 4層接続確認                     |
| 11    | 手動テスト       | completed | seq    | NON_VISUAL 証跡3点セット                     |
| 12    | ドキュメント更新 | completed | seq    | 6成果物 + parity + same-wave sync            |
| 13    | PR作成           | blocked   | seq    | user 承認後のみ                              |

## 実行原則

1. Phase 1-3 は直列で前提を固定する
2. Phase 4 と Phase 6-7 は、前段の結論が固まった後に必要範囲だけ並列化する
3. Phase 5 は新規実装ではなく diff check を優先し、ズレが見つかった場合のみ最小変更を許可する
4. Phase 11 は NON_VISUAL としてスクリーンショットを要求しない
5. Phase 12 は workflow-local と global sync を混同しない
6. Phase 13 は user 指示があるまで `blocked` のまま維持する
