# Phase 1 成果物: フィールド独立性分析書

## タスク情報

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| タスクID | UT-SKILL-WIZARD-FB-03-FALLBACK-SPEC-CLARIFICATION-001 |
| 作成日   | 2026-04-11                                            |

## 現行実装の分析

### inferSmartDefaults の実装構造

```
inferSmartDefaults(input: SkillInfoFormData): SmartDefaultResult
```

**推論ステップ（独立評価）**:

1. `normalizePurpose(input.purpose)` → 空白トリム・null正規化
2. `inferTool(normalizedPurpose)` → キーワードマッチ（purpose依存）
3. `inferTiming(normalizedPurpose)` → 正規表現マッチ（purpose依存）
4. `inferFormat(input.category)` → カテゴリマッピング（category依存）
5. 全ログをまとめて `inferenceLog` に格納

### フィールド責務分離

```
purpose → [tool, timing]
category → [format]
```

各推論関数は独立しており、他フィールドの推論結果を参照しない。

## 誤解パターンの根本原因分析

### 問題の再現経緯

UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 Phase 4〜11 において：

1. フックが自動的にテスト入力値を変更（`purpose: ""` に `category: "code-support"` を追加）
2. 「purpose空でもformatが推論される」テストケースが一時生成された
3. テスト記述が `inferSmartDefaults` の仕様に沿っていない可能性が生まれた
4. 元仕様（purpose空 → format null）との矛盾が手動発見まで気づかれなかった

### 根本原因

**フィールド間独立性がAC-4定義に明文化されていなかった**

- `[Feedback FB-03]` エントリは「purposeからformatを推論してはいけない」と記述されているが、
  **「各フィールドは独立して推論される」という原則**が明示されていなかった
- 実装者・テスト作成者が「purpose空 → 全推論不可」という連鎖nullモデルを誤解しやすかった

## フィールド独立推論の正確な定義

### 独立性原則

```
原則1: 各フィールドは独自の推論ロジックを持つ
原則2: あるフィールドがnullになっても、他フィールドの推論には影響しない
原則3: フィールド間に明示的な依存関係がない限り、独立して評価する
```

### 正確な挙動マトリクス

| purpose値 | category値     | tool | timing | format | 備考                 |
| --------- | -------------- | ---- | ------ | ------ | -------------------- |
| ""（空）  | "code-support" | null | null   | "code" | purposeのみnull影響  |
| ""（空）  | null           | null | null   | null   | 両フィールドnull     |
| "有効値"  | null           | 推論 | 推論   | null   | categoryのみnull影響 |
| "有効値"  | "code-support" | 推論 | 推論   | "code" | 全フィールド独立推論 |

### 誤解パターン vs 正解パターン

```
【誤解パターン】連鎖nullモデル
purpose = "" → purpose=null → category=null → format=null ← 誤り

【正解パターン】独立推論モデル
purpose = "" → tool=null, timing=null（purposeのみnull影響）
category = "code-support" → format="code"（purposeとは無関係に独立推論）
```

## 現行テストとの照合

### 既存テストで既にカバーされている部分

| 既存テスト（行番号）               | カバー内容                     |
| ---------------------------------- | ------------------------------ |
| L242-253: purpose空+category有効   | TC-FB03-01と同等（明示名なし） |
| L256-263: purpose undefined        | TC-FB03-05に対応               |
| L266-278: purpose空白+category有効 | TC-FB03-07に対応               |

### TC-FB03シリーズで追加する部分

| TC-ID          | 追加理由                                                 |
| -------------- | -------------------------------------------------------- |
| TC-FB03-01〜04 | 明示的に「フィールド独立推論性」として命名・分類するため |
| TC-FB03-05〜09 | エッジケース・回帰ガードを補強するため                   |

## 結論

フィールド独立推論性は**実装済み**だが、**仕様書と明示的テストが不足**していた。  
今回のタスクは実装変更なしに、ドキュメントとテストの明示化で問題を解決する。
