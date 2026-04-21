# [#2226] "[TASK-SW-LLM-PURPOSE-AUTO-EXTRACT] LLM purpose 自動抽出"

## メタ情報

```yaml
task_id: TASK-SW-LLM-PURPOSE-AUTO-EXTRACT
task_name: LLM purpose 自動抽出
category: 改善
target_feature: SkillCreator / StructurePlan 生成
priority: 低
scale: 中規模
status: 未実施
source_phase: Phase 12 / 技術負債洗い出し
created_date: 2026-04-16
dependencies: []
spec_path: docs/30-workflows/unassigned-task/TASK-SW-LLM-PURPOSE-AUTO-EXTRACT.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`SkillCreatorService.ts` の `runCreateWorkflow` 内で、`StructurePlanJson.purpose` フィールドは
現在 `options.description` をそのまま代入している（行 805）:

```typescript
// apps/desktop/src/main/services/skill/SkillCreatorService.ts
const structurePlan: StructurePlanJson = {
  skillName: options.name,
  description: options.description,
  purpose: options.description, // LLM推論は将来タスク。現状はdescriptionをpurposeとして使用
  ...
};
```

この `purpose` フィールドは `generateSkillMd` 内でエージェントのトリガー説明文として使われる:

```typescript
const triggerDescription = normalizedPurpose
  ? `Use when ${structurePlan.skillName} is requested. Purpose: ${normalizedPurpose}`
  : `Use when ${structurePlan.skillName} is requested`;
```

すなわち `purpose` はユーザーが入力した短い説明文（description）がそのまま SKILL.md の
トリガー文に埋め込まれる。description は「メモ書き程度の短文」であることが多く、
エージェントプロンプトとして機能させるには品質が不足している。

### 1.2 問題の構造

| 問題                               | 内容                                                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------ |
| purpose の品質不足                 | `options.description` は入力補助用の短文であり、エージェントトリガー文として使うには意味密度が低い     |
| extract-purpose エージェント未活用 | `loadAgent("extract-purpose")` でエージェント定義を読み込んでいるが LLM への問い合わせが行われていない |
| TODO コメントのまま放置            | `// LLM推論は将来タスク` というコメントが残り、技術負債として蓄積している                              |

### 1.3 放置した場合の影響

- SKILL.md のトリガー文の品質が低いままとなり、skill-creator が生成したスキルの発動精度が下がる
- `extract-purpose` エージェント定義（`agents/extract-purpose.md`）が一切活用されず、
  エージェント設計資産が死蔵される
- `purpose` フィールドが技術的に「description の複製」に過ぎず、将来の LLM 統合の接続点が
  曖昧なまま凍結される

---

## 2. 何を達成するか（What）

### 2.1 目的

`extract-purpose` エージェント定義を使って LLM に問い合わせ、スキルの本質的な目的文を
自動生成する。生成した purpose 文字列を `StructurePlanJson.purpose` に格納することで、
SKILL.md のトリガー文の品質を向上させる。

### 2.2 最終ゴール

| ID   | 達成すること                                                                                    |
| ---- | ----------------------------------------------------------------------------------------------- |
| G-01 | `runCreateWorkflow` 内で LLM に `extract-purpose` エージェント定義を渡し、purpose を生成する    |
| G-02 | `StructurePlanJson.purpose` に LLM 推論結果が格納される（`options.description` の複製ではない） |
| G-03 | LLM 呼び出し失敗時は `options.description` にフォールバックし、スキル作成フロー全体を継続する   |
| G-04 | LLM 呼び出し方式（直接呼び出し vs エージェント経由）が設計ドキュメントに明記されている          |
| G-05 | 新規ユニットテストで purpose が LLM 結果になっていることが検証されている                        |

### 2.3 スコープ

