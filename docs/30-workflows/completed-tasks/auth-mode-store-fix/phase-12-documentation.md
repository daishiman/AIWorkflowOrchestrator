# Phase 12: ドキュメント更新

## メタ情報

| 項目     | 値                                   |
| -------- | ------------------------------------ |
| Phase    | 12                                   |
| タスクID | UT-FIX-STORE-HOOKS-INFINITE-LOOP-001 |
| タスク名 | Zustand Store Hooks無限ループ修正    |
| 親タスク | UT-AUTH-MODE-UI-001                  |
| 作成日   | 2026-02-10                           |
| 状態     | **未着手**                           |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

---

## Task 1: 実装ガイド作成【必須】

### Part 1: 概念的説明（中学生レベル）

#### Zustand Store Hooksの無限ループとは？

**日常生活での例え:**

お母さんに「部屋を片付けなさい」と言われたとします。あなたは部屋を片付け始めますが、片付けるたびに「部屋を片付けなさい」と言われ続けたらどうなるでしょう？

1. 部屋を片付ける
2. お母さんに「片付けなさい」と言われる
3. また片付ける
4. また「片付けなさい」と言われる
5. これが永遠に続く...

これが**無限ループ**です。

**今回の問題:**

アプリでも同じことが起きていました:

1. 設定画面を開く
2. 「認証方式を初期化しなさい」という指示が出る
3. 初期化する
4. 「初期化の指示が変わった」とReactが判断
5. また「認証方式を初期化しなさい」という指示が出る
6. これが永遠に続く（ローディングがぐるぐる）

**なぜ「指示が変わった」と判断されたの？**

```
毎回新しい指示書を渡していた（内容は同じでも紙が違う）
→ Reactは「新しい指示だ！」と判断
→ また実行する
→ また新しい指示書が来る
→ 無限ループ
```

**修正方法:**

「初期化は1回だけでいいよ」というメモ（useRef）を用意しました:

```
1回目: メモに「まだやってない」と書いてある → 初期化を実行 → メモを「やった」に更新
2回目以降: メモに「やった」と書いてある → 何もしない
```

### Part 2: 技術的詳細

#### 問題の根本原因

Zustand Store Hooksがオブジェクトを返す際、毎回新しい参照を生成していた:

```typescript
// 問題のあるパターン（store/index.ts:318-338）
export const useAuthModeStore = () =>
  useAppStore((state) => ({
    mode: state.mode,
    status: state.status,
    initializeAuthMode: state.initializeAuthMode, // ← 毎回新しいオブジェクト参照
    // ...
  }));
```

このHookを使用するコンポーネントで:

```typescript
// 問題のあるパターン（SettingsView/index.tsx）
const { initializeAuthMode } = useAuthModeStore();

useEffect(() => {
  initializeAuthMode(); // 初期化を実行
}, [initializeAuthMode]); // ← initializeAuthModeは毎回新しい参照
// → useEffectが毎回再実行
// → 無限ループ
```

#### 修正パターン

**useRefによる初期化ガード:**

```typescript
// 修正後のパターン
const { initializeAuthMode } = useAuthModeStore();
const initRef = useRef(false);

useEffect(() => {
  if (!initRef.current) {
    initRef.current = true; // 一度だけ実行フラグを立てる
    initializeAuthMode();
  }
}, []); // 依存配列は空（マウント時のみ実行）
```

**なぜuseRefを使うのか:**

| 手法           | 問題点                                                         |
| -------------- | -------------------------------------------------------------- |
| `useState`     | 状態変更で再レンダリングが発生                                 |
| グローバル変数 | コンポーネント間で共有されてしまう                             |
| `useRef`       | 再レンダリングを起こさず、コンポーネントインスタンスごとに独立 |

#### 影響を受けたコンポーネント

| コンポーネント   | 修正内容                  | 修正理由                                 |
| ---------------- | ------------------------- | ---------------------------------------- |
| SettingsView     | useRefガード追加          | initializeAuthModeの無限実行防止         |
| LLMSelectorPanel | useRefガード追加          | fetchProviders/checkHealthの無限実行防止 |
| SkillSelector    | useCallback依存配列見直し | selectSkillByName/rescanSkillsの安定化   |

