export function OrderShippedTemplate() {
  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        fontFamily: "'Times New Roman', serif",
        backgroundColor: "#FFFFFF",
        color: "#333333",
        padding: "40px 20px",
      }}
    >
      {/* Header */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "40px",
        }}
      >
        <h1
          style={{
            fontSize: "42px",
            margin: "20px 0",
            fontFamily: "'Times New Roman', serif",
            fontWeight: "normal",
            letterSpacing: "2px",
          }}
        >
          Order Shipped
        </h1>
        <div
          style={{
            fontSize: "14px",
            color: "#B8860B",
            letterSpacing: "2px",
            fontStyle: "italic",
          }}
        >
          Your order is on its way, traveling safely to you.
        </div>
      </div>
      {/* Content */}
      <div
        style={{
          border: "1px solid #E5E5E5",
          padding: "40px",
          margin: "20px 0",
          background: "rgba(0,0,0,0.02)",
        }}
      >
        {/* Order ID and Dispatch Date */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              color: "#B8860B",
              letterSpacing: "2px",
              marginBottom: "8px",
            }}
          >
            ORDER REFERENCE
          </div>
          <div
            style={{
              fontSize: "28px",
              margin: "10px 0",
              letterSpacing: "3px",
              fontFamily: "'Times New Roman', serif",
            }}
          >
            #CG2187-W
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "#666666",
              fontStyle: "italic",
              marginTop: "8px",
            }}
          >
            Dispatched on November 10, 2024
          </div>
        </div>
        {/* Divider */}
        <div
          style={{
            width: "100%",
            height: "1px",
            background: "linear-gradient(to right, #FFFFFF, #E5E5E5, #FFFFFF)",
            margin: "30px 0",
          }}
        ></div>
        {/* Expected Delivery Date */}
        <div
          style={{
            textAlign: "center",
            padding: "30px 0",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              color: "#B8860B",
              letterSpacing: "2px",
              marginBottom: "15px",
            }}
          >
            EXPECTED DELIVERY
          </div>
          <div
            style={{
              fontSize: "18px",
              lineHeight: 1.6,
              fontFamily: "'Times New Roman', serif",
            }}
          >
            November 14, 2024
          </div>
        </div>
        {/* Divider */}
        <div
          style={{
            width: "100%",
            height: "1px",
            background: "linear-gradient(to right, #FFFFFF, #E5E5E5, #FFFFFF)",
            margin: "30px 0",
          }}
        ></div>
        {/* Support */}
        <div
          style={{
            textAlign: "center",
            marginTop: "30px",
          }}
        >
          <p
            style={{
              fontSize: "14px",
              color: "#666666",
              lineHeight: 1.6,
              marginBottom: "20px",
            }}
          >
            For any shipping inquiries, feel free to reach us at
          </p>
          <a
            href="mailto:support@cherlygood.com"
            style={{
              color: "#B8860B",
              textDecoration: "none",
              fontSize: "16px",
              letterSpacing: "1px",
            }}
          >
            support@cherlygood.com
          </a>
        </div>
      </div>
      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          marginTop: "40px",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            color: "#999999",
            letterSpacing: "2px",
          }}
        >
          CAREFULLY CURATED FOR YOUR SATISFACTION
        </div>
      </div>
    </div>
  );
}
