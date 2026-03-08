# Phase 8: リファクタリング

## メタ情報

| 項目     | 値                        |
| -------- | ------------------------- |
| Phase    | 8                         |
| タスクID | TASK-10A-F                |
| 機能名   | store-driven-lifecycle-ui |
| 作成日   | 2026-03-08                |

## 目的

Phase 5 で実装した Store 駆動パターン（`createSkill` / `analyzeSkill` / `applySkillImprovements` / `autoImproveSkill`）のコード品質を改善し、DRY 化・命名統一・型安全性強化を実施する。

## 実行タスク

- Store 駆動パターンの DRY 化: 共通 hook パターンの抽出要否を判断する
- 命名統一: `useCreateSkill` / `useAnalyzeSkill` / `useApplySkillImprovements` / `useAutoImproveSkill` の命名規約準拠を確認する
- 型安全性強化: `as` キャスト除去と `in` 演算子活用で P49 を回避する
- 未使用 import の削除: Lint 観点のノイズを除去する
- 個別 selector の整理: P31/P48 に抵触しない selector 構成へ揃える

## 参照資料

| 資料名           | パス                                   | 説明                 |
| ---------------- | -------------------------------------- | -------------------- |
| コード品質ルール | `.claude/rules/02-code-quality.md`     | 命名規約・型安全基準 |
| 状態管理ルール   | `.claude/rules/03-state-management.md` | Zustand 設計原則     |
| 既知の落とし穴   | `.claude/rules/06-known-pitfalls.md`   | P31/P48/P49 対策     |

### システム仕様（aiworkflow-requirements）

| 資料名       | パス                                                                                        | 使用目的                       |
| ------------ | ------------------------------------------------------------------------------------------- | ------------------------------ |
| 実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | forwardRef/memo/テスト設計基準 |
| 状態管理仕様 | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | action/selector 責務分離       |
| UI 設計原則  | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`              | a11y・操作一貫性               |

### 前提 Phase 成果物

| 資料名           | パス                                                                                    | 用途                     |
| ---------------- | --------------------------------------------------------------------------------------- | ------------------------ |
| Phase 1 要件定義 | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-1-requirements.md`   | FR/NFR要件の準拠確認     |
| Phase 2 設計     | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-2-design.md`         | 設計方針との整合性確認   |
| Phase 5 実装     | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                      | リファクタリング対象     |
| Phase 5 実装     | `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts`                  | リファクタリング対象     |
| Phase 5 実装     | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`                   | リファクタリング対象     |
| Phase 5 テスト   | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`       | テスト回帰確認           |
| Phase 5 テスト   | `apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx`       | テスト回帰確認           |
| Phase 6 テスト   | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-6-test-expansion.md` | テスト拡充結果の確認     |
| Phase 7 記録     | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-7-coverage-check.md` | カバレッジ基準充足を確認 |

## 実行手順

### ステップ 1: 直接 IPC 呼び出し残存チェック

修正対象ファイル内に `window.electronAPI` の直接呼び出しが残存していないことを確認する。

```bash
grep -rn "window\.electronAPI" \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx \
  apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts \
  apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx
```

**期待結果:** 0 件（コメント内の参照は許容するが、実行コードとしての呼び出しは 0 件）

実行コードとして残存している場合は Phase 5 に差し戻す。

### ステップ 2: 命名規約の確認と統一

以下の命名規約に準拠しているか確認する。

| 対象               | 期待される命名パターン      | 規約根拠                                      |
| ------------------ | --------------------------- | --------------------------------------------- |
| 作成アクション     | `useCreateSkill`            | ドメインサフィックス必須（arch-state v3.8.1） |
| 分析アクション     | `useAnalyzeSkill`           | ドメインサフィックス必須（arch-state v3.8.1） |
| 選択改善アクション | `useApplySkillImprovements` | action 名を機能に一致させる                   |
| 自動改善アクション | `useAutoImproveSkill`       | action 名を機能に一致させる                   |
| 分析中フラグ       | `useIsAnalyzingSkill`       | boolean は `is` プレフィックス + ドメイン     |
| 改善中フラグ       | `useIsImprovingSkill`       | boolean は `is` プレフィックス + ドメイン     |
| 現在の分析結果     | `useCurrentAnalysis`        | 状態取得セレクタ                              |

確認コマンド:

```bash
grep -rn "export const use" \
  apps/desktop/src/renderer/store/index.ts | grep -i "skill\|analysis\|improv"
```

命名が上記テーブルと異なる場合は統一する。変更後に全テストが PASS することを確認する。

### ステップ 3: 型安全性強化（P49 対策）

修正対象ファイル内の `as` キャスト使用箇所を検出する。

```bash
grep -n " as " \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx \
  apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts \
  apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx
```

各 `as` キャストに対して以下を判定する:

| 判定                               | 対応                                      |
| ---------------------------------- | ----------------------------------------- |
| `in` 演算子で実行時検証に置換可能  | `in` 演算子 + `typeof` チェックに置換する |
| 型ナロイングで自然に解消可能       | 型ナロイング（条件分岐）に置換する        |
| SDK/外部ライブラリ型との互換で必須 | コメントで理由を明記して残す              |

置換例（P49 準拠）:

```typescript
// 置換前
const isValid = (item: unknown): item is Target =>
  typeof (item as Record<string, unknown>).field === "string";

// 置換後
const isValid = (item: unknown): item is Target =>
  item != null &&
  typeof item === "object" &&
  "field" in item &&
  typeof item.field === "string";
```

### ステップ 4: 未使用 import の削除

```bash
cd apps/desktop && pnpm lint --rule 'no-unused-vars: error' -- \
  src/renderer/components/skill/SkillCreateWizard.tsx \
  src/renderer/components/skill/hooks/useSkillAnalysis.ts \
  src/renderer/components/skill/SkillManagementPanel.tsx
```

ESLint で検出された未使用 import を全て削除する。

### ステップ 5: DRY 化検討

以下のパターンが 3 箇所以上で重複している場合のみ、共通 hook への抽出を実施する。

| 重複候補パターン                         | 抽出先候補                     | 抽出条件         |
| ---------------------------------------- | ------------------------------ | ---------------- |
| Store action 呼び出し + loading 状態管理 | 既存の個別セレクタで十分       | 3 箇所以上で重複 |
| エラーハンドリング + ユーザー通知        | `useSkillActionFeedback` hook  | 3 箇所以上で重複 |
| 分析結果の型ガード                       | 型ガード関数をモジュール外出し | 2 箇所以上で重複 |

**抽出しない場合の判断基準:** 重複が 2 箇所以下の場合は「3 行の類似コードは早期抽象化より明示的」の原則に従い、抽出しない。

### ステップ 6: 個別 selector の P31/P48 準拠確認

全個別セレクタが以下のパターンに準拠しているか確認する。

| チェック項目                                       | 期待                                        |
| -------------------------------------------------- | ------------------------------------------- |
| アクション参照が個別セレクタ経由で取得されている   | `useCreateSkill()` 等を使用                 |
| `.filter()` / `.map()` で配列を返すセレクタ        | `useShallow` でラップされている（P48 対策） |
| `useEffect` 依存配列にアクション関数を含む場合     | 個別セレクタ経由で取得（P31 対策）          |
| 合成 Store Hook（`useXxxStore()`）を使用していない | 個別セレクタに置換済み                      |

確認コマンド:

```bash
grep -n "useAgentStore\b" \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx \
  apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts \
  apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx
```

**期待結果:** 0 件（合成 Hook の直接使用がないこと）

### ステップ 7: リファクタリング後のテスト実行

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/
```

全テストが PASS することを確認する。1 件でも失敗した場合はリファクタリング内容を見直す。

## 統合テスト連携（Phase 1-11 は必須）

- リファクタリング後に Phase 4-6 で作成した全テストが PASS することを確認
- Store 統合テスト（`SkillCreateWizard.store-integration.test.tsx` / `SkillAnalysisView.store-integration.test.tsx`）で `window.electronAPI` 直接呼び出しが 0 件であることを確認
- agentSlice 関連の既存テスト全件に回帰がないことを確認

## 多角的チェック観点

| チェック観点 | 確認内容                                                                   |
| ------------ | -------------------------------------------------------------------------- |
| DRY 原則     | 3 箇所以上の重複パターンが共通化されているか                               |
| 命名一貫性   | ドメインサフィックス必須ルールに準拠しているか                             |
| 型安全性     | `as` キャスト・`!`（non-null assertion）が理由コメントなしで残っていないか |
| P31 非抵触   | 合成 Store Hook の直接使用がないか                                         |
| P48 非抵触   | `.filter()` / `.map()` セレクタに `useShallow` が適用されているか          |
| P49 非抵触   | type predicate 内で `as` キャストが使用されていないか                      |

## 成果物

| 成果物               | パス                                                                                 | 説明           |
| -------------------- | ------------------------------------------------------------------------------------ | -------------- |
| リファクタリング記録 | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-8-refactoring.md` | 本ドキュメント |

## 完了条件

- [ ] 修正対象ファイル内の `window.electronAPI` 直接呼び出しが実行コードとして 0 件
- [ ] 個別セレクタの命名がドメインサフィックス必須ルールに準拠している
- [ ] `as` キャストが P49 準拠で `in` 演算子に置換されている（理由コメント付きの例外を除く）
- [ ] 未使用 import が 0 件
- [ ] P31/P48 準拠が全セレクタで確認済み
- [ ] リファクタリング後に全テストが PASS している
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 9: 品質検証
