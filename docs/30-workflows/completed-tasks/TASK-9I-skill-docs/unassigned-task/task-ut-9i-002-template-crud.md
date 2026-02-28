# UT-9I-002: ドキュメントテンプレート CRUD 機能実装

## メタ情報

| 項目         | 内容                                           |
| ------------ | ---------------------------------------------- |
| タスクID     | UT-9I-002                                      |
| タスク名     | ドキュメントテンプレート CRUD 機能実装         |
| 分類         | 改善                                           |
| 対象機能     | `SkillDocGenerator` / `skill:docs:templates`   |
| 優先度       | 低                                             |
| 見積もり規模 | 中規模                                         |
| ステータス   | 未実施                                         |
| 発見元       | TASK-9I Phase 10 MINOR（テンプレート固定実装） |
| 発見日       | 2026-02-28                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-9I では `DEFAULT_DOC_TEMPLATE` を返す読み取り専用実装で機能を成立させた。
しかし運用では、チームごとのフォーマット差異やセクション順序の違いを吸収する必要がある。

### 1.2 問題点・課題

- 現状 `docsTemplates()` は固定1件のみで、ユーザー定義テンプレートを保存できない
- `prompt` を業務に合わせて調整できず、出力品質改善が都度コード変更になる
- テンプレートの履歴管理・削除・復元の運用が未定義

### 1.3 放置した場合の影響

- 機能の拡張性が不足し、利用チームごとに fork 実装が発生する
- LLM 出力の品質改善サイクルが遅くなる
- テンプレート更新の責務が開発チームに固定される

---

## 2. 何を達成するか（What）

### 2.1 目的

テンプレートの作成・更新・削除・一覧取得を IPC/API/永続化まで含めて実装し、ノーコードでテンプレート運用できる基盤を作る。

### 2.2 最終ゴール

1. Template CRUD を提供する IPC チャネルが追加される
2. テンプレートが永続化され、再起動後も保持される
3. 不正テンプレート（空 title/prompt 等）をバリデーションで拒否する

### 2.3 スコープ

#### 含むもの

- Main Process: テンプレート保存サービス
- IPC: create/update/delete/list チャネル
- Preload API: docsTemplates 拡張 + CRUD メソッド
- shared 型定義の拡張（必要に応じて）

#### 含まないもの

- テンプレート編集 UI の全面刷新
- 外部同期（GitHub/Gist）
- LLM モデル自動選択

### 2.4 成果物

- テンプレート CRUD 実装コード
- バリデーション/永続化テスト
- 仕様書同期と運用ドキュメント

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-9I の docs 生成 API が安定している
- 永続化ストレージ方針（electron-store 等）が採用可能
- 既存 `DocTemplate` 契約を壊さない後方互換方針を定義済み

### 3.2 依存タスク

- TASK-9I（完了）
- UT-9I-001（推奨先行: 実LLM連携）

### 3.3 必要な知識

- Electron IPC と sender 検証
- P42 準拠入力バリデーション
- ストレージ版管理（更新日時・ID一意性）

### 3.4 推奨アプローチ

1. `TemplateStore` を `SkillDocGenerator` から分離し、責務を CRUD に限定
2. `DEFAULT_DOC_TEMPLATE` は削除不可の組み込みテンプレートとして扱う
3. IPC は `templates:create/update/delete/list` を明示し、`docs:generate` 側で templateId 指定を受ける

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                     | 発見経緯                                  | 解決策                                                                    | 教訓                                                |
| ------------------------ | ----------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------- |
| 仕様書更新漏れ           | TASK-9I 再監査で必須6仕様書が未反映だった | 実装と同時に `api/security/arch/overview/interfaces/task-workflow` を更新 | テンプレート拡張は UI だけでなく IPC 契約更新が本体 |
| 未タスク指示書の未作成   | 検出レポートに「作成予定」のまま残存      | 検出時に指示書作成・台帳登録・仕様リンクを同時実施                        | P3 の3ステップは単一コミット単位で完了させる        |
| 型とランタイム検証の乖離 | 型上は許容でも空文字 prompt が通る余地    | IPC 境界で P42 検証を適用し、保存前に二重チェック                         | テンプレート入力は型検査だけでは不足する            |

