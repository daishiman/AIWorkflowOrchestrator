# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                   |
| ------ | -------------------- |
| Phase  | 4                    |
| 機能名 | auth-session-refresh |
| 作成日 | 2026-02-05           |

## 目的

TokenRefreshSchedulerの期待動作を検証するテストを実装より先に作成する（Red状態）。

## 実行タスク

- TDD原則適用: テストファースト開発の実践
- TokenRefreshSchedulerユニットテスト: コアロジックのテスト作成
- authSlice統合テスト: スケジューラー連携のテスト作成
- 境界値分析: エッジケースのテスト追加

## 参照資料

| 資料名               | パス                                         | 説明          |
| -------------------- | -------------------------------------------- | ------------- |
| 要件定義書           | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| アーキテクチャ設計書 | `outputs/phase-2/architecture-design.md`     | Phase 2成果物 |
| インターフェース定義 | `outputs/phase-2/interface-definition.md`    | Phase 2成果物 |
| 設計レビュー結果     | `outputs/phase-3/design-review-result.md`    | Phase 3成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                                        | 内容                              |
| -------------------- | ------------------------------------------------------------------------------------------- | --------------------------------- |
| 認証インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                      | AuthSession型、テスト用型定義     |
| エラーハンドリング   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーコード、リトライ仕様        |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IPC通信テストパターン、モック戦略 |
| テスト品質基準       | `.claude/skills/task-specification-creator/references/coverage-standards.md`                | カバレッジ基準（Line 80%+等）     |

## 実行手順

### ステップ1: テストシナリオ設計

受け入れ基準（AC-001〜AC-009）からテストシナリオを導出する。

### ステップ2: TokenRefreshSchedulerユニットテスト作成

**テストファイル**: `apps/desktop/src/main/services/tokenRefreshScheduler.test.ts`

```typescript
// テストケース一覧（vi.useFakeTimers()を使用）

describe("TokenRefreshScheduler", () => {
  // --- 基本動作 ---
  it("start()でスケジューラーが開始されること", () => {});
  it("isRunning()が開始後にtrueを返すこと", () => {});
  it("stop()でスケジューラーが停止されること", () => {});
  it("stop()後にisRunning()がfalseを返すこと", () => {});

  // --- リフレッシュタイミング ---
  it("有効期限5分前（300秒前）にonRefreshコールバックが実行されること", () => {});
  it("有効期限まで5分未満の場合、即座にリフレッシュが実行されること", () => {});
  it("expiresAtが過去の値の場合、即座にリフレッシュが実行されること", () => {});

  // --- リフレッシュ成功 ---
  it("リフレッシュ成功時にonSuccessコールバックが呼ばれること", () => {});
  it("リフレッシュ成功後にreset()で新しいタイマーが設定されること", () => {});

  // --- リフレッシュ失敗・リトライ ---
  it("リフレッシュ失敗時にリトライが実行されること（最大3回）", () => {});
  it("リトライ間隔が5秒であること", () => {});
  it("全リトライ失敗後にonFailureコールバックが呼ばれること", () => {});

  // --- reset/dispose ---
  it("reset()で既存タイマーがクリアされ新タイマーが設定されること", () => {});
  it("dispose()で全タイマーがクリアされること", () => {});
  it("dispose()後にstart()を呼んでもエラーにならないこと", () => {});

  // --- エッジケース ---
  it("start()を二重呼び出しした場合、前のタイマーがクリアされること", () => {});
  it("stop()を二重呼び出しした場合、エラーにならないこと", () => {});
  it("configのデフォルト値が正しく適用されること", () => {});
});
```

### ステップ3: authSlice連携テスト設計

**テスト観点**（Phase 6で実装）:

- `startRefreshScheduler()`がログイン成功時に呼ばれること
- `stopRefreshScheduler()`がログアウト時に呼ばれること
- リフレッシュ成功時に`sessionExpiresAt`が更新されること

## 統合テスト連携【必須】

| シナリオカテゴリ   | 検証内容                                            | テストファイル                       |
| ------------------ | --------------------------------------------------- | ------------------------------------ |
| 認証連携テスト     | トークンリフレッシュ→セッション更新の一連のフロー   | `tokenRefreshScheduler.test.ts`      |
| エラーハンドリング | リフレッシュ失敗→リトライ→全失敗→ログアウトのフロー | `tokenRefreshScheduler.test.ts`      |
| 状態同期テスト     | リフレッシュ成功後のauthSlice状態更新               | `authSlice.test.ts`（Phase 6で拡充） |

## アーキテクチャ層別テスト

| 層           | テスト観点                             | テストファイル配置                                             |
| ------------ | -------------------------------------- | -------------------------------------------------------------- |
| Main Process | TokenRefreshSchedulerの全メソッド      | `apps/desktop/src/main/services/tokenRefreshScheduler.test.ts` |
| Renderer     | authSliceスケジューラー連携（Phase 6） | `apps/desktop/src/renderer/store/slices/authSlice.test.ts`     |

## 成果物

| 成果物                              | パス                                                           | 説明                      |
| ----------------------------------- | -------------------------------------------------------------- | ------------------------- |
| テスト仕様書                        | `outputs/phase-4/test-specification.md`                        | テスト設計                |
| テストケース一覧                    | `outputs/phase-4/test-cases.md`                                | ケース一覧                |
| TokenRefreshSchedulerテストファイル | `apps/desktop/src/main/services/tokenRefreshScheduler.test.ts` | 実際のテストコード（Red） |

## 完了条件

- [ ] TokenRefreshSchedulerの全テストケースが作成されている（18件以上）
- [ ] vi.useFakeTimers()を使用したタイマーテストが設計されている
- [ ] 境界値テスト（expiresAtが過去、5分未満、二重呼び出し）が含まれている
- [ ] リトライロジックのテストが含まれている
- [ ] すべてのテストが失敗状態（Red）
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test:run tokenRefreshScheduler.test.ts

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

## サブタスク管理

1. 参照資料の確認（Phase 1-3成果物）
2. テストシナリオ設計（AC-001〜AC-009からの導出）
3. TokenRefreshSchedulerユニットテスト作成（18件）
4. authSlice連携テスト設計
5. テストファイルの作成・配置
6. Red状態の確認
7. 完了条件の検証

## タスク100%実行確認【必須】

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-AUTH-SESSION-REFRESH-001 --phase 4
```

## 次のPhase

Phase 5: 実装（TDD: Green）
