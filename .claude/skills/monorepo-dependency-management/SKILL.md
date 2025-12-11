---
name: monorepo-dependency-management
description: |
  モノレポ環境での依存関係管理、ワークスペース間の整合性維持を専門とするスキル。
  pnpm workspaces、変更影響分析、パッケージ間バージョン同期の方法論を提供します。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/monorepo-dependency-management/resources/change-impact-analysis.md`: 依存グラフ解析、影響を受けるパッケージ特定、テスト範囲決定、pnpm --filter活用
  - `.claude/skills/monorepo-dependency-management/resources/dependency-hoisting.md`: shamefully-hoist設定、public-hoist-pattern、ホイスティングの最適化と問題回避
  - `.claude/skills/monorepo-dependency-management/resources/pnpm-workspace-setup.md`: pnpm-workspace.yaml設定、workspace:*プロトコル、内部依存定義、モノレポ構造設計
  - `.claude/skills/monorepo-dependency-management/resources/version-synchronization.md`: パッケージ間バージョン整合性維持、カタログ機能活用、統一バージョン管理
  - `.claude/skills/monorepo-dependency-management/scripts/analyze-workspace-deps.mjs`: ワークスペース依存関係分析（循環依存検出、依存グラフ可視化、影響範囲特定）
  - `.claude/skills/monorepo-dependency-management/templates/monorepo-setup-checklist.md`: モノレポ初期セットアップチェックリスト（構造設計から運用まで）

  専門分野:
  - ワークスペース管理: pnpm workspacesの設定と運用
  - 依存関係同期: パッケージ間バージョンの整合性維持
  - 変更影響分析: 変更が他パッケージに与える影響の特定
  - ホイスティング制御: 依存関係の配置最適化

  使用タイミング:
  - モノレポの初期セットアップを行う時
  - ワークスペース間の依存関係を管理する時
  - 変更の影響範囲を分析する時
  - パッケージ間のバージョンを同期する時

  Use proactively when setting up monorepos,
version: 1.0.0
---

# Monorepo Dependency Management

## 概要

このスキルは、モノレポ（Monorepo）環境での依存関係管理を効率的かつ安全に行うための
方法論を提供します。

モノレポは複数の関連パッケージを単一のリポジトリで管理する手法で、
コードの共有、一貫したバージョニング、統合テストの容易さなどのメリットがあります。

**主要な価値**:

- パッケージ間の依存関係の一元管理
- 変更の影響範囲の可視化
- ビルドとテストの効率化

**対象ユーザー**:

- 依存関係を管理するエージェント（@dep-mgr）
- モノレポを運用するチーム
- プラットフォームエンジニア

## リソース構造

```
monorepo-dependency-management/
├── SKILL.md                                    # 本ファイル（概要とワークフロー）
├── resources/
│   ├── pnpm-workspace-setup.md                 # pnpm workspaces設定
│   ├── dependency-hoisting.md                  # ホイスティング制御
│   ├── version-synchronization.md              # バージョン同期戦略
│   └── change-impact-analysis.md               # 変更影響分析
├── scripts/
│   └── analyze-workspace-deps.mjs              # ワークスペース依存分析
└── templates/
    └── monorepo-setup-checklist.md             # セットアップチェックリスト
```

## コマンドリファレンス

このスキルで使用可能なリソース、スクリプト、テンプレートへのアクセスコマンド:

### リソース読み取り

```bash
# pnpm workspaces設定
cat .claude/skills/monorepo-dependency-management/resources/pnpm-workspace-setup.md

# ホイスティング制御
cat .claude/skills/monorepo-dependency-management/resources/dependency-hoisting.md

# バージョン同期戦略
cat .claude/skills/monorepo-dependency-management/resources/version-synchronization.md

# 変更影響分析
cat .claude/skills/monorepo-dependency-management/resources/change-impact-analysis.md
```

### スクリプト実行

```bash
# ワークスペース依存分析
node .claude/skills/monorepo-dependency-management/scripts/analyze-workspace-deps.mjs

