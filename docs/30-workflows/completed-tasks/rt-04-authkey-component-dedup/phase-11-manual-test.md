# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 11                            |
| 機能名 | rt-04-authkey-component-dedup |
| 作成日 | 2026-04-06                    |

## 目的

UI task（AuthKeySection の UI 変更・onStatusChange props 追加あり）として、
実装後の動作を3層評価（Semantic / Visual / AI UX）で確認する。
CI 環境など実地操作が不可の場合は NON_VISUAL として自動テスト結果を証跡とする。

---

## NON_VISUAL 判定の基準

**本タスクの分類: UI task**

- AuthKeySection は UI コンポーネントであり onStatusChange props 追加という UI 変更あり
- スクリーンショット撮影が可能な環境では **Visual 層**を実施する
- CI 環境・Electron 起動不可の環境では **NON_VISUAL** として自動テスト結果を証跡とする

**NON_VISUAL を選択した場合の必須対応（Feedback 4 準拠）:**

- `outputs/phase-11/manual-test-result.md` に以下を必ず記載する:
  - 証跡の主ソース（自動テスト名・件数）
  - スクリーンショットを作成しない理由（環境理由を具体的に記述）

---

## 実行タスク

### タスク1: NON_VISUAL / Visual 判定

以下のチェックを行い、実施方式を決定する。

| 確認項目                            | 結果 |
| ----------------------------------- | ---- |
| Electron アプリを起動できる環境か   | -    |
| SettingsView を手動操作できる環境か | -    |
| スクリーンショット取得が可能か      | -    |

**判定結果: （Visual / NON_VISUAL）**

> NON_VISUAL を選択した場合はタスク2〜4 の代わりにタスク5 を実行する。

---

### タスク2: Semantic 層評価（共通・必須）

DOM 構造・aria-label・data-testid を確認する。

```bash
# AuthKeySection の data-testid 確認
grep -n "data-testid" \
  apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx

# onStatusChange の呼び出し箇所確認
grep -n "onStatusChange" \
  apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx

# ApiKeySettingsPanel の委譲確認
grep -n "AuthKeySection\|onStatusChange" \
  apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx
```

**確認テーブル:**

| 確認項目                                     | 期待値                      | 実測値 | 判定 |
| -------------------------------------------- | --------------------------- | ------ | ---- |
| `AuthKeySection` に `data-testid` あり       | あり                        | -      | -    |
| `onStatusChange` が props から呼び出される   | コールバック実行あり        | -      | -    |
| `ApiKeySettingsPanel` が委譲実装になっている | AuthKeySection への委譲あり | -      | -    |

---

### タスク3: Visual 層評価（Visual 判定時のみ実施）

Electron アプリを起動してスクリーンショットを取得する。

**手順:**

```bash
# Electron 開発サーバー起動
pnpm --filter @repo/desktop dev
```

1. SettingsView を開き AuthKeySection が表示されることを確認
2. API キーを入力して「保存」ボタンをクリックする
3. ステータスが「設定済み」に変わることをスクリーンショットで記録する
4. SkillLifecyclePanel を開き ApiKeySettingsPanel（委譲後）が表示されることを確認

**スクリーンショット保存先:**

| 確認項目                                          | ファイル名                                      |
| ------------------------------------------------- | ----------------------------------------------- |
| SettingsView - AuthKeySection（初期状態）         | `outputs/phase-11/screenshots/01-initial.png`   |
| APIキー入力後・保存ボタンクリック直後             | `outputs/phase-11/screenshots/02-saving.png`    |
| 保存完了後のステータス表示                        | `outputs/phase-11/screenshots/03-saved.png`     |
| SkillLifecyclePanel - ApiKeySettingsPanel（委譲） | `outputs/phase-11/screenshots/04-delegated.png` |

---

### タスク4: AI UX 層評価（Visual 判定時のみ実施）

操作フローの一貫性を確認する。

| シナリオ                                                                      | 期待する動作                                 | 確認結果 |
| ----------------------------------------------------------------------------- | -------------------------------------------- | -------- |
| SettingsView から AuthKeySection で API キーを設定できる                      | APIキー入力 → 保存 → ステータス「設定済み」  | -        |
| SettingsView から AuthKeySection で API キーを削除できる                      | 削除ボタンクリック → ステータス「未設定」    | -        |
| SkillLifecyclePanel から ApiKeySettingsPanel（委譲後）で API キーを設定できる | 同上フローが委譲経由で動作する               | -        |
| `onStatusChange` が呼び出されてステータスが伝播する                           | 親コンポーネントにステータス変更が通知される | -        |

