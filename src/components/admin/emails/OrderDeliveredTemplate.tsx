export function OrderDeliveredTemplate() {
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
          Order Delivered
        </h1>
        <div
          style={{
            fontSize: "14px",
            color: "#B8860B",
            letterSpacing: "2px",
            fontStyle: "italic",
          }}
        >
          We hope you enjoy your new purchase!
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
        {/* Order ID and Delivery Date */}
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
            Delivered on November 14, 2024
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
            If you have any questions or concerns, our team is here to help.
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
