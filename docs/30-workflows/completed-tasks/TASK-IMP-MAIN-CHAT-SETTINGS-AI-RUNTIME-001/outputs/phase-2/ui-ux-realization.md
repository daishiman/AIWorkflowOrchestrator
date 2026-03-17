# Phase 2: UI/UX 実体化 - 成果物

## メタ情報

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| Phase    | 2                                          |
| 機能名   | Main Chat / Settings runtime 同期          |
| タスクID | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 |
| 成果物   | ui-ux-realization.md                       |
| 作成日   | 2026-03-17                                 |

---

## 1. Settings 画面構成（改善後）

### 1.1 画面レイアウト

```
+------------------------------------------------------------------+
| Settings Header                                   [Terminal]     |
+------------------------------------------------------------------+
|                                                                  |
| [1] Access Capability Cards                                      |
|   ┌──────────────────────┐ ┌──────────────────────┐              |
|   | Integrated API       | | Claude Code Terminal  |              |
|   | status: ready        | | status: available     |              |
|   | CTA: チャットを使う   | | CTA: terminal を開く  |              |
|   └──────────────────────┘ └──────────────────────┘              |
|                                                                  |
| [2] Provider / Model Selector                                    |
|   ┌──────────────────────────────────────────────┐               |
|   | Provider: [OpenAI ▼]  Model: [gpt-4o ▼]      |               |
|   | Health: ● connected   Latency: 120ms          |               |
|   └──────────────────────────────────────────────┘               |
|                                                                  |
| [3] API Key Management                                           |
|   ┌──────────────────────────────────────────────┐               |
|   | Claude Agent SDK APIキー                      |               |
|   | [●●●●●●●●****]  [保存] [削除]  ✅ saved       |               |
|   ├──────────────────────────────────────────────┤               |
|   | Provider APIキー一覧                          |               |
|   | OpenAI    ✅ 登録済み  [編集] [削除]           |               |
|   | Anthropic ✅ 登録済み  [編集] [削除]           |               |
|   | Google    ⚠ 未登録    [設定]                   |               |
|   | xAI       ⚠ 未登録    [設定]                   |               |
|   └──────────────────────────────────────────────┘               |
|                                                                  |
| [4] System Prompt                                                |
|   ┌──────────────────────────────────────────────┐               |
|   | テンプレート: [Default ▼]  [編集] [新規作成]   |               |
|   └──────────────────────────────────────────────┘               |
|                                                                  |
| [5] Health / RAG / Connection Status                             |
|   ┌──────────────────────────────────────────────┐               |
|   | 接続状態: ● connected                         |               |
|   | RAG: [有効 ✓]  自動同期: [有効 ✓]             |               |
|   └──────────────────────────────────────────────┘               |
|                                                                  |
| [6] Profile / Theme                                              |
|   ┌──────────────────────────────────────────────┐               |
|   | テーマ: [ライト ▼]                             |               |
|   └──────────────────────────────────────────────┘               |
|                                                                  |
+------------------------------------------------------------------+
```

### 1.2 セクション再構成（現行 → 改善後）

| 現行セクション順    | 改善後セクション順           | 変更理由                                    |
| ------------------- | ---------------------------- | ------------------------------------------- |
| 1. AccountSection   | (削除: header に統合)        | Access Card と直交しない情報は header へ    |
| 2. AuthModeSelector | 1. Access Capability Cards   | toggle → card に変更。capability 可視化     |
| 3. AuthKeySection   | 3. API Key Management 内     | 条件付き表示 → card sub-section に統合      |
| 4. ApiKeysSection   | 3. API Key Management 内     | 上位 card と整合した一覧表示                |
| 5. ProfileSection   | 6. Profile / Theme           | 優先度を下げて末尾に配置                    |
| 6. ThemeSelector    | 6. Profile / Theme           | Profile と統合                              |
| 7. RAGSettings      | 5. Health / RAG              | health と RAG を同一セクションに統合        |
| (なし)              | 2. Provider / Model Selector | LLMSelectorPanel を Settings に統合配置     |
| (なし)              | 4. System Prompt             | prompt 管理を Settings で直接アクセス可能に |

