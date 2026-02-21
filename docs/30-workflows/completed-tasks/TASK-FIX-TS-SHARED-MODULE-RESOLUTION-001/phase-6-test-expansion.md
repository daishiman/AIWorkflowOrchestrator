# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 6                                        |
| 機能名 | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 |
| 作成日 | 2026-02-20                               |

## 目的

Phase 5 で修正したモジュール解決設定のカバレッジを拡充し、全サブパスエクスポートの網羅的な検証テスト、`apps/web` および `apps/backend` での同様エラー不在の確認、リグレッション防止テストを追加する。

## 実行タスク

- カバレッジ分析: Phase 5 の修正箇所に対するカバレッジ測定と不足領域の特定
- 全サブパスエクスポートの網羅的テスト追加: 27 サブパス全てに対して import 解決とエクスポート内容の正当性を検証する
- クロスパッケージ検証テスト: `apps/web` と `apps/backend` から `@repo/shared` の import が解決できることを確認する
- リグレッション防止テスト: exports パス不整合の再発を防止する自動チェックテストを追加する
- 統合テスト: `@repo/shared` のビルド出力と TypeScript 解決の end-to-end 整合性を検証する

## 参照資料

| 資料名                 | パス                                                                                  | 説明                                   |
| ---------------------- | ------------------------------------------------------------------------------------- | -------------------------------------- |
| Phase 5 typecheck 結果 | `outputs/phase-5/typecheck-result.md`                                                 | 修正後の typecheck エラー 0 件確認記録 |
| Phase 5 設計変更記録   | `outputs/phase-5/design-changes.md`                                                   | Phase 2 からの乖離記録（該当する場合） |
| Phase 4 テスト仕様     | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/phase-4-test-creation.md` | テストケース設計                       |
| shared package.json    | `packages/shared/package.json`                                                        | 修正済 exports/typesVersions 定義      |
| shared tsup.config.ts  | `packages/shared/tsup.config.ts`                                                      | ビルドエントリポイント定義             |
| 品質要件               | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`           | カバレッジ閾値・alias運用              |
| テスト実装パターン     | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`     | テスト追加方針                         |
| 教訓集                 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                | 再発防止観点                           |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                                                  | P8, P40 対策                           |

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 実行手順

### ステップ 1: カバレッジ測定

Phase 5 で修正した設定ファイルに対するテストカバレッジを測定する。

```bash
# shared パッケージのテストカバレッジ
cd packages/shared && pnpm vitest run --coverage

