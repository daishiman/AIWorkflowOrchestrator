# Phase 3 設計レビュー報告 - workspace-chat-edit-runtime-activation

## メタ情報

| 項目       | 内容                                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 3                                                                                                                               |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001                                                                                     |
| 作成日     | 2026-03-14                                                                                                                      |
| 依存成果物 | Phase 1: requirements-definition.md, scope-definition.md / Phase 2: design-summary.md, contract-matrix.md, ui-ux-realization.md |
| 総合判定   | **PASS** (MINOR 1件)                                                                                                            |

---

## 1. レビュー観点別判定

### 観点 1: production stub が残らない設計か

| 評価項目                                | 判定 | 根拠                                                                             |
| --------------------------------------- | ---- | -------------------------------------------------------------------------------- |
| ipc/index.ts の stubLLMAdapter 除去方針 | PASS | Phase 2 design-summary.md §6 で RuntimeResolver 経由への変更を明記               |
| handleGetSelection の null 固定除去方針 | PASS | Phase 1 GAP-01 で廃止候補として記録、renderer 側 selection 管理への移行を設計    |
| ChatEditService の DI ポイント活用      | PASS | 既設計の LLMAdapter DI ポイントに real adapter を注入する設計（Phase 2 §5 参照） |
| TerminalHandoffBuilder の新規設計       | PASS | Phase 2 design-summary.md §5 でインターフェースを定義済み                        |

**判定: PASS** — stub 除去方針が全箇所で明文化されている。

---

### 観点 2: selection 失敗と LLM 実行失敗が別メッセージで扱えるか

| 評価項目                            | 判定 | 根拠                                                                         |
| ----------------------------------- | ---- | ---------------------------------------------------------------------------- |
| SELECTION_REQUIRED エラーコード定義 | PASS | Phase 2 contract-matrix.md §5 で新コード定義済み (retryable: false)          |
| LLM_ERROR との分離                  | PASS | Phase 1 REQ-17〜21 で各エラーを別コードで定義                                |
| renderer 側の UX 分岐               | PASS | Phase 2 ui-ux-realization.md §3 で状態遷移マトリクスに各エラーの遷移先を明記 |
| マイクロコピーの分離                | PASS | selection なし / API key 未設定 / rate limit / timeout で別メッセージ定義    |

**判定: PASS** — 全エラー種別が別コードと別 UX で処理される設計になっている。

---

### 観点 3: workspacePath 制約が integrated runtime と terminal handoff の両経路で維持されるか

| 評価項目                                                  | 判定 | 根拠                                                                 |
| --------------------------------------------------------- | ---- | -------------------------------------------------------------------- |
| handleSendWithContext への workspacePath 検証追加         | PASS | Phase 2 contract-matrix.md §3 で `workspacePath?: string` 追加設計   |
| terminal handoff 経路での workspacePath 維持              | PASS | Phase 2 design-summary.md §4 Step 5 で両経路共通の検証を設計         |
| TerminalHandoffBuilder の contextSummary に workspacePath | PASS | Phase 1 REQ-15 で contextSummary に workspacePath を含める要件を定義 |
| read/write 既実装の維持                                   | PASS | Phase 1 scope-definition.md §1-2 で「既存維持」として記録            |

**判定: PASS** — 全経路で workspacePath 制約が維持される設計。

---

### 観点 4: Chat Edit 専用 IPC 契約が drift していないか

| 評価項目                          | 判定  | 根拠                                                                                                                             |
| --------------------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------- |
| CHAT_EDIT_CHANNELS 定数との整合   | PASS  | Phase 2 contract-matrix.md §2 で全チャンネルを CHAT_EDIT_CHANNELS と照合                                                         |
| chatEditApi.ts (Preload) との整合 | MINOR | chatEditApi.ts が contextBridge.exposeInMainWorld 未使用の可能性あり（Phase 1 §4-1）。修正方針は定義されているが実装確認が未実施 |
| 新エラーコードと型定義の整合      | PASS  | Phase 2 contract-matrix.md §5 で SendError.code の拡張として定義                                                                 |
| handoff フィールドと既存型の整合  | PASS  | Phase 2 contract-matrix.md §4 で SendWithContextResponse 拡張設計を明記                                                          |

**MINOR 指摘 M-01**: `chatEditApi.ts` の `contextBridge.exposeInMainWorld` 未使用確認が未実施。セキュリティ上のリスクであり、Phase 5 実装計画に「Preload の contextBridge 利用確認と修正」を必須アクションとして追記すること。

