# [#1563] "[UT-CONV-DB-004] ネイティブモジュール環境自動整備"

## メタ情報

```yaml
task_id: UT-CONV-DB-004
task_name: ネイティブモジュール環境自動整備
category: 開発環境改善
target_feature: ビルド環境 / CI パイプライン
priority: MEDIUM
scale: Small (Phase 1-6簡易版)
status: unassigned
source_phase: Phase 6（UT-CONV-DB-001）
created_date: 2026-03-22
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-conv-db-004-native-module-rebuild-automation.md
```

| 項目       | 内容                    |
| ---------- | ----------------------- |
| 優先度     | MEDIUM                  |
| 規模       | Small (Phase 1-6簡易版) |
| ステータス | unassigned              |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-CONV-DB-001 で better-sqlite3 のネイティブバイナリが CPU アーキテクチャ不一致（arm64 vs x86_64）で 75 件テストが silent skip される問題を修正した。修正自体は `pnpm rebuild` で完了したが、以下の再発リスクが残っている。

### 1.2 問題点・課題

- **worktree 環境**: worktree 作成後に `pnpm rebuild` が自動実行されないため、ネイティブモジュールが正しいアーキテクチャでビルドされない
- **CI キャッシュ**: `pnpm` のキャッシュキーに `process.arch` が含まれていない場合、異なるアーキテクチャのバイナリが復元される可能性がある
- **esbuild 等の横展開**: better-sqlite3 だけでなく esbuild 等の他のネイティブモジュールも同じ問題が発生する（UT-CONV-DB-001 で実際に発生）

### 1.3 放置した場合の影響

- 次回の worktree 作成や CI 環境変更時に同じ問題が再発する
- テストが silent skip され、回帰テストが機能しない（テスト結果が「PASS」に見えるが実は未実行）
- 開発者がデバッグに時間を浪費する

### 苦戦箇所の教訓（UT-CONV-DB-001 より）

- **P66**: `file` コマンドで `.node` バイナリのアーキテクチャを確認する手順が初期診断に含まれておらず、根本原因の特定に時間がかかった
- **esbuild の追加リビルド**: better-sqlite3 のリビルド後に Vitest 実行で esbuild もアーキテクチャ不一致が判明。ネイティブモジュール全体の横展開チェックが必要だった
- **Phase 1 の初期診断精度**: ABI 不一致と推測したが実際は CPU アーキテクチャ不一致。診断手順に `uname -m` と `node -e "console.log(process.arch)"` を標準化すべき

## 2. 何を達成するか（What）

### 2.1 目的

worktree 作成時と CI 実行時にネイティブモジュールが正しいアーキテクチャで自動リビルドされる仕組みを構築する。

### 2.2 最終ゴール

- worktree 作成後に `pnpm rebuild` が自動実行される
- CI のキャッシュキーに `process.arch` が含まれる
- ネイティブモジュールのアーキテクチャ整合チェックが CI に組み込まれる

### 2.3 スコープ

含むもの:

- worktree セットアップスクリプト（`scripts/setup-worktree.sh`）の作成
- CI パイプライン（GitHub Actions）のキャッシュキー更新
- ネイティブモジュールのアーキテクチャ検証スクリプト

含まないもの:

- Node.js のアーキテクチャ移行（arm64 ネイティブへの統一）
- Electron ABI リビルドの完全自動化

### 2.4 成果物

- `scripts/setup-worktree.sh`
- GitHub Actions ワークフロー更新
- アーキテクチャ検証スクリプト
- リビルド手順ドキュメント

## 3. どのように実行するか（How）

### 3.1 前提条件

- Node.js v22 環境
- pnpm パッケージマネージャー
- GitHub Actions CI 環境

### 3.2 依存タスク

なし（独立実行可能）

### 3.3 推奨アプローチ

1. `scripts/setup-worktree.sh` を作成し、`pnpm --filter @repo/shared build && pnpm rebuild` を含める
2. GitHub Actions の `actions/cache` キーに `runner.arch` を追加
3. CI ステップに `find node_modules -name "*.node" -exec file {} \;` でアーキテクチャ検証を追加

## 4. 実行手順

簡易版 Phase 1-6 で実行。

### Phase 1: 現状確認

```bash
# プロジェクト内のネイティブモジュール一覧
find node_modules -name "*.node" -exec file {} \; 2>/dev/null | head -20

# GitHub Actions ワークフロー確認
ls .github/workflows/
```

### Phase 2: セットアップスクリプト作成

```bash
# scripts/setup-worktree.sh
#!/bin/bash
set -e
echo "Setting up worktree environment..."
pnpm --filter @repo/shared build
pnpm rebuild
echo "Worktree setup complete."
```

### Phase 3: CI キャッシュキー更新

GitHub Actions の `actions/cache` キーに `runner.arch` を追加する。

### Phase 4: テスト実行と確認

スクリプトの動作確認とテスト実行。

### Phase 5: ドキュメント化

リビルド手順と環境整備のドキュメントを作成。

### Phase 6: 回帰確認

既存の CI パイプラインに影響がないことを確認。

## 5. 完了条件チェックリスト

- [ ] `scripts/setup-worktree.sh` が作成されている
- [ ] CI キャッシュキーに `runner.arch` が含まれている
- [ ] ネイティブモジュールのアーキテクチャ検証が CI に組み込まれている
- [ ] 全テストが PASS すること

## 6. 検証方法

```bash
# worktree セットアップスクリプト実行
bash scripts/setup-worktree.sh

# アーキテクチャ検証
find node_modules -name "*.node" -exec file {} \; | grep -v "$(node -e 'console.log(process.arch === "x64" ? "x86_64" : process.arch)')"
# 期待値: 不一致なし（出力0行）
```

## 7. リスクと対策

| リスク                                     | 影響度 | 発生確率 | 対策                                       |
| ------------------------------------------ | ------ | -------- | ------------------------------------------ |
| セットアップスクリプトが他の環境で動かない | 中     | 中       | macOS/Linux 両対応のシェルスクリプトにする |
| CI キャッシュの無効化による実行時間増加    | 低     | 高       | キャッシュ戦略の段階的移行                 |
| Node.js アーキテクチャ変更時の対応         | 中     | 低       | アーキテクチャ検証スクリプトで自動検出     |

## 8. 参照情報

| 資料                 | パス                                                                             |
| -------------------- | -------------------------------------------------------------------------------- |
| P7 既知の落とし穴    | `.claude/rules/06-known-pitfalls.md#P7`                                          |
| P66 既知の落とし穴   | `.claude/rules/06-known-pitfalls.md#P66`                                         |
| 親タスク仕様         | `docs/30-workflows/conv-db-001-repository-test-skip-fix/index.md`                |
| 親タスク完了ファイル | `docs/30-workflows/completed-tasks/task-conv-db-001-repository-test-skip-fix.md` |

## 9. 備考

- 本タスクは UT-CONV-DB-001 の Phase 6（回帰確認）で検出された未タスク2件を統合
- P66（CPU アーキテクチャ不一致パターン）の再発防止が主目的
- worktree 環境での `@repo/shared` ビルド未実行問題の解決も含む
