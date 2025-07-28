# Firebase Setup & Deployment Guide

This guide will help you set up Firebase for your KanoProc E-Procurement Portal and deploy it to Firebase Hosting.

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- Firebase CLI installed: `npm install -g firebase-tools`
- A Google account for Firebase

### 2. Firebase Project Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project"
   - Name it "kanoproc-portal" (or your preferred name)
   - Enable Google Analytics (optional)

2. **Enable Required Services**
   - **Authentication**: Go to Authentication > Sign-in method
     - Enable "Email/Password" provider
   - **Firestore**: Go to Firestore Database
     - Create database in production mode
     - Choose your preferred location (europe-west3 for Nigeria region)
   - **Storage**: Go to Storage
     - Get started with default rules
   - **Hosting**: Go to Hosting
     - Get started (we'll configure this later)

3. **Get Firebase Configuration**
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps"
   - Click "Web app" (</>) to create a web app
   - Register app with name "KanoProc Portal"
   - Copy the config object

### 3. Local Setup

1. **Clone and Install Dependencies**
   ```bash
   git clone <your-repo-url>
   cd kanoproc-portal
   npm install
   ```

2. **Set Environment Variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Firebase config:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

3. **Initialize Firebase**
   ```bash
   firebase login
   firebase init
   ```
   
   When prompted, select:
   - Firestore: Configure security rules and indexes
   - Hosting: Configure files for Firebase Hosting
   - Storage: Configure security rules for Cloud Storage
   - Use existing project: Select your Firebase project
   - Firestore rules file: Use default `firestore.rules`
   - Firestore indexes file: Use default `firestore.indexes.json`
   - Public directory: `dist/spa`
   - Single-page app: Yes
   - Set up automatic builds: No
   - Storage rules file: Use default `storage.rules`

### 4. Seed Initial Data

1. **Update Seeding Script**
   - Edit `scripts/seedFirestore.ts`
   - Replace the firebaseConfig with your actual config

2. **Run Seeding Script**
   ```bash
   npx tsx scripts/seedFirestore.ts
   ```

   This creates:
   - Admin users (admin@kanostate.gov.ng, superuser@kanostate.gov.ng)
   - Sample companies
   - Sample tenders
   - Sample contracts and notifications

### 5. Development

```bash
# Start development server
npm run dev

# Build for production
npm run build:client

# Deploy to Firebase
npm run firebase:deploy
```

## 🔐 Security Configuration

### Firestore Rules

The included `firestore.rules` provides:
- User-specific data access
- Role-based permissions (company, admin, superuser)
- Document-level security
- Audit trail protection

### Storage Rules

The included `storage.rules` provides:
- Company document isolation
- Role-based file access
- Secure document upload/download

## 📊 Database Structure

### Collections

1. **users** - User authentication profiles
2. **companies** - Company registration data
3. **tenders** - Procurement opportunities
4. **contracts** - Awarded contracts
5. **notifications** - User notifications
6. **auditLogs** - System audit trail
7. **messages** - Internal messaging

### Subcollections

- `tenders/{tenderId}/bids` - Tender submissions
- `contracts/{contractId}/milestones` - Contract milestones

## 🚀 Deployment

### Automatic Deployment

```bash
# Build and deploy
npm run firebase:deploy
```

### Manual Deployment

```bash
# Build the client
npm run build:client

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Deploy database rules
firebase deploy --only firestore:rules,storage
```

### Environment-Specific Deployments

```bash
# Deploy to staging
firebase use staging
firebase deploy

# Deploy to production
firebase use production
firebase deploy
```

## 🔧 Configuration

### Custom Domain (Optional)

1. Go to Firebase Console > Hosting
2. Click "Add custom domain"
3. Follow the verification steps
4. Update DNS settings as instructed

### Performance Optimization

1. **Enable CDN caching**
   - Static assets are cached automatically
   - Custom cache headers in `firebase.json`

2. **Enable compression**
   - Gzip compression is enabled by default

3. **Optimize bundle size**
   ```bash
   npm run build:client
   # Check dist/spa for bundle analysis
   ```

## 📱 Features Enabled

### Real-time Updates
- Live tender updates
- Real-time notifications
- Live bid submissions
- Contract progress tracking

### File Storage
- Document uploads (PDF, DOC, images)
- Secure file access
- File metadata tracking
- Automatic file organization

### Authentication
- Email/password authentication
- Role-based access control
- Session management
- Password reset functionality

### Analytics
- User activity tracking
- System usage metrics
- Performance monitoring
- Error tracking

## 🎯 Testing

### Local Testing

```bash
# Start Firebase emulators
firebase emulators:start

# Run with emulators
VITE_USE_FIREBASE_EMULATOR=true npm run dev
```

### Production Testing

```bash
# Test production build locally
npm run build:client
firebase serve
```

## 🔍 Monitoring

### Firebase Console
- Authentication users
- Firestore data
- Storage usage
- Hosting metrics

### Error Monitoring
- Console errors are logged to Firestore
- Failed operations are tracked
- Performance metrics available

## 📈 Scaling

### Database Scaling
- Firestore automatically scales
- Implement pagination for large lists
- Use composite indexes for complex queries

### Storage Scaling
- Cloud Storage scales automatically
- Implement file size limits
- Use Cloud CDN for global distribution

### Hosting Scaling
- Firebase Hosting includes CDN
- Automatic scaling for traffic spikes
- Multi-region deployment available

## 🛠️ Troubleshooting

### Common Issues

1. **Authentication errors**
   - Check Firebase config in `.env`
   - Verify email/password is enabled

2. **Permission denied errors**
   - Check Firestore rules
   - Verify user roles

3. **File upload failures**
   - Check Storage rules
   - Verify file size limits

4. **Build failures**
   - Clear node_modules and reinstall
   - Check environment variables

### Support Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Support](https://firebase.google.com/support)

## 💰 Cost Optimization

### Free Tier Limits
- Authentication: 10,000 users
- Firestore: 1 GiB storage, 50K reads/day
- Storage: 5 GB, 1 GB/day downloads
- Hosting: 10 GB storage, 10 GB/month transfer

### Cost Management
- Monitor usage in Firebase Console
- Implement query optimization
- Use appropriate indexes
- Optimize file sizes

---

🎉 **Your KanoProc Portal is now ready for production!**

Access your deployed application at: `https://your-project-id.web.app`

For support, please refer to the troubleshooting section or contact the development team.
