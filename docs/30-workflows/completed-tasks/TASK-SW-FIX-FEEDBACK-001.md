# スキルウィザード スキル一覧リアルタイム反映・skillPath nullガード・成功表示修正 - タスク指示書

## メタ情報

```yaml
issue_number: 2131
task_id: TASK-SW-FIX-FEEDBACK-001
status: open
priority: high
scale: small
task_type: BUGFIX
```

| 項目           | 内容                                                                            |
| -------------- | ------------------------------------------------------------------------------- |
| タスクID       | TASK-SW-FIX-FEEDBACK-001                                                        |
| タスク名       | スキルウィザード スキル一覧リアルタイム反映・skillPath nullガード・成功表示修正 |
| 分類           | バグ修正（フィードバックループ欠如・nullガード・成功表示誤表示）                |
| 対象機能       | SkillCreateWizard / CompleteStep / LLMモードスキル生成フロー                    |
| 優先度         | 高（`priority:high`）                                                           |
| 見積もり規模   | 小規模（`scale:small`）                                                         |
| ステータス     | 未実施（`status:open`）                                                         |
| 実行タイミング | Wave B（TASK-SW-FIX-DATAFLOW-001完了後に並列実行可能）                          |
| 依存タスク     | TASK-SW-FIX-DATAFLOW-001（完了済み）                                            |
| 発見日         | 2026-04-12                                                                      |
| タスク分類     | BUGFIX タスク（UI フィードバックループ欠如・nullガード・成功表示修正）          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

スキルウィザードには、スキル生成後のフィードバックループに関する複数の問題が混在している。
問題6・8・14・20として識別されており、LLMモードでのスキル生成完了時にユーザーへの
フィードバックが正しく機能しない状態にある。

### 1.2 問題点・課題

1. **問題6: スキル一覧のリアルタイム未反映**
   LLMモード（`handleExecutePlan`）でスキル生成が完了しても、スキル一覧コンポーネントが
   自動更新されない。ユーザーは生成結果を確認するために手動リロードを強いられる。

2. **問題8: LLMモード成功パスに `fetchSkills()` が欠落**
   templateモードの成功パスには `fetchSkills()` が存在するが、LLMモード専用の
   `handleExecutePlan` 関数の成功パス末尾には追加されていない。これがスキル一覧
   未更新の直接原因。

3. **問題14: `skillPath = null` のままStep 3到達でサイレント失敗**
   スキル生成が内部的に失敗し `skillPath` が `null` のまま Step 3（`CompleteStep`）に
   遷移した場合でも、エラーメッセージが表示されない。ユーザーは成功したと誤認したまま
   ウィザードを閉じてしまう。

4. **問題20: `skillPath = null` でも成功ヘッダーが無条件表示される**
   `CompleteStep` の「✓ スキルの骨格を生成しました」ヘッダーが `skillPath` の値に
   関わらず常に表示される。失敗ケースでも成功メッセージが出てしまう。

### 1.3 放置した場合の影響

- LLMモードでスキル生成後、ユーザーが手動リロードしない限り新しいスキルが一覧に現れない
- スキル生成失敗時にエラーメッセージが表示されず、ユーザーが誤ってウィザードを閉じる
- 失敗ケースで成功メッセージが表示されるため、ユーザーの信頼性が損なわれる
- templateモードとLLMモード間で一貫性のない動作が継続する

---

## 2. 何を達成するか（What）

### 2.1 目的

LLMモードの成功パスに `fetchSkills()` を追加してスキル一覧のリアルタイム更新を実現し、
`CompleteStep` に `skillPath` nullガードと成功ヘッダーの条件表示を実装することで、
ユーザーへの正確なフィードバックを確保する。

### 2.2 最終ゴール

- LLMモードでスキル生成完了後、スキル一覧が即座に自動更新される
- `skillPath = null` の場合、`CompleteStep` にエラーメッセージとリトライ誘導ボタンが表示される
- `skillPath = null` の場合、成功ヘッダーが表示されない
- `skillPath` が正常値の場合、従来通り成功ヘッダーと完了画面が表示される

### 2.3 スコープ

**含むもの**:

- `SkillCreateWizard.tsx` の `handleExecutePlan` 成功パスへの `fetchSkills()` 追加
- `CompleteStep.tsx` の `skillPath` nullガード実装（アーリーリターン方式）
- `CompleteStep.tsx` の成功ヘッダー表示条件の変更（`skillPath !== null` のみ表示）
- エラーメッセージ・リトライ誘導UIの実装
- AC-1〜AC-5 を検証するテストケース（TC-FEEDBACK-001〜007）追加

**含まないもの**:

