# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容             |
| ---------- | ---------------- |
| Phase      | 12               |
| Phase名    | ドキュメント更新 |
| 前提Phase  | Phase 11         |
| 後続Phase  | Phase 13         |
| ステータス | 未実施           |
| 作成日     | 2026-01-25       |
| 機能名     | IPCチャネル定義  |

---

## 目的

ドキュメント更新・仕様反映・未タスク検出を行う。

## 背景

本タスク完了時に、システム仕様書への反映とドキュメント更新を行う。
また、残課題がある場合は未タスク検出レポートを作成する。

---

## 実行タスク

> 以下の4タスクを全て完了すること（必須）。

### タスク1: 実装ガイド作成

**目的**: 後続タスク（TASK-4-2, TASK-5-1）の開発者向けに実装ガイドを作成する

**実行手順**:

1. Part 1: 概念的説明（初学者向け）を作成する
2. Part 2: 技術的詳細（開発者向け）を作成する
3. outputs/phase-12/に保存する

**Part 1: 概念的説明の内容**:

- IPCチャネルとは何か
- ホワイトリスト方式の意味
- 追加したチャネルの用途

**Part 2: 技術的詳細の内容**:

- チャネル定数の使用方法
- 型定義の参照方法
- ホワイトリスト登録の確認方法

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`

---

### タスク2: システム仕様書更新

**目的**: aiworkflow-requirementsのシステム仕様書を更新する

> 📖 **必須**: `.claude/skills/task-specification-creator/references/spec-update-workflow.md` を参照

**⚠️ 重要: 2種類の更新アクション**

| アクション               | 必須 | 条件                               |
| ------------------------ | ---- | ---------------------------------- |
| **タスク完了記録の追加** | ✅   | **全タスクで必須**                 |
| **実装状況テーブル更新** | ✅   | **実装完了時は必須**               |
| システム仕様の更新       | △    | インターフェース変更がある場合のみ |

---

**Step 1-A: タスク完了記録（必須）**

以下の手順を実行:

1. 該当する仕様書（security-api-electron.md）に「## 完了タスク」セクションを追加
2. 「## 関連ドキュメント」に実装ガイドリンクを追加
3. 「変更履歴」にバージョン追記

**確認チェック**:

- [ ] TASK-4-1を完了タスクとして記録した
- [ ] 実装ガイドへのリンクを追加した
- [ ] 変更履歴にバージョンを追記した

---

**Step 1-B: LOGS.md更新（必須）**

`.claude/skills/aiworkflow-requirements/LOGS.md` に以下の形式でエントリを追加:

```markdown
## 2026-01-XX: IPCチャネル定義（TASK-4-1）

| 項目         | 内容                                |
| ------------ | ----------------------------------- |
| タスクID     | TASK-4-1                            |
| 操作         | update-spec                         |
| 対象ファイル | references/security-api-electron.md |
| 結果         | success                             |
| 備考         | スキル管理用IPCチャネル6件追加      |

### 更新詳細

- **更新**: `references/security-api-electron.md`（vX.Y.Z → vX.Y.Z+1）
  - 「スキル管理セキュリティ」セクションに新規チャネル6件を追加
```

**確認チェック**:

- [ ] LOGS.mdにエントリを追加した

---

**Step 1-C: topic-map.md更新（新規セクション追加時は必須）**

`.claude/skills/aiworkflow-requirements/indexes/topic-map.md` の該当ファイルセクションに:

```markdown
| スキル管理チャネル追加（TASK-4-1） | L{{行番号}} |
```

**確認チェック**:

- [ ] topic-map.mdにエントリを追加した（新規セクション追加時のみ）

---

**Step 2: システム仕様更新（条件付き）**

本タスクは定数定義の追加のみであり、以下の条件を確認:

| 更新判断項目             | 該当 | 対応                         |
| ------------------------ | ---- | ---------------------------- |
| 新規インターフェース追加 | ✗    | -                            |
| 既存インターフェース変更 | ✗    | -                            |
| 新規定数/設定値追加      | ✓    | security-api-electron.md更新 |
| 外部連携インターフェース | ✗    | -                            |

**更新内容**:

- `security-api-electron.md` の「スキル管理セキュリティ」セクションに新規チャネルを追記

**⚠️ よくある誤判断パターン**:

| 誤判断パターン                         | 正しい判断       |
| -------------------------------------- | ---------------- |
| 「既存型を再利用しているので更新不要」 | **Step 1-B必須** |
| 「内部実装のみなので更新不要」         | **Step 1-A必須** |

**確認チェック**:

- [ ] 仕様更新要否を判断した
- [ ] 必要な場合、仕様書を更新した
- [ ] 不要な場合、documentation-changelog.mdに「更新なし」を明記した

**期待される成果物**:

- 更新されたシステム仕様書（または「更新なし」の記録）

---

### タスク3: ドキュメント更新履歴作成

**目的**: 変更履歴を記録する

**実行手順**:

1. 自動生成スクリプトを実行する（推奨）
2. 必要に応じて手動で補完する

**自動生成コマンド**:

```bash
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/skill-import-agent-system/tasks/TASK-4-1-ipc-channels
```

**手動補完内容**:

- システム仕様更新内容または「更新なし」の判断根拠
- ソースコード変更の概要

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`

---

### タスク4: 未タスク検出レポート作成

**目的**: 残課題を検出し、レポートを作成する（0件でも必須）

**実行手順**:

1. FAILテストを検出する
2. 重要度「高」の課題を検出する
3. レポートを作成する

**検出コマンド**（任意）:

```bash
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --workflow docs/30-workflows/skill-import-agent-system/tasks/TASK-4-1-ipc-channels \
  --sources "apps/desktop/src/preload/"
```

**期待される成果物**:

- `outputs/phase-12/unassigned-task-detection.md`

**0件の場合のレポート形式**:

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

すべてのテストがPASSし、発見課題もないため、
未タスクとして記録すべき項目はありません。
```

---

## 参照資料

| 参照資料         | パス                                                                           | 内容           |
| ---------------- | ------------------------------------------------------------------------------ | -------------- |
| 仕様更新フロー   | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 更新判断基準   |
| セキュリティ仕様 | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`   | 更新対象仕様書 |
| 手動テスト結果   | `outputs/phase-11/manual-test-result.md`                                       | Phase 11成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料            | パス                                                                         | 内容           |
| ------------------- | ---------------------------------------------------------------------------- | -------------- |
| IPC通信セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | 更新対象仕様書 |

---

## 成果物

| 成果物               | パス                                            | 内容              |
| -------------------- | ----------------------------------------------- | ----------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | 概念/技術詳細     |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`   | 変更履歴          |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | 残課題（0件含む） |

---

## 統合テスト連携（Phase 1〜11は必須）

Phase 12はドキュメント更新フェーズのため、統合テストの実行は不要。

---

## 完了条件

- [ ] 実装ガイドを作成した（Part 1/Part 2両方）
- [ ] システム仕様書の更新要否を判断し、対応した
  - [ ] Step 1-A: タスク完了記録を追加した
  - [ ] Step 1-B: LOGS.mdにエントリを追加した
  - [ ] Step 1-C: topic-map.mdを更新した（新規セクション追加時）
  - [ ] Step 2: 仕様更新を実施または「更新なし」を記録した
- [ ] ドキュメント更新履歴を作成した
- [ ] 未タスク検出レポートを作成した（0件でも必須）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（4タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 11（手動テスト検証）が完了していること
- **後続**: Phase 13（PR作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-agent-system/tasks/TASK-4-1-ipc-channels/phase-13-pr-creation.md`
