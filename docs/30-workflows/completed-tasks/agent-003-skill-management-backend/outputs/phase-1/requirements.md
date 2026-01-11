# スキル管理バックエンド - 要件定義書（統合版）

## メタ情報

| 項目     | 内容                              |
| -------- | --------------------------------- |
| Phase    | 1                                 |
| タスク   | タスク5: 要件定義ドキュメント統合 |
| 作成日   | 2026-01-11                        |
| 機能名   | スキル管理バックエンド            |
| タスクID | AGENT-003                         |

---

## 1. 機能要件

### 1.1 概要

Main ProcessでClaude Codeのスキルを読み込み・解析し、ユーザーが選択したスキルをインポート・管理する機能を実装する。

### 1.2 IPCエンドポイント一覧

| チャネル名                    | 説明                     | 入力                     | 出力              |
| ----------------------------- | ------------------------ | ------------------------ | ----------------- | ----- |
| `agent:scan-available-skills` | 利用可能スキル一覧取得   | `{ basePath?: string }`  | `SkillScanResult` |
| `agent:get-imported-skills`   | インポート済みスキル取得 | なし                     | `Skill[]`         |
| `agent:import-skills`         | スキルインポート         | `{ skillIds: string[] }` | `ImportResult`    |
| `agent:remove-skill`          | スキル削除               | `{ skillId: string }`    | `RemoveResult`    |
| `agent:get-skill-detail`      | スキル詳細取得           | `{ skillId: string }`    | `Skill            | null` |

### 1.3 成果物

| コンポーネント     | ファイルパス                                                 |
| ------------------ | ------------------------------------------------------------ |
| SkillScanner       | `apps/desktop/src/main/services/skill/SkillScanner.ts`       |
| SkillParser        | `apps/desktop/src/main/services/skill/SkillParser.ts`        |
| SkillImportManager | `apps/desktop/src/main/services/skill/SkillImportManager.ts` |
| SkillService       | `apps/desktop/src/main/services/skill/SkillService.ts`       |
| IPC Handlers       | `apps/desktop/src/main/ipc/agentHandlers.ts`                 |
| 型定義             | `packages/shared/src/types/agent.ts`                         |

---

## 2. 非機能要件

### 2.1 パフォーマンス

| 要件             | 目標値    |
| ---------------- | --------- |
| 初回スキャン     | 3秒以内   |
| キャッシュ利用時 | 100ms以内 |

### 2.2 永続化

- ストレージ: electron-store
- 保存対象: インポート済みスキルID一覧、スキルパス設定

### 2.3 エラーハンドリング

- 部分的失敗を許容（1つのスキル解析失敗で全体が失敗しない）
- 解析エラーを`SkillScanError[]`として収集・返却

---

## 3. SKILL.md解析仕様

### 3.1 YAML Frontmatter

**必須フィールド**:

- `name`: スキル識別子（ハイフンケース、最大64文字）
- `description`: スキル説明（最大1024文字、Anchors・Trigger含む）

**任意フィールド**:

- `license`, `allowed-tools`, `tags`, `dependencies`

### 3.2 Anchors解析

```
Anchors:
• {{アンカー名}} / 適用: {{適用範囲}} / 目的: {{目的}}
```

### 3.3 Trigger解析

```
Trigger:
keyword1, keyword2, keyword3
Use when creating task specifications.
```

### 3.4 Fallback値

```typescript
const defaultSkill: Partial<Skill> = {
  name: "Unknown Skill",
  description: "Description not available",
  triggers: [],
  anchors: [],
};
```

---

## 4. セキュリティ要件

### 4.1 パストラバーサル防止

- `../`を含むパスを拒否
- ベースパス外へのアクセスを禁止
- パスの正規化後に検証

```typescript
function isPathSafe(inputPath: string, basePath: string): boolean {
  const normalizedInput = path.normalize(inputPath);
  const normalizedBase = path.normalize(basePath);
  return normalizedInput.startsWith(normalizedBase);
}
```

### 4.2 IPC sender検証

- webContentsに対応するBrowserWindowの存在確認
- DevToolsからの呼び出し検出・拒否
- 許可されたウィンドウリストとの照合

### 4.3 入力バリデーション

