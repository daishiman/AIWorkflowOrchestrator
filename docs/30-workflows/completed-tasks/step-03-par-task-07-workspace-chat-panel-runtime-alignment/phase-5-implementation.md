# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                 |
| ---------- | ------------------------------------------------------------------------------------ |
| Phase      | 5                                                                                    |
| Phase名    | 実装                                                                                 |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001                                         |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 3（設計レビュー）、Phase 4（テスト作成） |
| 後続Phase  | Phase 6（テスト拡充）                                                                |
| ステータス | not_started                                                                          |
| 作成日     | 2026-03-13                                                                           |
| 更新日     | 2026-03-17                                                                           |
| 機能名     | workspace-chat-panel-runtime-alignment                                               |

## 目的

Phase 4 で作成した Red テストを Green にするプロダクションコードを実装する。Phase 2 設計の authority 境界・IPC 契約・state 管理・error policy に準拠し、変更順序と影響範囲を具体化する。

## 実行タスク

### T5-1: Main Process 側実装

stream / cancel / selected config authority の変更を実装する。

### T5-2: Renderer 側 controller 実装

useWorkspaceChatController の state 管理・error handling・P62 対策を実装する。

### T5-3: Renderer 側 UI 実装

WorkspaceChatPanel の 5 領域構成・状態遷移・CTA 活性/非活性を実装する。

### T5-4: access capability 統合

Task01 の AccessCapabilityResolver 結果を消費し、guidance / handoff 分岐を実装する。

### T5-5: transcript 受け取り実装

transcript provenance chip と composer attachment 連携を実装する。

### T5-6: compact UX 実装

ResizeObserver による幅検知と compact レイアウト切替を実装する。

## 実装順序と変更境界

### Phase A: Main Process（T5-1）

変更の下流影響が最大のため最初に実装する。

| 順序 | 変更対象                         | 変更内容                                                                       | 影響範囲              |
| ---- | -------------------------------- | ------------------------------------------------------------------------------ | --------------------- |
| A-1  | `llm.ts` handleStreamChat        | selectedModelId 必須検証を追加（P62: fallback 禁止）                           | stream-chat IPC 契約  |
| A-2  | `llm.ts` handleSetSelectedConfig | modelId.trim() 空文字検証を追加（P42 準拠）                                    | set-config IPC 契約   |
| A-3  | `llm.ts` handleStreamChat        | API_KEY_MISSING エラー時のメッセージを guidance 向けに整形                     | error レスポンス形式  |
| A-4  | conversation handlers            | conversation:create / addMessage の error wrapper を { success, error } に統一 | conversation IPC 契約 |

### Phase B: Renderer Controller（T5-2）

Main 側の契約変更に合わせて controller を更新する。

| 順序 | 変更対象                   | 変更内容                                                        | 影響範囲                   |
| ---- | -------------------------- | --------------------------------------------------------------- | -------------------------- |
| B-1  | useWorkspaceChatController | sendMessage に selectedModelId !== null ガード追加              | sendMessage callback       |
| B-2  | useWorkspaceChatController | buildChatRequest から `?? "gpt-4o"` fallback 削除（P62）        | request 組立               |
| B-3  | useWorkspaceChatController | onStreamError の error.code に応じた guidance メッセージ分岐    | errorMessage 表示          |
| B-4  | useWorkspaceChatController | buildFileContextBlock の Error throw を errorMessage 設定に変更 | file read failure handling |
| B-5  | useWorkspaceChatController | accessCapability state の消費を追加                             | CTA 活性/非活性            |

### Phase C: Renderer UI（T5-3, T5-5, T5-6）

Controller の変更に合わせて UI を更新する。

