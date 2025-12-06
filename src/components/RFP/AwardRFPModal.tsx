import { useState } from "react";
import type { RFP, Recipient } from "../../types/rfp.types";

interface AwardRFPModalProps {
  rfp: RFP;
  onClose: () => void;
  onAward: (awardedTo: Recipient) => void;
}

export default function AwardRFPModal({
  rfp,
  onClose,
  onAward,
}: AwardRFPModalProps) {
  const [awardRecipient, setAwardRecipient] = useState<Recipient>({
    email: "",
    name: "",
  });

  const handleAward = () => {
    if (awardRecipient.email) {
      onAward(awardRecipient);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Award RFP</h2>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-gray-600">
            You are about to award "{rfp.title}" to a vendor. Please select the
            vendor:
          </p>

          {/* Vendor Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Vendor
            </label>
            <select
              value={awardRecipient.email}
              onChange={(e) => {
                const selected = rfp.sentTo.find(
                  (r) => r.email === e.target.value
                );
                if (selected) {
                  setAwardRecipient(selected);
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Select a vendor --</option>
              {rfp.sentTo.map((recipient, idx) => (
                <option key={idx} value={recipient.email}>
                  {recipient.name} ({recipient.email})
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAward}
              disabled={!awardRecipient.email}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Award
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
