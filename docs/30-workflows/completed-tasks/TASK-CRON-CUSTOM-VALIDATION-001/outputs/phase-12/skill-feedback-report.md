# スキルフィードバックレポート（Phase 12）

## タスク: TASK-CRON-CUSTOM-VALIDATION-001

## ワークフロー改善点

### 改善点1: テスト設計とProps設計の連携

Phase 4 の初期テスト案が direct input モードの切り替えを外部インターフェースで表現する前提になっていたが、
実装側の `VisualCronPicker` は内部 state でモードを管理していた。
仕様書の設計フェーズでは、テストで想定するのが外部 props なのか内部 state なのかを
明示すると、TDD RED→GREEN の流れが揺れにくくなる。

### 改善点2: esbuildのJSDocバッククォート制限

JSDocコメント内のバッククォート（`` ` ``）が esbuild でパースエラーを引き起こした。
renderer環境の Vitest（esbuild変換）では JSDoc 内にバッククォートを使わないことが
暗黙のルールとして存在する。仕様書の「実装注意事項」に記載しておくと良い。

## 技術的教訓

1. **コンポーネント外純粋関数パターン**: React コンポーネントに依存しないバリデーション関数は
   モジュールスコープに配置することで、再レンダリングコストゼロ・テスタビリティ向上を両立できる。

2. **`isAdvancedMode` 派生状態の設計**: `directInputError` を `isAdvancedMode` に応じて計算する
   パターンは、既存の `weeklyError` / `monthlyError` と役割分担が明確で読みやすい。

## スキル改善提案

- `task-specification-creator` の Phase 2 テンプレートに「Props変更チェック」セクションを追加:
  テストで使用する入力が既存インターフェースか内部 state かを事前確認するステップ

## 新規 Pitfall 候補

- **esbuild JSDoc backtick**: renderer/Vitest 環境の JSDoc コメント内でバッククォートを使うと
  esbuild がパースエラーを起こす。コードコメントでは通常の括弧や引用符を使用すること。
