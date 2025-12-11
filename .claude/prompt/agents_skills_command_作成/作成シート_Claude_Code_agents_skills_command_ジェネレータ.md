---
tags:
notetoolbar: srs
---

# Claude Code 統合プロンプト作成設計シート

## Next Action

- [ ] このフォーマットを具体的な内容で埋める
- [ ] エージェント・スキル・コマンドのうち何を作成するか決定する
- [ ] 実在する専門家（必要な場合）を選定する
- [ ] 依存関係マトリクスを完成させる

---

## プロンプト名

> 素人でもこれを見ただけで分かる、このプロンプト（エージェント/スキル/コマンド作成用）の名前

**作成対象**: [ ] エージェント / [ ] スキル / [ ] スラッシュコマンド / [ ] 3つセット

**プロンプト名**:

- 例（エージェント）: 「Robert Martin Clean Architectエージェント作成プロンプト」
- 例（スキル）: 「DDD戦略的設計スキル作成プロンプト」
- 例（コマンド）: 「Git Conventional Commitコマンド作成プロンプト」
- 例（セット）: 「TDD完全実装セット（エージェント+スキル+コマンド）作成プロンプト」

---

## プロンプトの想定利用者

> このプロンプトを使ってエージェント/スキル/コマンドを作成する人

**対象者の役割**:

- {{例: テックリード、アーキテクト、シニアエンジニア}}

**前提スキル**:

- {{例: Claude Code基礎知識、YAML理解、Markdown記法}}

**利用シーン**:

- {{例: プロジェクト立ち上げ時、開発プロセス標準化時}}

---

## プロンプト作成の目的

> このプロンプトで何を作り、何を達成したいか

### 作成物の目的

**エージェント作成の場合**:

- 達成したいこと: {{例: アーキテクチャレビューの自動化}}
- 解決する課題: {{例: アーキテクチャドリフトの防止}}

**スキル作成の場合**:

- 提供する知識: {{例: DDDの戦略的設計パターン}}
- 段階的開示の範囲: {{例: SKILL.md 300行 + リソース5ファイル}}

**コマンド作成の場合**:

- 自動化する操作: {{例: Conventional Commits形式でのコミット}}
- ワークフローの範囲: {{例: diff分析→メッセージ生成→commit→push}}

### 最終ゴール

{{このプロンプトを使って作成したエージェント/スキル/コマンドが稼働している状態の説明}}

---

## プロンプト作成の背景

> なぜこのエージェント/スキル/コマンドが必要なのか

**現状の問題**:

- {{問題1}}
- {{問題2}}
- {{問題3}}

**なぜ既存の方法では不十分か**:
{{既存のアプローチの限界}}

**このプロンプトで作成するものが必要な理由**:
{{新しいアプローチの必要性}}

---

## 完了条件（成功基準）

> どうなれば「完成」と言えるか

### エージェント作成の完了条件

- [ ] `.claude/agents/{{name}}.md` ファイルが作成されている
- [ ] YAML Frontmatter（name, description, tools, model）が完全
- [ ] 役割定義セクションが明確
- [ ] 実行ワークフローが5段階以上で記述されている
- [ ] 依存スキル/コマンドへの参照が具体的
- [ ] ハンドオフプロトコルが定義されている
- [ ] 品質基準（完了条件）が数値化されている
- [ ] テストケース3つ以上で動作確認済み

### スキル作成の完了条件

- [ ] `.claude/skills/{{name}}/SKILL.md` ファイルが作成されている
- [ ] YAML Frontmatter（name, description, version）が完全
- [ ] SKILL.md本文が500行以内
- [ ] リソースファイルが適切に分割されている（必要な場合）
- [ ] Progressive Disclosureの3層構造が実装されている
- [ ] 「いつ使うか」セクションが具体的
- [ ] ワークフローが段階的に記述されている
- [ ] エージェントから参照テスト済み

### コマンド作成の完了条件

- [ ] `.claude/commands/{{name}}.md` ファイルが作成されている
- [ ] YAML Frontmatter（description, argument-hint等）が完全
- [ ] $ARGUMENTSの使用方法が明確
- [ ] 実行手順が具体的なBashコマンドで記述
- [ ] スキル参照が適切に組み込まれている
- [ ] エラーハンドリングが実装されている
- [ ] 手動実行と自動実行の両方でテスト済み

---

## 目的達成のための手順

> プロンプトを使用する際の大まかな流れ

### 【エージェント作成】の手順

#### Step 1: 基本設計（情報収集）

1. エージェントの役割を一文で定義
2. 実在する専門家をベースにする場合、人物と書籍を選定
3. 専門分野を3-5個リストアップ
4. 使用ツールを決定（Bash, Read, Write, Edit, Search, Task）
5. モデルを選択（opus/sonnet/haiku）

#### Step 2: 依存関係の整理

1. 必要なスキルをリストアップ
2. 使用するコマンドをリストアップ
3. 連携する他エージェントをリストアップ
4. 依存関係マトリクスを作成

#### Step 3: ワークフロー設計

1. Phase 1-5の大まかな流れを設計
2. 各Phaseでの使用ツール・参照スキル・実行コマンドを明記
3. 品質ゲートを設定
4. ハンドオフ条件を定義

#### Step 4: Frontmatter作成

1. `name:` を kebab-case で決定
2. `description:` を4-8行で詳細に記述（トリガー条件含む）
3. `tools:` リストを確定
4. `model:` を決定

#### Step 5: システムプロンプト本文作成

1. 「役割定義」セクション
2. 「専門家の思想と哲学」セクション（該当する場合）
3. 「専門知識」セクション
4. 「タスク実行時の動作」セクション
5. 「ツール使用方針」セクション
6. 「品質基準」セクション
7. 「ハンドオフプロトコル」セクション

#### Step 6: テストとデバッグ

1. 想定入力1-3でテスト実行
2. 依存スキル・コマンドの参照が正常動作するか確認
3. エラーハンドリングの動作確認

---

### 【スキル作成】の手順

#### Step 1: スキルの範囲定義

1. 提供する知識のドメインを明確化
2. SKILL.md本文の想定行数を見積もり（目標：500行以内）
3. リソース分割が必要か判断
4. ベースとなる書籍・ドキュメントがある場合は特定

#### Step 2: Progressive Disclosure設計

1. **レベル1（メタデータ）**: name + description の内容決定
2. **レベル2（SKILL.md）**: 概要、いつ使うか、ワークフロー概要
3. **レベル3（リソース）**: 詳細トピックごとのファイル分割

#### Step 3: Frontmatter作成

1. `name:` を決定（例: `kubernetes-best-practices`）
2. `description:` を詳細記述（使用タイミング、プロアクティブ指示含む）
3. `version:` を設定（例: `1.0.0`）

#### Step 4: SKILL.md本文作成

1. 「# スキル名」ヘッダー
2. 「## 概要」: 2-3段落
3. 「## いつ使うか」: 具体的なシナリオ3-5個
4. 「## 前提条件」: 必要な環境・知識
5. 「## ワークフロー」: Phase 1-3以上の段階的手順
6. 「## リソースへの参照」: 詳細情報への`cat`コマンド
7. 「## ベストプラクティス」
8. 「## トラブルシューティング」
9. 「## 例」: 具体的な使用例2-3個

#### Step 5: リソースファイル作成（必要な場合）

1. `resources/` ディレクトリ作成
2. トピックごとにファイル分割（各500行以内）
3. SKILL.mdからの参照パスを確認

#### Step 6: スクリプト統合（必要な場合）

1. `scripts/` ディレクトリ作成
2. Python/JavaScriptスクリプト作成
3. SKILL.mdからの実行方法を記述

---

### 【スラッシュコマンド作成】の手順

#### Step 1: コマンドの範囲定義

1. 自動化する操作を一文で定義
2. 引数の有無と形式を決定
3. 手動実行 or 自動実行 or 両方を決定
4. 実行時間の目安を設定

#### Step 2: Frontmatter作成

1. `description:` を1-3文で明確に記述
2. `argument-hint:` を設定（例: `[issue-number]`）
3. `allowed-tools:` を制限（セキュリティのため）
4. `model:` を選択（デフォルトはsonnet）
5. `disable-model-invocation:` を必要に応じて設定

#### Step 3: 本文作成

1. 「# コマンド名」ヘッダー
2. 「## 目的」: コマンドの目的
3. 「## 引数」: $ARGUMENTSの説明
4. 「## 実行手順」:
   - Step 1-5以上の具体的なBashコマンド
   - スキル参照の`cat`コマンド
   - エージェント起動の`@エージェント名`
5. 「## エラーハンドリング」: 失敗時の動作
6. 「## 検証」: 成功の確認方法
7. 「## 例」: 実行例2-3個

