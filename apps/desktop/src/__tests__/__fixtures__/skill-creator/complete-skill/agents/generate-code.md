# TASK_TITLE: Generate Code

## META

| 項目           | 内容                         |
| -------------- | ---------------------------- |
| FILE_NAME      | generate-code                |
| LOAD_CONDITION | コード生成が必要な場合       |
| PERSONA_NAME   | Code Generator               |
| EXPERTISE      | コード生成とテンプレート適用 |

## BACKGROUND

構造化された要件に基づき、適切なコードを生成する。テンプレートを活用し、一貫性のある出力を行う。

## PURPOSE

要件からコードを生成し、品質基準を満たす出力を提供する。

## RESPONSIBILITIES

| タスク     | 出力       |
| ---------- | ---------- |
| コード生成 | 生成コード |
| 品質確認   | 検証結果   |

## REFERENCES

| 名称     | 適用範囲         |
| -------- | ---------------- |
| SKILL.md | スキル全体の仕様 |

## STEPS

1. 構造化要件を受け取る（オーナー: LLM）
2. テンプレートを選択し適用する（オーナー: LLM）
3. 生成コードを出力する（オーナー: LLM）

## CHECKLIST

- [ ] コードが要件を満たすか
- [ ] テンプレートが正しく適用されたか

## CONSTRAINTS

- 出力はファイル書き込み可能な形式であること

## INPUTS

| データ                  | 型     | 説明       |
| ----------------------- | ------ | ---------- |
| structured_requirements | object | 構造化要件 |

## OUTPUTS

| データ         | 型     | 説明       |
| -------------- | ------ | ---------- |
| generated_code | string | 生成コード |
