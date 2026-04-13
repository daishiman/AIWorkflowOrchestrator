# cronExpression 複合フィールド意味論チェック拡張 - タスク指示書

## メタ情報

| 項目         | 内容                                                |
| ------------ | --------------------------------------------------- |
| タスクID     | TASK-CRON-VALIDATION-COMPOSITE-001                  |
| タスク名     | cronExpression 複合フィールド意味論チェック拡張     |
| 分類         | 改善                                                |
| タスク種別   | non_visual                                          |
| 対象機能     | スケジュール設定バリデーション                      |
| 優先度       | 低                                                  |
| 見積もり規模 | 小規模                                              |
| ステータス   | 未着手                                              |
| 発見元       | TASK-CRON-SEMANTIC-VALIDATION-001 Phase 12 申し送り |
| 発見日       | 2026-04-12                                          |
| GitHub Issue | #2111                                               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-CRON-SEMANTIC-VALIDATION-001` では `validateCronSemantics()` 関数を新設し、日・月フィールドが**単純な数値**かつ weekday が `*` の場合に限り、月末日の意味論チェックを実装した。

この設計は意図的なものであり、カンマ区切り（`1,15`）・範囲指定（`1-5`）・ステップ（`*/5`）といった複合フィールドの値域チェックは既存の Stage 2（`isValidCronField`）が担い、Stage 3 の意味論チェック対象から外している。

Phase 12 のスキルフィードバックレポートにおいて「複合フィールドの意味論チェックが必要になった場合は `validateCronSemantics` を拡張する」と申し送りされた。

### 1.2 問題点・課題

現在の `validateCronSemantics` は以下のケースで意味論チェックを**スキップ**する（`null` を返す）。

| cron 式         | 現在の動作           | 期待される動作（将来）                                  |
| --------------- | -------------------- | ------------------------------------------------------- |
| `0 9 1,15 2 *`  | Stage 2 のみ（PASS） | `1,15` の各値が 2 月に存在するか確認可能                |
| `0 9 28-31 2 *` | Stage 2 のみ（PASS） | 範囲内に 2 月に存在しない日が含まれるか確認可能         |
| `0 9 */10 4 *`  | Stage 2 のみ（PASS） | ステップ展開後に 4 月に存在しない日が含まれるか確認可能 |

これらは現状「値域としては正しいが意味論的に問題のある可能性がある」ケースであり、Stage 2 を通過してしまう。

### 1.3 放置した場合の影響

- ユーザーが `0 9 30,31 2 *` と入力しても現在はエラーにならない（2月30日・31日は存在しない）
- `0 9 28-31 2 *` も同様に通過してしまう（2月29日以外は存在しない）
- スケジュールは登録できるが該当日に実行されないため、ユーザーは設定ミスに気づきにくい
- 現時点で報告された不具合はないが、将来的にユーザーから「スケジュールが実行されない」という問い合わせが発生するリスクがある

---

## 2. 何を達成するか（What）

### 2.1 目的

`validateCronSemantics()` を拡張し、カンマ区切り・範囲指定・ステップ指定といった複合フィールドを持つ cron 式に対しても、月末日の意味論チェックを実行できるようにする。

### 2.2 最終ゴール

- `0 9 30,31 2 *` のような「存在しない日付を含む複合フィールド」に対してエラーメッセージを返す
- 既存の単純数値に対する意味論チェック（`0 9 31 4 *` 等）は変更しない
- 全ての既存テストが引き続き PASS する

### 2.3 スコープ

#### 含むもの

- `validateCronSemantics()` の複合フィールド対応拡張（カンマ区切り・範囲指定・ステップ指定）
- `scheduleConfigValidator.edge.test.ts` への複合フィールド意味論チェックのテストケース追加
- `scheduleConfigValidator.test.ts` への回帰テスト追加

#### 含まないもの

- UI（`ScheduleDialog` / `ConversationRoundStep`）への変更（既存のエラー文字列表示コードで対応可能）
- i18n 対応（別タスク: `CRON_VALIDATION_ERRORS` 定数は中央管理済みのため拡張不要）
- Electron メイン・プロセスへの変更
- weekday フィールドの意味論チェック（`*` 以外の weekday 指定時）

---

## 3. どのように実装するか（How）

### 3.1 実装アプローチ

`validateCronSemantics()` に複合フィールドパース処理を追加する。既存の「単純数値のみチェック」ロジックを「複合フィールドを展開して全値をチェック」に拡張する。

**フィールドパース戦略**:

1. カンマ区切りで分割 → 各パーツを処理
2. 各パーツをさらに解析：
   - 単純数値: `31` → `[31]`
   - 範囲指定: `28-31` → `[28, 29, 30, 31]`
   - ステップ指定: `*/5` → 当該フィールドの全有効値を 5 刻みで展開（例: 日フィールドなら `[1, 6, 11, 16, 21, 26, 31]`）
   - `*` 単独: チェック対象外（全値が有効なため）

月フィールドも同様に展開し、全（月, 日）の組み合わせで月末日チェックを実施する。

### 3.2 変更対象ファイル

| ファイル                                                                | 変更種別               |
| ----------------------------------------------------------------------- | ---------------------- |
| `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`            | 変更                   |
| `apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts` | 変更                   |
| `apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts`      | 変更（回帰テスト追加） |

### 3.3 実装のポイント

#### ヘルパー関数の追加

```typescript
/**
 * cron フィールド文字列を数値の配列へ展開する。
 * - "*"  → null（全値有効のためチェック対象外）
 * - "1,15" → [1, 15]
 * - "28-31" → [28, 29, 30, 31]
 * - "*/5"  → [min, min+5, min+10, ...] （フィールドの最小値から最大値までステップ展開）
 * - "10/5" → [10, 15, 20, ...] （起点から最大値までステップ展開）
 *
 * @param field - cron フィールド文字列
 * @param min - フィールドの最小有効値
 * @param max - フィールドの最大有効値
 * @returns 展開された数値配列、または null（ワイルドカードの場合）
 */
function expandCronField(
  field: string,
  min: number,
  max: number,
): number[] | null {
  if (field === "*") return null;

  const values: number[] = [];

  for (const part of field.split(",")) {
    const trimmed = part.trim();
    const slashIdx = trimmed.indexOf("/");
    const step = slashIdx !== -1 ? Number(trimmed.slice(slashIdx + 1)) : 1;
    const base = slashIdx !== -1 ? trimmed.slice(0, slashIdx) : trimmed;

    if (base === "*") {
      for (let v = min; v <= max; v += step) values.push(v);
    } else if (/^\d+$/.test(base)) {
      const start = Number(base);
      for (let v = start; v <= max; v += step) values.push(v);
    } else {
      const rangeMatch = base.match(/^(\d+)-(\d+)$/);
      if (rangeMatch) {
        const rangeStart = Number(rangeMatch[1]);
        const rangeEnd = Number(rangeMatch[2]);
        for (let v = rangeStart; v <= rangeEnd; v += step) values.push(v);
      }
    }
  }

  return values.length > 0 ? [...new Set(values)].sort((a, b) => a - b) : null;
}
```

#### `validateCronSemantics` の拡張

```typescript
function validateCronSemantics(fields: string[]): string | null {
  const dayField = fields[2];
  const monthField = fields[3];
  const weekdayField = fields[4];

  // weekday が指定されている場合は意味論チェックをスキップ
  // （曜日で絞り込まれるため月末日チェックは不適切）
  if (weekdayField !== "*") {
    return null;
  }

  // 日・月フィールドを展開（"*" の場合は null が返る）
  const days = expandCronField(dayField, 1, 31);
  const months = expandCronField(monthField, 1, 12);

  // どちらかがワイルドカードの場合はチェック対象外
  if (days === null || months === null) {
    return null;
  }

  // 全（月, 日）の組み合わせで存在チェック
  for (const month of months) {
    const maxDays = MAX_DAYS_PER_MONTH[month];
    if (!maxDays) continue;
    for (const day of days) {
      if (day > maxDays) {
        return CRON_VALIDATION_ERRORS.INVALID_DATE;
      }
    }
  }

  return null;
}
```

#### 追加テストケース例

