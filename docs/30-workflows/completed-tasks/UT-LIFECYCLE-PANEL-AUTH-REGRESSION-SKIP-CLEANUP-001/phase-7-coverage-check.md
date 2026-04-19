# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 内容                                                            |
| ---------- | --------------------------------------------------------------- |
| PhaseID    | 7                                                               |
| Phase名    | テストカバレッジ確認                                            |
| タスクID   | UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001             |
| タスク名   | SkillLifecyclePanel auth回帰テスト describe.skip クリーンアップ |
| 前Phase    | Phase 6                                                         |
| 次Phase    | Phase 8（リファクタリング）                                     |
| 作成日     | 2026-04-18                                                      |
| ステータス | pending                                                         |

## 目的

Phase 5〜6 のクリーンアップ・拡充後、`SkillLifecyclePanel.tsx` の `auth:login` 関連コードパスの
テストカバレッジが品質基準（Line 80%+・Branch 60%+・Function 80%+）を満たすかを実測する。

`describe.skip` が解消されたことで、`auth:login` 非発火を検証するテストが実際に実行される
ようになり、カバレッジの正確性が向上したことを確認する。

また、本タスクの受け入れ条件 AC-1〜AC-5 との対応（トレーサビリティ）を記録する。

## 実行タスク

- [ ] `SkillLifecyclePanel.tsx` を対象にカバレッジを計測する
- [ ] `auth:login` 関連の Line / Branch / Function カバレッジを確認する
- [ ] 品質基準（Line 80%+・Branch 60%+・Function 80%+）の達成可否を判定する
- [ ] 品質基準未達の指標がある場合、未到達行・分岐を特定して対応要否を判定する
- [ ] トレーサビリティマトリクス（AC-1〜AC-5 × テスト ID）を作成する

## 参照資料

| 資料名                                       | パス                                                                                                | 用途                             |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 5 実装サマリー                         | `outputs/phase-5/implementation-summary.md`                                                         | クリーンアップ内容の確認         |
| Phase 6 テスト全件 PASS 記録                 | `outputs/phase-6/test-results-green.md`                                                             | 全件 PASS の前提確認             |
| SkillLifecyclePanel.auth-regression.test.tsx | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx` | クリーンアップ後のテストファイル |
| SkillLifecyclePanel.test.tsx                 | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx`                 | 複合カバレッジへの貢献確認       |
| SkillLifecyclePanel.tsx                      | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                | カバレッジ計測対象ファイル       |

## 実行手順

### 1. カバレッジ実行コマンド

#### 1-1. auth-regression テストのみでカバレッジ計測

```bash
# auth-regression テストのみで SkillLifecyclePanel.tsx のカバレッジを計測
pnpm --filter @repo/desktop exec vitest run \
  --coverage \
  --coverage.include="src/renderer/components/skill/SkillLifecyclePanel.tsx" \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx \
  2>&1 | tee /tmp/auth-regression-coverage.txt

# 結果の確認
grep -A 10 "SkillLifecyclePanel" /tmp/auth-regression-coverage.txt
```

#### 1-2. SkillLifecyclePanel 関連テスト全体での複合カバレッジ計測

```bash
# SkillLifecyclePanel 関連テスト全体（auth-regression + test.tsx）での複合カバレッジ計測
pnpm --filter @repo/desktop exec vitest run \
  --coverage \
  --coverage.include="src/renderer/components/skill/SkillLifecyclePanel.tsx" \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel \
  2>&1 | tee /tmp/lifecycle-coverage-all.txt

# 結果の確認
grep -A 10 "SkillLifecyclePanel" /tmp/lifecycle-coverage-all.txt
```

#### 1-3. テキストレポートで詳細確認

```bash
# text レポーターでカバレッジ詳細を確認
pnpm --filter @repo/desktop exec vitest run \
  --coverage \
  --coverage.reporter=text \
  --coverage.include="src/renderer/components/skill/SkillLifecyclePanel.tsx" \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel \
  2>&1 | grep -A 30 "SkillLifecyclePanel"
```

