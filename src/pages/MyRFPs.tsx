import { useState, useEffect } from "react";

interface RFPItem {
  name: string;
  qty: number;
  spec: string;
}

interface Recipient {
  email: string;
  name: string;
}

interface RFP {
  _id: string;
  rfpId: string;
  title: string;
  budget: number;
  deliveryTimeline: string;
  items: RFPItem[];
  paymentTerms: string;
  warranty: string;
  sentTo: Recipient[];
  createdAt: string;
  status: "pending" | "awarded" | "closed";
  awardedTo?: Recipient;
}

interface Stats {
  total: number;
  pending: number;
  awarded: number;
  closed: number;
}

export default function MyRFPs() {
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    awarded: 0,
    closed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedRFP, setSelectedRFP] = useState<RFP | null>(null);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [awardRecipient, setAwardRecipient] = useState<Recipient>({
    email: "",
    name: "",
  });

  // Fetch RFPs from MongoDB
  const fetchRFPs = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/rfps");
      const data = await response.json();

      if (data.success) {
        setRfps(data.data);
      } else {
        console.error("Failed to fetch RFPs:", data.error);
      }
    } catch (err) {
      console.error("Error fetching RFPs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats from MongoDB
  const fetchStats = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/rfps/stats/summary"
      );
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  useEffect(() => {
    fetchRFPs();
    fetchStats();
  }, []);

  const handleAwardRFP = async () => {
    if (!selectedRFP || !awardRecipient.email) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/rfps/${selectedRFP._id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "awarded",
            awardedTo: awardRecipient,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Refresh RFPs and stats
        await fetchRFPs();
        await fetchStats();
        setShowAwardModal(false);
        setAwardRecipient({ email: "", name: "" });
        alert(
          `✅ RFP "${selectedRFP.title}" has been awarded to ${awardRecipient.name}`
        );
      } else {
        alert("❌ Failed to award RFP: " + data.error);
      }
    } catch (err) {
      console.error("Error awarding RFP:", err);
      alert("❌ Error awarding RFP");
    }
  };

  const handleCloseRFP = async (rfpId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/rfps/${rfpId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "closed" }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Refresh RFPs and stats
        await fetchRFPs();
        await fetchStats();
      } else {
        alert("❌ Failed to close RFP: " + data.error);
      }
    } catch (err) {
      console.error("Error closing RFP:", err);
      alert("❌ Error closing RFP");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "awarded":
        return "bg-green-100 text-green-800 border-green-300";
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">📋 My RFPs</h1>
            <p className="text-gray-600 mt-1">
              Manage and track all your Request for Proposals
            </p>
          </div>
          <button
            onClick={() => {
              fetchRFPs();
              fetchStats();
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total RFPs</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {stats.pending}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Awarded</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {stats.awarded}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading RFPs...</p>
          </div>
        ) : rfps.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No RFPs created yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start by creating your first RFP
            </p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
            >
              Create RFP
            </a>
          </div>
        ) : (
          /* RFP List */
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      RFP Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timeline
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sent To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rfps.map((rfp) => (
                    <tr key={rfp._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {rfp.title}
                          </p>
                          <p className="text-xs text-gray-500">{rfp.rfpId}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {rfp.items.length} item(s)
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-semibold text-green-600">
                          ₹{rfp.budget.toLocaleString()}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-800">
                          {rfp.deliveryTimeline}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-800">
                          {rfp.sentTo.length} vendor(s)
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadge(
                            rfp.status
                          )}`}
                        >
                          {rfp.status.toUpperCase()}
                        </span>
                        {rfp.awardedTo && (
                          <p className="text-xs text-gray-500 mt-1">
                            to {rfp.awardedTo.name}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedRFP(rfp)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            👁️ View
                          </button>
                          {rfp.status === "pending" && (
                            <button
                              onClick={() => {
                                setSelectedRFP(rfp);
                                setShowAwardModal(true);
                              }}
                              className="text-green-600 hover:text-green-900"
                            >
                              ✅ Award
                            </button>
                          )}
                          {rfp.status !== "closed" && (
                            <button
                              onClick={() => handleCloseRFP(rfp._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              🔒 Close
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View RFP Modal */}
        {selectedRFP && !showAwardModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">
                  RFP Details
                </h2>
                <button
                  onClick={() => setSelectedRFP(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* RFP ID */}
                <div>
                  <p className="text-sm font-semibold text-gray-600">RFP ID</p>
                  <p className="text-lg text-gray-800">{selectedRFP.rfpId}</p>
                </div>

                {/* Title */}
                <div>
                  <p className="text-sm font-semibold text-gray-600">Title</p>
                  <p className="text-lg text-gray-800">{selectedRFP.title}</p>
                </div>

                {/* Budget & Timeline */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">
                      Budget
                    </p>
                    <p className="text-lg font-semibold text-green-600">
                      ₹{selectedRFP.budget.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">
                      Timeline
                    </p>
                    <p className="text-lg text-gray-800">
                      {selectedRFP.deliveryTimeline}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">
                    Items Required
                  </p>
                  <div className="space-y-2">
                    {selectedRFP.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-800">
                              {item.name}
                            </p>
                            {item.spec && (
                              <p className="text-sm text-gray-600 mt-1">
                                {item.spec}
                              </p>
                            )}
                          </div>
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                            Qty: {item.qty}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Terms & Warranty */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">
                      Payment Terms
                    </p>
                    <p className="text-lg text-gray-800">
                      {selectedRFP.paymentTerms}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">
                      Warranty
                    </p>
                    <p className="text-lg text-gray-800">
                      {selectedRFP.warranty}
                    </p>
                  </div>
                </div>

                {/* Sent To */}
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">
                    Sent To
                  </p>
                  <div className="space-y-2">
                    {selectedRFP.sentTo.map((recipient, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                      >
                        <p className="font-semibold text-gray-800">
                          {recipient.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {recipient.email}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <p className="text-sm font-semibold text-gray-600">Status</p>
                  <span
                    className={`inline-block mt-1 px-4 py-2 text-sm font-semibold rounded-full border ${getStatusBadge(
                      selectedRFP.status
                    )}`}
                  >
                    {selectedRFP.status.toUpperCase()}
                  </span>
                  {selectedRFP.awardedTo && (
                    <p className="text-sm text-gray-600 mt-2">
                      Awarded to: {selectedRFP.awardedTo.name} (
                      {selectedRFP.awardedTo.email})
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Award RFP Modal */}
        {showAwardModal && selectedRFP && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-800">Award RFP</h2>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-gray-600">
                  You are about to award "{selectedRFP.title}" to a vendor.
                  Please select the vendor:
                </p>

                {/* Vendor Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Vendor
                  </label>
                  <select
                    value={awardRecipient.email}
                    onChange={(e) => {
                      const selected = selectedRFP.sentTo.find(
                        (r) => r.email === e.target.value
                      );
                      if (selected) {
                        setAwardRecipient(selected);
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Select a vendor --</option>
                    {selectedRFP.sentTo.map((recipient, idx) => (
                      <option key={idx} value={recipient.email}>
                        {recipient.name} ({recipient.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowAwardModal(false);
                      setAwardRecipient({ email: "", name: "" });
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAwardRFP}
                    disabled={!awardRecipient.email}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirm Award
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
