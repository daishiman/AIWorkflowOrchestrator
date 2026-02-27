# Phase 8: リファクタリングレポート

> **作成日**: 2026-02-27
> **タスクID**: UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001
> **Phase**: 8 / 13
> **ステータス**: 完了

---

## 1. リファクタリング対象

Phase 5 で実施した契約統一の変更について、TDD の Refactor フェーズとしてコード品質を評価した。

### 対象ファイル

| ファイル                                     | Phase 5 での変更内容                                                                                        |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/ipc/skillHandlers.ts` | sanitizeErrorMessage 追加、optimize系バリデーションの throw 統一、全10箇所の catch ブロックでサニタイズ適用 |
| `apps/desktop/src/preload/skill-api.ts`      | 変更なし（既に契約に準拠していたため）                                                                      |
| `apps/desktop/src/preload/types.ts`          | 変更なし                                                                                                    |

---

## 2. タスク1: 重複ロジック分析

### 2-1. sanitizeErrorMessage の重複パターン

`sanitizeErrorMessage` 関数は以下の4ファイルに同一のパターンで局所定義されている。

| ファイル                  | 定義行   | 適用箇所数 | パターンの同一性               |
| ------------------------- | -------- | ---------- | ------------------------------ |
| `skillHandlers.ts`        | L51-70   | 10箇所     | 基準パターン（Phase 5 で追加） |
| `skillCreatorHandlers.ts` | L101-128 | 12箇所     | 同等（TASK-9B-H-003 で追加）   |
| `authHandlers.ts`         | L42-67   | 4箇所      | 同等                           |
| `authModeHandlers.ts`     | L78-102  | 4箇所      | 同等                           |

#### 重複の定量分析

- **関数本体**: 約20行 x 4ファイル = 80行の重複
- **正規表現パターン定数**: 約7行 x 4ファイル = 28行の重複
- **合計重複行数**: 約108行

#### 共通化のメリット・デメリット

| 観点       | 共通化する場合                   | 各ファイルに局所定義を維持する場合 |
| ---------- | -------------------------------- | ---------------------------------- |
| DRY原則    | 1箇所のみ修正で済む              | 4ファイルの同時修正が必要          |
| 可読性     | import元の確認が必要             | ファイル内で完結、自己完結性が高い |
| テスト影響 | 共通モジュールのテスト1箇所      | 各ファイルのテストで暗黙的にカバー |
| 変更リスク | 共通関数の変更が全ハンドラに影響 | 局所変更は局所影響のみ             |
| 依存関係   | 新しい共有モジュールへの依存追加 | 外部依存なし                       |

### 2-2. 設計判断: 各ファイルに局所定義を維持

**判断理由**:

1. **影響範囲の局所化**: 各ハンドラファイルは独立した責務を持ち、エラーサニタイズのパターンが将来的に微妙に異なる可能性がある（例: 認証エラーではトークン関連のサニタイズを強化するが、スキルハンドラでは不要）
2. **変更リスクの最小化**: 共通化すると、1箇所の修正が4つのハンドラファイルに波及する。現時点では各ファイルのサニタイズ要件が同一だが、将来の分化を許容するために局所定義を維持する
3. **自己完結性**: 各ハンドラファイルが外部依存なしで完結しており、ファイル単位での理解・テストが容易
4. **既存プロジェクトパターンとの整合**: `skillCreatorHandlers.ts` には「authModeHandlers.ts の sanitizeErrorMessage() と同等のパターン」というコメントが既にあり（L91）、「ハンドラごとに持つ」パターンがプロジェクト全体で定着している

**将来の共通化トリガー**:

- サニタイズパターンの追加・変更が3回以上発生した場合
- 5ファイル以上で同一パターンが使用される場合
- セキュリティ要件の変更で全ファイルの同時更新が必要になった場合

**未タスク候補**: `sanitizeErrorMessage` の共通ユーティリティ化は将来タスクとして検討可能だが、現時点では緊急性がないため未タスク化は見送り。

### 2-3. P42準拠3段バリデーションの重複

各ハンドラでの3段バリデーションパターンを分析した。

```typescript
// パターン1: 直接引数型（skill:import, skill:remove, skill:abort, skill:get-status）
if (typeof skillName !== "string" || skillName.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "skillName must be a non-empty string",
  };
}

