# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 12                         |
| Phase名    | ドキュメント更新           |
| 前提Phase  | Phase 11（手動テスト検証） |
| 後続Phase  | Phase 13（PR作成）         |
| ステータス | 未実施                     |
| 作成日     | 2026-01-22                 |
| 機能名     | React Context DI実装       |

---

## 目的

実装ガイド・システム仕様書更新・未タスク検出レポートを作成する。

## 背景

Phase 1〜11で実装とテストが完了した。本Phaseでは、ドキュメントを更新し、実装内容を記録する。また、未完了タスクがあれば検出・記録する。

---

## 実行タスク

> 以下の4タスクは全て完了必須です。

### タスク1: 実装ガイド作成

**目的**: 実装内容を説明する実装ガイドを作成する。

**実行手順**:

1. 実装ガイドを2パート構成で作成:

   **Part 1: 概念的説明（初学者・非技術者向け）**
   - React Context DIの概念
   - なぜDI（依存性注入）が必要か
   - Context/Provider/Hookの関係
   - 使用シナリオ

   **Part 2: 技術的詳細（開発者向け）**
   - 型定義の詳細
   - Provider実装の詳細
   - Hook使用方法
   - テストでのMockProvider使用方法
   - コード例

2. `outputs/phase-12/implementation-guide.md` に作成

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`

---

### タスク2: システム仕様書更新【重要】

**目的**: aiworkflow-requirementsのシステム仕様書を更新する（該当する場合）。

**実行手順**:

1. **必須**: `references/spec-update-workflow.md` を読み込む
2. 以下の更新判断チェックリストを実行:

   | チェック項目               | 該当 | 更新対象ファイル             |
   | -------------------------- | ---- | ---------------------------- |
   | □ 新規インターフェース追加 | ?    | interfaces-chat-history.md   |
   | □ 新規型定義追加           | ?    | interfaces-chat-history.md   |
   | □ 新規コンポーネント追加   | ?    | architecture-chat-history.md |
   | □ 新規Hook追加             | ?    | architecture-chat-history.md |
   | □ 依存関係変更             | ?    | architecture-chat-history.md |
   | □ 新規定数/設定値追加      | ?    | interfaces-chat-history.md   |

3. 該当する場合は以下のファイルを更新:
   - `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md`
   - `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`

4. 更新内容（または「更新不要」の理由）を `outputs/phase-12/spec-update-log.md` に記録

**本タスクで追加が想定される内容**:

```markdown
## UI Layer（追加項目）

### ChatHistoryContext

| コンポーネント          | パス                                                      | 責務                 |
| ----------------------- | --------------------------------------------------------- | -------------------- |
| ChatHistoryContext      | apps/desktop/src/features/chat-history/context/           | Context定義          |
| ChatHistoryProvider     | apps/desktop/src/features/chat-history/context/           | DI Provider          |
| useChatHistory          | apps/desktop/src/features/chat-history/hooks/             | Context取得Hook      |
| MockChatHistoryProvider | apps/desktop/src/features/chat-history/context/**mocks**/ | テスト用MockProvider |
```

**期待される成果物**:

- `outputs/phase-12/spec-update-log.md`
- （該当時）更新されたシステム仕様書ファイル

---

### タスク3: ドキュメント更新履歴作成

**目的**: 作成・更新したファイル一覧を記録する。

**実行手順**:

1. 本タスクで作成・更新した全ファイルを一覧化:

   | ファイル種別 | パス                                                                                 | 操作     |
   | ------------ | ------------------------------------------------------------------------------------ | -------- |
   | Context      | apps/desktop/src/features/chat-history/context/ChatHistoryContext.tsx                | 新規作成 |
   | Provider     | apps/desktop/src/features/chat-history/context/ChatHistoryProvider.tsx               | 新規作成 |
   | Hook         | apps/desktop/src/features/chat-history/hooks/useChatHistory.ts                       | 新規作成 |
   | MockProvider | apps/desktop/src/features/chat-history/context/**mocks**/MockChatHistoryProvider.tsx | 新規作成 |
   | テスト       | apps/desktop/src/features/chat-history/context/**tests**/ChatHistoryContext.test.tsx | 新規作成 |
   | テスト       | apps/desktop/src/features/chat-history/hooks/**tests**/useChatHistory.test.ts        | 新規作成 |
   | システム仕様 | .claude/skills/aiworkflow-requirements/references/architecture-chat-history.md       | 更新     |

2. `outputs/phase-12/document-changelog.md` に記録

**期待される成果物**:

- `outputs/phase-12/document-changelog.md`

---

### タスク4: 未タスク検出レポート作成【0件でも出力必須】

**目的**: FAILテスト、重要度「高」課題、WCAG違反を検出し、未タスクとして記録する。

**実行手順**:

1. 以下のソースから未タスクを検出:
   - Phase 11の発見課題（`outputs/phase-11/discovered-issues.md`）
   - FAILしたテストケース
   - 重要度「高」の課題
   - アクセシビリティ違反

2. 未タスク検出レポートを作成:

   **検出された場合**:

   ```markdown
   ## 検出結果サマリー

   | ソース           | 検出数  |
   | ---------------- | ------- |
   | テスト結果       | X件     |
   | 発見課題         | X件     |
   | アクセシビリティ | X件     |
   | **合計**         | **X件** |

   ## 検出タスク一覧

   | タスクID | 概要 | 優先度 | 対応期限 |
   | -------- | ---- | ------ | -------- |
   | UT-XXX   | XXX  | 高     | XXXX     |
   ```

   **検出されなかった場合（0件）**:

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

3. `outputs/phase-12/unassigned-tasks-report.md` に記録

**期待される成果物**:

- `outputs/phase-12/unassigned-tasks-report.md`（0件でも必須出力）

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                             | 内容                   |
| -------------------- | -------------------------------------------------------------------------------- | ---------------------- |
| アーキテクチャ仕様   | `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md` | Clean Architecture構成 |
| インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`   | 型定義・Repository IF  |
| 仕様更新ワークフロー | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`   | 仕様更新判断基準       |

### 前Phase成果物

| 参照資料           | パス                                     | 内容           |
| ------------------ | ---------------------------------------- | -------------- |
| 手動テストレポート | `outputs/phase-11/manual-test-result.md` | 手動テスト結果 |
| 発見課題           | `outputs/phase-11/discovered-issues.md`  | 課題一覧       |

---

## 成果物

| 成果物           | パス                                          | 内容                 |
| ---------------- | --------------------------------------------- | -------------------- |
| 実装ガイド       | `outputs/phase-12/implementation-guide.md`    | 実装説明ドキュメント |
| 仕様更新ログ     | `outputs/phase-12/spec-update-log.md`         | システム仕様更新記録 |
| ドキュメント履歴 | `outputs/phase-12/document-changelog.md`      | ファイル一覧         |
| 未タスクレポート | `outputs/phase-12/unassigned-tasks-report.md` | 未タスク検出結果     |

---

## 完了条件

- [ ] タスク1: 実装ガイド作成完了（Part 1 + Part 2）
- [ ] タスク2: システム仕様書更新完了（または更新不要の理由記録）
- [ ] タスク3: ドキュメント更新履歴作成完了
- [ ] タスク4: 未タスク検出レポート作成完了（0件でも出力）
- [ ] 全成果物が `outputs/phase-12/` に出力されている

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

`docs/30-workflows/react-context-di/phase-13-pr-creation.md`
