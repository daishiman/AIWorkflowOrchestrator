# Phase 9: 品質検証

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| Phase    | 9                                     |
| タスクID | UT-SC-02-002                          |
| 機能名   | UT-SC-02-002-execute-terminal-handoff |
| 作成日   | 2026-03-23                            |

## 目的

Lint・型チェック・テスト実行・静的解析の全工程を通じて、実装品質を定量的に確認する。`void decision` 残留や `RuntimeSkillCreatorExecuteResponse` の export 漏れ等の具体的なリグレッションポイントを個別に検証する。

## 実行タスク

1. ESLint による静的解析
2. TypeScript 型チェック
3. 対象テストファイルの全実行
4. `void decision` 残留確認（grep）
5. `RuntimeSkillCreatorExecuteResponse` export 確認（grep）
6. 結果の記録と判定

## 参照資料

- Phase 8 成果物: `docs/30-workflows/UT-SC-02-002-execute-terminal-handoff/phase-08-refactoring.md`
- 修正対象ファイル:
  - `packages/shared/src/types/skillCreator.ts`
  - `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
  - `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`
- プロジェクト規則: `.claude/rules/02-code-quality.md`（カバレッジ基準）
- 既知の落とし穴: `.claude/rules/06-known-pitfalls.md#P40`（テスト実行ディレクトリ依存）

## 実行手順

### Step 1: ESLint

プロジェクトルートから実行する。

```bash
pnpm lint
```

合否基準:

- エラー 0 件であること
- 警告は内容を確認し、意図的でないものは修正する

修正が発生した場合は Phase 8 に戻り、修正内容をリファクタリングとして記録する。

### Step 2: TypeScript 型チェック

```bash
pnpm typecheck
```

合否基準:

- 型エラー 0 件であること
- `RuntimeSkillCreatorExecuteResponse` の型定義が正しく解決されること
- `terminal_handoff` 分岐の型ナロイングが正しく機能していること

`@ts-ignore` / `@ts-expect-error` を新たに追加した場合は、理由コメントが付いていることを確認する（`.claude/rules/02-code-quality.md` 準拠）。

### Step 3: テスト全実行

P40（テスト実行ディレクトリ依存）に注意し、`apps/desktop/` ディレクトリから実行する。

```bash
cd apps/desktop && pnpm vitest run \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts
```

合否基準:

- 全テストケースが PASS すること
- SKIP されているテストがある場合、意図的な `.skip` であることを確認する
- カバレッジ基準（`.claude/rules/02-code-quality.md` 参照）:
  - Line Coverage: 80% 以上（推奨 90%）
  - Branch Coverage: 60% 以上（推奨 70%）
  - Function Coverage: 80% 以上（推奨 90%）

カバレッジを取得する場合は以下を使用する:

```bash
cd apps/desktop && pnpm vitest run \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts \
  --coverage
```

### Step 4: `void decision` 残留確認

Phase 5 実装時に誤って残留した `void decision` パターンがないことを確認する。

```bash
grep -rn "void decision\|void result\|void response" \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts \
  packages/shared/src/types/skillCreator.ts
```

合否基準: **0 件**であること。

1件以上検出された場合は即座に修正し、Step 1〜3 を再実行する。

### Step 5: `RuntimeSkillCreatorExecuteResponse` export 確認

Phase 5 で追加した型が正しく export されていることを確認する。

```bash
grep -n "export.*RuntimeSkillCreatorExecuteResponse" \
  packages/shared/src/types/skillCreator.ts
```

合否基準: **1 件以上**ヒットすること（`export type` または `export interface` / `export` の一部として定義されている）。

0 件の場合は `skillCreator.ts` を確認し、`export` キーワードを追加する。

### Step 6: 関連ファイルへの影響確認

`RuntimeSkillCreatorExecuteResponse` を利用している可能性のあるファイルが、新しい型定義と整合しているかを確認する。

```bash
grep -rn "RuntimeSkillCreatorExecuteResponse" \
  apps/desktop/src/ \
  packages/shared/src/
```

各ヒット箇所で、型の使用方法が Phase 5 の実装意図と一致しているかを確認する。

### Step 7: 結果サマリーの記録

以下のテーブルに各チェックの結果を記録する（実行時に埋める）。

| チェック項目                                | 結果 | 備考 |
| ------------------------------------------- | ---- | ---- |
| ESLint エラー件数                           |      |      |
| TypeScript 型エラー件数                     |      |      |
| テスト PASS 件数 / 全件数                   |      |      |
| テスト SKIP 件数                            |      |      |
| Line Coverage                               |      |      |
| Branch Coverage                             |      |      |
| Function Coverage                           |      |      |
| `void decision` 残留件数                    |      |      |
| `RuntimeSkillCreatorExecuteResponse` export |      |      |

## 多角的チェック観点

| 観点               | 適用判断                          | 確認内容                                         |
| ------------------ | --------------------------------- | ------------------------------------------------ |
| セキュリティ       | terminal_handoff でのセキュリティ | SkillExecutor 非呼び出しの保証                   |
| アーキテクチャ     | 3メソッドのパターン統一           | plan/improve/execute の分岐パターンの一貫性      |
| エラーハンドリング | Optional chaining の安全性        | `response.error?.message` 等の null 安全パターン |

## 統合テスト連携

本フェーズのテスト実行は対象ファイル限定だが、Phase 10 最終レビューでは `RuntimeSkillCreatorFacade` に依存する上流モジュールのテストも確認対象になりうる。

必要に応じて以下も実行して影響範囲を確認する:

```bash
cd apps/desktop && pnpm vitest run \
  src/main/services/runtime/__tests__/
```

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## 成果物

| 成果物               | パス                         | 説明                                                 |
| -------------------- | ---------------------------- | ---------------------------------------------------- |
| 結果サマリーテーブル | 本ドキュメント Step 7        | ESLint/TypeCheck/テスト/grep の全チェック結果        |
| 修正内容メモ         | 本ドキュメント Step 7 備考欄 | 修正が発生した場合の修正内容（修正なしの場合は不要） |

## 完了条件

- [ ] ESLint エラー 0 件
- [ ] TypeScript 型エラー 0 件
- [ ] 対象テストファイルの全テストが PASS
- [ ] `void decision` 残留が 0 件（grep 確認済み）
- [ ] `RuntimeSkillCreatorExecuteResponse` の export が grep で確認済み
- [ ] 結果サマリーテーブルに全チェック結果が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次の Phase

Phase 10: 最終レビュー (`phase-10-final-review.md`)
