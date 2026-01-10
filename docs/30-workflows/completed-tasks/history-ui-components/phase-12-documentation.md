# Phase 12: ドキュメント更新 & スキル改善

## メタ情報

| 項目   | 値                    |
| ------ | --------------------- |
| Phase  | 12                    |
| 機能名 | history-ui-components |
| 作成日 | 2026-01-10            |

## 目的

Phase 12では以下の4つの必須作業を行う:

1. **実装ガイド作成**: 概念的説明と技術的詳細のドキュメント化
2. **システムドキュメント更新**: 既存ドキュメントへの反映
3. **未タスク検出**: 技術的負債の可視化と継続的改善
4. **スキルフィードバック・改善・新規作成**: skill-creatorによる継続的スキル改善

## 使用スキル

| スキル                             | 選定理由                       |
| ---------------------------------- | ------------------------------ |
| `api-documentation-best-practices` | API/コンポーネントドキュメント |
| `knowledge-management`             | 知識の形式化と共有             |

---

## Phase 12-1: 実装ガイド作成

実装した内容を「概念的な説明」と「技術的な詳細」の両面からドキュメント化する。

### ドキュメント要件

| セクション         | 必須 | 内容                                     |
| ------------------ | ---- | ---------------------------------------- |
| 概念的な説明       | ✅   | 中学生にもわかる比喩・例え話を使った説明 |
| 全体アーキテクチャ | ✅   | ASCII図解付きのレイヤー構造説明          |
| データベース設計   | 条件 | テーブル定義 + なぜこの設計にしたか      |
| 各層の実装詳細     | ✅   | コード例 + 設計意図の説明                |
| 用語集             | ✅   | 専門用語の読み方・意味・コンテキスト     |

### 記述原則

1. **Why-first（なぜ優先）**: 「何をしたか」より「なぜそうしたか」を重視
2. **対比説明**: 「悪い例」と「良い例」を並べて違いを明確化
3. **図解活用**: ASCII図でアーキテクチャ・データフロー・関係性を可視化
4. **コード注釈**: コードスニペットには必ず日本語コメントで意図を補足
5. **読み方併記**: 英語の専門用語にはカタカナ読みを付記

### 作成ドキュメント一覧

#### 1. コンポーネントドキュメント

| ドキュメント   | 内容                              |
| -------------- | --------------------------------- |
| VersionHistory | Props、使用例、注意事項           |
| VersionDetail  | Props、使用例、注意事項           |
| ConversionLogs | Props、使用例、フィルタオプション |
| RestoreDialog  | Props、使用例、コールバック       |

#### 2. フックドキュメント

| ドキュメント      | 内容                       |
| ----------------- | -------------------------- |
| useVersionHistory | 引数、戻り値、使用例       |
| useVersionDetail  | 引数、戻り値、使用例       |
| useConversionLogs | オプション、戻り値、使用例 |
| useRestore        | 戻り値、エラーハンドリング |

#### 3. 統合ガイド

| ドキュメント       | 内容                                  |
| ------------------ | ------------------------------------- |
| IPC通信設計        | チャンネル定義、リクエスト/レスポンス |
| データフロー       | Renderer→IPC→Service→DB の流れ        |
| エラーハンドリング | エラー種別と対応方法                  |

---

## Phase 12-2: システムドキュメント更新

### 更新対象

- `docs/00-requirements/` 配下
- `.claude/skills/aiworkflow-requirements/references/`

### 更新原則

- 概要のみ記載
- Single Source of Truth遵守
- 詳細は実装ガイドを参照

### 統合に関するドキュメント整備

| ドキュメント        | 内容                              |
| ------------------- | --------------------------------- |
| IPC APIリファレンス | history:getFileHistory等のAPI仕様 |
| エラーコード一覧    | IPC通信で発生しうるエラーと対処法 |
| テストガイド        | 統合テストの実行方法と拡張方法    |

---

## Phase 12-3: 未タスク検出

### 検出ソース

| ソース                 | 確認項目                      | Grepパターン例                                      |
| ---------------------- | ----------------------------- | --------------------------------------------------- |
| Phase 3レビュー結果    | MINOR判定の指摘事項           | `outputs/phase-3/`                                  |
| Phase 9レビュー結果    | MINOR判定の指摘事項           | `outputs/phase-9/`                                  |
| Phase 11手動テスト結果 | スコープ外の発見事項          | `outputs/phase-11/`                                 |
| 各Phase成果物          | 「将来対応」「TODO」「FIXME」 | `grep -r "TODO\|FIXME\|将来対応" outputs/`          |
| コードベース           | TODO/FIXME/HACK/XXXコメント   | `grep -rn "TODO\|FIXME\|HACK\|XXX" packages/ apps/` |
| スキルLOGS.md          | partial/failure記録           | 各使用スキルのLOGS.md                               |

### 出力

検出された未タスクは `docs/30-workflows/unassigned-task/` に指示書を作成する。

---

## Phase 12-4: スキルフィードバック・改善・新規作成【必須】

**skill-creator**を使用して、ワークフロー実行中に使用したスキルのフィードバックを記録・改善し、必要に応じて新規スキルを作成する。

### 12-4-1: フィードバック収集

各Phaseで使用したスキルの実行結果を評価し記録する。

```bash
# フィードバック記録
node .claude/skills/task-specification-creator/scripts/log_usage.mjs \
  --skill {{SKILL_NAME}} --result {{success|failure|partial}} --phase {{PHASE_NUMBER}}
```

### 12-4-2: 既存スキル改善判定

skill-creatorで改善必要性を判定し、必要な場合は更新する。

