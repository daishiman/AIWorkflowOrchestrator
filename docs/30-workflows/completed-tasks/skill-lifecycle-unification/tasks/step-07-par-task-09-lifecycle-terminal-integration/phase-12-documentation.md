# Phase 12 ドキュメント - SkillLifecyclePanel Terminal 統合

## メタ情報

| 項目       | 内容                                                                                                                                                                                                                                                                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-LIFECYCLE-TERMINAL-INTEGRATION-001                                                                                                                                                                                                                                                                                                        |
| Phase      | 12 - ドキュメント                                                                                                                                                                                                                                                                                                                                  |
| ステータス | 未着手                                                                                                                                                                                                                                                                                                                                             |
| 前提 Phase | Phase 11 完了（手動テスト PASS 確認済み）                                                                                                                                                                                                                                                                                                          |
| 成果物     | `outputs/phase-12/implementation-guide.md`、`outputs/phase-12/component-documentation.md`、`outputs/phase-12/system-spec-update-summary.md`、`outputs/phase-12/documentation-changelog.md`、`outputs/phase-12/unassigned-task-detection.md`、`outputs/phase-12/skill-feedback-report.md`、`outputs/phase-12/phase12-task-spec-compliance-check.md` |
| 次 Phase   | Phase 13 完了                                                                                                                                                                                                                                                                                                                                      |

## サブタスク管理

本 Phase をサブエージェントに委譲する場合、以下のルールを厳守すること。

- 更新対象が 4 ファイル以上の場合はサブエージェントを複数に分割し、各エージェントの更新対象を 3 ファイル以下に制限する（P43 対策）
- サブエージェントの完了報告を待ってから、メインエージェントが成果物の存在を `ls` / `git diff --stat` で検証する
- documentation-changelog.md は全 Task 完了後に1つのエージェントが一括作成する（P59 対策）

## 目的

本 Phase では以下の3点を達成する。

1. **実装ガイド作成**: 中学生レベルの概念説明（Part 1）と開発者向け実装詳細（Part 2）を作成し、後続開発者が本タスクの成果物を安全に活用・拡張できるようにする
2. **システム仕様書更新**: `ui-ux-realization.md`・`LOGS.md`・`SKILL.md`・IPC チャンネル一覧を更新し、仕様書と実装の乖離を解消する（P26: 更新遅延禁止）
3. **未タスク検出**: 本実装で解消しきれなかった課題・将来の拡張点を明示的にタスク化する（0件でも必須）

## 実行タスク

### Task 12-1: 実装ガイド作成

#### Part 1 - 中学生レベル概念説明（`outputs/phase-12/implementation-guide.md` 前半部）

以下のアナロジーを使って Terminal 統合の概念を説明する。

**「スキルを Terminal に渡す」とは何か**

> 学校の先生（AI）に宿題を頼む代わりに、自分のノート（Terminal）に「ここまでやった・次はこれをやる」と書いて渡す作業に似ている。先生に口頭で伝えるより、ノートに書いてあるほうが正確に伝わる。

- **SkillLifecyclePanel**（作業デスク）: スキルの一生（作る・動かす・改善する）を管理する机の上のパネル
- **Terminal**（専門の道具箱）: エンジニアが実際のコマンドを打つ黒い画面。作業指示書をここに渡すと、そのまま実行できる
- **TerminalHandoffCard**（引き継ぎカード）: 「次にこのコマンドを実行してください」という付箋カード。デスク上に表示される
- **Handoff（引き渡し）**: スキル操作の文脈と次のコマンドをまとめて Terminal に引き渡すこと

**3つの渡し方（TH-01 / TH-02 / TH-03）**

```
[スキルを作る (create)]
  → 設計書（prompt bundle）と背景情報（context summary）と一緒に渡す
  → カードには「Terminal で実行する」ボタンが付く（TH-01）

[スキルを動かす (execute)]
  → 「このコマンドは自動で実行しません。自分で確認してから実行してください」と明記して渡す（TH-02）

[スキルを改善する (improve)]
  → 前回の改善結果のまとめ（improvementSummary）を添えて渡す（TH-03）
  → 例：「前回の改善点：エラーハンドリングを追加、ログを整理」
```

