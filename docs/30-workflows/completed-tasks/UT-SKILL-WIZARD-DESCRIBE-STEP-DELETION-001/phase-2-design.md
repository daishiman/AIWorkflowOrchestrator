# Phase 2: 設計

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 2                                                 |
| タスクID   | UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001        |
| タスク名   | DescribeStep.tsx / DescribeStep.test.tsx 物理削除 |
| 前提Phase  | Phase 1                                           |
| 後続Phase  | Phase 3                                           |
| 作成日     | 2026-04-11                                        |
| ステータス | 未実施                                            |

## 目的

`DescribeStep.tsx` と `DescribeStep.test.tsx` の物理削除手順を設計し、
削除前の参照確認・削除実行・削除後の検証コマンドを明確化する。
あわせて、Phase 4 で新規作成する `wizard-exports.test.ts` の barrel contract ガードも
設計に含める。

## 背景

Phase 1 で確認した通り、`DescribeStep.tsx` は `@deprecated` が付与されており、
`wizard/index.ts` からのエクスポートも既に削除済みである。
`DescribeStep.test.tsx` は `DescribeStep.tsx` に直結した companion test であるため、
本 Phase では両方をまとめて物理削除する前提で設計する。

## Concern 分析

本タスクは **2 concern**（参照確認→ファイル削除→検証のシーケンス、barrel contract ガードの新規作成）のため、単一設計書に集約する。

| Concern | 内容                                 | 影響ファイル                                                                                   |
| ------- | ------------------------------------ | ---------------------------------------------------------------------------------------------- |
| C-01    | 参照残留の確認                       | `apps/` および `packages/` 配下の全 .ts / .tsx ファイル                                        |
| C-02    | DescribeStep 系 2 ファイルの物理削除 | `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx` / `DescribeStep.test.tsx` |
| C-03    | 削除後の型チェック・テスト通過確認   | プロジェクト全体（typecheck）および `wizard-exports.test.ts`（Phase 4 で新規作成）             |

## Concern Topology Table

| Concern | 前提 Concern | 後続 Concern | 並行可否 |
| ------- | ------------ | ------------ | -------- |
| C-01    | -            | C-02         | -        |
| C-02    | C-01         | C-03         | -        |
| C-03    | C-02         | -            | -        |

## 設計方針

### 実行シーケンス

```
Step 1: 参照確認
  grep -r "import.*DescribeStep" apps/ packages/
  ↓ 結果が空であることを確認

Step 2: barrel contract ガードの準備
  wizard-exports.test.ts を Phase 4 で新規作成し、
  DescribeStep 非存在の contract を固定する

Step 3: 物理削除
  git rm apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx
  git rm apps/desktop/src/renderer/components/skill/wizard/DescribeStep.test.tsx

Step 4: 型チェック
  pnpm typecheck
  ↓ エラーなし

Step 5: テスト実行
  pnpm test
  ↓ wizard-exports.test.ts が PASS
```

### 削除前の参照確認コマンド（詳細）

```bash
# 1. import 文でのみ DescribeStep を参照しているファイルを全量確認
grep -r "import.*DescribeStep" apps/ packages/

# 2. export 文での再エクスポートも確認
grep -r "export.*DescribeStep" apps/ packages/

# 3. JSX 要素としての使用を確認（<DescribeStep）
grep -r "<DescribeStep" apps/ packages/

# 4. wizard/index.ts の現状確認（エクスポート削除済みの確認）
grep -n "DescribeStep" apps/desktop/src/renderer/components/skill/wizard/index.ts
```

### 削除コマンド

```bash
git rm apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx
git rm apps/desktop/src/renderer/components/skill/wizard/DescribeStep.test.tsx
```

### 削除後の検証コマンド

