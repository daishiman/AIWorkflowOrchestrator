# Phase 5: 実装

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 5                                         |
| タスクID   | TASK-CRON-SEMANTIC-VALIDATION-001         |
| 機能名     | cronExpression 意味論的バリデーション改善 |
| 前提Phase  | Phase 4                                   |
| 後続Phase  | Phase 6                                   |
| ステータス | completed                                 |
| 作成日     | 2026-04-12                                |

---

## 目的

Phase 4 で Red 確認したテストを Green にするための最小限の実装を行う。`validateCronExpression` 関数に意味論的バリデーション（存在しない日付の検出）を追加し、既存のエラー表示消費先が新しいメッセージをそのまま拾える状態にする。

---

## 実行タスク

1. **`validateCronSemantics` 関数の実装**: `scheduleConfigValidator.ts` に意味論チェック関数を追加する
2. **`validateCronExpression` の拡張**: Stage 3（意味論チェック）を呼び出すよう拡張する
3. **`validateCronExpression` の契約維持**: 既存の `string | null` 戻り値を維持する
4. **UI影響の確認**: ScheduleDialog / ConversationRoundStep の既存エラー表示が新しいメッセージを拾うことを確認する
5. **ブラウザ環境での動作確認**: Electron Renderer でバリデーションが正常動作することを確認する
6. **テスト Green 確認**: TC-SV-01〜TC-SV-07 が Green になることを確認する

---

## 参照資料

| 参照資料                 | パス                                                                            | 説明                                          |
| ------------------------ | ------------------------------------------------------------------------------- | --------------------------------------------- |
| バリデーションフロー設計 | `outputs/phase-2/validation-flow-design.md`                                     | 3段階バリデーション設計                       |
| 実装方式設計             | `outputs/phase-2/library-selection-design.md`                                   | 純TS実装の選定結果                            |
| 関数シグネチャ設計       | `outputs/phase-2/type-definition-design.md`                                     | validateCronSemantics 定義                    |
| UI影響設計               | `outputs/phase-2/ui-integration-design.md`                                      | ScheduleDialog / ConversationRoundStep の影響 |
| テスト仕様書             | `outputs/phase-4/test-specification.md`                                         | Green にすべきテストケース                    |
| 変更対象ファイル         | `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`                    | 主要変更対象                                  |
| ScheduleDialog           | `apps/desktop/src/renderer/views/ScheduleManager/components/ScheduleDialog.tsx` | 既存UIの確認                                  |
| ConversationRoundStep    | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`   | 既存UIの確認                                  |
| テストケーステーブル     | `outputs/phase-4/test-case-table.md`                                            | Phase 4 成果物                                |
| Red確認結果              | `outputs/phase-4/red-test-result.md`                                            | Phase 4 成果物                                |

---

## 実行手順

### 1. `scheduleConfigValidator.ts` の変更概要

**変更対象ファイル**: `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`

変更内容の概要:

- `validateCronSemantics(fields: string[]): string | null` の追加
- `validateCronExpression` から Stage 3 を呼び出す分岐の追加
- `MAX_DAYS_PER_MONTH` 定数の追加（2月29日を有効扱い）
- public contract は `string | null` のまま維持

月ごとの最大日数テーブル:

| 月  | 最大日数 | 備考              |
| --- | -------- | ----------------- |
| 1   | 31       | 1月               |
| 2   | 29       | 2月（29日を許容） |
| 3   | 31       | 3月               |
| 4   | 30       | 4月               |
| 5   | 31       | 5月               |
| 6   | 30       | 6月               |
| 7   | 31       | 7月               |
| 8   | 31       | 8月               |
| 9   | 30       | 9月               |
| 10  | 31       | 10月              |
| 11  | 30       | 11月              |
| 12  | 31       | 12月              |

### 2. `validateCronExpression` の拡張方針

既存の関数末尾に Stage 3 の呼び出しを追加する:

```
validateCronExpression(value):
  [既存] Stage 1: 空文字チェック → エラーなら return
  [既存] Stage 2: 値域チェック → エラーなら return
  [新規] Stage 3: validateCronSemantics(trimmed) → エラーなら return
  return null
```

**制約**: 既存の関数シグネチャ `(value: string): string | null` は変更しない。

### 3. canUseTool 適用範囲

このタスクは非 SDK タスクであるため、`canUseTool` の適用は **N/A**。

### 4. 変更ファイル一覧

| ファイル                                                                                     | 変更種別         | 変更内容               |
| -------------------------------------------------------------------------------------------- | ---------------- | ---------------------- |
| `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`                                 | 修正             | 意味論チェック追加     |
| `apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts`                           | 修正             | 既存ユニットテスト拡張 |
| `apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts`                      | 修正             | エッジケース拡張       |
| `apps/desktop/src/__tests__/views/ScheduleManager/ScheduleDialog.test.tsx`                   | 修正（条件付き） | 保存ブロック回帰確認   |
| `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` | 修正（条件付き） | Q3 回帰確認            |

### 5. テスト Green 確認

```bash
# 実装後にテストを実行して Green を確認する
pnpm --filter @repo/desktop exec vitest run \
  apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts \
  apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts

# 期待される結果: TC-SV-01〜TC-SV-07 が全て PASS になること
```

---

## 統合テスト連携【必須】

- `validateCronExpression('0 9 31 2 *')` がエラーを返すことを確認する（AC-1）
- `validateCronExpression('0 9 30 2 *')` がエラーを返すことを確認する（AC-2）
- `validateCronExpression('0 9 29 2 *')` が null を返すことを確認する（AC-3）
- `validateCronExpression('0 9 * * *')` が null を返すことを確認する（AC-4）
- ScheduleDialog / ConversationRoundStep でエラーメッセージが表示されることを確認する（AC-5）
- 既存の構文・値域チェックが回帰していないことを確認する
- 統合ログは `outputs/phase-5/` に保存する

---

## 成果物

| 成果物           | パス                                        | 説明                             |
| ---------------- | ------------------------------------------- | -------------------------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 実装内容の要約と判断事項         |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | 変更したファイルと変更内容の一覧 |
| 実装判断記録     | `outputs/phase-5/library-install-record.md` | 純TS実装の選定結果と判断理由     |

---

## 完了条件

- [ ] 純TSの手動実装を完了した
- [ ] `validateCronSemantics` 関数を実装した
- [ ] `validateCronExpression` に Stage 3 の呼び出しを追加した
- [ ] ScheduleDialog / ConversationRoundStep のエラー表示が意味論エラーを表示することを確認した
- [ ] TC-SV-01〜TC-SV-03 が Green になったことを確認した
- [ ] TC-SV-04〜TC-SV-07 が引き続き Green であることを確認した（回帰なし）
- [ ] ブラウザ（Electron Renderer）環境での動作を確認した
- [ ] 本Phase内の全タスクを100%実行完了

---

## サブタスク管理

1. `validateCronSemantics` の実装
2. `validateCronExpression` の拡張
3. ScheduleDialog / ConversationRoundStep への影響確認
4. テスト Green 確認
5. 成果物の出力

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] TC-SV-01〜TC-SV-07 が全て Green であることを確認した
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/TASK-CRON-SEMANTIC-VALIDATION-001
```

---

## 次のPhase

Phase 6: テスト拡充
