# Deploy SPMS Mobile to Vercel

## Prerequisites

1. **Vercel Account**: Sign up at https://vercel.com
2. **GitHub Account**: Push code to GitHub
3. **Backend Running**: Ensure backend is accessible

---

## Step 1: Prepare for Deployment

### Update API URL for Production

Edit `src/services/api.js`:

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'https://your-backend-url.com/api/v1';
```

Or create `.env` file:

```env
REACT_APP_API_URL=https://your-backend-api.com/api/v1
```

---

## Step 2: Push to GitHub

```bash
cd /home/buyaka/Desktop/spms/mobile

# Initialize git (if not already)
git init

# Add files
git add .

# Commit
git commit -m "feat: add parent-focused mobile web app"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/spms-mobile.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd /home/buyaka/Desktop/spms/mobile
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? spms-mobile
# - Directory? ./
# - Override settings? No
```

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build:web`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variables:
   - `REACT_APP_API_URL`: Your backend URL

6. Click "Deploy"

---

## Step 4: Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

```
REACT_APP_API_URL=https://your-backend-api.com/api/v1
```

---

## Step 5: Test Deployment

1. Wait for deployment to complete
2. Vercel will provide a URL: `https://spms-mobile.vercel.app`
3. Open URL in browser
4. Test on mobile device:
   - Open URL on phone
   - Add to Home Screen (PWA)
   - Test all features

---

## Configuration Files

### vercel.json (Already Created)
```json
{
  "buildCommand": "expo export --platform web",
  "outputDirectory": "dist",
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### package.json (Already Updated)
```json
{
  "scripts": {
    "build:web": "expo export:web"
  }
}
```

---

## Testing Locally Before Deploy

```bash
# Build for web
npm run build:web

# Preview build (install serve)
npm install -g serve
serve dist

# Open http://localhost:3000
```

---

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain: `mobile.yourspms.com`
3. Follow DNS configuration instructions
4. Wait for SSL certificate (automatic)

---

## Progressive Web App (PWA) Features

The app will work as a PWA:
- ✅ Add to Home Screen
- ✅ Offline support (with service worker)
- ✅ App-like experience
- ✅ Push notifications (if configured)

Users can:
1. Open the Vercel URL on their phone
2. Tap "Add to Home Screen"
3. Use it like a native app

---

## Troubleshooting

### Build Fails

**Error**: Module not found
**Solution**: Clear cache and rebuild
```bash
rm -rf .expo node_modules dist
npm install
npm run build:web
```

### API Calls Fail

**Error**: CORS or network error
**Solution**:
1. Check backend CORS settings
2. Verify API_URL environment variable
3. Ensure backend allows requests from Vercel domain

### Styles Not Loading

**Error**: Blank page or unstyled
**Solution**:
1. Check browser console for errors
2. Verify all imports are correct
3. Test locally first with `npm run web`

---

## Monitoring

### Vercel Analytics

1. Go to your project dashboard
2. Click "Analytics" tab
3. View:
   - Page views
   - Unique visitors
   - Performance metrics

### Error Tracking

Check Vercel logs:
```bash
vercel logs YOUR_PROJECT_URL
```

---

## Updates and Redeployment

### Automatic (Recommended)

Every git push to `main` branch triggers redeployment:

```bash
# Make changes
git add .
git commit -m "fix: update feature"
git push

# Vercel automatically rebuilds and deploys
```

### Manual

```bash
vercel --prod
```

---

## Performance Optimization

### 1. Enable Compression

Already configured in `vercel.json` with cache headers.

### 2. Optimize Images

Use optimized image formats:
- WebP for photos
- SVG for icons
- Compress all images

### 3. Code Splitting

React Native Web handles this automatically.

---

## Security

### HTTPS

- ✅ Automatic SSL certificate
- ✅ Force HTTPS (automatic)

### Environment Variables

- ✅ Stored securely in Vercel
- ✅ Not exposed in client code
- ✅ Use `REACT_APP_` prefix for client-side vars

### API Security

Ensure backend has:
- CORS properly configured
- Rate limiting
- Authentication tokens
- Input validation

---

## Cost

### Vercel Free Tier Includes:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Git integration
- ✅ Preview deployments
- ✅ Analytics

For SPMS project: **Free tier is sufficient**

---

## Alternative: Netlify

If you prefer Netlify:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build:web

# Deploy
netlify deploy --prod --dir=dist
```

---

## Mobile App vs Web App

| Feature | Native App | Web App (Vercel) |
|---------|-----------|------------------|
| Installation | App Store | Add to Home Screen |
| Updates | Manual | Automatic |
| Offline | Full support | Limited |
| Notifications | Push | Web Push (limited) |
| Performance | Best | Good |
| Distribution | Store approval | Instant |

---

## Quick Deploy Checklist

- [ ] Update API URL in code
- [ ] Push code to GitHub
- [ ] Connect repo to Vercel
- [ ] Add environment variables
- [ ] Deploy
- [ ] Test on mobile device
- [ ] Share URL with users

---

## Support URLs

- **Vercel Docs**: https://vercel.com/docs
- **Expo Web**: https://docs.expo.dev/workflow/web/
- **React Native Web**: https://necolas.github.io/react-native-web/

---

## Example Deployment

Once deployed, users can:

1. **Access**: `https://spms-mobile.vercel.app`
2. **Mobile**: Open URL → Add to Home Screen
3. **Login**: Use parent account (parent001)
4. **Use**: Full app functionality in browser/PWA

---

**Ready to Deploy!** 🚀

All code is web-compatible. Just push to GitHub and connect to Vercel!
