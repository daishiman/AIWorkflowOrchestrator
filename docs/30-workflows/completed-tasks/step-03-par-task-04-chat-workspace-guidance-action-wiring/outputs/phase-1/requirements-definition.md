# Phase 1: 要件定義書 - Requirements Definition

## メタ情報

| 項目     | 内容                                               |
| -------- | -------------------------------------------------- |
| タスクID | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |
| Phase    | 1                                                  |
| 作成日   | 2026-03-22                                         |

## 1. 機能要件 (FR)

### FR-1: blocked reason -> action mapping

blocked reason ごとに primary CTA と secondary CTA を定義し、surface 間で一貫させる。

| blocked reason     | 日本語名称       | primary CTA     | secondary CTA    | 遷移先                |
| ------------------ | ---------------- | --------------- | ---------------- | --------------------- |
| `NO_PROVIDER`      | Provider 未選択  | 設定を見る      | terminal を開く  | Settings / Shell      |
| `NO_MODEL`         | Model 未選択     | 設定を見る      | terminal を開く  | Settings / Shell      |
| `NO_API_KEY`       | API Key 未設定   | 設定を見る      | terminal を開く  | Settings / Shell      |
| `AUTH_EXPIRED`     | 認証期限切れ     | 設定を見る      | terminal を開く  | Settings / Shell      |
| `NETWORK_ERROR`    | ネットワーク不可 | 接続を再確認    | terminal を開く  | Settings / Health Row |
| `POLICY_VIOLATION` | Policy 実行拒否  | terminal を開く | command をコピー | Terminal Surface      |

CTA 上限: primary 1個 + secondary 1個

### FR-2: central policy 消費

ChatView と WorkspaceChatPanel は RuntimePolicy DTO を消費し、local runtime 判定を持たない。

- policy 判定は Main Process (RuntimePolicyResolver) が一元管理
- Renderer は policy DTO の `type` フィールドで分岐:
  - `integrated` → ready 状態、送信可能
  - `handoff` → HandoffGuidance を表示
  - `blocked` → GuidanceBlock を表示

### FR-3: guidance 生成の一元化

blocked reason に対応する guidance（メッセージ、CTA ラベル、遷移先）を1箇所で定義し、ChatView / WorkspaceChatPanel が同一の定義を参照する。

### FR-4: handoff guidance 表示

`POLICY_VIOLATION` (subscription-active 等) の場合、HandoffGuidance を構築し以下を表示:

- reason（理由テキスト）
- terminalCommand（suggested command）
- contextSummary（workspace context 要約）
- primary CTA: terminal を開く
- secondary CTA: command をコピー

### FR-5: settings 到達導線

blocked 状態から Settings 画面到達まで 2 クリック以下。

- GuidanceBlock の primary CTA クリック → Settings 画面直行（1 クリック）

## 2. 非機能要件 (NFR)

### NFR-1: 再描画安全性

- P31 対策: 個別セレクタを使用し、合成 Hook の戻り値を useEffect 依存配列に含めない
- P48 対策: `.filter()` / `.map()` で新規配列を返すセレクタには `useShallow` を適用

### NFR-2: CTA copy consistency

ChatView と WorkspaceChatPanel で同一の blocked reason に対して同一のメッセージテキスト・CTA ラベルを表示する。

### NFR-3: no-op CTA 排除

- GuidanceBlock の AND ガード (`actionLabel && onAction`) を維持
- 応答不可能な操作を勧める CTA を表示しない
- `blocked` / `guidance-only` 時に `retry` を primary CTA にしない

### NFR-4: silent fallback 禁止

- P62 対策: Provider/Model 未選択時に DEFAULT_CONFIG へ暗黙 fallback しない
- エラー時は明示的にユーザーへ表示し、設定画面またはターミナルへ誘導

## 3. 受入基準 (AC) - 検証可能化

| AC   | 基準                                                                       | 検証方法                                                                                              |
| ---- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| AC-1 | blocked reason ごとに primary / secondary action が定義されている          | FR-1 の mapping table が全 reason をカバー + テスト matrix で各 reason の CTA 表示を検証              |
| AC-2 | ChatView と WorkspaceChatPanel が local runtime 判定を持たない             | `grep -rn "selectedModelId.*===.*null" ChatView/ WorkspaceChatPanel/` が 0 件 + policy DTO 経由で判定 |
| AC-3 | workspace context / selected config / handoff summary の受け渡し境界が明示 | contract-matrix.md で state ownership が surface ごとに表定義されている                               |
| AC-4 | no-op CTA を排除する wiring plan と test matrix がある                     | test-matrix.md で全 reason x surface の CTA click → 遷移先の検証行がある                              |
| AC-5 | blocked 状態から設定画面到達まで 2 クリック以下                            | GuidanceBlock primary CTA → setCurrentView("settings") の 1 クリック動線が設計図に含まれる            |

## 4. Phase 2 への論点（concern）

### Concern-1: guidance 配置先の選択

guidance 生成ロジックの配置先を以下の3択から Phase 2 で決定する:

- **A**: PolicyResolver の出力 DTO に guidance フィールドを追加（一元管理）
- **B**: 共有 Hook（useBlockedGuidance）で reason → guidance を変換（UI層で完結）
- **C**: Store の derived state として computed guidance を提供（リアクティブ更新）

### Concern-2: 既存 chatSlice state の活用方針

chatSlice に定義済みだが未使用の state（ChatPanelStatus, streamingError, resolvedCapability）を:

- 本タスクで活用するか
- 別タスクへ委譲するか
- 削除候補とするか

### Concern-3: CTA ラベル・メッセージの統一ソース

現状 ChatView と WorkspaceChatPanel で異なるメッセージ・ラベルが使われている。統一ソースの配置先を Phase 2 で決定する。

## 5. 統合テスト連携

| 統合ポイント     | 観点                                                    | 対象 Phase |
| ---------------- | ------------------------------------------------------- | ---------- |
| UI state         | blocked reason → GuidanceBlock 表示の整合               | 3, 4, 11   |
| IPC              | RuntimePolicy DTO の shape が surface 消費と一致        | 4, 9       |
| Settings 遷移    | setCurrentView("settings") の1クリック到達              | 5, 11      |
| Terminal handoff | HandoffGuidance.build() → GuidanceBlock.handoff variant | 4, 5, 11   |
