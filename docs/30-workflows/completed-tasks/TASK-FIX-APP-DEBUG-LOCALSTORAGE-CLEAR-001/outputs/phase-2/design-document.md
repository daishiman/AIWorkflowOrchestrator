# Phase 2: 設計 - 設計書

## メタ情報

| 項目     | 内容                                      |
| -------- | ----------------------------------------- |
| タスクID | TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 |
| Phase    | 2                                         |
| 実行日   | 2026-03-09                                |

## タスク1: 削除対象コードの特定

### 削除対象（17行）

```
L45: // デバッグ用: 初回起動時にストレージをクリア（TODO: テスト完了後に削除）
L46-61: useEffect(() => { ... }, []);
```

### 維持するコード

- L1: `import React, { useEffect } from "react"` - useEffect は L71, L87, L100 で使用 → **維持**
- L63以降: `useThemeInitializer()` および auth 初期化ロジック → **維持**

## タスク2: 副作用分析

| 項目                     | 分析結果                             | 影響 |
| ------------------------ | ------------------------------------ | ---- |
| useEffect import         | L71, L87, L100 で使用 → 維持         | なし |
| sessionStorage           | デバッグコードでのみ使用 → 削除可能  | なし |
| localStorage.clear()     | Zustand persist の状態破壊が停止     | 正   |
| window.location.reload() | 不要なリロードが停止                 | 正   |
| VITE_E2E_MODE チェック   | devMockAuth.ts で別途使用 → 影響なし | なし |
| skipAuth=true チェック   | devMockAuth.ts で別途使用 → 影響なし | なし |
| console.log デバッグ出力 | デバッグコード内のみ → 削除される    | 正   |

**結論**: 削除による負の副作用なし。正の効果のみ。

## タスク3: persist状態復旧設計

### 確認ポイント

1. Zustand の `persist` ミドルウェアが `localStorage` にデータを保存
2. persist hardening（TASK-07）の `customStorage` が `Set` 型安全シリアライゼーションを実装済み
3. 破損データ自動回復パスが実装済み

### 設計方針

- **削除のみ**で新規コード追加は不要
- persist の動作は既存実装（customStorage + 破損データ回復）で保証されている
- テストで動作確認を行う

## 完了条件チェック

- [x] 削除対象コードの範囲が確定していること
- [x] 副作用分析が完了し、負の影響がないことを確認
- [x] persist状態復旧の確認手順が設計されていること
- [x] 本Phase内の全タスクを100%実行完了
