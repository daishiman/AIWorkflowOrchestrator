# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目   | 値                     |
| ------ | ---------------------- |
| Phase  | 8                      |
| 機能名 | agent-view-enhancement |
| 作成日 | 2026-03-07             |

## 目的

Phase 5〜7 で実装・テスト済みの AgentView リデザインコードに対して、動作を変えずにコード品質を改善する。DRY原則に基づく共通ユーティリティの抽出、コンポーネント間のスタイル一貫性の確保、Zustand セレクタの最適化を行い、保守性と再レンダリング効率を向上させる。

## 実行タスク

- Task 1: 共通アニメーションユーティリティの抽出
- Task 2: 共通スタイル定数の抽出
- Task 3: マイクロインタラクションの一貫性検証・修正
- Task 4: Zustand セレクタの最適化（P31対策強化）
- Task 5: 型定義の整理と重複排除
- Task 6: リファクタリング後の全テスト実行

## 参照資料

| 資料名                     | パス                                                                                                                                  | 説明                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Phase 1 要件定義           | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/phase-1-requirements.md`                                         | 依存Phase 1 の要件                 |
| Phase 2 設計               | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/phase-2-design.md`                                               | 依存Phase 2 の設計                 |
| タスク仕様書               | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-058a-ui-03-agent-view-enhancement.md` | 元タスク仕様                       |
| Phase 5 実装成果物         | `apps/desktop/src/renderer/components/organisms/AgentView/`                                                                           | 新規コンポーネント群               |
| Phase 5 AgentView統合      | `apps/desktop/src/renderer/views/AgentView/index.tsx`                                                                                 | シングルカラムレイアウト           |
| Phase 5 agentSlice拡張     | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                                                                | recentExecutions, advancedSettings |
| Phase 7 カバレッジレポート | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/outputs/phase-7/coverage-report.md`                              | テストカバレッジ確認結果           |
| Phase 6 成果物             | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/outputs/phase-6/test-expansion-report.md`                        | 依存Phase 6 の成果物               |
| UIコンポーネント仕様       | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                                               | UIコンポーネント設計仕様           |
| デザイン原則               | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                                                        | Apple HIG準拠デザイン原則          |
| UIアーキテクチャ           | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                                                             | コンポーネントアーキテクチャ       |
| 状態管理仕様               | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                          | Zustand設計原則                    |
| 既知の落とし穴             | `.claude/rules/06-known-pitfalls.md`                                                                                                  | P31, P39, P40, P47 等              |
| 実装パターン               | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                                           | リファクタリング適用基準           |

## 依存Phase成果物参照

依存の正本は `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/requirements-traceability-matrix.md` の「依存関係トレース」を参照する。

## 実行手順

### ステップ1: リファクタリング前の全テスト実行

リファクタリング開始前に全テストが PASS することを確認する。この結果がリファクタリング後の回帰検証のベースラインとなる。

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/organisms/AgentView/
cd apps/desktop && pnpm vitest run src/renderer/views/AgentView/
```

### ステップ2: Task 1 — 共通アニメーションユーティリティの抽出

以下のアニメーションパターンが複数コンポーネントに散在しているため、共通ユーティリティに抽出する。

| アニメーション名 | 使用箇所                                    | パラメータ                              |
| ---------------- | ------------------------------------------- | --------------------------------------- |
| hover-scale      | SkillChip, ExecuteButton, 歯車アイコン      | `scale(1.02〜1.1)`, 200ms               |
| tap-scale        | SkillChip, ExecuteButton                    | `scale(0.97)`, 100-150ms                |
| slide-in         | FloatingExecutionBar, AdvancedSettingsPanel | `translateY/X(100%->0)`, 300ms ease-out |
| slide-out        | FloatingExecutionBar, AdvancedSettingsPanel | `translateY/X(0->100%)`, 200ms ease-in  |
| success-bounce   | FloatingExecutionBar                        | `scale(0->1.2->1)`, 300ms               |
| error-shake      | FloatingExecutionBar                        | `translateX(0,-4,4,-4,4,0)`, 300ms      |
| select-bounce    | SkillChip                                   | `scale(0.97->1.05->1)`, 300ms           |

抽出先: `apps/desktop/src/renderer/components/organisms/AgentView/animations.ts`

