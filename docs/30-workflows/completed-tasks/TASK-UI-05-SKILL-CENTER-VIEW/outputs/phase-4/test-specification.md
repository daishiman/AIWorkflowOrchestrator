# Phase 4: テスト仕様書

## メタ情報

| 項目       | 値                                          |
| ---------- | ------------------------------------------- |
| タスク ID  | TASK-UI-05-SKILL-CENTER-VIEW                |
| Phase      | 4                                           |
| 機能名     | SkillCenterView（ツールを探す）             |
| 作成日     | 2026-03-01                                  |
| テスト環境 | happy-dom + Vitest + @testing-library/react |

## テストファイル構成

| ファイル                  | テスト対象         | テストケース数 |
| ------------------------- | ------------------ | -------------- |
| useFeaturedSkills.test.ts | おすすめ選定hook   | 5              |
| useSkillCenter.test.ts    | メインhook         | 10             |
| SkillEmptyState.test.tsx  | ゼロステート       | 4              |
| CategoryTabs.test.tsx     | カテゴリタブ       | 6              |
| SkillCard.test.tsx        | ツールカード       | 7              |
| AddButton.test.tsx        | 追加ボタン         | 9              |
| FeaturedSection.test.tsx  | おすすめセクション | 5              |
| SkillCenterView.test.tsx  | 統合テスト         | 7              |

## 合計: 8ファイル、53テストケース

## テスト戦略

### Pitfall 対策

| Pitfall | 対策                                           |
| ------- | ---------------------------------------------- |
| P31     | 個別セレクタモック使用。合成Hook禁止           |
| P39     | fireEvent使用。userEvent禁止                   |
| P40     | apps/desktopからテスト実行                     |
| P47     | variantStyles Record定数をimportして期待値生成 |

### テストデータ

- createMockSkillMetadata(): テスト用SkillMetadataファクトリ
- createMockImportedSkill(): テスト用ImportedSkillファクトリ

### モックパターン

- vi.mock("../../../store") で個別セレクタをモック
- beforeEachで全モックリセット
- 非同期操作は await act(async () => { ... })

## テストケース詳細

### useFeaturedSkills.test.ts

1. 空配列を渡すと空配列を返す
2. 未追加スキルのみをフィルタリングする
3. 最大3件に制限する
4. maxCount パラメータで件数を制御できる
5. インポート済みスキルは除外される

### useSkillCenter.test.ts

1. 初期状態が正しい
2. handleOpenDetail でDetailPanelが開く
3. handleCloseDetail でDetailPanelが閉じる
4. handleAddSkill がimportSkillを呼び出す
5. handleRequestDelete で削除確認ダイアログが開く
6. handleConfirmDelete がremoveSkillを呼び出す
7. handleCancelDelete で削除確認ダイアログが閉じる
8. filteredSkills がカテゴリでフィルタリングされる
9. filteredSkills がキーワードでフィルタリングされる
10. マウント時にfetchSkillsが呼ばれる

### SkillEmptyState.test.tsx

1. no-skills バリアントでEmptyStateが表示される
2. no-results バリアントで検索キーワードが表示される
3. フィルタークリアボタンがonClearFilterを呼ぶ
4. keyword なしの no-results でデフォルトテキスト

### CategoryTabs.test.tsx

1. 6つのカテゴリタブが表示される
2. 選択中のタブにaria-selected="true"が設定される
3. タブクリックでonCategoryChangeが呼ばれる
4. role="tablist"が設定されている
5. 矢印キーでフォーカスが移動する
6. Enter/Spaceでタブが選択される

### SkillCard.test.tsx

1. スキル名と説明が表示される
2. 未追加時にAddButtonが「追加する」状態で表示される
3. 追加済み時にAddButtonが「追加済み!」状態で表示される
4. カードクリックでonSelectが呼ばれる
5. 追加ボタンクリックでonAddが呼ばれる
6. フォーカスリングが表示される
7. 説明文が1行で切り捨てられる

### AddButton.test.tsx

1. idle状態で「追加する」テキストが表示される
2. idle状態でaddButtonStyles.idleスタイル適用
3. processing状態でスピナーが表示される
4. processing状態でaria-busy="true"設定
5. success状態で「追加済み!」テキスト表示
6. success状態でaddButtonStyles.successスタイル適用
7. クリックでonAddが呼ばれる
8. isAdded=trueで無効化される
9. featured サイズ対応

### FeaturedSection.test.tsx

1. 「おすすめ」ヘッダーが表示される
2. スキルカードが最大3枚表示される
3. 空配列で非表示になる
4. onAddが正しいskillNameで呼ばれる
5. onSelectが正しいskillNameで呼ばれる

### SkillCenterView.test.tsx

1. skill-center-viewが表示される
2. 「ツールを探す」ヘッダー
3. ローディング中にスケルトン
4. エラー時にエラーメッセージ
5. ツール一覧表示
6. EmptyState表示
7. 件数表示

## 完了条件

- [x] 8テストファイルが作成されている
- [x] 全テストケースがRed状態（実装なしで失敗する）
- [x] P31/P39/P40/P47 対策が適用されている
- [x] テストデータファクトリが定義されている
