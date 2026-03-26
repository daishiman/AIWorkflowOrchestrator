# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 10                 |
| Phase名    | 最終レビューゲート |
| 前提Phase  | Phase 9            |
| 後続Phase  | Phase 11           |
| ステータス | 完了               |
| 作成日     | 2026-03-25         |
| 機能名     | UT-LLM-MOD-01-005  |

---

## 目的

Phase 1 で定義した受け入れ基準（AC-001〜AC-006）を最終確認し、SSoT が確実に確立されていることを検証する。全ての品質ゲートをクリアした状態で、手動テスト（Phase 11）に進めるかを判定する。

---

## 背景

Phase 9 の品質保証を完了。受け入れ基準（AC-001〜AC-006）の最終確認を行い、SSoT が完全に確立されていることを検証する。PASS/MINOR/MAJOR/CRITICAL の判定に基づき、次のアクションを決定する。

---

## 実行タスク

### Task 10-1: 受け入れ基準の最終確認

Phase 1 で定義した AC-001〜AC-006 を一つずつ検証する。

| AC-ID  | 基準                                                                       | 検証方法                            | 判定 |
| ------ | -------------------------------------------------------------------------- | ----------------------------------- | ---- |
| AC-001 | `PROVIDER_CONFIGS` が唯一のプロバイダー/モデル情報源である                 | コードレビュー + grep 検証          | -    |
| AC-002 | `inferProviderId` が `PROVIDER_CONFIGS` から自動導出されている             | ユニットテスト結果確認              | -    |
| AC-003 | `LLMProviderIdSchema` が `PROVIDER_CONFIGS` のキーから自動生成されている   | ユニットテスト結果 + 型チェック確認 | -    |
| AC-004 | 新プロバイダー追加時に `PROVIDER_CONFIGS` のみの変更で済むことをテスト検証 | SSoT検証テスト結果確認              | -    |
| AC-005 | 既存テスト全PASS                                                           | `pnpm test` 結果確認                | -    |
| AC-006 | 型チェック全PASS                                                           | `pnpm typecheck` 結果確認           | -    |

### Task 10-2: SSoT検証（手動enum定義の不在確認）

プロジェクト全体で手動の enum 定義が残存していないことを grep で検証する。

```bash
# 手動 z.enum 定義がないことを確認
# provider-registry.ts 以外で LLM プロバイダーIDの z.enum が定義されていないこと
grep -rn "z.enum\[" packages/shared/

# 手動リテラル配列定義がないことを確認
grep -rn '"openai".*"anthropic".*"google"' packages/shared/src/types/llm/ apps/desktop/src/main/handlers/

# inferProviderId の手動実装がないことを確認
grep -rn "startsWith.*gpt-\|startsWith.*claude-" apps/desktop/src/main/handlers/llm.ts
```

**判定基準**:

- `z.enum()` を使用した手動プロバイダーID定義が `provider-registry.ts` 由来の自動導出以外に存在しないこと
- `inferProviderId` の手動 prefix マッチングが `provider-registry.ts` 以外に存在しないこと

### Task 10-3: 既存import元への影響確認

`LLMProviderIdSchema` / `LLMProviderId` を import している全ファイルで、import パスに変更が不要であることを確認する。

```bash
# LLMProviderIdSchema の import 元を確認
grep -rn "LLMProviderIdSchema" packages/shared/ apps/desktop/

# LLMProviderId の import 元を確認
grep -rn "LLMProviderId" packages/shared/ apps/desktop/

# PROVIDER_CONFIGS の import 元を確認（shared から import されていること）
grep -rn "PROVIDER_CONFIGS" apps/desktop/

# inferProviderId の import 元を確認（shared から import されていること）
grep -rn "inferProviderId" apps/desktop/
```

**確認事項**:

- 既存の import パスが変更されていないこと
- `packages/shared/src/types/llm/schemas/index.ts` 経由の re-export が正常であること
- `apps/desktop/` から `packages/shared/` への import 方向のみであること（逆方向の import がないこと）

### Task 10-4: レビュー結果判定

