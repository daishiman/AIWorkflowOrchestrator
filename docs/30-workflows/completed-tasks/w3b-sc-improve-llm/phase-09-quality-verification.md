# Phase 9: 品質検証

## メタ情報

| 項目   | 値                 |
| ------ | ------------------ |
| Phase  | 9                  |
| 機能名 | w3b-sc-improve-llm |
| 作成日 | 2026-03-22         |

## 目的

Lint・TypeScript 型チェック・全テスト実行を行い、コード品質基準を満たしていることを確認する。

## 実行タスク

1. ESLint 実行
   ```bash
   pnpm --filter @repo/desktop lint
   pnpm --filter @repo/shared lint
   ```
2. TypeScript 型チェック実行
   ```bash
   pnpm --filter @repo/desktop typecheck
   pnpm --filter @repo/shared typecheck
   ```
3. 全テスト実行
   ```bash
   pnpm --filter @repo/desktop test
   pnpm --filter @repo/shared test
   ```
4. 新規ファイルの lint / typecheck 対象確認
   - `improvePromptConstants.ts` が `@repo/desktop` の lint 対象に含まれていることを確認する
   - `RuntimeSkillCreatorImproveSuggestion` 型（`packages/shared` に定義）の変更が `@repo/shared typecheck` で検出されることを確認する
   - `RuntimeSkillCreatorImproveResult.suggestions` の型変更（`string[]` → `RuntimeSkillCreatorImproveSuggestion[]`）が全利用箇所に波及していないか確認する（`grep -rn "ImproveResult" apps/ packages/`）
5. エラー・警告の修正
   - Lint エラーを全て修正する
   - TypeScript エラーを全て修正する（`any` 型、型アサーション `as` の過剰使用に注意）
   - テスト失敗を全て修正する
6. 修正後に再度全チェックを実行して PASS を確認

## 参照資料

| 種別                 | パス / 参照先                                                       |
| -------------------- | ------------------------------------------------------------------- |
| Phase 8 成果物       | Phase 8 リファクタリング済みコード                                  |
| コード品質ルール     | `.claude/rules/02-code-quality.md`（TypeScript 型安全、any 型禁止） |
| コマンドリファレンス | `CLAUDE.md`（lint, typecheck の実行方法）                           |

## 実行手順

1. ESLint を `@repo/desktop` と `@repo/shared` の両方で実行する
2. TypeScript 型チェックを `@repo/desktop` と `@repo/shared` の両方で実行する
3. 全テストを `@repo/desktop` と `@repo/shared` の両方で実行する
4. 新規ファイル（`improvePromptConstants.ts`、型定義変更）の検証対象確認を行う
5. エラー・警告があれば全て修正する
6. 修正後に再度全チェックを実行して PASS を確認する
7. 品質検証結果記録テーブルを記入する

## 品質検証結果記録

| 検証項目                  | コマンド                                | 結果 | 備考 |
| ------------------------- | --------------------------------------- | ---- | ---- |
| ESLint (@repo/desktop)    | `pnpm --filter @repo/desktop lint`      |      |      |
| ESLint (@repo/shared)     | `pnpm --filter @repo/shared lint`       |      |      |
| TypeCheck (@repo/desktop) | `pnpm --filter @repo/desktop typecheck` |      |      |
| TypeCheck (@repo/shared)  | `pnpm --filter @repo/shared typecheck`  |      |      |
| Tests (@repo/desktop)     | `pnpm --filter @repo/desktop test`      |      |      |
| Tests (@repo/shared)      | `pnpm --filter @repo/shared test`       |      |      |

## 統合テスト連携

| 判定項目               | 基準 | 結果       |
| ---------------------- | ---- | ---------- |
| ユニットテストLine     | 80%+ | {{RESULT}} |
| ユニットテストBranch   | 60%+ | {{RESULT}} |
| ユニットテストFunction | 80%+ | {{RESULT}} |

Lint/TypeCheck/全テスト実行結果を記録する。

## 多角的チェック観点

| 観点               | 適用判断 | 確認内容                                           |
| ------------------ | -------- | -------------------------------------------------- |
| セキュリティ       | 該当     | パストラバーサル防止、ReadonlySkillErrorサニタイズ |
| アーキテクチャ     | 該当     | DI設計整合性、plan()との共通化                     |
| エラーハンドリング | 該当     | 全エラーコード定義・使用の網羅性                   |
| IPC通信            | 該当     | IPC wrapper形式準拠                                |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断 | 確認内容                    |
| -------------------- | -------- | --------------------------- |
| バックエンド（Main） | 該当     | RuntimeSkillCreatorFacade   |
| IPC通信              | 該当     | skill-creator:improve-skill |

## 成果物

| 成果物               | パス / 説明                                                                                     |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| 品質検証結果サマリー | Lint: PASS / FAIL（エラー数）、TypeCheck: PASS / FAIL（エラー数）、Tests: PASS / FAIL（失敗数） |

## 完了条件

- [ ] `pnpm --filter @repo/desktop lint` が PASS した
- [ ] `pnpm --filter @repo/shared lint` が PASS した
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS した
- [ ] `pnpm --filter @repo/shared typecheck` が PASS した（型定義変更の波及確認を含む）
- [ ] `pnpm --filter @repo/desktop test` が全テスト PASS した
- [ ] `pnpm --filter @repo/shared test` が全テスト PASS した
- [ ] `improvePromptConstants.ts` が lint 対象に含まれており PASS したことを確認した
- [ ] `RuntimeSkillCreatorImproveSuggestion` 型変更の影響を受けるファイルに型エラーがないことを確認した
- [ ] `any` 型が残存していないことを確認した
- [ ] `@ts-ignore` / `@ts-expect-error` の不当使用がないことを確認した
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

| サブタスク | 担当 | ステータス | 備考 |
| ---------- | ---- | ---------- | ---- |
| -          | -    | -          | -    |

## タスク100%実行確認【必須】

- [ ] 実行タスク1〜6の全項目を実行した
- [ ] 完了条件の全チェックボックスを確認した
- [ ] 成果物が全て生成された
- [ ] 未実行・スキップしたタスクは0件である

## 次のPhase

Phase 10: 最終レビュー
