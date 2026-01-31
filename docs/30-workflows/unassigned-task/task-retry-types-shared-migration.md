# リトライ型定義のshared package移行 - タスク指示書

## メタ情報

```yaml
issue_number: 614
```

## メタ情報

| 項目         | 内容                                               |
| ------------ | -------------------------------------------------- |
| タスクID     | -                                                  |
| タスク名     | リトライ型定義のshared package移行                 |
| 分類         | リファクタリング                                   |
| 対象機能     | SkillExecutor リトライ型定義                       |
| 優先度       | 低                                                 |
| 見積もり規模 | 小規模                                             |
| ステータス   | 未実施                                             |
| 発見元       | TASK-SKILL-RETRY-001 Phase 5（テスト結果レポート） |
| 発見日       | 2026-01-31                                         |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SKILL-RETRY-001にてSkillExecutorにExponential Backoff with Jitterリトライ機構を実装した。リトライ関連の型定義（`RetryConfig`、`RetryableErrorType`、`RetryableErrorResult`）は現在`apps/desktop/src/main/services/skill/SkillExecutor.ts`内にローカル定義されている。Phase 5テスト結果レポートにて「将来的にリトライ型を`packages/shared`に移行する場合は、SkillExecutor.tsのローカル定義を削除し、shared型をインポートする」と記録されている。

### 1.2 問題点・課題

- リトライ型定義が`apps/desktop`内にローカル定義されており、他パッケージ（web等）から再利用できない
- `packages/shared/src/types/skill-execution.ts`に既存のスキル実行型（`SkillStreamMessageType`等）があるが、リトライ関連型は含まれていない
- Renderer側でリトライイベントを型安全に扱う際、型定義の二重管理が発生するリスクがある
- モノレポの型共有原則（`packages/shared`に共通型を集約）に反している

### 1.3 放置した場合の影響

- 将来`apps/web`や他パッケージでリトライ機能を利用する際、型定義のコピーが発生する
- `task-use-skill-execution-retry-events`（Renderer側リトライイベント表示）実装時に型の不整合が発生する可能性がある
- 型定義の分散によりメンテナンスコストが増加する

---

## 2. 何を達成するか（What）

### 2.1 目的

リトライ関連型定義を`packages/shared`に移行し、モノレポ全体で型安全にリトライ機能を利用可能にする。

### 2.2 最終ゴール

- `RetryConfig`、`RetryableErrorType`、`RetryableErrorResult`が`packages/shared/src/types/`からエクスポートされている
- `SkillExecutor.ts`がローカル型定義を削除し、`@repo/shared`からインポートしている
- 既存の72テストが全てPASSする
- TypeScript strictモードでエラーなし

### 2.3 スコープ

#### 含むもの

- `RetryConfig`型の`packages/shared`への移行
- `RetryableErrorType`型の移行
- `RetryableErrorResult`型の移行
- `DEFAULT_RETRY_CONFIG`定数の移行
- `RETRYABLE_NETWORK_ERRORS`定数の移行
- `SkillExecutor.ts`のインポート変更
- テストファイルのインポート変更

#### 含まないもの

- リトライロジック（`isRetryableError`、`calculateBackoffDelay`、`executeWithRetry`）の移行
- 新規型の追加
- リトライ機能の動作変更

### 2.4 成果物

| 成果物                       | 説明                                         |
| ---------------------------- | -------------------------------------------- |
| `skill-retry.ts`（新規）     | `packages/shared/src/types/`にリトライ型定義 |
| `skill-execution.ts`（更新） | リトライ型のre-export追加                    |
| `SkillExecutor.ts`（更新）   | ローカル型削除、sharedインポート             |
| テストファイル（更新）       | インポートパス変更                           |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-SKILL-RETRY-001が完了していること
- `packages/shared`のビルドが正常に通ること
- 72件のリトライテストがPASSしていること

### 3.2 依存タスク

- TASK-SKILL-RETRY-001（完了済み）

### 3.3 必要な知識

- TypeScript型定義とエクスポート
- pnpmモノレポのパッケージ間依存関係
- `@repo/shared`パッケージの型定義構成

### 3.4 推奨アプローチ

1. `packages/shared/src/types/skill-retry.ts`に型・定数を新規作成
2. `packages/shared/src/types/index.ts`にre-exportを追加
3. `SkillExecutor.ts`のローカル定義を削除し`@repo/shared`からインポート
4. テストファイルのインポートパスを更新
5. 全テスト実行で回帰なしを確認

---

## 4. 実行手順

### Phase構成

Phase 1〜3の小規模リファクタリング構成。

### Phase 1: 型定義ファイル作成

#### 目的

`packages/shared`にリトライ型定義ファイルを作成する。

#### 手順

