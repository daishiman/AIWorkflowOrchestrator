# Cache Invalidation Design

## cache key

`<manifestPath>:<manifestMtimeMs>:<schemaVersion>:<resourceDescriptorHash>`

## invalid 条件

| 条件                     | 扱い              |
| ------------------------ | ----------------- |
| manifest path 変更       | 別 cache entry    |
| manifest mtime 変更      | 再読込            |
| schemaVersion 変更       | 再検証 + 再読込   |
| resource descriptor 変更 | hash 更新で再読込 |

## 今回の hash 対象

- resource `id`
- resource `kind`
- 正規化後 `absolutePath`
- `phaseIds`
