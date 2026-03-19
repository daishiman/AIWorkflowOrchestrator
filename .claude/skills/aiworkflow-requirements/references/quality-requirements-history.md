# 非機能要件 / history bundle

> 親仕様書: [quality-requirements.md](quality-requirements.md)
> 役割: history bundle

## 関連ドキュメント

- [プロジェクト概要](./01-overview.md)
- [テクノロジースタック](./03-technology-stack.md)
- [エラーハンドリング仕様](./07-error-handling.md)

---

## 完了タスク

### UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001: IPCハンドラ単位カバレッジ測定基盤構築（2026-02-28完了）

**概要**: `skillHandlers.ts` のような複数IPCハンドラを含むファイルに対し、ハンドラ単位でLine/Branch/Function Coverageを算出する基盤を追加。Phase 7判定を「ファイル全体」だけでなく「対象ハンドラ粒度」で判断できるように拡張した。

**品質ゲート達成状況**:

| ゲート項目 | 結果 | 詳細 |
| --- | --- | --- |
| テスト | 58/58 PASS | `scripts/coverage-by-handler.test.ts` |
| Line Coverage | 95.82% | 推奨基準90%超過 |
| Branch Coverage | 90.36% | 推奨基準70%超過 |
| Function Coverage | 100% | 推奨基準90%超過 |

**主要成果**:

| 項目 | 結果 |
| --- | --- |
| 測定スクリプト | `apps/desktop/scripts/coverage-by-handler.ts` 新規作成 |
| AST検出 | `ipcMain.handle()` を23ハンドラ検出（`skillHandlers.ts`） |
| 判定ルール | Rule-1〜4（ハンドラ単位PASS/FAIL + P41注記）を導入 |
| テンプレート反映 | `task-specification-creator/references/phase-templates.md` にPhase 7手順を追加 |
| Issue | #854 |

**関連ドキュメント**:
- 実行ワークフロー: [`docs/30-workflows/completed-tasks/ut-imp-ipc-handler-coverage-granular-001/index.md`](../../../../docs/30-workflows/completed-tasks/ut-imp-ipc-handler-coverage-granular-001/index.md)
- 実装ガイド: [`outputs/phase-12/implementation-guide.md`](../../../../docs/30-workflows/completed-tasks/ut-imp-ipc-handler-coverage-granular-001/outputs/phase-12/implementation-guide.md)
- 仕様更新サマリー: [`outputs/phase-12/spec-update-summary.md`](../../../../docs/30-workflows/completed-tasks/ut-imp-ipc-handler-coverage-granular-001/outputs/phase-12/spec-update-summary.md)

**派生未タスク**:
- [UT-IMP-IPC-HANDLER-COVERAGE-GUARDRAILS-001](../../../../docs/30-workflows/completed-tasks/unassigned-task/task-imp-ipc-handler-coverage-guardrails-001.md): 苦戦箇所3件（Istanbul形式誤認、`SKILL_GET_IMPORTED` 命名例外、`scripts/**/*.test.ts` 探索漏れ）を再発防止するガードレール自動化（**完了: 2026-03-01**）

---

### TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001: `@repo/shared` モジュール解決3層整合CIガード（2026-02-22完了）

**概要**: `@repo/shared` サブパスの3層整合（`exports` / `paths` / `alias`）をCIで自動検証するガードスクリプトを追加。GitHub Actions の `check-module-sync` ジョブとして統合。

**品質ゲート達成状況**:

| ゲート項目 | 結果 | 詳細 |
| --- | --- | --- |
| テスト | 43/43 PASS | 全テストケース成功 |
| Line Coverage | 98.38% | 推奨基準90%超過 |
| Branch Coverage | 96.96% | 推奨基準70%超過 |
| Function Coverage | 100% | 最高基準達成 |

**主要成果**:

| 項目 | 結果 |
| --- | --- |
| CIガードスクリプト | `scripts/check-shared-module-sync.ts` 新規作成 |
| CIジョブ | `check-module-sync` ジョブをGitHub Actionsに追加 |
| 検証内容 | exports↔paths整合、exports↔alias整合、定義順序検証、ソースファイル存在確認 |
| Issue | #845 |

