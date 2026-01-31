# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目      | 内容                          |
| --------- | ----------------------------- |
| Phase     | 12                            |
| Phase名   | ドキュメント更新              |
| カテゴリ  | 文書化                        |
| 機能名    | skillexecutor-retry-mechanism |
| 作成日    | 2026-01-30                    |
| 前提Phase | Phase 11（手動テスト検証）    |
| 後続Phase | Phase 13（PR作成）            |

## 目的

実装内容のドキュメントを作成・更新し、未タスク検出レポートを作成する。Phase 12は4つの必須タスクで構成される。

---

## 実行タスク

### Task 1: 実装ガイド作成（2パート構成）

**目的**: リトライ機構の実装ガイドを初学者向けと技術者向けの2パートで作成する。

**手順**:

#### Part 1: 初学者・中学生レベルの概念説明

1. `outputs/phase-12/implementation-guide-part1.md`を作成する
2. 以下の構成で記述する:
   - **リトライって何？**: 日常の例え話で説明
     - 例: 「電話をかけて話し中だったら、少し待ってからもう一度かけ直すよね。それがリトライ」
     - 例: 「自動販売機にお金を入れてボタンを押したのに反応しなかったら、もう一度押すよね」
   - **なぜ自動リトライが必要？**: 手動リトライの面倒さ
     - 「インターネットが一瞬切れただけで、やっていた作業が全部やり直しになったら困るよね」
   - **待ち時間が長くなる仕組み（Exponential Backoff）**: 段階的に待つ理由
     - 例: 「レストランが混んでいたら、最初は5分待って、次は10分待って、さらに20分待つ。すぐに何度もドアを叩いたらお店の人が困るから」
   - **ちょっとランダムにする仕組み（Jitter）**: 同時リトライ回避の理由
     - 例: 「学校の授業が終わった時、みんなが同時にドアに向かったら混み合うよね。少しずつバラバラのタイミングで出ていけば混まない」
   - **やめどきを決める（最大回数）**: 無限リトライしない理由
     - 例: 「友達に電話して3回かけても出なかったら、今日は忙しいんだなってあきらめるよね」
3. 専門用語は使わないか、使う場合は即座に説明を加える
4. 「なぜ必要か」を先に説明してから「何をするか」を説明する

#### Part 2: 技術者向け詳細

1. `outputs/phase-12/implementation-guide-part2.md`を作成する
2. 以下の構成で記述する:
   - **アーキテクチャ**: リトライ機構の位置付け（SkillExecutor内部）
   - **型定義**: RetryConfig, RetryableErrorType, RetryableErrorResult, RetryMessageContent
   - **API**: isRetryableError(), calculateBackoffDelay(), executeWithRetry(), sleep()
   - **定数**: DEFAULT_RETRY_CONFIG, RETRYABLE_NETWORK_ERRORS
   - **使用例**: カスタムRetryConfigの設定方法
   - **エラーハンドリング**: リトライ対象/非対象エラーの一覧表
   - **ストリーミングイベント**: skill:retryイベントの形式と使用方法
   - **設定パラメータ一覧**: 全パラメータとデフォルト値

**期待される成果物**:

- 実装ガイドPart 1（`outputs/phase-12/implementation-guide-part1.md`）
- 実装ガイドPart 2（`outputs/phase-12/implementation-guide-part2.md`）

### Task 2: システム仕様書更新（2ステップ）

**目的**: システム仕様書を更新し、タスク完了を記録する。

**手順**:

#### Step 1: タスク完了記録（必須）

1. **Step 1-A**: `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`の「完了タスク」セクションにTASK-SKILL-RETRY-001を追加する
2. **Step 1-B**: 同ファイルの「実装状況」テーブルを更新する（リトライ機構: 完了）
3. **Step 1-C**: 関連タスクテーブルのステータスを更新する（該当する場合）

#### Step 2: システム仕様更新（条件付き）

以下の更新が必要かを判断する:

- **RetryConfig型**: 新規インターフェースのため更新が必要
- **RetryableErrorType型**: 新規型のため更新が必要
- **RetryMessageContent型**: 新規型のため更新が必要（SkillStreamMessage拡張）
- **isRetryableError()**: 新規public関数のため更新が必要
- **calculateBackoffDelay()**: 新規public関数のため更新が必要
- **DEFAULT_RETRY_CONFIG**: 新規定数のため更新が必要

更新が必要な場合:

1. `interfaces-agent-sdk-executor.md`にリトライ関連の型・API・定数セクションを追加する
2. `error-handling.md`のリトライ戦略セクションにSkillExecutor固有の情報を追加する

LOGS.md更新:

1. `.claude/skills/aiworkflow-requirements/LOGS.md`にタスク完了を記録する
2. `.claude/skills/task-specification-creator/LOGS.md`にタスク完了を記録する

**期待される成果物**:

- 更新されたシステム仕様書（該当ファイル）
- LOGS.md更新記録

### Task 3: ドキュメント更新履歴作成

**目的**: 本タスクで行ったドキュメント変更を記録する。

**手順**:

