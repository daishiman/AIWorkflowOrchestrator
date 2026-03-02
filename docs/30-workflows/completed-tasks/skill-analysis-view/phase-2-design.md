# Phase 2: 設計

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| Phase    | 2                                     |
| 機能名   | SkillAnalysisView（スキル分析ビュー） |
| タスクID | TASK-10A-B                            |
| 作成日   | 2026-03-02                            |

## 目的

Phase 1 で定義した要件を実現可能な構造に落とし込む。SkillAnalysisView のコンポーネント設計、状態管理設計、IPC連携設計、レイアウト設計を策定する。

## 実行タスク

- コンポーネント設計: Atomic Designに基づくコンポーネントツリーの策定
- 状態管理設計: ローカルstate設計とカスタムフック設計
- IPC連携設計: Preload API拡張とMain Processハンドラ接続設計
- レイアウト設計: ヘッダー＋コンテンツ領域のレイアウト策定
- デザイントークン設計: CSS変数ベースのスタイル定義

## 参照資料

| 資料名             | パス                                          | 説明                   |
| ------------------ | --------------------------------------------- | ---------------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md`  | Phase 1成果物          |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`      | Phase 1成果物          |
| スコープ定義       | `outputs/phase-1/scope-definition.md`         | Phase 1成果物          |
| バックエンド型定義 | `packages/shared/src/types/skill-improver.ts` | SkillAnalysis等の型    |
| IPCチャネル定義    | `apps/desktop/src/preload/channels.ts`        | 既存チャネル定数       |
| Preload API        | `apps/desktop/src/preload/skill-api.ts`       | 既存safeInvokeパターン |
| 状態管理ルール     | `.claude/rules/03-state-management.md`        | Zustand設計原則        |
| 既知の落とし穴     | `.claude/rules/06-known-pitfalls.md`          | P31/P39/P42/P46/P47    |

## aiworkflow-requirements 仕様抽出結果（設計Phase）

| 設計観点           | 仕様書                                                                            | 設計で固定する内容                    |
| ------------------ | --------------------------------------------------------------------------------- | ------------------------------------- |
| 抽出ナビ           | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                  | 設計で使う仕様の選定漏れ防止          |
| UIコンポーネント   | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           | SkillAnalysisViewの責務境界と構成     |
| 機能別UI           | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | 分析/改善/リスク表示の機能分割        |
| UI設計原則         | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`    | HIG/WCAGに沿った情報設計              |
| アーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`         | Atomic Design 層分割                  |
| 状態管理           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | ローカルstateとカスタムフック設計     |
| IPC/API            | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | skill系チャネルの使用契約             |
| API一覧            | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`              | 利用チャネルの一覧整合                |
| API共通設計        | `.claude/skills/aiworkflow-requirements/references/api-core.md`                   | 失敗時レスポンス形式・命名規約の整合  |
| インターフェース   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | SkillAnalysis/ImprovementResult型契約 |
| Preload/IPC境界    | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`      | contextBridge公開面の安全性を設計反映 |
| セキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | Renderer-Preload-Main境界制約         |
| セキュリティ原則   | `.claude/skills/aiworkflow-requirements/references/security-principles.md`        | 入力検証と権限境界の設計原則          |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | 失敗時の通知/復旧方針                 |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`      | 既存構成に沿った責務分離パターン      |

## 実行手順

### 1. コンポーネント設計

#### 1.1 コンポーネントツリー

```
SkillAnalysisView/                      # organism
├── index.tsx                           # メインコンテナ（状態管理・API呼び出し）
├── components/
│   ├── ScoreDisplay/                   # molecule
│   │   ├── ScoreDisplay.tsx            # 総合スコア表示（円形インジケータ）
│   │   └── CategoryBar.tsx            # カテゴリ別スコアバー（水平バー）
│   ├── SuggestionList/                 # molecule
│   │   ├── SuggestionList.tsx          # 改善提案リスト（優先度グループ化）
│   │   └── SuggestionItem.tsx         # 個別提案行（チェックボックス付き）
│   ├── RiskPanel/                      # molecule
│   │   ├── RiskPanel.tsx               # リスク情報パネル
│   │   └── RiskItem.tsx               # 個別リスク行
│   ├── AnalysisActions.tsx            # molecule: アクションボタン群
│   ├── AnalysisHeader.tsx             # molecule: ヘッダー（戻る＋タイトル）
│   └── AnalysisError.tsx              # molecule: エラー表示＋再試行
├── hooks/
│   └── useSkillAnalysis.ts            # カスタムフック（ロジック分離）
└── __tests__/
    ├── SkillAnalysisView.test.tsx
    ├── ScoreDisplay.test.tsx
    ├── SuggestionList.test.tsx
    ├── RiskPanel.test.tsx
    └── useSkillAnalysis.test.ts
