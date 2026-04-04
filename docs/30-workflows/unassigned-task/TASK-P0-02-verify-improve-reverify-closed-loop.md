# verify→improve→re-verify 閉ループの修復 - タスク指示書

## メタ情報

```yaml
issue_number: 1890
task_id: TASK-P0-02
task_name: verify→improve→re-verify 閉ループの修復
priority: 高
scale: 大規模
status: 未実施
```

| 項目         | 内容                                                            |
| ------------ | --------------------------------------------------------------- |
| タスクID     | TASK-P0-02                                                      |
| タスク名     | verify→improve→re-verify 閉ループの修復                         |
| 分類         | バグ修正・新機能（Spec P0系）                                   |
| 対象機能     | Skill Creator Agent SDK Lane - verify/improve閉ループ           |
| 優先度       | 高                                                              |
| 見積もり規模 | 大規模（L: 20〜40ファイル変更）                                 |
| ステータス   | 未実施                                                          |
| 発見元       | P0是正パック（3並列分析エージェントが収束した課題）             |
| 発見日       | 2026-04-04                                                      |
| Step         | 10（P0-01後に直列実行）                                         |
| 依存タスク   | **TASK-P0-01**（verify実行エンジン）— P0-01完了後に着手すること |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SDK-01〜08 で Skill Creator Agent SDK Lane の基本実行レーンは構築済みである。TASK-P0-01 により verify エンジン（`SkillCreatorVerificationEngine`）が整備されたが、**verify が失敗した後に improve → re-verify へと遷移する閉ループが壊れた状態にある**。

`SkillCreatorWorkflowEngine` には `recordVerifyPass()` / `recordVerifyFail()` メソッドのシグネチャが存在するものの、実装が不完全であり phase 遷移が正しく行われない。その結果、verify で問題が検出されてもスキルが改善されないまま次のフェーズに進んでしまう。

3 並列分析エージェントが独立して同一課題に収束したという事実は、この欠落がスキル品質サイクルの根本的な欠陥であることを示している。

### 1.2 問題点・課題

1. **`recordVerifyPass()` / `recordVerifyFail()` の実装不完全**: phase 遷移ロジックが実装されておらず、verify 結果がワークフロー状態に正しく反映されない。
2. **最大反復回数（max_iterations）ガード処理の不在**: 閉ループが無限に繰り返す可能性があり、ループ離脱条件が定義・実装されていない。
3. **improve フェーズ用指示生成ロジックの未実装**: verify で検出された失敗箇所（`RuntimeSkillCreatorVerifyCheck[]` の `severity === "error"` エントリ）を LLM へ渡すための改善指示プロンプト生成が存在しない。
4. **「改善不可能」判定基準の欠如**: max_iterations を超えた場合や、同一 error が繰り返し検出される場合に閉ループを中断する判定基準と状態遷移が未定義。

### 1.3 放置した場合の影響

| 影響領域       | 影響                                                                                                           |
| -------------- | -------------------------------------------------------------------------------------------------------------- |
| スキル品質保証 | verify で欠陥が検出されてもスキルが改善されずに handoff フェーズへ進み、破損したスキルが配置される             |
| ユーザー体験   | 「検証→改善→再検証」の品質保証サイクルが成立せず、スキル生成品質が安定しない                                   |
| P0-01 の価値   | TASK-P0-01 で整備した verify エンジンが閉ループに繋がらず、verify 結果が活用されないまま捨てられる             |
| 後続タスク     | TASK-RT-03（結果パネル表示）が閉ループの状態遷移イベントを受け取れず、UI に正しい進捗が表示されない            |
| 運用安定性     | 無限ループ防止がないため、LLM が同じ失敗を繰り返し続けることで実行コスト・時間コストが青天井になるリスクがある |

---

## 2. 何を達成するか（What）

### 2.1 目的

`SkillCreatorWorkflowEngine` における verify→improve→re-verify の **状態機械（state machine）** を正しく実装し、verify 失敗時に improve 指示を LLM へ送信 → 再 verify → 合否判定 → 繰り返し（最大 3 回）という閉ループを確立する。

### 2.2 最終ゴール

