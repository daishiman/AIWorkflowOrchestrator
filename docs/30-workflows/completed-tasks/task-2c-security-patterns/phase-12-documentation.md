# Phase 12: ドキュメント更新

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| フェーズ     | 12                                       |
| フェーズ名   | ドキュメント更新                         |
| 目的         | ドキュメント更新・仕様反映・未タスク検出 |
| 前提フェーズ | Phase 11: 手動テスト検証                 |
| 次フェーズ   | Phase 13: PR作成                         |
| 想定成果物   | 実装ガイド、ドキュメント更新履歴         |

---

## 1. 目的

実装完了に伴うドキュメント更新を行い、未タスクがないか検出する。

---

## 2. 実行タスク

### Task 12-1: 実装ガイド作成

**目的**: 実装した機能の使用方法を文書化する

**ファイル**: `outputs/phase-12-implementation-guide.md`

**Part 1: 概念的説明（初学者・非技術者向け）**

```markdown
# セキュリティパターン定義

## 概要

スキル実行時に危険な操作を防ぐためのセキュリティパターンを定義しています。

## 何ができるか

- 危険なコマンド（`rm -rf`, `sudo` など）の検出
- 保護すべきパス（`/etc`, `~/.ssh` など）の検出
- 許可されたツールの検証

## なぜ必要か

AIがスキルを実行する際、意図しない破壊的な操作を防ぐ必要があります。
このモジュールは、実行前に危険な操作をブロックするための基盤を提供します。
```

**Part 2: 技術的詳細（開発者向け）**

```markdown
## 使用方法

### インポート

\`\`\`typescript
import {
DANGEROUS_PATTERNS,
ALLOWED_TOOLS_WHITELIST,
isDangerousCommand,
isProtectedPath,
validateAllowedTools,
filterAllowedTools,
type AllowedTool,
} from "@repo/shared";
\`\`\`

### API リファレンス

#### isDangerousCommand(command: string): boolean

コマンドに危険なパターンが含まれているか判定します。

\`\`\`typescript
isDangerousCommand("rm -rf /"); // true
isDangerousCommand("ls -la"); // false
\`\`\`

#### isProtectedPath(filePath: string): boolean

パスが保護対象かどうか判定します。

\`\`\`typescript
isProtectedPath("/etc/passwd"); // true
isProtectedPath("~/.ssh/id_rsa"); // true
isProtectedPath("/tmp/test.txt"); // false
\`\`\`

#### validateAllowedTools(tools: string[]): boolean

ツールリストが全て許可リストに含まれるか検証します。

\`\`\`typescript
validateAllowedTools(["Read", "Write"]); // true
validateAllowedTools(["Unknown"]); // false
\`\`\`

#### filterAllowedTools(tools: string[]): AllowedTool[]

許可されたツールのみをフィルタリングします。

\`\`\`typescript
filterAllowedTools(["Read", "Invalid"]); // ["Read"]
\`\`\`
```

### Task 12-2: システム仕様書更新

**目的**: aiworkflow-requirements の仕様書を更新する

📖 **必須**: `references/spec-update-workflow.md` を読み込んで判断する

**Step 1: タスク完了記録（必須）**

以下のセクションを該当する仕様書に追加:

- [ ] 「## 完了タスク」セクションに TASK-2C を追加
- [ ] 「## 関連ドキュメント」に実装ガイドリンクを追加

**Step 2: システム仕様更新（条件付き）**

本タスクの実装内容を確認:

| 変更タイプ               | 該当 | 更新対象                      |
| ------------------------ | ---- | ----------------------------- |
| 新規インターフェース追加 | No   | -                             |
| 新規型定義追加           | Yes  | AllowedTool 型                |
| 新規定数追加             | Yes  | DANGEROUS_PATTERNS, WHITELIST |
| 新規関数追加             | Yes  | isDangerousCommand等 5関数    |

**判断**: 新規型・定数・関数が追加されているため、システム仕様の更新が必要。

**更新対象ファイル**:

- [ ] `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`
  - セキュリティパターン定義セクションを追加
  - 関数シグネチャを記載

### Task 12-3: ドキュメント更新履歴作成

**目的**: 今回の変更履歴を記録する

**ファイル**: `outputs/phase-12-documentation-changelog.md`

```markdown
# ドキュメント更新履歴

## 変更サマリー

- 新規追加: セキュリティパターン定義
- 追加ファイル: `packages/shared/src/constants/security.ts`
- エクスポート更新: `packages/shared/src/index.ts`

## システム仕様更新

- 更新対象: `interfaces-agent-sdk.md`
- 更新内容: セキュリティパターン定義セクション追加

## ソースコード変更

| ファイル                                    | 変更種別 | 概要                       |
| ------------------------------------------- | -------- | -------------------------- |
| `packages/shared/src/constants/security.ts` | 新規     | パターン定義・関数         |
| `packages/shared/src/constants/index.ts`    | 新規     | エクスポート設定           |
| `packages/shared/src/index.ts`              | 更新     | constants エクスポート追加 |
```

### Task 12-4: 未タスク検出レポート作成（0件でも出力必須）

**目的**: 未完了タスクや残課題がないか検出する

**検出対象**:

- [ ] FAILテストの有無
- [ ] 重要度「高」の発見課題
- [ ] WCAG違反
- [ ] TODO/FIXME コメント

**検出コマンド**:

```bash
# TODO/FIXME 検出
grep -r "TODO\|FIXME" packages/shared/src/constants/

# 失敗テスト確認
pnpm --filter @repo/shared test -- --run
```

**レポート**: `outputs/phase-12-unassigned-task-report.md`

**0件の場合のフォーマット**:

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

**重要**: 検出結果が0件でもレポートを出力し、「検出タスクなし」と明記すること。

---

## 3. 参照資料

| 資料名                    | パス                                                                                    |
| ------------------------- | --------------------------------------------------------------------------------------- |
| 仕様更新ワークフロー      | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          |
| システム仕様（Agent SDK） | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`             |
| 技術ドキュメントガイド    | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md` |

---

## 4. 完了条件

- [ ] Task 12-1 完了: 実装ガイド作成（Part 1 + Part 2）
- [ ] Task 12-2 完了: システム仕様書更新（Step 1 必須 + Step 2 条件付き）
- [ ] Task 12-3 完了: ドキュメント更新履歴作成
- [ ] Task 12-4 完了: 未タスク検出レポート作成
- [ ] 全成果物が生成されている

---

## 5. 統合テスト連携【必須】

> **N/A**: 本タスクは定数・ユーティリティ関数のみのため、統合テスト連携は対象外です。

---

## 6. 成果物

| 成果物               | パス                                          | 状態     |
| -------------------- | --------------------------------------------- | -------- |
| 実装ガイド           | `outputs/phase-12-implementation-guide.md`    | 作成待ち |
| ドキュメント更新履歴 | `outputs/phase-12-documentation-changelog.md` | 作成待ち |
| 未タスク検出レポート | `outputs/phase-12-unassigned-task-report.md`  | 作成待ち |

---

## 7. Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100%実行完了
- [ ] 各タスクを 100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 8. サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. Task 12-1: 実装ガイド作成
2. Task 12-2: システム仕様書更新
3. Task 12-3: ドキュメント更新履歴作成
4. Task 12-4: 未タスク検出レポート作成
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-24 | 初版作成 |
