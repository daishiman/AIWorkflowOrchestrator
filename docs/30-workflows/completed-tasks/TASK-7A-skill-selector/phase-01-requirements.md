# Phase 1: 要件定義

## メタ情報

| 項目   | 値                     |
| ------ | ---------------------- |
| Phase  | 1                      |
| 機能名 | TASK-7A-skill-selector |
| 作成日 | 2026-01-30             |

## 目的

SkillSelector コンポーネントの機能要件・非機能要件・受け入れ基準を明文化する。

## 実行タスク

- 要件抽出: specification.md 4.2 / 4.6 およびタスク仕様書から機能要件・非機能要件を抽出
- 受け入れ基準作成: 各要件に対して検証可能な受け入れ基準を定義
- 影響範囲分析: SkillSlice連携・ModelSelectorパターン準拠の確認

## 参照資料

| 資料名                       | パス                                                                          | 説明                        |
| ---------------------------- | ----------------------------------------------------------------------------- | --------------------------- |
| タスク定義                   | `docs/30-workflows/skill-import-agent-system/tasks/task-7a-skill-selector.md` | TASK-7A 元タスク定義        |
| specification.md（4.2, 4.6） | `docs/30-workflows/skill-import-agent-system/specification.md`                | SkillSelector仕様・A11y仕様 |
| ModelSelector                | `apps/desktop/src/renderer/components/llm/ModelSelector.tsx`                  | 参考パターン                |
| SkillSlice                   | `apps/desktop/src/renderer/store/slices/skillSlice.ts`                        | 依存する状態管理            |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                              | 内容                                 |
| ---------------------- | --------------------------------------------------------------------------------- | ------------------------------------ |
| UI/UXデザインシステム  | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`        | デザイントークン・コンポーネント規約 |
| LLMセレクター仕様      | `.claude/skills/aiworkflow-requirements/references/ui-ux-llm-selector.md`         | 既存セレクターUI仕様                 |
| 状態管理アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | skillSlice定義・Zustandパターン      |
| UIコンポーネント設計   | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`         | コンポーネント階層                   |
| Skill型定義            | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | SkillMetadata / ImportedSkill型      |

## 実行手順

### ステップ1: 機能要件抽出

specification.md 4.2（SkillSelector詳細）とタスク仕様書から機能要件を抽出する。

**機能要件（FR）**:

| FR-ID | 要件                                                           | 優先度 |
| ----- | -------------------------------------------------------------- | ------ |
| FR-01 | ドロップダウンUIでスキル一覧を表示できる                       | 高     |
| FR-02 | 「なし」オプションでスキル選択を解除できる                     | 高     |
| FR-03 | インポート済みスキルをセクション表示し選択できる               | 高     |
| FR-04 | 利用可能（未インポート）スキルをセクション表示する             | 高     |
| FR-05 | 選択中スキルがトリガーボタンに表示される                       | 高     |
| FR-06 | 「再スキャン」ボタンで利用可能スキルを再取得できる             | 中     |
| FR-07 | 各スキルオプションにサブエージェント数・参照資料数が表示される | 中     |
| FR-08 | スキル説明文がtruncateで表示される                             | 低     |

**非機能要件（NFR）**:

| NFR-ID | 要件                                                              | 優先度 |
| ------ | ----------------------------------------------------------------- | ------ |
| NFR-01 | WAI-ARIA Listbox パターンに準拠したアクセシビリティ               | 高     |
| NFR-02 | キーボードナビゲーション（Enter/Space/Escape/Arrow/Home/End）対応 | 高     |
| NFR-03 | 外側クリックでドロップダウンが閉じる                              | 高     |
| NFR-04 | ダークモード対応（Tailwind `dark:` プレフィックス）               | 中     |
| NFR-05 | ドロップダウン開閉アニメーション（200ms ease-out）                | 低     |
| NFR-06 | ModelSelector と一貫した操作感                                    | 中     |
| NFR-07 | TypeScript 厳密型定義                                             | 高     |

### ステップ2: 受け入れ基準作成

