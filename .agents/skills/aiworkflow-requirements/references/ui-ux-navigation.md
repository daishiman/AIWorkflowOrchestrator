# ナビゲーションUI設計

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

デスクトップアプリにおけるナビゲーションUI設計を定義する。
Global Navigation（`GlobalNavStrip` / `MobileNavBar` / `AppLayout`）と、各View内のサブナビゲーションを提供する。

## 変更履歴

| バージョン | 日付 | 変更内容 |
| --- | --- | --- |
| v1.7.5 | 2026-03-11 | TASK-SKILL-LIFECYCLE-02 を反映: ChatView の mode switcher / recent session rail / context summary、Workspace / Skill Center からの handoff、light theme contrast 再検証を追加 |
| v1.7.4 | 2026-03-11 | TASK-UI-04C-WORKSPACE-PREVIEW を反映: `workspace` ViewType に `Cmd/Ctrl+P` の QuickFileSearch dialog、Arrow/Enter/Escape 操作、focus trap、選択時 preview panel 自動オープン、Phase 11 screenshot 11件を同期 |
| v1.7.3 | 2026-03-11 | TASK-UI-08-NOTIFICATION-CENTER 再監査反映: app header の Bell utility action と `NotificationCenter` 導線を追加し、Portal 前提の通知 popover、`aria-label="お知らせを開く"`、responsive overlay、Phase 11 screenshot 7件を同期 |
| v1.7.4 | 2026-03-11 | TASK-SKILL-LIFECYCLE-01 Phase 12 準拠再確認を追補。Skill lifecycle primary entry に surface ownership board と TC-11-05 要素証跡の扱い、苦戦箇所、5分解決カードを追加し、domain UI spec でも実装内容と再利用手順を辿れるようにした |
| v1.7.3 | 2026-03-11 | TASK-SKILL-LIFECYCLE-01 完了同期: Skill Center を create / use / improve の一次導線入口として追記し、`skill-center` legacy alias は `App.tsx` の `normalizeSkillLifecycleView()` で canonical `skillCenter` へ正規化する契約を追加 |
| v1.7.2 | 2026-03-10 | TASK-UI-04A-WORKSPACE-LAYOUT を反映: `workspace` ViewType 内で `chat-only` / `chat+files` / `chat+preview` / `3-pane` の4モードを持つこと、1024/1440 breakpoint、mobile overlay、preview dedicated harness による screenshot 検証を追記 |
| v1.7.1 | 2026-03-10 | TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 再監査追補: `settings` は AuthGuard bypass だけでなく未認証 reset 対象外であることを明文化し、Phase 11 screenshot 4件を証跡として同期 |
| v1.7.0 | 2026-03-09 | TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001完了: Settings 画面は AuthGuard 外からアクセス可能に変更。currentView === "settings" の場合、App.tsx で AuthGuard をバイパスして直接レンダリングする設計を追記 |
| v1.6.4 | 2026-03-06 | TASK-UI-02 移管反映。Global Navigation Core の workflow 導線を `completed-tasks/task-057-ui-02-global-nav-core/` へ更新し、関連未タスクの配置先も completed workflow 配下へ統一 |
| v1.6.3 | 2026-03-06 | TASK-UI-02 派生未タスクを追補。domain UI spec 同期ガードと workflow 本文 stale ガードを `関連未タスク` として登録し、Global Navigation 改修後の再監査導線を task spec へ接続 |
| v1.6.2 | 2026-03-06 | TASK-UI-02 追補: 実装時の苦戦箇所（rollback 共存、`mobileLabel`、UI仕様同期漏れ、workflow 本文 stale）と簡潔解決手順を追加し、ナビ変更時は `ui-ux-components` / `ui-ux-feature-components` / `ui-ux-navigation` / `arch-state-management` / `task-workflow` / `lessons-learned` の同時同期を明文化 |
| v1.6.1 | 2026-03-06 | TASK-UI-02 再監査追補: mobile tab bar の可読性改善として `mobileLabel` を導入。アクセシビリティ用 `aria-label` は正式名称のまま保持しつつ、表示ラベルを `ダッシュ` / `ワーク` / `実行` / `スキル` などの短縮形へ統一 |
| v1.6.0 | 2026-03-06 | TASK-UI-02-GLOBAL-NAV-CORE 反映: `GlobalNavStrip` / `MobileNavBar` / `AppLayout` を正式ナビ構成へ更新。9項目/3セクション、desktop expanded 200px、tablet collapsed 56px、mobile primary 5 + More 4、`Cmd/Ctrl+[` 戻る導線、feature flag rollback path を同期 |
| v1.5.1 | 2026-03-05 | TASK-UI-01-D の追補: 実装内容（契約正本化/ショートカット条件/証跡運用）と苦戦箇所（契約二重管理・編集要素誤発火・再撮影運用ギャップ）を同一節へ追加し、5分解決カードを同期 |
| v1.5.0 | 2026-03-05 | TASK-UI-01-D-VIEWTYPE-ROUTING-NAV 反映: `navigation/navContract.ts` を AppDock ナビ契約の正本として明記。ショートカット仕様を `Cmd/Ctrl` 両対応へ更新し、`layout-grid` アイコン・`skill-center` 互換導線・編集要素上のショートカット無効化ルールを追記 |
| v1.4.0 | 2026-03-05 | TASK-UI-01-STORE-IPC-ARCHITECTURE 反映: AppDock の 9 項目ナビ（workspace/skillCenter/historySearch 追加）と `ViewType` 拡張を同期。実装パスを `components/organisms/AppDock` へ修正 |
| v1.3.0 | 2026-02-12 | Agent ナビ導線追加（`agent` ViewType） |
| v1.0.0 | 2026-01-26 | 初版 |

