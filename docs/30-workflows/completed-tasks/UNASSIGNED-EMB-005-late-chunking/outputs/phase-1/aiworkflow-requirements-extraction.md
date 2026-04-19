# aiworkflow仕様抽出結果

## キーワード検索結果

| キーワード     | ヒット箇所                             |
| -------------- | -------------------------------------- |
| `LateChunking` | chunking/types.ts, chunking-service.ts |
| `embedding`    | embedding/ ディレクトリ全体            |
| `HiddenState`  | 未実装（新規）                         |
| `pooling`      | chunking/types.ts (stub)               |

## 品質要件

- TypeScript strict modeに準拠
- Vitestによるユニットテスト必須
- ビルド・型チェックがCIで通過すること

## 実装パターン

- サービスはFacadeパターンを基本とする
- 責務分離: 型/インターフェース/実装クラスを別ファイルに分割
- エラーは専用クラスで定義し、基底クラスから継承する
