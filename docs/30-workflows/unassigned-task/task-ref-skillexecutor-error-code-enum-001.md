# SkillExecutor エラーコード Enum 正式化 - タスク指示書

## メタ情報

```yaml
issue_number: 654
```

## メタ情報

| 項目         | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| タスクID     | task-ref-skillexecutor-error-code-enum-001               |
| タスク名     | SkillExecutor エラーコード Enum 正式化                   |
| 分類         | リファクタリング                                         |
| 対象機能     | SkillExecutor エラーハンドリング                         |
| 優先度       | 低                                                       |
| 見積もり規模 | 小規模                                                   |
| ステータス   | 未実施                                                   |
| 発見元       | TASK-8A Phase 12 システム仕様書更新（error-handling.md） |
| 発見日       | 2026-02-02                                               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-8Aの単体テスト実装とPhase 12のシステム仕様書更新において、SkillExecutorが使用する6種のエラーコードをerror-handling.mdに正式ドキュメント化した。しかし、実際のコードベースではこれらのエラーコードが文字列リテラル（`'EXECUTION_FAILED'`等）として散在しており、TypeScriptの型安全性が活用されていない。

### 1.2 問題点・課題

- エラーコードが文字列リテラルで定義されており、typoや不一致が発生するリスクがある
- テストコード（SkillExecutor.test.ts）と実装コード（SkillExecutor.ts）で同じ文字列を重複定義している
- error-handling.md仕様書に記載した6種エラーコードと実装コードの対応関係が暗黙的
- IDE補完やリファクタリング支援が効かない

### 1.3 放置した場合の影響

- 新規エラーコード追加時に仕様書・実装・テストの3箇所で同期が必要になり、漏れやすい
- エラーハンドリングの一貫性が担保されず、Renderer側での分岐処理が不安定になる可能性

---

## 2. 何を達成するか（What）

### 2.1 目的

SkillExecutorの6種エラーコードをTypeScript enumとして一元定義し、実装コード・テストコード・型定義を統一する。

### 2.2 最終ゴール

- `SkillExecutionErrorCode` enumが `packages/shared/src` または `apps/desktop/src/main/services/skill/` に定義されている
- SkillExecutor.ts, SkillExecutor.test.ts が文字列リテラルではなくenumを参照している
- error-handling.md仕様書のエラーコード表とenumの値が1:1対応している

### 2.3 スコープ

#### 含むもの

- SkillExecutionErrorCode enum作成（6値: EXECUTION_FAILED, MAX_CONCURRENT_EXCEEDED, INVALID_SKILL_METADATA, PERMISSION_DENIED, TIMEOUT, ABORT）
- SkillExecutor.ts内の文字列リテラル → enum参照への置換
- SkillExecutor.test.ts内の文字列リテラル → enum参照への置換
- SkillExecutionError型定義のcode属性をenum型に変更

#### 含まないもの

- リトライ関連エラーコード（RetryableErrorType）の変更（TASK-SKILL-RETRY-001で別途定義済み）
- Renderer側のエラーハンドリングロジック変更
- 新規エラーコードの追加

### 2.4 成果物

| 成果物                       | 説明                            |
| ---------------------------- | ------------------------------- |
| SkillExecutionErrorCode enum | 6種エラーコードのTypeScript定義 |
| SkillExecutor.ts更新         | enum参照への移行                |
| SkillExecutor.test.ts更新    | enum参照への移行                |
| SkillExecutionError型更新    | code属性をenum型に変更          |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-8A完了済み（SkillExecutor単体テスト231テスト全PASS）
- error-handling.md v1.3.0にエラーコード6種の仕様が記載済み

### 3.2 依存タスク

- TASK-8A（完了済み）

### 3.3 必要な知識

- TypeScript enum定義パターン
- SkillExecutor内部のエラーハンドリングフロー（error-handling.md セクション「SkillExecutor 実行エラーコード」参照）

### 3.4 推奨アプローチ

