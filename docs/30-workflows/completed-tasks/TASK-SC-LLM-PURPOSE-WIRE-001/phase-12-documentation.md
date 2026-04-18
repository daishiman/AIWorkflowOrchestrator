# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 12                           |
| Phase名    | ドキュメント更新             |
| 前提Phase  | Phase 11                     |
| 後続Phase  | Phase 13                     |
| ステータス | 完了                         |
| 作成日     | 2026-04-18                   |
| タスクID   | TASK-SC-LLM-PURPOSE-WIRE-001 |

---

## 目的

実装完了後のコードベースを正確に反映したドキュメントを整備し、
本タスクの知識を将来の開発者が再利用できる形に固定化する。
5つの必須タスクを全て実施することで、タスクの完了状態を記録として確定させる。

## 背景

実装・テスト・レビューを経て動作が確定した時点でドキュメントを更新することで、
コードとドキュメントの乖離を防ぐ。
NON_VISUAL タスクであるため、スクリーンショット証跡は不要とし、
実装ガイドと仕様書更新を主体とする。

---

## 実行タスク

### Task 1: 実装ガイド作成（2パート構成）

**目的**: purpose 抽出 LLM 接続の実装内容を、異なる読者層向けに2段階で説明するガイドを作成する。

---

#### Part 1: 中学生レベルの説明

**目的**: 技術的な背景知識がない読者にも理解できる説明を提供する。

**日常の例え話**:

> 料理レシピ本（extract-purpose エージェント定義）を渡されたシェフ（LLM）が、
> 食材のリスト（skillInput）を見て「この料理の目的は栄養バランスを整えることです」という
> 一文（purpose）を書いてくれるようなイメージです。
> 以前は、レシピ本そのものがメモ欄に貼り付けられていましたが、
> 今後はシェフが読んで考えた結果の一文だけが記録されます。

**なぜ必要か**:

- `structurePlan.purpose` は「このスキルが何をするためのものか」を一言で示す重要なフィールドである。
- 以前は LLM に問い合わせずにエージェント定義そのものが入っていたため、意味のある説明になっていなかった。

**何をするか**:

1. `extract-purpose` という指示書（エージェント定義）を読み込む。
2. その指示書と、スキルの入力内容を AI（LLM）に渡す。
3. AI が返してきた「スキルの目的文」を `purpose` として保存する。

**専門用語を使わない説明**:

- エージェント定義 = AI への指示書
- LLM = 文章を理解して返答する AI
- system prompt = AI に渡す「役割の説明」
- purpose = スキルが何をするものかを示す一文

---

#### Part 2: 技術者レベルの説明

**目的**: 実装者が `llmClient.generate` の使い方と purpose 抽出フローを正確に理解できる情報を提供する。

**llmClient.generate のインターフェース/型定義（TypeScript）**:

```typescript
interface LlmGenerateInput {
  system: string; // LLM への system prompt（エージェント定義の内容）
  user: string; // LLM へのユーザー入力（スキル入力内容）
}

interface LlmClient {
  generate(input: LlmGenerateInput): Promise<string>;
}
```

**APIシグネチャと使用例**:

```typescript
// extract-purpose エージェント定義を system prompt として LLM に渡し、
// skillInput を user 入力として purpose を抽出する
const purposeAgentDef = await this.resourceLoader.loadAgent("extract-purpose");
const response = await this.llmClient.generate({
  system: purposeAgentDef,
  user: skillInput,
});
structurePlan.purpose = this.normalizePurposeResponse(response);
```

**エラーハンドリングとエッジケース**:

| ケース                    | 挙動                                                                    |
| ------------------------- | ----------------------------------------------------------------------- |
| `loadAgent` 失敗          | `null` を返し、呼び出し元で `options.description` へフォールバックする  |
| `llmClient.generate` 例外 | abort 系以外は `null` を返し、呼び出し元で `options.description` を使う |
| `generate` が JSON を返す | `summary` を優先採用する                                                |
| `generate` が空文字を返す | 空文字のまま `structurePlan.purpose` に格納する                         |
| `skillInput` が空文字     | LLM に渡すが、有意な purpose が生成されない可能性があることを考慮する   |

**視覚証跡**:

UI/UX変更なしのため Phase 11 スクリーンショット不要。

---

### Task 2: システム仕様書更新（4サブステップ）

**目的**: システム仕様書に本タスクの完了状態を正確に反映させる。

