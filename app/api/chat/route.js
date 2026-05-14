import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'
import { companyInfo } from '@/lib/company'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// SIMPLE MEMORY
let sessions = {}

export async function POST(req) {

  try {

    const body = await req.json()

    const userMessage = body.message.trim()

    const sessionId = 'demo-user'

    // CREATE SESSION

    if (!sessions[sessionId]) {

      sessions[sessionId] = {

        messages: [],

        stage: 'intro',

        lead: {
          business_name: '',
          service: '',
          budget: '',
          goals: '',
          website: '',
          name: '',
          phone: '',
          email: ''
        }

      }

    }

    const session = sessions[sessionId]

    session.messages.push({
      role: 'user',
      content: userMessage
    })

    let reply = ''

    // =====================================
    // INTRO CHAT
    // =====================================

    if (session.stage === 'intro') {

      const completion = await openai.chat.completions.create({

        model: 'gpt-4o-mini',

        messages: [

          {
            role: 'system',
            content: `
You are AI sales assistant for ${companyInfo.name}.

Your goals:
- talk professionally
- understand business needs
- ask smart marketing questions
- qualify leads naturally
- do NOT ask contact details immediately

After 3-4 messages,
start collecting lead details naturally.

Keep replies short and professional.
`
          },

          ...session.messages

        ]

      })

      reply = completion.choices[0].message.content

      // START LEAD COLLECTION

      if (session.messages.length >= 4) {

        session.stage = 'business_name'

        reply += `

📈 To recommend the best marketing strategy,

What is your business name?
`

      }

    }

    // =====================================
    // BUSINESS NAME
    // =====================================

    else if (session.stage === 'business_name') {

      session.lead.business_name = userMessage

      session.stage = 'service'

      reply = `
Awesome 👍

Which service are you interested in?

• Meta Ads
• Google Ads
• SEO
• AI Automation
• Website Development
• Social Media Management
• Branding
• WhatsApp Automation
• Video Editing

Or type your custom requirement 😊
`

    }

    // =====================================
    // SERVICE
    // =====================================

    else if (session.stage === 'service') {

      session.lead.service = userMessage

      session.stage = 'budget'

      reply = `
Great 🚀

What is your monthly marketing budget?
`

    }

    // =====================================
    // BUDGET
    // =====================================

    else if (session.stage === 'budget') {

      session.lead.budget = userMessage

      session.stage = 'goals'

      reply = `
Perfect 👍

What is your main business goal right now?

Example:
• More leads
• More sales
• Brand awareness
• Website traffic
`

    }

    // =====================================
    // GOALS
    // =====================================

    else if (session.stage === 'goals') {

      session.lead.goals = userMessage

      session.stage = 'website'

      reply = `
Do you have a website or Instagram page?

You can share the link here 😊
`

    }

    // =====================================
    // WEBSITE
    // =====================================

    else if (session.stage === 'website') {

      session.lead.website = userMessage

      session.stage = 'name'

      reply = `
Great 😊

May I know your full name?
`

    }

    // =====================================
    // NAME VALIDATION
    // =====================================

    else if (session.stage === 'name') {

      const validName = /^[A-Za-z\s]+$/

      if (!validName.test(userMessage)) {

        reply = `
❌ Please enter a valid name.

Example:
Rahul Sharma
`

        return Response.json({ reply })

      }

      session.lead.name = userMessage

      session.stage = 'phone'

      reply = `
Thanks ${userMessage} 👍

Please share your 10-digit phone number.
`

    }

    // =====================================
    // PHONE VALIDATION
    // =====================================

    else if (session.stage === 'phone') {

      const validPhone = /^[0-9]{10}$/

      if (!validPhone.test(userMessage)) {

        reply = `
❌ Please enter a valid 10-digit phone number.

Example:
9876543210
`

        return Response.json({ reply })

      }

      session.lead.phone = userMessage

      session.stage = 'email'

      reply = `
Perfect 👍

Please share your email address.
`

    }

    // =====================================
    // EMAIL VALIDATION
    // =====================================

    else if (session.stage === 'email') {

      const validEmail =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      if (!validEmail.test(userMessage)) {

        reply = `
❌ Please enter a valid email address.

Example:
hello@gmail.com
`

        return Response.json({ reply })

      }

      session.lead.email = userMessage

      // FULL CHAT HISTORY

      const fullConversation = session.messages
        .map((m) => m.content)
        .join(' | ')

      // SAVE TO SUPABASE

      await supabase
        .from('leads')
        .insert([{

          business_name: session.lead.business_name,

          service: session.lead.service,

          budget: session.lead.budget,

          goals: session.lead.goals,

          website: session.lead.website,

          name: session.lead.name,

          phone: session.lead.phone,

          email: session.lead.email,

          message: fullConversation

        }])

      // FINAL RESPONSE

      reply = `
🎉 Thank you ${session.lead.name}

Our strategy team will review your requirements and contact you shortly.

━━━━━━━━━━━━━━━

📞 ${companyInfo.phone}

📧 ${companyInfo.email}

🌐 ${companyInfo.website}

━━━━━━━━━━━━━━━

✅ Your inquiry has been submitted successfully.
`

      // RESET SESSION

      sessions[sessionId] = {

        messages: [],

        stage: 'intro',

        lead: {
          business_name: '',
          service: '',
          budget: '',
          goals: '',
          website: '',
          name: '',
          phone: '',
          email: ''
        }

      }

    }

    return Response.json({ reply })

  } catch (error) {

    console.log(error)

    return Response.json({
      reply: 'Something went wrong.'
    })

  }

}