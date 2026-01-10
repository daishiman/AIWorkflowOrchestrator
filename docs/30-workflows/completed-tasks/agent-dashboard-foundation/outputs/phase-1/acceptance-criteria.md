# 受け入れ基準 - エージェントダッシュボード基盤

## 要件情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| 機能要件ID | AGENT-001                  |
| 機能名     | agent-dashboard-foundation |
| バージョン | 1.0                        |
| 作成日     | 2026-01-10                 |

---

## ユーザーストーリー

```
アプリケーションユーザーとして、
エージェント管理画面にアクセスしたい。
なぜなら、Claude Agent SDKを使用したスキルベースのエージェント機能を活用するためだから。
```

---

## 受け入れ基準

### AC-001: AppDockにエージェントメニューが表示される

**カテゴリ**: 正常系

```gherkin
Scenario: AppDockにエージェントメニューが表示される
  Given ユーザーがアプリケーションにログインしている
  When メインダッシュボード画面を表示する
  Then AppDockに「Agent」アイコンが表示される
    And アイコンは「bot」アイコン（Lucide Icons）である
    And アイコンにホバーすると「Agent」ツールチップが表示される
    And ショートカット「Cmd+5」が表示される
```

**検証方法**: [x] 自動テスト [x] 手動テスト
**優先度**: Must

---

### AC-002: エージェント画面に遷移できる（クリック）

**カテゴリ**: 正常系

```gherkin
Scenario: エージェント画面に遷移できる
  Given ユーザーがメインダッシュボード画面を表示している
  When AppDockの「Agent」アイコンをクリックする
  Then AgentViewが表示される
    And currentViewが「agent」に更新される
    And viewHistoryに「agent」が追加される
    And 「Agent」アイコンがアクティブ状態になる
```

**検証方法**: [x] 自動テスト [x] 手動テスト
**優先度**: Must

---

### AC-003: キーボードショートカットでエージェント画面に遷移できる

**カテゴリ**: 正常系

```gherkin
Scenario: キーボードショートカットでエージェント画面に遷移できる
  Given ユーザーがアプリケーションを操作している
    And currentViewが「agent」以外である
  When Cmd+5（Mac）またはCtrl+5（Win/Linux）を押下する
  Then AgentViewが表示される
    And currentViewが「agent」に更新される
```

**検証方法**: [ ] 自動テスト [x] 手動テスト
**優先度**: Should

---

### AC-004: AgentViewの基本レイアウトが表示される

**カテゴリ**: 正常系

```gherkin
Scenario: AgentViewの基本レイアウトが表示される
  Given ユーザーがAgentViewに遷移している
  When AgentViewが完全にレンダリングされる
  Then ヘッダーに「Agent」タイトルが表示される
    And メインコンテンツエリアが表示される
    And プレースホルダーメッセージ「エージェント機能は準備中です」が表示される
```

**検証方法**: [x] 自動テスト [x] 手動テスト
**優先度**: Must

---

### AC-005: agentSliceの初期状態が正しい

**カテゴリ**: 正常系

```gherkin
Scenario: agentSliceの初期状態が正しい
  Given アプリケーションが起動している
  When Zustand storeが初期化される
  Then agentSlice.agentsは空配列である
    And agentSlice.isLoadingはfalseである
    And agentSlice.errorはnullである
```

**検証方法**: [x] 自動テスト [ ] 手動テスト
**優先度**: Must

---

### AC-006: IPCチャネルが定義されている

**カテゴリ**: 正常系

```gherkin
Scenario: IPCチャネルが定義されている
  Given アプリケーションがビルドされている
  When IPC_CHANNELS定数を参照する
  Then 以下のチャネルが定義されている:
    | チャネル名             | 値                     |
    | AGENT_GET_SKILLS       | "agent:get-skills"     |
    | AGENT_EXECUTE          | "agent:execute"        |
    | AGENT_ABORT            | "agent:abort"          |
    | AGENT_GET_STATUS       | "agent:get-status"     |
    | AGENT_STATUS_CHANGED   | "agent:status-changed" |
```

**検証方法**: [x] 自動テスト [ ] 手動テスト
**優先度**: Must

---

### AC-007: ナビゲーション履歴が正しく管理される

**カテゴリ**: 正常系

```gherkin
Scenario: ナビゲーション履歴が正しく管理される
  Given ユーザーが「dashboard」を表示している
  When 「Agent」アイコンをクリックする
  Then viewHistoryは["dashboard", "agent"]となる
  When goBack()を実行する
  Then currentViewは「dashboard」に戻る
    And viewHistoryは["dashboard"]となる
```

