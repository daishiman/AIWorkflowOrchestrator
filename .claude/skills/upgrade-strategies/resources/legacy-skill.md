---
name: .claude/skills/upgrade-strategies/SKILL.md
description: |
  依存関係の安全なアップグレード戦略と段階的更新手法を専門とするスキル。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/upgrade-strategies/resources/automation-patterns.md`: Automation Patternsリソース
  - `.claude/skills/upgrade-strategies/resources/rollback-procedures.md`: Rollback Proceduresリソース
  - `.claude/skills/upgrade-strategies/resources/strategy-selection-guide.md`: Strategy Selection Guideリソース
  - `.claude/skills/upgrade-strategies/resources/tdd-integration.md`: Tdd Integrationリソース

  - `.claude/skills/upgrade-strategies/templates/upgrade-plan-template.md`: Upgrade Planテンプレート

  - `.claude/skills/upgrade-strategies/scripts/check-upgrades.mjs`: Check Upgradesスクリプト

version: 1.0.0
---

# Upgrade Strategies

## 概要

このスキルは、依存関係を安全かつ効率的にアップグレードするための
戦略と手法を提供します。

適切なアップグレード戦略を選択することで、
破壊的変更のリスクを最小化しながら、セキュリティと機能の恩恵を受けられます。

**主要な価値**:

- セキュリティパッチの迅速な適用
- 新機能へのタイムリーなアクセス
- 技術的負債の蓄積防止

**対象ユーザー**:

- 依存関係を管理するエージェント（.claude/agents/dep-mgr.md）
- テクニカルリード
- DevOps エンジニア

## リソース構造

```
upgrade-strategies/
├── SKILL.md                                    # 本ファイル（概要とワークフロー）
├── resources/
│   ├── strategy-selection-guide.md             # 戦略選択ガイド
│   ├── tdd-integration.md                      # TDD統合パターン
│   ├── rollback-procedures.md                  # ロールバック手順
│   └── automation-patterns.md                  # 自動化パターン
├── scripts/
│   └── check-upgrades.mjs                      # アップグレード候補チェック
└── templates/
    └── upgrade-plan-template.md                # アップグレード計画テンプレート
```

## コマンドリファレンス

このスキルで使用可能なリソース、スクリプト、テンプレートへのアクセスコマンド:

### リソース読み取り

```bash
# 戦略選択ガイド
cat .claude/skills/upgrade-strategies/resources/strategy-selection-guide.md

# TDD統合パターン
cat .claude/skills/upgrade-strategies/resources/tdd-integration.md

# ロールバック手順
cat .claude/skills/upgrade-strategies/resources/rollback-procedures.md

# 自動化パターン
cat .claude/skills/upgrade-strategies/resources/automation-patterns.md
```

### スクリプト実行

```bash
# アップグレード候補チェック
node .claude/skills/upgrade-strategies/scripts/check-upgrades.mjs

# 例: セキュリティアップデートのみ
node .claude/skills/upgrade-strategies/scripts/check-upgrades.mjs --security-only
```

### テンプレート参照

```bash
# アップグレード計画テンプレート
cat .claude/skills/upgrade-strategies/templates/upgrade-plan-template.md
```

## いつ使うか

### シナリオ 1: 定期的なアップグレード

**状況**: 定期的な依存関係メンテナンスサイクルでのアップグレード

**適用条件**:

- [ ] 定期的なメンテナンスウィンドウが設定されている
- [ ] 複数のパッケージを同時に更新する必要がある
- [ ] テストカバレッジが十分（>60%）

**期待される成果**: 安全に更新された依存関係と検証済みのシステム

### シナリオ 2: セキュリティパッチの緊急適用

**状況**: 重大なセキュリティ脆弱性の修正が必要

**適用条件**:

- [ ] Critical/High の脆弱性が検出された
- [ ] パッチが利用可能
- [ ] 迅速な対応が必要

**期待される成果**: 脆弱性が解消された状態

### シナリオ 3: メジャーバージョンアップ

**状況**: フレームワークやライブラリのメジャーバージョンアップ

**適用条件**:

- [ ] Major バージョンが変更される
- [ ] 破壊的変更が含まれる可能性がある
- [ ] 移行ガイドが提供されている

**期待される成果**: 新バージョンへの完全な移行

## アップグレード戦略の種類

### 1. 段階的アップグレード（推奨デフォルト）

**概要**: 小さな更新を頻繁に行う

**適用条件**:

- 定期的なメンテナンスが可能
- テストカバレッジが十分
- CI/CD パイプラインが整備されている

**メリット**:

- リスクの分散
- 問題の早期発見
- ロールバックが容易

**手順**:

```bash
# 1. 更新可能なパッケージを確認
pnpm outdated

