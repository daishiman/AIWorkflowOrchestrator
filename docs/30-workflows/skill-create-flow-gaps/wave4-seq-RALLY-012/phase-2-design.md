# Phase 2: 設計

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 2                  |
| タスクID   | TASK-RALLY-012     |
| 機能名     | エラー回復導線追加 |
| 前提Phase  | Phase 1            |
| 後続Phase  | Phase 3            |
| 作成日     | 2026-04-21         |
| ステータス | pending            |

## 目的

`localError` state・`lastAnswerRef`・`handleRetry`・`handleReset` の実装設計を固定する。

## 問題と解決策

```
問題: エラー後にrollbackLastUserMessage()は呼ばれるが、
      ユーザーに「再試行」「リセット」の選択肢が表示されない

解決: lastAnswerRefに直前の回答を保持し再試行可能に。
      onResetオプショナルプロップスを追加しリセット導線を設置
```

## 変更箇所設計

**対象ファイル**: `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`

### 1. `ConversationalInterviewProps` に `onReset` を追加

```tsx
export interface ConversationalInterviewProps {
  workflowSnapshot: SkillCreatorWorkflowUiSnapshot | null;
  onSubmit: (submission: SkillCreatorUserInputSubmission) => Promise<void>;
  onError?: (message: string) => void;
  onReset?: () => void; // 追加: ワークフローをリセットする（最初からやり直す）
  disabled?: boolean;
}
```

### 2. `localError` state と `lastAnswerRef` の追加

```tsx
const [localError, setLocalError] = useState<string | null>(null);
// 再試行用: 最後に試みた回答とdisplayTextを保持
const lastAnswerRef = useRef<{
  answer: InterviewUserAnswer;
  displayText: string;
} | null>(null);
```

### 3. `submitAnswer` の変更

エラー時に `localError` をセットし、`lastAnswerRef` に回答を保持する。

### 4. `handleRetry` ハンドラ

```tsx
const handleRetry = useCallback(async () => {
  if (!lastAnswerRef.current) return;
  const { answer, displayText } = lastAnswerRef.current;
  await submitAnswer(answer, displayText);
}, [submitAnswer]);
```

### 5. `handleReset` ハンドラ

```tsx
const handleReset = useCallback(() => {
  setLocalError(null);
  lastAnswerRef.current = null;
  onReset?.();
}, [onReset]);
```

### 6. エラーUI（JSX）

`pendingRequest` の三項演算子の直前にエラーUIを追加する。エラーUI表示中は通常の入力エリアを非表示にする。

```tsx
{localError ? (
  <div data-testid="interview-error-recovery">
    <p role="alert">{localError}</p>
    <button data-testid="interview-retry" onClick={() => void handleRetry()}>
      再試行する
    </button>
    {onReset ? (
      <button data-testid="interview-reset" onClick={handleReset}>
        最初からやり直す
      </button>
    ) : null}
  </div>
) : pendingRequest ? (
  // 既存の入力エリア（RALLY-011のactiveSnapshot参照を維持）
) : isRallyCompleted ? (
  // 完了UI（RALLY-010で追加済み）
) : (
  // 待機UI
)}
```

## 参照資料

| 資料名             | パス                                         | 説明           |
| ------------------ | -------------------------------------------- | -------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物 |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`     | Phase 1 成果物 |
| エラー発生箇所調査 | `outputs/phase-1/error-location-analysis.md` | Phase 1 成果物 |
| UXフロー設計       | `outputs/phase-1/ux-flow-design.md`          | Phase 1 成果物 |

## 成果物

| 成果物         | パス                                      | 説明                     |
| -------------- | ----------------------------------------- | ------------------------ |
| 回復導線設計書 | `outputs/phase-2/recovery-flow-design.md` | エラー回復導線の詳細設計 |
| 変更差分設計   | `outputs/phase-2/change-diff-design.md`   | 変更前後のコード差分設計 |

## 完了条件

- [ ] `localError` state と `lastAnswerRef` の設計が明確であること
- [ ] `handleRetry` と `handleReset` の動作が設計されていること
- [ ] エラーUI の JSX 構造（4分岐）が設計されていること
- [ ] RALLY-011 の `activeSnapshot` 参照との整合が確認されていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skill-create-flow-gaps/p12-seq-RALLY-012
```

## 次のPhase

Phase 3: 設計レビューゲート