**検証方法**: [x] 自動テスト [ ] 手動テスト
**優先度**: Must

---

### AC-008: レスポンシブ対応（デスクトップモード）

**カテゴリ**: 正常系

```gherkin
Scenario: デスクトップモードでの表示
  Given ウィンドウ幅が1024px以上である
  When AgentViewを表示する
  Then AppDockは左側に縦配置で表示される
    And AgentViewはAppDockの右側に表示される
    And 「Agent」アイコンは他のナビゲーションと同じサイズで表示される
```

**検証方法**: [ ] 自動テスト [x] 手動テスト
**優先度**: Should

---

### AC-009: レスポンシブ対応（モバイルモード）

**カテゴリ**: 正常系

```gherkin
Scenario: モバイルモードでの表示
  Given ウィンドウ幅が768px未満である
  When AgentViewを表示する
  Then AppDockは下部に横配置で表示される
    And 「Agent」アイコンは他のナビゲーションと同じサイズで表示される
    And AgentViewはAppDockの上部に表示される
```

**検証方法**: [ ] 自動テスト [x] 手動テスト
**優先度**: Should

---

### AC-010: アクセシビリティ対応

**カテゴリ**: 非機能要件

```gherkin
Scenario: アクセシビリティ対応
  Given AgentViewが表示されている
  When スクリーンリーダーで読み上げる
  Then 「Agent」アイコンにaria-label="Agent"が設定されている
    And キーボードのTabキーでフォーカス可能である
    And フォーカス時に視覚的なフォーカスリングが表示される
```

**検証方法**: [ ] 自動テスト [x] 手動テスト
**優先度**: Should

---

## エッジケース

### EC-001: 同じビューへの重複遷移

**カテゴリ**: エッジケース

```gherkin
Scenario: 同じビューへの重複遷移
  Given currentViewが「agent」である
  When 「Agent」アイコンを再度クリックする
  Then currentViewは「agent」のままである
    And viewHistoryに重複エントリは追加されない
```

**検証方法**: [x] 自動テスト [ ] 手動テスト
**優先度**: Must

---

### EC-002: 高速な連続クリック

**カテゴリ**: エッジケース

```gherkin
Scenario: 高速な連続クリック
  Given ユーザーがダッシュボードを表示している
  When 「Agent」アイコンを100ms以内に3回クリックする
  Then 状態は一度だけ更新される
    And UIの不整合は発生しない
```

**検証方法**: [ ] 自動テスト [x] 手動テスト
**優先度**: Could

---

## 完了の定義（DoD）

### コード完了

- [ ] ViewTypeに「agent」が追加されている
- [ ] AppDockにAgentナビゲーション項目が追加されている
- [ ] AgentViewコンポーネントが作成されている
- [ ] agentSliceが作成されている
- [ ] IPCチャネルが定義されている
- [ ] ルーティング設定が更新されている
- [ ] コードレビューが完了している
- [ ] 単体テストが書かれている（カバレッジ80%以上）

### テスト完了

- [ ] すべての受け入れ基準がテストされている
- [ ] 自動テストが追加されている
- [ ] 手動テストが完了している

### ドキュメント完了

- [ ] 必要なドキュメントが更新されている

---

## テストケースへのマッピング

| 受け入れ基準 | テストケースID | テストタイプ | 自動化 |
| ------------ | -------------- | ------------ | ------ |
| AC-001       | TC-NAV-001     | 結合テスト   | Yes    |
| AC-002       | TC-NAV-002     | 結合テスト   | Yes    |
| AC-003       | TC-NAV-003     | E2Eテスト    | No     |
| AC-004       | TC-VIEW-001    | 単体テスト   | Yes    |
| AC-005       | TC-STORE-001   | 単体テスト   | Yes    |
| AC-006       | TC-IPC-001     | 単体テスト   | Yes    |
| AC-007       | TC-NAV-004     | 単体テスト   | Yes    |
| AC-008       | TC-RESP-001    | 手動テスト   | No     |
| AC-009       | TC-RESP-002    | 手動テスト   | No     |
| AC-010       | TC-A11Y-001    | 手動テスト   | No     |
| EC-001       | TC-EDGE-001    | 単体テスト   | Yes    |
| EC-002       | TC-EDGE-002    | 手動テスト   | No     |
