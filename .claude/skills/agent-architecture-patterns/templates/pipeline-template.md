# Pipeline Pattern Template

## 概要

パイプラインパターンは、エージェントが順次処理を引き継ぐ連鎖構造です。
各エージェントは特定の変換を実行し、次のエージェントに結果を渡します。

## テンプレート構造

````yaml
---
name: {{pipeline_name}}
description: |
  {{pipeline_description}}

  🔴 パイプラインフロー:
  {{stage_1_name}} → {{stage_2_name}} → {{stage_3_name}}

tools:
  - Task
  - Read
  - Write
model: {{model}}
version: 1.0.0
---

# {{pipeline_name}}

## 役割

{{role_description}}

## パイプラインステージ

### Stage 1: {{stage_1_name}}

**入力**: {{stage_1_input}}
**出力**: {{stage_1_output}}
**処理**: {{stage_1_processing}}

**エージェント**: {{stage_1_agent}}

### Stage 2: {{stage_2_name}}

**入力**: {{stage_2_input}}
**出力**: {{stage_2_output}}
**処理**: {{stage_2_processing}}

**エージェント**: {{stage_2_agent}}

### Stage 3: {{stage_3_name}}

**入力**: {{stage_3_input}}
**出力**: {{stage_3_output}}
**処理**: {{stage_3_processing}}

**エージェント**: {{stage_3_agent}}

## ハンドオフプロトコル

各ステージ間の情報受け渡しフォーマット:

```json
{
  "from_stage": "{{stage_name}}",
  "to_stage": "{{next_stage_name}}",
  "status": "completed",
  "artifacts": ["{{artifact_path}}"],
  "context": {
    "key_decisions": [],
    "next_steps": []
  }
}
````

## エラーハンドリング

- **Retry**: ステージ失敗時に再試行
- **Fallback**: 代替ステージに切り替え
- **Escalation**: 上位エージェントに報告
- **Logging**: すべてのエラーをログに記録

## ベストプラクティス

✅ **すべきこと**:

- 各ステージの責任を明確に分離
- 標準化されたハンドオフプロトコル使用
- 冪等性を保証（再実行可能）

❌ **避けるべきこと**:

- ステージ間の逆方向依存
- 複数のステージを一つに統合
- 状態の暗黙的な共有

````

## 変数一覧

| 変数 | 説明 | 例 |
|------|------|------|
| `{{pipeline_name}}` | パイプライン名 | `data-processing-pipeline` |
| `{{pipeline_description}}` | パイプラインの説明 | `データ変換パイプライン` |
| `{{stage_1_name}}` | ステージ1の名前 | `data-extraction` |
| `{{stage_1_input}}` | ステージ1の入力 | `Raw API response` |
| `{{stage_1_output}}` | ステージ1の出力 | `Structured JSON` |
| `{{stage_1_processing}}` | ステージ1の処理内容 | `Parse and validate` |
| `{{stage_1_agent}}` | ステージ1のエージェント | `data-extractor` |

## 使用例

```yaml
---
name: data-processing-pipeline
description: |
  データ抽出、変換、読み込みパイプライン。

  🔴 パイプラインフロー:
  data-extraction → data-transformation → data-loading

tools:
  - Task
  - Read
  - Write
model: sonnet
version: 1.0.0
---
````
