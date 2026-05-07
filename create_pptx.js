const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "RAG System";
pres.title = "Advantages of AI & Machine Learning";

const COLORS = {
  bgDark: "0F0B2E",
  bgMid: "1A1145",
  bgCard: "241B52",
  primary: "6366F1",
  accent: "8B5CF6",
  accentLight: "A78BFA",
  text: "F1F5F9",
  textMuted: "94A3B8",
  highlight: "22D3EE",
  gradient1: "4F46E5",
  gradient2: "7C3AED",
};

// --- Slide 1: Cover ---
let slide1 = pres.addSlide();
slide1.background = { color: COLORS.bgDark };

// Decorative circles
slide1.addShape(pres.shapes.OVAL, {
  x: -1.5, y: -1.5, w: 4, h: 4,
  fill: { color: COLORS.primary, transparency: 85 },
});
slide1.addShape(pres.shapes.OVAL, {
  x: 7.5, y: 3, w: 4, h: 4,
  fill: { color: COLORS.accent, transparency: 85 },
});

slide1.addText("Advantages of AI &\nMachine Learning", {
  x: 0.8, y: 1.2, w: 8.4, h: 2.2,
  fontSize: 42, fontFace: "Trebuchet MS", color: COLORS.text,
  bold: true, align: "left", valign: "middle", margin: 0,
});
slide1.addText("Transforming Industries Through Intelligent Automation", {
  x: 0.8, y: 3.4, w: 7, h: 0.7,
  fontSize: 18, fontFace: "Calibri", color: COLORS.textMuted,
  align: "left", margin: 0,
});
// Accent bar
slide1.addShape(pres.shapes.RECTANGLE, {
  x: 0.8, y: 4.3, w: 2.5, h: 0.06,
  fill: { color: COLORS.primary },
});
slide1.addText("Powered by RAG System | Pinecone + Groq", {
  x: 0.8, y: 4.7, w: 5, h: 0.5,
  fontSize: 11, fontFace: "Calibri", color: COLORS.textMuted,
  align: "left", margin: 0,
});

// --- Slide 2: What is AI & ML ---
let slide2 = pres.addSlide();
slide2.background = { color: COLORS.bgDark };

slide2.addText("What is AI & Machine Learning?", {
  x: 0.8, y: 0.4, w: 8.5, h: 0.8,
  fontSize: 32, fontFace: "Trebuchet MS", color: COLORS.text,
  bold: true, align: "left", margin: 0,
});
slide2.addShape(pres.shapes.RECTANGLE, {
  x: 0.8, y: 1.2, w: 1.8, h: 0.05,
  fill: { color: COLORS.primary },
});

const slide2Items = [
  { icon: "01", title: "Artificial Intelligence", desc: "Enables machines to simulate human intelligence and reasoning" },
  { icon: "02", title: "Machine Learning", desc: "Systems learn and improve automatically from experience" },
  { icon: "03", title: "Deep Learning", desc: "Neural networks recognize complex patterns at scale" },
  { icon: "04", title: "Together", desc: "They power automation, prediction, and decision-making" },
];

slide2Items.forEach((item, i) => {
  const yPos = 1.6 + i * 0.95;
  slide2.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: yPos, w: 0.55, h: 0.55,
    fill: { color: COLORS.bgCard },
  });
  slide2.addText(item.icon, {
    x: 0.8, y: yPos, w: 0.55, h: 0.55,
    fontSize: 14, fontFace: "Consolas", color: COLORS.highlight,
    align: "center", valign: "middle", margin: 0,
  });
  slide2.addText(item.title, {
    x: 1.55, y: yPos, w: 4, h: 0.3,
    fontSize: 16, fontFace: "Calibri", color: COLORS.text,
    bold: true, align: "left", valign: "middle", margin: 0,
  });
  slide2.addText(item.desc, {
    x: 1.55, y: yPos + 0.3, w: 7, h: 0.3,
    fontSize: 13, fontFace: "Calibri", color: COLORS.textMuted,
    align: "left", valign: "top", margin: 0,
  });
});

// Right side decoration
slide2.addShape(pres.shapes.OVAL, {
  x: 7.8, y: 1.5, w: 3.2, h: 3.2,
  fill: { color: COLORS.accent, transparency: 90 },
});

