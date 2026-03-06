# Phase 8 component 抽出指針

## 抽出ルール

- 1責務 1コンポーネントを守れる場合のみ抽出する
- store access は root に寄せ、抽出子には data / callback を渡す
- imported / available section を抽出する場合も `currentView` 分岐は root に残す
- dialog は単体責務を維持し、panel 側で import 成功後処理だけを持つ

## 抽出禁止

- row component から store action を直接叩く構造
- section component 内で `useAppStore` を追加する構造