```typescript
// Tailwind クラス文字列を返す定数オブジェクト
export const transitions = {
  hover: "transition-transform duration-200 ease",
  tap: "transition-transform duration-100 ease-in",
  slideIn: "transition-transform duration-300 ease-out",
  slideOut: "transition-transform duration-200 ease-in",
  colorFade: "transition-colors duration-150",
} as const;

// CSS @keyframes 定義が必要なアニメーションは Tailwind arbitrary values で統一
export const keyframes = {
  selectBounce: "animate-[select-bounce_300ms_ease]",
  successBounce: "animate-[success-bounce_300ms_ease]",
  errorShake: "animate-[error-shake_300ms_ease]",
} as const;
```

### ステップ3: Task 2 — 共通スタイル定数の抽出

8pxグリッドスペーシングとCSS変数参照パターンを定数化する。

抽出先: `apps/desktop/src/renderer/components/organisms/AgentView/styles.ts`

```typescript
// 8px グリッドスペーシング（Tailwind クラス文字列）
export const spacing = {
  sectionGap: "gap-6", // 24px = 8px x 3
  chipGap: "gap-4", // 16px = 8px x 2
  containerPadding: "p-6", // 24px
  sectionHeader: "mb-3", // 12px = 8px x 1.5
} as const;

// コンポーネント共通スタイル（P47対策: Record定数で管理）
export const containerStyles = {
  maxWidth: "max-w-[600px]",
  centerLayout: "flex flex-col items-center",
} as const;
```

### ステップ4: Task 3 — マイクロインタラクションの一貫性検証・修正

全コンポーネントのインタラクションタイミングが以下の統一基準に従っていることを検証し、差異があれば修正する。

| インタラクション種別 | 統一基準          |
| -------------------- | ----------------- |
| ホバー               | 200ms ease        |
| タップ               | 100-150ms ease-in |
| スライドイン         | 300ms ease-out    |
| スライドアウト       | 200ms ease-in     |
| success-bounce       | 300ms ease        |
| 色変化               | 150-200ms ease    |

検証対象:

- `SkillChip.tsx`: ホバー 200ms, タップ 100ms, 選択バウンス 300ms
- `ExecuteButton.tsx`: ホバー 200ms, タップ 150ms
- `FloatingExecutionBar.tsx`: スライドイン 300ms, スライドアウト 200ms, success-bounce 300ms
- `AdvancedSettingsPanel.tsx`: スライドイン 300ms, スライドアウト 200ms, オーバーレイフェード 200ms
- `RecentExecutionList.tsx`: ホバー 150ms, タップ 100ms, 新着フェードイン 200ms
- 歯車アイコン: ホバー 200ms

### ステップ5: Task 4 — Zustand セレクタの最適化（P31対策強化）

以下を確認・修正する:

1. **個別セレクタの使用確認**: 全コンポーネントが `useAppStore()` の一括分割代入ではなく、個別セレクタ（`useRecentExecutions()`, `useIsAdvancedSettingsOpen()` 等）を使用していること
2. **不要な再レンダリングの検出**: `useEffect` 依存配列にアクション関数を含める場合、個別セレクタ経由で取得した安定参照を使用していること
3. **セレクタの粒度確認**: 1つのセレクタが複数の独立した状態を返していないこと（返している場合は分割）

検証コマンド:

```bash
# useAppStore の一括使用箇所を検出
grep -rn "useAppStore()" apps/desktop/src/renderer/components/organisms/AgentView/
grep -rn "useAppStore()" apps/desktop/src/renderer/views/AgentView/

# 合成Hook（deprecated）の使用箇所を検出
grep -rn "useAgentStore()" apps/desktop/src/renderer/components/organisms/AgentView/
grep -rn "useAgentStore()" apps/desktop/src/renderer/views/AgentView/
```

### ステップ6: Task 5 — 型定義の整理と重複排除

1. **重複型の統合**: `ExecutionSummary`, `ModelCardItem`, `AgentExecutionStatus` 等の型定義が複数ファイルに散在していないか確認。散在している場合は1箇所（コンポーネントディレクトリの `types.ts` または `agentSlice.ts`）に集約
2. **export整理**: 未使用の export を削除、internal な型は export しない
3. **P24対策**: `ImportedSkill` 型と `Skill` 型の使い分けが明確であることを確認

抽出先（重複型が3個以上ある場合に作成）: `apps/desktop/src/renderer/components/organisms/AgentView/types.ts`

### ステップ7: Task 6 — リファクタリング後の全テスト実行

```bash
# コンポーネントテスト
cd apps/desktop && pnpm vitest run src/renderer/components/organisms/AgentView/

# レイアウトテスト
cd apps/desktop && pnpm vitest run src/renderer/views/AgentView/

# 型チェック
pnpm --filter @repo/desktop typecheck

# リント
pnpm --filter @repo/desktop lint
```

