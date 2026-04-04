# verify 実行エンジン（Layer 1/2）の新規実装 - タスク指示書

## メタ情報

```yaml
issue_number: 1886
task_id: TASK-P0-01
task_name: verify 実行エンジン（Layer 1/2）の新規実装
priority: 高
scale: 大規模
status: 未実施
```

| 項目         | 内容                                                      |
| ------------ | --------------------------------------------------------- |
| タスクID     | TASK-P0-01                                                |
| タスク名     | verify 実行エンジン（Layer 1/2）の新規実装                |
| 分類         | 新機能（Spec P0系）                                       |
| 対象機能     | Skill Creator Agent SDK Lane - verify engine              |
| 優先度       | 高                                                        |
| 見積もり規模 | 大規模（L: 20〜40ファイル変更）                           |
| ステータス   | 未実施                                                    |
| 発見元       | P0是正パック（3並列分析エージェントが収束した最重要課題） |
| 発見日       | 2026-04-04                                                |
| Step         | 09（並列実行可能）                                        |
| 依存タスク   | なし（ただしRT-01/RT-02の完了を推奨）                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SDK-01〜08 で Skill Creator Agent SDK Lane の基本実行レーンは構築済みである。しかし、スキル品質保証の核となる **verify エンジン** が実質的に未実装の状態に置かれている。

`SkillCreatorWorkflowEngine` には `verify()` フェーズへの遷移メソッド（`recordExecuteResult()` / `recordVerifyPass()` / `recordVerifyFailure()`）が存在し、`SkillCreatorVerifyResult` 型も `packages/shared/src/types/skillCreator.ts` に定義されている。しかし、**実際の検証ロジック（スキル仕様の形式検証・実行可能性検証）が実装されていない**。

3 並列分析エージェントが独立して同一の P0 課題に収束したという事実は、この欠落がスキル生成品質保証の根本的な欠陥であることを示している。

### 1.2 問題点・課題

1. **Layer 1（形式検証）の不在**: スキルディレクトリ構造（SKILL.md 存在確認、agents/ ディレクトリ存在確認、manifest 構造、必須フィールド確認）を自動検証する独立モジュールが存在しない。
2. **Layer 2（実行可能性検証）の不在**: SKILL.md コンテンツの整合性（H1 見出し、必須セクション、Trigger / 概要 / Anchors）および agents/ 配下のスペックファイル内容を検証するロジックが存在しない。
3. **閉ループの前提条件欠如**: verify→improve→re-verify 閉ループ（P0-02 の責務）は、verify エンジンが返す `VerifyResult` を前提とする。verify エンジンが存在しない限り、閉ループは動作しない。
4. **skill-fixture-runner との役割未分担**: `.claude/skills/skill-creator/` に対する決定論的検証スクリプト（skill-fixture-runner スキル）との役割分担が明確でなく、重複実装が発生しやすい状態にある。

### 1.3 放置した場合の影響

| 影響領域                         | 影響                                                                                                   |
| -------------------------------- | ------------------------------------------------------------------------------------------------------ |
| スキル品質保証                   | 生成されたスキルの品質が無検証のまま handoff フェーズに進み、破損したスキルが配置される                |
| verify→improve→reverify 閉ループ | P0-02 の閉ループが verify エンジン不在により機能しない。改善サイクルが成立しない                       |
| ユーザー体験                     | スキル生成後に「検証済み」の表示が出るにもかかわらず実際の検証が行われておらず、ユーザーの信頼を損なう |
| 後続タスク                       | TASK-P0-02（閉ループ）、TASK-RT-03（結果パネル表示）がいずれも verify エンジンの出力に依存する         |

---

## 2. 何を達成するか（What）

### 2.1 目的

スキル仕様（SKILL.md・agents/ ディレクトリ・output-schema.json 等）を Layer 1（形式検証）および Layer 2（実行可能性検証）の 2 段階で自動検証する **独立モジュール `SkillCreatorVerificationEngine`** を新規実装し、`WorkflowEngine` へ統合する。

### 2.2 最終ゴール

- `SkillCreatorVerificationEngine.verify(skillDir)` を呼ぶだけで、Layer 1 / Layer 2 の全チェックが実行され `RuntimeSkillCreatorVerifyCheck[]` が返る
- `RuntimeSkillCreatorFacade.verifySkill()` から `SkillCreatorVerificationEngine` が透過的に呼ばれる
- verify 結果（pass / fail / warning）が `SkillCreatorVerifyResult` 型にマッピングされ `WorkflowEngine` の状態に反映される
- `SkillCreatorVerificationEngine` 専用のユニットテストがすべて pass する
- verify 結果が P0-02（閉ループ）で消費できる形式になっている

