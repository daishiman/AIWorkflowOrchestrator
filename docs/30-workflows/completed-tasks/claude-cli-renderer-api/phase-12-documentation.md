# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 12                      |
| Phase名    | ドキュメント更新        |
| 前提Phase  | Phase 11                |
| 後続Phase  | Phase 13                |
| ステータス | 未実施                  |
| 作成日     | 2026-01-17              |
| 機能名     | claude-cli-renderer-api |

---

## 目的

実装ガイド・ドキュメントを更新し、未完了タスクを検出してタスク指示書を作成する。

## 背景

Phase 12は文書化フェーズ。実装内容をドキュメントに反映し、残課題を検出して次のタスクへ引き継ぐ。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 実装ガイドの作成

**目的**: Claude CLI Renderer APIの実装ガイドを作成する（2パート構成）

**実行手順**:

1. `outputs/phase-12/implementation-guide.md`を作成する
2. **Part 1: 概念的説明**（初学者・非技術者向け）
   - Claude CLI Renderer APIとは何か
   - なぜこのAPIが必要なのか
   - どのように使用するのか（概念レベル）
3. **Part 2: 技術的詳細**（開発者向け）
   - APIリファレンス（各メソッドの詳細）
   - 使用例（コードサンプル）
   - エラーハンドリング
   - セキュリティ考慮事項

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`（実装ガイド）

---

### タスク2: ドキュメント更新履歴の作成

**目的**: 本タスクで作成・更新したドキュメントの一覧を作成する

**実行手順**:

1. `outputs/phase-12/documentation-changelog.md`を作成する
2. 以下の情報を記録する:
   - 作成したファイル一覧
   - 更新したファイル一覧
   - 各ファイルの変更概要

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`（ドキュメント更新履歴）

---

### タスク3: 未タスク検出レポートの作成

**目的**: FAILテスト、重要度「高」課題、残課題を検出してレポートを作成する

**実行手順**:

1. Phase 11の結果を確認する:
   - `outputs/phase-11/manual-test-result.md`からFAILしたテストを抽出
   - `outputs/phase-11/discovered-issues.md`から重要度「高」の課題を抽出
2. コードベースからTODO/FIXMEコメントを検出する:
   ```bash
   grep -rn "TODO\|FIXME" apps/desktop/src/preload/ --include="*.ts"
   ```
3. `outputs/phase-12/unassigned-task-report.md`を作成する:

```markdown
## 検出結果サマリー

| ソース             | 検出数  |
| ------------------ | ------- |
| テスト結果         | X件     |
| 発見課題           | X件     |
| TODO/FIXMEコメント | X件     |
| **合計**           | **X件** |

## 検出タスク一覧

### テスト結果からの検出

（FAILしたテストがあれば記載、なければ「検出タスクなし」）

### 発見課題からの検出

（重要度「高」の課題があれば記載、なければ「検出タスクなし」）

### TODO/FIXMEからの検出

（TODO/FIXMEコメントがあれば記載、なければ「検出タスクなし」）
```

4. **検出タスクが0件の場合も「検出タスクなし」と明記する**

**期待される成果物**:

- `outputs/phase-12/unassigned-task-report.md`（未タスク検出レポート）

---

### タスク4: システム仕様書の更新確認

**目的**: aiworkflow-requirementsの更新が必要か判断し、必要に応じて更新する

**実行手順**:

1. 以下の基準で更新要否を判断する:
   - **更新が必要な場合**:
     - 新規インターフェース/型追加
     - 既存インターフェース変更
     - 新規定数/設定値追加
     - 外部連携インターフェース追加
   - **更新が不要な場合**:
     - 内部実装の詳細変更のみ
     - リファクタリング（インターフェース不変）
     - バグ修正（仕様変更なし）
     - テスト追加のみ
2. 本タスクでは、Claude CLI Renderer APIはPhase 5で実装済みであり、新規インターフェース追加ではないため、**更新不要**と判断
3. 判断結果を`outputs/phase-12/spec-update-decision.md`に記録する

**期待される成果物**:

- `outputs/phase-12/spec-update-decision.md`（仕様書更新判断）

---

### タスク5: タスク完了ステータスの更新

**目的**: 元のタスク指示書のステータスを更新する

**実行手順**:

1. `docs/30-workflows/unassigned-task/task-claude-cli-renderer-api.md`のステータスを「完了」に更新する
2. 完了日を記録する
3. 完了の根拠を記載する

**期待される成果物**:

- 更新済みタスク指示書

---

## 参照資料

| 参照資料       | パス                                                                           | 内容           |
| -------------- | ------------------------------------------------------------------------------ | -------------- |
| Phase 11結果   | `outputs/phase-11/`                                                            | 手動テスト結果 |
| 元タスク指示書 | `docs/30-workflows/unassigned-task/task-claude-cli-renderer-api.md`            | 元の指摘内容   |
| 仕様更新フロー | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 更新判断基準   |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容                   |
| ---------------------- | ---------------------------------------------------------------------------- | ---------------------- |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | Claude CLI連携パターン |

---

## 成果物

| 成果物               | パス                                          | 内容             |
| -------------------- | --------------------------------------------- | ---------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`    | 2パート構成      |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md` | 変更ファイル一覧 |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`  | 残課題検出結果   |
| 仕様書更新判断       | `outputs/phase-12/spec-update-decision.md`    | 更新要否の判断   |

---

## 統合テスト連携（Phase 1〜11は必須）

本Phaseは文書化フェーズのため、統合テスト連携アクションは特になし。ただし、Phase 11までの統合テスト結果を参照して未タスク検出を行う。

---

## 完了条件

- [ ] 実装ガイド（`outputs/phase-12/implementation-guide.md`）を作成した（2パート構成）
- [ ] ドキュメント更新履歴（`outputs/phase-12/documentation-changelog.md`）を作成した
- [ ] 未タスク検出レポート（`outputs/phase-12/unassigned-task-report.md`）を作成した（0件でも出力必須）
- [ ] システム仕様書の更新判断（`outputs/phase-12/spec-update-decision.md`）を記録した
- [ ] 元のタスク指示書のステータスを更新した

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 11 が完了していること
- **後続**: Phase 13 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/claude-cli-renderer-api/phase-13-pr-creation.md`
