# Responsibility Map

| 責務                | 実体                                                                                    | 境界ルール                                                                                     |
| ------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| parent/child 導線   | `task-060`、completed-task pointer docs、`task-000`、`task-090`                         | docs の path と status を正本へそろえる。system spec 本文はここで編集しない                    |
| spec evidence       | `task-workflow.md`、`ui-ux-feature-components.md`、`interfaces-*`、`lessons-learned.md` | completed workflow 正本 path と lessons のみを編集し、task docs の status 文言には立ち入らない |
| script / automation | capture script、root validator、fixture test                                            | file class ごとの required / forbidden 条件をコード化し、manual 文言差は吸収する               |
| mirror sync         | `.claude` canonical、`.agents` mirror                                                   | 正本更新後の rsync と `diff -qr` を必須にし、mirror 直接編集を前提にしない                     |

## 役割分離の結果

- docs と spec と automation を別ファイル群に分けて更新できた。
- 04A/04B/04C の Renderer UI 実装変更へ scope が広がらなかった。
- Phase 12 で参照する lessons / LOGS / unassigned detection の根拠が明確になった。
