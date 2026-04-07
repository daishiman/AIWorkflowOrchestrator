# Phase 11 手動テスト結果 — TASK-UI-03 Skill Creator IPC 二重経路統合

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 11                          |
| タスク名   | TASK-UI-03 IPC 二重経路統合 |
| 作成日     | 2026-04-06                  |
| ステータス | plan（実施計画）            |
| 前提 Phase | Phase 10: 最終レビュー      |
| 次 Phase   | Phase 12: ドキュメント更新  |

---

## 1. 3層評価の適用判断

本タスクは IPC/アーキテクチャ変更が主体であり、UI コンポーネントの見た目は変化しない。
3層評価の適用可否を以下の通り判断する。

| 評価層   | 適用判断 | 理由                                                                                                      |
| -------- | -------- | --------------------------------------------------------------------------------------------------------- |
| Semantic | 適用     | IPC 通信の成否・エラー形式・チャネル名は機能的な正確性であり Semantic 評価に該当する                      |
| Visual   | 不要     | UI コンポーネントの見た目は変更なし。GovernanceSummaryPanel / ImprovementProposalPanel の表示は維持される |
| AI UX    | 不要     | 会話フロー・ユーザー体験の変更はなし。既存の SessionIPC / RuntimeIPC の動作順序に変化はない               |

**総合判定**: NON_VISUAL（スクリーンショットは推奨のみ、必須なし）

---

## 2. Session IPC 動作確認項目

対象 API: `window.skillCreatorSessionAPI`
対象コンポーネント: `SkillCreatorConversationPanel`
対象ハンドラー: `SkillCreatorIpcBridge.ts`

### 2-1. セッション開始（startSession）

1. デスクトップアプリを起動する
2. SkillCreatorConversationPanel を表示する
3. DevTools > Console を開き、以下のコードを実行してログを有効化する:

   ```javascript
   window.skillCreatorSessionAPI
     .startSession("テスト用スキルを作成して")
     .then((result) => console.log("[MT] startSession result:", result))
     .catch((err) => console.error("[MT] startSession error:", err));
   ```

4. 確認事項:
   - `result.success === true` が返ること
   - コンソールに `[MT] startSession result: { success: true }` が出力されること
   - IPC チャネル `skill-creator:start-session` が使用されていること（DevTools Network タブで確認）

### 2-2. 質問受信（onQuestion）

5. `startSession` 成功後、Main プロセスから `skill-creator:question-received` が push されることを確認する:

   ```javascript
   window.skillCreatorSessionAPI.onQuestion((question) => {
     console.log("[MT] onQuestion received:", question);
   });
   ```

6. 確認事項:
   - `question.toolCallId` が存在する文字列であること
   - `question.question` にプロンプトへの応答文が含まれること
   - コンソールに `[MT] onQuestion received:` ログが出力されること

### 2-3. 回答送信（sendAnswer）

7. `onQuestion` で受け取った `toolCallId` を使って `sendAnswer` を呼び出す:

   ```javascript
   window.skillCreatorSessionAPI
     .sendAnswer({ toolCallId: "<受信したtoolCallId>", value: "テスト回答" })
     .then((result) => console.log("[MT] sendAnswer result:", result))
     .catch((err) => console.error("[MT] sendAnswer error:", err));
   ```

8. 確認事項:
   - `result.success === true` が返ること（IpcSessionResult 形式の期待値）
   - `throw` ではなく `{ success: false, error: "..." }` 形式でエラーが返ること（エラー時）
   - `skill-creator:answer` チャネルが使用されていること

### 2-4. セッション一覧取得（listSessions）

以降の listSessions / resumeSession / deleteSession は Session Resume API として Runtime IPC（`window.skillCreatorAPI`）側で確認する。

9. `window.skillCreatorAPI.listSessions()` を呼び出す:

   ```javascript
   window.skillCreatorAPI
     .listSessions()
     .then((result) => console.log("[MT] listSessions result:", result))
     .catch((err) => console.error("[MT] listSessions error:", err));
   ```

10. 確認事項:
    - `result.success === true` かつ `result.data` が配列であること
    - 直前に開始したセッションが一覧に含まれること
    - `skill-creator:list-sessions` チャネルが使用されていること

