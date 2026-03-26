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
| shared runtime catalog / registry 変更 | `interfaces-*.md`, `ui-ux-*.md`, `api-*.md` の関連正本 |
| phase owner / transition semantics / failure lifecycle 変更 | `architecture-*.md`, `api-*.md`, `lessons-learned*.md`, `task-workflow*.md` |

## 更新不要の代表例

- private helper だけの変更
- interface 不変の refactor
- typo 修正
- テストケース追加のみ
- internal 実装だけで shared/public contract が不変な場合

## 判定メモ

1. 外部から見える contract が変わったか。
2. 他レイヤーが依存する境界が変わったか。
3. 既存 spec の table / completion record / lessons だけで足りるか。
4. shared catalog が source-of-truth として昇格した場合、UI/IPC/型 docs まで連鎖更新が必要か。
5. public IPC shape が不変でも、state owner・review/verify 遷移・failure lifecycle が変わったなら Step 2 を実施する。

上の 4 つがすべて No なら Step 2 は「更新なし」として閉じる。
