# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                        |
| -------- | ------------------------- |
| Phase    | 6                         |
| タスクID | TASK-10A-F                |
| 機能名   | store-driven-lifecycle-ui |
| 作成日   | 2026-03-08                |

## 目的

Phase 5 で Green 化したテストを拡充し、境界値・異常系・エラー回復・回帰テスト観点を網羅する。カバレッジ基準（Line 80% / Branch 60% / Function 80%）を満たすためのテストを追加する。

## 実行タスク

- 境界値テスト追加: 空文字列、長い名前、特殊文字、null/undefined を網羅する
- エラーケーステスト追加: ネットワーク、タイムアウト、バリデーション失敗を追加する
- 状態遷移の網羅テスト: loading / success / failure / retry の遷移を固定する
- 回帰テスト観点の追加: 作成後一覧同期、改善後再分析を TASK-10A-G へ引き渡す
- アクセシビリティテスト拡充: ARIA ロール、キーボード操作、disabled 状態を確認する

## 参照資料

| 資料名         | パス                                                                                    | 説明                       |
| -------------- | --------------------------------------------------------------------------------------- | -------------------------- |
| Phase 4 テスト | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-4-test-creation.md`  | 基本テストケース一覧       |
| Phase 5 実装   | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-5-implementation.md` | 実装結果                   |
| 品質要件       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`             | カバレッジ基準             |
| エラー仕様     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                   | エラーカテゴリとコード範囲 |
| UI 設計原則    | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`          | a11y / WCAG 2.1 AA         |
| UI 機能仕様    | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`         | UI 遷移整合                |

### 前 Phase 成果物

| 資料名         | パス                                                                                    | 用途             |
| -------------- | --------------------------------------------------------------------------------------- | ---------------- |
| Phase 4 成果物 | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-4-test-creation.md`  | テスト設計を参照 |
| Phase 5 成果物 | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-5-implementation.md` | 実装結果を参照   |

## 実行手順

### ステップ 1: 現在のカバレッジを測定

以下のコマンドで現在のカバレッジを確認する:

```bash
cd apps/desktop && pnpm vitest run --coverage src/renderer/components/skill/__tests__/ src/renderer/components/skill/hooks/
```

カバレッジレポートから以下のファイルの未カバー行・ブランチを特定する:

| 対象ファイル                | 測定対象                 |
| --------------------------- | ------------------------ |
| `SkillCreateWizard.tsx`     | Line / Branch / Function |
| `SkillAnalysisView.tsx`     | Line / Branch / Function |
| `hooks/useSkillAnalysis.ts` | Line / Branch / Function |
| `SkillManagementPanel.tsx`  | Line / Branch / Function |

### ステップ 2: SkillCreateWizard 境界値・異常系テスト追加

**テストファイル**: `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`

| テストID  | テスト内容                                                                    | テスト観点        |
| --------- | ----------------------------------------------------------------------------- | ----------------- |
| TC-CW-B01 | 空文字列の description で「次へ」ボタンが disabled                            | 境界値（空文字）  |
| TC-CW-B02 | スペースのみの description で「次へ」ボタンが disabled                        | 境界値（P42）     |
| TC-CW-B03 | 10000 文字の description で `createSkill` が呼ばれる（長い入力）              | 境界値（長文）    |
| TC-CW-B04 | HTML タグを含む description（`<script>alert(1)</script>`）が安全に処理される  | セキュリティ      |
| TC-CW-E01 | `createSkill` が Error を throw した場合にエラーメッセージが表示される        | エラー（Error）   |
| TC-CW-E02 | `createSkill` が文字列を throw した場合にフォールバックメッセージが表示される | エラー（非Error） |
| TC-CW-E03 | `createSkill` が null を返した場合にフォールバックエラーが表示される          | エラー（null）    |
| TC-CW-E04 | `createSkill` が空文字列を返した場合にフォールバックエラーが表示される        | エラー（空文字）  |
| TC-CW-S01 | 生成中（isGenerating=true）の表示状態が正しい                                 | 状態遷移          |
| TC-CW-S02 | 生成成功後に完了ステップが表示される                                          | 状態遷移          |
| TC-CW-S03 | 生成失敗後に Step 2 でエラー表示される                                        | 状態遷移          |

### ステップ 3: SkillAnalysisView 境界値・異常系テスト追加

**テストファイル**: `apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx`

| テストID  | テスト内容                                                                    | テスト観点               |
| --------- | ----------------------------------------------------------------------------- | ------------------------ |
| TC-AV-B01 | `skillName` が空文字列の場合にヘッダーが空表示                                | 境界値（空文字）         |
| TC-AV-B02 | `skillName` に特殊文字（`<>&"'`）を含む場合に安全に表示される                 | セキュリティ             |
| TC-AV-B03 | `analysis.suggestions` が 100 件の場合に全件表示される                        | 境界値（大量）           |
| TC-AV-B04 | `analysis.score` が 0 の場合に正しく表示される                                | 境界値（最小値）         |
| TC-AV-B05 | `analysis.score` が 100 の場合に正しく表示される                              | 境界値（最大値）         |
| TC-AV-E01 | `analyzeSkill` がネットワークエラー（ERR_4004）を返す場合のエラー表示         | エラー（ネット）         |
| TC-AV-E02 | `analyzeSkill` が AI API タイムアウト（ERR_3002）を返す場合のエラー表示       | エラー（タイムアウト）   |
| TC-AV-E03 | `applySkillImprovements` がバリデーションエラー（ERR_1001）を返す場合         | エラー（バリデーション） |
| TC-AV-E04 | `autoImproveSkill` が例外を throw した場合にコンポーネントがクラッシュしない  | エラー回復               |
| TC-AV-E05 | `skillError` がセットされた状態で再試行ボタンクリック後にエラーがクリアされる | エラー回復               |

