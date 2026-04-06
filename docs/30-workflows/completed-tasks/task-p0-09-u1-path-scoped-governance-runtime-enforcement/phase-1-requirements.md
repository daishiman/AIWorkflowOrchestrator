# Phase 1: 現状調査・要件定義

## メタ情報

| 項目       | 値                                         |
| ---------- | ------------------------------------------ |
| Phase      | 1                                          |
| Phase名    | 現状調査・要件定義                         |
| 前提Phase  | なし（開始）                               |
| 後続Phase  | Phase 2                                    |
| ステータス | 完了                                       |
| 作成日     | 2026-04-06                                 |
| 機能名     | path-scoped-governance-runtime-enforcement |

---

## 目的

接続すべき箇所と影響範囲を確定し、path-scoped deny を runtime で実効化するための要件を固定する。

## 背景

TASK-P0-09 で governance 基盤（policy/hooks/audit）を整備した。`execute` phase での tool-level enforcement は機能しているが、`SkillCreatorPermissionPolicy.evaluateContextPolicy()` が持つ **path-scoped deny** ロジックは SDK 実行経路に接続されておらず、runtime で発動していない。

---

## 実行タスク

### タスク1: 現状コード調査

**目的**: 接続すべき箇所と影響範囲を確定する

**実行手順**:

1. `RuntimeSkillCreatorFacade.ts` の `createExecuteGovernanceCanUseTool()` の現在のシグネチャを確認する
2. `execute()` メソッドで `skillRoot` を取得できるか確認する
3. SDK `canUseTool` callback の `input` の実際の型を確認する
4. `CanUseToolContext` インターフェースの定義を確認する（`SkillCreatorPermissionPolicy.ts`）
5. 既存の90件 governance tests の内訳を確認する
6. `improve` phase にも同様の未配線があるか確認する

**期待される成果物**:

- 現状の `createExecuteGovernanceCanUseTool()` シグネチャの記録
- `skillRoot` 取得方法の特定（`getExplicitSkillCreatorRoot()` 等）
- 影響ファイル一覧

### タスク2: 命名規則の分析と記録

**目的**: コードベースの命名規則を確認し、新規コードで一貫性を保つ

**実行手順**:

1. `RuntimeSkillCreatorFacade.ts` の既存メソッド命名パターンを確認する（camelCase等）
2. `CanUseToolContext` フィールド命名を確認する（`targetPath`, `allowedSkillRoot`）
3. テストファイルの命名パターン（`TC-PATH-XX` 等）を確認する
4. 命名規則をgap-analysis.mdに記録する

**期待される成果物**:

- 命名規則の記録（`outputs/phase-1/gap-analysis.md`に含める）

### タスク3: 受入基準の確定

**目的**: 実装完了の判定基準を明確化する

**実行手順**:

1. Issue #1932 の完了条件チェックリストを参照する
2. AC-1〜AC-6 を具体的な検証方法と対応付ける
3. テストケースID（TC-PATH-01〜TC-PATH-06）を受入基準と対応付ける

**受入基準**:
| ID | 基準 | 検証方法 |
| ---- | --------------------------------------------------------------------------------- | ------------------------------------- |
| AC-1 | `execute` phase で skill root 外への Write/Edit が `deny` される | TC-PATH-01 が PASS |
| AC-2 | `execute` phase で skill root 内への Write/Edit が `allow` される | TC-PATH-02 が PASS |
| AC-3 | context が取得できない場合（`targetPath` なし）は tool-level 判定のみ（後方互換） | TC-PATH-03 が PASS |
| AC-4 | 既存 90 件 governance tests が全 PASS | `vitest run __tests__/governance/` |
| AC-5 | TypeScript 型エラーなし | `pnpm --filter @repo/desktop typecheck` |
| AC-6 | `improve` phase で skill root 外への Edit が `deny` される | TC-PATH-05 が PASS |

**期待される成果物**:

- `outputs/phase-1/gap-analysis.md` に受入基準を記録

---

## 参照資料

| 参照資料                        | パス                                                                                            | 内容                   |
| ------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------- |
| TASK-P0-09-U1 指示書            | `docs/30-workflows/unassigned-task/TASK-P0-09-U1-path-scoped-governance-runtime-enforcement.md` | タスク詳細・知見       |
| RuntimeSkillCreatorFacade.ts    | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                           | 修正対象ファイル       |
| SkillCreatorPermissionPolicy.ts | `apps/desktop/src/main/services/runtime/governance/SkillCreatorPermissionPolicy.ts`             | CanUseToolContext 定義 |
| governance テスト               | `apps/desktop/src/main/services/runtime/__tests__/governance/`                                  | 既存90件テスト         |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                                        | 内容                 |
| -------------------- | ------------------------------------------------------------------------------------------- | -------------------- |
| セキュリティ仕様     | `.claude/skills/aiworkflow-requirements/references/security-*.md`                           | セキュリティ要件     |
| インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` | SDK インターフェース |

---

## 成果物

| 成果物          | パス                              | 内容                               |
| --------------- | --------------------------------- | ---------------------------------- |
| gap-analysis.md | `outputs/phase-1/gap-analysis.md` | 現状調査・命名規則・受入基準の記録 |

---

## 統合テスト連携

接続要件（governance canUseTool callback / skillRoot 取得方法）を要件に明記する。

---

## 完了条件

- [ ] `RuntimeSkillCreatorFacade.ts` の `createExecuteGovernanceCanUseTool()` 現行実装を把握している
- [ ] `skillRoot` の取得方法が特定されている（`getExplicitSkillCreatorRoot()` 等）
- [ ] `CanUseToolContext` の型定義が確認されている
- [ ] 命名規則が記録されている
- [ ] `improve` phase の対応方針が決定されている（execute と同一 helper で実装）
- [ ] `outputs/phase-1/gap-analysis.md` が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし（開始Phase）
- **後続**: Phase 2（設計）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-2-design.md`
