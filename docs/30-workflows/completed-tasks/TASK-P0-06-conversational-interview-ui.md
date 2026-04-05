# 会話型インタビュー UI - タスク指示書

## メタ情報

```yaml
issue_number: 1889
```

## メタ情報

| 項目         | 値                                                          |
| ------------ | ----------------------------------------------------------- |
| タスクID     | TASK-P0-06                                                  |
| タスク名     | 会話型インタビュー UI                                       |
| 分類         | 新機能（Feature Gap系）                                     |
| 対象機能     | Skill Creator Agent SDK Lane - 会話型インタビューUX         |
| 優先度       | 高                                                          |
| 見積もり規模 | 大規模                                                      |
| ステータス   | 未実施                                                      |
| 発見元       | P0是正パック（ギャップ分析：会話型UXが未完成）              |
| 発見日       | 2026-04-04                                                  |
| Step         | 09（並列実行可能）                                          |
| 依存タスク   | TASK-RT-04（APIキー管理UI）、TASK-RT-05（multi_select追加） |
| 関連未タスク | UT-P0-06-CANONICAL-SYNC-001、UT-P0-06-PHASE11-EVIDENCE-001  |

---

## 1. なぜこのタスクが必要か（Why）

TASK-SDK-SC-02（Conversation UI）にてUIコンポーネントの基礎実装が完了したが、P0是正ギャップ分析の結果、以下が未完成であることが判明している。

**現状の課題**

1. **全 UserInputKind 統合の欠如**: `single_select` / `multi_select` / `free_text` / `confirm` / `secret` の5種類を統合した会話型インタビューフロー全体が動作確認されていない。TASK-SDK-SC-02 では各ウィジェットの骨格を実装したが、エンドツーエンドのフロー接続が未完。
2. **チャット形式 UX の未完成**: 質問→回答→次の質問というチャット形式のメッセージ交換が、WorkflowEngine との実際のIPC接続なしに完結していない。
3. **一時状態管理の未整備**: 会話途中（送信前）の入力値の一時保持が、P0-08（セッション復元）の永続状態と混在するリスクがあり、明確な境界が引かれていない。
4. **インタビュー進捗表示の未統合**: `InterviewProgressBar` コンポーネントは実装済みだが、WorkflowEngine から取得できるステップ情報との正確な接続が未確認。
5. **APIキー未設定時ガイダンスの欠如**: `secret` 種別の質問でAPIキーが未設定の場合、ユーザーをRT-04の設定画面へ誘導するフローが存在しない。

これらが未完成のままでは、ユーザーがSkill Creatorの会話型インタビューを完走できず、スキル作成の主要フローが機能しない。P0是正パックとして最優先で対応すべき項目である。

---

## 2. 何を達成するか（What）

### 2.1 達成目標

- 全5種類の `UserInputKind` を含む会話型インタビューフロー（質問→回答→次の質問）をエンドツーエンドで動作させる
- `WorkflowEngine` からのIPC経由の質問イベントを受信し、UIに反映する
- インタビュー進捗（現在何問目 / 全何問）をリアルタイムで表示する
- APIキー未設定（`secret` 種別）のとき、ユーザーをRT-04設定画面へ誘導するガイダンスを表示する
- undo（前の質問へ戻る）操作が全 InputKind で正しく機能する

### 2.2 非達成目標（スコープ外）

- アプリ再起動をまたぐセッション復元（P0-08の責務）
- `multi_select` の型定義追加（RT-05の責務）
- Verifyエンジン連携UI（RT-03の責務）
- canonical仕様への同期（UT-P0-06-CANONICAL-SYNC-001の責務）
- Phase 11 スクリーンショット取得（UT-P0-06-PHASE11-EVIDENCE-001の責務）

### 2.3 スコープ：P0-06 vs P0-08 の一時状態／永続状態の境界

**この境界の明確化はP0-06実装において最重要の設計判断**である。以下の定義を厳守すること。

| 状態の種類   | 責務タスク | 保持レイヤー           | 保持期間                     | 具体例                                                                |
| ------------ | ---------- | ---------------------- | ---------------------------- | --------------------------------------------------------------------- |
| **一時状態** | **P0-06**  | レンダラープロセス     | ページリロードまで（揮発性） | 現在入力中の回答、selectedOptionIds、textAnswer、validationError など |
| **永続状態** | **P0-08**  | main プロセス + SQLite | アプリ再起動をまたいで永続化 | workflowSnapshot、checkpointId、planId、resume token など             |

