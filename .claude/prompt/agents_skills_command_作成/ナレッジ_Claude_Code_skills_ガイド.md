# Claude Code スキル（Skills）完全ガイド

## 目次

1. [概念的基盤](https://claude.ai/chat/92f669e4-7a87-46dd-b248-85d7ff04556e#%E6%A6%82%E5%BF%B5%E7%9A%84%E5%9F%BA%E7%9B%A4)
2. [Progressive Disclosure アーキテクチャ](https://claude.ai/chat/92f669e4-7a87-46dd-b248-85d7ff04556e#progressive-disclosure-%E3%82%A2%E3%83%BC%E3%82%AD%E3%83%86%E3%82%AF%E3%83%81%E3%83%A3)
3. [スキル構造の詳細仕様](https://claude.ai/chat/92f669e4-7a87-46dd-b248-85d7ff04556e#%E3%82%B9%E3%82%AD%E3%83%AB%E6%A7%8B%E9%80%A0%E3%81%AE%E8%A9%B3%E7%B4%B0%E4%BB%95%E6%A7%98)
4. [実装パターンと戦略](https://claude.ai/chat/92f669e4-7a87-46dd-b248-85d7ff04556e#%E5%AE%9F%E8%A3%85%E3%83%91%E3%82%BF%E3%83%BC%E3%83%B3%E3%81%A8%E6%88%A6%E7%95%A5)
5. [エージェント・コマンドとの統合](https://claude.ai/chat/92f669e4-7a87-46dd-b248-85d7ff04556e#%E3%82%A8%E3%83%BC%E3%82%B8%E3%82%A7%E3%83%B3%E3%83%88%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%89%E3%81%A8%E3%81%AE%E7%B5%B1%E5%90%88)
6. [ベストプラクティス](https://claude.ai/chat/92f669e4-7a87-46dd-b248-85d7ff04556e#%E3%83%99%E3%82%B9%E3%83%88%E3%83%97%E3%83%A9%E3%82%AF%E3%83%86%E3%82%A3%E3%82%B9)
7. [スキル活性化の最適化](https://claude.ai/chat/92f669e4-7a87-46dd-b248-85d7ff04556e#%E3%82%B9%E3%82%AD%E3%83%AB%E6%B4%BB%E6%80%A7%E5%8C%96%E3%81%AE%E6%9C%80%E9%81%A9%E5%8C%96)

---

## 1. 概念的基盤

### 1.1 スキルの定義と目的

```
┌─────────────────────────────────────────────────────────────┐
│                 スキルの本質的な役割                         │
└─────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
        ┌───▼────┐      ┌──▼───┐      ┌───▼────┐
        │ KNOW   │      │ HOW  │      │ SCALE  │
        │知識提供 │      │手順  │      │拡張性  │
        └────────┘      └──────┘      └────────┘
            │               │               │
     ドメイン知識      ワークフロー     無制限の情報量
     段階的開示       ベストプラクティス  トークン効率
```

#### スキルとは何か

**上位概念:**

- **手続き的知識のパッケージ**: タスク完了のための具体的な手順とガイダンス
- **ダイナミックロード可能な専門知識**: 必要な時だけコンテキストに読み込まれる
- **組み合わせ可能な能力モジュール**: 複数のスキルを組み合わせて複雑なタスクに対応

**具体例:**

```
一般的なClaude:
"Excelファイルを分析してください"
→ 基本的な分析のみ可能

Excel Analysis スキル装備:
"Excelファイルを分析してください"
→ ピボットテーブル作成
→ 高度な数式使用
→ グラフ生成
→ データクレンジング
→ 統計分析
```

### 1.2 スキルの哲学的基盤

#### オンボーディングガイド・メタファー

```
新入社員のオンボーディング          スキルの構造
─────────────────────          ────────────
目次・概要（初日）              → name + description（100トークン）
部署別ガイド（必要時）          → SKILL.md本文（500行以内）
詳細マニュアル（参照時）        → リソースファイル（無制限）
実行スクリプト（使用時）        → 埋め込みコード
```

**重要な洞察:**

> "スキルは、Claude に専門家としての「オンボーディング」を提供する。全てを一度に教えるのではなく、必要な時に必要な情報だけを段階的に提供する。" — Anthropic Engineering Blog

### 1.3 スキル vs その他の機能

| 機能             | スキル               | プロジェクト     | MCP                | カスタム指示 |
| ---------------- | -------------------- | ---------------- | ------------------ | ------------ |
| **起動方法**     | モデル判断（自動）   | 常時ロード       | ツール呼び出し     | 常時適用     |
| **情報タイプ**   | 手続き的知識         | 静的背景知識     | 外部データアクセス | 一般的な動作 |
| **スコープ**     | タスク特化           | プロジェクト全体 | サービス接続       | 全会話       |
| **トークン使用** | 必要時のみ（効率的） | 常時消費         | 大量消費の可能性   | 常時消費     |
| **動的ロード**   | ✓                    | ✗                | ✗                  | ✗            |
| **コード実行**   | ✓                    | ✗                | MCP 経由           | ✗            |

**研究結果:** LangChain の研究により、**Claude + CLAUDE.md（スキルの前身）**が**Claude + フル MCP アクセス**を上回ることが実証されました。理由：

- より効率的なトークン使用
- より焦点を絞った知識提供
- コンテキスト汚染の回避

---

## 2. Progressive Disclosure アーキテクチャ

### 2.1 3 段階開示モデル

```
┌──────────────────────────────────────────────────────────────┐
│               Progressive Disclosure の全体像                 │
└──────────────────────────────────────────────────────────────┘

【レベル1: メタデータ（常時ロード）】
┌────────────────────────────────┐
│ name: excel-analysis           │  ← 約100トークン
│ description: Analyze Excel...  │     全スキルのメタデータ
└────────────────────────────────┘     がシステムプロンプトに

              ↓ マッチング判定

【レベル2: SKILL.md本文（必要時ロード）】
┌────────────────────────────────┐
│ # Excel Analysis               │  ← 約500行
│                                │     タスクに関連すると
│ ## Overview                    │     判断された時のみ
│ ## Workflows                   │     読み込まれる
│ ## Best Practices              │
└────────────────────────────────┘

              ↓ 詳細が必要

【レベル3: リソースファイル（参照時ロード）】
┌────────────────────────────────┐
│ reference/                     │  ← 無制限
│ ├─ pivot-tables.md            │     SKILL.mdから
│ ├─ formulas.md                │     参照された時のみ
│ ├─ charts.md                  │     読み込まれる
│ └─ data-cleaning.md           │
│                                │
│ scripts/                       │
│ └─ validate_excel.py          │
└────────────────────────────────┘
```

### 2.2 コンテキストウィンドウの動的変化

#### 起動前の状態

```
┌──────────────────────────────────────┐
│ システムプロンプト               2K │
│ ユーザーメッセージ              500 │
│ スキルメタデータ（全10スキル）   1K │ ← name + description のみ
│ ─────────────────────────────────── │
│ 合計: 3.5K トークン                  │
└──────────────────────────────────────┘
```

#### スキル起動後

```
┌──────────────────────────────────────┐
│ システムプロンプト               2K │
│ ユーザーメッセージ              500 │
│ スキルメタデータ                 1K │
│ SKILL.md本文（excel-analysis）  3K │ ← 起動されたスキルのみ追加
│ ─────────────────────────────────── │
│ 合計: 6.5K トークン                  │
└──────────────────────────────────────┘
```

#### リソース参照時

```
┌──────────────────────────────────────┐
│ システムプロンプト               2K │
│ ユーザーメッセージ              500 │
│ スキルメタデータ                 1K │
│ SKILL.md本文                    3K │
│ pivot-tables.md                 2K │ ← 必要なリソースのみ追加
│ ─────────────────────────────────── │
│ 合計: 8.5K トークン                  │
└──────────────────────────────────────┘
```

**重要な利点:**

- 他の 9 スキルの詳細（約 27K）は読み込まれない
- 必要なリソースのみ段階的に追加
- **実質無制限の知識ベース**を効率的に実現

### 2.3 ファイルシステムベースのアーキテクチャ

#### なぜファイルシステムなのか

**従来のアプローチ（全てをコンテキストに）:**

```
❌ 問題点:
- 全情報を事前にロード → 膨大なトークン消費
- コンテキストウィンドウの上限に到達
- 無関係な情報による「ノイズ」
- スケールしない
```

**ファイルシステムアプローチ（必要な時に読み込み）:**

```
✓ 利点:
- 必要なファイルのみBashコマンドで読み込み
- コンテキスト使用量を最小化
- 無制限の知識量を保持可能
- 完全にスケーラブル
```

#### 実践例: BigQuery スキル

**ディレクトリ構造:**

```
bigquery-skill/
├── SKILL.md                    # 概要、目次的役割
└── reference/
    ├── finance.md              # 財務メトリクス
    ├── sales.md                # 販売パイプライン
    └── product.md              # 製品利用分析
```

**実行フロー:**

```
1. ユーザー: "今月の収益を分析して"

2. Claude: SKILL.md を読み込み
   → 「finance.md を参照せよ」を発見

3. Claude: Bash実行
   cat bigquery-skill/reference/finance.md

4. finance.md のみロード（sales.md, product.md は未ロード）
   → トークン消費を最小化

5. 収益分析実行
```

**トークン効率:**

```
全ファイル一括ロード: 15K トークン
Progressive Disclosure: 5K トークン
削減率: 67%
```

---

## 3. スキル構造の詳細仕様

### 3.1 ディレクトリ構造の全パターン

#### パターン 1: シンプルスキル（最小構成）

```
skill-name/
└── SKILL.md                    # 必須、これだけで完結
```

#### パターン 2: リソース分離型（推奨）

```
skill-name/
├── SKILL.md                    # <500行、概要と目次
└── resources/                  # 詳細リソース
    ├── topic-1.md              # 各<500行
    ├── topic-2.md
    └── topic-3.md
```

#### パターン 3: スクリプト統合型

```
skill-name/
├── SKILL.md                    # 概要とスクリプト呼び出し
└── scripts/
    ├── validate.py             # 検証スクリプト
    ├── transform.js            # 変換スクリプト
    └── utils.sh                # ユーティリティ
```

#### パターン 4: 完全装備型（実運用レベル）

```
skill-name/
├── SKILL.md                    # エントリーポイント
├── resources/                  # リファレンス文書
│   ├── getting-started.md
│   ├── advanced-usage.md
│   ├── troubleshooting.md
│   └── api-reference.md
├── scripts/                    # 実行可能スクリプト
│   ├── setup.py
│   ├── execute.py
│   └── cleanup.py
├── templates/                  # テンプレートファイル
│   ├── config.template.yaml
│   └── report.template.md
└── assets/                     # 静的アセット
    ├── schema.json
    └── sample-data.csv
```

### 3.2 SKILL.md の完全解剖

#### YAML Frontmatter（必須セクション）

```yaml
---
name: skill-identifier
description: |
  Brief description of what this skill does.
  Use when [trigger conditions].
  Specialized in [domain/technology].
version: 1.0.0
---
```

**各フィールドの詳細仕様:**

##### name（必須）

```yaml
name: excel-pivot-table-generator
```

- **制約**: 最大 64 文字
- **形式**: kebab-case 推奨
- **用途**:
  - スキル識別子
  - ログ記録
  - 明示的参照時
- **命名規則**:
  ```
  形式: [domain]-[action]-[object]良い例:excel-pivot-table-generatorapi-error-handlerdatabase-migration-assistant悪い例:skill1 (意味不明)helper (曖昧)do-everything (広すぎる)
  ```

##### description（必須・最重要）

```yaml
description: |
  [メイン機能を1-2文で]

  専門分野:
  - [領域1]: [詳細]
  - [領域2]: [詳細]

  使用タイミング:
  - [トリガー条件1]
  - [トリガー条件2]

  [プロアクティブ指示（オプション）]
```

**制約**: 最大 200 文字（メタデータとして）+ 本文で詳細化可能

**重要性:**

> このフィールドは Claude がスキルを**選択するための主要なシグナル**です。 不明確な description はスキルが起動されない原因となります。

**効果的な description の構成要素:**

1. **行動志向の動詞**

   ```yaml
   ✓ 良い: "Extract text from PDFs, fill forms, merge documents"
   ✗ 悪い: "Helps with PDFs"
   ```

2. **具体的なトリガー条件**

   ```yaml
   ✓ 良い: "Use when working with .xlsx files, analyzing spreadsheets, or creating pivot tables"
   ✗ 悪い: "For Excel work"
   ```

3. **ドメイン/技術の明示**

   ```yaml
   ✓ 良い: "Specialized in React components, hooks, and state management"
   ✗ 悪い: "Frontend development"
   ```

4. **プロアクティブ指示**

   ```yaml
   例: "Use proactively when user mentions API integration, authentication, or OAuth"
   ```

**実例比較:**

```yaml
# 悪い例
---
name: code-helper
description: Helps with code
---
# 良い例
---
name: react-component-generator
description: |
  Generate React components with TypeScript, hooks, and best practices.

  Specialized in:
  - Functional components with TypeScript interfaces
  - React hooks (useState, useEffect, useContext, custom hooks)
  - Component composition and prop drilling solutions

  Use when:
  - Creating new React components
  - Refactoring class components to functional
  - Implementing state management patterns

  Proactive: Automatically suggest when user mentions "component", "React", or "hooks"
---
```

##### version（オプション）

```yaml
version: 2.1.0
```

- **形式**: セマンティックバージョニング（major.minor.patch）
- **用途**:
  - 変更追跡
  - 互換性管理
  - チーム間コミュニケーション

**バージョニング戦略:**

```markdown
## バージョン履歴（SKILL.md 内に記載推奨）

### v2.1.0 (2025-10-15)

- 新機能: ピボットテーブルの自動最適化
- 改善: エラーメッセージの詳細化

### v2.0.0 (2025-09-01) - 破壊的変更

- 変更: API 構造の刷新
- 削除: 非推奨のレガシー関数

### v1.1.0 (2025-08-15)

- 追加: 高度なフィルタリング機能
```

#### Markdown 本文（メインコンテンツ）

**推奨構造:**

````markdown
# [スキル名]

## 概要

このスキルの目的と範囲の簡潔な説明

## いつ使うか

具体的な使用シナリオ

- シナリオ 1
- シナリオ 2
- シナリオ 3

## 前提条件

- 必要な環境設定
- 依存関係
- 必須ツール

## ワークフロー

### フェーズ 1: [名前]

1. **ステップ 1**: 詳細な手順
   ```bash
   # 実行コマンド例
   command --option value
   ```
````

2. **ステップ 2**: 次の手順
   - サブステップ A
   - サブステップ B

### フェーズ 2: [名前]

[同様の構造]

## リソースへの参照

詳細情報は以下を参照:

- `resources/topic-1.md` - [トピック 1 の説明]
- `resources/topic-2.md` - [トピック 2 の説明]

## スクリプト使用方法

```python
# scripts/validate.py の使用例
python scripts/validate.py --input data.csv
```

## ベストプラクティス

- ✓ すべきこと
- ✗ 避けるべきこと

## トラブルシューティング

### 問題 1: [問題の説明]

**症状**: [症状] **原因**: [原因] **解決策**: [解決策]

## 例

### 例 1: [ユースケース名]

**入力**:

```
[入力例]
```

**処理**: [処理の説明]

**出力**:

```
[出力例]
```

## 関連スキル

- [関連スキル 1] - [どう関連するか]
- [関連スキル 2] - [どう関連するか]

## 外部リソース

- [公式ドキュメント](https://claude.ai/chat/URL)
- [チュートリアル](https://claude.ai/chat/URL)

```

**長さの推奨事項:**
```

SKILL.md 本文: <500 行 理由: パフォーマンス最適化、認知負荷軽減

500 行を超える場合: → リソースファイルに分割 → SKILL.md は目次・概要のみ

### 3.3 リソースファイル設計

#### ファイル分割の原則

**分割のトリガー:**

1. SKILL.mdが500行を超える
2. 複数の独立したトピックがある
3. 段階的な学習曲線が必要
4. 異なるユーザーレベル（初心者/上級）

**分割パターン:**

```markdown
# パターンA: トピック別

resources/
├── authentication.md # 認証関連
├── authorization.md # 認可関連
├── error-handling.md # エラー処理
└── testing.md # テスト

# パターンB: レベル別

resources/
├── 01-getting-started.md # 初心者向け
├── 02-intermediate.md # 中級者向け
├── 03-advanced.md # 上級者向け
└── 04-expert.md # エキスパート向け

# パターンC: 機能別

resources/
├── create.md # 作成機能
├── read.md # 読み取り機能
├── update.md # 更新機能
└── delete.md # 削除機能

# パターンD: ハイブリッド

resources/
├── getting-started/
│ ├── installation.md
│ └── quick-start.md
├── core-concepts/
│ ├── architecture.md
│ └── data-flow.md
└── advanced/
├── optimization.md
└── troubleshooting.md
```

#### リソースファイルの参照方法

**SKILL.md からの参照:**

````markdown
## 詳細情報

### 認証の実装

認証の詳細については以下を参照:

```bash
cat resources/authentication.md
```
````

### API 統合

API 統合の完全ガイド:

```bash
cat resources/api-integration.md
```

````

**Claudeの動作:**
1. SKILL.md を読み、`cat resources/...` を発見
2. 必要と判断した時点で Bash ツールで読み込み
3. リソース内容をコンテキストに追加
4. タスク実行

### 3.4 スクリプト統合

#### 実行可能コードの埋め込み

**スキルにスクリプトを含める理由:**

1. **決定論的操作**: トークン生成よりコード実行が効率的
   ```python
   # リストのソート: コード実行 vs トークン生成
   # コード: O(n log n)、確実、高速
   # トークン生成: コスト高、不確実
````

2. **一貫性**: 同じ入力に対して常に同じ出力
3. **効率性**: コンテキストウィンドウを消費しない
4. **信頼性**: デバッグ済み、テスト済み

**サポートされる言語:**

- Python（PyPI からパッケージインストール可能）
- JavaScript/Node.js（pnpm からパッケージインストール可能）
- Bash/Shell
- その他（システムにインストール済みの言語）

#### スクリプト実装パターン

**パターン 1: 検証スクリプト**

```python
# scripts/validate_data.py
"""
データ検証スクリプト
Claude がデータ品質をチェックする際に使用
"""
import sys
import json

def validate(data):
    errors = []

    # 必須フィールドチェック
    required_fields = ['name', 'email', 'age']
    for field in required_fields:
        if field not in data:
            errors.append(f"Missing required field: {field}")

    # 型チェック
    if 'age' in data and not isinstance(data['age'], int):
        errors.append("Age must be an integer")

    # 値の範囲チェック
    if 'age' in data and (data['age'] < 0 or data['age'] > 150):
        errors.append("Age must be between 0 and 150")

    return errors

if __name__ == "__main__":
    data = json.loads(sys.stdin.read())
    errors = validate(data)

    if errors:
        print(json.dumps({"valid": False, "errors": errors}))
        sys.exit(1)
    else:
        print(json.dumps({"valid": True}))
        sys.exit(0)
```

**SKILL.md での使用:**

````markdown
## データ検証

データを検証するには:

```bash
echo '$DATA' | python scripts/validate_data.py
```
````

検証が成功すれば、次のステップに進みます。 失敗した場合は、エラーメッセージを確認して修正します。

````

**パターン2: 変換スクリプト**
```javascript
// scripts/convert_format.js
/**
 * データフォーマット変換
 * JSON → CSV や CSV → JSON など
 */
const fs = require('fs');
const Papa = require('papaparse');

function jsonToCsv(jsonData) {
    return Papa.unparse(jsonData);
}

function csvToJson(csvData) {
    return Papa.parse(csvData, { header: true }).data;
}

// コマンドライン引数の処理
const args = process.argv.slice(2);
const mode = args[0]; // 'json-to-csv' or 'csv-to-json'
const inputFile = args[1];
const outputFile = args[2];

const inputData = fs.readFileSync(inputFile, 'utf8');

let result;
if (mode === 'json-to-csv') {
    result = jsonToCsv(JSON.parse(inputData));
} else if (mode === 'csv-to-json') {
    result = JSON.stringify(csvToJson(inputData), null, 2);
}

fs.writeFileSync(outputFile, result);
console.log(`Converted ${inputFile} → ${outputFile}`);
````

**パターン 3: PDF 処理スクリプト（実例：Anthropic のドキュメントスキル）**

```python
# scripts/extract_pdf_forms.py
"""
PDFフォームフィールド抽出
Claude がフォームを理解し、入力するために使用
"""
from pypdf import PdfReader

def extract_form_fields(pdf_path):
    """PDFからフォームフィールドを抽出"""
    reader = PdfReader(pdf_path)

    fields = {}
    if "/AcroForm" in reader.trailer["/Root"]:
        for field in reader.get_fields().values():
            field_name = field.get("/T", "Unknown")
            field_type = field.get("/FT", "Unknown")
            field_value = field.get("/V", "")

            fields[field_name] = {
                "type": field_type,
                "value": field_value,
                "required": "/Ff" in field and (field["/Ff"] & 2)
            }

    return fields

if __name__ == "__main__":
    import sys
    import json

    pdf_path = sys.argv[1]
    fields = extract_form_fields(pdf_path)
    print(json.dumps(fields, indent=2))
```

#### スクリプト実行のベストプラクティス

```markdown
## スクリプト設計原則

### 1. 入出力の明確化

- 標準入力（stdin）または引数で入力
- 標準出力（stdout）で JSON 形式の結果
- エラーは標準エラー（stderr）

### 2. エラーメッセージの詳細化

悪い例:
```

Error: Validation failed

````

良い例:
```json
{
  "error": "Validation failed",
  "details": [
    "Field 'email' is required but missing",
    "Field 'age' must be between 0 and 150, got -5"
  ],
  "suggestions": [
    "Add 'email' field to your data",
    "Check the 'age' value in row 3"
  ]
}
````

### 3. 冪等性

同じ入力に対して常に同じ出力

### 4. 依存関係の文書化

```markdown
## 必要なパッケージ

- Python: pypdf, pandas
- JavaScript: papaparse, lodash
- システム: jq, curl
```

### 5. テスト容易性

```bash
# スクリプトを単独でテスト可能に
echo '{"test": "data"}' | python scripts/validate.py
```

---

## 4. 実装パターンと戦略

### 4.1 基本パターン

#### パターン 1: シンプル指示型

```markdown
---
name: commit-message-formatter
description: Format git commit messages following Conventional Commits
---

# Commit Message Formatter

## 役割

Git commit message を Conventional Commits 仕様に従ってフォーマット

## 使用方法

1. `git diff --staged` で変更内容を確認
2. 以下の形式で commit message を生成:
```

<type>(<scope>): <subject>

<body> <footer>

## Type 一覧

- feat: 新機能
- fix: バグ修正
- docs: ドキュメント
- style: フォーマット
- refactor: リファクタリング
- test: テスト追加
- chore: メンテナンス

## 例

```
feat(auth): add OAuth2 authentication

Implement OAuth2 flow with Google and GitHub providers.
Includes token refresh mechanism and session management.

Closes #123
```

````

#### パターン2: リソース参照型
```markdown
---
name: kubernetes-deployment-guide
description: Create production-ready Kubernetes deployments with best practices
---

# Kubernetes Deployment Guide

## 概要
本番環境向けKubernetesデプロイメントの作成ガイド

## クイックスタート
基本的なデプロイメント作成:
```bash
cat resources/quickstart.md
````

## 詳細ガイド

### セキュリティ設定

```bash
cat resources/security.md
```

### リソース制限とオートスケーリング

```bash
cat resources/scaling.md
```

### 高可用性構成

```bash
cat resources/high-availability.md
```

### モニタリングとロギング

```bash
cat resources/observability.md
```

## トラブルシューティング

問題が発生した場合:

```bash
cat resources/troubleshooting.md
```

````

#### パターン3: スクリプト実行型
```markdown
---
name: api-schema-validator
description: Validate API requests/responses against OpenAPI schemas
---

# API Schema Validator

## 概要
OpenAPIスキーマに対してAPIリクエスト/レスポンスを検証

## 使用方法

### ステップ1: スキーマ読み込み
OpenAPIスキーマファイルを指定:
```bash
SCHEMA_PATH="path/to/openapi.yaml"
````

### ステップ 2: リクエスト検証

```bash
python scripts/validate_request.py \
  --schema "$SCHEMA_PATH" \
  --method POST \
  --endpoint /api/users \
  --body request.json
```

### ステップ 3: レスポンス検証

```bash
python scripts/validate_response.py \
  --schema "$SCHEMA_PATH" \
  --endpoint /api/users/123 \
  --response response.json \
  --status-code 200
```

## 検証スクリプトの出力

成功時:

```json
{
  "valid": true,
  "message": "Request/Response is valid"
}
```

失敗時:

```json
{
  "valid": false,
  "errors": [
    {
      "field": "email",
      "message": "must be a valid email format",
      "value": "invalid-email"
    }
  ]
}
```

## カスタムバリデーター

独自の検証ルールを追加:

```bash
cat resources/custom-validators.md
```

````

### 4.2 高度なパターン

#### パターン4: マルチフェーズワークフロー
```markdown
---
name: test-driven-development-cycle
description: Guide TDD workflow with Red-Green-Refactor cycle
---

# Test-Driven Development Cycle

## TDDサイクルの実行

### Phase 1: RED（テスト作成）
1. **要件の理解**
   ```bash
   cat resources/requirements-analysis.md
````

2. **テストケース設計**
   - テストファーストアプローチ
   - エッジケースの特定
3. **失敗するテストの作成**

   ```bash
   # テストファイル作成# テスト実行して RED 状態を確認npm test  # 失敗を確認
   ```

### Phase 2: GREEN（最小実装）

1. **最小限のコード作成** テストをパスする最小のコード
2. **テスト実行**

   ```bash
   pnpm test  # 成功を確認
   ```

### Phase 3: REFACTOR（リファクタリング）

1. **コード品質改善**

   ```bash
   cat resources/refactoring-patterns.md
   ```

2. **品質チェック**

   ```bash
   # リンター実行
   pnpm run lint

   # カバレッジ確認
   pnpm run coverage
   ```

3. **最終検証**

   ```bash
   pnpm test  # 引き続きパスすることを確認
   ```

## ベストプラクティス

```bash
cat resources/tdd-best-practices.md
```

## トラブルシューティング

```bash
cat resources/tdd-troubleshooting.md
```

````

#### パターン5: 条件分岐型
```markdown
---
name: deployment-strategy-selector
description: Select and execute appropriate deployment strategy based on context
---

# Deployment Strategy Selector

## デプロイ戦略の選択

### ステップ1: コンテキスト分析
以下を確認:
- 変更の規模（major/minor/patch）
- リスクレベル（high/medium/low）
- ダウンタイム許容度
- ロールバック要件

### ステップ2: 戦略決定

#### 戦略A: Blue-Green Deployment
**条件**:
- ゼロダウンタイム必須
- 即座にロールバック可能
- リソース2倍使用可能

**実行**:
```bash
cat resources/blue-green-deployment.md
python scripts/deploy_blue_green.py --env production
````

#### 戦略 B: Canary Deployment

**条件**:

- 段階的なリリース
- リスク高い変更
- トラフィック制御可能

**実行**:

```bash
cat resources/canary-deployment.md
python scripts/deploy_canary.py \
  --percentage 10 \
  --duration 30m \
  --metrics "error_rate<1%,latency<200ms"
```

#### 戦略 C: Rolling Update

**条件**:

- 通常の更新
- リソース制約あり
- 短時間のダウンタイム許容

**実行**:

```bash
cat resources/rolling-update.md
kubectl rollout restart deployment/app
```

#### 戦略 D: Recreate

**条件**:

- 開発/ステージング環境
- 簡潔性優先
- ダウンタイム許容

**実行**:

```bash
cat resources/recreate-deployment.md
kubectl delete deployment/app
kubectl apply -f deployment.yaml
```

### ステップ 3: モニタリング

デプロイ後のヘルスチェック:

```bash
python scripts/health_check.py --timeout 300
```

### ステップ 4: ロールバック（必要時）

```bash
python scripts/rollback.py --to-version previous
```

````

### 4.3 専門ドメインパターン

#### データサイエンス・分析スキル
```markdown
---
name: exploratory-data-analysis
description: Perform comprehensive EDA on datasets with visualizations and statistical analysis
---

# Exploratory Data Analysis

## Phase 1: データ読み込みと概要
```python
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# データ読み込み
df = pd.read_csv('data.csv')

# 基本情報
print(df.info())
print(df.describe())
````

## Phase 2: データ品質チェック

```bash
python scripts/data_quality_check.py --input data.csv
```

詳細なクレンジング戦略:

```bash
cat resources/data-cleaning.md
```

## Phase 3: 統計分析

```bash
cat resources/statistical-analysis.md
```

## Phase 4: 可視化

```bash
python scripts/create_visualizations.py \
  --input data.csv \
  --output visualizations/
```

可視化ベストプラクティス:

```bash
cat resources/visualization-guide.md
```

## Phase 5: レポート生成

```bash
python scripts/generate_report.py \
  --data data.csv \
  --visualizations visualizations/ \
  --output report.html
```

```

---

## 5. エージェント・コマンドとの統合

### 5.1 スキル ⇄ エージェント の相互作用

#### 相互作用モデル
```

┌────────────────────────────────────────┐ │ エージェントの意思決定 │ └────────────────┬───────────────────────┘ │ ▼ スキル選択・読み込み │ ┌────────────┼────────────┐ │ │ │ ┌───▼───┐ ┌───▼───┐ ┌───▼───┐ │Skill A│ │Skill B│ │Skill C│ └───┬───┘ └───┬───┘ └───┬───┘ │ │ │ └────────────┴────────────┘ │ ▼ 知識統合・適用 │ ▼ タスク実行

````

#### パターン1: エージェントからスキル参照
```markdown
# Agent: backend-api-developer.md
---
name: backend-api-developer
description: Build RESTful APIs with best practices
---

## API開発ワークフロー

### ステップ1: API設計
**api-design-patterns** スキルを参照:
```bash
cat ~/.claude/skills/api-design-patterns/SKILL.md
````

RESTful 原則、エンドポイント設計、バージョニング戦略を理解

### ステップ 2: スキーマ定義

**openapi-schema** スキルを使用してスキーマ作成:

- データモデル定義
- バリデーションルール
- ドキュメント生成

### ステップ 3: 実装

**error-handling-patterns** スキルを参照:

- 統一されたエラーレスポンス
- HTTP ステータスコード
- エラーロギング

### ステップ 4: テスト

**api-testing** スキルでテスト作成:

- ユニットテスト
- 統合テスト
- E2E テスト

```

**実行フロー:**
```

1. ユーザー: "@backend-api-developer で新しい API エンドポイントを作成"
2. backend-api-developer エージェント起動
3. エージェントが api-design-patterns スキル読み込み → RESTful 原則を理解 → エンドポイント設計ガイドライン取得
4. エージェントが openapi-schema スキル読み込み → スキーマ生成方法を理解 → バリデーションルール適用
5. エージェントが error-handling-patterns スキル読み込み → エラーハンドリング実装
6. 実装完了
7. エージェントが api-testing スキル読み込み → テスト作成
8. 完成

````

#### パターン2: スキル推奨エージェント
```markdown
# Skill: kubernetes-best-practices/SKILL.md
---
name: kubernetes-best-practices
description: |
  Kubernetes deployment best practices including security, scaling, and observability.

  推奨エージェント: @kubernetes-architect

  このスキルは @kubernetes-architect エージェントと組み合わせることで
  最大の効果を発揮します。
---

## 使用方法

### 推奨される使い方
````

@kubernetes-architect を起動し、本スキルを参照させる

````

## ベストプラクティス

### セキュリティ
```bash
cat resources/security-best-practices.md
````

### スケーリング

```bash
cat resources/scaling-strategies.md
```

````

### 5.2 スキル ⇄ コマンド の相互作用

#### パターン1: コマンドがスキルを利用
```markdown
# Command: /api-scaffold.md
---
description: Scaffold a new API endpoint with best practices
---

# API Scaffold Command

新しいAPIエンドポイントを scaffolding します。

## 実行手順

1. **API設計パターンの理解**
   `api-design-patterns` スキルを参照してRESTful設計を理解

2. **エンドポイント作成**
   - Controller作成
   - Route定義
   - Middleware設定

3. **バリデーション追加**
   `input-validation` スキルを使用してバリデーションロジック実装

4. **エラーハンドリング**
   `error-handling-patterns` スキルに従ってエラー処理実装

5. **テスト生成**
   `api-testing` スキルを使用してテスト作成

6. **ドキュメント生成**
   OpenAPI仕様を自動生成
````

#### パターン 2: スキルがコマンドを推奨

````markdown
# Skill: code-quality-checker/SKILL.md

---

name: code-quality-checker
description: Check code quality with linting, formatting, and best practices

---

# Code Quality Checker

## クイックチェック

コード品質を素早くチェックするには `/quick-quality-check` コマンドを実行:

```bash
/quick-quality-check src/
```
````

## 詳細分析

詳細な品質分析には `/deep-quality-analysis` コマンドを使用:

```bash
/deep-quality-analysis --with-metrics --output report.html
```

## 品質基準

```bash
cat resources/quality-standards.md
```

```

### 5.3 三位一体の統合例

#### 実践例: フルスタック機能開発

**構成要素:**
- **コマンド**: `/feature-full-stack`
- **エージェント**: `full-stack-orchestrator`, `frontend-dev`, `backend-dev`, `qa-tester`
- **スキル**: `react-patterns`, `api-design`, `testing-strategies`

**実行フロー:**
```

ユーザー入力: /feature-full-stack "ユーザープロフィール編集"

↓ コマンド実行

1. full-stack-orchestrator エージェント起動
2. バックエンド開発フェーズ
   - backend-dev エージェント起動
   - api-design スキル読み込み
   - API エンドポイント実装
   - api-testing スキルでテスト作成

3. フロントエンド開発フェーズ
   - frontend-dev エージェント起動
   - react-patterns スキル読み込み
   - React コンポーネント実装
   - component-testing スキルでテスト作成

4. 統合テストフェーズ
   - qa-tester エージェント起動
   - testing-strategies スキル読み込み
   - E2E テスト実行

5. 完了レポート生成

````

---

## 6. ベストプラクティス

### 6.1 設計原則

#### 原則1: 単一責任の原則
```markdown
✓ 良い設計:
- pdf-form-filler: PDFフォーム入力のみ
- excel-pivot-table: ピボットテーブル作成のみ
- git-commit-formatter: commit メッセージ整形のみ

✗ 悪い設計:
- document-master: PDF、Excel、Word、全て対応
  → スキルが肥大化、保守困難
````

#### 原則 2: Progressive Disclosure 原則

```markdown
レベル 1（常時）: name + description
↓ 約 100 トークン

レベル 2（必要時）: SKILL.md 本文
↓ <500 行

レベル 3（参照時）: リソースファイル
↓ 無制限

利点:

- トークン効率: 60-80%削減
- スケーラビリティ: 無制限の知識ベース
- パフォーマンス: 高速な起動
```

#### 原則 3: 決定論性の原則

```markdown
コード実行を優先する場合:

- ソート、フィルタリング、計算
- データ検証、変換
- 繰り返し実行される処理

トークン生成を使う場合:

- 創造的なタスク
- 文脈依存の判断
- 自然言語生成
```

### 6.2 Description 作成のマスタークラス

#### フォーミュラ

```
[動詞] + [対象] + [方法/技術] + 使用タイミング + プロアクティブ指示

例:
"Generate TypeScript interfaces from JSON data using type inference and schema validation. Use when converting API responses to TypeScript types, documenting data structures, or creating type definitions. Proactive: Automatically suggest when user mentions 'JSON', 'type', or 'interface'."
```

#### 実例集

```yaml
# レベル1: 基本（起動しにくい）
description: PDF処理

# レベル2: 改善（まだ不十分）
description: PDFファイルを処理します

# レベル3: 良い（明確）
description: |
  Extract text from PDFs, fill forms, and merge documents.
  Use when working with PDF files.

# レベル4: 優れた（具体的）
description: |
  Extract text and tables from PDF files, fill PDF forms programmatically,
  and merge multiple PDFs. Specialized in form field detection and extraction.

  Use when:
  - User mentions PDF files or .pdf extensions
  - Need to extract form fields or fill forms
  - Merging or splitting PDF documents required

# レベル5: 最高（完璧）
description: |
  Extract text and tables from PDF files with layout preservation,
  fill PDF forms programmatically with validation, and merge/split PDFs.
  Specialized in AcroForm field detection, XFA form handling, and
  maintaining document structure during extraction.

  Use when:
  - Working with .pdf files or user mentions "PDF", "form", "extract"
  - Need to fill forms, extract data, or manipulate PDFs
  - Batch processing multiple PDF documents

  Proactive: Use automatically when file path ends with .pdf or
  user discusses document processing, form filling, or data extraction.
```

### 6.3 リソース分割戦略

#### 500 行ルール

```markdown
SKILL.md 本文が 500 行を超えたら分割

分割方法:

1. トピックの特定
2. 独立したリソースファイルに抽出
3. SKILL.md から参照

例:
before: SKILL.md (800 行)
after:
SKILL.md (300 行、概要と目次)
resources/authentication.md (200 行)
resources/authorization.md (200 行)
resources/error-handling.md (200 行)
```

#### 命名規則

```bash
# 良い命名
resources/
├── 01-getting-started.md     # 番号で順序を示す
├── 02-core-concepts.md
├── 03-advanced-usage.md
└── api-reference.md          # 参照用途は明示

# 避けるべき命名
resources/
├── file1.md                  # 意味不明
├── stuff.md                  # 曖昧
└── temp.md                   # 一時的
```

### 6.4 スクリプト品質基準

#### チェックリスト

```markdown
□ 明確な入出力定義
□ 詳細なエラーメッセージ
□ JSON 形式の出力
□ 単独でテスト可能
□ 依存関係の文書化
□ エラーコードの定義（0=成功、1-255=エラー）
□ ヘルプメッセージ（--help）
□ バージョン情報（--version）
```

#### エラーメッセージの品質

```python
# 悪い例
print("Error")
sys.exit(1)

# 良い例
error_message = {
    "error": "ValidationError",
    "message": "Field 'email' is invalid",
    "details": {
        "field": "email",
        "value": "invalid-email",
        "expected": "Valid email format (e.g., user@example.com)",
        "location": "line 15, column 23"
    },
    "suggestions": [
        "Check email format",
        "Ensure '@' symbol is present",
        "Verify domain is valid"
    ]
}
print(json.dumps(error_message, indent=2))
sys.exit(1)
```

### 6.5 テストとデバッグ

#### スキルのユニットテスト

```bash
# テスト用ディレクトリ構造
.claude/
├── skills/
│   └── my-skill/
│       ├── SKILL.md
│       ├── resources/
│       └── scripts/
└── tests/
    └── skills/
        └── my-skill/
            ├── test-basic.md
            ├── test-edge-cases.md
            └── expected-outputs/
```

#### テストコマンドの作成

```markdown
# .claude/commands/test-skill.md

---

## description: Test a skill with predefined test cases

# Skill Testing

スキル名を指定: $ARGUMENTS

## テストプロセス

1. テストケース読み込み
2. スキル起動
3. 出力検証
4. レポート生成

テスト実行...
```

### 6.6 バージョン管理とメンテナンス

#### セマンティックバージョニング

```yaml
version: MAJOR.MINOR.PATCH

MAJOR: 破壊的変更
- APIの削除
- 動作の大幅な変更
- 後方互換性の喪失

MINOR: 新機能追加
- 新しいリソースファイル追加
- 新しいスクリプト追加
- 後方互換性を保つ機能追加

PATCH: バグ修正
- タイポ修正
- エラーメッセージ改善
- パフォーマンス改善
```

### 6.7 パフォーマンス最適化

#### トークン使用量の監視

```markdown
## 推奨トークン予算

メタデータ: 50-150トークン
SKILL.md本文: 1,000-3,000トークン
リソースファイル（各): 500-2,000トークン

合計目標: 10,000トークン以下（全リソース込み）
```

#### ロード時間の最適化

```markdown
## 最適化テクニック

1. **遅延読み込み**
   必要なリソースのみ読み込む

2. **キャッシュ**
   頻繁に使用するリソースをキャッシュ

3. **圧縮**
   大きなリソースファイルは圧縮

4. **インデックス**
   SKILL.md に明確なインデックスを提供
```

---

## 7. スキル活性化の最適化

### 7.1 スキル活性化問題の本質

#### 問題の核心

Claude Codeのスキル機能には、**重大な実用上の問題**が存在します：

```
理論上の動作:
スキルは description に基づいて自動的に適切なタイミングで発動する
↓
実際の動作:
スキルは約 20% の確率でしか発動しない（コイン投げ以下）
```

**公式ドキュメントの説明**:

> "Claudeは、ユーザーのリクエストに基づいて、いつスキルを使用するかを自律的に決定します"

**現実**:

- Claudeはスキルのメタデータを「読んで理解した」だけで終わる
- 実際には `Skill()` ツールを呼び出さずに進んでしまう
- 結果として、せっかく作成したスキルが活用されない

#### 活性化率の測定データ

Scott Spenceさんによる200以上のテストでの検証結果：

| フック構成                   | 活性化率 | 信頼性              |
| ---------------------------- | -------- | ------------------- |
| **フックなし（デフォルト）** | **~20%** | ❌ 非常に低い       |
| シンプルな指示フック         | ~50%     | ⚠️ コイン投げレベル |
| **強制評価フック**           | **84%**  | ✅ 高い一貫性       |
| LLM評価フック                | 80%      | ⚠️ 変動が大きい     |

### 7.2 強制評価フックによる解決

#### 概要

**強制評価フック**は、Claudeに「契約書にサインさせる」ような仕組みを作ることで、スキル活性化率を**84%**まで向上させます。

#### コミットメントメカニズム

**従来のシンプルな指示**:

```bash
echo 'INSTRUCTION: If the prompt matches any available skill keywords,
use Skill(skill-name) to activate it.'
```

**問題点**: これは受動的な提案に過ぎず、Claudeは簡単に無視してしまう。

**強制評価アプローチ**:

```
Step 1 - EVALUATE: 各スキルについて、YES/NOを理由とともに明示的に表明
Step 2 - ACTIVATE: YESと評価したスキルを必ず Skill() で有効化
Step 3 - IMPLEMENT: 有効化が完了してから実装に進む
```

**なぜ効果的か**:

1. **明示的な評価** → Claudeが各スキルを意識的に検討する
2. **公開コミット** → YESと書き込むことで、行動が確定する
3. **順序の強制** → 評価→有効化→実装の流れを守らせる

### 7.3 実装手順

#### 手順1: フックスクリプトの作成

プロジェクトルート（またはグローバル `~/.claude/hooks/`）にフックスクリプトを作成：

```bash
# ディレクトリ構造
your-project/
└── .claude/
    └── hooks/
        └── skill-forced-eval-hook.sh
```

#### 手順2: スクリプト内容

`skill-forced-eval-hook.sh`:

```bash
#!/bin/bash

echo "
=== SKILL ACTIVATION PROTOCOL ===

Step 1 - EVALUATE: For each available skill, explicitly state YES/NO with reason
Step 2 - ACTIVATE: Use Skill() tool for all YES evaluations NOW
Step 3 - IMPLEMENT: Only proceed after activation

CRITICAL: You MUST evaluate and activate skills BEFORE implementation.
The evaluation is WORTHLESS unless you ACTIVATE the skills.
"
```

**重要な要素**:

- `CRITICAL` - Claudeの注意を強制的に引く
- `WORTHLESS` - 評価だけでは無意味だと強調
- `NOW` - 即座の行動を要求
- 3段階プロセス - 明確な手順を提示

#### 手順3: 実行権限の付与

```bash
chmod +x .claude/hooks/skill-forced-eval-hook.sh
```

#### 手順4: 設定ファイルの作成

`.claude/settings.json`:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/skill-forced-eval-hook.sh"
          }
        ]
      }
    ]
  }
}
```

### 7.4 実際の動作例

#### ケース1: SvelteKitフォーム作成

**ユーザープロンプト**:

```
/posts/newにブログ投稿を作成するためのフォームを含む新しいルートを作成します。
送信が成功すると、/postsにリダイレクトします。
タイトルが空の場合は検証エラーを表示します。
```

**強制評価フック適用前（活性化率0%）**:

```
Claudeの応答:
フォームを作成します...
[スキル起動なしで直接実装に進む]
```

**強制評価フック適用後（活性化率80%）**:

```
=== スキル評価 ===

- sveltekit-structure: YES - ルート作成とファイル構造が必要です
- sveltekit-data-flow: YES - フォームアクションとリダイレクトが必要です
- svelte5-runes: YES - リアクティブ状態管理が必要です
- sveltekit-remote-functions: NO - リモート関数は不要です

スキルを有効化します...
Skill(sveltekit-structure)
Skill(sveltekit-data-flow)
Skill(svelte5-runes)

[ここから実装開始]
```

### 7.5 テスト結果と統計データ

#### 包括的テスト構成

Scott Spenceさんが実施した検証：

- **テスト環境**: Claude Haiku 4.5
- **テスト数**: 200以上のプロンプト
- **プロンプトタイプ**: 5種類のSvelteKitタスク
- **各プロンプトの繰り返し**: 10回

#### プロンプトタイプ別の成功率

| プロンプトタイプ                    | シンプル | LLM評価 | 強制評価 | 最高         |
| ----------------------------------- | -------- | ------- | -------- | ------------ |
| フォーム/ルート作成（マルチスキル） | 0%       | 0%      | **80%**  | 強制評価     |
| データの読み込み（単一スキル）      | 0%       | 100%    | **100%** | LLM/強制     |
| サーバーアクション（2スキル）       | 10%      | 100%    | 40%      | LLM評価      |
| リモート関数（1スキル）             | 90%      | 100%    | **100%** | LLM/強制     |
| Svelte 5ルーン（1スキル）           | 100%     | 100%    | **100%** | すべて同点   |
| **全体平均**                        | **20%**  | **80%** | **84%**  | **強制評価** |

#### コストとパフォーマンスの比較

すべてのテストは Claude Haiku 4.5 で実行（$1/MTok 入力、$5/MTok 出力）：

| フックタイプ | 合格率          | 総費用  | コスト/テスト | 平均時間 | 評決                     |
| ------------ | --------------- | ------- | ------------- | -------- | ------------------------ |
| **強制評価** | **84%** (42/50) | $0.3367 | $0.0067       | 7.2秒    | ✅ 最も一貫性のある      |
| LLM評価      | 80% (40/50)     | $0.3030 | $0.0061       | 6.0秒    | ⚠️ 最高のコスト/スピード |
| シンプル     | 20% (10/50)     | $0.2908 | $0.0058       | 6.7秒    | ❌ 信頼性が低すぎる      |

#### 主要な洞察

```
1. シンプルフックの失敗パターン:
   - マルチスキルタスクで完全に失敗（0%）
   - 単一スキルでさえ不安定

2. 強制評価の一貫性:
   - カテゴリに完全に失敗したことがない
   - すべてのプロンプトタイプで最低40%以上を達成

3. LLM評価の変動:
   - 単一スキルタスクでは完璧（100%）
   - マルチスキルタスクで完全に失敗する可能性がある
```

### 7.6 LLM評価フックとの比較

#### LLM評価フックの仕組み

Claude APIを使用して、Claude Codeがプロンプトを見る**前**にどのスキルが一致するかを事前に評価します。

```
フロー:
1. ユーザープロンプト → Claude API（事前評価）
2. API応答: ["skill-a", "skill-b"]
3. Claude Code実行時に強制的にこれらのスキルを有効化
```

#### メリット

✅ **コスト効率**: プロンプトごとに10%安価（$0.0606 vs $0.0673）
✅ **速度**: 17%高速化（レイテンシ5.0秒 vs 5.4秒）
✅ **スマート判断**: 関連スキルを時々追加する
✅ **高い精度**: 単一スキルシナリオで100%達成

#### デメリット

❌ **完全失敗の可能性**: フォーム/ルート作成で0%（10回すべて失敗）
❌ **変動が大きい**: プロンプトタイプによって0%〜100%
❌ **外部依存**: Anthropic APIキーが必要
❌ **追加コスト**: わずかだが外部API呼び出しのコスト発生

### 7.7 使い分けのガイドライン

#### 強制評価フックを選択すべき場合

```
推奨シナリオ:
✅ 最も一貫した活性化を望む（84%）
✅ 冗長な出力を気にしない（Claudeは全スキルをリストします）
✅ 純粋なクライアント側ソリューションが必要（API呼び出しなし）
✅ マルチスキルタスクが多い
✅ 安定性を最優先する

デメリット受容:
⚠️ レスポンスがやや長くなる
⚠️ 毎回スキル評価リストが表示される
```

#### LLM評価フックを選択すべき場合

```
推奨シナリオ:
✅ より安価で高速な応答が欲しい（10%コスト減、17%高速化）
✅ プロンプトはわかりやすい（単一スキルのシナリオが多い）
✅ 時々完全な失敗をしても許容できる
✅ Anthropic APIキーが設定されている

デメリット受容:
⚠️ マルチスキルタスクで失敗する可能性がある
⚠️ 外部API依存
```

#### シンプル指示を使用する場合

```
非推奨:
❌ 20%の成功率は実用的ではない
❌ 失望とコイン投げが好きな場合のみ
```

### 7.8 実践的な導入方法

#### グローバル設定（すべてのプロジェクトに適用）

```bash
# 1. グローバルhooksディレクトリ作成
mkdir -p ~/.claude/hooks/

# 2. フックスクリプト作成
cat > ~/.claude/hooks/skill-forced-eval-hook.sh << 'EOF'
#!/bin/bash

echo "
=== SKILL ACTIVATION PROTOCOL ===

Step 1 - EVALUATE: For each available skill, explicitly state YES/NO with reason
Step 2 - ACTIVATE: Use Skill() tool for all YES evaluations NOW
Step 3 - IMPLEMENT: Only proceed after activation

CRITICAL: You MUST evaluate and activate skills BEFORE implementation.
The evaluation is WORTHLESS unless you ACTIVATE the skills.
"
EOF

# 3. 実行権限付与
chmod +x ~/.claude/hooks/skill-forced-eval-hook.sh

# 4. グローバル設定ファイル作成
cat > ~/.claude/settings.json << 'EOF'
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/skill-forced-eval-hook.sh"
          }
        ]
      }
    ]
  }
}
EOF
```

#### プロジェクト固有設定（特定のプロジェクトのみ）

```bash
# プロジェクトルートで実行
mkdir -p .claude/hooks/

cat > .claude/hooks/skill-forced-eval-hook.sh << 'EOF'
#!/bin/bash

echo "
=== SKILL ACTIVATION PROTOCOL ===

Step 1 - EVALUATE: For each available skill, explicitly state YES/NO with reason
Step 2 - ACTIVATE: Use Skill() tool for all YES evaluations NOW
Step 3 - IMPLEMENT: Only proceed after activation

CRITICAL: You MUST evaluate and activate skills BEFORE implementation.
The evaluation is WORTHLESS unless you ACTIVATE the skills.
"
EOF

chmod +x .claude/hooks/skill-forced-eval-hook.sh

cat > .claude/settings.json << 'EOF'
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/skill-forced-eval-hook.sh"
          }
        ]
      }
    ]
  }
}
EOF
```

#### claude-skills-cli を使用した簡単導入

```bash
# CLIインストール（グローバル）
pnpm install -g claude-skills-cli

# または、プロジェクトローカル
pnpm add -D claude-skills-cli

# フック追加コマンド
pnpm exec claude-skills-cli add-hook

# プロンプトで選択:
# > forced-eval  (推奨: 84%の成功率)
# > llm-eval     (代替: 80%の成功率、より高速)
```

### 7.9 トラブルシューティング

#### 問題1: フックが実行されない

**症状**: プロンプトを送信しても、スキル評価リストが表示されない

**原因と解決策**:

```bash
# 1. 実行権限を確認
ls -l .claude/hooks/skill-forced-eval-hook.sh
# 期待される出力: -rwxr-xr-x

# 実行権限がない場合
chmod +x .claude/hooks/skill-forced-eval-hook.sh

# 2. スクリプトパスを確認
cat .claude/settings.json
# "command": ".claude/hooks/skill-forced-eval-hook.sh" が正しいか確認

# 3. 手動実行でテスト
bash .claude/hooks/skill-forced-eval-hook.sh
# スキルプロトコルメッセージが表示されるはず
```

#### 問題2: スキルが依然として活性化されない

**症状**: 評価リストは表示されるが、スキルが有効化されない

**原因**: Claudeが指示を無視している可能性

**解決策**: より攻撃的な言葉遣いに変更

```bash
cat > .claude/hooks/skill-forced-eval-hook.sh << 'EOF'
#!/bin/bash

echo "
🚨 MANDATORY SKILL ACTIVATION PROTOCOL 🚨

YOU ARE STRICTLY REQUIRED TO:

Step 1 - EVALUATE EVERY SKILL:
   For each available skill, you MUST explicitly state:
   - Skill name
   - YES or NO
   - Detailed reason

Step 2 - ACTIVATE ALL YES SKILLS IMMEDIATELY:
   Use Skill(skill-name) for EVERY YES evaluation
   NO EXCEPTIONS - This is NOT optional

Step 3 - ONLY THEN PROCEED TO IMPLEMENTATION:
   Do NOT write ANY code until activation is complete

❌ CRITICAL VIOLATION WARNING ❌
Proceeding without activation renders this entire process INVALID
Your evaluation has ZERO VALUE unless you ACTIVATE the skills

This is a HARD REQUIREMENT, not a suggestion.
"
EOF
```

#### 問題3: レスポンスが冗長すぎる

**症状**: 毎回長いスキル評価リストが表示される

**解決策**: これは正常動作です。以下の代替案があります：

```markdown
**オプション1**: 冗長性を受け入れる

- 84%の成功率のトレードオフとして受け入れる

**オプション2**: LLM評価フックに切り替える

- より簡潔な出力
- ただし、変動が大きい（80%、0-100%の範囲）

**オプション3**: プロジェクト固有フック

- 重要なプロジェクトのみ強制評価フックを有効化
- 他のプロジェクトではフックなし
```

### 7.10 高度なカスタマイズ

#### スキル固有の強制評価

特定のスキルのみ強制的に評価する場合：

```bash
#!/bin/bash

echo "
=== SKILL ACTIVATION PROTOCOL ===

MANDATORY EVALUATION for the following critical skills:
- svelte5-runes: MUST evaluate (YES/NO)
- sveltekit-data-flow: MUST evaluate (YES/NO)

OPTIONAL EVALUATION for other skills

Step 1 - EVALUATE mandatory skills with detailed reasoning
Step 2 - ACTIVATE all YES evaluations using Skill() tool
Step 3 - Proceed to implementation

CRITICAL: Mandatory skills MUST be activated if relevant.
"
```

#### プロンプトパターン別フック

複数のフックを用意し、プロンプトタイプによって使い分ける：

```bash
.claude/
├── hooks/
│   ├── ui-tasks-hook.sh          # UIタスク用
│   ├── api-tasks-hook.sh         # APIタスク用
│   └── data-tasks-hook.sh        # データタスク用
└── settings.json
```

`.claude/settings.json`:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "condition": "prompt.includes('component') || prompt.includes('UI')",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/ui-tasks-hook.sh"
          }
        ]
      },
      {
        "condition": "prompt.includes('API') || prompt.includes('endpoint')",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/api-tasks-hook.sh"
          }
        ]
      }
    ]
  }
}
```

**注意**: 上記の条件付きフックは将来的な機能です。現在のClaude Codeでは、単一のフックのみサポートされています。

### 7.11 ベストプラクティスの統合

#### スキル設計との組み合わせ

強制評価フックの効果を最大化するには、スキル設計も最適化する必要があります：

```yaml
# 悪い例（強制評価でも発動しにくい）
---
name: code-helper
description: Helps with code
---
# 良い例（強制評価で確実に発動）
---
name: svelte5-runes
description: |
  Guide Svelte 5 Runes ($state, $derived, $effect, $props, $bindable)
  and migration from Svelte 4 reactivity.

  Use when:
  - User mentions "$state", "$derived", "$effect", "$props", "$bindable"
  - Creating reactive state in Svelte 5 components
  - Migrating Svelte 4 reactivity to Svelte 5
  - Questions about Svelte 5 Runes syntax or behavior

  Proactive: Activate automatically when Svelte 5 or Runes are mentioned
