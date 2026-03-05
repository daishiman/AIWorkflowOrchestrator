# Phase 2 テスト設計連携メモ: 自動修正可能フィルタボタン

## メタ情報

| 項目     | 内容              |
| -------- | ----------------- |
| タスクID | UT-TASK-10A-B-001 |
| Phase    | 2                 |
| 作成日   | 2026-03-05        |
| SubAgent | C（Quality）      |

## Phase 4 へ渡すテストID

| テストID | レイヤー          | 観点                                        |
| -------- | ----------------- | ------------------------------------------- |
| TC-4-01  | SuggestionList    | 一括選択ボタンが表示される                  |
| TC-4-02  | SuggestionList    | クリックで `onSelectAutoFixable` が呼ばれる |
| TC-4-03  | SuggestionList    | auto-fixable 0件で disabled                 |
| TC-4-04  | SkillAnalysisView | 一括選択後に auto-fixable のみが選択される  |
| TC-4-05  | SkillAnalysisView | 一括選択後の適用が該当提案のみで呼ばれる    |
| TC-4-06  | SkillAnalysisView | 既存個別選択が維持される                    |

## 境界ケース

- 提案0件（空状態表示）
- 全件 `autoFixable=false`
- true/false 混在
- 既存選択あり状態からの再実行（上書き）

## 完了基準（Phase 3 レビュー入力）

- UI/State/API 境界の設計差分が明文化されている。
- テストで検証すべき期待値が「選択Set」と「API引数」に分解されている。