**P0-06の責任範囲（レンダラーに閉じた一時状態）**:

- `useInterviewState` フック内の `messages`、`proficiency`、`currentStepIndex`
- フォーム入力値（`selectedOptionId`、`selectedOptionIds`、`textAnswer`、`secretAnswer`、`confirmAnswer`）
- バリデーションエラー（`validationError`）
- 送信中フラグ（`isSubmitting`）
- undo用のメッセージ履歴（`messages` 配列）

**P0-06が触れてはいけない永続状態（P0-08の領域）**:

- `SkillCreatorPersistedWorkflowCheckpoint` への書き込み
- SQLiteを介したセッション保存
- `checkpointId`・`revision`・`lease` の管理
- アプリ再起動後の resume 処理

---

## 3. どのように実行するか（How）

### 3.1 前提条件

以下のタスクが完了していることを確認してから着手すること。

| 依存タスク | 完了確認方法                                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------------------------------- |
| TASK-RT-04 | `apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx` が存在し、動作確認済みであること                |
| TASK-RT-05 | `packages/shared/src/types/skillCreator.ts` に `multi_select` の `selectedOptionIds` が canonical 定義されていること |

**TASK-RT-05が未完了の場合の暫定対応**:
`ConversationalInterview.tsx` の `restoreAnswerInputs` 内でフォールバック処理 `answer.selectedOptionIds ?? answer.selectedValues` を維持しつつ、TODOコメントでRT-05完了後の canonical 化を明記する。

### 3.2 依存タスク

```
TASK-RT-04（APIキー管理UI）
  └─ P0-06: secret種別でAPIキー未設定時のガイダンス表示で参照

TASK-RT-05（multi_select型定義追加）
  └─ P0-06: multi_select の selectedOptionIds canonical 化で参照
```

### 3.3 必要な知識

#### A. Session Bridge 型 と Workflow 型の二重型体系

現在のコードベースには2つの型体系が共存している。実装者はこの二重体系を理解した上で実装すること。

**Session Bridge 型（IPC契約側）**:

- `SkillCreatorWorkflowUiSnapshot`（`packages/shared/src/types/skillCreator.ts`）
- `SkillCreatorUserInputRequest`
- `SkillCreatorUserInputSubmission`
- main プロセス ↔ renderer 間のIPC通信で使用する「外部公開契約」

**Workflow 型（レンダラー内部側）**:

- `InterviewMessage`（`packages/shared/src/types/skillCreator.ts`）
- `InterviewUserAnswer`
- `InterviewState`
- renderer 内部でのみ使用する「UIローカル型」

**型マッピング層の配置**: `ConversationalInterview.tsx`（Organism）内に局所化する。具体的には `buildSubmission()` が `InterviewUserAnswer`（内部型）→ `SkillCreatorUserInputSubmission`（IPC型）への変換を担う。この変換ロジックを外部に漏らさないこと。

#### B. IPC パターン（WorkflowEngine ↔ Renderer）

WorkflowEngineからの質問イベント受信には以下の2パターンが考えられる。実装前に設計を確定させること。

| パターン                 | 概要                                                    | 採用推奨条件                               |
| ------------------------ | ------------------------------------------------------- | ------------------------------------------ |
| **Push（イベント型）**   | main→rendererへのIPC Pushイベントで質問が届く           | WorkflowEngineが非同期で質問を発行する場合 |
| **Pull（ポーリング型）** | renderer が定期的に `workflowSnapshot` をポーリングする | WorkflowEngineが同期的に状態を返す場合     |

現在の実装（`ConversationalInterview.tsx`）は `workflowSnapshot.awaitingUserInput` の変化を `useEffect` で検知する**Pull型**を採用している。Phase 4（IPC設計）でこのパターンの妥当性を検証し、必要であればPush型へ移行すること。

#### C. multi_select「その他（自由入力）」フロー

RT-05完了後に `multi_select` に「その他」選択肢が追加された場合、選択状態が `string[]`（IDリスト）と `string`（自由入力テキスト）の混在になる可能性がある。この状態管理は複雑になるため、RT-05の実装仕様を確認してから対応すること。

### 3.4 推奨アプローチ

1. **最小変更原則**: 既存の `ConversationalInterview.tsx`・`useInterviewState.ts` を破壊的に変更しない。拡張・追加を優先する。
2. **型マッピング層の局所化**: Session Bridge型とWorkflow型の変換は `ConversationalInterview.tsx` 内に閉じ込める。
3. **段階的統合**: まず全InputKindのunit testを書き、次に統合テストで動作を確認する。
4. **APIキーガイダンスの遅延実装**: RT-04との連携は最後に実装する。RT-04が未完了の場合は「設定画面を開く」ボタンを表示するのみとし、実際のナビゲーションはRT-04完了後に接続する。

