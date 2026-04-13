# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 値                                 |
| ---------- | ---------------------------------- |
| Phase      | 6                                  |
| タスクID   | TASK-UI-SCHEDULE-CRON-SEMANTIC-001 |
| 機能名     | 意味論的 cron バリデーション追加   |
| タスク種別 | implementation                     |
| 前Phase    | Phase 5: 実装                      |
| 次Phase    | Phase 7: テストカバレッジ確認      |
| ステータス | 未実施                             |
| 作成日     | 2026-04-12                         |

---

## 目的

Phase 4 で定義した TC-01〜TC-08 以外のエッジケース・回帰ガード・境界値テストを追加し、意味論的バリデーション（`options.semantic: true`）のカバレッジをさらに向上させる。

具体的には以下を実施する:

1. 30日までの月（4月・6月・9月・11月）の 31 日エラーケース追加（TC-09〜TC-13）
2. 後方互換ガードの補完（TC-14）
3. 空文字・エッジ入力のバウンダリテスト追加（TC-15）
4. day-of-month/day-of-week の安全側判定確認（TC-16）
5. 既存テスト（SCV-01〜SCV-12）・Phase 4 テスト（TC-01〜TC-08）の回帰確認

Phase 6 完了時点で、エラーケースは RED、到達可能ケースは GREEN となり、カバレッジが向上していることが期待される。

---

## 実行タスク

### タスク1: 追加テストケース（TC-09〜TC-16）の記述

`apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts` に、Phase 4 で追加した describe ブロックとは別の describe ブロックとして以下を追加する。

**追加テストケース一覧**:

| TC ID | cron 式          | semantic | 期待結果          | 観点                                                      |
| ----- | ---------------- | -------- | ----------------- | --------------------------------------------------------- |
| TC-09 | `"0 0 30 2 *"`   | `true`   | エラー（非 null） | 2 月 30 日も存在しない                                    |
| TC-10 | `"0 0 31 4 *"`   | `true`   | エラー（非 null） | 4 月 31 日は存在しない（4 月は 30 日まで）                |
| TC-11 | `"0 0 31 6 *"`   | `true`   | エラー（非 null） | 6 月 31 日は存在しない                                    |
| TC-12 | `"0 0 31 9 *"`   | `true`   | エラー（非 null） | 9 月 31 日は存在しない                                    |
| TC-13 | `"0 0 31 11 *"`  | `true`   | エラー（非 null） | 11 月 31 日は存在しない                                   |
| TC-14 | `"0 0 31 4 *"`   | `false`  | PASS（null）      | semantic=false は後方互換（不正な日付でも従来挙動を維持） |
| TC-15 | `""` （空文字）  | `true`   | エラー（非 null） | 空文字は semantic チェック前に構文エラーで reject される  |
| TC-16 | `"0 0 31 2 1-5"` | `true`   | エラー（非 null） | cron-parser の実挙動に合わせ、安全側に到達不能として扱う  |

**グループ分類**:

| グループ               | TC ID                             | 目的                                     |
| ---------------------- | --------------------------------- | ---------------------------------------- |
| 30 日月の境界値エラー  | TC-09, TC-10, TC-11, TC-12, TC-13 | 月末日エラーの完全な境界値カバレッジ     |
| 後方互換補完           | TC-14                             | semantic=false の後方互換動作を補完確認  |
| バウンダリ・入力エッジ | TC-15                             | 空文字が semantic 前に弾かれることを確認 |
| 安全側判定確認         | TC-16                             | day-of-week を含む式の到達可能性を確認   |

**追加するテストコードのひな形**:

```typescript
describe("validateCronExpression - semantic validation edge cases (Phase 6)", () => {
  // TC-09: 2月30日も存在しない
  it("TC-09: semantic=true で 0 0 30 2 * はエラーを返す", () => {
    const result = validateCronExpression("0 0 30 2 *", { semantic: true });
    expect(result).not.toBeNull();
    expect(typeof result).toBe("string");
  });

  // TC-10: 4月31日は存在しない
  it("TC-10: semantic=true で 0 0 31 4 * はエラーを返す", () => {
    const result = validateCronExpression("0 0 31 4 *", { semantic: true });
    expect(result).not.toBeNull();
    expect(typeof result).toBe("string");
  });

  // TC-11: 6月31日は存在しない
  it("TC-11: semantic=true で 0 0 31 6 * はエラーを返す", () => {
    const result = validateCronExpression("0 0 31 6 *", { semantic: true });
    expect(result).not.toBeNull();
    expect(typeof result).toBe("string");
  });

  // TC-12: 9月31日は存在しない
  it("TC-12: semantic=true で 0 0 31 9 * はエラーを返す", () => {
    const result = validateCronExpression("0 0 31 9 *", { semantic: true });
    expect(result).not.toBeNull();
    expect(typeof result).toBe("string");
  });

  // TC-13: 11月31日は存在しない
  it("TC-13: semantic=true で 0 0 31 11 * はエラーを返す", () => {
    const result = validateCronExpression("0 0 31 11 *", { semantic: true });
    expect(result).not.toBeNull();
    expect(typeof result).toBe("string");
  });

  // TC-14: semantic=false は後方互換
  it("TC-14: semantic=false で 0 0 31 4 * は null を返す（後方互換）", () => {
    const result = validateCronExpression("0 0 31 4 *", { semantic: false });
    expect(result).toBeNull();
  });

  // TC-15: 空文字は semantic チェック前に reject される
  it("TC-15: semantic=true で空文字はエラーを返す", () => {
    const result = validateCronExpression("", { semantic: true });
    expect(result).not.toBeNull();
    expect(typeof result).toBe("string");
  });

  // TC-16: cron-parser の実挙動に合わせ、安全側に拒否する
  it("TC-16: semantic=true で 0 0 31 2 1-5 はエラーを返す", () => {
    const result = validateCronExpression("0 0 31 2 1-5", { semantic: true });
    expect(result).not.toBeNull();
    expect(typeof result).toBe("string");
  });
});
```