補足: `listSessions` で取得した `checkpointId` を使い、`getSessionDetail` を確認する:

```javascript
window.skillCreatorAPI
  .getSessionDetail({ checkpointId: "<checkpointId>" })
  .then((result) => console.log("[MT] getSessionDetail result:", result))
  .catch((err) => console.error("[MT] getSessionDetail error:", err));
```

### 2-5. セッション再開（resumeSession）

11. `listSessions` で取得したチェックポイント ID を使って `resumeSession` を呼び出す:

    ```javascript
    window.skillCreatorAPI
      .resumeSession({ checkpointId: "<checkpointId>" })
      .then((result) => console.log("[MT] resumeSession result:", result))
      .catch((err) => console.error("[MT] resumeSession error:", err));
    ```

12. 確認事項:
    - 正常に再開できること（`result.success === true` または再開スナップショットが返ること）
    - `skill-creator:resume-session` チャネルが使用されていること

### 2-6. セッション削除（deleteSession）

13. `deleteSession` を呼び出す:

    ```javascript
    window.skillCreatorAPI
      .deleteSession({ checkpointId: "<checkpointId>" })
      .then(() => console.log("[MT] deleteSession: done"))
      .catch((err) => console.error("[MT] deleteSession error:", err));
    ```

14. 確認事項:
    - エラーなく削除が完了すること
    - 削除後に `listSessions` を再実行すると該当セッションが消えていること

### 2-7. IpcSessionResult 形式のエラー確認（MINOR-01 解決確認）

15. `startSession` に空の request を渡してエラーレスポンスを確認する:

    ```javascript
    window.skillCreatorSessionAPI
      .startSession("")
      .then((result) =>
        console.log("[MT] IpcSessionResult error format:", result),
      )
      .catch((err) => console.error("[MT] unexpected throw:", err));
    ```

16. 確認事項:
    - `.then()` でキャッチされること（`throw` ではなく `IpcSessionResult` 形式であること）
    - `result.success === false` かつ `result.error` に説明文が含まれること
    - `[SkillCreatorIpcBridge] start-session request must include` などのメッセージが含まれること

---

## 3. Runtime IPC 動作確認項目

対象 API: `window.skillCreatorAPI`
対象コンポーネント: `SkillLifecyclePanel` / `ConversationalInterview`
対象ハンドラー: `creatorHandlers.ts`

### 3-1. スキル計画作成（planSkill）

1. DevTools > Console で以下を実行する:

   ```javascript
   window.skillCreatorAPI
     .planSkill({ prompt: "テスト用スキルを作成して" })
     .then((result) => console.log("[MT] planSkill result:", result))
     .catch((err) => console.error("[MT] planSkill error:", err));
   ```

2. 確認事項:
   - `result.success === true` かつ `result.data.planId` が返ること
   - `skill-creator:plan` チャネルが使用されていること
   - コンソールに `[MT] planSkill result:` ログが出力されること

### 3-2. 計画実行（executePlan）

3. `planSkill` で取得した `planId` を使って `executePlan` を呼び出す:

   ```javascript
   window.skillCreatorAPI
     .executePlan({ planId: "<planId>", skillSpec: {} })
     .then((result) => console.log("[MT] executePlan result:", result))
     .catch((err) => console.error("[MT] executePlan error:", err));
   ```

4. 確認事項:
   - `result.accepted === true` かつ `result.planId` が返ること（fire-and-forget 応答）
   - `skill-creator:execute-plan` チャネルが使用されていること

### 3-3. ワークフロー状態取得（getWorkflowState）

5. `getWorkflowState` を呼び出す:

   ```javascript
   window.skillCreatorAPI
     .getWorkflowState({ planId: "<planId>" })
     .then((result) => console.log("[MT] getWorkflowState result:", result))
     .catch((err) => console.error("[MT] getWorkflowState error:", err));
   ```

6. 確認事項:
   - `result.success === true` かつ `result.data` にワークフロースナップショットが含まれること
   - `skill-creator:get-workflow-state` チャネルが使用されていること
   - `result.data.phase` が期待する値（`PLANNING`, `EXECUTING` 等）であること

### 3-4. ワークフロー状態変更通知受信（onWorkflowStateChanged）