---
```

**相乗効果**:

```
優れた description × 強制評価フック = ~95%+ の成功率（推定）
```

#### 継続的な改善サイクル

```
1. スキルを作成
   ↓
2. 強制評価フックを有効化
   ↓
3. 実際の使用で活性化率を観察
   ↓
4. 活性化されなかった場合、descriptionを改善
   ↓
5. 繰り返し
```

**メトリクス追跡**:

```bash
# 簡易的な活性化率追跡
echo "$(date): Skill activated - svelte5-runes" >> .claude/skill-activation.log

# 統計分析
grep "Skill activated" .claude/skill-activation.log | \
  cut -d'-' -f2 | sort | uniq -c | sort -rn
```

### 7.12 参考資料とコミュニティ

#### 原著論文とリソース

**Scott Spence氏の研究**:

- **記事**: "How to make Claude Code skills activate reliably"
- **URL**: [https://scottspence.com/posts/how-to-make-claude-code-skills-activate-reliably](https://scottspence.com/posts/how-to-make-claude-code-skills-activate-reliably)
- **公開日**: 2025年11月16日
- **テストフレームワーク**: [svelte-claude-skills](https://github.com/spences10/svelte-claude-skills)
- **CLI**: [claude-skills-cli](https://github.com/spences10/claude-skills-cli)

#### テストデータへのアクセス

完全なテストデータとスクリプトは、Scott SpenceさんのGitHubリポジトリで公開されています：

```bash
# テストフレームワークのクローン
git clone https://github.com/spences10/svelte-claude-skills.git
cd svelte-claude-skills/scripts