// --- Slide 3: Key Advantages of AI ---
let slide3 = pres.addSlide();
slide3.background = { color: COLORS.bgDark };

slide3.addText("Key Advantages of AI", {
  x: 0.8, y: 0.4, w: 8.5, h: 0.8,
  fontSize: 32, fontFace: "Trebuchet MS", color: COLORS.text,
  bold: true, align: "left", margin: 0,
});
slide3.addShape(pres.shapes.RECTANGLE, {
  x: 0.8, y: 1.2, w: 1.8, h: 0.05,
  fill: { color: COLORS.accent },
});

const slide3Cards = [
  { stat: "100%", label: "Automation", desc: "Repetitive tasks automated, reducing errors" },
  { stat: "24/7", label: "Availability", desc: "No fatigue or performance degradation" },
  { stat: "10x", label: "Speed", desc: "Processes massive datasets faster" },
  { stat: "40%", label: "Cost Savings", desc: "Reduced operational costs" },
];

slide3Cards.forEach((card, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const xPos = 0.8 + col * 4.5;
  const yPos = 1.6 + row * 1.85;

  slide3.addShape(pres.shapes.RECTANGLE, {
    x: xPos, y: yPos, w: 4.1, h: 1.6,
    fill: { color: COLORS.bgCard },
  });
  slide3.addShape(pres.shapes.RECTANGLE, {
    x: xPos, y: yPos, w: 0.07, h: 1.6,
    fill: { color: COLORS.primary },
  });
  slide3.addText(card.stat, {
    x: xPos + 0.3, y: yPos + 0.2, w: 1.5, h: 0.5,
    fontSize: 28, fontFace: "Trebuchet MS", color: COLORS.highlight,
    bold: true, align: "left", margin: 0,
  });
  slide3.addText(card.label, {
    x: xPos + 1.8, y: yPos + 0.25, w: 2, h: 0.4,
    fontSize: 16, fontFace: "Calibri", color: COLORS.text,
    bold: true, align: "left", valign: "middle", margin: 0,
  });
  slide3.addText(card.desc, {
    x: xPos + 0.3, y: yPos + 0.85, w: 3.5, h: 0.5,
    fontSize: 13, fontFace: "Calibri", color: COLORS.textMuted,
    align: "left", margin: 0,
  });
});

// --- Slide 4: Machine Learning Benefits ---
let slide4 = pres.addSlide();
slide4.background = { color: COLORS.bgDark };

slide4.addText("Machine Learning Benefits", {
  x: 0.8, y: 0.4, w: 8.5, h: 0.8,
  fontSize: 32, fontFace: "Trebuchet MS", color: COLORS.text,
  bold: true, align: "left", margin: 0,
});
slide4.addShape(pres.shapes.RECTANGLE, {
  x: 0.8, y: 1.2, w: 1.8, h: 0.05,
  fill: { color: COLORS.highlight },
});

const slide4Items = [
  { title: "Continuous Improvement", desc: "Data-driven learning that gets better over time" },
  { title: "Personalization", desc: "Tailored experiences for every user and customer" },
  { title: "Predictive Analytics", desc: "Accurate business forecasting and trend detection" },
  { title: "Pattern Detection", desc: "Finds hidden patterns in complex, unstructured data" },
];

slide4Items.forEach((item, i) => {
  const yPos = 1.6 + i * 0.95;
  slide4.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: yPos, w: 8.4, h: 0.8,
    fill: { color: COLORS.bgCard },
  });
  slide4.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: yPos, w: 0.06, h: 0.8,
    fill: { color: i % 2 === 0 ? COLORS.primary : COLORS.accent },
  });
  slide4.addText(item.title, {
    x: 1.1, y: yPos + 0.05, w: 5, h: 0.35,
    fontSize: 16, fontFace: "Calibri", color: COLORS.text,
    bold: true, align: "left", margin: 0,
  });
  slide4.addText(item.desc, {
    x: 1.1, y: yPos + 0.4, w: 7, h: 0.35,
    fontSize: 13, fontFace: "Calibri", color: COLORS.textMuted,
    align: "left", margin: 0,
  });
});

