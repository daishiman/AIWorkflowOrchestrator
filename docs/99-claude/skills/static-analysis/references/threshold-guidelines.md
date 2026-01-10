# Complexity Threshold Guidelines

## 閾値設定の原則

### 1. チームスキルレベル考慮

**初級者多数（学習中、経験1-2年）**:

```json
{
  "rules": {
    "complexity": ["warn", 15],
    "max-depth": ["warn", 5],
    "max-lines-per-function": ["warn", 80],
    "max-params": ["warn", 4]
  }
}
```

**理由**:

- 学習曲線を考慮
- warnで警告のみ、即座のブロックなし
- 高めの閾値で柔軟性確保

**中級者チーム（経験3-5年）**:

```json
{
  "rules": {
    "complexity": ["warn", 10],
    "max-depth": ["error", 4],
    "max-lines-per-function": ["warn", 50],
    "max-params": ["warn", 3]
  }
}
```

**理由**:

- 業界標準値
- 一部errorで品質底上げ
- Robert C. Martin推奨値

**上級者チーム（経験5年+、アーキテクト）**:

```json
{
  "rules": {
    "complexity": ["error", 8],
    "max-depth": ["error", 3],
    "max-lines-per-function": ["error", 40],
    "max-params": ["error", 3],
    "max-statements": ["warn", 15]
  }
}
```

**理由**:

- 厳格な品質基準
- error中心で妥協なし
- 高保守性を実現

### 2. コードベース特性

**レガシーコードベース（段階的移行）**:

```json
{
  "rules": {
    "complexity": ["warn", 20], // 既存コード許容
    "max-lines-per-function": "off" // 初期は無効
  }
}
```

**移行計画**:

- Phase 1: warnで現状可視化（3ヶ月）
- Phase 2: 閾値を15に引き下げ（6ヶ月）
- Phase 3: 閾値を10に（1年）
- Phase 4: errorに格上げ

**新規開発プロジェクト**:

```json
{
  "rules": {
    "complexity": ["error", 10],
    "max-depth": ["error", 4],
    "max-lines-per-function": ["error", 50]
  }
}
```

**理由**:

- 最初から高品質
- 技術的負債の予防
- error強制で妥協なし

### 3. ビジネス要求

**高信頼性要求（金融、医療、航空）**:

```json
{
  "rules": {
    "complexity": ["error", 5],
    "max-depth": ["error", 2],
    "max-lines-per-function": ["error", 30],
    "max-params": ["error", 2]
  }
}
```

**理由**:

- 極めて厳格
- テスト容易性最大化
- バグリスク最小化

**標準Webアプリ**:

```json
{
  "rules": {
    "complexity": ["warn", 10],
    "max-depth": ["error", 4],
    "max-lines-per-function": ["warn", 50]
  }
}
```

**プロトタイプ/MVP**:

```json
{
  "rules": {
    "complexity": ["warn", 15],
    "max-depth": ["warn", 5],
    "max-lines-per-function": "off"
  }
}
```

**理由**:

- スピード優先
- 柔軟性確保
- 本番化時に厳格化

## 業界標準値

### Thomas J. McCabe推奨（1976年）

- **循環的複雑度**: ≤10
- **根拠**: 10以下でテスト容易性確保

### Robert C. Martin推奨（Clean Code）

- **関数長**: ≤20行（理想）、≤50行（現実的）
- **パラメータ数**: ≤3
- **ネスト深度**: ≤4

### SonarQube推奨

- **循環的複雑度**: ≤15
- **認知的複雑度**: ≤15
- **ファイル長**: ≤500行

### Google推奨

- **関数長**: ≤50行
- **ファイル長**: ≤500行

## プロジェクトタイプ別推奨

### フロントエンド（React/Vue）

```json
{
  "rules": {
    "complexity": ["warn", 10],
    "max-lines-per-function": ["warn", 50],
    "max-depth": ["error", 4]
  }
}
```

**理由**: UIロジックは適度な複雑度許容

### バックエンドAPI

```json
{
  "rules": {
    "complexity": ["error", 8],
    "max-lines-per-function": ["error", 40],
    "max-depth": ["error", 3]
  }
}
```

**理由**: ビジネスロジックは厳格に

### ユーティリティライブラリ

```json
{
  "rules": {
    "complexity": ["error", 5],
    "max-lines-per-function": ["error", 30],
    "max-params": ["error", 2]
  }
}
```

**理由**: 再利用性重視、高品質必須

## 閾値調整のタイミング

### レビューサイクル

**3ヶ月毎**:

1. 違反率測定（全関数中何%が違反？）
2. チームフィードバック収集
3. 閾値調整検討

**調整基準**:

- 違反率<5%: 閾値を1-2下げる（厳格化）
- 違反率>30%: 閾値を緩める、またはwarnに変更
- 違反率5-30%: 現状維持

### トリガーベース調整

**品質問題発生時**:

- バグが複雑度高い関数で発生 → 閾値を下げる
- テスト困難なコードが増加 → 閾値を下げる

**開発速度低下時**:

- 過度な制約でブロック頻発 → 一部warnに変更
- リファクタリング時間過多 → 閾値を一時的に緩める

## まとめ

**基本推奨値**:

- 循環的複雑度: 10
- 認知的複雑度: 15
- ネスト深度: 4
- 関数長: 50行
- パラメータ数: 3

**調整要因**:

- チームスキル
- コードベース特性
- ビジネス要求
- プロジェクトフェーズ

**運用**:

- warn開始 → error移行
- 3ヶ月毎レビュー
- 違反率モニタリング
