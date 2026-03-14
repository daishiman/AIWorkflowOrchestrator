# Phase 8 リファクタリング計画

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| タスクID   | TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001 |
| Phase      | 8                                        |
| 成果物種別 | リファクタリング計画（責務整理計画）     |
| 作成日     | 2026-03-14                               |
| ステータス | completed                                |
| 前提       | Phase 5 実装計画、Phase 7 カバレッジ確認 |
| 後続       | Phase 9 品質検証                         |

---

## 1. リファクタリング方針

本タスク（Task03）は Skill / Agent / SkillCreator の runtime ルーティング統一を対象とする。Phase 1 で特定された以下の 3 つの責務問題を解消し、credential 解決・permission・streaming・orchestration の各責務を明確に分離する。

### 1.1 特定された責務問題（Phase 1 からの引継ぎ）

| ID   | 問題箇所                          | 責務問題                                                                               | 優先度 |
| ---- | --------------------------------- | -------------------------------------------------------------------------------------- | ------ |
| P-01 | `SkillExecutor.getApiKey()`       | credential 解決を実行コンポーネント内部で行っている（credential と実行ロジックの混在） | 高     |
| P-02 | `AgentHandler` の apiKey 静的注入 | credential を Handler 生成時に静的に保持している（credential と IPC ロジックの混在）   | 高     |
| P-03 | `skillExecutionAuthPreflight`     | auth-mode awareness を持たない（responsibility gap：auth-mode 分岐が未実装）           | 中     |

### 1.2 リファクタリング 4 軸

| 軸  | 内容                                                                   |
| --- | ---------------------------------------------------------------------- |
| 軸1 | credential 解決の責務を `RuntimePolicyResolver` に集約                 |
| 軸2 | `SkillExecutor` を `RuntimeDecision` 受け取り型に変更                  |
| 軸3 | `AgentHandler` を `RuntimePolicyResolver` 経由の credential 取得に変更 |
| 軸4 | `skillExecutionAuthPreflight` に auth-mode 分岐を追加                  |

---

## 2. 責務分離マトリクス（Before → After）

### 2.1 主要コンポーネントの責務変更

| コンポーネント                   | Before の責務（問題）                                                                 | After の責務（設計目標）                                                            |
| -------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `SkillExecutor`                  | credential 解決 + SDK 実行 + streaming + permission（credential と実行の混在）        | SDK 実行 + streaming + permission（credential は `RuntimeDecision` 経由で受け取る） |
| `AgentHandler`                   | apiKey 静的保持 + IPC ハンドリング + AgentClient 呼び出し（credential と IPC の混在） | IPC ハンドリング + AgentClient 呼び出し（apiKey は `RuntimePolicyResolver` 経由）   |
| `skillExecutionAuthPreflight`    | API key 存在確認のみ（auth-mode 分岐なし）                                            | auth-mode 分岐 + API key 確認（`RuntimePolicyResolver` に委譲）                     |
| `RuntimePolicyResolver`（新規）  | 存在しない                                                                            | auth-mode + credential → `RuntimeDecision` 解決の最終 authority                     |
| `TerminalHandoffBuilder`（新規） | 存在しない                                                                            | `TerminalHandoffBundle` の構築とサニタイズ（shell injection 防止含む）              |

### 2.2 変更なし（既存保証を維持）

以下のコンポーネントは本リファクタリングの対象外とし、変更後も動作保証を維持する。

| コンポーネント         | 維持される責務                   |
| ---------------------- | -------------------------------- |
| `PermissionResolver`   | tool 実行 permission の最終判定  |
| `PermissionStore`      | permission 状態の永続化          |
| streaming パイプライン | SSE / EventStream による逐次出力 |
| abort ハンドラ         | ユーザーキャンセルによる実行中断 |
| retry ロジック         | 外部サービスエラー時の自動再試行 |

### 2.3 新規コンポーネントの設計

#### RuntimePolicyResolver