---

## Global Navigation

### 概要

desktop/tablet では左サイドレール `GlobalNavStrip`、mobile では下部 `MobileNavBar` を使って ViewType 切り替えを提供する。

**実装場所**:

- `apps/desktop/src/renderer/components/organisms/GlobalNavStrip/index.tsx`
- `apps/desktop/src/renderer/components/organisms/MobileNavBar/index.tsx`
- `apps/desktop/src/renderer/components/organisms/AppLayout/index.tsx`
- `apps/desktop/src/renderer/App.tsx`

**契約正本**: `apps/desktop/src/renderer/navigation/navContract.ts`

### legacy note

- `AppDock` は rollback path と比較用に残している。
- 新規導線の正式UIは `GlobalNavStrip` / `MobileNavBar` とする。

### Skill lifecycle primary entry

- `Skill Center` は `スキルを作る` `使う` `改善する` の 3 ジョブを案内する一次導線入口として扱う。
- `Agent` は実行、`Workspace` は作業継続、`Chat` は対話補助、`Skill Creator` は作成専用の supporting / destination surface として扱う。
- legacy view 値 `skill-center` は表示責務を持たず、shell で canonical `skillCenter` に正規化したうえで描画する。

### Surface ownership board（TASK-SKILL-LIFECYCLE-01）

| surface | 主責務 | handoff |
| --- | --- | --- |
| `Skill Center` | 入口、一次導線案内、作成前の意図整理 | `Skill Creator` または `Workspace / Agent` |
| `Workspace` | 文脈、ファイル、下準備の整理 | `Agent` |
| `Agent` | 実行、結果確認、改善判断の起点 | `Skill Analysis` |
| `Chat` | 会話と履歴への補助導線 | 必要時のみ `Skill Center` / 履歴 |
| `Skill Creator` | 新規スキル作成 | `Workspace / Agent` |

`settings` は公開シェル例外として同じ board には混ぜず、別 TC（TC-11-06）で確認する。

### 共通チャット基盤 handoff（TASK-SKILL-LIFECYCLE-02）

| 入口 surface | トリガー | handoff payload | 遷移先 |
| --- | --- | --- | --- |
| `ChatView` | mode pills（`data-testid="chat-mode-*"`） | `entryPoint: "chat"`、必要に応じ既存 context を維持 | そのまま `ChatView` |
| `WorkspaceView` | `data-testid="workspace-open-chat"` | `workspacePath`、selected file paths / names、`entryPoint: "workspace"` | `setCurrentView("chat")` |
| `SkillCenterView` | `data-testid="skill-lifecycle-start-{job}"` | `lifecycleJob`、`handoffLabel`、`entryPoint: "skill-center"` | `setCurrentView("chat")` |

### recent session rail

- `ChatView` ヘッダー直下に `chat-session-rail` を置き、`chatSessionOrder` 降順で recent session を再表示する。
- mode を切り替えても既存 session がある場合は `modeSessionIds` を使って再利用し、新規会話を乱立させない。
- session pill には mode label、session title、summary を表示し、別 surface から来た handoff context も再開できる。

