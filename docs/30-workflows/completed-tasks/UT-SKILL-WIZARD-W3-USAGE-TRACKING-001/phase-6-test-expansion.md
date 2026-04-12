# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 6                                                          |
| 前提 Phase | 5（実装）                                                  |
| 後続 Phase | 7（カバレッジ確認）                                        |
| タスクID   | UT-SKILL-WIZARD-W3-USAGE-TRACKING-001                      |
| タスク分類 | NON_VISUAL（Renderer 内部の計装のみ / 視覚差分なし）       |
| 担当 AC    | AC-7 / AC-8 / AC-9（カバレッジ達成の前提となるテスト追加） |

---

## 目的

Phase 5 の実装で追加した計装コードに対して、fail path・ペイロード検証・回帰ガードの
テストケースを追加する。Phase 4（TDD Red）で作成した基本テストに加え、
エッジケースとすべてのパラメーターバリアントを網羅し、
Phase 7 のカバレッジ確認でブランチカバレッジ 100%（trackEvent.ts）・
90%+（SkillCreateWizard.tsx / CompleteStep.tsx）を達成できる状態にする。

本 Phase は NON_VISUAL タスクであるため、スクリーンショットは取得しない。
テスト実行結果（pass/fail ログ）を主証跡とする。

---

## 実行タスク

### タスク 1: fail path テストの追加

**対象テストファイル**:

- `apps/desktop/src/renderer/utils/__tests__/trackEvent.test.ts`
- `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`
- `apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx`（新規作成またはすでに存在する場合は修正）

#### 手順 1-1: ウィザード途中アンマウント時の `skill_wizard_abandon` テストを追加する

`SkillCreateWizard.test.tsx` に以下のテストケースをすべて追加する。
各テストケースで `trackEvent` が `vi.mock` または `vi.spyOn` でスパイされていること。

**テストケース A: Step 0 でアンマウントされた場合**

```
- SkillCreateWizard を render する（source="direct"）
- trackEvent の呼び出し履歴をクリアする
- unmount() を呼び出す
- trackEvent が "skill_wizard_abandon" と { lastStep: 0 } で呼ばれたことを assert する
```

**テストケース B: Step 1 でアンマウントされた場合**

```
- SkillCreateWizard を render する
- Step 0 → Step 1 に遷移させる（handleStep0Next トリガー）
- trackEvent の呼び出し履歴をクリアする
- unmount() を呼び出す
- trackEvent が "skill_wizard_abandon" と { lastStep: 1 } で呼ばれたことを assert する
```

**テストケース C: Step 2 でアンマウントされた場合**

```
- SkillCreateWizard を render する
- Step 0 → Step 1 → Step 2 に遷移させる（handleGenerate トリガー）
- trackEvent の呼び出し履歴をクリアする
- unmount() を呼び出す
- trackEvent が "skill_wizard_abandon" と { lastStep: 2 } で呼ばれたことを assert する
```

**テストケース D: Step 3（完了）に到達後にアンマウントされた場合（abandon 非発火）**

```
- SkillCreateWizard を render する
- Step 0 → Step 1 → Step 2 → Step 3 に遷移させる（createSkill mock 成功）
- trackEvent の呼び出し履歴をクリアする
- unmount() を呼び出す
- trackEvent が "skill_wizard_abandon" で呼ばれて**いない**ことを assert する
```

#### 手順 1-2: `skill_wizard_open` の source バリアントテストを追加する

`SkillCreateWizard.test.tsx` に以下の 2 テストケースを追加する。

**テストケース E: source="lifecycle_panel" で open イベントが発火する**

```
- SkillCreateWizard を source="lifecycle_panel" で render する
- trackEvent が "skill_wizard_open" と { source: "lifecycle_panel" } で呼ばれたことを assert する
```

**テストケース F: source が未指定（undefined）の場合に source="direct" で発火する**

```
- SkillCreateWizard を source prop なしで render する
- trackEvent が "skill_wizard_open" と { source: "direct" } で呼ばれたことを assert する
```

#### 手順 1-3: `skill_wizard_next_action` の全アクションバリアントテストを追加する

`CompleteStep.test.tsx` に以下の 3 テストケースをすべて追加する。
各テストでは `trackEvent` を `vi.mock` または `vi.spyOn` でスパイすること。

**テストケース G: action="execute" が発火する**

```
- CompleteStep を onExecuteNow={mockFn} で render する
- data-testid="complete-step-action-execute" のボタンをクリックする
- trackEvent が "skill_wizard_next_action" と { action: "execute" } で呼ばれたことを assert する
- mockFn が呼ばれたことを assert する
```

**テストケース H: action="edit" が発火する**