### 2.3 スコープ（Layer 1 と Layer 2 の境界を明示）

#### Layer 1: 形式検証（構造・存在確認）

Layer 1 は「ファイル・ディレクトリが期待通りに存在するか」という **構造レベル** の検証を担う。ファイルの内容は読まない（存在確認のみ）。

| チェック ID | 検証対象                          | 合否基準                                               | severity |
| ----------- | --------------------------------- | ------------------------------------------------------ | -------- |
| L1-001      | SKILL.md 存在確認                 | `skillDir/SKILL.md` がファイルとして存在する           | error    |
| L1-002      | agents/ ディレクトリ存在確認      | `skillDir/agents/` がディレクトリとして存在する        | error    |
| L1-003      | agents/ に 1 件以上のファイル存在 | `agents/` 配下にファイルが 1 件以上ある                | error    |
| L1-004      | references/ ディレクトリ存在確認  | `skillDir/references/` がディレクトリとして存在する    | warning  |
| L1-005      | output-schema.json 存在確認       | `skillDir/output-schema.json` がファイルとして存在する | warning  |

Layer 1 でエラーが発生した場合、Layer 2 の対応チェックはスキップしてよい（依存関係があるため）。

#### Layer 2: 実行可能性検証（コンテンツ・整合性確認）

Layer 2 は「ファイルの内容が仕様を満たすか」という **コンテンツレベル** の検証を担う。ファイルを実際に読み込み、Markdown 構造・JSON スキーマ整合性等を確認する。

| チェック ID | 検証対象                              | 合否基準                                           | severity |
| ----------- | ------------------------------------- | -------------------------------------------------- | -------- |
| L2-001      | SKILL.md H1 見出し確認                | `# スキル名` 形式の H1 が存在する                  | error    |
| L2-002      | SKILL.md `## 概要` セクション確認     | `## 概要` セクションが存在する                     | error    |
| L2-003      | SKILL.md `## Trigger` セクション確認  | `## Trigger` セクションが存在する                  | error    |
| L2-004      | SKILL.md `## Anchors` セクション確認  | `## Anchors` セクションが存在する                  | warning  |
| L2-005      | agent スペックファイル H1 確認        | 各 `.md` ファイルに H1 見出しが存在する            | error    |
| L2-006      | agent スペックファイル `## 責務` 確認 | 各 `.md` ファイルに `## 責務` セクションが存在する | warning  |
| L2-007      | output-schema.json の JSON 妥当性確認 | 存在する場合、有効な JSON としてパースできる       | error    |

#### 含むもの（実装スコープ）

- `SkillCreatorVerificationEngine` モジュールの新規実装（`apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`）
- `RuntimeSkillCreatorVerifyCheck` / `RuntimeSkillCreatorVerifyCheckSeverity` 型定義（`packages/shared/src/types/skillCreator.ts` への追加）
- `RuntimeSkillCreatorFacade` への `SkillCreatorVerificationEngine` の統合（`verifySkill()` メソッド）
- `SkillCreatorVerificationEngine` 専用ユニットテスト（`__tests__/SkillCreatorVerificationEngine.test.ts`）

#### 含まないもの（スコープ外）

| 除外事項                            | 責務先タスク |
| ----------------------------------- | ------------ |
| verify→improve→reverify 閉ループ    | P0-02        |
| workflow-manifest.json 配置         | P0-03        |
| UI 結果パネル（Layer 検証結果表示） | RT-03        |
| Layer 3 / Layer 4 の検証ロジック    | 別途定義     |

### 2.4 成果物

| 種別       | 成果物                                                                      | 配置先                                                                                    |
| ---------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 新規実装   | `SkillCreatorVerificationEngine` クラス（Layer 1/2 実装）                   | `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`                |
| 型定義追加 | `RuntimeSkillCreatorVerifyCheck` / `RuntimeSkillCreatorVerifyCheckSeverity` | `packages/shared/src/types/skillCreator.ts`                                               |
| 統合更新   | `verifySkill()` メソッドへの `SkillCreatorVerificationEngine` 呼び出し追加  | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                     |
| テスト     | Layer 1/2 全チェックの正常系・異常系ユニットテスト                          | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Node.js / TypeScript 環境が動作していること（`pnpm install` 完了済み）
- `packages/shared` のビルドが通っていること（`pnpm --filter @repo/shared build`）
- `apps/desktop/src/main/services/runtime/` 配下の既存ファイルが読める状態であること
- `.claude/skills/` 配下にサンプルスキルディレクトリが存在すること（テスト用フィクスチャとして利用）

