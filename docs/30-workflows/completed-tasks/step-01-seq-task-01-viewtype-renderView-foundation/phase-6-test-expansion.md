# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------ |
| タスクID   | TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001                                                                                    |
| Phase      | 6 - テスト拡充                                                                                                                 |
| 前 Phase   | Phase 5 - 実装                                                                                                                 |
| 次 Phase   | Phase 7 - カバレッジ確認                                                                                                       |
| 依存成果物 | `phase-4-test-creation.md`（Phase 4 テストケース設計）、`phase-5-implementation.md`（実装成果物）                              |
| 成果物パス | `docs/30-workflows/skill-lifecycle-routing/tasks/step-01-seq-task-01-viewtype-renderView-foundation/phase-6-test-expansion.md` |
| ステータス | not_started                                                                                                                    |

## 目的

Phase 4 で設計したテスト（TC-VT-01〜04、TC-RV-01〜03、TC-SL-01〜05）では検証されていない挙動を特定し、補完テストを追加する。具体的には以下の3カテゴリが未カバーである。

1. **onClose コールバック動作** — `renderView()` 各 case の onClose 呼び出し時に `setCurrentView` / `setCurrentSkillName` が正しく呼ばれるか
2. **normalizeSkillLifecycleView の境界値** — 新 ViewType（`skillAnalysis` / `skillCreate`）および未知の文字列を渡した場合の動作
3. **onAction optional chaining 安全性** — `undefined` のまま呼び出されたときにエラーが発生しないこと

Phase 7 のカバレッジ基準（Line 80%+、Branch 60%+、Function 80%+）を満たすために必要な補完テストを設計・実装する。

## 実行タスク

- カバレッジ現状確認: Phase 5 実装後のカバレッジを確認し追加が必要な箇所を特定
- onClose コールバック検証テスト追加: renderView() 各 case の onClose 呼び出し検証
- normalizeSkillLifecycleView 境界値テスト追加: 新 ViewType・legacy alias・未知文字列の動作検証
- onAction optional chaining 安全性テスト追加: undefined / 関数パターン / 複数呼び出しの検証
- テスト実行確認: 追加テスト全件 PASS とカバレッジ再確認

## 実行手順

### Task 1: カバレッジ現状確認

Phase 5 実装後の時点でカバレッジを確認し、追加が必要な箇所を特定する。

```bash
cd apps/desktop && pnpm vitest run --coverage \
  src/renderer/store/types.test.ts \
  src/renderer/__tests__/App.renderView.viewtype.test.tsx \
  src/renderer/navigation/skillLifecycleJourney.test.ts \
  2>&1 | tail -30
```

---

### Task 2: renderView() onClose コールバック検証テストの追加

**対象ファイル:** `apps/desktop/src/renderer/__tests__/App.renderView.viewtype.test.tsx`

Phase 4 の TC-RV-01〜03 はコンポーネントの描画確認のみで、onClose コールバックの呼び出し内容が未検証である。以下のテストを既存の `describe` ブロック末尾に追加する。

**追加するテストコード:**

