# Phase 2: 設計

## メタ情報

| 項目     | 値                               |
| -------- | -------------------------------- |
| Phase    | 2                                |
| タスクID | TASK-SC-06-UI-RUNTIME-CONNECTION |
| 機能名   | w4b-2-sc-ui-runtime-connection   |
| 作成日   | 2026-03-22                       |
| 更新日   | 2026-03-24                       |

## 目的

Phase 1 のギャップ分析（G1-G6）を解消するための具体的な設計を行う。SkillLifecyclePanel の `handlePrepare()` → `planSkill()` 接続、Zustand 状態追加、TerminalHandoff 表示、後方互換設計を策定する。

## 設計方針

**主要な UI エントリポイント**: SkillLifecyclePanel（単一ページライフサイクル）を優先接続対象とする。SkillCreateWizard への接続は未タスク化。

**理由**:

- SkillLifecyclePanel は既に「依頼→実行→改善」の3段階フローを持ち、plan→execute→improve と自然に対応する
- `handlePrepare()` の mode 判定→plan 呼出は最小変更で接続可能
- SkillCreateWizard は独立したフローであり、別タスクで対応可能

## 実行タスク

- フロー設計: handlePrepare → planSkill → executePlan の接続フローを設計する
- SkillLifecyclePanel 変更設計: handlePlanSkill / handleExecutePlan の具体的な実装設計を記述する
- Zustand 状態設計: AgentSlice への5フィールド + 6アクション + 7セレクタの追加設計
- Plan 結果表示 UI 設計: SkillLifecyclePanel の Step 1 内に plan 結果表示セクションを設計する
- TerminalHandoff 表示設計: 既存 handoffGuidance UI の活用方針を策定する
- 後方互換設計: 既存 skill:create フローとの共存設計を策定する
- IPC レスポンス wrapper 形式設計: P60 対策として IpcResult<T> の統一方針を策定する
- エラーハンドリング設計: planSkill/executePlan の各エラーケースの UI 動作を策定する

## 実行手順

### 1. フロー設計: handlePrepare → planSkill → executePlan

```
SkillLifecyclePanel Step 1「依頼をまとめる」
  │
  ├─ 「方針を決める」ボタン → handlePrepare()
  │   │
  │   ├─ detectMode(request) → mode 判定
  │   │   ├─ mode === "create" → 従来フロー（変更なし）
  │   │   └─ mode === "plan" or "improve" → planSkill フロー開始
  │   │
  │   └─ [NEW] planSkill(request, authMode, apiKey)
  │       ├─ success + type === "terminal_handoff"
  │       │   → handoffGuidance を表示（既存 UI 活用）
  │       ├─ success + type === "integrated_api"
  │       │   → plan 結果を currentPlanResult に保存
  │       │   → 「実行する」ボタンを表示
  │       └─ error
  │           → generationError を設定
  │
  ├─ [Plan 結果承認後]「実行する」ボタン
  │   └─ executePlan(planId, skillSpec, authMode, apiKey)
  │       ├─ success → fetchSkills() → selectSkillByName()
  │       └─ error → generationError を設定
  │
  └─ 「スキルを生成する」ボタン → handleCreate()（変更なし、後方互換）
```

### 2. SkillLifecyclePanel 変更設計

#### handlePrepare() の拡張（L287-310 付近）

現行:

```typescript
const result = await skillCreatorApi.detectMode(trimmedRequest);
setDetectedMode(result.data);
```

変更後:

```typescript
const result = await skillCreatorApi.detectMode(trimmedRequest);
setDetectedMode(result.data);

// detectMode の結果が plan または improve の場合、planSkill を自動呼出
if (result.data === "plan" || result.data === "improve") {
  await handlePlanSkill(trimmedRequest);
}
```

#### 新規メソッド: handlePlanSkill()

```typescript
const handlePlanSkill = async (description: string) => {
  setIsGenerating(true); // Zustand
  setGenerationError(null); // Zustand
  setGenerationProgress("計画を生成中..."); // Zustand

  try {
    const skillCreatorApi = getSkillCreatorApi();
    if (!skillCreatorApi?.planSkill) {
      throw new Error("planSkill API が利用できません");
    }

    const result = await skillCreatorApi.planSkill(
      description,
      authMode, // 既存の認証状態から取得
      apiKey, // 既存の認証状態から取得
    );

    if (!result.success || !result.data) {
      throw new Error(result.error ?? "計画生成に失敗しました");
    }

    if (result.data.type === "terminal_handoff") {
      // Terminal Handoff: 既存の handoffGuidance UI を活用
      set({ handoffGuidance: result.data.guidance });
    } else {
      // Integrated API: plan 結果を保存
      setCurrentPlanId(result.data.planId);
      setCurrentPlanResult(result.data);
    }
  } catch (error) {
    setGenerationError(
      error instanceof Error ? error.message : "計画生成に失敗しました",
    );
  } finally {
    setIsGenerating(false);
    setGenerationProgress(null);
  }
};
```

