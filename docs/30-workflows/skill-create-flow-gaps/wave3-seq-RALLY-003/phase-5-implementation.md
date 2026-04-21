# Phase 5: 実装

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 5                        |
| タスクID   | TASK-RALLY-003           |
| 機能名     | undo-server-rollback-api |
| 前提Phase  | Phase 4                  |
| 後続Phase  | Phase 6                  |
| 作成日     | 2026-04-21               |
| ステータス | pending                  |

## 目的

IPC 4層 + Facade + Renderer の 7 ファイルを依存関係順に実装する。

## 実装手順（依存関係により直列）

1. `packages/shared/src/ipc/channels.ts` に `SKILL_CREATOR_UNDO_USER_INPUT` チャンネル定数を追加する
2. `packages/shared/src/types/skillCreator.ts` に `UndoUserInputRequest` / `UndoUserInputResult` 型を追加する
3. `apps/desktop/src/preload/channels.ts` の allowedChannels に `"skill-creator:undo-user-input"` を追加する
4. `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` に `rollbackLastInput` メソッドを追加する
5. `apps/desktop/src/main/ipc/creatorHandlers.ts` に IPC ハンドラを追加する
6. `apps/desktop/src/preload/skill-creator-api.ts` の型定義と実装に `undoUserInput` を追加する
7. `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx` の `handleUndo` を async に更新し IPC 呼び出しを追加する

## 各ステップの検証

各ステップ完了後に以下を実行してエラーがないことを確認する:

```bash
# ステップ1・2完了後
pnpm --filter @repo/shared typecheck

# ステップ3〜6完了後
pnpm --filter @repo/desktop typecheck

# ステップ7完了後（全体確認）
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
```

## 変更対象ファイル

| #   | ファイル                                                                 | 変更種別 | 変更内容                                               |
| --- | ------------------------------------------------------------------------ | -------- | ------------------------------------------------------ |
| 1   | `packages/shared/src/ipc/channels.ts`                                    | 追加     | SKILL_CREATOR_UNDO_USER_INPUT チャンネル定数           |
| 2   | `packages/shared/src/types/skillCreator.ts`                              | 追加     | UndoUserInputRequest / UndoUserInputResult 型          |
| 3   | `apps/desktop/src/preload/channels.ts`                                   | 追加     | "skill-creator:undo-user-input" をホワイトリストに追加 |
| 4   | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`    | 追加     | rollbackLastInput メソッド                             |
| 5   | `apps/desktop/src/main/ipc/creatorHandlers.ts`                           | 追加     | skill-creator:undo-user-input IPC ハンドラ             |
| 6   | `apps/desktop/src/preload/skill-creator-api.ts`                          | 追加     | undoUserInput API（型定義・実装）                      |
| 7   | `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx` | 変更     | handleUndo を async 化・IPC 呼び出し追加               |

## 実装上の注意事項

- `rollbackLastInput` の実装は、実装前に `RuntimeSkillCreatorFacade` の stepHistory 管理仕様を確認してから行う
- `handleUndo` が async になるため、呼び出し元に影響がないか確認する
- RALLY-005 の「invoke を正規ソース」方針に従い、rollback 後の snapshot は invoke 戻り値から取得する

## 参照資料

| 資料名       | パス                                    | 用途                  |
| ------------ | --------------------------------------- | --------------------- |
| IPC4層設計書 | `outputs/phase-2/ipc-4layer-design.md`  | Phase 2 成果物        |
| Facade設計書 | `outputs/phase-2/facade-design.md`      | Phase 2 成果物        |
| テスト仕様書 | `outputs/phase-4/test-specification.md` | GREEN確認対象のテスト |

## 成果物

| 成果物           | パス                                        | 説明                           |
| ---------------- | ------------------------------------------- | ------------------------------ |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 7ファイルの変更内容サマリー    |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | 変更したファイルパスと変更種別 |
| 検証結果         | `outputs/phase-5/verification-result.md`    | typecheck/lint/test の実行結果 |

## 完了条件

- [ ] 7ファイルを依存関係順に実装した
- [ ] 各ステップで typecheck を実行しエラーなしを確認した
- [ ] `pnpm --filter @repo/desktop lint` がエラーなしで通過
- [ ] Phase 4 のテストが GREEN
- [ ] AC-1〜AC-6 全PASS確認
- [ ] 成果物テーブル記載のファイルを全件生成した

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] AC-1〜AC-6 全PASS確認
- [ ] 成果物テーブル記載のファイルを全件生成

## 次のPhase

Phase 6: テスト拡充
