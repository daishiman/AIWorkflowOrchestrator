# Phase 5: 実装

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 5                                                          |
| 機能名     | UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001          |
| タスク名   | SkillLifecyclePanel.tsx 遷移ボタン化（テキストエリア削除） |
| 前提Phase  | Phase 4                                                    |
| 後続Phase  | Phase 6                                                    |
| 作成日     | 2026-04-08                                                 |
| ステータス | pending                                                    |

---

## 目的

Phase 4 で作成した Red テストを Green にする実装を行う。  
`SkillLifecyclePanel.tsx` からテキストエリアを削除し、ウィザード遷移ボタンを追加する。

---

## 実行タスク

- **テキストエリア削除**: `skill-lifecycle-request-input` / `skill-lifecycle-execution-input` の textarea 要素を削除
- **state 削除**: `request` / `executionPrompt` および関連ハンドラを削除
- **ウィザードボタン追加**: `data-testid="skill-lifecycle-open-wizard-button"` ボタンを追加
- **レイアウト調整**: 削除後のレイアウトを整える
- **テスト Green 確認**: 実装後に全テストが Green であることを確認

---

## 参照資料

| 資料名             | パス                                                                 | 用途           |
| ------------------ | -------------------------------------------------------------------- | -------------- |
| 設計書             | `outputs/phase-2/design-document.md`                                 | 実装の根拠     |
| テスト仕様書       | `outputs/phase-4/test-specification.md`                              | 実装対象の仕様 |
| 対象コンポーネント | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | 変更対象       |
| UI レイアウト設計  | `outputs/phase-2/ui-layout-design.md`                                | レイアウト方針 |

---

## 実行手順

### ステップ 1: 実装前の baseline 確認

```bash
# 実装前に関連テストが Red であることを確認
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx

# 変更対象ファイルの現状確認
git diff --name-only HEAD -- 'apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx'
```

### ステップ 2: テキストエリアの削除

`SkillLifecyclePanel.tsx` から以下を削除する:

1. `data-testid="skill-lifecycle-request-input"` の textarea 要素（JSX）
2. `data-testid="skill-lifecycle-execution-input"` の textarea 要素（JSX）
3. `request` state とその `onChange` ハンドラ
4. `executionPrompt` state とその `onChange` ハンドラ
5. `approvedSkillSpec` state（Phase 2 の依存分析に従って判断）

### ステップ 3: ウィザードボタンの追加

設計書に従いウィザード遷移ボタンを追加する:

```tsx
<button
  data-testid="skill-lifecycle-open-wizard-button"
  onClick={onOpenWizard}
  className="..."
>
  スキルを作成する
</button>
```

`onOpenWizard` prop を追加し、コンポーネントの props 定義を更新する。

### ステップ 4: レイアウト調整

- 削除した要素が占めていたスペースを整理する
- Tailwind CSS で現行デザインと整合したスタイリングを適用する

### ステップ 5: Green 確認

```bash
# 実装後に全テストが Green であることを確認
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/

# TypeScript 型チェック
pnpm --filter @repo/desktop typecheck
```

---

## canUseTool 適用範囲（該当なし）

本タスクは UI コンポーネントのリファクタリングであり、SDK callback（`canUseTool`）は適用されない。

---

## 統合テスト連携

- 実装前に変更対象ファイルの既存テストが全て GREEN であることを確認（baseline 確認）
- 新規実装後に既存テストが回帰していないことを確認
- 6 本のテストファイルが全て PASS することを確認

---

## 成果物

| 成果物           | パス                                        | 説明                         |
| ---------------- | ------------------------------------------- | ---------------------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 実装内容と変更箇所のサマリー |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | 変更したファイルの一覧       |
| Green テスト結果 | `outputs/phase-5/green-test-result.md`      | 実装後の全テスト PASS 確認   |

---

## 完了条件

- [ ] `skill-lifecycle-request-input` textarea が削除された
- [ ] `skill-lifecycle-execution-input` textarea が削除された
- [ ] `data-testid="skill-lifecycle-open-wizard-button"` ボタンが追加された
- [ ] 削除した state・ハンドラがコード上に残っていない
- [ ] 6 本のテストファイルが全て Green になった
- [ ] TypeScript 型チェックが通過した
- [ ] 本 Phase 内の全タスクを 100% 実行完了

---

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] Green テスト結果を記録した
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001 --phase 5
```

---

## 次のPhase

Phase 6: テスト拡充
