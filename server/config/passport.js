import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import User from '../models/User.js';

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/api/auth/google/callback',
        scope: ['profile', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({
            where: {
              oauth_provider: 'google',
              oauth_id: profile.id
            }
          });

          if (user) {
            return done(null, user);
          }

          // Check if user exists with this email
          const email = profile.emails?.[0]?.value;
          if (email) {
            user = await User.findOne({ where: { email } });
            
            if (user) {
              // Link OAuth to existing account
              await user.update({
                oauth_provider: 'google',
                oauth_id: profile.id,
                avatar_url: user.avatar_url || profile.photos?.[0]?.value
              });
              return done(null, user);
            }
          }

          // Create new user
          user = await User.create({
            email: email || `${profile.id}@google.oauth`,
            name: profile.displayName,
            avatar_url: profile.photos?.[0]?.value,
            oauth_provider: 'google',
            oauth_id: profile.id,
            role: 'tenant', // Default role for OAuth users
            password: null
          });

          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
}

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5001/api/auth/github/callback',
        scope: ['user:email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({
            where: {
              oauth_provider: 'github',
              oauth_id: profile.id
            }
          });

          if (user) {
            return done(null, user);
          }

          const email = profile.emails?.[0]?.value;
          if (email) {
            user = await User.findOne({ where: { email } });
            
            if (user) {
              await user.update({
                oauth_provider: 'github',
                oauth_id: profile.id,
                avatar_url: user.avatar_url || profile.photos?.[0]?.value
              });
              return done(null, user);
            }
          }

          user = await User.create({
            email: email || `${profile.id}@github.oauth`,
            name: profile.displayName || profile.username,
            avatar_url: profile.photos?.[0]?.value,
            oauth_provider: 'github',
            oauth_id: profile.id,
            role: 'tenant',
            password: null
          });

          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
}

// Facebook OAuth Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:5001/api/auth/facebook/callback',
        profileFields: ['id', 'displayName', 'photos', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({
            where: {
              oauth_provider: 'facebook',
              oauth_id: profile.id
            }
          });

          if (user) {
            return done(null, user);
          }

          const email = profile.emails?.[0]?.value;
          if (email) {
            user = await User.findOne({ where: { email } });
            
            if (user) {
              await user.update({
                oauth_provider: 'facebook',
                oauth_id: profile.id,
                avatar_url: user.avatar_url || profile.photos?.[0]?.value
              });
              return done(null, user);
            }
          }

          user = await User.create({
            email: email || `${profile.id}@facebook.oauth`,
            name: profile.displayName,
            avatar_url: profile.photos?.[0]?.value,
            oauth_provider: 'facebook',
            oauth_id: profile.id,
            role: 'tenant',
            password: null
          });

          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
}

export default passport;
