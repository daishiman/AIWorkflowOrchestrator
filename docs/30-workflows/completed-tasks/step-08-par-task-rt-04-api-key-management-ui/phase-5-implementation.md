# Phase 5: 実装

## メタ情報

| 項目   | 値                    |
| ------ | --------------------- |
| Phase  | 5                     |
| 機能名 | api-key-management-ui |
| 作成日 | 2026-03-29            |

## 目的

ApiKeySettingsPanel コンポーネント、preload API 拡張、SkillLifecyclePanel 統合を実装する。

## 実行タスク

- `packages/shared/src/types/skillCreator.ts` に `ApiKeyStatus` 型を追加する
- `apps/desktop/src/preload/skill-creator-api.ts` に AUTH_KEY 系メソッドを追加する
- `apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx` を新規作成する
- バリデーションロジックを実装する
- `SkillLifecyclePanel.tsx` に ApiKeySettingsPanel を統合する
- ユニットテストを実行し全パスを確認する

## 参照資料

| 資料名         | パス                       | 説明   |
| -------------- | -------------------------- | ------ |
| Phase 2 設計   | `phase-2-design.md`        | 設計書 |
| Phase 4 テスト | `phase-4-test-creation.md` | テスト |

## 完了条件

- [ ] `ApiKeyStatus` 型が追加されている
- [ ] preload API に AUTH_KEY 系メソッドが追加されている
- [ ] ApiKeySettingsPanel が実装されている
- [ ] バリデーションが動作する
- [ ] SkillLifecyclePanel に統合されている
- [ ] ユニットテストが全パスする
- [ ] **本Phase内の全タスクを100%実行完了**
