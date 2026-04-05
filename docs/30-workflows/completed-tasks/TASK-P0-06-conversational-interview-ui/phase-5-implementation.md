# Phase 5: 実装（TDD: Green） - 会話型インタビュー UI

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 5                                      |
| Phase名    | 実装（TDD: Green）                     |
| 前提Phase  | Phase 4（テスト作成）                  |
| 後続Phase  | Phase 6（テスト拡充）                  |
| ステータス | 未実施                                 |
| 作成日     | 2026-04-04                             |
| 機能名     | TASK-P0-06-conversational-interview-ui |
| Issue      | #1889                                  |

---

## 目的

Phase 4で作成したテスト（Red状態）を全てPassさせる最小限の実装を行い、Green状態を達成する。TDDの原則に従い、テストを通すために必要な変更のみを行い、過剰な実装を避ける。

## 背景

Phase 4でCT-26件、UT-16件、IT-6件のテストケースが設計・記述された。全テストがFAIL（Red）状態であることが確認済み。本Phaseでは、これらのテストをPassさせるための既存ファイルの拡張を行う。新規ファイルの作成は行わない。

---

## 実行タスク

### タスク0: IPC 4層整合性確認（Phase 3からの引継ぎ）

**目的**: Phase 3で保留された IPC 4層整合性の2-3層（ホワイトリスト・ハンドラ登録）を実コードで確認する。

**実行手順**:

```bash
# 2層: Preload API（ホワイトリスト / 公開境界）の確認
grep -rn "question-received\|external-api-config-required\|configure-api\|api-configured" \
  apps/desktop/src/preload/ --include="*.ts"

# 3層: Main Process ハンドラ登録の確認
grep -rn "question-received\|external-api-config-required\|configure-api\|api-configured" \
  apps/desktop/src/main/ --include="*.ts"
```

**判定基準**:

| 結果            | アクション                                                               |
| --------------- | ------------------------------------------------------------------------ |
| 4層全て実装済み | そのまま実装を進める                                                     |
| 2-3層が未実装   | 本タスクのスコープ外。別タスクとして起票し、モックで代替してテストを通す |

---

### タスク1: useInterviewState.ts の拡張

**目的**: UT-01〜UT-16のテストをPassさせる。

**変更対象**: `apps/desktop/src/renderer/components/skill/hooks/useInterviewState.ts`

**変更内容**:

1. **P0-06/P0-08境界コメント追加**（UT-15, UT-16対応）

```typescript
/**
 * @scope TASK-P0-06: レンダラー内の一時状態のみを管理する。
 * アプリ再起動をまたぐセッション復元はTASK-P0-08（SkillCreatorPersistedWorkflowCheckpoint）が担う。
 * このフックへの永続化ロジック（localStorage / SQLite / IPC経由の保存）の追加は禁止。
 */
```

2. **addAssistantMessage 重複防止ガード追加**（UT-01対応）

```typescript
// 同一questionIdの重複追加を防止
if (messages.some((m) => m.questionId === question.questionId)) {
  return; // 既に追加済み
}
```

3. **syncTotalSteps メソッド追加**（UT-13, UT-14対応）

```typescript
const syncTotalSteps = useCallback((estimatedSteps: number) => {
  setTotalSteps(Math.max(0, estimatedSteps));
}, []);
```

4. **既存メソッドの確認・調整**（UT-03〜UT-12対応）
   - `undo`: メッセージペア削除 + currentStepIndex デクリメント
   - `rollbackLastUserMessage`: 最後のuserメッセージ削除
   - `buildSubmission`: 全5種InputKindの submission 構築
   - `reset`: 全状態の初期化

**実装順序**: 2 → 3 → 4 → 1（境界コメントは最後）

**TDD検証コマンド**:

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="skill/useInterviewState"
```

---

### タスク2: ConversationalInterview.tsx の拡張

**目的**: CT-01〜CT-26のテストをPassさせる。

**変更対象**: `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`

**変更内容**:

1. **Props拡張**（CT-20〜CT-22対応）

```typescript
interface ConversationalInterviewProps {
  // 既存Props（変更なし）
  // ...

