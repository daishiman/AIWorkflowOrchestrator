# Lock File Management 基礎知識

> **相対パス**: `references/basics.md`
> **読込条件**: 初回使用時

---

## ロックファイルの役割

| 役割               | 説明                           |
| ------------------ | ------------------------------ |
| 依存関係固定       | 正確なバージョンを記録         |
| 再現可能ビルド     | 環境間で同一の依存関係を保証   |
| インストール高速化 | 解決済み依存関係を再利用       |
| セキュリティ       | 意図しないバージョン変更を防止 |

---

## パッケージマネージャー別形式

| PM   | ロックファイル    | 形式 |
| ---- | ----------------- | ---- |
| pnpm | pnpm-lock.yaml    | YAML |
| npm  | package-lock.json | JSON |
| yarn | yarn.lock         | 独自 |

---

## 基本コマンド

### pnpm

```bash
# インストール（ロックファイル使用）
pnpm install

# frozen-lockfile（CI/CD推奨）
pnpm install --frozen-lockfile

# ロックファイル再生成
pnpm install --force
```

### npm

```bash
# インストール（ロックファイル使用）
npm ci

# 通常インストール
npm install

# ロックファイル更新
npm install --package-lock-only
```

---

## マージコンフリクト解決

### 基本手順

1. コンフリクトマーカーを含むファイルを削除
2. package.jsonのコンフリクトを解決
3. ロックファイルを再生成

```bash
# pnpmの場合
rm pnpm-lock.yaml
pnpm install

# npmの場合
rm package-lock.json
npm install
```

---

## CI/CD設定

### frozen-lockfileの重要性

| 設定なし                   | frozen-lockfile使用 |
| -------------------------- | ------------------- |
| 依存関係が変更される可能性 | 完全に固定          |
| 環境差異のリスク           | 再現可能            |
| 予期せぬ問題               | 安定したビルド      |

### GitHub Actions例

```yaml
- name: Install dependencies
  run: pnpm install --frozen-lockfile
```

---

## 関連リソース

- **解決パターン**: See [patterns.md](patterns.md)
