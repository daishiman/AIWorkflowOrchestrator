# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスク ID  | TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001                                                                                                                                            |
| Phase      | 8                                                                                                                                                                                      |
| 前 Phase   | Phase 7: カバレッジ確認（phase-7-coverage-check.md）                                                                                                                                   |
| 次 Phase   | Phase 9: 品質検証（phase-9-quality-assurance.md）                                                                                                                                      |
| 依存成果物 | `outputs/phase-7/coverage-report.md`、`apps/desktop/src/renderer/store/types.ts`、`apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`、`apps/desktop/src/renderer/App.tsx` |
| 成果物パス | `outputs/phase-8/refactoring-log.md`                                                                                                                                                   |
| ステータス | pending                                                                                                                                                                                |

## 目的

Phase 5 で実装したコードの品質を改善する。テストが継続して全件 PASS することを確認しながら実施する。

リファクタリングの重点:

1. **cyclomatic complexity 評価**: `renderView()` が 17 case になった後の複雑度を計測し、許容範囲（目安 20 以下、警告 15 超）を確認する
2. **ViewType union のグルーピング**: 17 メンバーを意味的カテゴリ（core / skill / debug / analytics）でコメント整理する
3. **onClose パターン共通化検討**: `skill-editor` case（L295-304）と新 `skillAnalysis` case の `onClose` パターンの重複を評価し、共通化が適切かを判断する
4. **コード衛生**: `any` 型、未使用 import、`as` キャスト、`!` non-null assertion を検出・除去する

## 実行タスク

| No. | タスク名                                  | 説明                                                                |
| --- | ----------------------------------------- | ------------------------------------------------------------------- |
| 1   | コード品質チェック（静的解析）            | `any` / `as` / `!` / 未使用 import を検出コマンドで一覧化           |
| 2   | store/types.ts リファクタリング           | ViewType union のカテゴリ別グルーピングとコメント整理               |
| 3   | skillLifecycleJourney.ts リファクタリング | onAction? の配置順序と optional chaining 安全性の確認               |
| 4   | App.tsx リファクタリング                  | cyclomatic complexity 評価、onClose パターン共通化検討、import 整理 |
| 5   | テスト全件 PASS 確認                      | リファクタリング後に `vitest run` で全件 PASS を確認                |
| 6   | 改善内容の記録                            | `outputs/phase-8/refactoring-log.md` に変更内容を記録               |

## 参照資料

### タスク関連

| 資料名                     | パス                                                                                                                           | 参照目的                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| Phase 7 カバレッジレポート | `outputs/phase-7/coverage-report.md`                                                                                           | リファクタリング前のカバレッジ基準値確認            |
| Phase 5 実装仕様書         | `docs/30-workflows/skill-lifecycle-routing/tasks/step-01-seq-task-01-viewtype-renderView-foundation/phase-5-implementation.md` | 実装コードの全体構造確認                            |
| コード品質ルール           | `.claude/rules/02-code-quality.md`                                                                                             | コーディング規約（any 禁止、型安全、命名規約）      |
| アーキテクチャルール       | `.claude/rules/01-architecture.md`                                                                                             | 設計原則（SRP、SoC）                                |
| 既知の落とし穴 P19         | `.claude/rules/06-known-pitfalls.md#P19`                                                                                       | 型キャスト（as）によるバリデーションバイパス禁止    |
| 既知の落とし穴 P48         | `.claude/rules/06-known-pitfalls.md#P48`                                                                                       | non-null assertion (`!`) による実行時安全性偽装禁止 |

### システム仕様（aiworkflow-requirements）

| 仕様書名                    | パス                                                            | 参照目的                            |
| --------------------------- | --------------------------------------------------------------- | ----------------------------------- |
| App.tsx renderView 実装     | `apps/desktop/src/renderer/App.tsx` (L269-316)                  | 対象コード（17 case の switch 文）  |
| ViewType union 定義         | `apps/desktop/src/renderer/store/types.ts`                      | 17 メンバー union 型の整理対象      |
| SkillLifecycleJobGuide 定義 | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts` | onAction? 配置順序の確認対象        |
| ナビゲーションUI設計        | `aiworkflow-requirements: ui-ux-navigation.md`                  | ViewType一覧・Global Navigation設計 |
| 状態管理                    | `aiworkflow-requirements: arch-state-management-core.md`        | Zustand Store・ViewType状態管理     |

## 実行手順

### Task 1: コード品質チェック（静的解析）

変更した 3 ファイルを対象に、問題のある記述を検出コマンドで一覧化する。

**any 型の検出:**

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260317-005902-wt-3

grep -n ": any" \
  apps/desktop/src/renderer/store/types.ts \
  apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts \
  apps/desktop/src/renderer/App.tsx
```

**as キャスト（P19 対策）の検出:**

```bash
grep -n " as " \
  apps/desktop/src/renderer/store/types.ts \
  apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts \
  apps/desktop/src/renderer/App.tsx
# 注: JSX の <Component as="div"> や型定義内の as const は除外して判断する
```