| 順序 | 変更対象           | 変更内容                                                       | 影響範囲                |
| ---- | ------------------ | -------------------------------------------------------------- | ----------------------- |
| C-1  | WorkspaceChatPanel | panel header に Terminal ボタン追加                            | panel header 領域       |
| C-2  | WorkspaceChatPanel | guidance block コンポーネント追加（error / handoff / blocked） | guidance block 領域     |
| C-3  | WorkspaceChatPanel | 送信ボタンに selectedModelId !== null 活性条件追加             | composer 領域           |
| C-4  | WorkspaceChatPanel | streaming 中の cancel ボタン表示                               | composer 領域           |
| C-5  | WorkspaceChatPanel | transcript provenance chip コンポーネント追加                  | file context chips 領域 |
| C-6  | WorkspaceChatPanel | compact レイアウト（ResizeObserver + CSS 切替）追加            | 全領域                  |
| C-7  | WorkspaceChatInput | selectedModelId=null 時の非活性表示とマイクロコピー追加        | composer 領域           |

### Phase D: access capability 統合（T5-4）

| 順序 | 変更対象           | 変更内容                                                          | 影響範囲            |
| ---- | ------------------ | ----------------------------------------------------------------- | ------------------- |
| D-1  | WorkspaceChatPanel | accessCapability Store から capability 状態を取得                 | panel 全体          |
| D-2  | WorkspaceChatPanel | capability に応じた CTA 分岐（integrated-api / terminal-handoff） | CTA 活性/非活性     |
| D-3  | WorkspaceChatPanel | GuidanceBlock に capability blocked メッセージ表示                | guidance block 領域 |

## Phase 5 追加チェック【必須】

### 既存テスト回帰確認の先行実行

Phase 5 実装開始前に、影響を受ける可能性がある既存テストを先行実行して baseline を確認する。

```bash
# 変更対象ファイルに関連する既存テストを実行（baseline 確認）
cd apps/desktop && pnpm vitest run src/main/handlers/llm.test.ts
cd apps/desktop && pnpm vitest run src/renderer/views/WorkspaceView/

# 変更対象ファイルを特定（定数・型変更の波及を調査）
grep -rn "\"gpt-4o\"\|DEFAULT_CONFIG" apps/desktop/src/
```

- [ ] 変更対象ファイルの既存テストが全て GREEN であることを確認した（baseline 確認）
- [ ] 新規実装後に既存テストが回帰していないことを確認した

### IPC ハンドラ register/unregister ペアの確認（P5 対策）

IPC ハンドラを新規作成・変更した場合、以下を確認する:

- [ ] `registerLlmHandlers` に対応する `unregisterLlmHandlers` が存在するか
- [ ] `unregisterAllIpcHandlers()` に新規ハンドラの解除処理が含まれているか
- [ ] macOS `activate` イベント等での再登録パスで二重登録が発生しないか

```bash
# register/unregister ペアの確認
grep -rn "register.*Handlers\|unregister.*Handlers" apps/desktop/src/main/
```

### 既存ユーティリティ重複検出（Phase 4 から継続）

Phase 4 で確認した既存ユーティリティの再利用状況を実装時にも再確認する。新規ユーティリティを作成する場合は、配置先を `architecture-implementation-patterns-core.md` の横断ユーティリティ配置ガイドラインに従って決定する。

### ファイル分離の先行実施判断基準

以下の条件のいずれかを満たす場合、Phase 8（リファクタリング）のファイル分離を Phase 5 で先行実施する:

1. テスト対象ファイルにトップレベル副作用があり、vi.mock では対処困難
2. 新規ロジックが 50 行以上で、既存ファイルの責務と明確に分離可能
3. テスト容易性が著しく低下する構造（例: GuidanceBlock を WorkspaceChatPanel.tsx に直接インライン追加）

先行実施した場合は Phase 8 で「Phase 5 で実施済み」と明記し、重複作業を防止する。

---

## 変更対象ファイル一覧

| ファイル                                                                                | 変更種別 | Phase | 概要                                     |
| --------------------------------------------------------------------------------------- | -------- | ----- | ---------------------------------------- |
| `apps/desktop/src/main/handlers/llm.ts`                                                 | 修正     | A     | P62/P42 対策、error message 整形         |
| `apps/desktop/src/main/handlers/conversation.ts`                                        | 修正     | A     | error wrapper 統一                       |
| `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts`     | 修正     | B     | P62 guard、error policy、capability 消費 |
| `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`                  | 修正     | C     | 5 領域構成、guidance、compact            |
| `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatInput.tsx`                  | 修正     | C     | 送信ボタン活性条件、cancel ボタン        |
| `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceFileContextChips.tsx`           | 修正     | C     | transcript provenance chip               |
| `apps/desktop/src/renderer/views/WorkspaceView/components/GuidanceBlock.tsx`            | 新規     | C     | error / handoff / blocked guidance       |
| `apps/desktop/src/renderer/views/WorkspaceView/components/TranscriptProvenanceChip.tsx` | 新規     | C     | transcript 共有の provenance 表示        |
| `apps/desktop/src/renderer/views/WorkspaceView/components/CompactLayout.tsx`            | 新規     | C     | compact 幅レイアウト制御                 |

