/**
 * Content the client still has to supply (prices, team photos, product ranges...).
 *
 * Hidden unless NEXT_PUBLIC_SHOW_PENDING=true, so a deployment can never go live showing "From $X" or
 * "To be supplied" boxes by accident. Turn it on locally or on staging to see what's still missing.
 * When the client's answer arrives, fill in the content and remove the <Pending> wrapper.
 * Find everything outstanding with: grep -rn "<Pending>" src
 */
export const showPending = process.env.NEXT_PUBLIC_SHOW_PENDING === "true";

export function Pending({ children }: { children: React.ReactNode }) {
  return showPending ? children : null;
}