```bash
# スキル更新（必要な場合）
node .claude/skills/skill-creator/scripts/detect_mode.mjs \
  --request "スキルを更新" --skill-path .claude/skills/{{SKILL_NAME}}
```

### 12-4-3: 新規スキル必要性判定【重要】

ワークフロー実行中に以下の状況が発生した場合、**新規スキル作成**を検討する:

| 検出条件           | 新規スキル作成の判断基準                     |
| ------------------ | -------------------------------------------- |
| 手動作業の繰り返し | 同じ手順を3回以上手動で実行した              |
| 既存スキル不在     | 必要なスキルが見つからず自前で対応した       |
| スキルの責務超過   | 1つのスキルに複数責務を詰め込んだ            |
| ドメイン知識の欠落 | 特定ドメインの専門知識が必要だった           |
| 再利用性の発見     | 他タスクでも使える汎用的な処理パターンを発見 |

### 12-4-4: 新規スキル作成

新規スキルが必要と判定された場合、skill-creatorの**createモード**で作成する。

```bash
# 新規スキル作成
node .claude/skills/skill-creator/scripts/detect_mode.mjs \
  --request "{{NEW_SKILL_DESCRIPTION}}"

# 作成後の検証
node .claude/skills/skill-creator/scripts/validate_all.mjs \
  .claude/skills/{{NEW_SKILL_NAME}}

# スキルリスト更新
node .claude/skills/skill-creator/scripts/update_skill_list.mjs \
  --skill-path .claude/skills/{{NEW_SKILL_NAME}}
```

---

## 実行手順

### ステップ1: JSDoc/TSDocの整備

各コンポーネント・フックに以下を追記：

````typescript
/**
 * 履歴一覧を表示するコンポーネント
 *
 * @param props - コンポーネントProps
 * @param props.fileId - 対象ファイルのID
 * @param props.onVersionSelect - バージョン選択時のコールバック
 * @param props.onRestore - 復元ボタンクリック時のコールバック
 *
 * @example
 * ```tsx
 * <VersionHistory
 *   fileId="file-123"
 *   onVersionSelect={(item) => console.log(item)}
 *   onRestore={(item) => handleRestore(item)}
 * />
 * ```
 */
export const VersionHistory: React.FC<VersionHistoryProps> = (props) => {
  // ...
};
````

### ステップ2: README更新

`apps/desktop/src/renderer/components/history/README.md` を作成・更新：

- コンポーネント一覧
- 使用方法
- Props一覧
- 依存関係

### ステップ3: CHANGELOG更新

プロジェクトのCHANGELOGに以下を追記：

```markdown
## [Unreleased]

### Added

- 履歴/ログ表示UIコンポーネント (CONV-05-03)
  - VersionHistory: 履歴一覧表示
  - VersionDetail: バージョン詳細表示
  - ConversionLogs: 変換ログ表示
  - RestoreDialog: 復元確認ダイアログ
```

### ステップ4: 未タスク検出

```bash
# TODO/FIXMEの検出
grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/renderer/components/history/
grep -rn "TODO\|FIXME\|将来対応" docs/30-workflows/history-ui-components/outputs/
```

### ステップ5: スキルフィードバック記録

ワークフローで使用した全スキルのフィードバックを記録する。

---

## 統合テスト連携【必須】

統合に関するドキュメント整備:

| ドキュメント        | 内容                              |
| ------------------- | --------------------------------- |
| IPC APIリファレンス | history:getFileHistory等のAPI仕様 |
| エラーコード一覧    | IPC通信で発生しうるエラーと対処法 |
| テストガイド        | 統合テストの実行方法と拡張方法    |

---

## 成果物

| 成果物                   | パス                                                     | 説明               |
| ------------------------ | -------------------------------------------------------- | ------------------ |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`               | 概念+技術詳細      |
| コンポーネントREADME     | `apps/desktop/src/renderer/components/history/README.md` | 使用ガイド         |
| フックドキュメント       | `outputs/phase-12/hooks-documentation.md`                | フック仕様         |
| 統合ガイド               | `outputs/phase-12/integration-guide.md`                  | 統合方法           |
| API仕様書                | `outputs/phase-12/api-specification.md`                  | IPC API仕様        |
| ドキュメント更新記録     | `outputs/phase-12/documentation-update-log.md`           | 更新履歴           |
| 未タスク検出レポート     | `outputs/phase-12/unassigned-task-report.md`             | 検出された未タスク |
| スキルフィードバック     | `outputs/phase-12/skill-feedback-report.md`              | スキル評価結果     |
| 未タスク指示書（該当時） | `docs/30-workflows/unassigned-task/`                     | 検出された場合     |

---

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明 + Part 2: 技術的詳細）が作成されている
- [ ] 全コンポーネントにJSDoc/TSDocが付与されている
- [ ] README.mdが作成されている
- [ ] CHANGELOGが更新されている
- [ ] 統合ガイドが作成されている
- [ ] API仕様書が作成されている
- [ ] ドキュメント更新記録が出力されている
- [ ] 未タスク検出レポートが出力されている
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] **スキルフィードバックがskill-creatorで記録されている**【必須】
- [ ] スキル改善/新規作成が必要な場合、skill-creatorで実行されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実装ガイド作成（概念的説明）
3. 実装ガイド作成（技術的詳細）
4. JSDoc/TSDocの整備
5. コンポーネントREADME作成
6. フックドキュメント作成
7. 統合ガイド作成
8. API仕様書作成
9. CHANGELOG更新
10. システムドキュメント更新
11. 未タスク検出
12. スキルフィードバック記録
13. スキル改善/新規作成判定

---

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各スキルの成果物が生成されている
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/history-ui-components --phase 12
```

---

## 次のPhase

Phase 13: PR作成
