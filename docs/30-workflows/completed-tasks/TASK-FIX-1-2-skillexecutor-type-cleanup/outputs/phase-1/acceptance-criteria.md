# 受け入れ基準

## タスク情報

| 項目     | 内容                               |
| -------- | ---------------------------------- |
| タスクID | TASK-FIX-1-2                       |
| タスク名 | SkillExecutor 型定義クリーンアップ |
| 作成日   | 2026-02-07                         |
| Phase    | 1 - 要件定義                       |

---

## AC-1: 完全一致型の削除と import 置換

### 説明

正本（`@repo/shared/types/skill.ts`）と完全に一致する5つの型定義を SkillExecutor.ts から削除し、`@repo/shared` からの import に置換する。

### 対象型

| 型名                    | SkillExecutor.ts 行番号 |
| ----------------------- | ----------------------- |
| ExecutionState          | L31-36                  |
| ExecutionInfo           | L84-90                  |
| SkillExecutionErrorCode | L110-120                |
| SkillExecutionError     | L122-127                |
| ExecutionContext        | L129-137                |

### 検証項目

- [ ] **AC-1.1**: SkillExecutor.ts から上記5つの型定義が削除されていること
- [ ] **AC-1.2**: `@repo/shared` からの import 文に上記5つの型が含まれていること
- [ ] **AC-1.3**: SkillExecutor.ts 内の型参照箇所が全て import された型を使用していること
- [ ] **AC-1.4**: `pnpm typecheck` が成功すること
- [ ] **AC-1.5**: 既存テストが全て PASS すること

### 検証コマンド

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# テスト実行
pnpm --filter @repo/desktop test -- --run SkillExecutor
```

---

## AC-2: 差異型の統合

### 説明

正本と差異がある3つの型について、後方互換性を維持しながら統合する。

### 対象型と統合方針

#### AC-2.1: SkillExecutionRequest

| 項目     | 変更内容                                                                                                  |
| -------- | --------------------------------------------------------------------------------------------------------- |
| 正本変更 | `skillId?: string`, `timeout?: number`, `sessionId?: string`, `retryConfig?: Partial<RetryConfig>` を追加 |
| ローカル | 削除して正本を使用                                                                                        |

**検証項目**:

- [ ] 正本に必要なプロパティが追加されていること
- [ ] SkillExecutor.ts から SkillExecutionRequest の定義が削除されていること
- [ ] 既存の execute() メソッドが正常に動作すること

#### AC-2.2: SkillExecutionResponse

| 項目     | 変更内容                                            |
| -------- | --------------------------------------------------- |
| 正本変更 | `error` 型を `string \| SkillExecutionError` に拡張 |
| ローカル | 削除して正本を使用                                  |

**検証項目**:

- [ ] 正本の error 型が union 型に拡張されていること
- [ ] SkillExecutor.ts から SkillExecutionResponse の定義が削除されていること
- [ ] エラーレスポンスが正常に処理されること

#### AC-2.3: SkillStreamMessage

| 項目       | 変更内容                                                 |
| ---------- | -------------------------------------------------------- |
| ローカル   | `SkillExecutorStreamMessage` にリネーム                  |
| アダプター | 必要に応じて正本の SkillStreamMessage への変換関数を追加 |

**検証項目**:

- [ ] SkillExecutor.ts 内の型が `SkillExecutorStreamMessage` にリネームされていること
- [ ] ストリーミング通信が正常に動作すること
- [ ] 型の命名が衝突していないこと

---

## AC-3: import 文の整理

### 説明

型変更に伴い、import 文を整理する。

### 検証項目

- [ ] **AC-3.1**: `@repo/shared` からの import に以下の型が含まれていること
  - ExecutionState
  - ExecutionInfo
  - SkillExecutionErrorCode
  - SkillExecutionError
  - ExecutionContext
  - SkillExecutionRequest
  - SkillExecutionResponse
- [ ] **AC-3.2**: 未使用の import が存在しないこと
- [ ] **AC-3.3**: import 順序が規約に従っていること（外部 → 内部 → 型）
- [ ] **AC-3.4**: `pnpm lint` が成功すること

### 検証コマンド

```bash
# Lint チェック
pnpm --filter @repo/desktop lint
```

---

## AC-4: 全体整合性

### 説明

変更後のコードベース全体が整合性を保っていることを確認する。

### 検証項目

- [ ] **AC-4.1**: `pnpm typecheck` が全パッケージで成功すること
- [ ] **AC-4.2**: `pnpm lint` が全パッケージで成功すること
- [ ] **AC-4.3**: `pnpm test` が全パッケージで成功すること
- [ ] **AC-4.4**: SkillExecutor の公開 API が変更されていないこと
  - `execute(request, skill)` のシグネチャ維持
  - `abort(executionId)` のシグネチャ維持
  - `getActiveExecutions()` のシグネチャ維持
  - `getExecutionStatus(executionId)` のシグネチャ維持
- [ ] **AC-4.5**: IPC 通信が正常に動作すること

### 検証コマンド

```bash
# 全パッケージの型チェック
pnpm typecheck

# 全パッケージの Lint
pnpm lint

# 全パッケージのテスト
pnpm test
```

---

## 検証チェックリスト（最終確認用）

### 必須項目

| #   | 項目                                | 結果 |
| --- | ----------------------------------- | ---- |
| 1   | AC-1: 完全一致型5つが削除されている | [ ]  |
| 2   | AC-2: 差異型3つが統合されている     | [ ]  |
| 3   | AC-3: import 文が整理されている     | [ ]  |
| 4   | AC-4: 全体整合性が確認されている    | [ ]  |

### 品質ゲート

| 項目                  | 基準   | 結果 |
| --------------------- | ------ | ---- |
| TypeScript 型チェック | PASS   | [ ]  |
| ESLint                | PASS   | [ ]  |
| ユニットテスト        | PASS   | [ ]  |
| カバレッジ（Line）    | >= 80% | [ ]  |

---

## 完了判定

全ての AC 項目が「合格」となった場合、Phase 5（実装）完了と判定する。
