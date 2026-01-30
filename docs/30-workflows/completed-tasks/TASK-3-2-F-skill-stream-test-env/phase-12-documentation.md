# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 12                               |
| Phase名    | ドキュメント更新                 |
| カテゴリ   | 文書化                           |
| 前提Phase  | Phase 11                         |
| 後続Phase  | Phase 13                         |
| ステータス | 未実施                           |
| 作成日     | 2026-01-30                       |
| 機能名     | TASK-3-2-F-skill-stream-test-env |
| タスクID   | TASK-3-2-F                       |
| Issue      | #559                             |

---

## 目的

テスト環境改善の実装内容をドキュメント化し、システム仕様書を更新し、未完了タスクを検出する。

## 背景

Phase 5-11で実施したテスト環境改善（DOM環境切り替え、Clipboard APIモック、テスト有効化）について、実装ガイドの作成、システム仕様書の更新、ドキュメント更新履歴の記録、未タスク検出を行う。

---

## 実行タスク

> 以下の4タスクは全て必須です。順番に実行してください。

### タスク1: 実装ガイド作成（2パート構成）

**目的**: テスト環境改善の内容を2パート構成で文書化する。

**実行手順**:

#### Part 1: 概念説明（中学生レベル）

1. 以下の内容を**専門用語を使わず**、日常の例え話を含めて説明する
   - **テスト環境とは何か**: 「テスト環境は、ゲームの練習モードのようなもの。本番で失敗しないように、安全な場所で試すための仕組みです」
   - **なぜテスト環境を改善する必要があったか**: 「練習モードが壊れていて、一部の練習ができなかった。練習できない部分があると、本番で思わぬ失敗をする危険がある」
   - **何を変えたか**: 「練習モードの道具（DOM環境）を新しいものに交換して、全ての練習ができるようにした」
   - **改善の結果**: 「以前はスキップしていた5つの練習項目が全てできるようになった」

#### Part 2: 技術詳細（開発者レベル）

2. 以下の技術的内容を記載する
   - **変更概要**: happy-dom → jsdom切り替え（またはモック強化）の詳細
   - **変更ファイル一覧**: vitest.config.ts、setup.ts、テストファイル群
   - **Clipboard APIモック実装**:
     ```typescript
     // 実装の型定義と使用例を記載
     ```
   - **設定変更の詳細**: vitest.config.tsの変更前後の差分
   - **エラーハンドリング**: テスト環境で発生し得るエラーとその対処法
   - **パフォーマンス影響**: テスト実行時間の変化
   - **ロールバック手順**: 問題発生時の環境復元方法

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`（実装ガイド: Part 1 + Part 2）

---

### タスク2: システム仕様書更新（2ステップ）

**目的**: タスク完了記録とシステム仕様の更新を行う。

**実行手順**:

#### Step 1: タスク完了記録（必須）

1. **Step 1-A**: aiworkflow-requirements仕様書に「完了タスク」セクションを追加する
   - 対象ファイル: `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`（テスト戦略セクション）
   - 追加内容: TASK-3-2-F完了記録（実施日、変更概要、実装ガイドへのリンク）
2. **Step 1-B**: 実装状況テーブルの更新
   - 対象ファイル: `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-skill-stream.md`
   - 更新内容: TASK-3-2-Fのステータスを「完了」に変更
3. **LOGS.md更新**: 以下の2ファイルのLOGS.mdにエントリを追加する
   - `.claude/skills/aiworkflow-requirements/LOGS.md`
   - `.claude/skills/task-specification-creator/LOGS.md`
4. **topic-map.md更新**: 新規セクションがある場合、topic-map.mdにエントリを追加する
   - 対象ファイル: `.claude/skills/aiworkflow-requirements/references/topic-map.md`
   - テスト環境関連の新規セクションが追加された場合のみ実施

#### Step 2: システム仕様更新（条件付き）

4. 以下の判断基準で更新の必要性を判定する

| 判断項目                 | TASK-3-2-Fの場合         |
| ------------------------ | ------------------------ |
| 新規インターフェース追加 | なし（テスト環境のみ）   |
| 既存インターフェース変更 | なし                     |
| 新規定数/設定値追加      | vitest.config.ts変更あり |
| API仕様変更              | なし                     |

5. **判定結果**: テスト環境設定の変更はシステム仕様書の更新対象外（内部テスト実装の詳細変更のみ）。ただし、テスト関連の仕様記載がある場合は該当箇所を更新する。

**期待される成果物**:

- 更新されたシステム仕様書ファイル（該当する場合）
- LOGS.md更新（2ファイル）

---

### タスク3: ドキュメント更新履歴作成

**目的**: ドキュメント変更履歴を生成する。

**実行手順**:

1. artifacts.jsonを更新する（Phase完了状態を反映）

   ```bash
   node scripts/complete-phase.js --workflow docs/30-workflows/TASK-3-2-F-skill-stream-test-env --phase 12 --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート"
   ```

   - スクリプトが失敗する場合は、手動でartifacts.jsonを更新する
   - **artifacts.json必須項目**:
     - Phase 12のステータスが`completed`に更新されていること
     - 全Phase（1-12）の成果物パスが登録されていること
     - `qualityMetrics`セクションに品質指標（テスト数、カバレッジ、実行時間）が記録されていること

2. ドキュメント更新履歴を生成する

   ```bash
   node scripts/generate-documentation-changelog.js --workflow docs/30-workflows/TASK-3-2-F-skill-stream-test-env
   ```

   - スクリプトが失敗する場合は、手動で以下の形式でドキュメント更新履歴を作成する

```markdown
# ドキュメント更新履歴 - TASK-3-2-F

