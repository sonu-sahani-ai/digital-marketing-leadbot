'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Dashboard() {

  const router = useRouter()

  const [loading, setLoading] = useState(true)

  const [leads, setLeads] = useState<any[]>([])

  useEffect(() => {

    async function loadDashboard() {

      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) {

        router.push('/login')

        return

      }

      const { data } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', {
          ascending: false
        })

      setLeads(data || [])

      setLoading(false)

    }

    loadDashboard()

  }, [])

  async function saveRemark(
    id: string,
    remark: string
  ) {

    await supabase
      .from('leads')
      .update({ remark })
      .eq('id', id)

  }

  async function logout() {

    await supabase.auth.signOut()

    router.push('/login')

  }

  const totalLeads = leads.length

  const today = new Date().toLocaleDateString()

  const todayLeads = leads.filter((lead) => {

    const leadDate = new Date(
      lead.created_at
    ).toLocaleDateString()

    return leadDate === today

  })

  // GROUP LEADS BY DATE

  const groupedLeads = leads.reduce(
    (groups, lead) => {

      const leadDate = new Date(lead.created_at)

      const today = new Date()

      const yesterday = new Date()

      yesterday.setDate(today.getDate() - 1)

      let dateLabel = ''

      if (leadDate.toDateString() === today.toDateString()) {

        dateLabel = '🔥 Today'

      } else if (leadDate.toDateString() === yesterday.toDateString()) {

        dateLabel = '⏳ Yesterday'

      } else {

        dateLabel = leadDate.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })

      }

      if (!groups[dateLabel]) {
        groups[dateLabel] = []
      }

      groups[dateLabel].push(lead)

      return groups

    },

    {} as Record<string, any[]>
  )

  if (loading) {

    return (

      <main className='h-screen bg-black flex items-center justify-center text-white text-2xl'>
        Loading...
      </main>

    )

  }

  return (

    // ✅ FIX: h-screen + overflow-y-auto enables proper scroll on ALL devices
    <main className='h-screen overflow-y-auto bg-gradient-to-br from-slate-950 via-black to-slate-900 text-white'>

      <div className='max-w-7xl mx-auto p-4 md:p-6'>

        {/* HEADER */}

        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10'>

          <div>

            <h1 className='text-4xl md:text-5xl font-bold'>
              📈 Lead Dashboard
            </h1>

            <p className='text-gray-400 mt-2'>
              AI Lead Management CRM
            </p>

          </div>

          <button
            onClick={logout}
            className='bg-red-600 hover:bg-red-700 active:scale-95 transition-all px-6 py-3 rounded-2xl font-semibold w-fit'
          >
            Logout
          </button>

        </div>

        {/* STATS */}

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-10'>

          <div className='bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl'>

            <p className='text-gray-400'>Total Leads</p>

            <h2 className='text-5xl font-bold mt-3'>
              {totalLeads}
            </h2>

          </div>

          <div className='bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl'>

            <p className='text-gray-400'>Today's Leads</p>

            <h2 className='text-5xl font-bold mt-3'>
              {todayLeads.length}
            </h2>

          </div>

          <div className='bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl'>

            <p className='text-gray-400'>Latest Service</p>

            <h2 className='text-2xl font-bold mt-3'>
              {leads[0]?.service || 'No Leads'}
            </h2>

          </div>

        </div>

        {/* GROUPED LEADS */}

        {Object.entries(groupedLeads as Record<string, any[]>).map(
          ([date, dayLeads]) => (

            <div key={date} className='mb-12'>

              {/* DATE HEADER */}

              <div className='flex items-center justify-between mb-6'>

                <h2 className='text-2xl md:text-3xl font-bold'>
                  📅 {date}
                </h2>

                <div className='bg-blue-600 px-5 py-2 rounded-full text-sm font-semibold shrink-0'>
                  {dayLeads.length} Leads
                </div>

              </div>

              {/* LEADS */}

              <div className='grid gap-6'>

                {dayLeads.map((lead) => (

                  <div
                    key={lead.id}
                    className='bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl hover:bg-white/10 transition-all'
                  >

                    <div className='grid lg:grid-cols-2 gap-6'>

                      {/* LEFT */}

                      <div>

                        <h2 className='text-2xl md:text-3xl font-bold'>
                          {lead.business_name}
                        </h2>

                        <div className='space-y-3 mt-5 text-gray-300'>

                          <p>👤 {lead.name}</p>

                          <p>📞 {lead.phone}</p>

                          <p>📧 {lead.email}</p>

                          <p>🌐 {lead.website}</p>

                          <p>🎯 {lead.service}</p>

                          <p>💰 {lead.budget}</p>

                        </div>

                      </div>

                      {/* RIGHT */}

                      <div>

                        <div className='bg-black/30 rounded-2xl p-5 mb-5'>

                          <h3 className='text-xl font-semibold mb-3'>
                            Business Goals
                          </h3>

                          <p className='text-gray-300 whitespace-pre-line'>
                            {lead.goals}
                          </p>

                        </div>

                        {/* REMARK */}

                        <textarea
                          defaultValue={lead.remark || ''}
                          placeholder='Add follow-up remark...'
                          onBlur={(e) => saveRemark(lead.id, e.target.value)}
                          className='w-full h-32 bg-black/30 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-white/30 transition-colors resize-none'
                        />

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          )
        )}

        {/* EMPTY STATE */}

        {leads.length === 0 && (

          <div className='text-center py-20 text-gray-500'>

            <p className='text-6xl mb-4'>📭</p>

            <p className='text-xl'>No leads yet</p>

          </div>

        )}

        {/* BOTTOM PADDING FOR MOBILE */}

        <div className='h-10' />

      </div>

    </main>

  )
}