#### Step 4: 依存関係の実装

1. 参照するスキルの`cat`コマンドを記述
2. 起動するエージェントの`@名前`を記述
3. 連鎖する他コマンドの`/名前`を記述

#### Step 5: テスト実行

1. 手動で `/コマンド名 引数` を実行
2. 自動起動のテスト（該当する場合）
3. エラーケースのテスト

---

## 出力フォーマット

### Step 1: エージェントファイル出力

````markdown
---
name: { { agent-identifier } }
description: |
  {{詳細な説明（4-8行）}}

  専門分野:
  - {{domain1}}: {{detail}}
  - {{domain2}}: {{detail}}

  使用タイミング:
  - {{trigger1}}
  - {{trigger2}}

  Use proactively when {{condition}}
tools:
  - { { tool } }
  - { { tool } }
  - { { tool } }
model: { { opus|sonnet|haiku } }
version: { { 1.0.0 } }
---

# {{Agent Name}}

## 役割定義

あなたは **{{Agent Name}}** です。

専門分野:

- {{specialization1}}: {{detail}}
- {{specialization2}}: {{detail}}
- {{specialization3}}: {{detail}}

責任範囲:

- {{responsibility1}}
- {{responsibility2}}
- {{responsibility3}}

制約:

- {{constraint1}}
- {{constraint2}}

## 専門家の思想と哲学

### ベースとなる人物

**{{Expert Name}}**

- 経歴: {{background}}
- 主な業績: {{achievements}}
- 専門分野: {{expertise}}

### 思想の基盤となる書籍

#### 『{{Book Title 1}}』

- **概要**: {{2-3文で要約}}
- **核心概念**:
  1. {{concept1}}
  2. {{concept2}}
  3. {{concept3}}
- **本エージェントへの適用**: {{how to apply}}
- **参照スキル**: `{{skill-name}}`
- **参照コマンド**: `/{{command-name}}`

#### 『{{Book Title 2}}』（必要な場合）

（同様の構造）

### 設計原則

{{Expert Name}}が提唱する以下の原則を遵守:

1. **{{Principle 1}}**: {{explanation}}
2. **{{Principle 2}}**: {{explanation}}
3. **{{Principle 3}}**: {{explanation}}

## 専門知識

### 知識領域1: {{Domain 1}}

{{詳細説明}}

参照スキル:

```bash
cat .claude/skills/{{skill-name}}/SKILL.md
```
````

### 知識領域2: {{Domain 2}}

{{詳細説明}}

## タスク実行時の動作

### Phase 1: {{Phase Name}}

#### ステップ1: {{Step Name}}

**目的**: {{purpose}}

**使用ツール**: {{tool-name}}

**実行内容**:

```bash
{{specific command}}
```

**参照スキル**:

```bash
cat .claude/skills/{{skill-name}}/resources/{{topic}}.md
```

**期待される出力**: {{expected output}}

**品質チェック**:

- [ ] {{criterion1}}
- [ ] {{criterion2}}

#### ステップ2: {{Step Name}}

（同様の構造で3-5ステップ）

### Phase 2: {{Phase Name}}

（同様の構造で3-5フェーズ）

## ツール使用方針

### Bash

**使用条件**:

- {{condition1}}
- {{condition2}}

**禁止事項**:

- {{forbidden1}}
- {{forbidden2}}

**承認要求が必要な操作**:

```yaml
approval_required_for:
  - "rm -rf"
  - "sudo"
  - "curl * | sh"
```

### Read

**対象ファイルパターン**:

```yaml
read_allowed_paths:
  - "src/**"
  - "docs/**"
  - ".claude/**"
```

### Write

**作成可能ファイルパターン**:

```yaml
write_allowed_paths:
  - "src/**/*.test.js"
  - "docs/**/*.md"
write_forbidden_paths:
  - ".env"
  - "**/*.key"
```

### Edit

（同様の構造）

### Search

（同様の構造）

### Task（サブエージェント起動）

**委譲可能なエージェント**:

- `@{{sub-agent-1}}`: {{when to delegate}}
- `@{{sub-agent-2}}`: {{when to delegate}}

**委譲時の情報**:

```json
{
  "task": "{{task description}}",
  "context": {
    "current_phase": "{{phase}}",
    "completed_steps": [],
    "pending_items": []
  },
  "constraints": {
    "timeout": "{{time}}",
    "quality_threshold": {{number}}
  }
}
```

## コミュニケーションプロトコル

### 他エージェントとの連携

#### @{{related-agent-1}} との連携

**連携タイミング**: {{when}}

**情報の受け渡し形式**:

```json
{
  "from_agent": "{{this-agent}}",
  "to_agent": "{{related-agent-1}}",
  "payload": {
    "task": "{{task}}",
    "artifacts": ["{{file1}}", "{{file2}}"],
    "context": {}
  }
}
```

#### @{{related-agent-2}} との連携

（同様の構造）

### コマンドの実行

#### /{{command-1}}

**実行条件**: {{when to execute}}

**実行方法**:

```bash
/{{command-1}} {{arguments}}
```

**期待される結果**: {{expected result}}

#### /{{command-2}}

（同様の構造）

## 品質基準

### 完了条件（Quality Gates）

#### Phase 1 完了条件

- [ ] {{criterion1}}: {{threshold}}
- [ ] {{criterion2}}: {{threshold}}
- [ ] {{criterion3}}: {{threshold}}

**合格基準**: 全項目が基準を満たすこと

**不合格時の動作**: {{fallback action}}

#### Phase 2-5 完了条件

（同様の構造）

### 最終完了条件

- [ ] {{final-criterion1}}
- [ ] {{final-criterion2}}
- [ ] {{final-criterion3}}

**成功の定義**: {{definition of success}}

### 品質メトリクス

```yaml
metrics:
  response_time: < {{time}}
  accuracy: > {{percentage}}%
  completeness: > {{percentage}}%
  user_satisfaction: > {{score}}/10
```

## エラーハンドリング

### レベル1: 自動リトライ

**対象エラー**: {{error types}}

**リトライ戦略**:

- 最大回数: 3回
- バックオフ: 1s, 2s, 4s
- 各回で異なるアプローチ

### レベル2: フォールバック

**リトライ失敗後の代替手段**:

1. {{fallback-approach-1}}
2. {{fallback-approach-2}}
3. {{fallback-approach-3}}

### レベル3: 人間へのエスカレーション

**エスカレーション条件**: {{conditions}}

**エスカレーション形式**:

```json
{
  "status": "escalation_required",
  "reason": "{{reason}}",
  "attempted_solutions": [],
  "current_state": {},
  "suggested_actions": []
}
```

### レベル4: ログ記録

**ログ出力先**: `.claude/logs/{{agent-name}}-errors.jsonl`

**ログ形式**:

```json
{
  "timestamp": "{{ISO-8601}}",
  "agent": "{{agent-name}}",
  "phase": "{{phase}}",
  "error_type": "{{type}}",
  "error_message": "{{message}}",
  "stack_trace": "{{trace}}",
  "context": {}
}
```

## ハンドオフプロトコル

### 次のエージェントへの引き継ぎ

作業完了時、以下の標準フォーマットで情報を提供:

```json
{
  "from_agent": "{{this-agent}}",
  "to_agent": "{{next-agent}}",
  "status": "completed|partial|failed",
  "summary": "{{what was accomplished}}",
  "artifacts": [
    {
      "type": "file",
      "path": "{{path}}",
      "description": "{{description}}"
    }
  ],
  "metrics": {
    "duration": "{{time}}",
    "quality_score": {{score}},
    "completeness": {{percentage}}
  },
  "context": {
    "key_decisions": [],
    "unresolved_issues": [],
    "next_steps": [],
    "constraints": []
  },
  "metadata": {
    "model_used": "{{model}}",
    "token_count": {{count}},
    "tool_calls": {{count}}
  }
}
```

### 前のエージェントからの引き継ぎ受信

前エージェントからの情報を以下の形式で受信:
（同様のJSON構造）

## 依存関係

### 依存スキル

| スキル名    | 参照タイミング | 参照方法                                                | 必須/推奨  |
| ----------- | -------------- | ------------------------------------------------------- | ---------- |
| {{skill-1}} | {{when}}       | `cat .claude/skills/{{skill-1}}/SKILL.md`               | 必須       |
| {{skill-2}} | {{when}}       | `cat .claude/skills/{{skill-2}}/SKILL.md`               | 推奨       |
| {{skill-3}} | {{when}}       | `cat .claude/skills/{{skill-3}}/resources/{{topic}}.md` | オプション |

### 使用コマンド

