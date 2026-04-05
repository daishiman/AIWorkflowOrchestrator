# Phase 2: 設計

## メタ情報

| 項目      | 値         |
| --------- | ---------- |
| Phase     | 2          |
| Phase名   | 設計       |
| カテゴリ  | 設計       |
| 前提Phase | Phase 1    |
| 後続Phase | Phase 3    |
| 作成日    | 2026-04-06 |

## 目的

Phase 1 で確定した AC-1〜AC-9 に基づき、IPC 4層・コンポーネントトポロジー・型定義・セッション復元フローを設計する。
「薄いIPCラッパー原則」を設計レベルで確立し、Phase 3 のゲート通過条件を満たす設計書を作成する。

---

## 設計の要点（薄いIPCラッパー原則）

本タスクの本質は「TASK-SDK-08の main 側 API を IPC 経由で公開する薄いラッパー」である。

| 原則                           | 内容                                                                                        |
| ------------------------------ | ------------------------------------------------------------------------------------------- |
| ビジネスロジックの再実装禁止   | `ipcMain.handle` コールバック内は `facade.method(params)` の1行呼び出しに徹する             |
| renderer 側での状態保存禁止    | `localStorage`・`sessionStorage` へのセッション情報保存を禁止する                           |
| 互換性判定ロジックの再実装禁止 | `manifestHash` 比較をはじめとする互換性判定は Facade 側の責務であり、IPC 層で重複実装しない |

---

## 実行タスク

### タスク1: IPC 4層整合性設計

新規 IPC チャンネルを追加する場合、以下の 4 層が全て整合していることを設計時に確認する。

| 層                | 確認内容                                           | ファイル例                                      |
| ----------------- | -------------------------------------------------- | ----------------------------------------------- |
| 1. 定数定義       | `IPC_CHANNELS` に新チャンネルが追加されているか    | `packages/shared/src/ipc/channels.ts`           |
| 2. ホワイトリスト | Preload の `allowedChannels` に登録されているか    | `apps/desktop/src/preload/index.ts`             |
| 3. ハンドラ登録   | `ipcMain.handle()` が対応チャンネルを処理するか    | `apps/desktop/src/main/ipc/index.ts`            |
| 4. Preload API    | `contextBridge.exposeInMainWorld()` で公開されるか | `apps/desktop/src/preload/skill-creator-api.ts` |

**設計する IPC チャンネル一覧**:

| チャンネル名（仮）                       | 方向            | 説明                         | Facade メソッド                   |
| ---------------------------------------- | --------------- | ---------------------------- | --------------------------------- |
| `skill-creator:list-sessions`            | renderer → main | 未完了セッション一覧を取得   | `facade.listSessions()`           |
| `skill-creator:resume-session`           | renderer → main | セッションを復元して再開     | `facade.resumeSession(sessionId)` |
| `skill-creator:delete-session`           | renderer → main | セッションを削除             | `facade.deleteSession(sessionId)` |
| `skill-creator:cleanup-expired-sessions` | renderer → main | 期限切れセッションを一括削除 | `facade.cleanupExpiredSessions()` |

**注意**: TASK-RT-06 で既にチャンネル名が定義されている場合は再定義しない。`channels.ts` を必ず確認すること。

### タスク2: 型定義設計

`packages/shared/src/types/skillCreator.ts` に追加する型:

```typescript
// renderer側からIPCで受け取るセッション情報の型（既存型を確認してから追加）
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

**DI境界の型配置判断**:

| 条件                               | 配置先                       |
| ---------------------------------- | ---------------------------- |
| Main/Renderer 両方で参照する型     | `packages/shared/src/types/` |
| Main 側のみで使用する型            | Main 側実装ファイル内        |
| Renderer コンポーネントの Props 型 | 各コンポーネントファイル内   |

### タスク3: コンポーネントトポロジー設計

```
SkillLifecyclePanel.tsx（修正）
├── useEffect: アプリ起動時に listSessions() → sessions を state にセット
├── showResumePrompt: sessions.length > 0 の場合 true
├── SessionResumePrompt（新規）
│   ├── Props: sessions, onResume, onSkip, onStartNew, isLoading
│   └── UI: セッション一覧 + 再開ボタン + スキップボタン + 互換性警告
└── SessionIndicator（新規）
    ├── Props: sessionId, startedAt, isActive
    └── UI: session_id + 経過時間 + pulse アニメーション（isActive=true 時）
