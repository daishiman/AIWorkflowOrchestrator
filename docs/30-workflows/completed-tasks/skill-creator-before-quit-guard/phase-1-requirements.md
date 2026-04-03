# Phase 1: 要件定義

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| Phase        | 1                                        |
| タスクID     | TASK-SKILL-CREATOR-BEFORE-QUIT-GUARD-001 |
| ステータス   | 未実施                                   |
| 担当         | 実装者                                   |
| 見積もり時間 | 0.5h                                     |

## 目的

P50 チェック（既実装確認）でスコープを正確に絞り、受入条件を固定して Phase 2 設計に進める。本タスクは TASK-NOTIFICATION-SERVICE-001 で基本実装が完了しているため、**実装の検証・追加テスト補完・文書化** に特化したスコープを確定する。`RuntimeSkillCreatorFacade.notification.test.ts` にある `TC-F-04〜TC-F-08` は既存カバレッジとして再利用する。

## 一次レビュー

| 観点         | 一次結論                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------ |
| 真の論点     | before-quit guard の基本実装は完了済み。テストカバレッジの補完と公式文書化が残課題                           |
| 依存境界     | `RuntimeSkillCreatorFacade.hasRunningExecution()` が before-quit guard の唯一のインターフェース              |
| 価値とコスト | 価値はスキル生成中の突然終了リスク排除。コストはテスト追加 + 文書化の局所修正                                |
| 優先順位     | 1. beforeQuitGuard 追加テスト 2. ファイル整合性リスク文書化 3. unassigned-task doc 更新 4. Phase 12 仕様同期 |
| 4条件        | 矛盾なし・漏れなし（既実装の範囲確認済み）・整合性あり・依存関係は親タスク TASK-FIX-EXECUTE-PLAN-FF-001 のみ |

## 実行タスク

1. **P50 チェック**: 既実装ファイルの現状を確認し、重複実装を防ぐ
2. **変更対象ファイルのインベントリ作成**
3. **受入条件（AC）の定義**（AC-1〜AC-8）
4. **スコープ外の明示**
5. **リスク評価**（app.exit(0) のクリーンアップ問題）

## 参照資料

| 参照資料           | パス                                                                                                                            | 内容                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| 親タスク仕様書     | `docs/30-workflows/completed-tasks/fix-step3-seq-execute-plan-nonblocking/`                                                     | fire-and-forget 化の背景 |
| 未タスク文書       | `docs/30-workflows/completed-tasks/skill-creator-before-quit-guard/unassigned-task/TASK-SKILL-CREATOR-BEFORE-QUIT-GUARD-001.md` | 元の未タスク定義         |
| Electron IPC 仕様  | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-advanced.md`                                           | before-quit vs will-quit |
| アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md`                                     | Facade の責務境界        |

## 実行手順

### ステップ 1: P50 チェック（既実装状態確認）

```bash
# before-quit guard の実装確認
ls apps/desktop/src/main/ipc/beforeQuitGuard.ts
ls apps/desktop/src/main/ipc/__tests__/beforeQuitGuard.test.ts

# hasRunningExecution の確認
rg -n "hasRunningExecution|activeExecutionCount" \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts

# index.ts での統合確認
rg -n "registerBeforeQuitGuard|beforeQuitGuard" \
  apps/desktop/src/main/ipc/index.ts

# 既存テストケース確認
rg -n "TC-B-" apps/desktop/src/main/ipc/__tests__/beforeQuitGuard.test.ts
rg -n "TC-F-" apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.notification.test.ts
```

確認ポイント:

- `registerBeforeQuitGuard` が実装済みで `app.on('before-quit', ...)` を登録していること
- `hasRunningExecution()` が `activeExecutionCount > 0` で判定していること
- TC-B-01〜TC-B-03 の3件のテストが存在すること
- `index.ts` から `registerBeforeQuitGuard` が呼ばれていること

### ステップ 2: 変更対象ファイルのインベントリ確認

```bash
# 対象ファイルの現状確認
ls apps/desktop/src/main/ipc/beforeQuitGuard.ts
ls apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
ls apps/desktop/src/main/services/runtime/__tests__/
```

| ファイル                                                                                                                        | 状態                            | 本タスクでの扱い     |
| ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | -------------------- |
| `apps/desktop/src/main/ipc/beforeQuitGuard.ts`                                                                                  | ✅ 実装済み                     | 検証のみ（変更なし） |
| `apps/desktop/src/main/ipc/__tests__/beforeQuitGuard.test.ts`                                                                   | ✅ TC-B-01〜03                  | 検証のみ（変更なし） |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                                           | ✅ hasRunningExecution 実装済み | 検証のみ             |
| `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.notification.test.ts`                               | ✅ TC-F-04〜TC-F-08             | 検証のみ（既存）     |
| `docs/30-workflows/completed-tasks/skill-creator-before-quit-guard/unassigned-task/TASK-SKILL-CREATOR-BEFORE-QUIT-GUARD-001.md` | ⚠️ チェックボックス未更新       | **Phase 12 で更新**  |

