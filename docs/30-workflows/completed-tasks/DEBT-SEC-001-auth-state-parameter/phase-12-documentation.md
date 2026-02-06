# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                |
| ------ | --------------------------------- |
| Phase  | 12                                |
| 機能名 | DEBT-SEC-001-auth-state-parameter |
| 作成日 | 2026-02-05                        |
| 状態   | 未着手                            |

## 目的

DEBT-SEC-001の実装結果をドキュメント化し、実装ガイド作成、システム仕様更新、未タスク検出を行う。

## 実行タスク（4タスク - 全て完了必須）

> 以下のタスクを順番に実行してください。

### Task 1: 実装ガイド作成（2パート構成）

**目的**: State parameter検証の仕組みを初学者と開発者の両方に向けて説明する

**実行手順**:

#### Part 1: 初学者・中学生レベル

1. 以下の構成で実装ガイドの Part 1 を作成する：
   - **日常の例え話**: 「図書館の貸出カードのようなもの。図書館で本を借りるとき、窓口で"貸出番号"をもらいます。本を返すとき、その番号を見せることで"本当にあなたが借りた本ですか？"と確認できます。OAuth認証のState parameterも同じで、ログインを始めるときにアプリが"確認番号"を発行し、ログイン完了時にその番号が正しいか照合します。もし誰かが偽の"ログイン完了通知"を送ってきても、確認番号が合わないので見破れるのです」
   - **なぜ必要か**: 悪意ある第三者が偽のログイン完了通知を送る攻撃（CSRF攻撃）を防ぐため
   - **何をするか**: ランダムな確認番号（state）を生成し、ログイン完了時に照合する仕組み
   - **セキュリティの仕組み**: 「確認番号は一度使ったら捨てる（ワンタイムユース）、10分で期限切れになる（有効期限）」
   - 専門用語は使わない（使う場合は即座に説明する）

#### Part 2: 開発者・技術者レベル

2. 以下の構成で Part 2 を作成する：
   - **アーキテクチャ概要**: StateManagerのMain Process内配置、メモリ内Map管理
   - **TypeScriptインターフェース**: StateEntry型、StateManagerクラスのpublicメソッド
   - **APIシグネチャ**: `generateState(provider: string): string`, `validateState(state: string): ValidationResult`, `cleanup(): void`
   - **エラーハンドリング**: state不正時、期限切れ時、欠落時の各パターンとエラーコード
   - **設定パラメータ**: STATE_EXPIRY_MS（有効期限）、STATE_LENGTH（state文字列長）、CLEANUP_INTERVAL_MS
   - **認証フローとの統合**: authHandlers.ts（state生成・URL付与）、index.ts（コールバック受信・state検証）の変更箇所
   - **セキュリティ設計**: crypto.randomBytes()によるエントロピー、メモリ保存、ワンタイムユース

