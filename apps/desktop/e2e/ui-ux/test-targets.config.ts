/**
 * UI/UX E2E テスト対象設定
 *
 * このファイルが「どの画面を評価するか」の唯一の設定源。
 * 新しい画面を追加する場合は TEST_TARGETS 配列にエントリを追加するだけ。
 * Phase 4 が所有権を持ち、Phase 5 以降は読み取り専用で扱う。
 *
 * FR-002: 動的テスト対象設定（test-targets.config.ts への集約）
 */

export interface SemanticTarget {
  /** 検証対象の CSS セレクタ */
  selector: string;
  /** 期待される role 属性値 */
  expectedRole?: string;
  /** aria-label が必須か */
  requiresAriaLabel?: boolean;
  /** フォーカス可能であるべきか */
  focusable?: boolean;
}

export interface TestTarget {
  /**
   * テスト対象識別子（スナップショットファイル名のプレフィックスになる）
   * kebab-case で一意に命名する。
   */
  id: string;
  /** 対象画面の説明 */
  description: string;
  /**
   * 画面へのナビゲーション方法
   * - url: Playwright の page.goto() に渡すパス（baseURL からの相対）
   * - action: ヘルパー関数 navigateToTarget() に渡すアクション名
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
  /** Visual テストの maxDiffPixels 閾値（未指定時は 50） */
  maxDiffPixels?: number;
}

/**
 * テスト対象 7 画面の初期定義
 *
 * Phase 1 の FR-004 (VIS-001〜007) と 1:1 対応。
 *
 * VIS-001: チャット画面
 * VIS-002: スキル一覧画面
 * VIS-003: 設定画面（一般タブ）
 * VIS-004: サイドバーナビゲーション
 * VIS-005: エラー表示コンポーネント
 * VIS-006: ローディング状態
 * VIS-007: ダークモード（テーマ切り替え後）
 */
export const TEST_TARGETS: TestTarget[] = [
  // VIS-001: チャット画面（メインチャット）
  {
    id: "chat-main",
    description: "メインチャット画面",
    navigation: { type: "url", value: "/" },
    layer1: true,
    layer2: true,
    semanticTargets: [
      {
        selector: '[data-testid="message-input"], textarea, [role="textbox"]',
        expectedRole: "textbox",
        focusable: true,
      },
      {
        selector:
          '[data-testid="send-button"], button[type="submit"], [aria-label*="送信"]',
        expectedRole: "button",
        requiresAriaLabel: false,
      },
    ],
    maxDiffPixels: 50,
  },
  // VIS-002: スキル一覧画面
  {
    id: "skill-list",
    description: "スキル一覧画面",
    navigation: { type: "action", name: "navigate-to-skills" },
    layer1: true,
    layer2: true,
    semanticTargets: [
      {
        selector: '[role="list"], [data-testid="skill-list"]',
        focusable: false,
      },
      {
        selector:
          '[role="listitem"] button, [data-testid="skill-item"] button, [data-view-id="skills"]',
        expectedRole: "button",
        focusable: true,
      },
    ],
    maxDiffPixels: 50,
  },
  // VIS-003: 設定画面（一般タブ）
  {
    id: "settings-general",
    description: "設定画面（一般タブ）",
    navigation: { type: "action", name: "navigate-to-settings" },
    layer1: true,
    layer2: true,
    semanticTargets: [
      {
        selector: '[data-testid="settings-view"], [role="main"]',
        focusable: false,
      },
      {
        selector: '[role="tab"], [role="radio"]',
        focusable: true,
      },
    ],
    maxDiffPixels: 50,
  },
  // VIS-004: サイドバーナビゲーション
  {
    id: "sidebar-navigation",
    description: "サイドバーナビゲーション",
    navigation: { type: "url", value: "/" },
    layer1: true,
    layer2: true,
    semanticTargets: [
      {
        selector: '[role="navigation"], nav, [data-testid="sidebar"]',
        focusable: false,
      },
      {
        selector: 'nav button, [role="navigation"] button',
        expectedRole: "button",
        focusable: true,
      },
    ],
    screenshotClip: { x: 0, y: 0, width: 200, height: 768 },
    maxDiffPixels: 30,
  },
  // VIS-005: エラー表示コンポーネント
  {
    id: "error-display",
    description: "エラー表示コンポーネント",
    navigation: { type: "action", name: "trigger-error-state" },
    layer1: true,
    layer2: true,
    semanticTargets: [
      {
        selector:
          '[role="alert"], [aria-live="assertive"], [aria-live="polite"]',
        focusable: false,
      },
    ],
    maxDiffPixels: 20,
  },
  // VIS-006: ローディング状態
  {
    id: "loading-state",
    description: "ローディング状態",
    navigation: { type: "action", name: "trigger-loading-state" },
    layer1: false,
    layer2: true,
    maxDiffPixels: 20,
  },
  // VIS-007: ダークモード（テーマ切り替え後）
  {
    id: "dark-mode",
    description: "ダークモード（テーマ切り替え後）",
    navigation: { type: "action", name: "switch-to-dark-mode" },
    layer1: false,
    layer2: true,
    maxDiffPixels: 50,
  },
] as const satisfies TestTarget[];
