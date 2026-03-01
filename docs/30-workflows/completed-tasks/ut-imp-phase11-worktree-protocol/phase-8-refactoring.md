# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目      | 値                                                           |
| --------- | ------------------------------------------------------------ |
| Phase     | 8                                                            |
| タスクID  | UT-IMP-PHASE11-WORKTREE-PROTOCOL-001                         |
| 機能名    | ut-imp-phase11-worktree-protocol（Worktree環境テスト標準化） |
| Issue     | #853                                                         |
| 作成日    | 2026-03-01                                                   |
| 前提Phase | Phase 7（テストカバレッジ確認）                              |
| 次Phase   | Phase 9（品質保証）                                          |

## 目的

Phase 5-7 で実装・テスト済みの Worktree 環境テストプロトコル関連コード（E2E テストスクリプト、CI/CD ワークフロー、Worktree 環境判定ユーティリティ、deferred-tests テンプレート）の動作を変えずに、コード品質を改善する。重複排除・命名改善・構造整理・SOLID 原則適用を行い、保守性・可読性を向上させる。

## 背景

Phase 5 の実装では動作優先で書かれた箇所があり、以下の技術的負債が蓄積している:

1. E2E テストコード間で Electron アプリ起動・終了処理が重複している
2. Playwright 設定の CI/ローカル環境分岐が未最適化
3. CI/CD ワークフローのキャッシュ活用と並列実行が未最適化
4. Worktree 環境判定ロジックがテストコードに直接記述されている箇所がある
5. deferred-tests テンプレートの構造に改善余地がある

TDD の Refactor フェーズとして、テスト成功を維持しながらこれらの品質改善を行う。

## 実行タスク

- タスク1: E2E テストスクリプトの共通ヘルパー抽出（Electron アプリ起動・終了処理の共通化）
- タスク2: テスト設定の DRY 化（playwright.config.ts の最適化）
- タスク3: CI/CD ワークフローのジョブ構成最適化（並列実行、キャッシュ活用）
- タスク4: Worktree 環境判定ロジックの関数抽出
- タスク5: deferred-tests テンプレートの構造改善

### タスク1: E2E テストスクリプトの共通ヘルパー抽出

**目的**: 複数の E2E テストファイル間で重複している Electron アプリ起動・終了処理・セットアップ処理・アサーション処理をヘルパー関数として抽出し、DRY 原則に準拠させる。

**リファクタリング観点**: 重複排除（E2E テスト共通パターン）、単一責務原則（SRP — テストロジックとセットアップの分離）

**実行手順**:

1. Phase 5 で作成した全 E2E テストファイルを列挙する
   - `apps/desktop/e2e/ipc-skill-remove.spec.ts`
   - `apps/desktop/e2e/ipc-skill-import.spec.ts`
   - その他 `apps/desktop/e2e/` 配下の E2E テストファイル
2. 各テストファイルのセットアップ処理（Electron アプリ起動、ページ遷移、認証モック）を比較する
3. 3 箇所以上で重複しているコードブロックを特定する
4. 共通テストヘルパーファイル（`apps/desktop/e2e/helpers/worktree-test-helpers.ts`）に以下の関数を抽出する:
   - `launchElectronApp()`: Electron アプリの起動処理
   - `closeElectronApp(app)`: Electron アプリの終了処理
   - `getFirstWindow(app)`: 最初のウィンドウを取得する処理
   - `evaluateIpc(page, channel, args)`: IPC 呼び出しのラッパー
5. 各テストファイルからヘルパー関数を呼び出すように修正する
6. リファクタリング後にテストを実行し、全テストが成功することを確認する

**確認コマンド**:

```bash
cd apps/desktop && pnpm playwright test e2e/
```

### タスク2: テスト設定の DRY 化（playwright.config.ts の最適化）

**目的**: Playwright の設定ファイルのタイムアウト値・リトライ回数・ワーカー数を CI 環境と開発環境の両方で安定稼動する値に調整し、設定の重複を排除する。

**リファクタリング観点**: 重複排除（CI/ローカル設定分岐の一元管理）、構造整理（設定値の明示化）

**実行手順**:

1. 現行の `apps/desktop/playwright.config.ts` の設定値を確認する
2. 以下の設定項目を検証・調整する:
   - `timeout`: テスト全体のタイムアウト（CI 環境: 60000ms、ローカル: 30000ms）
   - `expect.timeout`: アサーションタイムアウト（CI 環境: 10000ms、ローカル: 5000ms）
   - `retries`: CI 環境では 2 回、ローカルでは 0 回
   - `workers`: CI 環境では 1、ローカルでは CPU コア数の 50%
3. 環境変数 `CI` の有無で設定を分岐するロジックを追加する
4. テスト実行して設定変更後も全テストが成功することを確認する

**確認コマンド**:

```bash
cd apps/desktop && pnpm playwright test e2e/ --config=playwright.config.ts
```

### タスク3: CI/CD ワークフローのジョブ構成最適化

