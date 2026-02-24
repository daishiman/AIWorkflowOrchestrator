# 実装ガイド — skill:ハンドラP42準拠バリデーション形式統一

> タスクID: UT-FIX-SKILL-VALIDATION-CONSISTENCY-001
> Issue: #874
> 日付: 2026-02-24

---

## Part 1: 中学生レベル概念説明

### お店の受付カウンターで「入場券を3回チェック」する仕組み

---

### 1. なぜチェック（確認作業）が必要なの？

お店にはたくさんの受付カウンターがあります。「スキルの情報を教えて」「スキルを実行して」「処理を中止して」など、それぞれの受付が違う仕事を担当しています。

でも、もしお客さんが白紙のチケット（空っぽの名前）や、偽物のチケット（数字だけの名前）を持ってきたらどうなるでしょうか？そのまま受け付けてしまうと、お店の中で混乱が起きてしまいます。

だから、**受付カウンターで最初にチケットを確認する**のが大事なんです。

---

### 2. 「スペースだけの名前」が問題になった理由

過去に、こんなことが起きました。チケットの名前の欄に **スペース（空白）だけ** が書かれたチケットを持ったお客さんがいました。

受付の人は「名前は書いてある（空っぽじゃない）」と思って通してしまいました。でも実際には、名前はスペースだけで**意味のある情報は何もなかった**のです。

これが原因で、お店の奥（SkillFileManagerという場所）で「この名前のスキルはありません！」というエラーが起きました。**入口で止められるはずの問題が、奥の方まで入り込んでしまった**わけです。

これがP42と呼ばれる教訓です。

---

### 3. 3段階チェックの仕組み

この問題を防ぐために、**3回のチェック**を行うようにしました。

```
お客さん → 受付カウンター

  チェック1: チケットは本物の紙か？
  ┌──────────────────────────────────┐
  │ 紙でなければ（数字やnull）→ ❌ 入場拒否 │
  └──────────────────────────────────┘
         ↓ 紙だった ✅
  チェック2: 白紙ではないか？
  ┌──────────────────────────────────┐
  │ 何も書いてなければ（""）→ ❌ 入場拒否   │
  └──────────────────────────────────┘
         ↓ 何か書いてあった ✅
  チェック3: スペースだけで埋められていないか？
  ┌──────────────────────────────────────┐
  │ 余白を取り除いたら空になった → ❌ 入場拒否 │
  └──────────────────────────────────────┘
         ↓ ちゃんとした名前だった ✅
  → 入場OK！お店のサービスを利用できます
```

| チェック番号 | 何を確認する？                         | 日常のたとえ                                       |
| ------------ | -------------------------------------- | -------------------------------------------------- |
| チェック1    | チケットが本物の「文字列（紙）」か     | チケットが紙じゃなくて石とか数字だったら拒否       |
| チェック2    | 白紙（空っぽの文字列 ""）ではないか    | 紙ではあるけど、何も書いてなかったら拒否           |
| チェック3    | スペースだけで名前が埋められていないか | 名前の欄がスペースだけだったら、実質白紙なので拒否 |

実はチェック2とチェック3は**1つのチェックにまとめられます**。スペースを取り除いてから空かどうか確認すれば、白紙もスペースだけも両方検出できるからです。

---

### 4. 「大きな声で宣言」vs「小さなメモ」の違い

チケットが無効だとわかったとき、受付の人はどうやってお客さんに伝えるべきでしょうか？

| 方法                            | やり方                                         | 問題点                                       |
| ------------------------------- | ---------------------------------------------- | -------------------------------------------- |
| 小さなメモ（旧: return形式）    | メモ用紙に「ダメでした」と書いて渡す           | メモを読まないお客さんもいる。見落としやすい |
| 大きな声で宣言（新: throw形式） | 「このチケットは無効です！」とハッキリ宣言する | 見落とすことがない。全員に同じ方法で伝わる   |

以前の受付カウンターは、カウンターごとに伝え方がバラバラでした。あるカウンターは小さなメモ（`return { success: false }`）、別のカウンターは `return false`、また別のカウンターは `return null` と、違う形のメモを使っていました。

