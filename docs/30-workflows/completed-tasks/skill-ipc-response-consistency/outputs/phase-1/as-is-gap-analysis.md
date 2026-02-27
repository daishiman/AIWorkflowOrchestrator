# AS-IS ギャップ分析: Main/Preload/Renderer 間の契約不整合

> **Phase 1 Task 1-4 成果物**
> **作成日**: 2026-02-27
> **タスク**: UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001
> **入力**: contract-matrix.md, preload-mapping.md, renderer-expectations.md

---

## 1. 分析の目的

Phase 1 の3つの成果物（契約マトリクス、Preload対応表、Renderer期待形一覧）を統合し、Main ハンドラと Preload/Renderer 期待値の間に存在する全ての不整合を特定・分類・優先度付けする。

---

## 2. 不整合パターン分類

### パターン1: ラッパー不使用（直接返却）

**説明**: 多くのチャネルが `{ success: true, data: T }` / `{ success: false, error: string }` のラッパー形式を使用するのに対し、一部のチャネルがサービス戻り値やプリミティブを直接返却している。

**該当チャネル**:

| チャネル           | Main 側戻り値                    | Preload 呼び出し方式 | Renderer 到達型         | 実害の有無 |
| ------------------ | -------------------------------- | -------------------- | ----------------------- | ---------- |
| `skill:import`     | `ImportedSkill` 直接返却         | `safeInvoke`         | `ImportedSkill`         | なし       |
| `skill:remove`     | `RemoveResult` 直接返却          | `safeInvoke`         | `RemoveResult`          | なし       |
| `skill:abort`      | `boolean` 直接返却               | `safeInvoke<void>`   | `void`（型定義上）      | 型不一致   |
| `skill:get-status` | `ExecutionInfo \| null` 直接返却 | `safeInvoke`         | `ExecutionInfo \| null` | なし       |

**影響分析**:

- `skill:import` / `skill:remove`: Preload が `safeInvoke`（unwrap なし）を使用しているため、Main の直接返却がそのまま Renderer に到達する。型は一致しており、現時点で実害はない。ただし、同カテゴリの `skill:list` / `skill:getImported` がラッパー + `safeInvokeUnwrap` を使用しているため、スキル管理 API 内でレスポンス形式が混在しており、開発者の混乱を招く。
- `skill:abort`: Main が `boolean` を返すのに対し、Preload 型定義は `Promise<void>`。Renderer 側は戻り値を使用していないため実害はないが、型定義と実装が乖離している。
- `skill:get-status`: Main が `ExecutionInfo | null` を直接返し、Preload も `safeInvoke<ExecutionInfo | null>` で型が一致。問題なし。

**優先度**: **High**（`skill:abort` の型不一致）/ **Medium**（レスポンス形式の混在）

---

### パターン2: バリデーション失敗時の throw vs return

**説明**: バリデーション失敗時のエラー伝播方式が throw と return で混在している。throw の場合は Electron IPC がエラーをシリアライズして `Promise.reject` として Renderer に伝播する。return の場合は `{ success: false, error }` が正常レスポンスとして返る。

**該当チャネル**:

| チャネル                  | バリデーション失敗時                   | コード行                    | 他チャネルとの差異 |
| ------------------------- | -------------------------------------- | --------------------------- | ------------------ |
| `skill:optimize`          | **return** `{ success: false, error }` | `skillHandlers.ts` L432-434 | throw が標準       |
| `skill:optimize:variants` | **return** `{ success: false, error }` | `skillHandlers.ts` L464-466 | throw が標準       |
| `skill:optimize:evaluate` | **return** `{ success: false, error }` | `skillHandlers.ts` L499-501 | throw が標準       |
| `skill:readFile`          | **return** `{ success: false, error }` | `skillFileHandlers.ts`      | throw が標準       |
| `skill:writeFile`         | **return** `{ success: false, error }` | `skillFileHandlers.ts`      | throw が標準       |
| `skill:createFile`        | **return** `{ success: false, error }` | `skillFileHandlers.ts`      | throw が標準       |
| `skill:deleteFile`        | **return** `{ success: false, error }` | `skillFileHandlers.ts`      | throw が標準       |
| `skill:listBackups`       | **return** `{ success: false, error }` | `skillFileHandlers.ts`      | throw が標準       |
| `skill:restoreBackup`     | **return** `{ success: false, error }` | `skillFileHandlers.ts`      | throw が標準       |

**対比（throw パターンのチャネル）**:

