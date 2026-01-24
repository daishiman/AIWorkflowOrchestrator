# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容             |
| ---------- | ---------------- |
| Phase      | 1                |
| Phase名    | 要件定義         |
| 前提Phase  | なし             |
| 後続Phase  | Phase 2（設計）  |
| ステータス | 未実施           |
| 作成日     | 2026-01-24       |
| 機能名     | SkillImportStore |

---

## 目的

SkillImportStore の要件を明確化し、実装に必要な仕様を確定する。
TASK-1-1 で定義された共通型定義との整合性を確認し、IPC Handlers（TASK-4-2）との連携要件を明記する。

## 背景

electron-store を使用したスキルインポート情報の永続化は、アプリケーション再起動後もユーザーのスキル設定を維持するために必須である。
既存の `slideSettingsStore.ts` パターンを踏襲することで、コードの一貫性とメンテナンス性を確保する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 既存パターンの分析

**目的**: 既存の slideSettingsStore.ts を分析し、設計パターンを理解する

**実行手順**:

1. `apps/desktop/src/main/settings/slideSettingsStore.ts` を読み込む
2. electron-store の使用パターンを抽出する
3. スキーマ定義、デフォルト値、バリデーション方式を文書化する
4. マイグレーション機能の実装方法を確認する

**期待される成果物**:

- `outputs/phase-1/existing-pattern-analysis.md`

---

### タスク2: 仕様書との整合性確認

**目的**: specification.md セクション6.1 との整合性を確認する

**実行手順**:

1. `docs/30-workflows/skill-import-agent-system/specification.md` セクション6.1 を読み込む
2. SkillStoreSchema の各フィールドを確認する
3. API（getImported, addImport など）を確認する
4. マイグレーション要件を確認する
5. 差異や不明点があれば記録する

**期待される成果物**:

- `outputs/phase-1/specification-alignment.md`

---

### タスク3: 共通型定義との整合性確認

**目的**: TASK-1-1 で定義された型との整合性を確認する

**実行手順**:

1. `packages/shared/src/types/skill.ts` を読み込む
2. ImportedSkillData と ImportedSkill の関係を確認する
3. SkillMetadata との関連を確認する
4. 型の再利用方針を決定する

**期待される成果物**:

- `outputs/phase-1/type-alignment.md`

---

### タスク4: IPC連携要件の定義

**目的**: TASK-4-2（IPC Handlers）との連携要件を明確化する

**実行手順**:

1. IPC Handlers がストアを呼び出すパターンを定義する
2. ストア API が同期/非同期どちらで動作するかを決定する
3. エラーハンドリング方針を決定する
4. 連携インターフェースを文書化する

**期待される成果物**:

- `outputs/phase-1/ipc-integration-requirements.md`

---

### タスク5: 要件仕様書の作成

**目的**: 最終的な要件仕様書を作成する

**実行手順**:

1. タスク1〜4の成果物を統合する
2. 機能要件を一覧化する
3. 非機能要件（パフォーマンス、セキュリティ）を定義する
4. 受け入れ基準を明確化する

**期待される成果物**:

- `outputs/phase-1/requirements-specification.md`

---

## 参照資料

| 参照資料             | パス                                                                              | 内容         |
| -------------------- | --------------------------------------------------------------------------------- | ------------ |
| 仕様書セクション6.1  | `docs/30-workflows/skill-import-agent-system/specification.md`                    | ストア仕様   |
| 既存パターン         | `apps/desktop/src/main/settings/slideSettingsStore.ts`                            | 実装パターン |
| 共通型定義           | `packages/shared/src/types/skill.ts`                                              | 型定義       |
| オリジナルタスク定義 | `docs/30-workflows/skill-import-agent-system/tasks/task-2b-skill-import-store.md` | タスク要件   |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                   | 内容                |
| -------------------- | ---------------------------------------------------------------------- | ------------------- |
| コアインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-core.md` | Repository パターン |
| エラーハンドリング   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`  | エラー処理方針      |

---

## 成果物

| 成果物           | パス                                              | 内容                   |
| ---------------- | ------------------------------------------------- | ---------------------- |
| 既存パターン分析 | `outputs/phase-1/existing-pattern-analysis.md`    | slideSettingsStore分析 |
| 仕様整合性確認   | `outputs/phase-1/specification-alignment.md`      | spec.md との整合性     |
| 型定義整合性確認 | `outputs/phase-1/type-alignment.md`               | 共通型との整合性       |
| IPC連携要件      | `outputs/phase-1/ipc-integration-requirements.md` | IPC連携仕様            |
| 要件仕様書       | `outputs/phase-1/requirements-specification.md`   | 最終要件仕様           |

---

## 統合テスト連携

> IPC Handlers（TASK-4-2）との接続要件を要件に明記する

| 連携ポイント         | 確認事項                              |
| -------------------- | ------------------------------------- |
| IPC → Store 呼び出し | ストアメソッドの同期/非同期動作       |
| エラー伝播           | ストアエラーの IPC レスポンスへの変換 |
| 型の共有             | TASK-1-1 型定義の共有方法             |
| テスト分離           | ストア単体テストとIPC統合テストの境界 |

---

## 完了条件

- [ ] 既存パターン分析が完了し、`existing-pattern-analysis.md` が生成されている
- [ ] 仕様書との整合性確認が完了し、`specification-alignment.md` が生成されている
- [ ] 共通型定義との整合性確認が完了し、`type-alignment.md` が生成されている
- [ ] IPC連携要件が定義され、`ipc-integration-requirements.md` が生成されている
- [ ] 最終要件仕様書が作成され、`requirements-specification.md` が生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（5タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（5ファイル）が全て生成されていることを確認

---

## 依存関係

- **前提**: TASK-1-1（共通型定義）が完了していること
- **後続**: Phase 2（設計）へ進む

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
## Phase 1 実行記録

### 実行タスク

- タスク1（既存パターン分析）: {{result}}
- タスク2（仕様整合性確認）: {{result}}
- タスク3（型定義整合性確認）: {{result}}
- タスク4（IPC連携要件定義）: {{result}}
- タスク5（要件仕様書作成）: {{result}}

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

`docs/30-workflows/skill-import-agent-system/tasks/task-2b-skill-import-store/phase-2-design.md`
