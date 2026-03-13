---
id: TASK-10A-E-A
tier: 3
title: TASK-10A-E IPC契約・セキュリティ整合
depends_on: [TASK-10A-E]
parallel_with: [TASK-10A-E-B, TASK-10A-E-C]
blocks: [TASK-10A-E-D]
status: pending
priority: high
estimated_complexity: small
tags: [docs, ipc, preload, security]
---

# TASK-10A-E-A IPC契約・セキュリティ整合

## メタ情報

| 項目       | 値                                                  |
| ---------- | --------------------------------------------------- |
| 担当       | SubAgent-A                                          |
| 対象       | `SkillManagementPanel` の import 関連 API 呼び出し  |
| 実行モード | 仕様策定のみ（実装・テスト実行・コミット・PRなし）  |
| 方針       | 既存 IPC 契約を再利用し、新規チャンネルは追加しない |

## 目的

`skill:import` 契約を壊さず、Preload 境界と Renderer 呼び出し責務を安全に保つ。`skill:importFromSource` と用途が混在しない仕様を確定し、`TASK-10A-E-D` で統合できる検証条件を定義する。

## Atent Team 内の分担（SubAgent-A 内）

| 役割                 | 担当範囲                                                    | 実行方式        | 出力                         |
| -------------------- | ----------------------------------------------------------- | --------------- | ---------------------------- |
| SubAgent-A1 Contract | `skill:import` / `skill:importFromSource` の契約境界整理    | 並列            | IPC契約マトリクス            |
| SubAgent-A2 Security | sender検証、P42、Preload境界、エラーサニタイズ整理          | 並列            | セキュリティ固定パイプライン |
| SubAgent-A3 Error    | `ERR_1001` / `ERR_2004` / `ERR_5001` の表示・再試行方針整理 | 直列（A1/A2後） | エラーマッピング表           |

## 実行タスク

- 契約固定: `skill:import` の引数・戻り値・バリデーションを正本に合わせて固定
- 境界分離: `skill:import` と `skill:importFromSource` の責務重複を禁止
- セキュリティ固定: sender -> P42 -> 境界検証 -> サニタイズの順序を固定
- 非スコープ明確化: Main 側新規ハンドラ追加・Preload API追加を禁止
- D への引き渡し: 契約/セキュリティ/エラーのテスト観点を渡す

## 参照資料（aiworkflow-requirements）

| 参照資料                  | パス                                                                              | 使用目的                                                                  |
| ------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| resource-map              | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                  | タスク種別（API設計/セキュリティ実装/テスト実装）を特定                   |
| quick-reference           | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`               | IPC・P42・Result の先行パターンを固定                                     |
| API設計方針               | `.claude/skills/aiworkflow-requirements/references/api-core.md`                   | API責務分離とエラー返却方針を固定                                         |
| API一覧                   | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`              | 既存チャネル命名と責務境界の逸脱を防止                                    |
| Skill APIインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | `skill:import` の `skillName: string` 契約と `ImportedSkill` 戻り値を固定 |
| IPC API仕様               | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | `skill:importFromSource` の別契約（`ShareTarget`）との責務分離            |
| セキュリティ実装ガイド    | `.claude/skills/aiworkflow-requirements/references/security-implementation.md`    | 実装時のセキュリティ観点を欠落なく適用                                    |
| セキュリティ原則          | `.claude/skills/aiworkflow-requirements/references/security-principles.md`        | 最小権限/境界防御の原則を固定                                             |
| IPCセキュリティ           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | sender検証順序、P42、ハンドラ重複防止、safeInvokeパターン整合             |
| Preloadセキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`      | `contextIsolation` + チャネルホワイトリスト準拠                           |
| エラー仕様                | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | `ERR_1001` / `ERR_2004` / `ERR_5001` の分類と表示方針                     |
| 品質要件                  | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | テスト品質ゲートとカバレッジ基準を固定                                    |
| タスク運用ルール          | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`        | 仕様書品質ゲートと差戻し条件を固定                                        |

## aiworkflow抽出トレーサビリティ

| 抽出ステップ            | 参照                                                                         | 抽出結果                                                    |
| ----------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------- |
| 1. タスク種別特定       | `indexes/resource-map.md`                                                    | API設計 / セキュリティ実装 / テスト実装に分類               |
| 2. 先行パターン固定     | `indexes/quick-reference.md`                                                 | IPCパターン、safeInvoke、P42観点を固定                      |
| 3. 契約正本抽出         | `references/interfaces-agent-sdk-skill.md`, `references/api-ipc-agent.md`    | `skill:import` と `skill:importFromSource` の契約境界を確定 |
| 4. セキュリティ正本抽出 | `references/security-electron-ipc.md`, `references/security-api-electron.md` | sender -> P42 -> 境界 -> サニタイズ順序を確定               |
| 5. エラー正本抽出       | `references/error-handling.md`                                               | `ERR_1001` / `ERR_2004` / `ERR_5001` のUI方針を確定         |

## IPC契約固定マトリクス

