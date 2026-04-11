# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                                                        |
| ---------- | ----------------------------------------------------------- |
| Phase      | 12                                                          |
| Phase名    | ドキュメント更新                                            |
| タスクID   | UT-SKILL-WIZARD-FB-04-WORKFLOW-LEDGER-SYNC-001              |
| 機能名     | Phase 12 ledger/lane/artifacts 三者同期チェックリスト標準化 |
| タスク種別 | **docs-only**（コード変更なし・スキルテンプレート更新のみ） |
| 前提Phase  | Phase 11（手動テスト）                                      |
| 後続Phase  | Phase 13                                                    |
| ステータス | 未実施                                                      |
| 作成日     | 2026-04-11                                                  |

---

## 目的

本タスクで行った docs-only 変更（`task-specification-creator` スキルの Phase 12 テンプレートへの
ledger/lane/artifacts 三者同期チェックリスト追加）の内容を仕様書・ledger・lane index・artifacts.json の
4〜5 箇所に記録し、将来の実行者が同じ経験を繰り返さなくて済む状態を確立する。

## 背景

本タスクは docs-only タスクであるため、Phase 12 Step 1-B での実装状況テーブルへの記録は
`completed` ではなく `spec_created` で行う。
これは「実装が完了した」のではなく「仕様書（テンプレート）が作成・更新された」ことを正確に反映するためである。

---

## Phase 12 記録分離方針

> **plan と current fact を分離する**

本 Phase のセクション構成は以下のルールに従う：

| セクション         | 記載内容                                       | 記載場所                                  |
| ------------------ | ---------------------------------------------- | ----------------------------------------- |
| 実行タスク（本文） | **plan のみ**（何をするかの手順・目的）        | このファイル（phase-12-documentation.md） |
| 実行結果・成果物   | **current facts のみ**（実際に生成された内容） | `outputs/phase-12/` 配下の各ファイル      |

- **plan（本文）** には実行前の意図・手順を記載する
- **実行結果** は `outputs/phase-12/` 配下の各ファイルに記録し、本文には結果を混入させない
- Step 1-B の「実装状況テーブル」には `spec_created` を記録する（`completed` ではない）

---

## 実行タスク

> **Task / Step 分離ルール**: このセクションには plan のみを書く。実行結果は `outputs/phase-12/` へ記録する。

---

### Task 1: 実装ガイド作成（2パート構成）

**目的**: 今回の変更内容（三者同期チェックリスト追加）を2つの粒度で説明する実装ガイドを作成する

**成果物パス**: `outputs/phase-12/implementation-guide.md`

#### Part 1: 中学生レベルの概念説明

「なぜ Phase 12 で複数ファイルを同時更新する必要があるか」を日常的な例え話で説明する。

**例え話（記載必須）**:

> 卒業式の記念写真を整理するとき、次の4冊を一緒に更新しないと矛盾が起きる：
>
> - **アルバム（completed ledger）**: 「この年度で卒業した生徒の記念写真集」
> - **在校生名簿（backlog ledger）**: 「まだ在学中の生徒一覧」
> - **卒業生名簿（lane index）**: 「各年度の卒業生を整理した総覧」
> - **写真管理台帳（artifacts.json）**: 「どの写真がどこにあるかの管理記録」
>
> アルバムだけ更新して在校生名簿から名前を消し忘れると、その生徒は「卒業した」と「まだいる」という
> 二重状態になる。同様に Phase 12 close-out でも、5箇所のファイルを同時更新しないと
> タスクの状態が「完了した」と「まだ残っている」の矛盾した状態になる。

**記載ポイント**:

- 各ファイルが「何の役割」を持つかを1行で説明する
- 同期しないと何が壊れるかを具体的に示す
- 専門用語は使わず、中学生が読んでわかる文章にする

#### Part 2: 技術者レベルの詳細説明

チェックリストの技術的詳細を記載する。

**記載必須項目**:

| 項目             | 内容                                                                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 同期対象ファイル | `task-workflow.md` / `task-workflow-completed.md` / `lane/index.md` / `outputs/artifacts.json` / `.claude/skills/task-specification-creator/outputs/artifacts.json` |
| 更新タイミング   | Phase 12 Step 1-A 完了後、Step 1-B 記録前に一括更新する                                                                                                             |
| 検証コマンド     | `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/<feature> --phase 12`                                            |
| 矛盾検出方法     | backlog ledger にタスクIDが残っている場合は completed ledger への移動漏れ                                                                                           |

---

### Task 2: システム仕様書更新（docs-only のため spec_created）

**目的**: 本タスクの完了状態を各台帳・仕様書に正確に記録する

**成果物パス**: `outputs/phase-12/system-spec-update-summary.md`

#### Step 1-A: 完了タスク記録

以下の4箇所を更新する：

