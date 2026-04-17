---

# 要件定義書: settings:update ハンドラのディープマージ対応

## 機能要件

- FR-1: `settings:update` IPCハンドラにてネストされたオブジェクトを部分更新しても、同一親キー配下の他フィールドが保持されること
- FR-2: 配列フィールドは上書き動作（ディープマージ非対象）
- FR-3: `null` 値は上書き扱い（`null` が設定される）
- FR-4: `undefined` 値は省略扱い（基底値が維持される）
- FR-5: `deepMerge` 関数は `storeHandlers.ts` 内プライベート関数として実装
- FR-6: `settings:update` の payload は plain object に限定し、非 plain object は validation error で拒否する

## 非機能要件

- NFR-1: `any` 型を使用しない型安全な実装（TypeScript strict モード準拠）
- NFR-2: 既存テスト（registerStoreHandlers）が全件 PASS し続けること
- NFR-3: 外部ライブラリを追加しない（lodash 等不使用）
- NFR-4: prototype pollution を防止し、危険キー（`__proto__` / `constructor` / `prototype`）を無視すること

## スコープ

- 含む: `storeHandlers.ts` の `settings:update` ハンドラ修正・`deepMerge` 関数追加・`storeHandlers.test.ts` へのテスト追加
- 含まない: `UserSettings` 型定義の変更・他ハンドラの変更・DB/ストア変更

## 問題の背景

現在の `settings:update` ハンドラは `{ ...current, ...updates }` シャローマージのみ対応。
将来ネスト設定（`theme.color`・`notification.enabled` 等）追加時にデータ消失バグを引き起こすリスクがある。
