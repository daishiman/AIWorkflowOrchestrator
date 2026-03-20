# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                                      |
| ---------- | --------------------------------------------------------- |
| Phase      | 5                                                         |
| Phase 名   | 実装                                                      |
| タスクID   | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 |
| 前提 Phase | Phase 4                                                   |
| 後続 Phase | Phase 6（テスト拡充）                                     |
| ステータス | completed                                                 |
| 作成日     | 2026-03-19                                                |
| 機能名     | execution-responsibility-contract-foundation              |

## 目的

capability / state 語彙 / CTA 契約の正本を確定する変更順序・ownership・禁止事項を future executor 向けに固定する。本 Phase で「何を・どの順で・誰が変更するか」を設計文書として定義し、実装時の解釈ブレを防ぐ。

## 実行タスク

### タスク1: 実装順序設計

以下の順で変更を適用する計画を outputs/phase-5/implementation-plan.md に定義する。順序を変えると後続ステップの型参照が壊れるため、必ずこの順に従うこと。

| ステップ | 対象                                                              | 内容                                                                                                                         |
| -------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1        | `.claude` canonical / `packages/shared/src/types/`                | 既存 canonical capability 語彙（`AccessCapability` と `AuthModeStatus`）を確認し、新規型追加よりも既存契約の再利用を優先する |
| 2        | `packages/shared/src/types/auth-mode.ts`                          | transport DTO に capability / blocked reason / action を最小差分で載せる。不要な全面 rename は行わない                       |
| 3        | `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts` | capability 判定 authority を Main に集約し、surface-local 判定をなくす                                                       |
| 4        | `apps/desktop/src/main/handlers/`                                 | IPC envelope を既存 canonical 形式に整列させ、Renderer へ status DTO を配布する                                              |
| 5        | `apps/desktop/src/renderer/store/`                                | selector / hook で `ready / blocked / unavailable` と CTA 契約を導出する。`ViewType` / `renderView()` は consumer に留める   |
| 6        | `apps/desktop/src/renderer/components/`                           | settings shell / main chat / workspace / terminal handoff の consumer を contract-matrix に揃える                            |

### タスク2: ownership 固定

各 concern の所有境界を変更ファイルと対応させて定義する。

| Concern                      | Ownership 範囲                                                                                                | 変更ファイル                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Concern A（capability 契約） | Main Process のみが capability を判定する。Renderer は判定しない                                              | `RuntimePolicyResolver.ts`, `packages/shared/src/types/` |
| Concern B（state 語彙統一）  | transport DTO は shared type に置き、UI 語彙の最終 ownership は Renderer selector / hook に置く               | `auth-mode.ts`, Zustand selector / hook                  |
| Concern C（CTA 契約）        | CTA コンポーネントは state 語彙と capability の組み合わせのみで表示条件を決定する。ビジネスロジックを持たない | CTA コンポーネント, guidance action wiring               |

### タスク3: 禁止事項明記

以下の禁止事項を violation example 付きで outputs/phase-5/implementation-plan.md に記録する。

**禁止1: silent fallback**

capability = none 時に `integrated_api` へ暗黙 fallback しない。

```typescript
// 違反例（禁止）
const capability = resolver.resolve(runtimeInputs) ?? "integrated_api";

// 正しい実装
const capability = resolver.resolve(runtimeInputs);
if (capability === "none") {
  // blocked state を返す。fallback しない
  return { capability: "none", uiState: "blocked" };
}
```

**禁止2: local 判定（Renderer での capability 直接判定）**

Renderer で authMode や apiKey を見て capability を直接判定しない。Main authority 経由の `AuthModeStatus` DTO のみを使用する。

```typescript
// 違反例（禁止）
const capability = hasIntegratedLane ? "integratedRuntime" : "terminalSurface";

// 正しい実装
const status = useRuntimeCapabilityStatus();
const uiState = selectUiState(status);
```

**禁止3: no-op CTA**

blocked / unavailable 状態で「クリックしても何もしないボタン」を表示しない。blocked 時は必ず設定画面遷移または解決 action を primary CTA とする。

```typescript
// 違反例（禁止）
<button disabled={uiState === "blocked"}>送信</button>

// 正しい実装
{uiState === "blocked" && <button onClick={navigateToSettings}>設定を修正する</button>}
```

**禁止4: hidden prompt injection**

terminal handoff 時に不可視の追加コンテキストをプロンプトに挿入しない。`TerminalHandoffBuilder.build` の出力は UI 上に表示された内容のみを含む。

## 参照資料

