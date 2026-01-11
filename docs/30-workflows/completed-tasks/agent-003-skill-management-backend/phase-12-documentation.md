# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| Phase      | 12                     |
| Phase名    | ドキュメント更新       |
| 前提Phase  | Phase 11               |
| 後続Phase  | Phase 13               |
| ステータス | 未実施                 |
| 作成日     | 2026-01-11             |
| 機能名     | スキル管理バックエンド |

---

## 目的

実装内容に基づいてドキュメントを更新し、開発者・ユーザーが機能を理解・利用できるようにする。また、未完了タスクを検出し、技術的負債を可視化する。

## 背景

手動テストが完了し、機能が正常に動作することが確認された。PR作成前に、必要なドキュメントを整備し、Phase実行中に発見された課題を未タスクとして記録する。

---

## Phase 12 の3つの必須作業

1. **実装ガイド作成**: 概念的説明と技術的詳細のドキュメント化
2. **システムドキュメント更新**: 既存ドキュメントへの反映（aiworkflow-requirements含む）
3. **未タスク検出**: 技術的負債の可視化と継続的改善

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 実装ガイド作成

**目的**: 開発者向けの実装ガイドを作成する

**実行手順**:

1. 実装ガイドを作成する:

```markdown
# スキル管理バックエンド 実装ガイド

## 概要

このドキュメントは、スキル管理バックエンド機能の実装について説明します。

## アーキテクチャ

### コンポーネント構成
```

Main Process (Electron)
├── SkillService (エントリポイント)
│ ├── SkillScanner (スキル検出)
│ ├── SkillParser (SKILL.md解析)
│ └── SkillImportManager (インポート管理)
└── IPC Handlers (Renderer通信)

````

### データフロー

1. Renderer → IPC → Main Process
2. Main Process → Service → Scanner/Parser/Manager
3. 結果 → IPC → Renderer

## IPC API

### agent:scan-available-skills

指定パス配下のスキルをスキャンする。

**引数**:
- `basePath: string` - スキャン対象ディレクトリ

**戻り値**:
- `Skill[]` - 検出されたスキル一覧

### agent:get-imported-skills

インポート済みスキル一覧を取得する。

**引数**: なし

**戻り値**:
- `Skill[]` - インポート済みスキル一覧

### agent:import-skills

スキルをインポートする。

**引数**:
- `skillIds: string[]` - インポートするスキルID

**戻り値**:
- `{ success: boolean, importedCount: number }` - インポート結果

### agent:remove-skill

スキルのインポートを解除する。

**引数**:
- `skillId: string` - 削除するスキルID

**戻り値**:
- `{ success: boolean }` - 削除結果

### agent:get-skill-detail

スキルの詳細を取得する。

**引数**:
- `skillId: string` - スキルID

**戻り値**:
- `Skill | null` - スキル詳細

## 使用例

### Rendererからの呼び出し

```typescript
// スキルスキャン
const skills = await window.electronAPI.agent.scanAvailableSkills('/path/to/skills');

// インポート
await window.electronAPI.agent.importSkills(['skill-1', 'skill-2']);

// インポート済み取得
const imported = await window.electronAPI.agent.getImportedSkills();

// 詳細取得
const detail = await window.electronAPI.agent.getSkillDetail('skill-1');

// 削除
await window.electronAPI.agent.removeSkill('skill-1');
````

## セキュリティ

### パストラバーサル防止

すべてのパス操作は正規化後に検証される。

### IPC sender検証

正当なRendererからの呼び出しのみ受け付ける。

````

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`

---

### タスク2: API リファレンス作成

**目的**: IPC API のリファレンスドキュメントを作成する

**実行手順**:

1. API リファレンスを作成する:

```markdown
# スキル管理 IPC API リファレンス

## 概要

スキル管理機能のIPC APIリファレンスです。

## 型定義

### Skill

```typescript
interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string;
  path: string;
  triggers: string[];
  anchors: Anchor[];
  category?: string;
  environment?: EnvironmentConfig;
  license?: string;
  allowedTools?: string[];
  tags?: string[];
  dependencies?: string[];
  lastModified: Date;
}
````

### Anchor

