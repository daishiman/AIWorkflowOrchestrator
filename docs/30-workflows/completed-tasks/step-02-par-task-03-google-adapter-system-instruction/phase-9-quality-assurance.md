# Phase 9: 品質保証 - GoogleAdapter system_instruction 対応

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 9                                 |
| 機能名   | google-adapter-system-instruction |
| 作成日   | 2026-03-23                        |
| タスクID | TASK-LLM-MOD-03                   |
| 依存     | phase-8-refactoring.md            |

## 目的

Lint・TypeScript 型チェック・全テスト実行を通じて、実装が品質基準を満たしていることを確認する。

## 実行タスク

### Task 9-1: ESLint チェック

```bash
pnpm --filter @repo/desktop lint
```

**期待する結果**: エラーが 0 件。警告は許容するが、未使用 import などの修正可能な警告は対処する。

**確認観点**:

- `GoogleAdapter.ts` に未使用 import がないこと
- `GoogleAdapter.test.ts` に未使用変数がないこと
- `any` 型の新規使用がないこと（`buildRequestBody` の戻り値は `Record<string, unknown>` のため OK）

### Task 9-2: TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

**期待する結果**: コンパイルエラーが 0 件。

**確認観点**:

- `buildRequestBody` の戻り値型 `Record<string, unknown>` が `JSON.stringify` に渡せること
- `system_instruction` プロパティへの代入が型エラーなしで動作すること（`Record<string, unknown>` へのプロパティ追加は型安全）
- `formatContents` の戻り値型が推論されており、`contents` フィールドへの代入に型エラーがないこと

### Task 9-3: GoogleAdapter テスト単体実行

```bash
cd apps/desktop && pnpm vitest run src/main/adapters/llm/__tests__/GoogleAdapter.test.ts
```

**期待する結果**:

- 全テストが PASS
- 失敗テストが 0 件
- 追加した 5 テスト（ADP-012-SI-01、ADP-012-SI-02、ADP-012-SI-03、ADP-STREAM-SI-01、T6-01〜T6-03）が全て PASS

### Task 9-4: Adapter 全テスト実行

変更による他の Adapter テストへの波及影響がないことを確認する。

```bash
cd apps/desktop && pnpm vitest run src/main/adapters/llm/__tests__/
```

**期待する結果**: 全テストが PASS。

### Task 9-5: 品質チェックサマリー

| チェック項目         | コマンド                                | 結果（Phase 9 実行時に記入） |
| -------------------- | --------------------------------------- | ---------------------------- |
| ESLint               | `pnpm --filter @repo/desktop lint`      | \_\_\_                       |
| TypeScript           | `pnpm --filter @repo/desktop typecheck` | \_\_\_                       |
| GoogleAdapter テスト | `vitest run GoogleAdapter.test.ts`      | \_\_\_                       |
| Adapter 全テスト     | `vitest run adapters/llm/__tests__/`    | \_\_\_                       |

全チェックが PASS の場合のみ Phase 10 に進む。

## 参照資料

| 資料名           | パス                                                                 | 内容             |
| ---------------- | -------------------------------------------------------------------- | ---------------- |
| コード品質ルール | `.claude/rules/02-code-quality.md`                                   | Lint・型安全基準 |
| 実装済みコード   | `apps/desktop/src/main/adapters/llm/GoogleAdapter.ts`                | チェック対象     |
| テストファイル   | `apps/desktop/src/main/adapters/llm/__tests__/GoogleAdapter.test.ts` | チェック対象     |

## 統合テスト連携

本 Phase で全チェックが PASS した場合のみ Phase 10（最終レビュー）に進む。いずれかが失敗した場合は該当 Phase（実装: Phase 5、テスト: Phase 4/6）に戻る。

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計            | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |
| エラーハンドリング | 例外処理が必要な場合               | `aiworkflow-requirements: error-handling.md` |
| パフォーマンス     | 性能要件がある場合                 | `aiworkflow-requirements: architecture-*.md` |

## 成果物

| 成果物       | パス                                                             | 説明         |
| ------------ | ---------------------------------------------------------------- | ------------ |
| 品質確認記録 | `phase-9-quality-assurance.md`（本ファイル）の Task 9-5 テーブル | チェック結果 |

## 完了条件

- [ ] `pnpm lint` がエラー 0 件で PASS している
- [ ] `pnpm typecheck` がエラー 0 件で PASS している
- [ ] `GoogleAdapter.test.ts` の全テストが PASS している
- [ ] Adapter 全テストが PASS している
- [ ] Task 9-5 のサマリーテーブルに結果が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

### IPC契約ドリフト検証【Phase 9 品質ゲート】

本タスク（GoogleAdapter system_instruction 対応）はIPCハンドラーを変更しないため、IPC契約ドリフト検証は N/A とする。

- [x] IPC変更なしのため検証スキップ（理由: GoogleAdapter は Main Process 内部のアダプターであり、IPC層の変更を伴わない）

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 10: 最終レビュー
