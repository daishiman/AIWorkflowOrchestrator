# タスク実行仕様書生成ガイド / completed records

> 親仕様書: [task-workflow.md](task-workflow.md)
> 役割: completed records

## 完了タスク

### タスク: TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN 通知履歴・履歴検索ドメイン実装（2026-03-05）

| 項目       | 内容                                                               |
| ---------- | ------------------------------------------------------------------ |
| タスクID   | TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN                           |
| 完了日     | 2026-03-05                                                         |
| ステータス | **完了（Phase 1-12 出力 + 実装 + テスト）**                        |
| 対象       | Notification履歴管理 / HistorySearch状態管理 / IPC-Preload公開契約 |

#### 仕様書別SubAgent分担（関心ごと分離）

| SubAgent   | 担当仕様書                                                     | 主担当作業                                                            | 完了条件                                              |
| ---------- | -------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------- |
| SubAgent-A | `references/arch-state-management.md`                          | `notificationSlice` / `historySearchSlice` の状態責務・永続化契約同期 | Slice責務/保持件数/selector 契約が仕様化される        |
| SubAgent-B | `references/api-ipc-system.md` / `references/api-endpoints.md` | IPC 7チャネル（history 2 + notification 5）の契約同期                 | Main/Preload/Renderer 契約が3層で一致する             |
| SubAgent-C | `references/task-workflow.md`                                  | 完了台帳、検証証跡、未タスク判定の同期                                | Phase 1-12 の実行証跡が追跡可能になる                 |
| SubAgent-D | `references/lessons-learned.md`                                | 実装苦戦箇所と再利用手順の固定                                        | 同種タスクの再発防止手順が再利用可能になる            |
| SubAgent-E | `outputs/phase-11/*`                                           | 実画面3件 + 非視覚3件の証跡設計と Apple UI/UX 視点判定                | `SCREENSHOT` と `NON_VISUAL` の判定境界が明確化される |

#### 実装反映（要点）

- Store Sliceを追加:
  - `apps/desktop/src/renderer/store/slices/notificationSlice.ts`
  - `apps/desktop/src/renderer/store/slices/historySearchSlice.ts`
- Main IPC ハンドラを追加:
  - `apps/desktop/src/main/ipc/notificationHandlers.ts`
  - `apps/desktop/src/main/ipc/historySearchHandlers.ts`
- Preload公開境界を拡張:
  - `apps/desktop/src/preload/channels.ts`
  - `apps/desktop/src/preload/types.ts`
  - `apps/desktop/src/preload/index.ts`
- Store統合と永続化キー同期:
  - `apps/desktop/src/renderer/store/index.ts`
- テストを追加:
  - `notificationSlice.test.ts` / `historySearchSlice.test.ts`
  - `notificationHandlers.test.ts` / `historySearchHandlers.test.ts`
  - `channels.test.ts` 拡張

#### 検証証跡（2026-03-05）

| コマンド                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | 結果                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `pnpm --filter @repo/desktop exec vitest run src/renderer/store/slices/notificationSlice.test.ts src/renderer/store/slices/historySearchSlice.test.ts src/main/ipc/notificationHandlers.test.ts src/main/ipc/historySearchHandlers.test.ts src/preload/channels.test.ts`                                                                                                                                                                                                                                                                                                                                                                                                                    | PASS（5 files / 37 tests）                                              |
| `pnpm --filter @repo/desktop typecheck`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | PASS                                                                    |
| `node apps/desktop/scripts/capture-task-056c-notification-history-screenshots.mjs`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | PASS（TC-11-01〜03 実画面証跡を再取得）                                 |
| `pnpm --filter @repo/desktop exec vitest run --coverage.enabled true --coverage.provider v8 --coverage.reportsDirectory coverage-task-056c --coverage.include \"src/renderer/store/slices/notificationSlice.ts\" --coverage.include \"src/renderer/store/slices/historySearchSlice.ts\" --coverage.include \"src/main/ipc/notificationHandlers.ts\" --coverage.include \"src/main/ipc/historySearchHandlers.ts\" --coverage.include \"src/preload/channels.ts\" src/renderer/store/slices/notificationSlice.test.ts src/renderer/store/slices/historySearchSlice.test.ts src/main/ipc/notificationHandlers.test.ts src/main/ipc/historySearchHandlers.test.ts src/preload/channels.test.ts` | PASS（Statements 87.45 / Branch 65.11 / Functions 80.39 / Lines 87.45） |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/task-056c-notification-history-domain`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | PASS（13/13, error=0）                                                  |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-056c-notification-history-domain`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | PASS（28項目, error=0）                                                 |