今回の修正で、**全カウンターが「大きな声で宣言」（throw形式）に統一**されました。

---

### 5. 全カウンターで同じルールにする理由

お店に6つの受付カウンターがあるとします。正面入口だけ厳しくチェックして、裏口はノーチェックだったら意味がありません。

**全部のカウンターで同じチェック方法を使う**ことで、どの入口から来ても安全が守られます。

今回修正した6つのカウンター:

| カウンター名     | 何をする受付？               |
| ---------------- | ---------------------------- |
| skill:get-detail | スキルの詳細情報を教える受付 |
| skill:execute    | スキルを実行する受付         |
| skill:abort      | 実行中の処理を止める受付     |
| skill:get-status | 処理の進み具合を教える受付   |
| skill:analyze    | スキルを分析する受付         |
| skill:improve    | スキルを改善する受付         |

---

### 6. まとめ

- チケットの確認（バリデーション）は**入口で行う**のが鉄則
- **3段階のチェック**で、偽チケット・白紙・スペースだけのチケットを全て弾く
- 拒否するときは**大きな声で宣言**（throw形式）して、見落としを防ぐ
- **全カウンターで同じルール**にすることで、安全を確保する

---

## Part 2: 開発者向け技術詳細

### 2.1 P42準拠3段バリデーション標準パターン

```typescript
// P42準拠: 3段バリデーション（型チェック → 空文字列 → トリム空文字列）
// value.trim() === "" は value === "" を内包するため、2条件で3段チェックを達成
if (typeof value !== "string" || value.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: `${paramName} must be a non-empty string`,
  };
}
```

**設計判断:**

- `value.trim() === ""` は空文字列 `""` を内包するため、別途 `value === ""` チェックは不要
- `typeof` チェックは `null` / `undefined` / 数値型を全て拒否
- throw 形式は safeInvoke の Error ハンドリングと整合
- return 形式ではなく throw 形式を選択した理由: safeInvoke は throw されたエラーを Promise の reject として Renderer に返す。return 形式では呼び出し元が返り値の構造を個別に判定する必要があるが、throw 形式なら catch 一箇所でエラーハンドリングが完結する

### 2.2 修正対象6ハンドラの修正前後比較

| ハンドラ           | 引数パターン   | パラメータ名  | 修正前エラー形式                                                   | 修正後エラー形式                                                                        |
| ------------------ | -------------- | ------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `skill:get-detail` | オブジェクト型 | `skillId`     | `return { success: false, error: "skillId must be a string" }`     | `throw { code: "VALIDATION_ERROR", message: "skillId must be a non-empty string" }`     |
| `skill:execute`    | オブジェクト型 | `skillId`     | `return { success: false, error: "skillId must be a string" }`     | `throw { code: "VALIDATION_ERROR", message: "skillId must be a non-empty string" }`     |
| `skill:abort`      | 直接引数型     | `executionId` | `return false`                                                     | `throw { code: "VALIDATION_ERROR", message: "executionId must be a non-empty string" }` |
| `skill:get-status` | 直接引数型     | `executionId` | `return null`                                                      | `throw { code: "VALIDATION_ERROR", message: "executionId must be a non-empty string" }` |
| `skill:analyze`    | オブジェクト型 | `skillName`   | `return { success: false, error: "スキル名が指定されていません" }` | `throw { code: "VALIDATION_ERROR", message: "skillName must be a non-empty string" }`   |
| `skill:improve`    | オブジェクト型 | `skillName`   | `return { success: false, error: "スキル名が指定されていません" }` | `throw { code: "VALIDATION_ERROR", message: "skillName must be a non-empty string" }`   |

### 2.3 引数アクセスパターンの分類

**オブジェクト型（4ハンドラ: skill:get-detail, skill:execute, skill:analyze, skill:improve）:**

```typescript
ipcMain.handle("skill:xxx", async (_event, args) => {
  const value = args?.paramName;
  if (typeof value !== "string" || value.trim() === "") {
    throw {
      code: "VALIDATION_ERROR",
      message: "paramName must be a non-empty string",
    };
  }
  // 正常処理...
});
```

