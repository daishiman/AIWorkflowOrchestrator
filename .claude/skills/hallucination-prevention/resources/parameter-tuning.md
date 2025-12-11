# パラメータ調整ガイド

## 主要パラメータ

### Temperature

**定義**: 出力のランダム性を制御（0.0-2.0）

**効果**:

- 低い値（0.0-0.3）: 決定論的、一貫性が高い
- 中間値（0.3-0.7）: バランス型
- 高い値（0.7-2.0）: 創造的、多様性が高い

**ハルシネーション防止には低い値を推奨**

### Top-p (Nucleus Sampling)

**定義**: 累積確率でトークン選択を制限（0.0-1.0）

**効果**:

- 低い値（0.1-0.5）: 高確率トークンのみ選択
- 高い値（0.9-1.0）: より多様なトークンを許容

**事実ベースタスクには低い値を推奨**

### Frequency Penalty

**定義**: 既出トークンの再出現を抑制（-2.0-2.0）

**効果**:

- 正の値: 繰り返しを減少
- 負の値: 繰り返しを増加

**通常は0.0-0.5の範囲で使用**

### Presence Penalty

**定義**: 新しいトピックへの移行を促進（-2.0-2.0）

**効果**:

- 正の値: 新しいトピックを促進
- 負の値: 現在のトピックに集中

**事実抽出には0.0を推奨**

## タスク別推奨設定

### 事実抽出（最も厳格）

```typescript
{
  temperature: 0.0,
  top_p: 0.1,
  frequency_penalty: 0.0,
  presence_penalty: 0.0
}
```

**用途**: データ抽出、構造化、分類

### データ変換

```typescript
{
  temperature: 0.1,
  top_p: 0.3,
  frequency_penalty: 0.0,
  presence_penalty: 0.0
}
```

**用途**: フォーマット変換、正規化

### 要約・分析

```typescript
{
  temperature: 0.3,
  top_p: 0.5,
  frequency_penalty: 0.3,
  presence_penalty: 0.0
}
```

**用途**: テキスト要約、感情分析

### 一般的な回答

```typescript
{
  temperature: 0.5,
  top_p: 0.7,
  frequency_penalty: 0.5,
  presence_penalty: 0.0
}
```

**用途**: Q&A、説明生成

### 創作・アイデア出し

```typescript
{
  temperature: 0.8,
  top_p: 0.95,
  frequency_penalty: 0.7,
  presence_penalty: 0.5
}
```

**用途**: ブレインストーミング、創作

## パラメータ選択フロー

```
タスクの性質を判断
│
├─ 事実の正確性が重要？
│   ├─ Yes → Temperature: 0.0-0.2
│   └─ No  → 次の判断へ
│
├─ 一貫性が重要？
│   ├─ Yes → Top-p: 0.3-0.5
│   └─ No  → 次の判断へ
│
├─ 多様性が必要？
│   ├─ Yes → Temperature: 0.7-1.0
│   └─ No  → デフォルト設定
│
└─ 繰り返しを避けたい？
    ├─ Yes → Frequency Penalty: 0.5-1.0
    └─ No  → Frequency Penalty: 0.0
```

## モデル別の調整

### GPT-4 / GPT-4 Turbo

- 比較的低いTemperatureでも多様性を維持
- Temperature 0.0でも十分な品質
- Top-pとの組み合わせで精密な制御可能

### Claude 3.5 Sonnet

- Temperature 0.0で最も決定論的
- 中間値でも一貫性が高い
- 創作タスクでは0.7以上を推奨

### Gemini Pro

- Temperatureの影響が大きい
- 事実タスクには0.0-0.2を強く推奨
- Top-pとの併用が効果的

## 注意点

### Temperature 0.0 でも幻覚は起こりうる

- パラメータだけでは完全に防げない
- プロンプトレベル防御との併用が必須
- 検証レベル防御も実装すべき

### 過度に低い設定のリスク

- 出力が短くなりすぎる可能性
- 同じ入力で常に同じ出力（キャッシュに注意）
- 創造性が必要なタスクには不適切

### 設定の記録と追跡

```typescript
interface ModelConfig {
  model: string;
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  timestamp: string;
  task_type: string;
}
```

設定を記録し、結果と紐付けて追跡することを推奨