- templateモード側の `fetchSkills()` ロジック変更（既存動作は維持）
- `skillPath` が `null` になる根本原因の修正（Wave Aタスク: TASK-SW-FIX-DATAFLOW-001 で対処）
- スキル生成ロジック（IPC Handler）の変更
- コミット・PR作成（ユーザー明示承認前）

### 2.4 成果物

- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`（`fetchSkills()` 追加）
- `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`（nullガード・条件表示追加）
- 対応するテストケース更新

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-SW-FIX-DATAFLOW-001（Wave A）の完了が前提
- `SkillCreateWizard.tsx` に `fetchSkills` 関数が既に定義されていること
- `CompleteStep.tsx` が `skillPath` プロパティを受け取っていること

### 3.2 依存タスク

| タスクID                 | 状態     | 関係                     |
| ------------------------ | -------- | ------------------------ |
| TASK-SW-FIX-DATAFLOW-001 | 完了済み | Wave A（本タスクの前提） |

### 3.3 必要な知識

- `SkillCreateWizard.tsx` の `handleExecutePlan` 関数の実装パターン
- `CompleteStep.tsx` の props 型定義（`skillPath: string | null`）
- React のアーリーリターンパターン（条件付きレンダリング）
- Vitest / React Testing Library によるコンポーネントテスト

### 3.4 推奨アプローチ

**fetchSkills() 追加（SkillCreateWizard.tsx）**:

```typescript
// handleExecutePlan 成功パスに追加
const handleExecutePlan = async () => {
  try {
    // ... 既存のLLM実行ロジック ...
    if (generatedPath) {
      setSkillPath(generatedPath);
      await fetchSkills(); // fetchSkills失敗でもステップ遷移は継続
      setCurrentStep("complete");
    }
  } catch (error) {
    // 既存のエラーハンドリング
  }
};
```

**skillPath nullガード（CompleteStep.tsx）**:

```typescript
// アーリーリターン方式で nullガード
export const CompleteStep = ({ skillPath, onRetry }: CompleteStepProps) => {
  if (skillPath === null) {
    return (
      <div>
        <h2>スキルの生成に失敗しました</h2>
        <p>スキルファイルの作成中にエラーが発生しました。</p>
        <button onClick={onRetry}>もう一度試す</button>
      </div>
    );
  }
  // skillPath !== null のみ成功ヘッダーを表示
  return (
    <div>
      <h2>✓ スキルの骨格を生成しました</h2>
      {/* 既存の完了画面コンテンツ */}
    </div>
  );
};
```

---

## 4. 実行手順（Phase 1-13 概要）

### Phase 1: 要件定義

- 問題6・8・14・20の根本原因と修正箇所を特定する
- `SkillCreateWizard.tsx` の `handleExecutePlan` と `handleTemplateSubmit` の `fetchSkills` 呼び出し状況を調査する
- `CompleteStep.tsx` のプロパティ型定義と現在のレンダリングロジックを確認する
- AC-1〜AC-5 を確定する

### Phase 2: 設計

- `handleExecutePlan` 成功パスへの `fetchSkills()` 追加箇所と `await` 有無を確定する
- `fetchSkills()` 失敗時の扱い（ログのみ、遷移は継続）を設計する
- `CompleteStep.tsx` のアーリーリターン方式 nullガードロジックを設計する
- エラーメッセージ・リトライ誘導UIのコピーとスタイルを設計する

### Phase 3: 設計レビュー

- Phase 2 設計と受け入れ基準（AC-1〜AC-5）の整合を確認する
- templateモードへの回帰影響がないことを確認する
- `fetchSkills()` のエラーハンドリング方針を確定する

### Phase 4: テスト作成（TDD Red）

- TC-FEEDBACK-001: LLMモード成功時に `fetchSkills` が呼ばれる
- TC-FEEDBACK-002: LLMモード失敗時に `fetchSkills` が呼ばれない
- TC-FEEDBACK-003: [回帰] templateモード成功時の `fetchSkills` 呼び出しが維持される
- TC-FEEDBACK-004: `skillPath = null` の場合エラーメッセージが表示される
- TC-FEEDBACK-005: `skillPath = null` の場合成功ヘッダーが表示されない
- TC-FEEDBACK-006: `skillPath` が正常値の場合成功ヘッダーが表示される
- TC-FEEDBACK-007: `skillPath` が正常値の場合エラーボタンが表示されない
- Red状態で実行確認

### Phase 5: 実装

- `SkillCreateWizard.tsx`: `handleExecutePlan` 成功パスに `await fetchSkills()` を追加する
- `CompleteStep.tsx`: アーリーリターン方式の `skillPath === null` ガードを追加する
- `CompleteStep.tsx`: エラーメッセージ・リトライ誘導ボタンUIを実装する
- TC-FEEDBACK-001〜007 が Green（PASS）になることを確認する

### Phase 6: テスト拡充

- エッジケースのテストを追加する（`fetchSkills` 失敗時のステップ遷移確認 等）
- 既存テストへの回帰影響ゼロを確認する

### Phase 7: カバレッジ確認

- `CompleteStep.tsx` のブランチカバレッジを確認する（`skillPath !== null` / `skillPath === null` の両パス）
- `handleExecutePlan` の成功パス・失敗パスのカバレッジを確認する

### Phase 8: リファクタリング

- エラーメッセージ文言・スタイルを既存UIと統一する
- `CompleteStep.tsx` のprops型定義（`onRetry` の追加 等）を整理する

### Phase 9: 品質保証

- `pnpm lint` を実行してエラーゼロを確認する
- `pnpm typecheck` を実行してエラーゼロを確認する
- 全テストスイートを実行して回帰がないことを確認する

### Phase 10: 最終レビュー

- AC-1〜AC-5 の全項目が満たされていることを確認する
- 変更ファイル一覧と実装内容の整合を最終確認する

### Phase 11: 手動テスト

- LLMモードでスキル生成を実行し、完了後にスキル一覧が即座に更新されることを確認する
- `skillPath = null` を模したケースで `CompleteStep` のエラー表示を確認する
- templateモードの動作に回帰がないことを確認する

### Phase 12: ドキュメント

- 本タスク仕様書の完了条件チェックリストを更新する
- 変更したファイルの JSDoc コメントを確認・更新する

### Phase 13: PR 作成

- コミットメッセージを規約に従って作成する（`fix(skill-wizard):` プレフィックス）
- PR本文に AC-1〜AC-5 の検証結果を記載する

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] AC-1: LLMモード（`handleExecutePlan`）の成功パスで `fetchSkills()` が呼ばれる
- [ ] AC-2: templateモードでスキル生成完了後、スキル一覧が即座に更新される（既存動作の維持）
- [ ] AC-3: `skillPath = null` のまま Step 3 に到達した場合、エラーメッセージが表示される
- [ ] AC-4: `skillPath = null` の場合「✓ スキルの骨格を生成しました」ヘッダーが表示されない
- [ ] AC-5: `skillPath` が正常値の場合、従来通り成功ヘッダーと完了画面が表示される

### 品質要件

- [ ] TC-FEEDBACK-001〜007 が全件 PASS
- [ ] 既存テストスイートに回帰影響なし（100% PASS）
- [ ] TypeScript 型エラーなし（`pnpm typecheck` PASS）
- [ ] ESLint エラーなし（`pnpm lint` PASS）

### ドキュメント要件

- [ ] `CompleteStep.tsx` の props 型定義に `skillPath: string | null` が明記されていること
- [ ] `handleExecutePlan` に `fetchSkills()` 追加の意図がコメントで記述されていること

---

## 6. 検証方法

### テストケーステーブル

| テストID        | 対象ファイル          | 入力条件                          | 期待結果                     | 対応AC |
| --------------- | --------------------- | --------------------------------- | ---------------------------- | ------ |
| TC-FEEDBACK-001 | SkillCreateWizard.tsx | LLMモード成功                     | `fetchSkills` が1回呼ばれる  | AC-1   |
| TC-FEEDBACK-002 | SkillCreateWizard.tsx | LLMモード失敗                     | `fetchSkills` が呼ばれない   | AC-1   |
| TC-FEEDBACK-003 | SkillCreateWizard.tsx | templateモード成功（回帰）        | `fetchSkills` が1回呼ばれる  | AC-2   |
| TC-FEEDBACK-004 | CompleteStep.tsx      | `skillPath = null`                | エラーメッセージが表示される | AC-3   |
| TC-FEEDBACK-005 | CompleteStep.tsx      | `skillPath = null`                | 成功ヘッダーが表示されない   | AC-4   |
| TC-FEEDBACK-006 | CompleteStep.tsx      | `skillPath = "/path/to/skill.ts"` | 成功ヘッダーが表示される     | AC-5   |
| TC-FEEDBACK-007 | CompleteStep.tsx      | `skillPath = "/path/to/skill.ts"` | エラーボタンが表示されない   | AC-5   |

### テストコマンド

```bash
# CompleteStep のテストのみ実行
pnpm vitest run --reporter=verbose apps/desktop/src/renderer/components/skill/wizard/CompleteStep.test.tsx

