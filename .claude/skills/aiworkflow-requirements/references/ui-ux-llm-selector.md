# LLM選択機能（Chat LLM Switching）

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

LLM 選択機能は Renderer の `llmSlice` を正本とし、選択状態を Main に同期して `ai.chat` / `llm:stream-chat` の実行経路へ渡す。UI surface は単一画面に固定されず、`LLMSelectorPanel`、AgentView、ChatView/WorkspaceView の blocked guidance が分担している。

**current implementation anchors**:

- selector panel: `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx`
- state owner: `apps/desktop/src/renderer/store/slices/llmSlice.ts`
- selector hooks: `apps/desktop/src/renderer/store/index.ts`
- Main sync: `apps/desktop/src/main/ipc/llmConfigProvider.ts`
- Chat 実行反映: `apps/desktop/src/renderer/store/slices/chatSlice.ts`
- Workspace Chat 実行反映: `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts`

## UI構成

| 要素 | 仕様 |
|------|------|
| 配置 | `LLMSelectorPanel` を配置する surface、または selectedModel 未選択時の guidance surface |
| プロバイダードロップダウン | 4つのプロバイダー（OpenAI, Anthropic, Google, xAI）から選択 |
| モデルドロップダウン | 選択されたプロバイダーの利用可能なモデル一覧から選択 |
| 現在の選択表示 | provider / model の current selection と health を表示 |
| リアルタイム切り替え | 選択時に `llmSlice` 更新 → `llm:set-selected-config` で Main 同期 |

## プロバイダーとモデル一覧

| プロバイダー | モデルID | モデル名 | コンテキストウィンドウ |
|--------------|----------|----------|----------------------|
| **OpenAI** | gpt-5.2-instant | GPT-5.2 Instant | 400K |
| | gpt-4 | GPT-4 | 8K |
| **Anthropic** | claude-sonnet-4.5 | Claude Sonnet 4.5 | 200K (1M beta) |
| | claude-3-opus | Claude 3 Opus | 200K |
| **Google** | gemini-3-flash | Gemini 3 Flash | 1M |
| | gemini-pro | Gemini Pro | 32K |
| **xAI** | grok-4.1-fast | Grok 4.1 Fast | 2M |
| | grok-1 | Grok 1 | 8K |

**注**: 上記モデルはuser-stories.mdの仕様に基づく。実際のモデル名とコンテキストウィンドウはプロバイダーのAPI仕様に準拠。

## 状態管理

**Zustand llmSlice**:

| 状態/アクション | 型 | 説明 |
| --- | --- | --- |
| `providers` | `LLMProvider[]` | 利用可能な provider 一覧 |
| `selectedProviderId` | `LLMProviderId \| null` | 選択中 provider |
| `selectedModelId` | `string \| null` | 選択中 model |
| `fetchProviders()` | `() => Promise<void>` | provider 一覧取得 + default selection 設定 |
| `selectProvider()` | `(providerId) => void` | provider 切替 + default model 選択 |
| `selectModel()` | `(modelId) => void` | model 切替 |
| `checkHealth()` | `(providerId) => Promise<void>` | health check |

**同期契約**:

- `selectProvider()` / `selectModel()` は `window.electronAPI.llm.setSelectedConfig()` を呼び、Main 側の current selection を更新する
- `chatSlice.sendMessage()` は `selectedProviderId` / `selectedModelId` を参照して `AI_CHAT` request に渡す
- `chatSlice.sendMessage()` 失敗時は `chatError` に error code を設定し、ChatView のインラインエラーバナー（Apple HIG systemRed、5秒自動消去、`role="alert"`）で日本語メッセージを表示する（TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE）
- `useWorkspaceChatController()` は同じ selection を `streamChat` request に渡す

**注意**:

- current `persist.partialize` には LLM 選択状態は含まれていない
- そのため再起動後 persist は未実装であり、runtime sync と persist は別 concern で扱う

## UXフロー

### プロバイダー切り替え時の動作

1. ユーザーが「Provider」ドロップダウンからプロバイダーを選択
2. `setProvider()` アクションが即座に実行
3. 選択されたプロバイダーの最初のモデルが自動選択される
4. 「Model」ドロップダウンの選択肢が更新される
5. 「Current」バッジが更新される
6. 次のメッセージから新しいプロバイダー/モデルが使用される

