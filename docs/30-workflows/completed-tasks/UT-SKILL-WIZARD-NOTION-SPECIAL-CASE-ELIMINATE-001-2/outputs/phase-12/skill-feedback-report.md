# Phase 12 Skill Feedback Report

## ワークフロー改善点

- `ConversationRoundStep.tsx` だけを見ても特別ケースが残るため、shared の変換表と renderer の分岐を同 wave で grep する手順が必要
- `notion` のような例外処理は、先に shared 側へ移してから画面側の分岐を消す順番にすると漏れが減る
- `phase-12-documentation.md` の check list に「未登録値の原表記保持」観点を入れると再発を防ぎやすい

## 技術的教訓

- `SemanticLabelEntry` を `string | { label; freeText? }` に広げると、見た目のラベルと自由入力を同じ表で管理できる
- フォールバック値は正規化後の小文字ではなく、元の入力文字列を返すべき
- `resolveSemanticLabel()` は互換 wrapper として残し、`freeText` を必要とする経路だけ `resolveLabelEntry()` を使うと責務が明確になる

## 設計判断の教訓

- shared の型だけを拡張し、desktop 側はその結果を読むだけにすると責務分離が崩れにくい
- `q5.notion` だけを特別扱いするのではなく、`SEMANTIC_LABEL_MAP` のエントリとして表現する方が拡張しやすい
- `createQuestionAnswer()` は raw 値の保持責務を持ち、変換ルールは shared へ寄せるのがよい

## スキル改善提案

- `SEMANTIC_LABEL_MAP` に `caseSensitiveFallback` や `defaultFreeText` のような追加メタを持てるようにすると、今後の例外処理をさらに減らせる
- `generate-index.js` 実行後の current facts 差分を自動で要約するテンプレートがあると、Phase 12 の記録が速くなる

## 新規 Pitfall 候補

- raw 値を先に `toLowerCase()` してしまい、未マップ値の原表記を失う
- 変換表に新しいメタデータを足したのに、renderer 側の special case を残してしまう
- shared のテストだけ通って desktop の回帰テストを落とす

## 総評

改善点はある。特に「未登録値の原表記保持」は、今後も他の questionId に広げるときの基本ルールとして固定しておくべき。
