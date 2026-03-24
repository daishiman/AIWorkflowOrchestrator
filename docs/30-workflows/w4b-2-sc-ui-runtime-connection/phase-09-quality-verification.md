# Phase 9: 品質検証

## メタ情報

| 項目     | 値                               |
| -------- | -------------------------------- |
| Phase    | 9                                |
| タスクID | TASK-SC-06-UI-RUNTIME-CONNECTION |
| 機能名   | w4b-2-sc-ui-runtime-connection   |
| 作成日   | 2026-03-22                       |
| 更新日   | 2026-03-24                       |

## 目的

Lint・TypeScript 型チェック・全テスト実行を行い、UI とバックエンド連携の品質基準を満たしていることを確認する。P31/P48 対策の実装状況を手動で確認し、any 型・non-null assertion の残存を排除する。

## 依存関係

- 前提成果物: Phase 8 リファクタリング済みコード

## 実行タスク

### Task 1: ESLint 実行

```bash
# デスクトップパッケージの Lint
pnpm --filter @repo/desktop lint

# 共有パッケージの Lint（型定義変更がある場合）
pnpm --filter @repo/shared lint
```

エラーが発生した場合は全て修正してから次の Task へ進む。

### Task 2: TypeScript 型チェック実行

```bash
# デスクトップパッケージの型チェック
pnpm --filter @repo/desktop typecheck

# 共有パッケージの型チェック
pnpm --filter @repo/shared typecheck
```

エラーが発生した場合は全て修正してから次の Task へ進む。`as` キャストや `any` 型でのエラー回避は禁止（P19 対策）。

### Task 3: 全テスト実行

```bash
# 対象パッケージのディレクトリから実行（P40 対策: vitest.config.ts が正しく適用される）
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260324-174257-wt-1/apps/desktop
pnpm vitest run src/renderer/components/skill/
pnpm vitest run src/renderer/store/
pnpm vitest run src/renderer/hooks/
```

全テスト PASS を確認してから次の Task へ進む。

### Task 4: P31 対策確認（合成 Hook 無限ループ防止）

以下のコマンドで useEffect の依存配列を確認する:

```bash
# SkillLifecyclePanel で合成 Hook の戻り値関数が useEffect に渡されていないか確認
grep -n "useEffect" apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

確認基準:

| 確認項目                                                                                 | 合格条件                                                                           |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| useEffect の依存配列に `useIsSkillGenerating()` 等の合成 Hook 戻り値関数が含まれていない | 個別セレクタ（`useIsSkillGenerating` 等）を使用している                            |
| アクション関数（`handlePlanSkill` 等）を useEffect 依存配列に含める場合                  | `useCallback` でメモ化されているか、または Hook から取得した安定参照を使用している |

新規追加したセレクタ一覧（P31 対策で設計した個別セレクタ）:

```typescript
// store/index.ts に追加されたセレクタ（全てプリミティブ値またはアクション参照）
export const useIsSkillGenerating = () =>
  useAppStore((state) => state.isGenerating);
export const useGenerationProgress = () =>
  useAppStore((state) => state.generationProgress);
export const useGenerationError = () =>
  useAppStore((state) => state.generationError);
export const useCurrentPlanId = () =>
  useAppStore((state) => state.currentPlanId);
export const useCurrentPlanResult = () =>
  useAppStore((state) => state.currentPlanResult);
export const useSetIsSkillGenerating = () =>
  useAppStore((state) => state.setIsGenerating);
export const useClearGenerationState = () =>
  useAppStore((state) => state.clearGenerationState);
```

全セレクタがプリミティブ値またはアクション参照（Zustand 安定参照）を返していることを確認する。

### Task 5: P48 対策確認（派生セレクタ useShallow 適用）

```bash
# filter/map を使う派生セレクタが useShallow を適用しているか確認
grep -n "useShallow\|\.filter\|\.map" apps/desktop/src/renderer/store/index.ts
```

確認基準:

| セレクタタイプ                            | useShallow 要否                                                          |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| プリミティブ値（boolean, string, null）   | 不要                                                                     |
| アクション参照（Zustand 管理）            | 不要                                                                     |
| オブジェクト（currentPlanResult）         | Zustand Object.is 比較で参照安定のため不要（Phase 3 レビューで確認済み） |
| `.filter()` / `.map()` を含む派生セレクタ | **必須**                                                                 |

新規追加セレクタに `.filter()` / `.map()` が含まれないことを確認する（Phase 2 設計でプリミティブ値のみに設計済み）。

### Task 6: any 型の確認

```bash
# 変更対象ファイルの any 型残存確認
grep -n ": any\|as any\|<any>" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx \
  apps/desktop/src/renderer/store/slices/agentSlice.ts \
  apps/desktop/src/renderer/store/index.ts \
  apps/desktop/src/renderer/hooks/useSkillLLMGeneration.ts 2>/dev/null
```

期待結果: 0件。発見した場合は適切な型定義に置換する。

### Task 7: non-null assertion の確認（P52 対策）

```bash
# 変更対象ファイルの ! 残存確認（P52: スコープ外コードの残存防止）
grep -n "!" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx \
  apps/desktop/src/renderer/hooks/useSkillLLMGeneration.ts 2>/dev/null
