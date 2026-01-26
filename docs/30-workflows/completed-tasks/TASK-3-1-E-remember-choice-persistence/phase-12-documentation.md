# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 12                                     |
| Phase名    | ドキュメント更新                       |
| 前提Phase  | Phase 11                               |
| 後続Phase  | Phase 13                               |
| ステータス | 未実施                                 |
| 作成日     | 2026-01-25                             |
| 機能名     | task-3-1-e-remember-choice-persistence |

---

## 目的

ドキュメント更新・仕様反映・未タスク検出を行い、成果物を整理する。

## 背景

実装が完了した機能について、システム仕様書やドキュメントを更新し、残課題を検出して未タスクとして記録する必要がある。

---

## 実行タスク（4タスク - 全て完了必須）

> 以下のタスクを順番に実行してください。

### タスク1: 実装ガイド作成

**目的**: 実装ガイドを作成する（2パート構成必須）

**実行手順**:

1. Part 1: 概念的説明（初学者・非技術者向け）
   - rememberChoice機能とは何か
   - ユーザー向けの使い方説明
   - 設定画面の操作方法
2. Part 2: 技術的詳細（開発者向け）
   - PermissionStoreのAPI説明
   - SkillExecutorとの連携方法
   - IPCハンドラーの使用方法
3. `docs/guides/permission-store.md`に出力

**期待される成果物**:

- `docs/guides/permission-store.md`

---

### タスク2: システム仕様書更新（aiworkflow-requirements）【重要】

**目的**: システム仕様書を更新する

> 📖 **必須**: `references/spec-update-workflow.md` を読み込み、更新判断基準を確認

**⚠️ 2ステップで実行:**

**Step 1: タスク完了記録（必須）**

1. `interfaces-agent-sdk.md`に「## 完了タスク」セクションを追加（既存の場合は追記）

   ```markdown
   ## 完了タスク

   | タスクID   | タスク名                       | 完了日     | 成果物                                 |
   | ---------- | ------------------------------ | ---------- | -------------------------------------- |
   | TASK-3-1-E | rememberChoice機能の永続化実装 | 2026-01-XX | PermissionStore, 設定UI, IPCハンドラー |
   ```

2. 「## 関連ドキュメント」に実装ガイドリンクを追加

**Step 2: システム仕様更新（条件付き）**

以下のチェックリストで更新要否を判断:

| 変更内容                 | 更新先                      | 更新要否 |
| ------------------------ | --------------------------- | -------- |
| PermissionStore型/IF追加 | interfaces-agent-sdk.md     | **必要** |
| IPCチャネル追加          | interfaces-agent-sdk.md     | **必要** |
| セキュリティ考慮事項追加 | security-skill-execution.md | 検討     |

**更新が必要な場合の実行手順**:

1. `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`を開く
2. 「## PermissionStore型定義（TASK-3-1-E）」セクションを追加
3. 以下の内容を追加:
   - PermissionStoreSchemaインターフェース
   - PermissionStore公開メソッド一覧
   - IPCチャネル定義（permission:getAllowedTools等）
4. 変更履歴にバージョンを追記

**期待される成果物**:

- `interfaces-agent-sdk.md`の更新（または更新なしの判断根拠）

---

### タスク3: ドキュメント更新履歴作成

**目的**: ドキュメント更新履歴を作成する

**実行手順**:

1. 自動生成スクリプトを使用（推奨）:
   ```bash
   node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
     --workflow docs/30-workflows/task-3-1-e-remember-choice-persistence
   ```
2. 生成後、手動で以下を補完:
   - システム仕様更新内容または「更新なし」の判断根拠
   - ソースコード変更の概要
3. `outputs/phase-12/documentation-changelog.md`に出力

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`

---

### タスク4: 未タスク検出レポート作成（0件でも出力必須）

**目的**: 残課題を検出し未タスクとして記録する

**実行手順**:

1. 以下のソースから未タスクを検出:
   - Phase 11のテスト結果（FAILがあれば記録）
   - Phase 11の発見課題（重要度「高」を抽出）
   - コードベースのTODO/FIXME
2. 検出コマンドを実行:
   ```bash
   node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
     --workflow docs/30-workflows/task-3-1-e-remember-choice-persistence \
     --sources "apps/desktop/src/main/services/skill/"
   ```
3. `outputs/phase-12/unassigned-task-detection.md`に出力

**0件の場合の出力形式**:

```markdown
## 検出結果サマリー

| ソース           | 検出数  |
| ---------------- | ------- |
| テスト結果       | 0件     |
| 発見課題         | 0件     |
| アクセシビリティ | 0件     |
| **合計**         | **0件** |

## 検出タスク一覧

**検出タスクなし**

すべてのテストがPASSし、発見課題もないため、未タスクとして記録すべき項目はありません。
```

**期待される成果物**:

- `outputs/phase-12/unassigned-task-detection.md`

---

## 参照資料

| 参照資料                  | パス                                                                           | 内容           |
| ------------------------- | ------------------------------------------------------------------------------ | -------------- |
| 仕様更新ワークフロー      | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 更新判断基準   |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`    | 更新対象仕様書 |
| Phase 11テスト結果        | `outputs/phase-11/manual-test-result.md`                                       | テスト結果     |
| Phase 11発見課題          | `outputs/phase-11/discovered-issues.md`                                        | 発見課題       |

---

## 成果物

| 成果物               | パス                                            | 内容           |
| -------------------- | ----------------------------------------------- | -------------- |
| 実装ガイド           | `docs/guides/permission-store.md`               | 使用方法ガイド |
| システム仕様更新     | `interfaces-agent-sdk.md`（必要な場合）         | 仕様書更新     |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`   | 変更履歴       |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | 残課題検出結果 |

---

## Phase 12-2 システム仕様更新チェックリスト

以下の項目を確認し、該当する場合はシステム仕様書を更新:

- [ ] PermissionStoreの型定義追加 → interfaces-agent-sdk.md
- [ ] PermissionStoreの公開メソッド追加 → interfaces-agent-sdk.md
- [ ] IPCチャネル定義追加 → interfaces-agent-sdk.md
- [ ] セキュリティ考慮事項追加 → security-skill-execution.md（該当する場合）

---

## 完了条件

- [ ] 実装ガイドが作成された（2パート構成）
- [ ] システム仕様書の更新判断が完了した
- [ ] ドキュメント更新履歴が作成された
- [ ] 未タスク検出レポートが作成された（0件でも出力）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 11（手動テスト検証）が完了していること
- **後続**: Phase 13（PR作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/task-3-1-e-remember-choice-persistence/phase-13-pr-creation.md`
