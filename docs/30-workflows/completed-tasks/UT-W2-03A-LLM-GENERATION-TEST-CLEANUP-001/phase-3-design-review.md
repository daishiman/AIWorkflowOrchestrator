# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                                  |
| ---------- | ----------------------------------------------------- |
| Phase      | 3                                                     |
| タスクID   | UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001             |
| 機能名     | SkillCreateWizard / LLM生成テスト削除済み前提レビュー |
| 前提Phase  | Phase 2                                               |
| 後続Phase  | Phase 4（PASS または MINOR の場合）                   |
| 作成日     | 2026-04-16                                            |
| ステータス | pending                                               |

## 目的

Phase 2 の設計内容を current worktree の削除状態に照らしてレビューし、`SkillCreateWizard.llm-generation.test.tsx` が削除済みである前提でも安全に運用できるかを判定する。
選択肢 A（削除）を既定採用とし、選択肢 B は将来復元時のみの条件付き扱いとする。PASS/MINOR/MAJOR を確定する。

## 実行タスク

- [ ] 設計一貫性チェック: A 既定・B 条件付き N/A で矛盾がないか
- [ ] AC 整合チェック: 削除済み前提と残存参照安全化が AC に反映されているか
- [ ] 重複テストチェック: `SkillCreateWizard.test.tsx` に残存エッジケースが既にないか
- [ ] 命名・構造チェック: deleted file の記述とコマンドが安全化されているか
- [ ] リスクチェック: async 競合・IPC モック・削除済みファイル参照に問題がないか
- [ ] 選択肢 A/B の最終決定と判定記録
- [ ] MINOR 追跡テーブルの記録（指摘事項がある場合）

## 参照資料

| 資料名                                    | パス                                                                                             | 用途                     |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------ |
| Phase 1 成果物                            | `outputs/phase-1/requirements-definition.md`                                                     | 要件・AC 参照            |
| Phase 2 成果物                            | `outputs/phase-2/design.md`                                                                      | 設計書参照               |
| SkillCreateWizard.test.tsx                | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`                | 既存テスト構造・重複確認 |
| SkillCreateWizard.llm-generation.test.tsx | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx` | 削除済み。存在時のみ確認 |

## 実行手順

### 1. 設計一貫性チェック

| チェック項目                                                                                 | 判定基準                               | 結果    |
| -------------------------------------------------------------------------------------------- | -------------------------------------- | ------- |
| 選択肢 A が既定採用である                                                                    | 削除済み前提と矛盾していない           | pending |
| 選択肢 B が条件付き N/A である                                                               | 現 worktree で強制しない               | pending |
| `SkillCreateWizard.llm-generation.test.tsx` の削除済み前提でも手順が破綻しない               | `test -e` ガードがある                 | pending |
| `createSkill` IPC モックパターンが `SkillCreateWizard.test.tsx` の既存パターンと一致している | モックパターンの一貫性が確認されている | pending |
| `handleGenerate` / `isGenerating` の確認が current worktree と整合する                       | 削除済みファイル依存を持たない         | pending |
| TODO コメント削除・残存参照整理が明示されている（AC-5）                                      | 方針が記載されている                   | pending |

### 2. AC 整合チェック

| AC ID | 設計対応                                                                                                      | 充足判定 |
| ----- | ------------------------------------------------------------------------------------------------------------- | -------- |
| AC-1  | `SkillCreateWizard.llm-generation.test.tsx` は current worktree で削除済みである前提が明示されている          | pending  |
| AC-2  | 選択肢 B は条件付き N/A として扱われ、現 worktree では必須ではない                                            | pending  |
| AC-3  | `pnpm --filter @repo/desktop test:run` が PASS するように、削除済み参照でコマンドが失敗しない設計になっている | pending  |
| AC-4  | テストファイル変更後に TypeScript 型エラーが発生しない設計になっている                                        | pending  |
| AC-5  | `// TODO(W2-seq-03a)` コメントや stale reference の整理方針が含まれている                                     | pending  |

### 3. 重複テストチェック

