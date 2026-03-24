# Phase 5: TDD GREEN 実装サマリー

## 実装対象ファイル

### `packages/shared/src/types/execution-capability.ts`

#### 変更 1: UiState 8 値拡張（D-1）

- `UiState` union に `streaming | handoff | terminal-only | guidance-only | degraded` を追加
- `UI_STATE_VALUES` 配列を 8 要素に拡張（`as const satisfies` パターン維持）

#### 変更 2: CapabilityContext 拡張（D-2）

- 4 つの optional フィールドを追加:
  - `isStreaming?: boolean`
  - `isHandoffRequired?: boolean`
  - `isDegraded?: boolean`
  - `hasAlternativeGuidance?: boolean`

#### 変更 3: UiStateResult 拡張

- `handoffGuidance?: HandoffGuidance` フィールドを追加

#### 変更 4: resolveUiState() P1-P8 優先順位チェーン（D-3）

- overload 1（CapabilityContext → UiStateResult）を 8 値対応に書き換え
- 評価優先順位: P1:streaming → P2:handoff → P3:terminal-only → P4:degraded → P5:ready → P6:guidance-only → P7:blocked → P8:unavailable
- `buildHandoffGuidance()` ヘルパー関数を追加
- overload 2（後方互換 3 値）は変更なし

#### 変更 5: resolveCtaContract() 新 5 状態 CTA マッピング（D-5）

- overload 2 シグネチャを `(uiState: UiState, capability: AccessCapability)` に変更
  - 理由: テスト仕様と本番コードの整合性。本番コードはオブジェクト形式のみ使用しているため後方互換に影響なし
- 新 5 状態の CTA マッピングを追加:
  - streaming: primary=「停止」/ stopStreaming, secondary=「最新へ移動」/ scrollToLatest
  - handoff: primary=「terminal を開く」/ openTerminal, secondary=「コマンドをコピー」/ copyCommandToClipboard
  - terminal-only: primary=「terminal を開く」/ openTerminal, secondary=「コマンドをコピー」/ copyCommandToClipboard
  - guidance-only: primary=「設定を見る」/ openSettings, secondary=「ヘルプを表示」/ openHelp
  - degraded: primary=「manual fallback」/ openManualFallback, secondary=「ヘルプを表示」/ openHelp

#### 変更 6: Guard 関数追加（D-7）

- `assertStreamingCtaContract(uiState, ctaContract)`: streaming 状態で primary ラベルが「停止」であること
- `assertHandoffGuidanceExists(uiState, result)`: handoff 状態で handoffGuidance が存在すること

### 既存テスト修正

#### `execution-capability-regression.test.ts`

- terminalSurface + isTerminalAvailable → `ready` を `terminal-only` に更新（P3 ロジック変更に対応）
- 連鎖テストの CTA 期待値を `executeTerminalHandoff` → `openTerminal` に更新

#### `ui-state-vocabulary-contract.test.ts`

- CB-2 の期待値を `ready` → `terminal-only` に更新
- 型テストの validStates を 3 値 → 8 値に拡張

## テスト結果

- **16 ファイル / 338 テスト ALL GREEN**
- 新規テスト（Phase 4 作成）: uistate-resolve.test.ts (19), contract-matrix.test.ts (26), cta-contract.test.ts (29)
- 既存テスト: 全て PASS（regression 2 件修正済み）
