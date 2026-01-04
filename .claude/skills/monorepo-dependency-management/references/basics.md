# モノレポ依存関係管理 - 基礎概念

## 概要

モノレポ（Monorepo）は単一リポジトリに複数のパッケージを格納するアーキテクチャ。
依存関係管理はモノレポ運用の核心であり、pnpm workspacesを用いた効率的な管理が標準となっている。

## 核心概念

### ワークスペース（Workspace）

```yaml
# pnpm-workspace.yaml
packages:
  - "packages/*" # 共有ライブラリ
  - "apps/*" # アプリケーション
```

- モノレポ内の各パッケージを管理する単位
- pnpm-workspace.yamlで定義
- 単一のpnpm-lock.yamlで依存を一元管理

### 依存関係の種類

| 種類     | 説明                           | 例                          |
| -------- | ------------------------------ | --------------------------- |
| 外部依存 | npm registryからの依存         | `lodash`, `react`           |
| 内部依存 | ワークスペース内の依存         | `@app/core`, `@repo/shared` |
| ピア依存 | ホストパッケージに委任する依存 | `react`（UIライブラリから） |
| 開発依存 | ビルド・テストに必要な依存     | `typescript`, `vitest`      |

### workspace:プロトコル

```json
{
  "dependencies": {
    "@app/core": "workspace:*", // 常に最新
    "@app/utils": "workspace:^1.0.0" // semver範囲
  }
}
```

- `workspace:*`: 開発中のパッケージに使用
- `workspace:^x.y.z`: 安定版パッケージに使用
- 内部依存を明示的に宣言

## 依存グラフ

### 構造

```
apps/web ───┬───► packages/ui
            │
            └───► packages/core ───► packages/utils
                        │
apps/api ───────────────┘
```

- 有向グラフとして表現
- 循環依存は許可されない
- 上位レイヤー→下位レイヤーの方向が原則

### 依存の方向性ルール

```
apps/     (アプリケーション層)
  ↓
packages/ (ライブラリ層)
  ↓
shared/   (共通層)

✅ 上位→下位: 許可
❌ 下位→上位: 禁止
❌ 同一層循環: 禁止
```

## 循環依存

### 問題点

- ビルド順序が決定不能
- 部分的な変更が全体に波及
- テスト分離が困難

### 検出方法

```bash
# scripts/analyze-workspace-deps.mjs を使用
node scripts/analyze-workspace-deps.mjs --detect-circular
```

### 解決パターン

1. **共通パッケージ抽出**: 循環する部分を新パッケージへ分離
2. **インターフェース分離**: 依存関係を逆転
3. **イベント駆動**: 直接依存を間接的な通信に置換

## ホイスティング

### 概念

依存パッケージをルートnode_modulesに引き上げる仕組み。

```ini
# .npmrc
shamefully-hoist=false          # デフォルト: 厳格なシンボリックリンク
public-hoist-pattern[]=*eslint* # 特定パッケージのみホイスト
public-hoist-pattern[]=@types/*
```

### 設定指針

| 設定             | 推奨値 | 理由                           |
| ---------------- | ------ | ------------------------------ |
| shamefully-hoist | false  | 厳格な依存解決を維持           |
| public-hoist     | 限定的 | ツール互換性のため最小限に設定 |
| link-workspace   | true   | 内部パッケージの自動リンク     |

## 基本コマンド

### 依存追加

```bash
# 特定パッケージに追加
pnpm --filter @app/web add lodash

# ルートに追加（共通ツール）
pnpm add -w typescript

# 内部パッケージを依存として追加
pnpm --filter @app/web add @app/core
```

### ビルド・テスト

```bash
# 全パッケージでビルド
pnpm -r run build

# 依存順でビルド
pnpm -r --filter @app/web... run build

# 変更パッケージのみテスト
pnpm --filter "[origin/main]" run test
```

## 判断基準

### スキル適用タイミング

- pnpm-workspace.yamlの新規作成・更新時
- 循環依存の検出・解消時
- パッケージ間バージョン同期時
- ビルド順序の最適化時
- 変更影響範囲の分析時

### 前提条件

- pnpmがインストールされている
- モノレポ構造が存在する（または設計中）
- package.jsonの基本構造を理解している