全テストが PASS し、型エラー・リントエラーが 0 であることを確認する。

## 統合テスト連携

リファクタリング後の統合テスト継続成功を確認する:

```bash
# リファクタリング後のテスト実行（P40対策: 対象パッケージのディレクトリから実行）
cd apps/desktop && pnpm vitest run src/renderer/components/organisms/AgentView/
cd apps/desktop && pnpm vitest run src/renderer/views/AgentView/
```

| 確認項目                     | 基準          |
| ---------------------------- | ------------- |
| SkillChip テスト             | 全件 PASS     |
| ExecuteButton テスト         | 全件 PASS     |
| FloatingExecutionBar テスト  | 全件 PASS     |
| AdvancedSettingsPanel テスト | 全件 PASS     |
| RecentExecutionList テスト   | 全件 PASS     |
| AgentView レイアウトテスト   | 全件 PASS     |
| agentSlice 拡張テスト        | 全件 PASS     |
| TypeScript 型チェック        | エラー 0      |
| ESLint                       | 警告/エラー 0 |

## 多角的チェック観点

| 観点             | 適用判断 | 確認内容                                                                                                 |
| ---------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| UI/UX            | 適用     | アニメーションユーティリティ抽出後もマイクロインタラクションのタイミング・イージングが維持されていること |
| アーキテクチャ   | 適用     | 抽出した共通モジュールが AgentView ディレクトリ内に収まり、外部への不要な依存を作らないこと              |
| パフォーマンス   | 適用     | セレクタ最適化により不要な再レンダリングが発生しないこと                                                 |
| アクセシビリティ | 適用     | リファクタリングにより `role`, `aria-*` 属性が欠落していないこと                                         |

**Electronデスクトップアプリ観点**:

| 層                         | 適用判断 | 確認内容                                                 |
| -------------------------- | -------- | -------------------------------------------------------- |
| フロントエンド（Renderer） | 適用     | 共通ユーティリティ抽出が Renderer 層内で完結していること |
| IPC通信                    | 非適用   | リファクタリングで IPC インターフェースは変更しない      |

## 成果物

| 成果物                       | パス                                                                                                        | 説明                                          |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| アニメーションユーティリティ | `apps/desktop/src/renderer/components/organisms/AgentView/animations.ts`                                    | 共通アニメーション定数                        |
| 共通スタイル定数             | `apps/desktop/src/renderer/components/organisms/AgentView/styles.ts`                                        | 8pxグリッド・コンテナスタイル定数             |
| 型定義集約                   | `apps/desktop/src/renderer/components/organisms/AgentView/types.ts`                                         | 重複型の集約（重複型が3個以上ある場合に作成） |
| リファクタリングレポート     | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/outputs/phase-8/refactoring-report.md` | 変更内容・テスト結果の記録                    |

## 完了条件

- [ ] 共通アニメーションユーティリティ（`animations.ts`）が抽出され、5つのコンポーネントが共通定数を参照していること
- [ ] 共通スタイル定数（`styles.ts`）が抽出され、8pxグリッドスペーシングが定数経由で適用されていること
- [ ] 全コンポーネントのマイクロインタラクションが統一基準（ホバー200ms、タップ100-150ms、スライドイン300ms、スライドアウト200ms）に従っていること
- [ ] 全コンポーネントが個別セレクタパターンを使用し、`useAppStore()` の一括分割代入が存在しないこと（P31対策）
- [ ] 合成Hook（`useAgentStore()` 等、`@deprecated`）が AgentView 関連コンポーネントで使用されていないこと
- [ ] 重複型定義が1箇所に集約されていること
- [ ] 未使用の export が削除されていること
- [ ] リファクタリング前後で全テストが PASS すること（回帰なし）
- [ ] `pnpm --filter @repo/desktop typecheck` がエラー 0 で通ること
- [ ] `pnpm --filter @repo/desktop lint` が警告/エラー 0 で通ること
- [ ] リファクタリングレポートが作成されていること
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. リファクタリング前の全テスト実行（ベースライン確認）
3. Task 1: 共通アニメーションユーティリティの抽出
4. Task 2: 共通スタイル定数の抽出
5. Task 3: マイクロインタラクションの一貫性検証・修正
6. Task 4: Zustand セレクタの最適化（P31対策強化）
7. Task 5: 型定義の整理と重複排除
8. Task 6: リファクタリング後の全テスト実行
9. 成果物の作成・配置
10. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement --phase 8
```

## 次のPhase

Phase 9: 品質保証
