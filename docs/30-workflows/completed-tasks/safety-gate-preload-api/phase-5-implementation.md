# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目     | 値                         |
| -------- | -------------------------- |
| Phase    | 5                          |
| 機能名   | safety-gate-preload-api    |
| タスクID | UT-06-003-PRELOAD-API-IMPL |
| 作成日   | 2026-03-23                 |
| 前提     | Phase 4 テスト作成         |

## 目的

`apps/desktop/src/preload/skill-api.ts` に `evaluateSafety` メソッドを追加し、Phase 4 のテスト（T-1〜T-6）を全て PASS させる。

## 実行タスク

- 既存テスト回帰確認: 変更対象ファイルの既存テストが GREEN であることを確認
- import 追加: `SafetyGateResult` 型を `@repo/shared` から import
- インターフェース追加: `SkillAPI` interface に `evaluateSafety` メソッドを追加
- 実装追加: `skillAPI` object に `evaluateSafety` 実装を追加
- Green 確認: Phase 4 のテストが全て PASS することを確認
- P27 バリデーション: ハードコード文字列が存在しないことを確認

## 参照資料

| 資料名         | パス                                       | 説明                       |
| -------------- | ------------------------------------------ | -------------------------- |
| Phase 2 設計書 | `phase-2-design.md`                        | インターフェース・実装設計 |
| Phase 4 テスト | `phase-4-test-creation.md`                 | テストケース               |
| skill-api.ts   | `preload/skill-api.ts`                     | 変更対象ファイル           |
| 共有型定義     | `packages/shared/src/types/safety-gate.ts` | SafetyGateResult 型        |

## 実行手順

### ステップ 0: 既存テスト回帰確認（必須）

```bash
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api.contract.test.ts
```

- [x]変更対象ファイルの既存テストが全て GREEN であることを確認した（baseline 確認）

### ステップ 1: import 追加

`skill-api.ts` の import セクションに `SafetyGateResult` を追加:

```typescript
import type { SafetyGateResult } from "@repo/shared";
```

**P23 チェック**: `@repo/shared` から import すること。`preload/types.ts` に独自型を定義しない。

### ステップ 2: SkillAPI インターフェースに追加

```typescript
// === SafetyGate API (UT-06-003-PRELOAD-API-IMPL) ===
evaluateSafety: (skillName: string) =>
  Promise<{
    success: boolean;
    data?: SafetyGateResult;
    error?: { code: string; message: string };
  }>;
```

### ステップ 3: skillAPI オブジェクトに実装追加

```typescript
// === SafetyGate API (UT-06-003-PRELOAD-API-IMPL) ===
evaluateSafety: (skillName: string) =>
  safeInvoke(IPC_CHANNELS.SKILL_EVALUATE_SAFETY, skillName),
```

### ステップ 4: テスト実行（Green 確認）

```bash
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api.evaluateSafety.test.ts
```

全テスト（T-1〜T-6）PASS を確認。

### ステップ 5: 既存テスト回帰確認

```bash
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api.contract.test.ts
```

- [x]新規実装後に既存テストが回帰していないことを確認した

### ステップ 6: P27 バリデーション

```bash
grep -rn "safeInvoke" apps/desktop/src/preload/skill-api.ts | grep "evaluate" | grep -v "IPC_CHANNELS"
```

出力が空（ハードコード文字列なし）であることを確認。

### ステップ 7: IPC ハンドラ register/unregister ペア確認（P5対策）

本タスクでは IPC ハンドラの新規作成は行わない（Preload API メソッドの追加のみ）。register/unregister ペアの確認は不要。

## 統合テスト連携

| 確認項目           | 内容                                   | 結果                    |
| ------------------ | -------------------------------------- | ----------------------- |
| テスト全 PASS      | T-1〜T-6 が全て PASS                   | PASS（T-1〜T-6 全PASS） |
| 既存テスト回帰なし | skill-api.contract.test.ts が継続 PASS | PASS                    |
| 型チェック         | `pnpm typecheck` が PASS               | PASS（エラー0件）       |
| P27 バリデーション | ハードコード文字列なし                 | PASS（出力なし）        |

## 多角的チェック観点（AIが判断）

| 観点         | 適用 | 確認内容                                        |
| ------------ | ---- | ----------------------------------------------- |
| セキュリティ | 該当 | P27 バリデーション実施                          |
| API設計      | 該当 | SkillAPI インターフェースへの追加が設計通り     |
| 型安全       | 該当 | SafetyGateResult の import が @repo/shared から |
| IPC通信      | 該当 | safeInvoke + IPC_CHANNELS 定数使用              |

## サブタスク管理

1. 既存テスト回帰確認（baseline）
2. import 追加
3. インターフェース追加
4. 実装追加
5. テスト実行（Green 確認）
6. 既存テスト回帰確認（実装後）
7. P27 バリデーション
8. 完了条件の検証

## 成果物

| 成果物     | パス                                    | 説明                 |
| ---------- | --------------------------------------- | -------------------- |
| 実装コード | `apps/desktop/src/preload/skill-api.ts` | interface + 実装追加 |
| 実装記録   | `phase-5-implementation.md`             | 本ドキュメント       |

## 完了条件

- [x]`SafetyGateResult` が `@repo/shared` から import されている（P23 準拠）
- [x]`SkillAPI` インターフェースに `evaluateSafety` メソッドが追加されている
- [x]`skillAPI` オブジェクトに `evaluateSafety` 実装が追加されている
- [x]`IPC_CHANNELS.SKILL_EVALUATE_SAFETY` 定数が使用されている（P27 準拠）
- [x]Phase 4 のテスト（T-1〜T-6）が全て PASS している
- [x]既存テスト（skill-api.contract.test.ts）が回帰していない
- [x]`pnpm typecheck` が PASS している
- [x]P27 バリデーション（grep でハードコード文字列なし）が PASS
- [x]**本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [x]本Phase内の全タスクを100%実行完了
- [x]各タスクの成果物が生成されている
- [x]Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 6-7: テスト拡充 + カバレッジ確認
