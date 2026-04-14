# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 12                                 |
| Phase名    | ドキュメント更新                   |
| 前提Phase  | Phase 11                           |
| 後続Phase  | Phase 13                           |
| ステータス | 未実施                             |
| 作成日     | 2026-04-14                         |
| 機能名     | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 |
| タスク分類 | 改善（NON_VISUAL）                 |

---

## 目的

IPC 4層整合検証 CI スクリプトの実装ガイド作成、システム仕様書同期、未タスク検出、スキルフィードバックを完了し、全ドキュメントを最新状態に同期する。

## 背景

Phase 11 の手動テストが完了した時点で、機能実装・テスト・品質保証・動作確認の全工程が完了している。Phase 12 では、実装成果をドキュメントとして定着させ、後続の開発者が参照可能な状態にする。また、本タスク実行で得られた教訓やワークフロー改善点をフィードバックとして記録する。

---

## Phase 12 記録分離方針

| 区分               | 内容                                                                        |
| ------------------ | --------------------------------------------------------------------------- |
| 実行タスク         | plan であり、Phase 仕様書に記載する                                         |
| Phase 実行記録     | 実行結果であり、Phase 実行記録テンプレートに記載する                        |
| outputs/phase-12/  | current fact であり、成果物として生成する                                   |
| compliance check   | `phase12-task-spec-compliance-check.md` は root evidence として必ず作成する |
| docs-only workflow | Step 1-B の status は `spec_created` とし、`completed` に置き換えない       |

- `index.md` / `artifacts.json` / `outputs/artifacts.json` の 3 点は同 wave で同期し、片側だけ更新しない。

> **注意**: `outputs/phase-12/*.md` に `計画` / `予定` / `TODO` / `PR マージ後` 等の planned wording を残さないこと。全て current fact として記述する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。
>
> **Task / Step 分離ルール**
>
> - このセクションには plan のみを書く。
> - 実行結果、判定、取得値は `Phase実行記録` または `outputs/phase-12/` 配下の成果物へ記録する。

### Task 12-1: 実装ガイド作成【必須・2パート構成】

**目的**: IPC 4層整合検証スクリプトの概念と技術詳細を文書化する

**実行手順**:

#### Part 1: 概念的説明（中学生レベル）

1. 日常生活の例え話で「なぜ IPC 4層検証が必要か」を説明する
   - `たとえば` を最低1回明示する
   - 専門用語は使わない。使う場合は即座に日常語で説明する
2. 「なぜ必要か」→「何をするか」の順序で構成する
3. 図表より文章を優先する

#### Part 2: 技術的詳細（技術者レベル）

1. スクリプト API（エントリポイント、引数、戻り値）を記載する
2. 正規表現パターン（各パーサーが使用するパターンと抽出対象）を一覧化する
3. CI 統合手順（GitHub Actions への組み込み方法、実行コマンド）を記載する
4. エラーメッセージのフォーマットと分類を説明する
5. 既存 `check-ipc-contracts.ts` との共存方式を説明する

| パート | 対象読者       | 内容                                                    |
| ------ | -------------- | ------------------------------------------------------- |
| Part 1 | 初学者・中学生 | 概念的説明（日常の例え話、専門用語なし）                |
| Part 2 | 開発者・技術者 | スクリプトAPI、正規表現パターン、CI統合手順、エラー分類 |

**期待される成果物**:

- 実装ガイド（`outputs/phase-12/implementation-guide.md`）

---

### Task 12-2: システム仕様書更新【必須】

**目的**: システム仕様書にタスク完了記録と実装状況を反映する

**実行手順**:

#### Step 1: タスク完了記録【必須】

| Step | 要件                                                                          | 備考                                           |
| ---- | ----------------------------------------------------------------------------- | ---------------------------------------------- |
| 1-A  | 完了タスク section にタスク記録を追加する（実装ガイドリンク・変更履歴を含む） | タスク完了記録                                 |
| 1-B  | 実装状況テーブルの status を `spec_created` に更新する                        | docs-only workflow のため `completed` にしない |
| 1-C  | 関連タスクテーブルを更新する（`task-workflow.md` を含む）                     | 前後タスクの依存関係を反映                     |

#### Step 2: 条件付き仕様更新

| 条件                                       | 更新対象                                                   |
| ------------------------------------------ | ---------------------------------------------------------- |
| CI ワークフロー定義の追加                  | DevOps / CI 関連仕様の更新                                 |
| IPC 検証ルールの追加                       | IPC 契約監査仕様の更新                                     |
| 新規 interface / type / export なし        | `documentation-changelog.md` に N/A 理由を記録する         |
| contract 変更なし（既存 API への影響なし） | `system-spec-update-summary.md` に変更なしの根拠を記録する |

