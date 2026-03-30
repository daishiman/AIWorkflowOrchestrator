# Phase 2: 設計

## メタ情報

| 項目   | 値                         |
| ------ | -------------------------- |
| Phase  | 2                          |
| 機能名 | task-llm-mod-04-audit-sync |
| 作成日 | 2026-03-29                 |

## 目的

監査対象を「コード」「テスト」「system spec」「workflow artifact」の4面に分解し、再監査の最短経路を設計する。

## 実行タスク

- 監査マトリクス設計
- stale path の置換方針決定
- Phase 11 / 12 補助成果物の配置設計
- validator 実行経路の固定

## 監査マトリクス

| 観点                | 正本                                    | 確認方法    | 期待値                                             |
| ------------------- | --------------------------------------- | ----------- | -------------------------------------------------- |
| provider/model 定義 | `provider-registry.ts`                  | Read / grep | 5 provider + `o3` / `o4-mini` / `claude-haiku-4-5` |
| Main 実装           | `apps/desktop/src/main/handlers/llm.ts` | Read        | shared 正本参照、ローカル定義なし                  |
| テスト              | `llm.test.ts` ほか                      | grep        | 既存ケースが存在                                   |
| system spec         | `.claude/skills/*/LOGS.md`              | Read        | 2026-03-24 完了記録あり                            |
| workflow 形式       | `task-specification-creator`            | validator   | Phase 11/12/artifacts 欠落なし                     |

## 設計判断

- 実装を追加する設計は採用しない
- stale な「変更予定」文言は「確認済み」へ置換する
- Phase 11 は NON_VISUAL evidence 2ファイルで閉じる
- Phase 12 は 6成果物で閉じる
- PR は user 指示まで blocked とする

## 参照資料

| 資料              | パス                                                                        | 説明             |
| ----------------- | --------------------------------------------------------------------------- | ---------------- |
| Phase 1           | `phase-1-requirements.md`                                                   | 要件             |
| Phase 11/12 guide | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md` | 補助成果物ルール |
| phase templates   | `.claude/skills/task-specification-creator/references/phase-templates.md`   | validator 前提   |

## 統合テスト連携

統合テストの対象は current tests の存在確認と historical pass record の整合確認とする。

## 成果物

| 成果物 | パス                | 説明       |
| ------ | ------------------- | ---------- |
| 設計書 | `phase-2-design.md` | 再監査設計 |

## 完了条件

- [x] 4面監査マトリクスを定義した
- [x] stale path 置換方針を決定した
- [x] Phase 11 / 12 の成果物構成を固定した
- [x] **本Phase内の全タスクを100%実行完了**