```

#### 1.2 コンポーネント仕様

##### SkillAnalysisView（organism）

```typescript
interface SkillAnalysisViewProps {
  skill: ImportedSkill;
  onClose: () => void;
}
```

- 責務: 状態管理のハブ、`useSkillAnalysis` フックの呼び出し、子コンポーネントへのprops受け渡し
- マウント時に自動で `analyze()` を実行する
- レイアウト: ヘッダー → スコア表示 → 改善提案 → リスク情報 の縦積み構成

##### ScoreDisplay（molecule）

```typescript
interface ScoreDisplayProps {
  overallScore: number;
  categories: AnalysisCategory[];
}
```

- 責務: 総合スコアの視覚化（円形プログレスバー）、カテゴリ別スコアの水平バー表示
- スコア閾値による色分け:
  - 80-100: `var(--status-success)` (systemGreen)
  - 60-79: `var(--status-warning)` (systemOrange)
  - 0-59: `var(--status-error)` (systemRed)
- ARIA属性: `role="progressbar"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`

##### SuggestionList（molecule）

```typescript
interface SuggestionListProps {
  suggestions: Suggestion[];
  selectedIndices: Set<number>;
  onToggle: (index: number) => void;
  onSelectAutoFixable: () => void;
}
```

- 責務: 改善提案の優先度別グループ表示、チェックボックスによる選択管理
- グループ化: high → medium → low の順序で表示
- 各提案行: チェックボックス + タイプアイコン + 優先度バッジ + 説明 + 自動修正マーク

##### RiskPanel（molecule）

```typescript
interface RiskPanelProps {
  risks: Risk[];
}
```

- 責務: リスク情報のレベル別色分け表示
- レベル色:
  - critical: `var(--status-error)`
  - high: `var(--status-warning)`
  - medium: `var(--status-info)` (systemBlue)
  - low: `var(--text-secondary)`

##### AnalysisActions（molecule）

```typescript
interface AnalysisActionsProps {
  hasSelection: boolean;
  isImproving: boolean;
  onApply: () => void;
  onAutoImprove: () => void;
}
```

- 責務: 「選択した提案を適用」「全自動改善」ボタンの表示とdisabled制御

##### AnalysisError（molecule）

```typescript
interface AnalysisErrorProps {
  message: string;
  onRetry: () => void;
}
```

- 責務: エラーメッセージ表示と再試行ボタン
- `role="alert"` で即座にスクリーンリーダーに通知

### 2. 状態管理設計

#### 2.1 useSkillAnalysis カスタムフック

```typescript
interface UseSkillAnalysisReturn {
  // 状態
  analysis: SkillAnalysis | null;
  isAnalyzing: boolean;
  isImproving: boolean;
  selectedSuggestions: Set<number>;
  error: string | null;

  // アクション
  runAnalysis: () => Promise<void>;
  toggleSuggestion: (index: number) => void;
  selectAutoFixable: () => void;
  applySelected: () => Promise<void>;
  autoImprove: () => Promise<void>;
  clearError: () => void;
}

function useSkillAnalysis(skillName: string): UseSkillAnalysisReturn;
```

#### 2.2 状態遷移

```
初期状態 → [分析中] → [分析完了] → [改善適用中] → [再分析中] → [分析完了]
                  ↓
              [エラー] → [再試行] → [分析中]
```

| 状態       | isAnalyzing | isImproving | analysis  | error      |
| ---------- | ----------- | ----------- | --------- | ---------- |
| 初期       | false       | false       | null      | null       |
| 分析中     | true        | false       | null      | null       |
| 分析完了   | false       | false       | データ    | null       |
| 改善適用中 | false       | true        | データ    | null       |
| エラー     | false       | false       | null/前回 | メッセージ |

#### 2.3 状態配置の根拠

- **useStateベースのローカル状態**: SkillAnalysisViewは単一画面で完結し、他コンポーネントとの状態共有が不要。Zustand Storeを使う必要がない
- **カスタムフック分離**: ロジック（API呼び出し、状態遷移）をフックに分離し、コンポーネントはUI表示に集中する
- **P31対策不要**: Zustandを使わないため、合成Hook無限ループの問題は発生しない

### 3. IPC連携設計

#### 3.1 Preload API拡張

`apps/desktop/src/preload/skill-api.ts` の `SkillAPI` インターフェースに追加:

```typescript
// SkillAPI インターフェースに追加
analyze: (skillName: string) => Promise<SkillAnalysis>;
applyImprovements: (skillName: string, suggestions: Suggestion[]) =>
  Promise<ImprovementResult>;