```bash
if test -e apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx; then
  # F-2 相当: window.skillCreatorAPI undefined ガードのテスト確認
  grep -n "skillCreatorAPI.*undefined\|undefined.*skillCreatorAPI\|window\.skillCreatorAPI" \
    apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx

  # F-3 相当: createSkill 例外ケースのテスト確認
  grep -n "throw\|Error\|reject" \
    apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx

  # E-4 相当: isGenerating false リセットのテスト確認
  grep -n "isGenerating\|setIsGenerating" \
    apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx

  # W-8b 相当: キャンセル競合のテスト確認
  grep -n "cancel\|abort\|unmount" \
    apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx
else
  echo "N/A: SkillCreateWizard.llm-generation.test.tsx は current worktree で削除済み"
fi

# SkillCreateWizard.test.tsx に F-2 相当テストが存在するか確認
grep -n "skillCreatorAPI.*undefined\|undefined.*skillCreatorAPI\|window\.skillCreatorAPI" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx

# F-3 相当: createSkill 例外ケースのテストが存在するか確認
grep -n "throw\|Error\|reject" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx

# E-4 相当: isGenerating false リセットのテストが存在するか確認
grep -n "isGenerating\|setIsGenerating" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx

# W-8b 相当: キャンセル競合のテストが存在するか確認
grep -n "cancel\|abort\|unmount" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx
```

| エッジケース | 既存カバレッジ確認                                                                                                    | 重複判定 |
| ------------ | --------------------------------------------------------------------------------------------------------------------- | -------- |
| F-2          | `SkillCreateWizard.test.tsx` の `window.skillCreatorAPI` undefined ガード確認。削除済みなら `llm-generation` 側は N/A | pending  |
| F-3          | `SkillCreateWizard.test.tsx` の `createSkill` 例外スローテスト確認。削除済みなら `llm-generation` 側は N/A            | pending  |
| E-4          | `SkillCreateWizard.test.tsx` の `isGenerating` リセット確認。削除済みなら `llm-generation` 側は N/A                   | pending  |
| W-8b         | `SkillCreateWizard.test.tsx` のキャンセル後非同期競合防止確認。削除済みなら `llm-generation` 側は N/A                 | pending  |

**重複判定結果に基づく方針**:

- current worktree で `SkillCreateWizard.llm-generation.test.tsx` が削除済みであれば、選択肢 A（ファイル削除）を既定採用
- 将来ファイルが復元された場合のみ、未カバー分の有無に応じて選択肢 B を再評価

### 4. 命名・構造チェック

```bash
if test -e apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx; then
  # 追加の命名確認が必要な場合のみ参照する
  grep -n "^describe\|^  describe" apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx | head -20
  grep -n "^  it\|^    it" apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx | head -20
else
  echo "N/A: SkillCreateWizard.llm-generation.test.tsx は current worktree で削除済み"
fi

# 既存テストの describe ブロック命名パターン確認
grep -n "^describe\|^  describe" apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx | head -20

# 既存テストの it/test 命名パターン確認
grep -n "^  it\|^    it" apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx | head -20

# IPC モック定義パターンの確認
grep -n "vi.fn\|mockResolvedValue\|mockRejectedValue" apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx | head -10
```

| 確認項目                                           | 期待パターン                          | 結果    |
| -------------------------------------------------- | ------------------------------------- | ------- |
| describe ブロック名                                | 機能名または状態を説明する日本語/英語 | pending |
| it/test 名                                         | 期待動作を説明する日本語              | pending |
| IPC モック (`vi.fn`)                               | `SkillCreateWizard.test.tsx` と同一   | pending |
| `mockResolvedValue` / `mockRejectedValue` の使用   | 既存パターンに統一                    | pending |
| `SkillCreateWizard.llm-generation.test.tsx` の扱い | 削除済み/N/A 表記が明確               | pending |

### 5. リスクチェック

| リスク                                                           | 評価                                                         | 対応           |
| ---------------------------------------------------------------- | ------------------------------------------------------------ | -------------- |
| W-8b の非同期競合テストが `handleGenerate` 実装と乖離する        | `useRef` / `AbortController` の使用有無を確認して対応        | Phase 4 で確認 |
| `createSkill` モックパターンが既存テストと異なると型エラーが発生 | Phase 2 で既存パターンを参照済みであれば問題なし             | 設計確認で吸収 |
| 選択肢 B を将来復元時に再評価する際のスコープ膨張                | 現 worktree では B は N/A のため実装対象外                   | 問題なし       |
| TODO コメントや stale reference の整理漏れが発生する             | `grep -rn "TODO(W2-seq-03a)"` で全件確認することで防止できる | Phase 4 で対処 |

