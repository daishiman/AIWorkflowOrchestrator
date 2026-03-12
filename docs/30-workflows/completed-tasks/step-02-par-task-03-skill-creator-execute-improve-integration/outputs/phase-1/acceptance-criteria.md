# Phase 1 受け入れ基準整理

## 正式 AC

| AC   | 判定内容                                               | Phase 1 時点の具体化                                                                               |
| ---- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| AC-1 | `skillCreatorAPI` の位置づけが決定している             | 表 API ではなく、mode 判定・検証・高度処理の内部エンジンとして扱う                                 |
| AC-2 | wizard と会話導線の責務統合方針がある                  | `SkillManagementPanel` の session card を主導線、wizard を詳細設定の補助 UI に縮退する             |
| AC-3 | `作成 -> 実行 -> 改善` の単一フローが定義されている    | create 完了で generated skill を選択し、同一面から execute / analyze / auto improve へ進める       |
| AC-4 | 内部オーケストレーションとユーザー導線が分離されている | Planner / Executor / Improver / Codex は内部ログ・契約へ閉じ、UI では generic な進行説明だけを出す |
| AC-5 | Task02 の共通会話基盤を再利用する前提で設計されている  | 単一セッション・mode 差分内部吸収・handoff 維持を守る                                              |

## Phase別検証ポイント

| Phase | 主要確認                                                              |
| ----- | --------------------------------------------------------------------- |
| 2     | unified session state、mode 判定、handoff、権限境界が図式化されている |
| 4     | create/execute/improve 成功系と失敗系のテストが定義されている         |
| 5     | UI に単一セッション導線が追加され、mode 判定と検証が内部で働く        |
| 6     | create failure / execute failure / improve fallback が破綻しない      |
| 11    | ユーザー操作で 4 シナリオを完走できる                                 |
| 12    | system spec が UI / IPC / security / workflow に同期される            |

## Reject 条件

- `skillCreatorAPI` を新しい主 UI API として直接露出し、wizard / legacy facade / 実行系の責務がさらに二重化する
- `SubAgent` / `Codex` をユーザーが選ぶ必須 UI にしてしまう
- create 後の execute / improve が別画面知識前提のまま残る
