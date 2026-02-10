# SKILL_EXECUTE ハンドラー実行パス修正 - タスク指示書

## メタ情報

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| タスクID     | TASK-FIX-15-1-EXECUTE-HANDLER-ROUTING      |
| タスク名     | SKILL_EXECUTEハンドラーのSkillExecutor委譲 |
| 分類         | バグ修正（構造的断絶）                     |
| 対象機能     | IPCハンドラー（skillHandlers.ts）          |
| 優先度       | 最高                                       |
| 見積もり規模 | 小規模                                     |
| ステータス   | 未実施                                     |
| 実行順序     | 03a（並列可能 — グループ01c+02a完了後）    |
| 発見元       | skill-system-conflict-report #15           |
| 発見日       | 2026-02-05                                 |
| 関連Phase    | Phase 0（構造的断絶の解消）                |
| 関連Issue    | -                                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Claude Agent SDK の `query()` API を使用したスキル実行機能は、`SkillExecutor` クラスに完全実装済み（ストリーミング、Hooks、リトライ、AbortController統合）。しかし、IPCハンドラーの実行パスが `SkillService.executeSkill()`（スタブ）を呼び出しており、`SkillExecutor.execute()` には一度も到達しない。

### 1.2 問題点・課題

| 問題                                           | 影響                              |
| ---------------------------------------------- | --------------------------------- |
| SKILL_EXECUTE ハンドラーが SkillService を呼ぶ | SDK統合コードが一度も実行されない |
| SkillExecutor は abort/getStatus にのみ使用    | execute() メソッドが完全に孤立    |
| SkillService.executeSkill() が固定文字列を返却 | スキル実行が常にスタブ結果を返す  |

**現在の呼び出しチェーン**:

```
SKILL_EXECUTE handler (skillHandlers.ts L195)
  → skillService.executeSkill(args.skillId, args.params)
    → SkillService.executeSkill() (L214-216)
      → return `Skill "${skill.name}" executed successfully`  ← スタブ
```

**期待される呼び出しチェーン**:

```
SKILL_EXECUTE handler (skillHandlers.ts L195)
  → skillService.validateSkill(skillId)  ← バリデーションは保持
  → _skillExecutorInstance.execute(request, skill)
    → callSDKQuery() → SDK query() API
```

### 1.3 放置した場合の影響

- **致命的**: #1〜#14 を全て修正しても、本タスクが未完了ならSDKベースのスキル実行は一切動作しない
- SkillExecutor の1435行のコードが完全に無駄になる
- E2Eテストが不可能

---

## 2. 何を達成するか（What）

### 2.1 目的

SKILL_EXECUTE ハンドラーの実行パスを SkillService（スタブ）から SkillExecutor（SDK統合）に切り替える。

### 2.2 最終ゴール

1. SKILL_EXECUTE ハンドラーが `_skillExecutorInstance.execute()` を呼び出す
2. SkillService のバリデーションロジック（スキル存在確認・インポート状態確認）は保持
3. SkillService.executeSkill() メソッドの削除またはdeprecation

### 2.3 スコープ

#### 含むもの

- `skillHandlers.ts` の SKILL_EXECUTE ハンドラー修正
- バリデーションとSDK実行の責務分離
- SkillService.executeSkill() の廃止

#### 含まないもの

- SkillExecutor 内部ロジックの変更（#16 で対応）
- 引数形式の統一（TASK-FIX-5-1 で対応）
- 新規IPC APIの追加

### 2.4 成果物

| 成果物                      | 説明                                      |
| --------------------------- | ----------------------------------------- |
| 修正された skillHandlers.ts | execute ハンドラーが SkillExecutor を使用 |
| 修正された SkillService.ts  | executeSkill 削除または deprecation       |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-FIX-16-1-SDK-APIKEY-INFRASTRUCTURE 完了（APIキーがないとSDK呼び出しが失敗）

### 3.2 依存タスク

