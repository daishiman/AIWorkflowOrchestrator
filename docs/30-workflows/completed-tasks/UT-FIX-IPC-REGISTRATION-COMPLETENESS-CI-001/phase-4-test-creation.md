# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 4                                           |
| Phase名    | テスト作成                                  |
| 前提Phase  | Phase 3                                     |
| 後続Phase  | Phase 5                                     |
| ステータス | 未実施                                      |
| 作成日     | 2026-04-07                                  |
| 機能名     | UT-FIX-IPC-REGISTRATION-COMPLETENESS-CI-001 |

---

## 目的

`registerRuntimeSkillCreatorHandlers()` に対するテストマトリクスに基づいてテストケースを作成し、Red（FAIL）を確認する。

## 背景

TDD アプローチにより、まず Red 状態のテストを作成してから実装に入る。これにより、テストが実際に機能しているかを確認できる。

---

## 実行タスク

### タスク1: テストマトリクスの定義と記録

**目的**: スナップショットテストの全テストケースを定義する

**実行手順**:

1. 以下のテストマトリクスを確認し、`outputs/phase-4/test-matrix.md` に記録する

**テストマトリクス**:

| テストID | 対象関数                              | 検証内容                                                 | 種別             |
| -------- | ------------------------------------- | -------------------------------------------------------- | ---------------- |
| TC-01    | `registerRuntimeSkillCreatorHandlers` | 登録チャネル名がスナップショットと一致                   | スナップショット |
| TC-02    | `registerRuntimeSkillCreatorHandlers` | 重複チャネルが存在しない                                 | アサーション     |
| TC-03    | `registerRuntimeSkillCreatorHandlers` | 登録チャネル総数が 18（public runtime 16 + auxiliary 2） | アサーション     |

**期待される成果物**:

- `outputs/phase-4/test-matrix.md` （テストマトリクス）

---

### タスク2: テストファイルの骨格作成と Red 確認

**目的**: テストケースの骨格を作成し、実装前に Red 状態であることを確認する

**実行手順**:

1. テストファイルの骨格（`describe` / `it` ブロックのみ）を作成する
2. `pnpm --filter @repo/desktop vitest run` を実行して Red 状態を確認する
3. Red 状態の確認結果を記録する

**実行コマンド**:

```bash
# テスト実行（単体）
pnpm --filter @repo/desktop vitest run src/main/ipc/__tests__/ipcHandlerRegistrationSnapshot

# スナップショット更新（初回・意図的な変更時のみ）
pnpm --filter @repo/desktop vitest run --update-snapshots src/main/ipc/__tests__/ipcHandlerRegistrationSnapshot

# CI 全体テスト
pnpm vitest run
```

**期待される成果物**:

- `outputs/phase-4/red-test-result.md` （Red 状態確認記録）

---

## 参照資料

| 参照資料         | パス                                           | 内容             |
| ---------------- | ---------------------------------------------- | ---------------- |
| テスト設計書     | `outputs/phase-2/test-design.md`               | モック方針・設計 |
| ゲート判定       | `outputs/phase-3/gate-decision.md`             | Phase 3 承認確認 |
| IPC ハンドラ実装 | `apps/desktop/src/main/ipc/creatorHandlers.ts` | 対象ファイル     |

---

## 成果物

| 成果物           | パス                                 | 説明                  |
| ---------------- | ------------------------------------ | --------------------- |
| テストマトリクス | `outputs/phase-4/test-matrix.md`     | 全テストケース定義    |
| Red 状態確認記録 | `outputs/phase-4/red-test-result.md` | FAIL 状態のテスト結果 |

---

## 完了条件

- [ ] 全テストケース（TC-01〜TC-03）が定義されている
- [ ] テストファイルの骨格が作成されている
- [ ] 全テストケースが Red（FAIL）状態であることが確認されている
- [ ] `outputs/phase-4/` 配下に成果物が配置されている

---

## Phase実行記録

> 実行時にこのセクションへ結果を記録する。

| 項目        | 内容 |
| ----------- | ---- |
| 実行日時    | -    |
| 実行者      | -    |
| 完了判定    | -    |
| Red TC 件数 | -    |
| 特記事項    | -    |