### 2. `auth:login` 関連の Line / Branch / Function カバレッジ確認

`SkillLifecyclePanel.tsx` 内の `auth:login` 関連コードパスに絞ったカバレッジを確認する。

```bash
# auth:login 関連の実装箇所を特定
grep -n "auth:login\|authLogin\|electronAPI.*auth\|skillCreatorAPI" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx

# auth フロー制御の分岐箇所を確認（if / ternary / && 等）
grep -n "authMode\|isAuthenticated\|auth" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx | head -30

# HTML レポートで未到達行・分岐を詳細確認（品質基準未達時）
pnpm --filter @repo/desktop exec vitest run \
  --coverage \
  --coverage.reporter=html \
  --coverage.include="src/renderer/components/skill/SkillLifecyclePanel.tsx" \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel

ls apps/desktop/coverage/ 2>/dev/null || echo "coverage ディレクトリが未生成"
```

### 3. トレーサビリティ（AC-1〜AC-5 との対応）

受け入れ条件と対応するテスト ID のマッピングを確認する。

```bash
# 各 TC の describe 名称を確認してAC との対応を整理
grep -n "^describe\b" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx

# it ブロックの一覧確認
grep -n "^\s*it(" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx | \
  head -30
```

## カバレッジ目標テーブル

| 指標     | 品質基準 | 計測結果（auth-regression のみ） | 計測結果（全体複合） | 合否    |
| -------- | -------- | -------------------------------- | -------------------- | ------- |
| Line     | 80%+     | pending                          | pending              | pending |
| Branch   | 60%+     | pending                          | pending              | pending |
| Function | 80%+     | pending                          | pending              | pending |

### 品質基準未達時の対応判断基準

| 未到達コードの種類                                      | 対応方針                                                               |
| ------------------------------------------------------- | ---------------------------------------------------------------------- |
| `auth:login` を呼び出す分岐（現行コードに存在する場合） | Phase 6 の補強方針と照合し、追加の it 追加の要否を判断する             |
| 廃止フロー固有のコードパス（現行コードから削除済み）    | N/A（廃止済みのため対応不要）                                          |
| `authModeSlice` の state 変化に対応する分岐             | TC-08 昇格/削除の結果を確認し、カバレッジ低下の原因を特定する          |
| UI ガード系の分岐（rapid clicks / re-render 等）        | TC-06/TC-07 の昇格結果を確認し、テストが分岐をカバーしているか検証する |

## トレーサビリティマトリクス

受け入れ条件（AC）と対応するテスト ID のマッピング。
AC の内容は Phase 1〜3 の成果物から転記する（実行時に記録）。

| AC ID | 受け入れ条件（概要）                                     | 対応テスト ID | カバレッジ確認 |
| ----- | -------------------------------------------------------- | ------------- | -------------- |
| AC-1  | タイムアウト発生時に auth:login が呼ばれない             | TC-03         | pending        |
| AC-2  | 未認証ユーザーのスキル生成時に auth:login が呼ばれない   | TC-05         | pending        |
| AC-3  | 連打時に auth:login が複数回呼ばれない                   | TC-06         | pending        |
| AC-4  | コンポーネント再レンダリング時に auth:login が呼ばれない | TC-07         | pending        |
| AC-5  | authModeSlice の state 変化で auth:login が呼ばれない    | TC-08         | pending        |

※ AC の内容は仮記載。Phase 1〜3 の成果物（`outputs/phase-1/requirements.md` 等）を参照して
正確な受け入れ条件に更新すること。

### `describe.skip` 解消前後の比較

