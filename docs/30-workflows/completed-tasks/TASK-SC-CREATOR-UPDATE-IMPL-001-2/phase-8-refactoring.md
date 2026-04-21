# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 8                               |
| タスクID   | TASK-SC-CREATOR-UPDATE-IMPL-001 |
| ステータス | 未実施                          |
| 作成日     | 2026-04-21                      |
| 前Phase    | 7: カバレッジ確認               |
| 次Phase    | 9: 品質保証                     |

---

## 目的

`runUpdateWorkflow()` と `runCreateWorkflow()` の共通ロジックを洗い出し、
重複コードを抽出・整理する。
共通化が保守性を高める場合のみヘルパー関数を導入し、
判断結果と Before/After を `refactoring-log.md` に残す。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 重複パターンの特定

**目的**: `runUpdateWorkflow()` と `runCreateWorkflow()` の実装を比較し、重複するコードパターンを洗い出す

**実行手順**:

1. `apps/desktop/src/main/services/skill/SkillCreatorService.ts` を開く
2. `runUpdateWorkflow()` と `runCreateWorkflow()` の実装を並べて比較する
3. 以下の観点で重複パターンを特定する
   - `AbortSignal.aborted` のチェックパターン
   - `logger.info` / `logger.warn` / `logger.error` の呼び出しパターン
   - エラーハンドリング（try/catch）の構造
   - LLMクライアント利用可否チェックの処理
4. 重複箇所を Before/After/理由の形式で記録する

**重複パターン例（Before）**:

各メソッドで繰り返される AbortSignal 確認パターン（例）:

```typescript
if (signal?.aborted) {
  logger.info("[SkillCreatorService] 処理を中断しました");
  return;
}
```

**期待される成果物**:

- `outputs/phase-8/refactoring-log.md` の重複パターン特定セクション

---

### タスク2: 共通ヘルパー関数の要否判断と設計

**目的**: 重複パターンをヘルパー関数に抽出すべきか判断し、必要な場合のみ設計・実装する

**実行手順**:

1. 重複量・変更箇所数・可読性改善量を比較し、導入判断を記録する
2. 導入する場合のみ、ヘルパー関数の設計を決定する
   - 関数名・引数・戻り値の型を定義する
   - 配置先ファイル（既存ファイル内かヘルパーファイルか）を決定する
3. 導入しない場合は、その理由と非導入判断を `refactoring-log.md` に記録する

**判断基準**:

| 観点       | 導入する条件                             |
| ---------- | ---------------------------------------- |
| 重複箇所数 | 3箇所以上で同一パターンが繰り返される    |
| 保守性     | 変更時に複数箇所を同時修正する必要がある |
| 可読性     | 抽出後のコードが明らかに読みやすくなる   |

**期待される成果物**:

- `outputs/phase-8/refactoring-log.md` の導入判断セクション

---

### タスク3: 重複コードの整理（導入判断が Yes の場合）

**目的**: 重複パターンをヘルパー関数に置き換え、コードの保守性を向上させる

**実行手順**:

1. ヘルパー関数を実装する
2. `runUpdateWorkflow()` と `runCreateWorkflow()` の重複箇所をヘルパー呼び出しに置き換える
3. 置き換え後に TypeScript 型チェックを実行してエラーがないことを確認する

```bash
pnpm --filter @repo/desktop typecheck
```

4. テストを実行して全テストが PASS することを確認する

```bash
pnpm --filter @repo/desktop test
```

5. 各変更内容を Before/After/理由の形式で `refactoring-log.md` に記録する

**Before/After/理由テーブル記入例**:

| 対象                               | Before（変更前）                                  | After（変更後）                         | 理由                              |
| ---------------------------------- | ------------------------------------------------- | --------------------------------------- | --------------------------------- |
| `runUpdateWorkflow()` 中断チェック | `if (signal?.aborted) { ... }` を各ステップに記述 | `checkAbort(signal, logger)` を呼び出し | DRY原則に従い中断チェックを共通化 |
| `runCreateWorkflow()` 中断チェック | `if (signal?.aborted) { ... }` を各ステップに記述 | `checkAbort(signal, logger)` を呼び出し | 同上                              |

