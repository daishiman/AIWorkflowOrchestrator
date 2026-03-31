# Phase 13: PR作成

## メタ情報

| 項目   | 値                                |
| ------ | --------------------------------- |
| Phase  | 13                                |
| 機能名 | ut-sdk06-layer34-verify-expansion |
| 作成日 | 2026-03-31                        |

## 目的

ユーザーの明示指示がある場合のみ PR 作業を行う。現在は blocked とし、commit / PR / push は実行しない。

## 実行タスク

- blocked 理由（ユーザー未指示）を明記する
- （実行済みであれば）ローカルチェック（typecheck / lint / test）の結果を記録する
- PR のための準備メモ（タイトル案・概要案・テスト観点）を作成する
- commit / PR / push はユーザー指示があるまで実行しない

## 参照資料

| 資料名                | パス                           | 説明           |
| --------------------- | ------------------------------ | -------------- |
| Phase 12 ドキュメント | `phase-12-documentation.md`    | 変更内容の正本 |
| Phase 9 QA            | `phase-9-quality-assurance.md` | 品質ゲート結果 |

## PR 準備メモ

### PR タイトル案

```text
test(verification): UT-IMP-SDK-06 Layer3/4 verify 拡張テスト
```

### PR 概要案（ドラフト）

- `SkillCreatorVerificationEngine.test.ts` に Layer3（lint/schema）/ Layer4（semantic）テストを追加
- verify→improve→reverify ループの結合テストを追加
- `SkillCreatorVerificationEngine.ts` に Layer3/4 検証ロジックを追加
- `packages/shared/src/types/skillCreator.ts` の `layer` 型を拡張（必要な場合）

### Test Plan（ドラフト）

- `pnpm --filter @repo/desktop typecheck`
- `pnpm --filter @repo/desktop lint`
- `pnpm --filter @repo/desktop vitest run`

## 参考コマンド（必要な場合のみ）

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/desktop lint

# テスト（全テスト）
pnpm --filter @repo/desktop vitest run
```

## 変更サマリー（準備メモ）

| 変更ファイル                                                                                         | 変更種別 | 内容                         |
| ---------------------------------------------------------------------------------------------------- | -------- | ---------------------------- |
| `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts`            | 更新     | Layer3/4 テストケースの追加  |
| `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`                           | 更新     | Layer3/4 検証ロジックの追加  |
| `packages/shared/src/types/skillCreator.ts`                                                          | 更新     | `layer` 型拡張（必要な場合） |
| `docs/30-workflows/skill-creator-agent-sdk-lane/step-11-par-task-ut-sdk06-layer34-verify-expansion/` | 新規     | タスク仕様書一式             |

## blocked 理由

- user 指示がないため PR 作成は実施しない
- commit / PR / push を実行しない
- 後続で PR が必要になった場合に備えて、上記の準備メモのみ保持する

## 完了条件

- [ ] PR 作成が blocked であることが記録されている
- [ ] PR のための準備メモ（タイトル案・概要案・テスト観点）が記録されている
- [ ] commit / PR / push を実行していない
- [ ] **本Phase内の全タスクを100%実行完了**
