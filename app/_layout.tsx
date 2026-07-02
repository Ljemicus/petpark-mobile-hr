import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../lib/auth-context';
import { ShopCartProvider } from '../lib/shop-context';
import { Colors } from '../lib/colors';
import { withSentry } from '../lib/sentry';
import OnboardingGate from '../components/OnboardingGate';
import PetParkLogo from '../components/PetParkLogo';

function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <ShopCartProvider>
            <OnboardingGate>
              <StatusBar style="dark" />
              <Stack
                screenOptions={{
                  headerStyle: { backgroundColor: Colors.creamSurface },
                  headerTintColor: Colors.text,
                  headerTitleStyle: { fontWeight: '700' },
                  headerTitle: () => <PetParkLogo width={124} />,
                  headerTitleAlign: 'center',
                  contentStyle: { backgroundColor: Colors.background },
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="shop/index" options={{ headerShown: false }} />
                <Stack.Screen name="shop/[slug]" options={{ title: 'Detalji proizvoda' }} />
                <Stack.Screen name="shop/basket" options={{ title: 'Košarica' }} />
                <Stack.Screen name="sitter/[id]" options={{ title: 'Profil sittera' }} />
                <Stack.Screen name="topic/[id]" options={{ title: 'Tema' }} />
                <Stack.Screen name="messages" options={{ title: 'Poruke' }} />
                <Stack.Screen name="notifications" options={{ title: 'Obavijesti' }} />
                <Stack.Screen name="chat" options={{ headerShown: false }} />
                <Stack.Screen name="booking" options={{ headerShown: false }} />
                <Stack.Screen name="booking-requests/[id]" options={{ title: 'Detalji upita' }} />
                <Stack.Screen name="payments/wallet" options={{ title: 'Novčanik' }} />
                <Stack.Screen name="payments/checkout" options={{ title: 'Plaćanje' }} />
                <Stack.Screen name="payments/history" options={{ title: 'Povijest plaćanja' }} />
                <Stack.Screen name="payments/methods" options={{ title: 'Načini plaćanja' }} />
                <Stack.Screen name="payments/success" options={{ title: 'Plaćanje uspješno' }} />
                <Stack.Screen name="payments/cancel" options={{ title: 'Plaćanje otkazano' }} />
                <Stack.Screen name="payments/receipt/[id]" options={{ title: 'Račun' }} />
                <Stack.Screen name="pet-passport" options={{ headerShown: false }} />
                <Stack.Screen name="lost-pets" options={{ title: 'Izgubljeni ljubimci' }} />
                <Stack.Screen name="privacy" options={{ title: 'Politika privatnosti' }} />
                <Stack.Screen name="terms" options={{ title: 'Uvjeti korištenja' }} />
                <Stack.Screen name="login" options={{ title: 'Prijava', presentation: 'modal' }} />
                <Stack.Screen name="register" options={{ title: 'Registracija', presentation: 'modal' }} />
                <Stack.Screen name="onboarding" options={{ title: 'Onboarding', headerShown: false }} />
                <Stack.Screen name="admin/verification" options={{ title: 'Verifikacija sittera' }} />
                <Stack.Screen name="dashboard/owner" options={{ headerShown: false }} />
                <Stack.Screen name="dashboard/sitter" options={{ headerShown: false }} />
                <Stack.Screen name="dashboard/groomer" options={{ headerShown: false }} />
                <Stack.Screen name="dashboard/breeder" options={{ headerShown: false }} />
                <Stack.Screen name="dashboard/trainer" options={{ headerShown: false }} />
                <Stack.Screen name="dashboard/rescue" options={{ headerShown: false }} />
                <Stack.Screen name="walk/index" options={{ title: 'Šetnje' }} />
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

export default withSentry(RootLayout);
