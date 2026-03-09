# Phase 11: 手動テスト検証 - スキルライフサイクル統合テスト強化

## メタ情報

| 項目      | 内容                     |
| --------- | ------------------------ |
| タスクID  | TASK-10A-G               |
| Phase     | 11                       |
| 名称      | 手動テスト検証           |
| 依存Phase | Phase 10（最終レビュー） |
| 次Phase   | Phase 12（ドキュメント） |

---

## 目的

Phase 4-10 で作成・検証したテストコードが、実際のスキルライフサイクルフローを正しく保護していることを手動実行で最終確認する。自動テスト結果の再確認に加え、ユーザーの明示要求に基づいて関連UIのスクリーンショット証跡を current workflow 配下へ取得し、画面整合も確認する。

---

## 参照資料

| 参照資料                   | パス                                                                                                 | 使用目的                           |
| -------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Phase 2 設計書             | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-2-design.md`            | テストケースとコマンドの原本確認   |
| Phase 5 実装書             | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-5-implementation.md`    | Green後のテスト実体確認            |
| Phase 6 拡充書             | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-6-test-expansion.md`    | 追加ケースの確認                   |
| Phase 7 カバレッジ書       | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-7-coverage-check.md`    | カバレッジ基準の再確認             |
| Phase 8 リファクタリング書 | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-8-refactoring.md`       | 命名/fixture整理の確認             |
| Phase 9 品質保証書         | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-9-quality-assurance.md` | 品質ゲート再利用                   |
| Phase 10 最終レビュー書    | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-10-final-review.md`     | 最終判定の引継ぎ                   |
| タスク運用ルール           | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                           | Phase 11 判定基準                  |
| 品質要件                   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                          | カバレッジ基準値                   |
| テストパターン             | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`                    | テスト実行方法                     |
| P53（CLI制約）             | `.claude/rules/06-known-pitfalls.md`                                                                 | CLI環境でのスクリーンショット制約  |
| P40（実行ディレクトリ）    | `.claude/rules/06-known-pitfalls.md`                                                                 | モノレポでのテスト実行ディレクトリ |

---

## 前提条件

- Phase 10（最終レビュー）が PASS 判定で完了していること
- 全テストコードが Phase 8（リファクタリング）済みであること
- `pnpm install` が完了していること

---

## 実行タスク

- Task 1: Layer 1/2/3 の対象テストを手動実行して PASS を確認する
- Task 2: ランダム順序実行と全体回帰で独立性を検証する
- Task 3: 代表UIのスクリーンショットを取得し、表示整合を確認する
- Task 4: カバレッジ維持と CLI 制約対応を記録する

### Task 1: Layer 1 - Main IPC `skill:create` 契約テスト実行

**対象ファイル**: `apps/desktop/src/main/ipc/__tests__/skillHandlers.create.test.ts`

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.create.test.ts
```

**確認項目**:

| ID         | テストケース                                      | 期待結果 |
| ---------- | ------------------------------------------------- | -------- |
| TC-G01-001 | sender正常系が許可される                          | PASS     |
| TC-G01-002 | sender異常系が拒否される                          | PASS     |
| TC-G01-003 | description未指定で VALIDATION_ERROR を返す       | PASS     |
| TC-G01-004 | description空文字列で VALIDATION_ERROR を返す     | PASS     |
| TC-G01-005 | descriptionスペースのみで VALIDATION_ERROR を返す | PASS     |
| TC-G01-006 | description数値型で VALIDATION_ERROR を返す       | PASS     |
| TC-G01-007 | options未指定(null)で VALIDATION_ERROR を返す     | PASS     |
| TC-G01-008 | options文字列型で VALIDATION_ERROR を返す         | PASS     |
| TC-G01-009 | 有効な引数で createSkillFromWizard に委譲する     | PASS     |
| TC-G01-010 | description が trim() されて渡る                  | PASS     |
| TC-G01-011 | サービス例外を CREATE_ERROR でラップする          | PASS     |
| TC-G01-012 | UNIX/Windows パスがサニタイズされる               | PASS     |
| TC-G01-013 | トークン情報がサニタイズされる                    | PASS     |
| TC-G01-014 | 非Error例外でデフォルトメッセージを返す           | PASS     |

**合格条件**: 25テスト全PASS

### Task 2: Layer 2 - Renderer統合テスト実行

**対象ファイル**: `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx`

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx
```

**確認項目**:

| ID         | テストケース                                         | 期待結果 |
| ---------- | ---------------------------------------------------- | -------- |
| TC-G02-001 | スキル作成ボタンからウィザードが開く                 | PASS     |
| TC-G02-002 | ウィザードが初期状態で表示される                     | PASS     |
| TC-G02-003 | description入力後に `useCreateSkill` が呼ばれる      | PASS     |
| TC-G02-004 | options が store action に正しく渡る                 | PASS     |
| TC-G02-005 | 作成成功後に一覧 state が同期される                  | PASS     |
| TC-G02-006 | スキル選択後に `analyzeSkill` が呼ばれる             | PASS     |
| TC-G02-007 | 改善/再分析フローが store action で完結する          | PASS     |
| TC-G02-008 | create action 失敗時にエラーメッセージが表示される   | PASS     |
| TC-G02-009 | analyze action 失敗後に再試行で回復できる            | PASS     |
| TC-G02-010 | `isAnalyzing` / `isImproving` 中の操作がガードされる | PASS     |

