import { defineBackend } from "@aws-amplify/backend";
import { Duration } from "aws-cdk-lib";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { FunctionUrlAuthType, HttpMethod } from "aws-cdk-lib/aws-lambda";
import { contactForm } from "./functions/contact-form/resource.js";

// SES sends through the 246labs account's verified 246labs.cloud identity, which authorizes this
// account to send as this one address (tofu-or-not-tofu: accounts/246labs/mail).
const CONTACT_FROM_EMAIL = "christopher@246labs.cloud";
const CONTACT_TO_EMAIL = "christopher@246labs.cloud";
const CONTACT_SOURCE_ARN = "arn:aws:ses:us-east-1:687159379702:identity/246labs.cloud";

const backend = defineBackend({ contactForm });

const stack = backend.createStack("contact-resources");

// Store every submission (SES delivery is best-effort on top of this)
const table = new Table(stack, "ContactMessages", {
  partitionKey: { name: "id", type: AttributeType.STRING },
  billingMode: BillingMode.PAY_PER_REQUEST,
  pointInTimeRecovery: true,
});

const lambda = backend.contactForm.resources.lambda;
table.grantWriteData(lambda);

lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["ses:SendEmail"],
    resources: [CONTACT_SOURCE_ARN],
  })
);

const cfnFunction = backend.contactForm.resources.cfnResources.cfnFunction;
cfnFunction.addPropertyOverride(
  "Environment.Variables.CONTACT_TABLE_NAME",
  table.tableName
);
cfnFunction.addPropertyOverride(
  "Environment.Variables.CONTACT_FROM_EMAIL",
  CONTACT_FROM_EMAIL
);
cfnFunction.addPropertyOverride(
  "Environment.Variables.CONTACT_TO_EMAIL",
  CONTACT_TO_EMAIL
);
cfnFunction.addPropertyOverride(
  "Environment.Variables.CONTACT_SOURCE_ARN",
  CONTACT_SOURCE_ARN
);

const functionUrl = lambda.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE,
  cors: {
    allowedOrigins: [
      "https://christophercorbin.cloud",
      "https://www.christophercorbin.cloud",
      "http://localhost:4321",
    ],
    allowedMethods: [HttpMethod.POST],
    allowedHeaders: ["content-type"],
    maxAge: Duration.hours(1),
  },
});

backend.addOutput({
  custom: {
    contactApiUrl: functionUrl.url,
  },
});
