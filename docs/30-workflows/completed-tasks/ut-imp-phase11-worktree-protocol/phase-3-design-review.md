# Phase 3: 設計レビュー -- Phase 11 Worktree環境テストプロトコル標準化

## メタ情報

| 項目      | 内容                                                                                        |
| --------- | ------------------------------------------------------------------------------------------- |
| タスクID  | UT-IMP-PHASE11-WORKTREE-PROTOCOL-001                                                        |
| Phase     | 3                                                                                           |
| タスク名  | Phase 11 Worktree環境テストプロトコル標準化                                                 |
| 作成日    | 2026-03-01                                                                                  |
| Issue     | #853                                                                                        |
| 依存Phase | Phase 1（要件定義）, Phase 2（設計）                                                        |
| 目的      | Phase 1（要件）とPhase 2（設計）の成果物を多角的に検証し、Phase 4以降への進行可否を判定する |

## 目的

Phase 1で固定した7つの機能要件（FR-1～FR-7）、5つの非機能要件（NFR-1～NFR-5）、16件の受入基準（AC-01～AC-16）と、Phase 2で作成した6つの設計タスク（Task 1～Task 6）の整合性・妥当性・実現可能性を検証する。テスト3層分類の網羅性、Playwright Electron E2E設計の実現可能性、CI/CDパイプラインの安定性、未実施テスト追跡の完全性、セキュリティ観点、要件と設計の整合性、Electron固有の観点の7つのレビュー観点から検証を行い、PASS/MINOR/MAJORの判定を決定する。

## 実行タスク

- Task 1: テスト3層分類の妥当性レビュー -- Layer 1-3の分類基準・テスト項目網羅性・判定フローを検証する
- Task 2: Playwright Electron E2E設計レビュー -- テストヘルパー・テストケース・Electron起動設定の実現可能性を検証する
- Task 3: CI/CDパイプライン設計レビュー -- e2e-desktopジョブ構成・既存ジョブ共存・xvfb-run安定性を検証する
- Task 4: 未実施テスト追跡の完全性レビュー -- deferred-tests.mdテンプレート・ワークフロー・Phase 13連携を検証する
- Task 5: セキュリティ・Electron固有観点レビュー -- IPC契約検証設計・BrowserWindowセキュリティ・Preload API安全性を検証する
- Task 6: 要件と設計の整合性レビュー -- FR/NFR/ACとPhase 2設計の対応漏れ・矛盾を検証する
- Task 7: Pitfall対策レビュー -- P7, P9, P11, P40, P42, P44, P45の対策が設計に反映されていることを検証する
- Task 8: ゲート判定 -- 全レビュー観点の結果を総合してPhase 4進行可否を決定する

---

### Task 1: テスト3層分類の妥当性レビュー

| ID     | チェック項目                                                                                                                                                                | 判定 |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| CLS-01 | Layer 1（自動テスト検証）の5つのテスト項目（ユニットテスト/IPC通信/Store統合/エラーハンドリング/カバレッジ）がWorktree環境で全て実行可能である                              | [ ]  |
| CLS-02 | Layer 2（静的コード検証）の6つの検証項目（TypeScript型チェック/ESLint/IPC契約整合性/セキュリティ設定/ARIA属性/Preload APIホワイトリスト）がWorktree環境で全て実行可能である | [ ]  |
| CLS-03 | Layer 3（UI/E2Eテスト）の4つのテスト項目（Electron起動/skill:remove E2E/skill:import E2E/UI操作）がWorktree環境で実行不可能な根拠が明確である                               | [ ]  |
| CLS-04 | Layer 1とLayer 3の間にグレーゾーン（分類が曖昧なテスト）が存在しない -- 各テスト項目がLayer 1/2/3のいずれか1つに一意に属する                                                | [ ]  |
| CLS-05 | 3層の合計が従来のPhase 11テストカテゴリ（機能テスト、UI/UXテスト、統合テスト、リグレッションテスト）を100%カバーしている                                                    | [ ]  |
| CLS-06 | Layer 1の判定基準（全テストPASS/カバレッジLine 80%以上・Branch 60%以上）が `quality-requirements.md` の品質基準と整合している                                               | [ ]  |
| CLS-07 | 判定フロー（Layer 1 -> Layer 2 -> Layer 3記録 -> CI実行）の条件分岐4パターンが漏れなく定義されている                                                                        | [ ]  |
| CLS-08 | Layer 1の実行コマンドが全て `cd apps/desktop &&` プレフィックスで始まっている（P40対策）                                                                                    | [ ]  |

