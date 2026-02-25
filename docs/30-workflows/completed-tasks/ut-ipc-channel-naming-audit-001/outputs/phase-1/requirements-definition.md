# Phase 1 要件定義書

## 目的

IPCチャネル命名規則（`skill:{動詞}` / `skill:{動詞}FromSource` / `skill:{動詞}Source`）の横断監査を再現可能な手順で実施できるよう、対象・判定基準・制約を固定する。

## 監査対象と制約

- 主要定義: `apps/desktop/src/preload/channels.ts`
- 仕様との差分: `apps/desktop/src/main/ipc/channels.ts` は現ワークツリーに存在しないため、Single Source of Truth である preload 側を正本として監査する。
- 参照層: `apps/desktop/src/main`, `apps/desktop/src/preload`, `apps/desktop/src/renderer`
- 参照資料差分: `docs/30-workflows/unassigned-task/task-ipc-channel-naming-audit-001.md` は移動済みのため、`docs/30-workflows/completed-tasks/task-ipc-channel-naming-audit-001.md` を代替参照する。

## 実測サマリ（2026-02-25）

- 総チャネル数: 203
- `skill:` チャネル数: 26
- `skill`命名規則違反候補: 6
- 値重複: 0

## 判定基準

| 観点         | 判定条件                                                                  | 合否ルール                   |
| ------------ | ------------------------------------------------------------------------- | ---------------------------- |
| 命名規則準拠 | `skill:` が `skill:[a-z][a-zA-Z]*` / `...FromSource` / `...Source` に一致 | 不一致は違反                 |
| 重複なし     | `IPC_CHANNELS` の値重複がない                                             | 重複0件で合格                |
| 3層整合      | Main/Preload/Renderer で参照経路を追跡できる                              | 参照根拠（path+command）必須 |

## 非機能要件

- 監査はコマンド再実行で同じ数値を再取得できること。
- 全指摘に `path` と `command` を付与すること。
- フェーズ成果物を `outputs/phase-N/` へ出力すること。

## Phase 1 実行記録

### 実行タスク

- 要件整理: 完了
- 監査対象確定: 完了（preload正本へ補正）
- 判定基準定義: 完了
- SubAgent分担定義: 完了
- 受入基準接続: 完了

### 発見事項

- 良かった点: `channels.ts` が単一ファイルに集約されており棚卸しが容易。
- 問題点: 仕様書の参照パス（main側）が実態と不一致。
- 改善提案: 後続Phaseで「仕様パス差分」を常に注記する。

### 次Phaseへの引き継ぎ事項

- Phase 2 で監査アルゴリズムに「preload正本」前提を明記する。
