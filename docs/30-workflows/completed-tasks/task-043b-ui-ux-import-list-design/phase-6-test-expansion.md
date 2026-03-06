# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 6                                     |
| 機能名     | task-043b-ui-ux-import-list-design    |
| タスク名   | TASK-10A-E-B UI/UX インポート一覧設計 |
| 前提Phase  | Phase 5                               |
| 後続Phase  | Phase 7                               |
| 作成日     | 2026-03-06                            |
| ステータス | completed                             |
| 担当       | SubAgent-B                            |

## 目的

Phase 4 で定義した基本ケースを拡張し、mixed state、duplicate import、import failure、focus return、長文、レスポンシブ差分を回帰観点へ追加する。

## 背景

`agentSlice.importSkill` は idempotent guard を持ち、`availableSkillsMetadata` から即時除外する。UI ではこの挙動を取りこぼすと、擬似失敗、二重追加、フォーカス迷子が発生しやすい。

## Atent Team 編成

| SubAgent | 関心ごと     | 主担当内容                                       |
| -------- | ------------ | ------------------------------------------------ |
| B1       | Edge case    | duplicate import、empty 組み合わせ、long text    |
| B2       | Interaction  | dialog cancel / confirm、row disabled、focus     |
| B3       | Visual state | loading / error / no-result / success の画面証跡 |
| B4       | Regression   | Phase 4 ケースとの差分整理                       |

## 実行タスク

- ケース拡張: imported 0 / available 0 / 両方0 / query no-result / duplicate import / nullish metadata を追加する
- 失敗系拡張: fetch failure、import failure、dialog cancel 後の復帰を追加する
- 視覚状態拡張: desktop / mobile / light / dark の画面証跡対象を固定する
- 回帰整理: currentView 遷移と list view 拡張の回帰境界を整理する

## 参照資料

### 親タスク・コード

| 資料名                      | パス                                                                                             | 用途                   |
| --------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------- |
| 親タスク仕様                | `../task-043b-ui-ux-import-list-design.md`                                                       | 受け入れ条件の再確認   |
| 依存Phase 5 仕様            | `phase-5-implementation.md`                                                                      | 実装境界の確認         |
| 依存Phase 5 成果物          | `outputs/phase-5/implementation-plan.md`                                                         | 実装順序               |
| 依存Phase 5 成果物          | `outputs/phase-5/selector-action-map.md`                                                         | selector / action 参照 |
| 現行単体テスト              | `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx`             | 拡張対象               |
| 現行統合テスト              | `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.integration.test.tsx` | 拡張対象               |
| テスト仕様                  | `outputs/phase-4/test-specification.md`                                                          | Phase 4 成果物         |
| テストケース                | `outputs/phase-4/test-cases.md`                                                                  | Phase 4 成果物         |
| アクセシビリティテスト計画  | `outputs/phase-4/accessibility-test-plan.md`                                                     | Phase 4 成果物         |
| interactionテストマトリクス | `outputs/phase-4/interaction-test-matrix.md`                                                     | Phase 4 成果物         |
| コンポーネント境界図        | `outputs/phase-5/component-boundary-map.md`                                                      | Phase 5 成果物         |
| import flow wireframe       | `outputs/phase-5/import-flow-wireframe.md`                                                       | Phase 5 成果物         |

### システム仕様（aiworkflow-requirements）

| 資料名        | パス                                                                              | 用途                                      |
| ------------- | --------------------------------------------------------------------------------- | ----------------------------------------- |
| テスト設計    | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | edge case の粒度                          |
| テストfixture | `.claude/skills/aiworkflow-requirements/references/testing-fixtures.md`           | state matrix と dialog props の再利用     |
| A11yテスト    | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      | focus / live region / alert               |
| 品質要件      | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | regression / coverage / warning-free 条件 |
| 状態管理      | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | duplicate import と stale error 防止      |

## 実行手順

