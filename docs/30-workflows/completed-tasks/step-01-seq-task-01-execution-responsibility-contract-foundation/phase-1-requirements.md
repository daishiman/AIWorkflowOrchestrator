# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                                      |
| ---------- | --------------------------------------------------------- |
| Phase      | 1                                                         |
| Phase 名   | 要件定義                                                  |
| タスクID   | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 |
| 前提 Phase | なし                                                      |
| 後続 Phase | Phase 2（設計）                                           |
| ステータス | completed                                                 |
| 作成日     | 2026-03-19                                                |
| 機能名     | execution-responsibility-contract-foundation              |

## 目的

execution responsibility を主語に、capability 4状態 / UI状態語彙 / CTA契約を single source of truth として確定するための要件・受入基準・スコープを明文化する。

## 実行タスク

- 参照資料確認: 親パック index と Task index から capability 定義・禁止事項・canonical doc set を抽出する
- 現状棚卸し（P50チェック）: RuntimePolicyResolver.ts / auth-mode.ts / RuntimeResolver.ts の現状を調査し、capability / state / CTA の gap を特定する
- 要件確定: FR-1〜FR-4 と NFR-1〜NFR-2 を検証可能な文章で定義する
- AC化: capability 4状態・UI状態語彙・禁止事項・canonical doc set の各受入基準を確定する
- スコープ固定: Task01 の境界（Task02-09 で扱う範囲との差分）を明文化する
- Phase 2 論点整理: 未確定事項を concern として 3 つ以下に正規化する

## 参照資料

| 参照資料                                                 | パス                                                                                                          | 確認する内容                                                                   |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 親パック index                                           | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                                    | capability 4状態の定義・禁止事項・task 依存順（Task01→Task02→...）             |
| Task index                                               | docs/30-workflows/step-01-seq-task-01-execution-responsibility-contract-foundation/index.md                   | AC-1〜AC-4 と canonical doc set の指定                                         |
| 親 UI/UX 正本                                            | docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md                        | 状態語彙（ready/blocked/unavailable）と CTA 契約の現行定義                     |
| 親パック監査マトリクス                                   | docs/30-workflows/ai-runtime-execution-responsibility-realignment/design-audit-matrix.md                      | 既存の矛盾・gap の監査結果（語彙drift / state drift の先行調査）               |
| RuntimePolicyResolver                                    | apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts                                               | integrated_api / terminal_handoff の2択決定ロジック（capability との対応確認） |
| auth-mode.ts                                             | packages/shared/src/types/auth-mode.ts                                                                        | AuthMode型・IPCResponse envelope・AuthModeStatus DTO の定義                    |
| RuntimeResolver                                          | apps/desktop/src/main/services/runtime/RuntimeResolver.ts                                                     | runtime 解決フローと fallback 有無                                             |
| TerminalHandoffBuilder                                   | apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts                                              | terminal handoff 構築ロジックと silent send 防止の実装有無                     |
| ui-ux-navigation                                         | .claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md                                         | `settings` public shell / `ViewType` / `renderView()` の正本境界               |
| ui-ux-settings-core                                      | .claude/skills/aiworkflow-requirements/references/ui-ux-settings-core.md                                      | AuthGuard bypass / timeout fallback / settings shell 契約                      |
| arch-state-management-core                               | .claude/skills/aiworkflow-requirements/references/arch-state-management-core.md                               | Renderer selector 境界と既存 capability 語彙                                   |
| interfaces-auth-core                                     | .claude/skills/aiworkflow-requirements/references/interfaces-auth-core.md                                     | capability と auth 型の具体契約                                                |
| task-workflow-backlog                                    | .claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md                                    | follow-up formalization と same-wave 更新条件                                  |
| lessons-learned-viewtype-electron-ui                     | .claude/skills/aiworkflow-requirements/references/lessons-learned-viewtype-electron-ui.md                     | `ViewType` / `renderView()` drift 防止                                         |
| lessons-learned-auth-ipc-skill-creator-sync-auth-timeout | .claude/skills/aiworkflow-requirements/references/lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md | settings bypass / auth timeout の再発防止                                      |
| spec elegance audit                                      | .claude/skills/aiworkflow-requirements/references/spec-elegance-consistency-audit.md                          | 抽象・整合・依存レビューの基準                                                 |

## 実行手順

### ステップ1: 参照資料を確認し調査スコープを固定する

以下の順で参照資料を読み、Task01 の調査スコープを確定する。

