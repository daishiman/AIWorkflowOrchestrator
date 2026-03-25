# Phase 6 Regression Expansion Plan

## メタ情報

| 項目      | 内容                                            |
| --------- | ----------------------------------------------- |
| タスクID  | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| Phase     | 6                                               |
| 作成日    | 2026-03-24                                      |
| 依存Phase | Phase 4-5                                       |

## 拡張方針

Phase 4 のテストマトリクス（62 ケース）を基盤とし、以下の4領域で edge case / regression テストを追加する:

1. **Abuse case**: 意図的な攻撃・悪用パターン
2. **Permission misconfig**: 権限設定の誤構成
3. **Disclosure missing**: 開示欠落・不完全な開示
4. **Accidental auto-send guard**: 意図しない自動送信の防止

---

## 1. Abuse Case 拡張

Phase 4 の threat model（TB-01〜TB-29）を基にした実行可能な regression テスト。

### 1.1 Approval 操作の悪用

| ID      | ケース名                               | 攻撃パターン                                           | 期待結果                               | Priority |
| ------- | -------------------------------------- | ------------------------------------------------------ | -------------------------------------- | -------- |
| REG-A01 | 複数操作に同一 token を再利用          | 1回の承認 token で連続2操作を試行                      | 2回目の操作で rejected（単一操作失効） | P0       |
| REG-A02 | approval respond を高速連打            | 100ms 間隔で approval:respond を10回送信               | 最初の1回のみ受理、残りは無視          | P1       |
| REG-A03 | 異なるoperationIdでtokenを使用         | operationId=A で取得した token を operationId=B に使用 | rejected（operationId 不一致）         | P0       |
| REG-A04 | TTL ぎりぎりでの token 使用（299秒後） | 承認から 299 秒後に実行を試行                          | approved（TTL 内）                     | P1       |
| REG-A05 | TTL 超過直後の token 使用（301秒後）   | 承認から 301 秒後に実行を試行                          | rejected: expired                      | P0       |

### 1.2 IPC 層の悪用

| ID      | ケース名                                         | 攻撃パターン                                                       | 期待結果                             | Priority |
| ------- | ------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------ | -------- |
| REG-A06 | 未登録チャネルへの invoke                        | ALLOWED_INVOKE_CHANNELS に含まれないチャネルを invoke              | safeInvoke で拒否                    | P0       |
| REG-A07 | approval:respond に不正な引数型を送信            | approval:respond に number 型を送信                                | P42 バリデーションで拒否             | P0       |
| REG-A08 | approval:respond にスペースのみの文字列を送信    | approval:respond に " " を送信                                     | P42 trim バリデーションで拒否        | P0       |
| REG-A09 | execution:get-copy-command の応答に API key 注入 | Main から返す copy command に環境変数 API key を含める（実装バグ） | sanitize 処理で API key が除去される | P0       |
| REG-A10 | validateIpcSender に偽装 webContents を送信      | 不正な sender で IPC handler を呼び出し                            | sender 検証で拒否                    | P1       |

### 1.3 Consumer Auth 悪用

| ID      | ケース名                                    | 攻撃パターン                                          | 期待結果                   | Priority |
| ------- | ------------------------------------------- | ----------------------------------------------------- | -------------------------- | -------- |
| REG-A11 | claude.ai session cookie 形式のトークン送信 | "sk-ant-sid01-" プレフィックスのトークンを認証に使用  | consumer auth guard で拒否 | P0       |
| REG-A12 | claude.ai の JWT 形式トークン送信           | claude.ai が発行する JWT 形式を模倣したトークンを送信 | token format 検証で拒否    | P1       |

---

## 2. Permission Misconfig 拡張

権限やゲート条件が誤設定された場合に安全側に倒れることを検証する。

### 2.1 Approval Gate 誤設定

| ID      | ケース名                                  | 誤設定パターン                               | 期待結果                                 | Priority |
| ------- | ----------------------------------------- | -------------------------------------------- | ---------------------------------------- | -------- |
| REG-P01 | ApprovalGate が未初期化の状態で実行を試行 | ApprovalGate インスタンスが null / undefined | フェイルセキュア: 実行拒否               | P0       |
| REG-P02 | TTL を 0 秒に設定                         | token TTL を 0 に設定して即座に期限切れ      | 全 token が即座に expired                | P1       |
| REG-P03 | TTL を負数に設定                          | token TTL を -1 に設定                       | バリデーションエラー or フェイルセキュア | P1       |

### 2.2 Advanced Console Gate 誤設定

