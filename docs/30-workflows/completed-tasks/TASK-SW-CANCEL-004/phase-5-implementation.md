# Phase 5: 実装

## メタ情報

| 項目     | 値                                                            |
| -------- | ------------------------------------------------------------- |
| Phase    | 5                                                             |
| タスクID | TASK-SW-CANCEL-004                                            |
| 前Phase  | [phase-4-test-creation.md](phase-4-test-creation.md)          |
| 次Phase  | [phase-6-test-expansion.md](phase-6-test-expansion.md)        |
| 目的     | Phase 1 の確認結果で判明した不足項目の修正と E2E テストの完成 |

## 目的

Phase 1 の確認結果で判明した不足項目の修正と E2E テストの完成。

## 実行タスク

### タスク1: 既存実装の確認実行

**目的**: Renderer / Preload / UI / AbortSignal consumer の現状を確認する。

**実行手順**:

1. Step 1〜5 のコード確認を順に実施する。
2. pass/fail を outputs に記録する。
3. 修正不要か最小修正が必要かを判定する。

**期待される成果物**:

- 確認チェックリスト
- pass/fail 判定

### タスク2: 必要時のみ最小修正とテスト完成

**目的**: verify_existing 原則を守りつつ不足箇所だけを補う。

**実行手順**:

1. パターン A/B/C のいずれかを必要時のみ適用する。
2. E2E テストを完成させる。
3. targeted test と全体テストで Green を確認する。

**期待される成果物**:

- 実装サマリー
- Green テスト結果

## 実装方針

本タスクは verify_existing モード。Phase 4 のテストが Red の場合のみ実装修正を行う。

### 実装分岐

| ケース              | 対応                                                                     |
| ------------------- | ------------------------------------------------------------------------ |
| 全確認項目が PASS   | 実装修正なし。E2E テスト追加のみ行い確認記録を outputs に保存する        |
| 一部確認項目が FAIL | 下記修正パターンに従い最小限の修正を実施し Phase 4 テストを Green にする |

## 確認実行手順

### Step 1: Renderer 側確認

`apps/desktop/src/renderer/hooks/useCancelGeneration.ts` を読み、以下を確認：

- L37 付近に `await skillCreatorAPI?.cancelGeneration?.()` が存在するか

### Step 2: Preload 側確認

`apps/desktop/src/preload/channels.ts` を確認：

- `ALLOWED_INVOKE_CHANNELS` 配列に `IPC_CHANNELS.SKILL_CREATOR_CANCEL`（または文字列 `"skill-creator:cancel"`）が含まれているか

### Step 3: contextBridge 確認

`apps/desktop/src/preload/index.ts` L646 付近を確認：

- `contextBridge.exposeInMainWorld("skillCreatorAPI", skillCreatorAPI)` があるか

### Step 4: UI バインディング確認

`apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` L553-557 付近を確認：

- キャンセルボタンの `onClick` が `handleCancelGeneration` を呼んでいるか

### Step 5: AbortSignal consumer 確認

`startGeneration()` の返り値 `AbortSignal` が `SkillCreateWizard.tsx` または関連コンポーネントで consumer されているかを調査する。

## 修正パターン（Phase 1 確認結果次第）

### パターン A: `ALLOWED_INVOKE_CHANNELS` 不足

**修正対象**: `apps/desktop/src/preload/channels.ts`

```typescript
// ALLOWED_INVOKE_CHANNELS 配列に追加
IPC_CHANNELS.SKILL_CREATOR_CANCEL,
```

### パターン B: AbortSignal の consumer が不存在

**修正対象**: 該当コンポーネント（調査で特定）

`startGeneration()` の返り値 signal を `createSkill()` 呼び出し側に渡す処理を追加する。

### パターン C: キャンセルボタンのバインディング不足

**修正対象**: `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`

該当 onClick に `handleCancelGeneration` を追加する。

## E2E テスト完成

Phase 4 で設計した `useCancelGeneration.e2e.test.ts` を実装し、TC-E2E-01〜04 を Green にする。

```bash
# E2E テスト実行確認
pnpm --filter @repo/desktop test -- useCancelGeneration.e2e

# 全テスト確認
pnpm --filter @repo/desktop test
```

## 参照資料

- `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`
- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
- `apps/desktop/src/preload/channels.ts`
- `apps/desktop/src/preload/index.ts`
- `docs/30-workflows/TASK-SW-CANCEL-004/phase-4-test-creation.md`

## 成果物

| 成果物             | パス                                        |
| ------------------ | ------------------------------------------- |
| 実装サマリー       | `outputs/phase-5/implementation-summary.md` |
| 確認チェックリスト | `outputs/phase-5/confirmation-checklist.md` |

### outputs/phase-5/implementation-summary.md の必須記載

- Step 1〜5 の確認結果（pass/fail 各項目）
- 修正を行った場合はパターン A/B/C の実施内容
- 修正を行わなかった場合は「修正なし・確認のみ」と記録
- E2E テスト TC-E2E-01〜04 の結果

## 統合テスト連携

- Phase 4 で Red にした E2E テストをここで Green にする。
- Phase 6 のエッジケース拡充は、ここで入れた修正の回帰確認として扱う。

## 完了条件

- [ ] Step 1〜5 の確認結果が全項目記録されている
- [ ] Phase 4 で作成したテストがすべて Green
- [ ] 既存テスト（`pnpm --filter @repo/desktop test`）がすべて pass している
- [ ] `implementation-summary.md` に修正内容（または「修正なし」）が記録されている
- [ ] `confirmation-checklist.md` に AC-1〜AC-8 の pass/fail が記録されている