**直接引数型（2ハンドラ: skill:abort, skill:get-status）:**

```typescript
ipcMain.handle("skill:xxx", async (_event, executionId) => {
  if (typeof executionId !== "string" || executionId.trim() === "") {
    throw {
      code: "VALIDATION_ERROR",
      message: "executionId must be a non-empty string",
    };
  }
  // 正常処理...
});
```

### 2.4 バリデーション対象入力パターン

| 入力           | typeof             | trim()         | 期待結果         |
| -------------- | ------------------ | -------------- | ---------------- |
| `"validSkill"` | `"string"` PASS    | `"validSkill"` | 正常処理         |
| `""`           | `"string"` PASS    | `""` FAIL      | VALIDATION_ERROR |
| `"   "`        | `"string"` PASS    | `""` FAIL      | VALIDATION_ERROR |
| `null`         | `"object"` FAIL    | -              | VALIDATION_ERROR |
| `undefined`    | `"undefined"` FAIL | -              | VALIDATION_ERROR |
| `123`          | `"number"` FAIL    | -              | VALIDATION_ERROR |

境界値テストで追加検証した入力:

| 入力        | 説明         | 期待結果         |
| ----------- | ------------ | ---------------- |
| `"\t"`      | タブ文字のみ | VALIDATION_ERROR |
| `"\n"`      | 改行文字のみ | VALIDATION_ERROR |
| `" \t \n "` | 混合空白文字 | VALIDATION_ERROR |
| `"\r\n"`    | CR+LF        | VALIDATION_ERROR |

### 2.5 テストパターン

```typescript
describe("P42準拠バリデーションテスト", () => {
  it("空文字列を VALIDATION_ERROR で拒否する", async () => {
    try {
      await handler({}, { skillId: "" });
      throw new Error("Expected VALIDATION_ERROR to be thrown");
    } catch (error) {
      expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
    }
  });

  it("スペースのみ文字列を VALIDATION_ERROR で拒否する", async () => {
    try {
      await handler({}, { skillId: "   " });
      throw new Error("Expected VALIDATION_ERROR to be thrown");
    } catch (error) {
      expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
    }
  });

  it("非文字列（数値）を VALIDATION_ERROR で拒否する", async () => {
    try {
      await handler({}, { skillId: 123 });
      throw new Error("Expected VALIDATION_ERROR to be thrown");
    } catch (error) {
      expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
    }
  });
});
```

### 2.6 既知の落とし穴と本タスクでの適用

| Pitfall | タイトル                   | 本タスクでの適用                                                                            |
| ------- | -------------------------- | ------------------------------------------------------------------------------------------- |
| P42     | trim()バリデーション漏れ   | 全6ハンドラに `.trim() === ""` チェックを追加                                               |
| P44     | IPC インターフェース不整合 | skill:import/remove の修正パターンを踏襲し、同一のバリデーション形式を適用                  |
| P45     | 引数命名の契約ドリフト     | 引数名の修正は本タスクスコープ外（別タスク UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001 で対応） |

### 2.7 修正対象ファイル

| ファイル                                                               | 修正内容                                 |
| ---------------------------------------------------------------------- | ---------------------------------------- |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                           | 6ハンドラのバリデーション修正            |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.execute.test.ts`    | 既存テスト4件のthrow形式対応（TC-4-006） |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.validation.test.ts` | バリデーション専用テスト59件（新規作成） |

### 2.8 テスト結果サマリー

| カテゴリ                               | テスト数 | 結果       |
| -------------------------------------- | -------- | ---------- |
| P42基本テスト（6×6パターン）           | 36       | 全PASS     |
| 境界値テスト（空白文字バリエーション） | 11       | 全PASS     |
| throw伝播テスト（code+message）        | 12       | 全PASS     |
| 既存テスト修正（TC-4-006）             | 4        | 修正後PASS |
| **全テストファイル合計**               | **181**  | **全PASS** |
