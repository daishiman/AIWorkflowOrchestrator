# Phase 3: 設計レビュー — WorkspaceChatPanel インラインモデルセレクタ統合

## メタ情報

| 項目     | 値                                           |
| -------- | -------------------------------------------- |
| Phase    | 3                                            |
| 機能名   | workspace-inline-model-selector-integration  |
| タスクID | TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION |
| 作成日   | 2026-03-21                                   |
| 更新日   | 2026-03-22                                   |

## 目的

Phase 1（要件定義）とPhase 2（設計）の妥当性を検証し、Phase 4以降に進めるかを判定する。

## 実行タスク

- 要件-設計トレーサビリティ検証: 全FRが設計で実現されるか確認
- アーキテクチャ適合性検証: プロジェクトルール（P31対策等）との整合性確認
- リスク評価: 既知の落とし穴（known-pitfalls）との照合
- controller連動の妥当性: useWorkspaceChatControllerとの連動が追加コードなしで動作することの検証

## 参照資料

| 資料名           | パス                                                                                                                         | 説明                  |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| Phase 1 要件定義 | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-1-requirements.md` | WorkspaceChat統合要件 |
| Phase 2 設計     | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-2-design.md`       | WorkspaceChat配置設計 |
| 既知の落とし穴   | `.claude/rules/06-known-pitfalls.md`                                                                                         | P31/P48等の対策       |
| 状態管理ルール   | `.claude/rules/03-state-management.md`                                                                                       | Store設計原則         |
| アーキテクチャ   | `.claude/rules/01-architecture.md`                                                                                           | レイヤー・UI設計原則  |

## 実行手順

### ステップ1: 要件-設計トレーサビリティマトリクス

| 要件    | 設計対応箇所                                                      | 実現性 | 備考                                                           |
| ------- | ----------------------------------------------------------------- | ------ | -------------------------------------------------------------- |
| FR-1.1  | ステップ2: ヘッダー部末尾配置                                     | OK     | 説明テキストの下、GuidanceBlockの上                            |
| FR-1.2  | ステップ2: `compact` prop                                         | OK     | サイドパネル幅に適合する compact モード                        |
| FR-1.3  | ステップ5: `disabled={controller.isStreaming}`                    | OK     | controllerの既存プロパティを利用                               |
| FR-2.1  | ステップ4: 共存テーブル                                           | OK     | 選択済み → GuidanceBlock非表示（既存 isModelBlocked ロジック） |
| FR-2.2  | ステップ4: 共存テーブル                                           | OK     | 未選択 → GuidanceBlock表示維持                                 |
| FR-2.3  | ステップ3.2: controller変更なし                                   | OK     | Store更新 → controller反応 → isModelBlocked自動更新            |
| FR-3.1  | ステップ3.2: 既存ロジック維持                                     | OK     | `controller.selectedModelId === null` の判定は変更なし         |
| FR-3.2  | ステップ3.2: Store経由自動更新                                    | OK     | InlineModelSelector → Store → controller、追加コード不要       |
| FR-3.3  | ステップ3.2: isModelBlocked連動                                   | OK     | GuidanceBlock + 入力制御が連動して解除される                   |
| NFR-1.1 | ステップ2: compact版                                              | OK     | 高さ28px、サイドパネル幅に収まる                               |
| NFR-1.2 | ステップ2: ヘッダー部配置                                         | OK     | ヘッダー内の追加要素で全体スクロールは発生しない               |
| NFR-2.1 | ステップ3.1: 変更4行のみ（import + wrapper div + JSX + 閉じタグ） | OK     | 最小変更でレンダリング影響なし                                 |
| NFR-2.2 | Task 01: 個別セレクタ使用済み                                     | OK     | P31対策はTask 01で完了                                         |
| NFR-3.1 | Task 01: ARIA実装済み                                             | OK     | combobox/listbox/option パターン                               |
| NFR-3.2 | ステップ6: Tab順序                                                | OK     | DOM配置順で自然なフォーカス移動                                |

**トレーサビリティ判定**: 全要件が設計で網羅されている。

### ステップ2: アーキテクチャ適合性検証

| ルール                       | 適合性 | 確認結果                                                                |
| ---------------------------- | ------ | ----------------------------------------------------------------------- |
| Atomic Design                | OK     | InlineModelSelector（molecule）をWorkspaceChatPanel（organism）に配置   |
| Store個別セレクタ（P31対策） | OK     | Panel側で追加Store接続なし（isStreamingはcontrollerのローカル状態）     |
| ドロップダウン開閉=ローカル  | OK     | Task 01で実装済み。Panel側の関与なし                                    |
| IPC既存チャンネル利用        | OK     | 新規IPCなし                                                             |
| Apple HIG準拠                | OK     | Task 01のデザイントークンを継承                                         |
| レイヤー依存方向             | OK     | Renderer（Panel）→ Component（InlineModelSelector）→ Store              |
| 最小変更原則                 | OK     | import 1行 + JSX 3行（wrapper div含む）= 計4行の追加のみ                |
| controller分離               | OK     | Panel=表示責務、controller=ロジック責務。InlineModelSelectorはStore直結 |

