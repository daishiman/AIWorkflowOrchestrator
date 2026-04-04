# セッション復元のレンダラー統合 - タスク指示書

## メタ情報

```yaml
issue_number: 1893
```

## メタ情報

| 項目         | 値                                                                         |
| ------------ | -------------------------------------------------------------------------- |
| タスクID     | TASK-P0-08                                                                 |
| タスク名     | セッション復元のレンダラー統合                                             |
| 分類         | 新機能（Feature Gap系）                                                    |
| 対象機能     | Skill Creator Agent SDK Lane - セッション復元UI                            |
| 優先度       | 中                                                                         |
| 見積もり規模 | 中規模                                                                     |
| ステータス   | 未実施                                                                     |
| 発見元       | P0是正パック（ギャップ分析）                                               |
| 発見日       | 2026-04-04                                                                 |
| Step         | 10（RT-06 / TASK-SDK-08後に直列実行）                                      |
| 依存タスク   | TASK-RT-06（SDKメッセージ契約正規化）、TASK-SDK-08（セッション永続化基盤） |
| 関連未タスク | UT-P0-08-PHASE11-SCREENSHOT-EVIDENCE-001                                   |

---

## 1. なぜこのタスクが必要か（Why）

TASK-SDK-08（セッション永続化基盤）でmain側APIが完成しているが、P0是正ギャップ分析の結果、以下が未完成であることが判明している。

**現状の課題**

1. **セッション復元UIの未実装**: アプリ再起動後にユーザーが未完了セッションを検出し、中断地点から再開するためのUI（再開ダイアログ・セッション一覧・復元ボタン）が存在しない。
2. **IPCラッパーの未実装**: TASK-SDK-08で整備されたmain側セッション管理API（`RuntimeSkillCreatorFacade`）をrenderer側へIPC経由で公開するラッパーが未実装である。
3. **ユーザー体験の断絶**: スキル作成の途中でアプリを終了しても、再起動後に中断地点から再開できず、最初からやり直しになる。
4. **P0-06/P0-08の責務境界の不明確さ**: P0-06（会話型インタビューUI）が管理する「揮発性の一時状態」と、P0-08（セッション復元）が管理する「SQLite等への永続状態」の境界が実装コードレベルで明示されていない。

これらが未完成のままでは、ユーザーがSkill Creatorを途中まで進めてアプリを閉じた際に、作業内容が失われてしまう。P0是正パックとして対応すべき項目である。

---

## 2. 何を達成するか（What）

### 2.1 達成目標

- アプリ起動時に未完了セッションを自動検出し、復元プロンプト（`SessionResumePrompt`）をユーザーに提示する
- ユーザーが復元を選択した場合、中断地点から会話を再開できる
- ユーザーがスキップを選択した場合、新規セッションを開始できる
- アクティブなセッションの状態（session_id・経過時間）を `SessionIndicator` コンポーネントで表示する
- 期限切れセッションをクリーンアップするIPC経路を提供する

### 2.2 非達成目標（スコープ外）

- セッション永続化基盤の再実装（TASK-SDK-08で完了済み）
- 会話型インタビューUIの一時状態管理（TASK-P0-06の責務）
- SDKメッセージ契約の正規化（TASK-RT-06の責務）
- Phase 11スクリーンショット取得（UT-P0-08-PHASE11-SCREENSHOT-EVIDENCE-001の責務）

### 2.3 スコープ：P0-06の一時状態 vs P0-08の永続状態の境界

**この境界の明確化はP0-08実装において最重要の設計判断**である。以下の定義を厳守すること。

| 状態の種類   | 責務タスク | 保持レイヤー                 | 保持期間                     | 具体例                                                                                       |
| ------------ | ---------- | ---------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------- |
| **一時状態** | **P0-06**  | レンダラープロセス（メモリ） | ページリロードまで（揮発性） | messages、proficiency、currentStepIndex、selectedOptionIds、textAnswer、validationError など |
| **永続状態** | **P0-08**  | mainプロセス + SQLite        | アプリ再起動をまたいで永続化 | workflowSnapshot、checkpointId、planId、session_id、resume token など                        |

