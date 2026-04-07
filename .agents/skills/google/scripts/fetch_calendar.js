/**
 * Google Calendar API クライアント
 *
 * 認証方式（優先順）:
 * 1. GOOGLE_APPLICATION_CREDENTIALS - サービスアカウント JSON ファイルパス
 * 2. GOOGLE_SERVICE_ACCOUNT_JSON    - サービスアカウント JSON の Base64 エンコード
 * 3. GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET + GOOGLE_REFRESH_TOKEN - OAuth 2.0
 */

import { google } from "googleapis";

/**
 * 認証クライアントを取得する
 * @returns {Promise<import('googleapis').Auth.AuthClient>}
 */
async function getAuthClient() {
  // サービスアカウント: ファイルパス指定
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
    });
  }

  // サービスアカウント: Base64 エンコード JSON
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    const credentials = JSON.parse(
      Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_JSON, "base64").toString(
        "utf-8"
      )
    );
    return new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
    });
  }

  // OAuth 2.0 リフレッシュトークン方式
  if (
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN
  ) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });
    return oauth2Client;
  }

  throw new Error(
    "Google 認証情報が設定されていません。\n" +
      "GOOGLE_APPLICATION_CREDENTIALS, GOOGLE_SERVICE_ACCOUNT_JSON, または\n" +
      "GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET + GOOGLE_REFRESH_TOKEN を設定してください。"
  );
}

/**
 * 指定日のカレンダーイベントを取得する
 *
 * @param {string} calendarId - カレンダー ID（例: "primary" or "xxx@group.calendar.google.com"）
 * @param {Date}   targetDate - 取得対象の日付（デフォルト: 今日）
 * @param {number} maxResults - 最大取得件数（デフォルト: 50）
 * @returns {Promise<CalendarEvent[]>}
 */
export async function fetchTodayEvents(
  calendarId,
  targetDate = new Date(),
  maxResults = 50
) {
  const auth = await getAuthClient();
  const calendar = google.calendar({ version: "v3", auth });

  // 対象日の開始〜終了（ローカルタイム基準）
  const startOfDay = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate(),
    0,
    0,
    0,
    0
  );
  const endOfDay = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate(),
    23,
    59,
    59,
    999
  );

  const response = await calendar.events.list({
    calendarId,
    timeMin: startOfDay.toISOString(),
    timeMax: endOfDay.toISOString(),
    maxResults,
    singleEvents: true, // 繰り返しイベントを個別に展開
    orderBy: "startTime",
  });

  const items = response.data.items || [];

  // 必要なフィールドだけを正規化して返す
  return items.map((event) => ({
    id: event.id ?? "",
    title: event.summary ?? "(タイトルなし)",
    description: stripHtml(event.description ?? ""),
    location: event.location ?? "",
    start: event.start?.dateTime ?? event.start?.date ?? "",
    end: event.end?.dateTime ?? event.end?.date ?? "",
    isAllDay: Boolean(event.start?.date && !event.start?.dateTime),
    attendees: (event.attendees ?? []).map((a) => a.email ?? "").filter(Boolean),
    status: event.status ?? "confirmed",
    hangoutLink: event.hangoutLink ?? "",
    htmlLink: event.htmlLink ?? "",
  }));
}

/**
 * HTML タグを除去する
 * @param {string} html
 * @returns {string}
 */
function stripHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
}

/**
 * @typedef {Object} CalendarEvent
 * @property {string}   id          - イベント ID
 * @property {string}   title       - タイトル
 * @property {string}   description - 説明（HTML タグ除去済み）
 * @property {string}   location    - 場所
 * @property {string}   start       - 開始日時（ISO 文字列 or 日付文字列）
 * @property {string}   end         - 終了日時
 * @property {boolean}  isAllDay    - 終日フラグ
 * @property {string[]} attendees   - 参加者メールアドレス一覧
 * @property {string}   status      - イベントステータス（confirmed / tentative / cancelled）
 * @property {string}   hangoutLink - Google Meet URL
 * @property {string}   htmlLink    - Google Calendar 詳細ページ URL
 */
