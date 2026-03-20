# Phase 4: テストマトリクス

## メタ情報

| 項目       | 内容                                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001                                                  |
| Phase      | 4                                                                                                          |
| 作成日     | 2026-03-20                                                                                                 |
| 依存成果物 | outputs/phase-2/contract-matrix.md, outputs/phase-2/validation-matrix.md, outputs/phase-3/gate-decision.md |

## 概要

本マトリクスは Phase 3 ゲート PASS を受けて、contract-matrix.md に定義された Concern A / B / C の全組み合わせを網羅するテストケースを定義する。各テストケースは validation-matrix.md の AC 別検証パスと対応している。

---

## Concern A: capability 判定テスト（CA-1 〜 CA-5）

**対象**: `RuntimePolicyResolver.ts`
**対応 AC**: AC-1
**テスト種別**: ユニットテスト

### CA テストケース一覧

| テストID | 入力条件                                                                       | 期待 capability     | 備考                                                           |
| -------- | ------------------------------------------------------------------------------ | ------------------- | -------------------------------------------------------------- |
| CA-1     | API key 有効 (`isValid: true`)、subscription 無効 (`subscriptionValid: false`) | `integratedRuntime` | 基本ケース：API key のみ有効                                   |
| CA-2     | API key 無効 (`isValid: false`)、subscription 有効 (`subscriptionValid: true`) | `terminalSurface`   | 基本ケース：subscription のみ有効                              |
| CA-3     | API key 有効、subscription 有効                                                | `both`              | 両方有効の場合                                                 |
| CA-4     | API key 無効、subscription 無効                                                | `none`              | 両方無効の場合                                                 |
| CA-5     | API key 有効だが接続 timeout、subscription 有効                                | `terminalSurface`   | degraded fallback：timeout 時は integratedRuntime を使用しない |

### CA テストケース詳細

#### CA-1: API key 有効 / subscription 無効

```
入力:
  IAuthKeyService.getKey() → "sk-ant-api03-valid-key"
  IAuthModeService.getMode() → "api-key"
  IAuthModeService.getStatus() → { isValid: true, hasCredentials: true, mode: "api-key" }

期待出力:
  capability = "integratedRuntime"

検証ポイント:
  - capability が "integratedRuntime" であること
  - "terminalSurface" / "both" / "none" を返さないこと
  - RuntimePolicyResolver 以外のファイルで capability が再計算されないこと
```

#### CA-2: API key 無効 / subscription 有効

```
入力:
  IAuthKeyService.getKey() → null
  IAuthModeService.getMode() → "subscription"
  IAuthModeService.getStatus() → { isValid: true, hasCredentials: true, mode: "subscription" }

期待出力:
  capability = "terminalSurface"

検証ポイント:
  - capability が "terminalSurface" であること
  - silent fallback として "integratedRuntime" を返さないこと
```

#### CA-3: API key 有効 / subscription 有効

```
入力:
  IAuthKeyService.getKey() → "sk-ant-api03-valid-key"
  IAuthModeService.getMode() → "api-key"
  IAuthModeService.getStatus() → { isValid: true, hasCredentials: true, mode: "api-key", subscriptionValid: true }

期待出力:
  capability = "both"

検証ポイント:
  - capability が "both" であること
  - integratedRuntime が primary lane であること（Concern C での確認）
```

#### CA-4: API key 無効 / subscription 無効

```
入力:
  IAuthKeyService.getKey() → null
  IAuthModeService.getMode() → "api-key"
  IAuthModeService.getStatus() → { isValid: false, hasCredentials: false, mode: "api-key" }

期待出力:
  capability = "none"

検証ポイント:
  - capability が "none" であること
  - silent fallback として他の capability を返さないこと（FR-4 対応）
```

#### CA-5: API key 有効だが timeout / subscription 有効

