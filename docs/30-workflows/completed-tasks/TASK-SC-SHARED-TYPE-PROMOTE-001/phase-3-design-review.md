# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 3                               |
| タスクID   | TASK-SC-SHARED-TYPE-PROMOTE-001 |
| 機能名     | shared-type-promote             |
| 前提Phase  | Phase 2                         |
| 後続Phase  | Phase 4                         |
| 作成日     | 2026-04-16                      |
| ステータス | skipped                         |

## 目的

Phase 2 の設計書をレビューし、以下の観点でゲート判定を行う:

1. Single Source of Truth が確立されているか
2. ビルド依存関係が正しく設計されているか
3. import シャドウイングリスクが排除されているか
4. 型定義の完全性が保証されているか

## 実行タスク

- [ ] Phase 2 設計書（`outputs/phase-2/design.md`）のレビュー
- [ ] ゲート判定（PASS / FAIL / MAJOR）の実施
- [ ] ゲート結果の記録（`outputs/phase-3/gate-decision.md`）

## 参照資料

| 資料名                 | パス                                                          | 用途                   |
| ---------------------- | ------------------------------------------------------------- | ---------------------- |
| Phase 2 設計書         | `outputs/phase-2/design.md`                                   | レビュー対象           |
| Phase 1 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`                      | AC-1〜AC-5 確認        |
| SkillCreatorService.ts | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | 現行コードとの整合確認 |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                 | 内容                       |
| -------------------- | ---------------------------------------------------- | -------------------------- |
| 型定義・共有パターン | `.claude/skills/aiworkflow-requirements/references/` | monorepo型共有設計パターン |

## レビューチェックリスト

| #   | チェック観点                                                                          | 合否 | 備考 |
| --- | ------------------------------------------------------------------------------------- | ---- | ---- |
| R-1 | `StructurePlanJson` が `packages/shared/src/types/skillCreator.ts` に移動される設計か | -    |      |
| R-2 | `packages/shared/index.ts` からの re-export が設計されているか                        | -    |      |
| R-3 | ローカル定義の削除が明示されているか（Single Source of Truth）                        | -    |      |
| R-4 | `@repo/shared` → `@repo/desktop` のビルド順序が設計されているか                       | -    |      |
| R-5 | 全参照箇所の import パスが設計されているか                                            | -    |      |
| R-6 | 型定義のフィールドが現行コードと一致しているか                                        | -    |      |

## ゲート判定基準

| 判定     | 条件                                         | アクション           |
| -------- | -------------------------------------------- | -------------------- |
| PASS     | 全レビューチェックが合格                     | Phase 4 へ進む       |
| MINOR    | 軽微な指摘（ドキュメント不足など）           | Phase 2 に戻らず修正 |
| MAJOR    | 設計上の問題（ビルド依存・シャドウイング等） | Phase 2 に戻り再設計 |
| CRITICAL | 根本的な問題（要件違反など）                 | Phase 1 に戻り再判断 |

## 統合テスト連携

| 観点       | 内容                                           |
| ---------- | ---------------------------------------------- |
| 設計整合性 | 設計書の内容が AC-1〜AC-5 を満たしているか確認 |

## 多角的チェック観点（AIが判断）

- **型の後方互換性**: `StructurePlanJson` の定義変更がなく、既存コードへの影響が最小限であること
- **依存グラフ**: `packages/shared` → `apps/desktop` の依存方向が正しいこと（逆依存なし）
- **テスタビリティ**: 設計書の内容が単体テスト可能な形式になっているか

## サブタスク管理

| サブタスクID | 名称                       | ステータス |
| ------------ | -------------------------- | ---------- |
| T-03-1       | 設計書レビュー・ゲート判定 | skipped    |
| T-03-2       | ゲート結果記録             | skipped    |

## 成果物

| 成果物名                       | パス                               | 種別         |
| ------------------------------ | ---------------------------------- | ------------ |
| 設計レビュー結果（ゲート判定） | `outputs/phase-3/gate-decision.md` | ドキュメント |

## 完了条件

- [ ] 全レビューチェックが完了していること
- [ ] ゲート判定（PASS/MINOR/MAJOR/CRITICAL）が記録されていること
- [ ] PASS または MINOR の場合のみ Phase 4 へ進む
- [ ] `outputs/phase-3/gate-decision.md` が作成されていること

## タスク100%実行確認【必須】

- [ ] Phase 2 設計書のレビュー完了
- [ ] R-1〜R-6 の全チェック完了
- [ ] ゲート判定の決定と記録完了
- [ ] ゲート結果に基づくアクション確定

## 次Phase

- **PASS/MINOR**: [Phase 4: テスト作成](phase-4-test-creation.md)
- **MAJOR**: [Phase 2: 設計](phase-2-design.md) に戻る
- **CRITICAL**: [Phase 1: 要件定義](phase-1-requirements.md) に戻る
