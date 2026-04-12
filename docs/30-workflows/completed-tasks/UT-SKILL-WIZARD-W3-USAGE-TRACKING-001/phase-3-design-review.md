# Phase 3: 設計レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase 番号 | 3                                     |
| Phase 名   | 設計レビューゲート                    |
| 前提 Phase | 2（設計）                             |
| 後続 Phase | 4（TDD Red：テスト作成）              |
| ステータス | 未実施                                |
| 作成日     | 2026-04-11                            |
| タスク ID  | UT-SKILL-WIZARD-W3-USAGE-TRACKING-001 |

---

## 目的

Phase 2 で設計した `skill_wizard_*` 型定義・計装ポイント実装方針・テスト戦略が、
Phase 4 以降の実装・テスト作業に進めるだけの品質を持つかを判定する。

判定結果が **PASS** または **MINOR** の場合に限り Phase 4 へ進む。
**MAJOR** または **CRITICAL** の場合は設計フェーズに差し戻す。

---

## レビュー観点

### 観点 1: 既存 trackEvent との型整合性

Phase 2 で設計した型定義が、既存の `SkillWizardEvents` 型と矛盾なく共存できるかを確認する。

- 既存イベント（`skill_wizard_started` 等 4 件）を削除していないか
- 新規 `skill_wizard_next_action` のペイロード型（`action: 'edit' | 'execute' | 'close'`）が既存型（`action: 'execute' | 'open_editor' | 'create_another'`）を上書きしており、旧型の呼び出し箇所を全て修正する計画が記載されているか
- `skill_wizard_open` / `skill_wizard_step_complete` / `skill_wizard_abandon` が既存キーと重複していないか
- `@repo/shared/types/skillCreator` からの `SkillCategory` import への影響がないか

### 観点 2: スタブパターンの一貫性

Phase 2 のテスト戦略が、既存テストコードのスタブ化パターンと一貫しているかを確認する。

- `vi.mock('../../utils/trackEvent', ...)` の import パスが `SkillCreateWizard.test.tsx` のディレクトリ位置から正しいか
  - 正しいパス: `'../../utils/trackEvent'`（`__tests__` → `skill` → `renderer` → `utils`）
- `vi.spyOn(console, 'info')` を使った dev 分岐テストが既存スタブ化パターンと整合しているか
- `beforeEach(() => vi.clearAllMocks())` が全テストスイートで使用されているか

### 観点 3: abandon イベントの発火タイミング制御

`isCompletedRef` / `currentStepRef` の設計が、React の `useEffect` クリーンアップの実行タイミングに対して正しいかを確認する。

- `useEffect` のクリーンアップ関数が React の StrictMode で 2 回実行される問題への対処が設計されているか
- `currentStepRef.current` の更新タイミング（各 `trackEvent('skill_wizard_step_complete', ...)` 後）が正しいか
- Step 3 に到達したとき（`isCompletedRef.current = true` を設定するタイミング）が `CompleteStep` の表示直前か確認されているか

### 観点 4: Breaking Change の検証

旧 `skill_wizard_next_action` ペイロード型（`action: 'execute' | 'open_editor' | 'create_another'`）を使用している全ての呼び出し箇所が特定されており、Phase 5 での修正計画が明記されているかを確認する。

- `grep -rn "skill_wizard_next_action" apps/desktop/src/renderer/` の実行結果が Phase 2 成果物に含まれているか
- 修正が必要な呼び出し箇所の数と場所が記録されているか

---

## 判定基準

| 判定     | 定義                                                                                         |
| -------- | -------------------------------------------------------------------------------------------- |
| PASS     | 全チェックリスト項目が問題なし。Phase 4 へ進む。                                             |
| MINOR    | 軽微な不備（ドキュメント記述漏れ・コメント不足等）がある。Phase 4 へ進みながら修正する。     |
| MAJOR    | 設計の根幹に問題がある（型定義の矛盾・abandon 制御の欠陥等）。Phase 2 に差し戻す。           |
| CRITICAL | 前提条件（W2-seq-03a / W2-seq-03b の完了）が満たされていない。Phase 1 または外部依存を確認。 |

