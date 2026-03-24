# Phase 9 成果物: リスク台帳

> タスクID: TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001
> 作成日: 2026-03-23
> Phase: 9 - 品質検証

## 1. 概要

本ファイルは Phase 9（品質検証）で識別した残余リスクと緩和策を記録する。
リスクは「発生確率（H/M/L）× 影響度（H/M/L）」で優先度を算出する。

---

## 2. 残余リスク一覧

### 2.1 Phase 12 実行時のリスク

| リスクID | リスク内容                                                     | 発生確率 | 影響度 | 優先度 | 緩和策                                                                                                        | 参照 Pitfall |
| -------- | -------------------------------------------------------------- | -------- | ------ | ------ | ------------------------------------------------------------------------------------------------------------- | ------------ |
| R-01     | Step E 実行時に rate limit で mirror sync が中断する           | M        | H      | 高     | mirror sync は単一ファイル操作（rsync 1コマンド）のため3ファイル制約対象外。Step E は最後に実行しリカバリ可能 | P43          |
| R-02     | LOGS.md の2ファイル更新が片方のみで完了とみなされる            | M        | M      | 中     | contract-matrix.md の禁止アクションに明記。Phase 9 quality-checklist.md で PASS 確認済み                      | P1/P25       |
| R-03     | topic-map.md の再生成が「変更なし」として省略される            | M        | M      | 中     | validation-matrix.md の回帰防止ルールに「変更有無に関わらず実行」と明記                                       | P2/P27       |
| R-04     | 未タスク指示書が unassigned-task/ 以外に作成される             | L        | M      | 低     | Phase 12 Task 4 のチェックリストに配置先を明示                                                                | P3/P38/P58   |
| R-05     | documentation-changelog が全 Task 完了前に「完了」と記録される | M        | M      | 中     | changelog 作成はメインエージェントのみ実施（P59 対策）。「事後記録」を Phase 9 で確認                         | P4/P51       |
| R-06     | サブエージェントが3ファイル超のファイルを一括更新しようとする  | M        | H      | 高     | contract-matrix.md 3.2節に「最大3ファイル/エージェント」を数値制約として記載                                  | P43          |
| R-07     | GitHub Issue の close が再評価クローズ時に漏れる               | L        | M      | 低     | design-summary.md 4.3節の Issue Sync ステップに gh issue close を明記                                         | P56          |
| R-08     | parallel サブエージェントが changelog を個別に作成する         | L        | H      | 中     | contract-matrix.md 3.2節に「changelog 作成担当はメインエージェント（分割禁止）」と明記                        | P59          |

### 2.2 設計タスク固有のリスク

| リスクID | リスク内容                                                     | 発生確率 | 影響度 | 優先度 | 緩和策                                                                                       | 参照 Pitfall |
| -------- | -------------------------------------------------------------- | -------- | ------ | ------ | -------------------------------------------------------------------------------------------- | ------------ |
| R-09     | 設計タスクだからとシステム仕様書更新が先送りされる             | M        | H      | 高     | validation-matrix.md の回帰防止ルールに「設計タスクでも Phase 12 完了時に実更新」と明記      | P26/P57      |
| R-10     | 設計タスクで未タスクの指示書ファイルが省略される               | M        | M      | 中     | design-summary.md 4.3節の Step 1 に「設計タスクでも省略不可（P58）」と明記                   | P3/P58       |
| R-11     | type: design の state machine 遷移条件が実装タスクと混同される | L        | M      | 低     | contract-matrix.md 1.2節に type 別条件テーブルを明示                                         | なし（新規） |
| R-12     | Phase 12 完了後に .claude/skills/ の実更新が抜ける             | M        | H      | 高     | validation-matrix.md のドリフト検出コマンド 7（changelog と unassigned-task 件数照合）で検出 | P57          |

### 2.3 Mirror Sync リスク

| リスクID | リスク内容                                             | 発生確率 | 影響度 | 優先度 | 緩和策                                                                         | 参照 Pitfall |
| -------- | ------------------------------------------------------ | -------- | ------ | ------ | ------------------------------------------------------------------------------ | ------------ |
| R-13     | .agents/ を直接編集して canonical root と乖離する      | L        | H      | 中     | contract-matrix.md の禁止アクション表に「.agents/ 直接編集禁止」を明記         | P65          |
| R-14     | diff -qr の実行を忘れて mirror sync が確認されない     | M        | M      | 中     | validation-matrix.md のドリフト検出コマンド 3 として明示                       | なし（新規） |
| R-15     | worktree 環境で rsync が別 worktree に誤って実行される | L        | H      | 中     | rsync コマンドは作業中 worktree のカレントディレクトリ基準で実行することを明示 | なし（新規） |

