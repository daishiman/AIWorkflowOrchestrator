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

---

## Runtime orchestration / failure lifecycle の補足判断

次の変更は public IPC の request/response 形状が変わらなくても Step 2 を実施する。

- `Facade` / `Engine` / `Store` の state owner が変わる
- `review` / `verify` / `resume` / `handoff` の phase 遷移意味が変わる
- `success:false` / reject / retry の扱いが変わる
- artifacts の append / upsert / snapshot 方針が変わる
- 見た目が変わらない state-only 変更でも、phase semantics や error retention が変わるなら Step 2 対象とし、Phase 11 は NON_VISUAL として state assertion / automated test を evidence にする

理由: downstream task と system spec は payload 形状だけでなく state semantics に依存するため。

---

## `spec_created` task への code wave 混入時の補足判断

次の条件が 1 つでも当てはまる場合、docs-heavy / spec_created task でも Step 2 と Phase 11 evidence policy を再判定する。

- shared 型が増えた
- public IPC / preload surface が増えた
- renderer に新しい visible block が増えた
- `manual-test-result.md` の screenshot `N/A` が current UI 実装と矛盾した
