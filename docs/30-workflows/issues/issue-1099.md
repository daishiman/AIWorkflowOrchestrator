# [#1099] "[TASK-10A-F-MINOR-02-WIZARD-GENERATE-RECOVERY] SkillCreateWizard GenerateStep のリカバリ導線追加"

## メタ情報

```yaml
task_id: TASK-10A-F-MINOR-02-WIZARD-GENERATE-RECOVERY
task_name: SkillCreateWizard GenerateStep のリカバリ導線追加
category: 改善
target_feature: スキル作成ウィザード
priority: 低
scale: 小規模
status: 未実施
source_phase: TASK-10A-F Phase 11（手動テスト発見）
created_date: 2026-03-09
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-10a-f-minor-02-wizard-generate-recovery.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-10A-F Phase 11 の手動テストにおいて、SkillCreateWizard コンポーネントの GenerateStep（Step 2: 生成中）でエラーが発生した際のユーザー体験上の問題が発見された。現在の GenerateStep は `isGenerating` と `error` の2つの props のみを受け取り、エラーメッセージの表示は行うが、ユーザーが状況を回復するための操作導線（「戻る」ボタン、「再試行」ボタン）が提供されていない。

### 1.2 問題点・課題

1. **リカバリ導線の欠如**: GenerateStep でエラーが発生した場合、エラーメッセージは表示されるが「戻る」ボタンも「再試行」ボタンも存在しない
2. **Step 2 でのスタック**: エラー発生後、ユーザーはウィザードを閉じる以外に手段がない。前のステップ（ConfigureStep）に戻って設定を修正したり、同じ設定で再試行することができない
3. **`handleGenerate` の catch ブロック**: `setError()` でエラー状態は記録するが、`goBack()` や再試行の UI トリガーが提供されていない

現在の GenerateStep 実装（`GenerateStep.tsx` L14-36）:

- `isGenerating === true` の場合: スピナーと「生成中...」テキストを表示
- `error !== null` の場合: エラーメッセージを赤字で表示するのみ
- それ以外の操作ボタンは一切存在しない

### 1.3 放置した場合の影響

- **UX 品質低下**: エラー発生時にウィザードを閉じて最初からやり直す必要があり、入力した説明文や設定オプションが全て失われる
- **操作の不可逆性**: Apple HIG の原則「操作は可能な限り元に戻せるべき」に違反する
- **ユーザーの混乱**: エラーメッセージは表示されるが次のアクションが不明確で、ユーザーが何をすべきか判断できない

---

## 2. 何を達成するか（What）

### 2.1 目的

GenerateStep でエラーが発生した際に、ユーザーが「前のステップに戻る」または「再試行する」ためのリカバリ導線を提供し、ウィザードを閉じずに回復できるようにする。

### 2.2 最終ゴール

- エラー発生時に「戻る」ボタンと「再試行」ボタンが表示される
- 「戻る」ボタンで ConfigureStep（Step 1）に戻り、設定を修正して再度生成できる
- 「再試行」ボタンで同じ設定のまま生成を再実行できる
- 生成中（`isGenerating === true`）はリカバリボタンを非表示にする

### 2.3 スコープ（含むもの / 含まないもの）

**含むもの:**

- GenerateStep コンポーネントへの `onBack` / `onRetry` コールバック props 追加
- エラー時のリカバリボタン UI 実装
- SkillCreateWizard 側での `onBack` / `onRetry` ハンドラ接続
- 対応するユニットテスト

**含まないもの:**

- GenerateStep 以外のステップの変更
- エラーの種類に応じた分岐（ネットワークエラー vs バリデーションエラー等）
- Store や IPC 層の変更
- `useWizardStep` hook の変更（既存の `goBack` / `goToStep` をそのまま利用する）

### 2.4 成果物

| 成果物                   | パス                                                                                                 |
| ------------------------ | ---------------------------------------------------------------------------------------------------- |
| GenerateStep 修正        | `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`                                 |
| SkillCreateWizard 修正   | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                                   |
| GenerateStep テスト      | `apps/desktop/src/renderer/components/skill/__tests__/GenerateStep.test.tsx`（新規または既存に追加） |
| SkillCreateWizard テスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`（既存に追加）      |

---

## 3. どのように実現するか（How）

### 3.1 技術方針

- **State 管理**: local useState のみで完結（Case B 方式）。Store 変更不要
- **コンポーネント変更**: GenerateStep の props に `onBack` と `onRetry` を追加し、エラー時にボタンを表示
- **親コンポーネント接続**: SkillCreateWizard 側で `goBack`（Step 1 に戻る）と `handleGenerate`（再試行）を GenerateStep に渡す

### 3.2 実装案

#### 3.2.1 GenerateStep props 拡張

```typescript
export interface GenerateStepProps {
  isGenerating: boolean;
  error: Error | null;
  onBack?: () => void; // 追加: 前のステップに戻る
  onRetry?: () => void; // 追加: 再試行
}
```

#### 3.2.2 GenerateStep エラー時 UI

