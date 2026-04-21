# Phase 1: 要件定義

## メタ情報

| 項目       | 値                             |
| ---------- | ------------------------------ |
| Phase      | 1                              |
| 機能名     | TASK-RALLY-006                 |
| タスク名   | L675-708 useEffect依存配列修正 |
| 前提Phase  | -                              |
| 後続Phase  | Phase 2                        |
| 作成日     | 2026-04-21                     |
| ステータス | pending                        |

## 目的

`SkillLifecyclePanel.tsx` の L675-708 にある `useEffect` の依存配列に `workflowSnapshot?.planId` が含まれており、IPC pull の結果として `workflowSnapshot` が更新されると再度エフェクトが実行されるという循環リスクを排除するための要件を確定する。

RALLY-005 で workflowSnapshot の更新経路（invoke 正規・push 補完）が確立されたことを前提とし、本タスクでは依存配列から `workflowSnapshot?.planId` を除去し `activePlanResult?.planId` または `storePlanId` のみをトリガーとすることで IPC pull の再実行ループリスクを排除する。

## SubAgentチーム編成

| SubAgent   | 担当                                                                                   | 実行形態                  |
| ---------- | -------------------------------------------------------------------------------------- | ------------------------- |
| SubAgent-A | L675-708の useEffect 全体・依存配列・現状実装の調査                                    | **並列**                  |
| SubAgent-B | `storePlanId`・`activePlanResult?.planId`・`workflowSnapshot?.planId` の使われ方の確認 | **並列**                  |
| SubAgent-C | ESLint exhaustive-deps 警告の現状確認                                                  | **並列**                  |
| SubAgent-D | A・B・C 結果統合・受け入れ基準策定                                                     | **直列**（A・B・C完了後） |

## P50チェック（必須）

```bash
# L675-708 の useEffect 全体を確認
sed -n '670,715p' \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx

# 依存配列の全項目確認
grep -n "workflowSnapshot\|storePlanId\|activePlanResult" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx | head -30

# ESLint 現状確認
pnpm lint apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx 2>&1 | grep -A2 "exhaustive-deps"
```

## 実行タスク

1. SubAgent-A: `SkillLifecyclePanel.tsx` L675-708 を読み込み、useEffect のボディ全体・依存配列の全項目を特定する
2. SubAgent-B: `storePlanId`・`activePlanResult?.planId`・`workflowSnapshot?.planId` それぞれの定義元と更新タイミングを確認する
3. SubAgent-C: `pnpm lint` を実行し exhaustive-deps 警告の有無と内容を確認する
4. SubAgent-D: A・B・C 結果を統合し、受け入れ基準 AC-1〜AC-6 を策定する

## 受け入れ基準

- AC-1: L675-708 の useEffect 依存配列から `workflowSnapshot?.planId` が除去されていること
- AC-2: エフェクトのトリガーが `activePlanResult?.planId` または `storePlanId` の変化のみとなること
- AC-3: `react-hooks/exhaustive-deps` ESLint ルールが警告を出さないこと
- AC-4: planId の値がエフェクト内で正しく参照されていること（ref または直接参照）
- AC-5: `pnpm typecheck` がエラーなしで通過すること
- AC-6: `pnpm lint` がエラーなしで通過すること

## 完了条件

- [ ] L675-708 の useEffect ボディと依存配列が全件特定されていること
- [ ] `storePlanId`・`activePlanResult?.planId`・`workflowSnapshot?.planId` の更新タイミングが確認されていること
- [ ] ESLint の exhaustive-deps 警告の現状が把握されていること
- [ ] 受け入れ基準 AC-1〜AC-6 が策定されていること
- [ ] P50チェックの bash コマンドが全件実行済みであること

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 2: 設計
