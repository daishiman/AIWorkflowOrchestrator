# Phase 1: 要件定義 — WorkspaceChatPanel インラインモデルセレクタ統合

## メタ情報

| 項目     | 値                                           |
| -------- | -------------------------------------------- |
| Phase    | 1                                            |
| 機能名   | workspace-inline-model-selector-integration  |
| タスクID | TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION |
| 作成日   | 2026-03-21                                   |
| 更新日   | 2026-03-22                                   |

## 目的

Task 01で作成済みの `InlineModelSelector` コンポーネントをWorkspaceChatPanelに統合し、ワークスペースチャット画面から直接LLMモデルを選択・変更できるようにする。

## 前提条件

| 項目                       | 状態     | 説明                                                                    |
| -------------------------- | -------- | ----------------------------------------------------------------------- |
| InlineModelSelector (共通) | 完了     | `components/llm/InlineModelSelector.tsx` (462行) — Task 01成果物        |
| index.ts エクスポート      | 完了     | `components/llm/index.ts` から `InlineModelSelector` をエクスポート済み |
| llmSlice Store             | 利用可能 | `selectedProviderId` / `selectedModelId` / 個別セレクタ群が利用可能     |
| IPC契約                    | 利用可能 | `llm:set-selected-config` でMain Process同期済み                        |

## 実行タスク

- WorkspaceChat固有の要件抽出: WorkspaceChatPanelへのInlineModelSelector配置に関する機能要件を定義
- GuidanceBlockとの共存ルール定義: 既存blocked判定とインラインセレクタの表示制御を定義
- useWorkspaceChatControllerとの連動設計: blocked状態とモデル選択の関係を定義
- 受け入れ基準作成: WorkspaceChat統合に限定した検証可能な受け入れ基準を定義
- P50チェック: WorkspaceChatPanelに同等機能が既実装でないか確認

## 参照資料

| 資料名                     | パス                                                                                | 説明                            |
| -------------------------- | ----------------------------------------------------------------------------------- | ------------------------------- |
| ワークフロー概要           | `docs/30-workflows/chat-inline-model-selector/index.md`                             | 全体像・タスク分解              |
| WorkspaceChatPanel実装     | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`              | 統合先（76行）                  |
| useWorkspaceChatController | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` | チャットコントローラー（652行） |
| InlineModelSelector        | `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx`                  | Task 01成果物（462行）          |
| llmSlice                   | `apps/desktop/src/renderer/store/slices/llmSlice.ts`                                | LLM状態管理                     |

### システム仕様（aiworkflow-requirements）

| 参照資料            | パス                                                                              | 内容                     |
| ------------------- | --------------------------------------------------------------------------------- | ------------------------ |
| UI/UXコンポーネント | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           | 既存UIコンポーネント構造 |
| 状態管理Core        | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md` | LLM Slice設計            |
| UI/UXデザイン原則   | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`    | Apple HIG準拠設計        |

## 実行手順

### ステップ0: P50チェック - 既実装状態の調査（必須）

| 対象                                 | 状態                                                               |
| ------------------------------------ | ------------------------------------------------------------------ |
| WorkspaceChatPanel内モデル選択UI     | 未実装（GuidanceBlock variant="blocked" = Settings誘導のみ）       |
| WorkspaceChatPanelヘッダーのセレクタ | 未実装（ヘッダーにはタイトル「Workspace Chat」+ 説明テキストのみ） |
| InlineModelSelector import           | WorkspaceChatPanel内に未import                                     |
| useWorkspaceChatController内の選択UI | なし（selectedModelIdのnullチェックのみ、UIは未提供）              |

**P50判定**: WorkspaceChatPanelへの統合は未実装。Task 01成果物を配置する作業が必要。

### ステップ1: 機能要件（FR）

#### FR-1: WorkspaceChatPanelへのInlineModelSelector配置

- FR-1.1: WorkspaceChatPanelのヘッダー部（タイトル領域の下部）にInlineModelSelectorを配置する
- FR-1.2: WorkspaceChatPanelはサイドパネルとして使用されるため、InlineModelSelectorは `compact` モードで表示する
- FR-1.3: ストリーミング中（`controller.isStreaming === true`）はInlineModelSelectorを `disabled` にする

#### FR-2: GuidanceBlock(variant="blocked")との表示制御

- FR-2.1: モデル選択済みの場合、GuidanceBlock(variant="blocked")を非表示にする
- FR-2.2: モデル未選択状態ではGuidanceBlockを表示し、Settings画面への誘導を維持する
- FR-2.3: InlineModelSelectorでモデルを選択した直後、GuidanceBlockが即座に非表示になる

