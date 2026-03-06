# Phase 2: 設計

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 2                                     |
| 機能名     | task-043b-ui-ux-import-list-design    |
| タスク名   | TASK-10A-E-B UI/UX インポート一覧設計 |
| 前提Phase  | Phase 1                               |
| 後続Phase  | Phase 3                               |
| 作成日     | 2026-03-06                            |
| ステータス | completed                             |
| 担当       | SubAgent-B                            |

## 目的

Phase 1 で定義した要件を、一覧レイアウト、状態優先順位、文言、追加確認ダイアログ、アクセシビリティへ落とし込む。

## 背景

本タスクは `SkillManagementPanel` 既存 list view を起点に拡張する。`SkillSelector` の2セクション構造と `SkillImportDialog` の確認導線を再利用しつつ、`Task-10A-D` で統合済みの editor / analysis / create 遷移を維持する必要がある。

## Atent Team 編成

| SubAgent | 関心ごと       | 主担当内容                                               |
| -------- | -------------- | -------------------------------------------------------- |
| B1       | レイアウト     | セクション順序、件数表示、一覧密度、見出しレベル         |
| B2       | 状態設計       | loading / empty / no-result / error / success の優先順位 |
| B3       | A11y設計       | `aria-live`、dialog focus、行ボタンの accessible name    |
| B4       | テスト引き渡し | Phase 4 のテストケース粒度へ変換                         |

## 実行タスク

- 情報設計: imported を先頭、available を後段に置く一覧構成と件数表示を定義する
- 状態設計: global loading、section empty、search no-result、import error の優先順位を定義する
- 文言設計: 見出しはドメイン語を維持し、CTA と結果文はやさしい日本語へ変換する
- A11y設計: 検索入力、section region、list item、dialog、alert、status の役割を定義する

## 参照資料

### 親タスク・コード

| 資料名             | パス                                                                  | 用途                                  |
| ------------------ | --------------------------------------------------------------------- | ------------------------------------- |
| 親タスク仕様       | `../task-043b-ui-ux-import-list-design.md`                            | UI決定事項の確認                      |
| 依存Phase 1 仕様   | `phase-1-requirements.md`                                             | 要件の参照                            |
| 依存Phase 1 成果物 | `outputs/phase-1/requirements-definition.md`                          | FR一覧                                |
| 依存Phase 1 成果物 | `outputs/phase-1/acceptance-criteria.md`                              | AC一覧                                |
| 現行パネル         | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx` | 現在の list view 構成                 |
| 先行2セクションUI  | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`        | imported / available ヘッダーパターン |
| 確認ダイアログ     | `apps/desktop/src/renderer/components/skill/SkillImportDialog.tsx`    | dialog role と focus trap             |
| Store公開Hook      | `apps/desktop/src/renderer/store/index.ts`                            | 個別selector / action の固定          |
| スコープ定義       | `outputs/phase-1/scope-definition.md`                                 | Phase 1 成果物                        |
| UI状態棚卸し       | `outputs/phase-1/ui-state-inventory.md`                               | Phase 1 成果物                        |

### システム仕様（aiworkflow-requirements）

