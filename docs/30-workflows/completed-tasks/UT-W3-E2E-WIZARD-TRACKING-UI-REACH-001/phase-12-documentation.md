# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| Phase      | 12                                                       |
| Phase名    | ドキュメント更新                                         |
| タスクID   | UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001                   |
| 機能名     | スキルウィザード trackEvent の E2E UI 到達確認テスト追加 |
| タスク種別 | E2E テスト追加（NON_VISUAL から E2E 昇格）               |
| 前提Phase  | Phase 11（手動テスト）                                   |
| 後続Phase  | Phase 13                                                 |
| ステータス | 完了                                                     |
| 作成日     | 2026-04-12                                               |

---

## 目的

本タスクで行った E2E テスト追加（`skill-wizard-tracking.spec.ts` / `wizard-tracking-stub.ts` / `trackEvent.e2e-stub.ts` / CI 設定 / `vite.e2e.config.ts`）の内容を、仕様書・ledger・lane index・artifacts.json の各所に記録し、将来の実行者が同じ調査を繰り返さずに済む状態を確立する。

---

## Phase 12 記録分離方針

> **plan と current fact を分離する**

| セクション         | 記載内容                                       | 記載場所                                  |
| ------------------ | ---------------------------------------------- | ----------------------------------------- |
| 実行タスク（本文） | **plan のみ**（何をするかの手順・目的）        | このファイル（phase-12-documentation.md） |
| 実行結果・成果物   | **current facts のみ**（実際に生成された内容） | `outputs/phase-12/` 配下の各ファイル      |

---

## 実行タスク

> **Task / Step 分離ルール**: このセクションには plan のみを書く。実行結果は `outputs/phase-12/` へ記録する。

---

### Task 1: 実装ガイド作成（2パート構成）

**目的**: 今回の変更内容（E2E テスト追加・CI 統合）を2つの粒度で説明する実装ガイドを作成する

**成果物パス**: `outputs/phase-12/implementation-guide.md`

#### Part 1: 初学者向け説明（中学生レベル）

「なぜ E2E テストで UI の到達確認が必要なのか」「スタブとは何か」を日常的な例え話で説明する。

**記載必須の概念**:

| 概念            | 説明すべき内容                                                           |
| --------------- | ------------------------------------------------------------------------ |
| E2E テスト      | 実際にアプリを操作して動作を確認するテストであることを平易に説明する     |
| trackEvent      | アプリが「ユーザーがこの操作をした」と記録するしくみであることを説明する |
| スタブ（stub）  | 本番の仕組みを模倣してテスト専用に用意した代役であることを説明する       |
| UI 到達確認     | テストが「画面のここまで到達した」ことを確認することを説明する           |
| CI パイプライン | 自動でテストを実行して問題があれば PR をブロックするしくみを説明する     |

**例え話（記載必須）**:

> 遠足の出席確認を例に考えると:
>
> - **先生（E2E テスト）**: 「バスに乗った」「現地に着いた」「帰りのバスに乗った」という各チェックポイントで生徒の名前を呼ぶ
> - **出席票（trackEvent）**: 「このタイミングでこの生徒がここにいた」という記録
> - **仮の生徒カード（スタブ）**: テスト用に作った「架空の生徒情報」で本番の仕組みを壊さずにテストできる
>
> trackEvent の E2E テストとは、「ウィザードが表示された」「次のステップに進んだ」など
> 各チェックポイントで出席票が正しく記録されていることを確認するテストである。

**記載ポイント**:

- 各ファイルが「何の役割」を持つかを1行で説明する
- E2E テストが通っていないと PR がブロックされることを具体的に示す
- 専門用語は使わず、中学生が読んでわかる文章にする

#### Part 2: 技術者向け詳細説明

E2E テスト実装の技術的詳細を記載する。

**記載必須項目**:

| 項目               | 内容                                                                                                                                                      |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 新規作成ファイル   | `apps/desktop/e2e/skill-wizard-tracking.spec.ts` / `apps/desktop/e2e/helpers/wizard-tracking-stub.ts` / `apps/desktop/e2e/helpers/trackEvent.e2e-stub.ts` |
| 変更ファイル       | `.github/workflows/ci.yml`（E2E テスト実行ステップ追加）/ `apps/desktop/vite.e2e.config.ts`（trackEvent alias 追加）                                      |
| テストケース対応表 | TC-03/05/06/08/09/11/12 相当と AC-1〜AC-7 の対応関係                                                                                                      |
| スタブ設計方針     | 本番型定義との型整合を維持し、`e2e/helpers/` 配下にのみ配置すること                                                                                       |
| 実行コマンド       | `pnpm --filter @repo/desktop test:e2e` / `pnpm --filter @repo/desktop test:e2e -- e2e/skill-wizard-tracking.spec.ts`                                      |
| CI 統合方針        | `ci.yml` に E2E テスト実行ステップを追加し、失敗時に PR をブロックする設定                                                                                |

---

### Task 2: システム仕様書更新

**目的**: 本タスクの完了状態を各台帳・仕様書に正確に記録する

**成果物パス**: `outputs/phase-12/system-spec-update-summary.md`

#### Step 1-A: 完了タスク記録

以下の箇所を更新する:

| 更新対象                                                                                   | 更新内容                                                  |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| `docs/30-workflows/UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001/` 配下の LOGS.md（存在する場合） | Phase 12 完了エントリを追記（日付・実行者・変更概要）     |
| 該当 lane の index.md（`docs/30-workflows/skill-wizard-redesign-lane/index.md` 等）        | Phase 一覧テーブルの Phase 12 ステータス欄を更新          |
| completed ledger（`docs/30-workflows/completed-tasks/`）                                   | `UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001` を移動または追記 |
| `artifacts.json`（本タスクディレクトリ）                                                   | Phase 12 の status を `phase12_completed` に更新          |

#### Step 1-B: 実装状況テーブルへの記録

記録先テーブルの例:

```markdown
| UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001 | trackEvent E2E UI 到達確認テスト追加 | completed | 2026-04-12 |
```

#### Step 1-C: 関連タスクテーブルのステータス更新

以下のテーブルを current facts に合わせて更新する:

| 更新対象ファイル                                | 更新箇所                                   | 更新内容               |
| ----------------------------------------------- | ------------------------------------------ | ---------------------- |
| 本タスクディレクトリの index.md（存在する場合） | Phase 一覧テーブルの Phase 12 ステータス欄 | `未実施` → `completed` |
| 該当 lane の index.md（存在する場合）           | 関連タスクの記録                           | 該当する場合のみ更新   |

#### Step 2: 新規インターフェース追加

**E2E テスト追加タスクであるため、本番インターフェースの追加はない。**

ただし、以下を記録する:

- `wizard-tracking-stub.ts` が `SkillWizardEvents` / `TrackEventEntry` を参照し、`trackEvent.e2e-stub.ts` と型整合していること
- スタブは `e2e/` ディレクトリ内にのみ存在し、本番コードからはインポートされないこと

---

### Task 3: ドキュメント更新履歴作成

**目的**: Phase 12 で実施した全 Step の変更内容を一覧できる変更履歴ファイルを作成する

**成果物パス**: `outputs/phase-12/documentation-changelog.md`

**記載必須項目**: 以下の各 Step の結果を個別のセクションに分けて記載する

| Step     | 記載必須内容                                                         |
| -------- | -------------------------------------------------------------------- |
| Step 1-A | 更新した LOGS.md・lane index.md・completed ledger それぞれの変更前後 |
| Step 1-B | 実装状況テーブルへ追記した行（ステータスと日付を明記）               |
| Step 1-C | 関連タスクテーブルで更新した全エントリのステータス変更内容           |
| Step 2   | 本番インターフェース追加なし・スタブ配置方針の記録                   |

