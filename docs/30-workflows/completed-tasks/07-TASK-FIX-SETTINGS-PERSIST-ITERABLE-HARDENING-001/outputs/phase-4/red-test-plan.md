# Phase 4: Red テスト計画

> タスク: TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001
> 作成日: 2026-03-07

---

## Red テスト一覧

### navigationSlice テスト（既存ファイルに追加）

ファイル: `apps/desktop/src/renderer/store/slices/navigationSlice.test.ts`

| テスト ID | DD    | ケース                                            | 期待結果                      |
| --------- | ----- | ------------------------------------------------- | ----------------------------- |
| RED-01    | DD-03 | viewHistory が null で setCurrentView("settings") | crash せず viewHistory=[view] |
| RED-02    | DD-03 | viewHistory が undefined で setCurrentView        | crash せず viewHistory=[view] |
| RED-03    | DD-03 | viewHistory が 42 で setCurrentView               | crash せず viewHistory=[view] |
| RED-04    | DD-03 | viewHistory が "dashboard" で setCurrentView      | crash せず viewHistory=[view] |
| RED-05    | DD-03 | viewHistory が {} で setCurrentView               | crash せず viewHistory=[view] |
| RED-06    | DD-04 | viewHistory が null で goBack()                   | crash せず currentView 維持   |
| RED-07    | DD-04 | viewHistory が undefined で goBack()              | crash せず currentView 維持   |
| RED-08    | DD-04 | viewHistory が 42 で goBack()                     | crash せず currentView 維持   |
| RED-09    | DD-05 | viewHistory が null で canGoBack()                | crash せず false 返却         |
| RED-10    | DD-05 | viewHistory が undefined で canGoBack()           | crash せず false 返却         |
| RED-11    | DD-05 | viewHistory が 42 で canGoBack()                  | crash せず false 返却         |

### customStorage テスト（新規ファイル）

ファイル: `apps/desktop/src/renderer/store/__tests__/customStorage.test.ts`

| テスト ID | DD       | ケース                                         | 期待結果               |
| --------- | -------- | ---------------------------------------------- | ---------------------- |
| RED-12    | DD-01    | expandedFolders が null で getItem             | 空 Set に復旧          |
| RED-13    | DD-01    | expandedFolders が 42 で getItem               | 空 Set に復旧          |
| RED-14    | DD-01    | expandedFolders が "string" で getItem         | 空 Set に復旧          |
| RED-15    | DD-01    | expandedFolders が {} で getItem               | 空 Set に復旧          |
| RED-16    | DD-01    | expandedFolders が正常配列で getItem           | 正しい Set に変換      |
| RED-17    | DD-01    | expandedFolders が混合型配列で getItem         | string のみフィルタ    |
| RED-18    | DD-02    | expandedFolders が Set で setItem              | 配列に正常変換         |
| RED-19    | DD-02    | expandedFolders が null で setItem             | 空配列にフォールバック |
| RED-20    | DD-02    | expandedFolders が 42 で setItem               | 空配列にフォールバック |
| RED-21    | DD-02    | expandedFolders が配列で setItem               | string フィルタ後使用  |
| RED-22    | DD-01+02 | Set → setItem → getItem → Set ラウンドトリップ | 一貫性維持             |

---

## 破損 Fixture 定義

```typescript
// 非配列の expandedFolders
const corruptedExpandedFolders = [null, 42, "string", { key: "value" }, true];

// 混合型配列
const mixedArray = [1, "folder-a", null, "folder-b", true];

// 非配列の viewHistory
const corruptedViewHistory = [
  null,
  undefined,
  42,
  "dashboard",
  { view: "editor" },
];
```

---

## テスト構造

```
navigationSlice.test.ts
  └─ iterable hardening (TASK-FIX-...)
       ├─ setCurrentView - viewHistory破損時 (5 cases)
       ├─ goBack - viewHistory破損時 (5 cases)
       └─ canGoBack - viewHistory破損時 (5 cases)

customStorage.test.ts
  └─ customStorage iterable hardening (TASK-FIX-...)
       ├─ getItem - expandedFolders ガード (6 cases)
       ├─ setItem - expandedFolders ガード (4 cases)
       └─ ラウンドトリップ (1 case)
```
