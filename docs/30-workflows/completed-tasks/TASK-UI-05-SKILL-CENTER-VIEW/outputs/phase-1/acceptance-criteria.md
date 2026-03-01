# 受け入れ基準: TASK-UI-05-SKILL-CENTER-VIEW

## メタ情報

| 項目     | 値                           |
| -------- | ---------------------------- |
| タスクID | TASK-UI-05-SKILL-CENTER-VIEW |
| Phase    | 1                            |
| 作成日   | 2026-03-01                   |

---

## AC-1: おすすめセクション

### シナリオ 1-1: おすすめカードの初期表示

```gherkin
Given SkillCenterViewが表示されている
  And 未追加のツールが1件以上存在する
When 画面の初期ロードが完了する
Then 画面最上部に「おすすめ」セクションが表示される
  And 最大3枚のおすすめカード（h=160px）が表示される
  And カードにアクセントカラー5%グラデーション（左下から右上）背景が適用される
  And アイコンが56pxで表示される
  And stagger出現アニメーション（opacity 0->1 + translateY(8px->0)、各カード200ms間隔）が動作する
```

### シナリオ 1-2: おすすめカードのツール追加時の更新

```gherkin
Given おすすめセクションに3枚のカードが表示されている
  And 4件以上の未追加ツールが存在する
When おすすめカードの「追加する」ボタンをタップして追加が完了する
Then 追加済みカードがフェードアウトする（300ms）
  And 次のおすすめツールが繰り上がって表示される
```

### シナリオ 1-3: おすすめセクションの非表示

```gherkin
Given SkillCenterViewが表示されている
  And 未追加のツールが0件である
When 画面の初期ロードが完了する
Then おすすめセクションが非表示になる
```

### シナリオ 1-4: おすすめ選定ロジック

```gherkin
Given 複数カテゴリにまたがる未追加ツールが存在する
When おすすめセクションの表示ツールが選定される
Then 人気度（popularity）の高い順にソートされる
  And 同カテゴリのツールは最大2件までに制限される
  And 最大3枚が選定される
```

---

## AC-2: ツールカード + CardGrid

### シナリオ 2-1: カード一覧の表示

```gherkin
Given SkillCenterViewが表示されている
When ツール一覧がロードされる
Then CardGridでカード形式（h>=120px、48pxアイコン）で表示される
  And 各カードにツール名と一言説明（1行切り捨て）が表示される
  And 各カードに「追加する」ボタン（44x44pxタッチターゲット）が配置される
  And 件数表示（「XX件のツール」）が正確に表示される
```

### シナリオ 2-2: カードのホバーインタラクション

```gherkin
Given ツールカードが表示されている
When カードにマウスを乗せる
Then scale(1.02) + box-shadow: var(--shadow-md)が適用される（200ms ease-out）

When カードをクリック中（active状態）にする
Then scale(0.97)が適用される（100ms ease-out）
```

### シナリオ 2-3: カードのフォーカスインタラクション

```gherkin
Given ツールカードが表示されている
When キーボードTabでカードにフォーカスする
Then outline: 2px solid var(--color-accent) + outline-offset: 2pxが適用される
```

### シナリオ 2-4: カードクリックで詳細パネル表示

```gherkin
Given ツールカードが表示されている
When カード本体をクリックする
Then SkillDetailPanelが表示される
```

### シナリオ 2-5: 追加済みカードの表示

```gherkin
Given ツールが追加済みである
When 該当ツールのカードが表示される
Then ボタンが「追加済み!」状態で表示される
  And ボタン色がsuccess色で表示される
```

---

## AC-3: 追加ボタンモーフィング

### シナリオ 3-1: 追加成功時のモーフィングアニメーション

