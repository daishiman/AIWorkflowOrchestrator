# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| PhaseID    | 3                                                              |
| Phase名    | 設計レビューゲート                                             |
| タスクID   | UT-LIFECYCLE-PANEL-LLM-GEN-DESCRIBE-SKIP-CLEANUP-001           |
| タスク名   | SkillLifecyclePanel LLM生成テスト describe.skip クリーンアップ |
| 前Phase    | Phase 2                                                        |
| 次Phase    | Phase 4（PASS または MINOR の場合） / Phase 2（MAJOR の場合）  |
| 作成日     | 2026-04-18                                                     |
| ステータス | pending                                                        |

## 目的

Phase 1〜2 の要件定義・設計内容をレビューし、12件の `describe.skip` 処置方針が
現行 `SkillLifecyclePanel.tsx` の実装と整合しているか、AC-1〜AC-6 の達成が設計上保証されているかを判定する。
PASS / MINOR / MAJOR を確定し、Phase 4 の開始可否を決定する。

## 実行タスク

- [ ] 設計一貫性チェック: 削除5件・修正3件・別途判断4件の分類に矛盾がないか
- [ ] AC 整合チェック: AC-1〜AC-6 の達成が設計で担保されているか
- [ ] スコープ遵守チェック: プロダクションコードへの変更が含まれていないか
- [ ] 旧 API モック整理の安全性チェック: 削除後に TypeScript エラーが発生しないか
- [ ] 修正対象3件の現行 API 整合チェック: U-4/U-11/U-8b が testid・API ベースで再現可能か
- [ ] snapshot 系4件の処置方針の妥当性チェック
- [ ] MINOR 追跡テーブルの記録（指摘事項がある場合）

## 参照資料

| 資料名                                      | パス                                                                                               | 用途                     |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------ |
| Phase 1 成果物                              | `outputs/phase-1/requirements-definition.md`                                                       | 要件・AC 参照            |
| Phase 2 成果物                              | `outputs/phase-2/design.md`                                                                        | 設計書参照               |
| SkillLifecyclePanel.llm-generation.test.tsx | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | 実際のテスト構造との照合 |
| SkillLifecyclePanel.tsx                     | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               | 現行実装との整合確認     |
| 受け入れ基準                                | `outputs/phase-1/acceptance-criteria.md`                                                           | Phase 1 成果物           |

## 実行手順

### 1. 設計一貫性チェック

| チェック項目                                                                | 判定基準                                                                 | 結果    |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------- |
| 削除対象5件（U-1/U-2/U-6/U-10/U-12）が旧 API 依存で現行 API に置換不能      | SkillLifecyclePanel.tsx に planSkill / detectMode が存在しないことを確認 | pending |
| 修正対象3件（U-4/U-11/U-8b）の testid が現行 UI に存在するか調査済み        | 各 testid の存在有無が設計書に明記されている                             | pending |
| snapshot 系4件（U-18b/U-19b/U-20b/U-21）の処置方針が旧 API 依存分析に基づく | 旧 planSkill 参照の除去可否が判定されている                              | pending |
| 旧 API モック（mockPlanSkill 等）の削除方針がアクティブテストに影響しない   | アクティブな describe でのモック使用有無が確認されている                 | pending |
| プロダクションコード変更がスコープに含まれていない                          | 設計書の変更対象がテストファイルのみである                               | pending |

```bash
# planSkill / detectMode が SkillLifecyclePanel.tsx に存在しないことを確認
grep -n "planSkill\|detectMode" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
# 結果が空であれば削除設計の前提が正しい

# skill-lifecycle-prepare-button testid の存在確認（U-4/U-11/U-8b の修正可能性判定）
grep -rn "skill-lifecycle-prepare-button" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx

# アクティブなテストで mockPlanSkill / mockDetectMode が使われていないか確認
grep -n "mockPlanSkill\|mockDetectMode\|mockExecutePlan" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx | \
  grep -v "describe\.skip\|^const\|^let\|vi\.fn\|vi\.mock"
```

### 2. AC 整合チェック

| AC ID | 設計対応                                                                        | 充足判定 |
| ----- | ------------------------------------------------------------------------------- | -------- |
| AC-1  | 旧フロー依存の describe.skip（U-1/U-2/U-6/U-10/U-12）を削除する設計になっている | pending  |
| AC-2  | 要調査テスト（U-4/U-11/U-8b）の処置方針（修正 or 削除）が決定されている         | pending  |
| AC-3  | snapshot 系テスト（U-18b/U-19b/U-20b/U-21）の処置方針が明確に記録されている     | pending  |
| AC-4  | `pnpm --filter @repo/desktop test:run` が PASS するように設計されている         | pending  |
| AC-5  | `pnpm --filter @repo/desktop typecheck` が PASS するように型安全が保たれる設計  | pending  |
| AC-6  | 旧 API モック宣言の整理方針が確定しており、削除後の TypeScript 安全性を確認済み | pending  |

### 3. スコープ遵守チェック

```bash
# SkillLifecyclePanel.tsx 以外のプロダクションコードが設計書の変更対象に含まれていないか確認
# 設計書で変更対象として明示されているファイルを確認する（Phase 2 outputs 参照）
cat outputs/phase-2/design.md | grep -A 5 "変更ファイル\|変更対象\|修正対象"
```

| チェック項目                                            | 期待状態                              | 結果    |
| ------------------------------------------------------- | ------------------------------------- | ------- |
| `SkillLifecyclePanel.tsx` への変更が含まれていない      | 変更対象ファイルに含まれていない      | pending |
| 新しいテストケースの追加がスコープ外になっている        | 既存の describe.skip の処置のみに限定 | pending |
| `SkillLifecyclePanel.auth-regression.test.tsx` が対象外 | 設計書に含まれていない                | pending |