**P0-08の責任範囲（mainプロセス + SQLiteに閉じた永続状態）**:

- `SkillCreatorPersistedWorkflowCheckpoint` への書き込み・読み込み
- `session_id` の永続化と SDK `resume` / `continue` 入力への再利用
- `sourceRoot` / `manifestHash` / `resolvedSkillPath` による復元互換性判定
- 期限切れセッションのTTL管理とクリーンアップ
- セッション一覧・詳細のIPC経由公開

**P0-08が触れてはいけない一時状態（P0-06の領域）**:

- `useInterviewState` フック内の `messages`、`proficiency`、`currentStepIndex`
- フォーム入力値（`selectedOptionId`、`selectedOptionIds`、`textAnswer`、`secretAnswer`、`confirmAnswer`）
- バリデーションエラー（`validationError`）
- 送信中フラグ（`isSubmitting`）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

以下のタスクが完了していることを確認してから着手すること。

| 依存タスク  | 完了確認方法                                                                                                                                          |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-RT-06  | `packages/shared/src/ipc/channels.ts` に `session_id` 正規化済みのメッセージ契約が定義されていること                                                  |
| TASK-SDK-08 | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` にセッション一覧取得・詳細取得・復元・削除のAPIが存在し、動作確認済みであること |

**確認コマンド**:

```bash
# TASK-RT-06 完了確認
grep -n "session_id\|sessionId" packages/shared/src/ipc/channels.ts

# TASK-SDK-08 完了確認（Facade にセッション管理メソッドが存在するか）
grep -n "listSessions\|resumeSession\|deleteSession\|getSessionDetail" \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
```

**TASK-SDK-08が未完了の場合の対処**: 本タスクは着手せずに待機する。TASK-SDK-08のmain側APIが存在しない状態でIPCラッパーを実装しても意味がない。

### 3.2 設計方針：薄いIPCラッパー原則

本タスクの本質は「TASK-SDK-08のmain側APIをIPC経由で公開する薄いラッパー」である。

**薄いラッパーとは**:

- main側のビジネスロジック（セッション管理・互換性判定・TTL管理）を**再実装しない**
- `RuntimeSkillCreatorFacade` の既存メソッドを`ipcMain.handle`でラップして公開するだけ
- renderer側は`SessionResumePrompt` / `SessionIndicator`のUIコンポーネントに徹し、データ取得はすべてIPC経由

**薄いラッパーとして禁止される実装**:

```typescript
// 禁止: renderer側でセッション状態をlocalStorageに保存する
localStorage.setItem('skillCreatorSession', JSON.stringify(session));

// 禁止: renderer側で独自のセッション互換性判定を行う
const isCompatible = session.manifestHash === currentManifestHash;

// 禁止: main側のセッション管理ロジックをIPC handler内に書く
ipcMain.handle('skill-creator:list-sessions', async (event) => {
  const sessions = await db.query(...); // Facade を経由せずに直接DBアクセス
});
```

### 3.3 依存タスクの関係

```
TASK-RT-06（SDKメッセージ契約正規化）
  └─ P0-08: session_id のIPC契約に影響（RT-06完了後に命名を確定する）

TASK-SDK-08（セッション永続化基盤）
  └─ P0-08: RuntimeSkillCreatorFacade のAPIをIPCラッパーで公開する基礎
