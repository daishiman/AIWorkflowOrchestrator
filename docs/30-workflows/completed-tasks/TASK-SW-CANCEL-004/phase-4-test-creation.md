# Phase 4: テスト作成

## メタ情報

| 項目     | 値                                                     |
| -------- | ------------------------------------------------------ |
| Phase    | 4                                                      |
| タスクID | TASK-SW-CANCEL-004                                     |
| 前Phase  | [phase-3-design-review.md](phase-3-design-review.md)   |
| 次Phase  | [phase-5-implementation.md](phase-5-implementation.md) |
| 目的     | E2E 統合テストと確認チェックリストを作成する           |

## 目的

E2E 統合テストと確認チェックリストを作成する。

## 実行タスク

### タスク1: 既存確認と追加テストの分離

**目的**: 既存テストで足りる確認と、新規追加すべき統合テストを分ける。

**実行手順**:

1. TC-UT-01〜04 の既存確認方針を整理する。
2. TC-CH-01 と TC-UI-01 のコード確認方法を固定する。
3. E2E 統合テストが担う責務を明確化する。

**期待される成果物**:

- テストマトリクス
- 既存/追加の責務分離

### タスク2: 実行コマンドと Red 条件の定義

**目的**: Phase 5 に渡す Red/Green 条件と依存関係確認コマンドを固定する。

**実行手順**:

1. E2E テストファイルの配置を確定する。
2. 依存関係整合チェックコマンドを定義する。
3. Red 状態で Phase 5 に進む条件を明記する。

**期待される成果物**:

- コマンド期待値
- Red/Green 進行条件

## テストマトリクス

| TC        | 対象                     | 観点                                                                                                         | 既存/追加    | 根拠                      |
| --------- | ------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------ | ------------------------- |
| TC-UT-01  | `useCancelGeneration.ts` | `cancelGeneration()` 呼び出し時に `skillCreatorAPI.cancelGeneration` が invoke される                        | 既存（確認） | 既存 test.ts の mock 確認 |
| TC-UT-02  | `useCancelGeneration.ts` | `startGeneration()` 後に `cancelGeneration()` を呼ぶと signal.aborted が true                                | 既存（確認） | AbortController 動作確認  |
| TC-UT-03  | `useCancelGeneration.ts` | `cancelGeneration()` 後に Store の `streamingStage` が `cancelled`                                           | 既存（確認） | Store 状態確認            |
| TC-UT-04  | `useCancelGeneration.ts` | `skillCreatorAPI` が null でも `cancelGeneration()` がクラッシュしない                                       | 既存（確認） | optional chaining 確認    |
| TC-CH-01  | `preload/channels.ts`    | `ALLOWED_INVOKE_CHANNELS` に `SKILL_CREATOR_CANCEL` が含まれている                                           | 追加確認     | channels.ts コード確認    |
| TC-UI-01  | `SkillCreateWizard.tsx`  | キャンセルボタンの `onClick` が `handleCancelGeneration` を呼んでいる                                        | 追加確認     | コードリーディング        |
| TC-E2E-01 | E2E 統合                 | `cancelGeneration()` 呼び出し時に `window.skillCreatorAPI.cancelGeneration` が channel 文字列レベルで invoke | 追加         | IPC mock による E2E 確認  |
| TC-E2E-02 | E2E 統合                 | `startGeneration()` → `cancelGeneration()` フローで AbortSignal が abort 状態                                | 追加         | フロー統合確認            |
| TC-E2E-03 | E2E 統合                 | `cancelGeneration()` 後の Store 状態が `cancelled`                                                           | 追加         | Store 統合確認            |
| TC-E2E-04 | E2E 統合                 | `skillCreatorAPI` が undefined でも `cancelGeneration()` が例外なく完了                                      | 追加         | 防御的チェック            |

## E2E テストファイル

**パス**: `apps/desktop/src/renderer/hooks/__tests__/useCancelGeneration.e2e.test.ts`

**基本構造**:

```typescript
// E2E 統合テスト（IPC モックを使った全層境界検証）
describe("useCancelGeneration E2E", () => {
  // window.skillCreatorAPI モックを設定
  // TC-E2E-01〜04 のテストケースを実装
});
```

## 依存関係整合チェック【必須】

```bash
pnpm install --frozen-lockfile
pnpm --filter @repo/shared build
pnpm --filter @repo/desktop test -- useCancelGeneration
```

## コマンド期待値

- `useCancelGeneration` の既存テストが全 pass
- E2E テストが Red 状態（Phase 5 で Green にする）
- `shared build` に失敗しない

## 参照資料

- `apps/desktop/src/renderer/hooks/__tests__/useCancelGeneration.test.ts`
- `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`
- `docs/30-workflows/TASK-SW-CANCEL-004/phase-2-design.md`
- `docs/30-workflows/TASK-SW-CANCEL-004/phase-3-design-review.md`

## 成果物

| 成果物         | パス                                      |
| -------------- | ----------------------------------------- |
| テストシナリオ | `outputs/phase-4/test-scenarios.md`       |
| コマンド期待値 | `outputs/phase-4/command-expectations.md` |

## 統合テスト連携

- `useCancelGeneration.e2e.test.ts` を Phase 5 の最終 Green 化対象にする。
- `shared build` と desktop test を合わせて、層間境界の回帰を検出できるようにする。

## 完了条件

- [ ] TC-UT-01〜04 の既存テスト確認方針が定義されている
- [ ] TC-CH-01 と TC-UI-01 の確認方法が定義されている
- [ ] TC-E2E-01〜04 の E2E テストが設計されている
- [ ] E2E テストファイルのパスが確定している
- [ ] 依存関係整合チェックコマンドが定義されている
- [ ] テストが Red 状態で Phase 5 に進む（または全 pass で修正不要が確認された）