**TC-16 の取り扱い方針**:

`"0 0 31 2 1-5"` は day-of-month だけを見ると存在しない日付だが、`cron-parser@5.5.0` の実挙動では到達不能として扱われる。semantic validator はこの安全側の挙動に合わせ、存在しない日付を拒否する。

---

### タスク2: 回帰ガード確認

以下の既存テストケースが Phase 5 実装後も引き続き PASS することを確認する。

**回帰ガード対象**:

| テスト対象                              | 期待結果   | 観点                              |
| --------------------------------------- | ---------- | --------------------------------- |
| `validateCronExpression("0 0 * * *")`   | `null`     | options 未指定の後方互換（AC-3）  |
| `validateCronExpression("* * * * *")`   | `null`     | 毎分実行・構文的に有効            |
| `validateCronExpression("0 9 * * 1-5")` | `null`     | 平日 9 時・構文的に有効           |
| `validateCronExpression("0 0 31 2 *")`  | `null`     | options 未指定では semantic なし  |
| `validateCronExpression("0 0 31 4 *")`  | `null`     | semantic=false では従来挙動を維持 |
| TC-01〜TC-08 全件                       | 各期待結果 | Phase 4 テストの回帰なし          |

**回帰確認コマンド**:

```bash
# Phase 4 テスト（TC-01〜TC-08）の回帰確認
pnpm vitest run apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts

# 既存テスト（SCV-01〜SCV-12）の回帰確認
pnpm vitest run apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts

# 全テスト一括実行
pnpm vitest run apps/desktop/src/__tests__/utils/
```

---

### タスク3: カバレッジ確認

Phase 6 完了後のカバレッジ向上を確認する。

**カバレッジ確認コマンド**:

```bash
pnpm vitest run --coverage apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts
```

**期待するカバレッジ向上観点**:

| 観点                                | Phase 4 前 | Phase 6 後 |
| ----------------------------------- | ---------- | ---------- |
| 30 日月の境界値ケース               | 未カバー   | カバー済み |
| 空文字 + semantic=true の組み合わせ | 未カバー   | カバー済み |
| day-of-week の安全側判定確認        | 未カバー   | カバー済み |
| semantic=false 後方互換補完         | 部分カバー | 完全カバー |

---

## 参照資料

| 資料名                         | パス                                                                    | 説明                                                    |
| ------------------------------ | ----------------------------------------------------------------------- | ------------------------------------------------------- |
| Phase 4 テスト計画書           | `outputs/phase-4/test-plan.md`                                          | TC-01〜TC-08 一覧（拡充前の基準）                       |
| Phase 4 テストケースコード     | `outputs/phase-4/test-cases.md`                                         | 拡充前のテストコード全文                                |
| Phase 5 実装計画書             | `outputs/phase-5/implementation-plan.md`                                | 実装済みの `ValidateCronOptions` / バリデーションフロー |
| Phase 5 変更ログ               | `outputs/phase-5/change-log.md`                                         | `cron-parser` バージョン・変更差分                      |
| scheduleConfigValidator 実装   | `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`            | Phase 5 実装後のファイル（テスト対象）                  |
| scheduleConfigValidator テスト | `apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts`      | 回帰ガード対象（SCV-01〜SCV-12）                        |
| scheduleConfigValidator Edge   | `apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts` | テスト追加先ファイル（TC-09〜TC-16 追記済み）           |
| 受け入れ基準                   | `outputs/phase-1/acceptance-criteria.md`                                | AC-1〜AC-5（AC-4 カバレッジ向上が本 Phase の主目標）    |

---

## 成果物

