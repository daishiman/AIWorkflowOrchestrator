# Phase 5: 実装（TDD: Green）- TASK-P0-01 verify 実行エンジン（Layer 1/2 コア + Layer 3/4 互換）

## メタ情報

| 項目      | 内容                                                   |
| --------- | ------------------------------------------------------ |
| Phase     | 5                                                      |
| Phase名   | 実装（TDD: Green）                                     |
| カテゴリ  | 実装                                                   |
| 機能名    | step-09-par-task-p0-01-verify-execution-engine-layer12 |
| 作成日    | 2026-04-04                                             |
| 前提Phase | Phase 4                                                |
| 後続Phase | Phase 6                                                |

## 目的

Phase 4 で作成した 15 件のテストを全て PASS させる実装を行う。実装後に `pnpm --filter @repo/desktop test` が Green になることを確認する。current facts では Layer 3/4 が既に存在するため、Layer 1/2 コアを実装しつつ 4-layer 互換を維持する。

## 実行タスク

### タスク1: 型定義の確認・同期（packages/shared）

**目的**: `RuntimeSkillCreatorVerifyCheck` / `RuntimeSkillCreatorVerifyCheckSeverity` 型を current facts と同期する

**修正ファイル**: `packages/shared/src/types/skillCreator.ts`

**同期内容**:

```typescript
// severity の3段階
export type RuntimeSkillCreatorVerifyCheckSeverity =
  | "info"
  | "warning"
  | "error";

// 個々の検証チェック結果
export interface RuntimeSkillCreatorVerifyCheck {
  id: string; // "L1-001" 等
  layer: "layer1" | "layer2" | "layer3" | "layer4"; // レイヤー識別子
  severity: RuntimeSkillCreatorVerifyCheckSeverity; // 重要度
  summary: string; // 説明文（英語）
  evidenceSummary?: string; // 補足情報（optional）
}
```

**注意事項**:

- 既存の `SkillCreatorVerifyResult` 型と混在しないよう、責務を明確に分離する
- `any` 型の使用禁止

**修正ファイル**: `packages/shared/src/types/index.ts`

- `RuntimeSkillCreatorVerifyCheck` および `RuntimeSkillCreatorVerifyCheckSeverity` の public export が維持されていることを確認する

### タスク2: SkillCreatorVerificationEngine の新規実装

**目的**: Layer 1 / Layer 2 の検証ロジックを独立クラスとして実装する

**新規作成ファイル**: `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`

**実装手順**:

1. **モジュールプライベートなヘルパー関数を実装する**

   | 関数名                                                                                 | 役割                                           |
   | -------------------------------------------------------------------------------------- | ---------------------------------------------- |
   | `fileExists(p: string): Promise<boolean>`                                              | `fs.stat()` でファイル存在を確認する           |
   | `directoryExists(p: string): Promise<boolean>`                                         | `fs.stat()` でディレクトリ存在を確認する       |
   | `readFileContent(p: string): Promise<string \| null>`                                  | ファイル内容を読み込む。失敗時は `null` を返す |
   | `hasH1Heading(content: string): boolean`                                               | `# ` で始まる行が存在するか判定する            |
   | `hasMarkdownSection(content: string, heading: string): boolean`                        | 指定見出しセクションが存在するか判定する       |
   | `createCheck(id, layer, severity, summary, evidence?): RuntimeSkillCreatorVerifyCheck` | チェック結果オブジェクトを生成するファクトリ   |

2. **`validateLayer1(skillDir: string)` を実装する**

   Layer 1 は `fs.stat()` のみを使用し、ファイル内容を読まない。

   | チェック ID | 実装内容                                                           |
   | ----------- | ------------------------------------------------------------------ |
   | L1-001      | `fileExists(path.join(skillDir, "SKILL.md"))` を確認する           |
   | L1-002      | `directoryExists(path.join(skillDir, "agents"))` を確認する        |
   | L1-003      | `agents/` 配下のファイル件数が 1 以上であることを確認する          |
   | L1-004      | `directoryExists(path.join(skillDir, "references"))` を確認する    |
   | L1-005      | `fileExists(path.join(skillDir, "output-schema.json"))` を確認する |

3. **`validateLayer2(skillDir: string)` を実装する**

   Layer 2 は対象リソースを直接確認し、読めない場合は error 明示、対象が存在しない場合はチェックを発行しない。

   | チェック ID | 出力条件                             | 実装内容                                                            |
   | ----------- | ------------------------------------ | ------------------------------------------------------------------- |
   | L2-001      | SKILL.md が読める場合                | SKILL.md に H1 見出しが存在するか確認する                           |
   | L2-002      | SKILL.md が読める場合                | SKILL.md に `## 概要` セクションが存在するか確認する                |
   | L2-003      | SKILL.md が読める場合                | SKILL.md に `## Trigger` セクションが存在するか確認する             |
   | L2-004      | SKILL.md が読めない場合は error 明示 | SKILL.md に `## Anchors` セクションが存在するか確認する             |
   | L2-005      | agents/\*.md が存在する場合          | 各 agents/\*.md ファイルに H1 見出しが存在するか確認する            |
   | L2-006      | agents/\*.md が存在する場合          | 各 agents/\*.md ファイルに `## 責務` セクションが存在するか確認する |
   | L2-007      | output-schema.json が存在する場合    | `output-schema.json` が有効な JSON としてパースできるか確認する     |

