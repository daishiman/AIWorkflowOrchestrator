# Phase 4: テスト作成（TDD）

## メタ情報

| 項目     | 値                                                                             |
| -------- | ------------------------------------------------------------------------------ |
| Phase    | 4                                                                              |
| タスクID | TASK-SW-UI-POLISH-001                                                          |
| 機能名   | スキルウィザード UI仕上げ（CSS変数監査・カテゴリ選択上限・アニメーション追加） |
| 作成日   | 2026-04-14                                                                     |
| 前提     | Phase 3 完了済み（設計レビュー PASS/MINOR）                                    |
| 状態     | 未着手                                                                         |

## 目的

TDD アプローチで、実装前にテストを作成する。Red（失敗）→ Green（成功）→ Refactor のサイクルを回すため、実装前に全テストケースを定義する。

---

## 実行タスク

- CSS 変数監査テスト作成
- カテゴリ上限テスト作成（`SkillInfoStep.test.tsx`）
- アニメーションクラステスト作成
- テストパターンが Phase 1-3 で確認した命名規則と整合していることを検証

---

## テストファイル

```
apps/desktop/src/renderer/components/skill/wizard/__tests__/
  ├── SkillInfoStep.test.tsx         （既存ファイルに追記）
  └── ConversationRoundStep.test.tsx  （既存ファイルに追記 or 新規）

apps/desktop/src/renderer/components/skill/__tests__/
  └── SkillCreateWizard.test.tsx     （CSS 変数監査）
```

---

## テストケース定義

### CSS 変数監査テスト（静的テスト）

```typescript
// CSS 変数監査: ハードコードカラー非存在確認
describe("CSS 変数監査", () => {
  it("SkillCreateWizard.tsx に bg-blue-* が含まれない", () => {
    // fs でファイルを読み込み、正規表現で bg-blue- が0件であることを検証
    const content = fs.readFileSync(
      path.resolve(
        "apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx",
      ),
      "utf-8",
    );
    expect(content).not.toMatch(/bg-blue-\d+/);
  });

  it("SkillInfoStep.tsx に bg-blue-* が含まれない", () => {
    const content = fs.readFileSync(
      path.resolve(
        "apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx",
      ),
      "utf-8",
    );
    expect(content).not.toMatch(/bg-blue-\d+/);
  });
});
```

### カテゴリ上限テスト

```typescript
// SkillInfoStep.test.tsx への追加テストケース
describe("カテゴリ選択上限（MAX_CATEGORY_COUNT = 3）", () => {
  it("TC-02: 3件選択後に4件目を選択しても category の長さが変わらない", async () => {
    // 3件選択済みの状態でレンダリング
    // 4件目カテゴリボタンをクリック
    // onFormDataChange が呼ばれないこと、または category が3件のままであることを検証
  });

  it("TC-03: 上限到達後に未選択ボタンが disabled になる", () => {
    // 3件選択済みの状態でレンダリング
    // 未選択ボタンの disabled 属性が true であることを検証
    // opacity-40 または cursor-not-allowed クラスが適用されていることを検証
  });

  it("TC-04: 上限到達後に選択済みカテゴリを解除すると disabled が解除される", async () => {
    // 3件選択済みの状態でレンダリング
    // 選択済みカテゴリを1件クリックで解除
    // 未選択ボタンの disabled が解除されることを検証
  });

  it("TC-05: 上限未到達時に選択済みカテゴリを解除できる（回帰）", async () => {
    // 1件選択済みの状態でレンダリング
    // 選択済みカテゴリをクリックで解除
    // category から該当値が除去されることを検証
  });

  it("初期状態（0件選択）で全ボタンが有効", () => {
    // category が空配列の状態でレンダリング
    // 全カテゴリボタンが disabled でないことを検証
  });
});
```

### アニメーションクラステスト

```typescript
describe("アニメーションクラス確認", () => {
  it("TC-06: カテゴリボタンに transition-all / duration-200 クラスが含まれる", () => {
    // SkillInfoStep をレンダリング
    // カテゴリボタン要素を取得
    // className に transition-all と duration-200 が含まれることを検証
  });

  it("TC-07: ProgressBar に transition-all / duration-300 クラスが含まれる", () => {
    // ConversationRoundStep または InterviewProgressBar をレンダリング
    // ProgressBar の幅制御要素を取得
    // className に transition-all と duration-300 が含まれることを検証
  });
});
```

### ProgressBar 回帰テスト

```typescript
describe("ProgressBar 回帰テスト", () => {
  it("TC-08: 全問未回答時（1/6）の表示確認", () => {
    // currentQuestion=1, totalQuestions=6 でレンダリング
    // width が約16.7% であることを検証（style 属性）
    // transition クラスが適用されていることを検証
  });

  it("TC-09: 全問回答済み（6/6）の表示確認", () => {
    // currentQuestion=6, totalQuestions=6 でレンダリング
    // width が 100% であることを検証
    // transition クラスが適用されていることを検証
  });
});
```

---

## テストケース一覧

| テストID | 対象           | 入力/操作                                        | 期待結果                                     | 備考                  |
| -------- | -------------- | ------------------------------------------------ | -------------------------------------------- | --------------------- |
| TC-01    | CSS変数監査    | `SkillCreateWizard.tsx` 内 `bg-blue-` 検索       | マッチなし（0件）                            | 静的テスト（fs読込）  |
| TC-02    | カテゴリ上限   | 3件選択後に4件目のカテゴリをクリック             | `category` の長さが3のまま変化しない         | 上限ガード確認        |
| TC-03    | カテゴリ上限   | 上限到達後に未選択ボタンの状態を確認             | disabled / opacity-40 クラスが適用されている | UI フィードバック確認 |
| TC-04    | カテゴリ上限   | 上限到達後に選択済みカテゴリを1件解除            | 未選択ボタンの disabled が解除される         | 解除→再選択サイクル   |
| TC-05    | カテゴリ解除   | 選択済みカテゴリをクリックで解除（上限未到達時） | `category` から該当値が除去される（回帰）    | 既存トグル動作保持    |
| TC-06    | アニメーション | カテゴリボタンの className を確認                | `transition-all` / `duration-200` を含む     | CSS クラス確認        |
| TC-07    | アニメーション | ProgressBar の className を確認                  | `transition-all` / `duration-300` を含む     | CSS クラス確認        |
| TC-08    | ProgressBar    | 全問未回答時のProgressBar表示                    | 質問 1/6 表示、width が約 16.7%              | 回帰テスト            |
| TC-09    | ProgressBar    | 全問回答済み時のProgressBar表示                  | 質問 6/6 表示、width が 100%                 | 回帰テスト            |

---

## Phase 4 完了条件

- [ ] TC-01〜TC-09 の全テストケースが定義済み（コード記述済み）
- [ ] テストが Red（失敗）状態であることを確認（実装前）
- [ ] テストパターンが命名規則（camelCase/PascalCase）と整合している
- [ ] 既存テストへの影響がないことを確認
