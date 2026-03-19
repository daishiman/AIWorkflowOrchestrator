# TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001: スキル関連IPC層不整合修正

## 概要

MECE分析で判明したスキル関連IPC層の不整合を修正する。具体的には「SKILL_UPDATE デッドチャンネル」と「SKILL_GET_DETAIL Preload API 未公開」の2件の Critical 不整合を解消し、Renderer からすべてのスキル操作チャンネルにアクセスできる状態を確立する。

## メタ情報

| 項目         | 内容                                 |
| ------------ | ------------------------------------ |
| タスクID     | TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001 |
| タスク種別   | 実装（IPC層修正）                    |
| 優先度       | Critical                             |
| ステータス   | not_started                          |
| 依存タスク   | なし（独立タスク、並列実行可能）     |
| ブロック対象 | なし                                 |
| 作成日       | 2026-03-17                           |

## 背景・問題の詳細

### Critical 1: SKILL_UPDATE デッドチャンネル

| 確認箇所                                  | 状態                                                                    |
| ----------------------------------------- | ----------------------------------------------------------------------- |
| チャンネル定数（channels.ts L189）        | `SKILL_UPDATE: "skill:update"` 定義あり                                 |
| ホワイトリスト（ALLOWED_INVOKE_CHANNELS） | 登録済み                                                                |
| IPCハンドラ（Main Process）               | **登録なし** — どのハンドラファイルにも `ipcMain.handle()` が存在しない |
| Preload API（skill-api.ts）               | 対応メソッドなし                                                        |
| Store（agentSlice）                       | 対応アクションなし                                                      |
| 影響                                      | Renderer から `skill:update` を invoke するとハンドラ未登録エラー       |

### Critical 2: SKILL_GET_DETAIL Preload API 未公開

| 確認箇所                             | 状態                                                        |
| ------------------------------------ | ----------------------------------------------------------- |
| チャンネル定数（channels.ts L179）   | 定義あり                                                    |
| IPCハンドラ（skillHandlers.ts L242） | 実装あり                                                    |
| Preload API（skill-api.ts）          | **`getDetail()` メソッドが存在しない**                      |
| 影響                                 | Main Process にハンドラがあるのに Renderer からアクセス不能 |

## 受入基準

| ID   | 基準                                                                                           |
| ---- | ---------------------------------------------------------------------------------------------- |
| AC-1 | `skill:update` チャンネルに対する `ipcMain.handle()` が登録されている                          |
| AC-2 | `unregisterSkillHandlers()` に `skill:update` の `removeHandler` が含まれている                |
| AC-3 | skill-api.ts に `getDetail()` メソッドが追加され、`SKILL_GET_DETAIL` チャンネルを invoke する  |
| AC-4 | skill-api.ts に `update()` メソッドが追加され、`SKILL_UPDATE` チャンネルを invoke する         |
| AC-5 | 全引数に P42 準拠の3段バリデーション（型チェック → 空文字列 → トリム空文字列）が適用されている |
| AC-6 | IPC契約チェックリスト Phase 1-6 を実施済み                                                     |
| AC-7 | 既存テストが全て PASS                                                                          |
| AC-8 | packages/shared と apps/desktop のチャンネル定数が整合している                                 |

## 対象ファイル

| ファイル                                               | 変更種別                                        |
| ------------------------------------------------------ | ----------------------------------------------- |
| `apps/desktop/src/main/ipc/skillHandlers.ts`           | SKILL_UPDATE ハンドラ登録追加 + unregister 追加 |
| `apps/desktop/src/preload/skill-api.ts`                | `getDetail()` / `update()` メソッド追加         |
| `apps/desktop/src/preload/channels.ts`                 | 確認のみ（変更不要の可能性）                    |
| `packages/shared/src/ipc/channels.ts`                  | 共有チャンネル定数の同期確認                    |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts` | 対応アクション追加（必要に応じて）              |

## Phase 一覧

| Phase | 名称             | ファイル                                               | ステータス  |
| ----- | ---------------- | ------------------------------------------------------ | ----------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)   | not_started |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)               | not_started |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md) | not_started |
| 4     | テスト作成       | phase-4-test-creation.md                               | not_started |
| 5     | 実装             | phase-5-implementation.md                              | not_started |
| 6     | テスト拡充       | phase-6-test-expansion.md                              | not_started |
| 7     | カバレッジ確認   | phase-7-coverage-check.md                              | not_started |
| 8     | リファクタリング | phase-8-refactoring.md                                 | not_started |
| 9     | 品質検証         | phase-9-quality-assurance.md                           | not_started |
| 10    | 最終レビュー     | phase-10-final-review.md                               | not_started |
| 11    | 手動テスト       | phase-11-manual-test.md                                | not_started |
| 12    | ドキュメント     | phase-12-documentation.md                              | not_started |
| 13    | PR作成           | phase-13-pr-creation.md                                | not_started |

## 関連落とし穴

| Pitfall | 内容                                                    |
| ------- | ------------------------------------------------------- |
| P42     | `.trim()` バリデーション漏れ                            |
| P44     | skill:import/remove IPCインターフェース不整合           |
| P45     | IPC引数命名の契約ドリフト（skillId vs skillName）       |
| P32     | 型定義の二箇所同時更新必須                              |
| P5      | リスナー二重登録（ipcMain.handle の二重登録で例外送出） |
