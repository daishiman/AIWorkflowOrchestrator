# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 値                               |
| -------- | -------------------------------- |
| Phase    | 7                                |
| タスクID | TASK-SC-06-UI-RUNTIME-CONNECTION |
| 機能名   | w4b-2-sc-ui-runtime-connection   |
| 作成日   | 2026-03-22                       |
| 更新日   | 2026-03-24                       |

## 目的

Phase 6 のテスト拡充後に、対象ファイルのカバレッジが基準値（Line 80%+, Branch 60%+, Function 80%+）を満たしていることを確認する。未達の場合は Phase 6 へ戻り追加テストを実装する。

## 依存成果物

- Phase 5 実装済みソースコード
- Phase 6 拡充済みテストファイル（全テスト Green 確認済み）

## 実行タスク

### Task 1: カバレッジ計測コマンド実行

**P40 対策**: カバレッジ計測は必ず `apps/desktop` ディレクトリから実行する。プロジェクトルートからのパス指定では `vitest.config.ts` の設定（happy-dom 環境、`@` エイリアス等）が適用されない。

#### 対象ファイル別計測

```bash
# SkillLifecyclePanel のカバレッジ（LLM 生成フロー追加分を含む）
cd apps/desktop && pnpm vitest run --coverage src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# agentSlice 生成状態のカバレッジ
cd apps/desktop && pnpm vitest run --coverage src/renderer/store/__tests__/agentSlice.generation.test.ts
```

#### 全関連テストの一括計測

```bash
# SkillLifecyclePanel 関連テスト一括実行（既存 + 新規）
cd apps/desktop && pnpm vitest run --coverage \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# agentSlice 関連テスト一括実行
cd apps/desktop && pnpm vitest run --coverage \
  src/renderer/store/__tests__/agentSlice.generation.test.ts \
  src/renderer/store/__tests__/sliceBaseline.test.ts
```

### Task 2: カバレッジ基準の確認

**カバレッジ基準**（`.claude/rules/02-code-quality.md` 準拠）:

| 指標              | 最低基準 | 推奨基準 | 判定           |
| ----------------- | -------- | -------- | -------------- |
| Line Coverage     | 80%      | 90%      | 未達 → Phase 6 |
| Branch Coverage   | 60%      | 70%      | 未達 → Phase 6 |
| Function Coverage | 80%      | 90%      | 未達 → Phase 6 |

### Task 3: 対象分岐のカバレッジ確認

以下の分岐が全てカバーされていることを確認する:

#### SkillLifecyclePanel.tsx の新規追加分岐

| 分岐     | 条件                                                                 | カバーするテスト |
| -------- | -------------------------------------------------------------------- | ---------------- |
| SLP-B-1  | `isGenerating === true` → handlePlanSkill 早期リターン               | U-4              |
| SLP-B-2  | `description.trim() === ""` → handlePlanSkill 早期リターン           | U-11, E-5        |
| SLP-B-3  | `detectMode 結果 === "plan"` → planSkill 呼び出し                    | U-1              |
| SLP-B-4  | `detectMode 結果 === "improve"` → planSkill 呼び出し                 | E-2              |
| SLP-B-5  | `detectMode 結果 === "create"` → planSkill 未呼び出し                | U-2              |
| SLP-B-6  | `!skillCreatorApi?.planSkill` → エラー throw                         | U-12             |
| SLP-B-7  | `result.success === false` → エラー throw                            | U-10             |
| SLP-B-8  | `result.data.type === "terminal_handoff"` → handoffGuidance 設定     | U-6              |
| SLP-B-9  | `result.data.type === "integrated_api"` → plan 結果保存              | U-5              |
| SLP-B-10 | `!currentPlanId` → handleExecutePlan 早期リターン                    | E-6              |
| SLP-B-11 | `isGenerating === true`（handleExecutePlan）→ 早期リターン           | E-7              |
| SLP-B-12 | `!skillCreatorApi?.executePlan` → エラー throw                       | E-4 (extend)     |
| SLP-B-13 | `executePlan result.success === false` → エラー throw                | E-3              |
| SLP-B-14 | `result.data.skillName` が truthy → selectSkillByName 呼び出し       | U-8              |
| SLP-B-15 | `currentPlanResult !== null && type === "integrated_api"` → 計画表示 | U-5              |
| SLP-B-16 | `generationError !== null` → エラー UI 表示                          | U-7, E-8         |
| SLP-B-17 | `isGenerating && generationProgress` → プログレス表示                | E-9              |

