# Phase 7: テストカバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 7                                 |
| Phase名    | テストカバレッジ確認              |
| 前提Phase  | Phase 6 (テスト拡充)              |
| 後続Phase  | Phase 8 (リファクタリング)        |
| ステータス | 未実施                            |
| 作成日     | 2026-02-13                        |
| 機能名     | sdk-test-enablement               |
| タスクID   | TASK-FIX-11-1-SDK-TEST-ENABLEMENT |

---

## 目的

Phase 6 のテスト拡充結果を最終検証し、カバレッジ基準を満たしているかゲート判定を行う。未達の場合は Phase 6 へ戻りテスト拡充を追加する。

## 背景

本タスクは「既存の無効化テスト 17 箇所の有効化」が主目的であり、新規機能実装は含まない。そのため、カバレッジの向上は主に以下から得られる:

- 17 箇所のテスト有効化による直接的なカバレッジ向上
- Phase 6 で追加されたテスト（ある場合）
- 既存のテストカバレッジ

カバレッジ基準を満たさない場合は Phase 6 へ戻るが、本タスクのスコープ外の箇所（SDK 統合以外のコード）のカバレッジ不足は未タスクとして報告する。

---

## 実行タスク

- 最終計測: 対象実装のLine/Branch/Functionカバレッジを確定する
- ゲート判定: PASS/FAIL/条件付きPASSを明示して進行可否を決める
- 是正判断: 未達時の戻り先または未タスク化を決定する

### Task 1: カバレッジ最終計測

### Task 2: ゲート判定

### Task 3: 未達時の対応判断

---

## 参照資料

| 参照資料           | パス                                                                       | 内容                     |
| ------------------ | -------------------------------------------------------------------------- | ------------------------ |
| Phase 6 カバレッジ | `docs/30-workflows/sdk-test-enablement/outputs/phase-6/coverage-report.md` | Phase 6 のカバレッジ結果 |
| Phase 4 テスト仕様 | `docs/30-workflows/sdk-test-enablement/phase-4-test-creation.md`           | テストケース仕様         |
| Phase 5 実装仕様   | `docs/30-workflows/sdk-test-enablement/phase-5-implementation.md`          | 実装詳細                 |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                              | 内容                     |
| ------------------ | --------------------------------------------------------------------------------- | ------------------------ |
| テスト品質基準     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | カバレッジ判定基準       |
| テスト設計パターン | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | 判定時のテスト品質観点   |
| 未タスク運用仕様   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`              | スコープ外課題の記録方針 |

---

## 成果物

| 成果物             | パス                                                                       | 内容               |
| ------------------ | -------------------------------------------------------------------------- | ------------------ |
| カバレッジ検証結果 | `docs/30-workflows/sdk-test-enablement/outputs/phase-7/coverage-report.md` | 最終検証結果・判定 |

---

## 実行手順

### Step 1: カバレッジ最終計測

```bash
# カバレッジ計測コマンド
pnpm --filter @repo/desktop test -- --coverage --run \
  apps/desktop/src/main/slide/__tests__/skill-executor.test.ts \
  apps/desktop/src/main/slide/__tests__/agent-client.test.ts \
  apps/desktop/src/main/slide/__tests__/sdk-integration.test.ts