| 更新対象                                                                                   | 更新内容                                                          |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| `docs/30-workflows/ut-skill-wizard-fb04-workflow-ledger-sync/LOGS.md`                      | Phase 12 完了エントリを追記（日付・実行者・変更概要）             |
| `.claude/skills/task-specification-creator/LOGS.md`                                        | FB-04 対応として三者同期チェックリスト追加の完了エントリを追記    |
| `docs/30-workflows/ut-skill-wizard-fb04-workflow-ledger-sync/topic-map.md`（存在する場合） | Phase 12 関連トピックを追記                                       |
| completed ledger（`docs/30-workflows/completed-tasks/`）                                   | `UT-SKILL-WIZARD-FB-04-WORKFLOW-LEDGER-SYNC-001` を移動または追記 |

> 注: ここでの completed ledger は `task-workflow-completed.md` 相当を指す。`outputs/artifacts.json` と
> `.claude/skills/task-specification-creator/outputs/artifacts.json` は別ファイルとして同一 wave で更新する。

#### Step 1-B: 実装状況テーブルへの記録

**重要**: docs-only タスクのため、ステータスは `spec_created` で記録する（`completed` ではない）

記録先テーブルの例：

```markdown
| UT-SKILL-WIZARD-FB-04-WORKFLOW-LEDGER-SYNC-001 | 三者同期チェックリスト標準化 | spec_created | 2026-04-11 |
```

#### Step 1-C: 関連タスクテーブルのステータス更新

以下のテーブルを current facts に合わせて更新する：

| 更新対象ファイル                                                              | 更新箇所                                  | 更新内容                  |
| ----------------------------------------------------------------------------- | ----------------------------------------- | ------------------------- |
| `docs/30-workflows/ut-skill-wizard-fb04-workflow-ledger-sync/index.md`        | Phase一覧テーブルの Phase 12 ステータス欄 | `未実施` → `spec_created` |
| `docs/30-workflows/skill-creator-agent-sdk-lane/index.md`（参照元がある場合） | 関連タスクの記録                          | 該当する場合のみ更新      |

#### Step 2: 新規インターフェース追加

**N/A** — 本タスクは docs-only のため、新規インターフェースの追加はない。

---

### Task 3: ドキュメント更新履歴作成

**目的**: Phase 12 で実施した全 Step の変更内容を一覧できる変更履歴ファイルを作成する

**成果物パス**: `outputs/phase-12/documentation-changelog.md`

**記載必須項目**: 以下の各 Step の結果を個別のセクションに分けて記載する

| Step     | 記載必須内容                                                            |
| -------- | ----------------------------------------------------------------------- |
| Step 1-A | 更新した LOGS.md × 2・topic-map.md・completed ledger それぞれの変更前後 |
| Step 1-B | 実装状況テーブルへ追記した行（`spec_created` ステータスで記録）         |
| Step 1-C | 関連タスクテーブルで更新した全エントリのステータス変更内容              |
| Step 2   | N/A（新規インターフェースなし）の理由を明記                             |

> **注意**: 各 Step を独立したセクション（`## Step 1-A`, `## Step 1-B`, ...）に分けて記載すること。
> まとめて1行に集約しないこと。

---

### Task 4: 未タスク検出レポート作成（0件でも出力必須）

**目的**: Phase 1〜11 の実行中に発見された未割り当てタスクを記録する

**成果物パス**: `outputs/phase-12/unassigned-task-detection.md`

**検出ソース**:

| 検出ソース                      | 確認内容                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------- |
| 元タスク仕様書                  | `docs/30-workflows/unassigned-task/UT-SKILL-WIZARD-FB-04-WORKFLOW-LEDGER-SYNC-001.md` |
| Phase 3 設計レビュー結果        | `outputs/phase-3/` 配下のレビュー記録                                                 |
| Phase 10 最終レビューゲート結果 | `outputs/phase-10/` 配下のレビュー記録                                                |
| Phase 11 手動テスト結果         | `outputs/phase-11/` 配下のテスト記録                                                  |

**記載ルール**:

- 未タスクが **0件** でも「検出なし」として必ず出力すること
- **current**（現在の状態）と **baseline**（比較元の期待状態）を分離して記載すること
- 例：

```markdown
## baseline（期待状態）

- Phase 1-11 の実行中に発見された未タスクは全て backlog ledger に登録されること

## current（現在の状態）

- 検出件数: 0件
- 理由: Phase 1〜11 の全 Step で未割り当てタスクは発見されなかった
```

---

### Task 5: スキルフィードバックレポート作成（改善点なしでも出力必須）

**目的**: `task-specification-creator` スキルの運用を通じて得たフィードバックを記録する

**成果物パス**: `outputs/phase-12/skill-feedback-report.md`

**記載必須項目**:

| 項目             | 内容                                                 |
| ---------------- | ---------------------------------------------------- |
| 良かった点       | スキルテンプレートが機能した箇所・効果があった設計   |
| 改善点           | 本タスク実行中に感じた不便・非効率・漏れやすかった点 |
| 改善提案         | 具体的な変更案（任意）                               |
| 次回への引き継ぎ | 次に同種のタスクを実行する際に注意すべき点           |

