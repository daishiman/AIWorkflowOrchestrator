# Phase 6: 境界ケース一覧

## メタ情報

| 項目     | 内容                                                         |
| -------- | ------------------------------------------------------------ |
| タスクID | TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001        |
| Phase    | 6                                                            |
| 作成日   | 2026-03-23                                                   |
| 前提     | Phase 4 test-matrix.md、Phase 6 regression-expansion-plan.md |

## 1. 境界ケース一覧の目的

本文書は Phase 4 テストマトリクスおよび Phase 6 回帰拡張計画では明示されていない
「未検証境界」を明文化する。これらは実装タスク（UT-SLIDE-IMPL-001）の Phase 4-6 で
テストケースとして実装する義務を負う。

## 2. 状態遷移の境界ケース

### 2.1 定義されていない遷移の扱い

設計書（contract-matrix.md）に明示されていない遷移が試みられた場合の動作:

| 未定義遷移                      | 設計書の根拠     | 期待動作              | 未検証理由                     |
| ------------------------------- | ---------------- | --------------------- | ------------------------------ |
| synced → synced（自己遷移）     | 遷移表に記載なし | no-op または throw    | 仕様が曖昧（Phase 5 で確定要） |
| running → running（自己遷移）   | 遷移表に記載なし | no-op または throw    | 仕様が曖昧（Phase 5 で確定要） |
| guidance → guidance（自己遷移） | 遷移表に記載なし | openTerminal のみ許容 | openTerminal の特例として確定  |
| degraded → degraded（自己遷移） | 遷移表に記載なし | no-op                 | P62 対策で throw すべきかも    |

**アクション**: UT-SLIDE-IMPL-001 Phase 2 設計で自己遷移の扱いを確定させること。

### 2.2 並行遷移の競合

複数のイベントが同時に発火した場合の境界:

| シナリオ                                    | 競合パターン                  | 未検証理由                           |
| ------------------------------------------- | ----------------------------- | ------------------------------------ |
| startSync と reportDegradation がほぼ同時   | running 状態への多重書き込み  | 非同期競合は unit テストでは再現困難 |
| resolveManually と retryFromGuidance が同時 | guidance → synced/running競合 | reducer が last-write-wins か要確認  |
| IPC `capability:changed` が連続送信         | Renderer 側の State 更新競合  | Zustand の更新バッチングに依存       |

**アクション**: integration テストで `vi.fakeTimers` を用いた競合シミュレーションを追加。

## 3. API Key Source の境界ケース

### 3.1 getApiKey の3段フォールバックの完全マトリクス

| safeStorage   | env 変数 | 期待 apiKeySource | 期待 blockedReason | 期待ログ                   |
| ------------- | -------- | ----------------- | ------------------ | -------------------------- |
| 成功          | 設定あり | safeStorage       | undefined          | なし                       |
| 失敗          | 設定あり | env               | undefined          | warn: env fallback         |
| 失敗          | 未設定   | none              | "no_api_key"       | error: no API key          |
| 成功          | 未設定   | safeStorage       | undefined          | なし（env は参照しない）   |
| keychain なし | 設定あり | env               | undefined          | warn: keychain unavailable |
| keychain なし | 未設定   | none              | "no_api_key"       | error: no API key          |

未検証: 「safeStorage 成功 + env 設定あり」の場合に env を参照しないことを確認するテストが Phase 4 に存在しない。

### 3.2 API Key の形式バリデーション

| API Key 形式                   | 期待動作                            | 未検証理由                        |
| ------------------------------ | ----------------------------------- | --------------------------------- |
| 空文字列（""）                 | apiKeySource="none" 相当として扱う  | P42 準拠の .trim() チェックが必要 |
| スペースのみ（" "）            | apiKeySource="none" 相当として扱う  | P42 の .trim() 対策               |
| 有効な形式だがサーバー側で無効 | SDK 呼び出し後に ERR-T02 相当で処理 | 実際の API 呼び出しが必要         |
| 127文字の有効な API key        | 正常処理                            | 境界値（128文字）の前後も確認要   |

**アクション**: IPC handler のバリデーション（P42 対策）で `.trim() === ""` のチェックを追加。

## 4. UI 4領域の境界ケース

### 4.1 表示ルールの境界（contract-matrix.md § 4 準拠）

| 状態     | progress row | guidance block | fallback card | terminal launcher | 境界リスク                             |
| -------- | ------------ | -------------- | ------------- | ----------------- | -------------------------------------- |
| synced   | show         | hide           | hide          | hide              | guidance/fallback が show になる誤実装 |
| running  | show         | hide           | hide          | hide              | running 中に fallback が flash する    |
| degraded | show         | show           | show          | hide              | terminal launcher が見えてしまう誤実装 |
| guidance | show         | show           | hide          | show              | fallback card が残表示になる誤実装     |

未検証: React の re-render タイミングで状態遷移中に2つの状態が同時表示される「チラツキ」。

### 4.2 fallback card の CTA 境界