#### agentSlice.ts の新規追加分岐

| 分岐                                        | 確認するテスト |
| ------------------------------------------- | -------------- |
| clearGenerationState の全フィールドリセット | U-S-6, E-S-1   |
| setCurrentPlanResult(null) の null 設定     | E-S-2          |
| setIsGenerating の true/false 切り替え      | U-S-2          |

### Task 4: P41 対策（v8 カバレッジプロバイダのインライン関数）

**P41**: Vitest の v8 カバレッジプロバイダは、オプションオブジェクト内のインライン arrow function を独立した関数としてカウントする。

確認事項:

- `clearGenerationState` のオブジェクトリテラル内の arrow function が実行されていること
- セレクタ（`useIsSkillGenerating` 等）の arrow function が呼び出されていること

不足がある場合は、該当セレクタを明示的に呼び出すテスト（E-S-3 パターン）を追加する。

### Task 5: カバレッジ達成状況の記録

Phase 7 完了後、以下の表を実測値で埋める:

#### SkillLifecyclePanel.tsx（変更分）

| 指標              | 実測値            | 基準値 | 達成             |
| ----------------- | ----------------- | ------ | ---------------- |
| Line Coverage     | （計測後に記入）% | 80%    | （計測後に判定） |
| Branch Coverage   | （計測後に記入）% | 60%    | （計測後に判定） |
| Function Coverage | （計測後に記入）% | 80%    | （計測後に判定） |

#### agentSlice.ts（変更分: 新規追加アクション）

| 指標              | 実測値            | 基準値 | 達成             |
| ----------------- | ----------------- | ------ | ---------------- |
| Line Coverage     | （計測後に記入）% | 80%    | （計測後に判定） |
| Branch Coverage   | （計測後に記入）% | 60%    | （計測後に判定） |
| Function Coverage | （計測後に記入）% | 80%    | （計測後に判定） |

#### store/index.ts（新規セレクタ）

| 指標              | 実測値            | 基準値 | 達成             |
| ----------------- | ----------------- | ------ | ---------------- |
| Function Coverage | （計測後に記入）% | 80%    | （計測後に判定） |

### Task 6: 未達時の対処フロー

カバレッジが未達の場合:

1. カバレッジレポートの未カバー行（赤ハイライト）を特定する
2. 未カバーの分岐をカバーするテストケースを特定する（Task 3 の対応表を参照）
3. Phase 6 に戻り、不足テストを追加する
4. 本 Phase（Phase 7）に再度戻り、カバレッジを再計測する

**Phase 6 へ戻るトリガー条件**:

- Line Coverage < 80%
- Branch Coverage < 60%
- Function Coverage < 80%
- SLP-B-1〜SLP-B-17 のいずれかが未カバー

## 参照資料

- Phase 6 拡充済みテストファイル
- `.claude/rules/02-code-quality.md`（カバレッジ基準）
- `.claude/rules/06-known-pitfalls.md` P40（テスト実行ディレクトリ依存）、P41（v8 カバレッジプロバイダ）

## 実行手順

### ステップ1: カバレッジ計測

`cd apps/desktop && pnpm vitest run --coverage` で対象ファイルのカバレッジを計測する（P40 対策）。

### ステップ2: 基準値との比較

