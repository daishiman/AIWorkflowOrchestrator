---
name: .claude/skills/prompt-versioning-management/SKILL.md
description: |
  プロンプトのライフサイクル管理を専門とするスキル。
  バージョン管理、デプロイ戦略、ロールバック、変更追跡により、
  本番環境で安全かつ効率的なプロンプト運用を実現します。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/prompt-versioning-management/resources/deployment-patterns.md`: Blue-Green、Canary、Feature Flagなどのデプロイ戦略と実装手順
  - `.claude/skills/prompt-versioning-management/resources/rollback-procedures.md`: 即座・段階的ロールバック手順とフォールバック設計パターン
  - `.claude/skills/prompt-versioning-management/resources/versioning-strategies.md`: セマンティックバージョニング、変更分類、依存関係管理の詳細
  - `.claude/skills/prompt-versioning-management/templates/changelog-template.md`: 変更ログテンプレート
  - `.claude/skills/prompt-versioning-management/templates/deployment-checklist.md`: デプロイチェックリスト

  専門分野:
  - バージョン管理: セマンティックバージョニング、変更履歴、差分管理
  - デプロイ戦略: Blue-Green、Canary、段階的ロールアウト
  - ロールバック: 即座復旧、部分ロールバック、フォールバック
  - 変更追跡: 監査ログ、影響分析、依存関係追跡

  使用タイミング:
  - プロンプトを本番環境にデプロイする時
  - プロンプトの変更履歴を管理する時
  - ロールバック戦略を設計する時
  - プロンプトの依存関係を追跡する時
version: 1.0.0
---

# Prompt Versioning Management Skill

## 概要

プロンプトのライフサイクル全体（作成 → テスト → デプロイ → 監視 → 改善 → 廃止）を
体系的に管理するためのスキルです。

**核心概念**:

- **バージョン管理**: プロンプトの変更を追跡可能な形で記録
- **デプロイ管理**: 安全にプロンプトを本番環境に適用
- **ロールバック**: 問題発生時の迅速な復旧
- **監査**: 変更の追跡と影響分析

---

## リソース参照

詳細な知識は以下のリソースを参照してください:

| リソース           | パス                                 | 内容                                   |
| ------------------ | ------------------------------------ | -------------------------------------- |
| バージョニング戦略 | `resources/versioning-strategies.md` | セマンティックバージョニング、変更分類 |
| デプロイパターン   | `resources/deployment-patterns.md`   | Blue-Green、Canary、段階的ロールアウト |
| ロールバック手順   | `resources/rollback-procedures.md`   | ロールバック戦略、フォールバック設計   |

---

## バージョニング基礎

### セマンティックバージョニング（プロンプト版）

```
MAJOR.MINOR.PATCH

MAJOR: 破壊的変更（出力形式の変更、大幅な動作変更）
MINOR: 後方互換性のある機能追加（新しい機能、改善）
PATCH: バグ修正、微調整（ハルシネーション修正、精度改善）
```

### 変更分類

| 変更タイプ        | バージョン | 例                           |
| ----------------- | ---------- | ---------------------------- |
| 出力スキーマ変更  | MAJOR      | JSON 構造の変更              |
| 新機能追加        | MINOR      | 新しいタスクタイプのサポート |
| Few-Shot 例の追加 | MINOR      | 精度向上のための例示追加     |
| 文言調整          | PATCH      | 指示の明確化                 |
| パラメータ調整    | PATCH      | Temperature 微調整           |

---

## デプロイ戦略（概要）

### Blue-Green デプロイ

```
環境A (Blue): 現行バージョン v1.0.0
環境B (Green): 新バージョン v1.1.0

手順:
1. Green環境に新バージョンをデプロイ
2. テストトラフィックで検証
3. ルーティングをGreenに切り替え
4. Blue環境は待機（ロールバック用）
```

### Canary デプロイ

```
段階的トラフィック移行:
Phase 1: 5% → 新バージョン、95% → 現行
Phase 2: 25% → 新バージョン、75% → 現行
Phase 3: 50% → 新バージョン、50% → 現行
Phase 4: 100% → 新バージョン
```

詳細は `resources/deployment-patterns.md` を参照。

---

## ロールバック戦略（概要）

### 即座ロールバック条件

```yaml
rollback_triggers:
  - error_rate > 5% # エラー率閾値超過
  - latency_p95 > 3000ms # レイテンシ閾値超過
  - hallucination_rate > 10% # ハルシネーション率超過
  - user_complaints > 10 # ユーザー苦情件数
```

### ロールバック手順

```
1. 問題検知 → アラート発火
2. 影響評価 → 即座ロールバック or 調査継続
3. ルーティング切り替え → 前バージョンへ
4. 根本原因分析
5. 修正版開発 → 再デプロイ
```

詳細は `resources/rollback-procedures.md` を参照。

---

## ワークフロー

### プロンプトデプロイワークフロー

```
1. 開発環境でプロンプト作成/修正
   ↓
2. ローカルテスト（単体テスト）
   ↓
3. ステージング環境でA/Bテスト
   ↓
4. コードレビュー（変更承認）
   ↓
5. バージョンタグ付与
   ↓
6. Canaryデプロイ（5%から開始）
   ↓
7. モニタリング（メトリクス監視）
   ↓
8. 段階的ロールアウト
   ↓
9. 完全デプロイ
```

---

## テンプレート参照

| テンプレート           | パス                                | 用途                   |
| ---------------------- | ----------------------------------- | ---------------------- |
| 変更ログ               | `templates/changelog-template.md`   | バージョン履歴の記録   |
| デプロイチェックリスト | `templates/deployment-checklist.md` | デプロイ前後の確認事項 |

---

## コマンドリファレンス

```bash
# リソース読み込み
cat .claude/skills/prompt-versioning-management/resources/versioning-strategies.md
cat .claude/skills/prompt-versioning-management/resources/deployment-patterns.md
cat .claude/skills/prompt-versioning-management/resources/rollback-procedures.md

# テンプレート参照
cat .claude/skills/prompt-versioning-management/templates/changelog-template.md
cat .claude/skills/prompt-versioning-management/templates/deployment-checklist.md
```

---

## ベストプラクティス

### バージョン管理

1. **すべての変更にバージョンを付与**: 微調整でも PATCH バージョンを更新
2. **変更ログを必ず記録**: 何を、なぜ、いつ変更したかを明記
3. **破壊的変更は事前通知**: MAJOR 変更は影響範囲を事前に周知

### デプロイ管理

1. **段階的ロールアウト**: いきなり 100%にしない
2. **ロールバック準備**: デプロイ前に復旧手順を確認
3. **メトリクス監視**: デプロイ後は集中監視期間を設ける

### チーム運用

1. **レビュー必須**: プロンプト変更も通常コードと同様にレビュー
2. **ドキュメント同期**: プロンプト変更時はドキュメントも更新
3. **影響分析**: 依存するシステムへの影響を事前に評価

---

## 関連スキル

| スキル名                  | 関係性                         |
| ------------------------- | ------------------------------ |
| .claude/skills/prompt-testing-evaluation/SKILL.md | テスト結果に基づくデプロイ判断 |
| .claude/skills/hallucination-prevention/SKILL.md  | ロールバック条件の定義         |
| .claude/skills/structured-output-design/SKILL.md  | 破壊的変更の判定基準           |

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2025-11-26 | 初版作成 |
