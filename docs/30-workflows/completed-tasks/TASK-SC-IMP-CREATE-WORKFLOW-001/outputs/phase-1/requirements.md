# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 1                               |
| Phase名    | 要件定義                        |
| 前提Phase  | -（起点）                       |
| 後続Phase  | Phase 2: 設計                   |
| ステータス | 完了                            |
| 作成日     | 2026-04-14                      |
| タスクID   | TASK-SC-IMP-CREATE-WORKFLOW-001 |

---

## 目的

`SkillCreatorService.ts` における `runCreateWorkflow` の空実装問題を特定し、
修正に必要な要件と受入条件を明確化する。

## 背景

### 真の論点

`SkillCreatorService.ts` の行574-577 に以下の空実装が存在する：

```typescript
private async runCreateWorkflow(options: CreateSkillOptions): Promise<void> {
  // リクエスト分析と生成
  void options; // unused warning回避
}
```

`create` モードで `createSkill()` を呼び出すと `runCreateWorkflow` が実行されるが、
何もせず即座にリターンする。本来は `resourceLoader.loadAgent` でエージェントプロンプトを
読み込み、スキルの構造計画（StructurePlanJson）を生成すべきである。

### 問題の影響

1. `create` モードでスキルを作成しても LLM によるコンテンツ生成が行われない
2. スキル構造の設計がスキップされるため、生成される SKILL.md が内容の薄いデフォルト値のみになる
3. タスクA（TASK-SC-FIX-GENERATE-SKILL-MD-001）が修正する `generate_skill_md.js` の `--plan` 引数に
   渡すべき構造計画 JSON が生成されず、タスクAの修正効果が発揮されない

### 既存パターン（collaborative モード）

`runCollaborativeWorkflow` では `resourceLoader.loadAgent("hearing")` を呼び出すパターンが確立されている：

```typescript
private async runCollaborativeWorkflow(
  _options: CreateSkillOptions,
): Promise<void> {
  const hearingAgent = await this.resourceLoader.loadAgent("hearing");
  void hearingAgent; // unused warning回避
}
```

`create` モードの `runCreateWorkflow` も同パターンで実装すべき。

### 解決アプローチ

1. `runCreateWorkflow` で `resourceLoader.loadAgent("extract-purpose")` を呼び出す
2. `options.description` を使用して目的抽出エージェントに渡す入力を構成する
3. 構造計画 JSON（StructurePlanJson）を組み立てて返す
4. `loadAgent` 失敗時は `null` を返してフォールバックする（例外を上位に伝播させない）
5. `createSkill()` 内で `runCreateWorkflow` の戻り値を受け取り、タスクAの接続点として使用する

---

## 実行タスク

### タスク1: 問題の特定と影響範囲調査

**目的**: 空実装の影響範囲を正確に把握する

**実行手順**:

1. `SkillCreatorService.ts` 行574-577 のコードを確認
2. `createSkill()` から `runCreateWorkflow` の呼び出し経路を追跡
3. `collaborative` モードの `runCollaborativeWorkflow` 実装を参照して設計指針を確認
4. `.agents/skills/skill-creator/agents/` 内の利用可能エージェントファイルを確認

**期待される成果物**:

- 問題の根本原因確認
- 影響範囲一覧

---

### タスク2: 受入条件の策定

**目的**: 実装完了を判定するための明確な基準を定義する

**実行手順**:

1. `create` モードのユースケースを整理
2. フォールバック要件を明確化
3. 既存テストへの影響を評価
4. 受入条件を5件策定

**期待される成果物**:

- 受入条件一覧（AC-1〜AC-5）

---

## 受入条件

| ID   | 条件                                                                                   | 検証方法                         |
| ---- | -------------------------------------------------------------------------------------- | -------------------------------- |
| AC-1 | mode:"create" で `createSkill()` を呼ぶと `resourceLoader.loadAgent` が呼ばれる        | スパイ/モック検証                |
| AC-2 | `runCreateWorkflow` 完了後、`createSkill()` 後続処理が正常に続く                       | 統合テスト・エンドツーエンド確認 |
| AC-3 | `loadAgent` が失敗した場合でも `createSkill()` は成功する（フォールバック：null 返却） | エラーシナリオテスト             |
| AC-4 | `void options` コメントが削除され、`options.description` が使用される                  | コードレビュー・静的解析         |
| AC-5 | `collaborative` モードの既存テストが全てパスし続ける                                   | 回帰テスト実行                   |

---

## 参照資料

| 参照資料                     | パス                                                                                   | 内容                             |
| ---------------------------- | -------------------------------------------------------------------------------------- | -------------------------------- |
| SkillCreatorService.ts       | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                          | 実装対象（行574-577）            |
| SkillCreatorService テスト   | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`           | テスト追加対象                   |
| extract-purpose エージェント | `.agents/skills/skill-creator/agents/extract-purpose.md`                               | loadAgent で参照するエージェント |
| plan-structure エージェント  | `.agents/skills/skill-creator/agents/plan-structure.md`                                | loadAgent で参照するエージェント |
| タスクA仕様書                | `docs/30-workflows/skill-creator-workflow-fix-lane/TASK-SC-FIX-GENERATE-SKILL-MD-001/` | 先行タスク（依存関係）           |

---

## 成果物

| 成果物          | パス                              | 内容       |
| --------------- | --------------------------------- | ---------- |
| requirements.md | `outputs/phase-1/requirements.md` | 本ファイル |

---

## 統合テスト連携

- 接続要件: `runCreateWorkflow` が返す `StructurePlanJson | null` を `createSkill()` が受け取る接続インターフェース
- タスクAとの連携: タスクAの `generate_skill_md.js --plan <json>` に渡す JSON の生成責務を明記

---

## 完了条件

- [x] 問題の根本原因（行574-577の空実装）が特定されている
- [x] 影響範囲（create モードのみ、collaborative/orchestrate は無関係）が確認されている
- [x] 解決アプローチ（loadAgent パターン踏襲）が確定している
- [x] 受入条件（AC-1〜AC-5）が全件策定されている
- [x] タスクAへの依存関係が明記されている

---

## Phase末端アクション【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクを100%完了し、完了を明記
- [x] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし（起点Phase）
- **後続**: Phase 2: 設計 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`outputs/phase-2/design.md`
