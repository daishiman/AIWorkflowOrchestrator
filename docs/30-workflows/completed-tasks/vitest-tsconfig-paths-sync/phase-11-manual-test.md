# Phase 11: 手動テスト検証 - UT-FIX-TS-VITEST-TSCONFIG-PATHS-001

## メタ情報

| 項目      | 内容                                |
| --------- | ----------------------------------- |
| Phase     | 11                                  |
| 機能名    | vitest-tsconfig-paths-sync          |
| 作成日    | 2026-02-24                          |
| タスクID  | UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 |
| 関連Issue | #875                                |
| 前Phase   | Phase 10（最終レビュー報告書）      |

## 目的

自動テストでは検証困難な操作性・統合動作・CI連携を手動で確認し、実運用環境での品質を担保する。具体的には以下の観点を検証する:

1. `pnpm check:module-sync` コマンドの不整合検出精度
2. 全エントリ同期済み状態での正常動作
3. vitest-tsconfig-paths プラグインによるalias自動解決（該当する場合）
4. 既存テストスイートへの影響がないこと
5. CIジョブの正常動作

## 実行タスク

- タスク一覧: 以下のTask 1以降を順に実行し、各成果物を生成する。

### Task 1: 手動テストシナリオの定義と実行

以下の5つのシナリオを手動で実行し、結果を記録する。

#### シナリオ1: 不整合検出テスト（exports追加時）

- **操作手順**:
  1. `packages/shared/package.json` の `exports` フィールドに新しいサブパスエントリを追加する（例: `"./test-dummy": { "import": "./src/test-dummy/index.ts" }`）
  2. `tsconfig.json` の `paths` は更新しない（意図的な不整合状態を作る）
  3. `pnpm check:module-sync` を実行する
- **期待結果**: 不整合が検出され、エラーメッセージに `exports` と `paths` の差分が表示される
- **確認ポイント**: エラーメッセージに追加したサブパス名（`test-dummy`）が含まれている
- **後処理**: 追加したエントリを削除して元に戻す

#### シナリオ2: 全エントリ同期状態の正常確認

- **操作手順**:
  1. 現在のコードベースで `pnpm check:module-sync` を実行する
  2. `exports` / `paths` / `alias` / `typesVersions` が全て同期済みであることを確認する
- **期待結果**: コマンドが正常終了（exit code 0）し、全チェックがPASSと表示される
- **確認ポイント**: 5つの双方向チェック関数が全てPASSしている

#### シナリオ3: vitest-tsconfig-paths プラグイン動作確認

- **前提条件**: vitest-tsconfig-paths プラグインが `vitest.config.ts` に導入済みであること
- **操作手順**:
  1. `apps/desktop/vitest.config.ts` で手動定義のalias（`@repo/shared` 関連）をコメントアウトする
  2. `cd apps/desktop && pnpm vitest run --reporter=verbose` を実行する
  3. `@repo/shared` を import しているテストが正常にPASSすることを確認する
- **期待結果**: vitest-tsconfig-paths プラグインが tsconfig の paths を自動解決し、テストが全てPASSする
- **確認ポイント**: `@repo/shared/*` パスの import が全て正常に解決されている
- **後処理**: コメントアウトしたaliasを元に戻す
- **補足**: vitest-tsconfig-paths プラグインが未導入の場合、このシナリオはスキップとし、スキップ理由を記録する

#### シナリオ4: 既存テストスイートの全PASS確認

- **操作手順**:
  1. プロジェクトルートで `pnpm vitest run` を実行する
  2. `apps/desktop` ディレクトリで `cd apps/desktop && pnpm vitest run` を実行する
  3. `packages/shared` ディレクトリで `cd packages/shared && pnpm vitest run` を実行する
- **期待結果**: 全パッケージでテストが全てPASSする（失敗0件）
- **確認ポイント**: 今回の変更によるテスト回帰がないこと

#### シナリオ5: CI `check-module-sync` ジョブ動作確認

- **操作手順**:
  1. 作業ブランチをリモートにpushする
  2. GitHub Actions のワークフロー実行画面で `check-module-sync` ジョブの状態を確認する
  3. ジョブのログ出力を確認する
- **期待結果**: `check-module-sync` ジョブが正常完了（緑チェック）する
- **確認ポイント**:
  - ジョブがタイムアウトしていないこと
  - `scripts/check-shared-module-sync.ts` が正常に実行されていること
  - エラーログが出力されていないこと