### ステップ 4: useSkillAnalysis フック テスト拡充

**テストファイル**: `apps/desktop/src/renderer/components/skill/__tests__/useSkillAnalysis.test.ts`

| テストID  | テスト内容                                                                               | テスト観点       |
| --------- | ---------------------------------------------------------------------------------------- | ---------------- |
| TC-UA-B01 | `skillName` が空文字列の場合に `analyzeSkill("")` が呼ばれる                             | 境界値           |
| TC-UA-B02 | `handleToggleSuggestion` に負のインデックスを渡した場合に Set に追加される               | 境界値（負数）   |
| TC-UA-B03 | `handleToggleSuggestion` に `analysis.suggestions.length` 以上のインデックスを渡した場合 | 境界値（範囲外） |
| TC-UA-E01 | `analyzeSkill` が reject した場合に `selectedSuggestions` がリセットされない             | エラー時状態保持 |
| TC-UA-E02 | `applySkillImprovements` が reject した場合に `improvementResult` がリセットされない     | エラー時状態保持 |
| TC-UA-E03 | `autoImproveSkill` が reject した場合に `improvementResult` がリセットされない           | エラー時状態保持 |
| TC-UA-S01 | `skillName` が変更された場合に `handleAnalyze` が再実行される                            | 再マウント       |
| TC-UA-S02 | `handleApplySelected` 成功後に `improvementResult` が null にリセットされる              | 成功後リセット   |

### ステップ 5: 回帰テスト観点の追加（TASK-10A-G 引き渡し）

**テストファイル**: `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.integration.test.tsx`（既存ファイルに追加）

| テストID | テスト内容                                                           | TASK-10A-G 引き渡し |
| -------- | -------------------------------------------------------------------- | ------------------- |
| TC-RT-01 | スキル作成完了後に SkillManagementPanel の一覧に新スキルが表示される | 作成後一覧同期      |
| TC-RT-02 | 改善適用後に SkillAnalysisView で再分析が自動実行される              | 改善後再分析        |
| TC-RT-03 | スキル削除確認ダイアログでキャンセル時にスキルが一覧に残る           | 削除キャンセル      |
| TC-RT-04 | スキル削除成功後に一覧から該当スキルが消える                         | 削除後一覧更新      |
| TC-RT-05 | 分析ビューから一覧に戻った際に一覧表示が維持される                   | ビュー切り替え      |

### ステップ 6: アクセシビリティテスト拡充

**テストファイル**: 各テストファイルに `describe("アクセシビリティ")` ブロックを追加

| テストID   | テスト内容                                                                      | WCAG 基準 |
| ---------- | ------------------------------------------------------------------------------- | --------- |
| TC-A11Y-01 | エラーメッセージに `role="alert"` が設定されている                              | 4.1.3     |
| TC-A11Y-02 | 閉じるボタンに `aria-label="閉じる"` が設定されている                           | 1.1.1     |
| TC-A11Y-03 | disabled ボタンに `disabled` 属性が設定されている                               | 4.1.2     |
| TC-A11Y-04 | SkillManagementPanel のスキル一覧に `role="list"` が設定されている              | 1.3.1     |
| TC-A11Y-05 | 削除確認ダイアログに `role="dialog"` と `aria-label` が設定されている           | 4.1.2     |
| TC-A11Y-06 | 検索入力に `aria-label="スキルを検索"` が設定されている                         | 1.1.1     |
| TC-A11Y-07 | ステータスメッセージに `role="status"` と `aria-live="polite"` が設定されている | 4.1.3     |