---

## 4. 実行手順

### Phase 1: canonical仕様確認（30分）

1. `UT-P0-06-CANONICAL-SYNC-001.md` を読み、canonical仕様の現在の状態を把握する
2. `packages/shared/src/types/skillCreator.ts` の以下の型が最新であることを確認する
   - `SkillCreatorUserInputKind`（5種類すべて定義済みか）
   - `InterviewUserAnswer`（`selectedOptionIds` が canonical フィールドか）
   - `SkillCreatorUserInputSubmission`（IPC送信用の型が正しいか）
3. `aiworkflow-requirements` スキルで `task-workflow-backlog.md` を参照し、RT-05の現在ステータスを確認する
4. RT-05未完了の場合: `selectedOptionIds` / `selectedValues` のフォールバック方針を文書化する

**確認コマンド**:

```bash
# UserInputKind の定義確認
grep -n "SkillCreatorUserInputKind\|selectedOptionIds\|selectedValues" \
  packages/shared/src/types/skillCreator.ts

# interview-widgetsの実装確認
ls apps/desktop/src/renderer/components/skill/interview-widgets/
```

**Phase 1完了条件**: 型定義の現状を把握し、RT-05依存箇所を洗い出した上でメモを作成する。

---

### Phase 2: UX設計（1時間）

1. **インタビューフロー全体図の作成**: 以下のフローを図示（テキスト形式可）する

   ```
   [WorkflowEngine] --IPC--> [awaitingUserInput] --> [ConversationalInterview]
       |                                                      |
       |                                           [各種InputWidget]
       |                                                      |
       |                              [handleSubmit] --> [buildSubmission]
       |<------- [skill-creator:submit-user-input] ----------|
   ```

2. **各 InputKind のUX仕様を決定する**:

   | InputKind     | 送信トリガー                           | バリデーション条件          | undo時の復元           |
   | ------------- | -------------------------------------- | --------------------------- | ---------------------- |
   | single_select | チップ選択（即時送信なし）+ 送信ボタン | 選択肢が1つ選ばれていること | 選択状態を復元         |
   | multi_select  | チェックボックス操作 + 送信ボタン      | 1つ以上選択されていること   | 選択状態を復元         |
   | free_text     | Enterキー または 送信ボタン            | 空文字でないこと            | テキスト内容を復元     |
   | secret        | 送信ボタン（Enterは無効化推奨）        | 空文字でないこと            | 空文字（セキュリティ） |
   | confirm       | はい/いいえボタン（即時送信）          | N/A（ボタン押下で確定）     | 選択状態を復元         |

3. **APIキー未設定時ガイダンスのUX仕様を決定する**:
   - `secret` 種別の質問が表示されたとき、RT-04でAPIキーが未設定の場合に警告バナーを表示する
   - バナーには「外部API設定を開く」ボタンを設置し、RT-04の設定パネルへ誘導する
   - APIキー設定完了後にインタビューへ自動復帰する導線を設ける

**Phase 2完了条件**: UXフロー図とInputKind別仕様表が完成している。

---

### Phase 3: 一時状態設計（30分）

1. **P0-06の一時状態一覧を確定する**（レンダラーに閉じた揮発性データ）:

   ```typescript
   // useInterviewState で管理する状態
   - messages: InterviewMessage[]       // チャット履歴（undo用）
   - proficiency: InterviewProficiency  // 初心者/エンジニアモード
   - currentStepIndex: number           // 現在のステップ番号
   - totalSteps: number                 // 総ステップ数

   // ConversationalInterview コンポーネントで管理する状態
   - selectedOptionId: string | null    // single_select の選択値
   - selectedOptionIds: string[]        // multi_select の選択値リスト
   - textAnswer: string                 // free_text の入力値
   - secretAnswer: string               // secret の入力値
   - confirmAnswer: boolean | null      // confirm の選択値
   - validationError: string | null     // バリデーションエラーメッセージ
   - isSubmitting: boolean              // 送信中フラグ
   - restoredPendingRequest: ...        // undo後の復元リクエスト
   ```

