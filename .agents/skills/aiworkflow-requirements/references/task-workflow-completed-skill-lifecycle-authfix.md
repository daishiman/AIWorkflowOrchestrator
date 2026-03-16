# タスク実行仕様書生成ガイド / completed records

> 親仕様書: [task-workflow.md](task-workflow.md)
> 役割: completed records（スキルライフサイクル・認証修正系: 2026-03-08〜10）
>
> 関連ファイル:
> - [task-workflow-completed-workspace-chat-lifecycle-tests.md](task-workflow-completed-workspace-chat-lifecycle-tests.md) — Workspace / Chat-Edit / Runtime Routing 系タスク（2026-03-11〜15）

## 完了タスク

### タスク: TASK-10A-G スキルライフサイクル統合テスト強化（2026-03-10）

| 項目 | 値 |
| --- | --- |
| タスクID | TASK-10A-G |
| ステータス | **完了（Phase 1-12 完了）** |
| タイプ | test |
| 優先度 | 中 |
| 完了日 | 2026-03-10 |
| 対象 | スキルライフサイクル3層テスト（IPC契約 / Store駆動 / ChatPanel結線） |
| 成果物 | `docs/30-workflows/completed-tasks/task-045-task-10a-g-lifecycle-test-hardening/outputs/` |

#### 実施内容

- G1: IPC契約テスト14件（`skill:create` の入力検証・sender検証・正常委譲・異常系）
- G2: Store駆動テスト21件（`create -> list -> analyze -> improve` の状態遷移・guard・trim バリデーション）
- G3: ChatPanel結線テスト17件（スキル管理トグル、実行中 disabled、SkillManagementPanel 切替の統合フロー）
- 合計52テスト全PASS、カバレッジ基準充足、回帰287件PASS
- Phase 11 では代表 UI 5ケースの screenshot を current workflow 配下へ追加し、`validate-phase11-screenshot-coverage` PASS まで確認

#### 苦戦箇所

| 苦戦箇所 | 再発条件 | 対処 |
| --- | --- | --- |
| テスト専用タスクで Phase 4/5 の境界が曖昧 | テストコードのみ追加するタスクで Red/Green 区分が不明確 | Phase 4 でテスト作成（Red）→ Phase 5 でモック/スタブ修正（Green）と整理 |
| 巨大ファイルのカバレッジ計測が個別ファイル単位と全体で乖離 | v8 プロバイダが大規模ファイルをインライン関数単位でカウント | Layer 別にカバレッジを報告し、全体値は weighted average として扱う |
| 3層テスト間のモック整合性 | Layer 1 のモックと Layer 2 のストア実装が異なる前提で動作 | 各 Layer のモック境界を明示的にドキュメント化 |

#### 同種課題の5分解決カード

1. テスト専用タスクでは Phase 4 = テスト作成（Red）、Phase 5 = モック/環境修正（Green）と読み替える。
2. カバレッジは Layer 別に計測し、全体値との乖離を仕様書に明記する。
3. `--sequence.shuffle` でテスト順序依存がないことを確認する。
4. `task-workflow.md` / `lessons-learned.md` / 関連 domain spec を同一ターンで更新する。

#### 関連未タスク（再監査追補）

| タスクID | 概要 | 優先度 | 参照 |
| --- | --- | --- | --- |
| UT-IMP-TASK-SPEC-GENERATE-INDEX-SCHEMA-COMPAT-001 | `generate-index.js` と workflow `artifacts.json` の schema 互換改善 | 中 | `docs/30-workflows/completed-tasks/task-045-task-10a-g-lifecycle-test-hardening/unassigned-task/task-imp-task-spec-generate-index-schema-compat-001.md` |

#### 検証証跡

| コマンド | 結果 |
| --- | --- |
| `pnpm --filter @repo/desktop exec vitest run` (回帰テスト) | 287 PASS |
| `pnpm --filter @repo/desktop exec tsc --noEmit` | PASS |

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

#### 苦戦箇所（今回実装で詰まった点）

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

#### 苦戦箇所（今回実装で詰まった点）

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

#### 苦戦箇所（今回実装で詰まった点）

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
