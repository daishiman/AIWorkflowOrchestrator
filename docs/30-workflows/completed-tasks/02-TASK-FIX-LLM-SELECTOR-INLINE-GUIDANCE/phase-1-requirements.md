# Phase 1: 要件定義

## メタ情報

| 項目       | 値                                    |
| ---------- | ------------------------------------- |
| Phase番号  | 1                                     |
| 機能名     | LLMモデル選択インラインガイダンス追加 |
| タスクID   | TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE |
| 作成日     | 2026-03-20                            |
| ステータス | 作成済み                              |

## 目的

ChatView画面とWorkspaceView画面においてLLMモデル選択UIへの導線が不明瞭な問題を解消する。ユーザーがモデル未選択のままリクエストを送信して無言で失敗するケースを防止し、Settings画面のLLMセクションへ直接遷移できる導線を両画面に追加する。

## 実行タスク

### Task 1: 現状調査（P50チェック — 既実装確認）

モデル未選択時の導線実装が既に存在するか調査する。

調査対象:

- `apps/desktop/src/renderer/views/ChatView/index.tsx` — ガイダンス表示の有無
- `apps/desktop/src/renderer/views/WorkspaceView/index.tsx` — GuidanceBlockの実装
- `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx` — 設定リンクの有無
- `apps/desktop/src/renderer/store/slices/llmSlice.ts` — selectedModelId / selectedProviderId セレクタの有無

#### P50調査結果（実施済み）

| 調査対象                                  | 結果                                                                                                                  |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `useSelectedModelId`                      | **実装済み** — `store/index.ts` L465-466                                                                              |
| `useSelectedProviderId`                   | **実装済み** — `store/index.ts` L459-460                                                                              |
| `useSetCurrentView`                       | **実装済み** — `store/index.ts` L267-268                                                                              |
| `ChatView/LLMGuidanceBanner.tsx`          | **未存在** — 新規作成が必要                                                                                           |
| `WorkspaceChatPanel.tsx` の GuidanceBlock | **部分実装** — `actionLabel="Settings を開く"` は設定済み、`onAction` が未接続でボタン非表示                          |
| GuidanceBlock の Props パターン           | `actionLabel?: string` + `onAction?: () => void` の**分離型**（`action={{ label, onClick }}` オブジェクト型ではない） |
| GuidanceBlock の variant                  | `"error" \| "handoff" \| "blocked"` の3種類。blocked 時は `--status-primary`（青系）                                  |
| GuidanceBlock の role                     | `role="status"` を使用                                                                                                |

**フェーズ判断**: Phase 4-5 を「検証・補完」モードに切り替える（P50準拠）。

調査結果に応じた判断:

- 既実装が確認された場合: Phase 4-5 を「検証・補完」モードに切り替え、P50に従い Phase ゲートを調整する
- 未実装が確認された場合: 通常フローで Phase 2 へ進む

### Task 2: 機能要件定義

#### FR-1: ChatViewガイダンスバナー

| ID     | 要件                                                             | 受入基準                                                                         |
| ------ | ---------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| FR-1-1 | モデル未選択時、ChatViewヘッダー部にガイダンスバナーを表示する   | `selectedModelId === null` または `selectedProviderId === null` のとき表示される |
| FR-1-2 | バナーには「AIモデルが選択されていません」旨のテキストを表示する | バナー内にメッセージテキストが存在する                                           |
| FR-1-3 | バナーには「設定画面へ」ボタンを表示する                         | ボタンクリックでSettings画面LLMセクションへ遷移する                              |
| FR-1-4 | モデル選択後、バナーを自動的に非表示にする                       | `selectedModelId` が非null値になった時点でバナーが消える                         |

#### FR-2: WorkspaceViewGuidanceBlock改善

| ID     | 要件                                                                                                                   | 受入基準                                                |
| ------ | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| FR-2-1 | WorkspaceViewの既存GuidanceBlockの `onAction` props を接続し設定画面遷移ボタンを有効化する（`actionLabel` は設定済み） | GuidanceBlock内に設定画面リンクボタンが表示され動作する |
| FR-2-2 | ボタンクリックでSettings画面LLMセクションへ遷移する                                                                    | クリック後にSettings画面が表示される                    |

#### FR-3: Settings画面遷移

| ID     | 要件                                   | 受入基準                                    |
| ------ | -------------------------------------- | ------------------------------------------- |
| FR-3-1 | 両画面からSettings画面へ直接遷移できる | `setCurrentView("settings")` が呼び出される |

### Task 3: 非機能要件定義

