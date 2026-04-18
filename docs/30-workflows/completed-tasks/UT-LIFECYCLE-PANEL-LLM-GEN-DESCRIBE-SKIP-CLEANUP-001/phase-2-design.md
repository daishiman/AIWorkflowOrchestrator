# Phase 2: 設計

## メタ情報

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| PhaseID    | 2                                                              |
| Phase名    | 設計                                                           |
| タスクID   | UT-LIFECYCLE-PANEL-LLM-GEN-DESCRIBE-SKIP-CLEANUP-001           |
| タスク名   | SkillLifecyclePanel LLM生成テスト describe.skip クリーンアップ |
| 前Phase    | Phase 1                                                        |
| 次Phase    | Phase 3                                                        |
| 作成日     | 2026-04-18                                                     |
| ステータス | pending                                                        |

## 目的

Phase 1 で確定した12件の `describe.skip` 分類（削除5件・修正3件・別途判断4件）を基に、
各 describe.skip の具体的な処置内容・処置順序・モック宣言整理の設計を確定する。
廃止済み API モック（mockPlanSkill / mockDetectMode）の削除可否と、
snapshot 系テストの処置方針を決定する。

## 実行タスク

- [ ] 削除対象5件（U-1/U-2/U-6/U-10/U-12）の削除設計
- [ ] 修正対象3件（U-4/U-11/U-8b）の修正設計（現行 API で再現可能かの確認）
- [ ] snapshot 系4件（U-18b/U-19b/U-20b/U-21）の処置方針設計
- [ ] 旧 API モック宣言の整理設計（削除可否の判定）
- [ ] 検証マトリクスの定義

## 参照資料

| 資料名                                      | パス                                                                                               | 用途                                    |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Phase 1 成果物                              | `outputs/phase-1/requirements-definition.md`                                                       | 要件・AC 参照                           |
| SkillLifecyclePanel.llm-generation.test.tsx | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | 対象テストファイルの全体構造確認        |
| SkillLifecyclePanel.tsx                     | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               | 現行 API・isGenerating ガードの実装確認 |
| SkillLifecyclePanel.test.tsx                | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx`                | 既存テストとのカバレッジ重複確認        |
| GitHub Issue #2236                          | [#2236](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2236)                           | タスク背景・設計オプション参照          |
| 受け入れ基準                                | `outputs/phase-1/acceptance-criteria.md`                                                           | Phase 1 成果物                          |

## 実行手順

### 1. 削除対象5件の設計

削除対象テストは旧フロー（planSkill / detectMode）に依存しており、現行 API に置き換え不能なため削除する。

```bash
# 削除対象5件の内容確認
grep -n -A 20 "U-1:" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
grep -n -A 20 "U-2:" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
grep -n -A 20 "U-6:" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
grep -n -A 20 "U-10:" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
grep -n -A 20 "U-12:" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# SkillLifecyclePanel.tsx に planSkill / detectMode が存在しないことを確認（削除安全確認）
grep -n "planSkill\|detectMode" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

#### 削除5件の設計詳細

| ID   | describe 名                                                  | 削除理由                               | 削除後の影響              |
| ---- | ------------------------------------------------------------ | -------------------------------------- | ------------------------- |
| U-1  | detectMode → planSkill sequential call                       | planSkill / detectMode が廃止済み      | 旧フローのテストが消える  |
| U-2  | backward compatibility - detectMode='create' skips planSkill | detectMode が廃止済み                  | 旧互換テストが消える      |
| U-6  | terminal_handoff triggers handoff guidance display           | 旧 planSkill ベースの terminal_handoff | 旧 handoff テストが消える |
| U-10 | planSkill failure propagates error                           | planSkill が廃止済み                   | 旧エラーテストが消える    |
| U-12 | planSkill API unavailable graceful degradation               | planSkill が廃止済み                   | 旧降格テストが消える      |

### 2. 修正対象3件の設計

修正対象テストは現行 API で再現可能な可能性があるため、調査してから処置する。

```bash
# U-4: isGenerating guard - 現行の isGenerating ガード実装確認
grep -n -A 30 "isGenerating" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx

# U-11: empty input validation - 現行の入力バリデーション実装確認
grep -n "validation\|empty\|trim\|disabled" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx

# U-8b: canonical binding drift - canonical spec 保持の実装確認
grep -n "canonical\|approvedSkillSpec\|spec\|planResult" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx

# 修正対象のテスト内容確認
grep -n -A 30 "U-4:" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
grep -n -A 30 "U-11:" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
grep -n -A 30 "U-8b:" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
```

#### 修正3件の設計詳細

| ID   | describe 名                                   | 修正方針                                                                                                                             | 修正後の状態      |
| ---- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| U-4  | isGenerating guard prevents double invocation | `skill-lifecycle-prepare-button` が現行 UI に存在しない場合は削除。存在すれば describe に昇格                                        | 要調査→確認後決定 |
| U-11 | empty input validation                        | 現行 UI での入力バリデーション（ボタン disabled、エラーメッセージ、submit guard）の実装を確認し、testid が存在すれば describe に昇格 | 要調査→確認後決定 |
| U-8b | canonical binding drift prevention            | currentPlanResult.skillSpec の保持動作を現行 API モックで再現できるか確認し、再現可能なら describe に昇格                            | 要調査→確認後決定 |

