# スコープ境界定義

## タスク ID

TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001

## スコープ内

### S-01: navigationSlice.ts の viewHistory スプレッドガード

- **対象ファイル**: `apps/desktop/src/renderer/store/slices/navigationSlice.ts`
- **対象箇所**: line 37 `[...state.viewHistory, view]`
- **修正内容**: `state.viewHistory` が配列であることを `Array.isArray()` で検証し、非配列の場合は空配列にフォールバックする
- **影響範囲**: `setCurrentView` アクションのみ

### S-02: store/index.ts の customStorage.getItem expandedFolders ガード

- **対象ファイル**: `apps/desktop/src/renderer/store/index.ts`
- **対象箇所**: line 86-88 `new Set(parsed.state.expandedFolders)`
- **修正内容**: `parsed.state.expandedFolders` が `Array.isArray()` を満たすことを検証し、非配列の場合は `new Set()` (空 Set) を生成する
- **影響範囲**: localStorage からの store 復元処理のみ

### S-03: store/index.ts の customStorage.setItem expandedFolders ガード

- **対象ファイル**: `apps/desktop/src/renderer/store/index.ts`
- **対象箇所**: line 100-103 `Array.from(... as Set<string>)`
- **修正内容**: `expandedFolders` が `Set` インスタンスであることを `instanceof Set` で検証し、非 Set の場合は空配列 `[]` にフォールバックする。型アサーション `as Set<string>` を実行時検証に置換する
- **影響範囲**: store の localStorage 書き込み処理のみ

### S-04: 破損 fixture を使ったテスト追加

- **追加ファイル**: `apps/desktop/src/renderer/store/__tests__/persist-iterable-hardening.test.ts`（予定）
- **テスト内容**:
  - 破損した `expandedFolders`（`null`, `undefined`, `123`, `{}`, `"string"`）での getItem テスト
  - 非 Set な `expandedFolders` での setItem テスト
  - 非配列な `viewHistory` での setCurrentView テスト
- **影響範囲**: 新規テストファイルの追加のみ。既存テストへの変更なし

## 非スコープ

### OUT-01: SettingsView の UI 文言改修

- **理由**: 本タスクは store 層の堅牢性向上が目的であり、UI 層の表示文言は対象外
- **該当ファイル**: `apps/desktop/src/renderer/components/settings/` 配下

### OUT-02: persist ライブラリの全面置換

- **理由**: Zustand persist ミドルウェア自体の置換は影響範囲が広すぎ、本タスクのスコープを超える
- **該当**: `zustand/middleware` の persist 実装

### OUT-03: navigation 全体の設計刷新

- **理由**: viewHistory の管理方式（配列ベース vs スタックベース等）の設計変更は別タスクで対応すべき
- **該当ファイル**: `navigationSlice.ts` 全体の再設計

### OUT-04: 他 slice の persist hardening

- **理由**: 本タスクは `expandedFolders` と `viewHistory` に限定する。他の persist 対象フィールド（`currentView`, `selectedFile`, `userProfile` 等）の iterable ガードは別タスクで対応する
- **該当フィールド**: `partialize` で指定された `expandedFolders` 以外の全フィールド

## 依存関係

| 依存元                    | 依存先                      | 種別       |
| ------------------------- | --------------------------- | ---------- |
| S-02 (getItem ガード)     | customStorage の既存実装    | 既存コード |
| S-03 (setItem ガード)     | customStorage の既存実装    | 既存コード |
| S-01 (viewHistory ガード) | navigationSlice の既存実装  | 既存コード |
| S-04 (テスト)             | S-01, S-02, S-03 の修正完了 | 前提条件   |

## リスク

| リスク                                 | 影響度 | 対策                                             |
| -------------------------------------- | ------ | ------------------------------------------------ |
| ガード処理が正常データの動作を変更する | 中     | 正常データでの回帰テストを必ず含める             |
| Set/Array 変換の境界ケース見落とし     | 低     | 空 Set、要素数 1、大量要素のケースをテストする   |
| 既存テストとの干渉                     | 低     | 新規テストファイルとして追加し、既存を変更しない |
