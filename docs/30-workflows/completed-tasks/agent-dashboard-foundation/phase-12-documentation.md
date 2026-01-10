# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 12                         |
| Phase名    | ドキュメント更新           |
| 前提Phase  | Phase 11                   |
| 後続Phase  | Phase 13                   |
| ステータス | 未実施                     |
| 作成日     | 2026-01-10                 |
| 機能名     | agent-dashboard-foundation |

---

## 目的

実装内容に合わせてプロジェクトドキュメントを更新し、知識の共有と保守性を確保する。
また、未完了タスクを検出し、スキルフィードバックを記録する。

## 背景

新機能の実装に伴い、関連するドキュメントを更新して、チームメンバーや将来の開発者が機能を理解できるようにする。
さらに、ワークフロー実行中に発見された技術的負債や改善点を未タスクとして可視化する。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: knowledge-management

**パス**: `.claude/skills/knowledge-management/SKILL.md`

**選定理由**: 実装で得られた知識を形式知化し、ドキュメントとして整理するため

**Trigger条件**:
暗黙知の形式知化、ベストプラクティスの文書化、組織知識ベースの品質管理を行う場合に使用

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 実装内容をドキュメント化

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md` - 実装ガイド
- `outputs/phase-12/documentation-update.md` - ドキュメント更新記録

---

### スキル2: skill-creator（フィードバック記録）

**パス**: `.claude/skills/skill-creator/SKILL.md`

**選定理由**: ワークフロー実行中に使用したスキルのフィードバックを記録・改善するため

**Trigger条件**:
スキルの改善、新規スキル作成、フィードバック記録を行う場合に使用

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 各Phaseで使用したスキルの実行結果を評価
3. 必要に応じてスキルの改善/新規作成を実施

**期待される成果物**:

- `outputs/phase-12/skill-feedback-report.md` - スキルフィードバックレポート

---

## 参照資料

| 参照資料       | パス                                     | 内容           |
| -------------- | ---------------------------------------- | -------------- |
| 設計書         | `outputs/phase-2/architecture-design.md` | Phase 2成果物  |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | Phase 11成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料  | パス                                                                        | 内容             |
| --------- | --------------------------------------------------------------------------- | ---------------- |
| Agent SDK | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | 更新が必要な場合 |

---

## Phase 12 必須作業（4つ）

### Phase 12-1: 実装ガイド作成

実装した内容を「概念的な説明」と「技術的な詳細」の両面からドキュメント化する。

#### ドキュメント要件

| セクション         | 必須 | 内容                                     |
| ------------------ | ---- | ---------------------------------------- |
| 概念的な説明       | ✅   | 中学生にもわかる比喩・例え話を使った説明 |
| 全体アーキテクチャ | ✅   | ASCII図解付きのレイヤー構造説明          |
| 各層の実装詳細     | ✅   | コード例 + 設計意図の説明                |
| 用語集             | ✅   | 専門用語の読み方・意味・コンテキスト     |

#### 記述原則

1. **Why-first（なぜ優先）**: 「何をしたか」より「なぜそうしたか」を重視
2. **対比説明**: 「悪い例」と「良い例」を並べて違いを明確化
3. **図解活用**: ASCII図でアーキテクチャ・データフロー・関係性を可視化
4. **コード注釈**: コードスニペットには必ず日本語コメントで意図を補足
5. **読み方併記**: 英語の専門用語にはカタカナ読みを付記

---

### Phase 12-2: システムドキュメント更新

| ドキュメント           | パス                                                                         | 更新内容              |
| ---------------------- | ---------------------------------------------------------------------------- | --------------------- |
| UI/UXナビゲーション    | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`      | Agentメニュー追加     |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | agentSlice追加        |
| Electron IPC API       | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`         | agent:\* チャネル追加 |
| Agent SDK              | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`  | Skill型、Anchor型追加 |

---

### Phase 12-3: 未タスク検出【必須】

技術的負債を可視化し、継続的改善のための未タスクを検出する。

#### 検出ソース

