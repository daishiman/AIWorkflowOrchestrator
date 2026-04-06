# Phase 2: 設計 - TASK-P0-01 verify 実行エンジン（Layer 1/2 コア + Layer 3/4 互換）

## メタ情報

| 項目      | 内容                                                   |
| --------- | ------------------------------------------------------ |
| Phase     | 2                                                      |
| Phase名   | 設計                                                   |
| カテゴリ  | 設計                                                   |
| 機能名    | step-09-par-task-p0-01-verify-execution-engine-layer12 |
| 作成日    | 2026-04-04                                             |
| 前提Phase | Phase 1                                                |
| 後続Phase | Phase 3                                                |

## 目的

Phase 1 で確定した要件に基づき、`SkillCreatorVerificationEngine` のモジュール設計、型設計、統合設計を完了させる。current facts では Layer 3/4 の verify 契約が既に存在するため、設計は Layer 1/2 コアを中心にしつつ 4-layer 互換を保つ。

## 実行タスク

### タスク1: モジュール設計（独立モジュール設計の原則）

**目的**: `SkillCreatorVerificationEngine` のクラス設計とモジュール境界を定義する

**設計原則**:

#### 原則 1: 独立モジュールとして設計する

`SkillCreatorVerificationEngine` は `RuntimeSkillCreatorFacade` や `SkillCreatorWorkflowEngine` に直接埋め込んではならない。必ず独立クラスとして実装し、依存性注入（コンストラクタインジェクション）で組み込む。

```
禁止パターン（Facade 直接埋め込み）:
  RuntimeSkillCreatorFacade 内に検証ロジックを直接記述

推奨パターン（独立モジュール + 注入）:
  SkillCreatorVerificationEngine を専用ファイルに分離し、
  Facade からは verificationEngine.verify(skillDir) の呼び出しのみ
```

#### 原則 2: Layer 関数はモジュールプライベートな純粋関数

`validateLayer1(skillDir)` と `validateLayer2(skillDir)` はクラス外部に公開せず、モジュールプライベートな非同期関数として定義する。テストはクラスの `verify()` メソッドを通じて検証する。

#### 原則 3: VerifyResult 型を P0-02 と共有できる形で定義

`RuntimeSkillCreatorVerifyCheck` 型には以下のフィールドを必ず含める:

- `id`: チェック ID（例: `"L1-001"`）
- `layer`: レイヤー識別子（`"layer1" | "layer2" | "layer3" | "layer4"`）
- `severity`: 重要度（`"error" | "warning" | "info"`）
- `summary`: 人間が読める説明文（英語）
- `evidenceSummary`（optional）: 検証結果の補足情報

**クラス設計**:

```
SkillCreatorVerificationEngine
├── verify(skillDir: string): Promise<RuntimeSkillCreatorVerifyCheck[]>
│   ├── validateLayer1(skillDir) → RuntimeSkillCreatorVerifyCheck[]
│   └── validateLayer2(skillDir) → RuntimeSkillCreatorVerifyCheck[]
│
├── [module-private] validateLayer1(skillDir)
│   ├── L1-001: fileExists(SKILL.md)
│   ├── L1-002: directoryExists(agents/)
│   ├── L1-003: agents/ ファイル件数 >= 1
│   ├── L1-004: directoryExists(references/)
│   └── L1-005: fileExists(output-schema.json)
│
├── [module-private] validateLayer2(skillDir)
│   ├── L2-001: SKILL.md H1 見出し（SKILL.md 不可読時は error 明示）
│   ├── L2-002: SKILL.md ## 概要（SKILL.md 不可読時は error 明示）
│   ├── L2-003: SKILL.md ## Trigger（SKILL.md 不可読時は error 明示）
│   ├── L2-004: SKILL.md ## Anchors（SKILL.md 不可読時は warning/error を明示）
│   ├── L2-005: agents/*.md H1 見出し（対象ファイルがある場合）
│   ├── L2-006: agents/*.md ## 責務（対象ファイルがある場合）
│   └── L2-007: output-schema.json JSON 妥当性（対象ファイルがある場合）
│
└── [module-private helpers]
    ├── fileExists(p): Promise<boolean>
    ├── directoryExists(p): Promise<boolean>
    ├── readFileContent(p): Promise<string | null>
    ├── hasH1Heading(content): boolean
    ├── hasMarkdownSection(content, heading): boolean
    └── createCheck(id, layer, severity, summary, evidence?): RuntimeSkillCreatorVerifyCheck
```

**配置先**: `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`

