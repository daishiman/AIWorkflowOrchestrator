# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 1                                      |
| Phase名    | 要件定義                               |
| 前提Phase  | -                                      |
| 後続Phase  | Phase 2                                |
| ステータス | 未実施                                 |
| 作成日     | 2026-01-24                             |
| 機能名     | conversation-history-ui-implementation |

---

## 目的

会話履歴UI実装に必要なUI要件・デザイン仕様・機能要件を明確に定義し、後続Phaseの基盤を構築する。

## 背景

バックエンド（ConversationRepository + IPC Handlers）は完成済みだが、UI実装の要件が明文化されていないため、まず要件を定義して設計・実装の基盤を整える必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: システム仕様書の確認

**目的**: 既存のシステム仕様を確認し、整合性を確保する。

**実行手順**:

1. `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md` を確認し、履歴パネルのUI/UX仕様を理解する
2. `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md` を確認し、Conversation/Message型定義を把握する
3. `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` を確認し、Zustand Sliceパターン・Preload APIパターンを理解する
4. 既存の `apps/desktop/src/shared/types/conversation.ts` で型定義を確認する

**期待される成果物**:

- システム仕様の理解メモ（ドキュメント内にインライン記載）

---

### タスク2: 機能要件定義

**目的**: UIコンポーネントで実現すべき機能を明確に定義する。

**実行手順**:

1. 会話一覧機能の要件を定義する
   - 一覧表示（ページネーション対応）
   - 検索機能
   - 新規会話作成
   - 会話削除（確認ダイアログ付き）
2. 会話詳細機能の要件を定義する
   - メッセージ一覧表示
   - user/assistantの視覚的区別
   - 自動スクロール（新規メッセージ時）
   - タイトル編集
3. メッセージ入力機能の要件を定義する
   - テキスト入力
   - Enter送信（Shift+Enter改行）
   - 送信ボタン
   - 送信中ローディング表示
4. IPC接続機能の要件を定義する
   - 7つのIPCチャンネル（create/get/list/update/delete/addMessage/search）
   - conversationAPI経由でのアクセス

**期待される成果物**:

- `outputs/phase-1/requirements-definition.md`

---

### タスク3: UI要件定義

**目的**: UIデザインの要件を明確に定義する。

**実行手順**:

1. コンポーネント構成を定義する（UI-001〜UI-003）
2. レイアウト要件を定義する
   - 会話一覧パネル（サイドバー）
   - 会話詳細ビュー（メインエリア）
   - メッセージ入力（下部固定）
3. アクセシビリティ要件を定義する（WCAG 2.1 AA準拠）
   - キーボードナビゲーション
   - スクリーンリーダー対応
   - フォーカス管理
4. パフォーマンス要件を定義する
   - 初期レンダリング: <100ms
   - リスト表示: <200ms
   - 追加読み込み: <100ms

**期待される成果物**:

- `outputs/phase-1/requirements-definition.md`（UI要件セクション追記）

---

### タスク4: 受け入れ基準定義

**目的**: 機能の完了条件を明確に定義する。

**実行手順**:

1. 機能要件の受け入れ基準を定義する
2. 品質要件の受け入れ基準を定義する（カバレッジ80%+）
3. アクセシビリティ要件の受け入れ基準を定義する
4. テストケース目標数を定義する

**期待される成果物**:

- `outputs/phase-1/requirements-definition.md`（受け入れ基準セクション追記）

---

## 参照資料

| 参照資料               | パス                                                                         | 内容                                |
| ---------------------- | ---------------------------------------------------------------------------- | ----------------------------------- |
| UI/UXパネル仕様        | `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md`   | 履歴パネルのUI/UX仕様               |
| LLMインターフェース    | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`        | Conversation/Message型定義、IPC契約 |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | Zustand Slice、Preload APIパターン  |
| 型定義                 | `apps/desktop/src/shared/types/conversation.ts`                              | 会話・メッセージ型定義              |

---

## 成果物

| 成果物     | パス                                         | 内容                           |
| ---------- | -------------------------------------------- | ------------------------------ |
| 要件定義書 | `outputs/phase-1/requirements-definition.md` | 機能要件・UI要件・受け入れ基準 |

---

## 統合テスト連携

- IPC接続要件（7つのIPCチャンネル）を要件定義書に明記する
- 統合テストシナリオの前提条件として、バックエンドAPI動作を確認する

---

## 完了条件

- [ ] システム仕様書の確認完了
- [ ] 機能要件（会話一覧・詳細・入力・IPC）の定義完了
- [ ] UI要件（コンポーネント・レイアウト・アクセシビリティ）の定義完了
- [ ] 受け入れ基準（機能・品質・テストケース目標）の定義完了
- [ ] `outputs/phase-1/requirements-definition.md` 作成完了

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし（最初のPhase）
- **後続**: Phase 2（設計）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/conversation-history-ui-implementation/phase-2-design.md`
