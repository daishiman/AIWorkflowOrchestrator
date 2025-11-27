---
name: docker-best-practices
description: |
    コンテナ化とDockerのベストプラクティスを専門とするスキル。
    効率的なDockerfile、イメージ最適化、セキュリティ対策を提供します。
    専門分野:
    - Dockerfile最適化: マルチステージビルド、レイヤーキャッシュ
    - イメージサイズ削減: ベースイメージ選択、不要ファイル削除
    - セキュリティ: 非rootユーザー、脆弱性スキャン
    - docker-compose: ローカル開発環境構築
    使用タイミング:
    - Dockerfileを作成・最適化する時
    - コンテナイメージサイズを削減したい時
    - コンテナセキュリティを強化する時
    - ローカル開発環境を構築する時
    Use proactively when users need to create or optimize Dockerfiles,
    reduce image sizes, or improve container security.

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/docker-best-practices/resources/dockerfile-optimization.md`: レイヤーキャッシュ活用、ベースイメージ選択、イメージサイズ削減の最適化
  - `.claude/skills/docker-best-practices/resources/image-security.md`: 非rootユーザー実行、脆弱性スキャン、シークレット管理のセキュリティ対策
  - `.claude/skills/docker-best-practices/resources/local-development.md`: docker-composeを使ったローカル開発環境構築パターン
  - `.claude/skills/docker-best-practices/resources/multi-stage-builds.md`: マルチステージビルドによるイメージサイズ削減とビルド最適化
  - `.claude/skills/docker-best-practices/templates/docker-compose-template.yml`: ローカル開発用docker-compose設定テンプレート
  - `.claude/skills/docker-best-practices/templates/nodejs-dockerfile-template.dockerfile`: Node.js本番環境向け最適化Dockerfileテンプレート
  - `.claude/skills/docker-best-practices/scripts/analyze-image.mjs`: Dockerイメージ分析とサイズ最適化提案スクリプト

version: 1.0.0
---

# Docker Best Practices

## 概要

このスキルは、Docker 公式ベストプラクティスとセキュリティガイドラインに基づき、
効率的で安全なコンテナ化を支援します。

**主要な価値**:

- 高速なビルドと小さなイメージサイズ
- セキュアなコンテナ実行
- 効率的なローカル開発環境
- 本番運用に適した設定

**対象ユーザー**:

- アプリケーションをコンテナ化するエンジニア
- イメージサイズを最適化したい DevOps
- コンテナセキュリティを強化したいチーム

## リソース構造

```
docker-best-practices/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── dockerfile-optimization.md             # Dockerfile最適化
│   ├── image-security.md                      # イメージセキュリティ
│   ├── multi-stage-builds.md                  # マルチステージビルド
│   └── local-development.md                   # ローカル開発環境
├── scripts/
│   └── analyze-image.mjs                      # イメージ分析スクリプト
└── templates/
    ├── nodejs-dockerfile-template.dockerfile  # Node.js Dockerfile
    └── docker-compose-template.yml            # docker-compose テンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# Dockerfile最適化
cat .claude/skills/docker-best-practices/resources/dockerfile-optimization.md

# イメージセキュリティ
cat .claude/skills/docker-best-practices/resources/image-security.md

# マルチステージビルド
cat .claude/skills/docker-best-practices/resources/multi-stage-builds.md

# ローカル開発環境
cat .claude/skills/docker-best-practices/resources/local-development.md
```

### テンプレート参照

```bash
# Node.js Dockerfile
cat .claude/skills/docker-best-practices/templates/nodejs-dockerfile-template.dockerfile

