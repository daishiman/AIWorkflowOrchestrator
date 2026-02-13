# Phase 11: 手動テスト検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 11                                           |
| Phase名    | 手動テスト検証                               |
| タスクID   | TASK-FIX-11-1-SDK-TEST-ENABLEMENT            |
| 機能名     | sdk-test-enablement                          |
| 前提Phase  | Phase 10 (最終レビューゲート)                |
| 後続Phase  | Phase 12 (ドキュメント更新)                  |
| ステータス | 未実施                                       |
| 作成日     | 2026-02-13                                   |
| 関連Issue  | #641                                         |
| 前提タスク | TASK-9B-I-SDK-FORMAL-INTEGRATION（完了済み） |

---

## 目的

自動テストでは検証できないテスト品質と動作を手動で確認する。SDK統合テスト17箇所の有効化が正しく行われ、リグレッションが発生していないことを検証する。

## 背景

TASK-9B-I-SDK-FORMAL-INTEGRATION 完了時に TODO コメントで無効化されていた17箇所のSDK統合テストを有効化した。自動テストの結果だけでなく、テストの意味的な正当性やプロジェクト全体への影響を手動で確認する必要がある。

---

## 使用スキル

> このPhaseでは特定のスキルは使用せず、手動テスト作業を行います。

---

## 参照資料