**non-null assertion（P48 対策）の検出:**

```bash
grep -n "[a-zA-Z]!" \
  apps/desktop/src/renderer/store/types.ts \
  apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts \
  apps/desktop/src/renderer/App.tsx
# 注: !== や !== の部分マッチを除外して判断する
```

**未使用 import の検出:**

```bash
# ESLint の no-unused-vars ルールで検出
pnpm --filter @repo/desktop exec eslint \
  src/renderer/store/types.ts \
  src/renderer/navigation/skillLifecycleJourney.ts \
  src/renderer/App.tsx \
  --rule '{"@typescript-eslint/no-unused-vars": "error"}' 2>&1
```

**確認項目チェックテーブル:**

| 観点                           | チェック内容                                              | 検出結果 |
| ------------------------------ | --------------------------------------------------------- | -------- |
| `any` 型使用                   | 3 ファイルで `any` が使われていないか                     | -        |
| 未使用 import                  | 追加した import が全て使用されているか                    | -        |
| 命名規約                       | boolean 変数は `is`/`has`/`can`/`should` プレフィックスか | -        |
| 型安全（P19 対策）             | `as` キャストでバリデーションを回避していないか           | -        |
| non-null assertion（P48 対策） | `!` を新規追加していないか（既存コードの `!` も確認）     | -        |
| optional chaining              | `onAction?.()` の呼び出しが安全か                         | -        |

### Task 2: store/types.ts リファクタリング

**ViewType union のカテゴリ別グルーピング戦略:**

現在の 17 メンバーを意味的カテゴリで分類し、コメントで区切りを明示する。

```typescript
// 推奨グルーピング（コメントで区切り）
export type ViewType =
  // コア画面
  | "dashboard"
  | "workspace"
  | "editor"
  | "chat"
  | "settings"
  // スキル関連
  | "skillCenter"
  | "skill-editor"
  | "skillAnalysis" // Phase 5 追加
  | "skillCreate" // Phase 5 追加
  // ワークフロー・構築
  | "graph"
  | "chainBuilder"
  | "scheduleManager"
  // エージェント
  | "agent"
  // 検索・履歴
  | "historySearch"
  // デバッグ・分析
  | "debugPanel"
  | "analyticsDashboard";
```

**確認手順:**

1. `Record<ViewType, Config>` パターンを使用しているコードがある場合、新メンバー（`skillAnalysis`、`skillCreate`）が網羅されているか確認する

```bash
grep -rn "Record<ViewType" apps/desktop/src/
```

2. 網羅されていない場合は該当箇所に新メンバーを追加する（TypeScript の網羅性チェックで検出される場合は `pnpm typecheck` の出力を確認）

### Task 3: skillLifecycleJourney.ts リファクタリング

**onAction? の配置順序確認:**

`SkillLifecycleJobGuide` インターフェースの `onAction?: () => void` が、論理的な順序（必須プロパティ → オプショナルプロパティ）に配置されているか確認する。

```bash
# インターフェース定義を確認
grep -n -A 20 "interface SkillLifecycleJobGuide" \
  apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts
```

**onAction 呼び出し箇所の安全性確認:**

`onAction` を呼び出している箇所が optional chaining（`?.`）を使用しているか確認する。

```bash
grep -n "onAction" apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts
# onAction() ではなく onAction?.() になっているか確認
```

**不要な型アサーションの確認:**

```bash
grep -n " as " apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts
```

### Task 4: App.tsx リファクタリング

#### 4-1: cyclomatic complexity 評価

`renderView()` の switch 文は Phase 5 追加後に 17 case（+ default）になる。

```bash
# ESLint の complexity ルールで確認（目安: 20 以下、警告 15 超）
pnpm --filter @repo/desktop exec eslint src/renderer/App.tsx \
  --rule '{"complexity": ["warn", 20]}' 2>&1 | grep -E "complexity|renderView"
```

**cyclomatic complexity の評価基準:**

| 複雑度 | 評価                 | 対処                                    |
| ------ | -------------------- | --------------------------------------- |
| 1-10   | 低複雑度（優良）     | 対処不要                                |
| 11-20  | 中複雑度（許容範囲） | 対処不要（ただし推移を記録）            |
| 21-30  | 高複雑度（要検討）   | case をグループ化した別関数へ抽出を検討 |
| 31+    | 超高複雑度（要対処） | `renderSkillView()` 等に分割する        |

renderView() が 17 case + default の場合、cyclomatic complexity は 18 程度となり「中複雑度（許容範囲）」になると想定されるが、実測値を記録すること。

#### 4-2: onClose パターン共通化検討

`skill-editor` case（L295-304）と `skillAnalysis` case の `onClose` パターンを比較する。

```bash
# 現在の skill-editor case と skillAnalysis case を確認
grep -n -A 10 '"skill-editor"' apps/desktop/src/renderer/App.tsx
grep -n -A 10 '"skillAnalysis"' apps/desktop/src/renderer/App.tsx
```

**共通化判断基準:**