- verify 失敗後に improve フェーズへ自動遷移し、LLM が verify 失敗箇所に基づいた改善を実施する
- re-verify が実行され、pass または max_iterations 到達まで閉ループが継続する
- max_iterations 到達時は「改善不可能」として閉ループを正常終了（エラー状態で停止）し、無限ループが発生しない
- 閉ループの全状態遷移が `SkillCreatorWorkflowEngine` の状態として正しく管理される
- 閉ループを通じた全フェーズのユニットテストが pass する

### 2.3 スコープ

#### 含むもの（実装スコープ）

- `recordVerifyPass()` / `recordVerifyFail()` の完全実装（phase 遷移ロジック）
- 閉ループの状態機械設計と `SkillCreatorWorkflowEngine` への実装
- 最大反復回数ガード（デフォルト 3 回）と「改善不可能」状態の実装
- improve フェーズ用の verify 失敗箇所抽出・LLM プロンプト生成ロジック
- 閉ループに関連するユニットテスト

#### 含まないもの（スコープ外）

| 除外事項                              | 責務先タスク |
| ------------------------------------- | ------------ |
| verify engine 本体（Layer 1/2 実装）  | P0-01        |
| UI 結果表示（verify/improve 進捗 UI） | RT-03        |
| workflow-manifest.json 配置           | P0-03        |
| Layer 3 / Layer 4 の検証ロジック      | 別途定義     |

### 2.4 成果物

| 種別       | 成果物                                                                | 配置先                                                                                       |
| ---------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 実装更新   | `recordVerifyPass()` / `recordVerifyFail()` の完全実装                | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`                       |
| 実装更新   | 閉ループ状態機械（iterate / max_iterations ガード / 改善不可能状態）  | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`                       |
| 新規実装   | improve フェーズ用プロンプト生成関数                                  | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`（または独立ファイル） |
| 実装更新   | `RuntimeSkillCreatorFacade` の閉ループ統合                            | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                        |
| 型定義追加 | 閉ループ状態・max_iterations 設定型（必要であれば）                   | `packages/shared/src/types/skillCreator.ts`                                                  |
| テスト     | 閉ループ全フェーズ（正常・失敗・max_iterations 到達）のユニットテスト | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`        |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- **TASK-P0-01 が完了していること**（必須）。`SkillCreatorVerificationEngine.verify()` が `RuntimeSkillCreatorVerifyCheck[]` を返せる状態になっていること
- `RuntimeSkillCreatorVerifyCheck` 型（`id` / `layer` / `severity` / `summary` / `evidenceSummary`）が `packages/shared` に定義済みであること
- `WorkflowEngine.recordVerifyPass()` / `recordVerifyFail()` のシグネチャが確定していること
- Node.js / TypeScript 環境が動作していること（`pnpm install` 完了済み）
- `packages/shared` のビルドが通っていること（`pnpm --filter @repo/shared build`）

### 3.2 依存タスク

| タスクID   | 関係         | 理由                                                                                              |
| ---------- | ------------ | ------------------------------------------------------------------------------------------------- |
| TASK-P0-01 | **必須先行** | verify エンジンが存在しなければ閉ループの起点が成立しない。P0-01 完了後に本タスクを開始すること   |
| TASK-RT-03 | 後続（依存） | UI 結果パネルは閉ループの状態遷移イベント（improve開始・re-verify完了等）を購読する。本タスクが先 |
| TASK-P0-03 | 独立並行     | workflow-manifest.json 配置は閉ループと独立しており、同時進行可能                                 |

### 3.3 必要な知識

#### 状態機械（state machine）とは

状態機械とは「現在の状態」と「入力（イベント）」によって「次の状態」と「実行するアクション」が決まる設計パターンである。本タスクでは以下の状態遷移を実装する。

```
[verify実行中]
  ├─ pass → [complete]（閉ループ終了・成功）
  └─ fail（iteration < max） → [improve実行中]
              └─ improve完了 → [re-verify実行中]
                    ├─ pass → [complete]（閉ループ終了・成功）
                    └─ fail（iteration < max） → [improve実行中]（繰り返し）
                    └─ fail（iteration >= max） → [unrecoverable]（閉ループ終了・失敗）
```

各状態遷移は `SkillCreatorWorkflowEngine` が管理し、呼び出し側（`RuntimeSkillCreatorFacade`）は `runVerifyImproveLoop()` のような単一エントリポイントを呼ぶだけで閉ループが完結する設計とすること。

#### improve フェーズでの LLM 指示生成

