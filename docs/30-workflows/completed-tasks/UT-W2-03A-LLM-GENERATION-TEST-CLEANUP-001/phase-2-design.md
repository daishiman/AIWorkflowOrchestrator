# Phase 2: 設計

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 2                                                 |
| タスクID   | UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001         |
| 機能名     | SkillCreateWizard / LLM生成テスト削除済み前提整理 |
| 前提Phase  | Phase 1                                           |
| 後続Phase  | Phase 3                                           |
| 作成日     | 2026-04-16                                        |
| ステータス | pending                                           |

## 目的

`SkillCreateWizard.llm-generation.test.tsx` が current worktree で削除済みである事実を前提に、`SkillCreateWizard.test.tsx` と `SkillCreateWizard.tsx` の現行実装を照合し、残存参照があれば安全に N/A 化する。
選択肢 A（削除）を既定方針とし、選択肢 B は将来復元された場合のみ条件付きで再評価する。

## 実行タスク

- [ ] `SkillCreateWizard.test.tsx` の既存カバレッジ確認
- [ ] `SkillCreateWizard.llm-generation.test.tsx` の削除済み確認と、存在時のみ残存参照点検
- [ ] `SkillCreateWizard.tsx` の `handleGenerate` / `isGenerating` 実装確認
- [ ] 選択肢 A 既定・選択肢 B 条件付き N/A の方針確定
- [ ] 検証マトリクスの定義

## 参照資料

| 資料名                                    | パス                                                                                             | 用途                                |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------- |
| Phase 1 成果物                            | `outputs/phase-1/requirements-definition.md`                                                     | 要件・AC 参照                       |
| SkillCreateWizard.test.tsx                | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`                | 既存テスト構造・createSkill モック  |
| SkillCreateWizard.llm-generation.test.tsx | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx` | 削除済み。存在時のみ残存参照確認    |
| SkillCreateWizard.tsx                     | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                               | 現行 createSkill ベースのフロー確認 |
| GitHub Issue #2102                        | [#2102](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2102)                         | タスク背景・設計オプション参照      |
| aiworkflow-requirements refs              | `.claude/skills/aiworkflow-requirements/references/`                                             | プロジェクト共通仕様参照            |

## 実行手順

### 1. `SkillCreateWizard.test.tsx` の既存カバレッジ確認

```bash
# 既存テストの describe/it 構造確認
grep -n "describe\|it(" apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx | head -60

# createSkill IPC モックパターンの確認
grep -n "createSkill\|mockCreateSkill\|skillCreatorAPI" apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx

# isGenerating / handleGenerate の確認
grep -n "isGenerating\|handleGenerate\|setIsGenerating" apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx

# IPC API undefined ガードのテスト存在確認（F-2 相当）
grep -n "undefined\|window\.skillCreatorAPI" apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx

# エラー処理テストの存在確認（F-3 相当）
grep -n "throw\|Error\|reject\|catch" apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx

# キャンセル非同期競合テストの存在確認（W-8b 相当）
grep -n "cancel\|abort\|unmount\|競合" apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx
```

### 2. `SkillCreateWizard.llm-generation.test.tsx` の削除済み確認と安全化

```bash
if test -e apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx; then
  # テストファイル全体の describe/it 構造確認
  grep -n "describe\|it(\|test(" apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx

  # 旧フロー依存の特定
  grep -n "generationMode\|planSkill\|executePlan" apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx

  # F-2 相当: window.skillCreatorAPI undefined ガードのテスト確認
  grep -n -A 10 "F-2\|undefined.*skillCreatorAPI\|skillCreatorAPI.*undefined" apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx

  # F-3 相当: createSkill 例外スローのテスト確認
  grep -n -A 10 "F-3\|throw\|Error\|exception" apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx

  # E-4 相当: 失敗後 setIsGenerating(false) のテスト確認
  grep -n -A 10 "E-4\|setIsGenerating\|isGenerating.*false" apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx

  # W-8b 相当: キャンセル後非同期競合防止のテスト確認
  grep -n -A 10 "W-8b\|cancel\|abort\|競合" apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx
else
  echo "N/A: SkillCreateWizard.llm-generation.test.tsx は current worktree で削除済み"
fi
```

