# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                     |
| ------ | -------------------------------------- |
| Phase  | 4                                      |
| 機能名 | claude-sdk-permission-hooks-governance |
| 作成日 | 2026-03-29                             |

## 目的

permission policy と hook 実行順のテストケースを定義する。

## 実行タスク

- phase 別 tool allow / deny ケース作成
- `canUseTool` callback ケース作成
- hook 呼び出し順ケース作成

## 参照資料

| 資料名  | パス                      | 説明 |
| ------- | ------------------------- | ---- |
| Phase 1 | `phase-1-requirements.md` | 要件 |

## 実行手順

### ステップ1: allow / deny ケースを列挙する

- plan / execute / verify / improve ごとに許可・拒否条件を洗い出す
- `canUseTool` の判定ケースを含める

### ステップ2: hook 呼び出し順を列挙する

- SessionStart / PreToolUse / PostToolUse / SessionEnd の順序を確認する

### ステップ3: expected result を固定する

- 期待される permission denial
- 期待される audit event
- 期待される UI 表示

| ケース  | コマンド / 操作          | 期待結果                   |
| ------- | ------------------------ | -------------------------- |
| plan    | read-only で tool を使う | write 系は拒否される       |
| execute | 生成対象外へ write       | deny される                |
| verify  | test / lint 実行         | audit に残る               |
| improve | 限定 edit                | scope 外 edit は拒否される |

## 成果物

| 成果物      | パス                             | 説明       |
| ----------- | -------------------------------- | ---------- |
| test matrix | `outputs/phase-4/test-matrix.md` | テスト一覧 |

## 完了条件

- [x] governance テストケースが列挙されている
- [x] **本Phase内の全タスクを100%実行完了**

## 統合テスト連携

- Phase 5 の実装でそのまま使える command suite と expected result を固定する
- denial と hook の順序が UI / audit で追えることを前提にする

## 多角的チェック観点（AIが判断）

- allow / deny が phase ごとに MECE になっているか
- hook の順序が contract と一致しているか
- 想定外の tool request を漏らしていないか

## サブタスク管理

| SubAgent   | 責務                 |
| ---------- | -------------------- |
| SubAgent-A | allow / deny ケース  |
| SubAgent-B | hook 順序ケース      |
| SubAgent-C | expected result 整理 |

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] artifacts.jsonが更新されている
- [x] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

Phase 5: 実装
