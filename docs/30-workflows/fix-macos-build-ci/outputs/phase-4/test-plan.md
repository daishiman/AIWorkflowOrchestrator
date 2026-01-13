# テスト計画書

## 作成日

2026-01-13

## 概要

`entitlements.mac.plist` ファイル作成後のテスト実行計画を定義する。

---

## テスト実行環境

| 環境              | 対象テスト                   | 備考                       |
| ----------------- | ---------------------------- | -------------------------- |
| ローカル（macOS） | plist検証、ローカルビルド    | Apple Silicon（arm64）推奨 |
| GitHub Actions    | CI検証、アーティファクト生成 | macos-14 runner（arm64）   |
| 実機（macOS）     | 手動テスト、アプリ起動確認   | macOS 11.0以上             |

---

## テスト実行手順

### Phase 5後（実装完了後）

#### Step 1: plistファイル検証

```bash
# 1.1 ファイル存在確認
test -f apps/desktop/build/entitlements.mac.plist && echo "✅ PASS" || echo "❌ FAIL"

# 1.2 構文検証
plutil -lint apps/desktop/build/entitlements.mac.plist

# 1.3 権限内容確認
plutil -p apps/desktop/build/entitlements.mac.plist
```

**成功条件**:

- ファイルが存在する
- `plutil -lint` が "OK" を返す
- 2つの必須権限が含まれている

#### Step 2: ローカルビルド検証

```bash
# 2.1 依存パッケージのビルド
pnpm --filter @repo/shared build

# 2.2 デスクトップアプリのビルド
pnpm --filter @repo/desktop build

# 2.3 パッケージング（署名なし）
CSC_IDENTITY_AUTO_DISCOVERY=false pnpm --filter @repo/desktop package:mac

# 2.4 成果物確認
ls apps/desktop/dist/*.zip
```

**成功条件**:

- 全てのコマンドがexit 0で終了
- `*.zip` ファイルが生成されている
- "cannot read entitlement data" エラーが発生しない

### Phase 6後（CI検証）

#### Step 3: CI検証

1. 修正をブランチにコミット
2. PRを作成またはプッシュ
3. GitHub Actions `build-electron.yml` の実行を確認

**確認項目**:
| 項目 | 確認方法 | 成功条件 |
| --------------------------- | ------------------------------ | ------------------------------ |
| build-macos-arm64 ジョブ | GitHub Actions UI | ジョブがグリーン |
| エラーログなし | ジョブログ確認 | "cannot read entitlement data" がない |
| アーティファクト | GitHub Actions Artifacts | electron-macos-arm64 が存在 |

### Phase 11後（手動テスト）

#### Step 4: 手動テスト

1. GitHub Actions のアーティファクトをダウンロード
2. ZIPファイルを展開
3. アプリケーションを起動
4. 正常に起動することを確認

**確認項目**:
| 項目 | 確認方法 | 成功条件 |
| ---------------------- | ------------------ | ----------------------------- |
| アプリ起動 | ダブルクリック | メインウィンドウが表示される |
| Gatekeeperブロック | 起動時の警告確認 | 警告なしで起動、または許可後起動 |
| JIT動作 | 機能テスト | JavaScript処理が正常に動作 |

---

## 成功/失敗判定基準

### 全体成功条件

| テスト種別     | 成功条件                                   | 判定方法         |
| -------------- | ------------------------------------------ | ---------------- |
| plist構文      | `plutil -lint` がOKを返す                  | コマンド実行     |
| ローカルビルド | `package:mac` が成功、.zip生成             | コマンド実行     |
| CI             | `build-electron.yml` の macOS ジョブが成功 | GitHub Actions   |
| 成果物         | `.zip` ファイルが存在、ダウンロード可能    | アーティファクト |
| 手動テスト     | アプリが正常に起動、基本機能が動作         | 実機確認         |

### 失敗時の対応

| 失敗パターン       | 対応アクション     |
| ------------------ | ------------------ |
| plist構文エラー    | ファイル内容を修正 |
| ローカルビルド失敗 | 権限設定を見直す   |
| CI失敗（3回以上）  | ロールバックを検討 |
| アプリ起動しない   | 権限設定を見直す   |

---

## テスト実行タイムライン

```
Phase 5 完了（実装）
    │
    ▼
┌────────────────────────────────┐
│ Step 1: plist検証              │ ← 即時実行
│ - ファイル存在                 │
│ - 構文検証                     │
│ - 権限内容確認                 │
└────────────────────────────────┘
    │
    ▼
┌────────────────────────────────┐
│ Step 2: ローカルビルド         │ ← ローカル環境
│ - 依存ビルド                   │
│ - アプリビルド                 │
│ - パッケージング               │
└────────────────────────────────┘
    │
    ▼
Phase 6 完了（テスト拡充）
    │
    ▼
┌────────────────────────────────┐
│ Step 3: CI検証                 │ ← PRプッシュ後
│ - GitHub Actions実行           │
│ - ジョブ成功確認               │
│ - アーティファクト確認         │
└────────────────────────────────┘
    │
    ▼
Phase 11（手動テスト）
    │
    ▼
┌────────────────────────────────┐
│ Step 4: 手動テスト             │ ← 実機確認
│ - アーティファクトダウンロード │
│ - アプリ起動確認               │
│ - 基本動作確認                 │
└────────────────────────────────┘
```

---

## テストデータ

### entitlements.mac.plist（期待される内容）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
</dict>
</plist>
```

---

## ロールバック手順

### Phase 5後の失敗時

```bash
# ファイルを削除
rm apps/desktop/build/entitlements.mac.plist

# 変更を破棄
git checkout -- apps/desktop/build/
```

### CI失敗が継続する場合

```bash
# 1. ブランチを削除してやり直し
git checkout main
git branch -D task/fix-macos-build-ci

# 2. 新しいブランチで再実装
git checkout -b task/fix-macos-build-ci-v2
```

---

## 完了確認

- [x] テスト実行環境を定義した
- [x] テスト実行手順を定義した
- [x] 成功/失敗の判定基準を定義した
- [x] テストデータを準備した
- [x] ロールバック手順を定義した
- [x] テスト実行タイムラインを明記した
