# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目      | 内容             |
| --------- | ---------------- |
| Phase     | 8                |
| Phase名   | リファクタリング |
| カテゴリ  | TDD-Refactor     |
| 前提Phase | Phase 7          |
| 後続Phase | Phase 9          |

## 目的

Phase 5 の実装で生じた重複・命名の不整合・不要コードを整理する。リファクタリング後もテストが全て PASS することを確認する。

## 実行タスク

- タスク1: 不要コードの除去確認
- タスク2: 命名の統一性チェック
- タスク3: テスト再実行

- タスク1で不要コードと未使用 import の残存を確認する
- タスク2で naming/JSDoc の一貫性を確認する
- タスク3で関連テストと静的検証を再実行する

### タスク1: 不要コードの除去確認

**目的**: リファクタリングで残った不要コードがないか確認する

**手順**:

```bash
# SkillExecutor.ts にローカルの SDKMessage/isValidSDKMessage が残っていないか確認
grep -n "interface SDKMessage\|function isValidSDKMessage" apps/desktop/src/main/services/skill/SkillExecutor.ts

# sdkMessageNormalizer.ts にインライン前処理が残っていないか確認
grep -n "typeof rawMessage\|rawMessage == null" apps/desktop/src/main/services/runtime/sdkMessageNormalizer.ts

# 未使用 import がないか確認
pnpm lint
```

### タスク2: 命名の統一性チェック

**目的**: 共通化後の命名が一貫しているかを確認する

**チェック項目**:

| 項目       | 確認内容                                                        |
| ---------- | --------------------------------------------------------------- |
| ファイル名 | `sdkMessageUtils.ts` が naming convention に従っているか        |
| 関数名     | `asSdkMessageRecord`, `getSdkMessageType` が camelCase であるか |
| 型名       | `SdkMessageRecord` が shared helper の責務を過不足なく表すか    |
| JSDoc      | 全 export に JSDoc が記述されているか                           |

### タスク3: テスト再実行

**目的**: リファクタリング後の回帰確認

**手順**:

```bash
pnpm --filter @repo/desktop exec vitest run src/main/services/runtime/__tests__/sdkMessageUtils.test.ts
pnpm --filter @repo/desktop exec vitest run src/main/services/runtime/__tests__/sdkMessageNormalizer.test.ts
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillExecutor.sdk-types.test.ts
pnpm typecheck
pnpm lint
```

## 参照資料

| 参照資料           | パス                                        | 内容           |
| ------------------ | ------------------------------------------- | -------------- |
| Phase 5 実装       | `outputs/phase-5/implementation-summary.md` | 実装内容       |
| Phase 7 カバレッジ | `outputs/phase-7/coverage-report.md`        | カバレッジ結果 |

## 統合テスト連携

回帰テスト再実行で確認。

## 成果物

| 成果物                   | パス                                    |
| ------------------------ | --------------------------------------- |
| リファクタリングレポート | `outputs/phase-8/refactoring-report.md` |

## 完了条件

- [ ] 不要コード（ローカル型ガード残骸等）が除去されていること
- [ ] 命名が一貫していること
- [ ] 全テストが PASS であること
- [ ] `pnpm typecheck && pnpm lint` が PASS であること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] タスク1: 不要コードの除去確認 → 完了
- [ ] タスク2: 命名の統一性チェック → 完了
- [ ] タスク3: テスト再実行 → 完了

## 次Phase

Phase 9（品質保証）へ進む。
