# Phase 7: テストカバレッジ確認

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| Phase    | 7                                     |
| 機能名   | skill-execute-delegation              |
| 作成日   | 2026-02-10                            |
| タスクID | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION |

## 目的

Phase 6で拡充したテスト結果を検証し、カバレッジ基準を満たすことを確認する。SkillService.executeSkill()のSkillExecutor委譲に関連する全コードパスがテストでカバーされていることを検証する。

## 実行タスク

- カバレッジ再測定: SkillService、SkillExecutor関連コードのテストカバレッジ再計測
- 統合テスト実行: Renderer → Preload → IPC → Handler → SkillExecutor → SDK の全経路テスト実行
- E2Eテスト実行: スキル実行フロー全体のE2Eテスト実行

## 参照資料

| 資料名         | パス                                                                                            | 説明          |
| -------------- | ----------------------------------------------------------------------------------------------- | ------------- |
| テスト拡充結果 | `outputs/phase-6/coverage-report.md`                                                            | Phase 6成果物 |
| 統合テスト設計 | `outputs/phase-4/integration-test-design.md`                                                    | Phase 4成果物 |
| SkillService   | `apps/desktop/src/main/services/skill/SkillService.ts`                                          | 実装対象      |
| SkillExecutor  | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                                         | 委譲先        |
| タスク仕様書   | `docs/30-workflows/skill-import-agent-system/tasks/04-task-fix-7-1-execute-skill-delegation.md` | タスク指示書  |

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 現在値     |
| ----------------- | -------- | -------- | ---------- |
| Line Coverage     | 80%      | 90%      | {{RESULT}} |
| Branch Coverage   | 60%      | 70%      | {{RESULT}} |
| Function Coverage | 80%      | 90%      | {{RESULT}} |

## 結合テストカバレッジ基準

| 指標                         | 目標 | 現在値     |
| ---------------------------- | ---- | ---------- |
| APIエンドポイント            | 100% | {{RESULT}} |
| モジュール間インターフェース | 100% | {{RESULT}} |
| 正常系シナリオ               | 100% | {{RESULT}} |
| 異常系シナリオ               | 80%+ | {{RESULT}} |
| 外部連携ポイント             | 100% | {{RESULT}} |

## 実行手順

### 1. カバレッジ再測定

```bash
# SkillService関連のカバレッジ測定
pnpm --filter @repo/desktop test:coverage -- --testPathPattern="SkillService|SkillExecutor"

# 全体カバレッジレポート生成
pnpm --filter @repo/desktop test:coverage
```

### 2. 統合テスト実行

```bash
# 統合テスト実行
pnpm --filter @repo/desktop test:integration -- --testPathPattern="skill.*execute|execute.*skill"

# E2Eテスト実行
pnpm --filter @repo/desktop test:e2e -- --testPathPattern="skill-execution"
```

### 3. 未達の場合の対応

カバレッジ未達や統合テスト失敗がある場合、Phase 6へ戻って拡充する。

#### 判定フロー

```
カバレッジ基準達成?
├─ Yes → Phase 8へ進行
└─ No → 不足箇所を特定し Phase 6 へ戻る
```

## 統合テスト連携【必須】

統合テストの再実行とゲート判定:

| 判定項目                 | 基準 | 結果       |
| ------------------------ | ---- | ---------- |
| ユニットテストLine       | 80%+ | {{RESULT}} |
| ユニットテストBranch     | 60%+ | {{RESULT}} |
| ユニットテストFunction   | 80%+ | {{RESULT}} |
| 結合テストAPI            | 100% | {{RESULT}} |
| 結合テストシナリオ正常系 | 100% | {{RESULT}} |
| 結合テストシナリオ異常系 | 80%+ | {{RESULT}} |

## タスク固有のテスト対象

### SkillService.executeSkill() 委譲パス

| テスト対象               | カバレッジ確認項目               |
| ------------------------ | -------------------------------- |
| 正常実行パス             | SkillExecutor.execute() 呼び出し |
| バリデーションエラーパス | スキル未存在、未インポート状態   |
| SkillExecutor エラーパス | SDK認証失敗、タイムアウト        |
| ストリーミングレスポンス | メッセージ受信、完了イベント     |
| 実行中断（abort）        | 中断リクエスト処理               |

### E2Eテストシナリオ

| シナリオ                     | 期待結果                     |
| ---------------------------- | ---------------------------- |
| スキル実行 → SDK到達         | 正常レスポンス               |
| ストリーミングメッセージ受信 | Rendererへのリアルタイム配信 |
| 認証エラー時の伝播           | 適切なエラーメッセージ表示   |
| 実行中断                     | 中断完了、リソース解放       |

## アーキテクチャ層別カバレッジ確認

| 層                 | 確認観点                               | 確認結果   |
| ------------------ | -------------------------------------- | ---------- |
| Main Process       | SkillService、SkillExecutor の分岐網羅 | {{RESULT}} |
| IPC通信            | skill:execute チャンネルのテスト網羅   | {{RESULT}} |
| Preload            | skillAPI.execute のモック/統合テスト   | {{RESULT}} |
| エラーハンドリング | 全エラーパスのテスト網羅               | {{RESULT}} |

## 成果物

| 成果物             | パス                                  | 説明               |
| ------------------ | ------------------------------------- | ------------------ |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`  | 再測定結果         |
| 統合テスト結果     | `outputs/phase-7/integration-test.md` | 統合テスト実行結果 |

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 結合テストカバレッジ基準を達成（API 100%, シナリオ 100%/80%）
- [ ] 統合テストが全て成功
- [ ] SkillService.executeSkill() の全パスがカバーされている
- [ ] SkillExecutor への委譲ロジックがテストでカバーされている
- [ ] E2Eスモークテストが成功
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                | 仕様参照先                                                   |
| ------------------ | ----------------------- | ------------------------------------------------------------ |
| セキュリティ       | ✅ IPCテストカバレッジ  | `aiworkflow-requirements: security-skill-ipc.md`             |
| API設計            | ✅ API契約テストカバー  | `aiworkflow-requirements: interfaces-agent-sdk-executor.md`  |
| テスト戦略         | ✅ カバレッジ基準       | `aiworkflow-requirements: test-strategy-unit-integration.md` |
| エラーハンドリング | ✅ エラーパスカバレッジ | `aiworkflow-requirements: error-handling.md`                 |

📖 詳細: `references/quality-standards.md` セクション8

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. カバレッジ再測定の実施
3. 統合テスト実行
4. E2Eテスト実行
5. カバレッジレポートの作成
6. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-execute-delegation --phase 7
```

## 次のPhase

Phase 8: リファクタリング（TDD: Refactor）
