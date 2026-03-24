# UT-SC-05-UT-2: track() 関数の async コールバック公式対応

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| ID     | UT-SC-05-UT-2                   |
| 検出元 | UT-SC-05-IPC-DI-WIRING Phase 12 |
| 優先度 | Low                             |
| 作成日 | 2026-03-24                      |

## 概要

`track()` 関数（`index.ts` L546）は `fn: () => void` 型のコールバックのみを受け入れる。非同期の依存取得が必要な場合、IIFE パターン（`void (async () => { ... })()`）で回避しているが、`track()` が `async` コールバックを公式にサポートすれば IIFE パターンが不要になる。

## 実装方針

1. `track()` の型を `fn: () => void | Promise<void>` に拡張
2. `safeRegister()` 内で `Promise` を検出した場合は await してからカウントを計上
3. 既存の同期コールバックとの後方互換性を維持

## 苦戦箇所・知見

- `track()` / `safeRegister()` が同期専用設計であるため、非同期依存の取得に IIFE が必要になった。この根本原因は設計時に非同期ハンドラ登録のユースケースが想定されていなかったこと
- IIFE パターンでは `successCount` が「登録試行」を意味し「登録完了」を意味しない。この意味的精度の低下は implementation-guide.md で「track() を async 化」と誤記するミスも誘発した
- SubAgent に委譲した未タスク指示書でパス名が短縮形（例: `UT-SC-05-UT-2.md`）で記述され、実ファイル名（`ut-sc-05-ut-2-track-async-callback.md`）と乖離するパターンが発生した（P63派生）

## 参照

- `apps/desktop/src/main/ipc/index.ts` L546（track 関数定義）
- Phase 2 設計書 Task 5（IIFE パターンの採用根拠）