| 要件ID | 受け入れ基準                                                                                   |
| ------ | ---------------------------------------------------------------------------------------------- |
| FR-01  | トリガーボタンをクリックするとドロップダウンが開き、スキル一覧が表示される                     |
| FR-02  | 「なし（スキルを使用しない）」を選択すると `selectSkill(null)` が呼ばれドロップダウンが閉じる  |
| FR-03  | インポート済みスキルが「インポート済み (N)」ヘッダー付きで表示され、クリックで選択される       |
| FR-04  | 未インポートスキルが「利用可能なスキル (N)」ヘッダー付きで表示される                           |
| FR-05  | トリガーボタンに選択中スキル名が表示される（未選択時は「なし」）                               |
| FR-06  | 「再スキャン」ボタンクリックで `rescanSkills()` が呼ばれ、スキャン中表示になる                 |
| FR-07  | 各スキルオプションに「サブエージェント: N個 \| 参照資料: N個」が表示される                     |
| NFR-01 | `aria-haspopup="listbox"`, `aria-expanded`, `role="listbox"`, `role="option"` が設定されている |
| NFR-02 | Escapeキーでドロップダウンが閉じ、ArrowDown/Upでフォーカスが移動する                           |
| NFR-03 | ドロップダウン外をクリックするとドロップダウンが閉じる                                         |
| NFR-06 | ModelSelector.tsx と同等のドロップダウン開閉・選択・キーボード操作が可能である                 |

### ステップ3: 影響範囲分析

| 変更対象                                                                      | 変更内容                  |
| ----------------------------------------------------------------------------- | ------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`                | 新規作成                  |
| `apps/desktop/src/renderer/components/skill/index.ts`                         | 新規作成（barrel export） |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillSelector.test.tsx` | 新規作成（テスト）        |

| 影響を受けるシステム | 影響内容                                    |
| -------------------- | ------------------------------------------- |
| SkillSlice           | 読み取り専用で参照（変更なし）              |
| ModelSelector        | 影響なし（パターン参照のみ）                |
| チャットUI           | TASK-7Dで統合（本タスクでは単体テストのみ） |

## 統合テスト連携【必須】

接続要件（状態管理・コンポーネント連携）を要件に明記する:

| 接続要件カテゴリ   | 記載内容                                                            |
| ------------------ | ------------------------------------------------------------------- |
| Zustand Store連携  | `useAppStore` 経由で skillSlice の状態・アクションにアクセス        |
| コンポーネント連携 | TASK-7Dでチャットツールバーに統合予定                               |
| IPC通信            | SkillSlice経由で間接的にIPC使用（本コンポーネントは直接使用しない） |

## アーキテクチャ層別要件（AIが判断）

本タスクはフロントエンド（Renderer Process）のUIコンポーネント実装のため、以下の層が対象:

| 層                         | 確認観点                                               |
| -------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | Reactコンポーネント設計、Zustand状態管理連携、ARIA属性 |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                               | 仕様参照先                                   |
| ------------------ | -------------------------------------- | -------------------------------------------- |
| セキュリティ       | スキル名・説明文の表示時XSS防止        | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装のため適用           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | Renderer Process内完結の確認           | `aiworkflow-requirements: architecture-*.md` |
| エラーハンドリング | rescanSkills失敗時の表示・空リスト対応 | `aiworkflow-requirements: error-handling.md` |
| パフォーマンス     | 不要な再レンダリング防止               | `aiworkflow-requirements: architecture-*.md` |
| アクセシビリティ   | WAI-ARIA Listboxパターン準拠           | `aiworkflow-requirements: ui-ux-*.md`        |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断               | 仕様参照先                            |
| -------------------------- | ---------------------- | ------------------------------------- |
| フロントエンド（Renderer） | UI/React実装のため適用 | `aiworkflow-requirements: ui-ux-*.md` |

## 成果物

| 成果物       | パス                                         | 説明               |
| ------------ | -------------------------------------------- | ------------------ |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件   |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義             |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲・影響範囲 |

## 完了条件

- [ ] 全要件が抽出されている（FR 8件、NFR 7件）
- [ ] 各要件に検証可能な受け入れ基準がある
- [ ] FR/NFRが分類されている
- [ ] SkillSlice連携の接続要件が明記されている
- [ ] ModelSelectorパターンとの一貫性要件が明記されている
- [ ] 影響範囲が分析されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（specification.md, ModelSelector, SkillSlice）
2. 機能要件抽出の実施
3. 非機能要件抽出の実施
4. 受け入れ基準作成の実施
5. 影響範囲分析の実施
6. 成果物の作成・配置
7. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-7A-skill-selector --phase 1
```

## 次のPhase

Phase 2: 設計
