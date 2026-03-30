# task-imp-ci-quality-check-001: pnpm build/test/typecheck/lint 実行確認

## メタ情報

```yaml
issue_number: 1736
```

## メタ情報

| 項目         | 内容                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| タスクID     | task-imp-ci-quality-check-001                                               |
| タスク名     | pnpm build/test/typecheck/lint 実行確認                                     |
| 分類         | 改善（imp）                                                                 |
| 対象機能     | `SkillCreatorVerificationEngine` / `RuntimeSkillCreatorFacade` CI品質ゲート |
| 優先度       | 高（P0）                                                                    |
| 見積もり規模 | 小                                                                          |
| ステータス   | 未実施                                                                      |
| 発見元       | Phase 12                                                                    |
| 発見日       | 2026-03-29                                                                  |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-P0-01（verify-execution-engine-layer12）の Phase 13 が `blocked` 状態のまま停止している。
その直接原因は `outputs/phase-13/local-check-result.md` に「未実施」と明記された品質チェックが実行されていないことにある。

PR を作成するためには、ローカルで pnpm build / test / typecheck / lint を全て通過させる必要がある。
この検証が行われていない状態では、CI/CD パイプライン上で初めてエラーが検出されるリスクがあり、修正ラウンドが増加する。

### 1.2 問題点・課題

- `SkillCreatorVerificationEngine.ts`（新規追加）および `RuntimeSkillCreatorFacade.ts`（修正）に対して、型チェック・テスト・lint が実行されていない
- テスト25件はドキュメント上は PASS 記録があるが、実際の CI パイプラインでの確認が取れていない
- `packages/shared/src/types/skillCreator.ts` に追加された型定義が `@repo/desktop` 側の型チェックと整合しているか未確認

### 1.3 放置した場合の影響

- PR 作成後に CI が失敗し、修正・再プッシュのサイクルが発生する
- 型エラー・lint エラーが残存したまま main ブランチにマージされる
- チームレビュアーが CI 赤状態のまま PR を確認させられ、レビューコストが増加する

---

## 2. 何を達成するか（What）

### 2.1 目的

TASK-P0-01 で追加・修正した全ファイルに対して、ローカル品質チェック（typecheck / test / lint / shared build）を実施し、全て PASS した状態を証跡とともに記録する。

### 2.2 最終ゴール

1. `pnpm --filter @repo/desktop typecheck` がエラー0件で完了する
2. `pnpm --filter @repo/desktop test` のうち SkillCreatorVerificationEngine 関連25件が全て PASS する
3. `pnpm --filter @repo/desktop lint` がエラー0件（警告は許容範囲内）で完了する
4. `pnpm --filter @repo/shared build` が成功する
5. 各コマンドの出力を `outputs/phase-13/local-check-result.md` に記録し、Phase 13 の blocked を解除する

### 2.3 スコープ

#### 含むもの

- 下記4ファイルに対する品質チェック実行と結果記録
  - `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`
  - `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts`
  - `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
  - `packages/shared/src/types/skillCreator.ts`
- 発見したエラーの修正（軽微な型エラー・lint エラーの修正を含む）

#### 含まないもの

- 新機能の追加
- テストケースの新規追加（既存テストの修正は対象）
- PR 作成（本タスクは PR 作成の前提条件を満たすことが目的）

### 2.4 成果物

- `outputs/phase-13/local-check-result.md`（typecheck / test / lint / build の実行結果）
- 修正が発生した場合は対象ファイルの差分

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `pnpm install` が完了していること
- `packages/shared` のビルド成果物が最新であること（`pnpm --filter @repo/shared build` 実行済み）
- Node.js / pnpm のバージョンが `.nvmrc` / `package.json` の要件を満たしていること

### 3.2 依存タスク

- TASK-P0-01（verify-execution-engine-layer12）の Phase 1〜12 が完了していること（本タスクは Phase 13 を完了させるためのサポートタスク）

### 3.3 必要な知識

- pnpm monorepo でのフィルタコマンド構文
- Vitest の実行オプション（`--reporter=verbose` で詳細出力）
- TypeScript strict モードの型チェックポイント
- ESLint の `@typescript-eslint` ルール

### 3.4 推奨アプローチ

以下の順序で実行する（依存関係の都合で shared build を最初に行う）：

```bash
# Step 1: shared パッケージをビルド（型定義を生成）
pnpm --filter @repo/shared build

