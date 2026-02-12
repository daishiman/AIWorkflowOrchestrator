# IPCレスポンスパターン統一 - タスク指示書

## メタ情報

| 項目         | 内容                                           |
| ------------ | ---------------------------------------------- |
| タスクID     | UT-FIX-7-1-003                                 |
| タスク名     | IPCレスポンスパターン統一                      |
| 分類         | リファクタリング                               |
| 対象機能     | Skill System / IPC Handlers                    |
| 優先度       | 低                                             |
| 見積もり規模 | 小規模（1-2時間）                              |
| ステータス   | 未実施                                         |
| issue_number | 777                                            |
| 発見元       | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION Phase 12 |
| 発見日       | 2026-02-12                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-7-1（executeSkillのSkillExecutor委譲実装）の実装過程で、`skillHandlers.ts` 内のIPCレスポンス形式に一貫性がないことが確認された。同一ファイル内で複数のレスポンスパターンが混在している。

### 1.2 問題点・課題

`skillHandlers.ts` 内で以下の3つのレスポンスパターンが混在している:

| パターン | 形式                                                              | 使用箇所                                                                   |
| -------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------- |
| A        | `{ success: true, data: ... }` / `{ success: false, error: ... }` | list, scan, getImported, getDetail, execute, analyze, improve, optimize 等 |
| B        | `return false;` / `return true;`                                  | abort（成功時 `true`、失敗時 `false`）                                     |
| C        | `return null;` / `return result ?? null;`                         | getStatus（値またはnull）                                                  |

- **パターンBとCの問題**: abort と getStatus は `{ success, data/error }` 形式を使用していない。Renderer側で統一的なエラーハンドリングが困難
- **エラー情報の欠落**: abort 失敗時に `false` を返すだけでは、失敗理由がRenderer側に伝わらない
- **バリデーションエラーの不統一**: import ハンドラは `throw` でバリデーションエラーを返し、他のハンドラは `{ success: false, error: ... }` で返す

### 1.3 放置した場合の影響

- Renderer側でハンドラごとに異なるレスポンス解析ロジックが必要になる
- 新規ハンドラ追加時にどのパターンを使うべきか判断基準が曖昧
- エラーハンドリングの漏れが発生しやすくなる

---

## 2. 何を達成するか（What）

### 2.1 目的

`skillHandlers.ts` 内の全IPCハンドラのレスポンス形式を `{ success: boolean, data?: T, error?: string }` パターンに統一する。

### 2.2 最終ゴール

- 全ハンドラが `{ success: true, data: ... }` / `{ success: false, error: ... }` 形式で統一されている
- バリデーションエラーも同一形式で返される
- 既存テストが全てPASSする

### 2.3 スコープ

#### 含むもの

- `skillHandlers.ts` 内の abort ハンドラのレスポンス形式統一
- `skillHandlers.ts` 内の getStatus ハンドラのレスポンス形式統一
- `skillHandlers.ts` 内の import ハンドラのバリデーションエラー形式統一
- Preload側の対応する型定義更新（該当する場合）

#### 含まないもの

- 他のIPCハンドラファイル（updater.ts, agent-handler.ts 等）の統一
- IPCレスポンス型の共通型定義作成（別タスクで対応）
- Renderer側のレスポンス解析ロジック変更

### 2.4 成果物

| 成果物                    | 説明                                       |
| ------------------------- | ------------------------------------------ |
| 修正済み skillHandlers.ts | 全ハンドラのレスポンス形式が統一された状態 |
| 更新済みテスト            | 新しいレスポンス形式に対応したテストケース |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION が完了していること
- abort/getStatus の現在のRenderer側呼び出し箇所を把握していること

### 3.2 依存タスク

| タスクID                              | 関係 | 状況 |
| ------------------------------------- | ---- | ---- |
| TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION | 先行 | 完了 |

### 3.3 必要な知識

| 知識領域               | 参照先                                                                 |
| ---------------------- | ---------------------------------------------------------------------- |
| IPC セキュリティ原則   | `.claude/rules/04-electron-security.md`                                |
| IPC チャンネル設計     | `references/security-skill-ipc.md`                                     |
| エラーハンドリング規約 | `.claude/rules/02-code-quality.md`                                     |
| Preload型定義          | `apps/desktop/src/preload/types.ts`                                    |
| 実装教訓               | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` |

### 3.4 推奨アプローチ

```typescript
// 現在の abort ハンドラ（パターンB）
if (!_skillExecutorInstance) {
  return false;
}
return _skillExecutorInstance.abort(executionId);

