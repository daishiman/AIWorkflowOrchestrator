# Phase 9: 品質保証

## メタ情報

| 項目   | 値                        |
| ------ | ------------------------- |
| Phase  | 9                         |
| 機能名 | approval-request-producer |
| 作成日 | 2026-04-01                |

## 目的

Phase 8 のリファクタリング完了後、型チェック・lint・テスト全体を通して実装品質を保証する。全コマンドの期待結果と判定基準を明示し、品質ゲートとして機能させる。

---

## 実行タスク

- 型チェック: TypeScript コンパイルエラーがないことを確認
- lint: ESLint エラー・警告がないことを確認
- テスト全体: 全ユニットテストが PASS することを確認
- 統合テスト: `approvalHandlers` 関連テストが PASS することを確認
- 各コマンドの期待結果と判定基準の確認

---

## Step 1: 型チェック

### 実行コマンド

```bash
pnpm --filter @repo/desktop exec tsc --noEmit
```

### 期待結果

```
（出力なし。エラーゼロで完了）
```

### 判定基準

| 判定 | 条件                              | 対応                              |
| ---- | --------------------------------- | --------------------------------- |
| PASS | exit code 0、エラーメッセージなし | Phase 10 へ進む                   |
| FAIL | 型エラーが 1 件以上発生           | Phase 5（実装）へ戻り型を修正する |

### 主要確認ポイント

- `pushApprovalRequest` の引数型がペイロード型と一致している
- `this.sessionId` が `string` 型である
- `uuidv4()` の戻り値が `string` 型である
- `this.mainWindow` が `BrowserWindow` 型である

---

## Step 2: lint

### 実行コマンド

```bash
pnpm --filter @repo/desktop lint
```

### 期待結果

```
（警告・エラーなし）
```

### 判定基準

| 判定 | 条件                                               | 対応                                     |
| ---- | -------------------------------------------------- | ---------------------------------------- |
| PASS | エラーゼロ、警告ゼロ（または許容済み既存警告のみ） | Phase 10 へ進む                          |
| FAIL | 新規 lint エラーが 1 件以上発生                    | 対象ファイルを修正し本 Step を再実行する |

### よくある lint エラーと対処

| エラー種別                           | 原因                                  | 対処                                |
| ------------------------------------ | ------------------------------------- | ----------------------------------- |
| `no-unused-vars`                     | import したが使用していない変数がある | 未使用 import を削除する（Phase 8） |
| `@typescript-eslint/no-explicit-any` | `any` 型の使用                        | 具体的な型に変更する                |

---

## Step 3: テスト全体実行

### 実行コマンド

```bash
pnpm --filter @repo/desktop test
```

### 期待結果

```
Test Files  X passed (X)
Tests       X passed (X)
（全テスト PASS）
```

### 判定基準

| 判定 | 条件                                  | 対応                             |
| ---- | ------------------------------------- | -------------------------------- |
| PASS | 全テストファイルが PASS、スキップなし | Phase 10 へ進む                  |
| FAIL | 1 件以上のテストが失敗                | 失敗テストの原因を特定し修正する |

---

## Step 4: 統合テスト（approvalHandlers）

### 実行コマンド

```bash
pnpm --filter @repo/desktop test -- approvalHandlers
```

### 期待結果

```
✓ apps/desktop/src/main/ipc/__tests__/approvalHandlers.push.test.ts
（全テスト PASS）
```

### 判定基準

| 判定 | 条件                                              | 対応                                                |
| ---- | ------------------------------------------------- | --------------------------------------------------- |
| PASS | `approvalHandlers.push.test.ts` の全テストが PASS | Phase 10 へ進む                                     |
| FAIL | IPC 経路テストが失敗                              | Phase 5 へ戻り `pushApprovalRequest` 接続を確認する |

---

## Step 5: HooksFactory producer テスト単体確認

### 実行コマンド

```bash
pnpm --filter @repo/desktop test -- HooksFactory.producer
```

### 期待結果

```
✓ apps/desktop/src/main/services/agent/__tests__/HooksFactory.producer.test.ts
（全テスト PASS）
```

### 判定基準

| 判定 | 条件                                                         | 対応                         |
| ---- | ------------------------------------------------------------ | ---------------------------- |
| PASS | `HooksFactory.producer.test.ts` の全テストが PASS            | Phase 10 へ進む              |
| FAIL | 危険コマンド検出・`pushApprovalRequest` 呼び出しテストが失敗 | Phase 5 へ戻り実装を確認する |

---

## 品質ゲート総括

全 Step が PASS であることを確認してから Phase 10 へ進む。

| Step | コマンド                                                    | 期待結果         | 実行結果 |
| ---- | ----------------------------------------------------------- | ---------------- | -------- |
| 1    | `tsc --noEmit`                                              | エラーゼロ       | 要確認   |
| 2    | `pnpm --filter @repo/desktop lint`                          | エラー・警告ゼロ | 要確認   |
| 3    | `pnpm --filter @repo/desktop test`                          | 全テスト PASS    | 要確認   |
| 4    | `pnpm --filter @repo/desktop test -- approvalHandlers`      | PASS             | 要確認   |
| 5    | `pnpm --filter @repo/desktop test -- HooksFactory.producer` | PASS             | 要確認   |

---

## 参照資料

| 資料名                    | パス                                                   | 説明                 |
| ------------------------- | ------------------------------------------------------ | -------------------- |
| phase-5-implementation.md | `./phase-5-implementation.md`                          | 実装内容             |
| phase-7-coverage-check.md | `./phase-7-coverage-check.md`                          | カバレッジ確認結果   |
| phase-8-refactoring.md    | `./phase-8-refactoring.md`                             | リファクタリング結果 |
| HooksFactory.ts           | `apps/desktop/src/main/services/agent/HooksFactory.ts` | 主要修正対象         |

---

## 成果物

| 成果物   | パス                           | 説明       |
| -------- | ------------------------------ | ---------- |
| 品質保証 | `phase-9-quality-assurance.md` | 本ファイル |

---

## 完了条件

- [ ] `tsc --noEmit` がエラーゼロで完了している
- [ ] `pnpm --filter @repo/desktop lint` がエラー・警告ゼロで完了している
- [ ] `pnpm --filter @repo/desktop test` が全テスト PASS で完了している
- [ ] `pnpm --filter @repo/desktop test -- approvalHandlers` が PASS で完了している
- [ ] `pnpm --filter @repo/desktop test -- HooksFactory.producer` が PASS で完了している
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## Phase 10 開始条件

**Phase 10 への進行は本 Phase（品質保証）の全 Step が PASS 判定を得た後のみ許可される。**

| 条件                                  | 状態   |
| ------------------------------------- | ------ |
| 型チェック（`tsc --noEmit`）が PASS   | 要確認 |
| lint が PASS                          | 要確認 |
| 全テストが PASS                       | 要確認 |
| `approvalHandlers` 統合テストが PASS  | 要確認 |
| `HooksFactory.producer` テストが PASS | 要確認 |

## 次の Phase

Phase 10: 最終レビューゲート → [phase-10-final-review.md](phase-10-final-review.md)

## 統合テスト連携

- Phase 5〜7 の current facts と 4 条件の判定が一致しているかを最終確認する
- Phase 10 へ渡す品質ゲートの結果を固定する
