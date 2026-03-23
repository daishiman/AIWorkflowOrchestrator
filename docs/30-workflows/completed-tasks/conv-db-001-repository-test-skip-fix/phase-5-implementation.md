# Phase 5: 実装

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 5                                    |
| 機能名 | conv-db-001-repository-test-skip-fix |
| 作成日 | 2026-03-22                           |

## 目的

better-sqlite3 のネイティブバイナリをリビルドし、75件テストを全て PASS 状態にする。必要に応じて `package.json` にリビルド用スクリプトを追加する。

## 実行タスク

- 環境確認: worktree の node_modules 構成を確認（K3 対応）
- ネイティブバイナリリビルド: 方法D（pnpm rebuild）を第1候補として実行
- フォールバック: 方法D 失敗時は方法A → 方法C の順にフォールバック
- テスト実行: 75件テストが PASS することを確認
- スクリプト追加（任意）: `rebuild:native` スクリプトを package.json に追加

## 参照資料

| 資料名                       | パス                                                                                  | 説明                       |
| ---------------------------- | ------------------------------------------------------------------------------------- | -------------------------- |
| Phase 2 設計                 | `docs/30-workflows/conv-db-001-repository-test-skip-fix/phase-2-design.md`            | リビルド戦略               |
| Phase 3 レビュー             | `docs/30-workflows/conv-db-001-repository-test-skip-fix/phase-3-design-review.md`     | K3 MINOR 指摘              |
| Phase 4 テストコード静的確認 | `docs/30-workflows/conv-db-001-repository-test-skip-fix/phase-4-test-verification.md` | テスト構造確認結果         |
| P7 既知の落とし穴            | `.claude/rules/06-known-pitfalls.md#P7`                                               | ネイティブモジュールABI    |
| DB実装コア仕様               | `.claude/skills/aiworkflow-requirements/references/database-implementation-core.md`   | SQLite/better-sqlite3 設計 |

## 実行手順

### ステップ1: worktree 環境の確認（K3 対応）

```bash
# worktree の node_modules がシンボリックリンクか確認
ls -la apps/desktop/node_modules

# pnpm の workspace 構成を確認
cat pnpm-workspace.yaml
```

判断基準:

- シンボリックリンクでない場合 → worktree 内でリビルド可能
- シンボリックリンクの場合 → メインリポジトリでリビルドが必要

### ステップ1.5: outputs ディレクトリの準備

成果物格納先のディレクトリを作成する。

```bash
mkdir -p docs/30-workflows/conv-db-001-repository-test-skip-fix/outputs/phase-5
mkdir -p docs/30-workflows/conv-db-001-repository-test-skip-fix/outputs/phase-6
```

### ステップ1.8: 方法D - pnpm rebuild（第1候補）

Phase 2 設計で選定された第1候補を実行する。

```bash
cd apps/desktop
pnpm rebuild better-sqlite3

# リビルド結果の確認
find node_modules/better-sqlite3/build -name "*.node"
# 期待値: better_sqlite3.node が見つかる

# ロードテスト
node -e "const s = require('better-sqlite3'); const db = new s(':memory:'); db.close(); console.log('OK')"
# 期待値: OK
```

方法D が成功した場合、ステップ2-3 をスキップしてステップ4（テスト実行）に進む。

### ステップ2: 方法A - pnpm store prune + force install（方法D失敗時のフォールバック）

```bash
# Step 1: pnpm ストアのキャッシュをクリア
pnpm store prune

# Step 2: 強制再インストール（ネイティブバイナリをリビルド）
pnpm install --force

# Step 3: リビルド結果の確認
find apps/desktop/node_modules/better-sqlite3/build -name "*.node"
# 期待値: better_sqlite3.node が見つかる

# Step 4: ロードテスト
cd apps/desktop && node -e "const s = require('better-sqlite3'); const db = new s(':memory:'); db.close(); console.log('OK')"
# 期待値: OK
```

### ステップ3: 方法C - フォールバック（方法A 失敗時のみ）

```bash
# 方法A が失敗した場合のみ実行
cd apps/desktop/node_modules/better-sqlite3
npx node-gyp rebuild

# リビルド結果の確認
find . -name "*.node"
# 期待値: better_sqlite3.node が見つかる
```

