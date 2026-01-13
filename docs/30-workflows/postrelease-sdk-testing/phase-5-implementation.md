# Phase 5: 実装（TDD: Green） - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 5                       |
| Phase名    | 実装                    |
| 前提Phase  | Phase 4                 |
| 後続Phase  | Phase 6                 |
| ステータス | 未実施                  |
| 作成日     | 2026-01-12              |
| 機能名     | postrelease-sdk-testing |

---

## 目的

テストを通すための実装を行う。具体的には、モック実装から実SDK呼び出しへの切り替えを行う。

## 背景

AGENT-005ではモック実装でテストを完了した。本Phaseでは、実際の`@anthropic-ai/claude-agent-sdk`をインストールし、モック実装を実SDK呼び出しに切り替えて、Phase 4で作成したテストをパスさせる。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: SDKインストール

**目的**: 実SDKをインストールし、型定義を確認する。

**実行手順**:

1. pnpmでSDKをインストール
   ```bash
   pnpm --filter @repo/desktop add @anthropic-ai/claude-agent-sdk
   ```
2. 型定義の確認
   ```bash
   pnpm --filter @repo/desktop typecheck
   ```
3. 既存の型定義との互換性確認
4. 必要に応じて型定義の調整

**期待される成果物**:

- SDKインストール完了
- 型チェックパス

---

### タスク2: モック実装から実SDK呼び出しへの切り替え

**目的**: AgentExecutor等の実装を実SDK呼び出しに切り替える。

**実行手順**:

1. `AgentExecutor.ts`のインポート変更確認
2. モック呼び出し箇所を実SDK呼び出しに置換
3. SDK初期化コードの追加（必要に応じて）
4. 認証フローの確認と調整

**対象ファイル**:

- `apps/desktop/src/main/services/agent/AgentExecutor.ts`
- `apps/desktop/src/main/services/agent/ExecutionManager.ts`
- `apps/desktop/src/main/ipc/agentHandlers.ts`

**期待される成果物**:

- 実SDK呼び出しへの切り替え完了

---

### タスク3: 認証フローの確認

**目的**: Claude Code認証が正しく動作することを確認する。

**実行手順**:

1. Claude Codeがローカルにインストールされていることを確認
2. 認証状態の確認
3. 認証トークンの取得フローを確認
4. 必要に応じてエラーハンドリングを追加

**期待される成果物**:

- 認証フロー動作確認

---

### タスク4: E2Eテスト実行・修正

**目的**: Phase 4で作成したE2Eテストをパスさせる。

**実行手順**:

1. E2Eテストを実行
   ```bash
   pnpm --filter @repo/desktop test:e2e -- --grep "agent-sdk"
   ```
2. 失敗するテストを分析
3. 実装を修正してテストをパスさせる
4. 全E2Eテストがグリーンになるまで繰り返し

**期待される成果物**:

- 全E2Eテストパス

---

### タスク5: パフォーマンステスト実行・確認

**目的**: パフォーマンステストを実行し、目標値を確認する。

**実行手順**:

1. パフォーマンステストを実行
2. 初回応答時間を確認（目標: 500ms以下）
3. メッセージ間遅延を確認（目標: 100ms以下）
4. セッション作成時間を確認（目標: 200ms以下）
5. 結果を記録

**期待される成果物**:

- パフォーマンステスト結果

---

## 参照資料

| 参照資料            | パス                                                                                 | 内容          |
| ------------------- | ------------------------------------------------------------------------------------ | ------------- |
| テスト仕様書        | `outputs/phase-4/test-specification.md`                                              | Phase 4成果物 |
| Agent SDK型定義     | `packages/shared/src/types/agent-execution.ts`                                       | 型定義        |
| AGENT-005実装ガイド | `docs/30-workflows/claude-code-integration/outputs/phase-12/implementation-guide.md` | 実装詳細      |

---

## 成果物

| 成果物             | パス                                        | 内容           |
| ------------------ | ------------------------------------------- | -------------- |
| 実装変更ログ       | `outputs/phase-5/implementation-changes.md` | 変更内容の記録 |
| テスト実行結果     | `outputs/phase-5/test-results.md`           | テスト結果     |
| パフォーマンス結果 | `outputs/phase-5/performance-results.md`    | 性能測定結果   |

---

## 統合テスト連携【必須】

モック→実SDK切り替え実装とテスト支援コード整備:

| 実装項目           | 内容                                   |
| ------------------ | -------------------------------------- |
| SDK初期化          | 認証フロー、初期設定                   |
| query呼び出し      | 実SDKのquery()メソッド呼び出し         |
| ストリーミング処理 | onMessageコールバックの接続            |
| エラーハンドリング | AgentError階層の処理                   |
| セッション管理     | createSession/destroySessionの動作確認 |

---

## 完了条件

- [ ] SDKがインストールされている
- [ ] 型チェックがパスしている
- [ ] モック実装から実SDK呼び出しに切り替わっている
- [ ] 認証フローが動作している
- [ ] すべてのE2Eテストが成功状態（Green）
- [ ] パフォーマンステストが実行されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test:e2e -- --grep "agent-sdk"

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. SDKインストール
2. 型チェック確認
3. モック→実SDK切り替え
4. 認証フロー確認
5. E2Eテスト実行・修正
6. パフォーマンステスト実行
7. 成果物の作成・配置
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/postrelease-sdk-testing --phase 5
```

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6 へ進む

---

## 次のPhase

Phase 6: テスト拡充
