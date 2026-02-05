# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                   |
| ------ | -------------------- |
| Phase  | 6                    |
| 機能名 | auth-session-refresh |
| 作成日 | 2026-02-05           |

## 目的

Phase 5の実装に対してテストを拡充し、カバレッジ目標を達成する。authSlice連携テスト、エッジケーステスト、統合テストを追加する。

## 実行タスク

- カバレッジ分析: 現在のテストカバレッジ測定と不足領域の特定
- authSlice連携テスト: スケジューラーとauthSliceの連携テスト追加
- エッジケーステスト: 境界値・異常系テストの追加
- 統合テスト: IPC経由のリフレッシュフローテスト

## 参照資料

| 資料名                      | パス                                                           | 説明          |
| --------------------------- | -------------------------------------------------------------- | ------------- |
| テスト仕様書                | `outputs/phase-4/test-specification.md`                        | Phase 4成果物 |
| 実装サマリー                | `outputs/phase-5/implementation-summary.md`                    | Phase 5成果物 |
| TokenRefreshSchedulerテスト | `apps/desktop/src/main/services/tokenRefreshScheduler.test.ts` | 既存テスト    |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                                        | 内容                              |
| -------------------- | ------------------------------------------------------------------------------------------- | --------------------------------- |
| 認証インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                      | AuthSession型、AuthState型定義    |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IPC通信テストパターン、モック戦略 |
| テストカバレッジ基準 | `.claude/skills/task-specification-creator/references/coverage-standards.md`                | ユニット・結合テストカバレッジ    |

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 実行手順

### ステップ1: カバレッジ測定

```bash
pnpm --filter @repo/desktop test:run --coverage tokenRefreshScheduler
```

### ステップ2: authSlice連携テスト追加

**テストファイル**: `apps/desktop/src/renderer/store/slices/authSlice.test.ts`（既存ファイルに追加）

```typescript
describe("authSlice - 自動リフレッシュ連携", () => {
  it("initializeAuth成功時にstartRefreshSchedulerが呼ばれること", () => {});
  it("onAuthStateChanged SIGNED_INでスケジューラーが開始されること", () => {});
  it("onAuthStateChanged SIGNED_OUTでスケジューラーが停止されること", () => {});
  it("refreshSession成功時にsessionExpiresAtが更新されること", () => {});
  it("refreshSession成功時にスケジューラーがリセットされること", () => {});
  it("logout時にstopRefreshSchedulerが呼ばれること", () => {});
  it("isRefreshingがリフレッシュ中にtrueになること", () => {});
  it("isRefreshingがリフレッシュ完了後にfalseになること", () => {});
});
```

### ステップ3: TokenRefreshScheduler追加テスト

```typescript
describe("TokenRefreshScheduler - エッジケース", () => {
  it("configのrefreshBeforeExpiryMsをカスタム値で設定できること", () => {});
  it("configのmaxRetriesを0に設定した場合、リトライなしでonFailureが呼ばれること", () => {});
  it("onRefreshが非常に長時間かかる場合でも正しく動作すること", () => {});
  it("リフレッシュ中にstop()を呼んだ場合、リトライが中止されること", () => {});
  it("リフレッシュ中にdispose()を呼んだ場合、全処理が中止されること", () => {});
});
```

### ステップ4: 統合テスト再実行

```bash
pnpm --filter @repo/desktop test:run
```

## 統合テスト連携【必須】

| テストカテゴリ     | 検証項目                                             | 目標 |
| ------------------ | ---------------------------------------------------- | ---- |
| 認証連携テスト     | スケジューラー→IPC→リフレッシュ→状態更新の一連フロー | 100% |
| エラーハンドリング | リトライ→全失敗→ログアウトフロー                     | 80%+ |
| 状態同期テスト     | authSlice状態更新の正確性                            | 100% |

## 成果物

| 成果物             | パス                                                           | 説明               |
| ------------------ | -------------------------------------------------------------- | ------------------ |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`                           | カバレッジ分析結果 |
| 追加テストコード   | `apps/desktop/src/main/services/tokenRefreshScheduler.test.ts` | 追加テスト         |
| authSliceテスト    | `apps/desktop/src/renderer/store/slices/authSlice.test.ts`     | 連携テスト         |

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] authSlice連携テストが追加されている（8件以上）
- [ ] TokenRefreshSchedulerエッジケーステストが追加されている（5件以上）
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認（Phase 4-5成果物）
2. 現在のカバレッジ測定
3. authSlice連携テスト追加（8件以上）
4. TokenRefreshSchedulerエッジケーステスト追加（5件以上）
5. 統合テスト再実行
6. カバレッジレポート作成
7. 完了条件の検証

## タスク100%実行確認【必須】

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-AUTH-SESSION-REFRESH-001 --phase 6
```

## 次のPhase

Phase 7: テストカバレッジ確認
