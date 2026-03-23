# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 1                                    |
| 機能名 | conv-db-001-repository-test-skip-fix |
| 作成日 | 2026-03-22                           |

## 目的

`conversationRepository.test.ts` の75件テストがスキップされている根本原因を特定し、修正に必要な要件を明文化する。

## 実行タスク

- 原因分析: better-sqlite3 ネイティブバイナリのロード失敗原因を特定
- 環境調査: Node.js バージョンと better-sqlite3 の ABI 互換性を確認
- 要件抽出: 修正に必要な機能要件・非機能要件を定義
- 受け入れ基準作成: 各要件に対して検証可能な受け入れ基準を定義

## 参照資料

| 資料名            | パス                                                                                | 説明                            |
| ----------------- | ----------------------------------------------------------------------------------- | ------------------------------- |
| P7 既知の落とし穴 | `.claude/rules/06-known-pitfalls.md#P7`                                             | ネイティブモジュールのABI不一致 |
| P9 既知の落とし穴 | `.claude/rules/06-known-pitfalls.md#P9`                                             | テスト間のDB状態リーク          |
| DB 実装パターン   | `.claude/skills/aiworkflow-requirements/references/database-implementation-core.md` | DB層の設計パターン              |
| 元タスク指示書    | `docs/30-workflows/unassigned-task/task-conv-db-001-repository-test-skip-fix.md`    | 元の未タスク指示書              |

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料        | パス                                                                                | 内容                       |
| --------------- | ----------------------------------------------------------------------------------- | -------------------------- |
| DB実装コア仕様  | `.claude/skills/aiworkflow-requirements/references/database-implementation-core.md` | SQLite/better-sqlite3 設計 |
| IPC永続化アーキ | `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md`         | ConversationRepository構成 |

## 実行手順

### ステップ0: 事前診断（改善A/C）

リビルド戦略の選定前に、問題の正確な性質を診断する。

```bash
# Node.js ABI 番号の確認
node -e "console.log('ABI:', process.versions.modules)"

# better-sqlite3 のビルド成果物の状態確認
ls -la apps/desktop/node_modules/better-sqlite3/build/Release/

# ビルドエラーログの確認（存在する場合）
cat apps/desktop/node_modules/better-sqlite3/build/Release/*.log 2>/dev/null || echo "ビルドログなし"

# better-sqlite3 の Node.js 互換性確認
cd apps/desktop && node -e "const pkg = require('./node_modules/better-sqlite3/package.json'); console.log('Version:', pkg.version); console.log('Engines:', JSON.stringify(pkg.engines || 'undefined'))"

# プリビルドバイナリの存在確認
ls apps/desktop/node_modules/better-sqlite3/prebuilds/ 2>/dev/null || echo "prebuilds ディレクトリなし"
```

**診断結果の判断基準:**

| 状態                              | 診断                                      | 対策                                                |
| --------------------------------- | ----------------------------------------- | --------------------------------------------------- |
| `.deps`, `obj` あり、`.node` なし | ビルド途中失敗（リンカーエラー等）        | ビルドツールチェーン確認 → 方法D or C               |
| `build/Release/` が空             | ビルド未実行                              | `pnpm rebuild better-sqlite3`（方法D）              |
| `.node` あり、ロード失敗          | ABI 不一致（P7 典型）                     | `pnpm store prune && pnpm install --force`（方法A） |
| `prebuilds/` にバイナリあり       | プリビルドバイナリが Node.js v22 に非対応 | better-sqlite3 バージョンアップが必要               |

### ステップ1: P50チェック - 既実装状態の調査

better-sqlite3 の現在の状態を確認する。

```bash
# Node.js バージョン確認
node -v
# 期待値: v22.x.x

# better-sqlite3 パッケージバージョン確認
cd apps/desktop && pnpm list better-sqlite3
# 期待値: better-sqlite3 ^12.5.0

# ネイティブバイナリの存在確認
find apps/desktop/node_modules/better-sqlite3/build -name "*.node" 2>/dev/null
# 期待値: ファイルが見つからない（問題の核心）

# テスト実行して現状のスキップ状態を確認
cd apps/desktop && pnpm vitest run src/main/repositories/__tests__/conversationRepository.test.ts --reporter=verbose 2>&1 | head -30
# 期待値: 75 skipped
```

### ステップ2: 原因分析

スキップの直接原因を確認する。

