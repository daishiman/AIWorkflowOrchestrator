# Phase 5 仕様更新手順

## Task 5-2: task-9更新手順

### artifacts.modifies 更新ルール

- 各task-9仕様書に以下3ファイルを追加する。
  - `apps/desktop/src/preload/channels.ts`
  - `apps/desktop/src/preload/skill-api.ts`
  - `apps/desktop/src/preload/types.ts`

### artifacts.creates 更新ルール

- taskごとに `packages/shared/src/types/skill/<domain>.ts` を追加する。
- `packages/shared/src/types/skill/index.ts` の更新対象を明記する。

### 参照パス更新ルール

- 旧参照 `apps/desktop/src/main/ipc/channels.ts` は現行実体との差異を注記し、最終的に現行パスへ統一する。
- 実在確認コマンド: `test -f <path>` を必須化する。

## Task 5-3: SubAgent統合手順

1. A/B/Cが個別仕様案を提出。
2. Dが整合レビューしギャップ一覧へ反映。
3. 再提出後にDが最終版を確定。
4. 引き継ぎログを各phase成果物末尾に記録。

## Task 5-4: 実装禁止範囲

- 禁止: `apps/desktop/src/**` 実コード編集
- 禁止: テストコード追加
- 禁止: Gitコミット/PR作成
- 許可: `docs/30-workflows/completed-tasks/ut-skill-ipc-preload-extension-001/outputs/**` の文書生成

## 完了状態

- Phase 5 Task 5-2/5-3/5-4: Completed
