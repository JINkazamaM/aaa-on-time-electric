# Deploy AAA On Time Electric to GoDaddy

## Prerequisites

1. A GoDaddy hosting account (cPanel/Linux Shared Hosting recommended)
2. Your domain configured and pointed to GoDaddy hosting
3. Your Gemini API key from Google AI Studio (https://makersuite.google.com/app/apikey)

---

## Step 1: Configure Your Environment

1. Edit `.env.local` and replace `YOUR_ACTUAL_GEMINI_API_KEY` with your real Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_key_here
   APP_URL=https://yourdomain.com
   ```

2. **IMPORTANT SECURITY NOTE**: The Gemini API key will be visible in your site's JavaScript bundle. This is a limitation of client-side apps. For production, consider:
   - Restricting the API key to your domain in Google Cloud Console
   - Using a backend proxy server (not included in this setup)

---

## Step 2: Rebuild with Your API Key

```bash
npm run build
```

---

## Step 3: Upload to GoDaddy

### Option A: File Manager (Easiest)

1. Log in to your GoDaddy account
2. Go to **My Products** → **Web Hosting** → **Manage**
3. Click **File Manager** under cPanel
4. Navigate to `public_html` (or your domain's document root)
5. Delete any existing files (or move them to a backup folder)
6. Upload the contents of the `dist/` folder:
   - `index.html`
   - `assets/` folder

### Option B: FTP/SFTP

1. Use an FTP client (FileZilla, Cyberduck)
2. Connect to your GoDaddy hosting:
   - Host: Your FTP server (found in cPanel)
   - Username: Your cPanel username
   - Password: Your cPanel password
   - Port: 21 (FTP) or 22 (SFTP)
3. Upload the contents of `dist/` to `public_html/`

### Option C: cPanel File Manager

1. Log in to cPanel
2. Open **File Manager**
3. Go to `public_html`
4. Click **Upload** and select all files from `dist/`

---

## Step 4: Configure .htaccess

Upload the included `.htaccess` file to your `public_html` folder. This enables:

- **SPA Routing**: Allows React Router to handle all URLs
- **Gzip Compression**: Faster page loads
- **Caching**: Better performance for static assets
- **Security Headers**: Basic XSS and clickjacking protection

---

## Step 5: Test Your Site

1. Visit your domain: `https://yourdomain.com`
2. Test the navigation links
3. Test the contact form
4. Test the chatbot (Jose Bot)

---

## Troubleshooting

### 500 Internal Server Error
- Check that `.htaccess` is uploaded to the root
- Contact GoDaddy support if `.htaccess` is disabled

### API Key Not Working
- Verify the key in `.env.local`
- Rebuild with `npm run build`
- Re-upload the `dist/` folder
- Check browser console for errors

### Styling Issues
- Clear browser cache (Ctrl+Shift+R)
- Verify `assets/` folder uploaded correctly

### Routes Not Working
- Confirm `.htaccess` is in place
- Ensure `mod_rewrite` is enabled in cPanel

---

## File Structure on GoDaddy

```
public_html/
├── .htaccess          ← Upload this file
├── index.html         ← Main entry point
└── assets/
    ├── index-XXXX.css ← CSS bundle
    └── index-XXXX.js  ← JavaScript bundle
```

---

## Optional: SSL/HTTPS

GoDaddy provides free SSL certificates. To enable:
1. Go to cPanel → **SSL/TLS**
2. Install the free Let's Encrypt certificate
3. Your site will be accessible via HTTPS

---

## Updates

When you make changes:
1. Edit your code
2. Run `npm run build`
3. Re-upload the `dist/` folder contents
4. Clear browser cache

---

## Support

- GoDaddy Hosting Support: https://www.godaddy.com/help
- Vite Deployment Docs: https://vitejs.dev/guide/static-deploy.html
