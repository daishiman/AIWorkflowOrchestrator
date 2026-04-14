# Phase 12 成果物: 実装ガイド

## タスクID: TASK-SW-FIX-MODE-MGMT-001

---

## 1. 変更概要

スキルウィザードに存在した以下の3つの問題を Wave A（TASK-SW-FIX-DATAFLOW-001）で修正し、
本タスク（Wave B）でテスト TC-06 を追加・成果物を整備した。

### 修正した問題

| 問題番号 | 内容                                                                                      | 修正内容                                       |
| -------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 問題1    | Step 0 に仕様外のラジオボタン（テンプレート/LLM）が表示されていた                         | SkillInfoStep.tsx からラジオボタン JSX を削除  |
| 問題9    | generationMode / hasActivatedLlmMode の 2系統フラグが並存していた                         | 両 state を SkillCreateWizard.tsx から完全削除 |
| 問題10   | LLM モード選択時に handleGenerate が goToStep(2) を直接呼び出し Step 1 をスキップしていた | handleStep0Next を goNext() のみに修正         |

---

## 2. 修正前後のフロー比較

### 修正前

```
Step 0 → [ラジオ: テンプレート] → goToStep(2) → Step 2
       → [ラジオ: LLM] → handleGenerate → goToStep(2) → Step 2
                                         （Step 1 スキップ）
```

### 修正後

```
Step 0 → goNext() → Step 1（Q1〜Q6インタビュー）
                  → handleGenerate → goToStep(2) → Step 2（生成中）
                                                  → goToStep(3) → Step 3（完了）
```

---

## 3. 変更ファイル

| ファイル                     | 変更内容                                                            | 実施タスク         |
| ---------------------------- | ------------------------------------------------------------------- | ------------------ |
| `SkillCreateWizard.tsx`      | generationMode/hasActivatedLlmMode state 削除・handleStep0Next 修正 | Wave A             |
| `SkillInfoStep.tsx`          | ラジオボタン UI 削除・props 整理                                    | Wave A             |
| `SkillCreateWizard.test.tsx` | TC-06（旧フラグ残骸ゼロ確認）追加                                   | Wave B（本タスク） |

---

## 4. 後続開発者向け注意事項

### Wave C タスクへの引き継ぎ

- **TASK-SW-FIX-STATE-DETAIL-001**: Step 1（ConversationRoundStep）の詳細 UI 改善
- **TASK-SW-FIX-UI-001**: ウィザード全体の UI 品質改善
- 上記は本タスク完了後に着手可能

### テスト追加時の注意

- `SkillCreateWizard.test.tsx` の TC-01〜TC-06 が LLM 専用フロー検証の基盤
- テンプレートモード系のテストは全て削除済み（`generationMode` 参照を追加しないこと）
- `fireEvent` のみを使用すること（`userEvent` は happy-dom 環境では禁止）

### フロー追加時の注意

- `handleStep0Next` に分岐を追加する場合、Step 1 バイパスにならないよう注意
- `handleGenerate` は必ず Step 1（ConversationRoundStep.onGenerate）経由で呼び出すこと

---

## 5. テスト実行確認

```bash
pnpm --filter @repo/desktop exec vitest run \
  "src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx"

# 結果: Tests 36 passed (36) — 全件 PASS
```
