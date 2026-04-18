# TASK-CONFLICT-PREVENT-001: Phase 9 mirror parity サマリー

## メタ情報

| 項目       | 値                        |
| ---------- | ------------------------- |
| タスクID   | TASK-CONFLICT-PREVENT-001 |
| Phase      | 9                         |
| 作成日     | 2026-04-18                |
| ステータス | completed                 |

## 概要

`.claude/skills`（canonical）と `.agents/skills`（mirror）の間に残存する差分を記録する。
本 wave では差分の記録のみ行い、full sync は follow-up タスクとする。

## 差分ファイル一覧

| ファイル                                          | canonical (.claude)    | mirror (.agents) | 差分種別           | 対応                         |
| ------------------------------------------------- | ---------------------- | ---------------- | ------------------ | ---------------------------- |
| `aiworkflow-requirements/LOGS.md`                 | 最新エントリあり       | 古いエントリのみ | append 差分        | follow-up (mirror full sync) |
| `aiworkflow-requirements/indexes/keywords.json`   | 最新キーワード反映済み | 旧バージョン     | content 差分       | follow-up (mirror full sync) |
| `aiworkflow-requirements/indexes/resource-map.md` | 最新リソース反映済み   | 旧バージョン     | content 差分       | follow-up (mirror full sync) |
| `aiworkflow-requirements/indexes/topic-map.md`    | 日付ヘッダ除去済み     | 日付ヘッダ残存   | deterministic 差分 | follow-up (mirror full sync) |
| `task-workflow-completed.md`                      | 最新完了エントリあり   | 古いエントリのみ | append 差分        | follow-up (mirror full sync) |
| `skill-creator/SKILL.md`                          | 最新スキル定義         | 旧スキル定義     | content 差分       | follow-up (mirror full sync) |

## 差分分類

| 分類                                                       | ファイル数 | 説明                                                                 |
| ---------------------------------------------------------- | ---------- | -------------------------------------------------------------------- |
| append 差分（新エントリが canonical のみ）                 | 2          | LOGS.md, task-workflow-completed.md                                  |
| content 差分（canonical が更新済み）                       | 4          | keywords.json, resource-map.md, topic-map.md, skill-creator/SKILL.md |
| 削除差分（canonical に存在しないファイルが mirror にある） | 0          | なし                                                                 |
| 追加差分（mirror に存在しないファイルが canonical にある） | 0          | なし                                                                 |

## 評価

**follow-up（本 wave スコープ外）**

- 差分はすべて canonical (.claude) が新しく mirror (.agents) が古い状態
- セキュリティ・機能上の問題は発生していない（mirror は参照系のみ）
- full sync は次 wave の独立タスクとして登録する（unassigned-task-detection.md 参照）

## 本 wave で対処済みの事項

| 事項                               | 処理                                                                                                |
| ---------------------------------- | --------------------------------------------------------------------------------------------------- |
| topic-map.md の日付ヘッダ差分増幅  | canonical (.claude) 側で generate-index.js から日付ヘッダを除去済み。mirror sync 後は再現しない設計 |
| merge driver 未設定による conflict | setup-merge-drivers.sh + session-init.sh warn により bootstrap 手順を明確化済み                     |

## follow-up タスクへの引継ぎ情報

- 対象: `.agents/skills` を `.claude/skills` に追従させる full sync
- 優先度: HIGH（10 本並列 worktree 環境で mirror が古いと設計参照時に誤解が生じる）
- 推奨方法: `rsync -av --delete .claude/skills/ .agents/skills/` 後に PR
- 注意: `merge=union` 対象の LOGS.md は append-only のため上書き禁止。diff を確認してから sync すること

## 接続先

- command-log.md: CMD-05 の実行ログ
- Phase 7 gap-list.md: GAP-01 (mirror full sync)
- Phase 12 unassigned-task-detection.md: follow-up タスク登録
