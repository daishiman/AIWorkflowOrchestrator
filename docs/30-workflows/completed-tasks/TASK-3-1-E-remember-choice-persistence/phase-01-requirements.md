# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 1                                      |
| Phase名    | 要件定義                               |
| 前提Phase  | なし                                   |
| 後続Phase  | Phase 2                                |
| ステータス | 未実施                                 |
| 作成日     | 2026-01-25                             |
| 機能名     | task-3-1-e-remember-choice-persistence |

---

## 目的

rememberChoice機能永続化の要件を明確にし、データ構造・インターフェース・制約条件を定義する。

## 背景

TASK-3-1-Cで`SkillPermissionResponse.rememberChoice`フィールドが実装されたが、永続化機能が未実装のため、アプリ再起動後に設定が失われる問題がある。この問題を解決するための要件を整理する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 既存実装の確認

**目的**: 現在のPermissionRequest/Response処理フローを把握する

**実行手順**:

1. `apps/desktop/src/main/services/skill/SkillExecutor.ts`を読み、PermissionRequest/Response処理を確認
2. `apps/desktop/src/main/services/skill/PermissionResolver.ts`を読み、待機・解決ロジックを確認
3. `packages/shared/src/types/skill.ts`からSkillPermissionResponse型定義を確認
4. 現在の処理フローを図示してdocs記載

**期待される成果物**:

- 既存処理フローの理解
- 永続化追加箇所の特定

---

### タスク2: 要件一覧の作成

**目的**: 機能要件・非機能要件を明確に定義する

**実行手順**:

1. 機能要件を列挙（永続化、自動許可、削除機能など）
2. 非機能要件を列挙（セキュリティ、パフォーマンス、互換性など）
3. スコープ外を明確化（時間制限、引数別設定など）
4. 要件一覧表を作成

**期待される成果物**:

- `outputs/phase-1/requirements-list.md`

---

### タスク3: データ構造設計

**目的**: PermissionStoreのスキーマを定義する

**実行手順**:

1. 必要なデータ項目を列挙（ツール名、許可日時、バージョンなど）
2. electron-storeで永続化するスキーマを設計
3. バージョン管理方針を検討
4. スキーマ定義をドキュメント化

**期待される成果物**:

- `outputs/phase-1/data-schema.md`

**想定スキーマ**:

```typescript
interface PermissionStoreSchema {
  version: number;
  allowedTools: Array<{
    toolName: string;
    allowedAt: string; // ISO8601
  }>;
  updatedAt: string;
}
```

---

### タスク4: インターフェース定義

**目的**: PermissionStoreクラスの公開APIを定義する

**実行手順**:

1. 必要なメソッドを列挙
2. 各メソッドのシグネチャを定義
3. エラーハンドリング方針を決定
4. インターフェース定義をドキュメント化

**期待される成果物**:

- `outputs/phase-1/interface-definition.md`

**想定インターフェース**:

```typescript
interface IPermissionStore {
  isToolAllowed(toolName: string): boolean;
  allowTool(toolName: string): void;
  revokeTool(toolName: string): void;
  getAllowedTools(): string[];
  clearAll(): void;
}
```

---

### タスク5: セキュリティ考慮事項の整理

**目的**: セキュリティリスクと対策を明確にする

**実行手順**:

1. 危険なツールのリストを定義（Bash等）
2. 自動許可除外オプションの要否を検討
3. 設定ファイルの保護方針を決定
4. セキュリティ要件をドキュメント化

**期待される成果物**:

- `outputs/phase-1/security-considerations.md`

---

## 参照資料

| 参照資料                  | パス                                                                            | 内容                                        |
| ------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------- |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`     | SkillPermissionResponse型（rememberChoice） |
| セキュリティパターン      | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md` | セキュリティ考慮事項                        |
| SkillExecutor実装         | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                         | 現在のPermission処理                        |
| PermissionResolver実装    | `apps/desktop/src/main/services/skill/PermissionResolver.ts`                    | 権限確認待機ロジック                        |

---

## 成果物

| 成果物               | パス                                         | 内容                     |
| -------------------- | -------------------------------------------- | ------------------------ |
| 要件一覧             | `outputs/phase-1/requirements-list.md`       | 機能/非機能要件一覧      |
| データスキーマ定義   | `outputs/phase-1/data-schema.md`             | PermissionStore スキーマ |
| インターフェース定義 | `outputs/phase-1/interface-definition.md`    | 公開API定義              |
| セキュリティ考慮事項 | `outputs/phase-1/security-considerations.md` | セキュリティリスクと対策 |

---

## 統合テスト連携（Phase 1〜11は必須）

- 接続要件（API/認証/データフロー）を要件に明記
- IPCチャネル定義の追加要件を明記（設定取得/削除用）
- electron-storeとの連携要件を明記

---

## 完了条件

- [ ] 既存のPermissionRequest/Response処理フローを理解した
- [ ] 機能要件・非機能要件を明確に定義した
- [ ] PermissionStoreのデータスキーマを設計した
- [ ] PermissionStoreの公開インターフェースを定義した
- [ ] セキュリティ考慮事項を整理した
- [ ] 全ての成果物が`outputs/phase-1/`に出力されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし
- **後続**: Phase 2（設計）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/task-3-1-e-remember-choice-persistence/phase-02-design.md`
