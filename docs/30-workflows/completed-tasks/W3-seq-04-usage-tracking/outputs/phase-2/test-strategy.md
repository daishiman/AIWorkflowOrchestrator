# テスト戦略

## メタ情報

| 項目     | 内容                      |
| -------- | ------------------------- |
| Phase    | 2                         |
| タスクID | UT-SKILL-WIZARD-W3-seq-04 |
| 作成日   | 2026-04-08                |
| 状態     | completed                 |

---

## 1. テスト方針の概要

本タスクは NON_VISUAL であるため、テストの主証跡は以下の 2 つとする。

1. **自動テスト（Vitest）**: `trackEvent` のモックを用いた単体テスト
2. **コンソール証跡**: 開発環境での `console.info` ログ出力確認

スクリーンショットは主証跡としない。

---

## 2. モックテスト方針

### 2.1 モック化方法

`trackEvent` を `vi.mock` で差し替え、発火回数・イベント名・payload を `expect` で検証する。

```typescript
// テストファイル例
import { vi, describe, it, expect, beforeEach } from "vitest";
import * as trackEventModule from "@/renderer/utils/trackEvent";

vi.mock("@/renderer/utils/trackEvent", () => ({
  trackEvent: vi.fn(),
}));

const mockTrackEvent = vi.mocked(trackEventModule.trackEvent);

beforeEach(() => {
  mockTrackEvent.mockClear();
});
```

### 2.2 テストファイル配置

```
apps/desktop/src/renderer/utils/__tests__/
└── trackEvent.test.ts          # trackEvent 単体テスト

apps/desktop/src/renderer/components/skill/__tests__/
└── SkillCreateWizard.tracking.test.tsx  # 計装ポイント統合テスト
```

---

## 3. AC 対応テストケース一覧

### AC-01: skill_wizard_started

| テストケース | 検証内容                                                                           |
| ------------ | ---------------------------------------------------------------------------------- |
| TC-01-01     | マウント時に `trackEvent("skill_wizard_started", {})` が 1 回だけ呼ばれる          |
| TC-01-02     | アンマウント後に再マウントした場合、計 2 回目が記録される（再マウントごとに 1 回） |
| TC-01-03     | payload が空オブジェクト `{}` であること                                           |

```typescript
it("マウント時に skill_wizard_started が 1 回だけ発火する", () => {
  render(<SkillCreateWizard {...props} />);
  expect(mockTrackEvent).toHaveBeenCalledTimes(1);
  expect(mockTrackEvent).toHaveBeenCalledWith("skill_wizard_started", {});
});
```

### AC-02: skill_wizard_step1_completed

| テストケース | 検証内容                                                                    |
| ------------ | --------------------------------------------------------------------------- |
| TC-02-01     | 全問回答完了時に `method: "complete"`, `skippedAtQuestion: null` で発火する |
| TC-02-02     | スキップ時に `method: "skip"`, `skippedAtQuestion: 3`（例）で発火する       |
| TC-02-03     | `method === "complete"` の場合 `skippedAtQuestion` が必ず `null` である     |
| TC-02-04     | `method === "skip"` の場合 `skippedAtQuestion` が `null` でないこと         |

```typescript
it("complete 完了時に skippedAtQuestion: null で発火する", async () => {
  // Step 1 全問回答後に生成ボタンを押す
  await user.click(screen.getByRole("button", { name: /生成/ }));
  expect(mockTrackEvent).toHaveBeenCalledWith("skill_wizard_step1_completed", {
    method: "complete",
    skippedAtQuestion: null,
  });
});

it("スキップ時に skippedAtQuestion が現在質問番号で発火する", async () => {
  // 3 問目でスキップボタンを押す
  await user.click(screen.getByRole("button", { name: /スキップ/ }));
  expect(mockTrackEvent).toHaveBeenCalledWith("skill_wizard_step1_completed", {
    method: "skip",
    skippedAtQuestion: 3,
  });
});
```

### AC-03: skill_wizard_generation_completed

| テストケース | 検証内容                                                                         |
| ------------ | -------------------------------------------------------------------------------- |
| TC-03-01     | 生成成功時に `category` と `hasExternalIntegration` が生成結果と一致して発火する |
| TC-03-02     | 生成失敗時（エラー throw）は発火しない                                           |
| TC-03-03     | `method` が Step 1 の完了方式（complete/skip）と一致する                         |