```typescript
// インターフェース（packages/shared に配置）
interface IRuntimePolicyResolver {
  resolve(context: RuntimePolicyContext): Promise<RuntimeDecision>;
}

// RuntimeDecision の構造
interface RuntimeDecision {
  mode: "integrated" | "terminal_handoff" | "guidance_only";
  credential?: string; // integrated 時のみ。Renderer には渡さない
  handoffBundle?: TerminalHandoffBundle; // terminal_handoff 時のみ
  reason: string; // UI 表示用の理由（内部情報を含まない）
  retryable: boolean;
}
```

#### TerminalHandoffBundle

```typescript
interface TerminalHandoffBundle {
  launcher: "claude-code" | "bash";
  promptBundle: string; // ユーザー向けプロンプト
  cwd: string; // 作業ディレクトリ
  suggestedCommand: string; // shell injection サニタイズ済み
  manualRetryRule: string; // 日本語の手順案内
}
```

---

## 3. 重複責務の特定と再配置方針

### 3.1 重複責務マップ

| 責務                | 現在の実装場所（重複）                                   | 再配置先                        | 方針                                      |
| ------------------- | -------------------------------------------------------- | ------------------------------- | ----------------------------------------- |
| credential 解決     | `SkillExecutor.getApiKey()` / `AgentHandler` apiKey 保持 | `RuntimePolicyResolver`         | 一元化。両箇所から参照を除去              |
| auth-mode 判定      | `authModeSlice`（Renderer）/ preflight（不完全）         | `RuntimePolicyResolver`（Main） | Main を authority に。Renderer は参照のみ |
| permission 確認     | `PermissionResolver`（変更なし）+ preflight 混在         | `PermissionResolver` に集約     | preflight から permission 確認を分離      |
| terminal 実行判定   | 未定義（新規）                                           | `RuntimePolicyResolver`         | 新規実装                                  |
| handoff bundle 構築 | 未定義（新規）                                           | `TerminalHandoffBuilder`        | 新規実装。サニタイズはここで完結          |

### 3.2 `getApiKey()` の段階的廃止方針

`SkillExecutor.getApiKey()` は以下の手順で段階的に廃止する。P35 準拠のテストモック大規模修正を最小化するため、削除は `@deprecated` 経由の移行期間を設ける。

| 段階 | 内容                                                                      | 対象ブランチ                 |
| ---- | ------------------------------------------------------------------------- | ---------------------------- |
| 1    | `@deprecated` アノテーションを付加し、移行コメントを追記                  | 本 Phase（完了済み）         |
| 2    | 内部実装を `RuntimePolicyResolver` 経由に変更（外部インターフェース維持） | Phase 5 実装計画準拠         |
| 3    | `getApiKey()` を完全削除し、テストモックを更新                            | 次フェーズ（未タスク化予定） |

---

## 4. 影響範囲（テストへの波及）

### 4.1 影響するテストファイルの特定手順

以下の grep コマンドで影響ファイルを事前に特定する（P35 準拠）。

```bash
# SkillExecutor.getApiKey() を使用しているテスト
grep -rn "getApiKey" apps/desktop/src --include="*.test.ts"

# AgentHandler の apiKey 注入パターンを使用しているテスト
grep -rn "new AgentHandler" apps/desktop/src --include="*.test.ts"
grep -rn "apiKey" apps/desktop/src/main/handlers --include="*.test.ts"

# skillExecutionAuthPreflight を使用しているテスト
grep -rn "skillExecutionAuthPreflight" apps/desktop/src --include="*.test.ts"

# RuntimeDecision のモックが必要になるファイル（新規追加後）
grep -rn "SkillExecutor\|AgentExecutor" apps/desktop/src --include="*.test.ts"
```

### 4.2 影響テストファイルと修正内容

| テストファイル（推定）                              | 修正内容                                                                 |
| --------------------------------------------------- | ------------------------------------------------------------------------ |
| `SkillExecutor.test.ts`                             | `getApiKey()` モックを削除 → `RuntimeDecision` モック追加                |
| `AgentHandler.test.ts`                              | `new AgentHandler({ apiKey: "..." })` → `mockRuntimePolicyResolver` 追加 |
| `skillExecutionAuthPreflight.test.ts`               | auth-mode 分岐テストケースを追加                                         |
| `SkillExecutor.integration.test.ts`（存在する場合） | `mockRuntimePolicyResolver` を DI に追加                                 |
| `AgentExecutor.test.ts`                             | `RuntimeDecision` モックに更新                                           |

