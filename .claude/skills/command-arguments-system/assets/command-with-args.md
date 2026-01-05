---
description: |
  [コマンドの説明]
  引数を受け取り、[操作内容]を実行します。

  使用例:
  /[command-name] [引数の例]
argument-hint: "[引数名] - [説明]"
allowed-tools: Read, Edit, Grep
---

# [コマンド名]

## 概要

$ARGUMENTS を使用して[操作内容]を実行します。

## 引数

### 必須引数

- `$1`: [第1引数の説明]
- `$2`: [第2引数の説明（オプション）]

### 引数形式

```
/[command-name] <必須引数> [オプション引数]
```

## 処理フロー

### Step 1: 引数の検証

引数が提供されているか確認します：

```
if [ -z "$ARGUMENTS" ]; then
  echo "エラー: 引数が必要です"
  echo "使用方法: /[command-name] <引数>"
  exit 1
fi
```

### Step 2: 引数の解析

$ARGUMENTS を個別の変数に分解します：

- 第1引数（$1）: [用途]
- 第2引数（$2）: [用途]

### Step 3: 処理の実行

引数に基づいて処理を実行します。

## 使用例

### 基本的な使用

```
/[command-name] example-value
```

### 複数引数

```
/[command-name] value1 value2
```

## エラーハンドリング

### 引数不足の場合

引数が不足している場合は、使用方法を表示します。

### 無効な引数の場合

引数の形式が不正な場合は、期待される形式を説明します。

## 関連コマンド

- /[related-command-1]
- /[related-command-2]
