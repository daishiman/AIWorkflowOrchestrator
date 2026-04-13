# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| Phase      | 12                                       |
| タスクID   | TASK-CRON-CONVERTER-WEEKDAYS-GUARD-001   |
| 機能名     | cronConverter weekdays=[] ガード処理追加 |
| 前提Phase  | Phase 11                                 |
| 後続Phase  | Phase 13                                 |
| 作成日     | 2026-04-12                               |
| ステータス | completed                                |

## 目的

task-specification-creator / aiworkflow-requirements の正本を照合し、Phase 12 canonical 6成果物を過不足なく揃える。変更範囲が `cronConverter.ts` 内に閉じる限り system spec 更新は N/A とし、共有/public contract に昇格する場合のみ追記する。

## 実行オーケストレーション

| SubAgent | 主担当                                  | 並列条件         |
| -------- | --------------------------------------- | ---------------- |
| A        | `implementation-guide.md` Part 1 草案   | B と並列可       |
| B        | `implementation-guide.md` Part 2 草案   | A と並列可       |
| C        | `system-spec-update-summary.md`         | A/B 完了後       |
| D        | `documentation-changelog.md`            | C 完了後に並列可 |
| E        | `unassigned-task-detection.md`          | C 完了後に並列可 |
| F        | `skill-feedback-report.md`              | C 完了後に並列可 |
| G        | `phase12-task-spec-compliance-check.md` | D/E/F 完了後     |

## 必須 6 タスク

### Task 12-1: 実装ガイド作成

#### Part 1: 中学生向け説明

**cronConverter の weekdays=[] ガードとは？**

cron 式は、「いつ動かすか」を文字で表す決まりごとです。たとえば `"0 9 * * 1,2,3,4,5"` は「月〜金曜の朝 9 時に動かす」という意味です。

今回の修正は、「毎週実行する設定なのに、曜日を 1 つも選んでいない」ケースを止めるものです。曜日が 0 個だと、アラームを鳴らす日が 1 日もないのと同じで、予定として成立しません。UI では先に防いでいても、`cronConverter.ts` 自体が自分で安全確認しないと、直接呼ばれたときに壊れた cron を返してしまいます。

修正後は、曜日が空ならその場でエラーを返し、壊れた式を作る前に問題を伝えます。

**専門用語の説明：**

- **cron 式**: 定期実行のスケジュールを表す文字列（`"0 9 * * 1"` = 毎週月曜9時）
- **ガード処理**: 不正な入力を早期に検出してエラーを投げる処理
- **単一責任原則**: 1つの関数・クラスは1つのことだけに責任を持つというルール
- **InvalidConfigError**: 設定値が無効な場合に投げるカスタムエラークラス

#### Part 2: 技術者向け説明

**公開 API:**

```typescript
visualConfigToCron(config: VisualCronConfig): string
```

**変更概要：**

`apps/desktop/src/renderer/utils/cronConverter.ts` の `visualConfigToCron()` に `weekdays: []` ガードを追加する。`frequency === "weekly"` の処理ブロック内で `config.weekdays.length === 0` を確認し、空配列の場合は `InvalidConfigError` をスローする。`InvalidConfigError` は `cronConverter.ts` 内に閉じ、共有化しない。

**新規定義：**

```typescript
export class InvalidConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidConfigError";
  }
}
```

**ガード処理：**

```typescript
if (config.weekdays.length === 0) {
  throw new InvalidConfigError(
    "weekdays must not be empty when frequency is 'weekly'",
  );
}
```

**JSDoc 追加：**

```typescript
* @throws {InvalidConfigError} frequency が "weekly" のとき weekdays が空配列の場合
```

**入力フィールド：**

| フィールド   | 型                              | 役割                               |
| ------------ | ------------------------------- | ---------------------------------- |
| `frequency`  | `VisualCronConfig["frequency"]` | 週次ガードの発火条件を含む         |
| `weekdays`   | `number[]`                      | `weekly` 時に曜日を表す配列        |
| `hour`       | `number`                        | 変換後 cron の時刻                 |
| `minute`     | `number`                        | 変換後 cron の分                   |
| `dayOfMonth` | `number`                        | 既存の変換ロジックを維持する入力値 |

**固定値と契約：**

| 項目             | 値                                                        | 役割                   |
| ---------------- | --------------------------------------------------------- | ---------------------- |
| 発火条件         | `"weekly"`                                                | ガードを有効にする条件 |
| エラー名         | `"InvalidConfigError"`                                    | 例外種別の識別         |
| エラーメッセージ | `"weekdays must not be empty when frequency is 'weekly'"` | 期待するメッセージ     |

**使用例：**

```typescript
visualConfigToCron({
  frequency: "weekly",
  weekdays: [1, 2, 3, 4, 5],
  hour: 9,
  minute: 0,
  dayOfMonth: 1,
});
// => "0 9 * * 1,2,3,4,5"
```

```typescript
visualConfigToCron({
  frequency: "weekly",
  weekdays: [],
  hour: 9,
  minute: 0,
  dayOfMonth: 1,
});
// => InvalidConfigError
```

**テスト結果：**