1. `SkillExecutionErrorCode` enumを `apps/desktop/src/main/services/skill/types.ts` または隣接する適切なファイルに定義
2. `SkillExecutionError` インターフェースの `code` プロパティ型を `string` から `SkillExecutionErrorCode` に変更
3. SkillExecutor.ts内の全文字列リテラルをenum参照に置換
4. テストファイルも同様にenum参照に移行
5. 既存231テストが全PASS維持を確認

---

## 4. 実行手順

### Phase構成

小規模リファクタリングのため、Phase 4（テスト作成）→ Phase 5（実装）→ Phase 9（品質保証）の最小構成を推奨。

### Phase 4: テスト作成（Red）

#### 目的

既存テストのenum移行後もPASSすることを確認するテスト基盤を準備。

#### 手順

1. SkillExecutionErrorCode enumの型テストを追加（全6値の存在確認）
2. 既存231テストのスナップショットを取得

#### 成果物

型テスト追加

#### 完了条件

enum型テストがRed状態（enum未定義のため）

### Phase 5: 実装（Green）

#### 目的

enum定義と既存コードの移行。

#### 手順

1. `SkillExecutionErrorCode` enum定義ファイル作成
2. `SkillExecutionError` 型の `code` プロパティ型変更
3. SkillExecutor.ts の文字列リテラル → enum置換
4. テストファイルの文字列リテラル → enum置換
5. 全231テストPASS確認

#### 成果物

enum定義、コード移行完了

#### 完了条件

全テストPASS、型チェックエラーなし

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] SkillExecutionErrorCode enumが6値で定義されている
- [ ] SkillExecutor.tsが文字列リテラルではなくenumを使用している
- [ ] SkillExecutionError.codeがenum型である

### 品質要件

- [ ] 既存231テストが全PASS
- [ ] TypeScript型チェックエラーなし
- [ ] ESLintエラーなし
- [ ] カバレッジが低下していない

### ドキュメント要件

- [ ] error-handling.mdのエラーコード表にenum参照パスを追記

---

## 6. 検証方法

### テストケース

| テスト                          | 期待結果              |
| ------------------------------- | --------------------- |
| SkillExecutionErrorCode全値確認 | 6値がenumに含まれる   |
| SkillExecutor既存テスト         | 231テスト全PASS       |
| 型チェック                      | `pnpm typecheck` PASS |

### 検証手順

1. `pnpm --filter @repo/desktop test` で全テストPASS確認
2. `pnpm typecheck` で型エラーなし確認
3. `pnpm lint` でLintエラーなし確認

---

## 7. リスクと対策

| リスク                             | 影響度 | 発生確率 | 対策                              |
| ---------------------------------- | ------ | -------- | --------------------------------- |
| enum変更によるRenderer側の型不一致 | 中     | 低       | IPC境界でのstring変換を維持       |
| RetryableErrorTypeとの混同         | 低     | 低       | 別enum/別ファイルとして明確に分離 |

---

## 8. 参照情報

### 関連ドキュメント

- error-handling.md v1.3.0: SkillExecutor実行エラーコード仕様
- interfaces-agent-sdk-executor.md: SkillExecutionError型定義
- TASK-8A Phase 12 outputs: テストカバレッジ実績

### 参考資料

- TypeScript Handbook: Enum定義パターン

---

## 9. 備考

### 発見経緯

TASK-8A Phase 12でerror-handling.mdにエラーコード6種を正式ドキュメント化した際、コードベースでは文字列リテラルとして使用されていることが判明。仕様書と実装の一貫性を保つため、enum化を推奨。

### 補足事項

- RetryableErrorType enum（TASK-SKILL-RETRY-001で定義済み）とは別の概念。RetryableErrorTypeはリトライ判定用、SkillExecutionErrorCodeは実行結果のエラー分類用。
- 小規模変更のためPhase 1-3（要件/設計/レビュー）はスキップ可能。
