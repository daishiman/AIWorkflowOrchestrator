# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                                      |
| ---------- | --------------------------------------------------------- |
| Phase      | 2                                                         |
| Phase 名   | 設計                                                      |
| タスクID   | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 |
| 前提 Phase | Phase 1                                                   |
| 後続 Phase | Phase 3（設計レビュー）                                   |
| ステータス | completed                                                 |
| 作成日     | 2026-03-19                                                |
| 機能名     | execution-responsibility-contract-foundation              |

## 目的

capability / state語彙 / CTA契約の single source of truth を確立するため、3 concern に分解した上で、contract-matrix と validation-matrix を outputs/phase-2 に成果物として残す。Phase 3 が語彙drift / state drift / simpler alternative の 3 方向でレビューできる状態を作る。

## 実行タスク

- concern 分解: Concern A（capability契約）/ Concern B（state語彙統一）/ Concern C（CTA契約）の 3 つに分解し、所有者と境界を表にする
- 契約設計: capability × UI状態 × CTA の全組み合わせを contract-matrix に定義する
- simpler alternative 比較: 2案の trade-off を記録し、採用しない理由を明文化する
- validation matrix 作成: Phase 3 / 4 / 11 / 12 で再利用するレビュー・テスト・手動確認の観点を定義する
- Phase 3 handoff: drift しやすい箇所と blocked 条件を明示する

## 参照資料

| 参照資料                                                 | パス                                                                                                          | 確認する内容                                                  |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 親パック index                                           | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                                    | capability 4状態・禁止事項・concern 分離の方針                |
| Task index                                               | docs/30-workflows/step-01-seq-task-01-execution-responsibility-contract-foundation/index.md                   | AC-1〜AC-4 の検証方法と canonical doc set                     |
| Phase 1 成果物                                           | outputs/phase-1/requirements-definition.md                                                                    | FR-1〜FR-4 / NFR-1〜NFR-2 と Phase 2 への論点（concern 一覧） |
| Phase 1 スコープ                                         | outputs/phase-1/scope-definition.md                                                                           | Task01 の境界と canonical doc set 一覧                        |
| Phase 1 調査                                             | outputs/phase-1/current-state-inventory.md                                                                    | gap-capability / gap-state / gap-prohibition の調査結果       |
| 親 UI/UX 正本                                            | docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md                        | 状態語彙・CTA・handoff 契約の現行定義                         |
| 親パック監査マトリクス                                   | docs/30-workflows/ai-runtime-execution-responsibility-realignment/design-audit-matrix.md                      | 矛盾・依存・漏れの監査軸                                      |
| RuntimePolicyResolver                                    | apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts                                               | capability 判定ロジック（Concern A の ownership 確認）        |
| auth-mode.ts                                             | packages/shared/src/types/auth-mode.ts                                                                        | AuthModeStatus DTO と IPCResponse envelope                    |
| ui-ux-navigation                                         | .claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md                                         | `settings` public shell / `ViewType` / `renderView()` 境界    |
| ui-ux-settings-core                                      | .claude/skills/aiworkflow-requirements/references/ui-ux-settings-core.md                                      | settings shell / timeout fallback の例外契約                  |
| arch-state-management-core                               | .claude/skills/aiworkflow-requirements/references/arch-state-management-core.md                               | Renderer selector 境界と既存 capability 語彙                  |
| interfaces-auth-core                                     | .claude/skills/aiworkflow-requirements/references/interfaces-auth-core.md                                     | capability と auth 型の具体契約                               |
| task-workflow-backlog                                    | .claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md                                    | follow-up formalization と same-wave 条件                     |
| lessons-learned-viewtype-electron-ui                     | .claude/skills/aiworkflow-requirements/references/lessons-learned-viewtype-electron-ui.md                     | route drift 防止                                              |
| lessons-learned-auth-ipc-skill-creator-sync-auth-timeout | .claude/skills/aiworkflow-requirements/references/lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md | settings/auth drift 防止                                      |
| spec elegance audit                                      | .claude/skills/aiworkflow-requirements/references/spec-elegance-consistency-audit.md                          | 抽象・整合・依存レビューの基準                                |

## 実行手順

### ステップ1: 3 concern に分解する

以下の 3 concern に分解し、`outputs/phase-2/design-summary.md` の concern table に記載する。

**Concern A: capability 契約**

- 定義: capability 4状態（integratedRuntime / terminalSurface / both / none）の状態遷移と責務境界
- ownership: `RuntimePolicyResolver.ts` が capability を決定する唯一の authority とする
- 境界: capability の判定ロジックを RuntimePolicyResolver 外に分散させることを禁止する
- 状態遷移: どの入力条件（API key 有無 / terminal 可否）で各 capability に遷移するかを表で定義する

**Concern B: state語彙統一**