```typescript
it("生成成功時のみ skill_wizard_generation_completed が発火する", async () => {
  mockGenerateSkill.mockResolvedValue({
    category: "automation",
    hasExternalIntegration: true,
  });
  await user.click(screen.getByRole("button", { name: /生成/ }));
  expect(mockTrackEvent).toHaveBeenCalledWith(
    "skill_wizard_generation_completed",
    {
      method: "complete",
      category: "automation",
      hasExternalIntegration: true,
    },
  );
});

it("生成失敗時は skill_wizard_generation_completed が発火しない", async () => {
  mockGenerateSkill.mockRejectedValue(new Error("generation failed"));
  await user.click(screen.getByRole("button", { name: /生成/ }));
  expect(mockTrackEvent).not.toHaveBeenCalledWith(
    "skill_wizard_generation_completed",
    expect.anything(),
  );
});
```

### AC-04: skill_skeleton_quality_feedback

| テストケース | 検証内容                                                                      |
| ------------ | ----------------------------------------------------------------------------- |
| TC-04-01     | 👍 押下時に `satisfied: true` で発火する                                      |
| TC-04-02     | 👎 押下時に `satisfied: false` で発火する                                     |
| TC-04-03     | `generationMethod: "complete"` のとき Step 1 が complete 完了だった場合と一致 |
| TC-04-04     | `generationMethod: "skip"` のとき Step 1 がスキップだった場合と一致           |

```typescript
it("👍 押下時に satisfied: true で発火する", async () => {
  await user.click(screen.getByRole("button", { name: /👍/ }));
  expect(mockTrackEvent).toHaveBeenCalledWith(
    "skill_skeleton_quality_feedback",
    {
      satisfied: true,
      generationMethod: "complete",
    },
  );
});
```

### AC-05: skill_wizard_next_action

| テストケース | 検証内容                                                       |
| ------------ | -------------------------------------------------------------- |
| TC-05-01     | 「実行」選択時に `action: "execute"` で発火する                |
| TC-05-02     | 「エディタで開く」選択時に `action: "open_editor"` で発火する  |
| TC-05-03     | 「もう一つ作成」選択時に `action: "create_another"` で発火する |

```typescript
it.each([
  ["execute", /実行/],
  ["open_editor", /エディタで開く/],
  ["create_another", /もう一つ作成/],
] as const)(
  "アクション %s 選択時に正しい payload で発火する",
  async (action, label) => {
    await user.click(screen.getByRole("button", { name: label }));
    expect(mockTrackEvent).toHaveBeenCalledWith("skill_wizard_next_action", {
      action,
    });
  },
);
```

---

## 4. エッジケース（Phase 6 での追加対象）

| エッジケース                     | 対象 AC | 検証内容                                                                      |
| -------------------------------- | ------- | ----------------------------------------------------------------------------- |
| 重複マウント                     | AC-01   | 同一セッション内でアンマウント→再マウントした場合に余分な発火がないことを確認 |
| 各 question 番号での skip        | AC-02   | 質問 1〜6 の各番号でスキップした際の `skippedAtQuestion` 値を検証             |
| 生成失敗後の再試行               | AC-03   | 失敗→再試行→成功のフローで `generation_completed` が成功時のみ発火            |
| 複数回フィードバック             | AC-04   | 同一セッションで 👍→👎 と押した場合の発火回数と payload を検証                |
| 同一セッション内の複数アクション | AC-05   | 同一セッションで複数アクションを選択した場合に選択ごとに 1 回発火             |

---

## 5. trackEvent 単体テスト

```typescript
// trackEvent.test.ts
describe("trackEvent", () => {
  it("dev 環境では console.info を呼ぶ", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    trackEvent("skill_wizard_started", {});
    expect(spy).toHaveBeenCalledWith(
      "[trackEvent]",
      "skill_wizard_started",
      {},
    );
  });

  it("production 環境では console.info を呼ばない", () => {
    vi.stubEnv("NODE_ENV", "production");
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    trackEvent("skill_wizard_started", {});
    expect(spy).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });
});
```

---

## 6. Phase 11（手動確認）との連携

Phase 11 は NON_VISUAL であるため、以下を主証跡とする。

| 確認項目                   | 確認方法                                                                           |
| -------------------------- | ---------------------------------------------------------------------------------- |
| 各イベントの発火確認       | ブラウザ開発者ツールのコンソールで `[trackEvent]` プレフィックス付きログを目視確認 |
| payload の内容確認         | コンソールログの payload オブジェクトを確認                                        |
| production での no-op 確認 | `NODE_ENV=production` のビルドでコンソールログが出ないことを確認                   |

スクリーンショットは不要。`manual-test-checklist.md` / `manual-test-result.md` を主証跡ドキュメントとする。

---

## 完了条件チェックリスト

- [x] AC-01〜AC-05 に 1 対 1 で対応するテストケースが定義されていること
- [x] `vi.mock` を用いたモックテスト方針が記述されていること
- [x] Phase 6 のエッジケース追加対象が明記されていること
- [x] Phase 11 の NON_VISUAL 証跡方針が明記されていること
- [x] trackEvent 単体テスト方針が記述されていること
- [x] 矛盾なし・漏れなし
