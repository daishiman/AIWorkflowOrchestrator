# Phase 7: テストカバレッジ確認

## メタ情報

| 項目     | 値                                         |
| -------- | ------------------------------------------ |
| Phase    | 7                                          |
| タスクID | TASK-FIX-15-1-EXECUTE-HANDLER-ROUTING      |
| 機能名   | SKILL_EXECUTEハンドラーのSkillExecutor委譲 |
| 作成日   | 2026-02-09                                 |
| 規模     | 小規模                                     |

## 目的

Phase 6で拡充したテスト結果を検証し、カバレッジ基準を満たすことを確認する。
未達の場合はPhase 6に戻ってテストを追加する。

## 実行タスク

- カバレッジ再測定: テストカバレッジの再計測
- ゲート判定: カバレッジ基準達成の確認
- 未達対応: 必要に応じてPhase 6へ戻る

## 参照資料

| 資料名         | パス                                                                                  | 説明           |
| -------------- | ------------------------------------------------------------------------------------- | -------------- |
| Phase 6テスト  | `docs/30-workflows/task-fix-15-1-execute-handler-routing/phase-6-test-enhancement.md` | テスト拡充仕様 |
| テストファイル | `apps/desktop/src/main/ipc/__tests__/skillHandlers.execute.test.ts`                   | テストコード   |

## カバレッジ基準

### ユニットテストカバレッジ

| 指標              | 最低基準 | 推奨基準 | 対象ファイル                                   |
| ----------------- | -------- | -------- | ---------------------------------------------- |
| Line Coverage     | 80%      | 90%      | `skillHandlers.ts` (SKILL_EXECUTE関連行)       |
| Branch Coverage   | 60%      | 70%      | 条件分岐（バリデーション、エラーハンドリング） |
| Function Coverage | 80%      | 90%      | 型変換ヘルパー関数                             |

### 結合テストカバレッジ

| 指標           | 目標 | 対象                                         |
| -------------- | ---- | -------------------------------------------- |
| API接続テスト  | 100% | SKILL_EXECUTEハンドラー→SkillExecutor連携    |
| 正常系シナリオ | 100% | 正常なスキル実行フロー                       |
| 異常系シナリオ | 80%+ | エラーケース（未発見、未インポート、例外等） |

## 実行手順

### ステップ1: カバレッジ再測定

```bash
# カバレッジ計測コマンド
pnpm --filter @repo/desktop test:coverage --testPathPattern="skillHandlers.execute"

# または、全スキルハンドラーテスト
pnpm --filter @repo/desktop test:coverage --testPathPattern="skillHandlers"
```

### ステップ2: カバレッジレポート確認

```bash
# カバレッジレポートを開く
open coverage/lcov-report/index.html
```

### ステップ3: ゲート判定

以下のテーブルに計測結果を記入する:

| 判定項目          | 基準 | 結果       | 判定   |
| ----------------- | ---- | ---------- | ------ |
| Line Coverage     | 80%+ | {{RESULT}} | {{OK}} |
| Branch Coverage   | 60%+ | {{RESULT}} | {{OK}} |
| Function Coverage | 80%+ | {{RESULT}} | {{OK}} |
| 正常系シナリオ    | 100% | {{RESULT}} | {{OK}} |
| 異常系シナリオ    | 80%+ | {{RESULT}} | {{OK}} |

### ステップ4: 未達の場合の対応

カバレッジが基準に満たない場合:

1. **ギャップ分析**: 未カバー行/分岐を特定
2. **Phase 6へ戻る**: 追加テストを実装
3. **再測定**: 本Phaseのステップ1から再実行

```bash
# 未カバー行の特定
# coverage/lcov-report/skillHandlers.ts.html を確認

# ギャップ一覧
# - 行番号: 未カバー理由
# - 分岐: 未カバー条件
```

## 統合テスト連携【必須】

統合テストの再実行とゲート判定:

| レビュー項目          | 確認内容                            | 結果       |
| --------------------- | ----------------------------------- | ---------- |
| IPC通信テスト         | skill:execute呼び出しが成功する     | {{RESULT}} |
| SkillExecutor連携     | execute()が正しく呼ばれる           | {{RESULT}} |
| エラー伝播            | エラーがOperationResultで返却される | {{RESULT}} |
| 型変換                | 全フィールドが正しく変換される      | {{RESULT}} |
| abort/getStatus互換性 | 既存機能が引き続き動作する          | {{RESULT}} |

## テスト実行コマンド

```bash
# 全テスト実行
pnpm --filter @repo/desktop test skillHandlers.execute

# カバレッジ付きテスト実行
pnpm --filter @repo/desktop test:coverage --testPathPattern="skillHandlers.execute"

# 特定のテストグループのみ実行
pnpm --filter @repo/desktop test skillHandlers.execute -t "SkillExecutor委譲"
pnpm --filter @repo/desktop test skillHandlers.execute -t "エラーハンドリング"
pnpm --filter @repo/desktop test skillHandlers.execute -t "型変換"
pnpm --filter @repo/desktop test skillHandlers.execute -t "互換性"
```

## テストケース一覧

### Phase 4 テストケース（基本）

