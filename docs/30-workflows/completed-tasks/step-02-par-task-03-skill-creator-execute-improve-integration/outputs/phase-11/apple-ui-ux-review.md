# Apple UI/UX レビュー

## 総評

判定は `PASS with MINOR observations`。`2026-03-12 07:17 JST` に再取得した 5 枚のスクリーンショットで見ても、`SkillLifecycleSessionCard` は 1 つの面で `作成 -> 実行 -> 改善` を完走させるという目的に対して十分に明快で、wizard を secondary route に下げた判断も妥当だった。desktop 幅では視線が prompt、primary action、summary cards、improvement result へ自然に流れる。

## 良い点

- 一次導線が list view の先頭に固定され、既存の imported skill 一覧より先に「何をすべきか」が伝わる
- `作成する` を primary、`実行する` / `分析する` / `全自動改善` / `詳細設定で作成する` を secondary に分けたため、操作の優先度が読み取りやすい
- create / execute / improve の結果を 3 列 + 1 行 summary に分解したことで、1 回前の操作結果が残りつつ、次の判断に必要な情報だけが見える
- wizard は sparse だが、その軽さが「補助導線」であることを逆に示しており、主導線と競合しない

## Minor observations

- light theme では補助テキストと placeholder のコントラストがやや弱く、session card 内の階層差が少し平坦に見える
- session card と下部一覧の surface tone が近いため、区切りは理解できるが depth は控えめ
- wizard 1 step 目は必要最小限に寄りすぎており、単独面として見ると少し空疎に見える

## 推奨アクション

- secondary text の濃度を 1 段上げ、summary card の small label をより読みやすくする
- session card と一覧のあいだに tone 差か shadow 差を少し増やし、一次導線の前景感を上げる
- wizard には短い説明文か step helper を足し、secondary route のまま理解コストだけ下げる

## 参照証跡

- `outputs/phase-11/screenshots/tc-11-01-start.png`
- `outputs/phase-11/screenshots/tc-11-03-improved.png`
- `outputs/phase-11/screenshots/tc-11-04-wizard.png`
