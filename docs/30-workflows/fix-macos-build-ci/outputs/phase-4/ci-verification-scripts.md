# CI検証スクリプト設計書

## 作成日

2026-01-13

## 概要

CIビルドの成功を検証するためのスクリプト設計を定義する。

---

## スクリプト一覧

### 1. plistファイル存在チェック

**目的**: entitlements.mac.plistファイルの存在を確認

```bash
#!/bin/bash
# plist-check.sh
# 使用方法: ./scripts/plist-check.sh

PLIST_PATH="apps/desktop/build/entitlements.mac.plist"

if [ -f "$PLIST_PATH" ]; then
    echo "✅ entitlements.mac.plist exists"
    exit 0
else
    echo "❌ entitlements.mac.plist not found"
    echo "   Expected path: $PLIST_PATH"
    exit 1
fi
```

**テストケース**:
| 状態 | 期待結果 | Exit Code |
| -------------------- | -------- | --------- |
| ファイルが存在する | 成功 | 0 |
| ファイルが存在しない | 失敗 | 1 |

---

### 2. plist構文検証

**目的**: plistファイルがXML構文として有効であることを確認

```bash
#!/bin/bash
# plist-validate.sh
# 使用方法: ./scripts/plist-validate.sh

PLIST_PATH="apps/desktop/build/entitlements.mac.plist"

# ファイル存在チェック
if [ ! -f "$PLIST_PATH" ]; then
    echo "❌ File not found: $PLIST_PATH"
    exit 1
fi

# 構文検証
if plutil -lint "$PLIST_PATH"; then
    echo "✅ plist syntax is valid"
    exit 0
else
    echo "❌ plist syntax validation failed"
    exit 1
fi
```

**テストケース**:
| 状態 | 期待結果 | Exit Code |
| ------------------ | -------------------- | --------- |
| 有効なplist構文 | OK | 0 |
| 無効なplist構文 | Syntax error message | 非0 |
| ファイルが存在しない | File not found | 1 |

---

### 3. 権限内容検証

**目的**: 必須のentitlements権限が含まれていることを確認

```bash
#!/bin/bash
# plist-content-check.sh
# 使用方法: ./scripts/plist-content-check.sh

PLIST_PATH="apps/desktop/build/entitlements.mac.plist"

# ファイル存在チェック
if [ ! -f "$PLIST_PATH" ]; then
    echo "❌ File not found: $PLIST_PATH"
    exit 1
fi

# 必須権限のチェック
REQUIRED_KEYS=(
    "com.apple.security.cs.allow-jit"
    "com.apple.security.cs.allow-unsigned-executable-memory"
)

MISSING_KEYS=()

for key in "${REQUIRED_KEYS[@]}"; do
    if /usr/libexec/PlistBuddy -c "Print :$key" "$PLIST_PATH" 2>/dev/null | grep -q "true"; then
        echo "✅ $key = true"
    else
        echo "❌ $key is missing or not true"
        MISSING_KEYS+=("$key")
    fi
done

if [ ${#MISSING_KEYS[@]} -eq 0 ]; then
    echo ""
    echo "✅ All required entitlements are present"
    exit 0
else
    echo ""
    echo "❌ Missing entitlements: ${MISSING_KEYS[*]}"
    exit 1
fi
```

**テストケース**:
| 状態 | 期待結果 | Exit Code |
| ---------------------- | -------- | --------- |
| 両方の権限が存在 | 成功 | 0 |
| 1つの権限が欠落 | 失敗 | 1 |
| 両方の権限が欠落 | 失敗 | 1 |

---

### 4. ビルド成果物確認

**目的**: ビルド後に.zipファイルが生成されていることを確認

```bash
#!/bin/bash
# build-check.sh
# 使用方法: ./scripts/build-check.sh

DIST_PATH="apps/desktop/dist"

if ls "$DIST_PATH"/*.zip 1> /dev/null 2>&1; then
    echo "✅ ZIP files found:"
    ls -la "$DIST_PATH"/*.zip
    exit 0
else
    echo "❌ No ZIP files found in $DIST_PATH"
    exit 1
fi
```

**テストケース**:
| 状態 | 期待結果 | Exit Code |
| -------------------- | -------------- | --------- |
| .zipファイルが存在 | ファイル一覧 | 0 |
| .zipファイルがない | No ZIP files | 1 |

---

### 5. 統合検証スクリプト

**目的**: 全ての検証を一括実行

```bash
#!/bin/bash
# verify-all.sh
# 使用方法: ./scripts/verify-all.sh

SCRIPT_DIR="$(dirname "$0")"
FAILED=0

echo "=== entitlements.mac.plist 検証 ==="
echo ""

# 1. 存在チェック
echo "--- 1. ファイル存在チェック ---"
"$SCRIPT_DIR/plist-check.sh" || FAILED=1
echo ""

# 2. 構文検証
echo "--- 2. 構文検証 ---"
"$SCRIPT_DIR/plist-validate.sh" || FAILED=1
echo ""

# 3. 権限内容検証
echo "--- 3. 権限内容検証 ---"
"$SCRIPT_DIR/plist-content-check.sh" || FAILED=1
echo ""

# 結果サマリー
echo "=== 検証結果 ==="
if [ $FAILED -eq 0 ]; then
    echo "✅ All verifications passed"
    exit 0
else
    echo "❌ Some verifications failed"
    exit 1
fi
```

---

## CI統合

### GitHub Actionsでの使用

```yaml
# .github/workflows/build-electron.yml への統合案
# （参考: 実際の変更は不要）

- name: Verify entitlements
  if: matrix.os == 'macos-14'
  run: |
    plutil -lint apps/desktop/build/entitlements.mac.plist
```

---

## 実行方法

### ローカル実行

```bash
# 個別実行
plutil -lint apps/desktop/build/entitlements.mac.plist

# 権限確認
/usr/libexec/PlistBuddy -c "Print" apps/desktop/build/entitlements.mac.plist
```

### CI実行

CIでは `build-electron.yml` の既存フローで自動検証される。
electron-builder が entitlements ファイルを読み込み、codesign に渡す。

---

## 完了確認

- [x] plistファイル存在チェックスクリプトを設計した
- [x] plist構文検証スクリプトを設計した
- [x] 権限内容検証スクリプトを設計した
- [x] ビルド成果物確認スクリプトを設計した
- [x] 統合検証スクリプトを設計した
- [x] CI統合方法を記載した
