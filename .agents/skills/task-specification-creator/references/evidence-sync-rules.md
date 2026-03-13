# 証跡集約テンプレート台帳同期ルール

## 概要

証跡集約結果を既存台帳（task-workflow.md / lessons-learned.md / LOGS.md / SKILL.md）に反映するためのルール定義。

## 同期先一覧

| #   | 同期先                                       | 同期タイミング             | 同期内容                                                     |
| --- | -------------------------------------------- | -------------------------- | ------------------------------------------------------------ |
| 1   | task-workflow.md 残課題テーブル               | Phase 12 Task 4 完了時     | 検出した未タスクのID・タイトル・ステータスを追加             |
| 2   | task-workflow.md 完了タスクセクション         | Phase 12 完了時            | 完了タスクID・完了日・成果物サマリーを追加                   |
| 3   | lessons-learned.md                           | Phase 12 完了時            | 本タスク実行中に発見した教訓（Pitfallパターン）を追加       |
| 4   | aiworkflow-requirements/LOGS.md              | Phase 12 Task 5 完了時     | タスク完了記録を追加                                         |
| 5   | task-specification-creator/LOGS.md           | Phase 12 Task 5 完了時     | タスク完了記録を追加（P1/P25対策: 2ファイル両方必須）       |
| 6   | aiworkflow-requirements/SKILL.md             | Phase 12 Task 5 完了時     | 変更履歴テーブルを更新                                       |
| 7   | task-specification-creator/SKILL.md          | Phase 12 Task 5 完了時     | 変更履歴テーブルを更新                                       |

## 同期ルール

### ルール1: LOGS.md 2ファイル同時更新（P1/P25対策）

aiworkflow-requirements と task-specification-creator の両方の LOGS.md を必ず同一ターンで更新する。

**根拠**: P1 および P25 で、片方の LOGS.md 更新忘れが2回発生している。

**検証コマンド**:

```bash
git diff --name-only HEAD -- \
  .claude/skills/aiworkflow-requirements/LOGS.md \
  .claude/skills/task-specification-creator/LOGS.md | wc -l
# 期待値: 2（両方更新されている）
```

### ルール2: 完了記録は全ファイル更新後の最終ステップ（P43対策）

LOGS.md への「完了」記録は全ファイル更新後の最終ステップとする。

**根拠**: P43 で、LOGS.md に先に「完了」を記録した後に SubAgent が rate limit で中断し、未完了の検出が困難だった。

**手順**:

1. 全ての仕様書更新を実行する
2. 全ての仕様書更新が完了したことを確認する
3. 最後に LOGS.md に完了記録を追加する

### ルール3: SubAgent 3ファイル上限（P43対策）

1つの SubAgent に委譲するファイル更新は3ファイル以下とする。

**根拠**: P43 で、7ファイルの一括更新を1つの SubAgent に委譲した結果、49ツール使用・402秒実行後に rate limit に到達して中断した。

### ルール4: documentation-changelog 早期完了記載禁止（P4対策）

全 Step 確認前に「完了」と記載しない。

**根拠**: P4 で、全 Step 完了前に「完了」と記載したため、後続 Step の漏れに気付けなかった。

**手順**:

1. 各 Step の作業を実行する
2. 各 Step の完了結果を逐次記録する
3. 全 Step が完了した後に、最後に「完了」ステータスを記載する

### ルール5: 未タスク3ステップ全完了（P3/P38対策）

検出した未タスクは以下の3ステップを全て完了させる:

1. `unassigned-task/` に指示書作成
2. `task-workflow.md` 残課題テーブルに登録
3. 関連仕様書に参照リンク追加

**根拠**: P3 で指示書作成のみで残課題テーブルとリンク追加を忘れ、P38 で指示書の配置先を間違えた。

**検証方法**:

```bash
# 指示書の配置先確認
ls docs/30-workflows/unassigned-task/

# task-workflow.md の残課題テーブル確認
grep -n "未タスクID" .claude/skills/aiworkflow-requirements/references/task-workflow.md

# 関連仕様書のリンク確認
grep -rn "未タスクID" .claude/skills/aiworkflow-requirements/references/
```

## 同期チェックリスト

Phase 12 完了時に以下の全項目を確認する:

- [ ] task-workflow.md 完了台帳に記録済み
- [ ] task-workflow.md 残課題テーブル更新済み（該当時）
- [ ] lessons-learned.md 更新済み（新規教訓検出時）
- [ ] aiworkflow-requirements/LOGS.md 更新済み
- [ ] task-specification-creator/LOGS.md 更新済み
- [ ] aiworkflow-requirements/SKILL.md 変更履歴更新済み
- [ ] task-specification-creator/SKILL.md 変更履歴更新済み