// --- Slide 5: Industry Applications ---
let slide5 = pres.addSlide();
slide5.background = { color: COLORS.bgDark };

slide5.addText("Industry Applications", {
  x: 0.8, y: 0.4, w: 8.5, h: 0.8,
  fontSize: 32, fontFace: "Trebuchet MS", color: COLORS.text,
  bold: true, align: "left", margin: 0,
});
slide5.addShape(pres.shapes.RECTANGLE, {
  x: 0.8, y: 1.2, w: 1.8, h: 0.05,
  fill: { color: COLORS.primary },
});

const industries = [
  { name: "Healthcare", items: "Disease diagnosis\nDrug discovery", color: COLORS.highlight },
  { name: "Finance", items: "Fraud detection\nAlgorithmic trading", color: COLORS.primary },
  { name: "Manufacturing", items: "Predictive maintenance\nQuality control", color: COLORS.accent },
  { name: "Education", items: "Personalized learning\nAdaptive paths", color: COLORS.accentLight },
];

industries.forEach((ind, i) => {
  const xPos = 0.6 + i * 2.35;
  slide5.addShape(pres.shapes.RECTANGLE, {
    x: xPos, y: 1.6, w: 2.15, h: 3.4,
    fill: { color: COLORS.bgCard },
  });
  slide5.addShape(pres.shapes.RECTANGLE, {
    x: xPos, y: 1.6, w: 2.15, h: 0.06,
    fill: { color: ind.color },
  });
  slide5.addText(ind.name, {
    x: xPos + 0.2, y: 1.9, w: 1.8, h: 0.5,
    fontSize: 16, fontFace: "Calibri", color: ind.color,
    bold: true, align: "left", margin: 0,
  });
  slide5.addText(ind.items, {
    x: xPos + 0.2, y: 2.6, w: 1.8, h: 1.8,
    fontSize: 12, fontFace: "Calibri", color: COLORS.textMuted,
    align: "left", valign: "top", margin: 0,
  });
});

// --- Slide 6: AI in Design & Creativity (RAG Insights) ---
let slide6 = pres.addSlide();
slide6.background = { color: COLORS.bgDark };

slide6.addText("AI in Design & Creativity", {
  x: 0.8, y: 0.4, w: 8.5, h: 0.8,
  fontSize: 32, fontFace: "Trebuchet MS", color: COLORS.text,
  bold: true, align: "left", margin: 0,
});
slide6.addText("Insights from RAG Knowledge Base", {
  x: 0.8, y: 1.0, w: 5, h: 0.4,
  fontSize: 12, fontFace: "Calibri", color: COLORS.highlight,
  italic: true, align: "left", margin: 0,
});
slide6.addShape(pres.shapes.RECTANGLE, {
  x: 0.8, y: 1.35, w: 1.8, h: 0.05,
  fill: { color: COLORS.highlight },
});

const ragInsights = [
  { title: "Consistent Branding", desc: "Automatically apply brand palettes, typography, and tone across all materials" },
  { title: "Smart Layouts", desc: "Content-aware layout suggestions based on slide role and data type" },
  { title: "Data-Driven Design", desc: "Real-time quality scoring and composition feedback" },
  { title: "Scalable Creation", desc: "Generate hundreds of on-brand slides maintaining premium quality" },
];

ragInsights.forEach((item, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const xPos = 0.8 + col * 4.5;
  const yPos = 1.7 + row * 1.85;

  slide6.addShape(pres.shapes.RECTANGLE, {
    x: xPos, y: yPos, w: 4.1, h: 1.6,
    fill: { color: COLORS.bgCard },
  });
  slide6.addText(item.title, {
    x: xPos + 0.3, y: yPos + 0.2, w: 3.5, h: 0.4,
    fontSize: 16, fontFace: "Calibri", color: COLORS.text,
    bold: true, align: "left", margin: 0,
  });
  slide6.addText(item.desc, {
    x: xPos + 0.3, y: yPos + 0.7, w: 3.5, h: 0.7,
    fontSize: 12, fontFace: "Calibri", color: COLORS.textMuted,
    align: "left", margin: 0,
  });
});

// --- Slide 7: Business Impact ---
let slide7 = pres.addSlide();
slide7.background = { color: COLORS.bgDark };

