# Phase 9 リスク台帳

| ID   | リスク                                                | 影響度 | 発生頻度 | 評価 | 対応策                                                        | 状態      |
| ---- | ----------------------------------------------------- | ------ | -------- | ---- | ------------------------------------------------------------- | --------- |
| R-01 | `skillHandlers.ts` の責務集中で未到達経路が増える     | 中     | 高       | 中高 | チャネル単位テスト分割（COV-A1/A2）                           | Open      |
| R-02 | `registerSkillHandlers` 呼び出し追加箇所で第3引数欠落 | 高     | 低       | 中   | `ipc-double-registration` に同一インスタンス検証を維持        | Mitigated |
| R-03 | `AUTHENTICATION_ERROR` の境界伝搬崩れ                 | 高     | 低       | 中   | `skillHandlers.execute` + `skill-api.contract` 回帰を継続実行 | Mitigated |
| R-04 | AuthKeyServiceの再重複生成                            | 高     | 低       | 中   | composition root規約をPhase 8境界マップで固定                 | Mitigated |
| R-05 | 部分カバレッジ実行でglobal threshold failを誤判定     | 低     | 高       | 中   | 目的別に「対象カバレッジ」と「全体ゲート」を分離運用          | Open      |

## 優先対応

1. R-01（保守性低下リスク）
2. R-05（監査ノイズリスク）

## 判定

- 重大未緩和リスク: 0
- 残存リスク: 2（改善計画あり）
