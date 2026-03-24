# Phase 3: 設計レビュー

## メタ情報

| 項目     | 値                         |
| -------- | -------------------------- |
| Phase    | 3                          |
| 機能名   | safety-gate-preload-api    |
| タスクID | UT-06-003-PRELOAD-API-IMPL |
| 作成日   | 2026-03-23                 |
| 前提     | Phase 2 設計               |

## 目的

Phase 2 の設計に対して Pitfall チェック・アーキテクチャ整合性・設計判断の妥当性を多角的に検証し、Phase 4 への進行可否を判定する。

## 実行タスク

- Pitfall チェック: P23, P27, P42, P60, P61, P5 の適用確認
- アーキテクチャ整合性レビュー: レイヤー依存方向・contextBridge・型安全・セキュリティ
- 設計判断レビュー: safeInvoke 選択・型追加不要判断の妥当性検証
- Simpler Alternative 検討: より単純な代替案がないか確認
- ゲート判定: PASS/MINOR/MAJOR/CRITICAL の判定

## 参照資料

| 資料名             | パス                                    | 説明                 |
| ------------------ | --------------------------------------- | -------------------- |
| Phase 2 設計書     | `phase-2-design.md`                     | レビュー対象         |
| Phase 1 要件       | `phase-1-requirements.md`               | 要件との整合確認     |
| セキュリティルール | `.claude/rules/04-electron-security.md` | IPC セキュリティ原則 |
| 既知の落とし穴     | `.claude/rules/06-known-pitfalls.md`    | Pitfall 参照         |

## 実行手順

### ステップ 1: Pitfall チェック

| Pitfall | 項目                         | 判定 | 根拠                                                                 |
| ------- | ---------------------------- | ---- | -------------------------------------------------------------------- |
| P23     | API 二重定義の型管理         | PASS | `SafetyGateResult` は `@repo/shared` から import。Preload 独自型なし |
| P27     | ハードコード文字列の見落とし | PASS | `IPC_CHANNELS.SKILL_EVALUATE_SAFETY` 定数使用                        |
| P42     | `.trim()` バリデーション漏れ | PASS | Main 側で3段バリデーション実施済み                                   |
| P60     | IPC テスト応答形式不一致     | PASS | Main ハンドラのラップ形式を確認し `safeInvoke` でそのまま返却        |
| P61     | DIP 違反                     | PASS | Main 側は `SafetyGatePort` インターフェース依存。Preload は関係なし  |
| P5      | リスナー二重登録             | N/A  | `evaluateSafety` は invoke（request-response）でありリスナーではない |

### ステップ 2: アーキテクチャ整合性レビュー

| 観点                    | 判定 | 根拠                                          |
| ----------------------- | ---- | --------------------------------------------- |
| レイヤー依存方向        | PASS | Renderer -> Preload -> Main の一方向依存      |
| contextBridge 準拠      | PASS | `safeInvoke` 経由で allowlist チャンネルのみ  |
| 型安全                  | PASS | `SafetyGateResult` を `@repo/shared` から利用 |
| セキュリティ（IPC検証） | PASS | Main 側で送信元検証 + 3段バリデーション実施   |

### ステップ 3: 設計判断レビュー

#### `safeInvoke` vs `safeInvokeUnwrap` の選択

- **判断**: `safeInvoke` を使用
- **レビュー結果**: 妥当
- **理由**: SafetyGate のレスポンスは `{ success, data, error }` 形式であり、Renderer 側でビジネスロジック（SAFE/UNSAFE の判定）とバリデーションエラーを区別する必要がある

#### `preload/types.ts` への型追加不要の判断

- **判断**: `types.ts` に SafetyGate 型を追加しない
- **レビュー結果**: 妥当
- **理由**: `SafetyGateResult` は `@repo/shared` で定義済み。P23（二重定義禁止）に準拠

### ステップ 4: Simpler Alternative の検討

