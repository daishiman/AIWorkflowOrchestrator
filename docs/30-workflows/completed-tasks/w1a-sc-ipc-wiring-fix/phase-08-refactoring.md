# Phase 8: リファクタリング

## メタ情報

| 項目     | 値                        |
| -------- | ------------------------- |
| Phase    | 8                         |
| タスクID | TASK-SC-01-IPC-WIRING-FIX |
| 作成日   | 2026-03-22                |

## 目的

Phase 5 の実装コードの品質を改善する。重複コードを削減し、共通バリデーション関数を抽出することで、16チャネル分のバリデーションロジックを一元管理する。テストは全て Green を維持する。

## 実行タスク

1. 各ハンドラに散在するバリデーションコードを共通関数 `validateStringArg()` に抽出する
2. ハンドラ登録パターン（`safeRegister` or 個別 try-catch）を統一する（P54対策: 戻り値が必要なハンドラは個別 try-catch）
3. 長すぎる関数（30行以上）を責務ごとに分割する
4. 未使用の import を除去する
5. 型定義の冗長な箇所（inline type vs named type）を整理する
6. non-null assertion（`!`）がある場合は実行時検証に置換する（P48対策）
7. リファクタリング後に `pnpm vitest run` を実行し全テストが Green であることを確認する

## 参照資料

- `docs/30-workflows/skill-creator-llm-integration/01-sc-ipc-wiring-fix/phase-05-implementation.md`
- `.claude/rules/06-known-pitfalls.md#P54`（safeRegister 適用基準）
- `.claude/rules/06-known-pitfalls.md#P48`（non-null assertion）
- `.claude/rules/02-code-quality.md#コーディング規約`

## 成果物

- `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`（リファクタリング後）
- 共通バリデーション関数（`validateStringArg()` など）の定義

## 完了条件

- [ ] 重複バリデーションコードが共通関数に抽出されている
- [ ] ハンドラ登録パターンが統一されている
- [ ] non-null assertion が除去されている（または除去理由が記録されている）
- [ ] 未使用 import が除去されている
- [ ] `pnpm vitest run` で全テストが Green である
- [ ] `pnpm typecheck` が PASS している

## 次のPhase

Phase 9: 品質検証
