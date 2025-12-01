---
name: caching-strategies-gha
description: |
  GitHub Actions ワークフロー高速化のためのキャッシング戦略。
  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/caching-strategies-gha/resources/cache-action.md`: actions/cache 完全リファレンス
  - `.claude/skills/caching-strategies-gha/resources/cache-optimization.md`: キャッシュ最適化戦略
  - `.claude/skills/caching-strategies-gha/resources/cache-patterns.md`: 言語別キャッシュパターン
  - `.claude/skills/caching-strategies-gha/templates/cache-examples.yaml`: GitHub Actions キャッシュ設定例集
  - `.claude/skills/caching-strategies-gha/scripts/estimate-cache-size.mjs`: GitHub Actions キャッシュサイズ見積もりツール

  専門分野:
  - キャッシュアクション: actions/cache構文、キー設計、パスパターン
  - 言語別パターン: Node.js/Python/Go/Rust/Docker層の最適化
  - キャッシュ最適化: ヒット率向上、ストレージ制限、キー戦略
  - パフォーマンス: ビルド時間短縮、依存関係復元、層キャッシング

  使用タイミング:
  - ワークフローのビルド時間を短縮したい時
  - 依存関係のインストール時間を削減したい時
  - Dockerビルドを高速化したい時
  - キャッシュヒット率を改善したい時
  - ストレージ制限（10GB）を管理する時
version: 1.0.0
---

# GitHub Actions Caching Strategies

## 概要

このスキルは、GitHub Actions ワークフローの実行時間を短縮するキャッシング戦略を提供します。
actions/cacheの効果的な使用法から、言語別の最適化パターン、キャッシュヒット率の向上まで網羅します。

**主要な価値**:
- ビルド時間の50-80%短縮
- 依存関係インストールの高速化
- ストレージ効率的なキャッシュ戦略
- 言語・フレームワーク別のベストプラクティス

**制約**:
- キャッシュサイズ上限: 単一エントリ10GB、リポジトリ合計10GB
- キャッシュ保持期間: 7日間未使用で削除
- キャッシュキーは一度作成されると不変

## リソース構造

```
caching-strategies-gha/
├── SKILL.md                                    # 本ファイル（概要とクイックリファレンス）
├── resources/
│   ├── cache-action.md                         # actions/cache完全リファレンス
│   ├── cache-patterns.md                       # 言語別キャッシュパターン
│   └── cache-optimization.md                   # 最適化戦略とトラブルシューティング
├── templates/
│   └── cache-examples.yaml                     # 実用的なキャッシュ設定例
└── scripts/
    └── estimate-cache-size.mjs                 # キャッシュサイズ見積もりツール
```

## コマンドリファレンス

### リソース読み取り

```bash
# actions/cache完全リファレンス
cat .claude/skills/caching-strategies-gha/resources/cache-action.md

# 言語別キャッシュパターン
cat .claude/skills/caching-strategies-gha/resources/cache-patterns.md

# キャッシュ最適化戦略
cat .claude/skills/caching-strategies-gha/resources/cache-optimization.md
```

### テンプレート参照

```bash
# 実用的なキャッシュ設定例
cat .claude/skills/caching-strategies-gha/templates/cache-examples.yaml
```

### スクリプト実行

```bash
# キャッシュサイズ見積もり
node .claude/skills/caching-strategies-gha/scripts/estimate-cache-size.mjs <directory>
```

## クイックリファレンス

### 基本的なキャッシュ設定

```yaml
- name: Cache dependencies
  uses: actions/cache@v4
  with:
    path: ~/.pnpm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

### 言語別キャッシュパターン

| 言語/ツール | キャッシュパス | キーパターン |
|-----------|--------------|------------|
| **Node.js (pnpm)** | `~/.pnpm` | `${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}` |
| **Node.js (pnpm)** | `~/.pnpm-store` | `${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}` |
| **Python (pip)** | `~/.cache/pip` | `${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}` |
| **Go** | `~/go/pkg/mod` | `${{ runner.os }}-go-${{ hashFiles('**/go.sum') }}` |
| **Rust** | `~/.cargo/registry`<br>`~/.cargo/git`<br>`target/` | `${{ runner.os }}-cargo-${{ hashFiles('**/Cargo.lock') }}` |
| **Docker** | `/tmp/.buildx-cache` | `${{ runner.os }}-buildx-${{ github.sha }}` |

### キャッシュキー戦略

