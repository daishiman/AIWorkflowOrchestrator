# 完了タスク台帳 — 2026-04 (h)

## UNASSIGNED-EMB-005-A: XenovaTransformerEncoder 実装（Late Chunking IEncoder 実装）（2026-04-20）

| 項目       | 内容                                                                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | UNASSIGNED-EMB-005-A                                                                                                                                            |
| ステータス | **完了（全 Phase 1〜12 PASS）**                                                                                                                                 |
| タイプ     | 実装 / NON_VISUAL / 単一クラス追加                                                                                                                              |
| 優先度     | 中                                                                                                                                                              |
| 完了日     | 2026-04-20                                                                                                                                                      |
| 対象       | `packages/shared/src/services/embedding/late-chunking/xenova-transformer-encoder.ts` / `packages/shared/src/services/embedding/__tests__/late-chunking/`       |
| 成果物     | `outputs/phase-12/implementation-guide.md` / `outputs/phase-12/system-spec-update-summary.md` / `outputs/artifacts.json`                                       |

#### 実施内容

- `XenovaTransformerEncoder implements IEncoder` を新規実装（131行）
  - `@xenova/transformers` の遅延 dynamic import（初回 `encode()` 呼び出し時のみモデルロード）
  - `classifyError()` による OOM / EmbeddingError 中央集約分類（RangeError + テキストマッチ2系統）
  - `unknown` + 局所キャストで `@xenova/transformers` 型不安定を吸収（`any` 漏洩ゼロ）
  - デフォルトモデル: `Xenova/all-MiniLM-L6-v2`
- ユニットテスト 29件（XENC-NORMAL 6件 / XENC-ERROR 8件 / XENC-BOUNDARY 4件 他）PASS
- 統合テスト 6件（XENC-INT-01〜06: `LateChunkingService` DI 互換性検証）PASS
- `packages/shared/src/services/embedding/late-chunking/index.ts` に `XenovaTransformerEncoder` をエクスポート追加
- 正本同期: `llm-embedding.md` / `architecture-embedding-pipeline.md` / `LOGS.md` / `indexes/` 更新完了

#### Phase 11/12 成果物

| 成果物                       | パス                                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| 実装ガイド                   | `docs/30-workflows/UNASSIGNED-EMB-005-A-xenova-transformer-encoder/outputs/phase-12/implementation-guide.md` |
| システム仕様更新サマリー     | `docs/30-workflows/UNASSIGNED-EMB-005-A-xenova-transformer-encoder/outputs/phase-12/system-spec-update-summary.md` |
| ドキュメント更新履歴         | `docs/30-workflows/UNASSIGNED-EMB-005-A-xenova-transformer-encoder/outputs/phase-12/documentation-changelog.md` |
| 未タスク検出レポート         | `docs/30-workflows/UNASSIGNED-EMB-005-A-xenova-transformer-encoder/outputs/phase-12/unassigned-task-detection.md` |
| スキルフィードバックレポート | `docs/30-workflows/UNASSIGNED-EMB-005-A-xenova-transformer-encoder/outputs/phase-12/skill-feedback-report.md` |
| Phase 12 準拠チェック        | `docs/30-workflows/UNASSIGNED-EMB-005-A-xenova-transformer-encoder/outputs/phase-12/phase12-task-spec-compliance-check.md` |
| 手動テスト結果               | `docs/30-workflows/UNASSIGNED-EMB-005-A-xenova-transformer-encoder/outputs/phase-11/manual-test-result.md` |

#### 検証証跡

- vitest 66件 PASS（ユニット 29 + 統合 6 + その他 31）
- typecheck PASS
- `outputs/phase-12/phase12-task-spec-compliance-check.md`: PASS
- NON_VISUAL: Phase 11 スクリーンショット不要（UI 変更なし）

#### 苦戦箇所

