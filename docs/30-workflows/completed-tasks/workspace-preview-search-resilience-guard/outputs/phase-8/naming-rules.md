# Phase 8 Output: Naming Rules

| 種別           | ルール                                                          | 実例                                                                               |
| -------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| utility        | UI 名ではなく concern 名で命名する                              | `quickFileSearchResilience.ts`, `previewResilience.ts`                             |
| helper         | pure function は `build*`, `resolve*`, `format*`, `get*` を使う | `buildSearchResults`, `resolveQuickFileSearchViewState`, `formatPreviewStatusText` |
| error code     | surface 横断で使える kebab-case を使う                          | `file-read-timeout`, `structured-preview-parse`, `preview-render-crash`            |
| error category | UI 応答単位で粗く保つ                                           | `transport`, `parse`, `crash`, `no-match`                                          |

## 効果

- `useQuickFileSearch` と `WorkspaceView` が concern orchestration のみを担当する形になった
- preview error surface が string から typed object へ昇格し、再利用しやすくなった
