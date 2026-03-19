# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目             | 内容                                     |
| ---------------- | ---------------------------------------- |
| Phase 番号       | 4                                        |
| 機能名           | PreToolUse Hook フォールバック統合テスト |
| タスク ID        | UT-06-005-A-hook-fallback-integration    |
| 作成日           | 2026-03-17                               |
| 依存 Phase       | Phase 3（設計レビュー）                  |
| 担当エージェント | Phase4Writer                             |

## 目的

TDD の Red フェーズとして、実装前に失敗するテストケースを作成する。

- `handlePermissionCheck` の PreToolUse Hook 統合動作を検証するテストを作成する
- `sendPermissionRequestWithTimeout` のタイムアウト動作を検証するテストを作成する
- Phase 5 実装後に Green に転換することを確認する基準を定める

## 実行タスク

- TC-A 基本ケース実装: TC-A-001〜TC-A-006 の 6 テストケースを実装する
- テストファイル作成: `SkillExecutor.hook-fallback.test.ts` を新規作成する
- 既存モック整合: 既存モック構造（`SkillExecutor.fallback.test.ts`）を参照して一貫性を保つ
- timeout テスト実装: vitest のフェイクタイマーを使ったタイムアウトテストを実装する

## 参照資料

| 資料名               | パス                                                                            | 目的             |
| -------------------- | ------------------------------------------------------------------------------- | ---------------- |
| Phase 1 要件定義書   | `outputs/phase-1/requirements-definition.md`                                    | AC 一覧確認      |
| Phase 2 設計書       | `outputs/phase-2/architecture-design.md`                                        | 統合フロー設計   |
| Phase 3 設計レビュー | `outputs/phase-3/design-review-result.md`                                       | レビュー指摘対応 |
| 既存 Fallback テスト | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.fallback.test.ts` | モック構造参照   |
| SkillExecutor 実装   | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                         | 対象クラス確認   |
| コード品質ルール     | `.claude/rules/02-code-quality.md`                                              | TDD 原則確認     |
| 既知の落とし穴       | `.claude/rules/06-known-pitfalls.md`                                            | P13/P39/P40/P60  |

## 事前確認

### 既存ユーティリティ重複検出【必須】

テスト対象機能で使用する可能性のあるユーティリティ関数が既に存在しないか確認する:

```bash
grep -rn "export.*function.*sendPermissionRequest" packages/ apps/
grep -rn "export const sendPermissionRequest" packages/ apps/
grep -rn "export.*function.*processPermissionFallback" packages/ apps/
grep -rn "export.*function.*executeAbortFlow" packages/ apps/
```

### IPC レスポンス形式の事前合意

P60 対策として、テスト作成前に IPC レスポンス形式を確認・合意する:

| 形式                                                          | 使用基準                     | 例                       |
| ------------------------------------------------------------- | ---------------------------- | ------------------------ |
| `{ success: true, data: T }` / `{ success: false, error: E }` | CRUD 操作、外部サービス連携  | skill:import, auth:login |
| 直接値返却 (`T`)                                              | 単純な取得操作、同期的な判定 | theme:get, config:read   |

`sendPermissionRequest` の現在のレスポンス形式を確認する:

```bash
grep -n "sendPermissionRequest\|SkillPermissionResponse\|waitForResponse" apps/desktop/src/main/services/skill/SkillExecutor.ts | head -20
```

確認後、TC-A-001〜TC-A-006 のアサーション形式を統一してからテスト実装に進む。

### テスト対象ファイルの import 副作用チェック

テスト対象ファイルを import した際にトップレベル副作用が実行されないか確認する:

```bash
grep -n "^[^/]*\(app\.\|server\.\|connect\|initialize\|ipcMain\.\|BrowserWindow\)" apps/desktop/src/main/services/skill/SkillExecutor.ts | head -20
```

副作用が検出された場合は Phase 5 でのファイル分離を検討する。

## 実行手順

### Step 1: 既存テスト構造の確認

既存の `SkillExecutor.fallback.test.ts` からモック構造を確認し、同じモックパターンを踏襲する。

確認ポイント:

- `PermissionResolver` モック定義
- `PermissionStore` モック定義
- `AuthKeyService` モック定義
- `BrowserWindow` モック定義
- `SkillExecutor` インスタンス生成方法

### Step 2: テストファイル作成

テストファイルパス:

```
apps/desktop/src/main/services/skill/__tests__/SkillExecutor.hook-fallback.test.ts
```

ファイル冒頭には以下のコメントを含める:

```typescript
/**
 * SkillExecutor - Hook Fallback Integration Tests
 *
 * UT-06-005-A: PreToolUse Hook への Permission フォールバック統合
 *
 * TDD Red フェーズ: Phase 5 実装前に失敗するテストを作成。
 * Phase 5 実装により Green に転換させる。
 */