- TASK-FIX-16-1-SDK-APIKEY-INFRASTRUCTURE（APIキー基盤）

### 3.3 必要な知識

- Electron IPC ハンドラー
- SkillExecutor.execute() のインターフェース
- SkillService のバリデーションロジック

### 3.4 推奨アプローチ

1. SkillService からバリデーションロジックを抽出
2. SKILL_EXECUTE ハンドラーで: バリデーション → SkillExecutor.execute() の順で呼び出し
3. SkillService.executeSkill() を削除

---

## 4. 実行手順

### Step 1: 現在の実行パス分析

#### 目的

ハンドラー → SkillService → SkillExecutor の依存関係を正確に把握

#### 手順

1. `skillHandlers.ts` L179-208 の SKILL_EXECUTE ハンドラーを分析
2. `SkillService.executeSkill()` L192-235 のバリデーションロジックを特定
3. `SkillExecutor.execute()` のインターフェースを確認
4. 引数の変換が必要か判断

### Step 2: ハンドラー修正

#### 目的

実行パスを SkillExecutor に切り替え

#### 手順

1. SkillService のバリデーションを直接ハンドラーで呼び出し（`skillService.getSkill()` + `skillService.isImported()` 等）
2. バリデーション通過後に `_skillExecutorInstance.execute(request, skill)` を呼び出し
3. SkillService.executeSkill() への参照を削除

### Step 3: テスト・検証

#### 手順

1. 既存の skillHandlers テストを修正
2. SkillExecutor.execute() が呼ばれることを検証するテスト追加
3. バリデーション失敗時に SkillExecutor が呼ばれないことを検証

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] SKILL_EXECUTE ハンドラーが `_skillExecutorInstance.execute()` を呼び出す
- [ ] スキル存在確認・インポート状態確認のバリデーションが動作する
- [ ] SkillService.executeSkill() が削除されている

### 品質要件

- [ ] 全テストが PASS
- [ ] 型安全性が確保されている

---

## 6. 検証方法

### テストケース

1. 存在するスキルの実行 → SkillExecutor.execute() が呼ばれる
2. 存在しないスキルの実行 → バリデーションエラー
3. 未インポートスキルの実行 → バリデーションエラー
4. abort/getStatus が引き続き動作する

---

## 7. リスクと対策

| リスク                             | 影響度 | 発生確率 | 対策                                     |
| ---------------------------------- | ------ | -------- | ---------------------------------------- |
| 引数形式の不一致でランタイムエラー | 高     | 高       | TASK-FIX-5-1 との連携、IPC Contract 定義 |
| APIキー不在で SDK 呼び出し失敗     | 高     | 高       | TASK-FIX-16-1 を前提条件とする           |
| SkillService のバリデーション欠落  | 中     | 低       | バリデーションロジックの単体テスト       |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/skill-import-agent-system/specification.md` §5.1（実行エンジン）
- `docs/30-workflows/skill-import-agent-system/technical-decisions.md` §5（スキル実行設計）
- `apps/desktop/src/main/ipc/skillHandlers.ts` L179-208
- `apps/desktop/src/main/services/skill/SkillExecutor.ts`
- `apps/desktop/src/main/services/skill/SkillService.ts` L192-235

### 関連タスク

- TASK-FIX-16-1-SDK-APIKEY-INFRASTRUCTURE（前提）
- TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION（本タスクと統合可能）

---

## 9. 備考

### 発見経緯

垂直思考（SKILL_EXECUTE ハンドラーの呼び出しチェーンを末端まで追跡）により発見。SkillExecutor が abort/getStatus にしか使われていない事実は、コードの表面的な grep では見落としやすい。

### クリティカルパス上の位置

本タスクはクリティカルパスB（SDK基盤→ルーティング）の終端に位置する。パスA（型→IPC→E2E）の #3（Preloadスタブ解消）と本タスクの両方が完了しないと、Layer 3（#7 E2Eスモークテスト）に進めない。
