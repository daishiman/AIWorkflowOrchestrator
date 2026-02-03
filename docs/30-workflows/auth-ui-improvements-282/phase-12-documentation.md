# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                       |
| ------ | ------------------------ |
| Phase  | 12                       |
| 機能名 | auth-ui-improvements-282 |
| 作成日 | 2026-02-04               |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

---

## 実行タスク

### Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

#### Part 1 要件（中学生レベル）

- 日常生活での例え話を**必ず**含める
- 専門用語は使わない（使う場合は即座に説明）
- 「なぜ必要か」を先に説明してから「何をするか」を説明

#### Part 2 要件（技術者レベル）

- 変更したファイルと変更内容の一覧
- エラーパターンとフォールバック条件
- 状態更新フローの詳細
- テストコード例

---

### Task 2: システムドキュメント更新【必須】

#### Step 1: タスク完了記録【必須・全タスク】

| 確認項目                                   | ファイル                           | 完了 |
| ------------------------------------------ | ---------------------------------- | ---- |
| 「完了タスク」セクション追加               | 関連する仕様書                     | -    |
| 関連ドキュメントセクションにリンク追加     | 関連する仕様書                     | -    |
| 変更履歴セクションにバージョン追記         | 関連する仕様書                     | -    |
| タスク完了エントリ追加                     | aiworkflow-requirements/LOGS.md    | -    |
| タスク完了記録追加                         | task-specification-creator/LOGS.md | -    |
| 新規セクションエントリ追加（該当する場合） | topic-map.md                       | -    |

#### Step 1-B: 実装状況テーブル更新

本タスクはバグ修正のため、以下のファイルでの更新確認:

| ファイル                 | 確認内容                   | 更新要否 |
| ------------------------ | -------------------------- | -------- |
| error-handling.md        | フォールバックパターン追加 | 判断     |
| arch-state-management.md | authSlice更新パターン記載  | 判断     |
| ui-ux-components.md      | z-index階層定義            | 判断     |

#### Step 2: システム仕様更新【条件付き】

本タスクはバグ修正のため、新規インターフェース追加なし:

| 更新判断 | 理由                           |
| -------- | ------------------------------ |
| 不要     | 既存インターフェースの修正のみ |
| 不要     | 新規型定義の追加なし           |
| 不要     | 新規定数・設定値の追加なし     |

→ **documentation-changelog.mdに「更新なし」と理由を明記**

---

### Task 3: ドキュメント更新履歴 & artifacts.json更新【必須】

```bash
# Step 1: ドキュメント更新履歴生成
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js --workflow docs/30-workflows/auth-ui-improvements-282

# Step 2: Phase 12完了登録（artifacts.json更新）
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/auth-ui-improvements-282 \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート"
```

---

### Task 4: 未タスク検出【必須】

#### 検出ソース

| #   | ソース                 | 確認項目                      |
| --- | ---------------------- | ----------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   |

#### 検出コマンド

```bash
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --scan apps/desktop/src \
  --output .tmp/unassigned-candidates.json
```

#### 検出結果テンプレート

| 検出元             | 内容                         | 未タスク化要否 |
| ------------------ | ---------------------------- | -------------- |
| Phase 3レビュー    | （MINOR指摘があれば記載）    | -              |
| Phase 10レビュー   | （MINOR指摘があれば記載）    | -              |
| Phase 11手動テスト | （スコープ外発見あれば記載） | -              |
| コードコメント     | （TODO/FIXME等あれば記載）   | -              |

**検出結果が0件の場合も、「検出なし」としてレポートを出力する。**

---

## 成果物

| 成果物               | パス                                            | 必須 | 説明                      |
| -------------------- | ----------------------------------------------- | ---- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | ✅   | 概念的+技術的ドキュメント |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | ✅   | 更新履歴                  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | ✅   | 検出結果（なしでも出力）  |
| 未完了タスク指示書   | `docs/30-workflows/unassigned-task/*.md`        | 条件 | 検出時のみ作成            |

---

## 参照資料

| 資料名                 | パス                                                                  | 説明             |
| ---------------------- | --------------------------------------------------------------------- | ---------------- |
| Phase 11成果物         | `outputs/phase-11/`                                                   | 手動テスト結果   |
| 仕様更新フロー         | `task-specification-creator: spec-update-workflow.md`                 | 更新手順         |
| 未タスクガイドライン   | `task-specification-creator: unassigned-task-guidelines.md`           | 未タスク作成指針 |
| 実装ガイドテンプレート | `task-specification-creator: assets/implementation-guide-template.md` | テンプレート     |

---

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] **【Task 2 Step 1】タスク完了記録が追加されている**
- [ ] **【Task 2 Step 1】aiworkflow-requirements/LOGS.mdが更新されている**
- [ ] **【Task 2 Step 1】task-specification-creator/LOGS.mdが更新されている**
- [ ] **【Task 2 Step 2】システム仕様更新の要否を判断し記録している**
- [ ] **【Task 3】documentation-changelog.mdが作成されている**
- [ ] **【Task 3】artifacts.jsonが更新されている**
- [ ] **【Task 4】未タスク検出レポートが出力されている**
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 13: PR作成