```
入力:
  IAuthKeyService.getKey() → "sk-ant-api03-valid-key"
  IAuthModeService.getMode() → "api-key"
  IAuthModeService.getStatus() → { isValid: false, hasCredentials: true, mode: "api-key", errorCode: "CONNECTION_TIMEOUT" }
  subscriptionValid: true

期待出力:
  capability = "terminalSurface"

検証ポイント:
  - degraded 状態で "integratedRuntime" にならないこと（silent fallback 禁止）
  - "terminalSurface" への切り替えが明示的通知付きであること
  - blockedReason に timeout 情報が含まれること
```

---

## Concern B: state 語彙テスト（CB-1 〜 CB-5）

**対象**: Renderer selector / hook（capability → uiState 変換）
**対応 AC**: AC-2
**テスト種別**: ユニットテスト

### CB テストケース一覧

| テストID | 入力 capability     | 補助条件                                   | 期待 uiState  | 期待 blockedReason / blockedAction                               |
| -------- | ------------------- | ------------------------------------------ | ------------- | ---------------------------------------------------------------- |
| CB-1     | `integratedRuntime` | 即時実行可能（接続成功）                   | `ready`       | なし                                                             |
| CB-2     | `terminalSurface`   | handoff CTA 利用可能                       | `ready`       | なし                                                             |
| CB-3     | `both`              | 両 lane 利用可能                           | `ready`       | なし                                                             |
| CB-4     | `none`              | 解決 action あり（設定画面遷移で復旧可能） | `blocked`     | blockedReason: 設定未完了メッセージ、blockedAction: 設定画面遷移 |
| CB-5     | `none`              | 解決 action なし（インストール不可等）     | `unavailable` | blockedReason のみ（blockedAction なし）                         |

### CB テストケース詳細

#### CB-1: integratedRuntime / 即時実行可能

```
入力:
  AuthModeStatus.capability = "integratedRuntime"
  接続疎通: OK

期待出力:
  uiState = "ready"
  blockedReason = undefined
  blockedAction = undefined

検証ポイント:
  - Renderer selector が "ready" を返すこと
  - Main Process で uiState を計算していないこと（ownership 確認）
```

#### CB-2: terminalSurface / handoff 利用可能

```
入力:
  AuthModeStatus.capability = "terminalSurface"
  terminal launcher: 利用可能

期待出力:
  uiState = "ready"
  blockedReason = undefined
  blockedAction = undefined
```

#### CB-3: both / 両 lane 利用可能

```
入力:
  AuthModeStatus.capability = "both"
  integratedRuntime: 接続成功
  terminalSurface: launcher 利用可能

期待出力:
  uiState = "ready"
  blockedReason = undefined
  blockedAction = undefined

検証ポイント:
  - 両 lane が利用可能でも uiState は "ready" 1 種類であること
  - "blocked" に誤変換されないこと（state drift 防止）
```

#### CB-4: none / 解決 action あり

```
入力:
  AuthModeStatus.capability = "none"
  解決方法: API key を設定すれば integratedRuntime になる

期待出力:
  uiState = "blocked"
  blockedReason = "API キーが設定されていません"（または相当するメッセージ）
  blockedAction = { label: "設定を開く", targetRoute: "/settings/api-key" }

検証ポイント:
  - "unavailable" ではなく "blocked" であること
  - blockedAction が必ず存在すること
```

#### CB-5: none / 解決 action なし

```
入力:
  AuthModeStatus.capability = "none"
  解決方法: なし（端末環境の制約等）

期待出力:
  uiState = "unavailable"
  blockedReason = "このデバイスでは利用できません"（または相当するメッセージ）
  blockedAction = undefined

検証ポイント:
  - "blocked" ではなく "unavailable" であること
  - blockedAction が存在しないこと
  - primary CTA を DOM に含まないこと（Concern C で確認）
```

---

## Concern C: CTA 表示テスト（CC-1 〜 CC-5）

**対象**: CTA コンポーネント
**対応 AC**: AC-2
**テスト種別**: コンポーネントテスト

