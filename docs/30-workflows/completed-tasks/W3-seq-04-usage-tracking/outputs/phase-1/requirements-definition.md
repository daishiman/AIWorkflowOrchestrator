# 要件定義書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| Phase      | 1                                                    |
| タスクID   | UT-SKILL-WIZARD-W3-seq-04                            |
| 機能名     | 使用率計装（usage tracking）                         |
| 作成日     | 2026-04-08                                           |
| ステータス | completed                                            |
| タスク分類 | NON_VISUAL（Renderer 内部の計装のみ / 視覚差分なし） |

---

## 1. 目的

SkillCreateWizard の操作パターンを 5 つの計装ポイントで記録し、ウィザードの使用傾向・完了率・生成品質を把握できる最小の計装基盤を実装する。

本タスクは visible surface（画面表示）を一切変えない **NON_VISUAL** タスクであり、  
成果の主証跡はスクリーンショットではなく **コンソール証跡（console.info ログ）** および **自動テスト結果** とする。

---

## 2. 背景

W2-seq-03a で改修された `SkillCreateWizard.tsx` と `CompleteStep.tsx` に対し、ウィザードの使用パターンを記録するための計装を追加する。

既存の `SkillAnalytics` / `AnalyticsStore` は **execution-centric**（スキル実行ログ中心）であるため、W3 の UI 計装はそれらに直結させない。renderer-local の薄い `trackEvent` 抽象として実装範囲を閉じる。

---

## 3. 機能要件

### FR-01: trackEvent 関数の実装

- `apps/desktop/src/renderer/utils/trackEvent.ts` に 1 ファイルで実装する
- 型安全な `SkillWizardEvents` マップで 5 イベントを管理する
- `process.env.NODE_ENV !== "production"` の場合のみ `console.info` でログ出力する
- production 環境では no-op（何もしない）とする

### FR-02: 5 計装ポイントの発火

以下の 5 つのイベントを `SkillCreateWizard.tsx` 内の適切な位置で発火する。

| イベント名                          | 発火タイミング                            |
| ----------------------------------- | ----------------------------------------- |
| `skill_wizard_started`              | ウィザードコンポーネントマウント時        |
| `skill_wizard_step1_completed`      | Step 1 完了またはスキップボタン押下時     |
| `skill_wizard_generation_completed` | LLM 生成完了時                            |
| `skill_skeleton_quality_feedback`   | 👍 / 👎 フィードバック送信時              |
| `skill_wizard_next_action`          | CompleteStep でのネクストアクション選択時 |

### FR-03: 計装の責務分離

- `SkillCreateWizard.tsx` が全 5 イベントの発火点を持つ
- `CompleteStep.tsx` は presentational として維持し、`trackEvent` を直接呼ばない
- `trackEvent.ts` は型安全なイベント定義と開発時ログのみを持つ
- `SkillAnalytics` / `AnalyticsStore` は execution-centric 基盤として維持し、UI 計装と直接接続しない

---

## 4. 非機能要件

### NFR-01: 型安全性

- `SkillWizardEvents` マップにより、イベント名とペイロードの型を TypeScript で強制する
- `SkillCategory` 型は `packages/shared/src/types/skill.ts` を参照する
- `any` 型の使用を禁止する

### NFR-02: パフォーマンス

- 計装処理は同期・軽量とする（async 不使用）
- production では no-op のため実行コストはゼロとする

### NFR-03: 保守性

- `trackEvent.ts` は 1 ファイルに閉じ、呼び出し側への変更なしに sink を差し替えられる設計とする
- イベント追加は `SkillWizardEvents` マップへのキー追加のみで対応できる

### NFR-04: テスト容易性

- `trackEvent` は `vi.mock` でモック化できるよう、named export で提供する
- 各 AC に対応する単体テストで発火回数・payload を検証できる

---

## 5. タスク分類と証跡方針

| 項目          | 内容                                                                    |
| ------------- | ----------------------------------------------------------------------- |
| タスク分類    | NON_VISUAL                                                              |
| 理由          | 画面の表示・レイアウト・スタイルを一切変更しない内部計装のみ            |
| Phase 11 方針 | スクリーンショット不要。console.info ログと自動テスト結果を主証跡にする |

---

## 6. 依存関係

| 依存先     | 詳細                                                          |
| ---------- | ------------------------------------------------------------- |
| W2-seq-03a | `SkillCreateWizard.tsx` / `CompleteStep.tsx` の改修完了が前提 |
| W0-seq-01  | `SkillCategory` 型定義（packages/shared/src/types/skill.ts）  |

---

## 7. スコープ外

- `SkillAnalytics` / `AnalyticsStore` の変更
- バックエンドへのイベント送信
- ダッシュボード・レポート機能
- 既存の UI 表示変更

---

## 完了条件チェックリスト

- [x] 5 つの計装ポイントが定義されていること
- [x] AC-01〜AC-05 が全て定義されていること
- [x] タスク分類が NON_VISUAL であることが明記されていること
- [x] Phase 11 の証跡方針がスクリーンショット不要として固定されていること
- [x] W2-seq-03a との依存関係が確認されていること
- [x] 矛盾なし・漏れなし
