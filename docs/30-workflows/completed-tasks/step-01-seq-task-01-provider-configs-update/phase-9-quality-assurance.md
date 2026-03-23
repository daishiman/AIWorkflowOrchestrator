# Phase 9: 品質保証 — PROVIDER_CONFIGS モデル定義 + inferProviderId 更新

## メタ情報

| 項目       | 値                          |
| ---------- | --------------------------- |
| Phase番号  | 9                           |
| 機能名     | provider-configs-update     |
| タスクID   | TASK-LLM-MOD-01             |
| 作成日     | 2026-03-23                  |
| 依存 Phase | Phase 8（リファクタリング） |

## 目的

Lint・TypeScript 型チェック・関連テスト全実行を実施し、Phase 10 最終レビューへの進行に必要な品質基準を全て満たすことを確認する。

## 実行タスク

### Task 9-1: ESLint チェック

```bash
cd apps/desktop && pnpm lint src/main/handlers/llm.ts
```

期待する結果: エラー 0 件、警告 0 件

エラーが発生した場合: エラーの内容を確認し、自動修正可能な場合は `pnpm lint --fix` を実行する。自動修正不可の場合は手動で修正する。

### Task 9-2: TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

期待する結果: エラー 0 件

型エラーが発生した場合の確認ポイント:

- `description?: string` の追加による型不整合がないか
- `PROVIDER_CONFIGS` を参照する他のコード（`handleGetProviders` 等）に影響がないか

### Task 9-3: ハンドラーテスト全実行

```bash
cd apps/desktop && pnpm vitest run src/main/handlers/__tests__/
```

期待する結果: 全テスト PASS（対象ファイル全て）

対象ファイル:

- `llm.test.ts`
- `llm-stream.test.ts`
- `llm-stream-integration.test.ts`
- `llm.runtime-sync.test.ts`
- `llm-stream-runtime.test.ts`

### Task 9-4: shared パッケージのビルド確認

`PROVIDER_CONFIGS` は shared パッケージの型（`LLMProviderId` 等）を使用している。shared パッケージのビルドが通ることを確認する：

```bash
pnpm --filter @repo/shared build
```

期待する結果: エラー 0 件でビルド完了

### Task 9-5: 品質チェック結果の記録

| チェック項目            | コマンド                                       | 結果      |
| ----------------------- | ---------------------------------------------- | --------- |
| ESLint                  | `pnpm lint src/main/handlers/llm.ts`           | PASS/FAIL |
| TypeScript 型チェック   | `pnpm --filter @repo/desktop typecheck`        | PASS/FAIL |
| ハンドラーテスト全実行  | `pnpm vitest run src/main/handlers/__tests__/` | PASS/FAIL |
| shared パッケージビルド | `pnpm --filter @repo/shared build`             | PASS/FAIL |

全て PASS の場合のみ Phase 10 に進む。

### Task 9-6: 旧モデルID 残存確認（最終確認）

コード変更後に旧モデルIDが `llm.ts` に残存していないことを確認する：

```bash
grep -n "gpt-4o\|gpt-4-turbo\|claude-3-5-sonnet\|claude-3-opus\|claude-3-haiku\|gemini-1\.5\|grok-beta" apps/desktop/src/main/handlers/llm.ts
```

期待する結果: マッチする行が 0 件（空の出力）

マッチがある場合: Phase 5 の実装に戻り、差し替えが不完全な箇所を修正する。

## 参照資料

| 資料名                   | パス                                                                                   |
| ------------------------ | -------------------------------------------------------------------------------------- |
| Phase 8 リファクタリング | `docs/30-workflows/step-01-seq-task-01-provider-configs-update/phase-8-refactoring.md` |
| 実装ファイル             | `apps/desktop/src/main/handlers/llm.ts`                                                |
| コード品質ルール         | `.claude/rules/02-code-quality.md`                                                     |

## 成果物

| 成果物       | パス                                                                                          | 形式     |
| ------------ | --------------------------------------------------------------------------------------------- | -------- |
| 品質保証記録 | `docs/30-workflows/step-01-seq-task-01-provider-configs-update/outputs/phase-9/qa-results.md` | Markdown |

## 完了条件

- [ ] ESLint がエラー 0 件で完了した
- [ ] TypeScript 型チェックがエラー 0 件で完了した
- [ ] `llm.test.ts` を含む handlers ディレクトリの全テストが PASS した
- [ ] `@repo/shared` パッケージのビルドが成功した
- [ ] 旧モデルID（`gpt-4o`, `claude-3-5-sonnet-*` 等）が `llm.ts` に残存していないことを grep で確認した
- [ ] 品質チェック結果を outputs/phase-9/qa-results.md に記録した

## 統合テスト連携

Phase 9 では以下の範囲でテストを実行し、TASK-LLM-MOD-01 の変更が他の LLM 関連コードに影響を与えていないことを確認する：

```bash
cd apps/desktop && pnpm vitest run src/main/
```

期待する結果: 全テスト PASS

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                       | 仕様参照先                                   |
| -------------- | ------------------------------ | -------------------------------------------- |
| アーキテクチャ | Main Process のデータ定義変更  | `aiworkflow-requirements: architecture-*.md` |
| API設計        | IPC レスポンス形式への影響確認 | `aiworkflow-requirements: api-*.md`          |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次の Phase

Phase 10: 最終レビュー（`phase-10-final-review.md`）
