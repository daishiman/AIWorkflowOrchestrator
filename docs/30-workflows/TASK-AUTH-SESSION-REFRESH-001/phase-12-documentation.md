# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                   |
| ------ | -------------------- |
| Phase  | 12                   |
| 機能名 | auth-session-refresh |
| 作成日 | 2026-02-05           |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 実行タスク

- 技術ドキュメント作成: 実装ガイドの作成（Part 1 + Part 2）
- システムドキュメント更新: aiworkflow-requirements等の更新
- ドキュメント更新履歴作成: 変更履歴の記録
- 未タスク検出: 残課題の検出と記録

## 参照資料

| 資料名           | パス                                      | 説明           |
| ---------------- | ----------------------------------------- | -------------- |
| 全Phase成果物    | `outputs/phase-1/` 〜 `outputs/phase-11/` | 全Phase成果物  |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | Phase 10成果物 |
| 手動テスト結果   | `outputs/phase-11/manual-test-result.md`  | Phase 11成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                                        | 内容                                     |
| -------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------- |
| 仕様更新ワークフロー | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`              | Phase 12 Task 2の詳細手順（Step 1-A〜2） |
| Phase 11/12ガイド    | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                 | 実装ガイド2パート構成、未タスク検出要件  |
| セキュリティ原則     | `.claude/skills/aiworkflow-requirements/references/security-principles.md`                  | トークン管理仕様（ドキュメント記載用）   |
| 認証インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                      | AuthSession型定義（ドキュメント記載用）  |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IPC通信パターン（ドキュメント記載用）    |

---

## Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する。

### Part 1: 概念的説明（中学生でもわかる版）

**必須要件:**

- 日常生活での例え話を**必ず**含める
- 専門用語は使わない（使う場合は即座に説明）
- 「なぜ必要か」を先に説明してから「何をするか」を説明

**Part 1の内容例:**

- 「図書館の貸出カードの期限更新」のたとえ
- なぜ自動リフレッシュが必要か（使っている最中に追い出されない）
- 何が起きるか（期限切れ5分前に自動で更新）
- 失敗したらどうなるか（もう一度ログインが必要）

### Part 2: 技術的詳細（開発者向け）

**必須要件:**

- TokenRefreshSchedulerのインターフェース/型定義
- APIシグネチャと使用例
- エラーハンドリングとエッジケースの説明
- 設定可能なパラメータと定数の一覧

**アーキテクチャ層別ドキュメント:**

| 層               | ドキュメント内容                                                    |
| ---------------- | ------------------------------------------------------------------- |
| Main Process     | TokenRefreshSchedulerクラス設計、コールバックパターン、リトライ戦略 |
| Renderer Process | authSliceスケジューラー連携、isRefreshing状態管理                   |
| IPC通信          | auth:refreshチャネル活用、リクエスト/レスポンス型                   |
| セキュリティ     | トークン非露出設計、暗号化保存、withValidation()適用                |

---

## Task 2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

### Step 1-A: タスク完了記録【必須・全タスク】

- [ ] 該当する仕様書に「完了タスク」セクションを追加
  - `docs/00-requirements/05-architecture.md` §5.9（認証アーキテクチャ）
  - `docs/00-requirements/17-security-guidelines.md` §17.2（認証セキュリティ）
- [ ] 関連ドキュメントセクションに実装ガイドリンクを追加
- [ ] 変更履歴セクションにバージョンを追記
- [ ] `aiworkflow-requirements/LOGS.md`にタスク完了エントリを追加
- [ ] `task-specification-creator/LOGS.md`にタスク完了記録を追加
- [ ] `topic-map.md`に新規セクションエントリを追加（TokenRefreshScheduler関連）
- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` でtopic-map.mdを再生成した

### Step 1-B: 実装状況テーブル更新【必須】

| 更新対象                                  | 更新内容                                      |
| ----------------------------------------- | --------------------------------------------- |
| `docs/00-requirements/08-api-design.md`   | auth:refresh「未実装」→「完了」に更新         |
| `docs/00-requirements/05-architecture.md` | セッション自動リフレッシュ「未実装」→「完了」 |

### Step 1-C: 関連タスクテーブル更新【必須】

| 更新対象                           | 更新内容                       |
| ---------------------------------- | ------------------------------ |
| 関連仕様書の「関連タスク」テーブル | UX-002のステータスを「完了」に |

### Step 1-D: topic-map.md再生成【必須】

仕様書にセクション追加・行数変更があった場合、topic-map.mdの行番号を再同期する:

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

### Step 1-E: 未タスク指示書作成・登録【条件付き必須】

未タスク候補が1件以上検出された場合:

- [ ] `docs/30-workflows/unassigned-task/` に指示書を作成・配置した
- [ ] 関連仕様書の残課題テーブルに新規未タスクを登録した

### Step 2: システム仕様更新【必要】

本タスクでは以下の新規追加があるため、Step 2の更新が**必要**:

| 追加項目                         | 更新対象仕様書                                   |
| -------------------------------- | ------------------------------------------------ |
| TokenRefreshSchedulerクラス      | `architecture-implementation-patterns.md`        |
| TokenRefreshSchedulerConfig型    | `interfaces-*.md` または `06-core-interfaces.md` |
| リフレッシュスケジューリング定数 | 設定値一覧への追加                               |

---

## Task 3: ドキュメント更新履歴 & artifacts.json更新【必須】

```bash
# Step 1: ドキュメント更新履歴生成
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js --workflow docs/30-workflows/TASK-AUTH-SESSION-REFRESH-001

# Step 2: Phase 12完了登録
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/TASK-AUTH-SESSION-REFRESH-001 \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート"
```

---

## Task 4: 未タスク検出【必須】

| #   | ソース                 | 確認項目                                           |
| --- | ---------------------- | -------------------------------------------------- |
| 1   | 元タスク仕様書         | 「スコープ外」: オフライン時動作、ログイン履歴記録 |
| 2   | Phase 3レビュー結果    | MINOR判定の指摘事項                                |
| 3   | Phase 10レビュー結果   | MINOR判定の指摘事項                                |
| 4   | Phase 11手動テスト結果 | スコープ外の発見事項                               |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント                        |

**既知のスコープ外項目（未タスク候補）:**

| 候補                               | 元タスクでの記載                   |
| ---------------------------------- | ---------------------------------- |
| オフライン時のリフレッシュ失敗処理 | 「オフライン時の動作（別タスク）」 |
| ログイン履歴記録                   | 「AUDIT-001として別タスク」        |
| ユーザーへの通知UI                 | 「ユーザーへの通知（オプション）」 |

```bash
# 未タスク検出スクリプト
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --scan apps/desktop/src/main/services apps/desktop/src/renderer/store/slices \
  --output .tmp/unassigned-candidates.json
```

---

## 成果物

| 成果物               | パス                                            | 必須 | 説明                      |
| -------------------- | ----------------------------------------------- | ---- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | ✅   | 概念的+技術的ドキュメント |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | ✅   | 更新履歴                  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | ✅   | 検出結果（なしでも出力）  |
| 未完了タスク指示書   | `docs/30-workflows/unassigned-task/*.md`        | 条件 | 検出時のみ作成            |

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明 - 中学生レベル）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] **【Task 2 Step 1-A】システム仕様書に「完了タスク」セクションを追加した**
- [ ] **【Task 2 Step 1-A】関連ドキュメントセクションに実装ガイドリンクを追加した**
- [ ] **【Task 2 Step 1-A】変更履歴セクションにバージョンを追記した**
- [ ] **【Task 2 Step 1-A】aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加した**
- [ ] **【Task 2 Step 1-A】task-specification-creator/LOGS.mdにタスク完了記録を追加した**
- [ ] **【Task 2 Step 1-A】topic-map.mdに新規セクションエントリを追加した（該当する場合）**
- [ ] **【Task 2 Step 1-B】実装状況テーブル（api-design.md等）を「完了」に更新した**
- [ ] **【Task 2 Step 1-C】関連タスクテーブルのステータスを「完了」に更新した**
- [ ] **【Task 2 Step 2】TokenRefreshSchedulerクラス・型定義をシステム仕様書に追加した**
- [ ] **アーキテクチャ層別のドキュメントが作成されている（Main/Renderer/IPC/セキュリティ）**
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] artifacts.jsonが更新されている
- [ ] **【Task 2 Step 1-D】topic-map.mdが再生成されている**
- [ ] **【Task 2 Step 1-E】検出された未タスクの指示書が作成されている（該当する場合）**
- [ ] **aiworkflow-requirements/SKILL.mdの変更履歴にバージョンを追記した**
- [ ] **task-specification-creator/SKILL.mdの変更履歴にバージョンを追記した**
- [ ] **本Phase内の全タスクを100%実行完了**

## フォールバック手順

| スクリプト                            | 代替手順                                                                  |
| ------------------------------------- | ------------------------------------------------------------------------- |
| `generate-documentation-changelog.js` | 手動で`outputs/phase-12/documentation-changelog.md`を作成                 |
| `complete-phase.js`                   | 手動でartifacts.jsonを更新                                                |
| `detect-unassigned-tasks.js`          | 手動で各Phaseのレビュー結果を確認し、`unassigned-task-detection.md`を作成 |

## サブタスク管理

1. Task 1: 実装ガイドPart 1（中学生レベル概念説明）作成
2. Task 1: 実装ガイドPart 2（技術的詳細）作成
3. Task 2 Step 1-A: タスク完了記録（仕様書・LOGS.md×2・topic-map.md）
4. Task 2 Step 1-B: 実装状況テーブル更新
5. Task 2 Step 1-C: 関連タスクテーブル更新
6. Task 2 Step 1-D: topic-map.md再生成
7. Task 2 Step 1-E: 未タスク指示書作成（該当する場合）
8. Task 2 Step 2: システム仕様更新判断・実行
9. Task 3: ドキュメント更新履歴・artifacts.json更新
10. Task 4: 未タスク検出レポート作成
11. 完了条件の検証

## タスク100%実行確認【必須】

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-AUTH-SESSION-REFRESH-001 --phase 12
```

## 次のPhase

Phase 13: PR作成
