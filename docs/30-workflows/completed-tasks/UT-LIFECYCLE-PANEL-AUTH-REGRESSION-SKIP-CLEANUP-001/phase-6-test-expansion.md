# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                                            |
| ---------- | --------------------------------------------------------------- |
| PhaseID    | 6                                                               |
| Phase名    | テスト拡充                                                      |
| タスクID   | UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001             |
| タスク名   | SkillLifecyclePanel auth回帰テスト describe.skip クリーンアップ |
| 前Phase    | Phase 5                                                         |
| 次Phase    | Phase 7                                                         |
| 作成日     | 2026-04-18                                                      |
| ステータス | pending                                                         |

## 目的

本タスクは CLEANUP タスクであるため、Phase 6 は新規テストケースの追加を原則行わない。

Phase 5 のクリーンアップ完了後に以下を確認することが主体となる。

1. TC-01/TC-02/TC-04（既存 PASS テスト）との整合確認
2. 修正・有効化した TC-03/TC-05/TC-06/TC-07/TC-08 が全件 PASS することの確認
3. 削除した TC（分類C）のエッジケースが他のアクティブテストでカバーされているかの確認
4. 不要な import 文の整理

## 実行タスク

- [ ] auth-regression テスト全件を実行して PASS 状態を記録する
- [ ] TC-01/TC-02/TC-04（既存アクティブ）との整合を確認する
- [ ] 修正した TC-03/TC-05/TC-06/TC-07/TC-08 が全件 PASS することを確認する
- [ ] Phase 5 で削除した TC（分類C）のエッジケースカバレッジを確認する
- [ ] 不要な import 文を特定・整理する
- [ ] 補強が必要な場合のみ既存 describe 内に it を最小限追加する

## 参照資料

| 資料名                                       | パス                                                                                                | 用途                             |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 5 実装サマリー                         | `outputs/phase-5/implementation-summary.md`                                                         | 処置結果・削除 TC の確認         |
| Phase 5 変更ファイル一覧                     | `outputs/phase-5/changed-files.md`                                                                  | 変更内容の参照                   |
| SkillLifecyclePanel.auth-regression.test.tsx | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx` | クリーンアップ後のテスト構造確認 |
| SkillLifecyclePanel.test.tsx                 | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx`                 | 重複・補完確認                   |
| SkillLifecyclePanel.tsx                      | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                | 現行実装とのアサーション整合確認 |

## 実行手順

### 1. auth-regression テスト全件実行

```bash
# auth-regression テスト全件実行（verbose モードで全 TC の結果を確認）
pnpm --filter @repo/desktop test -- --reporter=verbose SkillLifecyclePanel.auth-regression \
  2>&1 | tee /tmp/auth-regression-green-phase.txt

# PASS / FAIL の集計
grep -E "✓|✗|Tests:" /tmp/auth-regression-green-phase.txt | tail -10
```

### 2. TC-01/TC-02/TC-04（既存 PASS テスト）との整合確認

Phase 5 のクリーンアップが既存のアクティブテストに副作用を与えていないことを確認する。

```bash
# TC-01/TC-02/TC-04 のテスト名を確認
grep -n "^describe(" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx

# TC-01/TC-02/TC-04 のみを対象に実行（テスト名フィルタリング）
pnpm --filter @repo/desktop test -- --reporter=verbose SkillLifecyclePanel.auth-regression \
  -t "TC-01\|TC-02\|TC-04" 2>/dev/null || \
pnpm --filter @repo/desktop test -- --reporter=verbose SkillLifecyclePanel.auth-regression
```

#### TC-01/TC-02/TC-04 整合確認チェックリスト

| TC ID | テスト名（概要） | Phase 5 前の状態 | Phase 5 後の状態 | 整合 |
| ----- | ---------------- | ---------------- | ---------------- | ---- |
| TC-01 | （実行時に記録） | PASS             | pending          |      |
| TC-02 | （実行時に記録） | PASS             | pending          |      |
| TC-04 | （実行時に記録） | PASS             | pending          |      |

### 3. 修正した TC の全件 PASS 確認

```bash
# 修正・有効化した TC（TC-03/TC-05/TC-06/TC-07/TC-08）が PASS することを確認
# テスト名でフィルタリング
pnpm --filter @repo/desktop test -- --reporter=verbose SkillLifecyclePanel.auth-regression \
  2>&1 | grep -E "TC-03|TC-05|TC-06|TC-07|TC-08|✓|✗"

# describe.skip が残っていないことを最終確認
grep -c "describe\.skip" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx
# → 0 が返ること
```

#### 修正 TC の PASS 確認チェックリスト

| TC ID | 処置（Phase 5 結果） | PASS 確認 |
| ----- | -------------------- | --------- |
| TC-03 | 修正/昇格 or 削除    | pending   |
| TC-05 | 修正/昇格 or 削除    | pending   |
| TC-06 | 修正/昇格 or 削除    | pending   |
| TC-07 | 修正/昇格 or 削除    | pending   |
| TC-08 | 修正/昇格 or 削除    | pending   |

