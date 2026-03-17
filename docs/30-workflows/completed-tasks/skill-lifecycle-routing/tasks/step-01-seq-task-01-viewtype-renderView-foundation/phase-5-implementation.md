# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------ |
| タスクID   | TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001                                                                                    |
| Phase      | 5 - 実装                                                                                                                       |
| 前 Phase   | Phase 4 - テスト作成（Red 状態確認済み）                                                                                       |
| 次 Phase   | Phase 6 - テスト拡充                                                                                                           |
| 依存成果物 | `phase-4-test-creation.md`（テストコード・モック構成）、`phase-2-design.md`（設計スニペット）                                  |
| 成果物パス | `docs/30-workflows/skill-lifecycle-routing/tasks/step-01-seq-task-01-viewtype-renderView-foundation/phase-5-implementation.md` |
| ステータス | not_started                                                                                                                    |

## 目的

Phase 4 で作成した Red テストを Green にするため、型定義 → ビジネスロジック → UI の依存方向に沿って 3 ファイルを最小変更で実装する。

## 実行タスク

1. **Task 1**: `apps/desktop/src/renderer/store/types.ts` — ViewType union に `"skillAnalysis"` と `"skillCreate"` を追加（AC-1, AC-3）
2. **Task 2**: `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts` — `SkillLifecycleJobGuide` インターフェースに `onAction?: () => void` を追加（AC-4）
3. **Task 3**: `apps/desktop/src/renderer/App.tsx` — `renderView()` に `case "skillAnalysis"` と `case "skillCreate"` を追加（AC-2）
4. **Task 4**: TypeScript 型チェック・テスト実行で AC-5, AC-6 を確認

## 参照資料

### タスク関連

| 資料名                       | パス                                                                   | 説明                                              |
| ---------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------- |
| Phase 2 設計書               | `phase-2-design.md`                                                    | 設計スニペット・影響範囲テーブル                  |
| Phase 4 テスト仕様書         | `phase-4-test-creation.md`                                             | テストコード・モック構成（TC-VT / TC-RV / TC-SL） |
| ViewType テスト              | `apps/desktop/src/renderer/store/types.test.ts`                        | TC-VT-01〜04（Red 状態）                          |
| App renderView テスト        | `apps/desktop/src/renderer/__tests__/App.renderView.viewtype.test.tsx` | TC-RV-01〜03（Red 状態）                          |
| skillLifecycleJourney テスト | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.test.ts`   | TC-SL-01〜05（Red 状態）                          |

### システム仕様

| 資料名               | パス                                     | 説明                                   |
| -------------------- | ---------------------------------------- | -------------------------------------- |
| 落とし穴 P23/P32     | `.claude/rules/06-known-pitfalls.md#P23` | 型定義の複数箇所同時更新必須           |
| 落とし穴 P9          | `.claude/rules/06-known-pitfalls.md#P9`  | テスト間で状態を共有しない             |
| アーキテクチャルール | `.claude/rules/01-architecture.md`       | レイヤー依存方向（型定義→ロジック→UI） |

## 実行手順

### Task 1: store/types.ts — ViewType 拡張

`apps/desktop/src/renderer/store/types.ts` を Read して現在の ViewType union を確認した後、以下の 2 メンバーを追加する。

**追加するコード（既存 `"skill-center"` の直後に追記）:**

```typescript
export type ViewType =
  | "dashboard"
  | "workspace"
  | "editor"
  | "chat"
  | "graph"
  | "settings"
  | "agent"
  | "skillCenter"
  | "historySearch"
  | "chainBuilder"
  | "scheduleManager"
  | "debugPanel"
  | "analyticsDashboard"
  | "skill-editor"
  | "skill-center"
  | "skillAnalysis" // 追加
  | "skillCreate"; // 追加
```

確認ポイント:

- 追加後の合計 member 数が 17 であること（TC-VT-04 の期待値）
- 既存 member の並び順が変わらないこと（TC-VT-03 で保護）

### Task 2: navigation/skillLifecycleJourney.ts — onAction フィールド追加

`apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts` を Read して `SkillLifecycleJobGuide` インターフェースを確認した後、`onAction` フィールドを追加する。

**追加するコード（既存フィールドの末尾に追記）:**

```typescript
export interface SkillLifecycleJobGuide {
  id: string;
  title: string;
  entryLabel: string;
  handoffLabel: string;
  summary: string;
  completion: string;
  onAction?: () => void; // 追加: CTA コールバック（省略可能）
}
```

