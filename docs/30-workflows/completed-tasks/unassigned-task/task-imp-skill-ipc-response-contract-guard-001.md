# UT-IMP-SKILL-IPC-RESPONSE-CONTRACT-GUARD-001: skill IPCレスポンス契約マトリクスと自動整合チェック

## メタ情報

```yaml
issue_number: 899
```

## メタ情報

| 項目         | 値                                                                     |
| ------------ | ---------------------------------------------------------------------- |
| タスクID     | UT-IMP-SKILL-IPC-RESPONSE-CONTRACT-GUARD-001                           |
| タスク名     | skill IPCレスポンス契約マトリクスと自動整合チェック                    |
| 分類         | 改善                                                                   |
| 対象機能     | `apps/desktop/src/main/ipc/skillHandlers.ts` と `preload/skill-api.ts` |
| 優先度       | 中                                                                     |
| 見積もり規模 | 中規模                                                                 |
| ステータス   | 未実施                                                                 |
| 発見元       | UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 Phase 12（実装苦戦箇所）     |
| 発見日       | 2026-02-25                                                             |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`skill:execute` は `{ success, data }` ラッパー応答、`skill:remove` は直接 `RemoveResult` 応答という差異があり、Preload 側で `safeInvoke` / `safeInvokeUnwrap` の使い分けを誤ると契約崩壊が発生する。

### 1.2 問題点・課題

- Main 応答形式と Preload 呼び出しラッパーの対応表が仕様として固定されていない
- 仕様書・実装・テストの3点同期が手作業に依存し、再監査時に差し戻しが発生しやすい
- 影響範囲調査が都度 `grep` ベースで、回帰検知が遅れる

### 1.3 放置した場合の影響

- `executionId` 欠落や削除結果の取り違えなど、Renderer 側の実行時不具合が再発する
- Phase 12 で同種の契約ドリフト修正を繰り返し、作業コストが増える
- 知見が属人化し、後続タスクで同じ判断ミスが発生する

---

## 2. 何を達成するか（What）

### 2.1 目的

skill 系 IPC の応答契約を機械可読なマトリクスとして管理し、Main/Preload/テストの整合を自動検証可能にする。

### 2.2 最終ゴール

1. `skill:*` チャンネルごとの応答形式（wrapper/直接）と推奨ラッパー（`safeInvoke`/`safeInvokeUnwrap`）を定義した契約マトリクスを作成する
2. 契約マトリクスと実装差分を検証するスクリプトまたはテストを追加する
3. 仕様書（aiworkflow-requirements）に運用手順を反映する

### 2.3 スコープ

#### 含むもの

- skill 系 IPC 契約マトリクスの新規作成
- Preload の呼び出しラッパー選択と Main 応答形式の照合チェック
- `interfaces-agent-sdk-skill.md` / `task-workflow.md` への運用追記

#### 含まないもの

- 全 IPC ドメイン（auth/chat/history 等）への一括展開
- `skillHandlers` の全レスポンス形式を単一形式へ全面統一する大規模変更

### 2.4 成果物

