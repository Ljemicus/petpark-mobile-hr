import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../lib/auth-context';
import { ShopCartProvider } from '../lib/shop-context';
import { Colors } from '../lib/colors';
import OnboardingGate from '../components/OnboardingGate';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <ShopCartProvider>
            <OnboardingGate>
              <StatusBar style="dark" />
              <Stack
                screenOptions={{
                  headerStyle: { backgroundColor: Colors.white },
                  headerTintColor: Colors.text,
                  headerTitleStyle: { fontWeight: '700' },
                  contentStyle: { backgroundColor: Colors.background },
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="shop" options={{ headerShown: false }} />
                <Stack.Screen name="sitter/[id]" options={{ title: 'Profil sittera' }} />
                <Stack.Screen name="topic/[id]" options={{ title: 'Tema' }} />
                <Stack.Screen name="messages" options={{ title: 'Poruke' }} />
                <Stack.Screen name="notifications" options={{ headerShown: false }} />
                <Stack.Screen name="chat" options={{ headerShown: false }} />
                <Stack.Screen name="booking" options={{ headerShown: false }} />
                <Stack.Screen name="booking-requests" options={{ headerShown: false }} />
                <Stack.Screen name="booking-requests/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="payments" options={{ headerShown: false }} />
                <Stack.Screen name="pet-passport" options={{ headerShown: false }} />
                <Stack.Screen name="lost-pets" options={{ title: 'Izgubljeni ljubimci' }} />
                <Stack.Screen name="privacy" options={{ title: 'Politika privatnosti' }} />
                <Stack.Screen name="terms" options={{ title: 'Uvjeti korištenja' }} />
                <Stack.Screen name="login" options={{ title: 'Prijava', presentation: 'modal' }} />
                <Stack.Screen name="register" options={{ title: 'Registracija', presentation: 'modal' }} />
                <Stack.Screen name="onboarding" options={{ title: 'Onboarding', headerShown: false }} />
                <Stack.Screen name="admin/verification" options={{ title: 'Verifikacija sittera' }} />
                <Stack.Screen name="dashboard/owner" options={{ headerShown: false }} />
                <Stack.Screen name="dashboard/owner/requests" options={{ headerShown: false }} />
                <Stack.Screen name="dashboard/sitter" options={{ headerShown: false }} />
                <Stack.Screen name="dashboard/sitter/requests" options={{ headerShown: false }} />
                <Stack.Screen name="dashboard/groomer" options={{ headerShown: false }} />
                <Stack.Screen name="dashboard/breeder" options={{ headerShown: false }} />
                <Stack.Screen name="dashboard/trainer" options={{ headerShown: false }} />
                <Stack.Screen name="dashboard/rescue" options={{ headerShown: false }} />
                <Stack.Screen name="walk" options={{ title: 'Šetnje' }} />
                <Stack.Screen name="walk/active" options={{ title: 'Aktivna šetnja' }} />
                <Stack.Screen name="walk/[id]" options={{ title: 'Detalji šetnje' }} />
              </Stack>
            </OnboardingGate>
          </ShopCartProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