### 3.2 依存タスク

| タスクID   | 関係         | 理由                                                                                              |
| ---------- | ------------ | ------------------------------------------------------------------------------------------------- |
| TASK-RT-01 | 推奨先行     | LLMAdapter エラー通知が整備されていると、verify 失敗時の UX が安定する（必須ではない）            |
| TASK-RT-02 | 推奨先行     | スタブ応答エラーの整備が完了していると、verify の実行結果をより安定して確認できる（必須ではない） |
| TASK-P0-02 | 後続（依存） | 閉ループは本タスクの `VerifyResult` 型出力を前提とする。本タスクを先に完了させること              |
| TASK-RT-03 | 後続（依存） | UI 結果パネルは本タスクの `RuntimeSkillCreatorVerifyCheck[]` を消費する。本タスクが先             |

### 3.3 必要な知識

#### Layer の定義

本プロジェクトにおける「Layer」は、スキル検証の深度段階を表す概念である。

- **Layer 1**: ファイル・ディレクトリの **存在確認**。ファイルの中身は読まない。「構造が整っているか」を検証する。
- **Layer 2**: ファイルの **コンテンツ検証**。Markdown の必須セクションや JSON の妥当性を確認する。「内容が仕様を満たすか」を検証する。
- **Layer 3 / 4**: 本タスクのスコープ外。品質・整合性・参照整合性の深度検証（将来実装予定）。

Layer の番号が大きいほど検証コストが高く、Layer 1 の失敗は Layer 2 の一部チェックをスキップする根拠になる。

#### 既存エンジンとの統合方法

`RuntimeSkillCreatorFacade` には `verifySkill(skillDir: string)` メソッドが定義されており、内部で `SkillCreatorVerificationEngine`（optional 注入）を呼び出す想定になっている。コンストラクタの `options` に `verificationEngine?: SkillCreatorVerificationEngine` があることを確認したうえで実装を進めること。

統合パターンは以下の通り:

```
RuntimeSkillCreatorFacade.verifySkill(skillDir)
  └─ this.verificationEngine.verify(skillDir)
       ├─ validateLayer1(skillDir)  → RuntimeSkillCreatorVerifyCheck[]
       └─ validateLayer2(skillDir)  → RuntimeSkillCreatorVerifyCheck[]
  └─ checks を SkillCreatorVerifyResult にマッピング
  └─ WorkflowEngine.recordVerifyPass() or recordVerifyFailure()
```

#### skill-fixture-runner スキルとの役割分担

`skill-fixture-runner` スキル（`.claude/skills/skill-fixture-runner/`）は Claude Code スキルとして呼び出される **外部検証ツール** であり、開発者が手動でスキルディレクトリを検証するために使用する。

`SkillCreatorVerificationEngine` は **runtime 内部の自動検証モジュール** であり、スキル生成ワークフロー中に自動実行される。用途・呼び出し主体・実行タイミングが異なるため、コードレベルでの重複は許容される。

### 3.4 推奨アプローチ（独立モジュール設計の原則）

#### 原則 1: 独立モジュールとして設計する

`SkillCreatorVerificationEngine` は `RuntimeSkillCreatorFacade` や `SkillCreatorWorkflowEngine` に直接埋め込んではならない。必ず独立クラスとして実装し、依存性注入（コンストラクタインジェクション）で組み込むこと。

**禁止パターン（Facade 直接埋め込み）:**

```typescript
// NG: Facade 内に検証ロジックを直接記述
class RuntimeSkillCreatorFacade {
  async verifySkill(skillDir: string) {
    const skillMdPath = path.join(skillDir, "SKILL.md");
    const exists = await fs
      .stat(skillMdPath)
      .then(() => true)
      .catch(() => false);
    // ... ロジックをここに直接書く
  }
}
```

**推奨パターン（独立モジュール + 注入）:**

```typescript
// OK: 独立クラスを定義し、注入する
export class SkillCreatorVerificationEngine {
  async verify(skillDir: string): Promise<RuntimeSkillCreatorVerifyCheck[]> {
    const layer1 = await validateLayer1(skillDir);
    const layer2 = await validateLayer2(skillDir);
    return [...layer1, ...layer2];
  }
}
// Facade 側
class RuntimeSkillCreatorFacade {
  constructor(
    private readonly verificationEngine: SkillCreatorVerificationEngine,
  ) {}
}
```

