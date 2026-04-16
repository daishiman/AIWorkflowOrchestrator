# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 13                                 |
| Phase名    | PR作成                             |
| 前提Phase  | Phase 12                           |
| 後続Phase  | なし（完了）                       |
| ステータス | blocked                            |
| 作成日     | 2026-04-14                         |
| 機能名     | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 |
| タスク分類 | 改善（NON_VISUAL）                 |

---

## 目的

ユーザーの明示的な承認後に Pull Request を作成し、CI 確認を実施する。承認がない限り本 Phase は実行しない。

## 背景

Phase 12 でドキュメント更新が完了した時点で、IPC 4層整合検証 CI スクリプトの実装・テスト・品質保証・手動テスト・ドキュメントの全工程が完了している。Phase 13 では、これらの成果物を GitHub Pull Request として提出し、CI パイプラインでの最終確認を行う。ただし、commit / push / PR 作成はユーザーの明示的な承認後にのみ実行する。

---

## 実行タスク

> **ユーザーの明示的な承認がない限り、以下のタスクは実行しない。**
>
> **Task / Step 分離ルール**
>
> - このセクションには plan のみを書く。
> - 実行結果、判定、取得値は `Phase実行記録` または `outputs/phase-13/` 配下の成果物へ記録する。

### タスク1: ローカル確認結果の要約

**目的**: PR 作成前にローカル環境での最終確認結果を要約する

**実行手順**:

1. `pnpm typecheck` の最終結果を確認する
2. `pnpm lint` の最終結果を確認する
3. 関連テストの最終実行結果を確認する
4. 変更ファイル一覧を整理する

---

### タスク2: 変更サマリーの整理

**目的**: PR 本文に記載する変更内容を整理する

**実行手順**:

1. 実装した機能の概要をまとめる
2. 変更ファイルと変更内容の対応表を作成する
3. テスト結果のサマリーを作成する
4. 関連 Issue（#2117）との紐づけを確認する

---

### タスク3: PR 作成（ユーザー承認後のみ）

**目的**: GitHub Pull Request を作成し CI 確認を実施する

**実行手順**:

1. ユーザーから PR 作成の明示的な承認を得る
2. 変更をコミットする
3. リモートブランチにプッシュする
4. `gh pr create` で PR を作成する
5. CI パイプラインの実行結果を確認する
6. CI が PASS であることを確認する

---

## 禁止事項

ユーザーの明示的な承認なしに以下の操作を行わないこと:

- `git commit`
- `git push`
- `gh pr create`
- `--no-verify` オプションの使用（承認の有無に関わらず絶対禁止）

---

## 参照資料

| 参照資料                      | パス                                                     | 内容                         |
| ----------------------------- | -------------------------------------------------------- | ---------------------------- |
| Phase 10 最終レビュー結果     | `outputs/phase-10/final-review-result.md`                | AC 照合・総合判定            |
| Phase 11 手動テスト結果       | `outputs/phase-11/manual-test-result.md`                 | NON_VISUAL 宣言・TC 判定結果 |
| Phase 11 証跡インデックス     | `outputs/phase-11/evidence-index.md`                     | 証跡一覧                     |
| Phase 12 実装ガイド           | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2              |
| Phase 12 仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | 仕様同期結果                 |
| Phase 12 ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`            | 更新ファイル一覧             |
| Phase 12 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md`          | 残課題                       |
| Phase 12 フィードバック       | `outputs/phase-12/skill-feedback-report.md`              | ワークフロー改善点           |
| Phase 12 コンプライアンス     | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 準拠チェック結果             |

---

## 成果物

| 成果物       | パス                          | 内容                           |
| ------------ | ----------------------------- | ------------------------------ |
| PR 情報      | `outputs/phase-13/pr-info.md` | 条件: ユーザー承認後のみ作成可 |
| Pull Request | GitHub Pull Request           | 条件: ユーザー承認後のみ作成可 |

---

## 完了条件

- [ ] ローカル確認結果（typecheck / lint / test）を記録した
- [ ] 変更サマリーを記録した
- [ ] ユーザーの明示的な承認なしに commit / push / PR を実行していない
- [ ] （承認後）PR が作成され CI が PASS している
- [ ] 本Phase内の全タスクを100%実行完了（blocked gate を含む）

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] ユーザーの許可なしに commit / push / PR を実行していない

---

## 依存関係

- **前提**: Phase 12 が完了していること + ユーザーの明示的な承認
- **後続**: なし（本タスク完了）

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 13 実行記録

### 実行タスク

- タスク1 ローカル確認結果の要約: {{result}}
- タスク2 変更サマリーの整理: {{result}}
- タスク3 PR作成: {{blocked / result}}

### PR情報（承認後のみ）

- PR URL: {{URL or blocked}}
- CI結果: {{PASS / FAIL / blocked}}
- マージ状態: {{merged / open / blocked}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:
```

---

## タスク完了

Phase 13 は **blocked**。ユーザーの明示的な承認後にのみ PR 作成へ進む。
