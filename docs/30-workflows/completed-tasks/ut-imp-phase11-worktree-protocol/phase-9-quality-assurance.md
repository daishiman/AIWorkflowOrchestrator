# Phase 9: 品質保証

## メタ情報

| 項目      | 値                                                           |
| --------- | ------------------------------------------------------------ |
| Phase     | 9                                                            |
| タスクID  | UT-IMP-PHASE11-WORKTREE-PROTOCOL-001                         |
| 機能名    | ut-imp-phase11-worktree-protocol（Worktree環境テスト標準化） |
| Issue     | #853                                                         |
| 作成日    | 2026-03-01                                                   |
| 前提Phase | Phase 8（リファクタリング）                                  |
| 次Phase   | Phase 10（最終レビューゲート）                               |

## 目的

定義された品質基準を全て満たすことを検証する。機能検証（全テスト PASS）、コード品質（Lint・型チェック PASS）、テスト網羅性（カバレッジ基準達成）、セキュリティ（validateIpcSender 検証の含有確認）、CI 安定性（GitHub Actions での E2E テストジョブ正常完了）の 5 観点から品質ゲートの通過可否を判定する。

## 背景

Phase 8 のリファクタリング完了後、品質ゲートとして Lint・型チェック・テスト安定性・カバレッジ・セキュリティ・CI 安定性の全基準を検証する。本タスクは E2E テストと CI/CD ワークフローを含むため、テストの安定性（flaky テスト排除）とセキュリティ検証（E2E テスト内での validateIpcSender 検証含有）を重点的に確認する。

## 品質ゲート一覧

| #   | 品質項目     | 基準                                              | 確認コマンド                                                       |
| --- | ------------ | ------------------------------------------------- | ------------------------------------------------------------------ |
| 1   | 機能検証     | 全自動テスト（ユニット + E2E）が PASS             | `cd apps/desktop && pnpm vitest run` / `pnpm playwright test e2e/` |
| 2   | コード品質   | ESLint エラー 0 件、TypeScript エラー 0 件        | `pnpm lint` / `pnpm typecheck`                                     |
| 3   | テスト網羅性 | Line 80%+, Branch 60%+, Function 80%+             | `cd apps/desktop && pnpm vitest run --coverage`                    |
| 4   | セキュリティ | E2E テストに validateIpcSender 検証が含まれている | `grep -rn "validateIpcSender" apps/desktop/e2e/`                   |
| 5   | CI 安定性    | GitHub Actions で E2E テストジョブが正常完了する  | GitHub Actions のワークフロー実行結果を確認                        |

## 実行タスク

### タスク1: 機能検証（全テスト PASS）

**目的**: ユニットテスト + E2E テストの全テストが PASS することを確認する。

**確認コマンド**:

```bash
# ユニットテスト実行（Worktree 環境でも実行可能）
cd apps/desktop && pnpm vitest run

# E2E テスト実行（メインリポジトリ環境のみ）
cd apps/desktop && pnpm playwright test e2e/
```

**結果テーブル**:

| テスト種別     | テスト数 | 成功数 | 失敗数 | 結果 |
| -------------- | -------- | ------ | ------ | ---- |
| ユニットテスト | -        | -      | -      | -    |
| E2E テスト     | -        | -      | -      | -    |

**期待される成果物**: `outputs/phase-9/quality-report.md`

### タスク2: コード品質（Lint + 型チェック）

**目的**: ESLint ルール違反が 0 件、TypeScript コンパイルエラーが 0 件であることを確認する。

**対象ファイル**:

- E2E テストファイル（`apps/desktop/e2e/**/*.ts`）
- E2E テストヘルパー（`apps/desktop/e2e/helpers/worktree-test-helpers.ts`）
- Worktree 環境判定ユーティリティ（`apps/desktop/src/main/utils/worktree-detector.ts`）
- deferred-tests パーサー（`apps/desktop/src/main/utils/deferred-tests-parser.ts`）
- Layer 分類判定（`apps/desktop/src/main/utils/test-layer-classifier.ts`）
- Playwright 設定ファイル（`apps/desktop/playwright.config.ts`）

**型チェック確認項目**:

- `any` 型の使用がないこと
- `@ts-ignore` / `@ts-expect-error` がないこと（使用時は理由コメント必須）
- Worktree 判定ユーティリティの戻り値型が明示的に定義されていること
- E2E テストヘルパーの引数型・戻り値型が明示的に定義されていること

**確認コマンド**:

```bash
# Lint 検証
pnpm lint

# 型チェック
pnpm typecheck

# any 型の使用確認
grep -rn ": any\b\|as any\b" apps/desktop/e2e/ apps/desktop/src/main/utils/worktree-detector.ts apps/desktop/src/main/utils/deferred-tests-parser.ts apps/desktop/src/main/utils/test-layer-classifier.ts --include="*.ts"
```

