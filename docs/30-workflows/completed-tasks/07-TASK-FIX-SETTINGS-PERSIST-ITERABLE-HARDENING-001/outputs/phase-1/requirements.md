# Phase 1: 要件定義

## 問題概要

Electron sandbox 上で `object is not iterable` エラーが発生。persist された state が破損した場合、settings 遷移時と store hydrate 時に例外が発生する。

## 候補箇所

1. `navigationSlice.ts` - `[...state.viewHistory, view]` spread で非配列例外
2. `store/index.ts` - `new Set(parsed.state.expandedFolders)` で非iterable例外
3. `store/index.ts` - `Array.from(... as Set<string>)` で非iterable例外

## 受入基準

- AC-1: persist された viewHistory が配列以外（null/undefined/数値/文字列/オブジェクト）でも settings 遷移がクラッシュしない
- AC-2: persist された expandedFolders が iterable でない値でも store hydrate がクラッシュしない
- AC-3: 破損 persist state から復旧後、navigation が正常に継続できる
- AC-4: 既存テスト（22+17+40=79テスト）が全て回帰なく PASS する

## スコープ

- IN: navigationSlice.ts, store/index.ts の防御コード追加
- OUT: persist state のマイグレーション、破損原因の根本対策
