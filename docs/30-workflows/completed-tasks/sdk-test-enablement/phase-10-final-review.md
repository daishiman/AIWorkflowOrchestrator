# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 10                                |
| Phase名    | 最終レビューゲート                |
| タスクID   | TASK-FIX-11-1-SDK-TEST-ENABLEMENT |
| 前提Phase  | Phase 9 (品質保証)                |
| 後続Phase  | Phase 11 (手動テスト検証)         |
| ステータス | 未実施                            |
| 作成日     | 2026-02-13                        |
| 機能名     | sdk-test-enablement               |

---

## 目的

実装完了後の全体品質・整合性を検証し、17箇所のSDK統合テスト有効化が正しく行われ、テストが実質的な品質保証として機能していることを最終確認する。

## 背景

Phase 4-9 でテストの有効化・実装・カバレッジ確認・リファクタリング・品質保証が完了した状態で、手動テストに進む前の最終レビューを行う。単にテストがPASSしているだけでなく、テストが「意味のある検証」を行っているかを確認する。

---

## 実行タスク

- 完全性レビュー: TODO 17箇所の有効化漏れがないことを確認する
- 品質レビュー: テストの実質性・モック妥当性・統合影響を確認する
- 最終判定: PASS/MINOR/MAJOR/CRITICAL を決定し次Phase条件を確定する

### Task 1: TODO有効化の完全性レビュー

17箇所全てのTODOが有効化されていることを確認する。

#### 1-1. skill-executor.test.ts（5箇所）

| No  | テストケースID         | TODO内容                                                                | 確認 |
| --- | ---------------------- | ----------------------------------------------------------------------- | ---- |
| 1   | （スキル名マッピング） | `mockAgentAPI.query` がスキル名を含むプロンプトで呼び出されることの検証 | [ ]  |
| 2   | （projectPath検証）    | `options` に `projectPath` が正しく設定されることの検証                 | [ ]  |
| 3   | SDK-SE-05              | 30秒タイムアウトの実テスト                                              | [ ]  |
| 4   | SDK-SE-13              | API key not found エラーハンドリング                                    | [ ]  |
| 5   | SDK-SE-14              | SDK call failed エラーハンドリング                                      | [ ]  |

#### 1-2. agent-client.test.ts（9箇所）

| No  | テストケースID | TODO内容                               | 確認 |
| --- | -------------- | -------------------------------------- | ---- |
| 1   | AC-06          | APIエラーシミュレーション              | [ ]  |
| 2   | SDK-AC-01      | safeStorage からAPIキー取得            | [ ]  |
| 3   | SDK-AC-02      | 環境変数フォールバック                 | [ ]  |
| 4   | SDK-AC-03      | APIキー未検出エラー                    | [ ]  |
| 5   | SDK-AC-04      | 正しいモデル使用確認                   | [ ]  |
| 6   | SDK-AC-05      | max_tokens 8192 設定確認               | [ ]  |
| 7   | SDK-AC-06      | systemPrompt 受け渡し                  | [ ]  |
| 8   | SDK-AC-09      | 401 Unauthorized ハンドリング          | [ ]  |
| 9   | SDK-AC-10      | 500 Internal Server Error ハンドリング | [ ]  |

#### 1-3. sdk-integration.test.ts（3箇所）

| No  | テストケースID     | TODO内容                  | 確認 |
| --- | ------------------ | ------------------------- | ---- |
| 1   | INT-02             | 無効APIキーエラー         | [ ]  |
| 2   | INT-05             | SDK障害時エラーメッセージ | [ ]  |
| 3   | （パラメータ検証） | パラメータ正確性検証      | [ ]  |

### Task 2: テスト品質レビュー

各テストが「形式的なPASS」ではなく「意味のあるテスト」であることを確認する。

#### 2-1. アサーションの実質性

- [ ] 各テストケースに1つ以上の具体的なアサーション（`expect`）が存在する
- [ ] `expect(true).toBe(true)` のような形骸化したアサーションがない
- [ ] エラーハンドリングテストでは、エラーの種類・メッセージ・コードが具体的に検証されている
- [ ] 成功パスのテストでは、戻り値の構造・内容が具体的に検証されている

