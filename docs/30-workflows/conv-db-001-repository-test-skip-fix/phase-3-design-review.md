# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 3                                    |
| 機能名 | conv-db-001-repository-test-skip-fix |
| 作成日 | 2026-03-22                           |

## 目的

Phase 1-2 の要件定義・設計の妥当性を多角的に検証し、Phase 4 以降に進めるかを判定する。

## 実行タスク

- 要件レビュー: Phase 1 の要件と受け入れ基準の妥当性を確認
- 設計レビュー: Phase 2 のリビルド戦略と postinstall 設計の妥当性を確認
- リスクレビュー: 見落としているリスクがないかを確認

## 参照資料

| 資料名            | パス                                                                                | 説明                       |
| ----------------- | ----------------------------------------------------------------------------------- | -------------------------- |
| Phase 1 要件定義  | `docs/30-workflows/conv-db-001-repository-test-skip-fix/phase-1-requirements.md`    | 要件・受け入れ基準         |
| Phase 2 設計      | `docs/30-workflows/conv-db-001-repository-test-skip-fix/phase-2-design.md`          | 設計書                     |
| P7 既知の落とし穴 | `.claude/rules/06-known-pitfalls.md#P7`                                             | P7パターン参照             |
| DB実装コア仕様    | `.claude/skills/aiworkflow-requirements/references/database-implementation-core.md` | SQLite/better-sqlite3 設計 |
| IPC永続化アーキ   | `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md`         | ConversationRepository構成 |

## 実行手順

### ステップ1: 要件レビュー

#### チェック項目

| #   | チェック項目                     | 結果 | 備考                                                                |
| --- | -------------------------------- | ---- | ------------------------------------------------------------------- |
| R1  | 根本原因が正しく特定されているか | PASS | `.node` バイナリ不在 → require 失敗 → BetterSqlite3Ctor=null → skip |
| R2  | 受け入れ基準が検証可能か         | PASS | AC-1〜AC-4 全て具体的なコマンドで検証可能                           |
| R3  | スコープが適切に絞られているか   | PASS | テストコード変更なし、リビルドのみ                                  |
| R4  | 非機能要件が妥当か               | PASS | CI互換性、クロスプラットフォーム対応                                |

### ステップ2: 設計レビュー

#### チェック項目

| #   | チェック項目                                      | 結果 | 備考                                                    |
| --- | ------------------------------------------------- | ---- | ------------------------------------------------------- |
| D1  | リビルド戦略のフォールバックが定義されているか    | PASS | 方法A → 方法C の2段構え                                 |
| D2  | テスト環境と本番環境の ABI 差異が考慮されているか | PASS | Node.js ABI（テスト）vs Electron ABI（本番）を分離      |
| D3  | postinstall の追加が副作用を起こさないか          | PASS | 任意とし、明示的な rebuild スクリプトを代替案として設計 |
| D4  | 影響範囲分析が十分か                              | PASS | 変更対象・非変更対象ファイルが明示されている            |
| D5  | describeIfBetterSqlite3 の期待フローが正しいか    | PASS | L19-37 のコードと一致                                   |

### ステップ3: リスクレビュー

#### チェック項目

| #   | チェック項目                                      | 結果  | 備考                                                              |
| --- | ------------------------------------------------- | ----- | ----------------------------------------------------------------- |
| K1  | P7 パターンの対策が含まれているか                 | PASS  | `pnpm store prune && pnpm install --force` で対処                 |
| K2  | P9 パターン（テスト間 DB リーク）のリスクがあるか | PASS  | テストは `:memory:` DB + beforeEach/afterEach でリセット済み      |
| K3  | worktree 環境での pnpm install の影響             | MINOR | worktree は main と node_modules を共有する場合がある。確認が必要 |
| K4  | CI 環境でのリビルド対応                           | INFO  | 現時点のスコープ外（別タスクで対応）                              |

### レビュー判定

| 判定基準       | 結果        |
| -------------- | ----------- |
| 要件レビュー   | PASS        |
| 設計レビュー   | PASS        |
| リスクレビュー | MINOR（K3） |

#### K3 への対応

worktree 環境では `node_modules` がシンボリックリンクで共有される場合がある。リビルド前に以下を確認する:

```bash
# worktree の node_modules が独立しているか確認
ls -la apps/desktop/node_modules
# シンボリックリンクでない場合: 独立 → リビルドは worktree 内で完結
# シンボリックリンクの場合: 共有 → メインリポジトリにも影響
```

**対処**: Phase 5 実装時に確認し、シンボリックリンクの場合はメインリポジトリで実行する。

### 最終判定

**PASS（MINOR指摘あり → Phase 4 へ進行可能）**

MINOR 指摘（K3）は Phase 5 実装時に確認・対処する。設計変更は不要。

## 統合テスト連携

設計レビューフェーズのため、統合テストの実行は不要。

## 成果物

| 成果物           | パス                                                                              | 説明           |
| ---------------- | --------------------------------------------------------------------------------- | -------------- |
| 設計レビュー結果 | `docs/30-workflows/conv-db-001-repository-test-skip-fix/phase-3-design-review.md` | 本ドキュメント |

## 完了条件

- [ ] 要件レビューが完了し、全項目 PASS
- [ ] 設計レビューが完了し、全項目 PASS
- [ ] リスクレビューが完了し、MINOR 指摘の対処方針が決定している
- [ ] 最終判定が PASS（MINOR含む）で Phase 4 進行可能
- [ ] 本Phase内の全タスクを100%実行完了

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断               | 仕様参照先                                                 |
| -------------- | ---------------------- | ---------------------------------------------------------- |
| データ整合性   | DB操作テストの回復     | `aiworkflow-requirements: database-implementation-core.md` |
| アーキテクチャ | 設計レビューの判定基準 | `aiworkflow-requirements: architecture-monorepo.md`        |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 要件レビューの実施
2. 設計レビューの実施
3. リスクレビューの実施
4. 最終判定の記録
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/conv-db-001-repository-test-skip-fix --phase 3
```

## 次のPhase

Phase 4: テストコード静的確認
