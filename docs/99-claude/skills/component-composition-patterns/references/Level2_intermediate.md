# レベル2: 実務

## 概要

Compound/Polymorphic/Slot の設計とAPI整理を実務レベルで適用する。
references/・assets/ を活用した設計を前提とする。

## 前提条件

- レベル1 の内容を理解している
- UI要件と制約を把握している

## 詳細ガイド

### 必要な知識・情報

- 主要トピック: Compound構成、Polymorphic型設計、Slot差し替え
- 実務指針: APIと責務の境界を明確にする

### 判断基準と検証観点

- 回避事項: 1コンポーネントに複数責務を混在させない
- 検証観点: 既存UIと整合するAPIになっている

### リソース運用

- `references/compound-components-guide.md`: Compound設計
- `references/polymorphic-components.md`: Polymorphic設計
- `references/slot-pattern-guide.md`: Slot設計
- `references/requirements-index.md`: 全体要件との整合
- `references/legacy-skill.md`: 旧版との差分確認

### テンプレート運用

- `assets/compound-component-template.tsx`: Compoundの雛形
- `assets/polymorphic-component-template.tsx`: Polymorphicの雛形
- `assets/slot-component-template.tsx`: Slotの雛形

### 成果物要件

- API設計が目的と制約を満たしている

## 実践手順

1. パターン別にAPIをスケッチする
2. テンプレートで実装方針を整理する
3. 設計チェックリストで確認する

## チェックリスト

- [ ] パターンごとの責務が整理されている
- [ ] APIの一貫性が保たれている
- [ ] チェックリストで確認済み
