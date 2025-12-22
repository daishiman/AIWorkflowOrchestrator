# 🚨 パッケージング回避策: mainブランチから実行

## 問題

worktreeでelectron-builderがmonorepo依存関係を解決できません：

```
⨯ dependency path is undefined  packageName=@electron-toolkit/utils
⨯ unable to parse `path` during `tree.dependencies` reduce
```

---

## 🔧 回避策: mainブランチからパッケージング

### ステップ1: 変更をmainブランチにマージ

```bash
# worktreeから抜ける
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrチestrator

# 現在のブランチを確認
git branch

# mainブランチにチェックアウト
git checkout main

# worktreeブランチの変更をマージ
git merge task/task-1766206724997-7b378f
```

### ステップ2: mainブランチからパッケージング

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/apps/desktop

# パッケージング実行
pnpm package:mac
```

---

## 🔄 または: コミットしてから直接マージ

```bash
# worktreeで変更をコミット
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-1766206724997-7b378f

git add -A
git commit -m "fix: AuthGuard復旧とcurrentViewリセット処理追加"
git push origin task/task-1766206724997-7b378f

# mainブランチに戻ってマージ
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator
git checkout main
git merge task/task-1766206724997-7b378f

# mainブランチからパッケージング
cd apps/desktop
pnpm package:mac
```

---

## ✅ パッケージング成功後

```bash
# .appバンドルが生成される
open dist/mac/AI\ Workflow\ Orchestrator.app
# または
open dist/mac-arm64/AI\ Workflow\ Orchestrator.app
```

**この.appバンドルでは、カスタムプロトコル（aiworkflow://）が正しく登録され、OAuth認証が動作します。**

---

## 🎯 なぜworktreeではパッケージングできないか

electron-builderは以下を期待しています：

1. `node_modules/`が正しい依存関係ツリーを持つ
2. workspace依存関係（`@repo/shared`など）が解決済み
3. シンボリックリンクが正常に機能する

worktreeでは：

- ❌ `node_modules/`が共有されている
- ❌ workspace依存関係のパスが異なる
- ❌ シンボリックリンクが壊れやすい

---

## 📝 推奨アクション

1. **worktreeで開発した変更をコミット**
2. **mainブランチにマージ**
3. **mainブランチからパッケージング**

これが最も確実な方法です。