| 参照資料                   | パス                                                                                        | 確認する内容                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 親パック index             | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                  | 依存順・並列可否・設計ゲート                                        |
| Task index                 | docs/30-workflows/step-01-seq-task-01-execution-responsibility-contract-foundation/index.md | 対象 task のメタ情報と受入基準                                      |
| Phase 2                    | phase-2-design.md                                                                           | ownership 表・contract-matrix の全組み合わせ                        |
| Phase 4                    | phase-4-test-creation.md                                                                    | mock 戦略と IPC response envelope の形式                            |
| 親 UI/UX 正本              | docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md      | 状態語彙・CTA 契約の canonical 定義                                 |
| RuntimePolicyResolver      | apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts                             | resolve() の現在の実装（integrated_api / terminal_handoff の 2 択） |
| TerminalHandoffBuilder     | apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts                            | handoff bundle の構築ロジック                                       |
| ui-ux-navigation           | .claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md                       | `settings` public shell / `renderView()` consumer 境界              |
| arch-state-management-core | .claude/skills/aiworkflow-requirements/references/arch-state-management-core.md             | 既存 capability 語彙と selector 境界                                |
| interfaces-auth-core       | .claude/skills/aiworkflow-requirements/references/interfaces-auth-core.md                   | capability と auth 型の具体契約                                     |
| api-ipc-system-core        | .claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md                    | IPC response envelope の形式（P60 対策）                            |

## 実行手順

### ステップ1: Phase 2 の ownership 表と Phase 4 の mock 戦略を読み、変更スコープを確定する

outputs/phase-2/contract-matrix.md と outputs/phase-4/mock-strategy.md を参照する。未確定の型定義・IPC チャンネル名があれば本ステップで確定する。

### ステップ2: packages/shared → apps/desktop/main → apps/desktop/renderer の順で変更計画を記述する

タスク1の実装順序（ステップ1〜6）を outputs/phase-5/implementation-plan.md に詳細化する。各ステップに「変更前の状態」「変更後の状態」「依存するステップ」を記載する。

### ステップ3: 各変更ファイルの concern ownership を表にまとめる

タスク2の ownership 固定内容を outputs/phase-5/file-change-scope.md に転記する。「対象ファイル / concern / 変更概要 / 変更しないこと」の 4 列構成で記録する。

### ステップ4: 禁止事項を violation example 付きで記録する

タスク3の禁止事項（4 件）を outputs/phase-5/implementation-plan.md の末尾に追記する。violation example は実際のファイルパスと関数名を含めること。

## 統合テスト連携

変更順序（packages/shared → main → renderer）が Phase 4 で定義した統合シナリオ S-1〜S-3 の前提を壊さないことを確認する。具体的には以下を検証する：

- ステップ1（型定義）完了後、Phase 4 の CA-1〜CA-5 のテストが型エラーなく記述できること
- ステップ4（IPC handler）完了後、Phase 4 の IPC response envelope mock が実装と一致すること
- ステップ6（CTA コンポーネント）完了後、Phase 4 の CC-1〜CC-5 のテストが実行可能な状態になること

## 多角的チェック観点（AIが判断）

| 観点                   | 適用判断                                                  | 仕様参照先                                                            |
| ---------------------- | --------------------------------------------------------- | --------------------------------------------------------------------- |
| UI/UX                  | CTA 表示条件・state 語彙が変更される                      | `aiworkflow-requirements: ui-ux-*`                                    |
| アーキテクチャ         | capability 判定責務が Main に集中しているか（DIP 準拠か） | `aiworkflow-requirements: arch-*`                                     |
| IPC/Preload            | IPC ハンドラ引数の ownership / P61 DIP 違反チェック       | `aiworkflow-requirements: api-ipc-*`, `security-electron-ipc-core.md` |
| ワークフローガバナンス | ledger / backlog / lessons を触る場合                     | `aiworkflow-requirements: task-workflow*`, `lessons-learned*`         |

**この task 固有の重点**: 語彙 drift / state drift / simpler alternative の 3 方向で設計を叩く

## サブタスク管理

Phase 実行開始時に、TodoWrite 相当で以下のサブタスクを作成すること:

1. Phase 2 ownership 表と Phase 4 mock 戦略の確認
2. 実装順序設計（ステップ1〜6 の詳細化）
3. ownership 固定表の作成（Concern A/B/C ごと）
4. 禁止事項の violation example 付き記録（4 件）
5. 統合テスト連携の前提確認
6. 成果物パスと outputs/phase-5/ の整合確認
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## 成果物

| 成果物       | パス                                   | 内容                                                    |
| ------------ | -------------------------------------- | ------------------------------------------------------- |
| 実装計画     | outputs/phase-5/implementation-plan.md | 変更順序・ownership・禁止事項（violation example 付き） |
| 変更スコープ | outputs/phase-5/file-change-scope.md   | 対象ファイル一覧と各ファイルの変更概要・変更しないこと  |

## 完了条件

- [ ] 実装順序（ステップ1〜6）が packages/shared → main → renderer の順で定義されている
- [ ] Concern A/B/C の ownership 境界が変更ファイルと対応付けて定義されている
- [ ] 禁止事項が 4 件（silent fallback / local 判定 / no-op CTA / hidden injection）、violation example 付きで記録されている
- [ ] 変更スコープ（対象ファイル一覧・変更しないファイル）が明確になっている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-5/` と一致している
- [ ] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [ ] 前Phaseの gate 条件（Phase 4 完了条件チェックリスト全通過）を満たした前提で実行手順が書かれている

## 次のPhase

- [Phase 6（テスト拡充）](./phase-6-test-expansion.md)
