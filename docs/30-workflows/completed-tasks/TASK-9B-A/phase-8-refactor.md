# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 8                           |
| タスク | TASK-9B-A                   |
| 機能名 | skill-creator SKILL.md 作成 |
| 作成日 | 2026-02-03                  |

## 目的

SKILL.md の可読性・保守性を改善する（動作は変えない）。

## 実行タスク

### Task 1: 構造の最適化

```markdown
確認・改善項目:

- [ ] セクション順序が論理的であること
- [ ] 各機能の説明が簡潔であること
- [ ] 重複した記述がないこと
- [ ] インデントが一貫していること
```

### Task 2: 記述の明確化

```markdown
確認・改善項目:

- [ ] 曖昧な表現がないこと
- [ ] 専門用語に説明があること
- [ ] 使用例が具体的であること
- [ ] エラーケースの説明があること
```

### Task 3: 既存スキルとの整合性確認

```markdown
確認・改善項目:

- [ ] 既存 ~/.claude/skills/skill-creator/ のパターンと整合性があること
- [ ] 命名規則が統一されていること
- [ ] 参照パスの形式が統一されていること
```

### Task 4: 500行以内制約の確認

```bash
# 行数確認
wc -l ~/.aiworkflow/skills/skill-creator/SKILL.md

# 500行を超える場合は references/ に分離
```

## 参照資料

| 資料名            | パス                                          | 説明           |
| ----------------- | --------------------------------------------- | -------------- |
| Phase 7成果物     | `outputs/phase-7/coverage-report.md`          | 検証レポート   |
| SKILL.md          | `~/.aiworkflow/skills/skill-creator/SKILL.md` | リファクタ対象 |
| 既存skill-creator | `~/.claude/skills/skill-creator/SKILL.md`     | 参考実装       |

## 統合テスト連携【必須】

リファクタリング後の全検証テスト継続成功を確認:

```bash
# リファクタリング後のテスト実行
bash outputs/phase-4/validate-skill-md.sh
bash outputs/phase-6/validate-skill-md-extended.sh
```

## 成果物

| 成果物               | パス                                          | 説明     |
| -------------------- | --------------------------------------------- | -------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md`          | 変更内容 |
| 改善後SKILL.md       | `~/.aiworkflow/skills/skill-creator/SKILL.md` | 改善版   |

## 完了条件

- [ ] 全検証テストが継続成功
- [ ] 構造が最適化されている
- [ ] 記述が明確化されている
- [ ] 既存スキルとの整合性が確認されている
- [ ] 500行以内制約を満たしている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 9: 品質保証
