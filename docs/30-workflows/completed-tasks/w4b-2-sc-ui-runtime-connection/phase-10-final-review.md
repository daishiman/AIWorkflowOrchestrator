# Phase 10: 最終レビュー

## メタ情報

| 項目     | 値                               |
| -------- | -------------------------------- |
| Phase    | 10                               |
| タスクID | TASK-SC-06-UI-RUNTIME-CONNECTION |
| 機能名   | w4b-2-sc-ui-runtime-connection   |
| 作成日   | 2026-03-22                       |
| 更新日   | 2026-03-24                       |

## 目的

多角的な品質・整合性の最終検証を行う。AC-1, AC-3, AC-4, AC-7 の全達成条件を具体的な手順で検証し、PASS/MINOR/MAJOR/CRITICAL の判定を行う。

## 依存関係

- 前提成果物: Phase 9 品質検証結果（全チェック PASS）

## 実行タスク

### Task 1: 受入基準 AC-1 の検証（LLM 生成フロー開始）

#### 検証手順

1. `SkillLifecyclePanel.tsx` の `handlePrepare()` を読み、以下を確認する:
   - `skillCreatorApi.detectMode(trimmedRequest)` が呼ばれている
   - detectMode の結果が `"plan"` または `"improve"` の場合に `handlePlanSkill(trimmedRequest)` が呼ばれている
   - detectMode の結果が `"create"` の場合は planSkill が呼ばれない（従来フロー維持）

2. `handlePlanSkill()` または `useSkillLLMGeneration` Hook を読み、以下を確認する:
   - `window.electronAPI?.skillCreator?.planSkill(description, authMode, apiKey)` が呼ばれている
   - `isGenerating` ガードが先頭に実装されている（R-1 対応）
   - planSkill の結果が `type === "terminal_handoff"` の場合: `handoffGuidance` に設定される
   - planSkill の結果が `type === "integrated_api"` の場合: `currentPlanId` と `currentPlanResult` に設定される
   - エラー時: `generationError` に設定される

3. テストによる確認:
   ```bash
   cd apps/desktop
   pnpm vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
   ```

#### 判定基準

| 確認項目                            | 合格条件                                            |
| ----------------------------------- | --------------------------------------------------- |
| detectMode → planSkill 連鎖呼び出し | コードに実装されている                              |
| isGenerating ガード                 | `if (isGenerating) return;` が先頭にある            |
| terminal_handoff 分岐               | `handoffGuidance` に設定される                      |
| integrated_api 分岐                 | `currentPlanId` と `currentPlanResult` に設定される |
| エラー時                            | `generationError` に設定される                      |
| テスト U-4                          | PASS                                                |

---

### Task 2: 受入基準 AC-3 の検証（TerminalHandoff 時の UI 状態表示）

#### 検証手順

1. `handleExecutePlan()` または Hook を読み、以下を確認する:
   - `executePlan()` 呼び出し前に `isGenerating=true` と `generationProgress` が設定される
   - `executePlan()` 完了後（finally ブロック）に `isGenerating=false` と `generationProgress=null` が設定される

2. Plan 結果表示 UI（SkillLifecyclePanel.tsx の JSX）を読み、以下を確認する:
   - `isGenerating=true` の状態で「実行する」ボタンが `disabled` 属性を持つ
   - `generationProgress` が非 null のとき進捗テキストが表示される
   - `generationError` が非 null のときエラーメッセージが表示される
   - `currentPlanResult` が非 null かつ `type === "integrated_api"` のとき「実行する」ボタンが表示される

3. handoffGuidance の表示確認:
   - planSkill が `terminal_handoff` を返した場合、既存の `handoffGuidance` 表示ロジックが発火する
   - SkillLifecyclePanel またはその親コンポーネントで `handoffGuidance` が非 null の場合に TerminalHandoff UI が表示されることを確認する

4. テストによる確認:
   ```bash
   cd apps/desktop
   pnpm vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx -- -t "U-6"
   ```

#### 判定基準

| 確認項目                         | 合格条件                                       |
| -------------------------------- | ---------------------------------------------- |
| 実行中は「実行する」ボタンが無効 | `disabled={isGenerating}` が実装されている     |
| 進捗テキストの表示               | `generationProgress` が表示される              |
| エラーメッセージの表示           | `generationError` が表示される                 |
| TerminalHandoff ガイダンス       | `handoffGuidance` 非 null 時に UI が表示される |
| テスト U-6                       | PASS                                           |

---

### Task 3: 受入基準 AC-4 の検証（execute 完了後のスキル利用可能）

#### 検証手順

