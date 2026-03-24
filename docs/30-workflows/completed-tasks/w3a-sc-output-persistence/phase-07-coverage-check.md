# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 7                             |
| 機能名   | w3a-sc-output-persistence     |
| タスクID | TASK-SC-04-OUTPUT-PERSISTENCE |
| 作成日   | 2026-03-22                    |
| 更新日   | 2026-03-23                    |

## 目的

SkillFileWriter の全メソッドと execute() の永続化パスのカバレッジ基準充足を計測・確認する。未達の場合は Phase 6 へ戻る。

## 実行タスク

1. **カバレッジ計測実行**
   - `pnpm --filter @repo/desktop exec vitest run --coverage src/main/services/skill/__tests__/SkillFileWriter.test.ts` を実行する
2. **基準確認**
   - Line Coverage ≥ 80%（推奨 90%）
   - Branch Coverage ≥ 60%（推奨 70%）
   - Function Coverage ≥ 80%（推奨 90%）
3. **分岐網羅確認**
   - `persist()` の正常系パス（全ファイル書き込み成功）が網羅されているか
   - `persist()` のエラーパス（バリデーション失敗・上書きガード・書き込みエラー）が網羅されているか
   - `validateSkillName()` の全パターン（正常・パストラバーサル・空文字列）が網羅されているか
   - ロールバックパス（途中失敗 → 部分ファイル削除）が網羅されているか
4. **v8 カバレッジプロバイダの注意点（P41 対策）**
   - インライン arrow function がカウントされているか確認する
   - カバレッジが低い場合は、コールバック関数の明示的な呼び出しテストを追加する
5. **未達時の対処**
   - 未達分岐を特定し、Phase 6 へ戻りテストを追加する

## 参照資料

- `docs/30-workflows/w3a-sc-output-persistence/phase-06-test-coverage.md`
- `.claude/rules/02-code-quality.md`（カバレッジ基準）
- `.claude/rules/06-known-pitfalls.md`（P41: v8 カバレッジプロバイダのインライン関数カウント）

## 成果物

- カバレッジレポート（コンソール出力）
- `docs/30-workflows/w3a-sc-output-persistence/phase-07-coverage-output.md`（基準充足の記録）

## 完了条件

- [ ] Line Coverage ≥ 80% を達成した
- [ ] Branch Coverage ≥ 60% を達成した
- [ ] Function Coverage ≥ 80% を達成した
- [ ] `persist()` の全分岐が網羅されている
- [ ] `validateSkillName()` の全パターンが網羅されている
- [ ] ロールバックパスが網羅されている
- [ ] 未達の場合は Phase 6 へ戻りテストを追加した
- [ ] **本Phase内の全タスクを100%実行完了**

## 統合テスト連携（Phase 1〜11は必須）

Phase 7 で計測したカバレッジ結果と結合テスト結果を以下のテーブルで確認する。

### カバレッジ基準テーブル

| 指標              | 最低基準 | 推奨基準 | 実測値         | 判定 |
| ----------------- | -------- | -------- | -------------- | ---- |
| Line Coverage     | 80%      | 90%      | （計測後記入） | -    |
| Branch Coverage   | 60%      | 70%      | （計測後記入） | -    |
| Function Coverage | 80%      | 90%      | （計測後記入） | -    |

### 結合テスト結果テーブル

| テスト対象                                | テスト数 | PASS | FAIL | 備考           |
| ----------------------------------------- | -------- | ---- | ---- | -------------- |
| SkillFileWriter.test.ts                   | -        | -    | -    | （計測後記入） |
| RuntimeSkillCreatorFacade.execute.test.ts | -        | -    | -    | （計測後記入） |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。

| 観点               | 適用判断                                     | 仕様参照先                                   |
| ------------------ | -------------------------------------------- | -------------------------------------------- |
| セキュリティ       | **適用**: パストラバーサル防止・書き込み制限 | `aiworkflow-requirements: security-*.md`     |
| アーキテクチャ     | **適用**: SkillFileWriter の DI 設計         | `aiworkflow-requirements: architecture-*.md` |
| エラーハンドリング | **適用**: アトミック書き込み・ロールバック   | `aiworkflow-requirements: error-handling.md` |
| UI/UX              | 非適用（バックエンド変更のみ）               | -                                            |

## サブタスク管理

Phase実行開始時に、TaskCreateツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 8: リファクタリング