// 改善後（パターンA に統一）
if (!_skillExecutorInstance) {
  return { success: false, error: "SkillExecutor が初期化されていません" };
}
try {
  const result = _skillExecutorInstance.abort(executionId);
  return { success: true, data: result };
} catch (error) {
  return {
    success: false,
    error: error instanceof Error ? error.message : "中断に失敗しました",
  };
}
```

```typescript
// 現在の getStatus ハンドラ（パターンC）
if (!_skillExecutorInstance) {
  return null;
}
return _skillExecutorInstance.getExecutionStatus(executionId) ?? null;

// 改善後（パターンA に統一）
if (!_skillExecutorInstance) {
  return { success: false, error: "SkillExecutor が初期化されていません" };
}
const status = _skillExecutorInstance.getExecutionStatus(executionId);
if (!status) {
  return { success: false, error: "実行ステータスが見つかりません" };
}
return { success: true, data: status };
```

### 3.5 TASK-FIX-7-1からの実装課題と教訓

TASK-FIX-7-1（executeSkillのSkillExecutor委譲実装）で得られた教訓を、本タスク実行時の注意点として整理する。

#### 課題1: Renderer側の呼び出し箇所特定の困難さ

| 項目     | 内容                                                                                                                                                            |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題** | abort/getStatusのRenderer側呼び出し箇所を正確に特定する必要がある                                                                                               |
| **背景** | TASK-FIX-7-1実装時に、Renderer→IPC→Main の呼び出しチェーンを追跡する際、Preload層の型定義と実装の2箇所を確認する必要があった（P32: 型定義の二箇所同時更新必須） |
| **教訓** | IPC関連の変更では `packages/shared/src/agent/types.ts` と `apps/desktop/src/preload/types.ts` の両方を確認する                                                  |
| **対策** | `grep -rn "abort\|getStatus\|getExecutionStatus" apps/desktop/src/renderer/` で全呼び出し箇所を事前に特定                                                       |

#### 課題2: レスポンス形式変更の後方互換性

| 項目     | 内容                                                                                                                              |
| -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **課題** | パターンB（true/false）やパターンC（値/null）からパターンA（{success, data/error}）への変更は破壊的変更                           |
| **背景** | TASK-FIX-7-1で `OperationResult` 廃止の経験（P25: OperationResult廃止の波及影響調査不足）から、レスポンス形式変更の影響範囲は広い |
| **教訓** | レスポンス形式変更前に、Preload層でラッパーを追加し既存のRenderer側コードへの影響を最小化する方策を検討する                       |

#### 課題3: テスト修正の大規模化リスク

| 項目     | 内容                                                                                                                                       |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **課題** | パターンBとCに該当するテストケースの修正が必要                                                                                             |
| **背景** | TASK-FIX-7-1ではmockSkillExecutor追加で5テストファイルの修正が必要だった（lessons-learned.md 苦戦箇所2: DI追加時のテストモック大規模修正） |
| **対策** | パターンBとCに該当するテストのみ修正、パターンAは変更なし。事前に `grep -rn "abort\|getStatus" __tests__/` で全検出                        |

---

## 4. 実行手順

### Phase構成

Phase 1-13の標準ワークフローに従う（小規模リファクタリング）。

### Phase 1: 要件定義

#### 目的

統一すべきレスポンスパターンの全箇所を特定する。

#### 手順

1. `skillHandlers.ts` 内の全レスポンスパターンを分類
2. abort/getStatus の Renderer側呼び出し箇所を特定
3. Preload層の型定義への影響を確認

#### 完了条件

- [ ] パターンBとCの全箇所が特定されている
- [ ] Renderer側の影響範囲が把握されている

### Phase 5: 実装

#### 目的

レスポンスパターンの統一実施。

#### 手順

1. abort ハンドラをパターンA形式に変更
2. getStatus ハンドラをパターンA形式に変更
3. import ハンドラのバリデーションエラーをパターンA形式に変更
4. Preload層の型定義を更新（該当する場合）
5. テストを更新
6. `pnpm typecheck` と `pnpm lint` で品質確認

#### 完了条件

- [ ] 全ハンドラがパターンA形式に統一されている
- [ ] テストが全てPASS
- [ ] 型チェック・LintがPASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] abort ハンドラが `{ success, data/error }` 形式で返している
- [ ] getStatus ハンドラが `{ success, data/error }` 形式で返している
- [ ] import ハンドラのバリデーションエラーが `{ success: false, error }` 形式で返している
- [ ] 全ハンドラのレスポンス形式が統一されている

### 品質要件

- [ ] 既存テストが全てPASS
- [ ] 型チェック（`pnpm typecheck`）がPASS
- [ ] Lintチェック（`pnpm lint`）がPASS

### ドキュメント要件

- [ ] レスポンス形式変更がコードコメントに記載されている
- [ ] CHANGELOGへの記録

---

## 6. 検証方法

### テストケース

| TC-ID  | 検証項目                                    | 期待結果                         |
| ------ | ------------------------------------------- | -------------------------------- |
| TC-001 | abort成功時のレスポンス形式                 | `{ success: true, data: true }`  |
| TC-002 | abort失敗時のレスポンス形式                 | `{ success: false, error: ... }` |
| TC-003 | getStatus成功時のレスポンス形式             | `{ success: true, data: ... }`   |
| TC-004 | getStatus未発見時のレスポンス形式           | `{ success: false, error: ... }` |
| TC-005 | import バリデーションエラーのレスポンス形式 | `{ success: false, error: ... }` |
| TC-006 | TypeScriptコンパイルエラーがない            | `pnpm typecheck` PASS            |

### 検証手順

```bash
# テスト実行
pnpm --filter @repo/desktop test -- --grep "skillHandler"

