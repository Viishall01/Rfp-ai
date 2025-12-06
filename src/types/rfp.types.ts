export interface RFPItem {
  name: string;
  qty: number;
  spec: string;
}

export interface Recipient {
  email: string;
  name: string;
}

export interface RFP {
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

export interface Stats {
  total: number;
  pending: number;
  awarded: number;
  closed: number;
}

export interface ParsedEmail {
  uid: number;
  messageId: string | undefined;
  from:
    | {
        name: string | undefined;
        address: string | undefined;
      }
    | undefined;
  to:
    | {
        name: string | undefined;
        address: string | undefined;
      }[]
    | undefined;
  subject: string | undefined;
  date: Date | undefined;
  textBody: string | undefined;
  htmlBody: string | undefined;
}
