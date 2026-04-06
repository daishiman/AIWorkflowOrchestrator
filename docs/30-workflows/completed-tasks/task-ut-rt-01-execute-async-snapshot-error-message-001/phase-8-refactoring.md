# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目       | 内容                                                   |
| ---------- | ------------------------------------------------------ |
| Phase      | 8                                                      |
| Phase 名   | リファクタリング（TDD: Refactor）                      |
| 前提 Phase | Phase 7（カバレッジチェック）完了                      |
| 後続 Phase | Phase 9（品質保証）                                    |
| ステータス | 未着手                                                 |
| 作成日     | 2026-04-06                                             |
| 機能名     | task-ut-rt-01-execute-async-snapshot-error-message-001 |

---

## 目的

動作を変えずにコード品質を改善する。本タスクは変更範囲が最小限であるため、リファクタリング対象が存在するかを評価し、その結論を記録する。

---

## リファクタリング評価（変更内容テーブル）

> **[Feedback RT-03] 義務**: Phase 8 リファクタリング記録は `対象/Before/After/理由` テーブル形式で実施すること。

### Phase 5 実装による変更内容の記録

| 対象                                   | Before                                                            | After                                                                              | 理由                                                             |
| -------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `executeAsync()` structured error パス | `if (!snapshot) { onWorkflowStateSnapshot?.(planId, null, ...) }` | `onWorkflowStateSnapshot?.(planId, snapshot ?? null, errorResponse.error.message)` | snapshot がある場合もエラーメッセージを伝搬するため（AC-1 対応） |
| `executeAsync()` catch パス            | `if (!snapshot) { onWorkflowStateSnapshot?.(planId, null, ...) }` | `onWorkflowStateSnapshot?.(planId, snapshot ?? null, errorMessage)`                | snapshot がある場合もエラーメッセージを伝搬するため（AC-2 対応） |

### リファクタリング対象外（変更しないもの）

| 対象                                 | 理由                                                     |
| ------------------------------------ | -------------------------------------------------------- |
| `execute()` メソッド                 | 本タスクのスコープ外。エラーハンドリング変更なし。       |
| `plan()` メソッド                    | 本タスクのスコープ外。エラーハンドリング変更なし。       |
| `improve()` メソッド                 | 本タスクのスコープ外。エラーハンドリング変更なし。       |
| `onWorkflowStateSnapshot` シグネチャ | 型変更なし。第3引数 `error?` は optional のまま維持。    |
| `SkillCreatorWorkflowEngine`         | 内部 snapshot 生成ロジックの変更はスコープ外。           |
| `creatorHandlers.ts`                 | IPC チャンネル変更なし。既存ワイヤリングをそのまま使用。 |

---

## 重複・navigation drift・命名ドリフト 確認

### 重複確認

| 確認項目                                                                | 結果     | 備考                                                                     |
| ----------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `executeAsync()` structured error パスと catch パスで重複コードがあるか | 重複なし | 各パスは独立した条件分岐であり、共通化するメリットが変更規模に対して過剰 |
| 他の箇所に `if (!snapshot)` の同パターンが存在するか                    | 対象外   | `execute()` / `plan()` / `improve()` は本タスクのスコープ外              |

### navigation drift 確認

| 確認項目                                                           | 結果             | 備考                                                           |
| ------------------------------------------------------------------ | ---------------- | -------------------------------------------------------------- |
| Phase 2 設計書の Before/After からコードが意図せず変わっていないか | ドリフトなし     | Phase 5 実装は Phase 2 設計書の After コードをそのまま実装する |
| `snapshot ?? null` の演算子が `null` 固定に戻っていないか          | Phase 5 で確認済 | Phase 5 実装後に typecheck にて確認                            |

### 命名ドリフト確認

| 確認項目                                                         | 結果         | 備考                                                          |
| ---------------------------------------------------------------- | ------------ | ------------------------------------------------------------- |
| Phase 1 命名規則 inventory との整合（camelCase 等）              | ドリフトなし | `snapshot`, `errorMessage`, `errorResponse` は inventory 通り |
| `onWorkflowStateSnapshot` の呼び出しシグネチャが変わっていないか | 変更なし     | 第1〜3引数のすべてが Phase 2 設計通り                         |

---

## 実行タスク

- [x] 変更内容テーブル（対象/Before/After/理由 形式）の記録
- [x] 重複・navigation drift・命名ドリフトの確認
- [x] リファクタリング対象外の明記
- [ ] リファクタリング後のテスト継続成功確認（Phase 5 実装完了後に実施）

---

## 統合テスト連携【必須】

リファクタリング後の統合テスト継続成功を確認する（Phase 5 実装後に実施）:

```bash
# リファクタリング後のテスト実行
pnpm --filter @repo/desktop test -- --testPathPattern "RuntimeSkillCreatorFacade"
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
```

| 確認項目                 | コマンド                                                                            | 期待結果      |
| ------------------------ | ----------------------------------------------------------------------------------- | ------------- |
| TypeScript 型チェック    | `pnpm --filter @repo/desktop typecheck`                                             | エラー 0 件   |
| ESLint チェック          | `pnpm --filter @repo/desktop lint`                                                  | エラー 0 件   |
| 対象テスト（T-01〜T-06） | `pnpm --filter @repo/desktop test -- --testPathPattern "RuntimeSkillCreatorFacade"` | 全テスト PASS |

---

## コードスメル検出結果

本タスクの変更範囲は最小（各パス 1 行削除 + 1 行変更 = 計 4 行変更）であり、検出すべき主要なコードスメルは存在しない。

| 検出項目                   | 結果     | 備考                                                                  |
| -------------------------- | -------- | --------------------------------------------------------------------- |
| 過剰な条件分岐の発生       | 発生なし | `if (!snapshot)` の削除により条件分岐が減少（改善）                   |
| 不要な null チェックの追加 | 追加なし | `snapshot ?? null` は既存 `null` リテラルの自然な拡張                 |
| SOLID 原則違反の新規発生   | 発生なし | 責務変更なし。既存 `onWorkflowStateSnapshot` コールバックの再利用のみ |

---

## 成果物

| 成果物                         | パス                                                                                              | 内容                         |
| ------------------------------ | ------------------------------------------------------------------------------------------------- | ---------------------------- |
| Phase 8 リファクタリング仕様書 | `docs/30-workflows/task-ut-rt-01-execute-async-snapshot-error-message-001/phase-8-refactoring.md` | 本ドキュメント               |
| Phase 8 outputs ディレクトリ   | `docs/30-workflows/task-ut-rt-01-execute-async-snapshot-error-message-001/outputs/phase-8/`       | Phase 8 出力格納ディレクトリ |

---

## 完了条件

- [ ] 変更内容テーブル（対象/Before/After/理由 形式）を記録した
- [ ] 重複・navigation drift・命名ドリフトの確認結果を記録した（結論: 重複なし・ドリフトなし）
- [ ] リファクタリング対象外を明記した
- [ ] テストが継続成功していることを確認した（Phase 5 実装後に実施）
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## Phase 末端アクション【必須】

- [ ] Phase 8 内の全タスクを 100% 実行完了
- [ ] 変更内容テーブルを確認し、完了を明記
- [ ] 成果物（本ドキュメント）が生成されていることを確認

---

## 次 Phase

Phase 8 完了後、次は **Phase 9（品質保証）** へ進む。

`docs/30-workflows/task-ut-rt-01-execute-async-snapshot-error-message-001/phase-9-quality-assurance.md`