| シナリオ                                          | 期待動作                                  | 未検証理由                       |
| ------------------------------------------------- | ----------------------------------------- | -------------------------------- |
| CTA ダブルクリック（連続クリック）                | requestGuidance が1回のみ発火             | デバウンス実装の有無が未確定     |
| CTA クリック後、すぐに画面をスクロール            | guidance 状態への遷移がキャンセルされない | UI の非同期更新との競合          |
| degraded 状態が解消（外部からの resolveManually） | fallback card が非表示になる              | 外部トリガーへの反応テストが不足 |

### 4.3 terminal launcher の境界

| シナリオ                                                              | 期待動作                                      | 未検証理由                             |
| --------------------------------------------------------------------- | --------------------------------------------- | -------------------------------------- |
| terminal が既に起動している場合                                       | 新規ウィンドウ vs. フォーカス移動             | TerminalHandoffCard.isAvailable の制御 |
| guidance 状態で terminal launcher をクリック後、手動復旧なしに2分経過 | タイムアウトなし（ユーザー判断を待つ）        | タイムアウト仕様が未定義               |
| terminal が起動失敗した場合                                           | エラーメッセージを terminal launcher 内に表示 | エラー表示の UI 設計が未定義           |

## 5. IPC 境界の未検証ケース

### 5.1 contextBridge の structured clone 制約

| DTO フィールド型                      | structured clone 可否  | 未検証理由                                  |
| ------------------------------------- | ---------------------- | ------------------------------------------- |
| `undefined` フィールド                | 可（undefined は除去） | consumer が undefined を期待しているか      |
| `null` フィールド                     | 可                     | undefined と null の混在が危険              |
| union型（`"integrated" \| "manual"`） | 可                     | runtime での型ガードが必要                  |
| 入れ子オブジェクト                    | 可                     | SlideCapabilityDTO はフラット設計だが要確認 |

**アクション**: V10-T07 の structured clone テストを「各フィールド型別」に展開する。

### 5.2 IPC handler の二重登録防止（P5 対策）

| シナリオ                                              | 期待動作                       | 未検証理由                  |
| ----------------------------------------------------- | ------------------------------ | --------------------------- |
| `registerSlideCapabilityHandlers()` が2回呼ばれる     | 2回目は例外を throw（P5 対策） | P5 対策の実装が未定義       |
| macOS の `activate` イベントで handler が再登録される | 解除後に再登録（P5 解決策）    | P5 対策パターンの適用が必要 |

**アクション**: `safeRegister` または `unregisterAllIpcHandlers` パターンを採用して P5 対策を実装。

## 6. ManualBoundary の未検証境界

### 6.1 lane 判定のタイミング境界

| シナリオ                                           | 期待動作                            | 未検証理由                     |
| -------------------------------------------------- | ----------------------------------- | ------------------------------ |
| `isIntegratedLane()` が null を返す                | manual lane として扱う（fail-safe） | null ケースの仕様が未定義      |
| `isIntegratedLane()` が例外を throw する           | degraded 状態に遷移                 | 例外ハンドリングの仕様が未定義 |
| skill-executor.ts の初期化前に lane 判定が呼ばれる | 初期化待機またはエラー              | 初期化順序の仕様が未定義       |

### 6.2 hidden injection の定義境界

ManualBoundary の「hidden injection」の定義が曖昧な境界:

| 操作                             | hidden injection に該当するか | 現状の設計での扱い               |
| -------------------------------- | ----------------------------- | -------------------------------- |
| システムプロンプトの付加         | 該当する                      | manual lane では禁止（設計確定） |
| フォーマット変換（改行正規化等） | 微妙（ユーザーの意図の範囲）  | 仕様が曖昧、Phase 5 で確定要     |
| 空白トリム                       | 該当しない                    | P42 対策と整合                   |
| 文字コード変換（UTF-8 正規化）   | 該当しない（不可避）          | 許容として設計確定               |

**アクション**: UT-SLIDE-IMPL-001 Phase 2 設計で hidden injection の定義を明確化する。

## 7. 境界ケース管理テーブル

| 境界ケース ID | カテゴリ             | 状態       | アクション                                     |
| ------------- | -------------------- | ---------- | ---------------------------------------------- |
| BC-ST-01      | 状態遷移             | 未定義     | UT-SLIDE-IMPL-001 Phase 2 で自己遷移仕様を確定 |
| BC-ST-02      | 並行競合             | 未検証     | integration テストで競合シミュレーションを追加 |
| BC-AK-01      | API Key              | 未検証     | P42 準拠の .trim() バリデーションを追加        |
| BC-AK-02      | API Key 形式         | 未検証     | 有効形式の境界値テストを追加                   |
| BC-UI-01      | UI チラツキ          | 未検証     | React テストで状態遷移中の表示を検証           |
| BC-UI-02      | CTA 連打             | 未検証     | デバウンス実装を確定後にテスト追加             |
| BC-UI-03      | terminal失敗         | 仕様未定義 | UT-SLIDE-UI-001 Phase 2 でエラー表示を設計     |
| BC-IPC-01     | structured clone     | 未検証     | V10-T07 を型別に展開                           |
| BC-IPC-02     | handler 二重登録     | 未実装     | P5 対策パターンを適用                          |
| BC-MB-01      | lane 判定 null       | 未定義     | fail-safe 仕様を Phase 5 で確定                |
| BC-MB-02      | hidden injection定義 | 曖昧       | Phase 5 で定義を明確化                         |
