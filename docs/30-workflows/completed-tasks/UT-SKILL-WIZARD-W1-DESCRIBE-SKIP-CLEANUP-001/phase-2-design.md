# Phase 2: 設計

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 2                                              |
| タスクID   | UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001   |
| タスク名   | describe.skip 内の旧 testid 参照クリーンアップ |
| 前提Phase  | Phase 1                                        |
| 後続Phase  | Phase 3                                        |
| 作成日     | 2026-04-11                                     |
| ステータス | 未実施                                         |

## 目的

`describe.skip` ブロック内の旧 testid `skill-lifecycle-request-input` 参照について、
削除するか現行 testid へ書き換えるかの方針を決定し、実装計画を確定する。

## 背景

Phase 1 で特定した旧 testid 参照箇所に対して、2つの選択肢がある:

1. **削除方針**: 旧 testid を参照する `getByTestId` 呼び出しごと削除する
2. **書き換え方針**: 現行 UI（遷移ボタン化後）に存在する testid へ書き換える

本 Phase では現行 SkillLifecyclePanel の testid 一覧を確認し、適切な方針を決定する。

## Concern分析

本タスクは **1 concern**（testid 参照クリーンアップのみ）のため、単一設計書に集約する。

| Concern | 内容                               | 影響ファイル                                                                                   |
| ------- | ---------------------------------- | ---------------------------------------------------------------------------------------------- |
| C-01    | 旧 testid 参照の削除または書き換え | `SkillLifecyclePanel.llm-generation.test.tsx` / `SkillLifecyclePanel.auth-regression.test.tsx` |

## 設計内容

### 削除方針 vs 書き換え方針の決定

| 観点       | 削除方針                                       | 書き換え方針                                                 |
| ---------- | ---------------------------------------------- | ------------------------------------------------------------ |
| シンプルさ | 参照行ごと削除するだけで完結                   | 現行 testid を調査して適切な対応先を選定する必要がある       |
| テスト価値 | `describe.skip` 状態のためテスト価値はほぼゼロ | 現行 UI に合わせた内容にすれば将来スキップ解除時に有用になる |
| 影響範囲   | 最小限（参照行のみ削除）                       | テストの意図を理解して書き換える必要があり、工数が増加する   |
| リスク     | 低（削除により型エラー・参照エラーが消える）   | 書き換え先の testid が正しいか確認が必要                     |

**採用方針**: 削除方針を基本とする。`describe.skip` ブロックはスキップ状態を維持し、
旧 testid を参照している `getByTestId("skill-lifecycle-request-input")` の呼び出し行を削除または
コメントアウトする。テストケースの構造（`it` ブロック）は可能な限り残す。

### 現行 testid 一覧（確認対象）

Phase 1 の P50チェックで確認する現行 SkillLifecyclePanel の testid 一覧を記録する。
（実行時に `grep -rn "data-testid" apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` で確認）

### `describe.skip` ブロックの扱い方針

| 方針項目                     | 決定内容                                                   |
| ---------------------------- | ---------------------------------------------------------- |
| `describe.skip` の解除       | 解除しない（本タスクのスコープ外）                         |
| `describe.skip` ブロック自体 | 削除しない（将来の復活・書き換えを妨げない）               |
| `it` / `test` ブロック       | 旧 testid 参照行を削除するが、テストケース構造は維持を検討 |
| 型エラーが発生する場合の対処 | 参照行の削除により型エラーが解消されることを確認する       |

### 変更対象ファイル

| ファイル                                                                                            | 変更種別 | 変更内容                                               |
| --------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------ |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx`  | 修正     | 旧 testid `skill-lifecycle-request-input` 参照行を削除 |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx` | 修正     | 旧 testid `skill-lifecycle-request-input` 参照行を削除 |

### 検証コマンド設計

```bash
# 1. 旧 testid 参照が全件削除されたことの確認
grep -rn "skill-lifecycle-request-input" apps/desktop/src/renderer/components/skill/__tests__/
# → 0件であること

# 2. describe.skip ブロックが維持されていることの確認
grep -n "describe.skip" apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
grep -n "describe.skip" apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx

# 3. テスト実行（アクティブテストが PASS すること）
pnpm --filter @repo/desktop test:run

# 4. 型チェック
pnpm --filter @repo/desktop typecheck
```

## 参照資料

| 資料名       | パス                                         | 用途              |
| ------------ | -------------------------------------------- | ----------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物    |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC-1〜AC-5 の確認 |

## 実行タスク

- 現行 SkillLifecyclePanel の testid 一覧を確認・記録する
- 削除方針 vs 書き換え方針を最終決定する
- 変更対象ファイルと変更箇所の一覧を確定する
- 設計書を `outputs/phase-2/` に出力する

## 実行手順

1. Phase 1 の受け入れ基準を確認する
2. 現行 SkillLifecyclePanel の testid 一覧を `grep` で確認する
3. 削除方針を採用するかを最終判断する
4. 変更対象ファイルと変更内容を設計書に記録する
5. 検証コマンドを定義する
6. 設計書を `outputs/phase-2/` に出力する

## 統合テスト連携

- 変更前後で `pnpm --filter @repo/desktop test:run` が PASS し続けることを確認
- `pnpm --filter @repo/desktop typecheck` が PASS することを確認

## 多角的チェック観点

| 観点                 | 確認内容                                                                           |
| -------------------- | ---------------------------------------------------------------------------------- |
| 責務境界             | 変更がテストファイル2件のみに限定されていることを明示する                          |
| 最小変更原則         | 旧 testid 参照行の削除のみで AC を満たせるか確認する                               |
| 将来拡張性           | `describe.skip` 解除時に備えた内容になっているか（本タスクのスコープ外として明記） |
| `describe.skip` 維持 | スキップ解除は本タスクのスコープ外であることを明示する                             |

## 成果物

| 成果物                   | パス                                     | 説明                       |
| ------------------------ | ---------------------------------------- | -------------------------- |
| 設計書                   | `outputs/phase-2/design-document.md`     | 削除方針・変更計画の詳細   |
| testidクリーンアップ計画 | `outputs/phase-2/testid-cleanup-plan.md` | 変更箇所一覧・検証コマンド |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 現行 testid 一覧の確認（未実施）
2. 削除方針の最終決定（未実施）
3. 変更対象ファイル・変更箇所の確定（未実施）
4. 検証コマンド定義（未実施）
5. 成果物出力（未実施）

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成（仕様書として記録）
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001
```

## 次のPhase

Phase 3: 設計レビューゲート