autoImprove: (skillName: string) => Promise<ImprovementResult>;
```

実装パターン（既存safeInvokeパターン準拠）:

```typescript
analyze: (skillName: SkillName): Promise<SkillAnalysis> =>
  safeInvoke(IPC_CHANNELS.SKILL_ANALYZE, skillName),

applyImprovements: (skillName: SkillName, suggestions: Suggestion[]): Promise<ImprovementResult> =>
  safeInvoke(IPC_CHANNELS.SKILL_IMPROVE, { skillName, suggestions }),

autoImprove: (skillName: SkillName): Promise<ImprovementResult> =>
  safeInvoke(IPC_CHANNELS.SKILL_OPTIMIZE, skillName),
```

#### 3.2 Main Process ハンドラ接続

既存のIPCハンドラ登録パターンに従い、`skill:analyze`, `skill:improve`, `skill:optimize` ハンドラが `SkillAnalyzer` / `SkillImprover` サービスに委譲する。

引数バリデーション（P42準拠3段バリデーション）:

```typescript
// skill:analyze ハンドラ
if (typeof skillName !== "string" || skillName.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "skillName must be a non-empty string",
  };
}
```

#### 3.3 型定義の整合性

| レイヤー | ファイル                                      | 型名                     |
| -------- | --------------------------------------------- | ------------------------ |
| Shared   | `packages/shared/src/types/skill-improver.ts` | SkillAnalysis            |
| Shared   | 同上                                          | ImprovementResult        |
| Shared   | 同上                                          | Suggestion               |
| Preload  | `apps/desktop/src/preload/types.ts`           | SkillAPI（メソッド追加） |
| Preload  | `apps/desktop/src/preload/skill-api.ts`       | 実装                     |

### 4. レイアウト設計

#### 4.1 全体レイアウト

```
┌─────────────────────────────────────────────┐
│ ← 戻る    スキル分析: {skillName}    [アクション▼] │  ← AnalysisHeader
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────────┐│
│  │     総合スコア: 85 / 100                ││  ← ScoreDisplay
│  │     ████████████████████░░░░             ││
│  │                                         ││
│  │  カテゴリ別:                             ││
│  │  プロンプト品質  ██████████░  82         ││
│  │  セキュリティ    ████████░░░  75         ││
│  │  ドキュメント    ██████░░░░░  60         ││
│  └─────────────────────────────────────────┘│
│                                             │
│  ┌─────────────────────────────────────────┐│
│  │  改善提案 (6件)        [自動修正のみ▼]  ││  ← SuggestionList
│  │  ─── 高優先度 (2件) ───                 ││
│  │  ☑ [prompt] プロンプトの明確化          ││
│  │  ☐ [security] 入力バリデーション追加    ││
│  │  ─── 中優先度 (3件) ───                 ││
│  │  ☐ [structure] ファイル構造の最適化      ││
│  │  ...                                    ││
│  └─────────────────────────────────────────┘│
│                                             │
│  ┌─────────────────────────────────────────┐│
│  │  リスク情報 (3件)                       ││  ← RiskPanel
│  │  🔴 [critical] セキュリティ: ...        ││
│  │  🟡 [medium] パフォーマンス: ...        ││
│  │  ...                                    ││
│  └─────────────────────────────────────────┘│
│                                             │
│  ┌─────────────────────────────────────────┐│
│  │  [選択した提案を適用(2)] [全自動改善]   ││  ← AnalysisActions
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

#### 4.2 スペーシング（8pxグリッド）

| 要素間             | サイズ         |
| ------------------ | -------------- |
| セクション間       | 24px (3単位)   |
| カード内パディング | 16px (2単位)   |
| リストアイテム間   | 8px (1単位)    |
| ボタン間           | 12px (1.5単位) |
| ヘッダーパディング | 16px (2単位)   |

#### 4.3 角丸

