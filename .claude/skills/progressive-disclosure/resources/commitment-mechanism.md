# コミットメントメカニズム設計ガイド

## 概要

スキル発動率を向上させるための「コミットメントメカニズム」の設計と実装方法。
AIに明示的な評価と行動を強制することで、発動率を50%から84%に向上させます。

## コミットメントメカニズムの本質

### 問題: なぜスキルが発動しないのか

**典型的なAIの動作**:
```
ユーザー: "データベーススキーマを設計して"

AI（内心）:
"database-designスキルがあるな...
 でもSKILL.mdを読むのは面倒だな...
 自分の知識だけで十分そうだな..."

→ スキルを発動せずに実装開始（発動率: 20%）
```

**問題の本質**:
- AIがスキルの評価を「なんとなく」で済ませる
- 評価と行動が分離している
- コミットメント（約束）がない

---

### 解決: コミットメントの強制

**コミットメントメカニズム**:
```
Step 1 - EVALUATE（評価）:
各スキルについて、YES/NOを理由とともに明示的に表明

Step 2 - ACTIVATE（約束）:
YESと評価したスキルを必ず Skill() ツールで有効化

Step 3 - IMPLEMENT（実行）:
有効化が完了してから実装に進む
```

**AIの動作（コミットメント適用後）**:
```
ユーザー: "データベーススキーマを設計して"

AI:
"=== スキル評価 ===
database-design: YES - データベーススキーマ設計が必要
react-hooks: NO - Reactは使用しない
api-integration: NO - API連携は不要

スキルを有効化します...
Skill(database-design)

[ここから実装開始]"

→ スキルが確実に発動（発動率: 84%）
```

**なぜ効果的か**:
1. **明示的な評価**: 各スキルを意識的に検討
2. **公開コミット**: YESと書き込むことで行動が確定
3. **順序の強制**: 評価→有効化→実装の順序を守る

---

## 実装方法

### 方法1: Hookによる強制評価

**スクリプト**: `.claude/hooks/skill-forced-eval-hook.sh`

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

**設定**: `.claude/settings.json` または `.claude/settings.local.json`

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

**動作フロー**:
```
ユーザーがプロンプト送信
↓
Hook発動: 評価プロトコルを表示
↓
AIが各スキルをYES/NOで評価
↓
YESのスキルをSkill()で有効化
↓
実装開始
```

**発動率**: 50% → 84%（68%向上）

---

### 方法2: description内の指示強化

**原則**: descriptionにプロアクティブ指示を含める

**実装**:
```yaml
description: |
  [概要]

  [専門分野]

  [使用タイミング]

  Use proactively when [明示的な条件].
  You MUST activate this skill BEFORE [特定の操作].
```

**例**:
```yaml
name: database-migrations
description: |
  データベーススキーマのマイグレーション設計と実装。

  使用タイミング:
  - マイグレーションファイルを作成する時
  - スキーマを変更する時

  Use proactively when modifying database schema.
  You MUST activate this skill BEFORE creating migration files.
```

**発動率向上**: 約10-15%

---

### 方法3: コミットメント記録の要求

**原則**: AIに評価結果を明示的に記録させる

**SKILL.md内の指示**:
```markdown
## このスキルを使用する前に

以下の評価を明示的に行ってください:

### スキル適合性チェック
- [ ] このタスクは[domain]に関連するか？
- [ ] [operation]を実行する必要があるか？
- [ ] [前提条件]が満たされているか？

すべてチェックが通る場合、このスキルを有効化してください。
```

**発動率向上**: 約5-10%

---

## コミットメントの段階

### 段階1: 認識（Awareness）

**目的**: スキルの存在を認識させる

**方法**:
- descriptionに明確なトリガーキーワード
- 使用タイミングの具体的な列挙

**成功基準**: AIがスキルを「認識」する（発動: 約30%）

---

### 段階2: 評価（Evaluation）

**目的**: スキルの適合性を判断させる

**方法**:
- Hookによる評価プロトコル
- 評価基準の明示

**成功基準**: AIがスキルを「評価」する（発動: 約50%）

---

### 段階3: 約束（Commitment）

**目的**: 適合すると判断したスキルを宣言させる

**方法**:
- YES/NOの明示的な表明
- 理由の記述

**成功基準**: AIがYESと「宣言」する（発動: 約70%）

---

### 段階4: 実行（Activation）

**目的**: 宣言したスキルを必ず有効化させる

**方法**:
- 強制評価プロトコルの「ACTIVATE」ステップ
- 評価と行動の一貫性を要求

**成功基準**: AIがSkill()ツールを「実行」する（発動: 約84%）

---

## 発動率の測定

### テストプロンプトセットの作成

**構成**:
- 基本シナリオ: 3-5個
- 応用シナリオ: 2-3個
- エッジケース: 1-2個

**例（react-hooksスキル）**:
```markdown
## テストプロンプトセット

1. "useStateでカウンターを実装" （基本）
2. "useEffectでデータフェッチ" （基本）
3. "不要な再レンダリングを防ぐ" （基本）
4. "カスタムフックを作成" （応用）
5. "useCallbackとuseMemoの使い分け" （応用）
6. "useLayoutEffectの適切な使用法" （エッジケース）

期待: すべてでreact-hooksが発動
```

### 発動率の計算

```
発動率 = (発動した回数 / テスト総数) × 100

例:
テスト総数: 6
発動: 5回
発動率: 5/6 × 100 = 83.3%
```

### 改善アクションの判断

**発動率 < 50%**: description全体の再設計
- トリガーキーワードを大幅に追加
- 使用タイミングを具体化
- 技術名を明示

**発動率 50-70%**: トリガーの強化
- 使用タイミングを3個→5個に増やす
- 除外条件を明示
- プロアクティブ指示を追加

**発動率 70-85%**: コミットメントメカニズム導入
- Hookによる強制評価
- 評価基準の明示

**発動率 > 85%**: 微調整
- エッジケースへの対応
- 誤発動の防止

---

## 実践例

### 例: database-designスキルの改善

**初期（発動率: 25%）**:
```yaml
description: データベース設計に関するスキル。
```

**改善1: トリガー追加（発動率: 55%）**:
```yaml
description: |
  データベーススキーマ、インデックス設計を専門とするスキル。

  使用タイミング:
  - スキーマを設計する時
  - インデックスを追加する時
```

**改善2: 具体化（発動率: 75%）**:
```yaml
description: |
  PostgreSQL/Drizzle ORMによるデータベーススキーマ、インデックス、トランザクション設計。

  専門分野:
  - スキーマ設計: 正規化、JSONB活用
  - インデックス戦略: B-Tree、GIN、カーディナリティ

  使用タイミング:
  - データベーススキーマを設計する時
  - Drizzleマイグレーションを作成する時
  - インデックスを最適化する時
  - クエリパフォーマンスを改善する時
```

**改善3: Hook導入（発動率: 86%）**:
- 上記description + 強制評価プロトコル

---

## 継続的改善

### 改善サイクル

```
測定 → 分析 → 改善 → 再測定
  ↑                    ↓
  └────────────────────┘
```

**測定**: テストプロンプトで発動率計算
**分析**: 未発動のパターンを特定
**改善**: description更新またはHook調整
**再測定**: 改善効果の確認

### バージョニングとの連携

```
発動率改善のためのdescription変更: minor version更新
例: 1.0.0 → 1.1.0

コミットメントメカニズムの導入: major version更新
例: 1.1.0 → 2.0.0
```

---

## 参考文献

- Scott Spence氏のブログ: スキル発動率研究
- **『Nudge』** Richard Thaler著 - 選択アーキテクチャ
