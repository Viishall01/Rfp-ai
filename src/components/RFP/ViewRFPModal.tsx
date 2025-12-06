import type { RFP } from "../../types/rfp.types";
import { getStatusBadge } from "../../utils/rfp.utils";

interface ViewRFPModalProps {
  rfp: RFP;
  onClose: () => void;
}

export default function ViewRFPModal({ rfp, onClose }: ViewRFPModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">RFP Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* RFP ID */}
          <div>
            <p className="text-sm font-semibold text-gray-600">RFP ID</p>
            <p className="text-lg text-gray-800">{rfp.rfpId}</p>
          </div>

          {/* Title */}
          <div>
            <p className="text-sm font-semibold text-gray-600">Title</p>
            <p className="text-lg text-gray-800">{rfp.title}</p>
          </div>

          {/* Budget & Timeline */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-600">Budget</p>
              <p className="text-lg font-semibold text-green-600">
                ₹{rfp.budget.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Timeline</p>
              <p className="text-lg text-gray-800">{rfp.deliveryTimeline}</p>
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-2">
              Items Required
            </p>
            <div className="space-y-2">
              {rfp.items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{item.name}</p>
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
              <p className="text-lg text-gray-800">{rfp.paymentTerms}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Warranty</p>
              <p className="text-lg text-gray-800">{rfp.warranty}</p>
            </div>
          </div>

          {/* Sent To */}
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-2">Sent To</p>
            <div className="space-y-2">
              {rfp.sentTo.map((recipient, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                >
                  <p className="font-semibold text-gray-800">
                    {recipient.name}
                  </p>
                  <p className="text-sm text-gray-600">{recipient.email}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <p className="text-sm font-semibold text-gray-600">Status</p>
            <span
              className={`inline-block mt-1 px-4 py-2 text-sm font-semibold rounded-full border ${getStatusBadge(
                rfp.status
              )}`}
            >
              {rfp.status.toUpperCase()}
            </span>
            {rfp.awardedTo && (
              <p className="text-sm text-gray-600 mt-2">
                Awarded to: {rfp.awardedTo.name} ({rfp.awardedTo.email})
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
