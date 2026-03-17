# AI_CHECK_CONNECTION legacy 整理と後方互換テスト - タスク指示書

## メタ情報

| 項目         | 内容                                                                           |
| ------------ | ------------------------------------------------------------------------------ |
| タスクID     | UT-TASK06-004                                                                  |
| タスク名     | AI_CHECK_CONNECTION legacy 整理と後方互換テスト                                |
| 分類         | IPC契約整備                                                                    |
| 対象機能     | AI health check 経路（`ai:check-connection` / `llm:check-health`）             |
| 優先度       | 中                                                                             |
| 見積もり規模 | 小規模                                                                         |
| ステータス   | 未実施                                                                         |
| 発見元       | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 GAP-02 / DRIFT-4 / Phase 11 DI-0001 |
| 発見日       | 2026-03-17                                                                     |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

実装は `AI_CHECK_CONNECTION` を legacy 互換として保持している一方、Task06 文書には「廃止完了」の記述が残り、契約解釈が分裂している。

### 1.2 問題点・課題

- 新規実装者が legacy channel を誤用する可能性。
- テストと仕様書の前提が一致しない。

### 1.3 放置した場合の影響

- health check で二重経路ドリフトが再発。
- Phase 12 同期のたびに矛盾修正が必要。

## 2. 何を達成するか（What）

### 2.1 目的

`AI_CHECK_CONNECTION` の存廃方針を「legacy残置（新規利用禁止）」として明文化し、削除判断までの移行条件を固定する。

### 2.2 最終ゴール

- system spec に legacy 方針が明記される。
- `llm:check-health` を primary とする実装ルールが定着する。
- 削除時に必要な互換テスト一覧が揃う。

### 2.3 スコープ

#### 含むもの

- 仕様書の契約修正（存続/廃止方針）。
- `AI_CHECK_CONNECTION` 参照箇所一覧化。
- 削除条件（使用箇所0件、互換テストPASS）の定義。

#### 含まないもの

- このタスク内での即時削除実装。
- LLM health ロジックの再設計。

### 2.4 成果物

- 更新済み `api-ipc-system-core.md` / `llm-ipc-types.md`。
- 削除条件付きチェックリスト。

## 3. どのように実行するか（How）

### 3.1 前提条件

Task06 実装・runtime-sync テストがGREENであること。

### 3.2 依存タスク

- TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001（完了）

### 3.3 必要な知識

- IPC契約管理
- 後方互換運用

### 3.4 推奨アプローチ

1. まず `AI_CHECK_CONNECTION` の実利用とテスト利用を棚卸し。
2. system spec を実装実態へ同期（legacy明記）。
3. 削除判定ゲートを定義して次タスクへ移譲。

## 4. 実行手順

1. `rg -n "AI_CHECK_CONNECTION|ai:check-connection|checkConnection\(" apps/desktop/src` を実行。
2. system spec へ legacy policy を追加。
3. 削除時の受入基準（0参照 + テストPASS）を task 化。

## 5. 完了条件チェックリスト

- [ ] legacy policy が system spec に明記される
- [ ] primary 経路が `llm:check-health` で固定される
- [ ] 削除判定の受入基準が文書化される

## 6. 検証方法

- `rg -n "AI_CHECK_CONNECTION|ai:check-connection|checkConnection\(" apps/desktop/src .claude/skills/aiworkflow-requirements/references`
- `pnpm --filter @repo/desktop exec vitest run src/main/ipc/aiHandlers.test.ts src/main/ipc/__tests__/aiHandlers.runtime-sync.test.ts`

## 7. リスクと対策

| リスク                  | 影響度 | 発生確率 | 対策                              |
| ----------------------- | ------ | -------- | --------------------------------- |
| legacy 放置が恒久化する | 中     | 中       | 削除判定ゲートを期限付きで管理    |
| 一括削除で互換破壊      | 高     | 低       | 参照ゼロ確認 + 回帰テストを必須化 |

## 8. 参照情報

- `apps/desktop/src/main/ipc/aiHandlers.ts`
- `apps/desktop/src/preload/index.ts`
- `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`

## 9. 備考

Task06 の DI-0001 から formalize。Phase 12 で登録済み。