```

### 3.4 実装対象ファイル一覧

| ファイルパス                                                                      | 役割                                       | 操作 |
| --------------------------------------------------------------------------------- | ------------------------------------------ | ---- |
| `apps/desktop/src/main/ipc/index.ts`                                              | IPCハンドラー登録                          | 追加 |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`             | セッション管理Facade（参照のみ）           | 参照 |
| `apps/desktop/src/renderer/preload/skill-api.ts`（または対応するpreloadファイル） | renderer向けpreload API追加                | 追加 |
| `packages/shared/src/ipc/channels.ts`                                             | IPCチャンネル名定義（参照・追加）          | 追加 |
| `packages/shared/src/types/skillCreator.ts`                                       | セッション型定義（参照・必要に応じて追加） | 参照 |
| `apps/desktop/src/renderer/components/skill/SessionResumePrompt.tsx`              | セッション復元プロンプトUIコンポーネント   | 新規 |
| `apps/desktop/src/renderer/components/skill/SessionIndicator.tsx`                 | アクティブセッション表示コンポーネント     | 新規 |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`              | 復元フローの統合（既存ファイルに追加）     | 修正 |

---

## 4. 実行手順

### Phase 1: TASK-SDK-08 API確認（30分）

1. **`RuntimeSkillCreatorFacade.ts` のセッション管理APIを調査する**:

   ```bash
   grep -n "Session\|session\|checkpoint\|resume\|persist" \
     apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts | head -40
   ```

2. **既存セッション関連型定義を確認する**:

   ```bash
   grep -n "Session\|Checkpoint\|ResumeToken\|session_id" \
     packages/shared/src/types/skillCreator.ts | head -30
   ```

3. **既存のIPCチャンネル命名を確認する**:

   ```bash
   grep -n "skill-creator" packages/shared/src/ipc/channels.ts | head -20
   ```

4. **TASK-RT-06の`session_id`契約を確認する**:

   ```bash
   grep -n "session_id\|sessionId" \
     packages/shared/src/ipc/channels.ts \
     packages/shared/src/types/skillCreator.ts
   ```

5. **`SessionResumePrompt.tsx` / `SessionIndicator.tsx` の既存実装を確認する**:

   ```bash
   ls apps/desktop/src/renderer/components/skill/ | grep -i "session"
   # 存在する場合は実装内容を確認し、重複実装を防ぐ
   ```

**Phase 1完了条件**: TASK-SDK-08のAPI仕様・既存型定義・IPCチャンネル命名を把握した上でメモを作成する。

---

### Phase 2: IPC薄ラッパー設計（1時間）

1. **公開するIPCチャンネルを設計する**:

   | チャンネル名（仮）                       | 方向            | 説明                         |
   | ---------------------------------------- | --------------- | ---------------------------- |
   | `skill-creator:list-sessions`            | renderer → main | 未完了セッション一覧を取得   |
   | `skill-creator:get-session-detail`       | renderer → main | セッション詳細を取得         |
   | `skill-creator:resume-session`           | renderer → main | セッションを復元して再開     |
   | `skill-creator:delete-session`           | renderer → main | セッションを削除（スキップ） |
   | `skill-creator:cleanup-expired-sessions` | renderer → main | 期限切れセッションを一括削除 |

   **命名規則**: TASK-RT-06完了後の `channels.ts` に定義された命名規則に従うこと。

2. **型定義を設計する**:

   ```typescript
   // renderer側からIPCで受け取るセッション情報の型
   // packages/shared/src/types/skillCreator.ts に追加（または既存型を確認）

   interface SkillCreatorSessionSummary {
     sessionId: string;
     skillName: string;
     lastActivityAt: string; // ISO 8601
     stepProgress: { current: number; total: number };
     isCompatible: boolean; // 現在のmanifestと互換性があるか
   }

   interface SkillCreatorSessionResumeResult {
     success: boolean;
     workflowSnapshot?: SkillCreatorWorkflowUiSnapshot;
     errorReason?: "incompatible" | "expired" | "not_found";
   }
   ```

3. **preload APIのインターフェースを設計する**:

   ```typescript
   // renderer側から呼び出すAPI（contextBridge経由）
   interface SkillCreatorSessionApi {
     listSessions(): Promise<SkillCreatorSessionSummary[]>;
     resumeSession(sessionId: string): Promise<SkillCreatorSessionResumeResult>;
     deleteSession(sessionId: string): Promise<void>;
     cleanupExpiredSessions(): Promise<number>; // 削除件数を返す
   }
   ```

**Phase 2完了条件**: IPCチャンネル名・型定義・preload APIのインターフェース設計が文書化されている。

---

### Phase 3: Main側実装（2時間）

#### Step 3-1: IPCチャンネル名の追加

`packages/shared/src/ipc/channels.ts` に以下を追加する（既存命名規則に従う）:

```typescript
// セッション復元関連チャンネル（TASK-P0-08追加）
export const SKILL_CREATOR_LIST_SESSIONS =
  "skill-creator:list-sessions" as const;
