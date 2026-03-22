# Phase 1: 要件定義 — ChatView インラインモデルセレクタ統合

## メタ情報

| 項目     | 値                                          |
| -------- | ------------------------------------------- |
| Phase    | 1                                           |
| 機能名   | chatview-inline-model-selector-integration  |
| タスクID | TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION |
| 作成日   | 2026-03-21                                  |
| 更新日   | 2026-03-22                                  |

## 目的

Task 01で作成済みの `InlineModelSelector` コンポーネントをChatView画面に統合し、チャット画面から直接LLMモデルを選択・変更できるようにする。

## 前提条件

| 項目                       | 状態     | 説明                                                                    |
| -------------------------- | -------- | ----------------------------------------------------------------------- |
| InlineModelSelector (共通) | 完了     | `components/llm/InlineModelSelector.tsx` (462行) — Task 01成果物        |
| index.ts エクスポート      | 完了     | `components/llm/index.ts` から `InlineModelSelector` をエクスポート済み |
| llmSlice Store             | 利用可能 | `selectedProviderId` / `selectedModelId` / 個別セレクタ群が利用可能     |
| IPC契約                    | 利用可能 | `llm:set-selected-config` でMain Process同期済み                        |

## 実行タスク

- ChatView固有の要件抽出: ChatViewへのInlineModelSelector配置に関する機能要件を定義
- LLMGuidanceBannerとの共存ルール定義: 既存バナーとインラインセレクタの表示制御を定義
- 受け入れ基準作成: ChatView統合に限定した検証可能な受け入れ基準を定義
- P50チェック: ChatViewに同等機能が既実装でないか確認

## 参照資料

| 資料名              | パス                                                               | 説明                   |
| ------------------- | ------------------------------------------------------------------ | ---------------------- |
| ワークフロー概要    | `docs/30-workflows/chat-inline-model-selector/index.md`            | 全体像・タスク分解     |
| ChatView実装        | `apps/desktop/src/renderer/views/ChatView/index.tsx`               | 統合先（355行）        |
| LLMGuidanceBanner   | `apps/desktop/src/renderer/views/ChatView/LLMGuidanceBanner.tsx`   | 既存警告バナー（44行） |
| InlineModelSelector | `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx` | Task 01成果物（462行） |
| llmSlice            | `apps/desktop/src/renderer/store/slices/llmSlice.ts`               | LLM状態管理            |

### システム仕様（aiworkflow-requirements）

| 参照資料            | パス                                                                              | 内容                     |
| ------------------- | --------------------------------------------------------------------------------- | ------------------------ |
| UI/UXコンポーネント | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           | 既存UIコンポーネント構造 |
| 状態管理Core        | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md` | LLM Slice設計            |
| UI/UXデザイン原則   | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`    | Apple HIG準拠設計        |

## 実行手順

### ステップ0: P50チェック - 既実装状態の調査（必須）

| 対象                        | 状態                                                                     |
| --------------------------- | ------------------------------------------------------------------------ |
| ChatView内モデル選択UI      | 未実装（LLMGuidanceBanner=警告バナーのみ、設定画面への誘導ボタン）       |
| ChatView headerのセレクタ枠 | 未実装（header にはタイトル「AIチャット」+ RAGステータス + 2ボタンのみ） |
| InlineModelSelector import  | ChatView内に未import                                                     |

**P50判定**: ChatViewへの統合は未実装。Task 01成果物を配置する作業が必要。

### ステップ1: 機能要件（FR）

#### FR-1: ChatViewヘッダーへのInlineModelSelector配置

- FR-1.1: ChatViewのヘッダー領域にInlineModelSelectorを配置する
- FR-1.2: ヘッダー内の配置位置はタイトル「AIチャット」の右側、既存ボタン群の左側とする
- FR-1.3: InlineModelSelectorは `compact` モードで表示する（ヘッダーの高さに収まるサイズ）
- FR-1.4: ストリーミング送信中（`isSending === true`）はInlineModelSelectorを `disabled` にする

#### FR-2: LLMGuidanceBannerとの表示制御

- FR-2.1: モデル選択済みの場合、LLMGuidanceBannerは非表示のまま維持する（既存動作と同一）
- FR-2.2: モデル未選択状態ではLLMGuidanceBannerを引き続き表示する（API key設定への誘導として機能）
- FR-2.3: InlineModelSelectorでモデルを選択した直後、LLMGuidanceBannerが即座に非表示になる

