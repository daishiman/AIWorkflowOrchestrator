# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 12                       |
| Phase名    | ドキュメント更新         |
| 前提Phase  | Phase 11                 |
| 後続Phase  | Phase 13                 |
| ステータス | 未実施                   |
| 作成日     | 2026-02-02               |
| 機能名     | TASK-8C-D-e2e-permission |

---

## 目的

E2Eテスト実装に関するドキュメントを作成・更新し、システム仕様書への反映と未タスク検出を行う。

## 背景

Phase 12 は4つの必須タスクで構成される。テストの実装ガイド作成、システム仕様更新、変更履歴作成、未タスク検出を行う。

---

## 実行タスク【4タスク全て必須】

> 以下の4タスクを順番に実行してください。全て完了必須です。

### タスク1: 実装ガイド作成（2パート構成）

**目的**: E2Eテストの実装ガイドを作成する

**実行手順**:

1. **Part 1: 初学者・中学生レベル向け**（日常の例え話を必ず含める）

   #### なぜ権限ダイアログのE2Eテストが必要なのか

   **例え話**:
   「お店でお金を使うとき、店員さんに『本当に買いますか？』と確認されることがありますよね。これは間違いを防ぐためです。パソコンのアプリも同じで、重要な操作をする前に『本当に実行していいですか？』と確認するのが権限ダイアログです。E2Eテストは、この確認画面が正しく動くかを自動でチェックするテストです。」

   #### 何をテストするのか
   - 確認画面（ダイアログ）がちゃんと表示されるか
   - 「OK」や「キャンセル」ボタンが正しく動くか
   - 次回から確認を省略する機能が動くか

2. **Part 2: 開発者・技術者向け**

   #### テストアーキテクチャ

   | レイヤー       | 技術            | 説明                       |
   | -------------- | --------------- | -------------------------- |
   | テストランナー | Vitest          | テスト実行・アサーション   |
   | ブラウザ操作   | Playwright      | Electron操作・DOM操作      |
   | フィクスチャ   | E2Eフィクスチャ | `__fixtures__/skills/`配下 |

   #### 主要テストケース

   | TC   | 名称           | セレクター例                     |
   | ---- | -------------- | -------------------------------- |
   | TC-1 | ダイアログ表示 | `text="権限の確認が必要です"`    |
   | TC-2 | 情報表示       | `text="ツール:"`, `text="引数:"` |
   | TC-3 | 許可操作       | `button:has-text("許可")`        |
   | TC-4 | 拒否操作       | `button:has-text("拒否")`        |
   | TC-5 | 選択記憶       | `[type="checkbox"]`              |

   #### 実行方法

   ```bash
   # E2Eテスト実行
   pnpm --filter @repo/desktop test:e2e -- skillPermission

   # ヘッドフルモード（デバッグ用）
   PWDEBUG=1 pnpm --filter @repo/desktop test:e2e -- skillPermission
   ```

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`: 実装ガイド（Part 1 + Part 2）

---

### タスク2: システム仕様書更新（4サブステップ）

**目的**: aiworkflow-requirements のシステム仕様書を更新する

**実行手順**:

#### Step 1-A: タスク完了記録【必須】

1. `quality-e2e-testing.md` に完了タスクセクション追加

   ```markdown
   ## 完了タスク

   ### TASK-8C-D: E2Eテスト - 権限ダイアログフロー (YYYY-MM-DD完了)

   | 項目     | 内容                                                |
   | -------- | --------------------------------------------------- |
   | タスクID | TASK-8C-D                                           |
   | 完了日   | YYYY-MM-DD                                          |
   | テスト数 | N件                                                 |
   | 成果物   | `apps/desktop/src/__tests__/skillPermission.e2e.ts` |

   #### テスト結果サマリー

   | メトリクス     | 値  |
   | -------------- | --- |
   | テストケース数 | N   |
   | PASS           | N   |
   | FAIL           | 0   |
   | 実行時間       | Xs  |
   ```

2. LOGS.md 更新（**2ファイル両方必須**）
   - `.claude/skills/aiworkflow-requirements/LOGS.md`
   - `.claude/skills/task-specification-creator/LOGS.md`

3. topic-map.md 更新（新規セクション追加時のみ）

#### Step 1-B: 実装状況テーブル更新【必須】

1. `quality-e2e-testing.md` の「E2Eテスト対象フロー」テーブルを更新
   - TASK-8C-D のステータスを「完了」に更新

#### Step 1-C: 関連タスクテーブル更新【必須】

1. 関連仕様書内の「関連タスク」テーブルのステータス更新
   - 確認対象: `interfaces-agent-sdk-skill.md` 等

#### Step 2: システム仕様更新【条件付き】

新規インターフェース追加がない場合は「該当なし」と記録。

**期待される成果物**:

- システム仕様書が更新されている

---

### タスク3: ドキュメント更新履歴作成【必須】

**目的**: 変更内容を記録する

**実行手順**:

1. `outputs/phase-12/documentation-changelog.md` を作成

   ```markdown
   # ドキュメント更新履歴 - TASK-8C-D

   ## 更新日: YYYY-MM-DD

   ### Step 1-A: タスク完了記録

   - 更新ファイル: `quality-e2e-testing.md`
   - 内容: TASK-8C-D完了セクション追加

   ### Step 1-B: 実装状況テーブル更新

   - 更新ファイル: `quality-e2e-testing.md`
   - 内容: TASK-8C-D ステータス「完了」

   ### Step 1-C: 関連タスクテーブル更新

   - 更新ファイル: （該当ファイル）
   - 内容: （更新内容）

   ### Step 2: システム仕様更新

   - 該当なし（新規インターフェース追加なし）

   ### LOGS.md更新

   - `.claude/skills/aiworkflow-requirements/LOGS.md`
   - `.claude/skills/task-specification-creator/LOGS.md`
   ```

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`: 変更履歴

