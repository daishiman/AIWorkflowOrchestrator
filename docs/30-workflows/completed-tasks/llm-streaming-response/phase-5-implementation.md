# Phase 5: 実装（TDD: Green） - タスク仕様書

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| Phase      | 5                      |
| Phase名    | 実装                   |
| 前提Phase  | Phase 4                |
| 後続Phase  | Phase 6                |
| ステータス | 未実施                 |
| 作成日     | 2026-01-23             |
| 機能名     | llm-streaming-response |

---

## 目的

Phase 4で作成したテストを通すための最小限の実装を行う（Green状態）。4プロバイダーでのストリーミング機能を実装し、全テストを成功させる。

## 背景

TDD原則に従い、テストを通すための実装を行う。既存のLLMアダプターアーキテクチャ（Template Methodパターン）を拡張し、ストリーミング機能を追加する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: BaseLLMAdapter拡張

**目的**: 基底クラスにstreamChat()抽象メソッドを追加

**実行手順**:

1. `BaseLLMAdapter`クラスに`streamChat()`抽象メソッドを追加
2. ストリーミング用の共通処理（リトライ、エラーハンドリング）をTemplate Methodで実装
3. AbortControllerを使用したキャンセル機構を実装

**実装ファイル**:

- `apps/desktop/src/main/adapters/llm/base.ts`

---

### タスク2: プロバイダーアダプター実装

**目的**: 4プロバイダーのストリーミング実装

**実行手順**:

1. OpenAIAdapter.streamChat()実装（stream: trueオプション）
2. AnthropicAdapter.streamChat()実装（stream: trueオプション）
3. GoogleAdapter.streamChat()実装（generateContentStream()）
4. xAIAdapter.streamChat()実装（OpenAI互換ストリーミング）

**実装ファイル**:

- `apps/desktop/src/main/adapters/llm/openai.ts`
- `apps/desktop/src/main/adapters/llm/anthropic.ts`
- `apps/desktop/src/main/adapters/llm/google.ts`
- `apps/desktop/src/main/adapters/llm/xai.ts`

---

### タスク3: IPCハンドラー実装

**目的**: llm:stream-chat IPCハンドラーの実装

**実行手順**:

1. `ipcMain.on('llm:stream-chat')`ハンドラー実装
2. `webContents.send()`でチャンクを送信
3. エラーイベント送信の実装
4. 完了イベント送信の実装
5. `llm:stream-cancel`キャンセルハンドラー実装

**実装ファイル**:

- `apps/desktop/src/main/handlers/llm-stream.ts`

---

### タスク4: Preload API実装

**目的**: Renderer側からアクセスするAPIの実装

**実行手順**:

1. `streamChat()`メソッドをpreloadに追加
2. `onStreamChunk()`コールバック登録の実装
3. `cancelStream()`メソッドの実装

**実装ファイル**:

- `apps/desktop/src/preload/llm.ts`
- `apps/desktop/src/preload/types.ts`

---

### タスク5: UIコンポーネント実装

**目的**: ストリーミング表示UIの実装

**実行手順**:

1. StreamingMessageコンポーネントの実装
2. `isStreaming`状態管理の実装（Redux Toolkit）
3. タイピングアニメーションの実装
4. キャンセルボタンの実装

**実装ファイル**:

- `apps/desktop/src/renderer/components/chat/StreamingMessage.tsx`
- `apps/desktop/src/renderer/store/slices/chatSlice.ts`（拡張）

---

## 参照資料

| 参照資料           | パス                                      | 内容          |
| ------------------ | ----------------------------------------- | ------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`  | Phase 2成果物 |
| 型定義設計         | `outputs/phase-2/type-design.md`          | Phase 2成果物 |
| 設計レビュー結果   | `outputs/phase-3/design-review-result.md` | Phase 3成果物 |
| テスト仕様書       | `outputs/phase-4/test-specification.md`   | Phase 4成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容                     |
| ---------------------- | ---------------------------------------------------------------------------- | ------------------------ |
| LLMインターフェース    | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`        | 型定義・IPC仕様          |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | Adapter/Factory/Template |
| エラーハンドリング     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | エラー処理パターン       |

---

## 成果物

| 成果物             | パス                                                             | 内容           |
| ------------------ | ---------------------------------------------------------------- | -------------- |
| BaseLLMAdapter拡張 | `apps/desktop/src/main/adapters/llm/base.ts`                     | 基底クラス拡張 |
| OpenAIAdapter      | `apps/desktop/src/main/adapters/llm/openai.ts`                   | OpenAI実装     |
| AnthropicAdapter   | `apps/desktop/src/main/adapters/llm/anthropic.ts`                | Anthropic実装  |
| GoogleAdapter      | `apps/desktop/src/main/adapters/llm/google.ts`                   | Google実装     |
| xAIAdapter         | `apps/desktop/src/main/adapters/llm/xai.ts`                      | xAI実装        |
| IPCハンドラー      | `apps/desktop/src/main/handlers/llm-stream.ts`                   | IPC実装        |
| Preload API        | `apps/desktop/src/preload/llm.ts`                                | Preload拡張    |
| UIコンポーネント   | `apps/desktop/src/renderer/components/chat/StreamingMessage.tsx` | UI実装         |
| Store拡張          | `apps/desktop/src/renderer/store/slices/chatSlice.ts`            | 状態管理拡張   |

---

## 統合テスト連携（Phase 1〜11は必須）

IPC→Adapter→Provider→Adapter→IPC→UIの接続実装:

| 実装項目           | 内容                                                       |
| ------------------ | ---------------------------------------------------------- |
| IPC通信            | `llm:stream-chat`/`llm:stream-chunk`/`llm:stream-cancel`   |
| Adapter接続        | LLMAdapterFactory.getAdapter()からのストリーミング呼び出し |
| Provider API       | 各プロバイダーのストリーミングエンドポイント接続           |
| エラーハンドリング | ネットワーク切断、タイムアウト、APIエラーの処理            |
| 状態同期           | isStreaming状態のリアルタイム更新                          |

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

---

## 完了条件

- [ ] BaseLLMAdapterにstreamChat()が実装されている
- [ ] 4プロバイダー（OpenAI、Anthropic、Google、xAI）でストリーミングが動作する
- [ ] IPCハンドラーが実装されている
- [ ] キャンセル機能が実装されている
- [ ] UIコンポーネントが実装されている
- [ ] すべてのテストが成功状態（Green）
- [ ] IPC→Adapter→Provider→Adapter→IPC→UIの接続が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 5 実行記録

### 実行タスク

- BaseLLMAdapter拡張: [結果]
- プロバイダーアダプター実装: [結果]
- IPCハンドラー実装: [結果]
- Preload API実装: [結果]
- UIコンポーネント実装: [結果]

### テスト結果

- 成功: N件
- 失敗: N件

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/llm-streaming-response/phase-6-test-expansion.md`
