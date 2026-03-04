# TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001 - タスク実行仕様書

## ユーザーからの元の指示

- task-specification-creator 準拠でタスク仕様書を作成する。
- 実装は行わず、仕様書作成に専念する。
- 並列可能な作業は分離し、関心ごとごとに SubAgent で担当する。
- aiworkflow-requirements の正本仕様を参照し、仕様整合を確保する。
- コミット/PR は実施しない。

## メタ情報

| 項目         | 内容                                               |
| ------------ | -------------------------------------------------- |
| タスクID     | TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001 |
| タスク名     | SkillCenter UI の欠損メタデータ耐性強化            |
| 分類         | fix                                                |
| 対象機能     | SkillCenterView Hooks/Components（Renderer）       |
| 優先度       | high                                               |
| 見積もり規模 | medium                                             |
| ステータス   | spec_created                                       |
| 作成日       | 2026-03-04                                         |

## タスク概要

### 目的

description やサブリソース配列欠損時のクラッシュを防ぎ、Skill Center画面の安定表示を保証する。

### 背景

実データに型期待を満たさない項目が混在し、undefined.length と toLowerCase 例外で画面全体が落ちる事象が発生した。

### 最終ゴール

欠損メタデータ入力でも画面が継続表示され、推薦・詳細・カード表示が安全に動作する。

### 成果物一覧

| 種別        | 成果物                    | 配置先                                                                                   |
| ----------- | ------------------------- | ---------------------------------------------------------------------------------------- |
| 仕様        | index.md + phase-1..13    | docs/30-workflows/03-TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001/                 |
| 管理        | artifacts.json            | docs/30-workflows/03-TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001/artifacts.json   |
| Phase成果物 | phase別ドキュメント成果物 | docs/30-workflows/03-TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001/outputs/phase-\* |

## 関心ごとの分離（SubAgent Team）

| SubAgent | 担当責務                                           | 並列可否     |
| -------- | -------------------------------------------------- | ------------ |
| A        | Hook防御（`useSkillCenter` / `useFeaturedSkills`） | B と並列     |
| B        | Component防御（`SkillCard` / `SkillDetailPanel`）  | A と並列     |
| C        | 欠損入力回帰テスト・Phase 12 文書同期              | A/B 後に直列 |

## 現時点の実装知見（仕様へ逆流）

- 型定義上は必須でも実データ欠損が起こるギャップ
- Hook/Component複数箇所で同種防御が必要
- テストが正常系中心で欠損ケース未カバー

## システム仕様参照（aiworkflow-requirements）

### 抽出手順（Progressive Disclosure）

1. `indexes/resource-map.md` で UI/Renderer/Testing の参照対象を先に特定する。
2. `scripts/search-spec.js` で `SkillCenter` / `importedSkills` を検索し、欠損データ耐性に関係する仕様へ絞る。
3. 変更ファイル（`useSkillCenter.ts`, `useFeaturedSkills.ts`, `SkillCard.tsx`, `SkillDetailPanel.tsx`）と仕様書の対応を確定する。

### 仕様書別 SubAgent 分担（仕様同期）

| SubAgent | 担当仕様書                                                                                                                                         | 責務                                   |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| A        | `references/ui-ux-feature-components.md` / `references/ui-ux-components.md`                                                                        | 欠損メタデータ時の画面挙動と表示契約   |
| B        | `references/arch-ui-components.md` / `references/arch-state-management.md` / `references/interfaces-agent-sdk-skill.md`                            | Hook/Component境界と型契約の防御設計   |
| C        | `references/testing-component-patterns.md` / `references/quality-requirements.md` / `references/error-handling.md` / `references/task-workflow.md` | 防御ケースのテスト戦略と品質観点の同期 |

### 抽出済み参照仕様（今回実装に必要）

| 参照資料             | パス                                                                                        | 反映ポイント                              |
| -------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------- |
| 参照起点             | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                            | 必要仕様の絞り込み起点                    |
| 早見表               | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                         | UI/Hook/Store契約の早見確認               |
| UI機能仕様           | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | SkillCenterのUI要件と責務範囲             |
| UIコンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | カード/詳細パネルの表示契約               |
| UIアーキ仕様         | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                   | Hook/Component分離とデータフロー          |
| 状態管理仕様         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | selector利用とfallback方針                |
| インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | `SkillMetadata` 由来データ契約            |
| テスト仕様           | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | 欠損データの回帰テスト観点                |
| 品質要件             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | クラッシュ防止とUX継続要件                |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | `importedSkills`/欠損入力系の再発防止観点 |
| エラーハンドリング   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | 例外時の防御動作方針                      |
| タスク台帳           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 完了/未タスク反映                         |

## ブランチ差分カバレッジ（本タスク担当）