## ロールバック観点

| リスク                                         | ロールバック手段                                                                                 |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| P62 fallback 削除で既存ユーザーの送信が壊れる  | selectedModelId=null 時の guidance 表示で代替する                                                |
| conversation handler の error wrapper 変更     | Renderer 側で旧形式もフォールバック受理する                                                      |
| compact レイアウトが特定解像度で崩れる         | CSS media query を fallback として残す                                                           |
| accessCapability Store が Task01 未完了で null | null の場合は capability 判定待ち（loading 状態）として CTA を非活性にする（P62: fallback 禁止） |

## 参照資料

| 参照資料                   | パス                                                                                | 内容                                         |
| -------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------- |
| Phase 2（設計）            | `phase-2-design.md`                                                                 | authority・IPC 契約・error policy を確認する |
| Phase 4（テスト作成）      | `phase-4-test-creation.md`                                                          | Red テストの期待値を確認する                 |
| WorkspaceChatPanel         | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`              | renderer 側変更点を確認する                  |
| useWorkspaceChatController | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` | controller handoff を確認する                |
| llm handlers               | `apps/desktop/src/main/handlers/llm.ts`                                             | Main authority の変更点を確認する            |

### システム仕様（aiworkflow-requirements）

> 実装時に正本と照合し、IPC 契約・セキュリティ・エラーハンドリングが仕様準拠であることを確認する。

| 参照資料                 | パス                                                                            | 照合内容                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| interfaces-llm           | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`           | IPC 契約のインデックス（詳細型定義は llm-ipc-types.md を参照）                                    |
| llm-ipc-types            | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`            | A-1〜A-4 の IPC 実装が正本の引数・戻り値型（AIChatRequest / LLMProvider）と一致するか（P60 対策） |
| llm-streaming            | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`            | handleStreamChat / handleStreamCancel の実装が stream/cancel 契約に準拠するか                     |
| error-handling           | `.claude/skills/aiworkflow-requirements/references/error-handling.md`           | T2-5 error policy（fail-fast / guidance / silent / blocked）の実装が正本 category に従うか        |
| security-electron-ipc    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`    | sender 検証 / path traversal 防止 / error masking が全 IPC handler に適用されているか             |
| arch-state-management    | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | B-5 accessCapability 消費・T2-3 state 配置が正本原則（Zustand/local 境界）に準拠するか            |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | C-1〜C-7 の UI 実装が 5 領域構成・5 状態・CTA 条件の正本と整合するか                              |

### Pitfall 準拠チェックリスト

| Pitfall | 内容                            | 実装への影響                                      |
| ------- | ------------------------------- | ------------------------------------------------- |
| P5      | リスナー二重登録                | useEffect の cleanup で listener を確実に解除する |
| P31     | Zustand Store Hooks 無限ループ  | 個別セレクタを使用し、合成 Hook を避ける          |
| P42     | .trim() バリデーション漏れ      | 全文字列引数に 3段バリデーションを適用する        |
| P46     | HTMLAttributes Props 型衝突     | Omit で衝突属性を除外する                         |
| P48     | useShallow 未適用の派生セレクタ | .filter() / .map() 結果に useShallow を適用する   |
| P62     | DEFAULT_CONFIG fallback         | `?? "gpt-4o"` を削除し、null 時は送信不可とする   |

## 統合テスト連携

