# 自己改善サイクル

> **Progressive Disclosure**
> - 読み込みタイミング: フィードバック分析時、スキル改善時
> - 読み込み条件: 使用ログの分析・メトリクス評価が必要なとき
> - 関連ファイル: LOGS.md, EVALS.json, scripts/log-usage.js

---

## 概要

task-specification-creatorスキルが自己のパフォーマンスを分析し、
継続的に改善するサイクルの実装方法を定義する。

---

## 1. 自己改善サイクル全体像

```
タスク仕様書生成
    │
    ▼
[実行結果記録] ← log-usage.js
    │
    ▼
[メトリクス更新] ← EVALS.json
    │
    ▼
[パターン分析] ← 手動/LLM分析
    │
    ▼
[改善提案生成] ← skill-creator
    │
    ▼
[改善適用] ← 手動適用
    │
    ▼
改善完了
```

---

## 2. 記録フェーズ

### 2.1 実行結果の記録

**スクリプト**: `scripts/log-usage.js`

```bash
# 成功時
node scripts/log-usage.js \
  --result success \
  --phase "Phase 4" \
  --agent "generate-task-specs" \
  --duration 1234 \
  --notes "仕様書13件生成完了"

# 失敗時
node scripts/log-usage.js \
  --result failure \
  --phase "Phase 3" \
  --agent "design-phases" \
  --error "ValidationError" \
  --notes "スキーマ検証失敗"
```

### 2.2 記録される情報

| 項目 | 説明 | 例 |
|------|------|-----|
| timestamp | 実行日時 | 2026-01-13T12:00:00.000Z |
| result | 結果 | success/failure |
| phase | 実行フェーズ | Phase 4 |
| agent | エージェント名 | generate-task-specs |
| duration | 実行時間 | 1234ms |
| error | エラー種別 | ValidationError |
| notes | 補足メモ | 自由記述 |

### 2.3 LOGS.md形式

```markdown
## [2026-01-13T12:00:00.000Z]

- **Agent**: generate-task-specs
- **Phase**: Phase 4
- **Result**: ✓ 成功
- **Duration**: 1234ms
- **Notes**: 仕様書13件生成完了

---
```

---

## 3. メトリクス管理

### 3.1 EVALS.json構造

```json
{
  "skillName": "task-specification-creator",
  "currentLevel": 1,
  "metrics": {
    "totalUsageCount": 25,
    "successCount": 22,
    "failureCount": 3,
    "successRate": 0.88,
    "averageDuration": 2345,
    "lastEvaluated": "2026-01-13T12:00:00.000Z"
  },
  "phaseMetrics": {
    "decompose-task": { "successRate": 0.95, "avgDuration": 1000, "usageCount": 10 },
    "generate-task-specs": { "successRate": 0.90, "avgDuration": 3000, "usageCount": 15 }
  },
  "patterns": {
    "commonErrors": [
      { "type": "ValidationError", "count": 2, "lastOccurred": "..." }
    ],
    "slowPhases": [
      { "phase": "generate-task-specs", "avgDuration": 5000 }
    ]
  }
}
```

### 3.2 レベルアップ基準

| レベル | 使用回数条件 | 成功率条件 |
|--------|--------------|------------|
| Level 2 | 10回以上 | 80%以上 |
| Level 3 | 50回以上 | 90%以上 |

---

## 4. パターン分析

### 4.1 検出するパターン

| パターン | 検出条件 | 改善アクション |
|----------|----------|----------------|
| 高頻度エラー | 同一エラー3回以上 | エージェントプロンプト改善 |
| 遅いフェーズ | 平均の2倍以上 | 処理最適化 |
| 低成功率 | 80%未満 | ワークフロー見直し |

### 4.2 分析タイミング

| トリガー | 説明 | 自動実行 |
|----------|------|----------|
| 手動要求 | ユーザーからの分析要求 | × |
| 10回実行 | 使用回数が10の倍数に達した時 | ○（ログ時） |
| エラー発生 | 失敗時にパターン更新 | ○（ログ時） |

---

## 5. 改善適用

### 5.1 改善対象

| 対象 | 改善内容 | 優先度判定 |
|------|----------|------------|
| SKILL.md | ワークフロー最適化 | 高: 成功率影響 |
| agents/ | プロンプト改善 | 中: 品質影響 |
| scripts/ | パフォーマンス改善 | 中: 速度影響 |
| schemas/ | 検証ルール調整 | 低: 安定性影響 |
| references/ | ドキュメント更新 | 低: 利便性影響 |

### 5.2 skill-creatorによる改善

```bash
# skill-creatorスキルを使用して改善
/skill-creator

# モード選択: update
# 対象スキル: task-specification-creator
# 改善内容: LOGS.mdの分析結果に基づく改善
```

---

## 6. ベストプラクティス

### すべきこと

| 推奨事項 | 理由 |
|----------|------|
| 毎回ログ記録 | データ駆動の改善 |
| 定期的な分析 | 問題の早期発見 |
| 段階的適用 | リスク最小化 |

### 避けるべきこと

| アンチパターン | 問題 |
|----------------|------|
| ログ省略 | 分析データ不足 |
| 無検証適用 | 意図しない変更 |

---

## 関連リソース

- **ログファイル**: See [LOGS.md](../LOGS.md)
- **メトリクス**: See [EVALS.json](../EVALS.json)
- **記録スクリプト**: See [scripts/log-usage.js](../scripts/log-usage.js)
- **改善スキル**: skill-creator
