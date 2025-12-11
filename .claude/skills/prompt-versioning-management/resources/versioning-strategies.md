# バージョニング戦略

## セマンティックバージョニング詳細

### バージョン形式

```
MAJOR.MINOR.PATCH[-prerelease][+build]

例:
- 1.0.0         : 安定版
- 1.1.0-beta.1  : ベータ版
- 1.0.1+fix123  : ビルドメタデータ付き
```

### 各桁の意味

#### MAJOR（破壊的変更）

**インクリメント条件**:

- 出力スキーマの構造変更
- 入力形式の変更
- 期待される動作の根本的変更
- 後方互換性のない変更

**例**:

```yaml
# v1.0.0 → v2.0.0
変更前:
  output: { "result": "string" }
変更後:
  output: { "data": { "result": "string", "confidence": "number" } }
```

#### MINOR（後方互換性のある追加）

**インクリメント条件**:

- 新機能の追加
- 新しいタスクタイプのサポート
- Few-Shot例の追加
- オプショナルな出力フィールドの追加

**例**:

```yaml
# v1.0.0 → v1.1.0
変更前:
  tasks: ["summarize", "classify"]
変更後:
  tasks: ["summarize", "classify", "translate"] # 新タスク追加
```

#### PATCH（バグ修正・微調整）

**インクリメント条件**:

- ハルシネーション修正
- 精度改善（動作変更なし）
- 文言の明確化
- パラメータの微調整

**例**:

```yaml
# v1.0.0 → v1.0.1
変更: Temperature 0.7 → 0.5（精度向上のため）
```

---

## プレリリースラベル

### 開発フロー

```
alpha → beta → rc → stable

alpha.1 : 初期開発版（不安定）
beta.1  : 機能完成版（テスト中）
rc.1    : リリース候補（最終検証）
(なし)  : 安定版
```

### 使用例

```
1.0.0-alpha.1  : 新機能の初期実装
1.0.0-alpha.2  : アルファ版の修正
1.0.0-beta.1   : ベータテスト開始
1.0.0-beta.2   : フィードバック反映
1.0.0-rc.1     : リリース候補
1.0.0          : 正式リリース
```

---

## 変更分類マトリックス

| 変更内容                   | MAJOR | MINOR | PATCH | 理由           |
| -------------------------- | ----- | ----- | ----- | -------------- |
| JSONスキーマ構造変更       | ✅    |       |       | 破壊的変更     |
| 必須フィールド追加         | ✅    |       |       | 後方互換性なし |
| オプショナルフィールド追加 |       | ✅    |       | 後方互換性あり |
| 新タスクタイプ追加         |       | ✅    |       | 機能拡張       |
| Few-Shot例追加             |       | ✅    |       | 品質向上       |
| 役割定義の強化             |       | ✅    |       | 動作改善       |
| Temperature調整            |       |       | ✅    | 微調整         |
| 文言修正                   |       |       | ✅    | 明確化         |
| タイポ修正                 |       |       | ✅    | バグ修正       |
| ハルシネーション対策       |       |       | ✅    | 品質改善       |

---

## 依存関係管理

### プロンプト間の依存

```yaml
prompt_a:
  version: 1.0.0
  depends_on:
    - prompt_b: "^2.0.0"  # 2.x.x に互換
    - prompt_c: "~1.2.0"  # 1.2.x に互換

バージョン範囲指定:
  ^1.2.3  : >=1.2.3 <2.0.0 （MINOR・PATCH更新を許容）
  ~1.2.3  : >=1.2.3 <1.3.0 （PATCHのみ許容）
  1.2.3   : 厳密一致
```

### 依存関係更新フロー

```
1. 依存先プロンプトがMAJOR更新
   ↓
2. 互換性テスト実施
   ↓
3. 必要に応じて自プロンプトを更新
   ↓
4. 依存バージョン指定を更新
   ↓
5. 自プロンプトも適切にバージョン更新
```

---

## バージョン管理ツール

### ファイル命名規則

```
prompts/
├── user-support/
│   ├── v1.0.0/
│   │   ├── prompt.md
│   │   ├── schema.json
│   │   └── examples/
│   ├── v1.1.0/
│   │   └── ...
│   └── latest -> v1.1.0  # シンボリックリンク
└── data-extraction/
    └── ...
```

### メタデータ管理

```yaml
# prompt-manifest.yaml
name: user-support-prompt
version: 1.1.0
created: 2025-01-15
updated: 2025-03-20
author: prompt-team
status: stable # alpha | beta | stable | deprecated

dependencies:
  - name: base-instruction
    version: "^2.0.0"

compatibility:
  models:
    - claude-3-sonnet
    - claude-3-opus
  min_context: 4000
  max_tokens: 1000
```

---

## バージョン比較

### 差分表示

```diff
# v1.0.0 → v1.1.0 の差分

 あなたは顧客サポートAIアシスタントです。

+## 新機能
+- 感情分析に基づいた応答トーン調整
+
 ## 応答ルール
 - 簡潔に回答する
+- 顧客の感情に配慮した言葉遣いを使用する
 - 不明な場合は確認を求める
```

### 変更影響分析

```yaml
change_impact:
  version: 1.0.0 → 1.1.0
  type: MINOR

  affected_areas:
    - response_tone: "感情分析による調整が追加"
    - word_choice: "配慮した言葉遣いルール追加"

  no_impact:
    - output_schema: "変更なし"
    - input_format: "変更なし"

  testing_required:
    - emotion_detection_accuracy
    - tone_appropriateness
```

---

## ベストプラクティス

### バージョン運用

1. **バージョン凍結**
   - 本番デプロイ後はそのバージョンを変更しない
   - 修正が必要な場合は新バージョンを作成

2. **段階的廃止**

   ```
   v1.0.0 [deprecated] → v2.0.0 [stable]

   廃止スケジュール:
   - 2025-04-01: 廃止予告（deprecated マーク）
   - 2025-05-01: 新規利用停止
   - 2025-06-01: 完全廃止（削除）
   ```

3. **長期サポート（LTS）**
   - 重要なプロンプトはLTSバージョンを指定
   - セキュリティ修正のみ適用
   - 機能追加は次のメジャーバージョンで

### ドキュメント

1. **各バージョンにCHANGELOGを付与**
2. **マイグレーションガイドを提供**（MAJOR変更時）
3. **廃止予定の機能を事前に通知**