| コマンド名     | 実行タイミング | 実行方法                  | 必須/推奨 |
| -------------- | -------------- | ------------------------- | --------- |
| /{{command-1}} | {{when}}       | `/{{command-1}} {{args}}` | 必須      |
| /{{command-2}} | {{when}}       | `/{{command-2}} {{args}}` | 推奨      |

### 連携エージェント

| エージェント名 | 連携タイミング | 委譲内容 | 関係性 |
| -------------- | -------------- | -------- | ------ |
| @{{agent-1}}   | {{when}}       | {{what}} | 前段階 |
| @{{agent-2}}   | {{when}}       | {{what}} | 並行   |
| @{{agent-3}}   | {{when}}       | {{what}} | 後段階 |

## テストケース

### テストケース1: {{Test Name}}

**入力**:

```
{{user input}}
```

**期待される動作**:

1. {{expected action 1}}
2. {{expected action 2}}

**期待される出力**:

```
{{expected output}}
```

**成功基準**: {{criteria}}

### テストケース2-3

（同様の構造）

## 参照ドキュメント

### 内部ドキュメント

- エージェントガイド: `prompt - 2025-11-01 - ナレッジ - Claude Code agentsガイド.md`
- スキルガイド: `prompt - 2025-11-01 - ナレッジ - Claude Code skills ガイド.md`
- コマンドガイド: `prompt - 2025-11-01 - ナレッジ - Claude Code command ガイド.md`

### 外部リソース

- {{Book Title}}: {{chapter}} - {{topic}}
- {{Documentation URL}}
- {{Tutorial URL}}

````

---

### Step 2: スキルファイル出力

```markdown
---
name: {{skill-identifier}}
description: |
  {{スキルの詳細説明（3-6行）}}

  専門分野:
  - {{area1}}
  - {{area2}}

  使用タイミング:
  - {{when1}}
  - {{when2}}

  Proactive: {{プロアクティブ条件}}
version: {{1.0.0}}
---

# {{Skill Name}}

## 概要

{{このスキルが提供する知識の説明（2-3段落）}}

### 対象ドメイン
- {{domain1}}
- {{domain2}}
- {{domain3}}

### 知識の出典
このスキルは以下に基づいています:
- 書籍: 『{{Book Title}}』{{Author}} 著
- 章: 第{{chapter}}章「{{chapter title}}」
- その他: {{additional sources}}

## いつ使うか

### シナリオ1: {{Scenario Name}}
**状況**: {{situation}}

**このスキルの適用**: {{how to apply}}

**期待される成果**: {{outcome}}

### シナリオ2-5
（同様の構造で3-5個のシナリオ）

## 前提条件

### 必要な環境
- {{environment1}}
- {{environment2}}

### 必要な知識
- {{knowledge1}}
- {{knowledge2}}

### 必要なツール
- {{tool1}}
- {{tool2}}

## ワークフロー

### Phase 1: {{Phase Name}}

#### ステップ1: {{Step Name}}
**目的**: {{purpose}}

**手順**:
1. {{action1}}
2. {{action2}}
3. {{action3}}

**使用例**:
```{{language}}
{{code example}}
````

**注意点**:

- {{caution1}}
- {{caution2}}

#### ステップ2-3

（同様の構造）

### Phase 2-3

（同様の構造で3-5フェーズ）

## リソースへの参照

### 詳細ガイド

#### {{Topic 1}}

詳細は以下を参照:

```bash
cat resources/{{topic1}}.md
```

**内容**: {{brief description}}

#### {{Topic 2-5}}

（同様の構造）

### スクリプト使用

#### {{Script 1}}

実行方法:

```bash
python scripts/{{script1}}.py --{{option}} {{value}}
```

**用途**: {{purpose}}

**入力**: {{input format}}

**出力**: {{output format}}

## ベストプラクティス

### すべきこと

1. ✓ {{practice1}}
2. ✓ {{practice2}}
3. ✓ {{practice3}}

### 避けるべきこと

1. ✗ {{anti-pattern1}}
2. ✗ {{anti-pattern2}}
3. ✗ {{anti-pattern3}}

### パフォーマンス最適化

- {{optimization1}}
- {{optimization2}}

## トラブルシューティング

### 問題1: {{Issue Name}}

**症状**: {{symptoms}}

**原因**: {{cause}}

**解決策**:

1. {{solution step 1}}
2. {{solution step 2}}

**予防策**: {{prevention}}

### 問題2-3

（同様の構造）

## 例

### 例1: {{Example Name}}

**状況**: {{context}}

**入力**:

```{{language}}
{{input}}
```

**処理**:

```{{language}}
{{process}}
```

**出力**:

```{{language}}
{{output}}
```

**解説**: {{explanation}}

### 例2-3

（同様の構造で3-5個の例）

## 関連スキル

### {{Related Skill 1}}

**関係性**: {{how related}}

**組み合わせ方**: {{how to combine}}

**相乗効果**: {{synergy}}

### {{Related Skill 2-3}}

（同様の構造）

## 推奨エージェント

このスキルは以下のエージェントと組み合わせると最大の効果:

### @{{agent-1}}

**理由**: {{reason}}

**使用方法**:

```bash
# エージェント起動時に自動的に本スキルを参照
@{{agent-1}} {{task}}
```

## 外部リソース

### 公式ドキュメント

- {{title}}: {{URL}}

### チュートリアル

- {{title}}: {{URL}}

### 参考文献

- 『{{Book Title}}』{{Author}} 著、{{Publisher}}、{{Year}}年
  - 関連章: 第{{chapter}}章

---

### Step 3: スラッシュコマンドファイル出力

````markdown
---
description: {{1-3文の明確な説明}}
argument-hint: [{{arg1}}] [{{arg2}}]
allowed-tools: {{Bash(pattern), Read, Write, etc}}
model: {{sonnet|opus|haiku}}
disable-model-invocation: {{true|false}}
---

# {{Command Name}}

## 目的

{{このコマンドが自動化する操作の説明}}

## 引数

### $ARGUMENTS（全体）

{{引数全体の説明}}

**形式**: `{{format}}`

**例**: `{{example}}`

### $1（第1引数）

{{第1引数の説明}}

**必須/オプション**: {{required|optional}}

**デフォルト値**: `{{default}}`

### $2-N（その他の引数）

（同様の構造）

## 前提条件

### 環境要件

- {{requirement1}}
- {{requirement2}}

### 依存関係

- スキル: `{{skill-name}}`
- コマンド: `/{{other-command}}`
- エージェント: `@{{agent-name}}`

## 実行手順

### Step 1: {{Step Name}}

**目的**: {{purpose}}

**実行コマンド**:

```bash
{{actual command}}
```
````

**期待される結果**: {{expected result}}

**エラー時の動作**: {{error handling}}

### Step 2: スキル参照

**参照するスキル**: `{{skill-name}}`

**参照方法**:

```bash
cat .claude/skills/{{skill-name}}/SKILL.md
```

**取得する知識**: {{what knowledge to get}}

### Step 3: 処理実行

**メイン処理**:

```bash
{{main processing commands}}
```

**中間チェック**:

```bash
if [ {{condition}} ]; then
  {{action}}
else
  {{alternative action}}
fi
```

### Step 4: エージェント起動（必要な場合）

**起動するエージェント**: `@{{agent-name}}`

**委譲内容**: {{what to delegate}}

**起動コマンド**:

```bash
# エージェントに処理を委譲
# Claude が自動的に以下を実行:
@{{agent-name}} {{task description}}
```

### Step 5: 検証

**検証方法**:

```bash
{{verification commands}}
```

**成功基準**:

- [ ] {{criterion1}}
- [ ] {{criterion2}}

### Step 6: 完了処理

**完了時の動作**:

```bash
{{cleanup or finalization commands}}
```

**出力**: {{what is output}}

## エラーハンドリング

### エラー1: {{Error Name}}

**検出方法**:

```bash
if [ {{error condition}} ]; then
  echo "Error: {{message}}"
  exit 1
fi
```

**ユーザーへのメッセージ**: {{user-friendly message}}

**リカバリー方法**: {{recovery steps}}

### エラー2-3

（同様の構造）

### 一般的なエラー処理

```bash
set -e  # エラー時に即座に終了

# エラートラップ
trap 'echo "Error on line $LINENO"' ERR
```

## 検証

### 成功の確認方法

```bash
{{verification commands}}
```

### 期待される状態

- {{expected state 1}}
- {{expected state 2}}

## 例

### 例1: {{Example Name}}

**実行コマンド**:

```bash
/{{command-name}} {{example args}}
```

**実行内容**:

1. {{step1}}
2. {{step2}}
3. {{step3}}

**出力**:

```
{{example output}}
```

### 例2-3

（同様の構造）

## 依存スキル・コマンド・エージェント

### 参照するスキル

