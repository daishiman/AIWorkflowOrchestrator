# Phase 1: 要件定義

## メタ情報

| 項目     | 値                        |
| -------- | ------------------------- |
| Phase    | 1                         |
| タスクID | TASK-SC-01-IPC-WIRING-FIX |
| 作成日   | 2026-03-22                |

## 目的

P65（dead-end namespace）パターンの現状を調査し、`creatorHandlers.ts` と `skillCreatorHandlers.ts` の間の責務境界を明確に定義する。`skill-creator:*` 全16チャネルの一覧を確定し、統合方針を決定するための要件を固める。

## 実行タスク

1. `creatorHandlers.ts` に登録されている全チャネル名を列挙する
2. `skillCreatorHandlers.ts` に登録されている全チャネル名を列挙する
3. `channels.ts` に定義された定数と実際の登録チャネルを照合する
4. Preload の allowlist に含まれるチャネルと dead-end になっているチャネルを区別する
5. `skill-creator:*` 16チャネルを確定し、各チャネルの責務を整理する
6. P65パターンが現状どの範囲で発生しているかを調査レポートとして記録する
7. 機能要件（FR-4前提）および受入基準（AC-7）を文書化する

## 参照資料

- `apps/desktop/src/main/ipc/creatorHandlers.ts`
- `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`
- `apps/desktop/src/preload/channels.ts`
- `packages/shared/src/types/skillCreator.ts`
- `.claude/rules/06-known-pitfalls.md#P65`
- `.claude/rules/04-electron-security.md#IPC セキュリティ原則`

## 成果物

- Phase 1 要件定義書（本ファイル）
- `skill-creator:*` チャネル一覧表（16チャネル）
- P65パターン発生箇所の調査レポート
- FR-4前提・AC-7の受入基準定義

## 完了条件

- [ ] `creatorHandlers.ts` に登録されている全チャネル名が列挙されている
- [ ] `skillCreatorHandlers.ts` に登録されている全チャネル名が列挙されている
- [ ] dead-end になっているチャネルが特定されている（P65パターン確認）
- [ ] `skill-creator:*` 16チャネルの一覧が確定している
- [ ] FR-4前提の要件が文書化されている
- [ ] AC-7（後方互換）の受入基準が明確に記載されている

## 次のPhase

Phase 2: 設計
