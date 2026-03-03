# Phase 6: テスト拡充

## メタ情報

| 項目      | 値                                    |
| --------- | ------------------------------------- |
| Phase     | 6                                     |
| 機能名    | TASK-10A-D スキルライフサイクルUI統合 |
| 作成日    | 2026-03-03                            |
| 状態      | 未着手                                |
| 前提Phase | Phase 5（実装）                       |

## 目的

Phase 5 実装後のコードに対してカバレッジを計測し、基準（Line 80%、Branch 60%、Function 80%）を下回る箇所を特定してテストを追加する。

## 実行タスク

- カバレッジ計測実施: 対象ファイルの Line/Branch/Function を計測する。
- 不足箇所特定: 基準未達の分岐と関数をテスト観点に分解する。
- 追加テスト作成: 未達観点を補うテストケースを追加して実行する。
- 再計測確認: 追加後のカバレッジが基準を満たすことを確認する。

## 参照資料

| 資料名                | パス                                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------- |
| Phase 5 実装仕様      | `docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION/phase-5-implementation.md` |
| 既存テスト（Phase 4） | `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.integration.test.tsx`        |
| 既存テスト（Phase 4） | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-lifecycle.test.ts`                   |
| 既存テスト（Phase 4） | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-lifecycle-selectors.test.ts`         |
| 既存テスト（Phase 4） | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx`               |
| カバレッジ基準        | `.claude/rules/02-code-quality.md#カバレッジ基準`                                                       |

## カバレッジ計測手順

### Step 1: カバレッジ計測の実行

```bash
cd apps/desktop && pnpm vitest run --coverage \
  src/renderer/store/slices/agentSlice.ts \
  src/renderer/components/skill/SkillManagementPanel.tsx \
  src/renderer/components/chat/ChatPanel.tsx
```

上記コマンドで対象ファイルのカバレッジを計測する。`--coverage` フラグにより v8 カバレッジプロバイダが使用される。

### Step 2: カバレッジレポートの確認

計測結果を以下のテーブル形式で記録する:

| ファイル                 | Line Coverage | Branch Coverage | Function Coverage | 基準達成 |
| ------------------------ | ------------- | --------------- | ----------------- | -------- |
| agentSlice.ts            | ?%            | ?%              | ?%                | ?        |
| SkillManagementPanel.tsx | ?%            | ?%              | ?%                | ?        |
| ChatPanel.tsx            | ?%            | ?%              | ?%                | ?        |

### Step 3: 不足箇所の特定

カバレッジレポートから未カバー行・ブランチを特定し、以下のカテゴリに分類する:

1. **異常系パス**: try/catch のcatch ブロック、エラー分岐
2. **境界値パス**: 空配列、null チェック、条件分岐の端点
3. **ユーザー操作パス**: ボタンの disabled 状態、条件付きレンダリング

## 追加テストケース候補

以下は Phase 5 の実装内容から推測されるカバレッジ不足箇所と、それに対する追加テストケース候補である。実際の不足箇所はカバレッジ計測結果に基づいて確定する。

### 候補グループ A: 境界値テスト

**対象ファイル**: `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-lifecycle.test.ts`（追記）

| TC ID    | テストケース名                                              | 検証内容                                                                          |
| -------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------- |
| TC-EX-01 | analyzeSkill に空文字列を渡した場合エラーになる             | `analyzeSkill("")` 呼び出しで `skillError` に `"スキル名が無効です"` が設定される |
| TC-EX-02 | analyzeSkill にスペースのみの文字列を渡した場合エラーになる | `analyzeSkill("   ")` 呼び出しで `skillError` が設定される（P42 対策検証）        |
| TC-EX-03 | createSkill に空の name を渡した場合エラーになる            | `createSkill({ name: "", description: "test" })` で `skillError` が設定される     |
| TC-EX-04 | applyImprovements に空の配列を渡した場合は正常完了する      | `applyImprovements("skill", [])` が IPC を呼び出し、成功する                      |

### 候補グループ B: 異常系テスト

**対象ファイル**: `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-lifecycle.test.ts`（追記）

