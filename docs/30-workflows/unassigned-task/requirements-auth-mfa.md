# 多要素認証（MFA）実装要件定義 - タスク指示書

## メタ情報

| 項目             | 内容                          |
| ---------------- | ----------------------------- |
| タスクID         | FEAT-001                      |
| タスク名         | 多要素認証（MFA）実装要件定義 |
| 分類             | 要件                          |
| 対象機能         | OAuth認証（Desktop）          |
| 優先度           | 低                            |
| 見積もり規模     | 大規模                        |
| ステータス       | 未実施                        |
| 発見元           | ユーザー要望（Phase 9）       |
| 発見日           | 2025-12-22                    |
| 発見エージェント | -                             |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

現在のOAuth認証は、OAuthプロバイダーのアカウントのみでログインできます。セキュリティ要件の高いユーザー向けに、追加の認証要素（TOTP、SMS等）を提供する必要があります。

### 1.2 問題点・課題

**現在のセキュリティレベル**:

- OAuth認証のみ（1要素認証）
- OAuthアカウントが侵害されると即座にアクセス可能
- 機密情報を扱うユーザーには不十分

### 1.3 放置した場合の影響

| 影響領域         | 影響度 | 説明                                       |
| ---------------- | ------ | ------------------------------------------ |
| セキュリティ     | Medium | アカウント侵害のリスク                     |
| コンプライアンス | Medium | 高セキュリティ要件のユーザーに対応できない |
| ユーザー信頼     | Low    | セキュリティ意識の高いユーザーが利用しない |

---

## 2. 何を達成するか（What）

### 2.1 目的

多要素認証（MFA）の実装要件を定義し、セキュリティレベルを向上させる。

### 2.2 最終ゴール

- ✅ MFA要件定義完了
- ✅ 対応方式の決定（TOTP、SMS、WebAuthn等）
- ✅ UI/UXフロー設計
- ✅ 技術選定（ライブラリ、プロバイダー等）
- ✅ 実装計画策定

### 2.3 スコープ

#### 含むもの

- MFA要件定義
- 対応方式の比較検討
- UI/UXフロー設計
- 技術選定
- 実装タスクの洗い出し

#### 含まないもの

- 実際の実装（本要件定義完了後に別タスクとして実施）
- バックアップコード生成（将来対応）
- ハードウェアトークン対応（将来対応）

### 2.4 成果物

| 種別     | 成果物              | 配置先                                                         |
| -------- | ------------------- | -------------------------------------------------------------- |
| 要件定義 | MFA要件定義書       | `docs/20-specifications/mfa-requirements.md`                   |
| 設計     | MFA UI/UXフロー図   | `docs/10-design/mfa-ux-flow.md`                                |
| タスク   | MFA実装タスクリスト | `docs/30-workflows/unassigned-task/task-mfa-implementation.md` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [ ] ログイン機能復旧プロジェクト（T-02-1〜T-09-1）が完了していること
- [ ] OAuth認証が正常に動作していること

### 3.2 依存タスク

**推奨（先に完了推奨）**:

- DEBT-SEC-001（State parameter検証）
- DEBT-SEC-002（PKCE実装）

**同時実施可能なタスク**:

- すべてのUX改善タスク
- すべてのコード品質タスク

### 3.3 必要な知識・スキル

- 多要素認証の仕組み（TOTP、SMS、WebAuthn）
- セキュリティベストプラクティス
- Supabase Auth MFA機能（あれば）
- UI/UX設計

### 3.4 推奨アプローチ

1. **段階的導入**: まずTOTPから開始、将来的にSMS/WebAuthnを追加
2. **オプション機能**: 必須ではなく、ユーザーが有効/無効を選択可能
3. **バックアップコード**: TOTP紛失時の復旧手段を提供
4. **Supabase連携**: Supabase Auth のMFA機能を活用（対応していれば）

---

## 4. 実行手順

### Phase構成

```
Phase 1: MFA方式の比較検討
  ↓
Phase 2: Supabase MFA対応状況調査
  ↓
Phase 3: UI/UXフロー設計
  ↓
Phase 4: 技術選定
  ↓
Phase 5: 実装タスクの洗い出し
  ↓
Phase 6: 要件定義書作成
```

---

### Phase 1: MFA方式の比較検討

#### 目的

TOTP、SMS、WebAuthn等のMFA方式を比較し、優先順位を決定する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
@sec-auditor MFA方式を比較検討してください。

