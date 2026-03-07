# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 9                                  |
| 機能名 | store-lifecycle-integration-design |
| 作成日 | 2026-03-06                         |

## 目的

Phase 5-8 の成果物に対し、Lint・型チェック・全テスト実行・P31 回帰確認を行い、Phase 10（最終レビュー）に進む品質基準を充足していることを保証する。

## 実行タスク

- `pnpm lint` を実行し、ESLint 違反がないことを確認する
- `pnpm typecheck` を実行し、TypeScript 型エラーがないことを確認する
- 全テストを実行し、PASS することを確認する
- P31 回帰テストを再確認する

## 参照資料

| 参照資料       | パス                                                                         | 使用目的             |
| -------------- | ---------------------------------------------------------------------------- | -------------------- |
| Phase 5 成果物 | `phase-5-implementation.md`                                                  | 実装範囲の確認       |
| Phase 6 成果物 | `phase-6-test-expansion.md`                                                  | テスト範囲の確認     |
| Phase 7 成果物 | `phase-7-coverage-check.md`                                                  | カバレッジ結果       |
| Phase 8 成果物 | `phase-8-refactoring.md`                                                     | リファクタリング内容 |
| 品質要件       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | 品質ゲート基準       |
| 状態管理仕様   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | P31 対策確認         |

## 実行手順

### Step 1: ESLint 実行

```bash
pnpm --filter @repo/desktop lint
```

#### 確認事項

| チェック項目    | 期待結果                         |
| --------------- | -------------------------------- |
| エラー（error） | 0 件                             |
| 警告（warning） | 既存の警告数以下（新規警告なし） |
| 未使用 import   | 0 件                             |
| any 型使用      | 0 件（新規追加分）               |

#### 問題発生時の対応

- ESLint error: 即座に修正し再実行
- ESLint warning: 新規追加分のみ修正。既存の warning は変更しない

### Step 2: TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

#### 確認事項

| チェック項目                      | 期待結果                   |
| --------------------------------- | -------------------------- |
| 型エラー                          | 0 件                       |
| `as` 型アサーション               | 新規追加なし               |
| `@ts-ignore` / `@ts-expect-error` | 新規追加なし               |
| 個別セレクタの戻り値型            | 明示的に定義されていること |

#### 型整合の重点確認

| 確認対象           | 確認内容                                                  |
| ------------------ | --------------------------------------------------------- |
| `ImportedSkill` 型 | `packages/shared/src/types/skill.ts` との整合（P32 準拠） |
| `SkillMetadata` 型 | `packages/shared/src/types/skill.ts` との整合             |
| selector 戻り値型  | `store/index.ts` のセレクタ定義と実装の一致               |

### Step 3: 全テスト実行

```bash
cd apps/desktop
pnpm exec vitest run src/renderer/store/slices/__tests__/agentSlice*.test.ts
```

#### 確認事項

| チェック項目   | 期待結果                                      |
| -------------- | --------------------------------------------- |
| 全テスト PASS  | 失敗テスト 0 件                               |
| テスト実行時間 | 既存ベースラインの 2 倍以内                   |
| テスト間独立性 | 実行順序に依存するテストがないこと（P9 対策） |

#### テスト環境の確認（P40 対策）

- テスト実行は `apps/desktop` ディレクトリから行う
- `vitest.config.ts` の `environment: 'happy-dom'` が適用されることを確認
- プロジェクトルートからの実行は `pnpm --filter @repo/desktop exec vitest run` を使用

### Step 4: P31 回帰テスト再確認

Phase 6 で追加した P31 回帰テストを単独で実行し、個別セレクタの参照安定性を再確認する。

```bash
cd apps/desktop
pnpm exec vitest run src/renderer/store/slices/__tests__/agentSlice.p31-regression.test.ts
```

#### 追加確認

| 確認項目               | 方法                                                                                                                   |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 合成 Hook 不使用       | `grep -rn "useSkillStore()" src/renderer/components/skill/` で 0 件                                                    |
| 個別セレクタの依存配列 | `useEffect` の依存配列に個別セレクタのアクションのみ含まれること                                                       |
| `useShallow` 使用箇所  | 配列を返す selector（`useAvailableSkillsForImport`, `useFilteredAvailableSkills`）で `useShallow` が使用されていること |

### Step 5: 品質ゲート判定

全 Step の結果を統合し、Phase 10 に進める品質基準を判定する。

| ゲート     | 基準                        | 判定        |
| ---------- | --------------------------- | ----------- |
| ESLint     | error 0 件                  | PASS / FAIL |
| TypeScript | 型エラー 0 件               | PASS / FAIL |
| テスト     | 全 PASS                     | PASS / FAIL |
| カバレッジ | Phase 7 基準充足            | PASS / FAIL |
| P31        | 回帰テスト PASS + grep 確認 | PASS / FAIL |

#### 判定結果

| 結果          | 条件                   | 対応                     |
| ------------- | ---------------------- | ------------------------ |
| 全 PASS       | 全ゲートが PASS        | Phase 10 へ進む          |
| いずれか FAIL | ESLint/TypeScript 失敗 | 修正後 Step 1-2 再実行   |
| いずれか FAIL | テスト失敗             | Phase 5-6 に戻り修正     |
| いずれか FAIL | カバレッジ未達         | Phase 6 に戻りテスト追加 |

## 統合テスト連携

- 本 Phase は全 Step を逐次実行し、前 Step の PASS を確認してから次 Step に進む
- FAIL が発生した場合は該当 Phase に差し戻し、修正後に本 Phase を再実行する
- 品質ゲート判定結果を Phase 10（最終レビュー）の入力として引き渡す

## 多角的チェック観点

| 観点       | チェック内容                           |
| ---------- | -------------------------------------- |
| Lint       | ESLint error/warning が基準内          |
| 型安全     | TypeScript strict モードで型エラーなし |
| テスト     | 全テスト PASS、実行時間が妥当          |
| カバレッジ | Phase 7 の基準を維持                   |
| P31        | 回帰テスト PASS、合成 Hook 不使用      |
| P9         | テスト間独立性が確保されている         |
| P40        | テスト実行ディレクトリが正しい         |

## 成果物

| 成果物                     | パス             | 説明                            |
| -------------------------- | ---------------- | ------------------------------- |
| 品質ゲート判定記録         | Phase 9 実行ログ | 全 Step の PASS/FAIL 判定と根拠 |
| 修正コミット（必要な場合） | git log          | Lint/型エラー修正               |

## 完了条件

- [ ] `pnpm lint` でエラー 0 件
- [ ] `pnpm typecheck` で型エラー 0 件
- [ ] 全テストが PASS
- [ ] P31 回帰テストが PASS
- [ ] 合成 Hook（`useSkillStore()`）が対象コンポーネントで使用されていないことを確認
- [ ] 品質ゲート判定で全項目 PASS
- [ ] Phase 10 への引き渡し準備が完了

## 次のPhase

Phase 10: 最終レビュー (`phase-10-final-review.md`)