### タスク2: 型設計（VerifyResult 型）

**目的**: `packages/shared/src/types/skillCreator.ts` の current facts と整合する型定義を設計する

**型定義**:

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
  evidenceSummary?: string; // 補足情報
}
```

**二層設計（チェックリスト + 状態）**:

| 型                                 | 責務                                        | 管理主体                       |
| ---------------------------------- | ------------------------------------------- | ------------------------------ |
| `RuntimeSkillCreatorVerifyCheck[]` | 個々の検証チェック結果リスト                | SkillCreatorVerificationEngine |
| `SkillCreatorVerifyResult`         | ワークフロー全体の verify 状態（pass/fail） | SkillCreatorWorkflowEngine     |

**P0-02 との型契約**:

P0-02 は `RuntimeSkillCreatorVerifyCheck[]` を受け取り、`severity === "error"` のチェックが 1 件以上あれば improve フェーズへ進む。`verifySkill()` はチェック配列の取得のみを担当し、`verifyAndImproveLoop()` が WorkflowEngine への pass/fail ルーティングを担当する。したがって `severity` フィールドの判定ロジックは:

- `error` 1件以上 → `verifyAndImproveLoop()` で `recordVerifyFailure()`
- `error` 0件（warning/info のみ）→ `verifyAndImproveLoop()` で `recordVerifyPass()`

### タスク3: 統合設計（WorkflowEngine 統合パターン）

**目的**: `RuntimeSkillCreatorFacade` への統合方法と `WorkflowEngine` への結果ルーティングを責務分離して設計する

**統合パターン**:

```
RuntimeSkillCreatorFacade.verifySkill(skillDir)
  └─ this.verificationEngine.verify(skillDir)
       ├─ validateLayer1(skillDir)  → RuntimeSkillCreatorVerifyCheck[]
       └─ validateLayer2(skillDir)  → RuntimeSkillCreatorVerifyCheck[]
  └─ checks をそのまま返す

RuntimeSkillCreatorFacade.verifyAndImproveLoop(...)
  ├─ checks を評価
  ├─ error あり → WorkflowEngine.recordVerifyFailure()
  └─ error なし → WorkflowEngine.recordVerifyPass()
```

**注入ポイント**:

1. `RuntimeSkillCreatorFacade` のコンストラクタ `deps` に `verificationEngine?: SkillCreatorVerificationEngine` を追加
2. `verifySkill()` メソッド内で `this.verificationEngine?.verify(skillDir)` を呼び出す
3. 未注入時は空配列を返す（graceful degradation）

**初期化箇所**: `SkillCreatorIpcBridge.ts` 等の初期化箇所で `new SkillCreatorVerificationEngine()` を生成して注入する

### タスク4: Layer 1 / Layer 2 境界設計

**目的**: Layer 間の依存関係と境界を明確に設計する

**境界定義**:

| 属性     | Layer 1                    | Layer 2                                                          |
| -------- | -------------------------- | ---------------------------------------------------------------- |
| 操作     | `fs.stat()` のみ           | `fs.readFile()` + 内容解析                                       |
| 目的     | ファイル・ディレクトリ存在 | コンテンツ仕様準拠                                               |
| 依存関係 | なし                       | Layer 1 の存在確認結果に依存                                     |
| 出力制御 | なし                       | SKILL.md 不可読時は error 明示、それ以外は対象がある場合のみ検証 |

**Layer 1 → Layer 2 の依存ルール**:

- SKILL.md が存在しない / 読めない（L1-001 error）→ L2-001〜L2-004 を error で返す
- agents/ が存在しない（L1-002 error）→ L2-005, L2-006 は発行しない
- agents/ が空（L1-003 error）→ L2-005, L2-006 は結果を生成しない（0件で正常）
- output-schema.json が存在しない（L1-005 warning）→ L2-007 は発行しない

### タスク5: テスト戦略設計

**目的**: テスト用フィクスチャの設計とテストケース構成を定義する

**フィクスチャ設計**:

- テスト用フィクスチャは `os.tmpdir()` 配下に動的に生成する
- `createSkillFixture(baseDir, options)` パターンでヘルパー関数を用意する
- `afterEach` で `fs.rm(skillDir, { recursive: true, force: true })` を実行しクリーンアップ
- 実スキルディレクトリを変更するテストは書かない

**テストケース構成**:

| #   | テストケース                               | 入力条件                                                                  | 期待結果                                        |
| --- | ------------------------------------------ | ------------------------------------------------------------------------- | ----------------------------------------------- |
| 1   | 全ファイル揃いの正常スキル                 | 全ファイル・ディレクトリ揃い（agents/ に H1 と `## 責務` を含む .md 1件） | 全チェック info、error/warning なし             |
| 2   | SKILL.md 欠如                              | SKILL.md なし                                                             | L1-001 error                                    |
| 3   | agents/ ディレクトリ欠如                   | agents/ なし                                                              | L1-002 error                                    |
| 4   | agents/ 空ディレクトリ                     | agents/ 空                                                                | L1-003 error                                    |
| 5   | references/ 欠如                           | references/ なし                                                          | L1-004 warning（error でない）                  |
| 6   | output-schema.json 欠如                    | output-schema.json なし                                                   | L1-005 warning（error でない）                  |
| 7   | SKILL.md に H1 なし                        | `# ` 行なし                                                               | L2-001 error                                    |
| 8   | SKILL.md に `## 概要` なし                 | 概要セクションなし                                                        | L2-002 error                                    |
| 9   | SKILL.md に `## Trigger` なし              | Trigger セクションなし                                                    | L2-003 error                                    |
| 10  | SKILL.md に `## Anchors` なし              | Anchors セクションなし                                                    | L2-004 warning                                  |
| 11  | agent ファイルに H1 なし                   | agents/\*.md に H1 なし                                                   | L2-005 error                                    |
| 12  | agent ファイルに `## 責務` なし            | agents/\*.md に責務セクションなし                                         | L2-006 warning（error でない）                  |
| 13  | output-schema.json が invalid JSON         | パース不可                                                                | L2-007 error                                    |
| 14  | verifyAndImproveLoop() が error を含む場合 | L1-001 error                                                              | WorkflowEngine.recordVerifyFailure() が呼ばれる |
| 15  | verifyAndImproveLoop() が全 pass の場合    | 全チェック info/warning のみ                                              | WorkflowEngine.recordVerifyPass() が呼ばれる    |