| 指標                 | 解消前（Phase 1 時点） | 解消後（本 Phase 計測） | 変化    |
| -------------------- | ---------------------- | ----------------------- | ------- |
| `describe.skip` 件数 | 5件                    | pending（計測後記録）   | pending |
| アクティブな TC 数   | pending                | pending                 | pending |
| PASS するテスト数    | pending                | pending                 | pending |
| Line カバレッジ      | pending（過小評価）    | pending（正確値）       | pending |
| Branch カバレッジ    | pending（過小評価）    | pending（正確値）       | pending |

### 全体品質の最終確認

```bash
# describe.skip 残存数の最終確認
echo "--- 残存 describe.skip 数 ---"
grep -c "describe\.skip" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx

# アクティブな describe 数の確認
echo "--- アクティブな describe 数 ---"
grep -c "^describe(" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx

# desktop 全テスト実行
pnpm --filter @repo/desktop test:run

# 型チェック
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/desktop lint
```

## 多角的チェック観点

| 観点                     | チェック内容                                                                                               |
| ------------------------ | ---------------------------------------------------------------------------------------------------------- |
| カバレッジの正確性       | `describe.skip` 解消によって `auth:login` 関連コードパスのカバレッジが正確な値になっているか               |
| Branch カバレッジの改善  | TC-06（連打）・TC-07（再レンダリング）・TC-08（state変化）の昇格が Branch カバレッジの改善に貢献しているか |
| トレーサビリティの完全性 | AC-1〜AC-5 の全てに対応するテスト ID が存在し、いずれかがカバレッジに貢献しているか                        |
| 品質基準未達時の判断     | 未到達コードが廃止フローの残骸ではなく、現行 API のテスト漏れであることを確認しているか                    |
| 複合カバレッジの整合性   | auth-regression テストと `SkillLifecyclePanel.test.tsx` の合算カバレッジで品質基準を満たすか               |

## 統合テスト連携

| 判定項目                                      | 基準                             | 結果    |
| --------------------------------------------- | -------------------------------- | ------- |
| `SkillLifecyclePanel.tsx` Line カバレッジ     | 80%+                             | pending |
| `SkillLifecyclePanel.tsx` Branch カバレッジ   | 60%+                             | pending |
| `SkillLifecyclePanel.tsx` Function カバレッジ | 80%+                             | pending |
| `describe.skip` 残数                          | 0件（全解消）                    | pending |
| AC-1〜AC-5 の全てにテスト ID が対応           | トレーサビリティマトリクスが完成 | pending |
| `pnpm --filter @repo/desktop test:run`        | PASS                             | pending |
| `pnpm --filter @repo/desktop typecheck`       | PASS                             | pending |

## 成果物

| 成果物                     | パス                                     | 説明                                                         |
| -------------------------- | ---------------------------------------- | ------------------------------------------------------------ |
| カバレッジレポート         | `outputs/phase-7/coverage-report.md`     | 計測結果・品質基準合否・describe.skip 解消前後比較・N/A 記録 |
| トレーサビリティマトリクス | `outputs/phase-7/traceability-matrix.md` | AC-1〜AC-5 と対応テスト ID のマッピング・カバレッジ確認結果  |

## 完了条件

- [ ] `SkillLifecyclePanel.tsx` を対象にカバレッジ計測済み
- [ ] Line カバレッジが 80%+ を達成（または未達理由が記録済み）
- [ ] Branch カバレッジが 60%+ を達成（または未達理由が記録済み）
- [ ] Function カバレッジが 80%+ を達成（または未達理由が記録済み）
- [ ] `describe.skip` 件数が Phase 1 時点（5件）から削減されていることが記録済み
- [ ] トレーサビリティマトリクス（AC-1〜AC-5 × テスト ID）が作成済み
- [ ] `pnpm --filter @repo/desktop test:run` が PASS
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS
- [ ] カバレッジレポート（`outputs/phase-7/coverage-report.md`）が作成済み
- [ ] トレーサビリティマトリクス（`outputs/phase-7/traceability-matrix.md`）が作成済み
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

Phase 8（リファクタリング）へ進む。