#### シナリオ6: pnpm スクリプト登録確認

- **操作手順**:
  1. `pnpm check:module-sync --help`（またはドライラン）でコマンドが認識されることを確認する
  2. プロジェクトルートの `package.json` に `check:module-sync` スクリプトが登録されていることを確認する
- **期待結果**: スクリプトが正常に認識され、実行可能である
- **確認ポイント**: スクリプトパスが `scripts/check-shared-module-sync.ts` を指している

## 参照資料

| 資料名                          | パス                                         |
| ------------------------------- | -------------------------------------------- |
| 設計書                          | `outputs/phase-2/design-document.md`         |
| 実装サマリー                    | `outputs/phase-5/implementation-summary.md`  |
| テスト拡充報告書                | `outputs/phase-6/test-enhancement-report.md` |
| カバレッジ報告書                | `outputs/phase-7/coverage-report.md`         |
| リファクタリング報告書          | `outputs/phase-8/refactoring-report.md`      |
| 品質報告書                      | `outputs/phase-9/quality-report.md`          |
| 最終レビュー報告書              | `outputs/phase-10/final-review-report.md`    |
| チェックスクリプト              | `scripts/check-shared-module-sync.ts`        |
| P40: テスト実行ディレクトリ依存 | `.claude/rules/06-known-pitfalls.md#P40`     |

## 実行手順

1. シナリオ1〜6の順番で手動テストを実行する
2. 各シナリオの実行結果を「PASS / FAIL / SKIP」で記録する
3. FAILの場合は原因分析と対処方針を記録する
4. SKIPの場合はスキップ理由を記録する
5. 全シナリオの結果を `outputs/phase-11/manual-test-report.md` に集約する

## 統合テスト連携

| 連携対象         | 実施内容                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------ |
| 自動テスト連携   | Phase 9 までの自動テスト結果を前提に、手動でのみ検証可能な運用フローを補完する             |
| CI 連携          | `check-module-sync` ジョブの実行ログを確認し、ローカル手動確認と CI 結果の一貫性を確認する |
| 未タスク検出連携 | FAIL/SKIP や運用上の改善提案を Phase 12 Task 4 の未タスク検出ソースに引き継ぐ              |

## 多角的チェック観点

| 観点                | 適用判断 | 仕様参照先                                                                    |
| ------------------- | -------- | ----------------------------------------------------------------------------- |
| 品質/テスタビリティ | 必須     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   |
| CI/CD               | 必須     | `.claude/skills/aiworkflow-requirements/references/technology-devops.md`      |
| エラーハンドリング  | 条件付き | `.claude/skills/aiworkflow-requirements/references/error-handling.md`         |
| 運用保守性          | 必須     | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` |

## 成果物

| 成果物名         | パス                                     |
| ---------------- | ---------------------------------------- |
| 手動テスト報告書 | `outputs/phase-11/manual-test-report.md` |

### 手動テスト報告書の必須セクション

```markdown
# 手動テスト報告書

## 実行環境

- OS:
- Node.js:
- pnpm:
- 実行日時:

## テスト結果サマリー

| シナリオ | 結果 | 備考 |
| -------- | ---- | ---- |

## 各シナリオ詳細結果

### シナリオ1: ...

- 結果: PASS / FAIL / SKIP
- 実行コマンド:
- 出力（抜粋）:
- 備考:

## 総合判定

- PASS / FAIL
- 判定理由:
```

## 完了条件

- [ ] 手動テストシナリオが6件定義されている
- [ ] 各シナリオの期待結果が具体的に記述されている
- [ ] 全シナリオの実行結果が PASS / FAIL / SKIP で記録されている
- [ ] FAILシナリオがある場合、原因分析と対処方針が記録されている
- [ ] SKIPシナリオがある場合、スキップ理由が記録されている
- [ ] テスト結果が `outputs/phase-11/manual-test-report.md` に記録されている
- [ ] 既存テストスイートに回帰がないことが確認されている

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/vitest-tsconfig-paths-sync --phase 11
```

## 次のPhase

Phase 12（ドキュメント更新）へ進む。Phase 11の手動テスト結果は、Phase 12 Task 4（未タスク検出）の検出ソースとして使用される。
