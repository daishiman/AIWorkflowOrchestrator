# Phase 12: unassigned task detection

## メタ情報

| 項目       | 値                                    |
| ---------- | ------------------------------------- |
| Phase      | 12                                    |
| タスクID   | TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID |
| タスク種別 | NON_VISUAL code task                  |
| Task       | 12-4                                  |

## 総数

| 区分           | 件数 |
| -------------- | ---- |
| 将来タスク候補 | 2    |
| 即時起票推奨   | 0    |
| 計             | 2    |

## 検出された将来タスク候補

### 候補 1: `planId` を将来 required 化する migration task

| 項目                   | 内容                                                                                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 仮タスク ID            | TASK-SC-08-FUP-03-PAYLOAD-PLANID-REQUIRED（仮）                                                                                                                           |
| 概要                   | `SkillCreatorProgress.planId` を optional から required に昇格させ、全送信側で planId 必須化する migration                                                                |
| 動機                   | 本 task（FUP-02）で optional 追加の後方互換対応を行った後、一定期間の観測と呼び出し元網羅整備を経て required 化することでフィルタロジックの単純化と型安全の強化が得られる |
| 前提条件               | 本 task 完了 + 全送信経路（Main ipc / Runtime Facade / 他 Service）の planId 貫通が定着していること（NV-02 / NV-03 で確認）                                               |
| スコープ含む           | 型 `planId: string` 化、未付与箇所の修正、テスト更新、後方互換除去、移行リリースノート                                                                                    |
| スコープ含まない       | progress チャンネル多重化設計（別チャンネル案）                                                                                                                           |
| 起票タイミング         | 本 task の実コード導入後、1〜2 リリース程度の観測期間を挟んでから unassigned-task として formalize                                                                        |
| 配置先（formalize 時） | `docs/30-workflows/unassigned-task/TASK-SC-08-FUP-03-PAYLOAD-PLANID-REQUIRED.md`                                                                                          |

### 候補 2: `useStreamingProgress` 以外の progress 受信系への filter 水平展開

| 項目                   | 内容                                                                                                                                                                                                        |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 仮タスク ID            | TASK-SC-08-FUP-04-PROGRESS-FILTER-HORIZONTAL（仮）                                                                                                                                                          |
| 概要                   | skill-creator 系以外（例: execution progress / audit log stream 等）で `skill-creator:progress` 同等の単一ブロードキャスト IPC を利用している受信系があれば、本 task の filter-by-id パターンを水平展開する |
| 前提条件               | 横断調査で対象受信系が存在することを確認できた場合のみ起票。本 task 作成時点では具体対象は未特定（NV-03 で類似 emit 経路を洗い出す運用と連携）                                                              |
| スコープ含む           | 対象 IPC チャンネル洗い出し / 同様の filter ヘルパー共通化の要否判定 / 受信 Hook への options.planId 追加                                                                                                   |
| スコープ含まない       | progress チャンネル自体の多重化、サービス境界再設計                                                                                                                                                         |
| 起票タイミング         | NV-03 / phase-8 refactor-decision-log.md の結果で水平展開候補が見つかった時点                                                                                                                               |
| 配置先（formalize 時） | `docs/30-workflows/unassigned-task/TASK-SC-08-FUP-04-PROGRESS-FILTER-HORIZONTAL.md`                                                                                                                         |

## 0 件項目（レポート形式維持のため明記）

| 区分                                  | 件数 | 備考                                                      |
| ------------------------------------- | ---- | --------------------------------------------------------- |
| 即時起票が必要な blocker              | 0    | Phase 11 `discovered-issues.md` で blocker 検出なし       |
| 本 task 完了前に解決が必要な問題      | 0    | Phase 10 `final-review-result.md` で blocker 0 件（予定） |
| Phase 12 `artifacts.json` parity 警告 | 0    | `phase12-task-spec-compliance-check.md` で再確認する      |

## 参照

- `phase-12-documentation.md` Task 12-4
- `outputs/phase-11/discovered-issues.md`
- `docs/30-workflows/unassigned-task/TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID.md`（既存 unassigned spec）