**期待される成果物**:

- 更新済みの `SkillCreatorService.ts`
- `outputs/phase-8/refactoring-log.md` の Before/After/理由テーブル

---

### タスク4: リファクタリング後のテスト継続確認

**目的**: リファクタリング後も全テストが正常に PASS することを確認する

**実行手順**:

1. 全テストを実行する

```bash
pnpm --filter @repo/desktop test
```

2. 全テストが PASS することを確認する
3. リファクタリング前後で振る舞いが変わっていないことを確認する（`git diff` で差分確認）
4. 結果を `refactoring-log.md` に記録する

**期待される成果物**:

- `outputs/phase-8/refactoring-log.md` のテスト継続確認セクション

---

## 参照資料

| 参照資料          | パス                                                                   | 内容                         |
| ----------------- | ---------------------------------------------------------------------- | ---------------------------- |
| 実装対象ファイル  | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`          | リファクタリング対象         |
| Phase 5〜7 成果物 | `outputs/phase-5/`, `outputs/phase-6/`, `outputs/phase-7/`             | 実装・テスト・カバレッジ結果 |
| 仕様記述ガイド    | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md` | 仕様記述・命名の基準         |

---

## 成果物

| 成果物               | パス                                                          | 内容                                                  |
| -------------------- | ------------------------------------------------------------- | ----------------------------------------------------- |
| リファクタリングログ | `outputs/phase-8/refactoring-log.md`                          | 重複パターン特定・導入判断・Before/After/理由テーブル |
| 更新済み実装ファイル | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | ヘルパー適用済み（導入した場合のみ）                  |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 8の統合テスト連携アクション**:

- リファクタリング後も `runUpdateWorkflow()` と `runCreateWorkflow()` の振る舞いが変わっていないことを全テストで確認する
- AbortSignal 中断が各ステップで引き続き機能することを確認する
- TypeScript 型定義が正しく、型エラーが発生しないことを確認する

---

## 多角的チェック観点（AIが判断）

| 観点                     | チェック内容                                                                    |
| ------------------------ | ------------------------------------------------------------------------------- |
| DRY原則の適用            | `runUpdateWorkflow()` と `runCreateWorkflow()` で同一パターンが排除されているか |
| 型安全性                 | ヘルパー関数の型定義が厳密で、`any` を使っていないか                            |
| テスト独立性の維持       | リファクタリング後もテスト間の状態漏れがないか                                  |
| AbortSignal 継続機能     | 中断チェックがリファクタリング後も各ステップで機能しているか                    |
| 保守コスト削減の定量評価 | 変更前後のコード行数差分（削減行数）を記録しているか                            |
| 導入しない場合の根拠明記 | 非導入判断の場合、理由が `refactoring-log.md` に明記されているか                |

---

## サブタスク管理

| サブタスクID | 内容                                      | ステータス |
| ------------ | ----------------------------------------- | ---------- |
| ST-8-01      | 重複パターン特定                          | 未実施     |
| ST-8-02      | 共通ヘルパー関数の要否判断と設計          | 未実施     |
| ST-8-03      | 重複コードの整理（導入判断が Yes の場合） | 未実施     |
| ST-8-04      | リファクタリング後のテスト継続確認        | 未実施     |

---

## 完了条件

- [ ] `runUpdateWorkflow()` と `runCreateWorkflow()` の重複パターンが特定されている
- [ ] 共通ヘルパー関数を導入する場合は実装され、テストが PASS している
- [ ] 導入しない場合は、その理由と非導入判断が `refactoring-log.md` に記録されている
- [ ] `outputs/phase-8/refactoring-log.md` に Before/After/理由テーブルが記録されている
- [ ] リファクタリング後に `pnpm --filter @repo/desktop test` で全テストが PASS している
- [ ] リファクタリング前後で振る舞いが変わっていない（`git diff` で確認）

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-SC-CREATOR-UPDATE-IMPL-001/phase-9-quality.md`