### 4. 削除 TC のエッジケースカバレッジ確認

Phase 5 で分類C（フロー廃止）として削除した TC がある場合、
そのエッジケースが他のアクティブテストでカバーされているかを確認する。

```bash
# auth:login 非発火の検証が他のアクティブテストでカバーされているか確認
grep -n "auth:login\|mockAuthLogin" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx | \
  grep -v "describe\.skip" | head -20

# authModeSlice 関連テストの代替カバレッジを SkillLifecyclePanel.test.tsx で確認
grep -n "authMode\|auth:login" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx 2>/dev/null | \
  head -20
```

#### 削除 TC のエッジケースカバレッジ評価

Phase 5 の実装サマリーを参照して記録する（削除 TC がない場合は全行 N/A）。

| 削除 TC ID | エッジケース                        | 代替カバレッジ（アクティブテスト） | 評価 |
| ---------- | ----------------------------------- | ---------------------------------- | ---- |
| （なし）   | Phase 5 で全件修正/昇格の場合は N/A | N/A                                | N/A  |

### 5. 不要な import 文の確認と整理

```bash
# Phase 5 の削除・修正後に不要になった import を確認
# TypeScript の未使用変数エラーで検出
pnpm --filter @repo/desktop typecheck 2>&1 | \
  grep "auth-regression" | grep -i "unused\|import\|declared but"

# import 文の一覧を確認
grep -n "^import" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx | \
  head -20
```

不要な import が検出された場合は削除し、再度 typecheck でエラーがないことを確認する。

### 6. 補強の判断と最小限の対応

削除したエッジケースで代替カバレッジが不足している場合のみ、
既存のアクティブな describe 内に it を追加する（新規 describe は追加しない）。

**補強の判断基準**:

| 判断条件                                                            | 処置                                                    |
| ------------------------------------------------------------------- | ------------------------------------------------------- |
| 削除 TC のエッジケースが既存アクティブテストで完全にカバー済み      | 補強不要（N/A）                                         |
| `auth:login` の非発火検証が他のいかなるテストでもカバーされていない | 最も近い既存 describe 内に it を 1〜2 件追加            |
| 廃止フローに固有の動作（現行コードに存在しない）                    | 代替不要（廃止フロー固有の動作は現行 API に存在しない） |

```bash
# 補強がある場合の確認
pnpm --filter @repo/desktop test -- --reporter=verbose SkillLifecyclePanel.auth-regression

# 型チェック
pnpm --filter @repo/desktop typecheck
```

## 多角的チェック観点

| 観点                        | チェック内容                                                                                   |
| --------------------------- | ---------------------------------------------------------------------------------------------- |
| 全件 PASS の確認            | 修正・有効化した TC が全件 PASS し、かつ既存 TC-01/TC-02/TC-04 が引き続き PASS しているか      |
| `describe.skip` 0件の再確認 | Phase 5 のクリーンアップ後に `describe.skip` が残存していないことを本 Phase でも確認しているか |
| import 文の整合性           | 削除・修正後に未使用の import 文が残っておらず、TypeScript エラーが発生しないか                |
| スコープ遵守                | 新規 describe の追加がスコープ外として省略されているか（it の最小限追加のみ許容）              |
| 重複テスト排除              | `SkillLifecyclePanel.test.tsx` に同等テストが存在する場合に補強を省略しているか                |

## 統合テスト連携

| 判定項目                                             | 基準                    | 結果    |
| ---------------------------------------------------- | ----------------------- | ------- |
| auth-regression テスト全件 PASS                      | vitest が全 PASS        | pending |
| TC-01/TC-02/TC-04（既存アクティブ）の PASS 維持      | 3件とも PASS            | pending |
| TC-03/TC-05/TC-06/TC-07/TC-08 が PASS または削除済み | PASS または削除記録あり | pending |
| `describe.skip` 残存数が 0件                         | `grep -c` で 0          | pending |
| `pnpm --filter @repo/desktop typecheck` が PASS      | TypeScript エラーなし   | pending |

## 成果物

| 成果物               | パス                                    | 説明                                                 |
| -------------------- | --------------------------------------- | ---------------------------------------------------- |
| テスト全件 PASS 記録 | `outputs/phase-6/test-results-green.md` | 全 TC の実行結果・既存テストとの整合確認・補強の有無 |

## 完了条件

- [ ] auth-regression テスト全件実行済みで結果が記録済み
- [ ] TC-01/TC-02/TC-04（既存アクティブ）が PASS していることを確認済み
- [ ] TC-03/TC-05/TC-06/TC-07/TC-08 が全件 PASS または削除済みであることを確認済み
- [ ] `describe.skip` 残存数が 0件（`grep -c` で 0 を確認）
- [ ] 不要な import 文が整理済みで TypeScript エラーなし
- [ ] 補強が必要な場合のみ it を追加し、新規 describe は追加していない
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001
```

## 次Phase

Phase 7（テストカバレッジ確認）へ進む。
