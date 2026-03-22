# Phase 9 成果物: リスク登録簿

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| タスクID   | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001 |
| Phase      | 9                                                 |
| 成果物種別 | リスク登録簿                                      |
| 作成日     | 2026-03-22                                        |

---

## 1. リスク一覧

| ID    | リスク                                                            | 影響度 | 発生確率 | リスクスコア | 緩和策                                                                                                                  | オーナー         | 受容 |
| ----- | ----------------------------------------------------------------- | ------ | -------- | ------------ | ----------------------------------------------------------------------------------------------------------------------- | ---------------- | ---- |
| RSK-1 | Terminal Dock session persistence が Task06 依存で実装不可        | 高     | 高       | 高           | launcher 設計のみ先行（bottom sheet open/close の UI）、session UI は `ITerminalSessionProvider` placeholder で差し替え | Task06 側        | 受容 |
| RSK-2 | Runtime TerminalHandoffBuilder migration 時の既存テスト破壊       | 高     | 低       | 中           | `buildForSurface()` を追加メソッドとして実装、旧メソッドは `@deprecated` シム維持                                       | Phase 5 実装者   | 受容 |
| RSK-3 | GuidanceBlock props 変更による snapshot regression                | 中     | 低       | 低           | variant ごとの snapshot test を Phase 4 で先行作成、Props 変更後の re-snapshot を Phase 5 で実施                        | Phase 4/5 実装者 | 受容 |
| RSK-4 | Skill Docs adapter の toHandoffGuidance() 配置先ミス（MN-1 再発） | 中     | 低       | 低           | `packages/shared/src/types/handoff.ts` への配置を Phase 5 仕様に明記                                                    | Phase 5 実装者   | 受容 |
| RSK-5 | IPC チャンネル名の namespace 衝突（P65 パターン）                 | 高     | 低       | 中           | terminal 系を `terminal:*` namespace に統一、IPC_CHANNELS 定数のみ経由                                                  | Phase 5 実装者   | 受容 |
| RSK-6 | contextSummary のローカライズ変換漏れ（FR-3d 未充足）             | 中     | 中       | 中           | `localizeContextSummary` 関数を Phase 5 で必須実装、Phase 9 の grep チェック（A7相当）に含める                          | Phase 5 実装者   | 受容 |
| RSK-7 | P31 Zustand 無限ループ（Launcher state が useEffect 依存に混入）  | 高     | 中       | 中           | Launcher state を個別セレクタで取得、合成 Hook の戻り値を useEffect 依存配列に含めない                                  | Phase 5 実装者   | 受容 |
| RSK-8 | P47 CSS 変数ベーススタイルテストの可読性低下                      | 低     | 中       | 低           | variantStyles を Record 定数としてエクスポートし、テスト側で import して期待値生成                                      | Phase 4 実装者   | 受容 |

---

## 2. 詳細リスク説明

### RSK-1: Terminal Dock session persistence が Task06 依存

**背景**:
Phase 2 設計で「Terminal Dock: 閉じても transcript 保持、再度開けば続きが見える」（FR-1e）と定義したが、
transcript の永続化と session 管理は Task06 の Transcript Provenance に依存している。

**影響範囲**:

| 影響を受ける要件 | 内容                                                |
| ---------------- | --------------------------------------------------- |
| FR-1d            | dock/bottom sheet/side panel で再入可能             |
| FR-1e            | 閉じても transcript 保持                            |
| TC-MAN-6         | terminal dock close → reopen で transcript 保持確認 |

**現在の状態**:
AC-1 は「launcher UI 責務の定義」で充足可能。FR-1e（transcript 永続化）は Task06 完了まで充足不可。

**緩和策の詳細**:

1. Phase 5 では launcher の bottom sheet open/close UI のみ実装する
2. session 管理部分は `ITerminalSessionProvider` インターフェースで抽象化し、placeholder 実装（空セッション）を注入する
3. Task06 完了後に実装を差し替える設計とする
4. TC-MAN-6 は Phase 11 では「placeholder 状態（transcript なし）」でテストし、Task06 完了後に再テストする

**スコープ外明記**: Task06 Transcript Provenance が担当する。本タスクでは `ITerminalSessionProvider` インターフェース定義のみ行う。

---

### RSK-2: Runtime TerminalHandoffBuilder migration 時の既存テスト破壊

