# Phase 9: 品質検証

## メタ情報

| 項目       | 内容                                                                  |
| ---------- | --------------------------------------------------------------------- |
| タスク ID  | TASK-AUTH-MODE-SELECTION-001                                          |
| Phase      | 9 / 13                                                                |
| 前 Phase   | [Phase 8: リファクタリング](./phase-8-refactoring.md)                 |
| 次 Phase   | [Phase 10: 最終レビュー](./phase-10-final-review.md)                  |
| Issue      | [#750](https://github.com/your-org/AIWorkflowOrchestrator/issues/750) |
| 作成日     | 2026-02-08                                                            |
| 依存成果物 | Phase 8 リファクタリング完了コード                                    |

---

## 目的

Phase 8 までに完成した認証方式選択機能のコードに対し、静的解析・型チェック・自動テストを実行し、品質ゲートを通過することを確認する。

---

## 実行タスク

### Task 1: ESLint 実行

**目的**: コーディング規約違反・潜在的バグの検出

```bash
pnpm --filter @repo/desktop lint
```

**期待結果**: エラー 0 件、警告は許容（ただし新規警告は調査必須）

---

### Task 2: TypeScript 型チェック

**目的**: 型安全性の検証

```bash
pnpm --filter @repo/desktop typecheck
```

**期待結果**: 型エラー 0 件

---

### Task 3: ユニットテスト・統合テスト実行

**目的**: 機能の正常動作確認

```bash
pnpm --filter @repo/desktop test
```

**期待結果**: 全テスト PASS

---

### Task 4: カバレッジ確認

**目的**: テストカバレッジが基準を満たしているか確認

```bash
pnpm --filter @repo/desktop test -- --coverage
```

**品質基準**:

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

---

### Task 5: セキュリティチェック

**目的**: 機密情報漏洩リスクの検証

**チェック項目**:

- [ ] APIキー・トークンがログに出力されていないこと
- [ ] エラーメッセージに機密情報が含まれていないこと
- [ ] Main Process の機密データが Renderer に直接送信されていないこと
- [ ] electron-store に保存されるデータが適切に暗号化されていること

---

## 統合テスト連携【必須】

品質保証で統合テスト結果を確認:

| 品質項目     | 確認内容                                       | 結果 |
| ------------ | ---------------------------------------------- | ---- |
| 機能検証     | 全自動テスト成功（ユニット + 統合）            | [ ]  |
| 統合テスト   | auth-mode:\* IPC チャンネル全通過              | [ ]  |
| E2Eテスト    | 認証方式切り替えシナリオ成功                   | [ ]  |
| 認証連携     | subscription/api-key 両モードでAPI呼び出し成功 | [ ]  |
| セキュリティ | 機密情報漏洩なし・トークンログ出力なし         | [ ]  |

## 品質ゲート判定

| ゲート項目           | 基準          | 結果 |
| -------------------- | ------------- | ---- |
| ESLint               | エラー 0 件   | [ ]  |
| TypeScript           | 型エラー 0 件 | [ ]  |
| テスト               | 全 PASS       | [ ]  |
| Line Coverage        | >= 80%        | [ ]  |
| Branch Coverage      | >= 60%        | [ ]  |
| Function Coverage    | >= 80%        | [ ]  |
| セキュリティチェック | 全項目クリア  | [ ]  |

---

## 成果物

| 成果物                   | パス                                 |
| ------------------------ | ------------------------------------ |
| テスト結果レポート       | `outputs/phase-9/test-results.md`    |
| カバレッジレポート       | `outputs/phase-9/coverage-report.md` |
| セキュリティチェック結果 | `outputs/phase-9/security-check.md`  |

---

## 完了条件

- [ ] ESLint エラー 0 件
- [ ] TypeScript 型エラー 0 件
- [ ] 全テスト PASS
- [ ] カバレッジ基準達成（Line >= 80%, Branch >= 60%, Function >= 80%）
- [ ] セキュリティチェック全項目クリア
- [ ] 品質ゲート判定表が全て PASS
- [ ] 成果物が `outputs/phase-9/` に出力されていること

---

## 次 Phase

**Phase 10: 最終レビュー**

品質検証をパスしたら、[Phase 10](./phase-10-final-review.md) で最終レビューを実施する。
