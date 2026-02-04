# Vercel Serverless Deployment Guide

This project is now compatible with Vercel's serverless platform. The codebase has been optimized to work in both traditional Node.js environments and Vercel's serverless functions.

## Key Changes for Serverless Compatibility

### 1. Environment Detection
The application automatically detects if it's running in a serverless environment by checking:
```javascript
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
```

### 2. Database Connection Pooling

#### MySQL (Sequelize)
- **Serverless optimized**: Max 2 connections, min 0
- **Connection timeout**: 60 seconds
- **Idle timeout**: 10 seconds

#### MongoDB
- **Serverless pool size**: 1 connection
- **Traditional pool size**: 10 connections
- **Connection timeout**: 10 seconds
- **Socket timeout**: 45 seconds
- **Automatic reconnection**: Connection health is verified before each operation
- **Connection state management**: Handles closed connections gracefully with automatic reconnection
- **Concurrent connection handling**: Multiple simultaneous requests share a single connection attempt

#### Redis
- **Serverless keep-alive**: 0 (disabled)
- **Traditional keep-alive**: 30 seconds
- **Connection timeout**: 10 seconds

### 3. Background Tasks Disabled
All `setInterval` timers are disabled in serverless environments:
- BlogManager polling (disabled)
- GuideManager polling (disabled)
- RanksManager polling (disabled)
- SessionManager cleanup (disabled)
- AuthManager cleanup (disabled)
- Discord metadata updates (disabled)
- Webhook queue processing (disabled)

In serverless, data is fetched on-demand rather than cached and refreshed with intervals.

### 4. Instrumentation
The `instrumentation.ts` file now initializes managers differently:
- **Traditional**: Fetches and caches data on startup
- **Serverless**: Initializes managers but fetches data on-demand

## Deployment to Vercel

### Prerequisites
1. Install Vercel CLI: `npm install -g vercel`
2. Login to Vercel: `vercel login`

### Environment Variables
Set these in your Vercel project dashboard:

**Required:**
- `MONGO_URI` - MongoDB connection string
- `MYSQL_AUTH_URI` - MySQL auth database connection string
- `MYSQL_LUCPKERMS_URI` - MySQL LuckPerms database connection string
- `REDIS_URI` - Redis connection string
- `STRAPI_URL` - Strapi CMS URL
- `STRAPI_TOKEN` - Strapi API token
- `CLIENT_ID` - Discord OAuth2 client ID

**Optional Discord:**
- `DISCORD_ROLE_OYUNCU`
- `DISCORD_ROLE_CIRAK`
- `DISCORD_ROLE_ASIL`
- `DISCORD_ROLE_SOYLU`
- `DISCORD_ROLE_SENYOR`

### Deploy Steps

1. **Link your project:**
   ```bash
   vercel link
   ```

2. **Set environment variables:**
   ```bash
   vercel env add MONGO_URI production
   vercel env add MYSQL_AUTH_URI production
   # ... add all other environment variables
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

## Configuration Files

### `vercel.json`
- Sets build and install commands
- Configures function timeouts (10 seconds for API routes)
- Sets framework to Next.js

### `next.config.mjs`
- Sets `output: 'standalone'` when `VERCEL` environment variable is set
- This optimizes the build for serverless deployment

## Important Notes

### Limitations in Serverless
1. **No background tasks**: setInterval, setTimeout with long durations won't work
2. **Cold starts**: First request after idle period may be slower
3. **Execution time limits**: Vercel free tier has 10-second timeout for serverless functions
4. **Stateless**: Each function invocation is independent

### Database Considerations
1. **Connection pooling is critical**: The configuration limits connections to prevent exhaustion
2. **Use connection URIs with SSL**: Recommended for production MongoDB and Redis
3. **Consider PlanetScale or similar**: For MySQL, use serverless-friendly databases

### Alternative for Background Tasks
If you need background tasks (session cleanup, cache updates, etc.), consider:
1. **Vercel Cron Jobs**: Set up cron endpoints to run periodic tasks
2. **External service**: Use a traditional Node.js server for background tasks
3. **Database triggers**: Use MongoDB change streams or database triggers

## Testing

Test serverless behavior locally:
```bash
VERCEL=1 npm run dev
```

This will enable serverless mode and disable background timers.

## Monitoring

- Check function logs in Vercel dashboard
- Monitor cold start times
- Watch for database connection errors
- Set up error tracking (Sentry, etc.)

## Troubleshooting

### "MongoTopologyClosedError: Topology is closed"
This error has been fixed in the latest version. The MongoDB connection manager now:
- Automatically verifies connection health before operations
- Reconnects automatically if the connection is closed
- Handles concurrent connection attempts properly

If you still encounter this error:
- Ensure your MongoDB URI is correct and accessible from Vercel
- Check that your MongoDB cluster allows connections from Vercel's IP ranges
- Verify that your MongoDB cluster is not overloaded or unreachable

### "Too many connections" error
- Reduce pool size in database configurations
- Increase `maxIdleTimeMS` to reuse connections

### "Function execution timeout"
- Optimize slow database queries
- Consider upgrading Vercel plan for longer timeouts
- Split complex operations into multiple function calls

### Data not refreshing
- In serverless, data fetching is on-demand
- Consider implementing cache headers
- Use Vercel's Edge Network for caching

## Support

For issues specific to Vercel deployment, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Serverless Functions](https://nextjs.org/docs/api-routes/introduction)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