2. **P0-08との境界を実装コードで明示する**:
   - `useInterviewState.ts` のファイル先頭にコメントを追加する

   ```typescript
   /**
    * @scope TASK-P0-06: レンダラー内の一時状態のみを管理する。
    * アプリ再起動をまたぐセッション復元はTASK-P0-08（SkillCreatorPersistedWorkflowCheckpoint）が担う。
    * このフックへの永続化ロジックの追加は禁止。
    */
   ```

3. **状態の初期化タイミングを確定する**:
   - `workflowSnapshot` が `null` になった（セッション終了）: `reset()` を呼び出す
   - `awaitingUserInput.requestId` が変化した（新しい質問が届いた）: `resetInputValues()` を呼び出す
   - undo操作: `restoreAnswerInputs()` を呼び出す

**Phase 3完了条件**: 一時状態一覧とP0-08境界コメントが実装コードに反映されている。

---

### Phase 4: IPC設計（1時間）

1. **既存IPC経路を調査する**:

   ```bash
   # IPC チャンネル一覧の確認
   grep -rn "skill-creator" packages/shared/src/ipc/channels.ts | head -30

   # user-input関連のIPC確認
   grep -rn "submit-user-input\|awaitingUserInput\|user-input" \
     apps/desktop/src/main/services/runtime/ --include="*.ts" | head -20
   ```

2. **WorkflowEngine → renderer への質問イベント配信方式を確定する**:
   - 現在の `workflowSnapshot` Pull型（`useEffect`で変化検知）が正常に機能するか検証する
   - `awaitingUserInput` の変化が確実に renderer へ伝播するIPC経路が存在するか確認する
   - Push型（`ipcMain.emit`による主導的通知）が必要な場合は専用チャンネルを設計する

3. **submit-user-input IPC の仕様を確認する**:

   ```typescript
   // 期待するIPC呼び出し形式
   // renderer → main
   window.skillCreatorApi.submitUserInput(submission: SkillCreatorUserInputSubmission): Promise<void>

   // 送信データの構造（packages/shared/src/types/skillCreator.ts）
   interface SkillCreatorUserInputSubmission {
     planId: string;
     requestId: string;
     selectedOptionId?: string;       // single_select
     selectedOptionIds?: string[];    // multi_select (canonical)
     selectedValues?: string[];       // multi_select (backward compat)
     textValue?: string;              // free_text
     secretValue?: string;            // secret
     confirmed?: boolean;             // confirm
   }
   ```

4. **APIキー状態取得のIPC経路を確認する**（RT-04連携用）:
   ```bash
   grep -rn "api-key\|apiKey\|ApiKeyStatus" \
     apps/desktop/src/main/services/ --include="*.ts" | head -20
   ```

**Phase 4完了条件**: IPC経路図とsubmit-user-input仕様が文書化されている。

---

### Phase 5: UI実装（3〜4時間）

#### Step 5-1: `useInterviewState.ts` の拡張

P0-08境界コメントを追加し、必要に応じて以下を拡張する：

```typescript
// apps/desktop/src/renderer/components/skill/hooks/useInterviewState.ts

/**
 * @scope TASK-P0-06: レンダラー内の一時状態のみを管理する。
 * アプリ再起動をまたぐセッション復元はTASK-P0-08（SkillCreatorPersistedWorkflowCheckpoint）が担う。
 * このフックへの永続化ロジックの追加は禁止。
 */
export function useInterviewState(
  initialProficiency: InterviewProficiency = "beginner",
): UseInterviewStateReturn {
  // 既存の実装を維持
  // ...

  // totalSteps の更新ロジックを改善（WorkflowEngineからの estimatedSteps を反映できるよう）
  const syncTotalSteps = useCallback((estimatedSteps: number) => {
    setTotalSteps(estimatedSteps);
  }, []);

  return {
    // 既存のreturn値を維持
    // ...
    syncTotalSteps, // 追加
  };
}
```

#### Step 5-2: `ConversationalInterview.tsx` の完成

以下の未実装・未接続箇所を実装する：

1. **インタビュー進捗の WorkflowEngine との接続**:

   ```typescript
   // workflowSnapshot から estimatedSteps を取得して totalSteps に反映する
   useEffect(() => {
     if (workflowSnapshot?.resumeTokenEnvelope?.artifactCount) {
       interview.syncTotalSteps(
         workflowSnapshot.resumeTokenEnvelope.artifactCount,
       );
     }
   }, [workflowSnapshot?.resumeTokenEnvelope?.artifactCount]);
   ```

