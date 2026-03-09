# Phase 8: リファクタリング - スキルライフサイクル統合テスト強化

## メタ情報

| 項目     | 値                          |
| -------- | --------------------------- |
| タスクID | TASK-10A-G                  |
| Phase    | 8 - リファクタリング        |
| 前Phase  | `phase-7-coverage-check.md` |
| 次Phase  | Phase 9（品質検証）         |

## 目的

増えたテストの可読性を上げる。ただし、新しい抽象化を作るより **既存テストパターンへ寄せる** ことを優先する。

## リファクタリング方針

- helper は file 内再利用が 2回以上ある場合のみ抽出する。
- build 関数や mock state は既存命名へ寄せる。
- `describe` / `it` 名は「条件 → 期待結果」に揃える。
- `fireEvent` / `beforeEach` / `vi.clearAllMocks()` の既存パターンを壊さない。

## チェック対象

| ファイル                                    | 見る点                                 |
| ------------------------------------------- | -------------------------------------- |
| `SkillManagementPanel.integration.test.tsx` | builder / currentStoreState 更新の重複 |
| `SkillAnalysisView.test.tsx`                | mock state と act の重複               |
| `useSkillAnalysis.test.ts`                  | hook setup の重複                      |
| `agentSlice.skill-lifecycle.test.ts`        | mockElectronAPI / store helper の重複  |

## 実行コマンド

```bash
cd apps/desktop && pnpm exec vitest run \
  src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx \
  src/renderer/components/skill/__tests__/useSkillAnalysis.test.ts \
  src/renderer/store/slices/__tests__/agentSlice.skill-lifecycle.test.ts
```

## 完了条件

- [x] 過剰な抽象化を入れていない
- [x] 既存テストパターンとの整合が取れている
- [x] リファクタリング後も対象 suite が通る

## テンプレート準拠追補

## 実行タスク

- T1: 可読性改善を既存 test idiom の範囲で行う
- T2: 過剰抽象化を抑止する
- T3: Phase 9 向けに安定した suite 構成へ整える

## 参照資料

| 参照資料       | パス                                                                              | 用途               |
| -------------- | --------------------------------------------------------------------------------- | ------------------ |
| 依存Phase 1    | `phase-1-requirements.md`                                                         | スコープ境界再確認 |
| 依存Phase 2    | `phase-2-design.md`                                                               | 設計境界再確認     |
| 依存Phase 5    | `phase-5-implementation.md`                                                       | 実装差分再確認     |
| テスト拡充     | `phase-6-test-expansion.md`                                                       | 対象ケース再確認   |
| coverage       | `phase-7-coverage-check.md`                                                       | 重点 suite 確認    |
| テストパターン | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | idiom 統一         |

## 実行手順

1. 重複 setup / builder / mock を洗う
2. 既存 naming / helper パターンへ揃える
3. 対象 suite を再実行して差分安定性を確認する

## 統合テスト連携

| 連携面  | 内容                                                                  |
| ------- | --------------------------------------------------------------------- |
| G2      | state / hook 系 suite の読みやすさを上げて Phase 9 再実行を安定化する |
| Phase 9 | quality gate で使う suite を壊さないよう最小変更に留める              |

## 多角的チェック観点

| 観点           | 適用 | 確認内容                                     |
| -------------- | ---- | -------------------------------------------- |
| 保守性         | ✅   | setup / mock / builder の重複削減            |
| テスト設計     | ✅   | helper 抽出が file 内再利用に見合うか        |
| 品質           | ✅   | リファクタ後も suite が通るか                |
| アーキテクチャ | △    | state 境界や direct IPC 不在を崩していないか |

## 成果物

| 成果物         | パス                     | 説明                       |
| -------------- | ------------------------ | -------------------------- |
| リファクタ仕様 | `phase-8-refactoring.md` | 可読性改善方針と再実行対象 |

## サブタスク管理

1. 重複箇所検出
2. 最小リファクタ
3. 再実行確認

## タスク100%実行確認

- [x] 過剰抽象化を避けた
- [x] 既存テストパターンへ揃えた
- [x] 再実行で安定性を確認した

## 次のPhase

Phase 9（品質検証）
