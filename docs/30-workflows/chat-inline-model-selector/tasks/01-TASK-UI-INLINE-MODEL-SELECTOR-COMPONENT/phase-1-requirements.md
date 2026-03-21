# Phase 1: 要件定義

## メタ情報

| 項目     | 値                                      |
| -------- | --------------------------------------- |
| Phase    | 1                                       |
| 機能名   | chat-inline-model-selector              |
| タスクID | TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT |
| 作成日   | 2026-03-21                              |

## 目的

チャット画面でLLMモデルを直接選択できるインラインUIの要件・スコープ・受け入れ基準を明文化する。

## 実行タスク

- 要件抽出: ユーザー要求と既存資産から機能要件・非機能要件を抽出
- 受け入れ基準作成: 各要件に対して検証可能な受け入れ基準を定義
- P50チェック: 既存実装・既存タスクとの重複を調査

## 参照資料

| 資料名           | パス                                                                   | 説明                       |
| ---------------- | ---------------------------------------------------------------------- | -------------------------- |
| ワークフロー概要 | `docs/30-workflows/chat-inline-model-selector/index.md`                | 本ワークフローの全体像     |
| LLMセレクタ実装  | `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx`        | 既存フル版パネル(224行)    |
| ChatView実装     | `apps/desktop/src/renderer/views/ChatView/index.tsx`                   | チャット画面の現行実装     |
| WorkspaceChat    | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx` | ワークスペースチャット実装 |
| llmSlice         | `apps/desktop/src/renderer/store/slices/llmSlice.ts`                   | LLM状態管理(261行)         |
| ガイダンスバナー | `apps/desktop/src/renderer/views/ChatView/LLMGuidanceBanner.tsx`       | 未選択時警告バナー         |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料            | パス                                                                              | 内容                     |
| ------------------- | --------------------------------------------------------------------------------- | ------------------------ |
| UI/UXコンポーネント | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           | 既存UIコンポーネント構造 |
| 状態管理Core        | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md` | LLM Slice設計            |
| LLM IPC型           | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`              | IPC契約定義              |
| UI/UXデザイン原則   | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`    | Apple HIG準拠設計        |

## 実行手順

### ステップ0: P50チェック - 既実装状態の調査（必須）

既存コードベースに同等の機能がすでに実装されていないか確認する。

**調査結果:**

| 対象                   | 状態                                                                 |
| ---------------------- | -------------------------------------------------------------------- |
| ChatView内モデル選択UI | 未実装（LLMGuidanceBanner=警告バナーのみ）                           |
| WorkspaceChat内選択UI  | 未実装（GuidanceBlock=Settings誘導のみ）                             |
| ChatPanel内スタブ版    | 存在するがonSelect空で無効（`components/chat/LLMSelectorPanel.tsx`） |
| 共通コンポーネント     | `components/llm/` にフル版パネル・子コンポーネントが存在             |
| 関連タスク仕様書       | 永続化(Task03)・エラーUI(Task04)は存在するがインラインUI選択は未定義 |

**P50判定**: 新規実装が必要。既存の `components/llm/` を基盤として利用可能。

### ステップ1: 機能要件（FR）

#### FR-1: インラインモデルセレクタコンポーネント

チャット画面のヘッダーまたは入力エリア上部に配置可能なコンパクトなモデル選択UIを共通コンポーネントとして作成する。

- FR-1.1: 現在選択中のプロバイダー名とモデル名をコンパクトに表示する
- FR-1.2: クリックでドロップダウンを展開し、プロバイダーとモデルを選択できる
- FR-1.3: プロバイダー変更時にモデルリストが連動して更新される
- FR-1.4: 選択変更時に `llmSlice.selectProvider()` / `llmSlice.selectModel()` を呼び出し、Main Processに同期する
- FR-1.5: ヘルスステータスをアイコンで表示する（正常=緑、異常=赤、未確認=灰）
- FR-1.6: 未選択状態では「モデルを選択」プレースホルダーを表示する

#### FR-2: ChatViewへの配置

- FR-2.1: ChatViewのメッセージエリア上部（ヘッダー部分）にインラインモデルセレクタを配置する
- FR-2.2: モデル選択済みの場合、LLMGuidanceBannerは非表示のままとする（既存動作維持）
- FR-2.3: モデル未選択状態でもインラインセレクタから直接選択可能にし、Settings遷移を不要にする

#### FR-3: WorkspaceChatPanelへの配置

- FR-3.1: WorkspaceChatPanelの入力エリア上部にインラインモデルセレクタを配置する
- FR-3.2: モデル選択済みの場合、既存のGuidanceBlock(variant="blocked")を非表示にする
- FR-3.3: WorkspaceChatControllerのblocked判定と連動する

### ステップ2: 非機能要件（NFR）

#### NFR-1: パフォーマンス