#### 長期的な改善案（将来タスク）

現在の修正は短期対策。長期的にはStore Hooksを個別セレクタベースに再設計すべき:

```typescript
// 現在の問題あるパターン
export const useAuthModeStore = () =>
  useAppStore((state) => ({ ... }));  // 毎回新しいオブジェクト

// 推奨される改善案
export const useAuthMode = () => useAppStore((state) => state.mode);
export const useAuthModeStatus = () => useAppStore((state) => state.status);
export const useInitializeAuthMode = () => useAppStore((state) => state.initializeAuthMode);
// ... 個別セレクタとして定義
```

---

## Task 2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

### Step 1-A: タスク完了記録【必須・全タスク】

| 項目     | 更新内容                                        | ステータス |
| -------- | ----------------------------------------------- | ---------- |
| 仕様書   | 06-known-pitfalls.mdに新規Pitfall追加           | [ ] 未完了 |
| LOGS.md  | aiworkflow-requirements/LOGS.mdにエントリ追加   | [ ] 未完了 |
| LOGS.md  | task-specification-creator/LOGS.mdに記録追加    | [ ] 未完了 |
| SKILL.md | aiworkflow-requirements/SKILL.md変更履歴更新    | [ ] 未完了 |
| SKILL.md | task-specification-creator/SKILL.md変更履歴更新 | [ ] 未完了 |

#### 追加するPitfall（06-known-pitfalls.md）

```markdown
### P31: Zustand Store Hooksのオブジェクト返却による無限ループ

- **教訓**: Zustand Store Hooksがオブジェクトを返す場合、毎回新しい参照が生成される。
  これを`useEffect`の依存配列に含めると無限ループが発生する
- **解決策**:
  1. 短期: `useRef`で初期化を1回だけ実行するガードを追加
  2. 長期: Store Hooksを個別セレクタベースに再設計
- **ルール**: [03-state-management.md#Zustand設計原則](./03-state-management.md)
- **関連タスク**: UT-FIX-STORE-HOOKS-INFINITE-LOOP-001
```

### Step 1-B: 実装状況テーブル更新【実装完了時は必須】

| 項目                                     | 確認結果                                        |
| ---------------------------------------- | ----------------------------------------------- |
| api-endpoints.md等に「実装状況」テーブル | 該当なし（本タスクはバグ修正のためAPI追加なし） |

**判定**: 該当なし

### Step 1-C: 関連タスクテーブル更新【該当する場合は必須】

```bash
# 検索コマンド
grep -rn "UT-FIX-STORE-HOOKS-INFINITE-LOOP" .claude/skills/aiworkflow-requirements/references/
grep -rn "TASK-AUTH-MODE-SELECTION-001" .claude/skills/aiworkflow-requirements/references/
```

| 確認ファイル             | 検索結果               | 更新必要   |
| ------------------------ | ---------------------- | ---------- |
| arch-state-management.md | 関連タスクテーブル確認 | [ ] 確認中 |
| ui-ux-settings.md        | 該当なし               | [ ] 確認中 |
| 06-known-pitfalls.md     | 新規Pitfall追加        | [ ] 要更新 |

### Step 1-D: topic-map.md 再生成【該当する場合】

```bash
# topic-map.md再生成
cd .claude/skills/aiworkflow-requirements && node generate-index.js
```

| 項目                   | 確認結果             |
| ---------------------- | -------------------- |
| 新規仕様書追加         | なし                 |
| 既存仕様書への内容追加 | 06-known-pitfalls.md |
| topic-map.md再生成必要 | [ ] 確認中           |

### Step 2: システム仕様更新【条件付き】

**更新要否判断:**

| 変更内容                 | 更新必要か | 理由                     |
| ------------------------ | ---------- | ------------------------ |
| useRefガードパターン追加 | 該当なし   | 内部実装の変更のみ       |
| Store Hooks使用方法      | 該当なし   | インターフェース変更なし |
| 06-known-pitfalls.md     | 必要       | 新規Pitfall追加          |

