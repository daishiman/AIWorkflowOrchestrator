# タスク実行仕様書生成ガイド / completed records (chat, lifecycle, tests - part2)

> 親仕様書: [task-workflow.md](task-workflow.md)
> 役割: completed records（後半）
> 前半: [task-workflow-completed-chat-lifecycle-tests.md](task-workflow-completed-chat-lifecycle-tests.md)

### タスク: TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 App.tsx debug storage clear 削除（2026-03-09）

| 項目 | 値 |
| --- | --- |
| タスクID | TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 |
| ステータス | **実装・Phase 1-12 完了 / Phase 13 未実施** |
| 完了日 | 2026-03-09 |
| 対象 | `apps/desktop/src/renderer/App.tsx` の debug-only `localStorage.clear()` / `window.location.reload()` 除去 |
| 成果物 | `docs/30-workflows/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/outputs/` |

#### 実施内容

- `App.tsx` から debug storage clear `useEffect` を削除
- `App.debug-removal.test.tsx` を追加し、debug code 非残存と reload 不再発を固定
- Phase 11 では通常ルート metadata 確認 + dedicated harness screenshot 3件で persist 保持を検証
- system spec / task-spec guide / skill 文書を同一ターンで同期

#### 苦戦箇所

| 苦戦箇所 | 再発条件 | 対処 |
| --- | --- | --- |
| `skipAuth=true` で screenshot は安定するが bug path を bypass して false negative になる | auth / persist / App shell 初期化順序が原因の不具合を screenshot 導線だけで確認しようとする | 通常ルートで `navigation.type` / debug log absence / storage snapshot を metadata 取得し、画面証跡だけ dedicated harness へ分離した |
| App shell 直下の画面検証は初期化ノイズで不安定 | 目的画面への遷移や preload 依存が強く、同一 view の状態固定が難しい | SettingsView 専用 harness を追加し、本番コンポーネントをそのまま使って screenshot を安定取得した |
| repo-wide に残る `debug-clear-storage` 前提は current task の責務外まで波及する | current workflow だけ直しても、古い comment / script / e2e setup が別箇所に残る | `UT-FIX-DEBUG-CLEAR-STORAGE-SHIM-CLEANUP-001` として未タスクへ分離し、current task は実装修正と Phase 12 同期に集中した |

#### 同種課題の5分解決カード

1. まず通常ルートで bug path を再現し、metadata で副作用の有無を固定する。
2. 画面証跡が不安定なら dedicated harness を作り、screenshot path を bug path から分離する。
3. `task-workflow.md` / `lessons-learned.md` / 関連 domain spec を同一ターンで更新する。
4. repo-wide cleanup は未タスクへ切り出し、`audit --target-file` で current=0 を確認して閉じる。

#### 検証証跡

| コマンド | 結果 |
| --- | --- |
| `pnpm --filter @repo/desktop run screenshot:app-debug-localstorage-clear` | PASS |
| `pnpm --filter @repo/desktop exec vitest run src/renderer/__tests__/App.debug-removal.test.tsx` | PASS |
| `pnpm --filter @repo/desktop exec tsc --noEmit` | PASS |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001` | PASS |

### タスク: TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 AuthGuard タイムアウトフォールバック + Settings認証除外（2026-03-10）

| 項目 | 値 |
| --- | --- |
| タスクID | TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 |
| ステータス | **完了（Phase 1-13 出力 + 実装 + テスト104件全PASS + 仕様同期）** |
| タイプ | fix |
| 優先度 | P3 |
| 完了日 | 2026-03-10 |
| 対象 | `types.ts` / `getAuthState.ts` / `useAuthState.ts` / `AuthTimeoutFallback.tsx` / `index.tsx` / `App.tsx` |
| 成果物 | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/outputs/` |

#### 実施内容

- AuthGuardDisplayState に "timed-out" 状態を追加し、認証チェックの無限ブロックを防止
- 10秒タイムアウト機構を useAuthState フックに実装（認証確認が10秒以内に完了しない場合にフォールバック）
- AuthTimeoutFallback UI コンポーネントを新規作成（タイムアウト時のユーザーガイダンス表示）
- Settings 画面を AuthGuard バイパス対象に追加（未認証状態でも設定画面にアクセス可能）
- 104テスト全PASS

#### 変更ファイル

| ファイル | 変更内容 |
| --- | --- |
| `types.ts` | AuthGuardDisplayState に "timed-out" を追加 |
| `getAuthState.ts` | タイムアウト判定ロジックの追加 |
| `useAuthState.ts` | 10秒タイムアウト機構の実装 |
| `AuthTimeoutFallback.tsx` | タイムアウト時フォールバック UI コンポーネント新規作成 |
| `index.tsx` | AuthGuard コンポーネントへのタイムアウト状態ハンドリング追加 |
| `App.tsx` | Settings 画面の AuthGuard バイパス設定 |

### タスク: TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 再監査追補（2026-03-10）

| 項目 | 値 |
| --- | --- |
| タスクID | TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 |
| ステータス | **完了（Phase 11 screenshot 再取得 + reset guard 修正 + system spec 同期）** |
| 完了日 | 2026-03-10 |
| 対象 | `App.tsx` / `shouldResetUnauthenticatedView.ts` / Phase 11-12 成果物 / auth-state system spec |

#### 実施内容

- `settings` を未認証 reset 対象外にする `shouldResetUnauthenticatedView` を追加
- Phase 11 専用 harness route で screenshot 4件を再取得
- workflow 成果物、system spec 6件、LOGS/SKILL 4件を同一ターンで再同期

#### 検証証跡

| コマンド | 結果 |
| --- | --- |
| `pnpm --filter @repo/desktop exec vitest run src/renderer/utils/__tests__/shouldResetUnauthenticatedView.test.ts src/renderer/components/AuthGuard/AuthGuard.test.tsx src/renderer/components/AuthGuard/utils/getAuthState.test.ts src/renderer/components/AuthGuard/hooks/__tests__/useAuthState.test.ts src/renderer/components/AuthGuard/__tests__/AuthTimeoutFallback.test.tsx src/renderer/components/organisms/AccountSection/AccountSection.test.tsx` | PASS（6 files / 110 tests） |
| `node apps/desktop/scripts/capture-task-authguard-timeout-phase11.mjs` | PASS（4 screenshots） |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001` | PASS |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001` | PASS |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001` | PASS |
| `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001` | PASS |

#### 画面証跡

| TC | 証跡 |
| --- | --- |
| TC-11-01 | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/outputs/phase-11/screenshots/TC-11-01-timeout-fallback-light.png` |
| TC-11-02 | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/outputs/phase-11/screenshots/TC-11-02-timeout-fallback-dark.png` |
| TC-11-03 | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/outputs/phase-11/screenshots/TC-11-03-timeout-to-settings.png` |
| TC-11-04 | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/outputs/phase-11/screenshots/TC-11-04-settings-shell-unauthenticated.png` |

#### Phase 12 判定

- open 未タスク: **0件**
- screenshot 要求: **実画面証跡で充足**
- 再発防止ポイント: bypass 実装時は reset 条件も同時確認する

### タスク: TASK-FIX-SAFEINVOKE-TIMEOUT-001 safeInvoke timeout + timer cleanup（2026-03-10）

| 項目 | 値 |
| --- | --- |
| タスクID | TASK-FIX-SAFEINVOKE-TIMEOUT-001 |
| ステータス | **完了（Phase 1-13 実装・再監査・system spec 同期・PR作成完了）** |
| 完了日 | 2026-03-10 |
| 対象 | `apps/desktop/src/preload/ipc-utils.ts` / preload wrappers / current workflow Phase 11-12 |
| 成果物 | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/outputs/` |

#### 実施内容

- `invokeWithTimeout()` に `IPC_TIMEOUT_MS = 5000` の timeout 契約を集約
- allowlist fail-fast を維持したまま、正常応答・reject の双方で `clearTimeout(timeoutId)` cleanup を追加
- preload timeout 単体テストを 15 件へ拡張し、timer 残留 0 件を固定
- preload 全体回帰、current workflow screenshot 4件、Phase 12 成果物、system spec 5件、SKILL/LOGS 4件を同一ターンで同期

#### 苦戦箇所

| 苦戦箇所 | 再発条件 | 対処 |
| --- | --- | --- |
| timeout 実装の主責務は Preload だが、影響は AuthGuard UI に現れる | 非UIタスクとしてコード検証のみで閉じる | current workflow 配下に timeout fallback / settings shell の screenshot 4件を取得し、UI 影響を実証した |
| cleanup 実装後も Phase 2/8/12 に「`clearTimeout` 不採用」が残る | 実装更新後に outputs と spec を横断修正しない | workflow 本文 / outputs / system spec / SKILL / LOGS を同一ターンで修正し、planned wording を撤去した |
| 再監査 screenshot で light theme の `リトライ` 視認性差分が見つかる | 機能修正と UI 品質課題を同一スコープで抱え込む | `UT-IMP-AUTH-TIMEOUT-FALLBACK-LIGHT-CONTRAST-GUARD-001` として未タスク化し、主タスクは timeout 契約の完了に集中した |

#### 検証証跡

| コマンド | 結果 |
| --- | --- |
| `cd apps/desktop && pnpm vitest run src/preload/__tests__/ipc-utils.safeInvoke-timeout.test.ts` | PASS（15 tests） |
| `cd apps/desktop && pnpm vitest run src/preload` | PASS（19 files / 551 tests） |
| `cd apps/desktop && pnpm typecheck` | PASS |
| `node apps/desktop/scripts/capture-task-fix-safeinvoke-timeout-phase11.mjs` | PASS（4 screenshots） |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001` | PASS |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001` | PASS |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001` | PASS |
| `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001` | PASS |
| `gh pr create --title "fix(preload): safeInvoke に timeout と cleanup を追加"` | PR #1137 作成 |

#### 関連未タスク

| タスクID | 概要 | 参照 | ステータス |
| --- | --- | --- | --- |
| UT-IMP-AUTH-TIMEOUT-FALLBACK-LIGHT-CONTRAST-GUARD-001 | `AuthTimeoutFallback` ライトテーマの `リトライ` 視認性改善 | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/unassigned-task/task-imp-auth-timeout-fallback-light-contrast-guard-001.md` | 未着手 |

### タスク: 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 SettingsView 統合回帰カバレッジ強化（2026-03-08）

| 項目 | 値 |
| --- | --- |
| タスクID | 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 |
| ステータス | **完了（Phase 1-12 出力 + 実装 + 実画面検証 + 仕様同期）** |
| 完了日 | 2026-03-08 |
| 対象 | `SettingsView.integration.test.tsx` / `settings-test-harness.ts` / Phase 11-12 証跡更新 |
| 成果物 | `docs/30-workflows/08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001/outputs/` |

#### 実施内容

- SettingsView 統合テストを 18 件へ拡張（auth-mode 切替、provider fallback、status 表示条件、RAG/保存操作）
- `settings-test-harness.ts` に store + electronAPI 境界を集約し、過剰モックを抑制
- Phase 11 の画面検証を実施し、スクリーンショット 2 件を証跡化（TC-11-03/04）

#### 苦戦箇所

- Playwright 実行時のポート競合で初回撮影失敗（専用 spec へ切り出して再実行）
- `act()` warning が INT-05 系で残存（機能影響はないがノイズとして未タスク化）
- Phase 12 で「予定」表現が残りやすく、実績ベース記述への差し替えが必要

#### 検証証跡

| コマンド | 結果 |
| --- | --- |
| `cd apps/desktop && pnpm vitest run src/renderer/views/SettingsView/__tests__/SettingsView.integration.test.tsx` | PASS（18 tests） |
| `cd apps/desktop && pnpm test:e2e -- e2e/settings-integration-regression-screenshots.spec.ts` | PASS（2 tests） |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 --json` | PASS |

#### Phase 12で登録した関連未タスク

| タスクID | 概要 | 参照 |
| --- | --- | --- |
| UT-08-001 | SettingsView 統合テストの `act()` warning 解消 | `docs/30-workflows/completed-tasks/unassigned-task/task-ut-08-001-settings-act-warning-guard.md` |
| UT-08-002 | SettingsView 画面導線の E2E カバレッジ拡張 | `docs/30-workflows/completed-tasks/unassigned-task/task-ut-08-002-settings-e2e-coverage.md` |
| UT-08-003 | Phase 6 残件（INT-11〜13）の再評価と必要分実装 | `docs/30-workflows/completed-tasks/unassigned-task/task-ut-08-003-settings-phase6-remaining-cases.md` |
| UT-08-004 | settings harness パターンの仕様標準化を継続強化 | `docs/30-workflows/completed-tasks/unassigned-task/task-ut-08-004-settings-harness-pattern-spec-sync.md` |

### タスク: TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 Workspace Chat Edit AI Runtime 有効化（2026-03-14）

| 項目 | 値 |
| --- | --- |
| タスクID | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |
| ステータス | **完了（Phase 1-12 完了）** |
| タイプ | feat |
| 優先度 | 高 |
| 完了日 | 2026-03-14 |
| 対象 | RuntimeResolver / AnthropicLLMAdapter / TerminalHandoffBuilder / M-01 contextBridge fix |
| 成果物 | `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-02-par-task-10-claude-code-terminal-surface/outputs/` |

#### 実施内容

- RuntimeResolver / AnthropicLLMAdapter / TerminalHandoffBuilder を実装し、Workspace Chat Edit の AI Runtime を有効化
- M-01 contextBridge fix を適用し、Preload payload の安全性を確保
- Phase 11 で screenshot 取得と Apple UI/UX 観点レビューを完了

#### 関連未タスク

| 未タスクID | 概要 | 優先度 | タスク仕様書 |
| --- | --- | --- | --- |
| ~~UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001~~ | ~~workspacePath テスト実装確認（TC-WS-01〜06）~~ | ~~高~~ | `docs/30-workflows/completed-tasks/task-chat-edit-workspace-constraint-test-001.md`（完了: 2026-03-15） |
| TASK-IMP-WORKSPACE-CHAT-EDIT-SPEC-SYNC-IPC-001 | IPC 正本同期（F-M02） | 中 | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-workspace-chat-edit-spec-sync-ipc-001.md` |
| UT-FIX-PHASE11-SCREENSHOT-AUTOMATION-001 | Phase 11 スクリーンショット自動化 | 低 | `docs/30-workflows/completed-tasks/unassigned-task/task-fix-phase11-screenshot-automation-001.md` |

### UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001: workspacePath セキュリティ検証テスト実装（2026-03-15）

| 項目 | 内容 |
| --- | --- |
| タスクID | UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001 |
| Issue | #1222 |
| タイプ | test |
| 完了日 | 2026-03-15 |
| テストファイル | `apps/desktop/src/main/ipc/__tests__/chatEditHandlers.workspace-constraint.test.ts` |
| テスト対象 | `apps/desktop/src/main/ipc/chatEditHandlers.ts` L159-173（workspacePath 検証ロジック） |
| テスト数 | 6（TC-WS-01〜06 全PASS） |
| カバレッジ | workspacePath ブランチ 100% |

**テストケース概要**:
- TC-WS-01: workspace 内ファイルは正常処理（PASS）
- TC-WS-02: workspace 外ファイルは PERMISSION_DENIED で拒否
- TC-WS-03: workspacePath 未指定時は検証スキップ
- TC-WS-04: パストラバーサル攻撃パターン（`../`）を拒否
- TC-WS-05: 複数コンテキストのうち1件でも外部なら全体拒否
- TC-WS-06: 空配列コンテキストの正常処理

#### 実装内容（要点）

- `apps/desktop/src/main/ipc/__tests__/chatEditHandlers.workspace-constraint.test.ts` を追加し、workspacePath 制約の正常系/異常系/境界値（6ケース）を固定した
- `ipcMain.handle` の handler capture + `invokeHandler()` で IPC 経由の挙動をテストし、Main IPC 契約に沿った失敗コード（`PERMISSION_DENIED`）を確認した
- `isAllowedPath` は `vi.spyOn` ベースで監視し、パストラバーサル拒否の実装ロジック（正規化を含む）を保持したまま検証した

#### 苦戦箇所（再利用形式）

| 苦戦箇所 | 再発条件 | 対処 |
| --- | --- | --- |
| 同名ファイルの二重存在（P58） | `ipc/chatEditHandlers.ts` と `handlers/chatEditHandlers.ts` の責務差を確認せず編集する | `grep -rn "registerChatEditHandlers" apps/desktop/src/main` で呼び出し元を特定し、IPC 側を正本に固定 |
| RuntimeResolver mock 戦略（P61派生） | `integrated` 返却のままテストし、ChatEditService 依存が増殖する | `type: "handoff"` を返す mock へ寄せて依存面積を縮小し、workspacePath 監査に焦点化 |
| `vi.spyOn` と `vi.mock` の誤選択 | security helper を丸ごと mock して内部バリデーションを失う | `vi.spyOn(PathValidatorModule, "isAllowedPath")` を使い、実装保持で呼び出し観測 |

#### 同種課題の5分解決カード

1. 先に正本ファイルを `grep import/register` で確定し、同名ファイル誤編集を防ぐ。
2. 動的DI依存が重い場合は mock 戦略を `handoff` 側へ寄せ、対象責務だけを検証する。
3. セキュリティロジック検証は `vi.mock` ではなく `vi.spyOn` を優先し、実装を保持する。
4. workspace 制約は `正常系 / 外部拒否 / パストラバーサル / 複数コンテキスト / 空配列` を最小セットとして固定する。
5. Phase 12 では完了台帳・教訓・未タスク判定（current/baseline 分離）を同ターンで同期する。
