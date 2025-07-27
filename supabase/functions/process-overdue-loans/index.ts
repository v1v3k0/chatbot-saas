import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    // Get overdue loans
    const { data: overdueLoans, error: loansError } = await supabase
      .from('loan_requests')
      .select('*')
      .lt('due_date', new Date().toISOString())
      .in('status', ['fully_funded', 'partially_funded'])

    if (loansError) {
      throw new Error(`Failed to fetch overdue loans: ${loansError.message}`)
    }

    const updatedLoans = []
    const notifications = []

    for (const loan of overdueLoans || []) {
      // Update loan status to overdue
      const { error: updateError } = await supabase
        .from('loan_requests')
        .update({
          status: 'overdue',
          updated_at: new Date().toISOString(),
        })
        .eq('id', loan.id)

      if (updateError) {
        console.error(`Failed to update loan ${loan.id}:`, updateError)
        continue
      }

      updatedLoans.push(loan.id)

      // Create notification for borrower
      notifications.push({
        user_id: loan.borrower_id,
        title: 'Loan Overdue',
        message: `Your loan "${loan.title}" is now overdue. Please make a payment as soon as possible.`,
        type: 'warning',
        action_url: `/loans/${loan.id}`,
      })

      // Create notifications for lenders
      const { data: fundings } = await supabase
        .from('loan_fundings')
        .select('lender_id')
        .eq('loan_request_id', loan.id)

      if (fundings) {
        for (const funding of fundings) {
          notifications.push({
            user_id: funding.lender_id,
            title: 'Investment Overdue',
            message: `A loan you funded "${loan.title}" is now overdue.`,
            type: 'warning',
            action_url: `/investments/${loan.id}`,
          })
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
        message: 'Overdue loans processed successfully',
        updatedLoans: updatedLoans.length,
        notificationsCreated: notifications.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error processing overdue loans:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})