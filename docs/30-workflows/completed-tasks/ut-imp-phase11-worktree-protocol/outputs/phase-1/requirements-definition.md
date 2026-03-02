# Phase 1: 要件定義サマリー

**タスクID:** UT-IMP-PHASE11-WORKTREE-PROTOCOL-001
**タスク名:** Phase 11 Worktree環境テストプロトコル標準化
**Issue:** #853
**実行日:** 2026-03-01

---

## 機能要件（FR）サマリー

### FR-1: テスト3層分類プロトコル文書

Worktree環境でPhase 11を実行するための代替テスト手順書を作成する。テストを3層に分類し、各層の実行可能環境と判定基準を明示する。

| 項目     | 内容                                                                       |
| -------- | -------------------------------------------------------------------------- |
| 配置先   | `outputs/phase-5/worktree-phase11-protocol.md`                             |
| Layer 1  | 自動テスト検証（Worktree実行可能）: `pnpm --filter @repo/desktop test:run` |
| Layer 2  | 静的コード検証（Worktree実行可能）: typecheck, lint, IPC契約検証           |
| Layer 3  | UI/E2Eテスト（CI/メインリポジトリのみ）: Playwright Electron E2E           |
| 判定基準 | Layer 1 + Layer 2 PASS = 条件付きPASS、Layer 3はCI結果で最終判定           |
| 制約     | Layer 3テストはWorktree環境では実行せず、`deferred-tests.md`に記録         |

### FR-2: Playwright Electron E2Eテスト（skill:remove）

skill:remove IPCハンドラのElectron E2Eテストを実装し、IPC通信の正常性とバリデーション規則を検証する。

| 項目           | 内容                                                                     |
| -------------- | ------------------------------------------------------------------------ |
| 配置先         | `apps/desktop/e2e/ipc-skill-remove.spec.ts`                              |
| テストケース数 | 正常系1件 + 異常系3件 = 計4件                                            |
| 検証対象       | P42準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）       |
| 回帰防止       | P44（IPCインターフェース不整合）、P45（引数命名ドリフト）                |
| Electron起動   | `_electron.launch({ args: ['.'] })` でアプリを起動                       |
| IPC検証方法    | `page.evaluate(() => window.electronAPI.skill.remove(skillName))` で検証 |

### FR-3: Playwright Electron E2Eテスト（skill:import）

skill:import IPCハンドラのElectron E2Eテストを実装し、複数スキル名のインポートと異常系ハンドリングを検証する。

| 項目           | 内容                                                                     |
| -------------- | ------------------------------------------------------------------------ |
| 配置先         | `apps/desktop/e2e/ipc-skill-import.spec.ts`                              |
| テストケース数 | 正常系1件 + 異常系3件 = 計4件                                            |
| 検証対象       | P42準拠3段バリデーション、不正スキル名のエラーレスポンス                 |
| 回帰防止       | P44（IPCインターフェース不整合）                                         |
| Electron起動   | FR-2と同一のパターンを共有（テストヘルパーで共通化）                     |
| IPC検証方法    | `page.evaluate(() => window.electronAPI.skill.import(skillName))` で検証 |

### FR-4: Playwright Electron設定更新

既存の Playwright 設定に Electron E2E テスト用の新規プロジェクトを追加し、既存の chromium プロジェクトへの影響を避ける。

| 項目         | 内容                                                                             |
| ------------ | -------------------------------------------------------------------------------- |
| 配置先       | `apps/desktop/playwright.config.ts`                                              |
| 追加設定     | Electron E2E用プロジェクト: `name: "electron-e2e"`                               |
| タイムアウト | テスト単体: 30秒、Electronアプリ起動: 60秒                                       |
| リトライ     | CI環境: 2回、ローカル: 0回                                                       |
| レポーター   | HTMLレポーター（既存）+ JUnit XMLレポーター（CI用）                              |
| 制約         | 既存chromiumプロジェクトを破壊しない、P40対策として `apps/desktop/` から実行前提 |

### FR-5: CI/CDワークフロー E2Eジョブ追加

GitHub Actions ワークフロー（`.github/workflows/ci.yml`）に Electron E2E テスト実行ジョブを追加し、ubuntu-latest + xvfb-run 環境でのヘッドレス実行を実現する。