- 定義: UI が使う状態語彙（ready / blocked / unavailable）の判定ロジックと表示契約
- ownership: capability → state の変換は Renderer 層の専用 selector / hook が担う。Main Process は既存 transport DTO を返してよいが、UI 語彙の最終 ownership は Renderer 側 selector に固定する
- 判定ルール:
  - `ready`: capability が integratedRuntime または terminalSurface であること
  - `blocked`: capability は存在するが必要な設定が未完了であること（API key 未入力 等）
  - `unavailable`: capability が none であること
- 表示契約: `blocked` は理由テキスト + 解決 action を必ず同時に持つ。`unavailable` は理由テキストのみ（action なしも許容）

**Concern C: CTA 契約**

- 定義: primary CTA 1個 + secondary CTA 1個の表示条件・ラベル・action wiring
- ownership: CTA の表示・非表示・disabled は capability × state の組み合わせだけで決定する。コンポーネント内部で追加条件を持つことを禁止する
- 構成: primary CTA が存在しない state（unavailable）では、primary CTA を非表示（DOM に含まない）にする。disabled は使わない

concern table の列は「concern 名 / ownership ファイル / 入力 / 出力 / 禁止事項」の 5 列とする。

### ステップ2: contract-matrix を定義する

`outputs/phase-2/contract-matrix.md` に以下のマトリクスを作成する。

**capability × state × CTA 全組み合わせテーブル**

| capability        | UI state    | primary CTA ラベル | primary CTA action | secondary CTA ラベル | secondary CTA action | 備考                                            |
| ----------------- | ----------- | ------------------ | ------------------ | -------------------- | -------------------- | ----------------------------------------------- |
| integratedRuntime | ready       | （Phase 3 で確定） | AI 実行            | （Phase 3 で確定）   | 設定を開く           | —                                               |
| terminalSurface   | ready       | （Phase 3 で確定） | terminal に送る    | （Phase 3 で確定）   | ヘルプを開く         | —                                               |
| both              | ready       | （Phase 3 で確定） | AI 実行            | terminal に送る      | —                    | primary/secondary の優先判定を Concern A で定義 |
| none              | unavailable | （非表示）         | —                  | 設定へ               | 設定画面を開く       | primary CTA は DOM に含めない                   |

※ ラベルと action wiring の最終値は Phase 3 PASS 後に確定する。本 Phase ではセル構造と禁止条件を確定する。

**DTO 設計**

IPC response envelope（既存 `AuthModeStatus` を主 transport とし、semantic delta が確認された場合のみ既存 capability 型を拡張する）と Renderer 消費方法を以下の形式で定義する:

```
AuthModeStatus {
  capability: "integratedRuntime" | "terminalSurface" | "both" | "none"
  uiState: "ready" | "blocked" | "unavailable"
  blockedReason?: string          // uiState === "blocked" のとき必須
  blockedAction?: { label: string; targetRoute: string }  // uiState === "blocked" のとき必須
}
```

Renderer は `AuthModeStatus` を IPC 経由で受け取り、selector / hook を通して state 語彙と CTA 契約を導出する。`renderView()` や `settings` 公開シェル例外はこの契約の consumer であり、Task01 で route 実装そのものは定義しない。

**ownership 表**

| concern   | ownership ファイル       | 入力                         | 出力                           | 禁止事項                         |
| --------- | ------------------------ | ---------------------------- | ------------------------------ | -------------------------------- |
| Concern A | RuntimePolicyResolver.ts | API key 有無 / terminal 設定 | capability 値                  | 他ファイルでの capability 再計算 |
| Concern B | Renderer selector/hook   | capability 値                | uiState + blockedReason/Action | Main Process での uiState 計算   |
| Concern C | UI コンポーネント        | capability + uiState         | CTA 表示/非表示                | コンポーネント内追加条件         |

### ステップ3: simpler alternative を検討し採用しない理由を記録する

`outputs/phase-2/design-summary.md` の「simpler alternative」セクションに以下を記録する。

**Alternative A: capability を 2 状態（integrated / manual）に簡素化する**

- 内容: `integratedRuntime` と `terminalSurface` のみに絞り、`both` と `none` を削除する
- trade-off:
  - メリット: concern 数が減り、contract-matrix のセル数が半減する
  - デメリット: 「両方使えるユーザー」と「どちらも使えないユーザー」の UI 分岐が表現できない。`none` を削除すると silent fallback と区別がつかなくなる
- 採用しない理由: `none` の明示的表現は FR-4（禁止事項）の boundary 定義に不可欠。`both` の削除は Task05（policy authority）の設計を先取りして制約することになりスコープ違反

**Alternative B: CTA を state に埋め込む（Concern C を Concern B に統合する）**

- 内容: `uiState` に `primaryCTA` と `secondaryCTA` を直接含める（concern 分離しない）
- trade-off:
  - メリット: concern が 2 つに減り、DTO がシンプルになる
  - デメリット: CTA ラベルを変更するたびに IPC contract の変更が必要になる。ラベルは UI 層の責務であり、Main Process に持ち込むと責務が混在する
