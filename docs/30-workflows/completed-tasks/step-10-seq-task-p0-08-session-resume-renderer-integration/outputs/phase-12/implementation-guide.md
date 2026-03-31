# TASK-P0-08 セッション復元 Renderer 統合 実装ガイド

## Part 1: なぜ必要で、何をするのか

### なぜ必要か

スキル作成の途中でアプリを閉じると、どこまで進んだか分からなくなる。このコストを下げるために、
前回の状態を見つけて「続きから戻るか」を選べるようにした。

### 例え話

本を読んでいて途中で閉じるときに、しおりを挟むのに近い。しおりがあれば次に開いたとき、
最初から探し直さずに続きを読む。session resume は、その「しおり」をアプリ側で管理する機能。

### 何をするか

- 起動時に未完了セッションを一覧取得する
- 復元可能か、警告付きか、復元不可かを表示する
- 復元したら前回の phase と質問状態を UI に戻す
- 復元中のセッションは `SessionIndicator` で見えるようにする

### 画面証跡の参照先

- 撮影計画: `outputs/phase-11/screenshot-plan.json`
- 期待する証跡パス: `outputs/phase-11/screenshots/TC-01-default-light.png` 〜 `TC-06-active-light.png`
- 現在の gap: `docs/30-workflows/unassigned-task/UT-P0-08-PHASE11-SCREENSHOT-EVIDENCE-001.md`

## Part 2: 技術詳細

### 型定義

```typescript
export interface SkillCreatorSessionListItem {
  checkpointId: string;
  planId: string;
  checkpointType: SkillCreatorCheckpointType;
  currentPhase: SkillCreatorWorkflowPhase;
  createdAt: number;
  updatedAt: number;
  compatibility: ResumeCompatibilityResult;
}

export interface SkillCreatorResumeSessionRequest {
  checkpointId: string;
}

export interface SkillCreatorDeleteSessionRequest {
  checkpointId: string;
}

export const SESSION_TTL_MS = 86_400_000 as const;
```

### APIシグネチャ

```typescript
listSessions(): Promise<IpcResult<SkillCreatorSessionListItem[]>>;
getSessionDetail(
  checkpointId: string,
): Promise<IpcResult<SkillCreatorWorkflowUiSnapshot>>;
resumeSession(
  checkpointId: string,
): Promise<IpcResult<SkillCreatorWorkflowUiSnapshot>>;
deleteSession(checkpointId: string): Promise<IpcResult<void>>;
```

### 使用例

```typescript
const result = await window.skillCreatorAPI.listSessions();
if (result.success && result.data?.length) {
  const first = result.data[0];
  await window.skillCreatorAPI.resumeSession(first.checkpointId);
}
```

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/main/ipc/__tests__/creatorHandlers.sessionResume.test.ts \
  src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.sessionResume.test.ts \
  src/renderer/components/skill/__tests__/SessionIndicator.test.tsx \
  src/renderer/components/skill/__tests__/SessionResumePrompt.test.tsx
```

### 実装ポイント

- Main: `RuntimeSkillCreatorFacade` が `SkillCreatorWorkflowSessionRepository` を通して checkpoint を列挙・評価・削除する
- Preload: `safeInvoke` で `skill-creator:list-sessions` など 4 チャンネルを公開する
- Renderer: `SessionResumePrompt` が復元候補を出し、`SessionIndicator` が active session を表示する
- Renderer drift guard: `SessionResumePrompt` は shared の `SkillCreatorSessionListItem` を再利用し、ローカル型複製を避ける

### エラーハンドリング

- 一覧取得失敗: 非致命。banner を出さず通常導線へ落とす
- 復元失敗: `localError` に表示し、ユーザーが別セッション選択か skip を続けられるようにする
- 削除失敗: 対象だけ維持してエラー表示する
- IPC 層: sender validation / blank string guard / sanitized error を固定する

### エッジケース

- TTL 超過: `SESSION_TTL_MS` を超える checkpoint は一覧から除外する
- active lease: `active_lease_conflict` は conflict 扱いで復元不可
- root relocation: hash / cache key が一致し root だけ変わった場合は warning 扱い
- missing checkpoint: `undefined` を返し renderer で失敗メッセージ化する

### 設定項目と定数

| 項目                           | 値               | 用途                               |
| ------------------------------ | ---------------- | ---------------------------------- |
| `SESSION_TTL_MS`               | `86_400_000`     | 24 時間の有効期限                  |
| `SKILL_CREATOR_ENGINE_VERSION` | `task-sdk-08-v1` | resume compatibility の major 判定 |
| `ownerInstanceId`              | `randomUUID()`   | lease conflict 判定                |
