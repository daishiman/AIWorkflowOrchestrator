# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目      | 内容       |
| --------- | ---------- |
| Phase     | 6          |
| Phase名   | テスト拡充 |
| カテゴリ  | 品質       |
| 前提Phase | Phase 5    |
| 後続Phase | Phase 7    |

## 目的

Phase 5 の実装に対して、エッジケース・fail path・回帰ガードのテストを追加し、品質を強化する。

## 実行タスク

### タスク1: sdkMessageUtils エッジケーステスト追加

**目的**: 境界条件と異常入力のテストを追加する

**追加テストケース**:

| テストケース           | 入力                                 | 期待結果                             |
| ---------------------- | ------------------------------------ | ------------------------------------ |
| 配列を渡す             | `[1, 2, 3]`                          | `asSdkMessageRecord` → null          |
| Symbol を渡す          | `Symbol("test")`                     | `asSdkMessageRecord` → null          |
| BigInt を渡す          | `BigInt(1)`                          | `asSdkMessageRecord` → null          |
| type が数値            | `{ type: 123 }`                      | `getSdkMessageType` → undefined      |
| type が null           | `{ type: null }`                     | `getSdkMessageType` → undefined      |
| ネストされた content   | `{ content: { nested: true } }`      | `asSdkMessageRecord` → record を返す |
| assistant content 配列 | `{ type: "assistant", content: [] }` | `getSdkMessageType` → `"assistant"`  |

### タスク2: SkillExecutor 回帰テスト確認

**目的**: convertToStreamMessage のリファクタリング後の動作が完全に同一であることを確認する

**手順**:

1. `SkillExecutor.sdk-types.test.ts` の全テストを実行
2. テスト結果を Phase 4 baseline と比較
3. 差分がないことを記録

### タスク3: sdkMessageNormalizer 回帰テスト確認

**目的**: normalizeSdkMessage のリファクタリング後の動作が完全に同一であることを確認する

**手順**:

1. `sdkMessageNormalizer.test.ts` の全テストを実行
2. テスト結果を Phase 4 baseline と比較
3. 差分がないことを記録

## 参照資料

| 参照資料       | パス                                        | 内容          |
| -------------- | ------------------------------------------- | ------------- |
| Phase 4 テスト | `outputs/phase-4/test-scenarios.md`         | baseline 記録 |
| Phase 5 実装   | `outputs/phase-5/implementation-summary.md` | 実装内容      |

## 統合テスト連携

回帰テストの追加でカバー。

## 成果物

| 成果物             | パス                                       |
| ------------------ | ------------------------------------------ |
| テスト拡充レポート | `outputs/phase-6/test-expansion-report.md` |

## 完了条件

- [ ] エッジケーステストが追加され全件 PASS であること
- [ ] SkillExecutor 回帰テストが baseline と同一結果であること
- [ ] sdkMessageNormalizer 回帰テストが baseline と同一結果であること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] タスク1: sdkMessageUtils エッジケーステスト追加 → 完了
- [ ] タスク2: SkillExecutor 回帰テスト確認 → 完了
- [ ] タスク3: sdkMessageNormalizer 回帰テスト確認 → 完了

## 次Phase

Phase 7（テストカバレッジ確認）へ進む。
