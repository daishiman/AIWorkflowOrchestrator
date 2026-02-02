# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 12                       |
| Phase名    | ドキュメント更新         |
| 前提Phase  | Phase 11（手動テスト）   |
| 後続Phase  | Phase 13（PR作成）       |
| ステータス | 未実施                   |
| 作成日     | 2026-02-01               |
| 機能名     | TASK-8C-A: IPC統合テスト |

---

## 目的

TASK-8C-A の実装完了に伴い、実装ガイド・システム仕様書更新・ドキュメント更新記録・未タスク検出の4タスクを実施する。

---

## 実行タスク

> 以下の4タスクを**全て**実行してください。全て必須です。

### タスク1: 実装ガイド作成（2パート構成）

**目的**: IPC統合テストの実装内容を2パート構成で文書化する

**実行手順**:

#### Part 1: 概念説明（初学者・中学生レベル）

1. 以下の内容を日常生活の例え話を使って説明する：
   - **IPC通信とは**: 「学校の連絡帳のようなもの。生徒（Renderer）が先生（Main Process）にお願いを書いて渡すと、先生が処理して結果を書いて返してくれる」
   - **統合テストとは**: 「リレーの練習のようなもの。バトンパスが上手くいくか、チーム全体で通しで練習する」
   - **Mockとは**: 「練習試合で相手チームの代わりに味方が相手役をすること。本番と同じ動きをするけど、結果をコントロールできる」
   - **なぜIPCテストが必要か**: 「連絡帳が途中で失くなったり、間違った先生に届いたりしないように確認する仕組み」

2. 専門用語を使う場合は即座に説明を添える
3. 「なぜ必要か」→「何をするか」の順で説明する

#### Part 2: 技術的詳細（開発者・技術者レベル）

1. 以下の技術内容を記載する：

| セクション           | 内容                                                         |
| -------------------- | ------------------------------------------------------------ |
| テストアーキテクチャ | ipcMain.handle Map方式、SkillService Partial Mock            |
| インターフェース定義 | `OperationResult<T>` 型定義、SkillService メソッドシグネチャ |
| チャネル一覧         | テスト対象の全チャネルと対応ハンドラー                       |
| Mock設計             | Electron Mock、SkillService Mock、validateIpcSender Mock     |
| テストヘルパー       | ヘルパー関数一覧とシグネチャ                                 |
| エラーパターン       | OperationResult 正常系/異常系パターン                        |
| 設定パラメータ       | テストデータ定数一覧                                         |

2. コード例を含める（実際のテストコードから抜粋）
3. `outputs/phase-12/implementation-guide.md` に Part 1 + Part 2 を記録する

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`

---

### タスク2: システム仕様書更新（4サブステップ）

**目的**: タスク完了記録と必要に応じたシステム仕様書の更新を行う

#### Step 1-A: タスク完了記録（必須）

1. TASK-8C-A の完了記録を関連仕様書に追加する：
   - 「完了タスク」セクションに TASK-8C-A を追加
   - テスト結果サマリー（22テスト全PASS、カバレッジ数値）を記録
   - 関連ドキュメントリンク（Phase 1-13 成果物）を追加
   - 変更履歴エントリを追加

2. LOGS.md を**2ファイル**更新する：
   - `.claude/skills/aiworkflow-requirements/LOGS.md` に完了記録を追加
   - `.claude/skills/task-specification-creator/LOGS.md` に完了記録を追加

3. `topic-map.md` に新規セクション・エントリが必要な場合は追加する

#### Step 1-B: 実装状況テーブル更新（必須）

1. 以下の仕様書ファイルの実装状況テーブルを確認・更新する：

| 仕様書ファイル                  | 確認キーワード          | 更新内容         |
| ------------------------------- | ----------------------- | ---------------- |
| `interfaces-agent-sdk-skill.md` | skill, IPC, テスト      | テスト状況を更新 |
| `quality-requirements.md`       | テスト, カバレッジ      | テスト結果を更新 |
| `security-skill-ipc.md`         | IPC, セキュリティテスト | テスト状況を更新 |

2. 「未実装」→「テスト完了」等のステータスを更新する

#### Step 1-C: 関連タスクテーブル更新（必須）

1. 仕様書内の「関連タスク」「未タスク候補」テーブルで TASK-8C-A のステータスを更新する
2. `arch-ipc-persistence.md` 等の関連タスク表を確認する

#### Step 2: システム仕様更新（条件付き）

1. TASK-8C-A で新規インターフェースや型を追加した場合のみ実施する
2. IMP-002 で追加したチャネル（skill:settings:_, skill:permissions:_, skill:cache:\*）がある場合：
   - `interfaces-agent-sdk-skill.md` にチャネル定義を追加
   - `security-skill-ipc.md` にセキュリティ要件を追加
   - `api-endpoints.md` にエンドポイント定義を追加

3. 追加実装がない場合は「Step 2: 該当なし（新規インターフェース追加なし）」と記録する

**期待される成果物**:

- 各仕様書の更新（該当箇所のみ）

---

### タスク3: ドキュメント更新履歴作成

**目的**: Phase 12 で実施した全更新の履歴を記録する

**実行手順**:

1. 以下のフォーマットでドキュメント更新履歴を作成する：

```markdown
# ドキュメント更新履歴 - TASK-8C-A

