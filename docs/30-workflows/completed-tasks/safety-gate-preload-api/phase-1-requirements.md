# Phase 1: 要件定義

## メタ情報

| 項目     | 値                         |
| -------- | -------------------------- |
| Phase    | 1                          |
| 機能名   | safety-gate-preload-api    |
| タスクID | UT-06-003-PRELOAD-API-IMPL |
| 作成日   | 2026-03-23                 |
| Issue    | #1290                      |

## 目的

SafetyGate Preload API の `evaluateSafety` メソッド追加に関する要件を定義し、受け入れ基準を明文化する。

## 実行タスク

- P50チェック: 対象ファイルの既実装状態を調査し、重複実装を防止
- 現状分析: IPC 4層の実装済み/未実装箇所を整理
- 要件抽出: 機能要件（FR）と非機能要件（NFR）を分類・定義
- 受け入れ基準作成: 各要件に対して検証可能な受け入れ基準を定義

## 参照資料

| 資料名             | パス                                       | 説明                          |
| ------------------ | ------------------------------------------ | ----------------------------- |
| IPC チャンネル定義 | `preload/channels.ts:371`                  | SKILL_EVALUATE_SAFETY 定数    |
| ホワイトリスト     | `preload/channels.ts:647`                  | ALLOWED_INVOKE_CHANNELS       |
| Main ハンドラ      | `main/ipc/safetyGateHandlers.ts`           | registerSafetyGateHandlers    |
| 共有型定義         | `packages/shared/src/types/safety-gate.ts` | SafetyGateResult, SafetyGrade |
| セキュリティルール | `.claude/rules/04-electron-security.md`    | IPC セキュリティ原則          |
| 既知の落とし穴     | `.claude/rules/06-known-pitfalls.md`       | P23, P27, P42, P60, P61       |

## 実行手順

### ステップ 0: P50チェック — 既実装状態の調査（必須）

```bash
# 対象ファイルの最近のコミット履歴
git log --oneline -20 -- apps/desktop/src/preload/skill-api.ts

# evaluateSafety が既に実装されているか確認
grep -n "evaluateSafety" apps/desktop/src/preload/skill-api.ts
```

| 判定     | 条件                          | 対応                   |
| -------- | ----------------------------- | ---------------------- |
| 未実装   | evaluateSafety がヒットしない | 通常通り Phase 1 続行  |
| 実装済み | evaluateSafety が既に存在する | 検証・補完モードへ切替 |

### ステップ 1: 現状分析 — IPC 4層の実装状況整理

| レイヤー           | ファイル                                             | 状態   |
| ------------------ | ---------------------------------------------------- | ------ |
| IPC Channel 定義   | `preload/channels.ts:371`                            | 完了   |
| Allowlist 登録     | `preload/channels.ts:647`                            | 完了   |
| Main Handler       | `main/ipc/safetyGateHandlers.ts`                     | 完了   |
| Handler Tests      | `main/ipc/__tests__/safetyGateHandlers.test.ts`      | 完了   |
| Shared Types       | `packages/shared/src/types/safety-gate.ts`           | 完了   |
| SkillAPI Interface | `preload/skill-api.ts` (interface)                   | 未実装 |
| SkillAPI Impl      | `preload/skill-api.ts` (object)                      | 未実装 |
| Preload Tests      | `preload/__tests__/skill-api.evaluateSafety.test.ts` | 未実装 |

### ステップ 2: Main ハンドラの応答形式確認

Main 側ハンドラ（`registerSafetyGateHandlers`）はラップ形式を使用:

```typescript
// 成功
{ success: true, data: SafetyGateResult }

// 失敗
{ success: false, error: { code: string, message: string } }
```

### ステップ 3: 要件定義

#### 機能要件（FR）

| ID   | 要件                                                              | 優先度 |
| ---- | ----------------------------------------------------------------- | ------ |
| FR-1 | `SkillAPI` インターフェースに `evaluateSafety` メソッドを追加する | 必須   |
| FR-2 | `skillAPI` オブジェクトに `evaluateSafety` 実装を追加する         | 必須   |
| FR-3 | `safeInvoke` で `IPC_CHANNELS.SKILL_EVALUATE_SAFETY` を呼び出す   | 必須   |
| FR-4 | 戻り値型は `SafetyGateResult` のラップ形式とする                  | 必須   |