- 採用しない理由: CTA ラベルは i18n / A/B test 対象であり、UI 層で管理すべき。IPC contract に含めると Concern A の ownership が破壊される

### ステップ4: Phase 3 handoff を明示する

`outputs/phase-2/design-summary.md` の「Phase 3 handoff」セクションに以下を記録する。

**drift しやすい箇所（Phase 3 で重点レビューする観点）**:

1. **語彙 drift**: コード上で `authMode` / `mode` / `runtime` 等の旧語彙が capability の代わりに使われていないか
2. **state drift**: capability が `both` のとき UI state が `ready` でなく `blocked` になるケースがないか（contract-matrix と実装の乖離）
3. **simpler alternative の再検討**: Alternative A / B が Phase 3 時点で再び浮上した場合は MAJOR 判定とする

**blocked 条件**:

- contract-matrix の全セルが埋まっていない場合は Phase 3 を開始しない
- Concern A / B / C の ownership が 1 ファイルに定まっていない場合は Phase 3 を開始しない

## 統合テスト連携（Phase 1〜11は必須）

contract-matrix の各行を integration point として、Phase 3 以降のレビュー・テスト・手動確認にどう使うかを `outputs/phase-2/validation-matrix.md` に定義する:

| 検証項目                | Phase 3 (review)     | Phase 4 (test)                      | Phase 11 (manual) | Phase 12 (doc)            |
| ----------------------- | -------------------- | ----------------------------------- | ----------------- | ------------------------- |
| capability 判定ロジック | 語彙 drift チェック  | Unit test: RuntimePolicyResolver    | —                 | IPC contract ドキュメント |
| state 変換ロジック      | state drift チェック | Unit test: Renderer selector        | —                 | Renderer 責務ドキュメント |
| CTA 表示条件            | contract-matrix 照合 | Component test: CTA 表示/非表示     | 画面確認          | UI 仕様ドキュメント       |
| 禁止事項（FR-4）        | 境界定義の完全性     | Integration test: fallback 不在確認 | —                 | 禁止事項ドキュメント      |

## 多角的チェック観点（AIが判断）

| 観点                   | 適用判断                                                   | 仕様参照先                                                            |
| ---------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------- |
| UI/UX                  | capability × state × CTA の contract-matrix を定義する     | `aiworkflow-requirements: ui-ux-*`                                    |
| アーキテクチャ         | Concern A の ownership を RuntimePolicyResolver に確定する | `aiworkflow-requirements: arch-*`                                     |
| IPC/Preload            | AuthModeStatus DTO の envelope 設計を確定する              | `aiworkflow-requirements: api-ipc-*`, `security-electron-ipc-core.md` |
| ワークフローガバナンス | simpler alternative の棄却理由を記録する                   | `aiworkflow-requirements: task-workflow*`, `lessons-learned*`         |

**この task 固有の重点**: 語彙 drift / state drift / simpler alternative の 3 方向で設計を叩く

## サブタスク管理

Phase 実行開始時に、TodoWrite 相当で以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 1 成果物を含む）
2. concern 分解と ownership 表の作成（ステップ1）
3. contract-matrix と DTO 設計（ステップ2）
4. simpler alternative 検討と棄却理由記録（ステップ3）
5. Phase 3 handoff 明示（ステップ4）
6. 成果物パスと outputs/phase-2 の整合確認
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## 成果物

| 成果物         | パス                                 | 期待内容                                                                                                                        |
| -------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| 設計サマリー   | outputs/phase-2/design-summary.md    | concern 分解（concern table）・ownership 表・simpler alternative 棄却理由・Phase 3 handoff（drift しやすい箇所 + blocked 条件） |
| 契約マトリクス | outputs/phase-2/contract-matrix.md   | capability × state × CTA の全組み合わせテーブル（禁止条件含む）と AuthModeStatus DTO 設計                                       |
| 検証マトリクス | outputs/phase-2/validation-matrix.md | Phase 3 / 4 / 11 / 12 で使う integration point ごとのレビュー・テスト・手動確認観点                                             |

## 完了条件

- [ ] concern が Concern A / B / C の 3 つに分解され、ownership が 1 ファイルに定まっている
- [ ] contract-matrix の全セル（capability 4状態 × 表示条件 × CTA）が埋まっている
- [ ] AuthModeStatus DTO の envelope 設計が記述されている
- [ ] simpler alternative（Alternative A / B）の trade-off と採用しない理由が記録されている
- [ ] Phase 3 で重点レビューする drift 観点と blocked 条件が明示されている
- [ ] validation-matrix に Phase 3 / 4 / 11 / 12 それぞれの検証観点が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-2/` と一致している
- [ ] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [ ] Phase 4 へ進む前提として Phase 1-3 の gate 条件が明記されている

## 次のPhase

- [Phase 3（設計レビュー）](./phase-3-design-review.md)
