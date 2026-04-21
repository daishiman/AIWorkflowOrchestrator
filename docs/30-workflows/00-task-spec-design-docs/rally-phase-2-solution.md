# スキルクリエイター ラリー機能ギャップ修正 Phase 2: 解決策設計ドキュメント

作成日: 2026-04-21
依存ドキュメント: rally-phase-1-analysis.md

---

## 1. 13タスクの責務分離設計

| タスクID  | タイトル                                | グループ | 責務の境界                                                                                    |
| --------- | --------------------------------------- | -------- | --------------------------------------------------------------------------------------------- |
| RALLY-001 | dead code 削除                          | B        | SkillLifecyclePanel から未使用コードを除去するのみ。他タスクへの影響なし                      |
| RALLY-002 | restoredPendingRequest 優先ルール明確化 | B        | 合成ロジックにコメント・型ガードを追加するのみ。ロジック変更なし                              |
| RALLY-003 | Undo サーバー rollback API 追加         | A        | RuntimeSkillCreatorFacade に rollbackStep IPC ハンドラを追加。RALLY-005 が完了した後に実装    |
| RALLY-004 | 重複フィールド整理                      | B        | 型定義に正規フィールドを明示し、非推奨フィールドに JSDoc で deprecation マーク                |
| RALLY-005 | workflowSnapshot 更新権限設計確立       | A        | invoke を正規ソース・push を補完として明示。SkillLifecyclePanel と creatorHandlers 両方に適用 |
| RALLY-006 | useEffect 依存配列修正                  | C        | L675-708 useEffect の依存配列から workflowSnapshot?.planId を除去し、別の ref で管理          |
| RALLY-007 | addAssistantMessage stale closure 排除  | C        | useCallback の依存配列を修正し、useRef で最新値を参照                                         |
| RALLY-008 | processWorkflowOutcome await 統一       | A        | fire-and-forget 呼び出しをすべて await に統一。エラーハンドリングを呼び出し側に追加           |
| RALLY-009 | getSkillCreatorApi() 型ガード強化       | D        | window 型定義に型ガード関数を追加。as キャストをランタイム検証に置き換え                      |
| RALLY-010 | ラリー完了状態 UI 追加                  | E        | ConversationalInterview にラリー完了専用コンポーネントを追加                                  |
| RALLY-011 | 送信中競合防止 UI 強化                  | E        | isSubmitting 中の push 受信をキューイングし、送信完了後に適用                                 |
| RALLY-012 | エラー回復導線追加                      | E        | エラー表示コンポーネントに再試行・リセットボタンを追加                                        |
| RALLY-013 | Undo 可能範囲視覚的表現追加             | E        | Undo ボタン近辺に「N ステップ前まで戻れます」インジケーターを追加                             |

---

## 2. 依存関係グラフ

```
RALLY-001 (dead code)
    │
    └── 独立（他タスクの前提ではない）

RALLY-004 (型定義整理)
    │
    └── RALLY-009 (型ガード強化) が参照するため先行推奨

RALLY-005 (更新権限確立)
    │
    ├── RALLY-003 (Undo rollback API) ← RALLY-005 完了後に実装
    └── RALLY-008 (processWorkflowOutcome await 統一) ← RALLY-005 と直列

RALLY-006 (useEffect 依存配列)
    │
    └── RALLY-005 完了後が安全（snapshot 更新経路が確定してから依存配列を整理）

RALLY-007 (stale closure)
    │
    └── 独立（useInterviewState.ts のみ）

RALLY-002 (restoredPendingRequest)
    │
    └── RALLY-010, RALLY-011, RALLY-012, RALLY-013 と同一ファイル（ConversationalInterview）
        → 直列実行が必要

RALLY-010 → RALLY-011 → RALLY-012 → RALLY-013
    （ConversationalInterview.tsx 内で直列）

RALLY-002
    （ConversationalInterview.tsx への最初の変更として先行）
```

### 依存関係サマリー