7. プッシュ通知リスナーを登録する:

   ```javascript
   window.skillCreatorAPI.onWorkflowStateChanged((snapshot, errorMessage) => {
     console.log("[MT] onWorkflowStateChanged:", snapshot, errorMessage);
   });
   ```

8. 確認事項:
   - `executePlan` の実行後に `skill-creator:workflow-state-changed` イベントが push されること
   - `snapshot` が `SkillCreatorWorkflowUiSnapshot` 形式であること
   - `errorMessage` は正常時 `undefined` であること

### 3-5. ユーザー入力送信（submitUserInput）

9. インタラクティブなワークフロー状態で `submitUserInput` を呼び出す:

   ```javascript
   window.skillCreatorAPI
     .submitUserInput({
       planId: "<planId>",
       requestId: "<requestId>",
       textValue: "テスト入力",
     })
     .then((result) => console.log("[MT] submitUserInput result:", result))
     .catch((err) => console.error("[MT] submitUserInput error:", err));
   ```

10. 確認事項:
    - `result.success === true` かつ更新されたスナップショットが返ること
    - `skill-creator:submit-user-input` チャネルが使用されていること

### 3-6. LLM アダプター状態取得（getAdapterStatus）

11. `getAdapterStatus` を呼び出す:

    ```javascript
    window.skillCreatorAPI
      .getAdapterStatus()
      .then((result) => console.log("[MT] getAdapterStatus result:", result))
      .catch((err) => console.error("[MT] getAdapterStatus error:", err));
    ```

12. 確認事項:
    - `result.success === true` かつ `result.data` にアダプター状態が含まれること
    - `skill-creator:get-adapter-status` チャネルが **1回だけ** 登録されていること（重複なし）
    - 複数回呼び出しても正常なレスポンスが返ること

---

## 4. GovernanceSummaryPanel・ImprovementProposalPanel の動作確認

対象変更: `electronAPI.skillCreator` 削除 → `window.skillCreatorAPI` への参照先変更

### 4-1. GovernanceSummaryPanel の動作確認

1. AgentView パネルを表示し、GovernanceSummaryPanel が含まれる画面を開く
2. DevTools > Console でガバナンス状態を手動取得する:

   ```javascript
   window.skillCreatorAPI
     .getGovernanceState()
     .then((result) => console.log("[MT] getGovernanceState result:", result))
     .catch((err) => console.error("[MT] getGovernanceState error:", err));
   ```

3. 確認事項:
   - `result.success === true` かつ `result.data` にガバナンス情報が含まれること
   - `window.electronAPI.skillCreator` ではなく `window.skillCreatorAPI` を経由していること（ソースコード確認）
   - エラーメッセージが `"skillCreatorAPI.getGovernanceState が利用できません"` 形式であること（旧 `window.electronAPI.skillCreator.getGovernanceState` ではないこと）
   - GovernanceSummaryPanel が正常にデータを表示すること

4. エラーケース確認（`skillCreatorAPI` が未定義の場合）:
   - DevTools > Console で以下を実行する（フォールバック確認）:

   ```javascript
   // 一時的に skillCreatorAPI を undefined にして表示を確認
   const orig = window.skillCreatorAPI;
   delete window.skillCreatorAPI;
   // GovernanceSummaryPanel を再レンダリングして「ローディング表示」または「エラー表示」を確認
   window.skillCreatorAPI = orig;
   ```

   - `skillCreatorAPI` が未定義の際にパネルがクラッシュしないこと（ローディング表示またはフォールバック UI が表示されること）

### 4-2. ImprovementProposalPanel の動作確認

5. ConversationalInterview または改善提案が表示される画面を開く
6. 改善提案に対して「適用」ボタンを押す操作をシミュレートする:

   ```javascript
   window.skillCreatorAPI
     .applyRuntimeImprovement({ skillName: "test-skill", suggestions: [] })
     .then((result) =>
       console.log("[MT] applyRuntimeImprovement result:", result),
     )
     .catch((err) => console.error("[MT] applyRuntimeImprovement error:", err));
   ```

7. 確認事項:
   - `window.electronAPI.skillCreator.applyRuntimeImprovement` ではなく `window.skillCreatorAPI.applyRuntimeImprovement` が呼ばれること（ソースコード確認）
   - `skill-creator:apply-improvement` チャネルが使用されていること
   - 結果が `IpcResult<ApplyImprovementResult>` 形式であること

