# Phase 4: テストケースマトリクス

> **作成日**: 2026-02-27
> **タスク**: UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 Phase 4 Task 1
> **目的**: 全 skill: チャネルの契約一貫性を検証するテストケースを設計する

## 1. テスト対象チャネル一覧

| #   | チャネル                | 現状プロファイル | 期待プロファイル | 不整合 |
| --- | ----------------------- | ---------------- | ---------------- | ------ |
| 1   | skill:list              | W (ラッパー)     | A (ラッパー)     | -      |
| 2   | skill:scan              | W (ラッパー)     | A (ラッパー)     | -      |
| 3   | skill:getImported       | W (ラッパー)     | A (ラッパー)     | 軽微   |
| 4   | skill:import            | D (直接返却)     | B (直接返却)     | -      |
| 5   | skill:remove            | D (直接返却)     | B (直接返却)     | -      |
| 6   | skill:get-detail        | W (ラッパー)     | A (ラッパー)     | -      |
| 7   | skill:execute           | W (ラッパー)     | A (ラッパー)     | -      |
| 8   | skill:abort             | P (プリミティブ) | C (プリミティブ) | 重大   |
| 9   | skill:get-status        | P/D              | C (プリミティブ) | 中     |
| 10  | skill:analyze           | W (ラッパー)     | A (ラッパー)     | -      |
| 11  | skill:improve           | W (ラッパー)     | A (ラッパー)     | 軽微   |
| 12  | skill:optimize          | W (ラッパー)     | A (ラッパー)     | 中     |
| 13  | skill:optimize:variants | W (ラッパー)     | A (ラッパー)     | 中     |
| 14  | skill:optimize:evaluate | W (ラッパー)     | A (ラッパー)     | 中     |

## 2. プロファイル定義

| プロファイル          | 戻り値パターン                                                     | エラーパターン                         | Preload選択              |
| --------------------- | ------------------------------------------------------------------ | -------------------------------------- | ------------------------ |
| **A: ラッパー返却型** | `{ success: true, data: T }` / `{ success: false, error: string }` | 構造化エラー throw `{ code, message }` | `safeInvokeUnwrap` → `T` |
| **B: 直接返却型**     | `T` を直接 return                                                  | throw `{ code, message }`              | `safeInvoke` → `T`       |
| **C: プリミティブ型** | `boolean` / `null` / `ExecutionInfo` 等                            | throw `{ code, message }`              | `safeInvoke` → `T`       |

## 3. テストケースマトリクス

### 3-1. 正常系テスト（Main ハンドラ契約）

| テストID | チャネル                | プロファイル | テスト内容               | 期待結果                                   |
| -------- | ----------------------- | ------------ | ------------------------ | ------------------------------------------ |
| MC-N01   | skill:list              | A            | 正常なスキルリスト返却   | `{ success: true, data: SkillMetadata[] }` |
| MC-N02   | skill:scan              | A            | 強制再スキャン返却       | `{ success: true, data: SkillMetadata[] }` |
| MC-N03   | skill:getImported       | A            | インポート済みスキル返却 | `{ success: true, data: ImportedSkill[] }` |
| MC-N04   | skill:import            | B            | スキルインポート成功     | `ImportedSkill` 直接返却                   |
| MC-N05   | skill:remove            | B            | スキル削除成功           | `RemoveResult` 直接返却                    |
| MC-N06   | skill:get-detail        | A            | スキル詳細返却           | `{ success: true, data: Skill }`           |
| MC-N07   | skill:execute           | A            | スキル実行成功           | `{ success: true, data: ExecutionResult }` |
| MC-N08   | skill:abort             | C            | 中断成功（boolean）      | `boolean` 直接返却                         |
| MC-N09   | skill:get-status        | C            | ステータス返却           | `ExecutionInfo \| null` 直接返却           |
| MC-N10   | skill:analyze           | A            | 分析結果返却             | `{ success: true, data: AnalysisResult }`  |
| MC-N11   | skill:improve           | A            | 改善結果返却             | `{ success: true, data: ImproveResult }`   |
| MC-N12   | skill:optimize          | A            | 最適化結果返却           | `{ success: true, data: OptimizeResult }`  |
| MC-N13   | skill:optimize:variants | A            | バリアント返却           | `{ success: true, data: Variant[] }`       |
| MC-N14   | skill:optimize:evaluate | A            | 評価結果返却             | `{ success: true, data: EvaluateResult }`  |

