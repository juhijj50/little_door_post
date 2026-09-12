import React from "react";
import LegalPage from "./LegalPage.jsx";
import { POLICIES } from "../SiteFooter.jsx";

/* Reuses the policy shell rather than inventing a third layout — it already
 * has the header, the footer and the list of everywhere you might have meant
 * to go, which is most of what a 404 is for. */
export default function NotFound() {
  return (
    <LegalPage
      path="/404"
      title="No door here"
      summary="Iris has opened a great many doors, but not this one. Nothing is at this address."
    >
      <p>
        The page you asked for does not exist. It may have been a typo, or a link that has since
        moved.
      </p>
      <p>
        <a href="/">Go back to the front door</a>, or try one of these:
      </p>
      <ul>
        {POLICIES.map((p) => (
          <li key={p.href}>
            <a href={p.href}>{p.label}</a>
          </li>
        ))}
      </ul>
    </LegalPage>
  );
}