| 項目             | 内容                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| 配置先           | `.github/workflows/ci.yml`                                                                             |
| ジョブ名         | `e2e-desktop`                                                                                          |
| 実行環境         | `ubuntu-latest` + `xvfb-run --auto-servernum` でheadless Electronを起動                                |
| 依存ジョブ       | `build-shared`（shared packageビルド完了後に実行）                                                     |
| 実行条件         | `paths` フィルタで `apps/desktop/` または `packages/shared/` の変更時のみ                              |
| 実行コマンド     | `xvfb-run --auto-servernum -- pnpm --filter @repo/desktop exec playwright test --project=electron-e2e` |
| タイムアウト     | ジョブ全体: 15分                                                                                       |
| アーティファクト | テスト結果レポート、スクリーンショット（失敗時のみ）をアップロード                                     |

### FR-6: Phase 11テンプレート更新

Phase 11テンプレート（`.claude/skills/task-specification-creator/references/phase-11-12-guide.md`）に「Worktree環境テスト手順」セクションを追加し、新規タスク作成時の標準手順として機能させる。

| 項目     | 内容                                                                                       |
| -------- | ------------------------------------------------------------------------------------------ |
| 配置先   | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                |
| 追加位置 | Phase 11セクションの「実行フロー」の直後、「テスト結果レポート形式」の直前                 |
| 追加内容 | Worktree環境判定方法、Layer 1-3テスト手順、deferred-tests.md記録手順、条件付きPASS判定基準 |
| 適用範囲 | 新規タスクのPhase 11仕様書作成時から適用（既存仕様書の遡及修正は行わない）                 |

### FR-7: 未実施テスト追跡テンプレート（deferred-tests.md）

Worktree環境でスキップしたLayer 3テストケースを記録・追跡するテンプレートを作成し、Phase 13との連携により未完了項目を可視化する。

| 項目         | 内容                                                                                     |
| ------------ | ---------------------------------------------------------------------------------------- |
| 配置先       | `outputs/phase-5/deferred-tests-template.md`                                             |
| 記録項目     | テストケースID、テスト名、スキップ理由、実行予定環境、実行期限、完了ステータス           |
| ワークフロー | Phase 11でスキップ → PR本文に未実施テスト数記載 → メインリポジトリマージ後にCI実行で完了 |
| Phase 13連携 | `deferred-tests.md` の未完了項目が0件であることをPhase 13の完了条件に追加                |

---

## 非機能要件（NFR）サマリー

### NFR-1: E2Eテスト信頼性

E2Eテストが決定論的に成功/失敗し、フレイキーテスト（同一テストが時々失敗する現象）が0件であること。

| 項目     | 内容                                                                                    |
| -------- | --------------------------------------------------------------------------------------- |
| 要件     | フレイキーテスト0件                                                                     |
| 検証方法 | CI環境（ubuntu-latest + xvfb-run）で同一コミットに対して3回連続実行し、全て同一結果     |
| 対策     | 各テストでElectronアプリを新規起動・終了、明示的なwait条件使用（`waitForTimeout` 禁止） |

### NFR-2: E2Eテスト実行時間

E2Eテスト全体（FR-2 + FR-3の8テストケース）がCI環境で60秒以内に完了すること。

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| 要件     | Electron E2E実行時間がCI環境で60秒以内                |
| 検証方法 | GitHub Actions実行ログの `e2e-desktop` ジョブ時間計測 |
| 根拠     | 既存CIのテストジョブタイムアウトが15分に対応          |

### NFR-3: テスト保守性

新規IPCハンドラのE2Eテスト追加時に、テストヘルパー関数を再利用でき、新規テストコード量が50行以内に収まること。

| 項目     | 内容                                                               |
| -------- | ------------------------------------------------------------------ |
| 要件     | ヘルパー関数の再利用可能性、新規テスト追加コード量50行以内         |
| 検証方法 | テストヘルパーが `apps/desktop/e2e/helpers/electron-app.ts` に抽出 |
| 基準     | 新規IPCハンドラE2Eテスト追加に必要なコード行数をカウント           |

### NFR-4: 環境互換性

E2Eテストがメインリポジトリ（`apps/desktop/` ディレクトリ）とCI環境（ubuntu-latest）の両方で実行可能であること。