**Terminal ボタン（TH-04）**

> どの作業状態でも、デスクの右上に必ず「Terminal」ボタンが表示される。このボタンを押すと、今の作業状態に応じた引き継ぎカードが表示される。

---

#### Part 2 - 開発者向け実装詳細（`outputs/phase-12/implementation-guide.md` 後半部）

以下の4点を記録する。

**1. Terminal ボタンの追加方法**

`SkillLifecyclePanel.tsx` の `flex flex-wrap gap-2` ボタン群（L419-435）の右端（「一覧へ戻る」ボタンの右側、ボタン群の最右端）に追加する。

```tsx
<button
  data-testid="skill-lifecycle-open-terminal"
  className={lifecycleButtonStyles.subtle}
  onClick={() => {
    // 現在の lifecycle フェーズに応じた HandoffGuidance を構築して setHandoffGuidance() でセット
    // Renderer 側でのインライン組み立て、または IPC skill:buildImprovementHandoff 経由
  }}
>
  Terminal
</button>
```

**2. TerminalHandoffCard の props マッピング表**

| TerminalHandoffCard props  | 供給元                                           |
| -------------------------- | ------------------------------------------------ |
| `guidance.terminalCommand` | `handoffGuidance.terminalCommand`                |
| `guidance.contextSummary`  | `handoffGuidance.contextSummary`                 |
| `guidance.reason`          | `handoffGuidance.reason`                         |
| `onCopyCommand`            | `navigator.clipboard.writeText(terminalCommand)` |
| `onDismiss`                | `clearHandoffGuidance()`                         |

表示条件: `useHandoffGuidance()` が `null` でない場合のみ表示する。

**3. buildForSkillImprovement() インターフェースと使用例**

```typescript
export interface SkillImprovementHandoffRequest {
  skillName?: string;
  skillId?: string;
  prompt?: string;
  workingDirectory?: string;
  improvementSummary?: string;  // 前回改善結果の要約
  improvementCount?: number;    // 改善提案件数
}

buildForSkillImprovement(
  request: SkillImprovementHandoffRequest,
  reason: string,
): HandoffGuidance

// 使用例:
const guidance = builder.buildForSkillImprovement(
  {
    skillName: "my-skill",
    improvementSummary: "エラーハンドリングを追加",
    improvementCount: 3,
  },
  "improve→terminal handoff",
);
```

- `prompt` 省略時: `「{skillName}」の改善を続けてください。前回の改善点: {improvementSummary}` で自動生成
- `improvementSummary` が空の場合: `「{skillName}」の改善を続けてください（改善点{improvementCount}件）` で自動生成
- `contextSummary`: `surface=skill skill={skillToken} improve=true` 形式

**4. IPC ハンドラの登録パターン**

```typescript
// channels.ts
export const IPC_CHANNELS = {
  // ...既存チャンネル...
  SKILL_BUILD_IMPROVEMENT_HANDOFF: "skill:buildImprovementHandoff",
} as const;

// ハンドラ登録（DIP 準拠: インターフェース型で受け取る）
export function registerSkillImprovementHandoffHandler(
  builder: TerminalHandoffBuilderPort, // 具象クラスではなくインターフェース（P61対策）
): void {
  ipcMain.handle(
    IPC_CHANNELS.SKILL_BUILD_IMPROVEMENT_HANDOFF,
    async (
      _event,
      args: {
        skillName: string;
        improvementSummary: string;
        improvementCount: number;
        workingDirectory?: string;
      },
    ) => {
      // P42準拠 3段バリデーション
      if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "skillName must be a non-empty string",
          },
        };
      }
      // P42準拠 3段バリデーション（improvementSummary）
      if (
        typeof args?.improvementSummary !== "string" ||
        args.improvementSummary.trim() === ""
      ) {
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "improvementSummary must be a non-empty string",
          },
        };
      }
      const guidance = builder.buildForSkillImprovement(
        {
          skillName: args.skillName,
          improvementSummary: args.improvementSummary,
          improvementCount: args.improvementCount,
        },
        "improve→terminal handoff",
      );
      return { success: true, data: guidance };
    },
  );
}
```

---