```
- CompleteStep を onOpenInEditor={mockFn} で render する
- data-testid="complete-step-action-open-editor" のボタンをクリックする
- trackEvent が "skill_wizard_next_action" と { action: "edit" } で呼ばれたことを assert する
- mockFn が呼ばれたことを assert する
```

**テストケース I: action="close" が発火する**

```
- CompleteStep を onCreateAnother={mockFn} で render する
- data-testid="complete-step-action-create-another" のボタンをクリックする
- trackEvent が "skill_wizard_next_action" と { action: "close" } で呼ばれたことを assert する
- mockFn が呼ばれたことを assert する
```

---

### タスク 2: ペイロード検証テストの追加

#### 手順 2-1: `skill_wizard_step_complete` のペイロードが正確に渡されるテストを追加する

`SkillCreateWizard.test.tsx` に以下の 3 テストケースを追加する。

**テストケース J: Step 0 完了時のペイロード検証**

```
- SkillCreateWizard を render する
- SkillInfoStep の「次へ」ボタンをクリックする（handleStep0Next トリガー）
- trackEvent が "skill_wizard_step_complete" と { step: 0, stepName: "スキル情報入力" } で
  呼ばれたことを assert する
- stepName が "スキル情報入力" であること（STEPS[0] の値と一致すること）を確認する
```

**テストケース K: Step 1 完了時のペイロード検証**

```
- SkillCreateWizard を Step 1 が表示された状態で render する
- ConversationRoundStep の生成ボタンをクリックする（method="complete"）
- trackEvent が "skill_wizard_step_complete" と { step: 1, stepName: "詳細設定" } で
  呼ばれたことを assert する
- stepName が "詳細設定" であること（STEPS[1] の値と一致すること）を確認する
```

**テストケース L: Step 2 完了時（生成成功）のペイロード検証**

```
- createSkill mock を成功レスポンス（path: "/skills/test.skill.md"）で設定する
- SkillCreateWizard を Step 2 が表示された状態（生成完了後）にする
- trackEvent が "skill_wizard_step_complete" と { step: 2, stepName: "生成" } で
  呼ばれたことを assert する
- stepName が "生成" であること（STEPS[2] の値と一致すること）を確認する
```

#### 手順 2-2: `skill_wizard_abandon` の `lastStep` が正確に記録されるテストを追加する

`SkillCreateWizard.test.tsx` に以下のテストケースを追加する。

**テストケース M: lastStep が currentStep の値と一致することの検証**

```
- SkillCreateWizard を render して Step 1 まで遷移させる
- unmount() を呼び出す
- trackEvent の "skill_wizard_abandon" 呼び出しの payload.lastStep が 1 であることを
  toEqual で厳密に assert する（toBeTruthy や toHaveBeenCalled だけでは不十分）
```

---

### タスク 3: 回帰ガードの追加

#### 手順 3-1: 既存 trackEvent イベントが引き続き動作することの確認テストを追加する

`trackEvent.test.ts` に以下のテストケースを追加する。
目的は、`SkillWizardEvents` 型の変更が既存イベントの呼び出しを壊していないことを確認すること。

**テストケース N: `skill_wizard_started` が引き続き呼び出せる**

```typescript
it("skill_wizard_started を Record<string, never> ペイロードで呼び出せる", () => {
  expect(() => {
    trackEvent("skill_wizard_started", {});
  }).not.toThrow();
});
```

**テストケース O: `skill_wizard_step1_completed` が引き続き呼び出せる**

```typescript
it("skill_wizard_step1_completed を正しいペイロードで呼び出せる", () => {
  expect(() => {
    trackEvent("skill_wizard_step1_completed", {
      method: "complete",
      skippedAtQuestion: null,
    });
  }).not.toThrow();
  expect(() => {
    trackEvent("skill_wizard_step1_completed", {
      method: "skip",
      skippedAtQuestion: 3,
    });
  }).not.toThrow();
});
```

**テストケース P: `skill_wizard_generation_completed` が引き続き呼び出せる**

```typescript
it("skill_wizard_generation_completed を正しいペイロードで呼び出せる", () => {
  expect(() => {
    trackEvent("skill_wizard_generation_completed", {
      method: "complete",
      category: "automation",
      hasExternalIntegration: false,
    });
  }).not.toThrow();
});
```

**テストケース Q: `skill_skeleton_quality_feedback` が引き続き呼び出せる**

```typescript
it("skill_skeleton_quality_feedback を正しいペイロードで呼び出せる", () => {
  expect(() => {
    trackEvent("skill_skeleton_quality_feedback", {
      satisfied: true,
      generationMethod: "complete",
    });
  }).not.toThrow();
  expect(() => {
    trackEvent("skill_skeleton_quality_feedback", {
      satisfied: false,
      generationMethod: "skip",
    });
  }).not.toThrow();
});
```

