# Phase 12: ドキュメント

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | UT-RUNTIME-BUILDER-MIGRATION-001            |
| Phase      | 12 - ドキュメント                           |
| 依存成果物 | `phase-11-manual-test.md`（手動テスト完了） |
| 正本ルール | `spec-update-workflow.md`                   |

## 目的

`TerminalHandoffBuilder.buildForSurface()` の実装内容をドキュメント化し、システム仕様書を最新状態に更新する。
未タスクを検出・管理し、後続作業を適切にトラッキングする。

## 実行タスク

### Task 1: 実装ガイド

**成果物パス**: `outputs/phase-12/implementation-guide.md`

#### Part 1: 中学生レベル概念説明（日常例え必須）

**「統一窓口」の例え**:

市役所には、住民票の発行窓口、転入届の受付窓口、税金の支払い窓口など、用件ごとに別々の窓口があることがあります。しかし、最近は「総合窓口」として1つの窓口で全ての用件を受け付けてくれる市役所が増えています。

`TerminalHandoffBuilder.buildForSurface()` はまさにこの「総合窓口」です。

以前は:

- チャット編集用の窓口（`build()`）
- エージェント実行用の窓口（`buildForAgentExecution()`）
- スキル実行用の窓口（`buildForSkillExecution()`）

のように、用途ごとに別々のメソッドを呼び分ける必要がありました。

`buildForSurface()` に統一することで:

- 「どの窓口に行けばいいか」を考えなくてよくなった
- 新しい種類の handoff が追加されても、同じ窓口で対応できる
- 窓口の内部ルールが変わっても、利用者は影響を受けない

という利点があります。`surfaceType` パラメータに「chat-edit」「runtime」「skill-docs」のいずれかを渡すだけで、適切な `HandoffGuidance` が返ってきます。

#### Part 2: 開発者向け実装詳細

**変更概要**:

`TerminalHandoffBuilder` に `buildForSurface(request: BuildForSurfaceRequest, reason: HandoffGuidance["reason"]): HandoffGuidance` メソッドを追加。
旧メソッド（`build`, `buildForAgentExecution`, `buildForSkillExecution`）には `@deprecated` タグを付与し、内部実装を `buildForSurface()` に委譲。

**インターフェース**:

```typescript
type SurfaceType = "chat-edit" | "runtime" | "skill-docs";
type BuildForSurfaceRequest =
  | ChatEditSurfaceRequest
  | RuntimeSurfaceRequest
  | SkillDocsSurfaceRequest;
// 各インターフェース詳細は phase-2-design.md Section 1.2 参照

// HandoffGuidance（packages/shared/src/types/handoff.ts 正本）
interface HandoffGuidance {
  terminalCommand: string;
  contextSummary: string;
  reason: string;
}
```

**移行対応ファイル**:

| ファイル                              | 変更内容                                                                                                      |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `runtime/TerminalHandoffBuilder.ts`   | `buildForSurface()` メソッド追加、旧メソッドに `@deprecated` 付与                                             |
| `chatEditHandlers.ts`                 | `build()` → `buildForSurface({ surfaceType: 'chat-edit', ... }, reason)`                                      |
| `agentHandlers.ts`                    | `buildForAgentExecution()` → `buildForSurface({ surfaceType: 'runtime', runtimeType: 'agent', ... }, reason)` |
| `skillHandlers.ts`                    | `buildForSkillExecution()` → `buildForSurface({ surfaceType: 'runtime', runtimeType: 'skill', ... }, reason)` |
| `RuntimeSkillCreatorFacade.ts`        | `terminal_handoff` 分岐で `buildForSurface()` を使用                                                          |
| `chat-edit/TerminalHandoffBuilder.ts` | `buildForSurface()` の型定義を共有するよう修正                                                                |

**テスト構成**:

- `TerminalHandoffBuilder.test.ts` に `buildForSurface()` のユニットテスト 16 件を追加
- 各 surface のコンテキストマッピング、セキュリティ検証（API キー非漏洩・特殊文字サニタイズ）を網羅

---

### Task 2: システム仕様書更新

> `spec-update-workflow.md` 準拠。P1/P25/P26/P43 対策として、全 Step を順次確認してから changelog に記録する。