> **注意**: 改善点が **0件** でも「改善点なし」として必ず出力すること。
> 空ファイルまたはテンプレートのみのファイルは不可。

---

## 参照資料

| 参照資料                  | パス                                                                                        | 内容                                    |
| ------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------- |
| SKILL.md                  | `.claude/skills/task-specification-creator/SKILL.md`                                        | よくある漏れテーブル・Phase 12 運用方針 |
| Phase 12 準拠テンプレート | `.claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md` | 三者同期チェックリスト追加先            |
| Phase 12 ガイド           | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`      | Step 1-A 手順                           |
| spec-update-workflow      | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`              | Phase 12 同期ルール                     |
| 元 unassigned task        | `docs/30-workflows/unassigned-task/UT-SKILL-WIZARD-FB-04-WORKFLOW-LEDGER-SYNC-001.md`       | 苦戦箇所・完了条件の参照元              |
| タスク index              | `docs/30-workflows/ut-skill-wizard-fb04-workflow-ledger-sync/index.md`                      | Phase一覧・タスク概要                   |
| Phase 11 手動テスト仕様書 | `docs/30-workflows/ut-skill-wizard-fb04-workflow-ledger-sync/phase-11-manual-test.md`       | 手動テスト結果の引き継ぎ                |

---

## 成果物

| 成果物                          | パス                                                     | 内容                                     |
| ------------------------------- | -------------------------------------------------------- | ---------------------------------------- |
| 実装ガイド                      | `outputs/phase-12/implementation-guide.md`               | 中学生レベル概念説明 + 技術者レベル詳細  |
| システム仕様更新サマリー        | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A/1-B/1-C/Step 2 の更新記録       |
| ドキュメント変更履歴            | `outputs/phase-12/documentation-changelog.md`            | 全 Step の変更前後を個別セクションで記録 |
| 未タスク検出レポート            | `outputs/phase-12/unassigned-task-detection.md`          | current/baseline 分離・0件でも出力必須   |
| スキルフィードバックレポート    | `outputs/phase-12/skill-feedback-report.md`              | 改善点なしでも出力必須                   |
| Phase 12 タスク仕様準拠チェック | `outputs/phase-12/phase12-task-spec-compliance-check.md` | AC-1〜AC-6 の充足状態確認記録            |

---

## 完了条件

- [ ] Task 1: `outputs/phase-12/implementation-guide.md` が作成されており、Part 1（中学生レベル）と Part 2（技術者レベル）の両方が含まれていること
- [ ] Task 1 Part 1: 卒業式の例え話または同等の日常的な例え話が含まれていること
- [ ] Task 1 Part 2: 同期対象ファイル5件・更新タイミング・検証コマンドが全て記載されていること
- [ ] Task 2 Step 1-A: LOGS.md × 2 が更新されていること（topic-map.md・completed ledger も存在する場合は更新済み）
- [ ] Task 2 Step 1-B: 実装状況テーブルに `spec_created` ステータスが記録されていること（`completed` ではないこと）
- [ ] Task 2 Step 1-C: 関連タスクテーブルの current facts が更新されていること
- [ ] Task 3: `outputs/phase-12/documentation-changelog.md` が作成されており、Step 1-A/1-B/1-C/Step 2 が個別セクションで記載されていること
- [ ] Task 4: `outputs/phase-12/unassigned-task-detection.md` が作成されており、0件の場合も「検出なし」として出力されていること。current/baseline が分離されていること
- [ ] Task 5: `outputs/phase-12/skill-feedback-report.md` が作成されており、改善点が0件の場合も「改善点なし」として出力されていること
- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md` が作成されていること
- [ ] 本Phase内の全タスクを100%実行完了

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認（`outputs/phase-12/` 配下の6ファイルが全て存在すること）
- [ ] Step 1-B のステータスが `spec_created` であることを最終確認

---

## 依存関係

- **前提**: Phase 11（手動テスト）が完了していること
- **後続**: Phase 13（PR作成）へ進む（ユーザーの明示的な承認後）

---

## Phase実行記録テンプレート

Phase完了後、以下を記録してください:

```markdown
## Phase 12 実行記録

### 実行タスク

- Task 1（実装ガイド作成）: [結果]
- Task 2 Step 1-A（完了タスク記録）: [結果]
- Task 2 Step 1-B（spec_created 記録）: [結果]
- Task 2 Step 1-C（関連タスクテーブル更新）: [結果]
- Task 2 Step 2（新規インターフェース追加）: N/A
- Task 3（ドキュメント更新履歴作成）: [結果]
- Task 4（未タスク検出レポート作成）: [結果]
- Task 5（スキルフィードバックレポート作成）: [結果]

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/ut-skill-wizard-fb04-workflow-ledger-sync/phase-13-pr-creation.md`

> **注意**: Phase 13（PR作成）はユーザーの明示的な承認を得てから実施してください。