# 例: 特定パッケージの影響分析
node .claude/skills/monorepo-dependency-management/scripts/analyze-workspace-deps.mjs --package @app/core
```

### テンプレート参照

```bash
# セットアップチェックリスト
cat .claude/skills/monorepo-dependency-management/templates/monorepo-setup-checklist.md
```

## いつ使うか

### シナリオ 1: モノレポの初期セットアップ

**状況**: 新規にモノレポ構造を構築する、または既存プロジェクトをモノレポ化する

**適用条件**:

- [ ] 複数の関連パッケージを管理する必要がある
- [ ] パッケージ間でコードを共有したい
- [ ] 統一されたビルド/テストプロセスが必要

**期待される成果**: 適切に設定されたモノレポ構造

### シナリオ 2: ワークスペース間の依存関係管理

**状況**: パッケージ間の依存関係を追加、更新、または削除する

**適用条件**:

- [ ] 内部パッケージ間に依存関係がある
- [ ] 外部依存を複数パッケージで共有する
- [ ] バージョンの整合性を維持する必要がある

**期待される成果**: 整合性のとれた依存関係構成

### シナリオ 3: 変更の影響分析

**状況**: あるパッケージの変更が他のパッケージに与える影響を把握する

**適用条件**:

- [ ] パッケージを更新する予定がある
- [ ] 影響を受けるパッケージを特定したい
- [ ] テスト範囲を決定したい

**期待される成果**: 影響を受けるパッケージのリストとテスト計画

## pnpm workspaces の基本

### ワークスペース設定

```yaml
# pnpm-workspace.yaml
packages:
  - "packages/*"
  - "apps/*"
  - "tools/*"
```

### パッケージ構造

```
monorepo/
├── package.json              # ルートpackage.json
├── pnpm-workspace.yaml       # ワークスペース定義
├── pnpm-lock.yaml            # 単一のロックファイル
├── packages/
│   ├── core/
│   │   └── package.json
│   ├── utils/
│   │   └── package.json
│   └── ui/
│       └── package.json
├── apps/
│   ├── web/
│   │   └── package.json
│   └── api/
│       └── package.json
└── tools/
    └── cli/
        └── package.json
```

### 内部依存の定義

```json
// apps/web/package.json
{
  "name": "@app/web",
  "dependencies": {
    "@app/core": "workspace:*",
    "@app/ui": "workspace:^1.0.0"
  }
}
```

### workspace プロトコル

| プロトコル    | 動作           | 用途                   |
| ------------- | -------------- | ---------------------- |
| `workspace:*` | 常に最新       | 開発中の内部パッケージ |
| `workspace:^` | semver 範囲    | 安定版の内部パッケージ |
| `workspace:~` | パッチのみ許可 | 厳格なバージョン管理   |

## コマンドリファレンス

### 全ワークスペースでの操作

```bash
# 全パッケージのインストール
pnpm install

# 全パッケージでコマンド実行
pnpm -r run build
pnpm -r run test

# 並列実行
pnpm -r --parallel run build

# 依存順に実行
pnpm -r run build
```

### 特定パッケージでの操作

```bash
# 特定パッケージでコマンド実行
pnpm --filter @app/web run build

# 依存パッケージも含める
pnpm --filter @app/web... run build

# 被依存パッケージも含める
pnpm --filter ...@app/core run build

# 変更されたパッケージのみ
pnpm --filter "[origin/main]" run test
```

### 依存関係の追加

```bash
# 特定パッケージに追加
pnpm --filter @app/web add lodash

# ルートに追加（devDependency）
pnpm add -w -D typescript