## 更新日時

YYYY-MM-DDThh:mm:ssZ

## Step 1-A: タスク完了記録

- 更新ファイル: [ファイル名]
- 更新内容: [内容]

## Step 1-B: 実装状況テーブル更新

- 更新ファイル: [ファイル名]（該当なしの場合も記録）

## Step 1-C: 関連タスクテーブル更新

- 更新ファイル: [ファイル名]（該当なしの場合も記録）

## Step 2: システム仕様更新

- 更新ファイル: [ファイル名]（該当なしの場合も記録）
```

2. `outputs/phase-12/documentation-changelog.md` に記録する

3. artifacts.json を更新する（`complete-phase.js` を使用）：
   ```bash
   node scripts/complete-phase.js --workflow docs/30-workflows/skill-import-agent-system/tasks/TASK-8C-A --phase 12 --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:更新履歴,outputs/phase-12/unassigned-task-report.md:未タスク検出"
   ```
   スクリプトが存在しない場合は、artifacts.json を手動で更新する。

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`

---

### タスク4: 未タスク検出（0件でも出力必須）

**目的**: 残課題・改善提案を検出し、未タスク指示書を作成する

**実行手順**:

1. 以下のソースから未タスク候補を検出する：

| ソース                | 確認項目                                            |
| --------------------- | --------------------------------------------------- |
| 元タスク仕様書        | TASK-8C-A の「スコープ外」として明示された項目      |
| Phase 3 レビュー結果  | MINOR 判定の指摘事項                                |
| Phase 10 レビュー結果 | MINOR 判定の指摘事項                                |
| Phase 11 手動テスト   | スコープ外の発見事項・改善提案                      |
| コードコメント        | `skillIpc.integration.test.ts` 内の TODO/FIXME/HACK |

2. 未タスク検出スクリプトを実行する（存在する場合）：

   ```bash
   node scripts/detect-unassigned-tasks.js --scan apps/desktop/src/main/ipc/__tests__ --output .tmp/unassigned-candidates.json
   ```

3. 検出結果を `outputs/phase-12/unassigned-task-report.md` に記録する
4. **0件の場合も「未タスク候補: 0件」と明記する**

5. 1件以上の場合、各候補について以下を記録する：
   - タスクID（`task-{category}-{name}-{number}` 形式）
   - カテゴリ（req/imp/bug/ref/sec/perf）
   - 優先度（high/medium/low）
   - 概要（背景・問題・目的・スコープ）

**期待される成果物**:

- `outputs/phase-12/unassigned-task-report.md`

---

## 参照資料

