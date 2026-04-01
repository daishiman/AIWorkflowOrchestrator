# Implementation Guide — UT-IMP-SDK-06 Layer3/4 verify 拡張

## Part 1: 中学生レベル概念説明

### そもそも「スキル」って何？

このアプリでは、AIが仕事を手伝うための「スキル」と呼ばれる設定ファイルの束を作ります。スキルには「何をするか」「どう動くか」「どんな入力/出力か」などが書かれています。

### 「検証」（verify）って何するの？

スキルを作ったあとで、「ちゃんと作れているかな？」とチェックすることを「検証」と呼びます。
チェックは4段階あります：

- **Layer 1**: ファイルが揃っているかチェック（「材料は揃ってる？」）
- **Layer 2**: ファイルの中身の基本構造チェック（「レシピの形は合ってる？」）
- **Layer 3**: ファイルの中身がルール通りか詳しくチェック（「分量は具体的な数値で書いてある？」）
- **Layer 4**: スキル全体の意味がバラバラになっていないかチェック（「レシピで言及した食材が材料リストに本当にある？」）

### Layer 3 が調べること

1. **L3-001**: `output-schema.json` というファイルに「$schema」という目印はある？（ないと「あいまいだよ」と警告）
2. **L3-002**: 同じファイルの「type」の値は有効な型（object、array など）？（変な値だとエラー）
3. **L3-003**: AIエージェントの「責務」（やること）の説明は 20 文字以上ある？（短すぎると警告）
4. **L3-004**: スキルの「Trigger」（いつ使うか）の説明は 10 文字以上ある？（短すぎると警告）

### Layer 4 が調べること

1. **L4-001**: `SKILL.md` の「Anchors」（参考にした書籍や原則）のリストに項目が 1 つ以上ある？（ないとエラー）
2. **L4-002**: SKILL.md の中で「references/xxx.md」と言及したファイルが実際に存在する？（存在しないと警告）
3. **L4-003**: agents/（AIエージェントのファイル群）のファイル名が SKILL.md の本文で言及されている？（されていないと警告）

### verify→improve→reverify ループって何？

「採点して→修正して→再採点する」ループです：

1. `verify()` でスキルを採点（どのチェックが pass/fail か判定）
2. warning / fail があったら `improve()` でスキルを修正
3. 再び `verify()` で採点し直す

このタスクでは、この「採点→修正→再採点」のループがちゃんと動くことをテストで確認しました。
warning だけでも改善ループに回し、`info` のみを PASS とするようにしたので、見落としやすい品質低下も改善対象になります。

---

## Part 2: 技術詳細

### 変更したファイル

