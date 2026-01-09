# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 2                            |
| Phase名    | 設計                         |
| 前提Phase  | Phase 1 (要件定義)           |
| 後続Phase  | Phase 3 (設計レビューゲート) |
| ステータス | 未実施                       |
| 作成日     | 2026-01-08                   |
| 機能名     | CONV-05-02-history-service   |

---

## 目的

履歴取得サービスのアーキテクチャ設計・インターフェース設計・型定義を行う。

## 背景

Phase 1で定義した要件を実現するための技術設計を行う。
Repository Pattern、型安全、Zodスキーマを活用した堅牢な設計を目指す。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: repository-pattern

**パス**: `.claude/skills/repository-pattern/SKILL.md`

**Trigger条件**:

- データ層との抽象化インターフェースを設計する場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-2/architecture-design.md`（リポジトリ連携設計）

---

### スキル2: type-safety-patterns

**パス**: `.claude/skills/type-safety-patterns/SKILL.md`

**Trigger条件**:

- TypeScript型安全パターンの設計が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-2/type-definitions.md`

---

### スキル3: zod-validation

**パス**: `.claude/skills/zod-validation/SKILL.md`

**Trigger条件**:

- Zodスキーマによるランタイムバリデーション設計が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-2/api-specification.md`（スキーマ定義含む）

---

## 参照資料

| 参照資料     | パス                                                              | 内容                     |
| ------------ | ----------------------------------------------------------------- | ------------------------ |
| 要件定義書   | `outputs/phase-1/requirements-definition.md`                      | 機能要件・非機能要件     |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`                          | テスト可能な受け入れ条件 |
| タスク指示書 | `docs/30-workflows/unassigned-task/task-05-02-history-service.md` | 実装仕様詳細             |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料       | パス                                                                | 内容                 |
| -------------- | ------------------------------------------------------------------- | -------------------- |
| アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/architecture.md` | 全体アーキテクチャ   |
| API設計規約    | `.claude/skills/aiworkflow-requirements/references/api-design.md`   | API設計ガイドライン  |
| データモデル   | `.claude/skills/aiworkflow-requirements/references/data-model.md`   | DB設計・エンティティ |

---

## 成果物

| 成果物             | パス                                     | 内容                           |
| ------------------ | ---------------------------------------- | ------------------------------ |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md` | レイヤー構成・依存関係         |
| 型定義設計         | `outputs/phase-2/type-definitions.md`    | TypeScript型・インターフェース |
| API仕様            | `outputs/phase-2/api-specification.md`   | サービスAPI・Zodスキーマ       |

---

## 設計指針

### IHistoryService インターフェース

```typescript
interface IHistoryService {
  getFileHistory(
    fileId: string,
    options?: HistoryOptions,
  ): Promise<Result<PaginatedResult<VersionHistoryItem>, Error>>;
  getVersionDetail(
    conversionId: string,
  ): Promise<Result<VersionHistoryItem, Error>>;
  getVersionDiff(
    conversionIdA: string,
    conversionIdB: string,
  ): Promise<Result<VersionDiff, Error>>;
  restoreToVersion(
    fileId: string,
    conversionId: string,
  ): Promise<Result<VersionHistoryItem, Error>>;
  getLatestVersion(
    fileId: string,
  ): Promise<Result<VersionHistoryItem | null, Error>>;
  getVersionCount(fileId: string): Promise<Result<number, Error>>;
}
```

### 依存関係

```
HistoryService
    ├── ConversionRepository（依存）
    ├── FileRepository（依存）
    └── IConversionLogger（依存）
```

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 2での必須アクション

- [ ] 統合ポイント/契約（API・スキーマ）を設計に反映
- [ ] ConversionRepository/FileRepositoryとのインターフェース契約を定義
- [ ] エラーハンドリングの統合パターンを設計

---

## 完了条件

- [ ] アーキテクチャ設計書が作成されている
- [ ] IHistoryServiceインターフェースが設計されている
- [ ] 型定義（VersionHistoryItem, HistoryFilter等）が設計されている
- [ ] Zodスキーマが設計されている
- [ ] リポジトリ層との連携設計が完了している
- [ ] 統合テスト観点の契約が定義されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 2 実行記録

### 使用スキル

- repository-pattern: {{result}}
- type-safety-patterns: {{result}}
- zod-validation: {{result}}

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

`docs/30-workflows/CONV-05-02-history-service/phase-3-design-review.md`
