# Phase 1: 要件定義 -- Phase 11 Worktree環境テストプロトコル標準化

## メタ情報

| 項目     | 内容                                                                         |
| -------- | ---------------------------------------------------------------------------- |
| タスクID | UT-IMP-PHASE11-WORKTREE-PROTOCOL-001                                         |
| Phase    | 1                                                                            |
| タスク名 | Phase 11 Worktree環境テストプロトコル標準化                                  |
| 作成日   | 2026-03-01                                                                   |
| Issue    | #853                                                                         |
| 分類     | 改善                                                                         |
| 優先度   | 高                                                                           |
| 規模     | 中規模（プロトコル文書1件 + E2Eテスト2件 + CI更新1件 + テンプレート更新2件） |
| 依存     | なし（独立実行可能）                                                         |
| ブロック | なし                                                                         |

## 目的

Git Worktree環境でPhase 11（手動テスト）を実行する際に、Electronアプリを直接起動できない制約を克服するための標準化テストプロトコルの要件を定義する。Worktree環境特有の制約（ネイティブモジュールのバイナリ不整合、`node_modules` の非共有、Electronビルド困難）を分析し、テスト3層分類（Layer 1: 自動テスト / Layer 2: 静的コード検証 / Layer 3: UI/E2E）による代替テスト手法の要件を明確化する。成果物として、Worktree Phase 11プロトコル文書、Playwright Electron E2Eテストスクリプト、CI/CDワークフロー更新、Phase 11テンプレート更新、未実施テスト追跡テンプレートの5カテゴリの要件を定義する。

## 実行タスク

- Task 1: 機能要件（FR）を定義する -- Worktreeプロトコル文書、E2Eテスト、CI統合、テンプレート更新、未実施テスト追跡の要件を確定する
- Task 2: 非機能要件（NFR）を定義する -- テスト信頼性、実行時間、保守性、環境互換性、CI安定性の基準を確定する
- Task 3: 受入基準（AC）を定義する -- テスト可能な検証条件を確定する
- Task 4: スコープを確認する -- 含むもの/含まないものを明文化する
- Task 5: 影響範囲を分析する -- 関連ファイル・ワークフロー・Pitfallへの影響を整理する

---

### Task 1: 機能要件（FR）

#### FR-1: テスト3層分類プロトコル文書

| 項目     | 内容                                                                                                                                                                                                                                                                                                                               |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 機能     | Worktree環境でPhase 11を実行するための代替テスト手順書を作成する                                                                                                                                                                                                                                                                   |
| 配置先   | `outputs/phase-5/worktree-phase11-protocol.md`                                                                                                                                                                                                                                                                                     |
| Layer 1  | 自動テスト検証（Worktree実行可能）: `pnpm --filter @repo/desktop test:run` で全ユニットテストPASS、`vitest` カバレッジ基準（Line 80%以上、Branch 60%以上）を満たす                                                                                                                                                                 |
| Layer 2  | 静的コード検証（Worktree実行可能）: `pnpm typecheck` で型エラー0件、`pnpm lint` でESLintエラー0件、IPC契約検証（channels.tsのチャネル定数とipcMain.handle()/ipcMain.on()登録一覧の一致確認）、セキュリティ設定確認（BrowserWindow: contextIsolation=true, nodeIntegration=false, sandbox=true のコードレビュー）、ARIA属性存在確認 |
| Layer 3  | UI/E2Eテスト（CI/メインリポジトリのみ）: Playwright Electron E2Eテスト（`_electron.launch()` によるアプリ起動、`page.evaluate()` によるIPC通信テスト）、Electronアプリ起動・ウィンドウ表示テスト、UIインタラクション操作テスト                                                                                                     |
| 制約     | Layer 3のテストはWorktree環境では実行せず、`deferred-tests.md` に記録してCI/メインリポジトリでの実行に委譲する                                                                                                                                                                                                                     |
| 判定基準 | Layer 1 + Layer 2 が全てPASSした場合にWorktree環境でのPhase 11を「条件付きPASS」と判定する。Layer 3はCI実行結果で最終判定する                                                                                                                                                                                                      |

