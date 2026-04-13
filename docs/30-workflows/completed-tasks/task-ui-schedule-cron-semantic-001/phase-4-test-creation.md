# Phase 4: テスト作成（TDD Red フェーズ） - タスク仕様書

## メタ情報

| 項目       | 値                                 |
| ---------- | ---------------------------------- |
| Phase      | 4                                  |
| タスクID   | TASK-UI-SCHEDULE-CRON-SEMANTIC-001 |
| 機能名     | 意味論的 cron バリデーション追加   |
| タスク種別 | implementation                     |
| 前Phase    | Phase 3: 設計レビューゲート        |
| 次Phase    | Phase 5: 実装                      |
| ステータス | 未実施                             |
| 作成日     | 2026-04-12                         |

---

## 目的

TDD Red フェーズとして、意味論的バリデーションの失敗テストケースを先に作成する。

Phase 5 の実装前にテストを記述することで、実装の設計ミスを早期に発見し、意味論的バリデーション（`options.semantic: true`）の動作仕様をテストコードで明確化する。本 Phase では、RED で確認したい不正ケースと、GREEN で維持したい有効ケースを同時に定義する。

---

## 命名規則確認【TDD Red 前に必須】

テスト作成前に、`scheduleConfigValidator.ts` の現在の関数命名パターンを確認すること:

| 関数名                              | シグネチャ                                                            | 役割                       |
| ----------------------------------- | --------------------------------------------------------------------- | -------------------------- |
| `validateCronExpression`            | `(value: string): string \| null`                                     | cron 構文・値域チェック    |
| `validateTimezone`                  | `(value: string): string \| null`                                     | タイムゾーン検証           |
| `validateSkillWizardScheduleConfig` | `(config: SkillWizardScheduleConfig): ScheduleConfigValidationResult` | スケジュール設定全体の検証 |

**Phase 4 では** `validateCronExpression` に `options?: ValidateCronOptions` を追加する前提でテストを記述する。テスト内で使用するシグネチャは以下の通り（実装は Phase 5 で行う）:

```typescript
validateCronExpression(value: string, options?: ValidateCronOptions): string | null
```

**確認コマンド**:

```bash
# 現在の関数シグネチャを確認
grep -n "export function\|export interface\|export type" \
  apps/desktop/src/renderer/utils/scheduleConfigValidator.ts

# 既存テストの構造を確認
grep -n "describe\|it(\|test(" \
  apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts \
  apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts
```

---

## 実行タスク

### タスク1: テスト計画書の作成

以下のテストケース一覧を `outputs/phase-4/test-plan.md` に記録する。

**テストケース一覧（TC-01〜TC-08）**:

| TC ID | cron 式                      | semantic    | 期待結果          | 観点                                                     |
| ----- | ---------------------------- | ----------- | ----------------- | -------------------------------------------------------- |
| TC-01 | `"0 0 31 2 *"`               | `true`      | エラー（非 null） | 2 月 31 日は存在しない（AC-1 直接対応）                  |
| TC-02 | `"0 0 29 2 *"`               | `true`      | PASS（null）      | うるう年の未来到達は有効である（過剰拒否しない）         |
| TC-03 | `"0 0 30 * *"`               | `true`      | PASS（null）      | 30 日は多数の月に存在するため有効                        |
| TC-04 | `"0 0 * * *"`                | `true`      | PASS（null）      | 毎日実行・正常ケース（AC-2 直接対応）                    |
| TC-05 | `"0 0 31 2 *"`               | `false`     | PASS（null）      | semantic=false は意味論チェックを行わない（後方互換）    |
| TC-06 | `"0 0 31 2 *"`               | `undefined` | PASS（null）      | options 未指定はデフォルトで semantic 無効               |
| TC-07 | `"0 0 31 1,3,5,7,8,10,12 *"` | `true`      | PASS（null）      | 1,3,5,7,8,10,12 月は 31 日が存在する                     |
| TC-08 | `"0 0 31 2 1"`               | `true`      | エラー（非 null） | cron-parser の実挙動に合わせ、安全側に到達不能として扱う |

**グループ分類**:

| グループ             | TC ID                      | 目的                                   |
| -------------------- | -------------------------- | -------------------------------------- |
| semantic=true エラー | TC-01                      | 意味論チェック有効時に不正入力を検出   |
| semantic=true PASS   | TC-02, TC-03, TC-04, TC-07 | 意味論チェック有効でも正常入力はスルー |
| semantic=true エラー | TC-01, TC-08               | 実装で拒否すべき不正入力を検出         |
| 後方互換ガード       | TC-05, TC-06               | semantic 無効時の既存動作を保証        |

---

### タスク2: TDD Red テストケースの作成

`apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts` に以下のテストブロックを追加する指示。

