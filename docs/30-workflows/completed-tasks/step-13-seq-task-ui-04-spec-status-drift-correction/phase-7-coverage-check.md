# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 7                                   |
| Phase名    | カバレッジ確認                      |
| 機能名     | spec-status-drift-correction        |
| 対象機能   | TASK-UI-04 仕様書ステータス乖離修正 |
| 前提Phase  | Phase 6: テスト拡充                 |
| 次Phase    | Phase 8: リファクタリング           |
| ステータス | completed                           |
| 作成日     | 2026-04-06                          |

## 目的

全タスクの状態整合性を横断的に確認し、修正漏れがないことを保証する。

## 実行タスク

- 詳細は以下の Task 1〜3 に従って実行する。

### Task 1: 全タスク横断カバレッジマトリクス

Phase 1 で特定した全対象タスクについて、以下の項目が完了しているか一覧で確認する。

| タスクID   | artifacts.json 更新 | index.md 更新 | completed-tasks 移動 | 残作業記録 | リンク整合 | 判定 |
| ---------- | ------------------- | ------------- | -------------------- | ---------- | ---------- | ---- |
| TASK-P0-01 | -                   | -             | -                    | N/A        | -          | -    |
| TASK-P0-02 | -                   | -             | -                    | N/A        | -          | -    |
| TASK-P0-04 | -                   | -             | -                    | N/A        | -          | -    |
| TASK-P0-05 | -                   | -             | -                    | N/A        | -          | -    |
| TASK-P0-06 | -                   | -             | -                    | N/A        | -          | -    |
| TASK-P0-07 | -                   | -             | -                    | -          | -          | -    |
| TASK-P0-08 | -                   | -             | -                    | -          | -          | -    |
| TASK-P0-09 | -                   | -             | -                    | N/A        | -          | -    |

### Task 2: AC 対応表

受入条件の各項目が充足されているか確認する。

| AC   | 条件                                      | 充足状態 | 根拠               |
| ---- | ----------------------------------------- | -------- | ------------------ |
| AC-1 | 全 artifacts.json status が実装状態と一致 | -        | Phase 5 実装記録   |
| AC-2 | 完了タスクが completed-tasks/ へ移動済み  | -        | Phase 5 移動記録   |
| AC-3 | 部分完了タスクに残作業記録がある          | -        | Phase 5 残作業記録 |
| AC-4 | 親 index.md が最新状態を反映              | -        | Phase 5 更新記録   |
| AC-5 | executor-guide.md が更新されている        | -        | Phase 5 更新記録   |

### Task 3: 漏れタスクの確認

Phase 1 の調査対象に含まれていなかったが、同様の乖離がある可能性のあるタスクがないか最終確認する。

```bash
# 全タスク仕様書を再スキャンし、Phase 1 で未検出の乖離がないか確認
for f in $(find docs/30-workflows/ -name "artifacts.json" -not -path "*/outputs/*"); do
  taskId=$(jq -r '.metadata.taskId // "N/A"' "$f")
  status=$(jq -r '.status' "$f")
  echo "$taskId: $status ($f)"
done
```

## 参照資料

| 資料名           | パス                                        | 説明         |
| ---------------- | ------------------------------------------- | ------------ |
| 乖離インベントリ | `outputs/phase-1/status-drift-inventory.md` | 元の調査結果 |
| 実装記録         | `outputs/phase-5/implementation-record.md`  | 修正内容     |
| テスト拡充記録   | `outputs/phase-6/test-expansion.md`         | 検証結果     |

## 統合テスト連携

- `artifacts.json` / `outputs/artifacts.json` / `index.md` の status 整合を維持する。
- Phase 11 の `manual-test-result.md` へ確認結果を引き継ぐ。
- Phase 12 の `implementation-guide.md` と `documentation-changelog.md` に更新理由と差分を反映する。

## 成果物

| 成果物             | パス                                 | 説明                                        |
| ------------------ | ------------------------------------ | ------------------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 全タスク横断カバレッジマトリクス、AC 対応表 |

## 完了条件

- [ ] 全タスク横断カバレッジマトリクスが完成している
- [ ] AC-1〜AC-5 の充足状態が確認されている
- [ ] 漏れタスクがないことが確認されている
- [ ] 修正漏れがあれば Phase 5 にフィードバックされている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 8: リファクタリング](./phase-8-refactoring.md)
