# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 12                         |
| Phase名    | ドキュメント更新           |
| 前提Phase  | Phase 11（手動テスト検証） |
| 後続Phase  | Phase 13（PR作成）         |
| ステータス | 未実施                     |
| 作成日     | 2026-01-24                 |
| 機能名     | TASK-2A: SkillScanner      |

---

## 目的

ドキュメントを更新し、システム仕様書への反映を行う。また、未完了タスクの検出とレポート作成を行う。

## 背景

実装が完了した段階で、関連ドキュメントを最新状態に更新する必要がある。また、実装中に発見された追加課題を未タスクとして記録し、将来の対応に備える。

---

## 実行タスク

> 以下のタスクを順番に実行してください。必ず4つのタスク全てを完了すること。

### タスク1: 実装ガイド作成

**目的**: SkillScanner の使用方法を文書化する

**実行手順**:

1. 以下の2パート構成で実装ガイドを作成する：

**Part 1: 概念的説明（初学者・非技術者向け）**:

```markdown
## SkillScanner とは

SkillScanner は、Claude Code スキルのディレクトリをスキャンし、
スキルの詳細情報を取得するためのサービスクラスです。

### 主な機能

- 2つのスキルディレクトリの自動スキャン
- SKILL.md からのメタデータ抽出
- サブディレクトリ（agents/, references/ 等）の走査

### 使用例

スキル一覧を取得したい場合、SkillScanner を使用することで
システムにインストールされている全スキルの情報を取得できます。
```

**Part 2: 技術的詳細（開発者向け）**:

```markdown
## API リファレンス

### クラス: SkillScanner

#### コンストラクタ

\`\`\`typescript
new SkillScanner(options?: {
aiworkflowSkillsDir?: string;
claudeSkillsDir?: string;
})
\`\`\`

#### メソッド

##### scanAll(): Promise<SkillMetadata[]>

全スキルをスキャンし、メタデータを返す。

**戻り値**: SkillMetadata の配列

**例外**: ディレクトリ作成に失敗した場合にエラーをスロー
```

2. `docs/30-workflows/skill-import-agent-system/tasks/TASK-2A/implementation-guide.md` に作成する

**期待される成果物**:

- `implementation-guide.md`

---

### タスク2: システム仕様書更新（aiworkflow-requirements）【重要】

**目的**: 実装内容をシステム仕様書に反映する

> 📖 **必須**: `.claude/skills/task-specification-creator/references/spec-update-workflow.md` を参照

**実行手順**:

**Step 1: タスク完了記録（必須）**

1. `docs/30-workflows/skill-import-agent-system/specification.md` に以下を追加する：

```markdown
## 完了タスク

### TASK-2A: SkillScanner 実装

- **完了日**: YYYY-MM-DD
- **実装ファイル**: `apps/desktop/src/main/services/skill/SkillScanner.ts`
- **テストカバレッジ**: Line XX%, Branch XX%

## 関連ドキュメント

- [実装ガイド](./tasks/TASK-2A/implementation-guide.md)
```

**Step 2: システム仕様更新（条件付き）**

2. 以下の更新判断基準に基づき、システム仕様更新の要否を判断する：

| 更新が必要な場合             | 更新が不要な場合                         |
| ---------------------------- | ---------------------------------------- |
| 新規インターフェース/型追加  | 内部実装の詳細変更のみ                   |
| 既存インターフェース変更     | リファクタリング（インターフェース不変） |
| 新規定数/設定値追加          | バグ修正（仕様変更なし）                 |
| 外部連携インターフェース追加 | テスト追加のみ                           |

3. **更新が不要な場合**: documentation-changelog.md に「更新なし」と判断根拠を明記

4. **更新が必要な場合**: 以下のチェックリストを実行：

| チェック項目           | 更新先ファイル                                                        | 対象 |
| ---------------------- | --------------------------------------------------------------------- | ---- |
| メソッドシグネチャ変更 | `.claude/skills/aiworkflow-requirements/references/interfaces-*.md`   | □    |
| 新規エラークラス追加   | `.claude/skills/aiworkflow-requirements/references/error-handling.md` | □    |
| 新規ビジネスルール     | `.claude/skills/aiworkflow-requirements/references/interfaces-*.md`   | □    |
| 新規定数/設定値        | 該当 `interfaces-*.md`                                                | □    |
| DBスキーマ変更         | `.claude/skills/aiworkflow-requirements/references/database-*.md`     | □    |

**期待される成果物**:

- 仕様書へのタスク完了記録
- 必要に応じたシステム仕様更新