export const SKILL_CREATOR_RESUME_SESSION =
  "skill-creator:resume-session" as const;
export const SKILL_CREATOR_DELETE_SESSION =
  "skill-creator:delete-session" as const;
export const SKILL_CREATOR_CLEANUP_SESSIONS =
  "skill-creator:cleanup-expired-sessions" as const;
```

**注意**: TASK-RT-06で既にチャンネル名が定義されている場合は再定義しない。

#### Step 3-2: IPCハンドラーの追加

`apps/desktop/src/main/ipc/index.ts` に以下を追加する（薄いラッパー原則を遵守）:

```typescript
// セッション復元IPC（TASK-P0-08追加）
// 注意: ビジネスロジックはすべてRuntimeSkillCreatorFacadeに委譲する

ipcMain.handle(SKILL_CREATOR_LIST_SESSIONS, async (_event) => {
  return facade.listSessions();
});

ipcMain.handle(
  SKILL_CREATOR_RESUME_SESSION,
  async (_event, sessionId: string) => {
    return facade.resumeSession(sessionId);
  },
);

ipcMain.handle(
  SKILL_CREATOR_DELETE_SESSION,
  async (_event, sessionId: string) => {
    return facade.deleteSession(sessionId);
  },
);

ipcMain.handle(SKILL_CREATOR_CLEANUP_SESSIONS, async (_event) => {
  return facade.cleanupExpiredSessions();
});
```

#### Step 3-3: preload APIの追加

contextBridge経由でrenderer側に公開する:

```typescript
// apps/desktop/src/renderer/preload/skill-api.ts（または既存preloadファイル）
contextBridge.exposeInMainWorld("skillCreatorSessionApi", {
  listSessions: () => ipcRenderer.invoke(SKILL_CREATOR_LIST_SESSIONS),
  resumeSession: (sessionId: string) =>
    ipcRenderer.invoke(SKILL_CREATOR_RESUME_SESSION, sessionId),
  deleteSession: (sessionId: string) =>
    ipcRenderer.invoke(SKILL_CREATOR_DELETE_SESSION, sessionId),
  cleanupExpiredSessions: () =>
    ipcRenderer.invoke(SKILL_CREATOR_CLEANUP_SESSIONS),
});
```

**Phase 3完了条件**: TypeScript型チェックが通り、IPCハンドラーがFacadeのメソッドを呼び出せること。

---

### Phase 4: Renderer UI実装（3〜4時間）

#### Step 4-1: `SessionResumePrompt.tsx` の実装

未完了セッションが存在する場合にアプリ起動時に表示されるプロンプト:

```tsx
// apps/desktop/src/renderer/components/skill/SessionResumePrompt.tsx

/**
 * @scope TASK-P0-08: セッション復元ダイアログ
 * - IPC経由でセッション一覧を取得し、復元または新規開始を選択させる
 * - セッションの一時状態（会話途中の入力値）は管理しない（TASK-P0-06の責務）
 */

export interface SessionResumePromptProps {
  sessions: SkillCreatorSessionSummary[];
  onResume: (sessionId: string) => Promise<void>;
  onSkip: (sessionId: string) => Promise<void>;
  onStartNew: () => void;
  isLoading?: boolean;
}

// 表示内容:
// - セッション名（skillName）
// - 最終更新日時（lastActivityAt を相対時間で表示: "3時間前"）
// - 進捗（stepProgress.current / stepProgress.total）
// - 互換性警告（isCompatible === false の場合）
// - 「続きから再開」ボタン（onResume）
// - 「削除して新規開始」ボタン（onSkip）

// data-testid 属性（必須）:
// data-testid="session-resume-prompt"
// data-testid="session-list"
// data-testid="session-item-{sessionId}"
// data-testid="session-resume-btn-{sessionId}"
// data-testid="session-skip-btn-{sessionId}"
// data-testid="session-incompatible-warning"
// data-testid="session-start-new-btn"
```

#### Step 4-2: `SessionIndicator.tsx` の実装

スキル作成セッションがアクティブな場合に表示されるインジケーター:

```tsx
// apps/desktop/src/renderer/components/skill/SessionIndicator.tsx

