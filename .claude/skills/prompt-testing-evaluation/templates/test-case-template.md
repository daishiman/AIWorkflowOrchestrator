# テストケーステンプレート

## 概要

プロンプト評価用のテストケースを作成するための
標準化されたテンプレート集です。

## 基本テストケース構造

```yaml
test_case:
  id: "TC-001"
  name: "テストケース名"
  description: "テストの目的"

  input:
    prompt: "テスト対象のプロンプト"
    variables: {}

  expected:
    output: "期待される出力"
    constraints: []

  metadata:
    category: "カテゴリ"
    priority: "high|medium|low"
    tags: []
```

## テストケーステンプレート

### テンプレート1: 正確性テスト

```yaml
accuracy_test:
  id: "ACC-{{number}}"
  type: "accuracy"
  description: "出力の正確性を検証"

  input:
    prompt: |
      {{prompt_template}}
    variables:
      input_data: "{{test_input}}"

  expected:
    output: "{{expected_output}}"
    match_type: "exact|contains|semantic"

  evaluation:
    method: "comparison"
    metric: "accuracy"
    threshold: 1.0  # 完全一致の場合

  metadata:
    category: "accuracy"
    priority: "high"
    tags: ["core", "regression"]
```

### 使用例

```yaml
accuracy_test:
  id: "ACC-001"
  type: "accuracy"
  description: "数値計算の正確性を検証"

  input:
    prompt: |
      以下の計算を行ってください。
      計算式: {{expression}}
      回答は数値のみで答えてください。
    variables:
      expression: "15 * 4 + 10"

  expected:
    output: "70"
    match_type: "exact"

  evaluation:
    method: "comparison"
    metric: "accuracy"
    threshold: 1.0

  metadata:
    category: "accuracy"
    priority: "high"
    tags: ["math", "calculation"]
```

### テンプレート2: 形式検証テスト

```yaml
format_test:
  id: "FMT-{{number}}"
  type: "format"
  description: "出力形式の検証"

  input:
    prompt: |
      {{prompt_template}}
    variables:
      input_data: "{{test_input}}"

  expected:
    format: "json|xml|markdown|plain"
    schema: |
      {{json_schema}}

  evaluation:
    method: "schema_validation"
    validators:
      - type: "json_valid"
      - type: "schema_match"
        schema: "{{schema_ref}}"

  metadata:
    category: "format"
    priority: "high"
    tags: ["validation", "schema"]
```

### 使用例

```yaml
format_test:
  id: "FMT-001"
  type: "format"
  description: "JSON出力形式の検証"

  input:
    prompt: |
      以下のテキストから情報を抽出し、JSON形式で出力してください。
      テキスト: {{text}}

      出力形式:
      {
        "name": "string",
        "age": number,
        "email": "string"
      }
    variables:
      text: "田中太郎、35歳、tanaka@example.com"

  expected:
    format: "json"
    schema: |
      {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "age": { "type": "integer" },
          "email": { "type": "string", "format": "email" }
        },
        "required": ["name", "age", "email"]
      }

  evaluation:
    method: "schema_validation"
    validators:
      - type: "json_valid"
      - type: "schema_match"

  metadata:
    category: "format"
    priority: "high"
    tags: ["json", "extraction"]
```

### テンプレート3: エッジケーステスト

```yaml
edge_case_test:
  id: "EDG-{{number}}"
  type: "edge_case"
  description: "境界条件の検証"

  input:
    prompt: |
      {{prompt_template}}
    variables:
      input_data: "{{edge_case_input}}"

  expected:
    behavior: "graceful_handling|error_message|default_value"
    output: "{{expected_behavior}}"

  edge_type: "empty|null|extreme|malformed|unicode|long"

  evaluation:
    method: "behavior_check"
    acceptable_behaviors:
      - "{{acceptable_1}}"
      - "{{acceptable_2}}"

  metadata:
    category: "edge_case"
    priority: "medium"
    tags: ["robustness", "edge"]
```

### 使用例

```yaml
edge_case_test:
  id: "EDG-001"
  type: "edge_case"
  description: "空入力の処理を検証"

  input:
    prompt: |
      以下のテキストを要約してください。
      テキスト: {{text}}
    variables:
      text: ""

  expected:
    behavior: "graceful_handling"
    output: "入力テキストが空です"

  edge_type: "empty"

  evaluation:
    method: "behavior_check"
    acceptable_behaviors:
      - "入力テキストが空です"
      - "要約するテキストがありません"
      - "テキストを入力してください"

  metadata:
    category: "edge_case"
    priority: "medium"
    tags: ["empty_input", "error_handling"]
```

### テンプレート4: 一貫性テスト

```yaml
consistency_test:
  id: "CON-{{number}}"
  type: "consistency"
  description: "出力の一貫性を検証"

  input:
    prompt: |
      {{prompt_template}}
    variables:
      input_data: "{{test_input}}"

  expected:
    consistency_type: "exact|semantic|structural"
    variance_threshold: 0.1

  execution:
    runs: 5
    temperature: 0.0

  evaluation:
    method: "consistency_check"
    metrics:
      - exact_match_rate
      - semantic_similarity
      - structural_similarity

  metadata:
    category: "consistency"
    priority: "high"
    tags: ["reliability", "stability"]
```

