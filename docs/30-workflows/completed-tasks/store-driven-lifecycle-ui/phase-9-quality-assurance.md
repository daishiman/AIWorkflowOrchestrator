# Phase 9: 品質検証

## メタ情報

| 項目     | 値                        |
| -------- | ------------------------- |
| Phase    | 9                         |
| タスクID | TASK-10A-F                |
| 機能名   | store-driven-lifecycle-ui |
| 作成日   | 2026-03-08                |

## 目的

Lint・TypeScript 型チェック・全テスト実行を行い、Store 駆動統合の実装がプロジェクトの品質基準を満たしていることを検証する。直接 IPC 呼び出しが完全に排除されていることを grep で最終確認する。

## 実行タスク

- ESLint 実行: 変更ファイルに対する Lint 検証
- TypeScript 型チェック: プロジェクト全体の型整合性確認
- 全テスト実行: skill コンポーネント関連テストおよびプロジェクト全体のテスト実行
- 直接 IPC 呼び出し残存の grep 最終検証
- P31/P48 再発防止の最終確認

## 参照資料

| 資料名               | パス                                  | 説明                |
| -------------------- | ------------------------------------- | ------------------- |
| コード品質ルール     | `.claude/rules/02-code-quality.md`    | Lint/型チェック基準 |
| Git/ツーリングルール | `.claude/rules/07-git-and-tooling.md` | コミット前チェック  |
| 既知の落とし穴       | `.claude/rules/06-known-pitfalls.md`  | P31/P48 対策        |

### システム仕様（aiworkflow-requirements）

| 資料名   | パス                                                                        | 使用目的       |
| -------- | --------------------------------------------------------------------------- | -------------- |
| 品質要件 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | カバレッジ基準 |

### 前提 Phase 成果物

| 資料名       | パス                                                                                    | 用途                       |
| ------------ | --------------------------------------------------------------------------------------- | -------------------------- |
| Phase 5 実装 | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-5-implementation.md` | 実装内容の確認             |
| Phase 8 記録 | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-8-refactoring.md`    | リファクタリング結果の確認 |

## 実行手順

### ステップ 1: ESLint 実行

```bash
cd apps/desktop && pnpm lint
```

**確認事項:**

| チェック項目                                    | 期待結果              |
| ----------------------------------------------- | --------------------- |
| SkillCreateWizard.tsx に Lint エラーがない      | エラー 0 件           |
| useSkillAnalysis.ts に Lint エラーがない        | エラー 0 件           |
| SkillManagementPanel.tsx に Lint エラーがない   | エラー 0 件           |
| SkillCreateWizard.test.tsx に Lint エラーがない | エラー 0 件           |
| SkillAnalysisView.test.tsx に Lint エラーがない | エラー 0 件           |
| 未使用 import が残っていない                    | `no-unused-vars` 0 件 |

### ステップ 2: TypeScript 型チェック

```bash
pnpm typecheck
```

**確認事項:**

| チェック項目                                          | 期待結果      |
| ----------------------------------------------------- | ------------- |
| 個別セレクタの戻り値型が正しい                        | 型エラー 0 件 |
| `as` キャスト除去後に型エラーが発生していない         | 型エラー 0 件 |
| `useShallow` 適用後のセレクタ型が正しい               | 型エラー 0 件 |
| Store action の引数型がコンポーネント側と一致している | 型エラー 0 件 |
| `any` 型が新規に導入されていない                      | `any` 0 件    |

### ステップ 3: 直接 IPC 呼び出し残存の最終検証

修正対象ファイル 5 件全てで `window.electronAPI` の実行コード呼び出しが 0 件であることを確認する。

```bash
grep -rn "window\.electronAPI" \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx \
  apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts \
  apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx \
  apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx \
  apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx
```

**結果判定:**

| 検出パターン                                                 | 判定 |
| ------------------------------------------------------------ | ---- |
| 実行コードとしての `window.electronAPI` 呼び出し             | NG   |
| コメント内の参照（`// TASK-10A-F: window.electronAPI ...`）  | OK   |
| テスト内のスパイ設定（直接呼び出しがないことを検証するため） | OK   |

NG の場合は Phase 5 に差し戻す。

### ステップ 4: P31/P48 再発防止の最終確認

#### P31 確認: 合成 Store Hook の直接使用がないこと