1. `packages/shared/src/types/skill-retry.ts`を新規作成
2. `RetryableErrorType`型リテラルユニオンを定義（`'network' | 'rate_limit' | 'server_error' | 'timeout'`）
3. `RetryConfig`インターフェースを定義（5プロパティ）
4. `RetryableErrorResult`インターフェースを定義（3プロパティ）
5. `DEFAULT_RETRY_CONFIG`定数を定義
6. `RETRYABLE_NETWORK_ERRORS`定数を定義
7. `packages/shared/src/types/index.ts`にre-exportを追加
8. `pnpm --filter @repo/shared build`でビルド確認

#### 成果物

- `packages/shared/src/types/skill-retry.ts`

#### 完了条件

- `@repo/shared`からリトライ型がインポート可能
- ビルドエラーなし

### Phase 2: インポート切り替え

#### 目的

`SkillExecutor.ts`とテストファイルのインポート元を切り替える。

#### 手順

1. `SkillExecutor.ts`からローカルの型・定数定義を削除
2. `@repo/shared`からのインポート文を追加
3. `SkillExecutor.retry.test.ts`のインポートパスを更新
4. TypeScript型チェック実行（`pnpm --filter @repo/desktop typecheck`）

#### 成果物

- 更新された`SkillExecutor.ts`
- 更新されたテストファイル

#### 完了条件

- TypeScript strictモードでエラーなし
- ESLint PASS

### Phase 3: 回帰テスト・検証

#### 目的

全テストが回帰なくPASSすることを確認する。

#### 手順

1. リトライテスト72件を実行
2. デスクトップアプリ全体テストを実行
3. sharedパッケージのテストを実行

#### 成果物

- テスト結果レポート

#### 完了条件

- 72件のリトライテスト全PASS
- デスクトップアプリ全体テストPASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `RetryConfig`型が`@repo/shared`からエクスポートされている
- [ ] `RetryableErrorType`型が`@repo/shared`からエクスポートされている
- [ ] `RetryableErrorResult`型が`@repo/shared`からエクスポートされている
- [ ] `DEFAULT_RETRY_CONFIG`定数が`@repo/shared`からエクスポートされている
- [ ] `RETRYABLE_NETWORK_ERRORS`定数が`@repo/shared`からエクスポートされている
- [ ] `SkillExecutor.ts`がローカル型定義を含まない

### 品質要件

- [ ] TypeScript strictモードでエラーなし
- [ ] ESLint PASS
- [ ] Prettier PASS
- [ ] 72件のリトライテスト全PASS
- [ ] デスクトップアプリ全テストPASS

### ドキュメント要件

- [ ] `interfaces-agent-sdk-executor.md`の型定義セクションにファイルパス更新
- [ ] 変更履歴の追記

---

## 6. 検証方法

### テストケース

| テストケース     | 検証内容                                       |
| ---------------- | ---------------------------------------------- |
| 型インポート確認 | `@repo/shared`から全リトライ型がインポート可能 |
| 既存テスト回帰   | 72件のリトライテストが全PASS                   |
| ビルド確認       | `@repo/shared`と`@repo/desktop`のビルド成功    |
| 型チェック       | `pnpm typecheck`がエラーなし                   |

### 検証手順

1. `pnpm --filter @repo/shared build` でビルド成功を確認
2. `pnpm --filter @repo/desktop typecheck` で型チェックPASS
3. リトライテスト72件を実行し全PASS確認
4. `pnpm --filter @repo/desktop test` で全テストPASS確認

---

## 7. リスクと対策

| リスク                                 | 影響度 | 発生確率 | 対策                                     |
| -------------------------------------- | ------ | -------- | ---------------------------------------- |
| `@repo/shared`ビルド順序の依存関係問題 | 中     | 低       | pnpmワークスペースの依存関係設定を確認   |
| 型のre-exportでの名前衝突              | 低     | 低       | 既存エクスポート名との重複を事前確認     |
| テストのインポートパス変更漏れ         | 中     | 低       | Grepで全インポート箇所を検出してから変更 |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                 | パス                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------ |
| Executor仕様（型定義）       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md` |
| リトライパターンリファレンス | `.claude/skills/claude-agent-sdk/references/retry-patterns.md`                       |
| Phase 5テスト結果            | `docs/30-workflows/skillexecutor-retry-mechanism/outputs/phase-5/test-results.md`    |
| 既存型定義                   | `packages/shared/src/types/skill-execution.ts`                                       |

### 参考資料

- モノレポ型共有パターン: `packages/shared/src/types/`の既存構成を参考にする

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
Phase 5テスト結果レポート:
1. **型のshared移行**: 将来的にリトライ型を `packages/shared` に移行する場合は、
SkillExecutor.tsのローカル定義を削除し、shared型をインポートする
```

### 補足事項

- `task-use-skill-execution-retry-events`（Renderer側リトライイベント表示）の前提タスクとなる可能性がある。Renderer側でリトライ型を使用する際、shared packageからのインポートが必要になるため。
- 定数の移行先は型定義ファイルと同じ`skill-retry.ts`に含めるか、`skill-constants.ts`に分離するかはPhase 1で判断する。