2. **APIキー未設定時のガイダンスバナー実装**:

   ```tsx
   // secret種別の質問が来たとき、APIキー状態を確認する
   // ApiKeyStatus が 'not_set' の場合にバナーを表示する
   {
     pendingRequest?.kind === "secret" && apiKeyStatus === "not_set" && (
       <div
         className="mb-3 rounded-lg border border-[var(--status-warning)] bg-[var(--bg-warning-subtle)] px-4 py-3 text-sm"
         data-testid="api-key-guidance-banner"
       >
         <p className="mb-2 text-[var(--text-warning)]">
           外部APIキーが設定されていません
         </p>
         <button
           type="button"
           onClick={onOpenApiKeySettings}
           className="text-[var(--status-primary)] underline hover:no-underline"
         >
           外部API設定を開く
         </button>
       </div>
     );
   }
   ```

3. **Props 拡張**（RT-04との連携用）:
   ```typescript
   export interface ConversationalInterviewProps {
     workflowSnapshot: SkillCreatorWorkflowUiSnapshot | null;
     onSubmit: (submission: SkillCreatorUserInputSubmission) => Promise<void>;
     onError?: (message: string) => void;
     disabled?: boolean;
     // RT-04連携用（TASK-P0-06追加）
     apiKeyStatus?: ApiKeyStatus;
     onOpenApiKeySettings?: () => void;
   }
   ```

#### Step 5-3: `InterviewProgressBar.tsx` の接続確認

既存実装が正常に動作することを確認する：

```bash
# InterviewProgressBar の実装確認
cat apps/desktop/src/renderer/components/skill/InterviewProgressBar.tsx
```

`current` / `total` の Props が正しく渡されているか、表示ロジックが正しいかを検証する。

#### Step 5-4: `SkillCreatorConversationPanel.tsx`（または `SkillLifecyclePanel.tsx`）への統合確認

`ConversationalInterview` コンポーネントが親コンポーネントに正しく組み込まれているかを確認する：

```bash
grep -rn "ConversationalInterview" \
  apps/desktop/src/renderer/components/skill/ --include="*.tsx"
```

**Phase 5完了条件**: 全InputKindが動作し、ガイダンスバナーが表示される。

---

### Phase 6: 統合テスト（2時間）

#### Step 6-1: ユニットテスト

`apps/desktop/src/renderer/components/skill/__tests__/` に以下のテストを作成・更新する：

```typescript
// ConversationalInterview.test.tsx（新規または更新）
describe("ConversationalInterview", () => {
  // 全InputKindのレンダリングテスト
  it("single_select: 選択肢チップが表示され、選択後に送信できる");
  it("multi_select: チェックボックスが表示され、複数選択後に送信できる");
  it("free_text: テキスト入力が表示され、送信できる");
  it("secret: パスワード入力が表示され、送信できる");
  it("confirm: はい/いいえボタンが表示され、即時送信される");

  // undo テスト
  it("undo: 前の質問へ戻り、以前の回答が復元される");
  it("single_select undo: 選択状態が復元される");
  it("multi_select undo: 複数選択状態が復元される");
  it("free_text undo: テキストが復元される");
  it("confirm undo: 選択状態が復元される");
  it("secret undo: 空文字で復元される（セキュリティ）");

  // APIキーガイダンステスト
  it("secret種別でapiKeyStatus=not_setの場合、ガイダンスバナーが表示される");
  it(
    "ガイダンスバナーの「外部API設定を開く」クリックでonOpenApiKeySettingsが呼ばれる",
  );

  // 進捗バーテスト
  it("currentStepIndexとtotalStepsが正しく進捗バーに反映される");
});
```

```typescript
// useInterviewState.test.ts（新規または更新）
describe("useInterviewState", () => {
  it("addAssistantMessage: 同一requestIdのメッセージは重複追加されない");
  it("undo: lastUserMessage と対応するassistantMessageが正しく返される");
  it("rollbackLastUserMessage: 送信失敗時にuserメッセージが削除される");
  it("buildSubmission: multi_select で selectedOptionIds が正しく設定される");
  it(
    "buildSubmission: multi_select で selectedValues が後方互換フォールバックとして動作する",
  );
  it("reset: messagesとtotalStepsが初期化される");
});
```

#### Step 6-2: 手動テスト（Electronアプリ起動）

```bash
# Electronアプリを起動
pnpm --filter @repo/desktop dev
```

以下のシナリオを手動で確認する：

