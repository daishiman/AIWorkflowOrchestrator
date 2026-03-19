# TASK-IMP-LIFECYCLE-TERMINAL-INTEGRATION-001

## メタ情報

| 項目       | 内容                                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-LIFECYCLE-TERMINAL-INTEGRATION-001                                                                |
| 責務       | SkillLifecyclePanel と Terminal 系コンポーネント（TerminalHandoffCard / PersistentTerminalLauncher）の統合 |
| ステータス | 全 Phase 仕様書作成済み（Phase 1 未実行）                                                                  |
| 優先度     | High                                                                                                       |
| 依存タスク | TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION（完了済み）                                                      |
| 前提仕様書 | `ui-ux-realization.md` terminal handoff 5契約、`ui-ux-diagrams.md` コンポーネント図                        |

## 背景・問題点

以下の未接続状態（GAP）が調査で判明した。

| GAP ID | 対象ファイル                       | 問題内容                                         |
| ------ | ---------------------------------- | ------------------------------------------------ |
| C-02   | `SkillLifecyclePanel.tsx:420-435`  | ヘッダーに固定 Terminal ボタンがない             |
| C-03   | `SkillLifecyclePanel.tsx`          | TerminalHandoffCard が import されておらず未接続 |
| C-07   | `TerminalHandoffBuilder.ts:80-105` | improve→terminal で前回改善結果の要約転送なし    |
| D-02   | SkillLifecyclePanel                | TerminalDock が未接続                            |

## Phase 一覧

| Phase | 名称             | 仕様書                      | 目的                                       | ゲート                    | 仕様書ステータス |
| ----- | ---------------- | --------------------------- | ------------------------------------------ | ------------------------- | ---------------- |
| 1     | 要件定義         | `phase-1-requirements.md`   | terminal handoff 統合要件の明確化          | -                         | 作成済み         |
| 2     | 設計             | `phase-2-design.md`         | コンポーネント設計・インターフェース設計   | -                         | 作成済み         |
| 3     | 設計レビュー     | `phase-3-design-review.md`  | 要件・設計の妥当性検証                     | PASS/MINOR/MAJOR          | 作成済み         |
| 4     | テスト作成       | `phase-4-test-creation.md`  | テストケース設計・テストコード作成         | -                         | 作成済み         |
| 5     | 実装             | `phase-5-implementation.md` | プロダクションコード実装                   | -                         | 作成済み         |
| 6     | テスト拡充       | `phase-6-test-expansion.md` | カバレッジ不足箇所のテスト追加             | -                         | 作成済み         |
| 7     | カバレッジ確認   | `phase-7-coverage.md`       | カバレッジ基準の充足確認                   | 未達→Phase 6              | 作成済み         |
| 8     | リファクタリング | `phase-8-refactor.md`       | コード品質改善                             | -                         | 作成済み         |
| 9     | 品質検証         | `phase-9-quality.md`        | Lint・型チェック・全テスト実行             | -                         | 作成済み         |
| 10    | 最終レビュー     | `phase-10-final-review.md`  | 多角的品質・整合性検証                     | PASS/MINOR/MAJOR/CRITICAL | 作成済み         |
| 11    | 手動テスト       | `phase-11-manual-test.md`   | UIテスト・E2Eシナリオ実行                  | -                         | 作成済み         |
| 12    | ドキュメント     | `phase-12-documentation.md` | 実装ガイド・システム仕様更新・未タスク検出 | -                         | 作成済み         |
| 13    | 完了             | `phase-13-completion.md`    | 成果物最終確認・PR準備                     | -                         | 作成済み         |

## 成果物パス規則

```
docs/30-workflows/skill-lifecycle-unification/tasks/step-07-par-task-09-lifecycle-terminal-integration/
  index.md                  # 本ファイル
  phase-1-requirements.md
  phase-2-design.md
  phase-3-design-review.md
  ...
  outputs/
    phase-1/requirements-analysis.md
    phase-2/design-document.md
    phase-3/design-review-report.md
    ...
```

## 実装対象ファイル（想定）

| ファイル                  | パス                                                                 | 変更内容                                      |
| ------------------------- | -------------------------------------------------------------------- | --------------------------------------------- |
| SkillLifecyclePanel.tsx   | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | Terminal ボタン追加・TerminalHandoffCard 接続 |
| TerminalHandoffBuilder.ts | `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`   | buildForSkillImprovement() 新メソッド追加     |
| agentSlice.ts（参照）     | `apps/desktop/src/renderer/store/slices/agentSlice.ts`               | handoffGuidance 状態の接続確認                |

## 参照資料

| 資料                          | パス                                                                                         |
| ----------------------------- | -------------------------------------------------------------------------------------------- |
| UI/UX 正本                    | `docs/30-workflows/skill-lifecycle-unification/ui-ux-realization.md`                         |
| UI/UX 図解                    | `docs/30-workflows/skill-lifecycle-unification/ui-ux-diagrams.md`                            |
| TerminalHandoffCard           | `apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/TerminalHandoffCard.tsx` |
| TerminalHandoffBuilder        | `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`                           |
| agentSlice（handoffGuidance） | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                       |
| ストアセレクタ                | `apps/desktop/src/renderer/store/index.ts`（L805-812）                                       |
