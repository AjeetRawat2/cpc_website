# Campus Pulse Club

A warm terracotta student-club site concept for Campus Pulse Club at Starex University. Built with plain HTML/CSS/JavaScript and a small Node server; no build step or login required. Event RSVPs open a Google Form, and the newsletter section displays the Campus Pulse Club QR code. The feedback overlay sends submissions through FormSubmit to the CPC inbox.

## Run locally

Requires Node.js 18 or newer.

```sh
npm start
```

Open the address printed in the terminal (normally <http://localhost:4173>). If that port is already in use, the server automatically tries the next port.

## Customize

- Update event copy, dates, locations, images, and links in `index.html`.
- Add your published RSVP Google Form URL near the top of `app.js` in `GOOGLE_FORM_URLS.rsvp`. Use a link from `forms.gle` or `docs.google.com/forms`. The same RSVP form opens for each event, so include an event-choice question in that Google Form.
- The newsletter area displays `assets/campuspulseclub_qr.png`; replace that image with an approved QR code if its destination changes.
- Change palette tokens at the top of `styles.css`.
- The gallery uses the 35 compressed campus photos in `assets/gallery/`; replace these files and update the photo list in `app.js` to refresh the album.
- Replace all 10 sample names, roles, and portrait photos in the “Meet the makers” section with the current CPC team.
- The feedback form is configured for `rawatking76@gmail.com` using FormSubmit. Before it can deliver the first message, submit a real test from the deployed site and confirm the activation email FormSubmit sends to that inbox. Feedback is sent through a third-party form service.
- Set `PORT` to choose a specific local server port.

The event cards currently contain fictional sample details; replace them before publishing. The RSVP Google Form link is blank until you add its URL in `app.js`. The newsletter QR image is included in `assets/`. Terms & Conditions and the feedback form are available from the footer. The site has no staff login or authentication.

## Deploy to Cloudflare Pages

This is a static HTML/CSS/JavaScript site and needs no build step. The included `wrangler.jsonc` points Pages at the project root. For a GitHub-connected Cloudflare Pages project, select **Workers & Pages → Create application → Pages → Import an existing Git repository**, then use:

- Production branch: `main`
- Build command: `exit 0`
- Build output directory: `.`

The top-level `index.html` is the Pages entry point. Add the Google Forms URLs to `app.js` and commit those edits before deployment. See [Cloudflare's static HTML Pages guide](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/) for current setup steps.
