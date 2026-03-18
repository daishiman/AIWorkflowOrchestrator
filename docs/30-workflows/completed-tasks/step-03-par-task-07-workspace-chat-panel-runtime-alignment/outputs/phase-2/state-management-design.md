# Phase 2: State 管理設計

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 |
| Phase      | 2 (T2-3)                                     |
| ステータス | completed                                    |
| 作成日     | 2026-03-18                                   |

## 判断基準

panel インスタンス固有の UI state は local useState、複数 surface が参照する状態は Zustand Store。

## Local State（useState）

| State          | 型                     | 初期値 | 理由                                             |
| -------------- | ---------------------- | ------ | ------------------------------------------------ |
| messages       | WorkspaceChatMessage[] | []     | WorkspaceChatPanel 固有、他 surface と共有しない |
| conversationId | string or null         | null   | panel インスタンスに紐付く一時的な識別子         |
| input          | string                 | ""     | composer UI 固有の入力状態                       |
| cursorPos      | number                 | 0      | composer カーソル位置                            |
| isSending      | boolean                | false  | 送信中フラグ。panel 内部 UX 制御のみ             |
| isStreaming    | boolean                | false  | streaming 表示。panel 内部 UX 制御のみ           |
| streamContent  | string                 | ""     | 受信中の chunk 蓄積。panel 固有                  |
| errorMessage   | string or null         | null   | panel 固有のエラー表示                           |

### Ref（race 防止用）

| Ref                | 型                                       | 用途                                                      |
| ------------------ | ---------------------------------------- | --------------------------------------------------------- |
| isStreamingRef     | React.MutableRefObject\<boolean\>        | streaming 開始/終了時に即時同期（state 更新より高速）     |
| streamContentRef   | React.MutableRefObject\<string\>         | chunk/end 同期到着時の race 防止。state と ref を同時更新 |
| streamRequestIdRef | React.MutableRefObject\<string or null\> | cancel 時の requestId 参照                                |

## Zustand Store

| State              | Slice                | 型                | 既存/新規 | 理由                                              |
| ------------------ | -------------------- | ----------------- | --------- | ------------------------------------------------- |
| selectedFiles      | fileSelectionSlice   | SelectedFile[]    | 既存      | 04A/04B で共有される背景情報                      |
| selectedProviderId | llmSlice             | string or null    | 既存      | LLM 設定を全 surface で再利用                     |
| selectedModelId    | llmSlice             | string or null    | 既存      | LLM 設定を全 surface で再利用                     |
| accessCapability   | runtimeSlice（新規） | RuntimeResolution | 新規      | Task01 の RuntimeResolver 結果を全 surface で共有 |

### runtimeSlice 設計（新規）

```typescript
interface RuntimeSlice {
  accessCapability: RuntimeResolution;
  setAccessCapability: (resolution: RuntimeResolution) => void;
}

type RuntimeResolution =
  | { type: "integrated" }
  | { type: "handoff"; reason: string };
```

### セレクタ設計（P31/P48 対策）

```typescript
// 個別セレクタ（P31 対策: 合成 Hook 禁止）
export const useAccessCapability = () =>
  useAppStore((state) => state.accessCapability);

export const useSetAccessCapability = () =>
  useAppStore((state) => state.setAccessCapability);

// 派生セレクタは useShallow 不要（オブジェクト参照が安定しているため）
// ただし、将来 filter/map を使う派生セレクタを追加する場合は P48 準拠で useShallow を適用
```

## 04B 再発防止ルール

1. 新規 global slice を追加するのは runtimeSlice のみ（workspaceSlice / fileSelectionSlice は再利用）
2. isStreamingRef は setIsStreaming() だけに依存させず開始/終了時に即時同期する
3. stream buffer は state のみでなく ref でも保持し chunk/end 同期到着で欠落させない
4. useEffect の依存配列に合成 Hook の戻り値関数を含めない（P31 対策）
5. 派生セレクタで .filter() / .map() を使う場合は useShallow を適用（P48 対策）
