# UT-SC-01-DIP-INTERFACE: registerSkillCreatorHandlers の DIP 準拠インターフェース化

## メタ情報

| 項目       | 値                                 |
| ---------- | ---------------------------------- |
| ID         | UT-SC-01-DIP-INTERFACE             |
| 優先度     | Low                                |
| 発生元     | TASK-SC-01-IPC-WIRING-FIX Phase 10 |
| 検出日     | 2026-03-22                         |
| ステータス | 未着手                             |

## 概要

`registerSkillCreatorHandlers()` と `registerRuntimeSkillCreatorHandlers()` の引数型が具象クラス (`SkillCreatorService` / `RuntimeSkillCreatorFacade`) に依存している (P61 DIP違反)。インターフェースに変更すべき。

## 影響範囲

- `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`
- `apps/desktop/src/main/ipc/creatorHandlers.ts`

## 対応方針

1. `ISkillCreatorService` / `IRuntimeSkillCreatorFacade` インターフェースを定義
2. ハンドラ登録関数の引数型をインターフェースに変更
3. 既存テストが全 PASS することを確認

## 参照

- P61: `.claude/rules/06-known-pitfalls.md#P61`
