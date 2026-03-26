# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 1                                        |
| 機能名 | UT-SC-02-005-preload-execute-type-update |
| 作成日 | 2026-03-25                               |

## 目的

修正対象ファイルの現状を確認し、受け入れ基準を明文化する。IPC 3層（Main → Preload → Renderer）の型契約の現状を調査し、不整合箇所を特定する。

## 実行タスク

- 要件抽出: IPC 3層の型契約の現状調査と不整合箇所の特定
- 受け入れ基準作成: 各要件に対して検証可能な受け入れ基準を定義
- P50チェック: 対象ファイルの実装状態を git log と grep で確認

## 参照資料

| 資料名                           | パス                                                                                        | 説明                              |
| -------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------- |
| 未タスク指示書                   | `docs/30-workflows/completed-tasks/UT-SC-02-005.md`                                         | 詳細なWhy/What/How                |
| 親タスク成果物                   | `docs/30-workflows/completed-tasks/UT-SC-02-002-execute-terminal-handoff/`                  | UT-SC-02-002 の Phase 1-13 成果物 |
| IPC/Preload 教訓                 | `.claude/skills/aiworkflow-requirements/references/lessons-learned-ipc-preload-runtime.md`  | P44/P45 修正パターン              |
| Electron Services アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | RuntimeSkillCreatorFacade 設計    |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                         | パス                                                                                        | 内容                           |
| -------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------ |
| Electron Services アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | RuntimeSkillCreatorFacade 設計 |
| IPC Preload Runtime 教訓         | `.claude/skills/aiworkflow-requirements/references/lessons-learned-ipc-preload-runtime.md`  | P44/P45 修正パターン           |

## 実行手順

### 0. P50チェック: 既実装状態の調査（必須）

```bash
# 対象ファイルの最近のコミット履歴
git log --oneline -20 -- apps/desktop/src/preload/skill-creator-api.ts

# executePlan の現在の型定義を確認
grep -n "executePlan" apps/desktop/src/preload/skill-creator-api.ts

# RuntimeSkillCreatorExecuteResponse が既に使用されているか確認
grep -rn "RuntimeSkillCreatorExecuteResponse" apps/desktop/src/preload/
grep -rn "RuntimeSkillCreatorExecuteResponse" apps/desktop/src/renderer/
```

### 1. IPC 3層の型契約現状確認

| 層       | ファイル                                                             | 行番号  | 現在の型                                        | 期待する型                                               |
| -------- | -------------------------------------------------------------------- | ------- | ----------------------------------------------- | -------------------------------------------------------- |
| Main     | `apps/desktop/src/main/ipc/creatorHandlers.ts`                       | 139     | `IpcResult<RuntimeSkillCreatorExecuteResponse>` | `IpcResult<RuntimeSkillCreatorExecuteResponse>` (正)     |
| Preload  | `apps/desktop/src/preload/skill-creator-api.ts`                      | 105-110 | `IpcResult<RuntimeSkillCreatorExecuteResult>`   | `IpcResult<RuntimeSkillCreatorExecuteResponse>` (要修正) |
| Renderer | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | 410-437 | `result.data.skillName` に直接アクセス          | `terminal_handoff` 型ナロイング追加 (要修正)             |

### 2. 型定義の確認

```bash
# RuntimeSkillCreatorExecuteResponse の定義を確認
grep -A5 "RuntimeSkillCreatorExecuteResponse" packages/shared/src/types/skillCreator.ts

# バレルエクスポートの確認
grep "RuntimeSkillCreatorExecuteResponse" packages/shared/src/types/index.ts
```

**型定義（packages/shared/src/types/skillCreator.ts 行 418-423）**:

```typescript
export type RuntimeSkillCreatorExecuteResponse =
  | RuntimeSkillCreatorExecuteResult
  | {
      type: "terminal_handoff";
      bundle: TerminalHandoffBundle;
    };
```

### 3. plan/improve との整合性確認

```bash
# planSkill の戻り値型を確認（正しい実装の参考）
grep -n "planSkill\|PlanResponse" apps/desktop/src/preload/skill-creator-api.ts

# improveSkill の戻り値型を確認
grep -n "improveSkill\|ImproveResponse" apps/desktop/src/preload/skill-creator-api.ts
```

## 受け入れ基準

| ID   | 基準                                                                                                            | 検証方法                |
| ---- | --------------------------------------------------------------------------------------------------------------- | ----------------------- |
| AC-1 | `skill-creator-api.ts` の `executePlan` 戻り値型が `IpcResult<RuntimeSkillCreatorExecuteResponse>` に更新される | grep + typecheck        |
| AC-2 | `SkillLifecyclePanel.tsx` で `"type" in result.data` による discriminated union 型ナロイングが実装される        | コードレビュー + テスト |
| AC-3 | `pnpm typecheck` が PASS する                                                                                   | コマンド実行            |
| AC-4 | 関連テスト（Preload API / Renderer コンポーネント）が PASS する                                                 | コマンド実行            |

## 統合テスト連携【必須】

接続要件を要件に明記:

| 判定項目                | 基準 | 結果   |
| ----------------------- | ---- | ------ |
| IPC 3層の型契約一致     | 必須 | 未実施 |
| Preload → Main 通信正常 | 必須 | 未実施 |
| Renderer 型ナロイング   | 必須 | 未実施 |

## 成果物

| 成果物     | パス                                         | 説明                   |
| ---------- | -------------------------------------------- | ---------------------- |
| 要件定義書 | `outputs/phase-1/requirements-definition.md` | 機能要件・受け入れ基準 |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。

| 観点               | 適用判断 | 仕様参照先                                             |
| ------------------ | -------- | ------------------------------------------------------ |
| セキュリティ       | 適用     | `aiworkflow-requirements: security-api-electron.md`    |
| アーキテクチャ     | 適用     | `aiworkflow-requirements: architecture-*.md`           |
| API設計            | 適用     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| エラーハンドリング | 適用     | `aiworkflow-requirements: error-handling.md`           |
| UI/UX              | 非適用   | -                                                      |
| データ整合性       | 非適用   | -                                                      |
| パフォーマンス     | 非適用   | -                                                      |
| アクセシビリティ   | 非適用   | -                                                      |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断 | 仕様参照先                                             |
| -------------------------- | -------- | ------------------------------------------------------ |
| IPC通信                    | 適用     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | 適用     | `aiworkflow-requirements: security-api-electron.md`    |
| フロントエンド（Renderer） | 適用     | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | 非適用   | -                                                      |
| ローカルストレージ         | 非適用   | -                                                      |

## 完了条件

- [ ] P50チェック（既実装状態の調査）が完了している
- [ ] IPC 3層の型契約の現状が確認されている
- [ ] 受け入れ基準 AC-1〜AC-4 が定義されている
- [ ] plan/improve との整合性が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

- [ ] P50チェック実行完了
- [ ] IPC 3層の型契約現状確認完了
- [ ] 型定義の確認完了
- [ ] plan/improve との整合性確認完了
- [ ] 受け入れ基準（AC-1〜AC-4）定義完了

## 次Phase

Phase 2: 設計
