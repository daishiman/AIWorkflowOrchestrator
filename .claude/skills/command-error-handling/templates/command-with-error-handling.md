---
description: |
  [コマンドの説明]
  エラーハンドリングを含む堅牢な実装例です。

  使用例:
  /[command-name] [引数]
argument-hint: "[引数名]"
allowed-tools: Read, Write, Edit, Bash
---

# [コマンド名]

## 概要
[コマンドの目的と機能]

## エラーハンドリング戦略

### 1. 事前検証（Pre-validation）
実行前に条件をチェックします：

- 引数の存在確認
- ファイル/ディレクトリの存在確認
- 権限の確認
- 依存関係の確認

### 2. 実行時エラー処理

#### 引数エラー
```
if [ -z "$ARGUMENTS" ]; then
  echo "❌ エラー: 引数が必要です"
  echo ""
  echo "使用方法:"
  echo "  /[command-name] <引数>"
  echo ""
  echo "例:"
  echo "  /[command-name] example-value"
  exit 1
fi
```

#### ファイルエラー
```
if [ ! -f "$target_file" ]; then
  echo "❌ エラー: ファイルが見つかりません: $target_file"
  echo ""
  echo "確認事項:"
  echo "  - ファイルパスが正しいか確認してください"
  echo "  - ファイルが存在するか確認してください"
  exit 1
fi
```

#### 処理エラー
```
result=$(process_command) || {
  echo "❌ エラー: 処理に失敗しました"
  echo ""
  echo "考えられる原因:"
  echo "  - [原因1]"
  echo "  - [原因2]"
  echo ""
  echo "対処法:"
  echo "  - [解決策1]"
  echo "  - [解決策2]"
  exit 1
}
```

### 3. リカバリー機能

#### バックアップ作成
```
backup_file="${target_file}.backup.$(date +%Y%m%d_%H%M%S)"
cp "$target_file" "$backup_file"
echo "📦 バックアップを作成: $backup_file"
```

#### ロールバック
```
rollback() {
  if [ -f "$backup_file" ]; then
    cp "$backup_file" "$target_file"
    echo "↩️ ロールバック完了"
  fi
}
trap rollback ERR
```

## 処理フロー

### Step 1: 事前検証
- 引数チェック
- 環境チェック
- 依存関係チェック

### Step 2: バックアップ
- 変更対象のバックアップを作成
- ロールバックポイントを設定

### Step 3: 処理実行
- メイン処理を実行
- 各ステップで結果を確認

### Step 4: 検証と完了
- 処理結果の検証
- 成功時: バックアップのクリーンアップ
- 失敗時: ロールバックを実行

## エラーメッセージガイドライン

### 良いエラーメッセージの例
```
❌ エラー: 設定ファイルが見つかりません

ファイル: /path/to/config.json

考えられる原因:
  - ファイルが削除された
  - パスが間違っている

対処法:
  1. ファイルの存在を確認: ls -la /path/to/config.json
  2. 設定ファイルを再作成: /init-config
```

### 避けるべきエラーメッセージ
```
Error: Failed
```

## 使用例

### 正常実行
```
/[command-name] valid-input
✅ 処理が完了しました
```

### エラー発生時
```
/[command-name] invalid-input
❌ エラー: 入力が無効です
...（詳細なエラー情報と対処法）
```

## 関連コマンド

- `/[related-command]` - [説明]
