# Phase 1: 要件定義

## メタ情報

| 項目       | 値                                            |
| ---------- | --------------------------------------------- |
| Phase番号  | 1                                             |
| 機能名     | WorkspaceChat ストリーミングエラーUX改善      |
| タスクID   | TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR          |
| 作成日     | 2026-03-20                                    |
| 依存タスク | TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE (参照) |

## 目的

WorkspaceChat画面のストリーミングチャットにおいて、エラー発生時のUXを改善する。現状はエラーメッセージのテキスト表示のみで、ユーザーが次に取るべきアクションへの誘導がない。エラー種別に応じた適切なUI表示と、アクション可能なエラーにはボタンを提供することでユーザーの自己解決率を向上させる。

## 実行タスク

### Task 1: 現状コードの調査（P50チェック）

既実装の調査を実施し、新規実装と既存機能の重複を防ぐ。

```bash
# ストリームエラーハンドリングの現状確認
grep -n "onStreamError\|streamingError\|errorMessage\|setErrorMessage" \
  apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts

# エラー表示UIの現状確認
grep -n "errorMessage\|ErrorMessage\|error-message" \
  apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx \
  apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatInput.tsx

# Task 1（TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE）の既存エラーUIパターン確認
grep -rn "StreamingError\|ErrorAction\|retryable" \
  apps/desktop/src/renderer/views/
```

### Task 2: 機能要件の確定

以下の機能要件を定義する。

#### 機能要件 FR-1: エラー種別判定と状態拡張

- `useWorkspaceChatController.ts` の `WorkspaceChatController` インターフェースに `streamingError` 状態を追加する
- `streamingError` は `{ code: string; message: string; retryable: boolean; action?: "SETTINGS" | "RETRY" | null }` の構造を持つ
- 既存の `errorMessage: string | null` は後方互換のため維持する

#### 機能要件 FR-2: エラーコード別アクション定義

| エラーコード       | アクション | UI表示                           |
| ------------------ | ---------- | -------------------------------- |
| `API_KEY_MISSING`  | `SETTINGS` | Settings画面への誘導ボタン       |
| `MODEL_NOT_FOUND`  | `SETTINGS` | Settings画面への誘導ボタン       |
| `NETWORK_ERROR`    | `RETRY`    | リトライボタン                   |
| `TIMEOUT`          | `RETRY`    | リトライボタン                   |
| `RATE_LIMIT`       | `RETRY`    | リトライボタン（待機ヒント付き） |
| `VALIDATION_ERROR` | なし       | エラーメッセージのみ             |
| その他             | なし       | エラーメッセージのみ             |

#### 機能要件 FR-3: Settings誘導

- `API_KEY_MISSING` / `MODEL_NOT_FOUND` エラー時に「Settings を開く」ボタンを表示する
- ボタンクリック時に Settings 画面の AI Provider セクションへ遷移する
- 既存の `useNavigate` / `useAppStore` の設定画面遷移パターンを利用する

#### 機能要件 FR-4: リトライ機能

- `NETWORK_ERROR` / `TIMEOUT` / `RATE_LIMIT` エラー時に「再試行」ボタンを表示する
- リトライは最後に送信したメッセージを再送する
- リトライ中はボタンをdisable状態にする
- `RATE_LIMIT` 時は「しばらく待ってから再試行してください」のヒントテキストを追加表示する

#### 機能要件 FR-5: エラー後のchat状態リセット

- エラー発生後にchat状態（`isStreaming`, `isSending`, `streamContent`）が確実に正常値に戻ること
- エラーメッセージを閉じる（dismissする）ときに `streamingError` / `errorMessage` をクリアする
- エラー後でも次のメッセージ送信が可能な状態になること

### Task 3: 非機能要件の確定

#### 非機能要件 NFR-1: Apple HIG準拠のエラーUI

- エラー表示は Apple HIG の `systemRed` (`#FF3B30` ライト / `#FF453A` ダーク) を使用する
- エラーアイコンには `exclamationmark.triangle` に相当するアイコンを使用する
- アクションボタンは Apple HIG の `systemBlue` (`#007AFF` ライト / `#0A84FF` ダーク) を使用する
- アニメーションは 200-300ms の range に収める

#### 非機能要件 NFR-2: アクセシビリティ

- エラーメッセージに `role="alert"` を付与する
- ボタンには適切な `aria-label` を設定する
- キーボード操作でボタンを選択・実行できること

