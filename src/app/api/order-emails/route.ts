import { OrderConfirmedTemplate } from "@/components/admin/emails/OrderConfirmedTemplate";
import { OrderShippedTemplate } from "@/components/admin/emails/OrderShippedTemplate";
import { OrderDeliveredTemplate } from "@/components/admin/emails/OrderDeliveredTemplate";
import { Resend } from "resend";
import { NextRequest } from "next/server";
import { EmailType, AlertMessageType } from "@/lib/sharedTypes";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { database } from "@/lib/firebase";

const resend = new Resend(process.env.RESEND_API_KEY);

type EmailTemplateType = () => JSX.Element;

const EMAIL_TEMPLATES: Record<EmailType, EmailTemplateType> = {
  [EmailType.ORDER_CONFIRMED]: OrderConfirmedTemplate,
  [EmailType.ORDER_SHIPPED]: OrderShippedTemplate,
  [EmailType.ORDER_DELIVERED]: OrderDeliveredTemplate,
};

type EmailRequestBodyType = {
  orderId: string;
  customerEmail: string;
  emailSubject: string;
  emailType: EmailType;
};

async function updateEmailStatus(orderId: string, emailType: EmailType) {
  try {
    const orderRef = doc(database, "orders", orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return {
        type: AlertMessageType.ERROR,
        message: "Order not found",
      };
    }

    const orderData = orderSnap.data();
    const emailStatus = orderData?.emails[emailType];

    if (emailStatus.sentCount >= emailStatus.maxAllowed) {
      return {
        type: AlertMessageType.ERROR,
        message: "Max email send limit reached",
      };
    }

    return { emailStatus, orderData, orderRef };
  } catch (error) {
    console.error("Error fetching email status:", error);
    return {
      type: AlertMessageType.ERROR,
      message: "Failed to fetch email status",
    };
  }
}

async function incrementEmailCount(
  orderRef: any,
  emailType: EmailType,
  orderData: any,
  emailStatus: any
) {
  try {
    const updatedEmailStatus = {
      ...emailStatus,
      sentCount: emailStatus.sentCount + 1,
      lastSent: new Date().toISOString(),
    };

    const updatedOrderData = {
      ...orderData,
      emails: {
        ...orderData?.emails,
        [emailType]: updatedEmailStatus,
      },
    };

    await setDoc(orderRef, updatedOrderData);

    return {
      type: AlertMessageType.SUCCESS,
      message: `Email for ${emailType} updated successfully`,
    };
  } catch (error) {
    console.error("Error updating email status:", error);

    return {
      type: AlertMessageType.ERROR,
      message: "Failed to update email status",
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { orderId, customerEmail, emailSubject, emailType } =
      (await request.json()) as EmailRequestBodyType;

    // Fetch the email status data
    const emailStatusResult = await updateEmailStatus(orderId, emailType);

    if (emailStatusResult.type === AlertMessageType.ERROR) {
      return Response.json(emailStatusResult, { status: 500 });
    }

    const { emailStatus, orderData, orderRef } = emailStatusResult;

    // Proceed with sending the email using the Resend API
    const EmailTemplate = EMAIL_TEMPLATES[emailType];

    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: customerEmail,
      subject: emailSubject,
      react: EmailTemplate(),
    });

    if (error) {
      return Response.json({ error: "Failed to send email" }, { status: 500 });
    }

    // Only update the email status if the email was successfully sent
    const updateResult = await incrementEmailCount(
      orderRef,
      emailType,
      orderData,
      emailStatus
    );

    // Ensure that the update result is returned and logged
    if (updateResult.type === AlertMessageType.ERROR) {
      return Response.json(updateResult, { status: 500 });
    }

    return Response.json({ message: "Email sent successfully", emailData: data });
  } catch (error) {
    console.error("Internal server error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
