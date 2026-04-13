# Phase 8: リファクタリング

## メタ情報

| 項目       | 値                                |
| ---------- | --------------------------------- |
| Phase番号  | 8                                 |
| タスクID   | TASK-CRON-SEMANTIC-VALIDATION-001 |
| 機能名     | TASK-CRON-SEMANTIC-VALIDATION-001 |
| 前提Phase  | Phase 7: カバレッジ確認           |
| 後続Phase  | Phase 9: 品質保証                 |
| ステータス | completed                         |
| 作成日     | 2026-04-12                        |

---

## 目的

意味論的バリデーション追加後のコードを整理し、保守性・可読性を向上させる。バリデーション処理の3段階フロー（構文チェック → 値域チェック → 意味論的チェック）を明確に整理し、重複コードの除去とエラーメッセージの一元管理を行う。

---

## 実行タスク

### Task 8-1: 重複コードの除去

`scheduleConfigValidator.ts` 内の重複コードを検出し、共通ヘルパー関数として抽出する。

確認観点:

- 月・日の最大値チェック処理の重複
- 意味論チェックの前提判定の重複
- 日本語エラーメッセージの返却パターンの重複

### Task 8-2: バリデーション3段階フローの整理

バリデーション処理を以下の3段階に明確に分離・整理する。

```
Stage 1: 構文チェック（Syntax Validation）
  - フィールド数（5フィールド）の確認
  - 各フィールドの文字種確認

Stage 2: 値域チェック（Range Validation）
  - 分: 0-59
  - 時: 0-23
  - 日: 1-31
  - 月: 1-12 (または JAN-DEC)
  - 曜日: 0-7 (または SUN-SAT)

Stage 3: 意味論的チェック（Semantic Validation）
  - 純 TypeScript の日付テーブルを利用
  - 存在しない日時（例: 2月30日 / 2月31日）の検出
```

### Task 8-3: エラーメッセージ定数の整理

エラーメッセージを定数・i18nキー対応の形式に整理する。

変更記録:

| 対象                   | Before             | After                      | 理由                 |
| ---------------------- | ------------------ | -------------------------- | -------------------- |
| 月ごとの最大日数判定   | 分散した if 文     | `MAX_DAYS_PER_MONTH`       | 重複除去・可読性向上 |
| 意味論チェックの本体   | 分散した条件分岐   | `validateCronSemantics`    | 責務の明確化         |
| エラーメッセージ文字列 | ハードコード文字列 | 単一の日本語メッセージ定数 | 変更容易性           |

### Task 8-4: コメント・JSDoc の整備

各関数に JSDoc コメントを追加する。

```typescript
/**
 * cron式の意味論的バリデーションを実行する
 *
 * 純 TypeScript の日付テーブルを使用して、構文・値域チェックを通過した
 * cron式が実在しない日付を指していないかを検証する。
 *
 * @param fields - 5フィールドに分割済みのcron式
 * @returns バリデーション結果。エラーがない場合は null
 * @example
 * validateCronSemantics(['0', '9', '31', '2', '*']) // → '指定した日付は存在しません（例: 2月31日）'
 * validateCronSemantics(['0', '9', '29', '2', '*'])  // → null
 */
```

---

## 参照資料

| 参照資料           | パス                                        | 説明           |
| ------------------ | ------------------------------------------- | -------------- |
| 実装サマリー       | `outputs/phase-5/implementation-summary.md` | Phase 5 成果物 |
| 変更ファイル一覧   | `outputs/phase-5/changed-files.md`          | Phase 5 成果物 |
| 実装判断記録       | `outputs/phase-5/library-install-record.md` | Phase 5 成果物 |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`        | Phase 7 成果物 |
| 未カバー箇所       | `outputs/phase-7/uncovered-lines.md`        | Phase 7 成果物 |

## 実行手順

### Step 1: 現状把握

Phase 7 のカバレッジレポートを参照し、リファクタリング対象箇所を特定する。

### Step 2: 重複除去

重複コードを共通ヘルパーに抽出する。この際、テストが全て通ることを確認しながら小さい変更を繰り返す（安全なリファクタリング）。

```bash
# リファクタリング中のテスト確認（ウォッチモード）
pnpm --filter @repo/desktop exec vitest watch \
  apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts \
  apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts
```

### Step 3: フロー整理

3段階フローが関数・コメントから明確に読み取れるよう整理する。

### Step 4: エラーメッセージ定数化

エラーメッセージを `CRON_VALIDATION_ERRORS` 定数オブジェクトにまとめる。

### Step 5: JSDoc 追加

全公開関数に JSDoc コメントを追加する。

### Step 6: 最終テスト確認

リファクタリング後に全テストが通ることを確認する。

```bash
pnpm --filter @repo/desktop exec vitest run \
  apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts \
  apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts
```

---

## 統合テスト連携【必須】

- リファクタリング後も Phase 7 で確認したカバレッジ数値を維持すること。
- エラーメッセージ定数変更が UI コンポーネント（ScheduleDialog・ConversationRoundStep）のエラー表示に影響しないか確認し、破壊的変更がある場合は Phase 9（品質保証）で検証する。

---

## 成果物

| ファイル                                 | 説明                                       |
| ---------------------------------------- | ------------------------------------------ |
| `outputs/phase-8/refactoring-summary.md` | 変更箇所サマリ・変更記録テーブル           |
| `outputs/phase-8/before-after-diff.md`   | リファクタリング前後の差分記録（主要部分） |

---

## 完了条件

- [ ] 重複コードが除去されている
- [ ] バリデーション3段階フロー（構文・値域・意味論）が明確に分離されている
- [ ] エラーメッセージが定数として一元管理されている
- [ ] 全公開関数に JSDoc コメントが追加されている
- [ ] リファクタリング後も全ユニットテストが通過している
- [ ] リファクタリング後のカバレッジが Phase 7 の数値以上を維持している
- [ ] 変更記録テーブルが `outputs/phase-8/refactoring-summary.md` に保存されている

---

## サブタスク管理

| サブタスクID | 内容                            | ステータス |
| ------------ | ------------------------------- | ---------- |
| 8-1          | 重複コードの除去                | pending    |
| 8-2          | バリデーション3段階フローの整理 | pending    |
| 8-3          | エラーメッセージ定数の整理      | pending    |
| 8-4          | コメント・JSDoc の整備          | pending    |

---

## タスク100%実行確認【必須】

Phase 8 完了前に以下を全て確認すること。

- [ ] 全サブタスク（8-1〜8-4）が完了またはスキップ理由が記録されている
- [ ] リファクタリング後に全ユニットテストがグリーン
- [ ] 成果物ファイルが全て `outputs/phase-8/` に保存されている
- [ ] Phase 9 への引き継ぎ情報（変更内容・潜在的影響箇所）が記録されている

---

## 次のPhase

**Phase 9: 品質保証**

- リファクタリング後の全体品質（型チェック・Lint・パフォーマンス・バンドルサイズ）を検証する。
