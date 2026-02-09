# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 12                                 |
| 機能名 | TASK-FIX-5-1-SKILL-API-UNIFICATION |
| 作成日 | 2026-02-08                         |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 参照資料

| 資料名               | パス                                             | 説明                 |
| -------------------- | ------------------------------------------------ | -------------------- |
| 最終レビュー         | `outputs/phase-10/final-review-result.md`        | Phase 10成果物       |
| 手動テスト           | `outputs/phase-11/manual-test-result.md`         | Phase 11成果物       |
| 仕様更新ワークフロー | `references/spec-update-workflow.md`             | Task 2の詳細手順     |
| 更新履歴テンプレート | `references/documentation-changelog-template.md` | Task 3のテンプレート |
| 未タスクガイドライン | `references/unassigned-task-guidelines.md`       | Task 4の判断基準     |

## 実行タスク

### Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート     | 対象読者                 | 内容                                       |
| ---------- | ------------------------ | ------------------------------------------ |
| **Part 1** | **初学者・中学生レベル** | **概念説明（日常の例え話、専門用語なし）** |
| **Part 2** | **開発者・技術者**       | **技術的詳細（スキーマ・API・コード例）**  |

#### Part 1（中学生レベル）の記載内容

- **なぜ2つのAPIがあったのか**: 「お店に入口が2つあって、それぞれ違う案内図がある状態」のような例え
- **なぜ1つに統一したのか**: 統一による混乱解消と保守性向上
- **何が変わったのか**: 全員が同じ入口（`window.electronAPI.skill`）を使うようになった

#### Part 2（技術者レベル）の記載内容

- 統一SkillAPIインターフェース定義（TypeScript）
- 各メソッドのシグネチャと使用例
- 移行前後のコード比較
- `OperationResult<T>` 廃止の影響と対処法
- IPCチャンネルとの対応関係
- エラーハンドリングパターン

### Task 2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

#### Step 1-A: タスク完了記録【必須】

- [ ] `interfaces-agent-sdk-skill.md` に「完了タスク」セクションを追加
- [ ] 関連ドキュメントセクションに実装ガイドリンクを追加
- [ ] 変更履歴セクションにバージョンを追記
- [ ] `aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加
- [ ] `task-specification-creator/LOGS.md` にタスク完了記録を追加
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴更新
- [ ] `task-specification-creator/SKILL.md` 変更履歴更新
- [ ] `topic-map.md` に新規セクションエントリを追加（該当する場合）

```markdown
## 完了タスク

### タスク: TASK-FIX-5-1-SKILL-API-UNIFICATION（{{COMPLETION_DATE}}完了）

| 項目       | 内容                      |
| ---------- | ------------------------- |
| タスクID   | TASK-FIX-5-1              |
| ステータス | **完了**                  |
| テスト数   | {{N}}（自動）+ 17（手動） |
| 主要変更   | SkillAPI二重定義の統一    |
```

#### Step 1-B: 実装状況テーブル更新

- [ ] `api-endpoints.md` のDesktop IPC APIセクション更新（skillAPI統一反映）
- [ ] `interfaces-agent-sdk-skill.md` のSkillAPI型定義セクション更新

#### Step 1-C: 関連タスクテーブル更新

- [ ] 関連仕様書内の「関連タスク」テーブルでTASK-FIX-5-1のステータスを「完了」に更新

#### Step 1-D: LOGS.md×2ファイル更新【必須】

> **P1: LOGS.md 2ファイル更新漏れ防止**: 後回しにすると漏れる。Step 1-Aと同時に更新すること

- [ ] `aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加
- [ ] `task-specification-creator/LOGS.md` にタスク完了記録を追加

#### Step 1-E: topic-map.md再生成【新規セクション追加時は必須】

> **P2: topic-map.md 再生成忘れ防止**: 仕様書更新後は必ず再生成すること

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` 実行
- [ ] 行番号が正しく反映されたことを確認

#### Step 2: システム仕様更新【条件付き】

本タスクでは以下の仕様変更が発生するため、**Step 2 実行が必要**:

| 変更内容                     | 更新対象仕様書                            |
| ---------------------------- | ----------------------------------------- |
| SkillAPIインターフェース統一 | `interfaces-agent-sdk-skill.md`           |
| `window.skillAPI` 公開廃止   | `security-skill-ipc.md`                   |
| Preload公開API面の変更       | `architecture-implementation-patterns.md` |

更新原則: 概要のみ記載、Single Source of Truth遵守

### Task 3: ドキュメント更新履歴 & artifacts.json更新【必須】

```bash
# Step 1: ドキュメント更新履歴生成
node scripts/generate-documentation-changelog.js --workflow docs/30-workflows/TASK-FIX-5-1-SKILL-API-UNIFICATION

# Step 2: Phase 12完了登録
node scripts/complete-phase.js \
  --workflow docs/30-workflows/TASK-FIX-5-1-SKILL-API-UNIFICATION \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート"
