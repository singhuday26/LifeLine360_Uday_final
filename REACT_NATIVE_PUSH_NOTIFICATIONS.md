# LifeLine360 Mobile App - Push Notifications Integration

## Overview
This guide shows how to integrate push notifications into your React Native mobile app for the LifeLine360 disaster management platform.

## Prerequisites
- React Native app with Expo
- User authentication already implemented
- Access to LifeLine360 backend API

## Installation
```bash
npx expo install expo-notifications expo-device
```

## Implementation

### 1. Push Notification Permissions & Token Registration

```javascript
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useAuth } from '../contexts/AuthContext'; // Your auth context

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const PushNotificationManager = () => {
  const { user, isAuthenticated } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState('');

  // Register for push notifications
  const registerForPushNotificationsAsync = async () => {
    try {
      // Check if device supports push notifications
      if (!Device.isDevice) {
        alert('Must use physical device for Push Notifications');
        return;
      }

      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      // If permissions denied, return
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }

      // Get the token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-expo-project-id', // Replace with your Expo project ID
      });

      console.log('Expo Push Token:', token.data);
      setExpoPushToken(token.data);

      // Send token to backend if user is authenticated
      if (isAuthenticated && user) {
        await sendPushTokenToBackend(token.data);
      }

      return token.data;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  };

  // Send push token to LifeLine360 backend
  const sendPushTokenToBackend = async (pushToken) => {
    try {
      const apiUrl = 'http://your-backend-url:3001'; // Replace with your backend URL

      const response = await fetch(`${apiUrl}/api/auth/me/push-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // Or however you store the token
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pushToken: pushToken,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Push token registered successfully');
      } else {
        console.error('Failed to register push token:', data.message);
      }
    } catch (error) {
      console.error('Error sending push token to backend:', error);
    }
  };

  // Register when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      registerForPushNotificationsAsync();
    }
  }, [isAuthenticated, user]);

  // Handle notification received while app is foregrounded
  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      // Handle foreground notification (optional)
    });

    // Handle notification response (when user taps notification)
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      // Navigate to relevant screen based on notification type
      const notificationType = response.notification.request.content.data?.type;

      if (notificationType === 'emergency_alert') {
        // Navigate to alerts screen or emergency dashboard
        // navigation.navigate('Alerts');
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  // Optional: Test notification (for development)
  const sendTestNotification = async () => {
    if (!expoPushToken) {
      alert('No push token available');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test Notification',
        body: 'This is a test push notification!',
        data: { type: 'test' },
      },
      trigger: null, // Send immediately
    });
  };

  return null; // This component doesn't render anything
};

export default PushNotificationManager;
```

### 2. Integration with Auth Context

Update your AuthContext to handle push token registration:

```javascript
// In your AuthContext.jsx
export const AuthProvider = ({ children }) => {
  // ... existing state and functions ...

  // Register push token after successful login
  const login = async (email, password) => {
    try {
      const result = await loginAPI(email, password);

      if (result.success) {
        setUser(result.data.user);
        setToken(result.data.token);

        // Store in localStorage
        localStorage.setItem('authToken', result.data.token);
        localStorage.setItem('authUser', JSON.stringify(result.data.user));

        // Register push notifications for this user
        if (result.data.user.role !== 'public') {
          // Only register for admin users
          await registerPushNotifications();
        }

        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  // Function to register push notifications
  const registerPushNotifications = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();

      if (status === 'granted') {
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: 'your-expo-project-id',
        });

        // Send to backend
        await fetch(`${apiUrl}/api/auth/me/push-token`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pushToken: token.data }),
        });
      }
    } catch (error) {
      console.error('Push notification registration failed:', error);
    }
  };

  // ... rest of context ...
};
```

### 3. App.js Integration

```javascript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './contexts/AuthContext';
import PushNotificationManager from './components/PushNotificationManager';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <PushNotificationManager />
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
```

### 4. Notification Categories (Optional)

For iOS, you can define notification categories:

```javascript
// In your App.js or main component
useEffect(() => {
  // Define notification categories for iOS
  Notifications.setNotificationCategoryAsync('emergency', [
    {
      identifier: 'respond',
      buttonTitle: 'Respond',
      options: {
        opensAppToForeground: true,
      },
    },
    {
      identifier: 'dismiss',
      buttonTitle: 'Dismiss',
      options: {
        opensAppToForeground: false,
      },
    },
  ]);
}, []);
```

## Backend Configuration

Make sure your backend has the push notification endpoint:

```javascript
// routes/auth.js
router.post('/me/push-token', protect, async (req, res) => {
  try {
    const { pushToken } = req.body;

    if (!pushToken) {
      return res.status(400).json({
        success: false,
        message: 'Push token is required'
      });
    }

    // Update the user's push token
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { pushToken },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Push token updated successfully',
      data: { user: user.toJSON() }
    });
  } catch (error) {
    console.error('Push token update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating push token'
    });
  }
});
```

## Testing

1. **Test Permissions**: Ensure the app requests notification permissions
2. **Test Token Registration**: Check that tokens are sent to your backend
3. **Test Notifications**: Use the backend's test endpoints to send notifications
4. **Test Background**: Close the app and test background notifications

## Production Considerations

1. **Expo Project ID**: Set your actual Expo project ID
2. **Backend URL**: Use production backend URL
3. **Error Handling**: Implement proper error handling for failed notifications
4. **Token Refresh**: Handle token expiration and refresh
5. **Privacy**: Only register push tokens for authenticated users

## Troubleshooting

- **No notifications on iOS**: Check notification permissions and capabilities
- **No notifications on Android**: Ensure FCM is configured in Expo
- **Tokens not registering**: Check network connectivity and backend logs
- **Notifications not showing**: Verify app is not in foreground (foreground notifications are silent by default)