  // RT-04連携用（TASK-P0-06追加）
  apiKeyStatus?: "configured" | "not_set" | "unknown";
  onOpenApiKeySettings?: () => void;
}
```

2. **APIキーガイダンスバナー実装**（CT-20〜CT-22対応）

```tsx
{
  pendingRequest?.kind === "secret" && apiKeyStatus === "not_set" && (
    <div data-testid="api-key-guidance-banner" role="status">
      <p>外部APIキーが設定されていません</p>
      <button onClick={onOpenApiKeySettings}>外部API設定を開く</button>
    </div>
  );
}
```

3. **data-testid 追加**（CT-26対応）

Phase 2で定義した data-testid 一覧に基づき、以下の属性を追加:

| data-testid                | 対象要素                 |
| -------------------------- | ------------------------ |
| `conversational-interview` | ルートコンテナ           |
| `interview-chat-area`      | チャットメッセージエリア |
| `interview-input-area`     | 入力ウィジェットエリア   |
| `interview-submit`         | 送信ボタン               |
| `interview-undo`           | undoボタン               |
| `validation-error`         | バリデーションエラー     |
| `api-key-guidance-banner`  | APIキーガイダンス        |
| `interview-progress-bar`   | 進捗バー                 |
| `interview-message-{id}`   | 各メッセージ要素         |

4. **バリデーションエラーの `role="alert"` 属性確認**（CT-16〜CT-19対応）

```tsx
{
  validationError && (
    <p data-testid="validation-error" role="alert">
      {validationError}
    </p>
  );
}
```

5. **RT-05暫定対応の維持**

```typescript
// TODO(RT-05): RT-05完了後に selectedOptionIds canonical化
// selectedValues は後方互換フォールバック
const restoredIds = answer.selectedOptionIds ?? answer.selectedValues;
```

**実装順序**: 1 → 3 → 4 → 2 → 5

**TDD検証コマンド**:

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="skill/ConversationalInterview"
```

---

### タスク3: SkillCreatorConversationPanel.tsx の拡張

**目的**: 統合テスト（IT-01〜IT-06）をPassさせる接続コードを実装する。

**変更対象**: `apps/desktop/src/renderer/components/skill-creator/SkillCreatorConversationPanel.tsx`

**変更内容**:

1. **APIキー状態取得の接続**（IT-03対応）

```typescript
// skill-creator:external-api-config-required の受信ハンドラ
useEffect(() => {
  const unsubscribe =
    window.electronAPI.skillCreatorSession.onExternalApiConfigRequired(() => {
      setApiKeyStatus("not_set");
    });
  return () => unsubscribe();
}, []);

// skill-creator:api-configured の受信ハンドラ
useEffect(() => {
  const unsubscribe = window.electronAPI.skillCreatorSession.onApiConfigured(
    () => {
      setApiKeyStatus("configured");
    },
  );
  return () => unsubscribe();
}, []);
```

2. **進捗情報の接続**（IT-01対応）

```typescript
// question-received ハンドラ内で totalSteps を同期
const handleQuestionReceived = useCallback(
  (question: UserInputQuestion) => {
    const request = mapToRequest(question);
    setPendingRequest(request);
    interview.addAssistantMessage(request);

    // 進捗情報の同期
    if (question.totalSteps != null) {
      interview.syncTotalSteps(question.totalSteps);
    }
  },
  [interview],
);
```

3. **onOpenApiKeySettings の接続**

```typescript
const handleOpenApiKeySettings = useCallback(() => {
  window.electronAPI.skillCreatorSession.configureApi();
}, []);
```

4. **ConversationalInterview への Props 伝播**

```tsx
<ConversationalInterview
  {...existingProps}
  apiKeyStatus={apiKeyStatus}
  onOpenApiKeySettings={handleOpenApiKeySettings}
/>
```

**実装順序**: 1 → 2 → 3 → 4

**TDD検証コマンド**:

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="skill/(ConversationalInterview|useInterviewState)"
```

---

### タスク4: 全テスト Green 確認

**目的**: Phase 4で作成した全テストがPassすることを確認する。

**実行手順**:

```bash
# 対象テストの実行
pnpm --filter @repo/desktop test -- --testPathPattern="skill/(ConversationalInterview|useInterviewState)"

