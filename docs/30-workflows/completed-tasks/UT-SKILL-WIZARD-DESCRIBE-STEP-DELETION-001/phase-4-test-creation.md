# Phase 4: テスト作成（TDD Red）

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 4                                                 |
| タスクID   | UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001        |
| タスク名   | DescribeStep.tsx / DescribeStep.test.tsx 物理削除 |
| 前提Phase  | Phase 3                                           |
| 後続Phase  | Phase 5                                           |
| 作成日     | 2026-04-11                                        |
| ステータス | 未実施                                            |

## 目的

`wizard-exports.test.ts` を新規作成し、`DescribeStep` が barrel export に再露出しないことを
固定する。あわせて、`DescribeStep.tsx` と `DescribeStep.test.tsx` の物理削除前に
contract guard を先に用意し、削除後も回帰しないことを保証する。

## Private Method テスト方針

本タスクは barrel contract のテスト作成であり、private method は存在しない。
`wizard-exports.test.ts` による export contract の固定と `pnpm typecheck` による統合検証で AC を確認する。

**判定: N/A**（private method テストは不要）

## Phase 4 事前確認: 現状の contract を確認

```bash
# 現在の barrel export を確認
grep -n "DescribeStep" \
  apps/desktop/src/renderer/components/skill/wizard/index.ts

# guard test がまだ未作成であることを確認
test ! -f apps/desktop/src/renderer/components/skill/wizard/__tests__/wizard-exports.test.ts
```

## TDD Red の考え方（本タスクにおける適用）

本タスクは「ガードテストの新規作成」であるため、通常の機能実装 TDD とは異なる。
以下の順序で Red / Green を確認する。

1. **削除前（現在）**: `wizard-exports.test.ts` は未作成
   - まず contract guard が不足している状態を確認する

2. **新規作成後**: `wizard-exports.test.ts` を追加する
   - `DescribeStep` が `wizard/index.ts` から export されていないことを検証する
   - 既存の公開 export が壊れていないことも同時に確認する

3. **Phase 5 実施後**: `DescribeStep.tsx` / `DescribeStep.test.tsx` を削除した状態で再実行する
   - 新規作成したガードテストが引き続き Green であることを確認する
   - `pnpm typecheck` もエラーなしで通過する

## テストマトリクス

| TC番号  | テスト名                                            | 対象ファイル                              | 期待結果       |
| ------- | --------------------------------------------------- | ----------------------------------------- | -------------- |
| TC-1-01 | wizard-exports.test.ts を新規作成する               | `wizard/__tests__/wizard-exports.test.ts` | 作成完了       |
| TC-1-02 | DescribeStep がエクスポートされていないこと         | `wizard/index.ts`                         | PASS           |
| TC-1-03 | pnpm typecheck 通過確認                             | プロジェクト全体                          | exit code 0    |
| TC-1-04 | import 参照の全量検索が空であること                 | `apps/` および `packages/`                | 出力なし（空） |
| TC-1-05 | wizard-exports.test.ts の実行結果が PASS であること | `wizard/__tests__/wizard-exports.test.ts` | PASS           |

## テスト検証コマンド

```bash
# TC-1-01: 新規作成後の guard test を確認
grep -n "DescribeStep" \
  apps/desktop/src/renderer/components/skill/wizard/__tests__/wizard-exports.test.ts

# TC-1-02: barrel export の contract を確認
grep -n "DescribeStep" \
  apps/desktop/src/renderer/components/skill/wizard/index.ts

# TC-1-03: 型チェック
pnpm typecheck

# TC-1-04: import 参照の全量検索
grep -r "import.*DescribeStep" apps/ packages/

# TC-1-05: guard test の実行
pnpm --filter @repo/desktop test -- wizard-exports --reporter=verbose
```

## Red テスト実行手順（削除前の状態確認）

Phase 5（実装＝削除）前に現在の状態を記録する。

