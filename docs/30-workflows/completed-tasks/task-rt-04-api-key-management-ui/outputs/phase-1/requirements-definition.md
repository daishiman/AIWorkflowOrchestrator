# 要件定義サマリー - Skill Runtime API Key Panel

## タスクID: TASK-RT-04 / Phase 1

## 目的

`SettingsView` を主導線、`SkillLifecyclePanel` を補助導線として、同一の `auth-key:*` IPC 契約で API キーの存在確認・保存・検証・削除を扱う。

## スコープ

**含むもの**

- `auth-key:set / exists / validate / delete` の 4 IPC チャンネル
- `AuthKeyStatus` (not_set / validating / configured / error) に基づく UI 状態管理
- `ApiKeySettingsPanel` と `SkillLifecyclePanel` の統合
- `SettingsView` との contract 整合確認

**含まないもの**

- `skill-creator:*` の新規 IPC namespace
- provider ごとの API キー管理の再設計
- commit / PR / push

## 受入条件 (AC-1〜AC-8)

| AC   | 内容                                                                                            |
| ---- | ----------------------------------------------------------------------------------------------- |
| AC-1 | `auth-key:exists` が `exists` と `source` を返し、`not-set / saved / env-fallback` を判別できる |
| AC-2 | `auth-key:set` が API キーを保存し、成功/失敗を一貫したレスポンスで返す                         |
| AC-3 | `auth-key:validate` が入力キーの検証結果を返す                                                  |
| AC-4 | `auth-key:delete` が保存済みキーを削除できる                                                    |
| AC-5 | `SettingsView` 主導線と `SkillLifecyclePanel` 補助導線が同一契約を共有する                      |
| AC-6 | `ApiKeyStatus` が `not_set / validating / configured / error` に収束する                        |
| AC-7 | エラー出力に API キーの生値が含まれない                                                         |
| AC-8 | Phase 4 / 9 / 11 / 12 の成果物がすべて整合する                                                  |