**期待される成果物**: `outputs/phase-9/quality-report.md`

### タスク3: テスト安定性検証（Flaky テスト排除）

**目的**: E2E テストが flaky（不安定）でないことを確認する。3 回連続実行して全回成功することを検証する。

**実行手順**:

1. E2E テストを 3 回連続実行する（メインリポジトリ環境で実施する）
2. 全回成功することを確認する
3. 1 回でも失敗した場合、失敗したテストケースを特定し、原因を調査する
4. タイミング依存・リソース依存のテストがある場合、リトライロジックまたは待機処理を追加する

**確認コマンド**:

```bash
# 3 回連続実行
cd apps/desktop && pnpm playwright test e2e/ && pnpm playwright test e2e/ && pnpm playwright test e2e/
```

**結果テーブル**:

| 実行回 | テスト数 | 成功数 | 失敗数 | 結果 |
| ------ | -------- | ------ | ------ | ---- |
| 1回目  | -        | -      | -      | -    |
| 2回目  | -        | -      | -      | -    |
| 3回目  | -        | -      | -      | -    |

**期待される成果物**: `outputs/phase-9/quality-report.md`

### タスク4: テスト網羅性（カバレッジ基準達成）

**目的**: Worktree 環境でも実行可能な Layer 1-2 テストが全て成功し、カバレッジ基準を達成していることを確認する。

**カバレッジ基準**:

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

**確認コマンド**:

```bash
# Worktree 環境判定ユーティリティのテスト（カバレッジ付き）
cd apps/desktop && pnpm vitest run src/main/utils/__tests__/worktree-detector.test.ts --coverage

# deferred-tests パーサーのテスト（カバレッジ付き）
cd apps/desktop && pnpm vitest run src/main/utils/__tests__/deferred-tests-parser.test.ts --coverage

# Layer 分類判定のテスト（カバレッジ付き）
cd apps/desktop && pnpm vitest run src/main/utils/__tests__/test-layer-classifier.test.ts --coverage

# デスクトップアプリの全ユニットテスト実行
cd apps/desktop && pnpm vitest run
```

**結果テーブル**:

| 対象ファイル             | Line | Branch | Function | 判定 |
| ------------------------ | ---- | ------ | -------- | ---- |
| worktree-detector.ts     | -    | -      | -        | -    |
| deferred-tests-parser.ts | -    | -      | -        | -    |
| test-layer-classifier.ts | -    | -      | -        | -    |

**期待される成果物**: `outputs/phase-9/quality-report.md`

### タスク5: セキュリティ検証

**目的**: E2E テストが Electron セキュリティ原則に準拠し、validateIpcSender によるチャンネルホワイトリスト検証が E2E テスト内に含まれていることを確認する。

**確認項目**:

| #   | チェック項目                                                                   | 結果 |
| --- | ------------------------------------------------------------------------------ | ---- |
| 1   | E2E テストが contextIsolation: true を無効化していない                         | -    |
| 2   | E2E テストが nodeIntegration: false を変更していない                           | -    |
| 3   | E2E テストが sandbox: true を無効化していない                                  | -    |
| 4   | E2E テスト内で validateIpcSender による送信元ウィンドウ検証が実施されている    | -    |
| 5   | E2E テストが IPC_CHANNELS ホワイトリストに登録されたチャンネルのみ使用している | -    |
| 6   | テスト用の認証情報（API キー、トークン）がハードコードされていない             | -    |
| 7   | テスト用の一時ファイルがテスト完了後にクリーンアップされる                     | -    |

**確認コマンド**:

```bash
# validateIpcSender 検証の含有確認
grep -rn "validateIpcSender\|contextIsolation\|nodeIntegration\|sandbox" apps/desktop/e2e/ --include="*.ts"

# ハードコードされた認証情報の不在確認
grep -rn "apiKey\|secret\|token\|password" apps/desktop/e2e/ --include="*.ts" | grep -v "mock\|test\|spec\|fixture"

# CSP 無効化の不在確認
grep -rn "Content-Security-Policy.*none\|CSP.*disable" apps/desktop/e2e/ --include="*.ts"
```

**期待される成果物**: `outputs/phase-9/quality-report.md`

### タスク6: CI 安定性検証

**目的**: E2E テスト用 CI/CD ワークフローが正常に動作し、15 分以内に完了することを確認する。

**確認項目**:

| #   | チェック項目                                                         | 結果 |
| --- | -------------------------------------------------------------------- | ---- |
| 1   | ワークフロー YAML の構文が有効                                       | -    |
| 2   | pnpm store キャッシュが設定されている                                | -    |
| 3   | Playwright ブラウザキャッシュが設定されている                        | -    |
| 4   | E2E ジョブのタイムアウトが 15 分以内に設定されている                 | -    |
| 5   | Worktree 環境では E2E ジョブがスキップされる設定がある               | -    |
| 6   | テスト失敗時にアーティファクト（スクリーンショット）が保存される設定 | -    |

