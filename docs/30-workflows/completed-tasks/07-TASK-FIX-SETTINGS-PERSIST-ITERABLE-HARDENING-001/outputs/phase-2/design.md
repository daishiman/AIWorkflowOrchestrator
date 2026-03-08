# Phase 2: 設計

## アーキテクチャ設計

### 防御戦略: Array.isArray ガードパターン

persist state が破損した場合、以下の3層で防御する:

#### Layer 1: Store Hydrate（customStorage.getItem）

- expandedFolders を `Array.isArray()` でガードし、配列でなければ空 Set にフォールバック
- 配列要素は `typeof v === 'string'` でフィルタリング

#### Layer 2: Store Serialize（customStorage.setItem）

- expandedFolders を `instanceof Set` でガードし、Set でなければ空配列にフォールバック
- 配列の場合は `typeof v === 'string'` でフィルタリング

#### Layer 3: Navigation Actions（navigationSlice）

- setCurrentView: `Array.isArray(state.viewHistory)` でガード
- goBack: `Array.isArray(rawHistory)` でガード
- canGoBack: `Array.isArray(history)` でガード

### 変更対象ファイル

| ファイル                                                    | 変更内容                                                    |
| ----------------------------------------------------------- | ----------------------------------------------------------- |
| `apps/desktop/src/renderer/store/index.ts`                  | customStorage.getItem/setItem に iterable ガード追加        |
| `apps/desktop/src/renderer/store/slices/navigationSlice.ts` | setCurrentView/goBack/canGoBack に Array.isArray ガード追加 |
| `apps/desktop/src/renderer/store/index.ts`                  | useCanGoBack セレクタに Array.isArray ガード追加            |

### 設計原則

- 最小侵襲: 既存インターフェース（NavigationSlice）は変更しない
- フェイルセキュア: 破損検出時は空配列/空Setへフォールバック
- ログ: hydrate 側のみ console.warn で破損を通知
