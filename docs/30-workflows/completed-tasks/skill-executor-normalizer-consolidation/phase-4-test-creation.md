# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目      | 内容       |
| --------- | ---------- |
| Phase     | 4          |
| Phase名   | テスト作成 |
| カテゴリ  | TDD-Red    |
| 前提Phase | Phase 3    |
| 後続Phase | Phase 5    |

## 目的

`sdkMessageUtils.ts` の共通ユーティリティに対するテストを先行作成する（TDD Red フェーズ）。既存テストの baseline を確認し、回帰検出体制を整える。

## 事前確認（Phase 4 必須）

### 既存ユーティリティ重複検出

```bash
# sdkMessageUtils に類似する既存実装がないか確認
grep -rn "export.*function.*isValidSDK\|export.*function.*extractMessage" apps/ packages/
grep -rn "export.*SDKMessage" apps/ packages/
```

### 既存テスト baseline 確認

```bash
# 影響を受ける既存テストを先行実行
pnpm --filter @repo/desktop exec vitest run src/main/services/runtime/__tests__/sdkMessageNormalizer.test.ts
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillExecutor.sdk-types.test.ts
```

## 実行タスク

### タスク1: sdkMessageUtils.test.ts テストスイート作成

**目的**: 共通ユーティリティの期待動作をテストで定義する

**手順**:

1. テストファイル `apps/desktop/src/main/services/runtime/__tests__/sdkMessageUtils.test.ts` を作成
2. 以下のテストケースを記述する

**テストケース一覧**:

| テストスイート     | テストケース                              | 期待結果      |
| ------------------ | ----------------------------------------- | ------------- |
| asSdkMessageRecord | null を渡す                               | null          |
| asSdkMessageRecord | undefined を渡す                          | null          |
| asSdkMessageRecord | 文字列を渡す                              | null          |
| asSdkMessageRecord | 数値を渡す                                | null          |
| asSdkMessageRecord | 配列を渡す                                | null          |
| asSdkMessageRecord | 空オブジェクトを渡す                      | record を返す |
| asSdkMessageRecord | type フィールドを持つ plain object を渡す | record を返す |
| getSdkMessageType  | type: "text" のメッセージ                 | "text"        |
| getSdkMessageType  | type: "error" のメッセージ                | "error"       |
| getSdkMessageType  | type フィールドなしのメッセージ           | undefined     |
| getSdkMessageType  | type: 123 のメッセージ                    | undefined     |
| getSdkMessageType  | type: "" (空文字) のメッセージ            | ""            |

### タスク2: 既存テストの回帰 baseline 記録

**目的**: リファクタリング前の既存テスト結果を記録する

**手順**:

1. `sdkMessageNormalizer.test.ts` の全テスト結果を記録
2. `SkillExecutor.sdk-types.test.ts` の全テスト結果を記録
3. 結果を `outputs/phase-4/test-scenarios.md` に記載

## 参照資料

| 参照資料       | パス                               | 内容               |
| -------------- | ---------------------------------- | ------------------ |
| Phase 2 設計書 | `outputs/phase-2/design.md`        | API シグネチャ設計 |
| Phase 3 判定書 | `outputs/phase-3/gate-decision.md` | MINOR 追跡事項     |

## 統合テスト連携

インターフェース不変のリファクタリングのため、統合テストの新規追加は不要。既存テストの baseline 確認で網羅。

## 成果物

| 成果物         | パス                                |
| -------------- | ----------------------------------- |
| テストシナリオ | `outputs/phase-4/test-scenarios.md` |

## 完了条件

- [ ] `sdkMessageUtils.test.ts` が作成され、テストケースが全て記述されていること
- [ ] テストが Red 状態（実装未完了のため FAIL）であることを確認
- [ ] 既存テストの baseline が記録されていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] タスク1: sdkMessageUtils.test.ts テストスイート作成 → 完了
- [ ] タスク2: 既存テストの回帰 baseline 記録 → 完了

## 次Phase

Phase 5（実装）へ進む。