improve フェーズでは、P0-01 の verify が返した `RuntimeSkillCreatorVerifyCheck[]` のうち `severity === "error"` のエントリを抽出し、LLM へ渡す改善指示プロンプトを生成する。

プロンプトには以下の情報を含めること:

- どのチェック ID（例: `L1-001`）が失敗したか
- どの severity（error）であるか
- `summary` フィールド（人間が読める説明）の内容
- `evidenceSummary`（利用可能な場合）の内容

**重要**: プロンプトの品質がスキル改善の品質に直接影響する。「何が問題か」「何を修正すれば verify が pass するか」が LLM に明確に伝わる文章を生成すること。

#### max_iterations ガード

デフォルト 3 回（設定可能）として実装する。ループ離脱条件は以下の 2 つ:

1. verify が pass した場合（成功終了）
2. iteration が max_iterations 以上になった場合（改善不可能として失敗終了）

max_iterations はコンストラクタオプションで注入できるよう設計し、テスト時に 1 や 2 等の小さい値を指定してテストを高速化できるようにすること。

#### TASK-P0-01 との統合境界

- P0-01 の責務: `SkillCreatorVerificationEngine.verify(skillDir)` を呼び、`RuntimeSkillCreatorVerifyCheck[]` を返す
- 本タスクの責務: その結果を受け取り、`severity === "error"` があれば improve フェーズへ進む閉ループを制御する

P0-01 が定義した `recordVerifyPass()` / `recordVerifyFail()` のシグネチャを破壊してはならない。シグネチャが想定と異なる場合は、P0-01 の実装を確認してから本タスクの実装方針を調整すること。

### 3.4 推奨アプローチ

#### 原則 1: 閉ループは単一エントリポイントで制御する

`RuntimeSkillCreatorFacade` 側から閉ループを手動で繰り返すのではなく、`SkillCreatorWorkflowEngine` に `runVerifyImproveLoop(skillDir: string): Promise<VerifyImproveLoopResult>` のような単一エントリポイントを設け、内部でループを制御する。

```typescript
// 推奨パターン
class SkillCreatorWorkflowEngine {
  async runVerifyImproveLoop(
    skillDir: string,
  ): Promise<VerifyImproveLoopResult> {
    let iteration = 0;
    while (iteration < this.maxIterations) {
      const checks = await this.verificationEngine.verify(skillDir);
      const hasError = checks.some((c) => c.severity === "error");
      if (!hasError) {
        this.recordVerifyPass(checks);
        return { status: "pass", iteration, checks };
      }
      this.recordVerifyFail(checks, iteration);
      await this.runImprove(skillDir, checks);
      iteration++;
    }
    this.recordUnrecoverable(iteration);
    return { status: "unrecoverable", iteration };
  }
}
```

#### 原則 2: improve プロンプト生成は独立関数として実装する

improve 指示生成ロジックをループ制御コードに直接埋め込まず、`buildImprovePrompt(failedChecks: RuntimeSkillCreatorVerifyCheck[]): string` のようなモジュールプライベート関数として分離する。これにより、プロンプト品質の改善が状態遷移ロジックに影響しない。

#### 原則 3: P0-01 の設計を破壊しない

`recordVerifyPass()` / `recordVerifyFail()` は P0-01 で設計・実装されたシグネチャを踏襲する。追加の引数が必要な場合は optional 引数として拡張し、既存の呼び出し箇所を破壊しないこと。

---

## 4. 実行手順

### Phase 1: 現状調査（推定: 2〜3 時間）

1. `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` を読み、以下を確認する:
   - `recordVerifyPass()` / `recordVerifyFail()` の現在の実装内容（シグネチャと本体）
   - phase 遷移がどのように管理されているか（状態変数、enum 等）
   - `improve` フェーズへの遷移が定義されているかどうか
2. `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` を読み、以下を確認する:
   - `verifySkill()` メソッドが P0-01 完了後にどのように実装されているか
   - 閉ループのエントリポイントが存在するかどうか
3. `packages/shared/src/types/skillCreator.ts` を読み、以下を確認する:
   - `SkillCreatorPhase` 型（または同等の phase 定義）に `improve` / `reverify` が存在するか
   - `RuntimeSkillCreatorVerifyCheck` 型が P0-01 で正しく定義されているか
4. `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts` が存在する場合、既存テストを確認する
5. P0-01 の `SkillCreatorVerificationEngine.verify()` が返す `RuntimeSkillCreatorVerifyCheck[]` の具体的な構造を確認する