streaming、context、conversation、unsupported capability guidance の変更順序を integration 想定で固定する。Phase A -> B -> C -> D の順序で Red テストを Green にし、各 Phase 完了時に `cd apps/desktop && pnpm vitest run` で回帰を確認する。

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装の場合           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計            | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |
| データ整合性       | DB操作の場合                       | `aiworkflow-requirements: database-*.md`     |
| エラーハンドリング | 例外処理が必要な場合               | `aiworkflow-requirements: error-handling.md` |
| パフォーマンス     | 性能要件がある場合                 | `aiworkflow-requirements: architecture-*.md` |
| アクセシビリティ   | UI実装の場合                       | `aiworkflow-requirements: ui-ux-*.md`        |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React実装の場合          | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer連携の場合     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | データ永続化の場合          | `aiworkflow-requirements: database-*.md`               |

## 実行手順

### ステップ1: Phase 4 テストの Red 確認 + baseline 取得

`cd apps/desktop && pnpm vitest run` で Phase 4 のテストが全て Red であることを確認する。あわせて、変更対象ファイルの既存テストを先行実行し、実装前の baseline を確認する（Phase 5 追加チェック参照）。

### ステップ2: Phase A（Main Process）実装

A-1 〜 A-4 を順次実装し、M-01 〜 M-10 のテストを Green にする。

### ステップ3: Phase B（Renderer Controller）実装

B-1 〜 B-5 を順次実装し、R-01 〜 R-24 のテストを Green にする。

### ステップ4: Phase C（Renderer UI）実装

C-1 〜 C-7 を順次実装し、U-01 〜 U-06 のテストを Green にする。

### ステップ5: Phase D（access capability 統合）実装

D-1 〜 D-3 を順次実装し、I-01 〜 I-05 の統合テストを Green にする。

### ステップ6: 全テスト Green 確認

`cd apps/desktop && pnpm vitest run` で全テストが Green であることを確認する。

## 成果物

| 成果物       | パス                                     | 内容                                           |
| ------------ | ---------------------------------------- | ---------------------------------------------- |
| 実装計画     | `outputs/phase-5/implementation-plan.md` | 変更順序、影響範囲、ロールバック観点を整理する |
| 変更ファイル | `outputs/phase-5/changed-files.md`       | 変更対象ファイルと変更内容の一覧を整理する     |

## 完了条件

- [ ] Main / Renderer / IPC の変更順序が Phase A -> B -> C -> D で固定されている
- [ ] Phase 4 の全テストケースが Green になっている
- [ ] P62 対策（DEFAULT_CONFIG fallback 削除）が実装されている
- [ ] P42 準拠の 3段バリデーションが全文字列引数に適用されている
- [ ] guidance block / transcript provenance chip / compact layout が実装されている
- [ ] access capability 統合が実装されている（Task01 未完了時の fallback 含む）
- [ ] `cd apps/desktop && pnpm vitest run` で全テスト PASS
- [ ] `pnpm lint` で警告なし
- [ ] `pnpm typecheck` でエラーなし
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

| サブタスク | 内容                        | 依存         | ステータス  |
| ---------- | --------------------------- | ------------ | ----------- |
| T5-1       | Main Process 側実装         | Phase 4 完了 | not_started |
| T5-2       | Renderer 側 controller 実装 | T5-1         | not_started |
| T5-3       | Renderer 側 UI 実装         | T5-2         | not_started |
| T5-4       | access capability 統合      | T5-3         | not_started |
| T5-5       | transcript 受け取り実装     | T5-3         | not_started |
| T5-6       | compact UX 実装             | T5-3         | not_started |

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] T5-1 ~ T5-6 の全サブタスクが完了している
- [ ] 成果物 2 ファイルが作成されている
- [ ] 完了条件の全チェックボックスが true である
- [ ] Phase 4 テスト全件 Green が確認されている
- [ ] 本Phase内の全タスクを100%実行完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
ls -la outputs/phase-5/implementation-plan.md
ls -la outputs/phase-5/changed-files.md
cd apps/desktop && pnpm vitest run 2>&1 | tail -5
cd apps/desktop && pnpm lint 2>&1 | tail -3
cd apps/desktop && pnpm typecheck 2>&1 | tail -3
```

## 次のPhase

- [Phase 6（テスト拡充）](./phase-6-test-expansion.md) に進む