**追加場所**: 既存テストファイルの末尾（または既存の `describe` ブロックの後）。

**追加するテストコードのひな形**:

```typescript
import { validateCronExpression } from "../../../renderer/utils/scheduleConfigValidator";

const validateCronExpressionSemantic = validateCronExpression as (
  value: string,
  options?: { semantic?: boolean },
) => string | null;

describe("validateCronExpression - semantic validation (TDD Red Phase)", () => {
  // TC-01: 2月31日は存在しない（AC-1）
  it("TC-01: semantic=true で 0 0 31 2 * はエラーを返す", () => {
    const result = validateCronExpressionSemantic("0 0 31 2 *", {
      semantic: true,
    });
    expect(result).not.toBeNull();
    expect(typeof result).toBe("string");
  });

  // TC-02: うるう年の未来到達は有効
  it("TC-02: semantic=true で 0 0 29 2 * は null を返す", () => {
    const result = validateCronExpressionSemantic("0 0 29 2 *", {
      semantic: true,
    });
    expect(result).toBeNull();
  });

  // TC-03: 30日は多数の月に存在する
  it("TC-03: semantic=true で 0 0 30 * * は null を返す（PASS）", () => {
    const result = validateCronExpressionSemantic("0 0 30 * *", {
      semantic: true,
    });
    expect(result).toBeNull();
  });

  // TC-04: 毎日実行（AC-2）
  it("TC-04: semantic=true で 0 0 * * * は null を返す（PASS）", () => {
    const result = validateCronExpressionSemantic("0 0 * * *", {
      semantic: true,
    });
    expect(result).toBeNull();
  });

  // TC-05: semantic=false は後方互換（意味論チェックをスキップ）
  it("TC-05: semantic=false で 0 0 31 2 * は null を返す（後方互換）", () => {
    const result = validateCronExpressionSemantic("0 0 31 2 *", {
      semantic: false,
    });
    expect(result).toBeNull();
  });

  // TC-06: options 未指定はデフォルトで semantic 無効
  it("TC-06: options 未指定で 0 0 31 2 * は null を返す（後方互換）", () => {
    const result = validateCronExpressionSemantic("0 0 31 2 *");
    expect(result).toBeNull();
  });

  // TC-07: 1,3,5,7,8,10,12月は31日がある
  it("TC-07: semantic=true で 0 0 31 1,3,5,7,8,10,12 * は null を返す（PASS）", () => {
    const result = validateCronExpressionSemantic("0 0 31 1,3,5,7,8,10,12 *", {
      semantic: true,
    });
    expect(result).toBeNull();
  });

  // TC-08: cron-parser の実挙動に合わせ、day-of-week 付きでも安全側に拒否する
  it("TC-08: semantic=true で 0 0 31 2 1 はエラーを返す", () => {
    const result = validateCronExpressionSemantic("0 0 31 2 1", {
      semantic: true,
    });
    expect(result).not.toBeNull();
    expect(typeof result).toBe("string");
  });
});
```

**補足**:

- Phase 4 作成時点では day-of-week で救済できる仮説を置いていたが、Phase 5 で `cron-parser@5.5.0` の実挙動を確認し、TC-08 は error に修正した
- 現在の実装と Phase 6 以降の成果物は、この修正後の前提に揃えている

**注意事項**:

- Phase 4 では `ValidateCronOptions` を直接 import せず、テスト内で structural cast を使って behavior だけを固定する
- テスト実行コマンドは以下:

```bash
# TDD Red 確認（テストが失敗することを確認）
pnpm vitest run apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts
```

- RED で確認した不正ケースを Phase 5 で解消し、GREEN のケースはそのまま維持する

---

## 参照資料

| 資料名                         | パス                                                                     | 説明                                         |
| ------------------------------ | ------------------------------------------------------------------------ | -------------------------------------------- |
| Phase 2 API 設計               | `outputs/phase-2/api-design.md`                                          | `ValidateCronOptions` シグネチャ・フロー設計 |
| Phase 2 設計詳細               | `docs/30-workflows/task-ui-schedule-cron-semantic-001/phase-2-design.md` | 関数シグネチャ・インターフェース定義         |
| Phase 3 設計レビュー結果       | `outputs/phase-3/design-review-result.md`                                | PASS / MINOR / MAJOR 判定記録                |
| scheduleConfigValidator 実装   | `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`             | テスト対象ファイル（変更前の現行実装）       |
| scheduleConfigValidator テスト | `apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts`       | 既存テスト SCV-01〜SCV-12（回帰ガード対象）  |
| scheduleConfigValidator Edge   | `apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts`  | テスト追加先ファイル                         |
| 受け入れ基準                   | `outputs/phase-1/acceptance-criteria.md`                                 | AC-1〜AC-5 の全条件                          |

---

## 成果物