- 契約マトリクス定義（Markdown or JSON）
- 自動検証スクリプト/テスト
- 仕様書更新（契約運用手順・チェックリスト）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001` の修正内容が基準として確定していること
- `apps/desktop` の単体テスト実行環境が利用可能であること

### 3.2 依存タスク

- ~~UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001~~（完了済み）
- UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001（並行で契約ドリフト是正）

### 3.3 必要な知識

- Electron IPC 設計（Main/Preload/Renderer）
- `safeInvoke` / `safeInvokeUnwrap` の挙動差
- P44/P45（IPC契約ドリフト）パターン

### 3.4 推奨アプローチ

- 先に Main 側の実応答形式を一覧化し、チャンネルごとに wrapper/直接を固定する
- 次に Preload 側の実装をマトリクスに機械照合し、乖離を fail させる
- 最後に仕様書へ「契約変更時の必須チェック」を追記する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                             | 発見経緯                                                                    | 解決策                                                      | 教訓                                                   |
| ------------------------------------------------ | --------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------ |
| `safeInvoke` / `safeInvokeUnwrap` の使い分けミス | `execute` と `remove` の応答形式差異により、Preload選択を誤ると契約崩壊した | Main 応答形式を先に固定し、wrapper/直接の対応表を明文化した | ラッパー関数選択は実装者判断に委ねず、契約表で固定する |
| Phase 12 での再監査差し戻し                      | 実装済みでも仕様書とテストが同時更新されず、再監査で不一致が出た            | 実装・仕様・テストを同一チェック項目で機械検証した          | IPC契約変更は3点同期を自動チェック化する               |
| モック波及の見落とし                             | 応答形式変更時に既存モックが旧形式のまま残り失敗した                        | 影響箇所を一括抽出して更新した                              | 契約変更時はモック更新を必須手順として先に計画する     |

---

## 4. 実行手順

### Phase構成

- Phase A: 契約マトリクス定義
- Phase B: 自動検証実装
- Phase C: 仕様書反映と運用固定

### Phase A: 契約マトリクス定義

#### 目的

Main 応答形式と Preload ラッパー選択を1対1で定義する。

#### 手順

1. `skillHandlers.ts` の各 `return` 形式を抽出する
2. `preload/skill-api.ts` の各呼び出しラッパーを抽出する
3. チャンネルごとの期待対応表（契約マトリクス）を作成する

#### 成果物

- `skill-ipc-response-contract-matrix`（新規）

#### 完了条件

- `skill:*` 全チャンネルの対応が表で定義されている

### Phase B: 自動検証実装

#### 目的

契約ドリフトをCI/ローカルで機械検出できるようにする。

#### 手順

1. 契約マトリクスと実装を突合する検証処理を追加する
2. wrapper/直接の不一致時に fail するテストを追加する
3. `pnpm` テストに統合する

#### 成果物

- 検証スクリプトまたは検証テスト

#### 完了条件

- 意図的な不一致を入れると fail し、修正で pass する

### Phase C: 仕様書反映と運用固定

#### 目的

運用として再利用可能な状態にする。

#### 手順

1. `interfaces-agent-sdk-skill.md` に契約運用ルールを追記する
2. `task-workflow.md` に完了記録・教訓を追記する
3. `lessons-learned.md` に再発防止手順を追記する

#### 成果物

- 更新済み仕様書

#### 完了条件

- 契約変更時の確認手順が仕様書で参照可能になっている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] skill IPC 契約マトリクスが作成されている
- [ ] Main/Preload の wrapper 対応が機械検証できる
- [ ] 不一致時に fail する回帰検知が実装されている

### 品質要件

- [ ] 主要 skill チャンネル（execute/remove/import/get-detail）を網羅
- [ ] モック更新漏れを検出するテスト観点がある
- [ ] 既存の正常系テストが全て pass

### ドキュメント要件

- [ ] aiworkflow-requirements の関連仕様書へ反映済み
- [ ] 未タスク/完了台帳とのリンク整合が取れている

---

## 6. 検証方法

### テストケース

- Case 1: 正しい契約マトリクスで全検証 pass
- Case 2: `execute` を `safeInvoke` に戻す改変で fail
- Case 3: `remove` を `safeInvokeUnwrap` に変える改変で fail

### 検証手順

1. `corepack pnpm --dir apps/desktop exec vitest run src/preload/__tests__/skill-api.unification.test.ts`
2. `corepack pnpm --dir apps/desktop exec vitest run src/main/ipc/__tests__/skillHandlers.execute.test.ts`
3. `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`

---

## 7. リスクと対策

| リスク                                   | 影響度 | 発生確率 | 対策                                                |
| ---------------------------------------- | ------ | -------- | --------------------------------------------------- |
| 契約マトリクスが実装追従できず形骸化する | 中     | 中       | 契約変更時に検証テスト更新を必須化する              |
| チャンネル追加時の更新漏れ               | 中     | 中       | `IPC_CHANNELS` 全件走査で未定義チャンネルを検出する |
| 既存テストと役割重複する                 | 低     | 中       | 単体テストは挙動、契約テストは整合に責務分離する    |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`
- `docs/30-workflows/completed-tasks/ut-fix-skill-ipc-response-consistency-001/outputs/phase-12/implementation-guide.md`
- `docs/30-workflows/completed-tasks/ut-fix-skill-ipc-response-consistency-001/outputs/phase-12/documentation-changelog.md`

### 参考資料

- `apps/desktop/src/main/ipc/skillHandlers.ts`
- `apps/desktop/src/preload/skill-api.ts`
- `apps/desktop/src/preload/__tests__/skill-api.unification.test.ts`
- `.claude/rules/06-known-pitfalls.md`（P44/P45）

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
今回の修正では execute/remove の応答形式差異により safeInvoke/safeInvokeUnwrap の選択を誤ると契約崩壊が発生しうる。
契約とラッパー選択の1対1対応を仕様として固定し、機械検証する必要がある。
```

### 補足事項

- 本タスクは「全ハンドラを単一応答形式に統一する」ことが目的ではなく、現行契約を安全に維持するためのガード整備を目的とする。
