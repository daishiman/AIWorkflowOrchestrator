# Phase 9: 品質保証

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| Phase      | 9                                        |
| Phase名    | 品質保証                                 |
| 前提Phase  | Phase 8                                  |
| 後続Phase  | Phase 10                                 |
| ステータス | 未実施                                   |
| 作成日     | 2026-04-08                               |
| 機能名     | task-sc-13-verify-channel-implementation |

---

## 目的

typecheck・lint・全テストを一括実行し、Phase 1 で定義した受入基準（AC-8〜AC-10）を
満たしていることを確認する。

---

## 品質チェックリスト

### 機能検証

- [ ] verify ハンドラ UT 全件成功（TC-V-01〜TC-V-12）
- [ ] E2E テスト全件成功（TC-E2E-V-01〜TC-E2E-V-04）
- [ ] 既存 plan/execute/improve/applyImprovement テスト全件 PASS（回帰確認）

### コード品質

- [ ] `pnpm --filter @repo/desktop typecheck` エラーなし（AC-9）
- [ ] `pnpm --filter @repo/shared typecheck` エラーなし
- [ ] `pnpm --filter @repo/desktop lint` エラーなし
- [ ] `pnpm --filter @repo/shared lint` エラーなし
- [ ] コードフォーマット適用済み（Prettier）

### テスト網羅性

- [ ] `creatorHandlers.ts` verify 部分の line カバレッジ ≥ 90%（Phase 7 計測済み）
- [ ] `creatorHandlers.ts` verify 部分の branch カバレッジ ≥ 80%（Phase 7 計測済み）

### セキュリティ

- [ ] `validateSender` が verify ハンドラで呼ばれていること
- [ ] `sanitizeErrorMessage` でエラーメッセージが sanitize されていること
- [ ] 機密情報がエラーレスポンスに含まれないこと

---

## 実行タスク

### タスク1: 品質チェック全件実行

```bash
# 1. 関連ユニットテスト
pnpm --filter @repo/desktop test apps/desktop/src/main/ipc/__tests__/creatorHandlers.verify.test.ts

# 2. E2E テスト
pnpm --filter @repo/desktop test apps/desktop/src/test/skill-creator-integration.test.ts

# 3. 既存テスト全件（回帰確認）
pnpm --filter @repo/desktop test apps/desktop/src/main/ipc/__tests__/

# 4. TypeScript 型チェック
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/shared typecheck

# 5. Lint
pnpm --filter @repo/desktop lint
pnpm --filter @repo/shared lint
```

---

### タスク2: ファイル削除確認（stub 化チェック）

**目的**: 廃止ファイルが残っていないか確認する（FB-UI-02-1 対応）

本タスクでは新規ファイル1件（`creatorHandlers.verify.test.ts`）のみ追加。削除対象ファイルなし。

---

### タスク3: 品質チェック結果の記録

**実行手順**:

1. 全コマンドの実行結果を `outputs/phase-9/quality-check-result.md` に記録する
2. FAIL があった場合は原因を特定し、修正後に再実行する

---

## 成果物

| 成果物           | パス                                      | 内容                            |
| ---------------- | ----------------------------------------- | ------------------------------- |
| 品質チェック結果 | `outputs/phase-9/quality-check-result.md` | 全チェック項目の PASS/FAIL 記録 |

---

## 参照資料

| 参照資料       | パス                                                                 | 内容                        |
| -------------- | -------------------------------------------------------------------- | --------------------------- |
| 依存Phase      | Phase 5                                                              | 本Phase の前提              |
| カバレッジ結果 | `outputs/phase-7/coverage-report.md`                                 | 重点カバレッジの達成状況    |
| リファクタ結果 | `outputs/phase-8/refactoring-result.md`                              | 重複削減後の最終形          |
| UT             | `apps/desktop/src/main/ipc/__tests__/creatorHandlers.verify.test.ts` | verify ハンドラの単体テスト |
| E2E            | `apps/desktop/src/test/skill-creator-integration.test.ts`            | verify シナリオの統合テスト |

## 統合テスト連携

- 品質保証で統合テスト結果を確認（Plan/Execute/Verify の E2E 全件 PASS）
- AC-8（既存テスト非影響）/ AC-9（typecheck PASS）/ AC-10（テスト全件 PASS）を達成確認

---

## 完了条件

- [ ] verify UT（TC-V-01〜TC-V-12）全件 PASS であること
- [ ] E2E テスト（TC-E2E-V-01〜TC-E2E-V-04）全件 PASS であること
- [ ] 既存テスト（plan/execute/improve）全件 PASS であること（AC-8）
- [ ] TypeScript 型チェック PASS であること（AC-9, AC-10）
- [ ] Lint エラーなしであること
- [ ] `outputs/phase-9/quality-check-result.md` が作成されていること

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 8 が完了していること
- **後続**: Phase 10 へ進む

---

## 次Phase

**Phase 10: 最終レビューゲート** — AC 全件を検証し、マージ可否を判定する。
