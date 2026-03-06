# Phase 2 状態マトリクス

| 優先度 | 条件                                 | 表示                             |
| ------ | ------------------------------------ | -------------------------------- |
| P1     | `isLoadingSkills=true`               | loading state のみ               |
| P2     | imported=0, available=0, query=""    | global empty                     |
| P3     | query!="" かつ両セクション結果 0     | global no-result                 |
| P4     | success message あり                 | `role="status"` を検索直下に表示 |
| P5     | `skillError` あり かつ dialog closed | panel `role="alert"`             |
| P6     | `skillError` あり かつ dialog open   | dialog `role="alert"` のみ       |
| P7     | imported visible=0 かつ available>0  | imported inline empty            |
| P8     | available visible=0 かつ imported>0  | available inline empty           |
| P9     | それ以外                             | 2 セクション通常表示             |

## 成功判定

- `importSkill` の resolve だけでは成功と見なさない
- imported 一覧に対象 skill が存在する
- `skillError` が null
- available 一覧から対象 row が消えている