# docker-compose
cat .claude/skills/docker-best-practices/templates/docker-compose-template.yml
```

### スクリプト実行

```bash
# イメージ分析
node .claude/skills/docker-best-practices/scripts/analyze-image.mjs myapp:latest
```

## いつ使うか

### シナリオ 1: 新規 Dockerfile 作成

**状況**: アプリケーションをコンテナ化したい

**適用条件**:

- [ ] Node.js/Python/Go などのアプリケーション
- [ ] 本番運用を想定
- [ ] イメージサイズを意識

**期待される成果**: 最適化された Dockerfile

### シナリオ 2: イメージサイズ削減

**状況**: 既存イメージが大きすぎる

**適用条件**:

- [ ] イメージが 500MB 以上
- [ ] ビルド時間が長い
- [ ] デプロイに時間がかかる

**期待される成果**: 小さく高速なイメージ

### シナリオ 3: セキュリティ強化

**状況**: コンテナのセキュリティを向上させたい

**適用条件**:

- [ ] root ユーザーで実行している
- [ ] 脆弱性スキャンを実施していない
- [ ] シークレットがイメージに含まれている

**期待される成果**: セキュアなコンテナ構成

## ワークフロー

### Phase 1: 要件分析

**目的**: コンテナ化の要件を明確化

**ステップ**:

1. **アプリケーション分析**:

   - 言語/ランタイム
   - 依存関係
   - 必要なシステムパッケージ

2. **環境要件**:
   - 環境変数
   - ボリューム
   - ポート

**判断基準**:

- [ ] ランタイムが特定されているか？
- [ ] 依存関係が明確か？
- [ ] 環境要件が整理されているか？

### Phase 2: ベースイメージ選択

**目的**: 適切なベースイメージを選択

**ステップ**:

1. **イメージ比較**:

   - 公式イメージの確認
   - サイズ比較
   - セキュリティ考慮

2. **バージョン選択**:
   - LTS バージョン
   - セキュリティパッチ

**判断基準**:

- [ ] 公式イメージを使用しているか？
- [ ] 適切なバージョンか？

**リソース**: `resources/dockerfile-optimization.md`

### Phase 3: Dockerfile 作成

**目的**: 最適化された Dockerfile を作成

**ステップ**:

1. **マルチステージビルド**:

   - ビルドステージ
   - 実行ステージ

2. **レイヤー最適化**:
   - キャッシュ活用
   - 不要ファイル削除

**判断基準**:

- [ ] マルチステージビルドを使用しているか？
- [ ] レイヤーキャッシュが効いているか？

**リソース**: `resources/multi-stage-builds.md`

### Phase 4: セキュリティ対策

**目的**: セキュアなイメージを構築

**ステップ**:

1. **ユーザー設定**:

   - 非 root ユーザーの作成
   - 適切な権限設定

2. **脆弱性対策**:
   - スキャンの実施
   - パッケージの更新

**判断基準**:

- [ ] 非 root ユーザーで実行されるか？
- [ ] 脆弱性スキャンを実施したか？

**リソース**: `resources/image-security.md`

## 核心知識

### ベースイメージ比較

| イメージ       | サイズ | 特徴               |
| -------------- | ------ | ------------------ |
| node:20        | ~1GB   | フル機能、開発向け |
| node:20-slim   | ~200MB | 必要最小限         |
| node:20-alpine | ~180MB | 軽量、musl libc    |
| distroless     | ~100MB | 最小、デバッグ困難 |

### Dockerfile ベストプラクティス

```dockerfile
# 1. 公式イメージを使用
FROM node:20-alpine

# 2. 非rootユーザーを作成
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# 3. 依存関係を先にコピー（キャッシュ活用）
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 4. ソースコードをコピー
COPY --chown=nextjs:nodejs . .

# 5. ビルド
RUN pnpm build

# 6. 非rootユーザーに切り替え
USER nextjs

# 7. 実行
CMD ["pnpm", "start"]
```

### .dockerignore

```
node_modules
.git
.env*
*.log
dist
coverage
.next
```

詳細は各リソースを参照

## ベストプラクティス

### すべきこと

1. **マルチステージビルド**:

   - ビルド環境と実行環境を分離
   - 最終イメージを最小化

2. **レイヤーキャッシュ活用**:

   - 変更頻度の低いものを先に
   - package.json を先にコピー

3. **非 root ユーザー**:
   - 専用ユーザーを作成
   - 最小限の権限

### 避けるべきこと

1. **latest タグ**:

   - ❌ `FROM node:latest`
   - ✅ `FROM node:20-alpine`

2. **シークレットの埋め込み**:

   - ❌ `ENV API_KEY=xxx`
   - ✅ 実行時に環境変数で渡す

3. **不要なパッケージ**:
   - ❌ 開発依存をすべて含める
   - ✅ 本番に必要なもののみ

## トラブルシューティング

### 問題 1: イメージが大きい

**症状**: イメージサイズが 500MB 以上

**対応**:

1. マルチステージビルドを使用
2. alpine ベースイメージを検討
3. .dockerignore を確認
4. 不要なファイルを削除

### 問題 2: ビルドが遅い

**症状**: ビルドに数分以上かかる

**対応**:

1. レイヤーキャッシュを活用
2. 依存関係のインストールを先に
3. .dockerignore で node_modules を除外

### 問題 3: 権限エラー

**症状**: ファイル書き込みで権限エラー

**対応**:

1. CHOWN でファイル所有者を設定
2. 書き込み先ディレクトリの権限確認
3. ボリュームマウントの権限確認

## 関連スキル

- **ci-cd-pipelines** (`.claude/skills/ci-cd-pipelines/SKILL.md`): CI/CD パイプライン
- **deployment-strategies** (`.claude/skills/deployment-strategies/SKILL.md`): デプロイ戦略
- **infrastructure-as-code** (`.claude/skills/infrastructure-as-code/SKILL.md`): インフラ構成

## メトリクス

### イメージサイズ目標

| アプリ種類  | 目標サイズ |
| ----------- | ---------- |
| Node.js API | < 200MB    |
| Next.js     | < 300MB    |
| Python API  | < 200MB    |
| Go          | < 50MB     |

### ビルド時間目標

- キャッシュあり: < 1 分
- キャッシュなし: < 5 分

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2025-11-26 | 初版作成 |

## 参考文献

- **Docker 公式ドキュメント**

  - [Dockerfile best practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)

- **Hadolint**
  - [Dockerfile linter](https://github.com/hadolint/hadolint)
