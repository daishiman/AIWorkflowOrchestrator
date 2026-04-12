# Phase 11: 手動テストチェックリスト

## メタ情報

| 項目     | 内容                                 |
| -------- | ------------------------------------ |
| Phase    | 11                                   |
| タスクID | UT-SKILL-WIZARD-CATEGORY-UI-ICON-001 |
| 実行日   | 2026-04-11                           |

---

## Semantic テスト（TC との対応）

| TC ID    | 確認項目                                            | 証跡                            | 結果 |
| -------- | --------------------------------------------------- | ------------------------------- | ---- |
| TC-IC-01 | 各カテゴリボタンにアイコン（絵文字）が表示される    | 自動テスト PASS / SS-01 / SS-04 | PASS |
| TC-IC-02 | アイコンが `aria-hidden="true"` span で包まれている | 自動テスト PASS                 | PASS |
| TC-IC-03 | automation アイコンが "⚡"                          | 自動テスト PASS / SS-02         | PASS |
| TC-IC-04 | external-integration アイコンが "🔗"                | 自動テスト PASS                 | PASS |
| TC-TT-01 | 全ボタンに `title` 属性が設定されている             | 自動テスト PASS / SS-03         | PASS |
| TC-TT-02 | automation の `title` に説明文が含まれる            | 自動テスト PASS / SS-03         | PASS |
| TC-TT-03 | 全5カテゴリの `title` が一意                        | 自動テスト PASS                 | PASS |
| TC-A1-01 | 全ボタンに `aria-label` が設定されている            | 自動テスト PASS                 | PASS |
| TC-A1-02 | `aria-label` がカテゴリ名と一致                     | 自動テスト PASS / SS-02         | PASS |
| TC-EC-01 | category=null で全ボタンが `aria-pressed="false"`   | 自動テスト PASS / SS-01         | PASS |
| TC-EC-02 | 切り替え時 `aria-pressed` が正しく反映              | 自動テスト PASS / SS-02         | PASS |

## スクリーンショット取得状況

| ショット ID | ファイル                           | 状態     |
| ----------- | ---------------------------------- | -------- |
| SS-01       | `screenshots/ss-01-initial.png`    | 保存済み |
| SS-02       | `screenshots/ss-02-automation.png` | 保存済み |
| SS-03       | `screenshots/ss-03-tooltip.png`    | 保存済み |
| SS-04       | `screenshots/ss-04-all-icons.png`  | 保存済み |

> `SS-03` は capture script 内の一時 overlay により tooltip 文言を可視化して保存した。
> DOM 属性検証は既存の自動テスト 41 件 PASS で補完済み。