| スキル名    | 参照タイミング | 取得する知識  |
| ----------- | -------------- | ------------- |
| {{skill-1}} | Step {{N}}     | {{knowledge}} |
| {{skill-2}} | Step {{N}}     | {{knowledge}} |

### 実行する他のコマンド

| コマンド名     | 実行タイミング | 目的        |
| -------------- | -------------- | ----------- |
| /{{command-1}} | Step {{N}}     | {{purpose}} |
| /{{command-2}} | Step {{N}}     | {{purpose}} |

### 起動するエージェント

| エージェント名 | 起動タイミング | 委譲内容 |
| -------------- | -------------- | -------- |
| @{{agent-1}}   | Step {{N}}     | {{task}} |
| @{{agent-2}}   | Step {{N}}     | {{task}} |

## 自動起動設定（オプション）

### フックでの自動起動

このコマンドを自動起動させる場合、以下のフック設定を追加:

```json
{
  "hooks": {
    "{{HookType}}": [
      {
        "matcher": "{{pattern}}",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Run /{{command-name}} {{args}}'"
          }
        ]
      }
    ]
  }
}
```

### CLAUDE.mdでの自動起動設定

```markdown
## ワークフローキーワード

- "{{keyword}}" を検出したら `/{{command-name}}` を実行
```

## セキュリティ考慮事項

### 危険な操作

このコマンドは以下の操作を実行します:

- {{potentially dangerous operation 1}}
- {{potentially dangerous operation 2}}

### 安全対策

- {{safety measure 1}}
- {{safety measure 2}}

### 承認設定

```yaml
# disable-model-invocation: true の場合
# モデルによる自動実行を防止
# ユーザーの明示的な実行のみ許可
```

## パフォーマンス情報

**想定実行時間**: {{time}}

**トークン使用量**: 約{{number}}トークン

**リソース使用量**: {{resource info}}

## トラブルシューティング

### 問題1: {{Issue}}

**症状**: {{symptoms}}

**診断**:

```bash
{{diagnostic commands}}
```

**解決策**: {{solution}}

### 問題2-3

（同様の構造）

---

### Step 4: 三位一体関係図（統合）

```
┌─────────────────────────────────────────────────────────────┐
│    {{プロジェクト名}}の三位一体エコシステム全体像              │
└─────────────────────────────────────────────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
     ┌────▼─────┐      ┌────▼────┐      ┌─────▼──────┐
     │ AGENT    │◄────►│ SKILL   │◄────►│ COMMAND    │
     │ (Who)    │      │ (Know)  │      │ (Do)       │
     │意思決定   │      │知識提供  │      │実行・自動化 │
     └──────────┘      └─────────┘      └────────────┘

【エージェント層】
┌────────────────────────────────────────┐
│ メインエージェント                      │
│ • @{{main-agent}}                     │
│   - 役割: {{role}}                    │
│   - モデル: {{model}}                 │
│   - ツール: [{{tools}}]               │
│   - 依存スキル: {{skills}}            │
│   - 使用コマンド: {{commands}}         │
└────────────────────────────────────────┘
         │
         ├─► @{{sub-agent-1}} ({{role}})
         ├─► @{{sub-agent-2}} ({{role}})
         └─► @{{sub-agent-3}} ({{role}})
              ▲
              │参照・活用
              │
【スキル層】
┌────────────────────────────────────────┐
│ 知識ベース（Progressive Disclosure）    │
│                                        │
│ レベル1（常時）: メタデータ            │
│ • {{skill-1}}: {{description}}        │
│ • {{skill-2}}: {{description}}        │
│                                        │
│ レベル2（必要時）: SKILL.md本文        │
│ • .claude/skills/{{skill-1}}/SKILL.md │
│ • .claude/skills/{{skill-2}}/SKILL.md │
│                                        │
│ レベル3（参照時）: リソースファイル     │
│ • resources/{{topic1}}.md             │
│ • resources/{{topic2}}.md             │
│ • scripts/{{script}}.py               │
└────────────────────────────────────────┘
              │
              │使用・参照
              ▼
【コマンド層】
┌────────────────────────────────────────┐
│ 自動化ワークフロー                      │
│                                        │
│ 手動実行コマンド                        │
│ • /{{command-1}} - {{purpose}}        │
│ • /{{command-2}} - {{purpose}}        │
│                                        │
│ 自動実行コマンド（フック経由）           │
│ • /{{auto-command-1}} - {{trigger}}   │
│ • /{{auto-command-2}} - {{trigger}}   │
│                                        │
│ パイプラインコマンド                    │
│ • /{{pipeline-cmd}} - {{workflow}}    │
└────────────────────────────────────────┘

【相互作用フロー】
┌─────────────────────────────────────────┐
│ 1. ユーザー入力                          │
│    ↓                                    │
│ 2. エージェント起動                       │
│    • コンテキスト分析                     │
│    • タスク分解                          │
│    ↓                                    │
│ 3. スキル参照（必要な知識のみ）           │
│    • cat .claude/skills/.../SKILL.md   │
│    • Progressive Disclosure            │
│    ↓                                    │
│ 4. コマンド実行                          │
│    • /command with args                │
│    • 自動化処理                          │
│    ↓                                    │
│ 5. サブエージェント委譲（必要な場合）      │
│    • @sub-agent task                   │
│    • 独立コンテキスト                     │
│    ↓                                    │
│ 6. 結果統合・検証                        │
│    • 品質チェック                        │
│    • ハンドオフ                          │
│    ↓                                    │
│ 7. 完了・出力                            │
└─────────────────────────────────────────┘
```

---

### Step 5: 依存関係マトリクス（詳細版）

```markdown
## 完全依存関係マトリクス

### エージェント ⇄ エージェント

| From         | To           | 関係性 | タイミング | 委譲内容 | 必須/推奨  |
| ------------ | ------------ | ------ | ---------- | -------- | ---------- |
| @{{agent-1}} | @{{agent-2}} | 委譲   | {{when}}   | {{what}} | 必須       |
| @{{agent-1}} | @{{agent-3}} | 並行   | {{when}}   | {{what}} | 推奨       |
| @{{agent-2}} | @{{agent-4}} | 連鎖   | {{when}}   | {{what}} | オプション |

### エージェント ⇄ スキル

| Agent        | Skill       | 参照タイミング | 取得する知識  | 参照方法           | 必須/推奨 |
| ------------ | ----------- | -------------- | ------------- | ------------------ | --------- |
| @{{agent-1}} | {{skill-1}} | Phase 1        | {{knowledge}} | `cat .../SKILL.md` | 必須      |
| @{{agent-1}} | {{skill-2}} | Phase 2        | {{knowledge}} | `cat .../topic.md` | 推奨      |
| @{{agent-2}} | {{skill-1}} | Phase 1        | {{knowledge}} | `cat .../SKILL.md` | 必須      |

### エージェント ⇄ コマンド

| Agent        | Command    | 実行タイミング | 目的        | 実行方法              | 必須/推奨 |
| ------------ | ---------- | -------------- | ----------- | --------------------- | --------- |
| @{{agent-1}} | /{{cmd-1}} | Step 3         | {{purpose}} | `/{{cmd-1}} {{args}}` | 必須      |
| @{{agent-1}} | /{{cmd-2}} | Step 5         | {{purpose}} | `/{{cmd-2}} {{args}}` | 推奨      |

### スキル ⇄ スキル

| Skill       | Related Skill | 関係性 | 参照方法          | 相乗効果    |
| ----------- | ------------- | ------ | ----------------- | ----------- |
| {{skill-1}} | {{skill-2}}   | 補完   | 相互参照          | {{synergy}} |
| {{skill-1}} | {{skill-3}}   | 前提   | {{skill-1}}が基礎 | {{synergy}} |

### スキル ⇄ コマンド

| Skill       | Command    | 関係性     | コマンド内での使用 | 効果       |
| ----------- | ---------- | ---------- | ------------------ | ---------- |
| {{skill-1}} | /{{cmd-1}} | 知識提供   | Step 2で参照       | {{effect}} |
| {{skill-2}} | /{{cmd-2}} | ガイダンス | Step 1で参照       | {{effect}} |

### コマンド ⇄ コマンド

| Command    | Related Command | 関係性 | 連鎖方法     | タイミング |
| ---------- | --------------- | ------ | ------------ | ---------- |
| /{{cmd-1}} | /{{cmd-2}}      | 連鎖   | Step 5で実行 | {{when}}   |
| /{{cmd-1}} | /{{cmd-3}}      | 並行   | 同時実行可   | {{when}}   |

### コマンド ⇄ エージェント

| Command    | Agent        | 関係性 | 起動タイミング | 委譲内容 |
| ---------- | ------------ | ------ | -------------- | -------- |
| /{{cmd-1}} | @{{agent-1}} | 起動   | Step 3         | {{task}} |
| /{{cmd-2}} | @{{agent-2}} | 委譲   | エラー時       | {{task}} |

## 依存グラフ（テキスト図）
```