| チャネル           | バリデーション失敗時                          |
| ------------------ | --------------------------------------------- |
| `skill:import`     | `throw { code: "VALIDATION_ERROR", message }` |
| `skill:remove`     | `throw { code: "VALIDATION_ERROR", message }` |
| `skill:execute`    | `throw { code: "VALIDATION_ERROR", message }` |
| `skill:abort`      | `throw { code: "VALIDATION_ERROR", message }` |
| `skill:get-status` | `throw { code: "VALIDATION_ERROR", message }` |
| `skill:get-detail` | `throw { code: "VALIDATION_ERROR", message }` |
| `skill:analyze`    | `throw { code: "VALIDATION_ERROR", message }` |
| `skill:improve`    | `throw { code: "VALIDATION_ERROR", message }` |

**影響分析**:

- `skill:optimize` 系: バリデーション失敗が `{ success: false }` で返るため、`safeInvokeUnwrap` が `throw new Error(error)` に変換する。結果的に Renderer 側のエラーハンドリングは同じ catch パスに到達するが、エラーメッセージの形式が異なる（構造化エラー `{ code, message }` vs 文字列 `error`）。
- `skillFileHandlers.ts` の全チャネル: 同様に return パターンを使用。こちらは `safeInvokeUnwrap` がラッパーを展開するため、Renderer 到達時のエラー経路は統一される。

**優先度**: **Medium**（動作上の実害は限定的だが、エラー処理の予測可能性が低下）

---

### パターン3: エラーメッセージのサニタイズ不備

**説明**: `error.message` をサニタイズせずに Renderer に返却しており、内部実装の詳細（ファイルパス、スタックトレース、サービス名等）が漏洩する可能性がある。

**該当チャネル（skillHandlers.ts — `raw` パターン）**:

| チャネル                  | エラーメッセージ処理                                                        | サニタイズ状況 |
| ------------------------- | --------------------------------------------------------------------------- | -------------- |
| `skill:list`              | `error instanceof Error ? error.message : "スキャンに失敗しました"`         | **未実施**     |
| `skill:scan`              | `error instanceof Error ? error.message : "スキャンに失敗しました"`         | **未実施**     |
| `skill:getImported`       | `error instanceof Error ? error.message : "スキル取得に失敗しました"`       | **未実施**     |
| `skill:get-detail`        | `error instanceof Error ? error.message : "スキル取得に失敗しました"`       | **未実施**     |
| `skill:execute`           | `error instanceof Error ? error.message : "スキル実行に失敗しました"`       | **未実施**     |
| `skill:analyze`           | `error instanceof Error ? error.message : "スキル分析に失敗しました"`       | **未実施**     |
| `skill:improve`           | `error instanceof Error ? error.message : "スキル改善に失敗しました"`       | **未実施**     |
| `skill:optimize`          | `error instanceof Error ? error.message : "プロンプト最適化に失敗しました"` | **未実施**     |
| `skill:optimize:variants` | `error instanceof Error ? error.message : "バリアント生成に失敗しました"`   | **未実施**     |
| `skill:optimize:evaluate` | `error instanceof Error ? error.message : "プロンプト評価に失敗しました"`   | **未実施**     |

**対比（skillFileHandlers.ts — `safe` パターン）**:

| チャネル              | エラーメッセージ処理                                               | サニタイズ状況 |
| --------------------- | ------------------------------------------------------------------ | -------------- |
| `skill:readFile`      | `isKnownSkillFileError` で既知/未知分岐。未知は `"Internal error"` | **実施済**     |
| `skill:writeFile`     | 同上                                                               | **実施済**     |
| `skill:createFile`    | 同上                                                               | **実施済**     |
| `skill:deleteFile`    | 同上                                                               | **実施済**     |
| `skill:listBackups`   | 同上                                                               | **実施済**     |
| `skill:restoreBackup` | 同上                                                               | **実施済**     |

**影響分析**:

- セキュリティ観点: `04-electron-security.md` の「エラーはサニタイズしてから Renderer に送る — 内部情報を漏洩しない」原則に違反している。`error.message` にファイルパス、データベースエラー、外部 API エラー等の内部情報が含まれる可能性がある。
- 対比として、`skillFileHandlers.ts` は `isKnownSkillFileError` 関数で既知のエラーカテゴリ（`SKILL_NOT_FOUND`, `PERMISSION_DENIED` 等）のみユーザー向けメッセージを返し、未知のエラーは `"Internal error"` で一律サニタイズしている。

**優先度**: **Critical**（セキュリティ原則違反 — 内部情報漏洩リスク）

