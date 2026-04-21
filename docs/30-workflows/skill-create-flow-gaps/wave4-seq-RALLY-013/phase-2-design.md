# Phase 2: 設計

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 2                            |
| タスクID   | TASK-RALLY-013               |
| 機能名     | Undo可能範囲の視覚的表現追加 |
| 前提Phase  | Phase 1                      |
| 後続Phase  | Phase 3                      |
| 作成日     | 2026-04-21                   |
| ステータス | pending                      |

## 目的

`undoableStepCount` の計算ロジックとインジケーターの JSX 変更を設計する。

## 問題と解決策

```
問題: canUndo=trueでもどこまで戻れるか視覚的に不明

解決: チャット履歴内でUndo可能な最古メッセージをハイライト、
      または戻れるステップ数をバッジ表示
      前提: RALLY-003でサーバー側Undoが確立されていること
```

## 変更箇所設計

**対象ファイル**: `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`

### 1. `undoableStepCount` の計算

```tsx
// Undo可能なステップ数: ユーザーが送信した回答の数
const undoableStepCount = interview.steps.filter(
  (step) => step.role === "user",
).length;
```

`useInterviewState` が `undoableStepCount` を直接提供している場合はそちらを使用する（Phase 1 調査で確定）。

### 2. Undoボタン周辺の JSX 変更

変更前:

```tsx
<button
  type="button"
  onClick={handleUndo}
  disabled={!interview.canUndo || isSubmitting}
  data-testid="interview-undo"
>
  ← 戻る
</button>
```

変更後:

```tsx
<div className="flex flex-col items-start gap-0.5">
  <button
    type="button"
    onClick={handleUndo}
    disabled={undoableStepCount === 0 || isSubmitting}
    className="rounded-md px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-30"
    data-testid="interview-undo"
  >
    ← 戻る
  </button>
  {undoableStepCount > 0 ? (
    <span
      className="px-3 text-[10px] text-[var(--text-tertiary)]"
      data-testid="interview-undo-hint"
    >
      {undoableStepCount} ステップ前まで戻れます
    </span>
  ) : null}
</div>
```

### 3. `disabled` 条件の統一

`!interview.canUndo` から `undoableStepCount === 0` に統一する。P50チェックで `canUndo` と `undoableStepCount` が常に同値であることを確認してから切り替える。

## 参照資料

| 資料名             | パス                                         | 説明           |
| ------------------ | -------------------------------------------- | -------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物 |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`     | Phase 1 成果物 |
| Undoボタン実装調査 | `outputs/phase-1/undo-button-analysis.md`    | Phase 1 成果物 |

## 成果物

| 成果物               | パス                                    | 説明                           |
| -------------------- | --------------------------------------- | ------------------------------ |
| インジケーター設計書 | `outputs/phase-2/indicator-design.md`   | undoableStepCount計算とJSX設計 |
| 変更差分設計         | `outputs/phase-2/change-diff-design.md` | 変更前後のコード差分設計       |

## 完了条件

- [ ] `undoableStepCount` の計算方法が確定していること
- [ ] Undoボタン周辺の JSX 変更が設計されていること
- [ ] `data-testid="interview-undo-hint"` の命名が確定していること
- [ ] RALLY-012 の4分岐レンダリングとの整合が確認されていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skill-create-flow-gaps/p13-seq-RALLY-013
```

## 次のPhase

Phase 3: 設計レビューゲート
