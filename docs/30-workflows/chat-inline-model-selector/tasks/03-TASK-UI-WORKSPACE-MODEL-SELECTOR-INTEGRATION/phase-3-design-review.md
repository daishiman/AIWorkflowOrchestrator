# Phase 3: 設計レビュー

## メタ情報

| 項目     | 値                                           |
| -------- | -------------------------------------------- |
| Phase    | 3                                            |
| 機能名   | chat-inline-model-selector                   |
| タスクID | TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION |
| 作成日   | 2026-03-21                                   |

## 目的

Phase 1（要件定義）とPhase 2（設計）の妥当性を検証し、Phase 4以降に進めるかを判定する。

## 実行タスク

- 要件-設計トレーサビリティ検証: 全FRがコンポーネント設計で実現されるか確認
- アーキテクチャ適合性検証: プロジェクトルール（Atomic Design、P31対策等）との整合性確認
- リスク評価: 既知の落とし穴（known-pitfalls）との照合

## 参照資料

| 資料名           | パス                                                                                                                         | 説明                 |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| Phase 1 要件定義 | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-1-requirements.md` | 要件・受入基準       |
| Phase 2 設計     | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-2-design.md`       | コンポーネント設計   |
| 既知の落とし穴   | `.claude/rules/06-known-pitfalls.md`                                                                                         | P31/P48等の対策      |
| 状態管理ルール   | `.claude/rules/03-state-management.md`                                                                                       | Store設計原則        |
| アーキテクチャ   | `.claude/rules/01-architecture.md`                                                                                           | レイヤー・UI設計原則 |

## 実行手順

### ステップ1: 要件-設計トレーサビリティマトリクス

| 要件   | 設計対応箇所                       | 実現性 | 備考                                                                                                     |
| ------ | ---------------------------------- | ------ | -------------------------------------------------------------------------------------------------------- |
| FR-1.1 | SelectorTrigger: ModelDisplayName  | OK     | 選択中Provider/Model名をコンパクト表示                                                                   |
| FR-1.2 | SelectorDropdown                   | OK     | クリックで展開、Provider/Model選択                                                                       |
| FR-1.3 | 状態フロー 2.2                     | OK     | selectProvider時にモデルリスト連動更新                                                                   |
| FR-1.4 | 個別セレクタ使用                   | OK     | useSelectProvider/useSelectModel経由。onSelectionChangeはオブジェクト引数`{ providerId, modelId }`に統一 |
| FR-1.5 | HealthDot                          | OK     | 緑/赤/灰のステータスドット                                                                               |
| FR-1.6 | SelectorTrigger未選択状態          | OK     | 「モデルを選択」プレースホルダー                                                                         |
| FR-2.1 | ChatView配置設計 3.1               | OK     | ヘッダー左側に配置                                                                                       |
| FR-2.2 | LLMGuidanceBanner共存 3.3          | OK     | 選択済みで非表示（既存動作維持）                                                                         |
| FR-2.3 | InlineModelSelectorから直接選択    | OK     | Settings遷移不要                                                                                         |
| FR-3.1 | WorkspaceChat配置設計 3.2          | OK     | パネル上部にcompact版配置                                                                                |
| FR-3.2 | GuidanceBlock条件変更              | OK     | モデル選択済みで非表示                                                                                   |
| FR-3.3 | useWorkspaceChatController連動     | OK     | blocked判定と連動                                                                                        |
| NFR-1  | 個別セレクタ/ローカルstate         | OK     | P31対策済み、再レンダー最小化                                                                            |
| NFR-2  | ARIA属性/キーボード操作設計        | OK     | combobox/listbox/option パターン                                                                         |
| NFR-3  | デザイントークン Apple HIG準拠     | OK     | CSS変数使用、ライト/ダーク両対応                                                                         |
| NFR-4  | components/llm/ 配置、compact prop | OK     | 再利用可能な設計                                                                                         |

**トレーサビリティ判定**: 全要件が設計で網羅されている。

### ステップ2: アーキテクチャ適合性検証

