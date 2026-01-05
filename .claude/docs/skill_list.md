# スキル一覧

18-skills.md仕様に準拠したスキルの一覧です。

## ドメイン関連スキル

| スキル名                   | 説明                                         | バージョン |
| -------------------------- | -------------------------------------------- | ---------- |
| documentation-architecture | ドキュメント構造設計・リソース分割・階層設計 | 2.0.0      |
| domain-driven-design       | DDDの戦術的パターンによるドメインモデル設計  | 2.0.0      |
| domain-event-patterns      | ドメインイベント・CQRS・イベントソーシング   | 2.0.0      |
| domain-modeling            | Entity/VO/Aggregateのモデリング              | 2.0.0      |
| domain-services            | ドメインサービスの設計と実装                 | 2.0.0      |

## スキル構造

各スキルは以下の構造を持ちます:

```
.claude/skills/{skill-name}/
├── SKILL.md           # スキル定義（500行制限）
├── EVALS.json         # 評価・レベル管理
├── LOGS.md            # 使用ログ
├── agents/            # Task仕様書
├── references/        # 詳細知識リソース
├── scripts/           # 検証・記録スクリプト
└── assets/            # テンプレート
```

## 仕様準拠状況

- 18-skills.md仕様に完全準拠
- Anchors/Trigger形式のフロントマター
- Task仕様書（5セクション構造）
- 検証スクリプト付属