| ソース              | 確認項目                      | Grepパターン例                             |
| ------------------- | ----------------------------- | ------------------------------------------ |
| Phase 3レビュー結果 | MINOR判定の指摘事項           | `outputs/phase-3/`                         |
| Phase 9レビュー結果 | MINOR判定の指摘事項           | `outputs/phase-9/`                         |
| Phase 11手動テスト  | スコープ外の発見事項          | `outputs/phase-11/`                        |
| 各Phase成果物       | 「将来対応」「TODO」「FIXME」 | `grep -r "TODO\|FIXME\|将来対応" outputs/` |
| コードベース        | TODO/FIXME/HACK/XXXコメント   | `grep -rn "TODO\|FIXME" apps/`             |
| スキルLOGS.md       | partial/failure記録           | 各使用スキルのLOGS.md                      |

#### 検出コマンド

```bash
# コードベースのTODO/FIXME検出
grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/

# Phase成果物の将来対応検出
grep -r "将来対応\|TODO\|FIXME" outputs/

# スキルLOGS.mdのpartial/failure検出
grep -rn "partial\|failure" .claude/skills/*/LOGS.md
```

---

### Phase 12-4: スキルフィードバック・改善・新規作成【必須】

**skill-creator**を使用して、ワークフロー実行中に使用したスキルのフィードバックを記録・改善する。

#### 12-4-1: フィードバック収集

各Phaseで使用したスキルの実行結果を評価し記録する。

```bash
# フィードバック記録
node .claude/skills/task-specification-creator/scripts/log_usage.mjs \
  --skill {{SKILL_NAME}} --result {{success|failure|partial}} --phase {{PHASE_NUMBER}}
```

#### 12-4-2: 既存スキル改善判定

skill-creatorで改善必要性を判定し、必要な場合は更新する。

```bash
# スキル更新（必要な場合）
node .claude/skills/skill-creator/scripts/detect_mode.mjs \
  --request "スキルを更新" --skill-path .claude/skills/{{SKILL_NAME}}
```

#### 12-4-3: 新規スキル必要性判定

ワークフロー実行中に以下の状況が発生した場合、**新規スキル作成**を検討する:

| 検出条件           | 新規スキル作成の判断基準                     |
| ------------------ | -------------------------------------------- |
| 手動作業の繰り返し | 同じ手順を3回以上手動で実行した              |
| 既存スキル不在     | 必要なスキルが見つからず自前で対応した       |
| スキルの責務超過   | 1つのスキルに複数責務を詰め込んだ            |
| ドメイン知識の欠落 | 特定ドメインの専門知識が必要だった           |
| 再利用性の発見     | 他タスクでも使える汎用的な処理パターンを発見 |

---

## 成果物

| 成果物                   | パス                                         | 内容               |
| ------------------------ | -------------------------------------------- | ------------------ |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`   | 概念説明+技術詳細  |
| ドキュメント更新記録     | `outputs/phase-12/documentation-update.md`   | 更新内容一覧       |
| 未タスク検出レポート     | `outputs/phase-12/unassigned-task-report.md` | 検出された未タスク |
| スキルフィードバック     | `outputs/phase-12/skill-feedback-report.md`  | スキル評価結果     |
| 未タスク指示書（該当時） | `docs/30-workflows/unassigned-task/`         | 新規タスク指示書   |

---

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明 + Part 2: 技術的詳細）が作成されている
- [ ] ドキュメント更新記録が出力されている
- [ ] 未タスク検出レポートが出力されている
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] **スキルフィードバックがskill-creatorで記録されている**【必須】
- [ ] スキル改善/新規作成が必要な場合、skill-creatorで実行されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 11（手動テスト検証）が完了していること
- **後続**: Phase 13（PR作成）へ進む

---

## スキルフィードバック記録（Phase完了後に記入）

Phase完了後、以下を記録してください:

```markdown
## Phase 12 実行記録

### 使用スキル

- knowledge-management: {{result}}
- skill-creator: {{result}}

### Phase 12-1〜12-4 完了状況

- [ ] 12-1: 実装ガイド作成
- [ ] 12-2: システムドキュメント更新
- [ ] 12-3: 未タスク検出
- [ ] 12-4: スキルフィードバック・改善

### 更新ドキュメント数

- 更新ファイル数: {{count}}
- 検出された未タスク: {{count}}
- 新規スキル作成: {{count}}

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

`docs/30-workflows/agent-dashboard-foundation/phase-13-pr-creation.md`
