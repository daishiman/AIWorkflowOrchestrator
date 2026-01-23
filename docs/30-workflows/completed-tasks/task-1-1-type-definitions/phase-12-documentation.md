# Phase 12: ドキュメント更新

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| フェーズ     | 12                                       |
| フェーズ名   | ドキュメント更新                         |
| 目的         | ドキュメント更新・仕様反映・未タスク検出 |
| 前提フェーズ | Phase 11: 手動テスト検証                 |
| 次フェーズ   | Phase 13: PR作成                         |
| 想定成果物   | 更新ドキュメント・未タスクレポート       |

---

## 1. 目的

実装完了に伴うドキュメント更新を行い、残存課題を検出・記録する。

---

## 2. 実行タスク（4タスク - 全て完了必須）

### Task 12-1: 実装ガイド作成

**目的**: 型定義の使用方法を説明するドキュメントを作成

**成果物**: 本タスク仕様書内に記載

#### Part 1: 概念的説明（初学者・非技術者向け）

##### 型定義とは

型定義は、データの「形」を定義するものです。例えば、スキルの情報を表す「SkillMetadata」という型は、スキルの名前、説明、ファイルパスなどの情報をまとめて管理します。

##### 主要な型の概要

| 型名               | 用途                             |
| ------------------ | -------------------------------- |
| SkillMetadata      | スキルの基本情報を表す           |
| ImportedSkill      | インポート済みスキルの情報を表す |
| SkillStreamMessage | 実行中のメッセージを表す         |
| PermissionRequest  | 権限確認のリクエストを表す       |

#### Part 2: 技術的詳細（開発者向け）

##### インポート方法

```typescript
import type {
  SkillMetadata,
  SkillSubResource,
  ImportedSkill,
  SkillExecutionRequest,
  SkillStreamMessage,
  PermissionRequest,
} from "@repo/shared";
```

##### SkillMetadata の使用例

```typescript
const metadata: SkillMetadata = {
  name: "my-skill",
  description: "My custom skill",
  path: "/path/to/skill",
  updatedAt: new Date(),
  agents: [
    { filename: "agent.md", relativePath: "agents/agent.md", size: 1024 },
  ],
  references: [],
  scripts: [],
  assets: [],
  schemas: [],
  indexes: [],
  otherFiles: [],
};
```

##### Discriminated Union の使用

```typescript
function handleMessage(msg: SkillStreamMessage): void {
  switch (msg.type) {
    case "assistant":
      console.log(msg.content.text);
      break;
    case "tool_use":
      console.log(msg.content.toolName, msg.content.args);
      break;
    case "tool_result":
      console.log(msg.content.success ? "成功" : "失敗");
      break;
    case "status":
      console.log(msg.content.status);
      break;
    case "error":
      console.error(msg.content.code, msg.content.message);
      break;
  }
}
```

### Task 12-2: システム仕様書更新

**目的**: aiworkflow-requirements の関連仕様を更新（必要な場合）

> 📖 **必須参照**: `.claude/skills/task-specification-creator/references/spec-update-workflow.md`

#### Step 1: タスク完了記録（必須）

- [ ] `interfaces-agent-sdk.md` の「完了タスク」セクションに TASK-1-1 を追加
- [ ] 「関連ドキュメント」に本仕様書リンクを追加

#### Step 2: システム仕様更新（条件付き）

**更新判断基準**:
| 更新が必要な場合 | 更新が不要な場合 |
| ---------------------------------- | ---------------------------------------- |
| 新規インターフェース/型追加 | 内部実装の詳細変更のみ |
| 既存インターフェース変更 | リファクタリング（インターフェース不変） |

**本タスクの判断**:

- specification.md に既に型定義が詳細に記載済み
- aiworkflow-requirements への追加は**不要**（仕様書側で管理）

#### フォールバック手順

仕様更新が不要と判断した場合:

- [ ] documentation-changelog.md に「更新なし」の判断根拠を明記

### Task 12-3: ドキュメント更新履歴作成

**目的**: 変更内容を記録

**コマンド（推奨）**:

```bash
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/skill-import-agent-system/tasks/task-1-1-type-definitions
```

**手動作成時の内容**:

```markdown
## ドキュメント更新履歴

### 更新日: YYYY-MM-DD

#### 作成・更新ファイル

| ファイル                             | 変更種別 | 概要            |
| ------------------------------------ | -------- | --------------- |
| `packages/shared/src/types/skill.ts` | 更新     | §5.1 型定義追加 |

#### システム仕様更新

- **更新なし**: specification.md に詳細記載済みのため

#### ソースコード変更概要

- SkillMetadata, SkillSubResource, SkillOtherFile 型追加
- ImportedSkill 型追加
- SkillExecutionRequest/Response 型追加
- SkillStreamMessage Discriminated Union 追加
- PermissionRequest/Response 型追加
```

### Task 12-4: 未タスク検出レポート作成

**目的**: 残存課題を検出し記録（0件でも出力必須）

**検出対象**:

- FAILテスト
- 重要度「高」課題
- WCAG違反
- TODO/FIXME コメント

**コマンド**:

```bash
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --workflow docs/30-workflows/skill-import-agent-system/tasks/task-1-1-type-definitions \
  --sources "packages/shared/src/types/"
```

**レポート形式**:

```markdown
## 検出結果サマリー

| ソース           | 検出数  |
| ---------------- | ------- |
| テスト結果       | 0件     |
| 発見課題         | 0件     |
| アクセシビリティ | N/A     |
| **合計**         | **0件** |

## 検出タスク一覧

**検出タスクなし**

すべてのテストがPASSし、発見課題もないため、未タスクとして記録すべき項目はありません。
```

---

## 3. 参照資料

| 資料名               | パス                                                                           |
| -------------------- | ------------------------------------------------------------------------------ |
| 仕様更新ワークフロー | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` |
| システム仕様         | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`    |
| 機能仕様書           | `docs/30-workflows/skill-import-agent-system/specification.md`                 |

---

## 4. 完了条件

- [ ] Task 12-1 完了: 実装ガイド作成（Part 1 + Part 2）
- [ ] Task 12-2 完了: システム仕様書更新（または「更新なし」判断の記録）
- [ ] Task 12-3 完了: ドキュメント更新履歴作成
- [ ] Task 12-4 完了: 未タスク検出レポート作成（0件でも出力）

---

## 5. 成果物

| 成果物           | パス               | 状態     |
| ---------------- | ------------------ | -------- |
| 実装ガイド       | このドキュメント内 | 作成待ち |
| 更新履歴         | このドキュメント内 | 作成待ち |
| 未タスクレポート | このドキュメント内 | 作成待ち |

---

## 6. 統合テスト連携【必須】

> **N/A**: 本タスクは型定義のみのため、ドキュメント更新フェーズでの統合テスト連携は対象外です。
>
> ドキュメント更新において、以下の統合テスト関連項目は適用されません：
>
> | ドキュメント項目 | 確認内容                     | 適用 |
> | ---------------- | ---------------------------- | ---- |
> | API ドキュメント | エンドポイント説明更新       | N/A  |
> | 統合テスト手順   | テスト実行方法のドキュメント | N/A  |
> | 環境構築ガイド   | 統合環境セットアップ         | N/A  |

---

## 7. Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100%実行完了
- [ ] 各タスクを 100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 8. サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. Task 12-1: 実装ガイド作成
3. Task 12-2: システム仕様書更新
4. Task 12-3: ドキュメント更新履歴作成
5. Task 12-4: 未タスク検出レポート作成
6. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-23 | 初版作成 |
