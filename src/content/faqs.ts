/**
 * Site copy that isn't tied to one component lives in src/content, so it can be reused across pages
 * (and swapped for CMS data later) without touching markup.
 */

/** One question in an FAQ list. Rendered by <FaqsSection> and output as FAQPage JSON-LD. */
export type Faq = { question: string; answer: string };

/** Demo questions. Replace per client, and add groups (servicesFaqs, pricingFaqs...) as the site grows. */
export const generalFaqs: Faq[] = [
  {
    question: "Which areas do you service?",
    answer: "Replace this with the client's service area, and link to the contact page for anything not listed.",
  },
  {
    question: "How quickly will you get back to me?",
    answer: "Replace this with the client's response time, e.g. within one business day.",
  },
  {
    question: "Do you offer free quotes?",
    answer: "Replace this with how quoting works: on site, by phone, or from photos sent through the contact form.",
  },
];
