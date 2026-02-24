# Phase 9: 品質保証 - UT-FIX-TS-VITEST-TSCONFIG-PATHS-001

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 9                                   |
| 機能名     | vitest-tsconfig-paths-sync          |
| 作成日     | 2026-02-24                          |
| タスク ID  | UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 |
| Issue      | #875                                |
| 前提 Phase | Phase 8（リファクタリング）完了済み |

## 目的

Phase 8 でリファクタリングを完了したコードに対して、Lint・型チェック・全テスト実行・セキュリティ確認の 4 つの品質ゲートを通過させる。本 Phase で検出されたエラーは全て修正し、Phase 10（最終レビュー）に進む品質水準を満たすことを保証する。

## 実行タスク

- タスク一覧: 以下のTask 1以降を順に実行し、各成果物を生成する。

| #   | タスク名                       | 概要                                                         |
| --- | ------------------------------ | ------------------------------------------------------------ |
| T1  | ESLint 実行（エラー 0 件確認） | 本体スクリプトとテストファイルの Lint チェック               |
| T2  | Prettier フォーマット確認      | コードフォーマットの統一性確認                               |
| T3  | TypeScript 型チェック実行      | `pnpm typecheck` で型エラー 0 件を確認する                   |
| T4  | 全テスト実行（実測件数ベース） | 本タスクの関連テストと既存テストスイートの全 PASS を確認する |
| T5  | セキュリティ確認               | スクリプトがファイル読み取り専用であることを確認する         |
| T6  | CI ジョブ整合性確認            | `check-module-sync` ジョブの設定が正しいことを確認する       |
| T7  | 品質レポート作成               | 全ゲートの結果を記録する                                     |

## 参照資料

| 資料名                   | パス                                                                        |
| ------------------------ | --------------------------------------------------------------------------- |
| 実装サマリー             | `outputs/phase-5/implementation-summary.md`                                 |
| リファクタリングレポート | `outputs/phase-8/refactoring-report.md`                                     |
| 本体スクリプト           | `scripts/check-shared-module-sync.ts`                                       |
| テストファイル           | `scripts/__tests__/check-shared-module-sync.test.ts`                        |
| 拡張テスト               | `scripts/__tests__/check-shared-module-sync-extended.test.ts`               |
| プラグインテスト         | `scripts/__tests__/vitest-tsconfig-paths-plugin.test.ts`                    |
| CI ワークフロー          | `.github/workflows/ci.yml`（220-244 行）                                    |
| コード品質ルール         | `.claude/rules/02-code-quality.md`                                          |
| セキュリティルール       | `.claude/rules/04-electron-security.md`                                     |
| 品質要件仕様             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` |
| エラーハンドリング仕様   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`       |
| CI/CD仕様                | `.claude/skills/aiworkflow-requirements/references/technology-devops.md`    |

## 実行手順

### Step 1: ESLint 実行（T1）

1. 本体スクリプトに対して ESLint を実行する
   ```bash
   pnpm eslint scripts/check-shared-module-sync.ts
   ```
2. テストファイルに対して ESLint を実行する
   ```bash
   pnpm eslint scripts/__tests__/check-shared-module-sync.test.ts scripts/__tests__/check-shared-module-sync-extended.test.ts scripts/__tests__/vitest-tsconfig-paths-plugin.test.ts
   ```
3. **合格基準**: エラー 0 件、警告 0 件
4. エラーまたは警告がある場合は修正し、再実行して 0 件を確認する

### Step 2: Prettier フォーマット確認（T2）

1. フォーマットチェックを実行する
   ```bash
   pnpm prettier --check scripts/check-shared-module-sync.ts scripts/__tests__/check-shared-module-sync.test.ts scripts/__tests__/check-shared-module-sync-extended.test.ts scripts/__tests__/vitest-tsconfig-paths-plugin.test.ts
   ```
2. **合格基準**: `All matched files use Prettier code style!` が出力される
3. フォーマット違反がある場合は修正する
   ```bash
   pnpm prettier --write scripts/check-shared-module-sync.ts scripts/__tests__/check-shared-module-sync.test.ts scripts/__tests__/check-shared-module-sync-extended.test.ts scripts/__tests__/vitest-tsconfig-paths-plugin.test.ts
   ```

### Step 3: TypeScript 型チェック実行（T3）

1. プロジェクト全体の型チェックを実行する
   ```bash
   pnpm typecheck
   ```
2. **合格基準**: 型エラー 0 件
3. 本タスクのファイルに起因する型エラーがある場合は修正する
4. 本タスクと無関係な既存型エラーがある場合は、エラー内容を品質レポートに記録し、未タスク化を検討する

### Step 4: 全テスト実行（T4）

#### 4-1: 本タスクのテスト実行

1. `scripts/__tests__/` 配下の関連テストを実行する
   ```bash
   pnpm vitest run scripts/__tests__/
   ```
2. **合格基準**: 実測件数ベースで全 PASS、失敗 0 件

#### 4-2: 既存テストスイートの回帰確認

1. プロジェクト全体のテストを実行する
   ```bash
   pnpm vitest run
   ```
2. **合格基準**: 本タスクの変更により既存テストが失敗していないこと
3. 既存テストの失敗がある場合は、本タスクの変更に起因するか分析する
   - 本タスクに起因する場合: 修正して再実行する
   - 本タスクに無関係な場合: 品質レポートに記録する

#### 4-3: CI 環境での実行確認

1. `check-module-sync` スクリプトを手動実行する
   ```bash
   pnpm check:module-sync
   ```
2. **合格基準**: 全チェック PASS（`ALL CHECKS PASSED` が出力される）、exit code が 0