```typescript
it("TC-RV-04: skillAnalysis の onClose が setCurrentView('skillCenter') を呼ぶこと", async () => {
  mockCurrentView = "skillAnalysis";

  const { useCurrentView, useAppStore } = await import("@/renderer/store");
  (useCurrentView as ReturnType<typeof vi.fn>).mockReturnValue("skillAnalysis");
  (useAppStore as ReturnType<typeof vi.fn>).mockImplementation(
    (selector: (state: Record<string, unknown>) => unknown) => {
      return selector({
        initializeAuth: mockInitializeAuth,
        isAuthenticated: false,
        isLoading: false,
        themeMode: "system",
        setThemeMode: vi.fn(),
        updateUserProfile: vi.fn(),
        userProfile: { name: "Test User" },
        setCurrentView: mockSetCurrentView,
        goBack: mockGoBack,
        viewHistory: ["dashboard"],
        currentSkillName: "my-skill",
        setCurrentSkillName: mockSetCurrentSkillName,
        dynamicIsland: { status: "idle", message: "", visible: false },
        setWindowSize: mockSetWindowSize,
      });
    },
  );

  const App = (await import("@/renderer/App")).default;
  render(React.createElement(App));

  // onClose ボタンをクリック（P39: happy-dom では fireEvent を使用）
  fireEvent.click(screen.getByTestId("skill-analysis-close"));

  expect(mockSetCurrentView).toHaveBeenCalledWith("skillCenter");
});

it("TC-RV-05: skillAnalysis の onClose が setCurrentSkillName(null) を呼ぶこと (AC-2)", async () => {
  mockCurrentView = "skillAnalysis";

  const { useCurrentView, useAppStore } = await import("@/renderer/store");
  (useCurrentView as ReturnType<typeof vi.fn>).mockReturnValue("skillAnalysis");
  (useAppStore as ReturnType<typeof vi.fn>).mockImplementation(
    (selector: (state: Record<string, unknown>) => unknown) => {
      return selector({
        initializeAuth: mockInitializeAuth,
        isAuthenticated: false,
        isLoading: false,
        themeMode: "system",
        setThemeMode: vi.fn(),
        updateUserProfile: vi.fn(),
        userProfile: { name: "Test User" },
        setCurrentView: mockSetCurrentView,
        goBack: mockGoBack,
        viewHistory: ["dashboard"],
        currentSkillName: "some-skill",
        setCurrentSkillName: mockSetCurrentSkillName,
        dynamicIsland: { status: "idle", message: "", visible: false },
        setWindowSize: mockSetWindowSize,
      });
    },
  );

  const App = (await import("@/renderer/App")).default;
  render(React.createElement(App));

  fireEvent.click(screen.getByTestId("skill-analysis-close"));

  // currentSkillName が null にリセットされること
  expect(mockSetCurrentSkillName).toHaveBeenCalledWith(null);
});

it("TC-RV-06: skillCreate の onClose が setCurrentView('skillCenter') を呼ぶこと (AC-3)", async () => {
  mockCurrentView = "skillCreate";

  const { useCurrentView, useAppStore } = await import("@/renderer/store");
  (useCurrentView as ReturnType<typeof vi.fn>).mockReturnValue("skillCreate");
  (useAppStore as ReturnType<typeof vi.fn>).mockImplementation(
    (selector: (state: Record<string, unknown>) => unknown) => {
      return selector({
        initializeAuth: mockInitializeAuth,
        isAuthenticated: false,
        isLoading: false,
        themeMode: "system",
        setThemeMode: vi.fn(),
        updateUserProfile: vi.fn(),
        userProfile: { name: "Test User" },
        setCurrentView: mockSetCurrentView,
        goBack: mockGoBack,
        viewHistory: ["dashboard"],
        currentSkillName: null,
        setCurrentSkillName: mockSetCurrentSkillName,
        dynamicIsland: { status: "idle", message: "", visible: false },
        setWindowSize: mockSetWindowSize,
      });
    },
  );

  const App = (await import("@/renderer/App")).default;
  render(React.createElement(App));

  fireEvent.click(screen.getByTestId("skill-create-close"));

  expect(mockSetCurrentView).toHaveBeenCalledWith("skillCenter");
});

it("TC-RV-07: skillCreate の onClose が setCurrentSkillName を呼ばないこと (AC-3)", async () => {
  mockCurrentView = "skillCreate";

  const { useCurrentView, useAppStore } = await import("@/renderer/store");
  (useCurrentView as ReturnType<typeof vi.fn>).mockReturnValue("skillCreate");
  (useAppStore as ReturnType<typeof vi.fn>).mockImplementation(
    (selector: (state: Record<string, unknown>) => unknown) => {
      return selector({
        initializeAuth: mockInitializeAuth,
        isAuthenticated: false,
        isLoading: false,
        themeMode: "system",
        setThemeMode: vi.fn(),
        updateUserProfile: vi.fn(),
        userProfile: { name: "Test User" },
        setCurrentView: mockSetCurrentView,
        goBack: mockGoBack,
        viewHistory: ["dashboard"],
        currentSkillName: null,
        setCurrentSkillName: mockSetCurrentSkillName,
        dynamicIsland: { status: "idle", message: "", visible: false },
        setWindowSize: mockSetWindowSize,
      });
    },
  );

  const App = (await import("@/renderer/App")).default;
  render(React.createElement(App));

  fireEvent.click(screen.getByTestId("skill-create-close"));

  // skillCreate は currentSkillName を持たないため setCurrentSkillName を呼ばない
  expect(mockSetCurrentSkillName).not.toHaveBeenCalled();
});

it("TC-RV-08: skillCenter case が引き続き SkillCenterView を描画すること (回帰テスト)", async () => {
  mockCurrentView = "skillCenter";

  const { useCurrentView, useAppStore } = await import("@/renderer/store");
  (useCurrentView as ReturnType<typeof vi.fn>).mockReturnValue("skillCenter");
  (useAppStore as ReturnType<typeof vi.fn>).mockImplementation(
    (selector: (state: Record<string, unknown>) => unknown) => {
      return selector({
        initializeAuth: mockInitializeAuth,
        isAuthenticated: false,
        isLoading: false,
        themeMode: "system",
        setThemeMode: vi.fn(),
        updateUserProfile: vi.fn(),
        userProfile: { name: "Test User" },
        setCurrentView: mockSetCurrentView,
        goBack: mockGoBack,
        viewHistory: ["dashboard"],
        currentSkillName: null,
        setCurrentSkillName: mockSetCurrentSkillName,
        dynamicIsland: { status: "idle", message: "", visible: false },
        setWindowSize: mockSetWindowSize,
      });
    },
  );

  const App = (await import("@/renderer/App")).default;
  render(React.createElement(App));

  expect(screen.getByTestId("skill-center-view")).toBeTruthy();
});
```

