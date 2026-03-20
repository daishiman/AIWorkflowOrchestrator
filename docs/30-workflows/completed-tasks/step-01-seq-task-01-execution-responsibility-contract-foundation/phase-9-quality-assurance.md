# Phase 9: 品質検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                                      |
| ---------- | --------------------------------------------------------- |
| Phase      | 9                                                         |
| Phase 名   | 品質検証                                                  |
| タスクID   | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 |
| 前提 Phase | Phase 8                                                   |
| 後続 Phase | Phase 10（最終レビュー）                                  |
| ステータス | completed                                                 |
| 作成日     | 2026-03-19                                                |
| 機能名     | execution-responsibility-contract-foundation              |

## 目的

execution responsibility / capability 契約基盤の品質・risk・security を review checklist として固定する。
具体的には UX / Architecture / IPC / Security / Workflow の 5 軸で品質チェックリストを作成し、3 つの risk（語彙 drift / state drift / concern 侵食）を severity × impact で分類し、implementation_ready 条件を AC ベースで判定する。

## 実行タスク

### タスク1: 5軸品質チェックリストの作成

以下の5軸を確認し、`outputs/phase-9/quality-checklist.md` に記録する。

**軸1: UX**

- capability × state × CTA テーブル（`integratedRuntime` / `terminalSurface` / `both` / `none` × `ready` / `blocked` / `unavailable` × primary CTA / secondary CTA）が親 UI/UX 正本（`ui-ux-realization.md`）と一致しているか確認する
- 各 capability 状態で primary CTA が 1個、secondary CTA が 1個であることを contract-matrix から確認する
- CTA ラベル文字列に曖昧語句が含まれていないことを確認する
- `settings` public shell / `renderView()` が Task01 契約の consumer として一貫していることを確認する

**軸2: Architecture**

- 3 concern（A: capability 契約 / B: state 語彙統一 / C: CTA 契約）の ownership が SRP に違反していないか確認する
- `RuntimePolicyResolver` が Concern A（capability 契約）のみを担い、Concern B / C に侵食していないか確認する
- Phase 8 の責務再整列結果（`refactor-boundaries.md`）と照合する

**軸3: IPC**

- `AuthModeStatus` DTO の IPC レスポンスが P42 準拠の 3段バリデーション（型チェック → 空文字列 → トリム空文字列）を満たしているか確認する
- IPC envelope（`{ success: boolean, data?: T, error?: { code: string, message: string } }`）形式が P60 準拠であることを確認する
- capability 値（`"integratedRuntime"` / `"terminalSurface"` / `"both"` / `"none"`）が IPC 経由で正しく伝達されることを Phase 4 の test matrix から確認する

**軸4: Security**

- silent fallback 禁止が enforceable であることを確認する（P62: `DEFAULT_CONFIG` への暗黙 fallback が存在しないことを `grep -rn "DEFAULT_CONFIG\|defaultConfig" apps/desktop/src/main/` で確認する手順を記述する）
- auto-send 禁止が enforceable であることを確認する（AI リクエストが capability = `none` のまま送信される経路がないことを確認する）
- hidden prompt injection 禁止が enforceable であることを確認する（ユーザーに見えない形でプロンプトが注入される経路がないことを確認する）

**軸5: Workflow**

- canonical doc set が `.claude/skills/aiworkflow-requirements/references/task-workflow.md` に登録されているか確認する
- Phase 8 の `simplification-candidates.md` で棄却した Alternative A / B が `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` または関連未タスク仕様書に、必要な場合のみ登録されているか確認する（再評価クローズの場合は GitHub Issue を Close する手順を確認する）
- `implementation_ready` の same-wave close-out 条件が `.claude/skills/aiworkflow-requirements/references/task-workflow.md` / `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` と矛盾しないことを確認する

### タスク2: risk 登録

以下の3リスクを severity × impact で整理し、`outputs/phase-9/risk-register.md` に記録する。

**R-1: 語彙 drift**

- 内容: `authMode` と `executionCapability` の共存期間中に、コードベースで両語彙が混在し読み手が混乱する
- severity: High（複数のファイルに影響し、IPC contract と UI 表示が不整合になる可能性がある）
- mitigation: Phase 8 の dual naming 許容条件（X Sprint 以内）を守り、移行期限を PR タイトルに明記する。移行完了後に `grep -rn "authMode"` でゼロヒットを確認する

**R-2: state drift**

