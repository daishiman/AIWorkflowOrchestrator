# Phase 6 Abuse Case Matrix

## メタ情報

| 項目      | 内容                                            |
| --------- | ----------------------------------------------- |
| タスクID  | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| Phase     | 6                                               |
| 作成日    | 2026-03-24                                      |
| 依存Phase | Phase 4-5                                       |

## 概要

本マトリクスは、safety governance の攻撃面を体系的に分類し、各 abuse/misuse シナリオに対する防御策と検証方法を定義する。

---

## 攻撃者モデル

| モデル       | 能力                        | 動機                           |
| ------------ | --------------------------- | ------------------------------ |
| 一般ユーザー | UI 操作のみ                 | 意図しない操作、誤クリック     |
| 上級ユーザー | DevTools アクセス、DOM 操作 | セキュリティ制限の回避、自動化 |
| 内部開発者   | ソースコード変更            | 誤った実装（消極的防御の破壊） |
| 悪意ある拡張 | Renderer 内の JS 実行       | データ窃取、自動送信の挿入     |

---

## 1. Approval 悪用マトリクス

### 1.1 承認回避（Approval Bypass）

| ID    | 攻撃者モデル | 手法                              | 前提条件              | 防御策                                             | テスト ID              | DENY/MUST |
| ----- | ------------ | --------------------------------- | --------------------- | -------------------------------------------------- | ---------------------- | --------- |
| AB-01 | 上級ユーザー | DOM から ApprovalSheet を除去     | DevTools アクセス     | Main enforcement: token なしで拒否                 | APR-11, TB-01          | DENY-9    |
| AB-02 | 上級ユーザー | contextBridge 経由で直接 IPC 発火 | DevTools コンソール   | Main で approval token を毎回検証                  | APR-11, TB-02          | DENY-9    |
| AB-03 | 悪意ある拡張 | 偽造 token の送信                 | Renderer 内 JS 実行   | sessionId + operationId + timestamp 検証           | APR-13, REG-A03, TB-03 | DENY-9    |
| AB-04 | 上級ユーザー | 期限切れ token の再利用           | 過去の token を保存   | TTL（300s）+ 単一操作失効                          | APR-12, REG-A05, TB-04 | DENY-9    |
| AB-05 | 上級ユーザー | 高速連打で複数承認を取得          | UI 操作の高速繰り返し | 最初の1回のみ受理、残りは無視                      | REG-A02                | DENY-9    |
| AB-06 | 内部開発者   | 例外リストに危険操作を追加        | ソースコード変更      | コードレビュー + approval 不要操作の明示列挙テスト | APR-15, TB-06          | DENY-9    |

### 1.2 承認操作の悪用（Approval Misuse）

| ID    | 攻撃者モデル | 手法                     | 前提条件 | 防御策                                 | テスト ID | DENY/MUST |
| ----- | ------------ | ------------------------ | -------- | -------------------------------------- | --------- | --------- |
| AM-01 | 一般ユーザー | 内容を確認せず承認連打   | UI 操作  | 初期フォーカスを「拒否」に設定         | APR-18    | MUST-2    |
| AM-02 | 一般ユーザー | 操作説明を読まず「承認」 | UI 操作  | 操作説明を Approval Sheet 内に常時表示 | APR-05    | MUST-2    |
| AM-03 | 一般ユーザー | 停止方法を知らず放置     | UI 操作  | 停止方法を Approval Sheet 内に常時表示 | APR-06    | FR-1d     |

---

## 2. Disclosure 悪用マトリクス

### 2.1 開示抑制（Disclosure Suppression）

| ID    | 攻撃者モデル | 手法                          | 前提条件            | 防御策                                   | テスト ID      | DENY/MUST |
| ----- | ------------ | ----------------------------- | ------------------- | ---------------------------------------- | -------------- | --------- |
| DS-01 | 上級ユーザー | Disclosure Banner の DOM 削除 | DevTools アクセス   | state 遷移に banner 表示をハードバインド | DSC-01, TB-07  | MUST-1    |
| DS-02 | 内部開発者   | banner レンダリングの条件バグ | ソースコード変更    | state 遷移テストで検出                   | DSC-10, DSC-11 | MUST-1    |
| DS-03 | 上級ユーザー | 再表示アイコンの DOM 削除     | DevTools アクセス   | アイコンは banner と独立した DOM 要素    | DSC-05, TB-10  | MUST-1    |
| DS-04 | 悪意ある拡張 | disclosure 内容の書き換え     | Renderer 内 JS 実行 | Main → Renderer 方向のデータフロー固定   | DSC-02, DSC-03 | MUST-1    |

