# Loader Boundary Design

`ManifestLoader` の責務を 4 段に固定した。

1. `read`: manifest file と `mtime` を読む
2. `validate`: top-level field、hook / phase / resource 参照、phase 順序を検証する
3. `normalize`: resource path を絶対パスへ解決する
4. `cache`: `manifestPath + manifestMtimeMs + schemaVersion + resourceDescriptorHash` でキャッシュする

## 明示的な非責務

- execute
- route
- permission
- session
- IPC sender validation
- preload timeout

## error 返却方針

- invalid field: 明示的な `Error`
- missing resource: `fs.access` 失敗をそのまま伝播
- invalid phase topology: 明示的な `Error`