- 内容: contract-matrix で定義した `ready` / `blocked` / `unavailable` × CTA の 1:1 マッピングが、Task02 以降の実装で暗黙的に変更される
- severity: High（Task03-05 の UI 実装が誤った状態分岐を参照すると CTA が表示されない / 誤表示になる）
- mitigation: AC-2 の verified 状態を Phase 10 で最終確認する。Task02-05 の Phase 3（設計レビュー）で contract-matrix との照合を必須ゲートとする

**R-3: concern 侵食**

- 内容: Task02（RuntimePolicy Centralization）が Concern A（capability 契約）を上書きし、Task01 で確定した 4状態定義が変更される
- severity: Medium（Task01 が single source of truth として機能しなくなり、後続 Task03-09 の全 concern が不整合になる）
- mitigation: Task02 の Phase 3（設計レビュー）で「Concern A を変更する場合は Task01 の MAJOR 戻りを必須とする」ゲートを設ける

### タスク3: release readiness 判定

以下の条件を全て verified にした場合のみ implementation_ready と判定し、`outputs/phase-9/quality-checklist.md` に記録する。

| 条件                                                                                  | 確認元                                        | verified / unverified |
| ------------------------------------------------------------------------------------- | --------------------------------------------- | --------------------- |
| AC-1: capability 4状態の責務と表示契約が定義されている                                | Phase 2 の contract-matrix                    | -                     |
| AC-2: UI状態語彙と CTA契約が 1:1 で定義されている                                     | Phase 2 の contract-matrix                    | -                     |
| AC-3: silent fallback / auto-send / hidden injection を禁止する境界が文章化されている | Phase 1 の FR-3・Phase 2 の validation-matrix | -                     |
| AC-4: canonical doc set が明示されている                                              | Task index の成果物パス                       | -                     |
| 5軸品質チェックリストが全項目 PASS                                                    | outputs/phase-9/quality-checklist.md          | -                     |
| R-1〜R-3 の mitigation が定義されている                                               | outputs/phase-9/risk-register.md              | -                     |

全条件が verified でない場合、Phase 10 で確認すべき最終観点として `quality-checklist.md` に未解決項目を列挙する。

## 参照資料

| 参照資料                | パス                                                                                        | 確認する内容                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 親パック index          | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                  | 依存順・並列可否・設計ゲート                                       |
| Task index              | docs/30-workflows/step-01-seq-task-01-execution-responsibility-contract-foundation/index.md | 対象 task のメタ情報と受入基準（AC-1〜AC-4）                       |
| Phase 2                 | phase-2-design.md                                                                           | 3 concern 分解・contract-matrix・validation-matrix                 |
| Phase 7                 | phase-7-coverage-check.md                                                                   | coverage-targets / integration-gate（品質 gate 充足の確認元）      |
| Phase 8                 | phase-8-refactoring.md                                                                      | refactor-boundaries.md / simplification-candidates.md の成果物パス |
| Phase 5 outputs         | outputs/phase-5/implementation-plan.md / outputs/phase-5/file-change-scope.md               | ownership / 変更スコープ / 禁止事項                                |
| 親 UI/UX 正本           | docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md      | 状態語彙・CTA・handoff 契約（UX 軸チェックの照合元）               |
| ui-ux-navigation        | .claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md                       | `settings` public shell / `ViewType` / `renderView()` の照合元     |
| interfaces-auth-core    | .claude/skills/aiworkflow-requirements/references/interfaces-auth-core.md                   | capability と auth 型の具体契約（IPC 軸チェックの確認元）          |
| api-ipc-system-core     | .claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md                    | IPC envelope 形式（P60 準拠確認の参照元）                          |
| task-workflow-backlog   | .claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md                  | follow-up formalization の照合元                                   |
| task-workflow-completed | .claude/skills/aiworkflow-requirements/references/task-workflow-completed.md                | completed 化の出口条件                                             |
| lessons-learned-current | .claude/skills/aiworkflow-requirements/references/lessons-learned-current.md                | same-wave sync の照合元                                            |
| spec elegance audit     | .claude/skills/aiworkflow-requirements/references/spec-elegance-consistency-audit.md        | 抽象・整合・依存レビューの基準                                     |

## 実行手順

### ステップ1: Phase 7 の coverage gate と Phase 8 の成果物を確認する

`phase-7-coverage-check.md` の coverage gate（Line 80%、Branch 60%、Function 80%）が PASS していることを確認する。`outputs/phase-8/refactor-boundaries.md` と `outputs/phase-8/simplification-candidates.md` が存在し、AC-1〜AC-4 の維持条件が記録されていることを確認する。