---

### Task 2: Playwright Electron E2E設計レビュー

| ID     | チェック項目                                                                                                                                          | 判定 |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| E2E-01 | `_electron.launch()` の設定パラメータ（`args: ["."]`, `cwd: process.cwd()`, `timeout: 60_000`）がプロジェクトのElectronバージョンと互換性がある       | [ ]  |
| E2E-02 | テストヘルパー `helpers/electron-app.ts` の3つの関数（`launchElectronApp`, `closeElectronApp`, `invokeIPC`）のシグネチャとJSDocが明確に定義されている | [ ]  |
| E2E-03 | `invokeIPC()` 関数が `window.electronAPI` 配下のドット区切りAPIパスを正しく解決する設計になっている                                                   | [ ]  |
| E2E-04 | `invokeIPC()` 関数がAPIパス不正（`undefined`/`null`/関数でない）時に明確なエラーメッセージをスローする                                                | [ ]  |
| E2E-05 | skill:remove E2Eテスト（TC-R01～TC-R04）の4テストケースがFR-2の要件（正常系1件・異常系3件）を全てカバーしている                                       | [ ]  |
| E2E-06 | skill:import E2Eテスト（TC-I01～TC-I04）の4テストケースがFR-3の要件（正常系1件・異常系3件）を全てカバーしている                                       | [ ]  |
| E2E-07 | 異常系テスト（TC-R02/TC-R03/TC-I02/TC-I03）がP42準拠3段バリデーション（空文字列 + スペースのみ文字列）を検証している                                  | [ ]  |
| E2E-08 | 各テストが `beforeEach` で `launchElectronApp()` / `afterEach` で `closeElectronApp()` を呼び出し、テスト間の状態隔離（P9対策）が保証されている       | [ ]  |
| E2E-09 | テスト用環境変数（`NODE_ENV: "test"`, `ELECTRON_IS_E2E: "true"`）が既存コードの動作に影響しない設計になっている                                       | [ ]  |
| E2E-10 | `page.waitForLoadState("domcontentloaded")` で明示的なwait条件を使用し、`waitForTimeout()` を使用していない（NFR-1対策）                              | [ ]  |
| E2E-11 | テストケースの操作と期待結果が、実装者が迷わず実装できる粒度で記述されている                                                                          | [ ]  |
| E2E-12 | Electron 3プロセスモデル（Main/Preload/Renderer）とE2Eテストの対応関係が明確に定義されている                                                          | [ ]  |

---

### Task 3: CI/CDパイプライン設計レビュー