# Step 2: 型チェック（エラー検出が最も早い）
pnpm --filter @repo/desktop typecheck

# Step 3: テスト実行（VerificationEngine 関連に絞る場合）
pnpm --filter @repo/desktop test -- --reporter=verbose SkillCreatorVerificationEngine

# Step 4: 全テスト実行（リグレッション確認）
pnpm --filter @repo/desktop test

# Step 5: lint
pnpm --filter @repo/desktop lint
```

### 3.5 実装課題と解決策

| 課題                               | 想定原因                             | 解決策                                               |
| ---------------------------------- | ------------------------------------ | ---------------------------------------------------- |
| 型エラーが発生する                 | `@repo/shared` の build 成果物が古い | `pnpm --filter @repo/shared build` を先に実行        |
| テストが module not found でコケる | worktree の native module が未ビルド | `task-fix-worktree-native-binary-guard-001` を参照   |
| lint エラーが大量に出る            | 新規ファイルに未適用ルールがある     | `.eslintrc` の ignore パターンを確認した上で個別修正 |

---

## 4. 実行手順（Phase 構成）

### Phase 1: 事前確認

#### 目的

実行環境と対象ファイルの状態を確認する。

#### 手順

1. `git status` で変更ファイルを確認する
2. `pnpm --filter @repo/shared build` を実行し、成功を確認する
3. 対象ファイル4件が存在することを確認する

#### 成果物

- 実行環境確認ログ

#### 完了条件

- shared build が成功している
- 対象ファイル4件が存在する

---

### Phase 2: 型チェック実行と修正

#### 目的

TypeScript 型エラーをゼロにする。

#### 手順

1. `pnpm --filter @repo/desktop typecheck` を実行する
2. エラーが出た場合、エラーメッセージを確認し修正する
3. 再度 typecheck を実行し、エラー0件を確認する

#### 成果物

- typecheck 出力ログ
- 修正差分（エラーがあった場合）

#### 完了条件

- `pnpm --filter @repo/desktop typecheck` がエラー0件で終了する

---

### Phase 3: テスト実行

#### 目的

SkillCreatorVerificationEngine の全テスト25件と関連テストが PASS することを確認する。

#### 手順

1. `pnpm --filter @repo/desktop test -- --reporter=verbose SkillCreatorVerificationEngine` を実行する
2. 25件全て PASS することを確認する
3. `pnpm --filter @repo/desktop test` で全テストを実行しリグレッションがないことを確認する

#### 成果物

- テスト実行ログ（PASS/FAIL 件数）

#### 完了条件

- SkillCreatorVerificationEngine 関連テストが全件 PASS する
- 既存テストにリグレッションがない

---

### Phase 4: lint 実行と修正

#### 目的

lint エラーをゼロにする。

#### 手順

1. `pnpm --filter @repo/desktop lint` を実行する
2. エラーが出た場合、個別に修正する
3. 再度 lint を実行し、エラー0件を確認する

#### 成果物

- lint 出力ログ
- 修正差分（エラーがあった場合）

#### 完了条件

- `pnpm --filter @repo/desktop lint` がエラー0件で終了する

---

### Phase 5: 結果記録と Phase 13 blocked 解除

#### 目的

各チェックの結果を記録し、Phase 13 を完了状態にする。

#### 手順

1. `outputs/phase-13/local-check-result.md` に各コマンドの出力サマリを記録する
2. 記録フォーマット:
   - コマンド名
   - 実行日時
   - 結果（PASS / FAIL）
   - エラー件数
   - 備考
3. TASK-P0-01 の Phase 13 ステータスを `blocked` から `done` に更新する

#### 成果物

- `outputs/phase-13/local-check-result.md`（更新済み）

#### 完了条件

- 全チェック結果が記録されている
- Phase 13 ステータスが `done` になっている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `pnpm --filter @repo/shared build` が成功する
- [ ] `pnpm --filter @repo/desktop typecheck` がエラー0件で完了する
- [ ] `pnpm --filter @repo/desktop test` の SkillCreatorVerificationEngine 関連テストが全件 PASS する
- [ ] `pnpm --filter @repo/desktop test` 全体でリグレッションがない
- [ ] `pnpm --filter @repo/desktop lint` がエラー0件で完了する

### 品質要件

- [ ] 修正が入った場合、修正内容が最小限（スコープ外の変更を含まない）
- [ ] 型の any 使用がない（strict モード準拠）

### ドキュメント要件

- [ ] `outputs/phase-13/local-check-result.md` に全チェック結果が記録されている
- [ ] TASK-P0-01 の Phase 13 ステータスが更新されている

---

## 6. 検証方法

### テストケース

- Case 1: `pnpm --filter @repo/shared build` が exit code 0 で終了する
- Case 2: `pnpm --filter @repo/desktop typecheck` が exit code 0 で終了する
- Case 3: `pnpm --filter @repo/desktop test -- SkillCreatorVerificationEngine` で25件 PASS する
- Case 4: `pnpm --filter @repo/desktop lint` が exit code 0 で終了する

### 検証コマンド

```bash
# shared ビルド
pnpm --filter @repo/shared build

