# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 値                                |
| ---------- | --------------------------------- |
| Phase番号  | 7                                 |
| タスクID   | TASK-CRON-SEMANTIC-VALIDATION-001 |
| 機能名     | TASK-CRON-SEMANTIC-VALIDATION-001 |
| 前提Phase  | Phase 6: ユニットテスト実装       |
| 後続Phase  | Phase 8: リファクタリング         |
| ステータス | completed                         |
| 作成日     | 2026-04-12                        |

---

## 目的

`validateCronExpression` 関数に意味論的バリデーション（`validateCronSemantics`）を追加した実装について、テストカバレッジが品質基準を満たしていることを確認する。新規コードの80%以上（推奨90%）のカバレッジを達成し、既存コードの回帰カバレッジも維持する。

---

## 実行タスク

1. カバレッジレポートを取得する
2. カバレッジ数値を確認する
3. 不足カバレッジを特定する
4. 不足時は Phase 6 に差し戻してテストを追加する

### Task 7-1: カバレッジレポートの取得

対象ファイル `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts` に対してVitestカバレッジを実行し、レポートを取得する。

```bash
pnpm --filter @repo/desktop exec vitest run --coverage \
  apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts \
  apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts
```

### Task 7-2: カバレッジ数値の確認

カバレッジレポートから以下の数値を確認する。

| メトリクス        | 最低基準 | 推奨目標 |
| ----------------- | -------- | -------- |
| ライン (Line)     | 80%      | 90%      |
| ブランチ (Branch) | 80%      | 90%      |
| 関数 (Function)   | 80%      | 90%      |
| 文 (Statement)    | 80%      | 90%      |

### Task 7-3: 不足カバレッジの特定

カバレッジレポートのuncoveredラインを確認し、不足しているテストケースを特定する。

### Task 7-4: テスト補完（必要な場合）

カバレッジが最低基準（80%）を下回る場合は、不足テストを Phase 6 担当に差し戻すか、補完テストを追加する。

---

## 参照資料

| 参照資料               | パス                                        | 説明           |
| ---------------------- | ------------------------------------------- | -------------- |
| 拡張テストケース       | `outputs/phase-6/expanded-test-cases.md`    | Phase 6 成果物 |
| 回帰テスト結果         | `outputs/phase-6/regression-test-result.md` | Phase 6 成果物 |
| UIエラー表示テスト結果 | `outputs/phase-6/ui-error-display-test.md`  | Phase 6 成果物 |

## 実行手順

### Step 1: カバレッジ実行

```bash
pnpm --filter @repo/desktop exec vitest run --coverage \
  apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts \
  apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts
```

### Step 2: HTMLレポート確認（オプション）

```bash
# HTMLレポートが生成される場合
open apps/desktop/coverage/index.html
```

### Step 3: 重点確認箇所

以下の関数・ブランチが確実にカバーされているか確認する。

| 確認対象                                     | テストケース例              |
| -------------------------------------------- | --------------------------- |
| `validateCronSemantics` - 正常系             | 有効なcron式（`0 9 1 * *`） |
| `validateCronSemantics` - 2月31日            | `0 9 31 2 *`（エラー期待）  |
| `validateCronSemantics` - 2月29日            | `0 9 29 2 *`（正常通過）    |
| `validateCronSemantics` - 2月30日            | `0 9 30 2 *`（エラー期待）  |
| `validateCronSemantics` - 2月31日            | `0 9 31 2 *`（エラー期待）  |
| 既存 `validateCronExpression` - 構文チェック | 4フィールド入力             |
| 既存 `validateCronExpression` - 値域チェック | 範囲外の値                  |

### Step 4: カバレッジ結果の記録

カバレッジ数値を `outputs/phase-7/coverage-report.md` に記録する。

```markdown
# カバレッジレポート (Phase 7)

## 実行日時

YYYY-MM-DD HH:mm

## 数値サマリ

| メトリクス | 実測値 | 基準 | 判定      |
| ---------- | ------ | ---- | --------- |
| Line       | XX%    | 80%  | PASS/FAIL |
| Branch     | XX%    | 80%  | PASS/FAIL |
| Function   | XX%    | 80%  | PASS/FAIL |
| Statement  | XX%    | 80%  | PASS/FAIL |

## 未カバー箇所

- （行番号とコード内容を記載）
```

---

## 統合テスト連携【必須】

Phase 7 のカバレッジ確認結果は、後続 Phase の統合テスト・品質保証フェーズに連携する。

- カバレッジ数値は `outputs/phase-7/coverage-report.md` に保存し、Phase 9（品質保証）で参照する。
- 未カバー箇所が検出された場合、Phase 8（リファクタリング）またはフィードバックとして前フェーズへ戻す。

---

## 成果物

| ファイル                             | 説明                               |
| ------------------------------------ | ---------------------------------- |
| `outputs/phase-7/coverage-report.md` | カバレッジ数値・判定結果           |
| `outputs/phase-7/uncovered-lines.md` | 未カバー箇所の詳細（存在する場合） |

---

## 完了条件

- [ ] `validateCronSemantics` 関数のラインカバレッジが80%以上
- [ ] `validateCronSemantics` 関数のブランチカバレッジが80%以上
- [ ] 2月29日が正常通過し、2月30日・31日が拒否されるテストが全てカバーされている
- [ ] 既存の `validateCronExpression` の回帰カバレッジが低下していない
- [ ] カバレッジレポートが `outputs/phase-7/coverage-report.md` に保存済み
- [ ] カバレッジ数値が推奨90%以上であれば EXCELLENT として記録

---

## サブタスク管理

| サブタスクID | 内容                     | ステータス |
| ------------ | ------------------------ | ---------- |
| 7-1          | カバレッジレポートの取得 | pending    |
| 7-2          | カバレッジ数値の確認     | pending    |
| 7-3          | 不足カバレッジの特定     | pending    |
| 7-4          | テスト補完（必要な場合） | pending    |

---

## タスク100%実行確認【必須】

Phase 7 完了前に以下を全て確認すること。

- [ ] 全サブタスク（7-1〜7-4）が完了またはスキップ理由が記録されている
- [ ] カバレッジ数値が最低基準（80%）を満たしている
- [ ] 成果物ファイルが全て `outputs/phase-7/` に保存されている
- [ ] Phase 8 への引き継ぎ情報（不足カバレッジ・リファクタリング候補）が記録されている

---

## 次のPhase

**Phase 8: リファクタリング**

- カバレッジ結果をもとにコードの重複除去・整理を実施する。
- 未カバー箇所が存在する場合は、Phase 8 の中でテスト補完の優先度を上げる。
