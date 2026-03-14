# Phase 11 発見事項: TASK-SKILL-LIFECYCLE-04

## メタ情報

| 項目         | 内容                                            |
| ------------ | ----------------------------------------------- |
| 生成日       | 2026-03-14                                      |
| Phase        | 11                                              |
| タスクID     | TASK-SKILL-LIFECYCLE-04                         |
| 発見事項件数 | 2件（MINOR）                                    |
| 新規発見     | 0件（Phase 11 で新規の critical/high 発見なし） |

---

## Phase 10 MINOR 指摘の詳細（Phase 12 未タスク化対象）

Phase 10 最終レビューで判定された MINOR 2件を以下に詳述する。
Phase 12 Task 4 にて未タスク化する。

---

### FINAL-M-01: handleEvaluatePrompt が Store 経由なく window.electronAPI を直接呼び出し

| 項目         | 内容                                                                   |
| ------------ | ---------------------------------------------------------------------- |
| 指摘ID       | FINAL-M-01                                                             |
| 分類         | MINOR                                                                  |
| 優先度       | medium                                                                 |
| 発見Phase    | Phase 10 最終レビュー（SubAgent-C 仕様整合レビュー）                   |
| 対象ファイル | `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts` |

**問題の詳細**

`handleEvaluatePrompt` が `window.electronAPI.skill.evaluatePrompt()` を直接呼び出している。
本プロジェクトのアーキテクチャ原則（`01-architecture.md`）では Renderer 層から Preload API を呼び出す場合、
Store アクション経由が推奨パターンである（analyzeSkill 等のパターンと整合性が低い）。

**現状の実装パターン（useSkillAnalysis.ts）**

```typescript
// 現状: 直接呼び出し
const handleEvaluatePrompt = async (prompt: string) => {
  const result = await window.electronAPI.skill.evaluatePrompt(prompt);
  // ...
};
```

**推奨パターン（将来対応）**

```typescript
// 推奨: Store アクション経由
const evaluatePrompt = useEvaluatePromptAction(); // Store セレクタ
const handleEvaluatePrompt = async (prompt: string) => {
  await evaluatePrompt(prompt); // Store のアクション経由
};
```

**影響範囲**

- 機能的な問題はなし（現状動作に影響なし）
- 将来の Store 集約時に修正コストが発生する

**Phase 12 未タスク化方針**

- 未タスクID: `TASK-FIX-EVAL-STORE-DISPATCH-001`
- 優先度: low（機能影響なし、将来のリファクタリング対象）
- 実装ガイド: agentSlice に `evaluatePromptAsync` アクションを追加し、`useEvaluatePromptAction()` セレクタを公開する

---

### FINAL-M-02: calculateScoreDelta ロジックの二重定義

| 項目         | 内容                                                                                                        |
| ------------ | ----------------------------------------------------------------------------------------------------------- |
| 指摘ID       | FINAL-M-02                                                                                                  |
| 分類         | MINOR                                                                                                       |
| 優先度       | low                                                                                                         |
| 発見Phase    | Phase 10 最終レビュー（SubAgent-C 仕様整合レビュー）                                                        |
| 対象ファイル | `apps/desktop/src/renderer/components/skill/ScoreDisplay.tsx` および `@repo/shared/types/skill-improver.ts` |

**問題の詳細**

スコア差分の `direction` 判定ロジック（`|raw| <= 2 → neutral`）が2箇所に存在する:

1. `ScoreDisplay.tsx` の `calculateScoreDelta` 関数（ローカル実装）
2. `@repo/shared/types/skill-improver.ts` の `calculateScoreDelta` 関数（shared実装）

両者は現状同一のロジックを実装しているが、将来の仕様変更時に片方だけ更新されると挙動が乖離するリスクがある。
また、同名関数が2つのモジュールに存在することでテストでの混同が発生している（`ScoreDisplay.test.tsx` は `ScoreDisplay.tsx` から import し、`scoring-gate.test.ts` は `@repo/shared` から import している）。

**二重定義の詳細**

```typescript
// ScoreDisplay.tsx (ローカル関数)
export function calculateScoreDelta(
  current: number,
  previous: number,
): ScoreDelta {
  const raw = current - previous;
  const value = Math.abs(raw);
  const direction: ScoreDeltaDirection =
    value <= 2 ? "neutral" : raw > 0 ? "up" : "down";
  return { value, direction, raw };
}

// @repo/shared/types/skill-improver.ts (shared関数)
export function calculateScoreDelta(
  previousScore: number,
  newScore: number,
): ScoreDeltaResult {
  const delta = newScore - previousScore; // 引数順序が異なる
  // ...
}
```

注記: 引数の順序が異なる（`current, previous` vs `previousScore, newScore`）ため、型定義も異なる。
これは P45（引数命名の契約ドリフト）のパターンに該当する。

**影響範囲**

- 機能的な問題はなし（現状動作に影響なし）
- 将来のロジック変更時に片方が更新されないリスクがある
- 二重定義によるコード重複がある

**Phase 12 未タスク化方針**

- 未タスクID: `TASK-FIX-SCORE-DELTA-DEDUP-001`
- 優先度: low（機能影響なし、将来のリファクタリング対象）
- 解決方針:
  1. `ScoreDisplay.tsx` のローカル `calculateScoreDelta` を `@repo/shared` から import に切り替える
  2. または、`ScoreDisplay.tsx` の型（`ScoreDelta`）を `@repo/shared` の `ScoreDeltaResult` に統合する
  3. 引数順序の統一（`(previousScore, newScore)` に統一することで P45 防止）

---

## Phase 11 新規発見事項

| 優先度   | 件数 | 内容 |
| -------- | ---- | ---- |
| critical | 0件  | なし |
| high     | 0件  | なし |
| medium   | 0件  | なし |
| low      | 0件  | なし |

Phase 11 手動テスト（自動テスト代替 + コードレビュー）では新規の critical/high/medium/low 発見事項はなかった。
Phase 10 から引き継いだ MINOR 2件のみが未解決として残る。

---

## Phase 12 対応方針

| 指摘ID     | 未タスクID                       | 優先度 | 対応                         |
| ---------- | -------------------------------- | ------ | ---------------------------- |
| FINAL-M-01 | TASK-FIX-EVAL-STORE-DISPATCH-001 | low    | Phase 12 Task 4 で未タスク化 |
| FINAL-M-02 | TASK-FIX-SCORE-DELTA-DEDUP-001   | low    | Phase 12 Task 4 で未タスク化 |

両件とも機能への影響はなく、Phase 12 でのシステム仕様書更新には影響しない。
Phase 12 完了後に未タスク仕様書を作成し、`task-workflow.md` 残課題テーブルに登録する。

---

## 完了条件チェックリスト

- [x] Phase 10 で特定した MINOR 2件の詳細が記録されている
- [x] 優先度分類（critical/high/medium/low）が記録されている（2件とも low）
- [x] Phase 12 での未タスク化方針が記録されている
- [x] Phase 11 新規発見事項が記録されている（0件）