#### Step 1-A: タスク完了記録

`docs/30-workflows/TASK-SC-LLM-PURPOSE-WIRE-001/index.md` のステータスを更新する:

```markdown
| ステータス | 完了（Phase 12 close-out 時に更新）|
```

#### Step 1-B: 実装状況テーブルの更新

`index.md` 内の成果物一覧テーブルを以下のように更新する:

| 種別         | 成果物                      | 配置先                                                                               | 状況     |
| ------------ | --------------------------- | ------------------------------------------------------------------------------------ | -------- |
| 機能         | purpose LLM 抽出実装        | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                        | **完了** |
| テスト       | purpose 抽出ユニットテスト  | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.purpose.test.ts` | **完了** |
| ドキュメント | Phase 1-13 仕様・実行成果物 | `outputs/phase-1/ 〜 phase-13/`                                                      | **完了** |

#### Step 1-C: 関連タスクテーブルの更新

依存タスク `TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001` との関連を確認し、
タスク間の依存関係が正しく記録されていることを確認する。

#### Step 2（条件付き）: 新規インターフェース追加時のみ

`llmClient.generate` に新たな型定義・インターフェースが追加された場合のみ、
`docs/00-requirements/master_system_design.md` またはシステム仕様書の該当箇所を更新する。
本タスクで既存インターフェースを変更していない場合はスキップ可。

**実行手順**:

1. Step 1-A〜1-C を実施する。
2. `llmClient.generate` に新たなインターフェースを追加した場合のみ Step 2 を実施する。

---

### Task 3: ドキュメント更新履歴作成

**目的**: 本タスクで行ったドキュメント変更の履歴を記録する。

**更新履歴テンプレート**:

```markdown
## ドキュメント更新履歴

| 更新日     | 対象ファイル                                            | 変更内容                   | 担当                         |
| ---------- | ------------------------------------------------------- | -------------------------- | ---------------------------- |
| 2026-04-18 | docs/30-workflows/TASK-SC-LLM-PURPOSE-WIRE-001/index.md | ステータスを「完了」に更新 | TASK-SC-LLM-PURPOSE-WIRE-001 |
| 2026-04-18 | outputs/phase-12/implementation-guide.md                | 実装ガイド（2パート）作成  | TASK-SC-LLM-PURPOSE-WIRE-001 |
| 2026-04-18 | outputs/phase-12/documentation-changelog.md             | 更新履歴作成               | TASK-SC-LLM-PURPOSE-WIRE-001 |
```

**実行手順**:

1. 本 Phase で変更したファイルをリストアップする。
2. 各ファイルの変更内容を1行で記述する。
3. `outputs/phase-12/documentation-changelog.md` として保存する。

---

### Task 4: 未タスク検出レポート作成（0件でも出力必須）

**目的**: 本タスクの実施を通じて発見された未対応事項を記録する。0件の場合も明示的に記録する。

**検出観点**:

| 観点                             | 確認内容                                                               |
| -------------------------------- | ---------------------------------------------------------------------- |
| purpose の後処理                 | `structurePlan.purpose` に格納後のトリム・バリデーションが必要かどうか |
| extract-purpose 出力フォーマット | エージェント定義でフォーマット指定が不十分な場合の対応が必要かどうか   |
| LLM フォールバック               | purpose 抽出失敗時のデフォルト値設定が必要かどうか                     |
| 他フィールドへの展開             | description・tags 等の他フィールドに同様の LLM 接続が必要かどうか      |

**出力テンプレート（0件の場合）**:

```markdown
## 未タスク検出レポート

検出日: 2026-04-18
タスクID: TASK-SC-LLM-PURPOSE-WIRE-001

### 検出件数: 0件

本タスクの実施を通じて、新たな未対応事項は検出されませんでした。
```

**実行手順**:

1. 上記観点でコードベースを確認する。
2. 未対応事項がある場合は件数と内容を記録する。
3. 0件の場合も「0件」と明示して `outputs/phase-12/unassigned-task-detection.md` として保存する。

---

### Task 5: スキルフィードバックレポート作成（改善点なしでも出力必須）

**目的**: 本タスクの実施を通じて得られたスキル・プロセスへのフィードバックを記録する。
改善点がない場合も明示的に記録する。

**フィードバック観点**:

| 観点                       | 確認内容                                                            |
| -------------------------- | ------------------------------------------------------------------- |
| task-specification-creator | Phase 仕様書のフォーマット・内容に改善点があるか                    |
| TDD サイクル               | Phase 4→5→6 の流れが実際の作業で有効に機能したか                    |
| LLM 呼び出しパターン       | `llmClient.generate` の呼び出しパターンをスキルとして共通化できるか |
| テストモック設計           | LLM モックの設計が他のテストでも再利用可能な形になっているか        |

**出力テンプレート（改善点なしの場合）**:

```markdown
## スキルフィードバックレポート