# 2. Patchバージョンから更新
pnpm update --latest

# 3. テスト実行
pnpm test

# 4. コミット
git add . && git commit -m "chore: update patch dependencies"
```

### 2. 一括アップグレード

**概要**: 多数のパッケージを一度に更新

**適用条件**:

- 長期間更新されていない
- 大規模なリファクタリングの一環
- 十分なテスト時間が確保できる

**リスク**:

- 問題の切り分けが困難
- 複数の破壊的変更が同時に発生

**手順**:

```bash
# 1. 現状をバックアップ
git checkout -b upgrade/bulk-update

# 2. 全パッケージを最新に
pnpm update --latest

# 3. ビルドエラーを修正
pnpm build

# 4. テストを修正・実行
pnpm test

# 5. E2Eテスト
pnpm test:e2e
```

### 3. セキュリティファーストアップグレード

**概要**: セキュリティパッチを最優先で適用

**適用条件**:

- セキュリティ脆弱性が検出された
- パッチが利用可能
- 迅速な対応が必要

**手順**:

```bash
# 1. 脆弱性を確認
pnpm audit

# 2. セキュリティパッチのみ適用
pnpm audit --fix

# 3. 検証
pnpm test

# 4. 即座にデプロイ
```

### 4. フィーチャーフラグ型アップグレード

**概要**: フィーチャーフラグで新バージョンの使用を制御

**適用条件**:

- 段階的なロールアウトが必要
- A/B テストを行いたい
- リスクを最小化したい

**実装例**:

```javascript
// feature-flags.js
const flags = {
  USE_NEW_LIBRARY_VERSION: process.env.NEW_LIB === "true",
};

// usage.js
const lib = flags.USE_NEW_LIBRARY_VERSION
  ? require("lib@2.0.0")
  : require("lib@1.0.0");
```

## TDD 統合

### テスト駆動アップグレードの流れ

```
1. 既存テストの実行（Green）
   ↓
2. パッケージを更新
   ↓
3. テストを実行（Red/Green）
   ↓
4. 失敗したテストを修正
   ↓
5. 全テスト通過（Green）
   ↓
6. コミット
```

### 推奨テストカバレッジ

| レベル | カバレッジ | 適用範囲                 |
| ------ | ---------- | ------------------------ |
| 最小   | 60%以上    | 段階的アップグレード     |
| 推奨   | 80%以上    | 一括アップグレード       |
| 理想   | 90%以上    | メジャーバージョンアップ |

### 静的テスト（100%必須）

```bash
# TypeScript型チェック
pnpm tsc --noEmit

# ESLintチェック
pnpm eslint .

