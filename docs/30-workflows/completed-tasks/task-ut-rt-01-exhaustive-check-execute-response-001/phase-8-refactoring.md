# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| Phase      | 8                                                   |
| Phase 名   | リファクタリング                                    |
| 前提 Phase | Phase 7（カバレッジ確認）                           |
| 後続 Phase | Phase 9（品質保証）                                 |
| ステータス | 未実施                                              |
| 作成日     | 2026-04-08                                          |
| 機能名     | task-ut-rt-01-exhaustive-check-execute-response-001 |

---

## 目的

Phase 5 で実装したコードを対象に、命名の一貫性・コメントの明瞭さ・dead code の除去を確認し、コードの保守性を高める。既存テストが全て PASS し続けることを確認する。

## 背景

> **[Feedback RT-03]** 変更内容を `対象/Before/After/理由` テーブル形式で記録する。

本 Phase ではコードの動作変更は行わず、名前・コメント・構造のみを改善する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。
>
> **Task / Step 分離ルール**: このセクションには plan のみを書く。実行結果は `Phase 実行記録` へ記録する。

### タスク 1: 命名の確認と修正

**目的**: `classifyExecuteResult()` / `ExecuteOutcome` / `assertNever` の命名がプロジェクトの命名規則と整合しているかを確認する。

**実行手順**:

1. Phase 1 で確認した命名規則 inventory と比較する
2. 以下を確認する：
   - `ExecuteOutcome` 型名が camelCase/PascalCase の規則に従っているか
   - `classifyExecuteResult` が動詞+名詞のパターン（module-local helper の命名として自然か）に従っているか
   - switch の各 `case` のリテラル値（`"terminal_handoff"` 等）が既存の命名と一致しているか
3. 修正が必要な場合は Before/After テーブルに記録して修正する

**期待される成果物**:

- 命名確認記録（Before/After テーブル）

---

### タスク 2: コメントの追加・改善

**目的**: `classifyExecuteResult()` / `extractExecuteErrorMessage()` / `assertNever` の意図がコードを読む人に伝わるコメントを追加する。

**実行手順**:

1. 以下のコメントが、各関数の責務と判定意図を具体的に説明しているかを確認する：
   - `assertNever`: 「exhaustive check のためのヘルパー。union 型に新メンバーが追加された場合にコンパイルエラーを発生させる」旨のコメント
   - `classifyExecuteResult()`: discriminant の優先順位と各 outcome の判別根拠のコメント
   - `extractExecuteErrorMessage()`: error の正規化方針のコメント
   - `executeAsync()` の switch: 各 case の意味と処理の意図のコメント

2. 過剰なコメント（自明な内容の繰り返し）があれば削除する

**期待される成果物**:

- コメント追加・改善後のコード

---

### タスク 3: dead code 除去確認

**目的**: `isStructuredError` / `structured_error` / `execution_failed` 関連の残骸（変数宣言・コメント・型キャスト）が完全に除去されていることを確認する。

**実行手順**:

1. `RuntimeSkillCreatorFacade.ts` 内で `isStructuredError` / `structured_error` / `execution_failed` という文字列が残っていないか Grep で確認する：

   ```bash
   grep -n "isStructuredError\|structured_error\|execution_failed" \
     apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
   ```

2. 残っている場合は除去する
3. `as RuntimeSkillCreatorExecuteErrorResponse` のような不要な型キャストが switch 化後に残っていないか確認する

**期待される成果物**:

- dead code 除去確認記録

---

### タスク 4: リファクタリング後のテスト実行

**目的**: リファクタリング後も全テストが PASS することを確認する。

**実行手順**:

1. テストを実行する：

   ```bash
   pnpm --filter @repo/desktop test -- --reporter=verbose \
     src/main/services/runtime/__tests__/
   ```

2. lint を実行する：

   ```bash
   pnpm --filter @repo/desktop lint
   ```

3. typecheck を実行する：

   ```bash
   pnpm --filter @repo/desktop typecheck
   ```

4. 問題があれば修正する

**期待される成果物**:

- リファクタリング後テスト PASS 確認記録

---

## 参照資料

| 参照資料                     | パス                                                                  | 内容                 |
| ---------------------------- | --------------------------------------------------------------------- | -------------------- |
| Phase 1 実行記録             | 本ワークフロー Phase 1 完了記録                                       | 命名規則 inventory   |
| Phase 5 実行記録             | 本ワークフロー Phase 5 完了記録                                       | 実装内容             |
| RuntimeSkillCreatorFacade.ts | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | リファクタリング対象 |

---

## 成果物

| 成果物               | パス                           | 内容                                |
| -------------------- | ------------------------------ | ----------------------------------- |
| リファクタリング記録 | （Phase 実行記録）             | Before/After テーブル・変更内容一覧 |
| 修正済み実装ファイル | `RuntimeSkillCreatorFacade.ts` | コメント・命名改善済み              |

---

## 統合テスト連携

- リファクタリング後の既存テスト継続成功を確認する。

---

## 完了条件

- [ ] 命名がプロジェクト規則に整合していることが確認されている
- [ ] `classifyExecuteResult()` / `extractExecuteErrorMessage()` / `assertNever` に意図が分かるコメントが付いている
- [ ] `isStructuredError` / `structured_error` / `execution_failed` の残骸がコードに存在しない
- [ ] リファクタリング後も全テストが PASS している
- [ ] `pnpm --filter @repo/desktop lint` がエラーなし
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし

---

## TDD 検証

### TDD サイクル確認

```bash
pnpm --filter @repo/desktop test -- --reporter=verbose \
  src/main/services/runtime/__tests__/
```

**確認項目**:

- [ ] リファクタリング後もテストが成功することを確認

---

## Phase 末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 7（カバレッジ確認）が完了していること
- **後続**: Phase 9（品質保証）へ進む

---

## Phase 実行記録

Phase 完了後、以下を記録してください：

```markdown
## Phase 8 実行記録

### 変更内容 Before/After テーブル

| 対象               | Before       | After                   | 理由             |
| ------------------ | ------------ | ----------------------- | ---------------- |
| （例）コメント追加 | コメントなし | 「exhaustive check...」 | 読者への意図説明 |

### 実行タスク

- タスク 1 命名確認: [変更あり/なし・詳細]
- タスク 2 コメント追加: [追加内容]
- タスク 3 dead code 除去: [除去あり/なし]
- タスク 4 テスト再実行: [PASS確認]

### 次 Phase への引き継ぎ事項

-
```

---

## 次の Phase

完了後、以下のファイルを実行してください：

`docs/30-workflows/task-ut-rt-01-exhaustive-check-execute-response-001/phase-9-quality-assurance.md`