**チェックポイント**: 調査終了時点で以下が明確になっていること

- `recordVerifyPass()` / `recordVerifyFail()` に実装が存在するか（シェルのみか）
- `SkillCreatorPhase` に `improve` / `reverify` フェーズが定義されているか
- P0-01 の出力型（`RuntimeSkillCreatorVerifyCheck`）が利用可能であることを確認

### Phase 2: 状態機械設計（推定: 2〜3 時間）

1. Phase 1 の調査結果をもとに、閉ループの状態遷移図を文書化する（簡易的なコメントまたはメモで可）
2. `SkillCreatorPhase` 型（または同等）に `improve` / `reverify` / `unrecoverable` フェーズが存在しない場合、`packages/shared/src/types/skillCreator.ts` に追加する
3. `VerifyImproveLoopResult` 型（または同等の閉ループ結果型）を定義する:
   - `status: "pass" | "unrecoverable"`
   - `iteration: number`
   - `finalChecks: RuntimeSkillCreatorVerifyCheck[]`
4. max_iterations 設定を `SkillCreatorWorkflowEngine` のコンストラクタオプションとして追加する（デフォルト 3）
5. TypeScript のコンパイルが通ることを確認する: `pnpm --filter @repo/shared build`

**チェックポイント**: 状態遷移が型として定義され、コンパイルが通ること

### Phase 3: 閉ループ実装（推定: 4〜6 時間）

1. `SkillCreatorWorkflowEngine` に `runVerifyImproveLoop(skillDir: string): Promise<VerifyImproveLoopResult>` を実装する
   - `while (iteration < this.maxIterations)` ループで verify → fail 判定 → improve の流れを制御する
   - verify pass 時は即座にループを抜けて `{ status: "pass", ... }` を返す
2. `recordVerifyPass(checks: RuntimeSkillCreatorVerifyCheck[])` を完全実装する:
   - phase を `complete`（または `pass`）に遷移させる
   - verify 結果を状態に保持する（RT-03 が購読できるように）
3. `recordVerifyFail(checks: RuntimeSkillCreatorVerifyCheck[], iteration: number)` を完全実装する:
   - phase を `improve` に遷移させる
   - 失敗チェック結果を状態に保持する
   - iteration カウンタを更新する
4. `recordUnrecoverable(iteration: number)` を実装する（未定義の場合）:
   - phase を `unrecoverable` に遷移させる
   - 最終的な失敗状態を記録する
5. TypeScript のコンパイルが通ることを確認する: `pnpm --filter @repo/desktop typecheck`

### Phase 4: ガード処理実装（推定: 2〜3 時間）

1. max_iterations ガードの動作を確認する:
   - `iteration >= this.maxIterations` の条件でループが正しく抜けること
   - ループ抜け後に `recordUnrecoverable()` が呼ばれること
   - 無限ループが発生しないことをユニットテストで確認する
2. 「同一エラー繰り返し」の早期打ち切り（オプション）:
   - 前回の verify 失敗チェックと今回の verify 失敗チェックが完全一致する場合、improve が効果なしと判定して max_iterations を待たずにループを打ち切る実装を検討する（実装コストが高い場合はこのステップをスキップし、備考に記録する）
3. ガード処理のユニットテストを作成する:
   - max_iterations = 1 で設定し、1 回の verify 失敗後にループが終了することを確認する
   - max_iterations = 3 で設定し、3 回の verify 失敗後にループが終了することを確認する

### Phase 5: improve 指示生成実装（推定: 3〜4 時間）

1. `buildImprovePrompt(failedChecks: RuntimeSkillCreatorVerifyCheck[]): string` をモジュールプライベート関数として実装する:
   - `failedChecks.filter(c => c.severity === "error")` で error のみ抽出する
   - 各チェックの `id` / `summary` / `evidenceSummary` を含むプロンプト文字列を生成する
   - プロンプトの基本構造: 「以下のverify検証で以下の問題が検出されました。各問題を修正してSKILL.mdおよびagents/配下のファイルを更新してください。」+ 各チェックの詳細
2. `runImprove(skillDir: string, failedChecks: RuntimeSkillCreatorVerifyCheck[]): Promise<void>` を実装する:
   - `buildImprovePrompt(failedChecks)` でプロンプトを生成する
   - LLM アダプタ（`RuntimeSkillCreatorFacade` 経由または直接）へプロンプトを送信する
   - improve の実行結果（LLM 応答）を受け取り、スキルファイルに反映する（既存の improve フェーズ実装がある場合はそれを参照する）