```gherkin
Given 未追加ツールの「追加する」ボタンが表示されている
When ボタンをタップする
Then ボタンテキストがfadeOut し、スピナーが表示される（最大300ms）

Given 追加処理が成功した
Then スピナーがチェックマーク(✓)にモーフィングする（200ms）
  And success-bounce（scale 1.0->1.15->1.0）が動作する（300ms）
  And ボタンテキストが「追加済み!」にfadeInする（150ms）
  And ボタン色がprimary -> successに変化する
```

### シナリオ 3-2: 追加失敗時のリカバリー

```gherkin
Given 未追加ツールの「追加する」ボタンをタップした
  And 追加処理が開始された
When 追加処理が失敗する
Then ボタンが「追加する」に戻る
  And エラーToastが表示される
```

### シナリオ 3-3: featuredサイズサポート

```gherkin
Given おすすめカード（FeaturedCard）内にAddButtonが配置されている
When AddButtonのsizeが"featured"である
Then 通常の"default"サイズよりやや大きいサイズで表示される
```

---

## AC-4: カテゴリタブ

### シナリオ 4-1: カテゴリタブの表示

```gherkin
Given SkillCenterViewが表示されている
When 画面の初期ロードが完了する
Then 横スクロール可能なカテゴリタブ（すべて/開発ツール/文書作成/データ分析/自動化/その他）が表示される
  And 「すべて」タブがデフォルトで選択されている
  And スクロールバーが非表示である
```

### シナリオ 4-2: カテゴリ切替時のアニメーション

```gherkin
Given カテゴリタブが表示されている
When 別のカテゴリタブをタップする
Then 下線インジケータが選択タブの位置にスライドする（200ms ease-out）
  And カードグリッドがcrossFadeで切り替わる（150ms）
  And 選択カテゴリに該当するツールのみが表示される
```

### シナリオ 4-3: タッチスワイプ対応

```gherkin
Given モバイル画面でカテゴリタブが表示されている
When タブ領域を左右にスワイプする
Then タブが横スクロールする
  And スクロールバーは表示されない
```

---

## AC-5: 詳細パネル

### シナリオ 5-1: デスクトップでの詳細パネル表示

```gherkin
Given 画面幅が1024px以上のデスクトップ環境である
When ツールカードをクリックする
Then 右からスライドインパネル（幅450px）が表示される（250ms ease-out）
  And 「このツールでできること」箇条書き（3〜5項目）が表示される
  And 「AIにできること」バッジが表示される
  And 「詳しい説明を見る」折りたたみが表示される
  And メタ情報（作成者、カテゴリ、追加日）が表示される
  And オーバーレイは表示されない（メインコンテンツ横に表示）
```

### シナリオ 5-2: モバイルでの詳細パネル表示

```gherkin
Given 画面幅が1024px未満のモバイル環境である
When ツールカードをクリックする
Then 下からスライドアップのボトムシート（最大85vh）が表示される（300ms ease-out）
  And 半透明オーバーレイが表示される
  And パネル内容はデスクトップと同一の構成で表示される
```

### シナリオ 5-3: モバイルでのスワイプ閉じ

```gherkin
Given モバイルでボトムシートが表示されている
When 下方向に50px以上スワイプする
Then ボトムシートが閉じる
```

### シナリオ 5-4: 折りたたみの開閉

```gherkin
Given 詳細パネルが表示されている
  And 「詳しい説明を見る」が折りたたまれている
When 「詳しい説明を見る ▼」をクリックする
Then 折りたたみが展開される（max-height トランジション 300ms ease-out）
  And SKILL.md 全文がMarkdownレンダリングで表示される
  And テキストが「詳しい説明を閉じる ▲」に変化する

When 「詳しい説明を閉じる ▲」をクリックする
Then 折りたたみが閉じる（max-height トランジション 300ms ease-out）
  And テキストが「詳しい説明を見る ▼」に変化する
```

### シナリオ 5-5: 権限バッジの表示