# 全テスト PASS の確認
pnpm --filter @repo/desktop test -- --testPathPattern="skill/(ConversationalInterview|useInterviewState)" 2>&1 | grep -E "Tests:|FAIL|PASS"
```

**期待される結果**:

- CT-01〜CT-26: 全て PASS
- UT-01〜UT-16: 全て PASS
- IT-01〜IT-06: 全て PASS（モック環境下）
- 既存テスト: 全て PASS（regressionなし）

---

### タスク5: 型チェック・Lintの確認

**目的**: 実装が型安全性とコード品質の基準を満たしていることを確認する。

```bash
# TypeScript 型チェック
pnpm --filter @repo/desktop typecheck

# ESLint チェック
pnpm --filter @repo/desktop lint
```

**期待される結果**:

- TypeScript: コンパイルエラー 0件（NFR-01）
- ESLint: エラー 0件（NFR-02）

---

## 参照資料

| 資料名             | パス                                                                                   | 説明                         |
| ------------------ | -------------------------------------------------------------------------------------- | ---------------------------- |
| Phase 2 設計       | `phase-2-design.md`                                                                    | アーキテクチャ設計、変更対象 |
| Phase 4 テスト仕様 | `phase-4-test-creation.md`                                                             | CT/UT/ITテストケース一覧     |
| 変更対象           | `apps/desktop/src/renderer/components/skill/hooks/useInterviewState.ts`                | フック拡張                   |
| 変更対象           | `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`               | コンポーネント拡張           |
| 変更対象           | `apps/desktop/src/renderer/components/skill-creator/SkillCreatorConversationPanel.tsx` | ブリッジ層拡張               |
| Issue #1889        | GitHub Issue                                                                           | TASK-P0-06の詳細仕様         |

---

## 統合テスト連携【必須】

フロント/バック接続の実装とテスト支援コード整備:

| 接続ポイント                          | 実装内容                                       | テスト支援コード                  | 確認状態        |
| ------------------------------------- | ---------------------------------------------- | --------------------------------- | --------------- |
| Session API → ConversationalInterview | `handleQuestionReceived` の質問受信ハンドラ    | IPCモック + Push型イベント模擬    | タスク3で実装   |
| ConversationalInterview → Session API | `buildSubmission` → `mapToAnswer` の送信フロー | submission構築テスト（UT-07〜11） | タスク1で実装   |
| APIキー設定要求 → ガイダンスバナー    | `onExternalApiConfigRequired` ハンドラ         | APIキー状態モック                 | タスク3で実装   |
| ガイダンスバナー → 設定画面           | `handleOpenApiKeySettings` → `configureApi`    | クリックイベントテスト（CT-21）   | タスク2で実装   |
| 進捗情報同期                          | `syncTotalSteps` → InterviewProgressBar        | syncTotalSteps テスト（UT-13）    | タスク1,3で実装 |

---

## 成果物

| 成果物            | パス                                         | 説明                                 |
| ----------------- | -------------------------------------------- | ------------------------------------ |
| 実装サマリー      | `outputs/phase-5/implementation-summary.md`  | 変更内容の概要と実装判断の記録       |
| 変更ファイル一覧  | `outputs/phase-5/changed-files.md`           | 変更対象ファイルと変更行数           |
| Green結果記録     | `outputs/phase-5/green-test-result.md`       | 全テストPASS確認の記録               |
| IPC 4層整合性結果 | `outputs/phase-5/ipc-4layer-verification.md` | タスク0の確認結果（2-3層の実装状態） |

---

## 完了条件

- [ ] IPC 4層整合性の2-3層確認が完了している（タスク0）
- [ ] useInterviewState.ts の拡張が完了している（境界コメント、重複防止、syncTotalSteps）
- [ ] ConversationalInterview.tsx の拡張が完了している（Props追加、ガイダンスバナー、data-testid）
- [ ] SkillCreatorConversationPanel.tsx の拡張が完了している（APIキー状態接続、進捗接続）
- [ ] RT-05暫定対応（selectedOptionIds ?? selectedValues フォールバック）が維持されている
- [ ] Phase 4の全テスト（CT/UT/IT）がPASS（Green状態）である
- [ ] TypeScript型チェックがエラーなしで通過する（NFR-01）
- [ ] ESLintがエラーなしで通過する（NFR-02）
- [ ] 既存テストにregressionが発生していない
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 6: テスト拡充 → `phase-6-test-expansion.md`