3. `outputs/phase-12/implementation-guide.md` に出力する

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`

---

### Task 2: システムドキュメント更新（2ステップ）

**目的**: タスク完了記録とシステム仕様の更新を行う

> **重要**: 詳細手順は `task-specification-creator/references/spec-update-workflow.md` を参照

**実行手順**:

#### Step 1-A: タスク完了記録【必須・全タスク】

1. 関連仕様書に完了セクションを追加し、変更履歴を追記する
2. 以下の LOGS.md を**両方**更新する：
   - `.claude/skills/aiworkflow-requirements/LOGS.md`
   - `.claude/skills/task-specification-creator/LOGS.md`
3. topic-map.mdに新規セクションエントリを追加する（該当する場合）
4. 関連仕様書の「関連ドキュメント」セクションに実装ガイドへのリンクを追加する

#### Step 1-B: 実装状況テーブル更新【必須】

1. `security-principles.md` のDEBT-SEC-001に関連する行のステータスを「完了」に更新する

   ```bash
   # 該当箇所の確認
   grep -n "DEBT-SEC-001" .claude/skills/aiworkflow-requirements/references/security-principles.md
   ```

- セキュリティリスクと対策テーブルのCSRF攻撃行のステータスを「✅ 対策済み」に更新する

#### Step 1-C: 関連タスクテーブル更新【必須】

1. `architecture-auth-security.md` の技術的負債セクションでDEBT-SEC-001のステータスを更新する

   ```bash
   # 関連タスクテーブル検索（必須実行）
   grep -rn "DEBT-SEC-001" .claude/skills/aiworkflow-requirements/references/
   ```

2. 該当するテーブルが見つかった場合、ステータスを「**完了**」に更新する

#### Step 2: システム仕様更新【新規インターフェース追加のため必須】

**本タスクの判断**: StateManagerは新規モジュールであり、OAuth認証フローにstate parameter検証が追加されるため、**Step 2は更新が必要**。

更新対象：

| 更新先仕様書                    | 更新内容                                                                                                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `architecture-auth-security.md` | State parameter検証フロー追加（認証シーケンスへの統合）                                                                                                             |
| `security-principles.md`        | DEBT-SEC-001ステータスを「完了」に更新、実装概要追記                                                                                                                |
| `api-ipc-auth.md`               | AUTH_STATE_CHANGEDペイロード説明に「既知のerrorCode値」セクションを追加し、CSRF_VALIDATION_FAILEDを記載（AUTH_ERROR_CODESが定数として存在する場合はそちらにも追加） |
| `security-operations.md`        | CSRF検証失敗イベントのセキュリティログ要件追記                                                                                                                      |

追加更新事項：

- 実装ファイルセクションに `stateManager.ts` を追加する
- セキュリティ考慮事項テーブルのDEBT-SEC-001のステータスを「✅ 実装済み」に更新する

**期待される成果物**:

- LOGS.md更新（2ファイル）
- 関連仕様書のステータス更新
- システム仕様書の更新

---

### Task 3: ドキュメント更新履歴 & artifacts.json更新【必須】

**目的**: 本Phaseで行ったドキュメント更新を記録する

**実行手順**:

1. `outputs/phase-12/documentation-changelog.md` を作成する
2. 以下の内容を記載する：
   - Task 1（実装ガイド）の作成結果
   - Task 2（仕様更新）の各Stepの実施結果
   - 更新したファイル一覧
3. artifacts.jsonを更新する（Phase 12完了ステータス）

```bash
# スクリプトが存在する場合
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js --workflow docs/30-workflows/DEBT-SEC-001-auth-state-parameter

# Phase 12完了登録
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/DEBT-SEC-001-auth-state-parameter \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート"
```

**スクリプト未存在時の代替手順**:

- 手動で `outputs/phase-12/documentation-changelog.md` を作成
- 手動で `artifacts.json` を更新

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`

---

### Task 4: 未タスク検出【必須 - 0件でも出力必須】

**目的**: DEBT-SEC-001の実装で発見された未解決の課題や改善点を検出する

**実行手順**:

1. 以下のソースから未タスク候補を検出する：

| #   | ソース                    | 確認項目                                   |
| --- | ------------------------- | ------------------------------------------ |
| 1   | Phase 3 設計レビュー結果  | MINOR判定の指摘事項                        |
| 2   | Phase 10 最終レビュー結果 | MINOR判定の指摘事項                        |
| 3   | Phase 11 手動テスト結果   | スコープ外の発見事項・改善提案             |
| 4   | コードコメント            | TODO/FIXME/HACK/XXX（stateManager.ts内等） |

2. 未タスク候補が検出された場合：
   - 各候補の概要、優先度、対応方針を記載する
   - 未タスク仕様書テンプレートに従い `docs/30-workflows/unassigned-task/` に仕様書を作成する

3. 未タスク候補が0件の場合：
   - 「検出された未タスク: 0件」と明記する
   - 確認したソース一覧を記載する

4. `outputs/phase-12/unassigned-task-detection.md` に出力する

**期待される成果物**:

- `outputs/phase-12/unassigned-task-detection.md`（**0件でも必須**）

---

## アーキテクチャ層別ドキュメント

本タスクはMain Process層に集中した変更である：

| レイヤー     | 変更内容                                                |
| ------------ | ------------------------------------------------------- |
| Main Process | StateManager新規作成、authHandlers.ts変更、index.ts変更 |
| IPC          | state付きURL生成（authHandlers → ブラウザ）             |
| Renderer     | エラーメッセージ表示（既存AUTH_STATE_CHANGED経由）      |

---

## フォールバック手順

