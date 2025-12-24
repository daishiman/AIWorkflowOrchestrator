# Level 3: Advanced

## 概要

GoF（Gang of Four）の行動パターンを専門とするスキル。 エリック・ガンマの『デザインパターン』に基づき、オブジェクト間の通信と 責務の分散を効果的に設計するパターンを提供します。

Progressive Disclosure 設計とトークン最適化の実践方法を整理します。

## 前提条件

- Level 2 の運用を完了している
- リソース/スクリプト/テンプレートの位置を把握している

## 詳細ガイド

### Progressive Disclosure 設計
- まず Level1/Level2 で要点だけを確認し、必要に応じて詳細リソースへ拡張する
- 説明量が過剰な場合は要約を作り、必要な箇所のみを参照する

### トークン最適化
- 目的に直結しない情報は後回しにし、必須項目を優先して読み込む
- 参照回数が多い資料は要点メモを作って再利用する

### 高度知識の扱い
- `resources/chain-of-responsibility-pattern.md`: chain-of-responsibility-pattern の詳細ガイド（把握する知識: Chain of Responsibility Pattern（責任の連鎖パターン） / パターン構造 / 構成要素）
- `resources/command-pattern.md`: command-pattern の詳細ガイド（把握する知識: Command Pattern（コマンドパターン） / パターン構造 / 構成要素）
- `resources/observer-pattern.md`: observer-pattern の詳細ガイド（把握する知識: Observer Pattern（オブザーバーパターン） / パターン構造 / 構成要素）
- `resources/pattern-selection-guide.md`: pattern-selection-guide のガイド（把握する知識: パターン選択ガイド / 判断フローチャート / パターン比較マトリックス）
- `resources/state-pattern.md`: state-pattern の詳細ガイド（把握する知識: State Pattern（ステートパターン） / パターン構造 / 構成要素）
- `resources/strategy-pattern.md`: strategy-pattern の詳細ガイド（把握する知識: Strategy Pattern（戦略パターン） / パターン構造 / 構成要素）
- `resources/template-method-pattern.md`: template-method-pattern の詳細ガイド（把握する知識: Template Method Pattern（テンプレートメソッドパターン） / パターン構造 / 構成要素）

### 判断基準
- 詳細な判断が必要なときのみ高度リソースを読み込む
- 検証が必要な場合は参照系スクリプトを優先する

### スクリプト分類
- 参照系: `scripts/validate-pattern-usage.mjs`, `scripts/validate-skill.mjs`
- その他: `scripts/log_usage.mjs`
- テンプレートは出力一貫性の維持に活用する

## 実践手順

1. 必要最低限の情報に絞って参照範囲を決める
2. 不足が見えたら高度リソースを追加で読み込む
3. 参照系スクリプトで検証し、必要なら更新系スクリプトを実行する
4. テンプレートで表現の差異を最小化する
5. 情報量が多い場合は要約を作成して再利用する

## チェックリスト

- [ ] 参照範囲を段階的に広げる設計ができた
- [ ] スクリプトの種類に応じて実行順を調整した
- [ ] テンプレートで成果物の一貫性を保った
- [ ] トークン消費を抑えるため要約や分割を行った