---

## 2. セキュリティ観点レビュー

| セキュリティ項目                 | 判定  | 根拠                                                                            |
| -------------------------------- | ----- | ------------------------------------------------------------------------------- |
| path traversal 防止（既実装）    | PASS  | chatEditHandlers.ts で `..` と `//` を検出（既実装維持）                        |
| sender 検証                      | PASS  | Phase 2 contract-matrix.md §8 で全チャンネルの sender 検証を記述                |
| API key の secret masking        | PASS  | Phase 2 design-summary.md §6 で sanitizeRegistrationErrorMessage パターンを継承 |
| workspacePath 外アクセスブロック | PASS  | 全経路での適用を設計（観点3 参照）                                              |
| contextBridge 経由の公開         | MINOR | M-01 と同じ（Preload の公開方式確認が必要）                                     |

---

## 3. UX 観点レビュー

| UX 項目                          | 判定 | 根拠                                                                                   |
| -------------------------------- | ---- | -------------------------------------------------------------------------------------- |
| missing credentials 時の文言     | PASS | Phase 2 ui-ux-realization.md §5 で「この画面では自動実行せず terminal で続ける」を定義 |
| timeout 時の文言                 | PASS | Phase 2 ui-ux-realization.md §5 で「応答がタイムアウトしました。再試行できます」を定義 |
| rate limit 時の文言              | PASS | Phase 2 ui-ux-realization.md §5 で「しばらくしてから再試行してください」を定義         |
| CTA のキーボードアクセシビリティ | PASS | Phase 2 ui-ux-realization.md §6 で ARIA role と keyboard navigation を定義             |
| WCAG 2.1 AA コントラスト比       | PASS | Phase 2 ui-ux-realization.md §6 に検証テーブル掲載（注意点も明記）                     |

---

## 4. Task01 契約との整合確認

| 確認項目                       | 判定 | 根拠                                                                               |
| ------------------------------ | ---- | ---------------------------------------------------------------------------------- |
| RuntimeResolver の共通契約継承 | PASS | Phase 1 scope-definition.md §3-1 で Task01 foundation を依存に明記                 |
| fail-fast パターンの継承       | PASS | Phase 2 design-summary.md §3 で handleSendWithContext の早期リターンパターンを設計 |
| terminal boundary の維持       | PASS | terminal handoff は実行を行わず guidance のみ返す設計                              |
| access matrix の参照           | PASS | Phase 2 design-summary.md §3 RuntimeResolver で auth mode を参照                   |

---

## 5. 総合判定

| 判定レベル | 件数 | 詳細                                                  |
| ---------- | ---- | ----------------------------------------------------- |
| MAJOR      | 0    | -                                                     |
| MINOR      | 1    | M-01: chatEditApi.ts の contextBridge 利用確認        |
| 指摘なし   | -    | stub 除去、エラー分離、workspacePath、UX、Task01 整合 |

### 総合判定: **PASS（MINOR 対応あり）**

MAJOR 指摘 0 件のため Phase 4 へ進む。MINOR 指摘 M-01 は Phase 5 実装計画に必須アクションとして記録する。

---

## 6. MINOR 指摘 M-01 の対応指示

**指摘**: `chatEditApi.ts` の Preload 公開方式
**内容**: `chatEditApi.ts` L138 で `window.chatEditAPI` に直接代入しており、`contextBridge.exposeInMainWorld` を使用していない可能性がある。
**リスク**: `contextIsolation: true` 環境で Renderer が chatEditAPI にアクセスできない、またはセキュリティポリシー違反になる
**対応**: Phase 5 実装計画（implementation-plan.md）に以下を追記すること:

1. `chatEditApi.ts` の公開方式を `contextBridge.exposeInMainWorld('chatEditAPI', chatEditAPI)` に変更
2. `preload/index.ts` で `exposeChatEditAPI()` が呼び出されているかを確認
3. Renderer の `window.chatEditAPI` 参照を型定義ファイルで宣言

---

## 7. 次 Phase への引き継ぎ

- Phase 4 (テスト作成) では M-01 の contextBridge 修正後の動作テストを含むこと
- Phase 5 (実装計画) では M-01 の対応アクションを必須として記録すること
- RuntimeResolver の auth mode 分岐テストを Phase 4 テストマトリクスに含めること
