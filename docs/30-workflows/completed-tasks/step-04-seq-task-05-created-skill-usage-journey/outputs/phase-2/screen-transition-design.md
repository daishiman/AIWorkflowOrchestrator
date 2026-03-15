# Phase 2 画面遷移設計

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| タスクID   | TASK-SKILL-LIFECYCLE-05    |
| タスク名   | 作成済みスキルを使う主導線 |
| Phase      | 2                          |
| 成果物種別 | 画面遷移設計               |
| 作成日     | 2026-03-15                 |

## 1. 導線方針

### 1.1 基本原則

- **Workspace → Agent 二段構成**: Workspace で文脈準備（ファイル接続・パラメータ設定）、Agent で実行本体を担当する
- **推奨経路は Workspace 経由**: 文脈統合が必要な場合は Workspace を経由する。文脈不要時は省略経路で Agent に直接遷移する
- **Task01 画面責務の厳守**: Workspace は最終実行判断をしない。Agent は探索一覧を持たない

### 1.2 経路定義

| 経路種別 | パス                                         | 用途                     |
| -------- | -------------------------------------------- | ------------------------ |
| 推奨経路 | Skill Center / Creator → Workspace → Agent   | 文脈準備が必要な標準利用 |
| 省略経路 | Skill Center / Creator → Agent               | 文脈不要時の直接利用     |
| 履歴経路 | Agent 履歴タブ → Agent（再実行）             | 過去パラメータでの再実行 |
| 改善経路 | Agent 実行結果 → SkillAnalysisView → Creator | 品質改善フロー           |

## 2. シナリオA: 作成直後に使う（Immediate Use）

### 2.1 画面遷移フロー

```
[Skill Creator 完了]
    |
    v
[EP-1 採点完了画面]
    |
    v
[ScoringGate 判定]
    |
    +--- RECOMMENDED (100) ─────────────────────────────+
    |                                                    |
    +--- USE_ALLOWED (80-99) ───────────────────────────+
    |                                                    |
    |   「今すぐ使う」CTA (Primary)                      |
    |       |                                            |
    |       +-- 推奨経路 → [Workspace]                   |
    |       |                  |                         |
    |       |                  v                         |
    |       |              スキル自動選択                |
    |       |              文脈準備(ファイル接続)         |
    |       |              EP-3 利用前評価バナー         |
    |       |                  |                         |
    |       |                  v                         |
    |       |              [Agent] ← 省略経路で直接合流  |
    |       |                  |                         |
    |       +-- 省略経路 ──────+                         |
    |                          |                         |
    |                          v                         |
    |                      [実行完了]                    |
    |                          |                         |
    |                          v                         |
    |                   [実行結果サマリー]               |
    |                          |                         |
    |                          +-- 「もう一度使う」→ Agent 再実行
    |                          +-- 「改善する」→ SkillAnalysisView
    |                          +-- 「完了」→ 履歴記録
    |                          +-- 「terminalで続ける」→ Terminal Dock
    |
    +--- SAVE_ALLOWED (60-79) ──────────────────────────+
    |                                                    |
    |   「保存して後で使う」CTA (Primary)                 |
    |       |                                            |
    |       v                                            |
    |   [Skill Center に保存]                            |
    |       → 保存完了トースト表示                       |
    |       → 改善推奨バナー表示                         |
    |       → シナリオB へ合流                           |
    |                                                    |
    |   「改善してから使う」CTA (Secondary)               |
    |       |                                            |
    |       v                                            |
    |   [SkillAnalysisView]                              |
    |       → Task03 改善フロー開始                      |
    |       → EP-2 改善後再採点 → シナリオA 再判定       |
    |                                                    |
    +--- NEEDS_IMPROVEMENT (0-59) ──────────────────────+
        |                                                |
        「改善してから使う」CTA (Primary/Warning)         |
            |                                            |
            v                                            |
        [SkillAnalysisView]                              |
            → 改善必須フロー                             |
            → EP-2 改善後再採点 → シナリオA 再判定       |
```

### 2.2 遷移コンテキスト

| 遷移元            | 遷移先            | 渡すコンテキスト                                         |
| ----------------- | ----------------- | -------------------------------------------------------- |
| EP-1 採点完了     | Workspace         | `skillName`, `ScoringGateResult`, `SkillAnalysis`        |
| EP-1 採点完了     | Agent（省略経路） | `skillName`, `ScoringGateResult`                         |
| EP-1 採点完了     | Skill Center      | `skillName`（保存操作）                                  |
| EP-1 採点完了     | SkillAnalysisView | `skillName`, `SkillAnalysis`, `ScoringGateResult`        |
| Workspace         | Agent             | `skillName`, `workspacePath`, `contextFiles`, `EP-3結果` |
| Agent（実行結果） | SkillAnalysisView | `skillName`, `SkillAnalysis`, `executionResult`          |
| Agent（実行結果） | Agent（再実行）   | 前回パラメータ                                           |
| Agent（実行結果） | Terminal Dock     | `promptBundle`, `contextSummary`                         |