| 判定     | 条件                             | 次のアクション          |
| -------- | -------------------------------- | ----------------------- |
| PASS     | AC-001〜AC-006 全て合格          | Phase 11 へ進行         |
| MINOR    | 軽微な指摘あり（機能影響なし）   | 指摘対応後、Phase 11 へ |
| MAJOR    | 重大な問題あり（AC 未達成）      | Phase 8 へ戻り修正      |
| CRITICAL | 致命的な問題あり（設計変更必要） | Phase 2 へ戻り再設計    |

### 戻り先決定基準（詳細）

| 問題の種類       | 戻り先                | 具体例                           |
| ---------------- | --------------------- | -------------------------------- |
| 要件の問題       | Phase 1（要件定義）   | ACの定義漏れ、スコープの不明確さ |
| 設計の問題       | Phase 2（設計）       | DJ-001〜003の再検討が必要        |
| テスト設計の問題 | Phase 4（テスト）     | テストケースの不足               |
| 実装の問題       | Phase 5（実装）       | コードのバグ、型エラー           |
| 品質の問題       | Phase 8（リファクタ） | コード品質の改善が必要           |
| テスト網羅の問題 | Phase 6（テスト拡充） | カバレッジ不足                   |
| ドリフトの問題   | Phase 9（品質保証）   | IPC契約ドリフト検出              |

### MINOR判定時のフロー

1. MINOR指摘事項を一覧化
2. 対応可能なものは本Phase内で即時修正
3. 本Phase外の対応が必要なものは未完了タスク指示書として記録
4. 全MINOR指摘への対応方針が確定した時点でPASS判定に移行

---

## 参照資料

| 参照資料         | パス                           | 内容                         |
| ---------------- | ------------------------------ | ---------------------------- |
| Phase 1 要件定義 | `phase-1-requirements.md`      | 受け入れ基準 AC-001〜AC-006  |
| Phase 2 設計     | `phase-2-design.md`            | アーキテクチャ設計           |
| Phase 9 品質保証 | `phase-9-quality-assurance.md` | テスト・Lint・型チェック結果 |

---

## 統合テスト連携

| 確認事項                                              | 基準                                           | 判定 |
| ----------------------------------------------------- | ---------------------------------------------- | ---- |
| SSoT が確立されていること                             | grep で手動定義が検出されないこと              | -    |
| 全 import 元で型が正常に解決されること                | pnpm typecheck PASS                            | -    |
| PROVIDER_CONFIGS → LLMProviderIdSchema の導出チェーン | provider-registry.ts → provider.ts → import 元 | -    |
| PROVIDER_CONFIGS → inferProviderId の導出チェーン     | provider-registry.ts → llm.ts (import)         | -    |

---

## 成果物

| 成果物           | パス                                      | 内容                     |
| ---------------- | ----------------------------------------- | ------------------------ |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | AC判定結果とSSoT検証結果 |

---

## 完了条件

- [ ] AC-001: PROVIDER_CONFIGS が唯一のSSoTであることを確認済み
- [ ] AC-002: inferProviderId が PROVIDER_CONFIGS から自動導出されていることを確認済み
- [ ] AC-003: LLMProviderIdSchema が PROVIDER_CONFIGS から自動生成されていることを確認済み
- [ ] AC-004: 新プロバイダー追加テストがPASSしていることを確認済み
- [ ] AC-005: 既存テスト全PASSを確認済み
- [ ] AC-006: 型チェック全PASSを確認済み
- [ ] SSoT検証: grep で手動enum定義が検出されないことを確認済み
- [ ] 既存import元への影響がないことを確認済み
- [ ] レビュー判定結果（PASS/MINOR/MAJOR/CRITICAL）が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/UT-LLM-MOD-01-005 --phase 10
```

---

## Phase実行記録

Phase完了後、以下を記録してください:

## Phase 10 実行記録

### 実行タスク

| タスク | 結果 | 備考 |
| ------ | ---- | ---- |

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

- ***

## 次のPhase

Phase 11: 手動テスト

`docs/30-workflows/completed-tasks/UT-LLM-MOD-01-005/phase-11-*.md`
