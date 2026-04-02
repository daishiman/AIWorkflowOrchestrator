# Phase 7: カバレッジレポート

## 実行コマンド

```bash
vitest run \
  --coverage \
  --coverage.include="src/renderer/components/skill/SkillLifecyclePanel.tsx" \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel.error-persistence.test.tsx
```

## 全体カバレッジ（ファイル全体）

| 指標       | 計測値 | 備考                                                |
| ---------- | ------ | --------------------------------------------------- |
| Statements | 31.72% | コンポーネント全体は多数の関数・ブランチを持つ      |
| Branches   | 16.86% | ファイル全体の分岐数が多いため低い値                |
| Functions  | 8.57%  | テストは onWorkflowStateChanged のみ対象            |
| Lines      | 31.72% | 1,999 行のうち対象コールバックは 537〜545 行の 8 行 |

## 対象コールバックのブランチカバレッジ

`onWorkflowStateChanged` コールバック（SkillLifecyclePanel.tsx:537〜545）のブランチは以下の通り全て網羅済み:

| ブランチ                                        | テスト            | 状態 |
| ----------------------------------------------- | ----------------- | ---- |
| `snapshot.currentPhase !== 'handoff'` → `true`  | TC-EP-02/03       | ✅   |
| `snapshot.currentPhase !== 'handoff'` → `false` | TC-EP-01/04       | ✅   |
| `snapshot.handoffBundle` → truthy               | TC-EP-04          | ✅   |
| `snapshot.handoffBundle` → falsy                | TC-EP-01/02/03/05 | ✅   |

## 閾値エラーについて

全体カバレッジの閾値 (80%) を下回るエラーが v8 カバレッジで出力されているが、これは:

- `SkillLifecyclePanel.tsx` が 1,999 行の大きなコンポーネントであり、今回のテストは `onWorkflowStateChanged` コールバック部分のみを対象としているため
- Phase 7 の目的は「`onWorkflowStateChanged` コールバックの分岐カバレッジ確認」であり、ファイル全体のカバレッジ達成は対象外

**対象コールバック部分のブランチカバレッジ: 100%（4/4 ブランチ）**

## 完了確認

- [x] `onWorkflowStateChanged` コールバックの全ブランチがカバーされている
- [x] `if (snapshot.currentPhase !== 'handoff')` の `true`/`false` 両ブランチがカバーされている
- [x] `handoffBundle` の `truthy`/`falsy` 両パスがカバーされている
- [x] 全体閾値エラーはコンポーネントのスコープ外であり許容範囲と判断
