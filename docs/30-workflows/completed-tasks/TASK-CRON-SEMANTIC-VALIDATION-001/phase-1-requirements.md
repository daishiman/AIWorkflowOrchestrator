# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 1                                         |
| タスクID   | TASK-CRON-SEMANTIC-VALIDATION-001         |
| 機能名     | cronExpression 意味論的バリデーション改善 |
| 前提Phase  | -                                         |
| 後続Phase  | Phase 2                                   |
| ステータス | completed                                 |
| 作成日     | 2026-04-12                                |

---

## 目的

`scheduleConfigValidator.ts` の `validateCronExpression` 関数が抱える意味論的バリデーション欠如の問題を正確に把握し、受け入れ基準を確定する。

---

## 実行タスク

1. **P50チェック**: 既実装コードの調査を行い、現行の `validateCronExpression` 関数の動作を把握する
2. **問題再現確認**: `0 9 31 2 *` が現行バリデーションを通過することを確認する
3. **受け入れ基準（AC）の定義**: 修正後に満たすべき条件を5項目で定義する
4. **実装方式の前提確認**: 外部依存を増やさずに意味論チェックを実装できるかを確認する
5. **タスク分類の確定**: 実装タスク / UIタスクの両面を確認する
6. **トレーサビリティ行列の作成**: 各ACと対象コードの対応を明示する

---

## 参照資料

### 実装・コード

| 資料名                | パス                                                                            | 用途                   |
| --------------------- | ------------------------------------------------------------------------------- | ---------------------- |
| バリデーション関数    | `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`                    | 現行実装の確認         |
| ScheduleDialog        | `apps/desktop/src/renderer/views/ScheduleManager/components/ScheduleDialog.tsx` | エラー表示消費先の確認 |
| ConversationRoundStep | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`   | エラー表示消費先の確認 |
| ユニットテスト        | `apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts`              | 既存テストの確認       |
| エッジテスト          | `apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts`         | 既存テストの確認       |

---

## 実行手順

### 1. P50チェック（既実装コードの調査）

```bash
# 対象ファイルの変更履歴を確認
git log --oneline -10 -- apps/desktop/src/renderer/utils/scheduleConfigValidator.ts

# 現行のvalidateCronExpression実装を確認
grep -n "validateCronExpression\|CronValidation\|semantic" \
  apps/desktop/src/renderer/utils/scheduleConfigValidator.ts

# cronParser / cronConverter の既存実装を確認
grep -n "parse\|validate\|semantic" \
  apps/desktop/src/renderer/utils/cronParser.ts \
  apps/desktop/src/renderer/utils/cronConverter.ts
```

### 2. 問題の再現確認

以下のcron式が現行バリデーションを**通過してしまう**ことを確認する:

| cron式       | 問題                | 期待される動作   |
| ------------ | ------------------- | ---------------- |
| `0 9 31 2 *` | 2月31日は存在しない | エラーを返すべき |
| `0 9 30 2 *` | 2月30日は存在しない | エラーを返すべき |
| `0 9 29 2 *` | 2月29日は存在する   | 正常通過すべき   |

### 3. 受け入れ基準（AC）の定義

| AC番号 | 条件                                                                                                                   | 期待結果                              |
| ------ | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| AC-1   | `validateCronExpression("0 9 31 2 *")` を呼び出した場合                                                                | エラーメッセージを返す（null でない） |
| AC-2   | `validateCronExpression("0 9 30 2 *")` を呼び出した場合                                                                | エラーメッセージを返す                |
| AC-3   | `validateCronExpression("0 9 29 2 *")` を呼び出した場合                                                                | null を返す（正常通過）               |
| AC-4   | `validateCronExpression("0 9 1 2 *")` や `validateCronExpression("0 9 * * *")` を呼び出した場合                        | null を返す（正常通過）               |
| AC-5   | バリデーションエラーが返された場合、ScheduleDialog と ConversationRoundStep のUI上に日本語エラーメッセージが表示される | UIにエラーが表示される                |

### 4. 実装方式の前提確認

- 外部依存は追加しない
- Renderer 環境で動作する純 TypeScript 実装を前提にする
- 2月29日は許容し、2月30日・2月31日といった不可能な日付のみを拒否する

### 5. タスク分類の確定

- **実装タスク**: `validateCronExpression` 関数の拡張（意味論チェック追加）
- **UI回帰タスク**: ScheduleDialog / ConversationRoundStep が新しいエラー文字列をそのまま表示できるか確認
- **テストタスク**: `scheduleConfigValidator.test.ts` と `scheduleConfigValidator.edge.test.ts` の拡張

---

## 統合テスト連携【必須】

- `validateCronExpression` の意味論チェックが構文チェック・値域チェックと正しく連携することを確認する
- ScheduleDialog および ConversationRoundStep がバリデーション結果に基づいてエラーを表示することを確認する
- 既存の構文・値域チェックが意味論チェック追加後も回帰しないことを確認する
- 統合ログは `outputs/phase-1/` に保存する

---

## 成果物

| 成果物               | パス                                         | 説明                   |
| -------------------- | -------------------------------------------- | ---------------------- |
| 要件定義書           | `outputs/phase-1/requirements-definition.md` | 機能要件と非機能要件   |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`     | AC-1〜AC-5の詳細定義   |
| P50チェック結果      | `outputs/phase-1/p50-check-result.md`        | 既実装コード調査結果   |
| トレーサビリティ行列 | `outputs/phase-1/traceability-matrix.md`     | ACと対象コードの対応表 |

---

## 完了条件

- [ ] P50チェックを実施し、現行の `validateCronExpression` の動作を文書化した
- [ ] AC-1〜AC-5 を定義し、全て検証可能な形式で記述した
- [ ] 外部依存を増やさない前提と実装方式を整理した
- [ ] タスク分類（実装 / UI回帰 / テスト）を確定した
- [ ] トレーサビリティ行列を作成した
- [ ] 本Phase内の全タスクを100%実行完了

---

## サブタスク管理

1. P50チェック（既実装コードの調査）
2. 問題の再現確認
3. 受け入れ基準（AC-1〜AC-5）の定義
4. 実装方式の前提確認
5. タスク分類の確定
6. 成果物の出力
7. 完了条件の判定

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/TASK-CRON-SEMANTIC-VALIDATION-001
```

---

## 次のPhase

Phase 2: 設計