---

### タスク5: NON_VISUAL 証跡取得（NON_VISUAL 判定時のみ実施）

自動テスト結果を証跡として取得・記録する。

```bash
# verbose モードでテスト実行し証跡を取得
pnpm --filter @repo/desktop test -- --reporter=verbose 2>&1 \
  | grep -E "PASS|FAIL|✓|✗"
```

**証跡記録テーブル:**

| 証跡項目                     | 内容 |
| ---------------------------- | ---- |
| テストスイート名             | -    |
| PASS 件数                    | -    |
| FAIL 件数                    | -    |
| カバーするシナリオ           | -    |
| スクリーンショット不実施理由 | -    |

---

### タスク6: 手動テスト総合判定

| 評価層          | 実施方式             | 判定 | 備考 |
| --------------- | -------------------- | ---- | ---- |
| Semantic 層     | 必須（全ケース実施） | -    |      |
| Visual 層       | Visual 時のみ        | -    |      |
| AI UX 層        | Visual 時のみ        | -    |      |
| NON_VISUAL 証跡 | NON_VISUAL 時のみ    | -    |      |

**総合判定: （PASS / FAIL）**

---

## 参照資料

| 参照資料             | パス                                                                     | 内容                            |
| -------------------- | ------------------------------------------------------------------------ | ------------------------------- |
| システム仕様         | `.claude/skills/aiworkflow-requirements/references/`                     | AIWorkflowOrchestrator 正本仕様 |
| 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)                       | AC-3（onStatusChange）          |
| 最終レビュー結果     | [phase-10-final-review.md](phase-10-final-review.md)                     | AC 判定記録                     |
| AuthKeySection       | `apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx` | 対象 UI コンポーネント          |
| ApiKeySettingsPanel  | `apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx`     | 委譲後コンポーネント            |
| useAuthKeyManagement | `apps/desktop/src/renderer/hooks/useAuthKeyManagement.ts`                | 共通フック                      |

---

## 統合テスト連携【必須】

| 判定項目                      | 基準                                                      | 確認方法                           |
| ----------------------------- | --------------------------------------------------------- | ---------------------------------- |
| Semantic 層: DOM 構造         | data-testid・onStatusChange 呼び出し確認                  | タスク2 確認テーブル               |
| Visual 層: スクリーンショット | Visual 時のみ・4枚取得                                    | タスク3 スクリーンショット一覧     |
| AI UX 層: 操作フロー確認      | Visual 時のみ・4シナリオ全確認                            | タスク4 評価テーブル               |
| NON_VISUAL 証跡               | NON_VISUAL 時のみ・証跡メタ必須                           | タスク5 証跡記録テーブル           |
| manual-test-result.md 作成    | NON_VISUAL の場合は証跡メタ（テスト名・件数・理由）を必記 | `outputs/phase-11/` 配下のファイル |

---

## 成果物

| 成果物               | パス                                     | 説明                                                 |
| -------------------- | ---------------------------------------- | ---------------------------------------------------- |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md` | Semantic/Visual/AI UX または NON_VISUAL 証跡         |
| スクリーンショット群 | `outputs/phase-11/screenshots/`          | Visual 時のみ（NON_VISUAL の場合はディレクトリ不要） |

---

## 完了条件

- [ ] NON_VISUAL / Visual 判定完了（タスク1）
- [ ] Semantic 層評価完了（タスク2）
- [ ] Visual 層評価完了（Visual 時のみ、タスク3）
- [ ] AI UX 層評価完了（Visual 時のみ、タスク4）
- [ ] NON_VISUAL 証跡取得完了（NON_VISUAL 時のみ、タスク5）
- [ ] 手動テスト総合判定完了（タスク6）
- [ ] `outputs/phase-11/manual-test-result.md` 作成済み（NON_VISUAL の場合は証跡メタ必須）
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## タスク100%実行確認【必須】

| タスク                               | 完了 |
| ------------------------------------ | ---- |
| タスク1: NON_VISUAL / Visual 判定    | [ ]  |
| タスク2: Semantic 層評価             | [ ]  |
| タスク3: Visual 層評価（条件付き）   | [ ]  |
| タスク4: AI UX 層評価（条件付き）    | [ ]  |
| タスク5: NON_VISUAL 証跡（条件付き） | [ ]  |
| タスク6: 手動テスト総合判定          | [ ]  |

---

## 次のPhase

Phase 12: ドキュメント更新（[phase-12-documentation.md](phase-12-documentation.md)）

**手動テスト総合判定が PASS の場合のみ Phase 12 へ進むこと。**