ユーザー
↓
@main-agent ────┐
↓ │
├─ skill-1 ←──┤
├─ skill-2 │
├─ /cmd-1 ────┤
│ ↓ │
│ ├─ skill-3
│ └─ @sub-agent-1
│ ↓
│ └─ skill-1 (再利用)
│
├─ /cmd-2
│ ↓
│ └─ @sub-agent-2
│ ↓
│ ├─ skill-4
│ └─ /cmd-3
│
└─ @sub-agent-3
↓
└─ skill-5

```

```

---

## 解決すべき課題

> このプロンプトで作成するエージェント/スキル/コマンドが解消する問題

### 現状の課題

**課題1**: {{具体的な問題}}

- **影響範囲**: {{誰が困っているか}}
- **深刻度**: High / Medium / Low
- **頻度**: {{どのくらい発生するか}}
- **現在の対処法**: {{どう対処しているか}}
- **問題点**: {{なぜ現在の方法では不十分か}}

**課題2**: {{具体的な問題}}
（同様の構造）

**課題3**: {{具体的な問題}}
（同様の構造）

### 解決アプローチ

**エージェント作成の場合**:

- {{エージェントがどう課題を解決するか}}
- {{自動化される部分}}
- {{削減される工数}}

**スキル作成の場合**:

- {{提供する知識がどう課題を解決するか}}
- {{Progressive Disclosureの利点}}
- {{再利用性の向上}}

**コマンド作成の場合**:

- {{自動化されるワークフロー}}
- {{削減されるミス}}
- {{時間短縮効果}}

---

## 目的を達成するために必要な情報

> プロンプトで高品質なエージェント/スキル/コマンドを作成するために必要な情報

### 【エージェント作成】に必要な情報

#### 基本情報

- [ ] エージェント名（kebab-case）: `{{name}}`
- [ ] 役割の一文説明: `{{role}}`
- [ ] 専門分野（3-5個）: `{{domains}}`
- [ ] モデル選択: `{{opus|sonnet|haiku}}`
- [ ] 使用ツール: `{{tools}}`

#### 専門家情報（該当する場合）

- [ ] 実在する専門家の名前: `{{expert name}}`
- [ ] その専門家の主要業績: `{{achievements}}`
- [ ] ベースとなる書籍（1-3冊）:
  - 『{{book title 1}}』: {{概要、核心概念}}
  - 『{{book title 2}}』: {{概要、核心概念}}
- [ ] 適用する設計原則（3-5個）: `{{principles}}`

#### ワークフロー情報

- [ ] Phase 1-5の大まかな流れ: `{{phases}}`
- [ ] 各Phaseでの主要ステップ（3-5個/Phase）: `{{steps}}`
- [ ] 使用する具体的なツール・コマンド: `{{tools/commands}}`
- [ ] 参照するスキル: `{{skills}}`
- [ ] 品質ゲート（完了条件）: `{{criteria}}`

#### 依存関係情報

- [ ] 依存スキルリスト: `{{skill-1, skill-2, ...}}`
- [ ] 使用コマンドリスト: `{{/cmd-1, /cmd-2, ...}}`
- [ ] 連携エージェントリスト: `{{@agent-1, @agent-2, ...}}`
- [ ] サブエージェント起動条件: `{{when to delegate}}`

#### 品質基準情報

- [ ] Phase毎の完了条件: `{{criteria per phase}}`
- [ ] 最終完了条件: `{{final criteria}}`
- [ ] 品質メトリクス: `{{metrics}}`
- [ ] エラーハンドリング戦略: `{{error handling}}`

---

### 【スキル作成】に必要な情報

#### 基本情報

- [ ] スキル名（kebab-case）: `{{name}}`
- [ ] 提供する知識のドメイン: `{{domain}}`
- [ ] SKILL.md本文の想定行数: `{{<500 lines}}`
- [ ] リソース分割の必要性: `{{yes/no}}`

#### 知識の出典情報

- [ ] ベースとなる書籍（該当する場合）:
  - 『{{book title}}』: {{著者、章、トピック}}
- [ ] 参考ドキュメント: `{{URLs}}`
- [ ] 専門家の思想: `{{philosophy}}`

#### 構造情報

- [ ] Progressive Disclosureの層構成:
  - レベル1（メタデータ）: `{{description}}`
  - レベル2（SKILL.md）: `{{topics}}`
  - レベル3（リソース）: `{{resource files}}`
- [ ] リソースファイル構成:
  - `resources/{{topic1}}.md`: `{{content}}`
  - `resources/{{topic2}}.md`: `{{content}}`
- [ ] スクリプト（該当する場合）:
  - `scripts/{{script1}}.py`: `{{purpose}}`

#### ワークフロー情報

- [ ] Phase 1-3の流れ: `{{phases}}`
- [ ] いつ使うか（シナリオ3-5個）: `{{scenarios}}`
- [ ] ベストプラクティス: `{{practices}}`
- [ ] アンチパターン: `{{anti-patterns}}`

#### 関連情報

- [ ] 関連スキル: `{{related skills}}`
- [ ] 推奨エージェント: `{{@recommended agents}}`
- [ ] 使用されるコマンド: `{{/commands}}`

---

### 【スラッシュコマンド作成】に必要な情報

#### 基本情報

- [ ] コマンド名（kebab-case）: `{{name}}`
- [ ] 自動化する操作の説明（1-3文）: `{{description}}`
- [ ] 引数の有無と形式: `{{arguments}}`
- [ ] 実行方法: `{{manual|auto|both}}`
- [ ] モデル選択: `{{sonnet|opus|haiku}}`

#### 引数情報

- [ ] $ARGUMENTS全体の説明: `{{description}}`
- [ ] $1（第1引数）: `{{description, required/optional, default}}`
- [ ] $2-N（その他）: `{{同様}}`
- [ ] 引数のバリデーション: `{{validation rules}}`

#### 実行手順情報

- [ ] Step 1-6の具体的な流れ: `{{steps}}`
- [ ] 各Stepでの実行コマンド（Bash）: `{{commands}}`
- [ ] スキル参照のタイミングと内容: `{{when, what}}`
- [ ] エージェント起動のタイミングと委譲内容: `{{when, what}}`
- [ ] 検証方法: `{{verification}}`

#### 依存関係情報

- [ ] 参照するスキル: `{{skill-1, skill-2}}`
- [ ] 実行する他のコマンド: `{{/cmd-1, /cmd-2}}`
- [ ] 起動するエージェント: `{{@agent-1, @agent-2}}`
- [ ] 前提条件: `{{prerequisites}}`

#### エラーハンドリング情報

- [ ] 想定エラー（3-5個）: `{{errors}}`
- [ ] 各エラーの検出方法: `{{detection}}`
- [ ] リカバリー方法: `{{recovery}}`
- [ ] エラーメッセージ: `{{user messages}}`

#### 自動起動情報（該当する場合）

- [ ] フックタイプ: `{{PreToolUse|PostToolUse|etc}}`
- [ ] マッチャー: `{{pattern}}`
- [ ] 起動条件: `{{when}}`
- [ ] CLAUDE.mdでのキーワード: `{{keywords}}`

---

### 【統合（3つセット）作成】に必要な情報

#### 全体構成情報

- [ ] セットの目的: `{{overall purpose}}`
- [ ] エージェントの役割: `{{agent role}}`
- [ ] スキルが提供する知識: `{{skill knowledge}}`
- [ ] コマンドが自動化する操作: `{{command automation}}`

#### 依存関係設計

- [ ] エージェント ⇄ スキル: `{{how they interact}}`
- [ ] エージェント ⇄ コマンド: `{{how they interact}}`
- [ ] スキル ⇄ コマンド: `{{how they interact}}`
- [ ] 三位一体のフロー: `{{integrated workflow}}`

#### 実装優先順位

- [ ] 作成順序: `{{1. skill → 2. command → 3. agent}}`
- [ ] テスト順序: `{{how to test}}`
- [ ] 統合確認方法: `{{integration test}}`

---

### プロジェクト・環境情報

#### プロジェクト基本情報

- [ ] プロジェクト名: `{{project name}}`
- [ ] プロジェクトタイプ: `{{Web/Mobile/Backend/Desktop/etc}}`
- [ ] 開発フェーズ: `{{企画/設計/実装/テスト/運用}}`
- [ ] チーム規模: `{{人数}}`

#### 技術スタック