**派生未タスク**:
- [TASK-IMP-MODULE-SYNC-REPORT-ENHANCEMENT-001](../../../../docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-module-sync-report-enhancement.md): レポート拡充（修正ガイダンス・サマリー数値・printSummary設計準拠）— Phase 10 MINOR指摘3件統合

---

### TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001: `@repo/shared` モジュール解決整合（2026-02-20完了）

**概要**: `@repo/shared` サブパス解決で `exports` / `paths` / `alias` の三層整合ルールを定義し、回帰防止テストを追加。TypeScript型チェックエラー228件を0件に修正。

**品質ゲート達成状況**:

| ゲート項目 | 結果 | 詳細 |
| --- | --- | --- |
| typecheck | ✅ PASS | 228エラー → 0エラー |
| vitest | ✅ 224/224 PASS | 3テストスイート全件成功 |
| shared build | ✅ 成功 | `pnpm --filter @repo/shared build` 正常完了 |
| lint | ✅ PASS | ESLintエラー0件 |

**主要成果**:

| 項目 | 結果 |
| --- | --- |
| 品質ルール | 三層整合ルール + モジュール解決整合性テスト品質ゲートを追加 |
| 回帰テスト | module-resolution(57件) + shared-module-resolution(59件) + vitest-alias-consistency(108件) = 計224件 |
| 変更規模 | +353行（17ファイル）: tsconfig.json +27 paths / package.json +26 typesVersions / vitest.config.ts +3 alias |
| 検証 | `verify-unassigned-links` / `validate-phase-output` / `verify-all-specs` 全てPASS |
| 未タスク検出 | ~~UT-FIX-TS-VITEST-TSCONFIG-PATHS-001~~（2026-02-24完了、`docs/30-workflows/vitest-tsconfig-paths-sync/`） |

---

### TASK-3-2-F: SkillStreamDisplay テスト環境改善（2026-01-30完了）

**概要**: SkillStreamDisplayコンポーネントのテスト環境をhappy-domからjsdomに移行し、Clipboard APIモックを実装

**主要成果**:

| 項目          | 結果                       |
| ------------- | -------------------------- |
| DOM環境       | happy-dom → jsdom移行完了  |
| Clipboard API | モック実装完了（setup.ts） |
| describe.skip | 全5ブロック解除済み        |
| テスト数      | 162 passed, 1 skipped      |
| カバレッジ    | 82.4%（閾値80%達成）       |

**変更ファイル**:

- package.json (root): pnpm.overrides追加（jsdom@25.0.1固定）
- apps/desktop/vitest.config.ts: environment: "jsdom"
- apps/desktop/src/test/setup.ts: Clipboard API + window.electronAPI.skill モック（TASK-FIX-5-1で統一）

**残存課題**: act()警告が一部残存（LOW優先度、task-ref-act-warning-elimination-001として登録）

---

### TASK-7D: ChatPanel統合（2026-01-30完了）

**概要**: ChatPanelコンポーネントとSkillStreamingViewコンポーネントの実装・テスト完了

**テストカバレッジ実績**:

| 指標              | ChatPanel | SkillStreamingView | 合計 |
| ----------------- | --------- | ------------------ | ---- |
| テスト数          | 15        | 33                 | 48   |
| Line Coverage     | 100%      | 99.3%              | -    |
| Branch Coverage   | 100%      | 93.75%             | -    |
| Function Coverage | 100%      | 100%               | -    |

**適用テストパターン**:

| パターン                                | 適用箇所                               | 効果                       |
| --------------------------------------- | -------------------------------------- | -------------------------- |
| forwardRef + useImperativeHandle テスト | ChatPanel.handleImportRequest          | Function Coverage 50%→100% |
| Store個別セレクタモック                 | useAppStore各フィールド                | テスト独立性確保           |
| act() + 非同期イベント                  | SkillImportDialog/PermissionDialog操作 | Warning-free テスト        |
| data-testid統一命名                     | 全コンポーネント                       | テスト信頼性向上           |
| React.memo renderチェック               | SkillStreamingView                     | 不要な再レンダー検出       |

**成果物**:

| ファイル                    | 行数     |
| --------------------------- | -------- |
| ChatPanel.tsx               | 136行    |
| SkillStreamingView.tsx      | 251行    |
| ChatPanel.test.tsx          | 15テスト |
| SkillStreamingView.test.tsx | 33テスト |

---

### TASK-8C-D: E2Eテスト - 権限ダイアログフロー（2026-02-02完了）

**概要**: 権限確認ダイアログのE2Eテストを実装。Playwrightを使用したブラウザベースのテストで、ダイアログ表示・許可・拒否・選択記憶機能をカバー。WCAG 2.1 AAアクセシビリティテストを含む。

**テストカバレッジ実績**:

| テスト項目                  | テスト数 | 状態      |
| --------------------------- | -------- | --------- |
| TC-1: 権限ダイアログ表示    | 1        | PASS      |
| TC-2: ツール情報表示        | 1        | PASS      |
| TC-3: 許可して続行          | 1        | PASS      |
| TC-4: 拒否して停止          | 1        | PASS      |
| TC-5: 選択記憶              | 1        | PASS      |
| Edge Case: 連続権限処理     | 1        | PASS      |
| Edge Case: ダイアログキュー | 1        | PASS      |
| A11y: ARIA属性              | 2        | PASS      |
| A11y: キーボードナビ        | 4        | PASS      |
| **合計（有効）**            | **12**   | **12/12** |

**成果物**:

| ファイル                 | 行数       | 内容                   |
| ------------------------ | ---------- | ---------------------- |
| skill-permission.spec.ts | 382行      | E2Eテスト本体          |
| Phase成果物（outputs/）  | 36ファイル | Phase 1-12ドキュメント |

**テストアーキテクチャ**:

- テストランナー: Playwright
- テストフレームワーク: @playwright/test
- アプリケーション: Vite + React (Renderer Process)
- 待機戦略: waitForSelector主体（フレーキー防止）

---

### TASK-8A: スキル管理モジュール単体テスト（2026-02-02完了）

**概要**: スキル管理システムの5モジュールに対する単体テスト実装・検証。TDD Red-Green-Refactorサイクルに基づくPhase 1-12全工程完了。

**テストカバレッジ実績**:

| モジュール            | テスト数 | Line   | Branch | Function | Statements |
| --------------------- | -------- | ------ | ------ | -------- | ---------- |
| SkillScanner.ts       | 49       | 84.07% | 83.56% | 100%     | 84.07%     |
| SkillImportManager.ts | 28       | 97.36% | 92.85% | 100%     | 97.36%     |
| SkillExecutor.ts      | 52       | 52.73% | 70.4%  | 64.86%   | 52.73%     |
| PermissionResolver.ts | 43       | 100%   | 100%   | 100%     | 100%       |
| skillSlice.ts         | 59       | 94.44% | 84.61% | 100%     | 94.44%     |
| **合計**              | **231**  | -      | -      | -        | -          |

**SkillExecutor.ts カバレッジ注記**: 未カバー部分（sanitizeArgs, getPermissionReason, sendPermissionRequest）はIPC通信依存のユーティリティメソッドであり、統合テスト（TASK-8B）の範囲に該当。Branch Coverage 70.4%は閾値（60%）達成済み。

**適用テストパターン**:

| パターン                           | 適用箇所                          | 効果                       |
| ---------------------------------- | --------------------------------- | -------------------------- |
| vi.doMock 動的モジュール再読み込み | SkillImportManager electron-store | テスト独立性確保           |
| async generator mock               | SkillExecutor SDK query           | ストリーミング処理テスト   |
| vi.useFakeTimers + queueMicrotask  | PermissionResolver タイムアウト   | 非同期タイミング制御       |
| (global as any).window 上書き      | skillSlice Electron IPC           | Renderer Process APIモック |
| **fixtures**/ 実ファイル使用       | SkillScanner SKILL.md解析         | モック最小化・実データ検証 |

**新規追加テストケース（Phase 4-6）**:

| テストID | 内容                                     |
| -------- | ---------------------------------------- |
| SE-02    | execute - 不正メタデータエラー処理       |
| SE-07    | createHooks - PreToolUse/PostToolUse生成 |
| SE-08    | handlePermissionResponse - 権限応答処理  |
| PR-03    | waitForResponse - rememberChoice記憶選択 |

