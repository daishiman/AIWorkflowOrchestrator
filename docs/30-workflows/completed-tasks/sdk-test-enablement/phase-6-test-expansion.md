# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 6                                 |
| Phase名    | テスト拡充                        |
| 前提Phase  | Phase 5 (実装)                    |
| 後続Phase  | Phase 7 (テストカバレッジ確認)    |
| ステータス | 未実施                            |
| 作成日     | 2026-02-13                        |
| 機能名     | sdk-test-enablement               |
| タスクID   | TASK-FIX-11-1-SDK-TEST-ENABLEMENT |

---

## 目的

Phase 5 で 17 箇所のテストを有効化した後、カバレッジ分析を実施し、カバレッジ基準未達の箇所に対して追加テストを作成する。テスト有効化によりカバレッジが向上しているはずだが、新たに発見されたカバレッジ不足箇所を特定し、必要な場合のみテストを追加する。

## 背景

本タスクの主目的は「既存の無効化テスト 17 箇所の有効化」であり、新規テスト作成は主目的ではない。しかし、有効化により以下の追加テストが必要になる可能性がある:

- エラーハンドリングの分岐で未カバーのパスが発見される場合
- mockCreate / mockAgentAPI のモックパターン変更により、カバレッジが低下した箇所がある場合
- Phase 5 で「設計変更記録」に記載された変更に起因する追加テスト

---

## 実行タスク

- カバレッジ計測: 有効化後の実測値を取得して基準差分を確認する
- 不足分析: 未達箇所を特定し、本タスクスコープ内/外を判定する
- 追加実装: 必要な場合のみ追加テストを実装して再計測する

### Task 1: カバレッジ分析（17箇所有効化後）

### Task 2: カバレッジ不足箇所の特定と追加テスト計画

### Task 3: 追加テストの実装（必要な場合）

---

## 参照資料

| 参照資料                 | パス                                                              | 内容                   |
| ------------------------ | ----------------------------------------------------------------- | ---------------------- |
| Phase 4 テストケース仕様 | `docs/30-workflows/sdk-test-enablement/phase-4-test-creation.md`  | テストケース仕様       |
| Phase 5 実装仕様         | `docs/30-workflows/sdk-test-enablement/phase-5-implementation.md` | 実装詳細・設計変更記録 |
| skill-executor テスト    | `apps/desktop/src/main/slide/__tests__/skill-executor.test.ts`    | 有効化対象テスト       |
| agent-client テスト      | `apps/desktop/src/main/slide/__tests__/agent-client.test.ts`      | 有効化対象テスト       |
| sdk-integration テスト   | `apps/desktop/src/main/slide/__tests__/sdk-integration.test.ts`   | 有効化対象テスト       |
| skill-executor 実装      | `apps/desktop/src/main/slide/skill-executor.ts`                   | カバレッジ分析対象     |
| agent-client 実装        | `apps/desktop/src/main/slide/agent-client.ts`                     | カバレッジ分析対象     |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                              | 内容                       |
| ------------------ | --------------------------------------------------------------------------------- | -------------------------- |
| テスト品質基準     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | カバレッジ基準・品質ゲート |
| テスト設計パターン | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | テスト実装パターン         |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | 追加テスト時の例外観点     |

---

## 成果物

| 成果物                   | パス                                                                       | 内容                             |
| ------------------------ | -------------------------------------------------------------------------- | -------------------------------- |
| カバレッジレポート       | `docs/30-workflows/sdk-test-enablement/outputs/phase-6/coverage-report.md` | カバレッジ計測結果               |
| 追加テスト（必要な場合） | `apps/desktop/src/main/slide/__tests__/*.test.ts`                          | カバレッジ向上のための追加テスト |

---

## 実行手順

### Step 1: カバレッジ計測

```bash
# 対象ファイルのカバレッジ計測
pnpm --filter @repo/desktop test -- --coverage --run \
  apps/desktop/src/main/slide/__tests__/skill-executor.test.ts \
  apps/desktop/src/main/slide/__tests__/agent-client.test.ts \
  apps/desktop/src/main/slide/__tests__/sdk-integration.test.ts
```