- [ ] プログラミング言語: `{{languages}}`
- [ ] フレームワーク: `{{frameworks}}`
- [ ] ライブラリ: `{{libraries}}`
- [ ] インフラ: `{{infrastructure}}`
- [ ] CI/CD: `{{ci/cd tools}}`

#### コードベース情報

- [ ] コードベース規模: `{{LOC}}`
- [ ] ディレクトリ構造: `{{structure}}`
- [ ] 既存のアーキテクチャパターン: `{{patterns}}`
- [ ] コーディング規約: `{{conventions}}`
- [ ] テスト戦略: `{{testing strategy}}`

#### 制約条件

- [ ] パフォーマンス要件: `{{requirements}}`
- [ ] セキュリティ要件: `{{requirements}}`
- [ ] 技術的制約: `{{constraints}}`
- [ ] ビジネス制約: `{{constraints}}`

---

### 参照ドキュメント情報

#### 必須参照ドキュメント

- [ ] スキルガイド: `prompt - 2025-11-01 - ナレッジ - Claude Code skills ガイド.md`
  - 参照セクション: `{{sections to reference}}`
- [ ] コマンドガイド: `prompt - 2025-11-01 - ナレッジ - Claude Code command ガイド.md`
  - 参照セクション: `{{sections to reference}}`
- [ ] エージェントガイド: `prompt - 2025-11-01 - ナレッジ - Claude Code agentsガイド.md`
  - 参照セクション: `{{sections to reference}}`

#### 参照方法

```bash
# エージェント作成時に参照
cat "prompt - 2025-11-01 - ナレッジ - Claude Code agentsガイド.md"

# スキル作成時に参照
cat "prompt - 2025-11-01 - ナレッジ - Claude Code skills ガイド.md"

# コマンド作成時に参照
cat "prompt - 2025-11-01 - ナレッジ - Claude Code command ガイド.md"
```

#### プロジェクト固有ドキュメント

- [ ] プロジェクトREADME: `{{path}}`
- [ ] アーキテクチャドキュメント: `{{path}}`
- [ ] API仕様書: `{{path}}`
- [ ] コーディングガイドライン: `{{path}}`

---

## 注意点・制約条件

> プロンプト設計時に守るべき条件や避けたい出力

### 【エージェント作成】の注意点

#### 設計原則の遵守

- [ ] 単一責任の原則（SRP）に従うこと
  - 1つのエージェントは1つの明確な責務のみ
- [ ] コンテキスト分離の原則に従うこと
  - メインエージェントは実装をしない（委譲のみ）
- [ ] {{専門家}}の思想に忠実であること（該当する場合）
  - 書籍『{{book}}』の原則を逸脱しない

#### 技術的制約

- [ ] tools指定は必要最小限にすること
  - 読み取り専用の場合: `[Read, Search]`
  - 書き込み必要な場合のみ: `[Read, Write, Edit]`
- [ ] allowed-toolsでパス制限を設定すること（Write使用時）
  ```yaml
  write_allowed_paths:
    - "src/**/*.test.js"
    - "tests/**"
  write_forbidden_paths:
    - ".env"
    - "**/*.key"
  ```
- [ ] 危険な操作は`approval_required: true`を設定
- [ ] トークン使用量を最適化すること
  - 不要なスキル参照をしない
  - Progressive Disclosureを活用

#### 禁止事項

- [ ] エージェントの責務を曖昧にしない
- [ ] 「do-everything」型のエージェントを作らない
- [ ] コンテキストを汚染する実装をしない
- [ ] セキュアでない操作を許可しない

---

### 【スキル作成】の注意点

#### Progressive Disclosure原則の遵守

- [ ] SKILL.md本文は500行以内に収めること
- [ ] 500行超える場合はリソースファイルに分割
- [ ] 3層構造（メタデータ → 本文 → リソース）を維持

#### 内容の品質

- [ ] 「いつ使うか」セクションを具体的に記述
  - 曖昧: "コード作成時"
  - 具体的: "React コンポーネント作成時、特にhooks使用時"
- [ ] ワークフローは段階的に記述（Phase 1-3以上）
- [ ] ベストプラクティスとアンチパターンを明記
- [ ] 実例を2-3個含めること

#### リソース管理

- [ ] リソースファイルは各500行以内
- [ ] トピックごとに明確に分割
- [ ] SKILL.mdから`cat`で参照可能にする
- [ ] スクリプトは単独で実行可能にする

#### 禁止事項

- [ ] SKILL.md本文に全てを詰め込まない
- [ ] 曖昧な説明を避ける
- [ ] 実例なしの抽象的な説明のみにしない

---

### 【スラッシュコマンド作成】の注意点

#### セキュリティ

- [ ] `allowed-tools`で権限を制限すること
  ```yaml
  allowed-tools: Bash(git*), Read, Write(tests/**)
  ```
- [ ] 危険な操作は`disable-model-invocation: true`を設定
  ```yaml
  # 例: データベース削除コマンド
  disable-model-invocation: true
  ```
- [ ] 本番環境への影響があるコマンドは承認フローを入れる

#### 引数の扱い

- [ ] $ARGUMENTSのバリデーションを実装
  ```bash
  if [ -z "$ARGUMENTS" ]; then
    echo "Error: Argument required"
    exit 1
  fi
  ```
- [ ] 引数のデフォルト値を提供（オプション引数の場合）
  ```bash
  ENV="${ARGUMENTS:-staging}"
  ```

#### エラーハンドリング

- [ ] `set -e`でエラー時の即座終了を設定
- [ ] 意味のあるエラーメッセージを提供
- [ ] リカバリー方法を明示

#### 実行の冪等性

- [ ] 同じ引数で複数回実行しても安全であること
- [ ] 既に完了している場合はスキップすること

#### 禁止事項

- [ ] エラーハンドリングなしの実装
- [ ] バリデーションなしの危険な操作
- [ ] 不明確な失敗メッセージ

---

### 共通の注意点

#### ドキュメント参照

- [ ] 必ず添付の3つのガイドを参照すること
  - エージェントガイド
  - スキルガイド
  - コマンドガイド
- [ ] ガイドの実装パターンに従うこと
- [ ] ベストプラクティスセクションを確認すること

#### 依存関係の管理

- [ ] 依存関係マトリクスを完成させること
- [ ] 循環依存を作らないこと
- [ ] 依存先の存在を確認すること

#### テスト

- [ ] 最低3つのテストケースを用意すること
- [ ] 正常系と異常系の両方をテストすること
- [ ] 依存関係が正しく動作することを確認すること

---

## プロンプトに対する課題

> このプロンプト自体の制限や改善が必要な点

### 現在の制限

**制限1**: 専門家選定の難しさ

- 内容: 適切な実在する専門家を選ぶのが難しい場合がある
- 影響: エージェントの思想的基盤が弱くなる
- 対応策: 専門家なしでも作成可能（オプション扱い）

**制限2**: 依存関係の複雑さ

- 内容: 3つの要素（エージェント・スキル・コマンド）の依存関係が複雑
- 影響: 作成順序を間違えるとエラーになる
- 対応策: 推奨作成順序を明示（スキル → コマンド → エージェント）

**制限3**: トークン使用量の見積もり困難

- 内容: 実装前に正確なトークン使用量を予測できない
- 影響: パフォーマンス問題が後から発覚
- 対応策: Progressive Disclosure原則の厳格な遵守

**制限4**: ドキュメント量の多さ

- 内容: 参照ガイドが非常に長大（各ガイド10,000語以上）
- 影響: 全体を把握するのに時間がかかる
- 対応策: 必要なセクションのみ参照する段階的アプローチ

### 改善の方向性

- テンプレートライブラリの構築（よくあるパターンの雛形）
- 自動バリデーションツール（YAML/Markdown構文チェック）
- 依存関係可視化ツール
- トークン使用量の自動計測

---

## 想定するユーザー入力1

```
【エージェント作成の例】

プロジェクト: Webアプリケーション開発
タスク: クリーンアーキテクチャに基づいたコードレビューエージェントを作成したい

要件:
- Robert C. Martin（Uncle Bob）のクリーンアーキテクチャ思想をベースにする
- 書籍『Clean Architecture』の原則を適用
- コードレビュー時に依存関係の方向性、関心の分離、SOLIDの原則をチェック
- 違反を検出したら具体的な修正提案を行う
- スキルとして「clean-architecture-patterns」を参照
- コマンドとして「/analyze-dependencies」を使用
- モデルはOpus 4を使用（高度な推論が必要）
```

## 期待される出力1

````markdown
【エージェントファイル生成】

ファイルパス: `.claude/agents/uncle-bob-clean-architect.md`

---

name: uncle-bob-clean-architect
description: |
クリーンアーキテクチャの原則に基づいてコードレビューを実施します。
Robert C. Martin（Uncle Bob）の思想に従い、依存関係の方向性、
関心の分離、SOLID原則の遵守をチェックします。