```bash
# Step 1: wizard-exports.test.ts が未作成であることを確認
test ! -f apps/desktop/src/renderer/components/skill/wizard/__tests__/wizard-exports.test.ts

# Step 2: 現時点で barrel contract が壊れていないことを確認
grep -n "DescribeStep" apps/desktop/src/renderer/components/skill/wizard/index.ts

# Step 3: import 参照が 0 件であることを確認
grep -r "import.*DescribeStep" apps/ packages/

# Step 4: typecheck が PASS することを確認
pnpm typecheck
```

**削除実施の前提条件**:

- `DescribeStep` の import 参照が 0 件であること
- `pnpm typecheck` が通過すること
- `wizard-exports.test.ts` の新規作成内容が contract guard として成立していること

## IPC レスポンス形式

本タスクは IPC を含まないため N/A。

## 参照資料

| 資料名       | パス                                         | 用途           |
| ------------ | -------------------------------------------- | -------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | Phase 1 成果物 |
| 設計書       | `outputs/phase-2/design-document.md`         | Phase 2 成果物 |
| ゲート判定   | `outputs/phase-3/gate-decision.md`           | Phase 3 成果物 |

| wi
| 参照確認結果 | `outputs/phase-1/import-search-result.md` | Phase 1 成果物 |
| 参照検索計画 | `outputs/phase-2/reference-search-plan.md` | Phase 2 成果物 |
| Validation Matrix | `outputs/phase-2/validation-matrix.md` | Phase 2 成果物 |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | Phase 3 成果物 |

zard-exports テスト | `apps/desktop/src/renderer/components/skill/wizard/__tests__/wizard-exports.test.ts` | 新規作成対象 |

## 実行タスク

実行手順を参照。

## 実行手順

1. `wizard/index.ts` の DescribeStep contract を確認する
2. `wizard-exports.test.ts` を新規作成する
3. 新規作成した test が PASS することを記録する
4. `grep -r "import.*DescribeStep"` で参照ゼロを確認する
5. テストマトリクスの TC-1-01〜TC-1-05 を文書化する
6. 成果物を outputs/phase-4/ に出力する

## 統合テスト連携

- `pnpm test` で `wizard-exports.test.ts` 全件 PASS を確認
- `pnpm typecheck` で型エラーがないことを確認

## 多角的チェック観点

| 観点         | 確認内容                                                                |
| ------------ | ----------------------------------------------------------------------- |
| 網羅性       | TC-1-01〜TC-1-05 が AC-1〜AC-5 をすべてカバーしているか                 |
| 命名一貫性   | テスト名が AC 番号と対応しているか                                      |
| ガードテスト | `wizard-exports.test.ts` が再露出防止の contract guard として機能するか |
| 前提条件     | 参照ゼロの確認なしに削除を進めないよう手順が明確か                      |

## 成果物

| 成果物           | パス                                      | 説明                                |
| ---------------- | ----------------------------------------- | ----------------------------------- |
| テスト仕様書     | `outputs/phase-4/test-specification.md`   | テストマトリクスと検証コマンド      |
| 作成完了記録     | `outputs/phase-4/test-creation-result.md` | `wizard-exports.test.ts` の作成記録 |
| 前提条件確認結果 | `outputs/phase-4/precondition-check.md`   | 参照ゼロ・typecheck PASS の確認記録 |

## 完了条件

- [ ] テストマトリクスの TC-1-01〜TC-1-05 が定義済み
- [ ] `wizard-exports.test.ts` を新規作成した
- [ ] 参照ゼロの確認コマンドが定義されている
- [ ] 削除実施の前提条件が明文化されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. wizard.index.ts の DescribeStep contract 確認
2. `wizard-exports.test.ts` の新規作成
3. guard test の実行と結果記録
4. import 参照の全量検索（参照ゼロ確認）
5. テストマトリクス TC-1-01〜TC-1-05 の作成
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

Phase 5: 実装（DescribeStep.tsx / DescribeStep.test.tsx 物理削除）
