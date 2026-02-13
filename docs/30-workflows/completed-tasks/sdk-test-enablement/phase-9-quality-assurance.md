# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 9                                 |
| Phase名    | 品質保証                          |
| タスクID   | TASK-FIX-11-1-SDK-TEST-ENABLEMENT |
| 前提Phase  | Phase 8 (リファクタリング)        |
| 後続Phase  | Phase 10 (最終レビューゲート)     |
| ステータス | 未実施                            |
| 作成日     | 2026-02-13                        |
| 機能名     | sdk-test-enablement               |

---

## 目的

Lint・型チェック・全テスト実行・セキュリティ確認を通じて、有効化したSDK統合テスト17箇所が全品質基準を満たしていることを検証する。

## 背景

Phase 8 のリファクタリング完了後、本番リリースに向けた品質保証を行う。対象は3つのテストファイル（skill-executor.test.ts, agent-client.test.ts, sdk-integration.test.ts）に含まれる17箇所の旧TODOコメント付きテストケースの有効化結果である。

---

## 実行タスク

- 機能検証: 対象3ファイルと回帰テストのPASSを確認する
- 静的検証: ESLint/TypeScript/セキュリティ観点を検証する
- 品質判定: カバレッジ・TODO残存・機密情報露出の有無を判定する

### Task 1: 機能検証 - 全テストPASS

対象3ファイルの全テストが成功することを確認する。

```bash
# skill-executor.test.ts（5箇所のTODO有効化を含む）
pnpm --filter @repo/desktop test -- --run apps/desktop/src/main/slide/__tests__/skill-executor.test.ts

# agent-client.test.ts（9箇所のTODO有効化を含む）
pnpm --filter @repo/desktop test -- --run apps/desktop/src/main/slide/__tests__/agent-client.test.ts

# sdk-integration.test.ts（3箇所のTODO有効化を含む）
pnpm --filter @repo/desktop test -- --run apps/desktop/src/main/slide/__tests__/sdk-integration.test.ts
```

**確認基準**: 3ファイル全てで全テストケースがPASSすること。FAILが1件でもある場合は Phase 5 に戻る。

### Task 2: コード品質 - 静的解析

#### 2-1. ESLint チェック

```bash
pnpm lint
```

**確認基準**: エラー0件であること。warning は許容するが、テストファイル内の warning は内容を確認し記録する。

#### 2-2. TypeScript 型チェック

```bash
pnpm typecheck
```

**確認基準**: 型エラー0件であること。`any` 型の使用がないことを確認する。

### Task 3: テスト網羅性 - カバレッジ基準

対象ファイルのカバレッジが以下の基準を満たすことを確認する。

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

```bash
# カバレッジ付きテスト実行
pnpm --filter @repo/desktop test -- --run --coverage apps/desktop/src/main/slide/__tests__/skill-executor.test.ts apps/desktop/src/main/slide/__tests__/agent-client.test.ts apps/desktop/src/main/slide/__tests__/sdk-integration.test.ts
```

**確認基準**: 最低基準を全て満たすこと。未達の場合は Phase 6 に戻る。

### Task 4: セキュリティ確認

#### 4-1. ハードコードされた本番APIキーの不在確認

```bash
# テストファイル内に本番APIキーが含まれていないことを確認
# sk- プレフィックスの実APIキーパターンを検索
grep -rn "sk-ant-" apps/desktop/src/main/slide/__tests__/
grep -rn "sk-[a-zA-Z0-9]\{20,\}" apps/desktop/src/main/slide/__tests__/
```

**確認基準**: 上記コマンドの出力が0件であること。テスト内で使用するAPIキーはダミー値（`test-api-key`, `mock-key` 等）であること。

#### 4-2. エラーメッセージの機密情報漏洩確認

- テストのエラーハンドリング検証で、エラーメッセージに機密情報（APIキー、内部パス、スタックトレース）が露出していないことを確認する
- `.claude/rules/04-electron-security.md` の IPC セキュリティ原則に準拠していることを検証する

### Task 5: TODOコメント残存チェック

```bash
# SDK関連のTODOコメントが全て除去されていることを確認
grep -rn "TODO.*SDK" apps/desktop/src/main/slide/__tests__/
```

**確認基準**: 出力が0件であること。1件でも残存している場合は Phase 5 に戻り該当TODOを有効化する。

### Task 6: 回帰テスト

```bash
# slide配下の全テスト実行（回帰テスト）
pnpm --filter @repo/desktop test -- --run apps/desktop/src/main/slide/__tests__/
```