# SkillCreateWizard のテストのみ実行
pnpm vitest run --reporter=verbose apps/desktop/src/renderer/components/skill/SkillCreateWizard.test.tsx

# 両ファイルをまとめて実行
pnpm vitest run --reporter=verbose \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.test.tsx \
  apps/desktop/src/renderer/components/skill/wizard/CompleteStep.test.tsx
```

---

## 7. リスクと対策

| リスク                                                                    | 影響度 | 発生確率 | 対策                                                                         |
| ------------------------------------------------------------------------- | ------ | -------- | ---------------------------------------------------------------------------- |
| `handleExecutePlan` と `handleGenerateTemplate` の2つに一貫した修正が必要 | 中     | 中       | Phase 1 で両関数の `fetchSkills` 呼び出し状況を網羅的に調査する              |
| `fetchSkills()` が失敗した場合のステップ遷移への影響                      | 中     | 低       | `fetchSkills()` 失敗時はログのみ・遷移は継続する設計を採用する               |
| `skillPath` null 検出タイミングと表示タイミングのフロー不整合             | 中     | 低       | Phase 2 設計でフロー図を作成し整合を確認する                                 |
| `CompleteStep.tsx` のUI変更によるスクリーンショットテストへの影響         | 低     | 中       | Phase 9 でスクリーンショットテストの更新が必要か確認し、必要に応じて更新する |
| `onRetry` props 追加による既存呼び出し箇所への型エラー伝播                | 中     | 中       | `onRetry?: () => void` のオプショナル定義で後方互換性を維持する              |

---

## 8. 参照情報

### 関連ドキュメント

| 資料名                               | パス                                                                  | 用途                           |
| ------------------------------------ | --------------------------------------------------------------------- | ------------------------------ |
| フィードバック修正詳細仕様書 Phase 1 | `docs/30-workflows/WB-par-02b-fix-feedback/phase-1-requirements.md`   | 要件定義・AC一覧               |
| フィードバック修正詳細仕様書 Phase 2 | `docs/30-workflows/WB-par-02b-fix-feedback/phase-2-design.md`         | 設計・コード例                 |
| フィードバック修正詳細仕様書 Phase 4 | `docs/30-workflows/WB-par-02b-fix-feedback/phase-4-test-creation.md`  | テストケース定義               |
| フィードバック修正詳細仕様書 Phase 5 | `docs/30-workflows/WB-par-02b-fix-feedback/phase-5-implementation.md` | 実装手順                       |
| バグ修正ウェーブ概要                 | `docs/30-workflows/skill-wizard-bugfix-wave/index.md`                 | 問題全体像（問題6・8・14・20） |

### 関連ファイル

| ファイルパス                                                         | 役割                               |
| -------------------------------------------------------------------- | ---------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`   | LLMモード `fetchSkills()` 追加対象 |
| `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx` | nullガード・条件表示修正対象       |

