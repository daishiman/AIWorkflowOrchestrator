# Lessons Learned（教訓集） / UI lessons

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: UI lessons

## TASK-UI-03-AGENT-VIEW-ENHANCEMENT: AgentView Enhancement（2026-03-07）

### 苦戦箇所: z-index 事前設計の必要性

| 項目       | 内容                                                                                                                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | UIコンポーネント追加時に GlobalNavStrip（z-20）、AdvancedSettingsPanel（z-40）、FloatingExecutionBar（z-50）の z-index が衝突するリスクがあった                                           |
| 再発条件   | 複数のオーバーレイ・フローティング要素を持つ画面に新規コンポーネントを追加する場合                                                                                                        |
| 対処       | Phase 2 のアーキテクチャ設計で「z-index 管理テーブル」を事前定義し、全コンポーネントの積層順序を確定させた。結果として Phase 5 実装時に z-index 衝突 0 件を達成                           |
| 標準ルール | UI追加タスクの Phase 2 テンプレートに z-index 管理テーブルを必須欄として含める。新規コンポーネント追加時は既存の z-index 割り当てを `grep -rn 'z-[0-9]' apps/desktop/src/` で事前調査する |

### 苦戦箇所: CSS変数ベースの定数抽出タイミング（P47派生）

| 項目       | 内容                                                                                                                                                                                                           |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | Tailwind arbitrary values（`bg-[var(--status-primary)]`）を使用した場合、テストで長い className 文字列をハードコードしていた。P47 と同様のパターンだが、定数抽出のタイミングが遅れたことで修正コストが増加した |
| 再発条件   | CSS変数ベースのスタイリングを採用し、Phase 5 実装時に定数抽出を行わず、Phase 8 リファクタリングまで先送りする場合                                                                                              |
| 対処       | Phase 8 で `styles.ts` と `animations.ts` を抽出し定数管理に統一。テスト側も定数を import して期待値を生成するパターンに移行した                                                                               |
| 標準ルール | UIコンポーネント追加時は Phase 5 実装直後に CSS変数ベースのスタイル定数抽出を検討する。Phase 8 時点ではテストが多く修正コストが増加するため、早期抽出を推奨する                                                |

