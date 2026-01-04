---
description: |
  [コマンドの説明]
  外部ファイルを参照しながら処理を実行します。

  使用例:
  /[command-name] @path/to/file.md
argument-hint: "[@file] - [参照ファイル]"
allowed-tools: Read, Edit
---

# [コマンド名]

## 概要

外部ファイルの内容を参照して処理を行います。

## 入力

- `@path/to/file.md`: 参照するファイル

## 参照ルール

- 相対パスは使用しない
- 対象ファイルの存在を確認する

## 処理フロー

1. 参照ファイルの検証
2. ファイル内容の読み取り
3. 参照内容に基づく処理の実行

## 使用例

```
/[command-name] @docs/example.md
```
