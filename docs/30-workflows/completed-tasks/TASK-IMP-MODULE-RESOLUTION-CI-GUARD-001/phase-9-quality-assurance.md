# Phase 9: 品質検証

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| タスクID   | TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001 |
| Phase      | 9                                       |
| 名称       | 品質検証                                |
| 前提Phase  | Phase 8（リファクタリング完了）         |
| 次Phase    | Phase 10（最終レビュー）                |
| ステータス | completed                               |

## 目的

Phase 8 までに完成したコードに対し、Lint・型チェック・全テスト実行・CIワークフロー構文検証を実施し、品質基準を満たしていることを確認する。

## aiworkflow-requirements 抽出要件の品質検証反映

| 要件ID | 出典仕様                  | 検証観点                                                     | 本Phaseでの反映先      |
| ------ | ------------------------- | ------------------------------------------------------------ | ---------------------- |
| Q1     | `quality-requirements.md` | lint / typecheck / テスト / CIの品質ゲートを維持する         | Task 1, Task 3, Task 4 |
| Q2     | `quality-requirements.md` | 三層整合の回帰防止として3スイートの健全性を確認する          | Task 4, 統合テスト連携 |
| Q3     | `deployment-gha.md`       | GitHub Actionsの依存関係・並列性が壊れていないことを確認する | Task 5                 |
| Q4     | `error-handling.md`       | 失敗時の判定を曖昧にせず、再実行可能な結果として記録する     | Task 6, 成果物         |

## 参照資料

| 資料                                     | パス / リンク                                                                                     |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Phase 8 リファクタリング                 | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/phase-8-refactoring.md`                |
| Phase 8 リファクタリングレポート         | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/outputs/phase-8/refactoring-report.md` |
| Phase 5 実装                             | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/phase-5-implementation.md`             |
| コード品質ルール                         | `.claude/rules/02-code-quality.md`                                                                |
| Git & ツーリングルール                   | `.claude/rules/07-git-and-tooling.md`                                                             |
| 既知の落とし穴（P11: PostToolUseフック） | `.claude/rules/06-known-pitfalls.md#P11`                                                          |
| 品質基準仕様                             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                       |
| GitHub Actions運用仕様                   | `.claude/skills/aiworkflow-requirements/references/deployment-gha.md`                             |
| エラーハンドリング仕様                   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                             |

## 実行タスク

- 実行タスク一覧: 本Phaseで定義したTaskを上から順に実施する

### Task 1: ESLint 検証

`scripts/check-shared-module-sync.ts` および関連テストファイルに対して ESLint を実行し、全ルールに準拠していることを確認する。

#### 実行コマンド

```bash
# ESLint キャッシュをクリアしてから実行（P11対策: PostToolUse フックによる自動修正後のキャッシュ不整合を防止）
pnpm eslint --no-cache scripts/check-shared-module-sync.ts scripts/__tests__/check-shared-module-sync.test.ts
```

#### 確認ポイント

| #   | 確認項目                                 | 期待結果    |
| --- | ---------------------------------------- | ----------- |
| 1   | ESLint が error 0 で終了する             | exit code 0 |
| 2   | `any` 型が使用されていない               | warning 0   |
| 3   | 未使用の import が存在しない             | warning 0   |
| 4   | `@ts-ignore` / `@ts-expect-error` がない | warning 0   |

#### P11 対策

PostToolUse フック（Prettier / ESLint の自動修正）がファイルを変更した場合、ESLint キャッシュに古い結果が残る。`--no-cache` オプションで常に新鮮な結果を取得する。

### Task 2: Prettier フォーマット検証

Prettier のフォーマットルールに準拠していることを確認する。

```bash
pnpm prettier --check scripts/check-shared-module-sync.ts scripts/__tests__/check-shared-module-sync.test.ts
```

### Task 3: TypeScript 型チェック

プロジェクト全体の TypeScript 型チェックを実行し、型エラーが0件であることを確認する。

```bash
pnpm typecheck
```

#### 確認ポイント

| #   | 確認項目                                         | 期待結果    |
| --- | ------------------------------------------------ | ----------- |
| 1   | `pnpm typecheck` が error 0 で終了する           | exit code 0 |
| 2   | `strict: true` モードで型エラーがない            | エラー 0 件 |
| 3   | 型アサーション（`as`）が不必要に使用されていない | 確認        |

### Task 4: 全テスト実行

チェックスクリプトのテストを実行し、全テストが PASS することを確認する。

```bash
pnpm vitest run scripts/__tests__/check-shared-module-sync.test.ts
```

#### 確認ポイント

| #   | 確認項目                                | 期待結果     |
| --- | --------------------------------------- | ------------ |
| 1   | 全テストが PASS する                    | FAIL 0 件    |
| 2   | テスト数が Phase 6/7 から変化していない | テスト数一致 |
| 3   | テスト実行時間が異常に長くない          | 30秒以内     |

### Task 5: CI ワークフロー構文検証

`.github/workflows/ci.yml` の YAML 構文が正しいことを確認する。

#### 検証方法

以下のいずれかの方法で検証する（上から優先順位順）:

1. **actionlint を使用**（インストール済みの場合）:

   ```bash
   actionlint .github/workflows/ci.yml
   ```

