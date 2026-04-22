# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                |
| ---------- | ------------------- |
| Phase      | 9                   |
| タスクID   | UT-CANCEL-004-01    |
| ステータス | 完了                |
| 作成日     | 2026-04-22          |
| 前Phase    | 8: リファクタリング |
| 次Phase    | 10: 最終レビュー    |

---

## 目的

TypeScript 型チェック・ESLint・全テスト実行の最終確認を行い、
`createSkill` への `signal` 引数追加・`SkillCreateWizard.tsx` の変更が
品質基準を全て満たしていることを保証する。

---

## 実行タスク

### タスク 1: TypeScript 型チェックの実行

**目的**: `@repo/desktop` パッケージ全体で TypeScript 型エラーがゼロであることを確認する

**実行手順**:

1. 以下のコマンドを実行する

```bash
pnpm --filter @repo/desktop typecheck
```

2. エラーが出力された場合は内容を特定し修正する
3. エラーゼロを確認したら結果を記録する

**特に確認すべき型エラーパターン**:

| エラーパターン                                           | 原因                                                           | 修正方法                                          |
| -------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------- |
| `Argument of type 'AbortSignal' is not assignable to...` | `signal` の型が IPC 引数オブジェクトの型定義と不一致           | IPC 引数型に `signal?: AbortSignal` を追加しない  |
| `Expected 3 arguments, but got 4`                        | 型定義（L369）と実装（L1200）の引数数が一致していない          | 両方に `signal` を追加する                        |
| `Property 'signal' does not exist on type '...'`         | `window.electronAPI.skill.create()` の引数型に `signal` がない | Renderer 側で `signal.aborted` チェックのみとする |

**合格基準**: 出力に `error TS` を含まないこと

---

### タスク 2: ESLint 静的解析の実行

**目的**: `@repo/desktop` パッケージ全体で ESLint エラーがゼロであることを確認する

**実行手順**:

1. 以下のコマンドを実行する

```bash
pnpm --filter @repo/desktop lint
```

2. エラー・警告が出力された場合は内容を特定し修正する
3. エラーゼロを確認したら結果を記録する

**特に確認すべき ESLint ルール**:

| ルール                               | 確認内容                                              |
| ------------------------------------ | ----------------------------------------------------- |
| `@typescript-eslint/no-unused-vars`  | `signal` 変数が宣言のみで使われていないケースがないか |
| `@typescript-eslint/no-explicit-any` | `signal` 周辺で `any` が使われていないか              |
| `react-hooks/exhaustive-deps`        | `useCallback` 依存配列に `signal` 関連の変更がないか  |

**合格基準**: `0 errors` であること（warning は記録のうえで許容可）

---

### タスク 3: 全テスト実行

**目的**: `@repo/desktop` の全テストが PASS することを確認する

**実行手順**:

1. 以下のコマンドを実行する

```bash
pnpm --filter @repo/desktop test
```

2. 全テストが PASS していることを確認する
3. テスト名・PASS 件数・FAIL 件数・実行時間を記録する

**特に注目するテストスイート**:

| テストファイル                                 | 確認内容                                              |
| ---------------------------------------------- | ----------------------------------------------------- |
| `agentSlice` 関連テスト                        | `createSkill` に `signal` を渡せること                |
| `SkillCreateWizard.test.tsx`                   | `startGeneration` の戻り値が `createSkill` に渡ること |
| `SkillCreateWizard.store-integration.test.tsx` | `signal` ありの統合動作が正常であること               |
| `useCancelGeneration.test.ts`                  | `startGeneration` が `AbortSignal` を返すこと         |

**合格基準**: FAIL 件数が 0 件であること

---

### タスク 4: コードレビューチェックリスト

**目的**: 実装の品質を多角的なチェックリストで確認する

**チェックリスト**:

#### 型安全性

- [ ] `createSkill` の型定義（L369）と実装（L1200）の引数シグネチャが一致している
- [ ] `signal` が `AbortSignal | undefined` として扱われている（`?` によるオプショナル）
- [ ] `signal?.aborted` の null セーフアクセスが正しく使われている

#### 後方互換性

- [ ] `signal` を渡さない既存の呼び出しコードが変更なしでビルドできる
- [ ] `signal` を渡さない場合と渡す場合で動作が変わらない（通常ケース）

#### キャンセル動作

- [ ] `signal.aborted === true` の場合、IPC 呼び出しを行わずに早期リターンする
- [ ] `cancelGeneration()` 呼び出し後に `signal.aborted` が `true` になることが確認できる

#### SkillCreateWizard.tsx

- [ ] `const signal = startGeneration()` で戻り値を受け取っている
- [ ] `createSkill(desc, options, context, signal)` の形で第4引数に `signal` を渡している
- [ ] `startGeneration()` の呼び出し順序（ロック確認後）が変わっていない

---

### タスク 5: 品質ゲートの最終判定

**目的**: タスク 1〜4 の結果を集約し、Phase 10 への進行可否を判定する

**品質ゲートチェックリスト**:

#### コード品質

- [ ] `pnpm --filter @repo/desktop typecheck` でエラーゼロ
- [ ] `pnpm --filter @repo/desktop lint` でエラーゼロ

#### テスト品質

- [ ] `pnpm --filter @repo/desktop test` で全テストが PASS

#### 実装品質

- [ ] コードレビューチェックリストの全項目がチェックされている

全項目がチェックされた場合のみ Phase 10 へ進む。
未達項目がある場合は原因と対処方針を記録し、修正後に再実行する。

---

## 参照資料

| 参照資料              | パス                                                               | 内容                  |
| --------------------- | ------------------------------------------------------------------ | --------------------- |
| agentSlice.ts         | `apps/desktop/src/renderer/store/slices/agentSlice.ts`             | 型チェック・lint 対象 |
| SkillCreateWizard.tsx | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` | 型チェック・lint 対象 |
| Phase 8 成果物        | `outputs/phase-8/refactoring-log.md`                               | リファクタリング結果  |

---

## 成果物

| 成果物           | パス                                      | 内容                                              |
| ---------------- | ----------------------------------------- | ------------------------------------------------- |
| 品質チェック結果 | `outputs/phase-9/quality-check-result.md` | typecheck・lint・テスト・コードレビューの結果集約 |

---

## サブタスク管理

| サブタスクID | 内容                         | ステータス |
| ------------ | ---------------------------- | ---------- |
| ST-9-01      | TypeScript 型チェック実行    | 未実施     |
| ST-9-02      | ESLint 静的解析実行          | 未実施     |
| ST-9-03      | 全テスト実行                 | 未実施     |
| ST-9-04      | コードレビューチェックリスト | 未実施     |
| ST-9-05      | 品質ゲート最終判定           | 未実施     |

---

## 完了条件

- [ ] `pnpm --filter @repo/desktop typecheck` でエラーゼロを確認している
- [ ] `pnpm --filter @repo/desktop lint` でエラーゼロを確認している
- [ ] `pnpm --filter @repo/desktop test` で全テストが PASS している
- [ ] コードレビューチェックリストの全項目がチェックされている
- [ ] `outputs/phase-9/quality-check-result.md` が生成されている

---

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次 Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/UT-CANCEL-004-01/phase-10-final-review.md`
