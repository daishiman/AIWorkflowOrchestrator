# Phase 8 コンポーネント抽出判定

| 候補                        | 判定                    | 理由                                                                                                           |
| --------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| `OnboardingWizard` 本体     | local keep              | task-061 固有の step と保存契約を持つため shared 化しない                                                      |
| `ThemePreviewCard`          | local keep              | wizard 専用の copy と layout を持つため local が妥当。コンポーネント外部に分離済みで再レンダリング最適化も達成 |
| `SuggestionBubble`          | reuse                   | 既存 atom をそのまま再利用できる                                                                               |
| `SettingsView` rerun button | existing view extension | 既存 header action への追加で足りる                                                                            |
| screenshot harness          | dedicated file          | 本番 UI と同じ component を使い、capture 用 state だけを分離する                                               |

## ヘルパー関数の境界確認

| 関数名                      | 配置                                     | 確認結果                                 |
| --------------------------- | ---------------------------------------- | ---------------------------------------- |
| `getFocusableElements`      | モジュールスコープ                       | 適切。レンダリングごとの再生成なし       |
| `normalizeInitialName`      | モジュールスコープ                       | 適切。GENERIC_NAMES Set への依存を局所化 |
| `getPreviewName`            | モジュールスコープ                       | 適切。DEFAULT_PREVIEW_NAME 定数を参照    |
| `isOnboardingStarterToolId` | モジュールスコープ（export）             | 適切。外部からの型ガードとして利用可能   |
| `ThemePreviewCard`          | モジュールスコープ（関数コンポーネント） | 適切。THEME_OPTIONS 定数のみ参照         |

## 定数・型エクスポート確認

| 対象                          | 可視性             | 確認結果                                   |
| ----------------------------- | ------------------ | ------------------------------------------ |
| `ONBOARDING_STORE_KEYS`       | export const       | 適切。Store 層との契約として外部公開が必要 |
| `ONBOARDING_STEPS`            | module-local const | 適切。外部公開不要                         |
| `AI_PROMPTS`                  | module-local const | 適切。外部公開不要                         |
| `STARTER_TOOLS`               | module-local const | 適切。外部公開不要                         |
| `THEME_OPTIONS`               | module-local const | 適切。外部公開不要                         |
| `OnboardingBubbleId`          | export type        | 適切。外部でのペイロード型定義に必要       |
| `OnboardingStarterToolId`     | export type        | 適切。外部でのペイロード型定義に必要       |
| `OnboardingCompletionPayload` | export interface   | 適切。onComplete コールバックの引数型      |
| `OnboardingWizardProps`       | export interface   | 適切。呼び出し元の props 型                |
| `isOnboardingStarterToolId`   | export function    | 適切。Store 層での型ガードとして必要       |

## マジックナンバー確認

コード内のマジックナンバー・マジック文字列を確認した結果：

- `COMPLETION_STEP_INDEX = ONBOARDING_STEPS.length` — ステップ数から自動導出されており問題なし
- `DEFAULT_THEME_MODE = "kanagawa-dragon"` — 定数として分離済み
- `DEFAULT_PREVIEW_NAME = "User"` — 定数として分離済み
- `GENERIC_NAMES = new Set(["User", "ユーザー"])` — 定数として分離済み
- CSS の数値（28px, 32px など）— デザイントークン未導入の現状で許容範囲。over-engineering につながるため未タスク候補として記録する

## 追加修正内容

Phase 8 実施中に以下の冗長コードを発見・修正した：

- テーマ選択リストのアイコン `<span>` の `clsx()` 内で、全分岐が同じ `"text-white"` を返す恒等条件分岐が存在していた。静的クラス `text-white` に置き換えることで冗長性を排除した
- 修正後もテスト 20/20 PASS を確認