1. 親パック index から capability 4状態の定義と禁止事項（silent fallback / auto-send / hidden prompt injection）を抜粋する
2. Task index から AC-1〜AC-4 の受入基準テキストを確認し、`outputs/phase-1/requirements-definition.md` の AC 欄に転記する
3. 親 UI/UX 正本と `ui-ux-navigation.md` から状態語彙（ready / blocked / unavailable）、`settings` 公開シェル例外、`ViewType` / `renderView()` の downstream 境界を抜粋し、Task01 で「確定」すべき内容と「下流で消費するだけ」の内容を区別する

### ステップ2: P50チェック（既実装状態の調査）

実装前に対象ファイルの現在状態を確認し、capability / state / CTA の gap を特定する。

```bash
# RuntimePolicyResolver の判定ロジックを確認
grep -n "integrated_api\|terminal_handoff\|integratedRuntime\|terminalSurface\|capability" \
  apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts

# auth-mode.ts の型定義を確認
grep -n "AuthMode\|AuthModeStatus\|capability\|ready\|blocked\|unavailable" \
  packages/shared/src/types/auth-mode.ts

# RuntimeResolver の fallback ロジックを確認（silent fallback がないか）
grep -n "fallback\|default\|undefined\|null\|silent" \
  apps/desktop/src/main/services/runtime/RuntimeResolver.ts

# TerminalHandoffBuilder の auto-send 防止を確認
grep -n "autoSend\|auto_send\|sendCommand\|inject\|prompt" \
  apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts

# 状態語彙の散在を確認（drift 検出）
grep -rn "ready\|blocked\|unavailable" \
  apps/desktop/src/renderer --include="*.tsx" --include="*.ts" | head -40
```

調査結果を以下の3軸で分類する:

- **gap-capability**: コード上の判定結果が capability 4状態（integratedRuntime / terminalSurface / both / none）と 1:1 対応しているか
- **gap-state**: UI コンポーネントで使われる状態語彙が ready / blocked / unavailable に統一されているか
- **gap-prohibition**: silent fallback / auto-send / hidden prompt injection を防ぐガードが存在するか

### ステップ3: 要件・AC・除外範囲を確定する

以下の FR / NFR を `outputs/phase-1/requirements-definition.md` に定義する。

**FR-1: capability 4状態定義と各状態の責務**

- `integratedRuntime`: sanctioned な in-app 実行 lane が利用可能な状態。責務: UI は即時実行 CTA を表示する
- `terminalSurface`: sanctioned な manual terminal lane のみ利用可能な状態。責務: UI は handoff CTA を表示する
- `both`: in-app 実行 lane と manual terminal lane の両方が利用可能な状態。責務: UI は優先 lane と代替 lane を同時に提示する
- `none`: sanctioned な実行 lane が存在しない状態。責務: UI は unavailable または blocked を表示し、no-op ではない解決 action だけを提示する

**FR-2: UI状態語彙（ready / blocked / unavailable）と表示契約**

- `ready`: 現在の surface で sanctioned な action を即座に実行できる状態
- `blocked`: lane 自体は存在するが前提条件が未充足の状態。理由テキストと解決 action（設定画面へのリンク等）を必ず同時に表示する
- `unavailable`: sanctioned な lane が存在しない状態。回避策がない場合は理由のみ表示する

**FR-3: CTA契約（primary 1個 + secondary 1個の構成）**

- capability 状態ごとに primary CTA と secondary CTA の表示条件・ラベル・action wiring を 1:1 で定義する
- primary CTA が存在しない状態（none）では secondary CTA のみ表示し、primary CTA は非表示（disabled でなく非表示）にする

**FR-4: 禁止事項（boundary 定義）**

- `silent fallback`: ユーザーに通知せず別の実行モードへ自動切り替えすることを禁止する
- `auto-send`: ユーザー確認なしでコマンドを terminal に送信することを禁止する
- `hidden prompt injection`: UI に表示されないプロンプトをバックグラウンドで追加することを禁止する

**NFR-1: 語彙一貫性（既存コードとの用語整合）**

- ステップ2で特定した gap-capability / gap-state の差異が 0 件であること。差異がある場合は Phase 2 の設計論点として記録する

**NFR-2: canonical doc set の追跡可能性**

- Task02 以降が参照すべき canonical doc set（ファイルパス一覧）を `outputs/phase-1/scope-definition.md` に明示する
- canonical doc set の各ファイルに「何を参照するか」を1行で注記する

### ステップ4: Phase 2 への未確定論点を 3 つ以下に絞る

