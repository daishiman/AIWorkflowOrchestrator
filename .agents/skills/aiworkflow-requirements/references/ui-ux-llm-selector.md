# LLM選択機能（Chat LLM Switching）

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

チャット画面でユーザーが使用するLLM（Large Language Model）プロバイダーとモデルをリアルタイムに切り替える機能。複数のLLMプロバイダー（OpenAI、Anthropic、Google、xAI）と各プロバイダーの複数モデルから選択可能。

**実装場所**:

- コンポーネント: `apps/desktop/src/renderer/components/molecules/LLMSelector/index.tsx`
- 状態管理: `apps/desktop/src/renderer/store/slices/chatSlice.ts`
- 表示場所: `apps/desktop/src/renderer/views/ChatView/index.tsx`

## UI構成

| 要素 | 仕様 |
|------|------|
| 配置 | チャット画面上部、システムプロンプトトグルボタンの上 |
| プロバイダードロップダウン | 4つのプロバイダー（OpenAI, Anthropic, Google, xAI）から選択 |
| モデルドロップダウン | 選択されたプロバイダーの利用可能なモデル一覧から選択 |
| 現在の選択表示 | バッジ形式で「Current: プロバイダー名 / モデル名」を表示 |
| リアルタイム切り替え | ドロップダウン選択時に即座に反映、確認ダイアログなし |

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

**Zustand chatSlice**:

| 状態/アクション | 型 | 説明 |
|-----------------|------|------|
| currentProviderId | string | 現在のプロバイダーID |
| currentModelId | string | 現在のモデルID |
| providers | LLMProvider[] | 利用可能なプロバイダー一覧 |
| setProvider | (providerId, modelId) => void | プロバイダーとモデルを設定 |
| setProviders | (providers) => void | プロバイダー一覧を設定 |

**初期値**: デフォルトプロバイダーはOpenAI、デフォルトモデルはgpt-5.2-instantに設定される。

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

## システムプロンプト連携

LLM選択機能はシステムプロンプト機能と統合され、両方の設定を組み合わせてチャットリクエストを送信する。

**統合仕様**:

- LLM選択（プロバイダー/モデル）とシステムプロンプトは独立して設定可能
- メッセージ送信時、両方の設定を`AI_CHAT` IPCリクエストに含める
- プロバイダー/モデル切り替え時もシステムプロンプトは保持される

**IPC統合**:

メッセージ送信時、chatSliceの`sendMessage()`アクションが`window.electronAPI.ai.chat()`を呼び出し、ユーザーメッセージ、システムプロンプト、RAG有効化フラグを送信する。`currentProviderId`/`currentModelId`は将来的にIPC経由で送信予定。

## 関連タスクドキュメント

| ドキュメント | 内容 |
|--------------|------|
| `docs/30-workflows/chat-llm-switching/task-step00-requirements.md` | 要件定義書 |
| `docs/30-workflows/chat-llm-switching/task-step04-llm-selector.md` | LLMSelector実装仕様書 |
| `docs/30-workflows/chat-llm-switching/task-step05-refactoring.md` | リファクタリング実施報告 |
| `docs/30-workflows/chat-llm-switching/task-step07-code-review.md` | コードレビューレポート |
| `docs/30-workflows/chat-llm-switching/manual-test-report.md` | 手動テスト結果報告 |

---

## 関連ドキュメント

- [Portal実装パターン](./ui-ux-portal-patterns.md)
- [ナビゲーションUI設計](./ui-ux-navigation.md)
- [システムプロンプト設定UI](./ui-ux-system-prompt.md)
- [UI/UXパネル設計](./ui-ux-panels.md)
