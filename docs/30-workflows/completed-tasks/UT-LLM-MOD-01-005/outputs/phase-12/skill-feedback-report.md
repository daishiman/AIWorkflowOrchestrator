# Phase 12: スキルフィードバックレポート

## 実施結果

| skill                        | フィードバック                                                                                                                                                                                                                               |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `aiworkflow-requirements`    | `llm-ipc-types.md` / `interfaces-llm.md` / `ui-ux-llm-selector.md` を `provider-registry.ts` 正本へ同期し、lessons / quick-reference / resource-map / LOGS / SKILL まで同一 wave で更新した                                                  |
| `task-specification-creator` | `phase-12-documentation-guide.md` / `spec-update-step1-validation-commands.md` / `spec-update-step2-domain-sync.md` / `unassigned-task-guidelines.md` を更新し、raw メモ禁止・target-file audit・shared catalog の Step 2 判定をルール化した |
| `skill-creator`              | review のみ実施。今回の gap は task-spec close-out ルール側で吸収できるため、template / prompt 本体の追加変更は不要と判断した                                                                                                                |

## TDD / 実装から得た知見

| 観点          | 知見                                                                                                                                   |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| SSoT          | code 側だけでなく spec 側の表も正本参照へ寄せないと drift が再発する                                                                   |
| 型安全        | `as const satisfies` は有効だが、optional property と tuple cast の補助が必要                                                          |
| cross-package | shared readonly data を Main mutable surface へ橋渡しする箇所は follow-up 候補になりやすい                                             |
| close-out     | repo 全体 baseline が荒れていても、`current` と `baseline` を分けて evidence 化しないと Phase 12 narrative が false green になりやすい |

## 今回記録した改善提案

### task-specification-creator

- Phase 12 の current finding を raw メモで閉じず、template 準拠の未タスク指示書へ昇格してから完了扱いにする
- `documentation-changelog.md` / `unassigned-task-detection.md` / backlog の 3 点を同一ターンで揃える
- `verify-unassigned-links.js` が repo baseline で落ちる場合でも、`audit-unassigned-tasks --target-file` の current 監査結果を evidence として残す

### skill-creator

- spec update で runtime constant table を複製している場合、current facts を列挙し続けるより `source-of-truth + representative examples` へ寄せる
- same-wave sync 後に `generate-index.js -> validate-structure.js -> unassigned audit -> diff` の順で close-out する

## 残件

- `aiworkflow-requirements/SKILL.md` と `task-specification-creator/SKILL.md` は change history を圧縮して line budget を解消し、`quick_validate.js` は warning only で PASS に戻した
- `skill-creator` 自体の直接更新は実施していない
