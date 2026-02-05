# TASK-FIX-5-1-SKILL-API-UNIFICATION: SkillAPI二重定義の解消

## メタ情報

| 項目         | 内容                                 |
| ------------ | ------------------------------------ |
| タスクID     | TASK-FIX-5-1-SKILL-API-UNIFICATION   |
| タスク名     | SkillAPI二重定義の解消（仕様書準拠） |
| 分類         | リファクタリング                     |
| 対象機能     | Preload SkillAPI                     |
| 優先度       | 高                                   |
| 見積もり規模 | 中規模                               |
| ステータス   | 未実施                               |
| 作成日       | 2026-02-05                           |
| 前提タスク   | TASK-FIX-1-1, TASK-FIX-4-1           |

## 概要

2つの独立したskillAPI定義（`preload/skill-api.ts` と `renderer/preload/index.ts`）を
仕様書（specification.md §4）に準拠した単一の統合APIに統一する。

## Phase一覧

| Phase | 名称                 | カテゴリ     | ファイル                                                     |
| ----- | -------------------- | ------------ | ------------------------------------------------------------ |
| 1     | 要件定義             | 要件         | [phase-1-requirements.md](phase-1-requirements.md)           |
| 2     | 設計                 | 設計         | [phase-2-design.md](phase-2-design.md)                       |
| 3     | 設計レビューゲート   | ゲート       | [phase-3-design-review.md](phase-3-design-review.md)         |
| 4     | テスト作成           | TDD-Red      | [phase-4-test-creation.md](phase-4-test-creation.md)         |
| 5     | 実装                 | TDD-Green    | [phase-5-implementation.md](phase-5-implementation.md)       |
| 6     | テスト拡充           | 品質         | [phase-6-test-expansion.md](phase-6-test-expansion.md)       |
| 7     | テストカバレッジ確認 | 品質         | [phase-7-coverage-check.md](phase-7-coverage-check.md)       |
| 8     | リファクタリング     | TDD-Refactor | [phase-8-refactoring.md](phase-8-refactoring.md)             |
| 9     | 品質保証             | 品質         | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) |
| 10    | 最終レビューゲート   | ゲート       | [phase-10-final-review.md](phase-10-final-review.md)         |
| 11    | 手動テスト検証       | 検証         | [phase-11-manual-test.md](phase-11-manual-test.md)           |
| 12    | ドキュメント更新     | 文書化       | [phase-12-documentation.md](phase-12-documentation.md)       |
| 13    | PR作成               | 完了         | [phase-13-pr-creation.md](phase-13-pr-creation.md)           |

## 依存関係

```
Phase 1 → Phase 2 → Phase 3(Gate) → Phase 4 → Phase 5 → Phase 6 → Phase 7
  → Phase 8 → Phase 9 → Phase 10(Gate) → Phase 11 → Phase 12 → Phase 13
```

## 対象ファイル

### 主要変更ファイル

| ファイル                                                | 変更内容            |
| ------------------------------------------------------- | ------------------- |
| `apps/desktop/src/preload/skill-api.ts`                 | 統合APIのベース実装 |
| `apps/desktop/src/renderer/preload/index.ts`            | skillAPI定義の削除  |
| `apps/desktop/src/renderer/hooks/useSkillExecution.ts`  | API呼び出し元の修正 |
| `apps/desktop/src/renderer/hooks/useSkillPermission.ts` | API呼び出し元の修正 |
| `apps/desktop/src/renderer/store/slices/skillSlice.ts`  | API呼び出し元の修正 |

### 参照仕様書

| 仕様書                                    | 参照セクション      |
| ----------------------------------------- | ------------------- |
| `specification.md`                        | §4 API定義          |
| `interfaces-agent-sdk-skill.md`           | SkillAPI型定義      |
| `security-api-electron.md`                | Preloadセキュリティ |
| `architecture-implementation-patterns.md` | 実装パターン        |