#### 2-2. モックの適切性

- [ ] モックが実際のSDK動作を実装仕様どおりに再現している
- [ ] `@anthropic-ai/claude-agent-sdk` のモックが SDK の実際のインターフェースに準拠している
- [ ] エラーレスポンスのモックが実際のAPIエラー形式（HTTPステータスコード、エラーメッセージ構造）を反映している
- [ ] 認証フロー（safeStorage -> 環境変数フォールバック）のモックが実装と一致している

#### 2-3. エッジケースカバレッジ

- [ ] 正常系と異常系の両方がテストされている
- [ ] 境界値（タイムアウト時間、空文字列APIキー）がテストされている
- [ ] 非同期処理のエラーハンドリングが十分にテストされている

### Task 3: 既存テストへの影響確認

- [ ] `__tests__/` 配下の全テストファイルが Phase 9 で PASS していることを品質レポートで確認する
- [ ] 17箇所の有効化により、既存テストの実行時間に著しい増加がないことを確認する
- [ ] テストファイル間のモック干渉がないことを確認する（P9: モジュールスコープ変数のテスト間リーク対策）

### Task 4: セキュリティ観点レビュー

- [ ] エラーハンドリングテストがOWASP原則に沿っている:
  - 認証エラー（401）で内部情報が露出しないこと
  - サーバーエラー（500）でスタックトレースが露出しないこと
  - APIキー関連エラーでキー値がログ・エラーメッセージに含まれないこと
- [ ] テスト内のダミーAPIキーが本番キーと区別できる形式であること（`test-`, `mock-` プレフィックス推奨）
- [ ] `.claude/rules/04-electron-security.md` のIPCセキュリティ原則への準拠を確認

### Task 5: レビュー判定

上記 Task 1-4 の結果に基づき、最終判定を行う。

---

## 参照資料

| 参照資料               | パス                                                                          | 内容                  |
| ---------------------- | ----------------------------------------------------------------------------- | --------------------- |
| skill-executor テスト  | `apps/desktop/src/main/slide/__tests__/skill-executor.test.ts`                | レビュー対象（5箇所） |
| agent-client テスト    | `apps/desktop/src/main/slide/__tests__/agent-client.test.ts`                  | レビュー対象（9箇所） |
| sdk-integration テスト | `apps/desktop/src/main/slide/__tests__/sdk-integration.test.ts`               | レビュー対象（3箇所） |
| Phase 9 品質レポート   | `docs/30-workflows/sdk-test-enablement/outputs/phase-9/quality-report.md`     | 品質検証結果          |
| Phase 8 記録           | `docs/30-workflows/sdk-test-enablement/outputs/phase-8/refactoring-report.md` | リファクタリング結果  |
| セキュリティルール     | `.claude/rules/04-electron-security.md`                                       | IPC セキュリティ原則  |

- 依存Phase成果物: `phase-1-requirements.md`, `phase-2-design.md`, `phase-5-implementation.md`

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                | パス                                                                                 | 内容                             |
| ----------------------- | ------------------------------------------------------------------------------------ | -------------------------------- |
| テスト品質基準          | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`          | 最終品質ゲート基準               |
| SDK実行インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md` | SkillExecutor仕様との整合確認    |
| エラーハンドリング      | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                | エラー応答・機密情報取り扱い基準 |
| セキュリティ原則        | `.claude/skills/aiworkflow-requirements/references/security-principles.md`           | 認証/エラー表示の安全性確認      |

---

## 成果物

| 成果物           | パス                                                                            | 内容                   |
| ---------------- | ------------------------------------------------------------------------------- | ---------------------- |
| 最終レビュー結果 | `docs/30-workflows/sdk-test-enablement/outputs/phase-10/final-review-result.md` | レビュー判定・指摘事項 |

---

## レビュー観点サマリ

### 1. TODO有効化の完全性

- [ ] 17箇所全てのTODOコメントが除去され、テストコードが有効化されている
- [ ] `grep -rn "TODO.*SDK" apps/desktop/src/main/slide/__tests__/` の出力が0件