---

## 4. 実行手順

### Phase構成

- Phase A: 契約設計
- Phase B: 永続化実装
- Phase C: IPC/Preload 実装
- Phase D: テスト・仕様同期

### Phase A: 契約設計

#### 目的

テンプレート CRUD のデータ契約と操作契約を確定する。

#### 手順

1. `DocTemplate` の更新可/不可フィールドを定義する
2. 組み込みテンプレートとユーザー定義テンプレートの扱いを分離する
3. 既存 `docsPreview` との互換を保つ入力仕様を決める

#### 成果物

- 型仕様・IPC 契約案

#### 完了条件

- CRUD 各操作の request/response が定義済み

### Phase B: 永続化実装

#### 目的

テンプレートを保存・取得できる基盤を作る。

#### 手順

1. Store 層に list/create/update/delete を実装
2. ID 一意性と更新日時管理を実装
3. 組み込みテンプレートの保護ルール（削除不可）を実装

#### 成果物

- 永続化層コード

#### 完了条件

- 再起動後にテンプレートが保持される

### Phase C: IPC/Preload 実装

#### 目的

Renderer から CRUD を安全に呼べるようにする。

#### 手順

1. IPC ハンドラー追加（sender 検証 + P42 バリデーション）
2. Preload API に CRUD メソッド追加
3. `docsGenerate` / `docsPreview` で template 指定を統合

#### 成果物

- IPC / Preload 差分

#### 完了条件

- Renderer 経由で CRUD を実行できる

### Phase D: テスト・仕様同期

#### 目的

回帰防止と仕様整合を完了する。

#### 手順

1. CRUD 正常系/異常系テストを追加
2. aiworkflow-requirements の関連仕様書を更新
3. `verify-unassigned-links.js` / `generate-index.js` を実行

#### 成果物

- テスト結果・更新仕様書

#### 完了条件

- 追加テストと型チェックがすべて通過

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] テンプレート CRUD が実装される
- [ ] 組み込みテンプレート保護ルールが実装される
- [ ] docs 生成が template 指定に対応する

### 品質要件

- [ ] IPC 境界で入力バリデーションを実施する
- [ ] 永続化の整合テストが通過する
- [ ] 型定義と実装契約が一致する

### ドキュメント要件

- [ ] 仕様書6ファイルが同期される
- [ ] task-workflow 残課題テーブルとリンクが同期される
- [ ] Phase 12 成果物へ実行証跡を記録する

---

## 6. 検証方法

### テストケース

- Case 1: テンプレート作成（正常系）
- Case 2: テンプレート更新（正常系）
- Case 3: テンプレート削除（組み込みテンプレート拒否）
- Case 4: 空 title/prompt の拒否
- Case 5: 再起動後の保持

### 検証手順

```bash
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillHandlers.docs.test.ts
pnpm --filter @repo/desktop exec tsc --noEmit
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```

---

## 7. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                                                     |
| -------------------------- | ------ | -------- | -------------------------------------------------------- |
| テンプレート破損で生成不能 | 中     | 中       | 保存前バリデーションと復旧用デフォルトテンプレートを維持 |
| 互換性破壊                 | 高     | 低       | 既存 API は後方互換を維持し段階的移行する                |
| ストレージ肥大化           | 低     | 中       | 件数上限と古いテンプレート整理ルールを設ける             |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`
- `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`
- `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`
- `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/outputs/phase-12/unassigned-task-detection.md`

### 参考資料

- `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`
- `apps/desktop/src/main/ipc/skillHandlers.ts`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
現在は読み取り専用（DEFAULT_DOC_TEMPLATE のみ）。
カスタムテンプレートの作成・編集・削除が未実装。
```

### 補足事項

このタスクは優先度「低」だが、UT-9I-001 実装後に着手するとテンプレート品質評価が容易になる。
