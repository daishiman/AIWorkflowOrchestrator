# Phase 11: 手動テスト検証

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 11                          |
| タスク | TASK-9B-A                   |
| 機能名 | skill-creator SKILL.md 作成 |
| 作成日 | 2026-02-03                  |

## 目的

自動テストでは検証できない実環境動作・ユーザー体験を手動で確認する。

## 実行タスク

### Task 1: ファイル存在確認

```bash
# SKILL.md の存在確認
ls -la ~/.aiworkflow/skills/skill-creator/SKILL.md

# ファイル内容の先頭部分確認
head -50 ~/.aiworkflow/skills/skill-creator/SKILL.md
```

### Task 2: SkillScanner 検出確認

```markdown
手動確認項目:

1. AIWorkflowOrchestrator を起動
2. スキル一覧画面を開く
3. "skill-creator" スキルが表示されることを確認
4. スキル詳細を開き、以下を確認:
   - 名前: skill-creator
   - 説明が表示されている
   - allowed-tools が表示されている
```

### Task 3: スキル実行テスト（基本）

```markdown
手動確認項目:

1. "/skill-creator" コマンドを入力
2. スキルが起動することを確認
3. エラーが発生しないことを確認
```

### Task 4: 参照パス確認

```markdown
手動確認項目:

1. SKILL.md 内の agents/ 参照パスを確認
2. SKILL.md 内の references/ 参照パスを確認
3. 参照パスが意図した構造と一致することを確認
   （※ 実ファイルはTASK-9B-B〜Fで作成予定）
```

## テストケース

| No  | カテゴリ | テスト項目           | 前提条件       | 操作手順                                          | 期待結果                   | 実行結果 |
| --- | -------- | -------------------- | -------------- | ------------------------------------------------- | -------------------------- | -------- |
| 1   | ファイル | SKILL.md 存在確認    | タスク実行完了 | `ls ~/.aiworkflow/skills/skill-creator/`          | SKILL.md が存在            | -        |
| 2   | ファイル | SKILL.md 内容確認    | SKILL.md 存在  | `cat ~/.aiworkflow/skills/skill-creator/SKILL.md` | Frontmatter + Body が表示  | -        |
| 3   | スキャン | スキル一覧表示       | アプリ起動     | スキル一覧画面を開く                              | skill-creator が表示される | -        |
| 4   | スキャン | スキル詳細表示       | スキル一覧表示 | skill-creator をクリック                          | 詳細情報が表示される       | -        |
| 5   | 実行     | コマンド起動         | スキル登録済み | `/skill-creator` 入力                             | スキルが起動               | -        |
| 6   | 参照     | agents/ パス形式     | SKILL.md 存在  | agents/ 参照を確認                                | 5つ以上の参照が存在        | -        |
| 7   | 参照     | references/ パス形式 | SKILL.md 存在  | references/ 参照を確認                            | 4つ以上の参照が存在        | -        |

## 参照資料

| 資料名         | パス                                          | 説明         |
| -------------- | --------------------------------------------- | ------------ |
| Phase 10成果物 | `outputs/phase-10/final-review-result.md`     | レビュー結果 |
| SKILL.md       | `~/.aiworkflow/skills/skill-creator/SKILL.md` | テスト対象   |

## 統合テスト連携【必須】

手動統合テストを確認:

| テスト項目   | 確認内容              | 期待結果         | 実行結果   |
| ------------ | --------------------- | ---------------- | ---------- |
| ファイル存在 | SKILL.md パス確認     | ファイル存在     | {{RESULT}} |
| スキャン検出 | SkillScanner でパース | スキル一覧に表示 | {{RESULT}} |
| スキル起動   | `/skill-creator` 実行 | エラーなく起動   | {{RESULT}} |

## 成果物

| 成果物     | パス                                     | 説明           |
| ---------- | ---------------------------------------- | -------------- |
| テスト結果 | `outputs/phase-11/manual-test-result.md` | 手動テスト結果 |

## 完了条件

- [ ] 全テストケースが実行済み
- [ ] 全テストケースがPASS
- [ ] 統合テスト手動確認が完了
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 12: ドキュメント更新