| 代替案                                   | 評価   | 理由                                              |
| ---------------------------------------- | ------ | ------------------------------------------------- |
| `safeInvokeUnwrap` を使う                | 不採用 | success: false が正常フローの一部であるため不適切 |
| `IpcResult<T>` を拡張して error 型を変更 | 不採用 | 既存メソッドへの影響が広範                        |
| 現設計（safeInvoke + インライン型）      | 採用   | 最小変更で既存パターンに準拠                      |

### ステップ 5: ゲート判定

| 判定     | 条件                       | 対応                     |
| -------- | -------------------------- | ------------------------ |
| PASS     | 全観点で問題なし           | Phase 4 へ進行           |
| MINOR    | 軽微な指摘あり             | 未タスク化後 Phase 4 へ  |
| MAJOR    | 重大な問題あり（設計問題） | Phase 2 へ戻る           |
| MAJOR    | 重大な問題あり（要件問題） | Phase 1 へ戻る           |
| CRITICAL | 致命的な問題あり           | Phase 1 へ戻り要件再確認 |

### 判定結果: PASS

設計に問題なし。Phase 4 へ進行可能。

### MINOR 追跡テーブル

| MINOR ID | 指摘内容 | 解決予定Phase | 解決確認Phase | 備考 |
| -------- | -------- | ------------- | ------------- | ---- |
| （なし） | -        | -             | -             | -    |

### 確認事項

1. `@repo/shared` の `SafetyGateResult` が正しく export されていることを確認済み（`packages/shared/src/types/index.ts:183`）
2. `IPC_CHANNELS.SKILL_EVALUATE_SAFETY` が `ALLOWED_INVOKE_CHANNELS` に含まれていることを確認済み（`channels.ts:647`）
3. Main ハンドラのレスポンス形式がラップ形式であることを確認済み（`safetyGateHandlers.ts:41,51`）

## 統合テスト連携

| 確認項目           | 内容                                         | レビュー結果   |
| ------------------ | -------------------------------------------- | -------------- |
| テスト設計の網羅性 | T-1〜T-6 で正常系/異常系/セキュリティ網羅    | 十分           |
| レスポンス形式     | テストの期待値がラップ形式と一致             | P60 準拠を確認 |
| モック構成         | invokeWithTimeout のモックが既存パターン準拠 | 妥当           |

## 多角的チェック観点（AIが判断）

| 観点               | 適用 | 確認内容                              |
| ------------------ | ---- | ------------------------------------- |
| セキュリティ       | 該当 | P27, P42 準拠を確認済み               |
| API設計            | 該当 | SkillAPI への追加が既存パターンに準拠 |
| アーキテクチャ     | 該当 | IPC 4層整合性・レイヤー依存方向 PASS  |
| エラーハンドリング | 該当 | ラップ形式の選択根拠が妥当            |

## サブタスク管理

1. Pitfall チェックの実施
2. アーキテクチャ整合性レビュー
3. 設計判断レビュー
4. Simpler Alternative の検討
5. ゲート判定の決定
6. 完了条件の検証

## 成果物

| 成果物           | パス                                                                 | 説明           |
| ---------------- | -------------------------------------------------------------------- | -------------- |
| 設計レビュー結果 | `docs/30-workflows/safety-gate-preload-api/phase-3-design-review.md` | 本ドキュメント |

## 完了条件

- [x] Pitfall チェック（P23, P27, P42, P60, P61, P5）が完了している
- [x] アーキテクチャ整合性レビューが完了している
- [x] 設計判断（safeInvoke 選択・型追加不要）のレビューが完了している
- [x] Simpler Alternative の検討結果が記録されている
- [x] ゲート判定（PASS/MINOR/MAJOR/CRITICAL）が記録されている
- [x] MINOR 追跡テーブルが作成されている
- [x] Phase 4 開始条件が明確になっている
- [x] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 4: テスト作成（TDD: Red）
