# UT-IMP-PHASE12-WORKFLOW10-COMPLIANCE-FIX-001 - Workflow10 Phase 7/12 準拠不足是正タスク

## メタ情報

```yaml
issue_number: 1049
```

## メタ情報

| 項目         | 内容                                                                           |
| ------------ | ------------------------------------------------------------------------------ |
| タスクID     | UT-IMP-PHASE12-WORKFLOW10-COMPLIANCE-FIX-001                                   |
| タスク名     | Workflow10（IPC Handler Graceful Degradation）の Phase 7/12 仕様準拠不足を是正 |
| 分類         | 改善（ドキュメント補完）                                                       |
| 対象機能     | IPC Handler の graceful degradation パターン                                   |
| 優先度       | 高                                                                             |
| 見積もり規模 | 小規模                                                                         |
| ステータス   | 未実施                                                                         |
| 発見元       | 2026-03-07 branch横断 Phase 12 再監査                                          |
| 発見日       | 2026-03-07                                                                     |
| 依存タスク   | 10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001                               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001` は IPC ハンドラが例外で停止した場合の graceful degradation を実装するタスクだが、branch横断 Phase 12 再監査で以下の不足が検出された：

- Phase 7（カバレッジ確認）に `統合テスト連携` セクションが欠落
- Phase 12 の `implementation-guide.md`（Part 1: 中学生レベル概念説明 / Part 2: 技術詳細）が未作成

### 1.2 問題点

- `validate-phase-output` スクリプトが Phase 7 で FAIL する
- `validate-phase12-implementation-guide` スクリプトが Phase 12 で FAIL する
- 仕様書準拠の品質基準を満たしていない

### 1.3 放置した場合の影響

- 他の開発者がこのワークフローを参照した際、Phase 7/12 のテンプレート構造が不明確で再利用できない
- Phase 12 実装ガイドがないため、IPC graceful degradation の設計思想が失われる

---

## 2. 何を達成するか（What）

### 2.1 目的

Workflow10 の Phase 7 と Phase 12 を仕様テンプレートに準拠させ、validator PASS にする。

### 2.2 スコープ

#### 含むもの

- Phase 7 `phase-7-coverage-check.md` への `統合テスト連携` セクション追加
- Phase 12 `outputs/phase-12/implementation-guide.md` の Part 1/Part 2 作成
- Phase 12 必須成果物5点（implementation-guide / documentation-changelog / unassigned-task-report / skill-feedback-report / unassigned-task-detection）の存在確認と補完
- `artifacts.json` の Phase 12 ステータス更新

#### 含まないもの

- IPC Handler の実装コード変更
- 他ワークフローの修正

### 2.3 成果物

- 修正された `phase-7-coverage-check.md`
- 新規 `outputs/phase-12/implementation-guide.md`
- Phase 12 必須成果物5点
- 更新された `artifacts.json`

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-specification-creator` の Phase テンプレート（`references/phase-templates.md`）を参照可能であること
- IPC Handler graceful degradation の設計意図を Phase 1-2 仕様書から読み取れること

### 3.2 推奨アプローチ

1. Phase 1-2 の設計仕様書を読んで IPC graceful degradation の概要を理解
2. Phase 7 テンプレートに `統合テスト連携` セクションを追加
3. Phase 12 実装ガイド Part 1: 「レストランの厨房」例え（IPC ハンドラ = 料理人、graceful degradation = 料理人が倒れても他の料理人が代わりに対応）
4. Phase 12 実装ガイド Part 2: 型定義、エラーハンドリングAPI、使用例、エッジケース

### 3.3 実装時の苦戦箇所と解決策（親タスクからの教訓）

