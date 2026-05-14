'use client'

import { useState, useRef, useEffect } from 'react'

export default function Home() {

  const [message, setMessage] = useState('')

  const [chat, setChat] = useState([
    {
      role: 'assistant',
      content:
        '👋 Welcome to ApexPro Digital Marketing.\n\nWe help businesses generate leads using Meta Ads, Google Ads, SEO & AI Automation.'
    }
  ])

  const [loading, setLoading] = useState(false)

  const bottomRef = useRef<HTMLDivElement | null>(null)

  // AUTO SCROLL

  useEffect(() => {

    bottomRef.current?.scrollIntoView({
      behavior: 'smooth'
    })

  }, [chat, loading])

  // SEND MESSAGE

  async function sendMessage(
    e?: React.FormEvent
  ) {

    // STOP PAGE REFRESH
    if (e) {
      e.preventDefault()
    }

    // PREVENT DOUBLE CLICK
    if (loading) return

    // EMPTY CHECK
    if (!message.trim()) return

    const currentMessage =
      message.trim()

    // ADD USER MESSAGE
    setChat((prev) => [

      ...prev,

      {
        role: 'user',
        content: currentMessage
      }

    ])

    // CLEAR INPUT
    setMessage('')

    setLoading(true)

    try {

      const response = await fetch(
        '/api/chat',
        {

          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body: JSON.stringify({
            message: currentMessage
          })

        }
      )

      // API ERROR
      if (!response.ok) {

        throw new Error(
          'API Error'
        )

      }

      const data =
        await response.json()

      // ADD AI REPLY
      setChat((prev) => [

        ...prev,

        {
          role: 'assistant',
          content:
            data.reply
        }

      ])

    } catch (error) {

      console.log(error)

      setChat((prev) => [

        ...prev,

        {
          role: 'assistant',
          content:
            '⚠️ Something went wrong.'
        }

      ])

    }

    setLoading(false)

  }

  return (

    <main className='h-dvh bg-gradient-to-br from-slate-950 via-black to-slate-900 p-2 md:p-4 overflow-hidden'>

      <div className='w-full max-w-5xl h-full mx-auto bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl overflow-hidden flex flex-col shadow-2xl'>

        {/* HEADER */}

        <div className='p-4 md:p-6 border-b border-white/10 bg-white/5 shrink-0'>

          <div className='flex items-center justify-between gap-4'>

            <div>

              <h1 className='text-2xl md:text-4xl font-bold text-white leading-tight'>
                ApexPro Digital Marketing
              </h1>

              <p className='text-gray-400 mt-1 text-sm md:text-base'>
                AI Lead Generation Assistant
              </p>

            </div>

            <div className='flex items-center gap-2 shrink-0'>

              <div className='w-3 h-3 rounded-full bg-green-400 animate-pulse'></div>

              <span className='text-sm text-white'>
                Online
              </span>

            </div>

          </div>

        </div>

        {/* CHAT AREA */}

        <div className='flex-1 overflow-y-auto p-3 md:p-6 space-y-5'>

          {chat.map((msg, index) => (

            <div
              key={index}
              className={`flex ${
                msg.role === 'user'
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >

              <div
                className={`max-w-[90%] md:max-w-[80%] px-4 md:px-5 py-3 md:py-4 rounded-3xl text-sm md:text-base leading-relaxed whitespace-pre-line shadow-lg break-words ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-white text-gray-800 rounded-bl-md'
                }`}
              >

                {msg.content}

              </div>

            </div>

          ))}

          {/* LOADING */}

          {loading && (

            <div className='flex justify-start'>

              <div className='bg-white px-5 py-4 rounded-3xl rounded-bl-md shadow-lg'>

                <div className='flex gap-2'>

                  <div className='w-2 h-2 rounded-full bg-gray-500 animate-bounce'></div>

                  <div className='w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-100'></div>

                  <div className='w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-200'></div>

                </div>

              </div>

            </div>

          )}

          <div ref={bottomRef}></div>

        </div>

        {/* INPUT AREA */}

        <div className='border-t border-white/10 bg-black/80 backdrop-blur-xl p-3 md:p-5 shrink-0'>

          <form
            onSubmit={sendMessage}
            className='flex items-center gap-2 md:gap-3'
          >

            <input
              type='text'
              value={message}
              onChange={(e) =>
                setMessage(
                  e.target.value
                )
              }
              placeholder='Ask about Meta Ads, SEO, Lead Generation...'
              className='flex-1 min-w-0 h-12 md:h-14 bg-white/10 border border-white/10 rounded-2xl px-4 md:px-5 text-sm md:text-base text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500'
            />

            <button
              type='submit'
              disabled={loading}
              className='h-12 md:h-14 shrink-0 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all px-5 md:px-7 rounded-2xl text-sm md:text-base text-white font-semibold shadow-lg disabled:opacity-50'
            >

              {loading
                ? '...'
                : 'Send'}

            </button>

          </form>

        </div>

      </div>

    </main>

  )

}