## 3. シナリオB: あとから使う（Deferred Use）

### 3.1 画面遷移フロー

```
[Skill Center]
    |
    +-- 一覧表示 / 検索 / おすすめ / 最近使った / お気に入り
    |
    v
[SkillCard クリック]
    |
    v
[SkillDetailPanel]
    |
    +-- ヘッダー: スキル名 + ScoreGateBadge + お気に入りスター
    +-- スコア: ScoreDisplay（総合 + 5軸 breakdown）
    +-- 説明: スキル全文説明
    +-- 利用履歴: 直近5件
    +-- CTAバー:
            |
            +-- 「使う」CTA (canUse === true の場合有効)
            |       |
            |       +-- 推奨経路 → [Workspace]
            |       |                  |
            |       |                  v
            |       |              スキル自動選択
            |       |              EP-3 利用前評価バナー
            |       |                  |
            |       |                  v
            |       |              [Agent] 実行
            |       |
            |       +-- 省略経路 → [Agent] 直接実行
            |
            +-- 「改善する」CTA (常時表示)
                    |
                    v
                [SkillAnalysisView]
                    → Task03 改善フロー

                    |
                    v
[Agent 実行完了]
    |
    v
[実行結果サマリー]
    |
    +-- 「もう一度使う」→ Agent 再実行
    +-- 「改善する」→ SkillAnalysisView
    +-- 「完了」→ 履歴記録
    +-- 「terminalで続ける」→ Terminal Dock
```

### 3.2 遷移コンテキスト

| 遷移元           | 遷移先            | 渡すコンテキスト                             |
| ---------------- | ----------------- | -------------------------------------------- |
| SkillDetailPanel | Workspace         | `skillName`, `ScoringGateResult`             |
| SkillDetailPanel | Agent（省略経路） | `skillName`                                  |
| SkillDetailPanel | SkillAnalysisView | `skillName`, `SkillAnalysis`                 |
| Workspace        | Agent             | `skillName`, `workspacePath`, `contextFiles` |

## 4. シナリオC: 履歴から再利用する（History Reuse）

### 4.1 画面遷移フロー

```
[Agent 履歴タブ]
    |
    → RecentExecutionList
    → 各エントリ: スキル名 / 実行日時 / ステータス / ScoreGateBadge / ScoreDelta
    |
    v
[履歴エントリ クリック]
    |
    v
[コンテキスト復元]
    → 前回の実行パラメータ表示
    → 結果サマリー表示
    → スコア変遷（delta）表示
    |
    +-- 「再実行」CTA
    |       |
    |       v
    |   [Agent] 同パラメータで実行
    |       |
    |       v
    |   [実行結果サマリー]
    |
    +-- 「パラメータ変更」CTA
    |       |
    |       v
    |   [Workspace]
    |       → 前回パラメータをプリセット
    |       → 文脈調整
    |       |
    |       v
    |   [Agent] 実行
    |
    +-- 「改善する」CTA
            |
            v
        [SkillAnalysisView]
            → Task03 改善フロー
            → EP-2 改善後再採点
            → 再利用導線へ復帰
```

### 4.2 遷移コンテキスト

| 遷移元       | 遷移先            | 渡すコンテキスト                                    |
| ------------ | ----------------- | --------------------------------------------------- |
| 履歴エントリ | Agent（再実行）   | `skillName`, `previousParams`, `executionId`        |
| 履歴エントリ | Workspace         | `skillName`, `previousParams`（プリセット）         |
| 履歴エントリ | SkillAnalysisView | `skillName`, `SkillAnalysis`, `lastExecutionResult` |

## 5. 改善フィードバックループ遷移

### 5.1 改善ループ全体フロー