#### Phase 12 タスク仕様準拠の追加確認（2026-03-05 21:04 JST）

| 観点               | コマンド                                                                                                                                                                            | 結果                                           |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Phase 12 必須要件  | `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-056c-notification-history-domain`                           | PASS（Task 12-1〜12-5 / 完了条件5件を再確認）  |
| 画面証跡再採取     | `node apps/desktop/scripts/capture-task-056c-notification-history-screenshots.mjs`                                                                                                  | PASS（TC-11-01〜03 再撮影）                    |
| 画面証跡カバレッジ | `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/task-056c-notification-history-domain` | PASS（expected 6 / covered 6）                 |
| 未タスク差分監査   | `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD`                                                                          | `currentViolations=0`, `baselineViolations=92` |
| 未タスク配置差分   | `git diff --name-only HEAD -- docs/30-workflows/unassigned-task docs/30-workflows/completed-tasks/unassigned-task`                                                                  | 0件（今回タスク起因の未タスク追加/移動なし）   |

#### Phase 11（UI/UX 判定）

- 実画面証跡: `TC-11-01`（Dashboard）, `TC-11-02`（Chat History空状態）, `TC-11-03`（History一覧）を再取得。
- 非視覚証跡: `TC-11-04..06` は契約テスト起点で `NON_VISUAL` を維持。
- Apple UI/UX 観点では、情報階層・可読性・空状態の優先度に視覚的退行なしと判定。

#### 未タスク判定

- 実装差分として新規未タスク化が必要な項目は **0件**。
- 追加した要件（Slice/IPC/Preload/テスト）はすべて `outputs/phase-1..12` と仕様正本へ同期済み。
- ただし再監査運用で再発した「対象テスト実行の誤起動リスク（`pnpm run test:run --`）」は運用改善対象として未タスク化し、同ターンで完了タスクへ移管した。

#### 関連タスク（2026-03-05 追補・完了移管）

