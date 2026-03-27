import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { CartProvider } from '../lib/cart-context';
import { AuthProvider } from '../lib/auth-context';
import { Colors } from '../lib/colors';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
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
            <Stack.Screen name="sitter/[id]" options={{ title: 'Profil sittera' }} />
            <Stack.Screen name="product/[id]" options={{ title: 'Proizvod' }} />
            <Stack.Screen name="topic/[id]" options={{ title: 'Tema' }} />
            <Stack.Screen name="cart" options={{ title: 'Košarica', presentation: 'modal' }} />
            <Stack.Screen name="messages" options={{ title: 'Poruke' }} />
            <Stack.Screen name="lost-pets" options={{ title: 'Izgubljeni ljubimci' }} />
            <Stack.Screen name="privacy" options={{ title: 'Politika privatnosti' }} />
            <Stack.Screen name="terms" options={{ title: 'Uvjeti korištenja' }} />
            <Stack.Screen name="login" options={{ title: 'Prijava', presentation: 'modal' }} />
            <Stack.Screen name="register" options={{ title: 'Registracija', presentation: 'modal' }} />
          </Stack>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