**確認基準**: 17箇所の有効化が既存テストに悪影響を与えていないことを確認する。全テストPASS必須。

---

## 参照資料

| 参照資料               | パス                                                                          | 内容                             |
| ---------------------- | ----------------------------------------------------------------------------- | -------------------------------- |
| skill-executor テスト  | `apps/desktop/src/main/slide/__tests__/skill-executor.test.ts`                | 品質検証対象（5箇所）            |
| agent-client テスト    | `apps/desktop/src/main/slide/__tests__/agent-client.test.ts`                  | 品質検証対象（9箇所）            |
| sdk-integration テスト | `apps/desktop/src/main/slide/__tests__/sdk-integration.test.ts`               | 品質検証対象（3箇所）            |
| Phase 8 記録           | `docs/30-workflows/sdk-test-enablement/outputs/phase-8/refactoring-report.md` | リファクタリング結果             |
| コード品質ルール       | `.claude/rules/02-code-quality.md`                                            | カバレッジ基準・コーディング規約 |
| セキュリティルール     | `.claude/rules/04-electron-security.md`                                       | IPC セキュリティ原則             |

- 依存Phase成果物: `phase-5-implementation.md`

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料       | パス                                                                          | 内容              |
| -------------- | ----------------------------------------------------------------------------- | ----------------- |
| 品質基準       | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` | 品質・開発基準    |
| 既知の落とし穴 | `.claude/rules/06-known-pitfalls.md`                                          | P9, P20, P22 参照 |

---

## 成果物

| 成果物       | パス                                                                      | 内容                               |
| ------------ | ------------------------------------------------------------------------- | ---------------------------------- |
| 品質レポート | `docs/30-workflows/sdk-test-enablement/outputs/phase-9/quality-report.md` | 品質検証結果（全ゲート結果を含む） |

---

## 品質チェックリスト

### 機能検証

- [ ] `skill-executor.test.ts`: 全テスト PASS
- [ ] `agent-client.test.ts`: 全テスト PASS
- [ ] `sdk-integration.test.ts`: 全テスト PASS
- [ ] `__tests__/` 配下の全テスト PASS（回帰テスト）

### コード品質

- [ ] ESLint エラー 0件
- [ ] TypeScript 型エラー 0件
- [ ] `any` 型の使用がないこと

### テスト網羅性

- [ ] Line Coverage 80%以上
- [ ] Branch Coverage 60%以上
- [ ] Function Coverage 80%以上

### セキュリティ

- [ ] テストファイル内に本番APIキー（`sk-ant-` 等）が含まれていないこと
- [ ] エラーメッセージに機密情報が露出していないこと
- [ ] ダミーAPIキーのみが使用されていること

### TODO残存

- [ ] `grep -rn "TODO.*SDK" apps/desktop/src/main/slide/__tests__/` の出力が0件であること

---

## 統合テスト連携（Phase 1-11は必須）

### Phase 9での必須アクション

- [ ] 品質保証で全テスト結果を確認
- [ ] セキュリティ観点の検証完了
- [ ] 回帰テストで既存テストへの影響がないことを確認

---

## 完了条件

- [ ] 対象3ファイルの全テストが PASS している
- [ ] `__tests__/` 配下の回帰テストが全て PASS している
- [ ] ESLint エラーが 0件である
- [ ] TypeScript 型エラーが 0件である
- [ ] テストカバレッジが最低基準（Line 80%, Branch 60%, Function 80%）を達成している
- [ ] テストファイル内にハードコードされた本番APIキーがないことが確認されている
- [ ] `TODO.*SDK` コメントが0件であることが確認されている
- [ ] 品質レポート（`outputs/phase-9/quality-report.md`）が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

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

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 5, 8 が完了していること
- **後続**: Phase 10 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 9 実行記録

### 品質検証結果

- テスト結果:
  - skill-executor.test.ts: {{PASS/FAIL}} ({{テスト数}}件)
  - agent-client.test.ts: {{PASS/FAIL}} ({{テスト数}}件)
  - sdk-integration.test.ts: {{PASS/FAIL}} ({{テスト数}}件)
  - 回帰テスト: {{PASS/FAIL}} ({{テスト数}}件)
- ESLint エラー: {{数}}件
- TypeScript 型エラー: {{数}}件
- テストカバレッジ:
  - Line: {{%}}
  - Branch: {{%}}
  - Function: {{%}}
- セキュリティ:
  - 本番APIキー検出: {{0件/N件}}
  - TODO残存: {{0件/N件}}

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

`docs/30-workflows/sdk-test-enablement/phase-10-final-review.md`
