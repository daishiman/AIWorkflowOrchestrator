---
description: |
  {{コマンドの目的（1-2行）}}

  🤖 起動エージェント:
  - `.claude/agents/{{agent-name}}.md`: {{エージェントの役割}}

  ⚙️ このコマンドの設定:
  - argument-hint: {{引数の説明}}
  - allowed-tools: {{ツールリストの説明}}
  - model: {{モデル選択理由}}

  トリガーキーワード: {{keyword1}}, {{keyword2}}, {{keyword3}}, {{keyword4}}, {{keyword5}}
allowed-tools:
  - Read
  - Write
  - { { additional_tool_1 } }
  - { { additional_tool_N } }
model: { { sonnet|opus|haiku } }
argument-hint: "{{[引数名]}}"
---

# {{コマンド名}}

## 目的

{{このコマンドで何を達成するか（1-2文）}}

## 背景

{{なぜこのコマンドが必要か、どのような課題を解決するか}}

## ゴール

{{コマンド実行後の達成状態、完了時の状態}}

## エージェント起動フロー

### Phase 1: {{phase_name}}

#### 目的

{{このフェーズで何を達成するか}}

#### 背景

{{なぜこのフェーズが必要か}}

#### ゴール

{{このフェーズの具体的な完了状態}}

#### 起動エージェント

- `.claude/agents/{{agent-name}}.md`

#### Taskツール起動

Task ツールで `.claude/agents/{{agent-name}}.md` を起動

#### コンテキスト

- {{context_item_1}}
- {{context_item_2}}
- {{context_item_N}}

#### 完了条件

- [ ] {{completion_condition_1}}
- [ ] {{completion_condition_2}}
- [ ] {{completion_condition_N}}

### Phase 2: {{phase_name}}

#### 目的

{{このフェーズで何を達成するか}}

#### 背景

{{なぜこのフェーズが必要か}}

#### ゴール

{{このフェーズの具体的な完了状態}}

#### 起動エージェント

- `.claude/agents/{{agent-name}}.md`

#### Taskツール起動

Task ツールで `.claude/agents/{{agent-name}}.md` を起動

#### コンテキスト

- {{context_item_1}}
- {{context_item_2}}
- {{context_item_N}}

#### 完了条件

- [ ] {{completion_condition_1}}
- [ ] {{completion_condition_2}}
- [ ] {{completion_condition_N}}

### Phase N: {{phase_name}}

#### 目的

{{このフェーズで何を達成するか}}

#### 背景

{{なぜこのフェーズが必要か}}

#### ゴール

{{このフェーズの具体的な完了状態}}

#### 起動エージェント

- `.claude/agents/{{agent-name}}.md`

#### Taskツール起動

Task ツールで `.claude/agents/{{agent-name}}.md` を起動

#### コンテキスト

- {{context_item_1}}
- {{context_item_2}}
- {{context_item_N}}

#### 完了条件

- [ ] {{completion_condition_1}}
- [ ] {{completion_condition_2}}
- [ ] {{completion_condition_N}}
