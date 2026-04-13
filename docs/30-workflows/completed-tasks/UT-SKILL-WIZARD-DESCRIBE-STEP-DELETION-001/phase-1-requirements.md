# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 1                                                 |
| タスクID   | UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001        |
| タスク名   | DescribeStep.tsx / DescribeStep.test.tsx 物理削除 |
| 前提Phase  | -                                                 |
| 後続Phase  | Phase 2                                           |
| 作成日     | 2026-04-11                                        |
| ステータス | 未実施                                            |

## 目的

W2-seq-03b にて非推奨化済みの `DescribeStep.tsx` と、その直結テストである
`DescribeStep.test.tsx` を物理削除し、コードベースから完全に取り除くことで
デッドコードを排除する。

## 背景

W2-seq-03b で以下が完了済み：

- `wizard/index.ts` から `DescribeStep` のエクスポートを削除済み
- `DescribeStep.tsx` に `@deprecated` JSDoc を追加済み
- `GenerationMode` の import 先を `GenerateStep` に変更済み

本タスクはその後続として `DescribeStep.tsx` と `DescribeStep.test.tsx` を物理削除する。
`wizard-exports.test.ts` は Phase 4 で新規作成する barrel contract ガードテストであり、
削除後も `DescribeStep` の再露出を防ぐ。

## P50チェック（Step 0）

```bash
# 削除対象ファイルの現状確認
ls apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx
ls apps/desktop/src/renderer/components/skill/wizard/DescribeStep.test.tsx

# 参照残留の全量確認
grep -r "import.*DescribeStep" apps/ packages/

# wizard/index.ts のエクスポート一覧確認
grep -n "DescribeStep" apps/desktop/src/renderer/components/skill/wizard/index.ts

# barrel contract ガードの作成前提を確認
test ! -f apps/desktop/src/renderer/components/skill/wizard/__tests__/wizard-exports.test.ts
```

## タスク分類

**type**: NON_VISUAL（ファイル削除のみ、UI 変更なし）
**UI task**: NO（削除対象はコンポーネントだが、UI 変更はなし）
**docs-only task**: NO（ファイル物理削除を伴う）

## 実行タスク

- 参照確認: `import.*DescribeStep` パターンで全残留参照を確認する
- 要件整理: 削除前後の状態を受け入れ基準 AC-1〜AC-5 として定義する
- テスト確認: `wizard-exports.test.ts` を Phase 4 で新規作成する前提を確認する
- 影響範囲確認: `DescribeStep` に依存している箇所がないことを確認する

## 参照資料

### 実装・コード

| 資料名                | パス                                                                                 | 用途                        |
| --------------------- | ------------------------------------------------------------------------------------ | --------------------------- |
| 削除対象ファイル      | `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`                 | 現状確認・削除対象          |
| 削除対象ファイル      | `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.test.tsx`            | 現状確認・削除対象          |
| wizard barrel export  | `apps/desktop/src/renderer/components/skill/wizard/index.ts`                         | エクスポート状態の確認      |
| wizard-exports テスト | `apps/desktop/src/renderer/components/skill/wizard/__tests__/wizard-exports.test.ts` | Phase 4 で新規作成する確認  |
| GenerateStep          | `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`                 | GenerationMode 移動先の確認 |

### システム仕様（aiworkflow-requirements）

| 資料名         | パス                                                                        | 用途                   |
| -------------- | --------------------------------------------------------------------------- | ---------------------- |
| 品質要件       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | テスト品質基準         |
| 教訓           | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`      | デッドコード排除の事例 |
| リソースマップ | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`            | 抽出漏れ防止           |

## 受け入れ基準（Acceptance Criteria）

| ID   | 基準                                                                    | 検証方法                                                                                |
| ---- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| AC-1 | `DescribeStep.tsx` が存在しない                                         | `ls apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx` が失敗する      |
| AC-2 | `DescribeStep.test.tsx` が存在しない                                    | `ls apps/desktop/src/renderer/components/skill/wizard/DescribeStep.test.tsx` が失敗する |
| AC-3 | `pnpm typecheck` がエラーなく通過する                                   | `pnpm typecheck` が 0 exit code で完了する                                              |
| AC-4 | `DescribeStep` を import している箇所がない                             | `grep -r "import.*DescribeStep" apps/ packages/` の結果が空                             |
| AC-5 | `wizard-exports.test.ts` の DescribeStep 確認テストが新規作成・パスする | `pnpm test` 実行時に `wizard-exports.test.ts` が PASS する                              |

## 機能要件

| ID    | 要件                                                                          |
| ----- | ----------------------------------------------------------------------------- |
| FR-01 | `DescribeStep.tsx` がファイルシステム上に存在しない                           |
| FR-02 | `DescribeStep.test.tsx` がファイルシステム上に存在しない                      |
| FR-03 | `wizard/index.ts` に `DescribeStep` のエクスポートが含まれない（既存済み）    |
| FR-04 | `DescribeStep` を import している全ファイルが存在しない                       |
| FR-05 | `wizard-exports.test.ts` の DescribeStep 非存在テストが新規作成され、パスする |

## 非機能要件

| ID     | 要件                                     |
| ------ | ---------------------------------------- |
| NFR-01 | 削除による既存テストへの回帰がないこと   |
| NFR-02 | `pnpm typecheck` が通過すること          |
| NFR-03 | CI/CD パイプラインで問題なく動作すること |

## 因果ループ分析

**強化ループ（問題継続ループ）**:
`DescribeStep.tsx` / `DescribeStep.test.tsx` が残存 → デッドコードとして混乱を招く → 削除しにくくなる
→ `@deprecated` のみでコードが増え続ける → コードベース複雑化

**バランスループ（修正ループ）**:
物理削除の実施 → コードベースからデッドコード排除 → typecheck・test が PASS
→ コードベースがクリーンになる → 開発体験が改善

## 実行手順

1. `DescribeStep.tsx` と `DescribeStep.test.tsx` の現行状態をコマンドで確認する
2. `grep -r "import.*DescribeStep"` で参照残留を全量確認する
3. 参照が 0 件であることを確認する
4. 受け入れ基準 AC-1〜AC-5 を文書化する

## 統合テスト連携

- `pnpm typecheck` で型エラーがないことを確認
- `pnpm test` で Phase 4 で新規作成した `wizard-exports.test.ts` がパスすることを確認

## 多角的チェック観点

| 観点         | 確認内容                                                |
| ------------ | ------------------------------------------------------- |
| システム思考 | デッドコード残存の連鎖影響を因果ループで把握する        |
| 改善思考     | 物理削除によりコードベースのクリーンさを向上させる      |
| 影響範囲思考 | `DescribeStep` への直接参照・間接参照を漏れなく確認する |
| 逆説思考     | 削除せず残した場合に将来的に何が問題になるかを考える    |

## 成果物

| 成果物       | パス                                         | 説明                 |
| ------------ | -------------------------------------------- | -------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能要件と非機能要件 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC-1〜AC-5 の詳細    |
| 参照確認結果 | `outputs/phase-1/import-search-result.md`    | grep 検索結果の記録  |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. DescribeStep.tsx 現行状態確認
2. import 参照の全量検索
3. wizard-exports.test.ts の新規作成前提確認
4. 受け入れ基準 AC-1〜AC-5 定義
5. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成（仕様書として記録）
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001
```

## 次のPhase

Phase 2: 設計
