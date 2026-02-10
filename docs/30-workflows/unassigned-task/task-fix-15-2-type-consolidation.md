# SkillExecutionRequest/Response型のsharedパッケージ移動 - タスク指示書

## メタ情報

```yaml
issue_number: 766
```

## メタ情報

| 項目         | 内容                                         |
| ------------ | -------------------------------------------- |
| タスクID     | TASK-FIX-15-2-TYPE-CONSOLIDATION             |
| タスク名     | SkillExecutionRequest/Response型のshared移動 |
| 分類         | リファクタリング                             |
| 対象機能     | スキル実行型定義                             |
| 優先度       | 低                                           |
| 見積もり規模 | 小規模                                       |
| ステータス   | 未実施                                       |
| 発見元       | TASK-FIX-15-1 Phase 3 設計レビュー M-02      |
| 発見日       | 2026-02-09                                   |
| 関連Phase    | Phase 0（技術的負債解消）                    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-15-1（SKILL_EXECUTEハンドラーのSkillExecutor委譲）の設計レビューにおいて、`SkillExecutionRequest` と `SkillExecutionResponse` 型が `SkillExecutor.ts` にローカル定義されていることが指摘された。

### 1.2 問題点・課題

| 問題                               | 影響                                 |
| ---------------------------------- | ------------------------------------ |
| 型がSkillExecutor.tsにローカル定義 | 他モジュールからの参照が困難         |
| skillHandlers.tsでも同じ型が必要   | 型の重複定義リスク                   |
| shared パッケージに型がない        | モノレポ構造のベストプラクティス違反 |

### 1.3 放置した場合の影響

- 型の重複定義による不整合リスク
- 型変更時に複数ファイルの更新が必要
- shared パッケージの型一元管理原則からの逸脱

---

## 2. 何を達成するか（What）

### 2.1 目的

SkillExecutionRequest/Response型を `packages/shared/src/types/skill.ts` に移動し、型の一元管理を実現する。

### 2.2 最終ゴール

1. `SkillExecutionRequest` が `packages/shared/src/types/skill.ts` に定義されている
2. `SkillExecutionResponse` が `packages/shared/src/types/skill.ts` に定義されている
3. SkillExecutor.ts が shared の型を import している
4. skillHandlers.ts が shared の型を import している

### 2.3 スコープ

#### 含むもの

- SkillExecutionRequest 型定義の shared への移動
- SkillExecutionResponse 型定義の shared への移動
- 関連ファイルの import 修正
- 既存テストの import 修正

#### 含まないもの

- 型構造自体の変更
- 他の skill 関連型の移動（別タスク）
- 型のバリデーションロジック追加

### 2.4 成果物

| 成果物                                  | 説明           |
| --------------------------------------- | -------------- |
| packages/shared/src/types/skill.ts 更新 | 新規型定義追加 |
| SkillExecutor.ts 修正                   | import 変更    |
| skillHandlers.ts 修正                   | import 変更    |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-FIX-15-1 完了済み

### 3.2 依存タスク

| タスクID                              | ステータス | 依存理由                           |
| ------------------------------------- | ---------- | ---------------------------------- |
| TASK-FIX-15-1-EXECUTE-HANDLER-ROUTING | 完了済み   | 型の使用箇所が確定している必要あり |

### 3.3 実装課題と解決策（TASK-FIX-15-1からの学び）

TASK-FIX-15-1 の実装で苦戦した4箇所を記録。本タスクの実装時に同様の課題を回避するための参考情報。

#### 課題1: 型変換パターン（Skill → SkillMetadata）