| ID     | チェック項目                                                                                                                                                            | 判定 |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| CIC-01 | `e2e-desktop` ジョブの `needs: [build-shared]` が現行CIジョブ構成の `build-shared` ジョブと整合している                                                                 | [ ]  |
| CIC-02 | `xvfb-run --auto-servernum` がubuntu-latestで安定動作する実績がある（GitHub Actionsの一般的なパターンとして確認）                                                       | [ ]  |
| CIC-03 | `timeout-minutes: 15` がElectron起動（最大60秒） + E2Eテスト実行（最大60秒、NFR-2） + アーティファクト保存に十分な余裕がある                                            | [ ]  |
| CIC-04 | Playwright Chromiumインストールコマンド（`playwright install --with-deps chromium`）がCI環境で正常に動作する設計になっている                                            | [ ]  |
| CIC-05 | `Download shared build artifact` ステップが `build-shared` ジョブの `upload-artifact` と同じ `name: shared-build` / `path: packages/shared/dist/` を参照している        | [ ]  |
| CIC-06 | `Build desktop app for E2E` ステップが E2Eテスト実行に必要なビルド成果物を生成する                                                                                      | [ ]  |
| CIC-07 | E2Eテスト実行コマンドが `cd apps/desktop` + `pnpm exec playwright test --project=electron-e2e` で、P40対策が反映されている                                              | [ ]  |
| CIC-08 | テスト結果アーティファクト（`playwright-report/` + `test-results/`）が `if: always()` で失敗時も保存される設計になっている                                              | [ ]  |
| CIC-09 | `e2e-desktop` ジョブを `build` ジョブの `needs` に追加しない理由（非ブロッキング設計）が妥当である                                                                      | [ ]  |
| CIC-10 | 既存9ジョブ（lint/typecheck/build-shared/test-shared/test-desktop/check-module-sync/security/coverage/build）への影響が全て「影響なし」である根拠が個別に分析されている | [ ]  |
| CIC-11 | `retention-days: 7` がデバッグに十分な保持期間である                                                                                                                    | [ ]  |
| CIC-12 | フレイキーテスト対策（retries: 2 + screenshot: only-on-failure + テスト状態隔離 + 明示的wait + Electronタイムアウト60秒）が十分かつ過剰でない                           | [ ]  |

---

### Task 4: 未実施テスト追跡の完全性レビュー

| ID     | チェック項目                                                                                                                                | 判定 |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| DFT-01 | `deferred-tests-template.md` の全フィールド（ID/テスト名/カテゴリ/スキップ理由/実行予定環境/期限/ステータス）が追跡に十分な情報を含んでいる | [ ]  |
| DFT-02 | ステータス定義（未実施/CI実行待ち/PASS/FAIL）の遷移ルールが明確に定義されている                                                             | [ ]  |
| DFT-03 | Phase 13完了条件への統合（`deferred-tests.md` の未完了項目が0件であること）が未実施テストの取りこぼしを防止できる                           | [ ]  |
| DFT-04 | ワークフロー設計（Phase 11記録 -> Phase 12成果物 -> Phase 13完了条件 -> PRマージ後CI実行）の4ステップが連携している                         | [ ]  |
| DFT-05 | `deferred-tests.md` が空（Layer 3テストゼロ件）のケースが想定されている                                                                     | [ ]  |
| DFT-06 | 複数タスクが同時に `deferred-tests.md` を持つ場合の管理方法が明確である（各タスクの `outputs/phase-11/` 配下に個別ファイル）                | [ ]  |
| DFT-07 | FAIL項目発生時の対応フロー（修正タスク起票）が定義されている                                                                                | [ ]  |
| DFT-08 | PR本文への「未実施テスト: N件（deferred-tests.md参照）」の記載手順がPhase 13と連携している                                                  | [ ]  |

---

### Task 5: セキュリティ・Electron固有観点レビュー