| フィールド | バリデーション                                       |
| ---------- | ---------------------------------------------------- |
| skillId    | 非空文字列、64文字以内、ハイフンケース               |
| skillIds   | 配列、各要素がskillIdバリデーションを通過            |
| basePath   | 絶対パス、存在するディレクトリ、パストラバーサルなし |

---

## 5. 受け入れ基準

### 5.1 主要シナリオ

1. **利用可能なスキル一覧を取得できる** - 10個のスキルを3秒以内で取得
2. **スキルをインポートできる** - electron-storeに永続化
3. **インポート済みスキル一覧を取得できる** - インポート済みのみ返却
4. **インポート済みスキルを削除できる** - 設定が永続化される
5. **スキル詳細を取得できる** - anchors, triggersを含む

### 5.2 エッジケース

6. **SKILL.mdがないディレクトリは除外される**
7. **アプリ再起動後もインポート設定が維持される**
8. **スキルパスを設定できる**

### 5.3 セキュリティシナリオ

9. **パストラバーサル攻撃を防止する** - エラーコード`VALIDATION_ERROR`
10. **IPC sender検証でDevToolsからの呼び出しを拒否する** - エラーコード`AUTH_ERROR`

---

## 6. 型定義

### 6.1 Skill型

```typescript
export interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string;
  path: string;
  triggers: string[];
  anchors: Anchor[];
  tags?: string[];
  allowedTools?: string[];
  dependencies?: string[];
  lastModified: Date;
}
```

### 6.2 Anchor型

```typescript
export interface Anchor {
  source: string;
  application: string;
  purpose: string;
}
```

### 6.3 結果型

```typescript
export interface SkillScanResult {
  skills: Skill[];
  errors: SkillScanError[];
  scannedAt: Date;
}

export interface ImportResult {
  success: boolean;
  importedCount: number;
  errors: string[];
}

export interface RemoveResult {
  success: boolean;
  message?: string;
}
```

### 6.4 エラー型

```typescript
export interface SkillScanError {
  path: string;
  error: string;
}

export interface IPCError {
  code:
    | "VALIDATION_ERROR"
    | "NOT_FOUND"
    | "AUTH_ERROR"
    | "INTERNAL_ERROR"
    | "PATH_TRAVERSAL";
  message: string;
  details?: unknown;
}
```

---

## 7. 制約事項

- スキル実行機能は含まない（AGENT-005で実装）
- 実行環境管理は含まない（AGENT-007で実装）
- スキル編集・作成機能はスコープ外
- ファイル変更監視は初期実装では除外

---

## 8. 参照資料

| 資料名               | パス                                                                                |
| -------------------- | ----------------------------------------------------------------------------------- |
| Skill構造仕様        | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md` |
| Electronセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`        |
| タスク指示書         | `docs/30-workflows/unassigned-task/task-agent-03-skill-management-backend.md`       |

---

## Phase 1 実行記録

### 実行タスク

- タスク1 機能要件の定義: ✅ 完了
- タスク2 SKILL.md解析仕様の定義: ✅ 完了
- タスク3 受け入れ基準の定義: ✅ 完了
- タスク4 IPC契約の定義: ✅ 完了
- タスク5 要件定義ドキュメント統合: ✅ 完了

### 成果物

| 成果物           | パス                                         | 状態          |
| ---------------- | -------------------------------------------- | ------------- |
| 機能要件         | `outputs/phase-1/functional-requirements.md` | ✅ 作成済み   |
| SKILL.md解析仕様 | `outputs/phase-1/skill-md-spec.md`           | ✅ 作成済み   |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md`     | ✅ 作成済み   |
| IPC契約          | `outputs/phase-1/ipc-contract.md`            | ✅ 作成済み   |
| 要件定義（統合） | `outputs/phase-1/requirements.md`            | ✅ 本ファイル |

### 発見事項

- 良かった点: 既存のaiworkflow-requirements仕様と整合性が取れている
- 問題点: なし
- 改善提案: なし

### 次Phaseへの引き継ぎ事項

- 型定義は`packages/shared/src/types/agent.ts`に配置
- セキュリティ実装は`security-api-electron.md`を参照
- SKILL.md解析はYAML Frontmatter + descriptionセクション方式