```

確認基準:

- `result.data!` のような non-null assertion は禁止（P48 対策）
- `Array.isArray(result.data?.xxx)` による実行時型検証に置換する
- 論理演算子（`!flag` など）の `!` は対象外

### Task 8: エラー・警告の一括修正と再確認

Task 1〜7 で発見した問題を全て修正した後、最終確認を実行する:

```bash
# 最終確認（全チェック一括実行）
pnpm --filter @repo/desktop lint && \
pnpm --filter @repo/desktop typecheck && \
cd apps/desktop && pnpm vitest run src/renderer/
```

全チェックが PASS したことを確認する。

## 品質検証結果サマリー（実行時に記入）

| チェック項目                       | 結果 | エラー数 | 備考 |
| ---------------------------------- | ---- | -------- | ---- |
| Lint (@repo/desktop)               | -    | -        | -    |
| Lint (@repo/shared)                | -    | -        | -    |
| TypeCheck (@repo/desktop)          | -    | -        | -    |
| TypeCheck (@repo/shared)           | -    | -        | -    |
| Tests (renderer/components/skill/) | -    | -        | -    |
| Tests (renderer/store/)            | -    | -        | -    |
| Tests (renderer/hooks/)            | -    | -        | -    |
| P31 対策確認                       | -    | -        | -    |
| P48 対策確認                       | -    | -        | -    |
| any 型残存                         | -    | -        | -    |
| non-null assertion 残存            | -    | -        | -    |

## 参照資料

- Phase 8 リファクタリング済みコード
- `.claude/rules/02-code-quality.md`（TypeScript 型安全、any 型禁止）
- `.claude/rules/03-state-management.md`（Zustand 設計原則）
- `.claude/rules/06-known-pitfalls.md`（P31: 合成 Hook 無限ループ、P48: useShallow、P52: non-null assertion 残存）
- `CLAUDE.md`（lint, typecheck の実行方法）

## 実行手順

### ステップ1: ESLint 実行

`pnpm --filter @repo/desktop lint` と `pnpm --filter @repo/shared lint` を実行する。

### ステップ2: TypeScript 型チェック

`pnpm --filter @repo/desktop typecheck` と `pnpm --filter @repo/shared typecheck` を実行する。

### ステップ3: 全テスト実行

`cd apps/desktop && pnpm vitest run src/renderer/` で全テスト PASS を確認する（P40 対策）。

### ステップ4: P31/P48 対策手動確認

useEffect 依存配列と派生セレクタの安全性を grep で確認する。

### ステップ5: any 型・non-null assertion 残存確認

変更対象ファイルに `any` 型と `result.data!` パターンが残存していないことを確認する（P19/P52 対策）。

### ステップ6: 最終一括確認

Lint + TypeCheck + Test を一括実行し、品質検証結果サマリーテーブルを記入する。

## 統合テスト連携

- 全テスト（既存 + 新規）が PASS することを確認
- 既存テストに影響が出ていないことをリグレッションテストで確認
- P31/P48 対策の検証としてセレクタの参照安定性テストが PASS していることを確認

## 多角的チェック観点

| 観点    | 適用判断 | 確認内容                             |
| ------- | -------- | ------------------------------------ |
| Lint    | 該当     | ESLint エラー 0件                    |
| 型安全  | 該当     | TypeCheck エラー 0件、any 型不使用   |
| テスト  | 該当     | 全テスト PASS                        |
| P31/P48 | 該当     | 合成 Hook 不使用、派生セレクタ安全性 |
| P19/P52 | 該当     | non-null assertion 不使用            |

## サブタスク管理

| サブタスク                      | 担当           | 状態   | 備考                 |
| ------------------------------- | -------------- | ------ | -------------------- |
| Task 1: ESLint 実行             | Phase 9 実行者 | 未着手 | desktop + shared     |
| Task 2: TypeCheck               | Phase 9 実行者 | 未着手 | desktop + shared     |
| Task 3: 全テスト実行            | Phase 9 実行者 | 未着手 | P40 対策             |
| Task 4: P31/P48 手動確認        | Phase 9 実行者 | 未着手 | grep 確認            |
| Task 5: P19/P52 確認            | Phase 9 実行者 | 未着手 | any + ! 残存         |
| Task 6: any 型確認              | Phase 9 実行者 | 未着手 | grep 確認            |
| Task 7: non-null assertion 確認 | Phase 9 実行者 | 未着手 | grep 確認            |
| Task 8: 最終一括確認            | Phase 9 実行者 | 未着手 | サマリーテーブル記入 |

## 成果物

- 品質検証結果サマリー（上記テーブルに記入済みのもの）

## 完了条件

- [ ] `pnpm --filter @repo/desktop lint` が PASS した
- [ ] `pnpm --filter @repo/shared lint` が PASS した
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS した
- [ ] `pnpm --filter @repo/shared typecheck` が PASS した
- [ ] `pnpm vitest run src/renderer/components/skill/` が全テスト PASS した
- [ ] `pnpm vitest run src/renderer/store/` が全テスト PASS した
- [ ] `useEffect` 依存配列に合成 Hook 戻り値関数が含まれていないことを確認した（P31 対策）
- [ ] 派生セレクタに `.filter()`/`.map()` が含まれる場合は `useShallow` が適用されていることを確認した（P48 対策）
- [ ] `any` 型が変更対象ファイルに残存していないことを確認した
- [ ] non-null assertion (`!`) の不当使用がないことを確認した（P52 対策）
- [ ] 品質検証結果サマリーテーブルを記入した

## タスク100%実行確認【必須】

- [ ] 上記「完了条件」の全チェックボックスが ON であることを確認した
- [ ] 「実行手順」の全ステップを実行した
- [ ] 「サブタスク管理」の全タスクが完了状態である
- [ ] 「統合テスト連携」の全項目を確認した
- [ ] 「多角的チェック観点」の全観点を確認した
- [ ] 成果物が全て生成されている

## 次のPhase

Phase 10: 最終レビュー