3. improve プロンプトのユニットテスト:
   - `buildImprovePrompt` に対して、L1-001 / L2-003 等の失敗チェックを渡し、期待する文字列パターンを含むプロンプトが生成されることを確認する

**注意事項**: `runImprove` の LLM 呼び出し部分は既存の execute フェーズ実装（`RuntimeSkillCreatorFacade` の skill 生成ロジック）を参照し、同じ LLM アダプタパターンを踏襲すること。新たな LLM 呼び出しインターフェースを独自定義してはならない。

### Phase 6: テスト（推定: 4〜5 時間）

1. `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts` にテストを実装する
2. テスト用に `SkillCreatorVerificationEngine` をモックし、`verify()` が返す `RuntimeSkillCreatorVerifyCheck[]` を制御可能にする
3. 以下のテストケースを実装する:

   | #   | テストケース                            | verify の戻り値                | 期待する結果                                        |
   | --- | --------------------------------------- | ------------------------------ | --------------------------------------------------- |
   | 1   | 初回verify pass                         | error 0件                      | status: "pass"、iteration: 0、improve未実行         |
   | 2   | 1回失敗→改善→2回目pass                  | 1回目: error有、2回目: error無 | status: "pass"、iteration: 1、improve 1回実行       |
   | 3   | max_iterations=1で失敗→unrecoverable    | 常にerror有                    | status: "unrecoverable"、iteration: 1               |
   | 4   | max_iterations=3で3回失敗→unrecoverable | 常にerror有                    | status: "unrecoverable"、iteration: 3               |
   | 5   | recordVerifyPass のphase遷移            | error 0件                      | WorkflowEngineのphaseが complete に遷移する         |
   | 6   | recordVerifyFail のphase遷移            | error有                        | WorkflowEngineのphaseが improve に遷移する          |
   | 7   | improve プロンプトにerrorが含まれる     | L1-001 error                   | buildImprovePrompt の出力に "L1-001" が含まれる     |
   | 8   | warningのみはverify pass扱い            | warning有、error無             | status: "pass"（warning は improve トリガーでない） |

4. テスト実行: `pnpm --filter @repo/desktop test -- SkillCreatorWorkflowEngine`
5. すべてのテストが pass することを確認する

### Phase 7: 完了（推定: 1〜2 時間）

1. TypeScript 型チェックが通ることを最終確認する: `pnpm --filter @repo/desktop typecheck`
2. ESLint が通ることを確認する: `pnpm --filter @repo/desktop lint`
3. 関連するテストがすべて pass することを確認する: `pnpm --filter @repo/desktop test`
4. 変更ファイルの一覧を確認し、スコープ外の変更（P0-01 の verify エンジン本体、RT-03 の UI 等）が含まれていないことをチェックする
5. コミットを作成する（`--no-verify` 禁止）

---

## 5. 完了条件チェックリスト

### 実装

- [ ] `SkillCreatorWorkflowEngine.recordVerifyPass(checks)` が完全実装されており、phase が `complete` に遷移する
- [ ] `SkillCreatorWorkflowEngine.recordVerifyFail(checks, iteration)` が完全実装されており、phase が `improve` に遷移する
- [ ] `SkillCreatorWorkflowEngine.runVerifyImproveLoop(skillDir)` が実装されており、閉ループ全体を制御する
- [ ] max_iterations ガードが実装されており、デフォルト 3 回でループが終了する
- [ ] `buildImprovePrompt(failedChecks)` が実装されており、verify 失敗箇所を含む改善指示を生成する
- [ ] `recordUnrecoverable()` が実装されており、max_iterations 到達時に phase が `unrecoverable` に遷移する

### 型定義

- [ ] `VerifyImproveLoopResult`（または同等）型が定義されており、`status` / `iteration` / `finalChecks` を含む
- [ ] `SkillCreatorPhase` に `improve` / `reverify` / `unrecoverable` が含まれている
- [ ] 追加した型が `packages/shared/src/types/index.ts` から export されている

### 統合