#### コンポーネントドキュメント（`outputs/phase-12/component-documentation.md`）

以下を記録する。

**TerminalHandoffCard 統合の Props 一覧**

| Prop            | 型                | 必須 | 説明                                                              |
| --------------- | ----------------- | ---- | ----------------------------------------------------------------- |
| `guidance`      | `HandoffGuidance` | 必須 | `{ terminalCommand, contextSummary, reason }` の3フィールドを含む |
| `onCopyCommand` | `() => void`      | 必須 | コマンドをクリップボードにコピーするコールバック                  |
| `onDismiss`     | `() => void`      | 必須 | カードを閉じる（`clearHandoffGuidance()` を呼び出す）             |

**使用するセレクタ**

| セレクタ                    | 供給元                | 用途                                               |
| --------------------------- | --------------------- | -------------------------------------------------- |
| `useHandoffGuidance()`      | `store/index.ts` L805 | `HandoffGuidance \| null` を取得し、カード表示判定 |
| `useClearHandoffGuidance()` | `store/index.ts` L807 | `onDismiss` ハンドラとして使用                     |
| `useSetHandoffGuidance()`   | `store/index.ts` L809 | Terminal ボタンクリック時に guidance をセット      |

**イベントフロー図**

```
[ユーザー: Terminal ボタンをクリック]
          ↓
  useSetHandoffGuidance() を呼び出す
  （現在の lifecycle フェーズから HandoffGuidance を組み立て）
          ↓
  agentSlice.handoffGuidance が更新される
          ↓
  useHandoffGuidance() が null でなくなる
          ↓
  TerminalHandoffCard が SkillLifecyclePanel 内に表示される
          ↓
[ユーザー: コマンドをコピー / カードを閉じる]
  onCopyCommand: navigator.clipboard.writeText(terminalCommand)
  onDismiss: useClearHandoffGuidance() → handoffGuidance が null に戻る
```

---

### Task 12-2: システム仕様書更新（spec-update-workflow.md 準拠）

**注意**: P43 対策として、更新対象が4ファイル以上の場合はサブエージェントを複数に分割し、各エージェントの更新対象を3ファイル以下に制限する。

#### Step 1-A: タスク完了記録

更新対象ファイル（優先順）:

1. **`docs/30-workflows/skill-lifecycle-unification/ui-ux-realization.md`**
   - terminal handoff 統合完了の記録セクションを追加する
   - 解消済み GAP（C-02/C-03/C-07/D-02）を完了状態で記録する

2. **`aiworkflow-requirements/LOGS.md`**（`.claude/skills/aiworkflow-requirements/LOGS.md`）
   - TASK-IMP-LIFECYCLE-TERMINAL-INTEGRATION-001 の完了記録を追加する
   - 記録形式: `| 日付 | TASK-IMP-LIFECYCLE-TERMINAL-INTEGRATION-001 | 完了 | SkillLifecyclePanel Terminal 統合 |`

3. **`task-specification-creator/LOGS.md`**（`.claude/skills/task-specification-creator/LOGS.md`）
   - 上記と同内容を記録する（**P1/P25 対策: 2ファイル両方の更新が必須**）

4. **`aiworkflow-requirements/SKILL.md`**（`.claude/skills/aiworkflow-requirements/SKILL.md`）
   - 変更履歴テーブルに TASK-IMP-LIFECYCLE-TERMINAL-INTEGRATION-001 の完了を追加する（**P29 対策**）

5. **`task-specification-creator/SKILL.md`**（`.claude/skills/task-specification-creator/SKILL.md`）
   - 変更履歴テーブルに同内容を追加する

**サブエージェント分割例（P43 対策）**:

- エージェント A: ファイル 1-3（ui-ux-realization.md、aiworkflow-requirements/LOGS.md、task-specification-creator/LOGS.md）
- エージェント B: ファイル 4-5（aiworkflow-requirements/SKILL.md、task-specification-creator/SKILL.md）

#### Step 1-B: 実装状況テーブル更新

以下のファイルの IPC チャンネル一覧テーブルに `skill:buildImprovementHandoff` を追加する（該当テーブルが存在する場合のみ）:

- `security-api-electron.md` または `api-ipc-agent.md`（IPC ホワイトリスト管理テーブル）

