# 要件定義書

## タスク ID

TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001

## 目的

persist された `expandedFolders` および `viewHistory` が iterable でない値を保持した場合に発生する `object is not iterable` 例外を防止し、アプリケーションの堅牢性を向上させる。

## 問題の根拠（コード分析）

### 1. `store/index.ts:87` - customStorage.getItem の expandedFolders 復元

```typescript
parsed.state.expandedFolders = new Set(parsed.state.expandedFolders);
```

- `parsed.state.expandedFolders` が `null`、`undefined`、`number`、`object`（非配列）等の iterable でない値の場合、`new Set()` が `TypeError: object is not iterable` を送出する
- localStorage のデータ破損、手動編集、バージョン移行などで発生しうる

### 2. `store/index.ts:100-103` - customStorage.setItem の expandedFolders 直列化

```typescript
expandedFolders: Array.from(
  ((value as Record<string, unknown>).state as Record<string, unknown>)
    .expandedFolders as Set<string>,
),
```

- `expandedFolders` が `Set` でない場合（例: `undefined`、`null`、プレーンオブジェクト）、`Array.from()` が予期しない結果を返すか例外を送出する
- `as Set<string>` の型アサーションは実行時検証を行わない（P19 パターン）

### 3. `navigationSlice.ts:37` - viewHistory のスプレッド

```typescript
viewHistory: [...state.viewHistory, view],
```

- `state.viewHistory` が配列でない場合（例: `undefined`、`null`、`string`）、スプレッド演算子が `TypeError` を送出する
- `viewHistory` は `partialize` の persist 対象外であるため、直接の persist 破損は発生しないが、store の hydrate 処理で state がマージされる際に不正な型が混入する可能性がある

### 4. `partialize` 設定（store/index.ts:139-150）

- `viewHistory` は persist 対象外（partialize に含まれない）
- `expandedFolders` は persist 対象（line 143）
- したがって、localStorage からの復元で直接影響を受けるのは `expandedFolders` のみ。ただし `viewHistory` は hydrate 時の state マージで間接的に影響を受ける可能性がある

## 機能要件

### FR-01: viewHistory の iterable ガード

- `navigationSlice.ts` の `setCurrentView` アクション内で `state.viewHistory` をスプレッドする前に、配列であることを検証する
- 配列でない場合は空配列 `[]` にフォールバックし、現在の view を初期要素として設定する

### FR-02: expandedFolders の getItem ガード

- `customStorage.getItem` で `parsed.state.expandedFolders` を `new Set()` に渡す前に、iterable であることを検証する
- iterable でない場合は空の `Set` を生成し、データ復元を安全に継続する
- 検証には `Array.isArray()` を使用する（persist 時に配列に直列化されるため）

### FR-03: expandedFolders の setItem ガード

- `customStorage.setItem` で `expandedFolders` を `Array.from()` に渡す前に、`Set` インスタンスであることを検証する
- `Set` でない場合は空配列 `[]` にフォールバックして直列化する
- 型アサーション `as Set<string>` を実行時検証に置換する（P19 対策）

### FR-04: 破損 persist データの正規化

- 上記 FR-01〜FR-03 のガードにより、破損データが自動的に安全なデフォルト値に正規化されること
- 正規化後も既存の正常なデータは影響を受けないこと

## 非機能要件

### NFR-01: 既存テストとの非競合

- 既存の infinite-loop-prevention テスト（P31 対策）が引き続き PASS すること
- 既存の navigationSlice テスト、store テストに影響を与えないこと

### NFR-02: パフォーマンス影響なし

- ガード処理は `Array.isArray()` / `instanceof Set` 等の O(1) チェックのみで構成し、パフォーマンスへの影響を無視できるレベルに留める
- localStorage の読み書き頻度は変更しない

### NFR-03: 型安全性の維持

- 型アサーション（`as`）による実行時検証バイパスを排除し、実行時バリデーションに置換する（P19/P48 準拠）
- `strict: true` 環境での TypeScript コンパイルが通ること

### NFR-04: エラーの非伝播

- ガード処理内で発生した異常は上位に伝播させず、安全なデフォルト値で吸収する
- コンソールへの警告ログは許容するが、ユーザー向けエラー表示は行わない
