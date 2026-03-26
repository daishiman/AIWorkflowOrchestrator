# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 5                                        |
| 機能名 | UT-SC-02-005-preload-execute-type-update |
| 作成日 | 2026-03-25                               |

## 目的

Preload 層の型修正と Renderer 側の型ナロイング実装を行い、Phase 4 で作成したテストを GREEN にする。

## 背景

Phase 2 設計書に基づき、`skill-creator-api.ts` の `executePlan` 戻り値型を `RuntimeSkillCreatorExecuteResponse` に更新し、`SkillLifecyclePanel.tsx` に `terminal_handoff` 型ナロイングを追加する。P44/P45 パターンの根本解決として、IPC 3層の型契約を統一する。

## 実行タスク

- タスク1: `skill-creator-api.ts` の import 文修正と `executePlan` 戻り値型変更
- タスク2: `SkillLifecyclePanel.tsx` の `handleExecutePlan` に `terminal_handoff` 型ナロイング追加
- タスク3: バレルエクスポート確認

---

### タスク1: Preload API 型修正

**目的**: `skill-creator-api.ts` の `executePlan` 戻り値型を `RuntimeSkillCreatorExecuteResponse` に変更する。

**対象ファイル**: `apps/desktop/src/preload/skill-creator-api.ts`

**変更内容**:

1. import 文に `RuntimeSkillCreatorExecuteResponse` を追加
2. `executePlan` の戻り値型を `IpcResult<RuntimeSkillCreatorExecuteResponse>` に変更

```typescript
// import 文の変更
import {
  // ... 既存 import ...
  RuntimeSkillCreatorExecuteResponse, // 追加
} from "@repo/shared";

// executePlan 戻り値型の変更
executePlan: (
  planId: string,
  skillSpec: string,
  authMode?: AuthMode,
  apiKey?: string | null,
) => Promise<IpcResult<RuntimeSkillCreatorExecuteResponse>>;
```

**確認コマンド**:

```bash
grep -n "RuntimeSkillCreatorExecuteResponse" apps/desktop/src/preload/skill-creator-api.ts
```

---

### タスク2: Renderer 型ナロイング実装

**目的**: `SkillLifecyclePanel.tsx` の `handleExecutePlan` に `terminal_handoff` レスポンスの型ナロイングを追加する。

**対象ファイル**: `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

**変更内容**:

```typescript
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

**設計判断**: `"type" in` チェックを採用。plan/improve の型ナロイングパターンと統一。

---

### タスク3: バレルエクスポート確認

**目的**: `RuntimeSkillCreatorExecuteResponse` が `packages/shared` から正しくエクスポートされていることを確認する。

**対象ファイル**: `packages/shared/src/types/index.ts`

**確認コマンド**:

```bash
grep "RuntimeSkillCreatorExecuteResponse" packages/shared/src/types/index.ts
grep "RuntimeSkillCreatorExecuteResponse" packages/shared/src/types/skillCreator.ts
```

**期待結果**: 既にエクスポートされていれば変更不要。未エクスポートの場合はバレルに追加する。

---

## 既存テスト回帰確認の先行実行（Phase 5 追加チェック）

実装変更前に既存テストの状態を記録し、実装後に回帰がないことを確認する。

```bash
# 実装前の既存テスト状態を記録
pnpm --filter @repo/desktop exec vitest run 2>&1 | tail -5

# 実装後の回帰確認
pnpm --filter @repo/desktop exec vitest run 2>&1 | tail -5
```

## TDD 検証: Green 状態の確認

Phase 4 で作成した全テストが PASS すること（Green 状態）を確認する。

```bash
# Green 状態の確認
pnpm --filter @repo/desktop exec vitest run --reporter=verbose

# 型チェック
pnpm typecheck
```

**期待される Green 状態**:

- Preload API テスト: `executePlan` 戻り値型が `RuntimeSkillCreatorExecuteResponse` として正しく型チェック PASS
- Renderer テスト: `terminal_handoff` 型ナロイングによる早期リターン動作が PASS
- `pnpm typecheck`: 型エラー 0件

## 参照資料

| 参照資料       | パス                       | 内容               |
| -------------- | -------------------------- | ------------------ |
| Phase 2 設計書 | `phase-2-design.md`        | 変更内容の詳細設計 |
| Phase 4 テスト | `phase-4-test-creation.md` | テストケース定義   |

## 統合テスト連携【必須】

実装後に統合ポイントの動作を検証:

| 統合ポイント               | 検証内容                                                    | ステータス |
| -------------------------- | ----------------------------------------------------------- | ---------- |
| Preload → Main IPC 通信    | `executePlan` の戻り値型が IPC ハンドラと一致               | 未実施     |
| Renderer → Preload API呼出 | `terminal_handoff` 受信時の早期リターン動作                 | 未実施     |
| IPC 3層型契約              | `pnpm typecheck` で 3層の型整合性を確認                     | 未実施     |
| バレルエクスポート         | `RuntimeSkillCreatorExecuteResponse` が shared から利用可能 | 未実施     |

## 成果物

| 成果物           | パス                                                                 | 説明                 |
| ---------------- | -------------------------------------------------------------------- | -------------------- |
| Preload API 修正 | `apps/desktop/src/preload/skill-creator-api.ts`                      | 戻り値型の変更       |
| Renderer 修正    | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | 型ナロイング追加     |
| Green 状態ログ   | `outputs/phase-5/green-state-verification.md`                        | Green 状態の確認結果 |

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

- [ ] `skill-creator-api.ts` の `executePlan` 戻り値型が `RuntimeSkillCreatorExecuteResponse` に更新されている
- [ ] `skill-creator-api.ts` の import 文に `RuntimeSkillCreatorExecuteResponse` が追加されている
- [ ] `SkillLifecyclePanel.tsx` に `terminal_handoff` 型ナロイングが実装されている
- [ ] バレルエクスポート（`packages/shared/src/types/index.ts`）が確認されている
- [ ] Phase 4 の全テストが GREEN になっている
- [ ] `pnpm typecheck` が PASS している
- [ ] 既存テストに回帰がないことが確認されている
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

- [ ] タスク1: Preload API 型修正完了
- [ ] タスク2: Renderer 型ナロイング実装完了
- [ ] タスク3: バレルエクスポート確認完了
- [ ] 既存テスト回帰確認完了
- [ ] TDD Green 状態確認完了

## 次Phase

Phase 6: テスト拡充
