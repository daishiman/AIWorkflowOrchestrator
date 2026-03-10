# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| タスクID   | TASK-FIX-SAFEINVOKE-TIMEOUT-001 |
| Phase      | 8                               |
| Phase名    | リファクタリング                |
| カテゴリ   | fix                             |
| ステータス | completed                       |
| 前提Phase  | Phase 7                         |
| 後続Phase  | Phase 9                         |

## 目的

実装のコード品質を改善する。今回の本質的なリファクタリングは Phase 5 の helper 抽出で実施済みであり、本 Phase では過剰抽象化に進まないことを確認する。

## 実行タスク

### タスク1: コード品質チェック

**目的**: 実装コードの品質を確認する

**チェック項目**:

| 項目     | 確認内容                                                            | 判定 |
| -------- | ------------------------------------------------------------------- | ---- |
| 命名規則 | `IPC_TIMEOUT_MS` はスクリーミングスネークケースで定数命名規則に準拠 | 確認 |
| 型安全   | `Promise<never>` の使用は適切か                                     | 確認 |
| コメント | 定数のコメントは十分か                                              | 確認 |
| 可読性   | `Promise.race` のネストは読みやすいか                               | 確認 |
| DRY原則  | 重複コードがないか                                                  | 確認 |

### タスク2: リファクタリング候補の検討

**目的**: リファクタリングの必要性を判断する

**検討項目**:

1. **タイムアウト Promise の抽出**: `invokeWithTimeout(...)` helper への抽出
   - **判断**: Phase 5 で実施済み。3 wrapper に重複していた timeout 責務を 1 箇所に集約できるため妥当

2. **timer cleanup の採用確認**: `clearTimeout` を success / reject の両分岐へ入れた最終実装の妥当性確認
   - **判断**: 採用済み。`vi.getTimerCount() === 0` を 2 テストで固定でき、追加抽象化も不要

3. **定数のエクスポート**: `IPC_TIMEOUT_MS` をテストから参照可能にするためのエクスポート
   - **判断**: テストで直接値（5000）を使用し、定数はファイル内 private を維持

### タスク3: リファクタリング実行（該当する場合）

**目的**: 必要なリファクタリングを実行する

**手順**:

1. リファクタリングが必要と判断された場合のみ実行
2. 実行後、全テストが PASS することを確認

### タスク4: テスト再実行

**目的**: リファクタリング後もテストが PASS することを確認する

**手順**:

1. `cd apps/desktop && pnpm vitest run <テストファイルパス>`
2. 全テスト PASS を確認

## 参照資料

| 参照資料           | パス                                                                                          |
| ------------------ | --------------------------------------------------------------------------------------------- |
| Phase 1 要件定義   | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-1-requirements.md`   |
| Phase 2 設計       | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-2-design.md`         |
| Phase 5 実装       | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-5-implementation.md` |
| Phase 6 テスト拡充 | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-6-test-expansion.md` |
| Phase 7 カバレッジ | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-7-coverage-check.md` |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                                                        | 内容                       |
| ---------------- | ------------------------------------------------------------------------------------------- | -------------------------- |
| 開発ガイドライン | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`               | コーディング規約、命名規則 |
| 実装パターン集   | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | リファクタリング判断基準   |

## 統合テスト連携

- リファクタリング後も全テストが PASS することを確認
- Phase 9 で Lint・型チェック・全テスト実行を行う

## 成果物

| 成果物                                 | パス                                                                                                                                                                   |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| リファクタリング結果（変更がある場合） | `apps/desktop/src/preload/ipc-utils.ts`, `apps/desktop/src/preload/index.ts`, `apps/desktop/src/preload/skill-api.ts`, `apps/desktop/src/preload/skill-creator-api.ts` |

## 完了条件

- [ ] コード品質チェックを完了
- [ ] リファクタリング候補を検討し判断
- [ ] リファクタリング実行（該当する場合）
- [ ] 全テストが PASS
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 9: 品質検証へ進む。Lint・型チェック・全テスト実行を行う。