---

## 5. DevTools による IPC 通信監視手順

### 5-1. DevTools の開き方

1. デスクトップアプリを起動する
2. `Ctrl+Shift+I`（macOS: `Cmd+Option+I`）で DevTools を開く
3. または、メニューバー > View > Toggle Developer Tools を選択する

### 5-2. Console タブでの IPC 監視

1. DevTools > Console タブを開く
2. フィルターで `[MT]` を検索すると、手動テスト用ログのみを絞り込める
3. IPC 通信ログを有効化するには以下を実行する:

   ```javascript
   // ipcRenderer の originalSend を wrap してログを出す（参考）
   const origInvoke = window.skillCreatorAPI;
   console.log(
     "skillCreatorAPI methods:",
     Object.keys(window.skillCreatorAPI || {}),
   );
   console.log(
     "skillCreatorSessionAPI methods:",
     Object.keys(window.skillCreatorSessionAPI || {}),
   );
   console.log("electronAPI.skillCreator:", window.electronAPI?.skillCreator); // undefined であること
   console.log(
     "electronAPI.skillCreatorSession:",
     window.electronAPI?.skillCreatorSession,
   ); // undefined であること
   ```

4. 確認事項:
   - `window.electronAPI.skillCreator` が `undefined` であること（削除確認）
   - `window.electronAPI.skillCreatorSession` が `undefined` であること（削除確認）
   - `window.skillCreatorAPI` にメソッド一覧が存在すること
   - `window.skillCreatorSessionAPI` にメソッド一覧が存在すること

### 5-3. Network タブでの IPC チャネル監視

Electron の IPC 通信は HTTP ではないため Network タブには表示されない。代わりに以下の方法で監視する:

1. DevTools > Console タブで `ipcRenderer` の動作をログで監視する
2. Main プロセス側のログは DevTools ではなくターミナル（アプリ起動コンソール）に出力される:

   ```bash
   # アプリ起動コマンド（ターミナルで実行）
   pnpm --filter @repo/desktop dev 2>&1 | tee /tmp/ipc-log.txt
   # 別ターミナルでリアルタイム監視
   tail -f /tmp/ipc-log.txt | grep "skill-creator"
   ```

3. Main プロセスログの確認事項:
   - `[creatorHandlers]` または `[SkillCreatorIpcBridge]` プレフィックスのログを確認する
   - `SKILL_CREATOR_GET_ADAPTER_STATUS` が重複登録されていないこと（1 回のみのログが出ること）
   - Session IPC / Runtime IPC が混在なく動作していること

### 5-4. チャネル名の確認スクリプト

```javascript
// DevTools Console で実行して使用中チャネル名を確認
// （参考値として channels.ts の定数値を把握する用途）
const channels = {
  session: [
    "skill-creator:start-session",
    "skill-creator:answer",
    "skill-creator:question-received",
    "skill-creator:session-complete",
    "skill-creator:session-error",
  ],
  runtime: [
    "skill-creator:plan",
    "skill-creator:execute-plan",
    "skill-creator:get-workflow-state",
    "skill-creator:workflow-state-changed",
    "skill-creator:get-adapter-status",
    "skill-creator:get-governance-state",
    "skill-creator:apply-improvement",
  ],
};
console.log("[MT] Expected channels:", channels);
```

---

## 6. 非視覚証跡計画

本タスクは NON_VISUAL 判定のため、スクリーンショットの代わりにコンソールログを非視覚証跡として使用する。

### 6-1. コンソールログによる証跡方針

