# Carpuni

University social network built for the TypeScript lab.

## Run

```bash
npm install
copy server\.env.example server\.env
npm run dev:server
npm run dev:client
```

Server: `http://localhost:4000`

Client: `http://localhost:5173`

## Database

The backend uses MongoDB through Mongoose.

Default local connection:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/carpuni
JWT_SECRET=change-this-secret
```

Start MongoDB locally before `npm run dev:server`. On first server start, the app seeds demo users, posts, events, schedule, and one complaint.

Demo accounts:

```text
i.petrenko@pnu.edu.ua / password
m.kovalenko@pnu.edu.ua / password
admin@pnu.edu.ua / password
```

Passwords are stored only as bcrypt hashes in MongoDB.

Main MongoDB collections:

```text
users              registered platform users with passwordHash
whitelistrecords   university email whitelist and automatic role/profile data
posts              feed posts with likes and hashtags
comments           post comments and threaded replies
events             university events and registrations
schedules          weekly student schedules with class pairs
follows            user-to-user subscriptions
savedposts         posts saved by a user
notifications      user alerts for comments, follows, events, and messages
conversations      private message threads
messages           private messages inside conversations
complaints         moderation reports for the admin panel
```
