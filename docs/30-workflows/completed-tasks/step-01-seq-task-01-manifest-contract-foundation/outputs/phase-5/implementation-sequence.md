# Implementation Sequence

1. shared に workflow manifest contract 型を追加
2. `ManifestLoader` を `read -> validate -> normalize -> cache` 順で実装
3. fixture と sample manifest を追加
4. unit test を追加
5. typecheck 実施
6. phase outputs を実装結果で更新