### 3-2. 異常系テスト（P42準拠3段バリデーション）

全チャネルの文字列引数に対して以下の3段バリデーションを検証する。

| テストID | 入力パターン                                     | P42段階               | 期待結果                                                                        |
| -------- | ------------------------------------------------ | --------------------- | ------------------------------------------------------------------------------- |
| MC-V01   | 型が string でない（`null`, `undefined`, `123`） | 段階1: 型チェック     | throw `{ code: "VALIDATION_ERROR", message: "... must be a non-empty string" }` |
| MC-V02   | 空文字列 `""`                                    | 段階2: 空文字列       | throw `{ code: "VALIDATION_ERROR", message: "... must be a non-empty string" }` |
| MC-V03   | スペースのみ `"   "`                             | 段階3: トリム空文字列 | throw `{ code: "VALIDATION_ERROR", message: "... must be a non-empty string" }` |

#### 対象チャネル別バリデーション引数

| チャネル                | バリデーション対象引数             | 引数形式         |
| ----------------------- | ---------------------------------- | ---------------- |
| skill:import            | `skillName`                        | 直接引数         |
| skill:remove            | `skillName`                        | 直接引数         |
| skill:get-detail        | `args.skillId`                     | オブジェクト引数 |
| skill:execute           | `args.skillName` or `args.skillId` | オブジェクト引数 |
| skill:abort             | `executionId`                      | 直接引数         |
| skill:get-status        | `executionId`                      | 直接引数         |
| skill:analyze           | `args.skillName`                   | オブジェクト引数 |
| skill:improve           | `args.skillName`                   | オブジェクト引数 |
| skill:optimize          | `args.prompt`                      | オブジェクト引数 |
| skill:optimize:variants | `args.prompt`                      | オブジェクト引数 |
| skill:optimize:evaluate | `args.prompt`                      | オブジェクト引数 |

**契約不整合の検出対象（Red テスト）:**

| テストID   | チャネル                | 不整合内容                                         | Red理由      |
| ---------- | ----------------------- | -------------------------------------------------- | ------------ |
| MC-V-OPT01 | skill:optimize          | バリデーション失敗時に return `{ success: false }` | throw すべき |
| MC-V-OPT02 | skill:optimize:variants | 同上                                               | throw すべき |
| MC-V-OPT03 | skill:optimize:evaluate | 同上                                               | throw すべき |

### 3-3. 境界値テスト

| テストID | 入力パターン                     | 期待結果                                               |
| -------- | -------------------------------- | ------------------------------------------------------ |
| MC-BV01  | タブのみ `"\t"`                  | throw VALIDATION_ERROR                                 |
| MC-BV02  | 改行のみ `"\n"`                  | throw VALIDATION_ERROR                                 |
| MC-BV03  | CR+LF `"\r\n"`                   | throw VALIDATION_ERROR                                 |
| MC-BV04  | 混合空白 `" \t\n "`              | throw VALIDATION_ERROR                                 |
| MC-BV05  | 極長文字列（10000文字）          | 正常処理（バリデーション通過）                         |
| MC-BV06  | 特殊文字 `"../../../etc/passwd"` | バリデーション通過（パストラバーサル検査はサービス層） |
| MC-BV07  | Unicode文字列 `"スキル名テスト"` | 正常処理                                               |

### 3-4. エラーハンドリング一貫性テスト