---

### タスク4: 未タスク検出レポート作成【0件でも出力必須】

**目的**: 未完了課題を検出し、未タスク指示書を作成する

**実行手順**:

1. 未タスク検出ソースの確認

   | ソース                 | 確認内容            |
   | ---------------------- | ------------------- |
   | 元タスク仕様書         | 「スコープ外」項目  |
   | Phase 3/10レビュー結果 | MINOR判定の指摘事項 |
   | Phase 11手動テスト     | スコープ外発見事項  |
   | コードコメント         | TODO/FIXME/HACK/XXX |

2. 検出スクリプト実行

   ```bash
   node scripts/detect-unassigned-tasks.js --scan apps/desktop/src/__tests__ --output .tmp/unassigned-candidates.json
   ```

3. 検出結果をレポートにまとめる

   ```markdown
   # 未タスク検出レポート - TASK-8C-D

   ## 検出結果サマリー

   | 検出ソース       | 件数 |
   | ---------------- | ---- |
   | スコープ外項目   | N    |
   | MINOR指摘        | N    |
   | Phase 11発見事項 | N    |
   | TODO/FIXME       | N    |
   | **合計**         | N    |

   ## 検出項目一覧

   ### 1. 〇〇〇（優先度: 高/中/低）

   - ソース: Phase 11手動テスト
   - 内容: 〇〇〇
   - 未タスク指示書: `unassigned-tasks/task-imp-xxx.md`

   （または）

   ## 検出結果: 0件

   未タスク候補は検出されませんでした。
   ```

4. 未タスク指示書作成（検出ありの場合）
   - `docs/30-workflows/skill-import-agent-system/unassigned-tasks/` に作成

**期待される成果物**:

- `outputs/phase-12/unassigned-task-detection.md`: 未タスク検出レポート
- 未タスク指示書（検出ありの場合）

---

## 参照資料

| 参照資料             | パス                                                                                 | 内容             |
| -------------------- | ------------------------------------------------------------------------------------ | ---------------- |
| Phase 11 成果物      | `outputs/phase-11/`                                                                  | 手動テスト結果   |
| Phase 11/12ガイド    | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`          | ドキュメント方法 |
| 仕様更新フロー       | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`       | 更新手順         |
| 未タスクガイドライン | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md` | 未タスク作成     |

### システム仕様（aiworkflow-requirements）

> 以下のファイルを更新対象として確認してください。

| 参照資料      | パス                                                                       | 更新対象 |
| ------------- | -------------------------------------------------------------------------- | -------- |
| E2Eテスト仕様 | `.claude/skills/aiworkflow-requirements/references/quality-e2e-testing.md` | ✓        |
| LOGS.md       | `.claude/skills/aiworkflow-requirements/LOGS.md`                           | ✓        |

---

## 成果物

| 成果物               | パス                                            | 内容            |
| -------------------- | ----------------------------------------------- | --------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | Part 1 + Part 2 |
| ドキュメント変更履歴 | `outputs/phase-12/documentation-changelog.md`   | 変更記録        |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | 検出結果        |

---

## 完了条件

- [ ] 実装ガイド（Part 1: **中学生レベル概念説明**）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] **【Task 2 Step 1-A】** システム仕様書に「完了タスク」セクションを追加した
- [ ] **【Task 2 Step 1-A】** 関連ドキュメントセクションに実装ガイドリンクを追加した
- [ ] **【Task 2 Step 1-A】** 変更履歴セクションにバージョンを追記した
- [ ] **【Task 2 Step 1-A】** aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加した
- [ ] **【Task 2 Step 1-A】** task-specification-creator/LOGS.mdにタスク完了記録を追加した
- [ ] **【Task 2 Step 1-A】** topic-map.mdに新規セクションエントリを追加した（該当する場合）
- [ ] **【Task 2 Step 1-B】** 実装状況テーブルを更新した（該当する場合）
- [ ] **【Task 2 Step 1-C】** 関連タスクテーブルのステータスを「完了」に更新した（該当する場合）
- [ ] **【Task 2 Step 2】** システム仕様更新の要否を判断し、documentation-changelog.mdに記録した
- [ ] ドキュメント変更履歴が作成されている
- [ ] 未タスク検出レポートが作成されている（0件でも出力必須）
- [ ] **本Phase内の全タスクを100%実行完了**

---

## フォールバック手順

スクリプトが存在しない場合の代替手順:

| スクリプト                            | 代替手順                                                                                                             |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `generate-documentation-changelog.js` | 手動でdocumentation-changelog.mdを作成（`outputs/phase-12/documentation-changelog.md`の形式に従う）                  |
| `complete-phase.js`                   | 手動でartifacts.jsonを作成（参照: `docs/30-workflows/completed-tasks/TASK-4-1-ipc-channels/outputs/artifacts.json`） |
| `detect-unassigned-tasks.js`          | 手動で各Phaseのレビュー結果・発見課題を確認し、unassigned-task-detection.mdを作成                                    |
| `validate-phase-output.js`            | 手動で成果物の存在と完了条件を確認                                                                                   |

---

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスク1: 実装ガイド作成（Part 1 + Part 2）
3. 実行タスク2: システム仕様書更新（Step 1-A/1-B/1-C/Step 2）
4. 実行タスク3: ドキュメント更新履歴作成
5. 実行タスク4: 未タスク検出レポート作成
6. 成果物の作成・配置
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスク（4タスク）を100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

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

`docs/30-workflows/skill-import-agent-system/tasks/TASK-8C-D-e2e-permission/phase-13-pr-creation.md`