---

### タスク3: ドキュメント更新履歴作成

**目的**: 今回の実装で行ったドキュメント変更を記録する

**実行手順**:

1. 自動生成スクリプトを使用（推奨）：

```bash
# スクリプトが存在する場合
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/skill-import-agent-system/tasks/TASK-2A
```

2. 自動生成後、以下を手動で補完する：
   - システム仕様更新内容または「更新なし」の判断根拠
   - ソースコード変更の概要

3. `outputs/phase-12/documentation-changelog.md` に以下の形式で記録する：

```markdown
## ドキュメント更新履歴

### 更新日: YYYY-MM-DD

#### 新規作成ファイル

| ファイル                                                              | 種類         | 説明                |
| --------------------------------------------------------------------- | ------------ | ------------------- |
| `apps/desktop/src/main/services/skill/SkillScanner.ts`                | 実装         | SkillScanner クラス |
| `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts` | テスト       | ユニットテスト      |
| `docs/.../tasks/TASK-2A/implementation-guide.md`                      | ドキュメント | 実装ガイド          |

#### 修正ファイル

| ファイル                    | 変更内容                 |
| --------------------------- | ------------------------ |
| `apps/desktop/package.json` | yaml パッケージ追加      |
| `docs/.../specification.md` | 完了タスクセクション追加 |

#### システム仕様更新

- [ ] 更新あり: （更新内容を記載）
- [x] 更新なし: SkillScanner は内部サービスであり、既存インターフェースへの変更がないため
```

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`

---

### タスク4: 未タスク検出レポート作成（0件でも出力必須）

**目的**: 実装中に発見された追加課題を検出し記録する

**実行手順**:

1. 以下のソースから未タスクを検出する：
   - Phase 11 のテスト結果（FAIL があれば記録）
   - Phase 11 の発見課題（重要度「高」を記録）
   - コード内の TODO/FIXME コメント

2. 検出スクリプトを実行（存在する場合）：

```bash
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --workflow docs/30-workflows/skill-import-agent-system/tasks/TASK-2A \
  --sources "apps/desktop/src/main/services/skill/"
```

3. `outputs/phase-12/unassigned-tasks.md` に以下の形式で記録する：

**検出タスクがある場合**:

```markdown
## 検出結果サマリー

| ソース           | 検出数  |
| ---------------- | ------- |
| テスト結果       | X件     |
| 発見課題         | X件     |
| アクセシビリティ | 0件     |
| **合計**         | **X件** |

## 検出タスク一覧

### UNASSIGNED-001: パストラバーサル対策の強化

- **発見元**: コードレビュー
- **重要度**: 中
- **概要**: 現在のパストラバーサル対策を強化する必要がある
- **推奨対応**: TASK-2A-SEC として別タスク化
```

**検出タスクがない場合（0件）**:

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

- `outputs/phase-12/unassigned-tasks.md`

---

## 参照資料

| 参照資料                | パス                                                                                    | 内容                   |
| ----------------------- | --------------------------------------------------------------------------------------- | ---------------------- |
| Phase 11 手動テスト結果 | `outputs/phase-11/`                                                                     | テスト結果、発見課題   |
| 仕様更新フロー          | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | 更新判断基準・フロー   |
| 技術ドキュメントガイド  | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md` | ドキュメント作成ガイド |

---

## 成果物

| 成果物           | パス                                             | 内容                 |
| ---------------- | ------------------------------------------------ | -------------------- |
| 実装ガイド       | `docs/.../tasks/TASK-2A/implementation-guide.md` | 使用方法ドキュメント |
| 更新履歴         | `outputs/phase-12/documentation-changelog.md`    | ドキュメント変更履歴 |
| 未タスクレポート | `outputs/phase-12/unassigned-tasks.md`           | 未完了タスク一覧     |

---

## 統合テスト連携

**Phase 12 では統合テストドキュメントとして**:

- IPC ハンドラーテストとの連携方法をドキュメント化
- 統合テスト用のセットアップ手順を記載

---

## 完了条件

- [ ] 実装ガイドが作成されている（Part 1: 概念的説明、Part 2: 技術的詳細）
- [ ] specification.md にタスク完了記録が追加されている
- [ ] システム仕様更新の要否が判断され、必要に応じて更新されている
- [ ] ドキュメント更新履歴が作成されている
- [ ] 未タスク検出レポートが作成されている（0件でも明記）
- [ ] 全4タスクが完了している

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

`docs/30-workflows/skill-import-agent-system/tasks/TASK-2A/phase-13-pr-creation.md`
