# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 9                                   |
| Phase名    | 品質保証                            |
| 機能名     | spec-status-drift-correction        |
| 対象機能   | TASK-UI-04 仕様書ステータス乖離修正 |
| 前提Phase  | Phase 8: リファクタリング           |
| 次Phase    | Phase 10: 最終レビュー              |
| ステータス | pending                             |
| 作成日     | 2026-04-07                          |

## 目的

全タスク横断の整合性最終確認を行い、品質保証レポートを作成して最終レビューへの入力とする。

## 実行タスク

### Task 1: 全タスク整合性最終確認

Phase 5〜8 の全修正が正しく適用されているか、最終的な横断チェックを行う。

```bash
# 全 artifacts.json の最終状態を一覧
for f in $(find docs/30-workflows/ -name "artifacts.json" -not -path "*/outputs/*"); do
  taskId=$(jq -r '.metadata.taskId // "N/A"' "$f")
  status=$(jq -r '.status' "$f")
  updated=$(jq -r '.lastUpdated' "$f")
  echo "$taskId | $status | $updated | $f"
done | sort
```

### Task 2: artifacts.json と index.md の整合性確認

全タスクについて、artifacts.json の status と index.md のステータス行が一致しているか確認する。

```bash
# artifacts.json の status と index.md のステータスを突合
for dir in $(find docs/30-workflows/skill-creator-agent-sdk-lane/step-* docs/30-workflows/completed-tasks/step-* -maxdepth 0 -type d 2>/dev/null); do
  if [ -f "$dir/artifacts.json" ] && [ -f "$dir/index.md" ]; then
    json_status=$(jq -r '.status' "$dir/artifacts.json")
    md_status=$(grep "ステータス" "$dir/index.md" | head -1 | awk -F'|' '{print $3}' | xargs)
    if [ "$json_status" != "$md_status" ]; then
      echo "MISMATCH: $dir (json=$json_status, md=$md_status)"
    else
      echo "OK: $dir ($json_status)"
    fi
  fi
done
```

### Task 3: completed タスクの phases 整合性

completed ステータスのタスクについて、全 phase が completed であることを確認する。

```bash
# completed タスクの phases 内に pending/in_progress が残っていないか確認
for f in $(find docs/30-workflows/ -name "artifacts.json" -not -path "*/outputs/*"); do
  status=$(jq -r '.status' "$f")
  if [ "$status" = "completed" ]; then
    pending=$(jq '[.phases[].status] | map(select(. != "completed")) | length' "$f")
    if [ "$pending" -gt 0 ]; then
      echo "INCOMPLETE_PHASES: $f (non-completed phases: $pending)"
    fi
  fi
done
```

### Task 4: リンク切れ最終チェック

Phase 6 で実施したリンク切れチェックを再実行し、Phase 8 のリファクタリングで新たなリンク切れが発生していないことを確認する。

### Task 5: 品質スコアリング

| 品質項目                         | 基準                                     | 結果 |
| -------------------------------- | ---------------------------------------- | ---- |
| artifacts.json スキーマ準拠率    | 100%                                     | -    |
| status 整合率                    | 100%（json と md が一致）                | -    |
| リンク整合率                     | 100%（リンク切れゼロ）                   | -    |
| completed タスクの phases 完全性 | 100%（全 phase が completed）            | -    |
| 残作業記録の具体性               | 部分完了タスクに actionable な記録がある | -    |

## 参照資料

| 資料名               | パス                                 | 説明           |
| -------------------- | ------------------------------------ | -------------- |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md` | 品質確認の入力 |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md` | 修正後の状態   |
| テストマトリクス     | `outputs/phase-4/test-matrix.md`     | 検証基準       |

## 成果物

| 成果物           | パス                           | 説明                           |
| ---------------- | ------------------------------ | ------------------------------ |
| 品質保証レポート | `outputs/phase-9/qa-report.md` | 品質スコアリング結果、指摘事項 |

## 完了条件

- [ ] 全タスクの整合性が最終確認されている
- [ ] artifacts.json と index.md の整合性が確認されている
- [ ] completed タスクの phases が全て completed である
- [ ] リンク切れが発生していないことが確認されている
- [ ] 品質スコアリングが完了している
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 10: 最終レビュー](./phase-10-final-review.md)