#### Step 1-A: タスク完了記録

以下のファイルを更新する:

1. **`llm-workspace-chat-edit.md`**: `TerminalHandoffBuilder` セクションに以下を追記する
   - `buildForSurface()` メソッドの追加（UT-RUNTIME-BUILDER-MIGRATION-001 完了）
   - 旧メソッドの `@deprecated` ステータス

2. **`aiworkflow-requirements/LOGS.md`**: タスク完了エントリを追加する

   ```
   | UT-RUNTIME-BUILDER-MIGRATION-001 | TerminalHandoffBuilder buildForSurface() 統一 | 完了 | YYYY-MM-DD |
   ```

3. **`task-specification-creator/LOGS.md`**: 同上のエントリを追加する（**P1/P25 対策: 2ファイル両方必須**）

4. **`aiworkflow-requirements/SKILL.md`**: 変更履歴テーブルに追記する（P29 対策）

5. **`task-specification-creator/SKILL.md`**: 変更履歴テーブルに追記する（P29 対策）

#### Step 1-B: 実装状況テーブル更新

該当する API/IPC 仕様書に実装ステータスが記載されている場合は更新する。

確認コマンド:

```bash
grep -rn "TerminalHandoffBuilder\|buildForSurface" .claude/skills/aiworkflow-requirements/references/
```

#### Step 1-C: 関連タスクテーブル更新

```bash
grep -rn "UT-RUNTIME-BUILDER-MIGRATION-001" .claude/skills/aiworkflow-requirements/references/
```

検索結果を確認し、言及している全仕様書の関連タスクテーブルを更新する。

#### Step 1-D: topic-map.md 再生成

仕様書に変更があれば（セクション追加・削除・更新を含む）、必ず再生成する（P2/P27 対策）。

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

実行後、`indexes/topic-map.md` と `indexes/keywords.json` が更新されていることを確認する。

ミラー同期も実施する（P2 対策）:

```bash
rsync -avz --checksum ./.claude/skills/ ./.agents/skills/
diff -qr ./.claude/skills/ ./.agents/skills/
```

---

### Task 3: documentation-changelog.md

**成果物パス**: `outputs/phase-12/documentation-changelog.md`

> **重要（P4/P43/P51 対策）**: 全 Step 完了後に事後記録する。実行前に「完了」と記載しない。

記録すべき内容:

- Step 1-A: 更新した各ファイル名と変更内容の概要
- Step 1-B: 実装状況テーブル更新の有無と結果
- Step 1-C: 関連仕様書の検索結果（ヒット数・更新ファイル数）
- Step 1-D: topic-map.md 再生成の実行ログ、ミラー同期の差分確認結果（0差分であること）
- Task 3 未タスク件数と各未タスクの対応状況

---

### Task 4: 未タスク検出

**成果物パス**: `outputs/phase-12/unassigned-task-detection.md`

> **注意（P3/P38/P58 対策）**: 0件でも `unassigned-task-detection.md` の作成は必須。検出した未タスクは3ステップで管理する。

#### 事前検出済み未タスク

Phase 3 設計レビューで検出された MINOR 指摘を未タスク化する:

**MINOR-1: chat-edit/TerminalHandoffBuilder.ts 削除**

- 内容: `chat-edit/TerminalHandoffBuilder.ts` が `runtime/TerminalHandoffBuilder.ts` と重複している。将来的には削除またはリダイレクトすべき
- 優先度: 低（既存動作に影響なし）
- 指示書パス: `docs/30-workflows/unassigned-task/UT-RUNTIME-BUILDER-DELETE-CHAT-EDIT-001.md`

**MINOR-2: RuntimeSkillCreatorFacade 戻り値型波及**

- 内容: `RuntimeSkillCreatorFacade.plan()` の戻り値型が `HandoffGuidance` 変更に追従できていない箇所がある可能性
- 優先度: 中（型安全性に関わる）
- 指示書パス: `docs/30-workflows/unassigned-task/UT-RUNTIME-FACADE-RETURN-TYPE-001.md`

#### 未タスク管理 3ステップ（P3/P38/P58 対策: 全ステップ必須）

各未タスクについて以下の3ステップを全て完了させる:

**ステップ 1**: `docs/30-workflows/unassigned-task/` に指示書ファイルを作成する

**ステップ 2**: `docs/30-workflows/task-workflow.md` の残課題テーブルに登録する

**ステップ 3**: 関連仕様書（`llm-workspace-chat-edit.md` 等）に参照リンクを追加する

#### 再評価クローズ時の注意（P56 対策）

未タスクを再評価クローズする場合は、対応する GitHub Issue を `gh issue close` で同時に Close する。

---

### Task 5: スキルフィードバックレポート

**成果物パス**: `outputs/phase-12/skill-feedback-report.md`

> **必須（P28 対策）**: 改善点がなくても「改善点なし」としてレポートを作成する。

記録すべき内容:

- task-specification-creator skill の改善点（Phase生成フォーマットの改善提案があれば）
- aiworkflow-requirements skill の改善点（参照資料の過不足があれば）
- ワークフロー改善点（Phase間トレーサビリティの改善があれば）

---

## 参照資料

- `spec-update-workflow.md` - システム仕様書更新手順
- `.claude/rules/05-task-execution.md` - Phase 12 チェックリスト
- `.claude/rules/06-known-pitfalls.md#P1,P3,P4,P25,P26,P29,P38,P43,P51,P56,P58,P59` - 関連する既知の落とし穴

## 成果物

- `outputs/phase-12/implementation-guide.md`
- `outputs/phase-12/documentation-changelog.md`
- `outputs/phase-12/unassigned-task-detection.md`
- `outputs/phase-12/skill-feedback-report.md`
- `docs/30-workflows/unassigned-task/UT-RUNTIME-BUILDER-DELETE-CHAT-EDIT-001.md`
- `docs/30-workflows/unassigned-task/UT-RUNTIME-FACADE-RETURN-TYPE-001.md`

## 完了条件

- [ ] `implementation-guide.md` の Part 1（日常例え必須）と Part 2（実装詳細）が作成されている
- [ ] Step 1-A: 5ファイル（llm-workspace-chat-edit.md, LOGS.md 2件, SKILL.md 2件）が更新されている（P1/P25/P29 対策）
- [ ] Step 1-B: 実装状況テーブルの更新要否が確認されている
- [ ] Step 1-C: 関連仕様書の検索・更新が完了している
- [ ] Step 1-D: `node generate-index.js` が実行され、`diff -qr` で 0 差分が確認されている（P2/P27 対策）
- [ ] `documentation-changelog.md` が全 Step 完了後に事後記録されている（P4/P43/P51 対策）
- [ ] `unassigned-task-detection.md` が作成されている（0件でも必須）
- [ ] MINOR-1 と MINOR-2 が3ステップ（指示書作成 → task-workflow 登録 → 仕様書リンク）で管理されている（P3/P38/P58 対策）
- [ ] documentation-changelog の未タスク件数が `unassigned-task-detection.md` と一致している（P59 対策）
- [ ] Task 5: skill-feedback-report.md が作成されている（改善点なしでも必須）

## 次 Phase

Phase 13: 完了 (`phase-13-completion.md`)

---

## 統合テスト連携

Phase 11 の手動テスト結果を参照し、全テスト（単体+統合）が PASS していることをドキュメント化作業の前提として確認する。

---

## 多角的チェック観点

| 観点         | 確認内容                                                                       | 対応 Task       |
| ------------ | ------------------------------------------------------------------------------ | --------------- |
| API設計      | buildForSurface() のシグネチャが implementation-guide に正確に記載されているか | Task 1          |
| 仕様書整合性 | surfaceType 3値の説明が llm-workspace-chat-edit.md に反映されているか          | Task 2 Step 1-A |
| 未タスク管理 | MINOR-1/MINOR-2 が3ステップで管理されているか                                  | Task 4          |

---

## サブタスク管理

- [ ] Task 1（実装ガイド）を完了する
- [ ] Task 2（システム仕様書更新）を完了する
- [ ] Task 3（documentation-changelog）を全 Step 完了後に事後記録する
- [ ] Task 4（未タスク検出）を完了する
- [ ] Task 5（スキルフィードバックレポート）を作成する