検討項目:
- TOTP（Google Authenticator等）
- SMS認証
- WebAuthn（指紋認証、Face ID等）
- メール認証
- バックアップコード

比較観点:
- セキュリティレベル
- ユーザー体験
- 実装コスト
- 運用コスト
- 対応デバイス

成果物: docs/20-specifications/mfa-comparison.md
```

#### 使用エージェント

- **エージェント**: .claude/agents/sec-auditor.md
- **選定理由**: セキュリティ要件定義の専門家。MFA方式の比較検討に最適。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名            | 活用方法                 |
| ------------------- | ------------------------ |
| .claude/skills/rbac-implementation/SKILL.md | 認証・認可設計           |
| .claude/skills/oauth2-flows/SKILL.md        | OAuth 2.0拡張としてのMFA |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物          | パス                                       | 内容            |
| --------------- | ------------------------------------------ | --------------- |
| MFA方式比較資料 | `docs/20-specifications/mfa-comparison.md` | MFA方式比較検討 |

#### 完了条件

- [ ] MFA方式比較完了
- [ ] 優先順位決定
- [ ] 推奨方式の選定

---

### Phase 2: Supabase MFA対応状況調査

#### 目的

Supabase Auth がMFA機能をサポートしているか確認し、実装可能性を判断する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
Supabase Auth のMFA対応状況を調査してください。

確認事項:
- MFA APIの有無
- 対応方式（TOTP/SMS/WebAuthn）
- 実装例・ドキュメント

参考: https://supabase.com/docs/guides/auth/auth-mfa
```

#### 使用エージェント

- **エージェント**: .claude/agents/auth-specialist.md
- **選定理由**: Supabase Auth APIの専門家。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名     | 活用方法                |
| ------------ | ----------------------- |
| .claude/skills/oauth2-flows/SKILL.md | Supabase Auth仕様の理解 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物           | パス                                                         | 内容              |
| ---------------- | ------------------------------------------------------------ | ----------------- |
| Supabase MFA調査 | `docs/30-workflows/unassigned-task/supabase-mfa-research.md` | MFA対応状況まとめ |

#### 完了条件

- [ ] Supabase MFA対応状況を確認
- [ ] 実装可能性を判断
- [ ] 代替案を検討（サポートされていない場合）

---

### Phase 3: UI/UXフロー設計

#### 目的

MFA有効化・認証フローのUI/UXを設計する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
@ui-designer MFAのUI/UXフローを設計してください。

設計項目:
- MFA有効化画面
- QRコード表示（TOTP）
- 確認コード入力画面
- ログイン時のMFA認証画面
- バックアップコード表示

成果物: docs/10-design/mfa-ux-flow.md
```

#### 使用エージェント

- **エージェント**: .claude/agents/ui-designer.md
- **選定理由**: UI/UX設計の専門家。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名               | 活用方法                 |
| ---------------------- | ------------------------ |
| .claude/skills/accessibility-wcag/SKILL.md     | アクセシブルなMFA UI設計 |
| .claude/skills/progressive-disclosure/SKILL.md | MFA設定の段階的公開      |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物         | パス                            | 内容            |
| -------------- | ------------------------------- | --------------- |
| MFA UXフロー図 | `docs/10-design/mfa-ux-flow.md` | UI/UXフロー設計 |

#### 完了条件

- [ ] UI/UXフロー設計完了
- [ ] 画面遷移図作成完了
- [ ] ワイヤーフレーム作成完了

---

### Phase 4: 技術選定

#### 目的

MFA実装に使用するライブラリ・プロバイダーを選定する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
@auth-specialist MFA実装のライブラリを選定してください。

検討項目:
- TOTPライブラリ（otplib、speakeasy等）
- QRコード生成（qrcode等）
- WebAuthnライブラリ（@simplewebauthn等）
- SMS送信プロバイダー（Twilio、AWS SNS等）

選定基準:
- セキュリティ
- メンテナンス状況
- ライセンス
- 実装コスト

成果物: docs/20-specifications/mfa-tech-selection.md
```

#### 使用エージェント

- **エージェント**: .claude/agents/auth-specialist.md
- **選定理由**: 認証技術の専門家。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名            | 活用方法                   |
| ------------------- | -------------------------- |
| .claude/skills/dependency-auditing/SKILL.md | ライブラリセキュリティ確認 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物       | パス                                           | 内容           |
| ------------ | ---------------------------------------------- | -------------- |
| 技術選定資料 | `docs/20-specifications/mfa-tech-selection.md` | ライブラリ選定 |

#### 完了条件

