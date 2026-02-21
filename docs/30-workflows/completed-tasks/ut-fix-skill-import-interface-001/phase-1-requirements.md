# Phase 1: 要件定義 — skill:import IPCハンドラ・Preloadインターフェース不整合修正

## メタ情報

| 項目        | 値                                |
| ----------- | --------------------------------- |
| タスクID    | UT-FIX-SKILL-IMPORT-INTERFACE-001 |
| Phase       | 1（要件定義）                     |
| 前Phase依存 | なし                              |
| 担当        | Claude Code                       |
| 作成日      | 2026-02-21                        |

## 目的

skill:import IPCチャンネルにおけるMain Process側ハンドラとPreload側呼び出し元のインターフェース不整合を特定し、修正の受入基準を定義する。

## 実行タスク

- 参照仕様確認: aiworkflow-requirements と既存実装差分を確認する
- 実装/検証手順定義: 本Phaseで実施する作業を具体化する
- 成果物反映: outputs 配下に結果を記録する

1. 問題の根本原因分析
2. 影響範囲の特定
3. 受入基準の定義

## 参照資料

| 資料                                                                                                       | 用途                                          |
| ---------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-ut-fix-skill-import-interface-001.md` | タスク指示書（問題の背景・スコープ）          |
| `docs/30-workflows/completed-tasks/ut-fix-skill-remove-interface/phase-1-requirements.md`                  | 同一パターン（P44）の先行修正タスク           |
| `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                              | P23/P32/P42/P44 の統合チェックリスト          |
| `.claude/rules/06-known-pitfalls.md#P44`                                                                   | skill:import/remove IPCインターフェース不整合 |
| `.claude/rules/06-known-pitfalls.md#P23`                                                                   | API二重定義の型管理複雑性                     |
| `.claude/rules/06-known-pitfalls.md#P42`                                                                   | 文字列引数の `.trim()` バリデーション漏れ     |

## 実行手順

### Step 1: 問題の根本原因分析

#### 1.1 不整合の所在

| レイヤー     | ファイル                                     | 行番号  | 期待する引数             | 実際の引数            |
| ------------ | -------------------------------------------- | ------- | ------------------------ | --------------------- |
| Main Process | `apps/desktop/src/main/ipc/skillHandlers.ts` | 123     | `{ skillIds: string[] }` | —                     |
| Preload      | `apps/desktop/src/preload/skill-api.ts`      | 261-262 | —                        | `string`（skillName） |

#### 1.2 エラー発生メカニズム

```
Renderer:  window.electronAPI.skill.import("my-skill")
  ↓
Preload:   safeInvoke(IPC_CHANNELS.SKILL_IMPORT, "my-skill")  ← 文字列を渡す
  ↓
Main:      handler(event, args)
           args = "my-skill"                                    ← argsが文字列
           !Array.isArray(args?.skillIds)                       ← args.skillIds = undefined
           → VALIDATION_ERROR: "skillIds must be an array"
```

#### 1.3 根本原因

P23パターン（API二重定義の型管理複雑性）の再発。ハンドラ実装時に配列形式 `{ skillIds: string[] }` で「複数一括インポート」を想定して設計したが、Preload側の `skill-api.ts` は単一スキル名の文字列を直接渡す設計になっており、インターフェース契約が乖離している。コンパイル時にはPreloadのモック化により検出されず、ランタイムで初めて顕在化する。

#### 1.4 skill:remove との対比（P44パターン）

| 項目             | skill:import（本タスク）         | skill:remove（UT-FIX-SKILL-REMOVE-INTERFACE-001） |
| ---------------- | -------------------------------- | ------------------------------------------------- |
| ハンドラ期待引数 | `{ skillIds: string[] }`（配列） | `{ skillId: string }`（オブジェクト）             |
| Preload渡し形式  | `string`（skillName）            | `string`（skillName）                             |
| エラーメッセージ | `skillIds must be an array`      | `skillId must be a string`                        |
| 修正ステータス   | 未修正（本タスクで対応）         | 修正済み（2026-02-20）                            |

### Step 2: 影響範囲の特定

#### 2.1 直接影響

| 影響箇所                          | 影響内容                                               |
| --------------------------------- | ------------------------------------------------------ |
| スキルインポート機能              | ランタイムでバリデーションエラーが発生しインポート不可 |
| `skillHandlers.ts` 行120-138      | ハンドラの引数シグネチャ修正が必要                     |
| `skillHandlers.test.ts` 行633-740 | テストの引数形式修正が必要                             |

#### 2.2 影響なし（変更不要）

| ファイル                                               | 確認結果                                                                     |
| ------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `apps/desktop/src/preload/skill-api.ts` 行261-262      | 既に `safeInvoke(channel, skillName)` で正しい                               |
| `apps/desktop/src/preload/__tests__/skill-api.test.ts` | 既に文字列を期待するテストで正しい                                           |
| `packages/shared/src/agent/types.ts`                   | `skill:import` に関連する型定義なし                                          |
| `apps/desktop/src/preload/types.ts`                    | `import` メソッドは `(skillName: string) => Promise<ImportedSkill>` で正しい |

### Step 3: 受入基準

#### 機能要件

| ID   | 受入基準                                                                      | 検証方法                                          |
| ---- | ----------------------------------------------------------------------------- | ------------------------------------------------- |
| FR-1 | `skill:import` を文字列引数で呼び出した場合にバリデーションエラーが発生しない | テスト SH-IMP-01 PASS                             |
| FR-2 | `skillService.importSkills` に正しいスキル名が配列として渡される              | テスト SH-IMP-01 で `toHaveBeenCalledWith` を検証 |
| FR-3 | 存在しないスキル名での呼び出しがサービス層で処理される                        | テスト SH-IMP-04 PASS                             |

#### 品質要件

| ID   | 受入基準                                                 | 検証方法                          |
| ---- | -------------------------------------------------------- | --------------------------------- |
| QR-1 | P42準拠の3段バリデーション（型→空文字列→トリム空文字列） | テスト SH-IMP-02, 03, 05, 06 PASS |
| QR-2 | `validateIpcSender` によるセキュリティ検証が維持される   | テスト SH-IMP-07, 08 PASS         |
| QR-3 | カバレッジ基準: Line ≥ 80%, Branch ≥ 60%, Function ≥ 80% | Phase 7 カバレッジレポート        |
| QR-4 | `pnpm typecheck` が通る                                  | Phase 9 品質検証                  |
| QR-5 | skill:import 以外の全テストにリグレッションがない        | Phase 9 全テスト実行              |

#### 非スコープ

| 項目                              | 理由                                                  |
| --------------------------------- | ----------------------------------------------------- |
| skill:remove の修正               | 別タスク UT-FIX-SKILL-REMOVE-INTERFACE-001 で修正済み |
| 他の skill:\* ハンドラの修正      | 本タスクのスコープ外                                  |
| Preload側 (`skill-api.ts`) の変更 | 既に正しい実装のため変更不要                          |
| 新規機能の追加                    | バグ修正のみ                                          |

## 統合テスト連携

| 連携観点             | 本Phaseでの確認内容                                                          |
| -------------------- | ---------------------------------------------------------------------------- |
| Preload→Main IPC契約 | `skill-api.ts` の引数形式と `skillHandlers.ts` の受け口を照合する            |
| バリデーション連携   | sender検証・入力バリデーション・エラーコードの整合を確認する                 |
| テスト連携           | `skillHandlers.test.ts` / `skill-api.test.ts` の期待値と実装契約を一致させる |

## 多角的チェック観点（aiworkflow-requirements）

| 観点               | 参照仕様                                                                                    | 本タスクでの確認ポイント                   |
| ------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------ |
| API設計            | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`                        | `skill:import/remove` チャンネル定義の整合 |
| インターフェース   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Skill管理API契約（引数・戻り値）整合       |
| アーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | Main/Preload間の責務境界と引数契約         |
| セキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | `validateIpcSender` と入力検証の必須要件   |
| Electron IPC       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | `safeInvoke` とホワイトリスト制約          |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P23/P42に基づく実装整合                    |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | `VALIDATION_ERROR` 等の扱い統一            |

## 成果物

| 成果物     | パス                              |
| ---------- | --------------------------------- |
| 要件定義書 | `outputs/phase-1/requirements.md` |

## 完了条件

- [ ] 不整合の所在（Main Process / Preload のファイル・行番号）が特定されている
- [ ] エラー発生メカニズムが呼び出しチェーンで記述されている
- [ ] 根本原因が P23 パターンとして特定されている
- [ ] skill:remove との対比表（P44パターン）が記載されている
- [ ] 影響範囲（変更必要ファイル2件 / 変更不要ファイル4件）が列挙されている
- [ ] 機能要件（FR-1〜FR-3）が検証方法付きで定義されている
- [ ] 品質要件（QR-1〜QR-5）が検証方法付きで定義されている
- [ ] 非スコープが明示されている

## 次Phase

Phase 2（設計）へ進む。修正方針（アプローチA: ハンドラ修正）のインターフェース設計を行う。
