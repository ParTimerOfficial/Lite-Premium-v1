# ParTimer Official - Business Simulation Platform

## 🚀 Project Overview

**ParTimer Official** is a comprehensive business simulation platform built with React, Supabase, and advanced security systems. This platform provides users with a safe environment to learn real business skills through digital asset management, investment simulation, and community building.

### 🎯 Core Features

- **Business Simulation**: Learn real business skills in a safe, risk-free environment
- **Dual Shop System**: Worker Assets (active collection) and Investor Assets (passive income)
- **Collection Engine**: 24-hour collection system with Electric Hammer effects and Charge Meter
- **Device Fingerprinting**: Advanced anti-fraud system with race condition prevention
- **Bilingual Support**: Full Bangla/English i18n with natural financial translations
- **Theme System**: Dark/Light theme with complete integration
- **Admin Command Center**: Comprehensive admin controls for economy management
- **Community Integration**: Telegram, WhatsApp, and IMO community links
- **Referral System**: Double bonus referral system with tracking

## 🏗️ Technical Architecture

### Frontend Stack

- **React 18** with functional components and hooks
- **Vite** for fast development and build process
- **Tailwind CSS** for utility-first styling
- **React Router** for client-side routing
- **Lucide React** for modern SVG icons
- **Supabase Client** for database operations

### Backend Stack

- **Supabase** (PostgreSQL + Auth + Storage)
- **PostgreSQL** with advanced RLS (Row Level Security)
- **PL/pgSQL** functions for business logic
- **Real-time subscriptions** for live updates
- **Edge Functions** for serverless operations

### Security Features

- **Device Fingerprinting** with Web Crypto API
- **Row Level Security** policies for data protection
- **Race Condition Prevention** in collection system
- **Input Validation** and sanitization
- **JWT Authentication** with Supabase Auth

## 📊 Database Schema

### Core Tables

#### Users Table

```sql
users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT,
  coins_balance FLOAT DEFAULT 1000,
  total_hourly_rate FLOAT DEFAULT 0,
  last_collect TIMESTAMP,
  device_hash TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  theme_preference TEXT DEFAULT 'dark',
  language_preference TEXT DEFAULT 'bn',
  risk_score FLOAT DEFAULT 0.5,
  xp INTEGER DEFAULT 0,
  rank TEXT DEFAULT 'Beginner',
  referrer_id UUID REFERENCES users(id)
)
```

#### Assets Table (Business Simulation)

```sql
assets (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'worker',
  price_coins FLOAT NOT NULL,
  base_rate FLOAT DEFAULT 0,
  risk_level TEXT DEFAULT 'medium',
  market_sensitivity FLOAT DEFAULT 1.0,
  volatility_index FLOAT DEFAULT 0.03,
  stock_limit INTEGER DEFAULT 100,
  units_sold INTEGER DEFAULT 0,
  lifecycle_days INTEGER DEFAULT 30
)
```

#### User Assets Table

```sql
user_assets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  asset_id UUID REFERENCES assets(id),
  purchase_date TIMESTAMP DEFAULT NOW(),
  last_collection_time TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'active',
  risk_modifier FLOAT DEFAULT 1.0,
  validity_end_date TIMESTAMP
)
```

#### Economy State Table

```sql
economy_state (
  id TEXT PRIMARY KEY DEFAULT 'global',
  total_coins_circulation FLOAT DEFAULT 0,
  market_demand_index FLOAT DEFAULT 1.0,
  season_modifier FLOAT DEFAULT 1.0,
  inflation_rate FLOAT DEFAULT 0.0
)
```

## 🎮 Game Mechanics

### Collection System

- **24-Hour Collection Cycle**: Users must collect earnings within 24 hours
- **Charge Meter**: Visual progress indicator with intensity levels
- **Electric Hammer Effects**: Haptic feedback and particle animations
- **Dynamic Profit Calculation**: Risk-based, market-driven returns
- **Race Condition Protection**: Prevents double-dipping and fraud

### Asset Types

#### Worker Assets (Active Collection Required)

- **Rickshaw**: 7,200 Coins, 0.50 Coins/hour, Low Risk
- **Electric Bike**: 10,000 Coins, 0.69 Coins/hour, Low Risk
- **CNG**: 14,200 Coins, 0.98 Coins/hour, Medium Risk
- **Car (Sedan)**: 25,000 Coins, 1.73 Coins/hour, Medium Risk
- **Mini Truck**: 45,000 Coins, 3.12 Coins/hour, Medium Risk
- **Pickup Van**: 70,000 Coins, 4.86 Coins/hour, High Risk
- **Passenger Bus**: 100,000 Coins, 6.94 Coins/hour, High Risk
- **Cargo Truck**: 150,000 Coins, 10.41 Coins/hour, High Risk
- **Excavator**: 250,000 Coins, 17.36 Coins/hour, High Risk
- **Tractor**: 400,000 Coins, 27.77 Coins/hour, High Risk