/**
 * @scope TASK-P0-08: アクティブセッション表示
 * - セッションのIDと経過時間を表示する
 * - アクティブ状態をpulseアニメーションで示す
 */

export interface SessionIndicatorProps {
  sessionId: string;
  startedAt: string; // ISO 8601
  isActive: boolean;
}

// data-testid 属性（必須）:
// data-testid="session-indicator"
// data-testid="session-indicator-pulse"  // pulseアニメーション要素
// data-testid="session-id-display"
// data-testid="session-elapsed-time"
```

#### Step 4-3: `SkillLifecyclePanel.tsx` への統合

アプリ起動時のセッション検出フローを統合する:

```tsx
// apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx（修正）

// 追加するロジック:
// 1. useEffect でアプリ起動時にlistSessions()を呼び出す
// 2. 未完了セッションが存在する場合にSessionResumePromptを表示する
// 3. resumeSession()が成功した場合に会話を継続する
// 4. スキップの場合はdeleteSession()を呼び出して新規開始する

useEffect(() => {
  const detectSessions = async () => {
    const sessions = await window.skillCreatorSessionApi.listSessions();
    if (sessions.length > 0) {
      setResumableSessions(sessions);
      setShowResumePrompt(true);
    }
  };
  detectSessions();
}, []); // アプリ起動時のみ実行
```

**Phase 4完了条件**: `SessionResumePrompt` と `SessionIndicator` が表示され、復元フローがエンドツーエンドで動作すること。

---

### Phase 5: テスト（2時間）

#### Step 5-1: ユニットテスト

```typescript
// apps/desktop/src/renderer/components/skill/__tests__/SessionResumePrompt.test.tsx

describe("SessionResumePrompt", () => {
  it("セッション一覧が表示される");
  it("互換性なしのセッションに警告バッジが表示される");
  it("「続きから再開」クリックでonResumeが呼ばれる");
  it("「削除して新規開始」クリックでonSkipが呼ばれる");
  it("セッションが0件のとき非表示になる（isCompatible: hidden相当）");
  it("isLoadingがtrueのときローディング状態が表示される");
  it("resumeSession失敗時にエラーバナーが表示される");
});

describe("SessionIndicator", () => {
  it("セッションIDと経過時間が表示される");
  it("isActive=trueのとき pulse アニメーションが適用される");
  it("isActive=falseのとき pulse アニメーションが適用されない");
});
```

#### Step 5-2: IPCハンドラーの統合テスト

```typescript
// apps/desktop/src/__tests__/session-resume-ipc.test.ts