| 参照資料         | パス                                                            | 内容                              |
| ---------------- | --------------------------------------------------------------- | --------------------------------- |
| 要件定義書       | `docs/30-workflows/sdk-test-enablement/phase-1-requirements.md` | 要件・受入基準                    |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`                       | レビュー判定結果                  |
| テスト対象1      | `apps/desktop/src/main/slide/__tests__/skill-executor.test.ts`  | スキル実行テスト（5箇所）         |
| テスト対象2      | `apps/desktop/src/main/slide/__tests__/agent-client.test.ts`    | エージェントクライアント（9箇所） |
| テスト対象3      | `apps/desktop/src/main/slide/__tests__/sdk-integration.test.ts` | SDK統合テスト（3箇所）            |

- 依存Phase成果物: `phase-2-design.md`, `phase-5-implementation.md`, `phase-6-test-expansion.md`, `phase-7-coverage-check.md`, `phase-8-refactoring.md`, `phase-9-quality-assurance.md`, `phase-10-final-review.md`

---

## 実行タスク

- 手動検証: 対象3ファイルの一括実行・TODO残存・回帰影響を確認する
- 品質確認: TypeScript/Lint/カバレッジ観点を再確認する
- 記録整備: 手動テスト結果を成果物に残し、次Phaseへ引き継ぐ

### タスク概要

自動テストでは確認できない以下の観点を手動で検証する:

1. 対象3ファイルの全テストが一括でPASSすること
2. TODOコメントが残存していないこと
3. プロジェクト全体のテストスイートにリグレッションがないこと
4. TypeScript型チェック・ESLintが通ること
5. 有効化されたテストが形式的ではなく意味のあるアサーションを持つこと
6. カバレッジが向上していること

---

## 手動テストケース

| No    | カテゴリ       | テスト項目                         | 前提条件             | 操作手順                                                                                                                                                                                                                          | 期待結果                                         | 実行結果 | 備考 |
| ----- | -------------- | ---------------------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | -------- | ---- |
| MT-01 | テスト一括実行 | 全テストファイル一括実行確認       | Phase 5-9 完了後     | `pnpm --filter @repo/desktop test -- --run apps/desktop/src/main/slide/__tests__/skill-executor.test.ts apps/desktop/src/main/slide/__tests__/agent-client.test.ts apps/desktop/src/main/slide/__tests__/sdk-integration.test.ts` | 全テストPASS                                     | 未実施   |      |
| MT-02 | コード品質     | TODOコメント残存確認               | 対象ファイル編集完了 | `grep -rn "TODO.*SDK" apps/desktop/src/main/slide/__tests__/`                                                                                                                                                                     | 0件（TODOコメントが残存していないこと）          | 未実施   |      |
| MT-03 | リグレッション | テストスイート全体の実行確認       | Phase 9 品質検証完了 | `pnpm --filter @repo/desktop test`                                                                                                                                                                                                | 既存テスト含め全PASS（リグレッションなし）       | 未実施   |      |
| MT-04 | 型チェック     | TypeScript型チェック確認           | コード変更完了       | `pnpm typecheck`                                                                                                                                                                                                                  | エラーなし                                       | 未実施   |      |
| MT-05 | コード品質     | ESLint確認                         | コード変更完了       | `pnpm lint`                                                                                                                                                                                                                       | エラーなし                                       | 未実施   |      |
| MT-06 | テスト品質     | 有効化テストの意味検証（目視確認） | MT-01 PASS           | 各テストファイルを開き、有効化された17箇所のテストが形式的（例: `expect(true).toBe(true)`）ではなく、実際のSDK動作を検証する意味のあるアサーションを含んでいるか目視確認する                                                      | 各テストに意味のあるアサーションがある           | 未実施   |      |
| MT-07 | カバレッジ     | カバレッジレポート確認             | MT-01 PASS           | `pnpm --filter @repo/desktop test -- --coverage apps/desktop/src/main/slide/`                                                                                                                                                     | テスト有効化前と比較してカバレッジが向上している | 未実施   |      |

---

## 統合テスト連携

### Phase 11での必須確認項目

- [ ] API接続テスト: `agent-client.test.ts` の認証テスト（401レスポンス処理）が正常動作
- [ ] エラーハンドリング: HTTPエラー（500）、APIエラー、タイムアウト（30秒）の各シナリオが検証済み
- [ ] 認証フロー: API キー設定、Bearer トークン形式、認証ヘッダー検証が正常動作
- [ ] SDKモック整合性: `vi.mock('@anthropic-ai/claude-code')` のモック構成が実SDKインターフェースと整合

---

## 成果物

| 成果物         | パス                                     | 内容                         |
| -------------- | ---------------------------------------- | ---------------------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | 全テストケースの実行結果記録 |

---

## 完了条件

- [ ] MT-01: 対象3ファイルの全テストがPASSしている
- [ ] MT-02: TODOコメントの残存が0件である
- [ ] MT-03: プロジェクト全体のテストスイートにリグレッションがない
- [ ] MT-04: TypeScript型チェックがエラーなしで通過
- [ ] MT-05: ESLintがエラーなしで通過
- [ ] MT-06: 有効化された全テストに意味のあるアサーションが存在する
- [ ] MT-07: カバレッジ向上が確認できている
- [ ] 手動テスト結果が `outputs/phase-11/manual-test-result.md` に記録されている
- [ ] 発見された問題が記録されている（該当する場合）
- [ ] **本Phase内の全作業を100%完了**

---

## 多角的チェック観点

タスクの性質に応じて、以下の観点を確認する。

| 観点               | 本タスクでの適用判断                                      | 仕様参照先                                                                                                                                                                                                                                    |
| ------------------ | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | APIキー・認証情報・エラー表示を扱うため適用               | `.claude/skills/aiworkflow-requirements/references/security-principles.md`, `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                                                                                      |
| インターフェース   | SkillExecutor と Agent SDK の接続仕様確認が必要なため適用 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`                                                                             |
| エラーハンドリング | timeout/API key not configured/SDK failure を扱うため適用 | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                                                                                                                                         |
| テスト品質         | TODO有効化・回帰防止・カバレッジ判定が必要なため適用      | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`, `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`, `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` |
| タスク運用         | 未タスク発生時の記録・追跡が必要なため適用                | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                                                                                                                                          |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成して進捗管理する。

1. 参照資料の確認
2. 実行タスクの実施（各タスクごと）
3. 統合テスト連携の実施（Phase 1-11）
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] `artifacts.json` が更新されている
- [ ] Phase末端アクションで完了を明記している

## Phase末端アクション【必須】

- [ ] 本Phase内の全作業を100%実行完了
- [ ] 各テストケースを100%完了し、結果を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 5, 8, 9, 10 が完了していること
- **後続**: Phase 12 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 11 実行記録

### 手動テスト結果

- 成功シナリオ数: {{数}}/7
- 発見された問題: {{数}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/sdk-test-enablement/phase-12-documentation.md`