**注意:** `fireEvent` を import に追加する。

```typescript
// 変更前
import { render, screen, cleanup } from "@testing-library/react";

// 変更後
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
```

---

### Task 3: normalizeSkillLifecycleView の境界値テスト追加

**対象ファイル:** `apps/desktop/src/renderer/navigation/skillLifecycleJourney.test.ts`

Phase 4 の TC-SL-04〜05 は新 ViewType が「そのまま返る」ことを検証しているが、以下が未カバーである。

- 既存の legacy alias（`"skill-center"`）への影響がないことの確認
- 未知の文字列を渡した場合の型ガード動作

既存の `describe("skillLifecycleJourney", ...)` ブロック末尾に追加する。

**追加するテストコード:**

```typescript
it("TC-SL-06: normalizeSkillLifecycleView が skillAnalysis をそのまま返すこと (境界値)", () => {
  // skillAnalysis は legacy alias ではないため変換不要
  const result = normalizeSkillLifecycleView(
    "skillAnalysis" as import("../store/types").ViewType,
  );
  expect(result).toBe("skillAnalysis");
  expect(result).not.toBe("skillCenter");
});

it("TC-SL-07: normalizeSkillLifecycleView が skillCreate をそのまま返すこと (境界値)", () => {
  const result = normalizeSkillLifecycleView(
    "skillCreate" as import("../store/types").ViewType,
  );
  expect(result).toBe("skillCreate");
  expect(result).not.toBe("skillCenter");
});

it("TC-SL-08: normalizeSkillLifecycleView の skill-center → skillCenter 変換が skillAnalysis/skillCreate 追加後も維持されること (回帰)", () => {
  // 新 ViewType 追加によって既存の normalize 処理が破壊されていないことを確認
  expect(normalizeSkillLifecycleView("skill-center")).toBe("skillCenter");
  expect(normalizeSkillLifecycleView("skillCenter")).toBe("skillCenter");
  expect(normalizeSkillLifecycleView("workspace")).toBe("workspace");
  expect(normalizeSkillLifecycleView("dashboard")).toBe("dashboard");
});
```

---