| シナリオ                    | 確認内容                                                   |
| --------------------------- | ---------------------------------------------------------- |
| 初期表示                    | 最初の質問がアシスタントメッセージとして表示される         |
| single_select操作           | チップ選択→送信→次の質問が追加される                       |
| multi_select操作            | 複数チェック→送信→選択ラベルがユーザーメッセージとして表示 |
| free_text操作               | テキスト入力→Enter/送信→次の質問が表示される               |
| secret操作                  | パスワード入力→マスク表示（●●●●）でユーザーメッセージ表示  |
| confirm操作                 | はい/いいえボタン押下で即時送信される                      |
| undo操作                    | 「← 戻る」クリックで前の質問に戻り、以前の回答状態が復元   |
| APIキー未設定+secret種別    | ガイダンスバナーが表示される                               |
| バリデーション              | 未入力で送信試行するとエラーメッセージが表示される         |
| 進捗バー                    | 質問が進むごとにプログレスバーが更新される                 |
| 初心者/エンジニアモード切替 | プレースホルダーテキストの表示/非表示が切り替わる          |

**Phase 6完了条件**: ユニットテストが全PASS、手動テストシナリオが全て確認済み。

---

### Phase 7: 完了処理（30分）

1. **TypeScript型チェックの実行**:

   ```bash
   pnpm --filter @repo/desktop typecheck
   ```

2. **Lintの実行**:

   ```bash
   pnpm --filter @repo/desktop lint
   ```

3. **関連テストの実行**:

   ```bash
   pnpm --filter @repo/desktop test -- --testPathPattern="skill/ConversationalInterview|useInterviewState"
   ```

4. **UT-P0-06-PHASE11-EVIDENCE-001 への引き継ぎ**: Phase 6の手動テストで取得したスクリーンショットを `UT-P0-06-PHASE11-EVIDENCE-001.md` の手順に従って保存する。

5. **UT-P0-06-CANONICAL-SYNC-001 への引き継ぎ**: 実装で確定したフィールド名（特に `selectedOptionIds`）を `UT-P0-06-CANONICAL-SYNC-001.md` の実行者へ伝達する。

**Phase 7完了条件**: lint/typecheck/testが全PASS、後続未タスクへの引き継ぎ情報が整理されている。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `single_select`: 選択肢チップが表示され、選択後に送信できる
- [ ] `multi_select`: チェックボックスが表示され、複数選択後に送信できる（RT-05依存箇所は TODO コメントで明記）
- [ ] `free_text`: テキスト入力フィールドが表示され、Enterまたは送信ボタンで送信できる
- [ ] `secret`: パスワード入力フィールドが表示され、送信後に `●●●●●●` でマスク表示される
- [ ] `confirm`: はい/いいえボタンが表示され、押下で即時送信される
- [ ] undo（← 戻る）操作で前の質問へ戻り、以前の回答値が復元される（`secret` は空文字で復元）
- [ ] インタビュー進捗（ステップ番号/総ステップ数）が `InterviewProgressBar` に正しく表示される
- [ ] `secret` 種別 + `apiKeyStatus === "not_set"` の組み合わせでガイダンスバナーが表示される
- [ ] ガイダンスバナーの「外部API設定を開く」ボタンで `onOpenApiKeySettings` が呼び出される
- [ ] バリデーションエラーが `role="alert"` で表示される（アクセシビリティ要件）
- [ ] チャット履歴エリアに新しいメッセージが追加されると自動スクロールする
- [ ] 送信中（`isSubmitting === true`）は送信ボタンが無効化される

### 設計要件

- [ ] `useInterviewState.ts` ファイル先頭に P0-06/P0-08 スコープ境界コメントが追加されている
- [ ] Session Bridge型（IPC型）とWorkflow型（UIローカル型）の変換が `ConversationalInterview.tsx` 内に閉じ込められている
- [ ] `useInterviewState.ts` への永続化ロジックが混入していない
- [ ] RT-05依存の `multi_select` 処理に TODO コメントが付いている（RT-05完了後に canonical 化）

### 品質要件

- [ ] TypeScript strict mode でエラーがない（`pnpm --filter @repo/desktop typecheck` PASS）
- [ ] ESLint エラーがない（`pnpm --filter @repo/desktop lint` PASS）
- [ ] ユニットテストが全PASS（各 InputKind のレンダリング、送信、undo、バリデーション）
- [ ] `data-testid` 属性が主要要素に付与されている（`conversational-interview`、`interview-chat-area`、`interview-input-area`、`interview-submit`、`interview-undo`、`validation-error`、`api-key-guidance-banner`）

---

## 6. 検証方法

### 自動検証