| 項目   | 内容                                                                                                             |
| ------ | ---------------------------------------------------------------------------------------------------------------- |
| 問題   | `Skill` 型と `SkillMetadata` 型が複数層で参照され、層間での型変換が複雑化                                        |
| 原因   | 型定義の場所が一元化されておらず、SkillExecutor.tsにローカル定義                                                 |
| 教訓   | **複数層で参照される型は必ず `packages/shared` に定義すべき**                                                    |
| 解決策 | `Omit<Skill, 'importedAt'>` パターンで型変換を明示的に行う                                                       |
| 関連   | [patterns.md#型変換パターン Skill→SkillMetadata](/.claude/skills/aiworkflow-requirements/references/patterns.md) |

```typescript
// 型変換パターン例
const skillMetadata: SkillMetadata = {
  ...skill,
  // importedAt を除外（Omit<Skill, 'importedAt'>）
};
```

#### 課題2: 統合テストでの依存サービスモック漏れ（P25）

| 項目   | 内容                                                                                                      |
| ------ | --------------------------------------------------------------------------------------------------------- |
| 問題   | 単体テストでモック化したサービスが、統合テストでモック漏れ                                                |
| 原因   | SkillExecutor の依存先変更時、skillIpc.integration.test.ts へのモック追加を忘れた                         |
| 教訓   | **IPC ハンドラーの依存サービス変更時、単体テストと統合テスト両方にモック追加が必須**                      |
| 解決策 | 1. 単体テストのモック定義を統合テストにもコピー<br/>2. `vi.mock()` + `beforeEach` で `vi.clearAllMocks()` |
| 関連   | [06-known-pitfalls.md#P25](/.claude/rules/06-known-pitfalls.md)                                           |

#### 課題3: 入力バリデーション不統一（P26）

| 項目   | 内容                                                                                        |
| ------ | ------------------------------------------------------------------------------------------- |
| 問題   | `prompt` は `.trim()` でwhitespaceチェック、`skillId` は空文字チェックのみ                  |
| 原因   | バリデーションルールが不統一で、whitespaceのみの入力が通過する                              |
| 教訓   | **全入力フィールドに統一したバリデーションルール（型 + `.trim()` + 空文字チェック）を適用** |
| 解決策 | 本タスクで追加する型に `@description` JSDoc で必須バリデーションを明記                      |
| 関連   | [06-known-pitfalls.md#P26](/.claude/rules/06-known-pitfalls.md)                             |

#### 課題4: import パス変更時のテスト修正漏れ

| 項目   | 内容                                                                                         |
| ------ | -------------------------------------------------------------------------------------------- |
| 問題   | 型を shared に移動した後、テストファイルの import パスを修正し忘れる                         |
| 原因   | テストファイルが複数（5ファイル: test, auth, retry, integration, permission）に分散          |
| 教訓   | **`grep -rn` で型名を全体検索し、import 漏れを事前に検出**                                   |
| 解決策 | 移動前に `grep -rn "SkillExecutionRequest\|SkillExecutionResponse" apps/` で全参照箇所を列挙 |

#### 本タスクへの適用

| 課題  | 本タスクでの対策                                       |
| ----- | ------------------------------------------------------ |
| 課題1 | 型を shared に移動することで、この課題を根本解決       |
| 課題2 | テスト修正時に単体・統合両方を確認（Phase 4-5 で明示） |
| 課題3 | 型定義に JSDoc で必須バリデーションを明記              |
| 課題4 | Phase 1 で全参照箇所を事前列挙（grep コマンド実行）    |

### 3.4 必要な知識

- TypeScript モジュール
- モノレポ パッケージ参照

### 3.5 推奨アプローチ

1. packages/shared/src/types/skill.ts に型定義を追加
2. packages/shared/src/index.ts から export
3. SkillExecutor.ts の import を変更
4. skillHandlers.ts の import を変更
5. テストファイルの import を修正

---

## 4. 実行手順

### Phase構成

本タスクは Phase 1-5（テスト・実装・品質確認）で構成される。

### Phase 1: 要件定義

| 項目     | 内容                                                                                                                                                                                                                                                                                                                         |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 目的     | 型定義の移動スコープを明確化                                                                                                                                                                                                                                                                                                 |
| 手順     | 1. `grep -rn "SkillExecutionRequest\|SkillExecutionResponse" apps/ packages/` で全参照箇所を列挙<br/>2. packages/shared/src/types/skill.ts の既存型を確認<br/>3. SkillExecutor.ts 内のローカル定義型を確認<br/>4. skillHandlers.ts で使用されている型を確認<br/>5. テストファイル（5ファイル）の import パスを事前にリスト化 |
| 成果物   | 参照箇所リスト（.tmp/type-references.txt）                                                                                                                                                                                                                                                                                   |
| 完了条件 | 移動対象の型と全参照箇所が明確化された                                                                                                                                                                                                                                                                                       |

### Phase 2-3: 設計・設計レビュー

| 項目     | 内容                                                                                                  |
| -------- | ----------------------------------------------------------------------------------------------------- |
| 目的     | 型の export パスを設計                                                                                |
| 手順     | 1. shared/src/index.ts の export パターン確認<br/>2. 新規 export 行を決定<br/>3. 修正対象ファイル特定 |
| 成果物   | なし（既存ファイル確認）                                                                              |
| 完了条件 | export パターンが決定された                                                                           |

### Phase 4-5: テスト作成・実装

| 項目     | 内容                                                                                                                                                                 |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 目的     | 型移動と既存コードの修正                                                                                                                                             |
| 手順     | 1. skill.ts に型定義追加<br/>2. index.ts で export<br/>3. SkillExecutor.ts の import 変更<br/>4. skillHandlers.ts の import 変更<br/>5. テストファイルの import 修正 |
| 成果物   | 修正済みコード                                                                                                                                                       |
| 完了条件 | 全テスト PASS、型チェック通過                                                                                                                                        |

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] SkillExecutionRequest が `packages/shared/src/types/skill.ts` に定義されている
- [ ] SkillExecutionResponse が `packages/shared/src/types/skill.ts` に定義されている
- [ ] SkillExecutor.ts が shared の型を import している
- [ ] skillHandlers.ts が shared の型を import している

### 品質要件

- [ ] 全テストが PASS
- [ ] 型チェックが通る
- [ ] 既存の動作に変更なし

---

## 6. 検証方法

### テストケース

| #   | テストケース                                   | 期待結果             |
| --- | ---------------------------------------------- | -------------------- |
| 1   | SkillExecutor.ts が shared の型を正しく import | コンパイルエラーなし |
| 2   | skillHandlers.ts が shared の型を正しく import | コンパイルエラーなし |
| 3   | 既存テストが全て PASS                          | 106テスト PASS       |
| 4   | 型チェック（pnpm typecheck）が通る             | exit code 0          |

### 検証手順

1. 型移動完了後、以下コマンドを実行:
   ```bash
   pnpm typecheck
   ```
2. 関連テストを実行:
   ```bash
   pnpm --filter @repo/desktop test -- SkillExecutor
   pnpm --filter @repo/desktop test -- skillHandlers
   ```
3. 動作確認:
   - SkillExecutor のインスタンス生成が成功
   - skillHandlers が正常に登録される

---

## 7. リスクと対策

| リスク           | 影響度 | 発生確率 | 対策                                                                  |
| ---------------- | ------ | -------- | --------------------------------------------------------------------- |
| 型の参照漏れ     | 高     | 低       | `grep -rn "SkillExecutionRequest\|SkillExecutionResponse"` で全体検索 |
| テストの修正漏れ | 中     | 中       | 全テストを実行して確認                                                |
| 循環依存の発生   | 高     | 低       | shared パッケージは末端なので問題なし                                 |
| 既存動作の破壊   | 高     | 低       | 既存テストの全 PASS で確認                                            |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/task-fix-15-1-execute-handler-routing/outputs/phase-3/design-review-result.md`
- `packages/shared/src/types/skill.ts`
- `apps/desktop/src/main/services/skill/SkillExecutor.ts`

### 関連タスク

- TASK-FIX-15-1-EXECUTE-HANDLER-ROUTING（親タスク）
- TASK-FIX-1-3-SKILLEXECUTIONREQUEST-RESPONSE-UNIFICATION（関連: 型統一タスク）

---

## 9. 備考

### レビュー指摘の原文

TASK-FIX-15-1 設計レビュー（Phase 3）における M-02 指摘:

> SkillExecutionRequest/Response型が SkillExecutor.ts にローカル定義されている。
> 他モジュールからの参照が困難なため、shared パッケージに移動して一元管理すべき。

### 補足事項

- TASK-FIX-15-1 の skillHandlers.ts 実装時に同じ型定義が必要になるため、TASK-FIX-15-1 の完了を待たずに本タスクを先に実施することも検討可能
- 型移動後は、将来のスキル実行関連タスクで shared の型を参照することで一貫性が保たれる