#### FR-3: useWorkspaceChatControllerとの連動

- FR-3.1: `controller.selectedModelId` が `null` の場合の `isModelBlocked` 判定は既存ロジックを維持する
- FR-3.2: InlineModelSelectorでモデルを選択すると、Store経由で `controller.selectedModelId` が更新され、`isModelBlocked` が自動で `false` に変わる
- FR-3.3: モデル選択後、WorkspaceChatInputが有効化される（`isModelBlocked` による制御で実現済み）

### ステップ2: 非機能要件（NFR）

#### NFR-1: サイドパネルレイアウト

- NFR-1.1: WorkspaceChatPanelはサイドパネルとして横幅が制限されるため、compact版でも横幅を占有しすぎないこと
- NFR-1.2: InlineModelSelector追加でパネル全体のスクロールが発生しないこと

#### NFR-2: パフォーマンス

- NFR-2.1: InlineModelSelector追加によるWorkspaceChatPanelの初期レンダリング時間が有意に増加しないこと
- NFR-2.2: P31対策: InlineModelSelector内部の個別セレクタ使用はTask 01で対策済み。WorkspaceChatPanel側で追加のStore接続は不要

#### NFR-3: アクセシビリティ

- NFR-3.1: InlineModelSelectorのアクセシビリティはTask 01で実装済み。WorkspaceChatPanel側で追加のARIA属性は不要
- NFR-3.2: Tab順序: パネル内のフォーカス順が自然であること（InlineModelSelector → チャットメッセージ → 入力エリア）

### ステップ3: スコープ定義

#### スコープ内

- WorkspaceChatPanel (`views/WorkspaceView/WorkspaceChatPanel.tsx`) への `InlineModelSelector` 配置
- GuidanceBlock(variant="blocked") との表示制御連携
- ストリーミング中の `disabled` 制御
- `isModelBlocked` 判定との連動確認

#### スコープ外

- InlineModelSelectorコンポーネントの修正（Task 01で完了済み）
- ChatViewへの配置（Task 02で対応）
- useWorkspaceChatController.ts のリファクタリング
- per-chatモデル選択（各チャットごとに異なるモデルを記憶する機能）
- ストリーミングエラーのUI改善（TASK-FIX-WORKSPACE-CHAT-STREAM-ERRORで対応）
- 新規IPCチャンネルの追加（既存IPCで対応可能）

### ステップ4: 受け入れ基準

#### AC-1: InlineModelSelectorの表示

- WorkspaceChatPanelのヘッダー部にInlineModelSelectorが表示される
- compact モードで表示される
- ストリーミング中は disabled 状態になる

#### AC-2: GuidanceBlockとの連携

- モデル未選択 → InlineModelSelector（プレースホルダー表示）+ GuidanceBlock(variant="blocked") の両方が表示される
- InlineModelSelectorでモデル選択 → GuidanceBlockが非表示になる
- 既にモデル選択済み → InlineModelSelector（選択中モデル名）のみ表示、GuidanceBlockなし

#### AC-3: チャット入力の有効化

- モデル未選択時: チャット入力はblocked状態（既存動作維持）
- InlineModelSelectorでモデル選択後: チャット入力が有効化される
- 選択後の送信がInlineModelSelectorで選択したモデルで実行される

#### AC-4: レイアウト維持

- サイドパネル内でレイアウト崩れがないこと
- Tab順序が自然であること

## 影響ファイル

| ファイル                                                                            | 変更種別 | 内容                                                         |
| ----------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------ |
| `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`              | **主**   | InlineModelSelector import + ヘッダー部への配置              |
| `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` | 副       | 変更不要の可能性あり（isModelBlocked判定は既存ロジック利用） |

## 成果物

| 成果物     | パス                                                                                                                         | 説明           |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------- |
| 要件定義書 | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-1-requirements.md` | 本ドキュメント |

## 完了条件

- [x] P50チェック（既実装調査）を完了
- [x] WorkspaceChat固有の機能要件（FR-1〜FR-3）を定義
- [x] WorkspaceChat固有の非機能要件（NFR-1〜NFR-3）を定義
- [x] スコープ（含む/含まない）を明確化
- [x] 受け入れ基準（AC-1〜AC-4）を定義
- [x] 影響ファイルを特定
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

→ `phase-2-design.md`（同ディレクトリ内）