**背景**:
既存の `buildForAgentExecution()` と `buildForSkillExecution()` を呼ぶテストが存在する場合、
`buildForSurface()` への統一時に破壊的変更になりえる。

**影響範囲**:

- `apps/desktop/src/main/services/runtime/**/*.test.ts` の TerminalHandoffBuilder 関連テスト

**緩和策の詳細**:

1. `buildForSurface()` を **追加** メソッドとして実装する（旧メソッドを即座に削除しない）
2. 旧メソッドは `buildForSurface()` の wrapper として `@deprecated` で実装する

   ```typescript
   /** @deprecated buildForSurface("agent") を使用してください */
   buildForAgentExecution(request: AgentRequest, reason: string): HandoffGuidance {
     return this.buildForSurface(request, "agent", reason);
   }
   ```

3. 移行完了後（Phase 5 完了確認後）に旧メソッドを削除する
4. Phase 6 のテスト拡充で `buildForSurface()` の新テストを追加し、旧メソッドのテストを deprecated コメント付きで残す

---

### RSK-3: GuidanceBlock props 変更による snapshot regression

**背景**:
GuidanceBlock の `handoff` variant の props を独自形式から `HandoffGuidance` 直接受け渡しに変更すると、
既存の snapshot が全て無効になる（P47 パターン）。

**影響範囲**:

- GuidanceBlock の全 snapshot テスト（`handoff` variant のみ変更、他 variant は影響なし）

**緩和策の詳細**:

1. Phase 4 でテスト作成時に、変更後の props 形式（`guidance: HandoffGuidance`）でテストを書く
2. Phase 5 で props 変更時に snapshot を意図的に re-snapshot する（`--update-snapshots`）
3. re-snapshot 後は目視で全 variant の表示を確認する
4. P47 対策として `variantStyles` を Record 定数としてエクスポートし、テスト側で import する

---

### RSK-4: Skill Docs adapter の toHandoffGuidance() 配置先ミス（MN-1 再発）

**背景**:
MN-1 の指摘として「`toHandoffGuidance()` adapter の配置先が未定義」があった。
配置先を誤ると import パスが混乱し、P8（幽霊依存）が発生する可能性がある。

**影響範囲**:

| 配置先                                       | 正誤 | 理由                                                 |
| -------------------------------------------- | ---- | ---------------------------------------------------- |
| `packages/shared/src/types/handoff.ts`       | 正   | HandoffGuidance 型と同ファイル。両プロセスから参照可 |
| `apps/desktop/src/main/services/skill-docs/` | 誤   | Main 限定になり Renderer から参照不可                |

**緩和策の詳細**:

1. Phase 5 仕様書に「`toHandoffGuidance()` は `packages/shared/src/types/handoff.ts` に配置する」と明記する
2. Phase 9 の quality-checklist A10 で配置先の確認コマンドを実行する
3. packages/shared への配置により、Renderer 側からも Main 側からも同一 import パスで参照できる

---

### RSK-5: IPC チャンネル名の namespace 衝突（P65 パターン）

**背景**:
P65 の教訓として「internal helper が別 namespace で handler を登録すると dead-end になる」がある。
terminal 系の IPC チャンネルが `terminal:open`、`launcher:open`、`handoff:build` 等で混在すると
同様の問題が発生しうる。

**影響範囲**:

- IPC ハンドラの全 terminal/launcher/handoff 関連チャンネル

**緩和策の詳細**:

1. terminal 系は `terminal:*`、handoff 系は `handoff:*` で namespace を統一する
2. IPC_CHANNELS 定数で namespace を prefix として管理する（P27 準拠）
3. Phase 2 設計書の IPC handler namespace 一覧（design-summary.md の Ownership Table）を Phase 5 実装前に再確認する
4. 新 namespace の追加は設計変更として扱い、gate-decision.md に追記する

**検出コマンド**:

```bash
grep -rn "ipcMain.handle" apps/desktop/src/main/handlers/ | grep -v "IPC_CHANNELS\."
```

---

### RSK-6: contextSummary のローカライズ変換漏れ

**背景**:
FR-3d で「contextSummary はローカライズ表示する（`localizeContextSummary` 関数）」が要求されているが、
Phase 5 実装時に localizeContextSummary の呼び出しを忘れる可能性がある。

**影響範囲**:

| surface       | contextSummary 形式                             | ローカライズ対象 |
| ------------- | ----------------------------------------------- | ---------------- |
| Chat Edit     | `command=<type> files=<names> workspace=<name>` | あり             |
| Runtime Agent | `surface=agent skill=<name>`                    | あり             |
| Runtime Skill | `surface=skill skill=<name>`                    | あり             |

