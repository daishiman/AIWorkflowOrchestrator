# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 8                                       |
| Phase名    | リファクタリング                        |
| 前提Phase  | Phase 7（カバレッジ確認）               |
| 後続Phase  | Phase 9                                 |
| ステータス | 未実施                                  |
| 作成日     | 2026-04-13                              |
| 機能名     | TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001 |

---

## 目的

Phase 5 で実装したガード処理のコードを見直し、簡潔さ・可読性・`weekly` ガードとの
対称性を最終確認する。不要なリファクタリングは行わず、必要な改善のみ実施する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: コードレビュー

**目的**: 実装コードを多角的に確認する

**実行手順**:

1. `apps/desktop/src/renderer/utils/cronConverter.ts` の `monthly` 分岐を確認する
2. 以下の観点でレビューする:

   | 観点       | チェック内容                                              |
   | ---------- | --------------------------------------------------------- |
   | 対称性     | `weekly` ガードとコードパターンが一致しているか           |
   | 可読性     | ガード条件が理解しやすいか                                |
   | 簡潔さ     | 不要なロジックが含まれていないか                          |
   | JSDoc      | `@returns` と `@remarks` が適切に記述されているか（AC-7） |
   | 整数判定   | `Number.isInteger(dayOfMonth)` が契約に沿って妥当か       |
   | 対称性補強 | `weekly` と同様に判定責務が明確で読みやすいか             |

3. レビュー結果を記録する

**期待される成果物**:

- `outputs/phase-8/code-review.md`（コードレビュー結果）

---

### タスク2: リファクタリング実施（必要な場合のみ）

**目的**: レビューで指摘された問題を修正する

**実行手順**:

1. タスク1のレビュー結果を確認する
2. 修正が必要な場合のみ実施する（不必要な変更は行わない）
3. 修正後にテストを実行して全件グリーンを確認する:
   ```bash
   pnpm vitest run apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts
   ```

**期待される成果物**:

- 修正がある場合: `apps/desktop/src/renderer/utils/cronConverter.ts` の変更（コード成果物）
- `outputs/phase-8/refactoring-result.md`（リファクタリング結果記録）

---

### タスク3: 再テスト確認

**目的**: リファクタリング後もテスト全件グリーンであることを確認する

**実行手順**:

1. テストを実行する:
   ```bash
   pnpm --filter @repo/desktop test
   ```
2. 全テストが Green であることを確認する
3. 結果を記録する

**期待される成果物**:

- `outputs/phase-8/retest-result.md`（再テスト確認結果）

---

## 参照資料

| 参照資料       | パス                                               | 内容               |
| -------------- | -------------------------------------------------- | ------------------ |
| 実装ファイル   | `apps/desktop/src/renderer/utils/cronConverter.ts` | レビュー対象       |
| weekly ガード  | `apps/desktop/src/renderer/utils/cronConverter.ts` | 対称性確認の参照元 |
| Phase 7 成果物 | `outputs/phase-7/coverage-report.md`               | カバレッジ確認     |

---

## 成果物

| 成果物               | パス                                    | 内容                             |
| -------------------- | --------------------------------------- | -------------------------------- |
| コードレビュー結果   | `outputs/phase-8/code-review.md`        | レビュー観点・判定               |
| リファクタリング結果 | `outputs/phase-8/refactoring-result.md` | 変更内容（変更なしの場合も記録） |
| 再テスト確認結果     | `outputs/phase-8/retest-result.md`      | テスト全件グリーン確認           |

---

## 統合テスト連携

- リファクタリング後も TC-11〜TC-15 と既存テスト全件がグリーンであることを確認する

---

## TDD 検証（Phase 8）

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm vitest run apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts
```

**確認項目**:

- [ ] リファクタリング後もテストが成功することを確認

---

## 完了条件

- [ ] `monthly` 分岐のコードレビューが完了している
- [ ] `weekly` ガードとの対称性が確認されている
- [ ] 必要なリファクタリングが完了している（または不要と判定されている）
- [ ] リファクタリング後のテスト全件グリーンが確認されている
- [ ] `outputs/phase-8/` 配下の全成果物が作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜3）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 7（カバレッジ確認）が完了していること
- **後続**: Phase 9（品質保証）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001/phase-9-quality-assurance.md`