```

### Step 2: カバレッジ基準チェック

#### ユニットテストカバレッジ

| 指標              | 最低基準 | 推奨基準 | skill-executor.ts | agent-client.ts | 判定 |
| ----------------- | -------- | -------- | ----------------- | --------------- | ---- |
| Line Coverage     | 80%      | 90%      | -                 | -               | -    |
| Branch Coverage   | 60%      | 70%      | -                 | -               | -    |
| Function Coverage | 80%      | 90%      | -                 | -               | -    |

### Step 3: TODO 除去確認

```bash
# TODO コメントが残っていないことを確認
grep -n "TODO: SDK統合後" apps/desktop/src/main/slide/__tests__/*.test.ts
```

期待結果: **0 件**（全 TODO コメントが除去されていること）

### Step 4: 全テスト PASS 確認

```bash
# 全テスト実行
pnpm --filter @repo/desktop test -- --run apps/desktop/src/main/slide/__tests__/
```

期待結果: **全テスト PASS**

---

## ゲート判定

| 判定 | 条件                                      | 次のアクション                 |
| ---- | ----------------------------------------- | ------------------------------ |
| PASS | 全カバレッジ基準を達成 かつ 全テスト PASS | Phase 8 へ進行                 |
| FAIL | カバレッジ基準未達（本タスクスコープ内）  | Phase 6 へ戻る                 |
| PASS | カバレッジ基準未達（本タスクスコープ外）  | Phase 8 へ進行（未タスク報告） |

### 判定の詳細基準

#### PASS 条件（即座に Phase 8 へ）

- [ ] skill-executor.ts: Line 80%+, Branch 60%+, Function 80%+
- [ ] agent-client.ts: Line 80%+, Branch 60%+, Function 80%+
- [ ] 全テストが PASS
- [ ] `// TODO: SDK統合後` コメントが 0 件

#### 条件付き PASS（Phase 8 へ進むが未タスク報告）

- [ ] カバレッジ基準未達の箇所が本タスクのスコープ外（SDK 統合テスト以外のコード）
- [ ] 未タスクとして `unassigned-task/` に報告

#### FAIL 条件（Phase 6 へ戻る）

- [ ] 17 箇所の有効化に直接関連する箇所でカバレッジ基準未達
- [ ] テストが FAIL している
- [ ] TODO コメントが残っている

---

## 未達時の対応フロー

```
カバレッジ基準未達
  ├── 本タスクスコープ内？
  │   ├── Yes → Phase 6 へ戻り追加テスト実装
  │   └── No  → 未タスク報告し Phase 8 へ進行
  └── テスト FAIL？
      ├── Yes → Phase 5 へ戻り修正
      └── No  → 上記フローへ
```

---

## 統合テスト連携（Phase 1-11は必須）

- [ ] 最終ゲート判定時に `sdk-integration.test.ts` の結果を含めて統合観点の合格を確認する
- [ ] 条件付きPASS時は、統合影響を明記したうえで未タスク化方針を記録する
- [ ] 判定結果を `outputs/phase-7/coverage-report.md` に反映し、Phase 8/12へ引き継ぐ

---

## 完了条件

- [ ] カバレッジ最終計測が完了している
- [ ] ゲート判定が実施されている（PASS / FAIL が明確）
- [ ] PASS の場合: 全カバレッジ基準達成 かつ 全テスト PASS
- [ ] FAIL の場合: Phase 6 へ戻る判断が記録されている
- [ ] 条件付き PASS の場合: 未タスクが報告されている
- [ ] TODO コメントが全て除去されている（`grep` 結果 0 件）
- [ ] カバレッジ検証結果がレポートに記録されている
- [ ] **本 Phase 内の全作業を 100% 完了**

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

- [ ] 本 Phase 内の全作業を 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 5, 6 が完了していること
- **後続**: Phase 8 へ進む（PASS 判定の場合）

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 7 実行記録

### カバレッジ検証結果

- skill-executor.ts:
  - Line Coverage: {{%}} (基準: 80%)
  - Branch Coverage: {{%}} (基準: 60%)
  - Function Coverage: {{%}} (基準: 80%)
- agent-client.ts:
  - Line Coverage: {{%}} (基準: 80%)
  - Branch Coverage: {{%}} (基準: 60%)
  - Function Coverage: {{%}} (基準: 80%)

### ゲート判定: {{PASS / FAIL / 条件付きPASS}}

### TODO 除去確認

- 残存 TODO 数: {{数}} (期待値: 0)

### テスト結果

- 全テスト PASS: {{Yes/No}}
- テスト総数: {{数}}
- 有効化したテスト数: 17

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

`docs/30-workflows/sdk-test-enablement/phase-8-refactoring.md`