| チャネル                 | リクエスト契約                                | レスポンス契約                   | バリデーション                             | 非スコープ                       |
| ------------------------ | --------------------------------------------- | -------------------------------- | ------------------------------------------ | -------------------------------- |
| `skill:import`           | `skillName: string`（オブジェクトラップ禁止） | `ImportedSkill`                  | `typeof === "string"` かつ `trim() !== ""` | Mainハンドラ新設禁止             |
| `skill:importFromSource` | `source: ShareTarget`                         | `ShareResult<ShareImportResult>` | source構造 + P42 3段 + 許可値              | importボタン導線から直接呼ばない |

## セキュリティ固定パイプライン

| 順序 | 固定ルール                                                   | 判定                                   |
| ---- | ------------------------------------------------------------ | -------------------------------------- |
| 1    | `validateIpcSender` を最初に実行                             | 不正senderは即拒否                     |
| 2    | P42準拠3段バリデーション（型/空文字/trim空文字）             | `VALIDATION_ERROR` で失敗返却          |
| 3    | Preload境界（`safeInvoke` 経由、ホワイトリストチャネルのみ） | Renderer直接IPC呼び出しを禁止          |
| 4    | エラーサニタイズ                                             | 内部情報を露出しないメッセージへ正規化 |
| 5    | ハンドラライフサイクル管理                                   | 二重登録を禁止（登録/解除を対で管理）  |

## エラーマッピング（Renderer表示方針）

| エラーコード | 分類             | 表示方針                            | 再試行     |
| ------------ | ---------------- | ----------------------------------- | ---------- |
| `ERR_1001`   | Validation Error | 入力値修正を促す                    | 不可       |
| `ERR_2004`   | Business Error   | 状態不整合として操作順を案内        | 不可       |
| `ERR_5001`   | Internal Error   | 汎用エラーメッセージ + ログ確認導線 | 可（手動） |

## 実行手順

1. `interfaces-agent-sdk-skill.md` を基準に `skill:import` 契約（`skillName` 非空文字列、`ImportedSkill` 戻り値）を固定する。
2. `api-ipc-agent.md` を基準に `skill:importFromSource` を別責務として切り離し、UI import 導線から除外する。
3. `security-electron-ipc.md` / `security-api-electron.md` を基準に、sender -> P42 -> 境界 -> サニタイズの順序を仕様へ固定する。
4. `error-handling.md` を基準に、`ERR_1001` / `ERR_2004` / `ERR_5001` の UI 表示ルールと再試行可否を確定する。
5. `TASK-10A-E-D` 向けにテスト観点を引き渡す（契約・セキュリティ・エラーの3分類）。

## SubAgent-D 引き渡し項目（テスト観点）

| 観点     | テスト内容                                            | 期待結果             |
| -------- | ----------------------------------------------------- | -------------------- |
| 契約     | `skill:import` が `skillName: string` 以外を拒否      | `VALIDATION_ERROR`   |
| 境界分離 | import UI導線で `skill:importFromSource` が呼ばれない | チャネル混在なし     |
| sender   | 未許可senderからの呼び出し拒否                        | Unauthorized系エラー |
| P42      | 空文字・空白文字列・型不正を拒否                      | 入力エラー返却       |
| エラー   | `ERR_1001/2004/5001` がUI方針どおり表示される         | 表示ドリフトなし     |

## 成果物

| 成果物                       | パス                                               | 説明                                          |
| ---------------------------- | -------------------------------------------------- | --------------------------------------------- |
| IPC契約仕様書                | `task-043a-ipc-contract-and-security-alignment.md` | import 契約・セキュリティ・エラー境界の定義   |
| 13フェーズ仕様書ディレクトリ | `task-043a-ipc-contract-and-security-alignment/`   | `index.md` + `phase-1..13` + `artifacts.json` |

## 13フェーズ仕様書（task-specification-creator準拠）

- `task-043a-ipc-contract-and-security-alignment/index.md`
- `task-043a-ipc-contract-and-security-alignment/phase-1-requirements.md`
- `task-043a-ipc-contract-and-security-alignment/phase-2-design.md`
- `task-043a-ipc-contract-and-security-alignment/phase-3-design-review.md`
- `task-043a-ipc-contract-and-security-alignment/phase-4-test-creation.md`
- `task-043a-ipc-contract-and-security-alignment/phase-5-implementation.md`
- `task-043a-ipc-contract-and-security-alignment/phase-6-test-expansion.md`
- `task-043a-ipc-contract-and-security-alignment/phase-7-coverage-check.md`
- `task-043a-ipc-contract-and-security-alignment/phase-8-refactoring.md`
- `task-043a-ipc-contract-and-security-alignment/phase-9-quality-assurance.md`
- `task-043a-ipc-contract-and-security-alignment/phase-10-final-review.md`
- `task-043a-ipc-contract-and-security-alignment/phase-11-manual-test.md`
- `task-043a-ipc-contract-and-security-alignment/phase-12-documentation.md`
- `task-043a-ipc-contract-and-security-alignment/phase-13-pr-creation.md`

## 完了条件

- [ ] `skill:import` の契約（引数/戻り値/バリデーション）が固定されている
- [ ] `skill:importFromSource` との責務分離が固定されている
- [ ] sender -> P42 -> 境界 -> サニタイズの順序が明文化されている
- [ ] `ERR_1001` / `ERR_2004` / `ERR_5001` の表示方針が明文化されている
- [ ] `TASK-10A-E-D` へ渡すテスト観点が記載されている
- [ ] 本仕様書が実装・コミット・PRを含まないことが明記されている
