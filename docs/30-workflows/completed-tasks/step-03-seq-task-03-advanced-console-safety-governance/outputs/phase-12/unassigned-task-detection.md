# Phase 12 未タスク検出レポート

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001      |
| Phase      | 12 (Task 12-4)                                       |
| 作成日     | 2026-03-24                                           |
| タスク種別 | 設計・実装タスク（IPC handler・Service・UI実装含む） |

## 検出ソース

1. Phase 3 MINOR 指摘（R-M1〜R-M3）
2. Phase 11 発見事項（DI-1〜DI-6）
3. Phase 10 最終レビュー想定（設計タスクのため未実施）

## 検出結果

### 検出件数: 10件

| ID    | タイトル                                          | 由来      | 優先度 | ステータス                                       |
| ----- | ------------------------------------------------- | --------- | ------ | ------------------------------------------------ |
| UT-1  | Approval token TTL 実装と検証                     | R-M1/DI-1 | LOW    | 設計コード実装済み（production統合は後続タスク） |
| UT-2  | Disclosure banner 再表示アイコン配置実装          | R-M2/DI-2 | LOW    | 設計コード実装済み（production統合は後続タスク） |
| UT-3  | Advanced Console read-only モード制約実装         | R-M3/DI-3 | LOW    | 設計コード実装済み（production統合は後続タスク） |
| UT-4  | Approval Sheet パフォーマンス計測基準定義と検証   | DI-4      | MEDIUM | 未着手                                           |
| UT-5  | Approval Sheet キーボードアクセシビリティ仕様定義 | DI-5      | MEDIUM | 未着手                                           |
| UT-6  | IPC Handler登録                                   | 統合      | HIGH   | 未着手                                           |
| UT-7  | Preload API公開                                   | 統合      | HIGH   | 未着手                                           |
| UT-8  | Approval Request Push実装                         | 統合      | HIGH   | 未着手                                           |
| UT-9  | revokeAll() セッション終了時呼び出し実装          | 統合      | MEDIUM | 未着手                                           |
| UT-10 | disclosureHandlers.ts 独立テストファイル作成      | 品質      | LOW    | 未着手                                           |

**備考**: DI-6（IPC 応答型未定義）は後続の実装タスク Phase 2/5 で自然に解決されるため、独立した未タスクとしない。

### UT-1: Approval token TTL 実装と検証

| 項目       | 内容                                                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 由来       | Phase 3 MINOR R-M1 / Phase 11 DI-1                                                                                             |
| 内容       | ApprovalGate の approval token TTL を 300s で実装し、テストで有効期限切れシナリオを検証する                                    |
| 対象       | `apps/desktop/src/main/` 配下の ApprovalGate 実装                                                                              |
| 優先度     | LOW（設計で「単一操作ごとの失効」が定義済み。秒数は実装詳細）                                                                  |
| 前提       | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 の実装タスク                                                                   |
| ステータス | 設計コード実装済み（production統合は後続タスク）                                                                               |
| 実装根拠   | `ApprovalGate.ts` で `APPROVAL_TTL_SECONDS = 300` が実装済み。`approvalGate.test.ts` の APR-10〜APR-16 でTTL検証テスト実装済み |

### UT-2: Disclosure banner 再表示アイコン配置実装

| 項目       | 内容                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| 由来       | Phase 3 MINOR R-M2 / Phase 11 DI-2                                                                        |
| 内容       | SessionDisclosureBanner dismiss 後の再表示アイコンを Session Dock ヘッダー右端に info icon として配置する |
| 対象       | `apps/desktop/src/renderer/components/execution/` 配下                                                    |
| 優先度     | LOW（機能的影響は小さい。配置位置の UX 調整）                                                             |
| 前提       | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 の実装タスク                                              |
| ステータス | 設計コード実装済み（production統合は後続タスク）                                                          |
| 実装根拠   | `ExecutionConsoleView/index.tsx` に再表示アイコン（disclosure-reopen ボタン）実装済み                     |

### UT-3: Advanced Console read-only モード制約実装

| 項目       | 内容                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------ |
| 由来       | Phase 3 MINOR R-M3 / Phase 11 DI-3                                                         |
| 内容       | running / done / aborted state での AdvancedConsolePanel の input 系操作を disabled にする |
| 対象       | `apps/desktop/src/renderer/components/execution/AdvancedConsolePanel.tsx`                  |
| 優先度     | LOW（read-only の制約は安全側。実装なしでも重大リスクなし）                                |
| 前提       | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 の実装タスク                               |
| ステータス | 設計コード実装済み（production統合は後続タスク）                                           |
| 実装根拠   | `AdvancedConsolePanel.tsx` に `READ_ONLY_STATES` + `disabled={isReadOnly}` 実装済み        |

### UT-4: Approval Sheet パフォーマンス計測基準定義と検証

