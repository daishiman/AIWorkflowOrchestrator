# Phase 2 成果物: 修正優先度マトリクス

## メタ情報

| 項目       | 値                                  |
| ---------- | ----------------------------------- |
| タスクID   | TASK-FIX-10-1-VITEST-ERROR-HANDLING |
| Phase      | 2                                   |
| 作成日     | 2026-02-19                          |
| ステータス | 完了                                |

---

## 優先度判定基準

| 優先度   | 基準                                                               |
| -------- | ------------------------------------------------------------------ |
| P1（高） | 他の修正の前提条件となる修正。修正効果が最大（解消テスト数が多い） |
| P2（中） | P1 完了後に着手可能。独立した修正であり、他修正への依存がない      |
| P3（低） | 全修正完了後の最終確認ステップ。コード修正は不要                   |

---

## 修正優先度マトリクス

| 優先度 | 順序 | パターン  | 修正対象ファイル                                         | 解消テスト数 | 依存関係                       | 所要時間目安 |
| ------ | ---- | --------- | -------------------------------------------------------- | ------------ | ------------------------------ | ------------ |
| P1     | 1    | P-ALIAS   | `apps/desktop/vitest.config.ts`（エイリアス追加）        | ~220         | なし                           | 15分         |
| P2     | 2    | P-CLEANUP | `src/features/chat-history/__tests__/*.test.tsx`（4件）  | ~20          | P1完了後に効果を確認可能       | 30分         |
| P2     | 3    | P-CLEANUP | `src/features/chat-history/context/__tests__/*.test.tsx` | ~5           | P1完了後に効果を確認可能       | 15分         |
| P2     | 4    | P-CLEANUP | `src/features/chat-history/hooks/__tests__/*.test.ts`    | ~5           | P1完了後に効果を確認可能       | 15分         |
| P3     | 5    | -         | `apps/desktop/vitest.config.ts`（設定行削除）            | -            | P1, P2完了後に全テストPASS確認 | 5分          |
| -      | -    | P-WORKER  | 対処不要                                                 | ~2           | -                              | 0分          |

---

## 詳細修正計画

### 順序 1: vitest.config.ts エイリアス追加（P1）

| 項目         | 内容                                                                                     |
| ------------ | ---------------------------------------------------------------------------------------- |
| 修正ファイル | `apps/desktop/vitest.config.ts`                                                          |
| 修正内容     | `resolve.alias` に 5 つのサブパスエイリアスを追加                                        |
| 前提条件     | なし                                                                                     |
| 完了条件     | C-1 カテゴリの 25 ファイル、~220 テストが PASS すること                                  |
| 検証コマンド | `cd apps/desktop && pnpm vitest run src/main/ipc/authHandlers.test.ts`（代表テスト実行） |

**追加するエイリアス**:

```
@repo/shared/types/auth        → ../../packages/shared/src/types/auth
@repo/shared/types/api-keys    → ../../packages/shared/src/types/api-keys
@repo/shared/types/agent       → ../../packages/shared/src/types/agent
@repo/shared/types/skill       → ../../packages/shared/src/types/skill
@repo/shared/infrastructure/auth → ../../packages/shared/src/infrastructure/auth
```

---

### 順序 2-4: chat-history テスト非同期クリーンアップ修正（P2）

| 項目         | 内容                                                            |
| ------------ | --------------------------------------------------------------- |
| 修正ファイル | chat-history 関連テスト 6 ファイル                              |
| 修正内容     | `afterEach` / テスト内の非同期クリーンアップ処理追加            |
| 前提条件     | 順序 1（P-ALIAS）の完了後に効果確認可能                         |
| 完了条件     | C-2 カテゴリの 6 ファイル、~30 テストが PASS すること           |
| 検証コマンド | `cd apps/desktop && pnpm vitest run src/features/chat-history/` |

**修正対象ファイル一覧**:

| 順序 | ファイルパス                                                              | 推定修正箇所                 |
| ---- | ------------------------------------------------------------------------- | ---------------------------- |
| 2a   | `src/features/chat-history/__tests__/AppIntegration.test.tsx`             | afterEach クリーンアップ追加 |
| 2b   | `src/features/chat-history/__tests__/ChatHistoryIntegration.test.tsx`     | afterEach クリーンアップ追加 |
| 2c   | `src/features/chat-history/__tests__/ErrorHandling.test.tsx`              | afterEach クリーンアップ追加 |
| 2d   | `src/features/chat-history/__tests__/ExpandedTests.test.tsx`              | afterEach クリーンアップ追加 |
| 3    | `src/features/chat-history/context/__tests__/ChatHistoryContext.test.tsx` | afterEach クリーンアップ追加 |
| 4    | `src/features/chat-history/hooks/__tests__/useChatHistory.test.ts`        | afterEach クリーンアップ追加 |

---

### 順序 5: dangerouslyIgnoreUnhandledErrors 設定行の削除（P3）

| 項目         | 内容                                                 |
| ------------ | ---------------------------------------------------- |
| 修正ファイル | `apps/desktop/vitest.config.ts`                      |
| 修正内容     | `dangerouslyIgnoreUnhandledErrors: true` の行を削除  |
| 前提条件     | 順序 1-4 完了後、全テスト PASS を確認済み            |
| 完了条件     | 設定行削除後も全テスト（9,876 件）が PASS すること   |
| 検証コマンド | `cd apps/desktop && pnpm vitest run`（全テスト実行） |

---

## 実行タイムライン

```
順序1: P-ALIAS修正 ─────> 検証 ─> 順序2-4: P-CLEANUP修正 ─────> 検証 ─> 順序5: 設定削除 ─> 最終検証
         15分         10分              60分              10分          5分          20分

合計所要時間: 約2時間（検証含む）
```

---

## 依存関係グラフ

```
P-ALIAS修正（順序1）
    │
    ├──> chat-history テスト修正（順序2-4）  ← 並列実行可能
    │       │
    │       v
    └──> 設定行削除（順序5）  ← 順序1, 2-4 の両方が完了後
              │
              v
         全テスト実行・最終検証
```

---

## チェックポイント

| チェックポイント | タイミング      | 確認内容                                                       | 判断                                 |
| ---------------- | --------------- | -------------------------------------------------------------- | ------------------------------------ |
| CP-1             | 順序 1 完了後   | C-1 カテゴリの ~220 テストが PASS するか                       | PASS → 順序 2 へ / FAIL → 原因調査   |
| CP-2             | 順序 2-4 完了後 | C-2 カテゴリの ~30 テストが PASS するか                        | PASS → 順序 5 へ / FAIL → 修正見直し |
| CP-3             | 順序 5 完了後   | 全テスト（9,876 件）が PASS するか                             | PASS → 完了 / FAIL → 残存原因の調査  |
| CP-4             | 最終検証        | スキップ数が 50 件を超えていないか、テスト実行時間が許容範囲か | PASS → Phase 完了                    |

---

## 変更履歴

| Version | Date       | Changes  |
| ------- | ---------- | -------- |
| 1.0.0   | 2026-02-19 | 初版作成 |
