import { useState } from "react";

interface RFPItem {
  name: string;
  qty: number;
  spec: string;
}

interface RFPData {
  id: string;
  title: string;
  budget: number;
  deliveryTimeline: string;
  items: RFPItem[];
  paymentTerms: string;
  warranty: string;
}

interface Recipient {
  email: string;
  name: string;
}

export default function CreateRFP() {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [rfp, setRfp] = useState<RFPData | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([
    { email: "", name: "" },
  ]);
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const generateRFP = async () => {
    setLoading(true);
    setSendStatus(null);
    try {
      const res = await fetch("http://localhost:5000/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: description }),
      });

      const data = await res.json();
      if (data.success) {
        setRfp(data.data);
      } else {
        alert("Failed to generate RFP: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error generating RFP");
    }
    setLoading(false);
  };

  const addRecipient = () => {
    setRecipients([...recipients, { email: "", name: "" }]);
  };

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const updateRecipient = (
    index: number,
    field: "email" | "name",
    value: string
  ) => {
    const updated = [...recipients];
    updated[index][field] = value;
    setRecipients(updated);
  };

  const generateEmailHTML = (rfp: RFPData, recipientName: string): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px; }
          .content { background: #f9fafb; padding: 20px; margin-top: 20px; border-radius: 8px; }
          .item { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #2563eb; }
          .label { font-weight: bold; color: #1f2937; }
          .value { color: #4b5563; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background: #f3f4f6; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Request for Proposal (RFP)</h1>
            <p>RFP ID: ${rfp.id}</p>
          </div>
          
          <div class="content">
            <p>Dear ${recipientName || "Vendor"},</p>
            <p>We are pleased to invite you to submit a proposal for the following requirement:</p>
            
            <div class="item">
              <p><span class="label">Title:</span> <span class="value">${
                rfp.title
              }</span></p>
              <p><span class="label">Budget:</span> <span class="value">₹${rfp.budget.toLocaleString()}</span></p>
              <p><span class="label">Delivery Timeline:</span> <span class="value">${
                rfp.deliveryTimeline
              }</span></p>
              <p><span class="label">Payment Terms:</span> <span class="value">${
                rfp.paymentTerms
              }</span></p>
              <p><span class="label">Warranty:</span> <span class="value">${
                rfp.warranty
              }</span></p>
            </div>
            
            <h3>Items Required:</h3>
            <table>
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Quantity</th>
                  <th>Specifications</th>
                </tr>
              </thead>
              <tbody>
                ${rfp.items
                  .map(
                    (item) => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.qty}</td>
                    <td>${item.spec}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
            
            <p style="margin-top: 20px;">Please submit your proposal by replying to this email with your quotation and any additional information.</p>
            
            <p>Best regards,<br>Procurement Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const sendRFP = async () => {
    if (!rfp) return;

    // Validate recipients
    const validRecipients = recipients.filter(
      (r) => r.email && r.email.includes("@")
    );
    if (validRecipients.length === 0) {
      alert("Please add at least one valid email address");
      return;
    }

    setSending(true);
    setSendStatus(null);

    try {
      const results = await Promise.allSettled(
        validRecipients.map(async (recipient) => {
          const emailHTML = generateEmailHTML(rfp, recipient.name);
          const subject = `RFP: ${rfp.title} - ${rfp.id}`;

          const res = await fetch("http://localhost:5000/api/send-rfp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: recipient.email,
              subject: subject,
              html: emailHTML,
            }),
          });

          const data = await res.json();
          if (!data.success) {
            throw new Error(data.error || "Failed to send email");
          }
          return { email: recipient.email, success: true };
        })
      );

      const successCount = results.filter(
        (r) => r.status === "fulfilled"
      ).length;
      const failCount = results.filter((r) => r.status === "rejected").length;

      if (failCount === 0) {
        setSendStatus({
          success: true,
          message: `✅ RFP sent successfully to ${successCount} recipient(s)!`,
        });

        // Save RFP to localStorage for tracking
        const myRFPs = JSON.parse(localStorage.getItem("myRFPs") || "[]");
        myRFPs.push({
          ...rfp,
          sentTo: validRecipients.map((r) => r.email),
          createdAt: new Date().toISOString(),
          status: "pending",
        });
        localStorage.setItem("myRFPs", JSON.stringify(myRFPs));
      } else {
        setSendStatus({
          success: false,
          message: `⚠️ Sent to ${successCount} recipient(s), failed for ${failCount}`,
        });
      }
    } catch (err) {
      console.error(err);
      setSendStatus({
        success: false,
        message: "❌ Error sending RFP emails",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-gray-100 p-6 gap-6">
      {/* Header */}
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          RFP Generator & Sender
        </h1>
        <p className="text-gray-600">
          Create professional RFPs from text and send to multiple vendors
        </p>
      </div>

      {/* Step 1: Generate RFP */}
      <div className="w-full max-w-4xl bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
            1
          </span>
          Create New RFP
        </h2>

        <textarea
          className="w-full h-40 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Example: I need 50 laptops with i5 processor, 8GB RAM, 256GB SSD. Budget is around 2 lakh. Need them within 15 days."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          disabled={!description || loading}
          onClick={generateRFP}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl text-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "⏳ Generating…" : "🤖 Generate RFP with AI"}
        </button>
      </div>

      {/* Step 2: View Generated RFP */}
      {rfp && (
        <div className="w-full max-w-4xl bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
              ✓
            </span>
            Generated RFP
          </h2>

          <div className="bg-linear-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600 font-semibold">RFP ID</p>
                <p className="text-lg font-mono">{rfp.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold">Title</p>
                <p className="text-lg font-semibold">{rfp.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold">Budget</p>
                <p className="text-lg font-semibold text-green-600">
                  ₹{rfp.budget.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold">
                  Delivery Timeline
                </p>
                <p className="text-lg">{rfp.deliveryTimeline}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold">
                  Payment Terms
                </p>
                <p className="text-lg">{rfp.paymentTerms}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold">Warranty</p>
                <p className="text-lg">{rfp.warranty}</p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-600 font-semibold mb-3">
                Items Required
              </p>
              <div className="space-y-3">
                {rfp.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-4 rounded-lg border border-gray-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.spec}
                        </p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold ml-4">
                        Qty: {item.qty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Add Recipients and Send */}
      {rfp && (
        <div className="w-full max-w-4xl bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
              2
            </span>
            Send to Recipients
          </h2>

          <div className="space-y-3 mb-4">
            {recipients.map((recipient, index) => (
              <div key={index} className="flex gap-3 items-start">
                <input
                  type="text"
                  placeholder="Recipient Name"
                  value={recipient.name}
                  onChange={(e) =>
                    updateRecipient(index, "name", e.target.value)
                  }
                  className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={recipient.email}
                  onChange={(e) =>
                    updateRecipient(index, "email", e.target.value)
                  }
                  className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                {recipients.length > 1 && (
                  <button
                    onClick={() => removeRecipient(index)}
                    className="p-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-colors"
                    title="Remove recipient"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={addRecipient}
            className="w-full p-3 border-2 border-dashed border-gray-300 hover:border-purple-400 text-gray-600 hover:text-purple-600 rounded-xl transition-colors mb-4"
          >
            + Add Another Recipient
          </button>

          <button
            disabled={sending}
            onClick={sendRFP}
            className="w-full bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white p-4 rounded-xl text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {sending ? "📤 Sending Emails…" : "📧 Send RFP to All Recipients"}
          </button>

          {sendStatus && (
            <div
              className={`mt-4 p-4 rounded-xl ${
                sendStatus.success
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : "bg-yellow-100 text-yellow-800 border border-yellow-300"
              }`}
            >
              <p className="font-semibold">{sendStatus.message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
