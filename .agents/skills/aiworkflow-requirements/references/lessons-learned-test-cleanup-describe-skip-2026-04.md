# テストクリーンアップ / describe.skip 整理パターン（2026-04）

> 出典タスク: UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001
> 記録日: 2026-04-16
> 区分: lessons-learned（テスト / クリーンアップ）

---

## L-W2-03A-001: 削除済みテストファイルの早期検出

**問題**: タスク仕様書が作成された時点ですでに対象ファイルが削除済みだったが、
Phase 1 の P0 チェックまでその事実が明確化されなかった。

**教訓**: タスク仕様書作成時（`spec_created` フェーズ）に `test -e <target_file>` を
自動実行し、削除済みなら仕様書に即座に明記する。
`generate-index.js` のような正本生成スクリプトも同時に存在確認し、
`N/A` と決め打ちせず再生成を先に走らせる。

```bash
# 仕様書作成前に実行
test -e "$target_file" && echo "存在" || echo "N/A: 削除済み"
```

---

## L-W2-03A-002: 削除済みファイルへの安全な操作パターン

**問題**: 削除済みファイルに対して直接 `grep` や `vitest run` を実行すると
「ファイルが見つからない」エラーが発生し、ワークフローが中断する。

**教訓**: 全フェーズで以下の存在確認パターンを使用する。

```bash
if [ -e "$target_file" ]; then
  grep -n "describe.skip" "$target_file"
else
  echo "N/A: $target_file は削除済み"
fi
```

`artifacts.json` の同値性確認も `ls` ではなく `diff -q` を使う:

```bash
diff -q artifacts.json outputs/artifacts.json
```

---

## L-W2-03A-003: 選択肢A（削除）/ 選択肢B（移植）の判断基準

旧テストファイルを削除済み確認したあと、companion test への対応を判断するフロー:

```
1. 対象ファイルが削除済みか確認
   ↓ 削除済みの場合
2. companion test でエッジケースがカバーされているか確認
   ↓ カバー済み → 選択肢A（削除）: 残存参照のみ整理
   ↓ カバーされていない → 選択肢B（移植）: 新フロー API に書き直して companion test へ追加
```

| 基準                                                  | 方針            |
| ----------------------------------------------------- | --------------- |
| companion test がエッジケースをカバー済み             | 選択肢A（削除） |
| companion test にカバーされていないエッジケースが残存 | 選択肢B（移植） |

今回 (`UT-W2-03A`) は F-2/F-3/E-4/W-8b 全て companion test でカバー済みのため
選択肢A を採用した。

---

## L-W2-03A-004: 削除済み時の残存参照整理チェックリスト

| 確認項目                                    | コマンド例                                             | 期待値  |
| ------------------------------------------- | ------------------------------------------------------ | ------- |
| `describe.skip` 件数                        | `grep -rn "describe.skip" <companion_test>`            | 0 件    |
| `TODO(<old-task-id>)` コメント残存          | `grep -rn "TODO.*<old-task-id>" apps/ packages/`       | 0 件    |
| 削除済みファイルへの import 残存            | `grep -rn "<deleted_filename>" apps/ --include="*.ts"` | 0 件    |
| TypeScript エラー（旧 API import 残存確認） | `pnpm --filter @repo/desktop typecheck`                | 0 error |

---

## L-W2-03A-005: CI での削除済みテストファイル参照検出ルール（提案）

```bash
# 削除されたテストファイルへの参照がないか確認（CI ステップ候補）
git log --diff-filter=D --name-only -- "*.test.tsx" | \
  xargs -I{} grep -rn "{}" apps/ --include="*.ts" --include="*.tsx"
```

`grep` の集計は `describe.skip` だけでなく `it.skip` / `test.skip` も含む場合があるため、
レポート側の件数ラベルも実際の集計ルールに合わせて明記する。