**合格条件**: 14テスト全PASS

### Task 3: Layer 3 - 既存テスト拡張テスト実行

**対象ファイル**: `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx`

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx
```

**確認項目**:

| ID         | テストケース                           | 期待結果 |
| ---------- | -------------------------------------- | -------- |
| TC-G03-001 | スキル作成後にリスト表示が更新される   | PASS     |
| TC-G03-002 | 作成キャンセル時にリストが変更されない | PASS     |
| TC-G03-003 | 既存テスト全件が PASS する             | PASS     |
| TC-G03-004 | 新規テスト追加後も実行順序非依存       | PASS     |

**合格条件**: 既存テスト + 4件追加テスト全PASS

### Task 4: テスト独立性検証

テスト実行順序に依存しないことを確認する（P9対策）。

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.create.test.ts --sequence.shuffle
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx --sequence.shuffle
cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx --sequence.shuffle
```

**合格条件**: 3ファイル全てランダム順序でPASS

### Task 5: 回帰テスト実行

全テストスイートを実行し、新規テストが既存テストに影響を与えていないことを確認する。

```bash
cd apps/desktop && pnpm vitest run
```

**合格条件**: 全テストPASS かつ新規テスト追加による失敗ゼロ

### Task 6: カバレッジレポート最終確認

Phase 7 で確認したカバレッジが維持されていることを確認する。

```bash
cd apps/desktop && pnpm exec tsx scripts/coverage-by-handler.ts \
  --file src/main/ipc/skillHandlers.ts \
  --target skill:create
cd apps/desktop && CI=true VITEST_SHARDED_COVERAGE=true pnpm vitest run --coverage \
  --coverage.include='src/renderer/store/slices/agentSlice.ts' \
  --coverage.include='src/renderer/components/chat/ChatPanel.tsx' \
  src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx \
  src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx
```

**カバレッジ基準**:

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

**合格条件**: 全指標が最低基準以上

---

## 画面検証（ユーザー明示要求対応）

### 代表スクリーンショット取得コマンド

```bash
mkdir -p docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/outputs/phase-11/screenshots
cd apps/desktop && pnpm exec node scripts/capture-skill-create-wizard-screenshots.mjs \
  --output-dir ../../docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/outputs/phase-11/screenshots
cd apps/desktop && pnpm exec node scripts/capture-skill-analysis-view-screenshots.mjs \
  --output-dir ../../docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/outputs/phase-11/screenshots
cd apps/desktop && pnpm exec node scripts/capture-skill-management-panel-screenshots.mjs
```

### 画面確認観点

| テストケース | 画面                              | 期待結果                                                     |
| ------------ | --------------------------------- | ------------------------------------------------------------ |
| TC-UI-01     | SkillCreateWizard 初期表示        | Step 1 入力欄と進行インジケータが表示される                  |
| TC-UI-02     | SkillAnalysisView 初期表示        | 分析スコア・カテゴリ・改善提案が表示される                   |
| TC-UI-03     | SkillManagementPanel 一覧         | imported / available セクションと主要CTAが表示される         |
| TC-UI-04     | SkillManagementPanel 分析導線     | パネルから分析ビューへ遷移し、エラーなく分析結果が表示される |
| TC-UI-05     | SkillManagementPanel 新規作成導線 | パネルから作成ビューへ遷移し、ウィザード初期状態が表示される |

### CLI環境での制約事項（P53対応）

- Vite ベースの screenshot harness は同一ポート `5173` を使うため、複数 capture script の完全並列実行は不可
- worktree では `@rollup/rollup-darwin-x64` 欠落時に Vite 起動が失敗するため、撮影前に `pnpm install --frozen-lockfile` を実行する

---

## 統合テスト連携

| 連携対象  | Phase 11 で再確認する内容              | 記録先                  |
| --------- | -------------------------------------- | ----------------------- |
| Phase 2   | テストケースIDとコマンドが設計どおりか | `manual-test-result.md` |
| Phase 5/6 | Green後の全件PASSと追加ケース維持      | `manual-test-result.md` |
| Phase 7/9 | カバレッジと品質ゲート値の再利用       | `manual-test-result.md` |
| Phase 10  | レビュー指摘なしで Phase 12 に渡せるか | `manual-test-result.md` |

---

## 成果物

| 成果物                 | パス                                     | 説明                       |
| ---------------------- | ---------------------------------------- | -------------------------- |
| 手動テスト結果レポート | `outputs/phase-11/manual-test-result.md` | 全Task実行結果と判定を記録 |

---

## 完了条件

- [ ] Task 1: Layer 1 テスト25件全PASS
- [ ] Task 2: Layer 2 テスト14件全PASS
- [ ] Task 3: Layer 3 テスト16件全PASS
- [ ] Task 4: ランダム順序実行で全PASS（テスト独立性確認）
- [ ] Task 5: 回帰テスト全PASS（既存テストへの影響ゼロ）
- [ ] Task 6: カバレッジ基準達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] Task 7: representative screenshots の取得・目視確認完了
- [ ] `outputs/phase-11/manual-test-result.md` が作成されている
- [ ] `artifacts.json` の Phase 11 ステータスが更新されている

---

_このファイルは TASK-10A-G Phase 11 仕様書として作成されました。_
_最終更新: 2026-03-09_
