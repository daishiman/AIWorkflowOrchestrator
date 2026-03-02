# 受け入れ基準: SkillAnalysisView

## メタ情報

| 項目     | 値         |
| -------- | ---------- |
| タスクID | TASK-10A-B |
| 作成日   | 2026-03-02 |
| Phase    | 1          |

---

## AC-1: スキル分析実行（FR-1）

```gherkin
Scenario: 分析ボタンクリックによるスキル分析の実行
  Given SkillAnalysisView が表示されている
  And スキル名が "test-skill" である
  When ユーザーが「分析」ボタンをクリックする
  Then ローディングスピナーが表示される
  And 「分析」ボタンがdisabled状態になる
  And window.electronAPI.skill.analyze("test-skill") が呼び出される

Scenario: 分析結果の正常受信と表示
  Given 分析APIが SkillAnalysis オブジェクトを返却した
  When 分析結果が返却される
  Then ローディングスピナーが非表示になる
  And 「分析」ボタンがenabled状態に戻る
  And 総合スコアが画面に表示される
  And カテゴリ別スコアが画面に表示される
  And 改善提案リストが画面に表示される
  And リスク情報が画面に表示される
```

## AC-2: 総合スコア表示（FR-2-1, FR-2-2）

```gherkin
Scenario: 高スコア（80-100）の成功色表示
  Given 分析結果の overallScore が 85 である
  When 分析結果が表示される
  Then スコア値「85」が表示される
  And 成功色（--status-success）のインジケータが表示される

Scenario: 中スコア（60-79）の警告色表示
  Given 分析結果の overallScore が 65 である
  When 分析結果が表示される
  Then スコア値「65」が表示される
  And 警告色（--status-warning）のインジケータが表示される

Scenario: 低スコア（0-59）のエラー色表示
  Given 分析結果の overallScore が 40 である
  When 分析結果が表示される
  Then スコア値「40」が表示される
  And エラー色（--status-error）のインジケータが表示される

Scenario: 境界値（80）の色分け確認
  Given 分析結果の overallScore が 80 である
  When 分析結果が表示される
  Then スコア値「80」が表示される
  And 成功色（--status-success）のインジケータが表示される

Scenario: 境界値（60）の色分け確認
  Given 分析結果の overallScore が 60 である
  When 分析結果が表示される
  Then スコア値「60」が表示される
  And 警告色（--status-warning）のインジケータが表示される

Scenario: 境界値（0）の色分け確認
  Given 分析結果の overallScore が 0 である
  When 分析結果が表示される
  Then スコア値「0」が表示される
  And エラー色（--status-error）のインジケータが表示される
```

## AC-3: カテゴリ別スコア表示（FR-2-3, FR-2-4）

```gherkin
Scenario: 複数カテゴリの水平バーチャート表示
  Given 分析結果に3つのカテゴリが含まれる
  When 分析結果が表示される
  Then 3つのカテゴリが水平バーチャート形式で表示される
  And 各カテゴリにカテゴリ名が表示される
  And 各カテゴリにスコア値（0-100）が表示される
  And 各カテゴリに詳細テキストが表示される
  And 課題がある場合は課題リストが表示される

Scenario: カテゴリに課題がない場合
  Given 分析結果のカテゴリに issues が空配列である
  When 分析結果が表示される
  Then 課題リストのセクションは表示されない
```

## AC-4: 改善提案リスト表示（FR-2-5, FR-2-6）

```gherkin
Scenario: 優先度別グループ化表示
  Given 分析結果に high:2件, medium:3件, low:1件 の提案が含まれる
  When 分析結果が表示される
  Then 提案が優先度別（high → medium → low）にグループ化されて表示される
  And 各提案にタイプアイコンが表示される
  And 各提案に優先度バッジ（high/medium/low）が表示される
  And 各提案に説明文が表示される
  And autoFixable=true の提案には「自動修正可能」マークが表示される

Scenario: 自動修正不可能な提案の表示
  Given 提案の autoFixable が false である
  When 分析結果が表示される
  Then 「自動修正可能」マークは表示されない
```

## AC-5: リスク情報表示（FR-2-7, FR-2-8）

```gherkin
Scenario: リスクレベル別の色分け表示
  Given 分析結果に critical:1件, high:1件, medium:2件, low:1件 のリスクが含まれる
  When 分析結果が表示される
  Then リスクがレベル別に色分けされて表示される
  And critical リスクはエラー色（--status-error）で表示される
  And high リスクは警告色（--status-warning）で表示される
  And medium リスクは情報色（--status-info）で表示される
  And low リスクはテキスト色（--text-secondary）で表示される
  And 各リスクにカテゴリ、レベル、説明、影響が表示される

Scenario: 緩和策がある場合の表示
  Given リスク情報に mitigation（緩和策）が設定されている
  When 分析結果が表示される
  Then 緩和策が表示される

Scenario: 緩和策がない場合の表示
  Given リスク情報に mitigation が未設定である
  When 分析結果が表示される
  Then 緩和策のセクションは表示されない
```

## AC-6: 改善提案の選択・適用（FR-3-1, FR-3-3, FR-3-4, FR-3-5, FR-3-6）