### ステップ3: リスク評価（known-pitfalls照合）

| Pitfall | リスク | 対策状況                                                             |
| ------- | ------ | -------------------------------------------------------------------- |
| P5      | 低     | Panel側でリスナー追加なし                                            |
| P31     | 低     | Panel側で追加Store接続なし。InlineModelSelector内はTask 01で対策済み |
| P39     | 低     | テストではfireEvent使用を想定                                        |
| P48     | 低     | 派生セレクタ不使用                                                   |
| P62     | 低     | 未選択時はプレースホルダー表示。暗黙fallbackなし                     |

### ステップ4: controller連動の妥当性検証

**検証ポイント**: InlineModelSelectorでモデルを選択した場合、追加コードなしでGuidanceBlock非表示 + 入力有効化が実現されるか。

```
データフロー検証:
1. ユーザーがInlineModelSelectorでモデル選択
2. InlineModelSelector内 → useSelectModel(modelId) → llmSlice.selectModel()
3. llmSlice → selectedProviderId / selectedModelId を更新 + IPC同期
4. useWorkspaceChatController内 → deriveModelSelectionBlockedReason({selectedProviderId, selectedModelId})
   → blockedReason が null に変化
5. WorkspaceChatPanel内 → blockedGuidance = getModelSelectionGuidance(controller.blockedReason)
   → blockedGuidance が null に変化
6. {blockedGuidance ? <GuidanceBlock .../> : null} → null → GuidanceBlock非表示
7. WorkspaceChatInput が有効化される（blockedReasonベースの制御）
```

**判定**: 全ステップで既存のリアクティブパスが機能する。追加の連携コードは不要。Store → `deriveModelSelectionBlockedReason` → controller.blockedReason → Panel の単方向データフローが正しく設計されている。

### ステップ5: 懸念事項と判断

#### 懸念1: GuidanceBlockとInlineModelSelectorの視覚的重複

- **懸念**: モデル未選択時にヘッダーのセレクタ（プレースホルダー）とGuidanceBlock（blocked警告）の両方が表示される
- **判断**: 役割が異なるため問題なし。セレクタ=操作UI、GuidanceBlock=Settings誘導。InlineModelSelectorでモデルを選択すればGuidanceBlockは即座に消える

#### 懸念2: controller.isStreaming vs isSending の使い分け

- **懸念**: ChatView（Task 02）は `isSending`（Store）、WorkspaceChat（本タスク）は `controller.isStreaming`（ローカル状態）を使用しており、disabled制御の基準が異なる
- **判断**: 適切な使い分け。WorkspaceChatはcontrollerパターンでローカル状態管理しているため、controllerの `isStreaming` が正しいソース。ChatViewはStore経由で状態管理しているため `isSending` が正しいソース。各画面のアーキテクチャに合致している

#### 懸念3: ドロップダウンのサイドパネル外はみ出し

- **懸念**: InlineModelSelectorのドロップダウンがサイドパネルの横幅を超えて表示される可能性
- **判断**: InlineModelSelector（Task 01）のドロップダウンは `position: absolute` + `top-full` で配置され、`maxWidth` はトリガー幅に追従する設計。パネル幅が極端に狭い場合のみ発生しうるが、compact版のmaxWidth設定で対応済み。手動テスト（Phase 11）で確認

### ステップ6: レビュー判定

| 項目                      | 結果     |
| ------------------------- | -------- |
| 要件-設計トレーサビリティ | PASS     |
| アーキテクチャ適合性      | PASS     |
| リスク評価                | PASS     |
| controller連動妥当性      | PASS     |
| 懸念事項                  | 管理可能 |

**総合判定: PASS** — Phase 4（テスト作成）に進行可能。

### レビュー判定基準（Phase 3ゲート）

| 判定              | 条件             | アクション            |
| ----------------- | ---------------- | --------------------- |
| PASS              | 設計が要件を網羅 | Phase 4 へ            |
| MINOR             | 軽微な記述不整合 | 指摘対応後 Phase 4 へ |
| MAJOR（要件問題） | 要件自体に不備   | Phase 1 へ戻る        |
| MAJOR（設計問題） | 設計に根本的問題 | Phase 2 へ戻る        |

## 統合テスト連携

- Phase 2の統合テスト連携セクションで定義されたテスト方針の妥当性を確認
- P39対策（happy-dom環境でのfireEvent使用）の明記を検証
- テストケースと要件のトレーサビリティを確認

## サブタスク管理

Phase実行開始時に、TaskCreateツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] Phase末端で各タスクを100%完了し、完了を明記している

## 成果物

| 成果物         | パス                                                                                                                          | 説明           |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------- |
| 設計レビュー書 | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-3-design-review.md` | 本ドキュメント |

## 完了条件

- [x] 要件-設計トレーサビリティマトリクスを作成し全要件の対応を確認
- [x] アーキテクチャ適合性を検証
- [x] known-pitfalls との照合を完了
- [x] controller連動の妥当性を検証（データフロー追跡）
- [x] 懸念事項を特定し判断を記録
- [x] 総合判定を実施（PASS）
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

→ `phase-4-test.md`（同ディレクトリ内）