| # | 苦戦箇所                                                           | 解決策                                                                       |
|---|------------------------------------------------------------------|------------------------------------------------------------------------------|
| 1 | `@xenova/transformers` 型定義不安定による TypeScript エラー       | `unknown` + 局所的型アサーションで吸収（`any` 漏洩ゼロ）                   |
| 2 | OOM パターン多様性（RangeError 以外でも OOM が発生）             | `classifyError()` に RangeError + テキストマッチ2系統を実装                  |
| 3 | Electron レンダラー環境での動的 import 未検証                    | スコープ外として EMB-005-B（`docs/30-workflows/unassigned-task/`）に別タスク化 |

#### lessons-learned

- L-EMB-005-001〜003: `references/lessons-learned-current-2026-04.md` §UNASSIGNED-EMB-005-A に記録済み
- 未タスク: `docs/30-workflows/unassigned-task/EMB-005-B-electron-e2e.md`（Electron レンダラー E2E 動作確認）

---

## TASK-RALLY-001: SkillLifecyclePanel dead code 除去（RALLY Wave 0 並列タスク）（2026-04-21）

| 項目       | 内容                                                                                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-RALLY-001                                                                                                                                             |
| ステータス | **完了（全 Phase 1〜12 PASS）/ Phase 13 blocked（user approval 待ち）**                                                                                    |
| タイプ     | 実装 / NON_VISUAL / dead-code-removal                                                                                                                      |
| 優先度     | 高（Wave 1 RALLY-005 の前提）                                                                                                                              |
| 完了日     | 2026-04-21                                                                                                                                                 |
| 対象       | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                                                                      |
| 成果物     | `docs/30-workflows/wave0-par-RALLY-001/outputs/phase-12/` 6 ファイル                                                                                      |

#### 実施内容

- `_handleSubmitWorkflowInput` 関数（41行）を削除
- 旧入力 state 4種（`selectedOptionId` / `textAnswer` / `secretAnswer` / `confirmAnswer`）を削除
- companion `useEffect`（workflowSnapshot リセット処理）を削除
- 入力送信の責務を `ConversationalInterview` 側フローに一本化
- `docs/30-workflows/wave0-par-RALLY-001/` を canonical 配置先として確定（旧: `skill-create-flow-gaps/wave0-par-RALLY-001/`）

#### Phase 11/12 成果物

| 成果物                       | パス                                                                               |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| 実装ガイド                   | `docs/30-workflows/wave0-par-RALLY-001/outputs/phase-12/implementation-guide.md`  |
| システム仕様更新サマリー     | `docs/30-workflows/wave0-par-RALLY-001/outputs/phase-12/system-spec-update-summary.md` |
| ドキュメント更新履歴         | `docs/30-workflows/wave0-par-RALLY-001/outputs/phase-12/documentation-changelog.md` |
| 未タスク検出レポート         | `docs/30-workflows/wave0-par-RALLY-001/outputs/phase-12/unassigned-task-detection.md` |
| スキルフィードバックレポート | `docs/30-workflows/wave0-par-RALLY-001/outputs/phase-12/skill-feedback-report.md` |
| Phase 12 準拠チェック        | `docs/30-workflows/wave0-par-RALLY-001/outputs/phase-12/phase12-task-spec-compliance-check.md` |

#### 検証証跡

- vitest PASS / typecheck PASS / lint PASS
- AC-1〜AC-5 + AC-2b all PASS
- NON_VISUAL: Phase 11 スクリーンショット不要（UI 変更なし）

#### 苦戦箇所

| # | 苦戦箇所                                                                   | 解決策                                                                              |
|---|--------------------------------------------------------------------------|-------------------------------------------------------------------------------------|
| 1 | companion useEffect の削除漏れリスク（AC-2b として設計書に捕捉）          | Phase 1 P50 チェックで事前発見し、Phase 2 設計書の AC-2b として明示化して除去完了 |

#### skill-feedback

- task-specification-creator: 改善点なし。Phase 1 P50 チェックによる companion useEffect 事前発見が特に有効だった。
