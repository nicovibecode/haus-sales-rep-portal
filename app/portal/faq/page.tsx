import FAQClient from "./FAQClient";

const hardcodedFAQs = [
  {
    q: "How long will it take to receive my order?",
    a: "Most in-stock tile and accessories are processed from our Los Angeles warehouse within 3 business days after payment confirmation. Samples ship every Tuesday. UPS Ground typically takes up to 10 business days post-pickup; freight orders take 7–14 business days.",
  },
  {
    q: "How much does shipping cost?",
    a: "Shipping varies by order type: samples and small decor ship at a $10 flat rate; regular tile orders use a fixed regional freight rate plus $0.50/lb; orders that include both tile and samples add $10 to the freight rate. Use the Shipping Calculator in the Orders tab for an estimate.",
  },
  {
    q: "Why is shipping so expensive?",
    a: "Tiles require secure packing due to weight and fragility. Most orders ship on palletized LTL freight rather than standard parcel. Individual boxes weigh approximately 35–60 lbs, and pricing reflects actual transportation costs.",
  },
  {
    q: "Can I track my order?",
    a: "Yes. Tracking information is sent via confirmation email once the shipment leaves our warehouse. Use the provided tracking number to monitor status and estimated delivery.",
  },
  {
    q: "Can I return or exchange tiles?",
    a: "All sales are final once payment has been received. Returns and exchanges are not accepted. Please ensure quantities, colors, and finishes are confirmed with the client before submitting an order.",
  },
  {
    q: "Can clients pick up their order at the warehouse?",
    a: "Yes. Free local pickups are available Monday–Friday, 9am–5pm by appointment only. Schedule at least 2 business days in advance by contacting BSD Haus via email or phone.",
  },
  {
    q: "Can clients visit the showroom?",
    a: "Yes. The Paramount, California location welcomes in-person visits upon request with at least 24 hours advance notice.",
  },
  {
    q: "What is the warranty policy?",
    a: "BSD Haus products are sold as-is and all sales are final. In the event product arrives damaged, the client must contact infohaus@bsd.group within 5 business days of delivery with photos documenting the damage. If the damage is deemed sufficient, BSD Haus will ship replacement product to cover the damaged pieces — not a full order replacement. Claims submitted after 5 days or post-installation cannot be accepted.",
  },
  {
    q: "How do I handle tax-exempt customers?",
    a: "Collect a valid resale certificate from the client before placing the order and note it in the order submission form. Tax-exempt status must be documented prior to invoicing.",
  },
  {
    q: "What overage should I recommend?",
    a: "Recommend 15% overage for marble mosaics and travertine, and 10% for ceramics to account for cuts and waste. The Calculator in this portal applies these defaults automatically per product.",
  },
  {
    q: "How does my commission work?",
    a: "Commission is 10% of the net collected sale amount, excluding tax and shipping. It is earned only when full payment is collected from the client. Commissions are paid within 30 days after the close of the month in which payment was collected. If a return is approved, the commission is charged back.",
  },
  {
    q: "How do I request samples?",
    a: "Upon signing your rep agreement, you receive a sample kit covering all Marble and Travertine SKUs. Additional sample requests are submitted through the BSD Haus Sample Request System (Google Form provided by the company). The company will fulfill approved requests within a reasonable timeframe and may limit or charge for additional requests.",
  },
];

export default function FAQPage() {
  return <FAQClient faqs={hardcodedFAQs} />;
}