# desktop パッケージのテストカバレッジ
cd apps/desktop && pnpm vitest run --coverage
```

### ステップ 2: ギャップ分析

Phase 4 で作成したテスト（T-MR-_, T-TSR-_, T-VAC-\*）に対して、以下の不足領域を特定する:

| テスト不足パターン                 | 確認方法                                                            |
| ---------------------------------- | ------------------------------------------------------------------- |
| 未検証のサブパスエクスポート       | 27 サブパスのうち Phase 4 で T-TSR テストが存在しないサブパスの特定 |
| エクスポート内容の正当性未検証     | import したモジュールの型・値が期待通りかの検証が不足している箇所   |
| ビルド出力との整合性未検証         | `dist/` のファイル存在確認テストが不足している箇所                  |
| クロスパッケージでの解決検証未実施 | `apps/web`、`apps/backend` からの import 解決テストが不在           |

### ステップ 3: 全サブパスエクスポートの網羅的テスト追加

#### 3-1. 全サブパス import 解決テスト

**ファイル配置**: `apps/desktop/src/__tests__/shared-subpath-exhaustive.test.ts`

Phase 4 の T-TSR テストで未カバーのサブパスに対して、import 解決テストを追加する。

全 27 サブパスの網羅的テスト:

| テスト ID | サブパス                                          | 検証内容                                       |
| --------- | ------------------------------------------------- | ---------------------------------------------- |
| T-EXH-01  | `@repo/shared`                                    | ルートエクスポートの型・値が存在する           |
| T-EXH-02  | `@repo/shared/core`                               | core モジュールの型・値が存在する              |
| T-EXH-03  | `@repo/shared/infrastructure`                     | infrastructure モジュールの型・値が存在する    |
| T-EXH-04  | `@repo/shared/infrastructure/auth`                | auth モジュールの型・値が存在する              |
| T-EXH-05  | `@repo/shared/infrastructure/database`            | database モジュールの型・値が存在する          |
| T-EXH-06  | `@repo/shared/infrastructure/ai/apiKeyValidator`  | apiKeyValidator の型・値が存在する             |
| T-EXH-07  | `@repo/shared/types`                              | types メインエクスポートの型が存在する         |
| T-EXH-08  | `@repo/shared/types/auth`                         | auth 型定義が存在する                          |
| T-EXH-09  | `@repo/shared/types/api-keys`                     | api-keys 型定義が存在する                      |
| T-EXH-10  | `@repo/shared/types/replace`                      | replace 型定義が存在する                       |
| T-EXH-11  | `@repo/shared/types/rag`                          | rag 型定義が存在する                           |
| T-EXH-12  | `@repo/shared/types/rag/result`                   | rag/result 型定義が存在する                    |
| T-EXH-13  | `@repo/shared/types/llm`                          | llm 型定義が存在する                           |
| T-EXH-14  | `@repo/shared/types/llm/schemas`                  | llm/schemas 型定義が存在する                   |
| T-EXH-15  | `@repo/shared/types/skill`                        | skill 型定義が存在する                         |
| T-EXH-16  | `@repo/shared/types/agent`                        | agent 型定義が存在する                         |
| T-EXH-17  | `@repo/shared/types/auth-mode`                    | auth-mode 型定義が存在する                     |
| T-EXH-18  | `@repo/shared/agent`                              | agent モジュールの型・値が存在する             |
| T-EXH-19  | `@repo/shared/schemas`                            | schemas モジュールの型・値が存在する           |
| T-EXH-20  | `@repo/shared/schemas/auth`                       | schemas/auth モジュールの型・値が存在する      |
| T-EXH-21  | `@repo/shared/constants`                          | constants モジュールの型・値が存在する         |
| T-EXH-22  | `@repo/shared/repositories`                       | repositories モジュールの型・値が存在する      |
| T-EXH-23  | `@repo/shared/src/ipc/channels`                   | ipc/channels モジュールの型・値が存在する      |
| T-EXH-24  | `@repo/shared/services/history/types`             | history/types モジュールの型が存在する         |
| T-EXH-25  | `@repo/shared/services/history/history-service`   | history-service モジュールの型・値が存在する   |
| T-EXH-26  | `@repo/shared/services/logging/types`             | logging/types モジュールの型が存在する         |
| T-EXH-27  | `@repo/shared/services/logging/conversion-logger` | conversion-logger モジュールの型・値が存在する |

#### 3-2. エクスポート内容の正当性検証テスト

**ファイル配置**: `packages/shared/src/__tests__/exports-content-validation.test.ts`

各サブパスがエクスポートすべき型・関数・定数が実際にエクスポートされていることを検証する。

テスト項目:

| テスト ID | テスト名                                   | 検証内容                                                         |
| --------- | ------------------------------------------ | ---------------------------------------------------------------- |
| T-ECV-01  | ルートエクスポートが期待する型・関数を含む | `index.ts` の re-export が全て解決可能であることを検証           |
| T-ECV-02  | agent エクスポートが SDK 関連型を含む      | `AgentConfig`, `AgentSession` 等の型が存在することを検証         |
| T-ECV-03  | types エクスポートが基本型を含む           | 基本的な共有型が全て含まれることを検証                           |
| T-ECV-04  | schemas エクスポートが Zod スキーマを含む  | バリデーションスキーマが実際に関数として利用可能であることを検証 |

### ステップ 4: クロスパッケージ検証テスト

`apps/web` と `apps/backend` から `@repo/shared` の import が解決できることを確認する。

#### 4-1. apps/web の typecheck 確認

```bash
# apps/web の typecheck（Cannot find module エラーがないことを確認）
cd apps/web && pnpm typecheck 2>&1 | grep "Cannot find module '@repo/shared'" | wc -l
```

期待結果: **0 件**

#### 4-2. apps/backend の typecheck 確認

```bash
# apps/backend の typecheck
cd apps/backend && pnpm typecheck 2>&1 | grep "Cannot find module '@repo/shared'" | wc -l
```

期待結果: **0 件**

#### 4-3. クロスパッケージ検証テストファイル

**ファイル配置**: `packages/shared/src/__tests__/cross-package-resolution.test.ts`

| テスト ID | テスト名                                                  | 検証内容                                             |
| --------- | --------------------------------------------------------- | ---------------------------------------------------- |
| T-CPR-01  | apps/desktop の tsconfig.json が @repo/shared を解決可能  | tsconfig.json の paths/references 設定の正当性を検証 |
| T-CPR-02  | apps/web の tsconfig.json が @repo/shared を解決可能      | web パッケージの TypeScript 設定の正当性を検証       |
| T-CPR-03  | apps/backend の tsconfig.json が @repo/shared を解決可能  | backend パッケージの TypeScript 設定の正当性を検証   |
| T-CPR-04  | ルート tsconfig.json の references が @repo/shared を含む | プロジェクト参照設定の正当性を検証                   |

### ステップ 5: リグレッション防止テスト

**ファイル配置**: `packages/shared/src/__tests__/exports-regression.test.ts`

exports パス不整合の再発を防止する自動チェックテスト:

| テスト ID | テスト名                                                           | 検証内容                                                         |
| --------- | ------------------------------------------------------------------ | ---------------------------------------------------------------- |
| T-REG-01  | 新しい tsup entry 追加時に exports への対応追加を強制する          | tsup entries と exports keys の差分を検出                        |
| T-REG-02  | exports の types パスが全て一貫したパターンに従う                  | `dist/` パスの階層が tsup entry のソースパスと一致することを検証 |
| T-REG-03  | typesVersions と exports の全キーが一致する（アプローチ A の場合） | typesVersions に定義がない exports サブパスを検出                |
| T-REG-04  | vitest alias と exports の全キーが一致する                         | alias に定義がない exports サブパスを検出                        |
| T-REG-05  | exports の types パスに対応するソースファイルが存在する            | ビルド出力パスから逆算したソースファイルの実在確認               |

### ステップ 6: 統合テスト

**ファイル配置**: `packages/shared/src/__tests__/build-resolution-integration.test.ts`

ビルド出力と TypeScript 解決の end-to-end 整合性を検証する:

| テスト ID | テスト名                                                                | 検証内容                                                     |
| --------- | ----------------------------------------------------------------------- | ------------------------------------------------------------ |
| T-INT-01  | `pnpm --filter @repo/shared build` 後に全 exports types パスが存在する  | ビルド出力に全 `.d.ts` ファイルが含まれることを検証          |
| T-INT-02  | `pnpm --filter @repo/shared build` 後に全 exports import パスが存在する | ビルド出力に全 `.js` ファイルが含まれることを検証            |
| T-INT-03  | exports の types/import パスのペアが整合している                        | 各サブパスの `.d.ts` と `.js` のパス階層が一致することを検証 |

### ステップ 7: 全テスト再実行

```bash
# shared パッケージのテスト実行
cd packages/shared && pnpm vitest run

