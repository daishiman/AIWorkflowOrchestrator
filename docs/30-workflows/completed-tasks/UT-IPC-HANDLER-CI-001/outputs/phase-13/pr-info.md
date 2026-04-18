# PR 情報下書き

## メタ情報

| 項目   | 内容                  |
| ------ | --------------------- |
| Phase  | 13                    |
| タスク | UT-IPC-HANDLER-CI-001 |

## PR タイトル案

```
test(ipc): creatorHandlers チャンネル登録スナップショットテスト追加 (UT-IPC-HANDLER-CI-001)
```

## PR 本文要点

### Summary

- `registerRuntimeSkillCreatorHandlers()` の `ipcMain.handle()` 登録チャンネル一覧をスナップショットで固定
- 重複登録・欠損登録を CI で自動検出できるようにする
- プロダクションコードへの変更なし（テスト・ドキュメントのみ）

### 変更ファイル

| ファイル                                                                                              | 変更種別                       |
| ----------------------------------------------------------------------------------------------------- | ------------------------------ |
| `apps/desktop/src/main/ipc/__tests__/creatorHandlers.registrationSnapshot.test.ts`                    | 新規追加                       |
| `apps/desktop/src/main/ipc/__tests__/__snapshots__/creatorHandlers.registrationSnapshot.test.ts.snap` | 自動生成                       |
| `docs/30-workflows/UT-IPC-HANDLER-CI-001/`                                                            | 新規追加（タスク仕様書成果物） |
| `.agents/skills/aiworkflow-requirements/indexes/keywords.json`                                        | 更新                           |
| `.claude/skills/aiworkflow-requirements/indexes/keywords.json`                                        | 更新                           |
| `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                                         | 更新                           |

### テスト方法

```bash
# スナップショットテスト単体実行
cd apps/desktop && pnpm vitest run "creatorHandlers.registrationSnapshot"

# スナップショット更新（チャンネルが追加・変更された場合）
cd apps/desktop && pnpm vitest run "creatorHandlers.registrationSnapshot" --updateSnapshot
```

### スナップショット更新タイミング

- `registerRuntimeSkillCreatorHandlers()` に新しい `ipcMain.handle()` 呼び出しを追加・削除した場合
- チャンネル名を変更した場合
- `--updateSnapshot` を実行し、差分を意図的な変更として確認してからコミットすること

## 受け入れ基準との対応

| ID           | 内容                                   | テスト                      |
| ------------ | -------------------------------------- | --------------------------- |
| REG-SNAP-01  | チャンネル一覧がスナップショットと一致 | `REG-SNAP-01` テストケース  |
| REG-DEDUP-01 | 重複チャンネルなし                     | `REG-DEDUP-01` テストケース |
| REG-COUNT-01 | 登録総数 19                            | `REG-COUNT-01` テストケース |
| REG-EDGE-01  | 重複検出可能                           | `REG-EDGE-01` テストケース  |
| REG-EDGE-02  | on() は spy 対象外                     | `REG-EDGE-02` テストケース  |
| REG-EDGE-03  | 空配列スナップショット                 | `REG-EDGE-03` テストケース  |

## 参照

- Phase 12 実装ガイド: `outputs/phase-12/implementation-guide.md`
- Phase 10 最終レビュー: `outputs/phase-10/final-review-result.md`
- Phase 4 テスト仕様: `outputs/phase-4/test-specification.md`