| 項目     | 内容                                                                         |
| -------- | ---------------------------------------------------------------------------- |
| 要件     | ローカル + CI環境の両方で全テストPASS                                        |
| 検証方法 | `cd apps/desktop && pnpm exec playwright test --project=electron-e2e` を実行 |
| P40対策  | テスト実行は `apps/desktop/` ディレクトリからのみ（プロジェクトルート不可）  |

### NFR-5: CI安定性（xvfb-run固有）

`xvfb-run` によるヘッドレスElectron起動がCI環境で安定的に動作すること。

| 項目           | 内容                                                               |
| -------------- | ------------------------------------------------------------------ |
| 要件           | `xvfb-run` によるheadless Electron起動が安定                       |
| 検証方法       | `xvfb-run --auto-servernum` でElectronが起動し、テスト完了すること |
| フォールバック | `xvfb-run` 失敗時はジョブをスキップ（CI全体をブロックしない）      |

---

## 受入基準（AC）サマリー

| ID    | 受入基準（要点）                                                         | 対応要件    | テスト方法             |
| ----- | ------------------------------------------------------------------------ | ----------- | ---------------------- |
| AC-01 | Worktreeプロトコル文書がLayer 1-3の3層テスト戦略を定義                   | FR-1        | ドキュメントレビュー   |
| AC-02 | skill:remove E2Eテストが正常系1件・異常系3件の計4件含む                  | FR-2        | `playwright test` 実行 |
| AC-03 | skill:import E2Eテストが正常系1件・異常系3件の計4件含む                  | FR-3        | `playwright test` 実行 |
| AC-04 | E2EテストがElectronアプリを起動してIPC通信を検証                         | FR-2, FR-3  | テストコードレビュー   |
| AC-05 | E2EテストがP42準拠3段バリデーションを検証                                | FR-2, FR-3  | テストコードレビュー   |
| AC-06 | Playwright設定に `electron-e2e` プロジェクトが追加（既存破壊なし）       | FR-4        | 設定ファイルレビュー   |
| AC-07 | `.github/workflows/ci.yml` に `e2e-desktop` ジョブ追加                   | FR-5        | CI設定レビュー         |
| AC-08 | `e2e-desktop` ジョブが `paths` フィルタで実行条件制御                    | FR-5        | CI設定レビュー         |
| AC-09 | `e2e-desktop` ジョブが `xvfb-run --auto-servernum` を使用                | FR-5, NFR-5 | CI設定レビュー         |
| AC-10 | Phase 11テンプレートに「Worktree環境テスト手順」セクション追加           | FR-6        | テンプレートレビュー   |
| AC-11 | deferred-testsテンプレートが記録項目を含む                               | FR-7        | テンプレートレビュー   |
| AC-12 | deferred-tests.md の未完了項目0件がPhase 13完了条件に組み込み            | FR-7        | テンプレートレビュー   |
| AC-13 | E2Eテスト全体の実行時間がCI環境で60秒以内                                | NFR-2       | CI実行時間計測         |
| AC-14 | CI環境で3回連続実行して全て同一結果（フレイキーテスト0件）               | NFR-1       | 連続テスト実行         |
| AC-15 | テストヘルパーが `apps/desktop/e2e/helpers/electron-app.ts` に抽出       | NFR-3       | ファイル存在確認       |
| AC-16 | メインリポジトリで `cd apps/desktop && pnpm exec playwright test` 全PASS | NFR-4       | テスト実行             |

---

## スコープ確認

### 含むもの（7件）

1. **Worktreeプロトコル文書** - Layer 1-3テスト戦略を定義する手順書
2. **skill:remove Electron E2Eテスト** - `ipc-skill-remove.spec.ts`
3. **skill:import Electron E2Eテスト** - `ipc-skill-import.spec.ts`
4. **E2Eテストヘルパー** - `apps/desktop/e2e/helpers/electron-app.ts`（Electron起動・終了・IPC呼び出し共通化）
5. **Playwright設定更新** - `apps/desktop/playwright.config.ts` に `electron-e2e` プロジェクト追加
6. **CI/CDワークフロー更新** - `.github/workflows/ci.yml` に `e2e-desktop` ジョブ追加
7. **未実施テスト追跡テンプレート** - `deferred-tests-template.md` の新規作成