| 種別            | 変更ファイル                                                                                         | 担当        | 根拠                                 |
| --------------- | ---------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------ |
| Hook実装        | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts`                            | ✅ 03       | description欠損時の検索/フィルタ防御 |
| Hook実装        | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useFeaturedSkills.ts`                         | ✅ 03       | 配列欠損時の人気度計算防御           |
| Component実装   | `apps/desktop/src/renderer/views/SkillCenterView/components/SkillCard.tsx`                           | ✅ 03       | description/配列欠損時の描画防御     |
| Component実装   | `apps/desktop/src/renderer/views/SkillCenterView/components/SkillDetailPanel/SkillDetailPanel.tsx`   | ✅ 03       | sub-resource欠損時の詳細表示防御     |
| Hookテスト      | `apps/desktop/src/renderer/views/SkillCenterView/__tests__/useSkillCenter.test.ts`                   | ✅ 03       | description欠損ケース回帰            |
| Hookテスト      | `apps/desktop/src/renderer/views/SkillCenterView/__tests__/useFeaturedSkills.test.ts`                | ✅ 03       | 配列/description欠損ケース回帰       |
| Componentテスト | `apps/desktop/src/renderer/views/SkillCenterView/__tests__/SkillCard.test.tsx`                       | ✅ 03       | 描画クラッシュ防止回帰               |
| Componentテスト | `apps/desktop/src/renderer/views/SkillCenterView/__tests__/SkillDetailPanel.test.tsx`                | ✅ 03       | パネル描画クラッシュ防止回帰         |
| IPC/Store冪等   | `apps/desktop/src/main/ipc/skillHandlers.ts`, `apps/desktop/src/renderer/store/slices/agentSlice.ts` | ⬅️ 02を参照 | 状態供給側契約は 02 の主責務         |

## 横断依存関係（03視点）

| 依存先            | 関係     | 整合条件                                                |
| ----------------- | -------- | ------------------------------------------------------- |
| 01-reconciliation | 間接依存 | 復元済み imported 一覧を安全表示できること              |
| 02-idempotency    | 直接依存 | 重複インポート抑止後の store 状態が UI で破綻しないこと |

## 思考フレーム監査リンク

- 横断監査（20思考フレーム、矛盾/漏れ/依存チェック）:
  `docs/30-workflows/00-SKILL-IMPORT-SPECS-CROSS-AUDIT-20260304.md`

## タスク分解サマリー

| ID   | Phase | サブタスク       | 責務                       | 依存 |
| ---- | ----- | ---------------- | -------------------------- | ---- |
| T-01 | 1     | 要件定義         | 再現条件・受け入れ基準固定 | -    |
| T-02 | 2     | 設計             | 責務境界と契約設計         | T-01 |
| T-03 | 3     | 設計レビュー     | Gate判定                   | T-02 |
| T-04 | 4     | テスト作成       | Redケース固定              | T-03 |
| T-05 | 5     | 実装             | Green実装                  | T-04 |
| T-06 | 6     | テスト拡充       | 回帰防止                   | T-05 |
| T-07 | 7     | カバレッジ確認   | 検証網羅性判定             | T-06 |
| T-08 | 8     | リファクタ       | 保守性改善                 | T-07 |
| T-09 | 9     | 品質保証         | 品質ゲート判定             | T-08 |
| T-10 | 10    | 最終レビュー     | 最終是正判定               | T-09 |
| T-11 | 11    | 手動テスト       | 実機検証と証跡化           | T-10 |
| T-12 | 12    | ドキュメント更新 | 仕様同期・苦戦箇所記録     | T-11 |
| T-13 | 13    | PR作成準備       | 変更説明の整備             | T-12 |

## 実行フロー図

Phase 1 -> Phase 2 -> Phase 3 -> Phase 4 -> Phase 5 -> Phase 6 -> Phase 7
-> Phase 8 -> Phase 9 -> Phase 10 -> Phase 11 -> Phase 12 -> Phase 13

## Phase一覧

| Phase | 名称                 | 仕様書                                                       | ステータス |
| ----- | -------------------- | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)           | pending    |
| 2     | 設計                 | [phase-2-design.md](phase-2-design.md)                       | pending    |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](phase-3-design-review.md)         | pending    |
| 4     | テスト作成           | [phase-4-test-creation.md](phase-4-test-creation.md)         | pending    |
| 5     | 実装                 | [phase-5-implementation.md](phase-5-implementation.md)       | pending    |
| 6     | テスト拡充           | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | pending    |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | pending    |
| 8     | リファクタリング     | [phase-8-refactoring.md](phase-8-refactoring.md)             | pending    |
| 9     | 品質保証             | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | pending    |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)         | pending    |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](phase-11-manual-test.md)           | pending    |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md)       | pending    |
| 13    | PR作成               | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | pending    |

## テストカバレッジ目標

| 指標              | 目標     |
| ----------------- | -------- |
| Line Coverage     | 90% 以上 |
| Branch Coverage   | 80% 以上 |
| Function Coverage | 90% 以上 |

## Phase完了時の必須アクション

1. 本Phase内タスクを100%完了する。
2. 成果物を outputs/phase-N/ に記録する。
3. 次Phaseへ引き継ぎ事項を明記する。

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/03-TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/03-TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001
```