```
独立実行可能:
  RALLY-001, RALLY-007

先行依存:
  RALLY-004 → RALLY-009
  RALLY-005 → RALLY-003
  RALLY-005 → RALLY-006（推奨）
  RALLY-005 → RALLY-008

ConversationalInterview.tsx 直列グループ:
  RALLY-002 → RALLY-010 → RALLY-011 → RALLY-012 → RALLY-013

SkillLifecyclePanel.tsx 直列グループ:
  RALLY-001 → RALLY-005 → RALLY-006 → RALLY-008
```

---

## 3. 実行 Wave と並列化戦略

### Wave 0（前提クリア）

同一ファイルを触らず、後続タスクの前提を確立する。

| タスク    | ファイル                                  | 並列可否          |
| --------- | ----------------------------------------- | ----------------- |
| RALLY-001 | SkillLifecyclePanel.tsx                   | Wave 0 内で並列可 |
| RALLY-004 | packages/shared/src/types/skillCreator.ts | Wave 0 内で並列可 |
| RALLY-007 | useInterviewState.ts                      | Wave 0 内で並列可 |

### Wave 1（コア設計確立）

更新権限と型安全の基盤を確立する。

| タスク    | ファイル                                     | 並列可否                        |
| --------- | -------------------------------------------- | ------------------------------- |
| RALLY-005 | SkillLifecyclePanel.tsx + creatorHandlers.ts | Wave 1 の中核                   |
| RALLY-009 | window 型定義 + 呼び出し側                   | RALLY-004 完了後に並列可        |
| RALLY-002 | ConversationalInterview.tsx                  | Wave 1 内で並列可（別ファイル） |

### Wave 2（副作用フック修正）

Wave 1 で確立した更新経路を前提に依存配列を整理する。

| タスク    | ファイル                | 並列可否                           |
| --------- | ----------------------- | ---------------------------------- |
| RALLY-006 | SkillLifecyclePanel.tsx | RALLY-005 完了後                   |
| RALLY-008 | SkillLifecyclePanel.tsx | RALLY-005 完了後、RALLY-006 と直列 |

### Wave 3（拡張機能）

コア修正を前提にサーバー側 API と UX を追加する。

| タスク    | ファイル                                          | 並列可否         |
| --------- | ------------------------------------------------- | ---------------- |
| RALLY-003 | RuntimeSkillCreatorFacade.ts + creatorHandlers.ts | RALLY-005 完了後 |
| RALLY-010 | ConversationalInterview.tsx                       | RALLY-002 完了後 |
| RALLY-011 | ConversationalInterview.tsx                       | RALLY-010 完了後 |
| RALLY-012 | ConversationalInterview.tsx                       | RALLY-011 完了後 |
| RALLY-013 | ConversationalInterview.tsx                       | RALLY-012 完了後 |

---

## 4. 各タスクの設計方針

### RALLY-001: SkillLifecyclePanel dead code 削除

**対象ファイル**: `apps/desktop/src/renderer/components/skill-lifecycle/SkillLifecyclePanel.tsx`

**変更箇所**:

- `_handleSubmitWorkflowInput` 関数定義を削除
- `selectedOptionId` / `textAnswer` / `secretAnswer` / `confirmAnswer` の state 宣言を削除
- これらを参照する JSX 属性・イベントハンドラを削除

**設計方針**:

- 削除前に `_handleSubmitWorkflowInput` が実際にどこからも呼ばれていないことを grep で確認する
- 削除後に TypeScript コンパイルエラーがないことを確認する

**検証方法**:

- `pnpm typecheck` でコンパイルエラーなし
- `pnpm lint` で ESLint エラーなし
- Vitest 単体テストが通過

---

### RALLY-002: restoredPendingRequest 合成優先ルール明確化

**対象ファイル**: `apps/desktop/src/renderer/components/skill-creator/ConversationalInterview.tsx`

**変更箇所**:

- `restoredPendingRequest ?? workflowSnapshot?.awaitingUserInput` の直上にコメント追加
- 可能であれば型ガードまたは明示的な条件分岐に書き換え

**設計方針**:

```typescript
// restoredPendingRequest はセッション復元時のみ非 null になる。
// 通常フローでは workflowSnapshot?.awaitingUserInput を使用する。
// 復元セッション中は restoredPendingRequest を優先し、
// 一度送信が完了したらクリアして通常フローに戻る。
const currentPendingRequest =
  restoredPendingRequest ?? workflowSnapshot?.awaitingUserInput;
```