#### 新規メソッド: handleExecutePlan()

```typescript
const handleExecutePlan = async () => {
  if (!currentPlanId || !currentPlanResult) return;

  setIsGenerating(true);
  setGenerationProgress("スキルを生成中...");

  try {
    const skillCreatorApi = getSkillCreatorApi();
    const result = await skillCreatorApi.executePlan(
      currentPlanId,
      request.trim(), // skillSpec として description を渡す
      authMode,
      apiKey,
    );

    if (!result.success || !result.data) {
      throw new Error(result.error ?? "スキル生成に失敗しました");
    }

    // 成功: スキル一覧を更新し新規スキルを選択
    await fetchSkills();
    if (result.data.skillName) {
      selectSkillByName(result.data.skillName);
    }
    setCreatedSkillPath(result.data.skillPath ?? null);
    setCreatedSkillName(result.data.skillName ?? null);

    // 生成状態をクリア
    clearGenerationState();
  } catch (error) {
    setGenerationError(
      error instanceof Error ? error.message : "スキル生成に失敗しました",
    );
  } finally {
    setIsGenerating(false);
    setGenerationProgress(null);
  }
};
```

### 3. Zustand 状態設計（AgentSlice 拡張）

#### 状態フィールド追加

```typescript
// AgentState に追加
isGenerating: boolean; // plan/execute 実行中
generationProgress: string | null; // プログレスメッセージ
generationError: string | null; // エラーメッセージ
currentPlanId: string | null; // planSkill から返された planId
currentPlanResult: RuntimeSkillCreatorPlanResponse | null; // plan 結果全体
```

#### アクション追加

```typescript
// AgentActions に追加
setIsGenerating: (value: boolean) => void;
setGenerationProgress: (value: string | null) => void;
setGenerationError: (value: string | null) => void;
setCurrentPlanId: (value: string | null) => void;
setCurrentPlanResult: (value: RuntimeSkillCreatorPlanResponse | null) => void;
clearGenerationState: () => void;
```

#### clearGenerationState の実装

```typescript
clearGenerationState: () => {
  set({
    isGenerating: false,
    generationProgress: null,
    generationError: null,
    currentPlanId: null,
    currentPlanResult: null,
  });
},
```

#### 個別セレクタ（P31 対策）

```typescript
// store/index.ts に追加
export const useIsSkillGenerating = () =>
  useAppStore((state) => state.isGenerating);
export const useGenerationProgress = () =>
  useAppStore((state) => state.generationProgress);
export const useGenerationError = () =>
  useAppStore((state) => state.generationError);
export const useCurrentPlanId = () =>
  useAppStore((state) => state.currentPlanId);
export const useCurrentPlanResult = () =>
  useAppStore((state) => state.currentPlanResult);
export const useSetIsSkillGenerating = () =>
  useAppStore((state) => state.setIsGenerating);
export const useClearGenerationState = () =>
  useAppStore((state) => state.clearGenerationState);
```

**P48 対策**: 上記セレクタはプリミティブ値またはアクション参照のみを返すため、`useShallow` は不要。`currentPlanResult` はオブジェクトだが、Zustand の `Object.is` 比較で参照が変わらない限り再レンダーしないため安全。

### 4. Plan 結果表示 UI 設計

SkillLifecyclePanel の Step 1 内に、plan 結果表示セクションを追加:

```tsx
{
  /* Plan 結果表示（currentPlanResult が存在する場合） */
}
{
  currentPlanResult && currentPlanResult.type === "integrated_api" && (
    <div className="rounded-lg border border-[var(--border)] p-4 mt-4">
      <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">
        生成計画
      </h4>
      <p className="text-sm text-[var(--text-secondary)]">
        推定ステップ数: {currentPlanResult.estimatedSteps}
      </p>
      {/* plan 詳細表示 */}
      <div className="flex justify-end mt-3 gap-2">
        <button onClick={clearGenerationState} className="...">
          キャンセル
        </button>
        <button
          onClick={handleExecutePlan}
          disabled={isGenerating}
          className="..."
        >
          実行する
        </button>
      </div>
    </div>
  );
}
```

### 5. TerminalHandoff 表示設計

既存の `handoffGuidance` 表示 UI を活用する。planSkill が `terminal_handoff` を返した場合:

1. AgentSlice の `handoffGuidance` に guidance を設定
2. 既存の TerminalHandoff 表示コンポーネントがガイダンスを表示
3. ユーザーが手動で CLI 実行を選択

**追加変更なし**: 既存の `handoffGuidance` 表示ロジックがそのまま使える。

### 6. 後方互換設計

| 操作                          | 変更前                  | 変更後                         | 影響 |
| ----------------------------- | ----------------------- | ------------------------------ | ---- |
| 「スキルを生成する」ボタン    | `handleCreate()` 直呼出 | 変更なし                       | なし |
| 「方針を決める」ボタン        | `detectMode()` のみ     | `detectMode()` + `planSkill()` | 拡張 |
| SkillCreateWizard 4段階フロー | 変更なし                | 変更なし                       | なし |
| AgentSlice.createSkill()      | 変更なし                | 変更なし                       | なし |
| AgentSlice.executeSkill()     | 変更なし                | 変更なし                       | なし |

