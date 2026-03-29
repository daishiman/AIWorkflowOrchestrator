# Phase 6 Extended Test Record

## 追加で担保した edge case

- `system/init` 不在時でも fallback error event を生成して downstream 契約を空にしない
- `permission_denials` が result 配下 / top-level どちらでも抽出可能
- failure 時も `sdkEvents` と `sourceProvenance` を execute result / workflow artifact に残す
- raw SDK message が object でも未知形状なら無視し、既知イベントのみ lane 契約へ落とす

## 備考

- session resume 自体の UI は scope 外だが、`sessionId` を execute result に保持する前提を追加した
- SDK raw stream の完全な schema は外部依存のため、正規化は寛容パーサで吸収する方針とした