# Prettierチェック
pnpm prettier --check .
```

## ワークフロー

### Phase 1: 計画

**目的**: アップグレードの範囲と戦略を決定

**ステップ**:

1. 更新可能なパッケージを確認
2. 各パッケージの変更内容を調査
3. 影響範囲を評価
4. 戦略を選択
5. タイムラインを策定

**判断基準**:

- [ ] 更新対象を特定したか？
- [ ] 破壊的変更を確認したか？
- [ ] 戦略を選択したか？
- [ ] ロールバック計画があるか？

### Phase 2: 準備

**目的**: アップグレードに必要な準備を完了

**ステップ**:

1. テストカバレッジを確認・改善
2. ベースラインのテスト結果を記録
3. フィーチャーブランチを作成
4. 依存関係の現状を文書化

**判断基準**:

- [ ] テストカバレッジは十分か？
- [ ] ベースラインを記録したか？
- [ ] ブランチを作成したか？

### Phase 3: 実施

**目的**: アップグレードを安全に実行

**ステップ**:

1. パッケージを更新
2. ビルドエラーを修正
3. テストを実行・修正
4. 静的解析を実行
5. 手動テストを実施

**判断基準**:

- [ ] ビルドが成功するか？
- [ ] 全テストが通過するか？
- [ ] 静的解析をパスするか？

### Phase 4: 検証

**目的**: アップグレードが正しく完了したことを確認

**ステップ**:

1. 全テストスイートを実行
2. パフォーマンスを測定
3. セキュリティ監査を実行
4. ステージング環境でテスト
5. コードレビューを実施

**判断基準**:

- [ ] 回帰がないか？
- [ ] パフォーマンス低下がないか？
- [ ] 新しい脆弱性が導入されていないか？

### Phase 5: 本番適用

**目的**: 安全に本番環境へデプロイ

**ステップ**:

1. 本番デプロイを実行
2. スモークテストを実施
3. モニタリングを強化
4. 問題発生時はロールバック
5. 成功を確認・文書化

**判断基準**:

- [ ] デプロイが成功したか？
- [ ] エラー率が正常か？
- [ ] パフォーマンスが正常か？

## ベストプラクティス

### すべきこと

1. **小さく頻繁に更新**:
   - 週次または隔週でのパッチ更新
   - 月次でのマイナー更新
   - 四半期でのメジャー更新検討

2. **自動化を活用**:
   - Dependabot の活用
   - Renovate の活用
   - CI/CD での自動テスト

3. **文書化**:
   - 変更内容の記録
   - 問題と解決策の記録
   - 次回への学びの記録

### 避けるべきこと

1. **長期間の放置**:
   - ❌ 6 ヶ月以上更新しない
   - ✅ 定期的なメンテナンスサイクル

2. **テストなしの更新**:
   - ❌ テストをスキップして更新
   - ✅ テストで検証してから更新

3. **一括大量更新**:
   - ❌ 全パッケージを同時に最新化
   - ✅ 段階的に更新して問題を切り分け

## トラブルシューティング

### 問題 1: 型エラーの大量発生

**症状**: TypeScript の型エラーが大量に発生

**対応**:

1. まず`@types/*`パッケージを更新
2. 型定義の変更点を確認
3. 一つずつ修正、または`any`で一時回避
4. 根本的な修正を後で実施

### 問題 2: 推移的依存の競合

**症状**: ピア依存の競合でインストールが失敗

**対応**:

```bash
# overridesで強制解決
# package.json
{
  "pnpm": {
    "overrides": {
      "conflicting-package": "^1.0.0"
    }
  }
}
```

### 問題 3: テストの大量失敗

**症状**: アップグレード後にテストが大量に失敗

**対応**:

1. 一旦ロールバック
2. 段階的なアップグレードに切り替え
3. 一つのパッケージずつ更新

## 関連スキル

- **.claude/skills/semantic-versioning/SKILL.md** (`.claude/skills/semantic-versioning/SKILL.md`): バージョン変更の影響評価
- **.claude/skills/dependency-auditing/SKILL.md** (`.claude/skills/dependency-auditing/SKILL.md`): セキュリティ監査
- **.claude/skills/lock-file-management/SKILL.md** (`.claude/skills/lock-file-management/SKILL.md`): ロックファイルの管理

## メトリクス

### アップグレードの効果測定

**測定指標**:

- アップグレード成功率
- ロールバック発生率
- 平均アップグレード時間
- 技術的負債スコアの推移

**目標値**:

- 成功率: >95%
- ロールバック率: <5%
- Patch 更新時間: <30 分
- Minor 更新時間: <2 時間

## 変更履歴

| バージョン | 日付       | 変更内容                                    |
| ---------- | ---------- | ------------------------------------------- |
| 1.0.0      | 2025-11-27 | 初版作成 - アップグレード戦略フレームワーク |

## 参考文献

- **Dependabot**: https://docs.github.com/en/code-security/dependabot
- **Renovate**: https://docs.renovatebot.com/
- **pnpm update**: https://docs.npmjs.com/cli/v10/commands/pnpm-update
