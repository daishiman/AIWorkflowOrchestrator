# Profile / Avatar fallback error の UI ローカライズ - 未タスク指示書

## メタ情報

```yaml
issue_number: 1089
```

## メタ情報

| 項目         | 内容                                                   |
| ------------ | ------------------------------------------------------ |
| タスクID     | UT-IMP-PROFILE-AVATAR-FALLBACK-ERROR-LOCALIZATION-001  |
| タスク名     | Profile / Avatar fallback error の UI ローカライズ     |
| 分類         | 改善                                                   |
| 対象機能     | SettingsView / ProfileSection / AccountSection         |
| 優先度       | 中                                                     |
| 見積もり規模 | 小規模                                                 |
| ステータス   | 未実施                                                 |
| 発見元       | TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001 Phase 11 |
| 発見日       | 2026-03-08                                             |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Supabase 未設定時の fallback ハンドラは main 側で正しく実装され、`profile/not-configured` と `avatar/not-configured` を返すようになった。Phase 11 で Settings 画面をスクリーンショット確認したところ、UI はクラッシュしない一方で、error banner に transport message の英語文言がそのまま表示されていた。

### 1.2 問題点・課題

| 問題                        | 詳細                                                                                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 日本語 UI との不整合        | Settings 画面全体は日本語だが、fallback error だけ英語のまま表示される                                                                           |
| code ベースの分岐不足       | `ProfileSection` は `result.error?.message` をそのまま表示し、`authSlice` の avatar 系も `response.error?.message` を `authError` に格納している |
| error code が途中で失われる | `AccountSection` 系は store に文字列だけを保存するため、`avatar/not-configured` のような code ベース分岐が後段でできない                         |

### 1.3 放置した場合の影響

| 影響                                                   | 深刻度 |
| ------------------------------------------------------ | ------ |
| UI/UX の一貫性低下                                     | 中     |
| i18n 方針の逸脱                                        | 中     |
| 将来の error code 拡張時に Renderer 側の分岐追加が困難 | 中     |

---

## 2. 何を達成するか（What）

### 2.1 目的

`profile/not-configured` と `avatar/not-configured` を Renderer 側で code ベースに日本語化し、Settings UI のエラーメッセージを一貫した表示へ揃える。

### 2.2 最終ゴール

- Profile fallback error が日本語メッセージで表示される
- Avatar fallback error が日本語メッセージで表示される
- `error.code` を失わない状態管理または UI 直前での localized mapping が導入される
- スクリーンショット回帰で日本語エラー表示を確認できる

### 2.3 スコープ

#### 含むもの

- `ProfileSection` の error 表示改善
- `authSlice` / `AccountSection` の avatar error 表示改善
- localized message mapping utility または定数追加
- テストとスクリーンショット回帰

#### 含まないもの

- fallback transport message 自体の英文化 / 日本語化の変更
- Auth 全体のエラーメッセージ一元管理
- 多言語切り替え UI の実装

### 2.4 成果物

| 成果物                          | 配置先                                                       |
| ------------------------------- | ------------------------------------------------------------ |
| localized error mapping 実装    | `apps/desktop/src/renderer/` 配下                            |
| Renderer テスト                 | `apps/desktop/src/renderer/**/__tests__/`                    |
| Phase 11 スクリーンショット更新 | `docs/30-workflows/<workflow>/outputs/phase-11/screenshots/` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

| 前提条件                                                                                        | 必須 |
| ----------------------------------------------------------------------------------------------- | ---- |
| fallback ハンドラ実装が main 側で完了している                                                   | ✅   |
| `PROFILE_ERROR_CODES.NOT_CONFIGURED` / `AVATAR_ERROR_CODES.NOT_CONFIGURED` が shared に存在する | ✅   |
| Phase 11 harness (`phase11-auth-mode.html`) が利用可能である                                    | ✅   |

### 3.2 依存タスク

- `TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001` 完了後に着手

### 3.3 必要な知識

- Renderer 側の error 表示責務と IPC transport の責務分離
- `useAppStore` / `authSlice` の state 契約
- Phase 11 screenshot harness の流し方

### 3.4 推奨アプローチ

1. Renderer で `error.code` を維持するか、少なくとも表示直前まで失わない構造にする
2. localized message は `error.code` を起点に決定し、transport `message` は fallback としてのみ使う
3. ProfileSection と AccountSection で同じ mapping 規約を使う
4. Phase 11 harness を流用して日本語表示のスクリーンショット回帰を取る

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                 | 発見経緯                                               | 解決策                                                                                      | 教訓                                                                   |
| ---------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| transport message と UI message の責務が混ざりやすい | Phase 11 の screenshot で英語 error が直接露出した     | transport では `code + message` を維持し、UI は `code` を正本として localized mapping する  | IPC 契約の `message` はそのまま UI 文言ではないことを仕様へ明記すべき  |
| AccountSection 系では `error.code` が途中で消える    | `authSlice` が `authError: string` しか持たないため    | structured error か `lastAuthErrorCode` の保持を追加する                                    | store で情報を落とすと UI 層で正しい分岐ができない                     |
| 実画面再現は App shell 経路が不安定になりやすい      | Phase 11 再確認で nav click ベースの撮影が不安定だった | `phase11-auth-mode.html` の harness で本番コンポーネントを直描画し、必要 state のみ注入する | 画面検証は「見たい view を最短で再現する harness」を優先すると安定する |

---

## 4. 実行手順

### Phase構成

本タスクは `Renderer 契約補強 -> UI ローカライズ実装 -> 回帰検証と証跡更新` の 3 フェーズで進める。