### 2.2 開示内容改竄（Disclosure Tampering）

| ID    | 攻撃者モデル | 手法                                  | 前提条件            | 防御策                                        | テスト ID     | DENY/MUST |
| ----- | ------------ | ------------------------------------- | ------------------- | --------------------------------------------- | ------------- | --------- |
| DT-01 | 悪意ある拡張 | aiServiceName の書き換え              | Renderer 内 JS 実行 | IPC 応答の整合性検証 + React state の不変管理 | DSC-02, TB-09 | MUST-1    |
| DT-02 | 悪意ある拡張 | externalDestinations の書き換え       | Renderer 内 JS 実行 | 同上                                          | DSC-03, TB-09 | MUST-1    |
| DT-03 | 内部開発者   | Disclosure Data Flow に secret を追加 | ソースコード変更    | IPC 応答の secret 非含有テスト                | DSC-07, TB-26 | DENY-5    |

---

## 3. Auto-Send 悪用マトリクス

### 3.1 自動送信の注入（Auto-Send Injection）

| ID    | 攻撃者モデル | 手法                                       | 前提条件            | 防御策                                    | テスト ID       | DENY/MUST |
| ----- | ------------ | ------------------------------------------ | ------------------- | ----------------------------------------- | --------------- | --------- |
| AS-01 | 内部開発者   | transcript 自動送信 IPC の追加             | ソースコード変更    | 消極的防御: IPC endpoint を作成しない     | NAS-01, REG-S01 | DENY-2    |
| AS-02 | 内部開発者   | session 結果自動報告 IPC の追加            | ソースコード変更    | 同上                                      | NAS-02, REG-S03 | DENY-2    |
| AS-03 | 内部開発者   | エラーログ自動送信 IPC の追加              | ソースコード変更    | 同上                                      | NAS-03          | DENY-2    |
| AS-04 | 内部開発者   | hidden parsing エンドポイントの追加        | ソースコード変更    | 同上                                      | NAS-06, REG-S04 | DENY-3    |
| AS-05 | 悪意ある拡張 | 既存 IPC の流用で approval なし LLM 呼出し | Renderer 内 JS 実行 | Approval gate が全 LLM API 呼び出しガード | NAS-04, REG-A06 | DENY-9    |

### 3.2 Manual Share Rail 迂回（Share Rail Bypass）

| ID    | 攻撃者モデル | 手法                                | 前提条件            | 防御策                               | テスト ID | DENY/MUST |
| ----- | ------------ | ----------------------------------- | ------------------- | ------------------------------------ | --------- | --------- |
| SR-01 | 上級ユーザー | 「選択」ステップのスキップ          | DevTools コンソール | 各ステップの完了フラグを順次検証     | REG-S08   | MUST-4    |
| SR-02 | 上級ユーザー | 「確認」ステップのスキップ          | DevTools コンソール | 同上                                 | REG-S09   | MUST-4    |
| SR-03 | 悪意ある拡張 | Share Rail の送信処理を直接呼び出し | Renderer 内 JS 実行 | Main Process で approval gate を検証 | REG-S10   | MUST-4    |

### 3.3 Hidden Prompt Injection

| ID    | 攻撃者モデル | 手法                                      | 前提条件            | 防御策                                   | テスト ID | DENY/MUST |
| ----- | ------------ | ----------------------------------------- | ------------------- | ---------------------------------------- | --------- | --------- |
| HP-01 | 悪意ある拡張 | ユーザー入力にプロンプト注入              | Renderer 内 JS 実行 | 入力サニタイズ + Approval Sheet での確認 | NAS-06    | DENY-4    |
| HP-02 | 内部開発者   | hidden prompt を LLM リクエストに埋め込み | ソースコード変更    | コードレビュー + 入力/出力の可視化テスト | NAS-06    | DENY-4    |

---

## 4. Front Surface 悪用マトリクス

### 4.1 Advanced Console 露出（Surface Leakage）

| ID    | 攻撃者モデル | 手法                                   | 前提条件         | 防御策                       | テスト ID               | DENY/MUST |
| ----- | ------------ | -------------------------------------- | ---------------- | ---------------------------- | ----------------------- | --------- |
| SL-01 | 内部開発者   | isOpen デフォルト値を true に変更      | ソースコード変更 | テストで初期値 false を検証  | ADV-02, REG-P04         | DENY-7    |
| SL-02 | 内部開発者   | toggle CTA を Primary 位置に移動       | ソースコード変更 | DOM 階層テストで検証         | CTA-04, REG-P08         | DENY-8    |
| SL-03 | 内部開発者   | Primary CTA ラベルに "terminal" を使用 | ソースコード変更 | ラベルテキストのテスト       | CTA-02                  | DENY-8    |
| SL-04 | 内部開発者   | state チェック条件の反転バグ           | ソースコード変更 | 全 state の表示/非表示テスト | ADV-06〜ADV-08, REG-P05 | DENY-7    |