**検証方法**:

- コードレビューで優先ルールが読み取れること
- 型チェック通過

---

### RALLY-003: Undo サーバー rollback API 追加

**対象ファイル**:

- `apps/desktop/src/main/ipc/handlers/creatorHandlers.ts`
- `apps/desktop/src/main/facades/RuntimeSkillCreatorFacade.ts`

**変更箇所**:

- `creatorHandlers.ts` に `skill-creator:rollback-step` IPC ハンドラを追加
- `RuntimeSkillCreatorFacade.ts` に `rollbackStep(planId: string, stepIndex: number): Promise<void>` メソッドを追加

**設計方針**:

IPC ハンドラのシグネチャ:

```typescript
ipcMain.handle(
  "skill-creator:rollback-step",
  async (_, { planId, stepIndex }) => {
    return facade.rollbackStep(planId, stepIndex);
  },
);
```

Facade のシグネチャ:

```typescript
async rollbackStep(planId: string, stepIndex: number): Promise<void> {
  // stepIndex 以降のステップを削除し、awaitingUserInput を復元する
}
```

RALLY-005 で確立した「invoke を正規ソース」とする方針に従い、rollback 完了後は invoke 戻り値として最新 workflowSnapshot を返す。

**検証方法**:

- 単体テストで rollback 後の snapshot 状態を検証
- Undo 操作後にサーバー状態が巻き戻されることを E2E テストで確認

---

### RALLY-004: selectedOptionIds/selectedValues 重複フィールド整理

**対象ファイル**: `packages/shared/src/types/skillCreator.ts`

**変更箇所**:

- 正規フィールドを JSDoc で `@canonical` とマーク
- 非推奨フィールドに `@deprecated Use [正規フィールド名] instead` を追加
- 型レベルで `@deprecated` を付与することで IDE 警告を発生させる

**設計方針**:

調査後、`selectedOptionIds`（複数選択対応の配列型）を正規フィールドとし、`selectedValues`（文字列配列の汎用型）を補助フィールドとして整理する方針を想定。ただし実際のコードを読んで最終確定する。

```typescript
type WorkflowInputAnswer = {
  /** @canonical 選択されたオプションIDの配列 */
  selectedOptionIds: string[];
  /**
   * @deprecated Use selectedOptionIds for option selections.
   * This field is retained for legacy compatibility only.
   */
  selectedValues?: string[];
};
```

**検証方法**:

- 型チェック通過
- `selectedValues` を参照している呼び出し側に IDE 警告が表示されること

---

### RALLY-005: workflowSnapshot 更新権限設計確立

**対象ファイル**:

- `apps/desktop/src/renderer/components/skill-lifecycle/SkillLifecyclePanel.tsx`
- `apps/desktop/src/main/ipc/handlers/creatorHandlers.ts`

**変更箇所**:

- SkillLifecyclePanel の `onWorkflowStateChanged` ハンドラに「push は補完ソース」を示すコメントを追加
- invoke の戻り値処理に「正規ソース」を示すコメントを追加
- push 受信時に invoke 戻り値との競合チェックロジックを追加（タイムスタンプまたは seqNo ベース）

**設計方針**:

```typescript
// [設計方針] workflowSnapshot の更新権限
// 正規ソース: IPC invoke 戻り値（submitWorkflowInput の resolve 値）
// 補完ソース: onWorkflowStateChanged push イベント
//
// push は invoke が進行中の場合はキューに入れ、
// invoke 完了後に適用する。
// push の方が invoke 戻り値より古い seqNo を持つ場合は無視する。

const handleWorkflowStateChanged = useCallback(
  (snapshot: WorkflowSnapshot) => {
    if (isSubmitting) {
      pendingPushRef.current = snapshot; // キューイング
      return;
    }
    if (snapshot.seqNo <= workflowSnapshotRef.current?.seqNo) {
      return; // 古い push は無視
    }
    setWorkflowSnapshot(snapshot);
  },
  [isSubmitting],
);
```

