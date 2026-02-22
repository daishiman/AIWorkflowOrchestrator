# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 12                                  |
| 機能名 | TASK-FIX-10-1-VITEST-ERROR-HANDLING |
| 作成日 | 2026-02-19                          |

## 目的

実装した内容（`dangerouslyIgnoreUnhandledErrors` 削除とテスト修正）をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 事前チェック【必須】

Phase 12実行前に、以下の既知の落とし穴を確認し、漏れを防止する:

1. `.claude/rules/06-known-pitfalls.md` の Phase 12 関連項目を読む
   - P1: LOGS.md 2ファイル更新漏れ
   - P2: topic-map.md 再生成忘れ
   - P3: 未タスク管理の3ステップ不完全
   - P4: documentation-changelog への早期「完了」記載
   - P25: LOGS.md 2ファイル更新漏れ（再発）
   - P26: システム仕様書更新遅延
   - P27: topic-map.md 再生成トリガーの判断ミス
   - P28: スキルフィードバックレポート未作成
   - P29: SKILL.md 変更履歴の更新漏れ

## 実行タスク

- 技術ドキュメント作成: 実装ガイドの作成（Part 1: 概念説明 + Part 2: 技術詳細）
- システムドキュメント更新: aiworkflow-requirements等の仕様書更新
- ドキュメント更新履歴作成: documentation-changelog.md + artifacts.json更新
- 未タスク検出: 残課題の検出と記録（0件でも出力必須）
- スキルフィードバックレポート作成: ワークフロー改善点と技術的教訓の記録（改善点なしでも作成必須）

## 参照資料

| 資料名                 | パス                                                                                | 説明                |
| ---------------------- | ----------------------------------------------------------------------------------- | ------------------- |
| Phase 10 結果          | `outputs/phase-10/final-review-result.md`                                           | 最終レビュー判定    |
| Phase 11 結果          | `outputs/phase-11/manual-test-result.md`                                            | 手動テスト結果      |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                                                | Phase 12関連Pitfall |
| 仕様書更新ワークフロー | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`      | 更新手順            |
| 実装ガイドテンプレート | `.claude/skills/task-specification-creator/assets/implementation-guide-template.md` | ガイド形式          |

## サブフェーズ

### Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                                       |
| ------ | ---------------- | ---------------------------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）                         |
| Part 2 | 開発者・技術者   | 技術的な詳細（設定変更・修正パターン・ベストプラクティス） |

#### Part 1: 概念的説明

以下の内容を含めること:

- **日常の例え**: 「テストの安全ネット」の比喩を使用
  - `dangerouslyIgnoreUnhandledErrors: true` は「安全ネットに穴を開けた状態」
  - 削除することで「安全ネットが完全に機能する状態」に戻る
- **なぜ未処理Promise拒否を検出する必要があるか**: エラーが静かに無視されると、本番環境で予期しないクラッシュが発生するリスク
- **この変更で何が改善されるか**: テスト実行時に非同期エラーが即座に検出され、コード品質が向上する

#### Part 2: 技術的詳細

以下の内容を含めること:

- **vitest.config.tsの変更内容**: 削除した設定行と変更理由
- **修正したテストのパターン一覧**: 各テストファイルで適用した修正パターンのテーブル
- **非同期エラーハンドリングのベストプラクティス**:
  - `async/await` での適切なエラーキャッチ
  - `vi.fn()` モックの `mockRejectedValue` 使用時の注意
  - テスト内での `expect(...).rejects.toThrow()` パターン
  - `beforeEach` / `afterEach` でのクリーンアップ

**成果物**: `outputs/phase-12/implementation-guide.md`

### Task 2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `.claude/skills/task-specification-creator/references/spec-update-workflow.md` を参照

**2ステップで実行**（両方必須確認）:

#### Step 1: タスク完了記録【必須・全タスク】

##### Step 1-A: 仕様書完了記録

- [ ] 該当する仕様書に「完了タスク」セクションを追加

```markdown
## 完了タスク

### タスク: dangerouslyIgnoreUnhandledErrors設定の解消（2026-02-19完了）

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| タスクID   | TASK-FIX-10-1-VITEST-ERROR-HANDLING |
| ステータス | **完了**                            |
| テスト数   | N（自動）+ 5（手動）                |

> **注意**: テスト数は `pnpm test` 実行結果の実測値のみを記載すること。推定値・概算値は使用不可。
```

- [ ] `aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加
- [ ] `task-specification-creator/LOGS.md` にタスク完了記録を追加（**2ファイル両方必須** -- P1, P25）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴テーブルを更新
- [ ] `task-specification-creator/SKILL.md` 変更履歴テーブルを更新

##### Step 1-B: 実装状況テーブル更新

本タスクでは、実装完了後に管理タスク一覧のステータス整合を行う。

- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-090-tasks-index-legacy.md` の Tier 0 テーブルに `TASK-FIX-10-1` を completed として反映
- `docs/30-workflows/skill-import-agent-system/tasks/completed-task/07-task-fix-10-1-vitest-error-handling.md` のステータスを `完了` に更新

##### Step 1-C: 関連タスクテーブル更新

```bash
grep -rn "TASK-FIX-10-1" .claude/skills/*/references/
```

検索結果に該当する仕様書があれば、タスクステータスを「完了」に更新する。

##### Step 1-D: topic-map.md 再生成（**仕様書に変更があれば必ず実行** -- P2, P27）

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

- [ ] 再生成されたtopic-map.mdに新規セクションの行番号が正しく反映されていることを確認

#### Step 2: システム仕様更新【条件付き】

| 判断基準                    | 本タスクの該当 |
| --------------------------- | -------------- |
| 新規インターフェース/型追加 | なし           |
| 既存インターフェース変更    | なし           |
| 新規定数/設定値追加         | なし           |
| テスト戦略・運用ルール変更  | あり           |

**判定: 更新実施**

理由: `dangerouslyIgnoreUnhandledErrors` 削除により「未処理Promise拒否を検知する」テスト品質ルールが変わるため、品質仕様に反映が必要。

更新対象:

- `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`（苦戦箇所と再利用手順の記録）

### Task 3: ドキュメント更新履歴 & artifacts.json更新【必須】

#### 3-A: documentation-changelog.md 作成

```bash
# スクリプトが存在する場合
node scripts/generate-documentation-changelog.js --workflow docs/30-workflows/TASK-FIX-10-1-VITEST-ERROR-HANDLING

# スクリプトが存在しない場合（手動作成）
# outputs/phase-12/documentation-changelog.md を手動で作成
```

**記載内容**:

- 更新した全仕様書の変更内容
- 各Stepの完了結果を詳細に記録（漏れの可視化）
- **全Step確認前に「完了」と記載しない** -- P4

#### 3-B: artifacts.json 更新

```bash
# スクリプトが存在する場合
node scripts/complete-phase.js \
  --workflow docs/30-workflows/TASK-FIX-10-1-VITEST-ERROR-HANDLING \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート,outputs/phase-12/skill-feedback-report.md:スキルフィードバックレポート"

# スクリプトが存在しない場合
# 手動でartifacts.jsonを更新（参照: docs/30-workflows/completed-tasks/TASK-4-1-ipc-channels/outputs/artifacts.json）
```

**artifacts.json必須項目**:

- Phase 12のステータスが`completed`に更新されていること
- 全Phase（1-12）の成果物パスが登録されていること
- `qualityMetrics`セクションに品質指標が記録されていること

**成果物**: `outputs/phase-12/documentation-changelog.md`

### Task 4: 未タスク検出【必須】

| #   | ソース                 | 確認項目                      |
| --- | ---------------------- | ----------------------------- |
| 1   | Phase 10レビュー結果   | MINOR判定の指摘事項           |
| 2   | Phase 11手動テスト結果 | スコープ外の発見事項          |
| 3   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 |
| 4   | コードベース           | TODO/FIXME/HACK/XXXコメント   |

検出した未タスクがある場合は、**3ステップ全てを完了する**（P3）:

1. `docs/30-workflows/unassigned-task/` に指示書を作成
2. `task-workflow.md` の残課題テーブルに登録
3. 関連仕様書に参照リンクを追加

**0件の場合も**、`outputs/phase-12/unassigned-task-detection.md` に「検出件数: 0件」と記録する。

**成果物**: `outputs/phase-12/unassigned-task-detection.md`

### Task 5: スキルフィードバックレポート作成【必須】

ワークフロー改善点と技術的教訓を記録する。**改善点がなくても「改善点なし」としてレポートを作成する（省略不可 -- P28）。**

| セクション         | 記載内容                                                        |
| ------------------ | --------------------------------------------------------------- |
| ワークフロー改善点 | Phase実行中に発見したワークフロー上の改善提案                   |
| 技術的教訓         | `dangerouslyIgnoreUnhandledErrors` 削除に伴う実装中の技術的知見 |
| スキル改善提案     | task-specification-creator/skill-creatorへの改善提案            |
| 新規Pitfall候補    | 06-known-pitfalls.mdに追加すべき新規Pitfall                     |

**成果物**: `outputs/phase-12/skill-feedback-report.md`

## アーキテクチャ層別ドキュメント

本タスクはVitest設定変更とテスト修正のみであり、Electronアーキテクチャ層（Renderer/Main/IPC/Preload/データ層）への変更はないため、層別ドキュメントの作成は不要。

実装ガイドPart 2では以下の観点のみドキュメント化する:

| 層                 | 適用 | 理由                                         |
| ------------------ | ---- | -------------------------------------------- |
| エラーハンドリング | ✅   | 非同期エラーハンドリングのベストプラクティス |
| テスト設計         | ✅   | テスト修正パターンの記録                     |
| Renderer Process   | -    | 変更なし                                     |
| Main Process       | -    | 変更なし                                     |
| IPC通信            | -    | 変更なし                                     |
| Preload            | -    | 変更なし                                     |
| データ層           | -    | 変更なし                                     |

## 成果物

| 成果物                       | パス                                            | 必須 | 説明                       |
| ---------------------------- | ----------------------------------------------- | ---- | -------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`      | ✅   | 概念的+技術的ドキュメント  |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`   | ✅   | 更新履歴                   |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md` | ✅   | 検出結果（0件でも出力）    |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`     | ✅   | 改善点（なしでも出力必須） |
| 未完了タスク指示書           | `docs/30-workflows/unassigned-task/*.md`        | 条件 | 検出時のみ作成             |

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] **【Task 2 Step 1-A】該当仕様書に「完了タスク」セクションを追加した**
- [ ] **【Task 2 Step 1-A】aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加した**
- [ ] **【Task 2 Step 1-A】task-specification-creator/LOGS.mdにタスク完了記録を追加した** ⚠️ P1, P25
- [ ] **【Task 2 Step 1-A】aiworkflow-requirements/SKILL.md変更履歴テーブルを更新した** ⚠️ P29
- [ ] **【Task 2 Step 1-A】task-specification-creator/SKILL.md変更履歴テーブルを更新した** ⚠️ P29
- [ ] **【Task 2 Step 1-C】関連タスクテーブルのステータスを「完了」に更新した（該当する場合）**
- [ ] **【Task 2 Step 1-D】topic-map.mdを再生成した** ⚠️ P2, P27
  - 再生成トリガー: セクション追加/削除/更新、行数変更
  - コマンド: `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`
- [ ] **【Task 2 Step 2】システム仕様更新の要否を判断し、documentation-changelog.mdに記録した**
- [ ] **【Task 3】documentation-changelog.mdが作成されている**
- [ ] **【Task 3】artifacts.jsonが更新されている**
- [ ] **【Task 3】artifacts.jsonの全完了Phase（1-12）のステータスがcompletedであること**
- [ ] **【Task 4】未タスク検出レポートが出力されている**（0件でも必須）
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] 未タスク指示書の物理ファイル存在を確認した（`ls docs/30-workflows/unassigned-task/` で検証、該当する場合）
- [ ] **【Task 5】スキルフィードバックレポートが出力されている**（改善点なしでも作成必須） ⚠️ P28
- [ ] **苦戦箇所セクションを記録した**（該当する場合）
- [ ] **本Phase内の全タスクを100%実行完了**

## 苦戦箇所の記録【推奨】

タスク実行中に苦戦した箇所があれば、以下に記録する:

```markdown
## 苦戦箇所

### 1. {{問題の概要}}

- **症状**: {{発生した問題の具体的な症状}}
- **原因**: {{問題の根本原因}}
- **解決策**: {{採用した解決策}}
- **学び**: {{将来のタスクへの教訓}}
- **関連Pitfall**: {{該当する場合はPitfall ID（例: P22）}}
```

## 漏れやすいポイント（06-known-pitfalls.md参照）

| ID  | ポイント                            | 対策                                                                |
| --- | ----------------------------------- | ------------------------------------------------------------------- |
| P1  | LOGS.md 2ファイル更新漏れ           | aiworkflow-requirements + task-specification-creator 両方を同時更新 |
| P2  | topic-map.md 再生成忘れ             | セクション変更時は必ず `generate-index.js` を実行                   |
| P27 | topic-map.md 再生成トリガー判断ミス | 追加だけでなく削除・更新も再生成トリガー                            |
| P29 | SKILL.md 変更履歴の更新漏れ         | LOGS.md とは別に SKILL.md の変更履歴テーブルも必ず更新              |
| P3  | 未タスク管理の3ステップ不完全       | ①指示書 → ②task-workflow.md登録 → ③関連仕様書リンク                 |
| P4  | documentation-changelog早期完了     | 全Step確認前に「完了」と記載しない                                  |
| P28 | スキルフィードバックレポート未作成  | 改善点がなくても「改善点なし」としてレポートを作成する              |

## フォールバック手順

スクリプトが存在しない場合の代替手順:

| スクリプト                            | 代替手順                                                                                                             |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `generate-documentation-changelog.js` | 手動でdocumentation-changelog.mdを作成（`outputs/phase-12/documentation-changelog.md`の形式に従う）                  |
| `complete-phase.js`                   | 手動でartifacts.jsonを作成（参照: `docs/30-workflows/completed-tasks/TASK-4-1-ipc-channels/outputs/artifacts.json`） |
| `detect-unassigned-tasks.js`          | 手動で各Phaseのレビュー結果・発見課題を確認し、unassigned-task-detection.mdを作成                                    |
| `validate-phase-output.js`            | 手動で成果物の存在と完了条件を確認                                                                                   |

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 事前チェック（06-known-pitfalls.md確認）
2. Task 1: 実装ガイド作成（Part 1 + Part 2）
3. Task 2 Step 1-A: 仕様書完了記録
4. Task 2 Step 1-C: 関連タスクテーブル更新
5. Task 2 Step 1-D: topic-map.md再生成
6. Task 2 Step 2: システム仕様更新要否判断
7. Task 3: documentation-changelog.md + artifacts.json更新
8. Task 4: 未タスク検出
9. Task 5: スキルフィードバックレポート作成
10. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-FIX-10-1-VITEST-ERROR-HANDLING --phase 12
```

## 次のPhase

Phase 13: PR作成