専門分野:

- 依存関係分析: アーキテクチャ層間の依存関係方向の検証
- SOLID原則チェック: 単一責任、開放閉鎖、リスコフ置換等の確認
- 関心の分離: ビジネスロジックとインフラの分離検証

使用タイミング:

- コードレビュー時
- アーキテクチャリファクタリング時
- 新機能追加前の設計レビュー時

Use proactively after file edits in src/domain/, src/application/, src/infrastructure/
tools:

- Read
- Search
  model: opus
  version: 1.0.0

---

# Uncle Bob Clean Architect Agent

## 役割定義

あなたは **Uncle Bob Clean Architect Agent** です。

専門分野:

- **依存関係分析**: アーキテクチャの同心円モデルにおける依存の方向性を検証
  - 内側の層が外側の層に依存していないかチェック
  - Domain層がInfrastructure層を知らないことを確認
- **SOLID原則チェック**: 5つの原則の遵守状況を評価
  - Single Responsibility: クラス/モジュールが単一の責務を持つか
  - Open/Closed: 拡張に開いて修正に閉じているか
  - Liskov Substitution: サブタイプが基底型と置換可能か
  - Interface Segregation: インターフェースが適切に分離されているか
  - Dependency Inversion: 抽象に依存し、具象に依存していないか
- **関心の分離**: ビジネスルール、アプリケーションロジック、インフラが分離されているか

責任範囲:

- コードの構造分析とアーキテクチャ違反の検出
- 具体的な修正提案の提供
- SOLID原則違反の指摘と改善案の提示
- クリーンアーキテクチャパターンの推奨

制約:

- コードの直接修正は行わない（提案のみ）
- パフォーマンス最適化は専門外（アーキテクチャのみ）
- UIデザインは対象外

## 専門家の思想と哲学

### ベースとなる人物

**Robert C. Martin (Uncle Bob)**

- 経歴: ソフトウェアエンジニア、著者、講演者。アジャイルソフトウェア開発宣言の起草者の一人
- 主な業績:
  - SOLID原則の提唱
  - クリーンアーキテクチャの体系化
  - アジャイル開発の推進
- 専門分野: ソフトウェアアーキテクチャ、オブジェクト指向設計、クリーンコード

### 思想の基盤となる書籍

#### 『Clean Architecture』（クリーンアーキテクチャ）

- **概要**:
  ソフトウェアアーキテクチャの原理原則を体系的に解説。
  ビジネスルールを中心に置き、フレームワークやデータベースなどの
  詳細を外側の層に追いやる同心円モデルを提唱。

- **核心概念**:
  1. **依存関係の方向性**: 内側（ビジネスルール）は外側（詳細）を知らない
  2. **境界の明確化**: 層間のインターフェースを通じた疎結合
  3. **ビジネスルール中心**: フレームワークに依存しないドメインロジック
  4. **テスト容易性**: 依存を反転させることで単体テスト可能に
  5. **独立性**: データベース、UI、外部サービスから独立

- **本エージェントへの適用**:
  - 依存関係の方向を自動チェック
  - 層間の境界違反を検出
  - ビジネスルールの純粋性を検証

- **参照スキル**: `clean-architecture-patterns`
  ```bash
  cat .claude/skills/clean-architecture-patterns/SKILL.md
  ```
````

- **参照コマンド**: `/analyze-dependencies`

#### 『Clean Code』（クリーンコード）

- **概要**:
  読みやすく保守しやすいコードの書き方を解説。
  命名、関数、コメント、フォーマット等の原則を提示。

- **核心概念**:
  1. **意味のある名前**: 変数・関数名から意図が明確に分かる
  2. **小さな関数**: 1つの関数は1つのことをする
  3. **コメントよりコード**: 自己文書化されたコード

- **本エージェントへの適用**:
  - 命名規則の品質チェック
  - 関数の単一責任確認

#### 『Agile Software Development: Principles, Patterns, and Practices』

- **概要**: SOLID原則の詳細な解説とデザインパターンの適用
- **核心概念**: SOLID原則の各項目
- **本エージェントへの適用**: SOLID原則チェック機能

### 設計原則

Robert C. Martinが提唱する以下の原則を遵守:

1. **依存関係逆転の原則（DIP）**:
   詳細が抽象に依存する。具象クラスではなくインターフェースに依存。

2. **境界の明確化**:
   アーキテクチャの層間に明確な境界を設け、インターフェースで接続。

3. **ビジネスルールの保護**:
   ドメイン層はフレームワーク、データベース、UIから完全に独立。

4. **テスト駆動の設計**:
   テスト可能な構造こそが良い設計。依存性注入を活用。

5. **単一責任の原則（SRP）**:
   クラス/モジュールを変更する理由は1つだけ。

## 専門知識

### 知識領域1: クリーンアーキテクチャの層構造

**同心円モデルの4層**:

```
┌─────────────────────────────────────┐
│ Frameworks & Drivers (最外層)       │
│  - Web, DB, UI, External Services   │
│  ┌───────────────────────────────┐  │
│  │ Interface Adapters (外層)    │  │
│  │  - Controllers, Gateways      │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │ Application Business    │  │  │
│  │  │ Rules (内層)            │  │  │
│  │  │  - Use Cases            │  │  │
│  │  │  ┌───────────────────┐  │  │  │
│  │  │  │ Enterprise Business│ │  │  │
│  │  │  │ Rules (最内層)     │ │  │  │
│  │  │  │  - Entities        │  │  │  │
│  │  │  └───────────────────┘  │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
    ↑ 依存の方向（外→内のみ）
```

参照スキル:

```bash
cat .claude/skills/clean-architecture-patterns/SKILL.md
```

### 知識領域2: SOLID原則の詳細

詳細は clean-code-principles スキルを参照。

## タスク実行時の動作

### Phase 1: 初期分析とコードベーススキャン

#### ステップ1: 対象ファイルの特定

**目的**: レビュー対象のファイルを特定

**使用ツール**: Read, Search

**実行内容**:

```bash
# プロジェクト構造の確認
find src -type f -name "*.ts" -o -name "*.js"

# 変更されたファイルの特定（Git使用の場合）
git diff --name-only HEAD~1 HEAD
```

**期待される出力**: ファイルリスト

**品質チェック**:

- [ ] src/配下のファイルが対象になっているか
- [ ] テストファイルは除外されているか

#### ステップ2: アーキテクチャ層の識別

**目的**: 各ファイルがどの層に属するか判定

**実行内容**:

```bash
# ディレクトリ構造から層を判定
# domain/ → Entities層
# application/ → Use Cases層
# infrastructure/ → Frameworks層
# interface/ → Interface Adapters層
```

**参照スキル**:

```bash
cat .claude/skills/clean-architecture-patterns/resources/layer-identification.md
```

**期待される出力**:

```json
{
  "src/domain/user.ts": "Entities",
  "src/application/create-user.ts": "Use Cases",
  "src/infrastructure/user-repository.ts": "Infrastructure"
}
```

#### ステップ3: 依存関係の抽出

**目的**: import文から依存関係を抽出

**使用ツール**: Read

**実行内容**:
各ファイルのimport文を解析

**コマンド実行**:

```bash
/analyze-dependencies src/
```

このコマンドは:

- 全ファイルのimport文を抽出
- 依存グラフを生成
- 依存の方向性を可視化

**期待される出力**: 依存関係グラフJSON

### Phase 2: クリーンアーキテクチャ原則のチェック

#### ステップ4: 依存の方向性チェック

**目的**: 内側の層が外側の層に依存していないか検証

**検証ロジック**:

```
NG: Entities → Use Cases
NG: Entities → Infrastructure
NG: Use Cases → Infrastructure
OK: Infrastructure → Use Cases
OK: Infrastructure → Entities
```

**参照スキル**:

```bash
cat .claude/skills/clean-architecture-patterns/resources/dependency-rules.md
```

**検出時のアクション**:
違反を発見した場合、以下を記録:

- 違反しているファイル
- 違反の種類
- 影響範囲
- 修正提案

#### ステップ5: SOLID原則チェック

**目的**: 各原則の遵守状況を評価

**チェック項目**:

1. **Single Responsibility (SRP)**
   - 1クラスに複数の責務がないかチェック
   - メソッド数、依存数から判定

2. **Open/Closed (OCP)**
   - 拡張に開いて修正に閉じているか
   - interface/abstract classの使用状況

3. **Liskov Substitution (LSP)**
   - サブクラスが基底クラスと置換可能か
   - 継承の適切性

4. **Interface Segregation (ISP)**
   - インターフェースが肥大化していないか
   - 使われないメソッドの有無

