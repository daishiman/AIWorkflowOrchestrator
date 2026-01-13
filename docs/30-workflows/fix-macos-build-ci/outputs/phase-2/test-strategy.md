# テスト戦略書

## 作成日

2026-01-13

## 概要

`entitlements.mac.plist` ファイル作成後の検証方法とロールバック手順を定義する。

---

## テスト戦略

### テスト種別と検証方法

| テスト種別     | 内容                                   | 検証方法                                  | 判定基準          | Phase |
| -------------- | -------------------------------------- | ----------------------------------------- | ----------------- | ----- |
| 構文検証       | plistファイルがXML/plist形式として有効 | `plutil -lint`                            | "OK"が返される    | 5     |
| ローカルビルド | macOSでのローカルビルド成功            | `pnpm --filter @repo/desktop package:mac` | ビルド成功        | 5     |
| CI検証         | GitHub Actionsでのビルド成功           | PRでCI実行                                | ジョブがグリーン  | 6     |
| 成果物確認     | .zipファイルが生成される               | アーティファクト確認                      | ZIPファイルが存在 | 6     |
| 手動テスト     | アプリがmacOSで起動できる              | ダウンロード→実行                         | 起動成功          | 11    |

---

## 各テストの詳細

### 1. 構文検証（plutil）

```bash
# 実行コマンド
plutil -lint apps/desktop/build/entitlements.mac.plist

# 成功時の出力
apps/desktop/build/entitlements.mac.plist: OK

# 失敗時の出力例
apps/desktop/build/entitlements.mac.plist: Unexpected character at line X
```

### 2. ローカルビルド

```bash
# 前提: macOS環境で実行

# 依存パッケージのビルド
pnpm --filter @repo/shared build

# デスクトップアプリのビルド
pnpm --filter @repo/desktop build

# パッケージング（署名なし）
CSC_IDENTITY_AUTO_DISCOVERY=false pnpm --filter @repo/desktop package:mac
```

**成功判定**:

- ビルドプロセスが正常終了
- `apps/desktop/dist/` に成果物が生成される
- `*.zip` ファイルが存在する

### 3. CI検証

**トリガー方法**:

1. 修正をブランチにコミット
2. PRを作成またはプッシュ
3. GitHub Actions `build-electron.yml` が自動実行

**確認項目**:

| 項目             | 確認方法                                        |
| ---------------- | ----------------------------------------------- |
| ジョブ成功       | `build-macos-arm64` ジョブがグリーン            |
| エラーなし       | ログに `cannot read entitlement data` がない    |
| アーティファクト | `electron-macos-arm64` がアップロードされている |

### 4. 手動テスト

**実行手順**:

1. GitHub Actionsのアーティファクトをダウンロード
2. ZIPファイルを展開
3. アプリケーションを起動
4. 正常に起動することを確認

---

## ロールバック手順

### 失敗時のロールバック

```bash
# 1. entitlements.mac.plist を削除
rm apps/desktop/build/entitlements.mac.plist

# 2. 必要に応じてelectron-builder.ymlを変更
#    （entitlements設定を削除またはコメントアウト）

# 3. CIを再実行して変更前の状態に戻す
git add .
git commit -m "revert: entitlements.mac.plist を削除"
git push
```

### ロールバック判断基準

| 状況               | 対応                 |
| ------------------ | -------------------- |
| plist構文エラー    | ファイル修正を試みる |
| ローカルビルド失敗 | 権限設定を見直す     |
| CI失敗（3回以上）  | ロールバックを検討   |
| アプリが起動しない | 権限設定を見直す     |

---

## 受け入れ基準との対応

| 受け入れ基準           | テスト種別 | 検証方法         |
| ---------------------- | ---------- | ---------------- |
| AC-01: ファイル存在    | 構文検証   | `test -f`        |
| AC-02: 有効なplist形式 | 構文検証   | `plutil -lint`   |
| AC-03: CIビルド成功    | CI検証     | GitHub Actions   |
| AC-04: ZIP成果物生成   | 成果物確認 | アーティファクト |
| AC-05: アプリ起動      | 手動テスト | 実機確認         |

---

## 完了確認

- [x] テスト種別と検証方法を定義した
- [x] テスト実行フローを設計した
- [x] 各テストの詳細を記述した
- [x] ロールバック手順を定義した
- [x] 受け入れ基準との対応を明記した
