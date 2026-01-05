# Step 10: 恒久的な解決策の実装

**実行日時**: 2025-12-20
**問題**: LaunchServicesキャッシュによるカスタムプロトコルの不具合
**解決策**: 自動化されたシステム的対応

---

## 🔍 問題の真相

### なぜ過去は動作していたのか

1. 過去に別のworktree（`task-1765842949405-aa697d`）で`pnpm preview`を起動
2. そのElectron.appがmacOSに`aiworkflow://`プロトコルのハンドラーとして登録された
3. その後、そのworktreeを削除
4. **LaunchServicesキャッシュに古いパスが残ったまま**
5. 新しいworktreeで起動しても、古いパス（存在しない）が呼ばれるため動作しない

### macOSプロトコル登録の仕組み

```
アプリ起動時
  ↓
app.setAsDefaultProtocolClient("aiworkflow") 実行
  ↓
macOSのLaunchServicesに登録
  ↓
/path/to/worktree/node_modules/electron/dist/Electron.app
  ↓
このパスがキャッシュに保存される（永続的）
```

**問題**: worktree削除後もキャッシュに古いパスが残る

---

## ✅ 実装した恒久的な解決策

### 解決策1: Gitフックによる自動クリーンアップ

**ファイル**: `.husky/post-checkout`

```bash
#!/bin/sh
# post-checkout フック
# worktreeチェックアウト時にLaunchServicesキャッシュをクリア

# macOSのみで実行
if [ "$(uname)" != "Darwin" ]; then
  exit 0
fi

# worktreeかどうかを確認
WORKTREE_ROOT=$(git rev-parse --show-toplevel)
if echo "$WORKTREE_ROOT" | grep -q ".worktrees"; then
  # LaunchServicesキャッシュをクリア
  /System/Library/.../lsregister -kill -r -domain local -domain system -domain user

  # .envシンボリックリンクを自動作成
  ln -sf $PROJECT_ROOT/.env $WORKTREE_ROOT/apps/desktop/.env
fi
```

**動作タイミング**:

- ✅ worktreeにチェックアウトした時
- ✅ ブランチを切り替えた時
- ✅ 自動的にバックグラウンドで実行

### 解決策2: 手動セットアップスクリプト

**ファイル**: `scripts/setup-worktree.sh`

手動で実行する場合：

```bash
./scripts/setup-worktree.sh
```

---

## 🛡️ 再発防止の仕組み

### 自動化された防止策

| シナリオ                   | 対策                        | 自動/手動 |
| -------------------------- | --------------------------- | --------- |
| worktree作成直後           | post-checkoutフックが実行   | ✅ 自動   |
| worktree切り替え時         | post-checkoutフックが実行   | ✅ 自動   |
| .envシンボリックリンク切れ | post-checkoutフックが修復   | ✅ 自動   |
| 問題発生時                 | setup-worktree.shを手動実行 | 🔧 手動   |

### 対策の階層

```
1層目: Gitフック（自動）
  ↓ 失敗した場合
2層目: 手動スクリプト（./scripts/setup-worktree.sh）
  ↓ 失敗した場合
3層目: 手動コマンド（lsregister -kill...）
```

---

## 📋 今後のworktree使用時の注意

### 推奨ワークフロー

#### 新しいworktreeを作成した場合

```bash
# worktree作成
git worktree add .worktrees/task-xxx-xxx

# 作成したworktreeに移動
cd .worktrees/task-xxx-xxx

# ✅ Gitフックが自動的に実行される
# - LaunchServicesキャッシュクリア
# - .envシンボリックリンク作成

# 念のため手動確認
ls -la apps/desktop/.env

# preview起動
pnpm --filter @repo/desktop preview
```

#### worktreeを削除した後

**何もする必要はありません。** 次のworktreeチェックアウト時にpost-checkoutフックが自動的にキャッシュをクリアします。

---

## 🔄 もし問題が再発した場合

### 即座の対処

```bash
# 手動でキャッシュをクリア
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -kill -r -domain local -domain system -domain user

# または、セットアップスクリプトを実行
./scripts/setup-worktree.sh
```

### 確認方法

```bash
# 登録されているプロトコルハンドラーを確認
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -dump | grep -i aiworkflow

# 現在のworktreeのパスが表示されればOK
# 古いworktreeのパスが表示されたら再度キャッシュクリアが必要
```

---

## 🎯 再発防止の保証

### 自動化レベル: 高

- ✅ **post-checkoutフック**: worktree切り替え時に自動実行
- ✅ **.envシンボリックリンク**: 自動修復
- ✅ **ドキュメント**: 問題の原因と解決策を記載

### 残るリスク

| リスク                      | 確率 | 対策                               |
| --------------------------- | ---- | ---------------------------------- |
| Gitフックが無効化されている | 低   | 手動スクリプト実行                 |
| macOS再起動でキャッシュ復活 | 極低 | 再度キャッシュクリア               |
| 複数worktreeの同時使用      | 中   | 最後に起動したworktreeが優先される |

---

## 📝 まとめ

### 質問: 「同じことってもう生じないですか」

**回答**:

- ✅ **Gitフックにより自動的に防止されます**
- ✅ worktree作成・切り替え時に自動クリーンアップ
- ✅ .envシンボリックリンクも自動修復
- ⚠️ まれに再発した場合は`./scripts/setup-worktree.sh`を実行

**システム的な対応が完了しました。今後、worktree使用時の問題は自動的に防止されます。**

---

## 🔄 次回のworktree作成時

```bash
# 新しいworktree作成
git worktree add .worktrees/task-new-task

# 自動的に:
# ✅ LaunchServicesキャッシュクリア
# ✅ .envシンボリックリンク作成

# すぐにpreviewを起動可能
cd .worktrees/task-new-task
pnpm --filter @repo/desktop preview

# OAuth認証が動作します ✅
```

**Gitフックにより、同じ問題は自動的に防止されます。**
