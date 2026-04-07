# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 4                                   |
| Phase名    | テスト作成                          |
| 機能名     | spec-status-drift-correction        |
| 対象機能   | TASK-UI-04 仕様書ステータス乖離修正 |
| 前提Phase  | Phase 3: 設計レビュー               |
| 次Phase    | Phase 5: 実装                       |
| ステータス | pending                             |
| 作成日     | 2026-04-07                          |

## 目的

artifacts.json スキーマの検証基準とリンク整合性チェックの基準を定義する。本タスクはドキュメント修正タスクのため、コードテストではなくドキュメント品質の検証マトリクスを作成する。

## 実行タスク

### Task 1: artifacts.json スキーマ検証基準

各 artifacts.json が以下のスキーマに準拠しているか検証するチェックリストを作成する。

```bash
# artifacts.json の必須フィールド検証
for f in $(find docs/30-workflows/skill-creator-agent-sdk-lane/step-* -name "artifacts.json" -not -path "*/outputs/*"); do
  echo "=== $f ==="
  jq '{
    has_feature: has("feature"),
    has_status: has("status"),
    has_phases: has("phases"),
    has_metadata: has("metadata"),
    status: .status,
    taskId: .metadata.taskId
  }' "$f"
done
```

検証項目:

| 項目                              | 検証方法                                              |
| --------------------------------- | ----------------------------------------------------- |
| status フィールドが有効な値である | `spec_created`, `in_progress`, `completed` のいずれか |
| phases の各 status が有効である   | `pending`, `in_progress`, `completed` のいずれか      |
| metadata.taskId が存在する        | 非空文字列                                            |
| lastUpdated が更新されている      | 修正日以降の日時                                      |

### Task 2: リンク整合性チェック基準

ドキュメント間のリンクが正しく解決されるか検証するチェックリストを作成する。

```bash
# Markdown 内のリンク先が実在するか確認
grep -roh '\[.*\](\.\/[^)]*)\|\[.*\](\.\./[^)]*)' docs/30-workflows/skill-creator-agent-sdk-lane/step-*/index.md | sort -u
```

検証項目:

| 項目                               | 検証方法                         |
| ---------------------------------- | -------------------------------- |
| index.md からの相対リンクが有効    | リンク先ファイルの存在確認       |
| executor-guide.md のリンクが有効   | 移動後のパスでリンク先が存在する |
| completed-tasks 移動後のリンク切れ | 旧パスへの参照が残っていない     |

### Task 3: ステータス整合性チェック基準

artifacts.json の status と index.md のステータスが一致しているか検証するチェックリストを作成する。

| 項目                                        | 検証方法                                            |
| ------------------------------------------- | --------------------------------------------------- |
| artifacts.json status = index.md ステータス | 両方から抽出して突合                                |
| completed タスクの全 phase が completed     | phases 内の status を全件確認                       |
| in_progress タスクに pending phase がある   | 少なくとも1つの phase が pending または in_progress |

## 参照資料

| 資料名           | パス                                    | 説明               |
| ---------------- | --------------------------------------- | ------------------ |
| 修正計画         | `outputs/phase-2/correction-plan.md`    | 検証対象の修正内容 |
| 設計レビュー結果 | `outputs/phase-3/design-review-gate.md` | レビュー指摘事項   |

## 成果物

| 成果物           | パス                             | 説明                                   |
| ---------------- | -------------------------------- | -------------------------------------- |
| テストマトリクス | `outputs/phase-4/test-matrix.md` | スキーマ検証・リンク整合性チェック基準 |

## 完了条件

- [ ] artifacts.json スキーマ検証基準が定義されている
- [ ] リンク整合性チェック基準が定義されている
- [ ] ステータス整合性チェック基準が定義されている
- [ ] 各検証基準が具体的なコマンドまたは手順で実行可能である
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 5: 実装](./phase-5-implementation.md)