### モデル切り替え時の動作

1. ユーザーが「Model」ドロップダウンからモデルを選択
2. `setProvider()` アクションが即座に実行
3. 「Current」バッジが更新される
4. 次のメッセージから新しいモデルが使用される

**重要**: 会話履歴は保持されるが、各モデルは独立して動作するため、前のモデルの「記憶」は新しいモデルには引き継がれない。

## スタイルガイドライン

**プロバイダードロップダウン**:

| プロパティ | 値 |
|------------|------|
| 幅 | `w-48`（192px） |
| 背景色 | `bg-white/5` |
| ボーダー | `border border-white/10` |
| テキスト色 | `text-white` |
| フォントサイズ | `text-sm`（14px） |
| パディング | `px-3 py-2`（左右12px、上下8px） |
| 角丸 | `rounded-lg`（8px） |

**モデルドロップダウン**: プロバイダードロップダウンと同一のスタイル

**Currentバッジ**:

| プロパティ | 値 |
|------------|------|
| 背景色 | `bg-blue-500/20` |
| テキスト色 | `text-blue-400` |
| フォントサイズ | `text-xs`（12px） |
| パディング | `px-2 py-1`（左右8px、上下4px） |
| 角丸 | `rounded`（4px） |
| 配置 | ドロップダウンの下、左寄せ |

## アクセシビリティ

| 要件 | 実装 |
|------|------|
| ラベル | `<label htmlFor="provider-select">Provider:</label>` |
| フォーカス表示 | `focus:ring-2 focus:ring-blue-500` |
| キーボードナビゲーション | `<select>` 要素のネイティブ機能で矢印キー、Enter対応 |
| スクリーンリーダー | `aria-label` で「LLMプロバイダーを選択」 |
| 無効状態 | プロバイダーが0件の場合、`disabled` 属性を設定 |

## エラーハンドリング

| エラーケース | 対処法 |
|--------------|--------|
| プロバイダー一覧が空 | 「No LLM providers available」メッセージを表示 |
| 選択されたモデルが存在しない | プロバイダーの最初のモデルにフォールバック |
| APIキーが未設定 | ドロップダウンは表示するが、メッセージ送信時にエラー表示 |

## テストカバレッジ

**ユニットテスト** (`LLMSelector.test.tsx`):

| テストケース | 結果 |
|--------------|------|
| プロバイダー・モデルドロップダウンの表示 | ✅ |
| プロバイダー変更時のコールバック実行 | ✅ |
| モデル変更時のコールバック実行 | ✅ |
| 現在の選択バッジ表示 | ✅ |
| プロバイダーが空の場合のメッセージ表示 | ✅ |
| 選択されたプロバイダーのモデルのみ表示 | ✅ |
| モデルがないプロバイダーの処理 | ✅ |

**カバレッジ**: 100%（7/7テストケース合格）

## 実行経路との統合

| 経路 | current behavior |
| --- | --- |
| Main Chat | `chatSlice.sendMessage()` が `providerId` / `modelId` を `AI_CHAT` に渡す |
| Workspace Chat | `useWorkspaceChatController.sendMessage()` が `streamChat` request に `providerId` / `modelId` を含める |
| Main fallback | request 未指定時は `llm:set-selected-config` で同期済みの Main state を使用する |
| blocked guidance | `selectedModelId === null` のとき、Workspace Chat は Settings 誘導を表示する |

LLM 選択と system prompt は独立状態だが、Chat 実行時には同じ request 文脈に合流する。

## 関連タスクドキュメント

| ドキュメント | 内容 |
|--------------|------|
| `docs/30-workflows/ai-chat-llm-integration-fix/index.md` | 4 タスク統合の親workflow |
| `docs/30-workflows/completed-tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/` | ChatView error surface task（current canonical root） |
| `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/` | inline guidance task |
| `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/` | persist task（completed root） |
| `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/` | Workspace Chat error UX task（current root） |

---

## 関連ドキュメント

- [Portal実装パターン](./ui-ux-portal-patterns.md)
- [ナビゲーションUI設計](./ui-ux-navigation.md)
- [システムプロンプト設定UI](./ui-ux-system-prompt.md)
- [UI/UXパネル設計](./ui-ux-panels.md)