## 参照資料

| 資料名             | パス                                                                                    | 説明          |
| ------------------ | --------------------------------------------------------------------------------------- | ------------- |
| Phase 1 成果物     | `outputs/phase-1/requirements.md`                                                       | 要件定義書    |
| Verify契約仕様     | `.claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md` | Check ID 体系 |
| アーキテクチャ概要 | `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`       | 3層構成       |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                 | パス                                                                                    | 内容                              |
| ------------------------ | --------------------------------------------------------------------------------------- | --------------------------------- |
| Verify契約・Check ID体系 | `.claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md` | check ID 命名規則 `L{N}-{NNN}`    |
| アーキテクチャ概要       | `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`       | Facade / Engine / Bridge 責務分離 |

## 統合テスト連携

| テスト観点                | 設計で確認すべき点                                        |
| ------------------------- | --------------------------------------------------------- |
| verify 結果のデータフロー | Engine → Facade → WorkflowEngine の型契約が一貫している   |
| Layer 間依存              | Layer 1 error 時の Layer 2 出力制御が正しく設計されている |
| P0-02 との型共有          | `RuntimeSkillCreatorVerifyCheck[]` が閉ループで消費可能   |

## 多角的チェック観点

| 観点           | 適用判断         | 確認内容                                                             |
| -------------- | ---------------- | -------------------------------------------------------------------- |
| アーキテクチャ | 該当（設計変更） | 独立モジュール設計が Facade/Engine/Bridge の責務分離を破壊しないこと |
| エラー処理     | 該当             | Layer 1 error → Layer 2 出力制御のフォールバック設計が妥当であること |
| 型安全性       | 該当             | `severity` の3値が P0-02 の判定ロジックと整合すること                |

## 成果物

| 成果物 | パス                        | 説明                             |
| ------ | --------------------------- | -------------------------------- |
| 設計書 | `outputs/phase-2/design.md` | モジュール設計・型設計・統合設計 |

## 完了条件

- [ ] `SkillCreatorVerificationEngine` のクラス設計が定義されている
- [ ] `RuntimeSkillCreatorVerifyCheck` / `RuntimeSkillCreatorVerifyCheckSeverity` の型設計が完了している
- [ ] `RuntimeSkillCreatorFacade` への統合パターンが設計されている
- [ ] Layer 1 → Layer 2 の依存ルールが設計されている
- [ ] テスト戦略（フィクスチャ設計、テストケース15件）が定義されている
- [ ] 二層設計（チェックリスト + 状態）が P0-02 との型契約で整合している
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビュー
