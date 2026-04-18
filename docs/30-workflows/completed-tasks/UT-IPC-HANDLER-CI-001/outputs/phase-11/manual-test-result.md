# 手動テスト結果（正本）

## メタ情報

| 項目   | 内容                  |
| ------ | --------------------- |
| Phase  | 11                    |
| タスク | UT-IPC-HANDLER-CI-001 |

## テスト件数サマリー

| 種別      | 件数  |
| --------- | ----- |
| 正常系    | 3     |
| 異常系    | 1     |
| edge case | 2     |
| **合計**  | **6** |

## edge case 一覧

| EC-NNN | 内容                                                     | 判定 |
| ------ | -------------------------------------------------------- | ---- |
| EC-001 | ipcMain.on() は handle spy に含まれない                  | PASS |
| EC-002 | 各テストで handles が独立している（beforeEach リセット） | PASS |

## 仕様判断根拠

| SD-NNN | 判断内容                                                                                                |
| ------ | ------------------------------------------------------------------------------------------------------- |
| SD-001 | Electron mock capture パターンは `vi.hoisted` + `vi.mock("electron")` + `mockImplementation` で実現する |
| SD-002 | カバレッジが低い（11.91%）のは意図的。ハンドラ本体は既存テスト群が担当する                              |

## 実行記録

### Task 1: ローカルテスト実行確認

```bash
npx vitest run "src/main/ipc/__tests__/creatorHandlers.registrationSnapshot.test.ts" --reporter=verbose
```

- [x] スナップショットテストが実行された ✅
- [x] 全テストが PASS した（6/6） ✅
- [x] スナップショットファイルが `__snapshots__/` 配下に存在する ✅

### Task 2: 重複チャンネル追加によるテスト失敗確認

`creatorHandlers.ts` の末尾に `ipcMain.handle(IPC_CHANNELS.SKILL_CREATOR_PLAN, async () => {})` を追加してテスト実行:

- [x] 重複チャンネル追加後にテストが失敗した ✅
  - REG-SNAP-01: スナップショット差分（20件 vs 19件のスナップショット）
  - REG-DEDUP-01: `expected 19 to be 20`（Set サイズ < 配列長）
  - REG-COUNT-01: `expected 20 items to have length 19`
- [x] エラーメッセージにチャンネル名・件数が含まれた ✅
- [x] 元に戻した後にテストが全パスした ✅

### Task 3: CI 検証

既存の `pnpm --filter @repo/desktop test` ワークフローに新規テストが含まれることを設計時に確認済み（追加設定不要）。

### Task 4: 視覚証跡

`NON_VISUAL` タスクのため N/A（`ui-sanity-visual-review.md` に記録）。

## 発見事項

**なし** — Blocker・Note・Info ともに発見事項なし。
