# Phase 2 監査設計書

## 監査パイプライン

1. 抽出: `IPC_CHANNELS` の key/value を抽出。
2. 分類: domain（`:`前）で分類。
3. 照合: `skill:` のみ命名規則判定。
4. 影響調査: 違反チャネルの参照箇所をMain/Preload/Rendererで集計。
5. 計画化: 優先度（高/中/低）付きリネーム案へ変換。

## 監査レコードスキーマ

| 項目     | 型       | 説明                                  |
| -------- | -------- | ------------------------------------- |
| key      | string   | 例: `SKILL_GET_DETAIL`                |
| value    | string   | 例: `skill:get-detail`                |
| domain   | string   | 例: `skill`                           |
| rule     | string   | 適用ルールID                          |
| result   | enum     | `pass` / `violation` / `out-of-scope` |
| evidence | object   | `path`, `command`, `line`             |
| riskTags | string[] | `P5`, `P44`, `P45` など               |

## 判定アルゴリズム

- 対象: `value` が `skill:` で始まるチャネル。
- 合格パターン:
  - `^skill:[a-z][a-zA-Z]*$`
  - `^skill:[a-z][a-zA-Z]*FromSource$`
  - `^skill:[a-z][a-zA-Z]*Source$`
- 不合格:
  - `skill:get-detail` のような kebab 混在
  - `skill:permission:request` のような多段 `:`

## 例外設計

- 非`skill:`チャネルは本タスクの命名判定対象外（参考記録のみ）。
- 仕様との差分（`main/ipc/channels.ts` 不在）は `preload/channels.ts` を正本化して吸収。

## 優先度ルール

- 高: 総参照数30以上、またはP5/P44/P45の再発導線が明確。
- 中: 総参照数15以上30未満。
- 低: 総参照数15未満。

## Phase 2 実行記録

### 実行タスク

- 監査パイプライン設計: 完了
- データ構造設計: 完了
- SubAgent並列設計: 完了
- 仕様更新設計: 完了
- エラー設計: 完了

### 次Phaseへの引き継ぎ事項

- Phase 3で判定式の妥当性とレビュー再現性を確認する。