seqNo がサーバー側に存在しない場合は updatedAt タイムスタンプで代替する。

**検証方法**:

- push/pull 競合シナリオのテストケースを追加
- テスト通過

---

### RALLY-006: useEffect 依存配列修正（循環排除）

**対象ファイル**: `apps/desktop/src/renderer/components/skill-lifecycle/SkillLifecyclePanel.tsx`

**変更箇所**:

- L675-708 の useEffect の依存配列から `workflowSnapshot?.planId` を除去
- `planId` を `useRef` に抽出し、エフェクト内では ref 経由で参照

**設計方針**:

```typescript
const planIdRef = useRef(workflowSnapshot?.planId);
useEffect(() => {
  planIdRef.current = workflowSnapshot?.planId;
}, [workflowSnapshot?.planId]);

useEffect(
  () => {
    const planId = planIdRef.current; // ref 経由で参照 → 依存配列に不要
    // ... エフェクト本体
  },
  [
    /* workflowSnapshot?.planId を除外 */
  ],
);
```

**検証方法**:

- `react-hooks/exhaustive-deps` ESLint ルールが警告を出さないこと
- エフェクトが意図した回数だけ実行されることをテストで確認

---

### RALLY-007: addAssistantMessage stale closure 排除

**対象ファイル**: `apps/desktop/src/renderer/hooks/useInterviewState.ts`

**変更箇所**:

- `addAssistantMessage` の `useCallback` 依存配列から `currentStepIndex` を除去
- `currentStepIndex` を `useRef` で最新値を追跡し、コールバック内では ref 経由で参照

**設計方針**:

```typescript
const currentStepIndexRef = useRef(currentStepIndex);
useEffect(() => {
  currentStepIndexRef.current = currentStepIndex;
}, [currentStepIndex]);

const addAssistantMessage = useCallback((message: AssistantMessage) => {
  const stepIndex = currentStepIndexRef.current; // ref 経由
  setSteps((prev) => {
    // ... prev を使った純粋な更新
  });
}, []); // 依存配列が空 → stale closure なし
```

**検証方法**:

- `react-hooks/exhaustive-deps` 警告なし
- ステップ追加のシナリオテストで正しい stepIndex が使われること

---

### RALLY-008: processWorkflowOutcome await 統一

**対象ファイル**: `apps/desktop/src/renderer/components/skill-lifecycle/SkillLifecyclePanel.tsx`

**変更箇所**:

- fire-and-forget で呼ばれている `processWorkflowOutcome` 呼び出し箇所をすべて `await` に変更
- 変更後に `try/catch` でエラーハンドリングを追加

**設計方針**:

```typescript
// 変更前（fire-and-forget）
processWorkflowOutcome(outcome);

// 変更後（await + エラーハンドリング）
try {
  await processWorkflowOutcome(outcome);
} catch (error) {
  setError(toErrorMessage(error));
}
```

RALLY-005 で isSubmitting フラグの管理が確立された後に適用することで、await 中の push 競合も安全に処理できる。

**検証方法**:

- processWorkflowOutcome がエラーを throw したとき UI にエラー状態が反映されること

---

### RALLY-009: getSkillCreatorApi() 型ガード強化

**対象ファイル**:

- `apps/desktop/src/renderer/types/window.d.ts`（または対応する window 型定義ファイル）
- `getSkillCreatorApi()` / `getSessionResumeApi()` の呼び出し側

**変更箇所**:

- `window.skillCreatorApi` へのアクセスを型ガード関数でラップ
- `as` キャストを削除してランタイム検証に置き換え

**設計方針**:

```typescript
function getSkillCreatorApi(): SkillCreatorApi {
  const api = window.skillCreatorApi;
  if (!api || typeof api.submitWorkflowInput !== "function") {
    throw new Error(
      "skillCreatorApi is not available. Ensure Electron preload is loaded.",
    );
  }
  return api;
}
```

`getSessionResumeApi()` も同様のパターンで実装する。

**検証方法**:

- プリロードなしの環境で呼んだとき `as` キャストではなく型ガードエラーがスローされること
- 型チェック通過

---

### RALLY-010: ラリー完了状態 UI 追加