| ID    | 要件                                              | 基準                                                             |
| ----- | ------------------------------------------------- | ---------------------------------------------------------------- |
| NFR-1 | Apple HIG準拠のUI設計                             | `.claude/rules/01-architecture.md` 内 Apple HIG セクションに準拠 |
| NFR-2 | systemBlue (#007AFF) をアクセントカラーとして使用 | ライトモードで #007AFF、ダークモードで #0A84FF を使用            |
| NFR-3 | アニメーションは 200-300ms の範囲内               | バナー表示/非表示のトランジションが 200-300ms                    |
| NFR-4 | コントラスト比 4.5:1 以上                         | WCAG 2.1 AA 準拠                                                 |
| NFR-5 | Zustand 個別セレクタで状態を取得する（P31対策）   | `useSelectedModelId()` 等の個別セレクタを使用                    |

### Task 4: スコープ外定義

以下はこのタスクのスコープ外とする:

- Settings画面のLLMセクション実装自体の変更
- LLMSelectorPanelコンポーネントの変更
- ChatView内でのインラインモデル選択UI追加（別タスク）
- モデル選択のデフォルト値設定ロジック変更（P62対策として変更しない）

## 参照資料

### システム仕様（aiworkflow-requirements）

| ファイル                                                                     | 用途                                        |
| ---------------------------------------------------------------------------- | ------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | UI/UX設計哲学、Apple HIG準拠設計原則        |
| `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | Zustand Store設計原則、個別セレクタパターン |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`   | デザインシステム仕様                        |

### プロジェクトルール

| ファイル                                 | 用途                                          |
| ---------------------------------------- | --------------------------------------------- |
| `.claude/rules/01-architecture.md`       | アーキテクチャルール、Apple HIGカラーパレット |
| `.claude/rules/03-state-management.md`   | 状態管理ルール                                |
| `.claude/rules/06-known-pitfalls.md#P31` | Zustand合成Hook無限ループ防止                 |
| `.claude/rules/06-known-pitfalls.md#P50` | 既実装防御の発見による Phase 転換             |
| `.claude/rules/06-known-pitfalls.md#P62` | DEFAULT_CONFIG への暗黙 fallback 禁止         |

### 実装対象ファイル

| ファイル                                                               | 役割                                                                                    |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/views/ChatView/index.tsx`                   | ガイダンスバナー追加対象                                                                |
| `apps/desktop/src/renderer/views/WorkspaceView/index.tsx`              | 設定リンク追加対象                                                                      |
| `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx` | GuidanceBlock改善対象                                                                   |
| `apps/desktop/src/renderer/store/slices/llmSlice.ts`                   | selectedModelId/selectedProviderId 状態定義（個別セレクタは store/index.ts に実装済み） |

## 実行手順

### Step 1: P50チェック（既実装調査）

```bash
# ChatViewのガイダンス表示確認
grep -n "guidance\|banner\|selectedModel\|LLMStatus" \
  apps/desktop/src/renderer/views/ChatView/index.tsx

# WorkspaceViewのGuidanceBlock確認
grep -n "GuidanceBlock\|guidance\|settings\|setCurrentView" \
  apps/desktop/src/renderer/views/WorkspaceView/index.tsx \
  apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx

# llmSliceの状態セレクタ確認
grep -n "selectedModelId\|selectedProviderId\|useSelected" \
  apps/desktop/src/renderer/store/slices/llmSlice.ts
```

### Step 2: 機能要件をステークホルダー視点で確認

- ユーザーが「モデルが選択されていない」状態を認識できるか
- バナーからSettings画面へ到達するステップ数が最小か（1クリック以内）
- バナーが邪魔にならず、モデル選択後に自動消えるか

### Step 3: 受入基準を検証可能な形式で記述

本ドキュメントのFR-1〜FR-3を仕様として確定する。

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこのPhaseで確認・更新する。
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと1対1で突合する。

## 成果物

| 成果物                       | パス                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------ |
| Phase 1 仕様書（本ファイル） | `docs/30-workflows/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/phase-1-requirements.md` |
| P50チェック結果              | Phase 2 仕様書の「前提調査結果」セクションに記載                                     |

## 完了条件

- [ ] P50チェック（既実装調査）が完了している
- [ ] 機能要件 FR-1〜FR-3 が定義されている
- [ ] 非機能要件 NFR-1〜NFR-5 が定義されている
- [ ] スコープ外が明確に定義されている
- [ ] 受入基準がチェック可能な形式で記述されている
- [ ] 既実装が発見された場合、フェーズ転換の判断が記録されている

## 次Phase

[Phase 2: 設計](./phase-2-design.md)
