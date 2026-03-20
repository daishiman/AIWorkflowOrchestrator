# Phase 8 リファクタリング境界定義

## メタ情報

| 項目       | 値                                                        |
| ---------- | --------------------------------------------------------- |
| タスクID   | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 |
| Phase      | 8 - リファクタリング                                      |
| 作成日     | 2026-03-20                                                |
| 依存成果物 | outputs/phase-7/integration-gate.md                       |

---

## 1. リファクタリング候補一覧

| 候補             | 内容                                                                                | 破壊的変更 | 方針                                 |
| ---------------- | ----------------------------------------------------------------------------------- | ---------- | ------------------------------------ |
| 用語整理         | user-facing な `authMode` / `auth mode` 残骸を capability / access 語彙へ置き換える | なし       | 実施候補                             |
| selector 集約    | capability → state 変換の重複ロジックを 1 selector / hook に統合する                | 低         | 実施候補                             |
| CTA 集約         | `blocked` / `unavailable` CTA 分岐の重複を 1 contract consumer に集約する           | 低         | 実施候補                             |
| transport rename | `AuthModeStatus` DTO の全面 rename                                                  | 高         | デフォルト不採用（後続タスクで判断） |

---

## 2. 影響ファイルリスト取得手順

リファクタリング前に以下のコマンドで影響範囲を確認すること。

```bash
# authMode / capability / blocked / unavailable の出現箇所を一括取得
grep -rn "authMode\|AuthModeStatus\|capability\|blocked\|unavailable" apps/ packages/
```

取得結果をもとに、以下の分類で整理する。

- **A: 用語整理対象**（`authMode` の user-facing 文字列を capability 語彙に置換）
- **B: selector 集約対象**（capability → state 変換の重複箇所）
- **C: CTA 集約対象**（`blocked` / `unavailable` 分岐の重複箇所）
- **D: transport 互換維持対象**（`AuthModeStatus` を使用する IPC 境界 — 今 wave は変更しない）

---

## 3. dual naming 許容条件

transport compatibility のためのみ dual naming（旧名 / 新名の共存）を許容する。ただし以下の制約を遵守すること。

- **same-wave 内に閉じる**: 旧名の残存は同一実装 wave の範囲内のみ許可する。wave 完了時点でグリーンフィールド側には旧名を残さない。
- **grep ゼロヒット確認**: wave 完了後に `grep -rn "authMode" apps/ packages/` を実行し、IPC 境界以外でのヒットがゼロであることを確認してからコミットする。
- **IPC 境界例外**: `AuthModeStatus` DTO 名は transport compatibility のため wave 完了後も IPC 境界にのみ存続を許可する（R-1 リスクの管理対象）。

---

## 4. 責務再整列確認チェックリスト

リファクタリング完了後、以下の 3 点を確認すること。

1. **RuntimePolicyResolver の責務確認**
   - capability 判定（`hasCapability()`）以外の責務を持っていないか
   - 状態 DB への読み書き、UI 状態の生成、IPC ハンドラの登録などが混入していないか

2. **AuthModeStatus DTO の役割確認**
   - transport compatibility を保ちつつ UI state を正しく伝えているか
   - DTO 内部でビジネスロジックが実行されていないか（Pure Data Object であること）

3. **settings / renderView() consumer の確認**
   - `renderView()` の呼び出し元が capability を再判定していないか
   - capability 判定は RuntimePolicyResolver に一元化されているか

---

## 5. AC 維持条件

リファクタリング後も以下の受入条件が維持されていること。

| AC   | 内容                                                                         | 確認方法                                               |
| ---- | ---------------------------------------------------------------------------- | ------------------------------------------------------ |
| AC-1 | contract-matrix の 4 状態定義が rename 後も保持されている                    | outputs/phase-2/contract-matrix.md と照合              |
| AC-2 | state × CTA の 1:1 マッピングが破綻していない                                | outputs/phase-2/contract-matrix.md と照合              |
| AC-3 | 禁止制約（silent fallback / auto-send / hidden injection）が rename 後も有効 | outputs/phase-1/requirements-definition.md FR-3 と照合 |
| AC-4 | canonical doc set のパスが有効（リンク切れなし）                             | outputs/artifacts.json の成果物パスを全件確認          |

---

## 6. 実際の実装結果（Phase 5 完了後の状態）

### 採用された実装方式

Phase 5 の計画（`RuntimePolicyResolver.ts` への `resolveCapability` メソッド追加）に代わり、以下の方式が採用された。

| 変更内容                                                  | 実際の実装場所                                                  | 理由                                                             |
| --------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------- |
| capability 型 + pure function を新規ファイルに分離        | `packages/shared/src/types/execution-capability.ts`（新規追加） | Concern A/B/C の責務を単一ファイルで完結させ、テスト容易性を確保 |
| `AuthModeStatus` への capability フィールド optional 追加 | `packages/shared/src/types/auth-mode.ts`                        | Phase 2 設計通り。既存フィールドへの破壊的変更なし               |
| `AccessCapability` の re-export                           | `apps/desktop/src/renderer/store/slices/chatSlice.ts`           | Renderer 側が shared から型を参照する正しい依存方向を維持        |

### execution-capability.ts の実装内容

```
packages/shared/src/types/execution-capability.ts
├── AccessCapability 型（4 状態）
├── UiState 型（3 値）
├── CAPABILITY_VALUES / UI_STATE_VALUES（定数 tuple）
├── ExecutionCapabilityInput / CapabilityContext / CtaInput（入力型）
├── UiStateResult / CtaContract / ExecutionCapabilityStatus（出力型）
├── resolveCapability()   … Concern A 実装
├── resolveUiState()      … Concern B 実装（overload 2 形式）
├── resolveCtaContract()  … Concern C 実装（overload 2 形式）
├── assertNoSilentFallback()  … P62 対策ガード
└── assertNoPrimaryCta()      … unavailable CTA 禁止ガード
```

### chatSlice.ts での re-export

`apps/desktop/src/renderer/store/slices/chatSlice.ts` は `AccessCapability` を内部定義から削除し、`@repo/shared/types/execution-capability` からの re-export に変更した。これにより Renderer 層での独自定義が解消された。

---

## 7. 不採用候補の記録

### transport rename（`AuthModeStatus` の全面 rename）

- **不採用理由**: IPC 境界を越える DTO の rename は、Main / Preload / Renderer の 3 プロセスにまたがる変更となり、破壊的変更リスクが高い。本タスクは contract 定義フェーズであり、transport 層の rename は後続の実装タスク（Task02 以降）で判断する。
- **再評価条件**: Task02 の Phase 2 設計時に contract-matrix の語彙統一方針として再評価する。
