# 要件定義書

## メタ情報

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| Phase      | 1                                                                           |
| 機能名     | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE                                      |
| タスク名   | onProgressコールバック接続・useStreamingProgressモード別phaseマッピング拡張 |
| 作成日     | 2026-04-19                                                                  |
| ステータス | completed                                                                   |

---

## 1. 機能要件

### FR-01: PHASE_TO_STAGEマップ拡張

`useStreamingProgress.ts` 内の `PHASE_TO_STAGE` マップに、update / orchestrate / improve-prompt モードで使用される phase 名を追加する。

| 追加エントリ                      | マッピング先 stage | 対象モード     |
| --------------------------------- | ------------------ | -------------- |
| `"loading-skill": "planning"`     | `planning`         | update         |
| `"analyzing": "planning"`         | `planning`         | update         |
| `"engine-selection": "planning"`  | `planning`         | orchestrate    |
| `"improving": "generating-skill"` | `generating-skill` | improve-prompt |

**理由**: 未知 phase が `planning` にフォールバックされることで、モード別の進捗がUIに正しく反映されない問題を解消する。

### FR-02: フォールバック動作の維持

`mapPhaseToStage` 関数において、`PHASE_TO_STAGE` に未登録の phase が渡された場合は `"planning"` を返すフォールバック動作を引き続き維持する。

```typescript
function mapPhaseToStage(phase: string): StreamingGenerationStage {
  return PHASE_TO_STAGE[phase] ?? "planning";
}
```

### FR-03: onProgressコールバックの接続確認

`useStreamingProgress.ts` は既に `skillCreatorAPI.onProgress` を `useEffect` 内で接続し、進捗を Zustand ストアへ反映する実装が完了している。追加の接続作業は不要。

### FR-04: GenerateStep.tsx の動的メッセージ表示

`GenerateStep.tsx` は `message || generationProgress || ""` の式で動的メッセージ表示に対応済み。追加実装不要。

### FR-05: generationProgressSlice.ts の型変更不要

`StreamingGenerationStage` 型（`idle | planning | generating-skill | generating-agents | validating | done | error | cancelled`）は既存のままで全モードの進捗状態をカバーできるため、型拡張は不要。

---

## 2. 非機能要件

### NFR-01: TypeScript型安全性

- `PHASE_TO_STAGE` の値は `StreamingGenerationStage` 型に適合すること
- `pnpm --filter @repo/desktop typecheck` がPASSすること（AC-6）

### NFR-02: パフォーマンス

- onProgress コールバックはリスナー登録・解除を1回で完結させること（二重登録禁止）
- `useEffect` のクリーンアップ関数で必ずリスナーを解除すること（P5対策）

### NFR-03: 後方互換性

- create モード既存 phase（`planning`, `generating-skill`, `generating-agents`, `validating`, `done`）のマッピングを変更しないこと
- 既存テストケースが引き続きPASSすること（リグレッションなし）

### NFR-04: コード品質

- `pnpm --filter @repo/desktop lint` がPASSすること
- Prettier フォーマットに準拠すること

### NFR-05: テスト可能性

- 各 phase 名に対して `mapPhaseToStage` の単体テストが記述可能であること
- モード別 phase のマッピング結果が決定論的であること

---

## 3. 対象ファイル

| ファイル                                                             | 変更内容                                               |
| -------------------------------------------------------------------- | ------------------------------------------------------ |
| `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`            | `PHASE_TO_STAGE` に4エントリ追加（**唯一の変更対象**） |
| `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx` | 変更なし（既に動的表示対応済み）                       |
| `apps/desktop/src/renderer/store/slices/generationProgressSlice.ts`  | 変更なし（既存型で十分）                               |

---

## 4. スコープ外

- `SkillLifecyclePanel.tsx` への onProgress 追加接続（`useStreamingProgress.ts` で既に対応済み）
- `generationProgressSlice.ts` への新 stage 型追加
- `skill-creator-api.ts` の型変更
- UI コンポーネントの新規作成
