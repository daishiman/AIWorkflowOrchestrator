# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 12                                 |
| Phase名    | ドキュメント更新                   |
| 対象機能   | UT-RT-06-ESBUILD-ARCH-MISMATCH-001 |
| 前Phase    | Phase 11: 手動テスト               |
| 次Phase    | Phase 13: PR作成                   |
| ステータス | 未実施                             |
| 作成日     | 2026-03-30                         |

---

## 目的

Phase 12 必須5タスクを全て実行し、実装ガイド・仕様更新・変更履歴・未タスク検出・スキルフィードバックを完成させる。
本タスクは docs-only（環境修正、コード変更なし）であるため、仕様書ステータスは `spec_created` を使用する。

---

## 実行タスク

- Task 12-1: 実装ガイド作成
- Task 12-2: システム仕様書更新
- Task 12-3: ドキュメント更新履歴作成
- Task 12-4: 未タスク検出レポート
- Task 12-5: スキルフィードバックレポート
- Task 12-6: Phase 12 準拠チェック

### Task 12-1: 実装ガイド作成【必須・2パート構成】

**2パート構成**の実装ガイドを `outputs/phase-12/implementation-guide.md` に作成する。

#### Part 1: 中学生レベル（概念的説明）

以下の要件を全て満たすこと:

| 要件               | 内容                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| Why（なぜ必要か）  | コンピューターには「言語」（architecture）があり、正しい言語のツールが必要                             |
| What（何をしたか） | x64 環境でツール（esbuild）を再インストールした                                                        |
| 日常の例え         | 英語の本を日本語しか読めない人に渡しても読めないのと同じ。arm64 のMacに x64 のツールを入れても動かない |
| 今回やったこと     | x64 環境に統一して esbuild バイナリを正しいアーキテクチャで再インストールした                          |

#### Part 2: 技術者レベル（技術的詳細）

以下の要件を全て満たすこと:

| 要件                                 | 内容                                                       |
| ------------------------------------ | ---------------------------------------------------------- |
| esbuild optionalDependencies 機構    | platform-specific バイナリの選択メカニズム解説             |
| process.arch / process.platform 判定 | Node.js ランタイムでのアーキテクチャ判定方法               |
| pnpm install 時のバイナリ選択        | pnpm が optionalDependencies をどう解決するか              |
| 環境診断コマンド一覧                 | `node -e "console.log(process.arch)"` 等の診断コマンド集   |
| 再発防止設定                         | Rosetta 2 経由 Node.js の検出・回避方法、`.nvmrc` 等の設定 |

---

### Task 12-2: システム仕様書更新【必須・4サブステップ】

> **重要**: 本タスクは spec_created（コード変更なし）のため、ステータスは `spec_created` を使用する。

#### Step 1-A: タスク完了記録 + LOGS.md x2 + SKILL.md x2 + topic-map + artifacts parity

| 対象                                    | アクション                               |
| --------------------------------------- | ---------------------------------------- |
| タスク完了記録                          | 該当仕様書にタスク完了セクションを追加   |
| aiworkflow-requirements/LOGS.md         | タスク完了エントリを追加                 |
| task-specification-creator/LOGS.md      | タスク完了記録を追加                     |
| aiworkflow-requirements/SKILL.md        | 変更履歴に完了内容を追記                 |
| task-specification-creator/SKILL.md     | 変更履歴に完了内容を追記                 |
| topic-map                               | esbuild arch mismatch 関連トピックを追記 |
| artifacts.json / outputs/artifacts.json | 内容を一致させて更新                     |

#### Step 1-B: 実装状況テーブル更新

| 項目       | 値                                 |
| ---------- | ---------------------------------- |
| タスクID   | UT-RT-06-ESBUILD-ARCH-MISMATCH-001 |
| ステータス | `spec_created`                     |
| 備考       | 環境修正タスク、コード変更なし     |

**補足**: root の `artifacts.json` と `outputs/artifacts.json` の内容を一致させること。

#### Step 1-C: 関連タスクテーブル更新

| 項目       | 値                                                               |
| ---------- | ---------------------------------------------------------------- |
| 関連タスク | TASK-RT-06（親タスク）                                           |
| 更新内容   | TASK-RT-06 のサブタスク状況にesbuildアーキテクチャ修正完了を反映 |

#### Step 2: インターフェース仕様更新

**N/A** - 本タスクは環境修正のみであり、新規インターフェースの追加はない。

---

### Task 12-3: ドキュメント更新履歴作成【必須】

`outputs/phase-12/documentation-changelog.md` に以下を記録する:

| 記録項目         | 内容                                                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 更新日時         | 2026-03-30                                                                                                             |
| 更新対象ファイル | Step 1-A〜1-C で更新した全ファイルの一覧（LOGS.md x2, SKILL.md x2, topic-map, artifacts.json, outputs/artifacts.json） |
| 更新内容サマリ   | 各ファイルへの変更内容の要約                                                                                           |
| Step 2 判定結果  | N/A（インターフェース変更なし）の旨を記録                                                                              |

---

### Task 12-4: 未タスク検出レポート【必須・0件でも出力】

`outputs/phase-12/unassigned-task-detection.md` に検出結果を出力する。

**検出ソース**:

| ソース                         | 確認項目                                           |
| ------------------------------ | -------------------------------------------------- |
| タスク仕様書「スコープ外」項目 | esbuild バージョンアップグレード、CI/CD 全面刷新   |
| 関連ファイルの TODO/FIXME      | esbuild-arch-mismatch-fix ディレクトリ内のコメント |
| Phase 3 レビュー結果           | MINOR 判定の指摘事項                               |
| Phase 10 レビュー結果          | MINOR 判定の指摘事項                               |
| Phase 11 手動テスト結果        | スコープ外の発見事項                               |

