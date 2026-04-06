# Phase 1: 要件定義 - TASK-P0-01 verify 実行エンジン（Layer 1/2）

## メタ情報

| 項目      | 内容                                                   |
| --------- | ------------------------------------------------------ |
| Phase     | 1                                                      |
| Phase名   | 要件定義                                               |
| カテゴリ  | 要件                                                   |
| 機能名    | step-09-par-task-p0-01-verify-execution-engine-layer12 |
| 作成日    | 2026-04-04                                             |
| 前提Phase | なし                                                   |
| 後続Phase | Phase 2                                                |

## 目的

TASK-P0-01 の要件を明確化し、既存コード・型定義・統合ポイントの調査を完了させ、受け入れ基準を確定する。

## タスク分類

| 項目       | 判定                                                           |
| ---------- | -------------------------------------------------------------- |
| タスク種別 | 実装タスク（バックエンド Main Process）                        |
| UI変更     | なし（UI 表示は TASK-RT-03 の責務）                            |
| IPC変更    | なし（既存 `verifySkill()` メソッドの内部実装のみ）            |
| 命名規則   | camelCase（TypeScript 標準）、チェック ID は `L{N}-{NNN}` 形式 |

## 実行タスク

### タスク1: 既存 verify 実装調査

**目的**: verify フェーズに関連する既存コード・型定義・統合ポイントの現状を把握する

**手順**:

1. `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` を読み、`verify` フェーズへの遷移メソッド（`recordVerifyPass()` / `recordVerifyFailure()`）のシグネチャと引数を確認する
2. `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` を読み、`verifySkill()` メソッドの現在の実装（`verificationEngine` の optional 呼び出し部分）を確認する
3. `packages/shared/src/types/skillCreator.ts` を読み、`SkillCreatorVerifyResult` / `RuntimeSkillCreatorVerifyCheck` / `RuntimeSkillCreatorVerifyCheckSeverity` の既存定義を確認する
4. `.claude/skills/` 配下のスキルディレクトリ構造（SKILL.md / agents/ / references/ / output-schema.json）を実際に確認し、検証対象の実態を把握する
5. `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts` が存在する場合、既存テストの内容を確認する

**期待される成果物**:

- 調査結果レポート（`outputs/phase-1/investigation-report.md`）

### タスク2: 要件抽出

**目的**: 機能要件・非機能要件を抽出し、分類 b

**手順**:

1. Issue #1886 のタスク指示書から機能要件を抽出する
2. P0 是正パック（`p0-verify-manifest-remediation-pack.md`）から依存関係と制約を確認する
3. `interfaces-skill-verify-contract.md` の FR-04 verify 契約から check ID 体系を確認する

**機能要件（FR）**:

| FR ID  | 要件                                                                        | 優先度 |
| ------ | --------------------------------------------------------------------------- | ------ |
| FR-001 | `SkillCreatorVerificationEngine.verify(skillDir)` で Layer 1/2 チェック実行 | must   |
| FR-002 | Layer 1: ファイル・ディレクトリ存在確認（L1-001〜L1-005）                   | must   |
| FR-003 | Layer 2: コンテンツ検証（L2-001〜L2-007）                                   | must   |
| FR-004 | `RuntimeSkillCreatorVerifyCheck` 型で結果を返す                             | must   |
| FR-005 | `RuntimeSkillCreatorFacade.verifySkill()` から透過的に呼ばれる              | must   |
| FR-006 | verify 結果が WorkflowEngine の状態に反映される                             | must   |
| FR-007 | Layer 1 エラー時も、対象がある Layer 2 の対応チェックを出力制御する         | should |

**非機能要件（NFR）**:

| NFR ID  | 要件                                                   | 優先度 |
| ------- | ------------------------------------------------------ | ------ |
| NFR-001 | 独立モジュールとして設計（Facade 直接埋め込み禁止）    | must   |
| NFR-002 | Layer 関数はモジュールプライベートな純粋関数として実装 | must   |
| NFR-003 | `any` 型の使用禁止（strict 型定義を維持）              | must   |
| NFR-004 | P0-02（閉ループ）と共有できる VerifyResult 型          | must   |
| NFR-005 | テスト用フィクスチャは `os.tmpdir()` 配下に動的生成    | should |

### タスク3: 受け入れ基準（AC）の定義

**目的**: 検証可能な受け入れ基準を確定する

| AC ID | 基準                                                                                        | 検証方法       |
| ----- | ------------------------------------------------------------------------------------------- | -------------- |
| AC-1  | `SkillCreatorVerificationEngine` が独立クラスとして実装されている                           | code-review    |
| AC-2  | `validateLayer1()` が L1-001〜L1-005 の 5 チェックを実装している                            | automated-test |
| AC-3  | `validateLayer2()` が L2-001〜L2-007 の 7 チェックを実装している                            | automated-test |
| AC-4  | `verify()` が Layer 1/2 の全チェック結果を結合して返す                                      | automated-test |
| AC-5  | `RuntimeSkillCreatorVerifyCheck` 型が `packages/shared` に定義されている                    | automated-test |
| AC-6  | `RuntimeSkillCreatorFacade.verifySkill()` が `verificationEngine.verify()` を呼び出している | automated-test |
| AC-7  | verify 結果（error あり/なし）が WorkflowEngine に正しくルーティングされている              | automated-test |
| AC-8  | Layer 1/2 の全チェックに対するユニットテストが存在し pass する                              | automated-test |
| AC-9  | `pnpm --filter @repo/desktop typecheck` がエラーなし                                        | automated-test |
| AC-10 | `pnpm --filter @repo/desktop lint` がエラーなし                                             | automated-test |

