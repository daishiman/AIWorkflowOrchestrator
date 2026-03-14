# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 1                       |
| Phase名    | 要件定義                |
| タスクID   | TASK-SKILL-LIFECYCLE-04 |
| ステータス | completed               |
| 前提Phase  | なし                    |
| 後続Phase  | Phase 2                 |

## 目的

採点を単なる表示機能ではなく、改善・保存・利用の判断ゲートとして機能させる要件を固定する。

## 実行タスク

- タスク1: 評価対象を `prompt品質` `skill品質` `実行結果品質` の3軸で定義する。
- タスク2: `作成時` `改善時` `利用前` `利用後再評価` の採点ポイントを定義する。
- タスク3: スコアによる導線分岐条件を定義する。
- タスク4: Task03 と Task05 に渡す評価契約を定義する。
- タスク5: `aiworkflow-requirements` から必要仕様を抽出し、抽出手順を固定する。

## 参照資料

| 参照資料        | パス                                                                   | 目的                                  |
| --------------- | ---------------------------------------------------------------------- | ------------------------------------- |
| 導線契約        | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`        | create/use/improve の導線と責務を確認 |
| 分析UI          | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`     | 分析・改善操作の現行挙動を確認        |
| スコア表示UI    | `apps/desktop/src/renderer/components/skill/ScoreDisplay.tsx`          | スコア表示ルールを確認                |
| 分析Hook        | `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts` | 状態遷移と改善操作を確認              |
| IPC実装         | `apps/desktop/src/main/ipc/skillHandlers.ts`                           | 評価IPCとバリデーションを確認         |
| 評価サービス    | `apps/desktop/src/main/services/skill/PromptOptimizer.ts`              | 評価ロジックを確認                    |
| 仕様抽出マップ  | `./aiworkflow-requirements-extraction.md`                              | aiworkflow 正本の抽出手順を固定       |
| Resource Map    | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`       | 参照起点を固定                        |
| Quick Reference | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`    | 検索分割ルールを固定                  |

## 実行手順

1. `resource-map.md` から「スキルライフサイクル一次導線設計 / 画面責務再編」を読む。
2. `quick-reference.md` の query 分割ルールで仕様検索を実行する。
3. UI契約、IPC契約、セキュリティ契約、状態管理契約を抽出する。
4. 評価軸、採点ポイント、分岐条件、Task03/05 連携要件を要件表へ落とす。
5. 抽出結果を `aiworkflow-requirements-extraction.md` と本フェーズへ反映する。

## 統合テスト連携

- Phase 4 で作成するテストの前提として、要件IDとテストIDの対応表を作成する。
- Phase 7 の coverage 監査で、要件IDが 1 件も欠けないことを確認する。

## 多角的チェック観点（AIが判断）

- スコアが行動分岐へ直接つながる要件になっているか。
- Task03（作成/改善）と Task05（利用/再評価）の両方で再利用できるか。
- UI、IPC、状態管理の責務が混線していないか。

## サブタスク管理

| SubAgent   | 責務                       | 実行方式 | 出力     |
| ---------- | -------------------------- | -------- | -------- |
| SubAgent-A | 評価軸と導線要件の定義     | 並列     | 要件草案 |
| SubAgent-B | IPC/セキュリティ契約の抽出 | 並列     | 契約草案 |
| SubAgent-C | 実装アンカー照合と差分整理 | 並列     | 照合メモ |

## 成果物

| 成果物         | パス                                      | 内容                           |
| -------------- | ----------------------------------------- | ------------------------------ |
| 要件定義       | `./phase-1-requirements.md`               | 評価軸、採点ポイント、分岐条件 |
| 仕様抽出マップ | `./aiworkflow-requirements-extraction.md` | 必須仕様セットと抽出手順       |

## 完了条件

- [x] 3軸評価と4採点ポイントが定義されている
- [x] スコア分岐条件が定義されている
- [x] Task03/05 連携契約が定義されている
- [x] aiworkflow 抽出手順が再現可能な形で記録されている

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクを100%完了し、完了を明記
- [x] 成果物が全て生成されていることを確認

## 次Phase

Phase 2（設計）でスコアモデル、ゲート判定、保存契約を設計する。