### 2. テストの実質性

- [ ] 全テストケースが形式的PASSではなく意味のある検証を行っている
- [ ] アサーションが具体的な値・構造を検証している

### 3. モックの正確性

- [ ] モックが実際のSDK動作を正確に再現している
- [ ] エラーレスポンスが実APIの形式に準拠している

### 4. 既存テストとの共存

- [ ] 回帰テストで既存テストへの悪影響がないことを確認済み
- [ ] テスト間のモック干渉がないことを確認済み

### 5. セキュリティ適合性

- [ ] OWASP/セキュリティ観点でエラーハンドリングが適切
- [ ] 機密情報の露出がないことを確認済み

---

## レビュー結果判定

| 判定     | 条件                                     | 次のアクション                                                                            |
| -------- | ---------------------------------------- | ----------------------------------------------------------------------------------------- |
| PASS     | 全レビュー観点（5項目）で問題なし        | Phase 11 へ進行                                                                           |
| MINOR    | 軽微な指摘あり（テスト品質の微修正等）   | 未タスク仕様書に変換後 Phase 11 へ（省略不可: `.claude/rules/05-task-execution.md` 参照） |
| MAJOR    | 重大な問題あり（テスト実装の根本的不備） | 問題の種類に応じて Phase 4（テスト設計）または Phase 5（実装）へ戻る                      |
| CRITICAL | 根本的な問題あり（要件の見直し必要）     | Phase 1 へ戻りユーザー確認                                                                |

### 戻り先決定基準

| 問題の種類               | 戻り先                      |
| ------------------------ | --------------------------- |
| テスト設計の根本的な不備 | Phase 4（テスト作成）       |
| テスト実装のバグ・不足   | Phase 5（実装）             |
| モック設計の不適切さ     | Phase 4（テスト作成）       |
| カバレッジ不足           | Phase 6（テスト拡充）       |
| リファクタリング不足     | Phase 8（リファクタリング） |

### MINOR指摘の処理

MINOR判定の場合、以下の手順を実行する:

1. 指摘事項を `tasks/unassigned-task/` に未タスク仕様書として作成
2. `task-workflow.md` の残課題テーブルに登録
3. 関連仕様書に参照リンクを追加
4. その後 Phase 11 へ進行

---

## 統合テスト連携（Phase 1-11は必須）

### Phase 10での必須アクション

- [ ] 最終レビューで全テスト結果（Phase 9 の品質レポート）を確認
- [ ] 統合観点の品質確認（テスト間干渉なし、回帰テスト成功）
- [ ] セキュリティ観点の最終検証

---

## 完了条件

- [ ] 17箇所全てのTODO有効化が確認されている
- [ ] テスト品質レビュー（実質性・モック適切性・エッジケース）が完了している
- [ ] 既存テストへの影響がないことが確認されている
- [ ] セキュリティ観点のレビューが完了している
- [ ] レビュー結果が文書化されている（`outputs/phase-10/final-review-result.md`）
- [ ] 判定結果（PASS/MINOR/MAJOR/CRITICAL）が記録されている
- [ ] MINOR指摘がある場合は全て未タスク仕様書に変換されている
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
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 1, 4, 5, 8, 9 が完了していること
- **後続**: Phase 11 へ進む（PASS/MINOR判定の場合）

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 10 実行記録

### レビュー結果

- 判定: {{PASS/MINOR/MAJOR/CRITICAL}}
- 指摘事項数: {{数}}

### レビュー詳細

- TODO有効化完全性: {{17/17確認済み / 未完了箇所あり}}
- テスト実質性: {{問題なし / 指摘あり}}
- モック適切性: {{問題なし / 指摘あり}}
- 既存テスト影響: {{なし / あり}}
- セキュリティ適合: {{問題なし / 指摘あり}}

### 指摘事項一覧（該当する場合）

| No  | 観点 | 指摘内容 | 重要度 | 対応 |
| --- | ---- | -------- | ------ | ---- |
| 1   |      |          |        |      |

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

`docs/30-workflows/sdk-test-enablement/phase-11-manual-test.md`