記録内容:

| チャンネル                      | 方向            | 引数                                                                                                     | 戻り値                                                 | 実装状態 |
| ------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | -------- |
| `skill:buildImprovementHandoff` | Renderer → Main | `{ skillName: string; improvementSummary: string; improvementCount: number; workingDirectory?: string }` | `{ success: boolean; data?: HandoffGuidance; error? }` | 完了     |

#### Step 1-C: 関連タスクテーブル更新

以下のコマンドで関連仕様書を検索し、関連タスクテーブルを更新する:

```bash
grep -rn "TASK-IMP-LIFECYCLE-TERMINAL-INTEGRATION-001" .claude/skills/
```

検索結果のファイルそれぞれに対して:

- 完了タスクセクションが存在しない場合は追加する
- 関連タスクテーブルに完了日を記録する

#### Step 1-D: topic-map.md 再生成（**P2/P27 対策: 必須**）

以下のコマンドを実行する（セクション追加・更新・削除いずれが発生しても必ず実行する）:

```bash
cd /path/to/worktree
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

実行ログで `indexes/topic-map.md` と `indexes/keywords.json` の生成を確認する。

#### Step 2: システム仕様更新（IPC 契約変更があるため必須）

以下のファイルを更新する:

1. **`interfaces-agent-sdk-skill.md`**（`.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`）
   - `HandoffGuidance` 型の定義に `SkillImprovementHandoffRequest` を追加する
   - `buildForSkillImprovement()` メソッドシグネチャを記録する

2. **`security-api-electron.md`**（`.claude/skills/aiworkflow-requirements/references/security-api-electron.md`）
   - 新規チャンネル `skill:buildImprovementHandoff` をホワイトリストに追加する
   - P42 準拠バリデーション（skillName の3段バリデーション）が適用されていることを記録する

**注意**: 上記2ファイルが Step 1-A と合わせて4ファイル超になる場合は、サブエージェントを分割すること（P43 対策）。

#### Step 3: IPC 契約検証（IPC 修正タスクのため必須）

`ipc-contract-checklist.md` に従い以下を検証する:

- [ ] **Phase 1**: channels.ts に `SKILL_BUILD_IMPROVEMENT_HANDOFF: "skill:buildImprovementHandoff"` 定数が追加されている
- [ ] **Phase 2**: ハンドラ登録関数の引数型がインターフェース（P61 DIP 準拠）である
- [ ] **Phase 3**: Preload 側の `safeInvoke(IPC_CHANNELS.SKILL_BUILD_IMPROVEMENT_HANDOFF, ...)` がチャンネル定数を使用している（ハードコード文字列不使用）
- [ ] **Phase 4**: P42 準拠の3段バリデーション（`typeof === "string"` → `=== ""` → `.trim() === ""`）が skillName と improvementSummary の両方に適用されている
- [ ] **Phase 5**: ハンドラの引数名が実際に渡される値のセマンティクスと一致している（P45 対策: `skillName` が「名前」を表している）
- [ ] **Phase 6**: レスポンス形式が `{ success: boolean; data?: HandoffGuidance; error?: { code: string; message: string } }` の wrapper 形式で統一されている（P60 対策）

---

### Task 12-3: documentation-changelog.md 作成

**注意**:

- 各 Step の完了結果を「実行後に事後記録」する（実行前に「完了」と書かない: **P4/P51 対策**）
- 全 Step 完了後に `unassigned-task-detection.md` の検出件数と照合してから記録する（**P59 対策**）

`outputs/phase-12/documentation-changelog.md` に以下の形式で記録する:

```markdown
# documentation-changelog - TASK-IMP-LIFECYCLE-TERMINAL-INTEGRATION-001

## Task 12-1: 実装ガイド

- outputs/phase-12/implementation-guide.md: [作成済み / 未完了]
- outputs/phase-12/component-documentation.md: [作成済み / 未完了]

## Task 12-2 Step 1-A: タスク完了記録

