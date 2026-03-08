# Worktree環境 @repo/shared ビルドプロトコル標準化 - タスク指示書

## メタ情報

```yaml
issue_number: 1061
```

## メタ情報

| 項目         | 内容                                                        |
| ------------ | ----------------------------------------------------------- |
| タスクID     | UT-IMP-WORKTREE-SHARED-BUILD-PROTOCOL-001                   |
| タスク名     | Worktree環境 @repo/shared ビルドプロトコル標準化            |
| 分類         | 改善                                                        |
| 対象機能     | 開発環境（git worktree + pnpm monorepo）                    |
| 優先度       | 中                                                          |
| 見積もり規模 | 小規模（1-2時間）                                           |
| ステータス   | 未実施                                                      |
| 発見元       | TASK-10A-E-D Phase 11（worktreeでdesktopアプリ起動不能）    |
| 発見日       | 2026-03-08                                                  |
| 依存         | UT-FIX-WORKTREE-NATIVE-BINARY-GUARD-001（既存の検出ガード） |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-10A-E-D Phase 11 で worktree 環境にて `@repo/desktop` を起動しようとした際、`@repo/shared` の解決エラーにより起動が失敗した。pnpm monorepo + git worktree の組み合わせでは、ワークスペース間の依存解決が `dist/` ディレクトリの存在を前提とするが、worktree 作成時にはこのディレクトリが存在しないか、メインリポジトリのものが参照されない。

### 1.2 問題点・課題

- `pnpm install` のみでは共有パッケージのビルド成果物が存在しない
- worktree はメインリポジトリの `node_modules` をシンボリックリンクで参照するが、`@repo/shared` のビルド成果物（`dist/`）は参照されない
- Phase 11 の screenshot 証跡取得が desktop アプリで不可能になり、backend で代替取得した
- 現在は手動で3ステップを実行する必要があるが、自動化されていない

### 1.3 放置した場合の影響

- worktree 作成のたびに `@repo/shared` ビルド忘れで起動失敗を繰り返す
- Phase 11 等の画面証跡取得がブロックされ、タスク完了が遅延する
- 開発者（および Claude Code エージェント）が同じ問題に何度も遭遇し、デバッグ時間を浪費する

---

## 2. 何を達成するか（What）

### 2.1 目的

worktree 環境での `@repo/shared` ビルド忘れを自動検出し、セッション開始時に警告または自動ビルドを実行することで、起動失敗を防止する。

### 2.2 最終ゴール

- `session-init.sh` が worktree 環境を検出し、`@repo/shared/dist/` の存在を検証
- `@repo/shared/dist/` 未存在時に自動ビルドまたは警告メッセージを出力
- worktree 作成から `@repo/desktop` 起動までの手順がドキュメント化

### 2.3 スコープ

#### 含むもの

- `session-init.sh`（Claude Code SessionStart Hook）に worktree 検出 + `@repo/shared` ビルドチェックを追加
- `.claude/hooks/` のドキュメントに worktree 初期化プロトコルを追記
- （オプション）`scripts/init-worktree.sh` スクリプトを新設

#### 含まないもの

- git worktree 自体の作成・管理の自動化
- `@repo/shared` 以外のパッケージのビルド自動化
- CI/CD パイプラインの変更

### 2.4 成果物

- 更新済み `session-init.sh`
- （オプション）新設 `scripts/init-worktree.sh`
- 更新済みドキュメント

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-FIX-WORKTREE-NATIVE-BINARY-GUARD-001 の検出ガードが実装済みであること
- `session-init.sh` が既に SessionStart Hook として動作していること

### 3.2 依存タスク

| タスクID                                | 内容                                  | ステータス |
| --------------------------------------- | ------------------------------------- | ---------- |
| UT-FIX-WORKTREE-NATIVE-BINARY-GUARD-001 | Worktree ネイティブバイナリ検出ガード | 未確認     |

### 3.3 必要な知識

- git worktree の動作原理（シンボリックリンク、`.git` ファイル）
- pnpm monorepo のワークスペース依存解決メカニズム
- Claude Code Hooks（SessionStart）の仕様

### 3.4 推奨アプローチ

1. `session-init.sh` で `git rev-parse --git-dir` の出力を確認し、worktree かを判定（worktree の場合 `.git` がファイルでありディレクトリではない）
2. worktree の場合、`packages/shared/dist/` の存在を確認
3. 存在しない場合、`pnpm --filter @repo/shared build` を自動実行するか、以下の警告メッセージを表示:

```
[WARNING] Worktree環境で @repo/shared のビルド成果物が見つかりません。
以下のコマンドを実行してください:
  pnpm --filter @repo/shared build
```

---

## 4. 実行手順

### Phase構成

小規模タスクのため Phase 4-5-9-12 の4フェーズ構成。

### Phase 4-5: テスト作成→実装

#### 目的

worktree 検出と `@repo/shared` ビルドチェックの自動化