ステップ2〜3で解決できなかった事項を concern として整理し、Phase 2 の設計トピックへ渡す。

- concern は「問い」の形式で記述する（例: 「capability が both のとき primary CTA の優先順はどう決めるか」）
- concern は最大 3 つに絞る。4 つ以上になる場合は priority が低いものを Phase 2 の appendix に回す
- 各 concern に「解決しないと Phase 2 が完了できない理由」を 1 行で付記する

## 統合テスト連携（Phase 1〜11は必須）

統合ポイント（UI state / IPC / settings / terminal handoff）を FR/NFR に明記し、後続 task と重複しないよう境界を固定する。具体的には以下の6点を `outputs/phase-1/scope-definition.md` に記載する:

1. Task01 が定義する契約のうち、IPC layer の変更を伴うもの（Task02 以降のスコープ）
2. Task01 が定義する契約のうち、Renderer UI の変更を伴うもの（Task03-04 のスコープ）
3. `settings` public shell / AuthGuard bypass / timeout fallback は Task01 の consumer 境界として明記し、具体 wiring は下流 task に委譲する
4. `ViewType` / `renderView()` の canonical route 契約は Task01 の consumer 境界として参照し、ここでは route 追加や分岐実装を扱わない
5. Task01 の canonical doc set が Step02 以降から読み取り専用（変更不可）であることの明示
6. terminal handoff の具体的なコマンド構築は TerminalHandoffBuilder（Task05 のスコープ）に委譲することの明示

## 多角的チェック観点（AIが判断）

| 観点                   | 適用判断                                                | 仕様参照先                                                            |
| ---------------------- | ------------------------------------------------------- | --------------------------------------------------------------------- |
| UI/UX                  | capability × state × CTA の表示契約を定義する           | `aiworkflow-requirements: ui-ux-*`                                    |
| アーキテクチャ         | RuntimePolicyResolver の capability 判定境界を確認する  | `aiworkflow-requirements: arch-*`                                     |
| IPC/Preload            | AuthModeStatus DTO と IPC envelope の現行定義を確認する | `aiworkflow-requirements: api-ipc-*`, `security-electron-ipc-core.md` |
| ワークフローガバナンス | canonical doc set の追跡可能性を確保する                | `aiworkflow-requirements: task-workflow*`, `lessons-learned*`         |

**この task 固有の重点**: 語彙 drift / state drift / simpler alternative の 3 方向で設計を叩く

## サブタスク管理

Phase 実行開始時に、TodoWrite 相当で以下のサブタスクを作成すること:

1. 参照資料の確認（ステップ1）
2. P50チェック・現状棚卸し（ステップ2）
3. FR/NFR/AC 確定（ステップ3）
4. Phase 2 論点整理（ステップ4）
5. 成果物パスと outputs/phase-1 の整合確認
6. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## 成果物

| 成果物           | パス                                       | 期待内容                                                                                                                              |
| ---------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| 要件定義書       | outputs/phase-1/requirements-definition.md | FR-1〜FR-4 / NFR-1〜NFR-2 の一覧と AC-1〜AC-4 へのマッピング表。各 FR は「条件 → 表示契約」の形式で記述する                           |
| スコープ定義     | outputs/phase-1/scope-definition.md        | Task01 の境界明示（Task02-09 で扱う内容との差分）+ canonical doc set 一覧（ファイルパスと参照目的の対）                               |
| 調査インベントリ | outputs/phase-1/current-state-inventory.md | RuntimePolicyResolver / auth-mode.ts / RuntimeResolver の現状コードと gap（gap-capability / gap-state / gap-prohibition の3軸で分類） |

## 完了条件

- [ ] gap-capability / gap-state / gap-prohibition の調査結果が current-state-inventory.md に記載されている
- [ ] FR-1〜FR-4 と NFR-1〜NFR-2 が requirements-definition.md に検証可能な文章で定義されている
- [ ] AC-1〜AC-4 の各受入基準と FR の対応関係が表で示されている
- [ ] Task01 の境界（Task02-09 で扱わない内容）が scope-definition.md に明示されている
- [ ] Phase 2 への論点が concern 形式で 3 つ以下に整理されている
- [ ] canonical doc set のファイルパス一覧が scope-definition.md に記載されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-1/` と一致している
- [ ] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [ ] Phase 4 へ進む前提として Phase 1-3 の gate 条件が明記されている

## 次のPhase

- [Phase 2（設計）](./phase-2-design.md)
