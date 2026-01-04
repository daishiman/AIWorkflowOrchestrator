# Open-Closed Principle 基礎知識

> **相対パス**: `references/basics.md`
> **原典**: Clean Architecture (Robert C. Martin), アジャイルソフトウェア開発の奥義

---

## 定義

**OCP**: ソフトウェアのエンティティ（クラス、モジュール、関数など）は、拡張に対して開いていて、修正に対して閉じているべきである。

> "Software entities should be open for extension, but closed for modification."
> — Robert C. Martin

---

## 核心概念

### 「開いている」（Open for Extension）

- 新しい振る舞いを追加できる
- 新しい機能タイプを追加できる
- **拡張ポイント**が提供されている

### 「閉じている」（Closed for Modification）

- 既存のコードを変更しない
- 既存のテストを壊さない
- **安定したインターフェース**が維持される

---

## なぜ重要か

| 利点               | 説明                                       |
| ------------------ | ------------------------------------------ |
| リグレッション防止 | 既存コードを変更しないためバグが入りにくい |
| テスト維持         | 既存のテストがそのまま有効                 |
| 独立した開発       | チームが並行して新機能を開発可能           |
| 変更の局所化       | 変更が新しいコードに限定される             |
| 保守性向上         | 既存コードの理解なしに拡張可能             |

---

## OCP違反の兆候

1. **switch文・if-elseチェーン**: 新しいタイプ追加のたびに修正が必要
2. **型チェック（instanceof）**: 新しいサブタイプ追加のたびに修正が必要
3. **フラグパラメータ**: 動作を切り替えるboolean引数
4. **マジックナンバー/文字列**: 条件分岐のハードコード値

---

## 解決パターン

| パターン         | 用途                           |
| ---------------- | ------------------------------ |
| ポリモーフィズム | 型ごとの振る舞いを分離         |
| Strategy         | 実行時にアルゴリズムを切り替え |
| Template Method  | 共通フローで詳細をサブクラスに |
| Plugin Registry  | 動的な拡張登録                 |
| Factory          | オブジェクト生成の抽象化       |

---

## クイックチェック

### 設計時

- [ ] 変動部分と安定部分を分離したか？
- [ ] 適切なインターフェースを定義したか？
- [ ] 拡張ポイントは明確か？

### 実装時

- [ ] 新機能追加で既存ファイルの変更は最小限か？
- [ ] switch/if-elseチェーンを使っていないか？
- [ ] 型チェック（instanceof）を使っていないか？

---

## 関連リソース

- **詳細原則**: See [ocp-fundamentals.md](ocp-fundamentals.md)
- **パターン集**: See [ocp-patterns.md](ocp-patterns.md)
- **リファクタリング**: See [refactoring-to-ocp.md](refactoring-to-ocp.md)
- **拡張メカニズム**: See [extension-mechanisms.md](extension-mechanisms.md)