Line 80%+, Branch 60%+, Function 80%+ の基準を確認し、実測値を記録する。

### ステップ3: 分岐カバレッジ確認

SLP-B-1〜SLP-B-17 の全分岐がカバーされていることを個別確認する。

### ステップ4: P41 対策確認

v8 カバレッジプロバイダのインライン関数カウント影響を確認する。

### ステップ5: 未達時の Phase 6 フィードバック

未達分岐がある場合は Phase 6 へ戻り追加テストを実装する。

## 統合テスト連携

- 全関連テスト（既存 + 新規）の一括カバレッジ計測を実施
- 既存テスト（`SkillLifecyclePanel.test.tsx`、`sliceBaseline.test.ts`）のカバレッジ貢献を含めて評価
- Phase 6 で追加したテスト（E-1〜E-10、E-S-1〜E-S-3）が分岐カバレッジに貢献していることを確認

## 多角的チェック観点

| 観点           | 適用判断 | 確認内容                                     |
| -------------- | -------- | -------------------------------------------- |
| カバレッジ基準 | 該当     | Line 80%+, Branch 60%+, Function 80%+ の達成 |
| 分岐網羅       | 該当     | SLP-B-1〜SLP-B-17 の全分岐カバー             |
| P41 対策       | 該当     | v8 インライン関数カウントの影響確認          |
| P40 対策       | 該当     | apps/desktop ディレクトリからの実行          |

## サブタスク管理

| サブタスク                            | 担当           | 状態   | 備考            |
| ------------------------------------- | -------------- | ------ | --------------- |
| Task 1: カバレッジ計測                | Phase 7 実行者 | 未着手 | P40 対策        |
| Task 2: 基準値確認                    | Phase 7 実行者 | 未着手 | 3指標の達成判定 |
| Task 3: 分岐カバレッジ確認            | Phase 7 実行者 | 未着手 | SLP-B-1〜B-17   |
| Task 4: P41 対策確認                  | Phase 7 実行者 | 未着手 | インライン関数  |
| Task 5: 達成状況記録                  | Phase 7 実行者 | 未着手 | 実測値テーブル  |
| Task 6: 未達時 Phase 6 フィードバック | Phase 7 実行者 | 未着手 | 条件付き        |

## 成果物

- カバレッジ達成状況表（Task 5 の表を実測値で埋めたもの）
- 分岐カバレッジ確認チェックリスト（SLP-B-1〜SLP-B-17 の達成状況）

## 完了条件

- [ ] `cd apps/desktop && pnpm vitest run --coverage` でカバレッジを計測した（P40 対策: プロジェクトルートからの実行ではない）
- [ ] SkillLifecyclePanel.tsx の Line Coverage 80% 以上を確認した
- [ ] SkillLifecyclePanel.tsx の Branch Coverage 60% 以上を確認した
- [ ] SkillLifecyclePanel.tsx の Function Coverage 80% 以上を確認した
- [ ] agentSlice.ts（新規追加アクション）の Line Coverage 80% 以上を確認した
- [ ] agentSlice.ts の Function Coverage 80% 以上を確認した
- [ ] SLP-B-1〜SLP-B-17 の全分岐がカバーされていることを確認した
- [ ] P41（インライン関数カウント）の影響を確認し、必要に応じてテストを追加した
- [ ] 未達の場合は Phase 6 へ戻り追加テストを実装した
- [ ] カバレッジ達成状況を Task 5 の表に記録した

## タスク100%実行確認【必須】

- [ ] 上記「完了条件」の全チェックボックスが ON であることを確認した
- [ ] 「実行手順」の全ステップを実行した
- [ ] 「サブタスク管理」の全タスクが完了状態である
- [ ] 「統合テスト連携」の全項目を確認した
- [ ] 「多角的チェック観点」の全観点を確認した
- [ ] 成果物が全て生成されている

## 次のPhase

Phase 8: リファクタリング
