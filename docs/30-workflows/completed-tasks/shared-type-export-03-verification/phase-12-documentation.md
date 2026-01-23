# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase番号  | 12                       |
| Phase名    | ドキュメント更新         |
| 目的       | 実装ガイド・仕様書更新   |
| 前提Phase  | Phase 11（手動検証実行） |
| 推定作業量 | 小                       |

---

## 1. 目的

型エクスポート検証タスクの完了に伴い、関連ドキュメントを更新し、実装ガイドを作成する。

---

## 2. 実行タスク

### Task 12-1: 実装ガイド作成

#### 目的

Community型のインポート方法を説明する実装ガイドを作成する。

#### ガイド構成

**Part 1: 概念的説明（初学者・非技術者向け）**

- 型エクスポートの目的と意義
- モノレポにおける型共有の利点
- バレルファイル（index.ts）の役割

**Part 2: 技術的詳細（開発者向け）**

- インポート方法
- 使用例
- 注意事項

#### ガイドテンプレート

```markdown
# Community型インポートガイド

## 概要

このガイドでは、`@repo/shared/services/graph` からCommunity関連の型をインポートする方法を説明します。

## インポート方法

### 型のインポート（推奨）

\`\`\`typescript
import type {
Community,
CommunitySummary,
CommunityDetectionOptions,
CommunityDetectionResult,
} from "@repo/shared/services/graph";
\`\`\`

### 値のインポート

\`\`\`typescript
import {
CommunityErrorCode,
CommunityDetectionError,
} from "@repo/shared/services/graph";
\`\`\`

## 使用例

（具体的なコード例を記載）

## 注意事項

- 型は `export type` を使用してインポート
- 値（enum, class, 関数）は通常の `export` を使用
```

#### 成果物

| 成果物     | 配置先                                     |
| ---------- | ------------------------------------------ |
| 実装ガイド | `outputs/phase-12/implementation-guide.md` |

#### 完了条件

- [ ] Part 1（概念的説明）が作成されている
- [ ] Part 2（技術的詳細）が作成されている
- [ ] インポート方法が明確に説明されている

---

### Task 12-2: システム仕様書更新

#### 目的

aiworkflow-requirements の関連仕様書を更新する。

#### 📖 必須: spec-update-workflow.md を参照

更新判断の詳細は以下を参照:
`.claude/skills/task-specification-creator/references/spec-update-workflow.md`

#### Step 1: タスク完了記録（必須）

以下のチェックリストを実行:

- [ ] `interfaces-rag-community-detection.md` に「完了タスク」セクション追加
- [ ] 「関連ドキュメント」に実装ガイドリンク追加

#### Step 2: システム仕様更新（条件付き）

**更新判断基準**:

- 新規インターフェース/型追加 → 更新必要
- 既存インターフェース変更 → 更新必要
- 内部実装の詳細変更のみ → 更新不要

**本タスク（SHARED-TYPE-EXPORT-03）の場合**:

- 型定義自体の変更なし（エクスポートの追加のみ）
- 既存インターフェースの変更なし
- **判断: 更新不要**（インポート方法のみ変更）

#### 更新内容（必要な場合）

| 更新対象                              | 更新内容                       | 必要性 |
| ------------------------------------- | ------------------------------ | ------ |
| interfaces-rag-community-detection.md | インポート例の追加（済み）     | 済み   |
| architecture-monorepo.md              | 型エクスポートパターン（済み） | 済み   |

#### 成果物

| 成果物         | 配置先                                   |
| -------------- | ---------------------------------------- |
| 仕様書更新記録 | `outputs/phase-12/spec-update-record.md` |

#### 完了条件

- [ ] Step 1（タスク完了記録）が実施されている
- [ ] Step 2の更新要否が判断されている
- [ ] 更新内容（または「更新なし」の根拠）が記録されている

---

### Task 12-3: ドキュメント更新履歴作成

#### 目的

ドキュメント更新の履歴を記録する。

#### 自動生成スクリプト（推奨）

```bash
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/shared-type-export-03-verification
```

#### 手動補完項目

- システム仕様更新内容または「更新なし」の判断根拠
- ソースコード変更の概要

#### 成果物

| 成果物               | 配置先                                        |
| -------------------- | --------------------------------------------- |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md` |

#### 完了条件

- [ ] 更新履歴が作成されている
- [ ] システム仕様更新の判断根拠が明記されている

---

### Task 12-4: 未タスク検出レポート作成

#### 目的

本タスクで対応しなかった課題を検出・記録する。

#### 検出対象

| ソース           | 検出項目           |
| ---------------- | ------------------ |
| テスト結果       | FAILテスト         |
| 発見課題         | 重要度「高」の課題 |
| アクセシビリティ | WCAG違反           |

#### 検出方法

```bash
# TODO/FIXMEの検出
grep -r "TODO\|FIXME" packages/shared/src/services/graph/

# 本タスクで対応しなかった課題の確認
cat outputs/phase-*/discovered-issues.md 2>/dev/null || echo "No issues found"
```

#### レポートテンプレート（0件の場合）

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

#### 成果物

| 成果物               | 配置先                                       |
| -------------------- | -------------------------------------------- |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md` |

#### 完了条件

- [ ] 検出が実施されている
- [ ] 結果が記録されている（0件でも出力必須）

---

## 3. 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                      | パス                                                                                      | 内容                   |
| ----------------------------- | ----------------------------------------------------------------------------------------- | ---------------------- |
| モノレポアーキテクチャ        | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md`              | 型エクスポートパターン |
| Community検出インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-detection.md` | Community型定義        |

### スキル参照

| 参照資料             | パス                                                                           | 内容         |
| -------------------- | ------------------------------------------------------------------------------ | ------------ |
| 仕様更新ワークフロー | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 更新判断基準 |

### Phase 5/11成果物

| 成果物                 | 参照目的     |
| ---------------------- | ------------ |
| modifications.md       | 修正内容     |
| verification-report.md | 検証レポート |

---

## 4. 成果物一覧

| 成果物               | ファイル名                   | 必須 |
| -------------------- | ---------------------------- | ---- |
| 実装ガイド           | `implementation-guide.md`    | ✅   |
| 仕様書更新記録       | `spec-update-record.md`      | ✅   |
| ドキュメント更新履歴 | `documentation-changelog.md` | ✅   |
| 未タスク検出レポート | `unassigned-task-report.md`  | ✅   |

---

## 5. 完了条件

### 機能要件

- [ ] 実装ガイドが作成されている
- [ ] 仕様書更新が完了している（または「更新なし」が明記）
- [ ] ドキュメント更新履歴が作成されている
- [ ] 未タスク検出レポートが作成されている

### 品質要件

- [ ] 実装ガイドが分かりやすい
- [ ] 仕様書との整合性が保たれている
- [ ] 未タスクが漏れなく検出されている

### Phase完了時の必須アクション

1. 上記成果物を `outputs/phase-12/` に出力
2. artifacts.json の phase-12 ステータスを更新
3. 各タスクを100%実行し、完遂した旨を明記
