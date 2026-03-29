# TASK-RT-02-API-KEY-UI-ADAPTER-STATUS-INTEGRATION

## 1. メタ情報

| 項目     | 値                                               |
| -------- | ------------------------------------------------ |
| タスクID | TASK-RT-02-API-KEY-UI-ADAPTER-STATUS-INTEGRATION |
| 種別     | follow-up / feature                              |
| 優先度   | High                                             |
| 親タスク | TASK-RT-01                                       |
| 作成日   | 2026-03-29                                       |
| 状態     | open                                             |

## 2. 背景

TASK-RT-01 でバックエンド（`RuntimeSkillCreatorFacade`）に `adapterStatus` フィールドと `LLM_ADAPTER_FAILED` / `LLM_ADAPTER_INITIALIZING` エラーコードを実装した。しかし、これらの情報を UI（Renderer プロセス）で受け取ってユーザーにエラーを表示する UI 側の実装が未着手。

現状では `plan()` が `LLM_ADAPTER_FAILED` エラーを返しても、Renderer 側でエラーコードの判別と適切な UI 表示（APIキー設定画面へのリンク等）が行われない。

ユーザーが実際に「APIキーを設定してください」というメッセージを見てスムーズに設定画面へ誘導されるフローを完成させるには本タスクが必要。

### 苦戦箇所（TASK-RT-01 より引継ぎ）

- TASK-RT-01 の設計時に、バックエンドの型とエラーコード設計をプロデューサー/コンシューマー分離の観点でスコープ分割した（バックエンド先行実装）。
- UI 側では `adapterStatus` フィールドと `LLM_ADAPTER_FAILED` エラーコードを使用する必要があり、Preload/IPC の型契約の整合性確認が必要。

## 3. 実施スコープ

- Renderer プロセスの Skill Creator 関連コンポーネントで `plan()` のエラーレスポンスを受け取り、`errorCode` に応じたエラー表示を実装する
- `LLM_ADAPTER_FAILED` の場合: 「APIキーを設定してください」メッセージと設定画面へのリンク/ボタンを表示
- `LLM_ADAPTER_INITIALIZING` の場合: 「初期化中」インジケーターを表示（リトライ待ち）
- `adapterStatus` フィールドを Renderer の状態管理（Zustand slice 等）で保持する

### スコープ外

- `execute()` / `improve()` の同等 UI 対応（別タスク）
- APIキー設定画面自体の実装変更（`task-api-keys-ui-improvement.md` に委任）
- リトライボタンの実装（`TASK-UT-RT-01-LLM-ADAPTER-RETRY-LOGIC-001` と協調）

## 4. 成果物

- Renderer 側の Skill Creator コンポーネント — `adapterStatus` / `errorCode` に応じたエラー UI 追加
- Zustand slice — `adapterStatus` ステートの追加（必要な場合）
- Preload 型 — `adapterStatus` フィールドが Renderer から参照できることの確認・修正
- テスト: エラー表示の UI コンポーネントテスト追加

## 5. 完了条件

- APIキー未設定状態で `skill-creator:plan` を呼び出すと、UI 上に「APIキーを設定してください」というメッセージと設定画面へのリンクが表示される
- `LLM_ADAPTER_INITIALIZING` 状態で呼び出すと、初期化中インジケーターが表示される
- 正常ケースでは従来通り plan 結果が表示される
- Phase 11: manual walkthrough で上記 UI 動作を確認した証跡が残っている
