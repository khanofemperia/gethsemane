import { OrderConfirmation } from "@/components/admin/emails/OrderConfirmedTemplate";
import { ShippingConfirmation } from "@/components/admin/emails/OrderShippedTemplate";
import { DeliveredNotification } from "@/components/admin/emails/OrderDeliveredTemplate";
import { Resend } from "resend";
import { NextRequest } from "next/server";
import { EmailType } from "@/lib/sharedTypes";

const resend = new Resend(process.env.RESEND_API_KEY);

type EmailTemplateType = () => JSX.Element;

const EMAIL_TEMPLATES: Record<EmailType, EmailTemplateType> = {
  [EmailType.ORDER_CONFIRMED]: OrderConfirmation,
  [EmailType.SHIPPING_CONFIRMED]: ShippingConfirmation,
  [EmailType.DELIVERY_CONFIRMED]: DeliveredNotification,
};

type EmailRequestBodyType = {
  customerEmail: string;
  emailSubject: string;
  emailType: EmailType;
};

export async function POST(request: NextRequest) {
  try {
    const { customerEmail, emailSubject, emailType } =
      (await request.json()) as EmailRequestBodyType;

    const Template = EMAIL_TEMPLATES[emailType];

    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: customerEmail,
      subject: emailSubject,
      react: Template(),
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