| ID      | ケース名                                 | 誤設定パターン                                        | 期待結果                               | Priority |
| ------- | ---------------------------------------- | ----------------------------------------------------- | -------------------------------------- | -------- |
| REG-P04 | GATE-1 条件が反転（isOpen default true） | AdvancedConsolePanel の isOpen を true でレンダリング | テストで検出: 初期 isOpen=false が必須 | P0       |
| REG-P05 | GATE-2 条件の state チェック漏れ         | collapsed state で toggle CTA が visible になる       | テストで検出: state チェック必須       | P0       |
| REG-P06 | GATE-3 条件の ViewType チェック漏れ      | ViewType が settings 等の場合にパネルが表示される     | テストで検出: ViewType チェック必須    | P1       |

### 2.3 CTA 階層 誤設定

| ID      | ケース名                            | 誤設定パターン                                    | 期待結果                              | Priority |
| ------- | ----------------------------------- | ------------------------------------------------- | ------------------------------------- | -------- |
| REG-P07 | Primary CTA が 2 個同時に表示       | state 遷移バグで「実行する」と「中止」が同時表示  | テストで検出: Primary CTA は常に 1 個 | P0       |
| REG-P08 | 「高度な表示」が Primary 位置に配置 | CSS / DOM 構造のバグで secondary → primary に昇格 | テストで検出: DOM 階層検証            | P1       |

---

## 3. Disclosure Missing 拡張

開示が欠落する edge case を網羅する。

### 3.1 Session 遷移の edge case

| ID      | ケース名                                         | edge case                                         | 期待結果                                | Priority |
| ------- | ------------------------------------------------ | ------------------------------------------------- | --------------------------------------- | -------- |
| REG-D01 | 高速な state 遷移（collapsed → ready → running） | collapsed → ready を経由せず一気に running へ遷移 | ready 経由時に disclosure banner を表示 | P0       |
| REG-D02 | ready → collapsed → ready の再遷移               | banner dismiss 後に collapsed → ready を再遷移    | 新しいセッションとして banner 再表示    | P0       |
| REG-D03 | guidance-only → ready への遷移                   | guidance-only から ready に切り替わった場合       | AI 利用開示バナーに内容が切り替わる     | P1       |
| REG-D04 | disclosure info の IPC 取得失敗                  | execution:get-disclosure-info が error を返す     | フォールバック表示（汎用テキスト）      | P0       |

### 3.2 Approval Sheet 内 disclosure の edge case

| ID      | ケース名                                           | edge case                                                   | 期待結果                            | Priority |
| ------- | -------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------- | -------- |
| REG-D05 | Approval Sheet 内 disclosure のモデル名が空        | aiServiceName が空文字列                                    | フォールバック表示（"AI サービス"） | P1       |
| REG-D06 | Approval Sheet 内 disclosure の送信先リストが空    | externalDestinations が空配列                               | 「外部送信なし」の旨を表示          | P1       |
| REG-D07 | 連続する Approval Sheet で disclosure が維持される | APR-T1 承認後、すぐに APR-T2 の Approval Sheet が表示される | 2回目のシートにも disclosure が表示 | P0       |

### 3.3 再表示導線の edge case

| ID      | ケース名                                        | edge case                                | 期待結果                   | Priority |
| ------- | ----------------------------------------------- | ---------------------------------------- | -------------------------- | -------- |
| REG-D08 | 再表示アイコンを dismiss 前にクリック           | banner 表示中に再表示アイコンをクリック  | 何も起きない（既に表示中） | P1       |
| REG-D09 | banner dismiss → 再表示 → 再 dismiss の連続操作 | dismiss → reopen → dismiss を3回繰り返す | 各回で正常に動作する       | P1       |

---

## 4. Accidental Auto-Send Guard 拡張

意図しない自動送信経路を検出する regression テスト。

### 4.1 IPC 経路の存在確認

| ID      | ケース名                                     | 検証内容                                                       | 期待結果     | Priority |
| ------- | -------------------------------------------- | -------------------------------------------------------------- | ------------ | -------- |
| REG-S01 | transcript:send チャネルが存在しない         | ALLOWED_INVOKE_CHANNELS に "transcript:send" が含まれない      | チャネルなし | P0       |
| REG-S02 | transcript:auto-send チャネルが存在しない    | ALLOWED_INVOKE_CHANNELS に "transcript:auto-send" が含まれない | チャネルなし | P0       |
| REG-S03 | session:report-external チャネルが存在しない | session 結果の外部報告チャネルが存在しない                     | チャネルなし | P0       |
| REG-S04 | data:parse-hidden チャネルが存在しない       | hidden parsing 用チャネルが存在しない                          | チャネルなし | P0       |