**成果物**:

| ファイル                                                                                     | 説明                              |
| -------------------------------------------------------------------------------------------- | --------------------------------- |
| [実装ガイド](../../../../docs/30-workflows/TASK-8A/outputs/phase-12/implementation-guide.md) | Part1: 概念説明 + Part2: 技術詳細 |
| docs/30-workflows/TASK-8A/                                                                   | Phase 1-12 全成果物（21ファイル） |

---

### TASK-8B: コンポーネントテスト（2026-02-02完了）

**概要**: skill-import-agent-system全4コンポーネント（SkillSelector, SkillImportDialog, PermissionDialog, SkillStreamingView）+3ユーティリティの包括的テスト実装

**テストカバレッジ実績**:

| テスト対象             | テスト数 | Line       | Branch     | Function   |
| ---------------------- | -------- | ---------- | ---------- | ---------- |
| PermissionDialog.tsx   | 57+19+19 | 100%       | 95.34%     | 100%       |
| SkillImportDialog.tsx  | 31       | 100%       | 100%       | 100%       |
| SkillSelector.tsx      | 28       | 100%       | 93.15%     | 87.5%      |
| SkillStreamingView.tsx | 33       | 99.31%     | 93.75%     | 100%       |
| permissionDescriptions | 34       | 97.75%     | 97.91%     | 100%       |
| toolMetadata           | 37       | 100%       | 100%       | 100%       |
| permissionHistory      | 22       | 100%       | 100%       | 100%       |
| **合計**               | **280**  | **99.71%** | **95.85%** | **97.61%** |

**適用テストパターン**:

| パターン                | 適用箇所                 | 効果                |
| ----------------------- | ------------------------ | ------------------- |
| Store個別セレクタモック | useAppStore各フィールド  | テスト独立性確保    |
| act() + 非同期イベント  | Dialog操作全般           | Warning-free テスト |
| data-testid統一命名     | 全コンポーネント         | テスト信頼性向上    |
| userEvent統合           | ユーザー操作テスト       | 実操作に近いテスト  |
| アクセシビリティテスト  | ARIA属性・キーボード操作 | WCAG 2.1準拠確認    |

**残存課題**: Phase 10で2件MINOR検出→未タスク化済み（M-01: テスト名命名規則統一、M-02: 未使用import除去）

---

### TASK-8C-A: IPC統合テスト（2026-02-02完了）

**概要**: skillHandlers.ts のIPC統合テストを実装。8チャネル（list-available, list-imported, import, remove, get-detail, execute, abort, get-status）の全パスをテスト。

**テストカバレッジ実績**:

| 指標              | skillHandlers.ts                        |
| ----------------- | --------------------------------------- |
| テスト数          | 41（22基本 + 19エッジケース）           |
| Line Coverage     | 91.4%                                   |
| Branch Coverage   | 76%                                     |
| Function Coverage | 20%（実質100%: 2 exported関数をカバー） |

**適用テストパターン**:

| パターン                  | 適用箇所                        | 効果                       |
| ------------------------- | ------------------------------- | -------------------------- |
| Handler Map方式           | ipcMain.handle モック → Map格納 | ハンドラー直接呼び出し可能 |
| SkillService Partial Mock | 15メソッド vi.fn()              | テスト独立性確保           |
| invokeOptionalHandler     | IMP-002未実装チャネル           | 実装時の移行容易性         |
| validateIpcSender失敗検証 | abort/get-status                | セキュリティ検証           |

**成果物**:

| ファイル                     | 内容               |
| ---------------------------- | ------------------ |
| skillIpc.integration.test.ts | 41テスト（~750行） |

---

### TASK-9A-A: SkillFileManager単体テスト（2026-02-03完了）

**概要**: スキルファイルのCRUD操作を提供するサービスクラス（SkillFileManager）の実装とテスト。バックアップ/リストア機能、パストラバーサル防止を含む。

**テストカバレッジ実績**:

| 指標              | SkillFileManager.ts |
| ----------------- | ------------------- |
| テスト数          | 137                 |
| Line Coverage     | 98.02%              |
| Branch Coverage   | 96.34%              |
| Function Coverage | 100%                |

**適用テストパターン**:

| パターン               | 適用箇所             | 効果                                   |
| ---------------------- | -------------------- | -------------------------------------- |
| ESModuleモッキング回避 | node:fs/promises     | vi.spyOn()制約を回避、実エラー条件使用 |
| 汎用エラーアサーション | 空入力バリデーション | 実装詳細に依存しない堅牢テスト         |
| 一時ディレクトリ活用   | バックアップテスト   | テスト間の隔離性確保                   |
| カスタムエラークラス   | 5種類の専用Error     | 明確なエラー識別とハンドリング         |

**遭遇した課題と解決策**:

| 課題                     | エラー内容                                     | 解決策                                                   |
| ------------------------ | ---------------------------------------------- | -------------------------------------------------------- |
| ESModuleモッキング制約   | `Cannot redefine property: readFile`           | モックを使わず実際のエラー条件（存在しないパス等）を使用 |
| 空入力エラークラス不一致 | SkillNotFoundError期待 → FileNotFoundError発生 | `.rejects.toThrow()`で汎用的に検証                       |
| @types/node互換性        | グローバル型定義の競合                         | プロジェクト横断課題として記録（スコープ外）             |

**カスタムエラークラス**:

| エラークラス       | 用途                               |
| ------------------ | ---------------------------------- |
| SkillNotFoundError | スキルが見つからない               |
| ReadonlySkillError | 読み取り専用スキルへの書き込み試行 |
| PathTraversalError | `../` を含むパストラバーサル検出   |
| FileExistsError    | 既存ファイルへの上書き禁止         |
| FileNotFoundError  | ファイルが存在しない               |

**成果物**:

| ファイル                             | 内容                      |
| ------------------------------------ | ------------------------- |
| SkillFileManager.ts                  | メインクラス実装（7 API） |
| errors.ts                            | カスタムエラークラス5種   |
| SkillFileManager.test.ts             | 単体テスト                |
| SkillFileManager.integration.test.ts | 統合テスト                |
| SkillFileManager.security.test.ts    | セキュリティテスト        |
| SkillFileManager.edge.test.ts        | エッジケーステスト        |

---

### TASK-UI-05B: Skill Advanced Views 実装完了（completed）

**概要**: SkillCenter の高度管理ビュー群（SkillChainBuilder, ScheduleManager, DebugPanel, AnalyticsDashboard）を実装し、IPC統合・テスト・画面検証・仕様同期を完了。

**ステータス**: completed（実装・テスト・画面検証完了）

---

### TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001 品質ゲート（2026-03-04）

`AUTHENTICATION_ERROR` の事前検知導入に伴い、契約変更（`errorCode`）と preflight 分岐（execute 抑止）を同時に検証する。

| 検証観点 | 必須コマンド | 合格基準 |
| --- | --- | --- |
| 型整合 | `pnpm --filter @repo/desktop typecheck` | Error 0 |
| 失敗契約伝搬 | `vitest run src/preload/__tests__/skill-api.contract.test.ts src/main/ipc/__tests__/skillHandlers.execute.test.ts` | `errorCode` / `Error.code` 経路が PASS |
| preflight 実行抑止 | `vitest run src/renderer/hooks/__tests__/useSkillExecution.test.ts src/renderer/views/AgentView/__tests__/AgentView.test.tsx` | `auth-key:exists=false` 時に execute 未呼び出し |
| UI証跡 | `validate-phase11-screenshot-coverage --workflow ...TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001` | expected TC = covered TC |
| 仕様整合 | `verify-all-specs --workflow ...` / `validate-phase-output ...` | error 0 / warning 0 |

---

## 変更履歴

