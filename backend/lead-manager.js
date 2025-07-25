import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from project root
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

console.log('Lead Manager: Environment file loaded from:', envPath);

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  VAPI_API_KEY,
  VAPI_ASSISTANT_ID,
  VAPI_PHONE_NUMBER_ID
} = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: Missing required Supabase configuration');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Configuration
const MAX_CONCURRENT_CALLS = 4;
const CALL_RETRY_ATTEMPTS = 3;
const CALL_RETRY_DELAY = 5000; // 5 seconds

class LeadManager {
  constructor() {
    this.activeCalls = new Map(); // Track active calls
    this.callQueue = []; // Queue for pending calls
    this.isProcessing = false;
  }

  /**
   * Get leads from Supabase for a specific user - includes to_call, follow_up (≤2), callback_requested, call_failed
   */
  async getLeadsForCalling(limit = 20, userId = null) {
    try {
      let query = supabase
        .from('leads')
        .select('*')
        .or(`status.eq.to_call,status.eq.callback_requested,status.eq.call_failed,and(status.eq.follow_up,follow_up_count.lte.2)`)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(limit);
      
      // Add user filter if userId is provided
      if (userId) {
        query = query.eq('user_id', userId);
        console.log(`👤 Filtering leads for user: ${userId}`);
      }

      const { data: leads, error } = await query;

      if (error) {
        console.error('Error fetching leads:', error);
        return [];
      }

      console.log(`📋 Found ${leads?.length || 0} leads ready for calling${userId ? ' for user ' + userId : ''}`);
      console.log(`📊 Status breakdown:`, {
        to_call: leads?.filter(l => l.status === 'to_call').length || 0,
        follow_up: leads?.filter(l => l.status === 'follow_up').length || 0,
        callback_requested: leads?.filter(l => l.status === 'callback_requested').length || 0,
        call_failed: leads?.filter(l => l.status === 'call_failed').length || 0
      });
      return leads || [];
    } catch (error) {
      console.error('Error in getLeadsForCalling:', error);
      return [];
    }
  }

