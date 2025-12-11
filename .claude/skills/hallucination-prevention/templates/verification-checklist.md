# ハルシネーション防止 検証チェックリスト

## 事前チェック（設計時）

### プロンプトレベル

- [ ] 事実確認の義務がプロンプトに含まれているか？
- [ ] 情報源の引用形式が定義されているか？
- [ ] 不確実性の表現方法が明示されているか？
- [ ] 推測の制限・禁止ルールがあるか？
- [ ] 自己検証ステップが組み込まれているか？

### パラメータレベル

- [ ] タスクに適したTemperatureが設定されているか？
- [ ] Top-pの値は適切か？
- [ ] Frequency/Presence Penaltyは必要か？
- [ ] パラメータ設定の根拠が文書化されているか？

### 検証レベル

- [ ] 出力スキーマが定義されているか？
- [ ] 信頼度フィールドが含まれているか？
- [ ] 情報源フィールドが含まれているか？
- [ ] 検証失敗時のフォールバックが設計されているか？

## 事後チェック（出力時）

### 構造検証

- [ ] 出力はスキーマに準拠しているか？
- [ ] 必須フィールドがすべて存在するか？
- [ ] 型が正しいか？
- [ ] 値の制約を満たしているか？

### 内容検証

- [ ] すべての主張に情報源があるか？
- [ ] 情報源は入力データ内に存在するか？
- [ ] 論理的な矛盾はないか？
- [ ] 推測には適切なマーキングがあるか？

### 信頼度検証

- [ ] 信頼度スコアが存在するか？
- [ ] 信頼度は閾値を満たしているか？
- [ ] 低信頼度項目にフラグが付いているか？

### クロス検証（高リスクタスク用）

- [ ] 複数回生成で一致するか？
- [ ] 異なるモデルで同様の結果が得られるか？
- [ ] 人間レビューで問題がないか？

## リスクレベル別必須チェック

### 高リスク（法的・医療・金融）

必須: すべてのチェック項目

追加要件:

- [ ] 専門家レビューの実施
- [ ] 免責事項の追加
- [ ] 監査ログの記録

### 中リスク（技術情報・分析）

必須:

- プロンプトレベル: 全項目
- パラメータレベル: 全項目
- 検証レベル: 構造検証、内容検証

### 低リスク（創作・アイデア）

必須:

- プロンプトレベル: 事実確認の義務
- パラメータレベル: Temperature設定
- 検証レベル: 構造検証

## 検証結果の記録テンプレート

```yaml
validation_record:
  timestamp: "YYYY-MM-DDTHH:MM:SSZ"
  task_id: "xxx"
  risk_level: "high|medium|low"

  prompt_level:
    fact_check_required: true|false
    citation_format_defined: true|false
    uncertainty_expression: true|false
    speculation_rules: true|false

  parameter_level:
    temperature: 0.0
    top_p: 0.1
    frequency_penalty: 0.0
    presence_penalty: 0.0

  verification_level:
    structure_validation:
      passed: true|false
      errors: []
    content_validation:
      passed: true|false
      unsupported_claims: []
    confidence_validation:
      passed: true|false
      low_confidence_items: []
    cross_validation:
      performed: true|false
      agreement_rate: 0.0

  result:
    overall_passed: true|false
    retries: 0
    escalated: false
    final_confidence: 0.0
```

## 問題発生時の対応フロー

```
検証失敗
    │
    ▼
再試行可能？ ─── No ──→ エスカレーション
    │
   Yes
    │
    ▼
エラーをフィードバックして再生成
    │
    ▼
再検証
    │
    ▼
成功？ ─── No ──→ 再試行回数確認
    │                    │
   Yes              回数超過？
    │                    │
    ▼              Yes ──┴──→ エスカレーション
完了                No ──────→ 再試行へ戻る
```
