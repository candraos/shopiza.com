import "server-only";

type SmsInput = {
  phoneNumber: string;
  message: string;
};

export async function sendSms(input: SmsInput) {
  console.info(`[sms:dev] to=${input.phoneNumber}\n${input.message}`);
}