**関連パターン**: [06-known-pitfalls.md#P47](../../rules/06-known-pitfalls.md) — CSS変数ベースのスタイルテストアサーション戦略

```typescript
// ❌ Phase 5 でハードコード（修正コスト増）
expect(element).toHaveClass("bg-[var(--status-primary)]");

// ✅ Phase 5 で早期に定数抽出
// styles.ts
export const statusStyles = {
  primary: "bg-[var(--status-primary)] text-[var(--text-inverse)]",
};

// テスト側
import { statusStyles } from "./styles";
expect(element.className).toContain(statusStyles.primary);
```

### 苦戦箇所: アクセシビリティ属性の段階的検出パターン

| 項目       | 内容                                                                                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | Phase 5 実装時点で `role="radiogroup"`、`role="dialog"`、`aria-label` 不整合などのアクセシビリティ属性が不足していた                                                                 |
| 再発条件   | UIコンポーネント実装時にアクセシビリティを「後から追加する」前提で進め、Phase 4 テスト設計に WCAG 準拠テストケースを含めない場合                                                     |
| 対処       | Phase 10 最終レビューで MINOR 指摘 3 件として検出し、未タスク化（UT-UI-03-A11Y-DIALOG-001、UT-UI-03-A11Y-LABEL-001、UT-UI-03-A11Y-RADIOGROUP-001）                                   |
| 標準ルール | Phase 4 テスト設計時に WCAG 2.1 AA 準拠のテストケースを含める。具体的には `role` 属性、`aria-label`/`aria-labelledby`、キーボード操作、コントラスト比の4項目を必須チェック対象とする |

**参照**: [01-architecture.md#アクセシビリティ](../../rules/01-architecture.md) — WCAG 2.1 AA 準拠要件

### 同種課題の簡潔解決手順（5ステップ）

1. Phase 2 設計時に z-index 管理テーブルを作成し、既存コンポーネントの z-index を `grep -rn 'z-[0-9]' apps/desktop/src/` で調査する。
2. Phase 4 テスト設計時に WCAG 2.1 AA 準拠テストケース（role、aria-label、キーボード操作、コントラスト比）を含める。
3. Phase 5 実装直後に CSS変数ベースのスタイル定数を `styles.ts` / `animations.ts` に抽出し、テストは定数を import して期待値を生成する。
4. Phase 9 品質検証で `aria-label` / `role` 属性の網羅性を確認し、不足があれば Phase 10 前に修正する。
5. Phase 10 MINOR 指摘はアクセシビリティ関連を含め全て未タスク仕様書に変換し、3ステップ（指示書作成 → 残課題テーブル → 関連仕様書リンク）を完了する。

### 追補（2026-03-10）: dedicated harness と review scope の切り分け

| 項目 | 内容 |
| --- | --- |
| 課題 | App shell 経由だと Phase 11 の状態再現が不安定で、main view / recent list / floating states の証跡が取りづらかった |
| 対処 | `phase11-agent-view.html` + `phase11-agent-view.tsx` の dedicated harness を追加し、`scenario` / `theme` クエリで状態固定した |
| 教訓 | UI再監査では「コンポーネント固有の不具合」と「global token の視認性差分」を分けて扱う。今回の light theme 副次テキスト所見は token 側の改善余地として `UT-UI-03-LIGHT-SECONDARY-TEXT-CONTRAST-001` に切り出し、AgentView 自体の blocker とは分離した |

### 追補（2026-03-10）: 型アサーション残課題の実コード追随

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 10 MINOR として起票した `UT-UI-03-TYPE-ASSERTION-001` が、current branch の再監査時点では既にコード側で解消されていた |
| 対処 | `AgentView/index.tsx` の `toViewSkill()` と `phase11-agent-view.tsx` の `toImportedSkill()` で adapter 変換に置き換え、未タスクは completed unassigned へ正規化した |
| 教訓 | Phase 12 再監査では backlog の継続判定を文章だけで決めず、`rg -n "as unknown as Skill\\[\\]"` のような現物確認を先に行う |

---

## TASK-UI-02-GLOBAL-NAV-CORE: Global Navigation 基盤移行（2026-03-06）

### 苦戦箇所: rollback path を残したまま新ナビへ責務を寄せると境界が崩れやすい

| 項目       | 内容                                                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `AppDock` を即削除せず feature flag で共存させるため、`App.tsx` と UIコンポーネントの責務が再び肥大化しやすい                                     |
| 再発条件   | 「新UI導入」と「旧UI退避」を同一コンポーネント内で抱え込む場合                                                                                    |
| 対処       | `AppLayout`、`GlobalNavStrip`、`MobileNavBar`、`useNavShortcuts`、`uiSlice` に責務を分離し、`App.tsx` は feature flag と view wiring のみに絞った |
| 標準ルール | 段階移行では「rollback 分岐」と「新機能本体」を別コンポーネントへ分離してから統合する                                                             |

### 苦戦箇所: repo-wide coverage threshold fail が task scope 品質の失敗に見えやすい

| 項目       | 内容                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------- |
| 課題       | `vitest --coverage` の終了コードが 1 だと、対象差分が悪いのか全体閾値が高いだけなのか区別しづらい |
| 再発条件   | 大規模アプリで対象ファイルだけを実行しても全体thresholdが掛かる場合                               |
| 対処       | `coverage-final.json` から task scope の実測値を抽出し、repo-wide 値は環境情報として別記した      |
| 標準ルール | coverage は「task scope 実測」と「repo-wide 閾値」を必ず分離して記録する                          |

### 苦戦箇所: mobile overlay の品質は自動テストだけでは確定できない

| 項目       | 内容                                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------------------------- |
| 課題       | `MoreMenu` は role/close/focus を自動テストで確認できても、積層感や混雑回避の品質までは見えない            |
| 再発条件   | portal 系 UI を screenshot なしで完了扱いにする場合                                                        |
| 対処       | preview build + Playwright capture で `TC-11-03-mobile-more-menu.png` を取得し、Apple HIG 観点で再確認した |
| 標準ルール | overlay / sheet / menu を含む UIタスクは Phase 11 で必ず実画面証跡を残す                                   |

### 苦戦箇所: mobile tab bar の全文ラベルは小画面で切れやすい

| 項目       | 内容                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------- |
| 課題       | 正式名称をそのまま表示すると、mobile 下部バーで文字が詰まり視認性が落ちる                         |
| 再発条件   | desktop / accessibility 用の正式ラベルを mobile 表示にもそのまま流用する場合                      |
| 対処       | `navContract.ts` に `mobileLabel` を追加し、可視ラベルだけ短縮、`aria-label` は正式名称を維持した |
| 標準ルール | mobile 下部ナビは「表示名」と「支援技術向け名称」を分離して設計する                               |

### 苦戦箇所: Phase 12 完了後も workflow 台帳が stale になりやすい

| 項目       | 内容                                                                                                                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | `outputs/phase-12` が揃っていても、`phase-12-documentation.md` や `index.md` だけでなく workflow 本文 `phase-1..11` に `pending` が残ると監査上は未完了に見える                                              |
| 再発条件   | `complete-phase.js` 実行後に `outputs/artifacts.json` / workflow `index.md` / completed 扱いの Phase 本文を再同期しない場合                                                                                  |
| 対処       | `phase-1..11` / `phase-12-documentation.md` / `artifacts.json` / `outputs/artifacts.json` / `index.md` を同一ターンで更新し、`generate-index.js --workflow ... --regenerate` と pending 検出 `rg` を実行した |
| 標準ルール | Phase 12 完了判定は「成果物実体 + 台帳同期 + 本文仕様書同期」で閉じる                                                                                                                                        |

### 同種課題の簡潔解決手順（7ステップ）

1. nav 契約を `navContract.ts` へ集約し、UI側は参照だけにする。
2. layout、desktop/tablet nav、mobile nav、shortcut、state を別コンポーネント/Hook/Slice に切り分ける。
3. rollback path は feature flag へ隔離し、削除完了とは別ゲートで扱う。
4. mobile 下部ナビは `mobileLabel` と `aria-label` を分離し、可読性はスクリーンショットで最終確認する。
5. coverage は task scope 抽出値と repo-wide threshold を分離記録する。
6. Phase 12 は `phase-1..11` / `phase-12-documentation.md` / `artifacts.json` / `outputs/artifacts.json` / `index.md` を同一ターンで同期する。
7. 最後に `rg -n 'ステータス\\s*\\|\\s*pending' <workflow>/phase-{1..12}-*.md` を実行し、本文 stale が 0 件であることを固定する。

### 関連未タスク（2026-03-06 追補）

| 未タスクID                                   | 要旨                                                                | 参照先                                                                                                                               |
| -------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| UT-IMP-PHASE12-UI-DOMAIN-SPEC-SYNC-GUARD-001 | UIタスクの Phase 12 で domain 正本まで同期するガード                | `docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/unassigned-task/task-imp-phase12-ui-domain-spec-sync-guard-001.md` |
| UT-IMP-PHASE12-WORKFLOW-BODY-STALE-GUARD-001 | `artifacts/index` 完了後も残る workflow 本文 stale を検出するガード | `docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/unassigned-task/task-imp-phase12-workflow-body-stale-guard-001.md` |

---

## TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN: Notification/HistorySearch 実装（2026-03-05）

### 苦戦箇所: IPC追加時に Main / Preload / 型定義の3層同期が崩れやすい

| 項目       | 内容                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| 課題       | チャネル定数だけ更新しても、Preload API定義・型契約が追従せず実行時/型検査でドリフトが発生しやすい      |
| 再発条件   | `ipcMain.handle` 追加後に `channels.ts` / `types.ts` / `preload/index.ts` を同一ターンで更新しない場合  |
| 対処       | Notification 5チャネル + HistorySearch 2チャネルを 3層同時に追加し、`channels.test.ts` で公開境界を固定 |
| 標準ルール | 新規IPCは「Main定義→Preload定数→Preload型→公開API→テスト」の順で1セット更新する                         |

### 苦戦箇所: 更新系IPCの認証ゲートが読み取り系と混在しやすい

| 項目       | 内容                                                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| 課題       | Notification更新系（mark/delete）と取得系（history/getUnreadCount）で認証要件が異なり、ガード漏れが起きやすい          |
| 再発条件   | `safeHandle` 登録時に「読み取り/更新」の区分を明示せず、共通実装で処理する場合                                         |
| 対処       | 更新系のみ `validateIpcSenderAndContext(..., { requireAuth: true })` を必須化し、異常系テストで `AUTH_REQUIRED` を固定 |
| 標準ルール | IPC設計時に「認証要否」をチャネル単位で先にテーブル化してから実装する                                                  |

### 苦戦箇所: Phase 11 スクリーンショット採取で初期化リロードが干渉し灰色画像になりやすい

| 項目       | 内容                                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | 認証初期化と `window.location.reload()` が競合すると、実画面ではなく灰色単色の証跡が生成される                                  |
| 再発条件   | キャプチャ前に `localStorage.dev-skip-auth` を固定しない場合（`debug-clear-storage` は TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 で廃止済み） |
| 対処       | `capture-task-056c-notification-history-screenshots.mjs` で init script を注入し、`SCREENSHOT` 3件 + `NON_VISUAL` 3件を分離記録 |
| 標準ルール | Phase 11 は「UI導線=SCREENSHOT」「契約検証=NON_VISUAL」を分離し、同じTC表で管理する                                             |

### 苦戦箇所: `pnpm run test:run --` で全体テストが起動し、対象再確認が遅延しやすい

| 項目       | 内容                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------- |
| 課題       | 対象5ファイルだけ再検証する意図でも、`run test:run --` 経由だと設定によって全体テストへ展開される |
| 再発条件   | npm script経由で引数の透過先を確認せず、`--` を使ってテストを絞り込む場合                         |
| 対処       | `pnpm exec vitest run <対象ファイル>` を直接実行し、`5 files / 37 tests` を固定値で再確認した     |
| 標準ルール | 再監査時の対象テスト実行は script ラッパーを使わず、`pnpm exec vitest run` で明示ファイル指定する |

### 同種課題の簡潔解決手順（4ステップ）

1. 追加するIPCを「読み取り/更新」に先に分類し、認証要件テーブルを作る。
2. 実装は Main→Preload定数→Preload型→公開API の順で連続実施し、途中で止めない。
3. 異常系テストで `VALIDATION_ERROR` / `INVALID_SENDER` / `AUTH_REQUIRED` を最低1件ずつ固定する。
4. Phase 11 は `SCREENSHOT` と `NON_VISUAL` を混在運用し、証跡の種類と根拠を同一テーブルで固定する。

### 関連タスク（2026-03-05 追補・完了移管）

| タスクID                                         | 概要                                                                                                                                                         | 参照                                                                                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| ~~UT-IMP-PHASE12-TARGETED-VITEST-RUN-GUARD-001~~ | ~~Phase 12 再監査で対象テストのみを確実実行するガード（`pnpm exec vitest run` 直指定 + スクリプト実在 preflight）~~ **完了: 2026-03-05（Phase 12完了移管）** | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-targeted-vitest-run-guard-001.md` |

---

## TASK-UI-08-NOTIFICATION-CENTER: NotificationCenter 058e 再監査（2026-03-11）

### 苦戦箇所: utility action は feature doc だけ更新しても探索導線が閉じない

| 項目 | 内容 |
| --- | --- |
| 課題 | NotificationCenter は `ui-ux-feature-components.md` には反映されていても、`ui-ux-components.md` / `ui-ux-navigation.md` / `ui-ux-portal-patterns.md` に記述がなければ次回の探索起点が分散する |
| 再発条件 | Bell のような app header utility action を「ドメインUI」とだけ見なして、component index / navigation / portal guide を後回しにする場合 |
| 対処 | `ui-ux-components` / `ui-ux-navigation` / `ui-ux-portal-patterns` / `task-workflow` / `lessons-learned` を同一ターンで同期した |
| 標準ルール | utility action を含む UI 改修は「component index + feature doc + navigation/portal + workflow/lessons」の複数入口を同一ターンで埋める |

### 苦戦箇所: Phase 11 validator は見出しと列名の drift に弱い

| 項目 | 内容 |
| --- | --- |
| 課題 | 実際にスクリーンショットが存在していても、`manual-test-result.md` に `証跡` 列が無い、`phase-11-manual-test.md` に `テストケース` / `画面カバレッジマトリクス` 見出しが無いと `validate-phase11-screenshot-coverage` が失敗する |
| 再発条件 | Phase 11 文書を人間向けにだけ最適化し、validator が期待する literal header / column name を崩す場合 |
| 対処 | Phase 11 文書を validator 互換の見出し・列名へ是正し、`screenshot-plan.json` / `screenshot-coverage.md` / `discovered-issues.md` を追加した |
| 標準ルール | UIタスクの Phase 11 は screenshot 実体だけで閉じず、coverage validator を通る文書構造まで含めて完了とする |

### 苦戦箇所: destructive affordance は自動テストだけでは視覚品質が確定しない

| 項目 | 内容 |
| --- | --- |
| 課題 | delete ボタンの表示有無はテストで確認できても、赤の強さ、幅、文脈、押しやすさは実画面を見ないと判断できない |
| 再発条件 | swipe / reveal / destructive action を DOM assertion のみで完了扱いにする場合 |
| 対処 | `TC-11-07-desktop-delete-reveal.png` を追加取得し、Apple UI/UX 観点で affordance を再確認した |
| 標準ルール | destructive action を含む UI は「通常状態 + 展開状態 + destructive reveal」の3状態を screenshot で確認する |

### 同種課題の簡潔解決手順（5ステップ）

1. Utility action を追加したら `ui-ux-components` / `ui-ux-feature-components` / `ui-ux-navigation` / `ui-ux-portal-patterns` の4入口を先に洗い出す。  
2. Phase 11 文書は `テストケース` / `画面カバレッジマトリクス` / `証跡` 列を literal で揃える。  
3. destructive affordance は screenshot を 1枚追加して、通常状態との差を目視で確認する。  
4. `validate-phase11-screenshot-coverage` / `verify-unassigned-links` / `validate-phase-output` を同一ターンで回す。  
5. 最後に `task-workflow.md` と `lessons-learned.md` に再発条件付きで転記し、再監査の入口を閉じる。  

---

## TASK-UI-01-A-STORE-SLICE-BASELINE: Store境界基準化の再監査（2026-03-05）

### 苦戦箇所: Phase 11 で TC-ID がなく証跡バリデータが失敗

| 項目       | 内容                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| 課題       | `manual-test-result.md` が `MT-xx` 形式で、`validate-phase11-screenshot-coverage` が TC抽出できず失敗した |
| 再発条件   | 手動テスト結果をシナリオIDのみで管理し、`TC-xx` と証跡列を紐付けない場合                                  |
| 対処       | `phase-11-manual-test.md` に `テストケース` と `画面カバレッジマトリクス` を追加し、`TC-11-01〜03` へ統一 |
| 標準ルール | UI検証は `TC-xx` 必須。`manual-test-result.md` には `テストケース` と `証跡(.png)` 列を必ず置く           |

### 苦戦箇所: Slice件数の基準ドリフト（17 vs 16）

| 項目       | 内容                                                                             |
| ---------- | -------------------------------------------------------------------------------- |
| 課題       | 文書とテストで baseline件数の前提が不一致だった                                  |
| 再発条件   | `store/index.ts` の実体と台帳件数を同一ターンで突合しない場合                    |
| 対処       | 「15 Slice + `ChatEditSlice` = 16行」に統一し、Phase 1/2/4文書とテストを同時修正 |
| 標準ルール | 件数を扱う仕様は「実装grep値 + テスト期待値 + Phase文書」の3点同時更新を必須化   |

### 苦戦箇所: Step 2 を「更新不要」と誤判定しやすい

| 項目       | 内容                                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| 課題       | 新規の公開型・基準定数を追加したにもかかわらず、システム仕様更新が未実施になりやすい                                    |
| 再発条件   | 「IPC変更がない」ことだけで Step 2 不要と判断する場合                                                                   |
| 対処       | `arch-state-management.md` / `task-workflow.md` / `lessons-learned.md` へ baseline契約を同期し、Step 2 を実施済みに修正 |
| 標準ルール | 新規 public 型/定数を追加した時点で Step 2 対象。IPC有無だけで判定しない                                                |

### 苦戦箇所: `audit --target-file` の適用境界を誤認しやすい

| 項目       | 内容                                                                                                                               |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `outputs/phase-12/*.md` を `--target-file` に渡して監査し、コマンドエラーになった                                                  |
| 再発条件   | `--target-file` が「任意ファイル監査」と誤解される場合                                                                             |
| 対処       | `--target-file` は `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` 配下のみ適用可能と定義し、再監査コマンドを `--diff-from HEAD` へ切り替えた |
| 標準ルール | `--target-file` は未タスク指示書の個別監査専用。成果物監査は `--diff-from HEAD` を使う                                             |

### 苦戦箇所: `current=0` と `baseline>0` の解釈が混在しやすい

| 項目       | 内容                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| 課題       | repo全体の既存違反（baseline）を今回差分の失敗と誤認しやすい                                          |
| 再発条件   | `audit-unassigned-tasks --json` のみで合否判定する場合                                                |
| 対処       | 合否は `--diff-from HEAD` の `currentViolations` に固定し、baselineは別タスクで段階削減する運用へ分離 |
| 標準ルール | 判定は「current=合否」「baseline=健全性メトリクス」で二軸管理する                                     |

### 苦戦箇所: workflow 実体パスの取り違えが起きやすい

| 項目       | 内容                                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | 同一タスクでも workflow 参照候補が複数見え、`No such file or directory` の手戻りが発生しやすい                                  |
| 再発条件   | 検証コマンド実行前に対象 workflow の実体確認を行わない場合                                                                      |
| 対処       | preflight として `test -d <workflow-path>` と `rg --files docs/30-workflows \| rg '<task-id>'` を実行し、採用パスを先に固定した |
| 標準ルール | Phase 12 再監査は「workflow実体確認 → verify/validate → links/audit」の順序を厳守する                                           |

### 同種課題の簡潔解決手順（4ステップ）

1. Phase 11 のTCを `TC-xx` で定義し、証跡列に `.png` を明記する。
2. baseline件数は実装実体（import/create/const）を `rg` で先に確定し、文書とテストへ同時反映する。
3. Step 2判定は「新規 public 型/定数/契約の有無」で行い、仕様正本へ必ず反映する。
4. 最後に `verify-all-specs` / `validate-phase-output` / `validate-phase11-screenshot-coverage` を連続実行し、証跡を台帳へ固定する。

### 同種課題の簡潔解決手順（未タスク監査運用 4ステップ）

1. `audit-unassigned-tasks --json --diff-from HEAD` を先に実行し、`currentViolations` を合否に使う。
2. `--target-file` は `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` 配下の実体 `.md` ファイルだけに使い、ワイルドカード表記は残さない。
3. `baselineViolations` は即時修正対象にせず、別未タスク（段階削減）へ分離する。
4. 監査結果を `task-workflow.md` / `unassigned-task-detection.md` / `lessons-learned.md` の3点へ同時反映する。

### 関連タスク（2026-03-05 追補・完了済み移管）

| タスクID                                          | 概要                                                                                                      | 参照                                                                                       |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| UT-IMP-PHASE12-UNASSIGNED-BASELINE-REDUCTION-001  | baseline 負債削減の段階実行（format/naming/misplaced のカテゴリ別是正、完了済み移管）                     | `docs/30-workflows/completed-tasks/task-imp-phase12-unassigned-baseline-reduction-001.md`  |
| UT-IMP-PHASE12-WORKFLOW-PATH-CANONICALIZATION-001 | Phase 12 workflowパス正規化ガード（workflow実体確認 + 監査境界固定 + current/baseline分離、完了済み移管） | `docs/30-workflows/completed-tasks/task-imp-phase12-workflow-path-canonicalization-001.md` |

---

## TASK-UI-05A-SKILL-EDITOR-VIEW: 再監査（2026-03-02）

### 苦戦箇所: `spec_created` 記述と実装実体の状態ドリフト

| 項目       | 内容                                                                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | 仕様台帳では「実装未着手」と記録されていたが、`views/SkillEditorView` の実装ファイルとテストは存在していた                                      |
| 再発条件   | worktree で仕様更新を後回しにし、台帳と実装の観測タイミングがズレる場合                                                                         |
| 対処       | `task-workflow.md` / `ui-ux-components.md` / `ui-ux-feature-components.md` を同一ターンで再同期し、状態を「実装ファイル実在・統合未完了」に修正 |
| 標準ルール | Phase 12再監査では「コード実体確認（`rg --files`）→ 仕様台帳更新 → 証跡更新」を必須チェーン化する                                               |

### 苦戦箇所: 未タスク指示書の正本配置漏れ

| 項目       | 内容                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------- |
| 課題       | `UT-UI-05A-GETFILETREE-001` が workflow ローカル配下のみで管理され、正規監査対象から外れていた  |
| 再発条件   | Phase 12で検出レポートのみ更新し、`docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` への正本化を省略する場合 |
| 対処       | 正規テンプレート準拠で未タスク3件を作成し、`task-workflow.md` 残課題テーブルと同期した          |
| 標準ルール | 未タスクは必ず「正本配置 → 残課題登録 → 関連仕様リンク」の3点を同一ターンで完了させる           |

### 同種課題の簡潔解決手順（4ステップ）

1. `git status --short` と `rg --files` で実装実体の有無を先に確定する。
2. 画面証跡を再取得し、証跡ファイル名を更新履歴へ反映する。
3. 未タスクを `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` に正規作成し、台帳リンクを置換する。
4. `verify-unassigned-links` と `audit-unassigned-tasks --diff-from HEAD` で current=0 を確認する。

### Phase 12準拠再確認での苦戦箇所（2026-03-02）

| 項目       | 内容                                                                                                           |
| ---------- | -------------------------------------------------------------------------------------------------------------- |
| 課題       | `spec_created` workflow（TASK-UI-05A）と完了workflow（TASK-UI-05）を同時監査した際、証跡の記録先が分散しやすい |
| 再発条件   | 複数workflowを個別に検証してから後で転記する運用                                                               |
| 対処       | 対象workflowを先に固定し、`verify-all-specs` → `validate-phase-output` を2workflow分まとめて実行・記録した     |
| 標準ルール | Phase 12再確認は「対象workflow固定→構造検証→出力検証→成果物突合」を1セットで実施する                           |

| 項目       | 内容                                                                                |
| ---------- | ----------------------------------------------------------------------------------- |
| 課題       | `audit-unassigned-tasks` の baseline違反を今回差分違反と誤認しやすい                |
| 再発条件   | repo全体に既存フォーマット違反が残った状態で `--diff-from HEAD` を実行する場合      |
| 対処       | 合否を `currentViolations` のみに固定し、baselineは監視値として分離記録した         |
| 標準ルール | 未タスク監査の合否基準は `currentViolations=0` 固定。baselineは別途改善タスクで扱う |

#### 同種課題の簡潔解決手順（4ステップ）

1. 対象workflowを先に列挙し、`verify-all-specs --workflow <dir>` を全対象へ実行する。
2. `validate-phase-output <dir>` を同じ対象へ実行し、Phase 12必須成果物（Task 1/3/4/5）の実体を突合する。
3. `verify-unassigned-links` と `audit-unassigned-tasks --json --diff-from HEAD` を連続実行し、`currentViolations=0` を判定基準にする。
4. 結果を `task-workflow.md` と `lessons-learned.md` に同一ターンで反映し、次ターンへの持ち越しを禁止する。

### 関連未タスク（2026-03-02 追補）

| タスクID                                        | 概要                                                                                            | 参照                                                                                                     |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001 | 2workflow同時監査時の証跡集約ガード（Task 1/3/4/5 実体突合 + 画面証跡 + current/baseline 分離） | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-two-workflow-evidence-bundle-001.md` |

---

