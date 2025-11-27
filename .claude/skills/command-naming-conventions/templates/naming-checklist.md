# コマンド命名チェックリスト

## 基本ルール

### 1. kebab-case 形式
- [ ] すべて小文字
- [ ] 単語間はハイフン（-）で区切る
- [ ] アンダースコア（_）は使用しない
- [ ] スペースは使用しない

**良い例**: `create-user`, `run-tests`, `deploy-app`
**悪い例**: `createUser`, `Create_User`, `create user`

### 2. 動詞ベース命名
- [ ] コマンド名は動詞で始まる
- [ ] 動詞は命令形（現在形）を使用

**推奨される動詞**:
| カテゴリ | 動詞 |
|---------|------|
| 作成 | create, add, make, generate |
| 削除 | delete, remove, clear |
| 更新 | update, modify, edit, change |
| 取得 | get, fetch, list, show, display |
| 実行 | run, execute, start, stop |
| 検証 | test, check, validate, verify |
| ビルド | deploy, build, compile |
| 修正 | fix, repair, resolve |
| Git | commit, push, pull, merge |
| 分析 | review, analyze, audit |
| 設定 | init, setup, configure |
| データ | export, import, sync, backup, restore |

### 3. 名前の長さ
- [ ] 3文字以上
- [ ] 20文字以内を推奨
- [ ] 30文字を超えない

### 4. 説明的な名前
- [ ] コマンドの目的が名前から分かる
- [ ] 略語は一般的なもののみ使用
- [ ] 曖昧さを避ける

## 名前空間ルール

### 名前空間を使用する場合
- [ ] 関連するコマンドが3つ以上ある
- [ ] 機能領域で明確にグループ化できる

### 名前空間の形式
```
/[namespace]:[command-name]
```

**例**:
- `/git:commit-message` - Git関連
- `/test:run-unit` - テスト関連
- `/db:migrate-schema` - データベース関連

## 命名パターン例

### CRUDパターン
```
create-[resource]    # 作成
get-[resource]       # 取得（単数）
list-[resources]     # 取得（複数）
update-[resource]    # 更新
delete-[resource]    # 削除
```

### アクションパターン
```
[action]-[target]    # run-tests, deploy-app
[action]-[target]-[modifier]  # run-tests-parallel
```

### 分析パターン
```
analyze-[target]     # analyze-code
review-[target]      # review-pr
audit-[target]       # audit-security
```

## チェックリストテンプレート

新しいコマンドを作成する際は、以下を確認してください：

- [ ] kebab-case 形式である
- [ ] 動詞で始まっている
- [ ] 3-20文字の範囲内である
- [ ] 目的が名前から推測できる
- [ ] 既存コマンドと重複していない
- [ ] 適切な名前空間に配置されている（必要な場合）
- [ ] 一般的すぎる名前を避けている

## 避けるべき命名

### 避けるべきパターン
- `do-thing` - 曖昧すぎる
- `run` - 汎用的すぎる
- `my-command` - 説明的でない
- `temp` - 一時的な印象
- `test123` - 意味不明

### 改善例
| 悪い例 | 良い例 |
|--------|--------|
| `do-thing` | `generate-report` |
| `run` | `run-tests` |
| `check` | `check-syntax` |
| `update` | `update-dependencies` |
