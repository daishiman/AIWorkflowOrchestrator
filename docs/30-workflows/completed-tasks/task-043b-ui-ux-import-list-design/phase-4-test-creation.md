# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 4                                     |
| 機能名     | task-043b-ui-ux-import-list-design    |
| タスク名   | TASK-10A-E-B UI/UX インポート一覧設計 |
| 前提Phase  | Phase 3                               |
| 後続Phase  | Phase 5                               |
| 作成日     | 2026-03-06                            |
| ステータス | completed                             |
| 担当       | SubAgent-B                            |

## 目的

UI 仕様を壊さずに実装へ進めるため、単体テスト、統合テスト、アクセシビリティテスト、失敗系テストを先に定義する。

## 背景

`SkillManagementPanel` は既存 currentView 遷移テストを持つ。今回追加する imported / available 2セクション、追加確認ダイアログ、row disabled 条件、live region は既存テストでは未保証である。

## Atent Team 編成

| SubAgent | 関心ごと     | 主担当内容                                           |
| -------- | ------------ | ---------------------------------------------------- |
| B1       | UI単体テスト | 見出し、件数、検索、空状態、文言                     |
| B2       | 追加導線統合 | dialog open / confirm / success / duplicate guard    |
| B3       | A11yテスト   | aria属性、dialog focus、status / alert live region   |
| B4       | 失敗系テスト | import failure、fetch failure、no-result、再試行導線 |

## 実行タスク

- テスト仕様化: 仕様要件を test file 単位へ分解する
- ケース設計: imported / available / mixed / empty / error / success をケース化する
- A11y ケース設計: dialog、button、input、status、alert の検証を定義する
- ハンドオフ設計: `TASK-10A-E-D` が吸収する品質ゲートへ接続する
- 防御ケース設計: nullish metadata、duplicate import、偽失敗を検証対象へ加える

## 参照資料

### 親タスク・コード

| 資料名              | パス                                                                                             | 用途                        |
| ------------------- | ------------------------------------------------------------------------------------------------ | --------------------------- |
| 親タスク仕様        | `../task-043b-ui-ux-import-list-design.md`                                                       | 受け入れ条件の確認          |
| 依存Phase 1 仕様    | `phase-1-requirements.md`                                                                        | FR / NFR の確認             |
| 依存Phase 2 仕様    | `phase-2-design.md`                                                                              | UI 設計の確認               |
| 依存Phase 3 仕様    | `phase-3-design-review.md`                                                                       | リスクと差戻し条件の確認    |
| 現行単体テスト      | `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx`             | 既存ケースの棚卸し          |
| 現行統合テスト      | `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.integration.test.tsx` | 既存 integration 観点       |
| SkillSelectorテスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillSelector.test.tsx`                    | 2セクション、キーボード参考 |
| 要件定義書          | `outputs/phase-1/requirements-definition.md`                                                     | Phase 1 成果物              |
| 受け入れ基準        | `outputs/phase-1/acceptance-criteria.md`                                                         | Phase 1 成果物              |
| スコープ定義        | `outputs/phase-1/scope-definition.md`                                                            | Phase 1 成果物              |
| UI状態棚卸し        | `outputs/phase-1/ui-state-inventory.md`                                                          | Phase 1 成果物              |
| 情報アーキテクチャ  | `outputs/phase-2/information-architecture.md`                                                    | Phase 2 成果物              |
| UI状態マトリクス    | `outputs/phase-2/ui-state-matrix.md`                                                             | Phase 2 成果物              |
| A11y操作契約        | `outputs/phase-2/a11y-interaction-contract.md`                                                   | Phase 2 成果物              |
| 文言ガイド          | `outputs/phase-2/copy-guidelines.md`                                                             | Phase 2 成果物              |
| 設計レビュー結果    | `outputs/phase-3/design-review-result.md`                                                        | Phase 3 成果物              |
| オープンリスク台帳  | `outputs/phase-3/open-risk-register.md`                                                          | Phase 3 成果物              |
| 依存関係判断ログ    | `outputs/phase-3/dependency-decision-log.md`                                                     | Phase 3 成果物              |

### システム仕様（aiworkflow-requirements）

| 資料名        | パス                                                                              | 用途                                  |
| ------------- | --------------------------------------------------------------------------------- | ------------------------------------- |
| テスト設計    | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | unit / error / fixture 粒度           |
| テストfixture | `.claude/skills/aiworkflow-requirements/references/testing-fixtures.md`           | dialog props builder と store fixture |
| A11yテスト    | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      | dialog / button / input / alert       |
| 品質要件      | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | jest-axe、coverage、warning-free      |
| 状態管理      | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | idempotent import と selector 安定性  |

## 実行手順

1. `SkillManagementPanel.test.tsx` 向けに imported / available / mixed / empty / no-result / error のケースを定義する。
2. `SkillManagementPanel.integration.test.tsx` 向けに dialog open、cancel、confirm、success focus、duplicate guard を定義する。
3. `testing-accessibility.md` を基準に `role="dialog"`, `aria-modal`, `aria-labelledby`, `role="status"`, `aria-live`, `role="alert"` の検証をケース化する。
4. `description: null | undefined`、欠損配列、`importedCount=0` でも imported 一覧同期済みのケースを異常系へ含める。
5. `TASK-10A-E-D` へ coverage gate、manual matrix、quality gate の入力をまとめる。

## 統合テスト連携

- テストファイルは `SkillManagementPanel.test.tsx` と `SkillManagementPanel.integration.test.tsx` を主対象にする。
- Store hook の selector 安定性は既存 `agentSlice.selectors.test.ts` の方針へ揃える。
- dialog focus と live region は a11y ケースと manual ケースの両方へ接続する。

## 多角的チェック観点

| 観点               | 本Phaseで確認する内容                                                              | 仕様参照先                                                                                                                                                                                                                               |
| ------------------ | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | テストで新規IPCや危険な直接呼び出しを導入しない                                    | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`, `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                                                      |
| UI/UX              | 見出し、状態表示、フォーカス、ライブリージョン、タッチターゲットを検証対象へ含める | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`, `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`, `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`      |
| アーキテクチャ     | コンポーネント責務と selector 境界を壊さないテスト粒度にする                       | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`, `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                  |
| API/IPC            | IPC戻り値を Store アクション経由で扱う前提を保つ                                   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`, `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                                                  |
| エラーハンドリング | fetch failure、import failure、擬似失敗防止をケース化する                          | `.claude/skills/aiworkflow-requirements/references/error-handling.md`, `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                      |
| テスタビリティ     | `renderHook`、fixture builder、TC-ID 命名を既存パターンへ揃える                    | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`, `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`, `.claude/skills/aiworkflow-requirements/references/testing-fixtures.md` |