| ID     | チェック項目                                                                                                                                              | 判定 |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| SEC-01 | E2Eテストが、テスト用の認証情報やAPIキーをソースコードに含んでいない                                                                                      | [ ]  |
| SEC-02 | テスト環境変数（`ELECTRON_IS_E2E: "true"`）が本番環境で誤って有効にならない設計になっている（`NODE_ENV: "test"` との組み合わせで制御）                    | [ ]  |
| SEC-03 | IPC通信E2Eテストが、セキュリティ検証（Sender検証 / contextIsolation）を回避せずにPreload API経由でテストしている                                          | [ ]  |
| SEC-04 | CI/CDワークフローが不必要なPermission（write権限等）を要求していない                                                                                      | [ ]  |
| SEC-05 | Layer 2のセキュリティ設定確認チェックリストがBrowserWindow必須設定3つ（contextIsolation=true / nodeIntegration=false / sandbox=true）を全てカバーしている | [ ]  |
| SEC-06 | Layer 2のPreload APIホワイトリスト確認が `contextBridge.exposeInMainWorld` で公開されたAPIの `IPC_CHANNELS` 定数使用を検証している                        | [ ]  |
| SEC-07 | `electron-e2e` プロジェクトの `storageState: undefined` 設定が、認証情報の不要な露出を防止している                                                        | [ ]  |
| SEC-08 | E2Eテストが `page.evaluate()` 経由でRenderer -> Preload -> Main のフルスタックパスを検証し、レイヤーをバイパスしていない                                  | [ ]  |

---

### Task 6: 要件と設計の整合性レビュー

| ID     | チェック項目                                                                                                               | 判定 |
| ------ | -------------------------------------------------------------------------------------------------------------------------- | ---- |
| ALN-01 | FR-1（テスト3層分類プロトコル文書）がPhase 2 Task 1（テスト3層分類プロトコル設計）で設計されている                         | [ ]  |
| ALN-02 | FR-2（skill:remove E2Eテスト）がPhase 2 Task 2（E2Eテストアーキテクチャ設計）で設計されている                              | [ ]  |
| ALN-03 | FR-3（skill:import E2Eテスト）がPhase 2 Task 2（E2Eテストアーキテクチャ設計）で設計されている                              | [ ]  |
| ALN-04 | FR-4（Playwright設定更新）がPhase 2 Task 4（Playwright設定更新設計）で設計されている                                       | [ ]  |
| ALN-05 | FR-5（CI/CDワークフロー E2Eジョブ追加）がPhase 2 Task 3（CI/CDパイプライン設計）で設計されている                           | [ ]  |
| ALN-06 | FR-6（Phase 11テンプレート更新）がPhase 2 Task 5（Phase 11テンプレート追加設計）で設計されている                           | [ ]  |
| ALN-07 | FR-7（deferred-tests.md テンプレート）がPhase 2 Task 6（deferred-tests.md テンプレート設計）で設計されている               | [ ]  |
| ALN-08 | NFR-1（E2Eテスト信頼性）の「フレイキーテスト0件」要件がPhase 2のフレイキーテスト対策5項目で対応されている                  | [ ]  |
| ALN-09 | NFR-2（E2Eテスト実行時間）の「CI環境で60秒以内」要件がPhase 2のCI設計（timeout-minutes: 15）で許容範囲内である             | [ ]  |
| ALN-10 | NFR-3（テスト保守性）の「ヘルパー再利用で50行以内」要件がPhase 2のヘルパー設計（3関数抽出）で実現可能である                | [ ]  |
| ALN-11 | NFR-4（環境互換性）の「メインリポジトリとCI両方で実行可能」要件がPhase 2のP40対策設計で対応されている                      | [ ]  |
| ALN-12 | NFR-5（CI安定性）の「xvfb-run安定動作」要件がPhase 2のCIジョブ設計（xvfb-run --auto-servernum）で対応されている            | [ ]  |
| ALN-13 | AC-01～AC-16の全16件がPhase 2の設計で全て検証可能な状態である                                                              | [ ]  |
| ALN-14 | Phase 1のP40対策要件がPhase 2のE2Eテスト設計（`cwd: process.cwd()` + `cd apps/desktop &&` プレフィックス）に反映されている | [ ]  |
| ALN-15 | Phase 1のElectron固有要件（3プロセスモデル準拠）がPhase 2のE2Eテスト設計（Main/Preload/Renderer対応表）に反映されている    | [ ]  |

---

### Task 7: Pitfall対策レビュー