---

### パターン4: 成功レスポンスの data フィールド欠落

**説明**: `{ success: true }` で `data` フィールドを含めずに返却しており、`IpcResult<T>` 型の契約 `{ success: boolean; data?: T; error?: string }` の `data` フィールドが省略されている。

**該当チャネル**:

| チャネル              | 成功レスポンス      | Preload 側               | 実害                                 |
| --------------------- | ------------------- | ------------------------ | ------------------------------------ |
| `skill:writeFile`     | `{ success: true }` | `safeInvokeUnwrap<void>` | なし（`result.data` は `undefined`） |
| `skill:createFile`    | `{ success: true }` | `safeInvokeUnwrap<void>` | なし                                 |
| `skill:deleteFile`    | `{ success: true }` | `safeInvokeUnwrap<void>` | なし                                 |
| `skill:restoreBackup` | `{ success: true }` | `safeInvokeUnwrap<void>` | なし                                 |

**影響分析**:

- `safeInvokeUnwrap<void>` は `result.data as void` を返すため、`data` が `undefined` でも `void` として問題なく動作する。
- ただし、`{ success: true }` と `{ success: true, data: undefined }` は厳密には異なるオブジェクト形状であり、`'data' in result` チェックは `false` を返す。
- 現時点で Preload 側がこのチェックを行っていないため実害はないが、`IpcResult` 型の契約としては不完全。

**優先度**: **Low**（実害なし。型契約の完全性の問題のみ）

---

## 3. 追加の不整合

### 3-A: skill:abort の戻り値型不一致

| 項目               | 内容                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------ |
| **Main 側実装**    | `skillHandlers.ts` L307-309: `return false` / `return _skillExecutorInstance.abort(executionId)` → `boolean` |
| **Preload 型定義** | `skill-api.ts`: `safeInvoke<void>(IPC_CHANNELS.SKILL_ABORT, executionId)` → `Promise<void>`                  |
| **Renderer 使用**  | `agentSlice.ts` L695, `useSkillExecution.ts` L178: 戻り値未使用（fire-and-forget）                           |
| **影響**           | Renderer が戻り値を使用していないため実害なし。ただし型定義が不正確                                          |
| **優先度**         | **Medium**                                                                                                   |

### 3-B: skill:get-detail の Preload API 欠落

| 項目            | 内容                                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Main 側実装** | `skillHandlers.ts` L184-215: `skill:get-detail` ハンドラが登録されている                                           |
| **Preload API** | `skill-api.ts`: 対応するメソッドが存在しない                                                                       |
| **影響**        | Renderer から `skill:get-detail` を呼び出す公式 API パスがない。ハンドラが登録されているが使用されないデッドコード |
| **優先度**      | **Low**（デッドコード。機能的影響なし）                                                                            |

### 3-C: useSkillExecution.ts のデッドコード

| 項目           | 内容                                                                                                                                                                                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **コード箇所** | `useSkillExecution.ts` L132-154: `response.success === false` の分岐                                                                                                                                                                                                     |
| **問題**       | `skill:execute` は Preload 側で `safeInvokeUnwrap` を使用。Main 側が `{ success: false, error }` を返した場合、`safeInvokeUnwrap` が `throw new Error(error)` に変換するため、`response` に `success === false` が到達することは理論上あり得ない。この分岐はデッドコード |
| **影響**       | テストカバレッジの見かけ上の不足、コードの可読性低下                                                                                                                                                                                                                     |
| **優先度**     | **Low**（動作に影響なし。リファクタリング対象）                                                                                                                                                                                                                          |

### 3-D: 二重 success パターン（skill:execute）

| 項目           | 内容                                                                                                                                                                                                                                                                                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **コード箇所** | `skillHandlers.ts` L260-287: `{ success: true, data: result }` ラッパー。`result` は `SkillExecutionResponse { executionId, success, error? }`                                                                                                                                                                                                           |
| **問題**       | 外側の `IpcResult.success` と内側の `SkillExecutionResponse.success` の2つの `success` フィールドが存在する。`safeInvokeUnwrap` が外側を展開して `SkillExecutionResponse` を返すが、`SkillExecutionResponse.success` の意味は「スキル実行の成否」であり、外側の `IpcResult.success` は「IPC 通信の成否」。意味が異なるが名前が同一のため混同リスクがある |
| **影響**       | `agentSlice.ts` L676-682 で `response.executionId` を直参照しているが、`response.success` は確認していない。`useSkillExecution.ts` L132-154 では `response.success` を確認しているがデッドコード（3-C 参照）。現時点では動作するが保守性に問題あり                                                                                                       |
| **優先度**     | **Medium**（将来のリファクタリングで混同リスクが顕在化する可能性）                                                                                                                                                                                                                                                                                       |