| 更新日   | 対象ファイル     | 変更内容                | 変更理由                |
| -------- | ---------------- | ----------------------- | ----------------------- |
| {{日付}} | vitest.config.ts | テスト環境設定変更      | happy-dom→jsdom切り替え |
| {{日付}} | setup.ts         | Clipboard APIモック追加 | テストスキップ解消      |
| ...      | ...              | ...                     | ...                     |
```

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`（ドキュメント更新履歴）

---

### タスク4: 未タスク検出レポート作成（0件でも出力必須）

**目的**: 本タスク実行中に発見された未完了タスク・改善提案を検出し、文書化する。

**実行手順**:

1. 以下のソースから未完了タスクを検出する

| ソース                   | 確認項目                                                                                |
| ------------------------ | --------------------------------------------------------------------------------------- |
| 元タスク仕様書           | 「スコープ外」項目（E2Eテスト導入、新規テストケース追加、テスト対象コンポーネント変更） |
| Phase 3設計レビュー結果  | MINOR判定の指摘事項                                                                     |
| Phase 10最終レビュー結果 | MINOR判定の指摘事項                                                                     |
| Phase 11手動テスト       | スコープ外の発見事項・改善提案                                                          |
| コードコメント           | TODO/FIXME/HACK/XXX                                                                     |

2. 未タスク検出スクリプトを実行する
   ```bash
   node scripts/detect-unassigned-tasks.js --scan apps/desktop/src/renderer/components/AgentView --output .tmp/unassigned-candidates.json
   ```
3. 検出結果をレポートにまとめる

```markdown
# 未タスク検出レポート - TASK-3-2-F

## 検出結果サマリー

| 検出数 | 緊急度高 | 緊急度中 | 緊急度低 |
| ------ | -------- | -------- | -------- |
| N件    | N件      | N件      | N件      |

## 検出された未タスク

### 未タスク1: {{タスク名}}（0件の場合は「検出なし」と記載）

- **ソース**: {{検出元}}
- **内容**: {{詳細}}
- **推奨対応**: {{対応方針}}
```

4. **0件の場合でも**レポートを出力する（「検出なし」と記載）

**期待される成果物**:

- `outputs/phase-12/unassigned-task-detection.md`（未タスク検出レポート）

---

## 参照資料

| 参照資料               | パス                                                                                    | 内容                   |
| ---------------------- | --------------------------------------------------------------------------------------- | ---------------------- |
| Phase 11成果物         | `outputs/phase-11/manual-test-report.md`                                                | 手動テストレポート     |
| Phase 10成果物         | `outputs/phase-10/final-review-result.md`                                               | 最終レビュー結果       |
| Phase 3成果物          | `outputs/phase-3/design-review-result.md`                                               | 設計レビュー結果       |
| 元タスク仕様書         | `docs/30-workflows/unassigned-task/task-skill-stream-test-environment-improvements.md`  | スコープ定義           |
| SkillStream仕様        | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-skill-stream.md`       | SkillStream仕様        |
| 品質要件               | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`             | テスト戦略             |
| Phase 12ガイド         | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`             | Phase 12実行ガイド     |
| 仕様更新フロー         | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | 仕様更新手順           |
| 技術ドキュメントガイド | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md` | ドキュメント作成ガイド |
| 未タスクガイドライン   | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`    | 未タスク作成基準       |

---

## フォールバック手順

スクリプトが存在しない場合の代替手順:

| スクリプト                            | 代替手順                                                                                                     |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `generate-documentation-changelog.js` | 手動で`outputs/phase-12/documentation-changelog.md`を上記テンプレート形式で作成                              |
| `complete-phase.js`                   | 手動でartifacts.jsonを更新（参照: `docs/30-workflows/completed-tasks/`配下の既存タスクのartifacts.json形式） |
| `detect-unassigned-tasks.js`          | 手動で各Phaseのレビュー結果・発見課題を確認し、`outputs/phase-12/unassigned-task-detection.md`を作成         |
| `validate-phase-output.js`            | 手動で成果物の存在と完了条件を確認                                                                           |

---

## 成果物

| 成果物               | パス                                            | 内容                           |
| -------------------- | ----------------------------------------------- | ------------------------------ |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | Part 1（概念）+ Part 2（技術） |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | 変更履歴一覧                   |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | 未完了タスク一覧（0件含む）    |

---

## 完了条件

- [ ] 実装ガイドが2パート構成（Part 1: 中学生レベル概念、Part 2: 技術詳細）で作成されている
- [ ] Part 1に日常の例え話が含まれており、専門用語が使われていない（使用時は即座に説明あり）
- [ ] Part 2にTypeScriptの型定義/インターフェース、コード例、エラーハンドリングが含まれている
- [ ] 【Step 1-A】タスク完了記録がシステム仕様書に追加されている
- [ ] 【Step 1-B】関連ドキュメントセクションに実装ガイドリンクが追加されている
- [ ] 【Step 1】LOGS.mdが2ファイル更新されている（aiworkflow-requirements, task-specification-creator）
- [ ] 【Step 1】topic-map.mdに新規セクションエントリが追加されている（該当する場合）
- [ ] 【Step 2】システム仕様更新の要否を判断し、documentation-changelog.mdに記録されている
- [ ] ドキュメント更新履歴が生成されている
- [ ] 未タスク検出レポートが生成されている（0件でも出力）
- [ ] artifacts.jsonが更新されている（qualityMetrics含む）
- [ ] 成果物が`outputs/phase-12/`配下に3ファイル生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（4タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 11（手動テスト検証）が完了していること
- **後続**: Phase 13（PR作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-3-2-F-skill-stream-test-env/phase-13-pr-creation.md`