// パターン2: オブジェクト引数型（skill:get-detail, skill:analyze, skill:improve, skill:optimize系）
if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "skillName must be a non-empty string",
  };
}

// パターン3: 複合引数型（skill:execute）
// isSkillNameRequest() による型ガードと2段階バリデーション
```

**判断基準の適用**:

- 判断基準: 「3行以上の完全に同一のコードブロックが4箇所以上ある場合は抽出する」
- 分析結果: 各パターンのメッセージ文字列（`"skillName must be..."` / `"executionId must be..."` / `"prompt must be..."` / `"skillId must be..."`）とアクセスパス（`skillName` vs `args.skillName` vs `args.prompt` vs `executionId`）が異なる
- **判定: 抽出しない** -- ヘルパー関数に抽出すると、引数アクセスパスとエラーメッセージを外部から注入する必要があり、可読性が低下する

### 2-4. catch ブロックの重複

全 Profile A ハンドラで同一の catch パターンが使用されている。

```typescript
} catch (error) {
  log.error("[skillHandlers] skill:xxx failed:", error);
  return {
    success: false,
    error: sanitizeErrorMessage(error),
  };
}
```

**分析**:

- 3行のパターンが10箇所に存在する
- `log.error` のメッセージがチャネル名ごとに異なる（`skill:list` / `skill:scan` / ... ）
- ヘルパー関数に抽出可能だが、デバッグ時のスタックトレース情報が失われるリスクがある

**判定: 抽出しない** -- ログメッセージの差異とデバッグ情報保持を優先する。

---

## 3. タスク2: 命名改善（P45対策）

### 3-1. skillId の使用箇所確認

`skillHandlers.ts` 内の `skillId` 使用箇所を確認した。

| 行       | コード                                              | 実際の値のセマンティクス                                         | 判定 |
| -------- | --------------------------------------------------- | ---------------------------------------------------------------- | ---- |
| L224     | `args: { skillId: string }` (skill:get-detail)      | スキルの一意識別子。`getSkillById()` に渡される                  | 一致 |
| L233     | `args?.skillId` バリデーション                      | 上記と同一                                                       | 一致 |
| L262     | `{ skillId: string; params?: ... }` (skill:execute) | スキルの一意識別子。`executeSkill(args.skillId, ...)` に渡される | 一致 |
| L289-290 | `args?.skillId` バリデーション                      | 上記と同一                                                       | 一致 |
| L314     | `skillService.executeSkill(args.skillId, ...)`      | 上記と同一                                                       | 一致 |

**判定**: `skillId` は実際にスキルのID（一意識別子）を指しており、セマンティクスと一致している。P45（命名ドリフト）は発生していない。

### 3-2. skillName の使用箇所確認

| ハンドラ      | 引数名                                      | 実際の値           | 判定 |
| ------------- | ------------------------------------------- | ------------------ | ---- |
| skill:import  | `skillName: SkillName`                      | スキル名（文字列） | 一致 |
| skill:remove  | `skillName: SkillName`                      | スキル名（文字列） | 一致 |
| skill:analyze | `args.skillName`                            | スキル名（文字列） | 一致 |
| skill:improve | `args.skillName`                            | スキル名（文字列） | 一致 |
| skill:execute | `args.skillName` (SkillExecutionRequest 内) | スキル名（文字列） | 一致 |

**判定**: 全ての `skillName` 引数がセマンティクスと一致している。P45 対策は適切に実施されている。

### 3-3. その他の命名確認

| チェック項目 | 基準                             | 結果                                                                               |
| ------------ | -------------------------------- | ---------------------------------------------------------------------------------- |
| 型名         | PascalCase                       | 準拠（`SkillAnalyzeRequest`, `SkillOptimizeVariantsRequest` 等）                   |
| 関数名       | camelCase                        | 準拠（`registerSkillHandlers`, `sanitizeErrorMessage`, `unregisterSkillHandlers`） |
| 定数名       | UPPER_SNAKE_CASE                 | 準拠（`IPC_CHANNELS`, `STACK_TRACE_PATTERN`, `DEFAULT_ERROR_MESSAGE` 等）          |
| boolean変数  | is/has/can/should プレフィックス | 準拠（`isSkillNameRequest`, `hasSkillName`）                                       |
| IPC引数名    | 値のセマンティクスと一致         | 準拠（上記確認済み）                                                               |

---

## 4. タスク3: Preload API コード整理

### 4-1. safeInvoke / safeInvokeUnwrap 選択の検証

| Preload メソッド           | 使用ラッパー       | 契約プロファイル | 一致判定 |
| -------------------------- | ------------------ | ---------------- | -------- |
| `list()`                   | `safeInvokeUnwrap` | A (ラッパー)     | 一致     |
| `rescan()`                 | `safeInvokeUnwrap` | A (ラッパー)     | 一致     |
| `getImported()`            | `safeInvokeUnwrap` | A (ラッパー)     | 一致     |
| `import()`                 | `safeInvoke`       | B (直接返却)     | 一致     |
| `remove()`                 | `safeInvoke`       | B (直接返却)     | 一致     |
| `execute()`                | `safeInvokeUnwrap` | A (ラッパー)     | 一致     |
| `abort()`                  | `safeInvoke`       | C (プリミティブ) | 一致     |
| `getExecutionStatus()`     | `safeInvoke`       | C (プリミティブ) | 一致     |
| `sendPermissionResponse()` | `safeInvoke`       | 特殊             | 一致     |
| `readFile()`               | `safeInvokeUnwrap` | A (ラッパー)     | 一致     |
| `writeFile()`              | `safeInvokeUnwrap` | A (ラッパー)     | 一致     |
| `createFile()`             | `safeInvokeUnwrap` | A (ラッパー)     | 一致     |
| `deleteFile()`             | `safeInvokeUnwrap` | A (ラッパー)     | 一致     |
| `listBackups()`            | `safeInvokeUnwrap` | A (ラッパー)     | 一致     |
| `restoreBackup()`          | `safeInvokeUnwrap` | A (ラッパー)     | 一致     |

**判定**: 全15メソッドで `safeInvoke` / `safeInvokeUnwrap` の選択が契約プロファイルと一致している。

### 4-2. 型アサーション確認

`skill-api.ts` 内の型アサーション使用箇所を確認した。

| 箇所 | コード                                          | 評価                                                                                                                                       |
| ---- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| L198 | `return result.data as T` (safeInvokeUnwrap 内) | 許容: ジェネリック関数内での型パラメータ使用。`result.success === true` の後に `data` にアクセスしているため、実行時安全性は確保されている |

**不要な型アサーション (`as unknown as` パターン)**: なし

### 4-3. ハードコード文字列確認

`skill-api.ts` 内の全 `safeInvoke` / `safeInvokeUnwrap` / `safeOn` 呼び出しを確認した結果、全て `IPC_CHANNELS` 定数経由で行われている。ハードコード文字列は存在しない。

確認済みチャネル参照: 19箇所全てが `IPC_CHANNELS.*` 定数経由（L226, L229, L232, L235, L243, L250, L255, L258, L261, L264, L267, L272, L278, L285, L295, L306, L313, L319, L324）

### 4-4. 引数型と戻り値型の一致確認

`SkillAPI` interface の宣言型と `skill-api.ts` の実装が一致していることを確認した。

| メソッド               | 宣言型                            | 実装の戻り値                               | 一致                                                   |
| ---------------------- | --------------------------------- | ------------------------------------------ | ------------------------------------------------------ |
| `execute()`            | `Promise<SkillExecutionResponse>` | `safeInvokeUnwrap<SkillExecutionResponse>` | 一致                                                   |
| `abort()`              | `Promise<void>`                   | `safeInvoke<void>`                         | 一致（注: Main は boolean を返すが Preload 型は void） |
| `getExecutionStatus()` | `Promise<ExecutionInfo \| null>`  | `safeInvoke<ExecutionInfo \| null>`        | 一致                                                   |
| `list()`               | `Promise<SkillMetadata[]>`        | `safeInvokeUnwrap` (暗黙的に推論)          | 一致                                                   |
| `import()`             | `Promise<ImportedSkill>`          | `safeInvoke` (暗黙的に推論)                | 一致                                                   |
| `remove()`             | `Promise<RemoveResult>`           | `safeInvoke` (暗黙的に推論)                | 一致                                                   |

> 注: `abort()` の Main/Preload 型不一致（Main: boolean / Preload: void）は PC-RED01 テストで文書化済み。本タスクのスコープ外。

---

## 5. タスク4: テスト Green 維持確認

### 5-1. テスト実行結果

#### Main IPC テスト

```
Test Files  7 passed (7)
     Tests  240 passed (240)
  Duration  4.20s