**含むもの**:

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts` の修正
  - `runCreateWorkflow` 内に LLM 呼び出しロジックを追加
  - LLM 失敗時のフォールバック処理（`options.description` を使用）
  - `// LLM推論は将来タスク` TODO コメントの削除
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` のテスト追加
  - TC-01〜TC-05（purpose LLM 自動抽出の検証）

**含まないもの**:

- `extract-purpose.md` エージェント定義ファイル自体の変更
- `generate_skill_md.js` の変更
- `plan-structure` エージェントを使った LLM 呼び出し（別タスク）
- `StructurePlanJson` 型定義の変更（フィールド追加・削除なし）

### 2.4 受入条件（Acceptance Criteria）

| AC   | 条件                                                                                              | 検証方法                                                                |
| ---- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| AC-1 | `runCreateWorkflow` 内で LLM 呼び出しが実行され、purpose が生成される                             | TC-01 で LLM クライアントへの呼び出しが発生することをアサート           |
| AC-2 | `StructurePlanJson.purpose` が `options.description` と同一文字列ではない（LLM 結果が入っている） | TC-02 で purpose が mock LLM の返却値と一致することをアサート           |
| AC-3 | LLM 呼び出し失敗時に `options.description` がフォールバックとして使われ、例外がスローされない     | TC-03 で LLM reject 時に `createSkill()` が例外をスローしないことを確認 |
| AC-4 | LLM 呼び出し方式（直接呼び出し vs エージェント経由）が設計ドキュメントに明記されている            | Phase 2 設計書に方式選択の根拠が記載されていることをレビューで確認      |
| AC-5 | `pnpm --filter @repo/desktop test` がすべて PASS する（既存テストの回帰なし）                     | CI / ローカルテスト実行で全テスト PASS を確認                           |

### 2.5 成果物

| 成果物                                                                       | 内容                                                        |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                | `runCreateWorkflow` 内 LLM 呼び出し実装・フォールバック処理 |
| `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | TC-01〜TC-05 のテストケース追加                             |
| `outputs/phase-2/design.md`（本タスク出力先）                                | LLM 呼び出し方式の設計書                                    |
| `outputs/phase-12/implementation-guide.md`（本タスク出力先）                 | 実装ガイド・苦戦箇所の記録                                  |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

| 確認項目                                                                           | 確認方法                                                                                  |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001` が完了済みであること                  | `git log --oneline` でコミットが含まれることを確認                                        |
| `TASK-SC-IMP-CREATE-WORKFLOW-001` が完了済みであること                             | `runCreateWorkflow` が `StructurePlanJson \| null` を返すシグネチャになっていることを確認 |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts` の現状を把握すること | 行 805 の `purpose: options.description` コメントが残っていることを確認                   |
| `.agents/skills/skill-creator/agents/extract-purpose.md` の仕様を理解すること      | エージェント定義ファイルを読み、入力・出力スキーマ（purpose.json）を把握する              |
| LLM クライアントのインターフェース（`llmClient` or 相当クラス）を特定すること      | `SkillCreatorService.ts` のコンストラクタと依存注入パターンを確認する                     |

### 3.2 依存タスク

| タスクID                                   | 状態         | 関係                                                   |
| ------------------------------------------ | ------------ | ------------------------------------------------------ |
| TASK-SC-IMP-CREATE-WORKFLOW-001            | 完了済み想定 | `runCreateWorkflow` の基盤実装（`loadAgent` パターン） |
| TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001 | 完了済み想定 | `structurePlan` を `generateSkillMd` に渡す接続点      |
| TASK-SC-LLM-PURPOSE-WIRE-001               | 関連タスク   | 本タスクの前身仕様（フォーマットと方向性を参照する）   |

### 3.3 アーキテクチャ設計方針

**変更前（description 複製）**:

```typescript
const structurePlan: StructurePlanJson = {
  skillName: options.name,
  description: options.description,
  purpose: options.description, // LLM推論は将来タスク。現状はdescriptionをpurposeとして使用
  features: [],
  agents: ["extract-purpose", "plan-structure"],
};
```

**変更後（LLM 自動抽出）**:

```typescript
// extract-purpose エージェント定義を LLM に渡し、purpose を生成する
const extractPurposeAgent = await this.resourceLoader.loadAgent(
  "extract-purpose",
  { signal },
);
let purpose: string;
try {
  purpose = await this.llmClient.generate({
    system: extractPurposeAgent,
    user: `スキル名: ${options.name}\n説明: ${options.description}`,
  });
} catch {
  // AC-3: LLM 失敗時は description をフォールバックとして使用
  purpose = options.description;
}

const structurePlan: StructurePlanJson = {
  skillName: options.name,
  description: options.description,
  purpose, // LLM 推論結果（失敗時は description）
  features: [],
  agents: ["extract-purpose", "plan-structure"],
};
```

> **注記**: LLM クライアントの具体的なインターフェース（`llmClient.generate` の引数型）は
> Phase 2 設計書で確定する。上記は概念コードであり、そのまま使用しないこと。

### 3.4 主要ファイルと役割

| ファイル                                                                     | 役割                                     |
| ---------------------------------------------------------------------------- | ---------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                | 修正対象（行 805 の purpose 代入箇所）   |
| `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | テスト追加対象（TC-01〜TC-05）           |
| `.agents/skills/skill-creator/agents/extract-purpose.md`                     | LLM に渡すシステムプロンプト定義         |
| `.agents/skills/skill-creator/schemas/purpose.json`（存在確認が必要）        | `extract-purpose` が準拠する出力スキーマ |

---

## 4. 実行手順（Phase 構成）

### Phase 1: 要件定義

**目的**: 修正スコープと受入条件を確定する。

**作業内容**:

1. `SkillCreatorService.ts` 行 805 付近の現状コードを読み、`purpose` フィールドの代入箇所を特定する
2. `extract-purpose.md` エージェント定義を読み、LLM に渡すべき入力（skillName / description）と
   期待される出力形式（summary 文字列）を把握する
3. LLM クライアントの依存注入パターンを `SkillCreatorService.ts` のコンストラクタから確認する
4. AC-1〜AC-5 を検証可能な形で確定する

**完了条件**:

- `purpose` フィールドの現状と期待する変更後の状態が文書化されている
- LLM クライアントのインターフェースが特定されている
- AC-1〜AC-5 が本タスクの文脈に合わせて確定されている

---

### Phase 2: 設計

**目的**: LLM 呼び出し方式と purpose 抽出ロジックの詳細設計を行う。

**作業内容**:

1. LLM 呼び出し方式を選択し根拠を記録する
   - 選択肢A: 直接呼び出し（`llmClient.generate(system, user)` パターン）
   - 選択肢B: エージェント SDK 経由呼び出し（`agentRunner.run(agentDef, input)` パターン）
2. `extract-purpose` エージェント定義（`extract-purpose.md`）を system プロンプトとして使う場合の
   入力フォーマットを設計する（`user` メッセージの構造）
3. LLM 失敗時のフォールバック処理（`options.description` を使用）を設計する
4. `StructurePlanJson.purpose` への格納方法（型・バリデーション）を確定する
5. 設計書 `outputs/phase-2/design.md` に方式選択の根拠を記載する

**完了条件**:

- LLM 呼び出し方式が1つに確定し、選択根拠が設計書に記載されている
- `user` メッセージのフォーマット（スキル名・説明文の渡し方）が決定している
- フォールバック処理の分岐条件（catch 対象の例外型）が定義されている

---

### Phase 3: 設計レビューゲート

**目的**: Phase 2 の設計を Phase 4 へ進めるか判定する。

**レビュー観点**:

| 観点                                      | 確認内容                                                                              |
| ----------------------------------------- | ------------------------------------------------------------------------------------- |
| LLM クライアント依存の整合性              | `SkillCreatorService` が LLM クライアントをコンストラクタ注入できる設計になっているか |
| フォールバック処理の安全性                | LLM タイムアウト・ネットワークエラー・空文字返却の各ケースで purpose が設定されるか   |
| `extract-purpose.md` の入出力仕様との整合 | 設計した `user` メッセージが `extract-purpose.md` の「5.1 入力」仕様を満たすか        |
| 既存テストへの影響                        | `loadAgent` モックパターンに LLM 呼び出しモックを追加しても既存テストが壊れないか     |

**判定基準**:

- PASS: 全観点がクリアされれば Phase 4 へ進む
- MAJOR: 設計変更が必要な場合は Phase 2 に戻る
- CRITICAL: 前提条件（依存タスク未完了など）がある場合は Phase 1 に戻る

---

### Phase 4: テスト設計

**目的**: TDD の Red フェーズとして、実装前に失敗するテストケースを設計する。

**追加するテストケース**:

| TC ID | 対応 AC | テストタイトル                                                  | 期待結果                                                    |
| ----- | ------- | --------------------------------------------------------------- | ----------------------------------------------------------- |
| TC-01 | AC-1    | create モードで LLM クライアントが呼び出される                  | LLM クライアントの `generate` が最低1回呼ばれる             |
| TC-02 | AC-2    | purpose に LLM の返却値が格納される                             | `structurePlan.purpose` が mock LLM の返却値と一致する      |
| TC-03 | AC-3    | LLM が失敗した場合は description がフォールバックとして使われる | `structurePlan.purpose` が `options.description` と一致する |
| TC-04 | AC-3    | LLM 失敗時に createSkill() は例外をスローしない                 | `createSkill()` が正常完了する                              |
| TC-05 | AC-5    | collaborative モードの既存テストが全て PASS する（回帰なし）    | 既存テストがすべて PASS                                     |

**テストファイル**: `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`

---

### Phase 5: 実装計画

**目的**: Phase 4 のテストを PASS させる実装の詳細手順を決定する。

**実装ステップ**:

1. `SkillCreatorService.ts` に LLM クライアントの依存注入を追加する
   - コンストラクタ引数に `llmClient?: LLMClient` を追加（既存コンストラクタとの互換性維持）
2. `runCreateWorkflow` 内の `purpose: options.description` 代入箇所を LLM 呼び出しに置き換える
3. LLM 呼び出し失敗時の try-catch フォールバック処理を実装する
4. `// LLM推論は将来タスク` TODO コメントを削除する
5. TC-01〜TC-05 のテストを `SkillCreatorService.test.ts` に追加する
6. `pnpm --filter @repo/desktop typecheck` でエラー 0 を確認する