- ui-ux-realization.md: [更新済み（変更内容要約）/ 未更新]
- aiworkflow-requirements/LOGS.md: [更新済み / 未更新] ← 必須
- task-specification-creator/LOGS.md: [更新済み / 未更新] ← 必須（P1/P25）
- aiworkflow-requirements/SKILL.md: [更新済み / 未更新] ← 必須（P29）
- task-specification-creator/SKILL.md: [更新済み / 未更新]

## Task 12-2 Step 1-B: 実装状況テーブル

- IPC チャンネル一覧への skill:buildImprovementHandoff 追加: [済 / 対象テーブル未発見]

## Task 12-2 Step 1-C: 関連タスクテーブル

- grep 実行結果: [N ファイルで参照を確認]
- 各ファイルの更新状況: [ファイル名: 更新済み / 不要]

## Task 12-2 Step 1-D: topic-map.md 再生成

- generate-index.js 実行: [実行済み（出力ログ要約）/ 未実行] ← 必須（P2/P27）

## Task 12-2 Step 2: システム仕様更新

- interfaces-agent-sdk-skill.md: [更新済み / 未更新]
- security-api-electron.md: [更新済み / 未更新]

## Task 12-2 Step 3: IPC 契約検証

- ipc-contract-checklist.md Phase 1-6: [全 PASS / 一部失敗（詳細）]

## Task 12-4: 未タスク検出

- 検出件数: [N 件]（unassigned-task-detection.md との照合済み）
- 0件の場合: 「未タスクなし」として unassigned-task-detection.md を作成済み

## Task 12-5: スキルフィードバック

- skill-feedback-report.md: [作成済み / 未完了]

## Task 12-6: 準拠チェック

