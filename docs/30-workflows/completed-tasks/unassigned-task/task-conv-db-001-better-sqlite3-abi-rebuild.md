# UT-CONV-DB-001 better-sqlite3 ABI rebuild 再発防止

## メタ情報

| 項目           | 内容                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------ |
| タスクID       | UT-CONV-DB-001                                                                             |
| タイトル       | better-sqlite3 ABI rebuild 再発防止                                                        |
| ステータス     | 未実施                                                                                     |
| 優先度         | 中                                                                                         |
| 発見元         | TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001 Phase 12                                           |
| 発見日         | 2026-03-19                                                                                 |
| 関連タスク     | TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001                                                    |
| 関連仕様リンク | docs/30-workflows/conversation-db-robustness/outputs/phase-12/unassigned-task-detection.md |
| 担当想定       | Desktop / Build                                                                            |

## 1. なぜこのタスクが必要か（Why）

better-sqlite3 は Electron / Node ABI 差分で起動時不整合を起こしやすい。  
今回の堅牢化では DB 初期化と fallback を整えたが、ABI rebuild を再発防止する運用は未整備である。

## 2. 何を達成するか（What）

Electron バージョン差分があっても、会話 DB 機能が ABI 不整合で壊れにくい状態を作る。

## 3. どのように実行するか（How）

- better-sqlite3 の rebuild 条件を明文化する
- 開発環境 / CI / 配布ビルドでの再現手順を統一する
- ABI mismatch 検知時の対処を運用ドキュメントへ追加する

## 4. 実行手順

1. Electron と better-sqlite3 の組み合わせ条件を整理する。
2. rebuild 手順を script または docs に固定する。
3. mismatch 発生時の診断ログと復旧手順を整備する。
4. 必要なら preflight check を追加する。

## 5. 完了条件チェックリスト

- ABI mismatch 時の診断手順が明文化されている
- rebuild 手順が 1 つに統一されている
- 開発者が 5 分以内に復旧方針へ到達できる

## 6. 検証方法

- pnpm electron:rebuild
- pnpm test -- conversationDatabase

## 7. リスクと対策

- Electron 更新で再度手順が壊れる: rebuild 手順を script 化して追従しやすくする
- ローカル環境依存の差分が残る: 診断手順と前提バージョンを明文化する

## 8. 参照情報

- docs/30-workflows/conversation-db-robustness/outputs/phase-12/unassigned-task-detection.md
- docs/30-workflows/conversation-db-robustness/outputs/phase-12/system-spec-update-summary.md

## 9. 備考

今回タスクでは graceful degradation と永続化初期化を優先したため、ABI rebuild 運用は切り出した。
