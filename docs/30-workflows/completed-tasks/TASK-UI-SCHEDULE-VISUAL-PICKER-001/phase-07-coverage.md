# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase番号  | 7                                    |
| Phase名    | カバレッジ確認                       |
| 前提Phase  | Phase 6: グリーン確認                |
| 後続Phase  | Phase 8: リファクタリング            |
| ステータス | 完了                                 |
| 作成日     | 2026-04-09                           |
| 機能名     | スケジュール設定ビジュアルピッカーUI |

## 目的

変更したファイルの行カバレッジ・分岐カバレッジ・関数カバレッジを計測し、目標値への到達を確認する。計測結果を証跡として記録し、Phase 8（リファクタリング）以降の品質基準として参照できる状態にする。

## カバレッジ計測コマンド

```bash
# 全対象ファイルのカバレッジ計測
pnpm vitest run --coverage

# 特定ファイルのみ計測（cronConverter）
pnpm vitest run --coverage --reporter=verbose apps/desktop/src/renderer/utils/cronConverter.ts

# カバレッジレポートをHTMLで出力
pnpm vitest run --coverage --reporter=html

# カバレッジしきい値を指定して計測（CI用）
pnpm vitest run --coverage --coverage.thresholds.lines=85 --coverage.thresholds.branches=80
```

## カバレッジ目標テーブル

| ファイル                     | Line目標 | Branch目標 | Function目標 | 理由・補足                           |
| ---------------------------- | -------- | ---------- | ------------ | ------------------------------------ |
| `cronConverter.ts`           | 90%      | 85%        | 100%         | 変換ロジックはコアユーティリティ     |
| `cronParser.ts`              | 90%      | 85%        | 100%         | 逆変換は全パターンをテスト必須       |
| `cronHumanizer.ts`           | 85%      | 80%        | 100%         | 自然言語変換は全ロケールを網羅       |
| `scheduleConfigValidator.ts` | 95%      | 90%        | 100%         | issue #2000 の中核ロジック           |
| `VisualCronPicker.tsx`       | 80%      | 75%        | 90%          | UIコンポーネント・条件分岐が複雑     |
| `FrequencySelector.tsx`      | 80%      | 75%        | 90%          | 頻度選択の全選択肢を網羅             |
| `WeekdaySelector.tsx`        | 80%      | 75%        | 90%          | 曜日トグル・バリデーション分岐を網羅 |
| `TimePickerSection.tsx`      | 75%      | 70%        | 85%          | 時・分の選択パターンを網羅           |
| `DayOfMonthSelector.tsx`     | 75%      | 70%        | 85%          | 月次日付選択の境界値を網羅           |
| `CronPreview.tsx`            | 80%      | 75%        | 90%          | 表示モード切替分岐を網羅             |

## 未到達分析セクション

### 目標未達の場合の対処方針

| 状況                                 | 対処方針                                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------ |
| Lineカバレッジが目標を5%未満下回る   | 不足しているテストケースを特定し、Phase 6 に戻って追加テストを実装する         |
| Branchカバレッジが目標を5%以上下回る | 未テストの条件分岐を洗い出し、境界値・エラーケースのテストを補完する           |
| Functionカバレッジが100%未満         | 未テスト関数を特定し、そのテストを追加する（デッドコードの場合は削除を検討）   |
| 計測対象外のファイルがある           | `vitest.config.ts` の `include`/`exclude` 設定を確認し、対象ファイルを追加する |

### 未カバー箇所の分類と優先度

| 分類                   | 優先度 | 対応方針                                      |
| ---------------------- | ------ | --------------------------------------------- |
| エラーハンドリング分岐 | 高     | 必ずテストを追加してカバー（品質リスク）      |
| 正常系のエッジケース   | 中     | 境界値テスト（最大値・最小値）を追加          |
| ログ・デバッグコード   | 低     | `/* istanbul ignore next */` コメントで除外可 |
| 未到達の防衛コード     | 低     | 削除またはコメントで除外を検討                |

## トレーサビリティ網羅率確認

AC-01〜AC-14 の全受入基準がテストでカバーされているかを確認する。