---

## 戻り先決定基準テーブル

| 問題の種類                                           | 判定     | 戻り先                            |
| ---------------------------------------------------- | -------- | --------------------------------- |
| 既存イベントを誤って削除している                     | MAJOR    | Phase 2                           |
| 新規型定義のペイロードが AC と不一致                 | MAJOR    | Phase 2                           |
| abandon の `useRef` 設計に根本的な欠陥               | MAJOR    | Phase 2                           |
| 旧 `skill_wizard_next_action` の呼び出し箇所が未特定 | MAJOR    | Phase 2                           |
| テスト戦略のモックパスが不正                         | MAJOR    | Phase 2                           |
| ドキュメントの記述漏れ（型名ミス等）                 | MINOR    | Phase 4 で修正しながら継続        |
| W2-seq-03a が未完了                                  | CRITICAL | 外部依存の解消を待つ              |
| AC の定義と Phase 2 設計内容が不一致                 | MAJOR    | Phase 2（場合によっては Phase 1） |

---

## チェックリスト

### 型定義整合性

- [ ] `SkillWizardEvents` に `skill_wizard_open` が追加されている（ペイロード: `{ source: 'lifecycle_panel' | 'direct' }`）
- [ ] `SkillWizardEvents` に `skill_wizard_step_complete` が追加されている（ペイロード: `{ step: number; stepName: string }`）
- [ ] `SkillWizardEvents` の `skill_wizard_next_action` が新ペイロード型（`{ action: 'edit' | 'execute' | 'close' }`）に更新されている
- [ ] `SkillWizardEvents` に `skill_wizard_abandon` が追加されている（ペイロード: `{ lastStep: number }`）
- [ ] 既存 4 イベント（`skill_wizard_started` / `skill_wizard_step1_completed` / `skill_wizard_generation_completed` / `skill_skeleton_quality_feedback`）が型定義に残っている

### スタブパターン確認

- [ ] `vi.mock` の import パスが正しい（各テストファイルのディレクトリ位置から相対パスで検証済み）
- [ ] dev 環境の `console.info` 分岐テスト方法が文書化されている
- [ ] prod 環境の no-op 分岐テスト方法が文書化されている
- [ ] `beforeEach(() => vi.clearAllMocks())` の使用方針が記載されている

### Breaking Change 検証

- [ ] 旧 `skill_wizard_next_action` の全呼び出し箇所が特定されている（grep 結果が Phase 2 成果物に含まれている）
- [ ] 各呼び出し箇所の修正内容（旧アクション値 → 新アクション値のマッピング）が記載されている
- [ ] Phase 5 での修正計画が明記されている

### React useEffect 設計確認

- [ ] `isCompletedRef`（`useRef<boolean>(false)`）の初期化・更新・参照箇所が設計されている
- [ ] `currentStepRef`（`useRef<number>(0)`）の初期化・更新・参照箇所が設計されている
- [ ] React StrictMode での二重実行への対処方針が記載されている（または問題なしの根拠が示されている）

---

## 完了条件

- [ ] 全チェックリスト項目を確認し、判定（PASS / MINOR / MAJOR / CRITICAL）を決定した
- [ ] 判定結果を本 Phase の成果物（`outputs/phase-3/review-result.md`）に記録した
- [ ] MAJOR / CRITICAL の場合、差し戻し先 Phase と修正指示を具体的に記述した
- [ ] PASS または MINOR の場合、Phase 4 への進行許可を明記した

---

## 成果物

| 成果物ファイル                     | 内容                                                                  |
| ---------------------------------- | --------------------------------------------------------------------- |
| `outputs/phase-3/review-result.md` | 判定結果（PASS/MINOR/MAJOR/CRITICAL）・各観点の確認記録・次アクション |

---

## Phase 末端アクション【必須】

- [ ] 本 Phase 内の全チェックリスト項目を確認完了
- [ ] 判定結果を `outputs/phase-3/review-result.md` に記録
- [ ] 判定が PASS または MINOR であることを確認してから Phase 4 に進む
- [ ] `artifacts.json` の Phase 3 ステータスを `completed` に更新
