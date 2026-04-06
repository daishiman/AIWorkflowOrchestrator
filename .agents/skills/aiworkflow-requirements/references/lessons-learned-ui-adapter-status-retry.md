# Lessons Learned / UI アダプター状態表示・リトライ導線

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> インデックス: [lessons-learned-current.md](lessons-learned-current.md)
> 対象タスク: TASK-RT-02 api-key-ui-adapter-status（2026-03-29）

---

## 変更履歴

| 日付       | バージョン | 変更内容                           |
| ---------- | ---------- | ---------------------------------- |
| 2026-03-29 | 1.0.0      | 新規作成。TASK-RT-02 教訓3件を追加 |

---

## TASK-RT-02 / api-key-ui-adapter-status

### 概要

`ApiKeysSection` コンポーネントへ `AdapterStatusBadge` / `RetryButton` を統合し、
LLMアダプターの接続状態（`ready` / `initializing` / `failed`）をリアルタイム可視化する実装。

---

### L-RT-02-001: useRef による非同期競合状態（race condition）防止

**カテゴリ**: 非同期 / React Hooks

**課題**: `refreshAdapterStatuses()` を複数回連続呼び出しした場合、後から返ってきた古いレスポンスが最新の状態を上書きする。

**再発条件**:

- 同一コンポーネントで複数の非同期リクエストが並走する場合
- ユーザーがリトライボタンを連打した場合
- `useEffect` で API を呼び、依存配列が変化して再実行される場合

**解決策**: `useRef` でリクエスト ID をトラッキングし、古いリクエスト結果を無視する。

```typescript
const adapterStatusRequestIdRef = useRef(0);

const refreshAdapterStatuses = useCallback(async (providers: ...) => {
  const requestId = ++adapterStatusRequestIdRef.current;
  // ...非同期処理...
  if (requestId !== adapterStatusRequestIdRef.current) return; // 古いリクエストを無視
  setAdapterStatusMap(result);
}, []);
```

**ポイント**: `useState` ではなく `useRef` を使う理由は、ID の変化が再レンダリングを引き起こすべきでないため。

---

### L-RT-02-002: Promise.allSettled によるプロバイダー独立エラー処理

**カテゴリ**: 非同期 / エラーハンドリング

**課題**: 複数プロバイダーの health check を並列実行する際、1件のエラーが `Promise.all` で全体を止める。

**再発条件**:

- 複数の外部サービスをまとめて呼ぶ場合
- 1件失敗しても他の結果を表示したい場合

**解決策**: `Promise.allSettled` で全結果を収集し、`rejected` 時は個別に `failed` 状態へフォールバック。

```typescript
const results = await Promise.allSettled(
  providers.map((provider) => llmApi.checkHealth(provider)),
);

results.forEach((result, i) => {
  if (result.status === "fulfilled") {
    newMap[providers[i]] = toAdapterStatusEntry(result.value);
  } else {
    newMap[providers[i]] = {
      status: "failed",
      failureReason: String(result.reason),
    };
  }
});
```

**ポイント**: `Promise.allSettled` vs `Promise.all` の使い分け — 全件成功前提なら `all`、部分失敗許容なら `allSettled`。

---

### L-RT-02-003: Partial<Record<K, V>> によるプロバイダー単位 Map 状態管理

**カテゴリ**: 型設計 / React State

**課題**: `isRetrying: boolean` を単一のフラグにすると、プロバイダーAのリトライ中にプロバイダーBのボタンも disabled になる。

**再発条件**:

- 同一画面に複数エンティティの独立した非同期アクションが存在する場合
- リスト UI で各アイテムの状態を独立管理したい場合

**解決策**: `Partial<Record<AIProvider, boolean>>` でプロバイダーごとに状態を分離。

```typescript
const [adapterIsRetrying, setAdapterIsRetrying] = useState<
  Partial<Record<AIProvider, boolean>>
>({});

// 特定プロバイダーのみを更新（他プロバイダーに影響しない）
setAdapterIsRetrying((prev) => ({ ...prev, [provider]: true }));
```

**ポイント**: この Map パターンは `ApiKeySettingsPanel` の `validating` 状態管理でも同様に使用されており、複数エンティティの独立状態管理の標準パターンとして定着している。

---

## 関連リソース (TASK-RT-02)

| リソース                                                         | 用途         |
| ---------------------------------------------------------------- | ------------ |
| `apps/desktop/src/renderer/components/atoms/AdapterStatusBadge/` | 実装アンカー |
| `apps/desktop/src/renderer/components/atoms/RetryButton/`        | 実装アンカー |
| `apps/desktop/src/renderer/components/organisms/ApiKeysSection/` | 統合先       |
| `docs/30-workflows/task-rt-02-api-key-ui-adapter-status/`        | タスク仕様書 |
| [task-workflow-completed.md](task-workflow-completed.md)         | 完了記録     |

---

## TASK-RT-03: SkillCreationResultPanel 実装知見 (2026-04-06)

### 概要

Plan / Execute / Verify 結果を束ねる UI orchestration wrapper 実装タスク。
新規コンポーネント: SkillCreationResultPanel.tsx, ErrorBanner.tsx, PlanResultDetailPanel.tsx, ExecuteResultDetailPanel.tsx, result-panel-parts.tsx
修正: SkillLifecyclePanel.tsx（rawPlanDetail/rawExecuteDetail local state 追加、verifyDetail の owner 維持、prepare reset で旧 result surface 破棄、verify fetch retry 導線追加）、ExecuteResultDetailPanel.tsx（persistResult.skillPath/files/persistError 表示）
テスト: targeted suite PASS（SkillCreationResultPanel / ExecuteResultDetailPanel / SkillLifecyclePanel）

### L-RT-03-001: raw result の保持場所選定

**カテゴリ**: 状態管理 / React

**課題**: RuntimeSkillCreatorPlanResult/ExecuteResult をどこで保持するかの判断が必要だった。

**判断**: SkillLifecyclePanel の local state で保持。

**再発条件**:
- 表示専用のデータを global store に入れようとする場合
- phase 切り替え時に自動クリアしたい状態がある場合

**解決策**: `useState` で local state として管理し、`handlePrepare()` / `handleCancelPlan()` 呼び出し時にまとめてクリア。phase 遷移による自動リセットで一貫性確保。

**ポイント**: 一時的なUI表示データで他コンポーネントが参照不要な場合は global store 不要。表示専用データは local state の方がライフサイクル管理が簡潔になる。

---

### L-RT-03-002: terminal_handoff vs integrated_api の型ガード分離

**カテゴリ**: TypeScript 型設計 / UI 責務分離

**課題**: `RuntimeSkillCreatorPlanResponse` が union type のため、`PlanResultDetailPanel` の表示対象を integrated_api レスポンスに限定するための型ガードを確立するまで試行錯誤した。

**判断**: `PlanResultDetailPanel` は `integrated_api` レスポンスのみ対象。

**実装**: `if ("planId" in planResult.data)` 型ガードで分岐。

**解決策**:
- `terminal_handoff` は既存 `TerminalHandoffCard` で表示済み（二重表示回避）
- `error` は既存 `ErrorBanner` で表示済み
- detail panel は「成功時の詳細確認」に責務特化

**ポイント**: 複数 response タイプを持つ API の分岐処理では、`in` 演算子による discriminant key 存在チェックが TypeScript narrowing の安全な手法。

---

### L-RT-03-003: progressive disclosure パターン

**カテゴリ**: UI/UX / パフォーマンス

**課題**: `permissionDenials` / `sdkEvents` は件数が可変で多くなりうるため、常時展開するとUI過負荷になる。

**判断**: 件数バッジ + 折りたたみで表示。

**実装**: `useState(false)` で expanded 状態管理、件数バッジで概要を常時表示。

**解決策**: `SectionHeader` に `badge={count}` と `onClick={toggle}` を渡し、折りたたみ UI を `result-panel-parts.tsx` の共通パーツとして実装。

**ポイント**: 件数が可変で多くなりうるメタデータ表示全般に適用可能なパターン。数十〜数百件のリストを常時展開するとUI過負荷。

---

### L-RT-03-004: 共通UIパーツ early 抽出

**カテゴリ**: コンポーネント設計 / DRY

**課題**: `PlanResultDetailPanel` と `ExecuteResultDetailPanel` で同一 UI 構造（SectionHeader / TagList / StatusBadge / DetailFooter）が3箇所以上重複する見込みだった。

**判断**: `result-panel-parts.tsx` に共通パーツを集約（DRY 原則適用）。

**解決策**: 実装初期に `result-panel-parts.tsx` を作成し、`SectionHeader` / `TagList` / `StatusBadge` / `DetailFooter` の4パーツを共通化。`React.memo()` を適用してパフォーマンス最適化。

**ポイント**: 2つ以上のパネルコンポーネントが同一UI構造を持つ場合は early に抽出する。後から抽出すると型定義の修正が広範囲に波及する。

