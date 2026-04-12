# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| Phase      | 11                                       |
| タスクID   | TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001 |
| タスク名   | cronConverter 空曜日ガード処理追加       |
| 前提Phase  | Phase 10                                 |
| 後続Phase  | Phase 12                                 |
| 作成日     | 2026-04-12                               |
| ステータス | 未実施                                   |

## 目的

純粋関数 `visualConfigToCron` のガード処理が正しく動作することを、
自動テストを証跡として確認する。
UIコンポーネントの変更がないため、NON_VISUALテスト方式を採用する。

## 実行タスク

- `cronConverter` 関連テストを実行して PASS を確認する
- ガード処理の存在を CLI で確認する
- 既存テストとの回帰がないことを確認する
- 手動テスト結果と非視覚レビューを記録する

## 統合テスト連携

Phase 10 で確定した AC-1〜AC-5 を手動テストの確認軸として引き継ぐ。
Phase 12 では、今回の NON_VISUAL 判定と補助成果物を記録し、Phase 13 への閉じを準備する。

## タスク種別判定

| 項目                   | 判定                                                    |
| ---------------------- | ------------------------------------------------------- |
| UI変更                 | なし（NON_VISUAL）                                      |
| 純粋関数修正           | あり                                                    |
| スクリーンショット要否 | 不要（NON_VISUAL）                                      |
| 証跡の主ソース         | 自動テスト（cronConverter.edge.test.ts）のPASS/FAIL結果 |

**NON_VISUAL理由**:
本タスクは `cronConverter.ts` という純粋関数ファイルの修正のみであり、
UIコンポーネント・画面表示・CSS・レイアウトへの変更は一切含まない。
スクリーンショットによる目視確認は不要と判断する。

## テスト方式（NON_VISUAL）

NON_VISUALタスクのため、以下の代替証跡を使用する:

1. `pnpm vitest run` の出力（PASS/FAIL 一覧）
2. `grep` コマンドによるガード処理の存在確認
3. 既存テストとの回帰確認結果

## テストシナリオ

### シナリオ A: cronConverter 関連テスト全実行

| 項目         | 内容                                                             |
| ------------ | ---------------------------------------------------------------- |
| シナリオID   | SC-A                                                             |
| 目的         | 全テストケース（既存 + 新規）が PASS することを確認              |
| 実行コマンド | `pnpm vitest run apps/desktop/src/__tests__/utils/cronConverter` |
| 期待結果     | 全テスト PASS（0 failed）                                        |

```bash
pnpm vitest run apps/desktop/src/__tests__/utils/cronConverter
```

**確認ポイント**:

- `cronConverter.edge.test.ts` 内の空曜日ケースが PASS
- `cronConverter.test.ts` 内の既存テストが全件 PASS（回帰なし）

### シナリオ B: ガード処理の存在確認

| 項目         | 内容                                                                  |
| ------------ | --------------------------------------------------------------------- |
| シナリオID   | SC-B                                                                  |
| 目的         | `cronConverter.ts` にガード処理コードが実装されていることを確認       |
| 実行コマンド | `grep -n "weekdays" apps/desktop/src/renderer/utils/cronConverter.ts` |
| 期待結果     | ガード処理（空配列チェックと空文字退避）が含まれていること            |

```bash
grep -n "weekdays\|length\|guard\|empty\|throw\|return" \
  apps/desktop/src/renderer/utils/cronConverter.ts
```

### シナリオ C: 既存テストとの回帰確認

| 項目         | 内容                                                             |
| ------------ | ---------------------------------------------------------------- |
| シナリオID   | SC-C                                                             |
| 目的         | ガード処理追加によって既存の正常ケースが壊れていないことを確認   |
| 実行コマンド | `pnpm vitest run apps/desktop/src/__tests__/utils/cronConverter` |
| 期待結果     | 既存テスト（weekdaysあり等）が引き続き PASS                      |

```bash
# AC-2: weekdays有りケースの確認
pnpm vitest run apps/desktop/src/__tests__/utils/cronConverter \
  --reporter=verbose
```

**確認ポイント**:

- `{ frequency: "weekly", weekdays: [1, 3, 5] }` 等の正常ケースが PASS
- `{ frequency: "daily" }` 等の他frequency種別が PASS

