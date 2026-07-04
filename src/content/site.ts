import heroPort from "@/assets/hero-port.jpg";
import marineImg from "@/assets/marine-equipment.jpg";
import portImg from "@/assets/port-equipment.jpg";
import divingImg from "@/assets/diving-equipment.jpg";
import industrialImg from "@/assets/industrial-support.jpg";
import controlImg from "@/assets/control-systems.jpg";
import shipRepairImg from "@/assets/ship-repair.jpg";

export const company = {
  name: "Trillion Liberty Pte Ltd",
  shortName: "T Liberty",
  tagline: "Specialists in Marine & Port Trading Solutions",
  description:
    "Empowering ports. Supporting ships. Trading with integrity. Safer dives, stronger operations.",
  email: "industrial@tlibertypte.com",
  phone: "+65 9720 8465",
  phoneHref: "tel:+6597208465",
  address: "30 Roberts Lane, #02-01, Singapore",
  uen: "201935886R",
  domain: "tlibertypte.com",
};

export const heroImage = heroPort;

export const focusAreas = [
  {
    slug: "marine-equipment",
    title: "Marine Equipment",
    image: marineImg,
    blurb: "Engines, navigation, safety and electrical systems for every class of vessel.",
    items: [
      "Engines & Spare Parts",
      "Navigation & Communication",
      "Safety & Life-Saving Appliances",
      "Electrical & Mechanical Systems",
    ],
  },
  {
    slug: "port-equipment",
    title: "Port Equipment",
    image: portImg,
    blurb: "Cargo handling, mooring and terminal infrastructure for modern ports.",
    items: [
      "Cargo & Container Handling",
      "Mooring & Dock Accessories",
      "Terminal & Yard Infrastructure",
    ],
  },
  {
    slug: "diving-equipment",
    title: "Diving Equipment",
    image: divingImg,
    blurb: "Commercial diving gear built for safety at depth.",
    items: [
      "Diving Umbilical & ROV Cable",
      "Control Panels & Video Systems",
      "Personal Gear (Helmets, Suits)",
      "Underwater Tools",
    ],
  },
  {
    slug: "industrial-support",
    title: "Industrial Support",
    image: industrialImg,
    blurb: "Consumables, PPE and fabrication tooling to keep operations moving.",
    items: [
      "Welding & Fabrication Tools",
      "Industrial PPE & Workwear",
      "Fasteners & Hydraulic Hoses",
      "Paints, Coatings & Materials",
    ],
  },
  {
    slug: "control-systems",
    title: "Control Systems",
    image: controlImg,
    blurb: "Power, ELV and custom control-panel design engineered for demanding environments.",
    items: [
      "Power & Control Panels",
      "ELV & Pump Control Systems",
      "Service & Maintenance",
      "Custom Solution Design",
    ],
  },
  {
    slug: "ship-repair",
    title: "Ship Repair & Dry Dock",
    image: shipRepairImg,
    blurb: "On-site repair, dry-dock support and turnaround services for vessels of every class.",
    items: [
      "Hull & Structural Repair",
      "Dry-Dock Project Support",
      "Voyage & Riding Repair Teams",
      "Class-Compliant Surveys",
    ],
  },
];

export const stats = [
  { value: "80+", label: "Projects Completed", note: "Successful deliveries across the region" },
  { value: "15+", label: "Trusted Clients", note: "Leading maritime companies worldwide" },
  { value: "24/7", label: "Support Available", note: "Round-the-clock customer service" },
];

export const whyUs = [
  {
    title: "Global Sourcing",
    body: "We connect you with reliable international brands at competitive prices.",
  },
  {
    title: "On-Time Delivery",
    body: "Serving major ports with fast logistics and real-time tracking.",
  },
  {
    title: "Certified & Compliant",
    body: "All products meet IMO, SOLAS and international quality standards.",
  },
  {
    title: "Tailored Solutions",
    body: "Custom-engineered packages built around your operation and vessel type.",
  },
];

export const testimonials = [
  {
    quote:
      "Their reliability in supplying quality equipment and exceptional service have made them indispensable to our operations.",
    author: "Operations Director",
    company: "Regional Shipping Group",
  },
  {
    quote:
      "Top-notch diving and marine supplies. Technical expertise and prompt delivery have saved us countless hours during critical operations.",
    author: "Marine Superintendent",
    company: "Offshore Services Co.",
  },
  {
    quote:
      "Exceptional quality and competitive pricing. They understand our industry needs and consistently exceed expectations.",
    author: "Procurement Manager",
    company: "Port Authority Partner",
  },
];

export const services = [
  {
    title: "Equipment Supply",
    body: "Marine, port, diving, industrial and control-system equipment sourced from trusted global brands and delivered on your schedule.",
  },
  {
    title: "Global Sourcing & Procurement",
    body: "One point of contact for multi-vendor procurement. We handle sourcing, negotiation, QA and consolidated shipping.",
  },
  {
    title: "Logistics & Port Delivery",
    body: "Fast, tracked delivery to major ports and vessels in port, including urgent spares and dry-dock support.",
  },
  {
    title: "Service & Maintenance",
    body: "Commissioning, preventive maintenance and repair for control panels, pump and ELV systems.",
  },
  {
    title: "Custom Solution Design",
    body: "Engineered-to-order power, control and pump-control panels built to your specification and compliance requirements.",
  },
];