### メニュー項目一覧

| 項目 | ViewType | アイコン | ショートカット | 説明 |
| --- | --- | --- | --- | --- |
| ダッシュボード | `dashboard` | `layout-grid` | Cmd/Ctrl+1 | main |
| ワークスペース | `workspace` | `folder-tree` | Cmd/Ctrl+2 | main |
| チャット | `chat` | `message-circle` | Cmd/Ctrl+3 | main |
| エージェント | `agent` | `bot` | Cmd/Ctrl+4 | main |
| スキルセンター | `skillCenter` | `puzzle` | Cmd/Ctrl+5 | main |
| 履歴検索 | `historySearch` | `search` | Cmd/Ctrl+6 | secondary（mobile は More） |
| グラフ | `graph` | `network` | Cmd/Ctrl+7 | secondary（mobile は More） |
| エディタ | `editor` | `file-code` | Cmd/Ctrl+8 | secondary（mobile は More） |
| 設定 | `settings` | `settings` | Cmd/Ctrl+, | footer / More |

### レイアウトモード

| モード | 仕様 |
| --- | --- |
| Desktop | 左サイド固定、expanded/collapsed 切替可、expanded 幅 200px |
| Tablet | 左サイド固定、collapsed 56px 固定 |
| Mobile | 下部固定、primary 5項目 + More 4項目 |

### Header utility actions（TASK-UI-08）

Global navigation とは別に、app header 右端には view 横断の utility action を置く。058e では Bell icon を `NotificationCenter` の入口として追加し、通知を view 遷移なしで確認できるようにした。

| 項目 | 契約 |
| --- | --- |
| トリガー | Bell icon button (`data-testid="notification-bell-button"`) |
| aria-label | `お知らせを開く` |
| 表示位置 | desktop / tablet / mobile 共通で app header 右端 |
| 開閉方式 | click で open/close、Escape / outside click / close button でも閉じる |
| 表示形式 | desktop / tablet は anchored popover、mobile は full-width overlay |
| 視覚状態 | idle badge / open / expanded / delete reveal / empty state の 5状態を基本とする |
| 実装参照 | `apps/desktop/src/renderer/components/organisms/NotificationCenter/index.tsx` |

### Header utility 画面証跡（TASK-UI-08）

| TC | 証跡 | 内容 |
| --- | --- | --- |
| TC-11-01 | `docs/30-workflows/completed-tasks/task-058e-ui-08-notification-center/outputs/phase-11/screenshots/TC-11-01-desktop-idle-badge.png` | Bell idle badge |
| TC-11-02 | `docs/30-workflows/completed-tasks/task-058e-ui-08-notification-center/outputs/phase-11/screenshots/TC-11-02-desktop-popover-open.png` | desktop open |
| TC-11-04 | `docs/30-workflows/completed-tasks/task-058e-ui-08-notification-center/outputs/phase-11/screenshots/TC-11-04-tablet-popover-open.png` | tablet open |
| TC-11-05 | `docs/30-workflows/completed-tasks/task-058e-ui-08-notification-center/outputs/phase-11/screenshots/TC-11-05-mobile-overlay-open.png` | mobile overlay |

### ViewType型定義

| ViewType     | 説明                     |
| ------------ | ------------------------ |
| `dashboard`  | ダッシュボード画面       |
| `workspace`  | ワークスペース画面       |
| `editor`     | エディター画面           |

### `workspace` ViewType のレイアウト契約（TASK-UI-04A）

| 項目 | 契約 |
| --- | --- |
| 初期表示 | `chat-only` |
| file panel | top toggle で開閉し、1024px 未満では overlay |
| preview panel | top toggle で開閉し、1024px 未満では overlay |
| 3-pane | 両 panel open かつ 1440px 以上で有効 |
| 後続依存 | chat 本体は 04B、preview 本体は 04C が担当 |
| `chat`       | チャット画面             |
| `graph`      | グラフ画面               |
| `agent`      | エージェント画面         |
| `skillCenter`| スキルセンター画面       |
| `historySearch` | 履歴検索画面          |
| `skill-center` | 互換エイリアス（legacy導線） |
| `settings`   | 設定画面（AuthGuard 外 + 未認証 reset 対象外: 認証前でもアクセス可能） |