| ID     | チェック項目                                                                                                                                           | 判定 |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- |
| PIT-01 | P7（ネイティブモジュールのバイナリ不一致）: Worktree環境でのElectron起動不可がLayer 3のCI委譲で対応されている                                          | [ ]  |
| PIT-02 | P9（モジュールスコープ変数のテスト間リーク）: 各テストでElectronアプリを新規起動・終了するテスト状態隔離が設計されている                               | [ ]  |
| PIT-03 | P11（PostToolUseフックによるEdit失敗）: Phase 5実装時の大量編集に対する検証手順（`git diff --stat` 確認）が移行計画に含まれる前提である                | [ ]  |
| PIT-04 | P40（テスト実行ディレクトリ依存）: E2Eテスト実行コマンドが全て `cd apps/desktop &&` または `pnpm --filter @repo/desktop exec` パターンで設計されている | [ ]  |
| PIT-05 | P42（.trim()バリデーション漏れ）: E2Eテストケース（TC-R02/TC-R03/TC-I02/TC-I03）がスペースのみ文字列拒否を明示的に検証している                         | [ ]  |
| PIT-06 | P44（skill:import/remove IPCインターフェース不整合）: E2Eテストがstring引数（単一スキル名）でのIPC通信成功を回帰テストしている                         | [ ]  |
| PIT-07 | P45（IPC引数命名の契約ドリフト）: E2EテストがskillName引数でのIPC通信が正常動作することを検証し、引数名の意味と実際の値が一致している                  | [ ]  |

---

### Task 8: ゲート判定

#### 判定基準

| 判定              | 条件                                                                | 対応                  |
| ----------------- | ------------------------------------------------------------------- | --------------------- |
| PASS              | 全チェック項目（CLS/E2E/CIC/DFT/SEC/ALN/PIT）が合格                 | Phase 4 へ            |
| MINOR             | 軽微な修正で対応可能な指摘がある（機能影響なし、Phase 5で対応可能） | 指摘対応後 Phase 4 へ |
| MAJOR（要件問題） | FR/NFR/ACの欠落・矛盾がある（ALN不合格）                            | Phase 1 へ戻る        |
| MAJOR（設計問題） | 設計に根本的な誤りがある（CLS/E2E/CIC/DFT/SEC不合格）               | Phase 2 へ戻る        |

#### MAJOR判定の具体例

- テスト3層分類に分類不能なテスト項目がある（CLS不合格）
- `_electron.launch()` の設定がElectronバージョンと非互換（E2E不合格）
- `e2e-desktop` ジョブが既存CIジョブをブロックする（CIC不合格）
- deferred-tests追跡ワークフローにテスト漏れの経路がある（DFT不合格）
- E2Eテストがセキュリティレイヤーをバイパスしている（SEC不合格）
- FR/NFRに対応する設計が存在しない（ALN不合格）
- Pitfall対策が設計に未反映（PIT不合格）

---

## 参照資料