**条件分岐**:

- `detectMode()` が `"create"` を返した場合: 従来フローを維持
- `detectMode()` が `"plan"` / `"improve"` を返した場合: planSkill フローを開始
- `detectMode()` API 未接続時: 従来の graceful degradation（「create モード」フォールバック）

### 7. IPC レスポンス wrapper 形式（P60 対策）

すべての IPC 呼び出しは既存の `IpcResult<T>` wrapper を使用:

```typescript
interface IpcResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

## エラーハンドリング設計

| エラーケース                   | 表示先               | UI 動作                                |
| ------------------------------ | -------------------- | -------------------------------------- |
| planSkill API 未接続           | `generationError`    | 「planSkill API が利用できません」表示 |
| planSkill ネットワークエラー   | `generationError`    | エラーメッセージ表示 + リトライ可能    |
| planSkill バリデーションエラー | `generationError`    | 入力フォーム横にエラー表示             |
| executePlan 失敗               | `generationError`    | エラーメッセージ表示 + plan 結果保持   |
| detectMode 失敗                | `localError`（既存） | 既存のエラー表示（変更なし）           |

## 参照資料

| 資料名               | パス                                                                        | 説明                                 |
| -------------------- | --------------------------------------------------------------------------- | ------------------------------------ |
| Phase 1 要件定義書   | `docs/30-workflows/w4b-2-sc-ui-runtime-connection/phase-01-requirements.md` | ギャップ分析・受入基準・Zustand 要件 |
| AgentSlice           | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                      | 既存 Zustand Slice                   |
| SkillCreatorAPI      | `apps/desktop/src/preload/skill-creator-api.ts`                             | Preload API インターフェース         |
| 状態管理ルール       | `.claude/rules/03-state-management.md`                                      | Zustand 設計原則、P31/P48 対策       |
| アーキテクチャルール | `.claude/rules/01-architecture.md`                                          | Apple HIG デザイン原則               |
| 既知の落とし穴       | `.claude/rules/06-known-pitfalls.md`                                        | P31, P48, P60, P65                   |

## 統合テスト連携

Phase 2（設計）では以下の統合テスト観点を設計に反映する:

- handlePrepare → planSkill → executePlan の E2E フロー設計にテスト容易性を考慮
- IPC レスポンス wrapper 形式（P60 対策）をテストで検証可能な形に統一
- Zustand 個別セレクタ（P31 対策）のテスト設計を考慮した命名・エクスポート設計

## 多角的チェック観点

| 観点               | 適用判断 | 確認内容                                                                    |
| ------------------ | -------- | --------------------------------------------------------------------------- |
| セキュリティ       | 該当     | planSkill/executePlan の引数バリデーション設計、エラーサニタイズ設計        |
| UI/UX              | 該当     | Plan 結果表示 UI、TerminalHandoff ガイダンス表示、isGenerating 中の操作制限 |
| アーキテクチャ     | 該当     | Zustand Slice 設計（P31/P48 対策）、後方互換設計（条件分岐）                |
| エラーハンドリング | 該当     | planSkill/executePlan の5つのエラーケースに対する UI 動作設計               |

## サブタスク管理

Phase実行開始時にTaskCreateで以下のサブタスクを作成する:

1. 参照資料の確認
2. 実行タスクの実施
3. 統合テスト連携の実施
4. 成果物の作成
5. 完了条件の検証

## 成果物

| 成果物 | パス                                                                  | 説明                                                                                        |
| ------ | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 設計書 | `docs/30-workflows/w4b-2-sc-ui-runtime-connection/phase-02-design.md` | 本ファイル（フロー設計・Zustand 設計・UI 設計・後方互換設計・エラーハンドリング設計を含む） |

## 完了条件

- [x] handlePrepare → planSkill → executePlan のフローを設計した
- [x] handlePlanSkill / handleExecutePlan の具体的な実装設計を記述した
- [x] Zustand 状態（isGenerating, generationProgress, generationError, currentPlanId, currentPlanResult）を設計した
- [x] 個別セレクタを設計した（P31 対策: 7セレクタ）
- [x] P48 対策の要否を判定した（プリミティブ値のみのため useShallow 不要）
- [x] Plan 結果表示 UI を設計した
- [x] TerminalHandoff 表示設計を確認した（既存 handoffGuidance UI 活用）
- [x] 既存 skill:create フローとの後方互換を設計した
- [x] IPC レスポンス wrapper 形式を明示した（P60 対策: IpcResult<T>）
- [x] エラーハンドリング設計を策定した

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了した
- [ ] 各タスクの成果物が生成されている
- [ ] 完了条件を全て満たしている

## 次のPhase

Phase 3: 設計レビュー
