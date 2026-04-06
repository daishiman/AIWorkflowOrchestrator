# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 6                                   |
| Phase名    | テスト拡充                          |
| 機能名     | spec-status-drift-correction        |
| 対象機能   | TASK-UI-04 仕様書ステータス乖離修正 |
| 前提Phase  | Phase 5: 実装                       |
| 次Phase    | Phase 7: カバレッジ確認             |
| ステータス | pending                             |
| 作成日     | 2026-04-06                          |

## 目的

Phase 5 で実施した修正に対して、リンク切れ確認と相互参照整合性の拡充チェックを行う。

## 実行タスク

### Task 1: リンク切れ確認

修正・移動後の全ドキュメントに対してリンク切れがないか確認する。

```bash
# 全 Markdown ファイルの相対リンクを抽出し、リンク先の存在を確認
for md in $(find docs/30-workflows/ -name "*.md"); do
  dir=$(dirname "$md")
  grep -oP '\]\(\./[^)]+\)' "$md" | while read -r link; do
    target=$(echo "$link" | sed 's/\](\.\///' | sed 's/)//')
    if [ ! -f "$dir/$target" ]; then
      echo "BROKEN: $md -> $target"
    fi
  done
done
```

### Task 2: 相互参照整合性

タスク間の相互参照（依存タスクへのリンク、upstream/downstream 参照）が正しいか確認する。

確認対象:

- 各タスクの index.md 依存関係テーブル内のリンク
- executor-guide.md のタスク一覧内のリンク
- 親 index.md のタスク一覧内のリンク

```bash
# 旧パスへの参照が残っていないか確認（completed-tasks 移動後）
grep -rn "step-10-seq-task-p0-" docs/30-workflows/skill-creator-agent-sdk-lane/ --include="*.md" | grep -v "completed-tasks"
```

### Task 3: artifacts.json 間の依存関係整合性

各 artifacts.json の `metadata.dependsOnTasks` が参照先タスクの存在するディレクトリを正しく指しているか確認する。

### Task 4: ステータス値の有効性確認

全 artifacts.json の status および phases の各 status が有効な値（`spec_created`, `in_progress`, `completed`, `pending`）であることを確認する。

```bash
# 全 artifacts.json の status 値を検証
for f in $(find docs/30-workflows/ -name "artifacts.json" -not -path "*/outputs/*"); do
  status=$(jq -r '.status' "$f")
  case "$status" in
    spec_created|in_progress|completed) echo "OK: $f ($status)" ;;
    *) echo "INVALID: $f ($status)" ;;
  esac
done
```

## 参照資料

| 資料名           | パス                                       | 説明           |
| ---------------- | ------------------------------------------ | -------------- |
| 実装記録         | `outputs/phase-5/implementation-record.md` | 変更内容の参照 |
| テストマトリクス | `outputs/phase-4/test-matrix.md`           | 検証基準       |

## 成果物

| 成果物         | パス                                | 説明                               |
| -------------- | ----------------------------------- | ---------------------------------- |
| テスト拡充記録 | `outputs/phase-6/test-expansion.md` | リンク切れ結果、相互参照整合性結果 |

## 完了条件

- [ ] 全ドキュメントのリンク切れが確認されている
- [ ] 相互参照の整合性が確認されている
- [ ] artifacts.json 間の依存関係が整合している
- [ ] ステータス値の有効性が確認されている
- [ ] 修正が必要な箇所があれば Phase 5 にフィードバックされている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 7: カバレッジ確認](./phase-7-coverage-check.md)