### シナリオ D: エッジケーステスト単体実行

| 項目         | 内容                                                                          |
| ------------ | ----------------------------------------------------------------------------- |
| シナリオID   | SC-D                                                                          |
| 目的         | `cronConverter.edge.test.ts` のエッジケース専用テストを単体確認               |
| 実行コマンド | `pnpm vitest run apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts` |
| 期待結果     | 空曜日ケースのテストが PASS                                                   |

```bash
pnpm vitest run apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts \
  --reporter=verbose
```

## ウォークスルーシナリオ発見事項分類欄

| 発見事項ID | 内容   | 分類（HIGH/MEDIUM/LOW/INFO） | 対処方針 |
| ---------- | ------ | ---------------------------- | -------- |
| -          | 未確認 | -                            | -        |

**HIGH** 問題が発見された場合: Phase 5〜8 に戻り修正する
**MEDIUM/LOW** 問題が発見された場合: Phase 12 の未タスクとして記録する

## スクリーンショット

NON_VISUAL タスクのためスクリーンショットは不要。
代わりに CLI 出力をテキスト証跡として `outputs/phase-11/manual-test-result.md` に記録する。

```
# 期待される CLI 出力（例）
PASS  src/__tests__/utils/cronConverter.edge.test.ts
PASS  src/__tests__/utils/cronConverter.test.ts
...
Test Files  2 passed (2)
Tests       X passed (X)
```

## 参照資料

| 資料名                   | パス                                      | 用途                         |
| ------------------------ | ----------------------------------------- | ---------------------------- |
| Phase 2 設計             | `phase-2-design.md`                       | ガード方針の前提             |
| Phase 6 テスト拡充       | `phase-6-test-expansion.md`               | エッジケース拡充の根拠       |
| Phase 7 カバレッジ確認   | `phase-7-coverage-check.md`               | 回帰なくカバレッジ達成の根拠 |
| Phase 8 リファクタリング | `phase-8-refactoring.md`                  | 変更有無と読みやすさ確認     |
| Phase 9 品質保証         | `phase-9-quality-assurance.md`            | 品質ゲート結果の前提         |
| AC検証詳細               | `outputs/phase-10/ac-verification.md`     | Phase 10 成果物              |
| 最終レビュー結果         | `outputs/phase-10/final-review-result.md` | Phase 10 成果物              |

## 成果物

| 成果物                 | パス                                             | 説明                                     |
| ---------------------- | ------------------------------------------------ | ---------------------------------------- |
| 手動テスト結果         | `outputs/phase-11/manual-test-result.md`         | SC-A〜SC-D の実行結果（CLI出力テキスト） |
| 手動テストレポート     | `outputs/phase-11/manual-test-report.md`         | テスト結果サマリーと判定                 |
| 発見事項一覧           | `outputs/phase-11/discovered-issues.md`          | 発見された問題の分類（0件でも出力）      |
| ビジュアルレビュー記録 | `outputs/phase-11/ui-sanity-visual-review.md`    | NON_VISUALのため代替記録（理由明記）     |
| キャプチャメタデータ   | `outputs/phase-11/phase11-capture-metadata.json` | テスト種別・実行モードの記録             |

### `outputs/phase-11/phase11-capture-metadata.json` 雛形

```json
{
  "taskId": "TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001",
  "phase": 11,
  "mode": "NON_VISUAL",
  "reason": "純粋関数修正のみ。UIコンポーネント変更なし。スクリーンショット不要。",
  "testFiles": [
    "apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts",
    "apps/desktop/src/__tests__/utils/cronConverter.test.ts"
  ],
  "scenarios": ["SC-A", "SC-B", "SC-C", "SC-D"],
  "executedAt": "2026-04-12"
}
```

## 完了条件

- [ ] SC-A〜SC-D が全て実行済み
- [ ] 全テストが PASS している
- [ ] NON_VISUAL の理由が `outputs/phase-11/ui-sanity-visual-review.md` に明記されている
- [ ] HIGH 問題なし（または全て unassigned-task として記録済み）
- [ ] 全成果物（5ファイル）が `outputs/phase-11/` に出力されている

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成（仕様書として記録）
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001
```

## 次Phase

Phase 12: ドキュメント更新