#### 手順 3-2: 新規 `skill_wizard_*` イベントの全分岐を網羅するテストを追加する

`trackEvent.test.ts` に以下のテストケースを追加する。

**テストケース R: `skill_wizard_open` のすべての source 値で呼び出せる**

```typescript
it.each([["lifecycle_panel"], ["direct"]] as const)(
  'skill_wizard_open source="%s" で呼び出せる',
  (source) => {
    expect(() => {
      trackEvent("skill_wizard_open", { source });
    }).not.toThrow();
  },
);
```

**テストケース S: `skill_wizard_step_complete` の任意の step / stepName で呼び出せる**

```typescript
it("skill_wizard_step_complete を正しいペイロードで呼び出せる", () => {
  [
    { step: 0, stepName: "スキル情報入力" },
    { step: 1, stepName: "詳細設定" },
    { step: 2, stepName: "生成" },
  ].forEach(({ step, stepName }) => {
    expect(() => {
      trackEvent("skill_wizard_step_complete", { step, stepName });
    }).not.toThrow();
  });
});
```

**テストケース T: `skill_wizard_next_action` のすべての action 値で呼び出せる**

```typescript
it.each([["edit"], ["execute"], ["close"]] as const)(
  'skill_wizard_next_action action="%s" で呼び出せる',
  (action) => {
    expect(() => {
      trackEvent("skill_wizard_next_action", { action });
    }).not.toThrow();
  },
);
```

**テストケース U: `skill_wizard_abandon` の任意の lastStep で呼び出せる**

```typescript
it.each([0, 1, 2])(
  "skill_wizard_abandon lastStep=%i で呼び出せる",
  (lastStep) => {
    expect(() => {
      trackEvent("skill_wizard_abandon", { lastStep });
    }).not.toThrow();
  },
);
```

#### 手順 3-3: dev / prod 環境分岐を網羅するテストを追加する

`trackEvent.test.ts` に以下の 2 テストケースを追加する。
`process.env.NODE_ENV` の切り替えには `vi.stubEnv` を使用する。

**テストケース V: 開発環境（NODE_ENV="development"）では console.info が呼ばれる**

```typescript
it("NODE_ENV=development のとき console.info を呼び出す", () => {
  vi.stubEnv("NODE_ENV", "development");
  const spy = vi.spyOn(console, "info").mockImplementation(() => {});
  trackEvent("skill_wizard_open", { source: "direct" });
  expect(spy).toHaveBeenCalledWith("[trackEvent]", "skill_wizard_open", {
    source: "direct",
  });
  spy.mockRestore();
  vi.unstubAllEnvs();
});
```

**テストケース W: 本番環境（NODE_ENV="production"）では console.info が呼ばれない**

```typescript
it("NODE_ENV=production のとき console.info を呼び出さない", () => {
  vi.stubEnv("NODE_ENV", "production");
  const spy = vi.spyOn(console, "info").mockImplementation(() => {});
  trackEvent("skill_wizard_open", { source: "direct" });
  expect(spy).not.toHaveBeenCalled();
  spy.mockRestore();
  vi.unstubAllEnvs();
});
```

---

## テストコマンド詳細

### テストファイル単体実行

```bash
# trackEvent.ts のテストのみ実行
pnpm --filter @repo/desktop test:run -- src/renderer/utils/__tests__/trackEvent.test.ts

# SkillCreateWizard.tsx のテストのみ実行
pnpm --filter @repo/desktop test:run -- src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx

# CompleteStep.tsx のテストのみ実行
pnpm --filter @repo/desktop test:run -- src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx
```

### 全テスト実行（回帰確認）

```bash
pnpm --filter @repo/desktop test:run
```

### 個別テストケース実行（デバッグ時）

```bash
# テストケース名でフィルター（例: abandon テストのみ）
pnpm --filter @repo/desktop test:run -- --grep "skill_wizard_abandon"
```

---

## 完了条件

- [ ] テストケース A〜D（abandon fail path）がすべて PASS する
- [ ] テストケース E〜F（open source バリアント）がすべて PASS する
- [ ] テストケース G〜I（next_action 全アクション）がすべて PASS する
- [ ] テストケース J〜L（step_complete ペイロード検証）がすべて PASS する
- [ ] テストケース M（abandon lastStep 検証）が PASS する
- [ ] テストケース N〜Q（既存イベント回帰ガード）がすべて PASS する
- [ ] テストケース R〜U（新規イベント全分岐）がすべて PASS する
- [ ] テストケース V〜W（dev/prod 環境分岐）がすべて PASS する
- [ ] `pnpm --filter @repo/desktop test:run` が全 PASS する（既存テストに回帰なし）
- [ ] 追加したテストケースの総数が 上記 A〜W の 23 ケース以上であることを確認する