```

**Preload API 設計**:

```typescript
// contextBridge.exposeInMainWorld("skillCreatorSessionApi", {...}) で公開
interface SkillCreatorSessionApi {
  listSessions(): Promise<SkillCreatorSessionSummary[]>;
  resumeSession(sessionId: string): Promise<SkillCreatorSessionResumeResult>;
  deleteSession(sessionId: string): Promise<void>;
  cleanupExpiredSessions(): Promise<number>; // 削除件数を返す
}
```

### タスク4: セッション復元フロー設計

```
1. アプリ起動
   └─ useEffect → window.skillCreatorSessionApi.listSessions()
       ├─ sessions.length === 0 → 通常フロー（SessionResumePromptを表示しない）
       └─ sessions.length > 0 → setResumableSessions(sessions) → showResumePrompt = true

2. SessionResumePrompt 表示
   ├─ 「続きから再開」ボタン
   │   └─ resumeSession(sessionId)
   │       ├─ success: true → workflowSnapshot を ConversationalInterview に渡す
   │       └─ success: false（errorReason: "incompatible"/"expired"）→ エラーバナー表示
   └─ 「削除して新規開始」ボタン
       └─ deleteSession(sessionId) → 新規セッション開始

3. セッション中
   └─ SessionIndicator: sessionId + 経過時間 + pulse 表示
```

### タスク5: エラーハンドリング設計

| エラーパターン                         | 対処方針                                                           |
| -------------------------------------- | ------------------------------------------------------------------ |
| `listSessions()` 失敗                  | エラーをキャッチしてコンソールログのみ（復元プロンプトを非表示に） |
| `resumeSession()` 失敗（incompatible） | エラーバナー表示 + 「新規開始」ボタン提示                          |
| `resumeSession()` 失敗（expired）      | エラーバナー表示 + `deleteSession()` 自動実行 + 新規開始へ         |
| `deleteSession()` 失敗                 | エラーバナー表示（致命的でないためユーザーに選択させる）           |

---

## 参照資料

| 資料名          | パス                                                                                  | 説明            |
| --------------- | ------------------------------------------------------------------------------------- | --------------- |
| Phase 1 要件    | `phase-1-requirements.md`                                                             | AC-1〜AC-9 定義 |
| index.md        | `index.md`                                                                            | タスク概要      |
| unassigned spec | `docs/30-workflows/unassigned-task/TASK-P0-08-session-resume-renderer-integration.md` | 元仕様書        |

---

## 成果物

| 成果物           | パス                                  | 説明                                |
| ---------------- | ------------------------------------- | ----------------------------------- |
| 設計ドキュメント | `outputs/phase-2/design-document.md`  | IPC 4層・コンポーネント設計・型定義 |
| IPC 4層対応表    | `outputs/phase-2/ipc-layer-matrix.md` | 4層整合性チェック表                 |

---

## 統合テスト連携【必須】

| 判定項目                                          | 基準 | 備考                                            |
| ------------------------------------------------- | ---- | ----------------------------------------------- |
| IPC 4層整合の設計整合性確認                       | PASS | 定数・ホワイトリスト・ハンドラ・API の4層対応表 |
| 型定義（SessionSummary / ResumeResult）の設計確認 | PASS | `packages/shared/` 配置で確認                   |
| フロー設計（起動→検出→選択→継続/新規）            | PASS | Phase 3 ゲートで整合性を確認                    |

## 完了条件

- [ ] IPC 4層（定数定義・ホワイトリスト・ハンドラ登録・Preload API）の対応表が作成されている
- [ ] `SkillCreatorSessionSummary` / `SkillCreatorSessionResumeResult` 型が設計されている
- [ ] `SessionResumePrompt` / `SessionIndicator` の Props 設計が完了している
- [ ] セッション復元フロー（起動→検出→選択→継続/新規）が設計されている
- [ ] エラーハンドリング方針が定義されている
- [ ] 薄いIPCラッパー原則に違反する設計が含まれていないことを確認している
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビュー（4条件評価・MINOR追跡テーブル・ゲート判定）