### Electronデスクトップアプリ観点

| 層       | 本Phaseで確認する内容                                                        | 仕様参照先                                                                                                                                                      |
| -------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Renderer | list view / dialog / live region / focus contract をテスト化する             | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                                                                         |
| Main     | Main 実装を直接モックせず、Store 経由の境界で確認する                        | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` |
| IPC通信  | 既存 `skill:*` channel の戻り値契約を前提にテスト設計する                    | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                                                            |
| Preload  | Preload を差し替えず、公開Hookの利用境界を守る                               | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                                                                                    |
| Store    | `agentSlice` 個別selector と idempotent import 契約を壊さない fixture を使う | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                    |

## 成果物

| 成果物             | パス                                         | 説明                          |
| ------------------ | -------------------------------------------- | ----------------------------- |
| テスト仕様書       | `outputs/phase-4/test-specification.md`      | テストファイル単位の責務定義  |
| テストケース一覧   | `outputs/phase-4/test-cases.md`              | 正常系 / 異常系 / A11y ケース |
| A11y テスト計画    | `outputs/phase-4/accessibility-test-plan.md` | aria と focus の検証計画      |
| interaction matrix | `outputs/phase-4/interaction-test-matrix.md` | 画面操作と期待結果の対応表    |

## 完了条件

- [x] 正常系、異常系、A11y 系のケースが分離されている
- [x] imported / available / mixed / empty / no-result / error の全状態がカバーされている
- [x] dialog focus と live region の検証が含まれている
- [x] nullish metadata、防御検索、`importedCount` 非依存の成功判定がケースに含まれている
- [x] `TASK-10A-E-D` へ引き渡す観点が整理されている
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 現行テスト棚卸し
2. 正常系ケース設計
3. 異常系ケース設計
4. A11y ケース設計
5. 完了条件確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブルの全ファイルを出力
- [x] 完了条件を全件確認

## 次のPhase

Phase 5: 実装