| 戦略 | キーパターン | 用途 |
|-----|------------|------|
| **完全一致** | `${{ hashFiles('**/lock-file') }}` | 依存関係が変更された時のみ更新 |
| **プレフィックス一致** | `restore-keys: ${{ runner.os }}-node-` | 部分ヒットで古いキャッシュを利用 |
| **日付ベース** | `${{ runner.os }}-${{ github.run_id }}` | 毎実行で新規キャッシュ作成 |
| **ブランチ別** | `${{ runner.os }}-${{ github.ref }}` | ブランチごとに独立したキャッシュ |

### キャッシュ最適化チェックリスト

- [ ] **キーに適切なハッシュ**: ロックファイル（package-lock.json, Cargo.lock等）を使用
- [ ] **restore-keys設定**: 完全一致しない場合の部分一致を許可
- [ ] **パス最適化**: 必要最小限のディレクトリのみキャッシュ
- [ ] **サイズ監視**: 大きなキャッシュ（>1GB）は分割を検討
- [ ] **有効期限認識**: 7日間未使用で自動削除されることを考慮

## ワークフロー

### Phase 1: キャッシュ要件の特定

1. **キャッシュ対象の特定**
   - 依存関係: pnpm, pip, cargo等のパッケージマネージャー
   - ビルド成果物: target/, dist/, .next/等
   - ツールバイナリ: ダウンロードした実行ファイル

2. **ロックファイルの確認**
   - package-lock.json, pnpm-lock.yaml
   - requirements.txt, Pipfile.lock
   - go.sum, Cargo.lock

**リソース**: `resources/cache-patterns.md`

### Phase 2: キャッシュ戦略の設計

1. **キーパターンの設計**
   - ハッシュベース: `${{ hashFiles('**/lock-file') }}`
   - restore-keys: 部分一致パターンの定義

2. **パスの最適化**
   - 必要なディレクトリのみ指定
   - 大きなディレクトリは分割

**リソース**: `resources/cache-action.md`

### Phase 3: 実装と検証

1. **キャッシュアクションの追加**
   ```yaml
   - uses: actions/cache@v4
     with:
       path: <cache-paths>
       key: <primary-key>
       restore-keys: <fallback-keys>
   ```

2. **ヒット率の確認**
   - Actions UIでcache-hit出力を確認
   - ビルド時間の変化を測定

**リソース**: `resources/cache-optimization.md`

### Phase 4: 最適化と改善

1. **パフォーマンス分析**
   - キャッシュヒット率の測定
   - キャッシュサイズの確認
   - ビルド時間の比較

2. **継続的改善**
   - キーパターンの調整
   - パスの最適化
   - 不要なキャッシュの削除

**スクリプト**: `scripts/estimate-cache-size.mjs`

## 関連スキル

このスキルは以下のスキルと連携して使用されます:

- **github-actions-syntax** (`.claude/skills/github-actions-syntax/SKILL.md`)
  - ワークフロー構文の基礎
  - キャッシュアクションを組み込むワークフロー構造

- **docker-build-push-action** (`.claude/skills/docker-build-push-action/SKILL.md`)
  - Dockerビルドキャッシュとの統合
  - BuildKitキャッシュバックエンドとの組み合わせ

- **matrix-builds** (`.claude/skills/matrix-builds/SKILL.md`)
  - マトリックスビルドでのキャッシュ共有
  - OS/バージョン別のキャッシュ戦略

- **cost-optimization-gha** (`.claude/skills/cost-optimization-gha/SKILL.md`)
  - キャッシュによるランナー使用時間削減
  - ストレージコストとのトレードオフ

## 使用例

### Node.js (pnpm) の高速化

```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v2

- name: Cache pnpm store
  uses: actions/cache@v4
  with:
    path: ~/.pnpm-store
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
    restore-keys: |
      ${{ runner.os }}-pnpm-

- name: Install dependencies
  run: pnpm install --frozen-lockfile
```

### Docker ビルドキャッシュ

```yaml
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3

- name: Cache Docker layers
  uses: actions/cache@v4
  with:
    path: /tmp/.buildx-cache
    key: ${{ runner.os }}-buildx-${{ github.sha }}
    restore-keys: |
      ${{ runner.os }}-buildx-

- name: Build and push
  uses: docker/build-push-action@v5
  with:
    cache-from: type=local,src=/tmp/.buildx-cache
    cache-to: type=local,dest=/tmp/.buildx-cache-new,mode=max
```

**詳細な実装例**: `templates/cache-examples.yaml`
