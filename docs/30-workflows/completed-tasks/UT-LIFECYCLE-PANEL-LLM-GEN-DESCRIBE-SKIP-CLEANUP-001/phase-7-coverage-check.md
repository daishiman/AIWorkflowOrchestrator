# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| PhaseID    | 7                                                              |
| Phase名    | テストカバレッジ確認                                           |
| タスクID   | UT-LIFECYCLE-PANEL-LLM-GEN-DESCRIBE-SKIP-CLEANUP-001           |
| タスク名   | SkillLifecyclePanel LLM生成テスト describe.skip クリーンアップ |
| 前Phase    | Phase 6                                                        |
| 次Phase    | Phase 8（リファクタリング）                                    |
| 作成日     | 2026-04-18                                                     |
| ステータス | pending                                                        |

## 目的

Phase 5〜6 のクリーンアップ・拡充後、`SkillLifecyclePanel.tsx` のテストカバレッジが
品質基準（Statements 80%・Branch 60%・Functions 80%・Lines 80%）を満たすかを実測する。
describe.skip が解消されたことでカバレッジの正確性が向上したことを確認し、
不足があれば Phase 6 の補強方針と照合して追加対応の要否を判定する。

## 実行タスク

- [ ] `SkillLifecyclePanel.tsx` を対象にカバレッジを計測する
- [ ] Statements / Branch / Functions / Lines の各指標が品質基準を達成しているか確認する
- [ ] describe.skip 解消前後でカバレッジが正確化されたことを記録する
- [ ] 品質基準を下回る指標がある場合、未到達行・分岐を特定して対応要否を判定する
- [ ] 削除テストに起因するカバレッジ低下がある場合は N/A として記録する

## 参照資料

| 資料名                                      | パス                                                                                               | 用途                               |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Phase 5 実装サマリー                        | `outputs/phase-5/implementation-summary.md`                                                        | クリーンアップ内容の確認           |
| Phase 6 テスト拡充ログ                      | `outputs/phase-6/test-expansion-log.md`                                                            | 補強の有無・エッジケース評価の確認 |
| SkillLifecyclePanel.llm-generation.test.tsx | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | クリーンアップ後のテストファイル   |
| SkillLifecyclePanel.test.tsx                | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx`                | 複合カバレッジへの貢献確認         |
| SkillLifecyclePanel.tsx                     | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               | カバレッジ計測対象ファイル         |

## 実行手順

### 1. カバレッジ計測（SkillLifecyclePanel.tsx 単体）

```bash
# SkillLifecyclePanel.tsx を対象に llm-generation テストファイルでカバレッジ計測
pnpm --filter @repo/desktop exec vitest run \
  --coverage \
  --coverage.include="src/renderer/components/skill/SkillLifecyclePanel.tsx" \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx \
  2>&1 | tee /tmp/lifecycle-coverage-llm-gen.txt

# 結果の確認
grep -A 10 "SkillLifecyclePanel" /tmp/lifecycle-coverage-llm-gen.txt
```

### 2. カバレッジ計測（SkillLifecyclePanel 関連テスト全体）

```bash
# SkillLifecyclePanel 関連テスト全体でカバレッジ計測（複合カバレッジの確認）
pnpm --filter @repo/desktop exec vitest run \
  --coverage \
  --coverage.include="src/renderer/components/skill/SkillLifecyclePanel.tsx" \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel \
  2>&1 | tee /tmp/lifecycle-coverage-all.txt

# 結果の確認
grep -A 10 "SkillLifecyclePanel" /tmp/lifecycle-coverage-all.txt
```

### 3. テキストレポートでの詳細確認

```bash
# text レポーターでカバレッジ詳細を確認
pnpm --filter @repo/desktop exec vitest run \
  --coverage \
  --coverage.reporter=text \
  --coverage.include="src/renderer/components/skill/SkillLifecyclePanel.tsx" \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel \
  2>&1 | grep -A 30 "SkillLifecyclePanel"
```

### 4. 品質基準の確認

```bash
# 品質基準チェック（各指標と閾値の比較）
cat /tmp/lifecycle-coverage-all.txt | \
  grep -E "Statements|Branch|Functions|Lines" | head -10
```

#### 品質基準チェックリスト

| 指標       | 品質基準 | 計測結果 | 合否    |
| ---------- | -------- | -------- | ------- |
| Statements | 80%+     | pending  | pending |
| Branch     | 60%+     | pending  | pending |
| Functions  | 80%+     | pending  | pending |
| Lines      | 80%+     | pending  | pending |

### 5. 未到達行・分岐の特定（品質基準を下回る場合）

```bash
# HTML レポートで未到達行・分岐を確認
pnpm --filter @repo/desktop exec vitest run \
  --coverage \
  --coverage.reporter=html \
  --coverage.include="src/renderer/components/skill/SkillLifecyclePanel.tsx" \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel

# coverage レポートの出力確認
ls apps/desktop/coverage/ 2>/dev/null || echo "coverage ディレクトリが未生成"
```

#### 未到達コードの分析

品質基準を下回る指標がある場合、以下を調査する。

```bash
# SkillLifecyclePanel.tsx の行数確認（未到達割合の計算用）
wc -l apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx

# 削除したテスト（U-1/U-2/U-6/U-10/U-12）がカバーしていたコードパスの確認
# → これらは旧 API（planSkill / detectMode）依存のコードパスであり、
#    SkillLifecyclePanel.tsx 本体からも削除済みであるため、カバレッジへの影響は N/A
grep -n "planSkill\|detectMode" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
# → 結果が空なら削除テストに起因するカバレッジ低下は発生しない
```

#### 未到達コードの対応判断基準

| 未到達コードの種類                                   | 対応方針                                              |
| ---------------------------------------------------- | ----------------------------------------------------- |
| 旧 API（planSkill / detectMode）に依存するコードパス | SkillLifecyclePanel.tsx 本体が既に削除済みのため N/A  |
| 現行 API（executePlan / createSkill 等）のエラーパス | Phase 6 の補強方針と照合し、補強の要否を判断する      |
| UI ガード（isGenerating / empty input 等）           | 昇格テスト（U-4/U-11 等）でカバーされているか確認する |
| snapshot 系の分岐                                    | 昇格テスト（U-20b 等）でカバーされているか確認する    |

### 6. describe.skip 解消による正確性向上の確認

```bash
# describe.skip 解消後の describe.skip 残数確認
echo "--- 残存 describe.skip 数 ---"
grep -c "describe\.skip" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# アクティブな describe 数の確認
echo "--- アクティブな describe 数 ---"
grep -c "^describe(" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# 全テストスイートの最終確認
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel \
  --reporter=verbose 2>&1 | tail -30
```

#### describe.skip 解消前後の比較

| 指標                       | 解消前（Phase 1 時点） | 解消後（本 Phase 計測） | 変化    |
| -------------------------- | ---------------------- | ----------------------- | ------- |
| describe.skip 件数         | 12件                   | pending（計測後記録）   | pending |
| アクティブな describe 件数 | pending                | pending                 | pending |
| PASS するテスト数          | pending                | pending                 | pending |
| Statements カバレッジ      | pending（過大評価）    | pending（正確値）       | pending |

### 7. 全体品質の最終確認

```bash
# desktop 全テスト実行
pnpm --filter @repo/desktop test:run

# 型チェック
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/desktop lint
```

## 統合テスト連携

| 判定項目                                | 基準                                        | 結果    |
| --------------------------------------- | ------------------------------------------- | ------- |
| SkillLifecyclePanel.tsx Statements      | 80%+                                        | pending |
| SkillLifecyclePanel.tsx Branch          | 60%+                                        | pending |
| SkillLifecyclePanel.tsx Functions       | 80%+                                        | pending |
| SkillLifecyclePanel.tsx Lines           | 80%+                                        | pending |
| describe.skip 残数                      | 0件（全解消）または設計書で明示した残存件数 | pending |
| `pnpm --filter @repo/desktop test:run`  | PASS                                        | pending |
| `pnpm --filter @repo/desktop typecheck` | PASS                                        | pending |

## 多角的チェック観点

| 観点                     | チェック内容                                                                                         |
| ------------------------ | ---------------------------------------------------------------------------------------------------- |
| カバレッジの正確性       | describe.skip が解消されたことで、カバレッジが「スキップ込みの見かけ」ではなく正確な値になっているか |
| 削除テストの影響評価     | 削除した describe.skip（U-1/U-2 等）が SkillLifecyclePanel.tsx の未到達行を増やしていないか          |
| 昇格テストの貢献         | 昇格した describe が Branch カバレッジの改善に貢献しているか                                         |
| 品質基準未達時の対応判断 | 未到達コードが旧 API 削除後の残骸ではなく、現行 API のテスト漏れであることを確認しているか           |
| 複合カバレッジの整合性   | llm-generation テストと SkillLifecyclePanel.test.tsx が合算されたカバレッジで品質基準を満たすか      |

## サブタスク管理

1. SkillLifecyclePanel.tsx 単体カバレッジ計測（llm-generation テストのみ）
2. SkillLifecyclePanel 関連テスト全体での複合カバレッジ計測
3. 品質基準（Statements 80% / Branch 60% / Functions 80% / Lines 80%）の確認
4. 未到達コードの特定と対応判断（品質基準未達時のみ）
5. describe.skip 解消前後の比較記録
6. 全体品質の最終確認（test:run + typecheck + lint）
7. 成果物の出力

## 成果物

| 成果物             | パス                                 | 説明                                                         |
| ------------------ | ------------------------------------ | ------------------------------------------------------------ |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 計測結果・品質基準合否・describe.skip 解消前後比較・N/A 記録 |

## 完了条件

- [ ] `SkillLifecyclePanel.tsx` を対象にカバレッジ計測済み
- [ ] Statements カバレッジが 80%+ を達成（または未達理由が記録済み）
- [ ] Branch カバレッジが 60%+ を達成（または未達理由が記録済み）
- [ ] Functions カバレッジが 80%+ を達成（または未達理由が記録済み）
- [ ] Lines カバレッジが 80%+ を達成（または未達理由が記録済み）
- [ ] describe.skip 件数が Phase 1 時点（12件）から削減されていることが記録済み
- [ ] 削除テストに起因するカバレッジ低下が N/A として整理済み
- [ ] `pnpm --filter @repo/desktop test:run` が PASS
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS
- [ ] カバレッジレポート（`outputs/phase-7/coverage-report.md`）が作成済み
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-LIFECYCLE-PANEL-LLM-GEN-DESCRIBE-SKIP-CLEANUP-001
```

## 次Phase

Phase 8（リファクタリング）へ進む。
