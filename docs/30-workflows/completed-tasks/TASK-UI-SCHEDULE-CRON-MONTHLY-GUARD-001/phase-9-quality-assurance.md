# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 9                                       |
| Phase名    | 品質保証                                |
| 前提Phase  | Phase 8（リファクタリング）             |
| 後続Phase  | Phase 10                                |
| ステータス | 未実施                                  |
| 作成日     | 2026-04-13                              |
| 機能名     | TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001 |

---

## 目的

実装・テスト・リファクタリングが完了した状態で、Lint・TypeScript 型チェック・全テスト通過を
確認し、出荷品質であることを保証する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 全テスト実行

**目的**: desktop パッケージの全テストが通過することを確認する

**実行手順**:

1. 全テストを実行する:
   ```bash
   pnpm --filter @repo/desktop test
   ```
2. 全テストが Green であることを確認する
3. テスト件数・Pass件数・Fail件数を記録する

**期待される成果物**:

- `outputs/phase-9/test-all-result.md`（全テスト結果）

---

### タスク2: TypeScript 型チェック

**目的**: 型エラーがないことを確認する

**実行手順**:

1. 型チェックを実行する:
   ```bash
   pnpm --filter @repo/desktop typecheck
   ```
2. エラーがないことを確認する
3. エラーがある場合は修正して再チェックする
4. 結果を記録する

**期待される成果物**:

- `outputs/phase-9/typecheck-result.md`（型チェック結果）

---

### タスク3: Lint チェック

**目的**: ESLint のルール違反がないことを確認する

**実行手順**:

1. Lint を実行する:
   ```bash
   pnpm --filter @repo/desktop lint
   ```
2. エラーがないことを確認する
3. エラーがある場合は修正して再チェックする
4. 結果を記録する

**期待される成果物**:

- `outputs/phase-9/lint-result.md`（Lint チェック結果）

---

### タスク4: 品質保証レポート作成

**目的**: 全品質ゲートの通過を一つのレポートにまとめる

**実行手順**:

1. 以下のチェックリストを確認する:

   #### 機能検証
   - [ ] TC-11: `dayOfMonth=0` で `""` を返す（AC-1）
   - [ ] TC-12: `dayOfMonth=32` で `""` を返す（AC-2）
   - [ ] TC-13: `dayOfMonth=-1` で `""` を返す（AC-3）
   - [ ] TC-14: `dayOfMonth=1` で `"0 9 1 * *"` を返す（AC-4）
   - [ ] TC-15: `dayOfMonth=31` で `"0 9 31 * *"` を返す（AC-5）
   - [ ] 既存テスト全件 Green（AC-6）

   #### コード品質
   - [ ] Lint エラーなし
   - [ ] TypeScript 型エラーなし
   - [ ] JSDoc の `@returns` と `@remarks` 更新済み（AC-7）

   #### 対称性
   - [ ] `weekly` ガードと `monthly` ガードが対称パターンで実装されている

2. `outputs/phase-9/quality-report.md` を作成する

**期待される成果物**:

- `outputs/phase-9/quality-report.md`（品質保証レポート）

---

## 参照資料

| 参照資料       | パス                                                          | 内容         |
| -------------- | ------------------------------------------------------------- | ------------ |
| 実装ファイル   | `apps/desktop/src/renderer/utils/cronConverter.ts`            | 品質確認対象 |
| テストファイル | `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts` | テスト全件   |
| Phase 1 AC     | `outputs/phase-1/acceptance-criteria.md`                      | 受け入れ基準 |

---

## 成果物

| 成果物           | パス                                  | 内容                 |
| ---------------- | ------------------------------------- | -------------------- |
| 全テスト結果     | `outputs/phase-9/test-all-result.md`  | テスト全件 Pass 確認 |
| 型チェック結果   | `outputs/phase-9/typecheck-result.md` | 型エラーなし確認     |
| Lint 結果        | `outputs/phase-9/lint-result.md`      | Lint エラーなし確認  |
| 品質保証レポート | `outputs/phase-9/quality-report.md`   | 全品質ゲート通過確認 |

---

## 統合テスト連携

- 全テスト・型チェック・Lint の全品質ゲートが通過していること

---

## 品質ゲート

### 品質チェックリスト

#### 機能検証

- [ ] 全ユニットテスト成功
- [ ] 全統合テスト成功

#### コード品質

- [ ] Lint エラーなし
- [ ] 型エラーなし
- [ ] コードフォーマット適用済み

---

## 完了条件

- [ ] `pnpm --filter @repo/desktop test` が全件グリーンである
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなしである
- [ ] `pnpm --filter @repo/desktop lint` がエラーなしである
- [ ] AC-1〜AC-7 が全て満たされている
- [ ] `outputs/phase-9/quality-report.md` が作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜4）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 8（リファクタリング）が完了していること
- **後続**: Phase 10（最終レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001/phase-10-final-review.md`