### Task 4: onAction optional chaining 安全性テスト追加

**対象ファイル:** `apps/desktop/src/renderer/navigation/skillLifecycleJourney.test.ts`

Phase 4 の TC-SL-01〜02 は型レベルの検証にとどまる。実行時に `onAction?.()` が安全に呼び出せるかの検証が未カバーである。

**追加するテストコード:**

```typescript
it("TC-SL-09: onAction が undefined のとき optional chaining 呼び出しがエラーにならないこと", () => {
  const guide: SkillLifecycleJobGuide = {
    id: "create",
    title: "テスト",
    entryLabel: "エントリ",
    handoffLabel: "ハンドオフ",
    summary: "サマリー",
    completion: "完了",
    // onAction を省略
  };

  // optional chaining で呼び出してもエラーにならないことを確認
  expect(() => guide.onAction?.()).not.toThrow();
  expect(guide.onAction?.()).toBeUndefined();
});

it("TC-SL-10: onAction に関数が渡されたとき正しく呼び出されること", () => {
  const mockOnAction = vi.fn();
  const guide: SkillLifecycleJobGuide = {
    id: "use",
    title: "テスト",
    entryLabel: "エントリ",
    handoffLabel: "ハンドオフ",
    summary: "サマリー",
    completion: "完了",
    onAction: mockOnAction,
  };

  guide.onAction?.();

  expect(mockOnAction).toHaveBeenCalledTimes(1);
});

it("TC-SL-11: onAction が複数回呼び出されても累積されないこと", () => {
  const mockOnAction = vi.fn();
  const guide: SkillLifecycleJobGuide = {
    id: "improve",
    title: "テスト",
    entryLabel: "エントリ",
    handoffLabel: "ハンドオフ",
    summary: "サマリー",
    completion: "完了",
    onAction: mockOnAction,
  };

  guide.onAction?.();
  guide.onAction?.();
  guide.onAction?.();

  // 3回呼び出されること（副作用の累積がないことは mockOnAction 側で検証）
  expect(mockOnAction).toHaveBeenCalledTimes(3);
});
```

**注意:** TC-SL-10〜11 は `vi` を使用するため、既存の import に `vi` が含まれていることを確認する。

---

### Task 5: テスト実行確認

追加したテストが全件 PASS することを確認する。

```bash
cd apps/desktop && pnpm vitest run \
  src/renderer/store/types.test.ts \
  src/renderer/__tests__/App.renderView.viewtype.test.tsx \
  src/renderer/navigation/skillLifecycleJourney.test.ts
```

全件 PASS 後にカバレッジを再確認して Phase 7 への引き継ぎ値を記録する。

```bash
cd apps/desktop && pnpm vitest run --coverage \
  src/renderer/store/types.test.ts \
  src/renderer/__tests__/App.renderView.viewtype.test.tsx \
  src/renderer/navigation/skillLifecycleJourney.test.ts \
  2>&1 | grep -E "% Lines|% Branch|% Funcs|% Stmts"
```

## 参照資料

### タスク関連

| 資料名                         | パス                                                                 | 説明                                              |
| ------------------------------ | -------------------------------------------------------------------- | ------------------------------------------------- |
| Phase 4 テストケース設計       | `phase-4-test-creation.md`                                           | TC-VT-01〜04 / TC-RV-01〜03 / TC-SL-01〜05 の定義 |
| Phase 5 実装成果物             | `phase-5-implementation.md`                                          | 変更3ファイルの最終差分                           |
| Phase 2 設計（renderView設計） | `phase-2-design.md`                                                  | onClose 実装スニペット（設計根拠）                |
| App テスト（モック構成参考）   | `apps/desktop/src/renderer/__tests__/App.debug-removal.test.tsx`     | モック構成・beforeEach パターンのリファレンス     |
| skillLifecycleJourney テスト   | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.test.ts` | 追加対象（既存テストの末尾に追記）                |

### システム仕様

| 資料名           | パス                                              | 説明                                                    |
| ---------------- | ------------------------------------------------- | ------------------------------------------------------- |
| 落とし穴 P39     | `.claude/rules/06-known-pitfalls.md#P39`          | happy-dom 環境では `userEvent` 禁止、`fireEvent` を使用 |
| 落とし穴 P9      | `.claude/rules/06-known-pitfalls.md#P9`           | テスト間で状態を共有しない（`beforeEach` でリセット）   |
| 落とし穴 P40     | `.claude/rules/06-known-pitfalls.md#P40`          | テスト実行は `apps/desktop/` ディレクトリから           |
| 落とし穴 P41     | `.claude/rules/06-known-pitfalls.md#P41`          | v8 カバレッジ: インライン arrow function のカウント     |
| コード品質ルール | `.claude/rules/02-code-quality.md#カバレッジ基準` | Line 80%+、Branch 60%+、Function 80%+ が最低基準        |