---

## 2. Main Chat 画面構成（改善後）

### 2.1 画面レイアウト

```
+------------------------------------------------------------------+
| Chat Header  [Provider: OpenAI] [Model: gpt-4o]  [Terminal]     |
+------------------------------------------------------------------+
| Runtime Banner: Integrated API Runtime                           |
+------------------------------------------------------------------+
|                                                                  |
| Message List                                                     |
|   User: こんにちは                                               |
|   AI: こんにちは！何かお手伝いできますか？                       |
|                                                                  |
+------------------------------------------------------------------+
| Composer                                                         |
| [メッセージを入力...]                        [送信]              |
+------------------------------------------------------------------+
```

### 2.2 状態別表示

| 状態           | Runtime Banner         | Composer 状態    | 追加表示                     |
| -------------- | ---------------------- | ---------------- | ---------------------------- |
| ready          | Integrated API Runtime | 活性             | なし                         |
| streaming      | Integrated API Runtime | 無効 + cancel    | streaming indicator          |
| missing-key    | (非表示)               | 無効             | Guidance: 「APIキーを設定」  |
| health-warning | Integrated API Runtime | 活性（警告付き） | Health Row: 「接続に問題」   |
| model-drift    | Integrated API Runtime | 無効             | Guidance: 「モデルを再選択」 |

---

## 3. Access Capability Card 詳細設計

### 3.1 Integrated API Card

| 状態        | カード色 | ステータスバッジ | 説明文                                      | CTA                    |
| ----------- | -------- | ---------------- | ------------------------------------------- | ---------------------- |
| ready       | 緑       | `ready`          | 「API接続が有効です。チャットを使えます」   | 「チャットを使う」     |
| missing-key | 橙       | `missing-key`    | 「APIキーが設定されていません」             | 「APIキーを設定する」  |
| blocked     | 赤       | `blocked`        | 「この認証方式ではAPI接続を利用できません」 | 「認証方式を変更する」 |
| unavailable | 灰       | `unavailable`    | 「API接続が利用できません」                 | なし                   |

### 3.2 Terminal Card

| 状態        | カード色 | ステータスバッジ     | 説明文                                         | CTA                 |
| ----------- | -------- | -------------------- | ---------------------------------------------- | ------------------- |
| available   | 青       | `terminal-available` | 「Claude Code を terminal で手動実行できます」 | 「terminal を開く」 |
| unavailable | 灰       | `unavailable`        | 「terminal 環境が利用できません」              | 「セットアップ」    |

---

## 4. Persistent Terminal Launcher 配置

| 配置場所             | 形態                      | 動作                                     |
| -------------------- | ------------------------- | ---------------------------------------- |
| Settings Header 右上 | アイコンボタン [Terminal] | terminal dock を toggle で開閉           |
| Chat Header 右端     | アイコンボタン [Terminal] | terminal dock を toggle で開閉（重複OK） |
| 開閉形態             | dock / bottom sheet       | 閉じても session は保持。再度開けば続き  |

---

## 5. アクセシビリティ

| 対象                      | 要件                                                              |
| ------------------------- | ----------------------------------------------------------------- |
| Access Capability Card    | role="region" + aria-label で capability 名とステータスを読み上げ |
| Provider / Model Selector | キーボード操作対応（矢印キー、Enter、Escape）                     |
| Health Indicator          | aria-live="polite" で状態変化を通知                               |
| API Key 入力              | type="password" + show/hide toggle                                |
| Terminal Launcher         | aria-label="terminal を開く" + keyboard shortcut                  |
| Guidance Block            | role="alert" で注意事項を即座に読み上げ                           |
