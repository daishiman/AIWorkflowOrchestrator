# Phase 12: Skill Feedback Report

## 今回のスキル運用へのフィードバック

### 良かった点

- 要件 -> 実装 -> screenshot -> validator -> system spec の順で証跡を閉じられた。
- Task03 と Task05 の handoff を `skillEvaluationSlice` に寄せ、UI と state の関心ごとを分離できた。
- Phase11 harness を専用 script 化したことで、6ケースを再撮影しても証跡の粒度が揃った。

### 改善点

| 項目                  | 内容                                                                                                                                           |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Step 2 判断           | 既存 IPC 再利用でも public preload API / shared export の追加があれば `interfaces-agent-sdk-skill.md` まで更新対象に含める必要がある           |
| Phase 11 テンプレート | `manual-test-result.md` に `証跡` 列が無いと screenshot validator が成立しない。テンプレート段階で literal を固定したい                        |
| Phase 12 テンプレート | Part 1/2 があるだけでは不十分で、why-first と Part 2 の literal 見出し群を最初から入れておくべき                                               |
| 未タスク証跡          | `current=0` の報告だけで閉じず、0 件時テンプレートと follow-up formalize テンプレートを分ける必要がある。今回の再確認では 2 件を未タスク化した |

### 次回の再利用ルール

1. `SkillEvaluationPanel` のような共通判定 UI を入れるときは、UI・state・IPC・public interface を別担当で同期する。
2. `post_improve` のように入力軸が欠けうる stage は、weight 正規化を前提に pure helper へ閉じる。
3. Phase 11 は `data-testid` または一意文言を ready 条件にし、`テストケース / 結果 / 証跡` を崩さない。
4. Phase 12 は `.claude` 正本、`.agents` mirror、index 再生成、validator、未タスク監査を同一ターンで閉じる。
5. 未タスク 0 件判定は固定文で終わらせず、後追い formalize が出たら parent outputs と system spec の両方を再同期する。
