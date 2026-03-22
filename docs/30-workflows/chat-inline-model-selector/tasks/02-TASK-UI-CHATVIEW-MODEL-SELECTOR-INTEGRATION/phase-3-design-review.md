# Phase 3: 設計レビュー — ChatView インラインモデルセレクタ統合

## メタ情報

| 項目     | 値                                          |
| -------- | ------------------------------------------- |
| Phase    | 3                                           |
| 機能名   | chatview-inline-model-selector-integration  |
| タスクID | TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION |
| 作成日   | 2026-03-21                                  |
| 更新日   | 2026-03-22                                  |

## 目的

Phase 1（要件定義）とPhase 2（設計）の妥当性を検証し、Phase 4以降に進めるかを判定する。

## 実行タスク

- 要件-設計トレーサビリティ検証: 全FRが設計で実現されるか確認
- アーキテクチャ適合性検証: プロジェクトルール（P31対策等）との整合性確認
- リスク評価: 既知の落とし穴（known-pitfalls）との照合
- 変更量妥当性: 最小変更で要件を満たしているか確認

## 参照資料

| 資料名           | パス                                                                                                                        | 説明                 |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| Phase 1 要件定義 | `docs/30-workflows/chat-inline-model-selector/tasks/02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION/phase-1-requirements.md` | ChatView統合要件     |
| Phase 2 設計     | `docs/30-workflows/chat-inline-model-selector/tasks/02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION/phase-2-design.md`       | ChatView配置設計     |
| 既知の落とし穴   | `.claude/rules/06-known-pitfalls.md`                                                                                        | P31/P48等の対策      |
| 状態管理ルール   | `.claude/rules/03-state-management.md`                                                                                      | Store設計原則        |
| アーキテクチャ   | `.claude/rules/01-architecture.md`                                                                                          | レイヤー・UI設計原則 |

## 実行手順

### ステップ1: 要件-設計トレーサビリティマトリクス

| 要件    | 設計対応箇所                           | 実現性 | 備考                                                |
| ------- | -------------------------------------- | ------ | --------------------------------------------------- |
| FR-1.1  | ステップ2: ヘッダー内配置              | OK     | RAGステータスの後・ボタン群の前                     |
| FR-1.2  | ステップ2: ヘッダー内配置              | OK     | タイトル右側、ボタン群左側                          |
| FR-1.3  | ステップ3.1: `compact` prop            | OK     | Task 01の compact モード（高さ28px）を使用          |
| FR-1.4  | ステップ5: `disabled={isSending}`      | OK     | 既存Store取得を再利用、追加接続なし                 |
| FR-2.1  | ステップ4: 共存テーブル                | OK     | 選択済み → バナー非表示（既存動作維持）             |
| FR-2.2  | ステップ4: 共存テーブル                | OK     | 未選択 → バナー表示維持（API key誘導として機能）    |
| FR-2.3  | ステップ3.2: LLMGuidanceBanner変更なし | OK     | Store更新でバナーが自動反応、追加連携不要           |
| FR-3.1  | ステップ3.1: 既存Store連携             | OK     | InlineModelSelector → Store → sendMessage、既存パス |
| FR-3.2  | ステップ3.1: 変更なし                  | OK     | 既存エラーハンドリング維持                          |
| NFR-1.1 | ステップ2: compact版高さ28px           | OK     | ヘッダー高に収まる                                  |
| NFR-1.2 | Task 01のtruncate実装                  | OK     | モデル名のtruncateはTask 01で実装済み               |
| NFR-2.1 | ステップ3.1: 変更2行のみ               | OK     | 最小変更でレンダリング影響なし                      |
| NFR-2.2 | Task 01: 個別セレクタ使用済み          | OK     | P31対策はTask 01で完了                              |
| NFR-3.1 | Task 01: ARIA実装済み                  | OK     | combobox/listbox/option パターン                    |
| NFR-3.2 | ステップ6: Tab順序                     | OK     | DOM配置順で自然なフォーカス移動                     |

**トレーサビリティ判定**: 全要件が設計で網羅されている。

### ステップ2: アーキテクチャ適合性検証

| ルール                       | 適合性 | 確認結果                                                      |
| ---------------------------- | ------ | ------------------------------------------------------------- |
| Atomic Design                | OK     | InlineModelSelector（molecule）をChatView（page）に配置       |
| Store個別セレクタ（P31対策） | OK     | ChatView側で追加Store接続なし（isSendingは既存取得を再利用）  |
| ドロップダウン開閉=ローカル  | OK     | Task 01で実装済み。ChatView側の関与なし                       |
| IPC既存チャンネル利用        | OK     | 新規IPCなし                                                   |
| Apple HIG準拠                | OK     | Task 01のデザイントークンを継承                               |
| レイヤー依存方向             | OK     | Renderer（ChatView）→ Component（InlineModelSelector）→ Store |
| 最小変更原則                 | OK     | import 1行 + JSX 1行 = 計2行の追加のみ                        |

### ステップ3: リスク評価（known-pitfalls照合）

| Pitfall | リスク | 対策状況                                                                |
| ------- | ------ | ----------------------------------------------------------------------- |
| P5      | 低     | ChatView側でリスナー追加なし                                            |
| P31     | 低     | ChatView側で追加Store接続なし。InlineModelSelector内はTask 01で対策済み |
| P39     | 低     | テストではfireEvent使用を想定                                           |
| P48     | 低     | 派生セレクタ不使用                                                      |
| P62     | 低     | 未選択時はプレースホルダー表示。暗黙fallbackなし                        |

### ステップ4: 懸念事項と判断

#### 懸念1: LLMGuidanceBannerとInlineModelSelectorの視覚的重複

- **懸念**: モデル未選択時にヘッダーのセレクタ（プレースホルダー）とバナー（警告）の両方が表示される
- **判断**: 役割が異なるため問題なし。セレクタ=操作UI、バナー=API key設定誘導。将来的にバナーの表示条件をAPI key限定にする調整は未タスクとして管理

#### 懸念2: ヘッダーの横幅不足

- **懸念**: InlineModelSelector追加でヘッダー内の要素が横幅を超える可能性
- **判断**: compact版の幅は約160pxで、flex配置でshrink可能。モデル名のtruncateはTask 01で実装済み

### ステップ5: レビュー判定

| 項目                      | 結果     |
| ------------------------- | -------- |
| 要件-設計トレーサビリティ | PASS     |
| アーキテクチャ適合性      | PASS     |
| リスク評価                | PASS     |
| 懸念事項                  | 管理可能 |
| 変更量妥当性              | PASS     |

**総合判定: PASS** — Phase 4（テスト作成）に進行可能。

## 成果物

| 成果物         | パス                                                                                                                         | 説明           |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------- |
| 設計レビュー書 | `docs/30-workflows/chat-inline-model-selector/tasks/02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION/phase-3-design-review.md` | 本ドキュメント |

## 完了条件

- [x] 要件-設計トレーサビリティマトリクスを作成し全要件の対応を確認
- [x] アーキテクチャ適合性を検証
- [x] known-pitfalls との照合を完了
- [x] 懸念事項を特定し判断を記録
- [x] 総合判定を実施（PASS）
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

→ `phase-4-test.md`（同ディレクトリ内）