### ステップ 3: 受入条件の確定

以下の受入条件を確定し、`outputs/phase-1/requirements-spec.md` に記録する。

| ID   | 受入条件                                                                              | 確認方法                      | 現在の状態            |
| ---- | ------------------------------------------------------------------------------------- | ----------------------------- | --------------------- |
| AC-1 | スキル生成実行中に `before-quit` が発火した場合 `event.preventDefault()` が呼ばれる   | UT (TC-B-01)                  | ✅ 実装済み           |
| AC-2 | スキル生成未実行時は `event.preventDefault()` が呼ばれず通常終了できる                | UT (TC-B-02)                  | ✅ 実装済み           |
| AC-3 | `registerBeforeQuitGuard` の戻り値（cleanup関数）でリスナーが解除される               | UT (TC-B-03)                  | ✅ 実装済み           |
| AC-4 | `hasRunningExecution()` は `execute()` 実行中に `true`、完了/失敗時に `false` を返す  | UT (TC-F-04〜TC-F-05)         | ✅ 既存カバレッジ     |
| AC-5 | 並行実行時（複数 planId）は全て完了するまで `hasRunningExecution()` が `true` を返す  | UT (TC-F-06〜TC-F-08)         | ✅ 既存カバレッジ     |
| AC-6 | ユーザーが「中断して終了」を選択した場合 `app.exit(0)` が呼ばれる                     | UT (Phase 6 拡充)             | ⚠️ テスト不足         |
| AC-7 | ダイアログ表示失敗時（dialog.showMessageBox が reject）に `console.warn` で記録される | UT (Phase 6 拡充)             | ⚠️ テスト不足         |
| AC-8 | TypeScript 型チェック PASS、ESLint エラーなし                                         | `pnpm typecheck && pnpm lint` | ✅ 実装済み（要確認） |

### ステップ 4: スコープ外の確認

| 項目                                 | スコープ外の理由                                                             |
| ------------------------------------ | ---------------------------------------------------------------------------- |
| graceful shutdown（LLM処理の待機）   | LLM API の中断は技術的に複雑であり別タスク化が適切                           |
| ファイルシステムのロールバック       | スキル生成の成果物は一時ディレクトリ管理のため影響軽微（Phase 2 で詳細設計） |
| TASK-IPC-CHANNEL-TIMEOUT-CLEANUP-001 | 別タスクとして管理中                                                         |
| TASK-CREATOR-HANDLERS-AUDIT-001      | 別タスクとして管理中                                                         |

### ステップ 5: リスク評価

| リスク                                                               | 影響度 | 対応方針                                                              |
| -------------------------------------------------------------------- | ------ | --------------------------------------------------------------------- |
| `app.exit(0)` による突然終了でファイルシステムが中途半端な状態になる | MEDIUM | Phase 2 設計で「既知リスクとして受容するか、cleanup追加するか」を決定 |
| ダイアログが表示されない環境（headless）での動作                     | LOW    | 既に `.catch` で `console.warn` が実装済み                            |
| 複数 planId の並行実行時のカウント整合性                             | HIGH   | Phase 4 でテスト追加して検証                                          |

## 統合テスト連携

本タスクは before-quit guard の **ユニットテスト** が主体。統合テストは Phase 11 手動テストで対応。

## 成果物

| 成果物            | パス                                   | 説明                         |
| ----------------- | -------------------------------------- | ---------------------------- |
| requirements-spec | `outputs/phase-1/requirements-spec.md` | 要件定義と受入条件の確定記録 |

## 完了条件

- [ ] P50 チェック完了（既実装ファイル全て確認済み）
- [ ] 変更対象ファイルのインベントリ作成完了
- [ ] 受入条件 AC-1〜AC-8 の定義完了
- [ ] `outputs/phase-1/requirements-spec.md` に記録完了

## タスク 100% 実行確認【必須】

Phase 1 完了前に以下を確認すること:

- [ ] 実行タスク 1〜5 を全て完了した
- [ ] P50 チェックで既実装ファイルの重複実装リスクがないことを確認した
- [ ] 受入条件 AC-1〜AC-8 の現在状態（✅/❌/⚠️）を記録した

## 次 Phase

Phase 1 完了後、Phase 2（設計）に進む。
設計のポイント: `app.exit(0)` 前クリーンアップの設計決定。