---

### Phase 6: テスト実装（Red → Green）

**目的**: Phase 4 で設計したテストケースを実際に実装し、Red → Green にする。

**作業内容**:

1. `SkillCreatorService.test.ts` に TC-01〜TC-05 を追加し、Red（失敗）状態を確認する
2. Phase 5 の手順で実装を行い、Green（成功）状態にする
3. `pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService"` で全テスト PASS を確認する

---

### Phase 7: カバレッジ確認

**目的**: テストカバレッジが十分であることを確認する。

**確認項目**:

| 確認項目                                                 | 基準                        |
| -------------------------------------------------------- | --------------------------- |
| LLM 呼び出し成功パスがテストされている                   | TC-01 / TC-02 が PASS       |
| LLM 呼び出し失敗パス（フォールバック）がテストされている | TC-03 / TC-04 が PASS       |
| `purpose` フィールドへの格納が検証されている             | TC-02 が purpose の値を確認 |
| 既存テストに回帰がない                                   | TC-05（回帰テスト）が PASS  |

---

### Phase 8: リファクタリング

**目的**: 実装の複雑性を最小化し、コードの可読性を向上させる。

**確認観点**:

- LLM 呼び出しロジックが `runCreateWorkflow` 内に閉じており、他のメソッドに影響していないか
- try-catch のスコープが最小限（LLM 呼び出し部分のみ）になっているか
- `extractPurposeAgent` が `void` のまま残っておらず、実際に LLM 呼び出しに使われているか
- フォールバック時のログ出力（`this.logger.warn`）が適切に追加されているか

---

### Phase 9: 品質保証

**目的**: lint / typecheck / test の品質ゲートをすべてクリアする。

**実行コマンド**:

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck 2>&1 | grep -E "error|Error" | head -20

# lint
pnpm --filter @repo/desktop lint 2>&1 | grep -E "error|Error" | head -20

# テスト実行（SkillCreatorService のみ）
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService"

