---
name: .claude/skills/version-control-for-docs/SKILL.md
description: |
  Gitを活用したドキュメントのバージョン管理と変更履歴管理の専門スキル。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/version-control-for-docs/resources/branch-strategy.md`: Branch Strategyリソース
  - `.claude/skills/version-control-for-docs/resources/changelog-generation.md`: Changelog Generationリソース
  - `.claude/skills/version-control-for-docs/resources/commit-conventions.md`: Commit Conventionsリソース
  - `.claude/skills/version-control-for-docs/resources/git-diff-guide.md`: Git Diff Guideリソース
  - `.claude/skills/version-control-for-docs/resources/review-workflow.md`: Review Workflowリソース

  - `.claude/skills/version-control-for-docs/templates/changelog-template.md`: Changelogテンプレート
  - `.claude/skills/version-control-for-docs/templates/pr-template.md`: ドキュメント変更用PRテンプレート（変更種類・チェックリスト・レビュー観点付き）

  - `.claude/skills/version-control-for-docs/scripts/generate-changelog.mjs`: Generate Changelogスクリプト

version: 1.0.0
---

# Version Control for Docs

## 概要

このスキルは、Gitを活用してドキュメントの変更管理、レビューフロー、リリース管理を効率的に行うためのプラクティスを提供します。

Documentation as Codeの原則に基づき、ドキュメントをコードと同様にバージョン管理し、変更の追跡、レビュー、デプロイを自動化します。

**主要な価値**:

- 変更履歴の完全な追跡
- 効率的なレビュープロセス
- リリース管理の自動化
- コードとドキュメントの同期

**対象ユーザー**:

- 仕様書を作成するエージェント（.claude/agents/spec-writer.md）
- ドキュメントエンジニア
- DevOpsエンジニア

## リソース構造

```
version-control-for-docs/
├── SKILL.md                                    # 本ファイル（概要と原則）
├── resources/
│   ├── git-diff-guide.md                      # Git Diff活用ガイド
│   ├── commit-conventions.md                  # コミットメッセージ規約
│   ├── review-workflow.md                     # レビューワークフロー設計
│   ├── branch-strategy.md                     # ドキュメント用ブランチ戦略
│   └── changelog-generation.md                # CHANGELOG自動生成
├── scripts/
│   └── generate-changelog.mjs                 # CHANGELOG生成スクリプト
└── templates/
    ├── pr-template.md                         # ドキュメントPRテンプレート
    └── changelog-template.md                  # CHANGELOGテンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# Git Diff活用ガイド
cat .claude/skills/version-control-for-docs/resources/git-diff-guide.md

# コミットメッセージ規約
cat .claude/skills/version-control-for-docs/resources/commit-conventions.md

# レビューワークフロー設計
cat .claude/skills/version-control-for-docs/resources/review-workflow.md

# ドキュメント用ブランチ戦略
cat .claude/skills/version-control-for-docs/resources/branch-strategy.md

# CHANGELOG自動生成
cat .claude/skills/version-control-for-docs/resources/changelog-generation.md
```

### スクリプト実行

```bash
# CHANGELOG生成（TypeScript）
node .claude/skills/version-control-for-docs/scripts/generate-changelog.mjs <version>
```

### テンプレート参照

```bash
# ドキュメントPRテンプレート
cat .claude/skills/version-control-for-docs/templates/pr-template.md

