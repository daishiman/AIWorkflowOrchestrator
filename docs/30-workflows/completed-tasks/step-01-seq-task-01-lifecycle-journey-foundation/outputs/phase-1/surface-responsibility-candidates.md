# 画面責務候補一覧

| 画面           | 主責務                     | 禁止責務               | handoff                           |
| -------------- | -------------------------- | ---------------------- | --------------------------------- |
| Skill Center   | 入口説明、探索、作成前判断 | 実行本体、改善本体     | Skill Creator / Workspace / Agent |
| Workspace      | 文脈準備、ファイル接続     | 探索一覧、最終実行判断 | Agent                             |
| Agent          | 実行、結果確認、改善判断   | 探索一覧、作成本体     | Skill Analysis                    |
| Chat           | 会話、履歴導線、補助遷移   | 一次導線の主入口       | Skill Center / 履歴               |
| Skill Creator  | 新規作成                   | 探索 / 実行 / 改善一覧 | Workspace / Agent                 |
| Skill Analysis | 改善案提示                 | 探索一覧、主入口化     | Workspace / Agent                 |
| Settings       | 認証・設定の復旧           | 一次導線の説明責務     | 主導線へ戻す                      |