- [ ] ライブラリ選定完了
- [ ] セキュリティ確認完了

---

### Phase 5: 実装タスクの洗い出し

#### 目的

MFA実装に必要なタスクを洗い出し、実装計画を策定する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
@spec-writer MFA実装タスクを洗い出してください。

洗い出し項目:
- バックエンド実装タスク
- フロントエンド実装タスク
- テストタスク
- ドキュメントタスク
- デプロイタスク

成果物: docs/30-workflows/unassigned-task/task-mfa-implementation.md
```

#### 使用エージェント

- **エージェント**: .claude/agents/spec-writer.md
- **選定理由**: タスク指示書作成の専門家。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                               | 活用方法         |
| -------------------------------------- | ---------------- |
| .claude/skills/functional-non-functional-requirements/SKILL.md | 要件の洗い出し   |
| .claude/skills/acceptance-criteria-writing/SKILL.md            | 受け入れ基準定義 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物              | パス                                                           | 内容           |
| ------------------- | -------------------------------------------------------------- | -------------- |
| MFA実装タスクリスト | `docs/30-workflows/unassigned-task/task-mfa-implementation.md` | 実装タスク一覧 |

#### 完了条件

- [ ] 実装タスク洗い出し完了
- [ ] タスク優先順位決定
- [ ] 実装計画策定完了

---

### Phase 6: 要件定義書作成

#### 目的

MFA実装の要件定義書を作成する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
@req-analyst MFA要件定義書を作成してください。

内容:
- MFAの目的・背景
- 機能要件（TOTP有効化、認証フロー等）
- 非機能要件（セキュリティ、ユーザビリティ等）
- 受け入れ基準
- 実装計画

成果物: docs/20-specifications/mfa-requirements.md
```

#### 使用エージェント

- **エージェント**: .claude/agents/req-analyst.md
- **選定理由**: 要件定義の専門家。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                               | 活用方法         |
| -------------------------------------- | ---------------- |
| .claude/skills/functional-non-functional-requirements/SKILL.md | 要件定義書作成   |
| .claude/skills/acceptance-criteria-writing/SKILL.md            | 受け入れ基準定義 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物        | パス                                         | 内容        |
| ------------- | -------------------------------------------- | ----------- |
| MFA要件定義書 | `docs/20-specifications/mfa-requirements.md` | MFA要件定義 |

#### 完了条件

- [ ] 要件定義書作成完了
- [ ] 受け入れ基準定義完了

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] MFA方式比較完了
- [ ] Supabase MFA対応状況確認完了
- [ ] UI/UXフロー設計完了
- [ ] 技術選定完了
- [ ] 実装タスク洗い出し完了
- [ ] 要件定義書作成完了

### 品質要件

- [ ] セキュリティレビュー通過

### ドキュメント要件

- [ ] 要件定義書作成完了
- [ ] UI/UXフロー図作成完了
- [ ] 技術選定資料作成完了

---

## 6. 検証方法

### 検証手順

```bash
# 要件定義書のレビュー
@req-analyst mfa-requirements.mdをレビューしてください

# セキュリティレビュー
@sec-auditor MFA要件をセキュリティ観点でレビューしてください
```

---

## 7. リスクと対策

| リスク                 | 影響度 | 発生確率 | 対策                              | 対応サブタスク |
| ---------------------- | ------ | -------- | --------------------------------- | -------------- |
| Supabase MFA未サポート | High   | Medium   | 代替実装検討、外部MFAサービス利用 | Phase 2        |
| 実装工数の過小見積もり | Medium | High     | 段階的実装、MVP優先               | Phase 5        |
| ユーザー体験の複雑化   | Medium | Medium   | 適切なオンボーディング設計        | Phase 3        |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/00-requirements/17-security-guidelines.md` - セキュリティガイドライン
- `docs/00-requirements/16-ui-ux-guidelines.md` - UI/UXガイドライン

### 参考資料

- [NIST SP 800-63B - Digital Identity Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)
- [OWASP MFA Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html)
- [Supabase MFA Documentation](https://supabase.com/docs/guides/auth/auth-mfa)

---

## 9. 備考

### 補足事項

- MFAは将来機能として、本タスクでは要件定義のみ実施
- 実装は別のスプリントで計画的に実施
- ユーザーの混乱を避けるため、適切なオンボーディングとヘルプドキュメントが必須
- バックアップコードは必須（TOTP紛失時の復旧手段）
- Supabase MFA対応状況により、実装方針が大きく変わる可能性あり
