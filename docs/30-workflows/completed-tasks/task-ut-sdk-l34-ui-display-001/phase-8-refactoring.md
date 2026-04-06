# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 8                              |
| 機能名 | task-ut-sdk-l34-ui-display-001 |
| 作成日 | 2026-04-03                     |

## 目的

動作を変えずに実装コードの品質を改善する。重複排除・命名改善・構造整理を行う。

## 実行タスク

- コードスメル検出: 重複コード・長すぎる関数・不明瞭な変数名の検出
- 定数整理: `verifyCheckSeverityStyles`と`verifyCheckSeverityIcon`の配置統一
- コンポーネント分離判断の実行: 100行超の場合 `VerifyLayerGroup.tsx` へ分離
- リファクタリング記録: Before/After/理由をテーブル形式で記録

## 参照資料

| 資料名             | パス                                                                 | 説明                 |
| ------------------ | -------------------------------------------------------------------- | -------------------- |
| Phase 1成果物      | `outputs/phase-1/requirements.md`                                    | 受け入れ条件の原点   |
| Phase 2成果物      | `outputs/phase-2/design.md`                                          | 設計前提             |
| Phase 5成果物      | `outputs/phase-5/implementation-summary.md`                          | 実装内容・行数確認   |
| Phase 7成果物      | `outputs/phase-7/coverage-report.md`                                 | カバレッジ状況       |
| Phase 6成果物      | `outputs/phase-6/test-expansion-report.md`                           | 追加テストの前提     |
| 実装コンポーネント | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | リファクタリング対象 |

## 実行手順

### Step 1: コードスメル検出

```bash
# 追加した実装の行数確認
wc -l apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx

# Layer別グルーピング実装部分の重複確認
grep -n "layer1\|layer2\|layer3\|layer4" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx | wc -l
```

### Step 2: リファクタリング実施とBefore/After記録

実施したリファクタリングを以下のテーブル形式で記録する：

| 対象                             | Before                        | After                            | 理由                                  |
| -------------------------------- | ----------------------------- | -------------------------------- | ------------------------------------- |
| Layer別表示部分（例）            | インライン集計ロジック        | `useMemo`での事前計算            | 可読性・再レンダリング最適化          |
| VerifyLayerGroup分離（条件付き） | SkillLifecyclePanel内ローカル | VerifyLayerGroup.tsx             | 100行超の場合の責務分離               |
| 定数配置                         | コンポーネント内部            | ファイル上部（既存定数と同位置） | `verifyCheckSeverityStyles`との一貫性 |

### Step 3: テスト継続Green確認

```bash
# リファクタリング後のテスト実行
pnpm --filter @repo/desktop test -- --run 2>&1 | tail -20

# TypeScript型チェック
pnpm --filter @repo/desktop typecheck

# ESLint
pnpm --filter @repo/desktop lint
```

**期待結果**: 全テストがGreenのまま維持されること。

## 統合テスト連携【必須】

```bash
# リファクタリング後のテスト実行確認
pnpm --filter @repo/desktop test -- --run
pnpm --filter @repo/desktop typecheck
```

## 成果物

| 成果物                         | パス                                                                 | 説明                          |
| ------------------------------ | -------------------------------------------------------------------- | ----------------------------- |
| リファクタリング結果           | `outputs/phase-8/refactoring-report.md`                              | Before/After/理由テーブル形式 |
| 更新済みコンポーネント         | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | リファクタリング後            |
| 分離コンポーネント（条件付き） | `apps/desktop/src/renderer/components/skill/VerifyLayerGroup.tsx`    | 100行超の場合のみ             |

## 完了条件

- [ ] コードスメル検出・対処が完了している
- [ ] リファクタリング内容がBefore/After/理由テーブルで記録されている
- [ ] コンポーネント分離判断が実施されている
- [ ] リファクタリング後も全テストがGreenである
- [ ] TypeScript・ESLintエラーがない
- [ ] **本Phase内の全タスクを100%実行完了**

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-ut-sdk-l34-ui-display-001 --phase 8
```

## 次のPhase

Phase 9: 品質保証