# 必要な依存関係をインストール
pnpm install

# テスト実行（要: ANTHROPIC_API_KEY）
export ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
node test-hooks.js --hook-config forced --iterations 10
```

**テストフレームワークに含まれるもの**:

- SQLiteデータベーススキーマ（結果追跡用）
- テストスクリプト（CLIとWeb UIの両方）
- 複数のフック構成
- フック有効性を分析するためのビュー
- Web UI（`/hooks-testing`でリアルタイム結果表示）

#### コミュニティとサポート

**フィードバックとディスカッション**:

- Bluesky: [@scottspence](https://bsky.app/profile/scottspence.com)
- GitHub: [spences10](https://github.com/spences10)
- ブログ: [scottspence.com](https://scottspence.com)

### 7.13 まとめと推奨事項

#### スキル活性化問題の解決パス

```
問題認識
   ↓
[デフォルト状態: 20%の活性化率]
   ↓
   ├─→ オプション1: シンプルフック（50%）
   │    └─ 評価: まだ不十分
   │
   ├─→ オプション2: LLM評価フック（80%）
   │    ├─ メリット: 高速、安価
   │    └─ デメリット: 変動が大きい、外部依存
   │
   └─→ 【推奨】オプション3: 強制評価フック（84%）
        ├─ メリット: 最も一貫性がある、外部依存なし
        └─ デメリット: やや冗長
