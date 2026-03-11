# 要件定義

## P50判定

- 判定: 検証・補完モード
- 根拠: SkillCenterView / AgentView / SkillManagementPanel / App.tsx に既存導線があり、Task01 ではそれらを一本の一次導線として再定義する必要があった。
- ブランチ状況: workflow 配下は未追跡、aiworkflow-requirements の index には先行差分あり。既存変更を巻き戻さず追記前提で進める。

## ユーザージョブ

| ジョブ   | 開始地点                     | 主導面         | 完了地点                     | 品質ゲート                       |
| -------- | ---------------------------- | -------------- | ---------------------------- | -------------------------------- |
| 作る     | Skill Center                 | Skill Creator  | Workspace / Agent へ引き渡し | 作成後に利用導線へ接続できること |
| 使う     | Workspace                    | Agent          | 実行結果確認                 | 実行後に改善判断へ戻れること     |
| 改善する | Agent / SkillManagementPanel | Skill Analysis | 再評価へ戻す                 | 改善導線が独立迷路化しないこと   |

## 受入要件

- AC-1: 一次導線は Skill Center -> Workspace -> Agent -> Improve を基本線とする。
- AC-2: Skill Center / Workspace / Agent / Chat / Skill Creator の責務が重複しない。
- AC-3: /advanced/\* は補助導線であり、主要導線の代替にしない。
- AC-4: Task02-05 が参照できる入力 / 出力 / 禁止事項がある。
- AC-5: Atent Team / SubAgent は UI 概念として露出しない。
- AC-6: settings bypass / reset exclusion / rollback / /advanced 実体を例外条件として定義する。
