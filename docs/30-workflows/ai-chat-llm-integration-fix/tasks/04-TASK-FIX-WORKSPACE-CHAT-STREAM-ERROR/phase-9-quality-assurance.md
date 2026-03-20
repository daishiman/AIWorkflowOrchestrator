# Phase 9: 品質検証

## メタ情報

| 項目          | 値                                                                                                                   |
| ------------- | -------------------------------------------------------------------------------------------------------------------- |
| Phase番号     | 9                                                                                                                    |
| 機能名        | WorkspaceChat ストリーミングエラーUX改善                                                                             |
| タスクID      | TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR                                                                                 |
| 作成日        | 2026-03-20                                                                                                           |
| 前Phase成果物 | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-8-refactoring.md` |

## 目的

Lint・型チェック・全テストを実行し、コードベース全体の品質基準を満たしていることを確認する。Phase 10 最終レビューへの進行条件を整える。

## 実行タスク

### Task 1: Lint チェック

```bash
# ESLint（デスクトップパッケージ全体）
pnpm --filter @repo/desktop lint

# 修正可能なlintエラーを自動修正する場合
pnpm --filter @repo/desktop lint --fix
```

#### Lint確認ポイント

- 未使用importがないこと
- `any` 型の使用がないこと（`@typescript-eslint/no-explicit-any`）
- React Hooks のルール違反がないこと
- boolean 変数名が `is` / `has` / `can` / `should` プレフィックスであること

### Task 2: TypeScript 型チェック

```bash
# 型チェック（デスクトップパッケージ）
pnpm --filter @repo/desktop typecheck

# または
cd apps/desktop && pnpm tsc --noEmit
```

#### 型チェック確認ポイント

- `strict: true` モードでエラーがないこと
- non-null assertion（`!`）が使用されていないこと
- 型アサーション（`as`）でバリデーションを回避していないこと
- `StreamingErrorState` の型が全ての使用箇所で一致していること

### Task 3: 全テスト実行

```bash
# WorkspaceView 関連テスト（対象範囲）
cd apps/desktop && pnpm vitest run src/renderer/views/WorkspaceView

# デスクトップパッケージ全テスト
cd apps/desktop && pnpm vitest run
```

#### テスト結果確認ポイント

- Phase 4で作成した T-01〜T-08（単体テスト）が全て PASS
- Phase 4で作成した C-01〜C-10（コンポーネントテスト）が全て PASS
- Phase 4で作成した H-01〜H-08（フックテスト）が全て PASS
- Phase 6で追加したテストが全て PASS
- 既存テストが PASS のままであること（リグレッションなし）

### Task 4: セキュリティチェック

本タスクはIPC層変更なしのため、セキュリティチェックは軽微。

```bash
# IPC層変更なしを確認
git diff --name-only HEAD | grep -E "ipc|preload|handlers" || echo "IPC層変更なし"

# 機密情報のログ出力がないか確認
grep -rn "console.log.*key\|console.log.*token\|console.log.*password" \
  apps/desktop/src/renderer/views/WorkspaceView/ 2>/dev/null || echo "機密情報ログなし"
```

### Task 5: 品質検証サマリー

| チェック項目    | コマンド                                | 結果   |
| --------------- | --------------------------------------- | ------ |
| Lint            | `pnpm --filter @repo/desktop lint`      | 未実行 |
| TypeScript型    | `pnpm --filter @repo/desktop typecheck` | 未実行 |
| 単体テスト      | `pnpm vitest run src/.../WorkspaceView` | 未実行 |
| リグレッション  | 既存テストのPASS確認                    | 未実行 |
| IPC変更なし確認 | `git diff --name-only HEAD`             | 未実行 |

（Phase 9実行時に「未実行」を「PASS/FAIL」に更新する）

## 参照資料

| ドキュメント       | パス                                                                                                                 | 参照目的                   |
| ------------------ | -------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Phase 8 リファクタ | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-8-refactoring.md` | リファクタリング済み成果物 |
| コード品質ルール   | `.claude/rules/02-code-quality.md`                                                                                   | TypeScript・テスト品質基準 |
| セキュリティルール | `.claude/rules/04-electron-security.md`                                                                              | IPC変更なし確認            |
| P19 型キャスト     | `.claude/rules/06-known-pitfalls.md`                                                                                 | as キャスト禁止            |

## 実行手順

1. **Task 1**: Lint チェックを実行し、エラーがあれば修正する
2. **Task 2**: TypeScript 型チェックを実行し、型エラーがあれば修正する
3. **Task 3**: 全テストを実行し、全て PASS であることを確認する
4. **Task 4**: セキュリティチェックを実行する
5. **Task 5**: サマリーテーブルを更新して全項目 PASS を記録する

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこのPhaseで確認・更新する。
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと1対1で突合する。

## 成果物

| 成果物                       | パス                                                                                                                       | 形式       |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 品質検証サマリー（Task 5）   | 本ファイルの Task 5 セクション（実行後に更新）                                                                             | インライン |
| Phase 9 仕様書（本ファイル） | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-9-quality-assurance.md` | Markdown   |

## 完了条件

- [ ] `pnpm lint` が 0 エラーで通ること
- [ ] `pnpm typecheck` が 0 エラーで通ること
- [ ] Phase 4テスト（T-01〜T-08, C-01〜C-10, H-01〜H-08）が全て PASS
- [ ] Phase 6追加テストが全て PASS
- [ ] 既存テストがリグレッションなく PASS
- [ ] IPC層に変更がないことを確認済み
- [ ] 機密情報のログ出力がないことを確認済み
- [ ] Task 5サマリーテーブルが全て「PASS」で記録済み

## 次Phase

Phase 10: 最終レビュー (`phase-10-final-review.md`)