- phase12-task-spec-compliance-check.md: [作成済み / 未完了]
- planned wording 確認: [0件確認済み / N件残存（詳細）]
```

---

### Task 12-4: 未タスク検出

`outputs/phase-12/unassigned-task-detection.md` を作成する（**0件でも必須**）。

検出対象（下記観点で調査する）:

1. Phase 10 最終レビューで MINOR 判定だった場合に作成された未タスク指示書が全て処理されているか
2. IPC 契約検証（Step 3）で指摘事項があった場合、それが実装に反映されているか、または未タスクとして記録されているか
3. TH-05（terminal transcript → chat 戻し）の実装スコープが本タスクに含まれているか確認する。未実装の場合は未タスクとして記録する
4. TerminalDock（D-02 GAP）が本タスクで完全に解消されたか確認する。未解消の場合は未タスクとして記録する

**未タスクを検出した場合の3ステップ（P3/P38 対策: 例外なし）**:

1. `docs/30-workflows/skill-lifecycle-unification/tasks/unassigned-task/` に指示書ファイルを作成する
   - ファイル名形式: `{UT-ID}-{task-name}.md`
2. `task-workflow.md` の残課題テーブルに登録する
3. 関連仕様書（`ui-ux-realization.md` 等）に参照リンクを追加する

**再評価クローズした未タスクの処理（P56 対策）**:

対応不要と判断した未タスクは、GitHub Issue が存在する場合 `gh issue close <number> --comment "再評価クローズ: <理由>"` で同時に Close する。

---

### Task 12-5: スキルフィードバックレポート作成

`outputs/phase-12/skill-feedback-report.md` を作成する（**改善点なしでも必須**）。

以下の観点で改善点を検討する:

| 観点             | 記録内容                               |
| ---------------- | -------------------------------------- |
| テンプレート改善 | Phase テンプレートの漏れや曖昧さ       |
| ワークフロー改善 | 機械検証や手順分岐の改善余地           |
| ドキュメント改善 | 再利用しやすい横断ガイドライン化の候補 |

特に以下の観点を確認する:

- terminal handoff 統合で発見した Phase テンプレートの不足（あれば具体的に記録）
- IPC ハンドラ追加時のワークフロー改善点（P42/P55/P60/P61 の適用で学んだこと）
- buildForSkillImprovement() パターンの他タスクへの再利用可能性

---

### Task 12-6: Phase 12 タスク仕様準拠チェック

`outputs/phase-12/phase12-task-spec-compliance-check.md` を作成する。

Task 12-1〜12-5 の全タスクについて、以下の判定を1ファイルに集約する:

| Task | 判定項目                                                                                                               | 結果          |
| ---- | ---------------------------------------------------------------------------------------------------------------------- | ------------- |
| 12-1 | implementation-guide.md Part 1 (日常例え・理由先行)                                                                    | PASS/FAIL     |
| 12-1 | implementation-guide.md Part 2 (TypeScript型・APIシグネチャ・使用例・エラーハンドリング・エッジケース・設定と定数一覧) | PASS/FAIL     |
| 12-2 | Step 1-A (5ファイル更新: ui-ux-realization + LOGS x2 + SKILL x2)                                                       | PASS/FAIL     |
| 12-2 | Step 1-B (実装状況テーブル)                                                                                            | PASS/FAIL/N/A |
| 12-2 | Step 1-C (関連タスクテーブル)                                                                                          | PASS/FAIL     |
| 12-2 | Step 1-D (topic-map.md 再生成)                                                                                         | PASS/FAIL     |
| 12-2 | Step 2 (システム仕様更新)                                                                                              | PASS/FAIL/N/A |
| 12-2 | Step 3 (IPC 契約検証)                                                                                                  | PASS/FAIL/N/A |
| 12-3 | documentation-changelog.md (全Step事後記録・件数照合)                                                                  | PASS/FAIL     |
| 12-4 | unassigned-task-detection.md (0件でも必須・3ステップ)                                                                  | PASS/FAIL     |
| 12-5 | skill-feedback-report.md (改善点なしでも必須)                                                                          | PASS/FAIL     |

### planned wording 確認コマンド

Phase 12 完了前に、成果物に「予定」「計画中」「PRマージ後に実施」等の planned wording が残っていないことを確認する:

```bash
grep -rn "予定\|計画中\|PRマージ後\|実施予定\|後日" outputs/phase-12/
```

上記コマンドの出力が 0 件であることを確認する（P57 対策: 設計タスクでのシステム仕様書更新先送り禁止）。

---

## 参照資料

| 資料                          | パス                                                                                             | 参照目的                         |
| ----------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------- |
| Phase 11 成果物               | `outputs/phase-11/`                                                                              | 手動テスト結果の確認             |
| UI/UX 正本                    | `docs/30-workflows/skill-lifecycle-unification/ui-ux-realization.md`                             | terminal handoff 5契約の最終確認 |
| IPC 契約チェックリスト        | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                    | Step 3 の検証基準                |
| システム仕様更新ワークフロー  | `.claude/skills/aiworkflow-requirements/references/spec-update-workflow.md`                      | Step 1-A〜1-D の手順参照         |
| インデックス生成スクリプト    | `.claude/skills/aiworkflow-requirements/scripts/generate-index.js`                               | topic-map.md 再生成              |
| 既知の落とし穴                | `.claude/rules/06-known-pitfalls.md` P1/P2/P3/P4/P25/P27/P29/P38/P43/P45/P51/P56/P57/P59/P60/P61 | Phase 12 インシデント防止        |
| IPC セキュリティルール        | `.claude/rules/04-electron-security.md`                                                          | チャンネルホワイトリスト管理確認 |
| interfaces-agent-sdk-skill.md | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                | HandoffGuidance 型定義の更新先   |
| security-api-electron.md      | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                     | IPC ホワイトリストの更新先       |

## 実行手順

以下の Step 番号順に逐次実行する。並列実行は **Task 12-1 と Task 12-4 の調査フェーズのみ** とする。

1. **Task 12-1 着手**: Phase 11 成果物を確認してから実装ガイド Part 1（アナロジー説明）を執筆する
2. **Task 12-1 継続**: 実装ガイド Part 2（コードレベル説明）とコンポーネントドキュメントを執筆する
3. **Task 12-4 調査**: 未タスク候補をリストアップする（まだファイル作成しない）
4. **Task 12-2 Step 1-A 実行**: ui-ux-realization.md → aiworkflow-requirements/LOGS.md → task-specification-creator/LOGS.md の順に更新する（P43 対策: 4ファイル以上の場合はサブエージェント分割）
5. **Task 12-2 Step 1-A 継続**: aiworkflow-requirements/SKILL.md → task-specification-creator/SKILL.md を更新する
6. **Task 12-2 Step 1-B 実行**: IPC チャンネル一覧テーブルへの追加を実施する
7. **Task 12-2 Step 1-C 実行**: `grep -rn "TASK-IMP-LIFECYCLE-TERMINAL-INTEGRATION-001" .claude/skills/` で関連仕様書を検索して更新する
8. **Task 12-2 Step 1-D 実行**: `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行する（**必須、スキップ禁止**）
9. **Task 12-2 Step 2 実行**: interfaces-agent-sdk-skill.md と security-api-electron.md を更新する
10. **Task 12-2 Step 3 実行**: IPC 契約検証チェックリスト Phase 1-6 を実施する
11. **Task 12-4 完了**: 未タスク候補を3ステップで処理し、`unassigned-task-detection.md` を作成する
12. **Task 12-3 実行**: 全 Step の完了を確認した後（**P4/P51 対策**）、`documentation-changelog.md` を作成する。`unassigned-task-detection.md` の検出件数と照合する（**P59 対策**）

