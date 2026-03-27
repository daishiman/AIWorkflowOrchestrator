# Discovered Issues

プロダクト不具合としての新規 issue は 0 件。

## メモ

- テスト実行環境では `esbuild` host/binary mismatch により Vitest が blocked している。これは実装差分ではなくローカル環境要因として Phase 9 に記録した。
- 実装 wave では Task07 / Task08 の wording 変更に追従する必要がある可能性がある。
- live Electron / Vite preview を使った capture はこの turn では未実施のため、current workflow 配下に review board screenshot と capture metadata を保存し、fallback 理由を記録した。