### 4.3 mockRuntimePolicyResolver の標準定義（P35 準拠の再利用テンプレート）

```typescript
// 各テストファイルで共通利用するモック定義
const mockRuntimePolicyResolver: IRuntimePolicyResolver = {
  resolve: vi.fn().mockResolvedValue({
    mode: "integrated",
    credential: "test-api-key",
    reason: "テスト用 integrated モード",
    retryable: false,
  } satisfies RuntimeDecision),
};

// beforeEach でリセット（P9 準拠）
beforeEach(() => {
  vi.clearAllMocks();
});
```

---

## 5. 後方互換維持策

### 5.1 RuntimeDecision が未提供の場合のフォールバック

Phase 5 実装計画に従い、`RuntimeDecision` を Optional パラメータとして受け取る設計を維持する。未提供時は既存の `getApiKey()` ベースのフォールバックで動作させる。

```typescript
// SkillExecutor の拡張シグネチャ（後方互換）
async execute(
  skill: Skill,
  input: SkillInput,
  options?: {
    runtimeDecision?: RuntimeDecision;  // Optional: 未指定時は従来動作
    abortSignal?: AbortSignal;
  }
): Promise<SkillOutput>
```

### 5.2 deprecated メソッドの一時残存

| メソッド                     | 残存期間           | 除去条件                                     |
| ---------------------------- | ------------------ | -------------------------------------------- |
| `SkillExecutor.getApiKey()`  | 次フェーズ完了まで | `RuntimeDecision` 経由への移行が 100% 完了後 |
| `AgentHandler` の静的 apiKey | Phase 5 完了時     | `RuntimePolicyResolver` 注入が確認できた時点 |

### 5.3 TerminalHandoffBundle の全フィールドのデフォルト値

`TerminalHandoffBundle` の各フィールドは省略不可とし、欠落した場合は `TerminalHandoffBuilder` がエラーを throw する（Silent fallback 禁止）。

---

## 6. 移行順序と安全性保証

### 6.1 移行順序

| 順序 | 対象                                                               | 前提条件       | 破壊的変更   | rollback 単位                         |
| ---- | ------------------------------------------------------------------ | -------------- | ------------ | ------------------------------------- |
| 1    | `IRuntimePolicyResolver` / `RuntimeDecision` 型定義（新規）        | なし           | なし         | ファイル削除で原状復帰                |
| 2    | `TerminalHandoffBundle` 型定義（新規）                             | 順序 1 完了    | なし         | ファイル削除で原状復帰                |
| 3    | `RuntimePolicyResolver` 実装（新規）                               | 順序 1 完了    | なし         | ファイル削除で原状復帰                |
| 4    | `TerminalHandoffBuilder` 実装（新規）                              | 順序 2 完了    | なし         | ファイル削除で原状復帰                |
| 5    | `SkillExecutor` に `RuntimeDecision` 受け取りを追加                | 順序 1, 3 完了 | あり（拡張） | Optional パラメータのため後方互換あり |
| 6    | `AgentHandler` の apiKey 取得を `RuntimePolicyResolver` 経由に変更 | 順序 3 完了    | あり         | apiKey 静的注入に revert              |
| 7    | `skillExecutionAuthPreflight` に auth-mode 分岐を追加              | 順序 3 完了    | あり         | 既存ロジックに revert                 |
| 8    | `getApiKey()` に `@deprecated` アノテーション付加                  | 順序 5 完了    | なし         | アノテーション削除で原状復帰          |

### 6.2 rollback 判定基準

| 判定          | 条件                                                        | アクション                             |
| ------------- | ----------------------------------------------------------- | -------------------------------------- |
| 続行          | 該当順序のテストが全 PASS                                   | 次の順序へ進む                         |
| 部分 rollback | 失敗 1-3 件（原因が特定可能）                               | 失敗原因を修正し、再テスト             |
| 全体 rollback | 失敗 4 件以上、または原因不明                               | 該当順序を revert し、Phase 5 を再検討 |
| 緊急 rollback | 既存テスト（PermissionResolver / streaming）が 1 件でも失敗 | 即座に revert し、影響範囲を再調査     |

---