| TC ID    | テストケース名                                                      | 検証内容                                                                                |
| -------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| TC-EX-05 | autoImprove 失敗時にエラーが設定される                              | IPC が Error を throw した場合、`skillError` に `"自動改善に失敗しました"` が設定される |
| TC-EX-06 | analyzeSkill 実行中にエラーが発生しても isAnalyzing が false に戻る | IPC 失敗後に `isAnalyzing` が `false` であることを検証                                  |
| TC-EX-07 | createSkill 失敗時に isCreatingSkill が false に戻る                | IPC 失敗後に `isCreatingSkill` が `false` であることを検証                              |

### 候補グループ C: コンポーネント統合テスト追加

**対象ファイル**: `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.integration.test.tsx`（追記）

| TC ID    | テストケース名                                             | 検証内容                                                                                  |
| -------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| TC-EX-08 | スキルリストが空の場合でも create ビューに遷移できる       | `importedSkills: []` でも「新規作成」ボタンが表示され、クリックで create ビューに遷移する |
| TC-EX-09 | analysis ビューで selectedSkill が null の場合リストに戻る | `selectedSkill` が何らかの理由で null の場合、analysis ビューは表示されない               |
| TC-EX-10 | create 完了後にリストビューが表示される                    | `onComplete` コールバック発火後、リストビューが表示されている                             |

### 候補グループ D: フロー連携テスト

**対象ファイル**: `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-lifecycle.test.ts`（追記）

| TC ID    | テストケース名                                          | 検証内容                                                                            |
| -------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| TC-EX-11 | analyzeSkill → applyImprovements のフロー連携           | analyze 成功後に applyImprovements を呼び、currentAnalysis がクリアされることを検証 |
| TC-EX-12 | clearAnalysis が currentAnalysis を null にリセットする | `clearAnalysis()` 呼び出し後に `currentAnalysis` が `null` であることを検証         |

## 追加テスト作成の手順

1. カバレッジ計測結果を確認し、最低基準未達のファイル・指標を特定する
2. 上記候補テーブルから該当する不足箇所のテストケースを選択する
3. 候補テーブルに該当しない不足箇所が発見された場合は、新規テストケースを追加設計する
4. 選択・追加したテストケースを既存テストファイルに追記する（新規ファイルは作成しない）
5. テスト追記後にカバレッジを再計測し、全指標が最低基準を満たすことを確認する

## テスト環境注意事項

- happy-dom 環境では `fireEvent` を使用（P39: `userEvent` は使用禁止）
- テスト間で状態を共有しない（P9: `beforeEach` でリセット）
- 非同期ハンドラは `await act(async () => { fireEvent.click(el) })` で包む（P39 対策）
- テスト実行は `cd apps/desktop && pnpm vitest run` で実行（P40 対策）

## 統合テスト連携

- 追加テストは既存の Phase 4 テストファイルに追記するため、ファイル分割は行わない
- 追加テストは既存テストの `describe` ブロック構造を維持し、末尾に新しい `describe` ブロックを追加する
- テスト追記後の全テスト実行で、既存テスト（TC-I、TC-SL、TC-SS、TC-CP）が破損しないことを確認する

## 成果物

| 種類                 | パス                                                                                                                   |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| テストコード（追記） | `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.integration.test.tsx`                       |
| テストコード（追記） | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-lifecycle.test.ts`                                  |
| カバレッジレポート   | `docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION/outputs/phase-6/test-expansion-result.md` |

## 完了条件

- [ ] カバレッジ計測が実施されている
- [ ] 不足箇所が特定され、テストケースが追加されている
- [ ] 追加テスト実行後のカバレッジが Line 80% 以上である
- [ ] 追加テスト実行後のカバレッジが Branch 60% 以上である
- [ ] 追加テスト実行後のカバレッジが Function 80% 以上である
- [ ] 既存テスト（Phase 4 で作成した 26 テストケース）が破損していない
- [ ] 追加テストが happy-dom 環境で `fireEvent` を使用している（P39 対策）
- [ ] カバレッジ結果がカバレッジレポートファイルに記録されている

## 次のPhase

Phase 7: カバレッジ確認 → `phase-7-coverage-check.md`