| 成果物               | 配置先                                       | 形式     | 説明                                                               |
| -------------------- | -------------------------------------------- | -------- | ------------------------------------------------------------------ |
| 拡充テストケース記録 | `outputs/phase-6/expanded-test-cases.md`     | Markdown | TC-09〜TC-16 のコード全文・期待値・TC-16 の安全側判定記録          |
| 回帰テスト結果       | `outputs/phase-6/regression-test-results.md` | Markdown | SCV-01〜SCV-12 + TC-01〜TC-08 の回帰確認結果・カバレッジ向上の記録 |

---

## 統合テスト連携

- Phase 6 で追加した TC-09〜TC-16 は Phase 7 テストカバレッジ確認の評価対象となる
- TC-16（day-of-week の安全側判定）の仕様確定結果は `outputs/phase-6/expanded-test-cases.md` に記録し、Phase 7 レビュー時に参照できるようにする
- 回帰テスト結果（`outputs/phase-6/regression-test-results.md`）は Phase 9（統合テスト）での基準値として参照される
- Phase 11（NON_VISUAL 評価）：バリデーターロジックのみの変更のため、スクリーンショット不要・コード動作確認のみ

---

## 完了条件チェックリスト

- [ ] TC-09〜TC-16 のテストコードが `scheduleConfigValidator.edge.test.ts` に追加されていること
- [ ] TC-16（安全側判定）の期待値が確定し、テストコードに反映されていること
- [ ] `pnpm vitest run` で TC-09〜TC-16 が全件 PASS していること
- [ ] `pnpm vitest run` で TC-01〜TC-08（Phase 4 テスト）が引き続き全件 PASS していること（回帰なし）
- [ ] `pnpm vitest run` で SCV-01〜SCV-12（既存テスト）が引き続き全件 PASS していること（回帰なし）
- [ ] カバレッジが Phase 4 前と比較して向上していることが確認されていること（AC-4 対応）
- [ ] `outputs/phase-6/expanded-test-cases.md` に TC-09〜TC-16 のコード全文と確定期待値が記録されていること
- [ ] `outputs/phase-6/regression-test-results.md` に SCV-01〜SCV-12 + TC-01〜TC-08 の回帰確認結果が記録されていること

---

## Phase 末端アクション【必須】

Phase 6 完了時に以下を実行すること:

1. `outputs/phase-6/expanded-test-cases.md` に TC-09〜TC-16 のテストコード全文と確定した期待値（特に TC-16 の安全側判定）を記録する
2. `outputs/phase-6/regression-test-results.md` に `pnpm vitest run` の実行結果を貼り付け、SCV-01〜SCV-12 および TC-01〜TC-08 の回帰なしを確認する
3. カバレッジレポートの要約を `outputs/phase-6/regression-test-results.md` に記録し、AC-4 の充足を確認する
4. 全完了条件チェックリストを確認し、未完了項目がある場合は完了させてから Phase 7 へ進む

---

## 依存関係

| 依存 Phase / タスク | 依存内容                                                            |
| ------------------- | ------------------------------------------------------------------- |
| Phase 4 完了        | TC-01〜TC-08 が GREEN（PASS）状態であること                         |
| Phase 5 完了        | `validateCronExpression` に `options.semantic` が実装済みであること |
| Phase 5 完了        | `cron-parser` がインストール済みであること                          |

---

## Phase 実行記録テンプレート

```markdown
## Phase 6 実行記録

- 実行日時: YYYY-MM-DD HH:mm
- 実行者: -
- 追加テストケース数: TC-09〜TC-16（8 件）
- TC-16 安全側判定結果: [ ] エラー（非 null）/ [ ] PASS（null）
- TC-09〜TC-16 判定確認: [ ] 期待結果どおり / [ ] 失敗あり（件数: X 件）
- TC-01〜TC-08 回帰確認: [ ] 全件 PASS / [ ] 失敗あり（件数: X 件）
- SCV-01〜SCV-12 回帰確認: [ ] 全件 PASS / [ ] 失敗あり（件数: X 件）
- カバレッジ向上確認: [ ] 向上あり / [ ] 変化なし（理由: ）
- 完了条件充足状況: X / 8 項目完了
- Phase 7 移行判定: [ ] PASS（Phase 7 へ進む）/ [ ] HOLD（理由: ）
```

---

## 次の Phase 案内

**Phase 7: テストカバレッジ確認** — Phase 5 で実装した `validateCronExpression` の変更（`ValidateCronOptions` インターフェース・意味論的バリデーションロジック）および Phase 4・Phase 6 で追加したテスト（TC-01〜TC-16）の到達分岐が十分にカバーされているかを確認する。

**ゲート条件**: Phase 5 実装が完了し、TC-01〜TC-16 全件および SCV-01〜SCV-12 全件が PASS していない場合、Phase 7 へ進まないこと。
