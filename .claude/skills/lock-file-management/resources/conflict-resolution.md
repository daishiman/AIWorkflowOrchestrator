# マージコンフリクトの解決

## 概要

ロックファイルのマージコンフリクトは、複数のブランチで
依存関係が変更された場合に発生します。
適切な解決方法を選択することで、整合性のある状態を維持できます。

## コンフリクトの原因

### よくあるシナリオ

1. **並行した依存関係の追加**
   - ブランチAで`lodash`を追加
   - ブランチBで`axios`を追加
   - マージ時にコンフリクト

2. **同一パッケージの異なるバージョン**
   - ブランチAで`react@17.0.2`
   - ブランチBで`react@18.0.0`
   - マージ時にコンフリクト

3. **依存関係の削除と更新**
   - ブランチAでパッケージを削除
   - ブランチBで同じパッケージを更新
   - マージ時にコンフリクト

## 解決戦略

### 戦略1: ロックファイルの再生成（推奨）

**最も安全で確実な方法**

```bash
# 1. package.jsonのコンフリクトを先に解決
git checkout --ours package.json   # または手動で編集
# または
git checkout --theirs package.json

# 2. package.jsonを正しい状態に編集

# 3. ロックファイルを一旦削除
rm pnpm-lock.yaml  # または package-lock.json

# 4. ロックファイルを再生成
pnpm install

# 5. 変更をステージング
git add package.json pnpm-lock.yaml

# 6. マージを完了
git commit
```

**メリット**:
- 整合性が保証される
- 推移的依存も正しく解決される
- 古い依存情報が残らない

**デメリット**:
- ネットワークアクセスが必要
- 時間がかかる場合がある

### 戦略2: 一方を採用して再インストール

**片方のブランチの変更を優先する場合**

```bash
# theirs（マージ元）を採用
git checkout --theirs pnpm-lock.yaml
pnpm install

# または ours（現在のブランチ）を採用
git checkout --ours pnpm-lock.yaml
pnpm install
```

### 戦略3: 手動マージ（非推奨）

**ロックファイルの直接編集は避けるべき**

理由:
- 整合性が壊れやすい
- 推移的依存の解決が困難
- ハッシュ値の再計算が必要

## パッケージマネージャー別の解決手順

### pnpm

```bash
# 1. package.jsonのコンフリクトを解決
# 2. ロックファイルを削除
rm pnpm-lock.yaml

# 3. 再インストール
pnpm install

# 4. 確認
pnpm audit
pnpm test
```

### pnpm

```bash
# 1. package.jsonのコンフリクトを解決
# 2. ロックファイルを削除
rm package-lock.json

# 3. node_modulesも削除（推奨）
rm -rf node_modules

# 4. 再インストール
pnpm install

# 5. 確認
pnpm audit
pnpm test
```

### yarn

```bash
# 1. package.jsonのコンフリクトを解決
# 2. ロックファイルを削除
rm yarn.lock

# 3. 再インストール
yarn install

# 4. 確認
yarn audit
yarn test
```

## コンフリクトの予防

### Gitフック

```bash
#!/bin/bash
# .git/hooks/post-merge

# ロックファイルが変更された場合に自動で再インストール
CHANGED_FILES=$(git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD)

if echo "$CHANGED_FILES" | grep -q "pnpm-lock.yaml\|package-lock.json\|yarn.lock"; then
  echo "Lock file changed. Running install..."
  pnpm install
fi
```

### ブランチ戦略

1. **短命なフィーチャーブランチ**
   - 長期間のブランチはコンフリクトが増加
   - 頻繁なマージでコンフリクトを最小化

2. **依存関係変更の分離**
   - 依存関係の変更は専用のPR/ブランチで
   - 他の変更と混ぜない

3. **定期的なリベース**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

### CI/CDでの検出

```yaml
# GitHub Actions
- name: Verify lock file is up to date
  run: |
    pnpm install --frozen-lockfile
    git diff --exit-code pnpm-lock.yaml
```

## 複雑なコンフリクトの解決

### シナリオ: 両方のブランチで同じパッケージの異なるバージョン

```bash
# 1. どちらのバージョンを使用するか決定

# 2. package.jsonを編集して正しいバージョンを指定
{
  "dependencies": {
    "react": "^18.2.0"  // 決定したバージョン
  }
}

# 3. ロックファイルを再生成
rm pnpm-lock.yaml
pnpm install

# 4. テストで動作確認
pnpm test
```

### シナリオ: 削除されたパッケージと更新されたパッケージ

```bash
# 1. パッケージが本当に不要か確認
grep -r "import.*from 'package-name'" src/

# 2. 不要なら package.json から削除
# 必要なら保持

# 3. ロックファイルを再生成
rm pnpm-lock.yaml
pnpm install
```

### シナリオ: モノレポでのコンフリクト

```bash
# 1. 各パッケージの package.json を確認

# 2. ルートの pnpm-lock.yaml を再生成
rm pnpm-lock.yaml
pnpm install

# 3. 全パッケージのテストを実行
pnpm -r test
```

## トラブルシューティング

### 再生成後もエラーが発生する場合

```bash
# 1. node_modules を完全に削除
rm -rf node_modules
rm -rf packages/*/node_modules  # モノレポの場合

# 2. pnpm のストアをクリア
pnpm store prune

# 3. 再インストール
pnpm install
```

### ピア依存のコンフリクト

```bash
# 1. 問題のあるピア依存を確認
pnpm why react

# 2. .npmrc で緩和設定
# .npmrc
strict-peer-dependencies=false

# 3. または overrides で強制
# package.json
{
  "pnpm": {
    "overrides": {
      "react": "^18.2.0"
    }
  }
}
```

## チェックリスト

### コンフリクト解決前
- [ ] package.jsonのコンフリクトを先に解決したか？
- [ ] どの変更を優先するか決定したか？
- [ ] 依存関係の変更理由を理解しているか？

### コンフリクト解決後
- [ ] ロックファイルが正しく再生成されたか？
- [ ] `pnpm install --frozen-lockfile` が成功するか？
- [ ] 全テストが通過するか？
- [ ] セキュリティ監査をパスするか？
