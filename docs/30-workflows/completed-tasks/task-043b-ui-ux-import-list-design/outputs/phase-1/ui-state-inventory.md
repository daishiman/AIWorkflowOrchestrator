# Phase 1 UI 状態棚卸し

| 状態                   | トリガー                                           | 表示                       | データ源                                       |
| ---------------------- | -------------------------------------------------- | -------------------------- | ---------------------------------------------- |
| loading                | `isLoadingSkills=true`                             | `読み込み中...`            | `useIsLoadingSkills`                           |
| global empty           | imported=0, available=0, query=""                  | 全体 empty state           | imported / available selector                  |
| imported inline empty  | imported visible=0, available>0                    | imported section 内 empty  | imported selector                              |
| available inline empty | available visible=0, imported>0                    | available section 内 empty | available selector                             |
| no-result              | imported visible=0, available visible=0, query!="" | 全体 no-result state       | 検索結果                                       |
| dialog open            | available row CTA click                            | `SkillImportDialog`        | local state                                    |
| row importing          | `isImporting` かつ name 一致                       | 対象 row disabled          | `useIsImportingSkill`, `useImportingSkillName` |
| success                | import 後 imported へ反映                          | `role="status"`            | imported selector + local state                |
| error                  | `skillError` 設定                                  | `role="alert"`             | `useSkillError`                                |
| delete confirm         | imported card delete click                         | confirm dialog             | local state                                    |
| nullish metadata       | description / arrays 欠損                          | fallback copy と 0件扱い   | defensive helpers                              |

## 新規追加した防御

- `description ?? ""` を検索と描画の両方で吸収
- リソース配列を `Array.isArray` で防御
- dialog success 判定を `throw` 依存ではなく store state 依存へ修正