**canonicalization rule**:

- `skill-center` は互換入力としてのみ許可し、画面描画・分岐・テスト証跡は `skillCenter` を正本にする。
- canonical 化は `apps/desktop/src/renderer/App.tsx` から `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts` の `normalizeSkillLifecycleView()` を呼んで行う。

### representative evidence

- TC-11-05 は route 全景ではなく `data-testid="skill-lifecycle-surface-ownership"` の要素 capture を正本とする。
- representative screenshot は「画面全体が見えること」より「責務境界が読めること」を優先する。

### TASK-SKILL-LIFECYCLE-01 苦戦箇所（再利用形式）

| 苦戦箇所 | 再発条件 | 対処 | 標準ルール |
| --- | --- | --- | --- |
| 一次導線の説明を nav / feature / state へ分散すると入口判断が揺れる | domain spec 側に入口説明だけを書き、コード契約の正本を持たない | `skillLifecycleJourney.ts` を導線正本にし、navigation doc はその参照と surface 役割だけを持つようにした | 入口・責務・例外・handoff は 1 つの契約ファイルへ集約する |
| `skill-center` と `skillCenter` が混在すると導線説明が二重化する | alias 正規化を各 view やテストで個別吸収する | shell でだけ canonical 化し、domain spec も `skillCenter` を正本に統一した | alias は shell 入口で 1 回だけ処理する |
| representative screenshot が shell 全景だけだと責務比較に使いにくい | TC を route screenshot だけで閉じる | surface ownership board を追加し、TC-11-05 を要素証跡へ切り替えた | representative evidence は state / 責務を表す selector を待って要素 capture する |

#### 同種課題の5分解決カード

1. 一次導線と画面責務は `skillLifecycleJourney.ts` のような契約正本へまとめる。  
2. domain UI spec は「入口」「destination surface」「例外」を 1 画面設計として書く。  
3. legacy alias は shell で canonical 化し、仕様書・テスト・UI 表示の正本値を 1 つに固定する。  
4. representative screenshot は route 全景ではなく、責務境界が読める要素 capture を優先する。  
5. Phase 12 では `ui-ux-navigation` / `task-workflow` / `lessons-learned` を同一ターンで同期する。  

### Settings 公開シェル到達性（TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001）

| 観点 | 仕様 |
| --- | --- |
| shell bypass | `currentView === "settings"` のとき `SettingsView` を AuthGuard 外で描画する |
| reset exclusion | 未認証時 view reset は `settings` を除外し、設定作業中に dashboard へ戻さない |
| 導線 | `Cmd/Ctrl+,` と timeout fallback の `設定画面へ` の両方で到達可能 |

### 画面証跡

| TC | 証跡 | 内容 |
| --- | --- | --- |
| TC-11-01 | `outputs/phase-11/screenshots/TC-11-01-timeout-fallback-light.png` | ライトテーマ fallback |
| TC-11-02 | `outputs/phase-11/screenshots/TC-11-02-timeout-fallback-dark.png` | ダークテーマ fallback |
| TC-11-03 | `outputs/phase-11/screenshots/TC-11-03-timeout-to-settings.png` | timeout -> settings |
| TC-11-04 | `outputs/phase-11/screenshots/TC-11-04-settings-shell-unauthenticated.png` | 未認証 settings shell |

### Workspace quick search 契約（TASK-UI-04C）

| 項目 | 契約 |
| --- | --- |
| open shortcut | `Cmd/Ctrl+P` で `QuickFileSearch` dialog を開く |
| navigation | ArrowUp / ArrowDown で候補移動、Enter で選択、Escape / overlay click で閉じる |
| focus | open 時に検索入力へフォーカスし、dialog 内で Tab 循環を維持する |
| result action | file 選択時は対象 file を選択し、preview panel が閉じていれば自動で開く |
| coverage | desktop / mobile overlay / terminology を Phase 11 screenshot 11件で確認する |

### navItems配列構造

| プロパティ | 型         | 説明                   |
| ---------- | ---------- | ---------------------- |
| `id`       | `ViewType` | 一意識別子             |
| `icon`     | `IconName` | アイコン識別子         |
| `label`    | `string`   | メニューラベル         |
| `mobileLabel` | `string` | mobile 下部バー用の短縮ラベル |
| `shortcut` | `string`   | キーボードショートカット |
| `isMobilePrimary` | `boolean` | mobile 下部バーへ直接表示するか |