| 参照資料                  | パス                                                                        | 内容                             |
| ------------------------- | --------------------------------------------------------------------------- | -------------------------------- |
| Phase 1 要件定義          | `phase-1-requirements.md`                                                   | FR-1～FR-7、NFR-1～NFR-5、AC定義 |
| Phase 2 設計              | `phase-2-design.md`                                                         | Task 1-6の設計書                 |
| 受入基準一覧              | `outputs/phase-1/acceptance-criteria.md`                                    | AC-01～AC-16                     |
| 既存Playwright設定        | `apps/desktop/playwright.config.ts`                                         | 現行のPlaywright E2E設定         |
| 既存CIワークフロー        | `.github/workflows/ci.yml`                                                  | 現行のCIジョブ構成（9ジョブ）    |
| 既存E2Eテスト             | `apps/desktop/e2e/skill-permission.spec.ts`                                 | 既存E2Eテストのパターン参照      |
| E2Eグローバルセットアップ | `apps/desktop/e2e/global-setup.ts`                                          | 既存のElectronAPIモック初期化    |
| Phase 11/12テンプレート   | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md` | テンプレート追加先               |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                         | 内容                                |
| ------------------ | ---------------------------------------------------------------------------- | ----------------------------------- |
| アーキテクチャ概要 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | Electron 3プロセスモデル            |
| IPC仕様            | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | IPCセキュリティ原則・チャンネル管理 |
| 品質要件           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | テスト・カバレッジ基準              |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | IPC失敗時のエラー契約               |
| DevOps・CI/CD      | `.claude/skills/aiworkflow-requirements/references/technology-devops.md`     | GitHub Actionsジョブ構成            |
| 既知の落とし穴     | `.claude/rules/06-known-pitfalls.md`                                         | P7/P9/P11/P40/P42/P44/P45関連       |

## 統合テスト連携

| 連携観点                     | 確認内容                                                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Phase 4テスト設計連携        | CLS/E2E/CIC/DFT/SEC/ALN/PITの判定結果がPhase 4テストケースへ反映されること                                               |
| Layer 3 E2E -> CI回帰テスト  | E2E設計レビュー（E2E-01～E2E-12）がPhase 4のテストコード設計に接続されること                                             |
| deferred-tests -> Phase 13   | DFT判定結果がPhase 13の完了条件テンプレートに反映されること                                                              |
| 既存CI共存 -> CI安定性テスト | CIC判定結果が既存ジョブとの共存テスト（Phase 4でのCI設定テスト）に接続されること                                         |
| 未タスク連携                 | MINOR指摘がある場合に未タスク化3ステップ（指示書作成 -> 残課題テーブル登録 -> 関連仕様書リンク追加）へ即時連携できること |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                              | 仕様参照先                                       |
| ------------------ | ----------------------------------------------------- | ------------------------------------------------ |
| セキュリティ       | 必須（Task 5で専用レビュー）                          | aiworkflow-requirements: security-\*.md          |
| UI/UX              | Layer 3設計レビューのみ適用                           | aiworkflow-requirements: ui-ux-\*.md             |
| アーキテクチャ     | 必須（3層分類・Electron 3プロセスモデルの妥当性）     | aiworkflow-requirements: architecture-\*.md      |
| API設計            | 必須（IPC契約検証設計の妥当性）                       | aiworkflow-requirements: api-\*.md               |
| データ整合性       | 非該当（DB変更なし）                                  | -                                                |
| エラーハンドリング | 必須（E2Eテストのエラー検証設計の妥当性）             | aiworkflow-requirements: error-handling.md       |
| パフォーマンス     | 必須（CI実行時間制約NFR-2の妥当性）                   | aiworkflow-requirements: quality-requirements.md |
| アクセシビリティ   | Layer 2 ARIA属性確認設計の妥当性のみ                  | aiworkflow-requirements: ui-ux-\*.md             |
| テスタビリティ     | 必須（テスト3層分類・テストヘルパー再利用性の妥当性） | aiworkflow-requirements: quality-requirements.md |

### Electronデスクトップアプリ観点

| 層                         | 適用判断                                 | 仕様参照先                                             |
| -------------------------- | ---------------------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | E2Eテスト `page.evaluate()` 設計レビュー | aiworkflow-requirements: interfaces-agent-sdk-skill.md |
| バックエンド（Main）       | E2E Electron起動設定レビューで必須       | aiworkflow-requirements: arch-electron-services.md     |
| IPC通信                    | Layer 1テスト/E2E設計レビューで必須      | aiworkflow-requirements: api-ipc-agent.md              |
| Preload/セキュリティ       | Layer 2静的検証/SEC設計レビューで必須    | aiworkflow-requirements: security-api-electron.md      |
| ローカルストレージ         | 非該当（ストレージ変更なし）             | -                                                      |

## 実行手順

1. Phase 1成果物（要件定義書、受入基準AC-01～AC-16、スコープ定義）を確認する
2. Phase 2成果物（設計書Task 1-6）を確認する
3. Task 1（CLS-01～CLS-08）のレビュー項目を順番に検証する
4. Task 2（E2E-01～E2E-12）のレビュー項目を順番に検証する
5. Task 3（CIC-01～CIC-12）のレビュー項目を順番に検証する
6. Task 4（DFT-01～DFT-08）のレビュー項目を順番に検証する
7. Task 5（SEC-01～SEC-08）のレビュー項目を順番に検証する
8. Task 6（ALN-01～ALN-15）のレビュー項目を順番に検証する
9. Task 7（PIT-01～PIT-07）のレビュー項目を順番に検証する
10. Task 8でゲート判定結果（PASS/MINOR/MAJOR）を決定する
11. 成果物へレビュー結果を保存する

## 成果物

| 成果物                       | パス                                      |
| ---------------------------- | ----------------------------------------- |
| 設計レビュー書（本ファイル） | `phase-3-design-review.md`                |
| 設計レビュー結果報告書       | `outputs/phase-3/design-review-result.md` |
| レビュー指摘一覧             | `outputs/phase-3/review-findings.md`      |
| ゲート判定記録               | `outputs/phase-3/gate-decision.md`        |

## 完了条件

- [ ] CLS-01～CLS-08 のテスト3層分類妥当性チェックを全て確認した
- [ ] E2E-01～E2E-12 のPlaywright Electron E2E設計レビューを全て確認した
- [ ] CIC-01～CIC-12 のCI/CDパイプライン設計レビューを全て確認した
- [ ] DFT-01～DFT-08 の未実施テスト追跡完全性レビューを全て確認した
- [ ] SEC-01～SEC-08 のセキュリティ・Electron固有観点レビューを全て確認した
- [ ] ALN-01～ALN-15 の要件と設計の整合性レビューを全て確認した
- [ ] PIT-01～PIT-07 のPitfall対策レビューを全て確認した
- [ ] ゲート判定結果（PASS / MINOR / MAJOR）を記録した
- [ ] MINOR指摘がある場合は未タスク仕様書に変換した
- [ ] MAJOR指摘がある場合は戻り先Phaseを特定した
- [ ] 禁止語リストA（曖昧語）の出現がゼロ件

## サブタスク管理

| サブタスク              | 対応Task | 依存関係                        |
| ----------------------- | -------- | ------------------------------- |
| Phase 1成果物確認       | -        | なし（独立実行可能）            |
| Phase 2成果物確認       | -        | なし（独立実行可能）            |
| 3層分類レビュー         | Task 1   | Phase 1/Phase 2成果物確認に依存 |
| E2E設計レビュー         | Task 2   | Phase 2成果物確認に依存         |
| CI/CD設計レビュー       | Task 3   | Phase 2成果物確認に依存         |
| deferred-testsレビュー  | Task 4   | Phase 2成果物確認に依存         |
| セキュリティレビュー    | Task 5   | Phase 2成果物確認に依存         |
| 要件-設計整合性レビュー | Task 6   | Phase 1/Phase 2成果物確認に依存 |
| Pitfall対策レビュー     | Task 7   | Phase 2成果物確認に依存         |
| ゲート判定              | Task 8   | Task 1-7の全レビュー完了に依存  |
| 成果物作成              | -        | Task 8（ゲート判定）に依存      |

## タスク100%実行確認

- [ ] 本Phase内の全タスク（Task 1-8）を100%実行完了
- [ ] 全チェック項目（CLS 8件 + E2E 12件 + CIC 12件 + DFT 8件 + SEC 8件 + ALN 15件 + PIT 7件 = 合計70件）に判定が記録されている
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で完了状態を明記している

## 次のPhase

- PASS/MINOR判定の場合: Phase 4（テスト作成）へ進む（`phase-4-test-creation.md`）
- MAJOR判定の場合: 判定結果に記載された戻り先Phaseへ戻る
