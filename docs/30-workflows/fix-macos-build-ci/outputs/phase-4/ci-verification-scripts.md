# CI検証スクリプト設計書

## 概要

CIビルドの成功を検証するためのスクリプト設計。

---

## 1. ローカル模擬スクリプト

### 目的

CI環境のビルドプロセスをローカルで模擬し、事前検証を行う。

### スクリプト設計

```bash
#!/bin/bash
# scripts/verify-macos-build.sh

set -e

echo "=== macOS ビルド検証スクリプト ==="

# 1. 依存関係インストール
echo "Step 1: 依存関係インストール"
pnpm install

# 2. shared パッケージビルド
echo "Step 2: shared パッケージビルド"
pnpm --filter @repo/shared build

# 3. desktop アプリビルド
echo "Step 3: desktop アプリビルド"
pnpm --filter @repo/desktop build

# 4. macOS パッケージング
echo "Step 4: macOS パッケージング"
pnpm --filter @repo/desktop package:mac

# 5. 成果物確認
echo "Step 5: 成果物確認"
ls -la apps/desktop/dist/*.zip

echo "=== ビルド検証完了 ==="
```

### 実行方法

```bash
chmod +x scripts/verify-macos-build.sh
./scripts/verify-macos-build.sh
```

---

## 2. 成果物存在チェックスクリプト

### 目的

ビルド後に必要な成果物が生成されているか確認する。

### スクリプト設計

```bash
#!/bin/bash
# scripts/check-artifacts.sh

DIST_DIR="apps/desktop/dist"
EXPECTED_FILES=("*.zip")

echo "=== 成果物チェック ==="

# ディレクトリ存在確認
if [ ! -d "$DIST_DIR" ]; then
    echo "ERROR: dist ディレクトリが存在しません"
    exit 1
fi

# ZIPファイル存在確認
ZIP_COUNT=$(find "$DIST_DIR" -name "*.zip" | wc -l)
if [ "$ZIP_COUNT" -eq 0 ]; then
    echo "ERROR: ZIPファイルが生成されていません"
    exit 1
fi

# ファイルサイズ確認（10MB以上）
for zip in "$DIST_DIR"/*.zip; do
    SIZE=$(stat -f%z "$zip" 2>/dev/null || stat -c%s "$zip")
    if [ "$SIZE" -lt 10000000 ]; then
        echo "WARNING: $zip のサイズが小さい可能性があります ($SIZE bytes)"
    else
        echo "OK: $zip ($SIZE bytes)"
    fi
done

echo "=== チェック完了: $ZIP_COUNT 個のZIPファイルを確認 ==="
```

### 成功基準

| 項目           | 基準                             |
| -------------- | -------------------------------- |
| ZIPファイル数  | 1以上                            |
| ファイルサイズ | 10MB以上                         |
| ファイル名形式 | `*-arm64.zip` または `*-x64.zip` |

---

## 3. ビルドログ解析スクリプト

### 目的

CIビルドログからエラーや警告を検出する。

### スクリプト設計

```bash
#!/bin/bash
# scripts/analyze-build-log.sh

LOG_FILE="$1"

if [ -z "$LOG_FILE" ]; then
    echo "Usage: $0 <log-file>"
    exit 1
fi

echo "=== ビルドログ解析 ==="

# hdiutil エラーチェック
if grep -q "hdiutil" "$LOG_FILE"; then
    echo "WARNING: hdiutil 関連のログが検出されました"
    grep "hdiutil" "$LOG_FILE"
fi

# エラーチェック
ERROR_COUNT=$(grep -c "error" "$LOG_FILE" || true)
if [ "$ERROR_COUNT" -gt 0 ]; then
    echo "ERROR: $ERROR_COUNT 件のエラーが検出されました"
    grep "error" "$LOG_FILE"
fi

# 成功メッセージ確認
if grep -q "Build completed" "$LOG_FILE"; then
    echo "OK: ビルドが完了しています"
fi

echo "=== 解析完了 ==="
```

---

## 4. CI実行検証コマンド

### GitHub CLI を使用した検証

```bash
# 最新のワークフロー実行を確認
gh run list --workflow=build-electron.yml --limit=5

# 特定の実行の詳細を確認
gh run view <run-id>

# ログをダウンロード
gh run download <run-id> --dir ./ci-logs

# アーティファクトを確認
gh run view <run-id> --json artifacts
```

### 検証チェックリスト

| 項目                 | コマンド                            | 期待結果   |
| -------------------- | ----------------------------------- | ---------- |
| ワークフロー起動     | `gh run list`                       | 実行が開始 |
| macOSジョブ成功      | `gh run view <id>`                  | 緑チェック |
| アーティファクト存在 | `gh run view <id> --json artifacts` | 1件以上    |
| hdiutilエラーなし    | ログ確認                            | エラーなし |

---

## 5. 自動検証スクリプト（統合）

### スクリプト設計

```bash
#!/bin/bash
# scripts/full-verification.sh

set -e

echo "========================================"
echo "macOS CI ビルド完全検証"
echo "========================================"

# ローカルビルド検証
./scripts/verify-macos-build.sh

# 成果物チェック
./scripts/check-artifacts.sh

echo "========================================"
echo "全検証完了"
echo "========================================"
```

---

## 実装ステータス

| スクリプト            | ステータス | 備考                     |
| --------------------- | ---------- | ------------------------ |
| verify-macos-build.sh | 設計完了   | Phase 5で実装判断        |
| check-artifacts.sh    | 設計完了   | Phase 5で実装判断        |
| analyze-build-log.sh  | 設計完了   | CI検証で必要に応じて使用 |
| full-verification.sh  | 設計完了   | Phase 5で実装判断        |

**注**: 今回の修正は設定ファイルの変更のみであり、実際のスクリプト実装は任意。
検証は手動またはCIの実行結果で行う。

---

## 完了確認

- [x] ローカル模擬スクリプトを設計した
- [x] 成果物チェックスクリプトを設計した
- [x] ビルドログ解析スクリプトを設計した
- [x] 検証手順を定義した