# 全テスト（回帰確認）
pnpm --filter @repo/desktop test
```

**合格基準**:

- `typecheck` エラー 0
- `lint` エラー 0
- `SkillCreatorService.test.ts` 全テスト PASS
- 全テスト PASS（回帰なし）

---

### Phase 10: 最終レビュー

**目的**: AC-1〜AC-5 の完了判定を行い、マージ可能かどうかを判断する。

**確認チェックリスト**:

- [ ] AC-1: LLM クライアントへの呼び出しが `runCreateWorkflow` 内で実行される
- [ ] AC-2: `StructurePlanJson.purpose` に LLM 推論結果が格納されている
- [ ] AC-3: LLM 失敗時に `options.description` がフォールバックとして使われる
- [ ] AC-4: LLM 呼び出し方式が Phase 2 設計書に明記されている
- [ ] AC-5: 既存テストが全て PASS している

**判定基準**:

- PASS: 全 AC がクリアされれば Phase 11 へ進む
- MAJOR: AC 未達の場合は対応 Phase に戻る
- CRITICAL: 設計に根本的な問題がある場合は Phase 2 に戻る

---

### Phase 11: 手動テスト

**目的**: 実際のアプリケーションを起動し、create モードでスキルを作成して動作確認する。

**確認手順**:

1. `pnpm --filter @repo/desktop dev` でアプリを起動する
2. スキル作成 UI から「create」モードでスキルを作成する
3. 生成された SKILL.md の `trigger.description` に purpose が含まれていることを確認する
4. purpose の文章が `options.description` のコピーではなく、LLM が生成した文章であることを確認する
5. ネットワークエラーなど LLM 失敗のシミュレーション下でもスキル作成が完了することを確認する

---

### Phase 12: ドキュメント更新

**目的**: 実装ガイド・未タスク検出・フィードバックレポートを記録する。

**作成する成果物**:

| 成果物                                          | 内容                                                    |
| ----------------------------------------------- | ------------------------------------------------------- |
| `outputs/phase-12/implementation-guide.md`      | 実装の概要・変更ファイル一覧・苦戦箇所の記録            |
| `outputs/phase-12/unassigned-task-detection.md` | 本タスク実施中に発見された未タスクの一覧（0件でも記録） |
| `outputs/phase-12/skill-feedback-report.md`     | スキルへのフィードバック・改善点（なしでも記録）        |

**記録必須項目（implementation-guide.md）**:

- 変更したファイルのパスと変更概要
- LLM 呼び出し方式の最終決定内容
- フォールバック処理の動作仕様
- 苦戦箇所と解決策（セクション 9 を参照）

---

### Phase 13: PR 作成

**目的**: ユーザーの承認を得た後に PR を作成する。

> **重要**: このフェーズはユーザーの明示的な承認なしに実行禁止。

**PR 作成手順**:

1. `git status` で変更ファイルを確認する
2. `pnpm --filter @repo/desktop typecheck` / `pnpm --filter @repo/desktop lint` でエラー 0 を最終確認する
3. コミットメッセージ案をユーザーに提示し承認を得る
4. `gh pr create` で PR を作成する

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] AC-1: `runCreateWorkflow` 内で LLM クライアントへの呼び出しが実行される
- [ ] AC-2: `StructurePlanJson.purpose` に LLM 推論結果が格納されている（`options.description` の複製ではない）
- [ ] AC-3: LLM 呼び出し失敗時に `options.description` がフォールバックとして使われ、例外がスローされない
- [ ] AC-4: LLM 呼び出し方式が Phase 2 設計書（`outputs/phase-2/design.md`）に明記されている
- [ ] AC-5: 既存の全テストが PASS している（回帰なし）

### テスト要件

- [ ] TC-01: create モードで LLM クライアントが呼び出されることを確認するテストが追加・PASS
- [ ] TC-02: `structurePlan.purpose` が mock LLM の返却値と一致することを確認するテストが追加・PASS
- [ ] TC-03: LLM 失敗時に `purpose` が `options.description` にフォールバックすることを確認するテストが追加・PASS
- [ ] TC-04: LLM 失敗時に `createSkill()` が例外をスローしないことを確認するテストが追加・PASS
- [ ] TC-05: collaborative モードの既存テストが全て PASS している（回帰テスト）
- [ ] `SkillCreatorService.test.ts` 全体が PASS

### 品質要件

- [ ] `pnpm --filter @repo/desktop typecheck` がエラー 0
- [ ] `pnpm --filter @repo/desktop lint` がエラー 0

### ドキュメント要件

- [ ] `outputs/phase-2/design.md` が作成されている（LLM 呼び出し方式の根拠を含む）
- [ ] `outputs/phase-12/implementation-guide.md` が作成されている
- [ ] `outputs/phase-12/unassigned-task-detection.md` が作成されている（0件でも出力）
- [ ] `outputs/phase-12/skill-feedback-report.md` が作成されている

---

## 6. 検証方法

### 6.1 ユニットテスト実行

```bash
# SkillCreatorService のテストのみ
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService"