### CC テストケース一覧

| テストID | 入力 uiState / capability     | 期待 primary CTA   | 期待 secondary CTA   | primary CTA DOM 存在 |
| -------- | ----------------------------- | ------------------ | -------------------- | -------------------- |
| CC-1     | `ready` / `integratedRuntime` | "AI で実行"        | "設定を開く"         | あり                 |
| CC-2     | `ready` / `terminalSurface`   | "ターミナルで実行" | "コマンドをコピー"   | あり                 |
| CC-3     | `ready` / `both`              | "AI で実行"        | "ターミナルで実行"   | あり                 |
| CC-4     | `blocked` / `none`            | "設定を開く"       | "ヘルプ"             | あり                 |
| CC-5     | `unavailable` / `none`        | （非表示）         | "セットアップガイド" | なし（DOM から除外） |

### CC テストケース詳細

#### CC-1: ready / integratedRuntime

```
入力:
  capability = "integratedRuntime"
  uiState = "ready"

期待出力:
  primary CTA: ラベル "AI で実行"、action = in-app AI 実行開始
  secondary CTA: ラベル "設定を開く"、action = settings 画面遷移

検証ポイント:
  - primary CTA が DOM に存在すること
  - primary CTA が enabled であること
  - secondary CTA が "ターミナルで実行" でないこと（no-op 禁止）
  - コンポーネント内で capability の追加条件を判定していないこと
```

#### CC-2: ready / terminalSurface

```
入力:
  capability = "terminalSurface"
  uiState = "ready"

期待出力:
  primary CTA: ラベル "ターミナルで実行"、action = terminal surface を開き handoff card 表示
  secondary CTA: ラベル "コマンドをコピー"、action = suggested command をクリップボードへ

検証ポイント:
  - auto-send が発生しないこと（FR-4 対応）
  - handoff card が UI 上に表示される前提であること
```

#### CC-3: ready / both

```
入力:
  capability = "both"
  uiState = "ready"

期待出力:
  primary CTA: ラベル "AI で実行"（integratedRuntime 優先）
  secondary CTA: ラベル "ターミナルで実行"

検証ポイント:
  - primary が "AI で実行" であること（優先順は integratedRuntime）
  - secondary が "ターミナルで実行" であること
  - silent fallback（片方失敗時の自動切り替え）が発生しないこと
```

#### CC-4: blocked / none

```
入力:
  capability = "none"
  uiState = "blocked"
  blockedAction = { label: "設定を開く", targetRoute: "/settings" }

期待出力:
  primary CTA: ラベル "設定を開く"（blockedAction.label に準拠）
  secondary CTA: ラベル "ヘルプ"

検証ポイント:
  - no-op CTA が存在しないこと（action が必ず設定されていること）
  - primary CTA が DOM に存在すること
  - disabled 状態の CTA でないこと
```

#### CC-5: unavailable / none

```
入力:
  capability = "none"
  uiState = "unavailable"

期待出力:
  primary CTA: DOM に含まれない（disabled ではなく非表示）
  secondary CTA: ラベル "セットアップガイド"、action = setup / install 案内

検証ポイント:
  - primary CTA が DOM に存在しないこと（querySelector で null であること）
  - disabled 属性の primary CTA が存在しないこと（disabled ではなく非表示）
  - secondary CTA が存在すること
```

---

## 統合シナリオテスト（S-1 〜 S-4）

**対応 AC**: AC-1 〜 AC-3
**テスト種別**: 統合テスト（Phase 5-6 で実装）