**出力形式**: 0件の場合でも「検出結果: 0件」と明記して出力すること。

---

### Task 12-5: スキルフィードバックレポート【必須・改善点なしでも出力】

`outputs/phase-12/skill-feedback-report.md` に以下の観点でフィードバックを記録する。

| 観点             | 確認内容                                     |
| ---------------- | -------------------------------------------- |
| テンプレート改善 | Phase仕様書テンプレートへの改善提案          |
| ワークフロー改善 | Phase 1〜13 の実行フローへの改善提案         |
| ドキュメント改善 | 成果物テンプレート・ガイドラインへの改善提案 |

**出力形式**: 改善点が0件の場合でも「改善提案: なし」と明記して出力すること。

---

### Task 12-6: Phase 12 準拠チェック

`outputs/phase-12/phase12-task-spec-compliance-check.md` に以下を記録する:

| チェック項目            | 確認内容                              |
| ----------------------- | ------------------------------------- |
| 必須成果物6点の存在確認 | 全ファイルが outputs/phase-12/ に存在 |
| 各成果物の内容充足確認  | 空ファイルや未記入がないこと          |
| validator 実行結果      | validate-phase-output.js の結果       |

---

## 参照資料

| 資料名                 | パス                                                                                   | 説明            |
| ---------------------- | -------------------------------------------------------------------------------------- | --------------- |
| 手動テスト結果         | `outputs/phase-11/manual-test-result.md`                                               | Phase 11 成果物 |
| 仕様更新フロー         | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`         | 更新手順ガイド  |
| 実装ガイドテンプレート | `.claude/skills/task-specification-creator/assets/implementation-guide-template.md`    | テンプレート    |
| Phase 12 ガイド        | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md` | 必須成果物基準  |

---

## 成果物

| 成果物                | パス                                                     | 必須 | 説明                           |
| --------------------- | -------------------------------------------------------- | ---- | ------------------------------ |
| 実装ガイド            | `outputs/phase-12/implementation-guide.md`               | ✅   | Part 1（概念）+ Part 2（技術） |
| 仕様更新サマリ        | `outputs/phase-12/system-spec-update-summary.md`         | ✅   | 仕様書更新の判定と結果         |
| ドキュメント変更履歴  | `outputs/phase-12/documentation-changelog.md`            | ✅   | 全更新ファイルの履歴           |
| 未タスク検出レポート  | `outputs/phase-12/unassigned-task-detection.md`          | ✅   | 0件でも出力必須                |
| スキルフィードバック  | `outputs/phase-12/skill-feedback-report.md`              | ✅   | 改善点なしでも出力必須         |
| Phase 12 準拠チェック | `outputs/phase-12/phase12-task-spec-compliance-check.md` | ✅   | 6成果物の存在・充足確認        |

---

## 完了条件

- [ ] Task 12-1: 実装ガイド（Part 1: 中学生レベル + Part 2: 技術者レベル）が作成済み
- [ ] Task 12-2 Step 1-A: タスク完了記録 + LOGS.md x2 + topic-map を更新済み
- [ ] Task 12-2 Step 1-A: SKILL.md x2 と artifacts parity を更新済み
- [ ] Task 12-2 Step 1-B: 実装状況テーブルを `spec_created` で更新済み
- [ ] Task 12-2 Step 1-C: 関連タスクテーブル（TASK-RT-06）を更新済み
- [ ] Task 12-2 Step 2: N/A（インターフェース変更なし）を記録済み
- [ ] Task 12-3: ドキュメント更新履歴が作成済み
- [ ] Task 12-4: 未タスク検出レポートが出力済み（0件でも必須）
- [ ] Task 12-5: スキルフィードバックレポートが出力済み（改善点なしでも必須）
- [ ] Task 12-6: Phase 12 準拠チェックが完了済み
- [ ] root `artifacts.json` と `outputs/artifacts.json` が一致している
- [ ] **本Phase内の全タスクを100%実行完了**

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. Task 12-1: 実装ガイド作成（Part 1 + Part 2）
3. Task 12-2: システム仕様書更新（Step 1-A〜1-C, Step 2）
4. Task 12-3: ドキュメント更新履歴作成
5. Task 12-4: 未タスク検出レポート
6. Task 12-5: スキルフィードバックレポート
7. Task 12-6: Phase 12 準拠チェック
8. 成果物の作成・配置
9. 完了条件の検証

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/esbuild-arch-mismatch-fix --phase 12
```

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
## Phase 12 実行記録

### 実行タスク

| タスク                                  | 結果            | 備考     |
| --------------------------------------- | --------------- | -------- |
| Task 12-1: 実装ガイド作成               | {{完了/未完了}} | {{備考}} |
| Task 12-2: システム仕様書更新           | {{完了/未完了}} | {{備考}} |
| Task 12-3: ドキュメント更新履歴作成     | {{完了/未完了}} | {{備考}} |
| Task 12-4: 未タスク検出レポート         | {{完了/未完了}} | {{備考}} |
| Task 12-5: スキルフィードバックレポート | {{完了/未完了}} | {{備考}} |
| Task 12-6: Phase 12 準拠チェック        | {{完了/未完了}} | {{備考}} |

### 発見事項

- 良かった点: {{GOOD_POINTS}}
- 問題点: {{ISSUES}}
- 改善提案: {{IMPROVEMENTS}}

### 次Phaseへの引き継ぎ事項

- {{HANDOVER_ITEMS}}
```

---

## 次のPhase

Phase 13: PR作成