| 項目         | 内容                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| 由来         | Phase 11 DI-4                                                               |
| 内容         | NFR-4（Approval Sheet 表示 200ms 以内）の計測方法を定義し、テストで検証する |
| 対象         | `apps/desktop/src/renderer/components/execution/ApprovalSheet.tsx` + テスト |
| 優先度       | MEDIUM（パフォーマンス基準が未検証のまま残ると UX 劣化のリスク）            |
| 計測方法候補 | Performance.now() / React Profiler / Playwright performance.timing          |
| 前提         | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 の実装タスク                |

### UT-5: Approval Sheet キーボードアクセシビリティ仕様定義

| 項目           | 内容                                                                               |
| -------------- | ---------------------------------------------------------------------------------- |
| 由来           | Phase 11 DI-5                                                                      |
| 内容           | Approval Sheet の WCAG 2.1 AA 準拠キーバインド仕様を定義し、テストで検証する       |
| 対象           | `apps/desktop/src/renderer/components/execution/ApprovalSheet.tsx` + テスト        |
| 優先度         | MEDIUM（アクセシビリティ未対応は WCAG 準拠要件違反）                               |
| 定義すべき項目 | Tab 順序、Enter キー（承認）、Escape キー（拒否）、フォーカストラップ、ARIA ラベル |
| 前提           | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 の実装タスク                       |

### UT-6: IPC Handler登録

| 項目       | 内容                                                                                                                                    |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 由来       | 後続統合タスク（production統合）                                                                                                        |
| 内容       | `main/ipc/index.ts` へ advancedConsoleHandlers・approvalHandlers・disclosureHandlers の3ハンドラを追加し、ApprovalGate を DI で注入する |
| 対象       | `apps/desktop/src/main/ipc/index.ts`                                                                                                    |
| 優先度     | HIGH（統合なしでは IPC チャンネルが機能しない）                                                                                         |
| ステータス | 未着手                                                                                                                                  |

### UT-7: Preload API公開

| 項目       | 内容                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------ |
| 由来       | 後続統合タスク（production統合）                                                                 |
| 内容       | `preload/index.ts` の contextBridge に advancedConsole・approval・disclosure の各 API を追加する |
| 対象       | `apps/desktop/src/preload/index.ts`                                                              |
| 優先度     | HIGH（contextBridge 未公開では Renderer から IPC を呼び出せない）                                |
| ステータス | 未着手                                                                                           |

### UT-8: Approval Request Push実装

| 項目       | 内容                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| 由来       | 後続統合タスク（production統合）                                                                     |
| 内容       | Main プロセスから Renderer へ承認要求を Push 通知する実装（`webContents.send` / IPC イベント）を行う |
| 対象       | `apps/desktop/src/main/` 配下のイベント送信処理                                                      |
| 優先度     | HIGH（Push なしでは Approval Sheet が表示されない）                                                  |
| ステータス | 未着手                                                                                               |

### UT-9: revokeAll() セッション終了時呼び出し実装

| 項目       | 内容                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------- |
| 由来       | 後続統合タスク（production統合）                                                               |
| 内容       | セッション終了時（abort / done）に `ApprovalGate.revokeAll()` を呼び出してトークンをクリアする |
| 対象       | `apps/desktop/src/main/` 配下のセッション終了処理                                              |
| 優先度     | MEDIUM（実装なしでもセッションをまたいでトークンが残るリスクがある）                           |
| ステータス | 未着手                                                                                         |

### UT-10: disclosureHandlers.ts 独立テストファイル作成

| 項目       | 内容                                                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| 由来       | 品質向上                                                                                                                   |
| 内容       | `disclosureHandlers.ts` の単体テストファイルを `__tests__/` 配下に作成し、dismiss・reopen・state取得の各シナリオを検証する |
| 対象       | `apps/desktop/src/main/ipc/__tests__/disclosureHandlers.test.ts`                                                           |
| 優先度     | LOW（既存の結合テストでカバーされているが、独立テストによる保守性向上が望ましい）                                          |
| ステータス | 未着手                                                                                                                     |

## 3ステップ完了状況（P3/P38/P58 準拠）

| ステップ                                           | 状態 | 備考                 |
| -------------------------------------------------- | ---- | -------------------- |
| 1. 未タスク一覧の記録                              | 完了 | 本ドキュメントに記録 |
| 2. task-workflow.md 残課題テーブル                 | 保留 | 別途対応が必要       |
| 3. 関連仕様書に参照リンク追加                      | 保留 | 別途対応が必要       |
| 4. unassigned-task/ への独立した指示書ファイル作成 | 保留 | 別途対応が必要       |

**P58準拠**: 設計タスクであっても独立した指示書ファイルを `docs/30-workflows/unassigned-task/` に作成する必要がある。本タスクの改善プロセスで対応済み。ステップ2〜4は本エージェントのスコープ外であり、別途対応が必要。
