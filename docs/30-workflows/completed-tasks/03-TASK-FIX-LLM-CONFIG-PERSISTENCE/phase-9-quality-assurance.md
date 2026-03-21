# Phase 9: 品質検証

## メタ情報

| 項目          | 内容                                                                          |
| ------------- | ----------------------------------------------------------------------------- |
| Phase番号     | 9                                                                             |
| 機能名        | LLM設定永続化修正 (TASK-FIX-LLM-CONFIG-PERSISTENCE)                           |
| 作成日        | 2026-03-20                                                                    |
| 担当          | -                                                                             |
| ステータス    | completed                                                                     |
| 前Phase成果物 | `docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-8-refactoring.md` |

## 目的

Lint・TypeScript型チェック・全テスト実行を行い、実装が品質基準を満たしていることを確認する。この Phase で発見された問題は修正してから Phase 10 へ進む。

## 実行タスク

### タスク1: Lint 実行

```bash
# プロジェクトルートから実行
pnpm --filter @repo/desktop lint

# または apps/desktop から
cd apps/desktop && pnpm lint
```

**確認項目**:

- ESLint エラーが 0 件であること
- 警告は可能な限り解消する（修正できない警告はコメントで理由を明記）

### タスク2: TypeScript 型チェック

```bash
# プロジェクトルートから実行
pnpm --filter @repo/desktop typecheck

# または apps/desktop から
cd apps/desktop && pnpm typecheck
```

**確認項目**:

- TypeScript エラーが 0 件であること
- `any` 型の使用がないこと
- `@ts-ignore` / `@ts-expect-error` を使用している場合は理由コメントがあること

### タスク3: 全テスト実行

```bash
# apps/desktopディレクトリから実行（P40対策）
cd apps/desktop

# store関連テスト（Phase 4/5/6 で作成したテストを含む）
pnpm vitest run src/renderer/store/

# apps/desktop 全テスト（リグレッションチェック）
pnpm vitest run
```

**確認項目**:

- Phase 4/5/6 で作成した全テスト（T1〜T8）が PASS であること
- 既存テストがすべて PASS のままであること（リグレッションなし）

### タスク4: セキュリティチェック

```bash
# partialize関数に機密情報が含まれていないことを最終確認
grep -n "apiKey\|token\|secret\|password" apps/desktop/src/renderer/store/index.ts
grep -A 20 "partialize" apps/desktop/src/renderer/store/index.ts

# persistのname/version確認
grep -n "name:\|version:" apps/desktop/src/renderer/store/index.ts
```

**確認項目**:

- partialize関数に `apiKey`, `token`, `secret`, `password` が含まれていないこと
- persist version が 2 に更新されていること

### タスク5: 品質検証結果の記録

| チェック項目                 | 結果 | 備考 |
| ---------------------------- | ---- | ---- |
| Lint（エラー件数）           | -    | -    |
| TypeScript型チェック         | -    | -    |
| 新規テスト（T1〜T8）         | -    | -    |
| 既存テスト（リグレッション） | -    | -    |
| セキュリティチェック         | -    | -    |

（Phase 9 実行時に記入）

## 参照資料

### コード品質ルール

| 資料名             | パス                                    |
| ------------------ | --------------------------------------- |
| コーディング規約   | `.claude/rules/02-code-quality.md`      |
| セキュリティルール | `.claude/rules/04-electron-security.md` |

### 依存Phaseトレーサビリティ

| Phase   | パス                                                                             | 用途                                   |
| ------- | -------------------------------------------------------------------------------- | -------------------------------------- |
| Phase 5 | `docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-5-implementation.md` | Lint / typecheck / test 対象実装の確認 |
| Phase 8 | `docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-8-refactoring.md`    | 品質検証直前のコード状態を固定         |

### 既知の落とし穴

| 落とし穴ID | 説明                       | 対策                        |
| ---------- | -------------------------- | --------------------------- |
| P40        | テスト実行ディレクトリ依存 | `apps/desktop` から実行する |

## 実行手順

1. **タスク1の実施**: Lint を実行し、エラーを解消する
2. **タスク2の実施**: TypeScript 型チェックを実行し、エラーを解消する
3. **タスク3の実施**: 全テストを実行し、全て PASS であることを確認する
4. **タスク4の実施**: セキュリティチェックを実行する
5. **タスク5の実施**: 結果を記録する

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこのPhaseで確認・更新する。
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと1対1で突合する。

## 成果物

| 成果物                       | パス                                                                                | 説明         |
| ---------------------------- | ----------------------------------------------------------------------------------- | ------------ |
| Phase 9 仕様書（本ファイル） | `docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-9-quality-assurance.md` | 品質検証結果 |

## 完了条件

- [ ] Lint エラーが 0 件であることを確認した
- [ ] TypeScript 型チェックエラーが 0 件であることを確認した
- [ ] T1-1 〜 T8-2 の全テストが PASS であることを確認した
- [ ] 既存テストのリグレッションがないことを確認した
- [ ] セキュリティチェックで partialize に機密情報が含まれていないことを確認した
- [ ] タスク5の結果テーブルを記入した

## 次Phase

Phase 10: 最終レビュー（`phase-10-final-review.md`）
