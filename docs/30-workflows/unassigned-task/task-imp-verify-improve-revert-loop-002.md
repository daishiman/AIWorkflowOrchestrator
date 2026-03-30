# task-imp-verify-improve-revert-loop-002: TASK-P0-02 verify→improve→re-verify 閉ループ修復

## メタ情報

```yaml
issue_number: 1740
```

## メタ情報

| 項目         | 内容                                                                             |
| ------------ | -------------------------------------------------------------------------------- |
| タスクID     | task-imp-verify-improve-revert-loop-002                                          |
| タスク名     | TASK-P0-02 verify→improve→re-verify 閉ループ修復                                 |
| 分類         | 改善（imp）                                                                      |
| 対象機能     | `SkillCreatorWorkflowEngine` / `SkillCreatorVerificationEngine` 自動改善サイクル |
| 優先度       | 高（P0）                                                                         |
| 見積もり規模 | 大                                                                               |
| ステータス   | 未実施                                                                           |
| 発見元       | Phase 12                                                                         |
| 発見日       | 2026-03-29                                                                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-P0-01（verify-execution-engine-layer12）では `SkillCreatorVerificationEngine`（Layer 1/2）を実装し、スキルの検証チェックを実行できるようになった。

しかし現状の実装は「verify を実行して結果を返す」だけであり、その後の改善サイクルが存在しない。
`recordVerifyPass()` メソッドも TASK-P0-01 のスコープ外として意図的に分離されており、後続タスクとして正式に仕様化する必要がある。

Skill Creator の本来のゴールは「スキルを自律的に作成・検証・改善する閉ループ」であり、verify の結果が improve フェーズへフィードバックされる経路が確立されなければ、ユーザーが手動介入しなければならない状態が続く。

### 1.2 問題点・課題

- `SkillCreatorWorkflowEngine` は verify 失敗時にエラーとして記録するだけで、自動修復フローが存在しない
- `recordVerifyPass()` メソッドが未実装であり、verify が成功した場合のワークフロー状態遷移が定義されていない
- verify 結果（`RuntimeSkillCreatorVerifyCheck[]`）を improve フェーズへ渡す型契約・パイプラインが未設計
- `RuntimeSkillCreatorFacade.verifySkill()` は verify 結果を返すだけで、improve への橋渡しを持っていない

### 1.3 放置した場合の影響

- Skill Creator が半自律的なまま留まり、ユーザーが verify 結果を見て手動で improve を呼び出す必要がある
- verify → improve → re-verify のサイクルがなければ、スキルの品質向上が人間依存になる
- 将来の Layer 3/4 verify（動作検証・統合検証）を追加した際も、閉ループがない設計では同じ問題が繰り返される

---

## 2. 何を達成するか（What）

### 2.1 目的

verify が失敗した場合に自動的に improve フェーズへ移行し、改善後に re-verify を実行する「閉ループ」を `SkillCreatorWorkflowEngine` に実装する。

### 2.2 最終ゴール

1. `SkillCreatorWorkflowEngine` に `executeImprovePhase()` メソッドを追加し、verify 結果を受け取り improve フェーズを起動できるようにする
2. `recordVerifyPass()` メソッドを実装し、verify 成功時のワークフロー状態遷移を定義する
3. verify → improve → re-verify の状態遷移を型で表現し、UI スナップショット（`SkillCreatorWorkflowUiSnapshot`）に反映する
4. `RuntimeSkillCreatorFacade` に verify→improve パイプラインのエントリーポイントを追加する

### 2.3 スコープ

#### 含むもの

- `SkillCreatorWorkflowEngine.executeImprovePhase()` の設計と実装
- `SkillCreatorWorkflowEngine.recordVerifyPass()` の実装
- verify → improve → re-verify の状態遷移設計
- 上記に必要な型定義追加（`packages/shared/src/types/skillCreator.ts`）
- `RuntimeSkillCreatorFacade` へのパイプラインエントリーポイント追加
- 全変更に対応するユニットテスト

#### 含まないもの

- Layer 3/4 verify の実装（本タスクは Layer 1/2 の閉ループが対象）
- UI コンポーネントの変更（ワークフロー状態をUIに表示する部分は別タスク）
- 外部 LLM への新規プロンプト設計（既存の improve プロンプトを活用）
- 無限ループ防止以外の高度なループ制御（最大試行回数の設定は本タスクに含む）

### 2.4 成果物