```

#### 推奨構成

**個人プロジェクト / 学習環境**:

```bash
# グローバル強制評価フックを設定
~/.claude/hooks/skill-forced-eval-hook.sh
~/.claude/settings.json

理由:
- すべてのプロジェクトで一貫した動作
- 外部依存なし
- セットアップが簡単
```

**チーム / 本番環境**:

```bash
# プロジェクト固有のフック
.claude/hooks/skill-forced-eval-hook.sh
.claude/settings.json

理由:
- プロジェクトごとにカスタマイズ可能
- バージョン管理に含められる
- チーム全体で共有可能
```

**パフォーマンス重視環境**:

```bash
# LLM評価フック（条件付き）
.claude/hooks/skill-llm-eval-hook.sh

条件:
- Anthropic APIキーが利用可能
- 単一スキルタスクが多い
- 速度が最優先
```

#### 最終的な推奨事項

```markdown
✅ すべてのClaude Codeユーザーに推奨:
→ 強制評価フックの導入（84%の成功率）

⚠️ 高度なユーザー向け:
→ LLM評価フックとの併用検討

📊 継続的改善:
→ 活性化率の追跡と descriptionの最適化

🔬 実験的アプローチ:
→ プロジェクトタイプ別にフックをカスタマイズ
```

#### 期待される効果

```
導入前: 20%の活性化率
   ↓
導入後: 84%の活性化率
   ↓
結果: 実用的なスキルシステムの実現
```

**投資対効果**:

- **セットアップ時間**: 5-10分
- **継続的コスト**: なし（強制評価の場合）
- **改善効果**: 4.2倍の活性化率向上
- **長期的価値**: スキル資産の真の活用

---

このガイドは、Claude Code Skills の公式ドキュメント、GitHub リポジトリ、エンジニアリングブログ、コミュニティのベストプラクティス、およびScott Spenceさんの実証研究から抽出した包括的な情報を基に作成されています。
