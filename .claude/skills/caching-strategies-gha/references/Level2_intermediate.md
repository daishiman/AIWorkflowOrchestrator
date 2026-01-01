# Level 2: Intermediate

## 概要

キャッシュキー設計とパス選定を実務に落とし込む。

## 強化ポイント

- キー粒度の調整
- restore-keys の設計
- 言語別キャッシュパターン

## 参照すべき資料

- `references/cache-action.md`: actions/cache 仕様
- `references/cache-patterns.md`: 言語別パターン

## 推奨アクション

1. キーに含める入力を定義する
2. restore-keys のフォールバックを設計する
3. キャッシュ対象パスを整理する

## チェックリスト

- [ ] キー粒度が妥当である
- [ ] restore-keys が定義されている
- [ ] パスが整理されている