slide7.addText("Business Impact", {
  x: 0.8, y: 0.4, w: 8.5, h: 0.8,
  fontSize: 32, fontFace: "Trebuchet MS", color: COLORS.text,
  bold: true, align: "left", margin: 0,
});
slide7.addShape(pres.shapes.RECTANGLE, {
  x: 0.8, y: 1.2, w: 1.8, h: 0.05,
  fill: { color: COLORS.accent },
});

const impacts = [
  { icon: "^", title: "Revenue Growth", desc: "Better customer insights drive sales" },
  { icon: ">", title: "Competitive Edge", desc: "Faster, smarter decision-making" },
  { icon: "*", title: "Innovation", desc: "Accelerated product development" },
  { icon: "+", title: "Productivity", desc: "Enhanced employee satisfaction" },
];

impacts.forEach((item, i) => {
  const yPos = 1.6 + i * 0.95;
  slide7.addShape(pres.shapes.OVAL, {
    x: 0.9, y: yPos + 0.05, w: 0.5, h: 0.5,
    fill: { color: COLORS.bgCard },
  });
  slide7.addText(item.icon, {
    x: 0.9, y: yPos + 0.05, w: 0.5, h: 0.5,
    fontSize: 18, fontFace: "Consolas", color: COLORS.primary,
    align: "center", valign: "middle", margin: 0,
  });
  slide7.addText(item.title, {
    x: 1.65, y: yPos + 0.02, w: 4, h: 0.32,
    fontSize: 16, fontFace: "Calibri", color: COLORS.text,
    bold: true, align: "left", margin: 0,
  });
  slide7.addText(item.desc, {
    x: 1.65, y: yPos + 0.38, w: 7, h: 0.3,
    fontSize: 13, fontFace: "Calibri", color: COLORS.textMuted,
    align: "left", margin: 0,
  });
});

// --- Slide 8: The Future is AI-Powered ---
let slide8 = pres.addSlide();
slide8.background = { color: COLORS.bgDark };

// Decorative
slide8.addShape(pres.shapes.OVAL, {
  x: 6.5, y: -1, w: 5, h: 5,
  fill: { color: COLORS.primary, transparency: 88 },
});
slide8.addShape(pres.shapes.OVAL, {
  x: -2, y: 3, w: 5, h: 5,
  fill: { color: COLORS.accent, transparency: 90 },
});

slide8.addText("The Future is AI-Powered", {
  x: 0.8, y: 0.4, w: 8.5, h: 0.8,
  fontSize: 32, fontFace: "Trebuchet MS", color: COLORS.text,
  bold: true, align: "left", margin: 0,
});
slide8.addShape(pres.shapes.RECTANGLE, {
  x: 0.8, y: 1.2, w: 1.8, h: 0.05,
  fill: { color: COLORS.highlight },
});

const futureStats = [
  { stat: "$1.8T", desc: "AI market size projected by 2030" },
  { stat: "97%", desc: "Business owners believe AI will help" },
  { stat: "+30%", desc: "Higher efficiency with AI adoption" },
  { stat: "#1", desc: "Early adopters gain lasting advantage" },
];

futureStats.forEach((item, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const xPos = 0.8 + col * 4.5;
  const yPos = 1.6 + row * 1.85;

  slide8.addShape(pres.shapes.RECTANGLE, {
    x: xPos, y: yPos, w: 4.1, h: 1.6,
    fill: { color: COLORS.bgCard },
  });
  slide8.addText(item.stat, {
    x: xPos + 0.3, y: yPos + 0.2, w: 3.5, h: 0.7,
    fontSize: 36, fontFace: "Trebuchet MS", color: COLORS.highlight,
    bold: true, align: "left", valign: "middle", margin: 0,
  });
  slide8.addText(item.desc, {
    x: xPos + 0.3, y: yPos + 0.95, w: 3.5, h: 0.45,
    fontSize: 14, fontFace: "Calibri", color: COLORS.textMuted,
    align: "left", margin: 0,
  });
});

// Save
pres.writeFile({ fileName: "/opt/sandbox/workspace/advantages_of_ai_and_ml.pptx" })
  .then(() => console.log("PPTX saved successfully!"))
  .catch(err => console.error("Error:", err));