| 確認項目                                        | 証跡の種類             | 収集方法                                                                 |
| ----------------------------------------------- | ---------------------- | ------------------------------------------------------------------------ |
| `electronAPI.skillCreator` が削除済みであること | DevTools Console 出力  | `console.log(window.electronAPI?.skillCreator)` → `undefined` を記録     |
| `skillCreatorAPI` が正しく公開されていること    | DevTools Console 出力  | `console.log(Object.keys(window.skillCreatorAPI))` → メソッド一覧を記録  |
| Session IPC の IpcSessionResult 形式            | DevTools Console 出力  | `startSession` / `sendAnswer` の戻り値を `.then()` でキャッチして記録    |
| Runtime IPC の正常応答                          | DevTools Console 出力  | `planSkill` / `getWorkflowState` の `result.success` を記録              |
| `SKILL_CREATOR_GET_ADAPTER_STATUS` 重複なし確認 | アプリ起動ログ         | ターミナルで `grep "get-adapter-status"` して 1 件のみ出力を確認         |
| GovernanceSummaryPanel の参照先が変更済み       | ソースコード grep 確認 | `grep -n "electronAPI.skillCreator" GovernanceSummaryPanel.tsx` → 0 件   |
| ImprovementProposalPanel の参照先が変更済み     | ソースコード grep 確認 | `grep -n "electronAPI.skillCreator" ImprovementProposalPanel.tsx` → 0 件 |

### 6-2. grep による静的確認コマンド

```bash
# electronAPI.skillCreator の残存確認（0件であること）
grep -rn "electronAPI\.skillCreator" apps/desktop/src/renderer/

# electronAPI.skillCreatorSession の残存確認（0件であること）
grep -rn "electronAPI\.skillCreatorSession" apps/desktop/src/renderer/

# skillCreatorAPI の使用箇所確認（GovernanceSummaryPanel / ImprovementProposalPanel に存在すること）
grep -rn "skillCreatorAPI" apps/desktop/src/renderer/components/

# SKILL_CREATOR_GET_ADAPTER_STATUS の重複登録確認（2件: ipcMain.handle 1回 + removeHandler 1回）
grep -n "SKILL_CREATOR_GET_ADAPTER_STATUS" apps/desktop/src/main/ipc/creatorHandlers.ts
```

### 6-3. 自動テスト結果による代替証跡

以下の自動テストが全件 PASS することで、手動テストの観点を補完する。

| 手動テスト項目                                | 代替自動テスト                                    |
| --------------------------------------------- | ------------------------------------------------- |
| Session IPC IpcSessionResult 形式（MINOR-01） | `SkillCreatorIpcBridge.test.ts` の期待値          |
| GovernanceSummaryPanel 参照先変更             | `GovernanceSummaryPanel.test.tsx` の setupMockApi |
| ImprovementProposalPanel 参照先変更           | `ImprovementProposalPanel` 関連テスト             |
| preload API surface 整合性                    | `skill-creator-api.test.ts` / `channels.test.ts`  |
| creatorHandlers 重複登録解消                  | `creatorHandlers.adapterStatus.test.ts`           |

```bash
# 自動テスト実行コマンド
pnpm --filter @repo/desktop test -- --run
```

### 6-4. 画面カバレッジ証跡

`phase-11-manual-test.md` の TC-11-01〜TC-11-04 に対応する証跡を、validator 互換の placeholder PNG で固定する。

| TC-ID    | 確認観点              | 証跡                                                      |
| -------- | --------------------- | --------------------------------------------------------- |
| TC-11-01 | Session IPC 基本動作  | `outputs/phase-11/screenshots/non-visual-placeholder.png` |
| TC-11-02 | Runtime IPC 基本動作  | `outputs/phase-11/screenshots/non-visual-placeholder.png` |
| TC-11-03 | 経路分離と重複なし    | `outputs/phase-11/screenshots/non-visual-placeholder.png` |
| TC-11-04 | DevTools / 非視覚証跡 | `outputs/phase-11/screenshots/non-visual-placeholder.png` |

---

## 7. スクリーンショット計画（推奨のみ、必須なし）

本タスクは UI コンポーネントの見た目が変化しないため、実画面のスクリーンショットは不要である。
validator 互換のため、placeholder PNG を 1 点だけ保持する。

| #   | 画面状態                         | 必須/推奨 | 保存パス                                                  |
| --- | -------------------------------- | --------- | --------------------------------------------------------- |
| 1   | validator 互換の placeholder PNG | 必須      | `outputs/phase-11/screenshots/non-visual-placeholder.png` |

**注意**: placeholder PNG は実画面証跡ではなく、NON_VISUAL 判定を補助するための固定ファイルである。

---

## 8. 完了条件チェックリスト

### Session IPC 動作確認