### ステップ2: 5軸品質チェックリストを作成する（タスク1）

UX / Architecture / IPC / Security / Workflow の順に確認を行い、各確認結果を PASS / FAIL / N/A で記録する。FAIL の場合は理由と対応方針を1文で記録する。全項目確認後に `outputs/phase-9/quality-checklist.md` を作成する。

### ステップ3: risk を登録する（タスク2）

R-1（語彙 drift）/ R-2（state drift）/ R-3（concern 侵食）の severity（High/Medium/Low）・impact・mitigation を確定し、`outputs/phase-9/risk-register.md` を作成する。

### ステップ4: release readiness を判定する（タスク3）

AC-1〜AC-4 と 5軸チェックリスト・risk register を照合し、全条件が verified であれば implementation_ready と判定する。unverified の条件が1件以上ある場合は、Phase 10 で確認すべき最終観点として列挙する。

### ステップ5: 完了条件と次Phase handoff を確認する

完了条件チェックリストを全て verified にし、Phase 10 への handoff 条件（quality-checklist.md と risk-register.md が揃っていること）を確認する。

## 統合テスト連携（Phase 1〜11は必須）

manual / automated / system spec の 3 系統で以下を確認する:

| 系統        | 確認内容                                                                                                   | 確認方法                                                                          |
| ----------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| automated   | Phase 4 の test matrix が全 PASS                                                                           | `pnpm --filter @repo/desktop test` の実行結果                                     |
| manual      | capability 4状態 × UI の表示分岐が UX 仕様と一致                                                           | Phase 11 の手動テストチェックリストに引き継ぐ                                     |
| system spec | canonical doc set が `.claude/skills/aiworkflow-requirements/references/task-workflow.md` に登録されている | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の台帳を参照 |

## 多角的チェック観点（AIが判断）

| 観点                   | 適用判断                                                  | 仕様参照先                                                            |
| ---------------------- | --------------------------------------------------------- | --------------------------------------------------------------------- |
| UI/UX                  | capability × state × CTA テーブルの UX 整合を確認する場合 | `aiworkflow-requirements: ui-ux-*`                                    |
| アーキテクチャ         | 3 concern の SRP 違反を確認する場合                       | `aiworkflow-requirements: arch-*`                                     |
| IPC/Preload            | AuthModeStatus DTO の P42 / P60 準拠を確認する場合        | `aiworkflow-requirements: api-ipc-*`, `security-electron-ipc-core.md` |
| ワークフローガバナンス | canonical doc set の登録と risk register を更新する場合   | `aiworkflow-requirements: task-workflow*`, `lessons-learned*`         |

**この task 固有の重点**: 語彙 drift / state drift / simpler alternative の 3 方向で設計を叩く

## サブタスク管理

Phase 実行開始時に、TodoWrite 相当で以下のサブタスクを作成すること:

1. Phase 7 coverage gate と Phase 8 成果物の確認
2. 5軸品質チェックリストの作成（UX / Architecture / IPC / Security / Workflow）
3. risk 登録（R-1 語彙 drift / R-2 state drift / R-3 concern 侵食）
4. release readiness 判定（AC-1〜AC-4 の全条件照合）
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## 成果物

| 成果物             | パス                                 | 内容                                                                                            |
| ------------------ | ------------------------------------ | ----------------------------------------------------------------------------------------------- |
| 品質チェックリスト | outputs/phase-9/quality-checklist.md | 5軸品質チェックリスト（UX / Architecture / IPC / Security / Workflow）と release readiness 判定 |
| リスク登録簿       | outputs/phase-9/risk-register.md     | R-1〜R-3 の severity × impact × mitigation                                                      |

## 完了条件

- [ ] `outputs/phase-9/quality-checklist.md` に5軸の確認結果（PASS/FAIL/N/A）と release readiness 判定が記録されている
- [ ] `outputs/phase-9/risk-register.md` に R-1〜R-3 の severity（High/Medium/Low）と mitigation が記録されている
- [ ] implementation_ready 判定条件（AC-1〜AC-4 の verified 状態）が整理されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-9/` と一致している
- [ ] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [ ] 前Phaseの gate 条件（Phase 8 の refactor-boundaries.md 完成）を満たした前提で実行手順が書かれている

## 次のPhase

- [Phase 10（最終レビュー）](./phase-10-final-review.md)
