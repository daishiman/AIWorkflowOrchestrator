# UI Result Panel パターンガイド

## 概要
skill の plan/execute 結果を表示するResultPanelコンポーネント群の設計パターン。
TASK-RT-03（SkillCreationResultPanel）実装から確立。

## コンポーネント構成

### ErrorBanner（共通エラー表示）
- 役割: エラー状態の統一表示
- Props: `error: PanelError, onRetry?: () => void`
- パターン: `role="alert"` + retryable フラグ + onRetry コールバック

### DetailPanel（結果詳細表示）
- 役割: Plan/Execute の詳細結果表示
- 状態管理: `isLoading → error → null → data` の4状態遷移
- パターン: スケルトンローダー + ErrorBanner + null guard + 詳細表示

### result-panel-parts.tsx（共通UIパーツ）
- SectionHeader: セクション区切り線 + ヘッダーテキスト
- TagList: タグスタイルリスト（trigger/anchor 共用）
- DetailFooter: ID フッター（planId/executeId 共用）
- StatusBadge: 成功/失敗/pending バッジ

## 重要設計決定

### SkillCreationResultPanel orchestration wrapper
**決定**: `SkillCreationResultPanel` は plan / execute / verify の detail panel を束ねる orchestration wrapper として実装する。
**役割**: overall status badge、空状態、パネル順序、child panel への props 受け渡しだけを担当する。
**理由**: 詳細描画を child に閉じることで、表示責務と state owner を分離しやすくなる。

### state owner 分離の判断基準

| 判断基準   | global store に置く                             | 呼び出し元 local state に置く               |
| ---------- | ----------------------------------------------- | ------------------------------------------- |
| ライフタイム | 複数コンポーネント・複数 phase で共有が必要   | 単一コンポーネント内 / phase 遷移でリセット |
| 永続化要否 | アプリ再起動をまたいで保持が必要                | 表示中のみ必要（揮発で良い）               |
| 参照箇所   | 2箇所以上から同時参照                           | 1箇所のみから参照                          |
| 例         | 認証状態、ワークフロー Phase 遷移、スキル一覧   | rawPlanDetail、rawExecuteDetail、verifyError |

**ルール**: orchestration wrapper は `state owner` にならない。raw result と IPC コールバックは呼び出し元（`SkillLifecyclePanel` 等）が保持し、wrapper は `props` で受け取った値を child panel へ渡すだけにする。

### raw result の保持場所
**決定**: global store でなく、呼び出し元コンポーネントの local state で保持
**理由**: 表示専用のデータはglobal store不要、phase遷移で自動リセット

### terminal_handoff vs integrated_api 分離
**決定**: DetailPanel は integrated_api レスポンスのみ対象
**実装**: `if ("planId" in response.data)` 型ガードで判定
**理由**: terminal_handoff は既存TerminalHandoffCardで処理済み（二重表示回避）

### progressive disclosure
**決定**: 大量メタデータ（permissionDenials等）は折りたたみ+件数バッジ
**実装**: `useState(false)` で expanded 管理

### execute persist surface
**決定**: `ExecuteResultDetailPanel` は生成成功時の保存結果を別セクションで表示する。
**表示内容**: `persistResult.skillPath`、`persistResult.files`、`persistError`
**理由**: 実行成功と保存成功は別の failure mode なので、保存結果を隠さない方が追跡しやすい

### verify retry surface
**決定**: `SkillCreationResultPanel` は `verifyError` / `onRetryVerify` を受け取り、`VerifyResultDetailPanel` の error banner から verify detail 再取得を行う。
**理由**: verify detail の取得失敗は verify 結果そのものではなく取得経路の failure mode なので、execute/persist error と同じ banner に寄せない方が原因が追いやすい

## コンポーネント設計パターン早見表

| パターン     | 適用基準                                                       | 例                     |
| ------------ | -------------------------------------------------------------- | ---------------------- |
| React.memo   | props が安定しており再レンダリング防止が有効な場合             | ErrorBanner            |
| local state  | コンポーネント固有の一時データで store 化が不要な場合          | rawPlanDetail          |
| 共有部品抽出 | 2 つ以上のコンポーネントで同一の UI パターンが繰り返される場合 | result-panel-parts.tsx |
| orchestration wrapper | detail panel を束ねて overall status を表現する場合 | SkillCreationResultPanel |

## テスト戦略
- @testing-library/react + Vitest + happy-dom 環境
- ResizeObserver は vi.stubGlobal でモック必要
- 4状態（loading/error/null/data）全カバー
- edge case: 長テキスト、大量データ、XSS防止

---

## SkillLifecyclePanel 責務別props分離パターン

> 確立タスク: UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001（2026-04-08）

### 概要

`SkillLifecyclePanel` では複数の画面遷移導線を責務ごとに独立したpropsとして分離した。

### Props定義

```typescript
interface SkillLifecyclePanelProps {
  // スキル操作系
  onOpenWizard: () => void;           // 新規スキル作成ウィザードを開く
  onOpenSkillWizard: () => void;      // 既存スキルのウィザードを開く
  // 設定系（アダプターエラー時の導線）
  onOpenSettings: () => void;         // 設定画面を開く（LLMAdapterErrorBanner用）
}
```

### 設計判断ガイドライン

| パターン | 適用条件 | 理由 |
|---------|---------|------|
| props分割 | 遷移先の「責務」が異なる場合 | 1つのcallbackで分岐するとテスタビリティが低下 |
| 定数化 | UIからの入力が実行の必須条件でない場合 | 自由入力は条件判定を複雑化する |
| エラーバナー導線 | アダプター設定エラー時 | ユーザーを正しいアクション（設定変更）へ誘導 |

### canExecuteSkill の簡約化

```typescript
// 変更前（4条件以上）
const canExecuteSkill = selectedSkill && executionPrompt.trim().length > 0 && !isExecuting && adapterStatus === 'ok';

// 変更後（3条件）
const canExecuteSkill = selectedSkill && !isExecuting && adapterStatus === 'ok';
```

UIから入力依存を除去することで、実行可否の判定ロジックが明確になる。

### LLMAdapterErrorBanner → settings 導線

エラー時の設定画面への直接誘導パターン。`onOpenSettings` を `LLMAdapterErrorBanner` へ渡し、アダプター設定エラー発生時にユーザーを設定画面へ直接誘導する。実行ボタンの有効/無効制御（`adapterStatus === 'ok'`）と組み合わせることで、エラー状態のままスキル実行を試みるユーザーフローを防止できる。
