# Instagram Lightbox
A simple client-side app to display the images from an Instagram feed.

On page load, redirects to Instagram for authentication. On success, displays a simple lightbox view of the authenticated user's Instagram feed with "previous" and "next" navigation buttons.

##NOTE
Instagram integration is currently in sandbox mode. This imposes a couple of limitations on the app:
- Only accounts that have been explicitly whitelisted can authenticate.
- API access is limited to the 20 most recent images for the authenticated user.