### 4.2 意図しない外部通信パスの検出

| ID      | ケース名                                        | 検証内容                                                        | 期待結果                         | Priority |
| ------- | ----------------------------------------------- | --------------------------------------------------------------- | -------------------------------- | -------- |
| REG-S05 | Renderer から直接 HTTP リクエストが発行されない | Renderer 層で fetch / XMLHttpRequest が直接呼ばれない           | 全外部通信は Main Process 経由   | P0       |
| REG-S06 | session complete イベントに外部送信 hook がない | session 完了時のイベントハンドラに外部 API 呼び出しが含まれない | イベントハンドラ内に外部通信なし | P1       |
| REG-S07 | error catch 内に外部送信処理がない              | try-catch ブロック内でエラーを外部サービスに送信していない      | catch 内に外部通信なし           | P1       |

### 4.3 Manual Share Rail の integrity

| ID      | ケース名                                    | 検証内容                                            | 期待結果                           | Priority |
| ------- | ------------------------------------------- | --------------------------------------------------- | ---------------------------------- | -------- |
| REG-S08 | Share Rail の「選択」ステップスキップ       | 確認ステップに直接遷移を試行                        | 選択ステップ未完了で確認に進めない | P0       |
| REG-S09 | Share Rail の「確認」ステップスキップ       | 送信ステップに直接遷移を試行                        | 確認ステップ未完了で送信に進めない | P0       |
| REG-S10 | Share Rail の「送信」を approval なしで実行 | 外部送信を伴う場合に approval gate を通過しているか | approval gate 通過後のみ送信可能   | P0       |

---

## 拡張テストサマリー

| カテゴリ               | P0     | P1     | 合計   |
| ---------------------- | ------ | ------ | ------ |
| Abuse: Approval 操作   | 3      | 2      | 5      |
| Abuse: IPC 層          | 4      | 1      | 5      |
| Abuse: Consumer Auth   | 1      | 1      | 2      |
| Permission: Approval   | 1      | 2      | 3      |
| Permission: Advanced   | 2      | 1      | 3      |
| Permission: CTA        | 1      | 1      | 2      |
| Disclosure: State 遷移 | 2      | 1      | 3      |
| Disclosure: Sheet 内   | 1      | 2      | 3      |
| Disclosure: 再表示     | 0      | 2      | 2      |
| Disclosure: IPC 失敗   | 1      | 0      | 1      |
| Auto-Send: IPC 経路    | 4      | 0      | 4      |
| Auto-Send: 通信パス    | 1      | 2      | 3      |
| Auto-Send: Share Rail  | 3      | 0      | 3      |
| **合計**               | **24** | **15** | **39** |

## Phase 4 + Phase 6 の合計テストケース

| Phase        | P0     | P1     | P2    | 合計    |
| ------------ | ------ | ------ | ----- | ------- |
| Phase 4 基盤 | 40     | 21     | 1     | 62      |
| Phase 6 拡張 | 24     | 15     | 0     | 39      |
| **合計**     | **64** | **36** | **1** | **101** |

---

## テストファイル追加配置

| テストファイル（予定パス）                                                                     | 対象ケース ID                  | 環境      |
| ---------------------------------------------------------------------------------------------- | ------------------------------ | --------- |
| `apps/desktop/src/main/services/runtime/__tests__/approvalGate.regression.test.ts`             | REG-A01〜REG-A05, REG-P01〜P03 | node      |
| `apps/desktop/src/main/ipc/__tests__/ipcAbuse.regression.test.ts`                              | REG-A06〜REG-A10               | node      |
| `apps/desktop/src/main/ipc/__tests__/consumerAuth.regression.test.ts`                          | REG-A11〜REG-A12               | node      |
| `apps/desktop/src/renderer/components/execution/__tests__/advancedGate.regression.test.tsx`    | REG-P04〜REG-P08               | happy-dom |
| `apps/desktop/src/renderer/components/execution/__tests__/disclosureEdge.regression.test.tsx`  | REG-D01〜REG-D09               | happy-dom |
| `apps/desktop/src/main/ipc/__tests__/autoSendGuard.regression.test.ts`                         | REG-S01〜REG-S07               | node      |
| `apps/desktop/src/renderer/views/ExecutionConsoleView/__tests__/shareRail.regression.test.tsx` | REG-S08〜REG-S10               | happy-dom |