- [ ] `RuntimeSkillCreatorFacade` から `runVerifyImproveLoop()` が呼ばれる経路が接続されている
- [ ] `SkillCreatorVerificationEngine`（P0-01）が `runVerifyImproveLoop` 内で透過的に呼び出されている
- [ ] improve フェーズでの LLM 呼び出しが既存の LLM アダプタパターンを踏襲している

### テスト

- [ ] `__tests__/SkillCreatorWorkflowEngine.test.ts` が存在し、閉ループの全パターン（pass / fail / unrecoverable）のテストが書かれている
- [ ] verify pass テスト（正常終了）が pass する
- [ ] 1回失敗→改善→pass テストが pass する
- [ ] max_iterations 到達 → unrecoverable テストが pass する
- [ ] `buildImprovePrompt` のプロンプト内容テストが pass する
- [ ] `pnpm --filter @repo/desktop test` がすべて pass する

### 品質

- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] `pnpm --filter @repo/desktop lint` がエラーなし
- [ ] `any` 型の使用がない（strict 型定義を維持）
- [ ] P0-01 で定義した `recordVerifyPass()` / `recordVerifyFail()` のシグネチャを破壊していない

---

## 6. 検証方法

### 手動検証手順

```bash
# 1. TypeScript 型チェック
pnpm --filter @repo/desktop typecheck

# 2. WorkflowEngine 単体テスト実行
pnpm --filter @repo/desktop test -- SkillCreatorWorkflowEngine

# 3. Facade 統合テスト実行（存在する場合）
pnpm --filter @repo/desktop test -- RuntimeSkillCreatorFacade

# 4. ESLint チェック
pnpm --filter @repo/desktop lint

# 5. 全テスト実行
pnpm --filter @repo/desktop test
```

### テストケース一覧

| #   | テストケース                               | 入力条件                     | 期待結果                                                 |
| --- | ------------------------------------------ | ---------------------------- | -------------------------------------------------------- |
| 1   | 初回 verify pass                           | verify が error 0件を返す    | status: "pass"、iteration: 0、improve 未実行             |
| 2   | 1回失敗→改善→2回目 pass                    | 1回目 error有、2回目 error無 | status: "pass"、iteration: 1、improve 1回実行            |
| 3   | max_iterations=1 で失敗 → unrecoverable    | 常に error有（max=1）        | status: "unrecoverable"、iteration: 1                    |
| 4   | max_iterations=3 で3回失敗 → unrecoverable | 常に error有（max=3）        | status: "unrecoverable"、iteration: 3                    |
| 5   | recordVerifyPass の phase 遷移             | error 0件                    | phase が complete に遷移する                             |
| 6   | recordVerifyFail の phase 遷移             | error有                      | phase が improve に遷移する                              |
| 7   | recordUnrecoverable の phase 遷移          | max_iterations 到達          | phase が unrecoverable に遷移する                        |
| 8   | improve プロンプトに error 情報が含まれる  | L1-001 error（summary付き）  | buildImprovePrompt 出力に "L1-001" と summary が含まれる |
| 9   | warning のみは improve トリガーでない      | warning有、error無           | status: "pass"（improve 未実行）                         |
| 10  | improve 後に verify が再実行される         | 1回目 error有、2回目 pass    | verificationEngine.verify が 2回呼ばれる                 |

---

## 7. リスクと対策

