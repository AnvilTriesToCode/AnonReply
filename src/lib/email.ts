import { Resend } from 'resend';

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
}

const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@yourdomain.com';

// Primary Admin Account Owner email (account profile, unrouted)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';

// Dedicated destination where all incoming user request notifications are routed
const NOTIFICATION_ROUTING_EMAIL =
  process.env.NOTIFICATION_ROUTING_EMAIL ||
  process.env.ADMIN_NOTIFICATION_EMAIL ||
  'notifications@example.com';

const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

/**
 * ----------------------------------------------------
 * ADMIN REQUEST ALERTS (Routed to notifications@example.com)
 * ----------------------------------------------------
 */

export async function sendAdminNewConversationAlert(
  conversationTitle: string,
  requestDescription: string,
  conversationId: string
) {
  try {
    const resend = getResendClient();
    const excerpt =
      requestDescription.length > 500
        ? `${requestDescription.slice(0, 500)}...`
        : requestDescription;

    if (!resend) {
      console.log(
        `[Email Simulation -> Alert Route (${NOTIFICATION_ROUTING_EMAIL})]: New conversation request submitted: "${conversationTitle}"\nDescription: "${excerpt}"`
      );
      return;
    }

    await resend.emails.send({
      from: EMAIL_FROM,
      to: NOTIFICATION_ROUTING_EMAIL,
      subject: `🚨 [AnonReply Request] New User Help Request: "${conversationTitle}"`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 16px;">
            <span style="background: #eff6ff; color: #1d4ed8; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em;">New Help Request</span>
            <h2 style="color: #0f172a; margin: 12px 0 4px 0; font-size: 20px;">🚨 New User Request Submitted</h2>
            <p style="color: #64748b; font-size: 13px; margin: 0;">Routed to: <strong>${NOTIFICATION_ROUTING_EMAIL}</strong></p>
          </div>

          <p style="font-size: 13px; color: #475569; font-weight: 600; text-transform: uppercase; margin: 0 0 6px 0; letter-spacing: 0.03em;">Request Title</p>
          <div style="font-size: 16px; font-weight: 600; color: #0f172a; background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px;">
            ${conversationTitle}
          </div>

          <p style="font-size: 13px; color: #475569; font-weight: 600; text-transform: uppercase; margin: 0 0 6px 0; letter-spacing: 0.03em;">Request Description</p>
          <div style="font-size: 14px; line-height: 1.6; color: #334155; background: #f8fafc; border-left: 4px solid #2563eb; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px; white-space: pre-wrap;">${excerpt}</div>

          <div style="margin: 24px 0;">
            <a href="${APP_URL}/admin" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
              Review Request in Admin Dashboard &rarr;
            </a>
          </div>

          <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px; font-size: 12px; color: #94a3b8;">
            <p style="margin: 0 0 4px 0;">🔒 <strong>Privacy policy:</strong> This conversation auto-deletes permanently in 72 hours via MongoDB TTL.</p>
            <p style="margin: 0;">Replying identity for all moderators is strictly umbrella <strong>SupportTeam</strong>.</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send admin conversation alert:', error);
  }
}

export async function sendAdminNewLiveChatAlert(
  topic: string,
  requestDescription: string,
  chatId: string
) {
  try {
    const resend = getResendClient();
    const excerpt =
      requestDescription.length > 500
        ? `${requestDescription.slice(0, 500)}...`
        : requestDescription;

    if (!resend) {
      console.log(
        `[Email Simulation -> Alert Route (${NOTIFICATION_ROUTING_EMAIL})]: New live chat request: "${topic}"\nDescription: "${excerpt}"`
      );
      return;
    }

    await resend.emails.send({
      from: EMAIL_FROM,
      to: NOTIFICATION_ROUTING_EMAIL,
      subject: `⚡ [AnonReply LIVE] User Requesting Live Chat: "${topic}"`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="border-bottom: 2px solid #dc2626; padding-bottom: 12px; margin-bottom: 16px;">
            <span style="background: #fef2f2; color: #dc2626; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em;">Live Room Waiting</span>
            <h2 style="color: #0f172a; margin: 12px 0 4px 0; font-size: 20px;">⚡ User Requesting Real-Time Chat</h2>
            <p style="color: #64748b; font-size: 13px; margin: 0;">Routed to: <strong>${NOTIFICATION_ROUTING_EMAIL}</strong></p>
          </div>

          <p style="font-size: 13px; color: #475569; font-weight: 600; text-transform: uppercase; margin: 0 0 6px 0; letter-spacing: 0.03em;">Topic</p>
          <div style="font-size: 16px; font-weight: 600; color: #991b1b; background: #fef2f2; border: 1px solid #fee2e2; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px;">
            ${topic}
          </div>

          <p style="font-size: 13px; color: #475569; font-weight: 600; text-transform: uppercase; margin: 0 0 6px 0; letter-spacing: 0.03em;">User Note / Initial Message</p>
          <div style="font-size: 14px; line-height: 1.6; color: #334155; background: #f8fafc; border-left: 4px solid #dc2626; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px; white-space: pre-wrap;">${excerpt}</div>

          <div style="margin: 24px 0;">
            <a href="${APP_URL}/admin" style="display: inline-block; background: #16a34a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
              Accept & Start Chat in Admin Dashboard &rarr;
            </a>
          </div>

          <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px; font-size: 12px; color: #94a3b8;">
            <p style="margin: 0;">⚡ User is currently waiting in the real-time queue.</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send admin live chat alert:', error);
  }
}

export async function sendAdminUserReplyAlert(
  conversationTitle: string,
  replyDescription: string,
  conversationId: string
) {
  try {
    const resend = getResendClient();
    const excerpt =
      replyDescription.length > 500
        ? `${replyDescription.slice(0, 500)}...`
        : replyDescription;

    if (!resend) {
      console.log(
        `[Email Simulation -> Alert Route (${NOTIFICATION_ROUTING_EMAIL})]: User reply on "${conversationTitle}": "${excerpt}"`
      );
      return;
    }

    await resend.emails.send({
      from: EMAIL_FROM,
      to: NOTIFICATION_ROUTING_EMAIL,
      subject: `💬 [AnonReply Follow-up] User Message in: "${conversationTitle}"`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 16px;">
            <span style="background: #eff6ff; color: #1d4ed8; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase;">User Follow-up</span>
            <h2 style="color: #0f172a; margin: 12px 0 4px 0; font-size: 20px;">💬 User Sent a Follow-up Message</h2>
            <p style="color: #64748b; font-size: 13px; margin: 0;">Routed to: <strong>${NOTIFICATION_ROUTING_EMAIL}</strong></p>
          </div>

          <p style="font-size: 13px; color: #475569; font-weight: 600; text-transform: uppercase; margin: 0 0 6px 0;">Conversation</p>
          <div style="font-size: 15px; font-weight: 600; color: #0f172a; margin-bottom: 16px;">
            ${conversationTitle}
          </div>

          <p style="font-size: 13px; color: #475569; font-weight: 600; text-transform: uppercase; margin: 0 0 6px 0;">User Message Excerpt</p>
          <div style="font-size: 14px; line-height: 1.6; color: #334155; background: #f8fafc; border-left: 4px solid #2563eb; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px; white-space: pre-wrap;">${excerpt}</div>

          <div style="margin: 24px 0;">
            <a href="${APP_URL}/conversations/${conversationId}" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
              View & Respond &rarr;
            </a>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send admin user reply alert:', error);
  }
}

/**
 * ----------------------------------------------------
 * USER NOTIFICATIONS (If they provided an email)
 * ----------------------------------------------------
 */

export async function sendConversationApprovedEmail(
  to: string,
  conversationTitle: string,
  conversationId: string
) {
  try {
    const resend = getResendClient();
    if (!resend) {
      console.log(`[Email Simulation -> User (${to})]: Conversation approved: "${conversationTitle}"`);
      return;
    }

    await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `Your conversation "${conversationTitle}" has been approved`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">✅ Conversation Approved</h2>
          <p>Your conversation "<strong>${conversationTitle}</strong>" has been reviewed and approved by SupportTeam.</p>
          <p>You can view and reply to it inside your dashboard:</p>
          <div style="margin: 20px 0;">
            <a href="${APP_URL}/conversations/${conversationId}" style="background: #2563eb; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 6px;">
              View Conversation
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            Remember: All conversations auto-delete after 72 hours for privacy.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send approval email:', error);
  }
}

export async function sendConversationDeniedEmail(
  to: string,
  conversationTitle: string,
  reason?: string
) {
  try {
    const resend = getResendClient();
    if (!resend) {
      console.log(`[Email Simulation -> User (${to})]: Conversation denied: "${conversationTitle}"`);
      return;
    }

    await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `Your conversation "${conversationTitle}" was not approved`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">❌ Conversation Not Approved</h2>
          <p>Your conversation "<strong>${conversationTitle}</strong>" was reviewed and was not approved.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          <p>You may submit a new conversation following community guidelines.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send denial email:', error);
  }
}

export async function sendNewReplyEmail(
  to: string,
  conversationTitle: string,
  conversationId: string
) {
  try {
    const resend = getResendClient();
    if (!resend) {
      console.log(`[Email Simulation -> User (${to})]: New reply from SupportTeam on "${conversationTitle}"`);
      return;
    }

    await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `SupportTeam response on "${conversationTitle}"`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">🛡️ New Response from SupportTeam</h2>
          <p>SupportTeam has replied to your conversation "<strong>${conversationTitle}</strong>".</p>
          <div style="margin: 20px 0;">
            <a href="${APP_URL}/conversations/${conversationId}" style="background: #2563eb; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 6px;">
              Read Response & Reply
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            Remember: All conversations auto-delete after 72 hours for privacy.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send reply email:', error);
  }
}

export async function sendLiveChatAcceptedEmail(
  to: string,
  topic: string,
  chatId: string
) {
  try {
    const resend = getResendClient();
    if (!resend) {
      console.log(`[Email Simulation -> User (${to})]: Live chat accepted on "${topic}"`);
      return;
    }

    await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `✅ Live Chat Accepted by SupportTeam: "${topic}"`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">⚡ Your Live Chat is Now Active!</h2>
          <p>SupportTeam has accepted your live chat request regarding: <strong>${topic}</strong>.</p>
          <p>The administrator is in the chat room waiting for you. Click below to join:</p>
          <div style="margin: 20px 0;">
            <a href="${APP_URL}/live/${chatId}" style="background: #16a34a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Join Live Chat Now
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            Your live chat session will remain active for 3 days before auto-deleting.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send live chat accepted email:', error);
  }
}

export async function sendLiveChatMessageEmail(
  to: string,
  topic: string,
  chatId: string,
  messageText: string
) {
  try {
    const resend = getResendClient();
    if (!resend) {
      console.log(`[Email Simulation -> User (${to})]: Live message from SupportTeam: "${messageText.slice(0, 40)}"`);
      return;
    }

    const preview = messageText.length > 100 ? `${messageText.slice(0, 100)}...` : messageText;

    await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `💬 New Live Chat Message from SupportTeam`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">💬 New Live Chat Message</h2>
          <p>SupportTeam sent you a message in: <strong>${topic}</strong></p>
          <div style="background: #f3f4f6; padding: 14px; border-left: 4px solid #2563eb; margin: 16px 0; font-style: italic;">
            "${preview}"
          </div>
          <div style="margin: 20px 0;">
            <a href="${APP_URL}/live/${chatId}" style="background: #2563eb; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 6px;">
              Open Live Chat
            </a>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send live chat message email:', error);
  }
}
