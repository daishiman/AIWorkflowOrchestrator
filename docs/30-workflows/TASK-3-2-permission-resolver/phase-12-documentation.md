# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 12                      |
| Phase名    | ドキュメント更新        |
| 前提Phase  | Phase 11                |
| 後続Phase  | Phase 13                |
| ステータス | 未実施                  |
| 作成日     | 2026-01-25              |
| 機能名     | PermissionResolver 実装 |

---

## 目的

ドキュメントを更新し、システム仕様との整合性を確保する。
実装ガイド作成と未タスク検出を行う。

## 背景

Phase 1〜11 で実装が完了したため、ドキュメントを更新し、
後続タスク（TASK-4-2 など）の参照資料を整備する。

---

## 実行タスク

### タスク 1: 実装ガイド作成

**目的**: 実装内容の説明ドキュメントを作成する

**実行手順**:

**Part 1: 概念的説明（初学者・非技術者向け）**

1. PermissionResolver の役割を平易に説明
2. 使用シナリオを説明
3. 他コンポーネントとの関係を図示

**Part 2: 技術的詳細（開発者向け）**

1. API リファレンスを作成
2. 使用例コードを記載
3. 注意点・制約事項を記載

**期待される成果物**:

- 実装ガイド（2パート構成）

### タスク 2: システム仕様書更新

**目的**: aiworkflow-requirements の仕様書を更新する

> **必読**: `.claude/skills/task-specification-creator/references/spec-update-workflow.md`

**⚠️ 2ステップで実行:**

**Step 1: タスク完了記録（必須）**

```
□ interfaces-agent-sdk.md の「## 完了タスク」セクションにTASK-3-2を追加
□ 「## 関連ドキュメント」に実装ガイドリンクを追加
```

**Step 2: システム仕様更新（条件付き）**

更新判断基準に基づき更新要否を判断:

| 更新が必要な場合            | 更新が不要な場合                         |
| --------------------------- | ---------------------------------------- |
| 新規インターフェース/型追加 | 内部実装の詳細変更のみ                   |
| 既存インターフェース変更    | リファクタリング（インターフェース不変） |
| 新規定数/設定値追加         | バグ修正（仕様変更なし）                 |

**本タスクの判断**:

- PermissionResolver は新規クラスだが、型定義（PermissionRequest/Response）は TASK-1-1 で既に追加済み
- 内部実装クラスであり、外部インターフェースへの影響は最小限
- → Step 2 は「更新なし」と判断可能（documentation-changelog.md に根拠を明記）

**期待される成果物**:

- システム仕様更新チェック結果

### タスク 3: ドキュメント更新履歴作成

**目的**: 更新内容を記録する

**実行手順**:

```bash
# 自動生成スクリプト（推奨）
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/skill-import-agent-system/tasks/TASK-3-2-permission-resolver
```

**手動補完項目**:

- システム仕様更新内容または「更新なし」の判断根拠
- ソースコード変更の概要

**期待される成果物**:

- documentation-changelog.md

### タスク 4: 未タスク検出レポート作成

**目的**: 残課題を検出・記録する

**実行手順**:

1. Phase 11 の発見課題を確認
2. FAIL テスト、重要度「高」課題、WCAG 違反を検出
3. 検出結果をレポート

**期待される成果物**:

- 未タスク検出レポート（0件でも出力必須）

---

## 参照資料

| 参照資料        | パス                                                                           | 内容         |
| --------------- | ------------------------------------------------------------------------------ | ------------ |
| Phase 11 成果物 | `phase-11-manual-test.md`                                                      | 発見課題     |
| 仕様更新フロー  | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 更新判断基準 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                        | 内容     |
| -------------------- | --------------------------------------------------------------------------- | -------- |
| interfaces-agent-sdk | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | 更新対象 |

---

## 成果物

| 成果物           | パス                                          | 内容        |
| ---------------- | --------------------------------------------- | ----------- |
| 実装ガイド       | `outputs/phase-12/implementation-guide.md`    | 2パート構成 |
| 更新履歴         | `outputs/phase-12/documentation-changelog.md` | 変更記録    |
| 未タスクレポート | `outputs/phase-12/unassigned-task-report.md`  | 0件含む     |

---

## 実装ガイドテンプレート

### Part 1: 概念的説明

```markdown
# PermissionResolver 概念ガイド

## 役割

PermissionResolver は、スキル実行時の権限確認を管理するコンポーネントです。
ユーザーがツール使用を許可するまで待機し、その結果を実行処理に返します。

## 使用シナリオ

1. スキル実行中に危険なツール（ファイル削除など）が呼ばれる
2. Main Process が Renderer に権限確認ダイアログを表示させる
3. PermissionResolver がユーザー応答を待機
4. ユーザーが許可/拒否を選択
5. PermissionResolver が結果を返し、実行が続行/中止

## 他コンポーネントとの関係

- **SkillExecutor**: PermissionResolver を使用して権限確認
- **IPC Handlers**: Renderer からの応答を PermissionResolver に中継
- **PermissionDialog**: ユーザーに権限確認を表示
```

### Part 2: 技術的詳細

```markdown
# PermissionResolver API リファレンス

## インポート

\`\`\`typescript
import { PermissionResolver } from "@repo/desktop/main/services/skill";
\`\`\`

## コンストラクタ

\`\`\`typescript
new PermissionResolver(defaultTimeout?: number)
\`\`\`

- `defaultTimeout`: タイムアウト時間（ms）。デフォルト: 300000（5分）

## メソッド

### waitForResponse

\`\`\`typescript
async waitForResponse(
requestId: string,
signal?: AbortSignal
): Promise<PermissionResponse>
\`\`\`

### resolveRequest

\`\`\`typescript
resolveRequest(response: PermissionResponse): void
\`\`\`

### cancelRequest

\`\`\`typescript
cancelRequest(requestId: string, reason?: string): void
\`\`\`

### cancelAll

\`\`\`typescript
cancelAll(): void
\`\`\`

### pendingCount

\`\`\`typescript
get pendingCount(): number
\`\`\`

## 使用例

\`\`\`typescript
const resolver = new PermissionResolver();

// 権限確認を待機
const response = await resolver.waitForResponse(requestId);

if (response.approved) {
// ツール実行を続行
} else {
// 実行を中止
}
\`\`\`

## 注意事項

- タイムアウト時は Error がスローされる
- AbortSignal でキャンセル可能
- resolveRequest は存在しない requestId を無視する
```

---

## 未タスク検出レポートテンプレート

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

## 備考

- 本クラスは Main Process で動作するため、アクセシビリティ検証は対象外
- 統合テスト（TASK-8c）で追加検証予定
```

---

## 完了条件

- [ ] 実装ガイド（2パート）が作成されている
- [ ] システム仕様更新チェックが完了している（Step 1 必須）
- [ ] documentation-changelog.md が作成されている
- [ ] 未タスク検出レポートが作成されている（0件でも出力）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 11 が完了していること
- **後続**: Phase 13 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-agent-system/tasks/TASK-3-2-permission-resolver/phase-13-pr-creation.md`