describe("Session Resume IPC", () => {
  it("AC-1: 未完了検出時に復元プロンプトが表示される");
  it("AC-2: 復元選択でsession継続（session_idが再利用される）");
  it("AC-3: スキップ選択で新規開始");
  it("AC-4: SessionIndicatorにsession_idと経過時間が表示される");
  it("AC-5: 期限切れセッションが削除される（cleanupExpiredSessions）");
  it("AC-6: session_idがSDK入力へ正しく再利用される");
  it("AC-7: 互換性差分時に新規へフォールバックする");
  it("AC-8: IPC経由でセッション一覧・詳細が取得できる");
});
```

#### Step 5-3: 手動テスト（Electronアプリ起動）

```bash
pnpm --filter @repo/desktop dev
```

以下のシナリオを確認する:

| TC    | シナリオ                             | 確認内容                                                       |
| ----- | ------------------------------------ | -------------------------------------------------------------- |
| TC-01 | セッションなしの初期状態             | SessionResumePromptが表示されない（非表示）                    |
| TC-02 | セッションなし（ダークテーマ）       | 同上（ダークテーマで確認）                                     |
| TC-03 | 複数の未完了セッションが存在する場合 | SessionResumePromptに全セッションが一覧表示される              |
| TC-04 | セッション0件                        | プロンプトが非表示になることを確認                             |
| TC-05 | resumeSession失敗                    | エラーバナーが表示される（`SkillLifecyclePanel` のエラー表示） |
| TC-06 | SessionIndicator active状態          | pulseアニメーションで表示される                                |

**Phase 5完了条件**: ユニットテストが全PASS、手動テストTC-01〜TC-06が確認済み。

---

### Phase 6: 完了処理（30分）

1. **TypeScript型チェックの実行**:

   ```bash
   pnpm --filter @repo/desktop typecheck
   pnpm --filter @repo/shared typecheck
   ```

2. **Lintの実行**:

   ```bash
   pnpm --filter @repo/desktop lint
   ```

3. **関連テストの実行**:

   ```bash
   pnpm --filter @repo/desktop test -- --testPathPattern="session-resume|SessionResume|SessionIndicator"
   ```

4. **P0-06境界コメントの確認**: `useInterviewState.ts` に P0-06/P0-08スコープ境界コメントが存在することを確認する:

   ```bash
   grep -n "TASK-P0-06\|TASK-P0-08" \
     apps/desktop/src/renderer/components/skill/hooks/useInterviewState.ts
   ```

5. **UT-P0-08-PHASE11-SCREENSHOT-EVIDENCE-001 への引き継ぎ**: Phase 5 Step 5-3の手動テストで取得したスクリーンショットを `UT-P0-08-PHASE11-SCREENSHOT-EVIDENCE-001.md` の手順に従って保存する。

**Phase 6完了条件**: lint/typecheck/testが全PASS、後続未タスクへの引き継ぎ情報が整理されている。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] アプリ起動時に未完了セッションが自動検出される（AC-1）
- [ ] 未完了セッションが存在する場合、`SessionResumePrompt` が表示される
- [ ] 「続きから再開」選択でセッションが継続される（`session_id` がSDK入力へ再利用される）（AC-2, AC-6）
- [ ] 「スキップ」選択でセッションが削除され、新規開始される（AC-3）
- [ ] アクティブなセッションの `session_id` と経過時間が `SessionIndicator` に表示される（AC-4）
- [ ] 期限切れセッションが `cleanupExpiredSessions()` により削除される（AC-5）
- [ ] manifest互換性がない場合に新規セッションへフォールバックする（AC-7）
- [ ] IPC経由でセッション一覧・詳細が取得できる（AC-8）
- [ ] セッション0件のとき `SessionResumePrompt` が非表示になる

### 設計要件

- [ ] `RuntimeSkillCreatorFacade` のビジネスロジックをIPCハンドラー内で再実装していない（薄いラッパー原則）
- [ ] renderer側でセッション状態を `localStorage` に保存していない
- [ ] renderer側で独自のセッション互換性判定ロジックを実装していない
- [ ] P0-06の一時状態（`useInterviewState`）とP0-08の永続状態の混在がない
- [ ] `useInterviewState.ts` にP0-06/P0-08スコープ境界コメントが存在する（P0-06実装済みの場合）

### 品質要件

- [ ] TypeScript strict modeでエラーがない（`pnpm --filter @repo/desktop typecheck` PASS）
- [ ] ESLintエラーがない（`pnpm --filter @repo/desktop lint` PASS）
- [ ] ユニットテストが全PASS（SessionResumePrompt、SessionIndicator、IPC統合）
- [ ] `data-testid` 属性が主要要素に付与されている（TC-01〜TC-06の手動テストで使用）
- [ ] `any` 型が使用されていない

---

## 6. 検証方法

### 自動検証

```bash
# TypeScript型チェック
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/shared typecheck

# ESLint
pnpm --filter @repo/desktop lint

# ユニットテスト（セッション復元関連）
pnpm --filter @repo/desktop test -- --testPathPattern="session-resume|SessionResume|SessionIndicator|SkillLifecyclePanel"

# 全テスト
pnpm --filter @repo/desktop test
```

### 統合検証コマンド

```bash
# IPCハンドラーが薄いラッパーになっているか確認（Facade呼び出しのみかチェック）
grep -A 5 "skill-creator:list-sessions\|skill-creator:resume-session" \
  apps/desktop/src/main/ipc/index.ts

# preload APIが正しく公開されているか確認
grep -n "skillCreatorSessionApi\|listSessions\|resumeSession" \
  apps/desktop/src/renderer/preload/

