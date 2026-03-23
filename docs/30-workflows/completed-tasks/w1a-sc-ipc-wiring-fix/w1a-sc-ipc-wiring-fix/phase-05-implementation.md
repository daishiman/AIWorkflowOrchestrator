# Phase 5: 実装

## メタ情報

| 項目     | 値                        |
| -------- | ------------------------- |
| Phase    | 5                         |
| タスクID | TASK-SC-01-IPC-WIRING-FIX |
| 作成日   | 2026-03-22                |

## 目的

Phase 2 で設計した統合戦略を実装し、`creatorHandlers.ts` の dead-end namespace を解消する。全16チャネルを `skill-creator:*` namespace の単一エントリポイントから登録し、P65パターンを根絶する。

## 実行タスク

1. `skillCreatorHandlers.ts` を更新し、`creatorHandlers.ts` のハンドラを統合する
2. `creatorHandlers.ts` の `creator:*` チャネル登録コードを削除または `skill-creator:*` に変換する
3. `channels.ts` の定数を整理し、`creator:*` 定数を削除（または `skill-creator:*` へエイリアス化）する
4. 各ハンドラに P42準拠の3段バリデーションを実装する（型チェック → 空文字列 → `.trim() === ""` チェック）
5. ハンドラの引数型をインターフェースに依存させる（DIP準拠、P61対策）
6. IPC チャネル名はすべて `IPC_CHANNELS` 定数経由で参照する（P27対策）
7. 二重登録を防ぐ `unregisterAllIpcHandlers()` の呼び出し順序を確認する（P5対策）
8. Phase 4 のテストを実行し Green になることを確認する

## 参照資料

- `docs/30-workflows/skill-creator-llm-integration/01-sc-ipc-wiring-fix/phase-02-design.md`
- `docs/30-workflows/skill-creator-llm-integration/01-sc-ipc-wiring-fix/phase-04-test-creation.md`
- `.claude/rules/06-known-pitfalls.md#P65`（dead-end namespace）
- `.claude/rules/06-known-pitfalls.md#P42`（trim バリデーション）
- `.claude/rules/06-known-pitfalls.md#P27`（ハードコード文字列）
- `.claude/rules/06-known-pitfalls.md#P5`（リスナー二重登録）
- `.claude/rules/06-known-pitfalls.md#P61`（DIP違反）

## 成果物

- `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`（更新）
- `apps/desktop/src/main/ipc/creatorHandlers.ts`（削除または縮小）
- `apps/desktop/src/preload/channels.ts`（更新）
- `packages/shared/src/types/skillCreator.ts`（必要に応じて更新）

## 完了条件

- [ ] `creator:*` namespace のハンドラ登録がコードから完全に除去されている
- [ ] 全16チャネルが `skill-creator:*` namespace で登録されている
- [ ] 各ハンドラに P42準拠の3段バリデーションが実装されている
- [ ] チャネル名がすべて定数参照になっている（文字列リテラル使用箇所がない）
- [ ] Phase 4 のテストが全て Green になっている
- [ ] `pnpm typecheck` が PASS している

## 次のPhase

Phase 6: テスト拡充