- `SkillCreatorWorkflowEngine.ts`（`executeImprovePhase()` / `recordVerifyPass()` 追加）
- `packages/shared/src/types/skillCreator.ts`（状態遷移型の追加）
- `RuntimeSkillCreatorFacade.ts`（パイプラインエントリーポイント追加）
- 対応ユニットテスト
- 本タスク仕様書のアップデート（Phase 12 成果物）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-P0-01（verify-execution-engine-layer12）が完了していること
- `SkillCreatorVerificationEngine` が実装済みで、`RuntimeSkillCreatorFacade.verifySkill()` が呼び出せる状態であること
- `pnpm --filter @repo/desktop typecheck` および `pnpm --filter @repo/desktop test` が PASS していること（task-imp-ci-quality-check-001 の完了が推奨）

### 3.2 依存タスク

- **TASK-P0-01**（verify-execution-engine-layer12）: 完了が前提条件
- **task-imp-ci-quality-check-001**: 推奨（本タスク開始前に完了が望ましい）

### 3.3 必要な知識

- `SkillCreatorWorkflowEngine` の既存 API（`recordPlanResult()` / `recordExecuteResult()` / `recordExecutionFailure()` など）
- `SkillCreatorWorkflowUiSnapshot` の状態管理パターン
- `RuntimeSkillCreatorVerifyCheck` 型の構造（layer / severity / id フィールド）
- `RuntimeSkillCreatorFacade.improve()` の既存実装
- 状態機械設計（finite state machine）の基礎

### 3.4 推奨アプローチ

#### 状態遷移設計

verify → improve → re-verify の状態遷移を以下のように設計する：

```
verify_pending
  → verify_running
    → verify_passed (全チェック PASS)
    → verify_failed
      → improve_pending (maxRetry 未達)
      → loop_exhausted (maxRetry 到達)
        → improve_running
          → improve_done
            → reverify_running (re-verify)
              → verify_passed
              → verify_failed (再帰)
```

#### `executeImprovePhase()` 設計指針

- 引数: `planId: string`, `failedChecks: RuntimeSkillCreatorVerifyCheck[]`
- 戻り値: `SkillCreatorWorkflowUiSnapshot`
- 内部処理: `improve()` を呼び出し、結果を `workflowEngine` に記録する
- `failedChecks` の `severity === "error"` を優先して improve フィードバックを生成する

#### `recordVerifyPass()` 設計指針

- 引数: `planId: string`, `checks: RuntimeSkillCreatorVerifyCheck[]`
- 戻り値: `void`
- 処理: ワークフロー状態を `verify_passed` に遷移させ、UI スナップショットを更新する

#### 無限ループ防止

- `maxImproveRetry: number`（デフォルト: 3）を設けて、retry 上限到達時は `loop_exhausted` 状態に遷移する
- 各 improve 試行の結果を `workflowEngine` に記録し、再試行理由を保持する

### 3.5 実装課題と解決策（想定）

| 課題                                                      | 想定原因                                                                   | 解決策                                                      |
| --------------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------- |
| verify 結果から improve フィードバックへの変換            | `RuntimeSkillCreatorVerifyCheck` と improve の `feedback` 文字列に型不一致 | `failedChecks` を文字列にシリアライズするヘルパー関数を作成 |
| re-verify 時に `verifySkill()` が古い skillDir を参照する | `skillDir` がワークフロー状態に保存されていない                            | `recordPlanResult()` 時点で `skillDir` を状態に含める       |
| 状態遷移のテストが複雑になる                              | 非同期処理が多段になる                                                     | 各フェーズを単独でテスト可能な小さな関数に分割する          |
| 既存の `reverifyWorkflow()` との役割重複                  | `reverifyWorkflow()` は UI からの手動 re-verify 専用                       | 自動ループ用の内部メソッドと UI 用メソッドを明確に分離する  |

### 3.6 SubAgent 分担（関心ごとの分離）

| SubAgent   | 担当関心            | 主担当作業                                                     | 依存                  |
| ---------- | ------------------- | -------------------------------------------------------------- | --------------------- |
| SubAgent-A | 型設計              | `skillCreator.ts` への状態遷移型追加                           | 要件定義完了後        |
| SubAgent-B | WorkflowEngine 拡張 | `executeImprovePhase()` / `recordVerifyPass()` 実装            | SubAgent-A の型完成後 |
| SubAgent-C | Facade 拡張         | `RuntimeSkillCreatorFacade` パイプラインエントリーポイント追加 | SubAgent-B 完了後     |
| SubAgent-D | テスト              | 全変更のユニットテスト作成                                     | SubAgent-A/B/C 並行可 |

---

