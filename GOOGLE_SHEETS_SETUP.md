# Google Sheets Integration Setup

## To connect your Google Sheet to this app:

### Option 1: Using Service Account (Recommended for production)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "Google Sheets API"
4. Create a Service Account:
   - Go to Service Accounts
   - Create Service Account (any name)
   - Click on the service account → Keys → Add Key → Create new JSON key
   - This will download a JSON file
5. Share your Google Sheet with the service account email (found in the JSON file under "client_email")
6. Copy these values from the JSON file to .env.local:
   - GOOGLE_SERVICE_ACCOUNT_EMAIL=your-email@your-project.iam.gserviceaccount.com
   - GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

### Option 2: Using API Key (for public sheets)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create API Key
3. Enable "Google Sheets API"
4. Make your Google Sheet publicly viewable
5. Add to .env.local:
   - GOOGLE_API_KEY=your-api-key

## Google Sheet Format

Your sheet should have these columns:
- Column A: Category (e.g., "Work", "Learning")
- Column B: Title (e.g., "GitHub")
- Column C: URL (e.g., "https://github.com")
- Column D: Description (optional, for category description)

Example:
| Category | Title       | URL                    | Description              |
|----------|-------------|------------------------|--------------------------|
| Work     | GitHub      | https://github.com     | Version control          |
| Work     | Stack Overflow | https://stackoverflow.com | Q&A for developers      |
| Learning | Udemy       | https://udemy.com      | Online courses           |

## Testing

After setting up:
1. Create .env.local file with your credentials
2. Run `npm run dev`
3. The app will fetch data from your Google Sheet
4. If it fails, it will fall back to default data from data/links.ts
