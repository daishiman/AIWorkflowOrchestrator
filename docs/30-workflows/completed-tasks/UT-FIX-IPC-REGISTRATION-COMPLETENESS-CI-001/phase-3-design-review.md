# Phase 3: 設計レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 3                                           |
| Phase名    | 設計レビューゲート                          |
| 前提Phase  | Phase 2                                     |
| 後続Phase  | Phase 4                                     |
| ステータス | 未実施                                      |
| 作成日     | 2026-04-07                                  |
| 機能名     | UT-FIX-IPC-REGISTRATION-COMPLETENESS-CI-001 |

---

## 目的

Phase 2 の設計を評価し、Phase 4 に進める品質かを判定する。BLOCKER が 0 件であれば Phase 4 へ進む。

## 背景

設計の妥当性を確認してから実装に入ることで、手戻りコストを最小化する。特にモック戦略の正確性とスナップショットの決定論性は、テストの信頼性に直結する。

---

## 実行タスク

### タスク1: 設計レビューの実施

**目的**: Phase 2 の設計を評価し、BLOCKER 有無を判定する

**実行手順**:

1. テスト設計の妥当性を確認する
   - モック戦略が `ipcMain` の実挙動を正確に捉えているか
   - `registerRuntimeSkillCreatorHandlers(mainWindow)` 用の最小 `mainWindow` モックが成立しているか
   - スナップショットが決定論的か（ソート済みか）
   - 重複検出ロジックが正確か
   - スコープが `registerRuntimeSkillCreatorHandlers` に限定されており、他の registration 関数を混ぜていないか
2. スコープが「含まないもの」を超過していないか確認する
   - 各 IPC ハンドラの処理ロジックテストは含まない
   - Renderer 側チャネル一覧との突合は含まない
   - E2E テストは含まない
3. BLOCKER 判定・MINOR 判定を記録する

**レビューチェックリスト**:

| チェック項目                                                        | 判定 |
| ------------------------------------------------------------------- | ---- |
| `vi.mock("electron")` が `ipcMain` 実挙動を正確に捉えるか           | -    |
| `mainWindow` モックが最小 surface で成立するか                      | -    |
| スナップショットがソート済みで決定論的か                            | -    |
| 重複検出ロジック（Set 比較）が正確か                                | -    |
| スコープが `registerRuntimeSkillCreatorHandlers` に限定されているか | -    |
| スコープが「含まないもの」を超過していないか                        | -    |
| 変更ファイルが最小限か                                              | -    |

**BLOCKER 定義**:

- モック戦略が `ipcMain` 実挙動を正確に捉えていない → BLOCKER
- `mainWindow` モックの最小 surface が不足し、`registerRuntimeSkillCreatorHandlers` を実行できない → BLOCKER
- スナップショットが非決定論的（登録順に依存）→ BLOCKER
- スコープ超過（他の registration 関数や E2E テストが含まれる）→ BLOCKER

**期待される成果物**:

- `outputs/phase-3/design-review-result.md` （設計レビュー結果）
- `outputs/phase-3/gate-decision.md` （ゲート判定）

---

## 参照資料

| 参照資料         | パス                               | 内容             |
| ---------------- | ---------------------------------- | ---------------- |
| テスト設計書     | `outputs/phase-2/test-design.md`   | モック方針・設計 |
| 変更ファイル一覧 | `outputs/phase-2/changed-files.md` | 変更ファイル確認 |

---

## 成果物

| 成果物           | パス                                      | 説明             |
| ---------------- | ----------------------------------------- | ---------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | レビュー結果記録 |
| ゲート判定       | `outputs/phase-3/gate-decision.md`        | Phase 4 進行可否 |

---

## 完了条件

- [ ] BLOCKER 0 件でレビュー完了している
- [ ] Phase 4 への進行が承認されている
- [ ] `outputs/phase-3/` 配下に成果物が配置されている

---

## ゲート判定基準

| 判定 | 条件             | アクション             |
| ---- | ---------------- | ---------------------- |
| PASS | BLOCKER 0 件     | Phase 4 へ進む         |
| FAIL | BLOCKER 1 件以上 | Phase 2 へ戻り設計修正 |

---

## Phase実行記録

> 実行時にこのセクションへ結果を記録する。

| 項目       | 内容 |
| ---------- | ---- |
| 実行日時   | -    |
| 実行者     | -    |
| 完了判定   | -    |
| BLOCKER 数 | -    |
| 特記事項   | -    |
