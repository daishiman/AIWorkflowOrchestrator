# Phase 7: カバレッジ確認 — TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001

## メタ情報

| 項目       | 値                                        |
| ---------- | ----------------------------------------- |
| Phase      | 7                                         |
| 機能名     | packages/shared 型定義ディレクトリ統合    |
| タスク ID  | TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001 |
| 作成日     | 2026-02-28                                |
| 前提 Phase | Phase 6（テスト拡充）完了                 |
| 目的       | カバレッジ基準の充足確認                  |

## 目的

Phase 4〜6 で作成・拡充したテストのカバレッジが、プロジェクトの品質基準（02-code-quality.md 準拠）を満たしていることを最終確認する。基準未達の場合は Phase 6 に戻り、追加テストを作成する。

## カバレッジ基準

> 出典: `.claude/rules/02-code-quality.md`

| 指標              | 最低基準 | 推奨基準 | 根拠                    |
| ----------------- | -------- | -------- | ----------------------- |
| Line Coverage     | 80%      | 90%      | 02-code-quality.md 準拠 |
| Branch Coverage   | 60%      | 70%      | 02-code-quality.md 準拠 |
| Function Coverage | 80%      | 90%      | 02-code-quality.md 準拠 |

### 型定義ファイルに関する特記事項

移行対象の5ファイルは主に TypeScript の `type` / `interface` / `enum` 定義で構成される。以下の判断基準を適用する:

| ファイル内容              | カバレッジ計測対象 | 理由                                          |
| ------------------------- | ------------------ | --------------------------------------------- |
| `type` / `interface` 定義 | 対象外             | ランタイムコードを生成しない                  |
| `enum` 定義               | 対象               | JavaScript オブジェクトとしてコンパイルされる |
| `const` / 関数定義        | 対象               | ランタイムで実行されるコード                  |
| `export *` (re-export)    | 対象               | モジュール解決パスとして実行される            |

## 実行タスク

- Task 1: カバレッジ計測の実施
- Task 2: ファイル別カバレッジ分析
- Task 3: カバレッジギャップの特定と対応判断
- Task 4: カバレッジレポート作成

## 参照資料

| 資料名             | パス                                                                                                    | 説明                           |
| ------------------ | ------------------------------------------------------------------------------------------------------- | ------------------------------ |
| 実装サマリー       | `docs/30-workflows/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/outputs/phase-5/implementation-summary.md` | 移行実装と対象ファイルの確認   |
| テスト拡充レポート | `docs/30-workflows/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/outputs/phase-6/test-expansion-report.md`  | Phase 6 カバレッジ状況         |
| コード品質ルール   | `.claude/rules/02-code-quality.md`                                                                      | カバレッジ基準定義             |
| 既知の落とし穴     | `.claude/rules/06-known-pitfalls.md`                                                                    | P41（v8 カバレッジプロバイダ） |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                          | 内容                              |
| ---------------- | ----------------------------------------------------------------------------- | --------------------------------- |
| 品質要件         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   | カバレッジ閾値と品質ゲート        |
| 開発ガイドライン | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` | 計測・レポート記録の標準運用      |
| モノレポ構成     | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md`  | `shared`/`desktop` 検証境界の定義 |

## 実行手順

### Task 1: カバレッジ計測の実施

#### Step 1.1: 全テスト実行 + カバレッジ計測

```bash
cd packages/shared && pnpm vitest run --coverage src/types/
```

#### Step 1.2: カバレッジレポートの出力確認

`coverage/` ディレクトリに HTML レポートが生成されることを確認する。

### Task 2: ファイル別カバレッジ分析

#### Step 2.1: ファイル別カバレッジ記録

以下のテンプレートに計測値を記入:

| ファイル                      | Lines | Branches | Functions | 判定 |
| ----------------------------- | ----- | -------- | --------- | ---- |
| `src/types/auth.ts`           | \_\_% | \_\_%    | \_\_%     | ⬜   |
| `src/types/api-keys.ts`       | \_\_% | \_\_%    | \_\_%     | ⬜   |
| `src/types/common.ts`         | \_\_% | \_\_%    | \_\_%     | ⬜   |
| `src/types/workflow.ts`       | \_\_% | \_\_%    | \_\_%     | ⬜   |
| `src/types/file-selection.ts` | \_\_% | \_\_%    | \_\_%     | ⬜   |
| `src/types/index.ts`          | \_\_% | \_\_%    | \_\_%     | ⬜   |

**判定基準**:

- ✅: 全指標が最低基準以上
- ⚠️: 一部指標が最低基準未満だが推奨基準未満
- ❌: いずれかの指標が最低基準未満