| 要素             | 角丸 |
| ---------------- | ---- |
| セクションカード | 12px |
| ボタン           | 8px  |
| バッジ           | 4px  |
| プログレスバー   | 4px  |

### 5. デザイントークン設計

#### 5.1 スコア色マッピング

```typescript
export const scoreColorMap: Record<string, string> = {
  success: "bg-[var(--status-success)] text-[var(--text-inverse)]",
  warning: "bg-[var(--status-warning)] text-[var(--text-inverse)]",
  error: "bg-[var(--status-error)] text-[var(--text-inverse)]",
};

export function getScoreVariant(
  score: number,
): "success" | "warning" | "error" {
  if (score >= 80) return "success";
  if (score >= 60) return "warning";
  return "error";
}
```

#### 5.2 優先度バッジスタイル

```typescript
export const priorityStyles: Record<SuggestionPriority, string> = {
  high: "bg-[var(--status-error)] text-[var(--text-inverse)]",
  medium: "bg-[var(--status-warning)] text-[var(--text-inverse)]",
  low: "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]",
};
```

#### 5.3 リスクレベルスタイル

```typescript
export const riskLevelStyles: Record<Risk["level"], string> = {
  critical:
    "border-l-4 border-l-[var(--status-error)] bg-[var(--bg-secondary)]",
  high: "border-l-4 border-l-[var(--status-warning)] bg-[var(--bg-secondary)]",
  medium: "border-l-4 border-l-[var(--status-info)] bg-[var(--bg-secondary)]",
  low: "border-l-4 border-l-[var(--border-primary)] bg-[var(--bg-secondary)]",
};
```

---

## 統合テスト連携

| 観点             | 方針                                                         |
| ---------------- | ------------------------------------------------------------ |
| コンポーネント   | @testing-library/react + happy-dom（fireEvent使用、P39準拠） |
| IPCモック        | `window.electronAPI.skill.analyze` 等をvi.fn()でモック       |
| スタイルテスト   | variantStyles Record定数を import して検証（P47準拠）        |
| フックテスト     | `renderHook` で useSkillAnalysis の状態遷移を検証            |
| アクセシビリティ | ARIA属性の存在確認（role, aria-valuenow, aria-label）        |

## 多角的チェック観点

| 観点             | 確認項目                                                            |
| ---------------- | ------------------------------------------------------------------- |
| Atomic Design    | organism/molecule/atom の層分割が正しい                             |
| 状態管理         | useStateベースのローカル状態のみ使用（Zustand不要の根拠が明確）     |
| IPC整合性        | Preload API → Main Handler → Backend Service の引数型が一貫している |
| P42準拠          | 全文字列引数に3段バリデーション（型→空文字列→trim空文字列）         |
| P46準拠          | HTMLAttributes Propsに型衝突がある場合はOmitで回避                  |
| P47準拠          | CSS変数ベースのスタイルはvariantStyles Record定数で管理             |
| アクセシビリティ | ARIA属性、キーボード操作、コントラスト比が設計に含まれている        |
| エラー復旧       | 各エラーパターンに対して復旧パス（再試行ボタン）が設計されている    |

## 成果物

| 成果物                                   | タイプ         | 説明                           |
| ---------------------------------------- | -------------- | ------------------------------ |
| `outputs/phase-2/architecture-design.md` | アーキテクチャ | コンポーネントツリー＋状態設計 |
| `outputs/phase-2/component-design.md`    | コンポーネント | 各コンポーネントの仕様         |
| `outputs/phase-2/api-specification.md`   | API仕様        | Preload API拡張仕様            |

## 完了条件

- [ ] コンポーネントツリーが Atomic Design（organism/molecule）に従っている
- [ ] 各コンポーネントのProps型が定義されている
- [ ] useSkillAnalysis カスタムフックのインターフェースが定義されている
- [ ] 状態遷移図が定義され、全状態パターンが網羅されている
- [ ] Preload API拡張の実装パターン（safeInvoke）が定義されている
- [ ] Main Process ハンドラのバリデーション方針（P42準拠）が定義されている
- [ ] レイアウト設計図（アスキーアート）が作成されている
- [ ] デザイントークン（スコア色、優先度、リスクレベル）がRecord定数として定義されている
- [ ] outputs/phase-2/ 配下の3ファイルが全て作成されている

## 次のPhase

Phase 3（設計レビュー）へ進行する。要件カバレッジ、設計整合性、IPC契約整合性を検証する。
