# UT-9I-001: SkillDocGenerator の LLM プロバイダ連携実装

## メタ情報

| 項目         | 内容                                                        |
| ------------ | ----------------------------------------------------------- |
| タスクID     | UT-9I-001                                                   |
| タスク名     | SkillDocGenerator の LLM プロバイダ連携実装                 |
| 分類         | 改善                                                        |
| 対象機能     | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts` |
| 優先度       | 中                                                          |
| 見積もり規模 | 中規模                                                      |
| ステータス   | 未実施                                                      |
| 発見元       | TASK-9I Phase 10 MINOR（stubQueryFn 暫定実装）              |
| 発見日       | 2026-02-28                                                  |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-9I では IPC 契約とドキュメント生成フローを先に成立させるため、`registerAllIpcHandlers` で `stubQueryFn` を DI 注入した。
この構成はローカル動作確認には有効だが、本番品質の生成結果は保証しない。

### 1.2 問題点・課題

- 現状は `prompt.slice(0, 50)` を返す疑似応答であり、実際の文書品質を担保できない
- レート制限、APIキー未設定、プロバイダ障害時のフォールバック戦略が未定義
- 監査上「実装済み」に見えるが、生成品質が非機能要件を満たしていない

### 1.3 放置した場合の影響

- UI から docs 生成を呼んでも有用な成果物が得られず、機能価値が低下する
- 後続タスク（テンプレート高度化、多言語品質改善）の評価ができない
- LLM 呼び出し失敗時の障害復旧設計が遅延し、運用リスクが高まる

---

## 2. 何を達成するか（What）

### 2.1 目的

SkillDocGenerator の `LLMQueryFn` を実プロバイダ（OpenAI / Anthropic など）に接続し、プロダクション利用可能な生成経路を確立する。

### 2.2 最終ゴール

1. プロバイダ接続実装が `stubQueryFn` を置換し、設定により切替可能
2. APIキー未設定・429・5xx の失敗時に一貫したエラーを返却
3. ドキュメント生成の主要ケース（ja/en、sections）で統合テストが通過

### 2.3 スコープ

#### 含むもの

- Main Process の LLM クライアント実装と DI 接続
- SkillDocGenerator 呼び出し時のリトライ/タイムアウト/エラー正規化
- 仕様書更新（api/security/arch/interfaces/task-workflow）

#### 含まないもの

- Renderer 側の新規 UI 追加
- プロバイダ課金制御ダッシュボード
- テンプレート CRUD 機能（UT-9I-002 で対応）

### 2.4 成果物

- LLM プロバイダ接続実装コード
- 失敗系を含むテスト（ユニット/統合）
- Phase 12 仕様同期ドキュメント

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `@repo/desktop` で外部 API 呼び出しが可能
- APIキー管理方針（環境変数 or secure store）が定義済み
- 既存 `SkillDocGenerator` テストがグリーンである

### 3.2 依存タスク

- TASK-9I（完了）
- セキュリティ方針: `security-electron-ipc.md` / `security-api-electron.md`

### 3.3 必要な知識

- Electron Main Process での外部 API 統合
- P42 準拠バリデーション
- エラーサニタイズと IPC 返却契約

### 3.4 推奨アプローチ

1. `LLMQueryFn` の実装を `providers` レイヤーに抽出
2. `ipc/index.ts` は生成時に provider を注入し、fallback で stub を禁止
3. 障害種別を `Error` メッセージではなく分類コードで吸収し、IPC は既存契約 (`{ success: false, error: string }`) を維持

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                     | 発見経緯                                                                | 解決策                                                                      | 教訓                                                             |
| ------------------------ | ----------------------------------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 共有型 export 漏れ       | TASK-9I 再監査で `@repo/shared` root import が型解決失敗                | `packages/shared/index.ts` と `src/types/index.ts` の二重 export を同時更新 | shared 型追加時は root export までを Definition of Done に含める |
| サービス契約と実装のズレ | `SkillDocGenerator` が `listSkillFiles()` を呼ぶが FileManager に未実装 | サービス側 API を先に仕様化し、依存クラスへ同時実装                         | DI の境界はコンパイル時に即検証できるよう interface で固定する   |
| Phase 12 の「予定」残存  | changelog の Step が未完了のまま放置                                    | Step 単位で実行証跡とチェック更新を同時実施                                 | Phase 12 は実装と台帳を同ターン更新しないと再監査コストが跳ねる  |

---

## 4. 実行手順

### Phase構成

- Phase A: 設計（プロバイダ選定・失敗ポリシー定義）
- Phase B: 実装（LLMQueryFn 実装 + DI 接続）
- Phase C: 検証（失敗系含むテスト）
- Phase D: 仕様同期（Phase 12）

### Phase A: 設計

#### 目的

接続先、認証方式、失敗時挙動を確定する。

#### 手順

1. 対象プロバイダを1つ選定し、認証情報の注入経路を定義する
2. タイムアウト・リトライ・レート制限のポリシーを定義する
3. IPC 返却に必要なエラー分類を決める

#### 成果物

- 設計メモ（接続/認証/失敗ポリシー）

#### 完了条件

- 実装前に失敗時仕様が明文化されている

### Phase B: 実装

#### 目的

`stubQueryFn` を実プロバイダ実装に置換する。

#### 手順

1. Main Process に LLM クライアントモジュールを追加
2. `registerAllIpcHandlers` で `SkillDocGenerator` へ実 queryFn を DI 注入
3. 失敗時は既存 IPC 契約のエラー形式へ正規化

#### 成果物

- 実装コード差分

#### 完了条件

- docs 生成が実際の LLM 応答を返す

### Phase C: 検証

#### 目的

成功系・失敗系の再現性を確認する。

#### 手順

1. ユニットテストで queryFn の成功/失敗/timeout を検証
2. IPC 経由で `docsGenerate` のエラー正規化を検証
3. `pnpm --filter @repo/desktop exec tsc --noEmit` を実行

#### 成果物

- テスト結果ログ

#### 完了条件

- 既存 + 追加テストがグリーン

### Phase D: 仕様同期

#### 目的

仕様書・台帳を実装実態へ同期する。

#### 手順

1. aiworkflow-requirements の関連6仕様書を更新
2. `task-workflow.md` 完了/残課題と unassigned 指示書リンクを同期
3. `verify-unassigned-links.js` と `generate-index.js` を実行

#### 成果物

- 更新済み仕様書・同期ログ

#### 完了条件

- リンク欠損ゼロ、索引再生成完了

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 実 LLM プロバイダで docs 生成が成立する
- [ ] APIキー未設定/429/5xx の失敗経路を処理できる
- [ ] `stubQueryFn` が本番経路から排除される

### 品質要件

- [ ] 型チェックが通過する
- [ ] 失敗系テストを追加し回帰を防止する
- [ ] エラーサニタイズ規約に準拠する

### ドキュメント要件

- [ ] 仕様書6ファイルに実装を反映する
- [ ] `task-workflow.md` 残課題テーブルとリンク整合を保つ
- [ ] Phase 12 成果物に反映記録がある

---

## 6. 検証方法

### テストケース

- Case 1: 通常生成（ja/en）
- Case 2: APIキー未設定
- Case 3: 429/5xx 応答
- Case 4: タイムアウト

### 検証手順

```bash
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillDocGenerator.test.ts
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillHandlers.docs.test.ts
pnpm --filter @repo/desktop exec tsc --noEmit
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```

---

## 7. リスクと対策

| リスク                   | 影響度 | 発生確率 | 対策                                              |
| ------------------------ | ------ | -------- | ------------------------------------------------- |
| プロバイダ障害で生成停止 | 高     | 中       | タイムアウト/リトライと明確な障害メッセージを実装 |
| APIキー管理の誤実装      | 高     | 低       | 環境変数検証と起動時チェックを追加                |
| コスト急増               | 中     | 中       | トークン上限・リクエスト頻度制御を導入            |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`
- `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`
- `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`
- `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/outputs/phase-12/documentation-changelog.md`

### 参考資料

- `apps/desktop/src/main/ipc/index.ts`
- `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
現在 stubQueryFn を使用しているが、実際の LLM プロバイダとの連携が未実装。
```

### 補足事項

実装時は provider 依存を SkillDocGenerator に直接埋め込まず、既存の関数 DI 契約（`LLMQueryFn`）を維持すること。
