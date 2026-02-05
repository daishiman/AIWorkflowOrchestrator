# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 12                                       |
| 機能名 | ENV-INFRA-001-better-sqlite3-version-fix |
| 作成日 | 2026-02-04                               |

---

## 目的

実装した内容をドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

---

## 実行タスク

### Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                   |
| ------ | ---------------- | -------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）     |
| Part 2 | 開発者・技術者   | 技術的な詳細（設定・コマンド・使用例） |

**Part 1（中学生レベル）の必須要件**:

- 日常生活での例え話を必ず含める
- 「なぜNode.jsバージョン管理が必要か」を先に説明
- ネイティブモジュールの概念を分かりやすく説明

**Part 2（技術者レベル）の必須要件**:

- .nvmrc、package.json enginesの設定例
- バージョンチェックスクリプトの仕様
- トラブルシューティング手順

### Task 2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

**2ステップで実行**:

#### Step 1: タスク完了記録【必須】

- [ ] 該当する仕様書（technology-devops.md）に「完了タスク」セクションを追加
- [ ] 変更履歴セクションにバージョンを追記
- [ ] aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加
- [ ] task-specification-creator/LOGS.mdにタスク完了記録を追加

#### Step 2: システム仕様更新【条件付き】

**更新判断**:

| 更新必要                      | 更新不要                   |
| ----------------------------- | -------------------------- |
| 新規Node.jsバージョン要件追加 | 内部実装の変更のみ         |
| engines設定パターン追加       | リファクタリング（IF不変） |

**更新対象ファイル（該当する場合）**:

- `.claude/skills/aiworkflow-requirements/references/technology-devops.md`
- `.claude/skills/aiworkflow-requirements/references/deployment.md`

### Task 3: CONTRIBUTING.md更新【必須】

**追加内容**:

| セクション                   | 内容                                |
| ---------------------------- | ----------------------------------- |
| 必須要件                     | Node.jsバージョン要件               |
| Node.jsバージョン設定        | nvm使用方法、手動確認方法           |
| ネイティブモジュール再ビルド | pnpm rebuild使用方法                |
| トラブルシューティング       | NODE_MODULE_VERSION不一致の解決手順 |

### Task 4: 未タスク検出【必須】

| ソース                 | 確認項目                    |
| ---------------------- | --------------------------- |
| Phase 3レビュー結果    | MINOR判定の指摘事項         |
| Phase 10レビュー結果   | MINOR判定の指摘事項         |
| Phase 11手動テスト結果 | スコープ外の発見事項        |
| コードベース           | TODO/FIXME/HACK/XXXコメント |

---

## 参照資料

| 資料名                 | パス                                                                                | 説明           |
| ---------------------- | ----------------------------------------------------------------------------------- | -------------- |
| 手動テスト結果         | `outputs/phase-11/manual-test-result.md`                                            | Phase 11成果物 |
| 仕様更新フロー         | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`      | 更新手順ガイド |
| 実装ガイドテンプレート | `.claude/skills/task-specification-creator/assets/implementation-guide-template.md` | テンプレート   |

---

## 成果物

| 成果物               | パス                                            | 必須 | 説明                      |
| -------------------- | ----------------------------------------------- | ---- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | ✅   | 概念的+技術的ドキュメント |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | ✅   | 更新履歴                  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | ✅   | 検出結果（なしでも出力）  |
| CONTRIBUTING.md更新  | プロジェクトルート/CONTRIBUTING.md              | ✅   | 開発者向けドキュメント    |

---

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] **【Task 2 Step 1】システム仕様書に「完了タスク」セクションを追加した**
- [ ] **【Task 2 Step 1】aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加した**
- [ ] **【Task 2 Step 1】task-specification-creator/LOGS.mdにタスク完了記録を追加した**
- [ ] **【Task 2 Step 2】システム仕様更新の要否を判断し、documentation-changelog.mdに記録した**
- [ ] CONTRIBUTING.mdが更新されている
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] **本Phase内の全タスクを100%実行完了**

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 成果物の作成・配置
4. 完了条件の検証

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ENV-INFRA-001-better-sqlite3-version-fix --phase 12
```

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
## Phase 12 実行記録

### 実行タスク

| タスク                           | 結果            | 備考     |
| -------------------------------- | --------------- | -------- |
| Task 1: 実装ガイド作成           | {{完了/未完了}} | {{備考}} |
| Task 2: システムドキュメント更新 | {{完了/未完了}} | {{備考}} |
| Task 3: CONTRIBUTING.md更新      | {{完了/未完了}} | {{備考}} |
| Task 4: 未タスク検出             | {{完了/未完了}} | {{備考}} |

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
