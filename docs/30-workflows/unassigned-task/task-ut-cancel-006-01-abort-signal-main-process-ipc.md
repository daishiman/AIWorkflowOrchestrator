# タスク仕様書: AbortSignal の Main Process 完全伝播（IPC キャンセルID拡張）

## メタ情報

```yaml
issue_number: 2412
task_id: UT-CANCEL-006-01
task_name: AbortSignal の Main Process 完全伝播（IPC キャンセルID拡張）
category: 改善
priority: 低
scale: 大規模
status: 未実施
created_date: 2026-04-22
dependencies: [UT-CANCEL-004-01, UT-CANCEL-005-01]
```

| 項目         | 内容                                           |
| ------------ | ---------------------------------------------- |
| タスクID     | UT-CANCEL-006-01                               |
| ステータス   | 未実施                                         |
| 優先度       | 低                                             |
| 規模         | 大規模                                         |
| 見積もり工数 | L                                              |
| 依存タスク   | UT-CANCEL-004-01（完了済み）、UT-CANCEL-005-01 |
| 作成日       | 2026-04-22                                     |

## 概要

UT-CANCEL-004-01 では `AbortSignal` を Renderer ガード（`signal?.aborted` チェック）として IPC 呼び出し前に消費する設計を採用した。本タスクはその次段階として、`requestId` を IPC payload に付与し Renderer が `cancelRequest(requestId)` IPC を送信することで Main Process に対するキャンセル通知を実現する間接パターンを導入する。これにより Renderer の AbortSignal 中断が Main Process の処理中断（`cancelCurrentOperation`）と完全に連携した双方向キャンセルチェーンが確立される。

## 背景・動機

### 現状のキャンセルチェーン

```
[現在の実装状況]
Renderer AbortSignal → Renderer ガード（IPC 呼び出し前のみ）  ✅ UT-CANCEL-004-01
Main cancelCurrentOperation → AbortController.abort()         ✅ TASK-SW-CANCEL-003
Renderer → Main キャンセル通知（cancelGeneration IPC）         ✅ TASK-SW-CANCEL-002
```

### 問題点

`cancelGeneration` IPC（`skill-creator:cancel`）は Main Process の `cancelCurrentOperation()` を呼び出せるが、**どの操作をキャンセルするか**を特定する `requestId` が存在しない。現在は「最後に開始された処理」を abort するシングルトン的な設計（`currentAbortController`）になっている。

```
[問題シナリオ]
1. 操作A を開始（requestId なし、currentAbortController = ctrlA）
2. 操作B を開始（currentAbortController が ctrlB に上書き）
3. 操作A のキャンセルを Renderer が送信
   → cancelCurrentOperation() が ctrlB を abort してしまう（意図しないキャンセル）
```

また、IPC payload に `requestId` がないため、Renderer 側の `AbortSignal` の `abort` イベントを `cancelRequest(requestId)` IPC に自動的に紐付ける「signal → IPC 自動連携」パターンが実装できない。

### 解決アプローチ

1. IPC payload（`createSkill`, `planSkill`, `executePlan` 等）に `requestId` フィールドを追加する
2. Main Process 側で `requestId` に紐づく AbortController をマップ（`Map<string, AbortController>`）で管理する
3. Renderer 側で AbortSignal の `abort` イベントに `cancelRequest(requestId)` IPC 送信を紐付ける
4. Preload に `cancelRequest(requestId: string)` API を追加し、channels.ts に新規チャンネルを登録する

## スコープ

### 含む

- `IPC_CHANNELS` への `SKILL_CREATOR_CANCEL_REQUEST` チャンネル追加（`skill-creator:cancel-request`）
- `skillCreatorHandlers.ts` への `requestId` 対応 IPC ハンドラ登録（`ipcMain.handle('skill-creator:cancel-request', ...)`）
- `SkillCreatorService.ts` の AbortController 管理をシングルトンからマップ（`Map<string, AbortController>`）へ移行
- `SkillCreatorService.cancelRequest(requestId: string)` メソッドの追加
- `SkillCreatorService.createSkill` / `planSkill` / `executePlan` 等への `requestId` 付与（UUID 生成）
- Preload `skill-creator-api.ts` に `cancelRequest(requestId: string) => Promise<IpcResult<void>>` API 追加
- `SkillCreatorAPI` インターフェースへの `cancelRequest` エントリ追加
- Renderer Store（`agentSlice.ts`）での signal `abort` イベントリスナーによる `cancelRequest` IPC 自動送信
- 既存 `cancelGeneration`（全体キャンセル）との共存設計
- 単体テスト：`requestId` マップの追加・削除・abort 動作テスト
- 単体テスト：Renderer の `abort` イベントから `cancelRequest` IPC 送信が呼ばれることの確認

### 含まない