#### 原則 2: Layer 関数はモジュールプライベートな純粋関数として実装する

`validateLayer1(skillDir)` と `validateLayer2(skillDir)` はクラス外部に公開せず、モジュールプライベートな非同期関数として定義する。これにより、テストはクラスの `verify()` メソッドを通じて検証する形になる。

#### 原則 3: VerifyResult 型を P0-02（閉ループ）と共有できる形で定義する

`RuntimeSkillCreatorVerifyCheck` 型には以下のフィールドを必ず含めること:

- `id`: チェック ID（例: `"L1-001"`）
- `layer`: レイヤー識別子（`"layer1" | "layer2"`）
- `severity`: 重要度（`"error" | "warning" | "info"`）
- `summary`: 人間が読める説明文（英語）
- `evidenceSummary`（optional）: 検証結果の補足情報（パス、件数等）

P0-02 は `RuntimeSkillCreatorVerifyCheck[]` を受け取り、`severity === "error"` のチェックが 1 件以上あれば improve フェーズへ進む仕様であるため、`severity` フィールドの型定義は正確に定義すること。

---

## 4. 実行手順

### Phase 1: 既存 verify 実装調査（推定: 2〜3 時間）

1. `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` を読み、`verify` フェーズへの遷移メソッド（`recordVerifyPass()` / `recordVerifyFailure()` / `recordExecuteResult()`）のシグネチャと引数を確認する
2. `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` を読み、`verifySkill()` メソッドの現在の実装（`verificationEngine` の optional 呼び出し部分）を確認する
3. `packages/shared/src/types/skillCreator.ts` を読み、`SkillCreatorVerifyResult` / `RuntimeSkillCreatorVerifyCheck` / `RuntimeSkillCreatorVerifyCheckSeverity` の既存定義を確認する
4. `.claude/skills/` 配下のスキルディレクトリ構造（SKILL.md / agents/ / references/ / output-schema.json）を実際に確認し、検証対象の実態を把握する
5. `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts` が存在する場合、既存テストの内容を確認する

**チェックポイント**: 調査終了時点で以下が明確になっていること

- `RuntimeSkillCreatorVerifyCheck` 型が shared に定義済みか、新規定義が必要か
- `RuntimeSkillCreatorFacade.verifySkill()` が `verificationEngine` を受け取る口が既に存在するか
- テストファイルが既に存在するかどうか

### Phase 2: VerifyResult 型設計（推定: 1〜2 時間）

1. Phase 1 の調査結果を踏まえ、`packages/shared/src/types/skillCreator.ts` に追加が必要な型定義を洗い出す
2. `RuntimeSkillCreatorVerifyCheckSeverity` を `"error" | "warning" | "info"` で定義する（既存の場合は確認のみ）
3. `RuntimeSkillCreatorVerifyCheck` インターフェースを定義する（`id` / `layer` / `severity` / `summary` / `evidenceSummary`）
4. 型定義の変更が `packages/shared/src/types/index.ts` の export に反映されているか確認し、必要であれば追加する
5. TypeScript コンパイルが通ることを確認する: `pnpm --filter @repo/shared build`

**チェックポイント**: `RuntimeSkillCreatorVerifyCheck` 型が import 可能になっていること

### Phase 3: Layer 1 実装（推定: 3〜4 時間）

1. `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts` を新規作成する（ファイルが存在しない場合）
2. ヘルパー関数を実装する:
   - `fileExists(p: string): Promise<boolean>` — `fs.stat` で存在確認
   - `directoryExists(p: string): Promise<boolean>` — `fs.stat` でディレクトリ確認
   - `createCheck(id, layer, severity, summary, evidenceSummary?)` — チェック結果オブジェクト生成
3. `validateLayer1(skillDir: string): Promise<RuntimeSkillCreatorVerifyCheck[]>` をモジュールプライベート関数として実装する
   - L1-001: SKILL.md 存在確認（error/info）
   - L1-002: agents/ ディレクトリ存在確認（error/info）
   - L1-003: agents/ 配下のファイル件数確認（error/info）
   - L1-004: references/ ディレクトリ存在確認（warning/info）
   - L1-005: output-schema.json 存在確認（warning/info）
