# スキルインポート永続化修正 - タスク指示書

## メタ情報

| 項目         | 内容                                 |
| ------------ | ------------------------------------ |
| タスクID     | TASK-FIX-4-2-SKILL-STORE-PERSISTENCE |
| タスク名     | インポートスキルの永続化消失バグ修正 |
| 分類         | バグ修正                             |
| 対象機能     | electron-store スキルデータ永続化    |
| 優先度       | 高                                   |
| 見積もり規模 | 中規模                               |
| ステータス   | 未実施                               |
| 実行順序     | 01b（並列可能 — 即時着手）           |
| 発見元       | skill-system-conflict-report #4      |
| 発見日       | 2026-02-05                           |
| 関連Phase    | Phase 1（E2E接続）                   |
| 関連Issue    | SKILL-STORE-001 (Issue #418)         |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`technical-decisions.md` §3 で electron-store による永続化を採用し、`~/.aiworkflow/config/skill-imports.json` に保存する設計。しかし、インポートしたスキルがアプリ再起動後に消失する。

### 1.2 問題点・課題

| 問題                                        | 影響                                           |
| ------------------------------------------- | ---------------------------------------------- |
| `skill:getImported` が空配列を返す          | 再起動後にインポート済みスキルが消える         |
| skillHandlers.ts L73-100 に6箇所のDEBUGログ | 過去に積極的に調査されたが未解決               |
| electron-store のロードタイミング不明       | `app.whenReady()` 時の初期化が設計通りか要確認 |

### 1.3 放置した場合の影響

- ユーザーが毎回スキルを再インポートする必要がある（UX最悪）
- スキル設定のカスタマイズが維持されない
- 信頼性の低下

---

## 2. 何を達成するか（What）

### 2.1 目的

インポートしたスキルデータがアプリ再起動後も正しく永続化・復元されることを保証する。

### 2.2 最終ゴール

1. インポートスキルが electron-store に正しく保存される
2. アプリ起動時に保存データが正しくロードされる
3. `skill:getImported` が保存済みスキルを返す
4. DEBUGログの整理

### 2.3 スコープ

#### 含むもの

- electron-store の初期化タイミング調査・修正
- `skill:getImported` ハンドラーの修正
- DEBUGログの整理（electron-log への移行または削除）

#### 含まないもの

- Preload API のスタブ解消（TASK-FIX-5-1）
- スキルデータの暗号化

### 2.4 成果物

| 成果物                      | 説明                               |
| --------------------------- | ---------------------------------- |
| 修正された永続化ロジック    | 正しいタイミングで保存・ロード     |
| 修正された skillHandlers.ts | getImported が正しくデータを返す   |
| テスト                      | 永続化の保存・ロードサイクルを検証 |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- なし（独立して着手可能）

### 3.2 依存タスク

- なし（Layer 0 の独立タスク）

### 3.3 必要な知識

- electron-store API
- Electron アプリケーションライフサイクル（`app.whenReady()`）
- SkillImportManager の内部構造

### 3.4 推奨アプローチ

1. electron-store の初期化・読み込みフローを追跡
2. `skill:import` → `skill:getImported` のデータフローを検証
3. ロードタイミングの問題を特定して修正

---

## 4. 実行手順

### Step 1: データフロー分析

#### 目的

永続化の保存・ロードフローの全容を把握

#### 手順

1. `SkillImportManager` の `importSkill()` で electron-store への書き込みを追跡
2. アプリ起動時の `getImportedSkills()` での読み込みを追跡
3. `skillHandlers.ts` L73-100 の DEBUG ログから過去の調査情報を分析
4. 設計書 §3.5.4 の `app.whenReady()` 初期化と実装の差異を確認

### Step 2: 原因特定・修正

#### 目的

データ消失の根本原因を修正

#### 手順

1. electron-store のインスタンス生成タイミングを確認
2. 保存パス（`~/.aiworkflow/config/skill-imports.json`）の存在・内容を確認
3. ロードタイミングとデータ形式の整合性を検証
4. 修正実装

### Step 3: テスト・検証

#### 手順

1. スキルインポート → electron-store へのデータ書き込みを検証
2. electron-store からのデータ読み込みを検証
3. アプリ再起動シミュレーション（store の再初期化）テスト

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] インポートスキルが electron-store に保存される
- [ ] アプリ起動時に保存済みスキルがロードされる
- [ ] `skill:getImported` が保存済みスキル一覧を正しく返す
- [ ] DEBUGログが整理されている（electron-log または削除）

### 品質要件

- [ ] 全テストが PASS
- [ ] 保存・ロードの往復テストが存在

---

## 6. 検証方法

### テストケース

1. スキルインポート → getImported で取得可能
2. store 再初期化（再起動シミュレーション）→ getImported でデータ維持
3. 複数スキルのインポート・削除 → 整合性維持
4. 空の store からの起動 → エラーなし

---

## 7. リスクと対策

| リスク                   | 影響度 | 発生確率 | 対策                           |
| ------------------------ | ------ | -------- | ------------------------------ |
| store ファイルの破損     | 高     | 低       | デフォルト値へのフォールバック |
| データ形式の後方互換性   | 中     | 中       | マイグレーションロジック追加   |
| 競合状態（同時読み書き） | 中     | 低       | electron-store の原子性を確認  |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/skill-import-agent-system/technical-decisions.md` §3（永続化設計）
- `apps/desktop/src/main/ipc/skillHandlers.ts` L73-100
- `apps/desktop/src/main/services/skill/SkillImportManager.ts`

### 関連タスク

- GitHub Issue #418（SKILL-STORE-001）
- TASK-FIX-5-1-SKILL-API-UNIFICATION（Preload側の接続はこちら）

---

## 9. 備考

### 発見経緯

skillHandlers.ts の `SKILL_GET_IMPORTED` ハンドラーに6箇所のDEBUGログ（L73-100）が残存しており、過去に積極的に調査されたバグであることが判明。しかし根本原因が特定されず未解決のまま放置されていた。

### 調査のヒント

DEBUGログの内容から、過去の調査者は以下を確認していた可能性が高い:

- electron-store からの読み込み結果
- スキルデータの形式
- importedSkills 配列の状態

これらのログ出力を有効にして調査を開始することで、効率的に原因特定できる可能性がある。
