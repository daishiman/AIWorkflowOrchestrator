# Phase 5: 実装

## メタ情報

| 項目      | 内容                  |
| --------- | --------------------- |
| Phase     | 5                     |
| 名称      | 実装（TDD Green）     |
| 前提Phase | Phase 4（テスト作成） |
| 次Phase   | Phase 6（テスト拡充） |
| 作成日    | 2026-04-03            |

## 目的

Phase 4 で作成した TDD Red テストを全て PASS させる実装を行う。Phase 2 の設計に基づき、VerifyResultDetailPanel / ImproveResultDetailPanel を実装し、SkillLifecyclePanel に統合する。

## 実行タスク

### Task 5-1: VerifyResultDetailPanel 実装

ファイル: `apps/desktop/src/renderer/components/skill/VerifyResultDetailPanel.tsx`（新規作成）

実装内容:

1. `VerifyResultDetailPanelProps` を定義
2. Loading skeleton、ErrorBanner、null ガードの3パターンを実装
3. Header（"Verify 結果" ラベル + StatusBadge label override）
4. Message セクション
5. NextAction バッジ（TagList 利用）
6. CheckGroupByLayer 内部コンポーネント — checks を layer でグループ化
7. CheckItem 内部コンポーネント — severity icon + summary + evidenceSummary
8. SeverityIcon 内部コンポーネント — info(ℹ) / warning(⚠) / error(✗)
9. Evidence count バッジ
10. Route metadata 表示
11. Governance notes 折りたたみ
12. Reverify ボタン（reverifyEligible 条件）
13. DetailFooter（Plan ID）

### Task 5-2: ImproveResultDetailPanel 実装

ファイル: `apps/desktop/src/renderer/components/skill/ImproveResultDetailPanel.tsx`（新規作成）

実装内容:

1. `ImproveResultDetailPanelProps` を定義
2. Loading skeleton、ErrorBanner、null ガードの3パターンを実装
3. Header（"Improve 結果" ラベル + 提案数バッジ）
4. SuggestionCard 内部コンポーネント — section/before/after/reason カード
5. Before/After の diff 風カラーリング（CSS 変数ベース: TECH-M-01 対応）
6. Revised Spec 折りたたみセクション
7. DetailFooter（Improve ID）

### Task 5-3: SkillLifecyclePanel 統合

ファイル: `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`（修正）

変更内容:

1. `import { VerifyResultDetailPanel }` 追加
2. `import { ImproveResultDetailPanel }` 追加
3. `verifyDetail` state 追加（verify detail snapshot を保持）
4. `runtimeImproveResult` state 追加（既存 runtime improve flow と共存）
5. verify フェーズの条件レンダリング追加
6. improve フェーズの条件レンダリング追加

### ファイル変更一覧

| ファイル                       | 操作     | 変更内容                                                                  |
| ------------------------------ | -------- | ------------------------------------------------------------------------- |
| `VerifyResultDetailPanel.tsx`  | 新規作成 | Verify 結果表示コンポーネント                                             |
| `ImproveResultDetailPanel.tsx` | 新規作成 | Improve 結果表示コンポーネント                                            |
| `result-panel-parts.tsx`       | 修正     | StatusBadge に label override を追加                                      |
| `SkillLifecyclePanel.tsx`      | 修正     | import 追加 + verifyDetail/runtimeImproveResult state 追加 + 条件分岐追加 |

## 参照資料

| 参照資料         | パス                                                                      |
| ---------------- | ------------------------------------------------------------------------- |
| Phase 2 設計     | `phase-2-design.md`                                                       |
| Phase 4 テスト   | `phase-4-test-creation.md`                                                |
| 既存パターン参考 | `apps/desktop/src/renderer/components/skill/PlanResultDetailPanel.tsx`    |
| 既存パターン参考 | `apps/desktop/src/renderer/components/skill/ExecuteResultDetailPanel.tsx` |
| 共有部品         | `apps/desktop/src/renderer/components/skill/result-panel-parts.tsx`       |
| 型定義           | `packages/shared/src/types/skillCreator.ts`                               |

## 成果物

| 成果物                   | 配置先                                                                    |
| ------------------------ | ------------------------------------------------------------------------- |
| VerifyResultDetailPanel  | `apps/desktop/src/renderer/components/skill/VerifyResultDetailPanel.tsx`  |
| ImproveResultDetailPanel | `apps/desktop/src/renderer/components/skill/ImproveResultDetailPanel.tsx` |
| SkillLifecyclePanel 修正 | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`      |

## 完了条件

- [ ] VerifyResultDetailPanel が実装され、TC-V-01〜TC-V-19 が全て PASS する
- [ ] ImproveResultDetailPanel が実装され、TC-I-01〜TC-I-12 が全て PASS する
- [ ] SkillLifecyclePanel に verify / improve 条件分岐が統合されている
- [ ] result-panel-parts.tsx の共有部品（StatusBadge label override 含む）が再利用されている
- [ ] CSS カラーリングが CSS 変数ベースで統一されている（TECH-M-01 解決）
- [ ] TypeScript 型チェック・ESLint がエラー 0件である
- [ ] 既存テストが全て PASS する

## タスク100%実行確認【必須】

- [ ] Task 5-1: VerifyResultDetailPanel 実装
- [ ] Task 5-2: ImproveResultDetailPanel 実装
- [ ] Task 5-3: SkillLifecyclePanel 統合

## 次Phase

Phase 6（テスト拡充）へ進む。fail path、回帰ガード、補助テストを追加する。