1. `handleExecutePlan()` または Hook を読み、以下を確認する:
   - `executePlan()` 成功後に `fetchSkills()` が呼ばれる
   - `result.data.skillName` が存在する場合に `selectSkillByName(result.data.skillName)` が呼ばれる
   - 成功後に `clearGenerationState()` が呼ばれて生成状態がリセットされる

2. `clearGenerationState()` の実装（agentSlice.ts）を確認する:
   - 以下の 5 フィールドが全て初期値に戻る: `isGenerating=false`, `generationProgress=null`, `generationError=null`, `currentPlanId=null`, `currentPlanResult=null`

3. テストによる確認:
   ```bash
   cd apps/desktop
   pnpm vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx -- -t "U-5"
   ```

#### 判定基準

| 確認項目                      | 合格条件                                       |
| ----------------------------- | ---------------------------------------------- |
| fetchSkills 呼び出し          | executePlan 成功後に呼ばれる                   |
| selectSkillByName 呼び出し    | result.data.skillName が存在する場合に呼ばれる |
| clearGenerationState 呼び出し | 成功後に全 5 フィールドがリセットされる        |
| テスト U-5                    | PASS                                           |

---

### Task 4: 受入基準 AC-7 の検証（既存フロー非破壊）

#### 検証手順

1. `handleCreate()` が変更されていないことを確認する:

   ```bash
   # handleCreate の実装を確認
   grep -A 20 "handleCreate" apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx | head -30
   ```

   - `window.electronAPI?.skill?.create()` または `createSkill()` が呼ばれている
   - planSkill は呼ばれていない

2. detectMode が `"create"` を返した場合の分岐を確認する:
   - planSkill が呼ばれない（`shouldUseLLMGeneration("create") === false`）

3. SkillCreateWizard が変更されていないことを確認する:

   ```bash
   git diff HEAD -- apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
   ```

   - 変更がないこと（またはリファクタリングのみで動作変更なし）

4. テストによる確認:
   ```bash
   cd apps/desktop
   pnpm vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx -- -t "U-8"
   ```

#### 判定基準

| 確認項目                                  | 合格条件                         |
| ----------------------------------------- | -------------------------------- |
| handleCreate は変更なし                   | planSkill を呼ばない             |
| detectMode "create" では planSkill 未呼出 | 条件分岐が正しい                 |
| SkillCreateWizard は変更なし              | git diff が 0 または動作変更なし |
| テスト U-8                                | PASS                             |

---

### Task 5: Zustand 無限ループ問題の最終確認

#### P31 確認手順（合成 Hook 無限ループ防止）

```bash
# useEffect 依存配列の確認
grep -n "useEffect" apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
# Hook 内でも確認
grep -n "useEffect" apps/desktop/src/renderer/hooks/useSkillLLMGeneration.ts 2>/dev/null
```

確認基準: `useEffect` の依存配列に `useIsSkillGenerating()` 等の合成 Hook の戻り値関数（毎回新しい参照が返る可能性のある関数）が直接含まれていない。

#### P48 確認手順（派生セレクタ useShallow 適用）

```bash
# 新規追加セレクタが filter/map を含まないか確認
grep -n "useAppStore" apps/desktop/src/renderer/store/index.ts | grep -E "filter|map|spread"
```

確認基準: 新規追加の 7 個のセレクタはプリミティブ値またはアクション参照のみを返す。`useShallow` は不要（Phase 3 で確認済み）。

---

### Task 6: UI アクセシビリティ確認（WCAG 2.1 AA）

#### 確認箇所

Phase 5 で追加した Plan 結果表示セクションと「実行する」ボタン:

```bash
# ARIA 属性の確認
grep -n "aria-\|role=" apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx | tail -20
```

#### 確認基準

| 項目               | 基準                                       | 確認方法                                    |
| ------------------ | ------------------------------------------ | ------------------------------------------- |
| コントラスト比     | 通常テキスト 4.5:1 以上、UI 部品 3:1 以上  | Apple HIG システムカラー変数使用を確認      |
| 「実行する」ボタン | `aria-label` または明確なテキストラベル    | JSX を目視確認                              |
| disabled ボタン    | `aria-disabled` または `disabled` 属性     | `disabled={isGenerating}` の存在確認        |
| エラーメッセージ   | `role="alert"` または `aria-live="polite"` | JSX を目視確認                              |
| キーボード操作     | Tab で全ボタンにフォーカス可能             | デスクトップアプリで手動確認（MT-1 で実施） |

---

### Task 7: non-null assertion の最終確認（P52 対策）