---

## 9. 備考

### 苦戦箇所

| 項目      | 内容                                                                                                                   |
| --------- | ---------------------------------------------------------------------------------------------------------------------- |
| 症状      | LLMモード完了後にスキル一覧が更新されず、失敗時に成功メッセージが表示されるため、ユーザーが状況を誤認する              |
| 原因1     | `handleExecutePlan` の成功パスに `fetchSkills()` が追加されていない（templateモードには存在するが不整合）              |
| 原因2     | `CompleteStep` が `skillPath` の値に関わらず成功ヘッダーを無条件でレンダリングしている                                 |
| 苦戦予測1 | `handleExecutePlan` と `handleGenerateTemplate` の2つの成功パスに一貫した `fetchSkills()` 追加が必要                   |
| 苦戦予測2 | `skillPath` null の検出タイミング（Step 3 遷移時）と表示タイミングのフロー整合性確認                                   |
| 苦戦予測3 | `CompleteStep.tsx` のUI変更によるスクリーンショットテストへの影響確認と更新                                            |
| 対応予定  | Phase 2 設計でフロー図を作成し、`fetchSkills()` と `setCurrentStep('complete')` の順序を確定する                       |
| 再発防止  | `handleExecutePlan` と `handleGenerateTemplate` の成功パスに「一覧更新は必須」のコメントを追加し、将来の抜け漏れを防ぐ |

### 発見経緯

スキルウィザード バグ修正ウェーブ（問題6・8・14・20）の中で、フィードバックループ欠如問題として
識別された。Wave Bタスクとして TASK-SW-FIX-DATAFLOW-001（Wave A）の完了後に並列実行可能な
独立したタスクとして分離した。

実装規模が小さく（2ファイル修正）、受け入れ基準（AC-1〜AC-5）が明確なため、
Wave B開始後に優先的に着手することを推奨する。
