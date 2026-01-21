# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 13                           |
| Phase名    | PR作成                       |
| 前提Phase  | Phase 12（ドキュメント更新） |
| 後続Phase  | なし                         |
| ステータス | 未実施                       |
| 作成日     | 2026-01-18                   |
| 機能名     | fr011-file-type-icons        |

---

## 目的

変更をコミットし、ユーザーの明示的な許可を得た上でPull Requestを作成し、CI結果を確認する。

## 背景

変更内容をレビュー可能にするため、PR作成とCI確認の手順が必要である。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ローカル動作確認の依頼

**目的**: ユーザーにローカル確認を依頼する

**実行手順**:

1. 変更内容のサマリーを整理
2. ユーザーにローカル確認を依頼

**期待される成果物**:

- `outputs/phase-13/pr-info.md`

---

### タスク2: PR作成許可の確認

**目的**: PR作成前にユーザーの明示的な許可を取得する

**実行手順**:

1. 変更内容のサマリーを提示
2. PR作成の許可を取得

**期待される成果物**:

- `outputs/phase-13/pr-info.md`

---

### タスク3: PR作成とCI確認

**目的**: PR作成後にCI結果を確認する

**実行手順**:

1. ユーザー許可後に `/ai:diff-to-pr` を実行
2. PR URLとCI結果を `outputs/phase-13/pr-info.md` に記載

**期待される成果物**:

- `outputs/phase-13/pr-info.md`

---

## ローカル確認チェックリスト（PR作成前に必須）

| #   | 確認項目             | コマンド例            |
| --- | -------------------- | --------------------- |
| 1   | ビルドが成功する     | `pnpm build`          |
| 2   | 全テストがパスする   | `pnpm test`           |
| 3   | 型チェックがパスする | `pnpm typecheck`      |
| 4   | Lintエラーがない     | `pnpm lint`           |
| 5   | 実際の動作確認       | `pnpm dev` で手動確認 |

---

## PR作成に関する重要な注意

- ユーザーの明示的な許可が得られるまで `/ai:diff-to-pr` を実行しない
- PR作成前にローカル確認チェックリストを完了する

---

## フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLIで手動対応する。

---

## タスク完了処理【必須】

PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。

```bash
mv docs/30-workflows/fr011-file-type-icons/ docs/30-workflows/completed-tasks/
ls docs/30-workflows/completed-tasks/ | grep fr011-file-type-icons

git add docs/30-workflows/
git commit -m "docs(workflows): fr011-file-type-iconsをcompleted-tasksに移動"
```

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                       | 内容           |
| ---------------------- | -------------------------------------------------------------------------- | -------------- |
| タスクワークフロー     | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`       | PR作成フロー   |
| タスクワークフロー規約 | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md` | 完了処理ルール |

### Phase 12 成果物

| 参照資料     | パス                                           | 内容       |
| ------------ | ---------------------------------------------- | ---------- |
| 実装ガイド   | `outputs/phase-12/implementation-guide.md`     | 実装ガイド |
| 更新履歴     | `outputs/phase-12/documentation-update-log.md` | 更新履歴   |
| 未タスク検出 | `outputs/phase-12/unassigned-task-report.md`   | 検出結果   |

### 参照Phase一覧

| 参照資料            | パス                                         | 内容           |
| ------------------- | -------------------------------------------- | -------------- |
| Phase 1 要件        | `outputs/phase-1/requirements-definition.md` | 要件定義       |
| Phase 2 設計        | `outputs/phase-2/architecture-design.md`     | 設計資料       |
| Phase 5 実装        | `apps/desktop/src/renderer/components/`      | 実装コード     |
| Phase 6 テスト拡充  | `outputs/phase-6/coverage-report.md`         | カバレッジ     |
| Phase 7 カバレッジ  | `outputs/phase-7/coverage-report.md`         | 再測定結果     |
| Phase 8 リファクタ  | `outputs/phase-8/refactor-log.md`            | リファクタ記録 |
| Phase 9 品質        | `outputs/phase-9/quality-report.md`          | 品質結果       |
| Phase 10 レビュー   | `outputs/phase-10/final-review-result.md`    | 判定結果       |
| Phase 11 手動テスト | `outputs/phase-11/manual-test-result.md`     | 手動テスト結果 |

---

## 成果物

| 成果物 | パス                          | 内容           |
| ------ | ----------------------------- | -------------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URLとCI結果 |

---

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] PR作成の許可を得ている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] PR情報が記録されている
- [ ] タスクディレクトリがcompleted-tasksに移動されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 成果物の作成・配置
4. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/fr011-file-type-icons --phase 13
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 13 実行記録

### 実行タスク

| タスク  | 結果        | 備考 |
| ------- | ----------- | ---- |
| タスク1 | 完了/未完了 |      |
| タスク2 | 完了/未完了 |      |
| タスク3 | 完了/未完了 |      |

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-
```

## 依存関係

- **前提**: Phase 1、Phase 2、Phase 5、Phase 6、Phase 7、Phase 8、Phase 9、Phase 10、Phase 11、Phase 12の成果物
- **後続**: なし（完了）

---

## 次のPhase

なし（ワークフロー完了）