**期待される成果物**:

- システム仕様更新サマリー（`outputs/phase-12/system-spec-update-summary.md`）

---

### Task 12-3: ドキュメント更新履歴作成【必須】

**目的**: 本タスクで変更・作成した全ドキュメントの更新履歴を記録する

**実行手順**:

1. Phase 12 で変更したファイル一覧を作成する
2. 各ファイルの変更内容（追加 / 更新 / 削除）を記録する
3. validator 実行結果を記録する
4. planned wording の残存有無を確認する

**記録内容**:

- 変更したファイル一覧
- validator 実行結果
- current / baseline の区別
- planned wording の残存有無

**期待される成果物**:

- ドキュメント更新履歴（`outputs/phase-12/documentation-changelog.md`）

---

### Task 12-4: 未タスク検出レポート作成【必須・0件でも出力必須】

**目的**: 本タスク実行で検出された残課題・未タスクを特定し記録する

**実行手順**:

1. 以下のソースから未タスクを検出する:

| Source               | 確認内容                          |
| -------------------- | --------------------------------- |
| Phase 3 review       | MINOR / MAJOR の残課題            |
| Phase 10 review      | 最終レビューで残った blocker      |
| Phase 11 manual test | scope-out / NON_VISUAL findings   |
| codebase             | `TODO` / `FIXME` / `HACK` / `XXX` |

2. 0件でもサマリーを残す
3. 1件以上の場合は formalize path を記録する（指示書作成 → `task-workflow.md` 登録 → 関連仕様書リンク）

**期待される成果物**:

- 未タスク検出レポート（`outputs/phase-12/unassigned-task-detection.md`）

---

### Task 12-5: スキルフィードバックレポート作成【必須・改善点なしでも出力必須】

**目的**: 本タスク実行で得られたワークフロー改善点・技術的教訓を記録する

**実行手順**:

1. 以下の観点でフィードバックを整理する:
   - ワークフロー改善点（Phase 進行で感じた非効率・改善可能な点）
   - 技術的教訓（正規表現パターン設計、CI 統合で得た知見）
   - スキル改善提案（task-specification-creator スキルへの改善提案）
   - 新規 Pitfall 候補（今後のタスクで注意すべき落とし穴）
2. 改善点がなくても `改善点なし` と理由を書く

**期待される成果物**:

- スキルフィードバックレポート（`outputs/phase-12/skill-feedback-report.md`）

---

### Task 12-6: Phase 12 コンプライアンス確認【必須・最終実行】

**目的**: Task 12-1〜12-5 の全成果物が存在し、Phase 12 仕様に準拠していることを確認する

**実行手順**:

1. Task 12-1〜12-5 の成果物が全て存在することを確認する
2. 各成果物に planned wording が残っていないことを確認する
3. Step 1-A〜1-C と Step 2 の実施結果を1ファイルへ束ねる
4. 未充足が1つでもある場合は `PASS` を書かず、`FAIL` または `BLOCKED` とする

**期待される成果物**:

- Phase 12 コンプライアンス確認（`outputs/phase-12/phase12-task-spec-compliance-check.md`）

---

## 並列実行方針

- Task 12-2 の Step 1 を固定した後、Task 12-1 / 12-3 / 12-4 / 12-5 は並列実行可能
- Task 12-2 の Step 2 は Step 1 完了後に実施する
- Task 12-6 は全成果物が揃うまで実行しない

---

## 参照資料

| 参照資料                    | パス                                              | 内容                         |
| --------------------------- | ------------------------------------------------- | ---------------------------- |
| Phase 10 最終レビュー結果   | `outputs/phase-10/final-review-result.md`         | AC 照合・総合判定            |
| Phase 10 是正アクション計画 | `outputs/phase-10/corrective-action-plan.md`      | 是正タスク（該当時）         |
| Phase 10 リリース準備       | `outputs/phase-10/release-readiness-checklist.md` | リリース準備確認             |
| Phase 11 手動テスト結果     | `outputs/phase-11/manual-test-result.md`          | NON_VISUAL 宣言・TC 判定結果 |
| Phase 11 証跡インデックス   | `outputs/phase-11/evidence-index.md`              | 証跡一覧                     |
| Phase 1 要件定義書          | `outputs/phase-1/requirements-definition.md`      | FR-1〜FR-6、NFR-1〜NFR-4     |
| Phase 1 受け入れ基準        | `outputs/phase-1/acceptance-criteria.md`          | AC-1〜AC-8                   |
| Phase 2 アーキテクチャ設計  | `outputs/phase-2/architecture-design.md`          | モジュール構成               |
| Phase 2 CI統合設計          | `outputs/phase-2/ci-integration-design.md`        | GitHub Actions 統合方式      |
| Phase 9 品質レポート        | `outputs/phase-9/quality-report.md`               | 品質ゲート結果               |