| 受入基準 | テストファイル                    | テストケース概要                                | カバー状況 |
| -------- | --------------------------------- | ----------------------------------------------- | ---------- |
| AC-01    | `FrequencySelector.test.tsx`      | 頻度セレクター（毎日/毎週/毎月/カスタム）が表示 | （未確認） |
| AC-02    | `WeekdaySelector.test.tsx`        | 「毎週」選択時に曜日ボタン表示・複数選択可能    | （未確認） |
| AC-03    | `TimePickerSection.test.tsx`      | 時（0-23）と分（0,5,...,55）が選択可能          | （未確認） |
| AC-04    | `cronConverter.test.ts`           | ビジュアル選択→クロン式変換の正確性             | （未確認） |
| AC-05    | `CronPreview.test.tsx`            | 変換結果のクロン式がプレビューエリアに表示      | （未確認） |
| AC-06    | `scheduleIntegration.test.tsx`    | 生成クロン式が `skill:schedule:add` に渡せる    | （未確認） |
| AC-07    | `VisualCronPicker.test.tsx`       | 既存プリセット機能が維持される                  | （未確認） |
| AC-08    | `WeekdaySelector.test.tsx`        | 無効な組み合わせでエラーメッセージが表示        | （未確認） |
| AC-11    | `scheduleConfigValidator.test.ts` | cronExpression の 5 フィールド構文検証          | （未確認） |
| AC-12    | `scheduleConfigValidator.test.ts` | timezone の IANA 妥当性検証                     | （未確認） |
| AC-13    | `ConversationRoundStep.test.tsx`  | shared validator が wizard で使われる           | （未確認） |
| AC-14    | `ScheduleDialog.test.tsx`         | easy cron input が保存フローに繋がる            | （未確認） |
| AC-09    | （Phase 11: 手動目視確認）        | モバイル・小画面でUIが崩れない                  | Phase 11   |
| AC-10    | （Phase 11: 手動テスト）          | キーボードナビゲーションが可能                  | Phase 11   |

## カバレッジ証跡記録フォーマット

Phase 7 完了時に以下のフォーマットで結果を記録する。

```markdown
## カバレッジ計測結果（Phase 7 完了時記入）

| ファイル                   | Line実績 | Branch実績 | Function実績 | 目標達成 |
| -------------------------- | -------- | ---------- | ------------ | -------- |
| cronConverter.ts           | -        | -          | -            | -        |
| cronParser.ts              | -        | -          | -            | -        |
| cronHumanizer.ts           | -        | -          | -            | -        |
| scheduleConfigValidator.ts | -        | -          | -            | -        |
| VisualCronPicker.tsx       | -        | -          | -            | -        |
| FrequencySelector.tsx      | -        | -          | -            | -        |
| WeekdaySelector.tsx        | -        | -          | -            | -        |
| TimePickerSection.tsx      | -        | -          | -            | -        |
| DayOfMonthSelector.tsx     | -        | -          | -            | -        |
| CronPreview.tsx            | -        | -          | -            | -        |

計測日時: （実行後に記入）
計測コマンド: pnpm vitest run --coverage
```

## 統合テスト連携

| テスト対象                        | カバレッジ確認ポイント                                       |
| --------------------------------- | ------------------------------------------------------------ |
| `scheduleIntegration.test.tsx`    | IPC連携パスが Line/Branch カバレッジに含まれているか確認     |
| モック使用箇所                    | `vi.mock()` で代替されるパスは除外対象として設定されているか |
| `VisualCronPicker` → IPC フルパス | 統合テストで end-to-end のコードパスがカバーされているか     |
| `ConversationRoundStep` validator | 単体テストで cron/timezone の保存前判定がカバーされているか  |

## 多角的チェック観点

| 思考法       | 確認内容                                                                     |
| ------------ | ---------------------------------------------------------------------------- |
| 逆説思考     | カバレッジ100%でも品質が保証されるわけではない（テスト品質も重要）           |
| システム思考 | カバレッジ目標は一括でなくファイル別に設定することで責務を明確にできているか |
| 制約思考     | 外部ライブラリなしで共通 validator を完結できているか                        |
| 水平思考     | HTMLレポートで視覚的に未カバー箇所を確認しているか                           |
| ユーザー思考 | AC-01〜AC-14 の全受入基準がテストで網羅されているかトレーサビリティを確認    |

## 成果物

| 成果物             | パス                                         | 説明                                       |
| ------------------ | -------------------------------------------- | ------------------------------------------ |
| 本仕様書           | `phase-07-coverage.md`                       | カバレッジ確認フェーズ仕様書               |
| カバレッジレポート | `coverage/index.html`（自動生成）            | vitest --coverage で生成されるHTMLレポート |
| 証跡記録           | 本ファイルの「カバレッジ計測結果」セクション | Phase 7 完了時に記入                       |

## 完了条件

- [ ] `pnpm vitest run --coverage` が全テストPASSで完了すること
- [ ] 全対象ファイルのLineカバレッジが目標値に到達していること
- [ ] 全対象ファイルのBranchカバレッジが目標値に到達していること
- [ ] 全対象ファイルのFunctionカバレッジが目標値に到達していること
- [ ] AC-01〜AC-14のトレーサビリティが確認されていること（AC-09・AC-10はPhase 11）
- [ ] 目標未達のファイルがある場合、対処方針と補完テストが記録されていること
- [ ] カバレッジ証跡記録フォーマットが記入されていること
- [ ] `artifacts.json` の Phase 7 ステータスを `"completed"` に更新

## 次のPhase

[Phase 8: リファクタリング →](./phase-08-refactoring.md)