| シナリオID | 概要                                                                                         | 検証する concern | 期待結果                                                                                                           |
| ---------- | -------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------ |
| S-1        | Settings 画面で API key を公開 shell に保存 → Main Chat が capability を再計算する           | A + B + C        | capability が `integratedRuntime` に更新され、CTA が "AI で実行" に変わること                                      |
| S-2        | terminal handoff を実行 → 手動実行 → 結果を Chat に表示する                                  | B + C            | handoff card が表示され、コマンドが auto-send されないこと。実行後に結果が Chat に反映されること                   |
| S-3        | capability が `both` から単一 lane（`integratedRuntime` または `terminalSurface`）に劣化する | A + B            | 劣化が明示的に通知され、silent fallback が発生しないこと。CTA が正しく更新されること                               |
| S-4        | ViewType / renderView の consumer 境界が正しく機能する                                       | A + B + C        | ViewType が変更されても capability 判定が二重実行されないこと。renderView が contract-matrix 通りの CTA を返すこと |

### S-1 詳細: Settings → Main Chat capability 再計算

```
シナリオ:
  1. Settings 画面で API key を設定する
  2. IPC: auth:status を更新する
  3. Main Chat が AuthModeStatus 変更を受信する
  4. RuntimePolicyResolver が capability を再計算する
  5. Renderer selector が uiState を導出する
  6. CTA コンポーネントが更新された CTA を表示する

検証ポイント:
  - capability 再計算が RuntimePolicyResolver のみで行われること
  - CTA が "AI で実行" に変わること
  - silent fallback が発生しないこと
  - IPC response envelope が { success: true, data: AuthModeStatus } 形式であること（P60 対応）
```

### S-2 詳細: terminal handoff → 手動実行 → 結果表示

```
シナリオ:
  1. capability = "terminalSurface", uiState = "ready"
  2. ユーザーが "ターミナルで実行" をクリックする
  3. terminal surface が開き、handoff card が表示される
  4. ユーザーが suggested command を確認してから手動実行する
  5. 実行結果が Chat に表示される

検証ポイント:
  - handoff card が UI 上に表示されること（hidden injection 禁止、FR-4 対応）
  - auto-send が発生しないこと
  - コマンドが UI 表示内容と一致すること
```

### S-3 詳細: capability 劣化（both → 単一 lane）

```
シナリオ:
  1. 初期状態: capability = "both", uiState = "ready"
  2. integratedRuntime の API key が無効になる
  3. capability が "terminalSurface" に変わる

検証ポイント:
  - 劣化の通知が表示されること（silent degradation 禁止）
  - CTA が "AI で実行" から "ターミナルで実行" に変わること
  - 自動的に integratedRuntime へ fallback しないこと
```

### S-4 詳細: ViewType / renderView consumer 境界確認

```
シナリオ:
  1. ViewType を変更する（例: Chat から Settings へ）
  2. renderView が再レンダーされる
  3. capability が再計算されないことを確認する

検証ポイント:
  - ViewType 変更で RuntimePolicyResolver が二重実行されないこと
  - renderView が contract-matrix 通りの CTA コンポーネントを返すこと
  - consumer 境界を越えた capability の持ち出しがないこと
```

---

## テスト分類サマリー

| テストカテゴリ  | テスト ID 範囲 | 対応 concern | 対応 AC | 担当 Phase | テスト種別           |
| --------------- | -------------- | ------------ | ------- | ---------- | -------------------- |
| capability 判定 | CA-1 〜 CA-5   | Concern A    | AC-1    | Phase 4-5  | ユニットテスト       |
| state 語彙変換  | CB-1 〜 CB-5   | Concern B    | AC-2    | Phase 4-5  | ユニットテスト       |
| CTA 表示条件    | CC-1 〜 CC-5   | Concern C    | AC-2    | Phase 4-5  | コンポーネントテスト |
| 統合シナリオ    | S-1 〜 S-4     | A + B + C    | AC-1-3  | Phase 5-6  | 統合テスト           |

## 参照

- `outputs/phase-2/contract-matrix.md` - capability x state x CTA 全組み合わせテーブル
- `outputs/phase-2/validation-matrix.md` - テスト - 検証項目対応表
- `outputs/phase-3/gate-decision.md` - Phase 3 ゲート PASS 記録
