# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| Phase      | 4                                                  |
| 機能名     | TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001 |
| タスク名   | SkillCenter UI の欠損メタデータ耐性強化            |
| 前提Phase  | Phase 3                                            |
| 後続Phase  | 実装                                               |
| 作成日     | 2026-03-04                                         |
| ステータス | pending                                            |

## 目的

失敗するテストを先に作成し、期待動作を固定化する。

## 背景

実データに型期待を満たさない項目が混在し、undefined.length と toLowerCase 例外で画面全体が落ちる事象が発生した。

## SubAgent分担

| SubAgent | 担当                                               |
| -------- | -------------------------------------------------- |
| A        | Hook防御（`useSkillCenter` / `useFeaturedSkills`） |
| B        | Component防御（`SkillCard` / `SkillDetailPanel`）  |
| C        | 欠損入力テスト・Phase 12仕様同期                   |

## 実行タスク

- 単体テスト作成: 主要失敗パターンを Red で固定化する
- 契約テスト作成: IPC/Store/Hook の境界条件を定義する
- 回帰テスト雛形: 既知不具合を再現するケースを追加する

## 参照資料

| 参照資料                   | パス                                                    | 説明           |
| -------------------------- | ------------------------------------------------------- | -------------- |
| 要件定義書                 | `outputs/phase-1/requirements-definition.md`            | Phase 1 成果物 |
| 受け入れ基準               | `outputs/phase-1/acceptance-criteria.md`                | Phase 1 成果物 |
| スコープ定義               | `outputs/phase-1/scope-definition.md`                   | Phase 1 成果物 |
| アーキテクチャ設計         | `outputs/phase-2/architecture-design.md`                | Phase 2 成果物 |
| API仕様                    | `outputs/phase-2/api-specification.md`                  | Phase 2 成果物 |
| 状態設計                   | `outputs/phase-2/state-design.md`                       | Phase 2 成果物 |
| 設計レビュー結果           | `outputs/phase-3/design-review-result.md`               | Phase 3 成果物 |
| レビューゲート判定         | `outputs/phase-3/review-gate-decision.md`               | Phase 3 成果物 |
| ブランチ差分カバレッジ監査 | `outputs/phase-1/branch-diff-coverage.md`               | Phase 1 成果物 |
| aiworkflow仕様抽出網羅監査 | `outputs/phase-1/aiworkflow-requirements-extraction.md` | Phase 1 成果物 |
| 20思考フレーム整合監査     | `outputs/phase-1/multi-thinking-consistency-audit.md`   | Phase 1 成果物 |

## テスト対象ファイル（差分追跡）

| 区分           | ファイル                                                                              | 観点                               |
| -------------- | ------------------------------------------------------------------------------------- | ---------------------------------- |
| Hook Test      | `apps/desktop/src/renderer/views/SkillCenterView/__tests__/useSkillCenter.test.ts`    | description欠損時のフィルタ安全性  |
| Hook Test      | `apps/desktop/src/renderer/views/SkillCenterView/__tests__/useFeaturedSkills.test.ts` | 配列/description欠損時の推薦安全性 |
| Component Test | `apps/desktop/src/renderer/views/SkillCenterView/__tests__/SkillCard.test.tsx`        | 欠損メタデータ時のカード描画安全性 |
| Component Test | `apps/desktop/src/renderer/views/SkillCenterView/__tests__/SkillDetailPanel.test.tsx` | 欠損メタデータ時の詳細パネル安全性 |

## 実行手順

1. 参照資料を確認して判断根拠を固定する。
2. 実行タスクを順に処理し、成果物へ反映する。
3. 完了条件を検証し、次Phaseへ引き継ぐ。

## 統合テスト連携（Phase 1〜11）

- Main/Preload/Renderer の接続点を明示してテスト観点へ反映する。
- 不具合再現条件を自動テストと手動テスト双方へ引き継ぐ。

## 多角的チェック観点（AIが判断）

| 観点               | 確認内容                         | 参照仕様                   |
| ------------------ | -------------------------------- | -------------------------- |
| セキュリティ       | sender検証・入力検証・境界防御   | security-\*.md             |
| UI/UX              | 表示崩れ・導線・アクセシビリティ | ui-ux-\*.md                |
| アーキテクチャ     | 責務分離と依存方向               | architecture-\*.md         |
| API/IPC            | 引数・戻り値・エラー契約         | api-_.md / interfaces-_.md |
| エラーハンドリング | 例外分類と利用者通知             | error-handling.md          |

## 成果物

| 成果物           | パス                                    | 内容           |
| ---------------- | --------------------------------------- | -------------- |
| テスト仕様書     | `outputs/phase-4/test-specification.md` | Redケース定義  |
| テストケース一覧 | `outputs/phase-4/test-cases.md`         | 単体/契約/回帰 |

## 完了条件

- [ ] 実行タスクの成果物が定義されている
- [ ] 参照仕様との整合根拠を記録する
- [ ] 次Phaseへの引き継ぎ事項を記録する
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] Phase内で定義した成果物を全件記録
- [ ] 引き継ぎ事項を明記

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/03-TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001
```

## Phase実行記録

| 項目         | 記録    |
| ------------ | ------- |
| 実行タスク   | pending |
| 発見事項     | pending |
| 引き継ぎ事項 | pending |

## 次のPhase

Phase 5 実装
