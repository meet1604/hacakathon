# 🏥 AI Symptom Pre-Screener - 24-Hour Hackathon Roadmap

## 📋 Project Overview

**Project Name**: AI Symptom Pre-Screener  
**Hackathon**: FrontierHack - AI-First  
**Duration**: 24 hours  
**Team Size**: 1-4 members  

### Problem Statement
65% of India's population lacks timely healthcare access. People often don't know:
- Is this symptom serious?
- Should I visit a doctor now or wait?
- What should I tell my doctor?

### Solution
An AI-powered symptom pre-screening system that:
- Analyzes symptoms in natural language
- Assesses severity (low/moderate/high/emergency)
- Provides actionable care recommendations
- Generates structured medical summaries for doctors
- Offers medicine information for early-phase treatment

### Target Users
- 🏘️ Rural populations with limited healthcare access
- 👔 Busy professionals who delay checkups
- 👴 Elderly individuals needing quick guidance
- 🏥 Hospitals/clinics for patient pre-screening

---

## 🎯 Hackathon Requirements Checklist

### Must Include (Non-Negotiable)
- [x] AI/LLM deeply integrated (NOT just a chatbot bolt-on)
- [x] AI-first coding approach (Claude Code, OpenCode, etc.)
- [x] Full-stack functionality (no siloing)
- [x] All team members contribute (visible in commits)

### Submission Requirements
1. **Demo Video** - < 5 minutes, full walkthrough
2. **Code Repository** - All commits after hackathon start
3. **One-Page Doc** - Using provided template
4. **Live URL** - Deployed and accessible
5. **Landing Page** (Optional) - Using v0.dev or Bolt

### Judging Criteria
- ✅ Real problem, real solution
- ✅ AI deeply integrated (not superficial)
- ✅ Actually works (deployed and functional)
- ✅ Clean & polished UI/UX
- ✅ Team collaboration visible

---

## 🤖 AI Strategy & Budget

### Primary AI: Claude 3.5 Sonnet (Anthropic API)

**Why Claude?**
- ✅ Best medical reasoning capabilities
- ✅ Strong safety guardrails for health advice
- ✅ Excellent structured output generation
- ✅ Extended context window (200K tokens)
- ✅ Fast response times (2-3 seconds)

**Model**: `claude-3-5-sonnet-20241022`
**Pricing**: 
- Input: $3 per million tokens
- Output: $15 per million tokens
- **Per Analysis**: ~$0.02-0.03
- **Budget**: $10 = ~300-500 analyses

### Secondary AI: Qwen 3.6 Plus Preview (FREE via OpenRouter)

**Use Cases**:
- Medicine information lookup
- General health education
- Multi-language translation
- Bulk operations

**Cost**: FREE (perfect for hackathon!)