#### Investor Assets (Passive Income)

- **Small Shop**: 7,200 Coins, 72 Coins/day, Low Risk, 30-day lifecycle
- **Mini Mart**: 14,200 Coins, 284 Coins/day, Medium Risk, 30-day lifecycle
- **Pharmacy**: 7,200 Coins, 144 Coins/day, Medium Risk, 60-day lifecycle
- **Tech Startup**: 50,000 Coins, 1,000 Coins/day, High Risk, 90-day lifecycle
- **Real Estate**: 100,000 Coins, 2,500 Coins/day, High Risk, 180-day lifecycle

### Risk & Market System

- **Risk Levels**: Low, Medium, High with corresponding bonuses
- **Market Demand Index**: Dynamic multiplier based on economy
- **Season Modifiers**: Time-based adjustments
- **Volatility Index**: Random fluctuations (-3% to +3%)
- **Inflation Control**: Admin-controlled economic adjustments

## 🔧 Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase project with database

### Installation Steps

1. **Clone the repository**

```bash
git clone https://github.com/Marjangazi/Lite-Premium-v1.git
cd Lite-Premium-v1
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Set up Supabase database**
   Run the SQL from `database.sql` in your Supabase SQL editor

5. **Start development server**

```bash
npm run dev
```

### Supabase Setup

1. **Create Supabase project**
2. **Enable Authentication** with Email sign-up
3. **Create database schema** using `database.sql`
4. **Set up RLS policies** (included in schema)
5. **Configure storage buckets** for assets if needed

## 🎨 Theme System

### Dark Theme (Default)

- **Background**: #0a0a0a (Deep space black)
- **Primary**: #00f3ff (Neon cyan)
- **Secondary**: #ffd700 (Premium gold)
- **Accent**: #ff0055 (Electric pink)
- **Text**: #ffffff (Clean white)

### Light Theme

- **Background**: #ffffff (Clean white)
- **Primary**: #007bff (Classic blue)
- **Secondary**: #28a745 (Success green)
- **Accent**: #dc3545 (Danger red)
- **Text**: #000000 (Deep black)

### Theme Switching

```javascript
import { useTheme } from "./lib/ThemeContext";

function MyComponent() {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button onClick={toggleTheme}>
      Switch to {isDark ? "Light" : "Dark"} Theme
    </button>
  );
}
```

## 🌐 Internationalization (i18n)

### Supported Languages

- **English (en)**: Default language
- **Bangla (bn)**: Natural financial translations

### Usage

```javascript
import { t, switchLanguage } from "./lib/i18n";

// Get translated text
const buttonText = t("collect");

// Switch language
switchLanguage("bn");
```

### Translation Structure

```javascript
const translations = {
  en: {
    collect: "Collect My Earning",
    balance: "Balance",
    coins: "Coins",
  },
  bn: {
    collect: "আমার আয় সংগ্রহ করুন",
    balance: "ব্যালেন্স",
    coins: "কয়েন",
  },
};
```

## 🛡️ Security Features

### Device Fingerprinting

```javascript
import { deviceFingerprint } from "./lib/deviceFingerprint";

// Validate device on login
const validation = await deviceFingerprint.validateFingerprint();
if (!validation.isValid) {
  // Handle security alert
}
```

### Race Condition Prevention

- **Database Locks**: FOR UPDATE clauses in critical operations
- **Atomic Transactions**: All-or-nothing operations
- **Unique Constraints**: Prevent duplicate actions
- **Timestamp Validation**: Ensure actions are within valid timeframes

### RLS Policies

```sql
-- Users can only view their own data
CREATE POLICY "Users view own assets" ON user_assets
FOR SELECT USING (auth.uid() = user_id);

-- Admin controls
CREATE POLICY "Admin Control" ON users
FOR ALL USING (auth.email() = 'admin@example.com');
```

## 🎮 Collection Engine

### Frontend Implementation

```javascript
import { collectionEngine } from "./lib/collectionEngine";

// Initialize for user
await collectionEngine.initialize(userId);