# TC-02（purpose LLM 結果確認）のみ実行
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService" --grep "purpose"
```

### 6.2 型チェック・Lint

```bash
pnpm --filter @repo/desktop typecheck 2>&1 | grep -E "error|Error" | head -20
pnpm --filter @repo/desktop lint 2>&1 | grep -E "error|Error" | head -20
```

### 6.3 手動検証ポイント

| 確認項目                                                | 確認方法                                                                                             |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| SKILL.md の `trigger.description` に purpose が含まれる | 生成された SKILL.md を開き、`Use when ... Purpose:` の後に LLM 生成文が入っていることを確認          |
| purpose が description の単純コピーでない               | SKILL.md の purpose 文と入力した description を比較する                                              |
| LLM 失敗時のフォールバック動作                          | ネットワーク遮断（offline / proxy error 等）で create モードを実行し、スキルが作成完了することを確認 |

---

## 7. リスクと対策

| リスク                                                                                                       | 影響度 | 発生確率 | 対策                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------ | ------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `SkillCreatorService` が LLM クライアントを依存注入できる設計になっていない                                  | 高     | 中       | Phase 1 でコンストラクタを確認し、依存注入が不可能な場合は先に依存注入リファクタリングを行う                                              |
| LLM の返却値が `extract-purpose.md` の出力スキーマ（`summary` フィールド）に準拠しない                       | 中     | 高       | Phase 2 で LLM レスポンスのパース処理を設計し、`summary` フィールド抽出ロジックを明確にする                                               |
| LLM 呼び出しがタイムアウトしてテストが遅くなる                                                               | 中     | 低       | テストでは LLM クライアントをモックし、実際の LLM 呼び出しを行わない（TC-01〜TC-05 はすべてモック使用）                                   |
| フォールバック処理の try-catch スコープが広すぎて `loadAgent` 失敗もフォールバックしてしまう                 | 低     | 中       | try-catch は LLM 呼び出し部分のみに限定し、`loadAgent` 失敗は既存の AC-3（`runCreateWorkflow` が null 返却）で処理する                    |
| `extract-purpose.md` が system プロンプトとして機能しない（エージェント定義のフォーマットが LLM に合わない） | 低     | 中       | Phase 2 で system プロンプトのフォーマット調整方針を設計する。エージェント定義の前処理（Markdown 除去など）が必要な場合は設計書に記録する |

---

## 8. 参照情報

| 参照先                                                                       | 目的                                                     |
| ---------------------------------------------------------------------------- | -------------------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts` 行 802-813     | 変更対象コードの確認（`runCreateWorkflow` 内の現状実装） |
| `.agents/skills/skill-creator/agents/extract-purpose.md`                     | LLM に渡す system プロンプトの仕様確認                   |
| `docs/30-workflows/unassigned-task/TASK-SC-LLM-PURPOSE-WIRE-001.md`          | 本タスクの前身仕様（フォーマット・苦戦箇所の引継ぎ）     |
| `docs/30-workflows/unassigned-task/TASK-SC-IMP-CREATE-WORKFLOW-001.md`       | 依存タスク（`runCreateWorkflow` 基盤実装）の仕様書       |
| `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | 既存テストパターンの確認（`loadAgent` モック方法など）   |

---

## 9. 備考（苦戦箇所【記入必須】）

### 9.1 事前に予測される苦戦箇所

実施前の時点での予測リスクを記録する。**実施後は各行の「実際の結果」列を更新すること**
（Phase 12 の `skill-feedback-report.md` へ転記できる粒度で記載する）。

| 苦戦箇所                                                                              | 原因                                                                                                                                    | 対応策（予測）                                                                                                                                      | 実際の結果（実施後に記入） |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `SkillCreatorService` に LLM クライアントの依存注入が存在しない                       | 現状の `SkillCreatorService` は `ScriptExecutor` と `ResourceLoader` しか持っておらず、LLM クライアントがない                           | Phase 1 でコンストラクタを確認し、注入方法（コンストラクタ引数 or プロパティ注入）を決める。なければ先にリファクタリングが必要                      | （実施後に記入）           |
| `extract-purpose.md` の出力が JSON 形式であり、`summary` フィールドのパースが必要     | エージェント定義の出力スキーマは `{ skillName, summary, goals }` の JSON 形式であるが、LLM は Markdown コードブロックで返す可能性がある | Phase 2 でレスポンスパース処理を設計する（JSON.parse + `summary` 抽出、またはテキスト抽出フォールバック）                                           | （実施後に記入）           |
| purpose の品質基準が曖昧で「LLM 結果が良い」かどうかの自動検証が困難                  | `purpose` の品質は主観的であり、テストで「description と異なる文字列」を確認するだけでは不十分                                          | TC-02 では mock LLM の返却値との一致を確認するにとどめる。品質評価は Phase 11 手動テストで人間が判断する                                            | （実施後に記入）           |
| LLM タイムアウト設定が `SkillCreatorService` の `signal`（AbortController）と競合する | `runCreateWorkflow` は `AbortSignal` を受け取るが、LLM 呼び出しにも AbortSignal を渡す必要があり、二重キャンセル処理になる              | Phase 2 で LLM 呼び出し時に同一 `signal` を渡す設計とし、`throwIfCancelled` との整合を確認する                                                      | （実施後に記入）           |
| テストでの LLM クライアントモックが `loadAgent` モックと干渉する                      | `loadAgent` のモックと LLM クライアントのモックを同一テストファイルで管理するため、`beforeEach` の設定が複雑になる                      | TC-01〜TC-04 を独立した `describe` ブロックに分離し、それぞれ `beforeEach` でモックをリセットする。`vi.restoreAllMocks()` を `afterEach` で実行する | （実施後に記入）           |

### 9.2 背景コンテキスト（将来実装者へ）

- `purpose` フィールドはエージェントの **トリガー文**（`Use when X is requested. Purpose: Y`）として
  SKILL.md に書き込まれる。この文は Claude が「いつこのスキルを使うべきか」を判断する際の
  唯一の手がかりになる。description の短文そのままでは文脈が欠落し、スキルの発動精度が低下する。

- `extract-purpose` エージェントは「Simon Sinek」の思考様式（Why から始める）を模倣し、
  ユーザーの要求からスキルの本質的な目的を1〜2文で抽出することを得意とする。
  この特性を活かして、`options.description` よりも意味密度の高い purpose を生成できる。

- 本タスクの前身として `TASK-SC-LLM-PURPOSE-WIRE-001` が存在する。そちらでは
  「`generate_skill_md.js` との接続確認後に実装する」という条件付きの仕様書であったが、
  接続タスク（`TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001`）の完了により、
  本タスクとして独立して実装可能な状態になった。

- **100人中100人が同じ理解で実行できる**ために特に重要なポイント:
  1. Phase 1 で LLM クライアントの依存注入可否を確認する（確認なしに実装を進めると設計ミスになる）
  2. Phase 2 で LLM レスポンスのパース処理を設計してから Phase 5 の実装に進む
  3. TC-02 のテストは「mock LLM の返却値と purpose が一致する」ことを確認するのであって、
     「LLM が良い文を返す」ことをテストするものではない
  4. Phase 13 はユーザーの承認なしに絶対に実行しない
