# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 7                     |
| Phase名    | カバレッジ確認        |
| 前提Phase  | Phase 6               |
| 後続Phase  | Phase 8               |
| ステータス | 未実施                |
| 作成日     | 2026-01-22            |
| 機能名     | shared-type-export-01 |

---

## 目的

テストカバレッジが目標を達成しているか確認し、未達の場合は Phase 6 に戻る。

## 背景

品質基準を満たすため、カバレッジ目標の達成を確認する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: カバレッジ測定

**目的**: 現在のテストカバレッジを測定

**実行手順**:

1. 以下のコマンドを実行:

```bash
pnpm --filter @repo/shared test -- --run --coverage services/graph/
```

2. カバレッジレポートを確認

**期待される成果物**:

- カバレッジレポート

---

### タスク2: カバレッジ目標との比較

**目的**: 目標達成状況を確認

**実行手順**:

1. カバレッジ結果を目標と比較:

| 指標              | 目標 | 結果 | 判定 |
| ----------------- | ---- | ---- | ---- |
| Line Coverage     | 80%  | ?%   | ?    |
| Branch Coverage   | 60%  | ?%   | ?    |
| Function Coverage | 80%  | ?%   | ?    |

2. 目標未達の場合は Phase 6 に戻る
3. 目標達成の場合は Phase 8 に進む

**期待される成果物**:

- カバレッジ比較結果

---

### タスク3: 全型エクスポート検証

**目的**: 全ての型がエクスポートされていることを確認

**実行手順**:

1. `packages/shared/src/services/graph/index.ts` を確認
2. 以下の型が全てエクスポートされていることを確認:
   - [ ] `Community`
   - [ ] `CommunitySummary`
   - [ ] `StoredEntity`
   - [ ] `CommunityStructure`
   - [ ] `CommunityDetectionOptions`
   - [ ] `CommunityDetectionResult`
   - [ ] `CommunityDetectionStats`
   - [ ] `CommunitySummarizationOptions`
   - [ ] `CommunitySummarizationResult`

**期待される成果物**:

- エクスポート検証結果

---

## 参照資料

| 参照資料     | パス       | 内容           |
| ------------ | ---------- | -------------- |
| メイン仕様書 | `index.md` | カバレッジ目標 |

---

## 成果物

| 成果物             | パス                                 | 内容           |
| ------------------ | ------------------------------------ | -------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | カバレッジ結果 |

---

## 統合テスト連携

**Phase 7 アクション**: 全型のエクスポート検証

- 全エクスポート対象型の存在確認
- カバレッジ目標達成確認

---

## 完了条件

- [ ] カバレッジ測定完了
- [ ] カバレッジ目標達成（Line 80%, Branch 60%, Function 80%）
- [ ] 全型のエクスポート確認完了
- [ ] `outputs/phase-7/coverage-report.md` を作成

---

## カバレッジゲート

### カバレッジ判定

| 判定 | 条件       | 次のアクション |
| ---- | ---------- | -------------- |
| PASS | 全目標達成 | Phase 8 へ進行 |
| FAIL | 目標未達   | Phase 6 に戻る |

### 戻り条件

- Line Coverage < 80%
- Branch Coverage < 60%
- Function Coverage < 80%

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 6 が完了していること
- **後続**: Phase 8 へ進む（カバレッジ目標達成時）

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/shared-type-export-01/phase-8-refactoring.md`
