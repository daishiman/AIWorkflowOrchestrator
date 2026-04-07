# Phase 4: テストマトリクス

## 作成日

2026-04-07

## 1. artifacts.json スキーマ検証基準

修正後の各 artifacts.json が以下の条件を満たすこと。

| チェック項目                          | 有効値                                                  | 検証コマンド                           |
| ------------------------------------- | ------------------------------------------------------- | -------------------------------------- |
| `status` フィールドが有効な値         | `spec_created` / `in_progress` / `completed` のいずれか | `jq '.status' artifacts.json`          |
| `phases[]` 内の各 `status` が有効な値 | `pending` / `in_progress` / `completed` のいずれか      | `jq '.phases[].status' artifacts.json` |
| `metadata.taskId` が存在する          | 非空文字列                                              | `jq '.metadata.taskId' artifacts.json` |
| `lastUpdated` が修正日以降            | `2026-04-07` 以降の ISO 8601 形式                       | `jq '.lastUpdated' artifacts.json`     |

```bash
# 全対象タスクの一括検証
for f in \
  "docs/30-workflows/completed-tasks/step-09-par-task-p0-01-verify-execution-engine-layer12/artifacts.json" \
  "docs/30-workflows/completed-tasks/step-10-seq-task-p0-02-verify-improve-reverify-closed-loop/artifacts.json" \
  "docs/30-workflows/completed-tasks/step-10-seq-task-p0-04-manifest-loader-default-activation/artifacts.json" \
  "docs/30-workflows/completed-tasks/step-09-par-task-p0-05-execute-skill-file-writer-integration/artifacts.json" \
  "docs/30-workflows/completed-tasks/step-09-par-task-p0-06-conversational-interview-ui/artifacts.json" \
  "docs/30-workflows/completed-tasks/step-10-seq-task-p0-07-hardcoded-agent-names-dynamic-resolution/artifacts.json" \
  "docs/30-workflows/completed-tasks/step-10-seq-task-p0-08-session-resume-renderer-integration/artifacts.json" \
  "docs/30-workflows/completed-tasks/step-10-seq-task-p0-09-claude-sdk-permission-hooks-governance/artifacts.json"; do
  echo "=== $f ==="
  jq '{status: .status, validStatus: (.status == "completed"), taskId: .metadata.taskId}' "$f"
done
```

## 2. リンク整合性チェック基準

| チェック項目                                               | 検証方法                       | 期待結果                                        |
| ---------------------------------------------------------- | ------------------------------ | ----------------------------------------------- |
| `skill-creator-agent-sdk-lane/index.md` の P0 リンクが有効 | リンク先ディレクトリの存在確認 | 全 5 リンクが `completed-tasks/` 配下に存在する |
| `executor-guide.md` 内のリンクが有効                       | ディレクトリ存在確認           | リンク切れなし                                  |

```bash
# skill-creator-agent-sdk-lane/index.md のリンク確認
grep -n "completed-tasks/step-10-seq-task-p0" \
  docs/30-workflows/skill-creator-agent-sdk-lane/index.md
# 期待: 5件の ../completed-tasks/step-10-* パターンがヒットする
```

## 3. ステータス整合性チェック基準

修正完了後に artifacts.json の status と index.md のステータスが一致していること。

| タスクID   | artifacts.json 期待値 | index.md 期待値 |
| ---------- | --------------------- | --------------- |
| TASK-P0-01 | `completed`           | `completed`     |
| TASK-P0-02 | `completed`           | `completed`     |
| TASK-P0-04 | `completed`           | `completed`     |
| TASK-P0-05 | `completed`           | `completed`     |
| TASK-P0-06 | `completed`           | `completed`     |
| TASK-P0-07 | `completed`           | `completed`     |
| TASK-P0-08 | `completed`           | `completed`     |
| TASK-P0-09 | `completed`           | `completed`     |

```bash
# 一括整合性チェック
for dir in \
  "docs/30-workflows/completed-tasks/step-09-par-task-p0-01-verify-execution-engine-layer12" \
  "docs/30-workflows/completed-tasks/step-10-seq-task-p0-02-verify-improve-reverify-closed-loop" \
  "docs/30-workflows/completed-tasks/step-10-seq-task-p0-04-manifest-loader-default-activation" \
  "docs/30-workflows/completed-tasks/step-09-par-task-p0-05-execute-skill-file-writer-integration" \
  "docs/30-workflows/completed-tasks/step-09-par-task-p0-06-conversational-interview-ui" \
  "docs/30-workflows/completed-tasks/step-10-seq-task-p0-07-hardcoded-agent-names-dynamic-resolution" \
  "docs/30-workflows/completed-tasks/step-10-seq-task-p0-08-session-resume-renderer-integration" \
  "docs/30-workflows/completed-tasks/step-10-seq-task-p0-09-claude-sdk-permission-hooks-governance"; do
  json_status=$(jq -r '.status' "$dir/artifacts.json")
  md_status=$(grep "ステータス" "$dir/index.md" | head -1 | sed 's/.*| *//' | sed 's/ *|.*//')
  echo "$(basename $dir): json=$json_status md=$md_status"
done
```

## 4. 合格条件

- [ ] 全 8 タスクの artifacts.json status が `completed`
- [ ] 全 8 タスクの artifacts.json status が標準値の範囲内（非標準値なし）
- [ ] 全 8 タスクの index.md ステータスが `completed`
- [ ] `skill-creator-agent-sdk-lane/index.md` の P0 リンクが `../completed-tasks/` を含む有効なパス
- [ ] `lastUpdated` が `2026-04-07` 以降
