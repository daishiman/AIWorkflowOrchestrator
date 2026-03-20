# Phase 6: テスト拡充

## メタ情報

| 項目     | 内容                                 |
| -------- | ------------------------------------ |
| タスクID | TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001 |
| フェーズ | Phase 6                              |
| 機能名   | agentview-improve-route              |
| 作成日   | 2026-03-17                           |
| 依存     | Phase 5 成果物（outputs/phase-5/）   |

## 目的

Phase 5 実装後のカバレッジ不足箇所を特定し、境界値・異常系テストを追加してカバレッジ基準を充足させる。

## 実行タスク

- Task 1: Phase 5 実装に対する coverage gap を取得する
- Task 2: CTA と戻り導線の境界値テストを追加する
- Task 3: アニメーションと UI 出現条件を追加検証する
- Task 4: P31 対策と selector 安定性を追加検証する
- Task 5: handoff 異常系を追加検証する

### Task 1: カバレッジレポート取得

- [ ] `pnpm --filter @repo/desktop exec vitest run --coverage` を実行
- [ ] Line / Branch / Function の各カバレッジ値を記録
- [ ] カバレッジ不足箇所をリストアップする

### Task 2: 境界値テスト追加

#### AgentView — CTA バナー表示条件

- [ ] `skillExecutionStatus="completed"` かつ `selectedSkillName` が非空文字列 -> バナー表示
- [ ] `isExecuting=true` かつ `selectedSkillName` が非空文字列 -> バナー非表示
- [ ] `skillExecutionStatus!="completed"` -> バナー非表示
- [ ] `selectedSkillName=null` / `undefined` / `""` / `"   "` -> バナー非表示

#### SkillAnalysisView — ナビゲーションコールバック

- [ ] `onNavigateBack` が未定義 -> 戻るリンクが描画されない
- [ ] `onNavigateToAgent` が未定義 -> 再実行ボタンが描画されない
- [ ] `onNavigateBack` / `onNavigateToAgent` 呼び出しがそれぞれ 1 回だけ行われる

### Task 3: アニメーションテスト追加

- [ ] `canOfferAnalysis` が `false -> true` に変化したとき、バナーが正しく現れること
- [ ] happy-dom 環境制約を考慮し `fireEvent` を使用する

### Task 4: P31 対策テスト追加

- [ ] 個別セレクタ（`useSelectedSkillName`, `useSkillExecutionStatus`, `useSetCurrentSkillName` 等）が useEffect 依存配列に含まれても無限ループしないことを検証
- [ ] `renderHook` でタイムアウトが発生しないことを確認する

### Task 5: エラー境界テスト

- [ ] `onNavigateToAgent` が例外をスローした場合の UI フォールバック挙動を検証
- [ ] `selectedSkillName` に特殊文字が含まれる場合でも `currentSkillName` handoff が安全に扱われることを検証

## 参照資料

| 参照資料              | パス                                                               | 内容                                         |
| --------------------- | ------------------------------------------------------------------ | -------------------------------------------- |
| Phase 5（実装）       | `phase-5-implementation.md`                                        | Green 化した契約と変更対象を確認する         |
| Phase 5 実装サマリー  | `outputs/phase-5/implementation-summary.md`                        | 追加した導線と state 取扱いを確認する        |
| Phase 4（テスト作成） | `phase-4-test-creation.md`                                         | Red として固定したケースを回帰対象へ展開する |
| AgentView             | `apps/desktop/src/renderer/views/AgentView/index.tsx`              | CTA の境界条件を確認する                     |
| SkillAnalysisView     | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx` | 戻り導線の表示条件を確認する                 |
| App.tsx               | `apps/desktop/src/renderer/App.tsx`                                | `viewHistory` ベースの注入契約を確認する     |
| known-pitfalls        | `.claude/rules/06-known-pitfalls.md`                               | P31 / P39 / P48 を確認する                   |

## 統合テスト連携

- Phase 5 で Green 化した CTA / handoff / 戻り導線の契約に対し、境界値と異常系を追加する
- `viewHistory` ベースの戻り導線と既存 `onClose` close 契約が両立することを追跡する
- 追加テストで検出した欠陥は Phase 5 へ戻す条件を明記する

## 成果物

```
outputs/phase-6/
  coverage-report-before.txt
  coverage-report-after.txt
  test-additions.md
```

## 完了条件

- [ ] 境界値テスト（`selectedSkillName=null/undefined/""/"   "` と実行状態分岐）が全 PASS
- [ ] アニメーションテストが全 PASS
- [ ] P31/P48 無限ループテストが全 PASS
- [ ] カバレッジ数値が Phase 7 基準に近づいている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

→ Phase 7: カバレッジ確認