### キーボードショートカット適用条件

| 条件 | 仕様 |
| --- | --- |
| 修飾キー | `metaKey` または `ctrlKey` のいずれか必須 |
| 禁止修飾キー | `altKey` / `shiftKey` が有効な場合は無効 |
| 入力フォーカス | `input` / `textarea` / `select` / `contenteditable` 上では無効 |
| 設定ショートカット | `Cmd/Ctrl + ,` は `event.code === "Comma"` を優先判定 |
| 戻るショートカット | `Cmd/Ctrl + [` は `viewHistory` がある場合のみ有効 |

### TASK-UI-02 実装同期（2026-03-06）

| 観点 | 内容 | 反映先 |
| --- | --- | --- |
| desktop/tablet ナビ | `GlobalNavStrip` が 9項目/3セクション、expanded/collapsed、keyboard roving を提供 | `components/organisms/GlobalNavStrip/` |
| mobile ナビ | `MobileNavBar` が primary 5項目と `MoreMenu` 4項目を提供し、下部バー表示名は `mobileLabel` で短縮する | `components/organisms/MobileNavBar/` |
| レイアウト | `AppLayout` が left rail / header / main / bottom nav を統合 | `components/organisms/AppLayout/index.tsx` |
| state | `uiSlice` が `isNavExpanded` / `isMobileMoreOpen` を保持 | `store/slices/uiSlice.ts` |
| rollback | `VITE_USE_GLOBAL_NAV_STRIP=false` で `AppDock` 経路へ戻せる | `App.tsx` |

### TASK-UI-02 苦戦箇所（再発条件付き）

| 苦戦箇所 | 再発条件 | 対処 | 標準ルール |
| --- | --- | --- | --- |
| rollback 共存で責務が `App.tsx` に戻る | 旧 `AppDock` を残したまま新 nav の state/shortcut まで親に持たせる | `AppLayout` / nav / hook / slice に責務を分離し、`VITE_USE_GLOBAL_NAV_STRIP` は shell 切替だけに限定 | rollback は feature flag に隔離し、契約と state の正本を二重化しない |
| mobile 下部バーの正式ラベルが小画面で切れる | desktop 用ラベルを mobile 表示へそのまま流用する | `mobileLabel` を追加し、`aria-label` は正式名称のまま維持した | mobile では表示ラベルとアクセシビリティ名を分離してよい |
| More overlay の品質が自動テストだけでは確定しない | safe-area / overlay / 文字量を unit test だけで判定する | Phase 11 で 5視覚状態を再撮影し、Apple UI/UX 観点レビューを追加した | nav 変更は `SCREENSHOT` 証跡と目視レビューを完了条件に含める |
| UI仕様同期が `task-workflow` / `lessons` 側に偏る | 台帳は更新したが navigation 正本や UI index/detail を後回しにする | `ui-ux-components` / `ui-ux-feature-components` / `ui-ux-navigation` / `arch-state-management` / `task-workflow` / `lessons-learned` を同一ターンで同期した | ナビ変更は「基本6仕様書 + ドメイン正本」の同時同期を必須にする |
| `artifacts.json` / `index.md` 完了後も workflow 本文が stale 化する | `phase-1..11` / `phase-12-documentation.md` の `pending` を見落とす | workflow 本文と二重台帳を同一ターンで同期し、pending grep を追加した | Phase 12 完了判定は「成果物 / 台帳 / 本文仕様書」の三層同期で閉じる |

#### 同種課題の簡潔解決手順（5ステップ）

1. `navContract.ts` を導線正本にし、`AppLayout` / nav / shortcut / state の責務を先に分離する。  
2. `navigationSlice` は current view/history、`uiSlice` は nav UI state、`useNavShortcuts` は DOM 条件判定に限定する。  
3. rollback path は feature flag に閉じ、legacy/new の両導線で同じ契約と状態を参照させる。  
4. mobile は `mobileLabel` と `aria-label` を分離し、Phase 11 スクリーンショットで可読性を最終確認する。  
5. `ui-ux-components` / `ui-ux-feature-components` / `ui-ux-navigation` / `arch-state-management` / `task-workflow` / `lessons-learned` と workflow 本文を同一ターンで同期する。  