```

#### Preload API テスト

```
Test Files  5 passed (5)
     Tests  214 passed (214)
  Duration  1.87s
```

### 5-2. 確認結果

| 項目                             | 結果                             |
| -------------------------------- | -------------------------------- |
| Main ハンドラテスト              | 240/240 PASS                     |
| Preload API テスト               | 214/214 PASS                     |
| TypeScript 型チェック            | Hook 経由で自動実行・成功        |
| リファクタリングによるコード変更 | なし（分析のみ、変更不要と判断） |

---

## 6. 不要コード除去確認

| チェック項目                 | 結果                                                                        |
| ---------------------------- | --------------------------------------------------------------------------- |
| 未使用 import                | なし                                                                        |
| 未使用変数                   | なし                                                                        |
| デッドコード                 | なし                                                                        |
| コメントアウトされたコード   | なし                                                                        |
| Phase 5 以前の旧パターン残存 | なし（optimize 系の `return { success: false }` は全て `throw` に変更済み） |

---

## 7. リファクタリング結果サマリー

| タスク                           | 判断       | 理由                                                                                                      |
| -------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------- |
| sanitizeErrorMessage の共通化    | **見送り** | 影響範囲の局所化・自己完結性を優先。将来の分化を許容。4ファイルで「ハンドラごとに持つ」パターンが既に定着 |
| P42 3段バリデーションの共通化    | **見送り** | 引数アクセスパスとエラーメッセージが微妙に異なり、抽出すると可読性低下                                    |
| catch ブロックの共通化           | **見送り** | log.error のメッセージ差異とデバッグ情報保持を優先                                                        |
| P45 命名ドリフト修正             | **不要**   | 全引数名がセマンティクスと一致済み（skillId/skillName/executionId/prompt）                                |
| 型アサーション除去               | **不要**   | 不要な型アサーション（`as unknown as`）は存在しない                                                       |
| ハードコード文字列除去           | **不要**   | 全19箇所のチャネル参照が IPC_CHANNELS 定数経由                                                            |
| safeInvoke/safeInvokeUnwrap 選択 | **不要**   | 全15メソッドで契約プロファイルと一致済み                                                                  |
| 不要コード除去                   | **不要**   | デッドコード・未使用コードは存在しない                                                                    |

**結論**: Phase 5 の実装は既に十分な品質を有しており、追加のリファクタリングは不要。テストは全て Green 状態を維持している。

---

## 完了条件チェックリスト

- [x] 重複ロジックが判断基準に沿って整理されている（過度な抽象化なし）
- [x] 命名が一貫している（P45対策確認済み）
- [x] 不要な型アサーションが除去されている（存在しない）
- [x] `safeInvoke` / `safeInvokeUnwrap` の選択が契約プロファイルと一致している
- [x] 全テストが Green のまま維持されている（454/454 PASS）
- [x] `pnpm typecheck` が成功している

---

## Phase実行記録

| 項目         | 内容                                                                                                                                |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| 実行開始日時 | 2026-02-27                                                                                                                          |
| 実行完了日時 | 2026-02-27                                                                                                                          |
| 実行者       | Claude Opus 4.6                                                                                                                     |
| 特記事項     | リファクタリング分析の結果、コード変更は不要と判断。sanitizeErrorMessage の共通化は将来の変更トリガー条件を明示し、現時点では見送り |

---

## Phase末端アクション

- [x] タスク1: 重複ロジック整理 -- 分析完了、判断記録済み
- [x] タスク2: 命名改善 -- P45対策確認・修正不要
- [x] タスク3: Preload API コード整理 -- 可読性改善不要（既に適切）
- [x] タスク4: テスト Green 維持確認 -- 全テストPASS、型チェック成功

**Phase 8 判定: PASS** -- Phase 9（品質検証）へ進行。
