# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| Phase      | 9                                                   |
| Phase 名   | 品質保証                                            |
| 前提 Phase | Phase 8（リファクタリング）                         |
| 後続 Phase | Phase 10（最終レビューゲート）                      |
| ステータス | 未実施                                              |
| 作成日     | 2026-04-08                                          |
| 機能名     | task-ut-rt-01-exhaustive-check-execute-response-001 |

---

## 目的

typecheck・lint・test の3点セットを一括実行し、コード品質が Phase 10 レビューゲートを通過できる水準にあることを確認する。

## 背景

本 Phase は実装・リファクタリング後の最終品質ゲートとして機能する。全チェックが PASS することで Phase 10 の最終レビューに進める。

---

## 実行タスク

> 以下のタスクを順番に実行してください。
>
> **Task / Step 分離ルール**: このセクションには plan のみを書く。実行結果は `Phase 実行記録` へ記録する。

### タスク 1: TypeScript 型チェック

**目的**: コンパイルエラーがないことを確認する。

**実行手順**:

1. 型チェックを実行する：

   ```bash
   pnpm --filter @repo/desktop typecheck
   ```

2. エラーが発生した場合は修正してから次のタスクに進む
3. PASS した旨を記録する

**期待される成果物**:

- typecheck PASS 確認記録

---

### タスク 2: Lint チェック

**目的**: ESLint エラーがないことを確認する。

**実行手順**:

1. lint を実行する：

   ```bash
   pnpm --filter @repo/desktop lint
   ```

2. エラーが発生した場合は修正してから次のタスクに進む
3. PASS した旨を記録する

**期待される成果物**:

- lint PASS 確認記録

---

### タスク 3: 全テスト実行

**目的**: 変更ファイルに関連する全テストが PASS することを確認する。

**実行手順**:

1. デスクトップパッケージのテストを実行する：

   ```bash
   pnpm --filter @repo/desktop test
   ```

2. 新規テスト（TC-01〜TC-09）と既存テスト（リグレッションガード）の両方が PASS することを確認する
3. 失敗したテストがあれば原因を調査して修正する

**期待される成果物**:

- 全テスト PASS 確認記録（件数含む）

---

### タスク 4: 品質チェックリスト確認

**目的**: 全ての品質基準が満たされていることをチェックリストで確認する。

**実行手順**:

1. 以下のチェックリストを確認する：

   | チェック項目                                                                         | 結果 |
   | ------------------------------------------------------------------------------------ | ---- |
   | `pnpm --filter @repo/desktop typecheck` PASS                                         | □    |
   | `pnpm --filter @repo/desktop lint` PASS                                              | □    |
   | `pnpm --filter @repo/desktop test` 全件 PASS                                         | □    |
   | `isStructuredError` / `structured_error` / `execution_failed` がコードに残っていない | □    |
   | `classifyExecuteResult()` に意図コメントあり                                         | □    |
   | `extractExecuteErrorMessage()` に意図コメントあり                                    | □    |
   | `assertNever()` に意図コメントあり                                                   | □    |
   | 受入条件 AC-1〜AC-8 が全て満たされている                                             | □    |

2. 全チェックが ✅ でない場合は対応してから次のタスクに進む

**期待される成果物**:

- 品質チェックリスト完了記録

---

## 参照資料

| 参照資料         | パス                                                                        | 内容             |
| ---------------- | --------------------------------------------------------------------------- | ---------------- |
| Phase 1 受入条件 | 本ワークフロー Phase 1 完了記録                                             | AC-1〜AC-8       |
| 品質基準         | `.claude/skills/task-specification-creator/references/quality-standards.md` | 品質チェック観点 |

---

## 成果物

| 成果物                 | パス               | 内容                       |
| ---------------------- | ------------------ | -------------------------- |
| 品質保証チェックリスト | （Phase 実行記録） | 全チェック PASS の確認記録 |

---

## 統合テスト連携

- typecheck + lint + test を一括確認する。
- 全件 PASS を Phase 10 進行の条件とする。

---

## 完了条件

- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなしで PASS
- [ ] `pnpm --filter @repo/desktop lint` がエラーなしで PASS
- [ ] `pnpm --filter @repo/desktop test` が全件 PASS
- [ ] 受入条件 AC-1〜AC-8 が全て満たされていることが確認されている

---

## 品質ゲート

### 品質チェックリスト

#### 機能検証

- [ ] 全ユニットテスト成功（TC-01〜TC-09）
- [ ] リグレッションテスト成功（親タスクテスト）

#### コード品質

- [ ] Lint エラーなし
- [ ] 型エラーなし
- [ ] コードフォーマット適用済み

#### テスト網羅性

- [ ] `classifyExecuteResult()` の全 branch がカバーされている（Phase 7 結果）
- [ ] `extractExecuteErrorMessage()` の全 branch がカバーされている（Phase 7 結果）

#### セキュリティ

- [ ] 脆弱性スキャン完了（本タスクは Runtime 内部ロジックのみで、外部入力処理なし）

---

## Phase 末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 8（リファクタリング）が完了していること
- **後続**: Phase 10（最終レビューゲート）へ進む

---

## Phase 実行記録

Phase 完了後、以下を記録してください：

```markdown
## Phase 9 実行記録

### 品質チェック結果

| チェック項目 | 結果      |
| ------------ | --------- |
| typecheck    | PASS/FAIL |
| lint         | PASS/FAIL |
| test（全件） | PASS/FAIL |
| test 件数    | N 件      |

### 受入条件達成状況

| AC   | 内容                            | 達成 |
| ---- | ------------------------------- | ---- |
| AC-1 | classifyExecuteResult switch    | □    |
| AC-2 | 3 outcome の分岐                | □    |
| AC-3 | assertNever exhaustive check    | □    |
| AC-4 | extractExecuteErrorMessage 伝搬 | □    |
| AC-5 | 全 union ケース TC カバレッジ   | □    |
| AC-6 | typecheck PASS                  | □    |
| AC-7 | lint PASS                       | □    |
| AC-8 | test 全件 PASS                  | □    |

### 次 Phase への引き継ぎ事項

-
```

---

## 次の Phase

完了後、以下のファイルを実行してください：

`docs/30-workflows/task-ut-rt-01-exhaustive-check-execute-response-001/phase-10-final-review.md`