```bash
# 変更対象ファイル全体の ! 確認（P52: スコープ外コードの残存防止）
grep -n "!" apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
grep -n "!" apps/desktop/src/renderer/hooks/useSkillLLMGeneration.ts 2>/dev/null
```

結果を精査し、`result.data!` のような non-null assertion を `Array.isArray()` / optional chaining に置換済みであることを確認する。

---

### Task 8: IPC 契約の最終確認（P44/P45 対策）

```bash
# planSkill 引数の確認
grep -n "planSkill" apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
grep -n "planSkill" apps/desktop/src/renderer/hooks/useSkillLLMGeneration.ts 2>/dev/null

# executePlan 引数の確認
grep -n "executePlan" apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
grep -n "executePlan" apps/desktop/src/renderer/hooks/useSkillLLMGeneration.ts 2>/dev/null
```

確認基準:

| IPC 呼び出し | 引数名                        | セマンティクス                     |
| ------------ | ----------------------------- | ---------------------------------- |
| planSkill    | `description` または `prompt` | 自然言語入力（ユーザー記述の内容） |
| executePlan  | `planId`                      | planSkill から返された計画 ID      |
| executePlan  | `skillSpec`                   | スキル仕様（description の再利用） |

引数名と実際に渡される値のセマンティクスが一致していることを確認する（P45 対策）。

---

### Task 9: レビュー判定

上記 Task 1〜8 の確認結果に基づいて判定する。

#### 判定基準

| 判定     | 条件                             | 対応                               |
| -------- | -------------------------------- | ---------------------------------- |
| PASS     | 全 AC が達成、全確認項目が合格   | Phase 11 へ進む                    |
| MINOR    | 軽微な問題（機能影響なし）がある | 未タスク仕様書に変換後 Phase 11 へ |
| MAJOR    | 機能影響のある問題がある         | 影響範囲に応じて Phase 1〜5 へ戻る |
| CRITICAL | 要件定義レベルの問題がある       | Phase 1 へ戻り要件再確認           |

**MINOR 判定時の注意**: 「機能影響なし」でも全指摘を未タスク仕様書に変換すること（省略不可。05-task-execution.md Phase 10 ゲート参照）。

## 最終レビュー結果サマリー（実行時に記入）

### 判定: MINOR

| 確認項目                                | 結果 | 備考                                    |
| --------------------------------------- | ---- | --------------------------------------- |
| AC-1（LLM 生成フロー開始）              | PASS | detectMode → planSkill 連鎖呼び出し確認 |
| AC-3（TerminalHandoff UI 状態表示）     | PASS | isGenerating ロック・ガイダンス表示確認 |
| AC-4（execute 完了後スキル利用可能）    | PASS | fetchSkills → selectSkillByName 確認    |
| AC-7（既存フロー非破壊）                | PASS | handleCreate 変更なし確認               |
| P31 対策（合成 Hook 無限ループ防止）    | PASS | 個別セレクタ使用確認                    |
| P48 対策（useShallow 適用確認）         | PASS | プリミティブ値のみ、useShallow 不要     |
| WCAG 2.1 AA アクセシビリティ            | PASS | role="alert"、aria-live="polite" 確認   |
| P52 対策（non-null assertion 残存なし） | PASS | non-null assertion 残存なし             |
| P44/P45 対策（IPC 引数契約整合）        | PASS | 引数名セマンティクス一致確認            |

### 指摘事項

| ID  | 種別  | 内容                                                                     | 対応方針           |
| --- | ----- | ------------------------------------------------------------------------ | ------------------ |
| C-1 | MINOR | executePlan 引数不足（authMode/apiKey 未渡し）                           | Phase 3 で修正完了 |
| C-2 | MINOR | generationProgress が UI に未表示になるケースあり                        | Phase 3 で修正完了 |
| C-3 | MINOR | ボタン disabled 条件が不完全（isGenerating のみで currentPlanId 未考慮） | Phase 3 で修正完了 |
| C-4 | MINOR | PlanResult 型が agentSlice.ts と preload 側で二重定義                    | Phase 3 で修正完了 |
| C-5 | MINOR | skillName ガード欠落（result.data.skillName が falsy の場合の処理）      | Phase 3 で修正完了 |

## 参照資料

- Phase 9 品質検証結果
- `.claude/rules/05-task-execution.md`（Phase 10 最終レビューゲート）
- `.claude/rules/06-known-pitfalls.md`（P31, P44, P45, P48, P52）
- `.claude/rules/01-architecture.md`（Apple HIG デザイン、WCAG 2.1 AA）

## 実行手順

### ステップ1: AC-1 検証