```
[Agent 実行結果]
    |
    v
[PostExecutionActionBar]
    |
    +-- 「改善する」CTA クリック
    |       |
    |       v
    |   [EP-4: 利用後再評価（任意）]
    |       |
    |       v
    |   [ScoringGate 判定]
    |       |
    |       +--- NEEDS_IMPROVEMENT (0-59)
    |       |       → SkillAnalysisView（改善必須モード）
    |       |       → 強い誘導: 改善完了まで利用不可
    |       |
    |       +--- SAVE_ALLOWED (60-79)
    |       |       → 改善推奨バナー + 改善ボタン
    |       |       → SkillAnalysisView（改善推奨モード）
    |       |
    |       +--- USE_ALLOWED (80-99)
    |       |       → 任意改善ボタン
    |       |       → SkillAnalysisView（任意改善モード）
    |       |
    |       +--- RECOMMENDED (100)
    |               → 「評価完了」表示
    |               → 改善不要メッセージ
    |
    v
[SkillAnalysisView / Skill Creator]
    |
    → Task03 改善フロー実行
    |
    v
[EP-2: 改善後再採点]
    |
    v
[ScoringGate 再判定]
    |
    +--- 改善成功 → 再利用導線へ復帰
    |       |
    |       +-- シナリオA 経由 → EP-1 CTA 再表示
    |       +-- シナリオB 経由 → Skill Center（スコア更新反映）
    |       +-- シナリオC 経由 → Agent 履歴（スコア更新反映）
    |
    +--- 改善不十分 → 改善ループ再開
```

### 5.2 EP-4 利用後再評価の遷移

| EP-4 判定結果 | ScoringGate       | UI フィードバック      | 次アクション候補        |
| ------------- | ----------------- | ---------------------- | ----------------------- |
| スコア上昇    | USE_ALLOWED+      | 緑の上矢印 + delta表示 | 完了 / もう一度使う     |
| スコア維持    | 変化なし          | グレー「変化なし」     | 完了 / 改善する         |
| スコア低下    | NEEDS_IMPROVEMENT | 赤の下矢印 + 改善必須  | 改善する（強い誘導）    |
| スコア低下    | SAVE_ALLOWED      | 橙の下矢印 + 改善推奨  | 改善する / 保存して後で |

## 6. CTA 仕様テーブル

### 6.1 作成直後 CTA（シナリオA）

| CTA              | 表示条件                     | 遷移先                           | スタイル         | キーボード |
| ---------------- | ---------------------------- | -------------------------------- | ---------------- | ---------- |
| 今すぐ使う       | `canUse === true`            | Workspace（推奨）/ Agent（省略） | Primary (Blue)   | Enter      |
| 保存して後で使う | `canSave === true`           | Skill Center 保存                | Secondary (Gray) | S          |
| 改善してから使う | `gate === NEEDS_IMPROVEMENT` | SkillAnalysisView                | Warning (Orange) | I          |
| 改善を推奨       | `gate === SAVE_ALLOWED`      | SkillAnalysisView                | Text link (Gray) | -          |

### 6.2 スキル詳細 CTA（シナリオB）

| CTA      | 表示条件          | 遷移先                           | スタイル         |
| -------- | ----------------- | -------------------------------- | ---------------- |
| 使う     | `canUse === true` | Workspace（推奨）/ Agent（省略） | Primary (Blue)   |
| 改善する | 常時表示          | SkillAnalysisView                | Secondary (Gray) |

### 6.3 実行結果 CTA（シナリオA/B/C 共通）

| CTA              | 表示条件 | 遷移先                  | スタイル         |
| ---------------- | -------- | ----------------------- | ---------------- |
| もう一度使う     | 常時表示 | Agent（同スキル再実行） | Primary (Blue)   |
| 改善する         | 常時表示 | SkillAnalysisView       | Secondary (Gray) |
| 完了             | 常時表示 | 履歴記録 → 画面遷移なし | Tertiary (Text)  |
| terminalで続ける | 常時表示 | Terminal Dock           | Tertiary (Text)  |

## 7. 16パターン CTA マトリクス

ScoringGate 4段階 x CTA 4種類の有効/無効/非表示マトリクス。

### 7.1 シナリオA（作成直後）CTA マトリクス

| ScoringGate       | 今すぐ使う        | 保存して後で使う | 改善してから使う | 改善を推奨 |
| ----------------- | ----------------- | ---------------- | ---------------- | ---------- |
| NEEDS_IMPROVEMENT | disabled (灰)     | disabled (灰)    | **primary** (橙) | 非表示     |
| SAVE_ALLOWED      | disabled (灰)     | **primary** (灰) | secondary (橙)   | visible    |
| USE_ALLOWED       | **primary** (青)  | secondary (灰)   | 非表示           | 非表示     |
| RECOMMENDED       | **primary+** (青) | secondary (灰)   | 非表示           | 非表示     |

**凡例**:

- **primary**: メインアクションとして強調表示
- **primary+**: ハイライト付きメインアクション（推奨バッジ付き）
- secondary: 副次アクションとして通常表示
- disabled: ボタン表示あり・操作不可（ツールチップでブロック理由を表示）
- visible: テキストリンクとして表示
- 非表示: DOM に描画しない

