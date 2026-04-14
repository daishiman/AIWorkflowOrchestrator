# 要件定義書 — TASK-SW-FIX-STATE-DETAIL-001

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 1                            |
| タスクID   | TASK-SW-FIX-STATE-DETAIL-001 |
| 作成日     | 2026-04-14                   |
| ステータス | 完了                         |

---

## Task 1: 問題の固定

### 問題12: internalAnswers 状態残留

**発生箇所**: `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`

- `ConversationRoundStep` の `useEffect` が `answers` prop の変化を依存配列に含めていない
- リトライ時に親コンポーネント (`SkillCreateWizard`) が `setAnswers(DEFAULT_ANSWERS)` を呼んでも、コンポーネント内の `internalAnswers` state が前回の入力値を保持したまま残留する
- 具体的: `useEffect(() => { onAnswersChange(internalAnswers); }, [internalAnswers, onAnswersChange])` のみが存在し、親からの reset シグナルを受け取るロジックが欠如

### 問題13: templateモード キャンセルパス欠如

**発生箇所**: `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`

- `GenerateStep` にて `stage === "error"` 時には `isActive = false` となり、`showCancelButton` が `false` になる
- templateモードのエラー後にウィザードを Step 0 に戻す手段が UI に存在しない
- 現在の `showCancelButton` 条件: `isActive && !(onCancelPlan && showPlanControls)` — error状態では表示されない

### 問題18: resolveExternalIntegration 未再計算

**発生箇所**: `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`

- `resolveExternalIntegration` は `handleStep0Next` と `handleGenerate` 内でのみ呼び出される
- Step 1 (`ConversationRoundStep`) で q5（外部ツール連携）を後から変更しても `hasExternalIntegration` / `externalToolName` state が再計算されない
- q5 変更時のトリガーが存在しない

### 問題19: generationLockRef キャンセル競合

**発生箇所**: `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`

- `handleGenerate` の `finally` 節:
  ```tsx
  } finally {
    if (requestId === generationRequestIdRef.current) {
      setIsGenerating(false);
      generationLockRef.current = false;
    }
  }
  ```
- キャンセル時は `resetGeneratedState` が `invalidateGenerationRequests()` を呼び出し `requestId` をインクリメントするため、`requestId !== generationRequestIdRef.current` となる
- 当該条件が false の場合、`finally` 内で `generationLockRef.current = false` が実行されない（resetGeneratedState が同期的にリセットするため通常は問題ないが、将来のコードパス追加時の安全性が低い潜在的バグ）

---

## Task 2: 受入条件の確定

| AC   | 内容                                                                                     | 検証方法                  |
| ---- | ---------------------------------------------------------------------------------------- | ------------------------- |
| AC-1 | リトライ時に ConversationRoundStep の internalAnswers が前回値でなく空値にリセットされる | ユニットテスト TC-01      |
| AC-2 | templateモードのエラー時にキャンセルボタンが表示され、Step 0 に戻れる                    | ユニットテスト TC-03,04   |
| AC-3 | q5 変更後に hasExternalIntegration と externalToolName が最新値で再計算される            | ユニットテスト TC-06      |
| AC-4 | generationLockRef がキャンセル後に正しく false に戻り、次の生成操作が可能になる          | ユニットテスト TC-08,09   |
| AC-5 | 既存の正常フロー（リトライなし・キャンセルなし）に回帰影響がない                         | 回帰テスト TC-02,05,07,10 |

---

## Task 3: スコープ境界

### 含む

- `ConversationRoundStep.tsx` のuseEffect依存配列修正（問題12）
- `GenerateStep.tsx` のtemplateモードエラー時キャンセルボタン追加（問題13）
- `SkillCreateWizard.tsx` の resolveExternalIntegration 再計算追加（問題18）
- `SkillCreateWizard.tsx` の generationLockRef finally節防御的修正（問題19）
- 対応するユニットテスト（TC-01〜TC-10）

### 含まない

- Step 0〜Step 1以外のウィザードフロー変更
- Main Process 実装修正
- IPC 契約変更
- PR 作成・コミット（ユーザー指示なし）