# CHANGELOGテンプレート
cat .claude/skills/version-control-for-docs/templates/changelog-template.md
```

## いつ使うか

### シナリオ1: 変更追跡システムの導入

**状況**: ドキュメントの変更履歴を正確に追跡したい

**適用条件**:

- [ ] 誰が何をいつ変更したか把握したい
- [ ] 過去バージョンへのロールバックが必要
- [ ] 変更理由の記録が重要

**推奨アプローチ**: Git管理、コミット規約の徹底

### シナリオ2: レビュープロセスの確立

**状況**: ドキュメント変更のレビュー体制を構築したい

**適用条件**:

- [ ] 公開前に品質チェックが必要
- [ ] 複数のレビュアーの承認が必要
- [ ] レビューコメントの追跡が重要

**推奨アプローチ**: PRベースレビュー、承認ワークフロー

### シナリオ3: リリース管理の自動化

**状況**: ドキュメントのリリースプロセスを効率化したい

**適用条件**:

- [ ] 定期的なドキュメントリリースがある
- [ ] CHANGELOGの自動生成が必要
- [ ] バージョン管理が重要

**推奨アプローチ**: セマンティックバージョニング、自動CHANGELOG

## 前提条件

### 必要な知識

- [ ] Gitの基本操作（commit, branch, merge, diff）
- [ ] PR/MRの概念
- [ ] Markdownの基本

### 必要なツール

- Bash: Gitコマンドの実行
- Read: 変更ファイルの確認
- Write: ドキュメントの作成・更新

### 環境要件

- Gitリポジトリ
- GitHub/GitLab等のホスティングサービス（レビュー用）

## ワークフロー

### Phase 1: バージョン管理基盤の構築

**目的**: ドキュメントのGit管理体制を確立する

**ステップ**:

1. **ディレクトリ構造の設計**:
   - ドキュメント専用ディレクトリ
   - バージョン別の整理（必要に応じて）
   - 関連リソース（画像等）の配置

2. **Git設定**:
   - .gitignoreの設定
   - 大容量ファイルの扱い（Git LFS等）
   - フックの設定（pre-commit等）

3. **初期コミット**:
   - 既存ドキュメントの整理
   - 意味のあるコミット単位
   - コミットメッセージ規約の適用

**判断基準**:

- [ ] ディレクトリ構造が設計されているか？
- [ ] Git設定が完了しているか？
- [ ] 初期コミットが完了しているか？

**リソース**: `resources/branch-strategy.md`

### Phase 2: コミット規約の策定

**目的**: 一貫性のあるコミットメッセージを実現する

**ステップ**:

1. **コミットタイプの定義**:
   - `docs:` ドキュメント追加・更新
   - `fix:` ドキュメントの誤り修正
   - `style:` フォーマット、スタイル変更
   - `refactor:` 構造の再編成
   - `chore:` ビルド、ツール関連

2. **メッセージ形式**:
   - 件名：50文字以内、命令形
   - 本文：何を、なぜ変更したか
   - フッター：関連Issue、Breaking Changes

3. **検証の自動化**:
   - commitlintの導入
   - pre-commitフックの設定

**判断基準**:

- [ ] コミットタイプが定義されているか？
- [ ] メッセージ形式が明確か？
- [ ] 自動検証が設定されているか？

**リソース**: `resources/commit-conventions.md`

### Phase 3: レビューワークフローの構築

**目的**: 効率的で確実なレビュープロセスを確立する

**ステップ**:

1. **PRテンプレートの作成**:
   - 変更概要
   - 変更理由
   - レビュー観点
   - チェックリスト

2. **レビュー基準の設定**:
   - 必須レビュアー
   - 承認条件
   - 自動チェック項目

3. **レビュープロセスの定義**:
   - ブランチ作成 → 変更 → PR作成
   - レビュー → フィードバック → 修正
   - 承認 → マージ → 公開

**判断基準**:

- [ ] PRテンプレートが用意されているか？
- [ ] レビュー基準が明確か？
- [ ] プロセスが定義されているか？

**リソース**: `resources/review-workflow.md`

### Phase 4: 変更履歴と差分管理

**目的**: 変更の可視化と追跡を効率化する

**ステップ**:

1. **Git Diffの活用**:
   - 差分の確認方法
   - 視覚的な差分ツール
   - ワード単位の差分

2. **CHANGELOG管理**:
   - セマンティックバージョニング
   - 自動生成ルール
   - 手動追記のガイドライン

3. **リリースノートの作成**:
   - ユーザー向け変更サマリ
   - Breaking Changesの強調
   - 移行ガイド（必要な場合）

**判断基準**:

- [ ] 差分確認方法が整備されているか？
- [ ] CHANGELOG管理が自動化されているか？
- [ ] リリースプロセスが定義されているか？

**リソース**: `resources/git-diff-guide.md`, `resources/changelog-generation.md`

## ベストプラクティス

### すべきこと

1. **アトミックコミット**:
   - 1コミット = 1つの論理的変更
   - 複数の無関係な変更を混ぜない
   - ロールバックしやすい単位

2. **意味のあるコミットメッセージ**:
   - 何を変更したか明確に
   - なぜ変更したか説明
   - 関連Issue/PRへのリンク

3. **定期的な同期**:
   - 頻繁なプル（最新取得）
   - 早めのコンフリクト解消
   - 長期ブランチの回避

### 避けるべきこと

1. **巨大なコミット**:
   - 100ファイル以上の変更
   - 「大量更新」のようなメッセージ
   - レビュー困難な変更量

2. **直接mainへのプッシュ**:
   - レビューなしの変更
   - 保護ブランチの設定なし
   - 承認プロセスの迂回

3. **履歴の改ざん**:
   - 共有ブランチでのrebase
   - force pushの乱用
   - コミットの削除

## トラブルシューティング

### 問題1: マージコンフリクトが頻発

**症状**: 同じファイルで頻繁にコンフリクト

**原因**:

- 同じ箇所を複数人が編集
- ブランチが長期化

**解決策**:

1. 作業範囲の明確な分担
2. こまめなマージ/リベース
3. モジュール化による競合回避

### 問題2: コミット履歴が混乱

**症状**: 履歴が追いにくい、変更理由が不明

**原因**:

- コミットメッセージが不適切
- 粒度が不均一

**解決策**:

1. コミット規約の導入
2. commitlintによる強制
3. squashマージの活用

### 問題3: レビューが滞る

**症状**: PRが長期間放置される

**原因**:

- レビュー担当が不明確
- PRが大きすぎる

**解決策**:

1. 明確なレビュアー指定
2. PRサイズの制限
3. 自動リマインダーの設定

## 関連スキル

- **.claude/skills/technical-documentation-standards/SKILL.md** (`.claude/skills/technical-documentation-standards/SKILL.md`): 技術文書化標準
- **.claude/skills/documentation-architecture/SKILL.md** (`.claude/skills/documentation-architecture/SKILL.md`): ドキュメント構造設計

## メトリクス

### コミット品質

**測定方法**: 規約準拠コミット数 / 総コミット数
**目標**: 100%

### レビュー時間

**測定方法**: PR作成からマージまでの平均時間
**目標**: <24時間（ドキュメントPR）

### マージコンフリクト率

**測定方法**: コンフリクトを含むPR数 / 総PR数
**目標**: <10%

## 変更履歴

| バージョン | 日付       | 変更内容                                                |
| ---------- | ---------- | ------------------------------------------------------- |
| 1.0.0      | 2025-11-25 | 初版作成 - Git Diff、コミット規約、レビューワークフロー |

## 使用上の注意

### このスキルが得意なこと

- ドキュメントのバージョン管理設計
- コミット規約の策定
- レビューワークフローの構築
- CHANGELOG生成の自動化

### このスキルが行わないこと

- 文書の具体的なコンテンツ作成
- Git自体の詳細な操作説明
- 実際のGitコマンドの実行

### 参考文献

- **Conventional Commits**: https://www.conventionalcommits.org/
- **Keep a Changelog**: https://keepachangelog.com/
- **Git Documentation**: https://git-scm.com/doc
- **『Pro Git』** Scott Chacon & Ben Straub著
