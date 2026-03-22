# Phase 8: リファクタ境界

## タスクID: TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001

## 1. Concern 1 簡素化検討

### SRP 確認

- CapabilityCard: capability 状態の視覚表示のみ → SRP 準拠
- HealthStatusRow: health 状態の表示のみ → SRP 準拠
- ProviderSummaryCard: provider/model 情報の表示のみ → SRP 準拠
- AccessMatrixSection: 3コンポーネントの合成と Props 受け渡し → SRP 準拠

### 状態数の簡素化

- capability 4状態は execution-capability.ts で確定済み。削減不可（各状態に固有の CTA 契約がある）
- 共通化: 3コンポーネント間で共通の status indicator パターンを抽出可能だが、現段階では premature abstraction のため見送り

## 2. Concern 2 簡素化検討

### 配置の再評価

- header 右側配置は全画面共通。alternative（footer / sidebar）はレスポンシブ問題があり不採用維持
- TerminalLauncher を独立コンポーネントに保つことで、配置変更時の影響を最小化

## 3. Concern 3 簡素化検討

### guidance-only ロジック

- 条件分岐方式を維持。isAuthenticated props 1つで制御できるため、専用コンポーネント分離は不要
- PUBLIC_UNAUTHENTICATED_VIEWS との整合: shouldResetUnauthenticatedView.ts は変更しない

## 4. RG-ID ベースの不変条件

| RG-ID | 観点                | 不変条件                                                                          |
| ----- | ------------------- | --------------------------------------------------------------------------------- |
| RG-01 | P31 Store Hook      | 新セレクタは個別セレクタパターン（useXxx() 単体）であること                       |
| RG-02 | P48 useShallow      | .filter() / .map() で配列を返す派生セレクタに useShallow を適用する設計であること |
| RG-03 | P5 リスナー二重登録 | health subscription の cleanup が useEffect return で実行される設計であること     |
| RG-04 | P62 DEFAULT_CONFIG  | provider 未選択時にエラー表示またはセレクター画面リダイレクトが行われること       |
| RG-05 | Settings bypass     | PUBLIC_UNAUTHENTICATED_VIEWS に変更がないこと                                     |
| RG-06 | CTA 契約            | primary 1 + secondary 1 の上限が守られていること                                  |