4. **`verify(skillDir: string)` メソッドを実装する**

   ```
   verify(skillDir)
     1. validateLayer1(skillDir) を実行し layer1Checks を取得する
     2. validateLayer2(skillDir, layer1Checks) を実行し layer2Checks を取得する
     3. [...layer1Checks, ...layer2Checks] を返す
   ```

### タスク3: RuntimeSkillCreatorFacade への統合

**目的**: `RuntimeSkillCreatorFacade.verifySkill()` から `SkillCreatorVerificationEngine.verify()` を透過的に呼び出す

**修正ファイル**: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

**統合手順**:

1. `deps` インターフェースに `verificationEngine?: SkillCreatorVerificationEngine` を追加する（既存シグネチャ非破壊）
2. `verifySkill(skillDir: string)` メソッド内では `this.verificationEngine?.verify(skillDir) ?? []` を使って checks 配列のみを返す:

   ```
   const checks = await this.verificationEngine?.verify(skillDir) ?? [];
   return checks;
   ```

3. `verifyAndImproveLoop(...)` 側で `checks` を評価し、`WorkflowEngine.recordVerifyPass()` / `recordVerifyFailure()` を呼び分ける

4. `verificationEngine` が未注入の場合は空配列を返す（graceful degradation）

### タスク4: VerificationEngine の注入設定

**目的**: 初期化箇所で `SkillCreatorVerificationEngine` のインスタンスを生成して Facade に注入する

**修正ファイル**: `SkillCreatorIpcBridge.ts` 等の初期化箇所

**手順**:

1. `new SkillCreatorVerificationEngine()` を生成する
2. `RuntimeSkillCreatorFacade` の `deps` に `verificationEngine` として渡す

### タスク5: Green 確認

**目的**: 全 15 件の core テストが PASS することを確認する

**手順**:

1. `pnpm --filter @repo/desktop test -- SkillCreatorVerificationEngine` を実行する
2. 15 件の core テストが PASS することを確認する
3. 型チェックを実行する: `pnpm --filter @repo/desktop typecheck`
4. Lint を実行する: `pnpm lint`

## 参照資料

| 資料名               | パス                                                                                      | 説明                     |
| -------------------- | ----------------------------------------------------------------------------------------- | ------------------------ |
| Phase 4 テスト       | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts` | Green にする対象テスト   |
| Phase 2 設計書       | `outputs/phase-2/design.md`                                                               | クラス設計・型設計の詳細 |
| Phase 3 レビュー結果 | `outputs/phase-3/design-review-result.md`                                                 | 実装前の最終確認事項     |
| Verify契約仕様       | `.claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md`   | Check ID 体系            |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                 | パス                                                                                    | 内容                                |
| ------------------------ | --------------------------------------------------------------------------------------- | ----------------------------------- |
| Verify契約・Check ID体系 | `.claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md` | L1-001〜L4-003 の severity 仕様     |
| アーキテクチャ概要       | `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`       | Facade / Engine / Bridge の責務分離 |

## 統合テスト連携

| テスト観点           | 内容                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------ |
| T-FAC-01/02 の Green | `verifySkill()` が check 配列を返し、`verifyAndImproveLoop()` が WorkflowEngine に正しくルーティングすること |
| 型契約の整合性       | `RuntimeSkillCreatorVerifyCheck[]` が P0-02 で消費可能な形式であること                                       |
| graceful degradation | verificationEngine 未注入時に空配列が返り、エラーが発生しないこと                                            |

## 成果物

| 成果物                  | パス                                                                       | 説明                                                            |
| ----------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------- |
| VerificationEngine 実装 | `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts` | Layer 1/2 コア検証ロジック、4-layer 互換維持                    |
| 型定義同期              | `packages/shared/src/types/skillCreator.ts`                                | RuntimeSkillCreatorVerifyCheck 型                               |
| index.ts export 確認    | `packages/shared/src/types/index.ts`                                       | 型の public export                                              |
| Facade 統合             | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`      | verifySkill() の check 返却 / verifyAndImproveLoop() の routing |
| 注入設定                | `SkillCreatorIpcBridge.ts` 等                                              | VerificationEngine 注入                                         |

## 完了条件

- [ ] `SkillCreatorVerificationEngine.ts` が新規作成されている
- [ ] `validateLayer1()` が L1-001〜L1-005 の 5 チェックを実装している
- [ ] `validateLayer2()` が L2-001〜L2-007 の 7 チェックを実装している
- [ ] `verify()` が Layer 1/2 コアの全チェック結果を結合して返し、Layer 3/4 互換を壊さない
- [ ] `RuntimeSkillCreatorVerifyCheck` / `RuntimeSkillCreatorVerifyCheckSeverity` 型と public export が `packages/shared` と整合している
- [ ] `RuntimeSkillCreatorFacade.verifySkill()` が `verificationEngine.verify()` を呼び出し、`verifyAndImproveLoop()` が pass/fail をルーティングしている
- [ ] verificationEngine 未注入時に graceful degradation（空配列返却）が動作する
- [ ] 全 15 件の core テストが PASS（Green）している
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] `pnpm lint` がエラーなし
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 6: テスト拡充