4. `SkillCreatorVerificationEngine` クラスに `verify()` メソッドを実装し、`validateLayer1` を呼び出す（Layer 2 は後続 Phase で追加）
5. 基本的なユニットテストを書いて Layer 1 が動作することを確認する

### Phase 4: Layer 2 実装（推定: 4〜5 時間）

1. `SkillCreatorVerificationEngine.ts` にヘルパー関数を追加する:
   - `readFileContent(p: string): Promise<string | null>` — ファイル読み込み（失敗時は null）
   - `hasH1Heading(content: string): boolean` — `# ...` パターンの検出
   - `hasMarkdownSection(content: string, heading: string): boolean` — `## Heading` パターンの検出
2. `validateLayer2(skillDir: string): Promise<RuntimeSkillCreatorVerifyCheck[]>` をモジュールプライベート関数として実装する
   - L2-001: SKILL.md H1 見出し確認（error/info）
   - L2-002: SKILL.md `## 概要` セクション確認（error/info）
   - L2-003: SKILL.md `## Trigger` セクション確認（error/info）
   - L2-004: SKILL.md `## Anchors` セクション確認（warning/info）
   - L2-005: agents/ 配下の各 .md ファイル H1 確認（error/info、各ファイルごとにチェック生成）
   - L2-006: agents/ 配下の各 .md ファイル `## 責務` セクション確認（warning/info）
   - L2-007: output-schema.json の JSON 妥当性確認（存在する場合のみ。error/info）
3. `SkillCreatorVerificationEngine.verify()` で `validateLayer2` も呼び出すよう更新する
4. Layer 2 の追加によるテストの拡充（SKILL.md が存在するがコンテンツが不足している場合などのテストケースを追加）

**注意事項**: L2-005 / L2-006 は agents/ 配下のファイル数だけチェック結果が生成される。ファイルが 0 件の場合（L1-003 が error）、L2-005 / L2-006 はスキップするのではなく「agents/ が空」のエラーを継承した形で結果を生成しないことで対応する（L1 のエラーで十分カバーされているため）。

### Phase 5: WorkflowEngine 統合（推定: 2〜3 時間）

1. `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` の `verifySkill()` メソッドを確認し、`this.verificationEngine?.verify(skillDir)` が正しく呼び出されていることを確認する
2. `SkillCreatorVerificationEngine` のコンストラクタ注入が `RuntimeSkillCreatorFacade` の `options` 経由で行われていることを確認する（`verificationEngine?: SkillCreatorVerificationEngine`）
3. `RuntimeSkillCreatorFacade` の初期化箇所（`SkillCreatorIpcBridge.ts` 等）で `new SkillCreatorVerificationEngine()` を生成して注入する
4. `verifySkill()` の結果（`RuntimeSkillCreatorVerifyCheck[]`）が `WorkflowEngine.recordVerifyPass()` / `recordVerifyFailure()` に正しく渡されていることを確認する:
   - `severity === "error"` のチェックが 1 件でもある場合 → `recordVerifyFailure()`
   - すべてのチェックが `"info"` または `"warning"` の場合 → `recordVerifyPass()`
5. TypeScript のコンパイルエラーがないことを確認する: `pnpm --filter @repo/desktop typecheck`

### Phase 6: テスト（推定: 3〜4 時間）

1. `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts` にテストを実装する
2. テスト用フィクスチャを `os.tmpdir()` 配下に動的に生成するヘルパー関数を用意する（`createSkillFixture(baseDir, options)` パターン）
3. Layer 1 テストケース:
   - 正常系: 全ファイル・ディレクトリが揃っているスキルディレクトリで全チェック info
   - SKILL.md が存在しない場合: L1-001 が error
   - agents/ が存在しない場合: L1-002 が error
   - agents/ が空の場合: L1-003 が error
   - references/ が存在しない場合: L1-004 が warning（error でない）
   - output-schema.json が存在しない場合: L1-005 が warning（error でない）
4. Layer 2 テストケース:
   - SKILL.md に H1 なし: L2-001 が error
   - SKILL.md に `## 概要` なし: L2-002 が error
   - SKILL.md に `## Trigger` なし: L2-003 が error
   - SKILL.md に `## Anchors` なし: L2-004 が warning（error でない）
   - agents/ 配下のファイルに H1 なし: L2-005 が error
   - output-schema.json が invalid JSON: L2-007 が error
5. テスト実行: `pnpm --filter @repo/desktop test -- SkillCreatorVerificationEngine`
6. すべてのテストが pass することを確認する