**確認コマンド**:

```bash
# ワークフロー構文の確認
cat .github/workflows/ci.yml | head -50

# ジョブタイムアウト設定の確認
grep -n "timeout-minutes" .github/workflows/*.yml

# キャッシュ設定の確認
grep -n "cache\|actions/cache" .github/workflows/*.yml

# E2E ジョブの存在確認
grep -n "e2e\|playwright" .github/workflows/*.yml
```

**期待される成果物**: `outputs/phase-9/quality-report.md`

### タスク7: ドキュメント品質検証

**目的**: プロトコル文書・Phase 11 テンプレート・deferred-tests.md テンプレートが品質基準を満たすことを確認する。

**品質チェック項目**:

| #   | チェック項目                                         | 対象文書           | 結果 |
| --- | ---------------------------------------------------- | ------------------ | ---- |
| 1   | 禁止語リストA（曖昧語）が 0 件                       | プロトコル文書全体 | -    |
| 2   | 全手順にコマンド例が付記されている                   | プロトコル文書     | -    |
| 3   | 全手順に期待結果が明示されている                     | プロトコル文書     | -    |
| 4   | deferred-tests.md テンプレートの必須フィールドが定義 | テンプレート       | -    |
| 5   | Phase 11 テンプレートが 3 層テスト構造を含む         | テンプレート       | -    |
| 6   | Worktree 環境での Layer 選択フローが図示されている   | プロトコル文書     | -    |

**確認コマンド**:

```bash
# 文書品質チェック（禁止語検知を含む）
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/ut-imp-phase11-worktree-protocol \
  --phase 9
```

**期待される成果物**: `outputs/phase-9/quality-report.md`

### タスク8: 品質ゲート総合判定

**目的**: 全品質項目の結果を集約し、品質ゲートの通過可否を判定する。

**品質ゲートテーブル**:

| #   | 品質項目     | 基準                                        | 結果 | 判定 |
| --- | ------------ | ------------------------------------------- | ---- | ---- |
| 1   | 機能検証     | 全自動テスト（ユニット + E2E）が PASS       | -    | -    |
| 2   | コード品質   | ESLint エラー 0、TypeScript エラー 0        | -    | -    |
| 3   | テスト安定性 | E2E テスト 3 回連続 PASS                    | -    | -    |
| 4   | テスト網羅性 | Line 80%+, Branch 60%+, Function 80%+       | -    | -    |
| 5   | セキュリティ | validateIpcSender 検証含有、認証情報未露出  | -    | -    |
| 6   | ドキュメント | 曖昧表現 0 件、全手順にコマンド例・期待結果 | -    | -    |
| 7   | CI/CD 安定性 | ワークフロー構文有効、15 分以内完了         | -    | -    |

**判定基準**:

- 全項目 PASS: 品質ゲート通過 → Phase 10 へ進行
- 1 項目でも FAIL: 該当タスクへ戻り修正

**期待される成果物**: `outputs/phase-9/quality-report.md`

## 参照資料

| 資料名           | パス                                                                                        | 説明                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Phase 1 成果物   | `outputs/phase-1/requirements-definition.md`                                                | 要件充足確認                                                             |
| Phase 5 成果物   | `outputs/phase-5/implementation-summary.md`                                                 | 実装内容と品質確認対象の突合                                             |
| Phase 7 成果物   | `outputs/phase-7/coverage-report.md`                                                        | カバレッジ基準の基準点                                                   |
| Phase 8 成果物   | `outputs/phase-8/refactoring-log.md`                                                        | リファクタリング結果                                                     |
| コード品質ルール | `.claude/rules/02-code-quality.md`                                                          | 型安全・テスト基準                                                       |
| セキュリティ     | `.claude/rules/04-electron-security.md`                                                     | Electron セキュリティ原則、validateIpcSender                             |
| 品質要件仕様     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | システム品質基準                                                         |
| IPC契約チェック  | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC契約検証観点                                                          |
| 実装パターン     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | E2E/IPC品質の再利用パターン                                              |
| E2E品質仕様      | `.claude/skills/aiworkflow-requirements/references/quality-e2e-testing.md`                  | E2Eテストの対象範囲と品質基準                                            |
| Playwright仕様   | `.claude/skills/aiworkflow-requirements/references/testing-playwright-e2e.md`               | Electron E2Eの実装パターン                                               |
| CI/CD仕様        | `.claude/skills/aiworkflow-requirements/references/deployment-gha.md`                       | GitHub Actionsジョブ設計                                                 |
| API防御仕様      | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | Preload API公開時のセキュリティ要件                                      |
| 既知の落とし穴   | `.claude/rules/06-known-pitfalls.md`                                                        | P39（happy-dom/userEvent 非互換）、P40（テスト実行ディレクトリ依存）対策 |