確認ポイント:

- `SKILL_LIFECYCLE_JOB_GUIDES` 定数（`as const`）は `onAction` を省略しているため変更不要（TC-SL-03 で保護）
- `normalizeSkillLifecycleView` の戻り値型は `Exclude<ViewType, "skill-center">` のため、ViewType 拡張後も自動的に新 member を含む（変更不要）

### Task 3: App.tsx — renderView() に 2 case 追加

`apps/desktop/src/renderer/App.tsx` を Read して `renderView()` 関数（L269〜316）を確認した後、`case "skill-editor"` の直後に以下の 2 case を追加する。

**追加するコード:**

```typescript
case "skillAnalysis":
  return (
    <SkillAnalysisView
      skillName={currentSkillName ?? "demo-skill"}
      onClose={() => {
        setCurrentView("skillCenter");
        setCurrentSkillName(null);
      }}
    />
  );
case "skillCreate":
  return (
    <SkillCreateWizard
      onClose={() => setCurrentView("skillCenter")}
    />
  );
```

確認ポイント:

- `SkillAnalysisView` と `SkillCreateWizard` は L41 に既に import 済みのため追加不要:
  ```typescript
  import { SkillAnalysisView, SkillCreateWizard } from "./components/skill";
  ```
- `currentSkillName` (L78) と `setCurrentSkillName` (L79) は既存の useAppStore セレクタで取得済みのため追加不要
- `case "skillAnalysis"` の `onClose` では `setCurrentSkillName(null)` でスキル名をリセットすること（TC-RV-01b で検証）
- `case "skillCreate"` の `onClose` では `setCurrentSkillName` のリセットは不要

### Task 4: 型チェックとテスト実行

```bash
# TypeScript 型チェック（AC-5）
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260317-005902-wt-3
pnpm --filter @repo/desktop typecheck 2>&1 | tail -20

# Phase 4 テストが Green になることを確認（AC-6）
cd apps/desktop && pnpm vitest run \
  src/renderer/store/types.test.ts \
  src/renderer/__tests__/App.renderView.viewtype.test.tsx \
  src/renderer/navigation/skillLifecycleJourney.test.ts
```

エラーがある場合は Task 1〜3 に戻って修正する。TypeScript エラーを `@ts-ignore` で回避しない（[02-code-quality.md](../../../../../.claude/rules/02-code-quality.md) 参照）。

## 統合テスト連携

Phase 4 テストが全て Green になったことを確認後、既存テストへの影響がないことを確認する:

```bash
cd apps/desktop && pnpm vitest run src/renderer/store/ src/renderer/__tests__/ src/renderer/navigation/
```

期待結果:

- TC-VT-01〜04: 全 PASS（ViewType 拡張確認）
- TC-RV-01, TC-RV-01b, TC-RV-02, TC-RV-03: 全 PASS（renderView case 確認）
- TC-SL-01〜05: 全 PASS（onAction 型互換性確認）
- 既存テスト: 全 PASS（破壊的変更なし）

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

## 成果物

| 成果物                  | パス                                                            | 変更種別 |
| ----------------------- | --------------------------------------------------------------- | -------- |
| ViewType 拡張           | `apps/desktop/src/renderer/store/types.ts`                      | 追記     |
| onAction フィールド追加 | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts` | 追記     |
| renderView 2 case 追加  | `apps/desktop/src/renderer/App.tsx`                             | 追記     |

## 完了条件

- [ ] `ViewType` に `"skillAnalysis"` が追加されている（AC-1）
- [ ] `ViewType` に `"skillCreate"` が追加されている（AC-1）
- [ ] `SkillLifecycleJobGuide` に `onAction?: () => void` が追加されている（AC-4）
- [ ] `App.tsx` の `renderView()` に `case "skillAnalysis"` → `SkillAnalysisView` が追加されている（AC-2）
- [ ] `App.tsx` の `renderView()` に `case "skillCreate"` → `SkillCreateWizard` が追加されている（AC-2）
- [ ] 既存 ViewType member が全て維持されている（AC-3）
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなく完了する（AC-5）
- [ ] Phase 4 テスト TC-VT-01〜04 / TC-RV-01〜03 / TC-SL-01〜05 が全 PASS（AC-6）
- [ ] 既存テストに新たな失敗が発生していない（AC-6）
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-lifecycle-routing --phase 5
```

## 次 Phase

Phase 6: テスト拡充（`phase-6-test-expansion.md`）
