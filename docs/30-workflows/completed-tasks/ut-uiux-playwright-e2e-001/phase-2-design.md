# Phase 2: 設計

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 2                                       |
| 機能名 | Playwright E2E 動的テストフレームワーク |
| 作成日 | 2026-03-31                              |

## 目的

動的E2Eテストフレームワークのアーキテクチャを設計し、
「設定と実行ロジックの分離」「既存インフラの最大活用」「CI安定稼働」を実現する構成を確定する。

## フレームワーク設計

### ディレクトリ構成（新規追加分）

```
apps/desktop/
├── playwright.config.ts              ← ui-ux-layer1 / ui-ux-layer2 プロジェクト追加
└── e2e/
    ├── ui-ux/                        ← 新規ディレクトリ
    │   ├── test-targets.config.ts    ← テスト対象の動的設定（中心ファイル）
    │   ├── helpers.ts                ← UI/UX テスト専用ヘルパー
    │   ├── layer1-semantic.spec.ts   ← SEM-001〜007 実装
    │   ├── layer2-visual.spec.ts     ← VIS-001〜007 実装
    │   └── snapshots/               ← Visual baseline 画像（Git管理）
    │       ├── chat-main-vis-001.png
    │       ├── skill-list-vis-002.png
    │       └── ...
    ├── helpers/
    │   └── electron-app.ts           ← 既存（変更なし・再利用）
    └── mocks/
        └── electronAPI.mock.ts       ← 既存（変更なし・再利用）
```

### test-targets.config.ts の型設計

```typescript
// apps/desktop/e2e/ui-ux/test-targets.config.ts

export interface SemanticTarget {
  /** 検証対象のCSSセレクタ */
  selector: string;
  /** 期待される role 属性値 */
  expectedRole?: string;
  /** aria-label が必須か */
  requiresAriaLabel?: boolean;
  /** フォーカス可能であるべきか */
  focusable?: boolean;
}

export interface TestTarget {
  /** テスト対象識別子（スナップショットファイル名のプレフィックスになる） */
  id: string;
  /** 対象画面の説明 */
  description: string;
  /**
   * 画面へのナビゲーション方法
   * - url: Electron レンダラーの URL ハッシュ
   * - action: 手動操作が必要な場合のセットアップ関数名
   */
  navigation: { type: "url"; value: string } | { type: "action"; name: string };
  /** Layer 1 Semantic テストを実行するか */
  layer1: boolean;
  /** Layer 2 Visual regression テストを実行するか */
  layer2: boolean;
  /** Layer 1 で検証するセマンティック要素の定義 */
  semanticTargets?: SemanticTarget[];
  /** Visual テストのスクリーンショット領域（未指定時はフルページ） */
  screenshotClip?: { x: number; y: number; width: number; height: number };
}

export const TEST_TARGETS: TestTarget[] = [
  {
    id: "chat-main",
    description: "メインチャット画面",
    navigation: { type: "url", value: "#/chat" },
    layer1: true,
    layer2: true,
    semanticTargets: [
      {
        selector: '[data-testid="message-input"]',
        expectedRole: "textbox",
        focusable: true,
      },
      {
        selector: '[data-testid="send-button"]',
        expectedRole: "button",
        requiresAriaLabel: true,
      },
    ],
  },
  {
    id: "skill-list",
    description: "スキル一覧画面",
    navigation: { type: "url", value: "#/skills" },
    layer1: true,
    layer2: true,
    semanticTargets: [
      { selector: '[role="list"]', focusable: false },
      {
        selector: '[role="listitem"] button',
        expectedRole: "button",
        requiresAriaLabel: true,
      },
    ],
  },
  // 新しい画面を追加する際はここにエントリを追加するだけ
];
```

初期対象 7 件は Phase 1 の `FR-004` と 1:1 で対応させ、ここでは 2 件を代表例として示している。

**責務境界**: `test-targets.config.ts` の初期定義は Phase 4 の単独責務とし、Phase 5 以降は読み取り専用で扱う。

## 参照資料

| 資料名                   | パス                                                                   | 説明               |
| ------------------------ | ---------------------------------------------------------------------- | ------------------ |
| Phase 1 要件定義         | [phase-1-requirements.md](phase-1-requirements.md)                     | 受け入れ条件の前提 |
| 既存 E2E テスト参照      | `apps/desktop/e2e/settings-integration-regression-screenshots.spec.ts` | 既存パターン       |
| Playwright Electron 公式 | https://playwright.dev/docs/api/class/electronapplication              | 起動契約           |

## 実行手順

1. ディレクトリ構成を固定する。
2. `TestTarget` と `SemanticTarget` を定義する。
3. `playwright.config.ts` の変更方針を決める。
4. baseline と API key の扱いを明文化する。

## 統合テスト連携

- Phase 4 の実装で使う契約をここで固定する
- Phase 7 / 9 の baseline と検証方針をここで先に決める

## 多角的チェック観点（AIが判断）

| 観点       | 確認内容                                              |
| ---------- | ----------------------------------------------------- |
| 構造分解   | setting / helper / test / snapshot が分離されているか |
| システム   | 依存方向が一方向に閉じているか                        |
| 戦略・価値 | 追加対象の追従コストが低いか                          |
| 逆説思考   | patch より再構成が必要な境界を見誤っていないか        |

## サブタスク管理

1. ディレクトリ構成
2. `TestTarget` 型
3. Playwright project 設計
4. baseline / API key 方針

### layer1-semantic.spec.ts の設計

