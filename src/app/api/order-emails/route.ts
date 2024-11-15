import { OrderConfirmedTemplate } from "@/components/admin/emails/OrderConfirmedTemplate";
import { OrderShippedTemplate } from "@/components/admin/emails/OrderShippedTemplate";
import { OrderDeliveredTemplate } from "@/components/admin/emails/OrderDeliveredTemplate";
import { Resend } from "resend";
import { NextRequest } from "next/server";
import { EmailType, AlertMessageType } from "@/lib/sharedTypes";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { database } from "@/lib/firebase";
import { revalidatePath } from "next/cache";

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

const EMAIL_TYPE_TO_KEY: Record<EmailType, string> = {
  [EmailType.ORDER_CONFIRMED]: "confirmed",
  [EmailType.ORDER_SHIPPED]: "shipped",
  [EmailType.ORDER_DELIVERED]: "delivered",
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
    const emailKey = EMAIL_TYPE_TO_KEY[emailType];

    if (!emailKey) {
      return {
        type: AlertMessageType.ERROR,
        message: "Invalid email type",
      };
    }

    if (!orderData?.emails || !orderData.emails[emailKey]) {
      return {
        type: AlertMessageType.ERROR,
        message: "Email configuration not found",
      };
    }

    const emailStatus = orderData.emails[emailKey];

    if (emailStatus.sentCount >= emailStatus.maxAllowed) {
      return {
        type: AlertMessageType.ERROR,
        message: "Max email send limit reached",
      };
    }

    return { emailStatus, orderData, orderRef, emailKey };
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
  emailKey: string,
  orderData: any
) {
  try {
    const currentEmailStatus = orderData.emails[emailKey];

    const updatedOrderData = {
      ...orderData,
      emails: {
        ...orderData.emails,
        [emailKey]: {
          ...currentEmailStatus,
          sentCount: (currentEmailStatus.sentCount || 0) + 1,
          lastSent: new Date().toISOString(),
        },
      },
    };

    await setDoc(orderRef, updatedOrderData);

    return {
      type: AlertMessageType.SUCCESS,
      message: `Email count updated for ${emailKey}`,
    };
  } catch (error) {
    console.error("Error updating email count:", error);
    return {
      type: AlertMessageType.ERROR,
      message: "Failed to update email count",
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { orderId, customerEmail, emailSubject, emailType } =
      (await request.json()) as EmailRequestBodyType;

    const emailStatusResult = await updateEmailStatus(orderId, emailType);
    if (emailStatusResult.type === AlertMessageType.ERROR) {
      return Response.json(emailStatusResult, { status: 500 });
    }

    const { orderData, orderRef, emailKey } = emailStatusResult as {
      orderData: any;
      orderRef: any;
      emailKey: string;
      emailStatus: any;
    };

    const EmailTemplate = EMAIL_TEMPLATES[emailType];
    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: customerEmail,
      subject: emailSubject,
      react: EmailTemplate(),
    });

    if (error) {
      return Response.json(
        { type: AlertMessageType.ERROR, message: "Failed to send email" },
        { status: 500 }
      );
    }

    const updateResult = await incrementEmailCount(
      orderRef,
      emailKey,
      orderData
    );

    revalidatePath("/admin/orders/[id]", "page");

    if (updateResult.type === AlertMessageType.ERROR) {
      console.error("Failed to update email count:", updateResult.message);
      return Response.json({
        type: AlertMessageType.SUCCESS,
        message: "Email sent successfully",
      });
    }

    return Response.json({
      type: AlertMessageType.SUCCESS,
      message: "Email sent and count updated successfully",
    });
  } catch (error) {
    console.error("Internal server error:", error);
    return Response.json(
      { type: AlertMessageType.ERROR, message: "Internal server error" },
      { status: 500 }
    );
  }
}