```gherkin
Scenario: 提案の個別選択
  Given 分析結果に5件の改善提案が表示されている
  When ユーザーが2件の提案のチェックボックスをオンにする
  Then 選択された提案のチェックボックスがオン状態になる
  And 「選択した提案を適用」ボタンが有効になる

Scenario: 選択した提案の適用実行
  Given ユーザーが2件の提案を選択している
  When ユーザーが「選択した提案を適用」ボタンをクリックする
  Then ボタンがdisabled状態になりローディングインジケータが表示される
  And applyImprovements("test-skill", [選択された2件]) が呼び出される

Scenario: 適用結果の通知と再取得
  Given APIが適用結果を返却した（適用:1件, スキップ:0件, エラー:1件）
  When 適用結果が返却される
  Then トースト通知に「1件適用、1件エラー」が表示される
  And 分析結果が自動で再取得される
  And 画面が更新される

Scenario: 提案未選択時のボタン状態
  Given 改善提案が1件も選択されていない
  Then 「選択した提案を適用」ボタンはdisabled状態である
```

## AC-7: 自動修正可能フィルタ（FR-3-2）

```gherkin
Scenario: 自動修正可能な提案の一括選択
  Given 5件の提案のうち3件がautoFixable=trueである
  When ユーザーが「自動修正可能のみ選択」ボタンをクリックする
  Then autoFixable=true の3件のチェックボックスがオン状態になる
  And autoFixable=false の2件のチェックボックスはオフ状態のままである

Scenario: 全提案がautoFixable=falseの場合
  Given 全ての提案がautoFixable=falseである
  When ユーザーが「自動修正可能のみ選択」ボタンをクリックする
  Then 全てのチェックボックスがオフ状態のままである
```

## AC-8: 全自動改善（FR-4）

```gherkin
Scenario: 全自動改善の確認ダイアログ表示
  Given SkillAnalysisView が表示されている
  When ユーザーが「全自動改善」ボタンをクリックする
  Then 確認ダイアログが表示される
  And ダイアログに「全自動改善を実行しますか？」のメッセージが含まれる

Scenario: 確認ダイアログで実行を選択した場合
  Given 確認ダイアログが表示されている
  When ユーザーが「実行」を選択する
  Then autoImprove("test-skill") が呼び出される
  And 「全自動改善」ボタンがdisabled状態になる
  And プログレスインジケータが表示される

Scenario: 確認ダイアログでキャンセルを選択した場合
  Given 確認ダイアログが表示されている
  When ユーザーが「キャンセル」を選択する
  Then autoImprove は呼び出されない
  And 画面に変化はない

Scenario: 全自動改善の完了と結果表示
  Given autoImprove APIが改善結果を返却した
  When 結果が返却される
  Then 結果サマリー（適用数・スキップ数・エラー数）が表示される
  And 分析結果が自動で再取得される
  And 「全自動改善」ボタンがenabled状態に戻る
```

## AC-9: エラーハンドリング - 分析失敗（FR-5-1）

```gherkin
Scenario: 分析APIのエラー発生時
  Given 分析APIがエラーを返却した
  When エラーが発生する
  Then エラーメッセージが表示される
  And エラーメッセージに role="alert" が付与されている
  And 「再試行」ボタンが表示される
  And ローディングスピナーが非表示になる

Scenario: 再試行ボタンのクリック
  Given エラーメッセージと「再試行」ボタンが表示されている
  When ユーザーが「再試行」ボタンをクリックする
  Then 分析が再実行される
  And ローディングスピナーが表示される
```

## AC-10: エラーハンドリング - 改善適用失敗（FR-5-2）

```gherkin
Scenario: 改善APIが一部成功・一部失敗の結果を返却した場合
  Given 改善APIが一部成功・一部失敗の結果を返却した
  When 結果が返却される
  Then 成功した提案と失敗した提案が区別されて表示される
  And 失敗した提案にはエラー理由が表示される
```

## AC-11: エラーハンドリング - ネットワークエラー（FR-5-3）

```gherkin
Scenario: ネットワークエラー発生時
  Given ネットワーク接続が切断されている
  When API呼び出しがネットワークエラーで失敗する
  Then オフライン状態のメッセージが表示される
```

## AC-12: エラーハンドリング - バリデーションエラー（FR-5-4）

```gherkin
Scenario: バリデーションエラー発生時
  Given スキル名が空文字列である
  When 分析を実行しようとする
  Then バリデーションエラーメッセージが表示される
  And 入力値の問題が明示される
```

## AC-13: アクセシビリティ（NFR-2）

```gherkin
Scenario: スクリーンリーダーによるスコア読み上げ
  Given SkillAnalysisView が表示されている
  And 分析結果の overallScore が 85 である
  When スクリーンリーダーが総合スコアを読み上げる
  Then 「総合スコア 85点（100点中）」のように読み上げる

Scenario: キーボードによる全機能操作
  Given SkillAnalysisView が表示されている
  When ユーザーがTabキーで操作する
  Then 全ボタン、全チェックボックスに順番にフォーカスが移動する
  And フォーカス中の要素が視覚的に識別できる

Scenario: axe-core による自動チェック
  Given SkillAnalysisView が表示されている
  When axe-core でアクセシビリティチェックを実行する
  Then WCAG 2.1 AA違反が0件である
```

## AC-14: レスポンシブUI（NFR-1）

```gherkin
Scenario: ボタンクリック後のUI応答速度
  Given SkillAnalysisView が表示されている
  When ユーザーが「分析」ボタンをクリックする
  Then 200ms以内にローディング表示が開始される
  And ボタンがdisabled状態に変化する
```

## AC-15: ダークモード（NFR-4）

```gherkin
Scenario: ダークモードでの表示
  Given システムのカラースキームがダークモードである
  When SkillAnalysisView が表示される
  Then Apple HIG System Colors（ダークパレット）で表示される
  And 全テキストが読みやすいコントラスト比（4.5:1以上）で表示される

Scenario: ライトモードでの表示
  Given システムのカラースキームがライトモードである
  When SkillAnalysisView が表示される
  Then Apple HIG System Colors（ライトパレット）で表示される
```