## 4. 実行手順（Phase 構成）

### Phase 1: 要件定義

#### 目的

verify → improve → re-verify 閉ループに必要な要件を確定する。

#### 手順

1. `SkillCreatorWorkflowEngine` の既存 API を精査し、追加が必要なメソッドをリストアップする
2. `SkillCreatorWorkflowUiSnapshot` の状態フィールドを確認し、追加が必要なフィールドを特定する
3. `RuntimeSkillCreatorVerifyCheck` から improve フィードバックへの変換ロジックを設計する
4. 最大試行回数（`maxImproveRetry`）のデフォルト値と設定方法を決定する

#### 成果物

- 要件定義書（本 Phase の成果物として本ドキュメントに追記）

#### 完了条件

- 追加が必要な型・メソッドが全てリストアップされている
- 状態遷移図が完成している

---

### Phase 2: 設計

#### 目的

状態遷移・型定義・メソッドシグネチャを設計する。

#### 手順

1. 状態遷移図を確定する（`verify_pending` → `verify_passed` / `verify_failed` → `improve_pending` → ... ）
2. `packages/shared/src/types/skillCreator.ts` への追加型を設計する
3. `SkillCreatorWorkflowEngine` の追加メソッドシグネチャを設計する
4. `RuntimeSkillCreatorFacade` の追加メソッドシグネチャを設計する

#### 成果物

- 型設計書（設計メモ）
- メソッドシグネチャ一覧

#### 完了条件

- 設計が一貫しており、既存 API との後方互換性を保てる

---

### Phase 3: 設計レビュー

#### 目的

設計の妥当性を確認する。

#### 手順

1. 状態遷移図に「抜け」がないかをチェックする（error / success の全パスを確認）
2. 既存の `reverifyWorkflow()` と `executeImprovePhase()` の役割が明確に分離されているかを確認する
3. 無限ループ防止ロジックが正しく機能するかをユースケースで検証する
4. 型定義の後方互換性を確認する

#### 成果物

- レビューチェックリスト（本 Phase 完了の証跡）

#### 完了条件

- 設計の懸念点が全て解消されている
- レビュアーが承認している

---

### Phase 4: テスト作成

#### 目的

実装前にテストケースを作成する（TDD）。

#### 手順

1. `SkillCreatorWorkflowEngine` の `executeImprovePhase()` テストを作成する
2. `recordVerifyPass()` のテストを作成する
3. verify → improve → re-verify の状態遷移テストを作成する
4. `maxImproveRetry` に達した場合の `loop_exhausted` テストを作成する
5. `RuntimeSkillCreatorFacade` のパイプラインテストを作成する

#### 成果物

- テストファイル（全てスキップ状態で作成）

#### 完了条件

- 全テストが `describe` / `it` として定義されている
- テストがスキップ状態（`it.skip`）で lint/typecheck を通過する

---

### Phase 5: 実装

#### 目的

設計に基づき実装する。

#### 手順

1. `packages/shared/src/types/skillCreator.ts` に状態遷移型を追加する
2. `SkillCreatorWorkflowEngine` に `recordVerifyPass()` を実装する
3. `SkillCreatorWorkflowEngine` に `executeImprovePhase()` を実装する
4. `RuntimeSkillCreatorFacade` にパイプラインエントリーポイントを追加する
5. Phase 4 のスキップテストを有効化し、PASS することを確認する

#### 成果物

- 実装差分

#### 完了条件

- Phase 4 のテストが全件 PASS する
- `pnpm --filter @repo/desktop typecheck` がエラー0件

---

### Phase 6: テスト拡張

#### 目的

エッジケースとリグレッションテストを追加する。

#### 手順

1. verify が全件 PASS の場合のテスト（`recordVerifyPass()` が正しく呼ばれる）
2. verify が失敗し `maxImproveRetry` 未達の場合のテスト
3. `maxImproveRetry` 到達後の `loop_exhausted` テスト
4. improve 中に LLM エラーが発生した場合のテスト
5. re-verify 結果が再び失敗した場合のテスト（再帰ループ）

#### 成果物

- 追加テストケース

#### 完了条件

- 全エッジケースがテストされている

---

### Phase 7: カバレッジ確認

#### 目的

コードカバレッジが目標値を満たすことを確認する。

#### 手順

1. `pnpm --filter @repo/desktop test -- --coverage` を実行する
2. `SkillCreatorWorkflowEngine` の新規追加メソッドのカバレッジを確認する（目標: 80% 以上）
3. カバレッジが不足している場合はテストを追加する

#### 成果物