# P0-06/P0-08境界コメントの存在確認
grep -n "TASK-P0-06\|TASK-P0-08\|永続化" \
  apps/desktop/src/renderer/components/skill/hooks/useInterviewState.ts

# SessionResumePromptのdata-testid属性確認
grep -n "data-testid" \
  apps/desktop/src/renderer/components/skill/SessionResumePrompt.tsx
```

### 手動検証（Electronアプリ起動）

```bash
pnpm --filter @repo/desktop dev
```

手動テストはPhase 5 Step 5-3のTCシナリオ表に従って実施すること。

---

## 7. リスクと対策

| リスク                                               | 発生確率 | 影響度 | 対策                                                                                                                  |
| ---------------------------------------------------- | -------- | ------ | --------------------------------------------------------------------------------------------------------------------- |
| TASK-SDK-08未完了でFacade APIが存在しない            | 低       | 高     | Phase 1でFacadeのAPI存在を確認し、未完了の場合は本タスクを待機する                                                    |
| TASK-RT-06のsession_id命名と競合する                 | 中       | 中     | Phase 1でchannels.tsの既存定義を確認し、RT-06の命名に従う。重複定義しない                                             |
| ipc/index.tsの編集がTASK-RT-01と競合する             | 低       | 中     | git mergeコンフリクトが発生した場合は両タスクのIPCハンドラーを並立させる。ロジックを分離してcollisionを防ぐ           |
| P0-06の一時状態とP0-08の永続状態が混入する           | 中       | 高     | Phase 3・4で境界コメントを確認し、useInterviewStateへのセッション保存コードが混入しないようにコードレビューで確認する |
| SkillLifecyclePanelへの統合でP0-06の実装が破壊される | 低       | 高     | 既存のP0-06実装（ConversationalInterview等）を削除・変更しない。SessionResumePromptは既存UIの「追加」として実装する   |
| 複数セッション状態の再現困難（手動テスト用）         | 中       | 低     | SkillCreatorWorkflowSessionRepository のstorageに直接fixture checkpointを注入してからアプリを起動する                 |
| Electronアプリが起動せずPhase 5の手動テストが不可能  | 低       | 中     | `pnpm --filter @repo/desktop build` を先に実行してビルドエラーを確認する                                              |

---

## 8. 参照情報

### 関連ファイル（実装参照）

| ファイルパス                                                             | 役割                                                        |
| ------------------------------------------------------------------------ | ----------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`    | セッション管理Facade（本タスクのベースAPI）                 |
| `apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts`        | 既存IPCブリッジ（設計パターン参照）                         |
| `apps/desktop/src/main/ipc/index.ts`                                     | IPCハンドラー登録（追加対象）                               |
| `packages/shared/src/ipc/channels.ts`                                    | IPCチャンネル名定義（TASK-RT-06後の命名に従う）             |
| `packages/shared/src/types/skillCreator.ts`                              | 共有型定義                                                  |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`     | 復元フロー統合先の親コンポーネント                          |
| `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx` | P0-06の会話型インタビューUI（参照のみ。変更禁止）           |
| `apps/desktop/src/renderer/components/skill/hooks/useInterviewState.ts`  | P0-06の一時状態フック（参照のみ。永続化ロジックの追加禁止） |

### 苦戦箇所の詳細

#### 苦戦箇所1: P0-06とP0-08の境界

**問題**: P0-06とP0-08はともに「スキル作成」に関わるため、実装者がどちらの責務かを混同しやすい。

**明確な境界定義**:

- **P0-06の責務（レンダラーの揮発性一時状態）**: アプリを閉じると消える。`useInterviewState`内の `messages`・`currentStepIndex`・フォーム入力値など。永続化処理を一切含まない。
- **P0-08の責務（mainプロセス + SQLiteの永続状態）**: アプリを再起動しても残る。`session_id`・`planId`・`checkpointId`・`resume token` など。IPC経由でrendererに公開する。

**実装者が犯しやすいミス**:

1. `useInterviewState.ts` に `localStorage.setItem` を追加してしまう（P0-06の一時状態を永続化しようとする誤り）
2. `SessionResumePrompt.tsx` 内でセッション互換性判定ロジックを独自実装する（Facade内のロジックを再実装する誤り）

#### 苦戦箇所2: 薄いIPCラッパーの設計原則

**問題**: IPCハンドラー内にビジネスロジックを書きたくなる誘惑がある。

**原則**: `ipcMain.handle` のコールバック内は`facade.method(params)`の1行呼び出しに徹する。エラーハンドリングも Facade 側で行い、IPC 層はスローをそのままrendererに伝播させる。

```typescript
// 正しい薄いラッパー（ビジネスロジックなし）
ipcMain.handle(
  SKILL_CREATOR_RESUME_SESSION,
  async (_event, sessionId: string) => {
    return facade.resumeSession(sessionId); // Facade に完全委譲
  },
);