### 関連未タスク（2026-03-06 追補）

| 未タスクID | 概要 | 参照先 |
| --- | --- | --- |
| UT-IMP-PHASE12-UI-DOMAIN-SPEC-SYNC-GUARD-001 | navigation 正本を含む domain UI spec の同期漏れを防ぐ | `docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/unassigned-task/task-imp-phase12-ui-domain-spec-sync-guard-001.md` |
| UT-IMP-PHASE12-WORKFLOW-BODY-STALE-GUARD-001 | navigation 変更後の workflow 本文 stale を Phase 12 で検出する | `docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/unassigned-task/task-imp-phase12-workflow-body-stale-guard-001.md` |

### TASK-UI-01-D 実装内容と苦戦箇所（履歴）

#### 実装内容（要点）

| 観点 | 内容 | 反映先 |
| --- | --- | --- |
| 契約正本化 | AppDockの項目/順序/ショートカットを `navContract.ts` に一元化 | `apps/desktop/src/renderer/navigation/navContract.ts` |
| ショートカット導線 | Cmd/Ctrl 両対応 + `alt/shift` 無効 + 編集要素除外を実装 | `apps/desktop/src/renderer/App.tsx` |
| UI参照統一 | `AppDock` は `APP_DOCK_NAV_ITEMS` の参照のみとし、直書きを排除 | `apps/desktop/src/renderer/components/organisms/AppDock/index.tsx` |
| 画面証跡 | `TC-056D-11-01..05` を workflow 配下 `outputs/phase-11/screenshots` で固定 | `docs/30-workflows/task-056d-viewtype-routing-nav/outputs/phase-11/` |

#### 苦戦箇所（再発条件付き）

| 苦戦箇所 | 再発条件 | 対処 | 標準ルール |
| --- | --- | --- | --- |
| 契約二重管理で導線がドリフト | nav配列とshortcut表を別ファイルで運用 | `navContract.ts` に集約しUIから参照化 | 導線契約は1ファイル正本のみ許可 |
| 編集要素上でショートカット誤発火 | global keydown でターゲット判定を省略 | `isEditableEventTarget` で入力要素を除外 | グローバルショートカットは編集要素除外を必須 |
| 再撮影で保存先/ポート運用が揺れる | workflow固定パス未対応 + strictPort競合未記録 | `Port 5177` preflight を記録し、運用ガードを未タスク化 | 再撮影前に preflight 実施、分岐結果を証跡に残す |

#### 同種課題の5分解決カード（最短手順）

1. `navContract.ts` を導線正本にし、UI側の重複定義を削除する。  
2. `meta/ctrl` 条件 + 編集要素除外 + `alt/shift` 抑止をセットで実装する。  
3. `TC-xx` と `screenshots/*.png` を1対1で管理し、coverage validator を必ず実行する。  
4. Step 2 で `ui-ux-navigation` / `arch-state-management` / `task-workflow` / `lessons-learned` を同一ターンで同期する。  
5. `lsof -nP -iTCP:5177 -sTCP:LISTEN` の結果と分岐（停止/再利用/別ポート）を成果物へ残し、必要時は未タスク化する。  

---

## ChatViewナビゲーション

ChatViewには履歴ページへの導線として、ヘッダー右上にナビゲーションボタンを配置する。

ChatView は「共通会話 surface」として、履歴導線だけでなく mode switcher、recent session rail、context summary を持つ。`WorkspaceView` と `SkillCenterView` はここへ handoff したあと会話本体を保持しない。

**実装場所**: `apps/desktop/src/renderer/views/ChatView/index.tsx:136-143`

### ヘッダー要素

| 要素 | 仕様 |
| --- | --- |
| タイトル | `共通チャット基盤` |
| モデル表示 | active mode 説明 + `selectedModelId` |
| 履歴ボタン | 右上 `History` アイコン、`aria-label="チャット履歴"`、`/chat/history` へ遷移 |
| mode switcher | `general` / `workspace` / `skill-lifecycle` の 3 pill。`data-testid="chat-mode-{mode}"` |
| recent rail | 2件以上 session があると `chat-session-rail` を表示 |

## ナビゲーションボタン仕様

