# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| PhaseID    | 6                                                              |
| Phase名    | テスト拡充                                                     |
| タスクID   | UT-LIFECYCLE-PANEL-LLM-GEN-DESCRIBE-SKIP-CLEANUP-001           |
| タスク名   | SkillLifecyclePanel LLM生成テスト describe.skip クリーンアップ |
| 前Phase    | Phase 5                                                        |
| 次Phase    | Phase 7                                                        |
| 作成日     | 2026-04-18                                                     |
| ステータス | pending                                                        |

## 目的

Phase 5 のクリーンアップ完了後、`describe.skip` から `describe` に昇格したテストが
期待通りに動作するかを検証し、不足が確認された場合だけテストの assert を強化する。
また、削除されたテストのうちカバレッジに影響する重要なエッジケースが
既存のアクティブなテストでカバーされているかを確認する。
本 Phase では新規テストケースの追加は原則行わない（スコープ外）。

## 実行タスク

- [ ] 昇格した describe のテスト内容を検証する（assert の妥当性確認）
- [ ] 削除した describe.skip のエッジケースが他のアクティブな describe でカバーされているか確認する
- [ ] 昇格テストの assert が現行 API の実際の動作と一致しているか確認する
- [ ] 必要な場合のみ既存のアクティブなテストの assert を補強する（新規 it の追加は最小限）
- [ ] 変更がある場合は vitest を実行して PASS を確認する

## 参照資料

| 資料名                                      | パス                                                                                               | 用途                             |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 5 実装サマリー                        | `outputs/phase-5/implementation-summary.md`                                                        | 昇格・削除した describe の確認   |
| Phase 5 変更ファイル一覧                    | `outputs/phase-5/changed-files.md`                                                                 | 変更内容の参照                   |
| SkillLifecyclePanel.llm-generation.test.tsx | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | クリーンアップ後のテスト構造確認 |
| SkillLifecyclePanel.test.tsx                | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx`                | 重複・補完確認                   |
| SkillLifecyclePanel.tsx                     | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               | 現行実装との assert 整合確認     |
| ベースラインテスト結果                      | `outputs/phase-4/baseline-test-result.md`                                                          | Phase 4 成果物                   |
| testid確認                                  | `outputs/phase-4/testid-confirmation.md`                                                           | Phase 4 成果物                   |
| モック宣言マップ                            | `outputs/phase-4/mock-declaration-map.md`                                                          | Phase 4 成果物                   |

## 実行手順

### 1. 昇格した describe のテスト検証

Phase 5 で describe.skip → describe に昇格したテストについて、テスト内容と assert を検証する。

```bash
# クリーンアップ後のアクティブな describe 一覧確認
grep -n "^describe(" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# 昇格したテストの詳細確認（Phase 5 実装サマリーで昇格が記録されている describe のみ）
# U-4 が昇格した場合
grep -n -A 20 "isGenerating guard prevents double invocation" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# U-11 が昇格した場合
grep -n -A 20 "empty input validation" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# U-8b が昇格した場合
grep -n -A 30 "canonical binding drift prevention" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# U-20b が昇格した場合
grep -n -A 20 "cancel clears approved snapshot symmetrically" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
```

#### 昇格テストの assert 妥当性チェック

| 昇格テスト ID   | 主な assert 観点                                  | 現行 API での再現可能性            | 結果    |
| --------------- | ------------------------------------------------- | ---------------------------------- | ------- |
| U-4（昇格時）   | isGenerating=true でダブル呼び出しが防止される    | mockSetIsGenerating で確認         | pending |
| U-11（昇格時）  | テキストエリア空のとき createSkill が呼ばれない   | disabled または guard で確認       | pending |
| U-8b（昇格時）  | currentPlanResult.skillSpec が executePlan に渡る | mockExecutePlan 呼び出し引数で確認 | pending |
| U-20b（昇格時） | cancel 後に clearGenerationState が呼ばれる       | mockClearGenerationState で確認    | pending |

### 2. 削除テストのエッジケースカバレッジ確認

削除した describe.skip（U-1/U-2/U-6/U-10/U-12）のエッジケースが
既存のアクティブなテストでカバーされているかを確認する。

```bash
# 既存アクティブテストでの detectMode 関連テスト確認
# （U-1/U-2 の代替カバレッジが SkillLifecyclePanel.test.tsx にあるか）
grep -n "detectMode\|planSkill" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx

# U-6: terminal_handoff - 現行の handoff ガイダンス表示テストの確認
# （U-13 等の既存アクティブテストでカバーされているか）
grep -n "terminal_handoff\|handoff\|handoffGuidance" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx | \
  grep -v "describe\.skip"

# U-10: planSkill エラー - 現行 API（createSkill）でのエラー伝播テスト確認
grep -n "generationError\|setGenerationError\|error" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx | \
  grep -v "describe\.skip" | head -20

# U-12: API unavailable - graceful degradation テスト確認
grep -n "undefined\|API\|unavailable\|graceful" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx | \
  grep -v "describe\.skip"