### L-RT-03-005: orchestration wrapper は parent state owner と分離する

**カテゴリ**: コンポーネント設計 / 責務分離

**課題**: wrapper に detail 表示だけでなく raw result の所有権まで持たせると、reverify や phase 遷移時の状態クリアが分散しやすい。

**判断**: `SkillCreationResultPanel` は表示専用の wrapper にして、`SkillLifecyclePanel` を rawPlanDetail / rawExecuteDetail / verifyDetail の owner とする。

**再発条件**:
- wrapper 側で state を持ち始める場合
- detail panel の再利用性より、親子の state owner 境界が曖昧になる場合

**解決策**: parent は state owner、wrapper は composition only、detail panel は presentation only に閉じる。

**ポイント**: UI wrapper を増やす時は「誰が state を持つか」を先に固定しないと、後から clear 条件が追いにくい。

### L-RT-03-006: execute の保存結果 surface は failure mode を分けて見せる

**カテゴリ**: UI/UX / エラー追跡

**課題**: execute が成功しても保存失敗が起きるケースでは、実行結果と保存結果を同じ見た目で処理すると原因追跡が難しい。

**判断**: `ExecuteResultDetailPanel` に `Persist Result` と `Persist Error` を別セクションで表示する。

**再発条件**:
- 成功/失敗の 2 値だけで表示を設計しようとする場合
- persist の結果を execute の success flag に吸収しようとする場合

**解決策**: success flag とは独立に persist surface を持ち、`skillPath` / `files` / `persistError` を別枠で出す。

**ポイント**: 「実行できた」ことと「保存できた」ことは同義ではない。後続の障害調査では、両方を切り分けて見せる方が強い。

### L-RT-03-007: verify fetch failure は wrapper 内の retry surface に閉じる

**カテゴリ**: エラーハンドリング / UI 責務分離

**課題**: verify detail の取得失敗を親の global error banner に流すと、結果 surface と操作エラーが混ざってしまう。

**判断**: `SkillCreationResultPanel` が `verifyError` を受け取り、`VerifyResultDetailPanel` の error banner と retry ボタンで閉じる。

**再発条件**:
- detail panel の error と親 surface の error を同じ banner に寄せたくなる場合
- retry action を reverify action と混同する場合

**解決策**: error banner の retry は fetch retry に限定し、reverify は verify owner 側の action として残す。

**ポイント**: 取得失敗と再検証要求は failure mode が違う。UI でも操作導線を分ける方が、原因と回復手順が見えやすい。

### L-RT-03-008: new prepare 開始時は in-flight verify request を無効化する

**カテゴリ**: 非同期制御 / ライフサイクル管理

**課題**: 旧 request が遅れて返ってくると、新しい prepare の結果 surface を上書きしてしまう。

**判断**: prepare 開始時に `clearPlanExecutionState()` で verify request の世代を進め、古い request を破棄する。

**再発条件**:
- 複数の非同期 load が同一 state を更新する場合
- phase 遷移時に前フェーズの result を残したままにする場合

**解決策**: request sequence を持ち、世代が古い response は state 更新しない。

**ポイント**: UI の再試行や再生成は「前のリクエストを無効にする」こととセットで設計すると、見た目の残像が消しやすい。

---

### 苦戦箇所

| 項目 | 内容 |
| ---- | ---- |
| 型ガード実装 | `RuntimeSkillCreatorPlanResponse` が union type のため、`"planId" in data` で `integrated_api` を判定する方法を確立するまで試行錯誤 |
| テスト環境 | happy-dom では `window.ResizeObserver` が未定義のため mock が必要だった |

---

## 関連リソース (TASK-RT-03)

| リソース                                                                                   | 用途         |
| ------------------------------------------------------------------------------------------ | ------------ |
| `apps/desktop/src/renderer/components/skill/SkillCreationResultPanel.tsx`                  | 実装アンカー |
| `apps/desktop/src/renderer/components/skill/ErrorBanner.tsx`                               | 実装アンカー |
| `apps/desktop/src/renderer/components/skill/PlanResultDetailPanel.tsx`                     | 実装アンカー |
| `apps/desktop/src/renderer/components/skill/ExecuteResultDetailPanel.tsx`                  | 実装アンカー |
| `apps/desktop/src/renderer/components/skill/result-panel-parts.tsx`                         | 実装アンカー |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                        | 修正対象     |
| `docs/30-workflows/TASK-RT-03-skill-creation-result-panel/`                                 | タスク仕様書 |