  /**
   * Create VAPI call for a lead
   */
  async createVapiCall(lead) {
    const callData = {
      assistantId: VAPI_ASSISTANT_ID,
      phoneNumberId: VAPI_PHONE_NUMBER_ID,
      customer: {
        number: this.formatPhoneNumber(lead.phone_number),
        name: lead.contact_person
      },
      assistantOverrides: {
        variableValues: {
          propertyName: lead.property_name,
          location: lead.location,
          price: `${lead.price_crores} crores`,
          bedrooms: lead.bedrooms.toString(),
          bathrooms: lead.bathrooms.toString(),
          area: `${lead.area_sqft} sq ft`,
          propertyType: lead.property_type,
          builder: lead.builder,
          possessionStatus: lead.possession_status,
          amenities: lead.amenities,
          contactPerson: lead.contact_person,
          leadNotes: lead.notes || 'No additional notes'
        }
      }
    };

    try {
      const response = await fetch('https://api.vapi.ai/call', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(callData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`VAPI API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log(`📞 VAPI call created for ${lead.contact_person}: ${result.id}`);
      return result;
    } catch (error) {
      console.error(`Error creating VAPI call for lead ${lead.id}:`, error);
      throw error;
    }
  }

  /**
   * Format phone number to E.164 format
   */
  formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return null;
    
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present (assuming India +91)
    if (cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }
    
    // Add + prefix
    return '+' + cleaned;
  }

  /**
   * Update lead status in Supabase
   */
  async updateLeadStatus(leadId, status, callId = null, additionalData = {}) {
    try {
      const updateData = {
        status,
        updated_at: new Date().toISOString(),
        ...additionalData
      };

      if (callId) {
        updateData.last_call_id = callId;
        updateData.last_contacted = new Date().toISOString();
      }

      const { error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', leadId);

      if (error) {
        console.error(`Error updating lead ${leadId}:`, error);
        return false;
      }

      console.log(`✅ Updated lead ${leadId} status to: ${status}`);
      return true;
    } catch (error) {
      console.error(`Error in updateLeadStatus for lead ${leadId}:`, error);
      return false;
    }
  }

  /**
   * Process a single lead call with retry logic
   */
  async processLeadCall(lead, retryCount = 0) {
    try {
      console.log(`🚀 Processing call for lead: ${lead.contact_person} (${lead.phone_number})`);
      
      // Update lead status to calling
      await this.updateLeadStatus(lead.id, 'calling', null, {
        call_scheduled_at: new Date().toISOString()
      });

      // Create VAPI call
      const callResult = await this.createVapiCall(lead);
      
      // Store call information
      this.activeCalls.set(callResult.id, {
        leadId: lead.id,
        leadData: lead,
        callId: callResult.id,
        startTime: new Date(),
        status: 'active'
      });

      // Update lead with call ID
      await this.updateLeadStatus(lead.id, 'in_call', callResult.id);

      return {
        success: true,
        callId: callResult.id,
        leadId: lead.id
      };

    } catch (error) {
      console.error(`❌ Error processing call for lead ${lead.id}:`, error);
      
      // Retry logic
      if (retryCount < CALL_RETRY_ATTEMPTS) {
        console.log(`🔄 Retrying call for lead ${lead.id} (attempt ${retryCount + 1}/${CALL_RETRY_ATTEMPTS})`);
        await new Promise(resolve => setTimeout(resolve, CALL_RETRY_DELAY));
        return this.processLeadCall(lead, retryCount + 1);
      }

      // Mark lead as failed after all retries
      await this.updateLeadStatus(lead.id, 'call_failed', null, {
        call_error: error.message,
        call_failed_at: new Date().toISOString()
      });

      return {
        success: false,
        error: error.message,
        leadId: lead.id
      };
    }
  }

  /**
   * Process multiple leads with concurrency control
   */
  async processBatchCalls(leads) {
    if (!leads || leads.length === 0) {
      console.log('📭 No leads to process');
      return { success: 0, failed: 0, results: [] };
    }

    console.log(`📊 Starting batch processing of ${leads.length} leads with max ${MAX_CONCURRENT_CALLS} concurrent calls`);
    
    const results = [];
    let successCount = 0;
    let failedCount = 0;

    // Process leads in batches of MAX_CONCURRENT_CALLS
    for (let i = 0; i < leads.length; i += MAX_CONCURRENT_CALLS) {
      const batch = leads.slice(i, i + MAX_CONCURRENT_CALLS);
      console.log(`🔄 Processing batch ${Math.floor(i / MAX_CONCURRENT_CALLS) + 1}: ${batch.length} leads`);

      // Process batch concurrently
      const batchPromises = batch.map(lead => this.processLeadCall(lead));
      const batchResults = await Promise.allSettled(batchPromises);

      // Process results
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          if (result.value.success) {
            successCount++;
          } else {
            failedCount++;
          }
          results.push(result.value);
        } else {
          failedCount++;
          results.push({
            success: false,
            error: result.reason.message,
            leadId: batch[index].id
          });
        }
      });

      // Add delay between batches to avoid rate limiting
      if (i + MAX_CONCURRENT_CALLS < leads.length) {
        console.log('⏳ Waiting 2 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`✅ Batch processing complete: ${successCount} successful, ${failedCount} failed`);
    return {
      success: successCount,
      failed: failedCount,
      results
    };
  }

  /**
   * Determine post-call status based on call results
   */
  determinePostCallStatus(call, transcript, summary, endedReason, currentLead) {
    const transcriptLower = transcript.toLowerCase();
    const summaryLower = summary.toLowerCase();
    const currentFollowUpCount = currentLead.follow_up_count || 0;

    // 1. Call Successful & Lead Interested
    if (transcriptLower.includes('interested') || 
        transcriptLower.includes('yes, i am') ||
        summaryLower.includes('qualified') ||
        summaryLower.includes('interested')) {
      return {
        status: 'qualified',
        result: 'Lead showed interest and was qualified',
        qualificationScore: 85,
        followUpCount: currentFollowUpCount,
        callbackScheduledAt: null
      };
    }

    // 2. Call Successful & Lead Not Interested
    if (transcriptLower.includes('not interested') ||
        transcriptLower.includes('no thank') ||
        transcriptLower.includes('don\'t want') ||
        endedReason === 'customer-ended-call' ||
        summaryLower.includes('not interested')) {
      return {
        status: 'not_interested',
        result: 'Lead explicitly declined interest',
        qualificationScore: 10,
        followUpCount: currentFollowUpCount,
        callbackScheduledAt: null
      };
    }

    // 3. Call Successful & Lead Requests Callback
    if (transcriptLower.includes('call back') ||
        transcriptLower.includes('call later') ||
        transcriptLower.includes('busy now') ||
        summaryLower.includes('callback')) {
      return {
        status: 'callback_requested',
        result: 'Lead requested to be called back later',
        qualificationScore: 50,
        followUpCount: currentFollowUpCount,
        callbackScheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours later
      };
    }

    // 4. Call Unsuccessful (No Answer/Didn't Connect)
    if (endedReason === 'no-answer' ||
        endedReason === 'voicemail' ||
        endedReason === 'busy' ||
        transcript.length < 50) { // Very short transcript indicates no real conversation
      
      const newFollowUpCount = currentFollowUpCount + 1;
      
      if (newFollowUpCount >= 3) {
        return {
          status: 'unresponsive',
          result: 'No response after 3 follow-up attempts',
          qualificationScore: 0,
          followUpCount: newFollowUpCount,
          callbackScheduledAt: null
        };
      } else {
        return {
          status: 'follow_up',
          result: `No answer - attempt ${newFollowUpCount}`,
          qualificationScore: 30,
          followUpCount: newFollowUpCount,
          callbackScheduledAt: null
        };
      }
    }

    // 5. AI Needs Human Help
    if (transcriptLower.includes('transfer') ||
        transcriptLower.includes('speak to human') ||
        summaryLower.includes('human needed') ||
        endedReason === 'assistant-request-failed') {
      return {
        status: 'human_input_needed',
        result: 'AI assistant requested human intervention',
        qualificationScore: 40,
        followUpCount: currentFollowUpCount,
        callbackScheduledAt: null
      };
    }

    // 6. Technical Call Failure
    if (endedReason === 'pipeline-error-openai-voice-failed' ||
        endedReason === 'assistant-ended-call' ||
        call.status === 'failed') {
      return {
        status: 'call_failed',
        result: 'Technical failure during call',
        qualificationScore: 0,
        followUpCount: currentFollowUpCount,
        callbackScheduledAt: null
      };
    }

    // 7. Default - Requires Manual Follow-up
    return {
      status: 'human_follow_up',
      result: 'Call completed but requires manual review',
      qualificationScore: 30,
      followUpCount: currentFollowUpCount,
      callbackScheduledAt: null
    };
  }

  /**
   * Handle call completion webhook with new status logic
   */
  async handleCallCompletion(callData) {
    const callId = callData.message?.call?.id || callData.callId;
    
    if (!callId) {
      console.error('❌ No call ID found in webhook data');
      return false;
    }

    const activeCall = this.activeCalls.get(callId);
    if (!activeCall) {
      console.error(`❌ No active call found for ID: ${callId}`);
      return false;
    }

    try {
      console.log(`📞 Processing call completion for lead ${activeCall.leadId}`);

      // Get current lead data
      const { data: currentLead, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', activeCall.leadId)
        .single();

      if (leadError || !currentLead) {
        console.error('❌ Error fetching current lead data:', leadError);
        return false;
      }

      // Extract call data
      const call = callData.message?.call || callData;
      const transcript = call.transcript || '';
      const summary = call.summary || '';
      const endedReason = call.endedReason || call.ended_reason || 'unknown';
      const analysis = call.analysis || {};

      // Determine new status and follow-up count based on call result
      const statusUpdate = this.determinePostCallStatus(call, transcript, summary, endedReason, currentLead);

      console.log(`📊 Post-call status update:`, statusUpdate);

      // Update lead in database
      const { error } = await supabase
        .from('leads')
        .update({
          status: statusUpdate.status,
          follow_up_count: statusUpdate.followUpCount,
          last_call_id: callId,
          last_contacted: new Date().toISOString(),
          last_call_result: statusUpdate.result,
          qualification_score: statusUpdate.qualificationScore,
          last_call_summary: summary,
          last_call_transcript: transcript.substring(0, 2000),
          call_completed_at: new Date().toISOString(),
          callback_scheduled_at: statusUpdate.callbackScheduledAt
        })
        .eq('id', activeCall.leadId);

      if (error) {
        console.error('❌ Error updating lead after call:', error);
        return false;
      }

      // Store call record
      await this.storeCallRecord({
        call_id: callId,
        lead_id: activeCall.leadId,
        status: call.status,
        ended_reason: endedReason,
        transcript: transcript,
        summary: summary,
        duration: call.duration,
        cost: call.cost,
        recording_url: call.recordingUrl,
        lead_status: statusUpdate.status,
        qualification_score: statusUpdate.qualificationScore
      });

      // Remove from active calls
      this.activeCalls.delete(callId);

      console.log(`✅ Call completion processed: Lead ${activeCall.leadId} -> ${statusUpdate.status}`);
      return true;

    } catch (error) {
      console.error(`❌ Error processing call completion for ${callId}:`, error);
      return false;
    }
  }

  /**
   * Analyze call results to determine lead status
   */
  analyzeCallResults(transcript, summary, endedReason) {
    const lowerTranscript = transcript.toLowerCase();
    const lowerSummary = summary.toLowerCase();
    
    // Check for positive indicators
    const positiveKeywords = ['interested', 'yes', 'schedule', 'visit', 'meeting', 'appointment'];
    const negativeKeywords = ['not interested', 'no', 'busy', 'don\'t call', 'remove'];
    
    const hasPositive = positiveKeywords.some(keyword => 
      lowerTranscript.includes(keyword) || lowerSummary.includes(keyword)
    );
    
    const hasNegative = negativeKeywords.some(keyword => 
      lowerTranscript.includes(keyword) || lowerSummary.includes(keyword)
    );

    // Determine status based on analysis
    if (endedReason === 'customer-ended-call' && hasNegative) {
      return 'not_interested';
    } else if (hasPositive) {
      return 'qualified';
    } else if (endedReason === 'no-answer' || endedReason === 'voicemail') {
      return 'no_answer';
    } else if (hasNegative) {
      return 'not_interested';
    } else {
      return 'needs_review';
    }
  }

  /**
   * Get active call statistics
   */
  getActiveCallStats() {
    return {
      activeCalls: this.activeCalls.size,
      queuedCalls: this.callQueue.length,
      maxConcurrent: MAX_CONCURRENT_CALLS,
      isProcessing: this.isProcessing
    };
  }

  /**
   * Start automated calling process for a specific user or all users
   */
  async startAutomatedCalling(leadLimit = 20, userId = null) {
    if (this.isProcessing) {
      console.log('⚠️ Automated calling already in progress');
      return { error: 'Already processing calls' };
    }

    this.isProcessing = true;
    const userInfo = userId ? ` for user ${userId}` : ' (all users)';
    console.log(`🚀 Starting automated calling process${userInfo}...`);

    try {
      // Get leads ready for calling (filtered by user if specified)
      const leads = await this.getLeadsForCalling(leadLimit, userId);
      
      if (leads.length === 0) {
        console.log('📝 No leads available for calling');
        return { message: 'No leads available for calling', processed: 0 };
      }

      console.log(`📋 Selected ${leads.length} leads for batch processing`);
      
      // Mark all selected leads as 'calling' (part of current batch)
      const leadIds = leads.map(lead => lead.id);
      const { error: updateError } = await supabase
        .from('leads')
        .update({ 
          status: 'calling',
          call_scheduled_at: new Date().toISOString()
        })
        .in('id', leadIds);

      if (updateError) {
        console.error('❌ Error marking leads as calling:', updateError);
        throw new Error('Failed to mark leads as calling');
      }

      console.log(`✅ Marked ${leadIds.length} leads as 'calling' status`);

      // Process batch calls
      const results = await this.processBatchCalls(leads);
      
      return {
        message: 'Automated calling completed',
        ...results,
        totalLeads: leads.length,
        leadsToCall: leadIds.length,
        maxConcurrent: this.maxConcurrentCalls
      };

    } catch (error) {
      console.error('❌ Error in automated calling:', error);
      return { error: error.message };
    } finally {
      this.isProcessing = false;
    }
  }
}

// Export singleton instance
export default new LeadManager();