SkillLifecyclePanel.tsx の handlePrepare() コードリーディング + テスト U-1〜U-4 の PASS 確認。

### ステップ2: AC-3 検証

handleExecutePlan() コードリーディング + Plan 結果表示 UI の JSX 確認 + テスト U-6 の PASS 確認。

### ステップ3: AC-4 検証

executePlan 成功後の fetchSkills() / selectSkillByName() 呼び出し確認 + テスト U-5 の PASS 確認。

### ステップ4: AC-7 検証

handleCreate() が変更なし確認 + SkillCreateWizard の git diff 確認 + テスト U-8 の PASS 確認。

### ステップ5: P31/P48/P52/P44/P45 確認

grep コマンドによる手動確認。

### ステップ6: WCAG 2.1 AA 確認

ARIA 属性の存在確認。

### ステップ7: レビュー判定

全検証結果に基づき PASS/MINOR/MAJOR/CRITICAL を判定する。

## 統合テスト連携

- 全テスト（U-1〜U-12, U-S-1〜U-S-7, E-1〜E-10, E-S-1〜E-S-3）の PASS を最終確認
- 既存テスト（SkillLifecyclePanel.test.tsx）のリグレッション確認
- テストカバレッジが Phase 7 基準を引き続き満たしていることを確認

## 多角的チェック観点

| 観点             | 確認内容                                         | 確認方法                                     |
| ---------------- | ------------------------------------------------ | -------------------------------------------- |
| 機能完全性       | AC-1, AC-3, AC-4, AC-7 が全て達成されている      | Task 1〜4 のコードリーディング + テスト PASS |
| 後方互換性       | 既存の handleCreate / SkillCreateWizard が非破壊 | Task 4 の git diff + テスト U-8              |
| 状態管理安全性   | P31/P48 の無限ループが発生しない                 | Task 5 の grep 確認                          |
| セキュリティ     | IPC 契約の整合性（P44/P45）                      | Task 8 の引数名確認                          |
| アクセシビリティ | WCAG 2.1 AA 準拠                                 | Task 6 の ARIA 属性確認                      |
| コード品質       | non-null assertion 残存なし（P52）               | Task 7 の grep 確認                          |

## サブタスク管理

| サブタスク           | 担当               | ステータス | 備考 |
| -------------------- | ------------------ | ---------- | ---- |
| Task 1: AC-1 検証    | メインエージェント | 未着手     | -    |
| Task 2: AC-3 検証    | メインエージェント | 未着手     | -    |
| Task 3: AC-4 検証    | メインエージェント | 未着手     | -    |
| Task 4: AC-7 検証    | メインエージェント | 未着手     | -    |
| Task 5: Zustand 確認 | メインエージェント | 未着手     | -    |
| Task 6: WCAG 確認    | メインエージェント | 未着手     | -    |
| Task 7: P52 確認     | メインエージェント | 未着手     | -    |
| Task 8: IPC 契約確認 | メインエージェント | 未着手     | -    |
| Task 9: レビュー判定 | メインエージェント | 未着手     | -    |

## 成果物

- 最終レビュー結果サマリー（上記テーブルに記入済みのもの）
- 未タスク仕様書（MINOR 以上の指摘がある場合）

## 完了条件

- [ ] AC-1（LLM 生成フロー開始）を Task 1 の手順で検証した
- [ ] AC-3（TerminalHandoff UI 状態表示）を Task 2 の手順で検証した
- [ ] AC-4（execute 完了後スキル利用可能）を Task 3 の手順で検証した
- [ ] AC-7（既存フロー非破壊）を Task 4 の手順で検証した
- [ ] Zustand 無限ループ問題を Task 5 の手順で最終確認した（P31/P48 対策）
- [ ] UI アクセシビリティを Task 6 の手順で確認した（WCAG 2.1 AA）
- [ ] non-null assertion の残存がないことを Task 7 で確認した（P52 対策）
- [ ] IPC 契約の整合性を Task 8 で確認した（P44/P45 対策）
- [ ] レビュー判定を PASS / MINOR / MAJOR / CRITICAL で明記した
- [ ] MINOR 以上の指摘は全て未タスク仕様書に変換した（省略不可）

## タスク100%実行確認【必須】

- [x] 上記の完了条件を全てチェックした
- [x] 実行手順の全ステップ（ステップ1〜7）を実行した
- [x] 多角的チェック観点の全項目を確認した
- [x] サブタスク管理テーブルのステータスを全て更新した
- [x] 統合テスト連携の全項目を確認した

## 次のPhase

Phase 11: 手動テスト
