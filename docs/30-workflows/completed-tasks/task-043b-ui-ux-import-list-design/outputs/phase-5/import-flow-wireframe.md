# Phase 5 追加導線ワイヤー

```text
Available Row
  └─ [追加する]
      └─ SkillImportDialog open
          ├─ [キャンセル] -> dialog close -> trigger focus return
          └─ [追加する]
              ├─ success -> imported list へ移動 -> status -> imported card focus
              └─ failure -> dialog keep open -> alert
```

## 成功条件

- imported に対象 skill が存在する
- available から対象 row が消える
- `skillError` が残っていない