### テンプレート5: 安全性テスト

```yaml
safety_test:
  id: "SAF-{{number}}"
  type: "safety"
  description: "出力の安全性を検証"

  input:
    prompt: |
      {{prompt_template}}
    variables:
      input_data: "{{potentially_unsafe_input}}"

  expected:
    should_refuse: true|false
    forbidden_content:
      - "{{forbidden_pattern_1}}"
      - "{{forbidden_pattern_2}}"

  evaluation:
    method: "safety_check"
    checks:
      - type: "content_filter"
        categories: ["hate", "violence", "sexual", "harmful"]
      - type: "pii_check"
      - type: "refusal_check"

  metadata:
    category: "safety"
    priority: "critical"
    tags: ["safety", "compliance"]
```

## テストスイート構造

```yaml
test_suite:
  name: "プロンプトv1.0テストスイート"
  description: "プロンプトバージョン1.0の包括的テスト"
  version: "1.0.0"

  target:
    prompt_version: "v1.0"
    model: "claude-3-sonnet"

  configuration:
    timeout_ms: 30000
    retry_count: 2
    parallel_execution: true

  test_groups:
    - name: "基本機能テスト"
      tests:
        - ACC-001
        - ACC-002
        - ACC-003

    - name: "形式検証テスト"
      tests:
        - FMT-001
        - FMT-002

    - name: "エッジケーステスト"
      tests:
        - EDG-001
        - EDG-002
        - EDG-003

    - name: "安全性テスト"
      tests:
        - SAF-001
        - SAF-002

  success_criteria:
    overall_pass_rate: 0.95
    critical_tests_pass_rate: 1.0
    categories:
      accuracy:
        pass_rate: 0.9
      safety:
        pass_rate: 1.0
```

## テスト実行結果テンプレート

```yaml
test_result:
  test_id: "ACC-001"
  execution_id: "exec-20240115-001"
  timestamp: "2024-01-15T10:30:00Z"

  status: "passed|failed|error|skipped"

  input:
    prompt: "..."
    variables: {}

  output:
    actual: "実際の出力"
    expected: "期待される出力"

  evaluation:
    score: 1.0
    metrics:
      accuracy: 1.0
      latency_ms: 1234
      tokens_used: 150

  diagnostics:
    passed: true
    reason: "完全一致"
    details: {}

  metadata:
    model: "claude-3-sonnet"
    temperature: 0.0
    duration_ms: 1500
```

## テストレポートテンプレート

```markdown
# テスト実行レポート

## 概要
- 実行日時: {{timestamp}}
- テストスイート: {{suite_name}}
- 対象プロンプト: {{prompt_version}}

## サマリー

| カテゴリ | 合計 | 成功 | 失敗 | スキップ | 成功率 |
|---------|------|------|------|----------|--------|
| 正確性 | {{acc_total}} | {{acc_pass}} | {{acc_fail}} | {{acc_skip}} | {{acc_rate}}% |
| 形式 | {{fmt_total}} | {{fmt_pass}} | {{fmt_fail}} | {{fmt_skip}} | {{fmt_rate}}% |
| エッジ | {{edge_total}} | {{edge_pass}} | {{edge_fail}} | {{edge_skip}} | {{edge_rate}}% |
| 安全性 | {{saf_total}} | {{saf_pass}} | {{saf_fail}} | {{saf_skip}} | {{saf_rate}}% |
| **合計** | {{total}} | {{pass}} | {{fail}} | {{skip}} | **{{overall_rate}}%** |

## 失敗したテスト

### {{failed_test_id}}
- 説明: {{description}}
- 期待: {{expected}}
- 実際: {{actual}}
- 原因分析: {{analysis}}

## パフォーマンス統計

| メトリクス | 平均 | 中央値 | p95 | p99 |
|-----------|------|--------|-----|-----|
| レイテンシ(ms) | {{lat_avg}} | {{lat_med}} | {{lat_p95}} | {{lat_p99}} |
| トークン数 | {{tok_avg}} | {{tok_med}} | {{tok_p95}} | {{tok_p99}} |

## 推奨事項

1. {{recommendation_1}}
2. {{recommendation_2}}
3. {{recommendation_3}}
```

## テストケース作成ガイドライン

### カバレッジの確保

```yaml
coverage_guidelines:
  minimum_tests:
    accuracy: 10
    format: 5
    edge_cases: 5
    safety: 3

  distribution:
    happy_path: 60%
    edge_cases: 25%
    error_cases: 15%

  categories:
    - "正常ケース（典型的な入力）"
    - "境界ケース（極端な値）"
    - "エラーケース（無効な入力）"
    - "セキュリティケース（悪意のある入力）"
```

### 命名規約

```yaml
naming_convention:
  format: "{TYPE}-{NUMBER}"
  types:
    ACC: "正確性テスト"
    FMT: "形式テスト"
    EDG: "エッジケーステスト"
    CON: "一貫性テスト"
    SAF: "安全性テスト"
    PRF: "パフォーマンステスト"
    REG: "回帰テスト"
```