1. Phase 4 の test case を入力として edge case を追加する。
2. `importedSkills` と `availableSkillsMetadata` の件数組み合わせを表にし、表示結果を固定する。
3. `description: null | undefined`、欠損配列、空文字検索、長文検索でも一覧と検索が継続する条件を追加する。
4. import 失敗後に list が消えない条件、error alert が 1件だけ表示される条件、dialog close 後にトリガーへ focus return する条件を追加する。
5. idempotent 成功で `importedCount=0` でも error を出さず、既存 imported 側同期を優先する条件を追加する。
6. Phase 11 の screenshot 対象へ mixed state、error state、no-result state、dialog state、nullish metadata state を渡す。

## 統合テスト連携

- `SkillManagementPanel.test.tsx` へ state matrix の境界値を追加する。
- `SkillManagementPanel.integration.test.tsx` へ dialog cancel / confirm / duplicate guard を追加する。
- Phase 11 manual test と同じ TC ID を使い、非視覚観点と視覚観点を対応付ける。

## 多角的チェック観点

| 観点               | 本Phaseで確認する内容                                                    | 仕様参照先                                                                                                                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | テスト拡充でも新規IPCや危険な直接呼び出しを導入しない                    | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`, `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                                                      |
| UI/UX              | mixed / empty / no-result / error / success のUI状態を漏れなく定義する   | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`, `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`, `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`      |
| アーキテクチャ     | コンポーネント責務と selector 境界を保ったまま回帰観点を増やす           | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`, `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                  |
| API/IPC            | 既存 `skill:*` 契約のまま duplicate guard と失敗系を確認する             | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`, `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                                                  |
| エラーハンドリング | 擬似失敗、二重追加、stale error、alert 重複表示を拡張ケースに含める      | `.claude/skills/aiworkflow-requirements/references/error-handling.md`, `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                      |
| テスタビリティ     | `renderHook`、fixture builder、TC-ID、screenshot matrix の対応を固定する | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`, `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`, `.claude/skills/aiworkflow-requirements/references/testing-fixtures.md` |

### Electronデスクトップアプリ観点

| 層       | 本Phaseで確認する内容                                                        | 仕様参照先                                                                                                                                                      |
| -------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Renderer | list view / dialog / live region / focus contract の回帰を拡張する           | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                                                                         |
| Main     | Main 実装追加なしの前提で Renderer / Store 観点へ閉じる                      | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` |
| IPC通信  | 既存 `skill:*` channel の戻り値契約を前提に edge case を定義する             | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                                                            |
| Preload  | Preload を増やさず既存公開Hookだけを使う                                     | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                                                                                    |
| Store    | `agentSlice` 個別selector と idempotent import 契約を壊さない fixture を使う | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                    |

## 成果物

| 成果物                | パス                                     | 説明                        |
| --------------------- | ---------------------------------------- | --------------------------- |
| テスト拡充計画        | `outputs/phase-6/test-expansion-plan.md` | 追加ケース一覧              |
| 回帰マトリクス        | `outputs/phase-6/regression-matrix.md`   | 既存挙動と新挙動の交差表    |
| edge case 一覧        | `outputs/phase-6/edge-case-cases.md`     | 境界値と失敗系              |
| screenshot マトリクス | `outputs/phase-6/screenshot-matrix.md`   | Phase 11 へ渡す画面証跡一覧 |

## 完了条件

- [x] empty / no-result / error / success / duplicate の拡張ケースが定義されている
- [x] dialog cancel / confirm / focus return が定義されている
- [x] screenshot 対象が TC 単位で定義されている
- [x] nullish metadata と `importedCount` 非依存の idempotent 成功ケースが定義されている
- [x] 回帰マトリクスが currentView 系を含んでいる
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Edge case 追加
2. Interaction 追加
3. Screenshot matrix 作成
4. Regression 整理
5. 完了条件確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブルの全ファイルを出力
- [x] 完了条件を全件確認

## 次のPhase

Phase 7: テストカバレッジ確認
