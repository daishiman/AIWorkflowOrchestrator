# Phase 8: リファクタリング

## メタ情報

| 項目     | 値                     |
| -------- | ---------------------- |
| Phase    | 8                      |
| タスクID | UT-SC-05-IPC-DI-WIRING |
| 作成日   | 2026-03-23             |

## 目的

Phase 5 の実装コードの品質を改善する。本タスクは1ファイル（`index.ts`）の限定的な修正であるため、リファクタリング対象は小規模。

## 実行タスク

### Task 1: コード品質チェック

以下の観点で修正箇所をレビューする:

| チェック項目              | 基準                                                          |
| ------------------------- | ------------------------------------------------------------- |
| `any` 型の使用            | 使用していないこと                                            |
| 未使用 import             | 追加した import が全て使用されていること                      |
| console.warn のメッセージ | 機密情報（API キー等）を含まないこと                          |
| 変数命名                  | `llmAdapter`、`resourceLoader` が実態と一致すること           |
| `try-catch` のスコープ    | LLM アダプター取得のみを囲んでいること                        |
| `void` 式の使用           | 即時実行 async 使用時に `void` が付いていること（必要な場合） |

### Task 2: import 文の整理

追加した import が既存 import と同じスタイル（パスエイリアス `@/main/...` vs 相対パス `../`）で記述されていることを確認する。

### Task 3: 重複コードの確認

`SkillCreatorService` のコンストラクタ内でも `ResourceLoader` を生成している（L41）。DI 配線で生成した `resourceLoader` インスタンスと、`SkillCreatorService` 内部のインスタンスが別物であることを確認し、問題がないことを検証する（別用途のため問題なし）。

### Task 4: リファクタリング後のテスト実行

```bash
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillCreatorHandlers
```

## 参照資料

- `apps/desktop/src/main/ipc/index.ts`（修正後）
- `.claude/rules/02-code-quality.md`

## 統合テスト連携

リファクタリング後は以下のテストコマンドで品質を確認する:

```bash
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillCreatorHandlers
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillCreatorIpc
```

カバレッジ基準: Line 80%+, Branch 60%+, Function 80%+

## 多角的チェック観点（AIが判断）

| 観点           | 参照先                                                 |
| -------------- | ------------------------------------------------------ |
| IPC通信        | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| セキュリティ   | `aiworkflow-requirements: security-api-electron.md`    |
| アーキテクチャ | `aiworkflow-requirements: architecture-*.md`           |
| コード品質     | `.claude/rules/02-code-quality.md`                     |

## サブタスク管理

- [ ] Task 1: コード品質チェック（`any`型・未使用import・命名・スコープ・`void`式）
- [ ] Task 2: import文の整理（スタイル統一確認）
- [ ] Task 3: 重複コードの確認（ResourceLoaderインスタンスの独立性検証）
- [ ] Task 4: リファクタリング後のテスト実行（PASS確認）

## タスク100%実行確認【必須】

- [ ] 上記サブタスク全てを実行したか
- [ ] 実行スキップしたタスクがある場合、理由を記録したか
- [ ] テスト実行結果を成果物として記録したか

## 成果物

- リファクタリング済みコード（変更があった場合のみ）

## 完了条件

- [ ] コード品質チェック全項目を確認した
- [ ] import 文のスタイルが既存と統一されていることを確認した
- [ ] 重複コードがないことを確認した（または重複が許容される理由を記録した）
- [ ] テストが全て PASS した

## 次のPhase

Phase 9: 品質検証