## 7. リスク評価

| ID   | リスク                                                            | 影響度 | 発生確率 | 対策                                                                        |
| ---- | ----------------------------------------------------------------- | ------ | -------- | --------------------------------------------------------------------------- |
| R-01 | `SkillExecutor.getApiKey()` 削除による既存テスト破壊（P35）       | 中     | 高       | `@deprecated` 経由の段階廃止。mockRuntimePolicyResolver を標準化して再利用  |
| R-02 | `AgentHandler` の apiKey 注入変更でテスト大規模修正（P35）        | 中     | 高       | `grep` で事前影響調査。モック標準化で修正コストを最小化                     |
| R-03 | `TerminalHandoffBundle.suggestedCommand` への shell injection     | 高     | 中       | `TerminalHandoffBuilder` でサニタイズを完結。P55 準拠で `escapeRegExp` 適用 |
| R-04 | `RuntimePolicyResolver` が credential を Renderer に送信          | 高     | 低       | `RuntimeDecision.credential` は Main Process 内でのみ利用。IPC では渡さない |
| R-05 | `skillExecutionAuthPreflight` の auth-mode 分岐で既存挙動が変わる | 中     | 中       | 既存 `api-key` モード時の動作を回帰テストで保護                             |
| R-06 | `TerminalHandoffBundle` フィールド欠落による silent fallback      | 高     | 低       | `TerminalHandoffBuilder` で全フィールドの存在を強制。欠落時は throw         |

---

## 8. 仕様書間 cross-check 結果

Phase 1-7 の成果物間で以下の整合性を確認した。

| チェック項目                                                                    | Phase 間        | 結果 | 備考                                                                    |
| ------------------------------------------------------------------------------- | --------------- | ---- | ----------------------------------------------------------------------- |
| Phase 1 で特定した P-01/P-02/P-03 の責務問題が本計画でカバーされていること      | Phase 1 <-> 8   | OK   | 3 問題すべてに対応方針あり                                              |
| `RuntimeDecision` インターフェースが Phase 2 設計と一致していること             | Phase 2 <-> 8   | OK   | mode / credential / handoffBundle / reason / retryable が一致           |
| `TerminalHandoffBundle` の全フィールドが Phase 2 契約マトリクスと一致           | Phase 2 <-> 8   | OK   | launcher / promptBundle / cwd / suggestedCommand / manualRetryRule 完備 |
| Phase 5 の Optional パラメータ方針が後方互換維持策と一致していること            | Phase 5 <-> 8   | OK   | `runtimeDecision?: RuntimeDecision` の Optional 定義が一致              |
| Phase 7 のカバレッジ計画に新規コンポーネントが含まれていること                  | Phase 7 <-> 8   | OK   | `RuntimePolicyResolver` / `TerminalHandoffBuilder` が計測対象           |
| 既存保証（PermissionResolver / streaming / abort / retry）が変更なしであること  | Phase 1 <-> 8   | OK   | 変更なしリストに明示                                                    |
| P34 準拠の Setter Injection が `SkillExecutor` / `AgentExecutor` に適用         | Phase 5 <-> P34 | OK   | BrowserWindow 依存のため Setter Injection                               |
| P35 準拠のテストモック修正リスクが事前に評価されていること                      | Phase 7 <-> P35 | OK   | 影響テストファイルの grep 手順と標準モックを定義済み                    |
| P55 準拠の shell injection エスケープが `TerminalHandoffBuilder` に含まれること | Phase 2 <-> P55 | OK   | `escapeRegExp` 適用を設計に明記                                         |

---

## 9. 完了条件

- [x] 責務分離マトリクス（Before → After）が作成されている
- [x] 新規コンポーネント（`RuntimePolicyResolver` / `TerminalHandoffBuilder`）のインターフェースが定義されている
- [x] `getApiKey()` の段階的廃止方針が明示されている
- [x] テストへの波及範囲と grep 手順が定義されている
- [x] mockRuntimePolicyResolver の標準テンプレートが定義されている
- [x] 後方互換維持策が明示されている
- [x] 移行順序と rollback 判定基準が定義されている
- [x] リスク評価が完了している
- [x] Phase 1-7 との cross-check が完了している