| テストID | チャネル         | テスト内容               | 期待結果                                             |
| -------- | ---------------- | ------------------------ | ---------------------------------------------------- |
| MC-E01   | 全Wチャネル      | サービス例外時の応答形式 | `{ success: false, error: string }` (サニタイズ済み) |
| MC-E02   | 全D/Pチャネル    | サービス例外時の応答     | throw で伝播（try/catch なし）                       |
| MC-E03   | skill:abort      | SkillExecutor 未初期化時 | `false` 返却                                         |
| MC-E04   | skill:get-status | SkillExecutor 未初期化時 | `null` 返却                                          |

### 3-5. Preload API 契約テスト

| テストID | Preload メソッド                  | 使用ラッパー       | IPC チャネル         | 期待する Renderer 到達型 |
| -------- | --------------------------------- | ------------------ | -------------------- | ------------------------ |
| PC-01    | `skillAPI.list()`                 | `safeInvokeUnwrap` | `SKILL_LIST`         | `SkillMetadata[]`        |
| PC-02    | `skillAPI.rescan()`               | `safeInvokeUnwrap` | `SKILL_SCAN`         | `SkillMetadata[]`        |
| PC-03    | `skillAPI.getImported()`          | `safeInvokeUnwrap` | `SKILL_GET_IMPORTED` | `ImportedSkill[]`        |
| PC-04    | `skillAPI.import(name)`           | `safeInvoke`       | `SKILL_IMPORT`       | `ImportedSkill`          |
| PC-05    | `skillAPI.remove(name)`           | `safeInvoke`       | `SKILL_REMOVE`       | `RemoveResult`           |
| PC-06    | `skillAPI.execute(req)`           | `safeInvokeUnwrap` | `SKILL_EXECUTE`      | `SkillExecutionResponse` |
| PC-07    | `skillAPI.abort(id)`              | `safeInvoke`       | `SKILL_ABORT`        | `void`                   |
| PC-08    | `skillAPI.getExecutionStatus(id)` | `safeInvoke`       | `SKILL_GET_STATUS`   | `ExecutionInfo \| null`  |

**Red テスト（Preload 契約不整合）:**

| テストID | メソッド           | 不整合内容                                  | Red理由        |
| -------- | ------------------ | ------------------------------------------- | -------------- |
| PC-RED01 | `skillAPI.abort()` | Main は `boolean` 返却、Preload 型は `void` | 戻り値型不一致 |

### 3-6. validateIpcSender 使用テスト

| テストID | テスト内容                                               | 期待結果                  |
| -------- | -------------------------------------------------------- | ------------------------- |
| MC-SEC01 | 全14チャネルで validateIpcSender が呼ばれる              | 各ハンドラ内で1回呼び出し |
| MC-SEC02 | validateIpcSender 失敗時に toIPCValidationError で throw | 例外がスローされる        |

## 4. テストファイル構成

| ファイル           | 配置パス                                                             | テスト数（推定） |
| ------------------ | -------------------------------------------------------------------- | ---------------- |
| Main 契約テスト    | `apps/desktop/src/main/ipc/__tests__/skillHandlers.contract.test.ts` | 約50テスト       |
| Preload 契約テスト | `apps/desktop/src/preload/__tests__/skill-api.contract.test.ts`      | 約20テスト       |

## 5. Red テスト予測

Phase 5 の実装変更前に以下のテストが Red（失敗）となることを期待する。

| カテゴリ                              | テスト数（推定） | 失敗理由                         |
| ------------------------------------- | ---------------- | -------------------------------- |
| skill:optimize 系バリデーション throw | 9                | 現状は return、期待は throw      |
| skill:abort 戻り値型                  | 1                | Main は boolean、Preload は void |
| エラーサニタイズ                      | 8                | 現状は raw、期待はサニタイズ済み |
| **合計**                              | **約18**         | -                                |
