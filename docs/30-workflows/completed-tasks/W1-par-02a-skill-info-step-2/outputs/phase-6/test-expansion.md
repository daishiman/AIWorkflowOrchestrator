# Phase 6 成果物: テスト拡充

## タスクID: UT-SKILL-WIZARD-W1-SKILL-INFO-STEP-001

## 追加テストケース（TC-10〜TC-22）

| TC    | 対象                               | 内容                                                                   | 結果 |
| ----- | ---------------------------------- | ---------------------------------------------------------------------- | ---- |
| TC-10 | 目的の blur バリデーション         | 目的が 10 文字未満で blur したときにエラーメッセージが出る             | PASS |
| TC-11 | 目的が10文字以上のときエラー非表示 | エラーが表示されないことを確認                                         | PASS |
| TC-12 | カテゴリ再クリック                 | 選択中カテゴリを再クリックしても `onFormDataChange` が余計に呼ばれない | PASS |
| TC-13 | skillName の任意性                 | `skillName` が空でも `purpose` と `category` が揃えば Next が有効      | PASS |
| TC-14 | 境界値: ちょうど10文字             | 目的がちょうど10文字のとき「次へ」ボタンは有効                         | PASS |
| TC-15 | 境界値: 空白のみ10文字             | 目的が空白のみ10文字のとき「次へ」ボタンは無効                         | PASS |
| TC-16 | aria-pressed: 選択中               | 選択中カテゴリタグに `aria-pressed=true` が付与される                  | PASS |
| TC-17 | aria-pressed: 未選択               | 未選択カテゴリタグに `aria-pressed=false` が付与される                 | PASS |
| TC-18 | external-integration 伝達          | `external-integration` を選択すると `formData.category` が更新される   | PASS |
| TC-19 | スキル名変更コールバック           | スキル名変更時に `onFormDataChange` が呼ばれる                         | PASS |
| TC-20 | アクセシビリティ: role=group       | カテゴリグループに `role=group` と `aria-label` が付与されている       | PASS |
| TC-21 | カバレッジ補完: blur エラー        | `purposeTouched=true` のときエラーが表示される                         | PASS |
| TC-22 | カバレッジ補完: 全5カテゴリ選択    | 全5カテゴリを順番に選択できる                                          | PASS |

## テスト総数（Phase 6 完了時点）

- 合計: 26テスト全PASS