### API Budget Allocation
```
$10 Total Budget:
├─ Claude API: $7-8 (core symptom analysis)
├─ OpenRouter: FREE (medicine info)
└─ Reserve: $2-3 (testing & contingency)
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod

### Backend
- **API**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth (optional)
- **Storage**: Supabase Storage (for PDFs)

### AI Integration
- **Primary**: Anthropic Claude API
- **Secondary**: OpenRouter (Qwen 3.6 Plus - FREE)

### Deployment
- **Hosting**: Vercel (free tier)
- **Database**: Supabase (free tier)
- **Domain**: Vercel auto-domain

### Development Tools
- **AI Coding**: Claude Code ($20/team) or OpenCode (FREE)
- **Version Control**: Git + GitHub
- **CI/CD**: Vercel auto-deploy

---

## ⏱️ 24-HOUR TIMELINE

### PHASE 1: Setup & Foundation (Hours 0-2)
- [ ] Project initialization
- [ ] Database schema design
- [ ] Environment setup
- [ ] Team roles assignment

### PHASE 2: Core Backend (Hours 2-6)
- [ ] AI integration (Claude API)
- [ ] Symptom analysis endpoint
- [ ] Database operations
- [ ] Error handling

### PHASE 3: Frontend UI (Hours 6-12)
- [ ] Main symptom input interface
- [ ] Results display component
- [ ] Medicine lookup page
- [ ] Navigation & routing

### PHASE 4: Impressive Features (Hours 12-16)
- [ ] Voice input integration
- [ ] Multi-language support
- [ ] Symptom history tracking
- [ ] Emergency detection

### PHASE 5: Polish & Deploy (Hours 16-20)
- [ ] UI/UX refinements
- [ ] Mobile responsiveness
- [ ] Deploy to Vercel
- [ ] Landing page

### PHASE 6: Demo & Documentation (Hours 20-24)
- [ ] Record demo video
- [ ] Write one-page doc
- [ ] Final testing
- [ ] Submission

---

## 🎨 Design System

### Color Palette
```css
Primary: #3B82F6 (Blue 500)
Secondary: #8B5CF6 (Purple 500)
Success: #10B981 (Green 500)
Warning: #F59E0B (Amber 500)
Danger: #EF4444 (Red 500)
Background: #F9FAFB (Gray 50)
```

### Severity Colors
- **Low**: Green (#10B981)
- **Moderate**: Yellow (#F59E0B)
- **High**: Orange (#F97316)
- **Emergency**: Red (#EF4444)

### Typography
- **Font**: Inter (from Google Fonts)
- **Headings**: Bold, 600-700 weight
- **Body**: Regular, 400 weight

---

## 📊 Database Schema

See `DATABASE_SCHEMA.md` for complete SQL scripts.

**Core Tables**:
1. `sessions` - User session tracking
2. `symptom_reports` - Analysis results
3. `medicines` - Medicine database
4. `medicine_queries` - User searches

---

## 🚀 Quick Start Commands

```bash
# 1. Create Next.js project
npx create-next-app@latest symptom-checker --typescript --tailwind --app --use-npm

# 2. Install dependencies
npm install @anthropic-ai/sdk @supabase/supabase-js @supabase/ssr
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install react-hook-form @hookform/resolvers zod
npm install date-fns recharts openai

# 3. Setup shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input textarea select badge alert dialog tabs accordion progress skeleton toast

# 4. Setup environment variables
cp .env.example .env.local
# Fill in your API keys

# 5. Run development server
npm run dev

