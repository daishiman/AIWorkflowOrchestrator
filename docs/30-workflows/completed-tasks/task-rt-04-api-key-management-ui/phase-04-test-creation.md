# Phase 4: テスト作成 - Skill Runtime API Key Panel

## メタ情報

| 項目       | 値                          |
| ---------- | --------------------------- |
| タスクID   | TASK-RT-04                  |
| Phase      | 4 - テスト作成              |
| 前提Phase  | Phase 3（設計レビュー）完了 |
| 関連Issue  | #1881                       |
| ステータス | pending                     |

## 目的

`auth-key:*` と `ApiKeySettingsPanel` の TDD テストを先行作成する。

## 実行タスク

- `auth-key:exists / set / validate / delete` のテストケースを作成する
- `ApiKeySettingsPanel` の描画・入力・保存・削除テストを作成する
- preload API mock を準備する
- AC-1〜AC-6 をテストへ写像する

## 参照資料

| 資料名               | パス                                                                 | 説明             |
| -------------------- | -------------------------------------------------------------------- | ---------------- |
| Phase 2 設計         | [phase-02-design.md](phase-02-design.md)                             | 4層契約          |
| Phase 3 設計レビュー | [phase-03-design-review.md](phase-03-design-review.md)               | 戻り先とリスク   |
| authKeyHandlers      | `apps/desktop/src/main/ipc/authKeyHandlers.ts`                       | Main IPC 正本    |
| authKeyApi           | `apps/desktop/src/preload/authKeyApi.ts`                             | Preload API 正本 |
| ApiKeySettingsPanel  | `apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx` | UI 正本          |

## 統合テスト連携

- 依存Phase: Phase 1, Phase 2, Phase 3
- Phase 5 で実装する `auth-key:*` / `ApiKeySettingsPanel` の基準を固定する
- Main / Preload / Renderer の 3 層整合を保つ

## 成果物

| 成果物         | パス                                  |
| -------------- | ------------------------------------- |
| テスト設計     | outputs/phase-4/test-design.md        |
| IPC 契約ケース | outputs/phase-4/ipc-contract-cases.md |
| UI ケース      | outputs/phase-4/ui-test-cases.md      |

## 完了条件

- [ ] テスト matrix が作成されている
- [ ] 全 AC に対応するケースがある
- [ ] mock が準備されている
- [ ] 本Phase内の全タスクを100%実行完了
