# Phase 11 発見課題一覧

## Issue 1

- 種別: 環境依存
- 重要度: medium
- 内容: `vitest` 起動時に `@esbuild/darwin-arm64` / `@esbuild/darwin-x64` mismatch で Vite config の読み込みが失敗する
- 影響: targeted runtime tests のこのターンでの再実行確認が完了しない
- 実装修正要否: 不要
- 未タスク化: 不要
- 理由: 生成物や仕様差分ではなくローカル依存の再インストールで解消可能なため

## 結論

- product / spec follow-up: 0 件
- environment note: 1 件