#### 非機能要件 NFR-3: 状態の安全性

- エラー後にストリームリスナーが誤作動しないこと
- リトライ中に新規メッセージ送信を試みた場合は既存の `isSending` ガードで防ぐこと

### Task 4: 受入基準の確定

```
AC-1: API_KEY_MISSING エラー発生時
  - エラーメッセージが表示される
  - 「Settings を開く」ボタンが表示される
  - ボタンクリック時に Settings > AI Provider へ遷移する

AC-2: NETWORK_ERROR / TIMEOUT エラー発生時
  - エラーメッセージが表示される
  - 「再試行」ボタンが表示される
  - ボタンクリック時に直前のメッセージが再送される
  - リトライ完了または別のエラー発生まで「再試行」ボタンはdisabled状態になる

AC-3: RATE_LIMIT エラー発生時
  - エラーメッセージ + 「しばらく待ってから再試行してください」ヒントが表示される
  - 「再試行」ボタンが表示される

AC-4: VALIDATION_ERROR / その他エラー発生時
  - エラーメッセージのみ表示される
  - アクションボタンは表示されない

AC-5: エラー後のchat状態
  - isStreaming === false
  - isSending === false
  - streamContent === ""
  - 次のメッセージ送信が可能な状態

AC-6: エラーのdismiss
  - エラーメッセージを閉じると streamingError / errorMessage がクリアされる
```

## 参照資料

### システム仕様（aiworkflow-requirements）

| ドキュメント            | パス                                                                            | 参照目的                       |
| ----------------------- | ------------------------------------------------------------------------------- | ------------------------------ |
| エラーハンドリング仕様  | `.claude/skills/aiworkflow-requirements/references/error-handling.md`           | エラーカテゴリ定義             |
| エラーハンドリング コア | `.claude/skills/aiworkflow-requirements/references/error-handling-core.md`      | エラーコード一覧・リトライ戦略 |
| LLM IPC契約             | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`            | `LLMError` / `streamChat` 契約 |
| 状態管理アーキテクチャ  | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | Zustand設計原則                |
| Workspace UI surface    | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | Workspace Chat Panel 既存契約  |
| ナビゲーション          | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`         | Settings 誘導の責務            |
| アーキテクチャ概要      | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`    | レイヤー設計                   |

### 実装ファイル

| ファイル             | パス                                                                                | 参照目的                             |
| -------------------- | ----------------------------------------------------------------------------------- | ------------------------------------ |
| コントローラーフック | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` | 現状のエラーハンドリング（L545-589） |
| チャットパネル       | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`              | エラーUI追加対象                     |
| チャット入力         | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatInput.tsx`              | エラー時状態表示対象                 |

## 実行手順

1. **P50チェック実施**: Task 1のコマンドを実行し、既実装のエラーハンドリングを調査する
   - 既存の `errorMessage` state の使われ方を確認する
   - Task 1（TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE）で共通化された部品があれば流用を検討する
2. **機能要件レビュー**: Task 2の各FRに対してステークホルダーとレビューする
3. **非機能要件レビュー**: Task 3の各NFRを確認する
4. **受入基準確定**: Task 4のACリストを最終確定する
5. **Phase 2へ引き渡し**: 確定した要件・受入基準を Phase 2 設計書に伝達する

## 統合テスト連携

- `useWorkspaceChatController.runtime.test.ts` で structured error state、retry、dismiss の状態遷移を固定する。
- `WorkspaceChatPanel.runtime.test.tsx` で `streamingError` 優先表示と inline fallback の境界を固定する。
- Phase 11 では `pnpm --filter @repo/desktop screenshot:workspace-chat-stream-error` により Settings / Retry / dismiss / non-action error を visual evidence として残す。

## 成果物

| 成果物                           | パス                                                                                | 形式     |
| -------------------------------- | ----------------------------------------------------------------------------------- | -------- |
| Phase 1 要件定義書（本ファイル） | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-1-requirements.md` | Markdown |

## 完了条件

- [ ] P50チェック（既実装調査）を実施済み
- [ ] 機能要件 FR-1 〜 FR-5 が確定済み
- [ ] 非機能要件 NFR-1 〜 NFR-3 が確定済み
- [ ] 受入基準 AC-1 〜 AC-6 が確定済み
- [ ] Task 1（TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE）との設計共通化方針が確認済み
- [ ] Phase 2 設計書への引き渡し準備完了

## 次Phase

Phase 2: 設計 (`phase-2-design.md`)