# 6. Deploy to Vercel
npm i -g vercel
vercel --prod
```

---

## 🎯 Core Features (Must-Have)

### 1. Symptom Analysis ✅
- Natural language input
- AI-powered analysis using Claude
- Severity assessment (4 levels)
- Confidence scoring
- Structured output

### 2. Care Recommendations ✅
- Immediate actions
- Care level (self-care, clinic, urgent, emergency)
- Timeframe guidance
- Red flag warnings

### 3. Doctor Summary ✅
- Structured medical report
- Downloadable PDF
- Shareable format
- Professional terminology

### 4. Medicine Information ✅
- Search functionality
- Common uses
- Dosage information
- Side effects & precautions

### 5. Session Tracking ✅
- Anonymous session IDs
- History storage
- Trend analysis

---

## ⭐ Impressive Features (Differentiators)

### 1. Voice Input 🎤
**Impact**: Makes it accessible for elderly and illiterate users
**Tech**: Web Speech API
**Time**: 1-2 hours

### 2. Multi-Language Support 🌍
**Languages**: English, Hindi, Gujarati
**Impact**: Serves rural India
**Tech**: Claude's multilingual capabilities
**Time**: 1 hour

### 3. Emergency Detection 🚨
**Features**:
- Auto-detect critical symptoms
- Prominent alerts
- Direct emergency helpline links
**Time**: 1 hour

### 4. Symptom History 📊
**Features**:
- Track symptom patterns
- Visual trends
- Export history
**Time**: 2 hours

### 5. Offline Mode (Bonus) 📴
**Features**:
- Cache previous responses
- Basic guidance without internet
- Sync when online
**Time**: 2-3 hours (if time permits)

---

## 🏆 Winning Strategy

### What Makes This Project Stand Out

1. **Solves Real Problem**
   - 65% of India is rural with limited healthcare
   - Reduces unnecessary hospital visits
   - Enables early intervention

2. **AI Deeply Integrated**
   - Claude for medical reasoning
   - Not just a chatbot wrapper
   - Structured medical outputs

3. **Production Ready**
   - Deployed on Vercel
   - Real database
   - Error handling
   - Mobile responsive

4. **Impressive Features**
   - Voice input (accessibility)
   - Multi-language (inclusivity)
   - Emergency detection (safety)

5. **Clean Implementation**
   - Modern tech stack
   - Proper architecture
   - Team collaboration visible

---

## 📝 Demo Video Script

### Structure (Under 5 minutes)

**[0:00-0:30] Hook - The Problem**
```
"Imagine having a fever at 2 AM in a rural village. 
The nearest doctor is 50 km away. 
Is it serious? Should you travel now or wait?
65% of India faces this reality."
```

**[0:30-1:00] Solution Introduction**
```
"Meet AI Symptom Pre-Screener - your 24/7 health companion.
Describe symptoms in your own words, get instant AI-powered guidance."
```

**[1:00-3:00] Feature Walkthrough**
1. Symptom input (show voice feature!)
2. AI analysis in action
3. Severity assessment
4. Recommendations display
5. Doctor summary download
6. Medicine lookup demo
7. Multi-language switch

**[3:00-4:00] Technical Excellence**
- Show code snippets
- Database design
- AI integration
- Architecture diagram

**[4:00-4:45] Impact & Metrics**
- Target users
- Potential reach
- Cost savings
- Lives improved

**[4:45-5:00] Call to Action**
```
"Try it now at [your-url].vercel.app
Open source on GitHub: [your-repo]
Built in 24 hours with AI-first approach."
```

---

## 🎬 Production Checklist

### Before Demo Recording
- [ ] All features working
- [ ] Mobile responsive tested
- [ ] Error states handled gracefully
- [ ] Loading states smooth
- [ ] Database populated with sample data
- [ ] Medicine database seeded
- [ ] API rate limits tested

### Video Recording
- [ ] Screen recording setup (Loom/OBS)
- [ ] Audio quality checked
- [ ] Script prepared
- [ ] Demo flow practiced
- [ ] Fallback demos ready
- [ ] Under 5 minutes ✨

### Deployment
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Build successful
- [ ] Live URL accessible
- [ ] Mobile tested
- [ ] Different browsers tested

### Documentation
- [ ] README.md complete
- [ ] One-page doc filled
- [ ] API documentation
- [ ] Setup instructions
- [ ] License added

### Code Quality
- [ ] All team members have commits
- [ ] Clean commit messages
- [ ] No sensitive data in repo
- [ ] .env.example provided
- [ ] TypeScript types complete

---

## 🚨 Risk Mitigation

### Technical Risks

**Risk 1: API Rate Limits**
- **Mitigation**: Cache responses, use FREE Qwen for non-critical features
- **Backup**: OpenRouter with multiple models

**Risk 2: Deployment Issues**
- **Mitigation**: Deploy early (Hour 18), test thoroughly
- **Backup**: Have Railway/Fly.io accounts ready

**Risk 3: Database Performance**
- **Mitigation**: Proper indexing, Supabase has auto-scaling
- **Backup**: Local PostgreSQL for development

**Risk 4: AI Response Quality**
- **Mitigation**: Test prompts extensively, have fallback responses
- **Backup**: Pre-cached common symptom responses

### Time Management Risks

**Risk 1: Scope Creep**
- **Solution**: Stick to core features first, bonus features if time permits
- **Priority**: Must-have > Impressive > Nice-to-have

**Risk 2: Integration Issues**
- **Solution**: Test integrations immediately after setup
- **Backup**: Simple REST API fallback

**Risk 3: Team Coordination**
- **Solution**: Clear task division, regular sync (every 4 hours)
- **Tool**: Use git worktrees for parallel development

---

## 👥 Team Role Distribution

### For 2-Person Team
**Person A (Full-Stack)**:
- Hours 0-6: Backend setup, AI integration, database
- Hours 6-12: API routes, core logic
- Hours 12-16: Medicine feature, history
- Hours 16-20: Deployment, testing

**Person B (Full-Stack)**:
- Hours 0-6: Frontend setup, component library
- Hours 6-12: Main UI, symptom form
- Hours 12-16: Voice input, multi-language
- Hours 16-20: Polish, video recording

### For 3-4 Person Team
**Person A (Backend Lead)**:
- Database design
- AI integration
- API routes
- Deployment

**Person B (Frontend Lead)**:
- UI components
- Main pages
- Responsive design
- Voice input

**Person C (Features)**:
- Medicine lookup
- History tracking
- Multi-language
- PDF generation

**Person D (Non-Tech/QA)**:
- Testing on devices
- Demo video creation
- Landing page (v0.dev)
- Documentation

---

## 📚 Resources & Links

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Anthropic API Docs](https://docs.anthropic.com)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)

### Tools
- [v0.dev](https://v0.dev) - Landing page generation
- [Bolt.new](https://bolt.new) - Quick prototypes
- [Loom](https://loom.com) - Demo video recording
- [Vercel](https://vercel.com) - Deployment

### Inspiration
- [WebMD Symptom Checker](https://symptoms.webmd.com/)
- [Ada Health](https://ada.com/)
- [Babylon Health](https://www.babylonhealth.com/)

---

## 🎓 Learning Resources

### If You Get Stuck

**Next.js Issues**:
- Check Next.js 14 App Router docs
- Use `'use client'` for interactive components
- API routes go in `/app/api/[route]/route.ts`

**Supabase Issues**:
- Check connection string format
- Verify Row Level Security (RLS) policies
- Use service role key for API routes

**AI Integration Issues**:
- Check API key validity
- Monitor token usage in dashboard
- Test with simple prompts first
- Add retry logic for rate limits

**Deployment Issues**:
- Check environment variables
- Review build logs
- Test locally with `npm run build` first

---

## 💡 Pro Tips

### Speed Tips
1. Use AI coding assistants (Claude Code/OpenCode)
2. Copy-paste shadcn/ui components
3. Use Supabase auto-generated types
4. Deploy early, deploy often
5. Test on real devices, not just desktop

### Quality Tips
1. Add loading states everywhere
2. Handle errors gracefully
3. Make it mobile-first
4. Add micro-interactions
5. Test with bad internet

### Demo Tips
1. Record video before final hour (buffer for issues)
2. Show the problem first, then solution
3. Highlight AI integration explicitly
4. Show mobile view
5. End with call-to-action

### Judging Tips
1. Make AI integration obvious in code
2. Show all team member commits
3. Deploy early to prove it works
4. Polish > Features (clean beats clunky)
5. Real problem > Cool tech

---

## 📞 Emergency Contacts

### If Things Break

**API Issues**:
- Check API keys in Vercel dashboard
- Monitor rate limits
- Switch to backup model (Qwen)

**Database Issues**:
- Check Supabase dashboard
- Verify connection string
- Check RLS policies

**Deployment Issues**:
- Check Vercel logs
- Verify environment variables
- Try manual deploy

**Time Running Out**:
- Focus on core features only
- Skip bonus features
- Polish what works
- Record video with what you have

---

## 🎉 Post-Hackathon

### If You Win
- [ ] Add to portfolio
- [ ] Write blog post
- [ ] Share on LinkedIn/Twitter
- [ ] Continue development

### If You Don't Win
- [ ] Still add to portfolio!
- [ ] Share learnings
- [ ] Open source it
- [ ] Build community

### Next Steps
- [ ] Add more languages
- [ ] Integrate real doctor network
- [ ] Add appointment booking
- [ ] Mobile app version
- [ ] Partner with clinics

---

## 📄 License & Disclaimer

**Medical Disclaimer**:
```
This tool is for informational purposes only and does not constitute 
medical advice. Always consult with qualified healthcare professionals 
for medical decisions. In case of emergency, call your local emergency 
services immediately.
```

**License**: MIT (recommended for hackathon projects)

---

## ✨ Final Checklist

### 2 Hours Before Submission
- [ ] Demo video recorded and uploaded
- [ ] Live URL accessible and tested
- [ ] GitHub repo public with README
- [ ] One-page doc completed
- [ ] Landing page deployed (optional)
- [ ] All team members committed code
- [ ] Environment variables documented
- [ ] Mobile responsiveness verified
- [ ] Error handling tested
- [ ] API keys secured

### Submission Time
- [ ] Submit all required materials
- [ ] Share live URL
- [ ] Post on social media
- [ ] Take a break - you earned it! 🎉

---

**Remember**: Better to have 5 features that work perfectly than 15 half-baked ones!

**Good luck! 🚀 You've got this!**