```typescript
describe("validateCronExpression - 複合フィールド意味論チェック (TC-COMP-SEM)", () => {
  it("TC-COMP-SEM-01: カンマ区切り日に 2 月に存在しない日が含まれる場合はエラー", () => {
    // 2月30日は存在しない
    expect(validateCronExpression("0 9 1,30 2 *")).not.toBeNull();
  });

  it("TC-COMP-SEM-02: カンマ区切り日が全て 2 月に存在する場合は有効", () => {
    // 2月1日・15日は存在する
    expect(validateCronExpression("0 9 1,15 2 *")).toBeNull();
  });

  it("TC-COMP-SEM-03: 範囲指定が 4 月に存在しない日を含む場合はエラー", () => {
    // 4月は30日まで（31日は存在しない）
    expect(validateCronExpression("0 9 29-31 4 *")).not.toBeNull();
  });

  it("TC-COMP-SEM-04: 範囲指定が 4 月の有効な日のみの場合は有効", () => {
    expect(validateCronExpression("0 9 28-30 4 *")).toBeNull();
  });

  it("TC-COMP-SEM-05: ステップ展開後に 2 月に存在しない日が含まれる場合はエラー", () => {
    // */10 → [1, 11, 21, 31] を展開、2月31日は存在しない
    expect(validateCronExpression("0 9 */10 2 *")).not.toBeNull();
  });

  it("TC-COMP-SEM-06: ステップ展開後が全て 2 月に存在する場合は有効", () => {
    // */7 → [1, 8, 15, 22, 29] を展開、2月29日は閏年扱いで有効
    expect(validateCronExpression("0 9 */7 2 *")).toBeNull();
  });

  it("TC-COMP-SEM-07: 月フィールドがカンマ区切りで、組み合わせに存在しない日がある場合はエラー", () => {
    // 4月・6月・9月・11月は30日まで、31日は存在しない
    expect(validateCronExpression("0 9 31 4,6 *")).not.toBeNull();
  });

  it("TC-COMP-SEM-08: weekday 指定ありの場合は意味論チェックをスキップ", () => {
    // weekday 指定時は月末日チェック対象外（既存挙動に影響しない）
    expect(validateCronExpression("0 9 30,31 2 1")).toBeNull();
  });
});
```

---

## 4. 苦戦箇所記録（前回タスクからの知見）

### TASK-CRON-SEMANTIC-VALIDATION-001 での苦戦箇所と解決策

#### Phase 11: スクリーンショット取得の CI 自動化

**苦戦した理由**: Phase 11 の手動テスト成果物としてスクリーンショットが求められるが、Electron アプリを起動する環境（GUI）が CI 環境では用意できない。

**採った解決策**: Phase 11 の成果物では「スクリーンショット取得は N/A」と明記し、代わりに Vitest の全テスト PASS 結果とエラーメッセージ表示の確認コマンド出力を証跡として記録した。

**将来への知見**: non_visual タスクでは Phase 11 のスクリーンショット要件を最初から N/A として仕様書に記載し、代替証跡の形式（コマンド出力・テスト結果）を Phase 1 の受け入れ基準に含めておくことで、Phase 11 での手戻りを防ぐ。

#### Phase 進捗表の同期漏れ

**苦戦した理由**: Phase 1〜12 の進捗表（`index.md` の `ステータス` 列）を実装完了時に `completed` へ同期し忘れるケースがあった。

**採った解決策**: 各 Phase 完了時に Phase ファイルの `ステータス` フィールドと `index.md` の進捗表の両方を同時に更新するチェックを Phase 完了条件に明示した。

**将来への知見**: タスク仕様書の Phase 完了条件チェックリストに「`index.md` の進捗表を `completed` に更新した」を必須項目として追加することで、同期漏れを防ぐ。

---

## 5. 受け入れ基準

- [ ] `validateCronSemantics()` がカンマ区切り日フィールド（例: `1,30`）を展開して月末日チェックを実行する
- [ ] `validateCronSemantics()` が範囲指定日フィールド（例: `29-31`）を展開して月末日チェックを実行する
- [ ] `validateCronSemantics()` がステップ指定日フィールド（例: `*/10`）を展開して月末日チェックを実行する
- [ ] `validateCronSemantics()` が月フィールドにも複合指定（例: `4,6`）を展開して全組み合わせをチェックする
- [ ] weekday フィールドが `*` 以外の場合は意味論チェックをスキップする（既存挙動維持）
- [ ] 既存テスト（TC-EDGE, TC-LEAP, TC-COMP, TC-REG）が全件 PASS する
- [ ] 新規テスト（TC-COMP-SEM-01〜08）が全件 PASS する
- [ ] `validateCronExpression("0 9 30,31 2 *")` がエラーを返す
- [ ] `validateCronExpression("0 9 1,15 2 *")` が `null`（有効）を返す（既存挙動に影響しない）
- [ ] TypeScript 型チェック PASS（`pnpm --filter @repo/desktop typecheck`）
- [ ] ESLint PASS（`pnpm --filter @repo/desktop lint`）
- [ ] UI コンポーネント（`ScheduleDialog` / `ConversationRoundStep`）への変更は不要

---

## 関連情報

| 項目               | 内容                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| 関連 Issue         | GitHub Issue #2082 の延長改善                                                                        |
| 親タスク           | TASK-CRON-SEMANTIC-VALIDATION-001                                                                    |
| 対象ファイル       | `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`                                         |
| 関連テスト         | `apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts`                              |
| 現在の制約コメント | `// 単純な数値 かつ weekday が "*" の場合のみ意味論チェックを実行`（scheduleConfigValidator.ts L95） |
