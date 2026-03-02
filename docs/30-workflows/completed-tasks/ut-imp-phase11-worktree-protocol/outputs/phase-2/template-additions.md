# Phase 11テンプレート追加設計書

## メタ情報

| 項目       | 値                                                    |
| ---------- | ----------------------------------------------------- |
| タスクID   | UT-IMP-PHASE11-WORKTREE-PROTOCOL-001                  |
| Phase      | 2（設計）                                             |
| 作成日     | 2026-03-01                                            |
| 対象成果物 | Phase 11テンプレート追加 / deferred-testsテンプレート |

---

## 1. Phase 11テンプレート追加設計

### 1.1 追加先ファイル

```
.claude/skills/task-specification-creator/references/phase-11-12-guide.md
```

### 1.2 追加位置

Phase 11セクション内の以下の位置に挿入する。

- **挿入前**: 「テスト結果レポート形式」セクション
- **挿入後**: 「実行フロー」コードブロック

つまり、「実行フロー」コードブロックの直後、「テスト結果レポート形式」の直前に「Worktree環境でのPhase 11実行手順」セクションを追加する。

### 1.3 追加セクション内容

#### セクション見出し

```
## Worktree環境でのPhase 11実行手順
```

#### 1.3.1 Worktree環境判定

セクション冒頭にWorktree環境の判定方法を記載する。

**判定コマンド:**

```bash
git rev-parse --show-toplevel
```

**判定ロジック:**

- 出力パスに `.worktrees/` が含まれる場合 → Worktree環境
- 含まれない場合 → 通常環境（本セクションは不要）

**Worktree環境での制約:**

- GUI操作を要するUIテスト・E2Eテストは実行不可
- ヘッドレスモードが利用できないコンポーネントのテストは実施不可
- 上記に該当するテストは deferred-tests.md に記録して後続フェーズに委ねる

---

#### 1.3.2 Layer 1: 自動テスト検証

Worktree環境でも実行可能な自動テストの検証層。

| #   | 検証項目                                                               | 実行コマンド                                           |
| --- | ---------------------------------------------------------------------- | ------------------------------------------------------ |
| 1   | ユニットテスト全実行                                                   | `pnpm --filter @repo/desktop test`                     |
| 2   | カバレッジ基準確認（Line 80%以上 / Branch 60%以上 / Function 80%以上） | `pnpm --filter @repo/desktop test -- --coverage`       |
| 3   | 統合テスト実行（IPC層・サービス層）                                    | `pnpm --filter @repo/desktop exec vitest run src/main` |

**Layer 1判定基準:**

- 全テストPASS かつ カバレッジ基準充足 → Layer 1 PASS
- テスト失敗またはカバレッジ未達 → Layer 1 FAIL（Phase 6に戻る）

---

#### 1.3.3 Layer 2: 静的コード検証

コードの静的品質を検証する層。Worktree環境で完全実行可能。

| #   | 検証項目                                         | 実行コマンド                                                          |
| --- | ------------------------------------------------ | --------------------------------------------------------------------- |
| 1   | Lint検証                                         | `pnpm --filter @repo/desktop lint`                                    |
| 2   | TypeScript型チェック                             | `pnpm --filter @repo/desktop typecheck`                               |
| 3   | IPC契約整合性確認（P44/P45対策）                 | ハンドラ引数とPreload呼び出し形式を手動照合                           |
| 4   | セキュリティ設定確認（contextIsolation/sandbox） | `grep -rn "contextIsolation\|nodeIntegration" apps/desktop/src/main/` |

**Layer 2判定基準:**

- 全項目PASS → Layer 2 PASS
- いずれか失敗 → Layer 2 FAIL（Phase 8/9に戻る）

---

#### 1.3.4 Layer 3: UI/E2E（deferred-tests.md記録手順）

Worktree環境では実行不可なUIテスト・E2Eテストを記録する層。

**記録手順（3ステップ）:**

**Step 1: 未実施テストの特定**

Phase 4で設計したテストケース一覧と実施済みテスト（Layer 1/2）を照合し、未実施のUI/E2Eテストを特定する。

**Step 2: deferred-tests.md への記録**

以下のパスに deferred-tests.md を作成（またはレコードを追加）し、未実施テストを記録する。

```
docs/30-workflows/{{FEATURE_NAME}}/outputs/phase-5/deferred-tests.md
```

記録フォーマットはテンプレート（本ファイル「2. deferred-tests.mdテンプレート設計」参照）に従う。

**Step 3: Phase 11成果物への参照リンク追加**

Phase 11の成果物ファイル（`outputs/phase-11/manual-test-report.md`）に deferred-tests.md への参照リンクを追記する。

```markdown
## deferred-tests（Worktree環境未実施テスト）

- 記録ファイル: [outputs/phase-5/deferred-tests.md](../phase-5/deferred-tests.md)
- 未実施件数: {{件数}}件
- 実行予定: PRマージ後CIパイプラインにて実行
```

---

#### 1.3.5 Layer 1/2/3 総合判定基準テーブル

