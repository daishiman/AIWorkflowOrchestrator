# TASK-RT-01 実装ガイド: LLMAdapter 初期化エラーの UI 通知・状態公開

## Part 1: なぜ必要か・何をするか

### なぜ必要か

LLM アダプター（Claude API）の初期化に失敗しても、以前は UI にエラーが伝わらず、
ユーザーはスキルを実行しようとして初めて「なぜか動かない」状態に遭遇していた。
これは「玄関のドアが壊れているのに、部屋に入ろうとするまで誰も気づかない」状態と同じ。

### 何をするか

Electron の IPC を使い、Main プロセスで把握しているアダプターの状態（`ready` / `initializing` / `failed`）を Renderer（React UI）へ届ける。
失敗時には `SkillLifecyclePanel` の最上部にエラーバナーを表示し、ユーザーに原因と対処法を伝える。

### 日常の例え

電子レンジの「エラー表示」と同じ仕組み。電子レンジ本体（Main プロセス）が故障を検知し、
パネル（Renderer）にエラーコードを送って表示する。ユーザーは扉を開ける前に問題を把握できる。

---

## Part 2: 実装詳細

### なぜ必要か

API キー未設定 / ネットワーク障害でアダプターが `failed` になっても UI にエラーが出ず、
ユーザーがスキル実行→タイムアウト→再試行という無駄なループに入っていた。

### 何をするか

IPC の Pull + Push パターンで状態同期する：

1. 画面初期表示時に `getAdapterStatus()` で現在状態を取得（Pull）
2. 状態変化時に `onAdapterStatusChanged` イベントで即時反映（Push）

### 今回作ったもの

| ファイル                               | 種別 | 内容                           |
| -------------------------------------- | ---- | ------------------------------ |
| `LLMAdapterErrorBanner.tsx`            | 新規 | エラーバナー Pure component    |
| `useLLMAdapterStatus.ts`               | 新規 | IPC pull/push を管理するフック |
| `LLMAdapterStatusPayload` 型           | 追加 | shared 型定義                  |
| `skill-creator:get-adapter-status`     | 追加 | invoke チャネル                |
| `skill-creator:adapter-status-changed` | 追加 | on/push チャネル               |

### 型定義

```typescript
// packages/shared/src/types/skillCreator.ts
export interface LLMAdapterStatusPayload {
  status: LLMAdapterStatus; // "ready" | "initializing" | "failed"
  failureReason: string | null; // null は ready/initializing 時
}
```

### API シグネチャ

```typescript
// コンポーネント
export function LLMAdapterErrorBanner(props: LLMAdapterErrorBannerProps): JSX.Element | null

// フック
export function useLLMAdapterStatus(): LLMAdapterStatusState

// Preload API
getAdapterStatus(): Promise<IpcResult<LLMAdapterStatusPayload>>
onAdapterStatusChanged(callback: (payload: LLMAdapterStatusPayload) => void): () => void
```

### 使用例

```typescript
// SkillLifecyclePanel.tsx 内
const adapterStatus = useLLMAdapterStatus();

// JSX 最上部
<LLMAdapterErrorBanner
  status={adapterStatus.status}
  failureReason={adapterStatus.failureReason}
  onOpenSettings={onOpenWizard}
/>
```

### エラーハンドリング

| ケース                            | 実装                                                              |
| --------------------------------- | ----------------------------------------------------------------- |
| `api` が undefined（Electron 外） | フックが `{ status: "initializing", failureReason: null }` を返す |
| pull 失敗                         | catch で握り潰し、状態を変更しない                                |
| アンマウント後の push             | `cancelled` フラグで `setState` を抑制                            |
| push の unsubscribe 失敗          | try/catch で握り潰す                                              |

### エッジケース

| ケース                                                        | 挙動                                                      |
| ------------------------------------------------------------- | --------------------------------------------------------- |
| 複数回 push が届く                                            | 最後の push が状態になる（React setState は最終値を採用） |
| `failureReason: null` で `failed`                             | 「不明なエラー」として表示                                |
| `onOpenSettings` が未指定                                     | 「設定を開く」ボタンを表示しない                          |
| `failureReason` に "API Key" が含まれる（大文字小文字問わず） | API キー専用メッセージを表示                              |

### 設定項目と定数一覧

| 定数                                   | 値                                       | 場所          |
| -------------------------------------- | ---------------------------------------- | ------------- |
| `SKILL_CREATOR_GET_ADAPTER_STATUS`     | `"skill-creator:get-adapter-status"`     | `channels.ts` |
| `SKILL_CREATOR_ADAPTER_STATUS_CHANGED` | `"skill-creator:adapter-status-changed"` | `channels.ts` |

### テスト構成

| ファイル                                      | 件数   | 対象                                     |
| --------------------------------------------- | ------ | ---------------------------------------- |
| `creatorHandlers.adapterStatus.test.ts`       | 12     | IPC ハンドラ pull/push                   |
| `LLMAdapterErrorBanner.test.tsx`              | 13     | バナー表示・メッセージ・アクセシビリティ |
| `useLLMAdapterStatus.test.ts`                 | 9      | フック pull/push・クリーンアップ         |
| `SkillLifecyclePanel.adapter-status.test.tsx` | 2      | 統合（バナー表示/非表示）                |
| **合計**                                      | **36** |                                          |

### Phase 11 スクリーンショット証跡

| TC-ID    | 状態 / 観点                    | 証跡                                   |
| -------- | ------------------------------ | -------------------------------------- |
| TC-11-01 | ready（バナー非表示）          | `../phase-11/screenshots/TC-11-01.png` |
| TC-11-02 | failed（API key 系メッセージ） | `../phase-11/screenshots/TC-11-02.png` |
| TC-11-03 | failed（汎用 failureReason）   | `../phase-11/screenshots/TC-11-03.png` |
| TC-11-04 | failed + 「設定を開く」導線    | `../phase-11/screenshots/TC-11-04.png` |
| TC-11-05 | light theme 視認性             | `../phase-11/screenshots/TC-11-05.png` |
| TC-11-06 | dark theme 視認性              | `../phase-11/screenshots/TC-11-06.png` |

`outputs/phase-11/screenshots/` には current build から再取得した 1600x1200 の実画像を保存している。