- `AbortSignal` を IPC payload に直接含める実装（シリアライズ不可のため永続的に対象外）
- `analyzeSkill` / `autoImproveSkill` への `requestId` 付与（UT-CANCEL-005-01 完了後に別タスクで対応）
- Renderer Store の signal Renderer ガードの削除（UT-CANCEL-004-01 の設計は維持・補完関係）
- 並列実行（複数 createSkill 同時実行）のサポート（本タスクは requestId マップ基盤の構築に留める）
- 古い `currentAbortController` シングルトン設計の完全撤廃（後方互換のため `cancelCurrentOperation` は残す）

## 受け入れ条件

- [ ] `IPC_CHANNELS.SKILL_CREATOR_CANCEL_REQUEST` チャンネルが追加されている（`skill-creator:cancel-request`）
- [ ] `SkillCreatorService` に `private abortControllerMap: Map<string, AbortController>` が存在する
- [ ] `SkillCreatorService.cancelRequest(requestId)` を呼ぶと対象の AbortController が abort される
- [ ] `createSkill` IPC ハンドラが payload から `requestId` を受け取り、対応 AbortController をマップに登録する
- [ ] `createSkill` 完了/例外時に `abortControllerMap` から該当 `requestId` を削除する（メモリリーク防止）
- [ ] Preload `skillCreatorAPI.cancelRequest(requestId)` が `skill-creator:cancel-request` を invoke する
- [ ] `agentSlice.ts` の `createSkill` 実装内で、signal の `abort` イベントが発火した際に `window.electronAPI.skillCreator.cancelRequest(requestId)` が呼ばれる
- [ ] `requestId` を指定しないキャンセル（`cancelGeneration`）は従来どおり動作し続ける（後方互換）
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなしで完了する
- [ ] `SkillCreatorService` の `cancelRequest` 単体テストが PASS する（存在するIDのabort、存在しないIDのno-op）
- [ ] `agentSlice` の `createSkill` で `signal.abort()` 時に `cancelRequest` IPC が呼ばれるユニットテストが PASS する

## 技術的詳細

### 実装アプローチ

#### Phase A: Main Process（SkillCreatorService）

```typescript
// SkillCreatorService.ts
// 変更前: シングルトン
private currentAbortController: AbortController | null = null;

// 変更後: マップ追加（シングルトンも後方互換のため残す）
private abortControllerMap: Map<string, AbortController> = new Map();

// 新メソッド
public cancelRequest(requestId: string): void {
  const ctrl = this.abortControllerMap.get(requestId);
  if (ctrl) {
    ctrl.abort();
    this.abortControllerMap.delete(requestId);
  }
}

// createSkill 内でマップに登録
public async createSkill(options: CreateSkillOptions, ...) {
  const requestId = options.requestId ?? randomUUID();
  const abortController = new AbortController();
  this.abortControllerMap.set(requestId, abortController);
  try {
    // ... 処理
  } finally {
    this.abortControllerMap.delete(requestId);
  }
}
```

#### Phase B: IPC ハンドラ

```typescript
// skillCreatorHandlers.ts
ipcMain.handle(
  IPC_CHANNELS.SKILL_CREATOR_CANCEL_REQUEST,
  async (event, args: { requestId: string }): Promise<IpcResult<void>> => {
    // sender validation
    skillCreatorService.cancelRequest(args.requestId);
    return { success: true };
  },
);
```

#### Phase C: Preload

```typescript
// skill-creator-api.ts
cancelRequest: (requestId: string): Promise<IpcResult<void>> =>
  safeInvoke<IpcResult<void>>(IPC_CHANNELS.SKILL_CREATOR_CANCEL_REQUEST, { requestId }),
```

#### Phase D: Renderer Store（agentSlice.ts）

```typescript
// agentSlice.ts createSkill 実装内
createSkill: async (description, options, context?, signal?) => {
  if (signal?.aborted) return "";

  const requestId = crypto.randomUUID();

  // signal abort イベントで cancelRequest IPC を送信
  const handleAbort = () => {
    window.electronAPI.skillCreator.cancelRequest(requestId);
  };
  signal?.addEventListener("abort", handleAbort);

  try {
    const result = await window.electronAPI.skillCreator.createSkill({
      description,
      options,
      context,
      requestId,  // IPC payload に requestId を含める
    });
    return result.data ?? "";
  } finally {
    signal?.removeEventListener("abort", handleAbort);
  }
},
```

### IPC シリアライズ制約（既知）

`AbortSignal` は構造化クローンアルゴリズムでシリアライズ不可であり、Electron の contextBridge を通過できない。本タスクはこの制約に対して「`requestId` を IPC で送信し、Main Process 側で対応する AbortController を abort する」間接パターンを導入することで解決する。

### requestId ライフサイクル