作成日: 2026-04-18
タスクID: TASK-SC-LLM-PURPOSE-WIRE-001

### 改善提案件数: 0件

本タスクの実施を通じて、スキル・プロセスへの具体的な改善提案はありません。
現在の task-specification-creator スキルと TDD サイクルは、今回の NON_VISUAL タスクでも追加修正なしで運用できた。
```

**実行手順**:

1. 上記観点でタスク全体を振り返る。
2. 具体的な改善提案がある場合は内容と対象スキルを記録する。
3. 改善点なしの場合も「0件」と明示して `outputs/phase-12/skill-feedback-report.md` として保存する。

---

## 参照資料

| 参照資料                     | パス                                                                   | 内容                     |
| ---------------------------- | ---------------------------------------------------------------------- | ------------------------ |
| SkillCreatorService          | apps/desktop/src/main/services/skill/SkillCreatorService.ts            | 実装ガイドの参照元       |
| extract-purpose エージェント | .claude/skills/skill-creator/agents/extract-purpose.md                 | エージェント定義ファイル |
| タスク index                 | docs/30-workflows/TASK-SC-LLM-PURPOSE-WIRE-001/index.md                | ステータス更新対象       |
| Phase 11 仕様書              | docs/30-workflows/TASK-SC-LLM-PURPOSE-WIRE-001/phase-11-manual-test.md | 前提Phase 仕様書         |
| システム設計書               | docs/00-requirements/master_system_design.md                           | Step 2 条件付き更新対象  |

---

## 成果物

| 成果物                       | パス                                                   | 内容                                           |
| ---------------------------- | ------------------------------------------------------ | ---------------------------------------------- |
| 実装ガイド                   | outputs/phase-12/implementation-guide.md               | 中学生レベル + 技術者レベルの2パート           |
| システム仕様更新サマリー     | outputs/phase-12/system-spec-update-summary.md         | system spec 更新の実績                         |
| ドキュメント更新履歴         | outputs/phase-12/documentation-changelog.md            | 本 Phase での変更ファイルと変更内容の記録      |
| 未タスク検出レポート         | outputs/phase-12/unassigned-task-detection.md          | 未対応事項の一覧（0件でも出力）                |
| スキルフィードバックレポート | outputs/phase-12/skill-feedback-report.md              | スキル・プロセス改善提案（改善点なしでも出力） |
| Phase 12 準拠チェック        | outputs/phase-12/phase12-task-spec-compliance-check.md | 最終集約判定                                   |

---

## 統合テスト連携

Phase 12 では以下の統合テスト連携アクションを実行する:

1. **ドキュメントと実装の整合性確認**: 実装ガイドの TypeScript 型定義・使用例が実際の `SkillCreatorService.ts` の実装と一致していることを確認する。
2. **未タスク検出の統合視点**: 統合テストで明らかになった問題点（LLM接続の挙動等）を未タスク検出レポートに反映する。
3. **フィードバックの記録**: 統合テストのプロセスで得られた知見をスキルフィードバックレポートに含める。

---

## 完了条件

- [x] Task 1 Part 1（中学生レベル説明）が `outputs/phase-12/implementation-guide.md` に記録されている
- [x] Task 1 Part 2（技術者レベル説明）が同ファイルに記録されている（型定義・使用例・エラーハンドリング含む）
- [x] Task 1 Part 2 に「視覚証跡: UI/UX変更なしのため Phase 11 スクリーンショット不要」が明記されている
- [x] Task 2 Step 1-A〜1-C が完了し、`index.md` のステータスが更新されている
- [x] Task 3 ドキュメント更新履歴が `outputs/phase-12/documentation-changelog.md` に記録されている
- [x] Task 4 未タスク検出レポートが `outputs/phase-12/unassigned-task-detection.md` に出力されている（0件でも）
- [x] Task 5 スキルフィードバックレポートが `outputs/phase-12/skill-feedback-report.md` に出力されている（改善点なしでも）