| 状況                                            | 対処                                   |
| ----------------------------------------------- | -------------------------------------- |
| generate-documentation-changelog.jsが存在しない | 手動でdocumentation-changelog.mdを作成 |
| complete-phase.jsが存在しない                   | 手動でartifacts.jsonを更新             |
| 仕様書ファイルが見つからない                    | Grepで検索し、最新のファイルパスを確認 |
| LOGS.mdの形式が不明                             | 既存エントリのフォーマットに従う       |

---

## 参照資料

| 参照資料               | パス                                                                                   | 内容             |
| ---------------------- | -------------------------------------------------------------------------------------- | ---------------- |
| Phase 11手動テスト結果 | `outputs/phase-11/manual-test-result.md`                                               | テスト結果       |
| 仕様更新ワークフロー   | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`         | 更新手順         |
| 未タスクガイドライン   | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`   | 未タスク基準     |
| 実装ガイドテンプレート | `.claude/skills/task-specification-creator/assets/implementation-guide-template.md`    | テンプレート     |
| 更新記録テンプレート   | `.claude/skills/task-specification-creator/assets/documentation-changelog-template.md` | テンプレート     |
| 認証アーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md`      | Electron認証設計 |
| セキュリティ設計原則   | `.claude/skills/aiworkflow-requirements/references/security-principles.md`             | 負債テーブル     |

---

## 実行手順

1. Task 1: 実装ガイド（Part 1/Part 2）を作成する
2. Task 2: 関連仕様書を更新する（Step 1-A, 1-B, 1-C, Step 2）
3. Task 3: ドキュメント更新履歴を作成する
4. Task 4: 未タスク検出レポートを作成する
5. 完了条件を全て満たすことを確認する

---

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| エラーハンドリング | 例外処理が必要な場合               | `aiworkflow-requirements: error-handling.md` |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                   | 適用判断                    | 仕様参照先                                             |
| -------------------- | --------------------------- | ------------------------------------------------------ |
| バックエンド（Main） | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信              | Main-Renderer連携の場合     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |

---

## 成果物

| 成果物               | パス                                            | 必須 |
| -------------------- | ----------------------------------------------- | ---- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | YES  |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | YES  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | YES  |

---

## 完了条件

- [ ] Task 1: 実装ガイドが Part 1（中学生レベル）+ Part 2（技術者レベル）で作成されている
- [ ] Task 1: Part 1 に日常の例え話（図書館の貸出カード）が含まれている
- [ ] **【Task 2 Step 1-A】aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加した**
- [ ] **【Task 2 Step 1-A】task-specification-creator/LOGS.mdにタスク完了記録を追加した**
- [ ] **【Task 2 Step 1-B】security-principles.mdのDEBT-SEC-001を「完了」に更新した**
- [ ] **【Task 2 Step 1-C】architecture-auth-security.mdの技術的負債セクションを更新した**
- [ ] **【Task 2 Step 2】architecture-auth-security.mdにState parameter検証フローを追加した**
- [ ] **【Task 2 Step 2】security-principles.mdにDEBT-SEC-001実装概要を追記した**
- [ ] Task 3: documentation-changelog.mdが全Stepの結果を個別に記載している
- [ ] Task 3: artifacts.jsonが更新されている
- [ ] Task 4: 未タスク検出レポートが出力されている（0件でも出力済み）
- [ ] **【Task 2 Step 1-A】topic-map.mdに新規セクションエントリを追加した（該当する場合）**
- [ ] **【Task 2 Step 1-A】関連仕様書のドキュメントセクションに実装ガイドリンクを追加した**
- [ ] **【Task 2 Step 1-A】関連仕様書の変更履歴セクションにバージョンを追記した**
- [ ] **【Task 2 Step 1-A】関連仕様書に「完了タスク」セクションを追加した**
- [ ] アーキテクチャ層別のドキュメントが実装ガイドに含まれている
- [ ] 検出された未タスクに対して指示書が `docs/30-workflows/unassigned-task/` に作成されている（該当する場合）
- [ ] **本Phase内の全タスクを100%実行完了**

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. Task 1: 実装ガイド作成（Part 1/Part 2）
3. Task 2: システムドキュメント更新（Step 1-A, 1-B, 1-C, Step 2）
4. Task 3: ドキュメント更新履歴 & artifacts.json更新
5. Task 4: 未タスク検出
6. 成果物の作成・配置
7. 完了条件の検証

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/DEBT-SEC-001-auth-state-parameter --phase 12
```

---

## 次のPhase

Phase 13: PR作成
