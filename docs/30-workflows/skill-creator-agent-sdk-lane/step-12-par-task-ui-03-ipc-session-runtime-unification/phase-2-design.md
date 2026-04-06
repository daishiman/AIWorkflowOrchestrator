# Phase 2: 設計

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 2                               |
| Phase名    | 設計                            |
| 機能名     | ipc-session-runtime-unification |
| 対象機能   | TASK-UI-03 IPC 二重経路統合     |
| 前提Phase  | Phase 1: 要件定義               |
| 次Phase    | Phase 3: 設計レビュー           |
| ステータス | pending                         |
| 作成日     | 2026-04-06                      |

## 目的

Phase 1 の棚卸し結果に基づき、IPC 二重経路の統合戦略（完全統合 vs 明確分離+契約）を決定し、preload API surface の再設計とチャネル命名規則を策定する。

## 実行タスク

### Task 1: 統合戦略の設計

Phase 1 の重複・差分分析結果に基づき、以下の 2 方針を比較検討する:

**方針 A: 完全統合**

- Session IPC と Runtime IPC を単一の API surface に統合する
- 利点: 単一の通信パス、開発者の判断コストゼロ
- 欠点: 大規模なリファクタリング、既存 UI コンポーネントへの影響大

**方針 B: 明確な分離契約**

- Session IPC（会話型）と Runtime IPC（ワークフロー型）を明確に分離し、契約を定義する
- 共通基盤（エラーハンドリング、セキュリティ、型定義パターン）を統一する
- 利点: 既存コードへの影響最小、責務の明確化
- 欠点: 2 つの API surface が残る

**方針 C: ハイブリッド（推奨検討）**

- 共通の IPC 基盤レイヤーを新設し、Session/Runtime はその上に構築する
- channel 命名規則とセキュリティミドルウェアを共通化する
- 利点: 段階的移行が可能、既存コードとの互換性を維持
- 欠点: 中間層の追加による複雑性

各方針について以下を評価する:

- 実装コスト（工数）
- 既存テストへの影響
- セキュリティ要件の充足度
- 将来の拡張性

### Task 2: preload API surface 再設計

選択した方針に基づき、preload 層の API surface を設計する:

- `window.skillCreatorSessionAPI` と `window.electronAPI.skillCreator` の統合/整理
- 公開メソッドの命名規則統一
- 型安全性の確保（共有型定義との整合）
- contextBridge.exposeInMainWorld の呼び出し構造

### Task 3: チャネル命名規則の策定

`channels.ts` のチャネル名に統一的な命名規則を定義する:

- namespace prefix の統一（例: `skill-creator:session:*` / `skill-creator:runtime:*`）
- イベント名のパターン統一（例: `<namespace>:<action>` / `<namespace>:<resource>:<action>`）
- ホワイトリストの構造化

### Task 4: creatorHandlers 構成設計

`creatorHandlers.ts` のハンドラー構成を再設計する:

- Session ハンドラーと Runtime ハンドラーの明確なグルーピング
- 共通のエラーハンドリングミドルウェア
- セキュリティチェックの共通適用パターン
- ハンドラー登録の一貫したパターン

### Task 5: 型定義の整理設計

`packages/shared/src/types/skillCreator.ts` の型構造を設計する:

- Session 系の型と Runtime 系の型の分類
- 共通型（エラー型、結果型）の抽出
- 型の export 構造の整理

## 参照資料

| 資料名             | パス                                            | 説明                       |
| ------------------ | ----------------------------------------------- | -------------------------- |
| 要件定義成果物     | `outputs/phase-1/spec-extraction-map.md`        | 重複・差分分析結果         |
| IPCチャネル棚卸し  | `outputs/phase-1/ipc-channel-inventory.md`      | 全チャネル一覧             |
| skill-creator-api  | `apps/desktop/src/preload/skill-creator-api.ts` | 現行 Session IPC           |
| channels.ts        | `apps/desktop/src/preload/channels.ts`          | 現行チャネルホワイトリスト |
| creatorHandlers    | `apps/desktop/src/main/ipc/creatorHandlers.ts`  | 現行ハンドラー構成         |
| skillCreator types | `packages/shared/src/types/skillCreator.ts`     | 現行型定義                 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                           | 内容                                   |
| ------------------------- | ------------------------------------------------------------------------------ | -------------------------------------- |
| Agent IPC チャネル仕様    | `.agents/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`      | IPC チャネル定義の正本。命名規則の参照 |
| IPC契約チェックリスト     | `.agents/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`  | Main/Preload/型定義の同時更新チェック  |
| スキル実行IPCセキュリティ | `.agents/skills/aiworkflow-requirements/references/security-skill-ipc-core.md` | セキュリティパターンの設計基準         |

## 多角的チェック観点

| 観点               | 適用判断                               | 確認内容                                    |
| ------------------ | -------------------------------------- | ------------------------------------------- |
| アーキテクチャ     | IPC 統合戦略の選択のため適用           | 選択方針が既存アーキテクチャと整合すること  |
| IPC通信            | チャネル命名規則の策定のため適用       | 正本仕様（api-ipc-agent-core.md）との一貫性 |
| セキュリティ       | 共通セキュリティ基盤の設計のため適用   | 両経路でのセキュリティ要件均一適用          |
| エラーハンドリング | 共通エラー処理パターンの設計のため適用 | graceful degradation の維持                 |

## 統合テスト連携

- 統合方針に基づくテストケースを Phase 4 に引き継ぐ
- 共通基盤のテスト観点を事前に定義する
- 既存テストへの影響範囲を明記する

## 成果物

| 成果物     | パス                                          | 説明                                               |
| ---------- | --------------------------------------------- | -------------------------------------------------- |
| 設計書     | `outputs/phase-2/design-document.md`          | 統合方針、preload 再設計、命名規則、ハンドラー構成 |
| 統合戦略書 | `outputs/phase-2/ipc-unification-strategy.md` | 方針 A/B/C の比較評価と最終選択の根拠              |

## 完了条件

- [ ] 統合方針（A/B/C）の比較検討が完了し選択理由が記録されている
- [ ] preload API surface の再設計が策定されている
- [ ] チャネル命名規則が定義されている
- [ ] creatorHandlers の構成設計が策定されている
- [ ] 型定義の整理設計が策定されている
- [ ] 既存テストへの影響範囲が明記されている
- [ ] aiworkflow-requirements の関連仕様との整合性を確認した
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 3: 設計レビュー](./phase-3-design-review.md)