### 7.2 CTA 有効/無効の判定ロジック

```typescript
interface CTAVisibility {
  useNow: "primary" | "primary-highlight" | "disabled" | "hidden";
  saveLater: "primary" | "secondary" | "disabled" | "hidden";
  improveFirst: "primary" | "secondary" | "hidden";
  suggestImprove: "visible" | "hidden";
}

function getCTAVisibility(gate: ScoringGate): CTAVisibility {
  switch (gate) {
    case "NEEDS_IMPROVEMENT":
      return {
        useNow: "disabled",
        saveLater: "disabled",
        improveFirst: "primary",
        suggestImprove: "hidden",
      };
    case "SAVE_ALLOWED":
      return {
        useNow: "disabled",
        saveLater: "primary",
        improveFirst: "secondary",
        suggestImprove: "visible",
      };
    case "USE_ALLOWED":
      return {
        useNow: "primary",
        saveLater: "secondary",
        improveFirst: "hidden",
        suggestImprove: "hidden",
      };
    case "RECOMMENDED":
      return {
        useNow: "primary-highlight",
        saveLater: "secondary",
        improveFirst: "hidden",
        suggestImprove: "hidden",
      };
  }
}
```

### 7.3 disabled 状態のツールチップ

| CTA              | disabled 時のツールチップメッセージ                         |
| ---------------- | ----------------------------------------------------------- |
| 今すぐ使う       | 「スコアが80点以上になると利用できます（現在: {score}点）」 |
| 保存して後で使う | 「スコアが60点以上になると保存できます（現在: {score}点）」 |

## 8. 推奨経路 vs 省略経路

### 8.1 経路選択基準

| 判定基準                       | 推奨経路（Workspace経由） | 省略経路（Agent直接） |
| ------------------------------ | ------------------------- | --------------------- |
| プロジェクトファイルを使う     | 選択                      | -                     |
| コンテキストを事前に整理したい | 選択                      | -                     |
| パラメータを細かく調整したい   | 選択                      | -                     |
| すぐに実行したい               | -                         | 選択                  |
| 文脈不要の汎用スキル           | -                         | 選択                  |
| 履歴からの再実行               | -                         | 選択（デフォルト）    |

### 8.2 経路選択UI

Workspace 経由を推奨するため、「使う」CTA クリック時にドロップダウンメニューで選択肢を提示する。

```
[使う v]
  ├── Workspace で準備してから使う（推奨）
  └── 直接実行する
```

- デフォルトのクリック動作: Workspace 経由（推奨経路）
- ドロップダウン展開: 省略経路の選択肢を表示
- 履歴からの再実行: 省略経路をデフォルトにする

### 8.3 Workspace 画面でのスキル自動選択

推奨経路で Workspace に遷移した場合、以下を自動設定する。

| 自動設定項目          | 値                               |
| --------------------- | -------------------------------- |
| 選択スキル            | 遷移元から渡された `skillName`   |
| EP-3 利用前評価バナー | 自動表示（利用はブロックしない） |
| 文脈ファイル          | 未設定（ユーザーが手動で接続）   |
| 実行ボタン            | 「Agent で実行」ラベル           |

## 9. 画面遷移サマリー図

```
+---------------+     +---------------+     +---------------+
|               |     |               |     |               |
| Skill Creator |---->|   Workspace   |---->|    Agent      |
| (作成完了)    |  A  | (文脈準備)    |     | (実行本体)    |
|               |     |               |     |               |
+-------+-------+     +-------+-------+     +-------+-------+
        |                                           |
        |  A(省略)                                   |
        +-------------------------------------------+
                                                    |
+---------------+     +---------------+             |
|               |     |               |             |
| Skill Center  |---->| SkillDetail   |------+      |
| (発見/一覧)   |  B  | Panel         |  B   |      |
|               |     |               |      |      |
+---------------+     +---------------+      |      |
                                             v      v
                                    +--------+------+--------+
                                    |                         |
                                    |  PostExecution          |
                                    |  ActionBar              |
                                    |                         |
                                    +---+------+------+------+
                                        |      |      |
                                  再実行|  完了 | 改善 |
                                        |      |      |
                                        v      |      v
                                    [Agent]    |  [SkillAnalysisView]
                                               |      |
                                               |      v
                                               |  [Skill Creator]
                                               |      |
                                               |      v
                                               |  [EP-2 再採点]
                                               |      |
                                               +------+
                                                      |
                                               再利用導線へ復帰
```

凡例: A = シナリオA経路、B = シナリオB経路、C = Agent履歴タブからの経路（図中省略）