| 参照資料               | パス                                                           | 内容                |
| ---------------------- | -------------------------------------------------------------- | ------------------- |
| 手動テスト結果         | `outputs/phase-11/manual-test-result.md`                       | Phase 11 結果       |
| Phase 3 レビュー結果   | `outputs/phase-03/design-review-result.md`                     | MINOR 指摘事項      |
| Phase 10 レビュー結果  | `outputs/phase-10/final-review-result.md`                      | MINOR 指摘事項      |
| Phase 12 ガイド        | `task-specification-creator: phase-11-12-guide.md`             | Phase 12 実行手順   |
| 仕様更新フロー         | `task-specification-creator: spec-update-workflow.md`          | Step 1/2 手順       |
| 未タスクガイドライン   | `task-specification-creator: unassigned-task-guidelines.md`    | 未タスク指示書形式  |
| 技術ドキュメントガイド | `task-specification-creator: technical-documentation-guide.md` | Part 1/2 記述ルール |
| Agent SDK スキル仕様   | `aiworkflow-requirements: interfaces-agent-sdk-skill.md`       | 仕様更新対象        |
| IPC セキュリティ       | `aiworkflow-requirements: security-skill-ipc.md`               | 仕様更新対象        |
| テスト品質要件         | `aiworkflow-requirements: quality-requirements.md`             | 仕様更新対象        |

---

## 成果物

| 成果物               | パス                                          | 内容            |
| -------------------- | --------------------------------------------- | --------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`    | Part 1 + Part 2 |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md` | 全更新の記録    |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`  | 0件でも出力必須 |

---

## 統合テスト連携

Phase 12 では統合テストの直接実施はないが、以下の統合観点を文書化する：

- テストコードの統合パターン（IPC登録→ハンドラー→Service）のドキュメント化
- 仕様書との整合性確認結果のドキュメント化

---

## 多角的チェック観点

| 観点         | 確認内容                                                                            |
| ------------ | ----------------------------------------------------------------------------------- |
| 完全性       | 4タスク全てが実施されているか                                                       |
| Part 1 品質  | 中学生レベルで理解可能か（専門用語なし、例え話あり）                                |
| Part 2 品質  | 技術者が実装を再現できる詳細さか                                                    |
| 仕様整合性   | システム仕様書が最新の実装を反映しているか                                          |
| 未タスク検出 | 全ソースから漏れなく検出されているか（0件でも出力）                                 |
| LOGS.md      | 2ファイル（aiworkflow-requirements + task-specification-creator）が更新されているか |

---

## 完了条件

- [ ] Task 1: 実装ガイド（Part 1: 中学生レベル + Part 2: 技術者レベル）が作成されている
- [ ] Task 2 Step 1-A: タスク完了記録が追加されている
- [ ] Task 2 Step 1-A: LOGS.md が2ファイル更新されている
- [ ] Task 2 Step 1-B: 実装状況テーブルが更新されている（または該当なし記録）
- [ ] Task 2 Step 1-C: 関連タスクテーブルが更新されている（または該当なし記録）
- [ ] Task 2 Step 2: システム仕様更新が実施されている（または該当なし記録）
- [ ] Task 3: ドキュメント更新履歴が全Step の結果を個別に記録している
- [ ] Task 4: 未タスク検出レポートが出力されている（0件でも必須）
- [ ] 全成果物が outputs/phase-12/ に配置されている

---

## よくある漏れパターン

| 漏れパターン                           | 防止方法                                                                 |
| -------------------------------------- | ------------------------------------------------------------------------ |
| Step 1-C（関連タスクテーブル）を未実行 | spec-update-workflow.md の「確認すべきファイル」表を必ず読む             |
| topic-map.md 未更新                    | 仕様書に新規セクション追加時は必ず topic-map.md のエントリも追加         |
| documentation-changelog.md が不完全    | 全Step（1-A/1-B/1-C/Step 2）の結果を個別に明記する（「該当なし」も記録） |
| LOGS.md が1ファイルのみ更新            | 必ず aiworkflow-requirements と task-specification-creator の両方        |
| 完了タスクセクションが簡略形式         | テスト結果サマリー + 成果物テーブルのテンプレートに従う                  |

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. タスク1: 実装ガイド作成（Part 1 + Part 2）
3. タスク2 Step 1-A: タスク完了記録
4. タスク2 Step 1-B: 実装状況テーブル更新
5. タスク2 Step 1-C: 関連タスクテーブル更新
6. タスク2 Step 2: システム仕様更新
7. タスク3: ドキュメント更新履歴作成
8. タスク4: 未タスク検出
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-13-pr-creation.md`