> **注意**: 各 Step を独立したセクション（`## Step 1-A`, `## Step 1-B`, ...）に分けて記載すること。
> まとめて1行に集約しないこと。

---

### Task 4: 未タスク検出レポート作成（0件でも出力必須）

**目的**: Phase 1〜11 の実行中に発見された未割り当てタスクを記録する

**成果物パス**: `outputs/phase-12/unassigned-task-detection.md`

**検出ソース**:

| 検出ソース                | 確認内容                                  |
| ------------------------- | ----------------------------------------- |
| Phase 3 設計レビュー結果  | `outputs/phase-3/` 配下のレビュー記録     |
| Phase 10 最終レビュー結果 | `outputs/phase-10/final-review-result.md` |
| Phase 11 手動テスト結果   | `outputs/phase-11/discovered-issues.md`   |

**記載ルール**:

- 未タスクが **0件** でも「検出なし」として必ず出力すること
- **current**（現在の状態）と **baseline**（比較元の期待状態）を分離して記載すること

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
| 次回への引き継ぎ | E2E テスト追加タスクで次回注意すべき点               |

> **注意**: 改善点が **0件** でも「改善点なし」として必ず出力すること。
> 空ファイルまたはテンプレートのみのファイルは不可。

---

### Task 6: Phase 12 タスク仕様準拠チェック

**目的**: 本 Phase の全成果物が Phase 12 のフォーマット要件を充足していることを確認する

**成果物パス**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

**確認項目**:

- [ ] `implementation-guide.md` に Part 1（中学生レベル）と Part 2（技術者レベル）の両方が含まれていること
- [ ] `implementation-guide.md` の Part 1 に例え話が含まれていること
- [ ] `system-spec-update-summary.md` に Step 1-A/1-B/1-C/Step 2 の判定記録があること
- [ ] `documentation-changelog.md` に全 Step の結果が個別セクションで記載されていること
- [ ] `unassigned-task-detection.md` が存在し、0件の場合も「検出なし」として出力されていること
- [ ] `skill-feedback-report.md` が存在し、改善点 0件の場合も「改善点なし」として出力されていること
- [ ] 本ファイル（`phase12-task-spec-compliance-check.md`）がルート証跡として存在すること

---

## 参照資料

| 参照資料                   | パス                                                              | 内容                                        |
| -------------------------- | ----------------------------------------------------------------- | ------------------------------------------- |
| Phase 11 手動テスト結果    | `outputs/phase-11/manual-test-result.md`                          | 手動テスト結果の引き継ぎ                    |
| Phase 11 発見された問題    | `outputs/phase-11/discovered-issues.md`                           | 未タスク検出ソース                          |
| Phase 10 最終レビュー結果  | `outputs/phase-10/final-review-result.md`                         | 未タスク検出ソース                          |
| E2E テスト実装ファイル     | `apps/desktop/e2e/skill-wizard-tracking.spec.ts`                  | 実装ガイド Part 2 の記述参照元              |
| E2E スタブヘルパー         | `apps/desktop/e2e/helpers/wizard-tracking-stub.ts`                | 実装ガイド Part 2 の capture 設計方針参照元 |
| E2E trackEvent スタブ      | `apps/desktop/e2e/helpers/trackEvent.e2e-stub.ts`                 | 実装ガイド Part 2 の差し替え実装参照元      |
| Vite E2E 設定              | `apps/desktop/vite.e2e.config.ts`                                 | 実装ガイド Part 2 の alias 参照元           |
| CI 設定ファイル            | `.github/workflows/ci.yml`                                        | 実装ガイド Part 2 の CI 統合方針参照元      |
| unassigned-task-guidelines | `docs/30-workflows/unassigned-task/unassigned-task-guidelines.md` | 未タスク化ルール                            |

---

## 成果物