**目的**: GitHub Actions ワークフローのキャッシュ活用と並列実行を最適化し、E2E ジョブの実行時間を短縮する。

**リファクタリング観点**: 構造整理（ジョブの依存関係明確化）、パフォーマンス改善（キャッシュ活用）

**実行手順**:

1. `.github/workflows/` 配下の E2E テスト関連ワークフローファイルを確認する
2. 以下の最適化を検討・適用する:
   - pnpm store キャッシュの活用（`actions/cache` または `pnpm/action-setup` のキャッシュ機能）
   - Playwright ブラウザキャッシュの永続化（`~/.cache/ms-playwright` のキャッシュ）
   - ビルドアーティファクトのキャッシュ（`apps/desktop/out/` ディレクトリ）
   - テストのシャーディング（大量テスト時の並列分割設定）
3. 不要なステップ（重複するインストール処理）を排除する
4. ワークフローの YAML 構文チェックを実施する

**確認コマンド**:

```bash
# ワークフロー構文チェック（actionlint がインストール済みの場合）
actionlint .github/workflows/e2e-*.yml

# ジョブタイムアウト設定の確認
grep -n "timeout-minutes" .github/workflows/*.yml
```

### タスク4: Worktree 環境判定ロジックの関数抽出

**目的**: Worktree 環境かメインリポジトリかを判定するロジックを、テストコード・CI/CD スクリプト・プロトコル文書の 3 箇所で再利用可能な共通ユーティリティとして抽出する。

**リファクタリング観点**: 重複排除（判定ロジックの一元化）、命名改善（関数名の明確化）、SOLID 原則適用（単一責務原則）

**実行手順**:

1. 現行の Worktree 環境判定ロジック（`git rev-parse --git-common-dir` 使用箇所）を全箇所で確認する
2. 判定ロジックが `apps/desktop/src/main/utils/worktree-detector.ts` に共通ユーティリティとして存在することを確認する
3. 以下の関数が存在し、テストコードと CI/CD スクリプトから参照されていることを確認する:
   - `isWorktreeEnvironment(): boolean` -- Worktree 環境であるか判定する
   - `getMainRepoPath(): string` -- メインリポジトリのパスを取得する
   - `getWorktreeName(): string | null` -- Worktree 名を取得する（メインリポジトリの場合は `null`）
4. テストコード内に直接記述された判定ロジックがあれば、共通ユーティリティの呼び出しに置換する
5. CI/CD スクリプト内の判定ロジックも同様に共通化する
6. リファクタリング後に全テストが成功することを確認する

**確認コマンド**:

```bash
# ユーティリティテスト実行
cd apps/desktop && pnpm vitest run src/main/utils/__tests__/worktree-detector.test.ts

# E2E テスト実行
cd apps/desktop && pnpm playwright test e2e/

# 重複判定ロジックの残存確認
grep -rn "git-common-dir\|\.worktrees" apps/desktop/e2e/ apps/desktop/src/ --include="*.ts" | grep -v "worktree-detector"
```

### タスク5: deferred-tests テンプレートの構造改善

**目的**: deferred-tests.md テンプレートの構造を改善し、テスト項目の記録・追跡・解消確認が効率的に行えるフォーマットに整備する。

**リファクタリング観点**: 構造整理（テーブルカラムの最適化）、命名改善（フィールド名の明確化）

**実行手順**:

1. `outputs/phase-5/deferred-tests-template.md` の現行構造を確認する
2. 以下の改善を実施する:
   - テーブルヘッダーのカラム名を明確化する（「項目」→「テスト名」、「状態」→「解消ステータス（未解消/解消済み/対応不要）」）
   - 必須フィールド（テスト名、延期理由、実行予定環境、期限、解消ステータス）が漏れなく定義されていることを確認する
   - テンプレートの記入例を追加する
   - パーサー（deferred-tests-parser.ts）との整合性を確認する
3. パーサーのユニットテストが改善後のテンプレート構造でも成功することを確認する

**確認コマンド**:

```bash
# パーサーテスト実行
cd apps/desktop && pnpm vitest run src/main/utils/__tests__/deferred-tests-parser.test.ts
```

## 参照資料

| 資料名           | パス                                         | 説明                                  |
| ---------------- | -------------------------------------------- | ------------------------------------- |
| Phase 5 成果物   | `outputs/phase-5/implementation-summary.md`  | 実装結果の基準点                      |
| Phase 6 成果物   | `outputs/phase-6/coverage-report.md`         | 拡充テストで検出した弱点              |
| Phase 7 成果物   | `outputs/phase-7/coverage-report.md`         | カバレッジゲート判定結果              |
| Phase 1 成果物   | `outputs/phase-1/requirements-definition.md` | 要件制約の再確認                      |
| Phase 2 成果物   | `outputs/phase-2/architecture-design.md`     | 設計意図の再確認                      |
| 既知の落とし穴   | `.claude/rules/06-known-pitfalls.md`         | P40（テスト実行ディレクトリ依存）対策 |
| コード品質ルール | `.claude/rules/02-code-quality.md`           | DRY・SRP 原則                         |