### ステップ 7: テスト実行とカバレッジ確認

1. 全テスト実行:

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/
```

2. カバレッジ測定:

```bash
cd apps/desktop && pnpm vitest run --coverage src/renderer/components/skill/__tests__/ src/renderer/components/skill/hooks/
```

3. カバレッジ基準との照合:

| 指標              | 最低基準 | 推奨基準 | 実測値（記入） |
| ----------------- | -------- | -------- | -------------- |
| Line Coverage     | 80%      | 90%      | \_\_\_%        |
| Branch Coverage   | 60%      | 70%      | \_\_\_%        |
| Function Coverage | 80%      | 90%      | \_\_\_%        |

4. カバレッジ未達の場合、未カバー行・ブランチを特定し、追加テストを作成する

## 統合テスト連携

### TASK-10A-G への引き渡し観点（Phase 6 で確定）

| 回帰観点           | テストID | 検証内容                                                |
| ------------------ | -------- | ------------------------------------------------------- |
| 作成後一覧同期     | TC-RT-01 | `createSkill` 成功 → `fetchSkills` → 一覧に新スキル表示 |
| 改善後再分析       | TC-RT-02 | `applySkillImprovements` 成功 → `analyzeSkill` 再実行   |
| 削除後一覧更新     | TC-RT-04 | `removeSkill` 成功 → 一覧から削除                       |
| ビュー切り替え保持 | TC-RT-05 | analysis → list 遷移で一覧状態が維持                    |

## 多角的チェック観点

| 観点               | 確認事項                                                                 |
| ------------------ | ------------------------------------------------------------------------ |
| 境界値網羅         | 空文字、長文、特殊文字、0、100、null、undefined を検証                   |
| エラーカテゴリ網羅 | ERR_1001（バリデーション）、ERR_3002（タイムアウト）、ERR_4004（ネット） |
| 状態遷移網羅       | idle → loading → success/error → idle の全パスを検証                     |
| 回帰テスト         | TASK-10A-G への引き渡し観点 4 件が全て検証されている                     |
| a11y               | WCAG 2.1 AA の主要基準（1.1.1, 1.3.1, 4.1.2, 4.1.3）を検証               |
| P39 準拠           | `userEvent` 不使用                                                       |
| P40 準拠           | `apps/desktop` から実行                                                  |
| P9 準拠            | `beforeEach` で全状態リセット                                            |

## 成果物

| 成果物                          | パス                                                                                             | 説明                          |
| ------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------- |
| SkillCreateWizard テスト拡充    | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`                | TC-CW-B01 〜 TC-CW-S03 追加   |
| SkillAnalysisView テスト拡充    | `apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx`                | TC-AV-B01 〜 TC-AV-E05 追加   |
| useSkillAnalysis テスト拡充     | `apps/desktop/src/renderer/components/skill/__tests__/useSkillAnalysis.test.ts`                  | TC-UA-B01 〜 TC-UA-S02 追加   |
| SkillManagementPanel 回帰テスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.integration.test.tsx` | TC-RT-01 〜 TC-RT-05 追加     |
| アクセシビリティテスト          | 各テストファイル内                                                                               | TC-A11Y-01 〜 TC-A11Y-07 追加 |

## 完了条件

- [ ] TC-CW-B01 〜 TC-CW-S03（11 件）のテストが PASS
- [ ] TC-AV-B01 〜 TC-AV-E05（10 件）のテストが PASS
- [ ] TC-UA-B01 〜 TC-UA-S02（8 件）のテストが PASS
- [ ] TC-RT-01 〜 TC-RT-05（5 件）のテストが PASS
- [ ] TC-A11Y-01 〜 TC-A11Y-07（7 件）のテストが PASS
- [ ] カバレッジ測定が実施されている（結果は Phase 7 で評価）
- [ ] P39 準拠: `userEvent` を使用していない
- [ ] P40 準拠: テスト実行コマンドが `apps/desktop` ディレクトリから実行される
- [ ] P9 準拠: `beforeEach` で全モック状態がリセットされている
- [ ] TASK-10A-G への引き渡し回帰観点 4 件が全てテストで検証されている

## 次の Phase

Phase 7: カバレッジ確認（`docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-7-coverage-check.md`）
