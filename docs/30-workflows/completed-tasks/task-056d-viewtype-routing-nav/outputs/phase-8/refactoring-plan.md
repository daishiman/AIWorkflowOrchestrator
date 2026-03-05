# Phase 8 リファクタリング計画（SubAgent-B）

## 実施内容

- AppDock内のローカル `navItems` 定義を削除
- ナビ契約を `navigation/navContract.ts` に集約
- `App.tsx` が同一契約からショートカット解決を利用

## 期待効果

- 型ドリフト防止
- 仕様変更時の更新箇所削減（1箇所更新で反映）