## 統合テスト連携【必須】

リファクタリング後の統合テスト継続成功を確認する:

```bash
# ユニットテスト実行
cd apps/desktop && pnpm vitest run

# E2E テスト実行（メインリポジトリ環境のみ）
cd apps/desktop && pnpm playwright test e2e/

# 型チェック
pnpm typecheck
```

| テスト対象            | 確認内容                                          | 期待結果 |
| --------------------- | ------------------------------------------------- | -------- |
| Worktree 判定ユニット | 環境判定ユーティリティの全テストケースが成功      | ALL PASS |
| E2E テスト（Layer 3） | Playwright テストがリファクタリング後も成功       | ALL PASS |
| CI/CD ワークフロー    | GitHub Actions ワークフローの構文が有効           | エラー 0 |
| 型チェック            | TypeScript コンパイルエラーなし                   | エラー 0 |
| カバレッジ            | Phase 7 確認時のカバレッジを維持                  | 基準以上 |
| パーサーテスト        | deferred-tests パーサーがテンプレート改善後も成功 | ALL PASS |

## 多角的チェック観点

| 観点             | 適用判断 | 確認内容                                                               |
| ---------------- | -------- | ---------------------------------------------------------------------- |
| セキュリティ     | YES      | E2E テストが contextIsolation/nodeIntegration/sandbox 設定を変更しない |
| アーキテクチャ   | YES      | SRP・DRY 準拠、テストヘルパーの責務分離が完了している                  |
| パフォーマンス   | YES      | CI/CD ジョブの実行時間が 15 分以内に収まること                         |
| ドキュメント品質 | YES      | deferred-tests テンプレートの構造が明確で記入例がある                  |

## 成果物

| 成果物                              | パス                                 | 説明                                     |
| ----------------------------------- | ------------------------------------ | ---------------------------------------- |
| E2E テストヘルパー抽出結果          | `outputs/phase-8/refactoring-log.md` | Electron 起動・終了処理の共通化詳細      |
| Playwright 設定最適化結果           | `outputs/phase-8/refactoring-log.md` | タイムアウト・リトライ・ワーカー設定調整 |
| CI/CD ワークフロー最適化結果        | `outputs/phase-8/refactoring-log.md` | キャッシュ活用・並列実行の改善           |
| Worktree 判定ロジック関数抽出結果   | `outputs/phase-8/refactoring-log.md` | ユーティリティ共通化の結果               |
| deferred-tests テンプレート改善結果 | `outputs/phase-8/refactoring-log.md` | テンプレート構造改善の詳細               |

## 完了条件

- [ ] E2E テスト間の共通処理（Electron アプリ起動・終了・ページ取得・IPC 呼び出し）がヘルパー関数に抽出されている
- [ ] テストヘルパーファイル（`apps/desktop/e2e/helpers/worktree-test-helpers.ts`）が存在し、4 つ以上のヘルパー関数を含む
- [ ] Playwright 設定で CI/ローカルの環境分岐（`CI` 環境変数による timeout/retries/workers の切り替え）が実装されている
- [ ] CI/CD ワークフローで pnpm store キャッシュと Playwright ブラウザキャッシュが活用されている
- [ ] Worktree 環境判定ロジックが共通ユーティリティ（`worktree-detector.ts`）に一元化されている
- [ ] ユーティリティ関数 `isWorktreeEnvironment()`、`getMainRepoPath()`、`getWorktreeName()` が存在する
- [ ] テストコード・CI/CD スクリプト内に重複した判定ロジックが残存していない
- [ ] deferred-tests テンプレートに必須フィールド（テスト名、延期理由、実行予定環境、期限、解消ステータス）と記入例が含まれている
- [ ] リファクタリング後の全テスト（ユニット + E2E）が成功している
- [ ] TypeScript コンパイルエラーが 0 件
- [ ] カバレッジが Phase 7 確認時と同等以上を維持している
- [ ] 5 つのリファクタリング結果が `outputs/phase-8/refactoring-log.md` に記載されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## TDD 検証

```bash
# テスト実行コマンド
cd apps/desktop && pnpm vitest run
cd apps/desktop && pnpm playwright test e2e/

# 確認項目
# - [ ] リファクタリング後もテストが成功することを確認
# - [ ] カバレッジが低下していないことを確認
```

## サブタスク管理

Phase 実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 5-7 成果物、既知の落とし穴、コード品質ルール）
2. タスク1: E2E テストスクリプトの共通ヘルパー抽出
3. タスク2: テスト設定の DRY 化（playwright.config.ts の最適化）
4. タスク3: CI/CD ワークフローのジョブ構成最適化
5. タスク4: Worktree 環境判定ロジックの関数抽出
6. タスク5: deferred-tests テンプレートの構造改善
7. 統合テスト連携の実施（全テスト継続成功確認）
8. 成果物の作成・配置（`outputs/phase-8/refactoring-log.md`）
9. 完了条件の検証

## タスク 100% 実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスク（タスク1-5）を 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

## 次のPhase

Phase 9: 品質保証
