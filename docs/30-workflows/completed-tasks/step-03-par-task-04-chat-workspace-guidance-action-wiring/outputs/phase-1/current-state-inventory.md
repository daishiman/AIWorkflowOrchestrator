# Phase 1: 現状棚卸し - Current State Inventory

## メタ情報

| 項目     | 内容                                               |
| -------- | -------------------------------------------------- |
| タスクID | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |
| Phase    | 1                                                  |
| 作成日   | 2026-03-22                                         |

## 1. 対象ファイル棚卸し

### 1.1 ChatView/index.tsx (355行)

| 観点               | 現状                                                      | 評価     |
| ------------------ | --------------------------------------------------------- | -------- |
| blocked 判定       | LLMGuidanceBanner 内で selectedModelId/ProviderId を参照  | AC-2準拠 |
| CTA                | `onNavigateToSettings={() => setCurrentView("settings")}` | 配線済み |
| メッセージ         | "AIモデルが選択されていません"                            | 表示あり |
| local runtime 判定 | なし（store セレクタ経由）                                | AC-2準拠 |
| no-op ハンドラ     | なし                                                      | AC-4準拠 |
| handoff/terminal   | 未実装                                                    | GAP      |

### 1.2 WorkspaceChatPanel.tsx (75行)

| 観点               | 現状                                             | 評価              |
| ------------------ | ------------------------------------------------ | ----------------- |
| blocked 判定       | `controller.selectedModelId === null` (L25)      | AC-2 違反         |
| CTA                | `onAction={() => setCurrentView("settings")}`    | 配線済み          |
| メッセージ         | "AIモデルが選択されていません。Settings で..."   | ChatView と不統一 |
| local runtime 判定 | あり（controller.selectedModelId の local 判定） | AC-2 違反         |
| no-op ハンドラ     | なし                                             | AC-4準拠          |
| エラー表示         | 未実装（U-05 Red）                               | GAP               |
| 送信ボタン無効化   | 未実装（U-06 Red）                               | GAP               |

### 1.3 GuidanceBlock.tsx (85行)

| 観点          | 現状                                        | 評価       |
| ------------- | ------------------------------------------- | ---------- |
| variant 定義  | `"error" \| "handoff" \| "blocked"`         | 3 variant  |
| props         | `variant, message, actionLabel?, onAction?` | optional   |
| onAction 安全 | `actionLabel && onAction &&` の AND ガード  | no-op 排除 |
| memo 化       | React.memo 適用済み                         | P48 対策   |
| CSS 変数      | variantStyles を Record で外部定義          | P47 準拠   |

### 1.4 useWorkspaceChatController.ts (651行)

| 観点               | 現状                                              | 評価           |
| ------------------ | ------------------------------------------------- | -------------- |
| selectedModelId    | Store から取得し return object に含める           | 正当           |
| sendMessage 前検査 | `!selectedModelId` で early return                | 正当な事前検証 |
| error handling     | LLM error を switch-case で日本語メッセージに変換 | 実装済み       |
| handoff            | 未実装                                            | GAP            |

### 1.5 chatSlice.ts (417行)

| 観点               | 現状                                                     | 評価          |
| ------------------ | -------------------------------------------------------- | ------------- |
| ChatPanelStatus    | 型定義のみ（使用箇所なし）                               | 未活用        |
| streamingError     | state 定義あり、setter あり、呼び出し元なし（常に null） | 未活用        |
| resolvedCapability | state 定義あり、setter あり、設定箇所なし（常に "none"） | 未活用        |
| callLLMAPI         | `window.electronAPI?.ai?.chat` 存在チェック（L67-69）    | AC-2 違反候補 |

## 2. 問題リスト

| ID   | 問題                                                  | ファイル               | 影響度 | AC     |
| ---- | ----------------------------------------------------- | ---------------------- | ------ | ------ |
| G-01 | WorkspaceChatPanel で selectedModelId の local 判定   | WorkspaceChatPanel.tsx | 中     | AC-2   |
| G-02 | ChatView と WorkspaceChatPanel のメッセージ不統一     | 両ファイル             | 中     | AC-1   |
| G-03 | chatSlice.callLLMAPI 内の window check                | chatSlice.ts           | 中     | AC-2   |
| G-04 | streamingError state 定義のみ未使用                   | chatSlice.ts           | 中     | AC-1   |
| G-05 | resolvedCapability 常に "none"                        | chatSlice.ts           | 低     | AC-3   |
| G-06 | ChatPanelStatus 型定義のみ使用なし                    | chatSlice.ts           | 低     | AC-1   |
| G-07 | エラー表示未実装（U-05 Red）                          | WorkspaceChatPanel.tsx | 高     | AC-4   |
| G-08 | 送信ボタン無効化未実装（U-06 Red）                    | WorkspaceChatPanel.tsx | 高     | AC-4   |
| G-09 | terminal/handoff guidance 未実装                      | 両ファイル             | 高     | AC-1/3 |
| G-10 | CTA ラベル不統一（"設定画面へ" vs "Settings を開く"） | 両ファイル             | 中     | AC-1   |

## 3. 健全なパターン（推奨）

### GuidanceBlock の AND ガード

```typescript
{actionLabel && onAction && (
  <button onClick={onAction}>{actionLabel}</button>
)}
```

### 個別セレクタ（P31/P48 対策）

```typescript
export const useSelectedModelId = () =>
  useAppStore((state) => state.selectedModelId);
```

### LLMSlice バリデーション分離（P62 対策）

```typescript
export function validateAndSyncPersistedConfig(
  persistedProviderId,
  persistedModelId,
  availableProviders,
) {
  /* DEFAULT_CONFIG fallback 禁止 */
}
```

## 4. テスト実装状況

| テスト ID | 内容                                      | ステータス    |
| --------- | ----------------------------------------- | ------------- |
| E-05      | selectedModelId=null → GuidanceBlock 表示 | Green         |
| U-05      | errorMessage → エラー表示                 | Red（未実装） |
| U-06      | selectedModelId=null → 送信ボタン非活性   | Red（未実装） |