**対象ファイル**: `apps/desktop/src/renderer/components/skill-creator/ConversationalInterview.tsx`

**変更箇所**:

- `awaitingUserInput === null && workflowStatus === 'completed'` の分岐を追加
- 専用の「ラリー完了」コンポーネント or メッセージを表示

**設計方針**:

```tsx
if (workflowStatus === "completed") {
  return (
    <RallyCompletedView
      summary={workflowSnapshot?.summary}
      onProceed={onProceedToReview}
    />
  );
}

if (awaitingUserInput === null) {
  return <LoadingView message="次の質問を準備しています..." />;
}
```

完了状態と待機状態を明示的に分岐することで、ユーザーが「完了したのか待機中なのか」を区別できるようにする。

**検証方法**:

- `workflowStatus === 'completed'` のときに完了 UI が表示されること
- `awaitingUserInput === null` かつ `workflowStatus !== 'completed'` のときに待機 UI が表示されること

---

### RALLY-011: 送信中競合防止 UI 強化

**対象ファイル**: `apps/desktop/src/renderer/components/skill-creator/ConversationalInterview.tsx`

**変更箇所**:

- `onWorkflowStateChanged` ハンドラに `isSubmitting` チェックを追加
- isSubmitting 中は受信した push を `pendingPushRef` にキューイング
- 送信完了後（isSubmitting が false に戻った時）に pendingPush を適用

**設計方針**:

RALLY-005 で SkillLifecyclePanel 側に実装するキューイングロジックと連携する。ConversationalInterview 側ではその下流として、`isSubmitting === true` 中に UI 入力を受け付けないボタン disabled 状態を明示的に管理する。

```tsx
<SubmitButton
  disabled={isSubmitting || awaitingUserInput === null}
  loading={isSubmitting}
  onClick={handleSubmit}
>
  {isSubmitting ? "送信中..." : "送信"}
</SubmitButton>
```

**検証方法**:

- isSubmitting 中にボタンが disabled になること
- isSubmitting 中に push が来ても二重更新が起きないこと

---

### RALLY-012: エラー回復導線追加

**対象ファイル**: `apps/desktop/src/renderer/components/skill-creator/ConversationalInterview.tsx`

**変更箇所**:

- エラー表示コンポーネントに「再試行」「最初から始める」ボタンを追加
- 「再試行」は最後の送信を再実行
- 「最初から始める」はワークフローをリセット

**設計方針**:

```tsx
{
  error && (
    <ErrorView
      message={error.message}
      onRetry={handleRetry}
      onReset={handleReset}
    />
  );
}
```

`handleRetry`: 最後の送信入力を保持し、再送信を試みる。
`handleReset`: `workflowSnapshot` をリセットし、インタビューを最初から開始する IPC を呼ぶ。

**検証方法**:

- エラー状態で「再試行」ボタンが表示されること
- 「再試行」クリックで最後の送信が再実行されること
- 「最初から始める」クリックでワークフローがリセットされること

---

### RALLY-013: Undo 可能範囲視覚的表現追加

**対象ファイル**: `apps/desktop/src/renderer/components/skill-creator/ConversationalInterview.tsx`

**変更箇所**:

- Undo ボタン近辺に「N ステップ前まで戻れます」インジケーターを追加
- Undo 可能ステップ数が 0 の時は Undo ボタンを非表示またはグレーアウト

**設計方針**:

```tsx
<UndoSection>
  <UndoButton disabled={undoableStepCount === 0} onClick={handleUndo}>
    元に戻す
  </UndoButton>
  {undoableStepCount > 0 && (
    <UndoHint>{undoableStepCount} ステップ前まで戻れます</UndoHint>
  )}
</UndoSection>
```

`undoableStepCount` は `workflowSnapshot?.stepHistory?.length` または別途管理するステップ履歴から計算する。

RALLY-003（rollback API）完了後に、Undo 操作がサーバー状態も巻き戻すことを前提として実装する。

**検証方法**:

- 3ステップ進んでいる時に「3 ステップ前まで戻れます」と表示されること
- 0 ステップの時に Undo ボタンが disabled になること