```
テストファイル（L19-37）の条件ロジック:
1. createRequire(import.meta.url) で require 関数を作成
2. require("better-sqlite3") でネイティブモジュールをロード
3. new candidateCtor(":memory:") でプローブ（動作確認）
4. 成功 → BetterSqlite3Ctor = candidateCtor
5. 失敗 → BetterSqlite3Ctor = null
6. null の場合 → describeIfBetterSqlite3 = describe.skip → 75件全スキップ
```

**根本原因（Phase 1 時点の分析）**: better-sqlite3 の `.node` バイナリが Node.js v22 の ABI に合わせてビルドされていない。`build/Release/` ディレクトリにオブジェクトファイル（`.deps`, `obj`）は存在するが、最終的な `.node` バイナリが生成されていない。

> **Phase 5 での修正**: 実際の根本原因は ABI バージョン不一致ではなく、**CPU アーキテクチャ不一致**（arm64 vs x86_64）だった。`.node` バイナリは存在していたが arm64 でビルドされており、Rosetta 2 経由で x86_64 として動作する Node.js と不一致だった。P7 の変種として P66 に記録。詳細は `outputs/phase-5/build-log.md` を参照。

### ステップ3: 要件定義

#### 機能要件（FR）

| ID    | 要件                                                                      | 優先度 |
| ----- | ------------------------------------------------------------------------- | ------ |
| FR-01 | better-sqlite3 の `.node` バイナリが Node.js v22 向けにビルドされること   | 必須   |
| FR-02 | テストファイルの `describeIfBetterSqlite3` が `describe` に解決されること | 必須   |
| FR-03 | 75件のテストが全て PASS すること                                          | 必須   |
| FR-04 | postinstall スクリプトでリビルドが自動化されること（推奨）                | 推奨   |

#### 非機能要件（NFR）

| ID     | 要件                                                 | 優先度 |
| ------ | ---------------------------------------------------- | ------ |
| NFR-01 | 他の conversation 関連テスト（85件）に影響がないこと | 必須   |
| NFR-02 | CI 環境でもリビルドが正常動作すること                | 推奨   |
| NFR-03 | macOS / Linux 両環境で動作すること                   | 推奨   |

#### 受け入れ基準（AC）

| ID   | 基準                                                                                      | 検証方法                                      |
| ---- | ----------------------------------------------------------------------------------------- | --------------------------------------------- |
| AC-1 | `find apps/desktop/node_modules/better-sqlite3/build -name "*.node"` でファイルが見つかる | コマンド実行                                  |
| AC-2 | `node -e "require('better-sqlite3')"` が成功する                                          | コマンド実行（apps/desktop ディレクトリから） |
| AC-3 | テスト実行で `Tests: 75 passed (75)` が出力される                                         | `pnpm vitest run` 実行                        |
| AC-4 | 他のテストに回帰がないこと                                                                | `pnpm vitest run src/main/` でエラー増加なし  |

## 統合テスト連携

このPhaseではテスト実行は不要。Phase 4 以降でテスト実行を行う。

## 成果物

| 成果物     | パス                                                                             | 説明           |
| ---------- | -------------------------------------------------------------------------------- | -------------- |
| 要件定義書 | `docs/30-workflows/conv-db-001-repository-test-skip-fix/phase-1-requirements.md` | 本ドキュメント |

## 完了条件

- [ ] better-sqlite3 のロード失敗原因が特定されている
- [ ] Node.js v22 との ABI 不一致が根本原因であることが確認されている
- [ ] 機能要件・非機能要件・受け入れ基準が定義されている
- [ ] 本Phase内の全タスクを100%実行完了

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                 | 仕様参照先                                                 |
| -------------- | ------------------------ | ---------------------------------------------------------- |
| データ整合性   | DB操作テストの回復       | `aiworkflow-requirements: database-implementation-core.md` |
| アーキテクチャ | ネイティブモジュール管理 | `aiworkflow-requirements: architecture-monorepo.md`        |

**Electronデスクトップアプリ観点**:

| 層                 | 適用判断          | 仕様参照先                                                 |
| ------------------ | ----------------- | ---------------------------------------------------------- |
| ローカルストレージ | SQLite テスト回復 | `aiworkflow-requirements: database-implementation-core.md` |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 事前診断の実施（ステップ0）
2. 現状確認の実施（ステップ1）
3. 原因分析の実施（ステップ2）
4. 要件定義の実施（ステップ3）
5. 成果物の作成・配置
6. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/conv-db-001-repository-test-skip-fix --phase 1
```

## 次のPhase

Phase 2: 設計
