# Phase 5: 実装

## メタ情報

| 項目       | 値                    |
| ---------- | --------------------- |
| Phase      | 5                     |
| 機能名     | api-key-management-ui |
| 作成日     | 2026-03-29            |
| ステータス | pending               |

## 目的

Phase 2 で確定した最小 UI と既存契約再利用方針に従って実装する。

## 実行タスク

- SkillLifecyclePanel へ AuthKey 導線を統合する
- 必要最小限の subcomponent / view model を追加する
- 既存 `authKey` 契約を使って保存・検証・削除を接続する

## 参照資料

| 資料名          | パス                                     | 説明       |
| --------------- | ---------------------------------------- | ---------- |
| Phase 2         | `phase-2-design.md`                      | 設計       |
| Phase 4         | `phase-4-test-creation.md`               | テスト設計 |
| preload authKey | `apps/desktop/src/preload/authKeyApi.ts` | 再利用契約 |
| bridge          | `apps/desktop/src/preload/index.ts`      | 公開面     |

## 実行手順

### ステップ1: UI統合

1. `SkillLifecyclePanel` へ導線を追加する。
2. Settings UI との重複を発生させない。
3. env-fallback を含む状態表示を実装する。

### ステップ2: 契約接続

1. `window.electronAPI.authKey` を通して保存・検証・削除を接続する。
2. `skill-creator-api.ts` に重複メソッドを追加しない。
3. 既存型で不足がある場合のみ、UI専用の narrow な view model を最小追加する。

### ステップ3: 初回検証

1. Phase 4 の主要テストを実行する。
2. 実装差分をログに記録する。

## 統合テスト連携

- 主要 UI テストを Green 化する。
- 変更契約が preload / renderer 境界で成立することを確認する。

## 成果物

| 成果物               | パス                                               | 説明     |
| -------------------- | -------------------------------------------------- | -------- |
| 実装ログ             | `outputs/phase-5/implementation-log.md`            | 変更記録 |
| UI統合サマリー       | `outputs/phase-5/component-integration-summary.md` | UI観点   |
| runtime 契約サマリー | `outputs/phase-5/runtime-contract-summary.md`      | 契約観点 |

## 完了条件

- [ ] SkillLifecyclePanel に最小導線が統合されている
- [ ] 既存 `authKey` 契約再利用が確認されている
- [ ] Settings UI との責務重複がない
- [ ] 主要テストが通る
- [ ] **本Phase内の全タスクを100%実行完了**