### 参照ガイド（task-specification-creator）

> Phase 12 の更新手順と検証基準を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                                            | 内容                    |
| ------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------- |
| 実装ガイド定義            | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`          | Phase 12 チェックリスト |
| 技術ドキュメントガイド    | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md`         | ドキュメント作成方針    |
| システム仕様更新フロー    | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                  | 仕様更新手順            |
| 検証マトリクス            | `.claude/skills/task-specification-creator/references/spec-update-validation-matrix.md`         | 仕様検証基準            |
| Phase 12 詳細テンプレート | `.claude/skills/task-specification-creator/references/phase12-task-spec-compliance-template.md` | コンプライアンス確認    |

---

## 成果物

| 成果物                        | パス                                                     | 内容                             |
| ----------------------------- | -------------------------------------------------------- | -------------------------------- |
| 実装ガイド                    | `outputs/phase-12/implementation-guide.md`               | Part 1（概念）/ Part 2（技術）   |
| システム仕様更新サマリー      | `outputs/phase-12/system-spec-update-summary.md`         | Step 1 / Step 2 の結果           |
| ドキュメント更新履歴          | `outputs/phase-12/documentation-changelog.md`            | 更新ファイル一覧・validator 結果 |
| 未タスク検出レポート          | `outputs/phase-12/unassigned-task-detection.md`          | 検出結果（0件でも必須）          |
| スキルフィードバックレポート  | `outputs/phase-12/skill-feedback-report.md`              | 改善点（なしでも必須）           |
| Phase 12 コンプライアンス確認 | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 全成果物存在・準拠チェック結果   |

---

## 統合テスト連携（Phase 11まで必須）

> Phase 12 はドキュメント更新フェーズであるため、統合テスト連携は Phase 11 までの結果を参照する形で完了している。Phase 12 で新たな統合テストは実施しない。

- Phase 11 の手動テスト結果を `implementation-guide.md` の技術詳細セクションに反映する
- CI 統合手順に Phase 11 で検証した GitHub Actions ワークフロー定義を参照させる

---

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成（6ファイル）
- [ ] Task 12-1: 実装ガイドが Part 1（中学生レベル）と Part 2（技術者レベル）の2パート構成である
- [ ] Task 12-1: Part 1 に `たとえば` を最低1回含む日常の例え話がある
- [ ] Task 12-2: Step 1-A〜1-C の実施結果が記録されている
- [ ] Task 12-2: Step 1-B の status が `spec_created` である（`completed` ではない）
- [ ] Task 12-3: 変更ファイル一覧と validator 結果が記録されている
- [ ] Task 12-4: 未タスク検出結果が記録されている（0件でもサマリー必須）
- [ ] Task 12-5: フィードバックが記録されている（改善点なしでも理由必須）
- [ ] Task 12-6: 全成果物の存在確認と planned wording 残存チェックが完了している
- [ ] `outputs/phase-12/*.md` に `計画` / `予定` / `TODO` / `PR マージ後` が残っていない
- [ ] 本Phase内の全タスクを100%実行完了

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 11 が完了していること
- **後続**: Phase 13 へ進む（ユーザー承認後）

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 12 実行記録

### 実行タスク

- Task 12-1 実装ガイド作成: {{result}}
- Task 12-2 システム仕様書更新: {{result}}
- Task 12-3 ドキュメント更新履歴作成: {{result}}
- Task 12-4 未タスク検出レポート作成: {{result}}
- Task 12-5 スキルフィードバックレポート作成: {{result}}
- Task 12-6 Phase 12 コンプライアンス確認: {{result}}

### 成果物チェック

| 成果物                                | 存在 | planned wording なし |
| ------------------------------------- | ---- | -------------------- |
| implementation-guide.md               | Y/N  | Y/N                  |
| system-spec-update-summary.md         | Y/N  | Y/N                  |
| documentation-changelog.md            | Y/N  | Y/N                  |
| unassigned-task-detection.md          | Y/N  | Y/N                  |
| skill-feedback-report.md              | Y/N  | Y/N                  |
| phase12-task-spec-compliance-check.md | Y/N  | Y/N                  |

### 台帳同期確認

- index.md / artifacts.json / outputs/artifacts.json の同 wave 同期: {{Y/N}}

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

`docs/30-workflows/UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001/phase-13-pr-creation.md`

Phase 13 はユーザーの明示的な承認がない限り実行しない。