- NFR-1.1: ドロップダウンの展開/折りたたみのアニメーション duration を CSS で 200ms に設定する
- NFR-1.2: プロバイダー/モデル選択時のStore更新は100ms以内に画面反映される
- NFR-1.3: 個別セレクタ（P31対策）を使用し、不要な再レンダーを防止する

#### NFR-2: アクセシビリティ（WCAG 2.1 AA）

- NFR-2.1: キーボード操作で全機能にアクセス可能（Tab/Enter/Escape）
- NFR-2.2: ARIA属性を適切に付与（`role="combobox"`, `aria-expanded`, `aria-label`）
- NFR-2.3: コントラスト比4.5:1以上を確保

#### NFR-3: デザイン一貫性

- NFR-3.1: Apple HIG準拠のカラーパレット・角丸・シャドウを使用
- NFR-3.2: ライト/ダークモード両対応
- NFR-3.3: 8pxグリッドでスペーシングを統一
- NFR-3.4: 既存の `components/llm/` のビジュアルスタイルと統一

#### NFR-4: 再利用性

- NFR-4.1: 共通コンポーネントとして `components/llm/` に配置する
- NFR-4.2: ChatView/WorkspaceChat以外の画面（将来的なAgent実行画面等）でも使用可能な設計
- NFR-4.3: `compact` プロパティでサイズ切り替えが可能

### ステップ3: スコープ定義

#### スコープ内

- チャット内インラインモデルセレクタの共通コンポーネント作成
- ChatViewへの配置と既存LLMGuidanceBannerとの連携
- WorkspaceChatPanelへの配置と既存GuidanceBlockとの連携
- 既存の `llmSlice` Store / IPC を使用したモデル選択機能

#### スコープ外

- per-chatモデル選択（各チャットごとに異なるモデルを記憶する機能）
- LLM設定の永続化（TASK-FIX-LLM-CONFIG-PERSISTENCEで対応）
- ストリーミングエラーのUI改善（TASK-FIX-WORKSPACE-CHAT-STREAM-ERRORで対応）
- Settings画面のモデル選択UIの変更
- 新規IPCチャンネルの追加（既存IPCで対応可能）

### ステップ4: 受け入れ基準

#### AC-1: 共通コンポーネントの動作

- `InlineModelSelector` コンポーネントが `components/llm/` に存在する
- ドロップダウンでプロバイダーとモデルを選択できる
- 選択変更がZustand Store経由でMain Processに同期される
- `compact` propでサイズ切り替えが機能する
- ヘルスステータスが視覚的に表示される

#### AC-2: ChatViewでの動作

- ChatViewのヘッダー部分にインラインモデルセレクタが表示される
- モデル未選択状態からインラインセレクタで直接選択できる
- 選択後にLLMGuidanceBannerが非表示になる
- チャット送信がモデル選択に連動して動作する

#### AC-3: WorkspaceChatでの動作

- WorkspaceChatPanelにインラインモデルセレクタが表示される
- モデル未選択時のGuidanceBlock(variant="blocked")がセレクタに置き換わる
- 選択後にチャット入力が有効化される

#### AC-4: アクセシビリティ

- キーボードのみで全操作が完了する
- スクリーンリーダーで選択状態が読み上げられる
- ライト/ダークモード両方でコントラスト比基準を満たす

#### AC-5: 再利用性

- `components/llm/index.ts` からエクスポートされている
- ChatView/WorkspaceChat以外のコンテキストでも使用可能なAPI設計

## 統合テスト連携（Phase 1）

- 受け入れ基準AC-1〜AC-5をテストケース設計の基盤とする
- 既存の `LLMSelectorPanel.test.tsx` のテストパターンを参考にする
- P31（Zustand無限ループ）対策として個別セレクタの使用をテストで検証する

## 多角的チェック観点

| 観点             | 適用   | 確認内容                                    |
| ---------------- | ------ | ------------------------------------------- |
| UI/UX            | 該当   | Apple HIG準拠、コンパクト表示の操作性       |
| アーキテクチャ   | 該当   | 既存Store/IPC活用、コンポーネント分離       |
| アクセシビリティ | 該当   | WCAG 2.1 AA、キーボード操作、ARIA属性       |
| セキュリティ     | 非該当 | 新規IPC追加なし、既存セキュリティ契約を維持 |
| パフォーマンス   | 該当   | 再レンダー最小化、P31/P48対策               |

## 成果物

| 成果物     | パス                                                                                                                    | 説明           |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- | -------------- |
| 要件定義書 | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/phase-1-requirements.md` | 本ドキュメント |

## 完了条件

- [x] P50チェック（既実装調査）を完了
- [x] 機能要件（FR-1〜FR-3）を定義
- [x] 非機能要件（NFR-1〜NFR-4）を定義
- [x] スコープ（含む/含まない）を明確化
- [x] 受け入れ基準（AC-1〜AC-5）を定義
- [x] 関連する既存タスクとの関係を整理
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

→ `phase-2-design.md`（同ディレクトリ内）