```gherkin
Given 詳細パネルにツールの権限情報が表示されている
When ツールに「Bash」「Read」「Write」権限がある
Then 「コマンドを実行」バッジが--status-warning-subtle色で表示される
  And 「ファイルを読む」バッジが--status-info-subtle色で表示される
  And 「ファイルに書き込む」バッジが--status-warning-subtle色で表示される
```

---

## AC-6: ツール操作フロー

### シナリオ 6-1: カード内ボタンからの追加

```gherkin
Given ツールカードの「追加する」ボタンが表示されている
When ボタンをタップする
Then useImportSkill(skillName) が実行される
  And 成功時にAddButtonのモーフィングアニメーションが動作する（AC-3参照）
```

### シナリオ 6-2: ヘッダーからの追加

```gherkin
Given SkillCenterViewのヘッダーが表示されている
When ヘッダー右の「+ 追加する」ボタンをクリックする
Then 既存SkillImportDialogが表示される
```

### シナリオ 6-3: 削除確認ダイアログの表示

```gherkin
Given SkillDetailPanelが表示されている
  And 表示中のツールは追加済みである
When 「このツールを削除」をタップする
Then 確認ダイアログが表示される
  And ダイアログに「"{ToolName}" を削除しますか？この操作は取り消せません」と表示される
```

### シナリオ 6-4: 削除成功

```gherkin
Given 削除確認ダイアログが表示されている
When 「削除」を選択する
Then useRemoveSkill(skillName) が実行される
  And ツールが削除される
  And DetailPanelが閉じる
  And カードのボタンが「追加する」に戻る
  And 成功Toastが表示される
```

### シナリオ 6-5: 削除キャンセル

```gherkin
Given 削除確認ダイアログが表示されている
When 「キャンセル」を選択する
Then ダイアログが閉じる
  And ツールは削除されない
  And DetailPanelは表示されたままである
```

---

## AC-7: ゼロステート

### シナリオ 7-1: ツール0件時のEmptyState

```gherkin
Given SkillCenterViewが表示されている
  And ツールが0件である
  And ローディングが完了している
When 画面が描画される
Then EmptyState mood="welcoming" が表示される
  And 「ツールを探してみよう」メッセージが表示される
  And 「ツールを追加すると、AIエージェントがもっと多くのことをできるようになります」の説明が表示される
  And アクションボタン「ツールを探してみる」が表示される
```

### シナリオ 7-2: EmptyStateアクションボタン

```gherkin
Given ゼロステート（ツール0件）が表示されている
When アクションボタン「ツールを探してみる」をクリックする
Then SkillImportDialogが起動する
```

### シナリオ 7-3: 検索結果0件時

```gherkin
Given カテゴリフィルタまたは検索キーワードが入力されている
  And フィルタ条件に一致するツールが0件である
When フィルタリング結果が表示される
Then 「見つかりませんでした」メッセージが表示される
  And 「フィルターをクリア」ボタンが表示される
```

### シナリオ 7-4: フィルタークリア

```gherkin
Given 検索結果0件のゼロステートが表示されている
When 「フィルターをクリア」ボタンをクリックする
Then 検索キーワードがクリアされる
  And カテゴリが「すべて」にリセットされる
  And 全ツール一覧が表示される
```

### シナリオ 7-5: ローディング中の表示

```gherkin
Given SkillCenterViewが表示されている
When ツール一覧のローディング中である
Then おすすめセクションにスケルトンカード3枚（h=160px）が表示される
  And CardGridエリアにスケルトンカード6枚（h=120px）が表示される
  And スケルトンカードにanimate-pulse + グレー背景のshimmerが適用される
```

---

## AC-8: レスポンシブ

### シナリオ 8-1: 大画面（>= 1440px）

```gherkin
Given 画面幅が1440px以上である
When SkillCenterViewが表示される
Then CardGridが4列グリッドで表示される
  And おすすめカードが3枚横並びで表示される
  And 詳細パネルがスライドインパネル（450px）で表示される
  And カテゴリタブが横並びで表示される
```