### Phase 1: Error 契約の維持方法を決める

#### 目的

`profile/not-configured` と `avatar/not-configured` を UI 表示地点まで lossless に運べる状態へ揃える。

#### 手順

1. `ProfileSection` の `invokeIpc` 応答型を確認し、`error.code` を参照できる構造へ揃える。
2. `authSlice` の avatar 系エラー保存形式を確認し、文字列のみ保持している場合は structured error または code 併存形式へ見直す。
3. `AccountSection` が参照する selector / state 契約を整理し、既存 UI と破綻しない移行方針を決める。

#### 成果物

- error.code を維持する state / props / helper の設計

#### 完了条件

- Profile 系と Avatar 系のどちらも `error.code` を UI 直前で参照できる

### Phase 2: Renderer の localized mapping を実装する

#### 目的

Settings UI 上の fallback error を日本語表示へ統一する。

#### 手順

1. `profile/not-configured` / `avatar/not-configured` を日本語へ変換する mapping utility または定数を追加する。
2. `ProfileSection` の error banner 表示を `error.code` 優先で解決するよう更新する。
3. `AccountSection` の avatar error 表示も同一規約へ揃え、未知 code では transport message または既定文言へ安全にフォールバックさせる。

#### 成果物

- Profile / Avatar 共通の localized error 表示実装

#### 完了条件

- 既知 code は日本語化され、未知 code は安全に fallback される

### Phase 3: テストとスクリーンショット証跡を更新する

#### 目的

実装が regress しないことと、画面上の最終表示が期待通りであることを証明する。

#### 手順

1. `ProfileSection` / `AccountSection` / `authSlice` のテストを追加または更新する。
2. `phase11-auth-mode.html` harness を流用して Settings 画面のスクリーンショットを再撮影する。
3. Phase 11 / Phase 12 の成果物、未タスク関連テーブル、必要ならシステム仕様書の残課題表を同期する。

#### 成果物

- テスト更新
- スクリーンショット証跡
- ドキュメント同期

#### 完了条件

- テスト PASS とスクリーンショット証跡更新が揃っている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `profile/not-configured` が日本語で表示される
- [ ] `avatar/not-configured` が日本語で表示される
- [ ] `error.code` を維持する構造が Renderer で確立されている
- [ ] 未知 code は transport message または既定文言へ安全に fallback する

### 品質要件

- [ ] テストケース `TC-I18N-01` `TC-I18N-02` `TC-I18N-03` が PASS
- [ ] Profile 系と Avatar 系で同じ mapping 規約を使っている
- [ ] `error.message` を UI 文言の正本にしない責務分離が保たれている

### ドキュメント要件

- [ ] Phase 11 スクリーンショット証跡が日本語 error banner へ更新されている
- [ ] 関連仕様書の残課題表または実装方針記述が同期されている
- [ ] 親ワークフローの Phase 12 成果物へ反映されている

---

## 6. 検証方法

### テストケース

| TC-ID      | シナリオ              | 期待結果                                                   |
| ---------- | --------------------- | ---------------------------------------------------------- |
| TC-I18N-01 | Profile fallback 発生 | 日本語 message が表示される                                |
| TC-I18N-02 | Avatar fallback 発生  | 日本語 message が表示される                                |
| TC-I18N-03 | 未知 code の fallback | transport message または既定文言へ安全にフォールバックする |

### 検証手順

1. Renderer 単体テストを実行し、`ProfileSection` / `AccountSection` / `authSlice` のエラー表示分岐が PASS することを確認する。
2. Phase 11 harness で profile fallback / avatar fallback を再現し、スクリーンショットを取得する。
3. 取得したスクリーンショットを目視確認し、日本語 error banner が表示されていることを確認する。
4. `verify-all-specs` / `validate-phase-output` / `validate-phase11-screenshot-coverage` / `audit-unassigned-tasks --diff-from HEAD --target-file ...` を再実行し、current 違反が 0 であることを確認する。

---

## 7. リスクと対策

| リスク                                                 | 影響度 | 発生確率 | 対策                                                                        |
| ------------------------------------------------------ | ------ | -------- | --------------------------------------------------------------------------- |
| code と message の二重管理で表示差異が出る             | 中     | 中       | `error.code` 優先、`error.message` fallback の順序を共通 utility に固定する |
| 既存テストが `authError: string` 前提で壊れる          | 中     | 中       | store 契約変更時はテスト utility と selectors を同ターンで更新する          |
| screenshot 回帰が App shell 導線に依存して不安定になる | 中     | 中       | harness ベースで再撮影する                                                  |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/11-TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001/outputs/phase-11/discovered-issues.md`
- `docs/30-workflows/completed-tasks/11-TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001/outputs/phase-11/manual-test-result.md`
- `.claude/skills/aiworkflow-requirements/references/error-handling.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`
- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`

### 参考資料

- `apps/desktop/src/renderer/components/ProfileSection/`
- `apps/desktop/src/renderer/components/SettingsView/AccountSection/`
- `apps/desktop/src/renderer/stores/authSlice.ts`
- `packages/shared/types/auth.ts`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

Phase 11 スクリーンショット再確認により、Profile / Avatar fallback はクラッシュ回避自体は達成しているが、error banner が英語 transport message を直接表示しており、日本語 UI と整合していないことを確認した。

### 補足事項

- 本未タスクは fallback ハンドラの有無ではなく、Renderer 側の表示責務整理と i18n 整合が主題である。
- transport message を直接日本語化するより、UI で code ベースに localized mapping する方が責務分離の観点で安全である。