### Phase 7: 完了

1. TypeScript 型チェックが通ることを最終確認する: `pnpm --filter @repo/desktop typecheck`
2. ESLint が通ることを確認する: `pnpm --filter @repo/desktop lint`
3. 関連するテストがすべて pass することを確認する: `pnpm --filter @repo/desktop test`
4. 変更ファイルの一覧を確認し、スコープ外の変更が含まれていないことをチェックする
5. コミットを作成する（`--no-verify` 禁止）

---

## 5. 完了条件チェックリスト

### 実装

- [ ] `SkillCreatorVerificationEngine` クラスが `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts` に実装されている
- [ ] `validateLayer1()` が L1-001〜L1-005 の 5 チェックを実装している
- [ ] `validateLayer2()` が L2-001〜L2-007 の 7 チェックを実装している
- [ ] `verify()` メソッドが Layer 1 / Layer 2 の全チェック結果を結合して返す
- [ ] `SkillCreatorVerificationEngine` が独立クラスとして実装されており、Facade に直接埋め込まれていない

### 型定義

- [ ] `RuntimeSkillCreatorVerifyCheckSeverity` 型が `packages/shared` に定義されている
- [ ] `RuntimeSkillCreatorVerifyCheck` インターフェースが `packages/shared` に定義されている（`id` / `layer` / `severity` / `summary` / `evidenceSummary`）
- [ ] 両型が `packages/shared/src/types/index.ts` から export されている

### 統合

- [ ] `RuntimeSkillCreatorFacade` が `SkillCreatorVerificationEngine` を constructor injection で受け取っている
- [ ] `RuntimeSkillCreatorFacade.verifySkill()` が `verificationEngine.verify()` を呼び出している
- [ ] verify 結果（error あり / error なし）が `WorkflowEngine.recordVerifyPass()` / `recordVerifyFailure()` に正しくルーティングされている
- [ ] `SkillCreatorVerificationEngine` のインスタンスが `SkillCreatorIpcBridge.ts`（または適切な初期化箇所）で生成・注入されている

### テスト

- [ ] `__tests__/SkillCreatorVerificationEngine.test.ts` が存在し、Layer 1 / 2 の全チェックに対してテストケースが書かれている
- [ ] 正常系テスト（全ファイル揃い）が pass する
- [ ] Layer 1 の各 error / warning 条件のテストが pass する
- [ ] Layer 2 の各 error / warning 条件のテストが pass する
- [ ] `pnpm --filter @repo/desktop test` がすべて pass する

### 品質

- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] `pnpm --filter @repo/desktop lint` がエラーなし
- [ ] `any` 型の使用がない（strict 型定義を維持）

---

## 6. 検証方法

### 手動検証手順

```bash
# 1. TypeScript 型チェック
pnpm --filter @repo/desktop typecheck

# 2. テスト実行
pnpm --filter @repo/desktop test -- SkillCreatorVerificationEngine

# 3. 実際のスキルディレクトリで verify を実行する（Node.js スクリプト等で確認）
# 例: .claude/skills/aiworkflow-requirements/ を対象に verify を呼び出す

# 4. ESLint チェック
pnpm --filter @repo/desktop lint

# 5. 全テスト実行
pnpm --filter @repo/desktop test
```

### テストケース一覧

| #   | テストケース                       | 入力条件                                                                              | 期待結果                                        |
| --- | ---------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------- |
| 1   | 全ファイル揃いの正常スキル         | SKILL.md（H1・全セクション） + agents/（H1・責務） + output-schema.json（valid JSON） | 全チェック info、error / warning なし           |
| 2   | SKILL.md 欠如                      | SKILL.md が存在しない                                                                 | L1-001 が error                                 |
| 3   | agents/ ディレクトリ欠如           | agents/ が存在しない                                                                  | L1-002 が error                                 |
| 4   | agents/ 空ディレクトリ             | agents/ が存在するがファイルが 0 件                                                   | L1-003 が error                                 |
| 5   | references/ 欠如                   | references/ が存在しない                                                              | L1-004 が warning（error でない）               |
| 6   | output-schema.json 欠如            | output-schema.json が存在しない                                                       | L1-005 が warning（error でない）               |
| 7   | SKILL.md に H1 なし                | SKILL.md が存在するが `# ` で始まる行がない                                           | L2-001 が error                                 |
| 8   | SKILL.md に `## 概要` なし         | H1 はあるが `## 概要` セクションがない                                                | L2-002 が error                                 |
| 9   | SKILL.md に `## Trigger` なし      | H1・概要はあるが `## Trigger` セクションがない                                        | L2-003 が error                                 |
| 10  | SKILL.md に `## Anchors` なし      | H1・概要・Trigger はあるが `## Anchors` がない                                        | L2-004 が warning（error でない）               |
| 11  | agent ファイルに H1 なし           | agents/ 配下の .md ファイルに H1 がない                                               | 該当ファイルの L2-005 が error                  |
| 12  | output-schema.json が invalid JSON | `{invalid}` 等、JSON としてパースできない内容                                         | L2-007 が error                                 |
| 13  | verify() が error を含む場合       | L1-001 が error                                                                       | WorkflowEngine.recordVerifyFailure() が呼ばれる |
| 14  | verify() が全 pass の場合          | 全チェック info / warning のみ                                                        | WorkflowEngine.recordVerifyPass() が呼ばれる    |