```typescript
interface Anchor {
  name: string;
  application: string;
  purpose: string;
}
```

## API

### scanAvailableSkills

指定パス配下のスキルをスキャンします。

| 項目     | 内容                          |
| -------- | ----------------------------- |
| チャネル | `agent:scan-available-skills` |
| 引数     | `basePath: string`            |
| 戻り値   | `Promise<Skill[]>`            |

#### エラー

| コード | 説明                 |
| ------ | -------------------- |
| E001   | パスが存在しない     |
| E002   | パストラバーサル検出 |
| E003   | 読み取り権限なし     |

### getImportedSkills

インポート済みスキル一覧を取得します。

| 項目     | 内容                        |
| -------- | --------------------------- |
| チャネル | `agent:get-imported-skills` |
| 引数     | なし                        |
| 戻り値   | `Promise<Skill[]>`          |

### importSkills

スキルをインポートします。

| 項目     | 内容                    |
| -------- | ----------------------- |
| チャネル | `agent:import-skills`   |
| 引数     | `skillIds: string[]`    |
| 戻り値   | `Promise<ImportResult>` |

#### ImportResult

```typescript
interface ImportResult {
  success: boolean;
  importedCount: number;
  errors?: string[];
}
```

### removeSkill

スキルのインポートを解除します。

| 項目     | 内容                    |
| -------- | ----------------------- |
| チャネル | `agent:remove-skill`    |
| 引数     | `skillId: string`       |
| 戻り値   | `Promise<RemoveResult>` |

#### RemoveResult

```typescript
interface RemoveResult {
  success: boolean;
  error?: string;
}
```

### getSkillDetail

スキルの詳細を取得します。

| 項目     | 内容                     |
| -------- | ------------------------ | ------ |
| チャネル | `agent:get-skill-detail` |
| 引数     | `skillId: string`        |
| 戻り値   | `Promise<Skill           | null>` |

````

**期待される成果物**:

- `outputs/phase-12/api-reference.md`

---

### タスク3: SKILL.md フォーマット仕様作成

**目的**: SKILL.md ファイルのフォーマット仕様を文書化する

**実行手順**:

1. フォーマット仕様を作成する:

```markdown
# SKILL.md フォーマット仕様

## 概要

スキル定義ファイル（SKILL.md）のフォーマット仕様です。

## 基本構造

```markdown
---
name: スキル名
slug: skill-slug
description: スキルの説明
category: カテゴリ
license: MIT
---

## Overview

スキルの概要説明。

## Anchors

- アンカー名 / 適用: 適用対象 / 目的: 目的説明

## Trigger

トリガーキーワード1, トリガーキーワード2, ...
````

## フロントマター（必須）

| フィールド  | 必須 | 説明                     |
| ----------- | ---- | ------------------------ |
| name        | ✓    | スキルの表示名           |
| slug        | ✓    | 一意識別子（kebab-case） |
| description | ✓    | スキルの説明             |
| category    |      | カテゴリ                 |
| license     |      | ライセンス               |

## Anchors セクション

知識のアンカーを定義します。

### 形式

```
- アンカー名 / 適用: 適用対象 / 目的: 目的説明
```

### 例

```markdown
## Anchors

- Clean Code / 適用: コード品質 / 目的: 保守性向上
- TDD / 適用: テスト駆動開発 / 目的: 品質保証
```

## Trigger セクション

スキルを呼び出すトリガーキーワードを定義します。

### 形式

カンマ区切りのキーワードリスト。

### 例

```markdown
## Trigger

コードレビュー, レビュー, review, code review
```

## 完全な例

```markdown
---
name: Code Review Assistant
slug: code-review-assistant
description: コードレビューを支援するスキル
category: Development
license: MIT
---

## Overview

このスキルはコードレビューを支援します。

## Anchors

- Clean Code / 適用: コード品質 / 目的: 保守性向上
- SOLID原則 / 適用: 設計パターン / 目的: 拡張性確保

## Trigger

コードレビュー, レビュー, review, code review
```

````

**期待される成果物**:

- `outputs/phase-12/skill-md-format.md`

---

### タスク4: トラブルシューティングガイド作成

**目的**: よくある問題と解決策をまとめる

**実行手順**:

1. トラブルシューティングガイドを作成する:

```markdown
# スキル管理 トラブルシューティングガイド

## よくある問題

### スキルが検出されない

**症状**: スキャンしてもスキルが表示されない

**原因**:
1. SKILL.md ファイルがない
2. パスが間違っている
3. 読み取り権限がない

**解決策**:
1. ディレクトリにSKILL.mdファイルが存在するか確認
2. 指定パスが正しいか確認
3. ファイルの読み取り権限を確認

### インポートが失敗する

**症状**: インポート操作がエラーになる

**原因**:
1. スキルIDが無効
2. すでにインポート済み
3. ストレージ書き込みエラー

**解決策**:
1. スキルIDが正しいか確認
2. インポート済み一覧を確認
3. アプリを再起動して再試行

### 永続化されない

**症状**: アプリ再起動後にインポート状態が失われる

**原因**:
1. electron-store の設定エラー
2. ファイル書き込み権限がない

**解決策**:
1. アプリのデータディレクトリを確認
2. 書き込み権限を確認
3. 設定ファイルが破損していないか確認

### セキュリティエラー

**症状**: パストラバーサルエラーが表示される

**原因**:
- パスに `..` が含まれている
- 不正なパスが指定された

**解決策**:
- 絶対パスを使用する
- パスに `..` を含めない
````

**期待される成果物**:

- `outputs/phase-12/troubleshooting.md`

---

### タスク5: 既存ドキュメント更新

**目的**: 既存のプロジェクトドキュメントを更新する

**実行手順**:

1. 必要に応じて以下のドキュメントを更新する:

| ドキュメント     | 更新内容                       |
| ---------------- | ------------------------------ |
| README.md        | 機能概要の追加（必要に応じて） |
| アーキテクチャ図 | コンポーネントの追加           |
| IPC API 一覧     | 新規エンドポイントの追加       |

2. 更新が必要なドキュメントを特定し、更新する

**期待される成果物**:

- 更新されたドキュメント（該当する場合）

---

### タスク6: ドキュメントサマリー作成

**目的**: 作成・更新したドキュメントの一覧をまとめる

**実行手順**:

1. ドキュメントサマリーを作成する:

```markdown
## ドキュメントサマリー

### 新規作成

| ドキュメント             | パス                                       | 内容             |
| ------------------------ | ------------------------------------------ | ---------------- |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md` | 開発者向けガイド |
| APIリファレンス          | `outputs/phase-12/api-reference.md`        | IPC API仕様      |
| SKILL.mdフォーマット仕様 | `outputs/phase-12/skill-md-format.md`      | ファイル形式仕様 |
| トラブルシューティング   | `outputs/phase-12/troubleshooting.md`      | 問題解決ガイド   |

### 更新

| ドキュメント | 更新内容 |
| ------------ | -------- |
| （あれば）   | （内容） |

### 総合判定: COMPLETE
```

**期待される成果物**:

- `outputs/phase-12/document-summary.md`

---

### タスク7: 未タスク検出【必須】

**目的**: Phase実行中に発見された課題・TODO・将来対応事項を検出し、未タスク指示書を作成する

**実行手順**:

1. 以下のソースから未完了タスクを検出する:

| ソース                 | 確認項目                      | Grepパターン例                                                            |
| ---------------------- | ----------------------------- | ------------------------------------------------------------------------- |
| Phase 3レビュー結果    | MINOR判定の指摘事項           | `outputs/phase-3/`                                                        |
| Phase 9レビュー結果    | MINOR判定の指摘事項           | `outputs/phase-9/`                                                        |
| Phase 11手動テスト結果 | スコープ外の発見事項          | `outputs/phase-11/`                                                       |
| 各Phase成果物          | 「将来対応」「TODO」「FIXME」 | `grep -r "TODO\|FIXME\|将来対応" outputs/`                                |
| コードベース           | TODO/FIXME/HACK/XXXコメント   | `grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/main/services/skill/` |

2. 検出結果を記録する:

```markdown
## 未タスク検出レポート

### 検出日: YYYY-MM-DD

### 検出ソース別一覧

| ID  | ソース            | 内容 | 優先度 | 対応方針   |
| --- | ----------------- | ---- | ------ | ---------- |
| 1   | Phase 3 MINOR     | ...  | 低     | 未タスク化 |
| 2   | コードベース TODO | ...  | 中     | 未タスク化 |

### 未タスク化対象

| 検出ID | 未タスク指示書 | 理由                       |
| ------ | -------------- | -------------------------- |
| 1      | task-xxx.md    | スコープ外だが改善余地あり |

### 対応不要

| 検出ID | 理由                 |
| ------ | -------------------- |
| N/A    | 該当なし or 対応済み |
```

3. 未タスク指示書を作成する（該当する場合）:
   - 配置先: `docs/30-workflows/unassigned-task/task-{{TASK_NAME}}.md`
   - テンプレート: `.claude/skills/task-specification-creator/assets/unassigned-task-template.md` を参照

**期待される成果物**:

- `outputs/phase-12/unassigned-task-report.md`
- `docs/30-workflows/unassigned-task/task-*.md`（該当する場合）

---

### タスク8: ドキュメント更新記録作成

**目的**: 更新したドキュメントの一覧と変更内容を記録する

**実行手順**:

1. ドキュメント更新記録を作成する:

```markdown
## ドキュメント更新記録

### 更新日: YYYY-MM-DD

### 新規作成ドキュメント

| ドキュメント             | パス                                       | 内容             |
| ------------------------ | ------------------------------------------ | ---------------- |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md` | 開発者向けガイド |
| APIリファレンス          | `outputs/phase-12/api-reference.md`        | IPC API仕様      |
| SKILL.mdフォーマット仕様 | `outputs/phase-12/skill-md-format.md`      | ファイル形式仕様 |
| トラブルシューティング   | `outputs/phase-12/troubleshooting.md`      | 問題解決ガイド   |

### 更新ドキュメント

| ドキュメント       | 変更内容     |
| ------------------ | ------------ |
| （該当あれば記載） | （変更内容） |

### aiworkflow-requirements更新

| 参照資料                 | 更新内容                     | 更新有無 |
| ------------------------ | ---------------------------- | -------- |
| architecture-patterns.md | スキル管理コンポーネント追加 | 要/不要  |
| security-api-electron.md | IPC検証パターン追加          | 要/不要  |
```

**期待される成果物**:

- `outputs/phase-12/documentation-update-log.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容         |
| ---------------------- | ---------------------------------------------------------------------------- | ------------ |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | 設計パターン |

---

## 成果物

| 成果物                   | パス                                           | 内容               |
| ------------------------ | ---------------------------------------------- | ------------------ |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`     | 開発者向けガイド   |
| APIリファレンス          | `outputs/phase-12/api-reference.md`            | IPC API仕様        |
| SKILL.mdフォーマット仕様 | `outputs/phase-12/skill-md-format.md`          | ファイル形式仕様   |
| トラブルシューティング   | `outputs/phase-12/troubleshooting.md`          | 問題解決ガイド     |
| ドキュメントサマリー     | `outputs/phase-12/document-summary.md`         | ドキュメント一覧   |
| 未タスク検出レポート     | `outputs/phase-12/unassigned-task-report.md`   | 検出された未タスク |
| ドキュメント更新記録     | `outputs/phase-12/documentation-update-log.md` | 更新履歴           |
| 未タスク指示書           | `docs/30-workflows/unassigned-task/task-*.md`  | 該当時のみ         |

---

## 完了条件

- [ ] 実装ガイドが作成されている（概念的説明 + 技術的詳細）
- [ ] APIリファレンスが作成されている
- [ ] SKILL.mdフォーマット仕様が作成されている
- [ ] トラブルシューティングガイドが作成されている
- [ ] 既存ドキュメントが更新されている（該当する場合）
- [ ] ドキュメントサマリーが作成されている
- [ ] **未タスク検出レポートが作成されている**
- [ ] **ドキュメント更新記録が作成されている**
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] aiworkflow-requirementsが更新されている（該当する場合）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.json を更新

---

## 依存関係

- **前提**: Phase 11（手動テスト）が完了していること
- **後続**: Phase 13（PR作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/agent-003-skill-management-backend/phase-13-pr-creation.md`