---

## 3. リスク優先度マトリクス

```
           影響度
           H         M         L
発生確率 H │ R-01     │          │
         M │ R-06     │ R-02     │
           │ R-09     │ R-03     │
           │ R-12     │ R-05     │
           │          │ R-08     │
         L │ R-13     │ R-04     │
           │ R-15     │ R-07     │
           │          │ R-10     │
           │          │ R-11     │
           │          │ R-14     │
```

---

## 4. 高優先度リスク（H）の詳細対策

### R-01: rate limit による mirror sync 中断

| 項目         | 内容                                                                          |
| ------------ | ----------------------------------------------------------------------------- |
| 発生シナリオ | Step E 実行時、Phase 12 の後半で rate limit に達し rsync が未完了になる       |
| 検出方法     | `diff -qr ./.claude/skills/ ./.agents/skills/` の出力が非空                   |
| リカバリ     | `rsync -avz --checksum ./.claude/skills/ ./.agents/skills/` を再実行する      |
| 予防策       | Step E を最後に実行し（Step A〜D 完了後）、残タスクが最小になる状態で着手する |

### R-06: サブエージェントの3ファイル超過

| 項目         | 内容                                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| 発生シナリオ | メインエージェントがサブエージェント指示で「以下のファイルを全て更新してください」と4件以上を指定する |
| 検出方法     | サブエージェント指示の draft 段階で対象ファイル数を確認する                                           |
| リカバリ     | サブエージェントを分割する（Sub-A: 3件、Sub-B: 残り）                                                 |
| 予防策       | メインエージェントが指示書を作成する前に対象ファイル数を数える                                        |

### R-09: 設計タスクでのシステム仕様書更新先送り

| 項目         | 内容                                                                                     |
| ------------ | ---------------------------------------------------------------------------------------- |
| 発生シナリオ | 「設計タスクだから実装後に更新すればよい」という判断で Phase 12 Task 2 Step C を省略する |
| 検出方法     | `git diff --stat -- .claude/skills/` で Phase 12 完了時点の変更ファイル数を確認する      |
| リカバリ     | Phase 12 Task 2 Step C を該当 Phase 内で実施する（後続タスクには持ち越さない）           |
| 予防策       | Phase 12 仕様書（phase-12-documentation.md）のチェックリストに Step C 実行を明記する     |

### R-12: Phase 12 完了後の .claude/skills/ 実更新抜け

| 項目         | 内容                                                                                          |
| ------------ | --------------------------------------------------------------------------------------------- |
| 発生シナリオ | Phase 12 Task 3（documentation-changelog）作成後に .claude/skills/ 更新を忘れて PR を作成する |
| 検出方法     | `git diff --stat -- .claude/skills/` → 変更ファイルが期待数より少ない                         |
| リカバリ     | 追加 commit で .claude/skills/ を更新する                                                     |
| 予防策       | Phase 13（PR 作成）の blocked 条件に「.claude/skills/ 更新済み」を含める                      |

---

## 5. リスク対策の設計への反映状況

| リスクID | 対策が設計文書に反映されているか | 反映箇所                                               |
| -------- | -------------------------------- | ------------------------------------------------------ |
| R-01     | YES                              | contract-matrix.md の Action 契約                      |
| R-02     | YES                              | contract-matrix.md の禁止アクション                    |
| R-03     | YES                              | validation-matrix.md の回帰防止ルール                  |
| R-04     | YES                              | design-summary.md 4.3節 Follow-up                      |
| R-05     | YES                              | contract-matrix.md 3.2節（changelog はメインのみ）     |
| R-06     | YES                              | contract-matrix.md 3.2節（3ファイル/エージェント）     |
| R-07     | YES                              | design-summary.md 4.3節 Issue Sync                     |
| R-08     | YES                              | contract-matrix.md 3.2節（changelog 分割禁止）         |
| R-09     | YES                              | validation-matrix.md の回帰防止ルール                  |
| R-10     | YES                              | design-summary.md 4.3節 Step 1                         |
| R-11     | YES                              | contract-matrix.md 1.2節 type 別テーブル               |
| R-12     | YES                              | validation-matrix.md ドリフト検出コマンド7             |
| R-13     | YES                              | contract-matrix.md の禁止アクション                    |
| R-14     | YES                              | validation-matrix.md ドリフト検出コマンド3             |
| R-15     | PARTIAL                          | rsync コマンド例に worktree 注意が不足（未タスク候補） |

**R-15 の未タスク**: rsync コマンドの worktree 環境注意書きが不足している。未タスク指示書: [`docs/30-workflows/unassigned-task/worktree-rsync-caution-annotation.md`](../../../unassigned-task/worktree-rsync-caution-annotation.md)