- カバレッジレポート

#### 完了条件

- 新規追加コードのカバレッジが 80% 以上

---

### Phase 8: リファクタリング

#### 目的

実装の品質を高める。

#### 手順

1. `executeImprovePhase()` の処理が肥大化していないかを確認し、必要に応じてヘルパー関数に分割する
2. verify 結果から improve フィードバックへの変換ロジックを独立した純粋関数として整理する
3. 型の重複・冗長定義がないかを確認する
4. コメント・JSDoc を整備する

#### 成果物

- リファクタリング差分

#### 完了条件

- 全テストが引き続き PASS する
- lint が通過する

---

### Phase 9: QA

#### 目的

品質保証チェックを実施する。

#### 手順

1. `pnpm --filter @repo/desktop typecheck` がエラー0件であることを確認する
2. `pnpm --filter @repo/desktop test` が全件 PASS することを確認する
3. `pnpm --filter @repo/desktop lint` がエラー0件であることを確認する
4. `pnpm --filter @repo/shared build` が成功することを確認する
5. 既存の TASK-P0-01 テスト（VerificationEngine 関連25件）がリグレッションしていないことを確認する

#### 成果物

- QA チェックリスト（本 Phase 完了の証跡）

#### 完了条件

- 全チェックが PASS する

---

### Phase 10: 最終レビュー

#### 目的

実装の全体を俯瞰してレビューする。

#### 手順

1. 設計書（Phase 2）と実装の乖離がないかを確認する
2. セキュリティ観点でのレビュー（入力バリデーション・エラーハンドリング）
3. パフォーマンス観点でのレビュー（無限ループ防止が機能するかを再確認）
4. TASK-P0-01 との整合性確認（既存の verify API が破壊されていないか）

#### 成果物

- 最終レビューチェックリスト

#### 完了条件

- 懸念点が全て解消されている

---

### Phase 11: 手動テスト

#### 目的

実際のスキルディレクトリを使って verify → improve → re-verify が機能することを確認する。

#### 手順

1. テスト用スキルディレクトリを準備する（意図的に verify 失敗するスキル）
2. `RuntimeSkillCreatorFacade.verifySkill()` を呼び出して verify 失敗を確認する
3. 閉ループが起動し、improve → re-verify が自動で実行されることを確認する
4. `maxImproveRetry` 到達後に `loop_exhausted` 状態になることを確認する
5. verify が全件 PASS するスキルで、`recordVerifyPass()` が正しく呼ばれることを確認する

#### 成果物

- 手動テスト結果メモ（スクリーンショットまたはログ）

#### 完了条件

- 閉ループが期待通り動作することが確認された

---

### Phase 12: ドキュメント

#### 目的

実装内容をドキュメントに反映する。

#### 手順

1. 本タスク仕様書の「成果物」セクションを実際の成果物で更新する
2. `SkillCreatorWorkflowEngine` の主要メソッドに JSDoc コメントを追加する
3. verify → improve → re-verify の状態遷移図を `docs/` に追加する（オプション）
4. `task-workflow.md` の残課題テーブルを更新し、本タスクを完了済みとしてマークする

#### 成果物

- 更新済みドキュメント

#### 完了条件

- JSDoc が全追加メソッドに記載されている
- `task-workflow.md` が更新されている

---

### Phase 13: PR 作成

#### 目的

変更を main ブランチへマージするための PR を作成する。

#### 手順

1. ローカル品質チェックを実施する（typecheck / test / lint / shared build）
2. 変更ファイルをステージングする
3. コミットメッセージを作成する（`feat(skill-creator): TASK-P0-02 verify→improve→re-verify 閉ループ実装`）
4. PR を作成する
5. CI が通過することを確認する

#### 成果物

- PR リンク

#### 完了条件

- CI が全て PASS する
- PR がレビュー待ち状態になっている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `SkillCreatorWorkflowEngine.recordVerifyPass()` が実装されている
- [ ] `SkillCreatorWorkflowEngine.executeImprovePhase()` が実装されている
- [ ] verify → improve → re-verify の状態遷移が動作する
- [ ] `maxImproveRetry` に達した場合に `loop_exhausted` 状態に遷移する
- [ ] `RuntimeSkillCreatorFacade` に閉ループのエントリーポイントが追加されている

### 品質要件

- [ ] 全ユニットテストが PASS する
- [ ] `pnpm --filter @repo/desktop typecheck` がエラー0件
- [ ] `pnpm --filter @repo/desktop lint` がエラー0件
- [ ] 新規コードのカバレッジが 80% 以上
- [ ] TASK-P0-01 の既存テストにリグレッションがない