#### Step 2.2: 未カバー箇所の特定

各ファイルの未カバー行・分岐を特定し、以下を記録:

- 未カバー箇所のコード行範囲
- 未カバーの理由（型定義のみ / テスト不足 / 到達不能コード）
- 追加テストの必要性判断

### Task 3: カバレッジギャップの特定と対応判断

#### Step 3.1: 基準未達ファイルの対応判断

| 判断                              | 対応                             |
| --------------------------------- | -------------------------------- |
| ランタイムコードの未カバーが原因  | Phase 6 に戻りテスト追加         |
| 型定義のみで計測対象外            | カバレッジレポートに理由を明記   |
| 到達不能コード（dead code）が原因 | Phase 8 のリファクタリングで対応 |

#### Step 3.2: 分岐カバレッジ重点箇所

以下の箇所は分岐カバレッジが不足しやすいため、重点的に確認:

- `enum` の全メンバーが参照されているか
- `const` オブジェクトの全プロパティがアクセスされているか
- バリデーション関数の全分岐がテストされているか

### Task 4: カバレッジレポート作成

`outputs/phase-7/coverage-report.md` に以下を記録:

1. カバレッジ計測コマンド
2. 全体カバレッジ値（基準との対比）
3. ファイル別カバレッジ値（判定マーク付き）
4. 未カバー箇所のリスク評価
5. 最終判定（PASS / FAIL → Phase 6 戻り）

## 統合テスト連携【必須】

| 検証対象               | 検証方法                     | Phase |
| ---------------------- | ---------------------------- | ----- |
| カバレッジ基準充足     | vitest --coverage の計測結果 | 7     |
| 型定義ファイル除外判断 | ファイル内容の手動分析       | 7     |
| 回帰なし確認           | 全テスト PASS                | 7     |

## Pitfall 対策チェックリスト

| Pitfall ID | 対策                                                           | 適用箇所       |
| ---------- | -------------------------------------------------------------- | -------------- |
| P37        | カバレッジ数値は実測値を使用（Phase 4 の想定値を使い回さない） | レポート作成   |
| P40        | テスト実行は `cd packages/shared` から行う                     | カバレッジ計測 |
| P41        | v8 カバレッジプロバイダのインライン関数カウントに注意          | 分析           |

## 成果物

| 成果物             | パス                                                                                             | 説明                     |
| ------------------ | ------------------------------------------------------------------------------------------------ | ------------------------ |
| カバレッジレポート | `docs/30-workflows/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/outputs/phase-7/coverage-report.md` | カバレッジ計測結果・判定 |

## 完了条件

- [ ] `pnpm vitest run --coverage src/types/` を実行完了
- [ ] 全体の Line Coverage が 80% 以上
- [ ] 全体の Branch Coverage が 60% 以上
- [ ] 全体の Function Coverage が 80% 以上
- [ ] ファイル別カバレッジ分析が完了
- [ ] 基準未達ファイルがある場合、Phase 6 戻りまたは理由の明記が完了
- [ ] カバレッジレポートを `outputs/phase-7/coverage-report.md` に記録
- [ ] Phase 4 + Phase 6 の全テスト（43 テスト）が PASS

## Phase 6 への戻りフロー

```
Phase 7 カバレッジ計測
├── 全基準達成 → Phase 8 へ進む
└── 基準未達
    ├── ランタイムコード未カバー → Phase 6 に戻りテスト追加
    ├── 型定義のみ → レポートに理由を明記して Phase 8 へ
    └── dead code → Phase 8 リファクタリングで対応後 Phase 7 再実行
```

## TDD 検証

```bash
# カバレッジ計測
cd packages/shared && pnpm vitest run --coverage src/types/

# 全テスト PASS 確認
cd packages/shared && pnpm vitest run src/types/__tests__/

# 特定ファイルのカバレッジ詳細
cd packages/shared && pnpm vitest run --coverage src/types/__tests__/build-artifacts.test.ts
cd packages/shared && pnpm vitest run --coverage src/types/__tests__/config-sync.test.ts
cd packages/shared && pnpm vitest run --coverage src/types/__tests__/module-resolution.test.ts
cd packages/shared && pnpm vitest run --coverage src/types/__tests__/edge-cases.test.ts
cd packages/shared && pnpm vitest run --coverage src/types/__tests__/regression.test.ts
```

## 次の Phase

- カバレッジ基準達成 → Phase 8（リファクタリング）へ進む
- カバレッジ基準未達 → Phase 6（テスト拡充）に戻り、不足テストを追加