| #   | 課題                                                             | 発見経緯                                             | 解決策                                                                     | 教訓（標準ルール）                                                            |
| --- | ---------------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1   | 単一workflowのPASS判定で branch全体を完了とみなす                | workflow 07 のみ検証して 10/11/12 の不足を見落とした | `git status --short` で変更中workflow一覧を抽出し全workflowへ一括監査実行  | Phase 12 完了判定は current + 同時変更 workflow をセットで監査する            |
| 2   | Phase 7 の `統合テスト連携` セクションが必須であることの認識不足 | `validate-phase-output` が FAIL して初めて判明       | Phase テンプレート（`phase-templates.md`）の必須セクション一覧を事前確認   | 新規ワークフロー作成時は validator を先に実行してテンプレート準拠を確認する   |
| 3   | 実装ガイド Part 1 の「日常例え」が形骸化しやすい                 | 過去タスクで Part 1 が技術用語だらけになった         | 「中学生が読んで理解できるか」を判定基準にし、専門用語は必ず日常例えで補足 | Part 1 は技術用語禁止ではないが、必ず日常例えを先に書いてから技術説明を加える |

---

## 4. 実行手順

### Phase 1: 現状確認

1. `docs/30-workflows/10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001/` の全 Phase を Read
2. `validate-phase-output` を実行し、FAIL 箇所を特定

### Phase 2: Phase 7 修正

1. `phase-7-coverage-check.md` に `## 統合テスト連携` セクションを追加
2. テスト連携ポイントを記述（単体テスト <-> 統合テスト <-> E2E の境界）

### Phase 3: Phase 12 実装ガイド作成

1. `outputs/phase-12/implementation-guide.md` を Part 1/Part 2 構成で作成
2. Part 1: IPC graceful degradation を「レストランの厨房」で例える
3. Part 2: 型定義、API仕様、使用例、エッジケース、定数一覧

### Phase 4: Phase 12 成果物補完

1. 必須5点（implementation-guide / documentation-changelog / unassigned-task-report / skill-feedback-report / unassigned-task-detection）の存在確認
2. 欠落している成果物を作成
3. `artifacts.json` を更新

### Phase 5: 検証

1. `validate-phase-output` と `validate-phase12-implementation-guide` を実行
2. 両方 PASS を確認

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Phase 7 に `統合テスト連携` セクションが追加されている
- [ ] Phase 12 `implementation-guide.md` が Part 1/Part 2 構成で作成されている
- [ ] Part 1 に日常例え（中学生レベル）が含まれている
- [ ] Phase 12 必須成果物5点が全て存在している

### 品質要件

- [ ] `validate-phase-output` が PASS
- [ ] `validate-phase12-implementation-guide` が PASS
- [ ] `artifacts.json` の Phase 12 ステータスが更新されている

### ドキュメント要件

- [ ] `documentation-changelog.md` に変更内容が記録されている

---

## 6. 検証方法

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001
```

---

## 7. リスクと対策

| リスク                                    | 影響度 | 発生確率 | 対策                                                       |
| ----------------------------------------- | ------ | -------- | ---------------------------------------------------------- |
| IPC graceful degradation の設計意図を誤解 | 中     | 低       | Phase 1-2 の設計仕様書を必ず読んでから執筆                 |
| Part 1 の日常例えが不適切                 | 低     | 中       | 既存の実装ガイド（workflow 07/09）を参照パターンとして活用 |
| Phase 12 成果物の命名ドリフト             | 低     | 中       | `artifacts.json` との二重突合で命名統一                    |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001/` -- 対象ワークフロー
- `.claude/skills/task-specification-creator/references/phase-templates.md` -- Phase テンプレート
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md` -- 仕様更新手順

### システム仕様書参照

- `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` -- IPC セキュリティ原則
- `.claude/skills/aiworkflow-requirements/references/error-handling.md` -- エラーハンドリングパターン
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` -- branch横断再監査の教訓（TASK-PHASE12-BRANCH-CROSS-AUDIT）
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md` -- 完了タスク・残課題テーブル

### 既知の落とし穴

- `.claude/rules/06-known-pitfalls.md` -- P5（リスナー二重登録）、P42（.trim()バリデーション漏れ）

---

## 9. 備考

### 実装方針

- コード変更なし、ドキュメント補完のみのタスク
- IPC graceful degradation の Part 1 は「レストランの厨房で料理人が急に倒れた時」の例えで開始
- 既存 workflow 07（persist iterable hardening）の implementation-guide を構造参考にする