1. `outputs/phase-12/documentation-changelog.md`を作成する
2. 以下の情報を記録する:
   - 更新日時
   - 更新対象ファイル一覧
   - 各ファイルの変更内容サマリー
   - 変更理由
3. artifacts.jsonを更新する

```bash
# ドキュメント更新履歴の生成
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/skillexecutor-retry-mechanism \
  --phase 12
```

**期待される成果物**:

- ドキュメント更新履歴（`outputs/phase-12/documentation-changelog.md`）

### Task 4: 未タスク検出レポート作成（0件でも出力必須）

**目的**: 実装中に発見された残課題・改善提案を検出し記録する。0件の場合も出力必須。

**手順**:

1. 以下のソースから未タスクを検出する:
   | ソース | 確認項目 |
   | ------------------------ | ------------------------------------- |
   | 元タスク仕様書 | 「含まないもの」として明示された項目 |
   | Phase 3レビュー結果 | MINOR判定の指摘事項 |
   | Phase 10レビュー結果 | MINOR判定の指摘事項 |
   | Phase 11手動テスト | スコープ外の発見事項・改善提案 |
   | コードコメント | TODO/FIXME/HACK/XXX |
2. 検出対象の例:
   - リトライ設定のUI（元タスクの「含まないもの」）
   - リトライ履歴の永続化（元タスクの「含まないもの」）
   - Circuit Breakerパターンの導入（error-handling.mdの将来改善）
3. 未タスク検出スクリプトを実行する:
   ```bash
   node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
     --scan apps/desktop/src/main/services/skill \
     --output .tmp/unassigned-candidates.json
   ```
4. 検出結果を`outputs/phase-12/unassigned-task-detection.md`に記録する
5. 0件の場合も「検出タスク: 0件」として出力する

**期待される成果物**:

- 未タスク検出レポート（`outputs/phase-12/unassigned-task-detection.md`）

---

## 参照資料

| 参照資料                      | パス                                                                                 | 用途           |
| ----------------------------- | ------------------------------------------------------------------------------------ | -------------- |
| Phase 11手動テスト結果        | `docs/30-workflows/skillexecutor-retry-mechanism/outputs/phase-11/`                  | 発見事項参照   |
| Phase 3レビュー結果           | `docs/30-workflows/skillexecutor-retry-mechanism/outputs/phase-3/`                   | MINOR指摘参照  |
| Phase 10レビュー結果          | `docs/30-workflows/skillexecutor-retry-mechanism/outputs/phase-10/`                  | MINOR指摘参照  |
| 元タスク指示書                | `docs/30-workflows/unassigned-task/task-skillexecutor-retry-mechanism.md`            | スコープ外参照 |
| interfaces-agent-sdk-executor | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md` | 仕様更新対象   |
| error-handling                | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                | 仕様更新対象   |
| 仕様更新フロー                | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`       | 更新手順参照   |
| Phase 11/12ガイド             | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`          | 手順詳細       |
| 要件定義書                    | `outputs/phase-1/requirements-definition.md`                                         | Phase 1 成果物 |
| RetryConfig型設計書           | `outputs/phase-2/retry-config-design.md`                                             | Phase 2 成果物 |

---

## Electron固有観点

| 層           | ドキュメント化すべき内容                          |
| ------------ | ------------------------------------------------- |
| Main Process | リトライロジックの配置（SkillExecutor内部）       |
| IPC通信      | skill:retryストリーミングイベントの型と送受信方法 |
| Renderer     | useSkillExecution hookでのretryイベント受信方法   |

---

## 成果物

| 成果物               | パス                                             | 種別     |
| -------------------- | ------------------------------------------------ | -------- |
| 実装ガイドPart 1     | `outputs/phase-12/implementation-guide-part1.md` | document |
| 実装ガイドPart 2     | `outputs/phase-12/implementation-guide-part2.md` | document |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`    | document |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md`  | document |

---

## 完了条件

- [ ] 実装ガイドPart 1が中学生レベルで作成されている（日常の例え話を含む）
- [ ] 実装ガイドPart 2が技術者向けに型定義・API・使用例を含んでいる
- [ ] Step 1（タスク完了記録）が実行されている
- [ ] Step 2（システム仕様更新）が必要な場合に実行されている
- [ ] LOGS.mdが更新されている（aiworkflow-requirements + task-specification-creator）
- [ ] ドキュメント更新履歴が作成されている
- [ ] 未タスク検出レポートが作成されている（0件でも出力）
- [ ] 本Phase内の全タスク（Task 1-4）を100%実行完了

---

## Phase完了時必須アクション

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/skillexecutor-retry-mechanism \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide-part1.md:実装ガイドPart1,outputs/phase-12/implementation-guide-part2.md:実装ガイドPart2,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート"
```

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skillexecutor-retry-mechanism --phase 12
```

---

## Phase実行記録

| 項目              | 内容 |
| ----------------- | ---- |
| 実行タスク        |      |
| 発見事項          |      |
| 次Phaseへの引継ぎ |      |

---

## 次のPhase

→ [Phase 13: PR作成](./phase-13-pr-creation.md)