```

#### エッジケースカバレッジ確認結果

| 削除テスト ID | エッジケース                | 代替カバレッジ（アクティブテスト）      | カバレッジ評価 |
| ------------- | --------------------------- | --------------------------------------- | -------------- |
| U-1           | detectMode → planSkill 順序 | 廃止済み API のため代替不要             | N/A            |
| U-2           | detectMode='create' の動作  | 廃止済み API のため代替不要             | N/A            |
| U-6           | terminal_handoff 表示       | U-13（executePlan の terminal_handoff） | pending        |
| U-10          | planSkill エラー伝播        | U-7/U-14（generationError 表示）        | pending        |
| U-12          | API unavailable degradation | 新フローに相当テストがあるか確認        | pending        |

### 3. 昇格テストの実行確認

```bash
# 昇格テストを含む対象ファイル単体の vitest 実行
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx \
  --reporter=verbose

# 昇格したテスト名でフィルタリング実行（U-4 が昇格した場合の例）
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx \
  --reporter=verbose \
  -t "isGenerating guard"
```

### 4. 既存アクティブテストの assert 補強（最小限）

削除したエッジケースで代替カバレッジが不足している場合のみ、
既存のアクティブな describe 内に it を追加する（新規 describe は追加しない）。

```bash
# 補強前後の it 数確認
grep -c "^  it(" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# 補強がある場合の vitest 確認
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx \
  --reporter=verbose
```

**補強の判断基準**:

| 判断条件                                                         | 処置                                                  |
| ---------------------------------------------------------------- | ----------------------------------------------------- |
| 削除テストのエッジケースが既存アクティブテストで完全にカバー済み | 補強不要（N/A）                                       |
| 重要なエッジケース（エラー伝播・guard 動作）が未カバー           | 最も近い既存 describe に it を 1〜2 件追加            |
| 廃止済み API（planSkill / detectMode）に依存するエッジケース     | 代替不要（旧フロー固有の動作は現行 API に存在しない） |

### 5. SkillLifecyclePanel.test.tsx との重複確認

```bash
# SkillLifecyclePanel.test.tsx との重複チェック
grep -n "describe\|isGenerating\|generationError\|terminal_handoff" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx | head -30

# 重複があれば llm-generation.test.tsx 側の補強を省略する
```

### 6. 変更がある場合の全体確認

```bash
# 変更がある場合のみ全体テスト実行
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel

# 型チェック
pnpm --filter @repo/desktop typecheck
```

## 統合テスト連携

| 判定項目                                                                  | 基準                             | 結果    |
| ------------------------------------------------------------------------- | -------------------------------- | ------- |
| 昇格した describe の全 it が PASS                                         | vitest が全 PASS                 | pending |
| 削除テストのエッジケースカバレッジ評価が完了                              | 代替あり or N/A が明記されている | pending |
| 補強が必要な場合の it 追加が最小限（新規 describe なし）                  | describe 数の増加なし            | pending |
| `pnpm --filter @repo/desktop exec vitest run SkillLifecyclePanel` が PASS | 全件 PASS                        | pending |

## 多角的チェック観点

| 観点                     | チェック内容                                                                     |
| ------------------------ | -------------------------------------------------------------------------------- |
| 昇格テストの assert 精度 | 昇格した describe の assert が現行 API の実装と一致しているか                    |
| 重複テスト排除           | SkillLifecyclePanel.test.tsx に同等テストが存在する場合に補強を省略しているか    |
| スコープ遵守             | 新規 describe の追加がスコープ外として省略されているか                           |
| 削除エッジケースの安全性 | 廃止済み API 固有のエッジケースが「代替不要（N/A）」として正確に判定されているか |

## サブタスク管理

1. 昇格した describe のテスト内容検証（assert 妥当性確認）
2. 削除テストのエッジケースカバレッジ確認（U-1〜U-12 の代替カバレッジ評価）
3. 昇格テストの vitest 実行確認
4. 必要な場合のみ既存 describe への it 補強（最小限）
5. SkillLifecyclePanel.test.tsx との重複確認
6. 変更がある場合の全体確認（vitest + typecheck）
7. 成果物の出力

## 成果物

| 成果物         | パス                                    | 説明                                                       |
| -------------- | --------------------------------------- | ---------------------------------------------------------- |
| テスト拡充ログ | `outputs/phase-6/test-expansion-log.md` | 昇格テストの assert 検証結果・エッジケース評価・補強の有無 |

## 完了条件

- [ ] 昇格した describe の assert 妥当性確認が完了
- [ ] 削除テスト（U-1/U-2/U-6/U-10/U-12）のエッジケースカバレッジ評価が完了
- [ ] 昇格テストを含む vitest が全件 PASS
- [ ] 補強が必要な場合のみ it を追加し、新規 describe は追加していない
- [ ] SkillLifecyclePanel.test.tsx との重複確認が完了
- [ ] 変更がある場合の `pnpm --filter @repo/desktop typecheck` が PASS
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

Phase 7（テストカバレッジ確認）へ進む。
