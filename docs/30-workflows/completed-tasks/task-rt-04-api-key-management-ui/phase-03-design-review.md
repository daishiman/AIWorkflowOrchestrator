# Phase 3: 設計レビューゲート - Skill Runtime API Key Panel

## メタ情報

| 項目       | 値                     |
| ---------- | ---------------------- |
| タスクID   | TASK-RT-04             |
| Phase      | 3 - 設計レビューゲート |
| 前提Phase  | Phase 1, 2 完了        |
| 関連Issue  | #1881                  |
| ステータス | pending                |

## 目的

Phase 2 の設計が `auth-key:*` 正本、`SettingsView` 主導線、`SkillLifecyclePanel` 補助導線の 3 点を矛盾なく満たすかを判定する。

## 実行タスク

- AC 設計カバレッジを確認する
- 4 層契約の分離が崩れていないか確認する
- `skill-creator:*` への逆流がないか確認する
- PASS / MINOR / MAJOR を記録する

## 参照資料

| 資料名             | パス                                                   | 用途             |
| ------------------ | ------------------------------------------------------ | ---------------- |
| Phase 2 設計       | [phase-02-design.md](phase-02-design.md)               | current contract |
| Phase 4 テスト作成 | [phase-04-test-creation.md](phase-04-test-creation.md) | 後続検証         |

## 統合テスト連携

- Phase 4 の Red テストへレビュー結果を引き継ぐ。
- drift がある場合は Phase 2 へ戻す。

## レビューチェックリスト

### AC 設計カバレッジ

| AC   | 内容                                 | 設計での対応                           | 判定    |
| ---- | ------------------------------------ | -------------------------------------- | ------- |
| AC-1 | `auth-key:exists` が `source` を返す | `AuthKeyExistsResponse` で固定         | pending |
| AC-2 | `auth-key:set` が保存を行う          | `authKeyHandlers.ts` / `authKeyApi.ts` | pending |
| AC-3 | `auth-key:validate` が有効性を返す   | `IAuthKeyService.validateKey()`        | pending |
| AC-4 | `auth-key:delete` が削除を行う       | `IAuthKeyService.deleteKey()`          | pending |
| AC-5 | 主導線・補助導線が同一契約を共有する | `SettingsView` / `SkillLifecyclePanel` | pending |
| AC-6 | `ApiKeyStatus` が 4 値に収束する     | `ApiKeySettingsPanel`                  | pending |
| AC-7 | 生の API キーが露出しない            | sanitize と mask 表示                  | pending |
| AC-8 | Phase 9/11/12 が追従できる           | outputs と manifest の整合             | pending |

### 4層整合性確認

| チェック項目 | 観点                                                            | 判定    |
| ------------ | --------------------------------------------------------------- | ------- |
| Shared       | `ApiKeyStatus` の正本が 1 箇所に収束している                    | pending |
| Main IPC     | `auth-key:*` だけを処理している                                 | pending |
| Preload      | `window.electronAPI.authKey` が公開されている                   | pending |
| Renderer     | `ApiKeySettingsPanel` と `SkillLifecyclePanel` で再利用している | pending |

### リスク確認

| リスク                                             | 影響                              | 判定    |
| -------------------------------------------------- | --------------------------------- | ------- |
| `skill-creator:*` の再導入                         | 既存契約との drift                | pending |
| `SettingsView` と `SkillLifecyclePanel` の責務混線 | 主導線/補助導線の逆転             | pending |
| `source` の説明不足                                | `saved` と `env-fallback` の誤解  | pending |
| Phase 13 の PR 前倒し                              | user approval なしの blocked 破り | pending |

## 判定基準

| 判定  | 条件                       | 対応               |
| ----- | -------------------------- | ------------------ |
| PASS  | 全チェックが満たされる     | Phase 4 へ進む     |
| MINOR | 文字列や見出しの軽微な修正 | Phase 4 で補正する |
| MAJOR | 契約または責務の誤り       | Phase 2 へ戻る     |

## 成果物

| 成果物           | パス                                    |
| ---------------- | --------------------------------------- |
| 設計レビュー結果 | outputs/phase-3/design-review-result.md |

## 完了条件

- [ ] AC 設計カバレッジが確認されている
- [ ] 4 層整合性が確認されている
- [ ] `skill-creator:*` の逆流がない
- [ ] Phase 4 への進行判断が記録されている

## 次Phase

PASS/MINOR → Phase 4（テスト作成）へ進む。MAJOR → Phase 2（設計）へ戻る。
