# UT-IMP-PHASE12-WORKFLOW11-COMPLIANCE-FIX-001 - Workflow11 Phase 構造準拠是正タスク

## メタ情報

```yaml
issue_number: 1050
```

## メタ情報

| 項目         | 内容                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------ |
| タスクID     | UT-IMP-PHASE12-WORKFLOW11-COMPLIANCE-FIX-001                                               |
| タスク名     | Workflow11（Supabase Fallback Profile Avatar）の Phase 1-11 構造不足と Phase 12 不足を是正 |
| 分類         | 改善（ドキュメント補完）                                                                   |
| 対象機能     | Supabase 認証プロファイルのフォールバックアバター表示                                      |
| 優先度       | 高                                                                                         |
| 見積もり規模 | 中規模                                                                                     |
| ステータス   | 未実施                                                                                     |
| 発見元       | 2026-03-07 branch横断 Phase 12 再監査                                                      |
| 発見日       | 2026-03-07                                                                                 |
| 依存タスク   | 11-TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001                                           |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`11-TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001` は Supabase 認証でプロフィール画像が取得できない場合のフォールバック表示を実装するタスクだが、branch横断 Phase 12 再監査で以下の不足が検出された：

- Phase 1-11 で `統合テスト連携` セクションが多数欠落
- 実行タスクの箇条書き形式が validator 期待形と不一致
- Phase 12 の `implementation-guide.md` が未作成

### 1.2 問題点

- `validate-phase-output` スクリプトが複数 Phase で FAIL する
- Phase 12 必須成果物が揃っていない
- 他ワークフローに比べて構造品質が大幅に低い

### 1.3 放置した場合の影響

- Supabase 認証フォールバックの設計知見が暗黙知のまま残る
- 構造未準拠のままでは品質監査パイプラインを通過できない

---

## 2. 何を達成するか（What）

### 2.1 目的

Workflow11 の Phase 1-11 を仕様テンプレートに準拠させ、Phase 12 必須成果物を作成して validator PASS にする。

### 2.2 スコープ

#### 含むもの

- Phase 1-11 の `統合テスト連携` セクション追加
- 実行タスクの箇条書き形式を validator 期待形に統一
- Phase 12 `outputs/phase-12/implementation-guide.md` の Part 1/Part 2 作成
- Phase 12 必須成果物5点の補完
- `artifacts.json` 更新

#### 含まないもの

- Supabase 認証の実装コード変更
- 他ワークフローの修正

### 2.3 成果物

- 修正された Phase 1-11 の各仕様書
- 新規 `outputs/phase-12/implementation-guide.md`
- Phase 12 必須成果物5点
- 更新された `artifacts.json`

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-specification-creator` の Phase テンプレートを参照可能
- Supabase OAuth の基本知識（P15-P18 参照）

### 3.2 推奨アプローチ

1. `validate-phase-output` を実行し FAIL 箇所を全て列挙
2. Phase 1-11 を一括修正（`統合テスト連携` セクション + 箇条書き形式統一）
3. Phase 12 実装ガイド Part 1: 「SNSのプロフィール写真」例え
4. Phase 12 実装ガイド Part 2: API仕様、フォールバックロジック、エラーハンドリング

### 3.3 実装時の苦戦箇所と解決策（親タスクからの教訓）

| #   | 課題                                  | 発見経緯                                           | 解決策                                               | 教訓（標準ルール）                                                       |
| --- | ------------------------------------- | -------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------ |
| 1   | Phase数が多く修正漏れが残りやすい     | Phase 1-11 の11ファイルを一括修正する必要があった  | validator を修正のたびに実行し、残 FAIL 数を追跡する | 大量ファイル修正時は修正→検証のループを1ファイルごとに回す               |
| 2   | 箇条書き形式のvalidator期待形が不明確 | `validate-phase-output` のエラーメッセージが汎用的 | `phase-templates.md` の実行タスクテンプレートを参照  | validator が FAIL した場合はテンプレートファイルを直接確認する           |
| 3   | Supabase OAuth の Pitfall が多い      | P15-P18 に4つの OAuth 関連落とし穴がある           | 実装ガイド Part 2 で P15-P18 を明示的に参照          | 認証系タスクでは `06-known-pitfalls.md` の Supabase セクションを必ず確認 |

---

## 4. 実行手順

### Phase 1: 現状確認と FAIL 箇所特定

1. `validate-phase-output` を実行
2. FAIL する Phase とセクションを一覧化
3. 修正計画を作成（Phase番号順）

### Phase 2: Phase 1-11 構造修正

1. 各 Phase に `統合テスト連携` セクションを追加
2. 実行タスクの箇条書き形式を統一
3. 修正のたびに validator を再実行

### Phase 3: Phase 12 実装ガイド作成

1. Part 1: Supabase フォールバックを「SNSのプロフィール写真」で例える
2. Part 2: フォールバックロジック、API仕様、Supabase SDK 設定、エラーハンドリング

### Phase 4: Phase 12 成果物補完

1. 必須5点の存在確認と補完
2. `artifacts.json` 更新

### Phase 5: 最終検証

1. `validate-phase-output` PASS 確認
2. `validate-phase12-implementation-guide` PASS 確認

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Phase 1-11 の `統合テスト連携` セクションが全て追加されている
- [ ] 実行タスクの箇条書き形式が統一されている
- [ ] Phase 12 `implementation-guide.md` が Part 1/Part 2 構成で作成されている
- [ ] Part 1 に日常例え（中学生レベル）が含まれている
- [ ] Phase 12 必須成果物5点が全て存在している

### 品質要件

- [ ] `validate-phase-output` が全 Phase で PASS
- [ ] `validate-phase12-implementation-guide` が PASS
- [ ] `artifacts.json` が同期されている

### ドキュメント要件

- [ ] `documentation-changelog.md` に変更内容が記録されている

---

## 6. 検証方法

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/11-TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/11-TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001
```

---

## 7. リスクと対策

| リスク                               | 影響度 | 発生確率 | 対策                                              |
| ------------------------------------ | ------ | -------- | ------------------------------------------------- |
| Phase数が多く修正漏れが残る          | 中     | 高       | validator を各Phase修正後に実行して残FAIL数を追跡 |
| Supabase OAuth の Pitfall を見落とす | 中     | 中       | P15-P18 を実装ガイドに明示的に記載                |
| validator 期待形の変更に追従できない | 低     | 低       | `phase-templates.md` を毎回確認                   |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/11-TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001/` — 対象ワークフロー
- `.claude/skills/task-specification-creator/references/phase-templates.md` — Phase テンプレート

### システム仕様書参照

- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` — 認証状態管理
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` — branch横断再監査の教訓
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md` — 残課題テーブル

### 既知の落とし穴

- `.claude/rules/06-known-pitfalls.md` — P15（state競合）、P16（Site URL未設定）、P17（flowType未設定）、P18（PKCE競合）

---

## 9. 備考

### 実装方針

- コード変更なし、ドキュメント補完のみ
- 11ファイルの一括修正は1ファイルずつ validator で確認しながら進行
- Part 1 は「SNSにプロフィール写真を設定していない友達のアイコン」の例えで開始
- Supabase 固有の Pitfall（P15-P18）を Part 2 で必ず言及する
