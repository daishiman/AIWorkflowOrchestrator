# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目      | 内容      |
| --------- | --------- |
| Phase     | 5         |
| Phase名   | 実装      |
| カテゴリ  | TDD-Green |
| 前提Phase | Phase 4   |
| 後続Phase | Phase 6   |

## 目的

Phase 4 で作成したテストを PASS させるための実装を行う。`sdkMessageUtils.ts` を新規作成し、既存モジュールの前処理重複だけを shared helper に寄せる。

## 事前確認

### 既存テスト回帰確認（Phase 5 開始前 必須）

```bash
# 変更対象ファイルの既存テストが GREEN であることを確認
pnpm --filter @repo/desktop exec vitest run src/main/services/runtime/__tests__/sdkMessageNormalizer.test.ts
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillExecutor.sdk-types.test.ts
```

## 実行タスク

### タスク1: sdkMessageUtils.ts の作成

**目的**: 共通ユーティリティファイルを新規作成する

**手順**:

1. `apps/desktop/src/main/services/runtime/sdkMessageUtils.ts` を作成
2. `SdkMessageRecord` 型別名を定義
3. `asSdkMessageRecord()` を実装
4. `getSdkMessageType()` を実装
5. JSDoc コメントを記述

**実装ファイル**: `apps/desktop/src/main/services/runtime/sdkMessageUtils.ts`

### タスク2: SkillExecutor.ts の更新

**目的**: ローカル定義を削除し、共通ユーティリティを import する

**手順**:

1. `SkillExecutor.ts` からローカルの `SDKMessage` interface を削除
2. `SkillExecutor.ts` からローカルの `isValidSDKMessage()` を削除
3. `sdkMessageUtils.ts` から `asSdkMessageRecord`, `getSdkMessageType` を import
4. `convertToStreamMessage()` は lane 固有分岐を維持したまま shared helper を利用する

**影響範囲確認**:

```bash
grep -n "SDKMessage\|isValidSDKMessage\|asSdkMessageRecord\|getSdkMessageType" apps/desktop/src/main/services/skill/SkillExecutor.ts
```

### タスク3: sdkMessageNormalizer.ts の更新

**目的**: インライン型チェックを共通ユーティリティに置換する

**手順**:

1. `sdkMessageNormalizer.ts` のインライン null/object チェックを `asSdkMessageRecord()` 呼び出しに置換
2. `type` 判定は `getSdkMessageType()` に統一し、`normalizeSdkMessage()` 内で helper の戻り値を使う
3. `normalizeSdkMessage()` の lane 固有処理は変更しない

### タスク4: テスト実行と回帰確認

**目的**: 全テストが PASS することを確認する

**手順**:

```bash
# 新規テスト
pnpm --filter @repo/desktop exec vitest run src/main/services/runtime/__tests__/sdkMessageUtils.test.ts

# 回帰テスト
pnpm --filter @repo/desktop exec vitest run src/main/services/runtime/__tests__/sdkMessageNormalizer.test.ts
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillExecutor.sdk-types.test.ts

# 型チェック
pnpm typecheck

# lint
pnpm lint
```

## 参照資料

| 参照資料       | パス                                | 内容             |
| -------------- | ----------------------------------- | ---------------- |
| Phase 2 設計書 | `outputs/phase-2/design.md`         | API シグネチャ   |
| Phase 4 テスト | `outputs/phase-4/test-scenarios.md` | テストケース一覧 |

## 統合テスト連携

インターフェース不変のため新規追加なし。

## 成果物

| 成果物       | パス                                        |
| ------------ | ------------------------------------------- |
| 実装サマリー | `outputs/phase-5/implementation-summary.md` |

## 完了条件

- [ ] `sdkMessageUtils.ts` が作成され、全関数が実装されていること
- [ ] `SkillExecutor.ts` のローカル型ガードが削除され、shared helper に置換されていること
- [ ] `sdkMessageNormalizer.ts` のインライン前処理が shared helper に置換されていること
- [ ] lane 固有の出力変換ロジックに仕様変更がないこと
- [ ] Phase 4 で作成したテストが全て PASS（Green）であること
- [ ] 既存テスト（sdkMessageNormalizer.test.ts, SkillExecutor.sdk-types.test.ts）が全て PASS であること
- [ ] `pnpm typecheck` が PASS であること
- [ ] `pnpm lint` が PASS であること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] タスク1: sdkMessageUtils.ts の作成 → 完了
- [ ] タスク2: SkillExecutor.ts の更新 → 完了
- [ ] タスク3: sdkMessageNormalizer.ts の更新 → 完了
- [ ] タスク4: テスト実行と回帰確認 → 完了

## 次Phase

Phase 6（テスト拡充）へ進む。
