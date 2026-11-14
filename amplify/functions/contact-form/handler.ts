import { randomUUID } from "node:crypto";
import { DynamoDBClient, PutItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ddb = new DynamoDBClient({});
// Same region as the SES identity in CONTACT_SOURCE_ARN; delegated sends must use that region.
const ses = new SESClient({ region: "us-east-1" });

const TABLE_NAME = process.env.CONTACT_TABLE_NAME;
const CONTACT_FROM_EMAIL = process.env.CONTACT_FROM_EMAIL;
const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL;
// Optional: the ARN of another account's SES identity that authorizes us to send as CONTACT_FROM_EMAIL.
const CONTACT_SOURCE_ARN = process.env.CONTACT_SOURCE_ARN || undefined;

const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 5000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FunctionUrlEvent {
  body?: string;
  isBase64Encoded?: boolean;
  requestContext?: { http?: { method?: string } };
}

interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

const response = (statusCode: number, body: Record<string, string>) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const parsePayload = (event: FunctionUrlEvent): ContactPayload | null => {
  if (!event.body) return null;
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf-8")
    : event.body;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof parsed !== "object" || parsed === null) return null;
  const { name, email, message } = parsed as Record<string, unknown>;
  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string"
  ) {
    return null;
  }

  return { name: name.trim(), email: email.trim(), message: message.trim() };
};

export const handler = async (event: FunctionUrlEvent) => {
  if (event.requestContext?.http?.method !== "POST") {
    return response(405, { error: "Method not allowed" });
  }

  if (!TABLE_NAME || !CONTACT_FROM_EMAIL || !CONTACT_TO_EMAIL) {
    console.error("Missing CONTACT_TABLE_NAME, CONTACT_FROM_EMAIL or CONTACT_TO_EMAIL env vars");
    return response(500, { error: "Server misconfigured" });
  }

  const payload = parsePayload(event);
  if (!payload) {
    return response(400, { error: "Invalid request body" });
  }

  const { name, email, message } = payload;
  if (!name || name.length > MAX_NAME) {
    return response(400, { error: "Name is required (max 100 chars)" });
  }
  if (!EMAIL_RE.test(email) || email.length > MAX_EMAIL) {
    return response(400, { error: "A valid email is required" });
  }
  if (!message || message.length > MAX_MESSAGE) {
    return response(400, { error: "Message is required (max 5000 chars)" });
  }

  const id = randomUUID();
  const receivedAt = new Date().toISOString();

  await ddb.send(
    new PutItemCommand({
      TableName: TABLE_NAME,
      Item: {
        id: { S: id },
        receivedAt: { S: receivedAt },
        name: { S: name },
        email: { S: email },
        message: { S: message },
      },
    })
  );

  try {
    await ses.send(
      new SendEmailCommand({
        Source: CONTACT_FROM_EMAIL,
        SourceArn: CONTACT_SOURCE_ARN,
        Destination: { ToAddresses: [CONTACT_TO_EMAIL] },
        ReplyToAddresses: [email],
        Message: {
          Subject: { Data: `Portfolio contact from ${name}` },
          Body: {
            Text: {
              Data: `Name: ${name}\nEmail: ${email}\nReceived: ${receivedAt}\nID: ${id}\n\n${message}`,
            },
          },
        },
      })
    );
  } catch (err) {
    // Message is already persisted in DynamoDB; flag it as not emailed so it can be found and resent.
    console.error("SES send failed (message stored in DynamoDB)", err);
    try {
      await ddb.send(
        new UpdateItemCommand({
          TableName: TABLE_NAME,
          Key: { id: { S: id } },
          UpdateExpression: "SET emailFailed = :t",
          ExpressionAttributeValues: { ":t": { BOOL: true } },
        })
      );
    } catch (flagErr) {
      console.error("Could not flag the message as not emailed", flagErr);
    }
  }

  return response(200, { id });
};
