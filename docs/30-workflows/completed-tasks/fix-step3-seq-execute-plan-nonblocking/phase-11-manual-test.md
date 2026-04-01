# Phase 11: 手動テスト

## メタ情報

| 項目         | 内容                         |
| ------------ | ---------------------------- |
| Phase        | 11                           |
| タスクID     | TASK-FIX-EXECUTE-PLAN-FF-001 |
| ステータス   | 未実施                       |
| 担当         | 実装者                       |
| 見積もり時間 | 1h                           |

## 目的

Electron アプリ上でスキル生成の統合動作を確認し、`skill-creator:execute-plan` invoke が 100ms 以内に返ることを実環境で検証する。

## NON_VISUAL 宣言

**本 Phase は NON_VISUAL task である。**

理由: 本タスクは IPC ハンドラーと snapshot relay の contract 確認が主であり、スクリーンショットによる確認ではなく、DevTools コンソール・パフォーマンスタイムライン・ネットワークログによる確認を行う。

UI/UX の見た目変更がないため、Phase 11 のスクリーンショット取得は不要である。

## 実行タスク

1. Electron アプリのビルドと起動
2. シナリオ 1: execute-plan invoke が 100ms 以内に返ることを確認
3. シナリオ 2: スキル生成バックグラウンド実行中に `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` イベントが届くことを確認
4. シナリオ 3: エラー発生時に snapshot fallback が届くことを確認し、必要なら Main Process ログで補助確認する
5. 確認結果を `manual-test-result.md` に記録する

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                         | 内容                      |
| ------------------ | ---------------------------------------------------------------------------- | ------------------------- |
| セキュリティ仕様   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | Electron IPC セキュリティ |
| アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | システム全体像            |

## 実行手順

### ステップ 1: Electron アプリのビルドと起動

```bash
# desktop パッケージのビルド
pnpm --filter @repo/desktop build

# 開発モードで起動（DevTools 有効）
pnpm --filter @repo/desktop dev
```

### ステップ 2: シナリオ 1 — invoke が 100ms 以内に返ることを確認

**事前条件**: Electron アプリが起動し、DevTools が開いている状態

**確認手順**:

1. DevTools の Console タブを開く
2. スキル生成画面に移動する
3. スキル生成ボタンを押下する（または DevTools Console から `window.api.skillCreator.executePlan(...)` を呼び出す）
4. Console で `skill-creator:execute-plan` の invoke から response までの時間を確認する
5. DevTools の Performance タブで IPC 往復時間を計測する

**期待結果**:

| 確認項目                                                    | 期待値       | 実際の結果 |
| ----------------------------------------------------------- | ------------ | ---------- |
| invoke から `{ accepted: true, planId }` 受信までの時間     | 100ms 以内   | TBD        |
| タイムアウトエラーの発生                                    | 発生しない   | TBD        |
| Console に `IPC timeout: skill-creator:execute-plan` エラー | 表示されない | TBD        |

### ステップ 3: シナリオ 2 — バックグラウンド実行中に `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` が届くことを確認

**確認手順**:

1. スキル生成ボタンを押下し、`{ accepted: true, planId }` を受け取る
2. DevTools Console で `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` イベントが届くことを確認する
3. `planId` が invoke 時の planId と一致することを確認する
4. `currentPhase` / `awaitingUserInput` / `verifyResult` の snapshot が更新されることを確認する

**期待結果**:

| 確認項目                                              | 期待値                                                             | 実際の結果 |
| ----------------------------------------------------- | ------------------------------------------------------------------ | ---------- |
| `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` イベントの受信 | invoke 直後から届き始める                                          | TBD        |
| planId の一致                                         | invoke 時の planId と一致                                          | TBD        |
| snapshot 更新                                         | `currentPhase` / `awaitingUserInput` / `verifyResult` が更新される | TBD        |

### ステップ 4: シナリオ 3 — エラー発生時の snapshot fallback 確認

**確認手順**:

1. Agent SDK の接続を意図的に切断する（または無効な planId でテストする）
2. `skill-creator:execute-plan` を invoke する
3. `{ accepted: true, planId }` が返ることを確認する（タイムアウトエラーではないこと）
4. その後に `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` で error fallback を含む snapshot が届くこと、必要なら Main Process ログで `onWorkflowStateSnapshot(planId, null, errorMessage)` 相当の記録が残ることを確認する

**期待結果**:

| 確認項目            | 期待値                                                                | 実際の結果 |
| ------------------- | --------------------------------------------------------------------- | ---------- |
| invoke の戻り値     | `{ accepted: true, planId }`                                          | TBD        |
| エラー通知の方法    | snapshot の `currentPhase` 変化、必要なら Main Process ログで補助確認 | TBD        |
| invoke での例外発生 | 発生しない                                                            | TBD        |

### ステップ 5: 確認結果の記録

全シナリオの実際の結果を `outputs/phase-11/manual-test-result.md` に記録する:

- NON_VISUAL である理由
- 各シナリオの確認項目と実際の結果
- エビデンス（DevTools コンソールの出力テキスト）
- 未解決の問題（あれば）

## 多角的チェック観点

- シナリオ 1 で invoke が実際に 100ms 以内に返ることを数値で確認したか（主観ではなく計測値）
- シナリオ 2 で `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` イベントの `planId` が invoke 時の planId と一致しているか確認したか
- シナリオ 3 で Renderer 側のエラーハンドリングが snapshot の `currentPhase` 変化を受け取った際に適切なエラー状態に遷移するか確認したか

## 成果物

| 成果物         | パス                                     | 説明                                                |
| -------------- | ---------------------------------------- | --------------------------------------------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | NON_VISUAL 宣言、各シナリオの実際の結果、エビデンス |

## 完了条件

- [ ] シナリオ 1: `skill-creator:execute-plan` invoke が 100ms 以内に `{ accepted: true, planId }` を返すことが確認されている
- [ ] シナリオ 2: バックグラウンド実行中に `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` イベントが届くことが確認されている
- [ ] シナリオ 3: エラー発生時に snapshot の `currentPhase` 変化、必要なら Main Process ログ補助で通知されることが確認されている
- [ ] `manual-test-result.md` に NON_VISUAL 理由が明記されている
- [ ] 全シナリオの実際の結果が記録されている

## タスク100%実行確認【必須】

- [ ] 全実行タスクが完了している
- [ ] 全成果物が存在する（`outputs/phase-11/manual-test-result.md`）
- [ ] 全完了条件が満たされている

## 次Phase

Phase 12: ドキュメント更新 へ進む
