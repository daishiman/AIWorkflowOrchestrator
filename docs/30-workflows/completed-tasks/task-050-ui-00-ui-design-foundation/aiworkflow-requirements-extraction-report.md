# aiworkflow-requirements 抽出監査レポート（完全版）

## 監査日

- 2026-03-04
- 対象タスク: `TASK-UI-00-DESIGN-FOUNDATION`

## 抽出戦略

- 起点: `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`
- タスク種別: UI実装 / コンポーネントテスト / アクセシビリティテスト / 品質保証
- 原則: Progressive Disclosure（必要最小限を抽出し、非適用も理由付きで明記）

## SubAgent分担（抽出）

- SubAgent A（UI設計）: `ui-ux-components.md`, `ui-ux-design-system.md`, `ui-ux-design-principles.md`, `ui-ux-feature-components.md`
- SubAgent B（設計/状態管理）: `arch-ui-components.md`, `arch-state-management.md`, `architecture-overview.md`, `architecture-implementation-patterns.md`
- SubAgent C（テスト/品質）: `testing-component-patterns.md`, `testing-accessibility.md`, `quality-requirements.md`
- SubAgent D（例外/運用）: `error-handling.md`, `security-api-electron.md`

## 抽出判定マトリクス（必要/条件付き/非適用）

### 必要（必読）

| 仕様                                      | 理由                        | 主な反映Phase  |
| ----------------------------------------- | --------------------------- | -------------- |
| `ui-ux-components.md`                     | Atomic Design部品責務の正本 | 1, 2, 5, 12    |
| `ui-ux-design-system.md`                  | トークン・テーマの正本      | 1, 2, 5        |
| `ui-ux-design-principles.md`              | Apple HIG / WCAG判断基準    | 1, 2, 6, 9, 11 |
| `ui-ux-feature-components.md`             | 画面横断部品の責務境界      | 2, 5, 12       |
| `arch-ui-components.md`                   | UIアーキテクチャの整合基準  | 2, 8, 12       |
| `arch-state-management.md`                | P31対策と状態分離方針       | 1, 2, 5, 8, 12 |
| `architecture-overview.md`                | Renderer/Main/IPCの境界理解 | 2              |
| `architecture-implementation-patterns.md` | 実装/リファクタ方針         | 8              |
| `testing-component-patterns.md`           | コンポーネントテスト方針    | 2, 4, 7        |
| `testing-accessibility.md`                | A11yテスト観点              | 2, 4, 6, 11    |
| `quality-requirements.md`                 | カバレッジ/品質ゲート基準   | 1, 4, 6, 7, 9  |
| `error-handling.md`                       | エラー状態UI・回復導線      | 5, 9, 12       |

### 条件付き（変更がある場合に必読）

| 仕様                       | 条件                                  | 判定                     |
| -------------------------- | ------------------------------------- | ------------------------ |
| `security-api-electron.md` | Preload公開APIやIPC境界変更がある場合 | 条件付きで参照           |
| `api-ipc-agent.md`         | 新規IPC契約追加・変更がある場合       | 今回は非変更（条件付き） |
| `api-endpoints.md`         | APIエンドポイント変更がある場合       | 今回は非変更（条件付き） |
| `security-electron-ipc.md` | IPCハンドラ/チャネル変更がある場合    | 今回は非変更（条件付き） |

### 非適用（今回対象外）

| 仕様群                       | 非適用理由                          |
| ---------------------------- | ----------------------------------- |
| `database-*.md`              | DBスキーマ/永続化設計変更がないため |
| `interfaces-rag*.md`         | RAG/検索機能を扱わないため          |
| `interfaces-chat-history.md` | 会話履歴機能を扱わないため          |
| `deployment*.md`             | デプロイ設計変更を伴わないため      |

## 抽出結果の反映状況

| 関心領域                | 抽出仕様                                                    | 反映先               |
| ----------------------- | ----------------------------------------------------------- | -------------------- |
| デザイントークン/テーマ | `ui-ux-design-system.md`, `ui-ux-design-principles.md`      | Phase 1, 2, 5        |
| Atomic Design責務       | `ui-ux-components.md`, `arch-ui-components.md`              | Phase 2, 5, 8        |
| レスポンシブ/UX言語     | `ui-ux-feature-components.md`, `ui-ux-design-principles.md` | Phase 2, 5, 11       |
| A11y要件                | `testing-accessibility.md`, `ui-ux-design-principles.md`    | Phase 4, 6, 11       |
| テスト戦略              | `testing-component-patterns.md`, `quality-requirements.md`  | Phase 4, 6, 7        |
| P31対策/状態管理        | `arch-state-management.md`                                  | Phase 1, 2, 5, 8, 12 |
| エラーUI/失敗時処理     | `error-handling.md`                                         | Phase 5, 9, 12       |

## 改善実施

- 全Phaseに「多角的チェック観点（AIが判断）」を追加し、`aiworkflow-requirements` 参照導線を統一。
- Phase 12に仕様同期手順（Task 2 Step 1-A/1-B/1-C/1-D/1-E/Step 2）を具体化し、抽出仕様の更新先を明示。
- `task-specification-creator` と `aiworkflow-requirements` の両方のLOGS/SKILL更新要件をPhase 12へ明記。
- `verify-unassigned-links` と `audit-unassigned-tasks --diff-from HEAD` の判定軸（`currentViolations.total`）を追記し、未タスク導線の整合監査を仕様化。
- Phase 12 Task 3.5 の必須成果物集合を5点（`implementation-guide.md` 含む）へ是正し、スキル基準と完全整合させた。

## 結論

今回のタスク仕様書群は、`aiworkflow-requirements` から実装に必要な仕様を**必要/条件付き/非適用**まで含めて漏れなく抽出できる状態に改善済み。