2. **YAML 構文チェック**:

   ```bash
   pnpm tsx -e "import { readFileSync } from 'fs'; import { parse } from 'yaml'; parse(readFileSync('.github/workflows/ci.yml', 'utf8')); console.log('YAML syntax OK')"
   ```

3. **手動検証**（上記が利用不可の場合）:
   以下のチェックリストで手動確認する

#### CI ワークフロー検証チェックリスト

| #   | 確認項目                                                           | 期待結果            |
| --- | ------------------------------------------------------------------ | ------------------- |
| 1   | `check-module-sync` ジョブが `jobs:` セクションに定義されている    | 定義あり            |
| 2   | `check-module-sync` のインデントが他ジョブと揃っている             | YAML インデント整合 |
| 3   | `runs-on: ubuntu-latest` が設定されている                          | 設定あり            |
| 4   | `timeout-minutes: 2` が設定されている                              | 設定あり            |
| 5   | `pnpm install --frozen-lockfile` ステップがある                    | ステップあり        |
| 6   | `pnpm tsx scripts/check-shared-module-sync.ts` ステップがある      | ステップあり        |
| 7   | `build` ジョブの `needs` 配列に `check-module-sync` が含まれている | 含まれている        |
| 8   | `check-module-sync` ジョブが `build-shared` に依存していない       | 依存なし            |

### Task 6: 実プロジェクトでの動作確認

チェックスクリプトを実プロジェクトファイルに対して実行し、正常終了することを確認する。

```bash
pnpm tsx scripts/check-shared-module-sync.ts
echo "Exit code: $?"
```

#### 確認ポイント

- exit code が 0 であること（現在の3層は TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 で整合済み）
- `✅ ALL CHECKS PASSED` が出力されること

---

## 実行手順

1. ESLint キャッシュをクリアして ESLint を実行する（Task 1）
2. Prettier フォーマット検証を実行する（Task 2）
3. TypeScript 型チェックを実行する（Task 3）
4. 全テストを実行する（Task 4）
5. CI ワークフローの構文を検証する（Task 5）
6. 実プロジェクトでチェックスクリプトを実行する（Task 6）
7. 全タスクの結果を `outputs/phase-9/` に記録する

---

## 統合テスト連携

| 連携項目          | 内容                                                                                                                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 主要スイート      | `packages/shared/src/__tests__/module-resolution.test.ts` / `apps/desktop/src/__tests__/shared-module-resolution.test.ts` / `apps/desktop/src/__tests__/vitest-alias-consistency.test.ts` |
| このPhaseでの扱い | 本Phaseの成果を3スイートと `scripts/check-shared-module-sync.ts` の期待値に反映し、差分が出た場合は仕様に戻って整合を取る                                                                 |
| 失敗時の戻り先    | 要件不整合はPhase 1、設計不整合はPhase 2、実装不整合はPhase 5/6に戻す                                                                                                                     |

## 成果物

| #   | 成果物           | パス                                                                                          |
| --- | ---------------- | --------------------------------------------------------------------------------------------- |
| 1   | 品質検証レポート | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/outputs/phase-9/quality-report.md` |

### 品質検証レポートの記載フォーマット

```markdown
## 品質検証結果

### ESLint

- 実行コマンド: `pnpm eslint --no-cache scripts/check-shared-module-sync.ts scripts/__tests__/check-shared-module-sync.test.ts`
- 結果: PASS / FAIL
- Error 数: 0
- Warning 数: 0

### Prettier

- 実行コマンド: `pnpm prettier --check ...`
- 結果: PASS / FAIL

### TypeScript 型チェック

- 実行コマンド: `pnpm typecheck`
- 結果: PASS / FAIL
- エラー数: 0

### テスト実行

- 実行コマンド: `pnpm vitest run scripts/__tests__/check-shared-module-sync.test.ts`
- 総テスト数: XX 件
- PASS: XX 件
- FAIL: 0 件

### CI ワークフロー構文

- 検証方法: actionlint / YAML parse / 手動チェック
- 結果: PASS / FAIL

### 実プロジェクト実行

- 実行コマンド: `pnpm tsx scripts/check-shared-module-sync.ts`
- Exit code: 0
- 出力: ✅ ALL CHECKS PASSED

## 総合判定

[PASS: Phase 10 へ進む / FAIL: 失敗項目を修正し再検証]
```

---

## 完了条件

- [ ] ESLint が error 0 / warning 0 で PASS している（`--no-cache` オプション使用）
- [ ] Prettier フォーマットチェックが PASS している
- [ ] `pnpm typecheck` が error 0 で PASS している
- [ ] 全テストが PASS している（FAIL 0 件）
- [ ] CI ワークフロー（`.github/workflows/ci.yml`）の構文が正しい
- [ ] `check-module-sync` ジョブの定義が Phase 5 の仕様と一致している
- [ ] `build` ジョブの `needs` に `check-module-sync` が含まれている
- [ ] 実プロジェクトで `pnpm tsx scripts/check-shared-module-sync.ts` が exit code 0 で終了する
- [ ] 品質検証レポートが `outputs/phase-9/quality-report.md` に記録されている

## 次Phase

Phase 10（最終レビュー）へ進む。
