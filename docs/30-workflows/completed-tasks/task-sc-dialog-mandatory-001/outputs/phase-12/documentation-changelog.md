# ドキュメント変更履歴

## 変更日: 2026-04-01

### TASK-SC-DIALOG-MANDATORY-001: skill-creator 対話強制化

| ファイル                                                  | 変更種別 | 変更内容                                                              | 根拠                                                                   |
| --------------------------------------------------------- | -------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `.claude/skills/skill-creator/SKILL.md`                   | 追加     | `# Skill Creator` 直後に `## 必須：最初の実行ステップ` ブロックを追加 | LLM への命令形記述が必要（宣言型では有用性バイアスで飛ばされる）       |
| `.claude/skills/skill-creator/agents/discover-problem.md` | 追加     | `> **読み込み条件**` 直後に実行ゲートブロックを追加                   | ファイル読み込み直後の AskUserQuestion 実行を強制するため              |
| `.claude/skills/skill-creator/agents/interview-user.md`   | 変更     | セクション5.1 の problem-definition.json 欠損時処理を変更             | 初回呼び出し時は必ず存在しないため、エラー停止からフォールバックへ変更 |

## 変更なし

以下のファイルは変更対象外:

- `.claude/skills/skill-creator/agents/create-skill.md` 他すべての agents/ ファイル
- `.claude/skills/skill-creator/references/` 配下すべて
- `.claude/skills/skill-creator/scripts/` 配下すべて
- `apps/` `packages/` 配下のアプリケーションコード