| Layer 1結果 | Layer 2結果 | Phase 11判定 | 次のアクション                                              |
| ----------- | ----------- | ------------ | ----------------------------------------------------------- |
| PASS        | PASS        | PASS         | Phase 12（ドキュメント）へ進む                              |
| PASS        | FAIL        | FAIL         | Phase 8（リファクタリング）または Phase 9（品質検証）に戻る |
| FAIL        | PASS        | FAIL         | Phase 6（テスト拡充）に戻る                                 |
| FAIL        | FAIL        | FAIL         | Phase 6に戻り、修正後 Phase 9を再実施                       |

> **注記**: Layer 3（UI/E2E）はWorktree環境では実施不可のため、deferred-tests.md に記録することでPhase 11の完了条件を充足とみなす。Phase 13完了条件にdeferred-tests.md全件PASS確認を追加すること。

---

## 2. deferred-tests.mdテンプレート設計

### 2.1 配置先

```
outputs/phase-5/deferred-tests-template.md
```

実際の使用時は以下のパスに実ファイルを作成する。

```
docs/30-workflows/{{FEATURE_NAME}}/outputs/phase-5/deferred-tests.md
```

### 2.2 テンプレート構造

#### 2.2.1 メタ情報セクション

```markdown
# deferred-tests（Worktree環境未実施テスト一覧）

## メタ情報

| 項目       | 値                               |
| ---------- | -------------------------------- |
| タスクID   | {{TASK_ID}}                      |
| 機能名     | {{FEATURE_NAME}}                 |
| 作成日     | {{YYYY-MM-DD}}                   |
| 作成Phase  | Phase 11（手動テスト）           |
| 最終更新日 | {{YYYY-MM-DD}}                   |
| 実行環境   | Worktree環境（UIテスト実行不可） |
```

#### 2.2.2 未実施テスト一覧テーブル

| 項目         | 説明                                                                                    |
| ------------ | --------------------------------------------------------------------------------------- |
| ID           | DT-001 形式の連番ID                                                                     |
| テスト名     | テストケースの名称（Phase 4成果物のテストID参照）                                       |
| カテゴリ     | UIテスト / E2Eテスト / 統合テスト のいずれか                                            |
| スキップ理由 | Worktree環境でスキップする具体的な理由（例: GUI操作が必要なため、xvfb-run非対応のため） |
| 実行予定環境 | CI（GitHub Actions） / ローカルmain環境 のいずれか                                      |
| 期限         | PRマージ後のCI実行を想定した日付（YYYY-MM-DD形式）                                      |
| ステータス   | 未実施 / CI実行待ち / PASS / FAIL のいずれか                                            |

**テーブル例:**

```markdown
## 未実施テスト一覧

| ID     | テスト名     | カテゴリ  | スキップ理由                | 実行予定環境         | 期限           | ステータス |
| ------ | ------------ | --------- | --------------------------- | -------------------- | -------------- | ---------- |
| DT-001 | {{テスト名}} | UIテスト  | Worktree環境ではGUI操作不可 | CI（GitHub Actions） | {{YYYY-MM-DD}} | 未実施     |
| DT-002 | {{テスト名}} | E2Eテスト | xvfb-runが利用不可          | CI（GitHub Actions） | {{YYYY-MM-DD}} | 未実施     |
```

#### 2.2.3 ステータス定義テーブル

```markdown
## ステータス定義

| ステータス | 意味                                         |
| ---------- | -------------------------------------------- |
| 未実施     | Phase 11時点でWorktree環境のためスキップ済み |
| CI実行待ち | PRマージ済み、CIパイプライン実行待ち         |
| PASS       | CIパイプラインでテスト成功を確認済み         |
| FAIL       | CIパイプラインでテスト失敗。別タスクで対応要 |
```

#### 2.2.4 Phase 13完了条件

```markdown
## Phase 13完了条件

本ファイルに記録された全テストのステータスが PASS または FAIL（別タスク起票済み）になっていること。

- [ ] 全件のステータスが「未実施」以外であること
- [ ] FAIL が存在する場合、対応タスクがunassigned-task/に起票済みであること
- [ ] PRマージ後のCIパイプライン実行結果を確認済みであること
```

### 2.3 ワークフロー（4ステップフロー図）

```
Step 1: Phase 11記録
  Worktree環境で実施不可なUI/E2Eテストを特定し、
  deferred-tests.md に「未実施」ステータスで記録する。
        |
        v
Step 2: Phase 12成果物
  documentation-changelog.md に deferred-tests.md の
  存在と件数を記録する。
  Phase 12成果物一覧に deferred-tests.md を含める。
        |
        v
Step 3: Phase 13完了条件
  PRマージ前にdeferred-tests.md の件数と内容を最終確認する。
  Phase 13の完了条件チェックリストに
  「deferred-tests.md全件PASS確認」を追加する。
        |
        v
Step 4: PRマージ後CI実行
  PRマージ後、CIパイプラインが自動的にUI/E2Eテストを実行する。
  実行結果をdeferred-tests.md に反映し、FAIL があれば
  unassigned-task/ に別タスクとして起票する。
```