### 6. レビュー判定基準

| 判定  | 条件                                                                                | 次のアクション         |
| ----- | ----------------------------------------------------------------------------------- | ---------------------- |
| PASS  | 全チェック項目でリスクなし、AC-1〜AC-5 の設計対応が充足                             | Phase 4 へ進む         |
| MINOR | 小さな指摘事項あり（実装時に並行解消可能）                                          | Phase 4 へ進む（追跡） |
| MAJOR | 設計の根本的な問題（方針未確定・重複チェック未実施・AC 未充足・async 競合対策なし） | Phase 2 へ戻る         |

**MAJOR 判定となる条件の例**:

- 選択肢 A/B のどちらを採用するか未確定のまま Phase 4 へ進もうとしている
- F-2/F-3/E-4/W-8b の安全化確認が未実施で、削除済み前提の手順が壊れる
- `createSkill` IPC モックパターンが既存テストと非互換で型エラーが確実に発生する

**総合判定**: （実行時に PASS / MINOR / MAJOR を記録）

### 7. MINOR 追跡テーブル

| MINOR ID         | 指摘内容 | 解決予定Phase | 解決確認Phase | 備考 |
| ---------------- | -------- | ------------- | ------------- | ---- |
| （実行時に記録） | -        | -             | -             | -    |

### 8. Phase 4 開始条件

Phase 4（テスト作成）を開始できる条件:

- [ ] 総合判定が PASS または MINOR であること
- [ ] MAJOR 判定の場合は Phase 2 へ戻り再設計を行うこと
- [ ] 選択肢 A/B の最終決定が明示されていること
- [ ] MINOR の指摘事項が追跡テーブルに記録されていること

## 統合テスト連携【必須】

| 判定項目               | 基準    | 結果    |
| ---------------------- | ------- | ------- |
| 型チェック（設計段階） | PASS    | pending |
| lint                   | 0 error | pending |

## 多角的チェック観点

| 観点             | チェック内容                                                                        |
| ---------------- | ----------------------------------------------------------------------------------- |
| 方針決定の妥当性 | 選択肢 A/B の決定根拠が Phase 2 の重複チェック結果と一致しているか                  |
| スコープ遵守     | 設計変更がプロダクションコードに触れず、テストファイルのみに閉じているか            |
| テスト設計適合   | Phase 4 でテストを書きやすい設計（モックパターン・assert 方針）になっているか       |
| 依存整合         | W2-seq-03a 実装完了状態（`createSkill` ベースの新フロー）との整合が確認されているか |

## サブタスク管理

1. 設計一貫性チェック（6 項目）
2. AC-1〜AC-5 の設計対応確認
3. 重複テストチェック（F-2/F-3/E-4/W-8b の既存カバレッジ確認）
4. 命名・構造チェック（describe/it 命名・IPC モックパターン）
5. リスクチェック（4 項目）
6. 選択肢 A/B の最終決定と総合判定記録
7. MINOR 追跡テーブル記録（該当時）
8. 成果物の出力

## 成果物

| 成果物           | パス                               | 説明                                                 |
| ---------------- | ---------------------------------- | ---------------------------------------------------- |
| 設計レビュー結果 | `outputs/phase-3/gate-decision.md` | 選択肢 A/B 最終決定・PASS/MINOR/MAJOR 判定・指摘事項 |

## 完了条件

- [ ] 設計一貫性チェック（6 項目）が完了
- [ ] AC-1〜AC-5 の設計対応が確認済み
- [ ] F-2/F-3/E-4/W-8b の既存カバレッジ重複チェックまたは N/A 化が完了
- [ ] 命名・構造チェック（4 項目）が完了
- [ ] リスクチェック（4 項目）が完了
- [ ] 選択肢 A/B の最終決定が記録されている
- [ ] 総合判定（PASS/MINOR/MAJOR）が記録されている
- [ ] MINOR 判定の指摘事項があれば追跡テーブルに記録済み
- [ ] Phase 4 開始条件（PASS or MINOR）が充足されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 4: テスト作成（PASS または MINOR の場合）
Phase 2: 設計（MAJOR の場合）
