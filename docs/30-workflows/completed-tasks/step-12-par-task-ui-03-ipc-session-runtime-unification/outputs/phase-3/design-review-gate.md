# 設計レビューゲート（TASK-UI-03）

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 3                            |
| 作成日     | 2026-04-06                   |
| ステータス | complete                     |
| **判定**   | **PASS（MINOR 2件）**        |
| 前提       | Phase 1 + Phase 2 の全成果物 |

---

## ゲート判定

**判定: PASS（MINOR 2件）→ Phase 4 へ進行**

---

## IPC 契約チェックリスト準拠確認（AC-5）

変更が発生する各チャネルの Main/Preload/型定義 3 層同時更新チェック:

| 変更項目                           | Main ハンドラー      | Preload API         | 型定義                   | 3層整合               |
| ---------------------------------- | -------------------- | ------------------- | ------------------------ | --------------------- |
| `electronAPI.skillCreator` 削除    | 変更なし             | `index.ts` から削除 | `ElectronAPI` 型から削除 | ⚠️ 型定義の修正が必要 |
| `GovernanceSummaryPanel` 移行      | 変更なし             | 変更なし            | 変更なし                 | ✅                    |
| `ImprovementProposalPanel` 移行    | 変更なし             | 変更なし            | 変更なし                 | ✅                    |
| `ADAPTER_STATUS` 重複 handler 除去 | `creatorHandlers.ts` | 変更なし            | 変更なし                 | ✅                    |

**確認**: `ElectronAPI` 型定義ファイルから `skillCreator?: SkillCreatorAPI` フィールド削除が必要。Phase 5 実施時に注意。

---

## セキュリティ要件均一性検証（AC-6）

### sender 検証

| 経路                                   | 実装                                                             | webContents.id 検証 | 判定 |
| -------------------------------------- | ---------------------------------------------------------------- | ------------------- | ---- |
| Session IPC（`SkillCreatorIpcBridge`） | `assertSender`: `event.sender.id !== this.window.webContents.id` | ✅                  | PASS |
| Runtime IPC（`creatorHandlers.ts`）    | `validateSender` → `validateIpcSender`                           | ✅                  | PASS |

**結論**: セキュリティ機能面のギャップなし。実装パターンの非統一は MINOR として記録。

### チャネルホワイトリスト

| 確認項目                                                  | 結果 |
| --------------------------------------------------------- | ---- |
| Session IPC 全チャネルが `ALLOWED_INVOKE_CHANNELS` に記載 | ✅   |
| Session IPC 全イベントが `ALLOWED_ON_CHANNELS` に記載     | ✅   |
| Runtime IPC 全チャネルが `ALLOWED_INVOKE_CHANNELS` に記載 | ✅   |
| 未ホワイトリストチャネルなし                              | ✅   |

### 入力バリデーション

| 経路        | `START_SESSION`             | `ANSWER`             | `submitUserInput`                  |
| ----------- | --------------------------- | -------------------- | ---------------------------------- |
| Session IPC | ✅ `req.request` 空チェック | ✅ `toolCallId` 検証 | N/A                                |
| Runtime IPC | N/A                         | N/A                  | ✅ `planId`+`requestId` 空チェック |

---

## 統合方針 B の妥当性評価

### 4条件評価

| 条件   | 評価    | 詳細                                                    |
| ------ | ------- | ------------------------------------------------------- |
| 価値性 | ✅ HIGH | 開発者体験向上（判断基準明確化）+ セキュリティ実装統一  |
| 実現性 | ✅ HIGH | 既存コードの整理のみ。UI コンポーネント全面リライト不要 |
| 整合性 | ✅ HIGH | TASK-UI-01 完了後の実施。責務境界が明確                 |
| 運用性 | ✅ HIGH | IPC 契約チェックリストで変更時の整合性を持続的に維持    |

### simpler alternative 検討

**「方針 A（完全統合）の方がシンプルでは？」**

→ 却下。理由: Session IPC（イベント駆動・質問/回答型）と Runtime IPC（スナップショット・状態管理型）は通信パターンが根本的に異なる。統合には `SkillCreatorConversationPanel` の全面リライトが必要で TASK-UI-03 スコープ外。

**「electronAPI から削除しないオプションは？」**

→ 採用しない。理由: 4 経路露出が続くと将来の新機能開発で「どのオブジェクトを使うべきか」の混乱が再発する。2 コンポーネントの移行コストは許容範囲。

---

## MINOR 追跡テーブル

| MINOR-ID | 内容                                                                                                                                                          | 解決予定 Phase                              | 解決確認 Phase |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | -------------- |
| MINOR-01 | Session IPC のエラーハンドリング形式が `throw` 形式で Runtime IPC の `IpcResult` パターンと非統一                                                             | Phase 8（リファクタリング）または未タスク化 | Phase 9        |
| MINOR-02 | `GovernanceSummaryPanel.test.tsx` に `window.electronAPI.skillCreator が未定義の場合` テストケースが存在。`electronAPI.skillCreator` 削除後にテスト修正が必要 | Phase 5（実装）                             | Phase 7        |

---

## 受入条件の事前検証

| AC   | 方針 B での実現見込み                                               | 実装難易度 |
| ---- | ------------------------------------------------------------------- | ---------- |
| AC-1 | ✅ ipc-unification-strategy.md に統一方針を文書化                   | 低         |
| AC-2 | ✅ Phase 12 で IPC 使用判断ガイドを作成                             | 低         |
| AC-3 | ✅ `electronAPI` から削除（2コンポーネント移行込み）                | 中         |
| AC-4 | ✅ `ADAPTER_STATUS` 重複 handler 除去                               | 低         |
| AC-5 | ✅ ElectronAPI 型定義の同時更新で3層整合                            | 低         |
| AC-6 | ✅ セキュリティ機能面は既に均一（実装パターンの統一は MINOR）       | 低         |
| AC-7 | ✅ `GovernanceSummaryPanel.test.tsx` の mock 修正が必要（MINOR-02） | 中         |

---

## Phase 4 開始条件

- [x] Phase 1 成果物（spec-extraction-map.md, ipc-channel-inventory.md）完成
- [x] Phase 2 成果物（design-document.md, ipc-unification-strategy.md）完成
- [x] ゲート判定: PASS（MINOR 2件）
- [x] MINOR 追跡テーブル作成済み
- [x] 全 AC の実現方針が確定

**→ Phase 4 へ進行**

---

## Phase 13 blocked 条件（記録）

- ユーザーの明示的な承認があるまで PR は作成しない
- TASK-UI-01 完了が前提条件