### 含まないもの（6件）

1. **既存Phase 11仕様書の遡及修正** - 適用は新規タスクのPhase 11仕様書作成時からとし、既存仕様書の変更は別タスク対応
2. **Worktree環境以外のテスト手順変更** - 本タスクはWorktree固有の制約への対応に限定
3. **Electronアプリ本体のビルドパイプライン構築** - Electronビルド・パッケージングは別タスク
4. **パフォーマンステスト・負荷テストの自動化** - 本タスクは機能テスト（IPC正常性確認）に限定
5. **skill:remove/import以外のIPCハンドラE2Eテスト** - 本タスクではP44/P45回帰防止対象の2ハンドラに限定
6. **Playwright `_electron.launch()` のmacOS/Windows固有設定** - CI環境（ubuntu-latest）での動作を優先

---

## 影響範囲分析

### 新規作成ファイル（4件）

| ファイル                                     | 内容                                    |
| -------------------------------------------- | --------------------------------------- |
| `apps/desktop/e2e/ipc-skill-remove.spec.ts`  | skill:remove Electron E2Eテスト         |
| `apps/desktop/e2e/ipc-skill-import.spec.ts`  | skill:import Electron E2Eテスト         |
| `apps/desktop/e2e/helpers/electron-app.ts`   | Electron起動・終了・IPC呼び出しヘルパー |
| `outputs/phase-5/deferred-tests-template.md` | 未実施テスト追跡テンプレート            |

### 更新ファイル（3件）

| ファイル                                                                    | 影響内容                             |
| --------------------------------------------------------------------------- | ------------------------------------ |
| `apps/desktop/playwright.config.ts`                                         | `electron-e2e` プロジェクト追加      |
| `.github/workflows/ci.yml`                                                  | `e2e-desktop` ジョブ追加             |
| `.claude/skills/task-specification-creator/references/phase-11-12-guide.md` | Worktree環境テスト手順セクション追加 |

### 関連Pitfall対策（6件）

| Pitfall ID | リスク                                        | 本タスク対策                                             |
| ---------- | --------------------------------------------- | -------------------------------------------------------- |
| **P7**     | ネイティブモジュールのバイナリ不一致          | Layer 3をCI/メインリポジトリに委譲、Worktreeでは実行禁止 |
| **P11**    | PostToolUseフックによるEdit失敗               | 大量編集後は `git diff --stat` で変更数を検証            |
| **P40**    | テスト実行ディレクトリ依存（モノレポ）        | E2E実行時に `cd apps/desktop &&` プレフィックス使用      |
| **P42**    | 文字列引数の `.trim()` バリデーション漏れ     | スペースのみ文字列（`"   "`）の拒否を明示的に検証        |
| **P44**    | skill:import/remove IPCインターフェース不整合 | stringパラメータでのIPC通信成功を回帰テスト              |
| **P45**    | IPC引数命名の契約ドリフト                     | skillName引数でのIPC通信正常動作を回帰テスト             |

---

## 依存関係とサブタスク管理

### サブタスク実行順序

| サブタスク                     | 対応FR     | 依存関係                     | 実行順序 |
| ------------------------------ | ---------- | ---------------------------- | -------- |
| E2Eテストヘルパー実装          | FR-2, FR-3 | FR-4（Playwright設定）に依存 | 1-1      |
| Playwright設定更新             | FR-4       | なし（独立実行可能）         | 1-0      |
| skill:remove E2Eテスト実装     | FR-2       | ヘルパーに依存               | 1-2      |
| skill:import E2Eテスト実装     | FR-3       | ヘルパーに依存               | 1-2      |
| プロトコル文書作成             | FR-1       | なし（独立実行可能）         | 1-0      |
| Phase 11テンプレート更新       | FR-6       | FR-1に依存                   | 1-3      |
| deferred-testsテンプレート作成 | FR-7       | なし（独立実行可能）         | 1-0      |
| CI/CDワークフロー更新          | FR-5       | FR-4に依存                   | 1-1      |

---

## 参照資料

### プロジェクトルール

