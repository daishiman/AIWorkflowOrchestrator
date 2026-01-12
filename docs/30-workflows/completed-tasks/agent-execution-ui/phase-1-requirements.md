# Phase 1: 要件定義

## メタ情報

| 項目       | 値                 |
| ---------- | ------------------ |
| Phase      | 1                  |
| 機能名     | agent-execution-ui |
| 作成日     | 2026-01-12         |
| ステータス | 未実施             |

## 目的

エージェント実行UIの目的、スコープ、受け入れ基準を明文化する。

## 実行タスク

- **要件抽出**: ユーザー要求から機能要件・非機能要件を抽出
- **受け入れ基準作成**: 各要件に対してGiven-When-Then形式の受け入れ基準を定義
- **FR/NFR分類**: 機能要件と非機能要件を分類し優先度を設定
- **接続要件定義**: IPC通信/ストリーミング/Permission連携の要件を明記

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料            | パス                                                                        | 内容                                   |
| ------------------- | --------------------------------------------------------------------------- | -------------------------------------- |
| Agent SDK仕様       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | AgentExecutionStatus/Skill Dashboard型 |
| UI/UXコンポーネント | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`     | Atomic Design/アクセシビリティ要件     |

### タスク指示書

| 資料               | パス                                                              | 説明             |
| ------------------ | ----------------------------------------------------------------- | ---------------- |
| エージェント実行UI | `docs/30-workflows/unassigned-task/task-agent-04-execution-ui.md` | 元のタスク指示書 |

## 実行手順

### ステップ1: 要件抽出

ユーザー要求から機能要件・非機能要件を抽出する。

**機能要件（FR）**:

| ID    | 要件                                           | 優先度 |
| ----- | ---------------------------------------------- | ------ |
| FR-01 | スキル選択後に実行画面に遷移できる             | 高     |
| FR-02 | メッセージを入力して送信できる                 | 高     |
| FR-03 | エージェントの出力がストリーミングで表示される | 高     |
| FR-04 | 実行をキャンセルできる                         | 高     |
| FR-05 | チャット履歴をクリアできる                     | 中     |
| FR-06 | エラー時にエラーメッセージが表示される         | 高     |
| FR-07 | Permission Dialogが表示される                  | 高     |
| FR-08 | Permission Dialogで許可/拒否を選択できる       | 高     |
| FR-09 | Permission Dialogで選択を記憶できる            | 中     |

**非機能要件（NFR）**:

| ID     | 要件                           | 優先度 |
| ------ | ------------------------------ | ------ |
| NFR-01 | ストリーミング遅延は200ms以下  | 高     |
| NFR-02 | キーボードナビゲーション対応   | 高     |
| NFR-03 | スクリーンリーダー対応         | 中     |
| NFR-04 | 長時間実行時のメモリリークなし | 高     |
| NFR-05 | テストカバレッジ80%以上        | 高     |

### ステップ2: 受け入れ基準作成

各要件に対してGiven-When-Then形式の受け入れ基準を定義する。

```gherkin
Feature: エージェント実行UI

Scenario: スキル選択後に実行画面に遷移する (FR-01)
  Given ユーザーがスキル詳細パネルを表示している
  When 「実行」ボタンをクリックする
  Then AgentExecutionViewが表示される
  And 選択したスキルが上部に表示される

Scenario: メッセージを送信できる (FR-02)
  Given ユーザーが実行画面を表示している
  And メッセージ入力欄にテキストを入力している
  When 送信ボタンをクリックする（またはEnterキーを押す）
  Then メッセージがチャット履歴に表示される
  And エージェントへのリクエストが送信される

Scenario: エージェントの出力がストリーミング表示される (FR-03)
  Given ユーザーがメッセージを送信した
  When エージェントが応答を生成している
  Then 出力がリアルタイムで表示される
  And ローディングインジケーターが表示される

Scenario: 実行をキャンセルできる (FR-04)
  Given エージェントが実行中である
  When 「キャンセル」ボタンをクリックする
  Then 実行が中断される
  And 「実行がキャンセルされました」と表示される

Scenario: チャット履歴をクリアできる (FR-05)
  Given チャット履歴にメッセージがある
  When 「クリア」ボタンをクリックする
  Then 確認ダイアログが表示される
  And 「はい」を選択するとチャット履歴がクリアされる

Scenario: エラーが発生した場合にエラーメッセージが表示される (FR-06)
  Given ユーザーがメッセージを送信した
  When エージェント実行中にエラーが発生する
  Then エラーメッセージがチャット履歴に表示される
  And 実行状態が停止に変わる

Scenario: 権限確認ダイアログが表示される (FR-07)
  Given エージェントが実行中である
  When askルールに該当するツールが呼び出される
  Then PermissionDialogが表示される
  And ツール名と引数が表示される

Scenario: 権限確認ダイアログで許可できる (FR-08)
  Given PermissionDialogが表示されている
  When 「許可」ボタンをクリックする
  Then ダイアログが閉じる
  And エージェントの実行が続行される

Scenario: 権限確認ダイアログで拒否できる (FR-08)
  Given PermissionDialogが表示されている
  When 「拒否」ボタンをクリックする
  Then ダイアログが閉じる
  And エージェントにツール使用が拒否されたことが通知される

Scenario: 権限確認ダイアログで選択を記憶できる (FR-09)
  Given PermissionDialogが表示されている
  When 「このツールの選択を記憶する」にチェックを入れる
  And 「許可」または「拒否」をクリックする
  Then 同一ツールの次回以降の確認がスキップされる
```

### ステップ3: FR/NFR分類と優先度設定

上記の表に従い、機能要件と非機能要件を分類・優先度設定済み。

## 統合テスト連携【必須】

接続要件（IPC/ストリーミング/Permission）を要件に明記する:

| 接続要件カテゴリ | 記載内容                                                           |
| ---------------- | ------------------------------------------------------------------ |
| IPC通信          | `agent:start`, `agent:stop`, `agent:stream`, `agent:permission`    |
| ストリーミング   | Main → Renderer へのリアルタイムメッセージ配信                     |
| Permission連携   | `agent:permission`, `agent:permission:res` のリクエスト/レスポンス |

## 成果物

| 成果物       | パス                                         | 説明                  |
| ------------ | -------------------------------------------- | --------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件      |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | Given-When-Then形式AC |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | スコープ内外の明確化  |

## 完了条件

- [ ] 全要件（FR-01〜FR-09, NFR-01〜NFR-05）が抽出されている
- [ ] 各要件にGiven-When-Then形式の受け入れ基準がある
- [ ] FR/NFRが分類され優先度が設定されている
- [ ] 接続要件（IPC/ストリーミング/Permission）が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（Agent SDK仕様、UI/UXコンポーネント）
2. 機能要件の抽出（FR-01〜FR-09）
3. 非機能要件の抽出（NFR-01〜NFR-05）
4. 受け入れ基準の作成（Given-When-Then形式）
5. 接続要件の明記（IPC/ストリーミング/Permission）
6. 成果物の作成・配置
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/agent-execution-ui --phase 1
```

## 次のPhase

Phase 2: 設計