#### 非機能要件（NFR）

| ID    | 要件                                           | 関連Pitfall |
| ----- | ---------------------------------------------- | ----------- |
| NFR-1 | チャンネル名は `IPC_CHANNELS` 定数で参照       | P27         |
| NFR-2 | 型は `@repo/shared` から再利用（二重定義禁止） | P23         |
| NFR-3 | `skillName` の型チェックは Main 側で実施済み   | P42         |
| NFR-4 | DIP — `SafetyGatePort` インターフェース依存    | P61         |

### ステップ 4: 受け入れ基準

| ID   | 基準                                                                              |
| ---- | --------------------------------------------------------------------------------- |
| AC-1 | `window.electronAPI.skill.evaluateSafety("skillName")` が Renderer から呼び出せる |
| AC-2 | 正常系: `SafetyGateResult` が取得できる                                           |
| AC-3 | 異常系: 不正な `skillName` で適切なエラーが返る                                   |
| AC-4 | `safeInvoke` が `IPC_CHANNELS.SKILL_EVALUATE_SAFETY` 定数で呼び出される           |
| AC-5 | Preload テストが全て PASS する                                                    |
| AC-6 | 型チェック（`pnpm typecheck`）が PASS する                                        |

### ステップ 5: スコープ定義

**含むもの**:

- `apps/desktop/src/preload/skill-api.ts` への `evaluateSafety` メソッド追加
- Preload 層テストファイルの作成
- `@repo/shared` の `SafetyGateResult` 型の import 追加

**含まないもの**:

- Main Process 側ハンドラ本体の変更（実装済み）
- SafetyGate の評価ロジック変更
- Renderer 側 UI の実装
- `preload/types.ts` への SafetyGate 型定義の独自追加（`@repo/shared` から参照するため不要）

## 統合テスト連携

| 確認項目           | 内容                                       | Phase 1 での対応   |
| ------------------ | ------------------------------------------ | ------------------ |
| IPC チャンネル疎通 | Renderer -> Preload -> Main の通信チェーン | 要件として定義     |
| 型整合性           | `SafetyGateResult` の共有型利用            | NFR-2 として要件化 |
| セキュリティ検証   | ホワイトリスト・送信元検証                 | NFR-1 として要件化 |

## 多角的チェック観点（AIが判断）

| 観点               | 適用 | 確認内容                                     |
| ------------------ | ---- | -------------------------------------------- |
| セキュリティ       | 該当 | IPC チャンネルのホワイトリスト管理・P27 準拠 |
| API設計            | 該当 | Preload API のインターフェース設計           |
| アーキテクチャ     | 該当 | Renderer -> Preload -> Main の依存方向       |
| エラーハンドリング | 該当 | ラップ形式でのエラー伝播                     |
| IPC通信            | 該当 | safeInvoke パターンの選択（P60 準拠）        |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. P50チェック: 既実装状態の調査
2. 参照資料の確認
3. IPC 4層の実装状況整理
4. FR/NFR の定義
5. 受け入れ基準の作成
6. スコープの定義
7. 完了条件の検証

## 成果物

| 成果物     | パス                                                                | 説明           |
| ---------- | ------------------------------------------------------------------- | -------------- |
| 要件定義書 | `docs/30-workflows/safety-gate-preload-api/phase-1-requirements.md` | 本ドキュメント |

## 完了条件

- [x] P50チェックが完了し、既実装状態が確認されている
- [x] IPC 4層の実装状況が整理されている
- [x] FR-1〜FR-4 が定義されている
- [x] NFR-1〜NFR-4 が定義されている
- [x] AC-1〜AC-6 が定義されている
- [x] スコープ（含む/含まない）が明確に定義されている
- [x] Main ハンドラの応答形式（ラップ形式）が確認されている
- [x] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 2: 設計