# 内部パッケージを追加
pnpm --filter @app/web add @app/core
```

## ワークフロー

### Phase 1: 構造設計

**目的**: モノレポの全体構造を設計する

**ステップ**:

1. パッケージの分類を決定
2. 依存関係の方向を設計
3. ディレクトリ構造を決定
4. 命名規則を策定

**判断基準**:

- [ ] パッケージの責務が明確か？
- [ ] 循環依存がないか？
- [ ] スケーラブルな構造か？

### Phase 2: 初期設定

**目的**: モノレポの基盤を構築する

**ステップ**:

1. pnpm-workspace.yaml を作成
2. ルート package.json を設定
3. 各パッケージの package.json を設定
4. 内部依存を定義

**判断基準**:

- [ ] ワークスペースが正しく認識されるか？
- [ ] 内部依存が解決されるか？
- [ ] ビルドが成功するか？

### Phase 3: 依存関係の最適化

**目的**: 依存関係を効率的に管理する

**ステップ**:

1. 共通依存をルートに集約
2. ホイスティングを最適化
3. 不要な重複を解消
4. バージョンを同期

**判断基準**:

- [ ] 重複が最小化されているか？
- [ ] ホイスティングが適切か？
- [ ] バージョンが統一されているか？

### Phase 4: CI/CD 統合

**目的**: 効率的な CI/CD パイプラインを構築する

**ステップ**:

1. 変更検出の設定
2. 影響を受けるパッケージのみテスト
3. キャッシュ戦略の設定
4. 並列ビルドの最適化

**判断基準**:

- [ ] 変更されたパッケージのみビルドするか？
- [ ] キャッシュが効果的か？
- [ ] ビルド時間が許容範囲か？

## ベストプラクティス

### すべきこと

1. **明確な依存方向**:
   - 下位 → 上位の依存のみ許可
   - 循環依存を禁止
   - 依存グラフを可視化

2. **バージョン同期**:
   - 共通依存のバージョンを統一
   - カタログ機能の活用
   - 定期的な同期チェック

3. **効率的なビルド**:
   - 変更されたパッケージのみビルド
   - キャッシュの活用
   - 並列実行の最適化

### 避けるべきこと

1. **循環依存**:
   - ❌ A → B → A の依存
   - ✅ 共通モジュールへの抽出

2. **過度な分割**:
   - ❌ 1 ファイル 1 パッケージ
   - ✅ 意味のある単位で分割

3. **バージョンの不整合**:
   - ❌ パッケージごとに異なる React バージョン
   - ✅ 統一されたバージョン管理

## トラブルシューティング

### 問題 1: 循環依存の検出

**症状**: ビルドが終わらない、または依存解決エラー

**検出**:

```bash
# pnpmの循環依存チェック
pnpm why @app/core
```

**解決策**:

1. 依存グラフを可視化
2. 循環の原因を特定
3. 共通モジュールを抽出

### 問題 2: ホイスティングの問題

**症状**: パッケージが見つからない、バージョンの不一致

**対応**:

```yaml
# .npmrc
shamefully-hoist=false
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*
```

### 問題 3: ワークスペースプロトコルの公開

**症状**: `workspace:*`がそのまま公開される

**解決策**:

```bash
# 公開時に実際のバージョンに変換
pnpm publish --filter @app/core
# workspace:* → ^1.0.0 に自動変換される
```

## 関連スキル

- **semantic-versioning** (`.claude/skills/semantic-versioning/SKILL.md`): バージョン管理
- **lock-file-management** (`.claude/skills/lock-file-management/SKILL.md`): ロックファイル管理
- **upgrade-strategies** (`.claude/skills/upgrade-strategies/SKILL.md`): アップグレード戦略

## メトリクス

### モノレポ管理の効果測定

**測定指標**:

- ビルド時間（変更あたり）
- 依存関係の重複率
- パッケージ間の結合度
- CI/CD の効率性

**目標値**:

- 変更ビルド時間: <5 分
- 重複率: <10%
- 循環依存: 0 件

## 変更履歴

| バージョン | 日付       | 変更内容                                      |
| ---------- | ---------- | --------------------------------------------- |
| 1.0.0      | 2025-11-27 | 初版作成 - モノレポ依存関係管理フレームワーク |

## 参考文献

- **pnpm workspaces**: https://pnpm.io/workspaces
- **Turborepo**: https://turbo.build/repo/docs
- **Nx**: https://nx.dev/