# 型チェック
pnpm --filter @repo/desktop typecheck

# VerificationEngine テスト（詳細表示）
pnpm --filter @repo/desktop test -- --reporter=verbose SkillCreatorVerificationEngine

# 全テスト
pnpm --filter @repo/desktop test

# lint
pnpm --filter @repo/desktop lint
```

---

## 7. リスクと対策

| リスク                                               | 影響度 | 発生確率 | 対策                                                                                  |
| ---------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------------- |
| worktree の native module 未ビルドでテストが失敗する | 高     | 中       | `task-fix-worktree-native-binary-guard-001` を参照して事前に native module をリビルド |
| shared build の型定義が古くて型エラーが発生する      | 中     | 高       | typecheck 前に必ず `pnpm --filter @repo/shared build` を実行する                      |
| lint の自動修正が意図しない変更を入れる              | 中     | 低       | `--fix` オプションを使う前に差分を確認し、スコープ外の変更が含まれないことを確認する  |
| テスト環境依存で CI と結果が異なる                   | 中     | 低       | `CI=true` 環境変数を付けてローカル実行し、CI と同条件で確認する                       |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/skill-creator-agent-sdk-lane/step-09-par-task-p0-01-verify-execution-engine-layer12/` （TASK-P0-01 仕様書群）
- `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`
- `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `packages/shared/src/types/skillCreator.ts`

### 関連タスク

- TASK-P0-01: verify-execution-engine-layer12（本タスクの前提・親タスク）
- `task-fix-worktree-native-binary-guard-001`（worktree native module 問題の対処）
- `task-imp-worktree-shared-build-protocol-001`（shared build プロトコル）

---

## 9. 備考

### 発見経緯

TASK-P0-01 の Phase 13 ステータス確認の際に `outputs/phase-13/local-check-result.md` が「未実施」状態であることを発見。Phase 13 の blocked 解除のために本タスクを分離した。

### 補足事項

本タスクは「実装ゼロ・チェック実行のみ」が理想的なケースであり、修正が発生した場合でも軽微な型修正・lint 修正に留めること。大規模な修正が必要な場合は、別タスクとして切り出して対応する。

テスト25件の PASS 記録がドキュメント上に存在するため、実際にエラーが発生するリスクは低い。しかし CI 環境と完全に同条件でのローカル実行は行われていないため、本タスクの実施価値は高い。
