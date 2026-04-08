# Phase 12: スキルフィードバック（skill-feedback-report.md）— UT-SKILL-WIZARD-W1-par-02b

## メタ情報

- タスクID: UT-SKILL-WIZARD-W1-par-02b
- 作成日: 2026-04-08

## 対象

- `task-specification-creator`（Phase/成果物の規約とテンプレート）
- `aiworkflow-requirements`（システム仕様の正本）

## フィードバック（改善提案）

### 1. UI タスクの Phase 11 証跡テンプレートを強制的に「VISUAL」に寄せる

今回のように UI 変更が明確なタスクでは、`outputs/phase-11/screenshot-plan.json` と `phase11-capture-metadata.json` が旧タスクの `NON_VISUAL` のまま残りやすい。

改善案:

- UI task の場合、Phase 11 成果物のテンプレート生成時に `mode: "VISUAL"` をデフォルトにする
- `taskId` を自動埋めし、旧 taskId の混入を検出して fail-fast する（例: preflight スクリプト）

### 2. 「Step 0 -> Step 1 引き渡し項目」を設計テンプレートに明記する

本タスクでは `category` と `smartDefaults` を Step 0 から Step 1 へ渡す仕様が核心だった。

改善案:

- Phase 2（設計）のテンプレートに「ステップ間の state ownership と引き渡し項目」の表を必須化する
- `smartDefaults` の反映タイミング（初回のみ/都度更新/ユーザー入力優先）を decision として固定する欄を用意する

### 3. 用語の一貫性（onConfirmGenerate などの名前ずれ）を抑える仕組み

ドキュメント中のコールバック名が、実装の `onConfirm` / `onGenerate("skip")` などとズレると stale が発生する。

改善案:

- Phase 12 のチェック項目に「ドキュメント内の識別子（関数/prop 名）が現行コードのものか」を追加する
- 代表コードスニペットは「型/props 定義」から引用する方針に寄せる（手書きで drift しやすい）

### 4. Renderer での node-only import を早期に検出する

本タスクでは `node-cron` を renderer で直接 import したことで、Vite ブラウザバンドルの初期化時に runtime error が出た。

改善案:

- renderer 側の UI コンポーネントでは node-only パッケージを直接 import しないチェックを入れる
- cron / date / filesystem などは browser-safe な薄いユーティリティに寄せる
- Phase 11 の capture 前に「ブラウザで実際に route を開く smoke test」を必須にする

## 良かった点（維持したい点）

- `ConversationRoundStep` の `onAnswersChange` を `useEffect` に寄せ、setState updater 内の副作用を避けた点（テスト容易性と予測可能性が上がる）
- `ApplySummaryCard` の key-based マッピングにより、`Object.keys()` 依存の順序バグを避けた点
- Q3 の scheduleConfig を「定期実行から外れたら `undefined` にクリア」する挙動が仕様と一致している点
