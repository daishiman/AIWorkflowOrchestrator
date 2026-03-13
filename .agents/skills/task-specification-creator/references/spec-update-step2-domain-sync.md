# Spec Update Step2 Domain Sync

## 更新が必要な場合

| 変更 | 更新対象例 |
| --- | --- |
| 新規 interface / 型 | `interfaces-*.md` |
| API / IPC 変更 | `api-*.md` |
| architecture 変更 | `architecture-*.md` |
| state / data flow 変更 | `arch-state-management.md`, `database-*.md` |
| UI contract 変更 | `ui-ux-*.md` |
| security contract 変更 | `security-*.md` |

## 更新不要の代表例

- private helper だけの変更
- interface 不変の refactor
- typo 修正
- テストケース追加のみ

## 判定メモ

1. 外部から見える contract が変わったか。
2. 他レイヤーが依存する境界が変わったか。
3. 既存 spec の table / completion record / lessons だけで足りるか。

上の 3 つがすべて No なら Step 2 は「更新なし」として閉じる。
