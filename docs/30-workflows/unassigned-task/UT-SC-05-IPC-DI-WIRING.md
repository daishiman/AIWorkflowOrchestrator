# UT-SC-05-IPC-DI-WIRING: RuntimeSkillCreatorFacade DI 配線完了

## メタ情報

| 項目       | 値                              |
| ---------- | ------------------------------- |
| タスクID   | UT-SC-05-IPC-DI-WIRING          |
| 優先度     | High                            |
| 検出元     | TASK-SC-05-IMPROVE-LLM Phase 12 |
| ステータス | 未実施                          |

## 概要

`apps/desktop/src/main/ipc/index.ts` L898-902 の `RuntimeSkillCreatorFacade` コンストラクタに `skillFileManager`、`llmAdapter`、`resourceLoader` が注入されていない。improve() の LLM 統合パスが runtime で動作しない。

## 修正内容

1. 同ファイル L701 の `skillFileManager` インスタンスを `RuntimeSkillCreatorFacade` のコンストラクタ引数に追加
2. `ILLMAdapter` の実装（AnthropicAdapter 等）をインスタンス化し、コンストラクタ引数に追加
3. `ResourceLoader` をインスタンス化し、コンストラクタ引数に追加
4. plan() の LLM 統合パスも同時に有効化されることを確認

## 修正対象ファイル

- `apps/desktop/src/main/ipc/index.ts`

## 受入基準

- [ ] `RuntimeSkillCreatorFacade` に `skillFileManager`、`llmAdapter`、`resourceLoader` が注入されている
- [ ] improve() が graceful degradation ではなく LLM 呼び出しパスを通ること
- [ ] plan() の LLM 統合パスも同時に動作すること
- [ ] 既存テスト 92 件が全て PASS すること