### タスク4: Layer 1 / Layer 2 チェック仕様の確定

**目的**: 各 Layer のチェック項目、severity、合否基準を確定する

#### Layer 1: 形式検証（構造・存在確認）

Layer 1 は「ファイル・ディレクトリが期待通りに存在するか」という構造レベルの検証を担う。ファイルの内容は読まない（存在確認のみ）。

| チェック ID | 検証対象                          | 合否基準                                               | severity |
| ----------- | --------------------------------- | ------------------------------------------------------ | -------- |
| L1-001      | SKILL.md 存在確認                 | `skillDir/SKILL.md` がファイルとして存在する           | error    |
| L1-002      | agents/ ディレクトリ存在確認      | `skillDir/agents/` がディレクトリとして存在する        | error    |
| L1-003      | agents/ に 1 件以上のファイル存在 | `agents/` 配下にファイルが 1 件以上ある                | error    |
| L1-004      | references/ ディレクトリ存在確認  | `skillDir/references/` がディレクトリとして存在する    | warning  |
| L1-005      | output-schema.json 存在確認       | `skillDir/output-schema.json` がファイルとして存在する | warning  |

#### Layer 2: 実行可能性検証（コンテンツ・整合性確認）

Layer 2 は「ファイルの内容が仕様を満たすか」というコンテンツレベルの検証を担う。

| チェック ID | 検証対象                              | 合否基準                                           | severity |
| ----------- | ------------------------------------- | -------------------------------------------------- | -------- |
| L2-001      | SKILL.md H1 見出し確認                | `# スキル名` 形式の H1 が存在する                  | error    |
| L2-002      | SKILL.md `## 概要` セクション確認     | `## 概要` セクションが存在する                     | error    |
| L2-003      | SKILL.md `## Trigger` セクション確認  | `## Trigger` セクションが存在する                  | error    |
| L2-004      | SKILL.md `## Anchors` セクション確認  | `## Anchors` セクションが存在する                  | warning  |
| L2-005      | agent スペックファイル H1 確認        | 各 `.md` ファイルに H1 見出しが存在する            | error    |
| L2-006      | agent スペックファイル `## 責務` 確認 | 各 `.md` ファイルに `## 責務` セクションが存在する | warning  |
| L2-007      | output-schema.json の JSON 妥当性確認 | 存在する場合、有効な JSON としてパースできる       | error    |

## 参照資料

| 資料名                   | パス                                                                                    | 説明                       |
| ------------------------ | --------------------------------------------------------------------------------------- | -------------------------- |
| Issue #1886              | GitHub Issue                                                                            | 元のタスク指示書           |
| P0是正パック             | `docs/30-workflows/skill-creator-agent-sdk-lane/p0-verify-manifest-remediation-pack.md` | 15タスクの是正パック全体像 |
| Verify契約・Check ID体系 | `.claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md` | Layer 1-4 check ID 仕様    |
| アーキテクチャ概要       | `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`       | Facade 3層構成             |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                 | パス                                                                                    | 内容                                   |
| ------------------------ | --------------------------------------------------------------------------------------- | -------------------------------------- |
| Verify契約・Check ID体系 | `.claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md` | Layer 1-4 check ID 定義、severity 仕様 |
| アーキテクチャ概要       | `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`       | RuntimeSkillCreatorFacade 3層構成      |

## 統合テスト連携

本タスクはバックエンド Main Process の実装であり、UI 変更を伴わない。統合テスト連携の観点:

| テスト観点                | 内容                                                                |
| ------------------------- | ------------------------------------------------------------------- |
| verify 結果のデータフロー | `SkillCreatorVerificationEngine.verify()` → Facade → WorkflowEngine |
| 型契約の整合性            | `RuntimeSkillCreatorVerifyCheck[]` が P0-02 で消費可能な形式        |
| エラーハンドリング        | Layer 1 エラー時の Layer 2 出力制御動作                             |

## 成果物

| 成果物           | パス                                      | 説明               |
| ---------------- | ----------------------------------------- | ------------------ |
| 調査結果レポート | `outputs/phase-1/investigation-report.md` | 既存実装の調査結果 |
| 要件定義書       | `outputs/phase-1/requirements.md`         | FR/NFR/AC の一覧   |

## 完了条件

- [ ] 既存 verify 実装の調査が完了している
- [ ] `RuntimeSkillCreatorVerifyCheck` 型の現状（定義済み/新規必要）が明確になっている
- [ ] `RuntimeSkillCreatorFacade.verifySkill()` の統合ポイントが確認されている
- [ ] Layer 1 / Layer 2 の全チェック項目が確定している
- [ ] 受け入れ基準（AC-1〜AC-10）が定義されている
- [ ] FR/NFR が分類・優先度付けされている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 2: 設計
