# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 6                                         |
| タスクID   | TASK-CRON-SEMANTIC-VALIDATION-001         |
| 機能名     | cronExpression 意味論的バリデーション改善 |
| 前提Phase  | Phase 5                                   |
| 後続Phase  | Phase 7                                   |
| ステータス | completed                                 |
| 作成日     | 2026-04-12                                |

---

## 目的

Phase 4 で作成した基本テストケース（TC-SV-01〜TC-SV-07）を拡充し、月末日エッジケース・複合フィールド・回帰テスト・UI回帰テストを追加する。テストカバレッジを目標値（`validateCronExpression` 関数全体 90%以上）に到達させる。

---

## 実行タスク

1. **エッジケースの追加**: 月末日テーブル全体のテストケースを追加する
2. **例外日付の確認**: 2月29日は有効、2月30日・2月31日は無効であることを確認する
3. **複合フィールドのテスト追加**: カンマ区切り・範囲指定（`1-5`）を含む日フィールドのテストを追加する
4. **回帰テストの確認**: 既存の構文・値域チェックが壊れていないことを追加テストで保証する
5. **UI回帰テスト**: ScheduleDialog / ConversationRoundStep のエラー表示をテストする
6. **テスト実行と全 Green 確認**: 追加テストを含む全テストが Green であることを確認する

---

## 参照資料

| 参照資料             | パス                                                                                         | 説明             |
| -------------------- | -------------------------------------------------------------------------------------------- | ---------------- |
| テスト仕様書         | `outputs/phase-4/test-specification.md`                                                      | 基本テストケース |
| 実装サマリー         | `outputs/phase-5/implementation-summary.md`                                                  | 実装内容         |
| 変更ファイル一覧     | `outputs/phase-5/changed-files.md`                                                           | 変更対象ファイル |
| 現行テストファイル   | `apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts`                           | 拡充対象         |
| エッジテスト         | `apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts`                      | 拡充対象         |
| UI回帰対象           | `apps/desktop/src/__tests__/views/ScheduleManager/ScheduleDialog.test.tsx`                   | 回帰確認         |
| UI回帰対象           | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` | 回帰確認         |
| テストケーステーブル | `outputs/phase-4/test-case-table.md`                                                         | Phase 4 成果物   |
| Red確認結果          | `outputs/phase-4/red-test-result.md`                                                         | Phase 4 成果物   |
| 実装判断記録         | `outputs/phase-5/library-install-record.md`                                                  | Phase 5 成果物   |

---

## 実行手順

### 1. エッジケース追加（月末日テーブル全体）

各月の最大日数を超える日付がエラーになることをテストする:

| TC番号     | cron式        | 期待結果 | 備考                                 |
| ---------- | ------------- | -------- | ------------------------------------ |
| TC-EDGE-01 | `0 9 32 1 *`  | エラー   | 1月32日は存在しない                  |
| TC-EDGE-02 | `0 9 31 4 *`  | エラー   | 4月31日は存在しない（4月は30日まで） |
| TC-EDGE-03 | `0 9 31 6 *`  | エラー   | 6月31日は存在しない                  |
| TC-EDGE-04 | `0 9 31 9 *`  | エラー   | 9月31日は存在しない                  |
| TC-EDGE-05 | `0 9 31 11 *` | エラー   | 11月31日は存在しない                 |
| TC-EDGE-06 | `0 9 31 1 *`  | null     | 1月31日は有効                        |
| TC-EDGE-07 | `0 9 30 4 *`  | null     | 4月30日は有効                        |
| TC-EDGE-08 | `0 9 31 3 *`  | null     | 3月31日は有効                        |

### 2. 例外日付の確認

2月29日を有効、2月30日・2月31日を無効として扱うことを確認する:

| TC番号     | cron式       | 期待結果 | 備考                |
| ---------- | ------------ | -------- | ------------------- |
| TC-LEAP-01 | `0 9 29 2 *` | null     | 2月29日は有効       |
| TC-LEAP-02 | `0 9 30 2 *` | エラー   | 2月30日は存在しない |
| TC-LEAP-03 | `0 9 31 2 *` | エラー   | 2月31日は存在しない |

### 3. 複合フィールドのテスト追加

カンマ区切り・範囲指定を含む日フィールドのテストを追加する:

| TC番号     | cron式         | 期待結果 | 備考                                          |
| ---------- | -------------- | -------- | --------------------------------------------- |
| TC-COMP-01 | `0 9 1,15 * *` | null     | カンマ区切りの日指定は有効                    |
| TC-COMP-02 | `0 9 1-15 * *` | null     | 範囲指定の日指定は有効                        |
| TC-COMP-03 | `0 9 */5 * *`  | null     | ステップ指定の日指定は有効                    |
| TC-COMP-04 | `0 9 1,15 2 *` | null     | カンマ区切り日 + 月指定（有効な日付のみ含む） |

**設計方針**: カンマ区切り・範囲指定・ステップ指定を含む日フィールドに対する意味論チェックは実装コストが高いため、**スキップ（null を返す）**とする。単純な数値のみの場合に意味論チェックを適用する。

### 4. 回帰テスト追加

既存の構文・値域チェックが意味論チェック追加後も正常動作することを確認する追加テスト:

| TC番号    | cron式       | 期待結果 | 確認内容                                |
| --------- | ------------ | -------- | --------------------------------------- |
| TC-REG-01 | `60 9 * * *` | エラー   | 分フィールドが 60 は値域エラー          |
| TC-REG-02 | `0 24 * * *` | エラー   | 時フィールドが 24 は値域エラー          |
| TC-REG-03 | `0 9 0 * *`  | エラー   | 日フィールドが 0 は値域エラー（1〜31）  |
| TC-REG-04 | `0 9 * 13 *` | エラー   | 月フィールドが 13 は値域エラー          |
| TC-REG-05 | `0 9 * * 8`  | エラー   | 曜日フィールドが 8 は値域エラー（0〜7） |
| TC-REG-06 | `0 9 * * *`  | null     | 全ワイルドカードは有効                  |

### 5. UIコンポーネントのエラー表示テスト

ScheduleDialog / ConversationRoundStep コンポーネントがエラーメッセージを正しく表示することを確認する:

```typescript
// 追加するテストコード概要（Vitest + React Testing Library）
describe("ScheduleDialog / ConversationRoundStep - 意味論エラー表示（AC-5）", () => {
  it("存在しない日付を入力するとエラーメッセージが表示される", async () => {
    // render(<ScheduleDialog ... />)
    // cronExpression を '0 9 31 2 *' に設定
    // エラーメッセージ（日本語）が表示されることを確認
  });

  it("有効なcron式ではエラーメッセージが表示されない", async () => {
    // render(<ConversationRoundStep ... />)
    // cronExpression を '0 9 * * *' に設定
    // エラーメッセージが表示されないことを確認
  });
});
```

**注意**: UIコンポーネントのテストは `@testing-library/react` が利用可能な場合に実施する。利用できない場合は、エラー表示は手動テスト（Phase 11）で確認する。

### 6. テスト実行コマンド

```bash
# 全テストの実行
pnpm --filter @repo/desktop exec vitest run \
  apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts \
  apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts

# カバレッジ計測
pnpm --filter @repo/desktop exec vitest run --coverage \
  apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts \
  apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts
```

期待される結果:

- 全テストケース（TC-SV-01〜07, TC-EDGE-01〜08, TC-LEAP-01〜03, TC-COMP-01〜04, TC-REG-01〜06）が Green
- `validateCronExpression` 関数のカバレッジ 90%以上

---

## 統合テスト連携【必須】

- 全テストケースが Green であることを確認してから Phase 7 に進む
- カバレッジが 90% 未満の場合は追加テストケースを検討する
- UIコンポーネントのテストが実施できない場合は Phase 11 での手動確認計画を立てる
- 統合ログは `outputs/phase-6/` に保存する

---

## 成果物

| 成果物                 | パス                                        | 説明                                          |
| ---------------------- | ------------------------------------------- | --------------------------------------------- |
| 拡張テストケース       | `outputs/phase-6/expanded-test-cases.md`    | TC-EDGE / TC-LEAP / TC-COMP / TC-REG の全一覧 |
| 回帰テスト結果         | `outputs/phase-6/regression-test-result.md` | 既存チェックの回帰確認結果                    |
| UIエラー表示テスト結果 | `outputs/phase-6/ui-error-display-test.md`  | ScheduleDialog / ConversationRoundStep の確認 |

---

## 完了条件

- [ ] TC-EDGE-01〜08（月末日エッジケース）を追加した
- [ ] TC-LEAP-01〜03（2月29日/30日/31日）を追加した
- [ ] TC-COMP-01〜04（複合フィールド）を追加した
- [ ] TC-REG-01〜06（回帰テスト）を追加した
- [ ] UIコンポーネントのエラー表示テストを実施した（または Phase 11 への委託を記録した）
- [ ] 全テストケースが Green であることを確認した
- [ ] `validateCronExpression` 関数のカバレッジが 90% 以上であることを確認した
- [ ] 本Phase内の全タスクを100%実行完了

---

## サブタスク管理

1. Phase 5 成果物の確認
2. エッジケース（月末日テーブル）テストの追加
3. 例外日付テストの追加
4. 複合フィールドテストの追加
5. 回帰テストの追加
6. UIコンポーネントのエラー表示テストの実施
7. 全テスト実行と Green 確認
8. カバレッジ計測
9. 成果物の出力

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 全テストケースが Green であることを確認した
- [ ] カバレッジ目標（90%以上）を達成したことを確認した
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/TASK-CRON-SEMANTIC-VALIDATION-001
```

---

## 次のPhase

Phase 7: カバレッジ確認
