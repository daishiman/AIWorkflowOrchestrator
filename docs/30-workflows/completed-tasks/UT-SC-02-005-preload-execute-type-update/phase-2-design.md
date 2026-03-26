# Phase 2: 設計

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 2                                        |
| 機能名 | UT-SC-02-005-preload-execute-type-update |
| 作成日 | 2026-03-25                               |

## 目的

型修正の具体的な変更内容と影響範囲を設計する。IPC 3層の型契約を「下流（Main）から上流（Renderer）に向けて」統一する設計を行う。

## 背景

本タスクは concern 数 1（IPC 型整合性）の小規模修正のため、単一ファイル設計書で完結する。

## 実行タスク

- タスク1: Preload 型シグネチャ変更の設計
- タスク2: Renderer 型ナロイング設計
- タスク3: IPC 4層整合性チェック（デッドチャンネル防止）

---

### タスク1: Preload 型シグネチャ変更の設計

**目的**: `skill-creator-api.ts` の `executePlan` 戻り値型を修正する設計

**変更内容**:

```typescript
// File: apps/desktop/src/preload/skill-creator-api.ts
// 行 105-110

// Before:
executePlan: (
  planId: string,
  skillSpec: string,
  authMode?: AuthMode,
  apiKey?: string | null,
) => Promise<IpcResult<RuntimeSkillCreatorExecuteResult>>;

// After:
executePlan: (
  planId: string,
  skillSpec: string,
  authMode?: AuthMode,
  apiKey?: string | null,
) => Promise<IpcResult<RuntimeSkillCreatorExecuteResponse>>;
```

**import 文の変更**:

```typescript
// RuntimeSkillCreatorExecuteResult を RuntimeSkillCreatorExecuteResponse に置換
// または、両方の型が他で使われている場合は追加
import {
  // ... 既存 import ...
  RuntimeSkillCreatorExecuteResponse, // 追加
} from "@repo/shared";
```

---

### タスク2: Renderer 型ナロイング設計

**目的**: `SkillLifecyclePanel.tsx` で `terminal_handoff` レスポンスの型安全なハンドリングを追加

**変更内容**:

```typescript
// File: apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
// 行 419-427（handleExecutePlan 内）

// Before:
const result = await skillCreatorApi.executePlan(planId, request.trim());
if (!result.success || !result.data) {
  setGenerationError(result.error ?? "計画実行に失敗しました");
  return;
}
await fetchSkills();
if (result.data.skillName) {
  selectSkillByName(result.data.skillName);
}

// After:
const result = await skillCreatorApi.executePlan(planId, request.trim());
if (!result.success || !result.data) {
  setGenerationError(result.error ?? "計画実行に失敗しました");
  return;
}
// terminal_handoff 型ナロイング（discriminated union）
if ("type" in result.data && result.data.type === "terminal_handoff") {
  // terminal_handoff の場合は早期リターン（UI未実装のため暫定処理）
  console.info(
    "[SkillLifecyclePanel] terminal_handoff received:",
    result.data.bundle,
  );
  return;
}
await fetchSkills();
if (result.data.skillName) {
  selectSkillByName(result.data.skillName);
}
```

**設計判断の根拠**:

- アプローチ A（`"type" in` チェック）を採用: TypeScript の discriminated union パターンとして最も標準的
- `planSkill` の型ナロイングパターンとの統一性を確保
- `terminal_handoff` 時の UI は別タスクスコープのため、`console.info` + 早期リターンで暫定処理

---

### タスク3: IPC 4層整合性チェック

本タスクは既存チャンネル（`SKILL_CREATOR_EXECUTE_PLAN`）の型変更のみのため、新規チャンネル追加は不要。4層の整合性を確認する。

| 層                | ファイル                                        | 確認結果                                                  |
| ----------------- | ----------------------------------------------- | --------------------------------------------------------- |
| 1. 定数定義       | `packages/shared/src/ipc/channels.ts`           | `SKILL_CREATOR_EXECUTE_PLAN` 定義済み（変更不要）         |
| 2. ホワイトリスト | `apps/desktop/src/preload/index.ts`             | 登録済み（変更不要）                                      |
| 3. ハンドラ登録   | `apps/desktop/src/main/ipc/creatorHandlers.ts`  | `RuntimeSkillCreatorExecuteResponse` 使用済み（変更不要） |
| 4. Preload API    | `apps/desktop/src/preload/skill-creator-api.ts` | `RuntimeSkillCreatorExecuteResult` → **要修正**           |

---

## 影響範囲サマリー

| ファイル                                                             | 行番号  | 変更種別     | 内容                                            |
| -------------------------------------------------------------------- | ------- | ------------ | ----------------------------------------------- |
| `apps/desktop/src/preload/skill-creator-api.ts`                      | 105-110 | 型修正       | `executePlan` 戻り値型を Union 型に変更         |
| `apps/desktop/src/preload/skill-creator-api.ts`                      | import  | import 追加  | `RuntimeSkillCreatorExecuteResponse` を追加     |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | 419-427 | ロジック追加 | `terminal_handoff` 型ナロイング追加             |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                       | -       | 確認のみ     | IPC ハンドラ戻り値型は既に正しい                |
| `packages/shared/src/types/skillCreator.ts`                          | -       | 確認のみ     | `RuntimeSkillCreatorExecuteResponse` 型定義済み |

## 参照資料

| 参照資料         | パス                                                                                         | 内容                            |
| ---------------- | -------------------------------------------------------------------------------------------- | ------------------------------- |
| Phase 1 要件定義 | `phase-1-requirements.md`                                                                    | 受け入れ基準 AC-1〜AC-4         |
| P44/P45 修正手順 | `.claude/skills/aiworkflow-requirements/references/lessons-learned-ipc-preload-runtime.md`   | L-SC-06-002 引数設計ミスの教訓  |
| 親タスク設計書   | `docs/30-workflows/completed-tasks/UT-SC-02-002-execute-terminal-handoff/phase-02-design.md` | plan/improve の型ナロイング参考 |

## 統合テスト連携【必須】

統合ポイント/契約を設計に反映:

| 統合ポイント               | 契約                                          | テスト方法     |
| -------------------------- | --------------------------------------------- | -------------- |
| Preload → Main IPC 通信    | `RuntimeSkillCreatorExecuteResponse` Union 型 | typecheck      |
| Renderer → Preload API呼出 | `executePlan` の戻り値で型ナロイング          | ユニットテスト |

## 成果物

| 成果物 | パス                                 | 説明           |
| ------ | ------------------------------------ | -------------- |
| 設計書 | `outputs/phase-2/design-document.md` | 変更設計の詳細 |

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

- [ ] Preload 型シグネチャ変更の設計が具体的に記述されている
- [ ] Renderer 型ナロイングの設計が具体的に記述されている
- [ ] IPC 4層整合性チェックが完了している
- [ ] 影響範囲が特定され、変更内容が行番号付きで記述されている
- [ ] plan/improve の型ナロイングパターンとの統一方針が決定されている
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

- [ ] タスク1: Preload 型シグネチャ変更の設計完了
- [ ] タスク2: Renderer 型ナロイング設計完了
- [ ] タスク3: IPC 4層整合性チェック完了
- [ ] 影響範囲サマリー作成完了
- [ ] 成果物を所定パスに出力した

## 次Phase

Phase 3: 設計レビューゲート