### Step 5: セキュリティ確認（T5）

`scripts/check-shared-module-sync.ts` が以下のセキュリティ要件を満たすことを確認する：

| #   | 確認項目                              | 確認方法                                                             | 合格基準                 |
| --- | ------------------------------------- | -------------------------------------------------------------------- | ------------------------ |
| S1  | ファイル書き込みがないこと            | スクリプト内で `writeFileSync`、`writeFile`、`appendFile` を検索する | 該当なし（0 件）         |
| S2  | 外部コマンド実行がないこと            | スクリプト内で `exec`、`spawn`、`execSync` を検索する                | 該当なし（0 件）         |
| S3  | ネットワークアクセスがないこと        | スクリプト内で `fetch`、`http`、`https`、`net` を検索する            | 該当なし（0 件）         |
| S4  | `process.exit()` を使用していないこと | `process.exit` を検索する（`process.exitCode` の代入は許可）         | `process.exit()` が 0 件 |
| S5  | パストラバーサル対策                  | ファイルパスが定数定義（`FILE_PATHS`）のみから参照されていること     | 動的パス構築がないこと   |

### Step 6: CI ジョブ整合性確認（T6）

`.github/workflows/ci.yml` の `check-module-sync` ジョブ（220-244 行）を確認する：

| #   | 確認項目                                   | 期待値                                           |
| --- | ------------------------------------------ | ------------------------------------------------ |
| J1  | ジョブ名                                   | `Module Sync Check`                              |
| J2  | 実行コマンド                               | `pnpm check:module-sync`                         |
| J3  | タイムアウト設定                           | `timeout-minutes: 2`                             |
| J4  | Node.js バージョン                         | `22`                                             |
| J5  | pnpm install コマンド                      | `pnpm install --frozen-lockfile`                 |
| J6  | スクリプトパスが実在するファイルと一致する | `scripts/check-shared-module-sync.ts` が存在する |

### Step 7: 品質レポート作成（T7）

以下の項目を `outputs/phase-9/quality-report.md` に記録する：

```markdown
# 品質レポート - Phase 9

## 品質ゲート結果サマリー

| ゲート         | 結果      | 詳細                 |
| -------------- | --------- | -------------------- |
| ESLint         | PASS/FAIL | エラー数、警告数     |
| Prettier       | PASS/FAIL | フォーマット違反件数 |
| TypeScript     | PASS/FAIL | 型エラー件数         |
| テスト（実測） | PASS/FAIL | PASS数/FAIL数/SKIP数 |
| 既存テスト回帰 | PASS/FAIL | 失敗件数と原因       |
| CI スクリプト  | PASS/FAIL | 全チェック結果       |
| セキュリティ   | PASS/FAIL | S1-S5 の個別結果     |
| CI ジョブ整合  | PASS/FAIL | J1-J6 の個別結果     |

## 詳細結果

（各ゲートの実行ログ抜粋を記載）

## 検出された問題と対応

（問題がある場合は修正内容を記載）
```

## 統合テスト連携

| 連携対象         | 実施内容                                                                  |
| ---------------- | ------------------------------------------------------------------------- |
| scripts テスト   | 実測件数 + 既存回帰の結果を品質ゲートに集約し、Phase 10 の入力にする      |
| CI 実行連携      | ローカル実行結果と `check-module-sync` ジョブ条件の同値性を検証する       |
| ドキュメント連携 | 品質ゲート結果を `outputs/phase-9/quality-report.md` に構造化して引き継ぐ |

## 多角的チェック観点

| #   | 観点         | 確認内容                                                                      |
| --- | ------------ | ----------------------------------------------------------------------------- |
| C1  | 機能検証     | Phase 1 の全要件（同期漏れ検知 CLI、CI 自動検証、運用手順）が満たされているか |
| C2  | コード品質   | ESLint 0 エラー、Prettier 準拠、TypeScript 0 型エラー                         |
| C3  | テスト網羅性 | 実測テスト全 PASS、カバレッジ基準（Phase 7 レポートの値）を維持               |
| C4  | セキュリティ | スクリプトが読み取り専用（S1-S5 全項目合格）                                  |
| C5  | CI 整合性    | `check-module-sync` ジョブの設定が正しく、実行可能である                      |
| C6  | 後方互換性   | 既存テストスイートに回帰がないこと                                            |
| C7  | 実行可能性   | `pnpm check:module-sync` が正常終了すること                                   |

## 成果物

| 成果物       | パス                                | 形式     |
| ------------ | ----------------------------------- | -------- |
| 品質レポート | `outputs/phase-9/quality-report.md` | Markdown |

## 完了条件

- [ ] `pnpm eslint scripts/check-shared-module-sync.ts` と関連テスト3ファイルが 0 エラー 0 警告である
- [ ] `pnpm prettier --check` が全ファイルで合格である
- [ ] `pnpm typecheck` が 0 型エラーである（本タスク起因のエラーが 0 件）
- [ ] 本タスクの関連テスト（実測件数ベース）が全 PASS である
- [ ] 既存テストスイートに本タスク起因の回帰がないこと
- [ ] `pnpm check:module-sync` が正常終了し `ALL CHECKS PASSED` を出力する
- [ ] セキュリティ確認（S1-S5）が全項目合格である
- [ ] CI ジョブ整合性確認（J1-J6）が全項目合格である
- [ ] `outputs/phase-9/quality-report.md` が作成され、全ゲート結果が記載されている

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/vitest-tsconfig-paths-sync --phase 9
```

## 次のPhase

**Phase 10: 最終レビューゲート** — 多角的品質・整合性検証を実施し、PASS/MINOR/MAJOR/CRITICAL の判定を行う。
