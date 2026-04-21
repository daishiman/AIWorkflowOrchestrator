# Phase 1: リスク登録簿

| ID   | リスク                                                                                             | 分類               | 深刻度 | 対策                                                         |
| ---- | -------------------------------------------------------------------------------------------------- | ------------------ | ------ | ------------------------------------------------------------ |
| R-01 | `automation-30` が対象外のため camelCase が残存する                                                | silent break       | LOW    | スコープを明確化し、後続タスクへ未タスクとして登録           |
| R-02 | `collect_feedback.js` が camelCase で読み書きするため、EVALS.json 更新後に silent break が発生する | 依存不整合         | HIGH   | `collect_feedback.js` を EVALS.json と同タイミングで更新する |
| R-03 | `evals-template.json` が camelCase のままだと新規スキル作成時に旧方言が再生産される                | 再発リスク         | HIGH   | template を snake_case へ更新し、writer 契約を統一する       |
| R-04 | `.claude` と `.agents` の mirror 同期漏れが parity 差分を生む                                      | parity 違反        | MEDIUM | Phase 5 で同期後に `diff -qr` で確認する                     |
| R-05 | `feedback-record.json` スキーマが camelCase のまま残ると読者の混乱を招く                           | ドキュメント不整合 | LOW    | スキーマ内プロパティ名も snake_case へ統一する               |

## 主要リスクサマリー

- **Blocker 候補**: R-02（collect_feedback.js の不整合）、R-03（template の旧方言再生産）
- **対象外スキル**: `automation-30` / `claude-agent-sdk` は本タスクスコープ外
- **依存ゲート**: 先行タスク完了により Phase 5 着手リスクなし
