NOW WHAT? — BRANDED LANDING PAGE
=================================

This version uses the approved Now What? icon and wordmark/banner assets.

CONTENTS
--------
index.html
CNAME
assets/nowwhat-icon.webp
assets/nowwhat-banner.webp
assets/favicon.png
assets/icon-192.png
assets/icon-512.png

PUBLISH FREE WITH GITHUB PAGES
------------------------------
1. Create a SEPARATE GitHub repo called:
      nowwhat-landing

2. Upload everything in this folder, preserving the /assets folder.

3. GitHub:
      Settings > Pages
      Source: Deploy from a branch
      Branch: main
      Folder: / (root)
      Save

4. Under GitHub Pages > Custom domain, enter:
      nowwhat.it.com

5. Namecheap:
      Domain List > Manage > Advanced DNS

   KEEP all email/MX/forwarding records.

   Remove only conflicting website parking/redirect/A/CNAME records for the
   root domain or www.

   Add:
      A Record | Host @ | 185.199.108.153
      A Record | Host @ | 185.199.109.153
      A Record | Host @ | 185.199.110.153
      A Record | Host @ | 185.199.111.153

      CNAME Record | Host www | ShellyPousson.github.io

6. Back in GitHub Pages, once the domain is recognized:
      Enable "Enforce HTTPS"

NOTES
-----
- The landing page is completely static.
- No API key, backend URL, app code, or private repository content is exposed.
- beta@, hello@, and support@ will work through the existing Namecheap
  catch-all if that forwarding remains active.
