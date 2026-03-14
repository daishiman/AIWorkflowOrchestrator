# Chat Edit context size と token 上限整合 - タスク指示書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | TASK-IMP-CHAT-EDIT-CONTEXT-SIZE-ALIGNMENT-001        |
| 分類       | 改善（設計整合）                                     |
| 優先度     | 中                                                   |
| ステータス | 未実施                                               |
| 発見元     | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 Phase 12 |
| 発見日     | 2026-03-14                                           |

## 1. なぜこのタスクが必要か（Why）

`MAX_CONTEXT_SIZE=100KB` と provider 側 token 上限の乖離により、実行時に context 切り捨てや品質劣化が発生しうる。運用値の根拠を揃えないと再発する。

## 2. 何を達成するか（What）

context 上限を provider/token 制約と整合させ、`CONTEXT_TOO_LARGE` 判定を実効的な値へ調整する。

## 3. どのように実行するか（How）

- `ContextBuilder` の上限設計を provider 非依存の安全側値へ再定義する。
- 可能なら resolver から provider 情報を受けて上限を可変化する。
- ドキュメントとエラーメッセージを新しい閾値へ同期する。

## 4. 実行手順

1. 現行の context サイズ計算と provider token 制限の差分を洗い出す。
2. 閾値設計を fixed または provider-aware で決定する。
3. `ContextBuilder` とエラー生成ロジックを更新する。
4. 仕様書の閾値記述とエラーメッセージを同期する。

## 5. 完了条件チェックリスト

- [ ] context 上限値の根拠（token換算）が文書化される。
- [ ] 上限を超える入力で `CONTEXT_TOO_LARGE` が安定して返る。
- [ ] 既存成功系の送信が回帰しない。

## 6. 検証方法

- ContextBuilder の境界値テスト（しきい値-1 / しきい値 / しきい値+1）。
- send-with-context 統合テストで error code 確認。
- 代表的な長文入力での実行確認。

## 7. リスクと対策

- リスク: 上限を下げすぎると正当なユースケースが阻害される。
- 対策: safety margin を段階調整し、運用ログを見ながら閾値を再評価する。

## 8. 参照情報

- `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`

## 9. 備考

完了時は `task-workflow-backlog.md` と `llm-workspace-chat-edit.md` の閾値記述を同時更新する。