**更新対象:**

- `.claude/rules/06-known-pitfalls.md`
  - P31: Zustand Store Hooksのオブジェクト返却による無限ループ を追記

---

## Task 3: ドキュメント更新履歴【必須】

### documentation-changelog.md

| 更新対象ドキュメント | 変更種別 | 変更内容                                         |
| -------------------- | -------- | ------------------------------------------------ |
| 06-known-pitfalls.md | 追加     | P31: Zustand Store Hooksの無限ループPitfall追加  |
| LOGS.md (両方)       | 追加     | UT-FIX-STORE-HOOKS-INFINITE-LOOP-001完了エントリ |
| SKILL.md (両方)      | 追加     | 変更履歴テーブル更新                             |

---

## Task 4: 未タスク検出【必須】

### 検出ソース確認

| #   | ソース                   | 確認結果   |
| --- | ------------------------ | ---------- |
| 1   | Phase 3レビュー結果      | [ ] 確認中 |
| 2   | Phase 10レビュー結果     | [ ] 確認中 |
| 3   | Phase 11手動テスト結果   | [ ] 確認中 |
| 4   | 各Phase成果物            | [ ] 確認中 |
| 5   | コードベースのTODO/FIXME | [ ] 確認中 |

### 未タスク検出コマンド

```bash
# コードベースのTODO/FIXME検索
grep -rn "TODO\|FIXME" apps/desktop/src/renderer/store/
grep -rn "TODO\|FIXME" apps/desktop/src/renderer/views/SettingsView/
grep -rn "TODO\|FIXME" apps/desktop/src/renderer/components/llm/
grep -rn "TODO\|FIXME" apps/desktop/src/renderer/components/skill/
```

### 想定される未タスク

| 未タスクID                  | 内容                                    | 優先度 | 検出元                  |
| --------------------------- | --------------------------------------- | ------ | ----------------------- |
| UT-STORE-HOOKS-REFACTOR-001 | Store Hooksを個別セレクタベースに再設計 | 中     | タスク仕様書セクション8 |

### 未タスク管理3ステップ【必須】

検出した未タスクは以下の3ステップを全て完了すること:

1. [ ] `unassigned-task/` に指示書作成
2. [ ] `task-workflow.md` 残課題テーブルに登録
3. [ ] 関連仕様書に参照リンク追加

---

## 統合テスト連携【必須】

本Phaseはドキュメント作成のため、統合テスト連携は実行対象外。
ただし、Phase 11で以下の統合テスト観点が手動確認される:

| テスト観点 | 確認内容                             |
| ---------- | ------------------------------------ |
| Store動作  | useRefガードによる初期化1回実行      |
| UI動作     | 無限ループなしでの正常表示           |
| IPC連携    | LLMプロバイダー/スキル取得の正常動作 |

---

## 成果物

| 成果物               | パス                                          | 必須 | ステータス |
| -------------------- | --------------------------------------------- | ---- | ---------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`    | 必須 | [ ] 未完了 |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md` | 必須 | [ ] 未完了 |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`  | 必須 | [ ] 未完了 |

---

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明 - 日常例え必須）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] **【Task 2 Step 1-A】06-known-pitfalls.mdにP31を追加した**
- [ ] **【Task 2 Step 1-A】aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加した**
- [ ] **【Task 2 Step 1-A】task-specification-creator/LOGS.mdにタスク完了記録を追加した**
- [ ] **【Task 2 Step 1-A】aiworkflow-requirements/SKILL.md変更履歴を更新した**
- [ ] **【Task 2 Step 1-A】task-specification-creator/SKILL.md変更履歴を更新した**
- [ ] **【Task 2 Step 1-B】実装状況テーブル更新を確認した（該当なし）**
- [ ] **【Task 2 Step 1-C】関連タスクテーブルをGrepで確認した**
- [ ] **【Task 2 Step 1-D】topic-map.md再生成要否を確認した**
- [ ] **未タスク検出レポートが出力されている（0件でも必須）**
- [ ] **検出した未タスクは3ステップ全完了**
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 13: 完了・PR準備