| 資料名               | パス                                                                                                       | 用途                                          |
| -------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| UIコンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                    | CardGrid / SearchFilterList / dialog 規約     |
| UI設計原則           | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                             | 文言変換、フォーカス、ライブリージョン        |
| UIデザインシステム   | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                                 | 状態色とアニメーション                        |
| UI機能仕様           | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                            | SearchFilterList / CardGrid の利用指針        |
| UIアーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                                  | SkillManagementPanel の責務境界               |
| 状態管理             | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                               | imported / available / idempotent import 契約 |
| SkillCenter UI       | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` の `SkillCenterView UI` 節 | nullish 防御と探索UI成功パターン              |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                | `skill.id/name` と戻り値誤読の防止            |
| A11yテスト           | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                               | `aria-live` / `role="alert"` / dialog 要件    |

## 実行手順

1. 一覧ヘッダーに検索入力、総件数ステータス、セクション見出しを配置する情報設計を作成する。
2. query が空で両 section とも 0件のときは単一の global empty state を表示し、どちらか一方に1件以上あるときは2つの section 見出しを維持したまま空 section には inline empty state を表示する。
3. CTA は `追加する`、成功文言は `追加しました`、失敗文言は `もう一度試してみてください` を含む形で固定する。
4. `SkillImportDialog` を opened state の確認導線として使い、直接 `importSkill` を叩くのはダイアログ確定ボタンだけに限定する。
5. 追加成功時は新しく imported 側へ移動した項目へフォーカスを戻し、`aria-live="polite"` で通知する。
6. `description ?? ""` と `normalizeSearchText` 相当の正規化を前提に、欠損メタデータでも検索と一覧表示が継続する条件を固定する。
7. 成功判定は `importedCount` ではなく imported 一覧反映、error 未残置、対象 row 非表示で行う。

## 統合テスト連携

- `SkillManagementPanel.test.tsx` では見出し、件数、検索適用、空状態、失敗状態を検証する。
- `SkillManagementPanel.integration.test.tsx` では dialog open / close、追加成功後の section 移動、既存 currentView 遷移維持を検証する。
- `testing-accessibility.md` の dialog / button / alert / status パターンをテストケースへ引き渡す。
- nullish metadata、防御検索、偽失敗防止を Phase 4 / 6 の異常系と edge case へ引き渡す。

## エレガント解決方針

| 観点     | 採用方針                                                                  | 破棄する設計                                    |
| -------- | ------------------------------------------------------------------------- | ----------------------------------------------- |
| 検索     | 1入力で 2セクションを同時絞り込み、件数表示も1箇所で管理する              | section ごとに検索入力を分ける                  |
| 状態表示 | global empty と inline empty を使い分け、情報量を最小化する               | 常に両 section に空カードを並べて情報過多にする |
| 追加導線 | 一覧は trigger、dialog は confirm、Store は import 実行だけに責務分離する | row から即 import して確認経路を潰す            |
| 境界防御 | nullish metadata、duplicate import、偽失敗を最初から仕様化する            | 正常データ前提で後からバグ修正する              |

## ローカル Hook 方針

- 新規 Store slice や global な合成 hook は追加しない。
- ただし local UI state が `importDialogSkill`、focus return、検索補助の3責務を超える場合は、`useSkillCenter` と同じく「既存個別selector + ローカル state だけを束ねる view 専用 hook」を許容する。
- 許容する local hook は IPC を直接呼ばず、既存 Store action を呼ぶだけに限定する。

## 不変条件

- 新規IPC、Preload API、Main service、Store state は追加しない。
- list branch だけを対象にし、`currentView` の既存 `editor/analysis/create` 分岐は変更しない。
- 成功判定は `importedCount` 単独で行わず、imported 一覧反映と error 未残置を必須条件にする。
- `description ?? ""`、配列 nullish 吸収、duplicate import 防止、focus return は設計時点で必須条件として固定する。

## 依存境界

| 依存先         | 本Phaseで固定する境界                                                               |
| -------------- | ----------------------------------------------------------------------------------- |
| `TASK-10A-E-A` | `skill:*` 契約は既存I/Fを利用し、新規 channel や戻り値拡張を要求しない              |
| `TASK-10A-E-C` | `agentSlice` 個別selector / action / idempotent import 契約を前提に UI 設計を閉じる |
| `TASK-10A-D`   | list UI 以外の view 統合責務へ踏み込まない                                          |

## 多角的チェック観点

| 観点               | 本Phaseで確認する内容                                                                       | 仕様参照先                                                                                                                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | 新規IPC/Preload/API追加なしを維持し、Renderer内のUI設計に閉じること                         | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`, `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                                                      |
| UI/UX              | 2セクション、状態表示、文言、フォーカス、ライブリージョン、44pxターゲットを設計へ落とし込む | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`, `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`, `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`      |
| アーキテクチャ     | `SkillManagementPanel` の責務境界と既存 `editor/analysis/create` view 非侵食を確認する      | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`, `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                  |
| API/IPC            | `skill:list` / `skill:getImported` / `skill:import` の既存契約再利用に限定する              | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`, `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                                                  |
| エラーハンドリング | 擬似失敗、二重追加、stale error、再試行導線を状態優先順位へ組み込む                         | `.claude/skills/aiworkflow-requirements/references/error-handling.md`, `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                      |
| テスタビリティ     | TC-ID、selector、fixture、manual evidence の対応を前提に設計する                            | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`, `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`, `.claude/skills/aiworkflow-requirements/references/testing-fixtures.md` |

### Electronデスクトップアプリ観点

| 層       | 本Phaseで確認する内容                                         | 仕様参照先                                                                                                                                                      |
| -------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Renderer | list view / dialog / live region / focus contract を設計する  | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                                                                         |
| Main     | 新規サービス追加なし、既存 handler 契約を変えない             | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` |
| IPC通信  | 既存 `skill:*` channel を再利用し、新規 channel を追加しない  | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                                                            |
| Preload  | 新規公開API追加なしを確認する                                 | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                                                                                    |
| Store    | `agentSlice` 個別selector と idempotent import 契約を維持する | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                    |

## 成果物

| 成果物         | パス                                           | 説明                                           |
| -------------- | ---------------------------------------------- | ---------------------------------------------- |
| 情報設計       | `outputs/phase-2/information-architecture.md`  | セクション順序、一覧密度、見出し構造           |
| 状態マトリクス | `outputs/phase-2/ui-state-matrix.md`           | loading / empty / no-result / error の優先順位 |
| A11y 操作契約  | `outputs/phase-2/a11y-interaction-contract.md` | aria属性、フォーカス、キー操作                 |
| 文言ガイド     | `outputs/phase-2/copy-guidelines.md`           | 見出し、CTA、成功/失敗文言                     |

## 完了条件

- [x] imported / available の順序と件数表示が定義されている
- [x] 状態優先順位が単一表で定義されている
- [x] CTA と結果文言が固定されている
- [x] 追加成功時のフォーカス復帰と live region が定義されている
- [x] global empty / inline empty の使い分け、nullish metadata 防御、`importedCount` 非依存の成功判定が定義されている
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. レイアウト定義
2. 状態マトリクス作成
3. A11y 契約定義
4. 文言固定
5. 完了条件確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブルの全ファイルを出力
- [x] 完了条件を全件確認

## 次のPhase

Phase 3: 設計レビューゲート