# 型チェック
pnpm typecheck

# Lintチェック
pnpm lint

# Renderer側の呼び出し箇所確認
grep -rn "abort\|getStatus\|getExecutionStatus" apps/desktop/src/renderer/
```

---

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                                              |
| ------------------------------ | ------ | -------- | ------------------------------------------------- |
| Renderer側の呼び出しコード破壊 | 高     | 中       | 変更前にRenderer側の全呼び出し箇所を特定し修正    |
| Preload型定義の不整合          | 中     | 中       | P32パターン準拠で型定義2箇所同時更新              |
| テスト修正の見落とし           | 中     | 低       | `grep -rn "abort\|getStatus" __tests__/` で全検出 |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント         | パス                                                       |
| -------------------- | ---------------------------------------------------------- |
| skillHandlers.ts     | `apps/desktop/src/main/ipc/skillHandlers.ts`               |
| Preload型定義        | `apps/desktop/src/preload/types.ts`                        |
| IPC セキュリティ原則 | `.claude/rules/04-electron-security.md`                    |
| TASK-FIX-7-1成果物   | `docs/30-workflows/TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION/` |

### システム仕様書

| 仕様書       | パス                                       | 参照理由               |
| ------------ | ------------------------------------------ | ---------------------- |
| IPC設計      | `references/api-ipc-system.md`             | IPC レスポンス設計指針 |
| セキュリティ | `references/security-electron-ipc.md`      | エラーサニタイズ基準   |
| 型定義仕様   | `references/interfaces-agent-sdk-skill.md` | Skill API レスポンス型 |
| 実装教訓     | `references/lessons-learned.md`            | 苦戦箇所と解決策       |

### 関連タスク

| タスクID                              | 関係 | 説明                       |
| ------------------------------------- | ---- | -------------------------- |
| TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION | 先行 | executeSkill委譲実装       |
| UT-FIX-7-1-002                        | 並行 | skillHandlers.ts機能別分割 |

---

## 9. 備考

### 発見元の原文

```
TASK-FIX-7-1 Phase 12にて検出:
skillHandlers.ts内のIPCレスポンス形式が統一されていない。
abort は true/false、getStatus は 値/null を返すが、
他のハンドラは { success, data/error } 形式を使用している。
成功/エラーレスポンスのパターンを統一することを推奨する。
```

### 補足事項

- UT-FIX-7-1-002（skillHandlers.ts機能別分割）と同時実施することで効率化が期待できる
- Renderer側の呼び出し箇所が少ない場合は、Preload層にラッパーを追加せず直接変更で対応可能
- 将来的にIPCレスポンスの共通型 `IPCResponse<T>` を `@repo/shared` に定義することも検討対象（ただし本タスクのスコープ外）