```bash
grep -rn "useAgentStore()" \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx \
  apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts \
  apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx
```

**期待結果:** 0 件

#### P48 確認: 派生セレクタに `useShallow` が適用されていること

```bash
grep -rn "\.filter\|\.map" \
  apps/desktop/src/renderer/store/index.ts | grep -i "skill\|analysis"
```

検出された各セレクタが `useShallow` でラップされていることを目視確認する。

#### non-null assertion 確認（P48 派生）

```bash
grep -n "!" \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx \
  apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts \
  apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx | grep -v "!=\|!=="
```

non-null assertion（`!.` / `!` 単独）が残存している場合は `?.` または `Array.isArray()` に置換する。

### ステップ 5: skill コンポーネント関連テスト実行

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/
```

**確認事項:**

| チェック項目                                           | 期待結果 |
| ------------------------------------------------------ | -------- |
| SkillCreateWizard.test.tsx が全 PASS                   | 全 PASS  |
| SkillAnalysisView.test.tsx が全 PASS                   | 全 PASS  |
| SkillCreateWizard.store-integration.test.tsx が全 PASS | 全 PASS  |
| SkillAnalysisView.store-integration.test.tsx が全 PASS | 全 PASS  |
| テスト実行時間が 60 秒以内（無限ループの兆候なし）     | < 60 秒  |

### ステップ 6: agentSlice 関連テスト実行

```bash
cd apps/desktop && pnpm vitest run src/renderer/store/slices/__tests__/agentSlice
```

**確認事項:**

| チェック項目               | 期待結果  |
| -------------------------- | --------- |
| agentSlice 全テストが PASS | 全 PASS   |
| P31 回帰テストが PASS      | 全 PASS   |
| セレクタテストが PASS      | 全 PASS   |
| 既存テストに回帰がない     | 回帰 0 件 |

### ステップ 7: プロジェクト全体テスト実行

```bash
cd apps/desktop && pnpm vitest run
```

**確認事項:**

| チェック項目                        | 期待結果  |
| ----------------------------------- | --------- |
| 全テストが PASS                     | 全 PASS   |
| 他の Slice/コンポーネントに回帰なし | 回帰 0 件 |

## 統合テスト連携（Phase 1-11 は必須）

- Store 統合テスト（`*.store-integration.test.tsx`）で `window.electronAPI` スパイの呼び出し回数が 0 であることを確認
- agentSlice の全テストファイル（boundary/combination/edge-cases/error-cases/extension/import-lifecycle/p31-regression/selectors）が実行対象に含まれることを確認
- UI コンポーネントテスト（SkillCreateWizard / SkillAnalysisView）も実行対象に含まれることを確認

## 多角的チェック観点

| チェック観点   | 確認内容                                          |
| -------------- | ------------------------------------------------- |
| Lint 完全性    | 変更ファイル全件で ESLint エラー 0 件             |
| 型整合性       | `pnpm typecheck` エラー 0 件、`any` 新規導入 0 件 |
| IPC 排除完全性 | `window.electronAPI` 実行コード呼び出し 0 件      |
| P31 非抵触     | 合成 Store Hook の直接使用 0 件                   |
| P48 非抵触     | 派生セレクタに `useShallow` 適用済み              |
| テスト網羅性   | Phase 4-6 の全テストが PASS                       |
| 回帰安全性     | プロジェクト全体テストで回帰 0 件                 |

## 成果物

| 成果物       | パス                                                                                       | 説明           |
| ------------ | ------------------------------------------------------------------------------------------ | -------------- |
| 品質検証記録 | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-9-quality-assurance.md` | 本ドキュメント |

## 完了条件

- [ ] ESLint が変更ファイル全件でエラーなしで通過する
- [ ] TypeScript 型チェックがプロジェクト全体でエラーなしで通過する
- [ ] `window.electronAPI` の実行コード呼び出しが修正対象ファイル内で 0 件
- [ ] P31 再発防止: 合成 Store Hook の直接使用が 0 件
- [ ] P48 再発防止: 派生セレクタに `useShallow` が適用済み
- [ ] non-null assertion が理由コメントなしで残存していない
- [ ] skill コンポーネント関連テストが全 PASS
- [ ] agentSlice 関連テストが全 PASS
- [ ] プロジェクト全体テストが PASS（回帰なし）
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 10: 最終レビュー