// 誤った実装（ビジネスロジックをIPCハンドラーに書いている）
ipcMain.handle(
  SKILL_CREATOR_RESUME_SESSION,
  async (_event, sessionId: string) => {
    const session = await db.sessions.findById(sessionId); // 直接DBアクセス（禁止）
    if (session.manifestHash !== currentHash) {
      // 互換性判定（Facade側の責務）
      return { success: false, errorReason: "incompatible" };
    }
    // ...
  },
);
```

#### 苦戦箇所3: セッション復元UIのフロー設計

**問題**: 「途中まで作ったスキル」を復元する際のユーザーフローが複数ステップにまたがる。

**推奨フロー**:

1. アプリ起動 → `listSessions()` でIPC取得
2. セッションあり → `SessionResumePrompt` を表示（セッション一覧・互換性情報）
3. ユーザーが「続きから再開」を選択 → `resumeSession(sessionId)` をIPC呼び出し
4. 成功 → `workflowSnapshot` を取得してP0-06の `ConversationalInterview` に渡す
5. 失敗（非互換）→ エラーバナーを表示し、「新規開始」ボタンを提示する
6. ユーザーが「削除して新規開始」を選択 → `deleteSession(sessionId)` をIPC呼び出し → 新規セッション開始

### 関連未タスク

| 未タスクID                               | 関係                                                                                      |
| ---------------------------------------- | ----------------------------------------------------------------------------------------- |
| UT-P0-08-PHASE11-SCREENSHOT-EVIDENCE-001 | P0-08完了後にElectronアプリでTC-01〜TC-06のスクリーンショットを取得してPhase 11を完了する |

---

## 9. 備考

### 実装上の注意事項

1. **`pnpm` のみ使用**: このプロジェクトでは `npm` / `yarn` は禁止。`pnpm --filter @repo/desktop <command>` の形式でコマンドを実行すること。

2. **`--no-verify` 禁止**: `git commit --no-verify` は絶対に使用しないこと（プロジェクトポリシー）。

3. **`any` 型の禁止**: TypeScript strict mode を維持し、`any` 型の使用を避けること。

4. **P0-06実装との協調**: TASK-P0-06で実装された `ConversationalInterview.tsx` および `useInterviewState.ts` を破壊的に変更しないこと。P0-08の変更は「追加」に徹する。

5. **SessionResumePrompt / SessionIndicatorの命名**: `UT-P0-08-PHASE11-SCREENSHOT-EVIDENCE-001.md` に記載されているコンポーネント名（`SessionResumePrompt`、`SessionIndicator`）を厳守する。異なる名前で実装すると手動テストの検証スクリプトが失敗する。

### 後続タスクへの引き継ぎ事項

| 後続タスク                               | 引き継ぎ内容                                                                                                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| UT-P0-08-PHASE11-SCREENSHOT-EVIDENCE-001 | Phase 5 Step 5-3の手動テストシナリオ（TC-01〜TC-06）を実施し、スクリーンショットを取得する。`pnpm --filter @repo/desktop dev` で起動して手動操作する   |
| TASK-P0-06（実装前の場合）               | P0-08の設計でP0-06/P0-08の境界定義（Section 2.3の表）が確定している。P0-06実装者はこの境界に従って `useInterviewState.ts` にスコープコメントを追加する |
