# Phase 4: テスト作成（Red段階）

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 4                                        |
| 機能名 | TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001 |
| 作成日 | 2026-04-12                               |

## 目的

TDD の Red 段階として、実装前にテストを先行作成する。
空 `weekdays` ケースのテストを作成し、現時点で RED（失敗）することを確認する。
これにより「ガード処理未実装の証明」としてのテストが機能することを事前検証する。

---

## 実行タスク

- **タスク1**: 事前確認 — 既存テスト構造・副作用チェック
- **タスク2**: テストシナリオテーブル（TC-01〜TC-06）の設計
- **タスク3**: `cronConverter.edge.test.ts` への空曜日ケーステスト追加（先行作成）
- **タスク4**: RED 確認（実装前の FAIL 確認）
- **タスク5**: テストマトリクスと RED 確認結果の記録

---

## テストシナリオ

### テストシナリオテーブル（TC-01〜TC-06）

| TC番号 | テスト名                                               | 入力                                                               | 期待結果                 |
| ------ | ------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------ |
| TC-01  | `weekdays=[] のとき空文字が返る`                       | `{ frequency: "weekly", weekdays: [], hour: 9, minute: 0 }`        | `""` が返る              |
| TC-02  | `weekdays=[0]（日曜のみ）で正常なcron式が返る`         | `{ frequency: "weekly", weekdays: [0], hour: 9, minute: 0 }`       | `"0 9 * * 0"` が返る     |
| TC-03  | `weekdays=[1,3,5]（複数曜日）で正常なcron式が返る`     | `{ frequency: "weekly", weekdays: [1, 3, 5], hour: 9, minute: 0 }` | `"0 9 * * 1,3,5"` が返る |
| TC-04  | `frequency="daily" のとき weekday 影響を受けない`      | `{ frequency: "daily", hour: 9, minute: 0 }`                       | `"0 9 * * *"` が返る     |
| TC-05  | `frequency="every-hour" のとき weekday 影響を受けない` | `{ frequency: "every-hour", minute: 30 }`                          | `"30 * * * *"` が返る    |
| TC-06  | `既存の全テストケースがPASSのまま維持されること`       | 既存テストケース全件                                               | 全件 PASS                |

---

## 参照資料

| 資料名                           | パス                                                          | 説明                                   |
| -------------------------------- | ------------------------------------------------------------- | -------------------------------------- |
| Phase 1 要件定義                 | `phase-1-requirements.md`                                     | バグ再現手順・AC・ガード戦略の前提     |
| Phase 2 設計                     | `phase-2-design.md`                                           | 空文字退避方針と型確認                 |
| Phase 3 レビュー結果             | `outputs/phase-3/design-review-result.md`                     | PASS 判定確認・採用アプローチ確認      |
| cronConverter エッジケーステスト | `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts` | テスト追加対象ファイル                 |
| cronConverter 実装               | `apps/desktop/src/renderer/utils/cronConverter.ts`            | 現状実装確認（ガード処理未実装の確認） |

---

## 実行手順

### ステップ0: Phase 4 事前確認【必須】

```bash
# 1. 既存テスト構造の把握
grep -n "describe\|it(\|weekdays\|\[\]" \
  apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts

# 2. ガード処理が未実装であることの確認（RED の前提）
grep -n "weekdays.*length\|throw.*weekday\|Error.*weekday" \
  apps/desktop/src/renderer/utils/cronConverter.ts

# 3. visualConfigToCron のインポートパターン確認
grep -n "import.*cronConverter\|from.*cronConverter" \
  apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts

# 4. 対象ファイルのトップレベル副作用確認
grep -n "^[^/]*\(ipcMain\.\|BrowserWindow\.\|app\.\)" \
  apps/desktop/src/renderer/utils/cronConverter.ts | head -10
```

**private method テスト方針の明記**:
`visualConfigToCron` は export された public 関数のため、直接インポートしてテストする（推奨方針）。

### ステップ1: テストコード設計

```typescript
// apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts への追加

describe("visualConfigToCron - 空weekdaysガード処理", () => {
  it("frequency='weekly' かつ weekdays=[] のとき空文字を返す", () => {
    expect(
      visualConfigToCron({
        frequency: "weekly",
        weekdays: [],
        hour: 9,
        minute: 0,
      }),
    ).toBe("");
  });

  it("weekdays=[0]（日曜のみ）で正常なcron式が返る", () => {
    expect(
      visualConfigToCron({
        frequency: "weekly",
        weekdays: [0],
        hour: 9,
        minute: 0,
      }),
    ).toBe("0 9 * * 0");
  });

  it("weekdays=[1,3,5]（複数曜日）で正常なcron式が返る", () => {
    expect(
      visualConfigToCron({
        frequency: "weekly",
        weekdays: [1, 3, 5],
        hour: 9,
        minute: 0,
      }),
    ).toBe("0 9 * * 1,3,5");
  });

  it("frequency='daily' のとき weekday 影響を受けない", () => {
    expect(visualConfigToCron({ frequency: "daily", hour: 9, minute: 0 })).toBe(
      "0 9 * * *",
    );
  });

  it("frequency='every-hour' のとき weekday 影響を受けない", () => {
    expect(visualConfigToCron({ frequency: "every-hour", minute: 30 })).toBe(
      "30 * * * *",
    );
  });
});
```

