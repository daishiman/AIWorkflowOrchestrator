# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 3                                   |
| Phase名    | 設計レビューゲート                  |
| 機能名     | spec-status-drift-correction        |
| 対象機能   | TASK-UI-04 仕様書ステータス乖離修正 |
| 前提Phase  | Phase 2: 設計                       |
| 次Phase    | Phase 4: テスト作成                 |
| ステータス | pending                             |
| 作成日     | 2026-04-06                          |

## 目的

修正計画と completed-tasks 移動計画の妥当性を確認し、実行に移す前のゲート判定を行う。

## 実行タスク

### Task 1: 修正計画の妥当性確認

- 各タスクの「推奨アクション」が Phase 1 の調査結果と整合しているか確認する
- status 変更が実際のコード実装状態を正確に反映しているか確認する
- 部分完了タスクの残作業記録が具体的かつ実行可能であるか確認する

### Task 2: completed-tasks 移動計画の検証

- 移動対象ディレクトリの一覧が正確であるか確認する
- 相互参照リンクの影響範囲が網羅されているか確認する
- `completed-tasks/` ディレクトリの存在・構造を確認する

```bash
# completed-tasks ディレクトリの確認
ls -la docs/30-workflows/completed-tasks/ 2>/dev/null || echo "ディレクトリ未作成"

# 移動対象タスクへの参照箇所の洗い出し
grep -rn "step-10-seq-task-p0-" docs/30-workflows/skill-creator-agent-sdk-lane/ --include="*.md" | grep -v "outputs/"
```

### Task 3: executor-guide.md 更新の整合性確認

- タスク一覧テーブルの更新内容が修正計画と一致しているか確認する
- リンク先が移動後のパスに正しく更新される計画になっているか確認する

### Task 4: ゲート判定

| 判定     | 条件                             | アクション            |
| -------- | -------------------------------- | --------------------- |
| PASS     | 全項目が妥当                     | Phase 4 へ進む        |
| MINOR    | 軽微な修正で対応可能             | 修正後 Phase 4 へ進む |
| MAJOR    | 修正計画に重大な欠陥がある       | Phase 2 へ差し戻す    |
| CRITICAL | スコープ定義に根本的な問題がある | Phase 1 へ差し戻す    |

## 参照資料

| 資料名               | パス                                        | 説明         |
| -------------------- | ------------------------------------------- | ------------ |
| 修正計画             | `outputs/phase-2/correction-plan.md`        | レビュー対象 |
| 乖離インベントリ     | `outputs/phase-1/status-drift-inventory.md` | 根拠データ   |
| ステータス抽出マップ | `outputs/phase-1/spec-extraction-map.md`    | 根拠データ   |

## 成果物

| 成果物           | パス                                    | 説明                     |
| ---------------- | --------------------------------------- | ------------------------ |
| 設計レビュー結果 | `outputs/phase-3/design-review-gate.md` | ゲート判定結果と指摘事項 |

## 完了条件

- [ ] 修正計画の妥当性が確認されている
- [ ] completed-tasks 移動計画が検証されている
- [ ] executor-guide.md 更新の整合性が確認されている
- [ ] ゲート判定（PASS/MINOR/MAJOR/CRITICAL）が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 4: テスト作成](./phase-4-test-creation.md)