### シナリオ 8-2: デスクトップ（1024px〜1439px）

```gherkin
Given 画面幅が1024px以上1439px以下である
When SkillCenterViewが表示される
Then CardGridが3列グリッドで表示される
  And おすすめカードが3枚横並びで表示される
  And 詳細パネルがスライドインパネル（450px）で表示される
  And カテゴリタブが横並びで表示される
```

### シナリオ 8-3: タブレット（768px〜1023px）

```gherkin
Given 画面幅が768px以上1023px以下である
When SkillCenterViewが表示される
Then CardGridが2列グリッドで表示される
  And おすすめカードが横スクロール形式で表示される
  And 詳細パネルがボトムシート（最大85vh）で表示される
  And カテゴリタブが横スクロール形式で表示される
```

### シナリオ 8-4: モバイル（< 768px）

```gherkin
Given 画面幅が768px未満である
When SkillCenterViewが表示される
Then CardGridが1列グリッドで表示される
  And おすすめカードが横スクロール形式で表示される
  And 詳細パネルがボトムシート（最大85vh）で表示される
  And カテゴリタブが横スクロール形式で表示される
```

---

## AC-9: UX言語

### シナリオ 9-1: 画面タイトルと表示テキスト

```gherkin
Given SkillCenterViewが表示されている
When 画面全体のテキストを確認する
Then 画面タイトルが「ツールを探す」になっている
  And 全表示テキストで「スキル」ではなく「ツール」が使用されている
  And 「インポート」ではなく「追加する」が使用されている
  And 件数表示が「XX件のツール」形式である
```

### シナリオ 9-2: 権限表示のUX言語

```gherkin
Given SkillDetailPanelが表示されている
When 権限セクションを確認する
Then セクション見出しが「AIにできること」になっている
  And 技術的な権限名ではなく平易な表現のバッジで表示される
  And 「Bash」は「コマンドを実行」と表示される
  And 「Read」は「ファイルを読む」と表示される
  And 「Write」は「ファイルに書き込む」と表示される
```

### シナリオ 9-3: 有効/無効トグルの不在

```gherkin
Given SkillCenterViewが表示されている
When 画面全体のUIコントロールを確認する
Then 有効/無効トグルスイッチが存在しない
  And ツールの状態は「追加済み」と「未追加」の2状態のみである
```

---

## AC-10: 品質

### シナリオ 10-1: テスト品質

```gherkin
Given 全コンポーネントテストを実行した
When テスト結果を確認する
Then 全テストがPASSする
  And Line Coverage が 80%以上である
  And Branch Coverage が 60%以上である
  And Function Coverage が 80%以上である
```

### シナリオ 10-2: AgentView への非影響

```gherkin
Given SkillCenterViewの実装が完了した
When AgentView のソースコードの差分を確認する
Then AgentView に変更がないこと（差分0）
  And AgentView の既存テストが全てPASSする
```

### シナリオ 10-3: キーボードアクセシビリティ

```gherkin
Given SkillCenterViewが表示されている
When キーボードのみで操作する
Then Tabキーで全インタラクティブ要素にフォーカス移動できる
  And Enterキーでボタンクリック・カード選択ができる
  And Escapeキーで DetailPanel を閉じることができる
  And Escapeキーで削除確認ダイアログを閉じることができる
```

### シナリオ 10-4: フィードバック状態

```gherkin
Given SkillCenterViewが表示されている
When 全インタラクティブ要素を確認する
Then 全ボタンにhover状態が定義されている
  And 全ボタンにactive状態が定義されている
  And 全ボタンにfocus状態が定義されている
  And カードにhover/active/focus状態が定義されている
```

### シナリオ 10-5: コントラスト比

```gherkin
Given SkillCenterViewが表示されている
When テキスト要素のコントラスト比を確認する
Then 通常テキストのコントラスト比が4.5:1以上である
  And 大テキスト/UIコンポーネントのコントラスト比が3:1以上である
```