## 統合テスト連携

Phase 6 で追加するテストは既存の Phase 4 テストと同一のテストファイルに追記する。Phase 7 では3ファイルを対象にカバレッジを計測する。

**Phase 7 への引き継ぎ期待値（Phase 6 完了後の目標）:**

| ファイル                                               | 対象関数・分岐                                  | Phase 6 追加後の期待カバレッジ |
| ------------------------------------------------------ | ----------------------------------------------- | ------------------------------ |
| `App.tsx` renderView()                                 | skillAnalysis / skillCreate の onClose 分岐     | Branch 70%+                    |
| `skillLifecycleJourney.ts` normalizeSkillLifecycleView | 新 ViewType パス、skill-center パス、その他パス | Branch 100%                    |
| `skillLifecycleJourney.ts` SkillLifecycleJobGuide      | onAction undefined / 関数パターン               | Function 100%                  |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装の場合           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計            | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |
| データ整合性       | DB操作の場合                       | `aiworkflow-requirements: database-*.md`     |
| エラーハンドリング | 例外処理が必要な場合               | `aiworkflow-requirements: error-handling.md` |
| パフォーマンス     | 性能要件がある場合                 | `aiworkflow-requirements: architecture-*.md` |
| アクセシビリティ   | UI実装の場合                       | `aiworkflow-requirements: ui-ux-*.md`        |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React実装の場合          | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer連携の場合     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | データ永続化の場合          | `aiworkflow-requirements: database-*.md`               |

## 成果物

| 成果物                                       | パス                                                                   | 種別         | 変更種別 |
| -------------------------------------------- | ---------------------------------------------------------------------- | ------------ | -------- |
| App renderView テスト（TC-RV-04〜08）        | `apps/desktop/src/renderer/__tests__/App.renderView.viewtype.test.tsx` | テストコード | 追記     |
| skillLifecycleJourney テスト（TC-SL-06〜11） | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.test.ts`   | テストコード | 追記     |

## 完了条件

- [ ] `App.renderView.viewtype.test.tsx` に TC-RV-04〜08 の 5 テストが追加されている
- [ ] `skillLifecycleJourney.test.ts` に TC-SL-06〜11 の 6 テストが追加されている
- [ ] `fireEvent` が `App.renderView.viewtype.test.tsx` の import に追加されている
- [ ] TC-RV-04: `setCurrentView("skillCenter")` の呼び出しが検証されている
- [ ] TC-RV-05: `setCurrentSkillName(null)` のリセットが検証されている（AC-2）
- [ ] TC-RV-06: skillCreate の onClose で `setCurrentView("skillCenter")` が検証されている（AC-3）
- [ ] TC-RV-07: skillCreate の onClose で `setCurrentSkillName` が呼ばれないことが検証されている
- [ ] TC-SL-09: `onAction` が `undefined` のとき optional chaining がエラーにならないことが検証されている
- [ ] TC-SL-11: `onAction` が複数回呼び出されても正しく動作することが検証されている
- [ ] 追加テストを含む全テストが `pnpm vitest run` で PASS している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-lifecycle-routing --phase 6
```

## 次 Phase

Phase 7: カバレッジ確認（`phase-7-coverage-check.md`）