## 成果物

| 成果物                                | パス                                                     | 完了条件                                                             |
| ------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------- |
| implementation-guide.md               | `outputs/phase-12/implementation-guide.md`               | Part 1（アナロジー）と Part 2（コードレベル）の両方が記述されている  |
| component-documentation.md            | `outputs/phase-12/component-documentation.md`            | Props 一覧・セレクタ一覧・イベントフロー図が記述されている           |
| system-spec-update-summary.md         | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A〜Step 2 の実更新結果が記録されている                        |
| documentation-changelog.md            | `outputs/phase-12/documentation-changelog.md`            | 全 Step の完了結果が事後記録されており、未タスク件数と照合済みである |
| unassigned-task-detection.md          | `outputs/phase-12/unassigned-task-detection.md`          | 0件の場合も含め必ず作成されている                                    |
| skill-feedback-report.md              | `outputs/phase-12/skill-feedback-report.md`              | 改善点なしの場合も含め必ず作成されている                             |
| phase12-task-spec-compliance-check.md | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-5 の全判定が記録されている                             |

## タスク100%実行確認【必須】

本 Phase の全タスクを完全に実行したことを確認する。

- [ ] 上記「実行タスク」セクションの全タスク（Task 12-1〜12-6）を実行した
- [ ] 7つの必須成果物が全て `outputs/phase-12/` に存在する
- [ ] planned wording 確認コマンドの出力が 0 件である

## 統合テスト連携

本 Phase のドキュメント成果物は、Phase 13 の PR 準備で参照される。

- implementation-guide.md の Part 1/2 が Phase 13 の PR 本文に含まれるサマリーの根拠となる
- system-spec-update-summary.md の更新内容が Phase 13 の変更一覧に反映される
- unassigned-task-detection.md の検出件数が Phase 13 の「残課題」セクションに記録される

## 多角的チェック観点

| 観点            | 確認内容                                                                                            |
| --------------- | --------------------------------------------------------------------------------------------------- |
| Part 1 品質     | 日常例え・専門用語回避・理由先行説明が含まれているか                                                |
| Part 2 完全性   | TypeScript型定義・APIシグネチャ・使用例・エラーハンドリング・エッジケース・設定一覧が含まれているか |
| 仕様同期        | LOGS.md 2ファイル + SKILL.md 2ファイルの全4ファイルが更新されているか                               |
| 未タスク完全性  | 0 件でもレポートが作成されているか。P3 の3ステップが完了しているか                                  |
| planned wording | 成果物に「予定」「計画」等の未実行文言が残っていないこと                                            |

## 完了条件チェックリスト

### Task 12-1（実装ガイド）

- [ ] `outputs/phase-12/implementation-guide.md` が作成されている
- [ ] Part 1 に「作業デスク」「専門の道具箱」「引き継ぎカード」のアナロジーが含まれている
- [ ] Part 1 に create/execute/improve の3つの渡し方（TH-01/TH-02/TH-03）の違いが説明されている
- [ ] Part 2 に Terminal ボタン追加のコード例が記述されている
- [ ] Part 2 に TerminalHandoffCard の props マッピング表が記述されている
- [ ] Part 2 に `buildForSkillImprovement()` のインターフェースと使用例が記述されている
- [ ] Part 2 に IPC ハンドラの登録パターン（DIP 準拠・P42 準拠）が記述されている
- [ ] `outputs/phase-12/component-documentation.md` が作成されている
- [ ] Props 一覧・セレクタ一覧（useHandoffGuidance/useClearHandoffGuidance/useSetHandoffGuidance）・イベントフロー図が記述されている