#### FR-2: Playwright Electron E2Eテスト（skill:remove）

| 項目           | 内容                                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 機能           | skill:remove IPCハンドラのElectron E2Eテストを `_electron.launch()` + `page.evaluate()` パターンで実装する               |
| 配置先         | `apps/desktop/e2e/ipc-skill-remove.spec.ts`                                                                              |
| テスト内容     | 正常系1件（スキル名指定の削除成功）、異常系3件（空文字列拒否、スペースのみ文字列拒否、未登録スキル名のエラーレスポンス） |
| バリデーション | P42準拠3段バリデーション: (1) `typeof skillName !== "string"` (2) `skillName === ""` (3) `skillName.trim() === ""`       |
| 回帰防止対象   | P44（skill:remove IPCインターフェース不整合）、P45（引数命名ドリフト skillId vs skillName）                              |
| Electron起動   | `_electron.launch({ args: ['.'] })` でElectronアプリを起動し、`electronApp.firstWindow()` でRendererウィンドウを取得する |
| IPC検証方法    | `page.evaluate(() => window.electronAPI.skill.remove(skillName))` でPreload API経由のIPC通信を検証する                   |

#### FR-3: Playwright Electron E2Eテスト（skill:import）

| 項目           | 内容                                                                                                                         |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 機能           | skill:import IPCハンドラのElectron E2Eテストを `_electron.launch()` + `page.evaluate()` パターンで実装する                   |
| 配置先         | `apps/desktop/e2e/ipc-skill-import.spec.ts`                                                                                  |
| テスト内容     | 正常系1件（スキル名指定のインポート成功）、異常系3件（空文字列拒否、スペースのみ文字列拒否、不正スキル名のエラーレスポンス） |
| バリデーション | P42準拠3段バリデーション: (1) `typeof skillName !== "string"` (2) `skillName === ""` (3) `skillName.trim() === ""`           |
| 回帰防止対象   | P44（skill:import IPCインターフェース不整合）                                                                                |
| Electron起動   | FR-2と同一のElectron起動パターンを共有する（テストヘルパーで共通化）                                                         |
| IPC検証方法    | `page.evaluate(() => window.electronAPI.skill.import(skillName))` でPreload API経由のIPC通信を検証する                       |

#### FR-4: Playwright Electron設定更新

| 項目         | 内容                                                                                                                                           |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 機能         | 既存の `apps/desktop/playwright.config.ts` にElectron E2Eテスト用のプロジェクト設定を追加する                                                  |
| 配置先       | `apps/desktop/playwright.config.ts`                                                                                                            |
| 追加設定     | Electron E2E用プロジェクト: `name: "electron-e2e"`、`_electron.launch()` 用の設定                                                              |
| タイムアウト | テスト単体: 30秒、Electronアプリ起動: 60秒                                                                                                     |
| リトライ     | CI環境: 2回、ローカル: 0回（既存設定を維持）                                                                                                   |
| レポーター   | HTMLレポーター（既存設定を維持）+ JUnit XMLレポーター（CI用に追加）                                                                            |
| 制約         | 既存のchromiumプロジェクト（Vite devサーバー + ブラウザE2E）を破壊しない。P40対策として `apps/desktop/` ディレクトリから実行する前提で設定する |

#### FR-5: CI/CDワークフロー E2Eジョブ追加

| 項目             | 内容                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| 機能             | `.github/workflows/ci.yml` にElectron E2Eテスト実行ジョブを追加する                                    |
| 配置先           | `.github/workflows/ci.yml`                                                                             |
| ジョブ名         | `e2e-desktop`                                                                                          |
| 実行環境         | `ubuntu-latest` + `xvfb-run --auto-servernum` でheadless Electronを起動する                            |
| 依存ジョブ       | `build-shared`（shared packageビルド完了後に実行）                                                     |
| 実行条件         | `apps/desktop/` 配下または `packages/shared/` 配下のファイル変更時のみ実行する（`paths` フィルタ使用） |
| 実行コマンド     | `xvfb-run --auto-servernum -- pnpm --filter @repo/desktop exec playwright test --project=electron-e2e` |
| タイムアウト     | ジョブ全体: 15分                                                                                       |
| アーティファクト | テスト結果レポートとスクリーンショット（失敗時のみ）を `actions/upload-artifact@v4` でアップロードする |

#### FR-6: Phase 11テンプレート更新

| 項目     | 内容                                                                                                                                                              |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 機能     | Phase 11テンプレート（`.claude/skills/task-specification-creator/references/phase-11-12-guide.md`）に「Worktree環境テスト手順」セクションを追加する               |
| 配置先   | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                                                                                       |
| 追加位置 | Phase 11セクションの「実行フロー」の直後、「テスト結果レポート形式」の直前                                                                                        |
| 追加内容 | Worktree環境判定方法（`git rev-parse --show-toplevel` の結果に `.worktrees/` が含まれるか）、Layer 1-3テスト手順、deferred-tests.md記録手順、条件付きPASS判定基準 |
| 適用範囲 | 新規タスクのPhase 11仕様書作成時から適用する（既存仕様書の遡及修正は行わない）                                                                                    |

#### FR-7: 未実施テスト追跡テンプレート（deferred-tests.md）

| 項目         | 内容                                                                                                                                          |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 機能         | Worktree環境でスキップしたLayer 3テストケースを記録・追跡するテンプレートを作成する                                                           |
| 配置先       | `outputs/phase-5/deferred-tests-template.md`                                                                                                  |
| 記録項目     | テストケースID、テスト名、スキップ理由（Worktree環境/Electron起動不可/CI専用）、実行予定環境（CI/メインリポジトリ）、実行期限、完了ステータス |
| ワークフロー | Phase 11でLayer 3テストをスキップ時に記録 -> PR本文の「Test Plan」に未実施テスト数を記載 -> メインリポジトリマージ後にCI実行で完了確認        |
| Phase 13連携 | `deferred-tests.md` の未完了項目が0件であることをPhase 13の完了条件に追加する                                                                 |

---

### Task 2: 非機能要件（NFR）

#### NFR-1: E2Eテスト信頼性

| 項目     | 内容                                                                                                                                                  |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 要件     | E2Eテストが決定論的に成功/失敗すること（フレイキーテスト0件）                                                                                         |
| 検証方法 | CI環境（ubuntu-latest + xvfb-run）で同一コミットに対して3回連続実行し、3回とも同一結果（全PASS or 全FAIL）であること                                  |
| 対策     | テスト間の状態隔離（各テストでElectronアプリを新規起動・終了）、明示的なwait条件（`waitForSelector` / `waitForFunction` 使用、`waitForTimeout` 禁止） |

#### NFR-2: E2Eテスト実行時間

| 項目     | 内容                                                                                                |
| -------- | --------------------------------------------------------------------------------------------------- |
| 要件     | Electron E2Eテスト全体（FR-2 + FR-3の全テストケース）の実行時間がCI環境で60秒以内であること         |
| 検証方法 | GitHub Actions実行ログの `e2e-desktop` ジョブの実行時間を計測する                                   |
| 根拠     | 既存CIのtest-desktopジョブタイムアウトが15分であり、E2Eジョブも同一タイムアウト内に収める必要がある |

#### NFR-3: テスト保守性

| 項目     | 内容                                                                                                                         |
| -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 要件     | 新規IPCハンドラのE2Eテスト追加時に、テストヘルパー（Electron起動・終了、IPC呼び出し）を再利用できること                      |
| 検証方法 | テストヘルパー関数が `apps/desktop/e2e/helpers/electron-app.ts` に抽出されており、新規テストファイルから `import` できること |
| 基準     | 新規IPCハンドラE2Eテストの追加に必要なコード量が50行以内であること（ヘルパー利用時）                                         |

#### NFR-4: 環境互換性

| 項目     | 内容                                                                                                                    |
| -------- | ----------------------------------------------------------------------------------------------------------------------- |
| 要件     | E2Eテストがメインリポジトリ（`apps/desktop/` ディレクトリ）とCI環境（ubuntu-latest）の両方で実行可能であること          |
| 検証方法 | メインリポジトリで `cd apps/desktop && pnpm exec playwright test --project=electron-e2e` を実行して全テストPASSすること |
| P40対策  | テスト実行は `apps/desktop/` ディレクトリからのみ実行する（プロジェクトルートからの実行は行わない）                     |

#### NFR-5: CI安定性（xvfb-run固有）

| 項目           | 内容                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| 要件           | `xvfb-run` によるheadless Electron起動がCI環境で安定的に動作すること                                         |
| 検証方法       | `xvfb-run --auto-servernum -- ` プレフィックスでElectronアプリが起動し、テストが正常に完了すること           |
| フォールバック | `xvfb-run` 失敗時はジョブをスキップし、テスト結果を `deferred-tests.md` に記録する（CI全体をブロックしない） |

---

### Task 3: 受入基準（AC）

| ID    | 受入基準                                                                                                                          | 対応要件    | テスト方法                       |
| ----- | --------------------------------------------------------------------------------------------------------------------------------- | ----------- | -------------------------------- |
| AC-01 | Worktree Phase 11プロトコル文書がLayer 1（自動テスト）、Layer 2（静的コード検証）、Layer 3（UI/E2E）の3層テスト戦略を定義している | FR-1        | ドキュメントレビュー             |
| AC-02 | `apps/desktop/e2e/ipc-skill-remove.spec.ts` が正常系1件・異常系3件の計4テストケースを含む                                         | FR-2        | `playwright test` 実行           |
| AC-03 | `apps/desktop/e2e/ipc-skill-import.spec.ts` が正常系1件・異常系3件の計4テストケースを含む                                         | FR-3        | `playwright test` 実行           |
| AC-04 | E2Eテストが `_electron.launch()` でElectronアプリを起動し、`page.evaluate()` でIPC通信を検証している                              | FR-2, FR-3  | テストコードレビュー             |
| AC-05 | E2EテストがP42準拠3段バリデーション（型チェック -> 空文字列 -> トリム空文字列）を検証している                                     | FR-2, FR-3  | テストコードレビュー             |
| AC-06 | `apps/desktop/playwright.config.ts` に `electron-e2e` プロジェクトが追加され、既存 `chromium` プロジェクトが破壊されていない      | FR-4        | 設定ファイルレビュー             |
| AC-07 | `.github/workflows/ci.yml` に `e2e-desktop` ジョブが追加されている                                                                | FR-5        | CI設定レビュー                   |
| AC-08 | `e2e-desktop` ジョブが `apps/desktop/` または `packages/shared/` の変更時のみ実行される（`paths` フィルタ設定）                   | FR-5        | CI設定レビュー                   |
| AC-09 | `e2e-desktop` ジョブが `xvfb-run --auto-servernum` でElectronを起動する設定になっている                                           | FR-5, NFR-5 | CI設定レビュー                   |
| AC-10 | Phase 11テンプレートに「Worktree環境テスト手順」セクションが存在し、Layer 1-3テスト手順と判定基準を含む                           | FR-6        | テンプレートレビュー             |
| AC-11 | `deferred-tests-template.md` がテストケースID、スキップ理由、実行予定環境、期限、完了ステータスの記録欄を含む                     | FR-7        | テンプレートレビュー             |
| AC-12 | `deferred-tests.md` の未完了項目0件がPhase 13完了条件に組み込まれている                                                           | FR-7        | テンプレートレビュー             |
| AC-13 | E2Eテスト全体の実行時間がCI環境で60秒以内である                                                                                   | NFR-2       | CI実行時間計測                   |
| AC-14 | CI環境で3回連続実行して全て同一結果である（フレイキーテスト0件）                                                                  | NFR-1       | 連続テスト実行                   |
| AC-15 | テストヘルパー関数が `apps/desktop/e2e/helpers/electron-app.ts` に抽出されている                                                  | NFR-3       | ファイル存在確認・コードレビュー |
| AC-16 | メインリポジトリで `cd apps/desktop && pnpm exec playwright test --project=electron-e2e` が全テストPASSする                       | NFR-4       | テスト実行                       |

