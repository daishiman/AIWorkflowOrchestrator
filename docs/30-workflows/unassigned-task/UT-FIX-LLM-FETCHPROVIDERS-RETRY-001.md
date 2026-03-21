# UT-FIX-LLM-FETCHPROVIDERS-RETRY-001: fetchProviders失敗時のリトライとバリデーション連携

## 概要

fetchProvidersが失敗した場合、永続化値のバリデーションがスキップされる（providers空配列で判断保留）。リトライ成功時にバリデーションが確実に実行されるかの検証が必要。

## 背景

TASK-FIX-LLM-CONFIG-PERSISTENCE で `validateAndSyncPersistedConfig` を実装したが、`availableProviders` が空配列の場合は判断を保留する設計。fetchProvidersが失敗→リトライ→成功した場合に、バリデーションと同期が正しく実行されることの統合テストが不足している。

## 受入基準

- [ ] fetchProviders失敗→リトライ→成功のシナリオで、永続化値のバリデーションが実行されることを検証するテストを追加する
- [ ] リトライ時に二重同期が発生しないことを確認する

## 優先度

MEDIUM

## 関連

- TASK-FIX-LLM-CONFIG-PERSISTENCE
- arch-state-management.md
- llm-ipc-types.md