| テストID       | テスト名                            | ステータス |
| -------------- | ----------------------------------- | ---------- |
| SH-EXE-EXEC-01 | SkillExecutor.execute()呼び出し確認 | {{STATUS}} |
| SH-EXE-EXEC-02 | params→SkillExecutionRequest変換    | {{STATUS}} |
| SH-EXE-EXEC-03 | Skill→SkillMetadata変換             | {{STATUS}} |
| SH-EXE-EXEC-04 | 存在しないスキルでエラー            | {{STATUS}} |
| SH-EXE-EXEC-05 | 未インポートスキルでエラー          | {{STATUS}} |
| SH-EXE-EXEC-06 | SkillExecutor未初期化でエラー       | {{STATUS}} |
| SH-EXE-EXEC-07 | 成功レスポンス形式                  | {{STATUS}} |
| SH-EXE-EXEC-08 | promptパラメータの受け渡し          | {{STATUS}} |
| SH-EXE-EXEC-09 | skillIdからスキル情報取得           | {{STATUS}} |
| SH-EXE-EXEC-10 | インポートマネージャー確認          | {{STATUS}} |

### Phase 6 テストケース（拡充）

#### エラーハンドリングテスト

| テストID      | テスト名                                | ステータス |
| ------------- | --------------------------------------- | ---------- |
| SH-EXE-ERR-01 | SkillExecutor.execute()がエラーをスロー | {{STATUS}} |
| SH-EXE-ERR-02 | SkillExecutor.execute()がタイムアウト   | {{STATUS}} |
| SH-EXE-ERR-03 | SkillExecutor.execute()がアボート       | {{STATUS}} |
| SH-EXE-ERR-04 | getSkillById()がエラーをスロー          | {{STATUS}} |
| SH-EXE-ERR-05 | getImportedSkills()がエラーをスロー     | {{STATUS}} |
| SH-EXE-ERR-06 | ネットワークエラーのハンドリング        | {{STATUS}} |
| SH-EXE-ERR-07 | 認証エラーのハンドリング                | {{STATUS}} |

#### 型変換テスト

| テストID       | テスト名                            | ステータス |
| -------------- | ----------------------------------- | ---------- |
| SH-EXE-CONV-01 | params.promptがundefinedの場合      | {{STATUS}} |
| SH-EXE-CONV-02 | params.promptが空文字の場合         | {{STATUS}} |
| SH-EXE-CONV-03 | params.timeoutがundefinedの場合     | {{STATUS}} |
| SH-EXE-CONV-04 | params.timeoutが0の場合             | {{STATUS}} |
| SH-EXE-CONV-05 | Skill.allowedToolsがundefinedの場合 | {{STATUS}} |
| SH-EXE-CONV-06 | Skill.anchorsが空配列の場合         | {{STATUS}} |
| SH-EXE-CONV-07 | Skill.categoryがundefinedの場合     | {{STATUS}} |

#### 互換性テスト

| テストID         | テスト名                            | ステータス |
| ---------------- | ----------------------------------- | ---------- |
| SH-EXE-COMPAT-01 | skill:abort が引き続き動作する      | {{STATUS}} |
| SH-EXE-COMPAT-02 | skill:get-status が引き続き動作する | {{STATUS}} |
| SH-EXE-COMPAT-03 | 他のskill:\*ハンドラーに影響がない  | {{STATUS}} |

## 多角的チェック観点（AIが判断）

本タスク（SKILL_EXECUTEハンドラーのSkillExecutor委譲）では以下の観点を適用：

| 観点                 | 確認内容                                    | 仕様参照先                                                  |
| -------------------- | ------------------------------------------- | ----------------------------------------------------------- |
| セキュリティ         | IPC送信元検証、エラーメッセージのサニタイズ | `aiworkflow-requirements: security-skill-ipc.md`            |
| API設計              | チャンネル定義、入出力型の統一性            | `aiworkflow-requirements: interfaces-agent-sdk-executor.md` |
| エラーハンドリング   | SkillExecutionErrorCode準拠                 | `aiworkflow-requirements: error-handling.md`                |
| Electronセキュリティ | Main Process実装、validateIpcSender使用     | `aiworkflow-requirements: security-api-electron.md`         |

**Electronデスクトップアプリ観点**:

| 層                   | 確認内容                             | 仕様参照先                    |
| -------------------- | ------------------------------------ | ----------------------------- |
| バックエンド（Main） | カバレッジ基準達成確認、ギャップ分析 | `architecture-*.md`           |
| IPC通信              | 全テストケースのPASS確認             | `interfaces-*.md`, `api-*.md` |

---

## 成果物

| 成果物             | パス                                                                                         | 説明           |
| ------------------ | -------------------------------------------------------------------------------------------- | -------------- |
| カバレッジレポート | `docs/30-workflows/task-fix-15-1-execute-handler-routing/outputs/phase-7/coverage-report.md` | 再測定結果     |
| テスト結果サマリー | `docs/30-workflows/task-fix-15-1-execute-handler-routing/outputs/phase-7/test-summary.md`    | テスト実行結果 |

## 完了条件

- [ ] Line Coverage 80%以上を達成
- [ ] Branch Coverage 60%以上を達成
- [ ] Function Coverage 80%以上を達成
- [ ] 全テストケース（27件）がPASS
- [ ] カバレッジレポートが出力されている
- [ ] 統合テスト確認が完了している
- [ ] **本Phase内の全タスクを100%実行完了**

## 未達時のフローバック

```
Phase 7 カバレッジ基準未達
    ↓
ギャップ分析（未カバー行/分岐の特定）
    ↓
Phase 6 へ戻る（追加テスト実装）
    ↓
Phase 7 再実行
```

## 次のPhase

Phase 8: リファクタリング（TDD: Refactor）

## 備考

- 本タスクは小規模変更のため、Phase 8以降は簡略化可能
- Phase 9-13は本タスク完了後に別途実行
- カバレッジ基準は既存テスト + 新規テストの合計で判定
