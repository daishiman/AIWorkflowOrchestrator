---
type: reference
title: "[リファレンス名]"
audience: [developer | admin | user]
product: product-name
version: "1.0"
keywords: []
last-updated: YYYY-MM-DD
---

# [リファレンス名]

## 概要

[このリファレンスの内容を1文で説明]

## [カテゴリ1]

### [項目1.1]

| 属性 | 値 |
|:-----|:---|
| 型 | `string` |
| 必須 | はい |
| デフォルト | なし |
| 説明 | [説明] |

**例**:
```
value: "example"
```

### [項目1.2]

| 属性 | 値 |
|:-----|:---|
| 型 | `integer` |
| 必須 | いいえ |
| デフォルト | `10` |
| 説明 | [説明] |

**有効な値**: `1` - `100`

## [カテゴリ2]

### [項目2.1]

**構文**:
```
command [options] <argument>
```

**オプション**:

| オプション | 短縮形 | 説明 |
|:-----------|:-------|:-----|
| `--verbose` | `-v` | 詳細出力を有効化 |
| `--output` | `-o` | 出力先を指定 |
| `--help` | `-h` | ヘルプを表示 |

**例**:
```bash
command -v --output=/path/to/file argument
```

### [項目2.2]

[項目の説明]

## 一覧表

| 名前 | 型 | 必須 | デフォルト | 説明 |
|:-----|:---|:----:|:-----------|:-----|
| `param1` | string | ○ | - | パラメータ1の説明 |
| `param2` | number | - | `0` | パラメータ2の説明 |
| `param3` | boolean | - | `false` | パラメータ3の説明 |
| `param4` | array | - | `[]` | パラメータ4の説明 |

## エラーコード

| コード | 説明 | 対処方法 |
|:-------|:-----|:---------|
| `E001` | [エラー1の説明] | [対処方法] |
| `E002` | [エラー2の説明] | [対処方法] |
| `E003` | [エラー3の説明] | [対処方法] |

## 完全な例

### 基本設定

```yaml
# 最小限の設定例
setting1: value1
setting2: value2
```

### 詳細設定

```yaml
# すべてのオプションを含む設定例
setting1: value1
setting2: value2
advanced:
  option1: true
  option2: 100
  option3:
    - item1
    - item2
```

## 関連情報

- [関連リファレンス1](./related-reference-1.md)
- [関連リファレンス2](./related-reference-2.md)
- [設定方法](../tasks/configure.md)
- [概念の説明](../concepts/explanation.md)

## 変更履歴

| バージョン | 変更内容 |
|:-----------|:---------|
| 1.2.0 | `param4`を追加 |
| 1.1.0 | `param2`のデフォルト値を変更 |
| 1.0.0 | 初回リリース |
