const db = require('../config/db');
const axios = require('axios');

// ============== CREATE ATS INTEGRATION ==============
const createATSIntegration = async (req, res) => {
    const { provider, apiKey, webhookUrl } = req.body;

    if (!['workday', 'greenhouse', 'lever', 'breezy', 'custom'].includes(provider)) {
        return res.status(400).json({ error: 'Invalid ATS provider' });
    }

    try {
        const result = await db.query(
            `INSERT INTO ats_integrations (provider, api_key, webhook_url, is_active) 
             VALUES ($1, $2, $3, true) RETURNING id, provider, webhook_url, created_at`,
            [provider, apiKey, webhookUrl]
        );

        res.json({
            message: 'ATS integration created',
            integration: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error creating ATS integration' });
    }
};

// ============== GET ATS INTEGRATIONS ==============
const getATSIntegrations = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, provider, is_active, last_sync FROM ats_integrations'
        );

        res.json({
            message: 'ATS integrations retrieved',
            integrations: result.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching ATS integrations' });
    }
};

// ============== SYNC WITH ATS ==============
const syncWithATS = async (req, res) => {
    const { integrationId } = req.params;

    try {
        const integrationResult = await db.query(
            'SELECT * FROM ats_integrations WHERE id = $1 AND is_active = true',
            [integrationId]
        );

        if (integrationResult.rows.length === 0) {
            return res.status(404).json({ error: 'Integration not found' });
        }

        const integration = integrationResult.rows[0];

        // Get pending events
        const eventsResult = await db.query(
            `SELECT * FROM webhook_events WHERE integration_id = $1 AND status = 'pending' LIMIT 50`,
            [integrationId]
        );

        let successCount = 0;
        let failureCount = 0;

        for (const event of eventsResult.rows) {
            try {
                // Send webhook
                await axios.post(integration.webhook_url, event.payload, {
                    headers: { 'Authorization': `Bearer ${integration.api_key}` },
                    timeout: 5000
                });

                // Mark as sent
                await db.query(
                    `UPDATE webhook_events SET status = 'sent', sent_at = NOW() WHERE id = $1`,
                    [event.id]
                );
                successCount++;
            } catch (err) {
                // Retry logic
                const retryCount = event.retry_count + 1;
                if (retryCount < 3) {
                    await db.query(
                        `UPDATE webhook_events SET retry_count = $1 WHERE id = $2`,
                        [retryCount, event.id]
                    );
                } else {
                    await db.query(
                        `UPDATE webhook_events SET status = 'failed' WHERE id = $1`,
                        [event.id]
                    );
                }
                failureCount++;
            }
        }

        // Update last sync
        await db.query(
            `UPDATE ats_integrations SET last_sync = NOW() WHERE id = $1`,
            [integrationId]
        );

        res.json({
            message: 'Sync completed',
            successCount,
            failureCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error syncing with ATS' });
    }
};

// ============== QUEUE WEBHOOK EVENT ==============
const queueWebhookEvent = async (req, res) => {
    const { integrationId, eventType, payload } = req.body;

    if (!integrationId || !eventType || !payload) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const result = await db.query(
            `INSERT INTO webhook_events (integration_id, event_type, payload, status) 
             VALUES ($1, $2, $3, 'pending') RETURNING *`,
            [integrationId, eventType, JSON.stringify(payload)]
        );

        res.json({
            message: 'Webhook event queued',
            event: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error queuing webhook event' });
    }
};

// ============== SETUP SSO ==============
const setupSSO = async (req, res) => {
    const { provider, providerUrl, clientId, clientSecret } = req.body;

    if (!['okta', 'azure_ad', 'google', 'saml'].includes(provider)) {
        return res.status(400).json({ error: 'Invalid SSO provider' });
    }

    try {
        const result = await db.query(
            `INSERT INTO sso_config (provider, provider_url, client_id, client_secret, is_active) 
             VALUES ($1, $2, $3, $4, true) 
             ON CONFLICT (provider) DO UPDATE SET provider_url = $2, client_id = $3, client_secret = $4, is_active = true
             RETURNING id, provider, is_active`,
            [provider, providerUrl, clientId, clientSecret]
        );

        res.json({
            message: 'SSO configuration saved',
            config: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error setting up SSO' });
    }
};

// ============== GET SSO CONFIGURATION ==============
const getSSOConfig = async (req, res) => {
    const { provider } = req.params;

    try {
        const result = await db.query(
            `SELECT id, provider, is_active FROM sso_config WHERE provider = $1 AND is_active = true`,
            [provider]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'SSO configuration not found' });
        }

        res.json({
            message: 'SSO configuration retrieved',
            config: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching SSO configuration' });
    }
};

// ============== SEND SLACK NOTIFICATION ==============
const sendSlackNotification = async (req, res) => {
    const { slackWebhookUrl, message, metadata } = req.body;

    if (!slackWebhookUrl || !message) {
        return res.status(400).json({ error: 'Slack webhook URL and message required' });
    }

    try {
        const payload = {
            text: message,
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: message
                    }
                }
            ]
        };

        if (metadata) {
            payload.blocks.push({
                type: 'section',
                fields: Object.entries(metadata).map(([key, value]) => ({
                    type: 'mrkdwn',
                    text: `*${key}:* ${value}`
                }))
            });
        }

        await axios.post(slackWebhookUrl, payload);

        res.json({
            message: 'Slack notification sent successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error sending Slack notification' });
    }
};

// ============== CONFIGURE SLACK INTEGRATION ==============
const configureSlackIntegration = async (req, res) => {
    const userId = req.user.userId;
    const { slackWebhookUrl, slackChannels } = req.body;

    try {
        // Save integration config (would typically go to a table)
        const result = await db.query(
            `INSERT INTO audit_logs (user_id, action, details) 
             VALUES ($1, 'SLACK_CONFIGURED', $2)`,
            [userId, JSON.stringify({ slackChannels })]
        );

        res.json({
            message: 'Slack integration configured',
            status: 'configured'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error configuring Slack integration' });
    }
};

// ============== WEBHOOK RECEIVER (For incoming webhooks) ==============
const receiveWebhook = async (req, res) => {
    const { integrationId } = req.params;
    const payload = req.body;

    try {
        // Store incoming webhook
        await db.query(
            `INSERT INTO audit_logs (action, details) 
             VALUES ('WEBHOOK_RECEIVED', $1)`,
            [JSON.stringify({ integrationId, payload })]
        );

        // Process based on event type
        if (payload.eventType === 'candidate_submitted') {
            // Create submission record, etc.
            console.log('Candidate submitted:', payload.candidateId);
        }

        res.json({ message: 'Webhook received' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error processing webhook' });
    }
};

module.exports = {
    createATSIntegration,
    getATSIntegrations,
    syncWithATS,
    queueWebhookEvent,
    setupSSO,
    getSSOConfig,
    sendSlackNotification,
    configureSlackIntegration,
    receiveWebhook
};
