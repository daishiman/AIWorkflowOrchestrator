# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 8                                     |
| Phase名    | リファクタリング                      |
| 対象機能   | TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY |
| 前提Phase  | Phase 7: カバレッジ確認               |
| 次Phase    | Phase 9: 品質保証                     |
| ステータス | pending                               |
| 作成日     | 2026-04-16                            |

## 目的

Phase 5 の `InlineModelSelector` 実装に対して duplicate・navigation drift を削り、最終品質に仕上げる。

## 実行タスク

### Task 1: 重複排除の確認

description 表示ロジックが 1 コンポーネント内で重複している場合のみ共通化を検討する:

| チェック項目                                        | 対応方針                                    |
| --------------------------------------------------- | ------------------------------------------- |
| description の補助表示ロジックが 1 箇所に収まる場合 | 共通化せず、local helper のまま維持する     |
| helper 抽出で DOM 構造が複雑になる場合              | YAGNI を優先し、重複を許容する              |
| テストが 1 箇所でカバーできるか確認する             | Phase 6 の InlineModelSelector テストを更新 |

### Task 2: 変更内容の記録

`対象/Before/After/理由` テーブル形式で記録する:

| 対象                | Before             | After                        | 理由                        |
| ------------------- | ------------------ | ---------------------------- | --------------------------- |
| InlineModelSelector | description 未表示 | tooltip / helper text で表示 | AC-1 + スペース制約への対応 |

### Task 3: 品質チェック

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop test
```

全コマンドが PASS することを確認する。

## 参照資料

| 資料名   | パス                        | 説明             |
| -------- | --------------------------- | ---------------- |
| 実装記録 | `phase-5-implementation.md` | 変更ファイル一覧 |

## 成果物

| 成果物               | パス                                    | 説明                                    |
| -------------------- | --------------------------------------- | --------------------------------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-record.md` | Before/After テーブル・品質チェック結果 |

## 完了条件

- [ ] 重複排除の検討結果が記録されている
- [ ] Before/After テーブルが完成している
- [ ] typecheck / lint / test が全て PASS している
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

## 次Phase

→ [Phase 9: 品質保証](./phase-9-quality-assurance.md)