### ステップ4: テスト実行

```bash
# 75件テストの実行
cd apps/desktop && pnpm vitest run src/main/repositories/__tests__/conversationRepository.test.ts --reporter=verbose

# 期待する出力:
# Test Files  1 passed (1)
# Tests       75 passed (75)
```

#### トラブルシューティング

| 症状                                  | 原因                                           | 対策                                                                                                           |
| ------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `Cannot find module 'better-sqlite3'` | リビルド失敗                                   | 方法C にフォールバック                                                                                         |
| `NODE_MODULE_VERSION mismatch`        | ABI 不一致                                     | `pnpm install --force` を再実行                                                                                |
| `SQLITE_ERROR` 系エラー               | テストコードの問題                             | テスト個別調査（Phase 4 で確認済みのため想定外）                                                               |
| 一部テスト FAIL                       | DB 状態リーク（P9）                            | `beforeEach` リセットの確認                                                                                    |
| 方法D/A/C 全て失敗                    | ビルドツールチェーン欠如またはバージョン非互換 | XCode CLT 再インストール（`xcode-select --install`）/ better-sqlite3 バージョン確認 / 親タスクエスカレーション |

### ステップ5: スクリプト追加（任意）

Phase 2 設計に基づき、利便性のためにリビルド用スクリプトを追加:

```bash
# apps/desktop/package.json に追加するスクリプト
"rebuild:native": "cd node_modules/better-sqlite3 && npx node-gyp rebuild"
```

**注意**: このスクリプトの追加は任意。追加する場合は `package.json` の `scripts` セクションに追記する。

### ステップ6: 受け入れ基準の検証

| AC   | 検証コマンド                                                                                                     | 期待結果                  |
| ---- | ---------------------------------------------------------------------------------------------------------------- | ------------------------- |
| AC-1 | `find apps/desktop/node_modules/better-sqlite3/build -name "*.node"`                                             | ファイルが1つ以上見つかる |
| AC-2 | `cd apps/desktop && node -e "const s = require('better-sqlite3'); new s(':memory:').close(); console.log('OK')"` | `OK` 出力                 |
| AC-3 | `cd apps/desktop && pnpm vitest run src/main/repositories/__tests__/conversationRepository.test.ts`              | `75 passed (75)`          |
| AC-4 | Phase 6 で確認                                                                                                   | -                         |

## 統合テスト連携

- `conversationRepository.test.ts` の75件テスト実行で統合テストカバレッジを確保
- テストは実際の SQLite（`:memory:`）を使用するため、モックではなく実 DB 操作の検証

## 成果物

| 成果物           | パス                                                                                     | 説明               |
| ---------------- | ---------------------------------------------------------------------------------------- | ------------------ |
| リビルド実行記録 | `docs/30-workflows/conv-db-001-repository-test-skip-fix/outputs/phase-5/build-log.md`    | リビルド手順と結果 |
| テスト実行結果   | `docs/30-workflows/conv-db-001-repository-test-skip-fix/outputs/phase-5/test-results.md` | 75件PASS確認記録   |

## 完了条件

- [ ] better-sqlite3 のネイティブバイナリ（`.node`）が正しくビルドされている
- [ ] `require('better-sqlite3')` が成功する
- [ ] `describeIfBetterSqlite3` が `describe` に解決されている
- [ ] `conversationRepository.test.ts` の75件が全て PASS
- [ ] リビルド手順がドキュメント化されている
- [ ] 本Phase内の全タスクを100%実行完了

## 多角的チェック観点（AIが判断）

| 観点         | 適用判断          | 仕様参照先                                                 |
| ------------ | ----------------- | ---------------------------------------------------------- |
| データ整合性 | SQLite テスト回復 | `aiworkflow-requirements: database-implementation-core.md` |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. worktree 環境の確認（K3 対応）
2. outputs ディレクトリの準備
3. 方法D（pnpm rebuild）の実行
4. フォールバック実行（必要な場合のみ）
5. テスト実行と75件PASS確認
6. 受け入れ基準の検証（AC-1〜AC-3）
7. 成果物の作成・配置
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/conv-db-001-repository-test-skip-fix --phase 5
```

## 次のPhase

Phase 6: 回帰確認