### ステップ2: RED 確認

実装前（Phase 5 前）にテストを実行し、新規追加テストが RED（失敗）であることを確認する:

```bash
# テスト全件実行（新規追加ケースが FAIL することを確認）
pnpm --filter @repo/desktop exec vitest run \
  src/__tests__/utils/cronConverter.edge.test.ts --reporter=verbose
```

**期待される RED 状態**:

- TC-01: `expect(...).toBe("")` が FAIL
  （理由: ガード処理が未実装のため、`"0 9 * * "` が返る）
- TC-02, TC-03: PASS のまま（既存動作が正常ケースに影響しないことの確認）
- TC-04, TC-05: PASS のまま（他 frequency への影響なし）

### ステップ3: TC-06 既存テスト全件 PASS 確認

```bash
# 全テスト実行（既存テストが RED に変化していないことを確認）
pnpm --filter @repo/desktop exec vitest run \
  src/__tests__/utils/ --reporter=verbose
```

**確認観点**:

- 追加テストが既存ケースを壊していないこと
- 追加前から PASS だったケースが引き続き PASS であること

---

## 統合テスト連携

- `visualConfigToCron` は純粋関数のため IPC 統合テスト不要
- テストコードは `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts` に配置（コード成果物の正しい配置）
- RED 確認結果を `outputs/phase-4/red-confirmation.md` に記録し、Phase 5 実装のインプットとする

---

## サブタスク管理

| ID     | タスク名                                         | ステータス |
| ------ | ------------------------------------------------ | ---------- |
| T-04-1 | 事前確認（既存テスト構造・副作用チェック）       | 未実施     |
| T-04-2 | テストシナリオテーブル（TC-01〜TC-06）の設計     | 未実施     |
| T-04-3 | `cronConverter.edge.test.ts` へのテスト追加      | 未実施     |
| T-04-4 | RED 確認（新規追加テストが FAIL することを確認） | 未実施     |
| T-04-5 | テストマトリクスと RED 確認結果の記録            | 未実施     |

---

## 成果物

### ドキュメント成果物

| 成果物           | 配置先                                | 形式     |
| ---------------- | ------------------------------------- | -------- |
| テストマトリクス | `outputs/phase-4/test-matrix.md`      | Markdown |
| RED 確認結果     | `outputs/phase-4/red-confirmation.md` | Markdown |

### コード成果物（codeArtifacts）

| 成果物                           | 配置先                                                                | 形式       |
| -------------------------------- | --------------------------------------------------------------------- | ---------- |
| cronConverter エッジケーステスト | `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts`（追加） | TypeScript |

---

## 完了条件

- [ ] 事前確認（既存テスト構造・副作用チェック）が完了していること
- [ ] テストシナリオテーブル（TC-01〜TC-06）が `outputs/phase-4/test-matrix.md` に記録されていること
- [ ] `cronConverter.edge.test.ts` に TC-01〜TC-05 が追加されていること
- [ ] 新規追加テストが RED（失敗）であることが `outputs/phase-4/red-confirmation.md` に記録されていること
- [ ] 既存テストの既存ケース（TC-06）が RED に変化していないこと（追加のみで既存を壊していないこと）
- [ ] `outputs/phase-4/` に全ドキュメント成果物が生成されていること

---

## タスク100%実行確認【必須】

- [ ] T-04-1: 事前確認（重複検出・副作用チェック）を実行済み
- [ ] T-04-2: テストシナリオ（TC-01〜TC-06）を `outputs/phase-4/test-matrix.md` に記録済み
- [ ] T-04-3: `cronConverter.edge.test.ts` へのテスト追加完了
- [ ] T-04-4: RED 確認を実行し、結果を `outputs/phase-4/red-confirmation.md` に記録済み
- [ ] T-04-5: 既存テスト全件（TC-06）が PASS のままであることを確認済み

---

## 次Phase

**Phase 5: 実装** — RED を GREEN に変えるための実装を行う。
`cronConverter.ts` の `visualConfigToCron` 関数にガード処理を追加し、JSDoc を更新する。

**Phase 5 開始条件**: Phase 4 の全完了条件を満たし、新規追加テストが RED 状態であることが確認済みであること。
