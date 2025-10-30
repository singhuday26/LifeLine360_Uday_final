# LifeLine360 Alert System

## 🚨 Alert System Overview

The LifeLine360 backend now includes a comprehensive alert system that monitors sensor data, detects threshold violations, and sends email notifications for critical events.

## ✨ Features

- **Real-time Alert Detection**: Monitors sensor data for threshold violations
- **Multi-level Severity**: Low, Medium, High, and Critical alert levels
- **Email Notifications**: Automated email alerts with detailed information
- **Alert Management**: API endpoints for viewing, acknowledging, and resolving alerts
- **Sample Data Generation**: Built-in sample data for testing without MQTT connection
- **Database Tracking**: All alerts stored in MongoDB with full history

## 🔧 Configuration

### Environment Variables (.env)

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=LifeLine360 Alerts <your-email@gmail.com>

# Alert Recipients (comma-separated)
ALERT_RECIPIENTS=admin@lifeline360.com,emergency@lifeline360.com

# Sample Data (set to true to use sample data instead of MQTT)
USE_SAMPLE_DATA=true
SAMPLE_DATA_INTERVAL=30000  # milliseconds
```

### Alert Thresholds

The system monitors these sensor types with predefined thresholds:

| Sensor Type | Low | Medium | High | Critical | Unit |
|-------------|-----|--------|------|----------|------|
| Temperature | 35°C | - | 40°C | 50°C | °C |
| Rainfall | 25mm | - | 50mm | 100mm | mm |
| Seismic | 2.0 | - | 3.0 | 5.0 | magnitude |
| Smoke | 30% | - | 50% | 80% | % |
| Flood | 2.0m | - | 3.0m | 5.0m | m |
| Air Quality | 100 | - | 150 | 300 | PM2.5 |

## 📡 API Endpoints

### Alert Management

#### Get Alerts
```http
GET /api/alerts?limit=50&status=active&severity=critical
```

**Query Parameters:**
- `limit`: Number of alerts to return (default: 50)
- `status`: Filter by status (`active`, `acknowledged`, `resolved`)
- `severity`: Filter by severity (`low`, `medium`, `high`, `critical`)

#### Acknowledge Alert
```http
PUT /api/alerts/:id/acknowledge
Content-Type: application/json

{
  "acknowledgedBy": "operator_name"
}
```

#### Resolve Alert
```http
PUT /api/alerts/:id/resolve
```

#### Get Alert Statistics
```http
GET /api/alerts/stats
```

Returns counts for total, active, acknowledged, resolved alerts and severity breakdowns.

#### Test Email Alert
```http
POST /api/test-alert-email
```

Sends a test alert email to configured recipients.

## 📊 Sample Data Sensors

When `USE_SAMPLE_DATA=true`, the system generates data from these virtual sensors:

1. **Temperature Sensor** (Delhi) - Monitors building/room temperature
2. **Rainfall Sensor** (Mumbai) - Monitors precipitation levels
3. **Seismic Sensor** (Chennai) - Monitors earthquake activity
4. **Smoke Sensor** (Kolkata) - Monitors fire/smoke detection
5. **Flood Sensor** (Bangalore) - Monitors water levels
6. **Air Quality Sensor** (Delhi) - Monitors PM2.5 levels

## 📧 Email Notifications

### Alert Email Format

When an alert is triggered, recipients receive emails with:

- **Alert Severity**: Color-coded severity indicator
- **Sensor Information**: ID, type, current value, threshold
- **Location Details**: Address and coordinates
- **Timestamp**: When the alert occurred
- **Action Required**: Instructions for response

### Email Configuration

For Gmail SMTP:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `EMAIL_PASS`
4. Keep `EMAIL_USER` as your Gmail address

## 🧪 Testing the System

### 1. Start the Server
```bash
npm run server
```

### 2. Monitor Logs
The system logs all activities including:
- Sample data generation
- Alert detection
- Email sending attempts
- API requests

### 3. Test API Endpoints
```bash
# Get current alerts
curl http://localhost:3001/api/alerts

# Get alert statistics
curl http://localhost:3001/api/alerts/stats

# Send test email
curl -X POST http://localhost:3001/api/test-alert-email
```

### 4. View Sample Data
```bash
# Get recent sensor readings
curl "http://localhost:3001/api/sensor-data?limit=10"
```

## 🔄 System Flow

1. **Data Ingestion**: Sample data generated every 30 seconds (or MQTT messages)
2. **Threshold Check**: Values compared against predefined thresholds
3. **Alert Creation**: Alert records created in database when thresholds exceeded
4. **Email Notification**: Automated emails sent to configured recipients
5. **Hotspot Creation**: Critical/High alerts create disaster hotspots
6. **Stats Update**: Dashboard statistics updated in real-time
7. **WebSocket Broadcast**: Real-time updates sent to connected clients

## 🚀 Production Deployment

### Email Setup
1. Use a professional SMTP service (SendGrid, Mailgun, AWS SES)
2. Configure proper SSL certificates
3. Set up email templates
4. Add email delivery monitoring

### Alert Escalation
- Implement alert escalation for unacknowledged critical alerts
- Add SMS notifications for critical alerts
- Integrate with external alert systems

### Monitoring
- Set up monitoring for email delivery rates
- Add alert acknowledgment deadlines
- Create alert response time tracking

## 🛠 Troubleshooting

### Email Not Sending
- Check SMTP credentials
- Verify firewall settings
- Check email provider limits
- Review server logs for SMTP errors

### No Alerts Triggered
- Verify sample data is enabled (`USE_SAMPLE_DATA=true`)
- Check threshold values
- Monitor server logs for data processing

### Database Issues
- Ensure MongoDB is running
- Check connection string
- Verify database permissions

## 📈 Next Steps

1. **Real MQTT Integration**: Replace sample data with actual sensor connections
2. **Advanced Alert Rules**: Custom threshold configuration per sensor
3. **Alert Escalation**: Automatic escalation for unacknowledged alerts
4. **Mobile Notifications**: Push notifications for critical alerts
5. **Alert Analytics**: Historical analysis and trend detection
6. **Multi-channel Notifications**: SMS, Slack, webhook integrations

---

**LifeLine360 Alert System** - Keeping communities safe through intelligent monitoring and rapid response.