### 3. `SkillCreateWizard.tsx` の現行実装確認

```bash
# handleGenerate の async 競合対策実装確認
grep -n -A 30 "handleGenerate\|const.*generate" apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx

# isGenerating の useState 使用確認
grep -n "isGenerating\|setIsGenerating\|useState" apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx

# useRef / AbortController などの競合対策実装確認
grep -n "useRef\|AbortController\|isMounted\|isCancelled" apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
```

### 4. 方針確定

| 判断基準                                                                   | 方針                                       |
| -------------------------------------------------------------------------- | ------------------------------------------ |
| `SkillCreateWizard.llm-generation.test.tsx` が current worktree で削除済み | 選択肢 A（削除）を既定採用                 |
| 将来ファイルが復元され、未カバーのエッジケースが残る                       | 選択肢 B（条件付き、現 worktree では N/A） |

### 5. 検証マトリクス

| テスト対象                                 | テストコマンド                                                                                          |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| desktop テスト実行（SkillCreateWizard 系） | `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillCreateWizard` |
| desktop 全テスト実行                       | `pnpm --filter @repo/desktop test:run`                                                                  |
| 型チェック                                 | `pnpm --filter @repo/desktop typecheck`                                                                 |
| lint                                       | `pnpm --filter @repo/desktop lint`                                                                      |

## 統合テスト連携【必須】

| 判定項目             | 基準 | 結果    |
| -------------------- | ---- | ------- |
| ユニットテストLine   | 80%+ | pending |
| ユニットテストBranch | 60%+ | pending |
| 型チェック           | PASS | pending |

## 多角的チェック観点

| 観点                | チェック内容                                                                     |
| ------------------- | -------------------------------------------------------------------------------- |
| 重複テスト排除      | `SkillCreateWizard.test.tsx` に同等のエッジケーステストが既に存在しないか        |
| 残存参照安全化      | `SkillCreateWizard.llm-generation.test.tsx` の削除済み前提でも手順が失敗しないか |
| IPC モック統一      | `createSkill` のモックパターンが既存テストと一致しているか                       |
| async 競合対策      | W-8b の競合防止テストが現行の `handleGenerate` 実装で再現可能か                  |
| isGenerating ガード | E-4 の `setIsGenerating(false)` 呼び出しが catch ブロックで確実に実行されるか    |

## サブタスク管理

1. `SkillCreateWizard.test.tsx` の既存カバレッジ確認
2. `SkillCreateWizard.llm-generation.test.tsx` の削除済み確認と N/A 安全化
3. `SkillCreateWizard.tsx` の `handleGenerate` / `isGenerating` 実装確認
4. 選択肢 A 既定・選択肢 B 条件付き N/A の方針確定
5. 検証マトリクス定義
6. 成果物の出力

## 成果物

| 成果物 | パス                        | 説明                                     |
| ------ | --------------------------- | ---------------------------------------- |
| 設計書 | `outputs/phase-2/design.md` | 削除済み確認・残存参照整理・A/B 方針決定 |

## 完了条件

- [ ] `SkillCreateWizard.test.tsx` の既存テスト構造（IPC モック・エラーケース）を調査済み
- [ ] `SkillCreateWizard.llm-generation.test.tsx` は削除済みであり、存在時のみ点検する安全化が入っている
- [ ] F-2/F-3/E-4/W-8b 相当の既存カバレッジ確認または N/A 化が完了している
- [ ] 選択肢 A が既定採用、選択肢 B が条件付き N/A である
- [ ] `handleGenerate` の async 競合対策実装パターンを確認済み
- [ ] 検証マトリクスが定義済み
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 3: 設計レビュー