```bash
# AC-1: ファイル不存在の確認（コマンドが失敗すること）
ls apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx

# AC-2: companion test 不在の確認（コマンドが失敗すること）
ls apps/desktop/src/renderer/components/skill/wizard/DescribeStep.test.tsx

# AC-3: 型チェック通過
pnpm typecheck

# AC-4: import 参照なし
grep -r "import.*DescribeStep" apps/ packages/

# AC-5: wizard-exports.test.ts が PASS
pnpm test
```

## Validation Matrix

| AC   | 検証コマンド                                     | 期待結果            |
| ---- | ------------------------------------------------ | ------------------- |
| AC-1 | `ls apps/.../wizard/DescribeStep.tsx`            | No such file        |
| AC-2 | `ls apps/.../wizard/DescribeStep.test.tsx`       | No such file        |
| AC-3 | `pnpm typecheck`                                 | exit code 0         |
| AC-4 | `grep -r "import.*DescribeStep" apps/ packages/` | 出力なし（空）      |
| AC-5 | `pnpm test`                                      | wizard-exports PASS |

## 変更対象ファイル

| ファイル                                                                  | 変更種別 | 変更内容                |
| ------------------------------------------------------------------------- | -------- | ----------------------- |
| `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`      | 削除     | 物理削除                |
| `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.test.tsx` | 削除     | companion test 物理削除 |

## リスク評価

| リスク                                   | 確率 | 影響 | 対策                                                                             |
| ---------------------------------------- | ---- | ---- | -------------------------------------------------------------------------------- |
| 参照が残存していた場合の型エラー         | 低   | 高   | 削除前に `grep` 検索で参照ゼロを確認する                                         |
| wizard-exports.test.ts の未作成・破損    | 低   | 中   | Phase 4 で新規作成し、削除後も `DescribeStep` 非存在テストが維持されるか確認する |
| `wizard/index.ts` への再エクスポート残存 | 低   | 中   | `grep -n "DescribeStep" .../index.ts` で確認してから削除する                     |
| companion test の削除漏れ                | 低   | 中   | `DescribeStep.test.tsx` も `git rm` 対象に含める                                 |

## 参照資料

| 資料名       | パス                                         | 用途           |
| ------------ | -------------------------------------------- | -------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | Phase 1 成果物 |
| 参照確認結果 | `outputs/phase-1/import-search-result.md`    | Phase 1 成果物 |

## 実行タスク

実行手順を参照。

## 実行手順

1. Phase 1 の参照確認結果を確認し、残留が 0 件であることを再確認する
2. 削除前の全量参照検索コマンドを実行する
3. `wizard-exports.test.ts` を Phase 4 で新規作成する前提を明文化する
4. 削除実行コマンドを設計する
5. 削除後の検証コマンドを設計する
6. 設計書を outputs/phase-2/ に出力する

## 統合テスト連携

- 削除後に `pnpm typecheck` で型エラーがないことを確認
- `pnpm test` で `wizard-exports.test.ts` 全件 PASS を確認

## 多角的チェック観点

| 観点               | 確認内容                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------ |
| 責務境界           | 削除対象は `DescribeStep.tsx` と `DescribeStep.test.tsx` の 2 ファイルであることを確認する |
| 既存テストとの整合 | `wizard-exports.test.ts` の DescribeStep 非存在テストが削除後も有効であること              |
| 将来拡張性         | 削除後に同名ファイルが再作成されないようにテストがガードとして機能すること                 |

## 成果物

| 成果物            | パス                                       | 説明                               |
| ----------------- | ------------------------------------------ | ---------------------------------- |
| 設計書            | `outputs/phase-2/design-document.md`       | 削除シーケンスと検証コマンドの設計 |
| 参照検索計画      | `outputs/phase-2/reference-search-plan.md` | grep コマンド設計                  |
| Validation Matrix | `outputs/phase-2/validation-matrix.md`     | AC-1〜AC-5 検証マトリクス          |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Phase 1 成果物の確認
2. Concern topology の設計
3. 参照確認コマンドの設計
4. 削除・検証コマンドの設計
5. Validation Matrix の作成
6. 成果物出力

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

Phase 3: 設計レビューゲート