---

## 7. リスクと対策

| リスク                                                          | 影響度 | 発生確率 | 対策                                                                                                                                                               |
| --------------------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `RuntimeSkillCreatorVerifyCheck` 型が既に定義済みで内容が異なる | 高     | 中       | Phase 1 の調査で型定義の現状を確認し、既存定義を尊重したうえで不足フィールドのみ追加する                                                                           |
| `verificationEngine` の注入口が Facade に存在しない             | 高     | 低       | `RuntimeSkillCreatorFacade` のコンストラクタ `options` を確認し、注入口がない場合は追加する。ただし既存のコンストラクタシグネチャを破壊しないこと                  |
| Layer 1 の error が Layer 2 に伝播して二重エラーが発生する      | 中     | 中       | SKILL.md が存在しない場合は L2-001〜L2-004 のチェックをスキップする。ただし「スキップ」を明示するチェック結果（info: "skipped"）を追加するかどうかは設計判断とする |
| テスト用フィクスチャのクリーンアップ失敗でディスクが汚染される  | 低     | 中       | `afterEach` で `fs.rm(skillDir, { recursive: true, force: true })` を実行し、確実にクリーンアップする                                                              |
| skill-fixture-runner との機能重複でレビューで問題になる         | 低     | 中       | `SkillCreatorVerificationEngine` は runtime 内部の自動検証であり、`skill-fixture-runner` は開発者向け手動検証であることを PR の説明に明記する                      |
| P0-02（閉ループ）との型契約が事後的に変更される                 | 中     | 低       | P0-02 が消費する `RuntimeSkillCreatorVerifyCheck[]` の型を安定させるため、フィールド追加は非破壊的変更として optional フィールドで拡張する                         |

---

## 8. 参照情報

### 苦戦箇所の詳説

#### 苦戦箇所 1: 独立モジュール設計の原則

「Facade 直接埋め込み禁止」という設計原則は、検証ロジックのテスタビリティと将来の Layer 拡張性を維持するために設けられている。

Facade に直接書くと:

- テスト時に Facade 全体をモックしなければならず、検証ロジック単体でのテストが困難になる
- Layer 3/4 を追加する際に Facade の肥大化が起きる
- 他のコンポーネントが `SkillCreatorVerificationEngine` を直接利用できなくなる

対策: `SkillCreatorVerificationEngine` を `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts` という専用ファイルに分離し、Facade からは `verificationEngine.verify(skillDir)` の呼び出しのみにとどめること。

#### 苦戦箇所 2: Layer 1 と Layer 2 の境界定義

実装中に「SKILL.md の存在確認（L1-001）」と「SKILL.md のコンテンツ確認（L2-001〜L2-004）」の境界が曖昧になりがちである。

境界の明確な定義:

- **Layer 1 = ファイル・ディレクトリの存在確認のみ**。`fs.stat()` で存在を確認するだけで、ファイルを `fs.readFile()` で読まない。
- **Layer 2 = ファイルコンテンツの読み込みと内容確認**。`fs.readFile()` を呼び出し、中身を解析する。

この境界に従えば、Layer 1 のコードに `readFile` は一切登場しない。

#### 苦戦箇所 3: VerifyResult 型設計（P0-02 との共有）

`SkillCreatorVerifyResult`（`packages/shared/src/types/skillCreator.ts` の既存型）と `RuntimeSkillCreatorVerifyCheck[]`（本タスクで追加する型）の関係を明確にする必要がある。

