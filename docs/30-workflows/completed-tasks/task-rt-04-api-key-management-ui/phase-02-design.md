# Phase 2: 設計 - Skill Runtime API Key Panel

## メタ情報

| 項目       | 値           |
| ---------- | ------------ |
| タスクID   | TASK-RT-04   |
| Phase      | 2 - 設計     |
| 前提Phase  | Phase 1 完了 |
| 関連Issue  | #1881        |
| ステータス | pending      |

## 目的

`auth-key:*` の 4 層契約と UI 導線を、`SettingsView` 主導線 / `SkillLifecyclePanel` 補助導線の役割分担つきで固定する。

## 実行タスク

- Shared / Main / Preload / Renderer の責務境界を定義する
- `source` を返す `auth-key:exists` の戻り値契約を固定する
- `ApiKeySettingsPanel` の状態遷移を明文化する
- `SettingsView` と `SkillLifecyclePanel` の関係を drift なく記述する

## 参照資料

| 資料名               | パス                                                   | 用途             |
| -------------------- | ------------------------------------------------------ | ---------------- |
| Phase 1 要件定義     | [phase-01-requirements.md](phase-01-requirements.md)   | current contract |
| Phase 3 設計レビュー | [phase-03-design-review.md](phase-03-design-review.md) | レビュー観点     |

## 統合テスト連携

- Phase 4 のテスト作成へ current contract を引き継ぐ。
- 4 層整合性テーブルの内容を Phase 4 / 5 の current facts と揃える。

## 4層整合性テーブル

| 層       | 役割                                                      | 正本                                               |
| -------- | --------------------------------------------------------- | -------------------------------------------------- |
| Shared   | `ApiKeyStatus` を提供する                                 | `packages/shared/src/types/skillCreator.ts`        |
| Main IPC | `auth-key:set/exists/validate/delete` を処理する          | `apps/desktop/src/main/ipc/authKeyHandlers.ts`     |
| Preload  | `window.electronAPI.authKey` を公開する                   | `apps/desktop/src/preload/authKeyApi.ts`           |
| Renderer | `ApiKeySettingsPanel` と `SkillLifecyclePanel` で利用する | `apps/desktop/src/renderer/components/skill/*.tsx` |

## 型・契約設計

```ts
export type ApiKeyStatus = "not_set" | "validating" | "configured" | "error";

export interface AuthKeySetRequest {
  key: string;
}

export interface AuthKeyExistsResponse {
  exists: boolean;
  source: "saved" | "env-fallback" | "not-set";
}
```

- `auth-key:set` は保存成功時に `{ success: true }` を返す
- `auth-key:exists` は `exists` と `source` を返す
- `auth-key:validate` は `{ valid: boolean, error?: string }` を返す
- `auth-key:delete` は削除成功時に `{ success: true }` を返す

## UI設計

### `ApiKeySettingsPanel`

| 項目 | 内容                                                               |
| ---- | ------------------------------------------------------------------ |
| 責務 | API キーの設定・検証・削除                                         |
| 状態 | `status`, `inputValue`, `validationError`, `apiError`, `keySource` |
| 入力 | `window.electronAPI.authKey.exists/set/validate/delete`            |
| 表示 | `未設定 / 検証中 / 設定済み / エラー`                              |

### `SkillLifecyclePanel`

- 既存の実行・検証フローを崩さず、`<ApiKeySettingsPanel />` を補助導線として表示する
- step 配列や既存の別ウィザード導線へは戻さない
- `SettingsView` の主導線とは contract を共有するが、UI 責務は分離する

### `SettingsView`

- 主導線として `AuthKeySection` を持つ既存構成を維持する
- 本 task では `SettingsView` を再実装せず、同一契約の参照点として扱う
- `authMode === "api-key"` 時の表示が current contract とずれないことを確認する

## セキュリティ設計

- `validateIpcSender` を全 Main IPC に適用する
- `trim()` 後空文字を拒否する
- API キーをログ・エラーメッセージへ生で出さない
- `source` と `status` 以外の余計な状態を返さない

## 変更対象ファイル

| 区分     | ファイル                                                                                        |
| -------- | ----------------------------------------------------------------------------------------------- |
| 設計対象 | `packages/shared/src/types/skillCreator.ts` / `packages/shared/src/types/index.ts`              |
| 設計対象 | `apps/desktop/src/main/ipc/authKeyHandlers.ts` / `apps/desktop/src/main/services/auth/types.ts` |
| 設計対象 | `apps/desktop/src/preload/authKeyApi.ts`                                                        |
| 設計対象 | `apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx`                            |
| 設計対象 | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                            |
| 参照のみ | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                                        |

## 成果物

| 成果物 | パス                      |
| ------ | ------------------------- |
| 設計書 | outputs/phase-2/design.md |

## 完了条件

- [ ] 4層整合性が記述されている
- [ ] `ApiKeyStatus` と `auth-key:*` の契約が一致している
- [ ] `SettingsView` / `SkillLifecyclePanel` の主導線・補助導線が明文化されている
- [ ] セキュリティ境界が明記されている

## 次Phase

Phase 3（設計レビューゲート）へ進む。
