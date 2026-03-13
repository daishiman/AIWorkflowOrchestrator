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
issue_number: 1063
---

# worktree環境でのネイティブバイナリ不整合自動検出ガード - タスク指示書

## メタ情報

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| タスクID     | UT-FIX-WORKTREE-NATIVE-BINARY-GUARD-001                      |
| タスク名     | worktree環境でのネイティブバイナリ不整合を自動検出するガード |
| 分類         | 改善                                                         |
| 対象機能     | 開発環境（CI/セッション初期化）                              |
| 優先度       | 低                                                           |
| 見積もり規模 | 小規模（2-4時間）                                            |
| ステータス   | 未実施                                                       |
| 発見元       | TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001 Phase 11          |
| 発見日       | 2026-03-06                                                   |

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

## 4. 実行手順

### 4.1 実装方針

1. `session-init.sh` で worktree 実行を検出する。
2. `scripts/check-native-binaries.sh` を新設し、`process.platform + '-' + process.arch` から期待 platform を求める。
3. `@esbuild/<platform>` を最優先で確認し、必要に応じて `better-sqlite3` など主要 native dependency も追加検査する。
4. 不整合時は自動修復せず、再現条件と修復手順だけを標準出力へ示す。
5. `06-known-pitfalls.md` / `lessons-learned.md` / `CLAUDE.md` と同期し、同種障害の初動を短縮する。

### 4.2 推奨フェーズ

| フェーズ | 主作業                                   | 期待成果物                         |
| -------- | ---------------------------------------- | ---------------------------------- |
| Phase A  | worktree 判定条件の整理                  | 判定条件メモ                       |
| Phase B  | native dependency チェックスクリプト作成 | `scripts/check-native-binaries.sh` |
| Phase C  | `session-init.sh` への接続               | セッション開始時の警告出力         |
| Phase D  | docs / pitfalls / lessons 同期           | 再発防止ドキュメント               |

### 4.3 実装時の着眼点

- worktree 判定は `.git` や `git worktree list` の情報に依存しすぎず、セッション開始時に安定して取れる条件を使う
- native dependency の不整合検出は「足りない」だけでなく「別 platform が入っている」を判定できる形にする
- 修復手順は `pnpm install --force` だけに固定せず、main repo からのコピーや node_modules 再作成も補助手順として残す

---

## 5. 完了条件チェックリスト

- [ ] worktree環境でセッション開始時に platform 整合性チェックが実行される
- [ ] 不整合時に期待 platform と修復手順が表示される
- [ ] 正常環境では追加の出力なし（ノイズ回避）
- [ ] `esbuild` を含む主要 native dependency が検査対象に入っている
- [ ] 関連仕様書 / pitfalls / lessons が同期される

---

## 6. 検証方法

### 6.1 必須確認

| 観点            | 確認方法                                     | 期待結果                       |
| --------------- | -------------------------------------------- | ------------------------------ |
| worktree 検出   | worktree 上でセッション開始                  | guard が起動する               |
| platform 一致   | 正常な依存関係で実行                         | 余計な警告が出ない             |
| platform 不一致 | 対象 package を意図的に欠落/差し替えして実行 | 警告と修復手順が表示される     |
| docs 同期       | 関連仕様書の差分確認                         | 実装内容と苦戦箇所が反映される |

### 6.2 推奨コマンド例

```bash
node -e "console.log(process.platform + '-' + process.arch)"
pnpm install --force
pnpm --filter @repo/desktop test:run
```

> 実際の検証コマンドは実装時の配置に合わせて調整する。重要なのは「正常系」「不整合系」「静音性」の3観点を必ず分けて確認すること。

---

## 7. リスクと対策

### 7.1 実装時の主リスク

| リスク                   | 発生条件                                            | 対策                                                                      |
| ------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------- |
| 誤検知で毎回警告が出る   | worktree 判定や platform 判定が粗い                 | 期待 platform と実在 package の両方を比較し、正常系の静音確認を必須にする |
| 修復手順が現場で使えない | `pnpm install --force` だけで復旧できない環境がある | main repo からのコピー、node_modules 再作成など代替手順も併記する         |
| 検査対象が不足する       | `esbuild` 以外の native dependency が未監視         | `better-sqlite3` など再発実績のある package から優先追加する              |

### 7.2 既知の苦戦箇所と解決のヒント

| 課題                            | 原因                                                       | 解決のヒント                                                        |
| ------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------- |
| esbuild darwin-arm64/x64 不整合 | worktree が main repo の `node_modules` を共有             | platform 検出スクリプトで事前チェックする                           |
| `pnpm install --force` 失敗     | `lucide-react` ENOTEMPTY + `better-sqlite3` node-gyp error | `node_modules` 削除→再インストール、または main repo からコピーする |
| テスト実行不可                  | native dependency 不整合で vitest が起動しない             | main repo でテスト実行し、結果を worktree に反映する                |

---

## 8. 参照情報

| 仕様書 / 参照          | 内容                                                            |
| ---------------------- | --------------------------------------------------------------- |
| `06-known-pitfalls.md` | P7（ネイティブモジュール不一致）、P48（worktreeバイナリ不整合） |
| `lessons-learned.md`   | TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001 苦戦箇所1            |
| `CLAUDE.md`            | Hooks設定（`session-init.sh`）                                  |
| Issue `#1063`          | 本課題の起票元                                                  |

---

## 9. 備考

- 優先度は低だが、worktree 並列開発の初動ロスを減らす効果が大きい
- 自動修復まで含めると責務が肥大化するため、本タスクでは「検出 + 修復案内」に留める
- 実装時は current worktree だけでなく、main repo 側でも誤検知しないことを確認する
