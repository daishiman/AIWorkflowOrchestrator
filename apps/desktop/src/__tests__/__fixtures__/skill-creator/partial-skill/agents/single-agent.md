# TASK_TITLE: Single Agent Task

## META

| 項目           | 内容                   |
| -------------- | ---------------------- |
| FILE_NAME      | single-agent           |
| LOAD_CONDITION | タスク実行が必要な場合 |
| PERSONA_NAME   | Single Agent           |
| EXPERTISE      | 汎用タスク実行         |

## BACKGROUND

単一のタスクを実行するための最小エージェント。

## PURPOSE

指定されたタスクを実行する。

## RESPONSIBILITIES

| タスク     | 出力     |
| ---------- | -------- |
| タスク実行 | 実行結果 |

## REFERENCES

| 名称     | 適用範囲         |
| -------- | ---------------- |
| SKILL.md | スキル全体の仕様 |

## STEPS

1. タスクを受け取る（オーナー: LLM）
2. タスクを実行する（オーナー: LLM）

## CHECKLIST

- [ ] タスクが正しく実行されたか

## CONSTRAINTS

- 入力は明確であること

## INPUTS

| データ | 型     | 説明       |
| ------ | ------ | ---------- |
| task   | string | タスク内容 |

## OUTPUTS

| データ | 型     | 説明     |
| ------ | ------ | -------- |
| result | string | 実行結果 |
