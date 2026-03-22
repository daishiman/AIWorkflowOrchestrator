# Phase 8: リファクタリング

## メタ情報

| 項目     | 値                               |
| -------- | -------------------------------- |
| Phase    | 8                                |
| タスクID | TASK-SC-06-UI-RUNTIME-CONNECTION |
| 作成日   | 2026-03-22                       |

## 目的

UI 状態管理を簡素化し、LLM 生成フローと従来フローの条件分岐コードを整理する。コード品質を改善しつつ、テストが Green のまま保つ。

## 実行タスク

1. UI 状態管理の簡素化
   - SkillCreateWizard 内のローカル `useState` と Zustand グローバル状態の整理
   - LLM 生成フロー専用のカスタム Hook 抽出を検討
     - `useSkillLLMGeneration()` として plan/execute フローをカプセル化
2. 条件分岐の整理
   - `isLLMMode: boolean` の判定ロジックを明確化
   - DescribeStep のレンダリング分岐をシンプルに
3. TerminalHandoff 表示コンポーネントの独立化
   - 再利用可能な `<TerminalHandoffOverlay>` コンポーネントとして切り出し
4. Zustand Slice の整理
   - `skillCreationSlice` が `agentSlice` と責務が重複していないか確認
   - 不要な状態の削除
5. リファクタリング後に全テストが Green であることを確認

## 参照資料

- Phase 5 実装コード
- `apps/desktop/src/renderer/components/skill/`
- `apps/desktop/src/renderer/store/`
- `.claude/rules/02-code-quality.md`（SRP 原則、コンポーネント Atomic Design）
- `.claude/rules/03-state-management.md`（Zustand 設計原則）
- `.claude/rules/01-architecture.md`（Atomic Design: atoms→molecules→organisms）

## 成果物

- リファクタリング済み `SkillCreateWizard.tsx`
- リファクタリング済み `DescribeStep.tsx`
- 新規 `TerminalHandoffOverlay.tsx`（必要に応じて）
- 新規 `useSkillLLMGeneration.ts`（必要に応じて）

## 完了条件

- [ ] UI 状態管理を簡素化した（ローカル vs グローバル状態の整理）
- [ ] LLM/テンプレート条件分岐を明確化した
- [ ] TerminalHandoff 表示コンポーネントを適切に配置した
- [ ] Zustand Slice の責務重複を解消した（または確認した）
- [ ] 未使用 import を除去した
- [ ] リファクタリング後に全テストが Green のままであることを確認した

## 次のPhase

Phase 9: 品質検証