```

### Step 3: TC-A-001〜TC-A-006 実装

各テストケースを以下の仕様で実装する。

#### TC-A-001: Permission 拒否時に processPermissionFallback が呼ばれる

```
概要: PreToolUse Hook 内で sendPermissionRequest が拒否応答を返したとき、
      processPermissionFallback が1回呼ばれること

前提条件:
  - mockPermissionResolver.waitForResponse が { approved: false } を返す
  - executor.createHooks(executionId) で Hook を取得

操作:
  - PreToolUse Hook を呼び出す（ツール名: "Write"、保護パス以外）
  - P60 対策: sendPermissionRequest の戻り値形式を先に確認

期待結果:
  - processPermissionFallback の spy が1回呼ばれること
  - Hook の戻り値が { proceed: false } または AbortError になること
```

#### TC-A-002: abort フォールバック時にスキル実行が停止する

```
概要: processPermissionFallback が { action: "abort" } を返したとき、
      PreToolUse Hook から AbortError がスローされること

前提条件:
  - processPermissionFallback のスパイが { action: "abort", reason: "denied" } を返す
  - または waitForResponse が { approved: false } を返し、retryCount >= maxRetries

操作:
  - PreToolUse Hook を呼び出す

期待結果:
  - Hook が AbortError をスローすること（または proceed: false と error メッセージ）
```

#### TC-A-003: skip フォールバック時に実行が継続する

```
概要: processPermissionFallback が { action: "skip" } を返したとき、
      ツール実行がスキップされ次の処理が継続すること

前提条件:
  - waitForResponse が { approved: false, skip: true } を返す

操作:
  - PreToolUse Hook を呼び出す

期待結果:
  - Hook の戻り値が { proceed: false } となること（スキップ扱い）
  - executeSkipFlow が呼ばれること
```

#### TC-A-004: retry フォールバック時に再度 Permission 要求が発生する

```
概要: processPermissionFallback が { action: "retry" } を返したとき、
      sendPermissionRequest が再度呼ばれること

前提条件:
  - 1回目: waitForResponse が { approved: false } を返す（retryCount < maxRetries）
  - 2回目: waitForResponse が { approved: true } を返す

操作:
  - PreToolUse Hook を呼び出す

期待結果:
  - waitForResponse が2回呼ばれること
  - 最終的に Hook の戻り値が { proceed: true } となること
```

#### TC-A-005: timeout 発生時に executeAbortFlow が "timeout" 引数で呼ばれる

```
概要: sendPermissionRequestWithTimeout でタイムアウトが発生したとき、
      executeAbortFlow が "timeout" 引数で呼ばれること

前提条件:
  - vitest のフェイクタイマーを使用（vi.useFakeTimers）
  - waitForResponse が永続的に pending な Promise を返す

操作:
  - PreToolUse Hook を呼び出す（await を開始）
  - vi.advanceTimersByTime(TIMEOUT_MS) でタイムアウトを発火させる（P13）

期待結果:
  - executeAbortFlow の spy が "timeout" 引数で1回呼ばれること
  - Hook が PermissionTimeoutError をスローまたは { proceed: false } を返すこと

注意:
  - runAllTimers / runAllTimersAsync は P13 で禁止。advanceTimersByTime を使用
```

#### TC-A-006: フォールバック処理が例外をスローした場合、abort に遷移する

```
概要: processPermissionFallback 内で予期しない例外が発生したとき、
      executeAbortFlow が "unknown" 引数で呼ばれること（fail-closed 原則）

前提条件:
  - processPermissionFallback のスパイが例外をスローする

操作:
  - PreToolUse Hook を呼び出す

期待結果:
  - executeAbortFlow の spy が "unknown" 引数で呼ばれること
  - Hook が abort 系の応答を返すこと
