# Phase 6: テスト拡充レポート

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| タスクID | TASK-8C-C                          |
| 機能名   | E2Eテスト - インポート・実行フロー |
| 作成日   | 2026-02-02                         |

## テスト拡充サマリー

| カテゴリ     | 拡充前  | 拡充後  | 追加数  |
| ------------ | ------- | ------- | ------- |
| 基本テスト   | 7件     | 7件     | 0件     |
| エッジケース | 0件     | 2件     | 2件     |
| **合計**     | **7件** | **9件** | **2件** |

## 追加テストケース

### TC-8: 無効スキルは表示されない

| 項目           | 内容                                          |
| -------------- | --------------------------------------------- |
| テストケース名 | should not display invalid skills in the list |
| カテゴリ       | Edge Cases                                    |
| 目的           | invalid-skill（SKILL.mdなし）が表示されない   |
| 前提条件       | スキル選択UIが開いている                      |
| 期待結果       | invalid-skillが非表示、test-skillが表示       |

### TC-9: インポート済みスキルの再選択

| 項目           | 内容                                                       |
| -------------- | ---------------------------------------------------------- |
| テストケース名 | should select imported skill without showing import dialog |
| カテゴリ       | Edge Cases                                                 |
| 目的           | インポート済みスキル選択時にダイアログが表示されない       |
| 前提条件       | test-skillがインポート済み                                 |
| 期待結果       | ダイアログなしでスキルが選択される                         |

## テストケース一覧（全9件）

| TC   | テストケース名                                             | フロー         |
| ---- | ---------------------------------------------------------- | -------------- |
| TC-1 | should open import dialog for unimported skill             | Import Flow    |
| TC-2 | should display skill details in import dialog              | Import Flow    |
| TC-3 | should import skill and add to imported list               | Import Flow    |
| TC-4 | should show streaming view when executing                  | Execution Flow |
| TC-5 | should display abort button while executing                | Execution Flow |
| TC-6 | should abort execution when stop button clicked            | Execution Flow |
| TC-7 | should rescan skills when rescan button clicked            | Rescan Flow    |
| TC-8 | should not display invalid skills in the list              | Edge Cases     |
| TC-9 | should select imported skill without showing import dialog | Edge Cases     |

## フロー別テスト数

| フロー         | テスト数 |
| -------------- | -------- |
| Import Flow    | 3件      |
| Execution Flow | 3件      |
| Rescan Flow    | 1件      |
| Edge Cases     | 2件      |
| **合計**       | **9件**  |

## 追加セレクタ

| セレクタ名        | 定義                                | 用途                       |
| ----------------- | ----------------------------------- | -------------------------- |
| skillOptionByText | `role=option:has-text("${text}")`   | 部分一致でのオプション検索 |
| availableSection  | `text="利用可能なスキル"`           | 利用可能セクション         |
| noneOption        | `text="なし（スキルを使用しない）"` | スキルなしオプション       |

## 完了条件確認

| 項目                       | 状態      |
| -------------------------- | --------- |
| 再スキャンフローテスト追加 | ✅        |
| 7件以上のテストケース      | ✅（9件） |
| エッジケーステスト追加     | ✅（2件） |
