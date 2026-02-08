# TASK-FIX-1-2: SkillExecutor ローカル型定義削除

## メタ情報

| 項目         | 内容                                      |
| ------------ | ----------------------------------------- |
| タスクID     | TASK-FIX-1-2-SKILLEXECUTOR-TYPE-CLEANUP   |
| タスク名     | SkillExecutor内の重複型定義を共有型に統一 |
| 分類         | リファクタリング                          |
| 対象機能     | SkillExecutor 型定義                      |
| 優先度       | 高                                        |
| 見積もり規模 | 小規模                                    |
| ステータス   | 未実施                                    |
| 作成日       | 2026-02-07                                |
| 発見元       | skill-system-conflict-report #1           |
| 関連Phase    | Phase 1（E2E接続）                        |
| 関連Issue    | Issue #622, TASK-7D                       |

---

## 概要

`SkillExecutor.ts` L25-120 に残存する6つのローカル型定義を削除し、`@repo/shared/src/types/skill.ts` の正本型に統一する。

### 重複型一覧

| ローカル型                | SkillExecutor.ts | shared/types/skill.ts | 差異                                         |
| ------------------------- | ---------------- | --------------------- | -------------------------------------------- |
| `SkillStreamMessage`      | L93-108          | L446-466              | type値が異なる（旧: text/complete/retry）    |
| `SkillExecutionRequest`   | L67-74           | L310-319              | フィールド名が異なる（skillId vs skillName） |
| `SkillExecutionResponse`  | L77-81           | L324-333              | `error?: SkillExecutionError` vs `string`    |
| `ExecutionState`          | L31-36           | L519-524              | 値は同一だが定義が重複                       |
| `ExecutionInfo`           | L84-90           | L529-544              | フィールド同一だが定義が重複                 |
| `SkillExecutionErrorCode` | L110-120         | L549-558              | 値は同一だが定義が重複                       |

---

## Phase一覧

| Phase | 名称                   | カテゴリ     | ステータス | 仕様書パス                                                               |
| ----- | ---------------------- | ------------ | ---------- | ------------------------------------------------------------------------ |
| 1     | 要件定義               | 要件         | 未実施     | [phase-01-requirements.md](./phase-01-requirements.md)                   |
| 2     | 設計                   | 設計         | 未実施     | [phase-02-design.md](./phase-02-design.md)                               |
| 3     | 設計レビューゲート     | ゲート       | 未実施     | [phase-03-design-review.md](./phase-03-design-review.md)                 |
| 4     | テスト作成（TDD: Red） | TDD-Red      | 未実施     | [phase-04-test-creation.md](./phase-04-test-creation.md)                 |
| 5     | 実装（TDD: Green）     | TDD-Green    | 未実施     | [phase-05-implementation.md](./phase-05-implementation.md)               |
| 6     | テスト拡充             | 品質         | 未実施     | [phase-06-test-expansion.md](./phase-06-test-expansion.md)               |
| 7     | テストカバレッジ確認   | 品質         | 未実施     | [phase-07-coverage-verification.md](./phase-07-coverage-verification.md) |
| 8     | リファクタリング       | TDD-Refactor | 未実施     | [phase-08-refactoring.md](./phase-08-refactoring.md)                     |
| 9     | 品質保証               | 品質         | 未実施     | [phase-09-quality-assurance.md](./phase-09-quality-assurance.md)         |
| 10    | 最終レビューゲート     | ゲート       | 未実施     | [phase-10-final-review.md](./phase-10-final-review.md)                   |
| 11    | 手動テスト検証         | 検証         | 未実施     | [phase-11-manual-testing.md](./phase-11-manual-testing.md)               |
| 12    | ドキュメント更新       | 文書化       | 未実施     | [phase-12-documentation.md](./phase-12-documentation.md)                 |
| 13    | PR作成                 | 完了         | 未実施     | [phase-13-pr-creation.md](./phase-13-pr-creation.md)                     |

---

## 依存関係

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7
                                                              ↓
                     Phase 13 ← Phase 12 ← Phase 11 ← Phase 10 ← Phase 9 ← Phase 8
```

### 前提タスク

- **TASK-FIX-1-1-TYPE-ALIGNMENT**: 完了済み（本タスクはその残存対応）

---

## 影響範囲

### 直接影響

| ファイル                                                        | 変更内容                   |
| --------------------------------------------------------------- | -------------------------- |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts`         | ローカル型削除、import追加 |
| `apps/desktop/src/renderer/store/slices/setupSkillListeners.ts` | 型キャストの解消確認       |

### 間接影響

| ファイル                                                     | 確認内容          |
| ------------------------------------------------------------ | ----------------- |
| `apps/desktop/src/main/services/skill/PermissionResolver.ts` | 型参照の更新      |
| `apps/desktop/src/main/ipc/skill/*.ts`                       | IPC型の整合性確認 |

---

## 品質基準

| 項目             | 基準                              |
| ---------------- | --------------------------------- |
| 型安全性         | `as any`, `as unknown` の増加なし |
| コード品質       | ESLint/Prettier 通過              |
| テストカバレッジ | Line 80%+, Branch 60%+            |
| 全テスト         | PASS                              |

---

## リスクと対策

| リスク                               | 影響度 | 発生確率 | 対策                                    |
| ------------------------------------ | ------ | -------- | --------------------------------------- |
| type 値変更で実行時の分岐が壊れる    | 高     | 中       | SkillStreamMessage の switch 文を全確認 |
| skillId → skillName で呼び出し元破壊 | 高     | 中       | grep で全参照箇所を特定してから修正     |

---

## 参照資料

| 資料名         | パス                                                                                               |
| -------------- | -------------------------------------------------------------------------------------------------- |
| 元タスク指示書 | `docs/30-workflows/skill-import-agent-system/tasks/01a-task-fix-1-2-skillexecutor-type-cleanup.md` |
| 共有型定義     | `packages/shared/src/types/skill.ts`                                                               |
| SkillExecutor  | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                                            |
| 型定義ガイド   | `aiworkflow-requirements: interfaces-*.md`                                                         |

---

## 変更履歴

| 日付       | バージョン | 変更内容               |
| ---------- | ---------- | ---------------------- |
| 2026-02-07 | 1.0.0      | 初版作成（Phase 1-13） |
