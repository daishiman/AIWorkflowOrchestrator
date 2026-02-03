# Phase 13: PR作成

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 13                          |
| タスク | TASK-9B-A                   |
| 機能名 | skill-creator SKILL.md 作成 |
| 作成日 | 2026-02-03                  |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 実行タスク

### Task 1: ローカル動作確認依頼【必須】

ユーザーに以下の確認を依頼:

````markdown
## ローカル動作確認チェックリスト

1. [ ] SKILL.md ファイルが存在することを確認
   ```bash
   ls -la ~/.aiworkflow/skills/skill-creator/SKILL.md
   ```
````

2. [ ] SKILL.md の内容を確認

   ```bash
   cat ~/.aiworkflow/skills/skill-creator/SKILL.md
   ```

3. [ ] AIWorkflowOrchestrator でスキルが認識されることを確認（可能な場合）

````

### Task 2: 変更サマリー提示と許可確認【必須】

```markdown
## 変更サマリー

### 作成ファイル
- `~/.aiworkflow/skills/skill-creator/SKILL.md`
  - skill-creator スキルの定義ファイル
  - 12の機能を定義
  - allowed-tools: 9ツール
  - サブエージェント参照: 5つ
  - 参照資料参照: 4つ

### 作成ドキュメント
- `docs/30-workflows/skill-import-agent-system/tasks/TASK-9B-A/`
  - Phase 1-13 仕様書
  - outputs/ 成果物

### 影響範囲
- 新規ファイル作成のみ
- 既存ファイルへの変更なし

---
**PR作成を実行してよろしいですか？**
````

### Task 3: PR作成【ユーザー許可後】

```bash
# ユーザーの許可を得た後に実行
/ai:diff-to-pr
```

### Task 4: CI確認

```markdown
確認項目:

- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] レビュー準備が完了している
```

### Task 5: タスクディレクトリ移動【PR作成後】

```bash
# PRが作成され、CIが通過した後に実行
# （本タスクはサブタスクのため、親タスク TASK-9B 完了時に移動）
```

## 参照資料

| 資料名         | パス                                          | 説明                 |
| -------------- | --------------------------------------------- | -------------------- |
| Phase 12成果物 | `outputs/phase-12/documentation-changelog.md` | ドキュメント更新履歴 |
| SKILL.md       | `~/.aiworkflow/skills/skill-creator/SKILL.md` | コミット対象         |
| 仕様書一式     | `docs/30-workflows/.../tasks/TASK-9B-A/`      | コミット対象         |

## 成果物

| 成果物 | パス                          | 説明     |
| ------ | ----------------------------- | -------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL等 |

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示しPR作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] レビュー準備が完了している
- [ ] **本Phase内の全作業を100%完了**

## 注意事項

- **PR作成は自動実行しない**: ユーザーの明示的な許可を得てから実行すること
- **本タスクはサブタスク**: TASK-9B-A は TASK-9B のサブタスクであり、completed-tasks への移動は親タスク完了時に行う

## 次のPhase

なし（ワークフロー完了）

---

## 関連タスク

| タスク    | 内容                             | 依存関係         |
| --------- | -------------------------------- | ---------------- |
| TASK-9B-A | **本タスク**: SKILL.md 作成      | -                |
| TASK-9B-B | hearing-facilitator エージェント | TASK-9B-A に依存 |
| TASK-9B-C | task-generator エージェント      | TASK-9B-A に依存 |
| TASK-9B-D | code-generator エージェント      | TASK-9B-A に依存 |
| TASK-9B-E | validator エージェント           | TASK-9B-A に依存 |
| TASK-9B-F | 参照資料                         | TASK-9B-A に依存 |
| TASK-9B-G | SkillCreatorService              | TASK-9B-A に依存 |