### 4. 修正対象3件の現行 API 整合チェック

```bash
# U-4: isGenerating ガード - handlePrepare 相当のボタン testid 確認
grep -n "data-testid" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx | \
  grep -i "prepare\|generate\|plan"

# U-11: 入力バリデーション - テキストエリア・入力フィールドの testid 確認
grep -n "data-testid\|textarea\|input" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx | head -30

# U-8b: canonical spec 保持 - currentPlanResult.skillSpec の実装確認
grep -n "skillSpec\|currentPlanResult\|canonical" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

| テスト ID | 修正前提となる testid / API      | 現行 SkillLifecyclePanel.tsx での存在確認 | 修正方針            |
| --------- | -------------------------------- | ----------------------------------------- | ------------------- |
| U-4       | `skill-lifecycle-prepare-button` | pending                                   | 存在→修正/不在→削除 |
| U-11      | テキストエリア testid            | pending                                   | 存在→修正/不在→削除 |
| U-8b      | `currentPlanResult.skillSpec`    | pending                                   | 存在→修正/不在→削除 |

### 5. snapshot 系4件の処置方針妥当性チェック

| テスト ID | 旧 API 依存箇所                              | 除去・書き直し可能性  | 最終方針          |
| --------- | -------------------------------------------- | --------------------- | ----------------- |
| U-18b     | `skill-lifecycle-prepare-button` × planSkill | testid 存在時のみ可能 | 要確認→確認後決定 |
| U-19b     | textarea testid × planSkill                  | testid 存在時のみ可能 | 要確認→確認後決定 |
| U-20b     | `clearGenerationState` のみ依存              | 現行 API で再現可能   | 修正優先          |
| U-21      | planSkill + executePlan chain                | planSkill 依存が残る  | 削除優先          |

### 6. レビュー判定基準

| 判定  | 条件                                                                   | 次のアクション         |
| ----- | ---------------------------------------------------------------------- | ---------------------- |
| PASS  | 全チェック項目でリスクなし、AC-1〜AC-6 の設計対応が充足                | Phase 4 へ進む         |
| MINOR | 小さな指摘事項あり（実装時に並行解消可能）                             | Phase 4 へ進む（追跡） |
| MAJOR | 設計の根本的な問題（処置分類未確定・AC 未充足・旧 API 依存の見落とし） | Phase 2 へ戻る         |

**MAJOR 判定となる条件の例**:

- 削除/修正/別途判断の分類がいずれかの件で未確定のまま Phase 4 へ進もうとしている
- 旧 API モック宣言の削除後に TypeScript エラーが発生することが確実
- U-4/U-11/U-8b の testid が存在しない確認が未実施

**総合判定**: （実行時に PASS / MINOR / MAJOR を記録）

### 7. MINOR 追跡テーブル

| MINOR ID         | 指摘内容 | 解決予定Phase | 解決確認Phase | 備考 |
| ---------------- | -------- | ------------- | ------------- | ---- |
| （実行時に記録） | -        | -             | -             | -    |

### 8. Phase 4 開始条件

Phase 4（テスト作成）を開始できる条件:

- [ ] 総合判定が PASS または MINOR であること
- [ ] MAJOR 判定の場合は Phase 2 へ戻り再設計を行うこと
- [ ] 12件の処置分類が最終確定していること
- [ ] MINOR の指摘事項が追跡テーブルに記録されていること

## 統合テスト連携

| 判定項目               | 基準    | 結果    |
| ---------------------- | ------- | ------- |
| 型チェック（設計段階） | PASS    | pending |
| lint                   | 0 error | pending |

## 多角的チェック観点

| 観点               | チェック内容                                                               |
| ------------------ | -------------------------------------------------------------------------- |
| 方針決定の妥当性   | 削除/修正/別途判断の決定根拠が Phase 2 の調査結果と一致しているか          |
| スコープ遵守       | 設計変更がプロダクションコードに触れず、テストファイルのみに閉じているか   |
| 修正テスト設計適合 | Phase 4 で U-4/U-11/U-8b を修正するための testid・API が確認されているか   |
| 依存整合           | UT-W2-03A（完了済み先行タスク）で行った SkillCreateWizard 側の変更との整合 |

## サブタスク管理

1. 設計一貫性チェック（5 項目）
2. AC-1〜AC-6 の設計対応確認
3. スコープ遵守チェック（3 項目）
4. 修正対象3件（U-4/U-11/U-8b）の現行 API 整合チェック
5. snapshot 系4件の処置方針妥当性チェック
6. 総合判定記録（PASS / MINOR / MAJOR）
7. MINOR 追跡テーブル記録（該当時）
8. 成果物の出力

## 成果物

| 成果物           | パス                               | 説明                                              |
| ---------------- | ---------------------------------- | ------------------------------------------------- |
| 設計レビュー結果 | `outputs/phase-3/gate-decision.md` | 処置分類最終確定・PASS/MINOR/MAJOR 判定・指摘事項 |

## 完了条件

- [ ] 設計一貫性チェック（5 項目）が完了
- [ ] AC-1〜AC-6 の設計対応が確認済み
- [ ] スコープ遵守チェック（3 項目）が完了
- [ ] 修正対象3件の現行 API 整合チェックが完了
- [ ] snapshot 系4件の処置方針妥当性チェックが完了
- [ ] 総合判定（PASS/MINOR/MAJOR）が記録されている
- [ ] MINOR 判定の指摘事項があれば追跡テーブルに記録済み
- [ ] Phase 4 開始条件（PASS or MINOR）が充足されている
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

Phase 4（テスト作成）へ進む（PASS または MINOR の場合）。
Phase 2（設計）へ戻る（MAJOR の場合）。