---

### Task 4: スコープ確認

#### 含むもの

| 項目                                   | 詳細                                                                                                                   |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Worktree Phase 11プロトコル文書（1件） | Layer 1-3テスト戦略を定義する手順書                                                                                    |
| Playwright Electron E2Eテスト（2件）   | `ipc-skill-remove.spec.ts`、`ipc-skill-import.spec.ts`                                                                 |
| E2Eテストヘルパー（1件）               | `apps/desktop/e2e/helpers/electron-app.ts`（Electron起動・終了・IPC呼び出し共通化）                                    |
| Playwright設定更新（1件）              | `apps/desktop/playwright.config.ts` に `electron-e2e` プロジェクト追加                                                 |
| CI/CDワークフロー更新（1件）           | `.github/workflows/ci.yml` に `e2e-desktop` ジョブ追加                                                                 |
| Phase 11テンプレート更新（1件）        | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md` に「Worktree環境テスト手順」セクション追加 |
| 未実施テスト追跡テンプレート（1件）    | `deferred-tests-template.md` の新規作成                                                                                |

#### 含まないもの

| 項目                                                    | 理由                                                                                     |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 既存Phase 11仕様書の遡及修正                            | 適用は新規タスクのPhase 11仕様書作成時からとし、既存仕様書の変更は別タスクで対応する     |
| Worktree環境以外（メインリポジトリ）のテスト手順変更    | 本タスクはWorktree固有の制約への対応に限定する                                           |
| Electronアプリ本体のビルドパイプライン構築              | Electronビルド・パッケージングは別タスクのスコープである                                 |
| パフォーマンステスト・負荷テストの自動化                | 本タスクは機能テスト（IPC通信の正常性確認）の代替手段に限定する                          |
| skill:remove / skill:import以外のIPCハンドラE2Eテスト   | 本タスクではP44/P45回帰防止対象の2ハンドラに限定する。他ハンドラは未タスクとして検出する |
| Playwright `_electron.launch()` のmacOS/Windows固有設定 | CI環境（ubuntu-latest）での動作を優先する。ローカルOS対応は未タスクとする                |

---

### Task 5: 影響範囲分析

#### 新規作成ファイル

| ファイル                                     | 内容                                    |
| -------------------------------------------- | --------------------------------------- |
| `apps/desktop/e2e/ipc-skill-remove.spec.ts`  | skill:remove Electron E2Eテスト         |
| `apps/desktop/e2e/ipc-skill-import.spec.ts`  | skill:import Electron E2Eテスト         |
| `apps/desktop/e2e/helpers/electron-app.ts`   | Electron起動・終了・IPC呼び出しヘルパー |
| `outputs/phase-5/deferred-tests-template.md` | 未実施テスト追跡テンプレート            |

#### 更新ファイル

| ファイル                                                                    | 影響内容                                 |
| --------------------------------------------------------------------------- | ---------------------------------------- |
| `apps/desktop/playwright.config.ts`                                         | `electron-e2e` プロジェクト追加          |
| `.github/workflows/ci.yml`                                                  | `e2e-desktop` ジョブ追加                 |
| `.claude/skills/task-specification-creator/references/phase-11-12-guide.md` | 「Worktree環境テスト手順」セクション追加 |

#### 関連Pitfall

| Pitfall ID | リスク                                            | 本タスクでの対策                                                                      |
| ---------- | ------------------------------------------------- | ------------------------------------------------------------------------------------- |
| P7         | ネイティブモジュールのバイナリ不一致              | Worktree環境でのElectron起動不可の根本原因。Layer 3をCI/メインリポジトリに委譲する    |
| P11        | PostToolUseフックによるEdit失敗                   | 大量編集後は `git diff --stat` で変更数を検証する                                     |
| P40        | テスト実行ディレクトリ依存（モノレポ）            | E2Eテスト実行は `cd apps/desktop &&` プレフィックスで実行する。CI設定でも同一パターン |
| P42        | 文字列引数の `.trim()` バリデーション漏れ         | E2Eテストでスペースのみ文字列（`"   "`）の拒否を明示的に検証する                      |
| P44        | skill:import/remove IPCインターフェース不整合     | E2Eテストでstring引数（単一スキル名）でのIPC通信が成功することを回帰テストする        |
| P45        | IPC引数命名の契約ドリフト（skillId vs skillName） | E2EテストでskillName引数でのIPC通信が正常動作することを回帰テストする                 |

#### サブタスク管理

| サブタスク                     | 対応FR     | 依存関係                     |
| ------------------------------ | ---------- | ---------------------------- |
| プロトコル文書作成             | FR-1       | なし（独立実行可能）         |
| E2Eテストヘルパー実装          | FR-2, FR-3 | FR-4（Playwright設定）に依存 |
| skill:remove E2Eテスト実装     | FR-2       | ヘルパーに依存               |
| skill:import E2Eテスト実装     | FR-3       | ヘルパーに依存               |
| Playwright設定更新             | FR-4       | なし（独立実行可能）         |
| CI/CDワークフロー更新          | FR-5       | FR-4に依存                   |
| Phase 11テンプレート更新       | FR-6       | FR-1に依存                   |
| deferred-testsテンプレート作成 | FR-7       | なし（独立実行可能）         |

---

## 参照資料

| 参照資料                   | パス                                                                          | 内容                                 |
| -------------------------- | ----------------------------------------------------------------------------- | ------------------------------------ |
| タスク実行ワークフロー     | `.claude/rules/05-task-execution.md`                                          | Phase 1-13ワークフロー定義           |
| 既知の落とし穴             | `.claude/rules/06-known-pitfalls.md`                                          | P7, P40, P42, P44, P45の詳細         |
| Phase 11/12テンプレート    | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`   | 現行のPhase 11テスト手順テンプレート |
| IPC契約チェックリスト      | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` | IPCハンドラ契約検証手順              |
| コード品質ルール           | `.claude/rules/02-code-quality.md`                                            | テスト基準、カバレッジ基準           |
| Electronセキュリティルール | `.claude/rules/04-electron-security.md`                                       | IPCセキュリティ原則                  |
| 既存Playwright設定         | `apps/desktop/playwright.config.ts`                                           | 現行のPlaywright E2E設定             |
| 既存CIワークフロー         | `.github/workflows/ci.yml`                                                    | 現行のCIジョブ構成                   |
| 既存E2Eテスト例            | `apps/desktop/e2e/skill-permission.spec.ts`                                   | 既存E2Eテストのパターン参照          |
| E2Eグローバルセットアップ  | `apps/desktop/e2e/global-setup.ts`                                            | 既存のElectronAPIモック初期化        |
| 必要仕様抽出マトリクス     | `spec-reference-matrix.md`                                                    | 本タスクの必要仕様と根拠の単一正本   |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                          | 内容                                |
| ------------------ | ----------------------------------------------------------------------------- | ----------------------------------- |
| アーキテクチャ概要 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`  | Electron 3プロセスモデル            |
| IPC仕様            | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`  | IPCセキュリティ原則・チャンネル管理 |
| 品質要件           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   | テスト・カバレッジ基準              |
| タスクワークフロー | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`          | Phase運用と完了判定ルール           |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`         | IPC失敗時のエラー契約               |
| IPC API契約        | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`          | IPCチャンネル契約と戻り値仕様       |
| Electron API防御   | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`  | Preload公開APIの防御境界            |
| Playwright E2E仕様 | `.claude/skills/aiworkflow-requirements/references/testing-playwright-e2e.md` | Electron E2Eテスト実装パターン      |
| E2E品質指針        | `.claude/skills/aiworkflow-requirements/references/quality-e2e-testing.md`    | E2Eの対象範囲と品質基準             |
| CI/CD仕様          | `.claude/skills/aiworkflow-requirements/references/deployment-gha.md`         | GitHub Actionsジョブ設計原則        |

## 統合テスト連携

| テスト種別                  | 検証内容                                                                                     |
| --------------------------- | -------------------------------------------------------------------------------------------- |
| Playwright Electron E2E     | `_electron.launch()` -> Electronアプリ起動 -> `page.evaluate()` -> IPC通信 -> レスポンス検証 |
| IPC契約整合テスト           | Preload API経由の呼び出し形式がMain Processハンドラの引数形式と一致すること                  |
| P42 3段バリデーションテスト | 空文字列・スペースのみ文字列が `VALIDATION_ERROR` で拒否されること                           |
| CI/CD自動実行テスト         | `xvfb-run` + `ubuntu-latest` 環境でElectron E2Eテストが安定実行されること                    |
| Layer 1-3分類テスト         | Layer 1 + Layer 2がWorktree環境で実行可能、Layer 3がCI環境で実行可能であること               |

## 多角的チェック観点

| 観点             | チェック内容                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------ |
| テスト3層分類    | Layer 1-3の境界が明確に定義され、各Layerの実行環境（Worktree/CI/メインリポジトリ）が一意に決定する           |
| IPC契約整合性    | E2Eテストがstring引数（単一スキル名）でIPC通信を行い、P44/P45の修正が回帰しないことを検証する                |
| CI安定性         | `xvfb-run` によるheadless Electron起動が3回連続で成功すること                                                |
| 既存CIとの共存   | `e2e-desktop` ジョブ追加が既存ジョブ（lint, typecheck, test-shared, test-desktop, build）に影響しない        |
| P40対策          | テスト実行コマンドが `cd apps/desktop &&` プレフィックスまたは `pnpm --filter @repo/desktop exec` を含むこと |
| テンプレート互換 | Phase 11テンプレート更新が既存のテスト結果レポート形式と整合すること                                         |
| セキュリティ     | E2Eテストが contextIsolation=true 環境でPreload API経由のIPC通信を検証すること                               |

## タスク100%実行確認

- [ ] Task 1（FR定義）: FR-1～FR-7 の7件が全て定義されている
- [ ] Task 2（NFR定義）: NFR-1～NFR-5 の5件が全て定義されている
- [ ] Task 3（AC定義）: AC-01～AC-16 の16件が全て定義されている
- [ ] Task 4（スコープ確認）: 含むもの7件/含まないもの6件が明文化されている
- [ ] Task 5（影響範囲分析）: 新規作成4件、更新3件、関連Pitfall 6件が分析されている

## 成果物

| 成果物                   | パス                                         |
| ------------------------ | -------------------------------------------- |
| 要件定義書（本ファイル） | `phase-1-requirements.md`                    |
| 要件サマリー             | `outputs/phase-1/requirements-definition.md` |
| 受入基準一覧             | `outputs/phase-1/acceptance-criteria.md`     |
| スコープ定義             | `outputs/phase-1/scope-definition.md`        |

## 完了条件

- [ ] FR-1～FR-7 の7つの機能要件がテスト可能な粒度で定義されている
- [ ] NFR-1～NFR-5 の5つの非機能要件が具体的な検証方法と共に定義されている
- [ ] AC-01～AC-16 の16件の受入基準が全て定義されている
- [ ] テスト3層分類（Layer 1/2/3）の対象テスト種別と実行環境が全て定義されている
- [ ] スコープ（含むもの7件/含まないもの6件）が明文化されている
- [ ] 影響範囲分析（新規作成4件、更新3件、関連Pitfall 6件）が完了している
- [ ] 参照資料テーブル（10件 + システム仕様10件）が完備されている
- [ ] 関連Pitfall（P7, P11, P40, P42, P44, P45）への対策が明記されている
- [ ] サブタスク管理テーブルで依存関係が整理されている
- [ ] 統合テスト連携テーブルで5種類のテスト検証内容が定義されている
- [ ] 禁止語リストA（曖昧語）の出現がゼロ件

## 次のPhase

-> Phase 2: 設計（`phase-2-design.md`）
