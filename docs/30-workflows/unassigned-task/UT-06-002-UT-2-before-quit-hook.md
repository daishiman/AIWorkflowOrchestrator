# UT-06-002-UT-2: before-quit セッション終了フック実装

| 項目     | 値             |
| -------- | -------------- |
| タスクID | UT-06-002-UT-2 |
| 優先度   | 中             |
| 元タスク | UT-06-002      |
| 検出日   | 2026-03-23     |

---

## 概要

`app.on('before-quit')` で `permissionStore.revokeSessionEntries("app-quit")` を呼び出し、セッションスコープのエントリをアプリ終了時に確実にクリアする。

## 背景・苦戦箇所

Phase 5 仕様書の Task 5-5 で設計されていたが、`apps/desktop/src/main/index.ts` への変更スコープが大きく、本タスクでは未実装のまま MINOR 判定となった。index.ts の初期化フローが複雑なため、PermissionStore インスタンスへのアクセスタイミングに注意が必要。

## 対応方針

`apps/desktop/src/main/index.ts` の app ready イベント後に `app.on('before-quit', () => { permissionStore.revokeSessionEntries("app-quit"); })` を追加。PermissionStore インスタンスは既存の DI 配線から取得。

## 変更対象ファイル

| ファイル                         | 変更種別 |
| -------------------------------- | -------- |
| `apps/desktop/src/main/index.ts` | 修正     |

## 完了条件

- [ ] before-quit イベントで revokeSessionEntries が呼ばれる
- [ ] session スコープのエントリのみがクリアされる
- [ ] permanent/time スコープのエントリは残る
- [ ] 関連テストが PASS する