| 要素 | 仕様 |
|------|------|
| 配置 | ChatViewヘッダー右上 |
| アイコン | Lucide Icons `History`（20px×20px） |
| ラベル | なし（アイコンのみ、`aria-label`で補完） |
| type属性 | `type="button"`（フォーム誤送信防止） |
| aria-label | `"チャット履歴"`（スクリーンリーダー対応） |
| 遷移先 | `/chat/history`（React Router） |
| 色 | `text-gray-400`（通常時）、`text-white`（ホバー時） |
| 背景 | 透明（通常時）、`bg-white/10`（ホバー時） |
| パディング | `p-2`（8px） |
| 角丸 | `rounded-lg`（8px） |
| トランジション | `transition-colors`（200ms ease） |

## ボタンスタイルガイドライン（アイコンのみボタン）

アイコンのみのボタン（テキストラベルなし）は以下の原則に従う：

| 原則 | 説明 |
|------|------|
| aria-labelは必須 | スクリーンリーダーが読み上げるラベルを提供 |
| type="button"を明示 | フォーム内で誤ってsubmitされることを防止 |
| タッチターゲット44px | モバイル対応（最小タッチサイズ） |
| ホバーフィードバック | 色変化と背景色変化の両方を提供 |
| アイコンサイズ20px | 視認性を確保しつつコンパクトに |
| フォーカス表示 | キーボードフォーカス時に明確なリング表示 |
| 色のコントラスト比 | gray-400（通常）→ white（ホバー）で4.5:1以上を確保 |

## テスト検証済み項目

| テスト項目 | 結果 | 詳細 |
|------------|------|------|
| ボタン表示 | ✅ | ヘッダー右上に正しく配置 |
| クリックナビゲーション | ✅ | `/chat/history`に遷移 |
| キーボード操作 | ✅ | Tab→Enterで操作可能 |
| ブラウザ履歴 | ✅ | ブラウザバック・フォワードで正常動作 |
| aria-label | ✅ | `aria-label="チャット履歴"`が設定済み |
| type属性 | ✅ | `type="button"`が設定済み |
| レスポンシブ | ✅ | 375px（モバイル）〜1920px（デスクトップ）対応 |
| ホバー状態 | ✅ | `hover:text-white hover:bg-white/10`動作確認 |

**参考**: Phase 8 (T-08-1) 手動テスト結果 - 2025-12-25実施

## アクセシビリティ対応事例

### 事例1: アイコンのみボタンのラベリング

**問題**: アイコンのみのボタンは視覚的には理解できるが、スクリーンリーダーユーザーには機能が伝わらない。

**解決策**: `aria-label`属性で機能を明示する。

### 事例2: type属性の明示

**問題**: フォーム内のボタンで`type`属性を省略すると、デフォルトで`type="submit"`となり誤送信が発生する。

**解決策**: `type="button"`を明示する。

### 事例3: キーボードナビゲーション対応

**問題**: クリックイベントのみでは、キーボードユーザーが操作できない。

**解決策**: `<button>`要素を使用する（自動的にEnter/Spaceキーで動作）。`<div onClick>`パターンは避ける。

### 事例4: フォーカス表示の確保

**問題**: `:focus { outline: none }`でフォーカスリングを消すと、キーボードユーザーがフォーカス位置を見失う。

**解決策**: `:focus-visible`でキーボードフォーカスのみ表示する。

### 事例5: レスポンシブデザインとタッチターゲット

**問題**: 小さいボタンはモバイルで押しにくい。

**解決策**: パディングを確保して44px以上のタッチターゲットを確保。`p-2`（8px）+ アイコン20px = 36px（最小）、`p-3`で44px（推奨）。

## ナビゲーションパターンのベストプラクティス

| 原則 | 説明 |
|------|------|
| 一貫性のある配置 | ナビゲーションボタンは常にヘッダー右上に配置 |
| 視覚的フィードバック | ホバー・フォーカス・アクティブ状態を明確に表現 |
| ブラウザ履歴との統合 | React Routerでブラウザバック・フォワードに対応 |
| プログレッシブ・エンハンスメント | JavaScriptなしでもアクセス可能な設計 |
| エラーハンドリング | ナビゲーション失敗時のフォールバックを提供 |

---

## 関連ドキュメント

- [Portal実装パターン](./ui-ux-portal-patterns.md)
- [システムプロンプト設定UI](./ui-ux-system-prompt.md)
- [LLM選択機能](./ui-ux-llm-selector.md)
- [UI/UXパネル設計](./ui-ux-panels.md)
