# 受け入れ基準

## メタ情報

| 項目         | 値                                         |
| ------------ | ------------------------------------------ |
| タスクID     | TASK-FIX-15-1-EXECUTE-HANDLER-ROUTING      |
| 機能名       | SKILL_EXECUTEハンドラーのSkillExecutor委譲 |
| 作成日       | 2026-02-09                                 |
| 仕様書参照先 | phase-01-requirements.md                   |

---

## 受け入れ基準一覧

### AC-01: SkillExecutor.execute() 呼び出し

**Given**: SKILL_EXECUTE ハンドラーが呼び出される
**When**: バリデーションが成功し、スキルが取得できた
**Then**: `_skillExecutorInstance.execute(request, skill)` が呼び出される

**検証方法**:

- ユニットテストでモックを使用して呼び出しを検証
- 呼び出し引数が期待通りであることを確認

---

### AC-02: SkillExecutionRequest 構築

**Given**: ハンドラー引数 `{ skillId: "test-skill", params: { prompt: "Hello" } }`
**When**: リクエストを構築する
**Then**: `SkillExecutionRequest { skillId: "test-skill", prompt: "Hello" }` が作成される

**検証方法**:

- 入力パラメータの各フィールドが正しくマッピングされることをテスト
- オプションパラメータ（timeout, sessionId, retryConfig）の有無両方をテスト

---

### AC-03: 成功レスポンス変換

**Given**: SkillExecutor.execute() が `{ executionId: "uuid", success: true }` を返す
**When**: ハンドラーがレスポンスを返す
**Then**: `{ success: true, data: { executionId: "uuid" } }` 形式で返す

**検証方法**:

- モックで成功レスポンスを返し、変換後のレスポンス形式を検証
- executionId が正しく含まれていることを確認

---

### AC-04: エラーレスポンス変換

**Given**: SkillExecutor.execute() が `success: false` と `error` を返す
**When**: ハンドラーがレスポンスを返す
**Then**: `{ success: false, error: "<エラーメッセージ>" }` 形式で返す

**検証方法**:

- 各種エラーコード（SE-01〜SE-07, PR-02）に対応するテストケース
- エラーメッセージがサニタイズされていることを確認

---

### AC-05: スキル未取得時のエラー

**Given**: skillService.getSkillById() が `null` を返す
**When**: ハンドラーが処理する
**Then**: `{ success: false, error: "スキルが見つかりません" }` を返す

**検証方法**:

- getSkillById が null を返すモックでテスト
- 適切なエラーメッセージが返ることを確認

---

### AC-06: バリデーション保持

**Given**: IPC呼び出しが発生する
**When**: ハンドラーが呼び出される
**Then**: validateIpcSender による送信元検証が最初に実行される

**検証方法**:

- 不正な送信元からの呼び出しがブロックされることをテスト
- validateIpcSender のモックで検証順序を確認

---

### AC-07: SkillExecutor未初期化時のエラー

**Given**: `_skillExecutorInstance` が `null`
**When**: ハンドラーが呼び出される
**Then**: `{ success: false, error: "スキル実行エンジンが初期化されていません" }` を返す

**検証方法**:

- \_skillExecutorInstance を null に設定した状態でテスト
- 適切なエラーメッセージが返ることを確認

---

### AC-08: prompt未指定時のエラー

**Given**: args.params.prompt が undefined または空文字
**When**: ハンドラーが引数を検証する
**Then**: `{ success: false, error: "prompt must be a non-empty string" }` を返す

**検証方法**:

- prompt が undefined, null, 空文字, 空白のみの各ケースをテスト
- 引数バリデーションエラーが返ることを確認

---

## 受け入れ基準サマリーテーブル

| AC-ID | 概要                  | 検証対象                        | 期待結果                                   |
| ----- | --------------------- | ------------------------------- | ------------------------------------------ |
| AC-01 | SkillExecutor呼び出し | execute() メソッド呼び出し      | 正しい引数で呼び出される                   |
| AC-02 | リクエスト構築        | SkillExecutionRequest 生成      | フィールドが正しくマッピングされる         |
| AC-03 | 成功レスポンス変換    | success: true の場合            | { success: true, data: { executionId } }   |
| AC-04 | エラーレスポンス変換  | success: false の場合           | { success: false, error: string }          |
| AC-05 | スキル未取得エラー    | getSkillById が null            | "スキルが見つかりません"                   |
| AC-06 | バリデーション保持    | IPC送信元検証                   | validateIpcSender が最初に実行             |
| AC-07 | SkillExecutor未初期化 | \_skillExecutorInstance が null | "スキル実行エンジンが初期化されていません" |
| AC-08 | prompt未指定エラー    | prompt が空/未定義              | "prompt must be a non-empty string"        |

---

## テストケースマトリクス

| テストケース                       | AC-ID | 正常/異常 |
| ---------------------------------- | ----- | --------- |
| 正常なスキル実行リクエスト         | AC-01 | 正常      |
| オプションパラメータ付きリクエスト | AC-02 | 正常      |
| 成功レスポンスの変換               | AC-03 | 正常      |
| MAX_CONCURRENT_EXCEEDED エラー     | AC-04 | 異常      |
| AUTHENTICATION_ERROR エラー        | AC-04 | 異常      |
| TIMEOUT エラー                     | AC-04 | 異常      |
| 存在しないスキルID                 | AC-05 | 異常      |
| 不正な送信元からのIPC呼び出し      | AC-06 | 異常      |
| SkillExecutor未初期化状態          | AC-07 | 異常      |
| promptがundefined                  | AC-08 | 異常      |
| promptが空文字                     | AC-08 | 異常      |
| promptが空白のみ                   | AC-08 | 異常      |
| skillIdがundefined                 | N/A   | 異常      |
| skillIdが空文字                    | N/A   | 異常      |

---

## 成果物チェックリスト

- [x] 全AC（AC-01〜AC-08）が定義されている
- [x] 各ACにGiven/When/Then形式の記述がある
- [x] 各ACに検証方法が記載されている
- [x] サマリーテーブルで一覧化されている
- [x] テストケースマトリクスが作成されている