### Task 12-2 Step 1-A（タスク完了記録）

- [ ] `ui-ux-realization.md` に terminal handoff 統合完了記録が追加されている
- [ ] `aiworkflow-requirements/LOGS.md` に TASK-IMP-LIFECYCLE-TERMINAL-INTEGRATION-001 の完了記録が追加されている（**P1/P25 必須**）
- [ ] `task-specification-creator/LOGS.md` に同内容が追加されている（**P1/P25 必須 - 2ファイル目**）
- [ ] `aiworkflow-requirements/SKILL.md` の変更履歴テーブルが更新されている（**P29 必須**）
- [ ] `task-specification-creator/SKILL.md` の変更履歴テーブルが更新されている

### Task 12-2 Step 1-B〜1-D

- [ ] IPC チャンネル一覧テーブルに `skill:buildImprovementHandoff` が追加されている（対象テーブルが存在する場合）
- [ ] `grep -rn "TASK-IMP-LIFECYCLE-TERMINAL-INTEGRATION-001" .claude/skills/` を実行し、関連仕様書を確認した
- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行し、`indexes/topic-map.md` と `indexes/keywords.json` が再生成されている（**P2/P27 必須**）

### Task 12-2 Step 2（システム仕様更新）

- [ ] `interfaces-agent-sdk-skill.md` に `SkillImprovementHandoffRequest` と `buildForSkillImprovement()` が追加されている
- [ ] `security-api-electron.md` に `skill:buildImprovementHandoff` チャンネルがホワイトリストに追加されている

### Task 12-2 Step 3（IPC 契約検証）

- [ ] channels.ts に `SKILL_BUILD_IMPROVEMENT_HANDOFF` 定数が存在する
- [ ] ハンドラ登録関数の引数型がインターフェース（DIP 準拠: P61）である
- [ ] skillName に P42 準拠の3段バリデーション（`trim() === ""`）が適用されている
- [ ] ハンドラの引数名が実際の値のセマンティクスと一致している（P45）
- [ ] レスポンスが `{ success: boolean; data?; error? }` の wrapper 形式である（P60）

### Task 12-3（documentation-changelog）

- [ ] `outputs/phase-12/documentation-changelog.md` が作成されている
- [ ] 全 Step の完了後に作成されている（実行前に「完了」と記載されていない: P4/P51 対策）
- [ ] `unassigned-task-detection.md` の検出件数と照合済みである（P59 対策）

### Task 12-4（未タスク検出）

- [ ] `outputs/phase-12/unassigned-task-detection.md` が作成されている（0件でも必須）
- [ ] 未タスクが検出された場合、`docs/30-workflows/skill-lifecycle-unification/tasks/unassigned-task/` に指示書ファイルが作成されている（P3/P38 対策）
- [ ] 未タスクが検出された場合、`task-workflow.md` の残課題テーブルに登録されている
- [ ] 未タスクが検出された場合、関連仕様書に参照リンクが追加されている
- [ ] 再評価クローズした未タスクの GitHub Issue が Close されている（P56 対策）

### Task 12-5（スキルフィードバック）

- [ ] `outputs/phase-12/skill-feedback-report.md` が作成されている（改善点なしでも必須）
- [ ] テンプレート改善・ワークフロー改善・ドキュメント改善の3観点が検討されている

### Task 12-6（準拠チェック）

- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md` が作成されている
- [ ] Task 12-1〜12-5 の全判定が PASS/FAIL/N/A で記録されている
- [ ] `grep -rn "予定\|計画中\|PRマージ後\|実施予定\|後日" outputs/phase-12/` の出力が 0 件である（P57 対策）

## 次 Phase

Phase 13 完了 (`phase-13-completion.md`)

- 入力: `outputs/phase-12/` 配下の全成果物、上記完了条件チェックリストが全て完了していること
- 目的: 成果物最終確認・PR 準備
