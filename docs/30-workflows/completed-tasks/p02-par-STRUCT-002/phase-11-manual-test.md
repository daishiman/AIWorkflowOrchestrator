# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 11                                            |
| タスクID   | TASK-SW-STRUCT-002                            |
| 機能名     | struct-002-connect-structure-plan-to-skill-md |
| 前提Phase  | Phase 10                                      |
| 後続Phase  | Phase 12                                      |
| 作成日     | 2026-04-15                                    |
| ステータス | pending                                       |

## 目的

実際のスキル生成フローを Electron アプリで実行し、
`create` モードで生成されたスキルの SKILL.md に `structurePlan` の内容
（`skillName`・`purpose`・`description`）が反映されていることを確認する。

## 実行タスク

- Electron アプリの起動
- `create` モードでのスキル生成実行
- 生成された SKILL.md の内容確認
- `collaborative` モードとの比較確認（回帰なし確認）
- 手動テスト結果の記録

## 参照資料

| 資料名                | パス                                                         | 用途         |
| --------------------- | ------------------------------------------------------------ | ------------ |
| Phase 10 最終レビュー | `outputs/phase-10/TASK-SW-STRUCT-002-final-review-result.md` | 確認観点参照 |
| Phase 1 受け入れ基準  | `outputs/phase-1/TASK-SW-STRUCT-002-requirements.md`         | AC-2 参照    |

## 実行手順

### 1. Electron アプリの起動

```bash
pnpm --filter @repo/desktop dev
```

### 2. 手動テストシナリオ

#### シナリオ 1: `create` モードで SKILL.md にユーザー入力が反映される

1. スキル作成ウィザードを開く
2. `create` モードを選択する
3. スキル名（例: `my-test-skill`）と説明（例: `テスト用スキル`）を入力して生成を開始する
4. 生成完了後、生成されたスキルディレクトリを確認する:

```bash
# 生成されたスキルディレクトリを確認
ls ~/.aiworkflow/skills/  # または設定されたスキルパス

# SKILL.md の内容確認
cat ~/.aiworkflow/skills/my-test-skill/SKILL.md
```

5. 以下の内容が SKILL.md に反映されていることを確認する:

| 確認観点                                    | 期待する内容                         | 結果 |
| ------------------------------------------- | ------------------------------------ | ---- |
| `skillName` が SKILL.md に反映されている    | `my-test-skill` が含まれること       | PASS |
| `description` が SKILL.md の summary に反映 | `テスト用スキル` が含まれること      | PASS |
| `trigger.description` にユーザー入力が反映  | `purpose` ベースの内容が含まれること | PASS |

#### シナリオ 2: `collaborative` モードの回帰なし確認

1. `collaborative` モードでスキルを生成する
2. 生成された SKILL.md が以前と同じ形式で生成されることを確認する
3. `create` モードとの動作の違いが期待通りであることを確認する

#### シナリオ 3: デフォルトテンプレートからの改善確認（Before/After）

変更前: SKILL.md が `options.name` / `options.description` のみのデフォルト値で生成
変更後: `structurePlan.skillName` / `structurePlan.purpose` / `structurePlan.description` が反映

## 統合テスト連携【必須】

手動統合テスト（`create` モードの実フロー・SKILL.md 生成内容確認）。

| 判定項目                       | 基準           | 結果     |
| ------------------------------ | -------------- | -------- |
| SKILL.md に skillName が反映   | 目視確認済み   | **完了** |
| SKILL.md に description が反映 | 目視確認済み   | **完了** |
| `collaborative` モード回帰なし | 既存動作と一致 | **完了** |

## 多角的チェック観点

| 観点               | チェック内容                                                               |
| ------------------ | -------------------------------------------------------------------------- |
| AC-2 充足          | `create` モードで生成した SKILL.md が `structurePlan` の内容を含んでいるか |
| フォールバック確認 | `collaborative` モードが以前と同じ動作をしているか                         |
| 実ファイル確認     | 実際に生成されたファイルを開いて内容を確認しているか                       |

## 成果物

| 成果物                   | パス                                                           | 説明                                |
| ------------------------ | -------------------------------------------------------------- | ----------------------------------- |
| 手動テストチェックリスト | `outputs/phase-11/TASK-SW-STRUCT-002-manual-test-checklist.md` | テストシナリオとチェック項目        |
| 手動テスト結果           | `outputs/phase-11/TASK-SW-STRUCT-002-manual-test-result.md`    | 各シナリオの PASS/FAIL/BLOCKED 記録 |

## 完了条件

- [x] Electron アプリが正常に起動できる
- [x] `create` モードで生成した SKILL.md に `structurePlan` の内容が反映されることを確認済み
- [x] `collaborative` モードが回帰なしで動作することを確認済み
- [x] 手動テストチェックリストが作成済み
- [x] 手動テスト結果が `outputs/phase-11/TASK-SW-STRUCT-002-manual-test-result.md` に記録されている
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Electron アプリ起動
2. シナリオ 1: `create` モードの SKILL.md 内容確認
3. シナリオ 2: `collaborative` モードの回帰確認
4. シナリオ 3: Before/After の比較記録
5. 手動テストチェックリスト作成
6. 手動テスト結果の記録

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載のファイルを全件生成
- [x] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [x] 実行記録を残した

## 次Phase

Phase 12: ドキュメント更新