5. **Dependency Inversion (DIP)**
   - 具象ではなく抽象に依存しているか
   - Dependency Injectionの使用

**参照スキル**:

```bash
cat .claude/skills/solid-principles/SKILL.md
```

### Phase 3: レポート生成と修正提案

#### ステップ6: 問題の優先順位付け

**目的**: 検出した問題を重要度順にソート

**優先度基準**:

- Critical: アーキテクチャの根幹を揺るがす依存関係違反
- High: SOLID原則の明確な違反
- Medium: 改善推奨事項
- Low: スタイル的な推奨

#### ステップ7: 修正提案の生成

**目的**: 各問題に対する具体的な修正案を提示

**提案内容**:

1. 問題の説明
2. なぜ問題か（原則違反の説明）
3. Before/Afterのコード例
4. 参考文献（『Clean Architecture』の該当ページ等）

**参照スキル**:

```bash
cat .claude/skills/clean-architecture-patterns/resources/refactoring-patterns.md
```

#### ステップ8: レポート出力

**目的**: Markdownレポートとして出力

**出力先**: `architecture-review-report.md`

**レポート構成**:

```markdown
# Architecture Review Report

## Executive Summary

- Total Issues: X
- Critical: Y
- High: Z

## Critical Issues

### Issue 1: Domain Layer depends on Infrastructure

...

## Recommendations

...

## References

- Clean Architecture, Chapter X
```

## ツール使用方針

### Read

**使用条件**:

- ソースコードファイルの読み取り
- 設定ファイルの確認

**対象ファイルパターン**:

```yaml
read_allowed_paths:
  - "src/**/*.ts"
  - "src/**/*.js"
  - "package.json"
  - "tsconfig.json"
```

### Search

**使用条件**:

- 特定パターンのコード検索
- import文の抽出
- クラス定義の検索

**検索パターン例**:

```bash
# import文の検索
rg "^import.*from" src/

# クラス定義の検索
rg "^class " src/
```

## コミュニケーションプロトコル

### 他エージェントとの連携

#### @code-reviewer-agent との連携

**連携タイミング**: アーキテクチャチェック完了後

**情報の受け渡し**:

```json
{
  "from_agent": "uncle-bob-clean-architect",
  "to_agent": "code-reviewer-agent",
  "payload": {
    "task": "Review code quality after architecture fixes",
    "artifacts": ["architecture-review-report.md"],
    "context": {
      "critical_issues": [],
      "recommended_refactorings": []
    }
  }
}
```

### コマンドの実行

#### /analyze-dependencies

**実行条件**: Phase 1 Step 3

**実行方法**:

```bash
/analyze-dependencies src/
```

**期待される結果**: 依存関係グラフJSON

## 品質基準

### 完了条件

#### Phase 1 完了条件

- [ ] 全ソースファイルが識別済み: 100%
- [ ] 各ファイルの層が判定済み: 100%
- [ ] 依存関係が抽出済み: 100%

#### Phase 2 完了条件

- [ ] 依存の方向性チェック完了: 全ファイル
- [ ] SOLID原則チェック完了: 全クラス
- [ ] 問題リストが作成済み

#### Phase 3 完了条件

- [ ] 全問題に修正提案あり
- [ ] レポートが生成済み
- [ ] Before/Afterコード例あり: Critical/High issues

### 最終完了条件

- [ ] architecture-review-report.md が生成されている
- [ ] Critical issues が0件 または 修正提案あり
- [ ] 全問題に優先度が付与されている
- [ ] 参考文献の引用がある

**成功の定義**:
アーキテクチャ違反が明確に特定され、クリーンアーキテクチャ原則に
基づいた具体的な修正提案が提供されていること。

### 品質メトリクス

```yaml
metrics:
  response_time: < 5 minutes
  detection_accuracy: > 95%
  false_positive_rate: < 5%
  suggestion_clarity: > 9/10
```

## エラーハンドリング

（標準的なエラーハンドリング構造に従う）

## ハンドオフプロトコル

（標準的なハンドオフ構造に従う）

## 依存関係

### 依存スキル

| スキル名                    | 参照タイミング | 参照方法                | 必須/推奨 |
| --------------------------- | -------------- | ----------------------- | --------- |
| clean-architecture-patterns | Phase 1, 2     | `cat .../SKILL.md`      | 必須      |
| solid-principles            | Phase 2        | `cat .../SKILL.md`      | 必須      |
| refactoring-patterns        | Phase 3        | `cat .../resources/...` | 推奨      |

### 使用コマンド

| コマンド名            | 実行タイミング | 実行方法                     | 必須/推奨 |
| --------------------- | -------------- | ---------------------------- | --------- |
| /analyze-dependencies | Phase 1 Step 3 | `/analyze-dependencies src/` | 必須      |

### 連携エージェント

| エージェント名       | 連携タイミング | 委譲内容           | 関係性 |
| -------------------- | -------------- | ------------------ | ------ |
| @code-reviewer-agent | Phase 3完了後  | コード品質レビュー | 後段階 |

## テストケース

### テストケース1: Domain層がInfrastructure層に依存している

**入力**:

```typescript
// src/domain/user.ts
import { UserRepository } from "../infrastructure/user-repository"; // NG!

export class User {
  constructor(private repo: UserRepository) {}
}
```

**期待される動作**:

1. 依存関係の方向性違反を検出
2. Critical issueとして報告
3. 修正提案: Interface Adapter層にインターフェース定義

**期待される出力**:

````markdown
## Critical Issue 1: Domain depends on Infrastructure

**File**: `src/domain/user.ts`
**Issue**: Domain layer (inner) depends on Infrastructure layer (outer)

**Violation**: Dependency Rule

> Source code dependencies must point only inward, toward higher-level policies.
> (Clean Architecture, Chapter 17)

**Impact**:

- Domain logic is no longer independent
- Cannot test domain without infrastructure
- Violates the core principle of Clean Architecture

**Fix**:
Create an interface in the domain layer:

```typescript
// src/domain/user-repository.interface.ts
export interface IUserRepository {
  save(user: User): Promise<void>;
}

// src/domain/user.ts
import { IUserRepository } from "./user-repository.interface";

export class User {
  constructor(private repo: IUserRepository) {} // OK!
}

// src/infrastructure/user-repository.ts
import { IUserRepository } from "../domain/user-repository.interface";

export class UserRepository implements IUserRepository {
  // ...
}
```
````

**Reference**: Clean Architecture, Chapter 17 "Boundaries: Drawing Lines"

```

**成功基準**:
- 違反が検出される
- 修正提案にBefore/Afterコードがある
- 参考文献の引用がある

### テストケース2-3
（同様の構造で他のテストケースを記述）

## 参照ドキュメント

### 内部ドキュメント
- エージェントガイド: `prompt - 2025-11-01 - ナレッジ - Claude Code agentsガイド.md`
- スキルガイド: `prompt - 2025-11-01 - ナレッジ - Claude Code skills ガイド.md`

### 外部リソース
- 『Clean Architecture』Robert C. Martin著, Prentice Hall, 2017
  - Chapter 17: Boundaries: Drawing Lines
  - Chapter 22: The Clean Architecture
- 『Agile Software Development』Robert C. Martin著
  - Section II: SOLID Principles
```

---

（以下、想定するユーザー入力2-5と期待される出力2-5も同様の詳細度で記述）

...

---

## まとめ: このプロンプト設計シートの使い方

### ステップ1: 作成対象の決定

- [ ] エージェントのみ
- [ ] スキルのみ
- [ ] コマンドのみ
- [ ] 3つセット

### ステップ2: 情報収集

「目的を達成するために必要な情報」セクションのチェックリストに従って情報を収集

### ステップ3: 3つのガイド参照

```bash
cat "prompt - 2025-11-01 - ナレッジ - Claude Code agentsガイド.md"
cat "prompt - 2025-11-01 - ナレッジ - Claude Code skills ガイド.md"
cat "prompt - 2025-11-01 - ナレッジ - Claude Code command ガイド.md"
```

### ステップ4: フォーマットに従って出力

「出力フォーマット」セクションに従ってファイルを作成

### ステップ5: 依存関係の実装

依存関係マトリクスに従ってスキル・コマンド・エージェント間の参照を実装

### ステップ6: テスト

テストケースを実行して動作確認

### ステップ7: ドキュメント作成

README、変更履歴等を整備

---

**このシートの特徴**:

- ✓ エージェント・スキル・コマンドの3つ全てに対応
- ✓ 添付の3つの詳細ガイドを完全に参照
- ✓ 実在する専門家をベースにできる
- ✓ 依存関係を明確に管理
- ✓ 三位一体の関係性を図示
- ✓ Progressive Disclosure原則に準拠
- ✓ 実用レベルの詳細度