| 入力                        | 期待結果                  | 結果 |
| --------------------------- | ------------------------- | ---- |
| `weekdays: []`              | `InvalidConfigError`      | ✓    |
| `weekdays: [0]`             | `"0 9 * * 0"`             | ✓    |
| `weekdays: [1,2,3,4,5]`     | `"0 9 * * 1,2,3,4,5"`     | ✓    |
| `weekdays: [0,1,2,3,4,5,6]` | `"0 9 * * 0,1,2,3,4,5,6"` | ✓    |

**エッジケース：**

| ケース                     | 期待動作                      |
| -------------------------- | ----------------------------- |
| `frequency !== "weekly"`   | 既存ロジックをそのまま維持    |
| `weekdays` が空配列        | `InvalidConfigError` をスロー |
| `weekdays` が 1 件以上ある | 既存の sort/join 結果を維持   |

### Task 12-2: システム仕様更新

#### Step 1-A: 完了タスク記録・関連リンク更新

- `docs/30-workflows/task-cron-converter-weekdays-guard/index.md` のステータスを `Phase 12 完了（PR 未作成）` へ更新
- `docs/30-workflows/unassigned-task/task-cron-converter-weekdays-guard.md` に完了注記を追加し、`status: open` から完了状態へ更新
- LOGS.md / topic-map.md が対象ファイルに存在しない場合は N/A として記録

#### Step 1-B: 実装状況テーブル更新

- TASK-CRON-CONVERTER-WEEKDAYS-GUARD-001 の実装状況を `spec_created` → `completed` へ更新

#### Step 1-C: 関連タスク確認

| タスク                            | 依存関係                 | ステータス更新                       |
| --------------------------------- | ------------------------ | ------------------------------------ |
| TASK-CRON-SEMANTIC-VALIDATION-001 | 本タスク完了後に着手推奨 | `ready` 判定記録（実着手は別タスク） |

#### Step 2: 仕様更新の要否判定

| 判定                                                   | 対応                                                                                      |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `InvalidConfigError` を `cronConverter.ts` 内に閉じる  | `aiworkflow-requirements` は更新しない。`N/A` と記録する                                  |
| `InvalidConfigError` を共有/public contract に昇格する | 公開 API 名・import 経路・影響範囲・`@throws` 契約を `aiworkflow-requirements` に追記する |

### Task 12-3: 更新履歴作成

`documentation-changelog.md` を生成し、Task 12-1〜12-2 の決定内容と成果物の差分を 1 ファイルで追跡できる形にまとめる。

### Task 12-4: 未タスク検出

TASK-CRON-CONVERTER-WEEKDAYS-GUARD-001 の実装中に発見した未着手タスクを検出する。0 件でも `unassigned-task-detection.md` を出力する。

### Task 12-5: スキルフィードバック作成

実装・テスト・設計を通じて task-specification-creator / aiworkflow-requirements スキルへの改善提案を記録する。改善点が 0 件でも `skill-feedback-report.md` を出力する。

### Task 12-6: phase12-task-spec-compliance-check

`outputs/phase-12/phase12-task-spec-compliance-check.md` を作成し、Task 12-1〜12-5 が task-specification-creator と aiworkflow-requirements の両方に対して準拠しているかを最終確認する。あわせて、4 条件（矛盾なし・漏れなし・整合性あり・依存関係整合）を判定する。

## 参照資料

| 資料名           | パス                                                 | 用途              |
| ---------------- | ---------------------------------------------------- | ----------------- |
| 手動テスト結果   | `outputs/phase-11/manual-test-result.md`             | Phase 11 成果物   |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`            | Phase 10 成果物   |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md`          | Phase 5 成果物    |
| task-spec 正本   | `.claude/skills/task-specification-creator/SKILL.md` | Phase 12 判定基準 |
| system spec 正本 | `.claude/skills/aiworkflow-requirements/SKILL.md`    | 更新対象基準      |

## 成果物

| 成果物                   | パス                                                     | 説明                         |
| ------------------------ | -------------------------------------------------------- | ---------------------------- |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`               | Part 1/Part 2 構成           |
| システム仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A/1-B/1-C/Step 2 記録 |
| 更新履歴                 | `outputs/phase-12/documentation-changelog.md`            | ドキュメント更新履歴         |
| 未タスク検出             | `outputs/phase-12/unassigned-task-detection.md`          | 検出結果（0件でも作成）      |
| スキルフィードバック     | `outputs/phase-12/skill-feedback-report.md`              | 改善点（0件でも作成）        |
| 仕様準拠チェック         | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 6成果物の整合確認            |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] Task 12-1 実装ガイドが Part 1/Part 2 で完成していること
- [ ] Task 12-2 Step 1-A/1-B/1-C が全て実施され、Step 2 の要否が記録されていること
- [ ] Task 12-3 更新履歴が作成されていること
- [ ] Task 12-4 未タスク検出レポートが作成されていること（0件でも）
- [ ] Task 12-5 フィードバックレポートが作成されていること（0件でも）
- [ ] Task 12-6 仕様準拠チェックが PASS であること
- [ ] 矛盾・漏れがないこと
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. Task 12-1: 実装ガイド作成（Part 1 と Part 2 を並列）
3. Task 12-2: システム仕様更新判定
4. Task 12-3/12-4/12-5: changelog・未タスク・フィードバックを並列出力
5. Task 12-6: 準拠チェック
6. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 13: PR 作成