| 条件                               | 判断           | 根拠                                                            |
| ---------------------------------- | -------------- | --------------------------------------------------------------- |
| 2 箇所のみ同一パターン             | 共通化不要     | 3 回以上の繰り返しから共通化（YAGNI 原則）                      |
| 3 箇所以上で同一パターン           | 共通化を検討   | `createSkillViewOnClose(targetView: ViewType) => () => void` 等 |
| `setCurrentSkillName(null)` の有無 | 差異として記録 | skill-editor と skillAnalysis の違いを明確にする                |

#### 4-3: import ブロック整理

```bash
# ファイル先頭の import を確認
head -40 apps/desktop/src/renderer/App.tsx
```

確認点:

- `SkillAnalysisView` と `SkillCreateWizard` の import がアルファベット順またはグループ順に整理されているか
- `React` 等の外部ライブラリ import → 内部モジュール import の順序になっているか

#### 4-4: default case のフォールバック確認

```bash
grep -n -A 5 "default:" apps/desktop/src/renderer/App.tsx
```

`default` case が適切なフォールバック（`ComingSoonView` または同等のコンポーネント）を返していることを確認する。`null` を返している場合は `ComingSoonView` に変更する。

### Task 5: テスト全件 PASS 確認

リファクタリング後にテストが全件 PASS することを確認する。

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260317-005902-wt-3
pnpm --filter @repo/desktop exec vitest run 2>&1 | tail -20
```

失敗テストがある場合:

1. エラーメッセージを確認し、リファクタリング起因か既存テストの問題かを判断する
2. リファクタリング起因の場合: テストの期待値を更新するか、リファクタリング内容を修正する
3. 既存テストの問題の場合: Phase 6 テスト拡充の成果物を確認し、修正内容を記録する

### Task 6: 改善内容の記録

リファクタリングで変更した内容を `outputs/phase-8/refactoring-log.md` に記録する。

```bash
mkdir -p outputs/phase-8
```

記録する内容:

- Task 1 で検出した問題と修正内容（`any`、`as`、`!`、未使用 import）
- ViewType union のグルーピング変更（前後の差分）
- onClose パターン共通化の判断結果（共通化した/しなかった理由）
- cyclomatic complexity の実測値と評価
- テスト PASS の確認結果

## 統合テスト連携

Phase 8 のリファクタリング完了後、Phase 9（品質検証）で以下の検証が行われる。

- `pnpm lint` による全ファイルの Lint 確認
- `pnpm typecheck` による TypeScript 型チェック
- `vitest run` による全テスト PASS 確認

Phase 8 では事前に以下を確認しておくことで Phase 9 の工数を削減できる。

```bash
# Phase 9 での検証を先取りして確認
pnpm --filter @repo/desktop exec eslint src/renderer/App.tsx src/renderer/store/types.ts src/renderer/navigation/skillLifecycleJourney.ts
pnpm --filter @repo/desktop exec tsc --noEmit 2>&1 | head -20
```

## 成果物

| 成果物               | パス                                 | 説明                                                   |
| -------------------- | ------------------------------------ | ------------------------------------------------------ |
| リファクタリングログ | `outputs/phase-8/refactoring-log.md` | 変更内容・判断根拠・cyclomatic complexity 実測値を記録 |

## 完了条件

- [ ] 変更した 3 ファイルに `any` 型が存在しない
- [ ] 未使用 import が存在しない
- [ ] non-null assertion (`!`) が新規追加されていない（既存コードの `!` も確認・記録済み）
- [ ] `as` キャストによるバリデーション回避がない（P19 対策）
- [ ] `onAction?.()` の呼び出しが optional chaining で安全に実装されている
- [ ] `ViewType` union の 17 メンバーが意味的カテゴリ別にコメントで整理されている
- [ ] `renderView()` の cyclomatic complexity が実測され、`refactoring-log.md` に記録されている
- [ ] `onClose` パターン共通化について判断（実施 or 不実施の理由）が `refactoring-log.md` に記録されている
- [ ] `Record<ViewType, Config>` を使用している箇所に新メンバーが網羅されている（存在しない場合は「該当なし」と記録）
- [ ] `default` case が `ComingSoonView` または同等のフォールバックを返している
- [ ] `pnpm --filter @repo/desktop exec vitest run` が全件 PASS する
- [ ] `outputs/phase-8/refactoring-log.md` に変更内容と判断根拠が記録されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装の場合           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計            | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |
| データ整合性       | DB操作の場合                       | `aiworkflow-requirements: database-*.md`     |
| エラーハンドリング | 例外処理が必要な場合               | `aiworkflow-requirements: error-handling.md` |
| パフォーマンス     | 性能要件がある場合                 | `aiworkflow-requirements: architecture-*.md` |
| アクセシビリティ   | UI実装の場合                       | `aiworkflow-requirements: ui-ux-*.md`        |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React実装の場合          | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer連携の場合     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | データ永続化の場合          | `aiworkflow-requirements: database-*.md`               |

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-lifecycle-routing --phase 8
```

## 次 Phase

Phase 9: 品質検証（phase-9-quality-assurance.md）