## 統合テスト連携【必須】

品質保証で統合テスト結果を確認する:

| 品質項目     | 確認内容                                          | 結果 |
| ------------ | ------------------------------------------------- | ---- |
| 機能検証     | ユニットテスト + E2E テスト全成功                 | -    |
| テスト安定性 | E2E テスト 3 回連続成功                           | -    |
| 型整合性     | TypeScript コンパイルエラー 0 件                  | -    |
| カバレッジ   | Line 80%+, Branch 60%+, Function 80%+             | -    |
| セキュリティ | validateIpcSender 検証が E2E テストに含まれている | -    |
| ドキュメント | プロトコル文書の曖昧表現 0 件                     | -    |
| CI/CD        | ワークフロー構文有効、E2E ジョブ 15 分以内        | -    |

## 多角的チェック観点

| 観点             | 適用判断 | 確認内容                                                                                    |
| ---------------- | -------- | ------------------------------------------------------------------------------------------- |
| セキュリティ     | YES      | E2E テストが contextIsolation・nodeIntegration 設定を違反せず、validateIpcSender 検証を含む |
| アーキテクチャ   | YES      | テストヘルパーの責務分離、ユーティリティの配置が規約に準拠している                          |
| パフォーマンス   | YES      | CI/CD ジョブが 15 分以内に完了する                                                          |
| ドキュメント品質 | YES      | 曖昧表現 0 件、全手順が実行可能な粒度で記述されている                                       |

**テスト環境の観点**:

| 環境             | 確認内容                                                |
| ---------------- | ------------------------------------------------------- |
| Worktree 環境    | Layer 1（ユニット）+ Layer 2（IPC 統合）テストが全 PASS |
| メインリポジトリ | Layer 1 + Layer 2 + Layer 3（E2E）テストが全 PASS       |
| CI 環境          | GitHub Actions で E2E テストが安定実行される            |

## 成果物

| 成果物                   | パス                                | 説明                       |
| ------------------------ | ----------------------------------- | -------------------------- |
| 機能検証レポート         | `outputs/phase-9/quality-report.md` | ユニット + E2E テスト結果  |
| コード品質レポート       | `outputs/phase-9/quality-report.md` | Lint + 型チェック結果      |
| テスト安定性レポート     | `outputs/phase-9/quality-report.md` | E2E 3 回連続実行結果       |
| カバレッジレポート       | `outputs/phase-9/quality-report.md` | Line/Branch/Function 結果  |
| セキュリティレポート     | `outputs/phase-9/quality-report.md` | validateIpcSender 検証結果 |
| CI/CD 検証レポート       | `outputs/phase-9/quality-report.md` | ワークフロー検証結果       |
| ドキュメント品質レポート | `outputs/phase-9/quality-report.md` | 文書品質検証結果           |
| 品質ゲート結果           | `outputs/phase-9/quality-report.md` | 総合判定結果               |

## 完了条件

- [ ] ESLint エラーが 0 件
- [ ] TypeScript コンパイルエラーが 0 件
- [ ] `any` 型の使用がないこと
- [ ] E2E テストが 3 回連続成功（flaky テストが 0 件）
- [ ] カバレッジ基準達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] E2E テストに validateIpcSender による送信元検証が含まれている
- [ ] テストコード内に認証情報（API キー、トークン、パスワード）がハードコードされていない
- [ ] プロトコル文書の曖昧表現が 0 件
- [ ] 全手順にコマンド例と期待結果が付記されている
- [ ] CI/CD ワークフローの YAML 構文が有効
- [ ] E2E ジョブのタイムアウトが 15 分以内に設定されている
- [ ] Worktree 環境で Layer 1-2 テストが全 PASS
- [ ] メインリポジトリで Layer 1-3 テストが全 PASS
- [ ] 品質ゲート総合判定が PASS
- [ ] 8 つのレポートが `outputs/phase-9/quality-report.md` に記載されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## サブタスク管理

Phase 実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 7-8 成果物、品質基準、セキュリティルール）
2. タスク1: 機能検証（全テスト PASS）
3. タスク2: コード品質（Lint + 型チェック）
4. タスク3: テスト安定性検証（Flaky テスト排除）
5. タスク4: テスト網羅性（カバレッジ基準達成）
6. タスク5: セキュリティ検証（validateIpcSender 含有確認）
7. タスク6: CI 安定性検証
8. タスク7: ドキュメント品質検証
9. タスク8: 品質ゲート総合判定
10. 統合テスト連携の実施
11. 成果物の作成・配置（`outputs/phase-9/quality-report.md`）
12. 完了条件の検証

## タスク 100% 実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスク（タスク1-8）を 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

## 次のPhase

Phase 10: 最終レビューゲート