### 4.2 Panel 外波及（Panel Escape）

| ID    | 攻撃者モデル | 手法                                   | 前提条件            | 防御策                             | テスト ID | DENY/MUST |
| ----- | ------------ | -------------------------------------- | ------------------- | ---------------------------------- | --------- | --------- |
| PE-01 | 内部開発者   | パネル内ボタンが Panel 外 state を変更 | ソースコード変更    | Panel 内 CTA の閉じ込めテスト      | CTA-05    | CTA-R5    |
| PE-02 | 悪意ある拡張 | パネル内要素経由で外部送信を実行       | Renderer 内 JS 実行 | Approval gate で全外部送信をガード | NAS-04    | DENY-9    |

---

## 5. Secret Exposure 悪用マトリクス

| ID    | 攻撃者モデル | 手法                                        | 前提条件            | 防御策                                 | テスト ID       | DENY/MUST      |
| ----- | ------------ | ------------------------------------------- | ------------------- | -------------------------------------- | --------------- | -------------- |
| SE-01 | 悪意ある拡張 | copy command から API key を抽出            | Renderer 内 JS 実行 | Main Process で API key を除外して生成 | ADV-13, REG-A09 | DENY-5, DENY-6 |
| SE-02 | 悪意ある拡張 | raw terminal output から API key を読み取り | Renderer 内 JS 実行 | terminal output の sanitize 処理       | DSC-07          | DENY-5         |
| SE-03 | 悪意ある拡張 | エラーメッセージから内部情報を抽出          | Renderer 内 JS 実行 | sanitizeErrorMessage() の適用          | NFR-01, NFR-02  | MUST-9         |
| SE-04 | 内部開発者   | IPC 応答に API key を誤って含める           | ソースコード変更    | secret 非含有テスト                    | DSC-07          | DENY-5         |

---

## 6. Consumer Auth 悪用マトリクス

| ID    | 攻撃者モデル | 手法                                   | 前提条件             | 防御策                                    | テスト ID       | DENY/MUST |
| ----- | ------------ | -------------------------------------- | -------------------- | ----------------------------------------- | --------------- | --------- |
| CA-01 | 上級ユーザー | claude.ai session token をアプリに流用 | claude.ai アカウント | Main Process で token format を検出・拒否 | CAG-01, REG-A11 | DENY-1    |
| CA-02 | 悪意ある拡張 | document.cookie API で cookie 読み取り | Renderer 内 JS 実行  | contextBridge に cookie API を公開しない  | CAG-02          | DENY-1    |
| CA-03 | 内部開発者   | claude.ai OAuth フロー実装の追加       | ソースコード変更     | 設計レビュー + IPC handler 非登録テスト   | CAG-03          | DENY-1    |

---

## 攻撃面サマリー

| 攻撃面               | 総シナリオ数 | 攻撃者: 一般 | 攻撃者: 上級 | 攻撃者: 内部開発者 | 攻撃者: 悪意ある拡張 |
| -------------------- | ------------ | ------------ | ------------ | ------------------ | -------------------- |
| Approval 悪用        | 9            | 3            | 4            | 1                  | 1                    |
| Disclosure 悪用      | 7            | 0            | 2            | 2                  | 3                    |
| Auto-Send 悪用       | 10           | 0            | 2            | 5                  | 3                    |
| Front Surface 悪用   | 6            | 0            | 0            | 4                  | 2                    |
| Secret Exposure 悪用 | 4            | 0            | 0            | 1                  | 3                    |
| Consumer Auth 悪用   | 3            | 0            | 1            | 1                  | 1                    |
| **合計**             | **39**       | **3**        | **9**        | **14**             | **13**               |

## 防御層マッピング

| 防御層                   | 対応する攻撃面                            | enforcement 方式             |
| ------------------------ | ----------------------------------------- | ---------------------------- |
| Main Process enforcement | Approval bypass, Auto-send, Consumer auth | token 検証、IPC 非提供、拒否 |
| Preload ホワイトリスト   | IPC 層悪用、Cookie アクセス               | ALLOWED_INVOKE_CHANNELS      |
| Renderer state guard     | Front surface leakage, Disclosure 抑制    | state + gate 条件テスト      |
| コードレビュー           | 内部開発者の誤実装                        | 消極的防御のテスト検証       |
| sanitizeErrorMessage     | Secret exposure                           | 出力サニタイズ               |