| リソース                   | パス                                                          |
| -------------------------- | ------------------------------------------------------------- |
| Phase 1-13ワークフロー定義 | `.claude/rules/05-task-execution.md`                          |
| 既知の落とし穴             | `.claude/rules/06-known-pitfalls.md` (P7, P40, P42, P44, P45) |
| コード品質ルール           | `.claude/rules/02-code-quality.md`                            |
| Electronセキュリティ       | `.claude/rules/04-electron-security.md`                       |

### テンプレート・ガイド

| リソース                | パス                                                                          |
| ----------------------- | ----------------------------------------------------------------------------- |
| Phase 11/12テンプレート | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`   |
| IPC契約チェックリスト   | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` |
| Playwright E2E仕様      | `.claude/skills/aiworkflow-requirements/references/testing-playwright-e2e.md` |

### 実装参考資料

| リソース                  | パス                                        |
| ------------------------- | ------------------------------------------- |
| 既存Playwright設定        | `apps/desktop/playwright.config.ts`         |
| 既存CIワークフロー        | `.github/workflows/ci.yml`                  |
| 既存E2Eテスト例           | `apps/desktop/e2e/skill-permission.spec.ts` |
| E2Eグローバルセットアップ | `apps/desktop/e2e/global-setup.ts`          |

---

## 多角的チェック観点

### テスト3層分類の明確化

- Layer 1（自動テスト）: Worktree環境で実行可能 ✓
- Layer 2（静的コード検証）: Worktree環境で実行可能 ✓
- Layer 3（UI/E2E）: CI/メインリポジトリのみ（Worktreeでは実行禁止） ✓

### IPC契約整合性

- E2Eテストがstring引数（単一スキル名）でIPC通信を実施
- P44/P45修正が回帰しないことを検証

### CI安定性

- `xvfb-run` によるheadless Electron起動が3回連続で成功
- フレイキーテスト0件

### 既存CIとの共存

- `e2e-desktop` ジョブ追加が既存ジョブ（lint, typecheck, test）に影響しない
- `paths` フィルタで選択的実行

### P40対策（テスト実行ディレクトリ依存）

- テスト実行コマンドが `cd apps/desktop &&` プレフィックスまたは `pnpm --filter @repo/desktop exec` を含む

### テンプレート互換性

- Phase 11テンプレート更新が既存のテスト結果レポート形式と整合

---

## 完了条件（タスク100%実行確認）

### Task 1: 機能要件定義

- [x] FR-1～FR-7の7件が全て定義されている
  - FR-1: テスト3層分類プロトコル文書
  - FR-2: skill:remove E2Eテスト
  - FR-3: skill:import E2Eテスト
  - FR-4: Playwright設定更新
  - FR-5: CI/CDワークフロー更新
  - FR-6: Phase 11テンプレート更新
  - FR-7: deferred-testsテンプレート作成

### Task 2: 非機能要件定義

- [x] NFR-1～NFR-5の5件が全て定義されている
  - NFR-1: テスト信頼性（フレイキーテスト0件）
  - NFR-2: 実行時間（60秒以内）
  - NFR-3: 保守性（新規テスト追加50行以内）
  - NFR-4: 環境互換性（ローカル + CI）
  - NFR-5: CI安定性（xvfb-run安定動作）

### Task 3: 受入基準定義

- [x] AC-01～AC-16の16件が全て定義されている

### Task 4: スコープ確認

- [x] 含むもの7件が明文化されている
- [x] 含まないもの6件が明文化されている

### Task 5: 影響範囲分析

- [x] 新規作成ファイル4件が分析されている
- [x] 更新ファイル3件が分析されている
- [x] 関連Pitfall 6件（P7, P11, P40, P42, P44, P45）が対策されている

---

## 次のPhase

**Phase 2: 設計**

タスク目的：

- FR-1～FR-7の各機能要件について、実装設計書（アーキテクチャ、ファイル構成、データフロー）を作成する
- テスト3層分類（Layer 1-3）の具体的な実装方針を設計する
- E2Eテストのヘルパー関数仕様、Playwright設定の詳細を設計する
- CI/CDワークフローの詳細ジョブ設定を設計する

次ファイル: `phase-2-design.md`

---

**作成日時:** 2026-03-01 20:55
**作成者:** Phase 1エージェント（要件定義）
**ステータス:** 完了
