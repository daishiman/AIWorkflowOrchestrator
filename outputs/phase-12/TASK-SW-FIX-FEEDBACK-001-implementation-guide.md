# Implementation Guide: TASK-SW-FIX-FEEDBACK-001

## スキル一覧リアルタイム反映・skillPath nullガード・成功表示修正

## 概要

スキルウィザードの4件のフィードバックループ欠如問題（問題6・8・14・20）を修正しました。

## 変更内容

### 1. SkillCreateWizard.tsx — LLMモード fetchSkills 追加

**問題**: LLMモード（handleExecutePlan）の成功パスに `fetchSkills()` が欠落しており、
スキル生成後もスキル一覧が更新されなかった（問題6/8）。

**修正**: `useFetchSkills` フックを追加し、`executePlan` 成功後に `await fetchSkills()` を実行。
fetchSkills が失敗した場合も遷移は継続（生成自体は成功済みのため）。

```typescript
// apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
import { useFetchSkills, ... } from "../../store";

const fetchSkills = useFetchSkills();

// handleExecutePlan 成功パス末尾（goToStep(3) 直前）:
try {
  await fetchSkills(); // 問題6/8修正
} catch {
  // fetchSkills失敗はログのみ
}
goToStep(3);
```

### 2. CompleteStep.tsx — skillPath nullガード

**問題**: `skillPath === null` のままStep 3に到達しても成功UIが表示される（問題14/20）。

**修正**: `skillPath === null` の場合はアーリーリターンでエラーUIを表示。
`onRetry` ボタンでStep 0へのリトライ誘導を実装。

```typescript
// apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx
if (skillPath === null) {
  return (
    <div data-testid="complete-step">
      <div data-testid="complete-step-error-header" role="alert">
        <h2>スキルの生成に失敗しました</h2>
      </div>
      <button data-testid="complete-step-retry-button" onClick={onRetry}>
        もう一度試す
      </button>
    </div>
  );
}
```

## テスト追加

| TC番号                    | 内容                                               |
| ------------------------- | -------------------------------------------------- |
| TC-FEEDBACK-001           | LLMモード成功時 fetchSkills 1回呼び出し            |
| TC-FEEDBACK-002           | LLMモード失敗時 fetchSkills 非呼び出し             |
| TC-FEEDBACK-003           | templateモード regression（createSkill内部が処理） |
| TC-FEEDBACK-004〜007      | CompleteStep nullガード基本テスト                  |
| TC-FEEDBACK-009, 011, 013 | エッジケース・回帰ガード                           |

## Phase 11 視覚証跡

今回の UI 変更は screenshot evidence を残す必要があるため、次の 4 枚を保存した。

| ファイル                                                         | 確認内容                                                 |
| ---------------------------------------------------------------- | -------------------------------------------------------- |
| `outputs/phase-11/screenshots/skill-list-updated-after-llm.png`  | LLM モード完了後にスキル一覧へ新規スキルが反映されること |
| `outputs/phase-11/screenshots/complete-step-null-error.png`      | `skillPath === null` のエラー表示                        |
| `outputs/phase-11/screenshots/complete-step-null-no-success.png` | `skillPath === null` 時に成功ヘッダーが出ないこと        |
| `outputs/phase-11/screenshots/complete-step-success.png`         | `skillPath` 正常値時の成功表示                           |

補助メタデータ: `outputs/phase-11/phase11-capture-metadata.json`

## 解消された問題

| 問題番号 | 内容                                              | 解消 |
| -------- | ------------------------------------------------- | ---- |
| 問題6    | スキル一覧リアルタイム反映されない（全般）        | ✓    |
| 問題8    | LLMモード完了後に fetchSkills() が呼ばれない      | ✓    |
| 問題14   | skillPath=null のまま Step 3 到達でサイレント失敗 | ✓    |
| 問題20   | skillPath=null でも成功ヘッダーが表示される       | ✓    |