# desktop パッケージのテスト実行
cd apps/desktop && pnpm vitest run

# カバレッジ測定
cd apps/desktop && pnpm vitest run --coverage
cd packages/shared && pnpm vitest run --coverage
```

全テストが PASS することを確認する。

## 統合テスト連携【必須】

| テストカテゴリ           | 検証項目                                                               | 目標 |
| ------------------------ | ---------------------------------------------------------------------- | ---- |
| サブパスエクスポート網羅 | 全 27 サブパスの import 解決が成功すること                             | 100% |
| エクスポート内容正当性   | 各サブパスのエクスポート型・値が期待通りであること                     | 100% |
| クロスパッケージ解決     | desktop/web/backend の全パッケージで typecheck エラーが 0 件であること | 100% |
| ビルド出力整合性         | build 後の dist/ 内容と exports 定義が完全一致すること                 | 100% |
| リグレッション防止       | exports/tsup/alias の3定義の整合性が自動検証されること                 | 80%+ |

## 実装時の注意事項（既知の Pitfall 対策）

| Pitfall ID | 注意事項                              | 対策                                                                               |
| ---------- | ------------------------------------- | ---------------------------------------------------------------------------------- |
| P8         | 幽霊依存                              | テストファイルで import するモジュールが `package.json` に宣言されていることを確認 |
| P9         | モジュールスコープ変数リーク          | `fs.readFileSync` 等の結果をテストごとにリセットする                               |
| P40        | テスト実行ディレクトリ依存            | テスト実行は `cd apps/desktop && pnpm vitest run` で行う                           |
| P41        | v8 カバレッジのインライン関数カウント | カバレッジ測定時にインライン関数の影響を考慮する                                   |

## 成果物

| 成果物                     | パス                                                                 | 説明                                       |
| -------------------------- | -------------------------------------------------------------------- | ------------------------------------------ |
| カバレッジレポート         | `outputs/phase-6/coverage-report.md`                                 | カバレッジ分析結果と基準達成状況           |
| 網羅的サブパステスト       | `apps/desktop/src/__tests__/shared-subpath-exhaustive.test.ts`       | 全 27 サブパスの import 解決テスト         |
| エクスポート内容検証テスト | `packages/shared/src/__tests__/exports-content-validation.test.ts`   | エクスポート内容の正当性検証テスト         |
| クロスパッケージ検証テスト | `packages/shared/src/__tests__/cross-package-resolution.test.ts`     | web/backend からの解決検証テスト           |
| リグレッション防止テスト   | `packages/shared/src/__tests__/exports-regression.test.ts`           | exports パス不整合の再発防止テスト         |
| ビルド解決統合テスト       | `packages/shared/src/__tests__/build-resolution-integration.test.ts` | ビルド出力と TypeScript 解決の整合性テスト |

## 完了条件

- [ ] Phase 5 修正箇所のカバレッジが測定されている
- [ ] 全 27 サブパスエクスポートに対する網羅的テスト（T-EXH-01〜27）が作成され PASS している
- [ ] エクスポート内容の正当性検証テスト（T-ECV-\*）が作成され PASS している
- [ ] `apps/web` の typecheck で `Cannot find module '@repo/shared'` エラーが 0 件である
- [ ] `apps/backend` の typecheck で `Cannot find module '@repo/shared'` エラーが 0 件である
- [ ] クロスパッケージ検証テスト（T-CPR-\*）が作成され PASS している
- [ ] リグレッション防止テスト（T-REG-\*）が作成され PASS している
- [ ] ビルド解決統合テスト（T-INT-\*）が作成され PASS している
- [ ] `cd apps/desktop && pnpm vitest run` で全テストが PASS する
- [ ] `cd packages/shared && pnpm vitest run` で全テストが PASS する
- [ ] カバレッジレポート（`outputs/phase-6/coverage-report.md`）が作成されている
- [ ] カバレッジ基準を満たしている（Line 80%+, Branch 60%+, Function 80%+）
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## サブタスク管理

Phase 実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 5 成果物の読み込み）
2. ステップ 1: カバレッジ測定
3. ステップ 2: ギャップ分析
4. ステップ 3: 全サブパスエクスポートの網羅的テスト追加
5. ステップ 4: クロスパッケージ検証テスト
6. ステップ 5: リグレッション防止テスト追加
7. ステップ 6: 統合テスト追加
8. ステップ 7: 全テスト再実行
9. 成果物の作成・配置
10. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク 100% 実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

## 次の Phase

Phase 7: テストカバレッジ確認