| ルール                       | 適合性 | 確認結果                                                       |
| ---------------------------- | ------ | -------------------------------------------------------------- |
| Atomic Design                | OK     | InlineModelSelector=molecule、子=atom/molecule                 |
| Store個別セレクタ（P31対策） | OK     | 合成Hook不使用、全て個別セレクタで取得                         |
| useShallow（P48対策）        | 対象外 | 派生セレクタ（filter/map）不使用のため不要                     |
| ドロップダウン開閉=ローカル  | OK     | useState使用、03-state-management.mdのコンポーネント固有UI該当 |
| IPC既存チャンネル利用        | OK     | 新規IPCなし、llm:set-selected-config使用                       |
| Apple HIG準拠                | OK     | システムカラー使用、8pxグリッド、角丸8-12px                    |
| WCAG 2.1 AA                  | OK     | キーボード操作・ARIA属性・コントラスト比設計済み               |
| レイヤー依存方向             | OK     | Renderer → Store → Preload → Mainの一方向                      |

### ステップ3: リスク評価（known-pitfalls照合）

| Pitfall | リスク | 対策状況                                                           |
| ------- | ------ | ------------------------------------------------------------------ |
| P5      | 低     | useEffect内リスナー登録なし。fetchProvidersはマウント時のみ        |
| P31     | 低     | 個別セレクタ使用を設計で明記。合成Hook不使用                       |
| P39     | 低     | happy-dom環境ではfireEvent使用を想定                               |
| P46     | 低     | HTMLAttributes拡張なし。カスタムpropsのみ                          |
| P47     | 低     | コンポーネント側で`export const DESIGN_TOKENS`として定義する       |
| P48     | 低     | 派生セレクタ（filter/map）を直接使用しない設計                     |
| P62     | 低     | DEFAULT_CONFIGへの暗黙fallbackなし。未選択時はプレースホルダー表示 |

### ステップ4: 懸念事項と判断

#### 懸念1: 既存ProviderSelector/ModelSelectorの再利用 vs 新規UI

- **懸念**: 既存コンポーネントは `<select>` ベース。新規UIは `<button>` リスト。部品の重複が増える
- **判断**: OSネイティブ `<select>` はコンパクトUIに馴染まないため、新規UIを採用する。既存コンポーネントはSettings画面で引き続き使用。将来的にSettingsもカスタムUIに統一する場合は、InlineModelSelector内部のSelectorDropdownを抽出して共用可能

#### 懸念2: LLMGuidanceBannerとInlineModelSelectorの役割重複

- **懸念**: モデル未選択時にバナーとセレクタの両方が表示される
- **判断**: バナーはAPI key未設定時のSettings誘導として残す。モデル選択の操作はインラインセレクタに一本化。将来的にバナーの表示条件をAPI key関連に限定する調整は未タスクとして管理

#### 懸念3: ChatPanel（スタブ版）の扱い

- **懸念**: `components/chat/LLMSelectorPanel.tsx`（スタブ版、24行）が残る
- **判断**: 本タスクのスコープ外。ChatPanelはreview harnessとして位置づけ（TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT参照）。スタブ版の削除/統合は別タスクで対応

### ステップ5: レビュー判定

| 項目                      | 結果     |
| ------------------------- | -------- |
| 要件-設計トレーサビリティ | PASS     |
| アーキテクチャ適合性      | PASS     |
| リスク評価                | PASS     |
| 懸念事項                  | 管理可能 |

**総合判定: PASS** — Phase 4（テスト作成）に進行可能。

## 統合テスト連携（Phase 3）

- Phase 4 のテスト設計にて、トレーサビリティマトリクスの各FRに対応するテストケースを作成する
- P47対策として、デザイントークンの定数exportパターンをテスト設計に含める

## 成果物

| 成果物         | パス                                                                                                                          | 説明           |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------- |
| 設計レビュー書 | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-3-design-review.md` | 本ドキュメント |

## 完了条件

- [x] 要件-設計トレーサビリティマトリクスを作成し全要件の対応を確認
- [x] アーキテクチャ適合性を検証
- [x] known-pitfalls との照合を完了
- [x] 懸念事項を特定し判断を記録
- [x] 総合判定を実施（PASS/MINOR/MAJOR）
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

→ `phase-4-test.md`（同ディレクトリ内）