```

### Step 4: Red フェーズ確認

テスト実行して全テストが失敗することを確認する（実装前なので正常）:

```bash
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillExecutor.hook-fallback.test.ts
```

P40 対策: テスト実行は必ず `pnpm --filter @repo/desktop exec vitest run` 形式で行うこと。プロジェクトルートからの直接実行は `apps/desktop/vitest.config.ts` が読み込まれず失敗する。

### Step 5: 既存テストへの影響確認

新規テストファイル追加が既存テストに影響しないことを確認する:

```bash
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillExecutor.fallback.test.ts
```

## 統合テスト連携

Phase 4〜Phase 6 の連携フロー:

| Phase | 役割                       | 成果物                                | 連携先  |
| ----- | -------------------------- | ------------------------------------- | ------- |
| 4     | Red テスト作成（本 Phase） | `SkillExecutor.hook-fallback.test.ts` | Phase 5 |
| 5     | 実装（Green 転換）         | `SkillExecutor.ts` 修正               | Phase 6 |
| 6     | テスト拡充                 | 追加テストケース                      | Phase 7 |

## 多角的チェック観点

| 観点         | チェック内容                                                            | 優先度 |
| ------------ | ----------------------------------------------------------------------- | ------ |
| TDD 原則     | Phase 5 実装前に全テストが失敗（Red）することを確認                     | 必須   |
| P60 対策     | sendPermissionRequest の戻り値形式（wrapper vs フラット）を事前確認     | 必須   |
| P13 対策     | タイムアウトテストで advanceTimersByTime を使用（runAllTimers 禁止）    | 必須   |
| P39 対策     | happy-dom 環境なので userEvent 不使用、fireEvent/直接呼び出しで検証     | 必須   |
| P40 対策     | テスト実行コマンドが `pnpm --filter @repo/desktop exec vitest run` 形式 | 必須   |
| モック一貫性 | 既存 fallback.test.ts と同じモック構造を使用                            | 高     |
| テスト独立性 | beforeEach で vi.clearAllMocks()、テスト間の状態リーク防止              | 高     |
| fail-closed  | TC-A-006 で例外発生時の abort 遷移を明示的に検証                        | 高     |

## 成果物

| 成果物名                     | 種別         | 格納先                                                                                        |
| ---------------------------- | ------------ | --------------------------------------------------------------------------------------------- |
| hook-fallback テストファイル | コード       | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.hook-fallback.test.ts`          |
| Phase 4 実行レポート         | ドキュメント | `docs/30-workflows/UT-06-005-A-hook-fallback-integration/outputs/phase-4/execution-report.md` |

## 完了条件

- [ ] `SkillExecutor.hook-fallback.test.ts` が新規作成されていること
- [ ] TC-A-001〜TC-A-006 の 6 テストケースが全て記述されていること
- [ ] Phase 5 実装前にテストが全て失敗（Red）することを確認済みであること
- [ ] 既存の `SkillExecutor.fallback.test.ts` の全テストが引き続き PASS することを確認済みであること
- [ ] P13（タイマーテスト）/ P39（happy-dom）/ P40（実行コマンド）/ P60（戻り値形式）の各対策が反映されていること
- [ ] 本 Phase 内の全タスクを 100% 実行完了していること

## サブタスク管理

| サブタスク ID | 内容                           | ステータス |
| ------------- | ------------------------------ | ---------- |
| ST-4-1        | 既存モック構造確認             | completed  |
| ST-4-2        | テストファイル新規作成         | completed  |
| ST-4-3        | TC-A-001〜006 実装             | completed  |
| ST-4-4        | Red フェーズ確認（テスト実行） | completed  |
| ST-4-5        | 既存テストへの影響確認         | completed  |
| ST-4-6        | Phase 4 実行レポート作成       | completed  |

## タスク 100% 実行確認【必須】

Phase 4 完了検証コマンド:

```bash
# テストファイル存在確認
ls -la apps/desktop/src/main/services/skill/__tests__/SkillExecutor.hook-fallback.test.ts

# テストケース数確認（6件）
grep -c "it(" apps/desktop/src/main/services/skill/__tests__/SkillExecutor.hook-fallback.test.ts

# Red フェーズ確認（失敗件数が 6 であること）
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillExecutor.hook-fallback.test.ts 2>&1 | tail -20

# 既存テスト維持確認（全 PASS）
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillExecutor.fallback.test.ts 2>&1 | tail -10

# 成果物確認
node -e "
const fs = require('fs');
const checks = [
  'apps/desktop/src/main/services/skill/__tests__/SkillExecutor.hook-fallback.test.ts',
  'docs/30-workflows/UT-06-005-A-hook-fallback-integration/outputs/phase-4/execution-report.md',
];
checks.forEach(f => {
  const exists = fs.existsSync(f);
  console.log((exists ? '[OK]' : '[NG]') + ' ' + f);
});
"
```

## 次の Phase

Phase 5: 実装（`phase-5-implementation.md`）

- `handlePermissionCheck` private メソッド追加
- `sendPermissionRequestWithTimeout` private メソッド追加
- `PermissionTimeoutError` クラス追加
- PreToolUse Hook への Permission チェック呼び出し統合
- 全 6 テストケースが Green に転換することを確認
