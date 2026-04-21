# スキルクリエイター ラリー機能ギャップ修正 Phase 1: 問題分析ドキュメント

作成日: 2026-04-21
対象バージョン: AIWorkflowOrchestrator（現行 main ブランチ）
分析手法: KJ法 + Why思考5段階 + 4条件評価

---

## 1. タスクの背景と動機

### 1.1 概要

スキルクリエイターのラリー（対話型インタビュー）機能は、ユーザーとシステムが問答を繰り返しながらスキル仕様を構築するコアインタラクションである。現在の実装には、IPC通信の二重経路・古い状態の残存・副作用フック設計の不備・型安全性の欠如・UX完結性の欠如という5つのカテゴリに分類される複数のギャップが存在する。

これらのギャップは個々には軽微に見えるが、組み合わさることで以下の実害を生む。

- ラリー中にワークフロー状態が不整合になり、正しい質問が表示されない
- Undoがサーバー状態を巻き戻さずUI表示だけが戻る
- 送信中に別のプッシュイベントが来た場合に競合が起き、画面がフリーズまたは二重送信になる
- ラリー完了後も「質問を待っています...」のまま表示が変わらない
- エラー発生後に回復手段がなくユーザーが詰まる

### 1.2 動機

これらのギャップを放置した場合、スキルクリエイター機能全体の信頼性が損なわれ、ユーザーがラリーを正常に完了できないケースが増加する。修正を13タスクに分解し、段階的に安全に適用することで、機能の堅牢性とUXを向上させる。

---

## 2. 問題の全体像（KJ法グループ）

### グループA: 状態管理の二重経路

**懸念点1: push/pull二重経路による冪等性欠如**

`onWorkflowStateChanged`（IPCプッシュ）と `getWorkflowState`（IPC invoke/pull）の両方が `workflowSnapshot` を更新する経路を持つ。どちらが「正規」の更新権限を持つかが設計で決定されていないため、タイミングによって古い状態で上書きが発生しうる。

**懸念点5: processWorkflowOutcomeのfire-and-forget混在**

`processWorkflowOutcome` が `await` 付きで呼ばれる箇所と `fire-and-forget` で呼ばれる箇所が混在している。エラー処理タイミングと状態更新順序が呼び出し箇所によって異なる。

**懸念点7: UndoのUI専用巻き戻し**

Undoがローカルのステップ履歴のみを巻き戻し、IPCサーバー側の状態を巻き戻さない。UI表示は戻るがサーバー状態は進んだままになり、次回送信時に整合性が崩れる。

### グループB: 古い状態の残存

**懸念点2: restoredPendingRequest合成の優先ルール不明確**

`restoredPendingRequest ?? workflowSnapshot?.awaitingUserInput` という合成式が存在するが、なぜ `restoredPendingRequest` を優先するのか・どの条件下で null になるのかがコード上明示されていない。

**懸念点3: SkillLifecyclePanelのdead code残存**

`_handleSubmitWorkflowInput`（未使用ハンドラ）と旧入力 state（`selectedOptionId` / `textAnswer` / `secretAnswer` / `confirmAnswer`）が残存している。これらは現在の入力送信フローで使われておらず、読み手を混乱させる。

**懸念点9: selectedOptionIds/selectedValues重複フィールド**

型定義に `selectedOptionIds` と `selectedValues` という類似フィールドが両方存在し、どちらが正規値かが型レベルで明記されていない。実装側での使い分けが曖昧になっている。

### グループC: 副作用フック設計不備

**懸念点4: addAssistantMessageのstale closure**

`addAssistantMessage` が `currentStepIndex` に依存した `useCallback` で定義されている。`steps` 配列が更新されてもクロージャが古い `currentStepIndex` を参照し続けるケースが発生しうる。

**懸念点6: useEffect依存配列の循環**

`SkillLifecyclePanel` の L675-708 の `useEffect` が `workflowSnapshot?.planId` を依存配列に含んでいる。`workflowSnapshot` 更新がエフェクトを再実行し、エフェクト内で `workflowSnapshot` が再更新される循環になりうる。

### グループD: 型安全と実行時保証

**懸念点8: getSkillCreatorApi()の型安全性欠如**

`getSkillCreatorApi()` と `getSessionResumeApi()` が同一 `window` オブジェクト上のプロパティを異なる型でキャストして参照している。型ガードなしの `as` キャストのため、実行時に `undefined` を型安全な値として扱ってしまうリスクがある。

### グループE: UX完結性欠如

**懸念点10: ラリー完了状態の表示欠如**

`awaitingUserInput === null` のとき「質問を待っています...」と表示されるため、ラリー進行中の待機状態とラリー完了後の状態が区別できない。

**懸念点11: 送信中競合処理なし**

