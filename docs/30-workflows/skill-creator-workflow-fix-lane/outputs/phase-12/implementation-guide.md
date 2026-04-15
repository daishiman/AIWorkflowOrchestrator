# 実装ガイド - skill-creator-workflow-fix-lane

> Phase 12 成果物: Part 1（初学者向け）と Part 2（開発者向け）の2パート構成

---

## Part 1: 中学生レベルの概念説明

### このPRで何が変わるの？

このPRには2種類の変更が含まれています。

---

### 変更1: スケジュール設定画面のUI改善（ConversationRoundStep.tsx）

**日常生活での例え話**:

スキルウィザードの「定期実行」設定で、これまでは「0 9 \* \* 1-5」のような
**暗号みたいな文字列**を手入力する必要がありました。

今回の修正で、**ビジュアルなCronピッカー**（`VisualCronPicker`）が導入されました。
たとえば時計のダイヤルのように、「毎週月曜〜金曜の9時に実行」を
ボタンをクリックするだけで設定できるようになります。

**なぜ必要か**:

cron式（`0 9 * * 1-5`）はエンジニアでないと読めません。
UIを使ってわかりやすく設定できるようにすることで、
誰でもスケジュール付きスキルを作れるようになります。

---

### 変更2: SkillCreatorService の2つのバグ修正（タスク仕様書）

このPRにはバグ修正の**設計書（タスク仕様書）**も含まれています。
実装はこの後のPRで行います。

**バグ1: TASK-SC-FIX-GENERATE-SKILL-MD-001**

`generate_skill_md.js` は「設計図（plan JSON）」を受け取ってSKILL.mdを書き出すスクリプトです。
ちょうど「工場に材料を渡し忘れていた」状態で、
スクリプトは常に失敗し、フォールバックのみが動作していました。

修正後は正しく材料（`--plan`/`--output`引数）を渡せるようになり、
SKILL.mdが正常に生成されます。

**バグ2: TASK-SC-IMP-CREATE-WORKFLOW-001**

`runCreateWorkflow` は「スキルを作るときの準備をする係」ですが、
今まではこの係が「何もしない」空実装でした。

修正後は「agentファイルというレシピを読んで、スキルの設計図を作る」ようになります。
ちょうど「料理人が料理を始める前にレシピを確認する」ようなイメージです。

---

## Part 2: 開発者向け技術詳細

### 変更1: ConversationRoundStep.tsx — VisualCronPicker 統合

**変更ファイル**: `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`

**変更内容**:

- Q3（「定期実行」選択時）のスケジュール設定UIを変更
- 従来: `<input type="text">` によるcron式手入力 + `id="schedule-cron"` + aria属性
- 変更後: `<VisualCronPicker>` コンポーネントによるGUI設定
- レイアウトも `grid md:grid-cols-2` → `flex flex-col` に変更（ピッカーの縦長UIに適合）

**インターフェース**:

```tsx
<VisualCronPicker
  value={scheduleConfig?.cronExpression ?? ""}
  onChange={(cron) => handleCronChange(cron)}
/>
```

**削除された要素**:

- `<input id="schedule-cron" type="text" ...>` — テキスト入力フィールド
- `<p>例: 平日9時なら \`0 9 \* \* 1-5\`</p>` — ヘルプテキスト
- `aria-invalid`, `aria-describedby` 属性（VisualCronPicker側で制御）

**依存コンポーネント**: `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`

---

### 変更2: TASK-SC-FIX-GENERATE-SKILL-MD-001 タスク仕様書

**対象ファイル**: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`（行148-165）

**問題**: `generateSkillMd` が `["--path", skillDir]` を渡しているが、
スクリプトの仕様は `--plan <json>` と `--output <path>` が必須。

**修正方針**（Phase 5実装予定）:

```typescript
// planオブジェクトの最小構造
const plan = { name: string, description: string };
// tmpファイルにJSONシリアライズして書き込み
const tmpPath = uniqueTmpPath(); // UUID含む一意なパス
await fs.writeFile(tmpPath, JSON.stringify(plan));
// --plan / --output 引数で渡す
await scriptExecutor.execute("generate_skill_md.js", [
  "--plan",
  tmpPath,
  "--output",
  path.join(skillDir, "SKILL.md"),
]);
// finally節でtmpファイルを必ず削除（non-fatal）
await fs.unlink(tmpPath).catch(() => {});
```

**タスク仕様書パス**: `docs/30-workflows/skill-creator-workflow-fix-lane/TASK-SC-FIX-GENERATE-SKILL-MD-001/`

---

### 変更3: TASK-SC-IMP-CREATE-WORKFLOW-001 タスク仕様書

**対象ファイル**: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`（行574-577）

**問題**: `runCreateWorkflow` が空実装（`void options` のみ）。
`create` モードでLLMによるSKILL.md内容生成が行われない。

**修正方針**（Phase 5実装予定）:

```typescript
// 戻り型を void から StructurePlanJson | null に変更
private async runCreateWorkflow(options: CreateSkillOptions): Promise<StructurePlanJson | null> {
  try {
    const agent = await this.resourceLoader.loadAgent("extract-purpose");
    return buildStructurePlanJson(agent, options);
  } catch {
    return null; // フォールバック: nullを返してcreateSkillが続行
  }
}
```

**APIシグネチャ変更**:

- 旧: `runCreateWorkflow(options): Promise<void>`
- 新: `runCreateWorkflow(options): Promise<StructurePlanJson | null>`
- `createSkill()` 内で `const structurePlan = await this.runCreateWorkflow(options)` として受け取る

**タスク仕様書パス**: `docs/30-workflows/skill-creator-workflow-fix-lane/TASK-SC-IMP-CREATE-WORKFLOW-001/`

---

### 成果物一覧

| 成果物        | パス                                                                                   | 説明                             |
| ------------- | -------------------------------------------------------------------------------------- | -------------------------------- |
| UI変更        | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`          | VisualCronPicker統合             |
| タスク仕様書A | `docs/30-workflows/skill-creator-workflow-fix-lane/TASK-SC-FIX-GENERATE-SKILL-MD-001/` | generate_skill_md.js引数修正仕様 |
| タスク仕様書B | `docs/30-workflows/skill-creator-workflow-fix-lane/TASK-SC-IMP-CREATE-WORKFLOW-001/`   | runCreateWorkflow実装仕様        |
| レーン概要    | `docs/30-workflows/skill-creator-workflow-fix-lane/index.md`                           | 依存グラフ・実装順序             |

### 依存関係

```
TASK-SC-FIX-GENERATE-SKILL-MD-001  (先行・ブロッカー)
  ↓（完了後に着手）
TASK-SC-IMP-CREATE-WORKFLOW-001    (後続)
```

---

_生成日: 2026-04-14_
_対象ブランチ: docs/skill-creator-workflow-fix-task-specs_