- [ ] `window.skillCreatorSessionAPI.startSession()` が `IpcSessionResult` 形式でレスポンスを返すこと
- [ ] `window.skillCreatorSessionAPI.sendAnswer()` が `IpcSessionResult` 形式でレスポンスを返すこと
- [ ] `startSession` に空文字を渡した際に `throw` ではなく `{ success: false, error: "..." }` が返ること
- [ ] `window.skillCreatorSessionAPI.onQuestion()` でコールバックが登録できること

### Runtime IPC 動作確認

- [ ] `window.skillCreatorAPI.planSkill()` が `IpcResult<RuntimeSkillCreatorPlanResponse>` 形式で返ること
- [ ] `window.skillCreatorAPI.executePlan()` が `{ accepted: true, planId }` 形式で返ること
- [ ] `window.skillCreatorAPI.getWorkflowState()` が `IpcResult<SkillCreatorWorkflowUiSnapshot>` 形式で返ること
- [ ] `window.skillCreatorAPI.onWorkflowStateChanged()` でコールバックが登録できること
- [ ] `window.skillCreatorAPI.submitUserInput()` が `IpcResult` 形式で返ること
- [ ] `window.skillCreatorAPI.listSessions()` でセッション一覧が取得できること
- [ ] `window.skillCreatorAPI.getSessionDetail()` でセッション詳細が取得できること
- [ ] `window.skillCreatorAPI.resumeSession()` でセッション再開が動作すること
- [ ] `window.skillCreatorAPI.deleteSession()` でセッション削除が動作すること
- [ ] `window.skillCreatorAPI.getAdapterStatus()` が正常に応答すること
- [ ] `skill-creator:get-adapter-status` ハンドラーが重複登録されていないこと

### GovernanceSummaryPanel・ImprovementProposalPanel 動作確認

- [ ] `window.electronAPI?.skillCreator` が `undefined` であること（削除確認）
- [ ] `window.electronAPI?.skillCreatorSession` が `undefined` であること（削除確認）
- [ ] `GovernanceSummaryPanel` が `window.skillCreatorAPI.getGovernanceState` を使用していること
- [ ] `GovernanceSummaryPanel` のエラーメッセージが `"skillCreatorAPI.getGovernanceState が利用できません"` 形式であること
- [ ] `ImprovementProposalPanel` が `window.skillCreatorAPI.applyRuntimeImprovement` を使用していること
- [ ] `skillCreatorAPI` 未定義時に両パネルがクラッシュしないこと

### DevTools・非視覚証跡

- [ ] `grep -rn "electronAPI\.skillCreator" apps/desktop/src/renderer/` の結果が 0 件であること
- [ ] `grep -n "SKILL_CREATOR_GET_ADAPTER_STATUS" apps/desktop/src/main/ipc/creatorHandlers.ts` の `ipcMain.handle` が 1 件のみであること
- [ ] 自動テスト `pnpm --filter @repo/desktop test -- --run` が全件 PASS すること
- [ ] 型チェック `pnpm --filter @repo/desktop typecheck` がエラー 0 件であること

### Phase 12 への引き継ぎ判断

- [ ] Session IPC / Runtime IPC 双方の動作が確認済みであること、または自動テストによる代替が記録されていること
- [ ] NON_VISUAL 判定の理由と根拠が本ドキュメントに明記されていること
- [ ] Phase 12（ドキュメント更新）に渡す evidence 状態が明確であること

---

## 9. Phase 12 への evidence 状態

| 証跡種別                 | 状態                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| 手動テスト               | plan（実施計画済み。worktree 環境での Electron 起動が可能な場合に実施）                     |
| 自動テスト               | 自動テスト定義済み（Phase 4-7 で整備。`pnpm --filter @repo/desktop test` でカバレッジ確認） |
| スクリーンショット       | NON_VISUAL（推奨のみ。UI 見た目の変更なし）                                                 |
| grep による静的確認      | セクション 6-2 のコマンドで確認可能（`electronAPI.skillCreator` 残存 0 件を確認）           |
| IPC エラー形式の変更確認 | MINOR-01 解決: Session IPC の `IpcSessionResult` 化を自動テストで確認                       |

→ Phase 12 ドキュメント更新へ進む条件: セクション 8 の完了条件チェックリストが全項目 PASS または代替証跡ありで確認済みであること
