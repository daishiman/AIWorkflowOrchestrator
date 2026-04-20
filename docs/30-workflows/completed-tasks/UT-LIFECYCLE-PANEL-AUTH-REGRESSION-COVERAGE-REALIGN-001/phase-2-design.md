# Phase 2: 設計

## メタ情報

| 項目       | 内容                                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| Phase      | 2                                                                                                                       |
| タスクID   | UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001                                                                 |
| ステータス | 未実施                                                                                                                  |
| 作成日     | 2026-04-19                                                                                                              |
| 入力       | outputs/phase-1/responsibility-boundary.md, outputs/phase-1/guarantee-points.md, outputs/phase-1/spec-extraction-map.md |

## 目的

Phase 1 で確定した責務境界と保証点を入力として、現行 UI に合わせた TC-06 相当（rapid click）・TC-07 相当（rerender）の新規テストケースを設計する。あわせて、`onOpenSkillWizard` / `onOpenWizard` / `handleSessionStartNew` の非発火保証テストの構造を定義し、後続の Phase 4（テスト作成 Red）で迷いなく実装できる設計仕様を確定する。

## 実行タスク

## 統合テスト連携

Phase 2 は、どの保証を単体で閉じ、どの保証を統合で確認するかの境界を固定するフェーズである。

- 責務境界テーブルを確定する
- rapid click / rerender / start-new の設計を固定する

### Step 1: 責務境界テーブルの確定

Phase 1 の `responsibility-boundary.md` を入力として、単体テストと統合テストの責務境界を表形式で確定する。

#### 責務境界テーブル（設計案）

| 導線                               | 責務区分 | テスト種別 | 理由                                                           |
| ---------------------------------- | -------- | ---------- | -------------------------------------------------------------- |
| `onOpenSkillWizard` 呼び出し時     | 単体     | 単体テスト | モック境界内のコールバック。wizard 内部に依存しない            |
| `onOpenWizard` 呼び出し時          | 単体     | 単体テスト | モック境界内のコールバック。wizard 内部に依存しない            |
| `handleSessionStartNew` 呼び出し時 | 単体     | 単体テスト | `SkillLifecyclePanel` 内部関数。ipc モックで検証可能           |
| rapid click 時の非発火             | 単体     | 単体テスト | コンポーネント内のイベントハンドラ重複発火防止は単体で検証可能 |
| rerender 時の非発火                | 単体     | 単体テスト | useEffect 依存配列の副作用は単体で検証可能                     |
| wizard 起動先での auth 非混入      | 統合     | 統合テスト | wizard コンポーネントの内部実装に依存するため統合テスト        |
| session resume フロー全体          | 統合     | 統合テスト | `SessionResumePrompt` との連携を含むため統合テスト             |
| authModeSlice.setMode() の契約     | 単体     | 単体テスト | Redux スライスのアクション。コンポーネント単体で検証可能       |

上記は設計案であり、Phase 1 の調査結果で修正が必要な場合は `test-design.md` に差分と根拠を記載する。

### Step 2: 新規テストケース設計

#### TC-06 相当: rapid click 再現テスト

旧 TC-06 は prepare フロー依存だったため、現行 UI の実装に合わせて再設計する。

**テストID**: TC-06-NEW（正式名称は `test-cases.md` で確定）

**保証内容**: `SkillLifecyclePanel` のボタン（またはアクション起点）を短時間に連打した場合でも、`auth:login` IPC チャンネルが複数回発火しないこと

**再現手順（設計）**:

1. `SkillLifecyclePanel` を `render()` する
2. `auth:login` の呼び出しをカウントするモックを設定する
3. 対象ボタン（アクション起点）を `userEvent.click()` で連続 3 回クリックする（間隔: 0ms〜16ms 相当）
4. `auth:login` の呼び出し回数が 0 であることを `expect(mockAuthLogin).not.toHaveBeenCalled()` で確認する

**前提条件の調査項目**（Phase 1 の調査結果で確定する）:

- 連打の起点となるボタン・アクションが `SkillLifecyclePanel` に存在するか
- デバウンス・useCallback・フラグによる重複抑制が実装済みかどうか
- 旧 TC-06 が依存していた prepare フローが現行 UI で何に相当するか

**現行 UI への適合方針**: 旧 prepare フローが存在しない場合、TC-06 相当のテストは「wizard 起動コールバック（`onOpenSkillWizard` 等）が連打時に複数回呼ばれても `auth:login` が発火しない」として再定義する。

#### TC-07 相当: rerender 回帰テスト

旧 TC-07 は prepare フロー依存だったため、現行 UI の実装に合わせて再設計する。

**テストID**: TC-07-NEW（正式名称は `test-cases.md` で確定）

**保証内容**: `SkillLifecyclePanel` が props 変化または state 更新によって rerender された場合でも、`auth:login` IPC チャンネルが再発火しないこと

**再現手順（設計）**:

1. `SkillLifecyclePanel` を初期 props で `render()` する
2. `auth:login` の呼び出しをカウントするモックを設定する
3. `rerender()` を用いて props を更新する（例: `sessionId` や `skillId` の変化）
4. `auth:login` の呼び出し回数が 0 のままであることを確認する

**前提条件の調査項目**（Phase 1 の調査結果で確定する）:

- `SkillLifecyclePanel` の props に rerender トリガーとなる項目が存在するか
- `useEffect` の依存配列に `auth:login` 発火を引き起こす依存が含まれていないか
- rerender 時に呼ばれる副作用関数の一覧

**現行 UI への適合方針**: props 変化で rerender が起きない設計の場合は、`state` の更新（例: 内部の `useState`）による rerender を TC-07 相当のトリガーとして採用する。

### Step 3: 非発火保証テスト設計（TC-01a/b/c の拡張）

`onOpenSkillWizard` / `onOpenWizard` / `handleSessionStartNew` の各導線について、`auth:login` が発火しないことを明示的に保証するテストを設計する。

#### テスト構造の共通パターン

```
describe('auth:login non-emission guarantee')
  it('[TC-GUARD-01a] onOpenSkillWizard 呼び出し時に auth:login が発火しない')
  it('[TC-GUARD-01b] onOpenWizard 呼び出し時に auth:login が発火しない')
  it('[TC-GUARD-01c] handleSessionStartNew 呼び出し時に auth:login が発火しない')
```

各テストの構造:

1. `auth:login` / `ipcRenderer.send` のモックを `vi.fn()` で設定する
2. 対象の操作（コールバック呼び出しまたはボタンクリック）を実行する
3. `expect(mockAuthLogin).not.toHaveBeenCalled()` で非発火を確認する
4. 操作の主目的（wizard が開く等）は別テストで確認済みであることを前提とし、このテストでは副作用の非混入のみを検証する

### Step 4: テストファイル構造設計

既存テストファイルへの追加方針を設計する。

**追加先ファイル**: `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx`

**追加ブロック構成**（設計案）:

```
describe('SkillLifecyclePanel auth regression')
  // 既存テスト（TC-01a, TC-01b, TC-01c, TC-08 等）
  ...

  describe('rapid click: auth:login non-emission')
    it('[TC-06-NEW] ...)

  describe('rerender: auth:login non-emission')
    it('[TC-07-NEW] ...)

  describe('wizard callback: auth:login non-emission guarantee')
    it('[TC-GUARD-01a] ...)
    it('[TC-GUARD-01b] ...)
    it('[TC-GUARD-01c] ...)
```

テストIDの正式採番は Phase 1 の `spec-extraction-map.md` で確認した既存 TC 番号と重複しない形で `test-cases.md` に記載する。

## 参照資料

- `outputs/phase-1/responsibility-boundary.md`（責務境界テーブルの入力）
- `outputs/phase-1/guarantee-points.md`（保証点定義の入力）
- `outputs/phase-1/spec-extraction-map.md`（既存テストIDとの重複確認）
- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx`（追加先ファイル・既存パターン参照）
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`（実装参照）

## 成果物

- `outputs/phase-2/test-design.md`（責務境界テーブル確定版・テストファイル構造設計・テストIDの採番規則・モック戦略を記載）
- `outputs/phase-2/test-cases.md`（TC-06-NEW / TC-07-NEW / TC-GUARD-01a / TC-GUARD-01b / TC-GUARD-01c の詳細仕様。前提条件・操作手順・期待結果・実装時の注意点を含む）

## 完了条件

- [ ] 責務境界テーブルが全導線（最低8行）について確定している
- [ ] TC-06 相当の rapid click テストが現行 UI に適合した形で設計されている
- [ ] TC-07 相当の rerender テストが現行 UI に適合した形で設計されている
- [ ] `onOpenSkillWizard` / `onOpenWizard` / `handleSessionStartNew` の非発火保証テストが設計されている
- [ ] 新規テストIDが既存 TC 番号と重複しない
- [ ] テストファイルへの追加ブロック構成が `test-design.md` に記載されている

## タスク 100% 実行確認【必須】

以下を順番に確認すること:

1. 責務境界テーブルの全行に「単体」または「統合」の分類と理由が記載されているか
2. TC-06-NEW の再現手順が「連打回数・間隔・検証方法」まで具体的に記載されているか
3. TC-07-NEW の再現手順が「rerender トリガー・検証方法」まで具体的に記載されているか
4. TC-GUARD-01a/b/c が独立したテストとして設計されているか（互いに依存していないか）
5. 新規テストIDが `spec-extraction-map.md` の既存 TC 番号と重複していないか確認したか

## 次 Phase

Phase 3（設計レビュー）へ進む。`test-design.md` と `test-cases.md` を入力として、テスト設計の妥当性・責務境界の正確性・既存テストとの重複有無を多角的にレビューし、Phase 4 への進行可否を判定する。