```typescript
{error && (
  <div className="flex flex-col items-center gap-4">
    <div className="text-[var(--status-error)] text-sm">
      {error.message || "スキル生成に失敗しました"}
    </div>
    <div className="flex gap-3">
      {onBack && (
        <button
          data-testid="wizard-generate-back"
          onClick={onBack}
          className="..."  // セカンダリボタンスタイル
        >
          設定に戻る
        </button>
      )}
      {onRetry && (
        <button
          data-testid="wizard-generate-retry"
          onClick={onRetry}
          className="..."  // プライマリボタンスタイル
        >
          再試行
        </button>
      )}
    </div>
  </div>
)}
```

#### 3.2.3 SkillCreateWizard 側の接続

```typescript
{currentStep === 2 && (
  <div data-testid="wizard-step-generate">
    <GenerateStep
      isGenerating={isGenerating}
      error={error}
      onBack={() => goToStep(1)}   // ConfigureStep に戻る
      onRetry={handleGenerate}      // 同じ設定で再試行
    />
  </div>
)}
```

#### 3.2.4 ボタンスタイル（Apple HIG 準拠）

- **「設定に戻る」**: セカンダリボタン（テキストボタンまたはアウトラインボタン）
- **「再試行」**: プライマリボタン（アクセントカラー `var(--status-primary)`）
- **生成中は非表示**: `isGenerating === true` の場合はスピナーのみ表示し、ボタンは表示しない

---

## 4. TASK-10A-F からの教訓（苦戦箇所）

### 4.1 State 境界（Case B 方式）

`error`, `isGenerating`, `currentStep` は全て SkillCreateWizard 内の local useState で管理されている。リカバリ導線の追加も local state の操作（`goToStep(1)` による Step 戻り、`handleGenerate` の再呼び出し）のみで完結し、Store 層への影響はない。

### 4.2 Apple HIG 可逆性の確保

Apple HIG では破壊的操作以外にリカバリパスを提供することが推奨される。現状はエラー時にウィザードを閉じる（破壊的操作）しか手段がないため、「戻る」「再試行」というリカバリパスを追加して操作の可逆性を確保する。

### 4.3 P31 安全性

`useCreateSkill()` は Store の個別セレクタであり、安定した関数参照を返す。再試行で `handleGenerate` を再呼び出ししても、P31（Zustand Store Hooks 無限ループ）のリスクはない。`handleGenerate` は `useCallback` でラップされていないが、ボタンクリックによる明示的なユーザー操作で呼び出されるため問題ない。

### 4.4 P39 テスト環境の注意

テスト実装時は happy-dom 環境であるため、`userEvent` ではなく `fireEvent` を使用すること（P39 準拠）。ボタンクリック後の非同期処理は `await act(async () => { fireEvent.click(el) })` で包む。

---

## 5. 参照資料

| 資料                        | パス                                                                         |
| --------------------------- | ---------------------------------------------------------------------------- |
| SkillCreateWizard 本体      | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`（105行）  |
| GenerateStep コンポーネント | `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`（37行） |
| useWizardStep hook          | `apps/desktop/src/renderer/components/skill/hooks/useWizardStep.ts`（47行）  |
| P31 対策                    | `.claude/rules/06-known-pitfalls.md#P31`                                     |
| P39 対策                    | `.claude/rules/06-known-pitfalls.md#P39`                                     |
| Apple HIG カラー            | `.claude/rules/01-architecture.md#カラーパレット`                            |

---

## 6. 受け入れ基準

- [ ] GenerateStep の `GenerateStepProps` に `onBack?: () => void` と `onRetry?: () => void` が追加されている
- [ ] エラー発生時（`error !== null` かつ `isGenerating === false`）に「設定に戻る」ボタンと「再試行」ボタンが表示される
- [ ] 生成中（`isGenerating === true`）にはリカバリボタンが表示されない
- [ ] 「設定に戻る」ボタンをクリックすると ConfigureStep（Step 1）に遷移する
- [ ] 「再試行」ボタンをクリックすると生成処理が再実行される
- [ ] 各ボタンに `data-testid` 属性が付与されている（`wizard-generate-back`, `wizard-generate-retry`）
- [ ] ボタンのスタイルが Apple HIG に準拠している（プライマリ/セカンダリの区別）
- [ ] エラーメッセージとボタンの間に適切なスペーシング（8px グリッド）がある
- [ ] ユニットテスト: エラー時にリカバリボタンが表示されることを検証
- [ ] ユニットテスト: 生成中にリカバリボタンが非表示であることを検証
- [ ] ユニットテスト: 「設定に戻る」クリックで `onBack` が呼ばれることを検証
- [ ] ユニットテスト: 「再試行」クリックで `onRetry` が呼ばれることを検証
- [ ] SkillCreateWizard 統合テスト: エラー後に Step 1 に戻れることを検証
- [ ] `pnpm lint` が通ること
- [ ] `pnpm typecheck` が通ること
- [ ] 既存テストが全て PASS すること

---

## 7. 関連タスク

| タスクID   | 関係   | 説明                                                         |
| ---------- | ------ | ------------------------------------------------------------ |
| TASK-10A-F | 発見元 | Store 駆動ライフサイクル UI 仕様の Phase 11 手動テストで発見 |
| TASK-10A-C | 実装元 | SkillCreateWizard の初期実装タスク                           |