#### 手順

1. `session-init.sh` の既存コードを確認
2. worktree 検出ロジックを追加（`git rev-parse --git-dir` + ファイル判定）
3. `packages/shared/dist/` 存在チェックを追加
4. 未存在時の警告メッセージまたは自動ビルド処理を追加
5. （オプション）`scripts/init-worktree.sh` を新設し、以下の3ステップを自動実行:
   ```bash
   pnpm install
   pnpm --filter @repo/shared build
   echo "Worktree初期化完了。pnpm --filter @repo/desktop dev で起動可能です。"
   ```

#### 成果物

修正済み `session-init.sh` + （オプション）`scripts/init-worktree.sh`

#### 完了条件

- worktree 環境で `session-init.sh` 実行時に `@repo/shared` ビルド状態が検証される
- `@repo/shared/dist/` 未存在時に警告または自動ビルドが実行される

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] worktree 環境で `session-init.sh` が `@repo/shared` ビルド状態を検証
- [ ] `@repo/shared/dist/` 未存在時に自動ビルドまたは警告を出力
- [ ] 非 worktree 環境では追加チェックが実行されない（既存動作に影響なし）

### 品質要件

- [ ] `session-init.sh` のシェルスクリプト構文エラーなし
- [ ] worktree / 非 worktree 両環境で動作確認

### ドキュメント要件

- [ ] worktree 作成から `@repo/desktop` 起動までの手順がドキュメント化
- [ ] lessons-learned.md に教訓追記

---

## 6. 検証方法

### テストケース

- worktree 環境 + `@repo/shared/dist/` 未存在 → 警告または自動ビルドが実行される
- worktree 環境 + `@repo/shared/dist/` 存在 → 追加アクションなし
- 非 worktree 環境 → worktree チェックがスキップされる

### 検証手順

```bash
# worktree を新規作成して検証
git worktree add .worktrees/test-worktree -b test/worktree-check
cd .worktrees/test-worktree

# dist/ が存在しない状態で session-init.sh を実行
bash .claude/hooks/session-init.sh

# 警告メッセージまたは自動ビルドを確認

# クリーンアップ
cd ../..
git worktree remove .worktrees/test-worktree
git branch -D test/worktree-check
```

---

## 7. リスクと対策

| リスク                                    | 影響度 | 発生確率 | 対策                                                         |
| ----------------------------------------- | ------ | -------- | ------------------------------------------------------------ |
| 自動ビルドが SessionStart の遅延を増加    | 中     | 高       | 警告メッセージのみをデフォルトとし、自動ビルドはオプション化 |
| worktree 検出ロジックの誤判定             | 低     | 低       | `git rev-parse --git-dir` の出力パターンを複数環境でテスト   |
| `@repo/shared` 以外にもビルドが必要な場合 | 中     | 中       | 将来的に対象パッケージリストを拡張可能な設計にする           |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` - 「Worktree での @repo/shared 解決エラー」セクション
- `.claude/skills/skill-creator/references/patterns.md` - 「Worktree環境初期化プロトコル」パターン
- `.claude/rules/06-known-pitfalls.md` - P7（ネイティブモジュールのバイナリ不一致）
- `docs/30-workflows/unassigned-task/task-fix-worktree-native-binary-guard-001.md` - 関連タスク

### 参考資料

- `.claude/hooks/session-init.sh` - 既存の SessionStart Hook
- `packages/shared/package.json` - `@repo/shared` ビルドスクリプト定義

---

## 9. 備考

### TASK-10A-E-D からの教訓（苦戦箇所）

- git worktree 作成後、`@repo/desktop` が `@repo/shared` の解決エラーにより起動失敗した
- `pnpm install` のみでは共有パッケージのビルド成果物が存在しない
- worktree はメインリポジトリの `node_modules` をシンボリックリンクで参照するが、`@repo/shared` のビルド成果物（`dist/`）は参照されない
- Phase 11 の screenshot 証跡取得が desktop アプリで不可能になり、backend で代替取得した
- 根本原因: pnpm monorepo + git worktree の組み合わせでは、ワークスペース間の依存解決が `dist/` ディレクトリの存在を前提とする

### 5分プロトコル（暫定手順）

```bash
cd .worktrees/<name>
pnpm install                        # Step 1: 依存解決
pnpm --filter @repo/shared build    # Step 2: 共有パッケージビルド
pnpm --filter @repo/desktop dev     # Step 3: 動作確認
```

### 補足事項

- 優先度「中」: worktree を使用するたびに発生する再現性の高い問題であり、自動検出により開発効率が改善される
- UT-FIX-WORKTREE-NATIVE-BINARY-GUARD-001 との関係: 既存タスクはネイティブバイナリの不一致検出に焦点を当てており、本タスクは `@repo/shared` ビルド成果物の存在チェックに焦点を当てている。両者を `session-init.sh` 内で統合的に実装することを推奨