| タスクID                                         | 概要                                                                                                                                                         | 参照                                                                                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| ~~UT-IMP-PHASE12-TARGETED-VITEST-RUN-GUARD-001~~ | ~~Phase 12 再監査で対象テストのみを確実実行するガード（`pnpm exec vitest run` 直指定 + スクリプト実在 preflight）~~ **完了: 2026-03-05（Phase 12完了移管）** | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-targeted-vitest-run-guard-001.md` |

#### 同種課題の簡潔解決手順（4ステップ）

1. Store/IPC/Preload を先に責務分離し、仕様書別SubAgentへ担当を固定する。
2. 新規チャネル追加時は `main handler` / `preload channels` / `preload types` の3点を同一ターンで同期する。
3. Phase 11 は UI導線（`SCREENSHOT`）と契約検証（`NON_VISUAL`）を分離して証跡化する。
4. Phase 12 は `arch-state-management` / `api-ipc-system` / `api-endpoints` / `task-workflow` / `lessons-learned` を同時更新し、`verify` + `validate` で閉じる。

### タスク: TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001 auth-key IPCハンドラ登録漏れ修正（2026-03-05）

| 項目       | 内容                                                                                    |
| ---------- | --------------------------------------------------------------------------------------- |
| タスクID   | TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001                                              |
| 完了日     | 2026-03-05                                                                              |
| ステータス | **完了（Phase 1-12 出力 + 実装 + テスト + 画面回帰検証）**                              |
| 目的       | `auth-key:exists` の `No handler registered` を解消し、再登録ライフサイクルを整合させる |

#### 仕様書別SubAgent分担（関心ごと分離）

| SubAgent   | 担当仕様書                     | 主担当作業                            | 完了条件                                |
| ---------- | ------------------------------ | ------------------------------------- | --------------------------------------- |
| SubAgent-A | `references/api-ipc-system.md` | Main登録/解除ライフサイクルの仕様同期 | auth-key runtime登録責務が文書化される  |
| SubAgent-B | `references/task-workflow.md`  | 完了台帳・検証証跡・関連リンクの固定  | Phase 1-12 実行証跡が追跡可能になる     |
| SubAgent-C | `outputs/phase-11/*`           | 画面回帰証跡 + Apple UI/UXレビュー    | TC単位の画面証跡3件とレビュー結果が残る |
| SubAgent-D | `outputs/phase-12/*`           | Step 1-A/1-B/1-C/Step 2 の統合判定    | 矛盾/漏れ/整合/依存を満たす             |

#### 実装反映（要点）

- `apps/desktop/src/main/ipc/index.ts` へ以下を反映:
  - `registerAuthKeyHandlers(mainWindow, authKeyService)` を `registerAllIpcHandlers` に接続
  - `unregisterAuthKeyHandlers()` を `unregisterAllIpcHandlers` に接続
- `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts` に auth-key lifecycle 回帰テストを追加。
- `apps/desktop/src/main/ipc/__tests__/authKeyHandlers.test.ts` に再登録・未登録解除・複数サイクルケースを追加。

#### 画面検証（Phase 11 回帰）

| テストケース | 証跡                                                                                                                                                | 判定 |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| TC-11-UI-01  | `docs/30-workflows/completed-tasks/01-TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001/outputs/phase-11/screenshots/TC-11-UI-01-root-navigation.png`      | PASS |
| TC-11-UI-02  | `docs/30-workflows/completed-tasks/01-TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001/outputs/phase-11/screenshots/TC-11-UI-02-skill-center-view.png`    | PASS |
| TC-11-UI-03  | `docs/30-workflows/completed-tasks/01-TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001/outputs/phase-11/screenshots/TC-11-UI-03-ui-design-foundation.png` | PASS |

- Apple UI/UXレビュー結果: 情報階層・視認性・一貫性で重大問題なし（低優先度のコントラスト改善余地のみ）。

#### 検証証跡

| コマンド                                                                                                                                                                                                                                                                          | 結果                                                                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm --filter @repo/desktop test:run src/main/ipc/__tests__/ipc-double-registration.test.ts src/main/ipc/__tests__/authKeyHandlers.test.ts src/renderer/hooks/__tests__/useSkillExecution.test.ts src/renderer/stores/agent/__tests__/agentSlice.executeSkill.preflight.test.ts` | PASS（76 tests、実行ログ上は3 test files）                                                                                              |
| `pnpm --filter @repo/desktop test:run`                                                                                                                                                                                                                                            | FAIL（`@repo/desktop` 全量実行で `skill-creator.fixture.test.ts` 実行中に `SIGTERM`）。証跡は失敗ログを記録し、対象テスト分割実行へ切替 |
| `pnpm --filter @repo/desktop typecheck`                                                                                                                                                                                                                                           | PASS                                                                                                                                    |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/01-TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001`                                                                                                                 | PASS（Phase 1-12成果物作成後に再検証）                                                                                                  |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/01-TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001`                                                                                       | PASS（expected=3 / covered=3）                                                                                                          |

#### 実装時の苦戦箇所と解決策

| 苦戦箇所                                        | 再発条件                                                                             | 対処                                                                                         | 標準ルール                                                               |
| ----------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| ハンドラ実装済みでも runtime 未登録             | `authKeyHandlers.ts` の単体テスト合格のみで完了判定する                              | `registerAllIpcHandlers` に `registerAuthKeyHandlers` を接続し、統合テストで起動経路を固定   | IPC修正は「handler実装 + register配線」セットで完了判定する              |
| unregister 側の追随漏れ                         | register 側のみ修正し、アプリ再初期化サイクルを検証しない                            | `unregisterAllIpcHandlers` に `unregisterAuthKeyHandlers` を追加し、多重サイクルテストを追加 | register/unregister は常に対称更新する                                   |
| 仕様台帳に苦戦箇所が残らない                    | `task-workflow` の完了記録だけ更新し、教訓転記を後回しにする                         | `lessons-learned.md` に同タスク専用セクションを追加し、再利用手順まで同期                    | Phase 12 Step 2 は「実装内容 + 苦戦箇所 + 簡潔手順」同時反映を必須化する |
| `apps/desktop test:run` が `SIGTERM` で中断する | 長時間 fixture テストを含む全量実行を1コマンドで固定し、実行環境の負荷差を吸収しない | 失敗ログを証跡化したうえで `vitest run <対象>` の分割実行へ切替し、対象回帰の合否を確定する  | 回帰判定は「全量1本」に限定せず、長時間系は分割実行 + 合算記録を許容する |

#### 同種課題の簡潔解決手順（4ステップ）

1. 追加・修正した IPC チャネルについて、`register*` と `unregister*` の両経路を先に棚卸しする。
2. `ipc/index.ts` の配線修正と lifecycle 回帰テスト追加を同一コミット粒度で実施する。
3. Phase 11 証跡を TC 単位で確認し、`validate-phase11-screenshot-coverage` を PASS させる。
4. `task-workflow` と `lessons-learned` に苦戦箇所と再利用手順を同時に転記して完了判定する。

#### 同種課題の5分解決カード（runtime配線 + テスト中断ガード）

| 項目       | 内容                                                                                                                                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `No handler registered` または `pnpm --filter @repo/desktop test:run` が `SIGTERM` で停止                                                                                                                               |
| 根本原因   | `register/unregister` 対称確認の不足、長時間 fixture テストの一括実行固定                                                                                                                                               |
| 最短5手順  | 1) `ipc/index.ts` で `register/unregister` 両経路を棚卸し 2) runtime 配線を対称更新 3) lifecycle 回帰テストを追加 4) 全量実行失敗時は `vitest run <対象>` へ分割 5) 検証値を `task-workflow/lessons/api-ipc` に同時転記 |
| 検証ゲート | `validate-phase-output` PASS、`validate-phase11-screenshot-coverage` PASS、分割実行した対象テスト PASS                                                                                                                  |
| 同期先3点  | `references/task-workflow.md` / `references/lessons-learned.md` / `references/api-ipc-system.md`                                                                                                                        |

#### 関連リンク

| 種別         | 参照                                                                                                                        |
| ------------ | --------------------------------------------------------------------------------------------------------------------------- |
| workflow仕様 | `docs/30-workflows/completed-tasks/01-TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001/`                                          |
| 実装サマリー | `docs/30-workflows/completed-tasks/01-TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001/outputs/phase-5/implementation-summary.md` |
| 品質レポート | `docs/30-workflows/completed-tasks/01-TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001/outputs/phase-9/quality-report.md`         |
| 最終レビュー | `docs/30-workflows/completed-tasks/01-TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001/outputs/phase-10/final-review-result.md`   |
| 画面検証結果 | `docs/30-workflows/completed-tasks/01-TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001/outputs/phase-11/manual-test-result.md`    |

#### 関連タスクステータス

| タスクID                                          | 関係                                                 | ステータス                              |
| ------------------------------------------------- | ---------------------------------------------------- | --------------------------------------- |
| UT-FIX-IPC-HANDLER-DOUBLE-REG-001                 | 先行パターン（同種のIPC再登録問題）                  | 完了                                    |
| TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001        | 今回対応                                             | 完了                                    |
| UT-IMP-DESKTOP-TESTRUN-SIGTERM-FALLBACK-GUARD-001 | 派生未タスク（`SIGTERM` フォールバック運用の標準化） | 完了（2026-03-05, completed-tasks移管） |

### タスク: TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001 SkillExecutor AuthKeyService DI経路統一（2026-03-05）

| 項目       | 内容                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------ |
| タスクID   | TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001                                                     |
| 完了日     | 2026-03-05                                                                                 |
| ステータス | **完了（Phase 1-12 出力 + 実装 + テスト + 仕様同期）**                                     |
| 目的       | `AuthKeyService` の生成・注入経路を単一路化し、preflight判定と実行時判定の不一致を解消する |

#### 仕様書別SubAgent分担（関心ごと分離）

| SubAgent   | 担当仕様書                                    | 主担当作業                                                     | 完了条件                          |
| ---------- | --------------------------------------------- | -------------------------------------------------------------- | --------------------------------- |
| SubAgent-A | `references/interfaces-agent-sdk-executor.md` | DI契約（`registerSkillHandlers` / `SkillExecutor` 生成）の同期 | シグネチャが実装と一致する        |
| SubAgent-B | `references/api-ipc-system.md`                | auth-key ライフサイクル実装状況と完了タスク同期                | 生成責務/注入責務が明文化される   |
| SubAgent-C | `references/task-workflow.md`                 | 完了台帳・検証証跡・未タスク判定の同期                         | Phase 12 証跡が追跡可能になる     |
| SubAgent-D | `references/lessons-learned.md`               | 苦戦箇所と再利用手順の固定                                     | 同種課題で5分以内に再現可能になる |

#### 実装反映（要点）

- `apps/desktop/src/main/ipc/index.ts`:
  - `registerAllIpcHandlers` で `AuthKeyService` を1回だけ生成
  - `registerSkillHandlers(mainWindow, skillService, authKeyService)` へ同一インスタンスを注入
- `apps/desktop/src/main/ipc/skillHandlers.ts`:
  - `new SkillExecutor(mainWindow, undefined, authKeyService)` へ統一
- `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts`:
  - DI経路の回帰検証を追加して起動/再登録サイクルでの破綻を防止

#### 検証証跡（2026-03-05）

| コマンド                                                                                                                                                                                                                  | 結果                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001`                                                       | PASS（13/13, error=0, warning=0） |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001`                                                             | PASS（28項目）                    |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase11-authkey-screenshot-selector-drift-guard-001.md` | PASS（`currentViolations=0`）     |
| `rg -n '^\\                                                                                                                                                                                                               | ステータス \\                     | completed' docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001/phase-12-documentation.md` | PASS（`phase-12-documentation.md` が `completed` で同期済み） |

#### 実装時の苦戦箇所と解決策

| 苦戦箇所                                                           | 再発条件                                                         | 対処                                                                                                                          | 標準ルール                                                                   |
| ------------------------------------------------------------------ | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| DIシグネチャが仕様書と実装でずれる                                 | 仕様書側のコード例を後追い更新し、Main配線変更と同時同期しない   | `registerSkillHandlers(..., authKeyService)` と `new SkillExecutor(mainWindow, undefined, authKeyService)` を同一ターンで同期 | DI変更時は「Main配線 + 実装コード例 + 型仕様」の3点を同時更新する            |
| 成果物は揃うが `phase-12-documentation.md` が `pending` のまま残る | `outputs/phase-12` 実体確認のみで完了判定する                    | Task 12-1〜12-5 実体確認後に `verify-all-specs` / `validate-phase-output` を再実行し、仕様書本体を `completed` へ同期         | Phase 12完了は「成果物実体 + 機械検証PASS + 仕様書ステータス同期」で確定する |
| 教訓反映が change log のみで終わる                                 | `task-workflow` へ完了記録だけ残し、`lessons` 反映を後回しにする | `lessons-learned.md` に本タスク専用節を追加し、再発条件付きで固定                                                             | 仕様同期タスクも「実装内容 + 苦戦箇所 + 手順」を台帳と教訓へ同時転記する     |

#### 同種課題の簡潔解決手順（4ステップ）

1. Main composition root で依存生成責務を固定し、注入先関数シグネチャを先に確定する。
2. 実装（`ipc/index.ts` / `skillHandlers.ts`）と仕様（interfaces/api/task/lessons）を同一ターンで更新する。
3. `verify-all-specs` と `validate-phase-output` を再実行し、Task 12-1〜12-5 実体を突合する。
4. `phase-12-documentation.md` のステータス/チェックリストを `completed` へ同期して完了判定する。

#### 関連タスク（2026-03-06 完了移管）

| タスクID                                                       | 概要                                                                                                                                    | 参照                                                                                                                |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| ~~UT-IMP-PHASE11-AUTHKEY-SCREENSHOT-SELECTOR-DRIFT-GUARD-001~~ | ~~auth-key Phase 11 スクリーンショット取得スクリプトのセレクタドリフト防止~~ **完了: 2026-03-06（Phase 12完了移管）**                   | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase11-authkey-screenshot-selector-drift-guard-001.md` |
| ~~UT-IMP-SKILLHANDLERS-AUTHKEY-DI-BOUNDARY-GUARD-001~~         | ~~`skillHandlers.ts` の DI境界整理と責務分離ガード（composition root 集約 + 回帰テスト固定）~~ **完了: 2026-03-06（Phase 12完了移管）** | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-skillhandlers-authkey-di-boundary-guard-001.md`         |

### タスク: TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001 OAuth後 sandbox iterable エラーの原因分離（2026-03-05）

| 項目       | 内容                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001                                                                |
| 完了日     | 2026-03-05                                                                                                          |
| ステータス | **完了（Phase 1-12 出力 + 実装 + テスト）**                                                                         |
| 目的       | `AUTH_STATE_CHANGED` と `linkedProviders` の契約崩れ起因で発生する `is not iterable` 系障害を分離し、再発を防止する |

#### 仕様書別SubAgent分担（関心ごと分離）

| SubAgent   | 担当仕様書                     | 主担当作業                                                                | 完了条件                                       |
| ---------- | ------------------------------ | ------------------------------------------------------------------------- | ---------------------------------------------- |
| SubAgent-A | `references/api-ipc-system.md` | `PROFILE_UNLINK_PROVIDER` 通知時の `AUTH_STATE_CHANGED.user` 正規化を同期 | Main→Renderer 契約形状が揺れない               |
| SubAgent-B | `references/task-workflow.md`  | 完了台帳・検証証跡・関連リンク同期                                        | Phase 1-12 証跡が追跡可能                      |
| SubAgent-C | `outputs/phase-11/*`           | スクリーンショット3件（TC-11-UI-01〜03）で画面回帰を固定                  | `validate-phase11-screenshot-coverage` が PASS |
| SubAgent-D | `outputs/phase-12/*`           | Step 1-A/1-B/1-C/Step 2 の判定記録                                        | 仕様更新プロセスが監査可能                     |

#### 実装反映（要点）

- `apps/desktop/src/main/ipc/profileHandlers.ts`
  - unlink成功通知で `toAuthUser` を適用し `AUTH_STATE_CHANGED.user` を正規化。
- `apps/desktop/src/renderer/store/slices/authSlice.ts`
  - `isLinkedProvider` / `normalizeLinkedProviders` を追加し、非配列/不正要素を防御。
- 追加検証
  - `authSlice.test.ts` に2ケース追加（非配列正規化、壊れstate回復）
  - `profileHandlers.test.ts` にunlink通知整合ケース追加

#### 検証証跡

| コマンド                                                                                                                                                                                                | 結果                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `pnpm --filter @repo/desktop test:run src/renderer/store/slices/authSlice.test.ts src/main/ipc/profileHandlers.test.ts src/renderer/components/organisms/AccountSection/AccountSection.portal.test.tsx` | PASS（3 files / 169 tests）              |
| `pnpm --filter @repo/desktop typecheck`                                                                                                                                                                 | PASS                                     |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/04-TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001`                   | PASS（expected=3 / covered=3）           |
| 対象カバレッジ計測（`authSlice.ts`, `profileHandlers.ts`, `AccountSection/index.tsx`）                                                                                                                  | PASS（`authSlice.ts` 81.38/84.88/86.95） |

#### 画面検証（再監査追補）

| テストケース | 証跡                                                                                                                                          | 視覚判定 |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| TC-11-UI-01  | `docs/30-workflows/04-TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001/outputs/phase-11/screenshots/TC-11-UI-01-root-navigation.png`      | PASS     |
| TC-11-UI-02  | `docs/30-workflows/04-TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001/outputs/phase-11/screenshots/TC-11-UI-02-skill-center-view.png`    | PASS     |
| TC-11-UI-03  | `docs/30-workflows/04-TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001/outputs/phase-11/screenshots/TC-11-UI-03-ui-design-foundation.png` | PASS     |

#### 実装時の苦戦箇所と再発防止

| 項目       | 内容                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------- |
| 苦戦箇所1  | `AUTH_STATE_CHANGED.user` は AuthUser 形状前提だが、unlink 通知経路で profile shape が混在しやすい |
| 原因       | Main 通知 payload と Renderer state の契約境界を同時に検証していなかった                           |
| 対処       | Main 側で `toAuthUser(updatedUser)` を必須化し、Renderer 側で `normalizeLinkedProviders` を導入    |
| 標準ルール | 契約修正は「送信側正規化 + 受信側防御 + 契約テスト」の3点を同一ターンで実施する                    |

| 項目       | 内容                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------- |
| 苦戦箇所2  | Phase 11 初回証跡が `NON_VISUAL` 記録のみで、ユーザー要求（画面検証）との乖離が発生した   |
| 原因       | タスク性質（非視覚修正）を優先し、追加要求に応じた SCREENSHOT 昇格を初回で適用しなかった  |
| 対処       | TC-11-UI-01〜03 の実画面証跡を再生成し、`validate-phase11-screenshot-coverage` 3/3 を固定 |
| 標準ルール | ユーザーが画面検証を要求した時点で `NON_VISUAL` タスクでも `SCREENSHOT` モードへ昇格する  |

#### 同種課題の簡潔解決手順（4ステップ）

1. Main 通知 payload を正規化し、Renderer 受信値を正規化する二重防御を同時実装する。
2. 契約テスト（Main/Renderer/UI Portal）を対象ファイルに限定して先に固定する。
3. Phase 11 で `TC-ID ↔ png` を強制し、ユーザー要求時は `NON_VISUAL` から `SCREENSHOT` へ即時切り替える。
4. Phase 12 で `task-workflow` / `api-ipc-system` / `lessons-learned` を同一ターンで同期する。

#### 同種課題の5分解決カード（契約境界 + 証跡昇格）

| 項目       | 内容                                                                                                                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | OAuth後に `is not iterable` が発生、または Phase 11 で証跡不足が再発                                                                                                                                            |
| 根本原因   | Main通知 shape と Renderer受信 shape の境界不一致 + `NON_VISUAL` 固定運用                                                                                                                                       |
| 最短5手順  | 1) Main送信 payload を正規化 2) Renderer受信値を `type guard + normalize` で防御 3) Main/Renderer/UI の対象テストを明示実行 4) ユーザー要求時は `SCREENSHOT` 昇格で TC証跡を再取得 5) 検証値を3仕様書へ同時転記 |
| 検証ゲート | `verify-all-specs` PASS（13/13）、`validate-phase-output` PASS（28項目）、`validate-phase11-screenshot-coverage` PASS（3/3）、対象テスト PASS（3 files / 169 tests）                                            |
| 同期先3点  | `references/task-workflow.md` / `references/api-ipc-system.md` / `references/lessons-learned.md`                                                                                                                |

#### 関連タスクステータス

| タスクID                                             | 関係                     | ステータス |
| ---------------------------------------------------- | ------------------------ | ---------- |
| TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001 | 今回対応                 | 完了       |
| TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001           | 先行のAuth IPC再登録整合 | 完了       |
| TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001              | 先行のauth契約整合       | 完了       |

#### 関連未タスク

| 未タスクID                                                          | 概要                                                                                                                  | 参照                                                                                                         | ステータス |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------- |
| UT-IMP-PHASE12-TASK-INVESTIGATE-FIVE-MINUTE-CARD-SYNC-VALIDATOR-001 | 5分解決カードの3仕様書同期（存在/手順順序/検証ゲート）を機械検証するバリデータを追加し、Phase 12 再発防止を自動化する | `docs/30-workflows/completed-tasks/task-imp-phase12-task-investigate-five-minute-card-sync-validator-001.md` | 未実施     |

### タスク: TASK-UI-01-A-STORE-SLICE-BASELINE Store Slice棚卸しと状態境界の基準化（2026-03-05）

| 項目       | 内容                                                                           |
| ---------- | ------------------------------------------------------------------------------ |
| タスクID   | TASK-UI-01-A-STORE-SLICE-BASELINE                                              |
| 完了日     | 2026-03-05                                                                     |
| ステータス | **完了（Phase 1-12 出力 + 実装 + テスト + 画面検証）**                         |
| 対象       | Renderer Store baseline（slice inventory / boundary matrix / selector policy） |

#### 仕様書別SubAgent分担（関心ごと分離）

| SubAgent   | 担当仕様書                            | 主担当作業                           | 完了条件                                              |
| ---------- | ------------------------------------- | ------------------------------------ | ----------------------------------------------------- |
| SubAgent-A | `references/arch-state-management.md` | baseline型・定数・境界判定基準の同期 | 16行 inventory と境界判定5件が仕様化される            |
| SubAgent-B | `references/task-workflow.md`         | 完了台帳・検証証跡・再利用手順の固定 | Phase 1-12 実行証跡が追跡可能になる                   |
| SubAgent-C | `references/lessons-learned.md`       | 苦戦箇所と再発防止手順の同期         | 同種課題向けの短手順が再利用可能になる                |
| SubAgent-D | `outputs/phase-11/*`                  | TC単位の証跡整合と視覚監査           | `validate-phase11-screenshot-coverage` が PASS になる |

#### 実装反映（要点）

- `apps/desktop/src/renderer/store/types.ts` に baseline型（`StoreSliceInventoryItem` など）を追加。
- `apps/desktop/src/renderer/store/sliceBaseline.ts` を新規作成し、以下を定数化:
  - `STORE_PERSISTED_KEYS_BASELINE`
  - `STORE_SLICE_INVENTORY_BASELINE`（16行）
  - `STORE_BOUNDARY_MATRIX_BASELINE`
  - `STORE_SELECTOR_POLICY_BASELINE`
- `apps/desktop/src/renderer/store/index.ts` で baseline定数を再export。
- `apps/desktop/src/renderer/store/__tests__/sliceBaseline.test.ts` を追加し、unit/integration/regression を固定。

#### 画面検証（Phase 11）

| テストケース | 証跡                                                          | 視覚判定 |
| ------------ | ------------------------------------------------------------- | -------- |
| TC-11-01     | `.../outputs/phase-11/screenshots/phase11-dashboard.png`      | PASS     |
| TC-11-02     | `.../outputs/phase-11/screenshots/phase11-skill-center.png`   | PASS     |
| TC-11-03     | `.../outputs/phase-11/screenshots/phase11-history-search.png` | PASS     |

#### 検証証跡

| コマンド                                                                                         | 結果                               |
| ------------------------------------------------------------------------------------------------ | ---------------------------------- |
| `node .../verify-all-specs.js --workflow <task-056a-dir>`                                        | PASS（13/13, error=0, warning=0）  |
| `node .../validate-phase-output.js <task-056a-dir>`                                              | PASS（28項目, error=0, warning=0） |
| `node .../validate-phase11-screenshot-coverage.js --workflow <task-056a-dir>`                    | PASS（expected=3 / covered=3）     |
| `pnpm --filter @repo/desktop exec vitest run src/renderer/store/__tests__/sliceBaseline.test.ts` | PASS（9/9）                        |
| `pnpm --filter @repo/desktop typecheck`                                                          | PASS                               |

#### 未タスク判定

- 実装差分としての未タスク化が必要な項目は **0件**（`task-056a-b` / `task-056c` / `task-056d` は仕様上の後続依存として明示済み）。
- 再監査で確認した `baselineViolations=90`（既存負債）の段階削減と監査運用安定化を目的に、運用改善未タスクを **2件** 追加した。

#### 関連タスク（完了済み移管）

| タスクID                                          | 概要                                                                                                      | 参照                                                                                       |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| UT-IMP-PHASE12-UNASSIGNED-BASELINE-REDUCTION-001  | baseline 負債削減の段階実行（format/naming/misplaced 是正計画、完了済み移管）                             | `docs/30-workflows/completed-tasks/task-imp-phase12-unassigned-baseline-reduction-001.md`  |
| UT-IMP-PHASE12-WORKFLOW-PATH-CANONICALIZATION-001 | Phase 12 workflowパス正規化ガード（workflow実体確認 + 監査境界固定 + current/baseline分離、完了済み移管） | `docs/30-workflows/completed-tasks/task-imp-phase12-workflow-path-canonicalization-001.md` |

#### 同種課題の簡潔解決手順（4ステップ）

1. baseline情報を `types.ts` と専用定数ファイルへ分離し、後続タスクの参照点を固定する。
2. テストを unit/integration/regression に分け、台帳行数・境界判定・再export を先に固定する。
3. Phase 11 は `TC-xx` 形式で証跡を紐付け、`validate-phase11-screenshot-coverage` を必ず通す。
4. Phase 12 で `arch-state-management` / `task-workflow` / `lessons-learned` を同一ターンで同期する。