```

**artifacts.json必須項目**:

- Phase 12のステータスが`completed`に更新されていること
- 全Phase（1-12）の成果物パスが登録されていること
- `qualityMetrics`セクションに品質指標が記録されていること

**スクリプト未存在時の代替手順**:

- 手動で `outputs/phase-12/documentation-changelog.md` を作成
- 手動で `artifacts.json` を作成（completed-tasks内の例を参照）

### Task 4: 未タスク検出【必須】

> **P3: 未タスク管理の3ステップ不完全防止**: 指示書作成 → 残課題テーブル → 関連仕様書リンク の全ステップを実行

| #   | ソース                 | 確認項目                           |
| --- | ---------------------- | ---------------------------------- |
| 1   | 元タスク仕様書         | 「スコープ外」として明示された項目 |
| 2   | Phase 3レビュー結果    | MINOR判定の指摘事項                |
| 3   | Phase 10レビュー結果   | MINOR判定の指摘事項                |
| 4   | Phase 11手動テスト結果 | スコープ外の発見事項               |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント        |

#### スコープ外項目（元タスク仕様書より）

- Main ProcessのIPCハンドラの変更 → 未タスク候補
- 新機能の追加 → 対象外
- 状態管理の変更 → 別タスクで実施予定

#### 未タスク検出手順

```bash
# 未タスク検出スクリプト
node scripts/detect-unassigned-tasks.js --scan apps/desktop/src/preload --output .tmp/unassigned-candidates.json
```

**0件でも `outputs/phase-12/unassigned-task-detection.md` を出力すること**

#### 検出時の3ステップ処理

1. `docs/30-workflows/unassigned-task/` に未タスク指示書を作成
2. `task-workflow.md` 残課題テーブルに登録
3. 関連仕様書に参照リンク追加

## アーキテクチャ層別ドキュメント

| 層               | ドキュメント内容                               | 更新対象                        |
| ---------------- | ---------------------------------------------- | ------------------------------- |
| Preload          | 統一skillAPI公開メソッド一覧、セキュリティ考慮 | `security-skill-ipc.md`         |
| Renderer Process | 呼び出しパス統一（`window.electronAPI.skill`） | `interfaces-agent-sdk-skill.md` |
| IPC通信          | チャンネル定義との対応関係                     | `api-endpoints.md`              |

## 統合テスト連携【必須】

| 確認項目                         | 判定基準                                             |
| -------------------------------- | ---------------------------------------------------- |
| 実装ガイドとシステム仕様の整合性 | interfaces-agent-sdk-skill.mdとの一致確認            |
| システム仕様更新の完全性         | Step 1-A〜E + Step 2の全Step完了確認                 |
| 未タスク検出結果の記録           | 0件でもレポート出力確認                              |
| LOGS.md×2ファイル更新            | aiworkflow-requirements + task-specification-creator |
| SKILL.md×2ファイル更新           | aiworkflow-requirements + task-specification-creator |

## 成果物

| 成果物               | パス                                            | 必須 | 説明                      |
| -------------------- | ----------------------------------------------- | ---- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | Y    | 概念的+技術的ドキュメント |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | Y    | 更新履歴                  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | Y    | 検出結果（なしでも出力）  |
| 未完了タスク指示書   | `docs/30-workflows/unassigned-task/*.md`        | 条件 | 検出時のみ作成            |

## 完了条件

### Task 1: 実装ガイド

- [ ] 実装ガイド（Part 1: 概念的説明 - 中学生レベル、日常の例え話必須）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている

### Task 2 Step 1-A: タスク完了記録

- [ ] `interfaces-agent-sdk-skill.md` に「完了タスク」セクションを追加した
- [ ] 関連ドキュメントセクションに実装ガイドリンクを追加した
- [ ] 変更履歴セクションにバージョンを追記した
- [ ] `aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加した
- [ ] `task-specification-creator/LOGS.md` にタスク完了記録を追加した
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴を更新した
- [ ] `task-specification-creator/SKILL.md` 変更履歴を更新した
- [ ] `topic-map.md` に新規セクションエントリを追加した（該当する場合）

### Task 2 Step 1-B: 実装状況テーブル

- [ ] `api-endpoints.md` の実装状況テーブルを更新した
- [ ] `interfaces-agent-sdk-skill.md` のSkillAPI型定義を更新した

### Task 2 Step 1-C: 関連タスクテーブル

- [ ] 関連タスクテーブルのステータスを「完了」に更新した

### Task 2 Step 1-D: LOGS.md×2

- [ ] `aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加した【必須】
- [ ] `task-specification-creator/LOGS.md` にタスク完了記録を追加した【必須】

### Task 2 Step 1-E: topic-map.md再生成

- [ ] `topic-map.md` が再生成されている（新規セクション追加時）

### Task 2 Step 2: システム仕様更新

- [ ] `interfaces-agent-sdk-skill.md` のSkillAPIインターフェース統一を反映した
- [ ] `security-skill-ipc.md` の`window.skillAPI`廃止を反映した
- [ ] `architecture-implementation-patterns.md` のPreload公開API変更を反映した

### Task 3: artifacts.json更新

- [ ] documentation-changelog.md が出力されている
- [ ] artifacts.json が更新されている

### Task 4: 未タスク検出

- [ ] **未タスク検出レポートが出力されている**【0件でも必須】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] 検出された未タスクが残課題テーブルに登録されている（該当する場合）
- [ ] 関連仕様書に参照リンクが追加されている（該当する場合）

### 最終確認

- [ ] **本Phase内の全タスクを100%実行完了**

## フォールバック手順

| スクリプト                            | 代替手順                                                                          |
| ------------------------------------- | --------------------------------------------------------------------------------- |
| `generate-documentation-changelog.js` | 手動でdocumentation-changelog.mdを作成                                            |
| `complete-phase.js`                   | 手動でartifacts.jsonを作成（参照: completed-tasks内の例）                         |
| `detect-unassigned-tasks.js`          | 手動で各Phaseのレビュー結果・発見課題を確認し、unassigned-task-detection.mdを作成 |

## 次のPhase

Phase 13: PR作成
