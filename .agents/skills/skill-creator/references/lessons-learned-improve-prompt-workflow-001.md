# Lessons Learned: Improve Prompt ワークフロー実装（TASK-SC-IMPROVE-PROMPT-IMPL-001）

`runImprovePromptWorkflow()` 実装時に得られた知見を記録する。

---

## L-IP-001: frontmatter 正規表現と保全パターン

### 問題

LLM に SKILL.md 全体を渡して改善させると、LLM が frontmatter（`---` ブロック）も書き換えてしまい、`name` / `description` / `allowed-tools` 等のメタデータが失われる。

### 解決パターン

```typescript
const SKILL_FRONTMATTER_PATTERN = /^---\n[\s\S]*?\n---\n?/;

private preserveOriginalFrontmatter(
  originalContent: string,
  improvedContent: string,
): string {
  const originalFrontmatter = originalContent.match(SKILL_FRONTMATTER_PATTERN);
  if (!originalFrontmatter) {
    return improvedContent;
  }
  const improvedWithoutFrontmatter = improvedContent.replace(
    SKILL_FRONTMATTER_PATTERN,
    "",
  );
  return `${originalFrontmatter[0]}${improvedWithoutFrontmatter}`;
}
```

### 要点

- 正規表現: `/^---\n[\s\S]*?\n---\n?/` — 先頭の `---` から最初の閉じ `---` まで（非貪欲）
- 元frontmatterを抽出 → LLM出力のfrontmatterを除去 → 元frontmatter + LLM本文で結合
- frontmatterが存在しない場合は LLM 出力をそのまま返す（安全なフォールバック）

---

## L-IP-002: `shouldRunGenericSkillGeneration` フラグによる bootstrap 除外

### 問題

`improve-prompt` モードで `createSkill()` を呼ぶと、デフォルトで `init_skill.js` / `generate_skill_md.js` 等のスクリプト（bootstrap処理）が実行されてしまい、既存スキルディレクトリを上書きする。

### 解決パターン

```typescript
let shouldRunGenericSkillGeneration = true;

switch (options.mode) {
  case "improve-prompt":
    emitProgress("loading-skill");
    this.throwIfAborted(operationSignal);
    emitProgress("analyzing");
    this.throwIfAborted(operationSignal);
    await this.runImprovePromptWorkflow(options, operationSignal);
    shouldRunGenericSkillGeneration = false; // bootstrap をスキップ
    emitProgress("improving");
    break;
}

if (shouldRunGenericSkillGeneration) {
  // init_skill.js / generate_skill_md.js 等を実行
}
```

### 要点

- `shouldRunGenericSkillGeneration = false` を switch 内で設定することで、共通の後続処理をスキップ
- 各モードを switch 文で管理することで、モード追加時のフラグ管理が明確になる
- `create` / `update` / `collaborative` / `orchestrate` は `true` のまま（デフォルト）

---

## L-IP-003: abort 検知タイミング（`emitProgress()` 後に `throwIfAborted()` を配置）

### 問題

`emitProgress()` は非同期処理の前後に挿入するが、abort チェックのタイミングを誤ると、ユーザーがキャンセル操作した後も処理が継続してしまう。

### 解決パターン

```typescript
case "improve-prompt":
  emitProgress("loading-skill");
  this.throwIfAborted(operationSignal);  // ← emitProgress 後にチェック
  emitProgress("analyzing");
  this.throwIfAborted(operationSignal);  // ← emitProgress 後にチェック
  await this.runImprovePromptWorkflow(options, operationSignal);
  // ...
```

また、`runImprovePromptWorkflow()` 内でも各フェーズ後に配置:

```typescript
private async runImprovePromptWorkflow(options, signal?) {
  this.throwIfAborted(signal);  // 入口でチェック
  // fs.readFile ...
  this.throwIfAborted(signal);  // readFile 後にチェック
  // llmClient.generate ...
  this.throwIfAborted(signal);  // generate 後にチェック
  // fs.writeFile ...
}
```

### 要点

- `throwIfAborted()` は `emitProgress()` の直後に配置する
- LLM呼び出し（`generate()`）の直後にも配置し、生成結果を書き込む前に abort を検知する
- abort 系例外は `if (this.isAbortError(error)) throw error` で必ず rethrow する

---

## L-IP-004: `improveSkill()` フォールバック（llmClient不在/readFile失敗/LLM失敗で統一）

### 問題

LLM 改善パスには複数の失敗ポイントがある（llmClient未注入、ファイル読み込み失敗、LLM API失敗）。各ケースを個別に処理すると、フォールバック戦略が散在して管理が難しくなる。

### 解決パターン

```typescript
private async runImprovePromptWorkflow(options, signal?) {
  // 失敗ポイント1: llmClient 未注入
  if (!this.llmClient) {
    await this.improveSkill(options.name, true);
    return;
  }

  // 失敗ポイント2: SKILL.md 読み込み失敗
  let currentContent: string;
  try {
    currentContent = await fs.readFile(skillMdPath, "utf-8");
  } catch (error) {
    if (this.isAbortError(error)) throw error;
    await this.improveSkill(options.name, true);
    return;
  }

  // 失敗ポイント3: LLM 生成・書き込み失敗
  try {
    const agentDef = await this.resourceLoader.loadAgent("improve-prompt", { signal });
    const improved = await this.llmClient.generate({ system: agentDef, user: currentContent });
    const nextContent = this.preserveOriginalFrontmatter(currentContent, improved);
    this.throwIfAborted(signal);
    await fs.writeFile(skillMdPath, nextContent, "utf-8");
  } catch (error) {
    if (this.isAbortError(error)) throw error;
    await this.improveSkill(options.name, true);  // 統一フォールバック
  }
}
```

### 要点

- 全ての非abort例外は `improveSkill(skillName, true)` に統一フォールバック
- abort例外のみ rethrow（中断を伝播させる）
- `autoApply=true` で即時適用（ユーザー確認なし）
- `improveSkill()` はスクリプトベースの改善であり、LLM改善の代替として常に動作可能

---

## L-IP-005: progress タイミング（improving 段階での追加 emit）

### 問題

5段階フローのうち `improving(65%)` は `runImprovePromptWorkflow()` の完了後に emit している。これにより、LLM改善処理が65%到達前に完了するという逆転が発生する。

### 実装上の決定

```typescript
case "improve-prompt":
  emitProgress("loading-skill");  // 10%: ワークフロー開始直後
  this.throwIfAborted(operationSignal);
  emitProgress("analyzing");      // 30%: 分析フェーズ
  this.throwIfAborted(operationSignal);
  await this.runImprovePromptWorkflow(options, operationSignal);  // LLM改善実行
  shouldRunGenericSkillGeneration = false;
  emitProgress("improving");      // 65%: LLM改善完了後に emit
  break;
```

`validating(90%)` と `done(100%)` は switch 文の外側（共通処理）で emit されるため、improving→validating→done の順序は保たれる。

### 要点

- `improving` emit は `runImprovePromptWorkflow()` の完了後に配置（処理完了の通知として使用）
- `loading-skill` / `analyzing` は処理開始前に emit（処理中であることを通知）
- `validating` / `done` は createSkill() の共通後続処理で emit される
- フォールバック経路（`improveSkill()`）でも同じ progress タイミングが適用される

---

## 参照

- 実装ファイル: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`
- テスト: `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.improve-prompt.test.ts`
- タスク仕様: `docs/30-workflows/TASK-SC-IMPROVE-PROMPT-IMPL-001/`