| リスク                                                                                  | 影響度 | 発生確率 | 対策                                                                                                                                                       |
| --------------------------------------------------------------------------------------- | ------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0-01 の `recordVerifyPass()` / `recordVerifyFail()` シグネチャが想定と異なる           | 高     | 中       | Phase 1 の調査で P0-01 の実装を確認し、シグネチャが異なる場合は本タスクの設計を調整する。P0-01 の実装を破壊してはならない                                  |
| improve フェーズの LLM 呼び出しパターンが既存実装と乖離する                             | 高     | 中       | Phase 5 で既存の execute フェーズの LLM 呼び出しパターンを調査し、同じインターフェースを踏襲する。独自 LLM 呼び出しを実装しない                            |
| max_iterations の値が小さすぎて品質改善が不十分になる                                   | 中     | 低       | デフォルト 3 回を仕様として確定し、コンストラクタオプションで上書き可能にする。テストでは 1〜2 を使用して高速化する                                        |
| 閉ループ中の無限ループ（max_iterations 未実装の場合）                                   | 高     | 低       | Phase 4 のガード処理テストで必ず無限ループが発生しないことを確認する。`while` ループの条件式を最初に実装し、後から condition を追加しない                  |
| improve 後の re-verify でスキルファイルが更新されていない                               | 中     | 中       | `runImprove` の実行後、`skillDir` 配下のファイルが実際に変更されることをテストで確認する。LLM 応答をファイルに書き込む処理が正しく実装されているか確認する |
| `buildImprovePrompt` のプロンプト品質が低くて改善が機能しない                           | 中     | 中       | Phase 5 でプロンプトのテストを書き、チェック ID・summary・evidenceSummary が含まれることを確認する。プロンプト品質の改善は将来の iterative な作業とする    |
| P0-01 設計の前提（`verify()` が `RuntimeSkillCreatorVerifyCheck[]` を返す）が成立しない | 高     | 低       | P0-01 完了を必須先行条件とし、P0-01 の出力型が `RuntimeSkillCreatorVerifyCheck[]` であることを Phase 1 で確認してから着手する                              |
| `SkillCreatorPhase` 型の追加が他コンポーネントのコンパイルエラーを引き起こす            | 中     | 中       | Phase 2 で型追加後すぐに `pnpm --filter @repo/shared build` を実行し、downstream の影響を早期に検出する                                                    |

---

## 8. 参照情報

### 苦戦箇所の詳説

#### 苦戦箇所 1: 状態機械設計の複雑さ

verify→improve→re-verify 閉ループは「状態機械」として設計する必要がある。状態機械を使わず、呼び出し元（`RuntimeSkillCreatorFacade`）でループを制御しようとすると、phase 遷移の管理が分散して一貫性が失われやすい。

推奨設計:

- `SkillCreatorWorkflowEngine` が状態（current phase、iteration count、verify 結果）を保持する
- `runVerifyImproveLoop()` という単一のエントリポイントを持ち、内部でループを完結させる
- 呼び出し側は `runVerifyImproveLoop()` の戻り値（`VerifyImproveLoopResult`）のみを参照し、内部状態に直接アクセスしない

誤った設計（呼び出し側でループを制御）は避けること:

```typescript
// NG: 呼び出し側でループを制御
while (iteration < max) {
  const result = await facade.verifySkill(skillDir);
  if (result.passed) break;
  await facade.improveSkill(skillDir, result.checks);
  iteration++;
}
```

```typescript
// OK: WorkflowEngine 内でループを制御
const result = await engine.runVerifyImproveLoop(skillDir);
```

#### 苦戦箇所 2: 無限ループ防止と「改善不可能」判定基準

max_iterations を while ループの条件として最初から組み込むことが重要である。後から条件を追加しようとすると、ループ制御の整合性が崩れやすい。

「改善不可能」の判定基準は以下の 2 つを採用する:

1. **iteration が max_iterations に達した場合**（必須実装）
2. **連続する 2 回の verify で同一のエラーセットが検出された場合**（オプション実装。実装コストが高い場合はスキップし、備考に記録する）

判定基準 2 の実装判断: 前回の `failedChecks` の `id` 集合と今回の `failedChecks` の `id` 集合が完全一致する場合に「改善不可能」と判定する。Set を使った差分比較で実装できる。

#### 苦戦箇所 3: improve 指示プロンプトの品質

improve フェーズで LLM に渡すプロンプトの品質が、スキル改善の品質に直接影響する。

プロンプトに含める必須情報:

- 失敗したチェックの `id`（例: `L1-001`、`L2-003`）
- 各チェックの `summary`（人間が読める説明、英語）
- `evidenceSummary` が存在する場合はその内容（ファイルパス、件数等）
- 改善後に re-verify が実行される旨の説明（LLM が改善の目的を理解できるように）

プロンプトの推奨構造:

```
以下のスキル検証で問題が検出されました。各問題を修正し、スキルファイルを更新してください。
修正後、再度検証を実施します。

検出された問題:
- [L1-001] SKILL.md が存在しません。(evidenceSummary: path = .claude/skills/my-skill/SKILL.md)
- [L2-003] SKILL.md に `## Trigger` セクションがありません。