| ファイル                                                                                  | 変更内容                                                                                                             |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`                | `createCheck()` layer 型拡張、`extractSectionContent()` 追加、`validateLayer3/4()` 実装、`verify()` に layer3/4 追加 |
| `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`                    | `recordVerifyPass()` で improve 後の currentPhase を verify に戻す                                                   |
| `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts` | `createSkillFixture` に `referenceFiles`/`skillMdReferenceLinks` 追加、Layer3/4 テストケース追加、結合テスト追加     |
| `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`      | warning-only / warning+error の improve ループテスト追加                                                             |

### Layer3 チェック ID 体系

| check ID | severity      | 検証内容                                                                      |
| -------- | ------------- | ----------------------------------------------------------------------------- |
| L3-001   | warning       | `output-schema.json` の `$schema` フィールド存在確認                          |
| L3-002   | warning/error | `output-schema.json` の `type` フィールド有効性（なし=warning, 無効値=error） |
| L3-003   | warning       | `agents/*.md` の `## 責務` セクション内容長（< 20 文字 = warning）            |
| L3-004   | warning       | `SKILL.md` の `## Trigger` セクション内容長（< 10 文字 = warning）            |

### Layer4 チェック ID 体系

| check ID | severity | 検証内容                                                                                 |
| -------- | -------- | ---------------------------------------------------------------------------------------- |
| L4-001   | error    | `SKILL.md` の `## Anchors` セクションにリスト項目（`-`/`*`）が 1 件以上あるか            |
| L4-002   | warning  | `references/` 内への SKILL.md 参照パスが実在するか（`references/` なければ emit しない） |
| L4-003   | warning  | `agents/` 配下 .md ファイル名が SKILL.md 本文で言及されているか                          |

### `extractSectionContent` の実装パターン

```typescript
function extractSectionContent(
  content: string,
  heading: string,
): string | null {
  // ステップ1: セクション開始行を特定
  const sectionStart = new RegExp(`^##\\s+${escapeRegex(heading)}\\s*$`, "m");
  const match = sectionStart.exec(content);
  if (!match) return null;

  // ステップ2: 次のセクション見出しまでを切り出す
  const afterHeading = content.slice(match.index + match[0].length);
  const nextSection = /^##\s/m.exec(afterHeading);
  return afterHeading.slice(
    0,
    nextSection ? nextSection.index : afterHeading.length,
  );
}
```

**なぜ2ステップか**: `m` フラグ下で `$` は行末にマッチするため、`[\s\S]*?(?=^##\s|$)` は最初の改行で止まってしまう。2ステップ方式で確実に次の見出しまでを取得する。

### `createSkillFixture` 拡張

```typescript
interface SkillFixtureOptions {
  // ...既存フィールド...
  referenceFiles?: Record<string, string>; // references/ 配下のファイル群
  skillMdReferenceLinks?: string[]; // SKILL.md に追記する references/ パス一覧
}
```

`skillMdReferenceLinks` を指定すると SKILL.md 末尾に `## References` セクションが自動追加され、L4-002 の参照整合性テストで使用できる。

### verify→improve→reverify 結合テストのパターン

```typescript
it("T-LOOP-01: L4-001 が fail → 改善 → re-verify で info", async () => {
  // 1. fail fixture 作成
  const dir = await createSkillFixture(tmpDir, {
    skillMd: "# S\n\n## Anchors\nNo list items.",
    agents: { "a.md": "# A\n\n## 責務\nDoes things for users" },
  });

  // 2. 初回 verify（error 確認）
  const firstChecks = await engine.verify(dir);
  expect(findCheck(firstChecks, "L4-001")?.severity).toBe("error");

  // 3. improve（SKILL.md を直接書き換え）
  await fs.writeFile(
    path.join(dir, "SKILL.md"),
    "# S\n\n## Anchors\n- anchor1",
  );

  // 4. re-verify（info 確認）
  const secondChecks = await engine.verify(dir);
  expect(findCheck(secondChecks, "L4-001")?.severity).toBe("info");
});
```

### 実装時に注意した点

1. **output-schema.json なし → L3-001/L3-002 を emit しない**: スキーマファイルがオプションである設計を尊重
2. **references/ なし / references/ 外への脱出 → L4-002 を emit しない**: 参照整合チェックは参照先ディレクトリがある場合のみ意味を持ち、`references/../...` のような脱出パスも無効にする
3. **SKILL.md が読めない場合 → Layer3/4 チェックをスキップ**: L1/L2 のエラーで十分
4. **L3-002 の配列型対応**: `["object", "null"]` 形式も有効な JSON Schema type として認識
5. **L3-002 の空配列は無効**: `[]` は型の集合として空なので `error` にする
6. **output-schema.json の root が object 以外でも落ちない**: `true` / `null` / root の `[]` などは warning で安全に返す
7. **L4-001 の `*` 形式対応**: Markdown のリスト記法として `-` だけでなく `*` も認識
8. **verify→improve→reverify は warning も改善対象**: `verifyAndImproveLoop()` は `info` のみを PASS 扱いにして、warning を取りこぼさない
9. **recordVerifyPass() は verify phase に戻す**: improve 後の re-verify で workflow state の phase が verify に戻るようにした

### テストカウント

| カテゴリ                                     | テスト数           |
| -------------------------------------------- | ------------------ |
| 既存 Layer1/2 テスト                         | 27                 |
| Layer3 単体テスト（T-L3-01〜10 + EC-01〜05） | 15                 |
| Layer4 単体テスト（T-L4-01〜08 + EC-01〜05） | 13                 |
| 結合テスト（T-LOOP-01〜04 + EC-01〜03）      | 7                  |
| Facade injection テスト（T-FAC-01〜02）      | 2                  |
| その他（T-ENG-01〜03、Edge cases）           | 8 (既存に含む一部) |
| **合計**                                     | **60**             |

> 補足: 上表は `SkillCreatorVerificationEngine.test.ts` の内訳のみ。別途 `RuntimeSkillCreatorFacade.test.ts` と `SkillCreatorWorkflowEngine.test.ts` で loop / state 遷移の 71 tests を実行し、runtime suite 全体では 131 tests が green になった。