```bash
# TypeScript型チェック
pnpm --filter @repo/desktop typecheck

# ESLint
pnpm --filter @repo/desktop lint

# ユニットテスト（ConversationalInterview関連）
pnpm --filter @repo/desktop test -- --testPathPattern="skill/(ConversationalInterview|useInterviewState|interview-widgets)"

# 全テスト
pnpm --filter @repo/desktop test
```

### 手動検証

```bash
# Electronアプリ起動
pnpm --filter @repo/desktop dev
```

手動テストは Phase 6 Step 6-2 のシナリオ表に従って実施すること。

### 統合検証コマンド

```bash
# SkillCreatorConversationPanel が ConversationalInterview を正しく使用しているか確認
grep -n "ConversationalInterview\|workflowSnapshot\|onSubmit\|apiKeyStatus" \
  apps/desktop/src/renderer/components/skill/SkillCreatorConversationPanel.tsx

# IPC submit-user-input の接続確認
grep -rn "submit-user-input\|submitUserInput" \
  apps/desktop/src/ --include="*.ts" --include="*.tsx"

# P0-08境界コメントの存在確認
grep -n "TASK-P0-06\|TASK-P0-08\|永続化ロジック" \
  apps/desktop/src/renderer/components/skill/hooks/useInterviewState.ts
```

---

## 7. リスクと対策

| リスク                                                | 発生確率 | 影響度 | 対策                                                                                                   |
| ----------------------------------------------------- | -------- | ------ | ------------------------------------------------------------------------------------------------------ |
| RT-05未完了によるmulti_select動作不備                 | 中       | 中     | `selectedOptionIds ?? selectedValues` フォールバックを維持し、TODOコメントで明記する                   |
| WorkflowEngine側のIPC経路が未整備でsnapshotが届かない | 低       | 高     | Phase 4でIPC経路を事前調査し、未整備の場合はモックスナップショットで開発を進める                       |
| P0-06とP0-08の一時状態/永続状態の混入                 | 中       | 高     | Phase 3で境界を文書化し、`useInterviewState.ts` にスコープコメントを追加する。コードレビューで確認する |
| multi_select「その他（自由入力）」の状態管理の複雑化  | 低       | 中     | RT-05実装仕様を確認し、「その他」フローが必要な場合は別タスクとして切り出す                            |
| secret種別のundoでAPIキー値が復元されてしまう         | 低       | 高     | `restoreAnswerInputs` の `secret` ケースは空文字で復元する（現在の実装通り）。テストで確認する         |
| Electronアプリが起動せずPhase 6の手動テストが不可能   | 低       | 中     | `pnpm --filter @repo/desktop build` を事前に実行してエラーを確認する                                   |

---

## 8. 参照情報

### 関連ファイル（実装対象）

| ファイル                                                                       | 役割                                                 |
| ------------------------------------------------------------------------------ | ---------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`       | メインの会話型インタビューコンポーネント（拡張対象） |
| `apps/desktop/src/renderer/components/skill/hooks/useInterviewState.ts`        | インタビュー一時状態管理フック（拡張対象）           |
| `apps/desktop/src/renderer/components/skill/InterviewProgressBar.tsx`          | 進捗バーコンポーネント（接続確認）                   |
| `apps/desktop/src/renderer/components/skill/interview-widgets/`                | InputKind別ウィジェット群（動作確認）                |
| `apps/desktop/src/renderer/components/skill/SkillCreatorConversationPanel.tsx` | ConversationalInterviewを内包する親コンポーネント    |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`           | スキル作成ライフサイクルUIのトップレベル             |
| `packages/shared/src/types/skillCreator.ts`                                    | 共有型定義（変更禁止、参照のみ）                     |

### 苦戦箇所の詳細

#### 苦戦箇所 1: Session Bridge型とWorkflow型の二重型体系

**問題**: mainプロセスとrenderer間のIPC契約（Session Bridge型）と、renderer内部のUI状態（Workflow型）が分離されているが、変換レイヤーをどこに置くかが不明確。

**解決策**: `ConversationalInterview.tsx`（Organism）に型マッピング層を局所化する。

- `SkillCreatorUserInputRequest`（Session Bridge型）→ `InterviewMessage`（Workflow型）への変換は `addAssistantMessage()` が担う
- `InterviewUserAnswer`（Workflow型）→ `SkillCreatorUserInputSubmission`（Session Bridge型）への変換は `buildSubmission()` が担う
- この変換ロジックを Atom/Molecule レベルのコンポーネントやフックに漏らさないこと