### 3. snapshot 系4件の処置方針設計

```bash
# snapshot 系テストの内容確認
grep -n -A 40 "U-18b:" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
grep -n -A 40 "U-19b:" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
grep -n -A 40 "U-20b:" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
grep -n -A 40 "U-21:" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# approvedSkillSpec / canonical spec の現行実装確認
grep -n "approvedSkillSpec\|canonical\|clearGenerationState\|currentPlanResult" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

#### snapshot 系4件の設計詳細

| ID    | describe 名                                             | 処置方針                                                                                                                              |
| ----- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| U-18b | cancel then re-plan replaces approved snapshot          | `skill-lifecycle-prepare-button` testid が存在しない場合は削除。存在する場合は旧 planSkill 呼び出し部分を除去して describe に昇格検討 |
| U-19b | multiple textarea edits do not affect approved snapshot | textarea testid が存在しない場合は削除。存在する場合は現行 API 向けに書き直して describe に昇格検討                                   |
| U-20b | cancel clears approved snapshot symmetrically           | clearGenerationState ベースで rewrite 可能なら describe に昇格。不可なら削除                                                          |
| U-21  | approved snapshot behavior after execute failure        | executePlan の mock chain で再現可能なら describe に昇格。旧 planSkill 依存なら削除                                                   |

### 4. 旧 API モック宣言の整理設計

```bash
# 廃止済み API モック宣言の確認
grep -n "mockPlanSkill\|mockDetectMode\|planSkill\|detectMode" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# 現行アクティブなテストで旧 API モックを使用しているテストがあるか確認
grep -n "mockPlanSkill\|mockDetectMode" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx | \
  grep -v "describe\.skip\|\/\/"
```

#### 旧 API モック整理の設計

| モック名                    | 現行アクティブテストでの使用 | 処置方針                                              |
| --------------------------- | ---------------------------- | ----------------------------------------------------- |
| `mockPlanSkill`             | アクティブテストで不使用     | 削除対象5件・修正対象3件が解消後に宣言ごと削除        |
| `mockExecutePlan`           | 一部アクティブテストで使用   | **維持**（現行APIのため保持）                         |
| `mockDetectMode`            | アクティブテストで不使用     | 削除対象5件・修正対象3件が解消後に宣言ごと削除        |
| `beforeEach` 内のモック設定 | 確認必要                     | 廃止済み API モック初期化コードを beforeEach から除去 |

### 5. 検証マトリクス

| テスト対象                         | テストコマンド                                                                                                                                       |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 対象テストファイル単体実行         | `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx --reporter=verbose` |
| SkillLifecyclePanel 関連テスト全体 | `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel`                                            |
| desktop テスト全体                 | `pnpm --filter @repo/desktop test:run`                                                                                                               |
| 型チェック                         | `pnpm --filter @repo/desktop typecheck`                                                                                                              |
| lint                               | `pnpm --filter @repo/desktop lint`                                                                                                                   |

## 統合テスト連携

| 判定項目                   | 基準               | 結果    |
| -------------------------- | ------------------ | ------- |
| 型チェック（設計段階）     | PASS               | pending |
| lint                       | 0 error            | pending |
| describe.skip 削除件数確認 | 5件削除後は7件以下 | pending |

## 多角的チェック観点

| 観点                     | チェック内容                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------ |
| 削除安全性               | planSkill / detectMode が SkillLifecyclePanel.tsx 本体で廃止済みであることを確認する |
| 修正の現行 API 整合性    | U-4/U-11/U-8b が現行の testid・API で再現可能か SkillLifecyclePanel.tsx で確認する   |
| snapshot 系の依存分析    | U-18b〜U-21 が旧 planSkill を完全に除去できるか、または削除するかを判定する          |
| モック宣言の残留影響     | 旧モック削除後に TypeScript エラーが出ないか事前確認する                             |
| アクティブテストへの影響 | 削除・修正が既存のアクティブな describe（U-3/U-5/U-7 等）に影響しないか確認する      |

## サブタスク管理

1. 削除対象5件（U-1/U-2/U-6/U-10/U-12）の削除設計
2. 修正対象3件（U-4/U-11/U-8b）の現行 API 再現可能性調査
3. snapshot 系4件（U-18b/U-19b/U-20b/U-21）の処置方針決定
4. 旧 API モック宣言（mockPlanSkill / mockDetectMode）の整理設計
5. 検証マトリクス定義
6. 成果物の出力

## 成果物

| 成果物 | パス                        | 説明                                           |
| ------ | --------------------------- | ---------------------------------------------- |
| 設計書 | `outputs/phase-2/design.md` | 12件の処置詳細・モック整理設計・検証マトリクス |

## 完了条件

- [ ] 削除対象5件の削除設計が完了（削除理由・削除後影響が明示されている）
- [ ] 修正対象3件の修正設計が完了（現行 API での再現可能性が確認または N/A 化されている）
- [ ] snapshot 系4件の処置方針が決定されている
- [ ] 旧 API モック宣言の整理方針が確定している
- [ ] 検証マトリクスが定義済み
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-LIFECYCLE-PANEL-LLM-GEN-DESCRIBE-SKIP-CLEANUP-001
```

## 次Phase

Phase 3（設計レビューゲート）へ進む。
