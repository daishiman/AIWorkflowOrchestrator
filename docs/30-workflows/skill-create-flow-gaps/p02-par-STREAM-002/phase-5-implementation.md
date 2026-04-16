# Phase 5: 実装

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 5                                      |
| タスクID   | TASK-SW-STREAM-002                     |
| 機能名     | skill-creator-handlers-progress-wiring |
| 前提Phase  | Phase 4                                |
| 後続Phase  | Phase 6                                |
| 作成日     | 2026-04-15                             |
| ステータス | pending                                |

## 目的

`skillCreatorHandlers.ts` の `SKILL_CREATOR_CREATE` ハンドラーで `createSkill()` 呼び出しに
`onProgress` コールバックを接続し、`sendSkillCreatorProgress` と配線する実装を行う（TDD Red → Green 移行）。
必要に応じて `SkillCreateWizard.tsx` の `GenerateStep` への props 接続も行う。

## 前提条件確認（実装開始前に必須）

```bash
# TASK-SW-STREAM-001 の完了確認（onProgress? 引数が存在するか）
grep -n "onProgress" apps/desktop/src/main/services/skill/SkillCreatorService.ts
# 期待: onProgress? パラメーターが createSkill シグネチャに存在すること
```

**TASK-SW-STREAM-001 が未完了の場合、Phase 5 の実装を開始してはならない。**

## 実行タスク

- 既存テスト回帰確認（実装前 baseline 確認）
- `SKILL_CREATOR_CREATE` ハンドラーへのコールバック接続実装
- `sendSkillCreatorProgress` との配線実装
- `SkillCreateWizard.tsx` の props 接続確認・修正（必要な場合）
- Green 確認: Phase 4 で作成したテストが全 PASS することを確認
- 型チェック・lint 確認

## 参照資料

| 資料名                  | パス                                                                        | 用途                 |
| ----------------------- | --------------------------------------------------------------------------- | -------------------- |
| Phase 4 テスト仕様書    | `phase-4-test-creation.md`                                                  | テストケース参照     |
| Phase 2 設計書          | `outputs/phase-2/design.md`                                                 | 実装設計参照         |
| skillCreatorHandlers.ts | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                         | 修正対象ファイル     |
| SkillCreateWizard.tsx   | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`          | props 確認・修正対象 |
| テストファイル          | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.progress.test.ts` | Green 確認対象       |

## 実行手順

### 0. 既存テスト回帰確認（baseline 確認）【必須】

```bash
# 変更前の既存テストを実行して baseline 確認
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/
# 期待: 全 PASS（変更前の状態）

# Phase 4 テストが FAIL していることを確認（Red 状態）
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillCreatorHandlers.progress.test.ts
# 期待: FAIL（コールバック未接続のため）
```

### 1. TASK-SW-STREAM-001 完了確認

```bash
# createSkill のシグネチャ確認
grep -n "createSkill\|onProgress" apps/desktop/src/main/services/skill/SkillCreatorService.ts
```

`onProgress?` がシグネチャに存在することを確認してから実装に進む。

### 2. `SKILL_CREATOR_CREATE` ハンドラーへのコールバック接続

`apps/desktop/src/main/ipc/skillCreatorHandlers.ts` の `createSkill` 呼び出し箇所を変更する:

```typescript
// 変更前（:276 付近）
const skillDir = await skillCreatorService.createSkill(validatedArgs);

// 変更後
const skillDir = await skillCreatorService.createSkill(
  validatedArgs,
  (progress) => {
    sendSkillCreatorProgress(mainWindow, progress);
  },
);
```

### 3. `SkillCreateWizard.tsx` の props 接続確認・修正

Phase 1 の確認結果に基づき、`useStreamingProgress()` の戻り値が `GenerateStep` に渡されているか確認する。

```bash
# useStreamingProgress の利用確認
grep -n "useStreamingProgress\|streaming\|GenerateStep" \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
```

**未接続の場合のみ**、以下を追加する:

```typescript
// useStreamingProgress のインポートを追加（未インポートの場合）
import { useStreamingProgress } from "../hooks/useStreamingProgress";

// SkillCreateWizard コンポーネント内に追加
const streaming = useStreamingProgress();

// GenerateStep への props 追加
<GenerateStep
  stage={streaming.stage}
  percent={streaming.percent}
  message={streaming.message}
/>
```

### 4. Green 確認コマンド

```bash
# Phase 4 テストが PASS することを確認（Green 状態）
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillCreatorHandlers.progress.test.ts
# 期待: PASS（全 TC-01〜TC-06）

# 既存テストが引き続き PASS することを確認
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/
# 期待: PASS（回帰なし）
```

### 5. 型チェック・lint 確認

```bash
# TypeScript 型チェック
pnpm --filter @repo/desktop typecheck
# 期待: 0 error

# ESLint
pnpm --filter @repo/desktop lint
# 期待: 0 error
```

## 統合テスト連携【必須】

コールバック接続の実装とテスト支援コード整備。

| 判定項目            | 基準                             | 結果    |
| ------------------- | -------------------------------- | ------- |
| STREAM-001 完了確認 | onProgress? 引数が存在すること   | pending |
| Green 確認          | Phase 4 テストが全 PASS すること | pending |
| 既存テスト回帰      | 既存テストへの影響がないこと     | pending |
| 型チェック          | `pnpm typecheck` が 0 error      | pending |

## 多角的チェック観点

| 観点                | チェック内容                                                                        |
| ------------------- | ----------------------------------------------------------------------------------- |
| 前提条件確認        | TASK-SW-STREAM-001 完了（onProgress? シグネチャ）を実装前に確認済みか               |
| コールバック型整合  | `sendSkillCreatorProgress` の引数型と `onProgress` の引数型が一致しているか         |
| mainWindow スコープ | コールバック内で `mainWindow` が正しく参照できるか                                  |
| GenerateStep 接続   | 必要な場合のみ `SkillCreateWizard.tsx` を変更しているか（不要な変更をしていないか） |

## 成果物

| 成果物                 | パス                                                               | 説明                                            |
| ---------------------- | ------------------------------------------------------------------ | ----------------------------------------------- |
| 実装ファイル           | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                | コールバック接続・sendSkillCreatorProgress 配線 |
| 実装ファイル（条件付） | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` | GenerateStep props 接続（必要な場合のみ）       |

## 完了条件

- [ ] TASK-SW-STREAM-001 完了確認済み（`onProgress?` シグネチャが存在する）
- [ ] 既存テスト回帰確認（baseline）が完了
- [ ] `skillCreatorHandlers.ts` のコールバック接続実装が完了
- [ ] `sendSkillCreatorProgress` との配線が実装済み
- [ ] `SkillCreateWizard.tsx` の props 接続確認（必要な場合は修正完了）
- [ ] Phase 4 テスト（TC-01〜TC-06）が全 PASS している（Green）
- [ ] 既存テストが回帰なしで PASS している
- [ ] `pnpm typecheck` が 0 error
- [ ] `pnpm lint` が 0 error
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 既存テスト回帰確認（baseline・Red 状態確認）
2. TASK-SW-STREAM-001 完了確認（onProgress? シグネチャ確認）
3. `skillCreatorHandlers.ts` コールバック接続実装
4. `SkillCreateWizard.tsx` props 接続確認・修正（必要な場合）
5. Green 確認（Phase 4 テスト PASS）
6. 既存テスト回帰確認（PASS）
7. 型チェック・lint 確認
8. 実装サマリーの出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 6: テスト拡充