### Step 2: カバレッジ結果の分析

以下のファイルのカバレッジを確認:

| 対象ファイル      | 確認する実装ファイル                            |
| ----------------- | ----------------------------------------------- |
| skill-executor.ts | `apps/desktop/src/main/slide/skill-executor.ts` |
| agent-client.ts   | `apps/desktop/src/main/slide/agent-client.ts`   |

### Step 3: カバレッジ基準との比較

#### ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### Step 4: 追加テストの必要性評価

以下の観点で追加テストの必要性を判断:

| 評価観点                               | 判定基準                                              |
| -------------------------------------- | ----------------------------------------------------- |
| Line Coverage が 80% 未満              | 未カバー行を特定し、テストを追加                      |
| Branch Coverage が 60% 未満            | 未カバー分岐を特定し、条件分岐テストを追加            |
| Function Coverage が 80% 未満          | 未テスト関数を特定し、テストを追加                    |
| 有効化したテストで新たに発見された分岐 | 実装コードの catch / if-else 分岐が未カバーの場合追加 |

### Step 5: 追加テストの実装（必要な場合）

追加テストが必要と判断された場合、以下の方針で実装:

1. **カテゴリ C（エラーハンドリング）の補完**: SDK-SE-13/14、AC-06 の有効化により発見された未テストのエラーパスをカバー
2. **カテゴリ F（HTTPエラーハンドリング）の補完**: 401/500 以外の HTTP エラーコード（403, 429 等）が必要な場合
3. **カテゴリ B（タイムアウト）の補完**: タイムアウト後の状態遷移（isExecuting → false）のテスト

---

## 追加テスト候補（カバレッジ分析後に決定）

以下は Phase 5 完了後のカバレッジ分析で追加が必要になる可能性のあるテスト候補:

| テスト候補                         | 対象ファイル         | 追加条件                                           |
| ---------------------------------- | -------------------- | -------------------------------------------------- |
| 429 Too Many Requests エラー       | agent-client.test    | Branch Coverage 不足の場合                         |
| 403 Forbidden エラー               | agent-client.test    | Branch Coverage 不足の場合                         |
| ネットワークエラー（ECONNREFUSED） | agent-client.test    | Line Coverage 不足の場合                           |
| タイムアウト後の状態リセット確認   | skill-executor.test  | タイムアウトテスト有効化後に新分岐が発見された場合 |
| 連続エラー後のリカバリ             | sdk-integration.test | 統合テストカバレッジ不足の場合                     |

---

## 統合テスト連携（Phase 1-11は必須）

- [ ] 対象3ファイルをカバレッジ付きで再実行し、統合シナリオに影響がないことを確認
- [ ] カバレッジ未達がスコープ外の場合は Phase 12 の未タスク候補として記録する
- [ ] 統合連携の検証結果を `outputs/phase-6/coverage-report.md` に記録する

---

## 完了条件

- [ ] カバレッジ計測が完了し、結果がレポートに記録されている
- [ ] カバレッジ基準の達成状況が明確である（Line 80%+, Branch 60%+, Function 80%+）
- [ ] カバレッジ不足箇所が特定されている（0 箇所の場合はその旨を記録）
- [ ] 追加テストが必要な場合は実装されている
- [ ] 追加テストが不要な場合はその根拠が記録されている
- [ ] 全テストが PASS している
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

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

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 5 が完了していること
- **後続**: Phase 7 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 6 実行記録

### カバレッジ結果（有効化後）

- skill-executor.ts:
  - Line Coverage: {{%}}
  - Branch Coverage: {{%}}
  - Function Coverage: {{%}}
- agent-client.ts:
  - Line Coverage: {{%}}
  - Branch Coverage: {{%}}
  - Function Coverage: {{%}}

### 追加テスト

- 追加テスト数: {{数}}
- 追加理由: {{理由}}

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

`docs/30-workflows/sdk-test-enablement/phase-7-coverage-check.md`