- `SkillCreatorVerifyResult`: ワークフロー全体の verify フェーズの状態（`status: "pending" | "pass" | "fail"`）。WorkflowEngine が管理する。
- `RuntimeSkillCreatorVerifyCheck[]`: 個々の検証チェックの結果リスト。`SkillCreatorVerificationEngine.verify()` が返す。

P0-02 は `RuntimeSkillCreatorVerifyCheck[]` を受け取り、`severity === "error"` のチェックが存在するかを判定して improve フェーズに進む。したがって、`RuntimeSkillCreatorVerifyCheck` の `severity` フィールドは `"error" | "warning" | "info"` の三値とし、`"error"` が閉ループのトリガーとなる。

この二層設計（チェックリスト + 状態）を混在させないこと。

### ソースコード参照先

- `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` — verify フェーズ遷移メソッドの定義（`recordVerifyPass` / `recordVerifyFailure`）
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` — `verifySkill()` メソッドと `verificationEngine` optional 注入
- `packages/shared/src/types/skillCreator.ts` — `SkillCreatorVerifyResult` / `RuntimeSkillCreatorVerifyCheck` の型定義（既存分）
- `packages/shared/src/types/index.ts` — 型の export 管理
- `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts` — テストファイル（既存の場合は内容確認必須）
- `.claude/skills/` — 検証対象のスキルディレクトリ（テストフィクスチャ設計の参考）

### 関連タスク

| タスクID                             | 関係     | 内容                                                                |
| ------------------------------------ | -------- | ------------------------------------------------------------------- |
| TASK-P0-02                           | 後続     | verify→improve→re-verify 閉ループの修復。本タスクの出力型を消費する |
| TASK-P0-03                           | 独立並行 | workflow-manifest.json の本番配置                                   |
| TASK-RT-03                           | 後続     | スキル生成結果の詳細表示パネル（verify チェック結果を UI に表示）   |
| task-imp-layer12-spec-definition-004 | 後続     | check ID 体系を aiworkflow-requirements の FR-04 仕様に追記する     |

### 参照仕様書

- `docs/30-workflows/skill-creator-agent-sdk-lane/p0-verify-manifest-remediation-pack.md` — P0 是正パック全体の概要と実行順
- `docs/30-workflows/skill-creator-agent-sdk-lane/index.md` — skill-creator-agent-sdk-lane の全タスク一覧

---

## 9. 備考

### 注意事項

- `--no-verify` オプションを使ったコミットは禁止。テストが失敗する場合は `.skip` を使用し、Issue を作成すること。
- `any` 型の使用は禁止。`unknown` を使用したうえで型ガードを実装すること。
- `SkillCreatorVerificationEngine` はファイルシステムに依存するため、テスト時は `os.tmpdir()` 配下に一時ディレクトリを作成してテストすること。実スキルディレクトリを変更するテストは書かないこと。

### 実装完了後の次ステップ

1. TASK-P0-02（verify→improve→re-verify 閉ループ修復）を開始できる。P0-02 は本タスクの `RuntimeSkillCreatorVerifyCheck[]` 型出力と `WorkflowEngine` の `recordVerifyPass()` / `recordVerifyFailure()` を前提とする。
2. TASK-RT-03（結果パネル表示）に `RuntimeSkillCreatorVerifyCheck[]` の UI 表示仕様を共有する。
3. `task-imp-layer12-spec-definition-004`（check ID 体系の仕様書追記）を実施し、将来の Layer 3/4 実装のための命名規則を確定させる。

### 中学生レベルの概念説明

**「Layer」とは何か?**

「Layer（レイヤー）」は「検査の段階」のことです。

スキルファイルを検査するとき、まず「ファイルが存在するか？」を確かめます（Layer 1）。次に「ファイルの中身は正しいか？」を確かめます（Layer 2）。

たとえば「SKILL.md が存在するか？」（Layer 1）の確認で「ない」となったら、「SKILL.md の中身は正しいか？」（Layer 2）を調べる必要はありません（ファイルがないので中身も確認できない）。

Layer 番号が小さいほど「基本的な確認」で、大きいほど「詳しい確認」になります。

**「独立モジュール」とは何か?**

「独立モジュール」とは、1 つの仕事だけをする部品のことです。

verify（検証）の仕事を、他の仕事（plan や execute）と一緒にしてしまうと、後でバグを直したりテストを書いたりするときに大変です。「verify だけをする部品（`SkillCreatorVerificationEngine`）」を別々に作ることで、それぞれを独立してテストでき、将来の修正も楽になります。
