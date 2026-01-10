# TDD Red State Report

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| タスクID   | CONV-05-03                    |
| 機能名     | 履歴/ログ表示UIコンポーネント |
| バージョン | 1.0                           |
| 作成日     | 2026-01-10                    |
| Phase      | 4 (TDD: Red)                  |

---

## TDD Red状態確認

### テストファイル作成状況

| ファイル                  | 作成 | テストケース数 |
| ------------------------- | ---- | -------------- |
| useVersionHistory.test.ts | ✓    | 10             |
| useVersionDetail.test.ts  | ✓    | 8              |
| useConversionLogs.test.ts | ✓    | 11             |
| useRestore.test.ts        | ✓    | 6              |
| VersionHistory.test.tsx   | ✓    | 24             |
| VersionDetail.test.tsx    | ✓    | 20             |
| ConversionLogs.test.tsx   | ✓    | 19             |
| RestoreDialog.test.tsx    | ✓    | 12             |
| **合計**                  | 8    | **110**        |

### 実装ファイル状況（Red確認）

| ファイル                      | 存在 | 期待される失敗理由 |
| ----------------------------- | ---- | ------------------ |
| hooks/useVersionHistory.ts    | ✗    | Module not found   |
| hooks/useVersionDetail.ts     | ✗    | Module not found   |
| hooks/useConversionLogs.ts    | ✗    | Module not found   |
| hooks/useRestore.ts           | ✗    | Module not found   |
| components/VersionHistory.tsx | ✗    | Module not found   |
| components/VersionDetail.tsx  | ✗    | Module not found   |
| components/ConversionLogs.tsx | ✗    | Module not found   |
| components/RestoreDialog.tsx  | ✗    | Module not found   |

---

## テストカテゴリ分布

| カテゴリ         | 件数 | 割合  |
| ---------------- | ---- | ----- |
| 正常系           | 56   | 50.9% |
| 異常系           | 18   | 16.4% |
| エッジケース     | 12   | 10.9% |
| アクセシビリティ | 18   | 16.4% |
| 境界値           | 6    | 5.5%  |
| **合計**         | 110  | 100%  |

---

## テスト要件カバレッジ

### 機能要件（FR）

| 要件ID | 要件名             | 関連テスト数 | カバー |
| ------ | ------------------ | ------------ | ------ |
| FR-01  | 履歴一覧表示       | 12           | ✓      |
| FR-02  | バージョン詳細表示 | 10           | ✓      |
| FR-03  | バージョン復元機能 | 8            | ✓      |
| FR-04  | 復元確認ダイアログ | 12           | ✓      |
| FR-05  | 変換ログ表示       | 14           | ✓      |
| FR-06  | ページネーション   | 10           | ✓      |

### 非機能要件（NFR）

| 要件ID | 要件名             | 関連テスト数 | カバー |
| ------ | ------------------ | ------------ | ------ |
| NFR-01 | アクセシビリティ   | 18           | ✓      |
| NFR-02 | レスポンシブ表示   | 6            | ✓      |
| NFR-03 | エラーハンドリング | 12           | ✓      |
| NFR-04 | パフォーマンス     | 4            | ✓      |

---

## 次のPhase（Green）への引継ぎ事項

### 実装優先順位

1. **型定義** - VersionHistoryItem, ConversionLog等
2. **Hooks実装** - useVersionHistory → useVersionDetail → useConversionLogs → useRestore
3. **Atomsコンポーネント** - LoadMoreButton, LogEntry
4. **Moleculesコンポーネント** - VersionHistoryItem
5. **Organismsコンポーネント** - VersionHistory, VersionDetail, ConversionLogs, RestoreDialog

### モック境界

```
テスト ─▶ Hooks/Components ─▶ window.historyAPI (Mock) ─▶ IPC
```

### 実装時の注意点

1. `window.historyAPI`の型定義を先に作成
2. Result型パターンに従ったエラーハンドリング
3. ARIA属性の適切な設定
4. data-level属性によるログレベル識別

---

## 関連ドキュメント

| 資料名         | パス                                         |
| -------------- | -------------------------------------------- |
| テスト仕様書   | `outputs/phase-4/test-specification.md`      |
| テストケース   | `outputs/phase-4/test-cases.md`              |
| 統合テスト設計 | `outputs/phase-4/integration-test-design.md` |
| Props設計      | `outputs/phase-2/props-design.md`            |
| Hooks設計      | `outputs/phase-2/hooks-design.md`            |