```
[Renderer]  createSkill 呼び出し
  → requestId = crypto.randomUUID()
  → signal.addEventListener("abort", () => cancelRequest(requestId) IPC 送信)
  → IPC invoke: skill-creator:create { ..., requestId }

[Main]      skill-creator:create ハンドラ
  → AbortController 生成
  → abortControllerMap.set(requestId, ctrl)
  → 処理実行
  → finally: abortControllerMap.delete(requestId)

[キャンセル時]
  → signal.abort() 発火
  → handleAbort(): cancelRequest(requestId) IPC 送信
  → Main: skill-creator:cancel-request ハンドラ
  → abortControllerMap.get(requestId).abort()
```

### 後方互換設計

- 既存の `cancelGeneration`（`skill-creator:cancel`）は `cancelCurrentOperation()` を呼び続ける
- `currentAbortController` シングルトンは削除しない（既存テストの非回帰のため）
- `requestId` なし呼び出しは `cancelGeneration` 経由の全体キャンセルにフォールバックする

## 苦戦箇所・知見（同種の課題への備忘）

| 項目                                     | 内容                                                                                                                                                                                                                                                                          |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IPC シリアライズ壁                       | `AbortSignal` はコンテキストブリッジを通過できない。「requestId を IPC で渡し Main が abort する」間接パターンが唯一の解法。この制約は Electron の仕様上変わらないため設計ドキュメントに明記する                                                                              |
| requestId マップのメモリリーク           | `finally` ブロックで必ず `abortControllerMap.delete(requestId)` を実行しないと、完了済み処理のエントリが蓄積する。テスト時はマップの size を確認すること                                                                                                                      |
| テスト時の IPC mock と signal 組み合わせ | `signal.addEventListener("abort", ...)` の呼び出しを vitest の `vi.fn()` で検証する際、`AbortController.abort()` のタイミングと async/await の順序に注意が必要。`signal` mock は `{ aborted: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }` として構成する |
| cancelGeneration との二重キャンセル競合  | ユーザーが cancelGeneration（全体キャンセル）と cancelRequest（個別キャンセル）を同時に発火した場合、`AbortController.abort()` は冪等（二重 abort は無害）のため問題なし                                                                                                      |
| signal なし呼び出し元の互換性            | `requestId` を IPC payload に追加しても、既存 Preload 型（`CreateSkillOptions`）に `requestId?: string` をオプションとして追加すれば既存呼び出し元への影響はない                                                                                                              |
| Renderer 側の removeEventListener 漏れ   | `createSkill` が正常完了した場合でも `finally` で `removeEventListener` を実行しないと、将来の abort 発火時に古い `requestId` で IPC を送信してしまう（対象処理は既に完了しているため Main 側は no-op だが混乱の原因になる）                                                  |

## フェーズ計画

- **Phase 1: 要件定義** — 本仕様書の確認・現状の cancelGeneration / cancelCurrentOperation 実装の詳細調査・requestId 連携が必要なエントリポイント（createSkill / planSkill / executePlan）の特定
- **Phase 2: 設計** — requestId マップ設計・IPC チャンネル追加設計・Renderer signal→IPC 紐付け設計・後方互換設計の確定
- **Phase 3: 設計レビューゲート** — 設計の矛盾・漏れ・整合性確認（cancelGeneration との共存、メモリリーク防止の確認）
- **Phase 4: テスト作成（RED）** — `cancelRequest(requestId)` の単体テスト（RED）・agentSlice `abort` イベント→IPC 送信テスト（RED）
- **Phase 5: IPC チャンネル追加** — `channels.ts` に `SKILL_CREATOR_CANCEL_REQUEST` 追加・`ALLOWED_INVOKE_CHANNELS` への登録
- **Phase 6: SkillCreatorService 実装** — `abortControllerMap` 追加・`cancelRequest` メソッド追加・`createSkill` への requestId 対応
- **Phase 7: IPC ハンドラ実装** — `skillCreatorHandlers.ts` に `cancel-request` ハンドラ追加・`unregisterSkillCreatorHandlers` へのクリーンアップ追加
- **Phase 8: Preload 実装** — `skill-creator-api.ts` に `cancelRequest` API 追加・`SkillCreatorAPI` インターフェース更新
- **Phase 9: Renderer Store 実装** — `agentSlice.ts` の `createSkill` に `abort` イベントリスナー追加・`requestId` IPC payload 付与
- **Phase 10: テスト GREEN 確認** — Phase 4 の RED テストを GREEN にする・既存 cancel テストの非回帰確認
- **Phase 11: 手動テスト検証** — `createSkill` 実行中にキャンセルボタン押下で Main Process の処理が中断されることを確認（NON_VISUAL エビデンス）
- **Phase 12: ドキュメント更新** — 実装ガイド・unassigned-task-detection（横展開候補: planSkill / executePlan への requestId 付与検討）・LOGS.md 更新
- **Phase 13: PR 作成** — ローカルチェック結果・変更サマリー・PR 作成
