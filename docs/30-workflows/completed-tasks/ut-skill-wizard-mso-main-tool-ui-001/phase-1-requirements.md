# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 1                                      |
| タスクID   | UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001   |
| 機能名     | skill-wizard/q5-primary-tool-indicator |
| 前提Phase  | -                                      |
| 後続Phase  | Phase 2                                |
| 作成日     | 2026-04-13                             |
| ステータス | completed                              |

## 目的

Q5（外部ツール選択）で複数ツールが選択された際に、`resolveExternalIntegration` が参照する先頭選択項目を「主ツール」として UI 上に明示するバッジ表示の要件と受け入れ基準を固定する。

## 背景

`skill-wizard-multi-select-options` タスクにより Q5 で複数ツールの同時選択が可能になった。
しかし `resolveExternalIntegration` は `selectedOptions[0]` を主ツールとして参照するため、
UI 上では全チェックボックスが同等に見える一方で内部的には先頭選択項目が優先扱いになるという非対称性が生じている。

この非対称性は `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001`（並列統合対応）が完了するまでの暫定課題であるため、
バッジ表示は削除容易な設計で実装する必要がある。

本ワークフローは GitHub Issue #2071 に対応する仕様であり、本Phaseではコード実装を行わず要件を固定する。

## 実行タスク

- P50チェック: `resolveExternalIntegration` と `ConversationRoundStep.tsx` の現状確認・既実装 inventory 調査
- carry-over確認: 前タスク `skill-wizard-multi-select-options` での教訓・未タスク登録内容の確認
- 受け入れ基準定義: AC-1〜AC-6 を検証可能な形で固定
- タスク分類宣言: **UIタスク / VISUAL**（Q5 選択状態の UI 変更 / スクリーンショット証跡が必要）

## 参照資料

| 資料名                         | パス                                                                                                                | 用途                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| タスク指示書                   | `docs/30-workflows/unassigned-task/UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001.md`                                         | 要件原本・背景・スコープ                |
| 対象コンポーネント             | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                                       | renderQuestion / Q5レンダリング現状確認 |
| テストファイル                 | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx`                        | テスト追加先の現状確認                  |
| resolveExternalIntegration実装 | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                                                  | selectedOptions[0] 参照箇所の確認       |
| 前タスク未タスク検出成果物     | `docs/30-workflows/completed-tasks/skill-wizard-multi-select-options/outputs/phase-12/unassigned-task-detection.md` | OPT-MSO-002 登録内容の確認              |
| GitHub Issue                   | [#2071](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2071)                                            | 要件原本（OPEN）                        |

## 実行手順

### 0. P50チェック: 既実装状態の調査（必須）

```bash
# 対象ファイルの最近のコミット履歴確認
git log --oneline -10 -- apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx

# 「主ツール」バッジが既に実装されていないか確認
grep -n "主ツール\|primaryTool\|showPrimaryIndicator\|primary-tool\|primary_tool" \
  apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx

# resolveExternalIntegration の selectedOptions[0] 参照を確認
grep -n "selectedOptions\[0\]\|resolveExternalIntegration" \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx

# isQ5Required フラグの現状確認（Q5専用ロジックの既存パターン）
grep -n "isQ5Required\|key === .q5." \
  apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx
```

### 1. carry-over確認: 前タスクとの関係

前タスク `skill-wizard-multi-select-options`（OPT-MSO-002）からの carry-over 内容:

| 項目         | 内容                                                                    |
| ------------ | ----------------------------------------------------------------------- |
| 発見元       | skill-wizard-multi-select-options Phase 12 未タスク検出                 |
| 登録ID       | OPT-MSO-002                                                             |
| 前タスク教訓 | Q5 は先頭値優先ロジックを持つ。Q3/Q4 汎用 renderQuestion を崩さないこと |
| 削除時期     | `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` 完了後に不要になる可能性     |

```bash
# 前タスク成果物の確認（OPT-MSO-002 登録内容）
cat docs/30-workflows/completed-tasks/skill-wizard-multi-select-options/outputs/phase-12/unassigned-task-detection.md \
  2>/dev/null || echo "ファイルが存在しない場合はスキップ"
```

### 2. renderQuestion の現状確認

```bash
# renderQuestion 関数の範囲確認（L357〜L418 付近）
grep -n "renderQuestion\|const renderQuestion" \
  apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx

# q.options.map によるボタンレンダリングの確認
grep -n "q.options.map\|opt =>" \
  apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx
```

### 3. 受け入れ基準の固定

| ID   | 受け入れ基準                                                                                      | 検証方法                                                 |
| ---- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| AC-1 | Q5 で2つ以上のツールが選択された際に、最初の選択肢に「主ツール」バッジが表示される                | Jest/Vitest テスト: 複数選択時のバッジ要素の存在確認     |
| AC-2 | 1つのみ選択されている場合は「主ツール」バッジが表示されない                                       | Jest/Vitest テスト: 単一選択時のバッジ非存在確認         |
| AC-3 | `aria-label` に「主ツールとして使用される」情報が含まれる                                         | Jest/Vitest テスト: aria-label 属性値の文字列マッチ      |
| AC-4 | `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` 完了後にバッジ表示が不要になった場合の削除が容易な設計 | 設計レビュー: バッジ表示箇所が単一責務で分離されているか |
| AC-5 | Phase 11 と同等のスクリーンショット証跡で視覚的変更が確認される                                   | Phase 11 手動テスト: before/after スクリーンショット比較 |
| AC-6 | `ConversationRoundStep.test.tsx` が Q5 複数選択時のバッジ表示を検証する                           | `pnpm --filter @repo/desktop test` でテスト成功          |

### 4. タスク分類宣言

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| タスク種別   | 実装タスク                                                   |
| UI変更       | あり（ConversationRoundStep.tsx の Q5 設問レンダリング変更） |
| VISUAL分類   | VISUAL（スクリーンショット証跡が必要）                       |
| Phase 11必須 | 必須（Phase 11: 手動テストでスクリーンショット取得）         |

## 統合テスト連携【必須】

| 判定項目               | 基準 | 結果 |
| ---------------------- | ---- | ---- |
| ユニットテストLine     | 80%+ | PASS |
| ユニットテストBranch   | 60%+ | PASS |
| ユニットテストFunction | 80%+ | PASS |

## 成果物

| 成果物       | パス                                         | 説明                         |
| ------------ | -------------------------------------------- | ---------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件・AC一覧 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 検証可能な AC-1〜AC-6 一覧   |

## 完了条件

- [ ] P50チェック実施済み（「主ツール」バッジ・`showPrimaryIndicator` 等の既実装がないことを確認）
- [ ] `resolveExternalIntegration` が `selectedOptions[0]` を参照していることを確認済み
- [ ] `renderQuestion` 関数の現状（L357〜L418 付近）を確認済み
- [ ] `isQ5Required` フラグの既存パターンを確認済み
- [ ] carry-over（OPT-MSO-002）の内容を確認済み
- [ ] AC-1〜AC-6 が検証可能な形で定義されている
- [ ] タスク分類（**実装タスク / UIタスク / VISUAL**）を宣言済み
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. P50チェック（重複実装なし確認）
2. carry-over 確認（前タスク教訓・OPT-MSO-002 内容）
3. renderQuestion 現状確認
4. isQ5Required 既存パターン確認
5. 受け入れ基準（AC-1〜AC-6）の固定
6. タスク分類宣言
7. 成果物の出力
8. 完了条件の判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 2: 設計