// Perform collection
const result = await collectionEngine.collectEarnings();
```

### Backend Function

```sql
CREATE OR REPLACE FUNCTION collect_user_earnings(user_id UUID, current_device_hash TEXT)
RETURNS JSON AS $$
-- Atomic collection with security checks
-- Dynamic profit calculation
-- Device fingerprint validation
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Features

- **Charge Meter**: Real-time progress visualization
- **Electric Hammer Effects**: Haptic feedback and animations
- **Particle Physics**: Coin collection animations
- **Sound Effects**: Audio feedback for actions
- **Security Validation**: Device fingerprinting

## 👑 Admin System

### Admin Command Center

- **User Management**: View, edit, and manage users
- **Asset Management**: Create, edit, and manage assets
- **Economy Control**: Adjust market parameters in real-time
- **System Monitoring**: Real-time system status and metrics
- **Logs & Audit**: Track all admin actions and system events

### Economy Controls

```javascript
// Update economy parameters
await supabase.rpc("update_economy_parameters", {
  new_market_demand: 1.2,
  new_season_modifier: 0.9,
  new_inflation_rate: 0.05,
});
```

## 🤝 Community Integration

### Community Links

- **Telegram**: https://t.me/ParTimer_officiall
- **WhatsApp**: https://chat.whatsapp.com/GPKWrKM6P7e045vp6UGsoQ
- **IMO**: https://imo.im/ParTimerOfficial

### Admin-Editable Links

```sql
INSERT INTO community_links (platform, url, is_active, admin_editable)
VALUES ('telegram', 'https://t.me/ParTimer_officiall', true, true);
```

## 📈 Performance Optimization

### Lazy Loading

- **Route-based code splitting**
- **Component lazy loading**
- **Image optimization**

### Caching Strategy

- **Browser caching** for static assets
- **Database query optimization**
- **Real-time subscription management**

### Mobile Optimization

- **Touch-friendly interfaces**
- **Responsive design**
- **Performance monitoring**
- **Low-end device support**

## 🚀 Deployment

### Netlify Deployment

1. Connect repository to Netlify
2. Set environment variables
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

### Vercel Deployment

1. Import project from GitHub
2. Set environment variables
3. Deploy

### Production Checklist

- [ ] Set up production Supabase project
- [ ] Configure environment variables
- [ ] Enable SSL/TLS
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies
- [ ] Test security measures

## 🧪 Testing

### Unit Testing

```bash
npm test
```

### E2E Testing

```bash
npm run test:e2e
```

### Performance Testing

- **Lighthouse audits**
- **Load testing**
- **Mobile performance testing**

## 📚 API Documentation

### Collection API

```javascript
// Collect user earnings
const { data, error } = await supabase.rpc("collect_user_earnings", {
  user_id: userId,
  current_device_hash: deviceHash,
});
```

### Asset Management API

```javascript
// Get user assets
const { data, error } = await supabase
  .from("user_assets")
  .select(
    `
    *,
    assets (
      name,
      type,
      base_rate,
      risk_level
    )
  `,
  )
  .eq("user_id", userId);
```

### Economy API

```javascript
// Get economy state
const { data, error } = await supabase
  .from("economy_state")
  .select("*")
  .single();
```

## 🔧 Development

### Code Style

- **ESLint** for code linting
- **Prettier** for code formatting
- **Conventional commits** for git history

### Development Workflow

1. Create feature branch
2. Make changes with tests
3. Run linting and formatting
4. Create pull request
5. Code review and merge

### Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 🐛 Bug Reports

### Reporting Bugs

1. Check existing issues
2. Create detailed bug report
3. Include reproduction steps
4. Add screenshots if applicable

### Issue Template

```markdown
## Bug Description

[Describe the bug]

## Steps to Reproduce

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior

[Describe what you expected to happen]

## Screenshots

[If applicable, add screenshots]

## Environment

- OS: [e.g. iOS]
- Browser: [e.g. chrome, safari]
- Version: [e.g. 22]
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 🙏 Acknowledgments

- **Supabase** for the excellent backend platform
- **React Community** for the amazing ecosystem
- **Tailwind CSS** for the utility-first approach
- **All Contributors** who have helped make this project better

## 📞 Support

For support and questions:

- **Email**: mdmarzangazi@gmail.com
- **Telegram**: https://t.me/ParTimer_officiall
- **WhatsApp**: https://chat.whatsapp.com/GPKWrKM6P7e045vp6UGsoQ

---

**Remember**: This is a simulation platform. No real-world financial guarantees are provided. Always practice responsible digital asset management.

**ParTimer Official** - Learn Business Skills in a Safe Environment 🚀