### 3-E: skill:getImported の log.error 不統一

| 項目           | 内容                                                                                                                        |
| -------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **コード箇所** | `skillHandlers.ts` L112: `log.error("[skillHandlers] skill:getImported failed:", error)`                                    |
| **問題**       | `skill:getImported` のみ `log.error` でエラーをログ出力しており、他のチャネルにはこのパターンがない。ログ出力の一貫性が欠如 |
| **影響**       | 機能的影響はなし。ログ監視の観点でエラー検出に偏りが生じる                                                                  |
| **優先度**     | **Low**                                                                                                                     |

### 3-F: skill:improve の analysis バリデーション不足

| 項目           | 内容                                                                                                                                                                                                                                                                                                                         |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **コード箇所** | `skillHandlers.ts` L399: `if (!args.analysis)` — truthy チェックのみ                                                                                                                                                                                                                                                         |
| **問題**       | `analysis` 引数に対して P42 準拠の3段バリデーション（型チェック → 空文字列 → トリム空文字列）が適用されていない。`skillName` には3段バリデーションが適用されているのに対し、`analysis` は truthy チェックのみ。`analysis` はオブジェクト型のため文字列バリデーションは不要だが、型チェック（`typeof === "object"` 等）が欠如 |
| **影響**       | 不正な `analysis` 値（空文字列、数値等）がバリデーションを通過する可能性がある                                                                                                                                                                                                                                               |
| **優先度**     | **Medium**                                                                                                                                                                                                                                                                                                                   |

---

## 4. AR-1 ~ AR-7 制約との差分サマリー

| AR-ID | 制約                                                                          | 判定         | 不整合パターン参照 |
| ----- | ----------------------------------------------------------------------------- | ------------ | ------------------ |
| AR-1  | `skill:import` は `skillName: string` 受け取り、`ImportedSkill` を返す        | **適合**     | -                  |
| AR-2  | `{ success, data }` 系は `safeInvokeUnwrap`、直接返却系は `safeInvoke` を選択 | **部分適合** | パターン1, 3-D     |
| AR-3  | `validateIpcSender` + 文字列 `.trim()` 非空検証を全ハンドラで実施             | **適合**     | -                  |
| AR-4  | IPC 入力検証を Main 側で行い、不正入力を早期拒否                              | **部分適合** | パターン2          |
| AR-5  | 型同期（shared/preload）・仕様同期・テスト検証を必須で実施                    | **適合**     | -                  |
| AR-6  | タスク ID と指示書パスの参照整合を維持                                        | **適合**     | -                  |
| AR-7  | `skill:remove` の戻り値契約は `RemoveResult`、Preload 側型と乖離させない      | **部分適合** | パターン1          |

---

## 5. 優先度別不整合一覧

### Critical（即時対応が必要）

| ID   | 対象チャネル                                                                                                                                                                                   | 不整合内容                                                           | 影響                                                   | パターン  |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------ | --------- |
| G-01 | `skill:list`, `skill:scan`, `skill:getImported`, `skill:get-detail`, `skill:execute`, `skill:analyze`, `skill:improve`, `skill:optimize`, `skill:optimize:variants`, `skill:optimize:evaluate` | エラーメッセージ未サニタイズ: `error.message` を直接 Renderer に返却 | 内部情報漏洩リスク（ファイルパス、スタックトレース等） | パターン3 |

### High（本タスクのスコープ内で対応）

| ID   | 対象チャネル                                                      | 不整合内容                                                      | 影響                                         | パターン  |
| ---- | ----------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------- | --------- |
| G-02 | `skill:import`, `skill:remove`, `skill:abort`, `skill:get-status` | ラッパー不使用（直接返却）による管理 API 内のレスポンス形式混在 | 開発者の混乱、エラーハンドリング方式の二元化 | パターン1 |
| G-03 | `skill:abort`                                                     | Main 側 `boolean` 返却 vs Preload 型 `Promise<void>`            | 型定義と実装の乖離                           | 3-A       |

### Medium（本タスクのスコープ内で改善を推奨）

