# コマンド期待値定義

## 依存関係整合チェック

```bash
pnpm install --frozen-lockfile
pnpm --filter @repo/shared build
pnpm --filter @repo/desktop test -- SkillCreatorService
```

## 各コマンドの期待値

### `pnpm install --frozen-lockfile`

| 項目       | 期待値              |
| ---------- | ------------------- |
| 終了コード | 0                   |
| エラー     | なし                |
| 備考       | lockfile の変更なし |

### `pnpm --filter @repo/shared build`

| 項目       | 期待値               |
| ---------- | -------------------- |
| 終了コード | 0                    |
| 出力       | build 成功メッセージ |
| エラー     | なし                 |

### `pnpm --filter @repo/desktop test -- SkillCreatorService`

| 項目          | 期待値            |
| ------------- | ----------------- |
| 終了コード    | 0                 |
| SC-CANCEL-001 | PASS              |
| SC-CANCEL-002 | PASS              |
| 全体テスト    | PASS（失敗 0 件） |

## typecheck コマンド

```bash
pnpm --filter @repo/desktop typecheck
```

| 項目              | 期待値 |
| ----------------- | ------ |
| 終了コード        | 0      |
| TypeScript エラー | なし   |

## spec 整合確認コマンド

```bash
# artifact 名の確認
grep -h "outputs/phase-" \
  docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/phase-*.md | \
  sed 's/.*`\(outputs\/phase-[^`]*\)`.*/\1/' | \
  sort | uniq
```

| 項目   | 期待値                                         |
| ------ | ---------------------------------------------- |
| 出力   | canonical 名のみ（`report`/`result` 混在なし） |
| 不一致 | なし                                           |

## cancel cleanup 実装確認コマンド

```bash
grep -n "cleanupCancelledSkillDir\|skillDirExistedBefore\|catch\|finally" \
  apps/desktop/src/main/services/skill/SkillCreatorService.ts | head -20
```

| 期待される出力行                                          | 意味                         |
| --------------------------------------------------------- | ---------------------------- |
| `skillDirExistedBefore = await this.pathExists(skillDir)` | 事前確認                     |
| `} catch (error) {`                                       | catch ブロック               |
| `await this.cleanupCancelledSkillDir(...)`                | catch 内での cleanup         |
| `} finally {`                                             | finally ブロック             |
| `this.currentAbortController = null`                      | AbortController リセットのみ |
