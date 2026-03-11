# [#1063] "[UT-FIX-WORKTREE-NATIVE-BINARY-GUARD-001] worktree環境でのネイティブバイナリ不整合を自動検出するガード"

## メタ情報

```yaml
task_id: UT-FIX-WORKTREE-NATIVE-BINARY-GUARD-001
task_name: worktree環境でのネイティブバイナリ不整合を自動検出するガード
category: 改善
target_feature: 開発環境（CI/セッション初期化）
priority: 低
scale: 小規模（2-4時間）
status: 未実施
source_phase: TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001 Phase 11
created_date: 2026-03-06
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-fix-worktree-native-binary-guard-001.md
```

| 項目       | 内容              |
| ---------- | ----------------- |
| 優先度     | 低                |
| 規模       | 小規模（2-4時間） |
| ステータス | 未実施            |

---

task_id: UT-FIX-WORKTREE-NATIVE-BINARY-GUARD-001
task_name: worktree環境でのネイティブバイナリ不整合を自動検出するガード
category: 改善
target_feature: 開発環境（CI/セッション初期化）
priority: 低
scale: 小規模
status: 未実施
source_phase: Phase 11
created_date: 2026-03-06
dependencies: []
issue_number: 1023

---

# worktree環境でのネイティブバイナリ不整合自動検出ガード - タスク指示書

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001 の実行中、worktree環境（`.worktrees/task-20260306-184551-wt1`）で esbuild の platform バイナリ不整合が発生。`@esbuild/darwin-arm64` が存在するが `darwin-x64` が必要な環境で、テスト実行もアプリ起動もできなかった。

`pnpm install --force` も `lucide-react` の ENOTEMPTY エラーと `better-sqlite3` の node-gyp エラーで失敗し、worktree環境での開発が完全にブロックされた。

### 1.2 問題点・課題

1. worktree 作成時にネイティブバイナリの整合性チェックが行われない
2. `session-init.sh`（Claude Code Hook）がworktree環境での platform 不整合を検出しない
3. 開発者が問題に気づくのは `vitest run` や `electron` 実行時で、既にかなりの作業が進んだ後

### 1.3 放置した場合の影響

- worktree ベースの並列開発で同じ問題が繰り返し発生
- 毎回「メインリポジトリにコピーしてテスト」という回避策が必要
- 開発効率の低下（今回は約30分のロスタイム）

---

## 2. 何を達成するか（What）

### 2.1 目的

worktree 作成直後またはセッション開始時に、ネイティブバイナリの platform 整合性を自動チェックし、不整合時に警告 + 修復手順を提示する。

### 2.2 最終ゴール

```bash
# worktree 作成後、session-init.sh が自動チェック
$ claude  # セッション開始
⚠️ Worktree環境検出: ネイティブバイナリの不整合
   esbuild: darwin-arm64 (期待: darwin-x64)
   修復: pnpm install --force || cp from main repo
```

### 2.3 スコープ

#### 含むもの

- `session-init.sh` にworktree検出 + platform チェックロジック追加
- esbuild, better-sqlite3 等の主要ネイティブモジュールの整合性確認
- 不整合時の修復手順表示
- P48（06-known-pitfalls.md）との連携

#### 含まないもの

- worktree 自体の作成プロセス変更
- CI パイプラインの変更
- ネイティブモジュールの自動修復（手動修復手順の提示のみ）

### 2.4 成果物

- 更新済み `session-init.sh`
- platform チェックスクリプト（`scripts/check-native-binaries.sh`）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- なし

### 3.2 依存タスク

- なし

### 3.3 必要な知識

- git worktree の node_modules 共有メカニズム
- esbuild の platform-specific パッケージ構造（`@esbuild/darwin-x64` 等）
- Claude Code Hooks（SessionStart）

### 3.4 推奨アプローチ

```bash
# check-native-binaries.sh の骨格
#!/bin/bash
EXPECTED_PLATFORM="$(node -e "console.log(process.platform + '-' + process.arch)")"
ESBUILD_PKG="node_modules/@esbuild/${EXPECTED_PLATFORM}"

if [ ! -d "$ESBUILD_PKG" ]; then
  echo "⚠️ esbuild platform mismatch: expected $EXPECTED_PLATFORM"
  echo "Fix: pnpm install --force"
fi
```

---

## 4. 苦戦箇所と解決のヒント

### 4.1 TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001 での苦戦

| 課題                            | 原因                                              | 解決のヒント                                               |
| ------------------------------- | ------------------------------------------------- | ---------------------------------------------------------- |
| esbuild darwin-arm64/x64 不整合 | worktreeがmain repoのnode_modulesを共有           | platform検出スクリプトで事前チェック                       |
| pnpm install --force 失敗       | lucide-react ENOTEMPTY + better-sqlite3 gyp error | node_modules削除→再インストール、またはmain repoからコピー |
| テスト実行不可                  | ネイティブバイナリ不整合で vitest が起動しない    | main repoでテスト実行し結果をworktreeに反映                |

### 4.2 参照すべき仕様書

| 仕様書                 | 内容                                                            |
| ---------------------- | --------------------------------------------------------------- |
| `06-known-pitfalls.md` | P7（ネイティブモジュール不一致）、P48（worktreeバイナリ不整合） |
| `lessons-learned.md`   | TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001 苦戦箇所1            |
| `CLAUDE.md`            | Hooks設定（session-init.sh）                                    |

---

## 5. 受入基準

- [ ] worktree環境でセッション開始時にplatform整合性チェックが実行される
- [ ] 不整合時に修復手順が表示される
- [ ] 正常環境では追加の出力なし（ノイズ回避）
- [ ] テスト: darwin-arm64/x64 両方でチェックが正しく動作