### ドキュメント要件

- [ ] 全追加メソッドに JSDoc が記載されている
- [ ] 本タスク仕様書が更新されている
- [ ] `task-workflow.md` が更新されている

---

## 6. 検証方法

### テストケース

- Case 1: verify が全件 PASS → `recordVerifyPass()` が呼ばれ、状態が `verify_passed` になる
- Case 2: verify が失敗 → `executeImprovePhase()` が自動で呼ばれる
- Case 3: improve 後の re-verify が PASS → 閉ループが正常終了する
- Case 4: `maxImproveRetry` 到達 → `loop_exhausted` 状態に遷移し、ループが停止する
- Case 5: improve 中に LLM エラー → エラーが記録され、ループが停止する

### 検証コマンド

```bash
# shared ビルド
pnpm --filter @repo/shared build

# 型チェック
pnpm --filter @repo/desktop typecheck

# VerificationEngine 関連テスト（リグレッション確認）
pnpm --filter @repo/desktop test -- --reporter=verbose SkillCreatorVerificationEngine

# WorkflowEngine テスト（新規追加テスト）
pnpm --filter @repo/desktop test -- --reporter=verbose SkillCreatorWorkflowEngine

# Facade テスト
pnpm --filter @repo/desktop test -- --reporter=verbose RuntimeSkillCreatorFacade

# 全テスト
pnpm --filter @repo/desktop test

# lint
pnpm --filter @repo/desktop lint

# カバレッジ
pnpm --filter @repo/desktop test -- --coverage
```

---

## 7. リスクと対策

| リスク                                                     | 影響度 | 発生確率 | 対策                                                                               |
| ---------------------------------------------------------- | ------ | -------- | ---------------------------------------------------------------------------------- |
| verify → improve → re-verify の無限ループ                  | 高     | 中       | `maxImproveRetry`（デフォルト3）で上限を設け、達したら `loop_exhausted` へ遷移する |
| improve の LLM 呼び出しが失敗する                          | 中     | 中       | エラー時はループを停止し、エラー理由を `workflowEngine` に記録する                 |
| 既存の `reverifyWorkflow()` と機能が重複する               | 中     | 高       | 自動ループ用と UI 手動用を明示的に分離し、内部メソッドは `private` にする          |
| 型変更が `RuntimeSkillCreatorFacade` の既存 API を破壊する | 高     | 低       | 新規フィールドは optional にして後方互換性を保つ                                   |
| Phase 5 実装中に設計変更が必要になる                       | 中     | 中       | Phase 3 のレビューを十分に行い、設計を固めてから実装に入る                         |

---

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`（参照元実装）
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（`verifySkill()` 実装）
- `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`（拡張対象）
- `packages/shared/src/types/skillCreator.ts`（型定義追加先）
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-09-par-task-p0-01-verify-execution-engine-layer12/`（TASK-P0-01 仕様書群）

### 関連タスク

- **TASK-P0-01**（verify-execution-engine-layer12）: 完了前提
- **task-imp-ci-quality-check-001**: 本タスク開始前に完了推奨
- `TASK-SC-13-VERIFY-CHANNEL-IMPLEMENTATION`（verify チャンネル実装）
- `UT-RUNTIME-FACADE-RETURN-TYPE-001`（Facade 戻り値型）

---

## 9. 備考

### 設計判断の経緯

TASK-P0-01 のスコープで `recordVerifyPass()` の実装を敢えて分離したことは正しい設計判断であった。
verify の実行とその後の改善サイクルは異なるレイヤーの責務であり、単一タスクに押し込むと実装が肥大化する。

本タスクが verify → improve → re-verify の閉ループを担うことで、責務が明確に分離される。

### 実装上の注意点

- `executeImprovePhase()` は `SkillCreatorWorkflowEngine` の内部メソッドとして実装し、`RuntimeSkillCreatorFacade` からは公開 API 経由でのみアクセスできるようにすること
- 状態遷移は `SkillCreatorWorkflowUiSnapshot` に反映し、UI が現在のループ状態を表示できるようにすること（UI コンポーネントの実装は本タスクのスコープ外）
- re-verify 時は同じ `verificationEngine.verify(skillDir)` を呼び出すこと（Layer 1/2 チェックが対象）

### 将来拡張への配慮

Layer 3/4 verify（動作検証・統合検証）が追加される際にも、本タスクで設計する閉ループのパターンが流用できるよう、拡張点を設計段階で明示すること。
