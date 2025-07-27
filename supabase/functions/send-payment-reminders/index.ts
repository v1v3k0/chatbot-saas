import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { addDays, differenceInDays } from 'https://esm.sh/date-fns@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const today = new Date()
    const tomorrow = addDays(today, 1)
    const dayAfterTomorrow = addDays(today, 2)

    // Get loans with upcoming due dates
    const { data: upcomingLoans, error: loansError } = await supabase
      .from('loan_requests')
      .select(`
        *,
        borrower:users!loan_requests_borrower_id_fkey (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .in('status', ['fully_funded', 'partially_funded'])
      .gte('due_date', today.toISOString())
      .lte('due_date', dayAfterTomorrow.toISOString())

    if (loansError) {
      throw new Error(`Failed to fetch upcoming loans: ${loansError.message}`)
    }

    const notifications = []

    for (const loan of upcomingLoans || []) {
      const dueDate = new Date(loan.due_date)
      const daysUntilDue = differenceInDays(dueDate, today)

      let reminderMessage = ''
      let notificationType = 'info'

      if (daysUntilDue === 0) {
        reminderMessage = `Your loan "${loan.title}" is due today! Please make your payment.`
        notificationType = 'warning'
      } else if (daysUntilDue === 1) {
        reminderMessage = `Your loan "${loan.title}" is due tomorrow. Please prepare your payment.`
        notificationType = 'info'
      } else if (daysUntilDue === 2) {
        reminderMessage = `Your loan "${loan.title}" is due in 2 days. Please prepare your payment.`
        notificationType = 'info'
      }

      if (reminderMessage) {
        notifications.push({
          user_id: loan.borrower_id,
          title: 'Payment Reminder',
          message: reminderMessage,
          type: notificationType,
          action_url: `/loans/${loan.id}`,
        })

        // Send email notification if SMTP is configured
        if (Deno.env.get('SMTP_HOST')) {
          try {
            await sendEmailNotification(
              loan.borrower.email,
              'Payment Reminder',
              reminderMessage
            )
          } catch (emailError) {
            console.error('Failed to send email notification:', emailError)
          }
        }
      }
    }

    // Insert notifications in batch
    if (notifications.length > 0) {
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notifications)

      if (notificationError) {
        console.error('Failed to create notifications:', notificationError)
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Payment reminders sent successfully',
        notificationsCreated: notifications.length,
        loansProcessed: upcomingLoans?.length || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error sending payment reminders:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function sendEmailNotification(to: string, subject: string, message: string) {
  const smtpHost = Deno.env.get('SMTP_HOST')
  const smtpPort = Deno.env.get('SMTP_PORT')
  const smtpUser = Deno.env.get('SMTP_USER')
  const smtpPass = Deno.env.get('SMTP_PASS')

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    throw new Error('SMTP configuration not found')
  }

  // Simple SMTP email sending (you might want to use a proper email library)
  const emailData = {
    from: smtpUser,
    to,
    subject,
    text: message,
    html: `<p>${message}</p>`,
  }

  // This is a simplified example - in production, use a proper email service
  console.log('Email notification would be sent:', emailData)
}