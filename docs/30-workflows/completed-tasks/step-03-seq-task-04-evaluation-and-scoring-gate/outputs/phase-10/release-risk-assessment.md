# Phase 10: Release Risk Assessment

| リスク                    | 重大度 | 内容                                                           | 対応                                         |
| ------------------------- | ------ | -------------------------------------------------------------- | -------------------------------------------- |
| repo global coverage gate | Minor  | Task04 対象外の低 coverage に引っ張られる                      | Task04 scope は targeted coverage で確認済み |
| Task05 本流画面の未着手   | Low    | `SkillCenterView` 以外の usage surface は未実装                | Task05 本体で展開する                        |
| status 文言重複           | Low    | UI テスト / Playwright 待機条件で strict mode 競合が起きやすい | `data-testid` 基準へ固定済み                 |