#### FR-3: チャット送信との連動

- FR-3.1: InlineModelSelectorで選択したモデルがチャット送信時に使用される（既存のStore連携で実現済み）
- FR-3.2: モデル未選択状態ではチャット送信ボタンの動作は既存のまま維持する（エラーハンドリングは既存実装を利用）

### ステップ2: 非機能要件（NFR）

#### NFR-1: レイアウト一貫性

- NFR-1.1: ヘッダーの高さが変わらないこと（InlineModelSelector compact版は既存ヘッダー高に収まる）
- NFR-1.2: レスポンシブ対応: ウィンドウ幅が狭い場合にモデル名がtruncateされる

#### NFR-2: パフォーマンス

- NFR-2.1: InlineModelSelector追加によるChatViewの初期レンダリング時間が有意に増加しないこと
- NFR-2.2: P31対策: InlineModelSelector内部の個別セレクタ使用はTask 01で対策済み。ChatView側で追加のStore接続は不要

#### NFR-3: アクセシビリティ

- NFR-3.1: InlineModelSelectorのアクセシビリティはTask 01で実装済み。ChatView側で追加のARIA属性は不要
- NFR-3.2: Tab順序: ヘッダー内のフォーカス順が自然であること（タイトル → InlineModelSelector → 既存ボタン群）

### ステップ3: スコープ定義

#### スコープ内

- ChatView (`views/ChatView/index.tsx`) への `InlineModelSelector` 配置
- LLMGuidanceBanner (`views/ChatView/LLMGuidanceBanner.tsx`) との表示制御連携
- ストリーミング中の `disabled` 制御

#### スコープ外

- InlineModelSelectorコンポーネントの修正（Task 01で完了済み）
- WorkspaceChatPanelへの配置（Task 03で対応）
- LLMGuidanceBannerのリファクタリング（表示条件をAPI key限定にする等は未タスク）
- per-chatモデル選択（各チャットごとに異なるモデルを記憶する機能）
- 新規IPCチャンネルの追加（既存IPCで対応可能）

### ステップ4: 受け入れ基準

#### AC-1: InlineModelSelectorの表示

- ChatViewのヘッダー領域にInlineModelSelectorが表示される
- compact モードで表示される
- ストリーミング中は disabled 状態になる

#### AC-2: LLMGuidanceBannerとの連携

- モデル未選択 → InlineModelSelector（プレースホルダー表示）+ LLMGuidanceBanner の両方が表示される
- InlineModelSelectorでモデル選択 → LLMGuidanceBannerが非表示になる
- 既にモデル選択済み → InlineModelSelector（選択中モデル名）のみ表示、バナーなし

#### AC-3: チャット送信との連動

- InlineModelSelectorで選択したモデルでチャットが送信される
- モデル変更後、次の送信から新しいモデルが使用される

#### AC-4: レイアウト維持

- ヘッダーの高さが変わらない
- Tab順序が自然である

## 影響ファイル

| ファイル                                                         | 変更種別 | 内容                                          |
| ---------------------------------------------------------------- | -------- | --------------------------------------------- |
| `apps/desktop/src/renderer/views/ChatView/index.tsx`             | **主**   | InlineModelSelector import + ヘッダーへの配置 |
| `apps/desktop/src/renderer/views/ChatView/LLMGuidanceBanner.tsx` | 副       | 表示制御の確認（変更不要の可能性あり）        |

## 成果物

| 成果物     | パス                                                                                                                        | 説明           |
| ---------- | --------------------------------------------------------------------------------------------------------------------------- | -------------- |
| 要件定義書 | `docs/30-workflows/chat-inline-model-selector/tasks/02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION/phase-1-requirements.md` | 本ドキュメント |

## 完了条件

- [x] P50チェック（既実装調査）を完了
- [x] ChatView固有の機能要件（FR-1〜FR-3）を定義
- [x] ChatView固有の非機能要件（NFR-1〜NFR-3）を定義
- [x] スコープ（含む/含まない）を明確化
- [x] 受け入れ基準（AC-1〜AC-4）を定義
- [x] 影響ファイルを特定
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

→ `phase-2-design.md`（同ディレクトリ内）