| ID   | 対象チャネル                                                           | 不整合内容                                                                  | 影響                           | パターン  |
| ---- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------ | --------- |
| G-04 | `skill:optimize`, `skill:optimize:variants`, `skill:optimize:evaluate` | バリデーション失敗時に throw ではなく `return { success: false }`           | エラー処理の予測可能性低下     | パターン2 |
| G-05 | `skill:readFile` ~ `skill:restoreBackup`                               | バリデーション失敗時に throw ではなく `return { success: false }`           | 同上                           | パターン2 |
| G-06 | `skill:execute`                                                        | 二重 success パターン（IpcResult.success + SkillExecutionResponse.success） | 保守性低下、将来的な混同リスク | 3-D       |
| G-07 | `skill:remove`                                                         | `RemoveResult.success` と IpcResult の `success` が同名で混同リスク         | 将来的な契約変更時の混乱       | パターン1 |
| G-08 | `skill:improve`                                                        | `analysis` 引数の型チェック不足（truthy チェックのみ）                      | 不正値のバリデーション通過     | 3-F       |

### Low（将来タスクで対応可能）

| ID   | 対象チャネル                                                                     | 不整合内容                                       | 影響                             | パターン  |
| ---- | -------------------------------------------------------------------------------- | ------------------------------------------------ | -------------------------------- | --------- |
| G-09 | `skill:writeFile`, `skill:createFile`, `skill:deleteFile`, `skill:restoreBackup` | 成功レスポンスに `data` フィールドがない         | `IpcResult` 型契約の不完全性     | パターン4 |
| G-10 | `skill:get-detail`                                                               | Preload API に対応メソッドがない（デッドコード） | 機能的影響なし                   | 3-B       |
| G-11 | `useSkillExecution.ts`                                                           | `response.success === false` 分岐がデッドコード  | テストカバレッジの見かけ上の不足 | 3-C       |
| G-12 | `skill:getImported`                                                              | `log.error` が他チャネルにない不統一             | ログ監視の偏り                   | 3-E       |

---

## 6. 方針C（プロファイル明示 + Preload 単一化）での対応方針

| ギャップID | 方針C での対応                                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------------------------- |
| G-01       | 全ハンドラに `sanitizeErrorMessage` 関数を導入。既知エラーはユーザー向けメッセージ、未知エラーは汎用メッセージに変換 |
| G-02       | 各チャネルを契約プロファイル（Profile-A/B/C/D）に分類し、Preload が `safeInvoke`/`safeInvokeUnwrap` を適切に選択     |
| G-03       | Preload 型定義を `Promise<boolean>` に修正するか、Main 側を `void` に変更                                            |
| G-04/G-05  | バリデーション失敗時を throw に統一（構造化エラー `{ code: "VALIDATION_ERROR", message }` パターン）                 |
| G-06       | `SkillExecutionResponse` の `success` フィールドを維持しつつ、ドキュメントで二重 success の意味を明記                |
| G-07       | `RemoveResult` を Profile-B（直接返却型）としてプロファイル化し、Preload は `safeInvoke` で処理                      |
| G-08       | `analysis` 引数に `typeof === "object" && analysis !== null` の型チェックを追加                                      |
| G-09       | `{ success: true, data: undefined }` に修正し、`IpcResult` 型契約に完全準拠                                          |
| G-10       | 将来タスクとして Preload API メソッド追加 or ハンドラ削除を検討                                                      |
| G-11       | デッドコードの分岐を削除または TODO コメントを追加                                                                   |
| G-12       | 全チャネルに統一的なエラーログ出力を追加（`sanitizeErrorMessage` 導入と連動）                                        |

---

## 7. 影響範囲サマリー

| 層       | 影響を受けるファイル                                   | 変更内容                                                |
| -------- | ------------------------------------------------------ | ------------------------------------------------------- |
| Main     | `apps/desktop/src/main/ipc/skillHandlers.ts`           | エラーサニタイズ追加、バリデーション統一                |
| Main     | `apps/desktop/src/main/ipc/skillFileHandlers.ts`       | バリデーション throw 統一（オプション）                 |
| Preload  | `apps/desktop/src/preload/skill-api.ts`                | 型定義修正（`abort` の戻り値型）                        |
| Renderer | `apps/desktop/src/renderer/hooks/useSkillExecution.ts` | デッドコード整理                                        |
| Renderer | `apps/desktop/src/renderer/store/slices/agentSlice.ts` | 影響なし（現行の解釈パターンは維持）                    |
| Shared   | `packages/shared/src/types/skill.ts`                   | `SkillExecutionResponse.success` のドキュメント明記     |
| テスト   | 各チャネルのテストファイル                             | エラーメッセージの期待値更新、バリデーション throw 対応 |