```typescript
// 設計方針: TEST_TARGETS を forEach でイテレートし、動的にテストを生成

import { TEST_TARGETS } from "./test-targets.config";

for (const target of TEST_TARGETS.filter((t) => t.layer1)) {
  test.describe(`[SEM] ${target.id} - ${target.description}`, () => {
    // SEM-001: role 属性
    test("SEM-001: インタラクティブ要素に role 属性が存在する", async ({ page }) => { ... });
    // SEM-002〜007: 各テストケース
  });
}
```

### playwright.config.ts の変更設計

```typescript
// 追加するプロジェクト定義
{
  name: "ui-ux-layer1",
  testMatch: "**/e2e/ui-ux/layer1-semantic.spec.ts",
  use: {
    ...devices["Desktop Chrome"],
    // Electron テストのため baseURL は使用しない
  },
},
{
  name: "ui-ux-layer2",
  testMatch: "**/e2e/ui-ux/layer2-visual.spec.ts",
  use: {
    ...devices["Desktop Chrome"],
  },
  // Visual テストは並列実行しない（スナップショット競合防止）
  fullyParallel: false,
},
```

## 技術的判断事項

### 判断1: Electron `_electron` API vs Playwright ブラウザ Context

| アプローチ               | メリット                                 | デメリット                     |
| ------------------------ | ---------------------------------------- | ------------------------------ |
| `_electron.launch()`     | 実際の Electron 環境でテスト可能         | 起動時間が長い（約3〜5秒）     |
| `page`（Webブラウザ）    | 高速・安定                               | Electron IPC が使えない        |
| 既存 `launchElectronApp` | 認証モック込みの起動ロジックが再利用可能 | ヘルパーの変更が波及する可能性 |

**採用**: 既存の `apps/desktop/e2e/helpers/electron-app.ts` の `launchElectronApp()` を再利用。
UI/UX テストは Electron IPC に直接依存しないため、将来的に Playwright ブラウザ Context へ
移行できる余地を残す設計とする。

### 判断2: Visual テストの baseline 管理

| アプローチ          | メリット                          | デメリット                             |
| ------------------- | --------------------------------- | -------------------------------------- |
| Git にコミット      | PR でビジュアル差分をレビュー可能 | 画像ファイルがリポジトリを肥大化させる |
| CI アーティファクト | リポジトリを汚染しない            | CI をまたいだ比較が困難                |
| 外部ストレージ      | 柔軟                              | 設定が複雑                             |

**採用**: `apps/desktop/e2e/ui-ux/snapshots/` にコミット（既存の `spec-screenshots` パターンと統一）。
`.gitattributes` で PNG を `binary` 指定してdiff を抑制する。

### 判断3: ANTHROPIC_API_KEY 対応

**採用**: `global-setup.ts` に `process.env.ANTHROPIC_API_KEY ??= "dummy-test-key"` を追加し、
既存の electronAPI モックで AI 呼び出しパスをスタブ化する。
テスト専用の設定で実 API は呼ばない。

## SEM テストロジックの詳細設計

### SEM-004: Tab キーナビゲーション検証

```typescript
// アルゴリズム: Tab を押すたびにフォーカス要素を記録し、
// インタラクティブ要素が全てカバーされていることを確認

async function verifyTabNavigation(page: Page, targetSelectors: string[]) {
  const focusedElements: string[] = [];
  const maxTabs = targetSelectors.length + 5; // 余裕を持って Tab を押す回数

  for (let i = 0; i < maxTabs; i++) {
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      return el ? (el.getAttribute("data-testid") ?? el.tagName) : null;
    });
    if (focused) focusedElements.push(focused);
  }

  for (const selector of targetSelectors) {
    expect(focusedElements).toContain(selector);
  }
}
```

### VIS テストの閾値設計

| 画面種別           | `maxDiffPixels` | 理由                                       |
| ------------------ | --------------- | ------------------------------------------ |
| 動的コンテンツあり | 50              | チャット・スキル一覧：コンテンツ差異を許容 |
| 静的 UI            | 20              | エラー・ローディング：ピクセル精度を高める |
| アニメーション含む | 100             | タイムスタンプ等の差分を吸収               |

## 既存テストとの干渉防止

- `settings-integration-regression-screenshots.spec.ts` の snapshots は `apps/desktop/e2e/` 直下
- 新しい UI/UX snapshots は `apps/desktop/e2e/ui-ux/snapshots/` に分離
- プロジェクト設定で `testMatch` を限定し、既存テストが `ui-ux-layer*` に含まれないようにする

## 成果物

| 成果物               | パス                             | 説明                       |
| -------------------- | -------------------------------- | -------------------------- |
| 設計書（本ファイル） | phase-2-design.md                | アーキテクチャ・型設計     |
| テスト戦略           | outputs/phase-2/test-strategy.md | Layer 1/2 テストケース詳細 |

## 完了条件

- [x] フレームワークのディレクトリ構成が決定されている
- [x] `test-targets.config.ts` の型設計が完了している
- [x] `playwright.config.ts` の変更設計が完了している
- [x] SEM-004 のタブナビゲーション検証アルゴリズムが設計されている
- [x] Visual テストの閾値ポリシーが決定されている
- [x] 既存テストとの干渉防止方針が決定されている
- [x] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] Phase 4 の実装に必要な契約が明文化されている
- [ ] `test-targets.config.ts` の所有権が Phase 4 に固定されている
- [ ] baseline と API key の扱いが曖昧でない

## 次のPhase

Phase 3: 設計レビュー
