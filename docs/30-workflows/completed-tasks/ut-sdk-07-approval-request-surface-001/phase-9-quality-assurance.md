# Phase 9: 品質保証

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| Phase      | 9                                      |
| 前提Phase  | Phase 8                                |
| 後続Phase  | Phase 10                               |
| ステータス | 未実施                                 |
| 作成日     | 2026-04-06                             |
| 機能名     | ut-sdk-07-approval-request-surface-001 |

## 目的

全テスト・lint・typecheck が PASS であることを確認し、品質ゲートを通過する。

---

## 実行タスク

### タスク1: 全品質チェック実行

**実行コマンド**:

```bash
# lint
pnpm --filter @repo/desktop lint

# 型チェック
pnpm --filter @repo/desktop typecheck

# 全テスト実行
pnpm --filter @repo/desktop test

# フォーマット確認
pnpm --filter @repo/desktop format:check
```

### タスク2: 品質チェックリスト確認

#### 機能検証

- [ ] 全ユニットテスト成功（`skill-creator-api.approval.test.ts`）
- [ ] 全ユニットテスト成功（`SkillLifecyclePanel.approval.test.tsx`）
- [ ] 既存テストが引き続き PASS（`skill-creator-api.ts` 関連）
- [ ] 既存テストが引き続き PASS（`SkillLifecyclePanel.tsx` 関連）

#### コード品質

- [ ] Lint エラーなし
- [ ] 型エラーなし
- [ ] コードフォーマット適用済み

#### テスト網羅性

- [ ] Line Coverage 80%+ 達成（Phase 7 確認済み）
- [ ] Branch Coverage 60%+ 達成（Phase 7 確認済み）
- [ ] Function Coverage 80%+ 達成（Phase 7 確認済み）

---

## 参照資料

| 参照資料        | パス                                                                                         | 内容         |
| --------------- | -------------------------------------------------------------------------------------------- | ------------ |
| preload テスト  | `apps/desktop/src/preload/__tests__/skill-creator-api.approval.test.ts`                      | 品質確認対象 |
| renderer テスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.approval.test.tsx` | 品質確認対象 |

---

## 成果物

| 成果物           | パス                           | 内容             |
| ---------------- | ------------------------------ | ---------------- |
| 品質確認レポート | `outputs/phase-9/qa-report.md` | 品質チェック結果 |

---

## 完了条件

- [ ] 全ユニットテスト PASS
- [ ] Lint エラーなし
- [ ] 型エラーなし
- [ ] カバレッジ目標達成（Phase 7 確認済み）
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 10: 最終レビューゲート → [phase-10-final-review.md](phase-10-final-review.md)