**緩和策の詳細**:

1. `TerminalHandoffBuilder.buildForSurface()` の内部で `localizeContextSummary` を必ず呼ぶ設計にする
2. Phase 9 の quality-checklist に `localizeContextSummary` の使用確認を含める
3. FR-3d 対応のテストを Phase 4 で作成する（contextSummary が raw 文字列ではなくローカライズ済みであることを確認）

---

### RSK-7: P31 Zustand 無限ループ（Launcher state の useEffect 依存混入）

**背景**:
P31 の教訓として「合成 Store Hook の戻り値関数を useEffect の依存配列に含めると無限ループになる」がある。
Launcher の `useEffect` で terminal dock の状態（`isOpen` 等）を購読する場合、
合成 Hook を使うと P31 パターンが再現する。

**影響範囲**:

- AppShellHeader の Launcher component
- Terminal Dock の open/close state 管理

**緩和策の詳細**:

1. Launcher の state は個別セレクタ（`useIsTerminalOpen()`、`useOpenTerminal()` 等）で取得する
2. `useEffect` の依存配列には Zustand のアクション関数（安定した参照）のみを含める
3. 派生セレクタ（`.filter()` 等で新しい配列を返す）には `useShallow` を適用する（P48 対策）

---

### RSK-8: P47 CSS 変数スタイルテストの可読性低下

**背景**:
P47 の教訓として「デザイントークン（CSS 変数）を使った場合、テストの文字列比較が長くなり可読性が低下する」がある。
TerminalHandoffCard / GuidanceBlock の variant スタイルに CSS 変数を使用する場合に発生する。

**影響範囲**:

- TerminalHandoffCard のスタイルテスト
- GuidanceBlock の variant スタイルテスト

**緩和策の詳細**:

1. `variantStyles: Record<Variant, string>` をコンポーネント外部（モジュールスコープ）に export する
2. テスト側でこの定数を import して期待値を生成する
3. デザイントークン名変更が Record 定義 1 箇所で完結するようにする

---

## 3. 受容・非受容の分類

### 受容可能なリスク

| ID    | 受容理由                                                                                 |
| ----- | ---------------------------------------------------------------------------------------- |
| RSK-1 | Task06 の依存は設計上の必然。ITerminalSessionProvider インターフェースで差し替え設計済み |
| RSK-2 | deprecated シムで後方互換を維持するため、実装者のコントロール範囲内                      |
| RSK-3 | snapshot re-snapshot は Phase 5 の通常作業内。other variant への影響なし                 |
| RSK-4 | 配置先を Phase 5 仕様書に明記することで防止可能                                          |
| RSK-5 | IPC_CHANNELS 定数管理で namespace 統一。Phase 9 の quality-checklist で検出可能          |
| RSK-6 | buildForSurface() 内での localizeContextSummary 呼び出しで必ず対応可能                   |
| RSK-7 | 個別セレクタパターン（P31 解決策）を適用すれば回避可能。既存パターン踏襲                 |
| RSK-8 | variantStyles Record export で解決可能。テスト品質向上の副作用もある                     |

### 非受容リスク（未対応のリスク）

現時点で非受容リスクは存在しない。
全リスクに対して緩和策が策定済みであり、`implementation_ready` 判定に支障はない。

---

## 4. implementation_ready 判定条件

Phase 10 の最終レビューで `implementation_ready` と判定するための条件:

| 条件                                                          | 確認方法                                            |
| ------------------------------------------------------------- | --------------------------------------------------- |
| 全 AC（AC-1〜AC-4）が PASS であること                         | final-review-report.md の AC 充足確認テーブル       |
| MAJOR/CRITICAL 指摘がないこと                                 | final-review-report.md の指摘セクション             |
| MINOR 指摘（MN-1〜MN-3）が全て追跡 Phase に登録されていること | final-gate-decision.md の § 2（追跡先確定テーブル） |
| RSK-1（Task06 依存）のスコープ外が明記されていること          | final-gate-decision.md の § 5（残余リスク）         |
| Phase 8 / Phase 9 の成果物が全て outputs/ に存在すること      | `ls outputs/phase-8/ outputs/phase-9/`              |
| artifacts.json が Phase 9 完了状態を反映していること          | `artifacts.json` の phase-9.status = "completed"    |
