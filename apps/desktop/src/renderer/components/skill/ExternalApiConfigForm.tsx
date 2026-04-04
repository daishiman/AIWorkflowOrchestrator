import React, { useEffect, useState } from "react";
import type {
  ExternalApiAuthType,
  ExternalApiConnectionConfig,
} from "@repo/shared/types/skillCreatorExternalApi";

interface ExternalApiConfigFormProps {
  /** SDK Session から受け取ったイベントデータ */
  eventData?: { apiName?: string; description?: string };
  /** 送信完了コールバック */
  onSubmit: (config: ExternalApiConnectionConfig) => void | Promise<void>;
  /** キャンセルコールバック */
  onCancel: () => void;
}

export const ExternalApiConfigForm: React.FC<ExternalApiConfigFormProps> = ({
  eventData,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState(eventData?.apiName ?? "");
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState<"GET" | "POST">("GET");
  const [authType, setAuthType] = useState<ExternalApiAuthType>("none");
  const [credential, setCredential] = useState("");
  const [customHeaders, setCustomHeaders] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setName(eventData?.apiName ?? "");
    setUrl("");
    setMethod("GET");
    setAuthType("none");
    setCredential("");
    setCustomHeaders("");
    setError(null);
    setIsSubmitting(false);
  }, [eventData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("API名を入力してください");
      return;
    }
    if (!url.trim()) {
      setError("URLを入力してください");
      return;
    }
    if (authType !== "none" && !credential.trim()) {
      setError("認証情報を入力してください");
      return;
    }

    let parsedHeaders: Record<string, string> | undefined;
    if (customHeaders.trim()) {
      try {
        parsedHeaders = JSON.parse(customHeaders) as Record<string, string>;
      } catch {
        setError("カスタムヘッダーはJSON形式で入力してください");
        return;
      }
    }

    const config: ExternalApiConnectionConfig = {
      name: name.trim(),
      url: url.trim(),
      method,
      authType,
      credential: authType !== "none" ? credential : undefined,
      headers: parsedHeaders,
      description: eventData?.description,
    };

    setIsSubmitting(true);
    try {
      await onSubmit(config);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "API設定の送信に失敗しました",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="external-api-config-form">
      <h2>外部API設定</h2>
      {eventData?.description && <p>{eventData.description}</p>}

      {error && <div className="error-message">{error}</div>}

      <div className="form-field">
        <label htmlFor="api-name">API名 *</label>
        <input
          id="api-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="api-url">URL *</label>
        <input
          id="api-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.example.com/endpoint"
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="api-method">メソッド</label>
        <select
          id="api-method"
          value={method}
          onChange={(e) => setMethod(e.target.value as "GET" | "POST")}
          disabled={isSubmitting}
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="auth-type">認証種別</label>
        <select
          id="auth-type"
          value={authType}
          onChange={(e) => setAuthType(e.target.value as ExternalApiAuthType)}
          disabled={isSubmitting}
        >
          <option value="none">なし</option>
          <option value="api-key">APIキー</option>
          <option value="bearer">Bearer トークン</option>
          <option value="basic">Basic認証</option>
        </select>
      </div>

      {authType !== "none" && (
        <div className="form-field">
          <label htmlFor="credential">
            {authType === "basic" ? "ユーザー名:パスワード" : "認証情報"}
          </label>
          <input
            id="credential"
            type="password"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            disabled={isSubmitting}
            placeholder={
              authType === "basic"
                ? "username:password"
                : authType === "api-key"
                  ? "APIキーを入力"
                  : "Bearerトークンを入力"
            }
          />
        </div>
      )}

      <div className="form-field">
        <label htmlFor="custom-headers">
          カスタムヘッダー（JSON形式・任意）
        </label>
        <textarea
          id="custom-headers"
          value={customHeaders}
          onChange={(e) => setCustomHeaders(e.target.value)}
          placeholder='{"X-Custom-Header": "value"}'
          disabled={isSubmitting}
          rows={3}
        />
      </div>

      <div className="form-actions">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "送信中..." : "設定を送信"}
        </button>
        <button type="button" onClick={onCancel} disabled={isSubmitting}>
          キャンセル
        </button>
      </div>
    </form>
  );
};
