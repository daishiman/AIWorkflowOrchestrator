# スキル・フィードバックレポート（W2-seq-03a）

## メタ情報

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| Phase    | 12                                         |
| タスクID | UT-SKILL-WIZARD-W2-SKILL-CREATE-WIZARD-001 |
| 作成日   | 2026-04-08                                 |

---

## 本タスクで得られた知見・教訓

### 1. SmartDefaultResult のステップ間受け渡し方式（Props 経由）の決定理由

**採用**: Props 経由（`smartDefaults` prop を `ConversationRoundStep` に渡す）

**理由**:

- ウィザード内で完結する一時的なデータのため、外部ストアは不要
- テストが単純（render して Props を確認するだけ）
- Context API は3ステップ程度のネストでは Over-engineering になる
- 設計変更が最小限（SkillCreateWizard が中継するだけ）

**教訓**: Props drilling は2〜3層で止まる場合は正当な設計。過早なグローバル状態化を避ける。

---

### 2. ウィザード状態管理（useState）の判断理由

**採用**: `useState` + `useWizardStep` カスタムフック

**理由**:

- ウィザードを閉じたらリセットで良い（永続化不要）
- Zustand slice を追加するコストが便益を上回らない
- `useWizardStep` でステップ制御のロジックを分離することで SkillCreateWizard が薄くなる

**教訓**: ローカル state のシンプルさを保ちつつ、複雑さはカスタムフックに委譲する。

---

### 3. NON_VISUAL 計装ポイントのテスト設計（vi.spyOn(console, 'log')）

**採用**: `vi.spyOn(console, 'log')` でスタブ検証

**理由**:

- Wave 2 では `trackEvent` スタブが `console.log` を呼ぶ設計
- 計装ポイントの存在確認には `console.log` spy で十分
- Wave 3 で `trackEvent` 本実装に変更する際は mock の切り替えだけで済む

**教訓**: スタブ関数のテストは実装の詳細（console.log か trackEvent か）を隠蔽できる設計にすることで将来の変更コストを下げられる。

---

### 4. inferSmartDefaults の shared サービス統合

**採用**: `@repo/shared/services/skillCreator` から `inferSmartDefaults` を利用

**理由**:

- 推論ロジックを shared 側へ一元化することで重複実装を防げる
- コンポーネント側はオーケストレーション責務に集中できる
- ルール変更時に修正箇所を shared サービスへ集約できる

**教訓**: 推論ロジックのような純粋関数は早めに shared へ集約し、UI 層は接続責務に限定する。

---

### 5. esbuild バージョン不一致の回避

**発見**: ワークツリー環境で `esbuild@0.21.5` のバイナリが `0.25.12` に差し替わっており vitest が起動できなかった

**対処**: `@esbuild/darwin-arm64@0.21.5` の正しいバイナリをコピーして修正

**教訓**: ワークツリー環境では `node_modules` のハードリンクが主プロジェクトの更新に影響を受けることがある。`pnpm install` で再インストールするか、バイナリを直接修正する。
