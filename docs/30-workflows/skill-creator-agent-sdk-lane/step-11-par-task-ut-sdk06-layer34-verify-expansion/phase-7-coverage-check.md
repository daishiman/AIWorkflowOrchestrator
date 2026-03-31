# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                                |
| ------ | --------------------------------- |
| Phase  | 7                                 |
| 機能名 | ut-sdk06-layer34-verify-expansion |
| 作成日 | 2026-03-31                        |

## 目的

Layer3/4 全チェック ID（L3-001〜L3-004、L4-001〜L4-003）に対して pass/fail の両シナリオがテストで網羅されているかを確認する。

## 実行タスク

- Layer3 チェック ID 別の coverage 集計を行う
- Layer4 チェック ID 別の coverage 集計を行う
- 結合テストの coverage 集計を行う
- 未カバーのシナリオを記録して Phase 6 または Phase 9 へ差し戻す

## 参照資料

| 資料名             | パス                        | 説明                     |
| ------------------ | --------------------------- | ------------------------ |
| Phase 4 テスト定義 | `phase-4-test-creation.md`  | 定義済みテストケース一覧 |
| Phase 5 実装       | `phase-5-implementation.md` | 実装済みテスト           |
| Phase 6 テスト拡充 | `phase-6-test-expansion.md` | edge case テスト         |

## coverage 確認マトリクス

### Layer3 チェック coverage

| チェックID | pass シナリオ | fail シナリオ    | edge case              | coverage |
| ---------- | ------------- | ---------------- | ---------------------- | -------- |
| L3-001     | T-L3-01       | T-L3-02          | T-L3-EC-01             | 未確認   |
| L3-002     | T-L3-03       | T-L3-04, T-L3-05 | T-L3-EC-02             | 未確認   |
| L3-003     | T-L3-06       | T-L3-07          | T-L3-EC-03, T-L3-EC-04 | 未確認   |
| L3-004     | T-L3-08       | T-L3-09          | T-L3-EC-05             | 未確認   |

### Layer4 チェック coverage

| チェックID | pass シナリオ | fail シナリオ    | edge case              | coverage |
| ---------- | ------------- | ---------------- | ---------------------- | -------- |
| L4-001     | T-L4-01       | T-L4-02, T-L4-03 | T-L4-EC-01, T-L4-EC-05 | 未確認   |
| L4-002     | T-L4-04       | T-L4-05          | T-L4-EC-02, T-L4-EC-03 | 未確認   |
| L4-003     | T-L4-07       | T-L4-08          | T-L4-EC-04             | 未確認   |

### 結合テスト coverage

| シナリオ            | テストケース         | coverage |
| ------------------- | -------------------- | -------- |
| verifyのみ          | T-LOOP-03            | 未確認   |
| improve→reverify    | T-LOOP-01, T-LOOP-02 | 未確認   |
| WorkflowEngine 結合 | T-LOOP-04            | 未確認   |
| 冪等性              | T-LOOP-EC-02         | 未確認   |

## 実行手順

### ステップ1: `pnpm vitest run --coverage` を実行する

```bash
pnpm --filter @repo/desktop vitest run --coverage
```

- `SkillCreatorVerificationEngine.ts` のブランチカバレッジを確認する
- `validateLayer3` と `validateLayer4` の各分岐が網羅されているか確認する

### ステップ2: チェック ID 別の coverage を集計する

上記マトリクスの `coverage` 列を実際のテスト実行結果で更新する。

### ステップ3: 未カバーシナリオを記録する

- `pass` または `fail` のどちらかしかない場合は MINOR 指摘として記録する
- どちらもない場合は MAJOR 指摘として Phase 6 へ差し戻す

## coverage 目標

| 種別                 | 目標                                                               |
| -------------------- | ------------------------------------------------------------------ |
| チェック ID coverage | 全 7 ID（L3-001〜L3-004、L4-001〜L4-003）のすべてで pass/fail 両方 |
| line coverage        | `validateLayer3` + `validateLayer4` で 85% 以上                    |
| branch coverage      | `validateLayer3` + `validateLayer4` で 80% 以上                    |

## 統合テスト連携

- coverage 不足があれば Phase 6 へ差し戻して追加テストを実装する
- Phase 9 で型安全性の最終確認に coverage 結果を使用する

## 成果物

| 成果物           | パス                        | 説明                             |
| ---------------- | --------------------------- | -------------------------------- |
| カバレッジ確認書 | `phase-7-coverage-check.md` | チェック ID 別 coverage 集計結果 |

## 完了条件

- [ ] Layer3 全チェック ID（L3-001〜L3-004）の coverage が確認されている
- [ ] Layer4 全チェック ID（L4-001〜L4-003）の coverage が確認されている
- [ ] 未カバーシナリオがあれば記録されている
- [ ] coverage 目標を達成している、または差し戻し判定が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**
