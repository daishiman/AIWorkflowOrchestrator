# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 4                                    |
| Phase名    | テスト作成                           |
| 前提Phase  | Phase 3                              |
| 後続Phase  | Phase 5                              |
| ステータス | spec_created                         |
| 作成日     | 2026-03-29                           |
| 機能名     | task-rt-02-api-key-ui-adapter-status |

## 目的

実装前に、既存 API 再利用前提の Red テストを作成し、UI 局所状態導出と retry UX の契約を固定する。

## 実行タスク

- helper テスト作成: state 導出ロジックの Red テストを作る
- UI テスト作成: `ApiKeysSection` の正常系/失敗系/再試行の Red テストを作る
- a11y テスト作成: status / busy / retry ラベルの Red テストを作る

## 実行手順

### タスク1: 状態導出 helper テスト

対象:

- `deriveAdapterUiStatus()`
- `shouldRunHealthCheck()`

観点:

- 登録済み + health pending → `initializing`
- 登録済み + `connected` → `ready`
- 登録済み + `disconnected/error` → `failed`
- 未登録 → health 非対象

### タスク2: `ApiKeysSection` UI テスト

対象:

- 初回 mount 時の provider 行表示
- health check 実行中の行表示
- `failed` 行の retry CTA
- retry 後に対象行のみ更新
- save/delete 後の再ロード

### タスク3: アクセシビリティテスト

対象:

- `role="status"`
- `aria-busy`
- retry button の `aria-label`
- failure reason の読み上げ導線

## 統合テスト連携【必須】

| 判定項目       | 基準 | 結果   |
| -------------- | ---- | ------ |
| 状態導出テスト | 100% | 未実施 |
| UI 正常系      | 100% | 未実施 |
| UI 異常系      | 80%+ | 未実施 |
| a11y テスト    | 100% | 未実施 |

## 参照資料

| 参照資料  | パス                                                                      | 内容       |
| --------- | ------------------------------------------------------------------------- | ---------- |
| 現行 UI   | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx` | テスト対象 |
| Health 型 | `packages/shared/src/types/llm/schemas/health.ts`                         | 判定入力   |

## 成果物

| 成果物       | パス                            | 説明                             |
| ------------ | ------------------------------- | -------------------------------- |
| テスト仕様書 | `outputs/phase-4/test-specs.md` | helper/UI/a11y の Red テスト設計 |

## 完了条件

- [ ] helper テスト観点が定義されている
- [ ] UI テスト観点が定義されている
- [ ] a11y テスト観点が定義されている
- [ ] Phase 5 に渡す Red 条件が明確である
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 5: 実装