`isSubmitting === true` の間に `onWorkflowStateChanged` プッシュイベントが到着した場合の競合処理が定義されていない。

**懸念点12: エラー後の回復導線なし**

エラー発生後に再試行・リセット・スキップの選択肢が提示されない。ユーザーはエラー表示の先に進む手段がない。

**懸念点13: Undo可能範囲の視覚的表現なし**

どこまでUndoできるかがUIに表示されない。ユーザーはUndoしていい範囲を把握できない。

---

## 3. 根本原因分析（Why思考5段階）

### 問題文

「ラリー機能でワークフロー状態が不整合になる」

### Why 1

なぜワークフロー状態が不整合になるのか？

→ push（IPC イベント）と pull（IPC invoke 戻り値）の両方が `workflowSnapshot` の更新権限を持ち、どちらが優先されるかがコードレベルで決まっていないから。

### Why 2

なぜ両方が更新権限を持つ実装になったのか？

→ push は「リアルタイム性のため」、pull は「確実な状態同期のため」それぞれ独立に追加され、どちらかを廃棄する設計決定がなされなかったから。

### Why 3

なぜ設計決定がなされなかったのか？

→ IPCの非同期性とイベント順序が曖昧なまま実装が先行し、「とりあえず両方更新すれば正しい状態になる」という暗黙の仮定が共有されたから。

### Why 4

なぜ暗黙の仮定で済んでいたのか？

→ ラリーのステップ数が少ない場合は競合が発現しにくく、テストカバレッジが競合シナリオをカバーしていなかったから。

### Why 5

なぜ競合シナリオのテストがなかったのか？

→ IPC の push/pull 競合は単体テストでは再現しにくく、E2Eテストに組み込むコストが後回しにされたから。

### 真の根本原因

**「IPC invoke 戻り値（pull）と IPC push イベントのどちらが workflowSnapshot の正規更新権限を持つかを設計で決定しないまま、両方を正規ルートとして実装した」**

この一点が解消されれば、グループA の3つの懸念点（1, 5, 7）は連鎖的に解決の方向性が定まる。グループB〜Eはこの根本原因を補強する構造的問題または独立した設計負債である。

---

## 4. 4条件評価（現状）

4条件とは「矛盾なし / 漏れなし / 整合性あり / 依存関係整合」を指す。

### 4.1 矛盾なし条件 — FAIL

**理由**: push と pull が同一 `workflowSnapshot` に対して矛盾した更新権限を持つ。`processWorkflowOutcome` の await/fire-and-forget 混在は、同一関数の呼び出し契約が矛盾している。

### 4.2 漏れなし条件 — FAIL

**理由**: ラリー完了状態の UI 表示がない（懸念点10）。エラー後の回復導線がない（懸念点12）。Undo 可能範囲の視覚的表現がない（懸念点13）。これらはユーザーへのフィードバック経路として漏れている。

### 4.3 整合性あり条件 — FAIL

**理由**: `selectedOptionIds` / `selectedValues` 重複フィールドの正規値が型定義レベルで明記されていない（懸念点9）。`restoredPendingRequest` の優先ルールが型・コメント・ドキュメントのいずれにも明記されていない（懸念点2）。dead code（懸念点3）がコードの意図を不整合にしている。

### 4.4 依存関係整合条件 — FAIL

**理由**: Undo がサーバー状態を巻き戻さない（懸念点7）ため、UI の依存先であるサーバー状態との整合が取れていない。`useEffect` 依存配列の循環（懸念点6）は React の依存関係モデルと実装が整合していない。`addAssistantMessage` の stale closure（懸念点4）は `currentStepIndex` への依存が実態と整合していない。

---

## 5. 受け入れ基準

### AC-1: 状態更新単一化

`workflowSnapshot` の更新は「IPC invoke 戻り値を正規ソース、push を補完ソース」として一本化され、競合時の挙動がコードおよびコメントで明示されること。

### AC-2: dead code 除去

`SkillLifecyclePanel` から `_handleSubmitWorkflowInput` および旧入力 state（`selectedOptionId` / `textAnswer` / `secretAnswer` / `confirmAnswer`）が削除され、TypeScript のビルドエラーなしでコンパイルされること。

### AC-3: useEffect / useCallback の依存配列正常化

循環 useEffect（懸念点6）が排除され、stale closure（懸念点4）が排除されること。React の lint ルール（exhaustive-deps）が警告を出さないこと。

### AC-4: Undo のサーバー状態巻き戻し

Undo 操作が IPC 経由でサーバー側の rollback API を呼び出し、サーバー状態と UI 状態が同期されること。

### AC-5: UX 完結性

ラリー完了状態が専用 UI で表示されること。エラー後に再試行・リセットの選択肢が表示されること。送信中のプッシュ競合が安全にキューイングまたは無視されること。Undo 可能範囲が視覚的に表示されること。
