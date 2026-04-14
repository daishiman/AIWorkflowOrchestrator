# Phase 4: テスト作成（TDD Red フェーズ）

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 4                                       |
| Phase名    | テスト作成                              |
| 前提Phase  | Phase 3（設計レビューゲート PASS）      |
| 後続Phase  | Phase 5                                 |
| ステータス | 未実施                                  |
| 作成日     | 2026-04-13                              |
| 機能名     | TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001 |

---

## 目的

TDD の Red フェーズとして、ガード処理実装前にテストケース TC-11〜TC-15 を
`cronConverter.edge.test.ts` に追加し、テストが失敗（Red状態）であることを確認する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 環境確認

**目的**: テスト実行環境が正常であることを確認する

**実行手順**:

1. 依存関係が正常であることを確認する:
   ```bash
   pnpm install
   ```
2. 既存テストが全件グリーンであることを確認する:
   ```bash
   pnpm vitest run apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts
   ```
3. esbuild mismatch エラーが発生した場合は `pnpm install` を再実行する
4. 現在のテスト件数を記録する

**期待される成果物**:

- 既存テスト全件グリーンの確認

---

### タスク2: テストケース追加（TC-11〜TC-15）

**目的**: `monthly` dayOfMonth ガードのテストを追加する（Red状態を作る）

**実行手順**:

1. `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts` を開く
2. ファイル末尾（または `monthly` 関連のdescribeブロック内）に以下のテストブロックを追加する:

   ```typescript
   describe("visualConfigToCron - monthly dayOfMonth ガード", () => {
     const baseConfig: VisualCronConfig = {
       frequency: "monthly",
       minute: 0,
       hour: 9,
       dayOfMonth: 1,
       weekdays: [],
     };

     it("TC-11: dayOfMonth=0 のとき空文字を返す (AC-1)", () => {
       const config = { ...baseConfig, dayOfMonth: 0 };
       expect(visualConfigToCron(config)).toBe("");
     });

     it("TC-12: dayOfMonth=32 のとき空文字を返す (AC-2)", () => {
       const config = { ...baseConfig, dayOfMonth: 32 };
       expect(visualConfigToCron(config)).toBe("");
     });

     it("TC-13: dayOfMonth=-1 のとき空文字を返す (AC-3)", () => {
       const config = { ...baseConfig, dayOfMonth: -1 };
       expect(visualConfigToCron(config)).toBe("");
     });

     it("TC-14: dayOfMonth=1 のとき正常なcron式を返す (AC-4)", () => {
       const config = { ...baseConfig, dayOfMonth: 1 };
       expect(visualConfigToCron(config)).toBe("0 9 1 * *");
     });

     it("TC-15: dayOfMonth=31 のとき正常なcron式を返す (AC-5)", () => {
       const config = { ...baseConfig, dayOfMonth: 31 };
       expect(visualConfigToCron(config)).toBe("0 9 31 * *");
     });
   });
   ```

3. ファイルを保存する

**期待される成果物**:

- `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts` への追加（コード成果物）

---

### タスク3: Red 状態確認

**目的**: 追加したテストが失敗（Red）であることを確認する

**実行手順**:

1. テストを実行する:
   ```bash
   pnpm vitest run apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts
   ```
2. TC-11〜TC-13 が失敗（Red）であることを確認する
3. TC-14〜TC-15 は既存動作と一致するため通過（Green）する可能性がある
4. 失敗の内容（期待値と実際値の差分）を記録する

**期待される成果物**:

- `outputs/phase-4/test-red-result.md`（テスト失敗確認レポート）

---

### タスク4: テスト仕様書作成

**目的**: 追加したテストの仕様を記録する

**実行手順**:

1. 追加したテストケースの詳細を `outputs/phase-4/test-spec.md` に記録する
2. 各テストケースと AC の対応を明記する
3. Red 状態の失敗内容を記録する

**期待される成果物**:

- `outputs/phase-4/test-spec.md`（テスト仕様書）
- `outputs/phase-4/test-red-result.md`（Red状態確認レポート）

---

## 参照資料

| 参照資料       | パス                                                          | 内容             |
| -------------- | ------------------------------------------------------------- | ---------------- |
| テストファイル | `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts` | 追加先ファイル   |
| 実装ファイル   | `apps/desktop/src/renderer/utils/cronConverter.ts`            | テスト対象       |
| Phase 2 設計   | `outputs/phase-2/test-design.md`                              | テストケース設計 |

---

## 成果物

| 成果物       | パス                                                          | 内容                         |
| ------------ | ------------------------------------------------------------- | ---------------------------- |
| テストコード | `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts` | TC-11〜TC-15（コード成果物） |
| テスト仕様書 | `outputs/phase-4/test-spec.md`                                | テストケース仕様             |
| Red状態確認  | `outputs/phase-4/test-red-result.md`                          | 失敗確認レポート             |

---

## 統合テスト連携

- TC-11〜TC-13: ガード処理実装後（Phase 5）に Green になることを確認する
- TC-14〜TC-15: 正常ケースのため Phase 4 時点で Green の可能性あり

---

## TDD 検証（Phase 4）

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm vitest run apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts
```

**確認項目**:

- [ ] TC-11〜TC-13 がテスト失敗（Red状態）であることを確認

---

## 完了条件

- [ ] `pnpm install` が正常完了している
- [ ] 既存テスト全件がグリーンである
- [ ] TC-11〜TC-15 が `cronConverter.edge.test.ts` に追加されている
- [ ] TC-11〜TC-13 が Red 状態（失敗）であることを確認している
- [ ] `outputs/phase-4/test-spec.md` が作成されている
- [ ] `outputs/phase-4/test-red-result.md` が作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜4）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）が PASS であること
- **後続**: Phase 5（実装）へ進む

---

## Phase実行記録（完了後に記録）

```markdown
## Phase 4 実行記録

### TDD Red 状態確認

- 既存テスト件数:
- 追加テスト件数: 5（TC-11〜TC-15）
- Red となったテスト: TC-11, TC-12, TC-13
- Green となったテスト: TC-14, TC-15（既存動作と一致）

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001/phase-5-implementation.md`