修正方針:
各問題の原因を特定し、対応するファイルを作成または更新してください。
```

#### 苦戦箇所 4: TASK-P0-01 との統合（設計を破壊しない）

P0-01 が定義した以下の API を破壊してはならない:

- `SkillCreatorVerificationEngine.verify(skillDir: string): Promise<RuntimeSkillCreatorVerifyCheck[]>`
- `RuntimeSkillCreatorFacade.verifySkill(skillDir: string)` の呼び出しシグネチャ
- `recordVerifyPass()` / `recordVerifyFail()` の既存シグネチャ

これらのシグネチャに引数を追加する場合は必ず optional 引数（`?:` または `= defaultValue`）として追加し、既存の呼び出しコードが壊れないことを確認すること。

### ソースコード参照先

- `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` — 閉ループ実装の主要対象。`recordVerifyPass()` / `recordVerifyFail()` のシグネチャ確認
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` — 閉ループのエントリポイント統合先
- `packages/shared/src/types/skillCreator.ts` — `SkillCreatorPhase` / `SkillCreatorVerifyResult` / `RuntimeSkillCreatorVerifyCheck` の型定義
- `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts` — テストファイル（既存テストを確認してから追加する）

### 関連タスク

| タスクID   | 関係         | 内容                                                                      |
| ---------- | ------------ | ------------------------------------------------------------------------- |
| TASK-P0-01 | 必須先行     | verify エンジン実装。本タスクは P0-01 の出力型と API を前提とする         |
| TASK-P0-03 | 独立並行     | workflow-manifest.json 本番配置。閉ループとは独立                         |
| TASK-RT-03 | 後続（依存） | スキル生成結果の詳細表示パネル。閉ループの状態遷移イベントを購読する      |
| TASK-RT-01 | 推奨先行     | LLM アダプタのエラー伝播整備。improve フェーズの LLM 呼び出し安定性に貢献 |

### 参照仕様書

- `docs/30-workflows/skill-creator-agent-sdk-lane/p0-verify-manifest-remediation-pack.md` — P0 是正パック全体の概要と実行順
- `docs/30-workflows/skill-creator-agent-sdk-lane/index.md` — skill-creator-agent-sdk-lane の全タスク一覧
- `docs/30-workflows/unassigned-task/TASK-P0-01-verify-execution-engine-layer12.md` — 先行タスク（P0-01）の設計詳細

---

## 9. 備考

### 注意事項

- `--no-verify` オプションを使ったコミットは禁止。テストが失敗する場合は `.skip` を使用し、Issue を作成すること。
- `any` 型の使用は禁止。`unknown` を使用したうえで型ガードを実装すること。
- P0-01 が完了していない状態で本タスクを開始しないこと。P0-01 の `SkillCreatorVerificationEngine.verify()` が存在しない場合、閉ループの起点が成立しない。
- improve フェーズの LLM 呼び出しは既存パターンを踏襲すること。新規 LLM インターフェースを独自定義しない。

### 実装完了後の次ステップ

1. TASK-RT-03（スキル生成結果パネル）に閉ループの状態遷移イベント（improve 開始・re-verify 完了・unrecoverable）を共有し、UI 表示仕様を確定させる。
2. `task-imp-layer12-spec-definition-004`（check ID 体系の仕様書追記）を実施し、将来の Layer 3/4 実装との連携を準備する。
3. 閉ループの反復回数（max_iterations）の設定が UI から変更可能になることを検討し、TASK-RT-04（API キー管理 UI）の設定項目として提案する。

### 中学生レベルの概念説明

**「閉ループ（closed loop）」とは何か?**

「閉ループ」とは「結果をみてやり直す繰り返し」のことです。

たとえば、作文を書いて先生に見てもらったら赤字で直しを指摘されて、直してから再び提出して、OKが出るまで繰り返す、というイメージです。

このタスクでは、スキルファイルを verify（検査）して問題があれば improve（改善）して、もう一度 verify（再検査）する、という繰り返しを実装します。何度やっても直らない場合は「改善不可能」として諦める（ループを終わらせる）ルールも必要です（最大 3 回）。

**「状態機械（state machine）」とは何か?**

「状態機械」とは「今どの段階にいるか」を常に記録しながら、決められたルールで次の段階に進む仕組みです。

信号機に例えると: 「青→黄→赤→青→...」という順番で変わり、「青の次は必ず黄」「赤の次は必ず青」というルールで動いています。途中で「いきなり赤から黄」にはなりません。

このタスクでは「verify中」→「improve中」→「re-verify中」→「完了（またはunrecoverable）」という順番で状態が変わるように設計します。状態を管理することで、「今どの段階か」が常に明確になり、バグが起きにくくなります。