| 成果物                          | パス                                                     | 内容                                           |
| ------------------------------- | -------------------------------------------------------- | ---------------------------------------------- |
| 実装ガイド                      | `outputs/phase-12/implementation-guide.md`               | Part 1（中学生レベル）+ Part 2（技術者レベル） |
| システム仕様更新サマリー        | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A/1-B/1-C/Step 2 の判定記録             |
| ドキュメント変更履歴            | `outputs/phase-12/documentation-changelog.md`            | 全 Step の変更前後を個別セクションで記録       |
| 未タスク検出レポート            | `outputs/phase-12/unassigned-task-detection.md`          | current/baseline 分離・0件でも出力必須         |
| スキルフィードバックレポート    | `outputs/phase-12/skill-feedback-report.md`              | 改善点なしでも出力必須                         |
| Phase 12 タスク仕様準拠チェック | `outputs/phase-12/phase12-task-spec-compliance-check.md` | ルート証跡として残す                           |

---

## 完了条件

- [ ] Task 1: `outputs/phase-12/implementation-guide.md` が作成されており、Part 1（中学生レベル）と Part 2（技術者レベル）の両方が含まれていること
- [ ] Task 1 Part 1: 例え話（遠足の出席確認等）が含まれていること
- [ ] Task 1 Part 2: 新規作成ファイル・変更ファイル・テストケース対応表・実行コマンド・CI 統合方針が全て記載されていること
- [ ] Task 2 Step 1-A: 各台帳・仕様書が更新されていること
- [ ] Task 2 Step 1-B: 実装状況テーブルに `completed` ステータスが記録されていること
- [ ] Task 2 Step 1-C: 関連タスクテーブルの current facts が更新されていること
- [ ] Task 3: `outputs/phase-12/documentation-changelog.md` が作成されており、Step 1-A/1-B/1-C/Step 2 が個別セクションで記載されていること
- [ ] Task 4: `outputs/phase-12/unassigned-task-detection.md` が作成されており、0件の場合も「検出なし」として出力されていること。current/baseline が分離されていること
- [ ] Task 5: `outputs/phase-12/skill-feedback-report.md` が作成されており、改善点が0件の場合も「改善点なし」として出力されていること
- [ ] Task 6: `outputs/phase-12/phase12-task-spec-compliance-check.md` が作成されていること
- [ ] 本Phase内の全タスクを100%実行完了

---

## タスク100%実行確認【必須】

- [ ] Task 1（実装ガイド作成）を100%完了し、完了を明記した
- [ ] Task 2 Step 1-A（完了タスク記録）を100%完了し、完了を明記した
- [ ] Task 2 Step 1-B（実装状況テーブル記録）を100%完了し、完了を明記した
- [ ] Task 2 Step 1-C（関連タスクテーブル更新）を100%完了し、完了を明記した
- [ ] Task 3（ドキュメント更新履歴作成）を100%完了し、完了を明記した
- [ ] Task 4（未タスク検出レポート作成）を100%完了し、完了を明記した
- [ ] Task 5（スキルフィードバックレポート作成）を100%完了し、完了を明記した
- [ ] Task 6（Phase 12 タスク仕様準拠チェック）を100%完了し、完了を明記した
- [ ] `outputs/phase-12/` 配下の6ファイルが全て存在することを確認した

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
- Task 2 Step 1-B（ステータス記録）: [結果]
- Task 2 Step 1-C（関連タスクテーブル更新）: [結果]
- Task 2 Step 2（本番インターフェース追加）: N/A（E2E テスト追加タスクのため）
- Task 3（ドキュメント更新履歴作成）: [結果]
- Task 4（未タスク検出レポート作成）: [結果]
- Task 5（スキルフィードバックレポート作成）: [結果]
- Task 6（Phase 12 タスク仕様準拠チェック）: [結果]

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001/phase-13-pr-creation.md`

> **注意**: Phase 13（PR作成）はユーザーの明示的な承認を得てから実施してください。