**具体的な変換箇所**:

```typescript
// Organism（ConversationalInterview.tsx）内に閉じ込める変換
// Session Bridge型 → Workflow型
addAssistantMessage(request: SkillCreatorUserInputRequest): void
// Workflow型 → Session Bridge型
buildSubmission(snapshot, answer: InterviewUserAnswer): SkillCreatorUserInputSubmission
```

#### 苦戦箇所 2: P0-06 / P0-08 の状態分離

**問題**: 会話途中の一時状態をどのレイヤーに置くか、P0-06とP0-08の責務境界が実装コードレベルで明確でない。

**解決策**:

- **P0-06**（本タスク）: `useInterviewState.ts` と `ConversationalInterview.tsx` の `useState` は全て揮発性の一時状態のみを保持する。`localStorage` / SQLite / IPCを介した永続化を一切行わない。
- **P0-08**（別タスク）: `SkillCreatorPersistedWorkflowCheckpoint` への書き込み、SQLiteを介したsession保存、resume token管理はP0-08が担う。
- 実装コードの境界: `useInterviewState.ts` のファイル先頭コメントで明示する。

**P0-06実装者が犯しやすいミス**: `workflowSnapshot` の内容（`planId`、`resumeTokenEnvelope` など）をlocalStorageに保存しようとすること。これはP0-08の領域であり、P0-06では行ってはいけない。

#### 苦戦箇所 3: multi_select の「その他（自由入力）」フローの状態管理

**問題**: RT-05でmulti_selectに「その他（自由入力）」選択肢が追加された場合、`string[]`（IDリスト）と `string`（自由入力テキスト）の混在状態が発生する。

**解決策**: RT-05の実装完了後に `packages/shared/src/types/skillCreator.ts` の最新型定義を確認し、`InterviewUserAnswer.selectedOptionIds` と `selectedValues` の正確な使い分けを決定する。RT-05実装前は既存のフォールバック処理 `selectedOptionIds ?? selectedValues` を維持する。

#### 苦戦箇所 4: WorkflowEngineからのIPC同期/非同期の選択

**問題**: WorkflowEngineが質問を発行するタイミングとrendererの `useEffect` によるスナップショット変化検知のタイミングが合わない可能性がある。

**解決策**: Phase 4でIPC経路を調査する。Pull型（ポーリング）で問題がある場合は、`ipcMain.emit` による Push型への切り替えを検討する。Push型の場合は `ipcRenderer.on('skill-creator:user-input-request', ...)` で受け取り、`setRestoredPendingRequest` 相当の処理を行う。

### 関連未タスク

| 未タスクID                    | 関係                                                                      |
| ----------------------------- | ------------------------------------------------------------------------- |
| UT-P0-06-CANONICAL-SYNC-001   | P0-06実装完了後に `aiworkflow-requirements` 仕様文書を同期する            |
| UT-P0-06-PHASE11-EVIDENCE-001 | P0-06完了後にElectronアプリでスクリーンショットを取得しPhase 11を完了する |

---

## 9. 備考

### 実装上の注意事項

1. **`pnpm` のみ使用**: このプロジェクトでは `npm` / `yarn` は禁止。`pnpm --filter @repo/desktop <command>` の形式でコマンドを実行すること。

2. **`--no-verify` 禁止**: `git commit --no-verify` は絶対に使用しないこと（プロジェクトポリシー）。

3. **RT-05との協調**: RT-05が未完了の場合、`multi_select` の `selectedOptionIds` / `selectedValues` のフォールバック処理を削除しないこと。RT-05完了後に canonical 化の TODO コメントに従って対応する。

4. **`any` 型の禁止**: TypeScript strict mode を維持し、`any` 型の使用を避けること。

### 後続タスクへの引き継ぎ事項

| 後続タスク                    | 引き継ぎ内容                                                                                               |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------- |
| UT-P0-06-PHASE11-EVIDENCE-001 | Phase 6 Step 6-2の手動テストシナリオを実施し、スクリーンショットを取得する                                 |
| UT-P0-06-CANONICAL-SYNC-001   | 確定した `selectedOptionIds` canonical 定義を `aiworkflow-requirements` へ同期する                         |
| TASK-P0-08                    | P0-06で一時状態を管理するフック（useInterviewState）と永続化の責務分離が完了している前提で実装する         |
| TASK-RT-05                    | P0-06実装中に `TODO: RT-05完了後に selectedOptionIds canonical 化` コメントを付けた箇所を canonical 化する |