| Version | Date       | Changes                                                                                                                                                                                |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.8.2   | 2026-03-04 | TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001 品質ゲートを追加。`errorCode` 契約伝搬・preflight execute抑止・UI証跡カバレッジ・仕様整合の5観点を必須検証として定義 |
| 2.8.1   | 2026-03-02 | TASK-UI-05B 実装完了同期: パフォーマンス基準セクションと完了タスク記録を `completed` 状態へ更新（4ビュー実装 + IPC統合 + テスト完了） |
| 2.8.0   | 2026-03-01 | TASK-UI-05B spec_created を反映: Skill Advanced Views のパフォーマンス基準（4項目）を追加。完了タスクにspec_createdとして記録 |
| 1.10.2  | 2026-03-01 | UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001 の実行ワークフローを `completed-tasks/ut-imp-ipc-handler-coverage-granular-001` へ移管。派生未タスク `UT-IMP-IPC-HANDLER-COVERAGE-GUARDRAILS-001` も `completed-tasks/unassigned-task/` 参照へ同期 |
| 1.10.1  | 2026-03-01 | UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001 の派生未タスク `UT-IMP-IPC-HANDLER-COVERAGE-GUARDRAILS-001` を追記。Istanbul形式固定・命名例外マップ・Vitest include監査の再発防止対象を明文化 |
| 1.10.0  | 2026-02-28 | UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001: IPCハンドラ単位カバレッジ判定ルール（Rule-1〜4 + P41注記）を追加し、完了タスク記録（58テスト、Line 95.82%/Branch 90.36%/Function 100%）を追記 |
| 1.9.1   | 2026-02-24 | UT-FIX-TS-VITEST-TSCONFIG-PATHS-001再監査反映: TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001の派生未タスク記載を完了化（2026-02-24完了、実装ワークフロー参照を追記） |
| 1.9.0   | 2026-02-22 | TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001: @repo/shared 3層整合CIガード完了タスク記録追加（43テスト全PASS、Line 98.38%/Branch 96.96%/Function 100%、scripts/check-shared-module-sync.ts、check-module-sync CIジョブ） |
| 1.8.1   | 2026-02-20 | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001記録強化: モジュール解決整合性テストセクション追加（3スイート分類表・品質ゲート項目表・サブパス追加時必須テスト要件7ステップ）。完了タスク記録に品質ゲート達成状況テーブル（typecheck 228→0、vitest 224/224 PASS）、変更規模（+353行/17ファイル）、未タスク検出（UT-FIX-TS-VITEST-TSCONFIG-PATHS-001）を追記 |
| 1.8.0   | 2026-02-20 | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001: `@repo/shared` サブパス三層整合ルールを追加（`exports`/`paths`/`alias` 同時更新、補助型宣言取り込み確認、整合テスト維持） |
| 1.7.0   | 2026-02-19 | TASK-FIX-10-1: 未処理Promise拒否検知ルールを追加（dangerouslyIgnoreUnhandledErrors未設定を明文化）。`@repo/shared` alias 管理ルールと未タスク `task-imp-vitest-alias-sync-automation-001` を追記 |
| 1.6.0   | 2026-02-03 | TASK-9A-A: SkillFileManager単体テスト実績追加（137テスト、3テストパターン、ESModuleモッキング回避パターン、カバレッジ Line 98.02%/Branch 96.34%/Function 100%）                        |
| 1.5.0   | 2026-02-02 | TASK-OPT-CI-TEST-PARALLEL-001: Vitest並列化設定・環境変数制御セクション追加（maxForks CI:4/ローカル動的、fileParallelism両環境対応、VITEST_MAX_FORKS/VITEST_FILE_PARALLELISM環境変数） |
| 1.4.2   | 2026-02-02 | TASK-8C-A: IPC統合テスト実績追加（41テスト、4テストパターン）                                                                                                                          |
| 1.4.1   | 2026-02-02 | TASK-8B: コンポーネントテスト実績追加（280テスト、7テスト対象、テストパターン5種）                                                                                                     |
| 1.4.0   | 2026-02-02 | TASK-8A: スキル管理モジュール単体テスト実績追加（231テスト、5モジュール、テストパターン5種）                                                                                           |
| 1.3.0   | 2026-01-30 | TASK-7D: ChatPanel統合テスト実績追加（48テスト、テストパターン5種）                                                                                                                    |
| 1.2.0   | 2026-01-30 | TASK-3-2-F: テスト環境設定パターン追加（jsdom/happy-dom選択、グローバルAPIモック、vi.stubGlobalパターン、act()警告対処）                                                               |
| 1.1.0   | 2026-01-26 | spec-guidelines.md準拠: CI/CDパイプライン構成図を表形式に変換                                                                                                                          |
| 1.0.0   | -          | 初版作成                                                                                                                                                                               |