| 成果物                 | 配置先                          | 形式     | 説明                                            |
| ---------------------- | ------------------------------- | -------- | ----------------------------------------------- |
| テスト計画書           | `outputs/phase-4/test-plan.md`  | Markdown | TC-01〜TC-08 の一覧・グループ分類・期待結果     |
| テストケースコード記録 | `outputs/phase-4/test-cases.md` | Markdown | 実際に追加したテストコードの全文と RED 確認結果 |

---

## 統合テスト連携

- Phase 4 で作成したテストは Phase 5 実装で期待結果どおりに分岐するようにする（TC-01 は RED のまま、TC-02〜TC-08 は GREEN を維持する）
- Phase 5 実装完了後、`pnpm vitest run` で TC-01〜TC-08 が期待結果どおりに PASS / FAIL へ分かれていることを確認する
- 既存テスト SCV-01〜SCV-12 は Phase 4 時点では変更せず、回帰ガードとして引き続き利用する
- Phase 6 では TC-09〜TC-16 を追加し、カバレッジを更に向上させる
- Phase 11（NON_VISUAL 評価）：バリデーターロジックのみの変更のため、スクリーンショット不要・コード動作確認のみ

---

## 完了条件チェックリスト

- [ ] `outputs/phase-4/test-plan.md` に TC-01〜TC-08 の一覧が記録されていること
- [ ] `apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts` に TC-01〜TC-08 のテストコードが追加されていること
- [ ] `pnpm vitest run` を実行し、RED ケースと GREEN ケースの期待結果が混在していても意図どおりに分かれていることが確認されていること
- [ ] 既存テスト SCV-01〜SCV-12 が引き続き PASS していること（回帰なし）
- [ ] `outputs/phase-4/test-cases.md` にテストコードの全文と RED 確認結果が記録されていること
- [ ] Phase 5 への引き継ぎ事項（`TC-01` の red 化と、green ケースを維持する方針）が明記されていること

---

## Phase 末端アクション【必須】

Phase 4 完了時に以下を実行すること:

1. `outputs/phase-4/test-plan.md` に TC-01〜TC-08 の一覧とグループ分類を記録する
2. `outputs/phase-4/test-cases.md` に追加したテストコードの全文を記録し、`pnpm vitest run` の出力（red/green の判定）を貼り付ける
3. 既存テスト SCV-01〜SCV-12 が PASS していることを確認し、結果を `outputs/phase-4/test-cases.md` に記録する
4. 全完了条件チェックリストを確認し、未完了項目がある場合は完了させてから Phase 5 へ進む

---

## 依存関係

| 依存 Phase / タスク | 依存内容                                                                     |
| ------------------- | ---------------------------------------------------------------------------- |
| Phase 1 完了        | 受け入れ基準（AC-1〜AC-5）が確定していること                                 |
| Phase 2 完了        | `ValidateCronOptions` インターフェース定義・関数シグネチャが確定していること |
| Phase 3 完了        | 設計レビューが PASS / MINOR のみで完了していること                           |

---

## Phase 実行記録テンプレート

```markdown
## Phase 4 実行記録

- 実行日時: YYYY-MM-DD HH:mm
- 実行者: -
- テストケース追加数: TC-01〜TC-08（8 件）
- RED 確認結果:
  - TC-01: [ ] RED / [ ] 予期せず GREEN
  - TC-02: [ ] RED / [ ] 予期せず GREEN
  - TC-03: [ ] 予期せず RED / [ ] GREEN（PASS ケース）
  - TC-04: [ ] 予期せず RED / [ ] GREEN（PASS ケース）
  - TC-05: [ ] 予期せず RED / [ ] GREEN（後方互換）
  - TC-06: [ ] 予期せず RED / [ ] GREEN（後方互換）
  - TC-07: [ ] 予期せず RED / [ ] GREEN（PASS ケース）
  - TC-08: [ ] RED / [ ] 予期せず GREEN
- 既存テスト SCV-01〜SCV-12 回帰確認: [ ] 全件 PASS / [ ] 失敗あり（件数: X 件）
- 完了条件充足状況: X / 6 項目完了
- Phase 5 移行判定: [ ] PASS（Phase 5 へ進む）/ [ ] HOLD（理由: ）
```

---

## 次の Phase 案内

**Phase 5: 実装（TDD Green フェーズ）** — Phase 4 で作成した red case（TC-01）を解消し、green case（TC-02〜TC-08）を維持する実装を行う。`cron-parser` ライブラリのインストール、`ValidateCronOptions` インターフェースの追加、`validateCronExpression` へのオプションパラメータ追加および意味論的バリデーションロジックの実装を実施する。

**ゲート条件**: Phase 3 の設計レビューが PASS / MINOR のみで完了していない場合、Phase 4 へ進まないこと。
